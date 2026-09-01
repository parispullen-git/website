#!/usr/bin/env python3
"""
Renames batch-3's raw Harrell's codenames to the SAME gentleman names already
assigned to their family in batches 1/2, matched via handle-prefix lookup.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from wardrobe_data import WARDROBE
import rename_families as rf

pool_set = set(rf.NAME_POOL)


def base_from_name(n):
    m = re.match(r"The (.+?) — ", n)
    return m.group(1) if m else n


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main():
    prefix_to_name = {}
    originals = [it for it in WARDROBE if base_from_name(it["name"]) in pool_set]
    news = [it for it in WARDROBE if base_from_name(it["name"]) not in pool_set]
    print(f"originals: {len(originals)}  batch-3 raw: {len(news)}")

    for it in originals:
        h = it["handle"]
        a = re.sub(r"^\d+-", "", h)
        a = re.sub(r"-\d+.*$", "", a)
        b = re.sub(r"-\d+.*$", "", h)
        for k in (a, b, h):
            prefix_to_name.setdefault(k, it["name"])

    id_to_new_name = {}
    unmatched = []
    for it in news:
        b = base_from_name(it["name"])
        slug = slugify(re.sub(r"\*\*.*?\*\*", "", b).strip())
        slug2 = re.sub(r"^\d+-", "", slug)
        target_name = prefix_to_name.get(slug) or prefix_to_name.get(slug2)
        if not target_name:
            unmatched.append(it["id"])
            continue
        new_base = base_from_name(target_name)
        id_to_new_name[it["id"]] = f"The {new_base} — {it['color']}"

    print(f"matched: {len(id_to_new_name)}  unmatched: {len(unmatched)}")
    if unmatched:
        print("unmatched ids:", unmatched)

    src = (ROOT / "scripts" / "wardrobe_data.py").read_text(encoding="utf-8")

    def esc(s):
        return s.replace("\\", "\\\\").replace('"', '\\"')

    def block_repl(m):
        block = m.group(0)
        idm = re.search(r'id="([^"]+)"', block)
        if not idm:
            return block
        new_name = id_to_new_name.get(idm.group(1))
        if new_name is None:
            return block
        return re.sub(r'name="[^"]*"', f'name="{esc(new_name)}"', block, count=1)

    new_src = re.sub(r"dict\([^)]*?\),", block_repl, src, flags=re.S)
    (ROOT / "scripts" / "wardrobe_data.py").write_text(new_src, encoding="utf-8")
    print("Wrote scripts/wardrobe_data.py")


if __name__ == "__main__":
    main()
