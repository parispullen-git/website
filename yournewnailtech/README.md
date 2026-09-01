# Your New Nail Tech — website

Clean-luxury rebrand. Single-page static site, no build step, no dependencies.

```
index.html
assets/
  css/style.css
  js/main.js
  img/            hero, 8 portfolio images, logo (dark + light)
```

Run locally:

```bash
python3 -m http.server 8412 --directory /Volumes/HQ/Claude/your-new-nail-tech
```

## Before it goes live

**1. Connect the Spotify playlist** — the only outstanding item.

In `index.html`, find `id="pl-embed"` and put the playlist link in `data-playlist`:

```html
<div class="pl-embed" id="pl-embed" data-playlist="https://open.spotify.com/playlist/YOUR_ID_HERE">
```

Accepts any of three forms — full URL, `spotify:playlist:ID` URI, or the bare ID.
The placeholder panel disappears and the real player mounts automatically.
Leave it empty and the placeholder stays, so the page never looks broken.

**2. Confirm the business hours.** The hours in the Visit section are placeholders:

| Day | Listed |
|---|---|
| Mon–Thu | 10:00 AM – 7:00 PM |
| Friday | 10:00 AM – 8:00 PM |
| Saturday | 9:00 AM – 6:00 PM |
| Sunday | Closed |

**3. Confirm the two stats** in the About section — "7+ years behind the chair"
and the "est. 2019" in the hero eyebrow. Both are assumptions.

## Content that is real

- All pricing is transcribed from the existing nail menu graphics (full set S–XL
  with fill-in prices, Gel X, manicures, foot services, à la carte, freestyle,
  upkeep, $30 deposit).
- Booking links point to the live Acuity page (`yournewnailtechllc.as.me`).
- Instagram links point to `@yournewnailtech`.

## Imagery

Nine images generated with Nano Banana 2, each prompted from one of the real
sets in the brand's portfolio and reinterpreted as editorial hand-model
photography (deep brown skin, studio lighting, bone/cream palette):

| File | Based on |
|---|---|
| `hero.jpg` | almond nude + white French |
| `work-natural.jpg` | short sheer ballet-pink |
| `work-chrome.jpg` | grey snakeskin / chrome / crystals |
| `work-gold.jpg` | gold linework + blue swirl + yellow velvet |
| `work-rainbow.jpg` | rainbow abstract stiletto w/ gems |
| `work-jelly.jpg` | 3D jelly encrusted stiletto |
| `work-popart.jpg` | multicolour pop-art short square |
| `work-art.jpg` | hand-painted illustration set |
| `work-pedicure.jpg` | white pedicure |

These are AI-generated stand-ins with a consistent editorial look. Swap in real
photography of the same sets as it's shot — the filenames and aspect ratios can
stay the same.

## Design notes

- Palette: bone `#F2EEE6` / charcoal `#16150F`, single gold accent sampled from
  the logo (`#A8823C`).
- Type: Bodoni Moda (display) + Jost (UI/body), via Google Fonts.
- Reduced-motion is respected — reveals, marquee and pulse all disable.
- Section order: hero → services → price menu → portfolio → playlist → about →
  policies → visit → Instagram → book → footer.
