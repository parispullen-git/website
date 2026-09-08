/* Stripe webhook: on invoice.paid, auto-create/update the order record
   (status -> processing) and fire the "Your Order is Processing" email.
   Cloudflare Pages Functions port of netlify/functions/stripe-webhook.js.

   verifySignature() is copied over byte-for-byte, unchanged, rather than
   rewritten against Web Crypto -- this is the one place in the whole
   migration where a transcription slip is genuinely dangerous (silently
   accepting a forged webhook, or silently rejecting every real one and
   quietly breaking order confirmations). require('crypto') keeps working
   here because compatibility_flags = ["nodejs_compat"] is set in
   wrangler.toml, which gives Workers a real node:crypto shim -- so the
   exact same HMAC/timingSafeEqual logic Netlify ran is what runs here. */

const crypto = require('crypto');
const { getRecord, putRecord, json } = require('./_lib/store');
const { sendOrderStatusEmail } = require('./_lib/email');

const COLLECTION = 'orders';

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

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const secret = env.STRIPE_WEBHOOK_SECRET;
  // Read as raw text, same as Netlify's event.body was for this endpoint --
  // signature verification needs the exact bytes Stripe signed, before any
  // JSON parsing.
  const rawBody = await request.text();

  if (secret) {
    const sigHeader = request.headers.get('stripe-signature');
    if (!verifySignature(rawBody, sigHeader, secret)) {
      return new Response('invalid signature', { status: 400 });
    }
  }

  let evt;
  try {
    evt = JSON.parse(rawBody);
  } catch (e) {
    return new Response('invalid json', { status: 400 });
  }

  if (evt.type === 'invoice.paid') {
    const invoice = evt.data.object;
    const invoiceId = invoice.id;
    const clientEmail = invoice.customer_email || (invoice.customer_address && invoice.customer_address.email) || '';
    const clientName = invoice.customer_name || '';
    const item =
      (invoice.lines && invoice.lines.data && invoice.lines.data.map((l) => l.description).filter(Boolean).join(', ')) ||
      'your order';

    const existing = (await getRecord(env, COLLECTION, invoiceId)) || { invoiceId, createdAt: Date.now() };

    if (!existing.status) {
      const updated = {
        ...existing,
        clientName: existing.clientName || clientName,
        clientEmail: existing.clientEmail || clientEmail,
        item: existing.item || item,
        status: 'processing',
        updatedAt: Date.now(),
      };
      await putRecord(env, COLLECTION, invoiceId, updated);

      const result = { ...updated, statusLabel: STATUS_LABEL.processing, message: messageFor(updated) };
      await sendOrderStatusEmail(env, result).catch(() => {});
    }
  }

  return json(200, { received: true });
};
