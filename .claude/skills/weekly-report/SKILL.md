---
name: weekly-report
description: Generate parispullen.com social content — The Weekly Report (a branded carousel/Stories slide set recapping several Journal posts, plus IG/Threads/Facebook/TikTok captions), a per-entry Hook/Pain Point/Payoff 3-slide carousel for a single post, a "What Is This Site" explainer carousel introducing the whole site, or a full Penthouse walkthrough (every open room, every artifact). Use when the user asks for a weekly report, a carousel or Stories recap of recent Journal posts, social slides/captions for new Journal entries, a hook/pain-point/solution-style promotional carousel, a carousel/Stories set that explains/promotes/shares what the site is, or a room-by-room/artifact-by-artifact walkthrough of the Penthouse.
---

# The Weekly Report

A recurring social package for parispullen.com: a branded slide set recapping the week's new (or newly-updated) Journal posts, delivered as downloadable PNGs, plus platform captions. Built this pattern first on 2026-09-14 for the iPhone 18 / Artificial / The Social Reckoning / Habitus batch — this skill generalizes it.

## What it produces

- **Cover slide** — "The Weekly Report" eyebrow, a Playfair headline teasing the week, one line stitching the stories together.
- **One slide per post** — hero image full-bleed, category eyebrow, headline, one-line hook (from the post's own standfirst), "Read the full story" / "Swipe up" cue.
- **Closing "navigate" slide** — a real screenshot of the live journal.html grid with a hand-drawn arrow pointing at the JOURNAL nav item ("Tap here"), so anyone who only sees this on social knows exactly where to go.
- Every slide is branded with the real brand mark — the interlocking double-P monogram (`assets/img/monogram-mark.svg`, the same one the live site masks white in the header and the gate) inlined and tinted ivory, next to "PARIS PULLEN" — not a placeholder.
- Two formats: **carousel** (1080×1350, 4:5 — IG/Threads/Facebook feed) and **story** (1080×1920, 9:16 — IG/FB Stories, TikTok).
  - Story format only: each post slide carries a "Tap here ↓" up in the top-right, right under "THE WEEKLY REPORT" — that's where to drop the link sticker when posting, since Instagram/TikTok don't support a real embedded link in the image itself. Carousel format keeps a plain "Read the full story →" text line instead (a feed carousel's own swipe is the navigation, no sticker needed).
  - Story format only: the top row (mark + wordmark + tag) and the bottom row (footer) both sit 20px further from their edges than carousel's do, clearing Stories/TikTok's own overlay chrome (the profile-pic/close-button strip up top, the reply-bar strip at the bottom).
- Captions for **Instagram, Threads, Facebook, and TikTok** — written separately each time (see Voice below), not templated, because the hook needs to be specific to that week's actual stories.

## How to run it

1. **Start the local preview server first** — the closing slide screenshots the *live* journal.html, so it needs to be running and reflecting current `data/journal.json` (rebuild with `python3 build_journal.py` first if you just changed anything). From Claude Code: `preview_start name:"parispullen"` (port 4330). From a plain terminal: `python3 -m http.server 4330` from the repo root.

2. **Pick this week's posts** and write a config JSON (copy `week.example.json` as a starting point):
   - `cover.headline_html` / `cover.sub` — write these fresh each week; they're the thesis of the report, not boilerplate. `<br>` for line breaks, `<em>` for the brass-colored emphasis word.
   - `posts[]` — one entry per slug, in slide order. `headline` and `focal` are optional overrides:
     - Add `headline` when the post's real title is too long for a slide (it truncates at the first `:` by default, which is often enough on its own).
     - Add `focal` (a CSS `background-position` value like `"center 30%"`) when the hero image's important content isn't centered.
     - Add `image_override` (an image filename stem from `assets/img/`, no extension) when the article's hero doesn't work as a single-subject slide — e.g. a multi-panel/triptych hero reads better as one of the post's inline `images[]` cropped to a solo portrait. This happened with The Social Reckoning: the hero is a 3-panel cast triptych, but `press-social-reckoning-zuckerberg` (one of the inline images) crops far cleaner at 4:5/9:16.
   - `nav.headline` / `nav.sub` — usually stays close to "Open Journal on parispullen.com" / "Every story above is live right now" unless the CTA needs to change (e.g. pointing at a specific post instead of the whole grid).
   - `series_tag` (optional, top-level, default `"THE WEEKLY REPORT"`) — the label shown top-right on every post slide, under the mark. Change it when the post isn't reads as `"THE WEEKLY REPORT"` — Paris asked for a combined "this week + catch up on last week" report in one 8-post set rather than two separate posts, which is why `week.example.json` currently carries all 4 + the prior week's 4 under one `series_tag`/cover rather than a second config file. A dedicated "catch up" post with its own `series_tag` (e.g. `"CATCH UP ON"`) is still the right call if a week's new output is small enough that a combined set would feel padded.
   - The post count isn't fixed at four — `posts[]` can hold however many stories belong in the set; slide numbering (`i / total`) and the cover/nav copy just need to match (say "eight things," not "four," if there are eight).

3. **Generate the slides:**
   ```bash
   python3 .claude/skills/weekly-report/generate.py \
     --config /path/to/week.json \
     --format both \
     --out /path/to/output-dir
   ```
   `--format carousel` or `--format story` to build just one. Output lands in `<out>/carousel/` and `<out>/story/`, numbered `1-cover.png` ... `N-navigate.png`. Put the output dir *outside* the paris-pullen git repo (e.g. `/Volumes/HQ/Claude/weekly-reports/<date>/`) — these are one-off social assets, not site source, and shouldn't show up in `git status` for the site.

4. **Spot-check 2-3 slides** (Read the PNG files) before delivering — confirm hero crops aren't cutting off faces, text isn't overlapping a busy part of the image, and the nav slide's pointer is actually landing near the JOURNAL link (it assumes the standard site header layout; re-check if the header ever changes).

5. **Write captions.** Don't template these — pull the actual week's hooks and write four short, platform-shaped passes:
   - **Instagram**: hook line + short body + 5-10 relevant hashtags.
   - **Threads**: conversational, shorter, little to no hashtags.
   - **Facebook**: a bit more descriptive, one-line-per-story bullet list reads well here.
   - **TikTok**: punchiest, emoji-friendly, hashtags carry more discovery weight.
   
   Voice: first-person Paris, confidently cocky, charming, personal — see the `journal-voice-first-person` memory. These are posts *about* the Journal entries, written the same way Paris would text a friend "new one's up, here's why you should read it," not neutral announcement copy.

6. **Deliver** the PNGs (both formats if built) plus a `captions.md` via SendUserFile.

## Per-entry Hook / Pain Point / Payoff carousels

A second, different content shape lives in the same skill: `generate_beats.py` builds a **3-slide carousel per Journal entry** — Hook, Pain Point, Payoff — instead of the Weekly Report's multi-entry recap shape. Same visual system (monogram, Playfair + Inter, ink/charcoal/brass, the same `topscrim` legibility fix), different structure and a different reason to exist: one post promoting one article with a direct-response beat, versus one post recapping several.

- Copy `beats.example.json` for the config shape: `entries[]`, each with `slug`, `short_title` (shown top-right on all 3 of that entry's slides, in place of a series tag), optional `focal`/`image_override` (same meaning as the weekly-report config), and the three required beats — `hook`, `pain`, `solution`. These need real thought each time, not a formula: the hook is the line that stops the scroll, the pain point names the specific hesitation or fear the reader already has (not a generic one), and the solution is the concrete payoff of reading the piece — not "read more," but what they actually walk away with.
- Run: `python3 .claude/skills/weekly-report/generate_beats.py --config beats.json --format both --out <dir outside the repo>` (same local-server requirement as `generate.py`, though this script doesn't screenshot the site — it only reads `data/journal.json` for each entry's hero image).
- Output: `<out>/<format>/<slug>/1-hook.png`, `2-pain.png`, `3-solution.png` — one subfolder per entry, so each entry's 3-slide set can be posted as its own carousel.
- Only the payoff (3rd) slide carries a call to action — "Tap here" on Stories, "Read the full story" on carousel — since the hook and pain-point slides exist to earn the swipe, not to sell yet.
- Captions for this format follow the same beat logic, written fresh per entry (not templated): lead with the hook line or a tightened version of it, name the pain point in the reader's own words, and close on the payoff plus the link.

## "What Is This Site" explainer carousel

A third content shape: `generate_explainer.py` builds a site-orientation carousel — cover, one slide per major section of the site, a closing "start here" slide — for when the ask is to promote/explain/share what parispullen.com *is*, not to recap or promote specific Journal posts. Built 2026-09-14 covering the six sections in the site's own nav (`index.html`'s `.menu__list`: The Penthouse, The City, The Journal, The Boutique, UR Welcome, The Man) **plus two mechanic-focused slides that aren't in the nav at all** — Artifacts and Getting Around — added after Paris pointed out the first cut only showed *what's in* the Penthouse, not *how you interact with it*. Those two use `house.html#closet` (artifact hotspots visible, real facts like "twelve navy suits, two tuxedos" pulled straight from that room's own DOM content) and `house.html#penthouse-living` (the room-to-room arrows and floor up/down buttons are visible in that exact screenshot already, no extra staging needed) as their `url_path` — a reminder that a page's interaction chrome showing up in a plain screenshot is often enough; you don't need to fake a UI or catch a mid-click state.

**One carousel, not several — a deliberate call.** When first asked whether this should be one post or many, the answer was one 8-slide carousel covering every section at a glance, rather than fragmenting into six separate single-topic posts. Reasoning: an audience meeting the brand for the first time needs one clear "here's everything" orientation before separate deep-dive posts (e.g. a future Penthouse-only walkthrough, or a Boutique-only lookbook) would make sense — those are legitimate follow-up content, not a replacement for a single overview. Revisit this call if the site gains enough sections that eight-plus slides starts to feel padded.

- Unlike the other two generators, each section slide's background is a **real, freshly-captured screenshot of that section's own live page** (via the same headless-Chrome technique the other generators use for their closing slide) — not a Journal post's hero image. This means the carousel always shows what the site actually looks like, and it needs real copy pulled from each page's own hero/lede text (don't invent facts like "560 pieces" or "75 verified listings" — read them off the live page first).
- Copy `explainer.example.json` for the config shape: `cover` (same shape as weekly-report's), `sections[]` (one per site destination: `key`, `url_path`, `eyebrow`, `headline`, `sub`, optional `focal`/`capture_height`), and `closing` (points at whichever page makes the best "start here" background — `journal.html` worked well since it's visually rich and has a MENU link visible top-right for the "tap here" pointer).
- **The `capture_height` + `focal` combo matters more here than in the other generators**, because a page's own hero text can land inside the frame and visually fight this carousel's overlay text. The City section is the clearest example: charlotte.html's real H1 ("A Gentleman's Guide") sits at the top of the page, so `generate_explainer.py` captures it at `capture_height: 3200` (much taller than the slide itself) and crops in with `focal: "center 100%"` (bottom-anchored) to land on the city map further down the page instead, where there's no competing headline. If a future section's page has its key visual up top with no competing text, no `capture_height` override is needed.
- A stronger `topscrim` than the other two generators (opacity .95 at the very top, versus .6) exists specifically to hide the real page's own header row — every section screenshot includes the live site's actual wordmark + nav, which would otherwise visibly double up against this carousel's own `WORDMARK_HTML`.
- `cover_slide()` in `generate.py` gained a `cover.tag` config option (was hardcoded to `"THE JOURNAL"`) so this generator's cover can say `"PARISPULLEN.COM"` instead — pass it explicitly; weekly-report's own config doesn't need to since the old hardcoded value is still the default.

## Full Penthouse walkthrough

A fourth content shape, and a different scale from the other three: `generate_walkthrough.py` builds a room-by-room, artifact-by-artifact carousel of the **entire** Penthouse — not a curated highlight reel, every currently-open room and every artifact in it. Built 2026-09-15 after Paris asked for a walkthrough "not limited to slides" — i.e. don't cap the count, cover everything real.

- **No manual per-slide config.** It reads `data/house-rooms.json` directly (the same file `build_house.py` bakes into `house.html`) and generates one room slide + one slide per artifact, automatically, for every room in `_PENTHOUSE_ORDER` (mirrored exactly from `build_house.py` — only Levels 26-28 are open to the public right now; the other 14 rooms authored in that data file aren't built into the live site, so "the whole Penthouse" means this 9-room set, not all 23 rows in the file). As of the first run: 9 rooms, 20 artifacts, 31 slides total with cover + closing. If a room gets added to `_PENTHOUSE_ORDER` in `build_house.py`, mirror that change here — the two lists are meant to always match.
- Room copy is that room's own `note` field (already a real standfirst, no rewriting). Artifact copy is that artifact's own `desc` field, run through a `trim()` helper that cuts to the last complete sentence under ~185 characters rather than a mid-sentence ellipsis — the source text is already written in complete, self-contained sentences, so this rarely needs a hard cut.
- **Artifact slides reuse their room's own photo**, just re-centered via `background-position` on that artifact's own `x`/`y` hotspot coordinate — the same coordinate the live site's interactive hotspot dot sits at. No new photography, just a "look here" pan across the existing shot. This only works because the room photos are plain interior photography with no UI baked in (unlike `generate_explainer.py`'s live-site screenshots) — a lighter scrim than that generator uses is enough, no `topscrim` needed.
- Only the closing slide screenshots the live site (`house.html`, for the real MENU nav + "tap here" pointer, reusing `closing_slide` from `generate_explainer.py`) — everything else is a local asset file, so most of this generator's captures are fast and have no font-race or hang risk at all.
- Optional `--cover-json` overrides the default cover/closing copy (see `walkthrough-cover.example.json`) — the room and artifact slides in between are never hand-authored.
- **Platform math this format actually needs, unlike the other three:** 31 slides is well past Instagram's and Facebook's feed-carousel cap (currently 20 images) — a Stories sequence has no such limit (each slide just posts as its own Story), but a feed carousel this size has to split into two posts (e.g. Part 1: Levels 28-27, Part 2: Level 26 + closing) or get trimmed. TikTok's photo-carousel cap (35) comfortably fits the whole thing in one post. Check current platform limits before assuming this number is still safe — they change.

## Always deliver an editable Artifact alongside the PNGs

Standing rule (added 2026-09-15, Paris: "always make our carousels and stories into editable artifacts so i can tweak before we post"): every carousel/Stories set from **any** of the four generators ships with an editable Artifact, not PNGs alone. He wants to tweak copy himself and see it, not describe wording changes in chat and wait for a full regeneration.

`editable-carousel-template.html` in this folder is the reusable page — copy it, don't rebuild it each time. It renders every slide as a card at its real aspect ratio (background photo + the site's own type/color tokens) with the copy fields as `contenteditable` — click text, edit, click away, autosaves. Workflow after any generator run:

1. **Compress preview images.** The editor doesn't need full-resolution PNGs — `sips -Z 480 -s format jpeg -s formatOptions 72 in.png --out out.jpg` per slide keeps a 30+ slide set's total upload well under a megabyte or two, fast to upload and fast to load in the browser. The final PNGs stay full-res and untouched; this is a preview-only copy.
2. **Publish the template** (`Artifact`, `file_path` = your copy of `editable-carousel-template.html`) with `capabilities: {db: {}, assets: {}}` — both, even though the page's own runtime only calls `db`: `assets` has to be declared for the *tool's* `upload_asset` action to work at all, or every upload rejects `capability_disabled`.
3. **Upload every preview image** via `action: "upload_asset"` against that URL — batch several `Artifact` calls in one message (they run in parallel; a 31-image set went in 4 batched turns). Each upload returns a `/_blob/<id>` URL — collect these.
4. **Seed the database in one batch write** (`action: "write_db"`, `db_op: "batch"`, up to 50 writes per call): collection `slides`, one doc per slide, `doc_id` matching the slide's own filename stem for traceability, `data` = whatever fields that generator uses (`eyebrow`/`headline`/`sub` at minimum) plus `order`, `group` (for the template's grouping headers), `kind`, and `imgUrl` set to the uploaded blob URL from step 3.
5. **Replace the template's `FALLBACK_SLIDES` example array with the real seed data** (same shape as the db docs, including `id`) before publishing — the page renders this immediately so it's never blank while `db` resolves, and stays usable read-only if `db` ever fails to grant. Keep this and the db seed in sync; they're meant to describe the same slide set from two different scripts (Python `json.dump` of the same write list works well for generating both from one source).
6. **Give Paris the artifact link.** When he says he's done editing, `action: "read_db"` (`db_op: "get"` per doc, or list the whole `slides` collection) to pull the final copy, then re-run the relevant generator's slide-building function with the edited text to produce the final full-resolution PNGs — never ask him to retype changes back in chat.

**Two real API bugs already hit and fixed in the template, worth knowing if you touch its JS again:** `DocumentSnapshot.data` is a **method** (`d.data()`), not a property — spreading `d.data` (no call) silently produces nothing. And `collection.get()` takes **no arguments** — `limit` is a query-builder method chained *before* `get()` (`db.collection('slides').limit(100).get()`), not an options object passed to it. Both are easy to get wrong from the capability skill's prose alone; the type definitions (`db.d.ts`, loaded via the `artifact-capabilities` skill) are authoritative over remembered shape.

## Design system reference

Pulled directly from `assets/css/world.css` so slides match the live site exactly — don't reinvent these:

| Token | Value |
|---|---|
| `--ink` (page background) | `#101012` |
| `--charcoal` | `#17171A` |
| `--graphite` | `#33333A` |
| `--ash` | `#71717C` |
| `--bone` | `#DBD5C9` |
| `--ivory` | `#F3F0EA` |
| `--brass` | `#A8874E` |
| `--brass-lit` | `#C9A961` |
| Display font | `"Playfair Display"` (headlines) |
| Body/label font | `"Inter"` (hooks, body) |
| Mono font | `ui-monospace,Menlo,monospace` (eyebrows, category tags, footer labels — always uppercase + letter-spaced) |

If the site's palette or type ever changes, re-pull these values from `assets/css/world.css` rather than trusting this table blindly.

## Notes on the generator script

`generate.py` is self-contained: no dependencies beyond Python 3's standard library and a local Google Chrome install (used headless for both the live-site screenshot and the slide rendering — `--headless --window-size=W,H --screenshot=out.png file.html`). It reads post metadata (title, standfirst, category, hero image) live from `data/journal.json`, so slide copy for the hook line always matches whatever's actually published — you only write the cover/nav copy and any per-post overrides.

If Chrome isn't at the default macOS path (`/Applications/Google Chrome.app/...`), edit the `CHROME` constant at the top of `generate.py`.

**Monogram gotcha:** the brand mark is inlined from `assets/img/monogram-mark.svg`, whose root `<svg>` tag carries `fill-rule="evenodd"` — that's what punches the two bowl counters and the center sliver out as actual holes rather than solid fill. `MONOGRAM_INNER` strips the original root tag (so it can be re-wrapped at whatever size the slide needs), which means `fill-rule="evenodd"` has to be re-added explicitly on the wrapper `<svg>` in `WORDMARK_HTML` — drop it and the mark renders as a solid blob with faint stroke-like remnants where the holes should be. If the monogram source SVG ever changes, re-check whether it still needs this attribute.

**Voice:** Paris's stated principle for this account is "we share, we don't teach" — cover copy reads like a personal aside ("eight things that caught my attention"), not an editorial pitch ("eight things worth your attention"). Keep that in mind for every cover/nav rewrite, not just captions.

**Web-font race condition, and why `chrome_screenshot()` takes a `wait_for_fonts` flag:** capturing our own generated slide HTML (`file://...`) waits on `--run-all-compositor-stages-before-draw --virtual-time-budget=4000` by default (`wait_for_fonts=True`). Without it, `--screenshot` can fire before the Google Fonts CSS + woff2 files a slide references finish downloading, and Chrome silently falls back to a system serif/sans for that one capture — no error, just wrong-looking type and off spacing (line-height and letter widths differ between Playfair Display/Inter and their fallbacks) on a slide that looks fine on the next run.

But that same flag combo hangs for minutes (not seconds) when pointed at a **live site page that embeds something with a persistent connection** — `house.html`'s Living Room has a real YouTube iframe that never reaches network-idle, and virtual-time-budget waiting on that has caused multi-minute hangs in practice, not just a slower capture. So every call that screenshots the live site (`generate.py`'s nav-slide shot, every `generate_explainer.py` section/closing shot) passes `wait_for_fonts=False` explicitly — those captures are just background photos, not text we're rendering ourselves, so font-load precision doesn't matter for them anyway. `chrome_screenshot()` also always runs under a hard `timeout=45` now regardless of the flag, so a future hang fails loudly in under a minute instead of sitting there silently. If you add a new call site that screenshots a live URL (not a `file://` path to our own HTML), pass `wait_for_fonts=False` — the default is meant for our own slides only.
