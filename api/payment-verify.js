// api/payment-verify.js
// Vérifie une commande précise, appartenant à l'utilisateur connecté, en
// reconfirmant directement auprès de l'API FedaPay.

import { getAuthenticatedUser } from './_auth.js';
import { checkRateLimit } from './_rateLimit.js';

export async function processApprovedOrder(order, supaHeaders, SUPABASE_URL) {
  const lockResp = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?reference=eq.${order.reference}&status=eq.pending`,
    {
      method: 'PATCH',
      headers: { ...supaHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString() })
    }
  );
  const lockedRows = await lockResp.json();
  if (!Array.isArray(lockedRows) || lockedRows.length === 0) {
    return true;
  }

  if (order.type === 'credits') {
    const profResp = await fetch(
      `${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(order.user_email)}&select=credits`,
      { headers: supaHeaders }
    );
    const profiles = await profResp.json();
    const currentCredits = (profiles[0] && profiles[0].credits) || 0;
    await fetch(`${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(order.user_email)}`, {
      method: 'PATCH',
      headers: supaHeaders,
      body: JSON.stringify({ credits: currentCredits + order.credits })
    });
  } else if (order.type === 'premium') {
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + (order.duration_days || 30));
    await fetch(`${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(order.user_email)}`, {
      method: 'PATCH',
      headers: supaHeaders,
      body: JSON.stringify({
        plan: 'premium',
        premium_expire_at: expireAt.toISOString()
      })
    });
  }

  await fetch(`${SUPABASE_URL}/rest/v1/orders?reference=eq.${order.reference}`, {
    method: 'PATCH',
    headers: supaHeaders,
    body: JSON.stringify({ processed_at: new Date().toISOString() })
  });

  await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
    method: 'POST',
    headers: supaHeaders,
    body: JSON.stringify({
      email: order.user_email,
      type: order.type,
      montant: order.amount,
      credits_ajoutes: order.credits || 0
    })
  });

  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée.' });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Connecte-toi pour continuer.' });
  }

  const rl = await checkRateLimit(`payment_verify_${user.id}`, 10, 60);
  if (!rl.allowed) {
    return res.status(429).json({ success: false, message: 'Trop de vérifications. Réessaie dans une minute.' });
  }

  const { orderReference } = req.body || {};
  if (typeof orderReference !== 'string' || !orderReference.startsWith('EA-')) {
    return res.status(400).json({ success: false, message: 'Référence de commande invalide.' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
  const supaHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  try {
    const orderResp = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?reference=eq.${encodeURIComponent(orderReference)}&user_id=eq.${user.id}&select=*`,
      { headers: supaHeaders }
    );
    const orders = await orderResp.json();
    const order = orders && orders[0];

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    if (order.status === 'paid') {
      return res.status(200).json({ success: true, processed: true, message: 'Paiement déjà confirmé.' });
    }

    if (!order.gateway_reference) {
      return res.status(200).json({ success: true, processed: false, message: 'Paiement pas encore initié côté prestataire.' });
    }

    const txResp = await fetch(`https://api.fedapay.com/v1/transactions/${order.gateway_reference}`, {
      headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}` }
    });
    if (!txResp.ok) {
      return res.status(200).json({ success: true, processed: false, message: 'Paiement pas encore confirmé.' });
    }
    const txData = await txResp.json();
    const transaction = txData['v1/transaction'] || txData.transaction || txData;

    const valid =
      transaction &&
      transaction.status === 'approved' &&
      Number(transaction.amount) === Number(order.amount) &&
      String(transaction.id) === String(order.gateway_reference);

    if (!valid) {
      return res.status(200).json({ success: true, processed: false, message: 'Paiement pas encore confirmé.' });
    }

    const processed = await processApprovedOrder(order, supaHeaders, SUPABASE_URL);
    return res.status(200).json({ success: true, processed });

  } catch (e) {
    console.error('Erreur vérification paiement:', e.message);
    return res.status(500).json({ success: false, message: 'Une erreur est survenue.' });
  }
        }
      
