/* ============================================================
   Charlotte — The Gentleman's City Guide
   Districts are polygons traced onto the boundaries already drawn
   on the map plate, in its own 2000 x 1125 coordinate space.

   Each district carries a small, curated set of venues (2-4) --
   name, category and a one-line note. This is deliberately a
   *subset*, not the full guide: it drives the map's own hotspots
   and the homepage's condensed widget alike. The exhaustive list
   for a district's group lives in charlotte.html's own listing
   grid, under the matching section id in `group` below.

   `group` maps each of these thirteen map districts onto one of
   the seven neighborhood groupings the full guide is organized by
   (charlotte.html's section ids) -- several districts share a
   group, e.g. Elizabeth and Plaza Midwood both roll up into
   'plaza-midwood'. That's the join key assets/js/city-explorer.js
   uses to open a venue's full listing, or to link out to "see all"
   for the district's whole group.
   ============================================================ */
window.CHARLOTTE = {
  view: { w: 2000, h: 1125 },
  districts: [
    { id:'uptown', name:'Uptown', kind:'The centre', group:'uptown', lx:1010, ly:490,
      poly:'600,400 700,388 900,370 1180,375 1425,390 1420,545 1085,600 830,600 688,548',
      note:'Banks, boardrooms and the hotel. Business gets agreed here and celebrated somewhere else.',
      best:'Weeknights', dress:'Jacket, always',
      venues:[
        {name:'Church and Union', cat:'Restaurant', note:'A converted bank hall turned restaurant and bar, all marble and reclaimed brass.'},
        {name:'The Capital Grille', cat:'Steak & Seafood', note:'The national chophouse formula, executed with enough polish nobody thinks about the other twenty locations.'},
        {name:'Sophia’s Lounge', cat:'Cocktail Bar', note:'A hotel lounge with the confidence to lean fully into velvet and gilt.'},
        {name:'Fahrenheit', cat:'Rooftop Bar', note:'One of Charlotte’s signature skyline dinner-and-drinks settings.'}
      ] },

    { id:'camp-north-end', name:'Camp North End', kind:'Adaptive reuse', group:'west-charlotte', lx:820, ly:270,
      poly:'600,400 690,178 1000,148 1010,360 900,370 700,388',
      note:'A former factory turned into studios and event space. The city’s best rooms for a launch.',
      best:'Event nights', dress:'Considered',
      venues:[
        {name:'Camp North End', cat:'District / Neighborhood', note:'Seventy-plus businesses inside a former munitions and streetcar plant, Charlotte’s clearest adaptive-reuse campus.'},
        {name:'HEX Coffee, Kitchen & Natural Wines', cat:'Coffee', note:'A Japanese-inflected all-day café — coffee by morning, natural wine by evening.'}
      ] },

    { id:'university', name:'University City', kind:'North of everything', group:'noda', lx:1210, ly:250,
      poly:'1000,148 1130,135 1440,212 1425,390 1180,375 1010,360',
      note:'Students, research and the cheapest good food in the county if you know where to look.',
      best:'Term time', dress:'Anything',
      venues:[
        {name:'Fumée Kitchen & Cocktails', cat:'Cocktail Bar', note:'High-energy vibe dining — crafted cocktails, tapas-style plates and premium glass shisha running late.'},
        {name:'Vavela', cat:'Coffee', note:'A late-night Turkish coffee and tea lounge built for the hours after everything else has closed.'}
      ] },

    { id:'noda', name:'NoDa', kind:'Arts district', group:'noda', lx:1680, ly:300,
      poly:'1440,212 1830,285 1900,340 1740,392 1425,390',
      note:'Murals, live rooms and the best crowd in the city for actually listening to a band.',
      best:'Late', dress:'Yourself, but pressed',
      venues:[
        {name:'Haberdish', cat:'Restaurant', note:'Southern cooking with a fried chicken reputation, set in a converted NoDa mill building.'},
        {name:'The Evening Muse', cat:'Live Music', note:'An intimate original-music room where the crowd came to listen, not to be seen listening.'},
        {name:'Idlewild', cat:'Cocktail Bar', note:'No printed cocktail menu — you describe the mood and the bar builds it.'}
      ] },

    { id:'plaza-midwood', name:'Plaza Midwood', kind:'The dive belt', group:'plaza-midwood', lx:1585, ly:500,
      poly:'1425,390 1740,392 1745,660 1420,545',
      note:'Where the tattooed and the tenured drink at the same bar and nobody minds.',
      best:'Any night', dress:'Nothing that tries',
      venues:[
        {name:'Supperland', cat:'Restaurant', note:'A midcentury church turned steakhouse, stained glass intact above the dining room.'},
        {name:'The Bar at Supperland', cat:'Cocktail Bar', note:'The standalone bar attached to the church-turned-restaurant next door, built for a drink.'}
      ] },

    { id:'elizabeth', name:'Elizabeth', kind:'Old shade', group:'plaza-midwood', lx:1310, ly:672,
      poly:'1085,600 1420,545 1745,660 1450,755 1085,760',
      note:'Bungalows and big trees. Quiet tables, quiet money, and one of the better wine lists.',
      best:'Sunday', dress:'Soft tailoring',
      venues:[
        {name:'The Crunkleton', cat:'Cocktail Bar', note:'A spirits library disguised as a bar — the room that put Charlotte’s cocktail scene on the map.'},
        {name:'Sneak CLT', cat:'Speakeasy', note:'A modernized speakeasy in Elizabeth, hidden-door aesthetic without the password theater.'},
        {name:'Puerta', cat:'Restaurant', note:'Stylish dinner-and-drinks on East 7th Street — tequila, mezcal and an elevated Mexican menu.'}
      ] },

    { id:'west-end', name:'West End', kind:'Historic corridor', group:'west-charlotte', lx:420, ly:545,
      poly:'150,610 410,418 605,400 688,548 430,650 355,790',
      note:'Beatties Ford and the institutions along it. The city’s deepest roots and its sharpest barbers.',
      best:'Daytime', dress:'Fresh',
      venues:[
        {name:'Leah & Louise', cat:'Restaurant', note:'A celebrated Black-owned Southern kitchen, relocating from Camp North End into a larger West End building.'},
        {name:'Noble Smoke', cat:'Restaurant', note:'Whole-hog barbecue and a bourbon list long enough to make the wait worthwhile.'}
      ] },

    { id:'steele-creek', name:'Steele Creek', kind:'Southwest', group:'ballantyne', lx:480, ly:890,
      poly:'355,790 430,650 660,845 700,1010 480,1080 300,900',
      note:'Lake access, the airport approach, and a long stretch of road with a few worthwhile stops.',
      best:'Summer', dress:'Off duty',
      venues:[
        {name:'The Palisades Country Club', cat:'Golf & Country Club', note:'A Jack Nicklaus design out near Steele Creek, with river-adjacent views.'}
      ] },

    { id:'south-end', name:'South End', kind:'The rail line', group:'south-end', lx:665, ly:690,
      poly:'688,548 830,600 825,830 660,845 430,650',
      note:'Rooftops, breweries and the loudest brunch in the county. Young money, spending it.',
      best:'Saturday, early', dress:'Sharp casual',
      venues:[
        {name:'Orosoko Sound Bar', cat:'Cocktail Bar', note:'Latin-inflected cocktails and tapas under a sound system that earns the name.'},
        {name:'Barcelona Wine Bar', cat:'Wine Bar', note:'Spanish tapas and a wine list built for grazing rather than committing to one bottle.'},
        {name:'Sixty Vines', cat:'Wine Bar', note:'A bright, design-led wine-country restaurant built around an expansive wine program.'}
      ] },

    { id:'dilworth', name:'Dilworth', kind:'The first suburb', group:'south-end', lx:915, ly:800,
      poly:'825,830 830,600 1085,600 1085,950 900,1035 660,845 700,1010',
      note:'Porches and prams by day. After eight it belongs to people who have already made it.',
      best:'Early evening', dress:'Understated',
      venues:[
        {name:'Kid Cashew', cat:'Restaurant', note:'Wood-fire cooking built around a whole rotisserie chicken good enough to anchor the menu.'},
        {name:'Dilworth Tasting Room', cat:'Wine Bar', note:'A neighborhood wine bar with a list long enough to reward regulars.'}
      ] },

    { id:'myers-park', name:'Myers Park', kind:'Old Charlotte', group:'myers-park', lx:1270, ly:855,
      poly:'1085,760 1450,755 1600,860 1120,1010 1085,950',
      note:'Willow oaks and long driveways. The city’s oldest money, and it does not advertise.',
      best:'By invitation', dress:'Club rules',
      venues:[
        {name:'Myers Park Country Club', cat:'Golf & Country Club', note:'Old Charlotte’s home course, set into the neighborhood it’s named for.'},
        {name:'Quail Hollow Club', cat:'Golf & Country Club', note:'Host of the PGA Tour’s Charlotte stop — the closest thing the city has to a golf landmark.'}
      ] },

    { id:'southpark', name:'SouthPark', kind:'Retail and dining', group:'myers-park', lx:1795, ly:790,
      poly:'1745,660 1930,700 1950,930 1600,860',
      note:'The shopping is the reason people say they came. The steakhouse is the actual reason.',
      best:'Thursday', dress:'Jacket',
      venues:[
        {name:'Steak 48', cat:'Steak & Seafood', note:'An open kitchen and a raw bar working in full view of the dining room.'},
        {name:'Oak Steakhouse', cat:'Steak & Seafood', note:'A regional steakhouse group’s Charlotte flagship — modern and unfussy.'}
      ] },

    { id:'ballantyne', name:'Ballantyne', kind:'The far south', group:'ballantyne', lx:1290, ly:1030,
      poly:'900,1035 1120,1010 1600,860 1700,1060 1000,1095',
      note:'Golf, corporate campuses and clubs with waiting lists. Deals close over eighteen holes.',
      best:'Weekend mornings', dress:'Country club',
      venues:[
        {name:'Hestia Rooftop', cat:'Rooftop Bar', note:'Modern Asian cooking sixteen floors up in Ballantyne Village, the rare rooftop this far south.'},
        {name:'TPC Piper Glen', cat:'Golf & Country Club', note:'An Arnold Palmer design run under the Invited network, Har-Tru tennis alongside the course.'}
      ] }
  ]
};

