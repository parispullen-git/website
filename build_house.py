#!/usr/bin/env python3
"""
Generates house.html — the twelve-plus floor building.
Each floor is a full-view scene with clickable artifacts.
Edit FLOORS below and re-run:  python3 build_house.py

Header/menu/footer are pulled live from index.html at build time (not
hand-authored here) so they can never drift out of sync with the rest of
the site -- editing index.html's nav/footer and re-running this script is
enough to keep house.html current.
"""
import json
import re
from pathlib import Path

_index_src = open("index.html", encoding="utf-8").read()
SITE_HEADER = re.search(r'<header class="worldnav">.*?</header>', _index_src, re.S).group(0)
SITE_MENU = re.search(r'<nav class="menu".*?</nav>', _index_src, re.S).group(0)
SITE_FOOT = re.search(r'<footer class="foot foot--film">.*?</footer>', _index_src, re.S).group(0)
# The social row is lifted from index.html too rather than re-typed here, so
# the icon set and handles can never drift from the rest of the site.
SITE_SOCIAL = re.search(r'<div class="social">.*?</a>\s*</div>', _index_src, re.S).group(0)

FLOORS = [
 dict(id="skyline", lvl="29", name="The Skyline Club", state="members",
   img="env-rooftop", grade="", focus="50% 46%",
   note="You step out of the lift into moving air and the sound of a room that started without you.",
   arts=[
    ("pool","The Water","62%","64%","The pool is four feet deep and nobody has ever swum in it. It exists to put moving light on the faces of people having conversations near it, which it does exceptionally well.",[("Depth","4 ft"),("Purpose","Lighting"),("Swimmers","None on record")]),
    ("parapet","The Parapet","24%","52%","The glass edge. Every significant conversation on this roof has happened within six feet of it, because people tell the truth more readily when they can see how far down it is.",[("Height","29 floors"),("Glass","Structural"),("Rule","No phones out")]),
    ("cabana","The Cabanas","82%","58%","Four of them. Three can be booked. The fourth has never been available on any night, to anyone, and the staff have been trained not to explain why.",[("Total","Four"),("Bookable","Three"),("The fourth","Not discussed")]),
    ("booth","The Corner Booth","44%","78%","Faces the door, backs to the wall, worst view in the building. Held permanently. If you are sitting in it you were invited to sit in it.",[("View","Deliberately poor"),("Sightline","The lift"),("Held","Permanently")]),
   ]),

 dict(id="penthouse-living", lvl="27", name="The Living Room", state="restricted",
   img="room-living", grade="", focus="50% 50%",
   note="Two storeys of it, and somebody was sitting here twenty minutes ago. The glass is still cold.",
   arts=[
    ("journal","The Journal","28%","91%","Left face-down and open, which he knows ruins a spine. Everything written in it eventually turns up here, several drafts later — dispatches, not diary entries.",[("Position","Face-down"),("Draft or final","Several drafts later"),("Read it","The Journal")]),
    ("piano","The Piano","72%","88%","He played trumpet for seven years, first chair, and cannot play this at all. It is here because a room with a piano in it behaves differently from a room without one — and because it's wired to whatever he's actually listening to.",[("Played by him","No"),("Actual instrument","Trumpet"),("Function","Atmosphere & the speakers")]),
    ("vault","The Vault","91%","70%","Brass wheel, black steel, set into the wall beside the piano and not hidden behind anything. A safe nobody can see is a safe somebody goes looking for. What's inside isn't paper.",[("Concealed","No"),("Contents","UR Welcome"),("Combination","One person")]),
    ("candle","The Candle","74.58%","36.17%","Unlit, on the back counter, waiting on a launch date nobody will confirm yet. UR Welcome — coming soon.",[("Status","Coming soon"),("Lit","Not yet")]),
    ("jacket","The Jacket","39.2%","67.5%","Left over the back of the reading chair rather than hung, which tells you he wasn't planning on staying gone long. Everything else he owns is arranged by occasion — see the Boutique.",[("Hung","No"),("Ordered elsewhere","By occasion"),("See also","The Boutique")]),
   ]),

 dict(id="bedroom", lvl="28", name="The Bedroom", state="restricted",
   img="room-bedroom", grade="", focus="50% 52%",
   note="Blackout to the glass, and a bed that faces away from the view on purpose.",
   arts=[
    ("artwork","The Artwork","67%","36%","Bought a long time before he could afford it, and hung on every wall he has had since. A man on a road at dusk, walking away from whatever the painter could not be bothered to explain. It hangs behind the headboard, so he only sees it when he turns around.",[("Acquired","Early, badly timed"),("Subject","Unexplained"),("Moved with him","Every time")]),
    ("chair","The Lounge Chair","10%","72%","Angled at the window rather than the television, because there is no television. Most of the thinking that matters happens in it.",[("Faces","The city"),("Television","None"),("Hours logged","Considerable")]),
    ("door","The Closet Door","93%","54%","Left open more often than not. What is behind it is arranged by occasion, not by colour \u2014 see the Closet.",[("Kept","Open"),("Ordered by","Occasion")]),
   ]),

 dict(id="bath", lvl="28", name="The Bathroom", state="restricted",
   img="room-bath", grade="", focus="50% 50%",
   note="Stone, brass and steam, with the whole city on the other side of the glass.",
   arts=[]),

 dict(id="closet", lvl="28", name="The Closet", state="restricted",
   img="room-closet", grade="", focus="50% 52%",
   note="Not a room of clothes. A room of decisions already made.",
   arts=[
    ("suits","The Suits & Tuxedos","50%","42%","Arranged by occasion rather than colour, so getting dressed is a question of where you are going rather than what you feel like. Two dinner jackets at the centre, black-tie and white-tie, either one pressed and ready before he has to ask.",[("Ordered by","Occasion"),("Navy suits","Twelve"),("Tuxedos","Two, black-tie and white-tie")]),
    ("shoes","The Shoes","9%","62%","Cedar-treed, rotated, never worn two days running. The oldest pair on the shelf is fourteen years old and still the best thing in the room.",[("Rotation","Enforced"),("Oldest pair","14 years"),("Trees","Cedar")]),
    ("ties","The Ties","91%","56%","Hung rather than rolled. He owns more than he wears and knows it, and has stopped pretending that will change.",[("Hung","Never rolled"),("Worn regularly","Six"),("Owned","Considerably more")]),
   ]),

 dict(id="kitchen", lvl="27", name="The Kitchen", state="restricted",
   img="room-kitchen", grade="", focus="50% 54%",
   note="Black marble, brass, and one box that showed up on the counter this morning.",
   arts=[
    ("hellofresh","The Delivery","53%","60%","It arrived before he did. No note, no ceremony — just the box, already unpacked onto the marble like it had always been there. He does not cook often. He cooks well when he does, and never asks how the box knew that.",[]),
   ]),

 dict(id="study", lvl="28", name="The Study", state="restricted",
   img="room-study", grade="", focus="50% 52%",
   note="The room where the answer is usually no, and where it gets said politely.",
   arts=[
    ("monogram","The Monogram","57%","30%","Brass, wall-mounted, deliberately the only branded object in the entire apartment. He is aware of the contradiction and finds it funny.",[("Material","Brass"),("Other branding here","None"),("Self-aware","Entirely")]),
    ("pullenlaws","The Pullen Laws","38%","37%","Fourteen of them, on the left-hand shelf, written down over eleven years because a rule you have to remember is a rule you will eventually forget. The first one is about arriving early. The fourteenth has never been read aloud.",[("Count","Fourteen"),("Written over","Eleven years"),("Read aloud","Thirteen of them")]),
    ("journal","The Journal","57%","57%","This week's pages, face-up on the blotter for once, marked in pencil rather than ink so that nothing is decided yet. What survives the pencil goes out as a dispatch. Most of it does not survive the pencil.",[("State","Draft"),("Marked in","Pencil"),("Survival rate","Low")]),
    ("cocktails","The Cocktail Guide","75%","37%","Six drinks, written on a card and kept behind the bottles, because a man looking up an Old Fashioned in front of guests has already lost the evening. Six is the entire list. There has never been a seventh.",[("Drinks","Six"),("Kept","Behind the bottles"),("Consulted in company","Never")]),
    ("map","The Map","91%","44%","Brass inlay on black. Cities he has worked, not cities he has visited \u2014 a distinction he will make if you ask.",[("Marks","Cities worked"),("Not","Cities visited")]),
   ]),

 dict(id="cinema", lvl="27", name="The Cinema", state="restricted",
   img="room-cinema", grade="", focus="50% 54%",
   note="Nine seats, one screen, and a rule about phones that is actually enforced.",
   arts=[
    ("posters","The Posters","12%","42%","All one register: men in tailoring, making decisions, usually badly. He will tell you it is research. It is partly research.",[("Register","One"),("Claimed purpose","Research"),("Actual","Partly")]),
   ]),

 dict(id="corridor", lvl="26", name="The Corridor", state="restricted",
   img="env-network", grade="grade--cold", focus="40% 56%",
   note="No numbers on these doors. The carpet is thicker here, which is not a decorating choice.",
   arts=[
    ("door","The Unmarked Door","30%","48%","There is no handle on this side. It opens from within, or it does not open. Staff are instructed never to knock on it, and never to mention it to a guest who has not mentioned it first.",[("Handle","Interior only"),("Knocking","Prohibited"),("Mentioned first by","The guest")]),
    ("carpet","The Carpet","58%","82%","Deeper pile than the floors above and below. Sound does not carry in this hallway, and that is the entire specification.",[("Pile","Deep"),("Acoustic","Dead"),("Specification","One line")]),
    ("lift","The Second Lift","74%","44%","It does not appear on the panel in the main bank. It is called by a card, not a button, and it only travels between three floors.",[("Called by","Card"),("Serves","Three floors"),("On the panel","No")]),
    ("weeklydelivery","The Weekly Delivery","86%","68%","It comes up the private line, not the guest elevator — the only recurring thing that does. The staff know not to ask what's inside. It's produce.",[("Route","Private elevator"),("Frequency","Weekly"),("Contents","Produce, mostly")]),
   ]),

 dict(id="order", lvl="25", name="The Order", state="restricted",
   img="env-chamber", grade="", focus="50% 50%",
   note="Twelve chairs. Eleven are spoken for. Nobody sits down until the last person is standing.",
   arts=[
    ("twelfth","The Twelfth Chair","62%","56%","Identical to the other eleven and never once occupied. It is not reserved for anyone. It is there so that everybody seated can see that the table is not full.",[("Occupied","Never"),("Reserved for","No one"),("Purpose","Visible incompleteness")]),
    ("table","The Table","50%","70%","One piece of walnut, brought in before the walls were finished because it does not fit through the door. The room was built around it, which is the point being made.",[("Material","Single walnut slab"),("Installed","Before the walls"),("Removable","No")]),
    ("lamps","The Lamps","44%","24%","Hung low enough that everyone's face is lit and nobody's eyes are in shadow. You cannot lie comfortably at this table. That is engineering, not decor.",[("Height","Low"),("Shadow","None on the face"),("Effect","Deliberate")]),
   ]),

 dict(id="operations", lvl="24", name="The Operations Room", state="restricted",
   img="env-opsroom", grade="", focus="50% 54%",
   note="The warmest room in the building, and the only one where the furniture is doing arithmetic.",
   arts=[
    ("table","The Table","40%","64%","Walnut with smoked glass inlaid flush into the surface, lit from beneath in fine amber linework. It shows the city as relationships rather than streets. At rest it is a very good table.",[("Output","Amber only"),("Ceiling","12% brightness"),("At rest","Furniture")]),
    ("instruments","The Instruments","62%","58%","Machined brass and titanium, laid out like surgical tools. None of them have a screen. Every one of them does something a screen would do worse.",[("Screens","None"),("Material","Brass, titanium"),("Read by","Touch")]),
    ("library","The Shelves","86%","36%","Real books, read. The technology in this room is deliberately outnumbered by things made of paper, which is a decision he will defend at length if asked.",[("Books","Read, not staged"),("Ratio","Paper wins"),("Defends this","At length")]),
   ]),

 dict(id="lab", lvl="18", name="The Lab", state="restricted",
   img="env-atelier", grade="grade--amber", focus="50% 52%",
   note="It smells like the inside of a cigar box and faintly of citrus. This is where the whole thing started.",
   arts=[
    ("scales","The Scales","34%","62%","Accurate to a hundredth of a gram. Everything else in the building is measured in impressions and relationships. This is the one room that deals in numbers that cannot be argued with.",[("Accuracy","0.01 g"),("Arguable","No"),("Calibrated","Weekly")]),
    ("blotters","The Blotters","58%","54%","Fanned in a brass rack, each one a version that did not make it. She keeps them. He has asked why. She has not answered.",[("Kept","All of them"),("Reason given","None"),("Versions to date","Undisclosed")]),
    ("notebook","The Notebook","24%","82%","Leather, handwritten, and the only complete formula record in existence. There is no digital copy, on purpose, and it does not leave this room.",[("Copies","One"),("Digital","None"),("Leaves the room","No")]),
    ("bottles","The Unlabelled Bottles","76%","44%","Amber glass, no labels, arranged in an order that makes sense to exactly one person. Moving them is the fastest way to be asked to leave.",[("Labels","None"),("Order","Personal"),("Touched by others","Never")]),
   ]),

 dict(id="haberdashery", lvl="12", name="The Haberdashery", state="members",
   img="env-bespoke", grade="", focus="50% 50%",
   note="Warm wood, cold discipline. The room where the building decides what you are going to look like.",
   arts=[
    ("cloth","The Cloth Wall","74%","40%","Bolts stacked by weight, not colour. A client who asks for the blue one is gently redirected. A client who asks what will still look correct in nine years is offered a chair.",[("Ordered by","Weight"),("Wrong question","Colour"),("Right question","Longevity")]),
    ("table","The Cutting Table","46%","76%","Chalk, shears and forty years of hands. Nothing is cut on this table that has not been argued about first.",[("Chalk","Tailor's"),("Argued about","Everything"),("Cut twice","Never")]),
    ("shoes","The Shoes","20%","70%","A rack of them, all dark, all polished past the point of necessity. The first thing the doorman checks and the last thing an amateur thinks about.",[("Finish","Excessive"),("Checked by","The doorman"),("Noticed by amateurs","No")]),
    ("hiddendoor","The Panel That Is Not A Panel","88%","62%","Third panel from the corner. It reads as joinery. It is a door, and behind it the room is not about tailoring.",[("Reads as","Joinery"),("Actually","A door"),("Behind it","See below")]),
   ]),

 dict(id="armoury", lvl="12M", name="The Armoury", state="restricted",
   img="env-bespoke", grade="grade--noir", focus="86% 58%",
   note="A gentleman's defensive kit, in the Savile Row tradition. Nothing in here fires anything.",
   arts=[
    ("umbrellas","The Umbrellas","32%","46%","Storm-rated, reinforced along the spine, weighted correctly for the hand. It rains a great deal in this state and a man should not be caught holding something flimsy.",[("Frame","Reinforced"),("Weight","Hand-balanced"),("Fires","Nothing")]),
    ("canes","The Canes","54%","52%","Malacca and blackthorn. Two of them belonged to men who are named on the wall downstairs. They are carried on occasions that call for being reminded of something.",[("Woods","Malacca, blackthorn"),("Inherited","Two"),("Ceremonial","Mostly")]),
    ("sabres","The Sabres","70%","44%","Fencing blades, buttoned, kept sharp enough to be respected and blunt enough to be legal. He fences badly and enjoys it enormously.",[("Buttoned","Yes"),("His standard","Poor"),("His enthusiasm","Total")]),
    ("case","The Locked Case","46%","78%","The only locked thing in the building. It contains correspondence, not hardware, which is the joke and also the truth.",[("Contents","Paper"),("Hardware","None"),("Key held by","One person")]),
   ]),

 dict(id="fitting", lvl="11", name="The Fitting Floor", state="members",
   img="paris-bespoke", grade="grade--warm", focus="50% 42%",
   note="Three mirrors, angled so you cannot avoid yourself. Somebody is mid-fitting. He does not stop.",
   arts=[
    ("mirrors","The Three Mirrors","24%","36%","Set so that you see your own back. Most men have never seen how they actually stand, and the first fitting is largely about surviving that information.",[("Angles","Three"),("Shows","Your back"),("First reaction","Silence")]),
    ("rails","The Rails","82%","54%","Finished garments waiting on brass. Each one has a name on the ticket and a date, and the date is when it was promised rather than when it was finished.",[("On the ticket","Name and date"),("Date means","Promised"),("Late","Occasionally")]),
    ("cuff","The Cuff","46%","62%","Half an inch of shirt, no more. He adjusts it without thinking about it roughly forty times a day, which the Cutter finds funny and has never mentioned.",[("Exposure","0.5 in"),("Adjusted","~40/day"),("Conscious","No")]),
   ]),

 dict(id="restaurant", lvl="03", name="The Restaurant", state="public",
   img="env-gala", grade="grade--warm", focus="50% 56%",
   note="Sixty covers, one seating, and a kitchen that closes when it is finished rather than when the clock says so.",
   arts=[
    ("corner","The Corner Table","22%","60%","Two chairs, both facing out. Every deal this building has ever done was either agreed at this table or fell apart at it.",[("Covers","Two"),("Both facing","Out"),("Record","Mixed")]),
    ("pass","The Pass","62%","44%","Visible from the room on purpose. Diners can watch the kitchen work, and the kitchen can watch who has arrived, which matters more than the diners realise.",[("Visible","Both directions"),("Matters more to","The kitchen")]),
    ("flowers","The Arrangements","82%","52%","Replaced entirely twice a week, dark and slightly overgrown rather than neat. Neat flowers make a room look like it is trying.",[("Replaced","2x weekly"),("Style","Overgrown"),("Neatness","Avoided")]),
   ]),

 dict(id="bar", lvl="02", name="The Bar", state="public",
   img="env-bar", grade="", focus="46% 54%",
   note="Low ceiling, low light, low voices. The best-run room in the building and the one he is proudest of.",
   arts=[
    ("backbar","The Back Bar","22%","32%","Lit from within, unlabelled by house policy. If you want to know what you are drinking you have to ask, and asking is how conversations start.",[("Labels","Removed"),("Policy","House"),("Effect","You ask")]),
    ("ice","The Ice","36%","64%","Cut from a single block each afternoon. Clear ice melts slower, dilutes less, and signals that somebody spent time on your drink before you ordered it.",[("Cut","Daily"),("Clarity","Total"),("Signals","Effort")]),
    ("rail","The Brass Rail","56%","82%","Unlacquered, so it takes a fingerprint and keeps it. Polished once a week, never more, because a rail with no wear on it means nobody is standing here.",[("Finish","Unlacquered"),("Polished","Weekly"),("Wear","Wanted")]),
    ("banquette","The Banquettes","82%","62%","Burgundy leather, deliberately slightly too deep, so that people sit back rather than forward. Nobody has ever had a rushed conversation in one.",[("Depth","Excessive"),("Posture","Back"),("Rushed talk","None")]),
   ]),

 dict(id="coffee", lvl="01", name="The Coffee House", state="public",
   img="env-bar", grade="grade--dawn", focus="30% 60%",
   note="The same marble counter, twelve hours earlier. Different room entirely.",
   arts=[
    ("counter","The Counter","34%","62%","This is the bar. At six in the morning the bottles are shuttered, the lights come up, and the same stone serves espresso to people who have no idea what happens here after dark.",[("Same stone","Yes"),("Shuttered","The back bar"),("Overlap","Two hours")]),
    ("regulars","The Regulars","70%","70%","Bankers at six, builders at seven, the Cutter at eight-fifteen without fail. He orders the same thing and has never once said thank you, which everyone finds endearing.",[("Cutter arrives","08:15"),("Order","Unchanged"),("Thanks anyone","No")]),
    ("window","The Window","86%","40%","Ground floor, full height, facing the street. The only room in the building where the public can see in — and the only floor where that is the entire idea.",[("Visibility","Total"),("Deliberate","Yes"),("Only floor like it","Yes")]),
   ]),

 dict(id="lobby", lvl="G", name="The Lobby", state="public",
   img="env-lobby", grade="grade--jewel", focus="50% 52%",
   note="The doors give, the noise of the street stops, and the building tells you everything about itself in about four seconds.",
   arts=[
    ("doors","The Doors","80%","50%","Brass, and heavier than they need to be. The weight is the point \u2014 you have to commit to opening them, and by the time you are through you have already made a small decision about being here.",[("Material","Solid brass"),("Weight","Deliberate"),("Held for you","Only sometimes")]),
    ("flowers","The Arrangements","50%","44%","Replaced entirely twice a week and never symmetrical. They are cut tall enough that you cannot see the whole room at once, so the lobby reveals itself in pieces rather than all at once.",[("Replaced","2x weekly"),("Symmetry","Avoided"),("Function","Concealment")]),
    ("water","The Water","44%","80%","A still black basin, no fountain, no movement. It exists so the room has a sound floor \u2014 the faint hush that stops a marble hall from ringing like a bank.",[("Movement","None"),("Purpose","Acoustic"),("Depth","Shallow")]),
    ("desk","The Desk","29%","58%","Honed black marble, no computer visible, no queue rope, no signage. Whoever is standing behind it already knows your name or is about to find it out.",[("Screens","Hidden"),("Queue","Never"),("Signage","None")]),
    ("ceiling","The Ceiling","62%","11%","Four storeys of it. Every material expense in this building was argued about except this one \u2014 height is the only luxury that cannot be faked, and he paid for it without discussion.",[("Height","Four storeys"),("Argued about","No"),("Fakeable","Not at all")]),
   ]),

 dict(id="motor", lvl="B1", name="The Motor Club", state="members",
   img="env-motorclub", grade="", focus="50% 50%",
   note="Cool air, polished concrete, and twenty-four reasons somebody had a good year.",
   arts=[
    ("bays","The Bays","40%","56%","Twenty-four, each lit like an exhibit. The Curator can tell you what closed the deal that paid for every single one, and will, at length, if you make eye contact.",[("Bays","24"),("Lit as","Exhibits"),("Stories","Unavoidable")]),
    ("lounge","The Lounge","78%","52%","At the far end, behind glass, so members can sit with a drink and look at the collection. Nobody has ever sat facing away from it.",[("Glazing","Full"),("Seating","Faces in"),("Exceptions","None")]),
    ("lift","The Private Lift","88%","64%","Goes up. Does not stop at the lobby, the bar or the restaurant. There is only one card that calls it from down here.",[("Stops","Not the lobby"),("Callable by","One card"),("Direction","Up")]),
   ]),

 dict(id="inventory", lvl="B2", name="The Inventory", state="restricted",
   img="env-motorclub", grade="grade--noir", focus="18% 62%",
   note="Below the club. Colder, darker, and considerably more interesting.",
   arts=[
    ("racks","The Racks","30%","48%","Parts, panels and things that no longer exist anywhere else. When a car upstairs needs something unobtainable, it is obtained from down here.",[("Contents","Unobtainable"),("Catalogue","Handwritten"),("Insured","Separately")]),
    ("ledger","The Ledger","56%","64%","A handwritten record of every acquisition, what was paid, and who was outbid. That last column is the one people ask about and the one that never gets shown.",[("Columns","Three"),("Third column","Who lost"),("Shown","Never")]),
    ("crates","The Crates","78%","72%","Unopened. Some for years. He buys things he does not need in order to be the person who has them when somebody finally does need one.",[("Opened","Some, eventually"),("Needed","Rarely"),("Strategy","Patience")]),
   ]),
]

