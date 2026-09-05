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

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const PORT = process.env.PORT || 5175;

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

async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'collection', 'wardrobe']
  const kind = parts[1]; // 'collection' | 'rebuild'
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
