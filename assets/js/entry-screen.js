(function () {
  'use strict';

  var q = function (selector, root) { return (root || document).querySelector(selector); };

  function portal(title, src, opener) {
    var old = q('#entry-guide-modal');
    if (old) old.remove();
    var dialog = document.createElement('dialog');
    dialog.id = 'entry-guide-modal';
    dialog.className = 'entry-modal';
    dialog.innerHTML = '<div class="entry-modal__bar"><p class="entry-modal__title"></p><button class="entry-modal__close" type="button">Return</button></div><iframe loading="eager"></iframe>';
    q('.entry-modal__title', dialog).textContent = title;
    q('iframe', dialog).src = src;
    q('iframe', dialog).title = title;
    document.body.appendChild(dialog);
    function close() {
      if (dialog.open) dialog.close();
      dialog.remove();
      if (opener && opener.isConnected) opener.focus();
    }
    q('.entry-modal__close', dialog).addEventListener('click', close);
    dialog.addEventListener('click', function (event) { if (event.target === dialog) close(); });
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); close(); });
    dialog.showModal();
  }

  function network(opener) {
    var old = q('#entry-network-modal');
    if (old) old.remove();
    var dialog = document.createElement('dialog');
    dialog.id = 'entry-network-modal';
    dialog.className = 'entry-network';
    dialog.innerHTML = '<button class="entry-network__close" aria-label="Close">×</button><p class="entry-eyebrow">Private Network · Paris Pullen</p><h2>The Network</h2><p>A direct line. Leave your details and become part of Paris Pullen’s private network.</p><form><label>First name<input name="firstName" required autocomplete="given-name"></label><label>Last name<input name="lastName" required autocomplete="family-name"></label><label class="full">Email<input name="email" type="email" required autocomplete="email"></label><label class="full">Phone <input name="phone" type="tel" autocomplete="tel"></label><button type="submit">Enter the Network</button><p class="entry-network__status" aria-live="polite"></p></form>';
    document.body.appendChild(dialog);
    function close() {
      if (dialog.open) dialog.close();
      dialog.remove();
      if (opener && opener.isConnected) opener.focus();
    }
    q('.entry-network__close', dialog).addEventListener('click', close);
    dialog.addEventListener('click', function (event) { if (event.target === dialog) close(); });
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); close(); });
    q('form', dialog).addEventListener('submit', function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var status = q('.entry-network__status', dialog);
      var button = q('[type=submit]', form);
      var data = Object.fromEntries(new FormData(form));
      button.disabled = true;
      button.textContent = 'Adding…';
      fetch('/api/network', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (response) { return response.json().then(function (data) { return { ok: response.ok, data: data }; }); })
        .then(function (response) {
          if (!response.ok) throw new Error(response.data.error || 'Something went wrong.');
          form.innerHTML = '<p class="entry-network__status">Welcome to the Network, ' + (response.data.firstName || 'friend') + '.</p>';
        })
        .catch(function (error) { status.textContent = error.message; button.disabled = false; button.textContent = 'Enter the Network'; });
    });
    dialog.showModal();
  }

  function boot(root) {
    var guides = q('[data-entry-guides]', root);
    var main = q('[data-entry-main]', root);
    var returnButton = q('[data-entry-return]', root);
    if (!main) return;

    function closeEntry() {
      root.hidden = true;
      root.classList.remove('entry-screen--room-menu');
      if (returnButton) returnButton.hidden = true;
      var penthouse = q('#penthouse');
      if (penthouse) penthouse.focus({ preventScroll: true });
    }

    function openGuides(opener) {
      if (!guides) return;
      function close() {
        if (guides.open) guides.close();
        if (opener && opener.isConnected) opener.focus();
      }
      q('[data-entry-back]', guides).onclick = close;
      guides.addEventListener('cancel', function (event) { event.preventDefault(); close(); }, { once: true });
      guides.showModal();
    }

    q('[data-entry-open-guides]', main).addEventListener('click', function (event) { openGuides(event.currentTarget); });
    var enter = q('[data-entry-enter]', main);
    if (enter) enter.addEventListener('click', closeEntry);
    if (returnButton) returnButton.addEventListener('click', closeEntry);

    root.addEventListener('click', function (event) {
      var target = event.target.closest('[data-entry-open]');
      if (!target) return;
      if (guides && guides.contains(target)) return;
      event.preventDefault();
      if (target.dataset.entryOpen === 'network') network(target);
      else portal(target.dataset.entryTitle, target.dataset.entrySrc, target);
    });

    if (guides) guides.addEventListener('click', function (event) {
      var target = event.target.closest('[data-entry-open]');
      if (!target) return;
      event.preventDefault();
      portal(target.dataset.entryTitle, target.dataset.entrySrc, target);
    });

    window.ParisPullenEntry = window.ParisPullenEntry || {};
    window.ParisPullenEntry.openRoomMenu = function () {
      root.hidden = false;
      root.classList.add('entry-screen--room-menu');
      if (returnButton) returnButton.hidden = false;
      q('[data-entry-open="network"]', main).focus();
    };

    // The hero portrait behaves like the Penthouse scenes: drag or swipe the
    // open background to reveal more of the city and tailoring.
    var background = q('.entry-screen__bg', root);
    if (background) {
      var startX = 0, startY = 0, offsetX = 0, offsetY = 0, active = false;
      function paint() {
        background.style.transform = 'scale(1.07) translate3d(' + offsetX + 'px,' + offsetY + 'px,0)';
      }
      root.addEventListener('pointerdown', function (event) {
        if (event.target.closest('a,button,input,dialog')) return;
        active = true;
        startX = event.clientX - offsetX;
        startY = event.clientY - offsetY;
        root.classList.add('is-panning');
        root.setPointerCapture(event.pointerId);
      });
      root.addEventListener('pointermove', function (event) {
        if (!active) return;
        event.preventDefault();
        offsetX = Math.max(-54, Math.min(54, event.clientX - startX));
        offsetY = Math.max(-38, Math.min(38, event.clientY - startY));
        paint();
      });
      function stop(event) {
        if (!active) return;
        active = false;
        root.classList.remove('is-panning');
        if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId);
      }
      root.addEventListener('pointerup', stop);
      root.addEventListener('pointercancel', stop);
    }
  }

  document.querySelectorAll('[data-entry-screen]').forEach(boot);
}());