def esc(t):
    return t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("'","&#8217;")

# Only Levels 27-28 (The Penthouse) are open to the public right now --
# every other floor in FLOORS is real, authored content kept around as
# source material, but not built into the site. Restricting the actual
# room-pager to this subset, rather than deleting the rest of FLOORS,
# keeps that content available to re-open later with a one-line change.
#
# Order here (not FLOORS' own narrative authoring order) is what the
# room-pager's slide direction is actually built from -- it pages by
# array index (translateX(-i*100%)), so a "left" move needs to land on a
# lower index and a "right" move a higher one, or the slide visually
# runs backwards from what the arrow/swipe implied. The two rows below
# are independent left-right chains (ROOM_ADJACENCY has no left/right
# link between them), so only the order *within* each row matters:
#   Kitchen -> Living Room -> Cinema            (Level 27)
#   Study -> Bedroom -> Closet -> Bathroom        (Level 28)
_PENTHOUSE_ORDER = ["kitchen", "penthouse-living", "cinema", "study", "bedroom", "closet", "bath"]
_penthouse_by_id = {f["id"]: f for f in FLOORS if f["lvl"] in ("27", "28")}
PENTHOUSE_FLOORS = [_penthouse_by_id[_id] for _id in _PENTHOUSE_ORDER]
START_ROOM = "penthouse-living"  # data-start-room below; also which screen (if any) autoplays on load

