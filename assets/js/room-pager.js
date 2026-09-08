/* ============================================================
   Room Pager — full-screen, one-room-at-a-time navigation through a
   real 2D layout of .floor-scene sections (see .room-pager /
   .room-pager__viewport in world.css, and build_house.py's
   ROOM_ADJACENCY), at every breakpoint. Paging is a CSS transform
   slide (not native scroll -- each room's own .floor-scene__surface
   owns horizontal scroll instead, for panning within the room),
   driven by:
     - prev/next/up/down arrow buttons, each reading the current
       room's own baked data-left/data-right/data-up/data-down --
       not a fixed +/-1 on an array index, so DOM order doesn't need
       to match the room layout
     - arrow-key keyboard parity for all four directions
     - a mouse-wheel -> left/right paging translation
     - rewiring the hamburger menu's Explore links to page to a room's
       index instead of a vertical scrollIntoView

   Reusable: window.PPRoomPager(rootEl) builds one instance scoped
   to a given `.room-pager` root and returns { goTo, rooms, root }.
   Every [data-room-pager] element present when this script runs is
   auto-initialized (house.html's standalone page pager, and the
   homepage's embedded pager both use this). No dependencies.
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
    var upBtn = pagerRoot.querySelector('[data-room-pager-up]');
    var downBtn = pagerRoot.querySelector('[data-room-pager-down]');
    var current = 0;
    var pagerInView = false;

    // Room display names ("The Cinema") minus their leading "The " --
    // used to label each arrow with the room it leads to.
    function shortName(room) {
      var el = room && room.querySelector('.floor-plate__name');
      var text = el ? el.textContent.trim() : '';
      return text.replace(/^The\s+/i, '');
    }

    function setHint(btn, targetId) {
      if (!btn) return;
      var hint = btn.querySelector('[data-room-pager-hint]');
      if (!hint) return;
      var target = targetId ? rooms.filter(function (r) { return r.id === targetId; })[0] : null;
      hint.textContent = target ? shortName(target) : '';
    }

    // All four directions read straight off the current room's own baked
    // data-left/data-right/data-up/data-down (see build_house.py's
    // ROOM_ADJACENCY) -- room-to-room is a real 2D layout, not a fixed
    // +/-1 on an array index, so every direction is looked up fresh
    // whenever the current room changes, exactly the same way for all four.
    function updateButtons() {
      var room = rooms[current];
      if (prevBtn) prevBtn.disabled = !room || !room.dataset.left;
      if (nextBtn) nextBtn.disabled = !room || !room.dataset.right;
      if (upBtn) upBtn.disabled = !room || !room.dataset.up;
      if (downBtn) downBtn.disabled = !room || !room.dataset.down;
      setHint(prevBtn, room && room.dataset.left);
      setHint(nextBtn, room && room.dataset.right);
      setHint(upBtn, room && room.dataset.up);
      setHint(downBtn, room && room.dataset.down);
    }

    function scrollToIndex(i, block, smooth) {
      i = Math.max(0, Math.min(rooms.length - 1, i));
      current = i;
      var behavior = (reduced || smooth === false) ? 'auto' : 'smooth';
      // Native horizontal scroll is off on the viewport itself (see
      // world.css), so paging is a plain transform slide. Deliberately NOT
      // calling scrollIntoView on the room itself for this: even with
      // inline:'nearest', overflow:hidden still lets scrollIntoView set
      // scrollLeft programmatically (hidden blocks user-driven scroll, not
      // JS-driven scroll), which stacks with the transform and throws every
      // room's position off by whatever that scrollLeft ended up being.
      // Only scroll (vertically) when actually needed -- landing the
      // room-pager section in view on first load or a directory/menu link
      // jump -- via the section itself, which has no horizontal overflow
      // of its own to accidentally trigger.
      viewport.style.transform = 'translateX(-' + (i * 100) + '%)';
      viewport.scrollLeft = 0; // guard against anything else nudging this
      pagerRoot.scrollLeft = 0; // ditto for the overflow:hidden root itself --
      // see the CSS scroll-anchoring note on .room-pager in world.css
      if (block) pagerRoot.scrollIntoView({ behavior: behavior, block: block });
      centerSurface(rooms[i]);
      updateButtons();
      // Lets anything outside this closure (the fixed "Remote" button near
      // .sound, see tv-remote.js) know which room is current without its
      // own coupling to room-pager internals.
      document.dispatchEvent(new CustomEvent('pp:room-change', { detail: { id: rooms[i].id } }));
    }

    // The room's own photo pans wider than the viewport (130%, see
    // .floor-scene__canvas in world.css) and starts scrolled to its left
    // edge by default -- center it instead, so arriving at a room (on
    // load, or after paging to it) shows the middle of the composition
    // first rather than whatever's cropped in at the far left.
    //
    // Measures canvas's own rendered width, not surface.scrollWidth: an
    // absolutely positioned child (the TV screen box, an artifact marker
    // near a corner) can render slightly past canvas's own right edge,
    // which inflates scrollWidth without actually being intentional
    // pannable width -- centering against that instead of canvas's real
    // width once shifted every room sideways for no visual reason.
    function centerSurface(room) {
      var surface = room && room.querySelector('.floor-scene__surface');
      var canvas = room && room.querySelector('.floor-scene__canvas');
      if (!surface || !canvas) return;
      // A single rAF ("wait for the next layout pass") isn't reliably
      // enough on a cold load: widths can still read 0 at that point even
      // once the image itself reports complete=true (layout hasn't caught
      // up yet), so a single attempt can silently no-op. Retry across a
      // bounded run of frames instead of guessing which single signal
      // (image load, one rAF, etc.) is late.
      var tries = 0;
      (function attempt() {
        var max = canvas.getBoundingClientRect().width - surface.clientWidth;
        if (max > 0) { surface.scrollLeft = max / 2; return; }
        if (++tries < 60) requestAnimationFrame(attempt); // ~1s ceiling at 60fps
      })();
    }

    function indexOfId(id) {
      for (var i = 0; i < rooms.length; i++) { if (rooms[i].id === id) return i; }
      return -1;
    }

    // viewport.scrollLeft has no business ever being non-zero -- paging is
    // the transform slide in scrollToIndex, full stop. But overflow-x:hidden
    // only blocks user-driven scroll gestures; it does NOT block the
    // browser's own native #hash anchor-scroll, which (unlike any of our
    // own code) tends to fire late -- after images finish loading, well
    // after our one-time zero-reset in scrollToIndex already ran -- and
    // silently nudges scrollLeft back to a room-width, throwing every
    // room's rendered position off by that amount. A standing lock here
    // (rather than a single reset) closes that off for good.
    viewport.addEventListener('scroll', function () {
      if (viewport.scrollLeft !== 0) viewport.scrollLeft = 0;
    }, { passive: true });
    // Same lock on pagerRoot -- CSS scroll anchoring (see .room-pager's
    // overflow-anchor:none in world.css) is what actually caused this in
    // practice, but this standing lock is cheap insurance regardless of
    // what nudges it.
    pagerRoot.addEventListener('scroll', function () {
      if (pagerRoot.scrollLeft !== 0) pagerRoot.scrollLeft = 0;
    }, { passive: true });

    // A floor-to-floor move (up/down -- e.g. the Living Room's own ceiling
    // opening onto the Bedroom above it) reads as climbing a level, not
    // stepping sideways to the next room, so it gets its own vertical
    // slide instead of the shared left/right filmstrip's translateX.
    // Left/right (prev/next, wheel, drag, hash landing, menu links) are
    // untouched -- they still just call scrollToIndex directly below.
    function verticalTransition(idx, dir) {
      var fromRoom = rooms[current];
      var toRoom = rooms[idx];
      if (reduced || !fromRoom || !toRoom || fromRoom === toRoom) { scrollToIndex(idx, 'start'); return; }

      // 'up': toRoom is a level above -- it rises in from the bottom edge
      // while fromRoom exits off the top. 'down' is the mirror.
      var enterFrom = dir === 'up' ? '100%' : '-100%';
      var exitTo    = dir === 'up' ? '-100%' : '100%';

      // toRoom sits inside .room-pager__viewport, which is what actually
      // carries the left/right translateX -- a plain position:fixed on it
      // would be scoped to that transformed ancestor, not the real screen
      // (a transformed element becomes the containing block for its fixed
      // descendants). Reparenting it up to pagerRoot (never transformed)
      // for the duration of the slide sidesteps that; origNext remembers
      // its exact slot so it can go back to being a normal filmstrip frame
      // once the swap below is done.
      var origNext = toRoom.nextSibling;
      toRoom.classList.add('room-pager__vslide', 'room-pager__vslide--over');
      toRoom.style.transform = 'translateY(' + enterFrom + ')';
      pagerRoot.appendChild(toRoom);
      void toRoom.offsetHeight; // commit the start position before animating off it

      fromRoom.classList.add('room-pager__vslide');

      var done = false;
      var fallback = setTimeout(finish, 650);
      toRoom.addEventListener('transitionend', onEnd);

      function onEnd(e) { if (e.target === toRoom && e.propertyName === 'transform') finish(); }

      function finish() {
        if (done) return;
        done = true;
        clearTimeout(fallback);
        toRoom.removeEventListener('transitionend', onEnd);

        fromRoom.classList.remove('room-pager__vslide');
        fromRoom.style.transform = '';

        // toRoom is still covering the whole screen at this instant (the
        // slide-in just finished), so swapping it back into the filmstrip
        // and instantly snapping the shared transform to its real index is
        // invisible -- turn off the viewport's own transition for that one
        // change so it doesn't also play its normal horizontal slide.
        viewport.insertBefore(toRoom, origNext);
        toRoom.classList.remove('room-pager__vslide', 'room-pager__vslide--over');
        toRoom.style.transform = '';
        var prevTransition = viewport.style.transition;
        viewport.style.transition = 'none';
        scrollToIndex(idx, 'start', false);
        void viewport.offsetHeight;
        viewport.style.transition = prevTransition;
      }

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          toRoom.style.transform = 'translateY(0)';
          fromRoom.style.transform = 'translateY(' + exitTo + ')';
        });
      });
    }

    // Every direction -- prev/next included -- jumps to whatever id the
    // current room names for that direction (a no-op, safely, if it names
    // none: e.g. Kitchen has no data-left, so pressing left there does
    // nothing rather than throwing).
    function goDirection(attr) {
      var room = rooms[current];
      var id = room && room.dataset[attr];
      var idx = id ? indexOfId(id) : -1;
      if (idx < 0) return;
      if (attr === 'up' || attr === 'down') { verticalTransition(idx, attr); return; }
      scrollToIndex(idx, 'start');
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { goDirection('left'); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goDirection('right'); });
    if (upBtn) upBtn.addEventListener('click', function () { goDirection('up'); });
    if (downBtn) downBtn.addEventListener('click', function () { goDirection('down'); });

    // Desktop mice only report vertical wheel deltas. Translate that into
    // horizontal paging (data-left/data-right) while the pointer is over
    // the pager, but let it fall through to normal page scroll at an edge
    // room so a plain-mouse user isn't trapped inside the sequence.
    // Paging is a discrete transform slide now (see scrollToIndex), not a
    // continuous scrollLeft the wheel can just add to -- one wheel gesture
    // steps one room, no matter how strong.
    //
    // A single trackpad/mouse-wheel swipe fires MANY discrete wheel events
    // in quick succession (often 10-30+ over a couple hundred ms), not
    // one -- a fixed "unlock after 500ms" timer, started on the first
    // event, could still expire mid-gesture on a longer/stronger swipe
    // and let a second goDirection() fire before the person's finger even
    // left the trackpad, skipping straight past a room. Instead, every
    // qualifying event pushes the unlock out again; the lock only lifts
    // once the stream actually goes quiet, so one continuous gesture --
    // regardless of event count or cumulative delta -- can ever produce
    // at most one room change.
    var wheelLocked = false;
    var wheelQuietTimer = null;
    viewport.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // real horizontal intent (trackpad) — leave it to the browser
      var room = rooms[current];
      var atStart = !room || !room.dataset.left, atEnd = !room || !room.dataset.right;
      if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) < 4) return;
      clearTimeout(wheelQuietTimer);
      wheelQuietTimer = setTimeout(function () { wheelLocked = false; }, 220);
      if (wheelLocked) return;
      wheelLocked = true;
      goDirection(e.deltaY > 0 ? 'right' : 'left');
    }, { passive: false });

    // Click-drag (mouse) and swipe (touch) both page exactly one room,
    // same as the wheel above -- Pointer Events cover both input types
    // with one implementation. Deliberately NOT a live-tracking carousel
    // drag (the transform only ever moves via scrollToIndex's own clean
    // discrete slide): a short flick decides, on release, whether it
    // crossed the distance/speed bar for "that was a page gesture," and
    // if so takes exactly one step through the same data-left/data-right
    // lookup everything else uses -- there's no partial/analog position
    // to land on, so there's nothing to overshoot or skip past. A slower
    // or shorter drag doesn't clear the bar and is left alone, falling
    // through to the room photo's own native pan-to-look-around scroll
    // exactly as before.
    var dragStartX = null, dragStartY = null, dragStartTime = 0;
    var DRAG_MIN_DISTANCE = 50; // px
    var DRAG_MAX_TIME = 600; // ms -- a real flick, not a slow drag
    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.buttons !== 1) return;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartTime = Date.now();
    }, { passive: true });
    viewport.addEventListener('pointerup', function (e) {
      if (dragStartX === null) return;
      var dx = e.clientX - dragStartX, dy = e.clientY - dragStartY;
      var dt = Date.now() - dragStartTime;
      dragStartX = null;
      if (Math.abs(dx) < Math.abs(dy)) return; // vertical intent -- not a room swipe
      if (Math.abs(dx) < DRAG_MIN_DISTANCE || dt > DRAG_MAX_TIME) return;
      var room = rooms[current];
      var dir = dx < 0 ? 'right' : 'left'; // dragged/swiped left -> next room
      if (!room || !room.dataset[dir]) return;
      goDirection(dir);
    }, { passive: true });
    // A real touch gesture doesn't always end in a clean pointerup --
    // the OS can interrupt it (an incoming call, a system gesture, the
    // finger sliding off the edge) and fire pointercancel instead, or the
    // pointer can simply leave the element first. Either way, clear the
    // start position without acting on it rather than leaving it armed
    // for whatever unrelated pointerup happens to land next.
    viewport.addEventListener('pointercancel', function () { dragStartX = null; }, { passive: true });
    viewport.addEventListener('pointerleave', function () { dragStartX = null; }, { passive: true });

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
      if (e.key === 'ArrowLeft') { e.preventDefault(); goDirection('left'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goDirection('right'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); goDirection('up'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); goDirection('down'); }
    });

    updateButtons();

    // Always land on a room explicitly via scrollToIndex -- even the plain
    // "just open on room 0" case -- rather than leaving `current` at its
    // initial value with no call at all. scrollToIndex is also what runs
    // centerSurface(); skipping it here meant the very first room a
    // visitor saw was the one room whose photo never got centered (every
    // later room got it, since paging always goes through scrollToIndex).
    // data-start-room (e.g. the homepage embeds the same 7 penthouse rooms
    // house.html has, but should open on the Living Room, not whichever
    // one happens to be first in DOM/building order) picks the index;
    // landOnHash() below still overrides it moments later if the URL
    // actually carries a matching room hash.
    var startId = pagerRoot.dataset.startRoom;
    var startIdx = startId ? indexOfId(startId) : -1;
    scrollToIndex(startIdx >= 0 ? startIdx : 0, false, false);

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

  // The hamburger menu's Explore links: jump straight to a room's position
  // instead of a native anchor scroll, when the click happens on a page
  // that already has that room in a pager (house.html, or the homepage).
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.menu__explore-link');
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
  // #hash — no smooth animation, just arrive there. Tried once synchronously
  // (matches every room-pager instance's own initial state) and again after
  // `load`, re-reading the hash fresh both times: the first attempt has, in
  // production, intermittently no-op'd for reasons that didn't reproduce
  // under direct manual testing -- re-running it once everything has fully
  // settled is a low-cost way to guarantee the visitor lands correctly
  // either way. goToId is idempotent, so a redundant second landing on the
  // same room is harmless.
  function landOnHash() {
    var startId = window.location.hash.slice(1);
    if (!startId) return;
    for (var j = 0; j < instances.length; j++) {
      if (instances[j].hasRoom(startId)) { instances[j].goToId(startId, 'start', false); return; }
    }
  }
  landOnHash();
  if (document.readyState === 'complete') {
    landOnHash();
  } else {
    window.addEventListener('load', landOnHash);
  }

  window.PPRoomPager = init;
  window.PPRoomPagers = instances;
})();
