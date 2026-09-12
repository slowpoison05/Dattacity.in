(() => {
  const $ = id => document.getElementById(id);
  const validViews = new Set(['home','services','marketplace','weather','fasal','info']);
  let db = null, auth = null, storage = null;
  let services = [], market = [], serviceFilter = 'all', marketFilter = 'all';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const statusOf = x => String(x?.status || '').toLowerCase();
  const visible = x => !['pending','rejected','blocked'].includes(statusOf(x));
  const phoneOf = x => x?.phone || x?.mobile || x?.contact || '';

  function go(name) {
    if (!validViews.has(name)) name = 'home';
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = $(name); if (target) target.classList.add('active');
    document.querySelectorAll('[data-go]').forEach(b => b.classList.toggle('active', b.dataset.go === name));
    if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
    window.scrollTo({top:0, behavior:'instant'});
    if (name === 'weather' && typeof window.loadWeather === 'function') window.loadWeather();
    if (name === 'fasal' && typeof window.loadMandi === 'function') window.loadMandi();
  }

  function bindNavigation() {
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-go]');
      if (!button) return;
      event.preventDefault(); event.stopPropagation(); go(button.dataset.go);
    }, true);
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-external]');
      if (!button) return;
      event.preventDefault(); window.location.href = button.dataset.external;
    }, true);
    document.querySelectorAll('.back').forEach(button => button.addEventListener('click', e => { e.preventDefault(); go('home'); }, true));
    window.addEventListener('hashchange', () => go(location.hash.slice(1)));
    const initial = location.hash.slice(1); go(validViews.has(initial) ? initial : 'home');
  }

  function ensureModal() {
    if ($('dcModal')) return $('dcModal');
    const wrap = document.createElement('div');
    wrap.id = 'dcModal'; wrap.className = 'modal';
    wrap.innerHTML = `<div class="sheet"><button class="close" id="dcClose">✕</button><div id="dcModalBody"></div></div>`;
    document.body.appendChild(wrap);
    $('dcClose').onclick = closeModal;
    wrap.addEventListener('click', e => { if (e.target === wrap) closeModal(); });
    return wrap;
  }
  function openModal(html) { const m=ensureModal(); $('dcModalBody').innerHTML=html; m.classList.add('open'); }
  function closeModal() { const m=$('dcModal'); if(m) m.classList.remove('open'); }
  function msg(text, bad=false) { const el=$('dcMsg'); if(el){el.textContent=text;el.style.color=bad?'#b42318':'#087443';} }

  function renderServices() {
    const q = ($('globalSearch')?.value || '').toLowerCase();
    const list = services.filter(visible).filter(x => serviceFilter === 'all' || String(x.category || x.type || '').toLowerCase() === serviceFilter).filter(x => !q || JSON.stringify(x).toLowerCase().includes(q));
    if($('serviceCount')) $('serviceCount').textContent=list.length;
    const cats=['all',...new Set(services.map(x=>String(x.category||x.type||'other').toLowerCase()).filter(Boolean))];
    if($('serviceChips')) $('serviceChips').innerHTML=cats.map(c=>`<button class="chip ${c===serviceFilter?'active':''}" data-service-filter="${esc(c)}">${esc(c==='all'?'All':c)}</button>`).join('');
    $('servicesList').innerHTML=list.length ? list.map(x=>{const p=phoneOf(x);return `<article class="card"><div class="row"><div class="thumb">${x.image?`<img class="thumb" src="${esc(x.image)}" alt="">`:'◉'}</div><div class="info"><h3>${esc(x.name||x.title||x.serviceName||'Service')}</h3><div class="muted">${esc(x.details||x.description||x.address||'')}</div><span class="tag">${esc(x.category||x.type||'other')}</span>${p?`<div class="actions"><a class="call" href="tel:${esc(p)}">Call</a><a class="call" target="_blank" rel="noopener" href="https://wa.me/${String(p).replace(/\D/g,'')}">WhatsApp</a></div>`:''}</div></div></article>`}).join(''):'<div class="notice">No services found.</div>';
  }

  function renderMarket() {
    const q=($('globalSearch')?.value||'').toLowerCase();
    const list=market.filter(visible).filter(x=>marketFilter==='all'||(String(x.listingType||'sell').toLowerCase()===(marketFilter==='buy'?'buy':'sell'))).filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q));
    if($('marketCount')) $('marketCount').textContent=list.length;
    $('marketList').innerHTML=list.length?list.map(x=>{const p=phoneOf(x);return `<article class="card"><div class="row"><div class="thumb">${x.image?`<img class="thumb" src="${esc(x.image)}" alt="">`:'◇'}</div><div class="info"><h3>${esc(x.productName||x.name||x.title||'Listing')}</h3><div class="muted">${esc(x.description||x.details||'')}</div>${x.price?`<b>₹${esc(x.price)}</b>`:''}<div><span class="tag">${String(x.listingType||'sell').toLowerCase()==='buy'?'Wanted':'For sale'}</span></div>${p?`<div class="actions"><a class="call" href="tel:${esc(p)}">Call</a><a class="call" target="_blank" rel="noopener" href="https://wa.me/${String(p).replace(/\D/g,'')}">WhatsApp</a></div>`:''}</div></div></article>`}).join(''):'<div class="notice">No listings found.</div>';
  }

  function setFirebaseStatus(text) { const s=$('dbStatus'); if(s) s.textContent=text; }
  function loadNode(path, assign) {
    if(!db) return;
    db.ref(path).on('value', snap => {
      const rows=[]; snap.forEach(c=>{const v=c.val();if(v&&typeof v==='object')rows.push({_key:c.key,...v});});
      assign(rows); assign===servicesSetter?renderServices():renderMarket(); setFirebaseStatus('Live');
    }, err => { console.error(path,err); setFirebaseStatus('Firebase error'); });
  }
  function servicesSetter(rows){ services=rows; }

  function showLogin() {
    openModal(`<h2>Admin login</h2><p class="muted">Sign in with the existing Firebase admin account.</p><label>Email</label><input id="adminEmail" type="email" autocomplete="username" placeholder="admin@email.com"><label>Password</label><input id="adminPassword" type="password" autocomplete="current-password" placeholder="Password"><div id="dcMsg" class="notice" style="margin-top:12px">Use your existing account.</div><button class="primary" id="adminLoginSubmit">Sign in</button>`);
    $('adminLoginSubmit').onclick=async()=>{msg('Signing in…');try{await auth.signInWithEmailAndPassword($('adminEmail').value.trim(),$('adminPassword').value);closeModal();showAdminPanel();}catch(e){console.error(e);msg(e.code==='auth/invalid-credential'?'Invalid email or password.':(e.message||'Login failed.'),true);}};
  }

  function showAdminPanel() {
    if(!auth?.currentUser) return showLogin();
    const email=auth.currentUser.email||'Admin';
    openModal(`<h2>Admin</h2><p class="muted">Signed in as ${esc(email)}</p><div id="adminList"><div class="notice">Loading pending submissions…</div></div><button class="outline" id="adminLogout" style="margin-top:12px">Sign out</button>`);
    $('adminLogout').onclick=()=>auth.signOut().then(closeModal);
    loadPendingAdmin();
  }
  async function loadPendingAdmin(){
    const box=$('adminList'); if(!box)return;
    try{
      const [a,b]=await Promise.all([db.ref('services').once('value'),db.ref('marketplace').once('value')]);
      const rows=[];
      a.forEach(c=>{const v=c.val();if(v&&['pending','submitted'].includes(statusOf(v)))rows.push({path:'services',key:c.key,v});});
      b.forEach(c=>{const v=c.val();if(v&&['pending','submitted'].includes(statusOf(v)))rows.push({path:'marketplace',key:c.key,v});});
      box.innerHTML=rows.length?rows.map(r=>`<div class="card" style="margin-top:10px"><b>${esc(r.v.name||r.v.productName||r.v.title||'Submission')}</b><div class="muted">${esc(r.v.description||r.v.details||r.v.phone||'')}</div><div class="actions"><button class="primary" style="width:auto;margin-top:0" data-approve="${esc(r.path+'/'+r.key)}">Approve</button><button class="outline" data-reject="${esc(r.path+'/'+r.key)}">Reject</button></div></div>`).join(''):'<div class="notice">No pending submissions.</div>';
      box.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>setApproval(b.dataset.approve,'approved'));
      box.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>setApproval(b.dataset.reject,'rejected'));
    }catch(e){console.error(e);box.innerHTML='<div class="notice" style="color:#b42318">Could not load admin queue.</div>';}
  }
  async function setApproval(path,status){try{await db.ref(path).update({status,reviewedAt:firebase.database.ServerValue.TIMESTAMP,reviewedBy:auth.currentUser?.email||'admin'});loadPendingAdmin();}catch(e){console.error(e);alert(e.message||'Update failed');}}

  function showEntry(type) {
    const isService=type==='service';
    openModal(`<h2>${isService?'Add a service':'Post in marketplace'}</h2><p class="muted">Your submission is saved to the existing DattaCity Firebase database.</p><form id="entryForm"><label>${isService?'Name':'Product name'}</label><input id="entryName" required placeholder="${isService?'Service or business name':'Product name'}"><label>${isService?'Category':'Listing type'}</label>${isService?'<input id="entryCategory" placeholder="e.g. repair, shop, transport">':'<select id="entryListing"><option value="sell">For sale</option><option value="buy">Wanted</option></select>'}<label>Phone</label><input id="entryPhone" inputmode="tel" placeholder="Mobile number"><label>${isService?'Details':'Description'}</label><textarea id="entryDetails" placeholder="Add useful details"></textarea><label>Image (optional)</label><input id="entryImage" type="file" accept="image/*"><div id="dcMsg" class="notice">Submit for admin approval.</div><button class="primary" type="submit">Submit</button></form>`);
    $('entryForm').onsubmit=async e=>{e.preventDefault();const btn=e.target.querySelector('button[type=submit]');btn.disabled=true;msg('Saving…');try{
      let image=''; const file=$('entryImage').files[0];
      if(file&&storage){const safe=file.name.replace(/[^a-z0-9._-]/gi,'_');const ref=storage.ref().child(`dattaCity/${Date.now()}_${safe}`);await ref.put(file);image=await ref.getDownloadURL();}
      const common={name:$('entryName').value.trim(),phone:$('entryPhone').value.trim(),image,createdAt:firebase.database.ServerValue.TIMESTAMP,status:'pending'};
      if(isService){common.category=$('entryCategory').value.trim()||'other';common.details=$('entryDetails').value.trim();await db.ref('services').push(common);}else{common.productName=common.name;common.description=$('entryDetails').value.trim();common.listingType=$('entryListing').value;await db.ref('marketplace').push(common);}
      msg('Submitted successfully. Waiting for admin approval.'); e.target.reset();
    }catch(err){console.error(err);msg(err.code==='PERMISSION_DENIED'?'Firebase permission denied. Check the existing Realtime Database rules.':(err.message||'Could not save submission.'),true);}finally{btn.disabled=false;}
    };
  }

  window.loadWeather=async function(){try{const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=29.15&longitude=75.72&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata');const d=await r.json();$('weatherNow').innerHTML=`<b style="font-size:38px">${Math.round(d.current.temperature_2m)}°C</b><div class="muted">Hisar · live</div>`;$('weatherDays').innerHTML=d.daily.time.slice(0,5).map((x,i)=>`<div class="day"><b>${i?'Day '+(i+1):'Today'}</b><div>${Math.round(d.daily.temperature_2m_max[i])}° / ${Math.round(d.daily.temperature_2m_min[i])}°</div></div>`).join('');}catch(e){$('weatherNow').textContent='Weather unavailable';}};
  window.loadMandi=async function(){const box=$('mandiTable');box.innerHTML='<div class="notice">Loading live mandi prices…</div>';try{const r=await fetch('/api/mandi?t='+Date.now(),{cache:'no-store'});const d=await r.json();window.mandi=d.records||[];renderMandi();}catch(e){box.innerHTML='<div class="notice">Live mandi data unavailable. Try Refresh.</div>';}};
  function renderMandi(){const q=($('mandiSearch')?.value||'').toLowerCase();const list=(window.mandi||[]).filter(x=>`${x.commodity} ${x.market}`.toLowerCase().includes(q));$('mandiTable').innerHTML=list.length?`<table><tr><th>Crop</th><th>Mandi</th><th>Min</th><th>Max</th><th>Modal</th></tr>${list.map(x=>`<tr><td>${esc(x.commodity)}</td><td>${esc(x.market)}</td><td>₹${esc(x.min_price)}</td><td>₹${esc(x.max_price)}</td><td><b>₹${esc(x.modal_price)}</b></td></tr>`).join('')}</table>`:'<div class="notice">No matching prices.</div>';}

  document.addEventListener('DOMContentLoaded',()=>{
    bindNavigation();
    $('globalSearch').oninput=()=>{renderServices();renderMarket();};
    $('mandiSearch').oninput=renderMandi; $('mandiRefresh').onclick=window.loadMandi;
    document.addEventListener('click',e=>{const s=e.target.closest('[data-service-filter]');if(s){serviceFilter=s.dataset.serviceFilter;renderServices();}const m=e.target.closest('[data-market-filter]');if(m){marketFilter=m.dataset.marketFilter;document.querySelectorAll('[data-market-filter]').forEach(x=>x.classList.toggle('active',x===m));renderMarket();}const add=e.target.closest('[data-add]');if(add){e.preventDefault();showEntry(add.dataset.add);}if(e.target.closest('#adminBtn')){e.preventDefault();auth?.currentUser?showAdminPanel():showLogin();}},true);
    try{
      const config={apiKey:'AIzaSyCvaXtUjp8xY5nRFXroL-H1ospFSgM7qQ0',authDomain:'superkisan-33b7e.firebaseapp.com',databaseURL:'https://superkisan-33b7e-default-rtdb.firebaseio.com',projectId:'superkisan-33b7e',storageBucket:'superkisan-33b7e.firebasestorage.app',messagingSenderId:'744234922644',appId:'1:744234922644:web:20b4c062d50d6265fdba81'};
      if(!firebase.apps.length)firebase.initializeApp(config); db=firebase.database(); auth=firebase.auth(); storage=firebase.storage();
      auth.onAuthStateChanged(u=>{const b=$('adminBtn');if(b)b.textContent=u?'Admin ✓':'Admin';});
      db.ref('services').on('value',snap=>{services=[];snap.forEach(c=>{const v=c.val();if(v&&typeof v==='object')services.push({_key:c.key,...v});});renderServices();setFirebaseStatus('Live');},err=>{console.error(err);setFirebaseStatus('Firebase error');});
      db.ref('marketplace').on('value',snap=>{market=[];snap.forEach(c=>{const v=c.val();if(v&&typeof v==='object')market.push({_key:c.key,...v});});renderMarket();},err=>console.error(err));
    }catch(e){console.error('Firebase unavailable',e);setFirebaseStatus('Offline');}
  },{once:true});
})();
