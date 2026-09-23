/* ============================================================
   Charlotte: A Gentleman's Guide — filter bar + quick-view drawer
   Mirrors the wardrobe.js quick-view pattern: data lives on each
   .vcard's dataset, read into a single shared drawer on open.
   ============================================================ */
(function () {
  'use strict';

  // links.parispullen.com historically linked straight to charlotte.html.
  // Keep that card useful without duplicating its markup: on the links
  // subdomain, hand the top-level visit to the same immersive City Guide
  // explorer used by the Penthouse popup. The full charlotte.html guide
  // remains available normally on parispullen.com.
  if (window.top === window.self && /^links\./i.test(location.hostname)) {
    location.replace('/city-guide-popup.html' + (location.hash || ''));
    return;
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.vcard'));
  if (!cards.length) return;

  var totalCount = cards.length;

  /* ---------- filters ---------- */
  var filterBar = document.getElementById('vfilter');
  var countEl = document.getElementById('vcount');
  var resetBtn = document.getElementById('vfilter-reset');
  var active = [];

  function applyFilters() {
    var byHood = {};
    cards.forEach(function (card) {
      var cardFilters = (card.dataset.filters || '').split(' ').filter(Boolean);
      var match = active.every(function (f) { return cardFilters.indexOf(f) !== -1; });
      card.hidden = !match;
      var hoodEl = card.closest('.vhood');
      if (!hoodEl) return;
      var id = hoodEl.id;
      byHood[id] = byHood[id] || 0;
      if (match) byHood[id]++;
    });

    var visible = cards.filter(function (c) { return !c.hidden; }).length;
    countEl.textContent = active.length
      ? visible + ' of ' + totalCount + ' listings'
      : totalCount + ' listings';

    Array.prototype.forEach.call(document.querySelectorAll('.vhood'), function (hood) {
      var empty = hood.querySelector('.vempty');
      if (empty) empty.hidden = (byHood[hood.id] || 0) !== 0;
      var acc = hood.querySelector('.vhood__acc');
      if (!acc) return;
      if (active.length) acc.open = (byHood[hood.id] || 0) > 0;
      else acc.open = false;
    });
  }

  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      var f = btn.dataset.filter;
      var i = active.indexOf(f);
      if (i === -1) { active.push(f); btn.classList.add('is-on'); }
      else { active.splice(i, 1); btn.classList.remove('is-on'); }
      applyFilters();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      active = [];
      Array.prototype.forEach.call(filterBar.querySelectorAll('button[data-filter]'), function (b) {
        b.classList.remove('is-on');
      });
      applyFilters();
    });
  }

  /* ---------- quick view drawer ---------- */
  var quick = document.getElementById('vquick');
  if (!quick) return;

  var qCat = document.getElementById('vquick-cat');
  var qName = document.getElementById('vquick-name');
  var qAddr = document.getElementById('vquick-addr');
  var qPrice = document.getElementById('vquick-price');
  var qAccess = document.getElementById('vquick-access');
  var qNoteFlag = document.getElementById('vquick-note-flag');
  var qDesc = document.getElementById('vquick-desc');
  var qBest = document.getElementById('vquick-best');
  var qSpec = document.getElementById('vquick-spec');
  var qMap = document.getElementById('vquick-map');
  var qSite = document.getElementById('vquick-site');
  var qPh1 = document.getElementById('vquick-ph1');
  var qPh3 = document.getElementById('vquick-ph3');

  function siteURL(raw) {
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
  }

  function openQuick(card) {
    var d = card.dataset;
    qCat.textContent = d.catline || d.cat || '';
    qName.textContent = d.name || '';
    qAddr.textContent = d.addr || '';
    qPrice.textContent = d.price || '';
    qAccess.textContent = d.access || '';

    if (d.note) {
      qNoteFlag.textContent = d.note;
      qNoteFlag.hidden = false;
    } else {
      qNoteFlag.hidden = true;
    }

    qDesc.textContent = d.desc || '';

    var mediaLabel = d.mediaLabel || 'Signature';
    qPh1.textContent = (d.name || '') + ' · Exterior';
    qPh3.textContent = (d.name || '') + ' · ' + mediaLabel;

    var best = (d.best || '').split('|').filter(Boolean);
    qBest.innerHTML = best.length
      ? best.map(function (b) { return '<span>' + b + '</span>'; }).join('')
      : '<span>&#8212;</span>';

    var spec = (d.spec || '').split('|').filter(Boolean);
    qSpec.innerHTML = spec.map(function (s) { return '<span>' + s + '</span>'; }).join('');

    var mapq = d.mapq || d.name;
    qMap.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapq);

    var site = siteURL(d.site);
    if (site) {
      qSite.href = site;
      qSite.hidden = false;
    } else {
      qSite.hidden = true;
    }

    quick.classList.add('is-open');
    quick.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  }

  function closeQuick() {
    quick.classList.remove('is-open');
    quick.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  }

  document.querySelectorAll('.vgrid').forEach(function (grid) {
    grid.addEventListener('click', function (e) {
      var open = e.target.closest('.vcard__open');
      if (!open) return;
      var card = open.closest('.vcard');
      if (card) openQuick(card);
    });
  });

  quick.addEventListener('click', function (e) {
    if (e.target.closest('[data-vquick-close]')) closeQuick();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && quick.classList.contains('is-open')) closeQuick();
  });

  window.__openVenueQuick = openQuick;

  function openFromHash() {
    if (!location.hash) return;
    var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    var acc = target.classList.contains('vhood__acc') ? target : target.querySelector('.vhood__acc') || target.closest('.vhood__acc');
    if (acc) acc.open = true;
    if (target.classList.contains('vcard')) {
      window.setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        openQuick(target);
      }, 350);
    } else {
      window.setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    }
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();