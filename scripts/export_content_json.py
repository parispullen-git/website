#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
One-time (and re-runnable) migration: dumps the inline Python data literals
that back wardrobe.html, journal.html, and casefiles.html into JSON files
under data/, so the local Operator Console can edit them directly.

Run once from the repo root: python3 scripts/export_content_json.py

Safe to re-run — it only reads the *.py sources and overwrites data/*.json;
it never touches wardrobe_data.py / build_journal.py / build_casefiles.py.
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


# ---- wardrobe: wardrobe_data.py is pure data, safe to import directly ----
import sys
sys.path.insert(0, str(ROOT / "scripts"))
from wardrobe_data import WARDROBE  # noqa: E402
dump("wardrobe", WARDROBE)


# ---- journal: extract just `def PQ` + `JOURNAL_POSTS = [...]` and exec it
#      in isolation, since build_journal.py as a whole has file-writing
#      side effects at import time. ----
src = (ROOT / "build_journal.py").read_text(encoding="utf-8")
m = re.search(r"^def PQ\(.*?^JOURNAL_POSTS = \[.*?^\]\s*$", src, re.M | re.S)
if not m:
    raise SystemExit("Could not locate JOURNAL_POSTS literal in build_journal.py")
ns = {}
exec(m.group(0), ns)  # noqa: S102 -- trusted local source file, not user input
dump("journal", ns["JOURNAL_POSTS"])


# ---- casefiles: `CASES = [...]` has no external dependencies ----
src = (ROOT / "build_casefiles.py").read_text(encoding="utf-8")
m = re.search(r"^CASES = \[.*?^\]\s*$", src, re.M | re.S)
if not m:
    raise SystemExit("Could not locate CASES literal in build_casefiles.py")
ns = {}
exec(m.group(0), ns)  # noqa: S102
dump("casefiles", ns["CASES"])
