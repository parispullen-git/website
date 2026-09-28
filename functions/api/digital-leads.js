/* Public intake + private Dashboard read for digital-product leads. */
const { listRecords, getRecord, putRecord, deleteRecord, newId, checkAuth, json } = require('./_lib/store');
const { toEvent } = require('./_lib/http');

function clean(value, max) {
  return String(value || '').trim().replace(/[\u0000-\u001f<>]/g, '').slice(0, max);
}
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function onRequest(context) {
  const { request, env } = context;
  const event = await toEvent(request);
  const params = event.queryStringParameters || {};

  if (event.httpMethod === 'POST') {
    let payload;
    try { payload = JSON.parse(event.body || '{}'); }
    catch (_) { return json(400, { error: 'Bad request body' }); }

    // Quietly accept bot traps without storing a record.
    if (clean(payload.company, 200)) return json(200, { ok: true });

    const firstName = clean(payload.firstName, 80);
    const lastName = clean(payload.lastName, 80);
    const email = clean(payload.email, 200).toLowerCase();
    const product = clean(payload.product || 'Digital Product', 140);
    const phone = clean(payload.phone, 40);
    const source = clean(payload.source || '', 300);
    if (!firstName || !lastName || !validEmail(email)) {
      return json(400, { error: 'First name, last name, and a valid email are required.' });
    }

    const id = newId('lead');
    const now = Date.now();
    await putRecord(env, 'digital-leads', id, {
      id, firstName, lastName, email, phone, product, source,
      createdAt: now, updatedAt: now,
    });
    return json(201, { ok: true, id });
  }

  const authPayload = { passphraseHash: params.passphraseHash || '' };
  if (!checkAuth(env, authPayload)) return json(401, { error: 'Not authorized.' });

  if (event.httpMethod === 'GET') {
    const records = await listRecords(env, 'digital-leads');
    return json(200, { records });
  }
  if (event.httpMethod === 'DELETE') {
    if (!params.id) return json(400, { error: 'Missing id' });
    const record = await getRecord(env, 'digital-leads', params.id);
    if (!record) return json(404, { error: 'Not found' });
    await deleteRecord(env, 'digital-leads', params.id);
    return json(200, { ok: true });
  }
  return json(405, { error: 'Method not allowed' });
}
