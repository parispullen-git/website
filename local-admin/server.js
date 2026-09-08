#!/usr/bin/env node
/*
 * Local Operator Console server -- localhost-only, never deployed.
 *
 * Serves the repo root as static files (so console.html can reuse
 * assets/css/world.css, and "Preview" links can open the real regenerated
 * pages), plus a small JSON API for reading/writing data/*.json and
 * re-running the matching build_*.py script.
 *
 * Run: node local-admin/server.js   (from anywhere -- path is resolved
 * relative to this file, not the current directory)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const util = require('util');

const execFileP = util.promisify(execFile);

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const PORT = process.env.PORT || 5175;

// Every self-contained build script Publish Live reruns before deploying,
// so whatever's live always matches whatever's currently saved -- run in
// this order regardless of which one(s) actually changed, same set
// .github/workflows/deploy.yml reruns for a dashboard-triggered deploy.
// build_drafting.py (private, uncommitted client data) and
// scripts/build_brands.py (copies from sibling project directories outside
// this repo) are deliberately excluded -- both stay manual, local-only.
const BUILD_SCRIPTS = [
  'build_journal.py', 'build_house.py', 'build_casefiles.py',
  'build_charlotte.py', 'scripts/build_wardrobe.py',
];

// Collection name -> { file, rebuild } where rebuild is the build script to
// re-run after a save, or null if the page reads the JSON live (no build step).
const COLLECTIONS = {
  wardrobe: { file: 'wardrobe.json', rebuild: 'scripts/build_wardrobe.py', page: 'wardrobe.html' },
  journal: { file: 'journal.json', rebuild: 'build_journal.py', page: 'journal.html' },
  casefiles: { file: 'casefiles.json', rebuild: 'build_casefiles.py', page: 'casefiles.html' },
  'charlotte-locations': { file: 'charlotte-locations.json', rebuild: 'build_charlotte.py', page: 'charlotte.html' },
  'house-music': { file: 'house-music.json', rebuild: 'build_house.py', page: 'house.html' },
  'house-channels': { file: 'house-channels.json', rebuild: null, page: 'house.html' },
  'dispatch-briefs': { file: 'dispatch-briefs.json', rebuild: null, page: null },
};

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'Access-Control-Allow-Origin': '*' }, headers || {}));
  res.end(body);
}
function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// One log line per step, so a failure partway through (a build script
// erroring, a rejected push, an expired wrangler login) is obvious which
// step it happened at rather than one opaque combined blob.
async function publishPipeline(onStep) {
  const log = [];
  function step(label) { onStep(label); log.push('\n=== ' + label + ' ===\n'); }
  async function run(cmd, args) {
    try {
      const { stdout, stderr } = await execFileP(cmd, args, { cwd: ROOT, timeout: 600000, maxBuffer: 50 * 1024 * 1024 });
      log.push(stdout, stderr);
    } catch (e) {
      log.push(e.stdout || '', e.stderr || '', e.message);
      throw new Error(log.join(''));
    }
  }

  step('Cleaning up macOS AppleDouble junk files');
  // These sneak onto network volumes as shadow files (._foo.js next to
  // foo.js) and break wrangler's function bundler if left in place -- same
  // failure hit mid-session; scrubbed here so Publish Live never repeats it.
  const junk = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.startsWith('._')) junk.push(full);
    }
  })(ROOT);
  junk.forEach((f) => fs.unlinkSync(f));
  log.push(`Removed ${junk.length} junk file(s).\n`);

  step('Rebuilding generated pages');
  for (const script of BUILD_SCRIPTS) {
    await run('python3', [script]);
  }

  step('Committing to git');
  const { stdout: statusOut } = await execFileP('git', ['status', '--porcelain'], { cwd: ROOT });
  if (statusOut.trim()) {
    await run('git', ['add', '-A']);
    await run('git', ['commit', '-m', 'Publish from Operator Console']);
  } else {
    log.push('Nothing to commit -- working tree already matches last commit.\n');
  }

  step('Pushing to GitHub');
  await run('git', ['push', 'origin', 'main']);

  step('Deploying to Cloudflare Pages');
  await run('npx', ['wrangler', 'pages', 'deploy', '.', '--project-name=parispullen', '--commit-dirty=true']);

  return log.join('');
}

async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'collection', 'wardrobe']
  const kind = parts[1]; // 'collection' | 'rebuild' | 'publish'

  if (kind === 'publish' && req.method === 'POST') {
    try {
      const output = await publishPipeline(() => {});
      return sendJson(res, 200, { ok: true, output });
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: 'Publish failed -- see output for which step.', output: e.message });
    }
  }

  const name = parts[2];
  const collection = COLLECTIONS[name];

  if (!collection) return sendJson(res, 404, { error: 'Unknown collection: ' + name });
  const filePath = path.join(DATA_DIR, collection.file);

  if (kind === 'collection' && req.method === 'GET') {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      return sendJson(res, 200, JSON.parse(raw));
    } catch (e) {
      return sendJson(res, 500, { error: 'Could not read ' + collection.file + ': ' + e.message });
    }
  }

  if (kind === 'collection' && req.method === 'POST') {
    let parsed;
    try {
      parsed = JSON.parse(await readBody(req));
    } catch (e) {
      return sendJson(res, 400, { error: 'Invalid JSON body: ' + e.message });
    }
    try {
      fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
      return sendJson(res, 200, { ok: true });
    } catch (e) {
      return sendJson(res, 500, { error: 'Could not write ' + collection.file + ': ' + e.message });
    }
  }

  if (kind === 'rebuild' && req.method === 'POST') {
    if (!collection.rebuild) {
      return sendJson(res, 200, { ok: true, output: 'No rebuild needed -- ' + collection.page + ' reads this file live at runtime.' });
    }
    execFile('python3', [collection.rebuild], { cwd: ROOT, timeout: 300000, maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return sendJson(res, 500, { ok: false, output: stdout + '\n' + stderr, error: err.message });
      sendJson(res, 200, { ok: true, output: stdout + stderr, page: collection.page });
    });
    return;
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
}

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/local-admin/console.html';
  const filePath = path.join(ROOT, rel);
  if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden');
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found: ' + rel);
    const ext = path.extname(filePath);
    send(res, 200, data, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') return send(res, 200, '');
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url).catch((e) => sendJson(res, 500, { error: e.message }));
  return serveStatic(req, res, url);
});

// localhost-only -- this tool needs filesystem + script-execution access a
// public site can never have, so it must never listen beyond the loopback.
server.listen(PORT, '127.0.0.1', () => {
  console.log('Operator Console running at http://127.0.0.1:' + PORT + '/local-admin/console.html');
});
