// ================================================================= HOST — sapphire artesian springs, shut-in chutes & sumps (core/water; [draw])
// Implements Springhollows karst & porphyry hydrology (PLAN.md sections 1.2, 3 & 7.3 #4):
//   - Station 1 (spring):   Cobalt-sapphire -> turquoise artesian resurgence boil pool (WATER.still at +0.14 m with fountain
//                           boil at cave mouth, stepped +0.10 m above downstream +0.04 m WATER.flow cypress spring-run!)
//   - Station 2 (shutin):   Upper calm dolomite reach (WATER.still at +6.25 m) -> foaming 16 m red-porphyry whitewater chute
//                           (WATER.flow +6.14 -> +0.26 m, endFade + keep) -> lower calm plunge pool (WATER.still at +0.20 m)
//   - Station 3 (fenestre): Subterranean cobalt-sapphire crystal sump pool (WATER.still at -25.35 m inside cav_ozarks_porphyry)
//   - Station 4 (glade):    Karst kipuka sump pool under the suspended chert natural bridge (WATER.still at -13.85 m)
//   - WATER.mirrorSwitch attached strictly OFF at page load.
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer:renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x425848)});
}

const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,stills:0,flows:0,poolStepMinM:1.0};

function makeOvalPoly(cx,cz,rx,rz,nPts,seed){
 const pts=[];
 for(let i=0;i<nPts;i++){
  const a=(i/nPts)*TAU;
  const wob=1.0+0.06*(KRAND.unit(KRAND.hash(seed,i,1))-0.5);
  pts.push([cx+Math.cos(a)*rx*wob,cz+Math.sin(a)*rz*wob]);
 }
 return pts;
}

const MAIN_STILL=(function(){
 if(SKEY==='spring'){
  // First-magnitude sapphire artesian resurgence pool stepped +0.10 m above downstream +0.04 m spring-run lip!
  const poly=makeOvalPoly(-36,0,50,25,24,7461);
  const S=WATER.still({
   name:'Cav Ozarks First-Magnitude Sapphire Mammoth-Spring Boil (26 m3/s)',
   level:0.14,
   poly:poly,
   fountain:[-78,0],
   gradient:{centre:0x0b3a8c,rim:0x36b8aa,power:1.15,at:[-68,0],radius:78}
  });
  const D=WATER.drawStill(S,{
   roughness:0.06,metalness:0.08,envMapIntensity:0.52,opacity:0.92,renderOrder:1,pick:true
  });
  W_OUT.stills++;
  W_OUT.poolStepMinM=+(0.14-0.04).toFixed(3);
  return D;
 }
 if(SKEY==='shutin'){
  // Bank-hugging upper calm dolomite reach (x = -410..-52, level +6.25 m, overlapping chute start x = -88 by 36 m!)
  const upperPoly=[],upperS=[];
  for(let i=0;i<=16;i++){
   const x=-410+(358*i)/16,zr=x<-66?6*Math.sin((x+66)*0.012):7.2*Math.sin(clamp((x+66)/142,0,1)*TAU);
   const dk=HOLLOW_PHYS.porphyryDikeAt(x,zr,SITE),hw=lerp(37.0,9.8,smooth(26,-18,dk.signedDistM));
   upperPoly.push([x,zr-hw]);upperS.unshift([x,zr+hw]);
  }
  upperPoly.push([-50,7.2*Math.sin(clamp(16/142,0,1)*TAU)],...upperS);
  const SU=WATER.still({
   name:'Tlila-Wada Upper Calm Dolomite Reach',
   level:6.25,
   poly:upperPoly,
   gradient:{centre:0x1b5a68,rim:0x4ea89c,power:1.2,at:[-220,0],radius:190}
  });
  WATER.drawStill(SU,{roughness:0.08,metalness:0.06,envMapIntensity:0.46,opacity:0.93,renderOrder:1,pick:true});

  // Bank-hugging lower calm plunge pool (x = +58..+410, level +0.20 m, overlapping chute tail x = +96 by 38 m!)
  const lowerPoly=[[56,7.2*Math.sin(clamp(122/142,0,1)*TAU)]],lowerS=[];
  for(let i=0;i<=16;i++){
   const x=58+(352*i)/16,zr=x<=76?7.2*Math.sin(clamp((x+66)/142,0,1)*TAU):5*Math.sin((x-76)*0.012);
   const dk=HOLLOW_PHYS.porphyryDikeAt(x,zr,SITE),hw=lerp(37.0,10.2,smooth(26,-18,dk.signedDistM));
   lowerPoly.push([x,zr-hw]);lowerS.unshift([x,zr+hw]);
  }
  lowerPoly.push(...lowerS);
  const SL=WATER.still({
   name:'Tlila-Wada Lower Shut-In Plunge Pool',
   level:0.20,
   poly:lowerPoly,
   fountain:[68,0],
   gradient:{centre:0x164e62,rim:0x48a498,power:1.15,at:[120,0],radius:180}
  });
  const DL=WATER.drawStill(SL,{roughness:0.07,metalness:0.06,envMapIntensity:0.48,opacity:0.93,renderOrder:1,pick:true});
  W_OUT.stills+=2;
  W_OUT.poolStepMinM=0.06;
  return DL;
 }
 if(SKEY==='fenestre'){
  // Flooded cobalt-sapphire subterranean crystal sump inside cav_ozarks_porphyry
  const poly=makeOvalPoly(30,22,21,16,22,7463);
  const S=WATER.still({
   name:'Spider Lake Sub-Escarpment Sapphire Crystal Sump (tube_ozarks_15)',
   level:-24.85,
   poly:poly,
   fountain:[34,24],
   gradient:{centre:0x0b48a8,rim:0x3cd4cc,power:1.05,at:[30,22],radius:22}
  });
  const D=WATER.drawStill(S,{roughness:0.04,metalness:0.12,envMapIntensity:0.65,opacity:0.92,renderOrder:1,pick:true});
  W_OUT.stills++;
  return D;
 }
 // Station 4 (glade): Onyx kipuka sapphire karst sump pool
 const poly=makeOvalPoly(-38,-6,14,12,18,7464);
 const S=WATER.still({
  name:'Cav Ozarks Onyx Kipuka Sapphire Sump',
  level:-13.85,
  poly:poly,
  fountain:[-38,-6],
  gradient:{centre:0x0f4488,rim:0x3cb2a6,power:1.15,at:[-38,-6],radius:14}
 });
 const D=WATER.drawStill(S,{roughness:0.06,metalness:0.08,envMapIntensity:0.46,opacity:0.90,renderOrder:1,pick:true});
 W_OUT.stills++;
 return D;
})();

