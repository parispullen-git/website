/* ============================================================
   The Penthouse navigator — move through the apartment.
   Left/right walks along a floor, up/down changes storey.
   Arrow keys, the on-screen pad, the elevator, or a swipe. The
   elevator (below) lists every floor in the building; opening an
   unlocked one pops the full room open in a swipeable overlay —
   see the ELEVATOR + ROOM POPUP block near the bottom of this file.
   ============================================================ */
(function () {
  'use strict';
  var root = document.getElementById('pent');
  if (!root) return;

  var ROOMS = [
    // row 0 — Level 28
    { r:0, c:0, id:'closet',  lvl:'Level 28', name:'The Closet',
      note:'Not a room of clothes. A room of decisions already made.', img:'room-closet' },
    { r:0, c:1, id:'bedroom', lvl:'Level 28', name:'The Bedroom',
      note:'Blackout to the glass, and a bed that faces away from the view on purpose.', img:'room-bedroom' },
    { r:0, c:2, id:'bath',    lvl:'Level 28', name:'The Bathroom',
      note:'Stone, brass and steam, with the whole city on the other side of the glass.', img:'room-bath' },
    // row 1 — Level 27
    { r:1, c:0, id:'kitchen', lvl:'Level 27', name:'The Kitchen',
      note:'Black marble, brass and a range that has seen more entertaining than cooking.', img:'room-kitchen' },
    { r:1, c:1, id:'penthouse-living', lvl:'Level 27', name:'The Living Floor',
      note:'Two storeys of it, and somebody was sitting here twenty minutes ago. The glass is still cold.', img:'room-living' },
    { r:1, c:2, id:'study',   lvl:'Level 27', name:'The Study',
      note:'The room where the answer is usually no, and where it gets said politely.', img:'room-study' },
    { r:1, c:3, id:'cinema',  lvl:'Level 27', name:'The Cinema',
      note:'Nine seats, one screen, and a rule about phones that is actually enforced.', img:'room-cinema' }
  ];

  var ARTS = {
    'penthouse-living': [
      { key:'journal', name:'The Journal', x:'28%', y:'91%', body:'Left face-down and open, which he knows ruins a spine. Everything written in it eventually turns up here, several drafts later &#8212; dispatches, not diary entries.', specs:[['Position', 'Face-down'], ['Draft or final', 'Several drafts later'], ['Read it', 'The Journal']] },
      { key:'cocktail', name:"The Nightcap", x:'62.92%', y:'51.89%', body:"One glass, poured before anyone else arrives and topped up for no one after. A short, exact list of what's in it and how &#8212; a sponsor will eventually put their name on this page.", specs:[['Poured', 'Before company'], ['Recipe list', 'Coming']] },
      { key:'piano', name:'The Piano', x:'72%', y:'88%', body:'He played trumpet for seven years, first chair, and cannot play this at all. It is here because a room with a piano in it behaves differently from a room without one &#8212; and because it\'s wired to whatever he\'s actually listening to.', specs:[['Played by him', 'No'], ['Actual instrument', 'Trumpet'], ['Function', 'Atmosphere &amp; the speakers']] },
      { key:'vault', name:'The Vault', x:'91%', y:'70%', body:"Brass wheel, black steel, set into the wall beside the piano and not hidden behind anything. A safe nobody can see is a safe somebody goes looking for. What's inside isn't paper.", specs:[['Concealed', 'No'], ['Contents', 'UR Welcome'], ['Combination', 'One person']] },
      { key:'candle', name:'The Candle', x:'74.58%', y:'36.17%', body:'Unlit, on the back counter, waiting on a launch date nobody will confirm yet. UR Welcome &#8212; coming soon.', specs:[['Status', 'Coming soon'], ['Lit', 'Not yet']] },
      { key:'jacket', name:'The Jacket', x:'39.2%', y:'67.5%', body:"Left over the back of the reading chair rather than hung, which tells you he wasn't planning on staying gone long. Everything else he owns is arranged by occasion &#8212; see the Wardrobe.", specs:[['Hung', 'No'], ['Ordered elsewhere', 'By occasion'], ['See also', 'The Wardrobe']] },
    ],
    'bedroom': [
      { key:'bed', name:'The Bed', x:'46%', y:'62%', body:'Faces away from the window. A view that good will keep a man up, and he decided some years ago that he would rather sleep.', specs:[['Orientation', 'Away from the glass'], ['Wake', '5:40, unaided'], ['Phone', 'Charges across the room']] },
      { key:'window', name:'The Glass', x:'20%', y:'46%', body:'Floor to ceiling, blackout-lined. The city is thirty floors down and completely silent from here, which takes most people a night to get used to.', specs:[['Glazing', 'Acoustic'], ['Blinds', 'Blackout'], ['Sound at night', 'None']] },
      { key:'chair', name:'The Lounge Chair', x:'10%', y:'72%', body:'Angled at the window rather than the television, because there is no television. Most of the thinking that matters happens in it.', specs:[['Faces', 'The city'], ['Television', 'None'], ['Hours logged', 'Considerable']] },
      { key:'door', name:'The Closet Door', x:'93%', y:'54%', body:'Left open more often than not. What is behind it is arranged by occasion, not by colour — see the Closet.', specs:[['Kept', 'Open'], ['Ordered by', 'Occasion']] },
    ],
    'bath': [
      { key:'tub', name:'The Tub', x:'47%', y:'64%', body:'Freestanding, deep, set square to the window. Filled perhaps twice a month and always at the end of a long one.', specs:[['Position', 'Facing the glass'], ['Used', 'Rarely, deliberately']] },
      { key:'vanity', name:'The Vanity', x:'16%', y:'62%', body:'Double basins, unlacquered brass gone dark at the handles. The mirror is lit from the sides so a man sees his face rather than his shadow.', specs:[['Brass', 'Unlacquered'], ['Lighting', 'Side-lit, never overhead']] },
      { key:'shower', name:'The Shower', x:'74%', y:'50%', body:'Marble on three sides, glass on the fourth. The bench is not decorative; it is where the day gets thought about before it starts.', specs:[['Enclosure', 'Stone and glass'], ['Bench', 'Used']] },
      { key:'robe', name:'The Robe', x:'31%', y:'44%', body:'Hung where it is reachable from the tub. Heavy waffle cotton, no monogram, replaced every year without discussion.', specs:[['Cloth', 'Waffle cotton'], ['Monogram', 'None'], ['Replaced', 'Annually']] },
    ],
    'closet': [
      { key:'suits', name:'The Suits &amp; Tuxedos', x:'50%', y:'42%', body:'Arranged by occasion rather than colour, so getting dressed is a question of where you are going rather than what you feel like. Two dinner jackets at the centre, black-tie and white-tie, either one pressed and ready before he has to ask.', specs:[['Ordered by', 'Occasion'], ['Navy suits', 'Twelve'], ['Tuxedos', 'Two, black-tie and white-tie']] },
      { key:'shoes', name:'The Shoes', x:'9%', y:'62%', body:'Cedar-treed, rotated, never worn two days running. The oldest pair on the shelf is fourteen years old and still the best thing in the room.', specs:[['Rotation', 'Enforced'], ['Oldest pair', '14 years'], ['Trees', 'Cedar']] },
      { key:'ties', name:'The Ties', x:'91%', y:'56%', body:'Hung rather than rolled. He owns more than he wears and knows it, and has stopped pretending that will change.', specs:[['Hung', 'Never rolled'], ['Worn regularly', 'Six'], ['Owned', 'Considerably more']] },
    ],
    'kitchen': [
      { key:'hellofresh', name:'The Delivery', x:'53%', y:'60%', body:'It arrived before he did. No note, no ceremony &#8212; just the box, already unpacked onto the marble like it had always been there. He does not cook often. He cooks well when he does, and never asks how the box knew that.', specs:[] },
    ],
    'study': [
      { key:'monogram', name:'The Monogram', x:'57%', y:'30%', body:'Brass, wall-mounted, deliberately the only branded object in the entire apartment. He is aware of the contradiction and finds it funny.', specs:[['Material', 'Brass'], ['Other branding here', 'None'], ['Self-aware', 'Entirely']] },
      { key:'desk', name:'The Desk', x:'52%', y:'62%', body:'Walnut, faces the door rather than the window. A man who sits with his back to a room is not paying attention to it.', specs:[['Faces', 'The door'], ['Wood', 'Walnut'], ['Rule', 'Never back to the room']] },
      { key:'map', name:'The Map', x:'91%', y:'44%', body:'Brass inlay on black. Cities he has worked, not cities he has visited — a distinction he will make if you ask.', specs:[['Marks', 'Cities worked'], ['Not', 'Cities visited']] },
      { key:'bottles', name:'The Shelf', x:'83%', y:'50%', body:'The whiskey is at eye level and the books are above it, which several visitors have pointed out is the wrong way round.', specs:[['Whiskey', 'Eye level'], ['Books', 'Higher'], ['Observed by guests', 'Frequently']] },
      { key:'chairs', name:'The Two Chairs', x:'44%', y:'76%', body:'Placed on the guest side, close enough together that two people arriving must sit as a pair. Negotiations go differently when nobody can flank.', specs:[['Count', 'Two'], ['Spacing', 'Deliberate'], ['Effect', 'No flanking']] },
      { key:'standingorder', name:'The Standing Order', x:'35%', y:'55%', body:'A card, handwritten, tucked under the desk blotter where he will actually see it: Tuesday. HelloFresh. Don&#8217;t cancel it again. The assistant stopped asking permission to reorder it two years ago.', specs:[['Day', 'Tuesday'], ['Cancelled', 'Never twice'], ['Standing since', 'Two years']] },
    ],
    'cinema': [
      { key:'posters', name:'The Posters', x:'12%', y:'42%', body:'All one register: men in tailoring, making decisions, usually badly. He will tell you it is research. It is partly research.', specs:[['Register', 'One'], ['Claimed purpose', 'Research'], ['Actual', 'Partly']] },
    ],
  };

  // Rooms with a playable screen — id/label must match the matching entry in
  // CHANNEL_SETS[channelSet][0] in assets/js/tv-remote.js.
  var TV_SCREENS = {
    'penthouse-living': { x:'57.5%', y:'24.3%', w:'19%', h:'15%',
      box:'0.4854,0.1742,0.6646,0.3113', channelSet:'living',
      id:'4xVVFJuycww', label:'The Gentlemen' },
    'cinema': { x:'50%', y:'37.6%', w:'27.9%', h:'29.3%',
      box:'0.3604,0.2296,0.6396,0.5222', channelSet:'cinema',
      id:'w7fuOkF74Zw', label:'Power — First Look' }
  };

  var ROWS = 2;
  var COLS = [3, 4];                 // rooms per floor
  var pos = { r: 1, c: 1 };          // start on the living floor

  var track   = root.querySelector('.pent__track');
  var plate   = root.querySelector('.pent__plate');
  var pad     = root.querySelector('.pent__pad');

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c];
    });
  };
  var at = function (r, c) {
    return ROOMS.filter(function (x) { return x.r === r && x.c === c; })[0];
  };

  /* Shared with buildFloorSceneHTML() below (the full-bleed room popup) so
     the TV overlay markup exists in exactly one place. */
  function buildTVHTML(ts) {
    if (!ts) return '';
    return '<div class="floor-scene__screen" style="--x:' + ts.x + ';--y:' + ts.y + ';--w:' + ts.w + ';--h:' + ts.h + '" ' +
        'data-tv data-channel-set="' + ts.channelSet + '" data-box="' + ts.box + '">' +
        '<div class="floor-scene__screen-frame">' +
          '<iframe src="https://www.youtube.com/embed/' + ts.id + '?autoplay=1&mute=1&loop=1&playlist=' + ts.id + '&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&enablejsapi=1" ' +
          'title="" allow="autoplay; encrypted-media" loading="lazy"></iframe>' +
        '</div>' +
        '<div class="tv-lowerthird" data-tv-lowerthird>' +
          '<p class="tv-lowerthird__eyebrow">Paris Pullen &#183; Now Screening</p>' +
          '<p class="tv-lowerthird__title" data-tv-lowerthird-title>' + esc(ts.label) + '</p>' +
        '</div>' +
        '<div class="tv-remote" data-tv-remote>' +
          '<p class="tv-remote__channel" data-tv-channel-label>' + esc(ts.label) + '</p>' +
          '<div class="tv-remote__row">' +
            '<button type="button" data-tv-action="ch-prev">&#9664; Ch</button>' +
            '<button type="button" data-tv-action="ch-next">Ch &#9654;</button>' +
          '</div>' +
          '<div class="tv-remote__row">' +
            '<button type="button" data-tv-action="vol-down">Vol &#8722;</button>' +
            '<button type="button" data-tv-action="mute">Mute</button>' +
            '<button type="button" data-tv-action="vol-up">Vol &#43;</button>' +
          '</div>' +
          '<button type="button" class="tv-remote__expand" data-tv-action="expand">Watch Full Screen</button>' +
        '</div>' +
      '</div>';
  }

  /* ---------- build the rooms ---------- */
  track.innerHTML = ROOMS.map(function (m) {
    var arts = ARTS[m.id] || [];
    var spots = arts.map(function (a) {
      // a.name/body/specs come pre-escaped (entities already in the source
      // data) -- do not run esc() on them again, unlike the plain m.name below
      var notes = a.key === 'piano' ? '<span class="artifact__notes" aria-hidden="true"><i>&#9834;</i><i>&#9835;</i><i>&#9834;</i></span>' : '';
      return '<button class="artifact" style="--x:' + a.x + ';--y:' + a.y + '" ' +
               'data-room="' + m.id + '" data-key="' + a.key + '">' +
               '<span class="artifact__dot" aria-hidden="true"></span>' +
               '<span class="artifact__label">' + a.name + '</span>' +
               notes +
             '</button>';
    }).join('');
    return '<article class="pent__room" style="--r:' + m.r + ';--c:' + m.c + '" ' +
             'aria-label="' + esc(m.name) + '">' +
             '<img src="assets/img/' + m.img + '.jpg" ' +
             'srcset="assets/img/' + m.img + '@sm.jpg 1200w, assets/img/' + m.img + '.jpg 2400w" ' +
             'sizes="100vw" alt="' + esc(m.name) + '" loading="lazy" width="2400" height="1350">' +
             buildTVHTML(TV_SCREENS[m.id]) +
             '<div class="artifacts">' + spots + '</div>' +
           '</article>';
  }).join('');

  /* ---------- render ---------- */
  function render() {
    closeArtifact();
    var m = at(pos.r, pos.c);
    track.style.setProperty('--row', pos.r);
    track.style.setProperty('--col', pos.c);

    plate.innerHTML =
      '<p class="pent__lvl">' + esc(m.lvl) + '</p>' +
      '<h3 class="pent__name">' + esc(m.name) + '</h3>' +
      '<p class="pent__note">' + esc(m.note) + '</p>' +
      '<button type="button" class="cta cta--ghost pent__open" data-open-room="' + m.id + '"><span>Open this room</span></button>';

    root.querySelector('.pent__btn--u').disabled = !canGo(-1, 0);
    root.querySelector('.pent__btn--d').disabled = !canGo(1, 0);
    root.querySelector('.pent__btn--l').disabled = !canGo(0, -1);
    root.querySelector('.pent__btn--r').disabled = !canGo(0, 1);
  }

  function target(dr, dc) {
    var r = Math.min(ROWS - 1, Math.max(0, pos.r + dr));
    var c = pos.c + dc;
    // moving between floors, clamp to a room that exists on the new one
    if (dr !== 0) c = Math.min(COLS[r] - 1, pos.c);
    c = Math.min(COLS[r] - 1, Math.max(0, c));
    return { r: r, c: c };
  }
  function canGo(dr, dc) {
    var t = target(dr, dc);
    return !(t.r === pos.r && t.c === pos.c);
  }
  function go(dr, dc) {
    if (!canGo(dr, dc)) return;
    pos = target(dr, dc);
    render();
  }

  /* ---------- artifacts + drawer ---------- */
  var pentDrawer = document.getElementById('pent-drawer');
  var drawerSlot = pentDrawer ? pentDrawer.querySelector('.drawer__slot') : null;
  var drawerClose = pentDrawer ? pentDrawer.querySelector('.drawer__close') : null;

  function closeArtifact() {
    if (!pentDrawer) return;
    pentDrawer.classList.remove('is-open');
    pentDrawer.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(root.querySelectorAll('.artifact.is-active'), function (s) {
      s.classList.remove('is-active');
      s.setAttribute('aria-expanded', 'false');
    });
  }

  /* Special-case artifact content, shared between the small widget's own
     drawer (openArtifact below) and the full-bleed popup's pre-rendered
     drawer panels (buildFloorSceneHTML further down). Single source of
     truth so the two surfaces can't drift out of sync. */
  var SUITS_CTA = '<a class="cta pent__open" href="wardrobe.html" style="margin-top:var(--s2)"><span>Enter the Wardrobe</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>';
  var HELLOFRESH_UNLOCK = '<div class="hf-unlock">' +
      '<p class="hf-unlock__eyebrow">Unlocked &#183; 5 Recipes Every Man Should Own</p>' +
      '<ul class="hf-recipe-list">' +
        '<li><span class="hf-recipe-list__name">Pan-Seared Filet, Peppercorn Sauce</span><span class="hf-recipe-list__note">The one that never needs an occasion.</span></li>' +
        '<li><span class="hf-recipe-list__name">Miso-Glazed Salmon, Charred Broccolini</span><span class="hf-recipe-list__note">Fifteen minutes, looks like an hour.</span></li>' +
        '<li><span class="hf-recipe-list__name">French Onion Steak Frites</span><span class="hf-recipe-list__note">For the night you\'re not ordering in.</span></li>' +
        '<li><span class="hf-recipe-list__name">Rigatoni alla Vodka, Torn Basil</span><span class="hf-recipe-list__note">Cooks in one pan. Photographs in every light.</span></li>' +
        '<li><span class="hf-recipe-list__name">Smoked Paprika Chicken, Root Vegetables</span><span class="hf-recipe-list__note">The one you actually make twice a week.</span></li>' +
      '</ul>' +
      '<a class="cta cta--ghost hf-unlock__cta" href="pantry.html"><span>Get the Box &#8212; HelloFresh &#215; Paris Pullen</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>' +
    '</div>';
  var GUIDE_PORTAL_CTA = '<button type="button" class="cta pent__open" data-guide-portal style="margin-top:var(--s2)"><span>Explore the City Guide</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></button>';
  var JOURNAL_CTA = '<a class="cta pent__open" href="journal.html" style="margin-top:var(--s2)"><span>Read the Journal</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>';
  var VAULT_CTA = '<a class="cta pent__open" href="urwelcome.html" data-vault-enter style="margin-top:var(--s2)"><span>Enter the Vault</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>';
  var COCKTAIL_UNLOCK = '<div class="unlock">' +
      '<p class="unlock__eyebrow">Unlocked &#183; The Gentleman\'s Nightcap</p>' +
      '<ul class="unlock-list">' +
        '<li><span class="unlock-list__name">The Old Fashioned</span><span class="unlock-list__note">Rye, sugar, bitters, one large cube.</span></li>' +
        '<li><span class="unlock-list__name">The Sazerac</span><span class="unlock-list__note">Rinsed glass, absinthe, nothing wasted.</span></li>' +
        '<li><span class="unlock-list__name">The Penicillin</span><span class="unlock-list__note">Scotch, honey-ginger, a float of peat.</span></li>' +
      '</ul>' +
      '<p class="unlock__eyebrow" style="margin-top:var(--s4)">Sponsor to be announced</p>' +
    '</div>';
  var PIANO_PLAYLISTS = [
    { type:'playlist', id:'6XS1tFYgCi82SrDtHFLUov', label:'UR WELCOME Vol.1' },
    { type:'album', id:'5mz0mJxb80gqJIcRf9LGHJ', label:'Nothing Was The Same' },
    { type:'playlist', id:'7b46c5syjtG86a77R7SnMs', label:'All Drake Songs On Spotify' },
    { type:'album', id:'40GMAhriYJRO1rsY4YdrZb', label:'Views' },
    { type:'album', id:'6qhOiAW8Zes8U4UyhMYCpx', label:'(a)Live In Vegas' },
    { type:'album', id:'0OAv7DCME2AV4q1KPO95HY', label:'ICEMAN' },
    { type:'album', id:'4dHcuizgdi9fpKX8MKQm43', label:'LUCKY YOU' },
    { type:'album', id:'60cNc5CdvVCTEF5A6FRhFN', label:'with all due respect' },
    { type:'album', id:'36KvnNSPeyCHUrAQVpgwwN', label:'For All The Right Reasons Vol. 1' }
  ];
  var PIANO_FIRST = PIANO_PLAYLISTS[0];
  var PIANO_PLAYER = '<div class="piano-player" data-piano-player data-playlists="' + esc(JSON.stringify(PIANO_PLAYLISTS)) + '">' +
      '<div class="piano-player__head">' +
        '<p class="piano-player__eyebrow">Now Playing &#183; <span data-piano-label>' + esc(PIANO_FIRST.label) + '</span></p>' +
        '<div class="piano-player__nav">' +
          '<button type="button" data-piano-prev aria-label="Previous">&#8249;</button>' +
          '<button type="button" data-piano-next aria-label="Next">&#8250;</button>' +
        '</div>' +
      '</div>' +
      '<div class="piano-player__frame"><iframe data-piano-frame src="https://open.spotify.com/embed/' + PIANO_FIRST.type + '/' + PIANO_FIRST.id + '?utm_source=generator&amp;theme=0" width="100%" height="352" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>' +
    '</div>';
  var CANDLE_COMING_SOON = '<div class="coming-soon"><span class="coming-soon__badge">UR Welcome &#183; Coming Soon</span></div>';

  function extrasFor(roomId, key) {
    var wardrobeCta = (roomId === 'closet' && key === 'suits') ? SUITS_CTA : '';
    var tag = ' &#183; Artifact';
    if (roomId === 'kitchen' && key === 'hellofresh') {
      wardrobeCta = HELLOFRESH_UNLOCK;
      tag = ' &#183; Artifact &#183; HelloFresh &#215; Paris Pullen';
    }
    if (key === 'window') wardrobeCta = GUIDE_PORTAL_CTA;
    if (roomId === 'penthouse-living' && key === 'journal') wardrobeCta = JOURNAL_CTA;
    if (roomId === 'penthouse-living' && key === 'vault') wardrobeCta = VAULT_CTA;
    if (roomId === 'penthouse-living' && key === 'cocktail') wardrobeCta = COCKTAIL_UNLOCK;
    if (roomId === 'penthouse-living' && key === 'piano') wardrobeCta = PIANO_PLAYER;
    if (roomId === 'penthouse-living' && key === 'candle') wardrobeCta = CANDLE_COMING_SOON;
    if (roomId === 'penthouse-living' && key === 'jacket') wardrobeCta = SUITS_CTA;
    return { wardrobeCta: wardrobeCta, tag: tag };
  }

  function openArtifact(roomId, key, spot) {
    var art = (ARTS[roomId] || []).filter(function (a) { return a.key === key; })[0];
    if (!art || !pentDrawer) return;
    var room = ROOMS.filter(function (r) { return r.id === roomId; })[0];

    var spec = art.specs.map(function (kv) {
      return '<div><dt>' + kv[0] + '</dt><dd>' + kv[1] + '</dd></div>';
    }).join('');

    var extras = extrasFor(roomId, key);
    var tag = esc(room ? room.lvl : '') + extras.tag;

    drawerSlot.innerHTML =
      '<div class="drawer__inner">' +
        '<div class="drawer__head">' +
          '<p class="drawer__tag">' + tag + '</p>' +
          '<h3 class="drawer__name">' + art.name + '</h3>' +
        '</div>' +
        '<div class="drawer__body">' +
          '<p class="body">' + art.body + '</p>' +
          '<dl class="drawer__spec">' + spec + '</dl>' +
          extras.wardrobeCta +
        '</div>' +
      '</div>';

    Array.prototype.forEach.call(root.querySelectorAll('.artifact'), function (s) {
      s.classList.toggle('is-active', s === spot);
      s.setAttribute('aria-expanded', String(s === spot));
    });
    pentDrawer.classList.add('is-open');
    pentDrawer.setAttribute('aria-hidden', 'false');
  }

  track.addEventListener('click', function (e) {
    var b = e.target.closest('.artifact');
    if (!b) return;
    e.preventDefault();
    if (b.classList.contains('is-active')) { closeArtifact(); return; }
    openArtifact(b.dataset.room, b.dataset.key, b);
  });

  if (drawerClose) drawerClose.addEventListener('click', closeArtifact);

  root.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pentDrawer && pentDrawer.classList.contains('is-open')) {
      closeArtifact();
    }
  });

  /* ---------- controls ---------- */
  pad.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]');
    if (!b) return;
    var d = b.dataset.go;
    go(d === 'u' ? -1 : d === 'd' ? 1 : 0, d === 'l' ? -1 : d === 'r' ? 1 : 0);
  });

  root.querySelector('.pent__stage').setAttribute('tabindex', '0');
  root.addEventListener('keydown', function (e) {
    var map = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] };
    if (!map[e.key]) return;
    e.preventDefault();
    go(map[e.key][0], map[e.key][1]);
  });

  // swipe / drag
  var stage = root.querySelector('.pent__stage'), sx = 0, sy = 0, down = false;
  stage.addEventListener('pointerdown', function (e) { down = true; sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointerup', function (e) {
    if (!down) return;
    down = false;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 45) return;
    if (Math.abs(dx) > Math.abs(dy)) go(0, dx < 0 ? 1 : -1);
    else go(dy < 0 ? 1 : -1, 0);
  });
  stage.addEventListener('pointercancel', function () { down = false; });

  /* ============================================================
     THE ELEVATOR + THE ROOM POPUP
     The building has 21 floors; only 7 are open. The elevator
     lists all of them in building order (rooftop to basement) so
     the rest read as "coming soon" rather than missing. Opening an
     unlocked floor pops the SAME room content the small widget
     above already knows about (ARTS/TV_SCREENS/ROOMS) into a
     full-bleed, swipeable popup layered over the homepage — reusing
     the .floor-scene/.artifact/.drawer markup world.js and
     tv-remote.js already know how to wire up, and the room-pager.js
     module already built for paging between them.
     ============================================================ */
  var LOCKED = [
    { id:'skyline',     lvl:'29',  name:'The Skyline Club',     state:'members' },
    { id:'corridor',    lvl:'26',  name:'The Corridor',         state:'restricted' },
    { id:'order',       lvl:'25',  name:'The Order',            state:'restricted' },
    { id:'operations',  lvl:'24',  name:'The Operations Room',  state:'restricted' },
    { id:'lab',         lvl:'18',  name:'The Lab',              state:'restricted' },
    { id:'haberdashery',lvl:'12',  name:'The Haberdashery',     state:'members' },
    { id:'armoury',     lvl:'12M', name:'The Armoury',          state:'restricted' },
    { id:'fitting',     lvl:'11',  name:'The Fitting Floor',    state:'members' },
    { id:'restaurant',  lvl:'03',  name:'The Restaurant',       state:'public' },
    { id:'bar',         lvl:'02',  name:'The Bar',              state:'public' },
    { id:'coffee',      lvl:'01',  name:'The Coffee House',     state:'public' },
    { id:'lobby',       lvl:'G',   name:'The Lobby',            state:'public' },
    { id:'motor',       lvl:'B1',  name:'The Motor Club',       state:'members' },
    { id:'inventory',   lvl:'B2',  name:'The Inventory',        state:'restricted' }
  ];
  // Building order, rooftop to basement — grouped cleanly by floor level
  // (all of 28 together, then all of 27 together) so paging through rooms
  // never zig-zags between levels. Matches build_house.py's FLOORS content,
  // just sequenced for clean floor-to-floor navigation here.
  var ELEVATOR_ORDER = [
    'skyline','bedroom','bath','closet','penthouse-living','kitchen','study','cinema',
    'corridor','order','operations','lab','haberdashery','armoury','fitting',
    'restaurant','bar','coffee','lobby','motor','inventory'
  ];
  // One entry per physical floor level (not per room) — powers the elevator
  // control buttons inside the room popup. firstRoom is where a floor-button
  // jump lands; locked floors have no firstRoom and render disabled.
  var FLOOR_LEVELS = [
    { lvl:'29',  name:'The Skyline Club',    firstRoom:null },
    { lvl:'28',  name:'Upper Floor',         firstRoom:'bedroom' },
    { lvl:'27',  name:'Main Floor',          firstRoom:'penthouse-living' },
    { lvl:'26',  name:'The Corridor',        firstRoom:null },
    { lvl:'25',  name:'The Order',           firstRoom:null },
    { lvl:'24',  name:'The Operations Room', firstRoom:null },
    { lvl:'18',  name:'The Lab',             firstRoom:null },
    { lvl:'12M', name:'The Armoury',         firstRoom:null },
    { lvl:'12',  name:'The Haberdashery',    firstRoom:null },
    { lvl:'11',  name:'The Fitting Floor',   firstRoom:null },
    { lvl:'03',  name:'The Restaurant',      firstRoom:null },
    { lvl:'02',  name:'The Bar',             firstRoom:null },
    { lvl:'01',  name:'The Coffee House',    firstRoom:null },
    { lvl:'G',   name:'The Lobby',           firstRoom:null },
    { lvl:'B1',  name:'The Motor Club',      firstRoom:null },
    { lvl:'B2',  name:'The Inventory',       firstRoom:null }
  ];

  function roomById(id) { return ROOMS.filter(function (r) { return r.id === id; })[0]; }
  function lockedById(id) { return LOCKED.filter(function (r) { return r.id === id; })[0]; }

  function buildElevator() {
    var el = document.getElementById('pent-elevator');
    if (!el) return;
    el.innerHTML = ELEVATOR_ORDER.map(function (id) {
      var r = roomById(id);
      if (r) {
        return '<button type="button" class="directory__row directory__row--open" data-open-room="' + id + '">' +
                 '<span class="directory__lvl">' + esc(r.lvl.replace(/^Level\s+/i, '')) + '</span>' +
                 '<span class="directory__name">' + esc(r.name) + '</span>' +
                 '<span class="directory__go" aria-hidden="true">&#8594;</span>' +
               '</button>';
      }
      var l = lockedById(id);
      if (!l) return '';
      return '<div class="directory__row" aria-disabled="true" tabindex="-1">' +
               '<span class="directory__lvl">' + esc(l.lvl) + '</span>' +
               '<span class="directory__name">' + esc(l.name) + '</span>' +
               '<span class="directory__state" data-state="locked">coming soon</span>' +
             '</div>';
    }).join('');
  }

  // Real elevator-panel buttons, one per physical floor, rendered inside
  // the room popup so a visitor can jump straight to another floor without
  // backing out to the homepage's full directory. Unlocked floors carry
  // data-open-room (same delegated handler the directory rows use); locked
  // floors render disabled with a title tooltip instead of a click target.
  function buildPopupElevator() {
    var el = document.getElementById('popup-elevator');
    if (!el) return;
    el.innerHTML = FLOOR_LEVELS.map(function (f) {
      if (f.firstRoom) {
        return '<button type="button" class="popup-elevator__btn" data-open-room="' + f.firstRoom + '" title="' + esc(f.name) + '">' + esc(f.lvl) + '</button>';
      }
      return '<button type="button" class="popup-elevator__btn" disabled aria-disabled="true" title="' + esc(f.name) + ' &#8212; coming soon">' + esc(f.lvl) + '</button>';
    }).join('');
  }

  /* Builds one .floor-scene section — the same shape build_house.py's
     floor_html() writes into house.html — for a ROOMS entry, so the
     popup gets the full per-room system (artifacts, per-artifact drawer
     panels, TV screen) rather than a stripped-down preview. */
  function buildFloorSceneHTML(room) {
    var arts = ARTS[room.id] || [];
    var lvlBare = room.lvl.replace(/^Level\s+/i, '');

    var artsHTML = arts.map(function (a) {
      var notes = a.key === 'piano' ? '<span class="artifact__notes" aria-hidden="true"><i>&#9834;</i><i>&#9835;</i><i>&#9834;</i></span>' : '';
      return '<button class="artifact" style="--x:' + a.x + ';--y:' + a.y + '" data-artifact="' + a.key + '">' +
               '<span class="artifact__dot" aria-hidden="true"></span>' +
               '<span class="artifact__label">' + a.name + '</span>' +
               notes +
             '</button>';
    }).join('');

    var panelsHTML = arts.map(function (a) {
      var spec = a.specs.map(function (kv) {
        return '<div><dt>' + kv[0] + '</dt><dd>' + kv[1] + '</dd></div>';
      }).join('');
      var extras = extrasFor(room.id, a.key);
      var tag = esc(room.lvl) + extras.tag;
      return '<div class="drawer__panel" data-artifact="' + a.key + '" hidden>' +
               '<div class="drawer__inner">' +
                 '<div class="drawer__head">' +
                   '<p class="drawer__tag">' + tag + '</p>' +
                   '<h3 class="drawer__name">' + a.name + '</h3>' +
                 '</div>' +
                 '<div class="drawer__body">' +
                   '<p class="body">' + a.body + '</p>' +
                   '<dl class="drawer__spec">' + spec + '</dl>' +
                   extras.wardrobeCta +
                 '</div>' +
               '</div>' +
             '</div>';
    }).join('');

    return '<section class="floor-scene" id="' + room.id + '" tabindex="-1" aria-label="' + esc(room.lvl) + ' — ' + esc(room.name) + '">' +
      '<div class="floor-scene__view">' +
        '<img src="assets/img/' + room.img + '.jpg" ' +
        'srcset="assets/img/' + room.img + '@sm.jpg 1200w, assets/img/' + room.img + '.jpg 2400w" ' +
        'sizes="100vw" alt="' + esc(room.name) + '" loading="lazy" width="2400" height="1350">' +
      '</div>' +
      buildTVHTML(TV_SCREENS[room.id]) +
      '<div class="floor-scene__scrim"></div>' +
      '<div class="wrap"><div class="floor-plate reveal">' +
        '<p class="floor-plate__level"><b>' + esc(lvlBare) + '</b> <span>' + esc(room.name) + '</span></p>' +
        '<h2 class="floor-plate__name">' + esc(room.name) + '</h2>' +
        '<p class="floor-plate__note">' + esc(room.note) + '</p>' +
        '<p class="floor-plate__count"><i></i>' + arts.length + ' artifact' + (arts.length !== 1 ? 's' : '') + ' on this floor</p>' +
      '</div></div>' +
      '<div class="artifacts">' + artsHTML + '</div>' +
      '<div class="drawer" id="popup-drawer-' + room.id + '" aria-hidden="true">' +
        '<button class="drawer__close">Close &#215;</button>' + panelsHTML +
      '</div>' +
    '</section>';
  }

  var popupEl = document.getElementById('room-popup');
  var popupViewport = document.getElementById('popup-pager-viewport');
  if (popupEl && popupViewport) {
    popupViewport.innerHTML = ELEVATOR_ORDER
      .map(roomById)
      .filter(Boolean)
      .map(buildFloorSceneHTML)
      .join('');
  }

  function popupPagerInstance() {
    var list = window.PPRoomPagers || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].root && list[i].root.id === 'popup-pager') return list[i];
    }
    return null;
  }

  function openPopup(id) {
    var inst = popupPagerInstance();
    if (!popupEl || !inst || !inst.hasRoom(id)) return;
    popupEl.classList.add('is-open');
    popupEl.setAttribute('aria-hidden', 'false');
    inst.goToId(id, 'start', false);
    var closeBtn = popupEl.querySelector('[data-room-popup-close]');
    if (closeBtn) closeBtn.focus();
  }

  function closePopup() {
    if (!popupEl) return;
    popupEl.classList.remove('is-open');
    popupEl.setAttribute('aria-hidden', 'true');
  }

  // One delegated handler covers both the small widget's "Open this room"
  // CTA and every unlocked row in the elevator — both just carry data-open-room.
  document.addEventListener('click', function (e) {
    var openBtn = e.target.closest('[data-open-room]');
    if (openBtn) { e.preventDefault(); openPopup(openBtn.dataset.openRoom); return; }
    if (e.target.closest('[data-room-popup-close]')) closePopup();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !popupEl || !popupEl.classList.contains('is-open')) return;
    if (document.querySelector('.tv-modal.is-open')) return;   // let tv-remote.js's own handler close it
    if (document.querySelector('.guide-portal.is-open')) return; // let guide-portal.js's own handler close it
    var openDrawer = popupEl.querySelector('.drawer.is-open');
    if (openDrawer) {
      openDrawer.classList.remove('is-open');
      openDrawer.setAttribute('aria-hidden', 'true');
      var activeSpot = popupEl.querySelector('.artifact.is-active');
      if (activeSpot) { activeSpot.classList.remove('is-active'); activeSpot.setAttribute('aria-expanded', 'false'); }
      return;
    }
    closePopup();
  });

  buildElevator();
  buildPopupElevator();

  render();
})();
