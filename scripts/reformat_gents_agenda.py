#!/usr/bin/env python3
"""One-off: converts the 4 Gent's Agenda posts from prose paragraphs to the
new AGENDA() schedule format, and adds a 5th consolidated full-month post.
Run once, then `python3 build_journal.py` to regenerate."""
import json
from pathlib import Path

P = Path(__file__).resolve().parent.parent
data = json.loads((P / "data" / "journal.json").read_text(encoding="utf-8"))

def agenda(date, name, venue, note="", price="", link=""):
    return "AGENDA::" + "||".join([date, name, venue, note, price, link])

def pq(t): return "PQ::" + t

WEEK1 = [
    "The Gent's Agenda, in its new shape: less write-up, more schedule. What's worth the trip this week, and what it costs to find out.",
    agenda("Tue, Sept 1", "Brandi Carlile: The Human Tour", "Spectrum Center",
           "In support of Returning to Myself. The Head and the Heart opens.", "$82+"),
    "VIDEO::",
    agenda("Fri, Sept 4", "South End First Friday Gallery Crawl", "Historic South End",
           "No cover, no reservation. Galleries and shops stay open past their usual hours.", "Free"),
    agenda("Sat, Sept 5", "Charlotte Soul Fest", "First Ward Park",
           "Live music from early afternoon into the evening.", "Free"),
    agenda("Sun, Sept 6", "Belmont Bookshop Literary Festival", "Stowe Park, Belmont",
           "Authors and independent booksellers, a short drive west of Uptown.", "Free"),
    agenda("Sun, Sept 6", "Around the Crown 10K", "Romare Bearden Park, Uptown",
           "Loops the inner ring starting Sunday morning.", "$32+"),
    agenda("Standing, Wed", "Wednesday Night Live", "Bechtler &#183; Mint &#183; Gantt Center",
           "Free admission at all three, every Wednesday, 5&#8211;9pm. Not a special occasion &#8212; a standing offer.", "Free"),
    pq("Would a man with better things to do still go? Most of what's on the calendar doesn't clear that bar."),
    agenda("Weekdays, 3&#8211;6pm", "Happy hour &#8212; Rosemont", "South End",
           "Half off mussels Monday. Unlimited fries with a bottle of wine.", ""),
    agenda("Weekdays, 2&#8211;6pm", "Happy hour &#8212; Firebirds", "multiple locations",
           "$5&#8211;7 drinks, $6 crispy cauliflower. Neither needs a reservation.", ""),
]

WEEK2 = [
    "Second week, and the calendar gets more crowded than the first. The schedule, sorted.",
    agenda("Sept 8&#8211;13", "Hell's Kitchen", 'Belk Theater &#8212; <a href="charlotte.html#uptown-belk-theater-at-blumenthal-performing-arts">in the guide</a>',
           "First national tour of Alicia Keys' musical. Best nights are already selling out.", "$$$+", ""),
    agenda("Fri, Sept 11", "Mozart's Requiem: 9/11 Memorial Concert", "Knight Theater",
           "Charlotte Symphony, Opera Carolina, and the Master Chorale share one stage. Proceeds fund a scholarship for first responders' children.", "$47+"),
    pq("Not every night out needs to be light."),
    agenda("Sept 11&#8211;13", "Yiasou Greek Festival", "Holy Trinity Greek Orthodox Cathedral",
           "The food alone clears the bar most festivals charge triple to fail at.", "$5+"),
    agenda("Sept 11&#8211;13", "Mecktoberfest, weekend one", "Olde Mecklenburg Brewery, LoSo",
           "Steins, a stein-holding competition, and the correct answer to ‘beer garden or rooftop bar’ this week.", ""),
    agenda("Sat, Sept 12, 10am", "Charlotte Coffee Festival", "Lenny Boy Brewing",
           "Fifty-plus roasters, unlimited tastings.", "$25+"),
    agenda("Sun, Sept 13, 1pm", "Panthers vs. Bears", "Bank of America Stadium",
           "Home opener. Get there hungry.", "$200+"),
    agenda("Weekdays", "Happy hour &#8212; Que Onda", "",
           "$2.50 street tacos Tuesday. Half off tequila and mezcal plus $5 nachos Wednesday.", ""),
    agenda("Mon&#8211;Fri, 4&#8211;7pm", "Happy hour &#8212; CO Sushi", "dine-in",
           "Half off makimono rolls Tuesday and Thursday. $5 martinis Monday.", ""),
]

