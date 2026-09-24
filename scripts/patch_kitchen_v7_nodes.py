#!/usr/bin/env python3
"""Apply the approved Kitchen, Music Lounge and Bedroom v7 artifact maps."""
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


KITCHEN_ARTS = [
    artifact("artwork", "The Artwork", "23.1%", "10.5%",
             "The framed portrait beside the fireplace and skyline.",
             (("Collection", "Paris Pullen"),)),
    artifact("suits", "The Blueprint Game", "58.3%", "42.1%",
             "The Blueprint Game follows the same system used in the Closet — choose the look, then own it.",
             (("Experience", "The Blueprint"),)),
    artifact("hellofresh", "The Gentleman’s Guide to HelloFresh", "58.5%", "63.8%",
             "The recipe card and ingredients on the island — the Gentleman’s Guide to HelloFresh.",
             (("Partner", "HelloFresh"),)),
    artifact("journal", "The Journal", "80.0%", "87.0%",
             "The journal at the dining place setting, ready for the next note.",
             (("Read it", "The Journal"),)),
]


MUSIC_ARTS = [
    artifact("artwork", "The Artwork", "48.4%", "15.0%",
             "The artwork wall above the record console — part gallery, part reference library.",
             (("Collection", "Paris Pullen"),)),
    artifact("recordplayer", "The Record Player", "38.6%", "34.1%",
             "ATF to OVO — the complete list, queued on shuffle and left running.",
             (("Plays", "One playlist, shuffled"), ("Manual skips", "Yes"))),
    artifact("journal", "The Journal", "39.4%", "59.9%",
             "The journal rests on the coffee table beside the books and candlelight.",
             (("Read it", "The Journal"),)),
    artifact("cocktails", "The Gentlemen’s Cocktail Guide", "72.1%", "70.3%",
             "The house cocktail guide sits within reach of the sofa — the right drink without leaving the room.",
             (("House classics", "Eleven"),)),
]


# Image-relative points from the approved 2048x1152 Bedroom v7 annotation.
# City Guide is a separate animated portal, not a drawer artifact.
BEDROOM_ARTS = [
    artifact("artwork", "The Artwork", "36.8%", "17.4%",
             "The portrait beside the fireplace anchors the room’s personal collection.",
             (("Collection", "Paris Pullen"),)),
    artifact("suit", "The Blueprint Game", "63.9%", "37.5%",
             "The look laid across the bed opens The Blueprint — choose the combination, then own how you show up.",
             (("Experience", "The Blueprint"),)),
    artifact("cocktails", "The Gentlemen’s Cocktail Guide", "16.2%", "46.1%",
             "The house cocktail guide sits beside the lounge seating for a proper nightcap without leaving the suite.",
             (("House classics", "Eleven"),)),
    artifact("journal", "The Journal", "85.9%", "69.3%",
             "The open journal on the writing desk — a private note before the room goes quiet.",
             (("Read it", "The Journal"),)),
]


