/* Boutique inquiry submissions. Anyone can POST (the public inquiry form
   on wardrobe.html) -- listing requires the dashboard passphrase.
   Cloudflare Pages Functions port of netlify/functions/inquiries.js. */

const { listRecords, putRecord, newId, checkAuth, json } = require('./_lib/store');
const { toEvent } = require('./_lib/http');

const COLLECTION = 'inquiries';

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
    const { name, email, phone, notes, items } = payload;
    if (!name || !email || !phone || !Array.isArray(items) || !items.length) {
      return json(400, { error: 'Missing required inquiry fields' });
    }
    const id = newId('inq');
    const record = { id, name, email, phone, notes: notes || '', items, createdAt: Date.now(), status: 'new' };
    await putRecord(env, COLLECTION, id, record);
    return json(200, { ok: true, id });
  }

  if (event.httpMethod === 'GET') {
    const auth = event.queryStringParameters && event.queryStringParameters.passphraseHash;
    if (!checkAuth(env, { passphraseHash: auth })) {
      return json(401, { error: 'Not authorized.' });
    }
    const records = await listRecords(env, COLLECTION);
    return json(200, { records });
  }

  return json(405, { error: 'Method not allowed' });
};
