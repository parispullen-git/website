/* Blueprint Book 01 guide signup submissions. Anyone can POST (the public
   guide form on blueprint.html) -- listing requires the dashboard passphrase.
   Cloudflare Pages Function, same pattern as api/inquiries.js. */

const { listRecords, putRecord, newId, checkAuth, json } = require('./_lib/store');
const { toEvent } = require('./_lib/http');

const COLLECTION = 'guide-signups';

export async function onRequest(context) {
  const { request, env } = context;
  const event = await toEvent(request);

  if (event.httpMethod === 'POST') {
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (e) {
      return json(400, { error: 'Bad request body' });
    }
    // Honeypot: bots fill `company`; accept silently without storing.
    if (payload.company) {
      return json(200, { ok: true, id: null });
    }
    const firstName = (payload.firstName || '').toString().trim().slice(0, 80);
    const lastName = (payload.lastName || '').toString().trim().slice(0, 80);
    const email = (payload.email || '').toString().trim().slice(0, 200);
    const phone = (payload.phone || '').toString().trim().slice(0, 40);
    if (!firstName || !lastName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(400, { error: 'Please provide your first name, last name, and a valid email.' });
    }
    const id = newId('gsu');
    const record = { id, firstName, lastName, email, phone, createdAt: Date.now(), status: 'new', source: 'blueprint-book-01' };
    await putRecord(env, COLLECTION, id, record);
    return json(200, { ok: true, id });
  }

  if (event.httpMethod === 'GET') {
    if (!checkAuth(env, null, event.headers)) {
      return json(401, { error: 'Not authorized.' });
    }
    const records = await listRecords(env, COLLECTION);
    return json(200, { records });
  }

  return json(405, { error: 'Method not allowed' });
};
