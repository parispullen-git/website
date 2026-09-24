from pathlib import Path
import re

p = Path(__file__).resolve().parent.parent / 'links' / 'index.html'
s = p.read_text(encoding='utf-8')

# Keep the first two experiences authored in place: Join Network, then Blueprint.
pairs = [
    ('aria-label="Play The Blueprint, the Navy Suit wardrobe game"', 'aria-label="The Blueprint, Navy Suit Combination Guide"'),
    ('src="/assets/blueprint/blueprint-approved.webp?v=20260920b"', 'src="/assets/img/blueprint-links-suits.svg?v=20260923"'),
    ('<span class="lib__blueprint-kicker">The Navy Suit · Book 01</span>', '<span class="lib__blueprint-kicker">NAVY SUIT COMBINATION GUIDE</span>'),
    ('<span class="lib__blueprint-name">Play The Blueprint</span>', '<span class="lib__blueprint-name">The Blueprint</span>'),
    ('<span class="lib__blueprint-action">Play Now</span>', '<span class="lib__blueprint-action">Select Look</span>'),
    ('<span class="lib__net-toggle-name">Join the Network</span>', '<span class="lib__net-toggle-name">Join Network</span>'),
]
for old, new in pairs:
    s = s.replace(old, new, 1)

# Put Join Network before The Blueprint if the source still has Blueprint first.
bp_start = s.find('<a class="lib__blueprint" href="/blueprint.html"')
network_start = s.find('<div class="lib__network" id="network">')
if 0 <= bp_start < network_start:
    bp_end = s.find('</a>', bp_start) + 4
    bp_block = s[bp_start:bp_end]
    s = s[:bp_start] + s[bp_end:]
    network_start = s.find('<div class="lib__network" id="network">')
    network_end = s.find('</div>\n\n  <nav', network_start)
    if network_end < 0:
        network_end = s.find('</div>\n\n  <a class="lib__blueprint"', network_start)
    if network_end < 0:
        # The network contains nested divs; anchor insertion on the known nav marker is safer.
        nav_start = s.find('<nav class="lib__list" aria-label="Start here">')
        s = s[:nav_start] + bp_block + '\n\n  ' + s[nav_start:]
    else:
        insert_at = network_end + len('</div>')
        s = s[:insert_at] + '\n\n  ' + bp_block + s[insert_at:]

# The destination list is deliberately limited to the five experiences below.
# Join Network and The Blueprint sit immediately above it, producing the requested seven choices.
nav = '''<nav class="lib__list" aria-label="Start here">
    <a class="lib__card" href="/house.html">
      <img src="/assets/img/room-living@sm.jpg?v=20260923b" srcset="/assets/img/room-living@sm.jpg?v=20260923b 700w, /assets/img/room-living.jpg?v=20260923b 1400w" sizes="420px" alt="" loading="eager">
      <span class="lib__card-body"><span class="lib__card-name">The Compliment Hotel</span><span class="lib__card-arrow" aria-hidden="true">&#8594;</span></span>
    </a>

    <a class="lib__card" href="/journal.html">
      <img src="/assets/img/room-study@sm.jpg?v=20260913g" srcset="/assets/img/room-study@sm.jpg?v=20260913g 700w, /assets/img/room-study.jpg?v=20260913g 1400w" sizes="420px" alt="" loading="lazy">
      <span class="lib__card-body"><span class="lib__card-name">The Journal</span><span class="lib__card-arrow" aria-hidden="true">&#8594;</span></span>
    </a>

    <a class="lib__card" href="/charlotte.html">
      <img src="/assets/img/charlotte@sm.jpg" srcset="/assets/img/charlotte@sm.jpg 700w, /assets/img/charlotte.jpg 1400w" sizes="420px" alt="" loading="lazy">
      <span class="lib__card-body"><span class="lib__card-name">The City Guide</span><span class="lib__card-arrow" aria-hidden="true">&#8594;</span></span>
    </a>

    <a class="lib__card" href="/cocktail-menu.html">
      <img src="/assets/img/cocktails/old-fashioned.jpg?v=20260923d" sizes="420px" alt="" loading="lazy">
      <span class="lib__card-body"><span class="lib__card-name">The Cocktail Menu</span><span class="lib__card-arrow" aria-hidden="true">&#8594;</span></span>
    </a>

    <div class="lib__card lib__card--locked" aria-disabled="true" tabindex="0" role="button" aria-label="The Vault, UR Welcome — restricted">
      <img src="/assets/img/vault@sm.jpg" srcset="/assets/img/vault@sm.jpg 700w, /assets/img/vault.jpg 1400w" sizes="420px" alt="" loading="lazy">
      <span class="lib__card-body"><span class="lib__card-name">The Vault</span><span class="lib__card-lock" aria-hidden="true">&#128274;</span></span>
    </div>
  </nav>'''

