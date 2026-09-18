(()=>{'use strict';
window.RTP_VERSION_LOCK='1.0.7';
const RKEY='roadToP1PartnersResearchV102',PKEY='roadToP1PartnersV100',AKEY='roadToP1PartnersAlertsV107',SEEN='roadToP1PartnersAlertedV107';
let CAND=[];
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const fd=v=>v?String(v).slice(0,10).split('-').reverse().join('/'):'—';
function toast(msg){const e=document.getElementById('toast');if(!e)return;e.textContent=msg;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)}
function rr(){try{return JSON.parse(localStorage.getItem(RKEY)||'{"records":{}}')}catch(e){return{records:{}}}}
function pp(){try{return JSON.parse(localStorage.getItem(PKEY)||'{"items":[]}')}catch(e){return{items:[]}}}
function cname(id){return CAND.find(x=>x.id===id)?.name||id}
async function loadC(){
 try{const t=await fetch('app.js?v=107').then(r=>r.text()),m=t.match(/const CANDIDATES=(\[[\s\S]*?\]);\s*\n\s*let D=/);if(m)CAND=Function('return '+m[1])()}catch(e){}
}
function collect(){
 const st=rr(),by=new Map();
 for(const x of pp().items||[]){
  if(!x?.nextDate||x.status==='Signé')continue;
  const k=norm(x.company);
  by.set(k,{company:x.company,date:x.nextDate,action:x.nextAction||'Relance',contact:x.contact||'',stage:x.status||'Prospect',type:'prospect',id:x.id})
 }
 for(const [id,r] of Object.entries(st.records||{})){
  if(!r?.followDate||r.abandonedAt)continue;
  const company=cname(id),k=norm(company),cur=by.get(k);
  const o={company,date:r.followDate,action:r.followNote||'Relance email',contact:r.contactName||'',stage:r.responseAt?'Réponse reçue':r.mailAt?'Mail envoyé':'Étudié',type:'research',id};
  if(!cur||String(o.date)<String(cur.date))by.set(k,o)
 }
 return [...by.values()].sort((a,b)=>String(a.date).localeCompare(String(b.date))||a.company.localeCompare(b.company,'fr'))
}
function style(){
 if(document.getElementById('r107style'))return;
 const s=document.createElement('style');s.id='r107style';s.textContent=`
.r107headtools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.r107alert{border:1px solid #475761;background:#162129;color:#e8eef1;border-radius:8px;padding:7px 9px;font-size:10px;font-weight:800}
.r107alert.on{border-color:#356247;background:#12241a;color:#9ce2b5}
.r107navbadge{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#8e2f36;color:#fff;font-size:9px;font-weight:900;margin-left:auto}
.r107due td{background:rgba(116,45,50,.12)}
.r107date.due{color:#ff9da1;font-weight:900}
.r107src{font-size:9px;color:#7f8b94;margin-top:2px}
`;document.head.appendChild(s)
}
function render(){
 const view=document.getElementById('view-followups'),body=document.getElementById('followupBody');if(!view||!body)return;
 const L=collect(),due=L.filter(x=>x.date<=today()).length;
 body.innerHTML=L.map(x=>`<tr class="${x.date<=today()?'r107due':''}"><td class="r107date ${x.date<=today()?'due':''}">${fd(x.date)}</td><td><b>${esc(x.company)}</b><div class="r107src">${x.type==='research'?'Recherche':'Prospect'}</div></td><td>${esc(x.contact||'—')}</td><td>${esc(x.action)}</td><td><span class="status-pill">${esc(x.stage)}</span></td><td>—</td><td><button class="btn small" data-r107-type="${x.type}" data-r107-id="${esc(x.id)}">Voir</button></td></tr>`).join('');
 const empty=document.getElementById('followupEmpty');if(empty)empty.classList.toggle('hidden',!!L.length);
 const panel=view.querySelector('.panel-head');if(panel){
  let wrap=panel.querySelector('.r107headtools');
  if(!wrap){wrap=document.createElement('div');wrap.className='r107headtools';panel.querySelector('.meta')?.remove();panel.appendChild(wrap)}
  wrap.innerHTML=`<span class="meta">${L.length} relance${L.length>1?'s':''} planifiée${L.length>1?'s':''} • ${due} à traiter</span><button class="r107alert" id="r107AlertBtn"></button>`;
  const b=document.getElementById('r107AlertBtn');if(b){paintAlert(b);b.onclick=enableAlerts}
 }
 const nav=document.querySelector('.nav button[data-view="followups"]');if(nav){
  let badge=nav.querySelector('.r107navbadge');if(due){if(!badge){badge=document.createElement('span');badge.className='r107navbadge';nav.appendChild(badge)}badge.textContent=String(due)}else badge?.remove()
 }
 document.querySelectorAll('[data-r107-type]').forEach(b=>b.onclick=()=>openItem(b.dataset.r107Type,b.dataset.r107Id));
 checkAlerts(L)
}
function openItem(type,id){
 if(type==='research'){
  document.querySelector('.nav button[data-view="research"]')?.click();
  setTimeout(()=>document.querySelector(`[data-c="${CSS.escape(id)}"]`)?.click(),80)
 }else{
  document.querySelector('.nav button[data-view="prospects"]')?.click();
  setTimeout(()=>document.querySelector(`[data-open="${CSS.escape(id)}"]`)?.click(),80)
 }
}
function NAPI(){try{return window.Notification||window.top?.Notification||null}catch(e){return window.Notification||null}}
function paintAlert(b){
 const N=NAPI(),on=localStorage.getItem(AKEY)==='on';
 if(!N){b.textContent='🔕 Alertes non prises en charge';b.disabled=true;return}
 if(N.permission==='denied'){b.textContent='🔕 Notifications refusées';b.disabled=true;return}
 if(on&&N.permission==='granted'){b.textContent='🔔 Alertes navigateur actives';b.classList.add('on')}
 else{b.textContent='🔔 Activer les alertes navigateur';b.classList.remove('on')}
}
async function enableAlerts(){
 const N=NAPI();if(!N)return toast('Notifications non prises en charge par ce navigateur.');
 try{
  const p=N.permission==='granted'?'granted':await N.requestPermission();
  if(p==='granted'){localStorage.setItem(AKEY,'on');toast('Alertes navigateur activées.');render()}
  else toast('Autorisation de notification non accordée.')
 }catch(e){toast('Impossible d’activer les notifications dans ce navigateur.')}
}
function readSeen(){try{return JSON.parse(localStorage.getItem(SEEN)||'{}')}catch(e){return{}}}
function checkAlerts(list=collect()){
 const N=NAPI();if(!N||N.permission!=='granted'||localStorage.getItem(AKEY)!=='on')return;
 const seen=readSeen();let changed=false;
 for(const x of list.filter(x=>x.date<=today())){
  const k=norm(x.company)+'|'+x.date;if(seen[k])continue;
  try{new N('ROAD TO P1 Partners — relance à effectuer',{body:x.company+' • '+x.action,tag:'rtp-'+k})}catch(e){}
  seen[k]=new Date().toISOString();changed=true
 }
 if(changed)localStorage.setItem(SEEN,JSON.stringify(seen))
}
function stamp(){
 window.RTP_VERSION_LOCK='1.0.7';document.title='ROAD TO P1 Partners — V1.0.7';
 const v=document.querySelector('.version');if(v)v.innerHTML='ROAD TO P1 Partners<br>V1.0.7';
 const f=document.querySelector('.footer');if(f)f.textContent='ROAD TO P1 Partners • V1.0.7 • Liste cumulative et relances consolidées';
 const m=document.querySelector('#view-research .panel-head .meta');if(m)m.textContent='V1.0.7'
}
async function boot(){
 style();stamp();await loadC();render();
 document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{stamp();render()},80)));
 document.addEventListener('rtp:research-refresh',()=>setTimeout(render,40));
 setInterval(()=>{stamp();if(document.getElementById('view-followups')?.classList.contains('active'))render();else checkAlerts()},60000)
}
setTimeout(boot,0);
})();