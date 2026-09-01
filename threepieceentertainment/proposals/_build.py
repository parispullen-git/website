#!/usr/bin/env python3
"""
Three Piece Entertainment — proposal generator.

Edit PROPOSALS below, run `python3 _build.py`, and each entry renders to its own
unlisted HTML page. Format mirrors the 3PE deck language (cover → numbered
sections → options → included → next steps → sign-off) with the interactive
layer on top: live expiry countdown, clickable pricing, agreement gate,
payment hand-off, and exit-intent recovery.
"""
import json, os, datetime, html

OUT = os.path.dirname(os.path.abspath(__file__))
TODAY = datetime.date(2026, 8, 18)

CONTACT = dict(name="Harvey Cummings II", role="Founder & Creative Director",
               email="harvey@threepieceent.com", phone="(704) 618-4634")

# Standard terms, reused unless a proposal overrides them.
TERMS_EVENT = [
 ("Reservation", "A signed performance agreement and a non-refundable retainer equal to fifty percent (50%) of the selected option secure the date."),
 ("Final payment", "Balance due on or before the day of the event. Invoicing by ACH, card, or check."),
 ("Production", "Sound is ours to handle unless noted otherwise — PA, mixing, monitors, and an engineer on site, coordinated with the venue in advance. Repertoire and run-of-show built with your team."),
 ("Validity", "This proposal is valid for the period shown above and remains subject to availability until an agreement and retainer are received."),
]
TERMS_WEDDING = [
 ("Reservation of services", "A signed performance agreement and a non-refundable retainer equal to fifty percent (50%) of the selected investment are required to secure your date. Because we accept a limited number of weddings each year, dates are reserved first-come, first-served."),
 ("Final payment", "The remaining balance is due no later than thirty (30) days prior to the wedding date. Applicable taxes will be added to the final invoice."),
 ("Travel", "Travel within twenty-five (25) miles of Charlotte city centre is included. Beyond that radius, mileage and travel expenses are calculated per venue and reflected in the final agreement."),
 ("Validity", "This proposal is valid for the period shown above and remains subject to availability until a signed agreement and retainer are received."),
]
AGREE = [
 dict(h="1. Engagement", p="Three Piece Entertainment LLC (“3PE”) agrees to provide the live music and production services described in the selected option, on the date and at the venue stated in this proposal."),
 dict(h="2. Fees and payment", p="The fee is the amount shown for the selected option. A non-refundable retainer of 50% is due on acceptance and secures the date. The balance is due per the terms stated in this proposal. The date is not held until the retainer clears."),
 dict(h="3. Cancellation", p="The retainer is non-refundable. Cancellation more than 60 days before the event releases the client from the balance. Cancellation within 60 days requires payment of the full fee. If 3PE cancels for any reason other than force majeure, all monies paid are refunded in full."),
 dict(h="4. Force majeure", p="Neither party is liable for failure to perform due to causes beyond reasonable control, including severe weather, illness, government restriction, or venue closure. The parties will work in good faith to reschedule; the retainer transfers to the rescheduled date."),
 dict(h="5. Venue, access and technical", p="Client ensures a suitable performance area, adequate power, safe load-in access, and a secure area for instruments and personal effects. Where the selected option relies on house or vendor sound, Client ensures that system is functional and an operator is available for sound check."),
 dict(h="6. Hospitality", p="For engagements over three hours, Client provides a private area for performers and one meal per performer. Parking is provided or reimbursed for all performers and crew."),
 dict(h="7. Recording, photography and promotion", p="Client may photograph and record the performance for internal and social use with credit to Three Piece Entertainment. Commercial or broadcast use requires separate written agreement. 3PE may use photography and short-form video of the performance in its own portfolio and marketing unless Client notifies 3PE in writing before the event."),
 dict(h="8. Substitution", p="3PE may substitute personnel of comparable calibre where necessary. Harvey Cummings II performs personally unless prevented by illness or emergency, in which case Client is notified immediately and may elect a full refund."),
 dict(h="9. Insurance and liability", p="3PE carries general liability insurance and will provide a certificate naming Client and the venue as additional insured on request. W-9 available for procurement. Neither party is liable to the other for indirect or consequential loss."),
 dict(h="10. Governing law", p="This agreement is governed by the laws of the State of North Carolina and constitutes the entire agreement between the parties."),
]
INCL_STD = [
 ("Live performance", "Led from the saxophone by Harvey Cummings II, performed through the room rather than from a fixed stage."),
 ("Sound &amp; equipment", "Professional PA, microphones, stands and cabling, provided and operated by 3PE unless noted otherwise."),
 ("Repertoire &amp; curation", "A programme built with you before the date. Requests and music of personal significance are welcomed and woven in."),
 ("Programme coordination", "Advance review of your run of show so featured moments and transitions land where you want them."),
 ("Travel &amp; setup", "Travel, early arrival, sound check, complete breakdown, and attire appropriate to the formality of the occasion."),
]
NEXT_STD = [
 ("01", "Choose a direction", "Select the option that fits, or ask for a call — happy to talk it through."),
 ("02", "Agreement &amp; retainer", "A signed agreement and 50% retainer hold the date and start the work."),
 ("03", "Build the night", "We schedule the planning session and shape the run of show around your final schedule."),
]

def d(*a, **k): return dict(*a, **k)

