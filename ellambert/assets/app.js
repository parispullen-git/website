/* ============================================================
   EL LAMBERT — site behaviour
   Shared across every page.
   ============================================================ */

/* ------------------------------------------------------------
   SHOWS — the only thing you normally edit.
   Anything on/after today renders under "Upcoming"; older rows
   drop into "Previous events" automatically. Only rendered on
   pages that have #ev-upcoming / #ev-past (shows.html).
   Set `ticket` to a URL to turn "Enquire" into "Tickets".
   ------------------------------------------------------------ */
const EVENTS = [
  { date:'2026-08-15', title:'The Fellowship Soul Sessions: Stellar Award After-Show Experience', venue:'Elegance by Event Masterz', city:'316 Remount Road, Charlotte, NC',
    note:'Hosted by El Lambert — gospel culture, soulful artistry and community', img:'assets/img/ev-fellowship.jpg', ticket:null },
  { date:'2026-06-26', title:'The El Lambert Experience (General Admission &amp; VIP)', venue:'Elegance by Event Masterz', city:'316 Remount Road, Charlotte, NC',
    note:'An Evening of Music &amp; Storytelling — fresh off the single "Calling Me"', img:'assets/img/ev-el-experience.png', ticket:null },
  { date:'2024-10-27', title:'Gospel Melodies Day Party', venue:'Harlem Nights Charlotte', city:'Charlotte, NC',
    note:'Gospel, R&amp;B, Holy Hip-Hop and Rhythm &amp; Praise', img:'assets/img/ev-generic.jpg', ticket:null },
  { date:'2024-02-21', title:'Sound Stage Live Open Mic (Weekly)', venue:'Section Charlotte', city:'832 Seigle Ave, Charlotte, NC',
    note:'Live band, DJ and interactive games', img:'assets/img/ev-generic.jpg', ticket:null },
  { date:'2024-02-14', title:'Sound Stage Live Open Mic (Weekly)', venue:'Section Charlotte', city:'832 Seigle Ave, Charlotte, NC',
    note:'Live band, DJ and interactive games', img:'assets/img/ev-generic.jpg', ticket:null },
  { date:'2024-02-07', title:'Sound Stage Live Open Mic (Weekly)', venue:'Section Charlotte', city:'832 Seigle Ave, Charlotte, NC',
    note:'Live band, DJ and interactive games', img:'assets/img/ev-generic.jpg', ticket:null },
  { date:'2024-02-02', title:'Rail Trail Lights Opening Night', venue:'Atherton Mill', city:'South Blvd, Charlotte, NC',
    note:'Community celebration along the Rail Trail', img:'assets/img/ev-rail-trail.png', ticket:null },
  { date:'2024-01-31', title:'Sound Stage Live Open Mic (Weekly)', venue:'Section Charlotte', city:'832 Seigle Ave, Charlotte, NC',
    note:'Live band, DJ and interactive games', img:'assets/img/ev-generic.jpg', ticket:null },
  { date:'2024-01-24', title:'Sound Stage Live Open Mic (Weekly)', venue:'Section Charlotte', city:'832 Seigle Ave, Charlotte, NC',
    note:'Live band, DJ and interactive games', img:'assets/img/ev-generic.jpg', ticket:null },
  { date:'2024-01-17', title:'Sound Stage Live Open Mic (Weekly)', venue:'Section Charlotte', city:'832 Seigle Ave, Charlotte, NC',
    note:'Live band, DJ and interactive games', img:'assets/img/ev-generic.jpg', ticket:null },
  { date:'2023-12-28', title:"Let's Make Music: A Pop-Up Jam Session", venue:'Rozzelles Ferry Landing', city:'Charlotte, NC',
    note:'Pop-up jam session with Nero Tindal IV', img:'assets/img/ev-lets-make-music.png', ticket:null }
];

