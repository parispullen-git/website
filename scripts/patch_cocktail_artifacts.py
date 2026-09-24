#!/usr/bin/env python3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

CARD='''\n    <a class="lib__card" href="/cocktail-menu.html" data-cocktail-portal>\n      <img src="/assets/img/room-study@sm.jpg?v=20260913g" srcset="/assets/img/room-study@sm.jpg?v=20260913g 700w, /assets/img/room-study.jpg?v=20260913g 1400w" sizes="420px" alt="" loading="lazy">\n      <span class="lib__card-body">\n        <span class="lib__card-text">\n          <span class="lib__card-name">The Gentleman’s Cocktail Menu</span>\n          <span class="lib__card-sub">11 house classics · recipes</span>\n        </span>\n        <span class="lib__card-arrow" aria-hidden="true">&#8594;</span>\n      </span>\n    </a>\n'''
SCRIPT='\n<script src="/assets/js/cocktail-portal.js?v=1" defer></script>\n'
ROUTER='''
<script>
/* PP_PENTHOUSE_ARTIFACT_ROUTES_V1
   Keep the room hotspots where they are; only make their destinations explicit. */
document.addEventListener('click', function (event) {
  var spot = event.target.closest('[data-artifact]');
  if (!spot) return;
  var key = spot.getAttribute('data-artifact');
  var room = spot.closest('.floor-scene');

  if (key === 'journal') {
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = '/journal.html';
    return;
  }

  if (room && room.id === 'penthouse-living' && key === 'suits') {
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = '/blueprint.html';
  }
}, true);
</script>
'''

def patch_links():
    p=ROOT/'links'/'index.html'
    s=p.read_text(encoding='utf-8')
    if 'data-cocktail-portal' not in s:
        city='''    <a class="lib__card" href="/charlotte.html">'''
        pos=s.find(city)
        if pos!=-1:
            # Put the Cocktail Menu immediately before City Guide so the hospitality artifacts sit together.
            s=s[:pos]+CARD+s[pos:]
        else:
            marker='  </nav>'
            s=s.replace(marker,CARD+marker,1)
    if 'cocktail-portal.js' not in s:
        s=s.replace('</body>',SCRIPT+'</body>',1)
    p.write_text(s,encoding='utf-8')

def patch_house():
    p=ROOT/'house.html'
    s=p.read_text(encoding='utf-8')
    # Every cocktail artifact is intercepted by cocktail-portal.js and opens
    # the full Gentleman's Cocktail Menu in the existing room-native overlay.
    if 'cocktail-portal.js' not in s:
        s=s.replace('</body>',SCRIPT+'</body>',1)
    # Journal artifacts go straight to the Journal; the approved Living Room
    # INDOCHINO/Suit Supply hotspot goes straight to The Blueprint game.
    if 'PP_PENTHOUSE_ARTIFACT_ROUTES_V1' not in s:
        s=s.replace('</body>',ROUTER+'</body>',1)
    p.write_text(s,encoding='utf-8')

def patch_data_copy():
    p=ROOT/'data'/'house-rooms.json'
    s=p.read_text(encoding='utf-8')
    s=s.replace('Six drinks, written on a card and kept behind the bottles, because a man looking up an Old Fashioned in front of guests has already lost the evening. Six is the entire list. There has never been a seventh.',
                'Eleven house classics, kept close because hospitality should look effortless even when the preparation is not. The menu opens the full Gentleman’s Cocktail Book — ingredients, glassware, garnish and method.')
    s=s.replace('"Drinks",\n            "Six"','"Drinks",\n            "Eleven"')
    p.write_text(s,encoding='utf-8')

if __name__=='__main__':
    patch_data_copy()
    patch_links()
    patch_house()
    print('Cocktail, Journal and Living Room Blueprint artifact routes patched')
