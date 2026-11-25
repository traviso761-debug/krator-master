// ================================================================= HOST — ocean, caldera lagoon, rimstone pools, tarn & rivers (core/water; [draw])
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer:renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x425246)});
}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,ocean:false,caldera:false,rimstonePools:0,tarn:false,flows:0,plume:false};

 if(SKEY==='shore'){
 const SB=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
 const FLOUR=(c=>[c.r,c.g,c.b])(lin(0x4ea892));
 const _hx=c=>(Math.round(clamp(c[0],0,1)*255)<<16)|(Math.round(clamp(c[1],0,1)*255)<<8)|Math.round(clamp(c[2],0,1)*255);
 const MOUTH=SITE.mouth;
 const plumeK=(x,z)=>{
  const dx=x-MOUTH.x,dz=z-MOUTH.z;
  if(dx>60)return 0;
  return 0.86*smooth(480,22,Math.hypot(dx*0.85,dz-0.25*dx));
 };
 const PLUME_FLOW=!!(WATER.tintFlowAt&&new URLSearchParams(location.search).get('plume')==='1');
 const C=SITE.caldera;
 const inCaldera=(x,z)=>Math.hypot((x-C.x)/C.rx,(z-C.z)/C.rz)<1.05;
 const maskOf=(box,cell,fn)=>{
  const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(fn(box[0]+(i+0.5)*cell,box[1]+(j+0.5)*cell))d[j*nx+i]=255;
  return{x0:box[0],z0:box[1],cell:cell,nx:nx,nz:nz,data:d};
 };

 // 1. Heavy 1.60 atm NW Ocean with surf breakers + Kopa-Kawa (Khopri-Tskhali) emerald glacial-flour plume
 const inUpstreamMouth=(x,z)=>x>-52&&distToPoly(FLOW_LINES[0].pts,x,z).d<34;
 const SEA_WATER=WATER.open({
  name:'NW Ocean (Crookshore Surf)',
  level:0,
  swell:[[0.36,62,25,0,0.05],[0.18,28,-35,1.2,0.04]],
  field:0.38,
  bounds:SB,
  bed:terrainH,bedBox:SB,bedCell:10,
  mask:maskOf(SB,10,(x,z)=>!inCaldera(x,z)&&!inUpstreamMouth(x,z)&&terrainH(x,z)<1.2),
  shore:{seeds:[[-380,0],[-380,220],[-380,-220]],land:(x,z)=>inCaldera(x,z)||inUpstreamMouth(x,z)||terrainH(x,z)>0.02},
  tint:{box:SB,cell:14,at:(x,z)=>{
   const pk=plumeK(x,z);
   if(pk<0.01)return null;
   return{c:_hx(FLOUR),a:Math.min(0.58,pk*0.68)};
  }},
  ...(PLUME_FLOW?{tintFlow:{cell:20,period:56,swirl:0.12,scale:120,evolve:0.8,fil:0.42,filScale:26,
   v:(x,z)=>{
    const dx=x-MOUTH.x,dz=z-MOUTH.z,dd=Math.hypot(dx,dz);
    if(dd>620||terrainH(x,z)>1.0)return null;
    const k=0.34*smooth(580,20,dd);
    return[-k*0.85,k*0.28];
   }}}:{})
 });
 const SEA_DRAW=WATER.draw(SEA_WATER,{
  surf:true,breakers:true,renderOrder:1,roughness:0.16,metalness:0.05,envMapIntensity:0.35,ramp:[1.5,16],pick:true,
  shallow:lin(0x3a847a),deep:lin(0x0d2b38)
 });
 SEA_DRAW.mesh.userData.inspectLabel='NW Ocean (1.60 atm Crookshore breakers & Kopa-Kawa glacial-flour plume)';
 W_OUT.ocean=true;W_OUT.plume=true;

 if(samplersOf(MAT_GROUND)+5<=14){
  WATER.wetGround(MAT_GROUND,{surface:SEA_WATER});
 }

 // Respond to [Tsunami drawdown] live toggle
 tick(()=>{
  const targetLvl=-CROOK_STATE.drawdownM;
  if(SEA_DRAW&&SEA_DRAW.mesh)SEA_DRAW.mesh.position.y=targetLvl;
 });

 // 2. Calm sheltered drowned ejecta-caldera lagoon (surf: false, breakers: false)
 if(WATER.maskFromGround){
  const pad=C.rx*1.22,CB=[C.x-pad,C.z-pad,C.x+pad,C.z+pad];
  const cmask=WATER.maskFromGround({
   box:CB,cell:5,level:C.level,ground:terrainH,
   seed:(x,z)=>Math.hypot(x-C.x,z-C.z)<32,
   limit:(x,z)=>inCaldera(x,z)
  });
  const CAL_WATER=WATER.open({name:'Sheltered Ejecta-Caldera Lagoon',level:C.level,swell:[[0.015,6,35,0,0.015]],field:0,bounds:CB,mask:cmask});
  const CAL_DRAW=WATER.draw(CAL_WATER,{surf:false,breakers:false,renderOrder:1,roughness:0.09,metalness:0.05,envMapIntensity:0.42,shallow:lin(0x489888),deep:lin(0x164442),pick:true});
  CAL_DRAW.mesh.userData.inspectLabel='Sheltered Drowned Ejecta-Caldera Nursery Lagoon (baffled against ocean surf)';
  W_OUT.caldera=true;
 }
}

