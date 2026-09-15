#!/usr/bin/env python3
"""
"What is parispullen.com?" explainer carousel generator.

A third content shape in this skill: a site-orientation carousel — cover,
one slide per major section of the site, and a closing "start here" slide
-- instead of recapping Journal posts (weekly-report/generate.py) or
promoting a single entry (generate_beats.py). Each section slide uses a
REAL screenshot of that section's live page as its background (captured
fresh each run, same headless-Chrome technique as the other two
generators' closing slide), so the carousel always shows what the site
actually looks like right now, not a stock mockup.

Usage:
    python3 generate_explainer.py --config explainer.json --format both --out /path/to/out

Config shape (see explainer.example.json in this folder):
{
  "site_url": "http://localhost:4330",
  "cover": { "eyebrow": "...", "headline_html": "...", "sub": "..." },
  "sections": [
    {
      "key": "penthouse", "url_path": "house.html",
      "eyebrow": "01 -- The Penthouse", "headline": "My home, room by room.",
      "sub": "...", "focal": "center", "capture_height": null
    },
    ...
  ],
  "closing": {
    "url_path": "journal.html", "pointer_at": "top-right",
    "eyebrow": "Start Here", "headline": "Open parispullen.com",
    "sub": "..."
  }
}

`capture_height` (optional, per section) captures the page taller than the
slide format and lets `focal` (a CSS background-position value) crop into
the cleanest part of it -- useful when a page's own hero text would
otherwise land inside the frame and clash with this carousel's overlay
text (this is why the Charlotte guide section captures at height 2400
instead of the slide's own height, so `focal: "center 100%"` can crop
past its hero copy into the city map below).
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate import (
    REPO, FORMATS, WORDMARK_HTML, base_css, html_doc, chrome_screenshot,
    wait_for_server, cover_slide,
)

def section_slide(sec, img_path, idx, total, w, h):
    tall = h > 1600
    focal = sec.get("focal", "center")
    css = base_css(w, h) + f"""
    .bg {{ position:absolute; inset:0; background:url('file://{img_path}') {focal}/cover no-repeat; }}
    .scrim {{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(16,16,18,.12) 0%, rgba(16,16,18,.2) {'30%' if tall else '38%'}, rgba(10,10,11,{'.72' if tall else '.94'}) {'62%' if tall else '82%'}, rgba(10,10,11,.97) {'80%' if tall else '92%'}, #0A0A0B 100%); }}
    .topscrim {{ position:absolute; top:0; left:0; right:0; height:{300 if tall else 240}px;
      background:linear-gradient(180deg, rgba(10,10,11,.95) 0%, rgba(10,10,11,.85) 40%, rgba(10,10,11,0) 100%); }}
    .field {{ position:absolute; left:0; right:0; bottom:0; padding:0 {80 if tall else 88}px {320 if tall else 120}px; }}
    .beat-label {{ font-family:ui-monospace,Menlo,monospace; font-size:{18 if tall else 17}px; letter-spacing:.24em;
      text-transform:uppercase; color:#C9A961; margin-bottom:{28 if tall else 24}px; }}
    .beat-text {{ font-family:'Playfair Display',serif; font-weight:500; font-size:{62 if tall else 56}px;
      line-height:1.15; letter-spacing:-.005em; color:#F3F0EA; max-width:900px; }}
    .sub {{ margin-top:{28 if tall else 24}px; font-size:{25 if tall else 23}px; line-height:1.5; color:#DBD5C9;
      max-width:820px; font-weight:300; }}
    .foot {{ position:absolute; left:{80 if tall else 88}px; right:{80 if tall else 88}px; bottom:{190 if tall else 52}px;
      display:flex; justify-content:space-between; align-items:baseline;
      font-family:ui-monospace,Menlo,monospace; font-size:{15 if tall else 14}px; letter-spacing:.14em;
      text-transform:uppercase; color:#71717C; }}
    """
    body = f"""
    <div class="bg"></div><div class="scrim"></div><div class="topscrim"></div>
    {WORDMARK_HTML}
    <div class="tag">PARISPULLEN.COM</div>
    <div class="field">
      <div class="beat-label">{sec['eyebrow']}</div>
      <div class="beat-text">{sec['headline']}</div>
      <div class="sub">{sec['sub']}</div>
    </div>
    <div class="foot"><span>THE WORLD, EXPLAINED</span><span>{idx:02d} / {total:02d}</span></div>
    """
    return html_doc(css, body)

def closing_slide(cfg_closing, img_path, idx, total, w, h):
    tall = h > 1600
    css = base_css(w, h) + f"""
    .bg {{ position:absolute; top:0; left:0; width:{w}px; height:{h}px; background:url('file://{img_path}') top/{w}px auto no-repeat; }}
    .scrim {{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(10,10,11,.2) 0%, rgba(10,10,11,.35) {'32%' if tall else '40%'}, rgba(10,10,11,{'.85' if tall else '.55'}) {'62%' if tall else '70%'}, #0A0A0B {'84%' if tall else '88%'}); }}
    .field {{ position:absolute; left:0; right:0; bottom:0; padding:0 {80 if tall else 88}px {320 if tall else 130}px; }}
    .eyebrow {{ font-family:ui-monospace,Menlo,monospace; font-size:{18 if tall else 17}px; letter-spacing:.24em; text-transform:uppercase; color:#A8874E; margin-bottom:{26 if tall else 22}px; }}
    .headline {{ font-family:'Playfair Display',serif; font-weight:500; font-size:{62 if tall else 58}px; line-height:1.15; color:#F3F0EA; max-width:900px; }}
    .sub {{ margin-top:{30 if tall else 26}px; font-size:{26 if tall else 24}px; line-height:1.55; color:#DBD5C9; max-width:820px; font-weight:300; }}
    .pointer {{ position:absolute; top:{130 if tall else 96}px; right:{120 if tall else 130}px; display:flex; flex-direction:column; align-items:flex-end; gap:8px; }}
    .pointer .lbl {{ font-family:ui-monospace,Menlo,monospace; font-size:{16 if tall else 15}px; letter-spacing:.14em; text-transform:uppercase; color:#C9A961; }}
    .pointer svg {{ transform:scaleX(-1) rotate(8deg); }}
    .foot {{ position:absolute; left:{80 if tall else 88}px; right:{80 if tall else 88}px; bottom:{190 if tall else 52}px;
      display:flex; justify-content:space-between; align-items:baseline;
      font-family:ui-monospace,Menlo,monospace; font-size:{15 if tall else 14}px; letter-spacing:.14em; text-transform:uppercase; color:#71717C; }}
    """
    body = f"""
    <div class="bg"></div><div class="scrim"></div>
    <div class="pointer">
      <span class="lbl">Tap here</span>
      <svg width="76" height="54" viewBox="0 0 70 50" fill="none"><path d="M65 8C45 8 20 18 8 42" stroke="#C9A961" stroke-width="2.5" stroke-linecap="round"/><path d="M8 26L8 42L24 40" stroke="#C9A961" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
    </div>
    <div class="field">
      <div class="eyebrow">{cfg_closing.get('eyebrow', 'Start Here')}</div>
      <div class="headline">{cfg_closing['headline']}</div>
      <div class="sub">{cfg_closing['sub']}</div>
    </div>
    <div class="foot"><span>@PARISPULLEN</span><span>{idx:02d} / {total:02d}</span></div>
    """
    return html_doc(css, body)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--format", choices=["carousel", "story", "both"], default="both")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    cfg = json.load(open(args.config))
    site_url = cfg.get("site_url", "http://localhost:4330").rstrip("/")

    if not wait_for_server(site_url + "/journal.html"):
        print(f"ERROR: can't reach {site_url}. Start the local preview server first.", file=sys.stderr)
        sys.exit(1)

    total = len(cfg["sections"]) + 2  # cover + sections + closing
    formats = ["carousel", "story"] if args.format == "both" else [args.format]

    for fmt in formats:
        w, h = FORMATS[fmt]["w"], FORMATS[fmt]["h"]
        fmt_dir = os.path.join(args.out, fmt)
        os.makedirs(fmt_dir, exist_ok=True)
        work_dir = os.path.join(args.out, "_build")
        os.makedirs(work_dir, exist_ok=True)

        # Cover (reuses weekly-report's cover_slide -- no photo, same gradient look)
        mini_cfg = {"cover": cfg["cover"], "_total": total}
        html = cover_slide(mini_cfg, w, h)
        html_path = os.path.join(work_dir, f"{fmt}-1-cover.html")
        open(html_path, "w").write(html)
        chrome_screenshot(f"file://{html_path}", w, h, os.path.join(fmt_dir, "1-cover.png"))
        print(f"wrote {fmt_dir}/1-cover.png")

        for i, sec in enumerate(cfg["sections"], start=2):
            cap_h = sec.get("capture_height") or h
            shot_path = os.path.join(work_dir, f"{fmt}-shot-{sec['key']}.png")
            chrome_screenshot(site_url + "/" + sec["url_path"], w, cap_h, shot_path)
            html = section_slide(sec, shot_path, i, total, w, h)
            html_path = os.path.join(work_dir, f"{fmt}-{i}-{sec['key']}.html")
            open(html_path, "w").write(html)
            png_path = os.path.join(fmt_dir, f"{i}-{sec['key']}.png")
            chrome_screenshot(f"file://{html_path}", w, h, png_path)
            print(f"wrote {png_path}")

        c = cfg["closing"]
        shot_path = os.path.join(work_dir, f"{fmt}-shot-closing.png")
        chrome_screenshot(site_url + "/" + c["url_path"], w, h, shot_path)
        html = closing_slide(c, shot_path, total, total, w, h)
        html_path = os.path.join(work_dir, f"{fmt}-{total}-closing.html")
        open(html_path, "w").write(html)
        chrome_screenshot(f"file://{html_path}", w, h, os.path.join(fmt_dir, f"{total}-closing.png"))
        print(f"wrote {fmt_dir}/{total}-closing.png")

    print(f"\nDone. {total} slides x {len(formats)} format(s) in {args.out}")

if __name__ == "__main__":
    main()
