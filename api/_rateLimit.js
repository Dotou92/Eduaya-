// api/_rateLimit.js
// Limitation de fréquence simple, basée sur Supabase (pas de Redis dans cette stack).

export async function checkRateLimit(key, maxCount, windowSeconds) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  try {
    const getResp = await fetch(
      `${SUPABASE_URL}/rest/v1/rate_limits?key=eq.${encodeURIComponent(key)}&select=*`,
      { headers }
    );
    const rows = await getResp.json();
    const now = Date.now();
    const row = rows && rows[0];

    if (!row) {
      await fetch(`${SUPABASE_URL}/rest/v1/rate_limits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ key, count: 1, window_start: new Date(now).toISOString() })
      });
      return { allowed: true };
    }

    const windowStart = new Date(row.window_start).getTime();
    const windowExpired = (now - windowStart) > windowSeconds * 1000;

    if (windowExpired) {
      await fetch(`${SUPABASE_URL}/rest/v1/rate_limits?key=eq.${encodeURIComponent(key)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ count: 1, window_start: new Date(now).toISOString() })
      });
      return { allowed: true };
    }

    if (row.count >= maxCount) {
      return { allowed: false, retryAfterSeconds: Math.ceil((windowStart + windowSeconds * 1000 - now) / 1000) };
    }

    await fetch(`${SUPABASE_URL}/rest/v1/rate_limits?key=eq.${encodeURIComponent(key)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ count: row.count + 1 })
    });
    return { allowed: true };
  } catch (e) {
    console.error('Rate limit check failed, on laisse passer par précaution:', e.message);
    return { allowed: true };
  }
      }
