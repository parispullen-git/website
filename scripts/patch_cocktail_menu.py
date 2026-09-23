#!/usr/bin/env python3
"""Definitive production patch for The Gentleman's Cocktail Menu.

This patch is intentionally append-only and does not depend on the exact
minified card/openDrink source. It wires the 11 committed cocktail JPGs at
runtime and overrides the fixed-height mobile recipe rules that caused the
poster and recipe copy to overlap.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "cocktail-menu.html"
MARKER = "PP_COCKTAIL_FIX_V4"

CSS = r'''
/* PP_COCKTAIL_FIX_V4 */
.card{isolation:isolate;background:#e7dccb!important}
.card-photo-v4{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block;z-index:0;filter:saturate(.92) contrast(.96)}
.card:before{display:none!important}
.card:after{z-index:1!important;pointer-events:none}
.card-body,.card-mark{position:relative;z-index:2!important}
.poster.has-real-photo .poster-card{display:none!important}
.poster-photo-v4{display:block;width:100%;height:auto;max-width:560px;object-fit:contain;object-position:center;box-shadow:0 18px 50px rgba(53,39,22,.18)}
@media(max-width:900px){
  .recipe{overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important}
  .recipe-inner{display:block!important;grid-template-columns:none!important;min-height:0!important;height:auto!important}
  .poster{display:block!important;height:auto!important;min-height:0!important;padding:12px!important;border-right:0!important;border-bottom:1px solid rgba(23,19,16,.2)!important;background:var(--paper)!important}
  .poster-photo-v4{width:100%!important;height:auto!important;max-width:620px!important;max-height:none!important;margin:0 auto!important;object-fit:contain!important;box-shadow:none!important}
  .detail{display:block!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding:20px 18px calc(44px + env(safe-area-inset-bottom))!important}
  .detail h2{font-size:48px!important;line-height:.98!important;overflow-wrap:anywhere!important}
  .cols{grid-template-columns:1fr!important;gap:24px!important}
}
@media(max-width:520px){
  .index{padding:12px 10px calc(26px + env(safe-area-inset-bottom))!important}
  .grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
  .card{min-height:150px!important}
  .card-name{font-size:21px!important;line-height:1!important}
  .card-body{position:absolute!important;left:0;right:0;bottom:0;padding:10px!important}
  .poster{height:auto!important;min-height:0!important;padding:10px 10px 0!important}
  .poster-photo-v4{width:100%!important;height:auto!important;max-width:none!important;max-height:none!important;border:1px solid rgba(23,19,16,.18)!important}
  .detail{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding:16px 14px calc(32px + env(safe-area-inset-bottom))!important}
  .back{margin-bottom:18px!important}
  .detail h2{font-size:42px!important;line-height:.98!important;margin:8px 0 16px!important}
  .meta{grid-template-columns:1fr 1fr!important;margin-bottom:22px!important}
  .meta strong{font-size:17px!important;line-height:1.15!important;overflow-wrap:anywhere!important}
  .cols{display:block!important}
  .cols>div+div{margin-top:28px!important}
  li{font-size:14px!important;line-height:1.55!important}
  .house-note{font-size:16px!important}
}
'''

JS = r'''<script>
/* PP_COCKTAIL_FIX_V4 */
(()=>{
  const slugs=['old-fashioned','cuba-libre','espresso-martini','bellini','whiskey-sour','dirty-martini','moscow-mule','sidecar','gin-tonic','negroni','french-75'];
  const names=['Old Fashioned','Cuba Libre','Espresso Martini','Bellini','Whiskey Sour','Dirty Martini','Moscow Mule','Sidecar','Gin & Tonic','Negroni','French 75'];
  const src=i=>`/assets/img/cocktails/${slugs[i]}.jpg?v=20260923d`;
  const grid=document.getElementById('grid');
  const poster=document.querySelector('.poster');
  const recipe=document.getElementById('recipe');
  if(!grid||!poster) return;

  function wireCards(){
    [...grid.querySelectorAll('.card')].forEach((card,i)=>{
      if(i>=slugs.length||card.querySelector('.card-photo-v4')) return;
      const img=document.createElement('img');
      img.className='card-photo-v4';
      img.src=src(i);
      img.alt=`${names[i]} cocktail artwork`;
      img.loading=i<4?'eager':'lazy';
      img.decoding='async';
      card.prepend(img);
    });
  }

  let posterImg=poster.querySelector('.poster-photo-v4');
  if(!posterImg){
    posterImg=document.createElement('img');
    posterImg.className='poster-photo-v4';
    posterImg.id='posterPhotoV4';
    posterImg.src=src(0);
    posterImg.alt='Old Fashioned cocktail artwork';
    poster.prepend(posterImg);
  }
  poster.classList.add('has-real-photo');

  function setPoster(i){
    if(!Number.isInteger(i)||i<0||i>=slugs.length) return;
    posterImg.src=src(i);
    posterImg.alt=`${names[i]} cocktail artwork`;
  }

  wireCards();
  new MutationObserver(wireCards).observe(grid,{childList:true,subtree:false});

  grid.addEventListener('click',e=>{
    const card=e.target.closest('.card');
    if(!card) return;
    const i=Number(card.dataset.i);
    setPoster(i);
    requestAnimationFrame(()=>{ if(recipe) recipe.scrollTop=0; });
  },true);
})();
</script>'''


def main():
    text = PATH.read_text(encoding="utf-8")
    if MARKER in text:
        print("Cocktail Menu V4 already applied")
        return
    if "</style>" not in text or "</body>" not in text:
        raise RuntimeError("Cocktail Menu missing expected style/body closing tags")
    text = text.replace("</style>", CSS + "\n</style>", 1)
    text = text.replace("</body>", JS + "\n</body>", 1)
    PATH.write_text(text, encoding="utf-8")
    print("Cocktail Menu V4 applied: 11 real JPGs + mobile single-scroll layout")


if __name__ == "__main__":
    main()
