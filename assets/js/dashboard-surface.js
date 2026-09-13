/* Presentation-only navigation: delegate to the existing authenticated tab handlers. */
(function () {
  'use strict';
  var nav = document.querySelector('.dashnav');
  var location = document.getElementById('deck-location');
  document.getElementById('deck-date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  function syncNavigation() {
    nav.querySelectorAll('[data-tab]').forEach(function (button) {
      var active = button.classList.contains('is-active');
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
      button.setAttribute('aria-controls', 'panel-' + button.dataset.tab);
      if (active) location.textContent = 'Workspace / ' + button.textContent.trim();
    });
    nav.querySelectorAll('.dashnav__group').forEach(function (group) {
      group.querySelector('.dashnav__grouphead').setAttribute('aria-expanded', String(group.classList.contains('is-open')));
    });
  }
  document.querySelectorAll('[data-open-panel]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (document.getElementById('dashcontent').hidden) return;
      var target = nav.querySelector('[data-tab="' + button.dataset.openPanel + '"]');
      if (!target) return;
      target.click();
      var panel = document.getElementById('panel-' + button.dataset.openPanel);
      panel.setAttribute('tabindex', '-1');
      panel.focus({ preventScroll: true });
      panel.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  });
  nav.addEventListener('click', syncNavigation);
  new MutationObserver(syncNavigation).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
  syncNavigation();
})();
