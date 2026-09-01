#!/usr/bin/env python3
"""
Merges the scraped entries_{1,2,3}.tsv into wardrobe_data.py's WARDROBE list,
deduping against existing images and against each other, and generating
templated copy for the new pieces. Run once; after that hand-edit
wardrobe_data.py directly (this script is not idempotent-safe to re-run
against an already-expanded file without re-checking the SRC_DIR paths).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from wardrobe_data import WARDROBE  # existing 47

SCRATCH = Path("/private/tmp/claude-501/-Volumes-HQ-Claude/7bde0950-1057-4c5d-b786-21fac6aed2ae/scratchpad")

existing_imgs = set(it["img"].split("?")[0] for it in WARDROBE)
existing_ids = set(it["id"] for it in WARDROBE)

NOTES = {
    "two-piece": [
        "A clean {color_l} two-piece — the suit that answers every dress code without trying too hard.",
        "{color} on a two-button cut. Built for the room where the meeting matters more than the outfit.",
        "The {color_l} version of the suit you already own three of. There's a reason.",
        "A two-piece in {color_l}, tailored close, styled to travel from a Tuesday to a Saturday without changing.",
        "Simple construction, {color_l} fabric with real depth up close. Nothing here is trying to be loud.",
    ],
    "three-piece": [
        "Vest, jacket, trouser, all in {color_l}. The extra layer changes how a room reads you before you speak.",
        "{color} across all three pieces. Formal enough for the front row, comfortable enough to stay in it all night.",
        "A {color_l} three-piece — the vest does the work the tie usually gets credit for.",
        "Full three-piece construction in {color_l}. Built for the occasions where a two-piece would read as underdressed.",
        "{color} suiting with a vested finish. The kind of detail that gets noticed after the second look, not the first.",
    ],
    "double-breasted": [
        "Six-button {color_l}, peak lapel. Double-breasted reads formal even when the room isn't.",
        "{color} on a structured double-breasted cut — built for the entrance, not just the meeting.",
        "A {color_l} double-breasted silhouette. Wide lapels, real shoulder, the kind of suit that photographs before you finish walking in.",
        "Double-breasted in {color_l}. It holds a room the way a two-piece can't.",
        "{color} with the architecture to back it up — this cut was built to be looked at.",
    ],
    "tuxedo": [
        "A {color_l} formal piece for the night the invitation says black tie and means it.",
        "{color} evening wear — shawl or peak lapel, built for a room with a photographer in it.",
        "Formal {color_l} construction, made for the occasion that only comes around once.",
        "A {color_l} tuxedo piece. The kind of detail that reads from across the room and holds up close.",
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
    for fname in ["entries_1.tsv", "entries_2.tsv", "entries_3.tsv"]:
        rows.extend(load_tsv(SCRATCH / fname))

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
        note_tpl = NOTES[cat][idx % len(NOTES[cat])]
        note = note_tpl.format(color=r["color"], color_l=r["color"].lower())
        item_id = slugify(base_clean, r["color"], used_ids)

        new_items.append(dict(
            id=item_id, name=name, cat=cat, color=r["color"],
            price=r["price"], img=r["img"], note=note,
        ))
        idx += 1

    print(f"Existing: {len(WARDROBE)}  New: {len(new_items)}  Total: {len(WARDROBE) + len(new_items)}")

    # ---- rewrite wardrobe_data.py: append new items before the closing ] ----
    src = (ROOT / "scripts" / "wardrobe_data.py").read_text(encoding="utf-8")
    assert src.rstrip().endswith("]")

    def esc(s):
        return s.replace("\\", "\\\\").replace('"', '\\"')

    blocks = ["\n  # ---------- EXPANDED (scraped, auto-generated copy) ----------"]
    cur_cat = None
    for it in new_items:
        if it["cat"] != cur_cat:
            cur_cat = it["cat"]
            blocks.append(f"  # ---------- {cur_cat.upper()} (expanded) ----------")
        blocks.append(
            f'  dict(id="{it["id"]}", name="{esc(it["name"])}", cat="{it["cat"]}", '
            f'color="{esc(it["color"])}", price={it["price"]},\n'
            f'       img="{it["img"]}",\n'
            f'       note="{esc(it["note"])}"),'
        )
    new_src = src.rstrip()[:-1].rstrip() + "\n" + "\n".join(blocks) + "\n]\n"
    (ROOT / "scripts" / "wardrobe_data.py").write_text(new_src, encoding="utf-8")
    print("Wrote scripts/wardrobe_data.py")


if __name__ == "__main__":
    main()
