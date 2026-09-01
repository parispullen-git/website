# Wardrobe catalog data -- curated from Harrell's Menswear (harrellsonline.com),
# our sourcing partner. Prices are our retail ($895-$1295), not Harrell's wholesale.
# id, name, category(two-piece|three-piece|double-breasted|tuxedo), color, price, src_image_url, note
#
# Lives in data/wardrobe.json (repo root) so it can be edited from the local
# Operator Console (see local-admin/). Edit that file directly, or via the
# console -- never hand-edit wardrobe.html itself, and don't restore an
# inline literal here.
import json
from pathlib import Path

WARDROBE = json.loads((Path(__file__).resolve().parent.parent / "data" / "wardrobe.json").read_text(encoding="utf-8"))
