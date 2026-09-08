/* Triggers the "Build and Deploy" GitHub Actions workflow (see
   .github/workflows/deploy.yml) from the dashboard's Deploy Live button.
   That workflow does the real work -- rebuild every generated page, then
   `wrangler pages deploy` -- this function only asks GitHub to start it,
   via the same GITHUB_TOKEN used by journal-live.js.

   This is deliberately the only way a click in the dashboard reaches
   production: there's no build/deploy logic here, no shell access (Pages
   Functions don't have any), and no path from a plain data save straight
   to a live site -- Deploy Live is its own explicit action every time. */

const { checkAuth, json } = require('./_lib/store');
const { toEvent } = require('./_lib/http');

const REPO = 'parispullen-git/website';
const WORKFLOW = 'deploy.yml';
const BRANCH = 'main';

export async function onRequest(context) {
  const { request, env } = context;
  const event = await toEvent(request);

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }
  if (!env.GITHUB_TOKEN) {
    return json(500, { error: 'GITHUB_TOKEN is not configured on this Pages project.' });
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

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'parispullen-dashboard',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: BRANCH }),
    }
  );

  // A successful dispatch is 204 No Content -- GitHub doesn't hand back a
  // run id from this endpoint, so the dashboard links to the Actions tab
  // to watch progress rather than polling for one.
  if (res.status === 204) {
    return json(200, {
      ok: true,
      actionsUrl: `https://github.com/${REPO}/actions/workflows/${WORKFLOW}`,
    });
  }

  const detail = await res.text();
  return json(res.status, { error: `GitHub could not start the workflow: ${res.status}`, detail });
}
