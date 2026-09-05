#!/usr/bin/env python3
"""One-off: adds "September's Watch List 2026" to the Journal."""
import json
from pathlib import Path

P = Path(__file__).resolve().parent.parent
data = json.loads((P / "data" / "journal.json").read_text(encoding="utf-8"))

def pq(t): return "PQ::" + t

def item(title, meta, watch, body):
    return (f'<strong>{title}</strong> <span style="color:var(--graphite);font-size:.85em">'
            f'&#8212; {meta} &#8212; <a href="{watch}" target="_blank" rel="noopener">watch the trailer</a></span><br>'
            f'{body}')

BODY = [
    "Summer's over, the Living Floor screen has opinions about it, and the month ahead is stacked enough that a shortlist is doing you a favor. Two Guy Ritchie properties come back in the same three weeks, a brewery dynasty gets the Steven Knight treatment, and a horror franchise starts over with a director who's earned the trust. Here's what's actually worth the remote.",
    item("The Gentlemen &#8212; Season 2", "Netflix, Sept 3",
         "https://youtu.be/01IeKpHvgvM",
         "Theo James and Kaya Scodelario are a year further into the family business, which means the problems have gotten bigger along with the ambition. This is the show already living on the Living Floor screen for good reason &#8212; the tone hasn't softened and a third season is already locked, so there's no reason to wait on this one."),
    "IMG::0",
    item("The Death of Robin Hood", "In theaters",
         "https://youtu.be/tlSDDuWxO_0",
         "Hugh Jackman playing the legend as someone actually worn down by the life, opposite Jodie Comer and Bill Skarsgård as Little John, is a more interesting proposition than another men-in-tights retread. The pitch is a harder, more honest version of a story everyone thinks they already know."),
    item("Oasis: Don't Look Back in Anger", "UK cinemas this month, Disney+ after",
         "https://youtu.be/X9sIYLtgc_s",
         "The Gallagher brothers in the same room, on camera, for the first joint interview in over two decades &#8212; that alone is the whole pitch. Whatever's actually in the documentary is almost beside the point next to the fact that it exists at all."),
    pq("Two Guy Ritchie properties in the same three weeks is either a coincidence or a statement. Either way, clear the calendar."),
    item("MobLand &#8212; Season 2", "Paramount+, Sept 18",
         "https://youtu.be/VvYl1a1Px5Y",
         "Tom Hardy, Pierce Brosnan, and Helen Mirren picking the fight back up, released weekly instead of dumped all at once &#8212; a rare bit of patience from a streamer, and the right call for a show built on slow-building dread rather than binge momentum."),
    item("House of Guinness", "Netflix &#8212; catch up before the next one",
         "https://youtu.be/2mH396WCN0U",
         "If last year's release window buried this one under everything else Netflix put out, September is the correction. Steven Knight's take on the family behind the brewery, four siblings and one inheritance nobody agrees on &#8212; it's the kind of prestige-drama scheming that rewards a proper sit-down, not background viewing."),
    "IMG::1",
    item("The Damned United", "A rewatch worth making room for",
         "https://youtu.be/LYzsswqPk6s",
         "Michael Sheen's Brian Clough during the infamous 44 days at Leeds United is one of the better performances of ego and self-sabotage put on film, football fan or not. Peter Morgan wrote it, which tells you the dialogue is doing as much work as the football."),
    item("Resident Evil", "UK cinemas, Sept 18",
         "https://youtu.be/mNd1gb19A-c",
         "Zach Cregger built his reputation on knowing exactly how long to hold a shot before something goes wrong, which makes him a genuinely interesting choice for this. It's a new story rather than a retread of the games, which is either a risk or the only way this was ever going to work."),
    "Pull up a chair, pour something worth pouring, and work through it in whatever order the week allows.",
]

new_post = {
    "slug": "watchlist-september-2026",
    "cat": "film",
    "catlabel": "Film",
    "vol": "25",
    "read": "6 min read",
    "title": "September's Watch List 2026",
    "stand": "Two Guy Ritchie properties, a brewery dynasty, a reunion two decades in the making, and a horror reboot from someone who's earned the trust. What's actually worth the remote this month.",
    "featured": True,
    "wide": False,
    "hero": {"img": "press-watchlist-sept", "ext": "jpg", "mode": "cover", "srcset": True,
              "alt": "A tailored trio on a balcony overlooking a country estate, a tiger in the foreground"},
    "images": [
        {"img": "press-gentlemen-s2", "ext": "jpg", "mode": "cover", "srcset": True, "layout": "full",
         "caption": "The Gentlemen, Season 2 — Netflix, September 3."},
        {"img": "press-damned-united", "ext": "jpg", "mode": "cover", "srcset": True, "layout": "full",
         "caption": "Michael Sheen as Brian Clough in The Damned United."},
    ],
    "body": BODY,
}

# un-feature whatever currently holds the featured slot
for p in data:
    if p.get("featured"):
        p["featured"] = False

data.append(new_post)
(P / "data" / "journal.json").write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
print("Added watchlist-september-2026. Total posts:", len(data))
