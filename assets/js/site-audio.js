/* Room-aware house audio: TV in ordinary rooms, a shared Lounge playlist in
   Music Lounge/Gym, and Cinema's screen audio. No global play/pause control. */
(function () {
  'use strict';
  if (!document.querySelector('[data-room-pager]')) return;
  var PLAYLIST='spotify:playlist:7b46c5syjtG86a77R7SnMs', controller=null, activeRoom='', loungeWanted=false, ready=false;
  function isLounge(id){return id==='music-lounge'||id==='gym';}
  function roomId(){try{return window.PPRoomPagers&&window.PPRoomPagers[0]&&window.PPRoomPagers[0].getCurrentId();}catch(_){return '';}}
  function pause(){if(controller)try{controller.pause();}catch(_){}loungeWanted=false;}
  function play(){if(!controller)return;loungeWanted=true;try{controller.play();}catch(_){}}
  function apply(id){activeRoom=id||roomId()||'';if(isLounge(activeRoom))play();else pause();if(window.PPTheatre&&window.PPTheatre.setHouseRoom)window.PPTheatre.setHouseRoom(activeRoom);}
  function initSpotify(){if(ready)return;ready=true;var wait=setInterval(function(){if(!window.SpotifyIframeApi)return;clearInterval(wait);window.SpotifyIframeApi.createController(document.getElementById('pp-house-audio-frame'),{uri:PLAYLIST},function(raw){controller={play:function(){raw.play();},pause:function(){raw.pause();},togglePlay:function(){if(raw.togglePlay)raw.togglePlay();else if(loungeWanted)raw.pause();else raw.play();}};window.PPAmbient={get:function(){return{controller:controller,room:activeRoom,playing:loungeWanted};}};if(isLounge(activeRoom))play();else pause();});},100);var s=document.createElement('script');s.src='https://open.spotify.com/embed/iframe-api/v1';s.async=true;var prior=window.onSpotifyIframeApiReady;window.onSpotifyIframeApiReady=function(api){if(typeof prior==='function')prior(api);window.SpotifyIframeApi=api;};document.head.appendChild(s);}
  function boot(){window.PPHouseAudioManaged=true;var frame=document.createElement('div');frame.id='pp-house-audio-frame';frame.style.cssText='position:fixed;width:1px;height:1px;left:-100px;bottom:-100px;opacity:0;pointer-events:none;overflow:hidden';document.body.appendChild(frame);activeRoom=roomId()||'penthouse-living';initSpotify();document.addEventListener('pp:room-change',function(e){apply(e.detail&&e.detail.id);});apply(activeRoom);setTimeout(function(){apply(activeRoom);},600);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

(function(){'use strict';if(document.querySelector('script[data-hf-six-guide]'))return;var s=document.createElement('script');s.src='/assets/js/hellofresh-guide.js?v=1';s.defer=true;s.setAttribute('data-hf-six-guide','');document.head.appendChild(s);})();
