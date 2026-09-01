#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates journal.html (the .jlead featured post + the .jgrid card grid)
and one long-form article page per post (journal-<slug>.html) for
The Paris Pullen Journal.

Header/menu/footer are pulled live from index.html at build time (same
pattern as build_charlotte.py / build_house.py) so they never drift out
of sync with the rest of the site.

The "Vol. 10" pantry card (The Only Standing Order in the Apartment) is
intentionally NOT data-driven here -- it already correctly links to
pantry.html and is reproduced verbatim (PANTRY_CARD_HTML) so it is never
touched by this generator.

Images:
  - Site's own photography (assets/img/env-*, room-*, paris-*, etc.) is
    used for Charlotte, the two ancient-myth pieces, Laws, the wordplay
    business piece, and all nine original lifestyle/business/style posts.
  - A handful of entries reference real copyrighted media (a film, an
    album, a game, a book, two vehicles) and use ONE official poster /
    cover-art / press image each, fetched from Wikipedia / Wikimedia
    Commons at build time and saved locally under assets/img/press-*.
    See the build report for sourcing notes.

Post data lives in data/journal.json (edit directly, or via the local
Operator Console) -- then re-run:  python3 build_journal.py
"""
import json
import re
from pathlib import Path

_index_src = open("index.html", encoding="utf-8").read()
SITE_HEADER = re.search(r'<header class="worldnav">.*?</header>', _index_src, re.S).group(0)
SITE_MENU = re.search(r'<nav class="menu".*?</nav>', _index_src, re.S).group(0)
SITE_FOOT = re.search(r'<footer class="foot foot--film">.*?</footer>', _index_src, re.S).group(0)

def esc(t):
    if t is None:
        return ""
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

# ----------------------------------------------------------------------
# Category filter list -- "Automotive" is new (Karma / Mercedes Concept).
# ----------------------------------------------------------------------
CATS = [
    ("strategy", "Strategy"),
    ("style", "Style"),
    ("charlotte", "Charlotte"),
    ("philosophy", "Philosophy"),
    ("fragrance", "Fragrance"),
    ("business", "Business"),
    ("culture", "Culture"),
    ("music", "Music"),
    ("life", "Life"),
    ("automotive", "Automotive"),
]

def PQ(text):
    return "PQ::" + text

# ----------------------------------------------------------------------
# Posts, in reading/vol order. Each dict:
#   slug, cat, catlabel, vol, read, title, stand, featured, wide,
#   hero=dict(img, ext, mode['cover'|'contain'], alt, srcset[bool]),
#   body=[ ...paragraphs, PQ("...") for the pullquote... ]
# ----------------------------------------------------------------------
JOURNAL_POSTS = json.loads((Path(__file__).resolve().parent / "data" / "journal.json").read_text(encoding="utf-8"))

# ----------------------------------------------------------------------
# The Vol. 10 pantry card is intentionally left untouched (see docstring).
# Reproduced verbatim from the existing journal.html.
# ----------------------------------------------------------------------
PANTRY_CARD_HTML = '''      <a class="jcard" data-cat="life" href="pantry.html">
        <div class="jcard__media"><img src="assets/img/room-kitchen@sm.jpg" alt="" loading="lazy"></div>
        <p class="jcard__cat">Life</p>
        <h3 class="jcard__title">The Only Standing Order in the Apartment</h3>
        <p class="jcard__stand">Everything else here was chosen once and left alone. This is the one thing that renews itself weekly, without being asked, and he has never once thought to change it.</p>
        <p class="jcard__meta"><span>Vol. 10</span><span>3 min read</span><span>HelloFresh &#215; Paris Pullen</span></p>
      </a>'''

ARTICLE_CSS = '''<style>
  .jread-hero{position:relative;overflow:hidden;border-radius:2px;margin-top:var(--s7);background:var(--charcoal)}
  .jread-hero--cover img{width:100%;height:clamp(260px,42vw,480px);object-fit:cover;display:block;filter:brightness(.82)}
  .jread-hero--contain{display:flex;align-items:center;justify-content:center;padding:var(--s8) var(--s6);
    background:linear-gradient(180deg,var(--charcoal),var(--ink))}
  .jread-hero--contain img{max-height:420px;max-width:100%;width:auto;height:auto;display:block;
    box-shadow:0 30px 80px rgba(0,0,0,.55)}
  .jread-body{margin-top:var(--s8);display:grid;gap:var(--s5);max-width:var(--measure)}
  .jread-body .pullquote{margin:var(--s3) 0}
  .jread-nav{margin-top:var(--s10);border-top:1px solid var(--rule);padding-top:var(--s7);
    display:flex;flex-wrap:wrap;gap:var(--s5);justify-content:space-between;align-items:baseline}
  .jread-nav a{color:var(--bone)}
  .jread-nav__next{text-align:right;max-width:32ch}
  .jread-credit{margin-top:var(--s4);font-family:var(--font-mono);font-size:var(--t-micro);
    letter-spacing:.14em;text-transform:uppercase;color:var(--graphite)}
</style>'''

def hero_html(post, forpage=False):
    h = post["hero"]
    img = h["img"]; ext = h["ext"]; mode = h.get("mode", "cover")
    alt = esc(h.get("alt", ""))
    cls = "jread-hero jread-hero--cover" if mode == "cover" else "jread-hero jread-hero--contain"
    if h.get("srcset"):
        src = f'assets/img/{img}@sm.{ext}'
        srcset = f'assets/img/{img}@sm.{ext} 1200w, assets/img/{img}.{ext} 2400w'
        img_tag = f'<img src="{src}" srcset="{srcset}" sizes="100vw" alt="{alt}" loading="eager">'
    else:
        img_tag = f'<img src="assets/img/{img}.{ext}" alt="{alt}" loading="eager">'
    return f'<div class="{cls}">{img_tag}</div>'

def body_html(post):
    out = []
    for para in post["body"]:
        if para.startswith("PQ::"):
            out.append(f'<p class="pullquote">{para[4:]}</p>')
        else:
            out.append(f'<p class="body">{para}</p>')
    return "\n      ".join(out)

def article_url(post):
    return f'journal-{post["slug"]}.html'

def render_jlead(post):
    return f'''    <a class="jlead reveal" href="{article_url(post)}" data-cat="{post['cat']}">
      <div class="jlead__media">
        <img src="assets/img/{post['hero']['img']}@sm.{post['hero']['ext']}" srcset="assets/img/{post['hero']['img']}@sm.{post['hero']['ext']} 960w, assets/img/{post['hero']['img']}.{post['hero']['ext']} 2000w" sizes="(max-width:900px) 100vw, 60vw" alt="" loading="eager">
        <span class="jlead__tag">{post['catlabel']} &#183; Vol. {post['vol']}</span>
      </div>
      <div class="stack">
        <h2 class="jlead__title">{esc(post['title'])}</h2>
        <p class="jcard__stand">{post['stand']}</p>
        <p class="jcard__meta"><span>Featured</span><span>{post['read']}</span></p>
      </div>
    </a>'''

def render_jcard(post):
    wide = " jcard--wide" if post.get("wide") else ""
    return f'''      <a class="jcard{wide}" data-cat="{post['cat']}" href="{article_url(post)}">
        <div class="jcard__media"><img src="assets/img/{post['hero']['img']}@sm.{post['hero']['ext']}" alt="" loading="lazy"></div>
        <p class="jcard__cat">{post['catlabel']}</p>
        <h3 class="jcard__title">{esc(post['title'])}</h3>
        <p class="jcard__stand">{post['stand']}</p>
        <p class="jcard__meta"><span>Vol. {post['vol']}</span><span>{post['read']}</span></p>
      </a>'''

# ----------------------------------------------------------------------
# journal.html
# ----------------------------------------------------------------------
def build_journal_index():
    featured = [p for p in JOURNAL_POSTS if p.get("featured")][0]
    grid_posts = [p for p in JOURNAL_POSTS if not p.get("featured")]

    filter_buttons = "\n      ".join(
        f'<button type="button" data-cat="{slug}">{label}</button>' for slug, label in CATS
    )

    grid_html = "\n".join(render_jcard(p) for p in grid_posts) + "\n" + PANTRY_CARD_HTML

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Journal &#8212; Paris Pullen</title>
<meta name="description" content="Style, strategy, culture, Charlotte, music, fragrance, business, philosophy and life. Written the way it is lived.">
<meta name="theme-color" content="#0A0A0B">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/world.css">
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
{SITE_HEADER}
{SITE_MENU}
<main>
<section class="scene scene--pad" style="padding-top:clamp(8rem,20vh,14rem)">
  <div class="wrap">
    <header class="split reveal" style="align-items:end;margin-bottom:var(--s8)">
      <div class="stack stack--tight">
        <p class="eyebrow">The Gentleman&#8217;s Journal</p>
        <h1 class="display display--mega">The<br>Journal</h1>
      </div>
      <div class="stack">
        <p class="lede">Ten categories. No filler. Each entry earns its place by being useful to a man building something.</p>
      </div>
    </header>

    <nav class="jfilter reveal" aria-label="Filter by category">
      <button type="button" class="is-on" data-cat="all">All</button>
      {filter_buttons}
    </nav>

{render_jlead(featured)}

    <div class="jgrid reveal reveal-d1" id="jgrid">
{grid_html}
    </div>
    <p class="jempty" id="jempty" hidden>No entries in this category yet.</p>

    <div class="split reveal" style="margin-top:var(--s10);border-top:1px solid var(--rule);padding-top:var(--s7)">
      <p class="pullquote">You don&#8217;t need to be the loudest man in the room.</p>
      <div class="stack">
        <p class="body">Just the one everyone remembers.</p>
        <p class="body">New entries are irregular by design. If it is not worth reading twice, it does not go up.</p>
        <a class="link-under" href="mailto:hello@parispullen.com?subject=The%20Journal">Get told when one lands &#8594;</a>
      </div>
    </div>
  </div>
</section>
</main>
{SITE_FOOT}
<script src="assets/js/journal.js" defer></script>
<script src="assets/js/world.js" defer></script>
</body>
</html>
'''
    with open("journal.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote journal.html")

# ----------------------------------------------------------------------
# journal-<slug>.html article pages
# ----------------------------------------------------------------------
def build_article_pages():
    posts = JOURNAL_POSTS
    n = len(posts)
    for i, post in enumerate(posts):
        prev_post = posts[i - 1]
        next_post = posts[(i + 1) % n]
        html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(post['title'])} &#8212; The Journal &#8212; Paris Pullen</title>
<meta name="description" content="{esc(post['stand'])}">
<meta name="theme-color" content="#0A0A0B">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/world.css">
{ARTICLE_CSS}
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
{SITE_HEADER}
{SITE_MENU}
<main>
<section class="scene scene--pad" style="padding-top:clamp(8rem,20vh,14rem)">
  <div class="wrap wrap--narrow">
    <header class="stack stack--tight reveal">
      <p class="eyebrow">{post['catlabel']} &#183; Vol. {post['vol']} &#183; {post['read']}</p>
      <h1 class="display display--h1">{esc(post['title'])}</h1>
      <p class="lede">{post['stand']}</p>
    </header>

    {hero_html(post, forpage=True)}

    <div class="jread-body reveal reveal-d1">
      {body_html(post)}
    </div>

    <nav class="jread-nav reveal">
      <a class="link-under" href="journal.html">&#8592; Back to the Journal</a>
      <a class="link-under jread-nav__next" href="{article_url(next_post)}">Next &#8212; {esc(next_post['title'])} &#8594;</a>
    </nav>
  </div>
</section>
</main>
{SITE_FOOT}
<script src="assets/js/world.js" defer></script>
</body>
</html>
'''
        fname = article_url(post)
        with open(fname, "w", encoding="utf-8") as f:
            f.write(html)
    print(f"wrote {n} article pages")

if __name__ == "__main__":
    build_journal_index()
    build_article_pages()
