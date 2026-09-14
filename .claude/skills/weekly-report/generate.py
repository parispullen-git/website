#!/usr/bin/env python3
"""
Weekly Report slide generator for parispullen.com.

Builds a cover slide + one slide per Journal post + a closing "how to
navigate" slide (a real screenshot of the live journal.html grid with a
"tap here" pointer at the JOURNAL nav item), in either 4:5 feed-carousel
format (1080x1350) or 9:16 Stories format (1080x1920), matching the
site's own visual language (Playfair Display + Inter, ink/charcoal/brass
palette pulled straight from assets/css/world.css).

Usage:
    python3 generate.py --config week.json --format carousel --out /path/to/out
    python3 generate.py --config week.json --format story --out /path/to/out
    python3 generate.py --config week.json --format both --out /path/to/out

Requires:
    - The site's local preview server running (python3 -m http.server 4330,
      or `preview_start name:"parispullen"` from Claude Code) so the closing
      slide can screenshot the real, current journal.html.
    - Google Chrome installed at the default macOS path (used headless for
      both the site screenshot and the slide rendering -- no other deps).

Config file shape (see week.example.json in this folder):
{
  "site_url": "http://localhost:4330",         // optional, this is the default
  "cover": {
    "eyebrow": "The Weekly Report",
    "headline_html": "Four things<br>worth your<br><em>attention</em><br>this week.",
    "sub": "One sentence per story, roughly, stitched into one line."
  },
  "posts": [
    { "slug": "iphone-18-pro-duo-what-changed", "headline": "iPhone 18 Pro, Pro Max & Duo", "focal": "center 30%" },
    ...
  ],
  "nav": {
    "eyebrow": "Find All Four",
    "headline": "Open Journal on parispullen.com",
    "sub": "Every story above is live right now -- tap Journal in the top nav, or follow the link in bio."
  }
}

`headline` and `focal` per post are optional -- headline defaults to the
post's title split at the first ":" (falls back to the full title), focal
defaults to "center". Add `headline`/`focal` overrides whenever the auto
title is too long for a slide or the hero image needs recentering (a face
near an edge, a triptych where one panel reads best, etc).
"""
import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

FORMATS = {
    "carousel": {"w": 1080, "h": 1350},
    "story": {"w": 1080, "h": 1920},
}

# The real brand mark (assets/img/monogram-mark.svg): an interlocking
# double-P, the same one the live site masks white (--foxx-color:#fff) at
# 32px wide, aspect-ratio 240/208, next to "Paris Pullen" in the header
# nav and the gate. Inlined here (fill swapped to ivory) instead of the
# placeholder circled "P" a slide-only mark would otherwise need.
_MONOGRAM_SVG = open(os.path.join(REPO, "assets", "img", "monogram-mark.svg")).read()
MONOGRAM_INNER = _MONOGRAM_SVG.split(">", 1)[1].rsplit("</svg>", 1)[0].replace('fill="#000"', 'fill="#F3F0EA"')
WORDMARK_HTML = (
    f'<div class="wordmark"><span class="mark">'
    f'<svg viewBox="0 0 240 208">{MONOGRAM_INNER}</svg>'
    f'</span>PARIS PULLEN</div>'
)

BASE_CSS_TMPL = """
* {{ margin:0; padding:0; box-sizing:border-box; }}
html,body {{ width:{w}px; height:{h}px; overflow:hidden; background:#101012; }}
body {{ font-family:'Inter',sans-serif; color:#F3F0EA; position:relative; }}
.wordmark {{ position:absolute; top:{top_pad}px; left:{side_pad}px;
  font-family:'Inter',sans-serif; font-weight:500; font-size:{wm_size}px;
  letter-spacing:.22em; text-transform:uppercase; color:#F3F0EA;
  display:flex; align-items:center; gap:14px; }}
.wordmark .mark {{ width:{mark}px; aspect-ratio:240/208; display:block; flex-shrink:0; }}
.wordmark .mark svg {{ width:100%; height:100%; display:block; }}
.tag {{ position:absolute; top:{top_pad2}px; right:{side_pad}px;
  font-family:ui-monospace,Menlo,monospace; font-size:{tag_size}px; letter-spacing:.14em;
  text-transform:uppercase; color:#A8874E; text-align:right; }}
.taphere-top {{ position:absolute; top:{taphere_top}px; right:{side_pad}px;
  display:flex; flex-direction:column; align-items:flex-end; gap:8px; }}
.taphere-top .lbl {{ font-family:ui-monospace,Menlo,monospace; font-size:{tag_size}px; letter-spacing:.14em;
  text-transform:uppercase; color:#C9A961; }}
"""