// Monotone non-climbing spring-run & shut-in whitewater chute flows, tucked seamlessly inside pool surfaces at both ends!
FLOW_LINES.forEach(FL=>{
 const pts=[];
 let yc=FL.levelTop;
 for(let i=0;i<FL.pts.length;i++){
  const px=FL.pts[i][0],pz=FL.pts[i][1];
  let targetY;
  if(SKEY==='shutin'){
   if(px<=-56)targetY=6.24;
   else if(px<=62){const u=(px+56)/118;targetY=6.24-6.03*(u*u*(3-2*u));}
   else{const u=clamp((px-62)/34,0,1);targetY=0.21-0.04*u;}
  }else if(SKEY==='spring'){
   const u=clamp((px-10)/436,0,1);
   targetY=0.135-FL.drop*u;
  }else{
   const u=i/(FL.pts.length-1);
   targetY=FL.levelTop-FL.drop*u;
  }
  yc=Math.min(yc,targetY);
  pts.push([px,pz,yc]);
 }
 const fw=WATER.flow({
  name:FL.name,
  pts:pts,
  width:FL.w*2,
  speed:FL.speed,
  rapids:SKEY==='shutin'?[0.028,0.10]:[0.015,0.06]
 });
 const fd=WATER.drawFlow(fw,{
  shallow:lin(SKEY==='shutin'?0x7ed6d6:0x4ac2b4),
  deep:lin(SKEY==='shutin'?0x1b5868:0x124e72),
  color:0xffffff,
  roughness:SKEY==='shutin'?0.13:0.08,
  metalness:0.06,
  envMapIntensity:0.50,
  step:5,
  across:5,
  margin:1.2,
  endFade:9,
  spray:SKEY==='shutin',
  renderOrder:2,
  pick:true
 });
 fd.mesh.userData.inspectLabel=FL.name;
 W_OUT.flows++;
});

if(WATER.breakupFlows)WATER.breakupFlows();

// Planar mirror switch strictly OFF at default load (zero extra render pass unless toggled)
if(typeof WATER.mirrorSwitch==='function'&&MAIN_STILL&&MAIN_STILL.S){
 WATER.mirrorSwitch({
  THREE:THREE,
  renderer:renderer,
  scene:scene,
  camera:camera,
  sky:SKY,
  materials:[MAIN_STILL.material],
  level:MAIN_STILL.S.level,
  center:[0,0],
  radius:TERR.R,
  far:4500
 });
}

window._water=Object.assign({surfaces:WATER.surfaces.length},W_OUT);
