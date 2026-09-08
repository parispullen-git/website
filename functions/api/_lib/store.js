/* Shared Cloudflare KV helpers for the dashboard's data layer -- the
   Workers-runtime replacement for the old Netlify Blobs version of this
   file (netlify/functions/lib/store.js, kept in the repo for reference).

   Netlify Blobs gave each "collection" (inquiries, proposals, clients,
   vault-reserve, vault-links, wardrobe, journal, casefiles, orders, ...)
   its own named store. One KV namespace (binding PP_DATA, see wrangler.toml)
   holds all of them here instead, keyed as "<collection>/<id>", with list()
   scoped by prefix -- same shape from every caller's point of view, just a
   different key layout underneath.

   Unlike Netlify Functions (which read secrets/config off process.env
   automatically), a Cloudflare Pages Function receives them on its own
   per-request `env` object -- every function in this call threads `env`
   through explicitly instead of reaching for a global. */

function newId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

async function listRecords(env, collection) {
  const records = [];
  let cursor;
  do {
    const page = await env.PP_DATA.list({ prefix: `${collection}/`, cursor });
    const batch = await Promise.all(page.keys.map((k) => env.PP_DATA.get(k.name, 'json')));
    records.push(...batch.filter(Boolean));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function getRecord(env, collection, id) {
  return env.PP_DATA.get(`${collection}/${id}`, 'json');
}

async function putRecord(env, collection, id, data) {
  await env.PP_DATA.put(`${collection}/${id}`, JSON.stringify(data));
  return data;
}

async function deleteRecord(env, collection, id) {
  await env.PP_DATA.delete(`${collection}/${id}`);
}

function checkAuth(env, payload) {
  const expected = env.INVOICE_PASSPHRASE_HASH;
  if (!expected) return true; // no gate configured -- fail open only if unset
  return payload && payload.passphraseHash === expected;
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

module.exports = { newId, listRecords, getRecord, putRecord, deleteRecord, checkAuth, json };
