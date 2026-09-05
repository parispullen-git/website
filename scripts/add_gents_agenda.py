#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""One-off script: appends the four launch entries of "The Gent's Agenda"
(weekly Charlotte events column, cat="charlotte") to data/journal.json,
and un-features karma-automotive in favor of featuring the first Agenda
entry (the series launch). Run once, then `python3 build_journal.py`.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JPATH = ROOT / "data" / "journal.json"

posts = json.loads(JPATH.read_text(encoding="utf-8"))

# Un-feature the current lead -- the launch of a recurring column is the
# bigger story this week.
for p in posts:
    if p["slug"] == "karma-automotive":
        p["featured"] = False

WEEK1 = {
    "slug": "gents-agenda-sept-1",
    "cat": "charlotte",
    "catlabel": "Charlotte",
    "vol": "20",
    "read": "5 min read",
    "title": "The Gent's Agenda: September 1–7",
    "stand": "A new standing feature. Four things on Charlotte's calendar this week that survive one honest question, and a note on where to land afterward.",
    "featured": True,
    "wide": False,
    "hero": {
        "img": "press-brandi-carlile",
        "ext": "jpg",
        "mode": "cover",
        "srcset": True,
        "alt": "Brandi Carlile at a 2023 red carpet event, ahead of her 2026 Human Tour stop in Charlotte"
    },
    "body": [
        "This is the first installment of a new standing feature. Once a week, an accounting of what is actually worth an evening or a Saturday afternoon in this city — not everything happening, just the handful that survive being asked one honest question: would a man with better things to do still go? Most of what crosses the local event calendars doesn't clear that bar. This is the part that does.",
        "Brandi Carlile brings The Human Tour to Spectrum Center tonight, September 1, in support of her album Returning to Myself, with The Head and the Heart opening. Tickets started around $82 and were still moving as of this writing — not a small booking, and not one chasing nostalgia to fill the room.",
        "VIDEO::",
        "Friday puts South End back on its monthly rotation with the First Friday Gallery Crawl — galleries and a handful of shops along the corridor stay open past their usual hours, no cover, no reservation. It rewards showing up with no particular plan more than most nights in that neighborhood do.",
        "PQ::Would a man with better things to do still go? Most of what's on the calendar doesn't clear that bar.",
        "Saturday, First Ward Park hosts Charlotte Soul Fest, a free day of live music running from early afternoon into the evening — the kind of thing better attended for an hour than skipped entirely because the whole day felt like too much commitment.",
        "Sunday, Belmont's Stowe Park runs the Belmont Bookshop Literary Festival, a free outdoor gathering of authors and independent booksellers a short drive west of Uptown. Worth the trip if a Sunday afternoon needs somewhere to go that isn't a patio.",
        "Also worth knowing, and not worth a full entry of its own: the Around the Crown 10K loops Uptown's inner ring Sunday morning starting from Romare Bearden Park, and the city's three flagship museums — the Bechtler, the Mint, and the Gantt Center — run free admission every Wednesday from 5 to 9pm. That last one is a standing offer, not a special occasion. Worth building into a routine.",
        "Where to go after: Rosemont runs a weekday happy hour from 3 to 6pm — half off mussels on Mondays, unlimited fries with a bottle of wine. Firebirds keeps its bar menu to $5–7 drinks and $6 crispy cauliflower most weekday afternoons, 2 to 6pm. Neither needs a reservation. Both are better spent an hour in than skipped."
    ],
    "video": {
        "youtube_id": "pmeK6vq0A5s",
        "title": "Brandi Carlile — Human (Official Video)"
    }
}

