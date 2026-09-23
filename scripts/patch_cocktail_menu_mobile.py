#!/usr/bin/env python3
"""Production mobile fix for The Gentleman's Cocktail Menu."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "cocktail-menu.html"

OLD_900 = '@media(max-width:900px){.chrome{height:58px;padding-left:12px}.close{width:58px;height:58px}.pages{height:calc(100dvh - 58px)}.grid{grid-template-columns:repeat(2,1fr)}.card{min-height:155px}.recipe-inner{grid-template-columns:1fr;display:block}.poster{height:44dvh;padding:10px;border-right:0;border-bottom:1px solid rgba(23,19,16,.2)}.poster img{max-height:100%;max-width:100%}.detail{height:56dvh;padding:18px 16px 36px}.detail h2{font-size:46px}.cols{grid-template-columns:1fr;gap:24px}}'
NEW_900 = '@media(max-width:900px){.chrome{height:62px;padding-left:12px}.close{width:62px;height:62px}.pages{height:calc(100dvh - 62px)}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.card{min-height:155px}.recipe-inner{display:block;min-height:100%}.poster{height:auto;min-height:0;padding:12px;border-right:0;border-bottom:1px solid rgba(23,19,16,.2);align-items:flex-start}.poster img{display:block;width:100%;height:auto;max-width:620px;max-height:42dvh;object-fit:contain}.detail{height:auto;min-height:auto;overflow:visible;padding:20px 18px 40px}.detail h2{font-size:52px;line-height:.96;overflow-wrap:anywhere}.cols{grid-template-columns:1fr;gap:24px}.recipe{overflow:auto;-webkit-overflow-scrolling:touch}}'

OLD_520 = '@media(max-width:520px){.index{padding:12px 10px 24px}.mast{padding:18px 12px 19px;margin-bottom:13px}.mast:before,.mast:after{width:20%}.mast h1{font-size:43px;margin-top:22px}.mast p{font-size:11px}.grid{grid-template-columns:1fr 1fr;gap:7px}.card{min-height:132px}.card-name{font-size:20px}.card-body{padding:10px}.poster{height:42dvh}.detail{height:58dvh}.meta{grid-template-columns:1fr 1fr}}'
NEW_520 = '@media(max-width:520px){.index{padding:12px 10px calc(26px + env(safe-area-inset-bottom))}.mast{padding:18px 12px 19px;margin-bottom:13px}.mast:before,.mast:after{width:16%}.monogram{height:58px}.monogram img{width:76px;max-height:56px}.mast h1{font-size:43px;line-height:.96;margin-top:18px}.mast p{font-size:13px;line-height:1.35}.grid{grid-template-columns:1fr;gap:9px}.card{min-height:168px}.card-name{font-size:28px}.card-body{padding:12px}.poster{height:auto;padding:10px 10px 0;background:var(--paper)}.poster img{width:100%;height:auto;max-height:36dvh;object-fit:contain;box-shadow:none;border:1px solid rgba(23,19,16,.18)}.detail{height:auto;overflow:visible;padding:16px 14px calc(28px + env(safe-area-inset-bottom))}.back{margin-bottom:18px}.detail h2{font-size:44px;line-height:.98;margin-bottom:14px}.meta{grid-template-columns:1fr}.meta div+div{border-left:0;border-top:1px solid rgba(23,19,16,.18);padding-left:0}.meta strong{font-size:20px}.cols{grid-template-columns:1fr;gap:24px}li{font-size:14px;line-height:1.55}.house-note{font-size:16px}.recipe{overflow:auto;-webkit-overflow-scrolling:touch}}'


def replace_once(text, old, new, label):
    if new in text:
        print(f"Cocktail mobile patch already applied: {label}")
        return text
    if old not in text:
        raise RuntimeError(f"Could not find cocktail mobile target: {label}")
    return text.replace(old, new, 1)


def main():
    text = PATH.read_text(encoding="utf-8")
    text = replace_once(text, OLD_900, NEW_900, "tablet/mobile layout")
    text = replace_once(text, OLD_520, NEW_520, "phone layout")
    PATH.write_text(text, encoding="utf-8")
    print("Cocktail menu mobile layout patched: no recipe overlap, single-column phone cards, responsive poster")


if __name__ == "__main__":
    main()
