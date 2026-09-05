/* ============================================================
   District Switcher — the City Guide's seven .vhood sections used
   to sit stacked one after another down the page: seven headers
   plus, once you opened one, up to 26 listing cards, all in a
   single scroll. This turns them into one focused panel with a
   sticky row of district chips above it, so only the district
   you're actually reading is in the document at a time.

   Progressive enhancement, deliberately: the chips and the
   .has-district-switcher class that drives the show/hide CSS are
   both added HERE, at runtime. With this script blocked or
   broken the page falls straight back to what it was -- seven
   <details> accordions that all still open and close on their own.

   Anything that links INTO a district (the map's own zone links
   in city.js/city-explorer.js, which point at "#uptown" and at
   individual "#uptown-church-and-union" card ids, plus any hash
   the page is loaded with) has to switch the panel first or it
   would scroll to something display:none -- see activateFor().
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var hoods = Array.prototype.slice.call(document.querySelectorAll('.vhood'));
    if (hoods.length < 2) return;

    var nav = document.createElement('nav');
    nav.className = 'districts';
    nav.setAttribute('aria-label', 'Districts');
    var list = document.createElement('div');
    list.className = 'districts__row';
    nav.appendChild(list);

    var chips = {};

    hoods.forEach(function (hood) {
      var nameEl = hood.querySelector('.vhood__name');
      var countEl = hood.querySelector('.vhood__count');
      // "Uptown / Fourth Ward / First Ward" -> "Uptown". The full
      // name is still right there in the panel's own header once
      // you're in it; the chip only has to be recognisable.
      var full = nameEl ? nameEl.textContent.trim() : hood.id;
      var short = full.split('/')[0].trim() || full;
      var count = (countEl && (countEl.textContent.match(/\d+/) || [])[0]) || '';

      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'districts__chip';
      chip.dataset.district = hood.id;
      chip.innerHTML = '<span class="districts__chip-name"></span>' +
        (count ? '<span class="districts__chip-count"></span>' : '');
      chip.querySelector('.districts__chip-name').textContent = short;
      if (count) chip.querySelector('.districts__chip-count').textContent = count;

      chips[hood.id] = chip;
      list.appendChild(chip);
    });

    hoods[0].parentNode.insertBefore(nav, hoods[0]);
    document.documentElement.classList.add('has-district-switcher');

    function activate(id, opts) {
      var target = document.getElementById(id);
      if (!target || !target.classList.contains('vhood')) return false;
      hoods.forEach(function (hood) {
        var on = hood === target;
        hood.classList.toggle('is-active', on);
        var acc = hood.querySelector('.vhood__acc');
        if (acc) acc.open = on; // the panel on show is always open; the chip row is the toggle now
      });
      Object.keys(chips).forEach(function (key) {
        chips[key].classList.toggle('is-active', key === id);
        chips[key].setAttribute('aria-current', key === id ? 'true' : 'false');
      });
      // world.js's reveal observer fades .reveal elements in when they
      // intersect -- which a display:none district never has. It will
      // fire now that this one is shown, but don't make the panel wait
      // on a frame's worth of observer latency to become legible.
      Array.prototype.forEach.call(target.querySelectorAll('.reveal'), function (el) {
        el.classList.add('is-in');
      });
      if (opts && opts.scroll) {
        nav.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return true;
    }

    // A hash can point at a district itself ("#uptown") or at one
    // single listing card inside one ("#uptown-church-and-union").
    // Either way the district that contains it has to come up first.
    function activateFor(hash) {
      if (!hash || hash.charAt(0) !== '#') return false;
      var el;
      try { el = document.querySelector(hash); } catch (err) { return false; }
      if (!el) return false;
      var hood = el.closest('.vhood');
      if (!hood) return false;
      return activate(hood.id, { scroll: false });
    }

    list.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-district]');
      if (!chip) return;
      activate(chip.dataset.district, { scroll: true });
    });

    // Links into a hidden district (the map's zones, the quick-view
    // drawer's "browse nearby", anything else pointing at a #id)
    // switch the panel first, then let the browser do its own
    // anchor scroll on the now-visible target.
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      activateFor(hash);
    });

    window.addEventListener('hashchange', function () { activateFor(window.location.hash); });

    // The corner "Districts" panel (nav-panel.js, filled by city.js) lists
    // the thirteen MAP zones, and its own handler only moves the map. Each
    // zone rolls up into one of the seven listing districts via its `group`
    // -- so a pick there should also open that district's listings and take
    // you down to them, which is the whole point of picking one. Read off
    // window.CHARLOTTE rather than duplicating the zone->group table here.
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-nav-panel-go]');
      if (!btn) return;
      var zones = (window.CHARLOTTE && window.CHARLOTTE.districts) || [];
      var zone = zones.filter(function (d) { return d.id === btn.dataset.navPanelGo; })[0];
      var groupId = zone && zone.group;
      if (!groupId || !document.getElementById(groupId)) return;
      activate(groupId, { scroll: false });
      // After city.js's own handler has finished moving the map -- it runs
      // on this same click -- bring the now-open listings into view.
      setTimeout(function () {
        var hood = document.getElementById(groupId);
        if (hood) hood.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    });

    // Open on whatever the page was loaded pointing at, else the
    // first district -- never nothing.
    if (!activateFor(window.location.hash)) activate(hoods[0].id, { scroll: false });

    // With the chips doing the switching, the panel header clicking
    // itself shut would leave the page showing no listings at all.
    hoods.forEach(function (hood) {
      var summary = hood.querySelector('.vhood__head');
      if (summary) summary.addEventListener('click', function (e) { e.preventDefault(); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
