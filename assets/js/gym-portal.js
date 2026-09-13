/* ============================================================
   Gym Portal — a popup into the After Hours boxing minigame,
   opened from the Gym's own Boxer artifact. Mirrors guide-portal.js
   exactly (built lazily on first use, reused for every trigger on
   the page). The iframe loads gym/index.html?embed=1 -- that query
   param is read by gym/game.js itself, which hides the standalone
   room preview, drops the dialog's own close button, and opens the
   fight dialog immediately, so what appears here is just the game.
   ============================================================ */
(function () {
  'use strict';

  var modal = null, frame = null;

  function build() {
    modal = document.createElement('div');
    modal.className = 'gym-portal';
    modal.innerHTML =
      '<div class="gym-portal__frame">' +
        '<button type="button" class="gym-portal__close" data-gym-portal-close>Close &#10005;</button>' +
        '<iframe title="After Hours — The Gym" loading="lazy"></iframe>' +
      '</div>';
    document.body.appendChild(modal);
    frame = modal.querySelector('iframe');

    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-gym-portal-close]')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  function open() {
    if (!modal) build();
    frame.src = 'gym/index.html?embed=1';
    modal.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
  }

  function close() {
    if (!modal) return;
    modal.classList.remove('is-open');
    frame.src = '';
    document.documentElement.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-gym-portal]')) {
      e.preventDefault();
      open();
    }
  });
})();
