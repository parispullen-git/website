#!/usr/bin/env python3
"""
The Drafting Room — Level 19, the hidden creative floor of Paris Pullen LLC.

  drafting/_index-private-<SUFFIX>.html   private pipeline index
  drafting/<slug>-<hex>.html              gated client proposal, one per brand

Edit drafting_data.py, then run:  python3 build_drafting.py

SECURITY: the unlisted URL is the real boundary. Access codes are friction and
presentation — the code is in the page source. Never put contracts, payment
details or client data on these pages.
"""
import os, datetime
from drafting_data import (FIRM, CONTACT, SUFFIX, BUILD_FEE, CARE_FEE,
                           FEATURES, CARE, COMMISSIONS)

LABEL = {"draft":"Draft","sent":"Sent","viewed":"Viewed","won":"Won","passed":"Passed"}
money = lambda n: f"${n:,}"

HEAD = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive,noimageindex">
<meta name="referrer" content="no-referrer">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/world.css">"""

BASE_CSS = """
  .dr-wrap{max-width:1240px;margin-inline:auto;padding:clamp(6rem,14vh,9rem) var(--gutter) var(--s9)}
  .dr-narrow{max-width:880px}
  .dr__state{font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.2em;text-transform:uppercase;white-space:nowrap}
  .dr__state[data-state="draft"]{color:var(--graphite)}
  .dr__state[data-state="sent"]{color:var(--brass-lit)}
  .dr__state[data-state="viewed"]{color:var(--champagne)}
  .dr__state[data-state="won"]{color:#6FA187}
  .dr__state[data-state="passed"]{color:#B4566A}
  .dr-warn{border-left:1px solid #B4566A;padding:var(--s4) var(--s5);color:var(--bone);max-width:74ch}
  code{font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.1em;color:var(--champagne);
       background:var(--ink);border:1px solid var(--hairline);padding:.3em .6em;white-space:nowrap}
"""

