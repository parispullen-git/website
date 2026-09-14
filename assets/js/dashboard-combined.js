/* Navigation/presentation adapter. Existing editor nodes and handlers stay intact. */
(() => {
  'use strict';
  const groups = [
    ['Today', [['overview','Today']]],
    ['Hotel & sites', [['hrooms','Rooms & objects'],['penthouse','Open rooms'],['floors','Floor directory'],['charlottemap','Charlotte map'],['websites','Websites']]],
    ['Content & media', [['journal-live','Journal · Site edition'],['journal','Journal · Dashboard entries'],['housemusic','Music · Record shelf'],['music','Music · Remote rotation'],['housechannels','Video · Site programme'],['video','Video · Runtime overrides'],['dispatch','Dispatch briefs'],['dailynews','Daily news']]],
    ['Shop & collaborations', [['boutique','Products'],['lookbook','Lookbooks'],['partnerships','Collaborations'],['pitches','Pitches & goals'],['trackedbrands','Tracked brands']]],
    ['Business', [['inquiries','Inquiries'],['clients','Clients'],['proposals','Proposals'],['orders','Orders'],['invoices','Invoices'],['casefiles','Case files'],['network','Network'],['social','Social analytics'],['newsletter','Newsletter']]],
    ['Settings & publishing', [['content','Publishing & resources']]]
  ];
  const original = document.querySelector('.dashnav');
  const existing = [...original.querySelectorAll('[data-tab]')];
  const buttons = new Map(existing.map(b => [b.dataset.tab,b]));
  const known = new Set(groups.flatMap(g=>g[1].map(t=>t[0])));
  // Any newly added legacy editor remains reachable automatically.
  const extra = existing.filter(b=>!known.has(b.dataset.tab));
  if(extra.length)groups.push(['More tools',extra.map(b=>[b.dataset.tab,b.textContent.trim()])]);
  const nav = document.createElement('nav');nav.className='studio-nav';nav.setAttribute('aria-label','Studio workspace');
  nav.innerHTML='<div class="studio-wordmark">PARIS PULLEN<small>PRIVATE STUDIO</small></div><label class="studio-search-label" for="studio-search">Find an editor</label><input id="studio-search" type="search" placeholder="Rooms, journal, invoices…"><p id="studio-empty" hidden>No matching editors.</p>';
  groups.forEach(([name,tabs],i)=>{
    const section=document.createElement('details');section.open=i===0;
    const summary=document.createElement('summary');summary.textContent=name;section.append(summary);
    tabs.forEach(([id,label])=>{if(!buttons.has(id))return;const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.studioTab=id;b.onclick=()=>{buttons.get(id).click();sync();document.querySelector('.dashmain').scrollIntoView({block:'start',behavior:'auto'})};section.append(b)});
    nav.append(section);
  });
  const note=document.createElement('p');note.className='studio-note';note.textContent='Private studio · Review each editor’s save status before publishing.';nav.append(note);
  original.insertAdjacentElement('afterend',nav);
  const top=document.createElement('div');top.className='studio-top';
  top.innerHTML='<div><small>WORKSPACE</small><h2 id="studio-title">Today</h2></div><div class="studio-top-actions"><button type="button" id="studio-publish">Publishing controls ↗</button></div>';
  document.querySelector('.dashmain').prepend(top);
  document.querySelector('#studio-publish').onclick=()=>{buttons.get('content').click();sync();const p=document.querySelector('.dashnav__deploy');p.scrollIntoView({block:'center'});p.querySelector('button').focus()};
  // Move the original publish control rather than cloning its behavior.
  const deployment=original.querySelector('.dashnav__deploy');document.querySelector('#panel-content').prepend(deployment);
  const overview=document.querySelector('#panel-overview');
  const start=document.createElement('section');start.className='studio-start';
  start.innerHTML='<p class="eyebrow">YOUR WORKSPACE</p><h2>What would you like to work on?</h2><p>Open an editor to manage your current content and business records.</p><div class="studio-shortcuts"></div>';
  [['hrooms','Edit a room','Objects, details & floor placement'],['journal-live','Write & edit','Your site’s Journal edition'],['partnerships','Manage collaborations','Partners and their placements'],['inquiries','Follow up','Open business inquiries']].forEach(([id,label,desc])=>{const b=document.createElement('button');b.type='button';const strong=document.createElement('strong');strong.textContent=label;const small=document.createElement('small');small.textContent=desc;b.append(strong,small);b.onclick=()=>{buttons.get(id).click();sync()};start.querySelector('.studio-shortcuts').append(b)});overview.prepend(start);
  const search=nav.querySelector('input');search.oninput=()=>{const q=search.value.toLowerCase();let count=0;nav.querySelectorAll('details').forEach(section=>{let visible=0;section.querySelectorAll('button').forEach(b=>{b.hidden=!b.textContent.toLowerCase().includes(q);if(!b.hidden)visible++});section.hidden=!visible;if(q)section.open=true;count+=visible});document.querySelector('#studio-empty').hidden=count>0};
  function sync(){const current=existing.find(b=>b.classList.contains('is-active'));if(!current)return;nav.querySelectorAll('button').forEach(b=>{const active=b.dataset.studioTab===current.dataset.tab;b.classList.toggle('active',active);if(active){b.setAttribute('aria-current','page');b.closest('details').open=true;document.querySelector('#studio-title').textContent=b.textContent}else b.removeAttribute('aria-current')});}
  new MutationObserver(sync).observe(original,{subtree:true,attributes:true,attributeFilter:['class']});sync();
})();
