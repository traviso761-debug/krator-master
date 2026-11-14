// ---------- Galaxy class: the skin, painted off the main thread and kept ----------
// The hull's seven textures (skin.js) are painted a texel at a time by asking the hull where each texel is: 13.6
// million texels, about two and a half seconds of the main thread on a laptop, with the loading screen frozen while
// it happens. So:
//
//   - The painting starts as the page's script does (main.js), before the config and the stars, and runs in
//     workers, one per texture, as many at once as the machine has cores to spare. The painting code needs nothing
//     a worker lacks: it is plain functions over the hull's own (hull.js, dims.js), with no three.js and no page.
//     Only the lettering (fillText, which wants a canvas) and the making of the textures stay on the main thread,
//     in skin.js's skinTexture(), and they are quick.
//   - What a worker paints it also keeps, in IndexedDB, under a key that is a hash of the source of every file the
//     painting reads, so a second visit reads the bytes back and paints nothing. Change a line of the painting
//     and the key changes, and the next visit paints afresh and overwrites the old ones (a record per texture, by
//     name, so nothing piles up).
//   - Every step can fail without the page noticing: no workers (or no module workers), no IndexedDB (a private
//     window, blocked storage, a full disk), a store that never answers. Then the texture is painted on the main
//     thread, exactly as before. A record read back is used only if its key matches and it is the right size.
//
// The bytes do not depend on which thread paints them or in what order (skin.js, paint()), and IndexedDB gives back
// exactly what it was given, so the cache is byte for byte a fresh paint: #paintcheck paints everything again on
// the main thread and reports, per texture, whether what was used matched. #nocache neither reads nor writes the
// store; #noworker paints on the main thread. window._details.skins says where each texture came from and how long.
import {JOBS,paint,provide} from './skin.js';

const FILES=['./skin.js','./hull.js','./dims.js'];   // everything paint() reads: hull.js imports only dims.js
const DBNAME='krator-enterprise-skin',STORE='tex',VERSION='1';
// a store that has not opened by then, a read that has not finished, a worker that has not answered, is given up on
// (the read is given longer: 90 MB coming back off a slow phone's disk is slow but still quicker than painting it)
const WAIT_OPEN=1000,WAIT_READ=6000,WAIT_WORKER=30000;

// a 53-bit hash of the painting's source (cyrb53): not for security, only so a changed file changes the key
function hash(str){let h1=0xdeadbeef,h2=0x41c6ce57;
  for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return (4294967296*(2097151&h2)+(h1>>>0)).toString(16);}
async function codeKey(){
  const texts=await Promise.all(FILES.map(f=>fetch(new URL(f,import.meta.url)).then(r=>{if(!r.ok)throw new Error(f+' '+r.status);return r.text();})));
  return 'v'+VERSION+'-'+hash(texts.join('\u0000')+'\u0000'+Object.keys(JOBS).join(','));
}
const timeout=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r(null),ms))]);

// ---- the store (main thread and workers both) ----
// Resolves to the database, or null if there is none to be had; never throws.
export function skinDB(){
  return timeout(new Promise(res=>{
    try{
      if(typeof indexedDB==='undefined'||!indexedDB){res(null);return;}
      const rq=indexedDB.open(DBNAME,1);
      rq.onupgradeneeded=()=>{try{if(!rq.result.objectStoreNames.contains(STORE))rq.result.createObjectStore(STORE);}catch(e){}};
      rq.onsuccess=()=>res(rq.result);rq.onerror=()=>res(null);rq.onblocked=()=>res(null);
    }catch(e){res(null);}
  }),WAIT_OPEN);
}
// Starts the write at once (IndexedDB copies the value when put() is called, so the caller may hand the buffers away
// straight after) and resolves true when it has landed, false if it did not.
export function putRaw(db,key,raw){
  try{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put({key,name:raw.name,W:raw.W,H:raw.H,col:raw.col,dat:raw.dat},raw.name);
    return new Promise(res=>{tx.oncomplete=()=>res(true);tx.onerror=tx.onabort=()=>res(false);});
  }catch(e){return Promise.resolve(false);}
}
// every record whose key matches and whose size is right, by name
function readAll(db,key){
  return timeout(new Promise(res=>{
    const out={};
    try{
      const tx=db.transaction(STORE,'readonly'),st=tx.objectStore(STORE);
      for(const name of Object.keys(JOBS)){const rq=st.get(name);
        rq.onsuccess=()=>{const r=rq.result;
          if(r&&r.key===key&&r.col instanceof Uint8ClampedArray&&r.dat instanceof Uint8Array&&r.col.length===r.W*r.H*4&&r.dat.length===r.col.length)
            out[name]={name,W:r.W,H:r.H,col:r.col,dat:r.dat};};}
      tx.oncomplete=()=>res(out);tx.onerror=tx.onabort=()=>res(out);
    }catch(e){res(out);}
  }),WAIT_READ).then(r=>r||{});
}