# Room-to-room navigation is a real 2D layout, not a linear sequence:
#   Level 28:  Study <-> Bedroom <-> Closet <-> Bathroom
#                            |
#   Level 27:  Kitchen <-> Living Room <-> Cinema
# Left/right/up/down each name an explicit neighbor id (or are absent at an
# edge) -- room-pager.js reads these directly rather than paging by array
# index, so DOM order no longer needs to match traversal order.
ROOM_ADJACENCY = {
    "penthouse-living": {"left": "kitchen", "right": "cinema", "up": "bedroom"},
    "kitchen":           {"right": "penthouse-living"},
    "cinema":             {"left": "penthouse-living"},
    "bedroom":            {"left": "study", "right": "closet", "down": "penthouse-living"},
    "study":              {"right": "bedroom"},
    "closet":             {"left": "bedroom", "right": "bath"},
    "bath":               {"left": "closet"},
}

# Room-to-room nav (ROOM_ADJACENCY, above) is fully explicit now, but the
# (currently hidden, see .nav-panel:has(...) in world.css) corner "Floors"
# panel still lists every open level by its own entry room, which needs
# levels sorted top-to-bottom. Levels aren't plain integers ("G", "B1",
# "B2", "12M" all appear), and FLOORS' own file order groups same-level
# rooms together for narrative reasons rather than strict building order,
# so it can't be used directly for floor ordering -- level_key() gives
# every level a real, comparable number.
def level_key(lvl):
    if lvl == "G":
        return 0.0
    if lvl.startswith("B"):
        return -float(lvl[1:])
    if lvl.endswith("M"):
        return float(lvl[:-1]) - 0.5  # a mezzanine sits just below its numbered floor
    return float(lvl)

