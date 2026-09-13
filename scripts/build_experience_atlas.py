"""Build the local review landing page and the room-by-room design atlas."""
from pathlib import Path
import json, html, subprocess

ROOT = Path(__file__).resolve().parents[1]
rooms = json.loads(subprocess.check_output([
    'git', '-C', '/Volumes/HQ/Claude/paris-pullen', 'show', '3074605:data/house-rooms.json'
]))
open_rooms = {'bath','bedroom','closet','kitchen','penthouse-living','study','music-lounge','gym','cinema'}
concepts = {
 'skyline': ('Air, reflected water and a view that rewards attention.', {
  'pool':'A restrained ripple follows a single touch; pull back to see moving reflections on the surrounding surfaces. Offer still water when motion is reduced.',
  'parapet':'A slow horizon pan becomes a Charlotte observation deck. Select a visible district to enter the City Guide.',
  'cabana':'Draw a linen curtain aside to reveal a private event folio: partner, occasion, guest experience and enquiry. Keep the fourth cabana a narrative reveal, never a false availability claim.',
  'booth':'Slide into the corner booth and fan through a set of conversation cards, each opening a real collaboration story.'}),
 'penthouse-living': ('An inhabited salon: a journal to pick up, a screen to settle into, a collection left on a chair.', {
  'journal':'Lift the journal from the table into a paper reading spread. A bookmark keeps the route to the current published issue.',
  'vault':'Move toward the brass wheel; inspect the object before entering the existing fragrance world. Preserve sold-out and coming-soon states.',
  'candle':'An unlit vessel in a small exhibition frame, with launch status and the option to save it. Do not animate a flame on a product described as unlit.',
  'jacket':'A garment pulls away from the chair and becomes the first hanger in the Fashion Nova capsule. Show actual product images and verified links when supplied.',
  'oxknit':'A knit-focused OXKNIT folio with detail, fit and related appearances. Never reuse the Fashion Nova collection under this brand.'}),
 'bedroom': ('Private, slow and tactile. Interactions feel like a closer look, not a dashboard.', {
  'artwork':'A framed in-situ view with gradual zoom, provenance and a saved-object bookmark. Future artwork photography can replace the room crop without changing the interaction.',
  'chair':'A seated point of view toward the window becomes the quiet entry into Charlotte; the object story stays on a small material card.',
  'door':'The open doorway is an actual room transition. Keep the origin and destination aligned so returning feels like retracing a step.',
  'suit':'The laid-out suit opens the same garment rail as the Closet, ideally preselected to the exact item once its SKU is mapped.'}),
 'bath': ('A vanity tray becomes an evening ritual, with warmth rather than visual noise.', {
  '_new':'New Ritual Tray: choose Unwind, Reset or Return; the frame shifts gently toward the object. Future grooming, linen and fragrance selections sit in individual compartments, with real availability.'}),
 'closet': ('The visitor browses a physical rail and pulls a selected piece forward.', {
  'suits':'A horizontal garment rail with occasion filters, a selected-piece detail area and saved selections. Desktop scroll and mobile swipe browse the hangers; every item comes from the existing catalogue.',
  'shoes':'Cedar shelves slide laterally; selecting a pair lifts it onto a turntable with alternate photographs, construction and care notes. The preview uses the existing object story because no shoe catalogue was supplied.',
  'ties':'A valet drawer slides out. Ties fan by fabric and occasion; drag or tap a pairing beside the selected suit. Keep the current story until real tie products are mapped.'}),
 'kitchen': ('A cookbook on black marble, with recipe pages and a capsule hung over a chair.', {
  'hellofresh':'Open a linen-bound cookbook: five chapter tabs, animated page turns, ingredient checkboxes and a saved-recipe bookmark. Each finished spread should contain partner-approved photography, quantities, method, servings and ordering link. Preview content is labelled editorial.',
  'jacket':'Open the same Fashion Nova capsule from a different physical origin. Selection and saved state should belong to the collection, not be duplicated per room.'}),
 'study': ('Paper, brass and private reading: the desk is the interface.', {
  'monogram':'A close study of the mark opens a concise portrait folio with the real biography and a clear route to The Man.',
  'pullenlaws':'A numbered rulebook with marginalia and sealed leaves. Only publish actual supplied laws; do not manufacture the missing fourteen texts.',
  'journal':'A paper reading spread points to the current published Journal, with pencil-like bookmarks and a way back to the exact room.',
  'cocktails':'Six recipe cards in a leather index, with tactile next/previous turns and a route to the Kitchen. Full drink content is pending, so the preview preserves the existing story.',
  'map':'A brass-inlay travel map that zooms from Charlotte into the documented hosting tour. Only mark verified cities and collaborations.',
  'oxknit-study':'Open the OXKNIT capsule with the green cable knit as the context. Alternate product views and material closeups are the next asset requirement.'}),
 'music-lounge': ('A listening shelf, a record sleeve and controls that reflect actual playback.', {
  'recordplayer':'Lift a sleeve, inspect the collection, and control the room audio from a turntable. The disc rotates only while playback reports playing. Other selected records open Spotify explicitly, avoiding two simultaneous in-page players.',
  'polo':'A warm off-duty capsule on the same rail used in the Kitchen. Knit detail and styling should open from the garment itself.'}),
 'gym': ('A useful activity, approached like equipment in the room.', {
  'boxer':'Preserve the existing After Hours boxing game. Future rounds can start from a glove-lacing transition, with a clear start, pause, keyboard controls and a return to the gym. Equipment and training collaborations belong on a bench-side kit tray.'}),
 'cinema': ('A printed programme opens into the existing screening system.', {
  'posters':'A programme of current house selections, with thumbnails and direct screen entry. Selection uses the existing player state rather than creating a competing video. Future curtains open once, then disappear completely during playback.'}),
 'corridor': ('Transitions become discoveries, with real destinations behind doors.', {
  'door':'A brass handle, a narrow reveal of light, then a transition into an authored destination. Keep it closed until that destination exists.',
  'carpet':'A subtle directional pattern becomes a floor route, revealing the hotel map on tap instead of continuously moving under the visitor.',
  'lift':'A second elevator panel exposes the private route through the building, with clearly labelled unopened destinations.',
  'weeklydelivery':'Unpack a delivery tag into the same Kitchen cookbook. A single recipe source serves both artifacts.'}),
 'order': ('A ceremonial table with deliberate, sparse reveals.', {
  'twelfth':'Pull out the empty chair to reveal a sealed invitation story. A membership enquiry must state what is real before accepting information.',
  'table':'Explore individual place settings as stories of collaborators, one at a time, with verified names and contributions.',
  'lamps':'Tap a lamp to bring one document into light. The effect should reveal content, not just brighten the room.'}),
 'operations': ('Warm instrument panels and real work beneath smoked glass.', {
  'table':'A map under glass expands into an explorable collaboration case study with brief, decisions, assets and results.',
  'instruments':'Rotate a physical selector through real services. The panel changes material and content, while retaining a clear enquiry route.',
  'library':'Slide a dossier from the shelf; pages open into verified project histories and process notes.'}),
 'lab': ('Fragrance is explored through a working bench and material notes.', {
  'scales':'A balance changes the visual emphasis of scent families. Treat this as an editorial exploration, not a formula or manufacturing tool.',
  'blotters':'Fan paper blotters to reveal note families, source materials and verified fragrance descriptions.',
  'notebook':'Turn a perfumer’s notebook through dated development notes and approved photographs.',
  'bottles':'Select an unlabelled bottle to inspect an approved ingredient story; reveal the final fragrance route only where supported.'}),
 'haberdashery': ('Cloth, cut and texture are the primary navigation.', {
  'cloth':'Slide swatches along a brass track; a magnifier shows weave and a garment preview shows the selected cloth at scale.',
  'table':'Unfold a pattern to explain the making process in stages, with actual fitting or enquiry links.',
  'shoes':'A maker’s display with construction photographs, last shape and care details rather than an invented stock list.',
  'hiddendoor':'A panel opens toward the Armoury; match the material and camera direction across the transition.'}),
 'armoury': ('A collection cabinet: objects handled as design and history.', {
  'umbrellas':'An umbrella opens to reveal construction, weather use and a verified maker story.',
  'canes':'A handle rotates through supplied alternate views, with craft notes engraved on a small caption plate.',
  'sabres':'A museum-style case with historical and design interpretation, photographs and provenance.',
  'case':'Unlatch an exhibition case to reveal a curated object folio. Keep any unknown contents intentionally unrevealed.'}),
 'fitting': ('The room becomes a thoughtful fitting explainer.', {
  'mirrors':'Three synchronized views show a real garment from front, side and back; avoid presenting image switching as virtual body fitting.',
  'rails':'Browse saved garments on a second rail, keeping the selections made in the Closet.',
  'cuff':'A close-up comparison illustrates sleeve and cuff proportions with supplied fitting photographs.'}),
 'restaurant': ('The menu is a story of the meal and the people who made it.', {
  'corner':'A folded menu opens into a seasonal dinner concept and its collaborators, with honest enquiry rather than fabricated reservations.',
  'pass':'A plated dish comes into focus; turn its card for the recipe, chef and source collaboration.',
  'flowers':'An arrangement reveals stem selections, the floral partner and the occasion, like a small botanical album.'}),
 'bar': ('Glass, brass and small recipe cards, with a clear route back to dinner.', {
  'backbar':'Slide bottles along a shelf. Each label opens the producer story, tasting notes and an actual approved cocktail.',
  'ice':'Rotate a cut-ice photograph or supplied 3D object; show why the cut belongs to the drink.',
  'rail':'Follow the brass line into the evening’s menu and the Restaurant.',
  'banquette':'A leather billfold opens into a collaboration or event story, with photographs tucked inside.'}),
 'coffee': ('The same counter in a different hour: paper, steam and daylight.', {
  'counter':'A cup sets down beside a morning reading card and a real coffee partner profile.',
  'regulars':'A set of portrait postcards explores published interviews and collaborators, with consented photography.',
  'window':'The view becomes a morning route through verified Charlotte locations.'}),
 'lobby': ('A graceful arrival with the building’s geography made legible.', {
  'doors':'A short, skippable arrival reveals the lobby; returning visitors can enter directly.',
  'flowers':'A botanical folio introduces the floral collaboration, seasonal selections and installation story.',
  'water':'A single reflection responds to touch, then settles. Use it to lead the eye toward the desk.',
  'desk':'A keycard becomes the room directory and the visitor’s saved stay.',
  'ceiling':'A deliberate look upward reveals the architectural story, with a simple return to eye level.'}),
 'motor': ('A private garage where the vehicle, route and story stay connected.', {
  'bays':'Each vehicle is an exhibit with alternate photography, verified specifications and an associated drive story.',
  'lounge':'A motoring journal opens on the table: routes, events and automotive partnerships.',
  'lift':'A matched elevator transition takes the visitor from the garage to the suite without losing the chosen vehicle story.'}),
 'inventory': ('An archive that rewards pulling something from a shelf.', {
  'racks':'Slide archive trays by project, year or medium; each reveals actual campaign artifacts.',
  'ledger':'Turn a ledger through verified dates, collaborators and outcomes, with links to the source case studies.',
  'crates':'Open a labelled crate into a curated campaign collection. Unfinished work remains visibly unopened.'})
}
lines=['# The Compliment — interaction design atlas','','Local preview only. Deployment requires Paris’s approval.','',
'## What was checked','',
'Both public entry points were opened. All nine open rooms were traversed visually. The room, music and channel JSON, main CSS and core room/media JavaScript matched local commit 3074605 at the time checked. Both HTML pages differed only through Cloudflare email obfuscation; the links homepage matched byte-for-byte. This was a focused application-file comparison, not an exhaustive hash of all 1.1 GB of media.','',
'The working source changed during the audit. This preview was copied into its own directory and preserves the newer room removals and audio/cache edits present at copy time. The original repository was not changed by the finished redesign. The atlas retains the broader initially audited object inventory, including objects removed in that subsequent source revision.','',
'## What is working locally','',
'Garment rail with catalogue filters and saved selections; five-page editorial cookbook with ingredient checkboxes; framed object zoom; reading spreads; separate Fashion Nova and OXKNIT capsule previews; record shelf with real room-audio controls; programme selection using the existing TV player; nine-room directory; new bathroom Ritual Tray; browser-local saved stay; links-hub elevator floor selector and arrival animation.','',
'## What still needs content or a later build','',
'Complete partner-approved recipes, food and product photography, SKU mapping, stock/size data, ordering URLs, shoe/tie catalogue data, the six cocktail cards and full Pullen Laws. Unopened floors remain design concepts. No fake purchase, booking or subscription flow has been added. Provider playback depends on YouTube/Spotify availability and browser permissions.','',
'## Shared interaction rules','',
'Approach → inspect → explore → act → return. Zoom should originate at the chosen object. The room remains recognisable behind the experience. Horizontal touch gestures browse a collection; explicit controls provide the same route on keyboard. Escape returns focus. Only the current room is keyboard-active. Reduced-motion preferences remove page flips, record rotation and arrival doors. Saved selections are local to the browser. Real brand destinations remain clearly distinct from internal room portals.','']
cards=[]
for r in rooms:
    theme, mapping=concepts[r['id']]
    state='Open room' if r['id'] in open_rooms else 'Unopened · design concept'
    lines += [f"## {r['lvl']} · {r['name']} — {state}",'',theme,'','| Artifact | Intended experience |','|---|---|']
    arts=r['arts'] or [{'id':'_new','name':'The Ritual Tray (new)'}]
    rows=[]
    for a in arts:
        idea=mapping[a['id']]
        lines.append(f"| {a['name']} | {idea} |")
        rows.append(f'<div class="object"><h4>{html.escape(a["name"])}</h4><p>{html.escape(idea)}</p></div>')
    lines.append('')
    link=f'<a href="house.html#{r["id"]}">Explore the local room ↗</a>' if r['id'] in open_rooms else '<span>Not opened in the preview</span>'
    cards.append(f'<details><summary><span>{html.escape(r["lvl"])}</span><h3>{html.escape(r["name"])}</h3><small>{state}</small></summary><div class="detail"><p class="theme">{html.escape(theme)}</p>{link}{"".join(rows)}</div></details>')