(function () {
  'use strict';
  var C = window.CHARLOTTE;
  var svg = document.getElementById('citymap');
  var read = document.getElementById('cityread');
  if (!svg || !read) return;

  var NS = 'http://www.w3.org/2000/svg';
  var W = C.view.w, H = C.view.h;
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c];
    });
  };
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    (parent || svg).appendChild(n);
    return n;
  }
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

  /* ---------- chrome ---------- */
  var chrome = el('g', { 'class': 'cm-chrome' });
  var b = 52, o = 22;
  [[o,o,1,1],[W-o,o,-1,1],[o,H-o,1,-1],[W-o,H-o,-1,-1]].forEach(function (p) {
    el('path', { 'class':'cm-bracket',
      d:'M'+(p[0]+p[2]*b)+' '+p[1]+' H'+p[0]+' V'+(p[1]+p[3]*b) }, chrome);
  });
  el('text', { x:40, y:52, 'class':'cm-chrometext' }, chrome).textContent = 'Charlotte · Mecklenburg';
  el('text', { x:W-40, y:52, 'text-anchor':'end', 'class':'cm-chrometext' }, chrome).textContent = '13 districts';
  el('line', { 'class':'cm-sweep', x1:0, y1:0, x2:0, y2:H }, chrome);

  /* ---------- districts ---------- */
  // The venue list itself is rendered by city-explorer.js (it owns the
  // artifact hotspots + the drawer/link-out, and needs to run after this
  // paints). We just leave it an empty slot and announce what changed.
  function paint(d) {
    read.innerHTML =
      '<p class="cityread__eyebrow">'+esc(d.kind)+'</p>' +
      '<h3 class="cityread__name">'+esc(d.name)+'</h3>' +
      '<p class="cityread__note">'+esc(d.note)+'</p>' +
      '<div class="cityread__right">' +
        '<dl class="cityread__meta">' +
          '<div><dt>Best</dt><dd>'+esc(d.best)+'</dd></div>' +
          '<div><dt>Dress</dt><dd>'+esc(d.dress)+'</dd></div>' +
          '<div><dt>Listed</dt><dd>'+(d.venues?d.venues.length:0)+'</dd></div>' +
        '</dl>' +
        '<div class="cityread__venues" id="cityread-venues"></div>' +
      '</div>';

    document.dispatchEvent(new CustomEvent('citymap:district', { detail: d }));
  }
  function select(d) {
    Array.prototype.forEach.call(svg.querySelectorAll('.cm-zone'), function (z) {
      z.classList.toggle('is-on', z.dataset.id === d.id);
    });
    paint(d);
  }

  C.districts.forEach(function (d, i) {
    var g = el('g', { 'class':'cm-zone', tabindex:'0', role:'button',
                      'aria-label': d.name + ' — ' + d.kind });
    g.dataset.id = d.id;
    g.style.setProperty('--i', i);

    el('polygon', { 'class':'cm-fill', points:d.poly }, g);
    el('polygon', { 'class':'cm-edge', points:d.poly }, g);

    el('circle', { 'class':'cm-pulse', cx:d.lx, cy:d.ly, r:7 }, g);
    el('circle', { 'class':'cm-dot',   cx:d.lx, cy:d.ly, r:5 }, g);
    var t = el('text', { 'class':'cm-label', x:d.lx, y:d.ly + 32, 'text-anchor':'middle' }, g);
    t.textContent = d.name;

    g.addEventListener('mouseenter', function () { select(d); });
    g.addEventListener('focus',      function () { select(d); });
    g.addEventListener('click',      function () { select(d); });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(d); }
    });
  });

  paint(C.districts[0]);
})();