PROPOSAL_CSS = """
  /* countdown bar */
  .pbar{position:sticky;top:0;z-index:60;display:flex;flex-wrap:wrap;gap:var(--s4);
    align-items:center;justify-content:center;padding:var(--s3) var(--gutter);
    background:rgba(10,10,11,.96);border-bottom:1px solid var(--rule);
    font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.22em;
    text-transform:uppercase;color:var(--ash);backdrop-filter:blur(8px)}
  .pbar__clock{display:flex;gap:var(--s3)}
  .pbar__unit{display:inline-flex;align-items:baseline;gap:.2em;color:var(--champagne)}
  .pbar__unit b{font-family:var(--font-display);font-size:1.05rem;font-weight:400;letter-spacing:0}
  .pbar.is-soon{border-bottom-color:var(--brass)}
  .pbar.is-soon .pbar__unit{color:var(--brass-lit)}
  .pbar.is-dead{color:#B4566A;border-bottom-color:#B4566A}
  .pbar.is-dead .pbar__unit{color:#B4566A}

  /* gate */
  .gate-card{min-height:100svh;display:grid;place-items:center;text-align:center;padding:var(--gutter)}
  .gate-card form{display:flex;gap:var(--s3);flex-wrap:wrap;justify-content:center;margin-top:var(--s5)}
  .gate-card input{background:transparent;border:1px solid var(--graphite);color:var(--ivory);
    padding:1em 1.2em;font-family:var(--font-mono);font-size:var(--t-label);letter-spacing:.22em;
    text-transform:uppercase;text-align:center;min-width:15rem}
  .gate-card input:focus{outline:none;border-color:var(--brass)}
  .gate-err{color:#B4566A;font-family:var(--font-mono);font-size:var(--t-micro);
    letter-spacing:.14em;margin-top:var(--s4);min-height:1.2em}

  /* features */
  .feat{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);margin-top:var(--s5)}
  .feat__row{background:var(--bg);display:grid;grid-template-columns:minmax(0,13rem) 1fr;
    gap:var(--s5);padding:var(--s5)}
  .feat__k{font-family:var(--font-display);font-size:var(--t-h3);line-height:1.15;color:var(--ivory)}
  .feat__v{color:var(--silver);font-size:var(--t-label);line-height:1.7}
  @media(max-width:720px){.feat__row{grid-template-columns:1fr;gap:var(--s2)}}

  /* price blocks */
  .price{display:grid;gap:var(--s5);grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));margin-top:var(--s6)}
  .price__card{border:1px solid var(--rule);padding:var(--s6);display:grid;gap:var(--s3);align-content:start}
  .price__card--lead{border-color:var(--brass)}
  .price__k{font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.24em;
    text-transform:uppercase;color:var(--brass)}
  .price__n{font-family:var(--font-display);font-size:clamp(2.5rem,1.6rem+3.2vw,4rem);
    line-height:.95;color:var(--ivory);letter-spacing:-.03em}
  .price__n small{font-size:.28em;letter-spacing:.2em;color:var(--ash);margin-left:.4em}
  .price__note{color:var(--ash);font-size:var(--t-label);line-height:1.7}
  .price__list{margin-top:var(--s3);display:grid;gap:var(--s2)}
  .price__list li{color:var(--bone);font-size:var(--t-label);line-height:1.6;
    padding-left:1.1em;position:relative}
  .price__list li::before{content:"—";position:absolute;left:0;color:var(--brass)}

  /* modal */
  .pmodal{position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:var(--gutter);
    background:rgba(6,6,7,.86);backdrop-filter:blur(6px);opacity:0;visibility:hidden;
    transition:opacity var(--d-med) var(--ease-out),visibility var(--d-med)}
  .pmodal.is-open{opacity:1;visibility:visible}
  .pmodal__card{position:relative;background:var(--ink);border:1px solid var(--brass);
    padding:clamp(var(--s6),5vw,var(--s8));max-width:620px;width:100%;text-align:center;
    max-height:88svh;overflow-y:auto}
  .pmodal__close{position:absolute;top:var(--s4);right:var(--s5);font-family:var(--font-mono);
    font-size:var(--t-micro);letter-spacing:.2em;color:var(--ash)}
  .pmodal__close:hover{color:var(--champagne)}
  .exit__clock{display:flex;justify-content:center;gap:var(--s5);margin:var(--s6) 0}
  .exit__clock div{display:grid;gap:.2em}
  .exit__clock b{font-family:var(--font-display);font-size:2rem;font-weight:400;color:var(--champagne);line-height:1}
  .exit__clock small{font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.2em;
    text-transform:uppercase;color:var(--ash)}
  .exit__dismiss{margin-top:var(--s5);font-family:var(--font-mono);font-size:var(--t-micro);
    letter-spacing:.2em;text-transform:uppercase;color:var(--graphite)}
  .exit__dismiss:hover{color:var(--silver)}
"""

def proposal_page(c):
    subject = c['client'].replace('&amp;','and').replace(' ','%20')
    feats = "".join(
        f'<div class="feat__row"><p class="feat__k">{k}</p><p class="feat__v">{v}</p></div>'
        for k, v in FEATURES)
    feats += "".join(
        f'<div class="feat__row"><p class="feat__k">Specific to you</p><p class="feat__v">{e}</p></div>'
        for e in c['extras'])
    care = "".join(f"<li>{x}</li>" for x in CARE)

    if c['stripe']:
        pay = (f'<a class="cta" href="{c["stripe"]}" target="_blank" rel="noopener">'
               f'<span>Pay {money(BUILD_FEE)} &amp; start</span>'
               f'<span class="cta__arrow" aria-hidden="true">&#8594;</span></a>')
        pay_note = "Secure checkout via Stripe. Card, Apple Pay and Google Pay accepted."
    else:
        pay = ('<span class="cta" style="opacity:.45;cursor:default;border-color:var(--graphite)">'
               '<span>Payment link pending</span></span>')
        pay_note = ("Stripe link not yet attached &#8212; Paris will send a secure checkout link "
                    "directly, or you can settle by invoice.")

    if c['site']:
        view = (f'<a class="cta cta--ghost" href="{c["site"]}" target="_blank" rel="noopener">'
                f'<span>Open the live site</span></a>')
    elif c['preview']:
        view = (f'<a class="cta cta--ghost" href="{c["preview"]}" target="_blank" rel="noopener">'
                f'<span>Open the site</span></a>')
    else:
        view = ''

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
{HEAD}
<title>{c['client']} &#8212; Proposal</title>
<style>{BASE_CSS}{PROPOSAL_CSS}</style>
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>

