/* ============================================================
   EL LAMBERT — proposal engine
   Reads window.PROPOSAL (defined inline in each proposal page)
   and wires up: countdown, tier select, agreement gate,
   payment hand-off, exit-intent recovery modal, paid/expired states.
   ============================================================ */
(function(){
'use strict';

const P = window.PROPOSAL;
if(!P){ console.warn('[proposal] no window.PROPOSAL found'); return; }

const KEY   = 'elp_proposal_' + P.id;
const $     = (s,r)=> (r||document).querySelector(s);
const $$    = (s,r)=> Array.from((r||document).querySelectorAll(s));
const money = n => '$' + n.toLocaleString('en-US');

/* ---------- state (per browser, per proposal) ---------- */
let state = {agreedTier:null, paidTier:null, exitShown:false};
try{ Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); }catch(e){}
const save = ()=>{ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} };

/* ---------- returning from a payment link ---------- */
const qs = new URLSearchParams(location.search);
if(qs.get('paid') === '1'){
  state.paidTier = qs.get('tier') || state.agreedTier || 'unknown';
  save();
  history.replaceState({}, '', location.pathname);
}

const expiry  = new Date(P.expires);
const isDead  = ()=> Date.now() > expiry.getTime();
const isPaid  = ()=> !!state.paidTier;

/* ============================================================
   COUNTDOWN
   ============================================================ */
const bar      = $('#pbar');
const barClock = $('#pbar-clock');
const barLabel = $('#pbar-label');
const exitClock= $('#exit-clock');

function parts(ms){
  const s = Math.max(0, Math.floor(ms/1000));
  return {d:Math.floor(s/86400), h:Math.floor(s%86400/3600),
          m:Math.floor(s%3600/60), s:s%60};
}
function tick(){
  const left = expiry.getTime() - Date.now();
  const t = parts(left);
  const dead = left <= 0;

  if(barClock){
    barClock.innerHTML = dead
      ? '<span class="pbar__unit"><b>Expired</b></span>'
      : ['d','h','m','s'].map(u=>
          `<span class="pbar__unit"><b>${String(t[u]).padStart(2,'0')}</b>${u}</span>`).join('');
  }
  if(barLabel) barLabel.textContent = dead ? 'This proposal has expired' : 'Proposal expires in';
  if(bar){
    bar.classList.toggle('is-dead', dead);
    bar.classList.toggle('is-soon', !dead && left < 72*3600*1000);
  }
  if(exitClock){
    exitClock.innerHTML = ['d','h','m','s'].map(u=>
      `<div><b>${String(t[u]).padStart(2,'0')}</b><small>${
        {d:'days',h:'hours',m:'mins',s:'secs'}[u]}</small></div>`).join('');
  }
  if(dead) applyExpired();
}

/* ============================================================
   TIER RENDERING
   ============================================================ */
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const grid = $('#tiers-grid');
const RN = ['I','II','III','IV','V','VI'];

if(grid){
  grid.innerHTML = P.tiers.map((t,i)=>`
    <article class="tier${t.recommended?' tier--pick':''}" data-tier="${t.id}">
      ${t.recommended?'<span class="tier__flag">Recommended</span>':''}
      <span class="tier__rn">${RN[i]||i+1}</span>
      <h3 class="tier__name">${t.name}</h3>
      <p class="tier__price">${money(t.price)}${t.priceNote?`<small>${t.priceNote}</small>`:''}</p>
      ${t.meta?`<p class="tier__meta">${t.meta}</p>`:''}
      ${t.desc?`<p class="tier__desc">${t.desc}</p>`:''}
      ${t.includes?`<ul class="tier__inc">${t.includes.map(x=>`<li>${CHECK}<span>${x}</span></li>`).join('')}</ul>`:'<div style="flex:1"></div>'}
      ${t.best?`<p class="tier__best">${t.best}</p>`:''}
      <button class="btn btn--solid tier__btn" data-select="${t.id}">Select &amp; continue</button>
    </article>`).join('');
}

/* ============================================================
   MODALS
   ============================================================ */
let lastFocus = null;
function open(el){
  lastFocus = document.activeElement;
  el.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  const f = el.querySelector('button,input,a[href]');
  if(f) setTimeout(()=>f.focus(), 60);
}
function close(el){
  el.classList.remove('is-open');
  document.body.style.overflow = '';
  if(lastFocus) lastFocus.focus();
}
addEventListener('keydown', e=>{
  if(e.key === 'Escape') $$('.pmodal.is-open').forEach(close);
});
$$('.pmodal').forEach(m=>{
  m.addEventListener('click', e=>{ if(e.target === m) close(m); });
});
$$('[data-close]').forEach(b=> b.addEventListener('click', ()=> close(b.closest('.pmodal'))));

