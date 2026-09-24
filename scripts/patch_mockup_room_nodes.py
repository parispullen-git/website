#!/usr/bin/env python3
"""Make the approved Living Room v7 + Closet mockups authoritative.

Runs after patch_city_artifacts.py and before build_house.py. It replaces only
these two rooms' authored artifacts, aligns special City Guide/TV nodes,
and wires the Closet boxing-glove hotspot into the existing Gym portal.
"""
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

    # Living Room v7: ONLY the five drawer artifacts marked in Paris's
    # annotated 2048x1152 mockup live here. The City Guide is a separate
    # animated portal node and is positioned in patch_build/runtime below.
    by_id["penthouse-living"]["arts"] = [
        artifact(
            "artwork", "The Artwork", "60.8%", "8.0%",
            "The framed piece overlooking the room from the upper gallery.",
            (("Collection", "Paris Pullen"),),
        ),
        artifact(
            "journal", "The Journal", "63.7%", "42.4%",
            "The journal resting on the right-side console.",
            (("Read it", "The Journal"),),
        ),
        artifact(
            "vault", "The Vault", "73.8%", "55.5%",
            "Brass wheel, black steel, set into the wall and deliberately visible.",
            (("Contents", "UR Welcome"),),
        ),
        artifact(
            "suits", "The Blueprint Game", "35.7%", "54.6%",
            "The Blueprint sits on the ottoman with the tailoring boxes: the working system for getting dressed with intention.",
            (("Experience", "The Blueprint"),),
        ),
        artifact(
            "cocktails", "The Gentlemen’s Cocktail Menu", "7.7%", "70.7%",
            "The house cocktail menu placed beside the drink table.",
            (("House classics", "Eleven"),),
        ),
    ]

    # Approved Closet hotspot set remains unchanged.
    by_id["closet"]["arts"] = [
        artifact(
            "suits", "The Blueprint", "21.432%", "23.230%",
            "The Blueprint begins on the rack: foundational tailoring, combinations and the decisions behind them.",
            (("Experience", "The Blueprint"),),
        ),
        artifact(
            "artwork", "The Artwork", "93.789%", "37.897%",
            "The portrait on the right wall — part reference, part reminder of the man the room is dressing.",
            (("Collection", "Paris Pullen"),),
        ),
        artifact(
            "after-hours", "After Hours", "54.651%", "60.775%",
            "The gloves are the handoff. After Hours continues in the Gym.",
            (("Next room", "The Gym"),),
        ),
        artifact(
            "journal", "The Journal", "50.784%", "91.622%",
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

    # City Guide animated portal — position at the arrow tip in the v7 mockup.
    for old in (
        '"penthouse-living": ("21%", "10%")',
        '"penthouse-living": ("14.5%", "28.2%")',
        '"penthouse-living": ("14.457%", "28.965%")',
    ):
        text = text.replace(old, '"penthouse-living": ("11.9%", "28.6%")')
    text = text.replace('"closet":           ("50%", "8%")', '"closet":           ("63.477%", "11.584%")')
    text = text.replace('"closet":           ("65.1%", "13.9%")', '"closet":           ("63.477%", "11.584%")')

    # Living Room TV — fit the interactive screen inside the gold frame in v7.
    old_tv = '''    "penthouse-living": dict(
        x="55.7%", y="24.0%", w="17%", h="14%",
        box="0.4740,0.1704,0.6406,0.3093",
        channel_set="living", id="kDK8-psUjzY", label="FOMO — Drake",
    ),'''
    new_tv = '''    "penthouse-living": dict(
        x="41.1%", y="21.7%", w="13.1%", h="12.6%",
        box="0.3455,0.1545,0.4766,0.2804",
        channel_set="living", id="kDK8-psUjzY", label="FOMO — Drake",
    ),'''
    text = replace_required(text, old_tv, new_tv, "Living Room TV screen")

    # The annotated v7 mockup does not include a separate Living Room Remote
    # artifact. The screen itself remains interactive, so remove any legacy
    # Living Room remote node while preserving Cinema/Music Lounge controls.
    for remote_line in (
        '    "penthouse-living": ("55.2%", "35.3%"),\n',
        '    "penthouse-living": ("50.770%", "32.627%"),\n',
    ):
        text = text.replace(remote_line, '')

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
    text = PENTHOUSE_JS.read_text(encoding="utf-8")
    for old in (
        "'penthouse-living': ['21%', '10%']",
        "'penthouse-living': ['14.5%', '28.2%']",
        "'penthouse-living': ['14.457%', '28.965%']",
    ):
        text = text.replace(old, "'penthouse-living': ['11.9%', '28.6%']")
    for old in ("'closet':           ['50%', '8%']", "'closet':           ['65.1%', '13.9%']"):
        text = text.replace(old, "'closet':           ['63.477%', '11.584%']")
    PENTHOUSE_JS.write_text(text, encoding="utf-8")


def patch_runtime_living_room():
    text = PENTHOUSE_JS.read_text(encoding="utf-8")

    # Replace the homepage Penthouse Living Room's authored artifact array so
    # it matches house.html exactly. City Guide remains a separate portal node.
    replacement = """  var ARTS = {
    'penthouse-living': [
      { key:'artwork', name:'The Artwork', x:'60.8%', y:'8.0%', body:'The framed piece overlooking the room from the upper gallery.', specs:[['Collection', 'Paris Pullen']] },
      { key:'journal', name:'The Journal', x:'63.7%', y:'42.4%', body:'The journal resting on the right-side console.', specs:[['Read it', 'The Journal']] },
      { key:'vault', name:'The Vault', x:'73.8%', y:'55.5%', body:'Brass wheel, black steel, set into the wall and deliberately visible.', specs:[['Contents', 'UR Welcome']] },
      { key:'suits', name:'The Blueprint Game', x:'35.7%', y:'54.6%', body:'The Blueprint sits on the ottoman with the tailoring boxes: the working system for getting dressed with intention.', specs:[['Experience', 'The Blueprint']] },
      { key:'cocktails', name:'The Gentlemen&#8217;s Cocktail Menu', x:'7.7%', y:'70.7%', body:'The house cocktail menu placed beside the drink table.', specs:[['House classics', 'Eleven']] },
    ],
    'music-lounge': ["""
    text, count = re.subn(
        r"  var ARTS = \{\n    'penthouse-living': \[.*?\n    \],\n    'music-lounge': \[",
        replacement,
        text,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError("Could not replace runtime Living Room artifact set")

    old_tv = """    'penthouse-living': { x:'55.7%', y:'24.0%', w:'17%', h:'14%',
      box:'0.4740,0.1704,0.6406,0.3093', channelSet:'living',
      id:'4xVVFJuycww', label:'The Gentlemen' },"""
    new_tv = """    'penthouse-living': { x:'41.1%', y:'21.7%', w:'13.1%', h:'12.6%',
      box:'0.3455,0.1545,0.4766,0.2804', channelSet:'living',
      id:'4xVVFJuycww', label:'The Gentlemen' },"""
    text = replace_required(text, old_tv, new_tv, "runtime Living Room TV screen")

    # Make the Living Room Blueprint artifact use the same Blueprint CTA.
    old_cta = "var wardrobeCta = ((roomId === 'closet' && key === 'suits') || (roomId === 'bedroom' && key === 'suit')) ? SUITS_CTA : '';"
    new_cta = "var wardrobeCta = (((roomId === 'closet' || roomId === 'penthouse-living') && key === 'suits') || (roomId === 'bedroom' && key === 'suit')) ? SUITS_CTA : '';"
    text = replace_required(text, old_cta, new_cta, "runtime Blueprint CTA condition")

    # Remove any old visible Living Room remote marker if one was previously injected.
    for remote_line in (
        "    'penthouse-living': ['55.2%', '35.3%'],\n",
        "    'penthouse-living': ['50.770%', '32.627%'],\n",
    ):
        text = text.replace(remote_line, '')

    PENTHOUSE_JS.write_text(text, encoding="utf-8")


def patch_blueprint_dispatch():
    text = ARTIFACT_JS.read_text(encoding="utf-8")
    old = "else if((room.id==='closet'&&key==='suits')||key==='suit')blueprintPortal(spot);"
    new = "else if(((room.id==='closet'||room.id==='penthouse-living')&&key==='suits')||key==='suit')blueprintPortal(spot);"
    text = replace_required(text, old, new, "Blueprint artifact dispatch")
    ARTIFACT_JS.write_text(text, encoding="utf-8")


def main():
    patch_data()
    patch_build()
    patch_runtime_city_positions()
    patch_runtime_living_room()
    patch_blueprint_dispatch()
    print("Approved Living Room v7 + Closet nodes applied")


if __name__ == "__main__":
    main()
