#!/usr/bin/env python3
"""
Generates house.html — the twelve-plus floor building.
Each floor is a full-view scene with clickable artifacts.
Edit FLOORS below and re-run:  python3 build_house.py

Header/menu/footer are pulled live from index.html at build time (not
hand-authored here) so they can never drift out of sync with the rest of
the site -- editing index.html's nav/footer and re-running this script is
enough to keep house.html current.
"""
import json
import re
from pathlib import Path

_index_src = open("index.html", encoding="utf-8").read()
SITE_HEADER = re.search(r'<header class="worldnav">.*?</header>', _index_src, re.S).group(0)
SITE_MENU = re.search(r'<nav class="menu".*?</nav>', _index_src, re.S).group(0)
SITE_FOOT = re.search(r'<footer class="foot foot--film">.*?</footer>', _index_src, re.S).group(0)
# The social row is lifted from index.html too rather than re-typed here, so
# the icon set and handles can never drift from the rest of the site.
SITE_SOCIAL = re.search(r'<div class="social">.*?</a>\s*</div>', _index_src, re.S).group(0)

# The full authored room library -- all 21 rooms, including the 14 that
# aren't open to the public yet (see PENTHOUSE_FLOORS below). Edited via
# the dashboard's World > Rooms tab (functions/api/house-rooms-live.js,
# GitHub Contents API) or by hand here; either way, re-run this script
# to bake changes into house.html.
FLOORS = json.loads((Path(__file__).resolve().parent / "data" / "house-rooms.json").read_text(encoding="utf-8"))

# Room photos are re-shot in place (same filename, new bytes) rather than
# renamed, so browsers and Cloudflare's edge cache (max-age=14400) keep
# serving the old file for hours after a swap unless the URL itself
# changes. Bumping this on every image update forces a fresh fetch --
# mirror any change here in assets/js/penthouse.js's IMG_VER too.
IMG_VER = "20260917a"

def esc(t):
    return t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("'","&#8217;")

# Only Levels 26-28 (The Penthouse) are open to the public right now --
# every other floor in FLOORS is real, authored content kept around as
# source material, but not built into the site. Restricting the actual
# room-pager to this subset, rather than deleting the rest of FLOORS,
# keeps that content available to re-open later with a one-line change.
#
# Order here (not FLOORS' own narrative authoring order) is what the
# room-pager's slide direction is actually built from -- it pages by
# array index (translateX(-i*100%)), so a "left" move needs to land on a
# lower index and a "right" move a higher one, or the slide visually
# runs backwards from what the arrow/swipe implied. Each row below is an
# independent left-right chain (ROOM_ADJACENCY has no left/right link
# between rows), so only the order *within* each row matters:
#   Closet -> Bedroom -> Bathroom                  (Level 28)
#   Kitchen -> Living Room -> Study                (Level 27)
#   Music Lounge -> Cinema -> Gym                  (Level 26)
_PENTHOUSE_ORDER = ["closet", "bedroom", "bath",
                     "kitchen", "penthouse-living", "study",
                     "music-lounge", "cinema", "gym"]
_penthouse_by_id = {f["id"]: f for f in FLOORS if f["lvl"] in ("26", "27", "28")}
PENTHOUSE_FLOORS = [_penthouse_by_id[_id] for _id in _PENTHOUSE_ORDER]

# The Barbershop is a real open room, appended after the 3x3 penthouse
# grid above -- it's wired into ROOM_ADJACENCY as a 4th room on the
# Level 26 row (right of the Gym), so DOM order doesn't need to match
# traversal order here either. It also keeps the repurposed "window"
# markers (see BARBERSHOP_NODE_POS below) as quick-jump shortcuts from
# the far side of the penthouse, and a Floors nav panel entry.
_barbershop = next((f for f in FLOORS if f["id"] == "barbershop"), None)
if _barbershop:
    PENTHOUSE_FLOORS = PENTHOUSE_FLOORS + [_barbershop]

START_ROOM = "penthouse-living"  # data-start-room below; also which screen (if any) autoplays on load