WEEK3 = [
    "Third week, and the run of amphitheater nights starts in earnest.",
    agenda("Tue, Sept 15", "Bring Your Own Vinyl Night", "Divine Barrel Brewing",
           "Bring something worth playing, or don't bother.", "Free"),
    agenda("Fri, Sept 18, 7:30pm", "Wu-Tang Forever: The Final Chamber", "Truliant Amphitheater",
           "Bone Thugs-n-Harmony opens. Thirty years past the debut album, still selling out amphitheaters.", "$26+"),
    pq("A group thirty years past its debut album still selling out amphitheaters isn't nostalgia. It's just still good."),
    agenda("Sept 18&#8211;20", "Mecktoberfest, weekend two", "Olde Mecklenburg Brewery, LoSo",
           "Second and final weekend. The good beer sold out last week &#8212; go early.", ""),
    agenda("Sat, Sept 19", "Thee Phantom Hip Hop Orchestra", "Knight Theater",
           "A full orchestra playing hip-hop, straight, no gimmick attached.", "$43+"),
    agenda("Sun, Sept 20, 7:30pm", "It's Iconic: TLC &amp; Salt-N-Pepa", "Truliant Amphitheater",
           "En Vogue opens. Three groups that were doing this before most of the bill was born.", "$26+"),
    "IMG::0",
    agenda("Thu, Sept 18, 8:30pm", "Crossroads Cinema: Monsters Inc.", 'Camp North End &#8212; <a href="charlotte.html#west-charlotte-camp-north-end">in the guide</a>',
           "Free outdoor screening on the lot behind the Ford Building. Lawn chair required, full bar from Black Moth.", "Free"),
    agenda("Tue&#8211;Fri, 4&#8211;6pm", "Happy hour &#8212; Catalu", "",
           "50% off tapas.", ""),
    agenda("Weekdays, 3&#8211;8pm", "Happy hour &#8212; Caswells", "",
           "$8 shared plates &#8212; fried pickles, calamari, egg rolls, sliders.", ""),
]

WEEK4 = [
    "Fourth week, and Charlotte spends its last real weekend of September trying to do five things on the same Saturday. Pick two.",
    agenda("Sept 22&#8211;27", "Charlotte Film Festival, 18th year", "Independent Picture House",
           "Narrative features, documentaries, shorts &#8212; most followed by a filmmaker Q&amp;A worth staying for.", ""),
    agenda("Sept 25&#8211;27", "Festival in the Park, 62nd annual", 'Freedom Park &#8212; <a href="charlotte.html#myers-park-freedom-park">in the guide</a>',
           "150-plus artists and craftspeople, food trucks, live performances. Fri 4&#8211;9pm, Sat 10&#8211;9, Sun 10&#8211;5.", "Free"),
    pq("The park itself has been in the guide since it opened. This is the one weekend a year it earns a second look on its own merits."),
    agenda("Sat, Sept 26", "Wine &amp; Food Festival", "Ballantyne's Backyard",
           "Over a hundred wines, beers, and spirits included. A rotating slate of Charlotte chefs cooking through the afternoon.", ""),
    agenda("Sat, Sept 26", "Potters Market at the Mint, 20th year", "Mint Museum Randolph",
           "Fifty-five-plus juried ceramic artists under one tent. A public lecture from the year's juror at 1pm.", "$25"),
    agenda("Sat, Sept 26, evening", "Pillows &amp; Poetry", "Pauline Tea Bar",
           "Open mic, tea, wine, a sound bath closing things out. Smaller than everything else on this list, and better for it.", "$18"),
    agenda("Thu, Sept 25, 8:30pm", "Crossroads Cinema: Talladega Nights", "Camp North End",
           "Free outdoor screening. The correct choice if the rest of the week's options feel like too much effort.", "Free"),
    agenda("Weekdays, 3&#8211;6pm", "Happy hour &#8212; Catalina", "",
           "$2.50 oysters, $11 fries. $10 martinis Monday.", ""),
    agenda("Mon&#8211;Sat, 4&#8211;10pm", "Happy hour &#8212; Eddie V's", 'Uptown &#8212; <a href="charlotte.html#uptown-eddie-v-s">in the guide</a>',
           "Tempura bites and steak tataki, $8&#8211;24. $10 drinks.", ""),
]

WEEKLY_UPDATES = {
    "gents-agenda-sept-1": WEEK1,
    "gents-agenda-sept-8": WEEK2,
    "gents-agenda-sept-15": WEEK3,
    "gents-agenda-sept-22": WEEK4,
}

for post in data:
    if post["slug"] in WEEKLY_UPDATES:
        post["body"] = WEEKLY_UPDATES[post["slug"]]

