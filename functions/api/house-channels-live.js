/* Read/write for the real House TV/Cinema channel lists --
   data/house-channels.json, which house.html fetches live at runtime (no
   rebuild step needed). Unlike every other *-live.js function, this file
   is a DICT of named lists (room-set id -> [{id, label}, ...]), not an
   array of records -- so this passes the object through as-is rather
   than requiring `items`/`posts` to be an array. See journal-live.js for
   the fuller explanation this mirrors otherwise. */

const { checkAuth, json } = require('./_lib/store');
const { toEvent } = require('./_lib/http');
const { readJsonFile, writeJsonFile } = require('./_lib/github-file');

const PATH = 'data/house-channels.json';

export async function onRequest(context) {
  const { request, env } = context;
  const event = await toEvent(request);

  if (!env.GITHUB_TOKEN) {
    return json(500, { error: 'GITHUB_TOKEN is not configured on this Pages project.' });
  }

  if (event.httpMethod === 'GET') {
    const result = await readJsonFile(env, PATH);
    if (!result.ok) return json(result.status, { error: result.error, detail: result.detail });
    return json(200, { data: result.data, sha: result.sha });
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
    if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      return json(400, { error: 'Missing data object' });
    }
    const result = await writeJsonFile(env, PATH, payload.data, payload.commitMessage || 'Update House Channels via dashboard');
    if (!result.ok) return json(result.status, { error: result.error, detail: result.detail });
    return json(200, { ok: true, sha: result.sha, commitUrl: result.commitUrl });
  }

  return json(405, { error: 'Method not allowed' });
}
