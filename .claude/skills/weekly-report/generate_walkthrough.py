#!/usr/bin/env python3
"""
Full Penthouse walkthrough carousel generator: room by room, artifact by
artifact, through every currently-open room -- not a curated highlight
reel like the other three generators, the whole thing. Reads
data/house-rooms.json directly (the same source build_house.py bakes
into house.html), so it can never show a room or an artifact fact that
isn't actually real/live, and it automatically covers whatever's open
without hand-listing rooms in a config file.

Usage:
    python3 generate_walkthrough.py --format both --out /path/to/out
    python3 generate_walkthrough.py --format story --out /path/to/out --cover-json cover.json

Unlike the other three generators, there's no per-slide config file --
one room slide + one slide per artifact is generated automatically for
every room in the open set (_PENTHOUSE_ORDER, mirrored from
build_house.py so the room order/adjacency here always matches what
the live site actually pages through). The only optional input is
--cover-json, a small file for the cover/closing copy (see
walkthrough-cover.example.json) -- everything else comes straight from
data/house-rooms.json's own "note" (room standfirst) and "arts[].desc"
(artifact description) fields, lightly trimmed to fit a slide rather
than rewritten.

Each artifact slide reuses its room's own photo as the background,
just re-centered on that artifact's x/y hotspot coordinate (already
authored in the data, the same coordinate the live site's own hotspot
dot sits at) -- a "look here" pan across the same image rather than
needing dedicated per-artifact photography.
"""
import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate import (
    REPO, FORMATS, WORDMARK_HTML, base_css, html_doc, chrome_screenshot,
    wait_for_server, cover_slide,
)
from generate_explainer import closing_slide

# Mirrors build_house.py's _PENTHOUSE_ORDER exactly -- only Levels 26-28
# are open to the public right now; the other 14 authored rooms in
# house-rooms.json aren't built into the live site, so a walkthrough of
# "the whole Penthouse" means this set, not the full data file.
_PENTHOUSE_ORDER = ["closet", "bedroom", "bath",
                     "kitchen", "penthouse-living", "study",
                     "music-lounge", "cinema", "gym"]

def trim(text, limit=185):
    text = text.strip()
    if len(text) <= limit:
        return text
    sentences = re.split(r'(?<=[.!?])\s+', text)
    out = ""
    for s in sentences:
        if len(out) + len(s) + 1 > limit:
            break
        out = (out + " " + s).strip()
    if out:
        return out
    cut = text[:limit].rsplit(" ", 1)[0]
    return cut + "…"

def room_slide(room, room_num, room_count, idx, total, w, h):
    tall = h > 1600
    img = room["img"]
    focal = room.get("focus", "center")
    css = base_css(w, h) + f"""
    .bg {{ position:absolute; inset:0; background:url('file://{REPO}/assets/img/{img}.jpg') {focal}/cover no-repeat; }}
    .scrim {{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(16,16,18,.12) 0%, rgba(16,16,18,.2) {'30%' if tall else '38%'}, rgba(10,10,11,{'.72' if tall else '.94'}) {'62%' if tall else '82%'}, rgba(10,10,11,.97) {'80%' if tall else '92%'}, #0A0A0B 100%); }}
    .field {{ position:absolute; left:0; right:0; bottom:0; padding:0 {80 if tall else 88}px {320 if tall else 120}px; }}
    .beat-label {{ font-family:ui-monospace,Menlo,monospace; font-size:{18 if tall else 17}px; letter-spacing:.24em;
      text-transform:uppercase; color:#C9A961; margin-bottom:{28 if tall else 24}px; }}
    .beat-text {{ font-family:'Playfair Display',serif; font-weight:500; font-size:{68 if tall else 62}px;
      line-height:1.1; letter-spacing:-.005em; color:#F3F0EA; max-width:900px; }}
    .sub {{ margin-top:{28 if tall else 24}px; font-size:{25 if tall else 23}px; line-height:1.5; color:#DBD5C9;
      max-width:820px; font-weight:300; }}
    .foot {{ position:absolute; left:{80 if tall else 88}px; right:{80 if tall else 88}px; bottom:{190 if tall else 52}px;
      display:flex; justify-content:space-between; align-items:baseline;
      font-family:ui-monospace,Menlo,monospace; font-size:{15 if tall else 14}px; letter-spacing:.14em;
      text-transform:uppercase; color:#71717C; }}
    """
    body = f"""
    <div class="bg"></div><div class="scrim"></div>
    {WORDMARK_HTML}
    <div class="tag">LEVEL {room['lvl']}</div>
    <div class="field">
      <div class="beat-label">ROOM {room_num:02d} OF {room_count:02d}</div>
      <div class="beat-text">{room['name']}</div>
      <div class="sub">{room.get('note','')}</div>
    </div>
    <div class="foot"><span>THE PENTHOUSE WALKTHROUGH</span><span>{idx:02d} / {total:02d}</span></div>
    """
    return html_doc(css, body)