s, count = re.subn(r'<nav class="lib__list" aria-label="Start here">.*?</nav>', nav, s, count=1, flags=re.S)
if count != 1:
    raise RuntimeError('Could not replace links destination list')

# Phone-first sizing: compact seven-choice stack, comfortable tap targets,
# safe-area padding, and less vertical dead space while preserving the existing visual system.
marker = '/* PP_LINKS_MOBILE_V2 */'
mobile_css = r'''
/* PP_LINKS_MOBILE_V2 */
.lib{
  width:100%;max-width:430px;min-height:100svh;
  padding:max(12px,env(safe-area-inset-top)) 12px max(18px,env(safe-area-inset-bottom));
}
.lib__panel{
  padding:18px 14px 16px;
  border-radius:4px;
}
.lib__music-toggle{top:12px;right:12px;width:38px;height:38px}
.lib__avatar{width:64px;height:64px;margin-bottom:10px}
.lib__name{font-size:1.35rem;margin-bottom:2px}
.lib__tag{font-size:.58rem;margin-bottom:4px}
.lib__lede{font-size:.78rem;line-height:1.35;margin-bottom:0}
.lib__network{margin-top:14px}
.lib__net-toggle{min-height:54px;padding:10px 13px}
.lib__net-toggle-name{font-size:1rem}
.lib__net-toggle-sub{font-size:.55rem;margin-top:2px}
.lib__blueprint{min-height:64px;height:64px;margin-top:10px}
.lib__blueprint-body{padding:9px 13px;gap:10px}
.lib__blueprint-kicker{font-size:.52rem;letter-spacing:.13em}
.lib__blueprint-name{font-size:1.05rem}
.lib__blueprint-action{font-size:.52rem;padding:.55em .65em}
.lib__list{gap:9px;margin-top:10px}
.lib__card{height:58px;min-height:58px}
.lib__card::after{top:9px;left:9px;width:5px;height:5px}
.lib__card-body{padding:9px 13px 9px 16px;gap:10px}
.lib__card-name{font-size:1rem;line-height:1.05}
.lib__card-arrow{font-size:1rem}
.lib__card-lock{font-size:.9rem}
.lib__social{margin-top:18px;gap:10px}
.lib__social a{width:38px;height:38px}
.lib__foot{margin-top:14px;gap:8px}
.lib__floor{margin-top:14px}
.lib__net-form{margin-top:9px;gap:10px;padding:12px}
.lib__net-field{gap:4px}
.lib__net-field input{min-height:44px;padding:.7em .8em}
.lib__net-submit{min-height:44px;margin-top:2px}
@media (min-width:600px){
  .lib{padding:28px 16px 34px}
  .lib__panel{padding:24px 20px 20px}
  .lib__card{height:64px}
}
'''
if marker in s:
    s = re.sub(r'/\* PP_LINKS_MOBILE_V2 \*/.*?(?=</style>)', mobile_css + '\n', s, count=1, flags=re.S)
else:
    s = s.replace('</style>', mobile_css + '\n</style>', 1)

p.write_text(s, encoding='utf-8')
print('Links hub updated: seven choices only, ordered Network → Blueprint → Hotel → Journal → City Guide → Cocktail Menu → Vault; mobile-first spacing applied')
