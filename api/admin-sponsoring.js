// api/admin-sponsoring.js
// Récupère le total des dons FedaPay (page de paiement libre) pour le tableau de bord admin.
// La clé secrète FedaPay ne doit jamais être exposée côté client : ce endpoint sert de proxy.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée.' });
  }

  const { adminPassword } = req.body || {};

  // Repli sur la valeur codée en dur côté client (admin-7.html) si ADMIN_PWD
  // n'est pas encore configurée comme variable d'environnement sur Vercel.
  const ADMIN_PWD = process.env.ADMIN_PWD || 'sidosais1992@';
  if (adminPassword !== ADMIN_PWD) {
    return res.status(401).json({ success: false, message: 'Non autorisé.' });
  }

  try {
    const resp = await fetch('https://api.fedapay.com/v1/transactions?filters[page_id]=32089&per_page=100&filters[status]=approved', {
      headers: {
        Authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await resp.json();
    const list = data.v1 || data.transactions || data.data || [];
    let total = 0;
    let count = 0;
    if (Array.isArray(list)) {
      list.forEach(function (t) {
        total += t.amount || t.montant || 0;
        count++;
      });
    }
    return res.status(200).json({ success: true, total, count });
  } catch (e) {
    console.error('Erreur sponsoring:', e.message);
    return res.status(500).json({ success: false, message: 'Impossible de récupérer les données FedaPay.' });
  }
}
