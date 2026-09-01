#!/usr/bin/env python3
"""
Attaches a `gallery` field (list of remote image URLs, the other product
shots -- vest, back, detail) to each WARDROBE dict, matched by handle from
gallery_urls.tsv. Run after fetch_galleries.py completes.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from wardrobe_data import WARDROBE

SCRATCH = Path("/private/tmp/claude-501/-Volumes-HQ-Claude/7bde0950-1057-4c5d-b786-21fac6aed2ae/scratchpad")


def main():
    handle_to_gallery = {}
    for line in (SCRATCH / "gallery_urls.tsv").read_text(encoding="utf-8").splitlines():
        if "\t" not in line:
            continue
        handle, rest = line.split("\t", 1)
        imgs = [u for u in rest.split("|") if u.strip()]
        if imgs:
            handle_to_gallery[handle] = imgs

    img_to_gallery = {}
    for it in WARDROBE:
        img_to_gallery[it["img"]] = handle_to_gallery.get(it["handle"], [])
    have_gallery = sum(1 for v in img_to_gallery.values() if v)
    print(f"{have_gallery}/{len(WARDROBE)} items have extra gallery images")

    src = (ROOT / "scripts" / "wardrobe_data.py").read_text(encoding="utf-8")

    def add_gallery(m):
        img_url = m.group(1)
        imgs = img_to_gallery.get(img_url, [])
        gallery_repr = "[" + ", ".join(f'"{u}"' for u in imgs) + "]"
        return m.group(0) + f'\n       gallery={gallery_repr},'

    new_src = re.sub(r'img="([^"]+)",', add_gallery, src)
    (ROOT / "scripts" / "wardrobe_data.py").write_text(new_src, encoding="utf-8")
    print("Wrote scripts/wardrobe_data.py with gallery fields")


if __name__ == "__main__":
    main()
