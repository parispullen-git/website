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

  // A dashboard-authored post's position is explicit (set by the Move
  // Up/Down controls in dashboard.html) once it's ever been reordered;
  // before that -- or for one saved before the order field existed --
  // falls back to newest-first, matching the old behavior exactly.
  function orderOf(p) { return p && p.order != null ? p.order : (p && p.createdAt) || 0; }

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
    // Delegated on the container (not the button list captured below) so
    // it keeps working after the category-merge fetch below adds, relabels,
    // or removes buttons underneath it.
    filter.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-cat]');
      if (!btn) return;
      Array.prototype.forEach.call(filter.querySelectorAll('button[data-cat]'), function (b) { b.classList.toggle('is-on', b === btn); });
      currentCat = btn.dataset.cat;
      applyFilter(currentCat);
    });

    // The filter bar's "All" + ten category buttons are baked at build
    // time from build_journal.py's CATS list -- a sensible, always-present
    // default. Categories added, relabeled, or removed from the dashboard
    // afterward live in the 'journal-categories' collection instead
    // (never touching that Python list or triggering a rebuild) and are
    // reconciled against the baked buttons here at runtime: a record whose
    // slug matches a baked button relabels it (or removes it, if
    // deleted:true -- a baked-in category can't be un-baked, only
    // tombstoned); one that doesn't match is a genuinely new category,
    // appended to the bar.
    fetch('/api/content?collection=journal-categories')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var overrides = (data && data.records) || [];
        if (!overrides.length) return;
        var bySlug = {};
        overrides.forEach(function (o) { if (o && o.slug) bySlug[o.slug] = o; });
        var seen = {};
        Array.prototype.forEach.call(filter.querySelectorAll('button[data-cat]'), function (btn) {
          var slug = btn.dataset.cat;
          if (slug === 'all') return;
          seen[slug] = true;
          var o = bySlug[slug];
          if (!o) return;
          if (o.deleted) { btn.remove(); return; }
          if (o.label) btn.textContent = o.label;
        });
        overrides.forEach(function (o) {
          if (!o || !o.slug || o.deleted || seen[o.slug]) return;
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.dataset.cat = o.slug;
          btn.textContent = o.label || o.slug;
          filter.appendChild(btn);
        });
      })
      .catch(function () { /* baked-in categories still work on their own */ });
  }

  if (grid) {
    var knownSlugs = {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-slug]'), function (el) {
      if (el.dataset.slug) knownSlugs[el.dataset.slug] = true;
    });

    fetch('/api/content?collection=journal')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var posts = (data && data.records) || [];
        posts
          .filter(function (p) { return p && p.slug && p.title && p.status !== 'draft' && !knownSlugs[p.slug]; })
          .sort(function (a, b) { return (orderOf(b)) - (orderOf(a)); })
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
