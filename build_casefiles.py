#!/usr/bin/env python3
"""Public brand case files. Edit CASES and re-run: python3 build_casefiles.py"""

CASES = [
 dict(id="goodwill-grooming", no="01", client="Goodwill Grooming",
      kind="Barber &amp; recording artist", status="Live",
      thumb="goodwill", site="http://localhost:4350/goodwill-grooming/index.html",
      line="One man, two crafts, one room.",
      brief="A barber who records. Two audiences, two vocabularies, and every existing option forcing him to pick one.",
      move="Refuse the split. One site, one voice, two reasons to walk in — the chair and the booth sharing a page without competing for it.",
      built=["Single-page site with a full booking flow","Barber and music on equal footing",
             "Deployed to Hostinger","Preview and template variants retained"],
      result="Built and delivered. Domain registration is the last outstanding item on their side."),

 dict(id="threepiece-entertainment", no="02", client="Three Piece Entertainment",
      kind="Live music, production &amp; education", status="Live",
      thumb="threepiece", site="http://localhost:4350/threepiece-entertainment/index.html",
      line="The proposal is the product.",
      brief="An entertainment company emailing PDFs into a market where the pitch is the first proof of quality.",
      move="Make the proposal behave like the service. Private, expiring documents with the client’s name on them and three priced options.",
      built=["Main site and a dedicated artist page","A proposal engine generating gated client documents",
             "Fourteen live proposals with access codes and tiered pricing","A private index tracking every one"],
      result="Live and running. It is the pattern the Drafting Room itself was modelled on."),

 dict(id="your-new-nail-tech", no="03", client="Your New Nail Tech",
      kind="Luxury nail artistry", status="Proposal out",
      thumb="nailtech", site="http://localhost:4350/your-new-nail-tech/index.html",
      line="Clean luxury, not clinical.",
      brief="A category that defaults to either clinical white or heavy glamour, with nothing in between for someone whose work is genuinely fine.",
      move="Sit between them. Restrained, expensive-feeling, and built so the work in the photographs is the loudest thing on the page.",
      built=["Single-page site with booking","A service and pricing structure that lets clients self-qualify",
             "An identity that avoids both category defaults","Ready to deploy"],
      result="Opened twice, no reply yet. Spotify ID and opening hours still unconfirmed."),

 dict(id="burns-brims", no="04", client="Burns &amp; Brims",
      kind="Millinery", status="In the workroom",
      thumb="burns", site="http://localhost:4350/burns-brims/index.html",
      line="A hat is a decision.",
      brief="Millinery sells badly online because the photography flattens it. A hat is a three-dimensional object being sold as a cut-out.",
      move="Treat every piece as an object with weight and shadow. Light it like sculpture, not like stock.",
      built=["Single-page site built around the existing tagline","Product photography treated as objects",
             "Shop section — in progress"],
      result="Not yet presented. The shop section needs finishing, and the 254MB asset folder needs compressing before deploy."),
]

def block(c):
    built = "".join(f'<li class="body" style="margin-bottom:var(--s2)">&#8212; {b}</li>' for b in c["built"])
    return f"""
<section class="scene scene--pad" id="{c['id']}" style="border-top:1px solid var(--rule)">
  <div class="wrap">
    <div class="split" style="align-items:start">
      <div class="stack reveal">
        <p class="eyebrow">Case file {c['no']}</p>
        <h2 class="display display--h2" style="margin-block:var(--s2)">{c['client']}</h2>
        <p class="classified">{c['kind']} &#183; {c['status']}</p>
        <p class="statement" style="margin-top:var(--s4)">{c['line']}</p>
      </div>
      <a class="exhibit reveal reveal-d1" href="{c['site']}" target="_blank" rel="noopener">
        <img src="drafting/thumbs/{c['thumb']}.jpg"
             srcset="drafting/thumbs/{c['thumb']}@sm.jpg 440w, drafting/thumbs/{c['thumb']}.jpg 880w"
             sizes="(max-width:900px) 100vw, 50vw"
             alt="{c['client']} site" loading="lazy" width="880" height="550">
        <span class="exhibit__tag">Open the site &#8599;</span>
      </a>
    </div>

    <div class="split reveal" style="margin-top:var(--s8)">
      <div class="stack">
        <p class="eyebrow">The brief</p>
        <p class="body">{c['brief']}</p>
      </div>
      <div class="stack">
        <p class="eyebrow">The move</p>
        <p class="body">{c['move']}</p>
      </div>
    </div>

    <div class="split reveal" style="margin-top:var(--s7)">
      <div class="stack">
        <p class="eyebrow">What was built</p>
        <ul style="margin-top:var(--s2)">{built}</ul>
      </div>
      <div class="stack">
        <p class="eyebrow">Where it stands</p>
        <p class="body">{c['result']}</p>
      </div>
    </div>
  </div>
</section>
"""

