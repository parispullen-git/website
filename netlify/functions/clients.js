/* Clients are not their own stored collection -- this rolls one up live
   from whoever shows up on an invoice, a proposal, or an inquiry. */

const { listRecords, checkAuth, json } = require('./lib/store');

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
  const clientsByEmail = {};

  function touch(email, name, when) {
    const e = (email || '').toLowerCase().trim();
    if (!e) return null;
    if (!clientsByEmail[e]) {
      clientsByEmail[e] = {
        email: e, name: name || e, invoices: [], proposals: [], inquiries: [],
        lastActivity: 0, totalInvoiced: 0,
      };
    }
    if (name) clientsByEmail[e].name = name;
    if (when && when > clientsByEmail[e].lastActivity) clientsByEmail[e].lastActivity = when;
    return clientsByEmail[e];
  }

  try {
    if (key) {
      const data = await stripeGet('/invoices?limit=100&expand[]=data.customer', key);
      data.data.forEach((inv) => {
        const email = inv.customer && inv.customer.email;
        const c = touch(email, inv.customer && inv.customer.name, inv.created * 1000);
        if (c) {
          c.invoices.push({ id: inv.id, number: inv.number, status: inv.status, total: inv.total, created: inv.created * 1000 });
          c.totalInvoiced += inv.total || 0;
        }
      });
    }
  } catch (err) {
    // Stripe hiccup shouldn't block proposals/inquiries from showing
  }

  const proposals = await listRecords('proposals');
  proposals.forEach((p) => {
    const c = touch(p.email, p.name, p.createdAt);
    if (c) c.proposals.push({ id: p.id, total: p.total, status: p.status, createdAt: p.createdAt });
  });

  const inquiries = await listRecords('inquiries');
  inquiries.forEach((i) => {
    const c = touch(i.email, i.name, i.createdAt);
    if (c) c.inquiries.push({ id: i.id, itemCount: (i.items || []).length, createdAt: i.createdAt });
  });

  const clients = Object.values(clientsByEmail).sort((a, b) => b.lastActivity - a.lastActivity);
  return json(200, { clients });
};
