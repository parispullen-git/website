#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
One-time migration helper: dumps inline Python data literals into JSON files
under data/, so the local Operator Console can edit them directly instead of
hand-editing Python source.

Run from the repo root: python3 scripts/export_content_json.py

Each section below only runs while its source literal still exists — once a
script has been migrated to load from data/*.json (see wardrobe_data.py,
build_journal.py, build_casefiles.py for the pattern), its extraction step
here becomes a no-op and can eventually be deleted. Currently handles:
NEIGHBORHOODS (build_charlotte.py) and PIANO_PLAYLISTS (build_house.py).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)


def dump(name, value):
    out = DATA_DIR / f"{name}.json"
    out.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {out} ({len(value)} records)")


def extract(py_file, pattern, var_name, json_name):
    src = (ROOT / py_file).read_text(encoding="utf-8")
    m = re.search(pattern, src, re.M | re.S)
    if not m:
        print(f"skip {py_file}: {var_name} literal not found (already migrated?)")
        return
    ns = {}
    exec(m.group(0), ns)  # noqa: S102 -- trusted local source file, not user input
    dump(json_name, ns[var_name])


extract("build_charlotte.py", r"^NEIGHBORHOODS = \[.*?^\]\s*$", "NEIGHBORHOODS", "charlotte-locations")
extract("build_house.py", r"^PIANO_PLAYLISTS = \[.*?^\]\s*$", "PIANO_PLAYLISTS", "house-music")