_level_entry_room = {}  # level string -> id of that level's first room in file order
for _f in PENTHOUSE_FLOORS:
    _level_entry_room.setdefault(_f["lvl"], _f["id"])
_levels_desc = sorted(_level_entry_room, key=level_key, reverse=True)

# The corner nav-panel's button list (assets/js/nav-panel.js) -- every open
# room, not just one per floor (a level can hold more than one open room --
# 28 alone is Study/Bedroom/Closet/Bath -- and picking just one as that
# level's "entry" silently made the rest unreachable except by paging
# through prev/next one room at a time), grouped under a small level
# heading so a level with several rooms doesn't read as a flat, undifferentiated
# list.
def _nav_panel_rows():
    by_level = {}
    for f in PENTHOUSE_FLOORS:
        by_level.setdefault(f["lvl"], []).append(f)
    rows = []
    for lvl in _levels_desc:
        rows.append(f'<p class="nav-panel__group">Level {lvl}</p>')
        for room in by_level[lvl]:
            rows.append(
                f'<button type="button" class="nav-panel__btn" data-nav-panel-go="{room["id"]}">'
                f'<span class="nav-panel__btn-lvl">{lvl}</span>'
                f'<span class="nav-panel__btn-name">{esc(room["name"])}</span></button>'
            )
    return "\n    ".join(rows)

