// ================================================================= VERGE — furniture and interiors (the adapter onto core/furnish)
// Every piece of furniture is a master-catalog piece (kits/catalog, KratorFurniture), placed as a core/furnish record
// and drawn by the catalog's own code into one batch per pass. Two sources:
//   - the kit builders' own FURNISH(key, lx,ly,lz, lry, o) calls (the Yuni, Locus and Abyss assets dress their
//     porches, stalls and courts this way; same signature as Locus's 66-locus-furnish.js);
//   - the INTERIORS: every building whose key has an item in the interiors kit's sets (kits/interiors/sets: iziz,
//     yuni, locus, abyss) gets its rooms planned and furnished there. Which item a building takes is decided at
//     placement (data: rec.interior); the furnishing runs after load, nearest the camera first, a few buildings a
//     frame, each chunk flushed into its own batch (window._interiors says how far it has got).
// ?furniture=0 places no furniture; ?interiors=0 plans no rooms.
const VFURN=(function(){
 KratorFurniture.setDetail(.5);
 const F=KFURN.create(Object.assign(KFURN.flags(true),{
  catalog:KFURN.catalogOf(KratorFurniture),interiors:KratorInteriors,tags:KTAGS.page,idPrefix:'vfurn',
  seed:(o,ctx,R,x,y,z,loc)=>(((ctx.frame&&ctx.frame.seed)||1)*37+Math.round((loc?loc[0]:x)*11+(loc?loc[2]:z)*17)+997)&0xffff,
  onRecord:(rec,ctx)=>{if(rec.setting==='room'&&F.interiorsOn&&ctx.top&&ctx.top.interiorItem){rec.deferred='interiors';F.deferred++;return false;}},
  draw:(rec,ctx,o,A)=>{const r=KFURN.drawRec(F,rec,ctx.wealth!=null?ctx.wealth:.5);if(r.error)reportErr('furniture '+rec.key+': '+r.error);
   r.lights.forEach(l=>{F.lamps.push([l.x,l.y,l.z,o.lamp?o.lamp[0]:l.intensity,o.lamp?o.lamp[1]:l.distance]);});}}));
 Object.assign(F,{stack:[],deferred:0,lamps:[],interiorsOn:!/[?&]interiors=0\b/.test(location.search),queue:[],done:0,pieces:0,groups:[]});
 KFURN.useBatch(F,KratorFurniture,KratorInteriors);
 // the interior-set item for a building of this key and variant: '<key>' for variant 0, '<key>#<n>' for another
 // (never variant 0's rooms on another body); null when the set has none or skips it
 F.itemOf=(key,v)=>{const S=KratorInteriors.sets;return S.find(v?key+'#'+v:key)||null;};
 F.item=(key,v)=>{const it=F.itemOf(key,v);return it&&!it.skip?it:null;};
 F.why=(key,v)=>{const it=F.itemOf(key,v),base=v?KratorInteriors.sets.find(key):null;return it?'skip':base?(base.skip?'skip':'noItem'):'none';};
 return F;})();
// the builder's call: in its own (innermost) frame, the one on top of the stack
function furnishAt(Fr,key,lx,ly,lz,lry,o){o=o||{};const F0=VFURN.stack[0]||Fr,top=F0.asset?F0.asset.key:'',q=Fr.p(lx,lz);
 return VFURN.place(key,q[0],Fr.y+ly,q[1],Fr.ry+(lry||0),o,[lx,ly,lz,lry||0],
  {building:F0.vergeId||top,part:Fr.asset&&Fr.asset.key!==top?Fr.asset.key:null,frame:Fr,top:F0,wealth:Fr.wealth,listOf:()=>F0.furniture||(F0.furniture=[])});}
function FURNISH(key,lx,ly,lz,lry,o){const Fr=VFURN.stack[VFURN.stack.length-1];if(!Fr){reportErr('FURNISH '+key+' outside a builder');return null;}return furnishAt(Fr,key,lx,ly,lz,lry,o);}
// every Yuni-engine asset's build runs with its frame on the stack (sub-assets too)
if(typeof YKIT!=='undefined')YKIT.ASSETS.forEach(A=>{const b=A.build;A.build=function(Fr){VFURN.stack.push(Fr);try{return b.call(this,Fr);}finally{VFURN.stack.pop();}};});
// the batch becomes meshes: the catalog's sRGB bytes converted to linear floats; the Yuni-engine kit's night glow on them
function vfurnFlush(group){const g=VFURN.batch.flush(group||scene);g.traverse(m=>{if(!m.isMesh)return;KFURN.linearColours(m.geometry);
  if(typeof YKIT!=='undefined'&&!m.material.isMeshBasicMaterial)YKIT.nlMaterial(m.material,'kf-'+(m.material.userData.family||'x'));
  m.userData.inspectLabel='furniture (catalog)';});
 VFURN.groups.push(g);return g;}
// the interiors: planned and furnished after load, nearest the camera first, within a time budget per frame
function vergeInteriorsTick(){const F=VFURN;if(!F.interiorsOn||!F.queue.length)return;
 const t0=performance.now(),cp=camera.position;
 F.queue.sort((a,b)=>Math.hypot(b.x-cp.x,b.z-cp.z)-Math.hypot(a.x-cp.x,a.z-cp.z));     // the nearest at the end: pop() takes it
 const R=QS.has('furnishR')?+QS.get('furnishR'):320;
 if(!F.queue.length||Math.hypot(F.queue[F.queue.length-1].x-cp.x,F.queue[F.queue.length-1].z-cp.z)>R)return;   // only what the camera is near
 let n=0;KFURN.useBatch(F,KratorFurniture,KratorInteriors);
 while(F.queue.length&&Math.hypot(F.queue[F.queue.length-1].x-cp.x,F.queue[F.queue.length-1].z-cp.z)<=R&&performance.now()-t0<(QS.has('furnishMs')?+QS.get('furnishMs'):28)){const B=F.queue.pop();
  try{const fi=F.interior(B.item,B.x,B.z,B.ry,F.adapter,{baseY:B.y,prefix:B.id+'.'}),r=fi.result;B.rec.interior=fi.summary;F.pieces+=fi.summary.pieces;
   r.inst.rooms.forEach(R=>{const P=r.plans[R.id];(P&&P.lights||[]).forEach(l=>F.lamps.push([l.x,l.y,l.z,l.intensity||.7,l.distance||10]));});}
  catch(e){reportErr('interior '+B.rec.key+': '+(e&&e.message||e));}
  F.done++;n++;}
 if(n)vfurnFlush(scene);
 window._interiors={planned:F.done,queued:F.queue.length,pieces:F.pieces,deferred:F.deferred,batches:F.groups.length};}
