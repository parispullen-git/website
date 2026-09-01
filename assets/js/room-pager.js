/* ============================================================
   Room Pager — full-screen, one-room-at-a-time horizontal
   navigation through a sequence of .floor-scene sections (see
   .room-pager / .room-pager__viewport in world.css). CSS
   scroll-snap does the actual panning, which gives native touch
   swipe + momentum on mobile for free; this file layers on:
     - prev/next arrow buttons
     - left/right keyboard parity
     - a desktop mouse-wheel -> horizontal pan translation
     - rewiring any .directory__row / .elevator__stop nav links
       to page to a room's index instead of a vertical scrollIntoView

   Reusable: window.PPRoomPager(rootEl) builds one instance scoped
   to a given `.room-pager` root and returns { goTo, rooms, root }.
   Every [data-room-pager] element present when this script runs is
   auto-initialized (house.html's standalone page pager, and the
   homepage's popup pager both use this). No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var instances = [];

  function init(pagerRoot) {
    var viewport = pagerRoot.querySelector('[data-room-pager-viewport]') || pagerRoot.querySelector('.room-pager__viewport');
    if (!viewport) return null;

    var rooms = Array.prototype.slice.call(viewport.children).filter(function (n) {
      return n.classList && n.classList.contains('floor-scene');
    });
    if (!rooms.length) return null;

    var prevBtn = pagerRoot.querySelector('[data-room-pager-prev]');
    var nextBtn = pagerRoot.querySelector('[data-room-pager-next]');
    var current = 0;
    var pagerInView = false;

    function updateButtons() {
      if (prevBtn) prevBtn.disabled = current <= 0;
      if (nextBtn) nextBtn.disabled = current >= rooms.length - 1;
    }

    // Each room is exactly one viewport-width wide, so the room nearest
    // the current scroll position is just scrollLeft / width, rounded.
    function nearestIndex() {
      var w = viewport.clientWidth || 1;
      return Math.max(0, Math.min(rooms.length - 1, Math.round(viewport.scrollLeft / w)));
    }

    function scrollToIndex(i, block, smooth) {
      i = Math.max(0, Math.min(rooms.length - 1, i));
      current = i;
      rooms[i].scrollIntoView({
        behavior: (reduced || smooth === false) ? 'auto' : 'smooth',
        inline: 'start',
        block: block || 'nearest'
      });
      updateButtons();
    }

    function indexOfId(id) {
      for (var i = 0; i < rooms.length; i++) { if (rooms[i].id === id) return i; }
      return -1;
    }

    // Keep `current` (and the arrow disabled-states) in sync with whatever
    // actually moved the viewport — native touch swipe, a scrollbar drag,
    // the wheel handler below, or our own scrollToIndex calls.
    var scrollTimer;
    viewport.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        current = nearestIndex();
        updateButtons();
      }, 90);
    }, { passive: true });

    if (prevBtn) prevBtn.addEventListener('click', function () { scrollToIndex(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { scrollToIndex(current + 1); });

    // Desktop mice only report vertical wheel deltas. Translate that into
    // horizontal paging while the pointer is over the pager, but let it
    // fall through to normal page scroll at the first/last room so a
    // plain-mouse user isn't trapped inside the sequence.
    viewport.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // real horizontal intent (trackpad) — leave it to the browser
      var atStart = current <= 0, atEnd = current >= rooms.length - 1;
      if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) return;
      e.preventDefault();
      viewport.scrollLeft += e.deltaY;
    }, { passive: false });

    // Left/right page rooms while the pager is meaningfully on screen and
    // focus isn't in a form field or a full-screen overlay (the TV modal,
    // the city-guide portal) that might want its own keys.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { pagerInView = entry.isIntersecting; });
      }, { threshold: 0.6 }).observe(pagerRoot);
    } else {
      pagerInView = true;
    }

    function keyboardBlocked() {
      var ae = document.activeElement;
      if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return true;
      if (document.querySelector('.tv-modal.is-open, .guide-portal.is-open')) return true;
      return false;
    }

    document.addEventListener('keydown', function (e) {
      if (!pagerInView || keyboardBlocked()) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToIndex(current - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); scrollToIndex(current + 1); }
    });

    updateButtons();

    return {
      root: pagerRoot,
      viewport: viewport,
      rooms: rooms,
      goTo: scrollToIndex,
      goToId: function (id, block, smooth) {
        var idx = indexOfId(id);
        if (idx < 0) return false;
        scrollToIndex(idx, block, smooth);
        return true;
      },
      getCurrentId: function () { return rooms[current] ? rooms[current].id : null; },
      hasRoom: function (id) { return indexOfId(id) >= 0; }
    };
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-room-pager]'), function (el) {
    var instance = init(el);
    if (instance) instances.push(instance);
  });

  // Directory rows + elevator stops (house.html's own nav): jump straight
  // to a room's position instead of the old vertical scrollIntoView.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.directory__row, .elevator__stop');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) !== '#') return;
    var id = href.slice(1);
    for (var i = 0; i < instances.length; i++) {
      if (instances[i].hasRoom(id)) {
        e.preventDefault();
        instances[i].goToId(id, 'start');
        return;
      }
    }
  });

  // Land on the right room if the page was opened (or refreshed) with a
  // #hash — no smooth animation on load, just arrive there.
  var startId = window.location.hash.slice(1);
  if (startId) {
    for (var j = 0; j < instances.length; j++) {
      if (instances[j].hasRoom(startId)) { instances[j].goToId(startId, 'start', false); break; }
    }
  }

  window.PPRoomPager = init;
  window.PPRoomPagers = instances;
})();
