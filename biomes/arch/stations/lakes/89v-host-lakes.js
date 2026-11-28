// ================================================================= HOST — Axial Rift Lakes, Natural Estuary Mouth, Scalloped Gours & Oxbow Tarn
// Loaded only for --station lakes (before 89w-host-water.js).
//   1. Upper (+14.5 m) & Lower (+6.0 m) Axial Rift Lakes on WATER.open + shoreGrid (cell 5 m: exact signed-distance shoreline & 6 cm linear depth)
//      with a linear-RGB olive-marl river plume billowing organically out of the drowned estuary throat.
//   2. Arch Axial River cross-fading smoothly inside the drowned outlet & estuary throats (zero protruding ribbon or straight cutoff).
//   3. 16 scalloped crescent/kidney travertine rimstone gours (Pamukkale/Huanglong style) with 3D fluted ivory carbonate dams & cascade veils.
function LAKES_BUILD_WATER(ctx){
 const S=SITE,lin=ctx.lin,spring=ctx.spring,W_OUT=ctx.out;
 const {TAU,clamp,lerp,mix,smooth,fbm}=BIO.fn;
 const SWELL_LAKE=[[.005,6,28,0,.015],[.003,3.5,-35,1.2,.012]];

 /* Bounding boxes for each water body so 5 m shoreGrid runs in ~30 ms */
 const boxAround=pts=>{
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;
  for(const p of pts){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<z0)z0=p[1];if(p[1]>z1)z1=p[1];}
  return[Math.max(-TERR.R*1.08,x0-120),Math.max(-TERR.R*1.08,z0-120),Math.min(TERR.R*1.08,x1+120),Math.min(TERR.R*1.08,z1+120)];
 };
 const upBox=boxAround([L.XZ(-2750,-1150),L.XZ(-2750,1150),L.XZ(S.upperLake.sMax+160,-1150),L.XZ(S.upperLake.sMax+160,1150)]);
 const loBox=boxAround([L.XZ(S.lowerLake.sMin-160,-1180),L.XZ(S.lowerLake.sMin-160,1180),L.XZ(2750,-1180),L.XZ(2750,1180)]);
 const upSeed=L.XZ(S.upperLake.sMax-420,L.rivA(S.upperLake.sMax));
 const loSeed=L.XZ(S.lowerLake.sMin+420,L.rivA(S.lowerLake.sMin));

 /* 1. UPPER AXIAL RIFT LAKE (+14.5 m freshwater graben basin in the WSW, plunging to -38 m) */
 const UP_LAKE=WATER.open({
  name:'Upper Axial Rift Lake (+14.5 m freshwater graben basin)',
  level:S.upperLake.level,
  swell:SWELL_LAKE,
  field:0,
  bounds:upBox,
  bed:terrainH,
  bedBox:upBox,
  shore:{
   cell:8,
   seeds:[upSeed],
   land:(x,z)=>L.S_OF(x,z)>L.upShoreS(L.A_OF(x,z),x,z)+78||Math.abs(L.A_OF(x,z))>S.upperLake.halfW+240
  }
 });
 const UP_DRAW=WATER.draw(UP_LAKE,{surf:false,breakers:false,renderOrder:1,ramp:[1.5,16],roughness:.10,metalness:.05,envMapIntensity:.58,shallow:lin(0x44857e),deep:lin(0x0b3948)});
 UP_DRAW.mesh.userData.inspectLabel='Upper Axial Rift Lake (+14.5 m freshwater, 52 m deep)';

 /* 2. LOWER AXIAL RIFT LAKE (+6.0 m freshwater graben basin in the ENE, plunging to -34 m) + soft linear-RGB olive-marl plume */
 const mpEnd=L.XZ(S.lowerLake.sMin-145,L.rivA(S.lowerLake.sMin-145)),mpPrev=L.XZ(S.lowerLake.sMin-205,L.rivA(S.lowerLake.sMin-205));
 const mdx=mpEnd[0]-mpPrev[0],mdz=mpEnd[1]-mpPrev[1],mdl=Math.hypot(mdx,mdz)||1,mux=mdx/mdl,muz=mdz/mdl;
 const SILT_HEX=lin(0x667c52).getHex();
 const PL_BOX=[Math.min(mpEnd[0],loSeed[0])-460,Math.min(mpEnd[1],loSeed[1])-460,Math.max(mpEnd[0],loSeed[0])+460,Math.max(mpEnd[1],loSeed[1])+460];
 const LO_LAKE=WATER.open({
  name:'Lower Axial Rift Lake (+6.0 m freshwater graben basin)',
  level:S.lowerLake.level,
  swell:SWELL_LAKE,
  field:0,
  bounds:loBox,
  bed:terrainH,
  bedBox:loBox,
  shore:{
   cell:8,
   seeds:[loSeed],
   land:(x,z)=>L.S_OF(x,z)<L.loShoreS(L.A_OF(x,z),x,z)-78||Math.abs(L.A_OF(x,z))>S.lowerLake.halfW+240
  },
  tint:{box:PL_BOX,cell:10,at:(x,z)=>{
   const px=x-mpEnd[0],pz=z-mpEnd[1],u=px*mux+pz*muz,v=-px*muz+pz*mux;
   if(u<-90||u>520)return null;
   const uOut=Math.max(0,u);
   const drift=-.24*uOut-24*Math.sin(uOut*.009);
   const dv=v-drift,rad=Math.hypot(dv*.86,uOut*.88);
   const billow=.64+.36*fbm(x*.009,z*.009,4.7,3);
   const throat=u<0?smooth(-90,-8,u)*smooth(68,16,Math.abs(v)):1;
   const a=.40*throat*smooth(460,12,rad)*billow;
   return a>.012?{c:SILT_HEX,a}:null;
  }},
  tintFlow:{cell:12,period:58,swirl:.16,scale:115,evolve:.8,fil:.48,filScale:28,v:(x,z)=>{
   const px=x-mpEnd[0],pz=z-mpEnd[1],u=px*mux+pz*muz,v=-px*muz+pz*mux;
   const dd=Math.hypot(u,v);
   if(u<-100||dd>580)return null;
   const k=.34*smooth(540,12,dd),ou=Math.max(.18,u/(dd||1)),ov=v/(dd||1)-.22;
   return[mux*k*ou-muz*(k*ov*.55+.03),muz*k*ou+mux*(k*ov*.55+.03)];
  }}
 });
 const LO_DRAW=WATER.draw(LO_LAKE,{surf:false,breakers:false,renderOrder:1,ramp:[1.5,16],roughness:.10,metalness:.05,envMapIntensity:.58,shallow:lin(0x44857e),deep:lin(0x0b3948)});
 LO_DRAW.mesh.userData.inspectLabel='Lower Axial Rift Lake (+6.0 m freshwater, 40 m deep, with river marl plume)';
 BIGW=LO_LAKE;BIG_DRAW=LO_DRAW;

 /* 3. OXBOW SEDGE-FEN TARN (+11.4 m calm backwater basin on the SSE alluvial terrace) */
 const OX=L.OXBOW,oxBox=[OX.x-OX.r*2.1,OX.z-OX.r*2.1,OX.x+OX.r*2.1,OX.z+OX.r*2.1];
 const OX_SURF=WATER.open({
  name:'Oxbow sedge-fen tarn (+11.4 m backwater)',
  level:OX.level,
  swell:[[.0015,1.8,12,0,.008]],
  field:0,
  bounds:oxBox,
  bed:terrainH,
  bedBox:oxBox,
  shore:{cell:4,seeds:[[OX.x,OX.z]],land:(x,z)=>Math.hypot((x-OX.x)*.92,(z-OX.z)*1.12)>OX.r+14}
 });
 const OX_DRAW=WATER.draw(OX_SURF,{surf:false,breakers:false,renderOrder:1,ramp:[.6,4],roughness:.08,metalness:.04,envMapIntensity:.54,shallow:lin(0x52886e),deep:lin(0x1b483e)});
 OX_DRAW.mesh.userData.inspectLabel='Oxbow sedge-fen tarn (peat-and-marl backwater)';

 /* 4. ARCH AXIAL RIVER: alpha-feathered (transparent: true, refine: true) inside the drowned outlet/estuary throats so zero ribbon edge protrudes */
 const rivKeep=(x,z)=>{
  const s=L.S_OF(x,z),wob=12*(fbm(x*.028,z*.028,9.1,2)-.5);
  return smooth(S.upperLake.sMax+52,S.upperLake.sMax+118,s+wob)*smooth(S.lowerLake.sMin-118,S.lowerLake.sMin-182,s+wob);
 };
 const F_RIV=WATER.flow({name:'The Arch Axial River (inter-lake trunk channel)',pts:L.RIV_PTS,width:L.RIV_W,speed:S.river.speed,rapids:[.008,.038]});
 const D_RIV=WATER.drawFlow(F_RIV,{shallow:lin(0x58988e),deep:lin(0x26686e),color:0xffffff,roughness:.11,metalness:.05,envMapIntensity:.52,step:6,across:6,margin:1.1,depthBias:1.5,renderOrder:2,transparent:true,depthWrite:false,refine:true,pick:true,keep:rivKeep});
 D_RIV.mesh.userData.inspectLabel='The Arch Axial River (inter-lake trunk channel)';

 /* 5. TYPE II HYPERALKALINE SPRING, RECEIVING POOL & 16 SCALLOPED CRESCENT RIMSTONE TRAVERTINE GOURS */
 const ALK_R={deep:[.04,.42,.52],blue:[.22,.66,.72],green:[.62,.84,.86],yel:[.86,.93,.93],ora:[.92,.95,.94],rust:[.95,.96,.95]};
 S.springs.forEach((sp,i)=>spring('spring'+i,'Type II spring '+(i+1)+' (pH ~11.5, '+sp.flow+' L/s, hydrogen)',sp.x,sp.z,sp.r,L.prof(sp.x,sp.z)-.6,.45,ALK_R,{milky:.7}));
 if(S.pool)spring('pool','The alkaline pool (pH ~11)',S.pool.x,S.pool.z,S.pool.r,L.POOL_LV,.3,ALK_R,{milky:.8});

 /* Scalloped crescent WATER.still pools + merged 3D fluted ivory carbonate rimstone dam walls + cascade veils */
 const GOURS=L.GOURS,gPools=[],gFalls=[];
 const damPos=[],damNrm=[],damUv=[],damCol=[],damIdx=[];
 const pushRimArc=(g)=>{
  const nArc=34,a0=-Math.PI*.82,a1=Math.PI*.82;
  /* Cross-section profile across the rimstone dam: [radial factor, height rel g.y, outward normal tilt, brightness] */
  const prof=[[0.93,-.36,-1,.88],[0.985,.08,-.3,.97],[1.045,.11,.2,1.0],[1.13,-.32,.85,.94],[1.26,-1.48,.92,.84]];
  const pLen=prof.length,base=damPos.length/3;
  for(let i=0;i<=nArc;i++){
   const u=i/nArc,ang=lerp(a0,a1,u),sh=L.gourShape(g,ang);
   const ca=Math.cos(ang),sa=Math.sin(ang);
   /* Local radial vector in world XZ */
   const lx=ca*g.ry,lz=sa*g.rx;
   const wxDir=lx*g.dx-lz*g.dz,wzDir=lx*g.dz+lz*g.dx,wLen=Math.hypot(wxDir,wzDir)||1;
   const nx=wxDir/wLen,nz=wzDir/wLen;
   const flute=.045*Math.sin(ang*18+g.ph2);
   for(let j=0;j<pLen;j++){
    const pr=prof[j],rf=sh*(pr[0]+(j>=3?flute:0));
    const px=g.x+(ca*g.ry*rf)*g.dx-(sa*g.rx*rf)*g.dz;
    const pz=g.z+(ca*g.ry*rf)*g.dz+(sa*g.rx*rf)*g.dx;
    const py=g.y+pr[1]-(j===4?.35*(1-Math.max(0,ca)):0);
    damPos.push(px,py,pz);
    const ny=j===1||j===2?.88:.32,nt=pr[2];
    const nl=Math.hypot(nx*nt,ny,nz*nt)||1;
    damNrm.push(nx*nt/nl,ny/nl,nz*nt/nl);
    damUv.push(u*4.5,j/(pLen-1));
    const cb=pr[3]*(.94+.06*Math.sin(ang*9+j));
    damCol.push(cb*.96,cb*.95,cb*.90);
   }
  }
  for(let i=0;i<nArc;i++){
   for(let j=0;j<pLen-1;j++){
    const a=base+i*pLen+j,b=a+1,c=a+pLen,d=c+1;
    damIdx.push(a,c,b,b,c,d);
   }
  }
 };

 for(let gi=0;gi<GOURS.length;gi++){
  const g=GOURS[gi],poly=[],N=44;
  for(let k=0;k<N;k++){
   const ang=k/N*TAU,sh=L.gourShape(g,ang);
   let rFrac=.995;
   /* Clip smoothly outside any higher-elevation overlapping gour so every pool is a true curved kidney/crescent */
   for(let step=0;step<6;step++){
    const px=g.x+(Math.cos(ang)*g.ry*sh*rFrac)*g.dx-(Math.sin(ang)*g.rx*sh*rFrac)*g.dz;
    const pz=g.z+(Math.cos(ang)*g.ry*sh*rFrac)*g.dz+(Math.sin(ang)*g.rx*sh*rFrac)*g.dx;
    let hit=false;
    for(let hj=0;hj<gi;hj++){
     const ghUp=GOURS[hj];
     if(ghUp.y>g.y+.04&&L.gourLocal(ghUp,px,pz).d<1.09){hit=true;break;}
    }
    if(!hit)break;
    rFrac*=.84;
   }
   const px=g.x+(Math.cos(ang)*g.ry*sh*rFrac)*g.dx-(Math.sin(ang)*g.rx*sh*rFrac)*g.dz;
   const pz=g.z+(Math.cos(ang)*g.ry*sh*rFrac)*g.dz+(Math.sin(ang)*g.rx*sh*rFrac)*g.dx;
   poly.push([px,pz]);
  }
  gPools.push(WATER.still({name:'Travertine rimstone gour '+(gi+1),level:g.y,poly}));
  pushRimArc(g);

  /* Thin cascade veil over the downhill crest of each gour */
  const sh0=L.gourShape(g,0),lipC=[g.x+(g.ry*sh0*1.02)*g.dx,g.z+(g.ry*sh0*1.02)*g.dz];
  const hwLip=Math.min(4.2,g.rx*.34);
  const lip=[[lipC[0]-g.dz*hwLip,lipC[1]+g.dx*hwLip,g.y],[lipC[0]+g.dz*hwLip,lipC[1]-g.dx*hwLip,g.y]];
  const nextY=gi===GOURS.length-1?L.POOL_LV:GOURS[Math.min(GOURS.length-1,gi+1)].y;
  const drop=Math.max(.55,Math.min(2.4,g.y-nextY));
  gFalls.push(WATER.fall({name:'Gour rimstone cascade '+(gi+1),lip,dir:[g.dx,g.dz],speed:.52,drop,spread:1.5}));
 }
 if(gPools.length&&typeof WATER.drawPools==='function'){
  const dp=WATER.drawPools(gPools,{name:'Travertine rimstone gours',color:0xffffff,roughness:.06,metalness:.05,envMapIntensity:.55,renderOrder:1,gradient:{centre:lin(0x4eb4c0).getHex(),rim:lin(0xe4eeeb).getHex(),power:1.35}});
  if(dp&&dp.mesh)dp.mesh.userData.inspectLabel='Travertine rimstone gour basins (pH ~11, brucite-calcite)';
 }
 if(damIdx.length){
  const dGeo=new THREE.BufferGeometry();
  dGeo.setAttribute('position',new THREE.Float32BufferAttribute(damPos,3));
  dGeo.setAttribute('normal',new THREE.Float32BufferAttribute(damNrm,3));
  dGeo.setAttribute('uv',new THREE.Float32BufferAttribute(damUv,2));
  dGeo.setAttribute('color',new THREE.Float32BufferAttribute(damCol,3));
  dGeo.setIndex(damIdx);
  const dMat=new THREE.MeshStandardMaterial({map:TEX_DETAIL,color:0xf2efe6,roughness:.74,metalness:.02,vertexColors:true});
  const dMesh=new THREE.Mesh(dGeo,dMat);
  dMesh.userData.host=true;
  dMesh.userData.inspectLabel='Fluted travertine rimstone dam (Type II Ca-OH precipitate)';
  scene.add(dMesh);
 }
 if(gFalls.length&&typeof WATER.drawFalls==='function'){
  WATER.drawFalls(gFalls,{color:lin(0xeef5f3),opacity:.82,rowStep:1,cols:6,spray:false,plungeR:2.4,renderOrder:3});
 }
 W_OUT.terraces=[GOURS.length];W_OUT.springs=S.springs.length;

 /* 6. ALLUVIAL SERPENTINITE, NEPHRITE & AWARUITE COBBLE BOULDERS along inside meander point-bars */
 const BMAT=new THREE.MeshStandardMaterial({map:TEX_DETAIL,color:0xffffff,roughness:.82,metalness:.06,vertexColors:true});
 const bGeo=new THREE.DodecahedronGeometry(1,1);
 {const P=bGeo.attributes.position,col=[];
  for(let i=0;i<P.count;i++){
   const x=P.getX(i),y=P.getY(i),z=P.getZ(i);
   const n=1+.18*Math.sin(x*3.7+z*2.3)+.12*Math.cos(y*4.1-x*1.9);
   P.setXYZ(i,x*n,y*n*.62,z*n);
   col.push(.36+.08*y,.44+.1*y,.38+.06*y);
  }
  bGeo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  bGeo.computeVertexNormals();
 }
 L.BARS.forEach((b,bi)=>{
  for(let k=0;k<b.n;k++){
   const h1=KRAND.unit(KRAND.hash(S.seed,bi*31+k,401)),h2=KRAND.unit(KRAND.hash(S.seed,bi*31+k,402)),h3=KRAND.unit(KRAND.hash(S.seed,bi*31+k,403));
   const ang=h1*TAU,rrad=Math.sqrt(h2)*b.r,bx=b.x+Math.cos(ang)*rrad,bz=b.z+Math.sin(ang)*rrad;
   const by=terrainH(bx,bz),wy=waterH(bx,bz);
   if(wy>-1e8&&by<wy+.15)continue;
   const sc=.55+1.35*h3;
   const m=new THREE.Mesh(bGeo,BMAT);
   m.position.set(bx,by+sc*.22,bz);
   m.rotation.set(h1*.4,h2*TAU,h3*.4);
   m.scale.set(sc*1.25,sc*.75,sc);
   m.userData.host=true;m.userData.inspectLabel='Water-worn serpentinite and nephrite river boulder';
   scene.add(m);
  }
 });

 Object.assign(W_OUT,{upperLake:true,lowerLake:true,oxbow:true,riverPts:L.RIV_PTS.length,gours:GOURS.length});
}