// ---- the page's side ----
// Paints (or reads back) every texture and hands each to skin.js; resolves when all are there. Never rejects: whatever
// is missing at the end, skinTexture() paints on the main thread.
export function paintSkins(){
  const t0=performance.now(),hs=location.hash,nocache=/[#&]nocache\b/.test(hs),noworker=/[#&]noworker\b/.test(hs);
  const rep={key:null,from:{},ms:{},saved:{},readMs:null,wallMs:null};
  const note=()=>{rep.wallMs=Math.round(performance.now()-t0);try{(window._details=window._details||{}).skins=rep;}catch(e){}};
  return (async()=>{
    let key=null,db=null;
    if(!nocache){
      try{key=await codeKey();}catch(e){key=null;}
      if(key)db=await skinDB();
    }
    rep.key=key;
    let todo=Object.keys(JOBS);
    if(db&&key){const tr=performance.now(),got=await readAll(db,key);rep.readMs=Math.round(performance.now()-tr);
      for(const name of todo)if(got[name]){provide(got[name]);rep.from[name]='cache';}
      todo=todo.filter(n=>!got[n]);}
    if(!todo.length){note();return rep;}
    // the rest painted in workers, as many at once as there are cores to spare; one that cannot start or fails is
    // painted here instead
    const left=[];
    const viaWorker=name=>new Promise(res=>{
      let w;try{w=new Worker(new URL('./skinworker.js',import.meta.url),{type:'module'});}catch(e){res(false);return;}
      // ended here only if it fails or never answers; one that has painted closes itself once its bytes are kept
      let done=false;const end=ok=>{if(done)return;done=true;clearTimeout(tm);if(!ok)try{w.terminate();}catch(e){}res(ok);};
      const tm=setTimeout(()=>end(false),WAIT_WORKER);
      w.onmessage=e=>{const d=e.data||{};
        if('saved' in d&&!d.raw){rep.saved[name]=d.saved;return;}
        if(!d.raw){end(false);return;}
        provide(d.raw);rep.from[name]='worker';rep.ms[name]=d.ms;if(!d.saving)rep.saved[name]=false;end(true);};
      w.onerror=ev=>{try{ev.preventDefault();}catch(e){}end(false);};
      w.postMessage({name,key:db?key:null});
    });
    if(!noworker&&typeof Worker!=='undefined'){
      const queue=todo.slice(),lanes=Math.max(1,Math.min(queue.length,(navigator.hardwareConcurrency||4)-1));
      await Promise.all(Array.from({length:lanes},async()=>{for(let n;(n=queue.shift());)if(!await viaWorker(n))left.push(n);}));
    }else left.push(...todo);
    // here, a texture at a time with a frame between, so the loading screen still moves; kept a few seconds after
    // the page is up, when the copy into the store will not hold up the first frames
    const here=[];
    for(const name of Object.keys(JOBS).filter(n=>left.includes(n))){
      await new Promise(r=>setTimeout(r,0));
      const tp=performance.now(),raw=paint(name);rep.ms[name]=Math.round(performance.now()-tp);rep.from[name]='main';
      provide(raw);here.push(raw);}
    if(db&&key&&here.length)setTimeout(()=>{for(const raw of here)putRaw(db,key,raw).then(ok=>{rep.saved[raw.name]=ok;});},5000);
    note();return rep;
  })().catch(e=>{rep.error=String(e&&e.message||e);note();return rep;});
}
