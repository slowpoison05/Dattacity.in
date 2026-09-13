(()=>{
'use strict';
/* Minimal home mode: keep only the five DattaCity service hub cards visible. */
function applyMinimalHome(){
 const home=document.getElementById('home');
 if(!home)return;
 if(!document.getElementById('dcMinimalHomeStyle')){
  const s=document.createElement('style');
  s.id='dcMinimalHomeStyle';
  s.textContent='#home > *:not(#dattacity-service-hub){display:none!important}#dattacity-service-hub{display:block!important;padding-top:24px}#dcContentBtn{display:none!important}';
  document.head.appendChild(s);
 }
}
function boot(){
 applyMinimalHome();
 const o=new MutationObserver(applyMinimalHome);
 o.observe(document.documentElement,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
