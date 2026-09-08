/* ============================================================
   PARISPULLEN.COM — world.js
   No dependencies. Progressive enhancement only.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. THE GATE ---------- */
  function gate() {
    var el = $('#gate');
    if (!el) return;

    var KEY = 'pp_gate_seen';
    var seen = false;
    try { seen = localStorage.getItem(KEY) === '1'; } catch (e) {}

    if (seen || reduced) { el.hidden = true; document.body.style.overflow = ''; return; }

    document.body.style.overflow = 'hidden';

    function open() {
      el.classList.add('is-leaving');
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      window.setTimeout(function () {
        el.hidden = true;
        document.body.style.overflow = '';
      }, 1800);
    }

    var enter = $('#gate-enter', el);
    var skip  = $('#gate-skip', el);
    if (enter) enter.addEventListener('click', open);
    if (skip)  skip.addEventListener('click', open);

    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape' && !el.hidden) { open(); document.removeEventListener('keydown', onKey); }
    });
  }

  /* ---------- 2. MENU ---------- */
  function menu() {
    var btn = $('#menu-toggle');
    var panel = $('#menu');
    if (!btn || !panel) return;

    function set(open) {
      panel.classList.toggle('is-open', open);
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      var label = $('.worldnav__label', btn);
      if (label) label.textContent = open ? 'Close' : 'Menu';
    }

    btn.addEventListener('click', function () {
      set(!panel.classList.contains('is-open'));
    });
    panel.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') set(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) set(false);
    });
  }

  /* ---------- 3. SCROLL REVEAL ---------- */
  function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }

    // threshold is a fraction of the TARGET's own height, not the
    // viewport's -- 0.08 needed roughly a full extra viewport of scroll
    // once a target's own height passed about 12x the viewport (a growing
    // card grid, say) before that much of it could ever be on screen at
    // once, which read as the element just never revealing. A small fixed
    // threshold triggers as soon as any real sliver is visible, so it
    // scales correctly regardless of how tall a given .reveal target gets.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });

    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- 4. CINEMATIC PARALLAX ---------- */
  function parallax() {
    var media = $$('[data-parallax]');
    if (!media.length || reduced) return;

    var ticking = false;

    function frame() {
      var vh = window.innerHeight;
      media.forEach(function (m) {
        var host = m.closest('.scene, .floor') || m.parentNode;
        var r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var depth = parseFloat(m.getAttribute('data-parallax')) || 0.14;
        var progress = (r.top + r.height / 2 - vh / 2) / vh;
        var shift = -(progress * depth * 100);
        m.style.transform = 'scale(1.12) translate3d(0,' + shift.toFixed(2) + 'px,0)';
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    frame();
  }

  /* ---------- 5. SECTION TRACKING (rail + elevator) ---------- */
  function tracker() {
    var links = $$('[data-track]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('data-track');
      var target = document.getElementById(id);
      if (target) map[id] = { link: a, el: target };
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('data-track') === id);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    Object.keys(map).forEach(function (k) { io.observe(map[k].el); });
  }

  /* ---------- 6. NAV AUTO-HIDE ---------- */
  function navHide() {
    var nav = $('.worldnav');
    if (!nav) return;
    // Written for the old vertical-scroll room pages. house.html's rooms
    // are one-screen-each now (room-pager.js), navigated horizontally --
    // the one vertical scroll that still happens is scrollIntoView landing
    // the room-pager section in view, which used to permanently hide the
    // nav (crossed the 260px threshold once, then nothing ever scrolled it
    // back). Simplest correct fix: this page keeps the nav pinned instead.
    if (document.querySelector('.room-pager')) return;
    var last = 0;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      var openMenu = document.querySelector('.menu.is-open');
      if (openMenu) { nav.classList.remove('is-hidden'); last = y; return; }
      nav.classList.toggle('is-hidden', y > last && y > 260);
      last = y;
    }, { passive: true });
  }

  /* ---------- 7. ACCORDIONS (loadout + kit) ---------- */
  function accordions() {
    [['.loadout__row', '.loadout'], ['.kit__row', '.kit']].forEach(function (pair) {
      var rowSel = pair[0], groupSel = pair[1];

      $$(rowSel).forEach(function (row) {
        function toggle() {
          var open = row.classList.contains('is-open');
          var group = row.closest(groupSel);
          if (group) $$(rowSel, group).forEach(function (r) {
            r.classList.remove('is-open');
            r.setAttribute('aria-expanded', 'false');
          });
          row.classList.toggle('is-open', !open);
          row.setAttribute('aria-expanded', String(!open));
        }

        row.setAttribute('tabindex', '0');
        row.setAttribute('role', 'button');
        row.setAttribute('aria-expanded', 'false');
        row.addEventListener('click', toggle);
        row.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
      });
    });
  }

  /* ---------- 7b. REDACTIONS ---------- */
  function redactions() {
    $$('.redact').forEach(function (r) {
      var label = r.getAttribute('data-label') || 'Redacted passage';
      r.setAttribute('role', 'button');
      r.setAttribute('tabindex', '0');
      r.setAttribute('aria-expanded', 'false');
      r.setAttribute('aria-label', label);

      function toggle() {
        var open = r.classList.toggle('is-open');
        r.setAttribute('aria-expanded', String(open));
      }

      r.addEventListener('click', toggle);
      r.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ---------- 8. NETWORK TABS ---------- */
  function network() {
    var list = $('.netlist');
    var panel = $('.netpanel');
    if (!list || !panel) return;

    var buttons = $$('button', list);
    var items = $$('.netpanel__item', panel);

    function show(key) {
      buttons.forEach(function (b) { b.classList.toggle('is-active', b.dataset.net === key); });
      items.forEach(function (i) { i.classList.toggle('is-active', i.dataset.net === key); });
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { show(b.dataset.net); });
    });

    if (buttons.length) show(buttons[0].dataset.net);
  }

  /* ---------- 9. SECRET DOORS ---------- */
  function doors() {
    $$('.door').forEach(function (d) {
      var targetId = d.getAttribute('data-door');
      var panel = targetId ? document.getElementById(targetId) : null;
      if (!panel) return;

      d.setAttribute('role', 'button');
      d.setAttribute('tabindex', '0');
      d.setAttribute('aria-expanded', 'false');
      d.setAttribute('aria-controls', targetId);

      function toggle() {
        var open = panel.classList.toggle('is-open');
        d.setAttribute('aria-expanded', String(open));
        if (open && !reduced) {
          window.setTimeout(function () {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 340);
        }
      }

      d.addEventListener('click', toggle);
      d.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ---------- 9b. ARTIFACTS + DRAWERS ---------- */
  /* ---------- 8b. FORCE-EAGER LAZY IMAGE ON ROOM CHANGE ----------
     Every artifact dot's --x/--y is baked (build_house.py/penthouse.js) as
     a plain percentage of the source photo, and rendered as a child of
     .floor-scene__view -- the <img>'s own box, sized to exactly the
     photo's natural aspect ratio at every breakpoint (height:100%;
     width:auto, never cropped). A plain CSS percentage against that box
     is already exact, so there is nothing left to correct here at
     runtime; this used to also recompute --x/--y against
     .floor-scene__canvas's rect, but canvas carries its own
     clamp(10px,1.6vw,28px) padding (the frame/mat around the photo) which
     is NOT part of the photo's own coordinate space -- every dot drifted
     outward from center by a viewport-dependent amount (worse on wide
     screens, where the padding clamps to its 28px ceiling), which was
     exactly the "doesn't stay in place across devices" bug. Removed
     rather than "fixed to measure the image instead": once there's no
     actual cropping to correct for, the honest version of this function
     doesn't touch --x/--y at all.
     What's left is a real, unrelated fix that lived in the same function:
     a loading="lazy" image is only supposed to start fetching once it's
     close to the viewport, and for a transform-slid room-pager room that
     should be exactly when room-pager.js's pp:room-change fires for it --
     but a flex-row carousel lays every room out side by side BEFORE the
     transform shifts the current one into view (room N sits at (N-1)*100%
     in that untransformed layout), and at least one browser's lazy-load
     heuristic goes by that untransformed position rather than what's
     actually painted -- so the room furthest into the sequence could sit
     far enough out to never be judged "close enough," and its image would
     just never fetch on its own. Don't wait and hope: the moment a room
     becomes current is also the one moment this has to be right, so force
     it to start loading immediately. */
  function forceEagerImageOnRoomChange() {
    document.addEventListener('pp:room-change', function (e) {
      var scene = e.detail && e.detail.id && document.getElementById(e.detail.id);
      if (!scene || !scene.classList.contains('floor-scene')) return;
      var img = $('.floor-scene__view img', scene);
      if (img && !img.complete && img.loading === 'lazy') img.loading = 'eager';
    });
  }

  /* ---------- 8c. FLOOR SCENE COVER-FIT SAFETY NET ----------
     .floor-scene__view img's default height:100%;width:auto shows the
     whole photo, uncropped, on every viewport EXCEPT one: a browser
     window proportionally WIDER than the photo itself (a wide, short
     desktop window -- especially once real browser chrome eats into the
     available height). There, the height-driven width comes out narrower
     than the viewport, and unlike the "photo wider than viewport" case
     (handled by .floor-scene__surface's horizontal pan), there is no
     panning that can reach content that was never rendered -- the photo
     just ends, and bare black shows on whichever side isn't covered.
     Compares each room's real photo aspect ratio against its own
     viewport's on load/resize/room-change, and adds .is-wide (see
     world.css) only on the specific rooms/viewports where that
     comparison actually calls for it -- switching just those to
     width-driven cover sizing (a small, centered top/bottom crop; the
     surface's overflow-y:hidden already covers for it) instead of a gap.
     Every other room/viewport is untouched. */
  function sizeFloorScenes() {
    var scenes = $$('.floor-scene');
    if (!scenes.length) return;

    function sizeOne(scene) {
      var canvas = $('.floor-scene__canvas', scene);
      var surface = $('.floor-scene__surface', scene);
      var img = $('.floor-scene__view img', scene);
      if (!canvas || !surface || !img || !img.naturalWidth || !img.naturalHeight) return;
      var rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var viewportAspect = rect.width / rect.height;
      var imageAspect = img.naturalWidth / img.naturalHeight;
      var wasWide = canvas.classList.contains('is-wide');
      var isWide = viewportAspect > imageAspect;
      canvas.classList.toggle('is-wide', isWide);
      // The TV screen's own --x/--y/--w/--h get recomputed against the
      // image's rendered box by tv-remote.js's positionScreen() -- but
      // only on that image's own load event and on window resize, neither
      // of which know this class just flipped the image between full-photo
      // and cover-cropped sizing. Left alone, a resize that crosses the
      // is-wide threshold can leave the TV positioned for whichever mode
      // was current when ITS OWN resize handler last ran (a debounce-order
      // race against this one), silently drifting off where the room photo
      // actually shows a TV -- most visible as the top of the screen
      // reading as cropped/cut off. Telling positionScreen() to redo its
      // math the instant this actually changes closes that race outright,
      // regardless of either handler's own timing.
      if (isWide !== wasWide) {
        document.dispatchEvent(new CustomEvent('pp:scene-resized', { detail: { id: scene.id } }));
      }
    }

    function sizeAll() { scenes.forEach(sizeOne); }

    scenes.forEach(function (scene) {
      var img = $('.floor-scene__view img', scene);
      if (!img) return;
      if (img.complete) sizeOne(scene);
      img.addEventListener('load', function () { sizeOne(scene); });
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeAll, 120);
    }, { passive: true });

    document.addEventListener('pp:room-change', function (e) {
      var scene = e.detail && e.detail.id && document.getElementById(e.detail.id);
      if (scene && scene.classList.contains('floor-scene')) sizeOne(scene);
    });
  }

  function artifacts() {
    var scenes = $$('.floor-scene');
    if (!scenes.length) return;

    scenes.forEach(function (scene) {
      // Scoped to data-artifact specifically -- .artifact alone also
      // matches non-drawer markers that share the same visual treatment
      // (the Remote toggle, The City link): those have no matching
      // .drawer__panel anyway, but this handler was still calling
      // e.preventDefault() unconditionally on every click, which is a
      // harmless no-op for a <button> with no default action but
      // silently killed a real <a href> link's navigation outright.
      var spots  = $$('.artifact[data-artifact]', scene);
      var drawer = $('.drawer', scene);
      if (!spots.length || !drawer) return;

      var panels = $$('.drawer__panel', drawer);
      var closeBtn = $('.drawer__close', drawer);

      function close() {
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        spots.forEach(function (s) {
          s.classList.remove('is-active');
          s.setAttribute('aria-expanded', 'false');
        });
      }

      function open(key, spot) {
        var found = false;
        panels.forEach(function (p) {
          var on = p.dataset.artifact === key;
          p.hidden = !on;
          if (on) found = true;
        });
        if (!found) return;

        spots.forEach(function (s) {
          var on = s === spot;
          s.classList.toggle('is-active', on);
          s.setAttribute('aria-expanded', String(on));
        });
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
      }

      spots.forEach(function (spot) {
        var key = spot.dataset.artifact;
        spot.setAttribute('aria-expanded', 'false');
        spot.setAttribute('aria-controls', drawer.id || '');
        spot.addEventListener('click', function (e) {
          e.preventDefault();
          if (spot.classList.contains('is-active')) { close(); return; }
          open(key, spot);
        });
      });

      if (closeBtn) closeBtn.addEventListener('click', close);

      scene.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
          close();
          var active = $('.artifact.is-active', scene);
          if (active) active.focus();
        }
      });

      // Leaving the floor closes whatever was open on it
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting && drawer.classList.contains('is-open')) close();
          });
        }, { threshold: 0.12 }).observe(scene);
      }
    });
  }

  /* ---------- 9c. BEFORE / AFTER SLIDERS ---------- */
  function beforeAfter() {
    $$('.ba').forEach(function (el) {
      if (!$('.ba__after', el)) return;          // nothing to reveal
      var dragging = false;

      function set(clientX) {
        var r = el.getBoundingClientRect();
        var pct = ((clientX - r.left) / r.width) * 100;
        el.style.setProperty('--split', Math.max(0, Math.min(100, pct)) + '%');
      }

      el.addEventListener('pointerdown', function (e) {
        dragging = true; el.setPointerCapture(e.pointerId); set(e.clientX);
      });
      el.addEventListener('pointermove', function (e) { if (dragging) set(e.clientX); });
      el.addEventListener('pointerup', function () { dragging = false; });
      el.addEventListener('pointercancel', function () { dragging = false; });

      // keyboard: focusable, arrows nudge the split
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'slider');
      el.setAttribute('aria-label', 'Reveal the finished site');
      el.addEventListener('keydown', function (e) {
        var cur = parseFloat(el.style.getPropertyValue('--split')) || 50;
        if (e.key === 'ArrowLeft') { el.style.setProperty('--split', Math.max(0, cur - 4) + '%'); e.preventDefault(); }
        if (e.key === 'ArrowRight') { el.style.setProperty('--split', Math.min(100, cur + 4) + '%'); e.preventDefault(); }
      });
    });
  }

  /* ---------- 10b. TOGGLEABLE OVERLAYS ----------
     Shared by any section that's better reached as an on-demand full-
     screen panel than sitting in normal page flow -- a fixed button
     toggles it open, closed via its own close button, clicking outside
     .wrap, or Escape. Used for the footer (sitemap, contact, copyright --
     used to mean scrolling past a full-screen room on the room-pager
     pages) and the City Guide's legend/methodology block (used to mean
     scrolling past it to reach... nothing, since it's the last thing on
     the page -- but at 75-listings length, still real height to shed). */
  function makeToggleableOverlay(el, opts) {
    el.classList.add('is-toggleable');
    el.setAttribute('aria-hidden', 'true');

    var wrap = el.querySelector('.wrap');
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'overlay-close';
    closeBtn.textContent = 'Close ×';
    // Inside .wrap (the popup's own content column), not pinned to the
    // raw viewport corner -- fixed-to-viewport put it directly on top of
    // the persistent site header's Menu button instead of reading as
    // part of this panel.
    if (wrap) wrap.insertBefore(closeBtn, wrap.firstChild);
    else el.insertBefore(closeBtn, el.firstChild);

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = opts.toggleClass;
    toggleBtn.textContent = opts.toggleLabel;
    document.body.appendChild(toggleBtn);

    function setOpen(open) {
      el.classList.toggle('is-open', open);
      el.setAttribute('aria-hidden', String(!open));
    }
    toggleBtn.addEventListener('click', function () { setOpen(!el.classList.contains('is-open')); });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    el.addEventListener('click', function (e) {
      if (e.target === el) setOpen(false); // the backdrop itself, not .wrap's content
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.classList.contains('is-open')) setOpen(false);
    });

    return { toggleBtn: toggleBtn, setOpen: setOpen };
  }

  function footerOverlay() {
    var foot = $('.foot--film');
    if (!foot) return;
    var ctrl = makeToggleableOverlay(foot, { toggleClass: 'footer-toggle', toggleLabel: 'Footer' });

    // The Cinema room's own content (a large TV plus its lower-third/
    // guide-panel/remote overlays) was throwing off the page's scroll when
    // the footer -- unrelated content living way down the page -- was
    // reachable from there too. Simplest fix: the Footer button (and so
    // the overlay it opens) just isn't offered while Cinema is the room
    // on screen; it force-closes on the way in, in case it was left open.
    document.addEventListener('pp:room-change', function (e) {
      var inCinema = e.detail && e.detail.id === 'cinema';
      ctrl.toggleBtn.hidden = inCinema;
      if (inCinema) ctrl.setOpen(false);
    });
  }

  // The City Guide's "Verified, not invented" methodology note, the
  // price/access legend, and the image-sourcing/upload policy note were
  // all static page-flow content at the very bottom of an already very
  // long page. None of it is something a visitor browsing listings needs
  // in front of them by default -- moved into the same on-demand-overlay
  // pattern as the footer, reachable from its own corner button instead.
  function guideInfoOverlay() {
    var legend = $('#legend');
    if (!legend) return;
    makeToggleableOverlay(legend, { toggleClass: 'guide-info-toggle', toggleLabel: 'Guide Info' });
  }

  /* ---------- 11. LAZY VIDEO ---------- */
  function lazyVideo() {
    var vids = $$('video[data-lazy]');
    if (!vids.length) return;

    if (reduced) { vids.forEach(function (v) { v.removeAttribute('autoplay'); }); return; }
    if (!('IntersectionObserver' in window)) return;

    // Respect data-saver: the poster is a frame of the same footage,
    // so holding on the still is a clean fallback rather than a downgrade.
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || /^(slow-)?2g$/.test(conn.effectiveType || ''))) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          $$('source[data-src]', v).forEach(function (s) {
            if (!s.src) { s.src = s.dataset.src; v.load(); }
          });
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: '200px' });

    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------- 12. YEAR ---------- */
  function year() {
    $$('[data-year]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
  }

  /* ---------- BOOT ---------- */
  function boot() {
    gate(); menu(); reveal(); parallax(); tracker(); navHide();
    accordions(); redactions(); network(); doors(); artifacts(); forceEagerImageOnRoomChange(); sizeFloorScenes(); beforeAfter(); footerOverlay(); guideInfoOverlay(); lazyVideo(); year();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
