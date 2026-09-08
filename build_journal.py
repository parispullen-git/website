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
    return (str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))

# ----------------------------------------------------------------------
# Category filter list -- trimmed (2026-09-01) to the 7-category system:
# one live article each for Automotive / Style / Business / Music / Film /
# Gaming, plus "Tech" carried in the filter bar with no article yet (an
# honest "nothing here yet" empty state beats silently dropping a category
# the brief explicitly asked for -- see build report).
#
# "Charlotte" added (2026-09-01) as an 8th category for The Gent's Agenda --
# a recurring weekly Charlotte events column. It is different in kind from
# the other seven (a standing column, not a one-off essay), so it gets its
# own category rather than being force-fit under Style or Business.
# ----------------------------------------------------------------------
CATS = [
    ("automotive", "Motors"),
    ("style", "Style"),
    ("timepiece", "Timepiece"),
    ("business", "Business"),
    ("tech", "Tech"),
    ("music", "Music"),
    ("news", "News"),
    ("film", "Film"),
    ("gaming", "Gaming"),
    ("art", "Art"),
    ("sports", "Sports"),
    ("travel", "Travel"),
    ("charlotte", "Charlotte"),
]

def PQ(text):
    """Plain pull-quote -- unattributed, matches the simple .pullquote
    style used site-wide (footers, other pages)."""
    return "PQ::" + text

def PQA(text, name, title=""):
    """Attributed pull-quote -- renders as an offset, bordered block with
    a name/title line underneath, for profile pieces quoting someone by
    name (mirrors the MENWITH "designer pull-quote" pattern). Falls back
    to the plain .pullquote look if no name is given."""
    return "PQA::" + text + "||" + name + "||" + title

def IMG(i):
    """Places images[i] at this point in the body. Two consecutive IMG()
    markers whose images both have layout="pair" render as one side-by-side
    row; any other image (or a lone "pair" with no partner) renders full
    width with its own caption."""
    return "IMG::" + str(i)

def VIDEO(i=None):
    """Places a video embed at this point in the body. With no argument,
    uses the post's single video= field (original behavior). With an
    index, pulls videos[i] instead -- for posts embedding several clips,
    e.g. one trailer per title in a roundup."""
    return "VIDEO::" + ("" if i is None else str(i))

def AGENDA(date, name, venue, note="", price="", link=""):
    """One scannable schedule row -- date/name/venue/price up front, a
    single line of context instead of a full paragraph. Consecutive
    AGENDA() entries in a post's body render as one grouped list rather
    than separate blocks. Use `link` for a real, verified ticket/info URL
    only -- leave blank rather than guess one."""
    return "AGENDA::" + "||".join([date, name, venue, note, price, link])

def SPEC(model, rows, cta_label="", cta_url="", cta_title="", image=None):
    """Two-column spec-data table (engine/power/0-60/etc.), closed out by
    a small image + link card -- mirrors the Bentley-style spec-sheet
    layout. `rows` is a list of (label, value) pairs. `image` indexes
    into the post's images[] for the closing card; leave it None (and
    cta_label blank) to render the table alone with no card."""
    return "SPEC::" + json.dumps({
        "model": model, "rows": rows, "cta_label": cta_label,
        "cta_url": cta_url, "cta_title": cta_title, "image": image,
    })

def TABLE(title, headers, rows):
    """A real (crawlable, no image involved) comparison/reference table --
    for a concept breakdown, a head-to-head, anything with more than two
    columns SPEC()'s label/value rows can't hold. `headers` is a list of
    column labels; `rows` is a list of same-length lists."""
    return "TABLE::" + json.dumps({"title": title, "headers": headers, "rows": rows})

def FORMULA(text):
    """A single short equation/maxim, set big and centered as its own
    full-width beat -- for the one line in a piece meant to be looked at
    rather than read past."""
    return "FORMULA::" + text

# ----------------------------------------------------------------------
# Posts, in reading/vol order. Each dict:
#   slug, cat, catlabel, vol, read, title, stand, featured, wide,
#   hero=dict(img, ext, mode['cover'|'contain'], alt, srcset[bool]),
#   body=[ ...paragraphs, PQ("...") for the pullquote... ]
# ----------------------------------------------------------------------
JOURNAL_POSTS = json.loads((Path(__file__).resolve().parent / "data" / "journal.json").read_text(encoding="utf-8"))
# A post with no "status" field predates the draft/published distinction --
# treat it as already published rather than yanking existing content off
# the site. Only an explicit status:"draft" (set from the Operator Console)
# holds a post back from both the index and its own article page.
PUBLISHED_POSTS = [p for p in JOURNAL_POSTS if p.get("status", "published") != "draft"]

