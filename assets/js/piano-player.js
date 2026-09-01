/* ============================================================
   The Piano — a small channel-flip for its Spotify embed, same
   idea as the TV remote's channel list. Delegated on document so
   it works no matter when a .piano-player gets injected (baked
   into house.html at build time, or built at runtime by
   penthouse.js for the homepage widget and popup).
   ============================================================ */
(function () {
  'use strict';

  function playlists(el) {
    try { return JSON.parse(el.dataset.playlists) || []; } catch (e) { return []; }
  }

  function embedSrc(item) {
    return 'https://open.spotify.com/embed/' + item.type + '/' + item.id + '?utm_source=generator&theme=0';
  }

  function render(el, idx) {
    var list = playlists(el);
    if (!list.length) return;
    idx = ((idx % list.length) + list.length) % list.length;
    el.dataset.pianoIdx = idx;
    var item = list[idx];
    var frame = el.querySelector('[data-piano-frame]');
    var label = el.querySelector('[data-piano-label]');
    if (frame) frame.src = embedSrc(item);
    if (label) label.textContent = item.label;
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-piano-prev],[data-piano-next]');
    if (!btn) return;
    var el = btn.closest('.piano-player');
    if (!el) return;
    e.preventDefault();
    var idx = parseInt(el.dataset.pianoIdx || '0', 10);
    render(el, idx + (btn.hasAttribute('data-piano-next') ? 1 : -1));
  });
})();
