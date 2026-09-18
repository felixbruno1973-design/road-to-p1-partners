(()=>{'use strict';
window.RTP_VERSION_LOCK='1.0.5';
const SCORESTORE='roadToP1PartnersV104Scores';
let META={};
const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function readScores(){try{return JSON.parse(localStorage.getItem(SCORESTORE)||'{}')}catch(e){return{}}}
function parseRangeMax(v){const a=String(v||'').match(/\d[\d\s.]*/g)||[];const n=a.map(x=>Number(x.replace(/[\s.]/g,''))).filter(Boolean);return n.length?Math.max(...n):0}
function metrics(name,match){
 const K=window.RTP102_KNOWLEDGE||{},d=K[name]||{},m=META[name]||{};
 const text=norm([m.sector,m.zone,m.tags,d.v,d.s,d.a].join(' '));
 let strategic=48;
 if(/sport automobile|karting|competition|automobile|pilote|performance/.test(text))strategic+=22;
 if(/jeunesse|egalite|mixite|diversite|inclusion|jeunes/.test(text))strategic+=11;
 if(d.s&&!/identifier|a identifier/.test(norm(d.s)))strategic+=8;
 if(/local|territoire|regional|reseau|concession/.test(text))strategic+=7;
 strategic=clamp(strategic);
 const mx=parseRangeMax(m.range),budget=mx?clamp(40+(mx/25000)*60):60;
 const potential=clamp((Number(match)||0)*.55+strategic*.30+budget*.15);
 let access=42;
 if(Array.isArray(d.l)&&d.l.length)access+=8;
 const v=d.verified||{};
 if(v.email)access+=22;
 if(v.phone)access+=14;
 if(v.form)access+=6;
 if(/local|territoire|regional|reseau|concession/.test(text))access+=8;
 const saved=readScores(),custom=[];
 for(const level of ['1','2','3','4']){const x=saved[name+'::'+level];if(x&&Number.isFinite(Number(x.access)))custom.push(Number(x.access))}
 if(custom.length)access=Math.round((access+Math.max(...custom))/2);
 access=clamp(access);
 const action=clamp(potential*.65+access*.35);
 return{potential,access,action};
}
function style(){
 if(document.getElementById('r105style'))return;
 const s=document.createElement('style');s.id='r105style';s.textContent=`
.r103flow{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}
.r103contact{padding:14px!important;border-radius:12px!important}
.r103contact h6{font-size:14px!important;line-height:1.28!important;margin:10px 0 7px!important}
.r103name{font-size:14px!important;line-height:1.35!important}
.r103role{font-size:12px!important;line-height:1.42!important;margin:4px 0 10px!important}
.r103row{font-size:12px!important;line-height:1.42!important;margin:6px 0!important}
.r103action{font-size:12px!important;line-height:1.52!important;margin-top:10px!important;padding-top:10px!important}
.r103badge{font-size:10px!important;padding:5px 8px!important}
.r103links a{font-size:10px!important;padding:7px 9px!important}
.r103level{width:30px!important;height:30px!important;font-size:12px!important}
.r103priority{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:max-content!important;white-space:nowrap!important;border:1px solid #744046!important;background:#251519!important;border-radius:999px!important;padding:5px 8px!important;font-size:10px!important;line-height:1!important}
.r104scores{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;margin-top:12px!important}
.r104score{padding:8px 6px!important;min-width:0!important}
.r104score span{font-size:10px!important;line-height:1.2!important;letter-spacing:.02em!important;white-space:nowrap!important}
.r104score b{font-size:16px!important;margin-top:4px!important}
.r104rank{font-size:10px!important;line-height:1.35!important;margin-top:7px!important}
.r104modalactions{position:sticky!important;bottom:0!important;z-index:3!important;background:#0d1419!important;box-shadow:0 -10px 22px rgba(0,0,0,.28)!important}
#r104Apply{min-width:235px!important;font-size:12px!important;padding:11px 15px!important}
.r105rowmetrics{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
.r105chip{display:inline-flex;align-items:center;gap:4px;border:1px solid #35424b;background:#11191f;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:800;color:#aeb8be;white-space:nowrap}
.r105chip b{color:#eef2f4;font-size:10px}
.r105chip.action{border-color:#694047;background:#211418;color:#ffb1b5}
@media(max-width:760px){.r103flow{grid-template-columns:1fr!important}.r103contact h6,.r103name{font-size:14px!important}.r104score span{font-size:9px!important}}
`;document.head.appendChild(s)
}
function toast(msg){const e=document.getElementById('toast');if(!e)return;e.textContent=msg;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1900)}
async function loadMeta(){
 try{
  const t=await fetch('app.js?v=105').then(r=>r.text());
  const m=t.match(/const CANDIDATES=(\[[\s\S]*?\]);\s*\n\s*let D=/);
  if(m){const a=Function('return '+m[1])();META=Object.fromEntries(a.map(x=>[x.name,x]))}
 }catch(e){}
}
function ensureSortOptions(){
 const s=document.getElementById('r2Sort');if(!s)return;
 const opts=[
  ['potential105','Potentiel partenariat'],
  ['access105','Facilité d’accès'],
  ['priority105','Priorité d’action']
 ];
 for(const [v,l] of opts)if(!s.querySelector('option[value="'+v+'"]')){const o=document.createElement('option');o.value=v;o.textContent=l;s.appendChild(o)}
}
function decorateRows(){
 const rows=document.querySelectorAll('#r2List .r2row');
 rows.forEach(row=>{
  const name=row.querySelector('.r2name')?.textContent.trim()||'';
  const match=parseInt(row.querySelector('.r2match')?.textContent||'0',10)||0;
  const x=metrics(name,match);
  row.dataset.potential=String(x.potential);row.dataset.access=String(x.access);row.dataset.action=String(x.action);
  let box=row.querySelector('.r105rowmetrics');
  if(!box){box=document.createElement('div');box.className='r105rowmetrics';const host=row.children[1]||row.children[0];host?.appendChild(box)}
  if(box)box.innerHTML='<span class="r105chip">Potentiel <b>'+x.potential+'</b></span><span class="r105chip">Accès <b>'+x.access+'</b></span><span class="r105chip action">Action <b>'+x.action+'</b></span>';
 });
 applyCustomSort();
}
function applyCustomSort(){
 const s=document.getElementById('r2Sort'),list=document.getElementById('r2List');if(!s||!list)return;
 const map={potential105:'potential',access105:'access',priority105:'action'},k=map[s.value];if(!k)return;
 const rows=[...list.querySelectorAll('.r2row')],sorted=[...rows].sort((a,b)=>(Number(b.dataset[k])||0)-(Number(a.dataset[k])||0)||String(a.querySelector('.r2name')?.textContent||'').localeCompare(String(b.querySelector('.r2name')?.textContent||''),'fr'));
 if(rows.every((r,i)=>r===sorted[i]))return;
 const f=document.createDocumentFragment();sorted.forEach(r=>f.appendChild(r));list.appendChild(f);
 const note=document.getElementById('r2N');if(note){const labels={potential105:'potentiel réel de partenariat',access105:'facilité d’accès',priority105:'priorité d’action'};note.textContent=rows.length+' entreprise'+(rows.length>1?'s':'')+' • classées par '+labels[s.value]}
}
function fixMailModal(){
 const b=document.getElementById('r104Apply');if(!b)return;
 b.textContent='✓ Enregistrer le nouveau mail';
 b.title='Enregistrer ce mail modifié dans la fiche entreprise';
 if(!b.dataset.v105wrapped){
  b.dataset.v105wrapped='1';const old=b.onclick;
  b.onclick=function(e){if(old)old.call(this,e);setTimeout(()=>toast('Nouveau mail enregistré dans la fiche entreprise.'),20)}
 }
 const h=document.getElementById('r104VoiceHint');
 if(h&&!h.dataset.v105){h.dataset.v105='1';h.textContent='Modifiez au clavier ou par dictée vocale, puis cliquez sur « Enregistrer le nouveau mail ». Le texte remplacera la proposition actuelle.'}
}
function stamp(){
 const ver=window.RTP_VERSION_LOCK||'1.0.5';
 document.title='ROAD TO P1 Partners — V'+ver;
 const v=document.querySelector('.version');if(v)v.innerHTML='ROAD TO P1 Partners<br>V'+ver;
 const f=document.querySelector('.footer');if(f)f.textContent='ROAD TO P1 Partners • V'+ver+' • Données enregistrées localement dans ce navigateur';
 const m=document.querySelector('#view-research .panel-head .meta');if(m)m.textContent='V'+ver;
}
let pending=false;
function refresh(){
 if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;style();stamp();ensureSortOptions();decorateRows();fixMailModal()})
}
async function boot(){
 style();stamp();ensureSortOptions();fixMailModal();await loadMeta();refresh();
 const root=document.getElementById('view-research')||document.body;
 new MutationObserver(refresh).observe(root,{childList:true,subtree:true});
 document.addEventListener('change',e=>{if(e.target?.id==='r2Sort')setTimeout(refresh,0)},true);
 document.querySelector('[data-view="research"]')?.addEventListener('click',()=>setTimeout(refresh,40));
 setInterval(stamp,1500);
}
setTimeout(boot,0);
})();