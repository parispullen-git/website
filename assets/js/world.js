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

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

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
  function artifacts() {
    var scenes = $$('.floor-scene');
    if (!scenes.length) return;

    scenes.forEach(function (scene) {
      var spots  = $$('.artifact', scene);
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

  /* ---------- 10. SOUND (opt-in, default off) ---------- */
  function sound() {
    var btn = $('#sound');
    if (!btn) return;
    var audio = $('#ambience');
    var on = false;

    btn.addEventListener('click', function () {
      on = !on;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', String(on));
      var label = $('.sound__label', btn);
      if (label) label.textContent = on ? 'Sound on' : 'Sound off';
      if (!audio) return;
      if (on) {
        audio.volume = 0.18;
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        audio.pause();
      }
    });
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
    accordions(); redactions(); network(); doors(); artifacts(); beforeAfter(); sound(); lazyVideo(); year();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
