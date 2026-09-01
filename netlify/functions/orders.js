/* Order status tracking, keyed by Stripe invoice id.
   Statuses: processing -> shipped -> arrived -> ready_for_pickup
   Authed GET (list/single), authed POST (create/update status). */

const { store, checkAuth, json } = require('./lib/store');
const { sendOrderStatusEmail } = require('./lib/email');

const STORE_NAME = 'orders';
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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {});

  if (event.httpMethod === 'GET') {
    const q = event.queryStringParameters || {};
    if (!checkAuth({ passphraseHash: q.passphraseHash })) return json(401, { error: 'unauthorized' });

    const s = store(STORE_NAME);
    const { blobs } = await s.list();
    const records = await Promise.all(blobs.map((b) => s.get(b.key, { type: 'json' })));
    const orders = records.filter(Boolean).map((o) => ({ ...o, statusLabel: STATUS_LABEL[o.status], message: messageFor(o) }));
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
    if (!checkAuth(body)) return json(401, { error: 'unauthorized' });

    const { invoiceId, clientName, clientEmail, item, status, tracking, sendEmail } = body;
    if (!invoiceId) return json(400, { error: 'invoiceId required' });
    if (status && !STATUSES.includes(status)) return json(400, { error: 'invalid status' });

    const s = store(STORE_NAME);
    const existing = (await s.get(invoiceId, { type: 'json' })) || {
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

    await s.setJSON(invoiceId, updated);

    const result = { ...updated, statusLabel: STATUS_LABEL[updated.status], message: messageFor(updated) };

    let emailResult = null;
    if (sendEmail && statusChanged) {
      emailResult = await sendOrderStatusEmail(result);
    }

    return json(200, { order: result, email: emailResult });
  }

  if (event.httpMethod === 'DELETE') {
    const q = event.queryStringParameters || {};
    if (!checkAuth({ passphraseHash: q.passphraseHash })) return json(401, { error: 'unauthorized' });
    if (!q.invoiceId) return json(400, { error: 'invoiceId required' });
    await store(STORE_NAME).delete(q.invoiceId);
    return json(200, { ok: true });
  }

  return json(405, { error: 'method not allowed' });
};
