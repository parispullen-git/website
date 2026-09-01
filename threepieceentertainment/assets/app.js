/* ============================================================
   THREE PIECE ENTERTAINMENT — site behaviour
   Shared by index.html and harvey.html
   ============================================================ */

/* ------------------------------------------------------------
   EVENTS — the only thing you normally edit.
   Anything on/after today renders under "Events"; older rows
   drop into "Recent highlights" automatically.
   Set `ticket` to a URL to turn "Enquire" into "Tickets".
   ------------------------------------------------------------ */
const EVENTS = [
  // —— VERIFIED PAST DATES ——
  { date:'2026-05-16', title:'SMOOTH — A Tribute to D’Angelo', venue:'Carolina Theatre', city:'Charlotte, NC',
    note:'13-piece orchestra with Sol Kitchen', ticket:null },
  { date:'2026-04-30', title:'International Jazz Day', venue:'Middle C Jazz', city:'Charlotte, NC',
    note:'Jazz Appreciation Month closing night', ticket:null },

  // —— UPCOMING: REPLACE WITH REAL CONFIRMED DATES ——
  { date:'2026-10-03', title:'The Only Child — Listening Party', venue:'Venue TBC', city:'Charlotte, NC',
    note:'Album preview, live set', ticket:null },
  { date:'2026-11-14', title:'An Evening with Harvey Cummings II', venue:'Venue TBC', city:'Atlanta, GA',
    note:'Quartet', ticket:null }
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
  const upcoming = rows.filter(e=>e._d >= today).sort((a,b)=>a._d-b._d);
  const previous = rows.filter(e=>e._d <  today).sort((a,b)=>b._d-a._d).slice(0,5);

  const li = (e,isPast)=>{
    const cta = isPast ? ''
      : (e.ticket
          ? `<a class="ev__cta" href="${e.ticket}" target="_blank" rel="noopener">Tickets<svg class="btn__arrow"><use href="#ic-arrow"/></svg></a>`
          : `<a class="ev__cta" href="#book">Enquire</a>`);
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

/* ---------- now playing ---------- */
(function nowPlaying(){
  const bar  = document.getElementById('nowplaying');
  const btn  = document.getElementById('np-btn');
  const icon = document.getElementById('np-icon');
  if(!bar || !btn) return;

  // Drop an audio file at assets/audio/chicken-day.mp3 to enable playback.
  const TRACK = 'assets/audio/chicken-day.mp3';
  let audio = null, playing = false;

  // Only reveal the widget if the track actually exists.
  fetch(TRACK, {method:'HEAD'}).then(r=>{
    if(!r.ok) return;
    bar.hidden = false;
    setTimeout(()=>bar.classList.add('is-in'), 1200);
  }).catch(()=>{});

  btn.addEventListener('click', ()=>{
    if(!audio){ audio = new Audio(TRACK); audio.loop = true; audio.volume = .7;
      audio.addEventListener('ended', stop); }
    playing ? stop() : start();
  });
  function start(){ audio.play().then(()=>{
      playing = true; bar.classList.add('is-playing');
      icon.innerHTML = '<use href="#ic-pause"/>'; btn.setAttribute('aria-label','Pause Chicken Day');
    }).catch(()=>{}); }
  function stop(){ audio.pause(); playing = false; bar.classList.remove('is-playing');
    icon.innerHTML = '<use href="#ic-play"/>'; btn.setAttribute('aria-label','Play Chicken Day'); }
})();

/* ---------- footer year ---------- */
document.getElementById('yr').textContent = new Date().getFullYear();
