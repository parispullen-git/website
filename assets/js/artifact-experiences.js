/* Room-native object experiences. Shared by the homepage and generated house.
   The original drawers remain the content fallback if this layer cannot load. */
(function () {
  'use strict';
  if (!document.querySelector('[data-room-pager]')) return;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cache = new Map();
  const data = path => {
    if (!cache.has(path)) cache.set(path, fetch(path).then(r => {
      if (!r.ok) throw new Error('Content unavailable');
      return r.json();
    }).catch(e => { cache.delete(path); throw e; }));
    return cache.get(path);
  };
  const pager = () => window.PPRoomPagers && window.PPRoomPagers[0];
  const current = () => document.getElementById(pager() ? pager().getCurrentId() : 'penthouse-living');
  const roomName = room => $('.floor-plate__name, h2', room)?.textContent || room.id;
  const roomImage = room => $('.floor-scene__media img, .floor-scene__canvas img, img', room)?.getAttribute('src') || '';
  const num = n => String(n).padStart(2, '0');
  const dialog = document.createElement('dialog');
  dialog.id = 'artifact-experience';
  dialog.className = 'ae-dialog';
  dialog.setAttribute('aria-labelledby', 'ae-title');
  document.body.appendChild(dialog);
  let origin = null, sourceRoom = null, generation = 0, actionHandlers = {}, sequence = null;
  let touchStart = null;
  const saved = (() => { try { return new Set(JSON.parse(localStorage.getItem('pp_saved_objects') || '[]')); } catch (_) { return new Set(); } })();
  const savedDetails = (() => { try { return JSON.parse(localStorage.getItem('pp_saved_object_details') || '{}'); } catch (_) { return {}; } })();
  function saveButton(id) { return `<button class="ae-small" data-save="${esc(id)}" aria-pressed="${saved.has(id)}">${saved.has(id) ? 'Saved to your stay' : 'Save to your stay'}</button>`; }
  function actions(html) { return `<div class="ae-actions">${html}</div>`; }
  function goButton(id, label) { return `<button class="ae-action ae-action--quiet" data-room="${id}">${esc(label)} ↗</button>`; }
  function begin(kind, title, spot) {
    if (dialog.open) close();
    generation++;
    origin = spot || document.activeElement;
    sourceRoom = spot?.closest('.floor-scene') || current();
    actionHandlers = {};
    sequence = null;
    dialog.dataset.kind = kind;
    const rect = origin?.getBoundingClientRect();
    dialog.style.setProperty('--ae-origin', rect ? `${Math.min(100, rect.x / innerWidth * 100)}% ${Math.min(100, rect.y / innerHeight * 100)}%` : '50% 70%');
    dialog.innerHTML = `<header class="ae-header"><div class="ae-brand"><span class="foxx" aria-hidden="true"></span><span class="ae-kicker">The Compliment · ${esc(sourceRoom ? roomName(sourceRoom) : 'Your stay')}</span></div><button class="ae-close" data-close autofocus aria-label="Return to room">Return to room ×</button></header><div class="ae-content"><h2 id="ae-title">${esc(title)}</h2><div class="ae-body"><p role="status">Opening the collection…</p></div></div>`;
    if (sourceRoom) sourceRoom.classList.add('ae-room-focus');
    if (origin?.matches('[data-artifact]')) { origin.setAttribute('aria-expanded', 'true'); origin.setAttribute('aria-controls', dialog.id); }
    dialog.showModal();
    return generation;
  }
  function fill(html, token) {
    if (token !== undefined && (token !== generation || !dialog.open)) return false;
    const body=$('.ae-body',dialog), focused=document.activeElement;
    const restore=body.contains(focused) && focused.matches('button');
    const identity=restore?{...focused.dataset}:null;
    body.innerHTML = html;
    if (restore) {
      const replacement=$$('button',body).find(b=>!b.disabled && Object.keys(identity).every(k=>b.dataset[k]===identity[k]));
      (replacement || $('button[aria-pressed="true"]',body) || $('.ae-close',dialog))?.focus({preventScroll:true});
    }
    return true;
  }
  function cleanUp() {
    if (!origin && !sourceRoom) return;
    generation++;
    sourceRoom?.classList.remove('ae-room-focus');
    if (origin?.matches('[data-artifact]')) origin.setAttribute('aria-expanded', 'false');
    if (origin?.isConnected && !origin.closest('[inert]')) origin.focus({preventScroll:true});
    origin = null;
    sourceRoom = null;
    sequence = null;
  }
  function close() { if (dialog.open) { dialog.close(); cleanUp(); } }
  dialog.addEventListener('close', () => { if (!dialog.open) cleanUp(); });
  dialog.addEventListener('click', e => {
    if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); }
    const b = e.target.closest('button, a');
    if (!b) return;
    if (b.hasAttribute('data-close')) close();
    if (b.dataset.room) travel(b.dataset.room);
    if (b.dataset.action && actionHandlers[b.dataset.action]) actionHandlers[b.dataset.action](b);
    if (b.dataset.save) {
      const id = b.dataset.save;
      if (saved.has(id)) saved.delete(id); else saved.add(id);
      savedDetails[id] = { title: ($('.ae-selected h3',dialog)||$('.ae-page h3',dialog)||$('.ae-split h3',dialog)||$('#ae-title',dialog))?.textContent || id, room: sourceRoom?.id || current()?.id };
      try { localStorage.setItem('pp_saved_objects', JSON.stringify([...saved])); localStorage.setItem('pp_saved_object_details', JSON.stringify(savedDetails)); } catch (_) {}
      b.setAttribute('aria-pressed', String(saved.has(id)));
      b.textContent = saved.has(id) ? 'Saved to your stay' : 'Save to your stay';
    }
  });
  dialog.addEventListener('keydown', e => {
    // Do not let the room pager steal arrows intended for an object collection.
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.stopPropagation();
    if (sequence && ['ArrowLeft','ArrowRight'].includes(e.key) && !e.target.matches('input,textarea,select')) {
      e.preventDefault(); sequence(e.key === 'ArrowRight' ? 1 : -1);
    }
  });
  dialog.addEventListener('touchstart', e => { touchStart = [e.touches[0].clientX, e.touches[0].clientY]; }, {passive:true});
  dialog.addEventListener('touchend', e => {
    if (!touchStart || !sequence || e.target.closest('.ae-rail,.ae-sleeves,input,button,a')) return;
    const dx = e.changedTouches[0].clientX - touchStart[0], dy = e.changedTouches[0].clientY - touchStart[1];
    touchStart = null;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) sequence(dx < 0 ? 1 : -1);
  }, {passive:true});
  function travel(id) {
    const p = pager();
    if (!p || !p.hasRoom(id)) return;
    close();
    history.pushState(null, '', '#' + id);
    p.goToId(id, 'start', !reduced.matches);
    const room = document.getElementById(id);
    if (room) { room.setAttribute('tabindex', '-1'); room.focus({preventScroll:true}); }
  }
  window.addEventListener('popstate', () => {
    const id = location.hash.slice(1);
    if (pager()?.hasRoom(id)) { close(); pager().goToId(id, 'start', false); }
  });
  function specMarkup(panel) {
    const dl = $('dl', panel);
    return dl ? `<dl class="ae-spec">${dl.innerHTML}</dl>` : '';
  }
  function focusMarkup(room, spot, caption) {
    const x = spot?.style.getPropertyValue('--x') || '50%', y = spot?.style.getPropertyValue('--y') || '50%';
    return `<figure class="ae-focus" style="--ae-point:${esc(x)} ${esc(y)};--ae-zoom:1.65"><img src="${esc(roomImage(room))}" alt="${esc(caption)} in ${esc(roomName(room))}"><figcaption>In situ · ${esc(caption)}</figcaption></figure>`;
  }
  function gallery(spot, panel, key) {
    const room = spot.closest('.floor-scene');
    const title = $('.drawer__name', panel)?.textContent || spot.textContent.trim();
    begin('gallery', title, spot);
    const body = $('.drawer__body > p', panel)?.textContent || '';
    let extra = '';
    if (key === 'door') extra = goButton('closet', 'Step into the Closet');
    else if (key === 'map' || key === 'chair') extra = '<a class="ae-action" href="charlotte.html">Explore Charlotte ↗</a>';
    else if (key === 'vault') extra = '<a class="ae-action" href="urwelcome.html">Explore UR Welcome ↗</a>';
    else if (key === 'monogram') extra = '<a class="ae-action" href="about.html">Meet Paris ↗</a>';
    else if (key === 'suit' || ['shoes','ties'].includes(key)) extra = goButton('closet', 'Explore the wardrobe');
    else if (key === 'candle') extra = '<span class="ae-kicker">UR Welcome · Coming soon</span>';
    fill(`<div class="ae-split"><div>${focusMarkup(room, spot, title)}${actions('<button class="ae-small" data-action="zoom">Look closer +</button><button class="ae-small" data-action="reset">Full setting −</button>')}</div><div><p class="ae-lede">${esc(body)}</p>${specMarkup(panel)}${actions(extra + saveButton(spot.dataset.artifact))}<p class="ae-note">An object in its setting. Examine the detail, then return to exactly where you were.</p></div></div>`);
    let zoom = 1.65;
    actionHandlers.zoom = () => { zoom = Math.min(3.5, zoom + .45); $('.ae-focus', dialog).style.setProperty('--ae-zoom', zoom); };
    actionHandlers.reset = () => { zoom = 1; $('.ae-focus', dialog).style.setProperty('--ae-zoom', zoom); };
  }
  async function wardrobe(spot) {
    const token = begin('wardrobe', 'A room of decisions.', spot);
    try {
      const products = await data('data/wardrobe.json');
      if (token !== generation || !dialog.open) return;
      let category = 'all', offset = 0, selected = null;
      const categories = [['all','All occasions'],['two-piece','Everyday'],['double-breasted','Double-breasted'],['tuxedo','Black tie'],['three-piece','Three-piece'],['coats','Outerwear']];
      function draw() {
        const collection = products.filter(p => category === 'all' || p.cat === category);
        const visible = collection.slice(offset, offset + 8);
        if (!selected || !visible.includes(selected)) selected = visible[0];
        fill(`<p class="ae-lede">Slide the hangers. Pull a piece forward. Dress for the evening you have in mind.</p><div class="ae-tabs" aria-label="Occasion">${categories.map(([id,label]) => `<button class="ae-tab" aria-pressed="${category===id}" data-action="filter" data-category="${id}">${label}</button>`).join('')}</div><div class="ae-rail" aria-label="Garment rail" tabindex="0">${visible.map(p => `<button class="ae-hanger" data-action="select" data-id="${esc(p.id)}" aria-pressed="${p===selected}"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy"><span>${esc(p.name)}</span><small>${esc(p.color || p.cat)} · Catalogue $${Number(p.price).toLocaleString()}</small></button>`).join('')}</div><div class="ae-book-controls"><button class="ae-small" data-action="previous" ${offset===0?'disabled':''}>← Previous rail</button><span>${offset+1}–${Math.min(offset+8,collection.length)} of ${collection.length}</span><button class="ae-small" data-action="next" ${offset+8>=collection.length?'disabled':''}>Next rail →</button></div><div class="ae-selection"></div>`);
        drawSelection();
        actionHandlers.previous = () => { offset = Math.max(0,offset-8); selected=null; draw(); };
        actionHandlers.next = () => { if(offset+8<collection.length) {offset+=8; selected=null; draw();} };
      }
      function drawSelection() {
        if (!selected) return;
        $('.ae-selection', dialog).innerHTML = `<div class="ae-selected"><img src="${esc(selected.gallery?.[0] || selected.img)}" alt="Detail of ${esc(selected.name)}"><div><span class="ae-kicker">Pulled from the rail</span><h3>${esc(selected.name)}</h3><p class="ae-lede">${esc(selected.note || 'Explore the cut, colour and details in the Boutique.')}</p><p class="ae-note">Catalogue pricing. Availability and fitting are confirmed in the Boutique.</p></div>${actions(saveButton('wardrobe:'+selected.id)+'<a class="ae-action" href="wardrobe.html">Open the Boutique ↗</a>')}</div>`;
        $$('.ae-hanger',dialog).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===selected.id)));
      }
      actionHandlers.filter = b => { category=b.dataset.category;offset=0;selected=null;draw(); };
      actionHandlers.select = b => { selected=products.find(p=>p.id===b.dataset.id);drawSelection(); };
      draw();
    } catch (_) { fill('<p>The rail is unavailable right now.</p><a class="ae-action" href="wardrobe.html">Open the Boutique ↗</a>', token); }
  }
  const recipes = [
    {name:'Gouda Vibes Burgers with Tomato Onion Jam & Potato Wedges',tag:'The standby',note:'Beef patty, nutty gouda, and a jam that does more work than it should.',time:'35 minutes',ingredients:['Ground beef','Gouda cheese','Potato buns','Tomato & onion jam','Potato wedges'],story:'The good vibes are in the jam. Smoky sauce underneath, gouda melted past the point of resistance, and fries on the side that were never really optional.',image:'assets/img/collabs/hellofresh/00.jpg',link:'https://www.hellofresh.com/recipes/gouda-vibes-burgers-5eb9aeccd2f80a637e0e4e5d'},
    {name:'Southwest Shrimp Tacos with Pico de Gallo & Hot Sauce Crema',tag:'The quick one',note:'Twenty-five minutes, tastes like it took longer.',time:'25 minutes',ingredients:['Shrimp','Southwest spice blend','Poblano pepper','Pico de gallo','Hot sauce crema'],story:'Seared shrimp, warm tortillas, a crema with enough heat to matter. The kind of Tuesday dinner that argues its own case.',image:'assets/img/collabs/hellofresh/01.jpg',link:'https://www.hellofresh.com/recipes/southwest-shrimp-tacos-61a789cad3877c660a03a872'},
    {name:'Honey Sriracha Pork Tenderloin with Roasted Sesame Carrots & Cilantro-Lime Rice',tag:'The occasion',note:'Sesame, ginger, honey, sriracha — the sauce does the talking.',time:'45 minutes',ingredients:['Pork tenderloin','Sesame carrots','Cilantro-lime rice','Honey','Sriracha'],story:'A lick-the-plate glaze over rested pork, rice bright with lime, carrots roasted past just-tender. Worth clearing the evening for.',image:'assets/img/collabs/hellofresh/02.jpg',link:'https://www.hellofresh.com/recipes/honey-sriracha-pork-tenderloin-5fa07b6801edba49463cf224'},
    {name:'Chimichurri Lamb & Hot Honey Brussels Sprouts',tag:'The showstopper',note:'Seared lamb chops, bold herby chimichurri, no apology required.',time:'35 minutes',ingredients:['Lamb chops','Chimichurri','Brussels sprouts','Hot honey','Feta & pepitas'],story:'The lamb does the showing off. The Brussels sprouts, roasted with hot honey and finished with feta, are the reason people ask for the recipe.',image:'assets/img/collabs/hellofresh/03.jpg',link:'https://www.hellofresh.com/recipes/chimichurri-lamb-and-hot-honey-brussels-sprouts-69f21d783ace2ca2f08f08ba'},
    {name:"Turkey & Mushroom Shepherd's Pie",tag:'The weekly',note:'A lighter shepherd’s pie that still eats like the original.',time:'50 minutes',ingredients:['Ground turkey','Button mushrooms','Mashed potatoes','White cheddar','Fresh thyme'],story:'Meaty mushrooms stand in for the beef nobody misses. Broiled cheddar on top, a spoon that goes straight through to the bottom of the dish.',image:'assets/img/collabs/hellofresh/04.jpg',link:'https://www.hellofresh.com/recipes/turkey-mushroom-shepherd-s-pie-649c8b124387a88e63f51410'}
  ];
  function cookbook(spot) {
    begin('book','Five recipes. One standing invitation.',spot);
    let page=0;
    const checked = recipes.map(()=>new Set());
    function draw() {
      const r=recipes[page];
      fill(`<div class="ae-book-nav" aria-label="Recipe chapters">${recipes.map((r,i)=>`<button data-action="chapter" data-index="${i}" aria-pressed="${i===page}">${num(i+1)} · ${esc(r.tag)}</button>`).join('')}</div><div class="ae-book is-turning"><section class="ae-page"><span class="ae-kicker ae-kicker--brand"><span class="ae-brand-chip"><img src="assets/img/brand-logos/hellofresh.png" alt="HelloFresh"></span> × Paris Pullen · The house edit</span><div class="ae-book-mark">${num(page+1)}</div><h3>${esc(r.name)}</h3><p><em>${esc(r.note)}</em></p><p>${esc(r.story)}</p><span class="ae-page-number">${num(page*2+1)}</span></section><section class="ae-page"><span class="ae-kicker">On the counter</span><h3>${esc(r.time)}</h3><ul class="ae-ingredients">${r.ingredients.map((v,i)=>`<li><label><input type="checkbox" data-ingredient="${i}" ${checked[page].has(i)?'checked':''}>${esc(v)}</label></li>`).join('')}</ul>${saveButton('recipe:'+page)}<span class="ae-page-number">${num(page*2+2)}</span></section></div><div class="ae-book-controls"><button class="ae-small" data-action="previous" ${page===0?'disabled':''}>← Turn back</button><span aria-live="polite">Recipe ${page+1} of ${recipes.length} · Swipe or use arrows</span><button class="ae-small" data-action="next" ${page===recipes.length-1?'disabled':''}>Turn the page →</button></div>${actions(goButton('study','Find the Cocktail Guide')+`<a class="ae-action ae-action--quiet" href="${esc(r.link)}" target="_blank" rel="noopener">Get this recipe ↗</a>`+'<a class="ae-action ae-action--quiet" href="pantry.html">Visit the Pantry ↗</a>')}`);
      $$('.ae-ingredients input',dialog).forEach(input=>input.addEventListener('change',()=>{ const i=Number(input.dataset.ingredient); input.checked?checked[page].add(i):checked[page].delete(i); }));
    }
    sequence = direction => { const next=Math.max(0,Math.min(recipes.length-1,page+direction));if(next!==page){page=next;draw();} };
    actionHandlers.previous=()=>sequence(-1);actionHandlers.next=()=>sequence(1);
    actionHandlers.chapter=b=>{page=Number(b.dataset.index);draw();};
    draw();
  }
  function capsule(spot, panel, isOxknit) {
    begin('capsule',isOxknit?'Knit into the evening.':'What he reaches for.',spot);
    const items=isOxknit?[
      ['British-Style Jacquard Knit','Double-breasted, ribbed, cut like a peacoat that decided knitwear was faster to put on.','assets/img/collabs/oxknit/00.jpg','https://www.oxknit.com/collections/men-s-new-in/products/mens-minimalist-british-style-jacquard-knit-cardigan'],
      ['Black Houndstooth Cardigan','Houndstooth in black and cream, doing what a print usually can’t — reading as restraint instead of noise.','assets/img/collabs/oxknit/01.jpg','https://www.oxknit.com/collections/men-s-new-in/products/mens-retro-black-houndstooth-classic-jacquard-knit-cardigan'],
      ['Abstract Check Cardigan','A check that looks like it’s been through one too many wash cycles on purpose.','assets/img/collabs/oxknit/02.jpg','https://www.oxknit.com/collections/men-s-new-in/products/mens-1960s-mod-abstract-check-jacquard-knit-cardigan'],
      ['Green Minimalist Cardigan','Forest green, shawl collar, worn open over nothing on nights that don’t need a tie to prove anything. Discovered on the stairs in the Living Room.','assets/img/collabs/oxknit/03.jpg','https://www.oxknit.com/collections/men-s-new-in/products/mens-retro-green-artistic-minimalist-jacquard-cardigan'],
      ['Collegiate Striped Polo','Yellow and navy stripes, a rowing-club energy he never actually earned.','assets/img/collabs/oxknit/04.jpg','https://www.oxknit.com/collections/men-s-new-in/products/mens-yellow-60s-mod-vintage-collegiate-striped-polo-knit-sweater'],
      ['Retro Minimalist Cardigan','Black, cropped collar, the kind of quiet you have to look twice to notice is expensive.','assets/img/collabs/oxknit/05.jpg','https://www.oxknit.com/collections/men-s-new-in/products/mens-black-70s-retro-minimalist-knitted-cardigan'],
      ['British Collegiate Plaid Cardigan','Blue and mustard plaid, built like a letterman’s jacket had a quieter, older cousin.','assets/img/collabs/oxknit/06.jpg','https://www.oxknit.com/collections/men-s-new-in/products/mens-vintage-british-collegiate-plaid-jacquard-knit-cardigan'],
      ['Pothole Knit V-Neck Polo','Hunter green, a textured knit almost cratered in places. Cut for colder work in the Study.','assets/img/collabs/oxknit/07.jpg','https://www.oxknit.com/collections/polo/products/mens-green-vintage-pothole-knit-v-neck-polo-shirt'],
      ['Elbow Patch Knit Polo','Faux leather elbow patches on a knit polo — a contradiction until it holds its shape after the fourth wear.','assets/img/collabs/oxknit/08.jpg','https://www.oxknit.com/collections/men-s-new-in/products/mens-green-vintage-gentleman-faux-leather-elbow-patch-knit-polo-shirt'],
      ['Black Mod Polo, Contrast Tipped','A geometric tipped collar, mod enough for 1967 and 2026 with equal confidence.','assets/img/collabs/oxknit/09.jpg','https://www.oxknit.com/collections/polo/products/men-70s-black-mod-polo-knit-shirt'],
      ['Vintage Cable Knit Polo','Cream cable knit, red and navy at the collar — a classic before he ever put it on.','assets/img/collabs/oxknit/10.jpg','https://www.oxknit.com/collections/men-s-new-in/products/mens-apricot-70s-vintage-cable-knit-polo-shirt'],
      ['Old Money Cable Knit Polo','The same idea in tan, for days that call for something one shade quieter.','assets/img/collabs/oxknit/11.jpg','https://www.oxknit.com/collections/men/products/men-s-70s-retro-old-money-casual-style-knit-polo-collar-t-shirt'],
      ['Collegiate Stripe V-Neck Knit','Cream with navy and red racing stripes down the placket — the closet’s one nod to varsity.','assets/img/collabs/oxknit/12.jpg','https://www.oxknit.com/collections/men-s-new-in/products/mens-vintage-brown-classic-check-jacquard-knit-cardigan'],
      ['Retro Cream, Green Striped Trim','Cream with a green-and-navy striped collar, open at the throat for the five degrees between too warm and too cool.','assets/img/collabs/oxknit/13.jpg','https://www.oxknit.com/collections/men/products/men-vintage-1970s-knit-polo-shirt-cream-green']
    ]:[
      ['Herringbone Tweed Jacket','Sage herringbone, boxy collar, worn top to bottom as its own matching set.','assets/img/collabs/fashion-nova/00.jpg','https://www.fashionnova.com/products/herringbone-tweed-jacket?color=hunter-green'],
      ['Tapestry Skyline Work Jacket','A city dissolving into a sunset gradient, printed edge to edge across denim.','assets/img/collabs/fashion-nova/01.jpg','https://www.fashionnova.com/products/cropped-tapestry-skyline-work-jacket?color=blue'],
      ['Tapestry Trucker Jacket','A floral tapestry nobody else in the room would try, over cream cargo shorts.','assets/img/collabs/fashion-nova/02.jpg','https://www.fashionnova.com/products/all-you-need-is-tapestry-trucker-jacket?color=green-combo'],
      ['Patch Jacket','Grey houndstooth and herringbone pieced into one jacket.','assets/img/collabs/fashion-nova/03.jpg','https://www.fashionnova.com/products/theyre-satisfied-patch-jacket?color=grey'],
      ['Duke Textured Bomber','Hunter green, quilted, cream ribbing at the collar and cuffs.','assets/img/collabs/fashion-nova/04.jpg','https://www.fashionnova.com/products/duke-textured-bomber-jacket?color=green'],
      ['Beverly Tweed Trucker','Brown basketweave tweed, cream stitching traced through every seam.','assets/img/collabs/fashion-nova/05.jpg','https://www.fashionnova.com/products/beverly-tweed-contrasting-stitch-trucker-jacket?color=brown'],
      ['Teddy Varsity Sherpa','Camel shearling, navy-striped ribbing, built like a letterman jacket for a colder winter.','assets/img/collabs/fashion-nova/06.jpg','https://www.fashionnova.com/products/teddy-varsity-sherpa-jacket?color=taupe']
    ];
    let selected=0;
    function draw() {
      const p=items[selected];
      fill(`<span class="ae-kicker ae-kicker--brand"><span class="ae-brand-chip"><img src="${isOxknit?'assets/img/brand-logos/oxknit.png':'assets/img/brand-logos/fashion-nova.png'}" alt="${isOxknit?'OXKNIT':'Fashion Nova'}"></span> × Paris Pullen · Collection preview</span><p class="ae-lede">A capsule discovered in the room, pulled from the rail one piece at a time.</p><div class="ae-rail">${items.map((p,i)=>`<button class="ae-hanger" data-action="piece" data-index="${i}" aria-pressed="${selected===i}"><img src="${esc(p[2])}" alt="${esc(p[0])}" loading="lazy"><span>${esc(p[0])}</span><small>THE HOUSE EDIT</small></button>`).join('')}</div><div class="ae-selected"><img src="${esc(p[2])}" alt="${esc(p[0])}"><div><h3>${esc(p[0])}</h3><p class="ae-lede">${esc(p[1])}</p></div>${actions(saveButton((isOxknit?'oxknit:':'fashionnova:')+selected)+`<a class="ae-action ae-action--quiet" href="${esc(p[3])}" target="_blank" rel="noopener">Shop the piece ↗</a>`)}</div>${actions(goButton(isOxknit?'study':'closet',isOxknit?'Find it in the Study':'Upstairs to the Closet')+`<a class="ae-action ae-action--quiet" href="${isOxknit?'oxknit.html':'off-duty.html'}">Read the full capsule ↗</a>`)}`);
    }
    actionHandlers.piece=b=>{selected=Number(b.dataset.index);draw();};
    sequence=d=>{selected=(selected+d+items.length)%items.length;draw();};draw();
  }
  function reading(spot,panel,key) {
    begin('book',key==='cocktails'?'The evening, in six cards.':key==='pullenlaws'?'The Pullen Laws.':'Pages from the house.',spot);
    const title=$('.drawer__name',panel)?.textContent || 'The Journal';
    const body=$('.drawer__body > p',panel)?.textContent || '';
    const link=key==='journal'?'<a class="ae-action" href="journal.html">Open the current issue ↗</a>':goButton('kitchen','See what is on the menu');
    fill(`<div class="ae-book"><section class="ae-page"><span class="ae-kicker">The Study · Private reading</span><div class="ae-book-mark">PP</div><h3>${esc(title)}</h3><p>${esc(body)}</p></section><section class="ae-page"><span class="ae-kicker">A note in the margin</span><h3>${key==='cocktails'?'The table is part of the recipe.':key==='pullenlaws'?'Some pages stay unwritten.':'Something worth keeping.'}</h3><p>${key==='pullenlaws'?'The room tells you there are fourteen laws. Their full text has not been supplied, so this edition preserves the mystery.':key==='cocktails'?'The full six-drink collection is still to be authored. For tonight, start in the Kitchen, then bring the conversation back here.':'Read the dispatches in the Journal. Save this object as the way back to them.'}</p>${actions(link+saveButton(spot.dataset.artifact))}</section></div>`);
  }
  async function records(spot) {
    const token=begin('record','A room made for listening.',spot);
    try {
      const items=await data('data/house-music.json');
      if(token!==generation||!dialog.open)return;
      let selected=0;
      function draw(){
        const item=items[selected];
        const artwork=item.art?`<img class="ae-record-art" src="${esc(item.art)}" alt="" loading="eager">`:`<span class="ae-record-label">${esc(item.artLabel||'PP')}</span>`;
        const shelfArt=p=>p.art?`<img src="${esc(p.art)}" alt="" loading="lazy">`:`<span class="ae-sleeve-art ae-sleeve-art--${esc(p.artTone||'black')}"><b>${esc(p.artLabel||'PP')}</b></span>`;
        fill(`<div class="ae-split"><div class="ae-record-wrap"><div class="ae-record" data-tone="${esc(item.artTone||'black')}" aria-hidden="true">${artwork}</div><span class="ae-record-caption">${selected===0?'THE HOUSE MIX':'SELECTED RECORD'} · ${esc(item.type)}</span></div><div><span class="ae-kicker">The Music Lounge · The listening shelf</span><h3>${esc(item.label)}</h3><p class="ae-lede">Pull a record from the shelf, then open it on Spotify to listen.</p>${actions(`<a class="ae-action" href="https://open.spotify.com/${esc(item.type)}/${esc(item.id)}" target="_blank" rel="noopener">Open this record in Spotify ↗</a>`+saveButton('record:'+item.id))}<p class="ae-note">The room’s Drake collection is curated by @djangodegree.</p></div></div><div class="ae-sleeves" aria-label="Record shelf">${items.map((p,i)=>`<button class="ae-sleeve" data-action="record" data-index="${i}" aria-pressed="${selected===i}">${shelfArt(p)}<span class="ae-sleeve-copy"><small>SIDE ${num(i+1)} · ${esc(p.type)}</small><b>${esc(p.label)}</b><small>${selected===i?'ON THE TABLE':'PULL THE RECORD ↗'}</small></span></button>`).join('')}</div>`);
      }
      actionHandlers.record=b=>{selected=Number(b.dataset.index);draw();};
      sequence=d=>{selected=(selected+d+items.length)%items.length;draw();};draw();
    } catch (_) {fill('<p>The record shelf is unavailable. Use the room remote to control its soundtrack.</p>',token);}
  }
  async function cinema(spot, key='cinema') {
    const token=begin('cinema',key==='cinema'?'Tonight, in the screening room.':'An evening on the television.',spot);
    try{
      const fallback=await data('data/house-channels.json');
      if(token!==generation||!dialog.open)return;
      const channels=window.PPTheatre?.channels(key) || fallback[key] || [];
      fill(`<span class="ae-kicker">${key==='cinema'?'The Cinema · Level 26':'The Living Room · Level 27'}</span><p class="ae-lede">Choose the programme. The lights fall, the screen opens, and the room becomes yours.</p><div class="ae-film-list">${channels.map((ch,i)=>`<button class="ae-film" data-action="watch" data-id="${esc(ch.id)}"><img src="https://i.ytimg.com/vi/${esc(ch.id)}/hqdefault.jpg" alt="" loading="lazy"><span><strong>${esc(ch.label)}</strong><small>PROGRAMME ${num(i+1)} · OPEN THE SCREEN</small></span><span aria-hidden="true">▶</span></button>`).join('')}</div><p class="ae-note" data-screen-status role="status">Selections come from the current house programme. Playback is provided by YouTube.</p>${actions(goButton(key==='cinema'?'music-lounge':'cinema',key==='cinema'?'An after-film record':'Downstairs to the Cinema'))}`);
      actionHandlers.watch=b=>{const id=b.dataset.id;close();if(!window.PPTheatre?.watch(key,id)){cinema(spot,key);}};
    }catch(_){fill('<p>The programme is unavailable. The room remote still has its channel guide.</p>',token);}
  }
  function ritual(spot){
    begin('ritual','Leave the day at the door.',spot);
    fill(`<div class="ae-split"><div>${focusMarkup(current(),spot,'The evening ritual')}</div><div><span class="ae-kicker">The Bathroom · A moment to yourself</span><p class="ae-lede">Three moments, chosen slowly. A ritual tray for future grooming, fragrance and linen collaborations.</p><div class="ae-ritual"><button data-action="ritual" aria-pressed="false"><strong>01 · Unwind</strong><span>Warm stone, quiet light. Start with a breath.</span></button><button data-action="ritual" aria-pressed="false"><strong>02 · Reset</strong><span>The vanity, cleared to the essentials.</span></button><button data-action="ritual" aria-pressed="false"><strong>03 · Return</strong><span>Choose what the rest of the evening feels like.</span></button></div>${actions(goButton('bedroom','Back to the Bedroom')+saveButton('bath:ritual'))}<p class="ae-note">A house ritual concept. No grooming products or brand availability are implied.</p></div></div>`);
    actionHandlers.ritual=b=>{ $$('.ae-ritual button',dialog).forEach(el=>el.setAttribute('aria-pressed',String(el===b)));$('.ae-focus',dialog).style.setProperty('--ae-zoom',['1.2','1.6','1'].at($$('.ae-ritual button',dialog).indexOf(b))); };
  }
  function blueprintPortal(spot) {
    const existing = document.getElementById('blueprint-room-portal');
    if (existing) { existing.showModal(); return; }
    const portal = document.createElement('dialog');
    portal.id = 'blueprint-room-portal';
    portal.className = 'ae-dialog';
    portal.innerHTML = '<header class="ae-header"><div class="ae-brand"><span class="foxx" aria-hidden="true"></span><span class="ae-kicker">THE BLUEPRINT · PARIS PULLEN</span></div><button class="ae-close" type="button">Return to room ×</button></header><iframe title="The Blueprint wardrobe game" src="/blueprint.html?embed=1" style="display:block;width:100%;height:calc(100% - 58px);min-height:72vh;border:0;background:#0a0a0b"></iframe>';
    document.body.appendChild(portal);
    portal.querySelector('.ae-close').addEventListener('click', () => portal.close());
    portal.addEventListener('click', event => { if (event.target === portal) portal.close(); });
    portal.addEventListener('close', () => { portal.remove(); if (spot?.isConnected) spot.focus({preventScroll:true}); });
    portal.showModal();
  }
  function openArtifact(spot){
    const room=spot.closest('.floor-scene');
    const id=spot.dataset.artifact;
    const panel=$$('.drawer__panel',room).find(p=>p.dataset.artifact===id);
    if(!panel)return false;
    const key=id;
    if(key==='hellofresh')cookbook(spot);
    else if((room.id==='closet'&&key==='suits')||key==='suit')blueprintPortal(spot);
    else if(key.includes('oxknit'))capsule(spot,panel,true);
    else if(key==='jacket'||key==='polo')capsule(spot,panel,false);
    else if(key==='recordplayer')records(spot);
    else if(key==='posters')cinema(spot);
    else if(['journal','cocktails','pullenlaws'].includes(key))reading(spot,panel,key);
    else gallery(spot,panel,key);
    return true;
  }
  // Capture only objects with known content. Existing city, vault and gym portals
  // retain their independent handlers; no blanket preventDefault on room links.
  document.addEventListener('click',e=>{
    const spot=e.target.closest('.artifact[data-artifact]');
    if(spot && openArtifact(spot)){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  const vanity = $('#bath .artifacts');
  if (vanity) {
    const tray=document.createElement('button');
    tray.type='button';tray.className='artifact';tray.style.cssText='--x:14%;--y:44%';
    tray.innerHTML='<span class="artifact__dot" aria-hidden="true"></span><span class="artifact__label">The Ritual Tray</span>';
    tray.addEventListener('click',()=>ritual(tray));vanity.appendChild(tray);
  }
  const toolbar=document.createElement('div');
  toolbar.className='ae-toolbar';
  toolbar.setAttribute('aria-label','Explore the hotel');
  toolbar.innerHTML='<button type="button" data-floors aria-haspopup="dialog" aria-controls="artifact-experience">Floors</button>';
  document.body.appendChild(toolbar);
  function navigationTabs(active){
    const tabs=[['directory','Floors & rooms'],['explore','In this room'],['stay','Your stay']];
    const nav=document.createElement('div');nav.className='ae-tabs';nav.setAttribute('aria-label','Browse the hotel');
    nav.innerHTML=tabs.map(([id,label])=>`<button class="ae-tab" data-action="nav-${id}" aria-pressed="${id===active}">${label}</button>`).join('');
    $('.ae-body',dialog).prepend(nav);
    actionHandlers['nav-directory']=directory;actionHandlers['nav-explore']=explore;actionHandlers['nav-stay']=stay;
  }
  function explore(){
    const room=current();if(!room)return;
    const spots=$$('.artifact',room);
    begin('directory',roomName(room),$('[data-floors]',toolbar));
    fill(`<p class="ae-lede">Every object has a way in. Choose something that catches your eye.</p><div class="ae-objects">${spots.map((s,i)=>`<button class="ae-object" data-action="object" data-index="${i}"><small>${num(i+1)} · ${s.matches('a')?'Step outside':s.hasAttribute('data-gym-portal')?'Play':s.hasAttribute('data-tv-remote-toggle')?'Listen / watch':'Explore'}</small><span>${esc($('.artifact__label',s)?.textContent||s.getAttribute('aria-label')||s.textContent.trim())}</span></button>`).join('')}${['cinema','penthouse-living'].includes(room.id)?'<button class="ae-object" data-action="programme"><small>Now showing</small><span>Choose a programme</span></button>':''}</div>`);
    navigationTabs('explore');
    actionHandlers.object=b=>{const s=spots[Number(b.dataset.index)];close();s.click();};
    actionHandlers['ritual-open']=()=>ritual($('[data-floors]',toolbar));
    actionHandlers.programme=()=>cinema($('[data-floors]',toolbar),room.id==='cinema'?'cinema':'living');
  }
  function directory(){
    begin('directory','The Floors',$('[data-floors]',toolbar));
    const rooms=$$('.floor-scene');
    fill(`<p class="ae-lede">Three floors. Nine rooms. Follow an object, a sound, or your curiosity.</p><div class="ae-room-grid">${rooms.map(r=>`<button class="ae-room-card" data-room="${esc(r.id)}" aria-current="${r===current()?'location':'false'}"><img src="${esc(roomImage(r))}" alt="" loading="lazy"><span><small>${esc($('.floor-plate__level',r)?.textContent||r.getAttribute('aria-label')?.match(/Level \d+/)?.[0]||'The Penthouse')}</small>${esc(roomName(r))}</span></button>`).join('')}</div>`);
    navigationTabs('directory');
  }
  $('[data-floors]',toolbar).addEventListener('click',directory);
  function stay(){
    begin('directory','Take a little of the house with you.',$('[data-floors]',toolbar));
    const entries=[...saved].map(id=>({id,...(savedDetails[id]||{title:id,room:'penthouse-living'})}));
    fill(`<p class="ae-lede">${entries.length?'Your saved objects, recipes and records. Return to the room where you found them.':'An empty valet tray, for now. Save a garment, a recipe or a record as you explore.'}</p><div class="ae-objects">${entries.map(item=>`<button class="ae-object" data-room="${esc(item.room)}"><small>Return to ${esc(roomName(document.getElementById(item.room)||current()))}</small><span>${esc(item.title)}</span></button>`).join('')}</div><p class="ae-note">Saved on this browser, for this stay.</p>`);
    navigationTabs('stay');
  }
  document.addEventListener('pp:room-change',e=>{
    close();
    if (location.hash !== '#'+e.detail.id) history.replaceState(null,'','#'+e.detail.id);
    // Offscreen rooms must not remain in keyboard and screen-reader navigation.
    $$('.floor-scene').forEach(r=>{r.inert=r.id!==e.detail.id;});
  });
  if(current())$$('.floor-scene').forEach(r=>{r.inert=r!==current();});
})();
