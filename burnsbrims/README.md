# Burns Brims — reimagined site

A rebuild of burnsbrims.com in an "editorial atelier" direction: charcoal + warm sand +
brass, high-contrast display serif, full-bleed portraiture.

## Run

```bash
python3 -m http.server 8811 --directory .
```

## Structure

```
index.html              single page, section-anchored
products.json           32 products scraped from the live Squarespace store (real prices/stock)
assets/css/site.css     design system + layout
assets/js/site.js       nav, scroll reveal, dual product grids + filters
assets/img/             web-optimised imagery (this is what the site loads)
assets/img/logo/        logo mark + lockup in bone / ink / brass, plus favicon
assets/original/        untouched source pulled from the live site
assets/reimagined/      full-resolution Nano Banana 2 output
assets/video/           brand film (brand-film.ts = full 4m17s master, brand-film-web.mp4 = 42s web cut)
```

## Imagery

Source photography was pulled from the live site. The hats are extraordinary; the photography
was phone-shot on a gold mannequin against white, which read as marketplace listings rather
than $500 bespoke pieces.

Reimagined with Nano Banana 2 (image2image, 2K), preserving each hat exactly and replacing
only the presentation:

- `hero-portrait.jpg` — Phoenix worn, dark editorial
- `editorial-warm.jpg` — Sunset Bloom worn, warm sand editorial
- `fire-crowns.jpg` — the torch-on-felt technique, from the founder's own photo
- `founder-atelier.jpg` / `-alt.jpg` — Marquise in a properly lit atelier
- `product-*.jpg` — 8 signature pieces re-shot on a black plinth

The remaining 24 catalogue pieces use the original photography, presented deliberately on a
light "Archive" panel where the white-backdrop studio look reads as intentional.

### Prompt rules that matter

1. **Describe the scene, not the hat.** Let the reference carry the product. Describing the
   hat's colour in the prompt overrides the reference and drifts the product.
2. **Always include the TEXT RULE clause.** Without it the model invents brand nameplates —
   it stamped "ATELIER RENÉ" onto a Burns Brims band. Zoom into every plaque before shipping.

## Not done / needs the owner

- Four founder photos (Rio, runway, studio, London) are pending — drop them in
  `assets/founder-source/` to have them reimagined into the site's scenes.
- Shop links point at the live Squarespace store; there is no cart in this build.
- Newsletter form is inert (no backend wired).
