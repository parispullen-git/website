/* Subdomain routing for the client sites nested in this same repo, plus
   links.parispullen.com (the link-in-bio hub). Netlify's netlify.toml did
   this with host-matching [[redirects]] rules (`from =
   "https://dante.parispullen.com/*"`); Cloudflare Pages' _redirects only
   matches on PATH, not on Host, so a host-based _redirects rule here
   silently never fires. This does the same job as actual request-time
   logic instead. Runs before every request, including the /api/*
   Functions -- checked first and left alone so this never intercepts
   those. */

// Full self-contained subsites: EVERY path on that host maps into its own
// subdirectory, which carries its own complete copy of assets/ etc. --
// re-fetching /<dir>/<path> for literally any path is correct here.
const SUBDOMAIN_DIR = {
  'dante.parispullen.com': 'dantesimpson',
  'burnsbrims.parispullen.com': 'burnsbrims',
  'harvey.parispullen.com': 'harveycummings',
  'ynnt.parispullen.com': 'yournewnailtech',
  'goodwill.parispullen.com': 'goodwillgrooming',
  'el.parispullen.com': 'ellambert',
  'threepiece.parispullen.com': 'threepieceentertainment',
};

// Single-page hubs: the opposite shape -- one page at <dir>/index.html
// that leans on the MAIN site's shared /assets/ and links out to real
// pages at the site root (journal.html, wardrobe.html, ...). Rewriting
// every path here the same way SUBDOMAIN_DIR does breaks both: an asset
// request (/assets/css/world.css) would look for a copy that was never
// duplicated into <dir>/, and a card's own link (/journal.html) would
// look for <dir>/journal.html instead of the real page at the root. Only
// the root path itself gets rewritten; everything else -- assets, and
// every link the page itself points to -- passes straight through.
const SINGLE_PAGE_DIR = {
  'links.parispullen.com': 'links',
};

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) return next();

  const singleDir = SINGLE_PAGE_DIR[url.hostname];
  if (singleDir) {
    if (url.pathname !== '/') return next();
    const assetUrl = new URL(request.url);
    assetUrl.pathname = '/' + singleDir + '/';
    return env.ASSETS.fetch(new Request(assetUrl, request));
  }

  const dir = SUBDOMAIN_DIR[url.hostname];
  if (!dir) return next();

  const assetUrl = new URL(request.url);
  assetUrl.pathname = '/' + dir + url.pathname;
  return env.ASSETS.fetch(new Request(assetUrl, request));
}