<div class="gate-card" id="gate">
  <div class="stack" style="justify-items:center">
    <span class="foxx" aria-hidden="true" style="--foxx-size:48px;width:48px"></span>
    <p class="eyebrow" style="margin-top:var(--s5)">Private document</p>
    <h1 class="display display--h2" style="margin-block:var(--s3)">Enter your access code</h1>
    <p class="body" style="text-align:center;margin-inline:auto">Prepared for {c['client']} by {FIRM}. Not intended for onward circulation.</p>
    <form id="gate-form">
      <input id="gate-input" type="text" placeholder="Access code" autocomplete="off" spellcheck="false" aria-label="Access code">
      <button class="cta" type="submit"><span>Open</span></button>
    </form>
    <p class="gate-err" id="gate-err" role="alert"></p>
  </div>
</div>

<div id="doc" hidden>

<div class="pbar" id="pbar">
  <span id="pbar-label">This proposal expires in</span>
  <span class="pbar__clock" id="pbar-clock"></span>
</div>

<div class="dr-wrap dr-narrow">

  <header class="stack">
    <div class="lockup lockup--row" style="margin-bottom:var(--s6)">
      <span class="foxx" aria-hidden="true"></span>
      <div>
        <p class="lockup__name">{FIRM}</p>
        <p class="lockup__sub">Charlotte, North Carolina</p>
      </div>
    </div>
    <p class="eyebrow">Prepared for {c['client']}</p>
    <h1 class="display display--h1" style="margin-block:var(--s3)">{c['project']}</h1>
    <p class="statement">{c['tagline']}</p>
  </header>

  <section class="stack" style="margin-top:var(--s8)">
    <p class="eyebrow">The argument</p>
    <p class="lede">{c['argument']}</p>
    <p class="body">The site already exists. It was built before you were asked to pay for it, which removes every abstract objection at once &#8212; nobody has to imagine what it might look like, or trust that a mockup will become a real site. Open it and judge it.</p>
    <div class="hero__ctas" style="margin-top:var(--s5)">{view}</div>
  </section>

  <section class="stack" style="margin-top:var(--s9)">
    <p class="eyebrow">What the build includes</p>
    <div class="feat">{feats}</div>
  </section>

  <section class="stack" style="margin-top:var(--s9)">
    <p class="eyebrow">What it costs</p>
    <div class="price">
      <div class="price__card price__card--lead">
        <p class="price__k">The build &#183; one time</p>
        <p class="price__n">{money(BUILD_FEE)}</p>
        <p class="price__note">Everything above, delivered and handed over. One round of revisions included. Every file is yours.</p>
      </div>
      <div class="price__card">
        <p class="price__k">Care &#183; monthly</p>
        <p class="price__n">{money(CARE_FEE)}<small>/mo</small></p>
        <ul class="price__list">{care}</ul>
        <p class="price__note" style="margin-top:var(--s3)">Optional. Cancel any month.</p>
      </div>
    </div>

    <div class="hero__ctas" style="margin-top:var(--s7)">
      {pay}
      <a class="cta cta--ghost" href="mailto:{CONTACT}?subject=Re%3A%20{subject}"><span>Ask Paris a question</span></a>
    </div>
    <p class="classified" style="margin-top:var(--s4)">{pay_note}</p>
  </section>

  <footer class="foot foot--film" style="margin-top:var(--s9)">
    <div class="foot__film" aria-hidden="true">
      <video data-lazy muted loop playsinline preload="none" poster="../assets/img/env-motorclub@sm.jpg" width="1280" height="716">
        <source data-src="../assets/video/footer-motorclub.mp4" type="video/mp4">
      </video>
    </div>
    <div class="foot__filmscrim" aria-hidden="true"></div>
    <div class="foot__base" style="border:0;padding-top:0">
      <span>{FIRM}</span>
      <span><a class="link-under" href="mailto:{CONTACT}">{CONTACT}</a></span>
      <span>Private document &#183; not for circulation</span>
    </div>
  </footer>

