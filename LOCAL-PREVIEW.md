# Local review — The Compliment

No deployment has been performed. Publish only after Paris approves the preview.

Open http://127.0.0.1:4337/review.html for the design review and the 23-room atlas.
Open http://127.0.0.1:4337/house.html for the hotel, or
http://127.0.0.1:4337/links/ for the links-hub preview.

Use the HTTP preview, not a file:// URL: the catalogue and media collections load JSON using fetch.

Start the local server if needed:

```sh
rtk proxy python3 -m http.server 4337 --bind 127.0.0.1 --directory /Volumes/HQ/Claude/paris-pullen-interactive-preview
```

## Controls

Floors is the single bottom-right button. Its three views contain rooms, objects in the current room, and saved selections. The old top-right floor launcher and Footer button are hidden. Remote and play/pause sit at bottom-left. Object hotspots still work directly.

## Preview changes

- assets/js/artifact-experiences.js and assets/css/artifact-experiences.css: themed objects, cookbook, garment rail, capsules, record shelf, programme, saved stay, room navigation and Ritual Tray.
- index.html and build_house.py: load the shared layer. house.html is generated from the latter.
- assets/js/tv-remote.js: a narrow programme-selection bridge into the existing player; native dialog for the expanded screen.
- links/index.html, assets/js/links-arrival.js and assets/css/links-arrival.css: elevator floor selector and arrival transition.
- pantry.html and off-duty.html: replace placeholder shopping buttons with honest pending-link text and a working room route.
- review.html and DESIGN-ATLAS.md: review entry point and design proposals for all 23 authored rooms, including the 14 unopened rooms.

## Verification

- Syntax checks passed for the three changed/new JavaScript modules; the house generator ran successfully.
- Browser checked: garment rail loads, Black tie filters to 140 catalogue entries, product selection appears.
- Browser checked: cookbook chapters change, ingredient checkboxes survive a page turn and return, saved recipe action responds, Kitchen-to-Study route works.
- Browser checked: Floors replaces the duplicate launchers and Footer control, opens the nine-room directory, and switches to current-room object browsing. Selecting The Delivery from that view opens the cookbook.
- Browser checked: the bathroom Ritual Tray opens; record shelf selection updates the Spotify destination; programme selection opens the chosen YouTube video in the existing player.
- Browser checked: links-hub floor selection changes the image, copy and destination.
- Reduced-motion styles and keyboard focus restoration are implemented. Phone media queries are present; the browser viewport override did not change the observed rendering dimensions, so device-specific visual QA remains outstanding.
- Third-party playback availability is not guaranteed. Spotify briefly reported a provider error during room entry, then recovered; check the selected tracks and account restrictions before deployment.

## Content boundary

The cookbook is an editorial preview, not a set of complete partner-approved recipe instructions. Capsule cards do not invent product photography, stock or purchase links. Shoes and ties use their existing object stories until a real product catalogue is mapped. Unopened floors remain proposals in the atlas, not published rooms.

This directory is an isolated copy. Concurrent room/audio changes in the original project were preserved when the preview was copied; do not deploy this whole snapshot over newer work without reviewing the difference first.
