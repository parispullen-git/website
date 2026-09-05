#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates charlotte.html — "Charlotte: A Gentleman's Guide".

A real, practical city guide (unlike the rest of the site's fictional
"Gentleman Operator" lore) covering verified restaurants, bars, cigar
lounges, clubs and coffee counters across seven Charlotte NC neighborhood
groups. Every listing was checked against current web sources at build
time; anything that could not be confirmed is flagged in-page rather
than invented — see ACCESS_NOTES / fields marked "Confirm before visiting."

Header/menu/footer are pulled live from index.html at build time (same
approach as build_house.py) so they never drift out of sync with the
rest of the site.

Images: every media slot on every listing is a styled placeholder
(no photography is embedded). Verifying reuse-safe, properly licensed
photography for ~60 real businesses was out of scope for this pass —
see the build report. Swap in press-kit or owner-supplied images later
by replacing the .vcard__ph / .vquick__ph markup with <img> tags.

Neighborhood/venue data lives in data/charlotte-locations.json (edit
directly, or via the local Operator Console) -- then re-run:
python3 build_charlotte.py
"""
import json
import re
from pathlib import Path

_index_src = open("index.html", encoding="utf-8").read()
SITE_HEADER = re.search(r'<header class="worldnav">.*?</header>', _index_src, re.S).group(0)
SITE_MENU = re.search(r'<nav class="menu".*?</nav>', _index_src, re.S).group(0)
SITE_FOOT = re.search(r'<footer class="foot foot--film">.*?</footer>', _index_src, re.S).group(0)

def esc(t):
    if t is None:
        return ""
    return (str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;").replace("'", "&#8217;"))

def slug(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')

# ----------------------------------------------------------------------
# Reference tables
# ----------------------------------------------------------------------

CATEGORY_MEDIA_LABEL = {
    "Restaurant": "Signature Dish",
    "Steak & Seafood": "Signature Dish",
    "Cocktail Bar": "Signature Drink",
    "Rooftop Bar": "Signature Drink",
    "Hotel Bar": "Signature Drink",
    "Wine Bar": "Signature Pour",
    "Speakeasy": "Signature Drink",
    "Cigar Lounge": "The Lounge",
    "Coffee": "Signature Pour",
    "Live Music": "The Room",
    "Tennis": "The Courts",
    "Golf & Country Club": "The Course",
    "Public Recreation": "The Grounds",
    "District / Neighborhood": "The District",
    "Food Hall": "The Hall",
}

FILTERS = [
    ("date-night", "Date Night"),
    ("business-dinner", "Business Dinner"),
    ("client-entertainment", "Client Entertainment"),
    ("after-work", "After Work"),
    ("solo-coffee", "Solo Coffee"),
    ("weekend-brunch", "Weekend Brunch"),
    ("late-night", "Late Night"),
    ("cigars", "Cigars"),
    ("live-music", "Live Music"),
    ("tennis", "Tennis"),
    ("golf", "Golf"),
    ("private-club", "Private Club"),
    ("rooftop", "Rooftop"),
]

PRICE_LEGEND = [
    ("$", "Under $20 / person"),
    ("$$", "$20 – $45"),
    ("$$$", "$45 – $90"),
    ("$$$$", "$90+"),
    ("Member", "Private-membership or guest-access venue"),
]

# ----------------------------------------------------------------------
# Neighborhood groups, in the order specified for the guide.
# Each venue: name, cat, cat2 (optional), addr, price, access,
#   access_note (optional confirm flag shown on the card + drawer),
#   desc (30-55 words, house voice), best (<=4), spec (<=5),
#   mapq (map search string), site (optional), filters (list of slugs)
# ----------------------------------------------------------------------

NEIGHBORHOODS = json.loads((Path(__file__).resolve().parent / "data" / "charlotte-locations.json").read_text(encoding="utf-8"))

# ----------------------------------------------------------------------
# Render
# ----------------------------------------------------------------------

def venue_id(nid, v):
    return nid + "-" + slug(v["name"])

def venue_card(nid, v):
    vid = venue_id(nid, v)
    cat = v["cat"]
    catline = esc(cat) + (" &#183; " + esc(v["cat2"]) if v.get("cat2") else "")
    media_label = CATEGORY_MEDIA_LABEL.get(cat, "The Room")
    access_slug = slug(v["access"])
    filters = " ".join(v.get("filters", []))
    teaser = v["desc"]
    if len(teaser) > 118:
        teaser = teaser[:115].rsplit(" ", 1)[0] + "…"
    site = v.get("site", "")
    note = v.get("access_note", "")
    best = "|".join(v.get("best", []))
    spec = "|".join(v.get("spec", []))
    return f'''      <article class="vcard" id="{vid}"
        data-id="{vid}" data-cat="{esc(cat)}" data-filters="{esc(filters)}"
        data-name="{esc(v["name"])}" data-catline="{catline}"
        data-addr="{esc(v["addr"])}" data-price="{esc(v["price"])}"
        data-access="{esc(v["access"])}" data-access-slug="{access_slug}"
        data-note="{esc(note)}" data-desc="{esc(v["desc"])}"
        data-best="{esc(best)}" data-spec="{esc(spec)}"
        data-mapq="{esc(v["mapq"])}" data-site="{esc(site)}"
        data-media-label="{esc(media_label)}">
        <button class="vcard__open" type="button">
          <span class="vcard__media"><span class="vcard__ph">{esc(v["name"])} &#183; Exterior</span></span>
          <span class="vcard__cat">{catline}</span>
          <span class="vcard__name">{esc(v["name"])}</span>
          <span class="vcard__note">{esc(teaser)}</span>
          <span class="vcard__meta">
            <span class="vcard__price">{esc(v["price"])}</span>
            <span class="vcard__access" data-access="{access_slug}">{esc(v["access"])}</span>
          </span>
        </button>
      </article>
'''

def neighborhood_section(n):
    cards = "".join(venue_card(n["id"], v) for v in n["venues"])
    return f'''<section class="vhood" id="{n["id"]}" aria-labelledby="{n["id"]}-h">
  <div class="wrap">
    <details class="vhood__acc">
      <summary class="vhood__head reveal">
        <p class="eyebrow">District {n["order"]} of 07</p>
        <h2 class="vhood__name" id="{n["id"]}-h">{esc(n["name"])}</h2>
        <p class="body vhood__blurb">{esc(n["blurb"])}</p>
        <p class="classified vhood__count">{len(n["venues"])} listing{"s" if len(n["venues"]) != 1 else ""} in this district</p>
        <span class="vhood__toggle" aria-hidden="true"></span>
      </summary>
      <div class="vgrid reveal reveal-d1">
{cards}      </div>
      <p class="vempty" hidden>No listings here match the current filters.</p>
    </details>
  </div>
</section>
'''

price_legend = "".join(
    f'<div><dt>{esc(sym)}</dt><dd>{esc(desc)}</dd></div>' for sym, desc in PRICE_LEGEND
)

total_venues = sum(len(n["venues"]) for n in NEIGHBORHOODS)

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Charlotte: A Gentleman's Guide &#8212; Paris Pullen</title>
<meta name="description" content="A real, verified guide to Charlotte, North Carolina &#8212; {total_venues} restaurants, bars, cigar lounges, clubs and coffee counters across seven districts, sourced and checked, not invented.">
<meta name="theme-color" content="#0A0A0B">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/world.css">
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>

{SITE_HEADER}

{SITE_MENU}

<nav class="rail-nav" aria-label="Section navigation">
  <a href="#map" data-track="map">The Map</a>
  <a href="#guide" data-track="guide">The Guide</a>
  <a href="#legend" data-track="legend">How to Read It</a>
</nav>

<main>

<!-- ============ HERO ============ -->
<section class="scene scene--pad" style="padding-top:clamp(8rem,20vh,13rem);padding-bottom:clamp(3rem,6vh,5rem)">
  <div class="wrap">
    <header class="split reveal" style="align-items:end">
      <div class="stack stack--tight">
        <p class="eyebrow">Charlotte, North Carolina</p>
        <h1 class="display display--mega">A Gentleman&#8217;s<br>Guide</h1>
      </div>
      <div class="stack">
        <p class="lede">A banking city that dresses conservatively and negotiates hard. Quiet money, loud weekends. This is a working guide, not a mood board &#8212; {total_venues} real, current listings across seven districts, every address and access rule checked before it went on the page.</p>
        <p class="classified">{total_venues} verified listings &#183; Seven districts &#183; Sourced and checked, not invented</p>
      </div>
    </header>
  </div>
</section>

<!-- ============ THE MAP ============ -->
<section class="cityscape" id="map">
  <div class="cityscape__head reveal">
    <p class="eyebrow">The Map</p>
    <h2 class="display display--h2" style="margin-block:var(--s3)">Seven districts.</h2>
    <p class="lede">Each with its own hours, its own dress code and its own reason to go. Select a district and its venues surface as hotspots on the map itself &#8212; select a venue, and it opens right here.</p>
  </div>

  <div class="cityscape__surface reveal reveal-d1">
    <div class="cityplate">
      <img src="assets/img/citymap-plate.jpg"
           srcset="assets/img/citymap-plate@sm.jpg 1300w, assets/img/citymap-plate.jpg 2600w"
           sizes="100vw" alt="Aerial map of Charlotte with district boundaries"
           loading="lazy" width="2600" height="1463">
      <div class="cityplate__scrim"></div>
      <svg class="citymap-svg" id="citymap" viewBox="0 0 2000 1125"
           role="group" aria-label="Charlotte districts">
        <!-- chrome and districts injected by city.js -->
      </svg>
      <!-- venue hotspots for the selected district injected by city-explorer.js -->
    </div>
  </div>

  <div class="cityhud reveal reveal-d2">
    <div class="cityread" id="cityread"></div>
    <p class="classified" style="margin-top:var(--s4)">Hover or tab across the city &#183; select a venue to open it &#183; full listings below by district</p>
  </div>
</section>

<!-- Fallback preview drawer for the map's curated venue picks -- normally
     a map click hands off straight to the full #vquick drawer below (see
     assets/js/city-explorer.js), but this covers the edge case where a
     district's curated pick can't be matched to a .vcard on this page. -->
<div class="vquick" id="cityquick" aria-hidden="true">
  <div class="vquick__scrim" data-cityquick-close></div>
  <div class="vquick__panel" role="dialog" aria-modal="true" aria-label="Venue preview">
    <button class="vquick__close" data-cityquick-close aria-label="Close">&#215;</button>
    <div class="vquick__body" style="padding-top:var(--s8)">
      <p class="vquick__cat" id="cityquick-cat"></p>
      <h3 class="vquick__name" id="cityquick-name"></h3>
      <p class="body vquick__desc" id="cityquick-note"></p>
      <div class="vquick__actions">
        <a class="cta" id="cityquick-link" href="charlotte.html"><span>View Full Listing</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
        <a class="cta cta--ghost" id="cityquick-all" href="charlotte.html"><span>All Charlotte Listings</span></a>
      </div>
    </div>
  </div>
</div>

<!-- ============ THE GUIDE ============ -->
<section class="scene scene--pad tint-ink" id="guide" style="padding-bottom:0">
  <div class="wrap">
    <header class="split reveal" style="align-items:end;margin-bottom:var(--s7)">
      <div class="stack stack--tight">
        <p class="eyebrow">The Guide</p>
        <h2 class="display display--h2">{total_venues} places<br>worth knowing.</h2>
      </div>
      <p class="body">Not a list of the best places. A list of the right places, organized by district &#8212; a client dinner reads differently than a solo coffee, and this is built to tell the two apart.</p>
    </header>
  </div>
</section>

{"".join(neighborhood_section(n) for n in NEIGHBORHOODS)}

<!-- ============ HOW TO READ IT ============ -->
<section class="scene scene--pad tint-ink" id="legend">
  <div class="wrap">
    <div class="split reveal">
      <p class="pullquote">Verified, not invented.</p>
      <div class="stack">
        <p class="body">Every listing here was checked against current sources at the time this page was built &#8212; address, hours, access policy, reservation requirements. Where something couldn't be confirmed, the card says so rather than guessing. Confirm anything time-sensitive before you go; hours and policies change.</p>
        <p class="body">Cigar lounges and country clubs are marked with their access rules front and center &#8212; private, member-guest, day-pass, or public &#8212; because getting that wrong at the door is the one mistake this guide is built to prevent.</p>
      </div>
    </div>

    <div class="vlegend reveal reveal-d1" style="margin-top:var(--s8)">
      <div class="vlegend__col">
        <p class="eyebrow">Price</p>
        <dl class="vlegend__grid">{price_legend}</dl>
      </div>
      <div class="vlegend__col">
        <p class="eyebrow">Access</p>
        <dl class="vlegend__grid">
          <div><dt>Public</dt><dd>Walk in, no introduction needed</dd></div>
          <div><dt>Reservation Recommended</dt><dd>Booking advised, walk-ins possible</dd></div>
          <div><dt>Reservation Required</dt><dd>No booking, no table</dd></div>
          <div><dt>Member or Guest Access</dt><dd>Private; guests only alongside a member</dd></div>
          <div><dt>Confirm Before Visiting</dt><dd>Policy unclear or unconfirmed &#8212; call ahead</dd></div>
        </dl>
      </div>
    </div>

    <div class="split reveal" style="margin-top:var(--s9);border-top:1px solid var(--rule);padding-top:var(--s7)">
      <div class="stack">
        <p class="eyebrow">A note on images</p>
        <p class="body">Photography for these listings is intentionally left as placeholders rather than sourced from the open web without clear reuse rights. Each card is ready for an owner-supplied or press-kit image when one is confirmed.</p>
      </div>
      <div class="stack">
        <a class="cta" href="house.html"><span>The Compliment</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
        <a class="link-under" href="journal.html">Charlotte in the Journal &#8594;</a>
      </div>
    </div>
  </div>
</section>

</main>

<!-- ============ QUICK VIEW DRAWER ============ -->
<div class="vquick" id="vquick" aria-hidden="true">
  <div class="vquick__scrim" data-vquick-close></div>
  <div class="vquick__panel" role="dialog" aria-modal="true" aria-label="Listing detail">
    <button class="vquick__close" data-vquick-close aria-label="Close">&#215;</button>
    <div class="vquick__media"><span class="vquick__ph" id="vquick-ph1">Exterior</span></div>
    <div class="vquick__body">
      <p class="vquick__cat" id="vquick-cat"></p>
      <h3 class="vquick__name" id="vquick-name"></h3>
      <p class="classified" id="vquick-addr"></p>
      <div class="vquick__row">
        <span class="vquick__price" id="vquick-price"></span>
        <span class="vquick__access" id="vquick-access"></span>
      </div>
      <p class="vquick__note" id="vquick-note-flag" hidden></p>
      <p class="body vquick__desc" id="vquick-desc"></p>

      <div class="vquick__media2col">
        <div class="vquick__media"><span class="vquick__ph">Interior</span></div>
        <div class="vquick__media"><span class="vquick__ph" id="vquick-ph3">Signature</span></div>
      </div>

      <div class="vquick__taggroup">
        <p class="vquick__tagslabel">Best For</p>
        <div class="vquick__tags" id="vquick-best"></div>
      </div>
      <div class="vquick__taggroup">
        <p class="vquick__tagslabel">Specialty</p>
        <div class="vquick__tags" id="vquick-spec"></div>
      </div>

      <div class="vquick__actions">
        <a class="cta" id="vquick-map" href="#" target="_blank" rel="noopener"><span>Open in Maps</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
        <a class="cta cta--ghost" id="vquick-site" href="#" target="_blank" rel="noopener" hidden><span>Official Site</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
      </div>
    </div>
  </div>
</div>

{SITE_FOOT}

<script src="assets/js/charlotte-guide.js" defer></script>
<script src="assets/js/city-explorer.js" defer></script>
<script src="assets/js/city.js" defer></script>
<script src="assets/js/world.js" defer></script>
</body>
</html>
'''

open("charlotte.html", "w", encoding="utf-8").write(html)
print(f"charlotte.html written — {len(NEIGHBORHOODS)} districts, {total_venues} listings")
