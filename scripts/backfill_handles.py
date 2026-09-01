#!/usr/bin/env python3
"""
Adds a `handle` field (the real Harrell's product handle) to every dict in
WARDROBE, by matching the stored `img` URL against known source data.
Run once. After this, wardrobe_data.py entries carry `handle` going forward.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from wardrobe_data import WARDROBE

SCRATCH = Path("/private/tmp/claude-501/-Volumes-HQ-Claude/7bde0950-1057-4c5d-b786-21fac6aed2ae/scratchpad")

# handles for the original hand-curated 47 (in WARDROBE id order)
ORIGINAL_47_HANDLES = [
    "prince-of-check-maroon", "prince-of-check-royal", "torre-11", "torre-12-navy",
    "2-piece-office-suit-1", "2-piece-office-suit-5", "2-piece-office-suit-3",
    "henye-5", "henye-4", "lizan-6", "lizan-4",
    "jeremiah-blk", "jeremiah-brown", "copy-of-jeremiah-brown", "jeremiah-green",
    "stalley-79", "stalley-78", "glynn-16", "glynn-13", "landau-30", "kamryn-10", "trayl-11",
    "newdb-18", "newdb-19-black", "halle-59", "halle-55", "halle-54",
    "lex-33", "lex-30", "lance-db-18", "vc-jaegen-17", "vc-jaegen-16",
    "denim-db-4", "beckham-45",
    "big-day-blk-gld", "big-day-navy", "big-day-red-gld", "big-day-wht-navy",
    "leya-tux-blue", "tux-2-black", "tux-2-grey",
    "velvet-tux-4", "velvet-tux-1", "velvet-tux-2", "new-legend-tux-28",
    "cooper", "show-tux",
]


def load_tsv_by_img(path):
    m = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        if len(parts) != 6:
            continue
        handle, base, cat, color, price, img = parts
        m[img.split("?")[0]] = handle
    return m


def main():
    img_to_handle = {}
    for fname in ["entries_1.tsv", "entries_2.tsv", "entries_3.tsv"]:
        img_to_handle.update(load_tsv_by_img(SCRATCH / fname))

    missing = []
    for i, it in enumerate(WARDROBE):
        if "handle" in it and it["handle"]:
            continue
        img_key = it["img"].split("?")[0]
        if i < 47:
            it["handle"] = ORIGINAL_47_HANDLES[i]
        elif img_key in img_to_handle:
            it["handle"] = img_to_handle[img_key]
        else:
            missing.append(it["id"])

    print(f"Total: {len(WARDROBE)}  Missing handle: {len(missing)}")
    if missing:
        print("Missing:", missing[:20])

    # ---- rewrite wardrobe_data.py with handle field inserted after id ----
    src = (ROOT / "scripts" / "wardrobe_data.py").read_text(encoding="utf-8")

    def add_handle(m):
        id_val = m.group(1)
        item = next((x for x in WARDROBE if x["id"] == id_val), None)
        if not item or "handle" not in item:
            return m.group(0)
        return f'dict(id="{id_val}", handle="{item["handle"]}",'

    new_src = re.sub(r'dict\(id="([^"]+)",', add_handle, src)
    (ROOT / "scripts" / "wardrobe_data.py").write_text(new_src, encoding="utf-8")
    print("Wrote scripts/wardrobe_data.py with handle fields")


if __name__ == "__main__":
    main()