# The mobile menu's Explore section (index.html's <nav class="menu">, hand-
# authored, not generated) is meant to list every open room -- warn rather
# than fail if someone adds/removes/renames one here and forgets to update
# that hand-typed list, since drift there is silent otherwise.
_menu_room_ids = set(re.findall(r'href="house\.html#([\w-]+)"', SITE_MENU))
_floor_ids = set(f["id"] for f in PENTHOUSE_FLOORS)
if _menu_room_ids != _floor_ids:
    import sys
    _missing = _floor_ids - _menu_room_ids
    _stale = _menu_room_ids - _floor_ids
    if _missing:
        print(f"WARNING: index.html's menu Explore list is missing floors: {sorted(_missing)}", file=sys.stderr)
    if _stale:
        print(f"WARNING: index.html's menu Explore list has floors no longer open: {sorted(_stale)}", file=sys.stderr)

# Rooms with a playable screen — id/label must match the matching entry in
# CHANNEL_SETS[channel_set][0] in assets/js/tv-remote.js.
TV_SCREENS = {
    "penthouse-living": dict(
        x="57.5%", y="24.3%", w="19%", h="15%",
        box="0.4854,0.1742,0.6646,0.3113",
        channel_set="living", id="4xVVFJuycww", label="The Gentlemen",
    ),
    "cinema": dict(
        x="50%", y="37.6%", w="27.9%", h="29.3%",
        box="0.3604,0.2296,0.6396,0.5222",
        channel_set="cinema", id="gnm4HgIAVmU", label="The Thomas Crown Affair — Official Teaser Trailer",
    ),
}

# Physical "open the remote" artifact-style marker in the room photo, for
# rooms where it's worth one -- reachable without clicking the screen
# itself, or (for the Living Room, sitting mid-room where it just got in
# the way of the coffee table) the always-visible fixed Remote pill.
# Cinema sits at the foot of the screen (derived from its box above --
# y + h/2, the bottom edge).
REMOTE_NODE_POS = {
    "cinema": ("50%", "53%"),
}

