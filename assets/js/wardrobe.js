/* ============================================================
   The Wardrobe — filter, quick view, and the inquiry list.
   Selections persist in localStorage. Sending an inquiry opens a
   pre-filled mailto: to hello@parispullen.com -- there is no backend,
   same pattern as the vault's reserve list.
   ============================================================ */
(function () {
  'use strict';
  var filter = document.querySelector('.wfilter');
  if (!filter) return;

  var INQUIRY_EMAIL = 'hello@parispullen.com';
  var STORE_KEY = 'pp_wardrobe_inquiry';

  var cards   = Array.prototype.slice.call(document.querySelectorAll('#wgrid .wcard'));
  var empty   = document.getElementById('wempty');
  var count   = document.getElementById('wcount');
  var dd      = document.getElementById('wcolordd');
  var ddTrig  = document.getElementById('wcolordd-trigger');
  var ddLabel = document.getElementById('wcolordd-label');
  var ddPanel = document.getElementById('wcolordd-panel');
  var colorAll = ddPanel.querySelector('button[data-color="all"]');
  var families = Array.prototype.slice.call(ddPanel.querySelectorAll('.wfam'));
  var state    = { cat: 'all', color: 'all', family: 'all' };

  /* ---------- filter ---------- */
  function applyFilter() {
    var visible = 0;
    cards.forEach(function (card) {
      var show = (state.cat === 'all' || card.dataset.cat === state.cat) &&
                 (state.color === 'all'
                   ? (state.family === 'all' || card.dataset.family === state.family)
                   : card.dataset.color === state.color);
      card.hidden = !show;
      if (show) visible++;
    });
    empty.hidden = visible > 0;
    count.textContent = visible + ' of ' + cards.length;
  }

  function colorLabel() {
    if (state.color !== 'all') return state.color;
    if (state.family !== 'all') return state.family;
    return 'All Colors';
  }

  function paintColorUI() {
    colorAll.classList.toggle('is-on', state.family === 'all');
    families.forEach(function (fam) {
      var isActiveFam = fam.dataset.family === state.family;
      var famBtn = fam.querySelector('[data-family-btn]');
      var sub = fam.querySelector('.wfam__sub');
      famBtn.classList.toggle('is-open', isActiveFam);
      sub.classList.toggle('is-open', isActiveFam);
      famBtn.classList.toggle('is-on', isActiveFam && state.color === 'all');
      var allChip = fam.querySelector('[data-family-all]');
      allChip.classList.toggle('is-on', isActiveFam && state.color === 'all');
      Array.prototype.forEach.call(fam.querySelectorAll('button[data-color]'), function (b) {
        b.classList.toggle('is-on', isActiveFam && b.dataset.color === state.color);
      });
    });
    ddLabel.textContent = colorLabel();
  }

  function openDropdown() {
    ddPanel.hidden = false;
    dd.classList.add('is-open');
    ddTrig.setAttribute('aria-expanded', 'true');
  }
  function closeDropdown() {
    ddPanel.hidden = true;
    dd.classList.remove('is-open');
    ddTrig.setAttribute('aria-expanded', 'false');
  }

  ddTrig.addEventListener('click', function () {
    if (ddPanel.hidden) openDropdown(); else closeDropdown();
  });
  document.addEventListener('click', function (e) {
    if (!dd.contains(e.target)) closeDropdown();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDropdown();
  });

  ddPanel.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-color], button[data-family-btn], button[data-family-all]');
    if (!btn) return;
    if (btn.dataset.familyBtn !== undefined) {
      /* expand/collapse this family's shade list without closing the dropdown */
      var alreadyOpen = state.family === btn.dataset.familyBtn && state.color === 'all' &&
                         btn.closest('.wfam').querySelector('.wfam__sub').classList.contains('is-open');
      state.family = alreadyOpen ? 'all' : btn.dataset.familyBtn;
      state.color = 'all';
      paintColorUI();
      applyFilter();
      return;
    }
    if (btn === colorAll) {
      state.family = 'all';
      state.color = 'all';
    } else if (btn.dataset.familyAll !== undefined) {
      state.family = btn.dataset.familyAll;
      state.color = 'all';
    } else {
      state.family = btn.closest('.wfam').dataset.family;
      state.color = btn.dataset.color;
    }
    paintColorUI();
    applyFilter();
    closeDropdown();
  });

  filter.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-cat]');
    if (!btn) return;
    state.cat = btn.dataset.cat;
    Array.prototype.forEach.call(btn.parentNode.querySelectorAll('button'), function (b) {
      b.classList.toggle('is-on', b === btn);
    });
    applyFilter();
  });

  /* ---------- clear filters ---------- */
  document.getElementById('wfilter-reset').addEventListener('click', function () {
    state.cat = 'all';
    state.color = 'all';
    state.family = 'all';
    Array.prototype.forEach.call(filter.querySelectorAll('button[data-cat]'), function (b) {
      b.classList.toggle('is-on', b.dataset.cat === 'all');
    });
    paintColorUI();
    closeDropdown();
    applyFilter();
  });

  /* ---------- selection store: id -> {name,color,price,catlabel,size} ---------- */
  var selected = {};
  try { selected = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) { selected = {}; }

  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(selected)); } catch (e) {}
  }

  function cardById(id) {
    return cards.filter(function (c) { return c.dataset.id === id; })[0];
  }

  var tray      = document.getElementById('wtray');
  var trayCount = document.getElementById('wtray-count');
  var trayPlural = document.getElementById('wtray-plural');

  function refreshTray() {
    var ids = Object.keys(selected);
    trayCount.textContent = ids.length;
    trayPlural.textContent = ids.length === 1 ? '' : 's';
    tray.classList.toggle('is-on', ids.length > 0);
    tray.setAttribute('aria-hidden', ids.length > 0 ? 'false' : 'true');
  }

  function setSelected(id, on, size) {
    var card = cardById(id);
    if (on) {
      selected[id] = {
        name: card.dataset.name, color: card.dataset.color,
        price: card.dataset.price, cat: card.dataset.catlabel,
        size: size || (selected[id] ? selected[id].size : '')
      };
    } else {
      delete selected[id];
    }
    persist();
    refreshTray();

    if (card) {
      var btn = card.querySelector('[data-select]');
      btn.classList.toggle('is-selected', on);
      btn.setAttribute('aria-pressed', String(on));
    }
    if (quickId === id) {
      addBtn.classList.toggle('is-selected', on);
      addBtn.querySelector('span').textContent = on ? 'Added to Inquiry' : 'Add to Inquiry';
    }
  }

  // restore visual state for anything already selected this session
  Object.keys(selected).forEach(function (id) {
    var card = cardById(id);
    if (!card) return;
    var btn = card.querySelector('[data-select]');
    btn.classList.add('is-selected');
    btn.setAttribute('aria-pressed', 'true');
  });
  refreshTray();

  document.getElementById('wgrid').addEventListener('click', function (e) {
    var selBtn = e.target.closest('[data-select]');
    if (selBtn) {
      e.stopPropagation();
      var card = selBtn.closest('.wcard');
      setSelected(card.dataset.id, !selBtn.classList.contains('is-selected'));
      return;
    }
    var card = e.target.closest('.wcard');
    if (card) openQuick(card);
  });

  /* ---------- quick view ---------- */
  var quick    = document.getElementById('wquick');
  var qImg     = document.getElementById('wquick-img');
  var qCat     = document.getElementById('wquick-cat');
  var qName    = document.getElementById('wquick-name');
  var qPrice   = document.getElementById('wquick-price');
  var qNote    = document.getElementById('wquick-note');
  var qSizes   = document.getElementById('wquick-sizes');
  var addBtn   = document.getElementById('wquick-add');
  var quickId  = null;

  var qThumbs = document.getElementById('wquick-thumbs');

  function buildThumbs(card) {
    var main = card.dataset.img;
    var extra = (card.dataset.gallery || '').split(',').filter(Boolean);
    var all = [main].concat(extra);
    if (all.length < 2) { qThumbs.innerHTML = ''; return; }
    qThumbs.innerHTML = all.map(function (src, i) {
      return '<button type="button" data-src="' + src + '" class="' + (i === 0 ? 'is-on' : '') + '">' +
               '<img src="' + src + '" alt="" loading="lazy"></button>';
    }).join('');
  }

  qThumbs.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-src]');
    if (!b) return;
    qImg.src = b.dataset.src;
    Array.prototype.forEach.call(qThumbs.querySelectorAll('button'), function (x) {
      x.classList.toggle('is-on', x === b);
    });
  });

  function openQuick(card) {
    quickId = card.dataset.id;
    qImg.src = card.dataset.img;
    qImg.alt = card.dataset.name;
    buildThumbs(card);
    qCat.textContent = card.dataset.catlabel + ' · ' + card.dataset.color;
    qName.textContent = card.dataset.name;
    qPrice.textContent = '$' + Number(card.dataset.price).toLocaleString();
    qNote.textContent = card.dataset.note;

    var picked = selected[quickId] ? selected[quickId].size : '';
    Array.prototype.forEach.call(qSizes.querySelectorAll('button'), function (b) {
      b.classList.toggle('is-on', b.dataset.size === picked);
    });

    var isSel = !!selected[quickId];
    addBtn.classList.toggle('is-selected', isSel);
    addBtn.querySelector('span').textContent = isSel ? 'Added to Inquiry' : 'Add to Inquiry';

    quick.classList.add('is-open');
    quick.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  }

  function closeQuick() {
    quick.classList.remove('is-open');
    quick.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    quickId = null;
  }

  quick.addEventListener('click', function (e) {
    if (e.target.closest('[data-wquick-close]')) closeQuick();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && quick.classList.contains('is-open')) closeQuick();
  });

  qSizes.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-size]');
    if (!b) return;
    var on = !b.classList.contains('is-on');
    Array.prototype.forEach.call(qSizes.querySelectorAll('button'), function (x) {
      x.classList.toggle('is-on', x === b && on);
    });
    if (selected[quickId]) {
      selected[quickId].size = on ? b.dataset.size : '';
      persist();
    }
  });

  addBtn.addEventListener('click', function () {
    if (!quickId) return;
    var pickedBtn = qSizes.querySelector('button.is-on');
    setSelected(quickId, !selected[quickId], pickedBtn ? pickedBtn.dataset.size : '');
  });

  /* ---------- tray actions ---------- */
  document.getElementById('wtray-clear').addEventListener('click', function () {
    Object.keys(selected).forEach(function (id) { setSelected(id, false); });
  });

  /* ---------- inquiry modal ---------- */
  var inquiry     = document.getElementById('winquiry');
  var inquiryList = document.getElementById('winquiry-list');
  var inquiryForm = document.getElementById('winquiry-form');
  var inquiryErr  = document.getElementById('winquiry-err');

  function checkedIds() {
    return Array.prototype.slice.call(inquiryList.querySelectorAll('input[type="checkbox"]:checked:not(#winquiry-all)'))
      .map(function (cb) { return cb.value; });
  }

  function updateInquirySendState() {
    var n = checkedIds().length;
    var btn = inquiryForm.querySelector('.winquiry__submit span');
    if (btn) btn.textContent = n ? 'Send to Paris (' + n + ')' : 'Send to Paris';
    inquiryForm.querySelector('.winquiry__submit').disabled = n === 0;
  }

  function openInquiry() {
    var ids = Object.keys(selected);
    if (!ids.length) return;
    inquiryList.innerHTML =
      '<label class="winquiry__all"><input type="checkbox" id="winquiry-all" checked> <span>Select all (' + ids.length + ')</span></label>' +
      ids.map(function (id) {
        var s = selected[id];
        return '<label class="winquiry__item">' +
                 '<input type="checkbox" value="' + id + '" checked>' +
                 '<span><b>' + s.name + '</b><br><small>' + s.color +
                 (s.size ? ' · ' + s.size : ' · size TBD') + ' · $' +
                 Number(s.price).toLocaleString() + '</small></span>' +
               '</label>';
      }).join('');
    updateInquirySendState();
    inquiry.classList.add('is-open');
    inquiry.setAttribute('aria-hidden', 'false');
  }

  inquiryList.addEventListener('change', function (e) {
    if (e.target.id === 'winquiry-all') {
      Array.prototype.forEach.call(inquiryList.querySelectorAll('input[type="checkbox"]:not(#winquiry-all)'), function (cb) {
        cb.checked = e.target.checked;
      });
    } else {
      var all = inquiryList.querySelectorAll('input[type="checkbox"]:not(#winquiry-all)');
      var allChecked = Array.prototype.every.call(all, function (cb) { return cb.checked; });
      var allBox = document.getElementById('winquiry-all');
      if (allBox) allBox.checked = allChecked;
    }
    updateInquirySendState();
  });

  function closeInquiry() {
    inquiry.classList.remove('is-open');
    inquiry.setAttribute('aria-hidden', 'true');
  }

  document.getElementById('wtray-send').addEventListener('click', openInquiry);
  inquiry.addEventListener('click', function (e) {
    if (e.target.closest('[data-winquiry-close]')) closeInquiry();
  });

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  inquiryForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = inquiryForm.name.value.trim();
    var email = inquiryForm.email.value.trim();
    var phone = inquiryForm.phone.value.trim();
    var notes = inquiryForm.notes.value.trim();

    var ids = checkedIds();

    if (!name || !EMAIL_RE.test(email) || !phone || !ids.length) {
      inquiryErr.textContent = !ids.length
        ? 'Check at least one piece to send.'
        : 'Add your name, a valid email, and a phone number first.';
      inquiryErr.hidden = false;
      return;
    }
    inquiryErr.hidden = true;

    var lines = ids.map(function (id) {
      var s = selected[id];
      return '- ' + s.name + ' (' + s.color + (s.size ? ', size ' + s.size : ', size TBD') +
             ') $' + Number(s.price).toLocaleString();
    });

    var body =
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      (phone ? 'Phone: ' + phone + '\n' : '') +
      '\nPieces of interest:\n' + lines.join('\n') +
      (notes ? '\n\nNotes:\n' + notes : '') +
      '\n\n(Sent from the Wardrobe on parispullen.com)';

    var subject = encodeURIComponent('The Wardrobe — inquiry (' + ids.length + ' piece' + (ids.length === 1 ? '' : 's') + ')');
    window.location.href = 'mailto:' + INQUIRY_EMAIL + '?subject=' + subject + '&body=' + encodeURIComponent(body);

    try {
      fetch('/.netlify/functions/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name, email: email, phone: phone, notes: notes,
          items: ids.map(function (id) {
            var s = selected[id];
            return { name: s.name, color: s.color, size: s.size || '', price: s.price };
          }),
        }),
      }).catch(function () {});
    } catch (e) {}

    inquiryList.parentNode.insertBefore(document.createElement('div'), inquiryForm);
    inquiryForm.hidden = true;
    var thanks = document.createElement('div');
    thanks.className = 'stack';
    thanks.innerHTML =
      '<p class="body">Your mail app should have opened with everything filled in. Send that message and we will follow up to set up the consultation.</p>' +
      '<button type="button" class="cta cta--ghost" data-winquiry-close style="justify-self:start"><span>Close</span></button>';
    inquiry.querySelector('.winquiry__panel').appendChild(thanks);
  });

  /* ---------- share-by-email modal ---------- */
  var share     = document.getElementById('wshare');
  var shareList = document.getElementById('wshare-list');
  var shareForm = document.getElementById('wshare-form');
  var shareErr  = document.getElementById('wshare-err');

  function openShare() {
    var ids = Object.keys(selected);
    if (!ids.length) return;
    shareList.innerHTML = ids.map(function (id) {
      var s = selected[id];
      return '<div class="winquiry__item">' +
               '<span><b>' + s.name + '</b><br><small>' + s.color +
               (s.size ? ' · ' + s.size : ' · size TBD') + ' · $' +
               Number(s.price).toLocaleString() + '</small></span>' +
             '</div>';
    }).join('');
    shareErr.hidden = true;
    shareForm.hidden = false;
    var thanks = share.querySelector('.winquiry__panel > .stack:not(.stack--tight)');
    if (thanks) thanks.remove();
    share.classList.add('is-open');
    share.setAttribute('aria-hidden', 'false');
  }

  function closeShare() {
    share.classList.remove('is-open');
    share.setAttribute('aria-hidden', 'true');
  }

  document.getElementById('wtray-share').addEventListener('click', openShare);
  share.addEventListener('click', function (e) {
    if (e.target.closest('[data-wshare-close]')) closeShare();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && share.classList.contains('is-open')) closeShare();
  });

  shareForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var toEmail = shareForm.email.value.trim();
    var fromName = shareForm.from.value.trim();
    var note = shareForm.note.value.trim();
    var ids = Object.keys(selected);

    if (!EMAIL_RE.test(toEmail) || !ids.length) {
      shareErr.textContent = !ids.length ? 'Nothing in the list to share.' : 'Add a valid email first.';
      shareErr.hidden = false;
      return;
    }
    shareErr.hidden = true;

    var lines = ids.map(function (id) {
      var s = selected[id];
      return '- ' + s.name + ' (' + s.color + (s.size ? ', size ' + s.size : '') +
             ') $' + Number(s.price).toLocaleString();
    });

    var body =
      (note ? note + '\n\n' : '') +
      'A few pieces from The Wardrobe:\n\n' + lines.join('\n') +
      '\n\nBrowse the full lookbook: https://www.parispullen.com/wardrobe.html' +
      '\n\n' + (fromName ? '— ' + fromName : '— Sent from The Wardrobe on parispullen.com');

    var subject = encodeURIComponent('A few pieces from The Wardrobe' + (fromName ? ' — ' + fromName : ''));
    window.location.href = 'mailto:' + toEmail + '?subject=' + subject + '&body=' + encodeURIComponent(body);

    shareForm.hidden = true;
    var thanks = document.createElement('div');
    thanks.className = 'stack';
    thanks.innerHTML =
      '<p class="body">Your mail app should have opened with the list filled in. Send it whenever you&#8217;re ready.</p>' +
      '<button type="button" class="cta cta--ghost" data-wshare-close style="justify-self:start"><span>Close</span></button>';
    share.querySelector('.winquiry__panel').appendChild(thanks);
  });

  applyFilter();
})();