</div>
</div>

<div class="pmodal" id="exit-modal" role="dialog" aria-modal="true" aria-labelledby="exit-title">
  <div class="pmodal__card">
    <button class="pmodal__close" data-close aria-label="Close">Close &#215;</button>
    <p class="eyebrow">Before you go</p>
    <h2 class="display display--h2" id="exit-title" style="margin-block:var(--s3)">The site is<br>still yours to take.</h2>
    <p class="body" style="text-align:center;margin-inline:auto">This price holds until the clock runs out. {money(BUILD_FEE)} to own it outright, {money(CARE_FEE)} a month if you want it looked after.</p>
    <div class="exit__clock" id="exit-clock"></div>
    <div class="hero__ctas" style="justify-content:center">{pay}</div>
    <button class="exit__dismiss" id="exit-dismiss">I&#8217;ll come back to this</button>
  </div>
</div>

<script>
(function(){{
  var CODE   = "{c['code']}";
  var EXPIRES= new Date("{c['expires']}");
  var KEY    = "pp_dr_{c['hexid']}";
  var $ = function(s){{ return document.querySelector(s); }};

  /* ---- gate ---- */
  var gate=$('#gate'), doc=$('#doc'), form=$('#gate-form'),
      input=$('#gate-input'), err=$('#gate-err');
  function openDoc(){{ gate.hidden=true; doc.hidden=false; }}
  try {{ if (sessionStorage.getItem(KEY)==='1') openDoc(); }} catch(e){{}}
  form.addEventListener('submit', function(e){{
    e.preventDefault();
    if (input.value.trim().toUpperCase() === CODE) {{
      try {{ sessionStorage.setItem(KEY,'1'); }} catch(e){{}}
      openDoc();
    }} else {{
      err.textContent='That code does not match this document.';
      input.value=''; input.focus();
    }}
  }});

  /* ---- countdown ---- */
  var bar=$('#pbar'), clock=$('#pbar-clock'), label=$('#pbar-label'), exitClock=$('#exit-clock');
  var UNITS={{d:'days',h:'hours',m:'mins',s:'secs'}};
  function parts(ms){{
    var s=Math.max(0,Math.floor(ms/1000));
    return {{d:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60}};
  }}
  function pad(n){{ return String(n).padStart(2,'0'); }}
  function tick(){{
    var left=EXPIRES.getTime()-Date.now(), t=parts(left), dead=left<=0;
    if(clock) clock.innerHTML = dead ? '<span class="pbar__unit"><b>Expired</b></span>'
      : ['d','h','m','s'].map(function(u){{ return '<span class="pbar__unit"><b>'+pad(t[u])+'</b>'+u+'</span>'; }}).join('');
    if(label) label.textContent = dead ? 'This proposal has expired' : 'This proposal expires in';
    if(bar){{ bar.classList.toggle('is-dead',dead); bar.classList.toggle('is-soon',!dead && left<72*3600*1000); }}
    if(exitClock) exitClock.innerHTML = ['d','h','m','s'].map(function(u){{
      return '<div><b>'+pad(t[u])+'</b><small>'+UNITS[u]+'</small></div>'; }}).join('');
  }}
  tick(); setInterval(tick,1000);

  /* ---- exit intent ---- */
  var modal=$('#exit-modal'), shown=false;
  function canShow(){{ return modal && !shown && !doc.hidden; }}
  function fire(){{ if(!canShow()) return; shown=true; modal.classList.add('is-open'); }}
  function close(){{ modal.classList.remove('is-open'); }}
  modal.querySelector('[data-close]').addEventListener('click',close);
  $('#exit-dismiss').addEventListener('click',close);
  modal.addEventListener('click',function(e){{ if(e.target===modal) close(); }});
  document.addEventListener('keydown',function(e){{ if(e.key==='Escape') close(); }});

  /* Arm only after the reader has actually engaged: the cursor must have been
     inside the page at least once, and six seconds must have passed. Without the
     engagement check a stray mouseout fires the modal at people whose pointer was
     never in the window. */
  var armed=false, entered=false;
  document.addEventListener('mousemove',function(){{ entered=true; }},{{once:true}});
  document.addEventListener('scroll',function(){{ entered=true; }},{{once:true,passive:true}});
  setTimeout(function(){{ armed=true; }},6000);
  document.addEventListener('mouseout',function(e){{
    if(!armed || !entered || e.relatedTarget || e.clientY>12) return;
    fire();
  }});
  /* ---- footer film: load only when it scrolls into view ---- */
  var fv = document.querySelector('.foot__film video');
  if (fv && 'IntersectionObserver' in window &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches) {{
    new IntersectionObserver(function(entries, ob){{
      entries.forEach(function(en){{
        if(!en.isIntersecting) return;
        var src = fv.querySelector('source[data-src]');
        if(src && !src.src){{ src.src = src.dataset.src; fv.load(); }}
        fv.play().catch(function(){{}});
        ob.disconnect();
      }});
    }},{{rootMargin:'200px'}}).observe(fv);
  }}

  if(matchMedia('(hover:none)').matches){{
    history.pushState({{pp:1}},'');
    addEventListener('popstate',function(){{
      if(canShow()){{ history.pushState({{pp:1}},''); fire(); }}
    }});
  }}
}})();
</script>
</body>
</html>
"""

# ------------------------------------------------------------------ index
rows = ""
for i, c in enumerate(COMMISSIONS, 1):
    link = f"{c['slug']}-{c['hexid']}.html"
    exp  = datetime.datetime.fromisoformat(c['expires']).strftime("%d %b %Y")
    live = c['site'] or c['preview']
    site_cell = (f'<a class="dr__go" href="{live}" target="_blank" rel="noopener">Site &#8599;</a>'
                 if live else '<span class="dr__go" style="opacity:.4;border:0">No URL</span>')
    pay_cell  = (f'<a class="dr__go" href="{c["stripe"]}" target="_blank" rel="noopener">Stripe &#8599;</a>'
                 if c['stripe'] else '<span class="dr__go" style="opacity:.4;border:0">No link</span>')
    thumb = (f'<a class="dr__thumb" href="{live}" target="_blank" rel="noopener" '
             f'aria-label="Open the {c["client"]} site">'
             f'<img src="thumbs/{c["thumb"]}.jpg" '
             f'srcset="thumbs/{c["thumb"]}@sm.jpg 440w, thumbs/{c["thumb"]}.jpg 880w" '
             f'sizes="(max-width:1100px) 100vw, 15rem" '
             f'alt="{c["client"]} site" loading="lazy" width="880" height="550">'
             f'<span class="dr__thumbgo">Open &#8599;</span></a>'
             if c.get('thumb') else '')
    rows += f"""        <tr>
          <td class="dr__no">{i:02d}</td>
          <td class="dr__thumbcell">{thumb}</td>
          <td><b>{c['client']}</b><small>{c['project']}</small></td>
          <td data-l="Status"><span class="dr__state" data-state="{c['status']}">{LABEL[c['status']]}</span></td>
          <td class="r" data-l="Build">{money(BUILD_FEE)}</td>
          <td class="r" data-l="Care">{money(CARE_FEE)}/mo</td>
          <td data-l="Access code"><code>{c['code']}</code></td>
          <td class="r" data-l="Expires">{exp}</td>
          <td class="r"><a class="dr__go" href="{link}">Proposal &#8599;</a></td>
          <td class="r">{site_cell}</td>
          <td class="r">{pay_cell}</td>
        </tr>
        <tr class="dr__noterow"><td></td><td colspan="10" class="dr__note">{c['note']}</td></tr>
