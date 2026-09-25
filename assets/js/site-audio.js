(function () {
  'use strict';

  var PLAYLIST = 'spotify:playlist:7b46c5syjtG86a77R7SnMs';
  var EXCLUDED = { 'penthouse-living': true, 'music-lounge': true };
  var button, controller, activeRoom = null, ready = false, wanted = false;

  function inject() {
    if (document.getElementById('pp-site-audio')) return;
    var style = document.createElement('style');
    style.id = 'pp-site-audio-style';
    style.textContent = '#pp-site-audio{position:fixed;right:18px;bottom:18px;z-index:100000;width:46px;height:46px;border:1px solid rgba(201,169,97,.7);border-radius:50%;background:rgba(10,10,11,.9);color:#d9bd7b;box-shadow:0 8px 24px rgba(0,0,0,.35);font:16px/1 Inter,Arial,sans-serif;cursor:pointer;display:grid;place-items:center;backdrop-filter:blur(10px)}#pp-site-audio:hover,#pp-site-audio:focus-visible{background:#d9bd7b;color:#0a0a0b;outline:2px solid #d9bd7b;outline-offset:3px}@media(max-width:600px){#pp-site-audio{right:12px;bottom:12px;width:44px;height:44px}}';
    document.head.appendChild(style);
    button = document.createElement('button');
    button.id = 'pp-site-audio';
    button.type = 'button';
    button.setAttribute('aria-label', 'Play music');
    button.textContent = '▶';
    button.addEventListener('click', function () {
      wanted = !wanted;
      if (controller) {
        if (wanted) controller.play();
        else controller.pause();
      }
      update();
    });
    document.body.appendChild(button);
  }

  function update() {
    if (!button) return;
    var playing = !!wanted;
    button.textContent = playing ? '❚❚' : '▶';
    button.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    button.setAttribute('aria-pressed', playing ? 'true' : 'false');
  }

  function shouldPlay(room) {
    return !EXCLUDED[room || ''];
  }

  function roomId() {
    try {
      if (window.PPRoomPagers && window.PPRoomPagers[0]) return window.PPRoomPagers[0].getCurrentId();
    } catch (e) {}
    return document.body.dataset.room || '';
  }

  function attemptPlay() {
    if (!controller || !shouldPlay(activeRoom)) return;
    wanted = true;
    try { controller.play(); } catch (e) {}
    update();
  }

  function initSpotify() {
    if (ready) return;
    ready = true;
    var wait = setInterval(function () {
      if (!window.SpotifyIframeApi) return;
      clearInterval(wait);
      window.SpotifyIframeApi.createController(document.getElementById('pp-site-audio-frame'), { uri: PLAYLIST }, function (c) {
        controller = c;
        attemptPlay();
      });
    }, 100);
    var s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1';
    s.async = true;
    var previousReady = window.onSpotifyIframeApiReady; window.onSpotifyIframeApiReady = function (api) { if (typeof previousReady === 'function') previousReady(api); window.SpotifyIframeApi = api; };
    document.head.appendChild(s);
  }

  function addFrame() {
    var frame = document.createElement('div');
    frame.id = 'pp-site-audio-frame';
    frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-10px;bottom:-10px;opacity:0;pointer-events:none;overflow:hidden';
    document.body.appendChild(frame);
  }

  function setRoom(id) {
    activeRoom = id || roomId();
    if (shouldPlay(activeRoom)) attemptPlay();
    else {
      wanted = false;
      if (controller) controller.pause();
      update();
    }
  }

  function boot() {
    inject();
    addFrame();
    activeRoom = roomId();
    initSpotify();
    document.addEventListener('pp:room-change', function (e) { setRoom(e.detail && e.detail.id); });
    if (shouldPlay(activeRoom)) attemptPlay();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

(function () {
  'use strict';
  if (document.querySelector('script[data-hf-six-guide]')) return;
  var s = document.createElement('script');
  s.src = '/assets/js/hellofresh-guide.js?v=1';
  s.defer = true;
  s.setAttribute('data-hf-six-guide', '');
  document.head.appendChild(s);
})();

/* Cocktail Menu image repair. cocktail-menu.html renders real <img> elements but
   its original inline stylesheet never positioned/sized .card-image. Keep this
   here because site-audio.js is already loaded by the standalone menu and is not
   replaced by the Penthouse generated-page rebuild. */
(function () {
  'use strict';
  if (!/\/cocktail-menu\.html$/.test(location.pathname)) return;

  var COCKTAIL_ROOT = '/assets/img/cocktails/';
  var style = document.createElement('style');
  style.id = 'pp-cocktail-image-fix';
  style.textContent = [
    '.card{isolation:isolate;background:#171310!important}',
    '.card-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;object-fit:cover!important;object-position:center!important;z-index:0!important;opacity:1!important}',
    '.card:before{z-index:1!important;pointer-events:none!important;opacity:.18!important}',
    '.card:after{z-index:1!important;pointer-events:none!important;background:linear-gradient(180deg,rgba(0,0,0,.02) 34%,rgba(14,11,8,.84) 100%)!important}',
    '.card-body,.card-mark{z-index:2!important}',
    '.card-mark{color:rgba(255,255,255,.72)!important;text-shadow:0 1px 12px rgba(0,0,0,.4)}'
  ].join('');
  document.head.appendChild(style);

  function normalizeImages() {
    document.querySelectorAll('.card-image').forEach(function (img) {
      var raw = img.getAttribute('src') || '';
      var filename = raw.split('/').pop();
      if (filename) img.src = COCKTAIL_ROOT + filename;
      img.decoding = 'async';
      img.addEventListener('error', function () {
        img.style.display = 'none';
        img.closest('.card').classList.add('cocktail-image-error');
      }, { once: true });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', normalizeImages);
  else normalizeImages();
})();