# Room-to-room navigation is a real 2D layout -- each room's up/down
# neighbor sits in the same column one floor away:
#   Level 28:  Closet   <-> Bedroom     <-> Bathroom
#                  |            |             |
#   Level 27:  Kitchen  <-> Living Room  <-> Study
#                  |            |             |
#   Level 26:  Music Lounge <-> Cinema   <-> Gym <-> Barbershop
# Every room has an up/down neighbor except the Barbershop, a 4th room
# on the Level 26 row with no Level 27 counterpart above it. Left/right/
# up/down each name an explicit neighbor id (or are absent at an edge) --
# room-pager.js reads these directly rather than paging by array index,
# so DOM order no longer needs to match traversal order.
ROOM_ADJACENCY = {
    "closet":             {"right": "bedroom", "down": "kitchen"},
    "bedroom":            {"left": "closet", "right": "bath", "down": "penthouse-living"},
    "bath":               {"left": "bedroom", "down": "study"},
    "kitchen":            {"up": "closet", "right": "penthouse-living", "down": "music-lounge"},
    "penthouse-living":   {"left": "kitchen", "right": "study", "up": "bedroom", "down": "cinema"},
    "study":              {"left": "penthouse-living", "up": "bath", "down": "gym"},
    "music-lounge":       {"up": "kitchen", "right": "cinema"},
    "cinema":             {"left": "music-lounge", "right": "gym", "up": "penthouse-living"},
    "gym":                {"left": "cinema", "up": "study", "right": "barbershop"},
    "barbershop":         {"left": "gym"},
}

# Room-to-room nav (ROOM_ADJACENCY, above) is fully explicit now, but the
# (currently hidden, see .nav-panel:has(...) in world.css) corner "Floors"
# panel still lists every open level by its own entry room, which needs
# levels sorted top-to-bottom. Levels aren't plain integers ("G", "B1",
# "B2", "12M" all appear), and FLOORS' own file order groups same-level
# rooms together for narrative reasons rather than strict building order,
# so it can't be used directly for floor ordering -- level_key() gives
# every level a real, comparable number.
def level_key(lvl):
    if lvl == "G":
        return 0.0
    if lvl.startswith("B"):
        return -float(lvl[1:])
    if lvl.endswith("M"):
        return float(lvl[:-1]) - 0.5  # a mezzanine sits just below its numbered floor
    return float(lvl)

_level_entry_room = {}  # level string -> id of that level's first room in file order
for _f in PENTHOUSE_FLOORS:
    _level_entry_room.setdefault(_f["lvl"], _f["id"])
_levels_desc = sorted(_level_entry_room, key=level_key, reverse=True)

# The corner nav-panel's button list (assets/js/nav-panel.js) -- every open
# room, not just one per floor (each level holds three rooms in a 3x3
# grid, and picking just one as that level's "entry" silently made the
# rest unreachable except by paging through prev/next one room at a
# time), grouped under a small level heading so a level with several
# rooms doesn't read as a flat, undifferentiated list.
def _nav_panel_rows():
    by_level = {}
    for f in PENTHOUSE_FLOORS:
        by_level.setdefault(f["lvl"], []).append(f)
    rows = []
    for lvl in _levels_desc:
        rows.append(f'<p class="nav-panel__group">Level {lvl}</p>')
        for room in by_level[lvl]:
            rows.append(
                f'<button type="button" class="nav-panel__btn" data-nav-panel-go="{room["id"]}">'
                f'<span class="nav-panel__btn-lvl">{lvl}</span>'
                f'<span class="nav-panel__btn-name">{esc(room["name"])}</span></button>'
            )
    return "\n    ".join(rows)

# The mobile menu's Explore section (index.html's <nav class="menu">, hand-
# authored, not generated) is meant to list every open room -- warn rather
# than fail if someone adds/removes/renames one here and forgets to update
# that hand-typed list, since drift there is silent otherwise.
_menu_room_ids = set(re.findall(r'href="house\.html#([\w-]+)"', SITE_MENU))
_floor_ids = set(f["id"] for f in PENTHOUSE_FLOORS)
if _menu_room_ids != _floor_ids:
    import sys
    _missing = _floor_ids - _menu_room_ids
    _stale = _menu_room_ids - _floor_ids
    if _missing:
        print(f"WARNING: index.html's menu Explore list is missing floors: {sorted(_missing)}", file=sys.stderr)
    if _stale:
        print(f"WARNING: index.html's menu Explore list has floors no longer open: {sorted(_stale)}", file=sys.stderr)

