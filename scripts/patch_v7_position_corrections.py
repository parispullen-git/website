#!/usr/bin/env python3
"""Final arrow-tip position corrections for Bedroom, Study, and Closet v7 mockups."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "house-rooms.json"
BUILD = ROOT / "build_house.py"
PENTHOUSE = ROOT / "assets" / "js" / "penthouse.js"

ROOM_ARTS = {
    "bedroom": {
        "artwork": ("37.2%", "21.9%"),
        "suit": ("64.5%", "47.1%"),
        "cocktails": ("16.2%", "57.3%"),
        "journal": ("87.2%", "86.5%"),
    },
    "study": {
        "artwork": ("40.8%", "19.5%"),
        "cocktails": ("37.7%", "46.5%"),
        "journal": ("50.0%", "43.4%"),
    },
    "closet": {
        "suits": ("14.9%", "38.5%"),
        "boxer": ("46.2%", "27.6%"),
        "journal": ("59.2%", "15.6%"),
    },
}

CITY_GUIDE = {
    "bedroom": ("14.9%", "18.4%"),
    "study": ("85.3%", "25.2%"),
    "closet": ("35.6%", "10.2%"),
}


def patch_json():
    rooms = json.loads(DATA.read_text(encoding="utf-8"))
    by_id = {r["id"]: r for r in rooms}
    for room_id, positions in ROOM_ARTS.items():
        for art in by_id[room_id].get("arts", []):
            if art.get("id") in positions:
                art["x"], art["y"] = positions[art["id"]]
    DATA.write_text(json.dumps(rooms, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def patch_js_art_block(text, room_id, next_room, positions):
    pat = rf"(    '{re.escape(room_id)}': \[)(.*?)(\n    \],\n    '{re.escape(next_room)}': \[)"
    m = re.search(pat, text, re.S)
    if not m:
        raise RuntimeError(f"Could not locate runtime block for {room_id}")
    block = m.group(2)
    for key, (x, y) in positions.items():
        key_pat = rf"(key:'{re.escape(key)}'.*?x:')[^']+(', y:')[^']+(')"
        block, count = re.subn(key_pat, rf"\g<1>{x}\g<2>{y}\g<3>", block, count=1, flags=re.S)
        if count != 1:
            raise RuntimeError(f"Could not position {room_id}/{key} in runtime")
    return text[:m.start(2)] + block + text[m.end(2):]


def patch_city_map(text, room_id, x, y, js=False):
    if js:
        pat = rf"('{re.escape(room_id)}'\s*:\s*\[')[^']+(',\s*')[^']+('\])"
        repl = rf"\g<1>{x}\g<2>{y}\g<3>"
    else:
        pat = rf'("{re.escape(room_id)}"\s*:\s*\(")[^"]+("\s*,\s*")[^"]+("\))'
        repl = rf"\g<1>{x}\g<2>{y}\g<3>"
    text, count = re.subn(pat, repl, text, count=1)
    if count != 1:
        raise RuntimeError(f"Could not position City Guide for {room_id}")
    return text


def patch_runtime():
    text = PENTHOUSE.read_text(encoding="utf-8")
    text = patch_js_art_block(text, "bedroom", "bath", ROOM_ARTS["bedroom"])
    text = patch_js_art_block(text, "study", "cinema", ROOM_ARTS["study"])
    text = patch_js_art_block(text, "closet", "kitchen", ROOM_ARTS["closet"])
    for room_id, (x, y) in CITY_GUIDE.items():
        text = patch_city_map(text, room_id, x, y, js=True)

    # Final authoritative portal wiring. Earlier patch scripts used two
    # different Closet keys (after-hours vs boxer); normalize to boxer so
    # the generated Penthouse runtime always opens the existing boxing portal.
    text = text.replace(
        "if ((room.id === 'gym' || room.id === 'closet') && a.key === 'boxer')",
        "if ((room.id === 'gym' || room.id === 'closet') && a.key === 'boxer')",
    )
    text = text.replace(
        "if (room.id === 'gym' && a.key === 'boxer')",
        "if ((room.id === 'gym' || room.id === 'closet') && a.key === 'boxer')",
    )
    text = text.replace(
        "return !(room.id === 'gym' && a.key === 'boxer');",
        "return !((room.id === 'gym' || room.id === 'closet') && a.key === 'boxer');",
    )
    if "(room.id === 'gym' || room.id === 'closet') && a.key === 'boxer'" not in text:
        raise RuntimeError("Could not enforce Closet After Hours portal wiring in penthouse.js")

    PENTHOUSE.write_text(text, encoding="utf-8")


def patch_build():
    text = BUILD.read_text(encoding="utf-8")
    for room_id, (x, y) in CITY_GUIDE.items():
        text = patch_city_map(text, room_id, x, y, js=False)

    # patch_mockup_room_nodes.py historically converted Closet After Hours
    # using key='after-hours'. The final Closet v7 data now uses key='boxer'.
    # Normalize the generator after every earlier patch so build_house.py
    # emits data-gym-portal for BOTH Gym and Closet boxer nodes.
    stale_variants = [
        'if (f["id"] == "gym" and key == "boxer") or (f["id"] == "closet" and key == "after-hours"):',
        'if f["id"] == "gym" and key == "boxer":',
    ]
    correct = 'if f["id"] in ("gym", "closet") and key == "boxer":'
    if correct not in text:
        for stale in stale_variants:
            if stale in text:
                text = text.replace(stale, correct, 1)
                break
    if correct not in text:
        raise RuntimeError("Could not enforce Closet After Hours portal wiring in build_house.py")

    BUILD.write_text(text, encoding="utf-8")


def main():
    patch_json()
    patch_runtime()
    patch_build()
    print("Bedroom + Study + Closet arrow-tip positions and portal wiring corrected")


if __name__ == "__main__":
    main()
