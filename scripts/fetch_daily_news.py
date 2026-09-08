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

TB_SEED = {
    "automotive": ["Ferrari", "Porsche", "Karma Automotive", "Singer Vehicle Design", "Louis Vuitton", "Aston Martin", "Maserati", "Bugatti"],
    "style": ["Kith", "Ralph Lauren", "Tom Ford", "Zegna", "Brunello Cucinelli", "adidas"],
    "timepiece": ["A. Lange & Söhne", "Piaget", "Vacheron Constantin", "Parmigiani Fleurier", "Berneron", "Patek Philippe", "Rolex", "Audemars Piguet"],
    "business": ["Apple", "Nike", "LVMH", "Tim Cook", "HelloFresh"],
    "tech": ["Apple", "Tesla", "OpenAI", "Meta"],
    "music": ["Drake", "OVO Sound", "Kendrick Lamar", "Jay-Z"],
    "news": ["GQ", "Rolling Stone", "Complex", "Hypebeast", "Robb Report", "Highsnobiety"],
    "film": ["Guy Ritchie", "A24", "Netflix", "Christopher Nolan", "Warner Bros"],
    "gaming": ["Rockstar Games", "PlayStation", "Xbox"],
    "art": ["Daniel Arsham", "KAWS", "Takashi Murakami"],
    "sports": ["Roger Federer", "Stephen Curry", "Michael Jordan", "LeBron James"],
    "travel": ["TRUNK Hotel", "NOT A HOTEL", "Aman Resorts", "Four Seasons"],
    "charlotte": ["Charlotte Observer", "Axios Charlotte", "Queen City News"],
}


def fetch(url, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def get_tracked_terms():
    """Active names from the dashboard's Tracked Brands tab, falling back
    to the same seed list the dashboard itself seeds a first-time-empty
    list with, so this works even before anyone's saved that tab once."""
    try:
        raw = fetch(f"{SITE}/api/content?collection=tracked-brands&id=main")
        data = json.loads(raw)
        categories = data.get("categories") or {}
        if categories:
            terms = []
            for entries in categories.values():
                for e in entries:
                    if e.get("active") and e.get("name"):
                        terms.append(e["name"])
            if terms:
                return sorted(set(terms))
    except Exception as e:
        print(f"  (tracked-brands fetch failed, using seed list: {e})", file=sys.stderr)
    return sorted({name for names in TB_SEED.values() for name in names})


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


def parse_rss(xml_bytes, source_label, matched_label=None):
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
            "_published": published,
        })
    return items


def google_news_rss(term):
    q = urllib.parse.quote(f'"{term}"')
    return f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"


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

    terms = get_tracked_terms()
    print(f"Tracking {len(terms)} term(s): {', '.join(terms)}")
    for term in terms:
        try:
            raw = fetch(google_news_rss(term))
            found = parse_rss(raw, "Google News", matched_label=term)
            all_items.extend(found)
            print(f"  \"{term}\": {len(found)} item(s)")
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