# ---- New: one consolidated full-month post ----
FULL_MONTH_BODY = [
    "The whole month, one list. Four weeks of The Gent's Agenda, collapsed into a single schedule &#8212; for a man who'd rather scan once than check back four times.",
    agenda("Tue, Sept 1", "Brandi Carlile: The Human Tour", "Spectrum Center", "", "$82+"),
    agenda("Fri, Sept 4", "South End First Friday Gallery Crawl", "Historic South End", "", "Free"),
    agenda("Sat, Sept 5", "Charlotte Soul Fest", "First Ward Park", "", "Free"),
    agenda("Sun, Sept 6", "Belmont Bookshop Literary Festival", "Stowe Park, Belmont", "", "Free"),
    agenda("Sun, Sept 6", "Around the Crown 10K", "Romare Bearden Park, Uptown", "", "$32+"),
    agenda("Sept 8&#8211;13", "Hell's Kitchen", "Belk Theater", "", "$$$+"),
    agenda("Fri, Sept 11", "Mozart's Requiem: 9/11 Memorial Concert", "Knight Theater", "", "$47+"),
    agenda("Sept 11&#8211;13", "Yiasou Greek Festival", "Holy Trinity Greek Orthodox Cathedral", "", "$5+"),
    agenda("Sept 11&#8211;13 &amp; 18&#8211;20", "Mecktoberfest", "Olde Mecklenburg Brewery, LoSo", "Two weekends.", ""),
    agenda("Sat, Sept 12", "Charlotte Coffee Festival", "Lenny Boy Brewing", "", "$25+"),
    agenda("Sun, Sept 13", "Panthers vs. Bears", "Bank of America Stadium", "Home opener.", "$200+"),
    agenda("Fri, Sept 18", "Wu-Tang Forever: The Final Chamber", "Truliant Amphitheater", "", "$26+"),
    agenda("Sat, Sept 19", "Thee Phantom Hip Hop Orchestra", "Knight Theater", "", "$43+"),
    agenda("Sun, Sept 20", "It's Iconic: TLC &amp; Salt-N-Pepa", "Truliant Amphitheater", "", "$26+"),
    agenda("Thu, Sept 18", "Crossroads Cinema: Monsters Inc.", "Camp North End", "Free outdoor screening.", "Free"),
    pq("Not everything on a month like this needs a full night built around it. Some of it is just worth knowing is happening."),
    agenda("Sept 22&#8211;27", "Charlotte Film Festival", "Independent Picture House", "18th year.", ""),
    agenda("Sept 25&#8211;27", "Festival in the Park", "Freedom Park", "62nd annual, 150-plus artists.", "Free"),
    agenda("Sat, Sept 26", "Wine &amp; Food Festival", "Ballantyne's Backyard", "", ""),
    agenda("Sat, Sept 26", "Potters Market at the Mint", "Mint Museum Randolph", "20th year.", "$25"),
    agenda("Sat, Sept 26", "Pillows &amp; Poetry", "Pauline Tea Bar", "", "$18"),
    agenda("Thu, Sept 25", "Crossroads Cinema: Talladega Nights", "Camp North End", "Free outdoor screening.", "Free"),
    agenda("Standing, every Wed", "Wednesday Night Live", "Bechtler &#183; Mint &#183; Gantt Center", "Free 5&#8211;9pm, all year &#8212; not just September.", "Free"),
    "Where to go after any of it: Rosemont, Firebirds, Que Onda, CO Sushi, Catalu, Caswells, Catalina, and Eddie V's all run a weekday happy hour worth building a habit around &#8212; the full breakdown is in each week's own entry below.",
]

FULL_MONTH_POST = {
    "slug": "gents-agenda-september-full-month",
    "cat": "charlotte",
    "catlabel": "Charlotte",
    "vol": "24",
    "read": "4 min read",
    "title": "The Gent's Agenda: All of September, One List",
    "stand": "Four weeks of the city's calendar, collapsed into a single schedule. Everything that made the cut, nothing that didn't, one scan instead of four.",
    "featured": False,
    "wide": False,
    "hero": {"img": "press-freedom-park", "ext": "jpg", "mode": "cover", "srcset": True,
              "alt": "Freedom Park, host of Festival in the Park"},
    "body": FULL_MONTH_BODY,
}

# Insert after the 4 weekly posts (keep reading order sensible)
insert_at = max(i for i, p in enumerate(data) if p["slug"] in WEEKLY_UPDATES) + 1
data.insert(insert_at, FULL_MONTH_POST)

(P / "data" / "journal.json").write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Updated 4 weekly posts, added full-month post. Total posts: {len(data)}")
