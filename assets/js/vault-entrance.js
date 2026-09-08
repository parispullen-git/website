/* ============================================================
   Vault Entrance — the Living Room's Door artifact. Plays a
   full-screen wipe before handing off to urwelcome.html, so
   opening the vault reads as entering it rather than a plain
   link click.
   ============================================================ */
(function () {
  'use strict';

  var overlay = null;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'vault-transition';
    overlay.innerHTML =
      '<div class="vault-transition__panel"></div>' +
      '<p class="vault-transition__mark">UR Welcome</p>';
    document.body.appendChild(overlay);
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-vault-enter]');
    if (!trigger) return;
    e.preventDefault();
    if (!overlay) build();
    overlay.classList.add('is-playing');
    var dest = trigger.getAttribute('href') || 'urwelcome.html';
    window.setTimeout(function () {
      window.location.href = dest;
    }, 1050);
  });
})();
