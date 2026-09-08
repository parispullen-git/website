/* Read/write for the real House Music playlist/album list --
   data/house-music.json, which house.html fetches live at runtime (no
   build/rebuild step -- see local-admin/server.js's COLLECTIONS entry for
   this one, rebuild: null). See journal-live.js for the fuller
   explanation this mirrors: GitHub Contents API only, never the live
   site directly -- though for this one specifically, since house.html
   reads it live with no baked HTML in between, a save here reaches the
   site as soon as it's committed, no Deploy Live needed. */

const { checkAuth, json } = require('./_lib/store');
const { toEvent } = require('./_lib/http');
const { readJsonFile, writeJsonFile } = require('./_lib/github-file');

const PATH = 'data/house-music.json';

export async function onRequest(context) {
  const { request, env } = context;
  const event = await toEvent(request);

  if (!env.GITHUB_TOKEN) {
    return json(500, { error: 'GITHUB_TOKEN is not configured on this Pages project.' });
  }

  if (event.httpMethod === 'GET') {
    const result = await readJsonFile(env, PATH);
    if (!result.ok) return json(result.status, { error: result.error, detail: result.detail });
    return json(200, { items: result.data, sha: result.sha });
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
    if (!Array.isArray(payload.items)) {
      return json(400, { error: 'Missing items array' });
    }
    const result = await writeJsonFile(env, PATH, payload.items, payload.commitMessage || 'Update House Music via dashboard');
    if (!result.ok) return json(result.status, { error: result.error, detail: result.detail });
    return json(200, { ok: true, sha: result.sha, commitUrl: result.commitUrl });
  }

  return json(405, { error: 'Method not allowed' });
}
