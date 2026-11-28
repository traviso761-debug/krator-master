// ================================================================= HOST WORLD HOOK: drawn ground, Sutar-Tawar clock parade, core/water & detail maps
// Runs at 91z, after 91f-furnish.js and before 92-world.js's initial buildWorld(). Scales the ground plane over all 11 rows,
// registers KDRAWN, wires library textures onto door hardware and room fallback materials, animates Sutar-Tawar clock hands &
// ancestor parades (with non-coplanar hands stepped by 4.5 cm), draws spring step-well/bath/cistern/lake still pools (WATER.still)
// and flume/lapidary/gristmill mountain streams (WATER.flow), and exposes hyOreLinks() & hyDims().
(function(){
 if(typeof groundM!=='undefined'){
  groundM.name='ground';
  groundM.position.z=-280;
  groundM.scale.set(2.0,2.0,1);
  if(typeof groundMat!=='undefined'){
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap])if(t)t.repeat.multiplyScalar(2.0);
  }
  groundM.updateMatrixWorld(true);
  if(typeof KDRAWN!=='undefined'){
   KDRAWN.add(KDRAWN.fromObject(groundM));
  }
 }
 /* Ensure door hardware and room fallback material carry real library maps too */
 if(typeof svHwMat==='function'&&MAT.bronze&&MAT.bronze.map){
  const hw=svHwMat();
  hw.map=MAT.bronze.map;hw.normalMap=MAT.bronze.normalMap;hw.roughnessMap=MAT.bronze.roughnessMap;
  const L=MAT.bronze.userData&&MAT.bronze.userData.lib;
  if(L)matHook(hw,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 if(MAT.room&&MAT.basalt&&MAT.basalt.map&&!MAT.room.map){
  MAT.room.map=MAT.basalt.map;MAT.room.normalMap=MAT.basalt.normalMap;MAT.room.roughnessMap=MAT.basalt.roughnessMap;
 }

 /* Sutar-Tawar Astronomical Clock & Ancestor Parade (non-coplanar hands stepped at z = 0.04 and z = 0.085) */
 const HY_CLOCKS=[];
 function hyClockGeo(G,col){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));
  if(G.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(G.uv,2));
  g.computeVertexNormals();
  const n=G.pos.length/3,c=new Float32Array(n*3);
  for(let i=0;i<n;i++){c[i*3]=col.r;c[i*3+1]=col.g;c[i*3+2]=col.b;}
  g.setAttribute('color',new THREE.BufferAttribute(c,3));
  return g;
 }
 function hyClockDraw(world){
  HY_CLOCKS.length=0;
  for(const r of REG){
   const C=r.clock;
   if(!C)continue;
   const figs=C.figures.map(f=>{
    const mk=ET_METALS[f.metal]||'bronze';
    const col=mk==='gold'&&KIT_HAS('gold')?new THREE.Color(1,1,1):etMetalCol(f.metal);
    const m=new THREE.Mesh(hyClockGeo(etFigureGeo({pose:'stand',seed:f.seed}),col),MAT[mk]||MAT.bronze);
    m.scale.setScalar(C.figureH);
    m.castShadow=true;
    m.userData={mk,probeSkip:true,clockDynamic:true};
    world.add(m);
    return m;
   });
   const piv=new THREE.Object3D(),N=new THREE.Vector3().fromArray(C.normal);
   piv.position.fromArray(C.dial);
   piv.lookAt(piv.position.clone().add(N));
   world.add(piv);
   const hand=(len,w,zOff,mk)=>{
    const G=new THREE.BoxGeometry(w,len,.032).translate(0,len/2-.14,zOff);
    const n=G.attributes.position.count,c=new Float32Array(n*3).fill(1);
    G.setAttribute('color',new THREE.BufferAttribute(c,3));
    const m=new THREE.Mesh(G,MAT[mk]||MAT.gold);
    m.userData={mk,probeSkip:true,clockDynamic:true};
    piv.add(m);
    return m;
   };
   const T=C.track.map(p=>new THREE.Vector3().fromArray(p)),L=[0];
   for(let i=1;i<T.length;i++)L.push(L[i-1]+T[i].distanceTo(T[i-1]));
   HY_CLOCKS.push({C,figs,T,L,hour:hand(C.radius*.54,.15,.04,'gold'),min:hand(C.radius*.82,.095,.085,'bronze')});
  }
 }
 function hyClockAt(K,u,out){
  const s=Math.max(0,Math.min(1,u))*K.L[K.L.length-1];
  let i=1;while(i<K.L.length-1&&K.L[i]<s)i++;
  const f=(s-K.L[i-1])/Math.max(1e-6,K.L[i]-K.L[i-1]);
  out.lerpVectors(K.T[i-1],K.T[i],f);
  return Math.atan2(K.T[i].x-K.T[i-1].x,K.T[i].z-K.T[i-1].z);
 }
 FRAME_HOOKS.push(()=>{
  const t=ANIM.t,h=SKY.hour;
  for(const K of HY_CLOCKS){
   const ph=t%K.C.period;
   K.figs.forEach((m,i)=>{
    const u=(ph-i*2.6)/18;
    m.rotation.y=hyClockAt(K,u,m.position);
    m.visible=u>-.02&&u<1.02;
   });
   K.hour.rotation.z=-(h%12)/12*TAU;
   K.min.rotation.z=-(h%1)*TAU;
  }
 });

 const hyPrevBuild=buildWorld;
 buildWorld=function(){
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){
    if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}
    if(D.plunge){scene.remove(D.plunge);if(D.plunge.geometry)D.plunge.geometry.dispose();}
   }
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;
  }
  const W0=hyPrevBuild();
  hyClockDraw(W0||WORLD);
  /* Guarantee 100% of non-glow, non-glass furniture meshes in SVF.group carry real library detail maps */
  if(typeof SVF!=='undefined'&&SVF.group){
   SVF.group.traverse(m=>{
    if(m.isMesh&&!m.material.isMeshBasicMaterial&&!m.material.transparent&&!m.material.map){
     m.material.userData.family=m.material.userData.family||'wood';
     if(svfDetail(m.material))SVF.detailed.push(m.material.userData.family);
    }
   });
  }
  /* Draw core/water Santa Cristina spring/bath/cistern/lake mirror pools (WATER.still) & mountain streams/flumes (WATER.flow) */
  if(typeof WATER!=='undefined'){
   for(const r of REG){
    if(r.stills){
     for(const st of r.stills){
      const S=WATER.still({name:st.name,level:st.level,bounds:st.bounds,poly:st.poly});
      WATER.drawStill(S,{
       THREE,scene,
       color:st.color==null?0x184b4d:st.color,
       roughness:st.roughness==null?.035:st.roughness,
       metalness:st.metalness==null?.2:st.metalness,
       envMapIntensity:st.envMapIntensity==null?.82:st.envMapIntensity
      });
     }
    }
    if(r.river){
     const S=WATER.flow({name:r.river.name,pts:r.river.pts,width:r.river.width,speed:r.river.speed});
     WATER.drawFlow(S,{THREE,scene,shallow:0x468886,deep:0x173f46,roughness:.12,envMapIntensity:.35});
    }
   }
  }
  return W0;
 };

 function hyOreLinks(){
  const nodes=REG.filter(r=>r.kind==='res-node').map(r=>({id:r.tid||r.key,key:r.key,kind:r.tags.rock,grade:r.tags.level,x:r.x,z:r.z}));
  const mines=REG.filter(r=>!r.parent&&resWorksOf(r)).map(r=>{
   const d=DEFS[r.key];
   return {id:r.tid||r.key,key:r.key,works:resWorksOf(r),resSource:d&&d.resSource||null,x:r.x,z:r.z};
  });
  return {nodes,mines:mines.map(m=>{
   const pool=m.resSource?nodes.filter(n=>n.kind===m.resSource):nodes;
   return Object.assign({},m,{source:resSource(m,pool,{radius:m.resSource?900:undefined})||resSource(m,nodes)});
  })};
 }
 function hyDims(){
  const out={};
  for(const k in DEFS){
   const d=DEFS[k];if(d.cls!=='building'&&d.kind!=='res-node')continue;
   out[k]={cls:d.cls,kind:d.kind||null,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,wealth:d.tags.wealth||null,
    types:d.tags.types||null,role:d.tags.role||null,job:d.tags.job||null,resSource:d.resSource||null,cut:!!d.cut};
  }
  return out;
 }
 globalThis.hyOreLinks=hyOreLinks;
 globalThis.hyDims=hyDims;
})();
