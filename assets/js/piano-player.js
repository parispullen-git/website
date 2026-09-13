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
     1. /api/content?collection=playlists -- dashboard edits.
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

  var playlistsReady = fetch('/api/content?collection=playlists')
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

  /* ----------------------------------------------------------------
     Music Lounge entry sequence -- arriving at the room (pp:room-change,
     see room-pager.js) plays a short sting (assets/audio/music-lounge-
     intro.m4a), then autoplays the record player artifact's own fixed
     playlist once the sting ends. The controller now lives on its own
     hidden host (same .room-track-host pattern every other room's
     ambient track uses -- see ensureRoomController below), created lazily
     on first entry rather than depending on drawer markup, so playback
     continues in the background regardless of whether the drawer's ever
     opened -- there's no visible in-room widget for it any more (see
     window.PPAmbient.meta() / tv-remote.js's Suite Remote Music tab for
     the now-playing display that replaced it).

     Spotify's public embed API has no documented way to force shuffle
     on programmatically -- this starts the playlist in its own track
     order.

     Best-effort only: a browser that blocks the sting's autoplay (most
     likely the very first click into house.html, before any in-page
     interaction) still gets the playlist call as a fallback, but if
     that's blocked too, the record player artifact's own play button
     works exactly as it always has -- no regression either way. */
  var LOUNGE_PLAYLIST_ID = '7b46c5syjtG86a77R7SnMs';
  var loungeController = null;
  function ensureLoungeController(cb) {
    if (loungeController) { cb(loungeController); return; }
    var host = document.createElement('div');
    host.className = 'room-track-host';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
    spotifyApiPromise.then(function (IFrameAPI) {
      if (!IFrameAPI) return;
      IFrameAPI.createController(host, { uri: 'spotify:playlist:' + LOUNGE_PLAYLIST_ID }, function (controller) {
        loungeController = controller;
        // Exposed so the global Suite Remote (tv-remote.js) can control
        // this exact controller from any room's Music tab, instead of
        // running a second, separately-maintained player of its own.
        window.PP_LOUNGE_CONTROLLER = controller;
        controller.addListener('playback_update', function (e) {
          document.dispatchEvent(new CustomEvent('pp:lounge-playback', {
            detail: { isPaused: !!(e && e.data && e.data.isPaused) }
          }));
          if (ambient && ambient.roomId === 'music-lounge') {
            ambient.isPaused = !!(e && e.data && e.data.isPaused);
            document.dispatchEvent(new CustomEvent('pp:ambient-playback'));
          }
        });
        document.dispatchEvent(new CustomEvent('pp:lounge-controller-ready'));
        cb(controller);
      });
    });
  }

  /* ----------------------------------------------------------------
     Ambient per-room tracks -- every room without a screen of its own
     gets one assigned Spotify track that starts the instant you arrive
     and pauses the instant you leave, exactly like the Living Room and
     Cinema's own video audio already does for THEIR rooms (see
     tv-remote.js's IntersectionObserver). The Music Lounge keeps its
     distinct intro-sting-then-playlist sequence below rather than
     joining this map, but reports into the same `ambient` slot so the
     Suite Remote's Music tab (tv-remote.js) has exactly one thing to
     ask about regardless of which mechanism is actually playing --
     "what's the current room's ambient audio, if any" -- since by
     construction at most one of these is ever playing at a time.
     window.PPAmbient exposes that read (and a togglePlay convenience)
     without tv-remote.js needing to know piano-player.js's internals. */
  var ROOM_TRACKS = {
    study: '2bjwRfXMk4uRgOD9IBYl9h',
    gym: '05KOgYg8PGeJyyWBPi5ja8',
    bedroom: '1F6nHHDJyTHLgDDFj1ZZDt',
    kitchen: '11pEKMLmavDu8fxOB5QjbQ',
    closet: '6jy9yJfgCsMHdu2Oz4BGKX',
    bath: '1Tnw0ItH1Macok8gblnPPd',
    'penthouse-living': '6jy9yJfgCsMHdu2Oz4BGKX'
  };
  var ROOM_LABELS = {
    study: 'The Study', gym: 'The Gym', bedroom: 'The Bedroom',
    kitchen: 'The Kitchen', closet: 'The Closet', bath: 'The Bathroom',
    'penthouse-living': 'The Living Room', 'music-lounge': 'The Music Lounge'
  };
  var roomControllers = {}; // roomId -> Spotify controller, built lazily on first entry
  var ambient = null; // { roomId, controller, isPaused } for whichever track is live right now, or null

  function setAmbient(roomId, controller, startPaused) {
    ambient = controller ? { roomId: roomId, controller: controller, isPaused: !!startPaused } : null;
    document.dispatchEvent(new CustomEvent('pp:ambient-change'));
  }

  // Now-playing metadata (album art + song title) for the Suite Remote's
  // Music tab -- fetched from Spotify's public oEmbed endpoint (no API
  // key needed, CORS-enabled) rather than the IFrame API, which doesn't
  // expose track metadata. Cached per URI since it never changes for a
  // given track/playlist; re-dispatches pp:ambient-change once a fetch
  // resolves so the remote (already listening for that event) re-renders
  // with the art once it's in.
  var trackMetaCache = {}; // uri -> {title, art} | 'loading' | null (failed)
  function ambientUri(roomId) {
    if (roomId === 'music-lounge') return 'spotify:playlist:' + LOUNGE_PLAYLIST_ID;
    return ROOM_TRACKS[roomId] ? 'spotify:track:' + ROOM_TRACKS[roomId] : null;
  }
  function fetchTrackMeta(uri) {
    trackMetaCache[uri] = 'loading';
    fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(uri))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        trackMetaCache[uri] = { title: data.title, art: data.thumbnail_url };
        document.dispatchEvent(new CustomEvent('pp:ambient-change'));
      })
      .catch(function () { trackMetaCache[uri] = null; });
  }

  window.PPAmbient = {
    get: function () { return ambient; },
    label: function (roomId) { return ROOM_LABELS[roomId] || ''; },
    // {title, art} for whatever's currently ambient, or null while it's
    // still loading (or if it has no track/failed) -- triggers the fetch
    // on first ask, same lazy-then-cache shape as ensureRoomController.
    meta: function () {
      if (!ambient) return null;
      var uri = ambientUri(ambient.roomId);
      if (!uri) return null;
      var cached = trackMetaCache[uri];
      if (cached === undefined) { fetchTrackMeta(uri); return null; }
      return cached === 'loading' ? null : cached;
    }
  };

  function ensureRoomController(roomId, cb) {
    if (roomControllers[roomId]) { cb(roomControllers[roomId]); return; }
    var host = document.createElement('div');
    host.className = 'room-track-host';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
    spotifyApiPromise.then(function (IFrameAPI) {
      if (!IFrameAPI) return;
      IFrameAPI.createController(host, { uri: 'spotify:track:' + ROOM_TRACKS[roomId] }, function (controller) {
        roomControllers[roomId] = controller;
        controller.addListener('playback_update', function (e) {
          if (ambient && ambient.roomId === roomId) {
            ambient.isPaused = !!(e && e.data && e.data.isPaused);
            document.dispatchEvent(new CustomEvent('pp:ambient-playback'));
          }
        });
        cb(controller);
      });
    });
  }

  var loungeIntro = null;
  document.addEventListener('pp:room-change', function (e) {
    var id = e.detail && e.detail.id;

    // Leaving whichever room owned the currently-playing ambient track
    // (individual track or the Lounge's own controller) pauses it --
    // covers every case, including paging away from the Lounge mid-sting.
    if (ambient && ambient.roomId !== id) {
      if (loungeIntro && ambient.roomId === 'music-lounge' && !loungeIntro.paused) loungeIntro.pause();
      ambient.controller.pause();
      setAmbient(null, null);
    }

    if (id === 'music-lounge') {
      function playLounge() {
        ensureLoungeController(function (controller) {
          var pager = window.PPRoomPagers && window.PPRoomPagers[0];
          if (pager && pager.getCurrentId() !== 'music-lounge') return;
          controller.play();
          setAmbient('music-lounge', controller);
        });
      }
      if (!loungeIntro) {
        loungeIntro = new Audio('assets/audio/music-lounge-intro.m4a');
        loungeIntro.addEventListener('ended', playLounge);
      }
      loungeIntro.currentTime = 0;
      loungeIntro.play().catch(playLounge);
    } else if (ROOM_TRACKS[id]) {
      ensureRoomController(id, function (controller) {
        // A later pp:room-change may have already fired (fast paging) by
        // the time this lazy controller resolves -- only play/claim the
        // ambient slot if we're still actually in this room.
        var pager = window.PPRoomPagers && window.PPRoomPagers[0];
        if (pager && pager.getCurrentId() !== id) return;
        if (id === 'penthouse-living') {
          // The Living Room keeps its track assigned and controllable from
          // the remote, but doesn't autoplay on entry -- the TV's own audio
          // stays the room's default sound, same as before this track existed.
          setAmbient(id, controller, true);
        } else {
          controller.play();
          setAmbient(id, controller);
        }
      });
    }
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
