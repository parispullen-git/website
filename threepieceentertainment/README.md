# Three Piece Entertainment — website

Static site, no build step. `index.html` is the company site; `harvey.html` is
Harvey's artist page baked in at `/harvey`.

```
index.html          Three Piece Entertainment (buyer-facing)
harvey.html         Harvey Cummings II (audience-facing)
assets/style.css    shared design system
assets/app.js       events, nav, reveal, newsletter, now-playing
assets/favicon.svg  Three Piece mark
assets/img/         imagery
assets/audio/       drop chicken-day.mp3 here to switch the player on
```

## The two-brand split

Per the brand architecture doc, the two brands do different jobs and this build
keeps them distinct even though they share a domain:

- **index.html — buyers.** "I want to hire that." CTAs: Book Us / Subscribe.
  Services, credibility, partners, booking inquiry.
- **harvey.html — audience.** "I want to attend that." CTAs: Listen / Join the
  list / Follow. Story, music, legacy, social.

Keep new content on the side that matches its job. If Harvey's audience material
outgrows one page, that page is the seed for a standalone harveycummings.com.

## Updating events

Edit the `EVENTS` array at the top of `assets/app.js`. Dates on/after today go to
**Events**; older ones fall into **Recent highlights** automatically. Set
`ticket` to a URL to turn "Enquire" into "Tickets".

**⚠️ The two future dates are placeholders** — replace before launch. The two past
entries (Carolina Theatre D'Angelo tribute, Middle C Jazz Jazz Day) are verified.

## Before launch — open items

1. **Newsletter is front-end only.** `#news-form` fakes a success state. Wire it
   to the real ESP (Mailchimp/Klaviyo/Beehiiv) — email capture is a top-line
   success metric in the brand doc, so this is the highest-value fix.
2. **Booking form posts via `mailto:`.** Point it at Formspree/Netlify Forms so
   inquiries don't depend on the visitor's mail client.
3. **Now-playing player is hidden** until `assets/audio/chicken-day.mp3` exists.
   Add the file and it appears; it self-checks with a HEAD request.
4. **Harvey's portraits are AI composites** (Nano Banana 2, built from his real
   photo). Get his sign-off; swap in real photography for press/EPK.
5. **No thought-leadership surface yet** — the brand doc calls it "a major growth
   lever." Worth adding to `harvey.html` as a writing/commentary index.

## Identity

- **Three Piece mark** — three pieces, centre struck in brass (`#mk-3pe`).
- **Harvey monogram** — brass "C" cradling an "H", "II" bridging the gap (`#mk-hc`).
- **Type** — Archivo (variable wdth/wght) for display and UI; Fraunces (variable
  opsz/SOFT/WONK) for editorial headings, script eyebrows, and pull quotes.
- **Palette** — ink `#0B0B0C`, bone `#F4F1EA`, brass `#C79A4B`.

## Never publish

The business plan contains the EIN (42-3059822). It must not appear on the site.
