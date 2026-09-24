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
    window.onSpotifyIframeApiReady = function (api) { window.SpotifyIframeApi = api; };
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