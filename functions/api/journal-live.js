/* Read/write for the REAL Journal entries -- the ones in data/journal.json
   that build_journal.py bakes into journal.html and journal-<slug>.html.
   Those files live in the parispullen-git/website GitHub repo, and a
   Cloudflare Pages Function has no filesystem of its own to edit them on,
   so this talks to GitHub's Contents API instead (see _lib/github-file.js):
   GET reads the file as it stands on `main`, POST commits a full
   replacement back to `main`.

   This does NOT touch the live site. Committing here only updates the
   source file in git -- someone still has to pull the repo, run
   `python3 build_journal.py`, and deploy (`wrangler pages deploy`) for a
   change made here to actually reach parispullen.com, exactly like an edit
   made in the local Operator Console -- or click the dashboard's Deploy
   Live button, which runs that same pipeline via GitHub Actions.

   Auth reuses the same passphrase gate as every other authed endpoint
   (INVOICE_PASSPHRASE_HASH via checkAuth) -- this is a second, independent
   secret from GITHUB_TOKEN. */

const { checkAuth, json } = require('./_lib/store');
const { toEvent } = require('./_lib/http');
const { readJsonFile, writeJsonFile } = require('./_lib/github-file');

const PATH = 'data/journal.json';

export async function onRequest(context) {
  const { request, env } = context;
  const event = await toEvent(request);

  if (!env.GITHUB_TOKEN) {
    return json(500, { error: 'GITHUB_TOKEN is not configured on this Pages project.' });
  }

  if (event.httpMethod === 'GET') {
    const result = await readJsonFile(env, PATH);
    if (!result.ok) return json(result.status, { error: result.error, detail: result.detail });
    return json(200, { posts: result.data, sha: result.sha });
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
    if (!Array.isArray(payload.posts)) {
      return json(400, { error: 'Missing posts array' });
    }
    const result = await writeJsonFile(env, PATH, payload.posts, payload.commitMessage || 'Update Journal entries via dashboard');
    if (!result.ok) return json(result.status, { error: result.error, detail: result.detail });
    return json(200, { ok: true, sha: result.sha, commitUrl: result.commitUrl });
  }

  return json(405, { error: 'Method not allowed' });
}
