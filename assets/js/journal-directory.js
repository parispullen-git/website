/* Penthouse Directory — Journal */
(function () {
  'use strict';
  var trigger = document.querySelector('[data-journal-directory-toggle], #menu-toggle');
  if (!trigger) return;

  var levels = [
    ['Level 28', [['closet','The Closet'], ['bedroom','The Bedroom'], ['bath','The Bathroom']]],
    ['Level 27', [['kitchen','The Kitchen'], ['penthouse-living','The Living Room'], ['study','The Study']]],
    ['Level 26', [['music-lounge','The Music Lounge'], ['cinema','The Cinema'], ['gym','The Gym'], ['barbershop','The Barbershop']]]
  ];

  var style = document.createElement('style');
  style.textContent =
    '.journal-directory{position:fixed;inset:0;z-index:9800;display:none;background:rgba(5,6,6,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);padding:clamp(78px,10vw,120px) var(--gutter,20px) clamp(24px,5vw,60px)}' +
    '.journal-directory.is-open{display:block}' +
    '.journal-directory__panel{width:min(860px,100%);max-height:calc(100dvh - 150px);overflow:auto;margin:0 auto;padding:clamp(20px,4vw,42px);background:rgba(10,10,11,.96);border:1px solid rgba(201,169,97,.34);box-shadow:0 35px 110px rgba(0,0,0,.66)}' +
    '.journal-directory__head{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:28px;padding-bottom:14px;border-bottom:1px solid rgba(201,169,97,.22)}' +
    '.journal-directory__title{margin:0;font-family:var(--font-display,Georgia,serif);font-size:clamp(1.55rem,3vw,2.5rem);font-weight:400;color:var(--bone,#f3f0ea)}' +
    '.journal-directory__close{width:42px;height:42px;border:1px solid rgba(201,169,97,.35);background:transparent;color:var(--bone,#f3f0ea);font-size:20px;cursor:pointer}' +
    '.journal-directory__level{margin:24px 0 9px;font-family:var(--font-mono,monospace);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--brass,#c9a961)}' +
    '.journal-directory__rooms{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' +
    '.journal-directory__room{display:flex;align-items:center;gap:10px;min-height:52px;padding:12px;text-decoration:none;color:var(--bone,#f3f0ea);border:1px solid rgba(243,240,234,.13);background:rgba(255,255,255,.025);font-family:var(--font-mono,monospace);font-size:11px;letter-spacing:.07em;text-transform:uppercase}' +
    '.journal-directory__room:hover,.journal-directory__room:focus-visible{background:rgba(201,169,97,.16);border-color:var(--brass,#c9a961)}' +
    '.journal-directory__room b{color:var(--brass,#c9a961);font-size:10px}' +
    '@media(max-width:680px){.journal-directory{padding-top:76px}.journal-directory__panel{max-height:calc(100dvh - 100px)}.journal-directory__rooms{grid-template-columns:1fr 1fr}.journal-directory__room{min-height:48px;font-size:10px}}';
  document.head.appendChild(style);

  var panel = document.createElement('nav');
  panel.className = 'journal-directory';
  panel.id = 'journal-penthouse-directory';
  panel.setAttribute('aria-label', 'Penthouse Directory');
  panel.innerHTML =
    '<div class="journal-directory__panel" role="dialog" aria-modal="true" aria-labelledby="journal-directory-title">' +
      '<div class="journal-directory__head"><h2 class="journal-directory__title" id="journal-directory-title">Penthouse Directory</h2><button class="journal-directory__close" type="button" aria-label="Close directory">×</button></div>' +
      levels.map(function (level) {
        return '<section><p class="journal-directory__level">' + level[0] + '</p><div class="journal-directory__rooms">' +
          level[1].map(function (room) {
            return '<a class="journal-directory__room" href="/#' + room[0] + '"><b>' + level[0].replace('Level ','') + '</b><span>' + room[1] + '</span></a>';
          }).join('') + '</div></section>';
      }).join('') +
    '</div>';
  document.body.appendChild(panel);

  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) panel.querySelector('.journal-directory__close').focus({preventScroll:true});
  }
  trigger.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    setOpen(!panel.classList.contains('is-open'));
  }, true);
  panel.addEventListener('click', function (event) {
    if (event.target === panel || event.target.closest('.journal-directory__close')) setOpen(false);
  });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false); });
})();