#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "cocktail-menu.html"

IMAGE_PATHS = [
    "/assets/img/cocktails/old-fashioned.jpg?v=20260923c",
    "/assets/img/cocktails/cuba-libre.jpg?v=20260923c",
    "/assets/img/cocktails/espresso-martini.jpg?v=20260923c",
    "/assets/img/cocktails/bellini.jpg?v=20260923c",
    "/assets/img/cocktails/whiskey-sour.jpg?v=20260923c",
    "/assets/img/cocktails/dirty-martini.jpg?v=20260923c",
    "/assets/img/cocktails/moscow-mule.jpg?v=20260923c",
    "/assets/img/cocktails/sidecar.jpg?v=20260923c",
    "/assets/img/cocktails/gin-tonic.jpg?v=20260923c",
    "/assets/img/cocktails/negroni.jpg?v=20260923c",
    "/assets/img/cocktails/french-75.jpg?v=20260923c",
]

CSS = r'''
/* cocktail-menu-real-images-v3 */
.card{background:#e7dccb}
.card:before{display:none!important}
.card-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0;filter:saturate(.9) contrast(.96)}
.card:after{z-index:1}
.card-body,.card-mark{z-index:2}
.poster-image{display:block;width:auto;max-width:100%;height:auto;max-height:calc(100dvh - 108px);object-fit:contain;box-shadow:0 18px 50px rgba(53,39,22,.22)}
.poster-card{display:none!important}
@media(max-width:900px){
  .recipe{overflow:auto!important;-webkit-overflow-scrolling:touch}
  .recipe-inner{display:block!important;min-height:0!important;height:auto!important}
  .poster{height:auto!important;min-height:0!important;padding:12px!important;border-right:0!important;border-bottom:1px solid rgba(23,19,16,.2)!important;display:flex!important;align-items:flex-start!important;justify-content:center!important}
  .poster-image{display:block!important;width:min(100%,360px)!important;height:auto!important;max-height:none!important;aspect-ratio:2/3;object-fit:cover!important}
  .detail{height:auto!important;min-height:0!important;overflow:visible!important;padding:18px 16px calc(42px + env(safe-area-inset-bottom))!important}
  .detail h2{font-size:46px!important;line-height:.98!important;overflow-wrap:anywhere}
  .cols{grid-template-columns:1fr!important;gap:24px!important}
}
@media(max-width:520px){
  .grid{grid-template-columns:1fr 1fr!important;gap:7px!important}
  .poster{height:auto!important;padding:10px 10px 14px!important}
  .poster-image{width:min(82vw,300px)!important;height:auto!important;max-height:none!important}
  .detail{height:auto!important;min-height:0!important;overflow:visible!important;padding:16px 14px calc(34px + env(safe-area-inset-bottom))!important}
  .detail h2{font-size:42px!important;line-height:.98!important;margin-bottom:16px!important}
  .meta{grid-template-columns:1fr 1fr!important}
  .meta strong{overflow-wrap:anywhere}
}
'''


def replace_once(text, old, new, label):
    if new in text:
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Expected one {label}; found {count}")
    return text.replace(old, new, 1)


def main():
    text = PATH.read_text(encoding="utf-8")

    if "cocktail-menu-real-images-v3" not in text:
        text = text.replace("</style>", CSS + "\n</style>", 1)

    poster_old = '<div class="poster"><div class="poster-card">'
    poster_new = '<div class="poster"><img class="poster-image" id="posterImage" src="' + IMAGE_PATHS[0] + '" alt="Old Fashioned cocktail artwork"><div class="poster-card">'
    if 'id="posterImage"' not in text:
        text = replace_once(text, poster_old, poster_new, "poster container")

    if "const COCKTAIL_IMAGES=" not in text:
        js_array = "const COCKTAIL_IMAGES=" + repr(IMAGE_PATHS).replace("'", '"') + ";\n"
        text = replace_once(text, "];\nconst grid=", "];\n" + js_array + "const grid=", "cocktail image array insertion")

    card_old = '<button class="card" data-i="${i}"><span class="card-mark">'
    card_new = '<button class="card" data-i="${i}"><img class="card-image" src="${COCKTAIL_IMAGES[i]}" alt="${esc(d.name)} cocktail artwork" loading="${i<4?\'eager\':\'lazy\'}"><span class="card-mark">'
    if 'class="card-image"' not in text:
        text = replace_once(text, card_old, card_new, "card image renderer")

    open_old = "function openDrink(i){const d=DRINKS[i];"
    open_new = "function openDrink(i){const d=DRINKS[i];const poster=document.getElementById('posterImage');if(poster){poster.src=COCKTAIL_IMAGES[i];poster.alt=d.name+' cocktail artwork';}"
    if "poster.src=COCKTAIL_IMAGES[i]" not in text:
        text = replace_once(text, open_old, open_new, "recipe poster renderer")

    PATH.write_text(text, encoding="utf-8")
    print("Cocktail Menu patched: 11 real images + auto-height mobile recipe layout")


if __name__ == "__main__":
    main()
