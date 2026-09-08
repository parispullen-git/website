#!/usr/bin/env python3
"""
Daily News pipeline -- run on a schedule by
.github/workflows/daily-news.yml (once a day), never manually as part of
a normal site build.

Pulls two kinds of sources, both RSS/Atom, both needing no API key or
signup:
  1. A curated list of real menswear/luxury/culture outlets (below).
  2. A live Google News RSS search per active entry in Tracked Brands
     (the dashboard tab at /dashboard.html -- "Tracked Brands"), so
     brand/person/outlet coverage grows or shrinks exactly as that list
     is edited, with no code change needed here.

Writes the merged, deduped, most-recent items straight to the dashboard's
existing KV content store via POST /api/content?collection=daily-news
(id "main") -- the same authed endpoint the dashboard itself uses, gated
by DASHBOARD_PASSPHRASE_HASH (a GitHub Actions secret, the same hash
dashboard.html's own passphrase gate already checks against). This is
deliberately NOT a data/*.json file in the repo: writing there would need
a full rebuild + deploy to show up, and news freshness is exactly the
case KV's "no deploy needed" write path exists for.
"""
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

SITE = "https://www.parispullen.com"
UA = "Mozilla/5.0 (compatible; ParisPullenDailyNews/1.0)"
FRESHNESS_HOURS = 48
MAX_ITEMS = 40

# Real, on-brand outlets covering menswear/luxury/culture -- always
# searched regardless of what's checked in Tracked Brands, since these
# are sources rather than search terms.
CURATED_FEEDS = [
    ("GQ", "https://www.gq.com/feed/rss"),
    ("Hypebeast", "https://hypebeast.com/feed"),
    ("Highsnobiety", "https://www.highsnobiety.com/feed/"),
    ("Hodinkee", "https://www.hodinkee.com/articles.rss"),
    # Complex's own RSS endpoint 404s as of this writing -- dropped rather
    # than guessed; "Complex" is still covered via the Google News search
    # below since it's in TB_SEED's news category.
]

# Only Drake is tracked right now, by explicit request -- every other
# category sits empty until entries are added back via the dashboard's
# Tracked Brands tab (or this seed, which only matters as a fallback for
# whenever tracked-brands hasn't been saved there yet at all).
TB_SEED = {
    "music": ["Drake"],
}