PIN_POS = [("8.3%","22%"),("17.3%","19.3%"),("12.3%","41.7%"),("29.5%","39.4%")]
PINS = "".join(
    f'''
        <button class="pin" style="--x:{pos[0]};--y:{pos[1]};--i:{i}"
                data-no="File {c['no']}" data-name="{c['client']}" data-kind="{c['kind']}"
                data-file="{c['id']}" aria-label="Step up to {c['client']}">
          <span class="pin__ping" aria-hidden="true"></span>
          <span class="pin__core" aria-hidden="true"></span>
          <span class="pin__tag">{c['client']}</span>
        </button>'''
    for i, (c, pos) in enumerate(zip(CASES, PIN_POS)))

MENU = open('index.html', encoding='utf-8').read()
import re
menu = re.search(r'  <ul class="menu__list">.*?</ul>', MENU, re.S).group(0)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Case Files — Paris Pullen</title>
<meta name="description" content="Brand development case files from Paris Pullen LLC. The brief, the move, what was built, and where it stands.">
<meta name="theme-color" content="#0A0A0B">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/world.css">
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>

<header class="worldnav">
  <a class="worldnav__mark" href="index.html"><span class="foxx" aria-hidden="true"></span>Paris Pullen</a>
  <button class="worldnav__toggle" id="menu-toggle" aria-expanded="false" aria-controls="menu">
    <span class="worldnav__label">Menu</span>
    <span class="worldnav__bars" aria-hidden="true"><i></i><i></i></span>
  </button>
</header>
<nav class="menu" id="menu" aria-label="World navigation">
{menu}
  <div class="menu__foot">
    <p class="classified">Charlotte, North Carolina</p>
    <p class="classified">Enquiries &#183; <a class="link-under" href="mailto:hello@parispullen.com">hello@parispullen.com</a></p>
  </div>
</nav>

<main>
<section class="scene scene--pad" style="padding-top:clamp(8rem,20vh,13rem);padding-bottom:clamp(2.5rem,5vh,4rem)">
  <div class="wrap">
    <header class="split reveal" style="align-items:end">
      <div class="stack stack--tight">
        <p class="eyebrow">Paris Pullen LLC</p>
        <h1 class="display display--mega">Case<br>Files</h1>
      </div>
      <div class="stack">
        <p class="lede">Four brands. The brief, the move, what was built, and exactly where each one stands &#8212; including the ones that have not answered yet.</p>
        <p class="classified">Step up to a print on the wall</p>
      </div>
    </header>
  </div>
</section>

<section class="room reveal" id="room">
  <div class="room__plate">
    <img src="assets/img/env-editorial.jpg"
         srcset="assets/img/env-editorial@sm.jpg 1200w, assets/img/env-editorial.jpg 2400w"
         sizes="100vw" alt="The studio wall, client work pinned and threaded"
         loading="eager" width="2400" height="1339">{PINS}
  </div>
  <div class="room__vig" aria-hidden="true"></div>
  <div class="room__card">
    <p class="room__no" data-no></p>
    <p class="room__name" data-name></p>
    <p class="room__kind" data-kind></p>
    <div class="room__acts">
      <a class="cta" data-open href="#"><span>Open the file</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
      <button class="room__back" data-back>Step back</button>
    </div>
  </div>
</section>

<section class="scene scene--pad" style="padding-block:clamp(2.5rem,5vh,4rem)">
  <div class="wrap">
    <div class="casebar reveal">
      <div><b>Files</b><span>Four</span></div>
      <div><b>Live</b><span>Two</span></div>
      <div><b>Standard build</b><span>$1,500</span></div>
      <div><b>Care</b><span>$50/mo</span></div>
    </div>
  </div>
</section>
{''.join(block(c) for c in CASES)}
<section class="scene scene--pad tint-ink">
  <div class="wrap">
    <div class="split reveal">
      <p class="pullquote">Most people are sold a proposal. These people were handed the finished thing.</p>
      <div class="stack">
        <p class="body">The site gets built before anyone is asked to pay for it. It removes every abstract objection at once — nobody has to imagine what it might look like, or trust a mockup to become real.</p>
        <a class="cta" href="mailto:hello@parispullen.com?subject=Case%20Files"><span>Start a conversation</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
      </div>
    </div>
  </div>
</section>
</main>

<footer class="foot foot--film">
  <div class="foot__film" aria-hidden="true">
    <video data-lazy muted loop playsinline preload="none" poster="assets/img/env-motorclub@sm.jpg" width="1280" height="716">
      <source data-src="assets/video/footer-motorclub.mp4" type="video/mp4">
    </video>
  </div>
  <div class="foot__filmscrim" aria-hidden="true"></div>
  <div class="wrap">
    <div class="foot__base">
      <span>&copy; <span data-year>2026</span> Paris Pullen LLC</span>
      <span><a class="link-under" href="index.html">Back to the world</a></span>
      <span>Charlotte, North Carolina</span>
    </div>
  </div>
</footer>

<script src="assets/js/room.js" defer></script>
<script src="assets/js/world.js" defer></script>
</body>
</html>
"""
open("casefiles.html","w",encoding="utf-8").write(html)
print(f"casefiles.html written — {len(CASES)} files")
