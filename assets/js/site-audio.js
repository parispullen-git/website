/* Room-aware Spotify playback: the playlist exists only in the Music Lounge
   and Gym. The player is created only upon entering either room and is removed
   completely when leaving, preventing Spotify's embed from appearing below
   ordinary room imagery. TV and Cinema audio are managed separately. */
(function () {
  'use strict';
  if (!document.querySelector('[data-room-pager]')) return;

  var PLAYLIST = 'spotify:playlist:7b46c5syjtG86a77R7SnMs';
  var api = null, controller = null, host = null, activeRoom = '', loading = false;

  function isPlaylistRoom(id) {
    return id === 'music-lounge' || id === 'gym';
  }
  function roomId() {
    try { return window.PPRoomPagers && window.PPRoomPagers[0] && window.PPRoomPagers[0].getCurrentId(); }
    catch (_) { return ''; }
  }
  function clearPlayer() {
    if (controller) {
      try { controller.pause(); } catch (_) {}
    }
    controller = null;
    if (host && host.parentNode) host.parentNode.removeChild(host);
    host = null;
  }
  function makeHost() {
    if (host) return host;
    host = document.createElement('div');
    host.id = 'pp-house-audio-frame';
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = [
      'position:fixed', 'width:0', 'height:0', 'min-width:0', 'min-height:0',
      'left:-9999px', 'top:-9999px', 'overflow:hidden', 'visibility:hidden',
      'opacity:0', 'pointer-events:none', 'contain:strict', 'z-index:-1'
    ].join(';');
    document.body.appendChild(host);
    return host;
  }
  function createPlayer() {
    if (!api || controller || !isPlaylistRoom(activeRoom)) return;
    api.createController(makeHost(), { uri: PLAYLIST }, function (raw) {
      if (!isPlaylistRoom(activeRoom)) {
        try { raw.pause(); } catch (_) {}
        clearPlayer();
        return;
      }
      controller = {
        muted: false,
        isPaused: false,
        play: function () { this.isPaused = false; raw.play(); },
        pause: function () { this.isPaused = true; raw.pause(); },
        togglePlay: function () { raw.togglePlay(); this.isPaused = !this.isPaused; },
        toggleMute: function () {
          this.muted = !this.muted;
          if (raw.setVolume) raw.setVolume(this.muted ? 0 : 100);
          document.dispatchEvent(new CustomEvent('pp:ambient-playback'));
        }
      };
      controller.play();
      document.dispatchEvent(new CustomEvent('pp:ambient-change'));
    });
  }
  function loadApi() {
    if (api || loading) { createPlayer(); return; }
    loading = true;
    var prior = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = function (loadedApi) {
      if (typeof prior === 'function') prior(loadedApi);
      api = loadedApi;
      loading = false;
      createPlayer();
    };
    var script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    document.head.appendChild(script);
  }
  function apply(id) {
    activeRoom = id || roomId() || '';
    if (isPlaylistRoom(activeRoom)) {
      if (controller) controller.play();
      else loadApi();
    } else {
      clearPlayer();
    }
    if (window.PPTheatre && window.PPTheatre.setHouseRoom) {
      window.PPTheatre.setHouseRoom(activeRoom);
    }
  }
  window.PPAmbient = {
    get: function () {
      return controller ? { controller: controller, roomId: activeRoom, isPaused: !!controller.isPaused } : null;
    },
    label: function (id) {
      return id === 'music-lounge' ? 'The Music Lounge' : id === 'gym' ? 'The Gym' : '';
    },
    meta: function () { return null; }
  };
  function removeGlobalToggle() {
    var toggle = document.querySelector('.playpause-toggle');
    if (toggle) toggle.remove();
  }
  function boot() {
    window.PPHouseAudioManaged = true;
    activeRoom = roomId() || 'penthouse-living';
    document.addEventListener('pp:room-change', function (event) {
      apply(event.detail && event.detail.id);
    });
    apply(activeRoom);
    removeGlobalToggle();
    setTimeout(removeGlobalToggle, 600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();