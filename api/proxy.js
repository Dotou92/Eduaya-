// api/proxy.js
// Proxy vers l'API Anthropic — protégé par authentification Supabase et par
// le modèle freemium (essai gratuit 3 jours, puis Premium ou crédits requis).

import { getAuthenticatedUser } from './_auth.js';
import { checkRateLimit } from './_rateLimit.js';
import { getAccessStatus, consumeCredit } from './_trial.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Méthode non autorisée.' });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: true, code: 'unauthenticated', message: 'Connecte-toi pour continuer.' });
  }

  const rl = await checkRateLimit(`proxy_${user.id}`, 30, 60);
  if (!rl.allowed) {
    return res.status(429).json({ error: true, code: 'rate_limited', message: 'Trop de requêtes, réessaie dans un instant.' });
  }

  let status;
  try {
    status = await getAccessStatus(user.email);
  } catch (e) {
    console.error('Erreur vérification accès freemium:', e.message);
    // Panne réseau ponctuelle côté vérification : on laisse passer plutôt que
    // de casser le service pour tout le monde.
    status = { allowed: true };
  }

  if (!status.allowed) {
    if (status.reason === 'suspended') {
      return res.status(403).json({ error: true, code: 'access_blocked', message: 'Ce compte a été suspendu par l\'administration.' });
    }
    return res.status(402).json({
      error: true,
      code: 'trial_expired',
      message: 'Ton essai gratuit de 3 jours est terminé. Passe en Premium ou utilise un crédit pour continuer.',
      joursRestants: 0
    });
  }

  if (status.useCredit) {
    const ok = await consumeCredit(user.email);
    if (!ok) {
      return res.status(402).json({
        error: true,
        code: 'trial_expired',
        message: 'Plus aucun crédit disponible. Passe en Premium ou achète des crédits pour continuer.',
        joursRestants: 0
      });
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: true, message: e.message });
  }
}
