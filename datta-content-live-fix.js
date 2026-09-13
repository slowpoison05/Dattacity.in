(()=>{
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
let latest=null;
function render(){
  const root=document.querySelector('.updates');
  const d=latest?.updates;
  if(!root||!d)return false;
  const cards=root.querySelectorAll('.updateCard');
  if(!cards.length)return false;
  const card=cards[0];
  const h=card.querySelector('h3');
  if(h&&d.title)h.textContent=d.title;
  let row=card.querySelector('.dcManagedUpdate');
  if(!row){row=document.createElement('div');row.className='dcManagedUpdate';row.style.cssText='margin-top:12px;padding-top:12px;border-top:1px solid #e4e6df';card.appendChild(row)}
  if(d.body){
    row.innerHTML='<b>'+esc(d.title||'Community Note')+'</b><p style="margin:6px 0 0;color:#69736d;font-size:12px;line-height:1.55">'+esc(d.body)+'</p>';
    row.style.display='block';
  }else row.style.display='none';
  return true;
}
function start(){
  if(!window.firebase?.database){setTimeout(start,300);return}
  window.firebase.database().ref('siteContent').on('value',s=>{latest=s.val()||{};render()});
  const observer=new MutationObserver(()=>render());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  let n=0;const timer=setInterval(()=>{render();if(++n>120)clearInterval(timer)},100);
}
start();
})();