#!/usr/bin/env python3
"""Apply the approved Kitchen v7 artifact map to data + homepage runtime."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "house-rooms.json"
BUILD = ROOT / "build_house.py"
PENTHOUSE_JS = ROOT / "assets" / "js" / "penthouse.js"
ARTIFACT_JS = ROOT / "assets" / "js" / "artifact-experiences.js"


def artifact(id_, name, x, y, desc, specs=()):
    return {
        "id": id_, "name": name, "x": x, "y": y, "desc": desc,
        "specs": [list(pair) for pair in specs],
    }


def patch_data():
    rooms = json.loads(DATA.read_text(encoding="utf-8"))
    by_id = {room["id"]: room for room in rooms}
    by_id["kitchen"]["arts"] = [
        artifact(
            "artwork", "The Artwork", "23.1%", "10.5%",
            "The framed portrait beside the fireplace and skyline.",
            (("Collection", "Paris Pullen"),),
        ),
        artifact(
            "suits", "The Blueprint Game", "58.3%", "42.1%",
            "The Blueprint Game follows the same system used in the Closet — choose the look, then own it.",
            (("Experience", "The Blueprint"),),
        ),
        artifact(
            "hellofresh", "The Gentleman’s Guide to HelloFresh", "58.5%", "63.8%",
            "The recipe card and ingredients on the island — the Gentleman’s Guide to HelloFresh.",
            (("Partner", "HelloFresh"),),
        ),
        artifact(
            "journal", "The Journal", "80.0%", "87.0%",
            "The journal at the dining place setting, ready for the next note.",
            (("Read it", "The Journal"),),
        ),
    ]
    DATA.write_text(json.dumps(rooms, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def patch_runtime():
    text = PENTHOUSE_JS.read_text(encoding="utf-8")
    replacement = """    'kitchen': [
      { key:'artwork', name:'The Artwork', x:'23.1%', y:'10.5%', body:'The framed portrait beside the fireplace and skyline.', specs:[['Collection', 'Paris Pullen']] },
      { key:'suits', name:'The Blueprint Game', x:'58.3%', y:'42.1%', body:'The Blueprint Game follows the same system used in the Closet — choose the look, then own it.', specs:[['Experience', 'The Blueprint']] },
      { key:'hellofresh', name:'The Gentleman&#8217;s Guide to HelloFresh', x:'58.5%', y:'63.8%', body:'The recipe card and ingredients on the island — the Gentleman&#8217;s Guide to HelloFresh.', specs:[['Partner', 'HelloFresh']] },
      { key:'journal', name:'The Journal', x:'80.0%', y:'87.0%', body:'The journal at the dining place setting, ready for the next note.', specs:[['Read it', 'The Journal']] },
    ],
    'study': ["""
    text, count = re.subn(
        r"    'kitchen': \[.*?\n    \],\n    'study': \[",
        replacement,
        text,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError("Could not replace runtime Kitchen artifact set")

    # Make the Kitchen Blueprint node use the same Blueprint CTA as Closet/Living Room.
    text = text.replace(
        "(((roomId === 'closet' || roomId === 'penthouse-living') && key === 'suits') || (roomId === 'bedroom' && key === 'suit'))",
        "(((roomId === 'closet' || roomId === 'penthouse-living' || roomId === 'kitchen') && key === 'suits') || (roomId === 'bedroom' && key === 'suit'))",
    )
    PENTHOUSE_JS.write_text(text, encoding="utf-8")


def patch_build():
    text = BUILD.read_text(encoding="utf-8")
    text = text.replace(
        'if (f["id"] in ("closet", "penthouse-living") and key == "suits") or (f["id"] == "bedroom" and key == "suit") else ""',
        'if (f["id"] in ("closet", "penthouse-living", "kitchen") and key == "suits") or (f["id"] == "bedroom" and key == "suit") else ""',
    )
    BUILD.write_text(text, encoding="utf-8")


def patch_blueprint_dispatch():
    text = ARTIFACT_JS.read_text(encoding="utf-8")
    text = text.replace(
        "((room.id==='closet'||room.id==='penthouse-living')&&key==='suits')",
        "((room.id==='closet'||room.id==='penthouse-living'||room.id==='kitchen')&&key==='suits')",
    )
    ARTIFACT_JS.write_text(text, encoding="utf-8")


def main():
    patch_data()
    patch_runtime()
    patch_build()
    patch_blueprint_dispatch()
    print("Approved Kitchen v7 artifacts applied")


if __name__ == "__main__":
    main()
