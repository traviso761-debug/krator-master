// ================================================================= HOST — 9102 Ham-Tsek shut-in rapids, basalt step-pools & fumarole steam (core/water; [draw])
// Core Arachnoid Canyons Proper (`own`) is 100% inland (0 km2 sea or raster lake): all water is trunk river 9102 Ham-Tsek
// whitewater flows (Stations 1-3), 9 monotone basalt-weir turquoise step-pools (Station 2), and ring-fault fumarole steam plumes (Station 2).
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer:renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x424c44)});
}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,stepPools:0,fumaroles:0,flows:0};

// Station 2 (fumarole): 9 strictly monotone-descending turquoise basalt-sill step-pools + steaming ring-fault fumaroles
if(SKEY==='fumarole'){
 const pools=STEP_POOLS.map(P=>{
  const poly=[];
  for(let k=0;k<24;k++){
   const a=(k/24)*TAU,rad=P.r*(0.93+0.06*Math.sin(a*3+P.i));
   poly.push([P.x+Math.cos(a)*rad,P.z+Math.sin(a)*rad]);
  }
  const cHex=P.tempC>=34.5?0x1f767c:0x246874;
  const rHex=P.tempC>=34.5?0x6cd2c2:0x78c4b8;
  return WATER.still({
   name:'Basalt-Weir Step-Pool #'+(P.i+1)+' (+'+P.tempC+' C)',
   level:P.level,
   poly:poly,
   gradient:{centre:lin(cHex).getHex(),rim:lin(rHex).getHex(),power:1.25}
  });
 });
 if(pools.length&&typeof WATER.drawPools==='function'){
  const PD=WATER.drawPools(pools,{name:'Cauldron Basalt-Weir Step-Pools',color:0xffffff,roughness:0.07,metalness:0.05,envMapIntensity:0.52,renderOrder:1,pick:true});
  PD.mesh.userData.inspectLabel='Turquoise Basalt-Sill Dammed Hydrothermal Step-Pools (9 monotone steps)';
  W_OUT.stepPools=pools.length;
 }

 if(SITE.vents&&typeof WATER.fumarole==='function'&&typeof WATER.drawFumarole==='function'){
  const sharedU={};
  for(let i=0;i<SITE.vents.length;i++){
   const v=SITE.vents[i];
   if(v.kind!=='point')continue;
   const vy=terrainH(v.x,v.z);
   const F=WATER.fumarole({
    key:v.id,
    name:'Ring-Fault Sulfur-Steam Fumarole ('+v.T.toFixed(1)+' C)',
    x:v.x,z:v.z,y:vy+0.10,
    r:2.6,
    rate:v.T>=62.0?1.25:0.88,
    period:0,
    T:v.T,
    mineral:'sinter',
    runoff:false,
    world:5913
   });
   WATER.drawFumarole(F,{THREE:THREE,scene:scene,uniforms:sharedU,fog:scene.fog,wind:SITE.wind,renderOrder:3});
   W_OUT.fumaroles++;
   REGISTER({
    tagId:'arachnoids:'+v.id,
    name:'Ring-Fault Hydrothermal Fumarole ('+v.T.toFixed(1)+' C)',
    tagClass:'feature',
    x:v.x,y:vy-0.5,z:v.z,r:8.0,h:12.0,
    tags:{biome:'arachnoids',thermal:true,tempC:v.T}
   });
  }
 }
}

// Monotone non-climbing 9102 Ham-Tsek whitewater chutes (Stations 1-3; 0 flows on Station 4 frostrim)
FLOW_LINES.forEach(FL=>{
 const pts=[];
 let yc=1e9;
 for(let i=0;i<FL.pts.length;i++){
  const px=FL.pts[i][0],pz=FL.pts[i][1];
  yc=Math.min(yc,terrainH(px,pz)+FL.depth);
  pts.push([px,pz,yc]);
 }
 const fw=WATER.flow({
  name:FL.name,
  pts:pts,
  width:FL.w*2,
  speed:FL.speed,
  rapids:SKEY==='nexus'?[0.08,0.26]:[0.04,0.15]
 });
 const fd=WATER.drawFlow(fw,{
  shallow:lin(0x64b4a8),deep:lin(0x1b4e58),color:0xffffff,roughness:0.12,metalness:0.05,envMapIntensity:0.48,
  step:6,across:5,margin:1.0,depthBias:1.4,renderOrder:2,pick:true
 });
 fd.mesh.userData.inspectLabel=FL.name;
 W_OUT.flows++;
});
if(WATER.breakupFlows)WATER.breakupFlows();

window._water=Object.assign({surfaces:WATER.surfaces.length},W_OUT);