# Rooms with a playable screen — id/label must match the matching entry in
# CHANNEL_SETS[channel_set][0] in assets/js/tv-remote.js.
TV_SCREENS = {
    "penthouse-living": dict(
        x="55.7%", y="24.0%", w="17%", h="14%",
        box="0.4740,0.1704,0.6406,0.3093",
        channel_set="living", id="kDK8-psUjzY", label="FOMO — Drake",
    ),
    "cinema": dict(
        x="49.7%", y="30.9%", w="28%", h="25%",
        box="0.3563,0.1833,0.6385,0.4352",
        channel_set="cinema", id="kDK8-psUjzY", label="FOMO — Drake",
    ),
}

# Physical "open the remote" artifact-style marker in the room photo, for
# rooms where it's worth one -- reachable without clicking the screen
# itself, or (for the Living Room, sitting mid-room where it just got in
# the way of the coffee table) the always-visible fixed Remote pill.
# Cinema sits at the foot of the screen (derived from its box above --
# y + h/2, the bottom edge). A room with no TV_SCREENS entry (Music
# Lounge has no screen at all) still gets a marker here, forced to the
# remote's Music tab instead of a channel -- see the "music" fallback in
# floor_html() below and tv-remote.js's toggle handler.
REMOTE_NODE_POS = {
    "cinema": ("50%", "45%"),
    "music-lounge": ("50%", "62%"),
}

# "The Barbershop" marker -- a real link to the Barbershop room (was "The
# City", linking to charlotte.html, until repointed here), styled exactly
# like an artifact dot but NOT a drawer (no data-artifact attribute, so
# world.js's drawer delegate never claims the click and the <a> navigates
# normally). Same shape as REMOTE_NODE_POS above: any room that has glass
# worth walking through gets an entry here, positioned on that room's own
# view. Keep every position clear of the fixed left/right nav arrows --
# those are pinned to the viewport edges and vertically centred, so stay
# past x=14% on the left and off mid-height at the far right.
BARBERSHOP_NODE_POS = {
    "penthouse-living": ("21%", "10%"),   # clean window pane above the stairwell beam, skyline visible
    "bedroom":          ("19%", "18.6%"), # clear glass past the lamp, above the lounge chair
    "bath":             ("38%", "6%"),    # the skyline through the window, clear of the tub and plant
    "kitchen":          ("27.5%", "3.75%"),  # clean skyline pane left of the curtain, clear of the plant
    "music-lounge":     ("72%", "8%"),    # the sliver of skyline beside the bar's PP sign, past the curtain
}

KITCHEN_HELLOFRESH_UNLOCK = '''<div class="hf-unlock">
                  <p class="hf-unlock__eyebrow">Unlocked &#183; 5 Recipes Every Man Should Own</p>
                  <ul class="hf-recipe-list">
                    <li><span class="hf-recipe-list__name">Pan-Seared Filet, Peppercorn Sauce</span><span class="hf-recipe-list__note">The one that never needs an occasion.</span></li>
                    <li><span class="hf-recipe-list__name">Miso-Glazed Salmon, Charred Broccolini</span><span class="hf-recipe-list__note">Fifteen minutes, looks like an hour.</span></li>
                    <li><span class="hf-recipe-list__name">French Onion Steak Frites</span><span class="hf-recipe-list__note">For the night you're not ordering in.</span></li>
                    <li><span class="hf-recipe-list__name">Rigatoni alla Vodka, Torn Basil</span><span class="hf-recipe-list__note">Cooks in one pan. Photographs in every light.</span></li>
                    <li><span class="hf-recipe-list__name">Smoked Paprika Chicken, Root Vegetables</span><span class="hf-recipe-list__note">The one you actually make twice a week.</span></li>
                  </ul>
                  <a class="cta cta--ghost hf-unlock__cta" href="pantry.html"><span>Get the Box &#8212; HelloFresh &#215; Paris Pullen</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
                </div>'''

