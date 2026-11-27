// ================================================================= HOST — water: braided channels, silt plume, slackwater ponds & bitumen tar seeps (core/water)
//   bioherm : WATER.open estuarine bay + WATER.plume (ext/61 Riwa-Wata golden silt front) + 3 braided WATER.flow channels + 3 WATER.still peat-ponds
//   bitumen : 5 glossy iridescent-rimmed WATER.still natural bitumen/asphalt tar pools + 2 WATER.flow tsunami scour drainage streams
//   throat  : WATER.open Ria Sound mouth + WATER.plume golden delta outflow + 2 deep braided WATER.flow throat channels
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6c624e)});
}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();

function maskOf(box,cell,fn){
 const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  if(fn(box[0]+(i+0.5)*cell,box[1]+(j+0.5)*cell))d[j*nx+i]=255;
 }
 return{x0:box[0],z0:box[1],cell,nx,nz,data:d};
}

function discPoly(cx,cz,r,n){
 const pts=[];
 for(let i=0;i<n;i++){const a=i/n*TAU;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 return pts;
}

function ribbon(name,pts,width,speed,shallow,deep,rapids,keep){
 const F=WATER.flow({name,pts,width,speed,rapids:rapids||[0.008,0.035]});
 const D=WATER.drawFlow(F,Object.assign({
  shallow:lin(shallow),deep:lin(deep),color:0xffffff,
  roughness:0.13,metalness:0.05,envMapIntensity:0.45,
  step:8,across:4,margin:0.8,depthBias:1.5,renderOrder:2,pick:true,refine:true
 },keep?{keep}:{}));
 if(keep)F.keepAt=keep;
 {
  const m=D.mesh.material,k0=m.customProgramCacheKey;
  m.customProgramCacheKey=()=>(k0?k0.call(m):'')+'|ddelta:'+shallow+','+deep+(keep?'|keep':'');
  m.needsUpdate=true;
 }
 D.mesh.userData.inspectLabel=name;
 return{F,D};
}

let BIGW=null,BIG_DRAW=null;
const FLOW_DRAWS=[],STILL_DRAWS=[],W_OUT={};

if(SKEY==='bioherm'){
 const BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
 /* Advected golden-brown Riwa-Wata river silt plume swirling from channel mouths into blue-green Western Ocean tide (ext/61) */
 const plumeTint={
  box:BOX,cell:32,
  at:(x,z)=>{
   const d=x-L.bayShoreX(z);
   if(d>80)return null;
   let mBoost=0;
   for(const c of L.CH){
    const mp=c.F.p(c.mouthS,c.off(c.mouthS));
    mBoost=Math.max(mBoost,smooth(520,60,Math.abs(z-mp[1]))*smooth(-1450,-40,d));
   }
   const a=clamp(Math.max(mBoost*0.85,smooth(-1150,40,d)*(0.45+0.35*Math.cos(z*0.0018))),0,0.88);
   return a>0.02?{c:0xb88b4a,a}:null;
  }
 };
 BIGW=WATER.open({
  name:'Western Ocean Tidal Front and Riwa-Wata Silt Plume',
  level:0,
  swell:[[0.14,48,12,0,0.18],[0.08,29,-26,1.4,0.14]],
  field:0.65,bounds:BOX,bed:terrainH,bedCell:10,
  mask:maskOf(BOX,10,(x,z)=>(x<L.bayShoreX(z)+24||(x<L.bayShoreX(z)+180&&L.chanDist(x,z)>24))&&terrainH(x,z)<0.12),
  tint:plumeTint,
  tintFlow:{v:()=>[-0.42,0.07],cell:32,period:60,swirl:0.16,scale:150,evolve:0.8,fil:0.46,filScale:34}
 });
 if(WATER.farBed)WATER.farBed(BIGW,{ground:terrainH,cell:64});
 BIG_DRAW=WATER.draw(BIGW,{
  surf:true,breakers:true,renderOrder:1,roughness:0.12,metalness:0.05,envMapIntensity:0.6,
  shallow:lin(0x889a6e),deep:lin(0x1c5c68)
 });
 BIG_DRAW.mesh.userData.inspectLabel='Western Ocean Tidal Front and Riwa-Wata Silt Plume';

 L.CH.forEach(c=>{
  const pts=[],sEnd=c.mouthS+6;
  for(let s=0;s<=sEnd+0.1;s+=16){
   const sc=Math.min(s,sEnd),p=c.F.p(sc,c.off(sc));
   pts.push([p[0],p[1],c.lv(sc)]);
  }
  const keepFn=(x,z)=>clamp((x-(L.bayShoreX(z)+16))/28,0,1);
  FLOW_DRAWS.push(ribbon('Braided Distributary ('+c.key+', silt-laden)',pts,c.w*0.92,c.speed,0xb89658,0x5a6848,null,keepFn));
 });

 SITE.ponds.forEach((p,i)=>{
  const S0=WATER.still({
   name:'Slackwater Peat-Mat Basin '+(i+1),
   level:p.level,
   poly:discPoly(p.x,p.z,p.r*1.02,24),
   gradient:{centre:0x22362c,rim:0x526444,power:1.4}
  });
  const D0=WATER.drawStill(S0,{color:0xffffff,roughness:0.08,metalness:0.06,envMapIntensity:0.55,transparent:false,pick:true,renderOrder:1});
  D0.mesh.userData.inspectLabel=S0.name;
  STILL_DRAWS.push({S:S0,D:D0});
 });
 Object.assign(W_OUT,{plume:true,channels:L.CH.length,ponds:SITE.ponds.length});
}

if(SKEY==='bitumen'){
 L.SC.forEach(c=>{
  const pts=[];
  for(let s=0;s<=c.F.L+0.1;s+=16){
   const p=c.F.p(s,c.off(s));
   pts.push([p[0],p[1],c.lv(s)]);
  }
  FLOW_DRAWS.push(ribbon('Blue-Clay Scour Channel ('+c.key+')',pts,c.w*0.64,c.speed,0x5c7886,0x2c4252));
 });

 SITE.tarSeeps.forEach((ts,i)=>{
  const S0=WATER.still({
   name:'Natural Bitumen and Asphalt Pool '+(i+1)+' (bitumen = 118)',
   level:ts.level,
   poly:discPoly(ts.x,ts.z,ts.r*0.98,28),
   gradient:{centre:0x09080c,rim:0x3e2d48,power:1.85}
  });
  const D0=WATER.drawStill(S0,{
   color:0xffffff,roughness:0.035,metalness:0.24,envMapIntensity:0.88,
   transparent:false,pick:true,renderOrder:2
  });
  D0.mesh.userData.inspectLabel=S0.name;
  STILL_DRAWS.push({S:S0,D:D0});
 });
 Object.assign(W_OUT,{scourFlows:L.SC.length,tarPools:SITE.tarSeeps.length});
}

if(SKEY==='throat'){
 const BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
 const plumeTint={
  box:BOX,cell:32,
  at:(x,z)=>{
   const d=x-L.soundShoreX(z);
   if(d>80)return null;
   const a=clamp(smooth(-1100,40,d)*0.84,0,0.85);
   return a>0.02?{c:0xb88e4e,a}:null;
  }
 };
 BIGW=WATER.open({
  name:'Ria Sound Estuarine Throat and Silt Plume',
  level:0,
  swell:[[0.09,38,8,0,0.14],[0.05,22,-22,1.1,0.10]],
  field:0.5,bounds:BOX,bed:terrainH,bedCell:10,
  mask:maskOf(BOX,10,(x,z)=>(x<L.soundShoreX(z)+24||(x<L.soundShoreX(z)+160&&L.chanDist(x,z)>24))&&terrainH(x,z)<0.12),
  tint:plumeTint,
  tintFlow:{v:()=>[-0.52,0.05],cell:32,period:60,swirl:0.14,scale:140,evolve:0.8,fil:0.42,filScale:32}
 });
 if(WATER.farBed)WATER.farBed(BIGW,{ground:terrainH,cell:64});
 BIG_DRAW=WATER.draw(BIGW,{
  surf:true,breakers:false,renderOrder:1,roughness:0.11,metalness:0.05,envMapIntensity:0.6,
  shallow:lin(0x88986a),deep:lin(0x225a66)
 });
 BIG_DRAW.mesh.userData.inspectLabel='Ria Sound Estuarine Throat and Silt Plume';

 L.CH.forEach(c=>{
  const pts=[],sEnd=c.mouthS+6;
  for(let s=0;s<=sEnd+0.1;s+=16){
   const sc=Math.min(s,sEnd),p=c.F.p(sc,c.off(sc));
   pts.push([p[0],p[1],c.lv(sc)]);
  }
  const keepFn=(x,z)=>clamp((x-(L.soundShoreX(z)+16))/28,0,1);
  FLOW_DRAWS.push(ribbon('Ria Throat Distributary ('+c.key+')',pts,c.w*0.92,c.speed,0xba9656,0x4c6252,null,keepFn));
 });
 Object.assign(W_OUT,{plume:true,channels:L.CH.length});
}

if(WATER.breakupFlows)WATER.breakupFlows();
window._water=Object.assign({station:SKEY,surfaces:WATER.surfaces.length},W_OUT);
