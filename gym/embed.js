/* Paris Pullen After Hours — self-contained modal integration. */
(()=>{
 'use strict';
 const script=document.currentScript,src=new URL('index.html?embed=1',script.src).href;
 const popup=document.createElement('dialog');popup.setAttribute('aria-label','After Hours boxing game');popup.style.cssText='padding:0;border:1px solid #655338;width:min(1120px,96vw);height:min(880px,96dvh);max-width:none;max-height:96dvh;background:#101110;overflow:hidden;';
 const style=document.createElement('style');style.textContent='.pp-boxing-modal::backdrop{background:#000c;backdrop-filter:blur(8px)}.pp-boxing-trigger:focus-visible{outline:3px solid #e2bb7c;outline-offset:4px}';document.head.append(style);popup.className='pp-boxing-modal';
 const frame=document.createElement('iframe');frame.title='After Hours boxing';frame.style.cssText='width:100%;height:100%;border:0';frame.allow='autoplay';
 const close=document.createElement('button');close.textContent='✕';close.setAttribute('aria-label','Close boxing game');close.style.cssText='position:absolute;right:12px;top:13px;background:#101110;color:#f8e9ce;border:1px solid #807052;width:34px;height:34px;cursor:pointer;font-size:18px;z-index:2';
 let previous,overflow='';function open(){if(popup.open)return;previous=document.activeElement;overflow=document.body.style.overflow;frame.src=src;popup.showModal();document.body.style.overflow='hidden';close.focus()}function dismiss(){popup.close();frame.src='about:blank';document.body.style.overflow=overflow;previous?.focus()}
 close.onclick=dismiss;popup.addEventListener('cancel',e=>{e.preventDefault();dismiss()});popup.append(frame,close);document.body.append(popup);
 document.addEventListener('click',e=>{const selector=script.dataset.target||'[data-paris-boxing]';if(e.target instanceof Element&&e.target.closest(selector)){e.preventDefault();open()}});
 document.querySelectorAll('[data-paris-boxing-room]').forEach(room=>{if(getComputedStyle(room).position==='static')room.style.position='relative';const b=document.createElement('button');b.className='pp-boxing-trigger';b.dataset.parisBoxing='';b.setAttribute('aria-label','Challenge the boxer');b.textContent='+';b.style.cssText='position:absolute;left:78.5%;top:39%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;border:1px solid #e2bb7c;background:#12100c77;color:#e2bb7c;font:28px sans-serif;cursor:pointer;box-shadow:0 0 0 9px #d5b07122';room.append(b)});
})();
