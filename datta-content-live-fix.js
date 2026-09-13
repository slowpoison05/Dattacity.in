(()=>{
'use strict';
/* Stable public content renderer. It does not depend on Firebase SDK load order. */
const DB='https://superkisan-33b7e-default-rtdb.firebaseio.com';
const MAP=[
 {id:'hero',target:'.hero',title:'h1',body:'p',eyebrow:'.eyebrow',image:'background'},
 {id:'village',target:'.feature',title:'.featureCopy h3',body:'.featureCopy p',image:'.featurePhoto'},
 {id:'home1',target:'.cards3 .lifeCard:nth-child(1)',title:'.lifeInner h3',body:'.lifeInner p',image:'background'},
 {id:'home2',target:'.cards3 .lifeCard:nth-child(2)',title:'.lifeInner h3',body:'.lifeInner p',image:'background'},
 {id:'home3',target:'.cards3 .lifeCard:nth-child(3)',title:'.lifeInner h3',body:'.lifeInner p',image:'background'},
 {id:'updates1',target:'.updates > .updateCard',title:'h3',body:'.dcContentBody'},
 {id:'updates2',target:'.updates > .storyCard',title:'h3',body:'p'},
 {id:'story1',target:'.storyGrid .storyCard:nth-child(1)',title:'.storyBody h3',body:'.storyBody p',image:'.storyImg'},
 {id:'story2',target:'.storyGrid .storyCard:nth-child(2)',title:'.storyBody h3',body:'.storyBody p',image:'.storyImg'},
 {id:'story3',target:'.storyGrid .storyCard:nth-child(3)',title:'.storyBody h3',body:'.storyBody p',image:'.storyImg'},
 {id:'dream',target:'.cta',title:'h2',body:'p',image:'background'}
];
let data={};
function getMap(){return Array.isArray(window.DATTA_CONTENT_SECTIONS)&&window.DATTA_CONTENT_SECTIONS.length?window.DATTA_CONTENT_SECTIONS.map(s=>({id:s.id,target:s.target,title:s.titleSel,body:s.bodySel,eyebrow:s.eyebrowSel,image:s.imageSel||s.image})):MAP}
function one(sec){
 const d=data[sec.id]||(sec.id==='updates1'?data.updates:null);const root=document.querySelector(sec.target);if(!root||!d)return;
 root.dataset.dcContentId=sec.id;
 if(d.eyebrow!==undefined&&sec.eyebrow){let e=root.querySelector(sec.eyebrow);if(e)e.textContent=d.eyebrow}
 if(d.title!==undefined&&sec.title){let e=root.querySelector(sec.title);if(!e&&sec.id==='updates1'){e=document.createElement('h3');e.style.cssText='font-family:Manrope;margin:0 0 7px;font-size:18px';root.insertBefore(e,root.firstChild)}if(e)e.textContent=d.title}
 if(d.body!==undefined&&sec.body){let e=root.querySelector(sec.body);if(!e&&sec.id==='updates1'){e=document.createElement('p');e.className='dcContentBody';e.style.cssText='margin:8px 0 0;color:#69736d;font-size:12px;line-height:1.55';root.appendChild(e)}if(e)e.textContent=d.body}
 if(d.image&&sec.image){const e=sec.image==='background'?root:root.querySelector(sec.image);if(e)e.style.backgroundImage=`url("${String(d.image).replace(/"/g,'&quot;')}")`}
}
function render(){getMap().forEach(one)}
async function fetchContent(){
 try{const r=await fetch(DB+'/siteContent.json?dc='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const v=await r.json();if(v&&typeof v==='object'){data=v;render()}}
 catch(e){console.warn('DattaCity content REST read failed',e)}
}
function boot(){
 fetchContent();
 setTimeout(fetchContent,800);
 setTimeout(fetchContent,2500);
 setInterval(fetchContent,5000);
 const o=new MutationObserver(render);o.observe(document.documentElement,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
