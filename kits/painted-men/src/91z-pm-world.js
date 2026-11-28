// ================================================================= HOST WORLD HOOK: sculpted KDRAWN danxia cliff ground, core/water seeps & detail maps
// Runs at 91z, after 91f-furnish.js and before 92-world.js's initial buildWorld():
//   - Replaces flat groundM with a sculpted Painted Highlands danxia cliff-bench + badland strata + talus bench + wash grid,
//     registered on KDRAWN.grid(...) with exact matching terrainH(x, z) (flat y = 0 across the row/camera bench, stepped
//     polychrome danxia/badland mesas framing the north & east/west canyon rims).
//   - Wires library textures onto door hardware and room fallback materials.
//   - Draws seep-contact spring basins (WATER.still) & stone-curbed irrigation rills (WATER.flow).
//   - Exposes pmOreLinks() and pmDims().
(function(){
 /* Sculpted Painted Highlands ground grid (exact match between BufferGeometry triangles, KDRAWN.grid, and terrainH) */
 const gx0=-1200,gz0=-1360,nx=120,nz=120,dx=20,dz=20;
 const row=nx+1,H=new Float64Array(row*(nz+1));

 function pmBenchRelief(x,z){
  /* Flat y = 0 across all 9 building rows and preset view cameras (|x| <= 540, -360 <= z <= 180) */
  const nDist=Math.max(0,-360-z);
  const xDist=Math.max(0,Math.abs(x)-540);
  const sDist=Math.max(0,z-180);
  const rim=Math.max(nDist,xDist*.85);
  let y=0;
  if(rim>0){
   /* Stepped danxia sandstone & badland bentonite cliff benches (+12 m, +28 m, +48 m) */
   const u=Math.min(1,rim/260);
   const hRaw=u*52;
   const step=Math.floor(hRaw/12)*12+smooth(0,1,(hRaw%12)/12)*12;
   const rib=(KRAND.unit(KRAND.hash(36901,Math.round(x*.05),Math.round(z*.05)))-.5)*1.8*Math.min(1,rim/60);
   y=step+rib;
  }else if(sDist>0){
   /* Gentle seasonal superbloom playa & cobble wash swale to the far south */
   const w=Math.min(1,sDist/140);
   y=-0.85*Math.sin(Math.PI*Math.min(1,w*1.2));
  }
  return y;
 }

 const pos=new Float32Array(row*(nz+1)*3);
 const nor=new Float32Array(row*(nz+1)*3);
 const uv=new Float32Array(row*(nz+1)*2);
 const col=new Float32Array(row*(nz+1)*3);
 const gScale=3.6;
 const cBench=hc(0x9c7252),cPlaya=hc(0xb87e5c),cBadland=hc(0xd4b296),cDanxia=hc(0xa84834),cBuff=hc(0xc88a5e),cTeal=hc(0x4c7e78);
 const tmpC=new THREE.Color();

 for(let iz=0;iz<=nz;iz++){
  for(let ix=0;ix<=nx;ix++){
   const k=iz*row+ix,x=gx0+ix*dx,z=gz0+iz*dz,y=pmBenchRelief(x,z);
   H[k]=y;
   pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;
   uv[k*2]=x/gScale;uv[k*2+1]=z/gScale;
   if(y<-0.15)tmpC.copy(cPlaya);
   else if(y<1.5)tmpC.copy(cBench);
   else if(y<11)tmpC.copy(cBadland);
   else if(y<15)tmpC.copy(cTeal);
   else if(y<28)tmpC.copy(cDanxia);
   else tmpC.copy(cBuff);
   col[k*3]=tmpC.r;col[k*3+1]=tmpC.g;col[k*3+2]=tmpC.b;
  }
 }
 for(let iz=0;iz<=nz;iz++){
  for(let ix=0;ix<=nx;ix++){
   const k=iz*row+ix;
   const hL=H[iz*row+Math.max(0,ix-1)],hR=H[iz*row+Math.min(nx,ix+1)];
   const hD=H[Math.max(0,iz-1)*row+ix],hU=H[Math.min(nz,iz+1)*row+ix];
   const nxv=-(hR-hL)/(2*dx),nyv=1,nzv=-(hU-hD)/(2*dz),L=Math.hypot(nxv,nyv,nzv)||1;
   nor[k*3]=nxv/L;nor[k*3+1]=nyv/L;nor[k*3+2]=nzv/L;
  }
 }
 /* Exact KDRAWN.grid index split: (a, b, d) and (b, c, d) with +Y upward winding */
 const idx=new Uint32Array(nx*nz*6);
 let ptr=0;
 for(let iz=0;iz<nz;iz++){
  for(let ix=0;ix<nx;ix++){
   const a=iz*row+ix,d=a+1,b=(iz+1)*row+ix,c=b+1;
   idx[ptr++]=a;idx[ptr++]=b;idx[ptr++]=d;
   idx[ptr++]=b;idx[ptr++]=c;idx[ptr++]=d;
  }
 }

 const pmGridSrc=typeof KDRAWN!=='undefined'?KDRAWN.grid({x0:gx0,z0:gz0,dx,dz,nx,nz,h:H}):null;
 if(typeof KDRAWN!=='undefined'&&pmGridSrc){
  KDRAWN.clear();
  KDRAWN.add(pmGridSrc);
 }
 terrainH=function(x,z){
  const v=pmGridSrc?pmGridSrc.h(x,z):null;
  return v==null?0:v;
 };

 if(typeof groundM!=='undefined'){
  const gGeo=new THREE.BufferGeometry();
  gGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  gGeo.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  gGeo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  gGeo.setAttribute('color',new THREE.BufferAttribute(col,3));
  gGeo.setIndex(new THREE.BufferAttribute(idx,1));
  gGeo.computeBoundingSphere();
  if(groundM.geometry)groundM.geometry.dispose();
  groundM.geometry=gGeo;
  groundM.rotation.set(0,0,0);
  groundM.position.set(0,0,0);
  groundM.scale.set(1,1,1);
  groundM.name='ground';
  if(typeof groundMat!=='undefined'){
   groundMat.vertexColors=true;
   groundMat.color.setHex(0xffffff);
   for(const t of [groundMat.map,groundMat.normalMap,groundMat.roughnessMap]){
    if(t)t.repeat.set(1,1);
   }
   groundMat.needsUpdate=true;
  }
  groundM.updateMatrixWorld(true);
 }

 /* Ensure door hardware and room fallback material carry real library maps too */
 if(typeof svHwMat==='function'&&MAT.bronze&&MAT.bronze.map){
  const hw=svHwMat();
  hw.map=MAT.bronze.map;hw.normalMap=MAT.bronze.normalMap;hw.roughnessMap=MAT.bronze.roughnessMap;
  const L=MAT.bronze.userData&&MAT.bronze.userData.lib;
  if(L)matHook(hw,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));
 }
 if(MAT.room&&MAT.danxia&&MAT.danxia.map&&!MAT.room.map){
  MAT.room.map=MAT.danxia.map;MAT.room.normalMap=MAT.danxia.normalMap;MAT.room.roughnessMap=MAT.danxia.roughnessMap;
 }

 const pmPrevBuild=buildWorld;
 buildWorld=function(){
  if(typeof WATER!=='undefined'){
   for(const D of WATER.drawn||[]){
    if(D.mesh){scene.remove(D.mesh);if(D.mesh.geometry)D.mesh.geometry.dispose();}
    if(D.plunge){scene.remove(D.plunge);if(D.plunge.geometry)D.plunge.geometry.dispose();}
   }
   if(WATER.drawn)WATER.drawn.length=0;
   if(WATER.surfaces)WATER.surfaces.length=0;
  }
  const W0=pmPrevBuild();
  /* Guarantee 100% of non-glow, non-glass furniture meshes in SVF.group carry real library detail maps */
  if(typeof SVF!=='undefined'&&SVF.group){
   SVF.group.traverse(m=>{
    if(m.isMesh&&!m.material.isMeshBasicMaterial&&!m.material.transparent&&!m.material.map){
     m.material.userData.family=m.material.userData.family||'wood';
     if(svfDetail(m.material))SVF.detailed.push(m.material.userData.family);
    }
   });
  }
  /* Draw core/water sandstone-bentonite seep-contact pools (WATER.still) & irrigation rills (WATER.flow) */
  if(typeof WATER!=='undefined'){
   for(const r of REG){
    if(r.stills){
     for(const st of r.stills){
      const S=WATER.still({name:st.name,level:st.level,bounds:st.bounds,poly:st.poly});
      WATER.drawStill(S,{
       THREE,scene,
       color:st.color==null?0x1b5658:st.color,
       roughness:st.roughness==null?.04:st.roughness,
       metalness:st.metalness==null?.18:st.metalness,
       envMapIntensity:st.envMapIntensity==null?.8:st.envMapIntensity
      });
     }
    }
    if(r.flows){
     for(const fl of r.flows){
      const S=WATER.flow({name:fl.name,pts:fl.pts,width:fl.width,speed:fl.speed});
      WATER.drawFlow(S,{THREE,scene,shallow:0x3f8886,deep:0x174448,roughness:.12,envMapIntensity:.36});
     }
    }
   }
  }
  return W0;
 };

 function pmOreLinks(){
  const nodes=REG.filter(r=>r.kind==='res-node').map(r=>({id:r.tid||r.key,key:r.key,kind:r.tags.rock,grade:r.tags.level,x:r.x,z:r.z}));
  const mines=REG.filter(r=>!r.parent&&resWorksOf(r)).map(r=>({id:r.tid||r.key,key:r.key,works:resWorksOf(r),x:r.x,z:r.z}));
  return {nodes,mines:mines.map(m=>Object.assign({},m,{source:resSource(m,nodes)}))};
 }
 function pmDims(){
  const out={};
  for(const k in DEFS){
   const d=DEFS[k];
   if(d.cls!=='building'&&d.kind!=='res-node')continue;
   out[k]={
    cls:d.cls,kind:d.kind||null,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,wealth:d.tags.wealth||null,
    types:d.tags.types||null,role:d.tags.role||null,job:d.tags.job||null,cut:!!d.cut
   };
  }
  return out;
 }
 globalThis.pmOreLinks=pmOreLinks;
 globalThis.pmDims=pmDims;
})();