(ROOT/'DESIGN-ATLAS.md').write_text('\n'.join(lines))
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Compliment · A closer look</title><style>
*{box-sizing:border-box}body{margin:0;background:#11150f;color:#e7dfc9;font:15px/1.7 Arial,sans-serif}a{color:inherit}header{padding:24px 6vw;display:flex;justify-content:space-between;border-bottom:1px solid #b2955933;font-size:10px;letter-spacing:.17em;text-transform:uppercase}.hero{display:grid;grid-template-columns:1fr 1fr;min-height:650px}.intro{padding:80px 6vw}.kicker{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#b4a276}h1{font:400 clamp(55px,6.8vw,100px)/.98 Georgia,serif;letter-spacing:-.055em;margin:25px 0}h1 em{color:#b5b88f}p{color:#bfc0ad;max-width:55ch}.hero-image{background:linear-gradient(90deg,#11150f,transparent 30%),url('assets/img/room-kitchen@sm.jpg') center/cover}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}.actions a{padding:13px 20px;border:1px solid #b9a574;text-decoration:none;font-size:12px}.actions a:first-child{background:#b9a574;color:#14180f}.content{max-width:1200px;margin:auto;padding:60px 30px}h2{font:44px/1.1 Georgia,serif;margin:15px 0 25px}.experiences{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:30px 0 65px}.experience{border:1px solid #a99e6a44;padding:24px;text-decoration:none;background:#1c2118}.experience b{display:block;font:27px Georgia,serif;margin:8px 0}.experience small{font-size:10px;letter-spacing:.13em;color:#b9a574}.experience p{font-size:13px}.status{padding:30px;background:#20271b;border-left:2px solid #a4af7e;margin:35px 0}.status p{max-width:none}.status b{color:#e3dbc6}details{border-bottom:1px solid #b3a67433}summary{display:flex;align-items:center;gap:24px;padding:24px 0;cursor:pointer}summary>span{font:30px Georgia,serif;width:55px;color:#ae9e72}summary h3{font:28px Georgia,serif;margin:0;flex:1}summary small{font-size:10px;letter-spacing:.05em;color:#9a9f89}.detail{padding:0 0 30px 80px}.theme{font:24px/1.45 Georgia,serif;color:#d4cfb8}.object{display:grid;grid-template-columns:180px 1fr;gap:25px;border-top:1px solid #a99e6a22;margin-top:22px;padding-top:10px}.object h4{font:20px Georgia,serif}.object p{max-width:none;font-size:14px}.note{font-size:12px;color:#919980}.experience:hover{background:#2a3122}footer{padding:40px 6vw;border-top:1px solid #b2955933;color:#969f86;font-size:12px}a:focus-visible,summary:focus-visible{outline:2px solid #d7c78b;outline-offset:5px}@media(max-width:760px){.hero{grid-template-columns:1fr;min-height:0}.intro{padding:55px 25px}.hero-image{height:240px;grid-row:1}.experiences{grid-template-columns:1fr}.content{padding:35px 25px}summary{gap:12px}summary h3{font-size:22px}summary small{max-width:90px}.detail{padding-left:0}.object{grid-template-columns:1fr;gap:0}.object h4{margin-bottom:0}}
</style></head><body><header><span>Paris Pullen · The Compliment</span><span>Private local preview · 13 September 2026</span></header><main><section class="hero"><div class="intro"><div class="kicker">The house, reimagined through its objects</div><h1>Come a<br>little <em>closer.</em></h1><p>A garment pulled from a rail. A page turned on the kitchen counter. A record chosen for the room. Every object becomes a reason to stay.</p><div class="actions"><a href="house.html#kitchen">Enter the hotel ↗</a><a href="links/">Try the arrival hub ↗</a></div><p class="note">Built locally for review. Nothing has been deployed.</p></div><div class="hero-image" role="img" aria-label="The Kitchen in The Compliment"></div></section><section class="content"><span class="kicker">Touch, turn, pull, play</span><h2>Start with an object.</h2><div class="experiences"><a class="experience" href="house.html#closet"><small>28 · THE CLOSET</small><b>Pull a hanger.</b><p>Browse the garment rail by occasion, inspect a selection and save it to your stay.</p></a><a class="experience" href="house.html#kitchen"><small>27 · THE KITCHEN</small><b>Turn the page.</b><p>Tap The Delivery for a five-chapter cookbook with tactile pages and a checklist.</p></a><a class="experience" href="house.html#music-lounge"><small>26 · THE MUSIC LOUNGE</small><b>Choose a record.</b><p>Pull a sleeve from the listening shelf and control the room’s own soundtrack.</p></a><a class="experience" href="house.html#cinema"><small>26 · THE CINEMA</small><b>Settle into the screen.</b><p>Tap The Posters for the house programme, then open a selection in the existing player.</p></a><a class="experience" href="house.html#bedroom"><small>28 · THE BEDROOM</small><b>Study the detail.</b><p>A framed view of the artwork, with closer inspection and an easy return to the room.</p></a><a class="experience" href="house.html#bath"><small>28 · THE BATHROOM</small><b>Leave the day behind.</b><p>A new Ritual Tray: choose Unwind, Reset or Return, then follow the evening.</p></a></div><div class="status"><b>The review boundary</b><p>The nine open rooms work in the local preview. The fourteen unopened rooms below have individual interaction directions. Partner product photography, complete approved recipes, exact SKU mapping and shopping URLs remain content requirements. The cookbook and capsule cards are clearly marked as previews.</p><p>The live application files matched the checked local revision during the audit. Later concurrent room/audio edits were preserved in this isolated preview. The original repository and deployment workflow are untouched.</p><a href="DESIGN-ATLAS.md">Read the full audit and interaction rules ↗</a></div><span class="kicker">Every room. Every authored object.</span><h2>The design atlas.</h2>'''+''.join(cards)+'''</section></main><footer>Local design review · Use the bottom-right Floors button for rooms, objects and saved selections. The existing arrows still move through the hotel.</footer></body></html>'''
(ROOT/'review.html').write_text(page)
print(f'Built review.html and DESIGN-ATLAS.md: {len(rooms)} rooms, {sum(len(r["arts"]) for r in rooms)} existing artifacts plus a new bathroom ritual.')
