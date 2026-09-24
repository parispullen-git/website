/* ============================================================
   Nav Panel — compact room navigation plus the public-facing
   Gentleman artifact naming/routing compatibility layer.
   ============================================================ */
(function () {
  'use strict';

  function init(root, target) {
    var toggle = root.querySelector('[data-nav-panel-toggle]');
    var grid = root.querySelector('[data-nav-panel-grid]');
    if (!toggle || !grid || !target) return null;
    var go = typeof target === 'function' ? target : function (id) { target.goToId(id, 'start'); };

    function setOpen(open) {
      grid.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      root.classList.toggle('is-open', open);
    }
    setOpen(false);

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(grid.hidden);
    });

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-nav-panel-go]');
      if (!btn) return;
      go(btn.dataset.navPanelGo);
      setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (!grid.hidden && !root.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !grid.hidden) setOpen(false);
    });

    return { setOpen: setOpen };
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-nav-panel]'), function (root) {
    var pager = window.PPRoomPagers && window.PPRoomPagers[0];
    if (pager) init(root, pager);
  });

  window.PPNavPanel = init;

  var NAMES = {
    suits: 'The Gentleman\u2019s Guide to Suits',
    cocktails: 'The Gentleman\u2019s Guide to Cocktails',
    hellofresh: 'The Gentleman\u2019s Guide to HelloFresh',
    training: 'The Gentleman\u2019s Training Game',
    charlotte: 'The Gentleman\u2019s Guide to Charlotte'
  };

  var COCKTAIL_ROOMS = ['penthouse-living', 'music-lounge', 'bedroom', 'study'];

  function setText(selector, value, root) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), function (el) {
      if (el.textContent !== value) el.textContent = value;
    });
  }

  function renameArtifact(roomId, selector, name) {
    var room = document.getElementById(roomId);
    if (!room) return;
    var spot = room.querySelector(selector);
    if (!spot) return;
    var label = spot.querySelector('.artifact__label');
    if (label && label.textContent !== name) label.textContent = name;
    var artifactId = spot.getAttribute('data-artifact');
    if (artifactId) {
      Array.prototype.forEach.call(room.querySelectorAll('.drawer__panel[data-artifact="' + artifactId + '"] .drawer__name'), function (title) {
        if (title.textContent !== name) title.textContent = name;
      });
    }
  }

  function cocktailArtifactInRoom(room) {
    if (!room || COCKTAIL_ROOMS.indexOf(room.id) === -1) return null;
    var spots = room.querySelectorAll('.artifact[data-artifact]');
    for (var i = 0; i < spots.length; i++) {
      var label = spots[i].querySelector('.artifact__label');
      var text = ((label && label.textContent) || spots[i].textContent || '').trim();
      var id = spots[i].getAttribute('data-artifact') || '';
      if (/cocktail/i.test(text) || /cocktail/i.test(id)) return spots[i];
    }
    return null;
  }

  function renameCocktailGuides() {
    COCKTAIL_ROOMS.forEach(function (roomId) {
      var room = document.getElementById(roomId);
      var spot = cocktailArtifactInRoom(room);
      if (!spot) return;
      var label = spot.querySelector('.artifact__label');
      if (label && label.textContent !== NAMES.cocktails) label.textContent = NAMES.cocktails;
      var artifactId = spot.getAttribute('data-artifact');
      if (artifactId) {
        Array.prototype.forEach.call(room.querySelectorAll('.drawer__panel[data-artifact="' + artifactId + '"] .drawer__name'), function (title) {
          if (title.textContent !== NAMES.cocktails) title.textContent = NAMES.cocktails;
        });
      }
    });
  }

  function applyPublicNames() {
    renameArtifact('closet', '[data-artifact="suits"]', NAMES.suits);
    renameArtifact('bedroom', '[data-artifact="suit"]', NAMES.suits);
    renameArtifact('kitchen', '[data-artifact="hellofresh"]', NAMES.hellofresh);
    renameArtifact('gym', '[data-gym-portal]', NAMES.training);
    renameCocktailGuides();

    Array.prototype.forEach.call(document.querySelectorAll('[data-artifact="journal"]'), function (spot) {
      var label = spot.querySelector('.artifact__label');
      if (label && label.textContent !== 'The Journal') label.textContent = 'The Journal';
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-guide-portal],[data-city-guide]'), function (spot) {
      var label = spot.querySelector('.artifact__label');
      if (label && label.textContent !== NAMES.charlotte) label.textContent = NAMES.charlotte;
      if (spot.getAttribute('aria-label') !== NAMES.charlotte) spot.setAttribute('aria-label', NAMES.charlotte);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-floors]'), function (button) {
      if (button.tagName === 'BUTTON' && button.textContent !== 'Directory') button.textContent = 'Directory';
      if (button.getAttribute('aria-label') !== 'Directory') button.setAttribute('aria-label', 'Directory');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav-panel-toggle]'), function (button) {
      var text = (button.textContent || '').trim();
      if (/^floors?$/i.test(text) || /floors/i.test(button.getAttribute('aria-label') || '')) {
        if (button.textContent !== 'Directory') button.textContent = 'Directory';
        if (button.getAttribute('aria-label') !== 'Directory') button.setAttribute('aria-label', 'Directory');
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll('.ae-tab'), function (button) {
      if (/floors\s*&\s*rooms/i.test(button.textContent || '')) button.textContent = 'Directory';
    });
    var experienceTitle = document.getElementById('ae-title');
    if (experienceTitle && /^the floors$/i.test((experienceTitle.textContent || '').trim())) experienceTitle.textContent = 'Directory';

    setText('#blueprint-room-portal .ae-kicker', NAMES.suits);
    setText('.guide-portal__title span', 'The Compliment Hotel \u00b7 ' + NAMES.charlotte);
    var cityDialog = document.querySelector('.guide-portal');
    if (cityDialog && cityDialog.getAttribute('aria-label') !== NAMES.charlotte) cityDialog.setAttribute('aria-label', NAMES.charlotte);
    var cityFrame = document.querySelector('.guide-portal iframe');
    if (cityFrame && cityFrame.getAttribute('title') !== NAMES.charlotte) cityFrame.setAttribute('title', NAMES.charlotte);
    var gymFrame = document.querySelector('.gym-portal iframe');
    if (gymFrame && gymFrame.getAttribute('title') !== NAMES.training) gymFrame.setAttribute('title', NAMES.training);

    var ae = document.getElementById('artifact-experience');
    if (ae && ae.open) {
      var title = ae.querySelector('#ae-title');
      if (title) {
        if (/delivery|hello ?fresh/i.test(title.textContent || '') && title.textContent !== NAMES.hellofresh) title.textContent = NAMES.hellofresh;
        if (/cocktail/i.test(title.textContent || '') && title.textContent !== NAMES.cocktails) title.textContent = NAMES.cocktails;
      }
    }
  }

  function openFramePortal(title, src, opener) {
    var old = document.getElementById('gentleman-guide-portal');
    if (old) old.remove();
    var modal = document.createElement('dialog');
    modal.id = 'gentleman-guide-portal';
    modal.className = 'ae-dialog';
    modal.setAttribute('aria-label', title);
    modal.innerHTML = '<header class="ae-header"><div class="ae-brand"><span class="foxx" aria-hidden="true"></span><span class="ae-kicker"></span></div><button class="ae-close" type="button" data-gentleman-close>Return to room \u00d7</button></header><iframe loading="eager" style="display:block;width:100%;height:calc(100% - 58px);min-height:72vh;border:0;background:#090a09"></iframe>';
    modal.querySelector('.ae-kicker').textContent = title;
    var frame = modal.querySelector('iframe');
    frame.title = title;
    frame.src = src;
    document.body.appendChild(modal);
    function close() {
      if (modal.open) modal.close();
      modal.remove();
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    }
    modal.querySelector('[data-gentleman-close]').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    modal.showModal();
  }

  document.addEventListener('click', function (e) {
    var journal = e.target.closest && e.target.closest('.artifact[data-artifact="journal"]');
    if (journal) {
      e.preventDefault();
      e.stopImmediatePropagation();
      window.location.href = 'journal.html';
      return;
    }

    var spot = e.target.closest && e.target.closest('.artifact[data-artifact]');
    var room = spot && spot.closest('.floor-scene');
    if (spot && room && COCKTAIL_ROOMS.indexOf(room.id) !== -1 && cocktailArtifactInRoom(room) === spot) {
      e.preventDefault();
      e.stopImmediatePropagation();
      openFramePortal(NAMES.cocktails, 'cocktail-menu.html?embed=1', spot);
    }
  }, true);

  function bootNames() {
    applyPublicNames();
    var observer = new MutationObserver(function () {
      observer.disconnect();
      applyPublicNames();
      observer.observe(document.body, { childList: true, subtree: true });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootNames, { once: true });
  else bootNames();
})();