WEEK2 = {
    "slug": "gents-agenda-sept-8",
    "cat": "charlotte",
    "catlabel": "Charlotte",
    "vol": "21",
    "read": "5 min read",
    "title": "The Gent's Agenda: September 8–14",
    "stand": "A Broadway import, a 9/11 memorial concert, a Greek festival and a beer garden — the week the calendar stops being one thing and starts being several at once.",
    "featured": False,
    "wide": False,
    "hero": {
        "img": "press-holy-trinity-cathedral",
        "ext": "jpg",
        "mode": "cover",
        "srcset": True,
        "alt": "Holy Trinity Greek Orthodox Cathedral in Charlotte, host of the annual Yiasou Greek Festival"
    },
    "body": [
        "Second week, and the calendar gets more crowded than the first. Worth knowing which crowd to actually join.",
        "Alicia Keys' Hell's Kitchen lands at the Belk Theater September 8 through 13, on the first national tour of a musical that's been selling out its best nights early. Official tickets start in the high double digits and climb fast from there. The Belk itself is <a href=\"charlotte.html#uptown-belk-theater-at-blumenthal-performing-arts\">already in the guide</a>, and this is the kind of booking that reminds you why.",
        "Friday the 11th marks the 25th anniversary of September 11, and Knight Theater is marking it properly — the Charlotte Symphony, Opera Carolina, and the Charlotte Master Chorale sharing one stage for Mozart's Requiem, with a portion of ticket sales going to a scholarship fund for the children of the city's first responders. Not every night out needs to be light.",
        "PQ::Not every night out needs to be light.",
        "The same weekend, Holy Trinity Greek Orthodox Cathedral runs its Yiasou Greek Festival Friday through Sunday — five dollars at the door, and the food alone clears the bar most festivals charge triple to fail at.",
        "Olde Mecklenburg Brewery opens the first of its two Mecktoberfest weekends at the LoSo location, also Friday through Sunday — steins, a proper stein-holding competition, and the correct answer to 'beer garden or rooftop bar' this particular week.",
        "Saturday morning, before any of that, Lenny Boy Brewing hosts the Charlotte Coffee Festival — fifty-plus roasters, unlimited tastings, and a legitimate reason to be somewhere at 10am on a Saturday instead of still in bed.",
        "Sunday closes the week the way football weekends should. The Panthers host the Bears at Bank of America Stadium for the home opener, kickoff at 1pm. Get there hungry.",
        "Where to go after: Que Onda runs $2.50 street tacos on Tuesdays and drops to half off tequila and mezcal on Wednesdays, alongside $5 nachos. CO Sushi's dine-in happy hour runs 4 to 7pm Monday through Friday — half off makimono rolls Tuesdays and Thursdays, five-dollar martinis on Mondays."
    ]
}

WEEK3 = {
    "slug": "gents-agenda-sept-15",
    "cat": "charlotte",
    "catlabel": "Charlotte",
    "vol": "22",
    "read": "5 min read",
    "title": "The Gent's Agenda: September 15–21",
    "stand": "Two amphitheater nights, a beer garden's last weekend, and a hip-hop orchestra nobody's calling a novelty twice.",
    "featured": False,
    "wide": False,
    "hero": {
        "img": "press-wu-tang",
        "ext": "jpg",
        "mode": "cover",
        "srcset": True,
        "alt": "Wu-Tang Clan performing live at a 2023 festival date"
    },
    "body": [
        "Third week, and the run of amphitheater nights starts in earnest.",
        "Tuesday, Divine Barrel Brewing turns its taproom over to whoever shows up with a record under their arm for Bring Your Own Vinyl Night. Bring something worth playing, or don't bother.",
        "Friday, Wu-Tang Clan brings Wu-Tang Forever: The Final Chamber to Truliant Amphitheater with Bone Thugs-n-Harmony opening, 7:30pm. A group thirty years past its debut album still selling out amphitheaters isn't nostalgia. It's just still good.",
        "PQ::A group thirty years past its debut album still selling out amphitheaters isn't nostalgia. It's just still good.",
        "OMB's LoSo location runs its second and final Mecktoberfest weekend, Friday through Sunday. The beer selection has had a week to sell out, so go early if there's a specific one worth chasing.",
        "Saturday, Knight Theater hosts Thee Phantom Hip Hop Orchestra — a full orchestra playing hip-hop, straight, no gimmick attached. Sounds like a bit until the first sixteen bars land under a string section and the room realizes it isn't one.",
        "Sunday, Truliant closes the week with It's Iconic — TLC and Salt-N-Pepa co-headlining, En Vogue opening, 7:30pm. Three groups that were doing this before most of the amphitheater's other bookings were born, and still the tightest show most of them will see all month.",
        "IMG::0",
        "Thursday the 18th, Camp North End's free Crossroads Cinema series runs Monsters Inc. on the lot behind the Ford Building, 8:30pm. Lawn chair required, a full bar from Black Moth running the whole night, and it's a fixture <a href=\"charlotte.html#west-charlotte-camp-north-end\">already in the guide</a> for good reason.",
        "Where to go after: Catalu runs 50% off tapas Tuesday through Friday, 4 to 6pm. Caswells keeps a weekday shared-plates menu at eight dollars a plate from 3 to 8pm — fried pickles, calamari, egg rolls, sliders — without needing to commit to a full dinner."
    ],
    "images": [
        {
            "img": "press-tlc",
            "ext": "jpg",
            "mode": "cover",
            "srcset": True,
            "layout": "full",
            "caption": "TLC, part of the It's Iconic bill with Salt-N-Pepa and En Vogue at Truliant Amphitheater.",
            "alt": "TLC performing at the 2019 Macy's Thanksgiving Day Parade"
        }
    ]
}

