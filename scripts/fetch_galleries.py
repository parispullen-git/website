#!/usr/bin/env python3
"""
Fetches up to 4 gallery image URLs per handle directly from Harrell's public
product JSON endpoints (no browser needed). Writes handle\\timg1|img2|img3
to gallery_urls.tsv in the scratchpad.
"""
import json
import subprocess
import sys
import time
from pathlib import Path

SCRATCH = Path("/private/tmp/claude-501/-Volumes-HQ-Claude/7bde0950-1057-4c5d-b786-21fac6aed2ae/scratchpad")
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from wardrobe_data import WARDROBE

handles = sorted(set(it["handle"] for it in WARDROBE))
print(f"{len(handles)} handles to fetch")

out_path = SCRATCH / "gallery_urls.tsv"
done = {}
if out_path.exists():
    for line in out_path.read_text(encoding="utf-8").splitlines():
        if "\t" in line:
            done[line.split("\t")[0]] = line

todo = [h for h in handles if h not in done]
print(f"{len(done)} already fetched, {len(todo)} remaining")

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

errors = []
for i, h in enumerate(todo):
    url = f"https://harrellsonline.com/products/{h}.json"
    try:
        r = subprocess.run(
            ["curl", "-s", "--max-time", "15", "-A", UA, "-H", "Accept: application/json", url],
            capture_output=True, text=True, check=True,
        )
        d = json.loads(r.stdout)
        imgs = [im["src"] for im in d["product"]["images"][1:4]]
        done[h] = h + "\t" + "|".join(imgs)
    except Exception as e:
        errors.append((h, str(e)))
    if (i + 1) % 20 == 0:
        print(f"  {i+1}/{len(todo)}  ({len(errors)} errors so far)")
        out_path.write_text("\n".join(done.values()), encoding="utf-8")  # checkpoint
    time.sleep(1.1)

out_path.write_text("\n".join(done.values()), encoding="utf-8")
print(f"Wrote {len(done)} lines total, {len(errors)} errors this run")
if errors:
    print("Errors:", errors[:10])
