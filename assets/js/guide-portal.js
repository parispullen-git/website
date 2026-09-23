/* ============================================================
   Guide Portal — one City Guide popup, shared by every City Guide
   artifact/button across the hotel and links.parispullen.com.

   The portal remembers the last Penthouse room. On the main site the
   Back to Penthouse control closes the popup and restores that room in
   the existing room pager. Across subdomains it uses a parent-domain
   cookie and returns to parispullen.com#<room>. Living Room is the safe
   default when there is no room history yet.
   ============================================================ */
(function () {
  'use strict';

  var DEFAULT_ROOM = 'penthouse-living';
  var COOKIE = 'pp_last_penthouse_room';
  var PORTAL_SRC = '/city-guide-popup.html';
  var modal = null, frame = null, opener = null;

  function validRoom(id) {
    return /^[a-z0-9-]+$/i.test(id || '') ? id : DEFAULT_ROOM;
  }

  function readCookie() {
    var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
    if (!match) return null;
    try { return validRoom(decodeURIComponent(match[1])); } catch (err) { return null; }
  }

  function rememberRoom(id) {
    id = validRoom(id);
    try { localStorage.setItem(COOKIE, id); } catch (err) {}
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    var domain = /(^|\\.)parispullen\\.com$/i.test(location.hostname) ? '; Domain=.parispullen.com' : '';
    document.cookie = COOKIE + '=' + encodeURIComponent(id) + '; Path=/; Max-Age=31536000; SameSite=Lax' + domain + secure;
    return id;
  }

  function rememberedRoom() {
    var id = readCookie();
    if (id) return id;
    try { id = localStorage.getItem(COOKIE); } catch (err) {}
    return validRoom(id || DEFAULT_ROOM);
  }

  function pagerWithRoom(id) {
    var pagers = window.PPRoomPagers || [];
    for (var i = 0; i < pagers.length; i++) {
      if (pagers[i] && typeof pagers[i].hasRoom === 'function' && pagers[i].hasRoom(id)) return pagers[i];
    }
    return null;
  }

  function captureCurrentRoom() {
    var pagers = window.PPRoomPagers || [];
    for (var i = 0; i < pagers.length; i++) {
      if (!pagers[i] || typeof pagers[i].getCurrentId !== 'function') continue;
      var id = pagers[i].getCurrentId();
      if (id) return rememberRoom(id);
    }
    return rememberedRoom();
  }

  // Persist every real room change, not only City Guide opens. The cookie's
  // parent-domain scope lets links.parispullen.com recover the room later.
  document.addEventListener('pp:room-change', function (e) {
    if (e.detail && e.detail.id) rememberRoom(e.detail.id);
  });

  function injectStyles() {
    if (document.getElementById('guide-portal-v2-css')) return;
    var style = document.createElement('style');
    style.id = 'guide-portal-v2-css';
    style.textContent =
      '.guide-portal{position:fixed!important;inset:0!important;z-index:9920!important;padding:clamp(8px,2vw,22px)!important;background:rgba(4,5,4,.91)!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);align-items:center!important;justify-content:center!important}' +
      '.guide-portal.is-open{display:flex!important}' +
      '.guide-portal__frame{position:relative!important;width:min(1540px,100%)!important;height:min(930px,100dvh)!important;max-height:calc(100dvh - clamp(16px,4vw,44px))!important;border:1px solid rgba(219,213,201,.18)!important;border-radius:0!important;background:#090a09!important;overflow:hidden!important;box-shadow:0 35px 100px rgba(0,0,0,.68)!important;padding-top:58px!important}' +
      '.guide-portal__chrome{position:absolute;z-index:4;left:0;right:0;top:0;height:58px;display:flex;align-items:stretch;justify-content:space-between;background:#090a09;border-bottom:1px solid rgba(219,213,201,.14)}' +
      '.guide-portal__back,.guide-portal__close{position:static!important;top:auto!important;right:auto!important;min-width:44px!important;min-height:44px!important;border-radius:0!important;margin:0!important;font-family:var(--font-mono,monospace)!important;font-size:10px!important;letter-spacing:.13em!important;text-transform:uppercase!important;color:#dbd5c9!important;background:transparent!important;border:0!important;cursor:pointer!important;-webkit-tap-highlight-color:transparent}' +
      '.guide-portal__back{padding:0 18px!important;border-right:1px solid rgba(219,213,201,.14)!important;text-align:left!important}' +
      '.guide-portal__back span{color:#c9a961;margin-right:8px}' +
      '.guide-portal__close{width:58px!important;border-left:1px solid rgba(219,213,201,.14)!important;font-size:18px!important}' +
      '.guide-portal__back:hover,.guide-portal__close:hover{color:#c9a961!important;border-color:#a8874e!important}' +
      '.guide-portal__title{display:flex;align-items:center;gap:10px;padding:0 14px;min-width:0;color:#8e8981;font-family:var(--font-mono,monospace);font-size:8px;letter-spacing:.15em;text-transform:uppercase}' +
      '.guide-portal__title i{width:6px;height:6px;border-radius:50%;background:#79a97f;box-shadow:0 0 10px #79a97f;flex:0 0 auto}' +
      '.guide-portal__frame iframe{position:absolute!important;left:0!important;right:0!important;bottom:0!important;top:58px!important;width:100%!important;height:calc(100% - 58px)!important;border:0!important;background:#090a09}' +
      '@media(max-width:760px){.guide-portal{padding:0!important}.guide-portal__frame{width:100%!important;height:100dvh!important;max-height:100dvh!important;border:0!important;padding-top:54px!important}.guide-portal__chrome{height:54px;padding-top:env(safe-area-inset-top,0px);box-sizing:content-box}.guide-portal__frame iframe{top:calc(54px + env(safe-area-inset-top,0px))!important;height:calc(100% - 54px - env(safe-area-inset-top,0px))!important}.guide-portal__title{display:none}.guide-portal__back{font-size:9px!important;padding:0 14px!important}.guide-portal__close{width:54px!important}}';
    document.head.appendChild(style);
  }

  function build() {
    injectStyles();
    modal = document.createElement('div');
    modal.className = 'guide-portal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Charlotte City Guide');
    modal.innerHTML =
      '<div class="guide-portal__frame">' +
        '<div class="guide-portal__chrome">' +
          '<button type="button" class="guide-portal__back" data-guide-portal-back><span aria-hidden="true">&#8592;</span>Back to Penthouse</button>' +
          '<div class="guide-portal__title"><i aria-hidden="true"></i><span>The Compliment Hotel &middot; Charlotte City Guide</span></div>' +
          '<button type="button" class="guide-portal__close" data-guide-portal-close aria-label="Close City Guide">&#10005;</button>' +
        '</div>' +
        '<iframe title="The Charlotte City Guide" loading="eager" allow="geolocation"></iframe>' +
      '</div>';
    document.body.appendChild(modal);
    frame = modal.querySelector('iframe');

    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-guide-portal-close]')) close();
      else if (e.target.closest('[data-guide-portal-back]')) backToPenthouse();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  function srcFor(trigger) {
    var href = trigger && trigger.closest ? (trigger.closest('a') || trigger).getAttribute('href') : '';
    var hash = '';
    if (href && href.indexOf('#') >= 0) hash = href.slice(href.indexOf('#'));
    return PORTAL_SRC + hash;
  }

  function open(trigger) {
    if (!modal) build();
    opener = trigger && trigger.closest ? trigger.closest('a,button,[data-guide-portal]') : document.activeElement;
    captureCurrentRoom();
    frame.src = srcFor(trigger);
    modal.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    var back = modal.querySelector('[data-guide-portal-back]');
    if (back) setTimeout(function () { back.focus({ preventScroll: true }); }, 0);
  }

  function close() {
    if (!modal) return;
    modal.classList.remove('is-open');
    frame.src = 'about:blank';
    document.documentElement.style.overflow = '';
    if (opener && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
  }

  function backToPenthouse() {
    var room = rememberedRoom() || DEFAULT_ROOM;
    var pager = pagerWithRoom(room) || pagerWithRoom(DEFAULT_ROOM);
    if (pager) {
      close();
      pager.goToId(pager.hasRoom(room) ? room : DEFAULT_ROOM, 'start');
      return;
    }
    // links.parispullen.com and non-Penthouse pages have no room pager in
    // their document, so return to the main hotel's embedded Penthouse.
    window.location.href = 'https://parispullen.com/#' + encodeURIComponent(room || DEFAULT_ROOM);
  }

  function isCityGuideTrigger(target) {
    if (!target || !target.closest) return false;
    if (target.closest('[data-guide-portal],[data-city-guide]')) return true;
    var a = target.closest('a[href]');
    if (!a) return false;
    var href = a.getAttribute('href') || '';
    return /(^|\/)charlotte\.html(?:[#?]|$)/i.test(href) || /(^|\/)city-guide-popup\.html(?:[#?]|$)/i.test(href);
  }

  document.addEventListener('click', function (e) {
    if (!isCityGuideTrigger(e.target)) return;
    // Never turn modified clicks into a modal: preserve open-in-new-tab etc.
    if (e.button && e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open(e.target);
  });

  window.PPCityGuidePortal = { open: open, close: close, backToPenthouse: backToPenthouse };
})();
