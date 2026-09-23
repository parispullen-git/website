#!/usr/bin/env python3
"""Production fix for The Gentleman's Cocktail Menu.

The source menu was created before the real cocktail JPGs were wired into the
UI.  This deploy-time patch deliberately targets the current production markup:
it adds the real images to the menu cards + recipe poster and applies a true
single-scroll mobile recipe layout so the poster and copy never overlap.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "cocktail-menu.html"

STYLE_MARKER = "/* PP_COCKTAIL_PRODUCTION_FIX_V2 */"
SCRIPT_MARKER = "PP_COCKTAIL_PRODUCTION_FIX_V2"

CSS = r'''/* PP_COCKTAIL_PRODUCTION_FIX_V2 */
.card{isolation:isolate}
.card-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block;z-index:0;filter:saturate(.92) contrast(.96)}
.card:before,.card:after{z-index:1;pointer-events:none}
.card-body,.card-mark{z-index:2}
.poster{overflow:hidden}
.poster-photo{display:block;width:100%;height:auto;max-width:560px;max-height:calc(100dvh - 120px);object-fit:contain;object-position:center;box-shadow:0 18px 50px rgba(53,39,22,.18)}
.poster.has-photo .poster-card{display:none}
@media(max-width:900px){
  .pages{height:calc(100dvh - 58px)}
  .recipe{overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch}
  .recipe-inner{display:block!important;min-height:0!important;height:auto!important}
  .poster{display:block!important;height:auto!important;min-height:0!important;padding:12px!important;border-right:0!important;border-bottom:1px solid rgba(23,19,16,.2);background:var(--paper)!important}
  .poster-photo{width:100%!important;height:auto!important;max-width:620px!important;max-height:none!important;margin:0 auto;object-fit:contain!important;box-shadow:none}
  .detail{height:auto!important;min-height:0!important;overflow:visible!important;padding:20px 18px 44px!important}
  .detail h2{font-size:52px!important;line-height:.96!important;overflow-wrap:anywhere}
  .cols{grid-template-columns:1fr!important;gap:24px!important}
}
@media(max-width:520px){
  .index{padding:12px 10px calc(26px + env(safe-area-inset-bottom))!important}
  .grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
  .card{min-height:158px!important}
  .card-name{font-size:21px!important;line-height:1!important}
  .card-body{padding:10px!important}
  .card-num{font-size:7px!important}
  .poster{padding:10px 10px 0!important}
  .poster-photo{width:100%!important;max-height:none!important;border:1px solid rgba(23,19,16,.18)}
  .detail{padding:16px 14px calc(30px + env(safe-area-inset-bottom))!important}
  .back{margin-bottom:18px!important}
  .detail h2{font-size:44px!important;line-height:.98!important;margin:8px 0 16px!important}
  .meta{grid-template-columns:1fr 1fr!important;margin-bottom:22px!important}
  .meta strong{font-size:17px!important;line-height:1.15}
  .cols{display:block!important}
  .cols>div+div{margin-top:28px}
  li{font-size:14px!important;line-height:1.55!important}
  .house-note{font-size:16px!important}
}
'''

JS = r'''<script>
/* PP_COCKTAIL_PRODUCTION_FIX_V2 */
(()=>{
  const slugs=[
    'old-fashioned','cuba-libre','espresso-martini','bellini','whiskey-sour',
    'dirty-martini','moscow-mule','sidecar','gin-tonic','negroni','french-75'
  ];
  const src=i=>`/assets/img/cocktails/${slugs[i]}.jpg?v=20260923b`;
  const grid=document.getElementById('grid');
  const poster=document.querySelector('.poster');
  if(!grid||!poster) return;

  const cards=[...grid.querySelectorAll('.card')];
  cards.forEach((card,i)=>{
    if(!card.querySelector('.card-photo')){
      const img=document.createElement('img');
      img.className='card-photo';
      img.src=src(i);
      img.alt='';
      img.loading=i<4?'eager':'lazy';
      img.decoding='async';
      card.prepend(img);
    }
  });

  let posterImg=poster.querySelector('.poster-photo');
  if(!posterImg){
    posterImg=document.createElement('img');
    posterImg.className='poster-photo';
    posterImg.id='posterImg';
    posterImg.alt='';
    poster.prepend(posterImg);
  }
  poster.classList.add('has-photo');

  const setPoster=i=>{
    posterImg.src=src(i);
    posterImg.alt=(window.DRINKS?.[i]?.name||'Cocktail')+' recipe artwork';
  };

  grid.addEventListener('click',e=>{
    const card=e.target.closest('.card');
    if(!card) return;
    const i=Number(card.dataset.i);
    if(Number.isFinite(i)) setPoster(i);
  });

  // Covers keyboard/programmatic opens as well as normal taps.
  const recipe=document.getElementById('recipe');
  if(recipe){
    new MutationObserver(()=>{
      if(!recipe.classList.contains('is-open')) return;
      const name=(document.getElementById('rName')?.textContent||'').trim();
      const i=window.DRINKS?.findIndex?.(d=>d.name===name);
      if(Number.isInteger(i)&&i>=0) setPoster(i);
      recipe.scrollTop=0;
    }).observe(recipe,{attributes:true,attributeFilter:['class']});
  }
})();
</script>'''


def main():
    text = PATH.read_text(encoding="utf-8")

    # Remove the obsolete V1 fixed-height substitutions if a previous deploy
    # already applied them, then rely on the stronger V2 overrides below.
    if STYLE_MARKER not in text:
        if "</style>" not in text:
            raise RuntimeError("Cocktail menu has no </style> tag")
        text = text.replace("</style>", CSS + "\n</style>", 1)

    if SCRIPT_MARKER not in text.split("</style>",1)[-1]:
        if "</body>" not in text:
            raise RuntimeError("Cocktail menu has no </body> tag")
        text = text.replace("</body>", JS + "\n</body>", 1)

    PATH.write_text(text, encoding="utf-8")
    print("Cocktail menu production fix V2 applied: real JPGs wired; mobile overlap removed")


if __name__ == "__main__":
    main()