if(SKEY==='wash'){
 // 16 strictly monotone-stepped cold-seep terracotta, ochre, and celadon iron-jade rimstone pools (WATER.still + drawPools)
 const pools=RIM_POOLS.map(P=>{
  const poly=[];
  for(let k=0;k<24;k++){
   const a=(k/24)*TAU,rad=P.r*(0.92+0.07*Math.sin(a*3+P.i));
   poly.push([P.x+Math.cos(a)*rad,P.z+Math.sin(a)*rad]);
  }
  const cHex=P.stain==='celadon'?0x366e5e:P.stain==='terracotta'?0x5a3e2e:0x585232;
  const rHex=P.stain==='celadon'?0x7cb49c:P.stain==='terracotta'?0xb4623e:0xb88c42;
  return WATER.still({
   name:'Iron-Jade Rimstone Pool #'+(P.i+1),
   level:P.level,
   poly:poly,
   gradient:{centre:lin(cHex).getHex(),rim:lin(rHex).getHex(),power:1.3}
  });
 });
 if(pools.length){
  const PD=WATER.drawPools(pools,{name:'Crookwash Stepped Iron-Jade Rimstone Pools',color:0xffffff,roughness:0.06,metalness:0.05,envMapIntensity:0.52,renderOrder:1,pick:true});
  PD.mesh.userData.inspectLabel='Stepped Terracotta, Ochre & Celadon Iron-Jade Rimstone Pools (monotone cold-seep sinter)';
  W_OUT.rimstonePools=pools.length;
 }
}

if(SKEY==='head'&&WATER.maskFromGround){
 // Subalpine glacial moraine tarn (surf: false, breakers: false)
 const T=SITE.tarn,pad=T.rx*1.25,TB=[T.x-pad,T.z-pad,T.x+pad,T.z+pad];
 const tmask=WATER.maskFromGround({
  box:TB,cell:4,level:T.level,ground:terrainH,
  seed:(x,z)=>Math.hypot(x-T.x,z-T.z)<28,
  limit:(x,z)=>Math.hypot((x-T.x)/T.rx,(z-T.z)/T.rz)<1.18
 });
 const TARN_W=WATER.open({name:'Crookhead Subalpine Moraine Tarn',level:T.level,swell:[[0.012,5,40,0,0.01]],field:0,bounds:TB,mask:tmask});
 const TARN_D=WATER.draw(TARN_W,{surf:false,breakers:false,renderOrder:1,roughness:0.08,metalness:0.05,envMapIntensity:0.46,shallow:lin(0x64b2ac),deep:lin(0x1d4e58),pick:true});
 TARN_D.mesh.userData.inspectLabel='Crookhead Subalpine Moraine Tarn (turquoise glacial rock-flour water)';
 W_OUT.tarn=true;
}

// Monotone non-climbing river / torrent / snowmelt rill flows across all three stations
{
 const flowObjs=FLOW_LINES.map(FL=>{
  const pts=[];
  let yc=1e9;
  for(let i=0;i<FL.pts.length;i++){
   const px=FL.pts[i][0],pz=FL.pts[i][1];
   yc=Math.min(yc,terrainH(px,pz)+FL.depth);
   pts.push([px,pz,yc]);
  }
  return WATER.flow({name:FL.name,pts:pts,width:FL.w*2,speed:FL.speed,rapids:[0.05,0.16]});
 });
 if(SKEY==='wash'&&flowObjs.length>=2&&typeof WATER.join==='function'){
  WATER.join(flowObjs[1],flowObjs[0],{ramp:16});
 }
 flowObjs.forEach((fw,fi)=>{
  const FL=FLOW_LINES[fi];
  const flowKeep=SKEY==='shore'
   ?(x,z)=>clamp((x+68)/22,0,1)
   :SKEY==='head'
   ?(x,z)=>clamp((-60-z)/20,0,1)
   :null;
  const fd=WATER.drawFlow(fw,Object.assign({
   shallow:lin(0x6ea89c),deep:lin(0x245254),color:0xffffff,roughness:0.13,metalness:0.05,envMapIntensity:0.48,
   step:6,across:5,margin:1.0,depthBias:1.4,renderOrder:2,pick:true
  },flowKeep?{keep:flowKeep,refine:true}:{}));
  fd.mesh.userData.inspectLabel=FL.name;
  W_OUT.flows++;
 });
}
if(WATER.breakupFlows)WATER.breakupFlows();

window._water=Object.assign({surfaces:WATER.surfaces.length},W_OUT);
