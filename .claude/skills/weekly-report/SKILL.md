---
name: weekly-report
description: Generate parispullen.com social content — The Weekly Report (a branded carousel/Stories slide set recapping several Journal posts, plus IG/Threads/Facebook/TikTok captions), a per-entry Hook/Pain Point/Payoff 3-slide carousel for a single post, or a "What Is This Site" explainer carousel introducing the whole site (Penthouse, City, Journal, Boutique, Fragrance, The Man). Use when the user asks for a weekly report, a carousel or Stories recap of recent Journal posts, social slides/captions for new Journal entries, a hook/pain-point/solution-style promotional carousel, or a carousel/Stories set that explains/promotes/shares what the site is and what's in it.
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

A third content shape: `generate_explainer.py` builds a site-orientation carousel — cover, one slide per major section of the site, a closing "start here" slide — for when the ask is to promote/explain/share what parispullen.com *is*, not to recap or promote specific Journal posts. Built 2026-09-14 covering all six sections in the site's own nav (`index.html`'s `.menu__list`): The Penthouse, The City, The Journal, The Boutique, UR Welcome (the fragrance), The Man.

**One carousel, not several — a deliberate call.** When first asked whether this should be one post or many, the answer was one 8-slide carousel covering every section at a glance, rather than fragmenting into six separate single-topic posts. Reasoning: an audience meeting the brand for the first time needs one clear "here's everything" orientation before separate deep-dive posts (e.g. a future Penthouse-only walkthrough, or a Boutique-only lookbook) would make sense — those are legitimate follow-up content, not a replacement for a single overview. Revisit this call if the site gains enough sections that eight-plus slides starts to feel padded.

- Unlike the other two generators, each section slide's background is a **real, freshly-captured screenshot of that section's own live page** (via the same headless-Chrome technique the other generators use for their closing slide) — not a Journal post's hero image. This means the carousel always shows what the site actually looks like, and it needs real copy pulled from each page's own hero/lede text (don't invent facts like "560 pieces" or "75 verified listings" — read them off the live page first).
- Copy `explainer.example.json` for the config shape: `cover` (same shape as weekly-report's), `sections[]` (one per site destination: `key`, `url_path`, `eyebrow`, `headline`, `sub`, optional `focal`/`capture_height`), and `closing` (points at whichever page makes the best "start here" background — `journal.html` worked well since it's visually rich and has a MENU link visible top-right for the "tap here" pointer).
- **The `capture_height` + `focal` combo matters more here than in the other generators**, because a page's own hero text can land inside the frame and visually fight this carousel's overlay text. The City section is the clearest example: charlotte.html's real H1 ("A Gentleman's Guide") sits at the top of the page, so `generate_explainer.py` captures it at `capture_height: 3200` (much taller than the slide itself) and crops in with `focal: "center 100%"` (bottom-anchored) to land on the city map further down the page instead, where there's no competing headline. If a future section's page has its key visual up top with no competing text, no `capture_height` override is needed.
- A stronger `topscrim` than the other two generators (opacity .95 at the very top, versus .6) exists specifically to hide the real page's own header row — every section screenshot includes the live site's actual wordmark + nav, which would otherwise visibly double up against this carousel's own `WORDMARK_HTML`.
- `cover_slide()` in `generate.py` gained a `cover.tag` config option (was hardcoded to `"THE JOURNAL"`) so this generator's cover can say `"PARISPULLEN.COM"` instead — pass it explicitly; weekly-report's own config doesn't need to since the old hardcoded value is still the default.

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
