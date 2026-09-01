/* Burns Brims — site behaviour */
(function () {
  'use strict';

  document.getElementById('yr').textContent = new Date().getFullYear();

  /* ---- nav state ---- */
  var nav = document.getElementById('nav');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 60); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  document.getElementById('burger').addEventListener('click', function () {
    var l = document.querySelector('.nav-links');
    var open = l.style.display === 'flex';
    l.style.cssText = open ? '' :
      'display:flex;position:fixed;inset:64px 0 auto;background:rgba(10,10,11,.97);' +
      'flex-direction:column;gap:0;padding:24px var(--pad);border-bottom:1px solid var(--line-dark)';
  });

  /* ---- scroll reveal ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---- collection grids ---- */
  var SIGNATURE = ['phoenix','mad-max','volcanic-crown','emerald-city',
                   'firebird','purple-butterfly','brazil','top-that'];
  var isSig = function (slug) { return SIGNATURE.indexOf(slug) !== -1; };

  var gSig = document.getElementById('grid-signature');
  var gArc = document.getElementById('grid-archive');
  var items = [];

  function money(n) { return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }); }

  function card(p, opts) {
    opts = opts || {};
    var cls = 'card' + (p.inStock ? '' : ' is-sold') + (opts.light ? ' card-light' : '');
    var tag = p.inStock ? '<span class="tag avail">Available</span>'
                        : '<span class="tag sold">Past Work</span>';
    var sig = (!opts.light && isSig(p.slug)) ? '<span class="tag signature">Signature</span>' : '';
    return '<a class="' + cls + '" href="' + p.url + '" target="_blank" rel="noopener">' +
      '<div class="card-media">' + tag + sig +
      '<img src="' + p.img + '" alt="' + p.name + ' — handcrafted Burns Brims hat" loading="lazy">' +
      '<div class="card-hover"><span>' + (p.inStock ? 'View piece' : 'Commission similar') + ' →</span></div>' +
      '</div>' +
      '<div class="card-body"><div class="card-name">' + p.name + '</div>' +
      '<div class="card-price">' + money(p.price) + '</div></div></a>';
  }

  function renderArchive(filter) {
    gArc.innerHTML = items.filter(function (p) {
      if (filter === 'available') return p.inStock;
      if (filter === 'archive') return !p.inStock;
      return true;
    }).map(function (p) { return card(p, { light: true }); }).join('');
  }

  fetch('products.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      items = data.sort(function (a, b) {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        return b.price - a.price;
      });
      gSig.innerHTML = SIGNATURE.map(function (slug) {
        var p = items.filter(function (i) { return i.slug === slug; })[0];
        return p ? card(p) : '';
      }).join('');
      renderArchive('all');
    })
    .catch(function () {
      gArc.innerHTML = '<p class="body-copy">View the full collection on the ' +
        '<a href="https://www.burnsbrims.com/fire-crowns" style="color:var(--brass-lo)">shop</a>.</p>';
    });

  document.getElementById('filters').addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    this.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
    b.classList.add('active');
    renderArchive(b.dataset.filter);
  });
})();
