# Harvey Cummings II — website

Static site. No build step, no dependencies. Open `index.html` or serve the folder.

```
index.html          markup + inline SVG logo sprite
assets/style.css    design system + all layout
assets/app.js       events rendering, nav, scroll reveal
assets/favicon.svg  monogram favicon
assets/img/         imagery
```

## Updating events — the only file you normally touch

Edit the `EVENTS` array at the top of `assets/app.js`:

```js
{ date:'2026-10-03', title:'The Only Child — Album Release',
  venue:'Venue TBC', city:'Charlotte, NC',
  note:'Debut album release performance', ticket:null }
```

Dates on/after today render under **Upcoming**; older ones fall into **Recent
highlights** automatically — no other edits needed. Set `ticket` to a URL to turn
the "Enquire" button into a "Tickets" button.

**⚠️ The two future dates currently in the array are placeholders.** Replace them
with confirmed bookings before launch. The two past entries (Carolina Theatre
D'Angelo tribute, Middle C Jazz International Jazz Day) are verified.

## Identity

- **Monogram** — brass "C" arc cradling an "H", with the "II" bridging the gap.
  Defined once as `<symbol id="mk-hc">` in `index.html`, reused via `<use>`.
  Also standalone in `assets/favicon.svg`.
- **Three Piece Entertainment submark** — `<symbol id="mk-3p">`, three pieces with
  the centre struck in brass.
- **Type** — Archivo (variable width + weight) for display and UI, Fraunces
  (variable optical size, SOFT, WONK) for editorial headings and pull quotes.
- **Palette** — ink `#0B0B0C`, bone `#F4F1EA`, brass `#C79A4B`.

## Imagery

`harvey-hero.jpg`, `harvey-sax.jpg`, `harvey-press.jpg`, `harvey-piano.jpg` were
generated with Nano Banana 2 (OpenArt) using Harvey's own about-page photo as the
identity reference. **They are AI composites — get Harvey's sign-off before launch,
and swap in real photography for press/EPK use where authenticity matters.**

Unused spares in `assets/img/`: `hero-silhouette.jpg`, `sax-macro.jpg`,
`vinyl-gold.jpg`, `piano-hands.jpg`.

## Booking form

Currently posts via `mailto:` — functional but clumsy, and it opens the visitor's
mail client. Before launch, point it at a real handler (Formspree, Netlify Forms,
or the Squarespace form if the site stays there). Replace the `action` on
`#booking-form` in `index.html`.
