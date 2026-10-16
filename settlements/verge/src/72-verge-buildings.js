// ================================================================= VERGE — the buildings drawn ([draw])
// Reads PLACE (70) and hands every record to the kit it belongs to:
//   kit 'izv'   the Iziz Vernacular (IZV.VERN.place: the upper city, the trail's rest stops) and the Ancients'
//               funicular (IZV.FUNICULAR), baked once (IZV.kbake: one InstancedMesh per kit item)
//   kit 'ykit'  the Yuni base assets, the Locus kit and the Eastern Abyssal kit (YKIT.buildAsset: the lower city),
//               emitted once (instanced buckets and merged families), with the night-light volume baked after
// Then for every building: the inspector's volume, an OBSTACLE (the biomes grow round it), the walk registry's block
// (core/walk), and its interior: the interiors kit's item for its key and variant (VFURN.item), queued to furnish.
// The bridges over the two rivers are drawn here (timber decks on stone piers), and the walk registry gets the
// streets, the plazas, the bridges and the trail as floors.
const WALK=KWALK;
const VDRAW={izv:0,ykit:0,errors:0,interiors:{item:0,skip:0,noItem:0,none:0},funicular:null,bridges:0};
function VERGE_STRUCTURES(){
 const P=PLACE,wealthIdx=w=>w==='poor'?0:w==='rich'?2:w==='civic'?3:1;
 // ---- the Iziz Vernacular (and the Ancients' funicular), into the IZV kit, baked once
 if(typeof IZV!=='undefined'){
  const r0=IZV.REG.length;
  for(const R of P.buildings){if(R.kit!=='izv')continue;
   try{IZV.VERN.place(scene,R.key,R.x,R.z,R.ry,{v:R.v,y:R.y,w:wealthIdx(R.wealth)});VDRAW.izv++;}catch(e){VDRAW.errors++;reportErr('izv '+R.key+': '+(e&&e.stack||e));}}
  if(IZV.FUNICULAR&&VG.FUNI.rec){try{const g=IZV.FUNICULAR.draw(VG.FUNI.rec,scene);VDRAW.funicular=VG.FUNI.rec;
    for(const b of VG.FUNI.rec.blocks)WALK.block(b,'funicular');
    REGISTER({name:'The Ancient funicular (ruined)',cls:'landmark',x:(VG.FUNI.a[0]+VG.FUNI.b[0])/2,z:VG.FUNI.z,y:0,r:20,h:900,tags:{culture:'ancient',state:'ruined',spans:VG.FUNI.rec.segments.length,breaks:VG.FUNI.rec.breaks.length}});
    KTAGS.page.add({class:'landmark',key:'ancients_funicular',name:'The Ancient funicular',at:[VG.FUNI.a[0],VG.FUNI.a[1],VG.FUNI.a[2]],ry:VG.FUNI.rec.ry||0,size:[12,VG.FUNI.rec.L||1500,40],tags:{culture:'ancient',state:'ruined'}});}
   catch(e){reportErr('funicular: '+(e&&e.stack||e));}}
  try{IZV.kbake(scene);}catch(e){reportErr('izv bake: '+(e&&e.stack||e));}
  // the vernacular's own inspector volumes, into the page's
  for(let i=r0;i<IZV.REG.length;i++){const r=IZV.REG[i];REGISTER({name:r.name,cls:'building',x:r.x,z:r.z,y:r.y||0,r:r.r,h:r.h,tags:Object.assign({culture:'iziz (vernacular)'},r.tags||{},{key:r.key})});}}
 // ---- the Yuni / Locus / Abyss assets, into the YKIT kit
 if(typeof YKIT!=='undefined'){
  const s0=YKIT.SITES.length;
  for(const R of P.buildings){if(R.kit!=='ykit')continue;
   try{const A=YKIT.ASSET_BY_KEY[R.key];const out=YKIT.buildAsset(R.key,R.x,R.z,R.ry,{y:R.y,seed:R.seed,variant:R.v,wealth:typeof R.wealth==='number'?R.wealth:.5,name:A?A.name:R.key});
    if(out){R.doors=out.doors;}VDRAW.ykit++;}catch(e){VDRAW.errors++;reportErr('ykit '+R.key+': '+(e&&e.stack||e));}}
  for(let i=s0;i<YKIT.SITES.length;i++){const s=YKIT.SITES[i];REGISTER({name:s.name,cls:s.kind==='asset'?'building':s.kind||'building',x:s.x,z:s.z,y:s.y,r:s.r,h:s.h,tags:{label:s.label}});}
  // the furniture the builders placed, then the kit's instances and merged families
  try{vfurnFlush(scene);}catch(e){reportErr('furniture flush: '+(e&&e.stack||e));}
  try{const E=YKIT.emitBuckets(),M=YKIT.emitMerged();YKIT.kitDone();window._ykit={instances:E.instances,instMeshes:E.meshes,mergedTris:M.tris,mergedMeshes:M.meshes};}catch(e){reportErr('ykit emit: '+(e&&e.stack||e));}}
 // ---- every building: obstacle, walk block, interior
 for(const R of P.buildings){
  const r=Math.hypot(R.w,R.d)/2;OBSTACLES.push({x:R.x,z:R.z,r:r+1.5,y0:R.y-2,y1:R.y+R.h+4});
  const c=P.obb(R.x,R.z,R.w/2,R.d/2,R.ry);WALK.block([Math.min(...c.map(p=>p[0])),Math.max(...c.map(p=>p[0])),Math.min(...c.map(p=>p[1])),Math.max(...c.map(p=>p[1])),R.y,R.y+R.h],'building:'+R.id);
  const it=VFURN.item(R.key,R.v);
  if(it){R.interiorItem=it.key;VDRAW.interiors.item++;VFURN.queue.push({id:R.id,rec:R,item:it,x:R.x,z:R.z,ry:R.ry,y:R.y});}
  else{const w=VFURN.why(R.key,R.v);VDRAW.interiors[w]++;R.interiorItem=null;R.interiorWhy=w;}}
 // ---- the bridges
 const MB=new THREE.MeshLambertMaterial({color:new THREE.Color(0x8a6a4c).convertSRGBToLinear()}),MS=new THREE.MeshLambertMaterial({color:new THREE.Color(0xa88a70).convertSRGBToLinear()});
 for(const B of P.bridges){const dx=B.b[0]-B.a[0],dz=B.b[1]-B.a[1],L=Math.hypot(dx,dz),a=Math.atan2(dx,dz),cx=(B.a[0]+B.b[0])/2,cz=(B.a[1]+B.b[1])/2;
  const wl=waterH(cx,cz),y=Math.max(B.y,wl+2.2);B.deck=y;
  const deck=new THREE.Mesh(new THREE.BoxGeometry(B.w,.5,L+4),MB);deck.position.set(cx,y,cz);deck.rotation.y=a;scene.add(deck);
  const n=Math.max(1,Math.floor(L/9));for(let k=1;k<=n;k++){const t=k/(n+1),px=B.a[0]+dx*t,pz=B.a[1]+dz*t,gy=Math.min(terrainH(px,pz),wl-1.5);
   const pier=new THREE.Mesh(new THREE.BoxGeometry(B.w+.8,y-gy,1.6),MS);pier.position.set(px,(y+gy)/2-.2,pz);pier.rotation.y=a;scene.add(pier);}
  for(const s of [-1,1]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.18,.9,L+4),MB);rail.position.set(cx+Math.cos(a)*s*B.w/2,y+.7,cz-Math.sin(a)*s*B.w/2);rail.rotation.y=a;scene.add(rail);}
  REGISTER({name:'A bridge over the river',cls:'infrastructure',x:cx,z:cz,y:y-6,r:L/2+2,h:9,tags:{city:B.city,span_m:+L.toFixed(1)}});
  TAGS_PAGE().add({class:'infrastructure',key:'verge_bridge',name:'Bridge',at:[cx,y,cz],ry:a,size:[B.w,1,L]});
  WALK.strip({a:[B.a[0],B.a[1],y],b:[B.b[0],B.b[1],y],w:B.w,name:B.id,tag:'bridge'});VDRAW.bridges++;}
 // ---- the floors: streets, plazas, the trail, the rest stops' pads
 for(const S of P.streets){if(S.bridge)continue;for(let i=1;i<S.pts.length;i++){const a=S.pts[i-1],b=S.pts[i];WALK.strip({a:[a[0],a[1],a[2]],b:[b[0],b[1],b[2]],w:S.w,name:S.id,tag:S.cls});}}
 for(const Q of P.plazas)WALK.floor({rect:[Q.x-Q.r*.8,Q.x+Q.r*.8,Q.z-Q.r*.8,Q.z+Q.r*.8],y:terrainH(Q.x,Q.z),name:Q.id,tag:'plaza'});
 const TP=VG.TRAIL.pts;for(let i=1;i<TP.length;i++)WALK.strip({a:[TP[i-1][0],TP[i-1][1],TP[i-1][2]],b:[TP[i][0],TP[i][1],TP[i][2]],w:VG.TRAIL.half*2,name:'trail',tag:'trail'});
 for(const D of VG.PADS)WALK.floor({rect:[D.x-D.hx*.7,D.x+D.hx*.7,D.z-D.hz*.7,D.z+D.hz*.7],y:D.y,name:D.id,tag:'pad'});
 if(VDRAW.funicular&&VDRAW.funicular.walk)for(const w of VDRAW.funicular.walk)WALK.strip({a:w.a,b:w.b,w:w.w,name:'funicular deck',tag:'funicular'});
 window._draw=VDRAW;window._walk={floors:WALK.export().floors.length,blocks:WALK.export().blocks.length};
 tick(vergeInteriorsTick);}
function TAGS_PAGE(){return KTAGS.page;}
// after the bake: every lamp into the Yuni-engine kit's night light (the volume covers the lower city; the halos go
// everywhere), then its glow is baked once: halos, window panes, the volume (YKIT.glow, Locus's 81-glow.js)
let VERGE_GLOW=null;
function VERGE_AFTER_BAKE(){if(typeof YKIT==='undefined')return;
 for(const L of VFURN.lamps)YKIT.nlLampAdd(L[0],L[1],L[2],L[3]||.8,L[4]||12,false);
 let n=0;if(typeof IZV!=='undefined'&&IZV.KIT.items.vBulb)for(const it of IZV.KIT.items.vBulb){YKIT.nlLampAdd(it.p[0],it.p[1],it.p[2],1.1,16,false);n++;}
 VERGE_GLOW=YKIT.glow();window._glowLamps={yk:YKIT.NL_LAMPS.length,izvBulbs:n,windows:YKIT.NL_WINDOWS.length};}
