#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Daily journal import: merges queued entries from the "Journal Queue" Google
Sheet (CSV export) into data/journal.json, which build_journal.py then
renders into journal.html + journal-<slug>.html pages.

Sheet columns: Date | Type | Title | Slug | Excerpt | Body | Notes
  - Date: YYYY-MM-DD. Rows dated after today (America/New_York) are skipped.
  - Body: markdown-ish plain text; blank lines separate paragraphs. Passed
    through raw, matching the existing convention (vol-53 embeds raw HTML).
  - Notes: internal only, never published.

Dedupe: the repo is the source of truth for what's published. Any row whose
Slug already exists in data/journal.json is skipped -- the sheet is an
append-only queue.

Usage:
    python3 scripts/journal_from_sheet.py [SOURCE]
    python3 scripts/journal_from_sheet.py --json data/journal.json --source sheet.csv

SOURCE defaults to the live sheet CSV export. Pass a local file path to test.
Exit 0 always; prints "no new entries" when there is nothing to add.
"""
import argparse
import csv
import io
import json
import math
import re
import sys
import urllib.request
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_JSON = ROOT / "data" / "journal.json"

# Journal Queue sheet (link-shared CSV export -- no auth required).
SHEET_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1nC5__FG5g36uWrsDZumuZa2mh6_P-JqGCUnCpzgQBno/export?format=csv"
)

NY = ZoneInfo("America/New_York")

# Sheet "Type" -> (cat, catlabel), mirroring the CATS filter list in
# build_journal.py. Unknown types fall back to style with a warning.
CATS = {
    "automotive": ("automotive", "Motors"),
    "style": ("style", "Style"),
    "timepiece": ("timepiece", "Timepiece"),
    "business": ("business", "Business"),
    "tech": ("tech", "Tech"),
    "music": ("music", "Music"),
    "news": ("news", "News"),
    "film": ("film", "Film"),
    "gaming": ("gaming", "Gaming"),
    "art": ("art", "Art"),
    "sports": ("sports", "Sports"),
    "travel": ("travel", "Travel"),
    "charlotte": ("charlotte", "Charlotte"),
    # The daily-law series files under Style (the gentleman's way of
    # showing up) -- the closest bucket in the 13-category system.
    "law": ("style", "Style"),
    "daily law": ("style", "Style"),
}

# build_journal.py requires post["hero"] (KeyError without it) and the
# card/hero templates reference assets/img/{img}@sm.{ext}. paris-pinstripe
# is the site's default journal share image and ships both sizes.
DEFAULT_HERO = {
    "img": "paris-pinstripe",
    "ext": "jpg",
    "mode": "cover",
    "srcset": True,
    "alt": "Paris Pullen",
}


def fetch_csv(source):
    if source.startswith("http://") or source.startswith("https://"):
        req = urllib.request.Request(
            source, headers={"User-Agent": "parispullen-journal-import/1.0"}
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8-sig")
    else:
        raw = Path(source).read_text(encoding="utf-8-sig")
    # csv module handles multiline quoted fields.
    return list(csv.DictReader(io.StringIO(raw)))


def normalize_slug(s):
    s = (s or "").strip().lower()
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9\-]", "", s)
    return s


def split_paragraphs(body):
    parts = re.split(r"\n\s*\n", (body or "").strip())
    return [p.strip() for p in parts if p.strip()]


def read_minutes(paragraphs):
    words = sum(len(p.split()) for p in paragraphs)
    return max(1, math.ceil(words / 200))


def map_category(type_raw):
    key = (type_raw or "").strip().lower()
    if key in CATS:
        return CATS[key]
    print(f"  warning: unknown Type {type_raw!r} -- falling back to Style")
    return ("style", "Style")


def load_posts(json_path):
    posts = json.loads(Path(json_path).read_text(encoding="utf-8"))
    return posts


def next_vol(posts):
    def vol_key(p):
        try:
            return int(str(p.get("vol", "0")).strip())
        except ValueError:
            return 0

    return max((vol_key(p) for p in posts), default=0) + 1


def build_entry(row, vol):
    title = row.get("Title", "").strip()
    slug = normalize_slug(row.get("Slug", ""))
    excerpt = row.get("Excerpt", "").strip()
    paragraphs = split_paragraphs(row.get("Body", ""))
    cat, catlabel = map_category(row.get("Type", ""))
    return {
        "slug": slug,
        "cat": cat,
        "catlabel": catlabel,
        "vol": str(vol),
        "read": f"{read_minutes(paragraphs)} min read",
        "title": title,
        "stand": excerpt,
        "featured": False,
        "wide": False,
        "hero": dict(DEFAULT_HERO),
        "body": paragraphs,
        "meta_description": excerpt,
        "status": "published",
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source", nargs="?", default=SHEET_CSV_URL)
    ap.add_argument("--json", default=str(DEFAULT_JSON))
    ap.add_argument("--source", dest="source_opt", default=None)
    args = ap.parse_args()
    source = args.source_opt or args.source

    posts = load_posts(args.json)
    existing_slugs = {normalize_slug(p.get("slug", "")) for p in posts}
    today = datetime.now(NY).date()
    vol = next_vol(posts)

    try:
        rows = fetch_csv(source)
    except Exception as e:  # noqa: BLE001 -- report and exit clean
        print(f"error: could not fetch CSV from {source}: {e}")
        return 0

    added, skipped = [], []

    for i, row in enumerate(rows, start=2):  # row 1 is the header
        title = (row.get("Title") or "").strip()
        slug = normalize_slug(row.get("Slug"))
        body = (row.get("Body") or "").strip()
        date_raw = (row.get("Date") or "").strip()

        if not title or not slug or not body:
            skipped.append((i, slug or title or "?", "empty Title/Slug/Body"))
            continue
        try:
            row_date = datetime.strptime(date_raw, "%Y-%m-%d").date()
        except ValueError:
            skipped.append((i, slug, f"bad Date {date_raw!r} (want YYYY-MM-DD)"))
            continue
        if row_date > today:
            skipped.append((i, slug, f"Date {date_raw} is in the future"))
            continue
        if slug in existing_slugs:
            skipped.append((i, slug, "slug already published"))
            continue

        entry = build_entry(row, vol)
        posts.append(entry)
        existing_slugs.add(slug)
        added.append((slug, entry["vol"], entry["title"]))
        vol += 1

    if added:
        Path(args.json).write_text(
            json.dumps(posts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )

    print(f"source: {source}")
    print(f"today (ET): {today.isoformat()} | rows read: {len(rows)}")
    for slug, v, t in added:
        print(f"  added vol {v}: {slug} -- {t}")
    for lineno, slug, reason in skipped:
        print(f"  skipped row {lineno} ({slug}): {reason}")
    if not added:
        print("no new entries")
    else:
        print(f"added {len(added)} entr{'y' if len(added) == 1 else 'ies'} "
              f"to {args.json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
