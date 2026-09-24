#!/usr/bin/env python3
"""Apply the approved Kitchen v7 + Music Lounge v7 artifact maps."""
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


# Exact image-relative points from the approved 2048x1152 Music Lounge v7
# annotation. City Guide is a separate animated portal, not a drawer artifact.
MUSIC_ARTS = [
    artifact(
        "artwork", "The Artwork", "48.4%", "15.0%",
        "The artwork wall above the record console — part gallery, part reference library.",
        (("Collection", "Paris Pullen"),),
    ),
    artifact(
        "recordplayer", "The Record Player", "38.6%", "34.1%",
        "ATF to OVO — the complete list, queued on shuffle and left running.",
        (("Plays", "One playlist, shuffled"), ("Manual skips", "Yes")),
    ),
    artifact(
        "journal", "The Journal", "39.4%", "59.9%",
        "The journal rests on the coffee table beside the books and candlelight.",
        (("Read it", "The Journal"),),
    ),
    artifact(
        "cocktails", "The Gentlemen’s Cocktail Guide", "72.1%", "70.3%",
        "The house cocktail guide sits within reach of the sofa — the right drink without leaving the room.",
        (("House classics", "Eleven"),),
    ),
]


def patch_data():
    rooms = json.loads(DATA.read_text(encoding="utf-8"))
    by_id = {room["id"]: room for room in rooms}
    by_id["kitchen"]["arts"] = KITCHEN_ARTS
    by_id["music-lounge"]["arts"] = MUSIC_ARTS
    DATA.write_text(json.dumps(rooms, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def add_music_city_guide(text, js=False):
    """Add/move the Music Lounge City Guide portal to the annotated skyline point."""
    if js:
        target = "'music-lounge':     ['5.5%', '27.3%']"
        # Remove legacy city/barbershop Music Lounge entries if present.
        text = re.sub(
            r"\n\s*'music-lounge':\s*\['[^']+',\s*'[^']+'\],?[^\n]*",
            "",
            text,
        )
        # Add to whichever city-guide position map the earlier build patches produced.
        marker = "'study':            ['85.0%', '25.2%']"
        if target not in text and marker in text:
            text = text.replace(marker, marker + ",\n    " + target, 1)
        elif target not in text:
            # Fallback: insert after bath in the active position map.
            text = text.replace(
                "'bath':             ['38%', '6%']",
                "'bath':             ['38%', '6%'],\n    " + target,
                1,
            )
    else:
        target = '"music-lounge":     ("5.5%", "27.3%")'
        text = re.sub(
            r'\n\s*"music-lounge":\s*\("[^"]+",\s*"[^"]+"\),?[^\n]*',
            "",
            text,
        )
        marker = '"study":            ("85.0%", "25.2%")'
        if target not in text and marker in text:
            text = text.replace(marker, marker + ",\n    " + target, 1)
        elif target not in text:
            text = text.replace(
                '"bath":             ("38%", "6%")',
                '"bath":             ("38%", "6%"),\n    ' + target,
                1,
            )
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
    text, count = re.subn(
        r"    'kitchen': \[.*?\n    \],\n    'study': \[",
        kitchen_replacement,
        text,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError("Could not replace runtime Kitchen artifact set")

    music_replacement = """    'music-lounge': [
      { key:'artwork', name:'The Artwork', x:'48.4%', y:'15.0%', body:'The artwork wall above the record console — part gallery, part reference library.', specs:[['Collection', 'Paris Pullen']] },
      { key:'recordplayer', name:'The Record Player', x:'38.6%', y:'34.1%', body:'ATF to OVO — the complete list, queued on shuffle and left running.', specs:[['Plays', 'One playlist, shuffled'], ['Manual skips', 'Yes']] },
      { key:'journal', name:'The Journal', x:'39.4%', y:'59.9%', body:'The journal rests on the coffee table beside the books and candlelight.', specs:[['Read it', 'The Journal']] },
      { key:'cocktails', name:'The Gentlemen&#8217;s Cocktail Guide', x:'72.1%', y:'70.3%', body:'The house cocktail guide sits within reach of the sofa — the right drink without leaving the room.', specs:[['House classics', 'Eleven']] },
    ],
    'bedroom': ["""
    text, count = re.subn(
        r"    'music-lounge': \[.*?\n    \],\n    'bedroom': \[",
        music_replacement,
        text,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError("Could not replace runtime Music Lounge artifact set")

    # The approved Music Lounge mockup uses the Record Player as the music
    # interaction and does not include the old separate Remote marker.
    text = re.sub(
        r"\n\s*'music-lounge':\s*\['50%',\s*'62%'\],?",
        "",
        text,
        count=1,
    )
    text = add_music_city_guide(text, js=True)

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

    # Remove the retired Music Lounge remote and add the annotated City Guide portal.
    text = re.sub(
        r'\n\s*"music-lounge":\s*\("50%",\s*"62%"\),?',
        "",
        text,
        count=1,
    )
    text = add_music_city_guide(text, js=False)
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
    print("Approved Kitchen v7 + Music Lounge v7 artifacts applied")


if __name__ == "__main__":
    main()