(function renderEvents(){
  const up = document.getElementById('ev-upcoming');
  const past = document.getElementById('ev-past');
  const empty = document.getElementById('ev-empty');
  if(!up || !past) return;

  const today = new Date(); today.setHours(0,0,0,0);
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const rows = EVENTS.map(e=>{
    const [y,m,d] = e.date.split('-').map(Number);
    return {...e, _d:new Date(y,m-1,d), _mon:MON[m-1], _day:String(d).padStart(2,'0'), _yr:y};
  });
  let upcoming = rows.filter(e=>e._d >= today).sort((a,b)=>a._d-b._d);
  let previous = rows.filter(e=>e._d <  today).sort((a,b)=>b._d-a._d);

  const upLimit = parseInt(up.dataset.limit, 10);
  if(upLimit) upcoming = upcoming.slice(0, upLimit);
  const pastLimit = parseInt(past.dataset.limit, 10);
  if(pastLimit) previous = previous.slice(0, pastLimit);

  const li = (e,isPast)=>{
    const cta = isPast ? ''
      : (e.ticket
          ? `<a class="ev__cta" href="${e.ticket}" target="_blank" rel="noopener">Tickets<svg class="btn__arrow"><use href="#ic-arrow"/></svg></a>`
          : `<a class="ev__cta" href="booking.html">Enquire</a>`);
    return `<li><div class="ev">
      <div class="ev__thumb">${e.img?`<img src="${e.img}" alt="" loading="lazy">`:''}</div>
      <div class="ev__date"><b>${e._day}</b>${e._mon} ${e._yr}</div>
      <div><h3 class="ev__title">${e.title}</h3>${e.note?`<p class="ev__venue" style="margin-top:.4rem">${e.note}</p>`:''}</div>
      <div class="ev__venue">${e.venue} — ${e.city}</div>
      ${cta}
    </div></li>`;
  };

  up.innerHTML = upcoming.map(e=>li(e,false)).join('');
  past.innerHTML = previous.map(e=>li(e,true)).join('');
  if(empty) empty.hidden = upcoming.length > 0;
  if(!upcoming.length) up.style.display = 'none';
})();

/* ---------- sticky nav ---------- */
const nav = document.getElementById('nav');
if(nav){
  const onScroll = ()=> nav.classList.toggle('is-stuck', window.scrollY > 40);
  onScroll();
  addEventListener('scroll', onScroll, {passive:true});

  /* ---------- mobile menu ---------- */
  const toggle = document.querySelector('.nav__toggle');
  toggle?.addEventListener('click', ()=>{
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.nav__links a').forEach(a=>{
    a.addEventListener('click', ()=>{
      nav.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded','false');
    });
  });
}

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); }
  });
},{rootMargin:'0px 0px -8% 0px', threshold:.06});
document.querySelectorAll('.reveal').forEach((el,i)=>{
  el.style.transitionDelay = `${Math.min(i%6,5)*70}ms`;
  io.observe(el);
});

/* ---------- newsletter (front-end only — needs a real handler) ---------- */
const newsForm = document.getElementById('news-form');
newsForm?.addEventListener('submit', e=>{
  e.preventDefault();
  const note = newsForm.parentElement.querySelector('.news__note');
  newsForm.innerHTML = '<p style="color:var(--brass);font-size:.9375rem;text-align:center;width:100%">Thanks — you\'re on the list.</p>';
  if(note) note.textContent = 'We\'ll be in touch before the next one.';
});

/* ---------- booking form → mailto handoff ---------- */
const bookForm = document.getElementById('book-form');
bookForm?.addEventListener('submit', e=>{
  e.preventDefault();
  const f = new FormData(bookForm);
  const get = k => (f.get(k) || '').toString().trim();
  const lines = [
    `Name: ${get('name')}`,
    `Email: ${get('email')}`,
    `Phone: ${get('phone')}`,
    `Event date: ${get('date')}`,
    `Event type: ${get('type')}`,
    `Looking to book: ${get('group')}`,
    `Budget: ${get('budget')}`,
    '',
    `Musical / entertainment needs:`,
    get('needs'),
    '',
    `Special requests:`,
    get('notes')
  ].join('\n');
  const subject = encodeURIComponent(`Booking inquiry — ${get('type') || 'Event'}`);
  const body = encodeURIComponent(lines);
  window.location.href = `mailto:booking@ellambert.com?subject=${subject}&body=${body}`;
});

/* ---------- prefill booking form event type from ?type= query param ---------- */
(function prefillBooking(){
  const sel = document.getElementById('book-type');
  if(!sel) return;
  const type = new URLSearchParams(location.search).get('type');
  if(type){
    const opt = Array.from(sel.options).find(o=> o.value.toLowerCase() === type.toLowerCase());
    if(opt) sel.value = opt.value;
  }
})();

/* ---------- footer year ---------- */
const yr = document.getElementById('yr');
if(yr) yr.textContent = new Date().getFullYear();
