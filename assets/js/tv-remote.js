/* Clickable TV overlays (see .floor-scene__screen) — click the screen to open
   a small remote: mute/volume via the YouTube postMessage API, channel
   switching across a per-screen list of {id,label} videos, and a "Watch Full
   Screen" button that opens a single shared large-view modal.

   Channel lists live in data/house-channels.json (edit directly, or via the
   local Operator Console) rather than hardcoded here — this is a plain
   runtime fetch of a static JSON file, so edits take effect on next deploy
   with no rebuild step. */
(function () {
  'use strict';

  var CHANNEL_SETS = {};
  var DEFAULT_SET = 'living';
  var channelsReady = fetch('data/house-channels.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { CHANNEL_SETS = data || {}; })
    .catch(function () { CHANNEL_SETS = {}; });

  function embedSrc(id, muted) {
    return 'https://www.youtube.com/embed/' + id +
      '?autoplay=1&mute=' + (muted ? 1 : 0) + '&loop=1&playlist=' + id +
      '&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&enablejsapi=1';
  }

  function post(iframe, func, args) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
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

    screen.style.setProperty('--x', ((tl.x + br.x) / 2) + '%');
    screen.style.setProperty('--y', ((tl.y + br.y) / 2) + '%');
    screen.style.setProperty('--w', (br.x - tl.x) + '%');
    screen.style.setProperty('--h', (br.y - tl.y) + '%');
  }

  function positionAllScreens() {
    Array.prototype.forEach.call(document.querySelectorAll('.floor-scene__screen[data-box]'), positionScreen);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(positionAllScreens, 100);
  });

  /* ---------- shared "watch full screen" modal ---------- */
  var modalEl, modalIframe, modalChannelLabel, modalMuteBtn, modalLowerThird, modalLowerThirdTitle;
  var activeState = null; // the screen state object the modal is currently bound to

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
        '<button type="button" class="tv-modal__close" data-tv-modal-close>Close &#215;</button>' +
        '<iframe title="" allow="autoplay; encrypted-media"></iframe>' +
        '<div class="tv-lowerthird" data-tv-modal-lowerthird>' +
          '<p class="tv-lowerthird__eyebrow">Paris Pullen &#183; Now Screening</p>' +
          '<p class="tv-lowerthird__title" data-tv-modal-lowerthird-title></p>' +
        '</div>' +
        '<div class="tv-modal__controls">' +
          '<button type="button" data-tv-modal-action="ch-prev">&#9664; Ch</button>' +
          '<p class="tv-modal__channel" data-tv-modal-channel></p>' +
          '<button type="button" data-tv-modal-action="ch-next">Ch &#9654;</button>' +
          '<button type="button" data-tv-modal-action="vol-down">Vol &#8722;</button>' +
          '<button type="button" data-tv-modal-action="mute" data-tv-modal-mute>Mute</button>' +
          '<button type="button" data-tv-modal-action="vol-up">Vol &#43;</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modalEl);

    modalIframe = modalEl.querySelector('iframe');
    modalChannelLabel = modalEl.querySelector('[data-tv-modal-channel]');
    modalMuteBtn = modalEl.querySelector('[data-tv-modal-mute]');
    modalLowerThird = modalEl.querySelector('[data-tv-modal-lowerthird]');
    modalLowerThirdTitle = modalEl.querySelector('[data-tv-modal-lowerthird-title]');

    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) { closeModal(); return; }
      if (e.target.closest('[data-tv-modal-close]')) { closeModal(); return; }
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
          post(modalIframe, activeState.muted ? 'mute' : 'unMute');
          if (!activeState.muted) post(modalIframe, 'setVolume', [activeState.volume || 50]);
          updateModalMuteLabel();
          break;
        case 'ch-prev':
          setModalChannel(activeState.chIndex - 1);
          break;
        case 'ch-next':
          setModalChannel(activeState.chIndex + 1);
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

  /* Replace the iframe element outright (src baked into the markup from the
     start) rather than creating an empty iframe and assigning .src after —
     the latter left the YouTube player stuck mid-load in testing. */
  function setModalIframe(id) {
    var fresh = document.createElement('iframe');
    fresh.title = '';
    fresh.setAttribute('allow', 'autoplay; encrypted-media');
    fresh.src = embedSrc(id, true);
    modalIframe.replaceWith(fresh);
    modalIframe = fresh;
  }

  function setModalChannel(i) {
    var list = activeState.channels;
    activeState.chIndex = (i + list.length) % list.length;
    var ch = list[activeState.chIndex];
    activeState.muted = true;
    setModalIframe(ch.id);
    if (modalChannelLabel) modalChannelLabel.textContent = ch.label;
    if (activeState.syncLabel) activeState.syncLabel(ch.label);
    showLowerThird(modalLowerThird, modalLowerThirdTitle, ch.label);
    updateModalMuteLabel();
  }

  function openModal(state) {
    buildModal();
    activeState = state;
    state.iframe.src = ''; // fully stop the small TV rather than just pausing it —
                            // two simultaneous YouTube embeds can starve each other
    modalEl.classList.add('is-open');
    var ch = state.channels[state.chIndex];
    setModalIframe(ch.id);
    if (modalChannelLabel) modalChannelLabel.textContent = ch.label;
    showLowerThird(modalLowerThird, modalLowerThirdTitle, ch.label);
    state.muted = true;
    updateModalMuteLabel();
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    modalIframe.src = '';
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
    var lowerThird = screen.querySelector('[data-tv-lowerthird]');
    var lowerThirdTitle = screen.querySelector('[data-tv-lowerthird-title]');
    if (!frame || !iframe || !remote) return;
    screen.dataset.tvInited = '1';

    var channels = CHANNEL_SETS[screen.dataset.channelSet] || CHANNEL_SETS[DEFAULT_SET];
    var state = { chIndex: 0, volume: 100, muted: true, iframe: iframe, channels: channels };
    state.updateMuteLabel = function () {
      if (muteBtn) muteBtn.textContent = state.muted ? 'Unmute' : 'Mute';
    };
    state.syncLabel = function (label) {
      if (channelLabel) channelLabel.textContent = label;
    };

    function loadChannel(i) {
      state.chIndex = (i + channels.length) % channels.length;
      var ch = channels[state.chIndex];
      iframe.src = embedSrc(ch.id, true);
      state.syncLabel(ch.label);
      showLowerThird(lowerThird, lowerThirdTitle, ch.label);
      state.muted = true;
      state.updateMuteLabel();
    }

    frame.addEventListener('click', function (e) {
      e.stopPropagation();
      remote.classList.toggle('is-open');
    });

    remote.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tv-action]');
      if (!btn) return;
      e.stopPropagation();
      switch (btn.dataset.tvAction) {
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
          state.muted = !state.muted;
          post(iframe, state.muted ? 'mute' : 'unMute');
          if (!state.muted) post(iframe, 'setVolume', [state.volume || 50]);
          state.updateMuteLabel();
          break;
        case 'ch-prev':
          loadChannel(state.chIndex - 1);
          break;
        case 'ch-next':
          loadChannel(state.chIndex + 1);
          break;
        case 'expand':
          remote.classList.remove('is-open');
          openModal(state);
          break;
      }
    });

    state.syncLabel(channels[0].label);
    showLowerThird(lowerThird, lowerThirdTitle, channels[0].label);

    var container = screen.closest('.floor-scene, .pent__room');
    var img = container && container.querySelector('img');
    if (img) {
      if (img.complete) positionScreen(screen);
      img.addEventListener('load', function () { positionScreen(screen); });
    }
  }

  document.addEventListener('click', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.tv-remote.is-open'), function (r) {
      r.classList.remove('is-open');
    });
  });

  function init() {
    channelsReady.then(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.floor-scene__screen[data-tv]'), initScreen);
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