# ----------------------------------------------------------------------
# The Vol. 10 pantry card is intentionally left untouched (see docstring).
# Reproduced verbatim from the existing journal.html.
# ----------------------------------------------------------------------
PANTRY_CARD_HTML = '''      <a class="jcard" data-cat="life" href="pantry.html">
        <div class="jcard__media"><img src="assets/img/room-kitchen@sm.jpg" alt="" loading="lazy"></div>
        <h3 class="jcard__title jcard__title--lead">The Only Standing Order in the Apartment</h3>
        <p class="jcard__cat">Life &#183; HelloFresh &#215; Paris Pullen</p>
      </a>'''

ARTICLE_CSS = '''<style>
  .jread-hero{position:relative;overflow:hidden;border-radius:2px;margin-top:var(--s7);background:var(--charcoal)}
  .jread-hero--cover img{width:100%;height:clamp(260px,42vw,480px);object-fit:cover;display:block;filter:brightness(.82)}
  .jread-hero--contain{display:flex;align-items:center;justify-content:center;padding:var(--s8) var(--s6);
    background:linear-gradient(180deg,var(--charcoal),var(--ink))}
  .jread-hero--contain img{max-height:420px;max-width:100%;width:auto;height:auto;display:block;
    box-shadow:0 30px 80px rgba(0,0,0,.55)}
  .jread-byline{display:flex;flex-wrap:wrap;gap:.55em;align-items:baseline}
  .jread-byline b{color:var(--bone);font-weight:400}
  .jread-body{margin-top:var(--s8);display:grid;gap:var(--s5);max-width:var(--measure)}
  .jread-body .pullquote{margin:var(--s3) 0}
  .jread-nav{margin-top:var(--s10);border-top:1px solid var(--rule);padding-top:var(--s7);
    display:flex;flex-wrap:wrap;gap:var(--s5);justify-content:space-between;align-items:baseline}
  .jread-nav a{color:var(--bone)}
  .jread-nav__next{text-align:right;max-width:32ch}
  .jread-credit{margin-top:var(--s4);font-family:var(--font-mono);font-size:var(--t-micro);
    letter-spacing:.14em;text-transform:uppercase;color:var(--graphite)}

  /* Multiple in-body images (MENWITH-style: stacked pair up top, or a
     single full-width frame), interleaved between text via IMG(). */
  .jread-media{margin-top:var(--s7);max-width:var(--measure)}
  .jread-media--full img{width:100%;height:auto;display:block;border-radius:2px;background:var(--charcoal)}
  .jread-media--full.jread-media--contain{background:linear-gradient(180deg,var(--charcoal),var(--ink));
    display:flex;align-items:center;justify-content:center;padding:var(--s6)}
  .jread-media--full.jread-media--contain img{max-height:420px;width:auto;max-width:100%;
    box-shadow:0 30px 80px rgba(0,0,0,.5)}
  .jread-media--pair{display:grid;grid-template-columns:1fr 1fr;gap:var(--s4);align-items:start}
  .jread-media--pair img{width:100%;height:auto;display:block;
    border-radius:2px;background:var(--charcoal)}
  .jread-caption{margin:.6em 0 0;font-family:var(--font-mono);font-size:var(--t-micro);
    letter-spacing:.03em;color:var(--graphite);line-height:1.4}
  @media (max-width:640px){.jread-media--pair{grid-template-columns:1fr}}

  /* Scheduled agenda list -- date/name/venue/price up front, one line of
     context instead of a paragraph. Grouped runs of AGENDA() entries. */
  .jagenda{margin-top:var(--s7);max-width:var(--measure);border-top:1px solid var(--rule)}
  .jagenda__row{display:grid;grid-template-columns:6.5rem 1fr;gap:var(--s5);
    padding-block:var(--s4);border-bottom:1px solid var(--rule)}
  .jagenda__date{font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.14em;
    text-transform:uppercase;color:var(--brass);padding-top:.2em}
  .jagenda__name{font-family:var(--font-display);font-size:1.15rem;line-height:1.25;margin:0}
  .jagenda__name a{color:inherit;text-decoration:underline;text-decoration-color:var(--rule);
    text-underline-offset:.2em}
  .jagenda__name a:hover{text-decoration-color:var(--brass)}
  .jagenda__meta{font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.04em;
    color:var(--graphite);margin:.35em 0 0}
  .jagenda__note{font-family:var(--font-body);font-size:var(--t-label);color:var(--ash);
    margin:.45em 0 0;line-height:1.5}
  @media (max-width:560px){
    .jagenda__row{grid-template-columns:1fr;gap:.3em}
    .jagenda__date{padding-top:0}
  }

  /* Attributed pull-quote -- offset block with a name/title line, for a
     profile piece quoting someone by name. PQ() (unattributed) still uses
     the plain site-wide .pullquote look above. */
  .jread-pullquote{margin:var(--s7) 0;padding-left:var(--s5);border-left:2px solid var(--brass);max-width:34ch}
  .jread-pullquote p{font-family:var(--font-display);font-size:var(--t-h3);line-height:1.15;
    color:var(--ivory);margin:0;letter-spacing:-.01em}
  .jread-pullquote__attr{margin-top:var(--s3);display:flex;flex-direction:column;gap:.2em}
  .jread-pullquote__name{font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.1em;
    text-transform:uppercase;color:var(--bone)}
  .jread-pullquote__title{font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.04em;
    color:var(--graphite)}

  /* Responsive 16:9 YouTube embed. Same container-query technique as the
     Living Room / Cinema TV screens (assets/css/world.css .tv-modal__frame,
     .floor-scene__screen-frame) -- a container-type:size box holding an
     iframe sized in cqw/cqh -- except this one is a plain fixed aspect-ratio
     box (no oversize-and-crop) since an article embed should never crop
     YouTube's own 16:9 frame. */
  .jread-video{margin-top:var(--s7);max-width:var(--measure)}
  .jread-video__frame{position:relative;aspect-ratio:16/9;background:#000;border-radius:2px;
    overflow:hidden;container-type:size}
  .jread-video__frame iframe{position:absolute;inset:0;width:100cqw;height:100cqh;border:0}

  /* Two-column spec-data table (engine/power/0-60/etc.), closed out by a
     small image+link card -- SPEC(). Mirrors a spec-sheet layout: a dense
     label/value grid for the buyer who wants the numbers, then one clear
     way out to learn more. */
  .jspec{margin-top:var(--s7);max-width:var(--measure);border:1px solid var(--rule);border-radius:2px;overflow:hidden}
  .jspec__model{margin:0;padding:var(--s4) var(--s5);font-family:var(--font-mono);font-size:var(--t-micro);
    letter-spacing:.16em;text-transform:uppercase;color:var(--brass);background:var(--charcoal);
    border-bottom:1px solid var(--rule)}
  .jspec__table{display:grid}
  .jspec__row{display:grid;grid-template-columns:1fr 1fr;gap:var(--s4);padding:var(--s3) var(--s5);
    border-bottom:1px solid var(--rule)}
  .jspec__row:nth-child(odd){background:rgba(255,255,255,.02)}
  .jspec__row:last-child{border-bottom:0}
  .jspec__label{margin:0;font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.08em;
    text-transform:uppercase;color:var(--graphite)}
  .jspec__value{margin:0;font-family:var(--font-body);font-size:var(--t-label);color:var(--ivory);text-align:right}
  .jspec__cta{display:flex;align-items:center;gap:var(--s4);padding:var(--s4) var(--s5);
    border-top:1px solid var(--rule);color:inherit;text-decoration:none}
  a.jspec__cta:hover .jspec__cta-btn{color:var(--obsidian);background:var(--brass);border-color:var(--brass)}
  .jspec__cta-media{flex:0 0 auto;width:64px;height:64px;border-radius:2px;overflow:hidden;background:var(--charcoal)}
  .jspec__cta-media img{width:100%;height:100%;object-fit:cover;display:block}
  .jspec__cta-body{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--s3);flex:1}
  .jspec__cta-title{margin:0;font-family:var(--font-display);font-size:1.05rem;line-height:1.25}
  .jspec__cta-btn{font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.14em;text-transform:uppercase;
    color:var(--brass);border:1px solid var(--brass);padding:.5em 1em;border-radius:1px;white-space:nowrap;
    transition:background .15s,color .15s}
  @media (max-width:560px){.jspec__row{grid-template-columns:1fr;gap:.2em}.jspec__value{text-align:left}}

  /* Comparison/reference tables (TABLE::) and single-line formula
     callouts (FORMULA::) -- the two infographic-style beats a
     concept-heavy piece needs, kept as real text (not an image) so
     they stay crawlable and legible in both column widths. */
  .jtable{margin-top:var(--s7)}
  .jtable__title{margin:0 0 var(--s3);font-family:var(--font-mono);font-size:var(--t-micro);
    letter-spacing:.12em;text-transform:uppercase;color:var(--brass-lit)}
  .jtable__scroll{overflow-x:auto;border:1px solid var(--rule);border-radius:2px}
  .jtable table{width:100%;border-collapse:collapse;min-width:420px}
  .jtable th{text-align:left;padding:var(--s3) var(--s4);font-family:var(--font-mono);
    font-size:var(--t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--brass);
    border-bottom:1px solid var(--rule);white-space:nowrap}
  .jtable td{padding:var(--s3) var(--s4);font-family:var(--font-body);font-size:var(--t-label);
    color:var(--bone);border-bottom:1px solid var(--rule);vertical-align:top}
  .jtable tbody tr:last-child td{border-bottom:0}
  .jtable tbody tr:nth-child(odd){background:rgba(255,255,255,.02)}
  .jtable td:first-child{color:var(--ivory);font-weight:500;white-space:nowrap}
  .jformula{margin:var(--s8) 0;padding:var(--s6) var(--s5);text-align:center;
    font-family:var(--font-display);font-size:clamp(1.25rem,1rem + 1.4vw,2rem);
    color:var(--champagne);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
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

def _sized_img_tag(im, sizes="(max-width:900px) 100vw, 800px"):
    img, ext = im["img"], im["ext"]
    alt = esc(im.get("alt", im.get("caption", "")))
    if im.get("srcset", True):
        src = f'assets/img/{img}@sm.{ext}'
        srcset = f'assets/img/{img}@sm.{ext} 800w, assets/img/{img}.{ext} 1600w'
        return f'<img src="{src}" srcset="{srcset}" sizes="{sizes}" alt="{alt}" loading="lazy">'
    return f'<img src="assets/img/{img}.{ext}" alt="{alt}" loading="lazy">'

def image_full_html(im):
    cap = f'<figcaption class="jread-caption">{esc(im["caption"])}</figcaption>' if im.get("caption") else ""
    contain = " jread-media--contain" if im.get("mode") == "contain" else ""
    tag = _sized_img_tag(im, sizes="(max-width:900px) 100vw, 700px")
    return f'<figure class="jread-media jread-media--full{contain}">{tag}{cap}</figure>'

def image_pair_html(im1, im2):
    figs = []
    for im in (im1, im2):
        cap = f'<figcaption class="jread-caption">{esc(im["caption"])}</figcaption>' if im.get("caption") else ""
        figs.append(f'<figure>{_sized_img_tag(im, sizes="(max-width:640px) 100vw, 350px")}{cap}</figure>')
    return f'<div class="jread-media jread-media--pair">{"".join(figs)}</div>'

def agenda_list_html(items):
    rows = []
    for date, name, venue, note, price, link in items:
        title = f'<a href="{esc(link)}" target="_blank" rel="noopener">{esc(name)}</a>' if link else esc(name)
        meta = esc(venue)
        if price:
            meta += f' &#183; {esc(price)}'
        note_html = f'<p class="jagenda__note">{note}</p>' if note else ""
        rows.append(
            f'<div class="jagenda__row">'
            f'<p class="jagenda__date">{esc(date)}</p>'
            f'<div class="jagenda__body"><p class="jagenda__name">{title}</p>'
            f'<p class="jagenda__meta">{meta}</p>{note_html}</div>'
            f'</div>'
        )
    return f'<div class="jagenda">{"".join(rows)}</div>'

def spec_table_html(data, imgs):
    rows_html = "".join(
        f'<div class="jspec__row"><p class="jspec__label">{esc(label)}</p>'
        f'<p class="jspec__value">{esc(value)}</p></div>'
        for label, value in data["rows"]
    )
    cta_html = ""
    if data.get("cta_label"):
        img_html = ""
        if data.get("image") is not None:
            im = imgs[data["image"]]
            img_html = f'<div class="jspec__cta-media">{_sized_img_tag(im, sizes="120px")}</div>'
        has_link = bool(data.get("cta_url"))
        tag = "a" if has_link else "div"
        link_attr = f' href="{esc(data["cta_url"])}" target="_blank" rel="noopener"' if has_link else ""
        cta_html = (
            f'<{tag} class="jspec__cta"{link_attr}>{img_html}'
            f'<div class="jspec__cta-body">'
            f'<p class="jspec__cta-title">{esc(data.get("cta_title") or data["model"])}</p>'
            f'<span class="jspec__cta-btn">{esc(data["cta_label"])}</span>'
            f'</div></{tag}>'
        )
    return (f'<div class="jspec"><p class="jspec__model">{esc(data["model"])}</p>'
            f'<div class="jspec__table">{rows_html}</div>{cta_html}</div>')

def table_html(data):
    head_html = "".join(f'<th>{esc(h)}</th>' for h in data["headers"])
    body_rows = "".join(
        '<tr>' + "".join(f'<td>{esc(cell)}</td>' for cell in row) + '</tr>'
        for row in data["rows"]
    )
    title_html = f'<p class="jtable__title">{esc(data["title"])}</p>' if data.get("title") else ""
    return (f'<div class="jtable">{title_html}<div class="jtable__scroll"><table>'
            f'<thead><tr>{head_html}</tr></thead><tbody>{body_rows}</tbody>'
            f'</table></div></div>')

def formula_html(text):
    return f'<p class="jformula">{text}</p>'

def pullquote_html(text):
    return f'<p class="pullquote">{text}</p>'

def pullquote_attr_html(text, name, title):
    who = f'<span class="jread-pullquote__name">{esc(name)}</span>'
    if title:
        who += f'<span class="jread-pullquote__title">{esc(title)}</span>'
    return (f'<blockquote class="jread-pullquote"><p>{text}</p>'
            f'<footer class="jread-pullquote__attr">{who}</footer></blockquote>')

def video_html(video):
    if not video:
        return ""
    vid = video["youtube_id"]
    title = esc(video.get("title", ""))
    src = f'https://www.youtube.com/embed/{vid}?rel=0&amp;modestbranding=1&amp;playsinline=1'
    cap = f'<p class="jread-caption">{title}</p>' if title else ""
    return (f'<div class="jread-media jread-video"><div class="jread-video__frame">'
            f'<iframe src="{src}" title="{esc(title)}" loading="lazy" allowfullscreen '
            f'allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>'
            f'</div>{cap}</div>')

def body_html(post):
    """Renders the article body as a sequence of blocks: consecutive plain
    paragraphs/pull-quotes are grouped into .jread-body text columns (kept
    at the article's reading measure), and IMG()/VIDEO() markers break out
    as full-width media blocks between them -- the same "text column,
    full-width media, text column" rhythm the hero already uses relative
    to the rest of the page. Posts with no images/video (most of them)
    render exactly as before: one single .jread-body column.
    """
    body = post["body"]
    imgs = post.get("images", [])
    video = post.get("video")

    segments = []   # list of ("text", [html, ...]) | ("media", html)
    current = []

    def flush():
        if current:
            segments.append(("text", list(current)))
            current.clear()

    i, n = 0, len(body)
    while i < n:
        para = body[i]
        if para.startswith("PQ::"):
            current.append(pullquote_html(para[4:]))
            i += 1
        elif para.startswith("PQA::"):
            quote, pname, ptitle = para[5:].split("||")
            current.append(pullquote_attr_html(quote, pname, ptitle))
            i += 1
        elif para.startswith("IMG::"):
            flush()
            im = imgs[int(para[5:])]
            if (im.get("layout") == "pair" and i + 1 < n
                    and body[i + 1].startswith("IMG::")
                    and imgs[int(body[i + 1][5:])].get("layout") == "pair"):
                im2 = imgs[int(body[i + 1][5:])]
                segments.append(("media", image_pair_html(im, im2)))
                i += 2
            else:
                segments.append(("media", image_full_html(im)))
                i += 1
        elif para.startswith("VIDEO::"):
            flush()
            idx = para[7:]
            v = post.get("videos", [])[int(idx)] if idx else video
            segments.append(("media", video_html(v)))
            i += 1
        elif para.startswith("AGENDA::"):
            flush()
            items = []
            while i < n and body[i].startswith("AGENDA::"):
                items.append(body[i][8:].split("||"))
                i += 1
            segments.append(("media", agenda_list_html(items)))
        elif para.startswith("SPEC::"):
            flush()
            data = json.loads(para[6:])
            segments.append(("media", spec_table_html(data, imgs)))
            i += 1
        elif para.startswith("TABLE::"):
            flush()
            data = json.loads(para[7:])
            segments.append(("media", table_html(data)))
            i += 1
        elif para.startswith("FORMULA::"):
            flush()
            segments.append(("media", formula_html(para[9:])))
            i += 1
        else:
            current.append(f'<p class="body">{para}</p>')
            i += 1
    flush()

    out = []
    first = True
    for kind, content in segments:
        if kind == "text":
            cls = "jread-body reveal reveal-d1" if first else "jread-body"
            out.append(f'<div class="{cls}">\n      ' + "\n      ".join(content) + '\n    </div>')
        else:
            out.append(content)
        first = False
    return "\n\n    ".join(out)

def article_url(post):
    return f'journal-{post["slug"]}.html'

def render_jcard(post):
    """Grid card: image, headline, category -- in that order. The
    standfirst and vol/read line are deliberately left off the card so a
    row of four reads as a clean index rather than four paragraphs."""
    wide = " jcard--wide" if post.get("wide") else ""
    return f'''      <a class="jcard{wide}" data-cat="{post['cat']}" data-slug="{post['slug']}" href="{article_url(post)}">
        <div class="jcard__media"><img src="assets/img/{post['hero']['img']}@sm.{post['hero']['ext']}" alt="" loading="lazy"></div>
        <h3 class="jcard__title jcard__title--lead">{esc(post['title'])}</h3>
        <p class="jcard__cat">{post['catlabel']}</p>
      </a>'''

def render_jhero(posts):
    """Full-bleed carousel across the top -- the most recent few stories,
    one at a time, crossfaded by assets/js/journal.js."""
    slides = []
    for i, post in enumerate(posts):
        h = post["hero"]
        on = " is-on" if i == 0 else ""
        slides.append(f'''    <div class="jhero__slide{on}" data-jhero-slide>
      <img src="assets/img/{h['img']}.{h['ext']}" srcset="assets/img/{h['img']}@sm.{h['ext']} 960w, assets/img/{h['img']}.{h['ext']} 2000w" sizes="100vw" alt="{esc(h.get('alt',''))}" {'loading="eager"' if i == 0 else 'loading="lazy"'}>
      <div class="jhero__scrim"></div>
      <div class="jhero__inner">
        <div class="wrap">
          <a class="jhero__link" href="{article_url(post)}">
            <p class="jhero__cat">{post['catlabel']}</p>
            <h2 class="jhero__title">{esc(post['title'])}</h2>
            <p class="jhero__stand">{post['stand']}</p>
            <p class="jhero__by">By Paris Pullen &#183; {post['read']}</p>
          </a>
        </div>
      </div>
    </div>''')
    dots = "\n".join(
        f'      <button type="button" class="jhero__dot{" is-on" if i == 0 else ""}" data-jhero-dot="{i}" aria-label="Story {i+1}"></button>'
        for i in range(len(posts))
    )
    return f'''  <section class="jhero" id="jhero" aria-label="Featured stories">
{chr(10).join(slides)}
    <div class="jhero__dots">
{dots}
    </div>
  </section>'''

def render_jpick(post):
    h = post["hero"]
    return f'''    <a class="jpick reveal" href="{article_url(post)}">
      <div class="jpick__media">
        <img src="assets/img/{h['img']}@sm.{h['ext']}" srcset="assets/img/{h['img']}@sm.{h['ext']} 960w, assets/img/{h['img']}.{h['ext']} 2000w" sizes="(max-width:820px) 100vw, 50vw" alt="" loading="lazy">
      </div>
      <div>
        <p class="jpick__cat">{post['catlabel']}</p>
        <h2 class="jpick__title">{esc(post['title'])}</h2>
        <p class="jpick__stand">{post['stand']}</p>
        <p class="jpick__foot"><span>By Paris Pullen</span><span>{post['read']}</span></p>
        <p class="jpick__cta">Read the full story <span aria-hidden="true">&#8594;</span></p>
      </div>
    </a>'''

# ----------------------------------------------------------------------
# journal.html
# ----------------------------------------------------------------------
def build_journal_index():
    featured_candidates = [p for p in PUBLISHED_POSTS if p.get("featured")]
    # A featured post that gets drafted (or the featured flag never set on
    # any published post) shouldn't crash the build -- fall back to
    # whatever's currently newest.
    featured = featured_candidates[0] if featured_candidates else PUBLISHED_POSTS[0]

    def vol_key(p):
        try:
            return int(str(p.get("vol", "0")).strip())
        except ValueError:
            return 0

    # The carousel takes the three newest stories other than the editor's
    # pick, so the top of the page never shows the same story twice. The
    # grid below still carries everything, including both -- it's the
    # filterable index, and category filtering has to be complete.
    by_recency = sorted(PUBLISHED_POSTS, key=vol_key, reverse=True)
    hero_posts = [p for p in by_recency if p is not featured][:3]
    grid_posts = by_recency

    filter_buttons = "\n      ".join(
        f'<button type="button" data-cat="{slug}">{label}</button>' for slug, label in CATS
    )

    grid_html = "\n".join(render_jcard(p) for p in grid_posts) + "\n" + PANTRY_CARD_HTML

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
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
{render_jhero(hero_posts)}
<section class="scene scene--pad" style="padding-top:clamp(3rem,7vh,5rem)">
  <div class="wrap">
    <header class="split reveal" style="align-items:end;margin-bottom:var(--s6)">
      <div class="stack stack--tight">
        <p class="eyebrow">The Gentleman&#8217;s Journal</p>
        <h1 class="display display--h2">The Journal</h1>
      </div>
      <div class="stack">
        <p class="lede">No filler. Each entry earns its place by being useful to a man building something.</p>
      </div>
    </header>

    <nav class="jfilter reveal" aria-label="Filter by category">
      <button type="button" class="is-on" data-cat="all">All</button>
      {filter_buttons}
    </nav>

    <div class="jsection reveal" style="margin-top:var(--s8)">
      <span class="jsection__label">Latest Stories</span>
    </div>

    <div class="jgrid" id="jgrid">
{grid_html}
    </div>
    <p class="jempty" id="jempty" hidden>No entries in this category yet.</p>

    <div class="jsection reveal" style="margin-top:var(--s10)">
      <span class="jsection__label">Editor&#8217;s Pick</span>
    </div>
{render_jpick(featured)}

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
    posts = PUBLISHED_POSTS
    n = len(posts)
    for i, post in enumerate(posts):
        prev_post = posts[i - 1]
        next_post = posts[(i + 1) % n]
        html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(post['title'])} &#8212; The Journal &#8212; Paris Pullen</title>
<meta name="description" content="{esc(post.get('meta_description', post['stand']))}">
<link rel="canonical" href="https://parispullen.com/{article_url(post)}">
<meta property="og:title" content="{esc(post['title'])}">
<meta property="og:description" content="{esc(post.get('meta_description', post['stand']))}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://parispullen.com/{article_url(post)}">
<meta property="og:image" content="https://parispullen.com/assets/img/{post['hero']['img']}.{post['hero']['ext']}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(post['title'])}">
<meta name="twitter:description" content="{esc(post.get('meta_description', post['stand']))}">
<meta name="twitter:image" content="https://parispullen.com/assets/img/{post['hero']['img']}.{post['hero']['ext']}">
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
      <p class="eyebrow jread-byline">By <b>Paris Pullen</b> &#183; {post['catlabel']} &#183; {post['read']}</p>
      <h1 class="display display--h1">{esc(post['title'])}</h1>
      <p class="lede">{post['stand']}</p>
    </header>

    {hero_html(post, forpage=True)}

    {body_html(post)}

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

    # A post that gets drafted (or deleted) after having been published once
    # already has a page sitting on disk -- unlinked from the index, but
    # still a live, fetchable URL until its file is actually removed.
    # journal-post.html itself is a generic ?slug=-driven template for the
    # separate dashboard.html/journal.js runtime posting system, not one of
    # this script's own per-slug pages -- never sweep it up here.
    live_urls = {article_url(p) for p in posts} | {"journal-post.html"}
    removed = 0
    for existing in Path(__file__).resolve().parent.glob("journal-*.html"):
        if existing.name not in live_urls:
            existing.unlink()
            removed += 1
    print(f"wrote {n} article pages" + (f", removed {removed} stale one(s)" if removed else ""))

if __name__ == "__main__":
    build_journal_index()
    build_article_pages()
