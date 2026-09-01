/* ============================================================
   Guide Portal — a popup navigator into the City Guide, opened
   from any window/glass artifact in the house (bedroom's "The
   Glass", the Coffee House's "The Window", etc). Built lazily on
   first use and reused for every trigger on the page.
   ============================================================ */
(function () {
  'use strict';

  var modal = null, frame = null;

  function build() {
    modal = document.createElement('div');
    modal.className = 'guide-portal';
    modal.innerHTML =
      '<div class="guide-portal__frame">' +
        '<button type="button" class="guide-portal__close" data-guide-portal-close>Close &#10005;</button>' +
        '<iframe title="The City Guide" loading="lazy"></iframe>' +
      '</div>';
    document.body.appendChild(modal);
    frame = modal.querySelector('iframe');

    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-guide-portal-close]')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  function open() {
    if (!modal) build();
    frame.src = 'charlotte.html';
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
    if (e.target.closest('[data-guide-portal]')) {
      e.preventDefault();
      open();
    }
  });
})();
