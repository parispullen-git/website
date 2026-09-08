/* Order status tracking, keyed by Stripe invoice id.
   Statuses: processing -> shipped -> arrived -> ready_for_pickup
   Authed GET (list/single), authed POST (create/update status).
   Cloudflare Pages Functions port of netlify/functions/orders.js -- the
   original called Blobs' store(STORE_NAME).list()/.get()/.setJSON()/
   .delete() directly rather than through the listRecords/getRecord/etc.
   wrappers; those wrappers do the exact same list-then-fetch-each and
   single-key get/put/delete against KV, so this uses them instead of
   re-implementing that against env.PP_DATA a second time. */

const { getRecord, putRecord, deleteRecord, listRecords, checkAuth, json } = require('./_lib/store');
const { sendOrderStatusEmail } = require('./_lib/email');
const { toEvent } = require('./_lib/http');

const COLLECTION = 'orders';
const STATUSES = ['processing', 'shipped', 'arrived', 'ready_for_pickup'];

const STATUS_LABEL = {
  processing: 'Processing',
  shipped: 'Shipped',
  arrived: 'Arrived',
  ready_for_pickup: 'Ready for Pickup',
};

function messageFor(order) {
  const name = (order.clientName || '').split(' ')[0] || 'there';
  const item = order.item || 'your order';
  switch (order.status) {
    case 'processing':
      return `Hi ${name}, this is Paris Pullen Atelier. Your order (${item}) is confirmed and now in processing. We'll let you know as soon as it ships. Thank you for trusting us with this piece.`;
    case 'shipped':
      return `Hi ${name}, great news — your order (${item}) has shipped${order.tracking ? ` (tracking: ${order.tracking})` : ''}. We'll follow up once it arrives.`;
    case 'arrived':
      return `Hi ${name}, your order (${item}) has arrived at our atelier. We're doing a final quality check before it's ready for you.`;
    case 'ready_for_pickup':
      return `Hi ${name}, your order (${item}) is ready for pickup. Reply here or call us to schedule a time — we look forward to seeing you.`;
    default:
      return '';
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const event = await toEvent(request);

  if (event.httpMethod === 'OPTIONS') return json(200, {});

  if (event.httpMethod === 'GET') {
    const q = event.queryStringParameters || {};
    if (!checkAuth(env, { passphraseHash: q.passphraseHash })) return json(401, { error: 'unauthorized' });

    const records = await listRecords(env, COLLECTION);
    const orders = records.map((o) => ({ ...o, statusLabel: STATUS_LABEL[o.status], message: messageFor(o) }));
    // listRecords sorts by createdAt; the original orders.js explicitly
    // re-sorts by updatedAt instead, so a status change bumps an order
    // back to the top -- preserved here rather than left to the shared
    // helper's default.
    orders.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return json(200, { orders, statuses: STATUSES });
  }

  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return json(400, { error: 'invalid json' });
    }
    if (!checkAuth(env, body)) return json(401, { error: 'unauthorized' });

    const { invoiceId, clientName, clientEmail, item, status, tracking, sendEmail } = body;
    if (!invoiceId) return json(400, { error: 'invoiceId required' });
    if (status && !STATUSES.includes(status)) return json(400, { error: 'invalid status' });

    const existing = (await getRecord(env, COLLECTION, invoiceId)) || {
      invoiceId,
      createdAt: Date.now(),
    };

    const statusChanged = status && status !== existing.status;

    const updated = {
      ...existing,
      clientName: clientName ?? existing.clientName ?? '',
      clientEmail: clientEmail ?? existing.clientEmail ?? '',
      item: item ?? existing.item ?? '',
      status: status ?? existing.status ?? 'processing',
      tracking: tracking ?? existing.tracking ?? '',
      updatedAt: Date.now(),
    };

    await putRecord(env, COLLECTION, invoiceId, updated);

    const result = { ...updated, statusLabel: STATUS_LABEL[updated.status], message: messageFor(updated) };

    let emailResult = null;
    if (sendEmail && statusChanged) {
      emailResult = await sendOrderStatusEmail(env, result);
    }

    return json(200, { order: result, email: emailResult });
  }

  if (event.httpMethod === 'DELETE') {
    const q = event.queryStringParameters || {};
    if (!checkAuth(env, { passphraseHash: q.passphraseHash })) return json(401, { error: 'unauthorized' });
    if (!q.invoiceId) return json(400, { error: 'invoiceId required' });
    await deleteRecord(env, COLLECTION, q.invoiceId);
    return json(200, { ok: true });
  }

  return json(405, { error: 'method not allowed' });
};