def patch_data():
    rooms = json.loads(DATA.read_text(encoding="utf-8"))
    by_id = {room["id"]: room for room in rooms}
    by_id["kitchen"]["arts"] = KITCHEN_ARTS
    by_id["music-lounge"]["arts"] = MUSIC_ARTS
    by_id["bedroom"]["arts"] = BEDROOM_ARTS
    DATA.write_text(json.dumps(rooms, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def set_city_guide(text, room_id, x, y, js=False):
    """Replace/add one room's City Guide portal in the active position map."""
    if js:
        target = f"'{room_id}':     ['{x}', '{y}']"
        pattern = rf"\n\s*'{re.escape(room_id)}':\s*\['[^']+',\s*'[^']+'\],?[^\n]*"
        text = re.sub(pattern, "", text)
        marker = "'study':            ['85.0%', '25.2%']"
        if target not in text and marker in text:
            text = text.replace(marker, marker + ",\n    " + target, 1)
        elif target not in text:
            marker = "'bath':             ['38%', '6%']"
            if marker in text:
                text = text.replace(marker, marker + ",\n    " + target, 1)
    else:
        target = f'"{room_id}":     ("{x}", "{y}")'
        pattern = rf'\n\s*"{re.escape(room_id)}":\s*\("[^"]+",\s*"[^"]+"\),?[^\n]*'
        text = re.sub(pattern, "", text)
        marker = '"study":            ("85.0%", "25.2%")'
        if target not in text and marker in text:
            text = text.replace(marker, marker + ",\n    " + target, 1)
        elif target not in text:
            marker = '"bath":             ("38%", "6%")'
            if marker in text:
                text = text.replace(marker, marker + ",\n    " + target, 1)
    return text


def patch_runtime():
    text = PENTHOUSE_JS.read_text(encoding="utf-8")

    kitchen_replacement = """    'kitchen': [
      { key:'artwork', name:'The Artwork', x:'23.1%', y:'10.5%', body:'The framed portrait beside the fireplace and skyline.', specs:[['Collection', 'Paris Pullen']] },
      { key:'suits', name:'The Blueprint Game', x:'58.3%', y:'42.1%', body:'The Blueprint Game follows the same system used in the Closet — choose the look, then own it.', specs:[['Experience', 'The Blueprint']] },
      { key:'hellofresh', name:'The Gentleman&#8217;s Guide to HelloFresh', x:'58.5%', y:'63.8%', body:'The recipe card and ingredients on the island — the Gentleman&#8217;s Guide to HelloFresh.', specs:[['Partner', 'HelloFresh']] },
      { key:'journal', name:'The Journal', x:'80.0%', y:'87.0%', body:'The journal at the dining place setting, ready for the next note.', specs:[['Read it', 'The Journal']] },
    ],
    'study': ["""
    text, count = re.subn(r"    'kitchen': \[.*?\n    \],\n    'study': \[", kitchen_replacement,
                          text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("Could not replace runtime Kitchen artifact set")

    music_replacement = """    'music-lounge': [
      { key:'artwork', name:'The Artwork', x:'48.4%', y:'15.0%', body:'The artwork wall above the record console — part gallery, part reference library.', specs:[['Collection', 'Paris Pullen']] },
      { key:'recordplayer', name:'The Record Player', x:'38.6%', y:'34.1%', body:'ATF to OVO — the complete list, queued on shuffle and left running.', specs:[['Plays', 'One playlist, shuffled'], ['Manual skips', 'Yes']] },
      { key:'journal', name:'The Journal', x:'39.4%', y:'59.9%', body:'The journal rests on the coffee table beside the books and candlelight.', specs:[['Read it', 'The Journal']] },
      { key:'cocktails', name:'The Gentlemen&#8217;s Cocktail Guide', x:'72.1%', y:'70.3%', body:'The house cocktail guide sits within reach of the sofa — the right drink without leaving the room.', specs:[['House classics', 'Eleven']] },
    ],
    'bedroom': ["""
    text, count = re.subn(r"    'music-lounge': \[.*?\n    \],\n    'bedroom': \[", music_replacement,
                          text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("Could not replace runtime Music Lounge artifact set")

    bedroom_replacement = """    'bedroom': [
      { key:'artwork', name:'The Artwork', x:'36.8%', y:'17.4%', body:'The portrait beside the fireplace anchors the room&#8217;s personal collection.', specs:[['Collection', 'Paris Pullen']] },
      { key:'suit', name:'The Blueprint Game', x:'63.9%', y:'37.5%', body:'The look laid across the bed opens The Blueprint — choose the combination, then own how you show up.', specs:[['Experience', 'The Blueprint']] },
      { key:'cocktails', name:'The Gentlemen&#8217;s Cocktail Guide', x:'16.2%', y:'46.1%', body:'The house cocktail guide sits beside the lounge seating for a proper nightcap without leaving the suite.', specs:[['House classics', 'Eleven']] },
      { key:'journal', name:'The Journal', x:'85.9%', y:'69.3%', body:'The open journal on the writing desk — a private note before the room goes quiet.', specs:[['Read it', 'The Journal']] },
    ],
    'bath': ["""
    text, count = re.subn(r"    'bedroom': \[.*?\n    \],\n    'bath': \[", bedroom_replacement,
                          text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError("Could not replace runtime Bedroom artifact set")

    # Music Lounge no longer has a separate Remote marker.
    text = re.sub(r"\n\s*'music-lounge':\s*\['50%',\s*'62%'\],?", "", text, count=1)
    text = set_city_guide(text, "music-lounge", "5.5%", "27.3%", js=True)
    text = set_city_guide(text, "bedroom", "14.7%", "14.4%", js=True)

    # Kitchen uses the same Blueprint CTA as Closet/Living Room; Bedroom retains its suit-key Blueprint CTA.
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
    text = re.sub(r'\n\s*"music-lounge":\s*\("50%",\s*"62%"\),?', "", text, count=1)
    text = set_city_guide(text, "music-lounge", "5.5%", "27.3%", js=False)
    text = set_city_guide(text, "bedroom", "14.7%", "14.4%", js=False)
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
    print("Approved Kitchen + Music Lounge + Bedroom v7 artifacts applied")


if __name__ == "__main__":
    main()
