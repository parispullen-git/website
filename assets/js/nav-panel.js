/* ============================================================
   Nav Panel — a compact, toggleable corner button grid for jumping
   straight to any floor (or, on the City Guide, any district) instead
   of paging through them one at a time with arrows. Replaces the old
   always-visible directory list / elevator rail.

   Reusable: window.PPNavPanel(rootEl, target) wires one up, where
   `target` is either a room-pager instance (its goToId is called) or
   a plain function(id) for anything else that isn't a room-pager (the
   City Guide's district picker, e.g.). Every [data-nav-panel] present
   when this script runs is auto-initialized, paired with the first
   room-pager on the page -- pages without one (charlotte.html) are
   expected to call PPNavPanel themselves with their own function once
   their own data's ready, since auto-init has nothing to pair with.
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
})();
