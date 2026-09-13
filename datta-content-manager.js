(()=>{
'use strict';
const DB='https://superkisan-33b7e-default-rtdb.firebaseio.com';
const CFG={apiKey:'AIzaSyCvaXtUjp8xY5nRFXroL-H1ospFSgM7qQ0',authDomain:'superkisan-33b7e.firebaseapp.com',databaseURL:DB,projectId:'superkisan-33b7e',storageBucket:'superkisan-33b7e.firebasestorage.app',messagingSenderId:'744234922644',appId:'1:744234922644:web:20b4c062d50d6265fdba81'};

/* One stable key = one exact website card.  The same map is used by the
   public renderer, so an admin edit can only land on its matching card. */
const SECTIONS=[
 {id:'hero',name:'Welcome / Hero',target:'.hero',titleSel:'h1',bodySel:'p',eyebrowSel:'.eyebrow',image:'background'},
 {id:'village',name:'Our Village',target:'.feature',titleSel:'.featureCopy h3',bodySel:'.featureCopy p',imageSel:'.featurePhoto',image:'background'},
 {id:'home1',name:'Our Home — Card 1',target:'.cards3 .lifeCard:nth-child(1)',titleSel:'.lifeInner h3',bodySel:'.lifeInner p',image:'background'},
 {id:'home2',name:'Our Home — Card 2',target:'.cards3 .lifeCard:nth-child(2)',titleSel:'.lifeInner h3',bodySel:'.lifeInner p',image:'background'},
 {id:'home3',name:'Our Home — Card 3',target:'.cards3 .lifeCard:nth-child(3)',titleSel:'.lifeInner h3',bodySel:'.lifeInner p',image:'background'},
 {id:'updates1',name:'Community Update — Card 1',target:'.updates .updateCard:nth-child(1)',titleSel:'h3',bodySel:'.dcContentBody',image:null},
 {id:'updates2',name:'Community Update — Card 2',target:'.updates .updateCard:nth-child(2)',titleSel:'h3',bodySel:'.dcContentBody',image:null},
 {id:'story1',name:'Village Story — Card 1',target:'.storyGrid .storyCard:nth-child(1)',titleSel:'.storyBody h3',bodySel:'.storyBody p',imageSel:'.storyImg',image:'background'},
 {id:'story2',name:'Village Story — Card 2',target:'.storyGrid .storyCard:nth-child(2)',titleSel:'.storyBody h3',bodySel:'.storyBody p',imageSel:'.storyImg',image:'background'},
 {id:'story3',name:'Village Story — Card 3',target:'.storyGrid .storyCard:nth-child(3)',titleSel:'.storyBody h3',bodySel:'.storyBody p',imageSel:'.storyImg',image:'background'},
 {id:'dream',name:'Dream Beyond Borders',target:'.cta',titleSel:'h2',bodySel:'p',image:'background'}
];
window.DATTA_CONTENT_SECTIONS=SECTIONS;
let fbPromise,publicContent={};

function loadFB(){
 if(window.firebase?.database&&window.firebase?.auth&&window.firebase?.storage)return Promise.resolve(window.firebase);
 if(fbPromise)return fbPromise;
 fbPromise=new Promise((resolve,reject)=>{
  const urls=['https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js'];
  let i=0;
  const next=()=>{if(i===urls.length){try{if(!firebase.apps.length)firebase.initializeApp(CFG);resolve(firebase)}catch(e){reject(e)}return}const s=document.createElement('script');s.src=urls[i++];s.onload=next;s.onerror=()=>reject(new Error('Firebase could not load'));document.head.appendChild(s)};
  next();
 });
 return fbPromise;
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]||m))}
function css(){
 if(document.getElementById('dcContentCss'))return;
 const s=document.createElement('style');s.id='dcContentCss';s.textContent=`#dcContentBtn{display:inline-flex!important}.dcContentModal{position:fixed;inset:0;background:rgba(10,18,14,.68);z-index:100020;display:none;align-items:center;justify-content:center;padding:10px}.dcContentModal.open{display:flex}.dcContentSheet{width:min(820px,100%);max-height:94vh;overflow:auto;background:#fff;border-radius:24px;padding:20px;box-shadow:0 24px 80px rgba(0,0,0,.25)}.dcContentClose{float:right;width:42px;height:42px;border:1px solid #ddd;background:#fff;border-radius:11px;font-size:22px}.dcContentCard{border:1px solid #e2e7e1;border-radius:18px;padding:18px;margin:14px 0;background:#fff}.dcContentCard h3{margin:0 0 5px;font-size:18px}.dcContentHint{font-size:12px;color:#66736b;margin-bottom:15px}.dcContentCard label{display:block;font-size:13px;font-weight:800;margin:14px 0 6px;color:#26332d}.dcContentCard input:not([type=file]),.dcContentCard textarea{display:block;width:100%;box-sizing:border-box;border:1px solid #d5ddd6;border-radius:12px;padding:13px;background:#fff;font:inherit;font-size:15px}.dcContentCard textarea{min-height:115px;resize:vertical}.dcContentCard input[type=file]{display:block;width:100%;box-sizing:border-box;font-size:13px;margin-top:4px}.dcContentBtn{display:block;border:0;background:#176b46;color:#fff;border-radius:12px;padding:13px 17px;font-weight:800;margin-top:16px;width:100%;cursor:pointer}.dcContentBtn:disabled{opacity:.6;cursor:wait}.dcContentMsg{padding:11px 13px;border-radius:12px;background:#edf4ee;color:#46564d;margin-top:10px;font-size:13px}.dcContentError{background:#fff0ee;color:#b42318}.dcContentPreview{display:block;max-width:180px;max-height:100px;border-radius:10px;object-fit:cover;margin-top:9px}.dcContentTop{margin-bottom:18px}.dcContentTop h2{margin:0 0 8px}.dcContentTop p{margin:0}.dcContentSectionTag{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#176b46;background:#edf4ee;border-radius:99px;padding:5px 8px;margin-bottom:7px}.dcTargetTag{font-size:11px;color:#69736d;margin:6px 0 0}@media(max-width:520px){.dcContentSheet{padding:15px;border-radius:20px}.dcContentCard{padding:15px}}`;
 document.head.appendChild(s);
}
function modal(){
 let m=document.getElementById('dcContentModal');if(m)return m;
 m=document.createElement('div');m.id='dcContentModal';m.className='dcContentModal';m.innerHTML='<div class="dcContentSheet"><button class="dcContentClose" type="button">×</button><div class="dcContentTop"><div class="kicker">DATTACITY ADMIN</div><h2>Website Content Manager</h2><p class="muted">Each editor below is permanently linked to one specific website card. Save here and that exact card updates.</p></div><div id="dcContentArea"></div></div>';
 document.body.appendChild(m);m.querySelector('.dcContentClose').onclick=()=>m.classList.remove('open');m.onclick=e=>{if(e.target===m)m.classList.remove('open')};return m;
}
function target(sec){return document.querySelector(sec.target)}
function applyOne(sec,data){
 const root=target(sec);if(!root)return;
 root.dataset.dcContentId=sec.id;
 if(data.eyebrow!==undefined&&sec.eyebrowSel){const el=root.querySelector(sec.eyebrowSel);if(el)el.textContent=data.eyebrow}
 if(data.title!==undefined&&sec.titleSel){const el=root.querySelector(sec.titleSel);if(el)el.textContent=data.title}
 if(data.body!==undefined&&sec.bodySel){const el=root.querySelector(sec.bodySel);if(el)el.textContent=data.body}
 if(data.image&&sec.image==='background'){const el=sec.imageSel?root.querySelector(sec.imageSel):root;if(el)el.style.backgroundImage=`url("${String(data.image).replace(/"/g,'&quot;')}")`}
}
function applyAll(){SECTIONS.forEach(s=>applyOne(s,publicContent[s.id]||{}));}
async function loadPublic(){
 try{const fb=await loadFB();fb.database().ref('siteContent').on('value',snap=>{publicContent=snap.val()||{};applyAll()});const o=new MutationObserver(applyAll);o.observe(document.body,{childList:true,subtree:true});setTimeout(applyAll,500);setTimeout(applyAll,2000)}catch(e){console.warn('DattaCity content load failed',e)}
}
function editorHTML(all){
 return SECTIONS.map((s,i)=>{const d=all[s.id]||{};return `<div class="dcContentCard"><span class="dcContentSectionTag">Card ${i+1}</span><h3>${s.name}</h3><div class="dcContentHint">This editor changes only this exact website card.</div><div class="dcTargetTag">Live target: ${esc(s.target)}</div><form data-content-form="${s.id}">${s.eyebrowSel?`<label>Small heading</label><input data-field="eyebrow" value="${esc(d.eyebrow||'')}" placeholder="Optional small heading">`:''}<label>Title</label><input data-field="title" value="${esc(d.title||'')}" placeholder="Enter card title"><label>Content / description</label><textarea data-field="body" placeholder="Write what visitors should see">${esc(d.body||'')}</textarea>${s.image!==null?`<label>Photo</label><input data-field="imageFile" type="file" accept="image/*">${d.image?`<img class="dcContentPreview" src="${esc(d.image)}" alt="Current photo">`:''}`:''}<button class="dcContentBtn" type="submit">Save ${s.name}</button><div class="dcContentMsg" data-msg>Ready.</div></form></div>`}).join('');
}
function withTimeout(p,ms,label){return Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+' timed out. Please check Firebase permissions/network.')),ms))])}
async function authenticate(fb){
 if(fb.auth().currentUser)return true;
 const email=prompt('Admin email');if(!email)return false;const pass=prompt('Admin password');if(!pass)return false;
 try{await withTimeout(fb.auth().setPersistence(fb.auth.Auth.Persistence.LOCAL),10000,'Admin session setup');await withTimeout(fb.auth().signInWithEmailAndPassword(email.trim(),pass),15000,'Admin login');return true}catch(e){alert(e.code==='auth/invalid-credential'?'Invalid admin email or password. Please use the same Firebase admin account used by the Admin button.':(e.message||'Admin login failed'));return false}
}
function friendlyError(e){
 if(e?.code==='PERMISSION_DENIED'||String(e?.message).toLowerCase().includes('permission denied'))return 'Permission denied: Firebase Rules do not currently allow this admin account to write siteContent.';
 if(String(e?.message).includes('storage/unauthorized'))return 'Photo upload denied: Firebase Storage Rules do not allow this admin account to upload content photos.';
 return e?.message||'Could not save this card.';
}
async function saveSection(form,fb,sec){
 const msg=form.querySelector('[data-msg]'),btn=form.querySelector('button[type=submit]');btn.disabled=true;msg.className='dcContentMsg';msg.textContent='Saving text…';
 try{
  const data={};form.querySelectorAll('[data-field]').forEach(el=>{if(el.dataset.field!=='imageFile')data[el.dataset.field]=el.value.trim()});
  const file=form.querySelector('[data-field="imageFile"]')?.files?.[0];
  if(file){msg.textContent='Uploading photo…';const safe=file.name.replace(/[^a-z0-9._-]/gi,'_');const ref=fb.storage().ref().child('dattaCity/content/'+sec.id+'/'+Date.now()+'_'+safe);await withTimeout(ref.put(file),30000,'Photo upload');msg.textContent='Getting photo link…';data.image=await withTimeout(ref.getDownloadURL(),15000,'Photo link request')}
  data.updatedAt=fb.database.ServerValue.TIMESTAMP;data.updatedBy=fb.auth().currentUser?.email||'admin';
  msg.textContent='Saving to Firebase…';await withTimeout(fb.database().ref('siteContent/'+sec.id).update(data),15000,'Database save');
  publicContent[sec.id]={...(publicContent[sec.id]||{}),...data};applyOne(sec,publicContent[sec.id]);msg.textContent='✓ Saved — this exact card is now updated.';msg.className='dcContentMsg';
 }catch(e){console.error('Content save error',e);msg.textContent='✕ '+friendlyError(e);msg.className='dcContentMsg dcContentError'}finally{btn.disabled=false}
}
async function open(){
 css();const fb=await loadFB();if(!await authenticate(fb))return;const m=modal(),area=m.querySelector('#dcContentArea');area.innerHTML='<div class="dcContentMsg">Loading your saved content…</div>';m.classList.add('open');
 try{const snap=await withTimeout(fb.database().ref('siteContent').once('value'),10000,'Content read');const all=snap.val()||{};area.innerHTML=editorHTML(all);area.querySelectorAll('[data-content-form]').forEach(form=>{const sec=SECTIONS.find(x=>x.id===form.dataset.contentForm);form.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();saveSection(form,fb,sec)})})}catch(e){area.innerHTML='<div class="dcContentMsg dcContentError">✕ '+friendlyError(e)+'</div>'}
}
function addButton(){if(document.getElementById('dcContentBtn'))return;const admin=document.getElementById('adminBtn');if(!admin)return;const b=document.createElement('button');b.id='dcContentBtn';b.className=admin.className;b.type='button';b.textContent='Content';b.title='Edit website content — same Firebase admin session';b.onclick=open;admin.insertAdjacentElement('afterend',b)}
function boot(){css();loadPublic();let n=0;const t=setInterval(()=>{addButton();applyAll();if(++n>120)clearInterval(t)},100);const o=new MutationObserver(()=>{addButton();applyAll()});o.observe(document.documentElement,{childList:true,subtree:true})}
boot();
})();
