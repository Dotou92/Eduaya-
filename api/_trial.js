// api/_trial.js
// Source de vérité côté serveur pour le modèle freemium : essai gratuit de
// 3 jours à partir de l'inscription, puis Premium actif ou crédits requis.

const DUREE_ESSAI_JOURS = 3;

function supaHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: process.env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
  };
}

// Retourne le statut d'accès d'un utilisateur aux fonctionnalités payantes
// (chat IA, exercices, quiz, révision, etc.).
export async function getAccessStatus(email) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(email)}&select=plan,premium_expire_at,credits,created_at,suspendu`,
    { headers: supaHeaders() }
  );
  const rows = await resp.json();
  const profil = Array.isArray(rows) ? rows[0] : null;

  if (!profil) {
    return { allowed: false, reason: 'profile_not_found' };
  }
  if (profil.suspendu) {
    return { allowed: false, reason: 'suspended' };
  }

  const now = Date.now();
  const isPremium = profil.plan === 'premium'
    && !!profil.premium_expire_at
    && new Date(profil.premium_expire_at).getTime() > now;

  const createdAtMs = profil.created_at ? new Date(profil.created_at).getTime() : now;
  const joursEcoules = (now - createdAtMs) / (1000 * 60 * 60 * 24);
  const inTrial = joursEcoules <= DUREE_ESSAI_JOURS;
  const joursRestants = Math.max(0, Math.ceil(DUREE_ESSAI_JOURS - joursEcoules));
  const credits = Number(profil.credits) || 0;

  if (isPremium) {
    return { allowed: true, reason: 'premium', isPremium: true, inTrial, joursRestants, credits };
  }
  if (inTrial) {
    // Pendant l'essai, le fonctionnement actuel (quotas journaliers) est conservé.
    return { allowed: true, reason: 'trial', isPremium: false, inTrial: true, joursRestants, credits };
  }
  if (credits > 0) {
    return { allowed: true, reason: 'credits', isPremium: false, inTrial: false, joursRestants: 0, credits, useCredit: true };
  }
  return { allowed: false, reason: 'trial_expired', isPremium: false, inTrial: false, joursRestants: 0, credits };
}

// Décrémente un crédit de manière atomique-safe (lecture puis écriture immédiate).
// Retourne false si l'utilisateur n'avait déjà plus de crédit (course condition rare).
export async function consumeCredit(email) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const headers = supaHeaders();
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(email)}&select=credits`,
    { headers }
  );
  const rows = await resp.json();
  const current = Number(rows && rows[0] && rows[0].credits) || 0;
  if (current <= 0) return false;

  await fetch(`${SUPABASE_URL}/rest/v1/profils?email=eq.${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ credits: current - 1 })
  });
  return true;
}
