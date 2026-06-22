export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let event = req.body;
    if (typeof event === 'string') event = JSON.parse(event);

    console.log('Webhook FedaPay reçu:', event.name);
    console.log('Entity complète:', JSON.stringify(event.entity || {}));

    const eventName = event.name || '';
    const entity = event.entity || {};

    if (eventName === 'transaction.approved' || entity.status === 'approved') {
      const description = entity.description || '';
      const amount = entity.amount || 0;

      const customerEmail = entity.customer?.email
        || entity.custom_metadata?.email
        || entity.metadata?.paid_customer?.email
        || entity.metadata?.email;

      const premiumClasse = entity.custom_metadata?.premium_classe
        || entity.metadata?.premium_classe
        || null;

      console.log('Email:', customerEmail, '| Desc:', description, '| Amount:', amount, '| Classe:', premiumClasse);

      if (!customerEmail) {
        console.log('⚠️ Email non trouvé — entity.customer:', JSON.stringify(entity.customer));
        return res.status(200).json({ received: true });
      }

      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
      const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      };

      if (description.toLowerCase().includes('premium')) {
        const expireAt = new Date();
        expireAt.setMonth(expireAt.getMonth() + 1);

        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(customerEmail)}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              plan: 'premium',
              premium_expire_at: expireAt.toISOString(),
              premium_classe: premiumClasse
            })
          }
        );
        const responseText = await r.text();
        console.log('Premium activé - Supabase status:', r.status, '| Classe:', premiumClasse, '| Response:', responseText);

        // Enregistrer la transaction
        await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email: customerEmail,
            type: 'premium',
            montant: amount,
            credits_ajoutes: 0
          })
        });

      } else {
        let creditsToAdd = 0;
        if (amount >= 200) creditsToAdd = 12;
        else if (amount >= 100) creditsToAdd = 5;

        if (creditsToAdd > 0) {
          const getResp = await fetch(
            `${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(customerEmail)}&select=credits`,
            { headers }
          );
          const profiles = await getResp.json();
          const currentCredits = profiles[0]?.credits || 0;

          const r = await fetch(
            `${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(customerEmail)}`,
            {
              method: 'PATCH',
              headers,
              body: JSON.stringify({ credits: currentCredits + creditsToAdd })
            }
          );
          const responseText = await r.text();
          console.log(`${creditsToAdd} crédits ajoutés - Supabase status:`, r.status, '| Response:', responseText);

          // Enregistrer la transaction
          await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              email: customerEmail,
              type: 'credits',
              montant: amount,
              credits_ajoutes: creditsToAdd
            })
          });
        }
      }
    }

    res.status(200).json({ received: true });
  } catch(e) {
    console.error('Webhook error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
