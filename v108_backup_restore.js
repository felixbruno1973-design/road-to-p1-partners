(()=>{'use strict';
const PREFIX='roadToP1Partners';
const VERSION='1.0.8';
const BACKUP_FORMAT='ROAD_TO_P1_PARTNERS_BACKUP';
const $=id=>document.getElementById(id);

function toast(msg){
 const e=$('toast');if(!e)return;
 e.textContent=msg;e.classList.add('show');
 setTimeout(()=>e.classList.remove('show'),2600);
}
function stamp(){
 window.RTP_VERSION_LOCK=VERSION;
 document.title='ROAD TO P1 Partners — V'+VERSION;
 const v=document.querySelector('.version');if(v)v.innerHTML='ROAD TO P1 Partners<br>V'+VERSION;
 const f=document.querySelector('.footer');if(f)f.textContent='ROAD TO P1 Partners • V'+VERSION+' • Données locales sauvegardables et restaurables';
 const m=document.querySelector('#view-research .panel-head .meta');if(m)m.textContent='V'+VERSION;
}
function collectStorage(){
 const data={};
 for(let i=0;i<localStorage.length;i++){
  const key=localStorage.key(i);
  if(key&&key.startsWith(PREFIX))data[key]=localStorage.getItem(key);
 }
 return data;
}
function downloadBackup(){
 const payload={
  format:BACKUP_FORMAT,
  version:VERSION,
  exportedAt:new Date().toISOString(),
  origin:location.origin,
  storage:collectStorage()
 };
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 const d=new Date(),pad=n=>String(n).padStart(2,'0');
 a.href=url;
 a.download=`road-to-p1-partners-backup-${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}.json`;
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 toast('Sauvegarde créée. Conservez le fichier JSON en lieu sûr.');
}
function validBackup(x){
 return x&&x.format===BACKUP_FORMAT&&x.storage&&typeof x.storage==='object'&&!Array.isArray(x.storage);
}
function snapshotBeforeRestore(){
 try{
  localStorage.setItem(PREFIX+'PreRestoreSnapshotV108',JSON.stringify({
   createdAt:new Date().toISOString(),
   storage:collectStorage()
  }));
 }catch(e){}
}
function restorePayload(payload){
 if(!validBackup(payload))throw new Error('Format de sauvegarde non reconnu.');
 const entries=Object.entries(payload.storage).filter(([k,v])=>k.startsWith(PREFIX)&&typeof v==='string');
 if(!entries.length)throw new Error('Cette sauvegarde ne contient aucune donnée Partners.');
 snapshotBeforeRestore();
 entries.forEach(([k,v])=>localStorage.setItem(k,v));
 // Rebuild the stable key if the backup predates V1.0.8.
 if(!payload.storage.roadToP1PartnersResearchPersistent){
  const fallback=payload.storage.roadToP1PartnersResearchV102||payload.storage.roadToP1PartnersResearchV101;
  if(fallback)localStorage.setItem('roadToP1PartnersResearchPersistent',fallback);
 }
 toast(`${entries.length} blocs de données restaurés. Rechargement…`);
 setTimeout(()=>location.reload(),700);
}
function pickBackup(){
 const input=$('restorePartnersInput');if(input){input.value='';input.click();}
}
function install(){
 const actions=document.querySelector('.top-actions');if(!actions)return;
 if(!$('backupPartnersBtn')){
  const b=document.createElement('button');b.className='btn ghost';b.id='backupPartnersBtn';b.textContent='Sauvegarder mes données';b.onclick=downloadBackup;
  actions.insertBefore(b,actions.firstChild);
 }
 if(!$('restorePartnersBtn')){
  const b=document.createElement('button');b.className='btn ghost';b.id='restorePartnersBtn';b.textContent='Restaurer une sauvegarde';b.onclick=pickBackup;
  const backup=$('backupPartnersBtn');backup?.insertAdjacentElement('afterend',b);
 }
 if(!$('restorePartnersInput')){
  const input=document.createElement('input');input.id='restorePartnersInput';input.type='file';input.accept='application/json,.json';input.hidden=true;
  input.addEventListener('change',async()=>{
   const file=input.files?.[0];if(!file)return;
   try{
    const payload=JSON.parse(await file.text());
    if(!validBackup(payload))throw new Error('Format de sauvegarde non reconnu.');
    const when=payload.exportedAt?new Date(payload.exportedAt).toLocaleString('fr-FR'):'date inconnue';
    if(!confirm(`Restaurer la sauvegarde du ${when} ?\n\nLes données présentes portant les mêmes clés seront remplacées. Une copie de sécurité locale sera créée juste avant la restauration.`))return;
    restorePayload(payload);
   }catch(e){toast(e?.message||'Impossible de restaurer ce fichier.');}
  });
  document.body.appendChild(input);
 }
 let note=$('backupPartnersNote');
 if(!note&&actions.parentElement){
  note=document.createElement('div');note.id='backupPartnersNote';note.className='backup-note';
  note.textContent='Sauvegarde JSON locale • utile avant une mise à jour importante ou un changement d’appareil';
  actions.parentElement.appendChild(note);
 }
 stamp();
}
function style(){
 if($('v108BackupStyle'))return;
 const s=document.createElement('style');s.id='v108BackupStyle';s.textContent=`
 .backup-note{font-size:9px;color:#7e8a92;text-align:right;margin-top:5px}
 @media(max-width:760px){.top-actions{gap:6px!important}.top-actions .btn{font-size:9px;padding:8px 9px}.backup-note{text-align:left}}
 `;document.head.appendChild(s);
}
function boot(){style();install();setInterval(stamp,5000)}
setTimeout(boot,0);
})();