#!/usr/bin/env python3
import re
from pathlib import Path

house = Path('house.html').read_text(encoding='utf-8')
js = Path('assets/js/penthouse.js').read_text(encoding='utf-8')
index = Path('index.html').read_text(encoding='utf-8')
css = Path('assets/css/world.css').read_text(encoding='utf-8')


def section(room_id):
    match = re.search(rf'<section class="floor-scene[^>]*id="{re.escape(room_id)}".*?</section>', house, re.S)
    assert match, f'{room_id} section missing from house.html'
    return match.group(0)


def buttons(block):
    return re.findall(r'<button[^>]*class="artifact[^>]*data-artifact=', block)

# Living Room
living = section('penthouse-living')
for name in ['The Artwork','The Journal','The Vault','The Blueprint Game','The Gentlemen’s Cocktail Menu']:
    assert name in living, f'{name} missing from Living Room'
for retired in ['The Candle','The Polo']:
    assert retired not in living, f'{retired} still present in Living Room'
assert len(buttons(living)) == 5
for xy in ['--x:75.0%;--y:10.0%','--x:79.5%;--y:51.5%','--x:91.5%;--y:68.5%','--x:44.5%;--y:66.5%','--x:9.0%;--y:87.5%']:
    assert xy in living
assert '--x:15.0%;--y:35.0%' in living
assert '--x:51.0%;--y:26.375%;--w:16.0%;--h:13.0%' in living
assert "x:'51.0%', y:'26.375%', w:'16.0%', h:'13.0%'" in js
assert 'room-living-v7.jpg?v=20260924v7j' in living
assert 'room-living-v7@sm.jpg?v=20260924v7j' in living

# Study
study = section('study')
for name in ['The Artwork','The Gentlemen’s Cocktail Menu','The Journal']:
    assert name in study
for retired in ['The Monogram','The Pullen Laws','The Polo']:
    assert retired not in study
assert len(buttons(study)) == 3
for xy in ['--x:39.9%;--y:19.0%','--x:36.9%;--y:44.2%','--x:49.6%;--y:42.9%']:
    assert xy in study
assert '--x:85.0%;--y:25.2%' in study and 'The City Guide' in study

# Kitchen
kitchen = section('kitchen')
for name in ['The Artwork','The Blueprint Game','The Gentleman’s Guide to HelloFresh','The Journal']:
    assert name in kitchen
for retired in ['The Jacket','The Delivery']:
    assert retired not in kitchen
assert len(buttons(kitchen)) == 4
for xy in ['--x:23.1%;--y:10.5%','--x:58.3%;--y:42.1%','--x:58.5%;--y:63.8%','--x:80.0%;--y:87.0%']:
    assert xy in kitchen

# Music Lounge
music = section('music-lounge')
for name in ['The Artwork','The Record Player','The Journal','The Gentlemen’s Cocktail Guide']:
    assert name in music
assert 'The Polo' not in music and 'The Remote' not in music
assert len(buttons(music)) == 4
for xy in ['--x:48.4%;--y:15.0%','--x:38.6%;--y:34.1%','--x:39.4%;--y:59.9%','--x:72.1%;--y:70.3%']:
    assert xy in music
assert '--x:5.5%;--y:27.3%' in music and 'The City Guide' in music

# Bedroom
bedroom = section('bedroom')
for name in ['The Artwork','The Blueprint Game','The Gentlemen’s Cocktail Guide','The Journal']:
    assert name in bedroom
assert 'The Suit' not in bedroom
assert len(buttons(bedroom)) == 4
for xy in ['--x:36.8%;--y:17.4%','--x:63.9%;--y:37.5%','--x:16.2%;--y:46.1%','--x:85.9%;--y:69.3%']:
    assert xy in bedroom
assert '--x:14.7%;--y:14.4%' in bedroom and 'The City Guide' in bedroom

# Closet: two drawer artifacts + After Hours portal + City Guide portal.
closet = section('closet')
for name in ['The Blueprint Game','The After Hours Boxing Game','The Journal','The City Guide']:
    assert name in closet, f'{name} missing from Closet'
for retired in ['The Shoes','The Ties','The Suits &amp; Tuxedos']:
    assert retired not in closet, f'{retired} still present in Closet'
assert len(buttons(closet)) == 2, f'Closet should have exactly two drawer artifacts, found {len(buttons(closet))}'
for xy in ['--x:14.8%;--y:31.0%','--x:46.2%;--y:22.5%','--x:59.0%;--y:15.5%']:
    assert xy in closet, f'Closet marker {xy} missing'
assert '--x:34.8%;--y:8.6%' in closet, 'Closet City Guide position missing'
assert 'data-gym-portal' in closet, 'Closet After Hours portal wiring missing'
assert 'room-closet-v7.jpg?v=20260924v7j' in closet
assert 'room-closet-v7@sm.jpg?v=20260924v7j' in closet

# Runtime/mobile source verification.
for needle in [
    "'music-lounge':     ['5.5%', '27.3%']",
    "'bedroom':     ['14.7%', '14.4%']",
    "'closet':     ['34.8%', '8.6%']",
    "key:'suits', name:'The Blueprint Game', x:'14.8%', y:'31.0%'",
    "key:'boxer', name:'The After Hours Boxing Game', x:'46.2%', y:'22.5%'",
    "key:'journal', name:'The Journal', x:'59.0%', y:'15.5%'",
]:
    assert needle in js, f'Runtime missing {needle}'
assert "room.id === 'closet') && a.key === 'boxer'" in js or "room.id === 'closet') && a.key === 'boxer'" in js.replace(' || ', ' || ')
assert 'penthouse.js?v=20260924lr7j' in index
assert '.floor-scene__view img{' in css and 'height:100%;width:auto' in css

print('Penthouse v7 desktop/mobile verification passed')
