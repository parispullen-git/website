(function () {
  'use strict';

  var ROOT = '/assets/blueprint/';
  var LOOKS = [
    { id:'navy-white-blue', suit:'navy', shirt:'white', tie:'blue', square:'white' },
    { id:'navy-white-brown', suit:'navy', shirt:'white', tie:'brown', square:'white' },
    { id:'navy-white-black', suit:'navy', shirt:'white', tie:'black', square:'white' },
    { id:'navy-white-open', suit:'navy', shirt:'white', tie:'open', square:'white' },
    { id:'navy-blue-black', suit:'navy', shirt:'light-blue', tie:'black', square:'white' },
    { id:'navy-blue-brown', suit:'navy', shirt:'light-blue', tie:'brown', square:'white' },
    { id:'navy-black-black', suit:'navy', shirt:'black', tie:'black', square:'black' },
    { id:'navy-black-open', suit:'navy', shirt:'black', tie:'open', square:'black' },
    { id:'grey-white-black', suit:'grey', shirt:'white', tie:'black', square:'white' },
    { id:'grey-white-brown', suit:'grey', shirt:'white', tie:'brown', square:'white' },
    { id:'grey-white-blue', suit:'grey', shirt:'white', tie:'blue', square:'white' },
    { id:'grey-white-open', suit:'grey', shirt:'white', tie:'open', square:'white' },
    { id:'grey-blue-open', suit:'grey', shirt:'light-blue', tie:'open', square:'white' },
    { id:'grey-blue-blue', suit:'grey', shirt:'light-blue', tie:'blue', square:'white' },
    { id:'grey-blue-brown', suit:'grey', shirt:'light-blue', tie:'brown', square:'white' },
    { id:'grey-blue-black', suit:'grey', shirt:'light-blue', tie:'black', square:'white' },
    { id:'grey-black-black', suit:'grey', shirt:'black', tie:'black', square:'black' },
    { id:'grey-black-open', suit:'grey', shirt:'black', tie:'open', square:'black' },
    { id:'tan-white-blue', suit:'tan', shirt:'white', tie:'blue', square:'white' },
    { id:'brown-white-brown', suit:'brown', shirt:'white', tie:'brown', square:'white' },
    { id:'black-white-black', suit:'black', shirt:'white', tie:'black', square:'white' }
  ];

  var FOUNDATIONS = ['navy','grey','tan','brown','black'];
  var OPTIONS = {
    suit: ['all','navy','grey','tan','brown','black'],
    shirt: ['all','white','light-blue','black'],
    tie: ['all','black','blue','brown','open']
  };
  var filters = { suit:'all', shirt:'all', tie:'all' };
  var visibleLooks = LOOKS.slice();
  var current = 0;
  var drawerOpen = false;
  var touchStartX = null;

  var game = document.getElementById('blueprintGame');
  var drawer = document.getElementById('lookDrawer');
  var scrim = document.getElementById('drawerScrim');
  var status = document.getElementById('gameStatus');
  var lookImage = document.getElementById('lookImage');
  var playerLookImage = document.getElementById('playerLookImage');
  var playerLookName = document.getElementById('playerLookName');
  var lookName = document.getElementById('lookName');
  var lookNumber = document.getElementById('lookNumber');
  var lookSummary = document.getElementById('lookSummary');
  var squareSummary = document.getElementById('squareSummary');
  var resultCount = document.getElementById('resultCount');
  var strip = document.getElementById('lookStrip');
  var toast = document.getElementById('toast');
  var previousFocus = null;

  function title(value) {
    if (value === 'light-blue') return 'Light blue';
    if (value === 'open') return 'Open collar';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function imageFor(look) { return ROOT + 'looks/' + look.id + '.webp'; }

  function filtered() {
    return LOOKS.filter(function (look) {
      return Object.keys(filters).every(function (key) {
        return filters[key] === 'all' || look[key] === filters[key];
      });
    });
  }

  function announce(message) {
    status.textContent = message;
    status.classList.add('is-visible');
    window.clearTimeout(announce.timer);
    announce.timer = window.setTimeout(function () { status.classList.remove('is-visible'); }, 1500);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 1900);
  }

  function setActiveFoundation(suit) {
    document.querySelectorAll('[data-suit]').forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-suit') === suit);
    });
  }

  function renderCurrent() {
    if (!visibleLooks.length) return;
    if (current >= visibleLooks.length) current = 0;
    var look = visibleLooks[current];
    var absolute = LOOKS.indexOf(look) + 1;
    lookImage.src = imageFor(look);
    lookImage.alt = title(look.suit) + ' three-piece suit with ' + title(look.shirt) + ' shirt and ' + title(look.tie) + (look.tie === 'open' ? '' : ' tie');
    playerLookImage.src = imageFor(look);
    playerLookImage.alt = 'Paris Pullen look: ' + title(look.suit) + ' three-piece suit with ' + title(look.shirt) + ' shirt and ' + title(look.tie) + (look.tie === 'open' ? '' : ' tie');
    playerLookName.textContent = title(look.suit) + ' / ' + title(look.shirt) + ' / ' + title(look.tie);
    lookName.textContent = title(look.suit) + ' Foundation';
    lookNumber.textContent = 'Look ' + String(absolute).padStart(2,'0') + ' / ' + LOOKS.length;
    lookSummary.textContent = title(look.suit) + ' / ' + title(look.shirt) + ' shirt / ' + title(look.tie) + (look.tie === 'open' ? '' : ' tie');
    squareSummary.textContent = title(look.square) + ' pocket square';
    setActiveFoundation(look.suit);
    document.querySelectorAll('.bp__look-card').forEach(function (card) {
      card.classList.toggle('is-active', card.getAttribute('data-look-id') === look.id);
    });
  }

  function renderStrip() {
    strip.innerHTML = '';
    visibleLooks.forEach(function (look, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'bp__look-card';
      button.setAttribute('data-look-id', look.id);
      button.setAttribute('aria-label', title(look.suit) + ', ' + title(look.shirt) + ' shirt, ' + title(look.tie));
      var img = document.createElement('img');
      img.src = imageFor(look);
      img.alt = '';
      img.loading = 'lazy';
      button.appendChild(img);
      button.addEventListener('click', function () { current = index; renderCurrent(); });
      strip.appendChild(button);
    });
  }

  function applyFilters(preferredId) {
    visibleLooks = filtered();
    var preferredIndex = visibleLooks.findIndex(function (look) { return look.id === preferredId; });
    current = preferredIndex >= 0 ? preferredIndex : 0;
    resultCount.textContent = visibleLooks.length + (visibleLooks.length === 1 ? ' uploaded combination' : ' uploaded combinations');
    renderFilterButtons();
    renderStrip();
    renderCurrent();
  }

  function renderFilterButtons() {
    Object.keys(OPTIONS).forEach(function (key) {
      var container = document.getElementById(key + 'Filters');
      container.innerHTML = '';
      OPTIONS[key].forEach(function (value) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'bp__chip' + (filters[key] === value ? ' is-active' : '');
        button.textContent = title(value);
        button.setAttribute('aria-pressed', filters[key] === value ? 'true' : 'false');
        button.addEventListener('click', function () {
          var selected = visibleLooks[current] && visibleLooks[current].id;
          filters[key] = value;
          applyFilters(selected);
          var applied = visibleLooks[current];
          if (applied) {
            announce(title(applied.suit) + ', ' + title(applied.shirt) + ' shirt, ' + title(applied.tie));
          }
        });
        container.appendChild(button);
      });
    });
  }

  function openDrawer(group) {
    previousFocus = document.activeElement;
    drawerOpen = true;
    drawer.classList.add('is-open');
    scrim.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    if (group) {
      document.querySelectorAll('.bp__category').forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute('data-category') === group);
      });
      var target = drawer.querySelector('[data-filter-group="' + group + '"]');
      if (target) target.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }
    window.setTimeout(function () { document.getElementById('closeDrawer').focus({preventScroll:true}); }, 80);
  }

  function closeDrawer() {
    drawerOpen = false;
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    drawer.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (previousFocus && previousFocus.focus) previousFocus.focus({preventScroll:true});
  }

  function selectFoundation(suit, shouldOpen) {
    filters.suit = suit;
    filters.shirt = 'all';
    filters.tie = 'all';
    applyFilters();
    setActiveFoundation(suit);
    announce(title(suit) + ' foundation selected');
    if (shouldOpen) openDrawer('suit');
  }

  function step(direction) {
    if (!visibleLooks.length) return;
    current = (current + direction + visibleLooks.length) % visibleLooks.length;
    renderCurrent();
    var look = visibleLooks[current];
    announce(title(look.suit) + ', ' + title(look.shirt) + ' shirt, ' + title(look.tie));
  }

  function buildMobileSuits() {
    var mobile = document.getElementById('mobileSuits');
    FOUNDATIONS.forEach(function (suit) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'bp__mobile-suit' + (suit === 'navy' ? ' is-active' : '');
      button.setAttribute('data-suit', suit);
      button.setAttribute('aria-label', 'Select ' + suit + ' foundation suit');
      var img = document.createElement('img');
      img.src = ROOT + 'foundations/' + suit + '.webp';
      img.alt = '';
      img.loading = suit === 'navy' ? 'eager' : 'lazy';
      var label = document.createElement('span');
      label.textContent = title(suit);
      button.appendChild(img);
      button.appendChild(label);
      button.addEventListener('click', function () { selectFoundation(suit, false); });
      mobile.appendChild(button);
    });
  }

  document.querySelectorAll('.bp__rack-zone').forEach(function (button) {
    button.addEventListener('click', function () { selectFoundation(button.getAttribute('data-suit'), false); });
  });
  document.querySelectorAll('.bp__category').forEach(function (button) {
    button.addEventListener('click', function () { openDrawer(button.getAttribute('data-category')); });
  });
  document.getElementById('openFilters').addEventListener('click', function () { openDrawer('suit'); });
  document.getElementById('openLook').addEventListener('click', function () { openDrawer(); });
  document.getElementById('closeDrawer').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  document.getElementById('previousLook').addEventListener('click', function () { step(-1); });
  document.getElementById('nextLook').addEventListener('click', function () { step(1); });
  document.getElementById('resetFilters').addEventListener('click', function () {
    filters = { suit:'all', shirt:'all', tie:'all' };
    applyFilters('navy-white-blue');
    showToast('Filters reset');
  });
  document.getElementById('applyLook').addEventListener('click', function () {
    var look = visibleLooks[current];
    if (!look) return;
    try { window.localStorage.setItem('paris-pullen-blueprint-look', look.id); } catch (ignore) {}
    closeDrawer();
    showToast('Look selected — ' + title(look.suit) + ' foundation');
  });

  game.addEventListener('touchstart', function (event) {
    if (drawerOpen || !event.touches.length) return;
    touchStartX = event.touches[0].clientX;
  }, {passive:true});
  game.addEventListener('touchend', function (event) {
    if (drawerOpen || touchStartX === null || !event.changedTouches.length) return;
    var delta = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) > 55) step(delta > 0 ? -1 : 1);
  }, {passive:true});

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && drawerOpen) closeDrawer();
    if (!drawerOpen && event.key === 'ArrowLeft') step(-1);
    if (!drawerOpen && event.key === 'ArrowRight') step(1);
    if (drawerOpen && event.key === 'Tab') {
      var focusable = drawer.querySelectorAll('button:not([disabled])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  buildMobileSuits();
  renderFilterButtons();
  renderStrip();
  renderCurrent();
})();
