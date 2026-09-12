(()=>{
  const CORE='https://raw.githubusercontent.com/slowpoison05/Dattacity.in/d2259a62c81e7fa9da3052e4007aeaa460210e37/app-modern.js';
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const photos=v=>Array.isArray(v?.photos)?v.photos.filter(Boolean):(v?.photoURL||v?.image||v?.imageUrl||v?.photo||v?.profilePhoto?[v.photoURL||v.image||v.imageUrl||v.photo||v.profilePhoto]:[]);
  const first=(v,...keys)=>keys.map(k=>v?.[k]).find(x=>x!==undefined&&x!==null&&String(x).trim()!=='');

  function injectServices(){
    if(document.getElementById('dattacity-existing-services')) return;
    const page=document.querySelector('main.page');
    if(!page) return;
    const home=document.getElementById('home');
    if(!home) return;
    const section=document.createElement('section');
    section.id='dattacity-existing-services';
    section.className='section';
    section.innerHTML=`<div class="sectionHead"><div><div class="kicker">EXISTING DATTACITY SERVICES</div><h2>Local services, kept intact.</h2><p class="sectionLead">Your existing Firebase service listings appear here. Nothing is replaced.</p></div></div><div id="servicesList" class="cards" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px"></div>`;
    home.appendChild(section);
    const kh=document.createElement('section');
    kh.className='section';
    kh.innerHTML=`<div class="cta" style="margin-top:0"><div><div class="kicker" style="color:#ead6a5">FARMER SUPPORT</div><h2>Kheti Health Centre</h2><p>Open the existing farmer-focused health centre.</p></div><button type="button" id="khetiHealthBtn">Open Kheti Health Centre ↗</button></div>`;
    home.appendChild(kh);
    document.getElementById('khetiHealthBtn').addEventListener('click',()=>window.location.href='https://kheti.dattacity.in');
    const style=document.createElement('style');
    style.textContent=`#dattacity-existing-services .service-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:18px;box-shadow:0 10px 30px rgba(22,40,31,.05)}#dattacity-existing-services .service-card .service-row{display:flex;gap:14px;align-items:flex-start}#dattacity-existing-services .service-card .service-photo{width:72px;height:72px;border-radius:16px;object-fit:cover;background:#eef2ed;flex:none}#dattacity-existing-services .service-card h3{font-family:Manrope;margin:0 0 5px;font-size:18px}#dattacity-existing-services .service-card p{margin:4px 0;color:var(--muted);font-size:12px;line-height:1.5}#dattacity-existing-services .service-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}#dattacity-existing-services .service-actions a{display:inline-block;text-decoration:none;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:700;background:var(--green);color:#fff}@media(max-width:700px){#dattacity-existing-services .cards{grid-template-columns:1fr!important}#dattacity-existing-services .service-card{padding:15px}}`;
    document.head.appendChild(style);
  }

  function renderServices(rows){
    const list=document.getElementById('servicesList');
    if(!list) return;
    if(!rows.length){list.innerHTML='<div class="notice">No services found in the existing Firebase services collection.</div>';return;}
    list.innerHTML=rows.map(item=>{
      const name=first(item,'name','title','serviceName')||'Local service';
      const category=first(item,'category','type','serviceType')||'Service';
      const description=first(item,'description','about','details')||'';
      const phone=first(item,'phone','phoneNumber','mobile','contact','contactNumber');
      const p=photos(item)[0];
      return `<article class="service-card"><div class="service-row">${p?`<img class="service-photo" src="${esc(p)}" alt="" loading="lazy">`:'<div class="service-photo">◉</div>'}<div style="min-width:0;flex:1"><h3>${esc(name)}</h3><p><strong>${esc(category)}</strong></p>${description?`<p>${esc(description)}</p>`:''}${phone?`<div class="service-actions"><a href="tel:${esc(phone)}">Call ${esc(phone)}</a></div>`:''}</div></div></article>`;
    }).join('');
  }

  function installServiceNavigation(){
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-go="services"]');
      if(!b) return;
      const target=document.getElementById('dattacity-existing-services');
      if(!target) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      target.scrollIntoView({behavior:'smooth',block:'start'});
    },true);
  }

  async function start(){
    try{
      if(window.firebase&&typeof window.firebase.storage!=='function') window.firebase.storage=()=>null;
      const code=await fetch(CORE,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Core load failed');return r.text()});
      (0,eval)(code);
      if(document.readyState!=='loading') document.dispatchEvent(new Event('DOMContentLoaded'));
      injectServices();
      installServiceNavigation();
      const db=window.firebase?.database?.();
      if(!db){console.warn('DattaCity Firebase database is unavailable');return;}
      db.ref('services').on('value',snap=>{
        const rows=[];
        snap.forEach(c=>{const v=c.val();if(v&&typeof v==='object')rows.push(v)});
        renderServices(rows);
        const count=document.getElementById('serviceCount');
        if(count) count.textContent=rows.length;
        const status=document.getElementById('dbStatus');
        if(status) status.textContent='Connected';
      },err=>{
        console.error('Firebase services read failed',err);
        const status=document.getElementById('dbStatus');
        if(status) status.textContent='Offline';
      });
    }catch(e){console.error('DattaCity startup/Firebase compatibility',e)}
  }
  start();
})();