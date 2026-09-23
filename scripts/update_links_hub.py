from pathlib import Path

p = Path(__file__).resolve().parent.parent / 'links' / 'index.html'
s = p.read_text(encoding='utf-8')

pairs = [
('aria-label="Play The Blueprint, the Navy Suit wardrobe game"','aria-label="The Blueprint, Navy Suit Combination Guide"'),
('src="/assets/blueprint/blueprint-approved.webp?v=20260920b"','src="/assets/img/blueprint-links-suits.svg?v=20260923"'),
('<span class="lib__blueprint-kicker">The Navy Suit · Book 01</span>','<span class="lib__blueprint-kicker">NAVY SUIT COMBINATION GUIDE</span>'),
('<span class="lib__blueprint-name">Play The Blueprint</span>','<span class="lib__blueprint-name">The Blueprint</span>'),
('<span class="lib__blueprint-action">Play Now</span>','<span class="lib__blueprint-action">Select Look</span>')]
for old,new in pairs:
    if old in s:
        s=s.replace(old,new,1)

# Hide retired destination cards without deleting their source markup.
for href in ['/wardrobe.html','/house.html#cinema','/house.html#music-lounge','/house.html#gym']:
    marker=f'<a class="lib__card" href="{href}">'
    if marker in s:
        s=s.replace(marker,f'<a class="lib__card" href="{href}" hidden aria-hidden="true">',1)

# Put Join Network before The Blueprint by moving the Blueprint card directly before the destination list.
bp_start=s.find('<a class="lib__blueprint" href="/blueprint.html"')
network_start=s.find('<div class="lib__network" id="network">')
nav_start=s.find('<nav class="lib__list" aria-label="Start here">')
if 0 <= bp_start < network_start and nav_start > network_start:
    bp_end=s.find('</a>',bp_start)+4
    block=s[bp_start:bp_end]
    s=s[:bp_start]+s[bp_end:]
    nav_start=s.find('<nav class="lib__list" aria-label="Start here">')
    s=s[:nav_start]+block+'\n\n  '+s[nav_start:]

p.write_text(s,encoding='utf-8')
print('Links hub updated: Network first, Blueprint Select Look, retired room buttons hidden')
