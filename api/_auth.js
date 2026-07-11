// api/_auth.js
// Vérifie le token Supabase envoyé par le client et retourne l'utilisateur authentifié.

export async function getAuthenticatedUser(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!resp.ok) return null;
    const user = await resp.json();
    if (!user || !user.email) return null;
    return { id: user.id, email: user.email };
  } catch (e) {
    console.error('Auth verification error:', e.message);
    return null;
  }
        }
                  
