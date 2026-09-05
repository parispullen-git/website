/* Clickable TV overlays (see .floor-scene__screen) — click the screen to open
   a small remote: mute/volume via the YouTube postMessage API, channel
   switching across a per-screen list of {id,label} videos, and a "Watch Full
   Screen" button that opens a single shared large-view modal.

   Channel lists are editable live from the dashboard's Video panel (the
   'channels' collection, one record with id 'main' holding the whole
   {living:[...], cinema:[...]} object) rather than requiring a rebuild.
   Two-tier fallback:
     1. /.netlify/functions/content?collection=channels&id=main -- dashboard edits.
     2. data/house-channels.json -- the static seed file (edit directly, or
        via the local Operator Console), used if the record above doesn't
        exist yet or the fetch fails. This is a plain runtime fetch of a
        static JSON file either way, so edits to either source take effect
        on next load with no rebuild step. */
(function () {
  'use strict';

  var CHANNEL_SETS = {};
  var DEFAULT_SET = 'living';

  function hasChannels(data) {
    return data && Object.keys(data).some(function (k) { return Array.isArray(data[k]) && data[k].length; });
  }

  var channelsReady = fetch('/.netlify/functions/content?collection=channels&id=main')
    .then(function (r) { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(function (data) {
      if (!hasChannels(data)) throw new Error('empty');
      CHANNEL_SETS = data;
    })
    .catch(function () {
      return fetch('data/house-channels.json')
        .then(function (r) { return r.json(); })
        .then(function (data) { CHANNEL_SETS = data || {}; })
        .catch(function () { CHANNEL_SETS = {}; });
    });

  // No loop param: a looped video never reaches YouTube's "ended" state,
  // and the whole point here is to detect that state and advance to the
  // next channel automatically -- see the playerState handling below.
  function embedSrc(id, muted) {
    return 'https://www.youtube.com/embed/' + id +
      '?autoplay=1&mute=' + (muted ? 1 : 0) +
      '&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&enablejsapi=1';
  }

  function post(iframe, func, args) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
  }

  /* ---------- fast-forward / rewind ----------
     YouTube's embed only exposes an ABSOLUTE seekTo, so a relative "skip
     10s" needs to know current playback position. Every embedded player
     starts pushing periodic infoDelivery messages once you send it a
     "listening" handshake -- we do that on every iframe load, track the
     latest currentTime per screen/modal here, and seek relative to that. */
  var ALL_STATES = [];
  // Every screen's state, keyed by its channel-set id ("living", "cinema")
  // -- lets the global Suite Remote (see initSuiteRemote) reach a given
  // screen's iframe/state from anywhere on the page, not just from inside
  // the room that screen physically lives in.
  var STATE_BY_KEY = {};

  // Any UI showing a state's live info (mute label, channel, play/pause)
  // calls this after changing it, and listens for the event to redraw --
  // decouples state mutation from whichever surface (the per-screen panel,
  // the global Suite Remote) happens to be displaying it right now.
  function notifyState(state) {
    document.dispatchEvent(new CustomEvent('pp:tv-state', { detail: { key: state.key } }));
  }

  function startListening(iframe) {
    if (!iframe) return;
    iframe.addEventListener('load', function onLoad() {
      iframe.removeEventListener('load', onLoad);
      setTimeout(function () {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');
        }
      }, 250);
    });
  }

  window.addEventListener('message', function (e) {
    var data;
    try { data = JSON.parse(e.data); } catch (err) { return; }
    if (!data || data.event !== 'infoDelivery' || !data.info) return;
    var t = data.info.currentTime;
    var ps = data.info.playerState; // YouTube IFrame API: 0 === ended
    if (activeState && modalIframe && e.source === modalIframe.contentWindow) {
      if (typeof t === 'number') activeState.currentTime = t;
      // YouTube IFrame API playerState: 1 = playing, 2 = paused, 0 = ended.
      // Sourced from real player events (not just the button click) so the
      // Play/Pause glyph stays correct even if playback state changes some
      // other way (e.g. buffering resolving back into playing).
      if (ps === 1 || ps === 2) {
        var paused = ps === 2;
        if (activeState.isPaused !== paused) { activeState.isPaused = paused; updateModalPlayLabel(); }
      }
      if (ps === 0) setModalChannel(activeState.chIndex + 1, true); // carry current sound state over
      return;
    }
    for (var i = 0; i < ALL_STATES.length; i++) {
      var st = ALL_STATES[i];
      if (st.iframe && e.source === st.iframe.contentWindow) {
        if (typeof t === 'number') st.currentTime = t;
        if (ps === 1 || ps === 2) {
          var stPaused = ps === 2;
          if (st.isPaused !== stPaused) { st.isPaused = stPaused; notifyState(st); }
        }
        if (ps === 0 && st.onEnded) st.onEnded();
        return;
      }
    }
  });

  function seek(iframe, state, delta) {
    if (!state) return;
    var base = typeof state.currentTime === 'number' ? state.currentTime : 0;
    var target = Math.max(0, base + delta);
    post(iframe, 'seekTo', [target, true]);
    state.currentTime = target; // optimistic, corrected by the next infoDelivery tick
  }

  /* The room photo behind each screen is sized with object-fit:cover, so the
     crop (and therefore where the TV sits on screen) shifts with viewport
     size. Recompute the overlay's --x/--y/--w/--h from the actual rendered
     image geometry rather than relying on a single hardcoded percentage box. */
  function positionScreen(screen) {
    var box = (screen.dataset.box || '').split(',').map(Number);
    if (box.length !== 4 || box.some(isNaN)) return;
    var container = screen.closest('.floor-scene, .pent__room');
    var img = container && container.querySelector('img');
    if (!img || !img.naturalWidth || !img.naturalHeight) return;

    var rect = img.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var natW = img.naturalWidth, natH = img.naturalHeight;
    var scale = Math.max(rect.width / natW, rect.height / natH);
    var dispW = natW * scale, dispH = natH * scale;
    var offX = (rect.width - dispW) / 2, offY = (rect.height - dispH) / 2;

    function toPct(fx, fy) {
      var px = fx * natW, py = fy * natH;
      return { x: (offX + px * scale) / rect.width * 100, y: (offY + py * scale) / rect.height * 100 };
    }
    var tl = toPct(box[0], box[1]);
    var br = toPct(box[2], box[3]);

    var cx = (tl.x + br.x) / 2, cy = (tl.y + br.y) / 2;
    var w = br.x - tl.x, h = br.y - tl.y;

    // On a narrow/tall viewport the aggressive height-driven object-fit:cover
    // crop can leave less width on screen than the box's natural-image
    // fraction expects, so the box would render wider than what's actually
    // visible. Shrink both dimensions together (preserving aspect ratio) so
    // it never overflows, then re-clamp the center so it can't hang off an
    // edge either. No-op on desktop, where the crop is width-driven instead.
    var overflow = Math.max(w / 100, h / 100, 1);
    w /= overflow; h /= overflow;
    cx = Math.min(Math.max(cx, w / 2), 100 - w / 2);
    cy = Math.min(Math.max(cy, h / 2), 100 - h / 2);

    screen.style.setProperty('--x', cx + '%');
    screen.style.setProperty('--y', cy + '%');
    screen.style.setProperty('--w', w + '%');
    screen.style.setProperty('--h', h + '%');
  }

  function positionAllScreens() {
    Array.prototype.forEach.call(document.querySelectorAll('.floor-scene__screen[data-box]'), positionScreen);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(positionAllScreens, 100);
  });

  /* ---------- mobile bottom-sheet remote ----------
     Below the breakpoint, the small in-page remote becomes a true viewport-
     fixed bottom sheet instead of a panel anchored under the screen frame.
     .floor-scene__screen (the remote's normal parent) has its own
     transform:translate(-50%,-50%) for centering, which would make a plain
     position:fixed on a descendant fix to THAT box instead of the real
     viewport -- so on entering mobile the remote is physically re-parented
     into a shared scrim on document.body (same trick buildModal() already
     uses for the fullscreen modal), and moved back to its original parent
     on the way out. Same element, same listeners -- just relocated. */
  var mqMobile = window.matchMedia('(max-width:760px)'); // kept for its 'change' event only
  // Re-queries matchMedia fresh every call rather than trusting mqMobile's
  // own .matches: that reused object intermittently reported a stale
  // (non-live) value elsewhere on this site (see room-pager.js) for
  // reasons that never reproduced under direct manual testing -- querying
  // fresh each time is cheap and sidesteps it outright.
  function isMobile() { return window.matchMedia('(max-width:760px)').matches; }
  var sheetScrim;
  var ALL_REMOTES = [];

  function buildSheetHost() {
    if (sheetScrim) return;
    sheetScrim = document.createElement('div');
    sheetScrim.className = 'tv-sheet-scrim';
    sheetScrim.addEventListener('click', function (e) {
      if (e.target !== sheetScrim) return;
      setRemoteOpen(sheetScrim.querySelector('.tv-remote.is-open'), false);
    });
    document.body.appendChild(sheetScrim);
  }

  function injectSheetClose(remote) {
    if (remote.querySelector('[data-tv-sheet-close]')) return;
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'tv-remote__sheet-close';
    closeBtn.setAttribute('data-tv-sheet-close', '');
    closeBtn.textContent = 'Close ✕';
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setRemoteOpen(remote, false);
    });
    remote.insertBefore(closeBtn, remote.firstChild);
  }

  function setRemoteOpen(remote, open) {
    if (!remote) return;
    remote.classList.toggle('is-open', open);
    if (remote.classList.contains('is-sheet') && sheetScrim) {
      sheetScrim.classList.toggle('is-open', open);
    }
  }

  function toggleRemote(remote) {
    var opening = !remote.classList.contains('is-open');
    // Only one bottom sheet open at a time -- opening a second TV's sheet
    // (or the Remote marker) closes whichever one is already up.
    if (opening && remote.classList.contains('is-sheet')) {
      ALL_REMOTES.forEach(function (r) { if (r !== remote) setRemoteOpen(r, false); });
    }
    setRemoteOpen(remote, opening);
  }

  function applySheetMode(remote, isMobile) {
    var isSheet = remote.classList.contains('is-sheet');
    if (isMobile && !isSheet) {
      setRemoteOpen(remote, false);
      buildSheetHost();
      injectSheetClose(remote);
      remote.classList.add('is-sheet');
      sheetScrim.appendChild(remote);
    } else if (!isMobile && isSheet) {
      setRemoteOpen(remote, false);
      remote.classList.remove('is-sheet');
      if (remote.__homeParent) remote.__homeParent.appendChild(remote);
    }
  }

  function updateAllSheetModes() {
    ALL_REMOTES.forEach(function (remote) { applySheetMode(remote, isMobile()); });
  }
  mqMobile.addEventListener('change', updateAllSheetModes);

  /* ---------- shared "watch full screen" modal ---------- */
  var modalEl, modalIframe, modalMuteBtn, modalPlayBtn, modalLowerThird, modalLowerThirdTitle;
  var modalGuideEl, modalGuideList, modalRotateEl;
  var rotatePromptDismissed = false; // reset every time the modal opens fresh
  var activeState = null; // the screen state object the modal is currently bound to

  // Small/narrow + portrait = a phone held upright -- nudge toward landscape,
  // where the full-bleed video actually gets to be full-bleed. Re-checked on
  // every orientation/resize change while the modal is open, so rotating the
  // device dismisses it automatically; the visitor can also dismiss by hand.
  function updateRotatePrompt() {
    if (!modalRotateEl || !modalEl || !modalEl.classList.contains('is-open')) return;
    var shouldShow = !rotatePromptDismissed &&
      window.matchMedia('(max-width:760px) and (orientation:portrait)').matches;
    modalRotateEl.hidden = !shouldShow;
  }

  /* Branded title card standing in for YouTube's own (unremovable, cross-origin)
     title/channel overlay — shown briefly whenever a channel loads or switches. */
  function showLowerThird(el, titleEl, label) {
    if (!el) return;
    if (titleEl) titleEl.textContent = label;
    clearTimeout(el._hideTimer);
    el.classList.add('is-visible');
    el._hideTimer = setTimeout(function () {
      el.classList.remove('is-visible');
    }, 4000);
  }

  function buildModal() {
    if (modalEl) return;
    modalEl = document.createElement('div');
    modalEl.className = 'tv-modal';
    modalEl.innerHTML =
      '<div class="tv-modal__frame">' +
        '<button type="button" class="tv-modal__close" data-tv-modal-close aria-label="Close">Close &#215;</button>' +
        '<iframe title="" allow="autoplay; encrypted-media"></iframe>' +
        '<div class="tv-lowerthird" data-tv-modal-lowerthird>' +
          '<p class="tv-lowerthird__eyebrow">Paris Pullen &#183; Now Screening</p>' +
          '<p class="tv-lowerthird__title" data-tv-modal-lowerthird-title></p>' +
        '</div>' +
        '<div class="tv-modal__controls">' +
          '<div class="tv-modal__group">' +
            '<button type="button" data-tv-modal-action="guide" aria-label="Guide">&#9776; Guide</button>' +
            '<button type="button" data-tv-modal-action="ch-prev" aria-label="Previous channel">&#9664;</button>' +
            '<button type="button" data-tv-modal-action="ch-next" aria-label="Next channel">&#9654;</button>' +
          '</div>' +
          '<div class="tv-modal__group tv-modal__group--center">' +
            '<button type="button" data-tv-modal-action="rw" aria-label="Rewind 10 seconds">&#9198; 10</button>' +
            '<button type="button" class="tv-modal__playpause" data-tv-modal-action="play-pause" data-tv-modal-playpause aria-label="Pause">&#10074;&#10074;</button>' +
            '<button type="button" data-tv-modal-action="ff" aria-label="Forward 10 seconds">10 &#9197;</button>' +
          '</div>' +
          '<div class="tv-modal__group">' +
            '<button type="button" data-tv-modal-action="vol-down" aria-label="Volume down">Vol &#8722;</button>' +
            '<button type="button" data-tv-modal-action="mute" data-tv-modal-mute>Mute</button>' +
            '<button type="button" data-tv-modal-action="vol-up" aria-label="Volume up">Vol &#43;</button>' +
          '</div>' +
        '</div>' +
        '<div class="tv-guide" data-tv-guide hidden>' +
          '<div class="tv-guide__panel">' +
            '<div class="tv-guide__head">' +
              '<p class="tv-guide__eyebrow">Guide</p>' +
              '<button type="button" class="tv-guide__close" data-tv-guide-close aria-label="Close guide">Close &#215;</button>' +
            '</div>' +
            '<ul class="tv-guide__list" data-tv-guide-list></ul>' +
          '</div>' +
        '</div>' +
        '<div class="tv-modal__rotate" data-tv-modal-rotate hidden>' +
          '<div class="tv-modal__rotate-icon" aria-hidden="true"></div>' +
          '<p class="tv-modal__rotate-text">Turn your phone sideways for full screen</p>' +
          '<button type="button" class="tv-modal__rotate-dismiss" data-tv-modal-rotate-dismiss>Continue anyway</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modalEl);

    modalIframe = modalEl.querySelector('iframe');
    modalMuteBtn = modalEl.querySelector('[data-tv-modal-mute]');
    modalPlayBtn = modalEl.querySelector('[data-tv-modal-playpause]');
    modalLowerThird = modalEl.querySelector('[data-tv-modal-lowerthird]');
    modalLowerThirdTitle = modalEl.querySelector('[data-tv-modal-lowerthird-title]');
    modalGuideEl = modalEl.querySelector('[data-tv-guide]');
    modalGuideList = modalEl.querySelector('[data-tv-guide-list]');
    modalRotateEl = modalEl.querySelector('[data-tv-modal-rotate]');

    var mqRotatePortrait = window.matchMedia('(max-width:760px) and (orientation:portrait)');
    mqRotatePortrait.addEventListener('change', updateRotatePrompt);

    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) { closeModal(); return; }
      if (e.target.closest('[data-tv-modal-close]')) { closeModal(); return; }
      if (e.target.closest('[data-tv-modal-rotate-dismiss]')) {
        rotatePromptDismissed = true;
        modalRotateEl.hidden = true;
        return;
      }
      if (e.target.closest('[data-tv-guide-close]')) { modalGuideEl.hidden = true; return; }
      var guideBtn = e.target.closest('[data-tv-guide-select]');
      if (guideBtn) {
        setModalChannel(parseInt(guideBtn.dataset.tvGuideSelect, 10), true);
        modalGuideEl.hidden = true;
        return;
      }
      var btn = e.target.closest('[data-tv-modal-action]');
      if (!btn || !activeState) return;
      switch (btn.dataset.tvModalAction) {
        case 'vol-up':
          activeState.volume = Math.min(100, activeState.volume + 10);
          if (activeState.muted) { activeState.muted = false; post(modalIframe, 'unMute'); }
          post(modalIframe, 'setVolume', [activeState.volume]);
          updateModalMuteLabel();
          break;
        case 'vol-down':
          activeState.volume = Math.max(0, activeState.volume - 10);
          post(modalIframe, 'setVolume', [activeState.volume]);
          if (activeState.volume === 0 && !activeState.muted) {
            activeState.muted = true; post(modalIframe, 'mute'); updateModalMuteLabel();
          }
          break;
        case 'mute':
          activeState.muted = !activeState.muted;
          activeState.autoMuted = false; // deliberate manual toggle overrides enter/leave logic
          post(modalIframe, activeState.muted ? 'mute' : 'unMute');
          if (!activeState.muted) post(modalIframe, 'setVolume', [activeState.volume || 50]);
          updateModalMuteLabel();
          break;
        case 'play-pause':
          activeState.isPaused = !activeState.isPaused;
          post(modalIframe, activeState.isPaused ? 'pauseVideo' : 'playVideo');
          updateModalPlayLabel();
          break;
        case 'ch-prev':
          // preserveSound: true -- fullscreen is always-unmuted by design
          // (see openModal), so a manual channel flip here shouldn't reset it.
          setModalChannel(activeState.chIndex - 1, true);
          break;
        case 'ch-next':
          setModalChannel(activeState.chIndex + 1, true);
          break;
        case 'guide':
          renderGuide();
          modalGuideEl.hidden = false;
          break;
        case 'rw':
          seek(modalIframe, activeState, -10);
          break;
        case 'ff':
          seek(modalIframe, activeState, 10);
          break;
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalEl.classList.contains('is-open')) closeModal();
    });
  }

  function updateModalMuteLabel() {
    if (modalMuteBtn) modalMuteBtn.textContent = activeState && activeState.muted ? 'Unmute' : 'Mute';
  }

  function updateModalPlayLabel() {
    if (!modalPlayBtn) return;
    var paused = activeState && activeState.isPaused;
    modalPlayBtn.innerHTML = paused ? '&#9654;' : '&#10074;&#10074;';
    modalPlayBtn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
  }

  // Safe against untrusted-looking labels: built with textContent, not innerHTML.
  function renderGuide() {
    if (!modalGuideList || !activeState) return;
    modalGuideList.innerHTML = '';
    activeState.channels.forEach(function (ch, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.tvGuideSelect = i;
      btn.textContent = ch.label;
      if (i === activeState.chIndex) btn.className = 'is-active';
      li.appendChild(btn);
      modalGuideList.appendChild(li);
    });
  }

  /* Replace the iframe element outright (src baked into the markup from the
     start) rather than creating an empty iframe and assigning .src after —
     the latter left the YouTube player stuck mid-load in testing. */
  function setModalIframe(id, muted) {
    var fresh = document.createElement('iframe');
    fresh.title = '';
    fresh.setAttribute('allow', 'autoplay; encrypted-media');
    fresh.src = embedSrc(id, muted);
    modalIframe.replaceWith(fresh);
    modalIframe = fresh;
    if (activeState) activeState.currentTime = 0;
    startListening(modalIframe);
  }

  function setModalChannel(i, preserveSound) {
    var list = activeState.channels;
    activeState.chIndex = (i + list.length) % list.length;
    var ch = list[activeState.chIndex];
    var muted = preserveSound ? activeState.muted : true;
    activeState.muted = muted;
    activeState.isPaused = false; // a fresh channel always starts autoplaying
    setModalIframe(ch.id, muted);
    if (!muted) post(modalIframe, 'setVolume', [activeState.volume || 100]);
    if (activeState.syncLabel) activeState.syncLabel(ch.label);
    showLowerThird(modalLowerThird, modalLowerThirdTitle, ch.label);
    updateModalMuteLabel();
    updateModalPlayLabel();
  }

  function openModal(state) {
    buildModal();
    activeState = state;
    state.iframe.src = ''; // fully stop the small TV rather than just pausing it —
                            // two simultaneous YouTube embeds can starve each other
    modalEl.classList.add('is-open');
    rotatePromptDismissed = false;
    updateRotatePrompt();
    var ch = state.channels[state.chIndex];
    // Full screen is opened via a direct click, a strong enough user gesture
    // that autoplay-with-sound is reliably allowed -- so open unmuted rather
    // than forcing the visitor to hit Mute -> Unmute for no reason.
    state.muted = false;
    state.isPaused = false;
    setModalIframe(ch.id, false);
    post(modalIframe, 'setVolume', [state.volume || 100]);
    showLowerThird(modalLowerThird, modalLowerThirdTitle, ch.label);
    updateModalMuteLabel();
    updateModalPlayLabel();
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    modalIframe.src = '';
    if (modalGuideEl) modalGuideEl.hidden = true;
    if (modalRotateEl) modalRotateEl.hidden = true;
    if (activeState) {
      var ch = activeState.channels[activeState.chIndex];
      activeState.muted = true;
      activeState.iframe.src = embedSrc(ch.id, true);
      if (activeState.updateMuteLabel) activeState.updateMuteLabel();
      if (activeState.syncLabel) activeState.syncLabel(ch.label);
    }
    activeState = null;
  }

  function initScreen(screen) {
    if (screen.dataset.tvInited) return;
    var frame = screen.querySelector('.floor-scene__screen-frame');
    var iframe = screen.querySelector('iframe');
    var remote = screen.querySelector('[data-tv-remote]');
    var channelLabel = screen.querySelector('[data-tv-channel-label]');
    var muteBtn = screen.querySelector('[data-tv-action="mute"]');
    var pwrBtn = screen.querySelector('.tv-remote__pwr');
    var padHub = screen.querySelector('.tv-remote__pad-hub');
    var lowerThird = screen.querySelector('[data-tv-lowerthird]');
    var lowerThirdTitle = screen.querySelector('[data-tv-lowerthird-title]');
    var soundPrompt = screen.querySelector('[data-tv-sound-prompt]');
    var guidePanel = screen.querySelector('[data-tv-guide-panel]');
    var guideList = screen.querySelector('[data-tv-guide-list]');
    if (!frame || !iframe || !remote) return;
    screen.dataset.tvInited = '1';

    remote.__homeParent = screen;
    ALL_REMOTES.push(remote);
    applySheetMode(remote, isMobile());

    var channels = CHANNEL_SETS[screen.dataset.channelSet] || CHANNEL_SETS[DEFAULT_SET];
    // The baked src now requests mute=0 (unmuted autoplay) rather than
    // mute=1 -- but whether that's actually honored is entirely up to the
    // browser's autoplay policy, and there's no reliable postMessage way to
    // ask YouTube's embed whether it silently fell back to muted. Tracking
    // state.muted as true here (rather than matching the optimistic mute=0
    // request) keeps the enter-room logic below making its own unmute
    // attempt, backed by the guaranteed "Tap for Sound" fallback, on first
    // view -- if mute=0 already worked, that attempt is just a harmless
    // no-op; if it didn't, this is what actually gets sound on.
    var state = { key: screen.dataset.channelSet, chIndex: 0, volume: 100, muted: true, iframe: iframe,
      channels: channels, currentTime: 0, isPaused: false,
      autoMuted: false }; // true only when OUR leave-the-room logic muted it, never on a manual mute --
                          // that distinction is what lets re-entering unmute again without overriding
                          // a deliberate manual mute.
    ALL_STATES.push(state);
    STATE_BY_KEY[state.key] = state;
    state.updateMuteLabel = function () {
      if (muteBtn) muteBtn.textContent = state.muted ? 'Unmute' : 'Mute';
    };
    state.syncLabel = function (label) {
      if (channelLabel) channelLabel.textContent = label;
    };
    state.updatePlayLabel = function () {
      if (padHub) padHub.classList.toggle('is-paused', state.isPaused);
    };
    // Keeps this panel's own mute/play-pause display correct even when the
    // change came from elsewhere (the global Suite Remote, or a real
    // playerState correction from YouTube itself via the message listener
    // above) rather than a click on this exact panel.
    document.addEventListener('pp:tv-state', function (e) {
      if (e.detail && e.detail.key === state.key) { state.updateMuteLabel(); state.updatePlayLabel(); }
    });

    // Shared verbs -- used by this screen's own embedded panel below, and
    // callable from anywhere else that holds this same state object (the
    // global Suite Remote looks a state up by key rather than duplicating
    // this logic against a second iframe reference).
    state.toggleMute = function () {
      state.muted = !state.muted;
      state.autoMuted = false;
      post(iframe, state.muted ? 'mute' : 'unMute');
      if (!state.muted) post(iframe, 'setVolume', [state.volume || 50]);
      state.updateMuteLabel();
      if (soundPrompt) { clearTimeout(soundPrompt._hideTimer); soundPrompt.hidden = true; }
      notifyState(state);
    };
    state.togglePlayPause = function () {
      state.isPaused = !state.isPaused;
      post(iframe, state.isPaused ? 'pauseVideo' : 'playVideo');
      notifyState(state);
    };
    state.chPrev = function () { loadChannel(state.chIndex - 1); notifyState(state); };
    state.chNext = function () { loadChannel(state.chIndex + 1); notifyState(state); };
    state.seekRw = function () { seek(iframe, state, -10); };
    state.seekFf = function () { seek(iframe, state, 10); };
    state.togglePower = function () {
      state.isOff = !state.isOff;
      if (state.isOff) {
        iframe.src = '';
      } else {
        var ch = channels[state.chIndex];
        state.muted = true;
        state.isPaused = false;
        iframe.src = embedSrc(ch.id, true);
        startListening(iframe);
        state.updateMuteLabel();
      }
      notifyState(state);
    };
    state.openFullscreen = function () { openModal(state); };

    // Screens outside the start room are baked with no src at all (see
    // build_house.py/penthouse.js) -- nothing to listen to yet; the
    // IntersectionObserver "entering" branch below calls loadChannel()
    // the first time this room actually comes on screen, which starts
    // listening itself at that point. Checked via getAttribute, not the
    // iframe.src PROPERTY -- an empty src="" attribute still resolves
    // that property to the current page's own URL (empty relative refs
    // resolve against the document's base), so iframe.src itself is
    // never actually falsy here even when nothing was baked in.
    function hasRealSrc() { return !!iframe.getAttribute('src'); }
    if (hasRealSrc()) startListening(iframe); // the src baked into the initial markup

    // preserveSound: used when a channel auto-advances because the previous
    // video ended (not a deliberate remote press) -- the room shouldn't go
    // silent just because playback moved to the next trailer, so carry the
    // current mute state over instead of resetting to muted. Otherwise
    // (including a lazily-loaded screen's very first real src assignment,
    // see the IntersectionObserver below) always requests guaranteed-muted
    // autoplay -- getting real sound on from there is entirely the job of
    // the postMessage 'unMute' attempt + guaranteed Tap-for-Sound fallback
    // that follows on entry, which works identically on mobile and desktop.
    function loadChannel(i, preserveSound) {
      state.chIndex = (i + channels.length) % channels.length;
      var ch = channels[state.chIndex];
      state.currentTime = 0;
      var muted = preserveSound ? state.muted : true;
      iframe.src = embedSrc(ch.id, muted);
      startListening(iframe);
      state.syncLabel(ch.label);
      showLowerThird(lowerThird, lowerThirdTitle, ch.label);
      state.muted = muted;
      state.isPaused = false; // a freshly loaded channel always starts autoplaying
      if (!muted) post(iframe, 'setVolume', [state.volume || 100]);
      state.updateMuteLabel();
      notifyState(state);
    }
    state.loadChannel = loadChannel; // exposed for the global Suite Remote's Guide picker

    state.onEnded = function () { loadChannel(state.chIndex + 1, true); };

    // Same Guide picker as the fullscreen modal's, scoped to this screen's
    // own channel list -- built with textContent, not innerHTML, since
    // channel labels ultimately come from the dashboard's live collection.
    function renderRemoteGuide() {
      if (!guideList) return;
      guideList.innerHTML = '';
      channels.forEach(function (ch, i) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.tvGuideSelect = i;
        btn.textContent = ch.label;
        if (i === state.chIndex) btn.className = 'is-active';
        li.appendChild(btn);
        guideList.appendChild(li);
      });
    }

    // The FIRST channel shown is baked into the page's own markup at
    // build/render time (build_house.py / penthouse.js's TV_SCREENS), so
    // it can go stale the moment someone edits channel #1 for this room
    // from the dashboard without also regenerating those files. Since
    // channelsReady has already resolved by the time initScreen runs, we
    // know here whether the live/fallback list actually agrees with what
    // got rendered -- if not, load the real first channel now rather than
    // only fixing it the next time someone manually flips channels.
    // Skipped entirely for a screen baked with no src (not the start
    // room) -- loading it now would defeat the whole point of waiting
    // for a real first entry, and there's no staleness to correct for a
    // channel that was never pre-baked in the first place.
    if (hasRealSrc() && channels.length && channels[0].id && iframe.src.indexOf('/' + channels[0].id + '?') === -1) {
      loadChannel(0);
    }

    frame.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleRemote(remote);
    });

    // "The Remote" artifact node (data-tv-remote-toggle) -- its click
    // handling now lives entirely in initSuiteRemote() below, which opens
    // the one global Suite Remote pre-set to this screen's source, rather
    // than this room's own embedded panel (tapping the physical screen
    // itself, right above, still opens that one directly).

    remote.addEventListener('click', function (e) {
      e.stopPropagation();
      var guideBtn = e.target.closest('[data-tv-guide-select]');
      if (guideBtn) {
        loadChannel(parseInt(guideBtn.dataset.tvGuideSelect, 10), true);
        if (guidePanel) guidePanel.hidden = true;
        return;
      }
      var btn = e.target.closest('[data-tv-action]');
      if (!btn) return;
      switch (btn.dataset.tvAction) {
        case 'guide':
          renderRemoteGuide();
          if (guidePanel) guidePanel.hidden = false;
          break;
        case 'guide-close':
          if (guidePanel) guidePanel.hidden = true;
          break;
        case 'vol-up':
          state.volume = Math.min(100, state.volume + 10);
          if (state.muted) { state.muted = false; post(iframe, 'unMute'); }
          post(iframe, 'setVolume', [state.volume]);
          state.updateMuteLabel();
          break;
        case 'vol-down':
          state.volume = Math.max(0, state.volume - 10);
          post(iframe, 'setVolume', [state.volume]);
          if (state.volume === 0 && !state.muted) { state.muted = true; post(iframe, 'mute'); state.updateMuteLabel(); }
          break;
        case 'mute':
          state.toggleMute();
          break;
        case 'playpause':
          state.togglePlayPause();
          break;
        case 'ch-prev':
          state.chPrev();
          break;
        case 'ch-next':
          state.chNext();
          break;
        case 'rw':
          state.seekRw();
          break;
        case 'ff':
          state.seekFf();
          break;
        case 'expand':
          remote.classList.remove('is-open');
          state.openFullscreen();
          break;
        case 'power':
          state.togglePower();
          remote.classList.toggle('is-power-off', state.isOff);
          if (pwrBtn) pwrBtn.classList.toggle('is-off', state.isOff);
          break;
      }
    });

    state.syncLabel(channels[0].label);
    state.updatePlayLabel();
    showLowerThird(lowerThird, lowerThirdTitle, channels[0].label);

    var container = screen.closest('.floor-scene, .pent__room');
    var img = container && container.querySelector('img');
    if (img) {
      if (img.complete) positionScreen(screen);
      img.addEventListener('load', function () { positionScreen(screen); });
    }

    // A room's TV opens with sound the first time you actually arrive at
    // it — not on page load, and not every time you swipe back through.
    // This unmutes an already-autoplaying (muted) embed rather than
    // starting new playback, which browsers generally allow without a
    // fresh click -- but "generally" isn't "always": some browsers block
    // even that without a very direct, in-the-moment gesture, and a
    // postMessage command gives no way to detect whether it was actually
    // honored. So this is backed by a real fallback rather than a hope:
    // a brief, unobtrusive "Tap for Sound" prompt appears every time
    // alongside the automatic attempt. If the browser allowed the auto
    // unmute, the prompt is just background and fades on its own. If it
    // didn't, tapping it is a direct gesture that's guaranteed to work.
    function promptForSound() {
      if (!soundPrompt || state.isOff) return;
      soundPrompt.hidden = false;
      clearTimeout(soundPrompt._hideTimer);
      soundPrompt._hideTimer = setTimeout(function () {
        soundPrompt.hidden = true;
      }, 4500);
    }

    if (soundPrompt) {
      soundPrompt.addEventListener('click', function (e) {
        e.stopPropagation();
        state.muted = false;
        post(iframe, 'unMute');
        post(iframe, 'setVolume', [state.volume || 100]);
        state.updateMuteLabel();
        clearTimeout(soundPrompt._hideTimer);
        soundPrompt.hidden = true;
      });
    }

    // Enter the room, sound comes up (with the tap-fallback above backing
    // it); leave the room, it goes back down -- every time, not just the
    // first. autoMuted is what keeps this from fighting a deliberate
    // manual mute/unmute: only a mute WE applied on the way out gets
    // reversed on the way back in.
    if (container && 'IntersectionObserver' in window) {
      var everEnteredRoom = false;
      var soundObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (state.isOff) return;
          if (entry.isIntersecting) {
            // A screen outside the start room was baked with no src at all
            // (see build_house.py/penthouse.js) -- nothing has been
            // playing, muted or otherwise, until this first real arrival.
            // Load it now (guaranteed-muted, like any other loadChannel
            // call), then treat this exactly like any other "just
            // entered" pass below -- the shouldUnmute logic right after
            // this is what actually tries for real sound.
            if (!hasRealSrc()) loadChannel(0);
            // Always nudge playback on entry (cheap no-op if it's already
            // playing) -- some browsers suspend an autoplaying embed once
            // it's scrolled fully out of view, and postMessage gives no way
            // to ask whether that happened, so just ask it to play again
            // rather than trying to detect the suspended state first.
            post(iframe, 'playVideo');
            var shouldUnmute = state.muted && (state.autoMuted || !everEnteredRoom);
            everEnteredRoom = true;
            if (!shouldUnmute) return;
            state.muted = false;
            state.autoMuted = false;
            post(iframe, 'unMute');
            post(iframe, 'setVolume', [state.volume || 100]);
            state.updateMuteLabel();
            promptForSound();
          } else {
            if (!everEnteredRoom || state.muted) return;
            state.muted = true;
            state.autoMuted = true;
            post(iframe, 'mute');
            state.updateMuteLabel();
            if (soundPrompt) { clearTimeout(soundPrompt._hideTimer); soundPrompt.hidden = true; }
          }
        });
      }, { threshold: 0.6 });
      soundObserver.observe(container);
    }
  }

  document.addEventListener('click', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.tv-remote.is-open'), function (r) {
      r.classList.remove('is-open');
    });
  });

  /* ---------- global Suite Remote ----------
     One instance, injected once (not per room, not per screen), reachable
     from every room via a single fixed "Remote" pill -- unlike the old
     per-screen embedded panel (still there, opened by tapping a physical
     screen), this one works from rooms with no screen at all (Bedroom,
     Bath, Closet, Study, Kitchen) because it targets a screen's iframe by
     looked-up key (STATE_BY_KEY) rather than being physically parented
     inside that screen's own room markup.

     Three sources: TV and Cinema reuse the exact same per-screen state
     objects/verbs as the embedded panel (toggleMute, seekRw/Ff, etc. --
     see initScreen above), so the two surfaces can never drift out of
     sync with each other. Music plays the SAME dashboard-editable
     rotation the Piano artifact does (see piano-player.js) rather than a
     second, separately-maintained playlist -- embedded via Spotify's own
     iframe player, whose embed already has its own play/pause/seek/volume
     UI, so only stepping between entries needs remote buttons. */
  function initSuiteRemote() {
    // init() can run more than once (penthouse.js renders its rooms
    // asynchronously -- see the setTimeout(init, 300) retry below); guard
    // against injecting a second toggle/panel pair on the retry.
    if (document.querySelector('.suite-remote')) return;
    // Scope to pages that actually have Penthouse rooms (house.html,
    // the homepage) -- content pages like the City Guide have no TV/
    // Cinema/Music to control.
    if (!document.querySelector('[data-room-pager]')) return;

    // Last-resort only -- the real rotation is resolved at runtime by
    // resolveMusic() below. Kept so the Music tab can never render empty
    // even with every fetch tier unreachable (offline, function down).
    // "Slow, Smoky Vintage Noir Jazz -- The Night Is Mine"
    var MUSIC_FALLBACK = [
      { type: 'playlist', id: '1JhREpY7u0E0LAYTDgYKwz', label: 'The Night Is Mine' }
    ];

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'remote-toggle';
    toggleBtn.setAttribute('aria-label', 'Open the remote');
    toggleBtn.textContent = 'Remote';
    document.body.appendChild(toggleBtn);

    // One-tap play/pause for whichever screen the current room owns --
    // sits in the corner where the old (non-functional, no-op) "Sound
    // on/off" button used to be. Hidden in rooms with no screen at all
    // (nothing to play/pause there); reuses the exact same state verbs
    // and STATE_BY_KEY lookup the Suite Remote's own dial uses below, so
    // the two can never fall out of sync with each other.
    var ppBtn = document.createElement('button');
    ppBtn.type = 'button';
    ppBtn.className = 'playpause-toggle';
    ppBtn.hidden = true;
    ppBtn.innerHTML = '<span class="playpause-toggle__icon" aria-hidden="true"></span><span class="playpause-toggle__label">Pause</span>';
    document.body.appendChild(ppBtn);
    var ppLabel = ppBtn.querySelector('.playpause-toggle__label');

    var panel = document.createElement('div');
    panel.className = 'suite-remote';
    panel.innerHTML =
      '<div class="suite-remote__head">' +
        '<button type="button" class="suite-remote__pwr" data-sr-action="power" aria-label="Power">PWR</button>' +
        '<span class="suite-remote__brand">The Compliment</span>' +
        '<button type="button" class="suite-remote__close" data-sr-action="close" aria-label="Close remote">&#215;</button>' +
      '</div>' +
      '<div class="suite-remote__sources" role="tablist">' +
        '<button type="button" class="suite-remote__source" data-sr-source="tv">TV</button>' +
        '<button type="button" class="suite-remote__source" data-sr-source="music">Music</button>' +
        '<button type="button" class="suite-remote__source" data-sr-source="cinema">Cinema</button>' +
      '</div>' +
      '<p class="suite-remote__title" data-sr-title>&#8212;</p>' +
      '<div class="suite-remote__transport" data-sr-transport>' +
        '<button type="button" class="suite-remote__seek" data-sr-action="rw" aria-label="Rewind 10 seconds">&#9664;&#9664;</button>' +
        '<button type="button" class="suite-remote__dial" data-sr-action="playpause" aria-label="Play or pause"></button>' +
        '<button type="button" class="suite-remote__seek" data-sr-action="ff" aria-label="Fast forward 10 seconds">&#9654;&#9654;</button>' +
      '</div>' +
      '<div class="suite-remote__row" data-sr-transport>' +
        '<button type="button" class="suite-remote__pill" data-sr-action="mute">Mute</button>' +
        '<button type="button" class="suite-remote__pill" data-sr-action="guide">Guide</button>' +
      '</div>' +
      '<button type="button" class="suite-remote__fullscreen" data-sr-action="fullscreen" data-sr-transport>Watch Full Screen</button>' +
      '<div class="suite-remote__music" data-sr-music hidden></div>' +
      '<div class="suite-remote__guide-panel" data-sr-guide-panel hidden>' +
        '<div class="suite-remote__guide-head">' +
          '<p>Guide</p>' +
          '<button type="button" data-sr-action="guide-close" aria-label="Close guide">Close &#215;</button>' +
        '</div>' +
        '<ul data-sr-guide-list></ul>' +
      '</div>';
    document.body.appendChild(panel);

    var titleEl = panel.querySelector('[data-sr-title]');
    var dialBtn = panel.querySelector('.suite-remote__dial');
    var seekRow = panel.querySelector('.suite-remote__transport');
    var rwBtn = panel.querySelector('[data-sr-action="rw"]');
    var ffBtn = panel.querySelector('[data-sr-action="ff"]');
    var muteBtn = panel.querySelector('[data-sr-action="mute"]');
    var pwrBtn = panel.querySelector('.suite-remote__pwr');
    var musicEl = panel.querySelector('[data-sr-music]');
    var guidePanel = panel.querySelector('[data-sr-guide-panel]');
    var guideList = panel.querySelector('[data-sr-guide-list]');
    var transportEls = panel.querySelectorAll('[data-sr-transport]');
    var sourceBtns = panel.querySelectorAll('[data-sr-source]');

    var activeSource = 'tv'; // 'tv' | 'music' | 'cinema'
    var musicLoaded = false;
    var musicList = MUSIC_FALLBACK; // replaced once resolveMusic() lands
    var musicIdx = 0;
    var musicFrame = null;
    var contextualKey = null; // the current room's own channel-set, if any

    function keyForSource(src) { return src === 'tv' ? 'living' : src === 'cinema' ? 'cinema' : null; }
    // Named to avoid any confusion with the fullscreen modal's own
    // module-level `activeState` variable above -- unrelated concepts
    // that happen to share a similar name.
    function currentState() { var k = keyForSource(activeSource); return k && STATE_BY_KEY[k]; }
    function contextualSource() { return contextualKey === 'living' ? 'tv' : contextualKey === 'cinema' ? 'cinema' : null; }

    /* ---------- Music: the Piano's rotation, not a second playlist ----------
       Same {type,id,label} entries the Piano artifact plays, so a dashboard
       edit to the 'playlists' collection moves both surfaces at once.
       Resolution order, cheapest first:
         1. window.PP_PIANO_PLAYLISTS_RESOLVED -- piano-player.js already
            finished resolving; reuse its answer and fetch nothing at all.
         2. window.PP_PIANO_PLAYLISTS_READY -- piano-player.js is on the page
            but still in flight; wait on its promise instead of racing it
            with a duplicate request for the same data.
         3/4. the collection fetch, then data/house-music.json -- the exact
            two tiers piano-player.js uses, reached only on a page that
            doesn't load piano-player.js at all.
         5. MUSIC_FALLBACK -- last resort, so the tab is never empty. */
    function normalizeMusic(list) {
      if (!Array.isArray(list)) return null;
      var out = list.filter(function (it) { return it && it.type && it.id && it.label; });
      return out.length ? out : null;
    }

    function resolveMusic() {
      var already = normalizeMusic(window.PP_PIANO_PLAYLISTS_RESOLVED);
      if (already) return Promise.resolve(already);
      var ready = window.PP_PIANO_PLAYLISTS_READY;
      if (ready && typeof ready.then === 'function') return ready.then(normalizeMusic);
      return fetch('/.netlify/functions/content?collection=playlists')
        .then(function (r) { if (!r.ok) throw new Error('not found'); return r.json(); })
        .then(function (data) {
          var records = (data && data.records) || [];
          records.sort(function (a, b) {
            if (typeof a.order === 'number' && typeof b.order === 'number') return a.order - b.order;
            return (a.createdAt || 0) - (b.createdAt || 0);
          });
          var list = normalizeMusic(records.map(function (r) {
            return { type: r.type, id: r.spotifyId, label: r.label };
          }));
          if (!list) throw new Error('empty');
          return list;
        })
        .catch(function () {
          return fetch('data/house-music.json')
            .then(function (r) { return r.json(); })
            .then(normalizeMusic);
        });
    }

    // Kicked off at init (not on first Music click) so it has almost always
    // landed by the time anyone opens the tab; ensureMusicEmbed() still waits
    // on it rather than building the fallback embed and swapping its src out
    // from under a visitor who already pressed play.
    var musicReady = resolveMusic()
      .catch(function () { return null; })
      .then(function (list) {
        if (list && list.length) { musicList = list; musicIdx = 0; }
        if (activeSource === 'music') render();
      });

    function musicSrc(item) {
      return 'https://open.spotify.com/embed/' + item.type + '/' + item.id +
        '?utm_source=generator&theme=0';
    }

    function ensureMusicEmbed() {
      if (musicLoaded) return;
      musicLoaded = true;
      musicReady.then(function () {
        musicFrame = document.createElement('iframe');
        musicFrame.src = musicSrc(musicList[musicIdx]);
        musicFrame.width = '100%';
        musicFrame.height = '152';
        musicFrame.style.borderRadius = '12px';
        musicFrame.setAttribute('frameborder', '0');
        musicFrame.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
        musicFrame.loading = 'lazy';
        musicEl.appendChild(musicFrame);
      });
    }

    // Step through the rotation on the existing rw/ff buttons -- the Spotify
    // embed supplies its own play/pause, but nothing to reach the next entry.
    // Loads paused, exactly like the Piano's own prev/next.
    function stepMusic(delta) {
      if (musicList.length < 2) return;
      musicIdx = ((musicIdx + delta) % musicList.length + musicList.length) % musicList.length;
      if (musicFrame) musicFrame.src = musicSrc(musicList[musicIdx]);
      render();
    }

    function render() {
      Array.prototype.forEach.call(sourceBtns, function (b) {
        b.classList.toggle('is-active', b.dataset.srSource === activeSource);
      });
      var isMusic = activeSource === 'music';
      // Music keeps ONE transport group -- the rw/ff pair, repurposed as
      // prev/next through the rotation. Mute/Guide/Fullscreen stay hidden
      // (nothing to point them at) and so does the play dial: the Spotify
      // embed owns its own play/pause. The dial's class rule sets
      // display:flex, which outranks the [hidden] attribute, so it has to
      // be hidden inline rather than via el.hidden like the groups.
      var canStep = isMusic && musicList.length > 1;
      Array.prototype.forEach.call(transportEls, function (el) {
        el.hidden = isMusic && !(canStep && el === seekRow);
      });
      if (dialBtn) dialBtn.style.display = isMusic ? 'none' : '';
      if (rwBtn) rwBtn.setAttribute('aria-label', isMusic ? 'Previous playlist' : 'Rewind 10 seconds');
      if (ffBtn) ffBtn.setAttribute('aria-label', isMusic ? 'Next playlist' : 'Fast forward 10 seconds');
      musicEl.hidden = !isMusic;
      panel.classList.remove('is-power-off');
      if (isMusic) {
        var nowPlaying = musicList[musicIdx];
        titleEl.textContent = 'Music · ' + (nowPlaying ? nowPlaying.label : '—');
        if (pwrBtn) { pwrBtn.disabled = true; pwrBtn.classList.remove('is-off'); }
        ensureMusicEmbed();
        return;
      }
      if (pwrBtn) pwrBtn.disabled = false;
      var st = currentState();
      if (!st) { titleEl.textContent = 'Not connected'; return; }
      var ch = st.channels[st.chIndex];
      titleEl.textContent = ch ? ch.label : '—';
      if (muteBtn) muteBtn.textContent = st.muted ? 'Unmute' : 'Mute';
      if (dialBtn) dialBtn.classList.toggle('is-paused', !!st.isPaused);
      panel.classList.toggle('is-power-off', !!st.isOff);
      if (pwrBtn) pwrBtn.classList.toggle('is-off', !!st.isOff);
    }

    function setSource(src) { activeSource = src; render(); }

    function open(src) {
      if (src) setSource(src);
      else render();
      panel.classList.add('is-open');
    }
    function close() { panel.classList.remove('is-open'); guidePanel.hidden = true; }

    // Room-contextual, independent of whatever source tab the panel
    // itself has selected -- always reflects/controls the current room's
    // OWN screen, exactly like the Remote pill's own contextual default.
    function renderPP() {
      var st = contextualKey && STATE_BY_KEY[contextualKey];
      ppBtn.hidden = !st;
      if (!st) return;
      ppBtn.classList.toggle('is-paused', !!st.isPaused);
      if (ppLabel) ppLabel.textContent = st.isPaused ? 'Play' : 'Pause';
    }

    // Tracks which room the visitor is actually in so opening the remote
    // fresh (nothing explicitly requested) lands on that room's own
    // source -- but only while the panel is closed, so paging through
    // rooms with the remote already open never yanks someone off Music.
    document.addEventListener('pp:room-change', function (e) {
      var scene = e.detail && e.detail.id && document.getElementById(e.detail.id);
      var screen = scene && scene.querySelector('.floor-scene__screen[data-tv]');
      contextualKey = screen ? screen.dataset.channelSet : null;
      if (!panel.classList.contains('is-open') && contextualSource()) activeSource = contextualSource();
      renderPP();
    });
    // room-pager.js has already landed on the starting room by the time
    // this script runs (it loads first) -- that initial pp:room-change
    // fired before this listener existed, so read the current room
    // directly this one time instead of waiting for the next navigation.
    (function primeContext() {
      var pager = window.PPRoomPagers && window.PPRoomPagers[0];
      var id = pager && pager.getCurrentId();
      var scene = id && document.getElementById(id);
      var screen = scene && scene.querySelector('.floor-scene__screen[data-tv]');
      contextualKey = screen ? screen.dataset.channelSet : null;
    })();
    activeSource = contextualSource() || 'tv';
    renderPP();

    ppBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var st = contextualKey && STATE_BY_KEY[contextualKey];
      if (st) st.togglePlayPause();
    });

    // Keeps the panel's own display correct when the underlying state
    // changed from elsewhere (the room's own embedded panel, or a real
    // playerState correction from YouTube via the message listener).
    document.addEventListener('pp:tv-state', function (e) {
      var st = currentState();
      if (panel.classList.contains('is-open') && st && e.detail && e.detail.key === st.key) render();
      if (contextualKey && e.detail && e.detail.key === contextualKey) renderPP();
    });

    function renderGuide(st) {
      guideList.innerHTML = '';
      st.channels.forEach(function (ch, i) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.dataset.srGuideSelect = i;
        b.textContent = ch.label;
        if (i === st.chIndex) b.className = 'is-active';
        li.appendChild(b);
        guideList.appendChild(li);
      });
    }

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.classList.contains('is-open')) close(); else open();
    });

    // The in-room physical "Remote" artifact prop (data-tv-remote-toggle,
    // see build_house.py/penthouse.js) opens this same global panel now,
    // forced to that prop's own source. Registered before the outside-
    // click-close listener below and uses stopImmediatePropagation (not
    // just stopPropagation) -- both listeners live on `document` itself,
    // so stopPropagation alone doesn't stop one from reaching the other;
    // without this the close listener ran right after and undid the open.
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tv-remote-toggle]');
      if (!btn) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      var key = btn.dataset.tvRemoteToggle;
      open(key === 'cinema' ? 'cinema' : key === 'living' ? 'tv' : null);
    });

    Array.prototype.forEach.call(sourceBtns, function (btn) {
      btn.addEventListener('click', function () { setSource(btn.dataset.srSource); });
    });

    panel.addEventListener('click', function (e) {
      e.stopPropagation();
      var guideBtn = e.target.closest('[data-sr-guide-select]');
      var st = currentState();
      if (guideBtn) {
        if (st) st.loadChannel(parseInt(guideBtn.dataset.srGuideSelect, 10), true);
        guidePanel.hidden = true;
        return;
      }
      var actionBtn = e.target.closest('[data-sr-action]');
      if (!actionBtn) return;
      switch (actionBtn.dataset.srAction) {
        case 'close': close(); break;
        case 'power': if (st) { st.togglePower(); render(); } break;
        case 'playpause': if (st) st.togglePlayPause(); break;
        case 'mute': if (st) st.toggleMute(); break;
        // Under Music these two step the rotation instead of seeking; under
        // TV/Cinema (where currentState() is non-null and activeSource is
        // never 'music') they stay the same ∓10s seek they always were.
        case 'rw': if (activeSource === 'music') stepMusic(-1); else if (st) st.seekRw(); break;
        case 'ff': if (activeSource === 'music') stepMusic(1); else if (st) st.seekFf(); break;
        case 'guide':
          if (!st) break;
          renderGuide(st);
          guidePanel.hidden = false;
          break;
        case 'guide-close': guidePanel.hidden = true; break;
        case 'fullscreen':
          if (st) { close(); st.openFullscreen(); }
          break;
      }
    });

    document.addEventListener('click', function (e) {
      if (!panel.classList.contains('is-open')) return;
      if (panel.contains(e.target) || e.target === toggleBtn) return;
      close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
    });

    render();
  }

  function init() {
    channelsReady.then(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.floor-scene__screen[data-tv]'), initScreen);
      initSuiteRemote();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // penthouse.js renders its rooms synchronously on load, but re-run shortly
  // after in case any other script builds .floor-scene__screen markup later.
  setTimeout(init, 300);
})();
