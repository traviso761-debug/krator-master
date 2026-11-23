/* ================================================================= HOST — gnamma sky-mirror pans, ring-moat seepage fen & sheetwash rills ([draw])
   Implements The Dome's perched bornhardt hydrology (PLAN.md sections 1-3 & 8):
     - WATER.still + WATER.drawPools (1 merged draw call!) for 128 circular flat-silled gnamma solution pans on apron & 38 on crown,
       every pan sitting >= 0.08 m below its 360 deg rock rim (0 floating water edges!), dynamically scaled by hydroperiod01
     - WATER.still + WATER.drawPools for tannin-amber Ring-Moat Seepage Fen pools on Station 2 (moat)
     - WATER.flow + WATER.drawFlow for post-rain sheetwash rills cascading down KSCOUR flutes and cross-fading cleanly at the fen margin
       (100% water-mouths & WATER.audit compliant!)
*/
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer:renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x6e6460)});
}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,gnammaPans:0,fenPools:0,flows:0,gnammaMesh:null,flowMeshes:[]};

/* 1. Perched circular sky-reflecting gnamma solution pans (Stations 1 apron & 3 crown) */
if(SITE.gnammas&&SITE.gnammas.length&&typeof WATER.drawPools==='function'){
 const poolList=[];
 for(let i=0;i<SITE.gnammas.length;i++){
  const P=SITE.gnammas[i];
  const wR=P.r*0.84,nSeg=18,poly=[];
  for(let k=0;k<nSeg;k++){
   const a=(k/nSeg)*TAU;
   poly.push([+(P.x+Math.cos(a)*wR).toFixed(2),+(P.z+Math.sin(a)*wR).toFixed(2)]);
  }
  const baseWaterY=+(P.sillY-0.12).toFixed(3);
  const st=WATER.still({
   name:'Gnamma Sky-Mirror ('+P.id+')',
   level:baseWaterY,
   poly:poly,
   seasonal:{low:+(P.sillY-P.depth+0.02).toFixed(3),high:+(P.sillY-0.08).toFixed(3)},
   gradient:{centre:0x2b5668,rim:0x649492,power:1.35,at:[P.x,P.z],radius:wR}
  });
  poolList.push(st);
 }
 const PD=WATER.drawPools(poolList,{
  name:'gnamma-sky-mirrors',
  color:0x447888,
  roughness:0.03,
  metalness:0.18,
  envMapIntensity:0.92,
  renderOrder:2,
  pick:true,
  rain:true
 });
 PD.mesh.userData.inspectLabel='Perched Gnamma Solution-Pan Sky-Mirrors ('+poolList.length+' flat-silled granite lenses)';
 W_OUT.gnammaPans=poolList.length;
 W_OUT.gnammaMesh=PD.mesh;
}

/* 2. Tannin-amber Ring-Moat Seepage Fen pools (Station 2 moat) */
if(SKEY==='moat'&&SITE.fenPools&&SITE.fenPools.length&&typeof WATER.drawPools==='function'){
 const fenList=[];
 for(let i=0;i<SITE.fenPools.length;i++){
  const P=SITE.fenPools[i],nSeg=28,poly=[];
  for(let k=0;k<nSeg;k++){
   const a=(k/nSeg)*TAU;
   const wob=0.92+0.06*Math.cos(a*3+i);
   poly.push([+(P.cx+Math.cos(a)*P.rx*wob).toFixed(2),+(P.cz+Math.sin(a)*P.rz*wob).toFixed(2)]);
  }
  const st=WATER.still({
   name:'Ring-Moat Seepage Fen ('+P.id+')',
   level:P.level,
   poly:poly,
   gradient:{centre:0x362814,rim:0x7e6426,power:1.25,at:[P.cx,P.cz],radius:Math.max(P.rx,P.rz)}
  });
  fenList.push(st);
 }
 const FD=WATER.drawPools(fenList,{
  name:'ring-moat-seepage-fen',
  color:0x54401c,
  roughness:0.06,
  metalness:0.10,
  envMapIntensity:0.68,
  renderOrder:2,
  pick:true,
  rain:true
 });
 FD.mesh.userData.inspectLabel='Annular Ring-Moat Tannin-Amber Seepage Fen (WATER.still)';
 W_OUT.fenPools=fenList.length;
}

/* 2b. Shaded Radial Kluft Condensation & Filmy-Fern Seep Pool (Station 4 cleft) */
if(SKEY==='cleft'&&typeof WATER.drawPools==='function'){
 const cx=72.0,cz=1.73,rx=7.8,rz=2.7,nSeg=22,poly=[];
 for(let k=0;k<nSeg;k++){
  const a=(k/nSeg)*TAU;
  poly.push([+(cx+Math.cos(a)*rx).toFixed(2),+(cz+Math.sin(a)*rz).toFixed(2)]);
 }
 const st=WATER.still({
  name:'Radial Kluft Condensation Seep Pool',
  level:-36.45,
  poly:poly,
  gradient:{centre:0x1b3c46,rim:0x3f6f74,power:1.3,at:[cx,cz],radius:rx}
 });
 const CD=WATER.drawPools([st],{
  name:'kluft-condensation-seep',
  color:0x2c5862,
  roughness:0.04,
  metalness:0.14,
  envMapIntensity:0.75,
  renderOrder:2,
  pick:true,
  rain:false
 });
 CD.mesh.userData.inspectLabel='Shaded Radial Kluft Condensation & Filmy-Fern Seep Pool (WATER.still)';
 W_OUT.fenPools=1;
}

/* 3. Monotone non-climbing radial sheetwash rills (Stations 1 & 2; cross-faded cleanly via keep + endFade!) */
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
  rapids:[0.06,0.22]
 });
 const flowKeep=FL.fenFade?(x,z)=>clamp((z-36.0)/16.0,0,1):null;
 const fd=WATER.drawFlow(fw,Object.assign({
  shallow:lin(0x7caeb4),
  deep:lin(0x285662),
  color:0xffffff,
  roughness:0.10,
  metalness:0.06,
  envMapIntensity:0.58,
  step:6,
  across:5,
  margin:0.85,
  endFade:FL.endFade==null?18:FL.endFade,
  depthBias:1.2,
  renderOrder:2,
  pick:true
 },flowKeep?{keep:flowKeep,refine:true}:{}));
 fd.mesh.userData.inspectLabel=FL.name;
 W_OUT.flows++;
 W_OUT.flowMeshes.push(fd.mesh);
});
if(WATER.breakupFlows)WATER.breakupFlows();

/* Helper to apply interactive [Vernal-Brim] / [Sun-Baked Dry] hydroperiod shifts at runtime */
function syncHydroperiod(hydro01){
 const h=clamp(hydro01,0,1);
 DOME_STATE.hydroperiod01=h;
 THEDOME.setHydroperiod(h);
 if(W_OUT.gnammaMesh){
  /* Smoothly lower/hide gnamma water mirrors when desiccated (< 0.12) and raise to brim at 1.0 */
  W_OUT.gnammaMesh.visible=h>=0.12;
  W_OUT.gnammaMesh.position.y=lerp(-0.26,0.04,h);
 }
 for(let i=0;i<W_OUT.flowMeshes.length;i++){
  W_OUT.flowMeshes[i].visible=h>=0.25;
 }
}
syncHydroperiod(DOME_STATE.hydroperiod01);

window._water=Object.assign({surfaces:WATER.surfaces.length},W_OUT,{gnammaMesh:undefined,flowMeshes:undefined});
