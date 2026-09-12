(()=>{
  const OLD='https://raw.githubusercontent.com/slowpoison05/Dattacity.in/3f0030624e32c4646c721fdcf7ad57dc854da4e2/app-modern.js';
  const PROFILE='https://haryanadp.gov.in/gram-panchayat/GPProfile.php?PanchayatId=29766-DATTA';
  const s=document.createElement('script');
  s.src=OLD;
  s.onload=()=>{
    const fix=()=>{
      const b=document.getElementById('dcSarpanchHub');
      if(!b)return false;
      b.innerHTML='<span class="dcHubIcon">🏛</span><strong>Sarpanch Works</strong><small>Haryana • Hisar • Hansi-I • Gram Panchayat Datta. Open the verified official Panchayat profile.</small><span class="dcHubArrow">Open Official Panchayat Profile ↗</span>';
      b.onclick=()=>window.open(PROFILE,'_blank','noopener');
      return true;
    };
    if(fix())return;
    let n=0;const t=setInterval(()=>{if(fix()||++n>100)clearInterval(t)},100);
  };
  s.onerror=()=>console.error('DattaCity core loader failed');
  document.head.appendChild(s);
})();