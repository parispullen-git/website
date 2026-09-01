/* ============================================================
   HARVEY CUMMINGS II — site behaviour
   ============================================================ */

/* ------------------------------------------------------------
   EVENTS  —  the only thing you need to edit to update the site.
   Add a row per date. Anything on/after today renders under
   "Upcoming"; anything older drops into "Recent highlights"
   automatically. Set `ticket` to null for a non-ticketed date.
   ------------------------------------------------------------ */
const EVENTS = [
  // —— VERIFIED PAST DATES ——
  { date:'2026-05-16', title:'SMOOTH — A Tribute to D’Angelo', venue:'Carolina Theatre', city:'Charlotte, NC',
    note:'Leading a 13-piece orchestra with Sol Kitchen', ticket:null },
  { date:'2026-04-30', title:'International Jazz Day', venue:'Middle C Jazz', city:'Charlotte, NC',
    note:'Jazz Appreciation Month closing night', ticket:null },

  // —— UPCOMING: REPLACE THESE WITH REAL CONFIRMED DATES ——
  { date:'2026-10-03', title:'The Only Child — Album Release', venue:'Venue TBC', city:'Charlotte, NC',
    note:'Debut album release performance', ticket:null },
  { date:'2026-11-14', title:'An Evening with Harvey Cummings II', venue:'Venue TBC', city:'Atlanta, GA',
    note:'Quartet', ticket:null }
];

/* ---------- render events ---------- */
(function renderEvents(){
  const up = document.getElementById('ev-upcoming');
  const past = document.getElementById('ev-past');
  const empty = document.getElementById('ev-empty');
  if(!up || !past) return;

  const today = new Date(); today.setHours(0,0,0,0);
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const rows = EVENTS.map(e=>{
    const [y,m,d] = e.date.split('-').map(Number);
    return {...e, _d:new Date(y, m-1, d), _mon:MON[m-1], _day:String(d).padStart(2,'0'), _yr:y};
  });

  const upcoming = rows.filter(e=>e._d >= today).sort((a,b)=>a._d-b._d);
  const previous = rows.filter(e=>e._d <  today).sort((a,b)=>b._d-a._d).slice(0,5);

  const li = (e,isPast)=>{
    const cta = isPast
      ? ''
      : (e.ticket
          ? `<a class="ev__cta" href="${e.ticket}" target="_blank" rel="noopener">Tickets<svg class="btn__arrow"><use href="#ic-arrow"/></svg></a>`
          : `<a class="ev__cta" href="#booking">Enquire</a>`);
    return `<li><div class="ev">
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

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); }
  });
},{rootMargin:'0px 0px -8% 0px', threshold:.06});

document.querySelectorAll('.reveal').forEach((el,i)=>{
  el.style.transitionDelay = `${Math.min(i%6,5)*70}ms`;
  io.observe(el);
});

/* ---------- footer year ---------- */
document.getElementById('yr').textContent = new Date().getFullYear();
