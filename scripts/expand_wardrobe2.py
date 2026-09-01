#!/usr/bin/env python3
"""
Merges entries2_1.tsv / entries2_2.tsv (the "100 more suits" batch) into
wardrobe_data.py's WARDROBE list, deduping against existing images, with
handle stored directly this time.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from wardrobe_data import WARDROBE

SCRATCH = Path("/private/tmp/claude-501/-Volumes-HQ-Claude/7bde0950-1057-4c5d-b786-21fac6aed2ae/scratchpad")

existing_imgs = set(it["img"].split("?")[0] for it in WARDROBE)
existing_ids = set(it["id"] for it in WARDROBE)

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

CAT_MAP = {"two-piece": "two-piece", "three-piece": "three-piece",
           "double-breasted": "double-breasted", "tuxedo": "tuxedo"}


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


def load_tsv(path):
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        if len(parts) != 6:
            continue
        handle, base, cat, color, price, img = parts
        rows.append(dict(handle=handle, base=base, cat=cat, color=color, price=int(price), img=img))
    return rows


def main():
    rows = []
    for fname in ["entries2_1.tsv", "entries2_2.tsv"]:
        p = SCRATCH / fname
        if p.exists():
            rows.extend(load_tsv(p))
    print(f"Loaded {len(rows)} candidate rows")

    seen_imgs = set(existing_imgs)
    used_ids = set(existing_ids)
    new_items = []
    idx = 0
    for r in rows:
        img_key = r["img"].split("?")[0]
        if img_key in seen_imgs:
            continue
        seen_imgs.add(img_key)
        cat = CAT_MAP.get(r["cat"])
        if not cat:
            continue

        base_clean = re.sub(r"\*\*.*?\*\*", "", r["base"]).strip()
        name = f"The {base_clean} — {r['color']}"
        if name.startswith("The The "):
            name = name.replace("The The ", "The ", 1)
        note_tpl = NOTES[cat][idx % len(NOTES[cat])]
        note = note_tpl.format(color=r["color"], color_l=r["color"].lower())
        item_id = slugify(base_clean, r["color"], used_ids)

        new_items.append(dict(
            id=item_id, handle=r["handle"], name=name, cat=cat, color=r["color"],
            price=r["price"], img=r["img"], note=note,
        ))
        idx += 1

    print(f"Existing: {len(WARDROBE)}  New: {len(new_items)}  Total: {len(WARDROBE) + len(new_items)}")

    src = (ROOT / "scripts" / "wardrobe_data.py").read_text(encoding="utf-8")
    assert src.rstrip().endswith("]")

    def esc(s):
        return s.replace("\\", "\\\\").replace('"', '\\"')

    blocks = ["\n  # ---------- EXPANDED BATCH 2 (100 more, auto-generated copy) ----------"]
    cur_cat = None
    for it in new_items:
        if it["cat"] != cur_cat:
            cur_cat = it["cat"]
            blocks.append(f"  # ---------- {cur_cat.upper()} (batch 2) ----------")
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
