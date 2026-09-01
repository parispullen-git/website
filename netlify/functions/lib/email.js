/* Resend transactional email helper for order-status notifications. */

const FROM = 'Paris Pullen Atelier <orders@parispullen.com>';

const SUBJECT = {
  processing: 'Your Order is Processing — Paris Pullen Atelier',
  shipped: 'Your Order Has Shipped — Paris Pullen Atelier',
  arrived: 'Your Order Has Arrived — Paris Pullen Atelier',
  ready_for_pickup: 'Your Order is Ready for Pickup — Paris Pullen Atelier',
};

function htmlFor(order, message) {
  return `<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5c;">Paris Pullen Atelier</p>
    <p style="font-size:16px;line-height:1.6;">${message}</p>
    <p style="font-size:14px;color:#555;margin-top:24px;">— Paris Pullen Atelier</p>
  </div>`;
}

async function sendOrderStatusEmail(order) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: 'RESEND_API_KEY not set' };
  if (!order.clientEmail) return { skipped: true, reason: 'no client email on order' };

  const subject = SUBJECT[order.status];
  if (!subject) return { skipped: true, reason: 'unknown status' };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: order.clientEmail,
      subject,
      html: htmlFor(order, order.message),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { skipped: false, error: data };
  }
  return { skipped: false, id: data.id };
}

module.exports = { sendOrderStatusEmail };
