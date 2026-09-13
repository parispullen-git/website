(function(){
  'use strict';
  const lede=document.querySelector('.lib__lede');if(!lede)return;
  const floors=[{n:28,name:'Dress',room:'closet',image:'room-closet',title:'A wardrobe to step into.',note:'Pull a hanger. Find your evening.'},{n:27,name:'Gather',room:'kitchen',image:'room-kitchen',title:'An invitation to stay.',note:'Open the cookbook on the counter.'},{n:26,name:'Unwind',room:'music-lounge',image:'room-musiclounge',title:'Leave the day upstairs.',note:'A record, a film, a little longer.'}];
  const el=document.createElement('section');el.className='arrival';el.setAttribute('aria-label','Choose a floor');
  el.innerHTML='<p class="arrival__label">The Compliment · Your lift is waiting</p><div class="arrival__floors">'+floors.map((f,i)=>'<button type="button" data-floor="'+i+'" aria-pressed="'+(i===1)+'">'+f.n+'<small>'+f.name+'</small></button>').join('')+'</div><a class="arrival__view"><img alt=""><span></span></a><p class="arrival__note" aria-live="polite"></p>';
  lede.after(el);
  function select(i){const f=floors[i];el.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));const a=el.querySelector('a');a.href='/house.html#'+f.room;a.querySelector('img').src='/assets/img/'+f.image+'@sm.jpg';a.querySelector('span').innerHTML=f.title+'<small>ENTER LEVEL '+f.n+' ↗</small>';el.querySelector('.arrival__note').textContent=f.note;}
  el.addEventListener('click',e=>{const b=e.target.closest('[data-floor]');if(b)select(Number(b.dataset.floor));});select(1);
  const doors=document.createElement('div');doors.className='arrival-doors';doors.setAttribute('aria-hidden','true');document.body.appendChild(doors);
  let leaving=false;
  document.addEventListener('click',e=>{const a=e.target.closest('.arrival__view,.lib__card[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const url=new URL(a.href);if(url.origin!==location.origin)return;e.preventDefault();if(leaving)return;leaving=true;doors.classList.add('is-closing');setTimeout(()=>location.assign(url.href),440);});
  addEventListener('pageshow',()=>{leaving=false;doors.classList.remove('is-closing');});
})();
