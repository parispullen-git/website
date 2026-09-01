#!/usr/bin/env python3
"""
Downloads the curated Wardrobe images and generates wardrobe.html.
Re-run after editing wardrobe_data.py. Never hand-edit wardrobe.html.
"""
import re
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from wardrobe_data import WARDROBE

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "assets" / "img" / "wardrobe"
IMG_DIR.mkdir(parents=True, exist_ok=True)


def download_url(url, dest, retries=3):
    if dest.exists() and dest.stat().st_size > 0:
        return dest.stat().st_size
    last_err = None
    for attempt in range(retries):
        try:
            subprocess.run(
                ["curl", "-sL", "-A", "Mozilla/5.0", "--max-time", "25", "-o", str(dest), url],
                check=True,
            )
            if dest.exists() and dest.stat().st_size > 0:
                return dest.stat().st_size
            last_err = RuntimeError("empty download")
        except subprocess.CalledProcessError as e:
            last_err = e
        time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"download failed for {dest} after {retries} attempts: {last_err}")


def download(item):
    return download_url(item["img"], IMG_DIR / f"{item['id']}.jpg")


def download_gallery(item):
    """Downloads extra shots (vest/back/detail) as {id}-2.jpg, {id}-3.jpg, ...
    Returns local relative paths (site-root relative) in order."""
    paths = []
    total = 0
    for i, url in enumerate(item.get("gallery", []), start=2):
        dest = IMG_DIR / f"{item['id']}-{i}.jpg"
        try:
            total += download_url(url, dest)
            paths.append(f"assets/img/wardrobe/{item['id']}-{i}.jpg")
        except Exception as e:
            print(f"  ! gallery image failed for {item['id']}-{i}: {e}")
    return paths, total


def esc(t):
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace("'", "&#8217;").replace('"', "&quot;"))


CAT_LABEL = {
    "two-piece": "Two-Piece",
    "three-piece": "Three-Piece",
    "double-breasted": "Double-Breasted",
    "tuxedo": "Tuxedo &amp; Formal",
}

# Primary color family each specific shade rolls up under, for the two-level
# color filter (family chip -> submenu of the exact shades within it).
COLOR_FAMILY = {
    "Black": "Black",
    "White": "White & Ivory", "Ivory": "White & Ivory",
    "Grey": "Grey & Silver", "Charcoal": "Grey & Silver", "Silver": "Grey & Silver",
    "Blue": "Blue", "Navy": "Blue", "Royal Blue": "Blue", "Sky Blue": "Blue",
    "Slate Blue": "Blue", "Powder Blue": "Blue", "Denim": "Blue",
    "Green": "Green & Teal", "Dark Green": "Green & Teal", "Olive": "Green & Teal",
    "Sage": "Green & Teal", "Emerald": "Green & Teal", "Chartreuse": "Green & Teal",
    "Mint": "Green & Teal", "Teal": "Green & Teal", "Dark Teal": "Green & Teal",
    "Turquoise": "Green & Teal",
    "Red": "Red & Burgundy", "Burgundy": "Red & Burgundy", "Rust": "Red & Burgundy",
    "Coral": "Red & Burgundy",
    "Blush": "Pink & Blush", "Pink": "Pink & Blush", "Magenta": "Pink & Blush",
    "Rose Gold": "Pink & Blush",
    "Purple": "Purple", "Plum": "Purple", "Lavender": "Purple", "Mauve": "Purple",
    "Brown": "Brown & Tan", "Tan": "Brown & Tan", "Camel": "Brown & Tan",
    "Copper": "Brown & Tan",
    "Yellow": "Yellow & Gold", "Gold": "Yellow & Gold",
    "Orange": "Orange & Peach", "Peach": "Orange & Peach",
    "Black/Gold": "Multi-Tone", "Black/White": "Multi-Tone", "White/Black": "Multi-Tone",
    "Charcoal/Gold": "Multi-Tone", "Navy/Gold": "Multi-Tone", "Red/Green": "Multi-Tone",
}
FAMILY_ORDER = [
    "Black", "White & Ivory", "Grey & Silver", "Blue", "Green & Teal",
    "Red & Burgundy", "Pink & Blush", "Purple", "Brown & Tan", "Yellow & Gold",
    "Orange & Peach", "Multi-Tone",
]


