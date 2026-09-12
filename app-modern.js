(()=>{
  const CORE='https://raw.githubusercontent.com/slowpoison05/Dattacity.in/d2259a62c81e7fa9da3052e4007aeaa460210e37/app-modern.js';
  const V='9.23.0';
  const SDK=[`https://www.gstatic.com/firebasejs/${V}/firebase-app-compat.js`,`https://www.gstatic.com/firebasejs/${V}/firebase-auth-compat.js`,`https://www.gstatic.com/firebasejs/${V}/firebase-database-compat.js`,`https://www.gstatic.com/firebasejs/${V}/firebase-storage-compat.js`];
  const CFG={apiKey:'AIzaSyCvaXtUjp8xY5nRFXroL-H1ospFSgM7qQ0',authDomain:'superkisan-33b7e.firebaseapp.com',databaseURL:'https://superkisan-33b7e-default-rtdb.firebaseio.com',projectId:'superkisan-33b7e',storageBucket:'superkisan-33b7e.firebasestorage.app',messagingSenderId:'744234922644',appId:'1:744234922644:web:20b4c062d50d6265fdba81'};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const first=(v,...ks)=>ks.map(k=>v?.[k]).find(x=>x!=null&&String(x).trim()!=='');
  const photos=v=>Array.isArray(v?.photos)?v.photos.filter(Boolean):(v?.photoURL||v?.image||v?.imageUrl||v?.photo||v?.profilePhoto?[v.photoURL||v.image||v.imageUrl||v.photo||v.profilePhoto]:[]);
  function status(t){const e=document.getElementById('dbStatus');if(e)e.textContent=t}
  function load(src){return new Promise((ok,bad)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>bad(Error('Firebase SDK failed'));document.head.appendChild(s)})}
  async function firebaseReady(){if(!window.firebase?.initializeApp)for(const s of SDK)await load(s);if(!window.firebase)throw Error('Firebase SDK unavailable');if(!firebase.apps.length)firebase.initializeApp(CFG);return firebase}

  function render(rows){
    const lists=[document.getElementById('servicesList'),document.getElementById('dcServicesList')].filter(Boolean);
    if(!lists.length)return;
    if(!rows.length){lists.forEach(l=>l.innerHTML='<div class="notice">No services found.</div>');return}
    const html=rows.map((x,i)=>{const n=first(x,'name','title','serviceName')||`Local service ${i+1}`,c=first(x,'category','type','serviceType')||'Service',d=first(x,'details','description','about','address')||'',p=first(x,'phone','phoneNumber','mobile','contact','contactNumber'),im=photos(x)[0];return `<article class="card"><div class="row">${im?`<img class="thumb" src="${esc(im)}" alt="">`:'<div class="thumb">◉</div>'}<div class="info"><h3>${esc(n)}</h3>${d?`<div class="muted">${esc(d)}</div>`:''}<span class="tag">${esc(c)}</span>${p?`<div class="actions"><a class="call" href="tel:${esc(p)}">Call</a><a class="call" target="_blank" rel="noopener" href="https://wa.me/${String(p).replace(/\D/g,'')}">WhatsApp</a></div>`:''}</div></div></article>`}).join('');
    lists.forEach(l=>l.innerHTML=html);
  }

  function inject(){
    if(document.getElementById('dattacity-existing-services'))return;
    const home=document.getElementById('home');if(!home)return;
    const sec=document.createElement('section');sec.id='dattacity-existing-services';sec.className='section';sec.innerHTML='<div class="sectionHead"><div><div class="kicker">ALL DATTACITY SERVICES</div><h2>Every local service, in one place.</h2><p class="sectionLead">Live from the existing Firebase database.</p></div></div><div id="dcServicesList" class="cards"></div>';home.appendChild(sec);
    const kh=document.createElement('section');kh.className='section';kh.innerHTML='<div class="cta" style="margin-top:0"><div><div class="kicker" style="color:#ead6a5">FARMER SUPPORT</div><h2>Kheti Health Centre</h2><p>Open the existing farmer-focused health centre.</p></div><button type="button" id="khetiHealthBtn">Open Kheti Health Centre ↗</button></div>';home.appendChild(kh);
    document.getElementById('khetiHealthBtn').onclick=()=>location.href='https://kheti.dattacity.in';
  }

  function addServiceButton(){
    if(document.getElementById('dcAddService'))return;
    const view=document.getElementById('services');if(!view)return;
    const head=view.querySelector('.head');
    const b=document.createElement('button');b.id='dcAddService';b.className='outline';b.type='button';b.textContent='+ Add Service';
    if(head)head.appendChild(b);else view.insertBefore(b,view.firstChild);
    b.onclick=openAddService;
  }
  function ensureAddModal(){
    if(document.getElementById('dcAddModal'))return;
    const s=document.createElement('style');s.id='dcAddStyles';s.textContent='.dcModal{position:fixed;inset:0;z-index:100;background:rgba(10,25,18,.55);display:none;align-items:flex-end;justify-content:center;padding:14px}.dcModal.open{display:flex}.dcSheet{width:min(620px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:24px;padding:22px;box-shadow:0 25px 70px rgba(0,0,0,.25)}.dcSheet h2{margin:0 0 6px;font-family:Manrope}.dcSheet label{display:block;font-size:12px;font-weight:700;margin:13px 0 6px}.dcSheet input,.dcSheet textarea{width:100%;border:1px solid #e4e6df;border-radius:12px;padding:11px;background:#fff}.dcSheet textarea{min-height:90px;resize:vertical}.dcSheet .dcClose{float:right;border:0;background:#f1f3ef;border-radius:10px;padding:8px 11px}.dcSubmit{margin-top:15px;width:100%;border:0;border-radius:12px;padding:12px;background:#176b46;color:#fff;font-weight:800}';document.head.appendChild(s);
    const m=document.createElement('div');m.id='dcAddModal';m.className='dcModal';m.innerHTML='<div class="dcSheet"><button type="button" class="dcClose" id="dcAddClose">✕</button><h2>Add a service</h2><p class="muted">Add a local service to the existing DattaCity Firebase directory.</p><form id="dcAddForm"><label>Service / business name *</label><input id="dcName" required placeholder="e.g. Raju Auto Repair"><label>Category</label><input id="dcCategory" placeholder="e.g. shop, repair, transport"><label>Phone</label><input id="dcPhone" inputmode="tel" placeholder="Mobile number"><label>Details</label><textarea id="dcDetails" placeholder="Address, timings, services, etc."></textarea><label>Photo (optional)</label><input id="dcImage" type="file" accept="image/*"><div id="dcAddMsg" class="notice">Your service will be submitted for approval.</div><button class="dcSubmit" type="submit">Submit Service</button></form></div>';
    document.body.appendChild(m);document.getElementById('dcAddClose').onclick=()=>m.classList.remove('open');m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')});
  }
  function openAddService(){ensureAddModal();document.getElementById('dcAddModal').classList.add('open');}
  async function saveService(e){
    e.preventDefault();const form=e.target,btn=form.querySelector('button[type=submit]'),msg=document.getElementById('dcAddMsg');btn.disabled=true;msg.textContent='Saving service…';msg.style.color='';
    try{
      const name=document.getElementById('dcName').value.trim();if(!name)throw Error('Service name is required.');
      let image='';const file=document.getElementById('dcImage').files[0];
      if(file&&window.firebase?.storage){try{const safe=file.name.replace(/[^a-z0-9._-]/gi,'_');const ref=firebase.storage().ref().child(`dattaCity/${Date.now()}_${safe}`);await ref.put(file);image=await ref.getDownloadURL();}catch(uploadErr){console.warn('Image upload failed; saving service without image',uploadErr);}}
      const db=firebase.database();const data={name,category:document.getElementById('dcCategory').value.trim()||'other',phone:document.getElementById('dcPhone').value.trim(),details:document.getElementById('dcDetails').value.trim(),image,createdAt:firebase.database.ServerValue.TIMESTAMP,status:'pending'};
      await db.ref('services').push(data);
      msg.textContent='Service submitted successfully. It will appear after admin approval.';form.reset();
      setTimeout(()=>document.getElementById('dcAddModal')?.classList.remove('open'),900);
    }catch(err){console.error(err);msg.textContent=err.code==='PERMISSION_DENIED'||err.message?.toLowerCase().includes('permission')?'Firebase permission denied. The existing database rules must allow service submissions.':(err.message||'Could not add service.');msg.style.color='#b42318';}
    finally{btn.disabled=false;}
  }

  async function start(){
    status('Connecting…');
    try{
      const f=await firebaseReady();
      const db=f.database();inject();
      let rows=[];
      const renderLive=s=>{rows=[];s.forEach(c=>{const v=c.val();if(v&&typeof v==='object')rows.push({...v,_key:c.key})});render(rows);const count=document.getElementById('serviceCount');if(count)count.textContent=rows.length;status(`Connected • ${rows.length} services`)};
      let code=await fetch(CORE,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Core load failed');return r.text()});
      code=code.replace('storage=firebase.storage();','storage=(()=>{try{return firebase.storage()}catch(e){console.warn(e);return null}})();');
      (0,eval)(code);
      if(document.readyState!=='loading')document.dispatchEvent(new Event('DOMContentLoaded'));
      ensureAddModal();addServiceButton();document.getElementById('dcAddForm').onsubmit=saveService;
      db.ref('services').on('value',renderLive,err=>{console.error(err);status('Firebase error')});
    }catch(e){console.error(e);status('Firebase error')}
  }
  start();
})();