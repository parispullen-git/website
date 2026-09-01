#!/usr/bin/env python3
"""
El Lambert — proposal generator.

Edit PROPOSALS below, run `python3 _build.py`, and each entry renders to its own
unlisted HTML page (cover → numbered sections → options → included → next steps
→ sign-off) with the interactive layer on top: live expiry countdown, clickable
pricing, agreement gate, payment hand-off, and exit-intent recovery.

The two entries below are DEMOS — clearly fake clients — so you can see the
whole system working end to end. Duplicate one, rename the slug, and edit the
copy for a real booking. See README.md for the full walkthrough.
"""
import json, os, datetime, html, re

OUT = os.path.dirname(os.path.abspath(__file__))
TODAY = datetime.date(2026, 8, 27)

CONTACT = dict(name="El Lambert", role="Entertainer, Event Host & Marketing Consultant",
               email="booking@ellambert.com", phone=None)

# Standard terms, reused unless a proposal overrides them.
TERMS_EVENT = [
 ("Reservation", "A signed performance agreement and a non-refundable retainer equal to fifty percent (50%) of the selected option secure the date."),
 ("Final payment", "Balance due on or before the day of the event. Invoicing by ACH, card, or check."),
 ("Production", "Sound is handled by El Lambert unless noted otherwise — PA, mixing, and setup, coordinated with the venue in advance. Song list and run-of-show built with your team."),
 ("Validity", "This proposal is valid for the period shown above and remains subject to availability until an agreement and retainer are received."),
]
TERMS_WEDDING = [
 ("Reservation of services", "A signed performance agreement and a non-refundable retainer equal to fifty percent (50%) of the selected investment are required to secure your date. Dates are reserved first-come, first-served."),
 ("Final payment", "The remaining balance is due no later than thirty (30) days prior to the wedding date. Applicable taxes will be added to the final invoice."),
 ("Travel", "Travel within twenty-five (25) miles of Charlotte city centre is included. Beyond that radius, mileage and travel expenses are calculated per venue and reflected in the final agreement."),
 ("Validity", "This proposal is valid for the period shown above and remains subject to availability until a signed agreement and retainer are received."),
]
TERMS_FUNERAL = [
 ("Reservation", "A signed agreement secures the date. Given the short notice typical of these services, a deposit may be waived at El's discretion and invoiced after the service."),
 ("Payment", "Payment is due within seven (7) days of the service unless otherwise agreed with the funeral home or family in advance."),
 ("Coordination", "El coordinates directly with the funeral director, clergy, or event organizer on song selection, timing, and any technical needs."),
 ("Validity", "This proposal is valid for the period shown above and remains subject to availability."),
]
AGREE = [
 dict(h="1. Engagement", p="El Lambert (“El”) agrees to provide the live music and event services described in the selected option, on the date and at the venue stated in this proposal."),
 dict(h="2. Fees and payment", p="The fee is the amount shown for the selected option. Where a retainer is called for above, it is due on acceptance and secures the date. The balance is due per the terms stated in this proposal."),
 dict(h="3. Cancellation", p="Any retainer paid is non-refundable. Cancellation more than 30 days before the event releases the client from the balance. Cancellation within 30 days requires payment of the full fee. If El cancels for any reason other than force majeure, all monies paid are refunded in full."),
 dict(h="4. Force majeure", p="Neither party is liable for failure to perform due to causes beyond reasonable control, including severe weather, illness, government restriction, or venue closure. The parties will work in good faith to reschedule; any retainer transfers to the rescheduled date."),
 dict(h="5. Venue, access and technical", p="Client ensures a suitable performance area, adequate power, safe load-in access, and a secure area for instruments and personal effects."),
 dict(h="6. Recording, photography and promotion", p="Client may photograph and record the performance for internal and social use with credit to El Lambert. Commercial or broadcast use requires separate written agreement. El may use photography and short-form video of the performance in his own portfolio and marketing unless Client notifies El in writing before the event."),
 dict(h="7. Substitution", p="El performs personally unless prevented by illness or emergency, in which case Client is notified immediately and may elect a full refund or a comparable substitute performer."),
 dict(h="8. Insurance and liability", p="Neither party is liable to the other for indirect or consequential loss."),
 dict(h="9. Governing law", p="This agreement is governed by the laws of the State of North Carolina and constitutes the entire agreement between the parties."),
]
INCL_STD = [
 ("Live performance", "Led by El Lambert on vocals, curated to the room and the occasion."),
 ("Sound &amp; equipment", "Professional PA, microphones, stands and cabling, unless the venue's house system is used instead."),
 ("Song list &amp; curation", "A program built with you before the date. Requests and music of personal significance are welcomed and woven in."),
 ("Travel &amp; setup", "Travel, early arrival, sound check, and complete breakdown."),
]
NEXT_STD = [
 ("01", "Choose a direction", "Select the option that fits, or ask for a call — happy to talk it through."),
 ("02", "Agreement &amp; retainer", "A signed agreement and retainer (where applicable) hold the date and start the work."),
 ("03", "Build the day", "We schedule a planning call and shape the run of show around your final schedule."),
]

