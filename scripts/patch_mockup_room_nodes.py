#!/usr/bin/env python3
"""Make the approved Living Room v7, Study v7 + Closet mockups authoritative."""
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


def replace_required(text, old, new, label):
    if new in text:
        return text
    if old not in text:
        raise RuntimeError(f"Could not locate {label}")
    return text.replace(old, new, 1)


def patch_data():
    rooms = json.loads(DATA.read_text(encoding="utf-8"))
    by_id = {room["id"]: room for room in rooms}

    by_id["penthouse-living"]["arts"] = [
        artifact("artwork", "The Artwork", "75.0%", "10.0%",
                 "The framed piece overlooking the room from the upper gallery.",
                 (("Collection", "Paris Pullen"),)),
        artifact("journal", "The Journal", "79.5%", "51.5%",
                 "The journal resting on the right-side console.",
                 (("Read it", "The Journal"),)),
        artifact("vault", "The Vault", "91.5%", "68.5%",
                 "Brass wheel, black steel, set into the wall and deliberately visible.",
                 (("Contents", "UR Welcome"),)),
        artifact("suits", "The Blueprint Game", "44.5%", "66.5%",
                 "The Blueprint sits on the ottoman with the tailoring boxes: the working system for getting dressed with intention.",
                 (("Experience", "The Blueprint"),)),
        artifact("cocktails", "The Gentlemen’s Cocktail Menu", "9.0%", "87.5%",
                 "The house cocktail menu placed beside the drink table.",
                 (("House classics", "Eleven"),)),
    ]

    # Study v7: ONLY the three drawer artifacts marked in the approved
    # 2048x1152 mockup. The City Guide remains a separate animated portal.
    by_id["study"]["arts"] = [
        artifact("artwork", "The Artwork", "39.9%", "19.0%",
                 "The central artwork wall — the visual reference point behind the desk.",
                 (("Collection", "Paris Pullen"),)),
        artifact("cocktails", "The Gentlemen’s Cocktail Menu", "36.9%", "44.2%",
                 "The house cocktail menu set on the left side of the desk.",
                 (("House classics", "Eleven"),)),
        artifact("journal", "The Journal", "49.6%", "42.9%",
                 "The journal placed on the right side of the desk within reach.",
                 (("Read it", "The Journal"),)),
    ]

    by_id["closet"]["arts"] = [
        artifact("suits", "The Blueprint", "21.432%", "23.230%",
                 "The Blueprint begins on the rack: foundational tailoring, combinations and the decisions behind them.",
                 (("Experience", "The Blueprint"),)),
        artifact("artwork", "The Artwork", "93.789%", "37.897%",
                 "The portrait on the right wall — part reference, part reminder of the man the room is dressing.",
                 (("Collection", "Paris Pullen"),)),
        artifact("after-hours", "After Hours", "54.651%", "60.775%",
                 "The gloves are the handoff. After Hours continues in the Gym.",
                 (("Next room", "The Gym"),)),
        artifact("journal", "The Journal", "50.784%", "91.622%",
                 "The journal on the ottoman — notes, decisions and the pages that survive into publication.",
                 (("Read it", "The Journal"),)),
    ]

    DATA.write_text(json.dumps(rooms, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def patch_city_node(text, js=False):
    # Add/move the City Guide nodes for the approved Living Room and Study mockups.
    if js:
        living_old = [
            "'penthouse-living': ['21%', '10%']",
            "'penthouse-living': ['14.5%', '28.2%']",
            "'penthouse-living': ['14.457%', '28.965%']",
            "'penthouse-living': ['11.9%', '28.6%']",
        ]
        for old in living_old:
            text = text.replace(old, "'penthouse-living': ['15.0%', '35.0%']")
        if "'study': ['85.0%', '25.2%']" not in text:
            text = text.replace("'bath':             ['38%', '6%']", "'bath':             ['38%', '6%'],\n    'study':            ['85.0%', '25.2%']")
    else:
        living_old = [
            '"penthouse-living": ("21%", "10%")',
            '"penthouse-living": ("14.5%", "28.2%")',
            '"penthouse-living": ("14.457%", "28.965%")',
            '"penthouse-living": ("11.9%", "28.6%")',
        ]
        for old in living_old:
            text = text.replace(old, '"penthouse-living": ("15.0%", "35.0%")')
        if '"study":            ("85.0%", "25.2%")' not in text:
            text = text.replace('"bath":             ("38%", "6%")', '"bath":             ("38%", "6%"),\n    "study":            ("85.0%", "25.2%")')
    return text


def patch_build():
    text = BUILD.read_text(encoding="utf-8")
    text = patch_city_node(text, js=False)

    old_tv = '''    "penthouse-living": dict(\n        x="55.7%", y="24.0%", w="17%", h="14%",\n        box="0.4740,0.1704,0.6406,0.3093",\n        channel_set="living", id="kDK8-psUjzY", label="FOMO — Drake",\n    ),'''
    wrong_tv = '''    "penthouse-living": dict(\n        x="41.1%", y="21.7%", w="13.1%", h="12.6%",\n        box="0.3455,0.1545,0.4766,0.2804",\n        channel_set="living", id="kDK8-psUjzY", label="FOMO — Drake",\n    ),'''
    previous_tv = '''    "penthouse-living": dict(\n        x="51.0%", y="24.5%", w="16.0%", h="13.0%",\n        box="0.4300,0.1800,0.5900,0.3100",\n        channel_set="living", id="kDK8-psUjzY", label="FOMO — Drake",\n    ),'''
    new_tv = '''    "penthouse-living": dict(\n        x="51.0%", y="26.375%", w="16.0%", h="13.0%",\n        box="0.4300,0.19875,0.5900,0.32875",\n        channel_set="living", id="kDK8-psUjzY", label="FOMO — Drake",\n    ),'''
    if previous_tv in text:
        text = text.replace(previous_tv, new_tv, 1)
    elif wrong_tv in text:
        text = text.replace(wrong_tv, new_tv, 1)
    elif new_tv not in text:
        text = replace_required(text, old_tv, new_tv, "Living Room TV screen")

    for remote_line in (
        '    "penthouse-living": ("55.2%", "35.3%"),\n',
        '    "penthouse-living": ("50.770%", "32.627%"),\n',
    ):
        text = text.replace(remote_line, '')

    old_gym = 'if f["id"] == "gym" and key == "boxer":'
    new_gym = 'if (f["id"] == "gym" and key == "boxer") or (f["id"] == "closet" and key == "after-hours"):'
    if old_gym in text:
        text = text.replace(old_gym, new_gym, 1)

    old_bp = 'if (f["id"] == "closet" and key == "suits") or (f["id"] == "bedroom" and key == "suit") else ""'
    new_bp = 'if (f["id"] in ("closet", "penthouse-living") and key == "suits") or (f["id"] == "bedroom" and key == "suit") else ""'
    if old_bp in text:
        text = text.replace(old_bp, new_bp, 1)

    BUILD.write_text(text, encoding="utf-8")


def patch_runtime():
    text = PENTHOUSE_JS.read_text(encoding="utf-8")
    text = text.replace("img:'room-living'", "img:'room-living-v7'")
    text = text.replace("img:'room-closet'", "img:'room-closet-v7'")

    living_replacement = """  var ARTS = {
    'penthouse-living': [
      { key:'artwork', name:'The Artwork', x:'75.0%', y:'10.0%', body:'The framed piece overlooking the room from the upper gallery.', specs:[['Collection', 'Paris Pullen']] },
      { key:'journal', name:'The Journal', x:'79.5%', y:'51.5%', body:'The journal resting on the right-side console.', specs:[['Read it', 'The Journal']] },
      { key:'vault', name:'The Vault', x:'91.5%', y:'68.5%', body:'Brass wheel, black steel, set into the wall and deliberately visible.', specs:[['Contents', 'UR Welcome']] },
      { key:'suits', name:'The Blueprint Game', x:'44.5%', y:'66.5%', body:'The Blueprint sits on the ottoman with the tailoring boxes: the working system for getting dressed with intention.', specs:[['Experience', 'The Blueprint']] },
      { key:'cocktails', name:'The Gentlemen&#8217;s Cocktail Menu', x:'9.0%', y:'87.5%', body:'The house cocktail menu placed beside the drink table.', specs:[['House classics', 'Eleven']] },
    ],
    'music-lounge': ["""
    text, count = re.subn(
        r"  var ARTS = \{\n    'penthouse-living': \[.*?\n    \],\n    'music-lounge': \[",
        living_replacement,
        text,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError("Could not replace runtime Living Room artifact set")

    study_replacement = """    'study': [
      { key:'artwork', name:'The Artwork', x:'39.9%', y:'19.0%', body:'The central artwork wall — the visual reference point behind the desk.', specs:[['Collection', 'Paris Pullen']] },
      { key:'cocktails', name:'The Gentlemen&#8217;s Cocktail Menu', x:'36.9%', y:'44.2%', body:'The house cocktail menu set on the left side of the desk.', specs:[['House classics', 'Eleven']] },
      { key:'journal', name:'The Journal', x:'49.6%', y:'42.9%', body:'The journal placed on the right side of the desk within reach.', specs:[['Read it', 'The Journal']] },
    ],
    'cinema': ["""
    text, count = re.subn(
        r"    'study': \[.*?\n    \],\n    'cinema': \[",
        study_replacement,
        text,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError("Could not replace runtime Study artifact set")

    text = patch_city_node(text, js=True)

    old_tv = """    'penthouse-living': { x:'55.7%', y:'24.0%', w:'17%', h:'14%',
      box:'0.4740,0.1704,0.6406,0.3093', channelSet:'living',
      id:'4xVVFJuycww', label:'The Gentlemen' },"""
    wrong_tv = """    'penthouse-living': { x:'41.1%', y:'21.7%', w:'13.1%', h:'12.6%',
      box:'0.3455,0.1545,0.4766,0.2804', channelSet:'living',
      id:'4xVVFJuycww', label:'The Gentlemen' },"""
    previous_tv = """    'penthouse-living': { x:'51.0%', y:'24.5%', w:'16.0%', h:'13.0%',
      box:'0.4300,0.1800,0.5900,0.3100', channelSet:'living',
      id:'4xVVFJuycww', label:'The Gentlemen' },"""
    new_tv = """    'penthouse-living': { x:'51.0%', y:'26.375%', w:'16.0%', h:'13.0%',
      box:'0.4300,0.19875,0.5900,0.32875', channelSet:'living',
      id:'4xVVFJuycww', label:'The Gentlemen' },"""
    if previous_tv in text:
        text = text.replace(previous_tv, new_tv, 1)
    elif wrong_tv in text:
        text = text.replace(wrong_tv, new_tv, 1)
    elif new_tv not in text:
        text = replace_required(text, old_tv, new_tv, "runtime Living Room TV screen")

    old_cta = "var wardrobeCta = ((roomId === 'closet' && key === 'suits') || (roomId === 'bedroom' && key === 'suit')) ? SUITS_CTA : '';"
    new_cta = "var wardrobeCta = (((roomId === 'closet' || roomId === 'penthouse-living') && key === 'suits') || (roomId === 'bedroom' && key === 'suit')) ? SUITS_CTA : '';"
    if old_cta in text:
        text = text.replace(old_cta, new_cta, 1)

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
    if old in text:
        text = text.replace(old, new, 1)
    ARTIFACT_JS.write_text(text, encoding="utf-8")


def main():
    patch_data()
    patch_build()
    patch_runtime()
    patch_blueprint_dispatch()
    print("Approved Living Room v7, Study v7, Closet nodes and mobile runtime applied")


if __name__ == "__main__":
    main()
