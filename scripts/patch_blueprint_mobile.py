#!/usr/bin/env python3
"""Apply production fixes to blueprint.html.

The Blueprint is a large self-contained HTML artifact. Keeping small,
deterministic patches in the deploy pipeline lets the canonical artifact
remain the source of truth while production consistently receives the
responsive rack behavior and correct return-to-Penthouse navigation.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PATH = ROOT / "blueprint.html"

OLD_CSS = """@media(max-width:760px){
 .rack{flex:0 0 auto;height:clamp(240px,52vw,395px);min-height:240px}
 .dashboard{grid-template-columns:190px minmax(0,1fr)}
}"""

NEW_CSS = """@media(max-width:760px){
 html,body{height:100%;min-height:100%;overflow:hidden}
 body{height:100dvh;min-height:100dvh}
 main{height:100%;min-height:0;overflow:hidden}
 .rack{flex:1 1 auto;height:auto;min-height:0;max-height:none}
 .rack-row{inset:10px 0 18px;justify-content:center;overflow:hidden}
 .rack-slot{width:33.3333%;min-width:33.3333%;max-width:33.3333%;flex:0 0 33.3333%}
 .rack-slot img{width:100%;height:100%;object-fit:contain;object-position:top center}
 .dashboard{flex:0 0 auto;grid-template-columns:168px minmax(0,1fr);min-height:0;padding:10px 12px 12px;gap:10px}
 .left{display:none}
 .wheel{width:164px;height:164px}
 .wheel:after{inset:44px}
 .wheel-button{width:42px;height:42px}
 .wheel-button[data-category=suit]{left:61px;top:0}
 .wheel-button[data-category=shirt]{right:0;top:61px}
 .wheel-button[data-category=vest]{bottom:0;left:61px}
 .wheel-button[data-category=tie]{left:0;top:61px}
 .wheel-center{inset:54px 42px}
 .options h3{margin:3px 0 8px;font-size:16px}
 .option-list{gap:5px}
 .option{min-width:48px;padding:7px 6px}
 footer{padding-top:8px;padding-bottom:max(8px,env(safe-area-inset-bottom))}
}"""

OLD_RAIL = "function railHeight(){const stage=$(&#x27;stage&#x27;),row=$(&#x27;rackRow&#x27;);const imageH=Math.min(row.clientHeight,row.clientWidth/5*740/310);stage.style.setProperty(&#x27;--rail-top&#x27;,(row.offsetTop+imageH*24/740-3)+&#x27;px&#x27;);}"
NEW_RAIL = "function rackCount(){return window.matchMedia(&#x27;(max-width:760px)&#x27;).matches?3:5;} function railHeight(){const stage=$(&#x27;stage&#x27;),row=$(&#x27;rackRow&#x27;);const imageH=Math.min(row.clientHeight,row.clientWidth/rackCount()*740/310);stage.style.setProperty(&#x27;--rail-top&#x27;,(row.offsetTop+imageH*24/740-3)+&#x27;px&#x27;);}"

OLD_RENDER = "const rackLooks=pool.length&lt;=5?pool:Array.from({length:5},(_,i)=&gt;pool[(index+i-2+pool.length)%pool.length]);"
NEW_RENDER = "const count=rackCount(),offset=Math.floor(count/2);const rackLooks=pool.length&lt;=count?pool:Array.from({length:count},(_,i)=&gt;pool[(index+i-offset+pool.length)%pool.length]);"

OLD_RESIZE = "new ResizeObserver(railHeight).observe($(&#x27;stage&#x27;));"
NEW_RESIZE = "new ResizeObserver(railHeight).observe($(&#x27;stage&#x27;));const mobileRackQuery=window.matchMedia(&#x27;(max-width:760px)&#x27;);mobileRackQuery.addEventListener?.(&#x27;change&#x27;,()=&gt;render());"

RETURN_SCRIPT = """<script id=\"blueprint-return-navigation\">(()=>{const button=document.getElementById('return');if(!button)return;button.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();let fromPenthouse=false;try{const ref=new URL(document.referrer);fromPenthouse=ref.origin===location.origin&&/\\/house\\.html$/.test(ref.pathname);}catch(_){}if(fromPenthouse&&history.length>1){history.back();}else{location.href='/house.html#closet';}},true);})();</script>"""


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        print(f"Blueprint patch already applied: {label}")
        return text
    if text.count(old) != 1:
        raise RuntimeError(f"Expected exactly one {label} target; found {text.count(old)}")
    return text.replace(old, new, 1)


def main() -> None:
    text = PATH.read_text(encoding="utf-8")
    text = replace_once(text, OLD_CSS, NEW_CSS, "mobile CSS")
    text = replace_once(text, OLD_RAIL, NEW_RAIL, "rail sizing")
    text = replace_once(text, OLD_RENDER, NEW_RENDER, "mobile rack count")
    text = replace_once(text, OLD_RESIZE, NEW_RESIZE, "responsive rerender")
    if RETURN_SCRIPT not in text:
        if text.count("</body>") != 1:
            raise RuntimeError(f"Expected one outer </body> target; found {text.count('</body>')}")
        text = text.replace("</body>", RETURN_SCRIPT + "</body>", 1)
        print("Blueprint return navigation applied: previous Penthouse room or Closet fallback")
    else:
        print("Blueprint return navigation already applied")
    PATH.write_text(text, encoding="utf-8")
    print("Blueprint production patch applied")


if __name__ == "__main__":
    main()
