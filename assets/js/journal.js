/* ============================================================
   The Journal — category filter.
   ============================================================ */
(function () {
  'use strict';
  var filter = document.querySelector('.jfilter');
  if (!filter) return;

  var buttons = Array.prototype.slice.call(filter.querySelectorAll('button'));
  var cards   = Array.prototype.slice.call(document.querySelectorAll('#jgrid .jcard'));
  var empty   = document.getElementById('jempty');

  filter.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-cat]');
    if (!btn) return;

    buttons.forEach(function (b) { b.classList.toggle('is-on', b === btn); });

    var cat = btn.dataset.cat;
    var visible = 0;
    cards.forEach(function (card) {
      var show = cat === 'all' || card.dataset.cat === cat;
      card.hidden = !show;
      if (show) visible++;
    });
    empty.hidden = visible > 0;
  });
})();
