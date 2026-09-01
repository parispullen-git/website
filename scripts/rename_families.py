#!/usr/bin/env python3
"""
Renames each style family (currently Harrell's internal codenames like
"Gold DB", "Torre", "VC Jaegen") to a distinguished gentleman name so the
Wardrobe reads as its own line, not a mirror of the supplier's catalog.
Bigger families get the more recognizable names. Run once.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from wardrobe_data import WARDROBE

# Ordered by "how iconic" -- assigned to families largest-first so the
# best-known suits (Gold DB, Bell, Torre...) get the most recognizable names.
NAME_POOL = [
    "Thomas", "Crown", "Harvey", "Specter", "St. Patrick", "Bond", "Mickey", "Pearson", "Gatsby", "Sterling",
    "Draper", "Corleone", "Hart", "Axelrod", "Windsor", "Carraway", "Rhoades", "Nucky", "Chalky", "Wellington",
    "Sinclair", "Ashford", "Beaumont", "Kingston", "Prescott", "Montgomery", "Fitzgerald", "Lancaster", "Whitfield", "Astor",
    "Kensington", "Rockefeller", "Vanderbilt", "Windermere", "Stark", "Roy", "Logan", "Kendall", "Wayne", "Slade",
    "Blofeld", "Leiter", "Fleming", "Zane", "Louis", "Litt", "Cameron", "Malone", "Chalmers", "Marlowe",
    "Osgood", "Pendleton", "Kingsley", "Langford", "Norwood", "Ellsworth", "Huntington", "Pemberton", "Ashworth", "Blackwood",
    "Cavendish", "Dashwood", "Everhart", "Fairweather", "Grosvenor", "Hollingsworth", "Ivanhoe", "Radcliffe", "Sheffield", "Thornton",
    "Weatherby", "Abernathy", "Callahan", "Brantley", "Covington", "Sanford", "Delacroix", "Marchetti", "Winslow", "Barksdale",
    "Stringer", "Roger", "Cooper", "Campbell", "Crawley", "Grantham", "Matthew", "Carson", "Branson", "Eggsy",
    "Merlin", "Vincent", "Ari", "Drama", "Blake", "Carrington", "Adam", "Steven", "Wags", "Lucious",
    "Andre", "Hakeem", "Jack", "Randall", "Kevin", "Julian", "Whitmore", "Owen", "Jimmy", "Rothstein",
    "Buchanan", "Q", "Robert", "Griggs", "Hastings", "Kane", "Lockhart", "Merriweather", "Pierce", "Talbot",
    "Vance", "Ellison", "Hargrove", "Kingswood", "Lennox", "Maddox", "Sterling II", "Weston", "Ashcombe", "Belmont",
]

assert len(set(NAME_POOL)) == len(NAME_POOL), "duplicate names in pool"


def base_from_name(n):
    m = re.match(r"The (.+?) — ", n)
    return m.group(1) if m else n


def main():
    families = {}
    for it in WARDROBE:
        b = base_from_name(it["name"])
        families.setdefault(b, []).append(it)

    ranked = sorted(families.items(), key=lambda x: -len(x[1]))
    if len(ranked) > len(NAME_POOL):
        raise SystemExit(f"Need {len(ranked)} names, pool only has {len(NAME_POOL)}")

    mapping = {}
    for (old_base, items), new_name in zip(ranked, NAME_POOL):
        mapping[old_base] = new_name
        for it in items:
            color = it["color"]
            it["name"] = f"The {new_name} — {color}"

    print(f"Renamed {len(mapping)} families across {len(WARDROBE)} pieces")
    for old, new in list(mapping.items())[:15]:
        print(f"  {old!r:28s} -> {new}")

    # ---- rewrite wardrobe_data.py: replace each item's name="..." line ----
    src = (ROOT / "scripts" / "wardrobe_data.py").read_text(encoding="utf-8")

    def esc(s):
        return s.replace("\\", "\\\\").replace('"', '\\"')

    # Build id -> new name map, then replace per-item by matching id="..." ... name="...",
    id_to_name = {it["id"]: it["name"] for it in WARDROBE}

    def repl(m):
        id_val = m.group(1)
        new_name = id_to_name.get(id_val)
        if new_name is None:
            return m.group(0)
        return f'dict(id="{id_val}", handle=' if False else m.group(0)  # placeholder, unused

    # Simpler: regex over each dict(...) block replacing name="..." using the id in the same block.
    def block_repl(m):
        block = m.group(0)
        idm = re.search(r'id="([^"]+)"', block)
        if not idm:
            return block
        new_name = id_to_name.get(idm.group(1))
        if new_name is None:
            return block
        return re.sub(r'name="[^"]*"', f'name="{esc(new_name)}"', block, count=1)

    new_src = re.sub(r"dict\([^)]*?\),", block_repl, src, flags=re.S)
    (ROOT / "scripts" / "wardrobe_data.py").write_text(new_src, encoding="utf-8")
    print("\nWrote scripts/wardrobe_data.py")


if __name__ == "__main__":
    main()
