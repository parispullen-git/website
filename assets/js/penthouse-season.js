/* Halloween 2026. Original room images remain the permanent fallback. */
(function () {
  'use strict';

  // Midnight in America/New_York, before the November 1 DST change.
  var START = Date.parse('2026-10-12T00:00:00-04:00');
  var END = Date.parse('2026-11-01T00:00:00-04:00');
  var ROOMS = {
    'penthouse-living': ['room-living', 1672],
    'closet': ['room-closet', 1672],
    'bedroom': ['room-bedroom', 1672],
    'bath': ['room-bath', 1536],
    'kitchen': ['room-kitchen', 1536],
    'study': ['room-study', 1672],
    'music-lounge': ['room-musiclounge', 1672],
    'cinema': ['room-cinema', 1672],
    'gym': ['room-gym', 1536],
    'barbershop': ['room-barbershop', 1609]
  };
  var originals = new WeakMap();

  function active(now) {
    now = now === undefined ? Date.now() : now;
    return now >= START && now < END;
  }

  function sources(roomId, original, now) {
    var room = ROOMS[roomId];
    if (!room || !active(now)) return original;
    var base = 'assets/img/halloween-2026/' + room[0];
    return {
      src: base + '.jpg',
      srcset: base + '@sm.jpg 1200w, ' + base + '.jpg ' + room[1] + 'w'
    };
  }

  function apply() {
    document.querySelectorAll('.floor-scene__view > img').forEach(function (img) {
      var section = img.closest('.floor-scene');
      if (!section || !ROOMS[section.id]) return;
      if (!originals.has(img)) {
        originals.set(img, {
          src: img.getAttribute('data-original-src') || img.getAttribute('src'),
          srcset: img.getAttribute('data-original-srcset') || img.getAttribute('srcset')
        });
      }
      var selected = sources(section.id, originals.get(img));
      // srcset first: the browser should not select a stale responsive source.
      if (img.getAttribute('srcset') !== selected.srcset) {
        if (selected.srcset === null) img.removeAttribute('srcset');
        else img.setAttribute('srcset', selected.srcset);
      }
      if (img.getAttribute('src') !== selected.src) img.setAttribute('src', selected.src);
    });
  }

  window.PenthouseSeason = { active: active, sources: sources, apply: apply };
  apply();
  // The homepage mounts its rooms after this deferred script executes.
  new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', apply);
  window.addEventListener('pageshow', apply);

  function checkBoundary() {
    apply();
    var now = Date.now();
    var next = now < START ? START : now < END ? END : null;
    // Recheck at most once a minute to account for clock changes and suspended tabs.
    if (next !== null) setTimeout(checkBoundary, Math.min(60000, Math.max(1, next - now)));
  }
  checkBoundary();
}());
