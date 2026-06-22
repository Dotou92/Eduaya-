export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { amount, description, customer, premiumClasse } = req.body;
    const response = await fetch('https://api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`
      },
      body: JSON.stringify({
        description,
        amount,
        currency: { iso: 'XOF' },
        customer,
        custom_metadata: {
          premium_classe: premiumClasse || null,
          email: customer && customer.email ? customer.email : null
        }
      })
    });
    const data = await response.json();
    // Log pour debug
    console.log('STATUS FedaPay:', response.status);
    console.log('REPONSE FedaPay:', JSON.stringify(data));
    res.status(response.status).json(data);
  } catch(e) {
    console.log('ERREUR payment.js:', e.message);
    res.status(500).json({ error: e.message });
  }
}