/* ============================================================
   AGREEMENT → PAYMENT
   ============================================================ */
const agreeModal = $('#agree-modal');
let pendingTier = null;

function selectTier(id){
  if(isDead()) return;
  pendingTier = P.tiers.find(t=>t.id===id);
  if(!pendingTier) return;

  $('#agree-tier').textContent  = pendingTier.name;
  $('#agree-price').textContent = money(pendingTier.price);
  $('#agree-terms').innerHTML   = (P.agreement||[]).map(s=>
    `<h4>${s.h}</h4><p>${s.p}</p>`).join('');

  const box = $('#agree-accept');
  box.checked = false;
  $('#agree-go').disabled = true;
  $$('.pmodal.is-open').forEach(close);
  open(agreeModal);
}

$('#agree-accept')?.addEventListener('change', e=>{
  $('#agree-go').disabled = !e.target.checked;
});

$('#agree-go')?.addEventListener('click', ()=>{
  if(!pendingTier) return;
  state.agreedTier = pendingTier.id;
  save();
  markChosen(pendingTier.id);

  // Hand off to the payment link. `?paid=1&tier=` is appended by the
  // payment provider's success-redirect URL, not by us.
  const url = pendingTier.paymentLink;
  if(!url || url.startsWith('REPLACE')){
    alert('Payment link not configured yet for "'+pendingTier.name+'".\n\n'
        + 'Add a real Stripe Payment Link in the PROPOSAL config, and set its\n'
        + 'success URL to:\n' + location.origin + location.pathname
        + '?paid=1&tier=' + pendingTier.id);
    return;
  }
  window.open(url, '_blank', 'noopener');
  close(agreeModal);
});

function markChosen(id){
  $$('.tier').forEach(el=> el.classList.toggle('is-chosen', el.dataset.tier === id));
}
if(state.agreedTier) markChosen(state.agreedTier);

document.addEventListener('click', e=>{
  const btn = e.target.closest('[data-select]');
  if(btn) selectTier(btn.dataset.select);
});

/* ============================================================
   EXIT INTENT
   ============================================================ */
const exitModal = $('#exit-modal');
const exitTiers = $('#exit-tiers');

if(exitTiers){
  exitTiers.innerHTML = P.tiers.map(t=>`
    <button class="exit__tier" data-select="${t.id}">
      <span><b>${t.name}</b><small>${t.note||''}</small></span>
      <i>${money(t.price)}</i>
    </button>`).join('');
}

function canShowExit(){
  return exitModal && !isPaid() && !state.exitShown
      && !$$('.pmodal.is-open').length;
}
function fireExit(){
  if(!canShowExit()) return;
  state.exitShown = true; save();
  open(exitModal);
}

/* desktop: cursor leaves through the top of the viewport */
let armed = false;
setTimeout(()=>{ armed = true; }, 6000);   // don't ambush on arrival
document.addEventListener('mouseout', e=>{
  if(!armed || e.relatedTarget || e.clientY > 12) return;
  fireExit();
});

/* touch devices have no exit intent — use back-button + tab-hide instead */
if(matchMedia('(hover:none)').matches){
  history.pushState({tpe:1}, '');
  addEventListener('popstate', ()=>{
    if(canShowExit()){ history.pushState({tpe:1}, ''); fireExit(); }
  });
  let hidden = 0;
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'hidden'){ hidden++; }
    else if(hidden >= 2 && armed){ fireExit(); }
  });
}

$('#exit-dismiss')?.addEventListener('click', ()=> close(exitModal));

/* ============================================================
   PAID / EXPIRED STATES
   ============================================================ */
function applyPaid(){
  const t = P.tiers.find(x=>x.id===state.paidTier);
  const box = $('#state-paid');
  if(box){
    box.hidden = false;
    const n = $('#paid-tier');
    if(n) n.textContent = t ? t.name : 'your selection';
  }
  $$('.tier__btn').forEach(b=>{ b.textContent = 'Secured'; b.disabled = true; b.style.opacity = .4; });
  markChosen(state.paidTier);
  if(bar) bar.hidden = true;
}
function applyExpired(){
  const box = $('#state-dead');
  if(box) box.hidden = false;
  $$('.tier__btn').forEach(b=>{
    if(b.disabled) return;
    b.textContent = 'Expired'; b.disabled = true; b.style.opacity = .4;
  });
  $$('.exit__tier').forEach(b=>{ b.disabled = true; b.style.opacity = .4; });
}

if(isPaid())  applyPaid();
if(isDead())  applyExpired();

tick();
setInterval(tick, 1000);

/* ---------- footer year ---------- */
const yr = document.getElementById('yr');
if(yr) yr.textContent = new Date().getFullYear();

})();
