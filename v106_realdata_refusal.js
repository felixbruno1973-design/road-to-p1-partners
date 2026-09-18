(()=>{'use strict';
window.RTP_VERSION_LOCK='1.0.6';
const RKEY='roadToP1PartnersResearchV102', PKEY='roadToP1PartnersV100';
let CAND=[];
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const today=()=>new Date().toISOString().slice(0,10);
function toast(msg){const e=document.getElementById('toast');if(!e)return;e.textContent=msg;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2100)}
function readResearch(){try{return JSON.parse(localStorage.getItem(RKEY)||'{"searches":[],"records":{}}')}catch(e){return{searches:[],records:{}}}}
function writeResearch(x){localStorage.setItem(RKEY,JSON.stringify(x))}
function readProspects(){try{return JSON.parse(localStorage.getItem(PKEY)||'{"items":[]}')}catch(e){return{items:[]}}}
function isDemo(x){return /^entreprise\s+d[eé]mo\b/i.test(String(x?.company||''))||/d[eé]monstration/i.test(String(x?.notes||''))}
function cleanDemo(){
 const p=readProspects(),before=(p.items||[]).length;
 p.items=(p.items||[]).filter(x=>!isDemo(x));
 if(p.items.length!==before){
  localStorage.setItem(PKEY,JSON.stringify(p));
  if(!sessionStorage.getItem('rtp106-demo-cleaned')){sessionStorage.setItem('rtp106-demo-cleaned','1');location.reload();return true}
 }
 return false
}
async function loadCandidates(){
 try{
  const t=await fetch('app.js?v=106').then(r=>r.text()),m=t.match(/const CANDIDATES=(\[[\s\S]*?\]);\s*\n\s*let D=/);
  if(m)CAND=Function('return '+m[1])()
 }catch(e){}
}
function cname(id){return CAND.find(x=>x.id===id)?.name||id}
function cid(name){return CAND.find(x=>norm(x.name)===norm(name))?.id||''}
function record(id){const st=readResearch();return st.records?.[id]||{}}
function allTracked(){
 const st=readResearch(),ids=new Set();
 for(const [id,r] of Object.entries(st.records||{}))if(r.studiedAt||r.mailAt||r.responseAt||r.abandonedAt)ids.add(id);
 return ids
}
function uniqueMailed(){const st=readResearch();return Object.values(st.records||{}).filter(r=>r.mailAt).length}
function sendsRecorded(){const st=readResearch();return Object.values(st.records||{}).reduce((n,r)=>n+(Array.isArray(r.mailEvents)?r.mailEvents.length:((r.mailAt?1:0)+(r.relanceAt?1:0))),0)}
function migrateMailEvents(){
 const st=readResearch();let changed=false;
 for(const r of Object.values(st.records||{})){
  if(!Array.isArray(r.mailEvents)){
   const a=[];if(r.mailAt)a.push({at:r.mailAt,type:'initial'});if(r.relanceAt&&r.relanceAt!==r.mailAt)a.push({at:r.relanceAt,type:'relance'});
   r.mailEvents=a;changed=true
  }
 }
 if(changed)writeResearch(st)
}
function logConfirmedMail(){
 const {id}=currentCompany();if(!id)return;
 setTimeout(()=>{
  const st=readResearch(),r=st.records?.[id];if(!r)return;
  r.mailEvents=Array.isArray(r.mailEvents)?r.mailEvents:[];
  const at=r.relanceAt||r.mailAt;if(!at)return;
  if(!r.mailEvents.some(e=>e.at===at)){r.mailEvents.push({at,type:r.relanceAt===at?'relance':'initial'});writeResearch(st);dashboard()}
 },80)
}
function replies(){const st=readResearch();return Object.values(st.records||{}).filter(r=>r.responseAt).length}
function stopped(){const st=readResearch();return Object.values(st.records||{}).filter(r=>r.abandonedAt).length}
function dueResearch(){const st=readResearch();return Object.values(st.records||{}).filter(r=>!r.abandonedAt&&!r.responseAt&&r.mailAt&&r.followDate&&r.followDate<=today()).length}
function style(){
 if(document.getElementById('r106style'))return;
 const s=document.createElement('style');s.id='r106style';s.textContent=`
#demoBtn{display:none!important}
#view-dashboard .kpis{grid-template-columns:repeat(3,minmax(160px,1fr))!important}
.r106kpi .value{font-variant-numeric:tabular-nums}
.r106abandon{border-color:#734047!important;background:#2a171b!important;color:#ffc2c5!important}
.r106reactivate{border-color:#356247!important;background:#12241a!important;color:#9ce2b5!important}
.r2row.r106stopped{border-color:#664248!important;background:linear-gradient(180deg,#1a1316,#10171c)!important;opacity:.9}
.r2row.r106stopped .r2name{text-decoration:line-through;text-decoration-color:#7c4b50}
.r106stopstat{color:#ff9da1!important;border-color:#744047!important;background:#281518!important}
.r106stopreason{font-size:9px;color:#bd8e92;margin-top:4px;line-height:1.35}
.r106overlay{position:fixed;inset:0;z-index:100000;background:rgba(3,6,8,.8);display:grid;place-items:center;padding:18px}
.r106overlay[hidden]{display:none}
.r106modal{width:min(520px,94vw);border:1px solid #414c54;border-radius:15px;background:#0e161b;box-shadow:0 25px 80px rgba(0,0,0,.6);overflow:hidden}
.r106head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.07)}
.r106head h3{font-size:15px;margin:0}
.r106body{padding:15px 16px;display:grid;gap:12px}
.r106body label{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#8d99a1;margin-bottom:5px}
.r106body select,.r106body textarea{width:100%;box-sizing:border-box;border:1px solid #35424b;border-radius:9px;background:#10181e;color:#eef2f4;padding:10px}
.r106body textarea{min-height:95px;resize:vertical}
.r106actions{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.07)}
.r106save{border:1px solid #a13d45;background:#7a2c32;color:#fff;border-radius:9px;padding:9px 13px;font-weight:800}
.r106cancel{border:1px solid #3b4650;background:#161f25;color:#fff;border-radius:9px;padding:9px 13px}
.r106realnote{font-size:9px;color:#7f8b94;margin-top:3px}
@media(max-width:900px){#view-dashboard .kpis{grid-template-columns:repeat(2,minmax(150px,1fr))!important}}
@media(max-width:560px){#view-dashboard .kpis{grid-template-columns:1fr!important}}
`;document.head.appendChild(s)
}
function stamp(){
 window.RTP_VERSION_LOCK='1.0.6';document.title='ROAD TO P1 Partners — V1.0.6';
 const v=document.querySelector('.version');if(v)v.innerHTML='ROAD TO P1 Partners<br>V1.0.6';
 const f=document.querySelector('.footer');if(f)f.textContent='ROAD TO P1 Partners • V1.0.6 • Données réelles enregistrées localement dans ce navigateur';
 const m=document.querySelector('#view-research .panel-head .meta');if(m)m.textContent='V1.0.6'
}
function kpi(label,id,hint){
 const d=document.createElement('div');d.className='kpi r106kpi';d.innerHTML='<div class="label">'+label+'</div><div class="value" id="'+id+'">0</div><div class="hint">'+hint+'</div>';return d
}
function dashboard(){
 const k=document.querySelector('#view-dashboard .kpis');if(!k)return;
 document.getElementById('demoBtn')?.remove();
 const real=readProspects().items?.filter(x=>!isDemo(x))||[],research=readResearch(),tracked=allTracked(),ab=stopped();
 const activeNames=new Set();
 for(const id of tracked)if(!research.records?.[id]?.abandonedAt)activeNames.add(norm(cname(id)));
 for(const x of real)if(x.status!=='Signé')activeNames.add(norm(x.company));
 const prospects=activeNames.size;
 const kp=document.getElementById('kpiProspects');if(kp){kp.textContent=String(prospects);kp.parentElement.querySelector('.label').textContent='Prospects actifs';kp.parentElement.querySelector('.hint').textContent='entreprises réellement suivies'}
 const kpa=document.getElementById('kpiA');if(kpa)kpa.textContent=String(real.filter(x=>x.priority==='A'&&x.status!=='Signé').length);
 const kr=document.getElementById('kpiFollowups');if(kr)kr.textContent=String(real.filter(x=>x.nextDate&&x.nextDate<=today()&&x.status!=='Signé').length+dueResearch());
 const km=document.getElementById('kpiPotential');if(km)km.textContent=new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(real.filter(x=>x.status!=='Signé').reduce((a,x)=>a+(+x.potential||0),0));
 const ks=document.getElementById('kpiSigned');if(ks)ks.textContent=new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(real.filter(x=>x.status==='Signé').reduce((a,x)=>a+(+x.signed||0),0));
 const defs=[['Mails envoyés','r106Mails','entreprises contactées : '+uniqueMailed()],['Réponses reçues','r106Replies','entreprises ayant répondu'],['Refus / abandons','r106Stopped','dossiers sortis de la prospection']];
 for(const [l,id,h] of defs)if(!document.getElementById(id))k.appendChild(kpi(l,id,h));
 document.getElementById('r106Mails').textContent=String(sendsRecorded());
 document.getElementById('r106Replies').textContent=String(replies());
 document.getElementById('r106Stopped').textContent=String(ab);
 const meta=document.querySelector('#view-dashboard .top-real-note');
 if(!meta){const n=document.createElement('div');n.className='r106realnote top-real-note';n.textContent='Tableau de bord calculé uniquement à partir des données réellement enregistrées — données de démonstration exclues.';k.after(n)}
}
function stopLabel(r){return r.abandonType==='refusal'?'Refus':'Abandonné'}
function decorateRows(){
 document.querySelectorAll('#r2List .r2row').forEach(row=>{
  const name=row.querySelector('.r2name')?.textContent.trim()||'',id=cid(name),r=id?record(id):{};
  row.classList.toggle('r106stopped',!!r.abandonedAt);
  const stat=row.querySelector('.r2stat');if(r.abandonedAt&&stat){
   stat.className='r2stat r106stopstat';stat.textContent=stopLabel(r);
   let reason=row.querySelector('.r106stopreason');if(!reason){reason=document.createElement('div');reason.className='r106stopreason';stat.parentElement.appendChild(reason)}
   reason.textContent=r.abandonReason||'Prospection arrêtée'
  }else row.querySelector('.r106stopreason')?.remove()
 })
}
function currentCompany(){
 const name=document.querySelector('#r2Work .r2head h3')?.textContent.trim()||'';return{name,id:cid(name)}
}
function injectAbandon(){
 const h=document.querySelector('#r2Work .r2head');if(!h)return;
 const {id}=currentCompany();if(!id)return;const r=record(id);
 const actions=h.lastElementChild;if(!actions)return;
 let b=document.getElementById('r106Abandon');
 if(!b){b=document.createElement('button');b.id='r106Abandon';b.className='btn';actions.appendChild(b)}
 if(r.abandonedAt){b.className='btn r106reactivate';b.textContent='↺ Réactiver';b.onclick=()=>reactivate(id)}
 else{b.className='btn r106abandon';b.textContent='⊘ Abandonner';b.onclick=()=>openStop(id)}
}
function modal(){
 let o=document.getElementById('r106Overlay');if(o)return o;
 o=document.createElement('div');o.id='r106Overlay';o.className='r106overlay';o.hidden=true;o.innerHTML='<div class="r106modal"><div class="r106head"><h3>Arrêter la prospection</h3><button class="r106cancel" id="r106X">×</button></div><div class="r106body"><div><label>Motif</label><select id="r106Type"><option value="refusal">Refus explicite de l’entreprise</option><option value="noresponse">Absence de réponse après relances</option><option value="out">Entreprise finalement hors cible</option><option value="other">Autre raison</option></select></div><div><label>Commentaire</label><textarea id="r106Reason" placeholder="Ex. réponse négative reçue le..., pas de budget sponsoring, absence de réponse après 3 relances..."></textarea></div></div><div class="r106actions"><button class="r106cancel" id="r106Cancel">Annuler</button><button class="r106save" id="r106Save">Confirmer l’arrêt</button></div></div>';document.body.appendChild(o);
 o.querySelector('#r106X').onclick=closeStop;o.querySelector('#r106Cancel').onclick=closeStop;o.addEventListener('click',e=>{if(e.target===o)closeStop()});return o
}
let stopId='';
function openStop(id){stopId=id;const o=modal(),r=record(id);document.getElementById('r106Type').value=r.abandonType||'refusal';document.getElementById('r106Reason').value=r.abandonReason||'';o.hidden=false;document.getElementById('r106Save').onclick=saveStop}
function closeStop(){const o=document.getElementById('r106Overlay');if(o)o.hidden=true;stopId=''}
function saveStop(){
 if(!stopId)return;const st=readResearch();st.records=st.records||{};const r=st.records[stopId]||(st.records[stopId]={});
 const type=document.getElementById('r106Type').value,reason=document.getElementById('r106Reason').value.trim();
 r.abandonedAt=new Date().toISOString();r.abandonType=type;r.abandonReason=reason||({refusal:'Refus explicite de l’entreprise',noresponse:'Absence de réponse après relances',out:'Entreprise finalement hors cible',other:'Prospection arrêtée'}[type]);
 r.followDate='';r.followNote='';delete r.abandonClearedAt;writeResearch(st);document.dispatchEvent(new CustomEvent('rtp:research-refresh'));closeStop();toast(type==='refusal'?'Entreprise classée en refus.':'Prospection abandonnée.');refresh()
}
function reactivate(id){
 const st=readResearch(),r=st.records?.[id];if(!r)return;delete r.abandonedAt;delete r.abandonType;delete r.abandonReason;r.abandonClearedAt=new Date().toISOString();writeResearch(st);document.dispatchEvent(new CustomEvent('rtp:research-refresh'));toast('Entreprise réactivée dans la prospection.');refresh()
}
function refresh(){style();stamp();dashboard();decorateRows();injectAbandon()}
async function boot(){
 if(cleanDemo())return;migrateMailEvents();style();stamp();modal();await loadCandidates();refresh();
 document.addEventListener('click',e=>{if(e.target?.id==='r2Sent')logConfirmedMail()},true);
 const root=document.querySelector('.main')||document.body;let lock=false;
 new MutationObserver(()=>{if(lock)return;lock=true;requestAnimationFrame(()=>{lock=false;refresh()})}).observe(root,{childList:true,subtree:true});
 document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,40)));
 setInterval(()=>{stamp();dashboard()},1800)
}
setTimeout(boot,0);
})();