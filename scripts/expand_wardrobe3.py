#!/usr/bin/env python3
"""
Merges picks3.json (the "150 more" batch, 161 candidates / 149 unique handles)
+ colors3.tsv (manually identified colors) into wardrobe_data.py's WARDROBE list.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from wardrobe_data import WARDROBE

SCRATCH = Path("/private/tmp/claude-501/-Volumes-HQ-Claude/7bde0950-1057-4c5d-b786-21fac6aed2ae/scratchpad")

existing_imgs = set(it["img"].split("?")[0] for it in WARDROBE)
existing_ids = set(it["id"] for it in WARDROBE)
existing_handles = set(it.get("handle", "") for it in WARDROBE)

NOTES = {
    "two-piece": [
        "A clean {color_l} two-piece — cut close, built for the room where the meeting matters more than the outfit.",
        "{color} on a two-button frame. Simple, sharp, and it travels well.",
        "The {color_l} version of the suit you already own three of. There's a reason.",
        "A two-piece in {color_l}, styled to move from a Tuesday to a Saturday without changing.",
    ],
    "three-piece": [
        "Vest, jacket, trouser, all in {color_l}. The extra layer changes how a room reads you before you speak.",
        "{color} across all three pieces. Formal enough for the front row, comfortable enough to stay in it all night.",
        "A {color_l} three-piece — the vest does the work the tie usually gets credit for.",
        "Full three-piece construction in {color_l}. Built for the occasions a two-piece would underdress.",
    ],
    "double-breasted": [
        "Double-breasted {color_l}, peak lapel. Reads formal even when the room isn't.",
        "{color} on a structured double-breasted cut — built for the entrance, not just the meeting.",
        "A {color_l} double-breasted silhouette. Wide lapels, real shoulder, the kind that photographs before you finish walking in.",
        "Double-breasted in {color_l}. It holds a room the way a two-piece can't.",
    ],
    "tuxedo": [
        "A {color_l} formal piece for the night the invitation says black tie and means it.",
        "{color} evening wear, built for a room with a photographer in it.",
        "Formal {color_l} construction, made for the occasion that only comes around once.",
        "{color} on full formal construction — built for the last entrance of the night, not the first.",
    ],
}

PRICE_BAND = {
    "two-piece": (895, 955),
    "three-piece": (995, 1095),
    "double-breasted": (1050, 1150),
    "tuxedo": (1150, 1295),
}
RAW_RANGE = {
    "two-piece": (299.96, 449.96),
    "three-piece": (349.96, 999.96),
    "double-breasted": (349.96, 699.96),
    "tuxedo": (399.96, 999.96),
}

COLOR_MAP = {
    "olive": "Olive", "camel": "Camel", "grey": "Grey", "royal-blue": "Royal Blue",
    "dark-teal": "Dark Teal", "brown": "Brown", "navy": "Navy", "black": "Black",
    "mauve": "Mauve", "sage": "Sage", "white-black": "White/Black", "peach": "Peach",
    "teal": "Teal", "charcoal": "Charcoal", "tan": "Tan", "dark-green": "Dark Green",
    "burgundy": "Burgundy", "white": "White", "pink": "Pink", "gold": "Gold",
    "yellow": "Yellow", "chartreuse": "Chartreuse", "blue": "Blue", "ivory": "Ivory",
    "powder-blue": "Powder Blue", "emerald": "Emerald", "blush": "Blush", "lavender": "Lavender",
    "plum": "Plum", "green": "Green", "silver": "Silver", "magenta": "Magenta",
    "black-white": "Black/White", "black-gold": "Black/Gold", "red": "Red",
}


def slugify(base, color, used):
    s = re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-")
    c = re.sub(r"[^a-z0-9]+", "-", color.lower()).strip("-")
    root = f"{s}-{c}"
    cand = root
    n = 2
    while cand in used:
        cand = f"{root}-{n}"
        n += 1
    used.add(cand)
    return cand


def scale_price(cat, raw):
    lo_r, hi_r = RAW_RANGE[cat]
    lo_b, hi_b = PRICE_BAND[cat]
    raw = max(lo_r, min(hi_r, raw))
    t = (raw - lo_r) / (hi_r - lo_r) if hi_r > lo_r else 0.5
    price = lo_b + t * (hi_b - lo_b)
    return int(round(price / 5.0) * 5)


def main():
    picks = json.loads((SCRATCH / "picks3.json").read_text())
    colors = {}
    for line in (SCRATCH / "colors3.tsv").read_text().splitlines():
        if not line.strip():
            continue
        idx, slug = line.split("\t")
        colors[int(idx)] = slug

    seen_handles = set(existing_handles)
    used_ids = set(existing_ids)
    new_items = []
    idx_counters = {}

    for i, p in enumerate(picks):
        if p["handle"] in seen_handles:
            continue
        seen_handles.add(p["handle"])
        img_key = p["img"].split("?")[0]
        if img_key in existing_imgs:
            continue

        cat = p["cat"]
        color_slug = colors.get(i, "black")
        color = COLOR_MAP.get(color_slug, color_slug.replace("-", " ").title())

        base_clean = re.sub(r"\*\*.*?\*\*", "", p["base"]).strip()
        base_clean = re.sub(r"\s*\(Made To Order\)\s*", "", base_clean).strip()
        name = f"The {base_clean} — {color}"

        idx_counters.setdefault(cat, 0)
        note_tpl = NOTES[cat][idx_counters[cat] % len(NOTES[cat])]
        idx_counters[cat] += 1
        note = note_tpl.format(color=color, color_l=color.lower())

        item_id = slugify(base_clean, color, used_ids)
        price = scale_price(cat, float(p["price"]))

        new_items.append(dict(
            id=item_id, handle=p["handle"], name=name, cat=cat, color=color,
            price=price, img=p["img"], note=note,
        ))

    print(f"Existing: {len(WARDROBE)}  New: {len(new_items)}  Total: {len(WARDROBE) + len(new_items)}")

    src = (ROOT / "scripts" / "wardrobe_data.py").read_text(encoding="utf-8")
    assert src.rstrip().endswith("]")

    def esc(s):
        return s.replace("\\", "\\\\").replace('"', '\\"')

    blocks = ["\n  # ---------- EXPANDED BATCH 3 (150 more, auto-generated) ----------"]
    cur_cat = None
    for it in new_items:
        if it["cat"] != cur_cat:
            cur_cat = it["cat"]
            blocks.append(f"  # ---------- {cur_cat.upper()} (batch 3) ----------")
        blocks.append(
            f'  dict(id="{it["id"]}", handle="{it["handle"]}", name="{esc(it["name"])}", cat="{it["cat"]}", '
            f'color="{esc(it["color"])}", price={it["price"]},\n'
            f'       img="{it["img"]}",\n'
            f'       note="{esc(it["note"])}"),'
        )
    new_src = src.rstrip()[:-1].rstrip() + "\n" + "\n".join(blocks) + "\n]\n"
    (ROOT / "scripts" / "wardrobe_data.py").write_text(new_src, encoding="utf-8")
    print("Wrote scripts/wardrobe_data.py")


if __name__ == "__main__":
    main()
