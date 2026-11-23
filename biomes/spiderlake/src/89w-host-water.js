// ================================================================= HOST — +1,460 m lake, degumming springs & cataracts (core/water; [draw])
// Implements Spider Lake's unbifurcated hydrology (PLAN.md sections 1.1 & 4):
//   - Open +1,460.0 m crater lake (WATER.open + farbed on Stations 1-5; strictly 0 open water on Station 6 rampart!)
//   - Alkaline +36.8-44.2 C carbonate sericin-degumming springs & steaming fumaroles (52/52b + 52c/52d thermal aprons)
//   - Sole 380 m3/s SW breach cataracts into 9102 Ham-Tsek (spillway) & 640 m3/s 9106 Hau-Gel inflow braids (fen)
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer:renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x46584a)});
}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,lake:false,thermalSprings:0,fumaroles:0,flows:0};

if(SITE.hasOpenLake){
 const SB=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
 const inThermalBowl=(x,z)=>{
  if(!SITE.thermalPools)return false;
  for(let i=0;i<SITE.thermalPools.length;i++){
   const P=SITE.thermalPools[i];
   if(Math.hypot(x-P.x,z-P.z)<P.r*1.28)return true;
  }
  return false;
 };
 const maskOf=(box,cell,fn)=>{
  const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(fn(box[0]+(i+0.5)*cell,box[1]+(j+0.5)*cell))d[j*nx+i]=255;
  return{x0:box[0],z0:box[1],cell:cell,nx:nx,nz:nz,data:d};
 };
 const lakeAllowed=(x,z)=>{
  if(SKEY==='spillway'&&x<-18)return false;
  if(SKEY==='fen'&&(z+0.35*x)+32>2&&inFlowChannel(x,z,2))return false;
  if(inThermalBowl(x,z))return false;
  return terrainH(x,z)<0.04;
 };
 const swellCfg=SKEY==='narrows'
  ?[[0.045,18,22,0,0.025],[0.024,10,-32,1.1,0.02]]
  :[[0.020,14,28,0,0.014],[0.012,8,-25,0.8,0.01]];

 const LAKE_WATER=WATER.open({
  name:'Spider Lake (+1,460.0 m Highland Crater Basin)',
  level:SITE.lakeLevelLocal,
  swell:swellCfg,
  field:SKEY==='narrows'?0.16:0.08,
  bounds:SB,
  bed:terrainH,bedBox:SB,bedCell:10,
  mask:maskOf(SB,8,lakeAllowed)
 });
 if(typeof WATER.farBed==='function'){
  WATER.farBed(LAKE_WATER,{ground:landH,cell:64});
 }
 const LAKE_DRAW=WATER.draw(LAKE_WATER,{
  surf:false,breakers:false,renderOrder:1,roughness:0.09,metalness:0.05,envMapIntensity:0.44,ramp:[1.2,14],pick:true,
  shallow:lin(0x4cb0a2),deep:lin(0x13424e)
 });
 LAKE_DRAW.mesh.userData.inspectLabel='Spider Lake (+1,460.0 m warm hydrothermal midge-nursery basin, 1.33 atm)';
 W_OUT.lake=true;
}

// Alkaline carbonate sericin-degumming thermal springs & fumarole steam plumes (52/52b + 52c/52d)
if(SITE.thermalPools&&SITE.thermalPools.length&&typeof WATER.spring==='function'&&typeof WATER.drawSpring==='function'){
 const springRecs=[],fumRecs=[],springMats=new Map(),sharedU={};
 for(let i=0;i<SITE.thermalPools.length;i++){
  const P=SITE.thermalPools[i];
  const S=WATER.spring({
   key:P.key,
   name:P.name+' (+'+P.tempC.toFixed(1)+' C)',
   x:P.x,z:P.z,r:P.r,level:P.level,
   temp:P.temp,
   mineral:'copper',
   milky:0.26,
   boil:P.tempC>=43.0?0.48:0.10,
   steam:0.85
  });
  WATER.drawSpring(S,{
   THREE:THREE,scene:scene,mats:springMats,uniforms:sharedU,
   fog:scene.fog,wind:SITE.wind,renderOrder:2
  });
  springRecs.push({S:S,apron:'travertine',T:P.tempC,reach:P.r*1.85});
  W_OUT.thermalSprings++;

  if(typeof WATER.fumarole==='function'&&typeof WATER.drawFumarole==='function'){
   const F=WATER.fumarole({
    key:P.key+'-steam',
    name:P.name+' Alkaline Steam Plume',
    x:P.x,z:P.z,y:P.level+0.08,
    r:Math.max(1.8,P.r*0.36),
    rate:P.tempC>=42.0?1.15:0.75,
    period:0,
    T:P.tempC,
    mineral:'sinter',
    runoff:false,
    world:5813
   });
   WATER.drawFumarole(F,{THREE:THREE,scene:scene,uniforms:sharedU,fog:scene.fog,wind:SITE.wind,renderOrder:3});
   fumRecs.push(F);
   W_OUT.fumaroles++;
  }
  REGISTER({
   tagId:'spiderlake:'+P.key,
   name:P.name,
   tagClass:'feature',
   x:P.x,y:P.level-0.5,z:P.z,r:P.r+2.0,h:3.5,
   tags:{biome:'spiderlake',thermal:true,tempC:P.tempC,degumming:P.tempC<43.0}
  });
 }
 if(typeof WATER.thermalAprons==='function'){
  WATER.thermalAprons({
   name:'Spider Lake Alkaline Carbonate Degumming Aprons',
   springs:springRecs,
   fumaroles:fumRecs,
   ground:terrainH,
   soil:SITE.tempC,
   world:5813
  });
 }
}

// Monotone non-climbing cataract & delta flows (spillway 380 m3/s & fen 640 m3/s; strictly 0 on rampart!)
FLOW_LINES.forEach(FL=>{
 const pts=[];
 let yc=1e9;
 for(let i=0;i<FL.pts.length;i++){
  const px=FL.pts[i][0],pz=FL.pts[i][1];
  yc=Math.min(yc,terrainH(px,pz)+FL.depth);
  pts.push([px,pz,yc]);
 }
 const fw=WATER.flow({
  name:FL.name,pts:pts,width:FL.w*2,speed:FL.speed,
  rapids:SKEY==='spillway'?[0.08,0.24]:[0.02,0.08]
 });
 const flowKeep=SKEY==='spillway'
  ?(x,z)=>clamp((-16-x)/10,0,1)
  :SKEY==='fen'
  ?(x,z)=>clamp(((z+0.35*x)+40)/26,0,1)
  :null;
 const fd=WATER.drawFlow(fw,Object.assign({
  shallow:lin(0x62b8aa),deep:lin(0x1b525c),color:0xffffff,roughness:0.12,metalness:0.05,envMapIntensity:0.46,
  step:6,across:5,margin:1.0,depthBias:1.4,renderOrder:2,pick:true
 },flowKeep?{keep:flowKeep,refine:true}:{}));
 fd.mesh.userData.inspectLabel=FL.name;
 W_OUT.flows++;
});
if(WATER.breakupFlows)WATER.breakupFlows();

window._water=Object.assign({surfaces:WATER.surfaces.length},W_OUT);
