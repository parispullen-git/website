/* ============================================================
   The Journal — category filter, plus dashboard-authored posts
   merged in at runtime.

   journal.html's featured lead + .jgrid cards are baked at build
   time from data/journal.json (python3 build_journal.py). New posts
   saved through the dashboard live in the 'journal' Netlify Blobs
   collection instead and never touch that file or trigger a
   rebuild -- they're fetched here and appended to the same #jgrid,
   deduped by slug against the static cards so a post that later
   gets folded into a real rebuild never shows twice. Each
   dashboard-authored card links to journal-post.html?slug=<slug>,
   a small generic reader (see that file) rather than a baked
   journal-<slug>.html page.
   ============================================================ */
(function () {
  'use strict';

  var grid = document.getElementById('jgrid');
  var filter = document.querySelector('.jfilter');
  var empty = document.getElementById('jempty');
  var currentCat = 'all';

  /* ---------- the full-bleed hero carousel ---------- */
  (function heroCarousel() {
    var hero = document.getElementById('jhero');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-jhero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-jhero-dot]'));
    if (slides.length < 2) return;

    var index = 0;
    var timer = null;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-on', i === index); });
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === index); });
    }
    function start() {
      if (reduced) return;
      stop();
      timer = setInterval(function () { show(index + 1); }, 6500);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    // Don't keep cycling in a background tab.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    start();
  })();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Cards are re-queried on every filter click (rather than snapshotted
  // once at load) so dashboard-authored cards appended later, after this
  // script has already run, still get filtered correctly.
  function applyFilter(cat) {
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.jcard'));
    var visible = 0;
    cards.forEach(function (card) {
      var show = cat === 'all' || card.dataset.cat === cat;
      card.hidden = !show;
      if (show) visible++;
    });
    if (empty) empty.hidden = visible > 0;
  }

  if (filter) {
    var buttons = Array.prototype.slice.call(filter.querySelectorAll('button'));
    filter.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-cat]');
      if (!btn) return;
      buttons.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
      currentCat = btn.dataset.cat;
      applyFilter(currentCat);
    });
  }

  if (grid) {
    var knownSlugs = {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-slug]'), function (el) {
      if (el.dataset.slug) knownSlugs[el.dataset.slug] = true;
    });

    fetch('/.netlify/functions/content?collection=journal')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var posts = (data && data.records) || [];
        posts
          .filter(function (p) { return p && p.slug && p.title && !knownSlugs[p.slug]; })
          .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); })
          .forEach(function (p) {
            knownSlugs[p.slug] = true;
            var card = document.createElement('a');
            card.className = 'jcard';
            card.dataset.cat = p.cat || '';
            card.dataset.slug = p.slug;
            card.href = 'journal-post.html?slug=' + encodeURIComponent(p.slug);
            var img = (p.hero && p.hero.url) || '';
            // Same shape as the baked cards in build_journal.py's
            // render_jcard(): image, headline, category — nothing else,
            // so a runtime-added card is indistinguishable from a built one.
            card.innerHTML =
              '<div class="jcard__media"><img src="' + esc(img) + '" alt="" loading="lazy"></div>' +
              '<h3 class="jcard__title jcard__title--lead">' + esc(p.title) + '</h3>' +
              '<p class="jcard__cat">' + esc(p.catlabel || p.cat || '') + '</p>';
            grid.appendChild(card);
          });
        applyFilter(currentCat);
      })
      .catch(function () { /* static cards render fine on their own */ });
  }
})();
