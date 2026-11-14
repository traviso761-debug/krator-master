// ---------- Galaxy class: a worker that paints one of the hull's textures ----------
// skincache.js starts one of these per texture. It paints (skin.js's paint(), the same code the page would run), keeps
// the bytes in IndexedDB under the key it was given, so the main thread never has to copy them in, and hands them
// back without a copy. Keeping them is best effort: a store that is blocked or full only means the next visit paints
// again.
import {paint} from './skin.js';
import {skinDB,putRaw} from './skincache.js';

onmessage=async e=>{
  const {name,key}=e.data;
  const t0=performance.now();let raw;
  try{raw=paint(name);}catch(err){postMessage({name,error:String(err&&err.message||err)});return;}
  const ms=Math.round(performance.now()-t0);
  // the store opened only now: opened before, its answer could queue behind skinDB's own time limit while this
  // paints
  let db=null;if(key)try{db=await skinDB();}catch(err){db=null;}
  // put() copies the bytes as it is called, so they can be handed over at once and the write lands on its own
  const landed=db?putRaw(db,key,raw):Promise.resolve(false);
  postMessage({name,raw,ms,saving:!!db},[raw.col.buffer,raw.dat.buffer]);
  // and the worker closes itself once it has (the page must not end it first, or the write is lost)
  const ok=await landed;
  postMessage({name,saved:ok});close();
};
