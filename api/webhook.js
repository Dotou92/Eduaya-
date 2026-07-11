// api/webhook.js
// Webhook FedaPay sécurisé : vérifie la signature avant tout traitement,
// reconfirme via l'API FedaPay, traitement idempotent (voir payment-verify.js).

import crypto from 'crypto';
import { processApprovedOrder } from './payment-verify.js';

export const config = { api: { bodyParser: false } };

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function verifySignatureManual(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;
  const parts = {};
  signatureHeader.split(',').forEach(p => {
    const [k, v] = p.split('=');
    if (k && v) parts[k.trim()] = v.trim();
  });
  if (!parts.t || !parts.s) return false;

  const age = Math.abs(Date.now() / 1000 - Number(parts.t));
  if (age > 5 * 60) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${parts.t}.${rawBody}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.s));
  } catch (e) {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const FEDAPAY_WEBHOOK_SECRET = process.env.FEDAPAY_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;
  const supaHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (e) {
    return res.status(400).json({ received: false });
  }

  const sigHeader = req.headers['x-fedapay-signature'];
  if (!FEDAPAY_WEBHOOK_SECRET) {
    console.error('FEDAPAY_WEBHOOK_SECRET manquant côté serveur — webhook rejeté par sécurité.');
    return res.status(500).json({ received: false });
  }
  const signatureValid = verifySignatureManual(rawBody, sigHeader, FEDAPAY_WEBHOOK_SECRET);
  if (!signatureValid) {
    console.error('❌ Signature webhook invalide ou manquante — requête rejetée.');
    return res.status(401).json({ received: false });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return res.status(400).json({ received: false });
  }

  try {
    const eventName = event.name || '';
    let entity = event.entity || {};

    if (!(eventName === 'transaction.approved' || entity.status === 'approved')) {
      return res.status(200).json({ received: true });
    }

    if (entity.id && FEDAPAY_SECRET_KEY) {
      try {
        const txResp = await fetch(`https://api.fedapay.com/v1/transactions/${entity.id}`, {
          headers: { 'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}` }
        });
        if (txResp.ok) {
          const txData = await txResp.json();
          const fullTx = txData['v1/transaction'] || txData.transaction || txData;
          if (fullTx) entity = { ...entity, ...fullTx };
        }
      } catch (fetchErr) {
        console.log('⚠️ Erreur en récupérant la transaction via API:', fetchErr.message);
      }
    }

    if (entity.status !== 'approved') {
      return res.status(200).json({ received: true });
    }

    const orderReference = entity.custom_metadata && entity.custom_metadata.order_reference;
    if (!orderReference) {
      console.log('⚠️ Webhook sans order_reference — transaction ID:', entity.id);
      return res.status(200).json({ received: true });
    }

    const orderResp = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?reference=eq.${encodeURIComponent(orderReference)}&select=*`,
      { headers: supaHeaders }
    );
    const orders = await orderResp.json();
    const order = orders && orders[0];

    if (!order) {
      console.log('⚠️ Commande introuvable pour la référence:', orderReference);
      return res.status(200).json({ received: true });
    }

    const amountMatches = Number(entity.amount) === Number(order.amount);
    const refMatches = String(entity.id) === String(order.gateway_reference);

    if (!amountMatches || !refMatches) {
      console.error('❌ Incohérence montant/référence — commande NON créditée.', {
        orderReference, entityAmount: entity.amount, orderAmount: order.amount
      });
      return res.status(200).json({ received: true });
    }

    if (order.status === 'paid') {
      return res.status(200).json({ received: true });
    }

    await processApprovedOrder(order, supaHeaders, SUPABASE_URL);

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error('Webhook error:', e.message);
    return res.status(500).json({ received: false });
  }
      }
