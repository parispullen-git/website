#!/usr/bin/env python3
"""Make the approved Living Room + Closet mockups authoritative.

Runs after patch_city_artifacts.py and before build_house.py. It replaces only
these two rooms' authored artifacts, aligns special City Guide/Remote nodes,
and wires the Closet boxing-glove hotspot into the existing Gym portal.
"""
import json
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

    # Exactly the artifacts shown on the approved Living Room mockup.
    # City Guide + Remote are special build nodes and therefore are not
    # duplicated in this list.
    by_id["penthouse-living"]["arts"] = [
        artifact(
            "journal", "The Journal", "16.5%", "75%",
            "Left open in the chair beside him. The published pages live in The Journal.",
            (("Read it", "The Journal"),),
        ),
        artifact(
            "suits", "The Blueprint", "45.6%", "66%",
            "The Blueprint sits with the tailoring boxes: the working system for getting dressed with intention.",
            (("Experience", "The Blueprint"),),
        ),
        artifact(
            "cocktails", "The Cocktail Menu", "68.3%", "66.3%",
            "The house cocktail menu, placed beside the drink where it belongs.",
            (("House classics", "Eleven"),),
        ),
        artifact(
            "vault", "The Vault", "94.2%", "63.1%",
            "Brass wheel, black steel, set into the wall and deliberately visible.",
            (("Contents", "UR Welcome"),),
        ),
        artifact(
            "artwork", "The Artwork", "88.5%", "9.5%",
            "One of the framed pieces that turns the room into a lived-in gallery rather than a showroom.",
            (("Collection", "Paris Pullen"),),
        ),
    ]

    # Exactly the artifacts shown on the approved Closet mockup.
    # City Guide is a special build node and is not duplicated here.
    by_id["closet"]["arts"] = [
        artifact(
            "suits", "The Blueprint", "21.9%", "25.1%",
            "The Blueprint begins on the rack: foundational tailoring, combinations and the decisions behind them.",
            (("Experience", "The Blueprint"),),
        ),
        artifact(
            "artwork", "The Artwork", "93.6%", "38.5%",
            "The portrait on the right wall — part reference, part reminder of the man the room is dressing.",
            (("Collection", "Paris Pullen"),),
        ),
        artifact(
            "after-hours", "After Hours", "55.3%", "63.7%",
            "The gloves are the handoff. After Hours continues in the Gym.",
            (("Next room", "The Gym"),),
        ),
        artifact(
            "journal", "The Journal", "50.7%", "89%",
            "The journal on the ottoman — notes, decisions and the pages that survive into publication.",
            (("Read it", "The Journal"),),
        ),
    ]

    DATA.write_text(json.dumps(rooms, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def replace_required(text, old, new, label):
    if new in text:
        return text
    if old not in text:
        raise RuntimeError(f"Could not locate {label}")
    return text.replace(old, new, 1)


def patch_build():
    text = BUILD.read_text(encoding="utf-8")

    # City Guide was already converted from Barbershop by the preceding
    # patch_city_artifacts.py step. Reposition only the two approved rooms.
    text = text.replace('"penthouse-living": ("21%", "10%")', '"penthouse-living": ("14.5%", "28.2%")')
    text = text.replace('"closet":           ("50%", "8%")', '"closet":           ("65.1%", "13.9%")')

    # Living Room gets the real Suite Remote node at the fireplace.
    old_remote = 'REMOTE_NODE_POS = {\n    "cinema": ("50%", "45%"),'
    new_remote = 'REMOTE_NODE_POS = {\n    "penthouse-living": ("55.2%", "35.3%"),\n    "cinema": ("50%", "45%"),'
    text = replace_required(text, old_remote, new_remote, "Remote node map")

    # The glove hotspot is not a generic drawer. Reuse the existing Gym
    # portal button so clicking it moves into the actual Gym experience.
    old_gym = 'if f["id"] == "gym" and key == "boxer":'
    new_gym = 'if (f["id"] == "gym" and key == "boxer") or (f["id"] == "closet" and key == "after-hours"):'
    text = replace_required(text, old_gym, new_gym, "Gym portal condition")

    # Both approved Blueprint nodes should carry the same Blueprint CTA.
    old_bp = 'if (f["id"] == "closet" and key == "suits") or (f["id"] == "bedroom" and key == "suit") else ""'
    new_bp = 'if (f["id"] in ("closet", "penthouse-living") and key == "suits") or (f["id"] == "bedroom" and key == "suit") else ""'
    text = replace_required(text, old_bp, new_bp, "Blueprint CTA condition")

    BUILD.write_text(text, encoding="utf-8")


def patch_runtime_city_positions():
    # penthouse.js is patched in-memory by patch_city_artifacts.py during the
    # same build, so mirror the two coordinates there for dynamically rebuilt
    # room markup as well.
    text = PENTHOUSE_JS.read_text(encoding="utf-8")
    text = text.replace("'penthouse-living': ['21%', '10%']", "'penthouse-living': ['14.5%', '28.2%']")
    text = text.replace("'closet':           ['50%', '8%']", "'closet':           ['65.1%', '13.9%']")
    PENTHOUSE_JS.write_text(text, encoding="utf-8")


def patch_blueprint_dispatch():
    # The native artifact experience already sends Closet / suits to the
    # Blueprint portal. Extend the same existing route to the Living Room.
    text = ARTIFACT_JS.read_text(encoding="utf-8")
    old = "else if((room.id==='closet'&&key==='suits')||key==='suit')blueprintPortal(spot);"
    new = "else if(((room.id==='closet'||room.id==='penthouse-living')&&key==='suits')||key==='suit')blueprintPortal(spot);"
    text = replace_required(text, old, new, "Blueprint artifact dispatch")
    ARTIFACT_JS.write_text(text, encoding="utf-8")


def main():
    patch_data()
    patch_build()
    patch_runtime_city_positions()
    patch_blueprint_dispatch()
    print("Approved Living Room + Closet mockup nodes applied")


if __name__ == "__main__":
    main()