def fetch(url, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def get_tracked_terms():
    """(term, category) pairs for every active entry in the dashboard's
    Tracked Brands tab, falling back to the same seed list the dashboard
    itself seeds a first-time-empty list with, so this works even before
    anyone's saved that tab once. Category rides along so each resulting
    news item can be filtered by it on the Daily News tab; a term saved
    under more than one category (possible, if someone adds the same name
    twice) is only searched once but keeps its first category."""
    try:
        raw = fetch(f"{SITE}/api/content?collection=tracked-brands&id=main")
        data = json.loads(raw)
        categories = data.get("categories") or {}
        if categories:
            pairs = []
            seen_names = set()
            for cat, entries in categories.items():
                for e in entries:
                    name = e.get("name")
                    if e.get("active") and name and name not in seen_names:
                        seen_names.add(name)
                        pairs.append((name, cat))
            if pairs:
                return sorted(pairs)
    except Exception as e:
        print(f"  (tracked-brands fetch failed, using seed list: {e})", file=sys.stderr)
    seen_names = set()
    pairs = []
    for cat, names in TB_SEED.items():
        for name in names:
            if name not in seen_names:
                seen_names.add(name)
                pairs.append((name, cat))
    return sorted(pairs)


def parse_pubdate(text):
    if not text:
        return None
    text = text.strip()
    for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z", "%Y-%m-%dT%H:%M:%S%z"):
        try:
            dt = datetime.strptime(text, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except ValueError:
            continue
    return None


MEDIA_NS = "{http://search.yahoo.com/mrss/}"
IMG_TAG_RE = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.I)


def find_thumbnail(item):
    """Best-effort image extraction -- most feeds use one of these three
    shapes; Google News RSS items use none of them, so those items simply
    end up with no thumbnail (there's no reliable image field on Google
    News' own RSS to take one from)."""
    media = item.find(f"{MEDIA_NS}thumbnail")
    if media is not None and media.get("url"):
        return media.get("url")
    media = item.find(f"{MEDIA_NS}content")
    if media is not None and media.get("url") and (media.get("medium") == "image" or "image" in (media.get("type") or "")):
        return media.get("url")
    enclosure = item.find("enclosure")
    if enclosure is not None and enclosure.get("url") and "image" in (enclosure.get("type") or ""):
        return enclosure.get("url")
    for tag in ("{http://purl.org/rss/1.0/modules/content/}encoded", "description", "summary"):
        el = item.find(tag)
        if el is not None and el.text:
            m = IMG_TAG_RE.search(el.text)
            if m:
                return m.group(1)
    return None


def parse_rss(xml_bytes, source_label, matched_label=None, category=None):
    items = []
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return items
    # RSS 2.0 (<item>) and Atom (<entry>) both show up across these feeds.
    for item in root.iter():
        tag = item.tag.split("}")[-1]
        if tag not in ("item", "entry"):
            continue
        title_el = item.find("title")
        title = (title_el.text or "").strip() if title_el is not None else ""
        link = ""
        link_el = item.find("link")
        if link_el is not None:
            link = (link_el.text or link_el.get("href") or "").strip()
        date_el = item.find("pubDate")
        if date_el is None:
            date_el = item.find("{http://www.w3.org/2005/Atom}published")
        if date_el is None:
            date_el = item.find("{http://www.w3.org/2005/Atom}updated")
        published = parse_pubdate(date_el.text if date_el is not None else None)
        if not title or not link:
            continue
        items.append({
            "title": re.sub(r"\s+", " ", title)[:200],
            "link": link,
            "source": source_label,
            "matched": matched_label,
            "category": category,
            "thumbnail": find_thumbnail(item),
            "_published": published,
        })
    return items


# Extra unquoted words appended to an exact-phrase search to steer a
# common/ambiguous name toward the right category -- "Drake" alone pulls
# in a lot of the NFL quarterback Drake Maye, "Drake" music does not.
CATEGORY_QUERY_HINT = {"music": "music"}


def google_news_rss(term, category=None):
    q = f'"{term}"'
    hint = CATEGORY_QUERY_HINT.get(category)
    if hint:
        q += " " + hint
    return f"https://news.google.com/rss/search?q={urllib.parse.quote(q)}&hl=en-US&gl=US&ceid=US:en"


def main():
    cutoff = datetime.now(timezone.utc) - timedelta(hours=FRESHNESS_HOURS)
    all_items = []

    for label, url in CURATED_FEEDS:
        try:
            raw = fetch(url)
            all_items.extend(parse_rss(raw, label))
            print(f"  {label}: ok")
        except Exception as e:
            print(f"  {label}: FAILED ({e})", file=sys.stderr)
        time.sleep(0.3)

    pairs = get_tracked_terms()
    print(f"Tracking {len(pairs)} term(s): {', '.join(t for t, c in pairs)}")
    for term, category in pairs:
        try:
            raw = fetch(google_news_rss(term, category))
            found = parse_rss(raw, "Google News", matched_label=term, category=category)
            all_items.extend(found)
            print(f"  \"{term}\" ({category}): {len(found)} item(s)")
        except Exception as e:
            print(f"  \"{term}\": FAILED ({e})", file=sys.stderr)
        time.sleep(0.3)

    # Freshness + de-dupe (by link, falling back to title) + sort recent-first.
    seen = set()
    fresh = []
    for it in all_items:
        key = it["link"] or it["title"]
        if key in seen:
            continue
        seen.add(key)
        if it["_published"] and it["_published"] < cutoff:
            continue
        fresh.append(it)
    fresh.sort(key=lambda it: it["_published"] or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
    fresh = fresh[:MAX_ITEMS]

    out_items = [{
        "title": it["title"],
        "link": it["link"],
        "source": it["source"],
        "matched": it["matched"],
        "category": it["category"],
        "thumbnail": it["thumbnail"],
        "published": it["_published"].strftime("%Y-%m-%d %H:%M UTC") if it["_published"] else None,
    } for it in fresh]

    print(f"\n{len(out_items)} fresh item(s) out of {len(all_items)} fetched.")

    passphrase_hash = __import__("os").environ.get("DASHBOARD_PASSPHRASE_HASH")
    if not passphrase_hash:
        print("DASHBOARD_PASSPHRASE_HASH not set -- printing result instead of posting.", file=sys.stderr)
        print(json.dumps(out_items, indent=2, ensure_ascii=False))
        return

    body = json.dumps({
        "passphraseHash": passphrase_hash,
        "id": "main",
        "data": {"items": out_items, "updatedAt": int(time.time() * 1000)},
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{SITE}/api/content?collection=daily-news",
        data=body, method="POST",
        headers={"Content-Type": "application/json", "User-Agent": UA},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            print("Posted:", res.read().decode("utf-8")[:300])
    except urllib.error.HTTPError as e:
        print(f"POST failed: {e.code} {e.read().decode('utf-8', 'replace')[:500]}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
