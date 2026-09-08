/* Creates and finalizes a Stripe invoice for a single client, server-side.
   Keeps the Stripe secret key out of the static site entirely -- this
   function is the only thing that ever touches it.
   Cloudflare Pages Functions port of netlify/functions/create-invoice.js. */

const { json } = require('./_lib/store');
const { toEvent } = require('./_lib/http');

const STRIPE_API = 'https://api.stripe.com/v1';

async function stripePost(path, params, key) {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(STRIPE_API + path, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data.error && data.error.message) || 'Stripe request failed');
  return data;
}

async function stripeGet(path, key) {
  const res = await fetch(STRIPE_API + path, { headers: { Authorization: 'Bearer ' + key } });
  const data = await res.json();
  if (!res.ok) throw new Error((data.error && data.error.message) || 'Stripe request failed');
  return data;
}

export async function onRequest(context) {
  const { request, env } = context;
  const event = await toEvent(request);

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const key = env.STRIPE_SECRET_KEY;
  if (!key) {
    return json(500, { error: 'Stripe is not configured on the server.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'Bad request body' });
  }

  // Independent server-side gate check -- this endpoint isn't protected by
  // the page's client-side passphrase prompt alone.
  const expectedHash = env.INVOICE_PASSPHRASE_HASH;
  if (expectedHash && payload.passphraseHash !== expectedHash) {
    return json(401, { error: 'Not authorized.' });
  }

  const { name, email, daysUntilDue } = payload;
  const items = Array.isArray(payload.items) ? payload.items : [];

  const lineItems = items.map((it) => {
    const cents = Math.round(Number(it.amount) * 100);
    const type = (it.type || '').trim();
    const desc = (it.description || '').trim();
    return {
      cents,
      description: type && desc ? `${type} — ${desc}` : (desc || type),
    };
  });

  const totalCents = lineItems.reduce((sum, li) => sum + (li.cents || 0), 0);
  const allValid = lineItems.length > 0 && lineItems.every((li) => isFinite(li.cents) && li.cents > 0 && li.description);

  if (!name || !email || !allValid) {
    return json(400, { error: 'Missing or invalid invoice details.' });
  }

  try {
    // find or create the customer by email
    const search = await stripeGet('/customers/search?query=' + encodeURIComponent(`email:'${email}'`), key);
    let customerId;
    if (search.data && search.data.length) {
      customerId = search.data[0].id;
    } else {
      const customer = await stripePost('/customers', { name, email }, key);
      customerId = customer.id;
    }

    // attach one pending line item per item, then create + finalize the invoice
    for (const li of lineItems) {
      await stripePost('/invoiceitems', {
        customer: customerId, currency: 'usd', amount: String(li.cents), description: li.description,
      }, key);
    }

    const invoice = await stripePost('/invoices', {
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: String(daysUntilDue || 7),
      // without this, Stripe does not reliably auto-attach the pending
      // invoiceitems just created above, producing a $0.00 invoice.
      pending_invoice_items_behavior: 'include',
      // explicit card rail so Apple Pay (a wallet riding on top of card) is
      // never excluded by some narrower account-level default.
      'payment_settings[payment_method_types][0]': 'card',
    }, key);

    const finalized = await stripePost(`/invoices/${invoice.id}/finalize`, {}, key);

    return json(200, {
      url: finalized.hosted_invoice_url,
      pdf: finalized.invoice_pdf,
      number: finalized.number,
      amount: totalCents,
    });
  } catch (err) {
    return json(500, { error: err.message });
  }
};
