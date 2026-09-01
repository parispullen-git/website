/* ============================================================
   The Firm — walk up to the wall.
   Selecting a pin pushes the view toward that print, hides the
   others, and brings up its card. Step back to see the wall again.
   ============================================================ */
(function () {
  'use strict';
  var room = document.getElementById('room');
  if (!room) return;

  var plate = room.querySelector('.room__plate');
  var card  = room.querySelector('.room__card');
  var pins  = Array.prototype.slice.call(room.querySelectorAll('.pin'));
  var CLOSE = 2.35;

  function back() {
    room.classList.remove('is-close');
    plate.style.setProperty('--z', 1);
    plate.style.setProperty('--ox', '50%');
    plate.style.setProperty('--oy', '50%');
    card.classList.remove('is-on');
    pins.forEach(function (p) { p.classList.remove('is-target'); });
  }

  function step(pin) {
    var x = pin.style.getPropertyValue('--x') || '50%';
    var y = pin.style.getPropertyValue('--y') || '50%';
    plate.style.setProperty('--ox', x);
    plate.style.setProperty('--oy', y);
    plate.style.setProperty('--z', CLOSE);
    room.classList.add('is-close');
    pins.forEach(function (p) { p.classList.toggle('is-target', p === pin); });

    card.querySelector('[data-no]').textContent   = pin.dataset.no;
    card.querySelector('[data-name]').textContent = pin.dataset.name;
    card.querySelector('[data-kind]').textContent = pin.dataset.kind;
    card.querySelector('[data-open]').setAttribute('href', '#' + pin.dataset.file);
    card.classList.add('is-on');
  }

  pins.forEach(function (pin) {
    pin.addEventListener('click', function (e) {
      e.preventDefault();
      if (pin.classList.contains('is-target')) { back(); return; }
      step(pin);
    });
    pin.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pin.click(); }
    });
  });

  card.querySelector('[data-back]').addEventListener('click', back);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && room.classList.contains('is-close')) back();
  });
})();
