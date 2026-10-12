# Penthouse — Halloween 2026

Ten separate room images, exported from the approved Halloween PNGs at their
native resolution. Each room also has a 1200-pixel-wide mobile JPEG. No upscaling
or extra sharpening was needed.

`assets/js/penthouse-season.js` selects these images from October 12 through
October 31, 2026, in America/New_York. At **November 1, 2026, 00:00 EDT**
(`2026-11-01T04:00:00Z`), it restores each room's original `src` and `srcset`,
including open tabs. It applies to both the homepage penthouse and `house.html`.
The date window is specific to 2026 and does not repeat in later years.

Original image files are never replaced. Room layout, navigation, overlays,
hotspots, dimensions, and crop settings stay as authored. Original PNG masters
and a comparison gallery are retained in `/Volumes/HQ/output/penthouse-halloween-2026`.

For an early rollback, remove the `penthouse-season.js` script tags from
`index.html` and `build_house.py`, then update `.deploy-trigger` to deploy.
The homepage safely falls back to its original sources without the helper.
