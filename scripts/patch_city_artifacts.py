#!/usr/bin/env python3
"""Repoint the penthouse skyline shortcut artifacts to the Charlotte City Guide.

The shortcut appears only in the Living Room, Bedroom, Closet and Bathroom.
It remains an ordinary same-origin charlotte.html link so artifact-experiences.js
can intercept it and open the room-native City Guide popup, with the standalone
page still acting as the fallback when that enhancement is unavailable.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PENTHOUSE_JS = ROOT / "assets" / "js" / "penthouse.js"
BUILD_HOUSE = ROOT / "build_house.py"

JS_OLD = '''  // "The Barbershop" marker -- a real link to house.html#barbershop (was
  // "The City", linking to charlotte.html, until repointed here), styled
  // exactly like an artifact dot but NOT a drawer (no data-artifact
  // attribute, so world.js's drawer delegate never claims the click and
  // the <a> navigates normally). Same shape as REMOTE_NODE_POS above: any
  // room with glass worth walking through gets an entry, positioned on
  // that room's own view. Keep every position clear of the fixed
  // left/right nav arrows -- those are pinned to the viewport edges and
  // vertically centred, so stay past x=14% on the left and off mid-height
  // at the far right. Mirrors build_house.py's BARBERSHOP_NODE_POS exactly.
  var BARBERSHOP_NODE_POS = {
    'penthouse-living': ['21%', '10%'],  // clean window pane above the stairwell beam, skyline visible
    'bedroom':          ['19%', '18.6%'], // clear glass past the lamp, above the lounge chair
    'bath':             ['38%', '6%'],   // the skyline through the window, clear of the tub and plant
    'kitchen':          ['27.5%', '3.75%'], // clean skyline pane left of the curtain, clear of the plant
    'music-lounge':     ['72%', '8%']    // the sliver of skyline beside the bar's PP sign, past the curtain
  };
  function cityLinkHTML(roomId) {
    var pos = BARBERSHOP_NODE_POS[roomId];
    if (!pos) return '';
    return '<a href="house.html#barbershop" class="artifact artifact--remote" style="--x:' + pos[0] + ';--y:' + pos[1] + '">' +
             '<span class="artifact__dot" aria-hidden="true"></span>' +
             '<span class="artifact__label">The Barbershop</span>' +
           '</a>';
  }
'''

JS_NEW = '''  // "The City Guide" skyline shortcut. Keep this room-native: the anchor is
  // a real charlotte.html fallback, while artifact-experiences.js intercepts
  // it on supported pages and opens Charlotte inside the full-screen City
  // Guide portal. Only the four private-suite rooms below carry the shortcut.
  var CITY_GUIDE_NODE_POS = {
    'penthouse-living': ['21%', '10%'],
    'bedroom':          ['19%', '18.6%'],
    'closet':           ['50%', '8%'],
    'bath':             ['38%', '6%']
  };
  function cityLinkHTML(roomId) {
    var pos = CITY_GUIDE_NODE_POS[roomId];
    if (!pos) return '';
    return '<a href="charlotte.html" class="artifact artifact--remote" style="--x:' + pos[0] + ';--y:' + pos[1] + '" aria-label="Open the Charlotte City Guide">' +
             '<span class="artifact__dot" aria-hidden="true"></span>' +
             '<span class="artifact__label">The City Guide</span>' +
           '</a>';
  }
'''

PY_OLD = '''# "The Barbershop" marker -- a real link to the Barbershop room (was "The
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
'''

PY_NEW = '''# "The City Guide" skyline shortcut. The link itself stays a real
# charlotte.html fallback; artifact-experiences.js upgrades it to the
# room-native City Guide popup. Only these four private-suite rooms carry it.
CITY_GUIDE_NODE_POS = {
    "penthouse-living": ("21%", "10%"),
    "bedroom":          ("19%", "18.6%"),
    "closet":           ("50%", "8%"),
    "bath":             ("38%", "6%"),
}
'''


def patch(path: Path, old: str, new: str, old_name: str, new_name: str) -> None:
    text = path.read_text(encoding="utf-8")
    if new in text:
        print(f"Already patched: {path.name}")
        return
    if old not in text:
        raise RuntimeError(f"Could not locate {old_name} block in {path}")
    text = text.replace(old, new, 1)
    # Rename any remaining variable references and generated-link markup.
    text = text.replace(old_name, new_name)
    text = text.replace('href="house.html#barbershop"', 'href="charlotte.html"')
    text = text.replace('>The Barbershop<', '>The City Guide<')
    path.write_text(text, encoding="utf-8")
    print(f"Patched {path.name}: City Guide artifacts active")


def main() -> None:
    patch(PENTHOUSE_JS, JS_OLD, JS_NEW, "BARBERSHOP_NODE_POS", "CITY_GUIDE_NODE_POS")
    patch(BUILD_HOUSE, PY_OLD, PY_NEW, "BARBERSHOP_NODE_POS", "CITY_GUIDE_NODE_POS")


if __name__ == "__main__":
    main()
