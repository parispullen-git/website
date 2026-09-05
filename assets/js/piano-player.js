/* ============================================================
   The Piano — real playback control via Spotify's official IFrame
   API (not just a raw embed src), so Play/Pause actually works
   alongside the existing Prev/Next channel-flip. Delegated on
   document so it works no matter when a player element gets
   injected (baked into house.html at build time, or built at
   runtime by penthouse.js for the homepage's own room-pager).

   The rotation itself is editable live from the dashboard's Music
   panel (the 'playlists' collection) rather than requiring a
   rebuild. Same three-tier fallback tv-remote.js uses for channels:
     1. /.netlify/functions/content?collection=playlists -- dashboard edits.
     2. data/house-music.json -- the static seed file build_house.py
        also reads, used if the collection is empty or unreachable.
     3. the data-playlists JSON already baked into each element's markup
        (build_house.py / penthouse.js's own hardcoded fallback array),
        used only if both fetches fail outright (e.g. offline).
   window.PP_PIANO_PLAYLISTS_RESOLVED exposes step 1/2's result (once
   resolved) so penthouse.js can reuse it when building the homepage's
   own dynamic piano player instead of fetching it a second time, and
   window.PP_PIANO_PLAYLISTS_READY is the same thing as a promise, for
   callers that can run before it lands (tv-remote.js's Suite Remote
   Music tab, which plays this exact same rotation).
   ============================================================ */
(function () {
  'use strict';

  var FETCHED_PLAYLISTS = null;

  function normalize(list) {
    if (!Array.isArray(list)) return null;
    var out = list.filter(function (it) { return it && it.type && it.id && it.label; });
    return out.length ? out : null;
  }

  var playlistsReady = fetch('/.netlify/functions/content?collection=playlists')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var records = (data && data.records) || [];
      records.sort(function (a, b) {
        if (typeof a.order === 'number' && typeof b.order === 'number') return a.order - b.order;
        return (a.createdAt || 0) - (b.createdAt || 0);
      });
      var list = normalize(records.map(function (r) {
        return { type: r.type, id: r.spotifyId, label: r.label };
      }));
      if (!list) throw new Error('empty');
      FETCHED_PLAYLISTS = list;
    })
    .catch(function () {
      return fetch('data/house-music.json')
        .then(function (r) { return r.json(); })
        .then(function (list) { FETCHED_PLAYLISTS = normalize(list); })
        .catch(function () { FETCHED_PLAYLISTS = null; });
    })
    .then(function () {
      window.PP_PIANO_PLAYLISTS_RESOLVED = FETCHED_PLAYLISTS;
      return FETCHED_PLAYLISTS;
    });

  // Same resolved list, but as a promise, for callers that may run BEFORE
  // it lands and would otherwise have to fire their own duplicate fetch --
  // tv-remote.js's Suite Remote reads ...RESOLVED first and falls back to
  // awaiting this. Assigned synchronously at parse time so it's already
  // there for any later script; resolves to null if every tier failed.
  window.PP_PIANO_PLAYLISTS_READY = playlistsReady;

  function playlists(el) {
    if (FETCHED_PLAYLISTS && FETCHED_PLAYLISTS.length) return FETCHED_PLAYLISTS;
    try { return JSON.parse(el.dataset.playlists) || []; } catch (e) { return []; }
  }

  function uriFor(item) {
    return 'spotify:' + item.type + ':' + item.id;
  }

  /* ---------- Spotify IFrame API ---------- */
  var spotifyApiPromise = new Promise(function (resolve) {
    window.onSpotifyIframeApiReady = function (IFrameAPI) { resolve(IFrameAPI); };
    var s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1';
    s.async = true;
    document.head.appendChild(s);
  });

  var inited = new WeakSet();

  function initPlayer(el) {
    if (inited.has(el)) return;
    inited.add(el);
    var list = playlists(el);
    if (!list.length) return;
    var target = el.querySelector('[data-piano-frame]');
    var label = el.querySelector('[data-piano-label]');
    var playBtn = el.querySelector('[data-piano-play]');
    if (!target) return;
    var idx = 0;

    function updatePlayGlyph(isPaused) {
      if (playBtn) playBtn.innerHTML = isPaused ? '&#9654;' : '&#10074;&#10074;';
    }

    spotifyApiPromise.then(function (IFrameAPI) {
      IFrameAPI.createController(target, { uri: uriFor(list[idx]) }, function (controller) {
        el._piano = { controller: controller, idx: idx, list: list };
        controller.addListener('playback_update', function (e) {
          updatePlayGlyph(!!(e && e.data && e.data.isPaused));
        });
      });
    });

    // Prev/next were wired before the controller exists in older markup --
    // keep working even mid-load by queuing against el._piano once ready.
    function switchTrack(delta) {
      var state = el._piano;
      if (!state) return;
      state.idx = ((state.idx + delta) % state.list.length + state.list.length) % state.list.length;
      var item = state.list[state.idx];
      state.controller.loadUri(uriFor(item));
      if (label) label.textContent = item.label;
      updatePlayGlyph(true); // loadUri starts paused until the visitor presses play
    }
    el._pianoSwitch = switchTrack;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-piano-prev],[data-piano-next],[data-piano-play]');
    if (!btn) return;
    var el = btn.closest('[data-piano-player]');
    if (!el) return;
    e.preventDefault();
    if (btn.hasAttribute('data-piano-play')) {
      if (el._piano) el._piano.controller.togglePlay();
      return;
    }
    if (el._pianoSwitch) el._pianoSwitch(btn.hasAttribute('data-piano-next') ? 1 : -1);
  });

  function initAll() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-piano-player]'), initPlayer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Elements built at runtime (the popup's lazily-built piano-player) arrive
  // after the DOMContentLoaded pass above, so watch for them too.
  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue;
        if (node.hasAttribute && node.hasAttribute('data-piano-player')) initPlayer(node);
        if (node.querySelectorAll) {
          Array.prototype.forEach.call(node.querySelectorAll('[data-piano-player]'), initPlayer);
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