def artifact_slide(room, art, art_num, art_count, idx, total, w, h):
    tall = h > 1600
    img = room["img"]
    focal = f"{art['x']} {art['y']}"
    css = base_css(w, h) + f"""
    .bg {{ position:absolute; inset:0; background:url('file://{REPO}/assets/img/{img}.jpg') {focal}/cover no-repeat; }}
    .scrim {{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(16,16,18,.12) 0%, rgba(16,16,18,.2) {'30%' if tall else '38%'}, rgba(10,10,11,{'.72' if tall else '.94'}) {'62%' if tall else '82%'}, rgba(10,10,11,.97) {'80%' if tall else '92%'}, #0A0A0B 100%); }}
    .field {{ position:absolute; left:0; right:0; bottom:0; padding:0 {80 if tall else 88}px {320 if tall else 120}px; }}
    .beat-label {{ font-family:ui-monospace,Menlo,monospace; font-size:{18 if tall else 17}px; letter-spacing:.24em;
      text-transform:uppercase; color:#C9A961; margin-bottom:{28 if tall else 24}px; }}
    .beat-text {{ font-family:'Playfair Display',serif; font-weight:500; font-size:{60 if tall else 54}px;
      line-height:1.15; letter-spacing:-.005em; color:#F3F0EA; max-width:900px; }}
    .sub {{ margin-top:{28 if tall else 24}px; font-size:{25 if tall else 23}px; line-height:1.5; color:#DBD5C9;
      max-width:820px; font-weight:300; }}
    .foot {{ position:absolute; left:{80 if tall else 88}px; right:{80 if tall else 88}px; bottom:{190 if tall else 52}px;
      display:flex; justify-content:space-between; align-items:baseline;
      font-family:ui-monospace,Menlo,monospace; font-size:{15 if tall else 14}px; letter-spacing:.14em;
      text-transform:uppercase; color:#71717C; }}
    """
    body = f"""
    <div class="bg"></div><div class="scrim"></div>
    {WORDMARK_HTML}
    <div class="tag">{room['name'].upper()}</div>
    <div class="field">
      <div class="beat-label">ARTIFACT {art_num} OF {art_count} &#183; {room['name'].upper()}</div>
      <div class="beat-text">{art['name']}</div>
      <div class="sub">{trim(art.get('desc',''))}</div>
    </div>
    <div class="foot"><span>THE PENTHOUSE WALKTHROUGH</span><span>{idx:02d} / {total:02d}</span></div>
    """
    return html_doc(css, body)