def family_of(color):
    return COLOR_FAMILY.get(color, "Multi-Tone")


def main():
    total = 0
    gallery_paths = {}
    failed = []
    for it in WARDROBE:
        try:
            size = download(it)
        except Exception as e:
            print(f"  ! main image failed for {it['id']}: {e}")
            failed.append(it["id"])
            continue
        total += size
        g_paths, g_size = download_gallery(it)
        gallery_paths[it["id"]] = g_paths
        total += g_size
        print(f"{it['id']:24s} {size/1000:6.0f}KB  +{len(g_paths)} gallery  {it['name']}")
    print(f"\n{len(WARDROBE)} images, {total/1_000_000:.1f}MB total")
    if failed:
        print(f"FAILED (no main image): {failed}")

    colors = sorted(set(it["color"] for it in WARDROBE))
    cats = ["two-piece", "three-piece", "double-breasted", "tuxedo"]

    filter_cats = "".join(
        f'<button type="button" data-cat="{c}">{CAT_LABEL[c]}</button>\n' for c in cats
    )

    colors_by_family = {}
    for c in colors:
        colors_by_family.setdefault(family_of(c), []).append(c)

    family_blocks = []
    for fam in FAMILY_ORDER:
        fam_colors = sorted(colors_by_family.get(fam, []))
        if not fam_colors:
            continue
        sub_buttons = "".join(
            f'<button type="button" data-color="{esc(c)}">{esc(c)}</button>\n' for c in fam_colors
        )
        family_blocks.append(f'''<div class="wfam" data-family="{esc(fam)}">
          <button type="button" class="wfam__btn" data-family-btn="{esc(fam)}">{esc(fam)}</button>
          <div class="wfam__sub">
            <button type="button" data-family-all="{esc(fam)}">All {esc(fam)}</button>
            {sub_buttons}          </div>
        </div>\n''')
    filter_colors = "".join(family_blocks)

    cards = []
    for it in WARDROBE:
        gallery_attr = ",".join(gallery_paths.get(it["id"], []))
        cards.append(f'''      <div class="wcard" data-id="{it['id']}" data-cat="{it['cat']}" data-color="{esc(it['color'])}"
           data-family="{esc(family_of(it['color']))}"
           data-name="{esc(it['name'])}" data-price="{it['price']}" data-note="{esc(it['note'])}"
           data-catlabel="{CAT_LABEL[it['cat']]}" data-img="assets/img/wardrobe/{it['id']}.jpg"
           data-gallery="{esc(gallery_attr)}">
        <div class="wcard__media">
          <button type="button" class="wcard__select" data-select aria-label="Add {esc(it['name'])} to inquiry" aria-pressed="false">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.2C.5 8 2 4.5 5.5 4c2-.3 3.8.6 5 2.3.9-1.4 2.9-2.6 5-2.3C19 4.5 20.5 8 19 11.8 16.5 16.4 12 21 12 21Z"/></svg>
          </button>
          <img src="assets/img/wardrobe/{it['id']}.jpg" alt="{esc(it['name'])}" loading="lazy">
        </div>
        <button type="button" class="wcard__open" data-open>
          <p class="wcard__cat">{CAT_LABEL[it['cat']]} &#183; {esc(it['color'])}</p>
          <h3 class="wcard__name">{esc(it['name'])}</h3>
          <p class="wcard__note">{esc(it['note'])}</p>
          <p class="wcard__price">${it['price']:,}</p>
        </button>
      </div>''')
    cards_html = "\n".join(cards)

    tpl = open(ROOT / "wardrobe.html.tpl", encoding="utf-8").read() if (ROOT / "wardrobe.html.tpl").exists() else None
    if tpl is None:
        print("No wardrobe.html.tpl found -- run build_wardrobe.py after creating it.")
        return

    out = tpl.replace("{{FILTER_CATS}}", filter_cats)
    out = out.replace("{{FILTER_COLORS}}", filter_colors)
    out = out.replace("{{CARDS}}", cards_html)
    out = out.replace("{{COUNT}}", str(len(WARDROBE)))

    (ROOT / "wardrobe.html").write_text(out, encoding="utf-8")
    print(f"\nWrote {ROOT / 'wardrobe.html'}")


if __name__ == "__main__":
    main()
