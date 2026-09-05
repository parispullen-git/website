#!/usr/bin/env python3
"""One-off: embeds a real trailer under every title in the Watch List post,
instead of a plain text link."""
import json
from pathlib import Path

P = Path(__file__).resolve().parent.parent
data = json.loads((P / "data" / "journal.json").read_text(encoding="utf-8"))

def pq(t): return "PQ::" + t
def video(i): return "VIDEO::" + str(i)

def item(title, meta, body):
    return f'<strong>{title}</strong> <span style="color:var(--graphite);font-size:.85em">&#8212; {meta}</span><br>{body}'

VIDEOS = [
    {"youtube_id": "01IeKpHvgvM", "title": "The Gentlemen — Season 2 (Official Trailer)"},
    {"youtube_id": "tlSDDuWxO_0", "title": "The Death of Robin Hood (Official Trailer)"},
    {"youtube_id": "X9sIYLtgc_s", "title": "Oasis: Don't Look Back in Anger (Official Trailer)"},
    {"youtube_id": "VvYl1a1Px5Y", "title": "MobLand — Season 2 (Official Trailer)"},
    {"youtube_id": "2mH396WCN0U", "title": "House of Guinness (Official Trailer)"},
    {"youtube_id": "LYzsswqPk6s", "title": "The Damned United (Official Trailer)"},
    {"youtube_id": "mNd1gb19A-c", "title": "Resident Evil (Official Trailer)"},
]

BODY = [
    "Summer's over, the Living Floor screen has opinions about it, and the month ahead is stacked enough that a shortlist is doing you a favor. Two Guy Ritchie properties come back in the same three weeks, a brewery dynasty gets the Steven Knight treatment, and a horror franchise starts over with a director who's earned the trust. Here's what's actually worth the remote.",

    item("The Gentlemen &#8212; Season 2", "Netflix, Sept 3",
         "Theo James and Kaya Scodelario are a year further into the family business, which means the problems have gotten bigger along with the ambition. This is the show already living on the Living Floor screen for good reason &#8212; the tone hasn't softened and a third season is already locked, so there's no reason to wait on this one."),
    video(0),
    "IMG::0",

    item("The Death of Robin Hood", "In theaters",
         "Hugh Jackman playing the legend as someone actually worn down by the life, opposite Jodie Comer and Bill Skarsgård as Little John, is a more interesting proposition than another men-in-tights retread. The pitch is a harder, more honest version of a story everyone thinks they already know."),
    video(1),

    item("Oasis: Don't Look Back in Anger", "UK cinemas this month, Disney+ after",
         "The Gallagher brothers in the same room, on camera, for the first joint interview in over two decades &#8212; that alone is the whole pitch. Whatever's actually in the documentary is almost beside the point next to the fact that it exists at all."),
    video(2),

    pq("Two Guy Ritchie properties in the same three weeks is either a coincidence or a statement. Either way, clear the calendar."),

    item("MobLand &#8212; Season 2", "Paramount+, Sept 18",
         "Tom Hardy, Pierce Brosnan, and Helen Mirren picking the fight back up, released weekly instead of dumped all at once &#8212; a rare bit of patience from a streamer, and the right call for a show built on slow-building dread rather than binge momentum."),
    video(3),

    item("House of Guinness", "Netflix &#8212; catch up before the next one",
         "If last year's release window buried this one under everything else Netflix put out, September is the correction. Steven Knight's take on the family behind the brewery, four siblings and one inheritance nobody agrees on &#8212; it's the kind of prestige-drama scheming that rewards a proper sit-down, not background viewing."),
    video(4),
    "IMG::1",

    item("The Damned United", "A rewatch worth making room for",
         "Michael Sheen's Brian Clough during the infamous 44 days at Leeds United is one of the better performances of ego and self-sabotage put on film, football fan or not. Peter Morgan wrote it, which tells you the dialogue is doing as much work as the football."),
    video(5),

    item("Resident Evil", "UK cinemas, Sept 18",
         "Zach Cregger built his reputation on knowing exactly how long to hold a shot before something goes wrong, which makes him a genuinely interesting choice for this. It's a new story rather than a retread of the games, which is either a risk or the only way this was ever going to work."),
    video(6),

    "Pull up a chair, pour something worth pouring, and work through it in whatever order the week allows.",
]

for p in data:
    if p["slug"] == "watchlist-september-2026":
        p["videos"] = VIDEOS
        p.pop("video", None)
        p["body"] = BODY
        break
else:
    raise SystemExit("watchlist-september-2026 not found")

(P / "data" / "journal.json").write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
print("Updated watchlist-september-2026 with 7 embedded trailers.")