def d(*a, **k): return dict(*a, **k)

PROPOSALS = [
# ─────────────────────────────────────────────────────────── DEMO 1: WEDDING
d(slug="demo-wedding-reception-7a1c9e42", code="DEMO2026", pid="demo-wedding-2026",
  valid=21, kicker="Wedding Entertainment Proposal — Demo",
  title="Live Music for<br>Your <em>Wedding Day</em>", sub="Ceremony, cocktail hour, and a night on the floor.",
  prepared="<b>Sample Client</b> (demo — replace with your couple's names)",
  occasion="<b>Saturday, [Month] [Day], 2026</b><br>Ceremony &amp; Reception<br>[Venue Name], Charlotte, NC",
  secTitle="The Experience",
  paras=["A wedding day has a shape: the quiet minutes before the ceremony, the exhale of cocktail hour, and the night that opens up once dinner clears. Each option below covers the full day and changes how much live music carries it.",
         "This is a demo proposal — duplicate this file, give it a new slug, and replace the bracketed details with the real couple, date and venue before sending."],
  pull="Real instruments, real interplay — the kind of sound that makes people lean in.",
  overview=[("Client","Sample Client (demo)"),("Wedding date","[Date to be confirmed]"),("Venue","[Venue Name], Charlotte, NC"),("Coverage","Ceremony, cocktail hour and reception")],
  timeline=[("Ceremony","Curated","Live vocals with song coordination for key moments."),
            ("Cocktail","Solo / Trio","Warm, conversational — R&amp;B and soul standards."),
            ("Reception","Full Band","The floor opens and stays open.")],
  optIntro="Three ways to build the day. Every option includes travel within the Charlotte area, setup and breakdown.",
  tiers=[
   d(id="solo", name="Solo Performer", price=750, meta="Ceremony + cocktail hour",
     desc="El Lambert solo — vocals over curated accompaniment — for the ceremony and cocktail hour.",
     best="Best for an intimate day."),
   d(id="band", name="The El Lambert Band", price=2200, meta="1–7 pieces · full day", recommended=True,
     desc="Ceremony through reception, scaled from a trio to a seven-piece band depending on your room and guest count.",
     best="Best if you want the night to build."),
   d(id="party-band", name="The R&amp;B Party Band", price=3800, meta="7–13 pieces · full day",
     desc="The full R&amp;B Party Band for a reception built to fill the floor and keep it full to close.",
     best="Best for a larger reception that wants a live band all night."),
  ],
  rec="For most receptions, the El Lambert Band is the sweet spot between intimacy and energy.",
  included=INCL_STD,
  nexts=NEXT_STD, terms=TERMS_WEDDING),

# ─────────────────────────────────────────────────────────── DEMO 2: CORPORATE
d(slug="demo-corporate-event-3f68b1d0", code="DEMO2026", pid="demo-corporate-2026",
  valid=21, kicker="Corporate Entertainment Proposal — Demo",
  title="Live Entertainment<br>for Your <em>Company Event</em>", sub="Music and hosting that keeps the room engaged.",
  prepared="<b>Sample Company</b> (demo — replace with your organization)",
  occasion="<b>[Day], [Month] [Date], 2026</b><br>[Start]–[End]<br>[Venue Name], Charlotte, NC",
  secTitle="The Experience",
  paras=["A company party or private event needs music that reads the room — conversational while people are arriving and catching up, and full-energy once the program wraps.",
         "This is a demo proposal — duplicate this file, give it a new slug, and replace the bracketed details before sending to a real client."],
  pull="Music and hosting from the same person — no handoff, no dead air.",
  overview=[("Client","Sample Company (demo)"),("Date","[Date to be confirmed]"),("Venue","[Venue Name], Charlotte, NC"),("Coverage","[X] hours, continuous")],
  timeline=[],
  optIntro="Every option includes event hosting, sound, travel, setup and breakdown.",
  tiers=[
   d(id="host-dj", name="Host + DJ", price=1200, meta="Solo — hosting and curated playlist",
     desc="El Lambert as host and DJ — welcoming remarks, announcements, and a curated soundtrack that reads the room.",
     best="Best for a straightforward office party."),
   d(id="trio", name="Trio + Hosting", price=2400, meta="3 pieces — live music and hosting", recommended=True,
     desc="A three-piece live band plus event hosting — remarks, transitions, and a set list built around your program.",
     best="Best if you want the event to feel like a produced show."),
   d(id="party-band", name="R&amp;B Party Band", price=4200, meta="7–13 pieces — full band",
     desc="The full R&amp;B Party Band for a company event built to be talked about on Monday.",
     best="Best for a milestone event or company celebration."),
  ],
  rec="",
  included=INCL_STD, nexts=NEXT_STD, terms=TERMS_EVENT),

# ─────────────────────────────────────────────────────────── DEMO 3: FUNERAL
d(slug="demo-funeral-service-9c04e7a5", code="DEMO2026", pid="demo-funeral-2026",
  valid=10, kicker="Funeral &amp; Religious Service Proposal — Demo",
  title="Music for a<br><em>Service of Remembrance</em>", sub="Traditional and Contemporary Gospel, R&amp;B and Soul.",
  prepared="<b>Sample Family / Funeral Home</b> (demo — replace with the real name)",
  occasion="<b>[Day], [Month] [Date], 2026</b><br>[Time]<br>[Funeral Home / Church Name], [City], NC",
  secTitle="The Service",
  paras=["Several hundred funerals and religious services and counting. El brings the same care to every one of them — coordinating with the funeral director or clergy in advance so nothing is left to chance on the day.",
         "This is a demo proposal — duplicate this file, give it a new slug, and replace the bracketed details before sending to a real family or funeral home."],
  pull="Music that honors, uplifts, and brings solace to those in need.",
  overview=[("Client","Sample Family / Funeral Home (demo)"),("Date","[Date to be confirmed]"),("Location","[Funeral Home / Church Name]"),("Performance","Vocals — El Lambert, with musical accompaniment")],
  timeline=[],
  optIntro="Choose the option that fits the service. Song selection is coordinated with the family or officiant in advance — see the full list on ellambert.com/funerals-religious-services.",
  tiers=[
   d(id="solo", name="Solo Vocalist", price=350, meta="One musician",
     desc="El Lambert, solo vocals over curated accompaniment, for the service.",
     best="Best for a smaller, intimate service."),
   d(id="accompanied", name="Vocalist + Accompaniment", price=550, meta="Vocals + piano/keys", recommended=True,
     desc="El Lambert with a live accompanist, for a fuller sound across hymns and selections.",
     best="Best for most funeral and memorial services."),
  ],
  rec="",
  included=[("Live performance","Vocals performed by El Lambert, coordinated to the order of service."),
            ("Song selection","Chosen with the family or officiant in advance — from the full song list, or a personal request.")],
  nexts=[("01","Share the details","Date, time, and location, plus any songs that matter to the family."),
         ("02","Confirm &amp; agree","A short agreement confirms the date."),
         ("03","The service","El arrives early, coordinates with the funeral director or clergy, and performs.")],
  terms=TERMS_FUNERAL),
]