WEEK4 = {
    "slug": "gents-agenda-sept-22",
    "cat": "charlotte",
    "catlabel": "Charlotte",
    "vol": "23",
    "read": "5 min read",
    "title": "The Gent's Agenda: September 22–30",
    "stand": "The month's biggest weekend arrives all at once — a film festival, a 62-year-old arts fixture, and more Saturday than one Saturday should reasonably hold.",
    "featured": False,
    "wide": False,
    "hero": {
        "img": "press-freedom-park",
        "ext": "jpg",
        "mode": "cover",
        "srcset": True,
        "alt": "The entrance to Freedom Park in Charlotte, host of the annual Festival in the Park"
    },
    "body": [
        "Fourth week, and Charlotte spends its last real weekend of September trying to do five things on the same Saturday. Pick two.",
        "The Charlotte Film Festival runs its 18th year September 22 through 27 at the Independent Picture House — narrative features, documentaries, shorts, most of them followed by a filmmaker Q&A worth staying for.",
        "Freedom Park runs its 62nd annual Festival in the Park September 25 through 27 — free admission, 150-plus artists and craftspeople, food trucks, and live performances across three days. Friday runs 4 to 9pm, Saturday 10 to 9, Sunday 10 to 5. The park itself has been <a href=\"charlotte.html#myers-park-freedom-park\">in the guide</a> since it opened. This is the one weekend a year it earns a second look on its own merits.",
        "PQ::The park itself has been in the guide since it opened. This is the one weekend a year it earns a second look on its own merits.",
        "The same Saturday, Ballantyne's Backyard runs the Wine & Food Festival — over a hundred wines, beers, and spirits included in the ticket, plus a rotating slate of Charlotte chefs cooking through the afternoon.",
        "Also that Saturday, the Mint Museum Randolph marks the 20th year of Potters Market at the Mint — more than fifty-five juried ceramic artists under one tent, twenty-five dollars at the door, and a public lecture from the year's juror at 1pm worth building a schedule around.",
        "Saturday evening, Pauline Tea Bar runs Pillows & Poetry — open mic, tea, wine, and a sound bath closing things out, eighteen dollars at the door. Smaller than everything else on this list, and better for it.",
        "Thursday the 25th, Camp North End's Crossroads Cinema runs Talladega Nights on the lot — free, 8:30pm, and the correct choice if the rest of the week's options feel like too much effort.",
        "Where to go after: Catalina's weekday happy hour runs 3 to 6pm — $2.50 oysters, eleven-dollar fries, ten-dollar martinis on Mondays. Eddie V's, <a href=\"charlotte.html#uptown-eddie-v-s\">already a fixture in the guide</a>, runs its own from 4 to 10pm Monday through Saturday — tempura bites and steak tataki in the $8–24 range, ten-dollar drinks. Either one closes a long Saturday better than driving straight home."
    ]
}

new_posts = [WEEK1, WEEK2, WEEK3, WEEK4]
existing_slugs = {p["slug"] for p in posts}
for p in new_posts:
    if p["slug"] in existing_slugs:
        raise SystemExit(f"slug already exists: {p['slug']}")

posts.extend(new_posts)
JPATH.write_text(json.dumps(posts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"appended {len(new_posts)} posts; total now {len(posts)}")
