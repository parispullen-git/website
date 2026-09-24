#!/usr/bin/env python3
"""Keep links.parispullen.com compatibility links aligned with the live site.

The public destination/navigation block is authored directly in links/index.html.
This build helper must not rewrite that custom Gentleman navigation. It only
upgrades legacy Standard Notes references when they are still present.

Intentionally stdlib-only and idempotent for GitHub Actions.
"""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LINKS_FILE = ROOT / "links" / "index.html"


def main() -> None:
    html = LINKS_FILE.read_text(encoding="utf-8")

    # Preserve the authored Gentleman navigation and only modernize legacy
    # Standard Notes links when an older reference is still present.
    html = html.replace(
        'href="/house.html#study"',
        'href="/standard-notes.html"',
    )
    html = html.replace(
        'data-artifact-link="/house.html#study"',
        'data-artifact-link="/standard-notes.html"',
    )

    LINKS_FILE.write_text(html, encoding="utf-8")
    print("Links hub compatibility pass complete; authored Gentleman navigation preserved")


if __name__ == "__main__":
    main()
