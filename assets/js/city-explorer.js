/* ============================================================
   City Explorer — drills the district map down to venues.

   Shared by charlotte.html (the full guide) and index.html (the
   condensed homepage widget). Listens for the 'citymap:district'
   event city.js fires whenever a district is selected, then:

     1. Renders that district's curated venues as an artifact-style
        list inside the map's cityread card (#cityread-venues).
     2. Renders the same venues as artifact hotspot dots on the map
        photo itself (.cityplate .artifacts), reusing the exact
        .artifact / .artifact__dot markup house.html's rooms use.
     3. Wires both to open a detail drawer on click:
          - on charlotte.html, where every venue has a full .vcard
            in the page, it hands off to charlotte-guide.js's own
            openQuick() via window.__openVenueQuick — the same
            vquick drawer the full listing grid uses.
          - anywhere else (the homepage's condensed widget), it
            opens the smaller #cityquick drawer with what the map
            itself knows (name, category, one line) plus a link
            through to the full listing on charlotte.html.

   This is the one place that reconciles the site's two existing
   "click a hotspot, open a drawer" systems (world.js's per-scene
   .artifact/.drawer pairing, and the single shared quick-view
   drawer pattern from wardrobe.js / charlotte-guide.js) rather
   than inventing a third.
   ============================================================ */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c];
    });
  };
  var slug = function (s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  // Full guide section id -> display name + total listing count, so a
  // district with only 2-3 curated venues can still point at "see all
  // N" for its whole neighborhood group. Keep this in sync with the
  // NEIGHBORHOODS list in build_charlotte.py if the guide's groups change.
  var GROUPS = {
    'uptown':         { name: 'Uptown / Fourth Ward / First Ward', count: 25 },
    'south-end':      { name: 'South End / Dilworth / Wilmore', count: 8 },
    'myers-park':     { name: 'Myers Park / Eastover / SouthPark', count: 12 },
    'plaza-midwood':  { name: 'Plaza Midwood / Elizabeth / Belmont', count: 8 },
    'noda':           { name: 'NoDa / Optimist Park / University City', count: 9 },
    'ballantyne':     { name: 'Ballantyne / Piper Glen / South Charlotte / Steele Creek / The Palisades', count: 6 },
    'west-charlotte': { name: 'West Charlotte / Wesley Heights / Camp North End', count: 6 }
  };

  var onGuidePage = !!document.querySelector('.vgrid');

  function groupHref(groupId) {
    if (onGuidePage && document.getElementById(groupId)) return '#' + groupId;
    return 'charlotte.html#' + groupId;
  }
  function venueHref(groupId, name) {
    var vid = groupId + '-' + slug(name);
    if (onGuidePage && document.getElementById(vid)) return '#' + vid;
    return 'charlotte.html#' + vid;
  }

  /* ---------- standalone City Guide return ---------- */
  // Inside the Penthouse the parent Guide Portal owns the Back control.
  // When the explorer is opened as a top-level page (notably from
  // links.parispullen.com), give it the same return affordance itself.
  function installStandaloneBack() {
    if (window.top !== window.self || !/\/city-guide-popup\.html$/i.test(location.pathname)) return;
    var style = document.createElement('style');
    style.textContent = '.city-back-penthouse{position:fixed;z-index:80;top:max(12px,env(safe-area-inset-top));left:12px;min-height:44px;padding:0 14px;border:1px solid rgba(241,234,223,.22);background:rgba(8,9,8,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#f1eadf;font:500 9px Inter,Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase;box-shadow:0 10px 30px rgba(0,0,0,.35)}.city-back-penthouse span{color:#c9a66a;margin-right:8px}.city-back-penthouse:hover,.city-back-penthouse:focus-visible{border-color:#c9a66a;color:#c9a66a}@media(max-width:840px){.city-back-penthouse{top:max(8px,env(safe-area-inset-top));left:auto;right:8px;min-height:46px;padding:0 12px;font-size:8px}.hud{padding-right:118px!important}}';
    document.head.appendChild(style);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'city-back-penthouse';
    btn.innerHTML = '<span aria-hidden="true">&#8592;</span>Back to Penthouse';
    btn.addEventListener('click', function () {
      var match = document.cookie.match(/(?:^|;\s*)pp_last_penthouse_room=([^;]+)/);
      var room = 'penthouse-living';
      if (match) {
        try { room = decodeURIComponent(match[1]) || room; } catch (err) {}
      }
      if (!/^[a-z0-9-]+$/i.test(room)) room = 'penthouse-living';
      window.location.href = 'https://parispullen.com/#' + encodeURIComponent(room);
    });
    document.body.appendChild(btn);
  }

  /* ---------- the condensed drawer (#cityquick) ---------- */
  var cq = document.getElementById('cityquick');
  var cqCat, cqName, cqNote, cqLink, cqAll;
  if (cq) {
    cqCat = document.getElementById('cityquick-cat');
    cqName = document.getElementById('cityquick-name');
    cqNote = document.getElementById('cityquick-note');
    cqLink = document.getElementById('cityquick-link');
    cqAll = document.getElementById('cityquick-all');

    cq.addEventListener('click', function (e) {
      if (e.target.closest('[data-cityquick-close]')) closeCondensed();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && cq.classList.contains('is-open')) closeCondensed();
    });
  }
  function openCondensed(groupId, v) {
    if (!cq) return;
    cqCat.textContent = v.cat || '';
    cqName.textContent = v.name || '';
    cqNote.textContent = v.note || '';
    cqLink.href = venueHref(groupId, v.name);
    if (cqAll) {
      cqAll.href = groupHref(groupId);
      var meta = GROUPS[groupId];
      cqAll.querySelector('span:first-child').textContent = meta ? 'All ' + meta.name : 'All Charlotte Listings';
    }
    cq.classList.add('is-open');
    cq.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  }
  function closeCondensed() {
    if (!cq) return;
    cq.classList.remove('is-open');
    cq.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  }

  /* ---------- opening a venue: full drawer if we can, condensed if we can't ---------- */
  function openVenue(d, v) {
    var vid = d.group + '-' + slug(v.name);
    var card = document.getElementById(vid);
    if (card && typeof window.__openVenueQuick === 'function') {
      window.__openVenueQuick(card);
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    openCondensed(d.group, v);
  }

  /* ---------- the cityread venue list ---------- */
  function renderList(d) {
    var host = document.getElementById('cityread-venues');
    if (!host) return;

    if (!d.venues || !d.venues.length) {
      var meta = GROUPS[d.group];
      host.outerHTML = '<p class="cityread__pending" id="cityread-venues">' +
        'Full listings not yet pinned to this exact pocket' +
        (meta ? ' &#8212; browse <a class="link-under" href="' + groupHref(d.group) + '">' + esc(meta.name) + '</a> nearby.' : '.') +
        '</p>';
      return;
    }

    var rows = d.venues.map(function (v, i) {
      return '<button type="button" class="cityread__venue" data-idx="' + i + '">' +
        '<span class="cityread__venue__name"><i aria-hidden="true"></i><span>' + esc(v.name) + '</span></span>' +
        '<small>' + esc(v.cat) + '</small>' +
      '</button>';
    }).join('');

    var meta = GROUPS[d.group];
    var seeAll = meta
      ? '<a class="cityread__seeall link-under" href="' + groupHref(d.group) + '">See all ' + meta.count + ' in ' + esc(meta.name) + ' &#8594;</a>'
      : '';

    host.innerHTML = rows + seeAll;

    host.querySelectorAll('.cityread__venue').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openVenue(d, d.venues[+btn.dataset.idx]);
      });
    });
  }

  /* ---------- the map-surface hotspots ---------- */
  var W = (window.CHARLOTTE && window.CHARLOTTE.view && window.CHARLOTTE.view.w) || 2000;
  var H = (window.CHARLOTTE && window.CHARLOTTE.view && window.CHARLOTTE.view.h) || 1125;

  function ringPos(lx, ly, i, n) {
    var cx = lx / W * 100, cy = ly / H * 100;
    if (n > 1) {
      var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      cx += Math.cos(angle) * 7.5;
      cy += Math.sin(angle) * 7.5;
    }
    return [Math.min(95, Math.max(5, cx)), Math.min(94, Math.max(6, cy))];
  }

  function renderHotspots(d) {
    var plate = document.querySelector('.cityplate');
    if (!plate) return;
    var layer = plate.querySelector('.artifacts');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'artifacts';
      plate.appendChild(layer);
    }
    if (!d.venues || !d.venues.length) { layer.innerHTML = ''; return; }

    layer.innerHTML = d.venues.map(function (v, i) {
      var p = ringPos(d.lx, d.ly, i, d.venues.length);
      return '<button type="button" class="artifact" style="--x:' + p[0] + '%;--y:' + p[1] + '%" data-idx="' + i + '">' +
        '<span class="artifact__dot" aria-hidden="true"></span>' +
        '<span class="artifact__label">' + esc(v.name) + '</span>' +
      '</button>';
    }).join('');

    layer.querySelectorAll('.artifact').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openVenue(d, d.venues[+btn.dataset.idx]);
      });
    });
  }

  document.addEventListener('citymap:district', function (e) {
    var d = e.detail;
    if (!d) return;
    renderList(d);
    renderHotspots(d);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installStandaloneBack);
  else installStandaloneBack();
})();