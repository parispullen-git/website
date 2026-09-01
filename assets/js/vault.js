/* ============================================================
   UR Welcome — the vault
   Node on the bottle opens the product, which is sold out, which
   leads to the reserve list and a note from Paris.

   WHERE THE DETAILS GO
   --------------------
   A static site cannot store anything. Paste a form endpoint below
   (Formspree, Netlify Forms, Basin — anything that accepts a POST)
   and submissions go there. Leave it empty and the form falls back
   to opening a pre-addressed email instead, which still works but
   asks the visitor to press send.
   ============================================================ */
window.UR_WELCOME_ENDPOINT = '';           // e.g. 'https://formspree.io/f/xxxxxxx'
window.UR_WELCOME_EMAIL    = 'hello@parispullen.com';

(function () {
  'use strict';
  var root = document.getElementById('vault');
  if (!root) return;

  var node  = root.querySelector('.vault__node');
  var steps = {
    intro: root.querySelector('[data-step="intro"]'),
    product: root.querySelector('[data-step="product"]'),
    list: root.querySelector('[data-step="list"]'),
    thanks: root.querySelector('[data-step="thanks"]')
  };

  function show(name) {
    Object.keys(steps).forEach(function (k) {
      if (steps[k]) steps[k].classList.toggle('is-on', k === name);
    });
    root.classList.toggle('is-open', name !== 'intro');
  }

  node.addEventListener('click', function () { show('product'); });
  node.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show('product'); }
  });

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-goto]');
    if (b) { e.preventDefault(); show(b.dataset.goto); }
  });

  /* ---------- the reserve list ---------- */
  var form = root.querySelector('.vault__form');
  if (!form) return;
  var err = form.querySelector('.vault__err');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name  = form.querySelector('[name="name"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim();

    if (!name)  { err.textContent = 'A name, so the note is addressed properly.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      err.textContent = 'That email address does not look right.'; return;
    }
    err.textContent = '';

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    var label = btn.querySelector('span');
    var was = label.textContent;
    label.textContent = 'Sending…';

    var endpoint = window.UR_WELCOME_ENDPOINT;

    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, list: 'UR Welcome — preorder' })
      }).then(function (r) {
        if (!r.ok) throw new Error('bad response');
        greet(name, false);
      }).catch(function () {
        err.textContent = 'That did not go through. Try again, or email ' + window.UR_WELCOME_EMAIL + '.';
        btn.disabled = false; label.textContent = was;
      });
    } else {
      // No endpoint configured: hand it to the visitor's mail client.
      var subject = encodeURIComponent('UR Welcome — reserve list');
      var body = encodeURIComponent(
        'Please add me to the UR Welcome reserve list.\n\nName: ' + name + '\nEmail: ' + email + '\n');
      window.location.href = 'mailto:' + window.UR_WELCOME_EMAIL + '?subject=' + subject + '&body=' + body;
      greet(name, true);
    }
  });

  function greet(name, viaMail) {
    var first = name.split(/\s+/)[0];
    var hello = root.querySelector('[data-greet]');
    if (hello) hello.textContent = first;
    var caveat = root.querySelector('[data-caveat]');
    if (caveat) {
      caveat.textContent = viaMail
        ? 'Your mail app should have opened with the details filled in — send that message and you are on the list.'
        : 'You are on the list. Nothing else is needed.';
    }
    show('thanks');
  }
})();