# A deliberately soft second touch, not a second unlock -- the Corridor's
# own "Weekly Delivery" artifact would have told this story (private
# elevator, recurring, produce) but that room isn't one of the 9 actually
# open right now (see _PENTHOUSE_ORDER above), so this lands on the Study's
# Cocktail Guide instead -- already open, already Level 27, and its own
# six-drinks rule ("never consulted in company") makes a private aside
# about tonight's menu a natural fit rather than a bolted-on mention.
STUDY_COCKTAILS_TRACE = ('<p class="body" style="margin-top:var(--s2);color:var(--ash)">'
    'One of the six has a way of turning up next to whatever&#8217;s coming out of the Kitchen &#8212; '
    '<a class="link-under" href="house.html#kitchen">see what that is this week</a>.</p>')

# The Jacket's own description (left over the chair, not hung, "wasn't
# planning on staying") already reads as the off-duty counterpoint to the
# Closet's bespoke, arranged-by-occasion suits one floor up -- so this is
# where Fashion Nova's more casual, quicker register lives, rather than
# folding it into the Closet's own pieces. Mirrors KITCHEN_HELLOFRESH_UNLOCK's
# shape (eyebrow, short list, one CTA) so the two brand unlocks read as the
# same fixture rather than two different site features.
#
# Reused verbatim (not a per-room copy) by the Music Lounge's own Polo
# artifact below -- one collab, discovered from two rooms, should read as
# the same six-piece capsule rather than drift into two different lists.
LIVING_FASHIONNOVA_UNLOCK = '''<div class="unlock">
                  <p class="unlock__eyebrow">Unlocked &#183; What He Reaches For</p>
                  <ul class="unlock-list">
                    <li><span class="unlock-list__name">The Reset Denim</span><span class="unlock-list__note">Straight through the knee. Nothing to prove.</span></li>
                    <li><span class="unlock-list__name">The Quarter-Zip</span><span class="unlock-list__note">Reads expensive from ten feet. Isn't.</span></li>
                    <li><span class="unlock-list__name">The Night Puffer</span><span class="unlock-list__note">For the walk between the car and the door.</span></li>
                    <li><span class="unlock-list__name">The Weighted Tee</span><span class="unlock-list__note">The one under everything else that actually holds its shape.</span></li>
                    <li><span class="unlock-list__name">The Going-Out Chain</span><span class="unlock-list__note">Not gold. Reads gold across a room.</span></li>
                    <li><span class="unlock-list__name">The Knit Polo</span><span class="unlock-list__note">Cream knit, chocolate collar. Doesn't ask to be noticed.</span></li>
                  </ul>
                  <a class="cta cta--ghost unlock__cta" href="off-duty.html"><span>Shop the Fit &#8212; Fashion Nova &#215; Paris Pullen</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
                </div>'''

JOURNAL_CTA = ('<a class="cta pent__open" href="journal.html" style="margin-top:var(--s2)">'
    '<span>Read the Journal</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>')

# The Monogram is the one branded object in the apartment, so its drawer is
# where the man behind the mark actually introduces himself -- portrait,
# short bio, the mission line, and the real social accounts. SITE_SOCIAL is
# lifted from index.html at build time (above) so the handles and icon set
# can't drift from the rest of the site.
MONOGRAM_BIO = f'''<div class="bio">
                  <img class="bio__portrait" src="assets/img/paris-fireside.jpg"
                       srcset="assets/img/paris-fireside@sm.jpg 562w, assets/img/paris-fireside.jpg 1125w"
                       sizes="(max-width:760px) 88vw, 30vw" alt="Paris Pullen seated fireside, holding an Emmy" loading="lazy">
                  <p class="bio__mission">The city thinks he&#8217;s selling luxury. The people who matter know he&#8217;s selling access.</p>
                  <p class="body">Charlotte, by way of three schools, seven years of trumpet and a backpack business printing t-shirts for his own classmates. A cold email nobody asked for turned into brand activation work; that turned into a nightlife partnership that made a 600-capacity room the best Friday in the city; that turned into hosting, then building rooms of his own.</p>
                  <p class="body">Menswear, hospitality, automotive culture and fragrance &#8212; run as one practice rather than four hobbies. The through-line is the same every time: put a mark on a thing, and make the right people want to be in the room with it.</p>
                  {SITE_SOCIAL}
                  <a class="cta pent__open" href="about.html" style="margin-top:var(--s2)"><span>The Man</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
                </div>'''

