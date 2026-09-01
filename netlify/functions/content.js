/* Generic CRUD for the site's editable content collections.
   Public GET (list) so the live pages can render it; authed POST/DELETE
   so only the dashboard can change it.
   Collections: vault-reserve, vault-links, journal, casefiles, wardrobe */

const { listRecords, getRecord, putRecord, deleteRecord, newId, checkAuth, json } = require('./lib/store');

const ALLOWED = new Set(['vault-reserve', 'vault-links', 'journal', 'casefiles', 'wardrobe']);

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const collection = params.collection;
  if (!ALLOWED.has(collection)) {
    return json(400, { error: 'Unknown or missing collection' });
  }

  if (event.httpMethod === 'GET') {
    if (params.id) {
      const record = await getRecord(collection, params.id);
      if (!record) return json(404, { error: 'Not found' });
      return json(200, record);
    }
    const records = await listRecords(collection);
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
    const id = payload.id || newId(collection.replace(/[^a-z]/g, '').slice(0, 4));
    const now = Date.now();
    const existing = payload.id ? await getRecord(collection, payload.id) : null;
    const record = {
      ...payload.data,
      id,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };
    await putRecord(collection, id, record);
    return json(200, { record });
  }

  if (event.httpMethod === 'DELETE') {
    if (!params.id) return json(400, { error: 'Missing id' });
    await deleteRecord(collection, params.id);
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed' });
};
