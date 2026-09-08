/* The Network -- lead capture for people met in person (a city, an event,
   a venue), meant to be filled out in seconds from a phone. Deliberately
   its own function rather than a collection on the shared content.js:
   that file's GET is unauthenticated by design (public pages fetch
   journal posts, playlists, etc. with no login) -- real names, phone
   numbers and emails can never sit behind that same open GET. Same KV
   store, same checkAuth/passphrase gate as the rest of the dashboard,
   but POST (the public submit) is deliberately the one path here that
   skips it -- that's the whole point of the form. */

const { listRecords, deleteRecord, newId, checkAuth, json } = require('./_lib/store');

const COLLECTION = 'network';

function clean(s, max) {
  return String(s || '').trim().slice(0, max);
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'GET') {
    if (!checkAuth(env, { passphraseHash: url.searchParams.get('passphraseHash') })) {
      return json(401, { error: 'Not authorized.' });
    }
    const records = await listRecords(env, COLLECTION);
    return json(200, { records });
  }

  if (request.method === 'DELETE') {
    if (!checkAuth(env, { passphraseHash: url.searchParams.get('passphraseHash') })) {
      return json(401, { error: 'Not authorized.' });
    }
    const id = url.searchParams.get('id');
    if (!id) return json(400, { error: 'Missing id' });
    await deleteRecord(env, COLLECTION, id);
    return json(200, { ok: true });
  }

  if (request.method === 'POST') {
    let payload;
    try {
      payload = JSON.parse(await request.text());
    } catch (e) {
      return json(400, { error: 'Bad request body' });
    }

    // A hidden field real visitors never see or fill; a bot filling every
    // input on the page will. Silently "succeed" rather than telling a
    // bot its submission was rejected.
    if (clean(payload.company, 200)) {
      return json(200, { ok: true });
    }

    const firstName = clean(payload.firstName, 80);
    const lastName = clean(payload.lastName, 80);
    const phone = clean(payload.phone, 40);
    const email = clean(payload.email, 200);

    if (!firstName || !lastName) {
      return json(400, { error: 'First and last name are required.' });
    }
    if (!phone && !email) {
      return json(400, { error: 'A phone number or email is required.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(400, { error: 'That email address doesn’t look right.' });
    }

    const id = newId('net');
    const now = Date.now();
    const record = {
      id, firstName, lastName, phone, email,
      city: clean(payload.city, 80),
      createdAt: now, updatedAt: now,
    };
    await env.PP_DATA.put(`${COLLECTION}/${id}`, JSON.stringify(record));
    return json(200, { ok: true, firstName });
  }

  return json(405, { error: 'Method not allowed' });
}
