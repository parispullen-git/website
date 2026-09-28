# Journal Podcast Playbook

How to turn one Journal entry into a companion podcast episode. Follow this
exactly — it is the quality bar for every entry, set by the first three proof
episodes (Law 001, Blueprint Book 01, The One Call, all generated 2026-09-28).

## Cast (pinned — never change)

- **Foxx** = `avocado_v2:magnus` (Boomy Mountain — deep, regal British). Agent Foxx,
  always spelled **Foxx** (two x's), never "Fox". The operator. Dry wit, runs the numbers.
- **Paris** = `avocado_v2:miles` (Satiny Moon — deep, soothing American). Paris himself,
  first person. The taste, the standard, the call.

Two voices only. Never add a third speaker.

## Format (the v2 reference)

Read `~/workspace/your_files/voice-memos/the-operator-episode-script-v2.txt`
before writing — that's the tone. Structure every episode the same way:

1. **Cold open banter** (2–4 turns): Foxx frames the entry, Paris gives the
   one-line why-it-matters. Real process details welcome — how the entry got
   made, what got rejected, what Paris actually said in the brief.
2. **Read-through with commentary**: walk the entry's key sections in order.
   Foxx reads or tees up a passage (mark quotes with "Quote." then the line),
   Paris reacts — the story behind it, what it cost, what it means. Jokes,
   laughter, and side commentary go BETWEEN passages, never inside a quote.
   Ground every beat in the entry's actual content — no invented facts.
3. **Close** (2–3 turns): the entry's closing line or thesis, restated spoken.
   End on Paris's voice when the entry ends on his.

Target length: 5–9 minutes (~650–1,100 words at ~130 wpm).

## Script rules (TTS reads it verbatim)

- Label turns `Foxx:` / `Paris:` exactly.
- Numbers spelled out: "three hundred and sixty six", "thirty eight", "nine P M".
- Years: "twenty twenty six". Times: "six thirty in the morning".
- URLs simplified: "parispullen dot com". No raw URLs, no markup, no emoji,
  no stage directions, no citation numbers, no `---` separators.
- Complete grammatical sentences. Occasional short punch lines are fine
  ("Free. He's serious. Go get it.") but never string fragments together.
- Brand canon: "A man is M.A.D.E. by what he takes ownership of."
  "Compliment" never "Complement". Paris Pullen, never "Paris Portland".

## Steps per entry

1. Read the entry: `data/journal.json` (title, stand, vol, catlabel) AND the
   full markdown draft under
   `~/workspace/goals/diary-of-a-ceo-journal-articles/files/journals/`
   (fallback: `~/workspace/your_files/journals/`).
2. Write the script to
   `~/workspace/your_files/voice-memos/journal-<slug>-script.txt`.
3. Write a topics file (bullets: entry slug, format, key beats, series id)
   to `~/workspace/your_files/voice-memos/journal-<slug>-topics.md`.
4. Generate:
   ```sh
   podcast-helper generate \
     --script ~/workspace/your_files/voice-memos/journal-<slug>-script.txt \
     --title "<Entry title> — Paris and Foxx Talk It Through" \
     --description "<one sentence on the entry>" \
     --speaker Foxx=avocado_v2:magnus \
     --speaker Paris=avocado_v2:miles \
     --series-id journal-entries \
     --cover-prompt "editorial magazine style, <entry-themed scene>, cinematic" \
     --topics-file ~/workspace/your_files/voice-memos/journal-<slug>-topics.md
   ```
5. Copy the returned MP3 to `assets/audio/journal-<slug>.mp3` (in the checkout).
6. Rebuild the journal (`python3 build_journal.py`) so the article page picks up
   the player, and verify the `<audio>` tag is present on `journal-<slug>.html`.
7. Never publish. No `--publish`, no Spotify upload — distribution is a
   separate, Paris-approved step (see below).

## Cover prompt convention

Always: `editorial magazine style, <one entry-themed scene>, cinematic`.
Examples: Law 001 → "a commanding gentleman silhouette in dramatic light,
law book and brass lamp"; Blueprint → "navy three piece suit on a tailor's
form in a luxury closet, warm light"; Druski → "vintage microphone and stage
spotlight in warm tones".

## Backfill / daily rule

- Entries are processed oldest-first, max 3 per run, until every published
  entry in `data/journal.json` has `assets/audio/journal-<slug>.mp3`.
- Skip drafts (`status: "draft"` in journal.json).
- After the backfill completes, each run handles only newly published entries
  with no audio file.

---

## Distribution (FUTURE — do not execute without Paris's explicit go-ahead)

### RSS feed (public — needs his consent)

```sh
podcast-helper publish --slug <episode-slug> --feed-title "The Journal — Paris Pullen"
```

Published episodes are **public** — anyone with the feed link can listen.
First publish: present the RSS feed URL as copyable code (never a clickable
link) plus the Apple Podcasts / Overcast / Pocket Casts subscribe links.
One feed for the whole series; reuse the exact feed title every time.

### Spotify (blocked — needs his action first)

```sh
podcast-helper save-to-spotify --slug <episode-slug> --new-show "The Journal — Paris Pullen"
```

As of 2026-09-28 this returns **401 not connected**. Paris must connect
Spotify in **Settings → Connections → Spotify** first, then confirm the show
name before anything is uploaded. Uploads write to his account — confirm
title, show, and summary with him first, every time.