PROPOSALS = [
# ─────────────────────────────────────────────────────────── 01 URBAN LEAGUE
d(slug="urbanleague-wmy-gala-4b71e9c2", code="WHITNEY18", pid="urbanleague-wmy-2026",
  valid=14, kicker="Entertainment Proposal",
  title="An Orchestral<br><em>Celebration</em>", sub="Written for this night. Conducted live.",
  prepared="<b>Urban League of Central Carolinas</b><br>Attn: Rhonda Caldwell · Main Event Corporate and Social Events<br>Presented by Karen Poole, Vocalist",
  occasion="<b>Whitney M. Young, Jr. Awards Gala</b><br>Opening Performance · Friday, September 18, 2026<br>The Westin Charlotte · 601 South College Street",
  secTitle="The Song That Opens the Room",
  paras=["A gala opens once. Whatever happens in the first four minutes sets the register for everything that follows — the remarks, the awards, the room's willingness to feel something. “Home” is the right song for that job, and Karen Poole is the right voice for it.",
         "What this proposal adds is the orchestra behind her — not a backing track, and not a rented ensemble reading a stock chart. The arrangement is written for this night by Harvey Cummings II and conducted live, scored for players chosen to carry this particular song in this particular room."],
  pull="The difference between a performance slot and a moment the room remembers.",
  overview=[("Client","Urban League of Central Carolinas"),("Occasion","Whitney M. Young, Jr. Awards Gala — opening performance"),("Date","Friday, September 18, 2026"),("Venue","The Westin Charlotte, 601 South College Street"),("Vocalist","Karen Poole"),("Performance","Custom orchestral arrangement of “Home,” conducted live by Harvey Cummings II")],
  timeline=[], optIntro="Placement within the program is yours to set. We build the run of show around it once the date is confirmed.",
  tiers=[
   d(id="chamber", name="Chamber Ensemble", price=6800, meta="8 pieces · strings, winds, brass foundation",
     desc="A lean, warm orchestral voice — close strings and a small horn section sitting just behind the vocal. Full custom arrangement and live conducting at a scale that reads as elegant rather than enormous.",
     best="Best if you want the moment to feel refined and intimate."),
   d(id="lush", name="Lush Ensemble", price=10000, meta="12 pieces · full strings, expanded winds &amp; brass", recommended=False,
     desc="The string section fills out and the horns gain weight, which is where this arrangement starts to bloom. Noticeably more air behind Karen through the build, with real dynamic range from the opening line to the last chord.",
     best="Best if you want the room to feel the lift when the orchestra enters."),
   d(id="grand", name="Grand Orchestra", price=13500, meta="18 pieces · full symphonic sound with percussion", recommended=True,
     desc="Full symphonic scale. Complete string complement, full brass and winds, percussion under the climax — the sound of a production, not a performance slot. Includes dedicated soundcheck and full technical coordination with the venue.",
     best="Best if you want the opening to be the thing people talk about afterward."),
  ],
  rec="For a room of this size and an evening of this weight, the Grand Orchestra is the one we would point you toward.",
  included=[("Custom arrangement","Written and orchestrated by Harvey Cummings II for these players."),
            ("Live conducting","Harvey leads the ensemble on the night — downbeat to final chord."),
            ("Professional musicians","Contracted from Charlotte's working orchestral and string-collective players."),
            ("One full rehearsal","A complete call with Karen and the ensemble ahead of the event."),
            ("Sound &amp; AV liaison","We coordinate directly with the Westin on inputs, monitors, and soundcheck."),
            ("Music preparation","All parts engraved and printed. Stands and materials handled on our end.")],
  nexts=[("01","Confirm the date","Reply to hold Friday, September 18 and confirm where in the program the performance sits."),
         ("02","Agreement &amp; deposit","A signed agreement and 50% deposit holds the date and starts the arrangement. Balance due seven days prior."),
         ("03","Build the moment","We set the rehearsal, coordinate with the Westin, and place the performance in your run of show.")],
  terms=TERMS_EVENT),

# ─────────────────────────────────────────────────────────── 02 NAAIA
d(slug="naaia-welcome-reception-8c3f21a7", code="GANTT0922", pid="naaia-2026",
  valid=30, kicker="Corporate Entertainment Proposal",
  title="An Evening Worth<br><em>Traveling For</em>", sub="Live music for the NAAIA Welcome Reception.",
  prepared="<b>National African American Insurance Association</b><br>2026 NAAIA National Conference — welcome reception",
  occasion="<b>Tuesday, September 22, 2026</b><br>5:00 – 8:00 PM · three hours, continuous<br>Harvey B. Gantt Center for African-American Arts + Culture",
  secTitle="An Evening Worth Traveling For",
  paras=["Fourteen hundred people will fly into Charlotte for this conference. Most of the week will happen inside a convention center. This night will not.",
         "The Gantt Center is one of the most meaningful rooms in the city — a building dedicated to African-American arts and culture, holding a reception for the largest gathering of Black insurance professionals in the country. That deserves more than a playlist through house speakers.",
         "What we propose is an evening that moves. It opens with a live band — saxophone, keys, and bass — playing jazz standards and soul selections while guests arrive, find each other, and settle into the galleries. When the program closes, Harvey Cummings II moves to the decks and the night turns: he DJs the back half himself, horn still in hand, playing live over his own set."],
  pull="Same musician, same ear, no handoff to a stranger with a laptop.",
  overview=[("Client","National African American Insurance Association"),("Occasion","2026 NAAIA National Conference — welcome reception"),("Attendance","1,400+ expected across the conference"),("Date","Tuesday, September 22, 2026"),("Time","5:00 – 8:00 PM (three hours, continuous)"),("Venue","Harvey B. Gantt Center, Charlotte, NC"),("Sound","Professional PA, mixing and an engineer on site — provided and run by us")],
  timeline=[("5:00","Reception","Live band as guests arrive and move through the galleries."),
            ("6:30","The turn","Program closes; Harvey moves to the decks."),
            ("8:00","Close","Live sax over his own DJ set through to the finish.")],
  optIntro="The night has two halves, and they call for different things. Every figure below includes travel, setup, breakdown, and advance programming with your team.",
  tiers=[
   d(id="trio-dj", name="Trio + DJ Set", price=2500, meta="Standards trio · then DJ with live sax",
     desc="Saxophone, keys and bass playing jazz standards and soul selections through the reception — elegant and conversation-friendly — then Harvey on the decks and the horn at the same time for the back half.",
     best="Best if the reception should stay conversational before it lifts."),
   d(id="quartet-dj", name="Quartet + DJ Set", price=3300, meta="Trio plus drums · then DJ with live sax",
     desc="The same repertoire with a rhythm section underneath it — fuller in a large room, and the right choice if the reception runs warm rather than quiet — closing with the DJ set and live saxophone.",
     best="Best if you expect the room to run warm from the start."),
   d(id="trio-band", name="Trio + DJ with Band", price=3500, meta="Reception trio · live band across the DJ set", recommended=True,
     desc="The rhythm section returns and plays live across the DJ set — horn, keys and bass over the tracks. This is the configuration that turns a reception into a night people talk about.",
     best="Best if you want the energy to climb rather than reset."),
   d(id="quartet-band", name="Quartet + DJ with Full Band", price=4700, meta="Quartet reception · full band over the DJ set",
     desc="The largest configuration on offer: quartet through the reception, then the full rhythm section live across the DJ set with drums carrying the back half of the night.",
     best="Best if this is the night the conference is meant to remember."),
  ],
  rec="Any combination can be assembled — including the DJ set alone, or live band for the full three hours. Sound, production and Charlotte-area travel are included in every figure.",
  included=INCL_STD + [("The Leadership Awards Gala","We are also available Thursday, September 24 and would welcome the chance to carry the same sound through the marquee night. Booking both lets us program them as a pair.")],
  nexts=[("01","Confirm the configuration","Reply with the option that fits and we will hold September 22."),
         ("02","Agreement &amp; retainer","We prepare the performance agreement and issue the retainer invoice."),
         ("03","Build the evening","We begin programming the arc of the night with your team.")],
  terms=TERMS_EVENT),

# ─────────────────────────────────────────────────────────── 03 MEMA
d(slug="mema-50th-anniversary-d92a4f18", code="MEMA1950", pid="mema-50th-2026",
  valid=14, kicker="Entertainment Proposal",
  title="Fifty Years<br>of <em>Service</em>", sub="An evening of live music, curated for the occasion.",
  prepared="<b>Mid-Atlantic Emergency Medical Associates, PLLC</b><br>Attn: Monique James, Executive Assistant",
  occasion="<b>50th Anniversary Celebration</b><br>Thursday, September 10, 2026 · 6:00 – 10:00 PM<br>VanLandingham Estate, Charlotte",
  secTitle="The Shape of the Night",
  paras=["Fifty years is a rare thing. A room full of people who built something together that long deserves an evening that feels like a celebration rather than background music — something guests talk about on the drive home.",
         "A six-to-ten evening has a natural arc to it. The first stretch belongs to arrival, drinks, and conversation as people find each other. The middle settles into dinner and remarks. The back half is where the night opens up. Every option covers the full four hours; what changes is how much live music shapes that arc."],
  pull="Timing is illustrative. We build the final run of show around your schedule once a direction is chosen.",
  overview=[("Client","Mid-Atlantic Emergency Medical Associates, PLLC"),("Occasion","50th Anniversary Celebration"),("Date","Thursday, September 10, 2026"),("Time","6:00 – 10:00 PM"),("Venue","VanLandingham Estate, Charlotte"),("Coverage","Full four hours on every option")],
  timeline=[("6:00","Arrival","Warm, unhurried. Music at conversation level."),
            ("7:00","Dinner","Softer textures. Wireless mics ready for remarks."),
            ("8:15","The toast","A feature moment built around the anniversary."),
            ("9:00","Celebration","The floor opens. Energy through to close.")],
  optIntro="Three directions, each covering the full evening.",
  tiers=[
   d(id="dj", name="Signature DJ", price=1500, meta="Four hours · fully curated",
     desc="Four hours of fully curated DJ programming, built around the range you described — pop, R&amp;B, rock, house, and the records that will mean something to the people who were there at the beginning. The room gets read in real time and the programming moves with it.",
     best="Best if you want a clean, high-energy evening with a single point of contact."),
   d(id="dj-sax", name="DJ &amp; Live Saxophone", price=2400, meta="Four hours · DJ with live horn throughout",
     desc="Everything in the first option, with live saxophone woven through the night. Horn moves through the room over the tracks during arrival and dinner, then steps out front for the feature moments — the toast, the anniversary announcement, whatever your key moments turn out to be.",
     best="Best if you want the night to feel like an event, not a party with a DJ."),
   d(id="trio-dj", name="Live Trio &amp; DJ", price=3600, meta="Live trio through dinner · DJ to close", recommended=True,
     desc="A live three-piece ensemble — saxophone, keys and bass — playing through arrival and dinner. Real instruments, real interplay, the kind of sound that makes people lean in and talk to each other. As the night turns toward celebration we transition seamlessly into the DJ set and carry the energy through to close.",
     best="Best if you want the anniversary to feel unmistakably significant."),
  ],
  rec="For a fiftieth, the Live Trio &amp; DJ is the one we would point you toward.",
  included=[("Professional sound","Full audio for the space, tuned to the room and handled end to end."),
            ("Setup &amp; breakdown","Load-in, sound check, and complete breakdown. We arrive early and leave the space as we found it."),
            ("Wireless microphones","Available all evening for remarks, toasts, and the anniversary announcement."),
            ("Music planning session","A working conversation beforehand — songs that matter to the practice, requests, and anything to avoid.")],
  nexts=[("01","Choose a direction","Reply with the option that fits, or ask for a call — happy to talk it through."),
         ("02","Agreement &amp; deposit","A signed agreement and 50% deposit hold September 10. Balance due the day of the event. We'll work with whatever invoicing process the practice needs."),
         ("03","Build the night","We schedule the planning session and shape the run of show around your final schedule.")],
  terms=TERMS_EVENT),

# ─────────────────────────────────────────────────────────── 04 ROACH 50TH
d(slug="roach-50th-anniversary-6e18b4d3", code="BALLANTYNE50", pid="roach-50th-2026",
  valid=30, kicker="Anniversary Entertainment Proposal",
  title="Fifty Years,<br>One <em>Horn</em>", sub="A real saxophone in the room, for an hour that matters.",
  prepared="<b>Dominique Roach</b><br>on behalf of the honorees",
  occasion="<b>50th Wedding Anniversary Celebration</b><br>Saturday, October 31, 2026 · 6:00 – 7:00 PM<br>The Ballantyne Hotel — the Atrium, Charlotte",
  secTitle="The Moment",
  paras=["Fifty years is not a party. It is a room full of people who have watched two people keep a promise, and the music in that room should say so without interrupting anyone.",
         "The Atrium at Ballantyne is a beautiful space for a live horn — open, warm, and separate enough from the ballroom that the sound belongs entirely to your guests as they arrive. For the hour before dinner I perform throughout the room rather than from a fixed stage, so the music moves with your parents and their guests instead of sitting in a corner.",
         "You mentioned the Atrium sits apart from the Main Ballroom where the DJ will be set up. That is good news for the music, and it does mean the Atrium needs its own sound. You do not need to solve that — I bring a self-contained professional system sized for the space, set it up and break it down myself, and it is included below at no additional charge."],
  pull="High energy, easy to talk over, impossible to ignore.",
  overview=[("Client","Dominique Roach, on behalf of the honorees"),("Occasion","50th Wedding Anniversary Celebration"),("Date","Saturday, October 31, 2026"),("Venue","The Ballantyne Hotel — the Atrium, Charlotte"),("Coverage","Cocktail hour, 6:00 – 7:00 PM"),("Guests","Up to 250"),("Performance","Solo saxophone — Harvey Cummings II"),("Sound","Self-contained professional system, provided and operated by 3PE")],
  timeline=[],
  optIntro="The cocktail hour is what you asked for, and this proposal is written that way. The second option is here only if the family later wants the horn to carry past 7:00 PM.",
  tiers=[
   d(id="hour", name="Cocktail Hour", price=750, meta="60 minutes · solo saxophone", recommended=True,
     desc="Sixty minutes of continuous live saxophone in the Atrium, 6:00–7:00 PM, performed throughout the room. Sound, travel, setup, breakdown and repertoire curation all included. There are no additional fees.",
     best="This is the proposal as you described it."),
   d(id="hour-plus", name="Cocktail Hour + Reception", price=1100, meta="60 minutes · plus 45 minutes over the DJ",
     desc="Everything above, plus an additional forty-five minutes of live saxophone over the DJ once the reception opens. Can be arranged any time up to two weeks before the date — no decision needed now.",
     best="Best if the family wants the horn to carry into the night."),
  ],
  rec="What you told me about your parents is exactly what I needed. A first dance to “Lady in Red” at the twenty-fifth tells me the temperature of the room — Sade sits beautifully on saxophone, and so do Stevie Wonder and John Legend.",
  included=[("Live performance","Sixty minutes of continuous saxophone, performed throughout the Atrium rather than from a fixed stage."),
            ("Sound &amp; PA","A self-contained professional system sized for the Atrium, brought and operated by us. All we need is a standard power outlet."),
            ("Repertoire curation","Smooth contemporary, R&amp;B and soul, and instrumental readings of the songs your mother already loves."),
            ("Their songs","Closer to the date we settle on two or three songs with real history behind them. “Lady in Red” will be one of them unless you tell me otherwise."),
            ("Travel &amp; setup","Travel within the Charlotte area, setup and breakdown — no AV order, no coordination on your end.")],
  nexts=[("01","Say the word","Confirm the option and I'll send the performance agreement."),
         ("02","Retainer","A retainer invoice for fifty percent holds October 31 on the calendar. The balance is due on the day."),
         ("03","Shape the music","Once the date is secured we start choosing the songs together.")],
  terms=TERMS_EVENT),

# ─────────────────────────────────────────────────────────── 05 SCOTT MEASELL
d(slug="measell-wedding-a37c95e1", code="ANGUSBARN27", pid="measell-2027",
  valid=30, kicker="Wedding Entertainment Proposal",
  title="Live Saxophone<br>for the <em>Measell Wedding</em>", sub="A horn over your DJ — the part nobody has to be told is the good part.",
  prepared="<b>Scott Measell</b>", occasion="<b>Friday, May 28, 2027</b><br>Ceremony approximately 5:30 PM<br>The Pavilion at the Angus Barn · Raleigh, North Carolina",
  secTitle="The Experience",
  paras=["A DJ fills a room. A live horn over that DJ changes what the room is. The track your guests already know starts playing, and then a saxophone rises up out of it — improvising over the groove, answering the vocal line, pushing the energy right when the floor is ready for it. Heads turn. Phones come out.",
         "This proposal covers live solo saxophone performed by Harvey Cummings II, playing alongside your DJ across cocktail hour and into the reception. I plug directly into your DJ's system, coordinate the set and key choices with him in advance, and move through the room rather than perform from a fixed position."],
  pull="That's the format you described on Instagram — and it happens to be my favorite thing to do.",
  overview=[("Client","Scott Measell"),("Wedding date","Friday, May 28, 2027"),("Venue","The Pavilion at the Angus Barn — Raleigh, North Carolina"),("Ceremony","Approximately 5:30 PM (time to be confirmed)"),("Coverage","Cocktail hour and reception — see options"),("Sound","PA provided by your DJ — direct input, coordinated in advance")],
  timeline=[],
  optIntro="Three ways to build it, so you can decide how far into the night the horn plays. Each option is complete on its own. Travel to Raleigh is included at no additional charge.",
  tiers=[
   d(id="cocktail", name="Cocktail Hour", price=750, meta="60 minutes",
     desc="Sixty minutes of continuous live saxophone over your DJ's set as guests move from the ceremony into the celebration.",
     best="Best if you want one strong moment rather than a thread through the night."),
   d(id="cocktail-reception", name="Cocktail Hour + Reception Set", price=1100, meta="105 minutes", recommended=True,
     desc="Everything in the first option, plus a forty-five minute set once the reception opens — timed with your DJ to land on first dances and the opening of the floor.",
     best="Recommended for your timeline."),
   d(id="full", name="The Full Evening", price=1400, meta="120 minutes",
     desc="Cocktail hour plus a full hour across the reception, with the flexibility to split the reception time into two appearances as the night builds.",
     best="Best if you want the horn present as the energy climbs."),
  ],
  rec="Performance time may be arranged in continuous or split sets at your planner's direction.",
  included=[("Live performance","Solo saxophone performed live over your DJ's set, moving through the room rather than from a fixed stage."),
            ("DJ coordination","Advance coordination with your DJ on set list, keys, input needs and cue timing, so nothing is negotiated on site."),
            ("Repertoire &amp; curation","Contemporary R&amp;B and soul, jazz, and instrumental takes on the songs your guests came to hear."),
            ("Travel &amp; setup","Travel to Raleigh included, early arrival, sound check with your DJ, and attire appropriate to the day.")],
  nexts=NEXT_STD, terms=TERMS_WEDDING),

# ─────────────────────────────────────────────────────────── 06 MELONIE DAVIS
d(slug="davis-wedding-c81f7d40", code="LUMEN0626", pid="davis-2027",
  valid=30, kicker="Wedding Entertainment Proposal",
  title="Live Saxophone<br>for <em>Melonie's Day</em>", sub="Two moments, shaped around the arc of the day.",
  prepared="<b>Melonie Davis</b>", occasion="<b>Saturday, June 26, 2027</b><br>The Lumen House · Cleveland, North Carolina",
  secTitle="The Experience",
  paras=["Two moments in a wedding day carry more than people expect: the stretch before the ceremony when guests are arriving and finding their seats, and the hour afterwards when everyone exhales at once. Live saxophone does something specific in both.",
         "Each service below may be reserved individually or together. Travel to Cleveland, North Carolina is included at no additional charge."],
  pull="The music moves with your guests rather than sitting in a corner.",
  overview=[("Client","Melonie Davis"),("Wedding date","Saturday, June 26, 2027"),("Venue","The Lumen House — Cleveland, North Carolina"),("Performance","Solo saxophone — Harvey Cummings II"),("Travel","Included at no additional charge")],
  timeline=[],
  optIntro="Reserve either service on its own, or both together.",
  tiers=[
   d(id="prelude", name="Pre-Ceremony Prelude", price=450, meta="30 minutes",
     desc="Thirty minutes of live solo saxophone beginning as your guests arrive and continuing through seating, setting an unhurried, elevated tone before the ceremony opens.",
     best="Best if you want the day to begin with intention."),
   d(id="cocktail", name="Cocktail Hour", price=750, meta="60 minutes",
     desc="A full hour of continuous live saxophone, performed throughout the room rather than from a fixed stage — the music moves with your guests as they mingle.",
     best="Best if you want one continuous hour of live music."),
   d(id="both", name="Prelude + Cocktail Hour", price=1200, meta="90 minutes · both services", recommended=True,
     desc="Both services together — the prelude before the ceremony and the full cocktail hour afterwards, with repertoire built to carry across the two so the day feels of a piece.",
     best="Best if you want live music bookending the ceremony."),
  ],
  rec="",
  included=[("Pre-ceremony prelude","Thirty minutes of live solo saxophone as guests arrive and are seated."),
            ("Cocktail hour","A full hour of continuous live saxophone throughout the room."),
            ("Repertoire &amp; curation","Contemporary jazz, R&amp;B and soul, and instrumental arrangements of familiar contemporary songs. Special requests and moments of personal significance are welcomed and woven in."),
            ("Vendor coordination","Advance coordination with your DJ and entertainment vendor on sound, input needs and timing, so transitions on the day are seamless."),
            ("Travel &amp; setup","Travel to the venue, arrival ahead of guest doors, soundcheck with your vendor, and professional attire appropriate to the formality of your day.")],
  nexts=NEXT_STD, terms=TERMS_WEDDING),

# ─────────────────────────────────────────────────────────── 07 CAITLYN & MALEEK
d(slug="caitlyn-maleek-wedding-72d4e9b6", code="BEAUMONDE27", pid="caitlyn-maleek-2027",
  valid=30, kicker="Wedding Entertainment Proposal",
  title="Caitlyn<br>&amp; <em>Maleek</em>", sub="Ceremony, cocktail hour, and a jazz band for the reception.",
  prepared="<b>Caitlyn &amp; Maleek</b>", occasion="<b>Saturday, February 27, 2027</b><br>The Parlor at Beau Monde<br>1837 N Tryon St, Charlotte, NC 28206",
  secTitle="The Experience",
  paras=["A full-day build: a curated ceremony with song coordination for the key moments, a DJ-and-saxophone cocktail hour, and a live jazz ensemble led from the horn through the reception.",
         "Both options below cover the whole day — ceremony, cocktail hour, reception and sound production. What changes is the size of the band that carries the reception."],
  pull="Two options, both complete. The difference is how much band is behind you when the floor opens.",
  overview=[("Couple","Caitlyn &amp; Maleek"),("Wedding date","Saturday, February 27, 2027"),("City","Charlotte, North Carolina"),("Venue","The Parlor at Beau Monde"),("Address","1837 N Tryon St, Charlotte, NC 28206"),("Coverage","Ceremony, cocktail hour and reception")],
  timeline=[("Ceremony","Curated","Custom playlist with song coordination. Coverage begins 30 minutes prior."),
            ("Cocktail","DJ + Sax","Up to 90 minutes of curated soundtrack with live saxophone throughout."),
            ("Reception","Live jazz","Two 40-minute sets with a 10-minute interlude, in a 90-minute block.")],
  optIntro="Both experiences include ceremony, cocktail hour, reception and full sound production.",
  tiers=[
   d(id="exp1", name="Entertainment Experience 1", price=6000, meta="Five-piece jazz ensemble", recommended=True,
     desc="Reception carried by a five-piece ensemble led by Harvey Cummings II on saxophone, featuring trumpet, keys, bass and drums. Two 40-minute sets with a 10-minute interlude within a 90-minute performance block.",
     best="Best if you want a full horn section behind the reception."),
   d(id="exp2", name="Entertainment Experience 2", price=5750, meta="Four-piece jazz ensemble",
     desc="The same day, with the reception carried by a four-piece ensemble led by Harvey Cummings II on saxophone, featuring keys, bass and drums. Two 40-minute live sets with a 10-minute interlude within a 90-minute block.",
     best="Best if you want the same shape at a slightly tighter scale."),
  ],
  rec="",
  included=[("Ceremony","Custom ceremony playlist with song coordination for key moments. Coverage begins 30 minutes prior to ceremony start."),
            ("Cocktail hour","A DJ + Sax experience — up to 90 minutes of curated soundtrack with live saxophone by Harvey Cummings II throughout the set."),
            ("Reception","Live jazz ensemble led from the saxophone, two 40-minute sets with a 10-minute interlude inside a 90-minute block."),
            ("Sound production","Professional sound system, sound technician, setup and breakdown, and two wireless microphones.")],
  nexts=[("01","Choose your experience","Let us know which option best aligns with your vision for the day."),
         ("02","Agreement &amp; retainer","We prepare your agreement, collect the retainer, and reserve your date."),
         ("03","Build the day","We shape the ceremony moments, cocktail set and reception programme with you.")],
  terms=TERMS_WEDDING),

# ─────────────────────────────────────────────────────────── 08 YELLOW TEA ROSE
d(slug="yellow-tea-rose-brunch-15a8c73f", code="PEARLS1025", pid="yellowtearose-2026",
  valid=30, kicker="Jazz Brunch Entertainment Proposal",
  title="Live Jazz for<br><em>Pearls for a Purpose</em>", sub="A programme shaped around yours, not a musician in the corner.",
  prepared="<b>Nicole Leftwich</b><br>Yellow Tea Rose Foundation of NC",
  occasion="<b>Sunday, October 25, 2026 · 2:30 PM</b><br>Rooster's SouthPark<br>6601 Carnegie Boulevard, Charlotte, NC 28211",
  secTitle="The Experience",
  paras=["A brunch asks two things of the music at once. For most of the afternoon it has to hold the room warm enough that people keep talking, keep eating, keep giving. And then, three or four times across the program, it has to stop them — a horn line that pulls every head up from the table right before you introduce a scholar or make the ask.",
         "Live jazz does both, but only if it is built that way from the beginning. I build the afternoon in two arcs — an opening set as guests arrive and settle, and a second set that carries the room through and out of your program — with featured moments placed exactly where your run of show needs them."],
  pull="Standards a room of women in pearls will recognise before the second bar.",
  overview=[("Client","Yellow Tea Rose Foundation of NC"),("Contact","Nicole Leftwich"),("Occasion","Pearls for a Purpose — jazz brunch"),("Date","Sunday, October 25, 2026 · 2:30 PM"),("Venue","Rooster's SouthPark, 6601 Carnegie Boulevard"),("Performance","Two 45-minute sets with three featured moments against your run of show"),("Sound","Professional PA provided and operated by 3PE — no house system required")],
  timeline=[],
  optIntro="Every option covers ninety minutes across two sets. Travel within the Charlotte metro, setup, breakdown and sound are included — there are no travel, equipment or additional fees.",
  tiers=[
   d(id="solo", name="Solo Saxophone", price=1050, meta="One musician · two 45-min sets",
     desc="Live saxophone over curated accompaniment, running continuously across both sets so the room is never silent. The most intimate of the three and the gentlest on a budget already carrying catering.",
     best="Best if the afternoon should stay close and conversational."),
   d(id="trio", name="Trio", price=1600, meta="Three musicians · two 45-min sets",
     desc="Saxophone, keys and upright bass. Real interplay behind the horn, which is what makes a featured moment land as a performance rather than a louder passage of background music.",
     best="Best if you want the featured moments to carry."),
   d(id="quartet", name="Quartet", price=2100, meta="Four musicians · two 45-min sets", recommended=True,
     desc="Saxophone, keys, upright bass and drums — a full rhythm section behind the horn. This is the option that turns your featured moments into performances the room stops for, and it carries a larger space without leaning on the PA to do it.",
     best="Best if you want the room to stop when you need it to."),
  ],
  rec="Set lengths may be rearranged into three shorter sets at your run-of-show director's request at no change in cost.",
  included=[("Live performance","Ninety minutes of live jazz across two sets, led from saxophone by Harvey Cummings II, with three featured performance moments placed against your run of show."),
            ("Sound &amp; equipment","Professional PA, microphones, stands and all cabling provided and operated by 3PE. No house system is required. We coordinate placement and power directly with Rooster's in advance."),
            ("Repertoire &amp; curation","A programme built with you before the date — jazz standards, soul, and instrumental takes on familiar songs. Requests and any music tied to your honorees are welcomed and woven in."),
            ("Programme coordination","Advance review of your run of show so the featured moments, the ask, and the transitions land where you want them."),
            ("Travel &amp; setup","Travel from Charlotte, early arrival, sound check and complete breakdown.")],
  nexts=NEXT_STD, terms=TERMS_EVENT),

# ─────────────────────────────────────────────────────────── 09 WATTS CHAPEL
d(slug="watts-chapel-evening-in-white-93b2e6a4", code="WHITE0911", pid="wattschapel-2026",
  valid=30, kicker="Entertainment Proposal",
  title="An Evening<br>in <em>White</em>", sub="Live jazz across three hours, shaped to the arc of the evening.",
  prepared="<b>Watts Chapel Missionary Baptist Church</b><br>Raleigh, North Carolina · Attn: Tyla, Entertainment Chair",
  occasion="<b>Friday, September 11, 2026</b><br>An all-white affair<br>Raleigh, North Carolina",
  secTitle="The Experience",
  paras=["An all-white affair sets a visual register before anyone plays a note. The music has to meet it — considered, warm, and unmistakably live.",
         "Every option below covers three hours shaped to the arc of the evening: light and conversational through arrival and cocktails, warmer and fuller through dinner, and open through the closing set. What changes is the size of the ensemble carrying it."],
  pull="The option that makes the night feel like an occasion rather than a beautiful dinner that happens to have music in it.",
  overview=[("Client","Watts Chapel Missionary Baptist Church"),("Contact","Tyla, Entertainment Chair"),("Occasion","An Evening in White"),("Date","Friday, September 11, 2026"),("Location","Raleigh, North Carolina"),("Coverage","Three hours across arrival, dinner and the closing set")],
  timeline=[],
  optIntro="Three ensembles, the same three hours. Travel from Charlotte is included with no additional mileage or lodging charges.",
  tiers=[
   d(id="solo", name="Solo Saxophone", price=1200, meta="One musician · saxophone with curated accompaniment",
     desc="Live saxophone over arranged accompaniment, with curated music running continuously between sets so the room is never silent. The most intimate of the three, and the gentlest on a budget already carrying catering and décor.",
     best="Best suited to gatherings under 75."),
   d(id="trio", name="The Standards Trio", price=1800, meta="Three musicians · saxophone, piano, upright bass",
     desc="The same three hours and the same repertoire, carried by a smaller group. Without drums the sound sits lower and closer in the room, which is frequently the better choice for a seated dinner where guests are talking across the table rather than dancing.",
     best="Best suited to 75 – 150 guests."),
   d(id="quartet", name="The Signature Quartet", price=2500, meta="Four musicians · saxophone, piano, upright bass, drums", recommended=True,
     desc="The full ensemble, across three hours shaped to the arc of the evening — light and conversational through arrival and cocktails, warmer and fuller through dinner, and open through the closing set.",
     best="Best suited to 150 guests and above."),
  ],
  rec="",
  enhancements=[("Additional performance hour","+ $400"),("Trumpet or featured vocalist","+ $450"),("Full sound production, provided by Three Piece","+ $600")],
  included=[("Travel","Travel from Charlotte, with no additional mileage or lodging charges."),
            ("Setup &amp; breakdown","Complete setup, sound check and breakdown, handled by our team."),
            ("Curated programme","A programme curated in advance with your committee, including any selections meaningful to the church."),
            ("Attire","Attire in keeping with the evening.")],
  nexts=NEXT_STD, terms=TERMS_EVENT),

# ─────────────────────────────────────────────────────────── 10 BGBD
d(slug="blk-girl-blk-dress-finale-2fa96c58", code="BGBD0830", pid="bgbd-2026",
  valid=30, kicker="Entertainment Partnership Proposal",
  title="BLK Girl<br>BLK Dress <em>Finale</em>", sub="More than a dinner — an experience centred on Black women feeling celebrated in the room.",
  prepared="<b>BLK Girl BLK Dress Dinner Party</b><br>The Finale",
  occasion="<b>Sunday, August 30, 2026 · 6:00 – 10:00 PM</b><br>Griffith Hall at Lenny Boy Brewery<br>Charlotte, North Carolina",
  secTitle="The Partnership",
  paras=["The BLK Girl BLK Dress Dinner Party is more than a dinner. It is an experience centred on Black women feeling celebrated in the room. Because music shapes so much of that energy, this is written as a partnership rather than a booking.",
         "The four hours have a shape: arrival and welcome, dinner and programme, and a back half where the room opens up. Each option below covers the full window and changes how much live music carries it."],
  pull="Music shapes the energy. This is written as a partnership, not a booking.",
  overview=[("Client","BLK Girl BLK Dress"),("Occasion","The Finale — dinner party"),("Date","Sunday, August 30, 2026"),("Time","6:00 – 10:00 PM"),("Venue","Griffith Hall at Lenny Boy Brewery, Charlotte")],
  timeline=[("6:00","Arrival","Live music as guests arrive and settle."),
            ("7:15","Dinner","Softer textures, mics ready for the programme."),
            ("8:30","The turn","The room opens up and the energy climbs."),
            ("10:00","Close","Carried through to the finish.")],
  optIntro="Three ways to carry the evening. Every figure includes sound, travel, setup and breakdown.",
  tiers=[
   d(id="dj-sax", name="DJ &amp; Live Saxophone", price=1800, meta="Four hours · DJ with live horn throughout",
     desc="Curated DJ programming across the full window with live saxophone woven through it — horn moving through the room during arrival and dinner, then out front as the night turns.",
     best="Best if you want energy with a single point of contact."),
   d(id="trio", name="Live Trio &amp; DJ", price=2900, meta="Live trio through dinner · DJ to close", recommended=True,
     desc="A live three-piece — saxophone, keys and bass — through arrival and dinner, transitioning into the DJ set as the room opens up and carrying the energy through to close.",
     best="Best if you want the room to feel hosted, not soundtracked."),
   d(id="band", name="Full Band &amp; DJ", price=4200, meta="Five-piece band · DJ to close",
     desc="The full ensemble with horns, keys, bass and drums across the live portion of the evening, then into the DJ set for the back half with the band available to play live over it.",
     best="Best if the finale should be the one people talk about."),
  ],
  rec="",
  included=INCL_STD, nexts=NEXT_STD, terms=TERMS_EVENT),

# ─────────────────────────────────────────────────────────── 11 CITY OF MONROE
d(slug="city-of-monroe-programming-e504a1d9", code="MONROE2026", pid="monroe-2026",
  valid=30, kicker="Cultural Programming Proposal",
  title="A Season for<br><em>Monroe</em>", sub="Recurring cultural programming, designed and produced end to end.",
  prepared="<b>The City of Monroe</b><br>Monroe, North Carolina",
  occasion="<b>Cultural Programming Partnership</b><br>Proposed season · 2026 – 2027<br>Monroe, North Carolina",
  secTitle="Why This, Why Here",
  paras=["Three Piece Entertainment was founded on a simple belief: music and culture have the power to strengthen communities, create meaningful experiences, and bring people together across generations.",
         "A single event brings people out once. A season gives a city something to plan around — a recurring reason to come downtown, a programme that builds its own audience, and a body of work that belongs to Monroe rather than to whoever was available that weekend.",
         "Each tier below is a full season: programming design, talent, production, and reporting. What changes is the number of events and the scale of the marquee dates."],
  pull="A recurring reason to come downtown, and a programme that builds its own audience.",
  overview=[("Client","The City of Monroe"),("Occasion","Cultural programming partnership"),("Term","One season, renewable"),("Scope","Programming design, talent, production, community engagement and reporting"),("Region","Monroe and Union County, North Carolina")],
  timeline=[],
  optIntro="Three season scales. Each is quoted as a full programme rather than per event, and each includes design, talent, production and end-of-season reporting.",
  tiers=[
   d(id="foundation", name="Foundation Season", price=62000, meta="Core series · four to six events",
     desc="A designed series across the season with a consistent identity, built to establish the programme and its audience. Includes talent, production, and community engagement around each date.",
     best="Best if the goal this year is to prove the concept."),
   d(id="signature", name="Signature Season", price=143000, meta="Expanded series · marquee dates included", recommended=True,
     desc="The core series expanded, with two marquee dates scaled up for larger audiences and a broader curatorial range across genres and partners. Includes co-branded content and audience reporting through the season.",
     best="Best if you want the programme to become part of the city's calendar."),
   d(id="flagship", name="Flagship Season", price=225000, meta="Full-year programme · festival scale",
     desc="A full-year cultural programme at festival scale, with headline talent, multi-day marquee events, year-round community engagement, and a documented body of work the city owns.",
     best="Best if Monroe intends to be known for this."),
  ],
  rec="Detailed line-item budgets are provided on request, and any tier can be scoped to a specific council appropriation.",
  included=[("Programming design","A curated season with a consistent identity, built around Monroe's audiences and calendar."),
            ("Talent &amp; curation","Artist selection and booking, curated by a working national-calibre artist rather than a booking agency."),
            ("Full production","Sound, staging, musical direction and run-of-show — one contract covers talent, production and coordination."),
            ("Community engagement","Workshops, school touchpoints and partnerships built around the season's dates."),
            ("Reporting","Attendance, engagement and outcome reporting at the close of the season."),
            ("Procurement ready","Fully insured. W-9 and certificate of insurance available for procurement.")],
  nexts=[("01","A conversation","A short call to align the season against council priorities and calendar."),
         ("02","Scoped agreement","We prepare a line-item budget and agreement scoped to the appropriation."),
         ("03","Build the season","Programming design begins and dates go on the city calendar.")],
  terms=TERMS_EVENT),

# ─────────────────────────────────────────────────────────── 12 MARE BELK
d(slug="belk-proposal-performance-b6027fc3", code="BELK0919", pid="belk-2026",
  valid=14, kicker="Performance Proposal",
  title="The <em>Question</em>", sub="Live saxophone for a marriage proposal.",
  prepared="<b>Mare Belk</b>", occasion="<b>Saturday, September 19, 2026</b><br>Time, duration and location to be confirmed<br>Charlotte, North Carolina",
  secTitle="The Moment",
  paras=["A proposal has exactly one take. Live saxophone is the difference between a moment that happens and a moment that is staged — the music starts, she turns, and everything after that is the story you both tell for the rest of your lives.",
         "This is written simply because it should be. One musician, the right song, and a plan agreed in advance so nothing has to be improvised on the day."],
  pull="One take. The music starts, she turns, and everything after that is the story.",
  overview=[("Client","Mare Belk"),("Occasion","Marriage proposal — live saxophone performance"),("Date","Saturday, September 19, 2026"),("Time","To be confirmed"),("Duration","To be confirmed"),("Location","To be confirmed")],
  timeline=[],
  optIntro="Written as a single option. If the plan grows — a longer set, or a second location — we can price that separately.",
  tiers=[
   d(id="performance", name="Live Saxophone Performance", price=500, meta="Solo saxophone · one moment", recommended=True,
     desc="Solo saxophone performed live by Harvey Cummings II at the moment you choose. Song selected with you in advance, arrival and positioning planned so the performance begins exactly when it should.",
     best="This is the proposal as discussed."),
  ],
  rec="",
  included=[("Live performance","Solo saxophone performed by Harvey Cummings II at the agreed moment."),
            ("Song selection","Chosen with you in advance and rehearsed for the arrangement you want."),
            ("Planning","Timing, positioning and cue agreed beforehand so nothing is improvised on the day."),
            ("Travel","Travel within the Charlotte area included.")],
  nexts=[("01","Confirm the details","Lock the time, duration and location."),
         ("02","Agreement &amp; deposit","A 50% deposit is due on signing; an invoice is sent with the agreement."),
         ("03","Set the moment","We agree the song, the cue and the positioning.")],
  terms=[("Payment","50% deposit is due upon signing this agreement; an invoice is sent with the agreement. The remaining 50% is due upon arrival."),
         ("Details","Time, duration and location to be confirmed and reflected in the final agreement."),
         ("Validity","This proposal is valid for the period shown above and remains subject to availability.")]),
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

    sign = (f'<section class="pblock"><div class="pblock__inner"><div class="psign">'
            f'<div class="psign__who"><b>{CONTACT["name"]}</b><span>{CONTACT["role"]}</span>'
            f'<a href="mailto:{CONTACT["email"]}">{CONTACT["email"]}</a>'
            f'<a href="tel:+17046184634">{CONTACT["phone"]}</a>'
            f'<a href="../index.html">threepieceent.com</a></div>'
            f'<div class="psign__valid">Valid for {p["valid"]} days from date of issue.<br>'
            f'Three Piece Entertainment LLC · Charlotte, North Carolina</div></div></div></section>')

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
    return p["slug"], p["code"], exp[:10]

if __name__ == "__main__":
    rows = [render(p) for p in PROPOSALS]
    print(f"{len(rows)} proposals rendered\n")
    for s, c, e in rows:
        print(f"  {c:<14} exp {e}  /proposals/{s}.html")
