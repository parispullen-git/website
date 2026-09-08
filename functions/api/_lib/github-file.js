/* Shared GitHub Contents API read/write for the dashboard's "Live" editors
   (Journal, Boutique, and anything else that edits a data/*.json file
   directly on GitHub since a Pages Function has no filesystem of its own).
   See functions/api/journal-live.js for the fuller explanation of why this
   only reaches GitHub, never the live site, and why that's deliberate. */

const REPO = 'parispullen-git/website';
const BRANCH = 'main';

function ghHeaders(env) {
  return {
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'parispullen-dashboard',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// base64 helpers -- GitHub's Contents API speaks base64, the Workers
// runtime has no Buffer, and these files are UTF-8 (curly quotes, em
// dashes, accented names) so a naive atob/btoa round-trip would corrupt them.
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

async function readJsonFile(env, path) {
  const url = `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: ghHeaders(env) });
  if (!res.ok) {
    const detail = await res.text();
    return { ok: false, status: res.status, error: `GitHub read failed: ${res.status}`, detail };
  }
  const file = await res.json();
  let data;
  try {
    data = JSON.parse(b64ToUtf8(file.content));
  } catch (e) {
    return { ok: false, status: 500, error: `${path} on GitHub is not valid JSON: ${e.message}` };
  }
  return { ok: true, data, sha: file.sha };
}

// Always re-fetches the current sha immediately before writing -- the
// caller's own copy can be stale (another edit, another tab, another
// person), and GitHub rejects a PUT whose sha doesn't match HEAD, which is
// exactly the check we want rather than silently clobbering someone else's
// save.
async function writeJsonFile(env, path, data, commitMessage) {
  const url = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const shaRes = await fetch(url + `?ref=${BRANCH}`, { headers: ghHeaders(env) });
  if (!shaRes.ok) {
    return { ok: false, status: shaRes.status, error: `Could not read current file sha: ${shaRes.status}` };
  }
  const current = await shaRes.json();

  const body = {
    message: commitMessage,
    content: utf8ToB64(JSON.stringify(data, null, 2) + '\n'),
    sha: current.sha,
    branch: BRANCH,
  };
  const putRes = await fetch(url, {
    method: 'PUT',
    headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders(env)),
    body: JSON.stringify(body),
  });
  if (!putRes.ok) {
    const detail = await putRes.text();
    if (putRes.status === 409) {
      return { ok: false, status: 409, error: 'The file changed on GitHub since you loaded it. Reload and try again.', detail };
    }
    return { ok: false, status: putRes.status, error: `GitHub write failed: ${putRes.status}`, detail };
  }
  const result = await putRes.json();
  return { ok: true, sha: result.content.sha, commitUrl: result.commit.html_url };
}

module.exports = { readJsonFile, writeJsonFile, REPO, BRANCH };
