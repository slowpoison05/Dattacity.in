(()=>{
'use strict';
function addHub(){
  const home=document.getElementById('home');
  if(!home)return false;
  if(document.getElementById('dattacity-service-hub'))return true;
  const style=document.createElement('style');
  style.id='dcHubStyles';
  style.textContent='.dcHubGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.dcHubCard{position:relative;text-align:left;border:1px solid #e4e6df;background:#fff;border-radius:20px;padding:18px;min-height:190px;color:#15201b;box-shadow:0 8px 28px rgba(16,24,40,.045);cursor:pointer}.dcHubIcon{width:42px;height:42px;border-radius:13px;background:#dfe9df;display:grid;place-items:center;font-size:20px}.dcHubCard strong{display:block;font-family:Manrope;font-size:16px;margin-top:14px}.dcHubCard small{display:block;color:#69736d;line-height:1.45;margin-top:6px;font-size:12px}.dcHubArrow{display:block;color:#176b46;font-size:11px;font-weight:800;margin-top:14px}.dcHubModal{position:fixed;inset:0;background:rgba(10,18,14,.62);z-index:100001;display:none;align-items:center;justify-content:center;padding:12px}.dcHubModal.open{display:flex}.dcHubSheet{width:min(1100px,100%);height:94vh;overflow:auto;background:#fff;border-radius:24px;padding:20px}.dcHubClose{float:right;border:1px solid #e4e6df;background:#fff;border-radius:11px;width:42px;height:42px;font-size:22px}.dcHubFrame{display:block;width:100%;height:calc(94vh - 130px);min-height:520px;border:0;border-radius:16px;background:#f6f8f5}@media(max-width:900px){.dcHubGrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.dcHubGrid{grid-template-columns:1fr}.dcHubSheet{height:96vh;padding:14px}.dcHubFrame{height:calc(96vh - 120px);min-height:500px}}';
  document.head.appendChild(style);
  const sec=document.createElement('section');
  sec.id='dattacity-service-hub';sec.className='section';
  sec.innerHTML='<div class="sectionHead"><div><div class="kicker">DATTACITY SERVICES</div><h2>Your village services</h2><p class="sectionLead">The important DattaCity services, together in one place.</p></div></div><div class="dcHubGrid"><button class="dcHubCard" id="dcMyServices" type="button"><span class="dcHubIcon">◉</span><strong>My Services</strong><small>Browse all local services from the existing Firebase directory.</small><span class="dcHubArrow">Open Services →</span></button><button class="dcHubCard" id="dcSarpanchHub" type="button"><span class="dcHubIcon">🏛</span><strong>Sarpanch Works</strong><small>Gram Panchayat Datta • official works, fund statement and Meri Panchayat activities.</small><span class="dcHubArrow">View Datta Panchayat Data →</span></button><button class="dcHubCard" id="dcComplaintHub" type="button"><span class="dcHubIcon">⚠</span><strong>Complaint Portal</strong><small>Raise and follow community complaints and local issues.</small><span class="dcHubArrow">Complaint Portal</span></button><button class="dcHubCard" id="dcKhetiHub" type="button"><span class="dcHubIcon">🌿</span><strong>Kheti Health Centre</strong><small>Farmer-focused health and agriculture support.</small><span class="dcHubArrow">Open Kheti Health Centre ↗</span></button><button class="dcHubCard" id="dcSportsHub" type="button"><span class="dcHubIcon">🏃</span><strong>Sports</strong><small>Village sports, matches, activities and player updates.</small><span class="dcHubArrow">Sports</span></button></div>';
  home.appendChild(sec);
  const modal=document.createElement('div');modal.id='dcHubModal';modal.className='dcHubModal';modal.innerHTML='<div class="dcHubSheet"><button class="dcHubClose" id="dcHubClose">×</button><div class="kicker">GRAM PANCHAYAT DATTA</div><h2 style="margin:6px 0">Datta Panchayat — Sarpanch Works</h2><p class="muted">GP/LGD Code 29766 • Hansi-I, Hisar, Haryana</p><iframe class="dcHubFrame" src="./datta-meri-panchayat.html?v=4" title="Datta Panchayat works and Meri Panchayat data"></iframe></div></div>';
  document.body.appendChild(modal);
  document.getElementById('dcHubClose').onclick=()=>modal.classList.remove('open');
  modal.onclick=e=>{if(e.target===modal)modal.classList.remove('open')};
  document.getElementById('dcMyServices').onclick=()=>document.querySelector('[data-go="services"]')?.click();
  document.getElementById('dcSarpanchHub').onclick=()=>modal.classList.add('open');
  document.getElementById('dcKhetiHub').onclick=()=>location.href='https://kheti.dattacity.in';
  document.getElementById('dcComplaintHub').onclick=()=>alert('The DattaCity Complaint Portal is being prepared.');
  document.getElementById('dcSportsHub').onclick=()=>alert('The DattaCity Sports service is being prepared.');
  return true;
}
function boot(){
  if(addHub())return;
  let tries=0;
  const timer=setInterval(()=>{if(addHub()||++tries>120)clearInterval(timer)},100);
  const observer=new MutationObserver(()=>{if(addHub())observer.disconnect()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
}
boot();
})();