DEFAULT_COVER = {
    "tag": "THE PENTHOUSE",
    "eyebrow": "Room By Room",
    "headline_html": "Every room.<br>Every object.<br>The whole <em>house</em>.",
    "sub": "Nine rooms, twenty artifacts, all of it real. Walk it with me."
}
DEFAULT_CLOSING = {
    "url_path": "house.html",
    "eyebrow": "Walk It Yourself",
    "headline": "Open the Penthouse",
    "sub": "Tap Menu, pick The Penthouse, and start wherever you like — every room and every artifact above is really there."
}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--format", choices=["carousel", "story", "both"], default="both")
    ap.add_argument("--out", required=True)
    ap.add_argument("--site-url", default="http://localhost:4330")
    ap.add_argument("--cover-json", default=None, help="optional JSON with {cover, closing} overrides")
    args = ap.parse_args()

    cover_cfg, closing_cfg = dict(DEFAULT_COVER), dict(DEFAULT_CLOSING)
    if args.cover_json:
        j = json.load(open(args.cover_json))
        cover_cfg.update(j.get("cover", {}))
        closing_cfg.update(j.get("closing", {}))

    if not wait_for_server(args.site_url.rstrip("/") + "/journal.html"):
        print(f"ERROR: can't reach {args.site_url}. Start the local preview server first.", file=sys.stderr)
        sys.exit(1)

    rooms = json.load(open(os.path.join(REPO, "data", "house-rooms.json")))
    by_id = {r["id"]: r for r in rooms}
    open_rooms = [by_id[rid] for rid in _PENTHOUSE_ORDER]

    # Flatten into a slide plan: room, then each of its artifacts, in order.
    plan = []
    room_count = len(open_rooms)
    for room_num, room in enumerate(open_rooms, start=1):
        plan.append(("room", room, room_num, room_count))
        arts = room.get("arts", [])
        for art_num, art in enumerate(arts, start=1):
            plan.append(("artifact", (room, art), art_num, len(arts)))
    total = len(plan) + 2  # + cover + closing

    formats = ["carousel", "story"] if args.format == "both" else [args.format]

    for fmt in formats:
        w, h = FORMATS[fmt]["w"], FORMATS[fmt]["h"]
        fmt_dir = os.path.join(args.out, fmt)
        os.makedirs(fmt_dir, exist_ok=True)
        work_dir = os.path.join(args.out, "_build")
        os.makedirs(work_dir, exist_ok=True)

        mini_cfg = {"cover": cover_cfg, "_total": total}
        html = cover_slide(mini_cfg, w, h)
        p = os.path.join(work_dir, f"{fmt}-1-cover.html")
        open(p, "w").write(html)
        chrome_screenshot(f"file://{p}", w, h, os.path.join(fmt_dir, "1-cover.png"))
        print(f"wrote {fmt_dir}/1-cover.png")

        idx = 2
        for entry in plan:
            kind = entry[0]
            if kind == "room":
                _, room, room_num, rcount = entry
                out_name = f"{idx:03d}-room-{room['id']}"
                html = room_slide(room, room_num, rcount, idx, total, w, h)
            else:
                _, (room, art), art_num, acount = entry
                out_name = f"{idx:03d}-{room['id']}-{art['id']}"
                html = artifact_slide(room, art, art_num, acount, idx, total, w, h)
            p = os.path.join(work_dir, f"{fmt}-{out_name}.html")
            open(p, "w").write(html)
            out_png = os.path.join(fmt_dir, f"{out_name}.png")
            chrome_screenshot(f"file://{p}", w, h, out_png)
            print(f"wrote {out_png}")
            idx += 1

        shot_path = os.path.join(work_dir, f"{fmt}-shot-closing.png")
        chrome_screenshot(args.site_url.rstrip("/") + "/" + closing_cfg["url_path"], w, h, shot_path, wait_for_fonts=False)
        html = closing_slide(closing_cfg, shot_path, total, total, w, h)
        p = os.path.join(work_dir, f"{fmt}-{total}-closing.html")
        open(p, "w").write(html)
        chrome_screenshot(f"file://{p}", w, h, os.path.join(fmt_dir, f"{total:03d}-closing.png"))
        print(f"wrote {fmt_dir}/{total:03d}-closing.png")

    print(f"\nDone. {total} slides x {len(formats)} format(s) in {args.out}")
    print(f"({len(open_rooms)} rooms, {sum(len(r.get('arts',[])) for r in open_rooms)} artifacts)")

if __name__ == "__main__":
    main()
