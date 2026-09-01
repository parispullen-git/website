/* Proposals -- quotes sent to a client before any money changes hands.
   Single-record GET by id is public (the client's shareable link, an
   unguessable id standing in for auth). Listing and writes are gated. */

const { listRecords, getRecord, putRecord, deleteRecord, newId, checkAuth, json } = require('./lib/store');

const COLLECTION = 'proposals';

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};

  if (event.httpMethod === 'GET') {
    if (params.id) {
      const record = await getRecord(COLLECTION, params.id);
      if (!record) return json(404, { error: 'Not found' });
      return json(200, record);
    }
    if (!checkAuth({ passphraseHash: params.passphraseHash })) {
      return json(401, { error: 'Not authorized.' });
    }
    const records = await listRecords(COLLECTION);
    return json(200, { records });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'Bad request body' });
  }

  if (!checkAuth(payload)) {
    return json(401, { error: 'Not authorized.' });
  }

  if (event.httpMethod === 'POST') {
    const { name, email, items, expiresInDays, notes } = payload;
    if (!name || !email || !Array.isArray(items) || !items.length) {
      return json(400, { error: 'Missing required proposal fields' });
    }
    const id = payload.id || newId('prop');
    const existing = payload.id ? await getRecord(COLLECTION, id) : null;
    const total = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const record = {
      id, name, email, items, total, notes: notes || '',
      status: (existing && existing.status) || 'draft',
      createdAt: existing ? existing.createdAt : Date.now(),
      updatedAt: Date.now(),
      expiresAt: Date.now() + (Number(expiresInDays || 14) * 86400000),
    };
    await putRecord(COLLECTION, id, record);
    return json(200, { record });
  }

  if (event.httpMethod === 'DELETE') {
    if (!params.id) return json(400, { error: 'Missing id' });
    await deleteRecord(COLLECTION, params.id);
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed' });
};
