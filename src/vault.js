// Redundant local saves. Never replace unreadable progress with a fresh save.
const DB='one-leaf-vault',STORE='snapshots';
let dbPromise;
function db(){return dbPromise??=new Promise((resolve,reject)=>{if(!globalThis.indexedDB)return reject(new Error('IndexedDB unavailable'));const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore(STORE,{keyPath:'key'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
async function idbRead(){const database=await db();return new Promise((resolve,reject)=>{const q=database.transaction(STORE).objectStore(STORE).getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});}
async function idbWrite(record){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction(STORE,'readwrite');tx.objectStore(STORE).put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
export function createVault(key,validate,storage=globalThis.localStorage){
 let queue=Promise.resolve(),lastRaw=null,lastTime=0;
 const read=k=>{try{return storage.getItem(k);}catch{return null;}};
 const backupsKey=key+'-snapshots';
 async function candidates(){
  const records=[];let broken=false;
  const push=(raw,label,time=0)=>{if(!raw)return;try{const value=validate(raw);records.push({raw,value,label,time:time||JSON.parse(raw).savedAt||JSON.parse(raw).lastSeen||0});}catch{broken=true;}};
  push(read(key),'当前存档');
  try{for(const r of JSON.parse(read(backupsKey)||'[]'))push(r.raw,'本机快照',r.time);}catch{broken=true;}
  for(const suffix of ['-recovery','-import-original'])push(read(key+suffix),'旧版恢复备份');
  try{for(const r of await idbRead())if(r.key.startsWith(key+':'))push(r.raw,'独立数据库备份',r.time);}catch{}
  records.sort((a,b)=>b.time-a.time);return{records,broken};
 }
 return {
  async load(){const before=read(key);const result=await candidates();const currentRaw=read(key);if(before!==currentRaw)return this.load();if(currentRaw){try{validate(currentRaw);}catch{try{if(!read(key+'-recovery'))storage.setItem(key+'-recovery',currentRaw);}catch{}}}lastRaw=currentRaw;const chosen=result.records[0];if(chosen)lastTime=chosen.time;return{...result,chosen};},
  candidates,
  commit(state){
   const time=Math.max(Date.now(),lastTime+1);lastTime=time;state.savedAt=time;const raw=JSON.stringify(state);
   // Compare-and-write protects another tab even when its storage event is delayed.
   const current=read(key);if(current!==lastRaw&&current!==raw)return {conflict:true};
   let local=false;
   try{let list=[];try{list=JSON.parse(read(backupsKey)||'[]');if(!Array.isArray(list))list=[];}catch{}
    if(lastRaw){try{validate(lastRaw);list.unshift({raw:lastRaw,time:JSON.parse(lastRaw).savedAt||time-1});}catch{}}
    storage.setItem(backupsKey,JSON.stringify(list.slice(0,8)));storage.setItem(key,raw);lastRaw=raw;local=true;
   }catch{}
   queue=queue.then(async()=>{try{await idbWrite({key:key+':'+time%8,raw,time});return true;}catch{return false;}});
   return{raw,local,durable:queue};
  },
  adopt(){lastRaw=read(key);},
  flush(){return queue;},
  raw(){return lastRaw;}
 };
}