def base_css(w, h):
    # +20px on the top row and the footer/bottom row (below) keeps text
    # clear of Instagram/TikTok Stories' own overlay chrome -- the
    # profile-pic/close-button strip at the very top and the reply-bar
    # strip at the very bottom -- on 9:16 only; carousel has no such
    # overlay to dodge.
    tall = h > 1600
    top_pad = (108 if tall else 64)
    top_pad2 = (114 if tall else 70)
    return BASE_CSS_TMPL.format(
        w=w, h=h,
        top_pad=top_pad,
        top_pad2=top_pad2,
        taphere_top=top_pad2 + 40,
        side_pad=(72 if tall else 64),
        wm_size=(24 if tall else 22),
        mark=(40 if tall else 36),
        tag_size=(16 if tall else 15),
    )

def html_doc(css, body):
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>{css}</style>
</head><body>{body}</body></html>"""

def cover_slide(cfg, w, h):
    tall = h > 1600
    css = base_css(w, h) + f"""
    body {{ background:linear-gradient(160deg,#17171A 0%,#101012 55%,#0A0A0B 100%); }}
    .field {{ position:absolute; left:0; right:0; {'top:46%; transform:translateY(-50%);' if tall else 'top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;'} padding:0 {96 if not tall else 96}px; }}
    .eyebrow {{ font-family:ui-monospace,Menlo,monospace; font-size:{19 if tall else 18}px; letter-spacing:.28em; text-transform:uppercase; color:#A8874E; margin-bottom:{32 if tall else 28}px; }}
    .headline {{ font-family:'Playfair Display',serif; font-weight:500; font-size:{96 if tall else 92}px; line-height:1.06; letter-spacing:-.01em; color:#F3F0EA; }}
    .headline em {{ font-style:italic; color:#C9A961; }}
    .sub {{ margin-top:{44 if tall else 36}px; font-size:{29 if tall else 26}px; line-height:1.58; color:#DBD5C9; max-width:840px; font-weight:300; }}
    .rule {{ position:absolute; left:96px; right:96px; bottom:{270 if tall else 150}px; height:1px; background:rgba(219,213,201,.18); }}
    .foot {{ position:absolute; left:96px; right:96px; bottom:{190 if tall else 96}px; display:flex; justify-content:space-between; align-items:baseline;
      font-family:ui-monospace,Menlo,monospace; font-size:{16 if tall else 15}px; letter-spacing:.14em; text-transform:uppercase; color:#71717C; }}
    """
    c = cfg["cover"]
    body = f"""
    {WORDMARK_HTML}
    <div class="tag">THE JOURNAL</div>
    <div class="field">
      <div class="eyebrow">{c.get('eyebrow', 'The Weekly Report')}</div>
      <div class="headline">{c['headline_html']}</div>
      <div class="sub">{c['sub']}</div>
    </div>
    <div class="rule"></div>
    <div class="foot"><span>PARISPULLEN.COM</span><span>01 / {cfg['_total']:02d}</span></div>
    """
    return html_doc(css, body)

def story_slide(post, img, cat, headline, hook, idx, total, w, h, focal="center"):
    tall = h > 1600
    css = base_css(w, h) + f"""
    .bg {{ position:absolute; inset:0; background:url('file://{REPO}/assets/img/{img}.jpg') {focal}/cover no-repeat; }}
    .scrim {{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(16,16,18,.12) 0%, rgba(16,16,18,.2) {'38%' if not tall else '30%'}, rgba(10,10,11,{'.94' if not tall else '.72'}) {'82%' if not tall else '62%'}, rgba(10,10,11,.97) {'92%' if not tall else '80%'}, #0A0A0B 100%); }}
    .field {{ position:absolute; left:0; right:0; bottom:0; padding:0 {80 if tall else 88}px {320 if tall else 120}px; }}
    .cat {{ font-family:ui-monospace,Menlo,monospace; font-size:{18 if tall else 17}px; letter-spacing:.24em; text-transform:uppercase; color:#C9A961; margin-bottom:{26 if tall else 24}px; }}
    .headline {{ font-family:'Playfair Display',serif; font-weight:500; font-size:{72 if tall else 68}px; line-height:1.08; letter-spacing:-.01em; color:#F3F0EA; max-width:920px; }}
    .hook {{ margin-top:{32 if tall else 28}px; font-size:{27 if tall else 25}px; line-height:1.5; color:#DBD5C9; max-width:860px; font-weight:300; }}
    .cta {{ margin-top:{46 if tall else 40}px; font-family:ui-monospace,Menlo,monospace; font-size:{16 if tall else 15}px; letter-spacing:.14em; text-transform:uppercase; color:#A8874E; }}
    .foot {{ position:absolute; left:{80 if tall else 88}px; right:{80 if tall else 88}px; bottom:{190 if tall else 52}px; display:flex; justify-content:space-between; align-items:baseline;
      font-family:ui-monospace,Menlo,monospace; font-size:{15 if tall else 14}px; letter-spacing:.14em; text-transform:uppercase; color:#71717C; }}
    """
    # Story format (9:16) puts "TAP HERE" + a downward arrow up in the
    # top-right corner, right under the "THE WEEKLY REPORT" tag -- that's
    # where the link sticker goes once this is posted to Stories/TikTok
    # (Instagram/TikTok don't support a real embedded link in the image
    # itself, so the arrow just marks the spot; the link gets added by
    # hand at posting time). Top-right instead of down by the text block:
    # it stays clear of the bottom reply-bar overlay entirely, and reads
    # as its own callout rather than competing with the headline/hook.
    # Carousel format keeps the plain "Read the full story" CTA line in
    # the text column instead -- a feed carousel's own swipe gesture is
    # the navigation, there's no link sticker to place.
    taphere_block = """
    <div class="taphere-top">
      <span class="lbl">Tap here</span>
      <svg width="30" height="34" viewBox="0 0 30 34" fill="none"><path d="M15 2V26" stroke="#C9A961" stroke-width="2.5" stroke-linecap="round"/><path d="M5 18L15 28L25 18" stroke="#C9A961" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
    </div>
    """ if tall else ""
    cta_block = "" if tall else '<div class="cta">Read the full story &#8594;</div>'
    body = f"""
    <div class="bg"></div><div class="scrim"></div>
    {WORDMARK_HTML}
    <div class="tag">THE WEEKLY REPORT</div>
    {taphere_block}
    <div class="field">
      <div class="cat">{cat}</div>
      <div class="headline">{headline}</div>
      <div class="hook">{hook}</div>
      {cta_block}
    </div>
    <div class="foot"><span>PARISPULLEN.COM/JOURNAL</span><span>{idx:02d} / {total:02d}</span></div>
    """
    return html_doc(css, body)

def nav_slide(cfg, shot_path, idx, total, w, h):
    tall = h > 1600
    css = base_css(w, h) + f"""
    .bg {{ position:absolute; top:0; left:0; width:{w}px; height:{h}px;
      background:url('file://{shot_path}') top/{w}px auto no-repeat; }}
    .scrim {{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(10,10,11,.2) 0%, rgba(10,10,11,{'.35' if not tall else '.35'}) {'40%' if not tall else '32%'}, rgba(10,10,11,{'.55' if not tall else '.85'}) {'70%' if not tall else '62%'}, #0A0A0B {'88%' if not tall else '84%'}); }}
    .field {{ position:absolute; left:0; right:0; bottom:0; padding:0 {80 if tall else 88}px {320 if tall else 130}px; }}
    .eyebrow {{ font-family:ui-monospace,Menlo,monospace; font-size:{18 if tall else 17}px; letter-spacing:.24em; text-transform:uppercase; color:#A8874E; margin-bottom:{26 if tall else 22}px; }}
    .headline {{ font-family:'Playfair Display',serif; font-weight:500; font-size:{62 if tall else 58}px; line-height:1.15; color:#F3F0EA; max-width:900px; }}
    .sub {{ margin-top:{30 if tall else 26}px; font-size:{26 if tall else 24}px; line-height:1.55; color:#DBD5C9; max-width:820px; font-weight:300; }}
    .pointer {{ position:absolute; top:{130 if tall else 96}px; right:{120 if tall else 130}px; display:flex; flex-direction:column; align-items:flex-end; gap:8px; }}
    .pointer .lbl {{ font-family:ui-monospace,Menlo,monospace; font-size:{16 if tall else 15}px; letter-spacing:.14em; text-transform:uppercase; color:#C9A961; }}
    .pointer svg {{ transform:scaleX(-1) rotate(8deg); }}
    .foot {{ position:absolute; left:{80 if tall else 88}px; right:{80 if tall else 88}px; bottom:{190 if tall else 52}px; display:flex; justify-content:space-between; align-items:baseline;
      font-family:ui-monospace,Menlo,monospace; font-size:{15 if tall else 14}px; letter-spacing:.14em; text-transform:uppercase; color:#71717C; }}
    """
    n = cfg["nav"]
    body = f"""
    <div class="bg"></div><div class="scrim"></div>
    <div class="pointer">
      <span class="lbl">Tap here</span>
      <svg width="76" height="54" viewBox="0 0 70 50" fill="none"><path d="M65 8C45 8 20 18 8 42" stroke="#C9A961" stroke-width="2.5" stroke-linecap="round"/><path d="M8 26L8 42L24 40" stroke="#C9A961" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
    </div>
    <div class="field">
      <div class="eyebrow">{n.get('eyebrow', 'Find All Four')}</div>
      <div class="headline">{n['headline']}</div>
      <div class="sub">{n['sub']}</div>
    </div>
    <div class="foot"><span>@PARISPULLEN</span><span>{idx:02d} / {total:02d}</span></div>
    """
    return html_doc(css, body)

def chrome_screenshot(url_or_file, w, h, out_path):
    subprocess.run([
        CHROME, "--headless", "--disable-gpu", f"--window-size={w},{h}",
        f"--screenshot={out_path}", url_or_file,
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def wait_for_server(url, tries=5):
    for _ in range(tries):
        try:
            urllib.request.urlopen(url, timeout=2)
            return True
        except Exception:
            time.sleep(1)
    return False

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--format", choices=["carousel", "story", "both"], default="both")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    cfg = json.load(open(args.config))
    site_url = cfg.get("site_url", "http://localhost:4330")
    journal_url = site_url.rstrip("/") + "/journal.html"

    if not wait_for_server(journal_url):
        print(f"ERROR: can't reach {journal_url}. Start the local preview server first "
              f"(python3 -m http.server 4330, or preview_start name:\"parispullen\").", file=sys.stderr)
        sys.exit(1)

    posts_data = json.load(open(os.path.join(REPO, "data", "journal.json")))
    by_slug = {p["slug"]: p for p in posts_data}

    total = len(cfg["posts"]) + 2  # cover + posts + nav
    cfg["_total"] = total

    formats = ["carousel", "story"] if args.format == "both" else [args.format]

    work_dir = os.path.join(args.out, "_build")
    os.makedirs(work_dir, exist_ok=True)

    for fmt in formats:
        w, h = FORMATS[fmt]["w"], FORMATS[fmt]["h"]
        fmt_dir = os.path.join(args.out, fmt)
        os.makedirs(fmt_dir, exist_ok=True)

        # Screenshot the live journal grid once per format (exact pixel size)
        nav_shot = os.path.join(work_dir, f"nav-shot-{fmt}.png")
        chrome_screenshot(journal_url, w, h, nav_shot)

        slides = []
        slides.append(("1-cover", cover_slide(cfg, w, h)))
        for i, p in enumerate(cfg["posts"], start=2):
            rec = by_slug.get(p["slug"])
            if not rec:
                print(f"WARNING: slug not found in data/journal.json: {p['slug']}", file=sys.stderr)
                continue
            headline = p.get("headline") or (rec["title"].split(":")[0] if ":" in rec["title"] else rec["title"])
            hook = p.get("hook", rec.get("stand", ""))
            cat = rec.get("catlabel", "")
            # image_override: use one of the post's inline images[] (by its
            # "img" value) instead of the article hero -- handy when the
            # hero is a multi-panel/triptych shot that crops awkwardly on a
            # single-subject slide (a solo portrait from images[] often
            # reads better than a group hero once it's cropped to 4:5/9:16).
            img = p.get("image_override") or rec["hero"]["img"]
            focal = p.get("focal", "center")
            slides.append((f"{i}-{p['slug']}", story_slide(p, img, cat, headline, hook, i, total, w, h, focal)))
        slides.append((f"{total}-navigate", nav_slide(cfg, nav_shot, total, total, w, h)))

        for name, html in slides:
            html_path = os.path.join(work_dir, f"{fmt}-{name}.html")
            with open(html_path, "w") as f:
                f.write(html)
            png_path = os.path.join(fmt_dir, f"{name}.png")
            chrome_screenshot(f"file://{html_path}", w, h, png_path)
            print(f"wrote {png_path}")

    print(f"\nDone. {total} slides x {len(formats)} format(s) in {args.out}")

if __name__ == "__main__":
    main()