# ─────────────────────────────────────────────────────────────── RENDER
TPL = open(os.path.join(OUT, "_template.html")).read()

def render(p):
    exp = (TODAY + datetime.timedelta(days=p["valid"])).isoformat() + "T23:59:00-04:00"
    cfg = dict(id=p["pid"], currency="USD", expires=exp, accessCode=p["code"],
               tiers=[{k: v for k, v in t.items()} for t in p["tiers"]], agreement=AGREE)

    def blk(title, body, num):
        return (f'<section class="pblock"><div class="pblock__inner">'
                f'<p class="pnum"><b>{num}</b> {title}</p>{body}</div></section>')

    overview = '<dl class="povw">' + "".join(
        f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in p["overview"]) + "</dl>"
    tl = ""
    if p.get("timeline"):
        tl = '<div class="ptl">' + "".join(
            f"<div><b>{a}</b><span>{b}</span><small>{c}</small></div>" for a, b, c in p["timeline"]) + "</div>"
    inc = '<div class="pinc">' + "".join(
        f"<div><b>{a}</b><p>{b}</p></div>" for a, b in p["included"]) + "</div>"
    enh = ""
    if p.get("enhancements"):
        enh = ('<p class="pnum" style="margin-top:3rem"><b>+</b> Optional enhancements</p><div class="penh">'
               + "".join(f"<div><span>{a}</span><b>{b}</b></div>" for a, b in p["enhancements"]) + "</div>")
    nxt = '<div class="pnext">' + "".join(
        f"<div><i>{n}</i><b>{t}</b><p>{x}</p></div>" for n, t, x in p["nexts"]) + "</div>"
    terms = '<dl class="povw">' + "".join(
        f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in p["terms"]) + "</dl>"
    paras = "".join(f"<p>{x}</p>" for x in p["paras"])

    body = (
      blk("The Experience",
          f'<h2 class="pheading">{p["secTitle"]}</h2>{paras}'
          f'<p class="ppull">{p["pull"]}</p>{tl}', "01")
      + blk("Event Overview", overview, "02")
    )
    rec = f'<p class="tiers__rec">{p["rec"]}</p>' if p.get("rec") else ""
    opts = (f'<section class="tiers" id="pricing"><div class="tiers__inner">'
            f'<p class="pnum"><b>03</b> The Options</p>'
            f'<h2 class="pheading">Choose your <em>direction</em>.</h2>'
            f'<p class="lede">{p["optIntro"]}</p>'
            f'<div class="tiers__grid" id="tiers-grid"></div>{rec}{enh}'
            f'<p style="margin-top:2rem;font-size:.75rem;color:var(--bone-3);max-width:62ch">'
            f'Select an option to review the agreement and secure the date.</p></div></section>')
    tail = (blk("Included &amp; Next Steps", inc + '<p class="pnum" style="margin-top:3rem"><b>&rarr;</b> Next steps</p>' + nxt, "04")
            + blk("Terms", terms, "05"))

    phone_line = f'<a href="tel:{CONTACT["phone"]}">{CONTACT["phone"]}</a>' if CONTACT.get("phone") else ""
    sign = (f'<section class="pblock"><div class="pblock__inner"><div class="psign">'
            f'<div class="psign__who"><b>{CONTACT["name"]}</b><span>{CONTACT["role"]}</span>'
            f'<a href="mailto:{CONTACT["email"]}">{CONTACT["email"]}</a>'
            f'{phone_line}'
            f'<a href="../index.html">ellambert.com</a></div>'
            f'<div class="psign__valid">Valid for {p["valid"]} days from date of issue.<br>'
            f'El Lambert · Charlotte, North Carolina</div></div></div></section>')

    out = (TPL.replace("{{TITLE}}", html.escape(p["kicker"] + " — " + p["slug"].rsplit("-", 1)[0].replace("-", " ").title()))
              .replace("{{KICKER}}", p["kicker"].upper())
              .replace("{{HEADLINE}}", p["title"])
              .replace("{{SUB}}", p["sub"])
              .replace("{{PREPARED}}", p["prepared"])
              .replace("{{OCCASION}}", p["occasion"])
              .replace("{{BODY}}", body + opts + tail + sign)
              .replace("{{CONFIG}}", json.dumps(cfg, indent=2)))
    path = os.path.join(OUT, p["slug"] + ".html")
    open(path, "w").write(out)
    return p

