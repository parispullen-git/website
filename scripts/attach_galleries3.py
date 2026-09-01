#!/usr/bin/env python3
"""
Attaches `gallery` field only to dict blocks that don't already have one
(i.e. batch-3 items), matched by handle from gallery_urls.tsv.
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

    print(f"{len(handle_to_gallery)} handles have gallery data")

    src = (ROOT / "scripts" / "wardrobe_data.py").read_text(encoding="utf-8")

    def block_repl(m):
        block = m.group(0)
        if "gallery=" in block:
            return block
        hm = re.search(r'handle="([^"]+)"', block)
        if not hm:
            return block
        imgs = handle_to_gallery.get(hm.group(1), [])
        gallery_repr = "[" + ", ".join(f'"{u}"' for u in imgs) + "]"
        return re.sub(r'(img="[^"]+",)', r'\1\n       gallery=' + gallery_repr.replace("\\", "\\\\") + ',', block, count=1)

    count_before = src.count("gallery=")
    new_src = re.sub(r"dict\([^)]*?\),", block_repl, src, flags=re.S)
    count_after = new_src.count("gallery=")
    print(f"gallery= occurrences: {count_before} -> {count_after}")

    (ROOT / "scripts" / "wardrobe_data.py").write_text(new_src, encoding="utf-8")
    print("Wrote scripts/wardrobe_data.py")


if __name__ == "__main__":
    main()
