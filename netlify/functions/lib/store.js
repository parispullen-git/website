/* Shared Netlify Blobs helpers for the dashboard's data layer.
   Each "collection" (inquiries, proposals, clients, vault-reserve,
   vault-links, wardrobe, journal, casefiles) is its own Blobs store,
   holding one JSON blob per record keyed by its id. */

const { getStore } = require('@netlify/blobs');

const SITE_ID = '2fa764b1-a9ad-452b-9048-fabfde74918b';

function store(name) {
  // CLI-based deploys don't always get the ambient Blobs context that
  // git-triggered builds do -- fall back to explicit config when that
  // happens, using a token stored as an env var (never hardcoded here).
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (token) {
    return getStore({ name, siteID: SITE_ID, token });
  }
  return getStore(name);
}

function newId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

async function listRecords(storeName) {
  const s = store(storeName);
  const { blobs } = await s.list();
  const records = await Promise.all(
    blobs.map(async (b) => {
      const v = await s.get(b.key, { type: 'json' });
      return v;
    })
  );
  return records.filter(Boolean).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function getRecord(storeName, id) {
  return store(storeName).get(id, { type: 'json' });
}

async function putRecord(storeName, id, data) {
  await store(storeName).setJSON(id, data);
  return data;
}

async function deleteRecord(storeName, id) {
  await store(storeName).delete(id);
}

function checkAuth(payload) {
  const expected = process.env.INVOICE_PASSPHRASE_HASH;
  if (!expected) return true; // no gate configured -- fail open only if unset
  return payload && payload.passphraseHash === expected;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

module.exports = { store, newId, listRecords, getRecord, putRecord, deleteRecord, checkAuth, json };