# "The City" marker -- a real link to charlotte.html, styled exactly like an
# artifact dot but NOT a drawer (no data-artifact attribute, so world.js's
# drawer delegate never claims the click and the <a> navigates normally).
# Same shape as REMOTE_NODE_POS above: any room that has glass worth
# walking through gets an entry here, positioned on that room's own view.
# Keep every position clear of the fixed left/right nav arrows -- those are
# pinned to the viewport edges and vertically centred, so stay past x=14%
# on the left and off mid-height at the far right.
CITY_NODE_POS = {
    "penthouse-living": ("17%", "62%"),   # left-hand window wall, mid-height, clear of the Kitchen arrow
    "bedroom":          ("20%", "46%"),   # the floor-to-ceiling glass left of the bed
    "bath":             ("50%", "50%"),   # the city behind the tub, centred on the glass
    "kitchen":          ("93%", "25%"),   # the right-hand window, high enough to clear the next-room arrow
}

KITCHEN_HELLOFRESH_UNLOCK = '''<div class="hf-unlock">
                  <p class="hf-unlock__eyebrow">Unlocked &#183; 5 Recipes Every Man Should Own</p>
                  <ul class="hf-recipe-list">
                    <li><span class="hf-recipe-list__name">Pan-Seared Filet, Peppercorn Sauce</span><span class="hf-recipe-list__note">The one that never needs an occasion.</span></li>
                    <li><span class="hf-recipe-list__name">Miso-Glazed Salmon, Charred Broccolini</span><span class="hf-recipe-list__note">Fifteen minutes, looks like an hour.</span></li>
                    <li><span class="hf-recipe-list__name">French Onion Steak Frites</span><span class="hf-recipe-list__note">For the night you're not ordering in.</span></li>
                    <li><span class="hf-recipe-list__name">Rigatoni alla Vodka, Torn Basil</span><span class="hf-recipe-list__note">Cooks in one pan. Photographs in every light.</span></li>
                    <li><span class="hf-recipe-list__name">Smoked Paprika Chicken, Root Vegetables</span><span class="hf-recipe-list__note">The one you actually make twice a week.</span></li>
                  </ul>
                  <a class="cta cta--ghost hf-unlock__cta" href="pantry.html"><span>Get the Box &#8212; HelloFresh &#215; Paris Pullen</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
                </div>'''

JOURNAL_CTA = ('<a class="cta pent__open" href="journal.html" style="margin-top:var(--s2)">'
    '<span>Read the Journal</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>')

# The Monogram is the one branded object in the apartment, so its drawer is
# where the man behind the mark actually introduces himself -- portrait,
# short bio, the mission line, and the real social accounts. SITE_SOCIAL is
# lifted from index.html at build time (above) so the handles and icon set
# can't drift from the rest of the site.
MONOGRAM_BIO = f'''<div class="bio">
                  <img class="bio__portrait" src="assets/img/paris-fireside.jpg"
                       srcset="assets/img/paris-fireside@sm.jpg 562w, assets/img/paris-fireside.jpg 1125w"
                       sizes="(max-width:760px) 88vw, 30vw" alt="Paris Pullen seated fireside, holding an Emmy" loading="lazy">
                  <p class="bio__mission">The city thinks he&#8217;s selling luxury. The people who matter know he&#8217;s selling access.</p>
                  <p class="body">Charlotte, by way of three schools, seven years of trumpet and a backpack business printing t-shirts for his own classmates. A cold email nobody asked for turned into brand activation work; that turned into a nightlife partnership that made a 600-capacity room the best Friday in the city; that turned into hosting, then building rooms of his own.</p>
                  <p class="body">Menswear, hospitality, automotive culture and fragrance &#8212; run as one practice rather than four hobbies. The through-line is the same every time: put a mark on a thing, and make the right people want to be in the room with it.</p>
                  {SITE_SOCIAL}
                  <a class="cta pent__open" href="about.html" style="margin-top:var(--s2)"><span>The Man</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>
                </div>'''

VAULT_CTA = ('<a class="cta pent__open" href="urwelcome.html" data-vault-enter style="margin-top:var(--s2)">'
    '<span>Enter the Vault</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>')

PIANO_PLAYLISTS = json.loads((Path(__file__).resolve().parent / "data" / "house-music.json").read_text(encoding="utf-8"))
_piano_first = PIANO_PLAYLISTS[0]
_piano_json = json.dumps(PIANO_PLAYLISTS).replace('"', "&quot;")
PIANO_PLAYER = f'''<div class="piano-player" data-piano-player data-playlists="{_piano_json}">
                  <div class="piano-player__head">
                    <p class="piano-player__eyebrow">Now Playing &#183; <span data-piano-label>{esc(_piano_first["label"])}</span></p>
                    <div class="piano-player__nav">
                      <button type="button" data-piano-prev aria-label="Previous">&#8249;</button>
                      <button type="button" data-piano-play aria-label="Play">&#9654;</button>
                      <button type="button" data-piano-next aria-label="Next">&#8250;</button>
                    </div>
                  </div>
                  <div class="piano-player__frame"><div data-piano-frame></div></div>
                </div>'''

CANDLE_COMING_SOON = '''<div class="coming-soon">
                  <span class="coming-soon__badge">UR Welcome &#183; Coming Soon</span>
                </div>'''

GUIDE_PORTAL_CTA = ('<button type="button" class="cta pent__open" data-guide-portal style="margin-top:var(--s2)">'
    '<span>Explore the City Guide</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></button>')

