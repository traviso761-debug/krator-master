/* ============================== HOOK: THE ANCIENT CITY UP CLOSE, THE HEROES ([web]) ============================== */
/* The towers nearest the camera drawn as the metropolis kit draws them (KMP, 77g: kits/metropolis read in place, MP.hero
   on its family and state), their massing (90c) hidden while they stand; it decides nothing about where anything goes.
   - Which: the standing towers (not the fallen: they lie as 90c lays them) within HOOK_HEROES.R of the camera, by the
     distance from the camera to the tower's column, at most HOOK_HEROES.max of them (each is about eight draw calls and
     18-40k triangles here; the page's budget is 900 calls). The set is chosen again when the camera has moved moveFor metres.
   - A hero is built once a key (family.state) at the origin and placed as a copy sharing its geometry, at the tower's seat
     (90c's: the drawn ground's lowest node along the footprint's edge, so nothing floats; a drowned tower stands on the
     bed under the water), turned by the record's yaw and lean. New keys are built while a frame has frameMs left (at
     least one), so the set fills in over a few frames instead of stalling one; and while the page is idle the keys of
     the towers within warmR of the camera are built ahead (nearest first, one an idle period, warmMax at most), so a
     flight into the downtown finds most of them built.
   - A wild look draws its plain state (the kit's overgrowth, 59e, needs the biome core's leaf sets; not on this page).
   - The design families' crown, broken and stump heroes stand at their full height in the kit (MP.ruinDesign cuts their
     glass and floors, not their frame; the Ancient's Valley clips them at the record's top in its host, 70-host-city.js
     avClipHero): they are cut here at MP.ruin's top too, walls and slabs by triangle, panels by instance. KNOWN_ISSUES.md.
   window._ruinHeroes holds what verify.py reads; window._ruinHeroes.at(x, y, z) chooses the set round a point at once. */
