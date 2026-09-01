/* Lists invoices straight from Stripe -- Stripe is the source of truth,
   nothing is duplicated into Blobs here. */

const { checkAuth, json } = require('./lib/store');

const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeGet(path, key) {
  const res = await fetch(STRIPE_API + path, { headers: { Authorization: 'Bearer ' + key } });
  const data = await res.json();
  if (!res.ok) throw new Error((data.error && data.error.message) || 'Stripe request failed');
  return data;
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }
  const params = event.queryStringParameters || {};
  if (!checkAuth({ passphraseHash: params.passphraseHash })) {
    return json(401, { error: 'Not authorized.' });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(500, { error: 'Stripe is not configured on the server.' });

  try {
    const data = await stripeGet('/invoices?limit=100&expand[]=data.customer', key);
    const invoices = data.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      total: inv.total,
      currency: inv.currency,
      customerName: inv.customer && inv.customer.name,
      customerEmail: inv.customer && inv.customer.email,
      created: inv.created * 1000,
      dueDate: inv.due_date ? inv.due_date * 1000 : null,
      hostedUrl: inv.hosted_invoice_url,
      pdf: inv.invoice_pdf,
    }));
    return json(200, { invoices });
  } catch (err) {
    return json(500, { error: err.message });
  }
};
