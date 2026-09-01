/* Stripe webhook: on invoice.paid, auto-create/update the order record
   (status -> processing) and fire the "Your Order is Processing" email. */

const crypto = require('crypto');
const { store } = require('./lib/store');
const { sendOrderStatusEmail } = require('./lib/email');

const STORE_NAME = 'orders';

const STATUS_LABEL = {
  processing: 'Processing',
  shipped: 'Shipped',
  arrived: 'Arrived',
  ready_for_pickup: 'Ready for Pickup',
};

function messageFor(order) {
  const name = (order.clientName || '').split(' ')[0] || 'there';
  const item = order.item || 'your order';
  return `Hi ${name}, this is Paris Pullen Atelier. Your order (${item}) is confirmed and now in processing. We'll let you know as soon as it ships. Thank you for trusting us with this piece.`;
}

function verifySignature(rawBody, header, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const [k, v] = kv.split('=');
      return [k, v];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method not allowed' };

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;

  if (secret) {
    const sigHeader = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
    if (!verifySignature(rawBody, sigHeader, secret)) {
      return { statusCode: 400, body: 'invalid signature' };
    }
  }

  let evt;
  try {
    evt = JSON.parse(rawBody);
  } catch (e) {
    return { statusCode: 400, body: 'invalid json' };
  }

  if (evt.type === 'invoice.paid') {
    const invoice = evt.data.object;
    const invoiceId = invoice.id;
    const clientEmail = invoice.customer_email || (invoice.customer_address && invoice.customer_address.email) || '';
    const clientName = invoice.customer_name || '';
    const item =
      (invoice.lines && invoice.lines.data && invoice.lines.data.map((l) => l.description).filter(Boolean).join(', ')) ||
      'your order';

    const s = store(STORE_NAME);
    const existing = (await s.get(invoiceId, { type: 'json' })) || { invoiceId, createdAt: Date.now() };

    if (!existing.status) {
      const updated = {
        ...existing,
        clientName: existing.clientName || clientName,
        clientEmail: existing.clientEmail || clientEmail,
        item: existing.item || item,
        status: 'processing',
        updatedAt: Date.now(),
      };
      await s.setJSON(invoiceId, updated);

      const result = { ...updated, statusLabel: STATUS_LABEL.processing, message: messageFor(updated) };
      await sendOrderStatusEmail(result).catch(() => {});
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
