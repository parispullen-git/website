/* Generic CRUD for the site's editable content collections.
   Public GET (list) so the live pages can render it; authed POST/DELETE
   so only the dashboard can change it.
   Collections: vault-reserve, vault-links, journal, casefiles, wardrobe,
   curations (personalized wardrobe lookbooks, see dashboard.html's Lookbook
   tab and lookbook.html), playlists (the Piano's Spotify rotation -- see
   assets/js/piano-player.js, house.html, assets/js/penthouse.js), channels
   (TV/Cinema room channel lists, one record per room-set keyed by id --
   see assets/js/tv-remote.js), pitches (internal brand-pitch tracker,
   dashboard-only, nothing on the live site reads it), goals (project/pitch
   targets, dashboard-only), social-analytics (manual per-platform post and
   follower-count log, dashboard-only), newsletter (per-send stats,
   dashboard-only), tracked-brands (the checklist of brands/people/outlets
   the daily news pipeline searches for -- see scripts/fetch_daily_news.py),
   daily-news (that pipeline's output, written by
   .github/workflows/daily-news.yml, read-only from the dashboard).

   Cloudflare Pages Functions port of netlify/functions/content.js -- see
   _lib/http.js's toEvent() for why the body below reads like the original. */

const { listRecords, getRecord, putRecord, deleteRecord, newId, checkAuth, json } = require('./_lib/store');
const { toEvent } = require('./_lib/http');

const ALLOWED = new Set([
  'vault-reserve', 'vault-links', 'journal', 'journal-categories', 'casefiles', 'wardrobe', 'curations',
  'playlists', 'channels', 'pitches', 'dispatch-briefs', 'goals', 'social-analytics', 'newsletter',
  'tracked-brands', 'daily-news',
]);

export async function onRequest(context) {
  const { request, env } = context;
  const event = await toEvent(request);

  const params = event.queryStringParameters || {};
  const collection = params.collection;
  if (!ALLOWED.has(collection)) {
    return json(400, { error: 'Unknown or missing collection' });
  }

  if (event.httpMethod === 'GET') {
    if (params.id) {
      const record = await getRecord(env, collection, params.id);
      if (!record) return json(404, { error: 'Not found' });
      return json(200, record);
    }
    const records = await listRecords(env, collection);
    return json(200, { records });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'Bad request body' });
  }

  if (!checkAuth(env, payload)) {
    return json(401, { error: 'Not authorized.' });
  }

  if (event.httpMethod === 'POST') {
    const id = payload.id || newId(collection.replace(/[^a-z]/g, '').slice(0, 4));
    const now = Date.now();
    const existing = payload.id ? await getRecord(env, collection, payload.id) : null;
    const record = {
      ...payload.data,
      id,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };
    await putRecord(env, collection, id, record);
    return json(200, { record });
  }

  if (event.httpMethod === 'DELETE') {
    if (!params.id) return json(400, { error: 'Missing id' });
    await deleteRecord(env, collection, params.id);
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed' });
};
