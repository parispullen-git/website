/* ============================================================
   The Penthouse — the homepage's own full-screen room-pager, the
   same .floor-scene/.room-pager machinery house.html uses (built here
   via buildFloorSceneHTML, mounted straight into #penthouse,
   opening on the Living Room). Artifacts, drawers, and TV screens
   are wired up generically by world.js/tv-remote.js once this content
   exists in the DOM -- nothing page-specific needed for those.

   Only Levels 26-28 (nine rooms) have real content here -- the corner
   nav-panel (below) still lists every floor in the building, linking out
   to house.html for the rest rather than duplicating all 23 rooms'
   content here too.
   ============================================================ */
(function () {
  'use strict';

  // Mirrors build_house.py's IMG_VER exactly -- bump both together whenever
  // a room photo is re-shot in place (same filename, new bytes), since
  // browsers and Cloudflare's edge otherwise keep serving the old file for
  // hours off the unchanged URL.
  var IMG_VER = '20260913d';

  // Order here (mirrors build_house.py's _PENTHOUSE_ORDER exactly) is what
  // the room-pager's slide direction is actually built from -- it pages by
  // array index (translateX(-i*100%)), so a "left" move needs to land on a
  // lower index and a "right" move a higher one, or the slide visually
  // runs backwards from what the arrow/swipe implied. Each row is an
  // independent left-right chain (ROOM_ADJACENCY, below, has no left/
  // right link between rows), so only the order *within* each row matters:
  //   Bathroom -> Bedroom -> Closet                 (Level 28)
  //   Kitchen -> Living Room -> Study                (Level 27)
  //   Music Lounge -> Gym -> Cinema                  (Level 26 -- Lounge Bar retired, see below)
  var ROOMS = [
    { id:'bath',    lvl:'Level 28', name:'The Bathroom',
      note:'Stone, brass and steam, with the whole city on the other side of the glass.', img:'room-bath' },
    { id:'bedroom', lvl:'Level 28', name:'The Bedroom',
      note:'Blackout to the glass, and a bed that faces away from the view on purpose.', img:'room-bedroom' },
    { id:'closet',  lvl:'Level 28', name:'The Closet',
      note:'Not a room of clothes. A room of decisions already made.', img:'room-closet' },
    { id:'kitchen', lvl:'Level 27', name:'The Kitchen',
      note:'Black marble, brass and a range that has seen more entertaining than cooking.', img:'room-kitchen' },
    { id:'penthouse-living', lvl:'Level 27', name:'The Living Room',
      note:'Two storeys of it, and somebody was sitting here twenty minutes ago. The glass is still cold.', img:'room-living' },
    { id:'study',   lvl:'Level 27', name:'The Study',
      note:'The room where the answer is usually no, and where it gets said politely.', img:'room-study' },
    { id:'music-lounge', lvl:'Level 26', name:'The Music Lounge',
      note:'Vinyl floor to ceiling on one wall, a turntable that never gets left idle, and a couch built for people who came to listen, not to talk over it.', img:'room-musiclounge' },
    { id:'gym', lvl:'Level 26', name:'The Gym',
      note:"Steel and rope, one flight from the record wall, with a skyline that doesn't care if you skip a set.", img:'room-gym' },
    { id:'cinema',  lvl:'Level 26', name:'The Cinema',
      note:'Nine seats, one screen, and a rule about phones that is actually enforced.', img:'room-cinema' }
  ];

  // Room-to-room navigation is a real 2D layout -- each room's up/down
  // neighbor sits in the same column one floor away (mirrors
  // build_house.py's ROOM_ADJACENCY exactly):
  //   Level 28:  Bathroom <-> Bedroom    <-> Closet
  //                  |            |            |
  //   Level 27:  Kitchen <-> Living Room <-> Study
  //                               |            |
  //   Level 26:              Music Lounge <-> Gym <-> Cinema
  // The Lounge Bar (former Level 26, column 1) has been retired -- Kitchen's
  // column now dead-ends at Level 27 (no "down"), and Music Lounge has no
  // "left" neighbor of its own. The Gym is a pure left-right insertion
  // between Music Lounge and Cinema, with no up/down neighbor of its own.
  var ROOM_ADJACENCY = {
    'bath':             { right:'bedroom', down:'kitchen' },
    'bedroom':          { left:'bath', right:'closet', down:'penthouse-living' },
    'closet':           { left:'bedroom', down:'study' },
    'kitchen':          { right:'penthouse-living', up:'bath' },
    'penthouse-living': { left:'kitchen', right:'study', up:'bedroom', down:'music-lounge' },
    'study':            { left:'penthouse-living', up:'closet', down:'cinema' },
    'music-lounge':     { right:'gym', up:'penthouse-living' },
    'gym':              { left:'music-lounge', right:'cinema' },
    'cinema':           { left:'gym', up:'study' }
  };

  var ARTS = {
    'penthouse-living': [
      { key:'journal', name:'The Journal', x:'54%', y:'48%', body:'Left face-down and open, which he knows ruins a spine. Everything written in it eventually turns up here, several drafts later &#8212; dispatches, not diary entries.', specs:[['Position', 'Face-down'], ['Draft or final', 'Several drafts later'], ['Read it', 'The Journal']] },
      { key:'vault', name:'The Vault', x:'81%', y:'48%', body:"Brass wheel, black steel, set into the wall and not hidden behind anything. A safe nobody can see is a safe somebody goes looking for. What's inside isn't paper.", specs:[['Concealed', 'No'], ['Contents', 'UR Welcome'], ['Combination', 'One person']] },
      { key:'candle', name:'The Candle', x:'62%', y:'46%', body:'Unlit, on the back counter, waiting on a launch date nobody will confirm yet. UR Welcome &#8212; coming soon.', specs:[['Status', 'Coming soon'], ['Lit', 'Not yet']] },
      { key:'jacket', name:'The Jacket', x:'46%', y:'41%', body:"Left over the back of the reading chair rather than hung, which tells you he wasn't planning on staying gone long. Everything else he owns is arranged by occasion &#8212; see the Boutique.", specs:[['Hung', 'No'], ['Ordered elsewhere', 'By occasion'], ['See also', 'The Boutique']] },
      { key:'oxknit', name:'The Polo', x:'29%', y:'21%', body:"Knit and collared, dark as the room around it &#8212; the one piece on him tonight that isn't from the Closet. OXKNIT cut this one to his spec, and he wears it the same way he wears everything else: like it was always his.", specs:[['Collection', 'OXKNIT × Paris Pullen'], ['Fit', 'Tailored'], ['Worn', 'Off the rack, on him only']] },
    ],
    'music-lounge': [
      { key:'recordplayer', name:'The Record Player', x:'37%', y:'32%', body:'ATF to OVO &#8212; the complete list, every song in chronological order, every mixtape he could track down. Queued on shuffle and left running.', specs:[['Plays', 'One playlist, shuffled'], ['Curated by', '@djangodegree'], ['Manual skips', 'Yes']] },
      { key:'polo', name:'The Polo', x:'11%', y:'65.5%', body:"Cream knit, chocolate collar, worn open at the throat now that the tie's had its day. Off duty doesn't mean off brand.", specs:[['Collar', 'Open'], ['Collection', 'Fashion Nova × Paris Pullen'], ['Also worn', 'The Living Room']] },
    ],
    'bedroom': [
      { key:'artwork', name:'The Artwork', x:'39%', y:'16%', body:'Bought a long time before he could afford it, and hung on every wall he has had since. A man on a road at dusk, walking away from whatever the painter could not be bothered to explain. It hangs behind the headboard, so he only sees it when he turns around.', specs:[['Acquired', 'Early, badly timed'], ['Subject', 'Unexplained'], ['Moved with him', 'Every time']] },
      { key:'chair', name:'The Lounge Chair', x:'21%', y:'54%', body:'Angled at the window rather than the television, because there is no television. Most of the thinking that matters happens in it.', specs:[['Faces', 'The city'], ['Television', 'None'], ['Hours logged', 'Considerable']] },
      { key:'door', name:'The Closet Door', x:'45%', y:'12.7%', body:'Left open more often than not. What is behind it is arranged by occasion, not by colour — see the Closet.', specs:[['Kept', 'Open'], ['Ordered by', 'Occasion']] },
    ],
    'bath': [],
    'closet': [
      { key:'suits', name:'The Suits &amp; Tuxedos', x:'19%', y:'16.9%', body:'Arranged by occasion rather than colour, so getting dressed is a question of where you are going rather than what you feel like. Two dinner jackets at the centre, black-tie and white-tie, either one pressed and ready before he has to ask.', specs:[['Ordered by', 'Occasion'], ['Navy suits', 'Twelve'], ['Tuxedos', 'Two, black-tie and white-tie']] },
      { key:'shoes', name:'The Shoes', x:'9%', y:'32.9%', body:'Cedar-treed, rotated, never worn two days running. The oldest pair on the shelf is fourteen years old and still the best thing in the room.', specs:[['Rotation', 'Enforced'], ['Oldest pair', '14 years'], ['Trees', 'Cedar']] },
      { key:'ties', name:'The Ties', x:'85%', y:'31.2%', body:'Hung rather than rolled. He owns more than he wears and knows it, and has stopped pretending that will change.', specs:[['Hung', 'Never rolled'], ['Worn regularly', 'Six'], ['Owned', 'Considerably more']] },
    ],
    'kitchen': [
      { key:'hellofresh', name:'The Delivery', x:'57.5%', y:'51.5%', body:'It arrived before he did. No note, no ceremony &#8212; just the box, already unpacked onto the marble like it had always been there. He does not cook often. He cooks well when he does, and never asks how the box knew that.', specs:[] },
    ],
    'study': [
      { key:'monogram', name:'The Monogram', x:'55%', y:'12.7%', body:'Brass, wall-mounted, deliberately the only branded object in the entire apartment. He is aware of the contradiction and finds it funny.', specs:[['Material', 'Brass'], ['Other branding here', 'None'], ['Self-aware', 'Entirely']] },
      { key:'pullenlaws', name:'The Pullen Laws', x:'38%', y:'11.8%', body:'Fourteen of them, on the left-hand shelf, written down over eleven years because a rule you have to remember is a rule you will eventually forget. The first one is about arriving early. The fourteenth has never been read aloud.', specs:[['Count', 'Fourteen'], ['Written over', 'Eleven years'], ['Read aloud', 'Thirteen of them']] },
      { key:'journal', name:'The Journal', x:'51%', y:'38.8%', body:"This week's pages, face-up on the blotter for once, marked in pencil rather than ink so that nothing is decided yet. What survives the pencil goes out as a dispatch. Most of it does not survive the pencil.", specs:[['State', 'Draft'], ['Marked in', 'Pencil'], ['Survival rate', 'Low']] },
      { key:'cocktails', name:'The Cocktail Guide', x:'83%', y:'14.3%', body:'Six drinks, written on a card and kept behind the bottles, because a man looking up an Old Fashioned in front of guests has already lost the evening. Six is the entire list. There has never been a seventh.', specs:[['Drinks', 'Six'], ['Kept', 'Behind the bottles'], ['Consulted in company', 'Never']] },
      { key:'map', name:'The Map', x:'94%', y:'18.6%', body:'Brass inlay on black. Cities he has worked, not cities he has visited — a distinction he will make if you ask.', specs:[['Marks', 'Cities worked'], ['Not', 'Cities visited']] },
    ],
    'cinema': [
      { key:'posters', name:'The Posters', x:'10%', y:'32%', body:'All one register: men in tailoring, making decisions, usually badly. He will tell you it is research. It is partly research.', specs:[['Register', 'One'], ['Claimed purpose', 'Research'], ['Actual', 'Partly']] },
    ],
  };

  // Rooms with a playable screen — id/label must match the matching entry in
  // CHANNEL_SETS[channelSet][0] in assets/js/tv-remote.js.
  var START_ROOM = 'penthouse-living'; // matches data-start-room below; also which screen (if any) autoplays on load
  var TV_SCREENS = {
    'penthouse-living': { x:'55.7%', y:'24.0%', w:'17%', h:'14%',
      box:'0.4740,0.1704,0.6406,0.3093', channelSet:'living',
      id:'4xVVFJuycww', label:'The Gentlemen' },
    'cinema': { x:'49.7%', y:'30.9%', w:'28%', h:'25%',
      box:'0.3563,0.1833,0.6385,0.4352', channelSet:'cinema',
      id:'gnm4HgIAVmU', label:'The Thomas Crown Affair — Official Teaser Trailer' }
  };

  // Physical "open the remote" artifact-style marker in the room photo,
  // for rooms where it's worth one -- mirrors build_house.py's
  // REMOTE_NODE_POS exactly. Living Room's sat mid-room, in the way of
  // the coffee table -- removed in favor of the always-visible fixed
  // Remote pill. Cinema sits at the foot of the screen. Music Lounge has
  // no screen of its own (no TV_SCREENS entry), so its marker forces the
  // remote's Music tab instead of a channel -- see the 'music' fallback
  // below and tv-remote.js's toggle handler.
  var REMOTE_NODE_POS = {
    'cinema': ['50%', '45%'],
    'music-lounge': ['50%', '62%']
  };
  function remoteNodeHTML(roomId) {
    var pos = REMOTE_NODE_POS[roomId];
    if (!pos) return '';
    var ts = TV_SCREENS[roomId];
    var toggle = ts ? ts.channelSet : 'music';
    return '<button type="button" class="artifact artifact--remote" style="--x:' + pos[0] + ';--y:' + pos[1] + '" ' +
             'data-tv-remote-toggle="' + toggle + '" aria-label="Open the remote">' +
             '<span class="artifact__dot" aria-hidden="true"></span>' +
             '<span class="artifact__label">The Remote</span>' +
           '</button>';
  }

  // "The City" marker -- a real link to charlotte.html, styled exactly like
  // an artifact dot but NOT a drawer (no data-artifact attribute, so
  // world.js's drawer delegate never claims the click and the <a> navigates
  // normally). Same shape as REMOTE_NODE_POS above: any room with glass
  // worth walking through gets an entry, positioned on that room's own view.
  // Keep every position clear of the fixed left/right nav arrows -- those
  // are pinned to the viewport edges and vertically centred, so stay past
  // x=14% on the left and off mid-height at the far right.
  // Mirrors build_house.py's CITY_NODE_POS exactly.
  var CITY_NODE_POS = {
    'penthouse-living': ['18%', '22%'],  // upper pane of the stairwell glass wall, clear of the staircase below
    'bedroom':          ['19%', '18.6%'], // clear glass past the lamp, above the lounge chair
    'bath':             ['48%', '6%'],   // the skyline through the window, top edge of the now-wider frame, clear of the tub and plant
    'kitchen':          ['32%', '6.8%'], // the narrow window beside the fireplace wall, clear of the plant
    'music-lounge':     ['72%', '8%']    // the sliver of skyline beside the bar's PP sign, past the curtain
  };
  function cityLinkHTML(roomId) {
    var pos = CITY_NODE_POS[roomId];
    if (!pos) return '';
    return '<a href="charlotte.html" class="artifact artifact--remote" style="--x:' + pos[0] + ';--y:' + pos[1] + '">' +
             '<span class="artifact__dot" aria-hidden="true"></span>' +
             '<span class="artifact__label">The City</span>' +
           '</a>';
  }

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c];
    });
  };

  /* Shared with buildFloorSceneHTML() below so the TV overlay markup
     exists in exactly one place. */
  function buildTVHTML(ts, roomId) {
    if (!ts) return '';
    // Only the start room's own screen autoplays straight from the baked
    // HTML -- every other screen (Cinema included) starts with no src at
    // all, so nothing plays or makes sound until a visitor actually pages
    // into that room for the first time (see the IntersectionObserver
    // "entering" branch in tv-remote.js's initScreen -- it lazily assigns
    // the real, muted src at that point via loadChannel).
    //
    // mute=1, not the optimistic mute=0 this used to request: unmuted
    // autoplay in a cross-origin iframe is reliably blocked on mobile
    // regardless of the allow policy below, and unlike desktop (where
    // YouTube's player quietly falls back to muted-and-playing), mobile
    // browsers were sometimes just refusing to autoplay AT ALL rather
    // than falling back -- so the video never started moving. Guaranteed-
    // muted autoplay is the one mode every browser actually honors;
    // getting real sound on is entirely the job of the postMessage
    // 'unMute' attempt + guaranteed Tap-for-Sound fallback in tv-remote.js's
    // enter-room logic, same as every other screen.
    var src = roomId === START_ROOM
      ? 'https://www.youtube.com/embed/' + ts.id + '?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&enablejsapi=1'
      : '';
    return '<div class="floor-scene__screen" style="--x:' + ts.x + ';--y:' + ts.y + ';--w:' + ts.w + ';--h:' + ts.h + '" ' +
        'data-tv data-channel-set="' + ts.channelSet + '" data-box="' + ts.box + '">' +
        '<div class="floor-scene__screen-frame">' +
          '<iframe src="' + src + '" ' +
          'title="" allow="autoplay; encrypted-media" loading="lazy"></iframe>' +
        '</div>' +
        '<div class="tv-lowerthird" data-tv-lowerthird>' +
          '<p class="tv-lowerthird__eyebrow">Paris Pullen &#183; Now Screening</p>' +
          '<p class="tv-lowerthird__title" data-tv-lowerthird-title>' + esc(ts.label) + '</p>' +
        '</div>' +
        '<button type="button" class="tv-sound-prompt" data-tv-sound-prompt hidden>&#128264; Tap for Sound</button>' +
        '<div class="tv-remote" data-tv-remote>' +
          '<div class="tv-remote__brand">' +
            '<button type="button" class="tv-remote__pwr" data-tv-action="power">PWR</button>' +
            '<span class="tv-remote__wordmark">The Compliment</span>' +
          '</div>' +
          '<p class="tv-remote__channel" data-tv-channel-label>' + esc(ts.label) + '</p>' +
          '<div class="tv-remote__pad">' +
            '<button type="button" class="tv-remote__pad-hub" data-tv-action="playpause" aria-label="Play or pause"></button>' +
            '<button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--up" data-tv-action="ch-next" aria-label="Channel up">CH</button>' +
            '<button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--down" data-tv-action="ch-prev" aria-label="Channel down">CH</button>' +
            '<button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--left" data-tv-action="vol-down" aria-label="Volume down">VOL</button>' +
            '<button type="button" class="tv-remote__pad-btn tv-remote__pad-btn--right" data-tv-action="vol-up" aria-label="Volume up">VOL</button>' +
          '</div>' +
          '<div class="tv-remote__row tv-remote__row--seek">' +
            '<button type="button" data-tv-action="rw">&#9664;&#9664;</button>' +
            '<button type="button" data-tv-action="ff">&#9654;&#9654;</button>' +
          '</div>' +
          '<button type="button" class="tv-remote__mute" data-tv-action="mute">Mute</button>' +
          '<button type="button" class="tv-remote__guide" data-tv-action="guide">Guide</button>' +
          '<button type="button" class="tv-remote__expand" data-tv-action="expand">Watch Full Screen</button>' +
          '<div class="tv-remote__guide-panel" data-tv-guide-panel hidden>' +
            '<div class="tv-remote__guide-panel-head">' +
              '<p class="tv-remote__guide-panel-eyebrow">Guide</p>' +
              '<button type="button" data-tv-action="guide-close" aria-label="Close guide">Close &#215;</button>' +
            '</div>' +
            '<ul class="tv-remote__guide-panel-list" data-tv-guide-list></ul>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* Special-case artifact content -- feeds the pre-rendered drawer panels
     buildFloorSceneHTML() writes for each artifact further down. */
  var SUITS_CTA = '<a class="cta pent__open" href="wardrobe.html" style="margin-top:var(--s2)"><span>Enter the Boutique</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>';
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
  /* The Monogram is the one branded object in the apartment, so its drawer is
     where the man behind the mark introduces himself -- portrait, short bio,
     the mission line, and the real social accounts. Mirrors build_house.py's
     MONOGRAM_BIO; the social row is read out of the page's own menu (static
     markup, already parsed by the time this deferred script runs) so the
     handles and icon set can't drift from the rest of the site. */
  function socialHTML() {
    var el = document.querySelector('.menu .social');
    return el ? el.outerHTML : '';
  }
  function buildMonogramBio() {
    return '<div class="bio">' +
      '<img class="bio__portrait" src="assets/img/paris-hero.jpg" ' +
        'srcset="assets/img/paris-hero@sm.jpg 900w, assets/img/paris-hero.jpg 1800w" ' +
        'sizes="(max-width:760px) 88vw, 30vw" alt="Paris Pullen" loading="lazy">' +
      '<p class="bio__mission">The city thinks he&#8217;s selling luxury. The people who matter know he&#8217;s selling access.</p>' +
      '<p class="body">Charlotte, by way of three schools, seven years of trumpet and a backpack business printing t-shirts for his own classmates. A cold email nobody asked for turned into brand activation work; that turned into a nightlife partnership that made a 600-capacity room the best Friday in the city; that turned into hosting, then building rooms of his own.</p>' +
      '<p class="body">Menswear, hospitality, automotive culture and fragrance &#8212; run as one practice rather than four hobbies. The through-line is the same every time: put a mark on a thing, and make the right people want to be in the room with it.</p>' +
      socialHTML() +
      '<a class="cta pent__open" href="about.html" style="margin-top:var(--s2)"><span>The Man</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>' +
    '</div>';
  }

  var GUIDE_PORTAL_CTA = '<button type="button" class="cta pent__open" data-guide-portal style="margin-top:var(--s2)"><span>Explore the City Guide</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></button>';
  var JOURNAL_CTA = '<a class="cta pent__open" href="journal.html" style="margin-top:var(--s2)"><span>Read the Journal</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>';
  var VAULT_CTA = '<a class="cta pent__open" href="urwelcome.html" data-vault-enter style="margin-top:var(--s2)"><span>Enter the Vault</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>';
  // The Piano artifact (Living Room) is retired -- mirrors build_house.py's
  // MUSIC_LOUNGE_SPOTIFY exactly: one fixed playlist on the Music Lounge's
  // record-player artifact. The target is an empty div, not a plain
  // <iframe> -- piano-player.js's initLoungeSpotify() creates a real
  // Spotify IFrame API controller on it, so entering the room can call
  // controller.play() once the entry sting finishes. The house-wide
  // rotation piano-player.js also drives still exists and still plays,
  // just via the global Suite Remote's Music tab now, not an in-room widget.
  var MUSIC_LOUNGE_SPOTIFY = '<p class="body" style="margin-top:var(--s3)">Curated by <a class="link-under" href="https://instagram.com/djangodegree" target="_blank" rel="noopener">@djangodegree</a>, Host of <i>The Greatest Show On Earth</i>.</p>' +
    '<div class="spotify-embed"><div data-lounge-spotify></div></div>';
  var CANDLE_COMING_SOON = '<div class="coming-soon"><span class="coming-soon__badge">UR Welcome &#183; Coming Soon</span></div>';
  // Mirrors build_house.py's LIVING_FASHIONNOVA_UNLOCK exactly -- reused by
  // both the Living Room's Jacket and the Music Lounge's Polo, one collab
  // discovered from two rooms rather than two different lists.
  var FASHIONNOVA_UNLOCK = '<div class="unlock">' +
      '<p class="unlock__eyebrow">Unlocked &#183; What He Reaches For</p>' +
      '<ul class="unlock-list">' +
        '<li><span class="unlock-list__name">The Reset Denim</span><span class="unlock-list__note">Straight through the knee. Nothing to prove.</span></li>' +
        '<li><span class="unlock-list__name">The Quarter-Zip</span><span class="unlock-list__note">Reads expensive from ten feet. Isn\'t.</span></li>' +
        '<li><span class="unlock-list__name">The Night Puffer</span><span class="unlock-list__note">For the walk between the car and the door.</span></li>' +
        '<li><span class="unlock-list__name">The Weighted Tee</span><span class="unlock-list__note">The one under everything else that actually holds its shape.</span></li>' +
        '<li><span class="unlock-list__name">The Going-Out Chain</span><span class="unlock-list__note">Not gold. Reads gold across a room.</span></li>' +
        '<li><span class="unlock-list__name">The Knit Polo</span><span class="unlock-list__note">Cream knit, chocolate collar. Doesn\'t ask to be noticed.</span></li>' +
      '</ul>' +
      '<a class="cta cta--ghost unlock__cta" href="off-duty.html"><span>Shop the Fit &#8212; Fashion Nova &#215; Paris Pullen</span><span class="cta__arrow" aria-hidden="true">&#8594;</span></a>' +
    '</div>';

  function extrasFor(roomId, key) {
    var wardrobeCta = (roomId === 'closet' && key === 'suits') ? SUITS_CTA : '';
    var tag = ' &#183; Artifact';
    if (roomId === 'kitchen' && key === 'hellofresh') {
      wardrobeCta = HELLOFRESH_UNLOCK;
      tag = ' &#183; Artifact &#183; HelloFresh &#215; Paris Pullen';
    }
    if (key === 'window') wardrobeCta = GUIDE_PORTAL_CTA;
    if (key === 'monogram') wardrobeCta = buildMonogramBio();
    // Both the Living Room's face-down journal and the Study's pencil-marked
    // draft point at the same published dispatches.
    if (key === 'journal') wardrobeCta = JOURNAL_CTA;
    if (roomId === 'penthouse-living' && key === 'vault') wardrobeCta = VAULT_CTA;
    if (roomId === 'music-lounge' && key === 'recordplayer') wardrobeCta = MUSIC_LOUNGE_SPOTIFY;
    if (roomId === 'penthouse-living' && key === 'candle') wardrobeCta = CANDLE_COMING_SOON;
    if (roomId === 'penthouse-living' && key === 'jacket') {
      wardrobeCta = FASHIONNOVA_UNLOCK;
      tag = ' &#183; Artifact &#183; Fashion Nova &#215; Paris Pullen';
    }
    if (roomId === 'music-lounge' && key === 'polo') {
      wardrobeCta = FASHIONNOVA_UNLOCK;
      tag = ' &#183; Artifact &#183; Fashion Nova &#215; Paris Pullen';
    }
    return { wardrobeCta: wardrobeCta, tag: tag };
  }

  /* ============================================================
     THE NAV PANEL — only Levels 26-28 (The Penthouse) are open right
     now, so the panel only ever lists these three -- but every ROOM on
     each, not just one "entry" room per level (three rooms per level,
     a true 3x3 grid -- picking just one as that level's entry silently
     made the rest unreachable except by paging prev/next one room at a
     time), grouped under a small level heading. Mirrors build_house.py's
     own _nav_panel_rows() exactly.
     ============================================================ */
  function roomById(id) { return ROOMS.filter(function (r) { return r.id === id; })[0]; }

  function navPanelRows() {
    var byLevel = {}, order = [];
    ROOMS.forEach(function (r) {
      if (!byLevel[r.lvl]) { byLevel[r.lvl] = []; order.push(r.lvl); }
      byLevel[r.lvl].push(r);
    });
    order.sort(function (a, b) { return b.localeCompare(a, undefined, { numeric: true }); });
    var rows = [];
    order.forEach(function (lvl) {
      rows.push('<p class="nav-panel__group">' + esc(lvl) + '</p>');
      byLevel[lvl].forEach(function (r) {
        rows.push(
          '<button type="button" class="nav-panel__btn" data-nav-panel-go="' + r.id + '">' +
          '<span class="nav-panel__btn-lvl">' + esc(lvl.replace(/^Level\s+/, '')) + '</span>' +
          '<span class="nav-panel__btn-name">' + esc(r.name) + '</span></button>'
        );
      });
    });
    return rows.join('\n');
  }

  /* Builds one .floor-scene section — the same shape build_house.py's
     floor_html() writes into house.html — for a ROOMS entry, so the
     popup gets the full per-room system (artifacts, per-artifact drawer
     panels, TV screen) rather than a stripped-down preview. */
  function buildFloorSceneHTML(room) {
    var arts = ARTS[room.id] || [];
    var lvlBare = room.lvl.replace(/^Level\s+/i, '');

    var artsHTML = arts.map(function (a) {
      var notes = a.key === 'recordplayer' ? '<span class="artifact__notes" aria-hidden="true"><i>&#9834;</i><i>&#9835;</i><i>&#9834;</i></span>' : '';
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

    var adj = ROOM_ADJACENCY[room.id] || {};
    var dirAttrs = ['left', 'right', 'up', 'down'].map(function (d) {
      return adj[d] ? ' data-' + d + '="' + adj[d] + '"' : '';
    }).join('');

    return '<section class="floor-scene" id="' + room.id + '" tabindex="-1" aria-label="' + esc(room.lvl) + ' — ' + esc(room.name) + '"' + dirAttrs + '>' +
      '<div class="floor-scene__surface">' +
        '<div class="floor-scene__canvas">' +
          '<div class="floor-scene__view">' +
            '<img src="assets/img/' + room.img + '.jpg?v=' + IMG_VER + '" ' +
            'srcset="assets/img/' + room.img + '@sm.jpg?v=' + IMG_VER + ' 1200w, assets/img/' + room.img + '.jpg?v=' + IMG_VER + ' 2400w" ' +
            'sizes="100vw" alt="' + esc(room.name) + '" loading="lazy" width="2400" height="1350">' +
            buildTVHTML(TV_SCREENS[room.id], room.id) +
            '<div class="artifacts">' + artsHTML + remoteNodeHTML(room.id) + cityLinkHTML(room.id) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="floor-scene__scrim"></div>' +
      '<div class="wrap"><div class="floor-plate reveal">' +
        '<h2 class="floor-plate__name">' + esc(room.name) + '</h2>' +
        '<p class="floor-plate__level"><b>' + esc(lvlBare) + '</b> <span>The Penthouse</span></p>' +
        '<p class="floor-plate__note">' + esc(room.note) + '</p>' +
        '<p class="floor-plate__count"><i></i>' + arts.length + ' artifact' + (arts.length !== 1 ? 's' : '') + ' on this floor</p>' +
      '</div></div>' +
      '<div class="drawer" id="drawer-' + room.id + '" aria-hidden="true">' +
        '<button class="drawer__close">Close &#215;</button>' + panelsHTML +
      '</div>' +
    '</section>';
  }

  var pagerViewport = document.getElementById('penthouse-pager-viewport');
  var navGrid = document.getElementById('penthouse-nav-panel-grid');
  if (pagerViewport) {
    pagerViewport.innerHTML = ROOMS.map(buildFloorSceneHTML).join('');
  }
  if (navGrid) navGrid.innerHTML = navPanelRows();
})();
