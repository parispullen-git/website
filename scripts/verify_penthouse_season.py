"""Verify both deployed entry points load the seasonal switch before room setup."""
from pathlib import Path
import hashlib
import json

season = 'assets/js/penthouse-season.js?v=halloween-2026-1'
for page, runtime in [('index.html', 'assets/js/penthouse.js?'), ('house.html', 'assets/js/room-pager.js?')]:
    html = Path(page).read_text()
    assert html.count(season) == 1, f'{page}: missing or duplicated season loader'
    assert html.index(season) < html.index(runtime), f'{page}: wrong script order'
assert 'data-original-srcset=' in Path('assets/js/penthouse.js').read_text()
manifest = json.loads(Path('assets/img/halloween-2026/manifest.json').read_text())
assert len(manifest['rooms']) == 10
for room in manifest['rooms']:
    for key in ['halloween_image', 'mobile_image']:
        assert Path('assets/img/halloween-2026', room[key]).is_file()
    original_path = Path(room['original_url'].replace('https://parispullen.com/', ''))
    assert hashlib.sha256(original_path.read_bytes()).hexdigest() == room['original_sha256'], f'Original changed: {original_path}'
print('Halloween 2026: both pages wired, ten rooms present, original images unchanged')
