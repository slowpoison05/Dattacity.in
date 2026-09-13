(()=>{
'use strict';
function addHub(){
  const home=document.getElementById('home');
  if(!home||document.getElementById('dattacity-service-hub'))return;
  const style=document.createElement('style');
  style.textContent='.dcHubGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.dcHubCard{border:1px solid #e4e6df;background:#fff;border-radius:20px;padding:18px;min-height:175px;text-align:left;cursor:pointer;color:#15201b}.dcHubIcon{width:42px;height:42px;border-radius:13px;background:#dfe9df;display:grid;place-items:center;font-size:20px}.dcHubCard strong{display:block;margin-top:14px;font-size:15px}.dcHubCard small{display:block;color:#69736d;line-height:1.45;margin-top:6px}.dcHubArrow{display:block;color:#176b46;font-size:11px;font-weight:800;margin-top:14px}.dcHubModal{position:fixed;inset:0;background:rgba(10,18,14,.62);z-index:100001;display:none;align-items:center;justify-content:center;padding:12px}.dcHubModal.open{display:flex}.dcHubSheet{width:min(1100px,100%);height:94vh;overflow:auto;background:#fff;border-radius:24px;padding:20px}.dcHubClose{float:right;border:1px solid #e4e6df;background:#fff;border-radius:11px;width:42px;height:42px;font-size:22px}.dcHubFrame{display:block;width:100%;height:calc(94vh - 130px);min-height:520px;border:0;border-radius:16px;background:#f6f8f5}@media(max-width:900px){.dcHubGrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.dcHubGrid{grid-template-columns:1fr}.dcHubSheet{height:96vh;padding:14px}.dcHubFrame{height:calc(96vh - 120px);min-height:500px}}';
  document.head.appendChild(style);
  const sec=document.createElement('section');
  sec.id='dattacity-service-hub';sec.className='section reveal';
  sec.innerHTML='<div class="sectionHead"><div><div class="kicker">DATTACITY SERVICES</div><h2>Your village services</h2><p class="sectionLead">Important DattaCity services, together in one place.</p></div></div><div class="dcHubGrid"><button class="dcHubCard" data-dc-hub="services"><span class="dcHubIcon">◉</span><strong>My Services</strong><small>Browse all local services.</small><span class="dcHubArrow">Open Services →</span></button><button class="dcHubCard" data-dc-hub="sarpanch"><span class="dcHubIcon">🏛</span><strong>Sarpanch Works</strong><small>Datta Panchayat profile, funds and proposed activities.</small><span class="dcHubArrow">View Datta Data →</span></button><button class="dcHubCard" data-dc-hub="complaint"><span class="dcHubIcon">⚠</span><strong>Complaint Portal</strong><small>Village complaints and local issues.</small><span class="dcHubArrow">Coming soon</span></button><button class="dcHubCard" data-dc-hub="kheti"><span class="dcHubIcon">🌿</span><strong>Kheti Health Centre</strong><small>Farmer support and crop health.</small><span class="dcHubArrow">Open Centre →</span></button><button class="dcHubCard" data-dc-hub="sports"><span class="dcHubIcon">🏃</span><strong>Sports</strong><small>Village sports and activities.</small><span class="dcHubArrow">Coming soon</span></button></div>';
  home.appendChild(sec);
  const modal=document.createElement('div');modal.id='dcHubModal';modal.className='dcHubModal';modal.innerHTML='<div class="dcHubSheet"><button class="dcHubClose" id="dcHubClose">×</button><div class="kicker">GRAM PANCHAYAT DATTA</div><h2 style="margin:6px 0">Datta Panchayat — Sarpanch Works</h2><p class="muted">GP/LGD Code 29766 • Hansi-I, Hisar, Haryana</p><iframe class="dcHubFrame" src="./datta-meri-panchayat.html?v=3" title="Datta Panchayat works and Meri Panchayat data"></iframe></div></div>';
  document.body.appendChild(modal);
  document.getElementById('dcHubClose').onclick=()=>modal.classList.remove('open');
  modal.onclick=e=>{if(e.target===modal)modal.classList.remove('open')};
  sec.querySelectorAll('[data-dc-hub]').forEach(b=>b.onclick=()=>{
    const action=b.dataset.dcHub;
    if(action==='services'){const target=document.querySelector('[data-go="services"]');if(target)target.click();}
    else if(action==='sarpanch')modal.classList.add('open');
    else if(action==='kheti')location.href='https://kheti.dattacity.in';
    else if(action==='complaint'||action==='sports')alert('This DattaCity service is being prepared.');
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addHub,{once:true});else addHub();
})();