"""

counts = {}
for c in COMMISSIONS: counts[c['status']] = counts.get(c['status'],0)+1
open_pipeline = sum(1 for c in COMMISSIONS if c['status'] in ("draft","sent","viewed"))
potential = open_pipeline * BUILD_FEE

index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
{HEAD}
<title>Level 19 &#8212; The Drafting Room</title>
<style>{BASE_CSS}
  .dr-table{{width:100%;border-collapse:collapse;margin-top:var(--s7)}}
  .dr-table th{{text-align:left;font-family:var(--font-mono);font-size:var(--t-micro);
    letter-spacing:.22em;text-transform:uppercase;color:var(--brass);font-weight:400;
    padding:0 var(--s4) var(--s3) 0;border-bottom:1px solid var(--rule);white-space:nowrap}}
  .dr-table td{{padding:var(--s4) var(--s4) var(--s4) 0;border-bottom:1px solid var(--rule);
    vertical-align:top;font-size:var(--t-label);color:var(--silver)}}
  .dr-table tr.dr__noterow td{{padding-top:0;font-size:var(--t-micro);color:var(--ash);line-height:1.7}}
  .dr-table td b{{display:block;font-family:var(--font-display);font-size:var(--t-h3);
    line-height:1.15;color:var(--ivory);font-weight:400}}
  .dr-table td small{{display:block;margin-top:.3em;font-family:var(--font-mono);
    font-size:var(--t-micro);letter-spacing:.16em;text-transform:uppercase;color:var(--ash)}}
  .dr-table td.r{{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}}
  .dr__no{{font-family:var(--font-mono);font-size:var(--t-micro);color:var(--brass);letter-spacing:.18em}}
  .dr__go{{font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.18em;text-transform:uppercase;
    color:var(--bone);border-bottom:1px solid var(--hairline);white-space:nowrap;
    transition:color var(--d-fast),border-color var(--d-fast)}}
  .dr__go:hover{{color:var(--brass-lit);border-color:var(--brass)}}
  .dr__thumbcell{{width:15rem}}
  .dr__thumb{{position:relative;display:block;width:15rem;aspect-ratio:16/10;overflow:hidden;
    border:1px solid var(--rule);background:var(--charcoal)}}
  .dr__thumb img{{width:100%;height:100%;object-fit:cover;object-position:top center;
    filter:grayscale(.45) contrast(1.05) brightness(.82);
    transition:transform var(--d-cine) var(--ease-out),filter var(--d-cine) var(--ease-out)}}
  .dr__thumb:hover img{{transform:scale(1.04);filter:none}}
  .dr__thumbgo{{position:absolute;inset:auto 0 0 0;padding:.5em .7em;
    background:linear-gradient(transparent,rgba(10,10,11,.9));
    font-family:var(--font-mono);font-size:var(--t-micro);letter-spacing:.2em;
    text-transform:uppercase;color:var(--champagne);opacity:0;
    transition:opacity var(--d-med) var(--ease-out)}}
  .dr__thumb:hover .dr__thumbgo{{opacity:1}}
  @media(max-width:1100px){{
    .dr-table thead{{display:none}}
    .dr__thumbcell,.dr__thumb{{width:100%}}
    .dr__thumb{{margin-bottom:var(--s4)}}
    .dr-table tr{{display:block;border-bottom:1px solid var(--rule);padding-block:var(--s5)}}
    .dr-table td{{display:block;border:0;padding:0;text-align:left !important}}
    .dr-table td[data-l]{{display:grid;grid-template-columns:8.5rem 1fr;gap:var(--s4);
      align-items:baseline;padding:.35rem 0}}
    .dr-table td[data-l]::before{{content:attr(data-l);font-family:var(--font-mono);
      font-size:var(--t-micro);letter-spacing:.2em;text-transform:uppercase;color:var(--brass)}}
    .dr-table td[data-l] code,.dr-table td[data-l] .dr__state{{justify-self:start}}
    .dr-table td.dr__no{{margin-bottom:var(--s2)}}
    .dr-table td b{{margin-bottom:var(--s3)}}
    .dr-table tr.dr__noterow{{border:0;padding-top:0;padding-bottom:var(--s5)}}
    .dr-table tr.dr__noterow td{{padding-top:var(--s3)}}
  }}
</style>
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>

<div class="dr-wrap">

  <header class="stack">
    <div class="lockup lockup--row" style="margin-bottom:var(--s6)">
      <span class="foxx" aria-hidden="true"></span>
      <div>
        <p class="lockup__name">{FIRM}</p>
        <p class="lockup__sub">Level 19 &#183; Restricted</p>
      </div>
    </div>
    <p class="floor-plate__level"><b>19</b> <span>The Drafting Room</span></p>
    <h1 class="display display--h1" style="margin-block:var(--s3)">The Drafting Room</h1>
    <p class="lede">Work built for people who have not yet agreed to buy it. Every site on this floor exists, runs, and is finished enough to hand over &#8212; which is the whole argument.</p>
    <p class="classified">Not on the elevator panel &#183; Not linked from the site &#183; Not indexed</p>
  </header>

  <div class="casebar" style="margin-top:var(--s7)">
    <div><b>Commissions</b><span>{len(COMMISSIONS)}</span></div>
    <div><b>Open pipeline</b><span>{open_pipeline}</span></div>
    <div><b>Potential</b><span>{money(potential)}</span></div>
    <div><b>Won</b><span>{counts.get('won',0)}</span></div>
    <div><b>Standard build</b><span>{money(BUILD_FEE)} &#183; {money(CARE_FEE)}/mo care</span></div>
  </div>

  <table class="dr-table">
    <thead><tr>
      <th></th><th></th><th>Client &amp; project</th><th>Status</th>
      <th class="r">Build</th><th class="r">Care</th><th>Code</th><th class="r">Expires</th>
      <th></th><th></th><th></th>
    </tr></thead>
    <tbody>
{rows}    </tbody>
  </table>

  <div class="stack" style="margin-top:var(--s9);border-top:1px solid var(--rule);padding-top:var(--s7)">
    <p class="eyebrow">The pitch</p>
    <p class="statement" style="max-width:40ch">Most people are sold a proposal.<br>These people are handed the finished thing.</p>
  </div>

  <div class="dr-warn" style="margin-top:var(--s7)">
    <b>Before sending any of these:</b> paste a real Stripe Payment Link into
    <code>drafting_data.py</code> and re-run the build &#8212; until then the pay button is
    inert and the client is told an invoice will follow. Local preview URLs
    (<code>localhost</code>) only work on this machine; replace them with deployed
    URLs before a proposal leaves the building.
  </div>

  <div class="dr-warn" style="margin-top:var(--s5)">
    <b>On security.</b> The unlisted URL is the boundary. Access codes are presentation
    and friction, not protection &#8212; the code sits in the page source. Never put
    contracts, payment details or client data on this floor.
  </div>

  <p class="classified" style="margin-top:var(--s7)">
    Generated by <code>build_drafting.py</code> from <code>drafting_data.py</code>
  </p>

</div>
</body>
</html>
"""

os.makedirs("drafting", exist_ok=True)
idx = f"drafting/_index-private-{SUFFIX}.html"
open(idx,"w",encoding="utf-8").write(index_html)
for c in COMMISSIONS:
    open(f"drafting/{c['slug']}-{c['hexid']}.html","w",encoding="utf-8").write(proposal_page(c))

print(f"index -> {idx}")
for c in COMMISSIONS:
    print(f"  {c['client']:<28} {c['code']:<12} drafting/{c['slug']}-{c['hexid']}.html")
print(f"\nbuild {money(BUILD_FEE)} · care {money(CARE_FEE)}/mo · open pipeline {money(potential)}")
