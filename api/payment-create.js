// api/payment/create.js
// Crée une commande "pending" côté serveur, puis initie la transaction FedaPay
// avec le montant déterminé EXCLUSIVEMENT par le catalogue serveur (offers.js).
// Le client n'envoie jamais amount/credits/duration.

const { getOffer } = require('./_offers');
const { getAuthenticatedUser } = require('./_auth');
const { checkRateLimit } = require('./_rateLimit');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée.' });
  }

  // 1) Authentification obligatoire — l'utilisateur vient UNIQUEMENT de la session,
  // jamais d'un champ envoyé par le client.
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Connecte-toi pour continuer.' });
  }

  // 2) Limitation de fréquence : 5 créations de paiement par utilisateur / 10 min
  const rl = await checkRateLimit(`payment_create_${user.id}`, 5, 600);
  if (!rl.allowed) {
    return res.status(429).json({ success: false, message: 'Trop de tentatives. Réessaie dans quelques minutes.' });
  }

  // 3) Validation stricte de l'offre — liste blanche uniquement
  const { offerId, phone } = req.body || {};
  if (typeof offerId !== 'string') {
    return res.status(400).json({ success: false, message: 'Offre invalide.' });
  }
  const offer = getOffer(offerId);
  if (!offer) {
    return res.status(400).json({ success: false, message: 'Cette offre n\'existe pas ou n\'est plus disponible.' });
  }

  // 4) Validation et normalisation du numéro Mobile Money (deuxième validation, pas seulement HTML)
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (cleanPhone.length < 8 || cleanPhone.length > 12) {
    return res.status(400).json({ success: false, message: 'Numéro Mobile Money invalide.' });
  }
  const maskedPhone = cleanPhone.slice(0, 2) + '******' + cleanPhone.slice(-2);

  // 5) Toute valeur supplémentaire envoyée par le client (amount, credits, etc.) est simplement ignorée :
  // on ne lit JAMAIS ces champs depuis req.body au-delà de offerId et phone.

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
  const supaHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  try {
    // 6) Empêcher les doublons dus aux doubles clics : si une commande pending
    // identique existe déjà pour cet utilisateur/offre depuis moins de 2 minutes, on la réutilise.
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const existingResp = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?user_id=eq.${user.id}&offer_id=eq.${offerId}&status=eq.pending&created_at=gte.${twoMinAgo}&select=*&order=created_at.desc&limit=1`,
      { headers: supaHeaders }
    );
    const existingOrders = await existingResp.json();
    if (Array.isArray(existingOrders) && existingOrders.length > 0) {
      const existing = existingOrders[0];
      return res.status(200).json({
        success: true,
        orderReference: existing.reference,
        paymentUrl: existing.payment_url || null,
        reused: true
      });
    }

    // 7) Générer une référence interne unique et imprévisible
    const reference = 'EA-' + crypto.randomBytes(16).toString('hex');

    // 8) Créer la commande AVANT de contacter FedaPay, avec le statut `pending`
    const orderPayload = {
      reference,
      user_id: user.id,
      user_email: user.email,
      offer_id: offerId,
      type: offer.type,
      amount: offer.amount,
      currency: offer.currency,
      credits: offer.credits || 0,
      duration_days: offer.durationDays || null,
      phone_masked: maskedPhone,
      gateway: 'fedapay',
      status: 'pending'
    };

    const createOrderResp = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...supaHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify(orderPayload)
    });

    if (!createOrderResp.ok) {
      const errText = await createOrderResp.text();
      console.error('Erreur création commande:', errText);
      return res.status(500).json({ success: false, message: 'Impossible de créer la commande.' });
    }
    const [order] = await createOrderResp.json();

    // 9) Contacter FedaPay avec le montant enregistré côté serveur UNIQUEMENT
    const fedapayResp = await fetch('https://api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`
      },
      body: JSON.stringify({
        description: `EduAya, ${offer.label}`,
        amount: offer.amount,
        currency: { iso: offer.currency },
        customer: {
          email: user.email,
          phone_number: { number: cleanPhone, country: 'BJ' }
        },
        custom_metadata: {
          order_reference: reference,
          email: user.email,
          premium_classe: offer.type === 'premium' ? (req.body.userClass || null) : null
        }
      })
    });
    const fedapayData = await fedapayResp.json();
    const transaction = fedapayData['v1/transaction'] || fedapayData.transaction || fedapayData;

    if (!transaction || !transaction.id) {
      // On marque la commande comme échouée à l'initiation
      await fetch(`${SUPABASE_URL}/rest/v1/orders?reference=eq.${reference}`, {
        method: 'PATCH',
        headers: supaHeaders,
        body: JSON.stringify({ status: 'failed' })
      });
      console.error('Erreur FedaPay:', JSON.stringify(fedapayData));
      return res.status(502).json({ success: false, message: 'Impossible de contacter le service de paiement.' });
    }

    // 10) Récupérer l'URL de paiement (token) et l'enregistrer sur la commande
    let paymentUrl = transaction.payment_url || null;
    try {
      const tokenResp = await fetch(`https://api.fedapay.com/v1/transactions/${transaction.id}/token`, {
        headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}` }
      });
      const tokenData = await tokenResp.json();
      paymentUrl = tokenData.url || paymentUrl;
    } catch (e) {
      console.error('Erreur récupération token de paiement:', e.message);
    }

    await fetch(`${SUPABASE_URL}/rest/v1/orders?reference=eq.${reference}`, {
      method: 'PATCH',
      headers: supaHeaders,
      body: JSON.stringify({
        gateway_reference: String(transaction.id),
        payment_url: paymentUrl
      })
    });

    return res.status(200).json({
      success: true,
      orderReference: reference,
      paymentUrl
    });

  } catch (e) {
    console.error('Erreur création paiement:', e.message);
    return res.status(500).json({ success: false, message: 'Une erreur est survenue. Réessaie.' });
  }
};
      