# ─────────────────────────────────────────────────────────── PRIVATE INDEX
def render_index(rows):
    def money_range(tiers):
        prices = [t["price"] for t in tiers]
        lo, hi = min(prices), max(prices)
        rng = f"${lo:,}" if lo == hi else f"${lo:,} – ${hi:,}"
        return rng, len(tiers)

    trs = ""
    for p in rows:
        rng, n = money_range(p["tiers"])
        exp = (TODAY + datetime.timedelta(days=p["valid"])).strftime("%d %b %Y")
        plain_title = html.escape(re.sub(r"<[^>]+>", "", p["title"].replace("<br>", " ")))
        trs += (f'<tr><td><b>{plain_title}</b>'
                f'<small>{p["kicker"]}</small></td>'
                f'<td><code>{p["code"]}</code></td>'
                f'<td class="r">{rng}<small>{n} option{"s" if n != 1 else ""}</small></td>'
                f'<td class="r">{exp}</td>'
                f'<td><a class="go" href="{p["slug"]}.html" target="_blank">Open &nearr;</a></td></tr>')

    html_out = f'''<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><title>Proposal index — internal</title>
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/style.css"><link rel="stylesheet" href="../assets/proposal.css">
<style>
.wrap{{max-width:1100px;margin:0 auto;padding:clamp(2.5rem,6vw,5rem) var(--pad)}}
table{{width:100%;border-collapse:collapse;margin-top:2.5rem}}
th{{text-align:left;font-size:.5625rem;text-transform:uppercase;letter-spacing:.22em;color:var(--brass);
   font-variation-settings:'wdth' 86,'wght' 700;padding:0 1rem .9rem 0;border-bottom:1px solid var(--line-2)}}
td{{padding:1.1rem 1rem 1.1rem 0;border-bottom:1px solid var(--line);vertical-align:top;font-size:.9375rem}}
td b{{display:block;font-variation-settings:'wdth' 100,'wght' 650}}
td small{{display:block;margin-top:.25rem;font-size:.625rem;text-transform:uppercase;letter-spacing:.16em;color:var(--bone-3)}}
td.r{{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}}
code{{background:var(--ink-3);border:1px solid var(--line-2);padding:.35rem .7rem;color:var(--brass);
  font-family:ui-monospace,Menlo,monospace;font-size:.8125rem;letter-spacing:.08em}}
.go{{color:var(--bone);border-bottom:1px solid var(--line-2);font-size:.8125rem;white-space:nowrap}}
.go:hover{{color:var(--brass);border-color:var(--brass)}}
.warn{{margin-top:3rem;padding:1.25rem 1.5rem;border-left:2px solid var(--brass);
  background:rgba(217,136,58,.08);font-size:.875rem;color:var(--bone-2);line-height:1.7;max-width:70ch}}
</style></head><body>
<div class="grain"></div>
<div class="wrap">
  <p class="pkicker">Internal — not linked from the site</p>
  <h1 class="ptitle">Proposal <em>index</em></h1>
  <p class="psub">Every live proposal, its access code, and its expiry.</p>
  <table>
    <thead><tr><th>Client &amp; occasion</th><th>Access code</th><th class="r">Range</th><th class="r">Expires</th><th></th></tr></thead>
    <tbody>{trs}</tbody>
  </table>
  <p class="warn">This page is unlisted (not linked from the site, blocked by robots.txt) but not password-protected. Do not share this URL — it is a bookmark for you, not a client-facing page.</p>
</div>
</body></html>'''
    path = os.path.join(OUT, "_index-private-el40b2.html")
    open(path, "w").write(html_out)
    return "_index-private-el40b2.html"

if __name__ == "__main__":
    rows = [render(p) for p in PROPOSALS]
    idx = render_index(rows)
    print(f"{len(rows)} proposal(s) rendered\n")
    for p in rows:
        print(f"  {p['code']:<10} exp +{p['valid']}d  /proposals/{p['slug']}.html")
    print(f"\n  Private index → /proposals/{idx}  (bookmark this — it is not linked anywhere)")