const HOOK_HEROES={R:700,max:10,moveFor:30,frameMs:40,cache:{},live:[],failed:{},stats:{built:0,ms:0}};
(()=>{const D=typeof HOOK_RUIN_DRAW!=='undefined'?HOOK_RUIN_DRAW:null;
 if(typeof KMP==='undefined'||!D||!D.group||!D.slot){window._ruinHeroes={ready:false,why:typeof KMP==='undefined'?'no KMP':'no massing'};return;}
 const MP=KMP.MP,ZERO=new THREE.Matrix4().makeScale(0,0,0),CUT={crown:1,broken:1,stump:1};
 if(typeof KratorAncientsInteriors!=='undefined'&&KratorAncientsInteriors.install&&typeof KratorInteriors!=='undefined')try{KratorAncientsInteriors.install(KratorInteriors);}catch(e){}
 const group=new THREE.Group();group.name='hook-ruin-heroes';scene.add(group);
 /* ---- a design's ruin cut at the record's top: a triangle whose lowest corner is over it goes, a panel whose centre is */
 function clip(H,top){H.updateMatrixWorld(true);const v=new THREE.Vector3(),M=new THREE.Matrix4();let cut=0;
  H.traverse(m=>{if(!m.isMesh||!m.geometry||/debris|rubble/.test(m.name||''))return;
   if(m.isInstancedMesh){let n=0;for(let i=0;i<m.count;i++){m.getMatrixAt(i,M);M.premultiply(m.matrixWorld);if(M.elements[13]>top){m.setMatrixAt(i,ZERO);n++;}}
    if(n){m.instanceMatrix.needsUpdate=true;cut+=n;}return;}
   const g=m.geometry,P=g.attributes.position,I=g.index,cnt=I?I.count:P.count,keep=[];let n=0;
   for(let t=0;t+2<cnt;t+=3){let lo=1e9;for(let c=0;c<3;c++){v.fromBufferAttribute(P,I?I.getX(t+c):t+c).applyMatrix4(m.matrixWorld);if(v.y<lo)lo=v.y;}
    if(lo>top){n++;continue;}for(let c=0;c<3;c++)keep.push(I?I.getX(t+c):t+c);}
   if(n){const G=g.clone();G.setIndex(keep);m.geometry=G;cut+=n;}});
  return cut;}
 function measure(H){let tris=0,calls=0,lo=1e9,hi=-1e9;const b=new THREE.Box3();H.updateMatrixWorld(true);
  H.traverse(m=>{if(!m.isMesh||!m.geometry)return;calls++;const g=m.geometry,c=(g.index?g.index.count:g.attributes.position.count)/3;tris+=m.isInstancedMesh?c*m.count:c;
   if(!m.isInstancedMesh){if(!g.boundingBox)g.computeBoundingBox();b.copy(g.boundingBox).applyMatrix4(m.matrixWorld);if(b.min.y<lo)lo=b.min.y;if(b.max.y>hi)hi=b.max.y;}});
  return {tris:Math.round(tris),calls,lo,hi};}
 /* ---- one hero a key, built at the origin */
 function heroOf(fam,st){const k=fam+'.'+st;if(k in HOOK_HEROES.cache)return HOOK_HEROES.cache[k];
  const t0=performance.now();let H=null;
  try{H=KMP.hero(fam,st);const F=MP.FAMILY[fam];
   if(H&&F&&F.design&&CUT[st]){const r=MP.ruin(F,st);if(r&&r.top!=null)H.userData.hkCut=clip(H,r.top+.5);}
   if(H)H.userData.hk=measure(H);}
  catch(e){HOOK_HEROES.failed[k]=String(e&&e.message||e).slice(0,240);console.error('hook hero '+k+': '+HOOK_HEROES.failed[k]);H=null;}
  HOOK_HEROES.stats.ms+=performance.now()-t0;HOOK_HEROES.stats.built++;HOOK_HEROES.cache[k]=H;return H;}
 /* ---- a copy at a tower: the meshes shared, an instanced mesh's matrices shared (its bounds are the box's, not the
    instances': never culled) */
 function place(H,sl){const g=new THREE.Group();
  H.children.forEach(m=>{let c;if(m.isInstancedMesh){c=new THREE.InstancedMesh(m.geometry,m.material,m.count);c.instanceMatrix=m.instanceMatrix;c.instanceColor=m.instanceColor;
    c.position.copy(m.position);c.quaternion.copy(m.quaternion);c.scale.copy(m.scale);c.frustumCulled=false;c.name=m.name;}else c=m.clone();
   c.userData=Object.assign({},m.userData,{own:'ruin hero'});g.add(c);});
  const t=sl.rec;g.position.set(t.x,sl.seat,t.z);g.quaternion.copy(sl.q);g.name=t.id;g.userData={id:t.id,key:t.family+'.'+t.state,own:'ruin hero'};return g;}
 const hide=(sl,on)=>{sl.m.setMatrixAt(sl.k,on?ZERO:sl.M);sl.m.instanceMatrix.needsUpdate=true;};
 const SL=Object.keys(D.slot).map(id=>D.slot[id]).filter(sl=>sl.rec.state!=='fallen');
 /* ---- the set: the nearest standing towers to (x, y, z), by the distance to the tower's column */
 function choose(x,y,z,all){const near=[];
  for(const sl of SL){const t=sl.rec,r=Math.max(t.w,t.d)/2,dh=Math.max(0,Math.hypot(t.x-x,t.z-z)-r),kt=sl.M.elements[5],dy=y-Math.min(Math.max(y,sl.seat),sl.seat+kt),d=Math.hypot(dh,dy);
   if(d<HOOK_HEROES.R)near.push([d,sl]);}
  near.sort((a,b)=>a[0]-b[0]);const want=near.slice(0,HOOK_HEROES.max).map(a=>a[1]),wantId=new Set(want.map(sl=>sl.rec.id));
  /* drop the ones no longer wanted, their massing back */
  HOOK_HEROES.live=HOOK_HEROES.live.filter(L=>{if(wantId.has(L.id))return true;group.remove(L.g);hide(L.sl,false);return false;});
  const have=new Set(HOOK_HEROES.live.map(L=>L.id)),t0=performance.now();let fresh=0;
  for(const sl of want){const t=sl.rec,k=t.family+'.'+t.state;if(have.has(t.id))continue;
   if(!(k in HOOK_HEROES.cache)){if(!all&&fresh&&performance.now()-t0>HOOK_HEROES.frameMs){HOOK_HEROES.pending=true;continue;}fresh++;}
   const H=heroOf(t.family,t.state);if(!H)continue;const g=place(H,sl);group.add(g);hide(sl,true);
   const hk=H.userData.hk||{};HOOK_HEROES.live.push({id:t.id,key:k,g,sl,x:t.x,z:t.z,seat:sl.seat,lo:sl.seat+(hk.lo||0),hi:sl.seat+(hk.hi||0),wet:t.wet,tris:hk.tris||0,calls:hk.calls||0,cut:H.userData.hkCut||0});}
  if(!want.some(sl=>!HOOK_HEROES.live.find(L=>L.id===sl.rec.id)&&!((sl.rec.family+'.'+sl.rec.state) in HOOK_HEROES.cache)))HOOK_HEROES.pending=false;
  HOOK_HEROES.at=[x,y,z];publish();}
 function publish(){const L=HOOK_HEROES.live;
  window._ruinHeroes={ready:true,point:HOOK_HEROES.at,R:HOOK_HEROES.R,max:HOOK_HEROES.max,failed:HOOK_HEROES.failed,stats:HOOK_HEROES.stats,
   calls:L.reduce((a,l)=>a+l.calls,0),tris:L.reduce((a,l)=>a+l.tris,0),
   live:L.map(l=>({id:l.id,key:l.key,x:l.x,z:l.z,seat:l.seat,lo:l.lo,hi:l.hi,wet:!!l.wet,tris:l.tris,calls:l.calls,cut:l.cut})),
   at:(x,y,z)=>{choose(x,y,z,true);return window._ruinHeroes;}};}
 publish();
 HOOK_HEROES.choose=choose;HOOK_HEROES.group=group;
 /* ---- ahead of the camera: the key of the nearest standing tower within warmR not built yet, one an idle period (at most
    warmMax), so flying in finds the downtown's keys built; a quiet second's wait when there is none */
 HOOK_HEROES.warmR=1800;HOOK_HEROES.warmMax=24;HOOK_HEROES.warmed=0;
 const idle=f=>typeof requestIdleCallback==='function'?requestIdleCallback(f,{timeout:2000}):setTimeout(f,200);
 function warm(){if(HOOK_HEROES.warmed>=HOOK_HEROES.warmMax)return;const c=camera.position;let best=null,bd=1e18;
  for(const sl of SL){const t=sl.rec;if((t.family+'.'+t.state) in HOOK_HEROES.cache)continue;const d=Math.hypot(t.x-c.x,t.z-c.z);if(d<HOOK_HEROES.warmR&&d<bd){bd=d;best=t;}}
  if(!best){setTimeout(()=>idle(warm),1000);return;}
  heroOf(best.family,best.state);HOOK_HEROES.warmed++;HOOK_HEROES.stats.warmed=HOOK_HEROES.warmed;idle(warm);}
 idle(warm);
 PORT_FRAME.push(()=>{const c=camera.position,a=HOOK_HEROES.at;
  if(!HOOK_HEROES.pending&&a&&Math.hypot(c.x-a[0],c.y-a[1],c.z-a[2])<HOOK_HEROES.moveFor)return;
  choose(c.x,c.y,c.z,false);});})();
