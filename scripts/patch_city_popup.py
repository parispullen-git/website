#!/usr/bin/env python3
"""Turn Charlotte: A Gentleman's Guide into a room-native popup experience.

The guide remains a standalone/shareable charlotte.html page. During production
builds this patch adds an embedded presentation mode and teaches the shared
artifact experience layer to open Charlotte in a full-screen dialog from the
hotel, including existing City links in navigation.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTIFACT_JS = ROOT / "assets" / "js" / "artifact-experiences.js"
CHARLOTTE_HTML = ROOT / "charlotte.html"

PORTAL_FN = r'''  function cityPortal(spot) {
    if (dialog.open) close();
    const existing = document.getElementById('city-guide-room-portal');
    if (existing) { existing.showModal(); return; }
    const portal = document.createElement('dialog');
    portal.id = 'city-guide-room-portal';
    portal.className = 'ae-dialog';
    portal.dataset.kind = 'city-guide';
    portal.innerHTML = '<header class="ae-header"><div class="ae-brand"><span class="foxx" aria-hidden="true"></span><span class="ae-kicker">THE CITY · CHARLOTTE</span></div><button class="ae-close" type="button" aria-label="Return to room">Return to room ×</button></header><iframe title="Charlotte: A Gentleman\'s Guide" src="/charlotte.html?embed=1" style="display:block;width:100%;height:calc(100% - 58px);min-height:72vh;border:0;background:#0a0a0b"></iframe>';
    document.body.appendChild(portal);
    portal.querySelector('.ae-close').addEventListener('click', () => portal.close());
    portal.addEventListener('click', event => { if (event.target === portal) portal.close(); });
    portal.addEventListener('close', () => { portal.remove(); if (spot?.isConnected) spot.focus({preventScroll:true}); });
    portal.showModal();
  }
'''

EMBED_HEAD = r'''<script>
if (new URLSearchParams(location.search).get('embed') === '1') {
  document.documentElement.classList.add('city-guide-embed');
}
</script>
<style>
.city-guide-embed .worldnav,
.city-guide-embed .menu,
.city-guide-embed .rail-nav,
.city-guide-embed .foot { display:none !important; }
.city-guide-embed body { min-height:100dvh; overflow-x:hidden; }
.city-guide-embed main { padding-top:0 !important; }
.city-guide-embed main > .scene:first-child { padding-top:clamp(2rem,6vh,4.5rem) !important; }
@media (max-width:760px) {
  .city-guide-embed main > .scene:first-child { padding-top:1.5rem !important; }
}
</style>
'''


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        print(f"City popup patch already applied: {label}")
        return text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one {label} target; found {count}")
    return text.replace(old, new, 1)


def patch_artifact_js() -> None:
    text = ARTIFACT_JS.read_text(encoding="utf-8")

    text = replace_once(
        text,
        "  function blueprintPortal(spot) {",
        PORTAL_FN + "  function blueprintPortal(spot) {",
        "city portal function",
    )

    text = replace_once(
        text,
        "    if (b.dataset.room) travel(b.dataset.room);",
        "    if (b.dataset.room) travel(b.dataset.room);\n    if (b.hasAttribute('data-city-portal')) cityPortal(b);",
        "artifact city action",
    )

    text = replace_once(
        text,
        "else if (key === 'map' || key === 'chair') extra = '<a class=\"ae-action\" href=\"charlotte.html\">Explore Charlotte ↗</a>';",
        "else if (key === 'map' || key === 'chair') extra = '<button class=\"ae-action\" type=\"button\" data-city-portal>Explore Charlotte ↗</button>';",
        "map/chair city action",
    )

    interceptor = r'''
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    let url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin || !url.pathname.endsWith('/charlotte.html')) return;
    event.preventDefault();
    cityPortal(link);
  });
'''
    end_marker = "\n})();"
    if interceptor not in text:
        if text.count(end_marker) != 1:
            raise RuntimeError("Could not locate artifact experience IIFE ending")
        text = text.replace(end_marker, interceptor + end_marker, 1)

    ARTIFACT_JS.write_text(text, encoding="utf-8")
    print("City popup patch applied: room portal + City link interception")


def patch_charlotte_embed() -> None:
    text = CHARLOTTE_HTML.read_text(encoding="utf-8")
    if "city-guide-embed" in text:
        print("City popup patch already applied: Charlotte embed mode")
        return
    marker = "</head>"
    if text.count(marker) != 1:
        raise RuntimeError("Could not locate Charlotte </head>")
    text = text.replace(marker, EMBED_HEAD + marker, 1)
    CHARLOTTE_HTML.write_text(text, encoding="utf-8")
    print("City popup patch applied: Charlotte embedded presentation mode")


def main() -> None:
    patch_artifact_js()
    patch_charlotte_embed()


if __name__ == "__main__":
    main()
