// ================================================================= HOST — Ham-Tsek magnetite river narrows, cuesta brooks & cisterns (core/water; [draw])
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer:renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6c6248)});
}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,pools:0,flows:0};

// 1. Iron-iridescent quarry cisterns, rain basins & placer backwater pools (WATER.still + drawPools; mirror off at load)
if(POOL_LEVELS.length&&WATER.still&&WATER.drawPools){
 const pools=POOL_LEVELS.map((P,idx)=>{
  const poly=[];
  for(let k=0;k<24;k++){
   const a=(k/24)*TAU,rad=P.r*(0.94+0.05*Math.sin(a*3+idx));
   poly.push([P.x+Math.cos(a)*rad,P.z+Math.sin(a)*rad]);
  }
  const cHex=SKEY==='foundry'?0x2c4248:SKEY==='gorge'?0x2a4e46:0x325254;
  const rHex=SKEY==='foundry'?0x8c5a38:SKEY==='gorge'?0x6c9278:0x7c8a6e;
  return WATER.still({
   name:P.name,
   level:P.level,
   poly:poly,
   gradient:{centre:lin(cHex).getHex(),rim:lin(rHex).getHex(),power:1.35}
  });
 });
 const PD=WATER.drawPools(pools,{name:'Compass Hills Cisterns & Quarry Basins',color:0xffffff,roughness:0.08,metalness:0.05,envMapIntensity:0.48,renderOrder:1,pick:true});
 PD.mesh.userData.inspectLabel=POOL_LEVELS[0].name;
 W_OUT.pools=pools.length;
}

// 2. Monotone non-climbing 9102 Ham-Tsek river (Station 4) & ferruginous cuesta brooks (Stations 1-3)
FLOW_LINES.forEach(FL=>{
 const pts=[];
 let yc=1e9;
 for(let i=0;i<FL.pts.length;i++){
  const px=FL.pts[i][0],pz=FL.pts[i][1];
  const rawY=SKEY==='gorge'?(mix(6.5,-5.5,i/(FL.pts.length-1))-0.75):(terrainH(px,pz)+FL.depth);
  yc=Math.min(yc,rawY);
  pts.push([px,pz,yc]);
 }
 const fw=WATER.flow({name:FL.name,pts:pts,width:FL.w*2,speed:FL.speed,rapids:SKEY==='gorge'?[0.06,0.18]:[0.04,0.12]});
 const shCol=SKEY==='gorge'?lin(0x6e9878):lin(0x8e724e);
 const dpCol=SKEY==='gorge'?lin(0x1f4842):lin(0x3a382e);
 const fd=WATER.drawFlow(fw,{
  shallow:shCol,deep:dpCol,color:0xffffff,roughness:0.12,metalness:0.05,envMapIntensity:0.46,
  step:SKEY==='gorge'?8:6,across:SKEY==='gorge'?7:5,margin:1.0,depthBias:1.4,renderOrder:2,pick:true
 });
 fd.mesh.userData.inspectLabel=FL.name;
 W_OUT.flows++;
});
if(WATER.breakupFlows)WATER.breakupFlows();

window._water=Object.assign({surfaces:WATER.surfaces.length},W_OUT);
