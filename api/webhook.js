export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const supaHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  try {
    let event = req.body;
    if (typeof event === 'string') event = JSON.parse(event);

    console.log('Webhook FedaPay reçu:', event.name);
    console.log('Entity reçue (webhook):', JSON.stringify(event.entity || {}));

    const eventName = event.name || '';
    let entity = event.entity || {};

    if (!(eventName === 'transaction.approved' || entity.status === 'approved')) {
      return res.status(200).json({ received: true });
    }

    // ─────────────────────────────────────────────────────────────
    // IMPORTANT : on ne se fie JAMAIS uniquement au contenu envoyé par
    // le webhook (FedaPay le déconseille explicitement dans sa doc).
    // Le webhook peut ne contenir qu'un résumé de la transaction (sans
    // l'email du client par exemple). On va donc TOUJOURS re-demander
    // la transaction complète directement à l'API FedaPay avec son ID.
    // C'est très probablement la cause du bug "Aucun paiement trouvé" :
    // l'email du client n'était pas présent dans le webhook reçu.
    // ─────────────────────────────────────────────────────────────
    if (entity.id && FEDAPAY_SECRET_KEY) {
      try {
        const txResp = await fetch(`https://api.fedapay.com/v1/transactions/${entity.id}`, {
          headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}` }
        });
        if (txResp.ok) {
          const txData = await txResp.json();
          const fullTx = txData['v1/transaction'] || txData.transaction || txData;
          if (fullTx) {
            console.log('Transaction complète récupérée via API FedaPay:', JSON.stringify(fullTx));
            entity = { ...entity, ...fullTx };
          }
        } else {
          console.log('⚠️ Impossible de récupérer la transaction complète via API (status ' + txResp.status + ')');
        }
      } catch (fetchErr) {
        console.log('⚠️ Erreur réseau en récupérant la transaction via API:', fetchErr.message);
      }
    }

    const description = entity.description || '';
    const amount = entity.amount || 0;

    let customerEmail = entity.customer?.email
      || entity.custom_metadata?.email
      || entity.metadata?.paid_customer?.email
      || entity.metadata?.email;

    // Filet de sécurité supplémentaire : si on a un customer_id mais toujours
    // pas d'email, on va chercher directement la fiche client via l'API.
    if (!customerEmail && entity.customer_id && FEDAPAY_SECRET_KEY) {
      try {
        const custResp = await fetch(`https://api.fedapay.com/v1/customers/${entity.customer_id}`, {
          headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}` }
        });
        if (custResp.ok) {
          const custData = await custResp.json();
          const cust = custData['v1/customer'] || custData.customer || custData;
          customerEmail = cust?.email || customerEmail;
          console.log('Email récupéré via fiche client API:', customerEmail);
        }
      } catch (custErr) {
        console.log('⚠️ Erreur en récupérant le client via API:', custErr.message);
      }
    }

    const premiumClasse = entity.custom_metadata?.premium_classe
      || entity.metadata?.premium_classe
      || null;

    console.log('Email:', customerEmail, '| Desc:', description, '| Amount:', amount, '| Classe:', premiumClasse);

    if (!customerEmail) {
      // On ne perd jamais la trace d'un paiement : on l'enregistre comme
      // "orpheline" pour que tu puisses créditer l'élève manuellement si besoin.
      console.log('❌ Email introuvable après toutes les tentatives. Transaction ID:', entity.id);
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/transactions_orphelines`, {
          method: 'POST',
          headers: supaHeaders,
          body: JSON.stringify({
            fedapay_transaction_id: entity.id || null,
            montant: amount,
            description,
            raw_entity: entity
          })
        });
      } catch (logErr) {
        console.log('⚠️ Impossible d\'enregistrer la transaction orpheline:', logErr.message);
      }
      return res.status(200).json({ received: true });
    }

    if (description.toLowerCase().includes('premium')) {
      const expireAt = new Date();
      expireAt.setMonth(expireAt.getMonth() + 1);

      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(customerEmail)}`,
        {
          method: 'PATCH',
          headers: supaHeaders,
          body: JSON.stringify({
            plan: 'premium',
            premium_expire_at: expireAt.toISOString(),
            premium_classe: premiumClasse
          })
        }
      );
      const responseText = await r.text();
      console.log('Premium activé - Supabase status:', r.status, '| Classe:', premiumClasse, '| Response:', responseText);

      const txInsert = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
        method: 'POST',
        headers: supaHeaders,
        body: JSON.stringify({
          email: customerEmail,
          type: 'premium',
          montant: amount,
          credits_ajoutes: 0
        })
      });
      const txInsertText = await txInsert.text();
      console.log('Enregistrement transaction (premium) - Supabase status:', txInsert.status, '| Response:', txInsertText);

    } else {
      let creditsToAdd = 0;
      if (amount >= 200) creditsToAdd = 12;
      else if (amount >= 100) creditsToAdd = 5;

      if (creditsToAdd > 0) {
        const getResp = await fetch(
          `${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(customerEmail)}&select=credits`,
          { headers: supaHeaders }
        );
        const profiles = await getResp.json();
        const currentCredits = profiles[0]?.credits || 0;

        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(customerEmail)}`,
          {
            method: 'PATCH',
            headers: supaHeaders,
            body: JSON.stringify({ credits: currentCredits + creditsToAdd })
          }
        );
        const responseText = await r.text();
        console.log(`${creditsToAdd} crédits ajoutés - Supabase status:`, r.status, '| Response:', responseText);

        const txInsert = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
          method: 'POST',
          headers: supaHeaders,
          body: JSON.stringify({
            email: customerEmail,
            type: 'credits',
            montant: amount,
            credits_ajoutes: creditsToAdd
          })
        });
        const txInsertText = await txInsert.text();
        console.log('Enregistrement transaction (crédits) - Supabase status:', txInsert.status, '| Response:', txInsertText);
      }
    }

    res.status(200).json({ received: true });
  } catch(e) {
    console.error('Webhook error:', e.message);
    res.status(500).json({ error: e.message });
  }
              }
          