VAULT_CTA = ('<a class="cta pent__open" href="urwelcome.html" data-vault-enter style="margin-top:var(--s2)">'
    '<span>Enter the Vault</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>')

# The Piano artifact (Living Room) is retired -- this fixed single
# playlist on the Music Lounge's own record-player artifact is its
# replacement. No song/playlist details in the drawer at all any more --
# the controller (piano-player.js's ensureLoungeController) lives on its
# own hidden host, same as every other room's ambient track, and plays in
# the background regardless of whether this drawer's ever opened. Now-
# playing details (album art, song, room title) live on the global Suite
# Remote's Music tab only (tv-remote.js), reachable from every room.

CANDLE_COMING_SOON = '''<div class="coming-soon">
                  <span class="coming-soon__badge">UR Welcome &#183; Coming Soon</span>
                </div>'''

GUIDE_PORTAL_CTA = ('<button type="button" class="cta pent__open" data-guide-portal style="margin-top:var(--s2)">'
    '<span>Explore the City Guide</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></button>')

def floor_html(f):
    grade = (" "+f["grade"]) if f.get("grade") else ""
    arts, panels = [], []
    for a in f["arts"]:
        key,name,x,y,body,specs = a["id"],a["name"],a["x"],a["y"],a["desc"],a["specs"]
        # The Gym's Boxer skips the usual drawer entirely -- clicking it
        # should go straight into the fight, not open an info panel first.
        # Styled identically to every other artifact dot (so it still reads
        # as "a thing in the room worth investigating"), but wired directly
        # to gym-portal.js instead of world.js's drawer delegate: no
        # data-artifact means the generic drawer-toggle click handler never
        # claims it (same opt-out mechanism "The City" link already uses).
        if f["id"] == "gym" and key == "boxer":
            arts.append(
f'''        <button type="button" class="artifact" style="--x:{x};--y:{y}" data-gym-portal>
          <span class="artifact__dot" aria-hidden="true"></span>
          <span class="artifact__label">{esc(name)}</span>
        </button>''')
            continue
        notes = ('<span class="artifact__notes" aria-hidden="true"><i>&#9834;</i><i>&#9835;</i><i>&#9834;</i></span>'
                 if key == "recordplayer" else "")
        arts.append(
f'''        <button class="artifact" style="--x:{x};--y:{y}" data-artifact="{key}">
          <span class="artifact__dot" aria-hidden="true"></span>
          <span class="artifact__label">{esc(name)}</span>
          {notes}
        </button>''')
        spec = "".join(f'<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k,v in specs)
        wardrobe_cta = (
            '<a class="cta pent__open" href="wardrobe.html" style="margin-top:var(--s2)">'
            '<span>Enter the Boutique</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>'
            if (f["id"] == "closet" and key == "suits") or (f["id"] == "bedroom" and key == "suit") else ""
        )
        tag = f'Level {f["lvl"]} &#183; Artifact'
        if f["id"] == "kitchen" and key == "hellofresh":
            wardrobe_cta = KITCHEN_HELLOFRESH_UNLOCK
            tag = f'Level {f["lvl"]} &#183; Artifact &#183; HelloFresh &#215; Paris Pullen'
        elif key == "window":
            wardrobe_cta = GUIDE_PORTAL_CTA
        elif key == "journal":
            # Both the Living Room's face-down journal and the Study's
            # pencil-marked draft point at the same published dispatches.
            wardrobe_cta = JOURNAL_CTA
        elif key == "monogram":
            wardrobe_cta = MONOGRAM_BIO
        elif f["id"] == "penthouse-living" and key == "vault":
            wardrobe_cta = VAULT_CTA
        elif f["id"] == "penthouse-living" and key == "candle":
            wardrobe_cta = CANDLE_COMING_SOON
        elif f["id"] == "music-lounge" and key == "polo":
            wardrobe_cta = LIVING_FASHIONNOVA_UNLOCK
            tag = f'Level {f["lvl"]} &#183; Artifact &#183; Fashion Nova &#215; Paris Pullen'
        elif f["id"] == "kitchen" and key == "jacket":
            wardrobe_cta = LIVING_FASHIONNOVA_UNLOCK
            tag = f'Level {f["lvl"]} &#183; Artifact &#183; Fashion Nova &#215; Paris Pullen'
        elif f["id"] == "study" and key == "cocktails":
            wardrobe_cta = STUDY_COCKTAILS_TRACE
        panels.append(
f'''          <div class="drawer__panel" data-artifact="{key}" hidden>
            <div class="drawer__inner">
              <div class="drawer__head">
                <p class="drawer__tag">{tag}</p>
                <h3 class="drawer__name">{esc(name)}</h3>
              </div>
              <div class="drawer__body">
                <p class="body">{esc(body)}</p>
                <dl class="drawer__spec">{spec}</dl>
                {wardrobe_cta}
              </div>
            </div>
          </div>''')

    tv = ''
    ts = TV_SCREENS.get(f["id"])
    if ts:
        # Only the start room's own screen autoplays straight from the baked
        # HTML -- every other screen (Cinema included) starts with no src at
        # all, so nothing plays or makes sound until a visitor actually pages
        # into that room for the first time. tv-remote.js's IntersectionObserver
        # (see the "entering" branch in initScreen) lazily assigns the real,
        # muted src at that point -- see loadChannel there.
        #
        # mute=1, not the optimistic mute=0 this used to request: unmuted
        # autoplay in a cross-origin iframe is reliably blocked on mobile
        # regardless of the allow policy below, and unlike desktop (where
        # YouTube's player quietly falls back to muted-and-playing),
        # mobile browsers were sometimes just refusing to autoplay AT ALL
        # rather than falling back -- so the video never started moving.
        # Guaranteed-muted autoplay is the one mode every browser actually
        # honors; getting real sound on is entirely the job of the
        # postMessage 'unMute' attempt + guaranteed Tap-for-Sound fallback
        # in tv-remote.js's enter-room logic, same as every other screen.
        iframe_src = (
            f'https://www.youtube.com/embed/{ts["id"]}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&enablejsapi=1'
            if f["id"] == START_ROOM else ''
        )
        tv = f'''  <div class="floor-scene__screen" style="--x:{ts["x"]};--y:{ts["y"]};--w:{ts["w"]};--h:{ts["h"]}" data-tv data-channel-set="{ts["channel_set"]}" data-box="{ts["box"]}">
    <div class="floor-scene__screen-frame">
      <iframe src="{iframe_src}"
              title="" allow="autoplay; encrypted-media" loading="lazy"></iframe>
    </div>
    <div class="tv-lowerthird" data-tv-lowerthird>
      <p class="tv-lowerthird__eyebrow">Paris Pullen &#183; Now Screening</p>
      <p class="tv-lowerthird__title" data-tv-lowerthird-title>{ts["label"]}</p>
    </div>
    <button type="button" class="tv-sound-prompt" data-tv-sound-prompt hidden>&#128264; Tap for Sound</button>
    <div class="tv-remote" data-tv-remote>
      <div class="tv-remote__brand">
        <button type="button" class="tv-remote__pwr" data-tv-action="power">PWR</button>
        <span class="tv-remote__wordmark">The Compliment</span>
      </div>
      <p class="tv-remote__channel" data-tv-channel-label>{ts["label"]}</p>
      <div class="tv-remote__pad">
        <button type="button" class="tv-remote__pad-hub" data-tv-action="playpause" aria-label="Play or pause"></button>
        <button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--up" data-tv-action="ch-next" aria-label="Channel up">CH</button>
        <button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--down" data-tv-action="ch-prev" aria-label="Channel down">CH</button>
        <button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--left" data-tv-action="vol-down" aria-label="Volume down">VOL</button>
        <button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--right" data-tv-action="vol-up" aria-label="Volume up">VOL</button>
      </div>
      <div class="tv-remote__row tv-remote__row--seek">
        <button type="button" data-tv-action="rw">&#9664;&#9664;</button>
        <button type="button" data-tv-action="ff">&#9654;&#9654;</button>
      </div>
      <button type="button" class="tv-remote__mute" data-tv-action="mute">Mute</button>
      <button type="button" class="tv-remote__guide" data-tv-action="guide">Guide</button>
      <button type="button" class="tv-remote__expand" data-tv-action="expand">Watch Full Screen</button>
      <div class="tv-remote__guide-panel" data-tv-guide-panel hidden>
        <div class="tv-remote__guide-panel-head">
          <p class="tv-remote__guide-panel-eyebrow">Guide</p>
          <button type="button" data-tv-action="guide-close" aria-label="Close guide">Close &#215;</button>
        </div>
        <ul class="tv-remote__guide-panel-list" data-tv-guide-list></ul>
      </div>
    </div>
  </div>
'''

    remote_node = ''
    if f["id"] in REMOTE_NODE_POS:
        rx, ry = REMOTE_NODE_POS[f["id"]]
        # A room with its own screen forces the remote open on that
        # channel; a room with none (Music Lounge) forces it open on the
        # Music tab instead -- see the "music" case in tv-remote.js's
        # data-tv-remote-toggle click handler.
        toggle = ts["channel_set"] if ts else "music"
        remote_node = f'''        <button type="button" class="artifact artifact--remote" style="--x:{rx};--y:{ry}" data-tv-remote-toggle="{toggle}" aria-label="Open the remote">
          <span class="artifact__dot" aria-hidden="true"></span>
          <span class="artifact__label">The Remote</span>
        </button>'''

    # A real link, not a drawer -- styled exactly like any other artifact
    # marker, but tapping it leaves the room entirely rather than opening
    # a panel. Deliberately carries no data-artifact attribute, so world.js's
    # drawer handler ignores it and the <a> is allowed to navigate. Same-page
    # hash link (not a different page, like charlotte.html used to be here)
    # -- room-pager.js reads window.location.hash on load and hashchange,
    # so this lands straight on the Barbershop room, same mechanism
    # STUDY_COCKTAILS_TRACE's "house.html#kitchen" link already relies on.
    # Positions live in BARBERSHOP_NODE_POS above.
    city_link_node = ''
    if f["id"] in BARBERSHOP_NODE_POS:
        cx, cy = BARBERSHOP_NODE_POS[f["id"]]
        city_link_node = f'''        <a href="house.html#barbershop" class="artifact artifact--remote" style="--x:{cx};--y:{cy}">
          <span class="artifact__dot" aria-hidden="true"></span>
          <span class="artifact__label">The Barbershop</span>
        </a>'''

    adj = ROOM_ADJACENCY.get(f["id"], {})
    dir_attrs = "".join(f' data-{d}="{adj[d]}"' for d in ("left", "right", "up", "down") if adj.get(d))

    return f'''<section class="floor-scene{grade}" id="{f["id"]}" tabindex="-1" aria-label="Level {f["lvl"]} — {esc(f["name"])}"{dir_attrs}>
  <div class="floor-scene__surface">
    <div class="floor-scene__canvas">
      <div class="floor-scene__view">
        <img src="assets/img/{f["img"]}.jpg?v={IMG_VER}"
             srcset="assets/img/{f["img"]}@sm.jpg?v={IMG_VER} 1200w, assets/img/{f["img"]}.jpg?v={IMG_VER} 2400w"
             sizes="100vw" alt="{esc(f["name"])}" loading="lazy"
             style="--focus:{f["focus"]}" width="2400" height="1340">
{tv}        <div class="artifacts">
{chr(10).join(arts)}{chr(10) + remote_node if remote_node else ''}{chr(10) + city_link_node if city_link_node else ''}
        </div>
      </div>
    </div>
  </div>
  <div class="floor-scene__scrim"></div>

  <div class="wrap">
    <div class="floor-plate reveal">
      <p class="floor-plate__level"><b>{f["lvl"]}</b> <span>The Penthouse</span></p>
      <h2 class="floor-plate__name">{esc(f["name"])}</h2>
      <p class="floor-plate__note">{esc(f["note"])}</p>
      <p class="floor-plate__count"><i></i>{len(f["arts"])} artifact{'s' if len(f["arts"]) != 1 else ''} on this floor</p>
    </div>
  </div>

  <div class="drawer" id="drawer-{f["id"]}" aria-hidden="true">
    <button class="drawer__close">Close &#215;</button>
{chr(10).join(panels)}
  </div>
</section>
'''

NAV_PANEL_ROWS = _nav_panel_rows()

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>The Penthouse — Paris Pullen</title>
<meta name="description" content="Inside the Penthouse at The Compliment. Every room a room you have just walked into.">
<meta name="theme-color" content="#0A0A0B">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/world.css?v=22">
<link rel="stylesheet" href="assets/css/artifact-experiences.css?v=5">
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>

{SITE_HEADER}

{SITE_MENU}

<main>

<section class="room-pager" id="room-pager" aria-label="The rooms, in sequence" data-room-pager data-start-room="{START_ROOM}">
  <div class="room-pager__viewport" data-room-pager-viewport>
{"".join(floor_html(f) for f in PENTHOUSE_FLOORS)}  </div>
  <button type="button" class="room-pager__nav room-pager__nav--prev" data-room-pager-prev aria-label="Previous room"><span aria-hidden="true">&#8249;</span><span class="room-pager__nav-hint" data-room-pager-hint aria-hidden="true"></span></button>
  <button type="button" class="room-pager__nav room-pager__nav--next" data-room-pager-next aria-label="Next room"><span aria-hidden="true">&#8250;</span><span class="room-pager__nav-hint" data-room-pager-hint aria-hidden="true"></span></button>
  <button type="button" class="room-pager__nav room-pager__nav--up" data-room-pager-up aria-label="Floor up"><span aria-hidden="true">&#9650;</span><span class="room-pager__nav-hint" data-room-pager-hint aria-hidden="true"></span></button>
  <button type="button" class="room-pager__nav room-pager__nav--down" data-room-pager-down aria-label="Floor down"><span aria-hidden="true">&#9660;</span><span class="room-pager__nav-hint" data-room-pager-hint aria-hidden="true"></span></button>
  <div class="swipe-hint" data-swipe-hint aria-hidden="true"><span class="swipe-hint__arrow swipe-hint__arrow--left">&#8249;</span><span class="swipe-hint__label">Swipe to explore</span><span class="swipe-hint__arrow swipe-hint__arrow--right">&#8250;</span></div>
  <div class="nav-panel" data-nav-panel>
    <button type="button" class="nav-panel__tab" data-nav-panel-toggle aria-expanded="false" aria-controls="nav-panel-grid">
      <span class="nav-panel__tab-label">Directory</span>
    </button>
    <div class="nav-panel__grid" id="nav-panel-grid" data-nav-panel-grid hidden>
    {NAV_PANEL_ROWS}
    </div>
  </div>
</section>

</main>

{SITE_FOOT}

<!-- The Play/Pause toggle (playpause-toggle), the Suite Remote (TV /
     Music / Cinema in one), and its fixed toggle pill are all injected by
     tv-remote.js's initSuiteRemote() -- one instance regardless of how
     many rooms have a screen. -->

<script src="assets/js/room-pager.js?v=17" defer></script>
<script src="assets/js/nav-panel.js?v=16" defer></script>
<script src="assets/js/world.js?v=16" defer></script>
<script src="assets/js/tv-remote.js?v=16" defer></script>
<script src="assets/js/guide-portal.js?v=16" defer></script>
<script src="assets/js/gym-portal.js?v=16" defer></script>
<script src="assets/js/vault-entrance.js?v=16" defer></script>
<script src="assets/js/piano-player.js?v=17" defer></script>
<script src="assets/js/artifact-experiences.js?v=6" defer></script>
</body>
</html>
'''

open("house.html","w",encoding="utf-8").write(html)
print(f"house.html written — {len(PENTHOUSE_FLOORS)} floors open ({len(FLOORS)} authored), {sum(len(f['arts']) for f in PENTHOUSE_FLOORS)} artifacts")
