#!/usr/bin/env python3
"""
Hook / Pain Point / Solution carousel generator for parispullen.com.

Builds a 3-slide carousel per Journal entry -- a direct-response beat
structure (Hook, Pain Point, Solution/Reward) instead of the weekly
recap's cover+posts+nav shape -- reusing the same visual system as
weekly-report/generate.py (real brand monogram, Playfair Display +
Inter, ink/charcoal/brass palette). One entry's 3 slides share its hero
image as a consistent backdrop across the set.

Usage:
    python3 generate_beats.py --config beats.json --format carousel --out /path/to/out
    python3 generate_beats.py --config beats.json --format story --out /path/to/out
    python3 generate_beats.py --config beats.json --format both --out /path/to/out

Config file shape (see beats.example.json in this folder):
{
  "site_url": "http://localhost:4330",
  "entries": [
    {
      "slug": "iphone-18-pro-duo-what-changed",
      "short_title": "iPhone 18 Pro, Pro Max & Duo",
      "focal": "center 30%",
      "image_override": null,
      "hook": "The new Apple CEO's first move was a folding phone. Bold, or a mistake?",
      "pain": "You don't want to drop a grand on the wrong one -- or ruin your pocket line with a phone that doesn't fold flat under a tailored jacket.",
      "solution": "My real verdict on all three, tested against how they actually carry -- so you buy the one that fits your life, not the keynote."
    },
    ...
  ]
}

Each entry produces 3 slides: <n>-hook.png, <n>-pain.png, <n>-solution.png,
grouped in a subfolder named after the slug. `short_title`, `hook`, `pain`,
and `solution` are required; `focal` and `image_override` are optional,
same meaning as in weekly-report/generate.py.
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate import (
    REPO, FORMATS, WORDMARK_HTML, base_css, html_doc, chrome_screenshot,
)

BEATS = [
    ("hook", "THE HOOK"),
    ("pain", "THE PAIN POINT"),
    ("solution", "THE PAYOFF"),
]

def beat_slide(entry, img, focal, beat_key, beat_label, idx, total, w, h):
    tall = h > 1600
    text = entry[beat_key]
    css = base_css(w, h) + f"""
    .bg {{ position:absolute; inset:0; background:url('file://{REPO}/assets/img/{img}.jpg') {focal}/cover no-repeat; }}
    .scrim {{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(16,16,18,.12) 0%, rgba(16,16,18,.2) {'30%' if tall else '38%'}, rgba(10,10,11,{'.72' if tall else '.94'}) {'62%' if tall else '82%'}, rgba(10,10,11,.97) {'80%' if tall else '92%'}, #0A0A0B 100%); }}
    .topscrim {{ position:absolute; top:0; left:0; right:0; height:{260 if tall else 210}px;
      background:linear-gradient(180deg, rgba(10,10,11,.6) 0%, rgba(10,10,11,0) 100%); }}
    .field {{ position:absolute; left:0; right:0; bottom:0; padding:0 {80 if tall else 88}px {320 if tall else 120}px; }}
    .beat-label {{ font-family:ui-monospace,Menlo,monospace; font-size:{18 if tall else 17}px; letter-spacing:.24em;
      text-transform:uppercase; color:#C9A961; margin-bottom:{28 if tall else 24}px; }}
    .beat-text {{ font-family:'Playfair Display',serif; font-weight:500; font-size:{58 if tall else 52}px;
      line-height:1.18; letter-spacing:-.005em; color:#F3F0EA; max-width:900px; }}
    .cta {{ margin-top:{40 if tall else 34}px; font-family:ui-monospace,Menlo,monospace; font-size:{16 if tall else 15}px;
      letter-spacing:.14em; text-transform:uppercase; color:#A8874E; }}
    .foot {{ position:absolute; left:{80 if tall else 88}px; right:{80 if tall else 88}px; bottom:{190 if tall else 52}px;
      display:flex; justify-content:space-between; align-items:baseline;
      font-family:ui-monospace,Menlo,monospace; font-size:{15 if tall else 14}px; letter-spacing:.14em;
      text-transform:uppercase; color:#71717C; }}
    .taphere-top {{ position:absolute; top:{114+40 if tall else 0}px; right:{72 if tall else 64}px;
      display:flex; flex-direction:column; align-items:flex-end; gap:8px; }}
    .taphere-top .lbl {{ font-family:ui-monospace,Menlo,monospace; font-size:16px; letter-spacing:.14em;
      text-transform:uppercase; color:#C9A961; }}
    """
    # Only the final beat (the payoff) carries a call to action -- hook and
    # pain-point slides exist to earn the swipe, not to sell yet. On Stories
    # that CTA is a "tap here" pointing at the link-sticker spot (same
    # reasoning as weekly-report/generate.py's per-post slides); on
    # carousel it's the plain "Read the full story" line.
    cta_block = ""
    if beat_key == "solution":
        if tall:
            cta_block = """
            <div class="taphere-top">
              <span class="lbl">Tap here</span>
              <svg width="30" height="34" viewBox="0 0 30 34" fill="none"><path d="M15 2V26" stroke="#C9A961" stroke-width="2.5" stroke-linecap="round"/><path d="M5 18L15 28L25 18" stroke="#C9A961" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
            </div>
            """
        else:
            cta_block = '<div class="cta">Read the full story &#8594;</div>'
    tag = entry.get("short_title", "")
    body = f"""
    <div class="bg"></div><div class="scrim"></div><div class="topscrim"></div>
    {WORDMARK_HTML}
    <div class="tag">{tag}</div>
    {cta_block if beat_key == "solution" and tall else ""}
    <div class="field">
      <div class="beat-label">{beat_label}</div>
      <div class="beat-text">{text}</div>
      {cta_block if beat_key == "solution" and not tall else ""}
    </div>
    <div class="foot"><span>PARISPULLEN.COM/JOURNAL</span><span>{idx:02d} / {total:02d}</span></div>
    """
    return html_doc(css, body)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", required=True)
    ap.add_argument("--format", choices=["carousel", "story", "both"], default="both")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    cfg = json.load(open(args.config))
    posts_data = json.load(open(os.path.join(REPO, "data", "journal.json")))
    by_slug = {p["slug"]: p for p in posts_data}

    formats = ["carousel", "story"] if args.format == "both" else [args.format]
    total = len(BEATS)

    for fmt in formats:
        w, h = FORMATS[fmt]["w"], FORMATS[fmt]["h"]
        fmt_dir = os.path.join(args.out, fmt)
        os.makedirs(fmt_dir, exist_ok=True)
        work_dir = os.path.join(args.out, "_build")
        os.makedirs(work_dir, exist_ok=True)

        for entry in cfg["entries"]:
            rec = by_slug.get(entry["slug"])
            if not rec:
                print(f"WARNING: slug not found in data/journal.json: {entry['slug']}", file=sys.stderr)
                continue
            img = entry.get("image_override") or rec["hero"]["img"]
            focal = entry.get("focal", "center")
            entry_dir = os.path.join(fmt_dir, entry["slug"])
            os.makedirs(entry_dir, exist_ok=True)
            for i, (beat_key, beat_label) in enumerate(BEATS, start=1):
                html = beat_slide(entry, img, focal, beat_key, beat_label, i, total, w, h)
                html_path = os.path.join(work_dir, f"{fmt}-{entry['slug']}-{beat_key}.html")
                with open(html_path, "w") as f:
                    f.write(html)
                png_path = os.path.join(entry_dir, f"{i}-{beat_key}.png")
                chrome_screenshot(f"file://{html_path}", w, h, png_path)
                print(f"wrote {png_path}")

    print(f"\nDone. {len(cfg['entries'])} entries x 3 beats x {len(formats)} format(s) in {args.out}")

if __name__ == "__main__":
    main()
