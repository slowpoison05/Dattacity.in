(()=>{
'use strict';
/* Public renderer: use the exact same card map as the Content Manager. */
let latest=null;
const fallbackSections=[
 {id:'hero',target:'.hero',titleSel:'h1',bodySel:'p',eyebrowSel:'.eyebrow',image:'background'},
 {id:'village',target:'.feature',titleSel:'.featureCopy h3',bodySel:'.featureCopy p',imageSel:'.featurePhoto',image:'background'},
 {id:'home1',target:'.cards3 .lifeCard:nth-child(1)',titleSel:'.lifeInner h3',bodySel:'.lifeInner p',image:'background'},
 {id:'home2',target:'.cards3 .lifeCard:nth-child(2)',titleSel:'.lifeInner h3',bodySel:'.lifeInner p',image:'background'},
 {id:'home3',target:'.cards3 .lifeCard:nth-child(3)',titleSel:'.lifeInner h3',bodySel:'.lifeInner p',image:'background'},
 {id:'updates1',target:'.updates > .updateCard:nth-child(1)',titleSel:'h3',bodySel:'.dcContentBody',image:null},
 {id:'updates2',target:'.updates > .storyCard:nth-child(2)',titleSel:'h3',bodySel:'p',image:null},
 {id:'story1',target:'.storyGrid .storyCard:nth-child(1)',titleSel:'.storyBody h3',bodySel:'.storyBody p',imageSel:'.storyImg',image:'background'},
 {id:'story2',target:'.storyGrid .storyCard:nth-child(2)',titleSel:'.storyBody h3',bodySel:'.storyBody p',imageSel:'.storyImg',image:'background'},
 {id:'story3',target:'.storyGrid .storyCard:nth-child(3)',titleSel:'.storyBody h3',bodySel:'.storyBody p',imageSel:'.storyImg',image:'background'},
 {id:'dream',target:'.cta',titleSel:'h2',bodySel:'p',image:'background'}
];
function sections(){return Array.isArray(window.DATTA_CONTENT_SECTIONS)&&window.DATTA_CONTENT_SECTIONS.length?window.DATTA_CONTENT_SECTIONS:fallbackSections}
function dataFor(id){
 if(latest?.[id])return latest[id];
 /* Keep the old Community Updates record working after the card split. */
 if(id==='updates1'&&latest?.updates)return latest.updates;
 return null;
}
function renderOne(sec){
 const d=dataFor(sec.id),root=document.querySelector(sec.target);if(!root||!d)return false;
 root.dataset.dcContentId=sec.id;
 if(d.eyebrow!==undefined&&sec.eyebrowSel){const el=root.querySelector(sec.eyebrowSel);if(el)el.textContent=d.eyebrow}
 if(d.title!==undefined&&sec.titleSel){let el=root.querySelector(sec.titleSel);if(!el&&sec.id.startsWith('updates')){el=document.createElement('h3');root.insertBefore(el,root.firstChild)}if(el)el.textContent=d.title}
 if(d.body!==undefined&&sec.bodySel){
  let el=root.querySelector(sec.bodySel);
  if(sec.id.startsWith('updates')){
   if(!el){el=document.createElement('p');el.className='dcContentBody';el.style.cssText='margin:8px 0 0;color:#69736d;font-size:12px;line-height:1.55';root.appendChild(el)}
   el.textContent=d.body;
  }else if(el)el.textContent=d.body;
 }
 if(d.image&&sec.image==='background'){const el=sec.imageSel?root.querySelector(sec.imageSel):root;if(el)el.style.backgroundImage=`url("${String(d.image).replace(/"/g,'&quot;')}")`}
 return true;
}
function render(){sections().forEach(renderOne)}
function start(){
 if(!window.firebase?.database){setTimeout(start,300);return}
 window.firebase.database().ref('siteContent').on('value',s=>{latest=s.val()||{};render()});
 const observer=new MutationObserver(render);observer.observe(document.documentElement,{childList:true,subtree:true});
 let n=0;const timer=setInterval(()=>{render();if(++n>150)clearInterval(timer)},100);
}
start();
})();
