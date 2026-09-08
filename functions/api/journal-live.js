/* Read/write for the REAL Journal entries -- the ones in data/journal.json
   that build_journal.py bakes into journal.html and journal-<slug>.html.
   Those files live in the parispullen-git/website GitHub repo, and a
   Cloudflare Pages Function has no filesystem of its own to edit them on,
   so this talks to GitHub's Contents API instead: GET reads the file as it
   stands on `main`, POST commits a full replacement back to `main`.

   This does NOT touch the live site. Committing here only updates the
   source file in git -- someone still has to pull the repo, run
   `python3 build_journal.py`, and deploy (`wrangler pages deploy`) for a
   change made here to actually reach parispullen.com, exactly like an edit
   made in the local Operator Console. That's deliberate, not a gap: this
   project deploys on command only, never automatically on a git push.

   Auth reuses the same passphrase gate as every other authed endpoint
   (INVOICE_PASSPHRASE_HASH via checkAuth) -- this is a second, independent
   secret from GITHUB_TOKEN below. */

const { checkAuth, json } = require('./_lib/store');
const { toEvent } = require('./_lib/http');

const REPO = 'parispullen-git/website';
const BRANCH = 'main';
const PATH = 'data/journal.json';
const GITHUB_API = `https://api.github.com/repos/${REPO}/contents/${PATH}`;

function ghHeaders(env) {
  return {
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'parispullen-dashboard',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// base64 helpers -- GitHub's Contents API speaks base64, the Workers
// runtime has no Buffer, and the file is UTF-8 (curly quotes, em dashes,
// accented names) so a naive atob/btoa round-trip would corrupt it.
function b64ToUtf8(b64) {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function utf8ToB64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

export async function onRequest(context) {
  const { request, env } = context;
  const event = await toEvent(request);

  if (!env.GITHUB_TOKEN) {
    return json(500, { error: 'GITHUB_TOKEN is not configured on this Pages project.' });
  }

  if (event.httpMethod === 'GET') {
    const res = await fetch(GITHUB_API + `?ref=${BRANCH}`, { headers: ghHeaders(env) });
    if (!res.ok) {
      const detail = await res.text();
      return json(res.status, { error: `GitHub read failed: ${res.status}`, detail });
    }
    const file = await res.json();
    let posts;
    try {
      posts = JSON.parse(b64ToUtf8(file.content));
    } catch (e) {
      return json(500, { error: 'data/journal.json on GitHub is not valid JSON: ' + e.message });
    }
    return json(200, { posts, sha: file.sha });
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

    // Always re-fetch the current sha immediately before writing -- the
    // editor's own copy can be stale (another edit, another tab, another
    // person), and GitHub rejects a PUT whose sha doesn't match HEAD, which
    // is exactly the check we want rather than silently clobbering someone
    // else's save.
    const shaRes = await fetch(GITHUB_API + `?ref=${BRANCH}`, { headers: ghHeaders(env) });
    if (!shaRes.ok) {
      return json(shaRes.status, { error: `Could not read current file sha: ${shaRes.status}` });
    }
    const current = await shaRes.json();

    const body = {
      message: payload.commitMessage || 'Update Journal entries via dashboard',
      content: utf8ToB64(JSON.stringify(payload.posts, null, 2) + '\n'),
      sha: current.sha,
      branch: BRANCH,
    };
    const putRes = await fetch(GITHUB_API, {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders(env)),
      body: JSON.stringify(body),
    });
    if (!putRes.ok) {
      const detail = await putRes.text();
      if (putRes.status === 409) {
        return json(409, { error: 'The file changed on GitHub since you loaded it. Reload and try again.', detail });
      }
      return json(putRes.status, { error: `GitHub write failed: ${putRes.status}`, detail });
    }
    const result = await putRes.json();
    return json(200, { ok: true, sha: result.content.sha, commitUrl: result.commit.html_url });
  }

  return json(405, { error: 'Method not allowed' });
}
