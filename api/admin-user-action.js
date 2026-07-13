// api/admin-user-action.js
// Actions administrateur sensibles sur un compte élève : suspendre, réactiver, supprimer.
// Nécessite la clé de service Supabase (bypass RLS + suppression du compte Auth),
// donc doit rester exécuté côté serveur uniquement (jamais exposé au client).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée.' });
  }

  const { adminPassword, action, userId } = req.body || {};

  if (!process.env.ADMIN_PWD || adminPassword !== process.env.ADMIN_PWD) {
    return res.status(401).json({ success: false, message: 'Non autorisé.' });
  }
  if (!userId || !['suspend', 'unsuspend', 'delete'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Requête invalide.' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const headers = {
    'Content-Type': 'application/json',
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`
  };

  try {
    if (action === 'suspend' || action === 'unsuspend') {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/profils?id=eq.${userId}`, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ suspendu: action === 'suspend' })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('Erreur maj profil:', errText);
        return res.status(500).json({
          success: false,
          message: 'Impossible de mettre à jour ce compte. Vérifie que la colonne "suspendu" (boolean) existe dans la table profils.'
        });
      }
      return res.status(200).json({ success: true });
    }

    if (action === 'delete') {
      await fetch(`${SUPABASE_URL}/rest/v1/profils?id=eq.${userId}`, {
        method: 'DELETE',
        headers
      });

      const authResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers
      });
      if (!authResp.ok && authResp.status !== 404) {
        const errText = await authResp.text();
        console.error('Erreur suppression auth:', errText);
        return res.status(500).json({
          success: false,
          message: 'Le profil a été supprimé mais le compte de connexion n\'a pas pu être supprimé.'
        });
      }
      return res.status(200).json({ success: true });
    }
  } catch (e) {
    console.error('Erreur admin-user-action:', e.message);
    return res.status(500).json({ success: false, message: 'Une erreur est survenue.' });
  }
}