def floor_html(f):
    grade = (" "+f["grade"]) if f.get("grade") else ""
    arts, panels = [], []
    for key,name,x,y,body,specs in f["arts"]:
        notes = ('<span class="artifact__notes" aria-hidden="true"><i>&#9834;</i><i>&#9835;</i><i>&#9834;</i></span>'
                 if key == "piano" else "")
        arts.append(
f'''        <button class="artifact" style="--x:{x};--y:{y}" data-artifact="{key}">
          <span class="artifact__dot" aria-hidden="true"></span>
          <span class="artifact__label">{esc(name)}</span>
          {notes}
        </button>''')
        spec = "".join(f'<div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k,v in specs)
        wardrobe_cta = (
            '<a class="cta pent__open" href="wardrobe.html" style="margin-top:var(--s2)">'
            '<span>Enter the Boutique</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>'
            if f["id"] == "closet" and key == "suits" else ""
        )
        tag = f'Level {f["lvl"]} &#183; Artifact'
        if f["id"] == "kitchen" and key == "hellofresh":
            wardrobe_cta = KITCHEN_HELLOFRESH_UNLOCK
            tag = f'Level {f["lvl"]} &#183; Artifact &#183; HelloFresh &#215; Paris Pullen'
        elif key == "window":
            wardrobe_cta = GUIDE_PORTAL_CTA
        elif key == "journal":
            # Both the Living Room's face-down journal and the Study's
            # pencil-marked draft point at the same published dispatches.
            wardrobe_cta = JOURNAL_CTA
        elif key == "monogram":
            wardrobe_cta = MONOGRAM_BIO
        elif f["id"] == "penthouse-living" and key == "vault":
            wardrobe_cta = VAULT_CTA
        elif f["id"] == "penthouse-living" and key == "piano":
            wardrobe_cta = PIANO_PLAYER
        elif f["id"] == "penthouse-living" and key == "candle":
            wardrobe_cta = CANDLE_COMING_SOON
        elif f["id"] == "penthouse-living" and key == "jacket":
            wardrobe_cta = (
                '<a class="cta pent__open" href="wardrobe.html" style="margin-top:var(--s2)">'
                '<span>Enter the Boutique</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>'
            )
        panels.append(
f'''          <div class="drawer__panel" data-artifact="{key}" hidden>
            <div class="drawer__inner">
              <div class="drawer__head">
                <p class="drawer__tag">{tag}</p>
                <h3 class="drawer__name">{esc(name)}</h3>
              </div>
              <div class="drawer__body">
                <p class="body">{esc(body)}</p>
                <dl class="drawer__spec">{spec}</dl>
                {wardrobe_cta}
              </div>
            </div>
          </div>''')

    tv = ''
    ts = TV_SCREENS.get(f["id"])
    if ts:
        # Only the start room's own screen autoplays straight from the baked
        # HTML -- every other screen (Cinema included) starts with no src at
        # all, so nothing plays or makes sound until a visitor actually pages
        # into that room for the first time. tv-remote.js's IntersectionObserver
        # (see the "entering" branch in initScreen) lazily assigns the real,
        # muted src at that point -- see loadChannel there.
        #
        # mute=1, not the optimistic mute=0 this used to request: unmuted
        # autoplay in a cross-origin iframe is reliably blocked on mobile
        # regardless of the allow policy below, and unlike desktop (where
        # YouTube's player quietly falls back to muted-and-playing),
        # mobile browsers were sometimes just refusing to autoplay AT ALL
        # rather than falling back -- so the video never started moving.
        # Guaranteed-muted autoplay is the one mode every browser actually
        # honors; getting real sound on is entirely the job of the
        # postMessage 'unMute' attempt + guaranteed Tap-for-Sound fallback
        # in tv-remote.js's enter-room logic, same as every other screen.
        iframe_src = (
            f'https://www.youtube.com/embed/{ts["id"]}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&enablejsapi=1'
            if f["id"] == START_ROOM else ''
        )
        tv = f'''  <div class="floor-scene__screen" style="--x:{ts["x"]};--y:{ts["y"]};--w:{ts["w"]};--h:{ts["h"]}" data-tv data-channel-set="{ts["channel_set"]}" data-box="{ts["box"]}">
    <div class="floor-scene__screen-frame">
      <iframe src="{iframe_src}"
              title="" allow="autoplay; encrypted-media" loading="lazy"></iframe>
    </div>
    <div class="tv-lowerthird" data-tv-lowerthird>
      <p class="tv-lowerthird__eyebrow">Paris Pullen &#183; Now Screening</p>
      <p class="tv-lowerthird__title" data-tv-lowerthird-title>{ts["label"]}</p>
    </div>
    <button type="button" class="tv-sound-prompt" data-tv-sound-prompt hidden>&#128264; Tap for Sound</button>
    <div class="tv-remote" data-tv-remote>
      <div class="tv-remote__brand">
        <button type="button" class="tv-remote__pwr" data-tv-action="power">PWR</button>
        <span class="tv-remote__wordmark">The Compliment</span>
      </div>
      <p class="tv-remote__channel" data-tv-channel-label>{ts["label"]}</p>
      <div class="tv-remote__pad">
        <button type="button" class="tv-remote__pad-hub" data-tv-action="playpause" aria-label="Play or pause"></button>
        <button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--up" data-tv-action="ch-next" aria-label="Channel up">CH</button>
        <button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--down" data-tv-action="ch-prev" aria-label="Channel down">CH</button>
        <button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--left" data-tv-action="vol-down" aria-label="Volume down">VOL</button>
        <button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--right" data-tv-action="vol-up" aria-label="Volume up">VOL</button>
      </div>
      <div class="tv-remote__row tv-remote__row--seek">
        <button type="button" data-tv-action="rw">&#9664;&#9664;</button>
        <button type="button" data-tv-action="ff">&#9654;&#9654;</button>
      </div>
      <button type="button" class="tv-remote__mute" data-tv-action="mute">Mute</button>
      <button type="button" class="tv-remote__guide" data-tv-action="guide">Guide</button>
      <button type="button" class="tv-remote__expand" data-tv-action="expand">Watch Full Screen</button>
      <div class="tv-remote__guide-panel" data-tv-guide-panel hidden>
        <div class="tv-remote__guide-panel-head">
          <p class="tv-remote__guide-panel-eyebrow">Guide</p>
          <button type="button" data-tv-action="guide-close" aria-label="Close guide">Close &#215;</button>
        </div>
        <ul class="tv-remote__guide-panel-list" data-tv-guide-list></ul>
      </div>
    </div>
  </div>
'''

    remote_node = ''
    if ts and f["id"] in REMOTE_NODE_POS:
        rx, ry = REMOTE_NODE_POS[f["id"]]
        remote_node = f'''        <button type="button" class="artifact artifact--remote" style="--x:{rx};--y:{ry}" data-tv-remote-toggle="{ts["channel_set"]}" aria-label="Open the remote">
          <span class="artifact__dot" aria-hidden="true"></span>
          <span class="artifact__label">The Remote</span>
        </button>'''

    # A real link, not a drawer -- styled exactly like any other artifact
    # marker, but tapping it leaves the room entirely rather than opening
    # a panel. Deliberately carries no data-artifact attribute, so world.js's
    # drawer handler ignores it and the <a> is allowed to navigate.
    # Positions live in CITY_NODE_POS above.
    city_link_node = ''
    if f["id"] in CITY_NODE_POS:
        cx, cy = CITY_NODE_POS[f["id"]]
        city_link_node = f'''        <a href="charlotte.html" class="artifact artifact--remote" style="--x:{cx};--y:{cy}">
          <span class="artifact__dot" aria-hidden="true"></span>
          <span class="artifact__label">The City</span>
        </a>'''

    adj = ROOM_ADJACENCY.get(f["id"], {})
    dir_attrs = "".join(f' data-{d}="{adj[d]}"' for d in ("left", "right", "up", "down") if adj.get(d))

    return f'''<section class="floor-scene{grade}" id="{f["id"]}" tabindex="-1" aria-label="Level {f["lvl"]} — {esc(f["name"])}"{dir_attrs}>
  <div class="floor-scene__surface">
    <div class="floor-scene__canvas">
      <div class="floor-scene__view">
        <img src="assets/img/{f["img"]}.jpg"
             srcset="assets/img/{f["img"]}@sm.jpg 1200w, assets/img/{f["img"]}.jpg 2400w"
             sizes="100vw" alt="{esc(f["name"])}" loading="lazy"
             style="--focus:{f["focus"]}" width="2400" height="1340">
{tv}        <div class="artifacts">
{chr(10).join(arts)}{chr(10) + remote_node if remote_node else ''}{chr(10) + city_link_node if city_link_node else ''}
        </div>
      </div>
    </div>
  </div>
  <div class="floor-scene__scrim"></div>

  <div class="wrap">
    <div class="floor-plate reveal">
      <h2 class="floor-plate__name">{esc(f["name"])}</h2>
      <p class="floor-plate__level"><b>{f["lvl"]}</b> <span>The Penthouse</span></p>
      <p class="floor-plate__note">{esc(f["note"])}</p>
      <p class="floor-plate__count"><i></i>{len(f["arts"])} artifact{'s' if len(f["arts"]) != 1 else ''} on this floor</p>
    </div>
  </div>

  <div class="drawer" id="drawer-{f["id"]}" aria-hidden="true">
    <button class="drawer__close">Close &#215;</button>
{chr(10).join(panels)}
  </div>
</section>
'''

NAV_PANEL_ROWS = _nav_panel_rows()

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>The Penthouse — Paris Pullen</title>
<meta name="description" content="Inside the Penthouse at The Compliment. Every room a room you have just walked into.">
<meta name="theme-color" content="#0A0A0B">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/world.css">
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>

{SITE_HEADER}

{SITE_MENU}

<main>

<section class="room-pager" id="room-pager" aria-label="The rooms, in sequence" data-room-pager data-start-room="{START_ROOM}">
  <div class="room-pager__viewport" data-room-pager-viewport>
{"".join(floor_html(f) for f in PENTHOUSE_FLOORS)}  </div>
  <button type="button" class="room-pager__nav room-pager__nav--prev" data-room-pager-prev aria-label="Previous room"><span aria-hidden="true">&#8249;</span><span class="room-pager__nav-hint" data-room-pager-hint aria-hidden="true"></span></button>
  <button type="button" class="room-pager__nav room-pager__nav--next" data-room-pager-next aria-label="Next room"><span aria-hidden="true">&#8250;</span><span class="room-pager__nav-hint" data-room-pager-hint aria-hidden="true"></span></button>
  <button type="button" class="room-pager__nav room-pager__nav--up" data-room-pager-up aria-label="Floor up"><span aria-hidden="true">&#9650;</span><span class="room-pager__nav-hint" data-room-pager-hint aria-hidden="true"></span></button>
  <button type="button" class="room-pager__nav room-pager__nav--down" data-room-pager-down aria-label="Floor down"><span aria-hidden="true">&#9660;</span><span class="room-pager__nav-hint" data-room-pager-hint aria-hidden="true"></span></button>
  <div class="nav-panel" data-nav-panel>
    <button type="button" class="nav-panel__tab" data-nav-panel-toggle aria-expanded="false" aria-controls="nav-panel-grid">
      <span class="nav-panel__tab-label">Floors</span>
    </button>
    <div class="nav-panel__grid" id="nav-panel-grid" data-nav-panel-grid hidden>
    {NAV_PANEL_ROWS}
    </div>
  </div>
</section>

</main>

{SITE_FOOT}

<!-- The Play/Pause toggle (playpause-toggle), the Suite Remote (TV /
     Music / Cinema in one), and its fixed toggle pill are all injected by
     tv-remote.js's initSuiteRemote() -- one instance regardless of how
     many rooms have a screen. -->

<script src="assets/js/room-pager.js" defer></script>
<script src="assets/js/nav-panel.js" defer></script>
<script src="assets/js/world.js" defer></script>
<script src="assets/js/tv-remote.js" defer></script>
<script src="assets/js/guide-portal.js" defer></script>
<script src="assets/js/vault-entrance.js" defer></script>
<script src="assets/js/piano-player.js" defer></script>
</body>
</html>
'''

open("house.html","w",encoding="utf-8").write(html)
print(f"house.html written — {len(PENTHOUSE_FLOORS)} floors open ({len(FLOORS)} authored), {sum(len(f['arts']) for f in PENTHOUSE_FLOORS)} artifacts")
