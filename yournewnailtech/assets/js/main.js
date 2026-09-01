/* Your New Nail Tech — interactions */
(function () {
  'use strict';

  /* ---------- Year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile drawer ---------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');

  if (burger && drawer) {
    var setDrawer = function (open) {
      drawer.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('is-open'));
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setDrawer(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        setDrawer(false);
        burger.focus();
      }
    });

    // Close if we resize back up to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && drawer.classList.contains('is-open')) setDrawer(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.rv');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el, i) {
      // Light stagger within a shared parent
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Spotify playlist ---------- */
  // Set data-playlist="<id>" on #pl-embed to swap the placeholder for the
  // real player. Accepts a bare ID, a spotify:playlist:ID URI, or a full URL.
  var embed = document.getElementById('pl-embed');

  if (embed) {
    var raw = (embed.getAttribute('data-playlist') || '').trim();

    if (raw) {
      var id = raw;
      var m = raw.match(/playlist[/:]([A-Za-z0-9]+)/);
      if (m) id = m[1];

      var frame = document.createElement('iframe');
      frame.src = 'https://open.spotify.com/embed/playlist/' + encodeURIComponent(id) +
                  '?utm_source=generator&theme=0';
      frame.title = 'Your New Nail Tech — studio playlist';
      frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      frame.loading = 'lazy';
      frame.setAttribute('frameborder', '0');

      var ph = document.getElementById('pl-ph');
      if (ph) ph.remove();
      embed.appendChild(frame);

      var open = document.getElementById('pl-open');
      if (open) open.href = 'https://open.spotify.com/playlist/' + encodeURIComponent(id);
    }
  }
})();
