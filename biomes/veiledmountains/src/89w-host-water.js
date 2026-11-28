// ================================================================= HOST — U-valley salmon runs, Sol-Cleft cataract, Kanopi 65 m waterfall & tarns (core/water; [draw])
// Implements Veiled Mountains' 5-station hydrology (PLAN.md sections 1 & 5) with 100% clean water-mouths & WATER.audit compliance:
//   - Station 1 (hall):      Clear cobble salmon stream (WATER.flow) + mossy mire spore-spike eddy pool (WATER.still, keep-faded)
//   - Station 2 (gorge):     Upper forebay (+24.6 m) -> Tier 1 fall -> mid-pool (+12.8 m) -> Tier 2 fall -> emerald-jade plunge pool (+0.40 m) -> outflow
//   - Station 3 (kanopi):    Elevated oculus throat weir (+65.45 m) -> roaring 65 m waterfall out of Kanopi's broken lip -> lily-and-moss tarn (+0.40 m) -> brook
//   - Station 4 (veilpass):  Monotone east-to-west braided glacial boulder meltwater torrent (+34.0 -> -2.2 m)
//   - Station 5 (southvale): Quiet dark-emerald cushion-moss bog tarn (+0.45 m)
//   - WATER.mirrorSwitch attached strictly OFF at page load.
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer:renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x2e4a38)});
}

const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,stills:0,flows:0,falls:0};

function makeOvalPoly(cx,cz,rx,rz,nPts,seed){
 const pts=[];
 for(let i=0;i<nPts;i++){
  const a=(i/nPts)*TAU;
  const wob=1.0+0.04*(KRAND.unit(KRAND.hash(seed,i,1))-0.5);
  pts.push([cx+Math.cos(a)*rx*wob,cz+Math.sin(a)*rz*wob]);
 }
 return pts;
}

const MAIN_STILL=(function(){
 if(SKEY==='hall'){
  const mirePoly=makeOvalPoly(-18,-22,12.5,11.5,18,9271);
  const SM=WATER.still({
   name:'Mist-Valley-2 Spore-Spike Backwater Mire Pool',
   level:hallStreamY(-18)+0.06,
   poly:mirePoly,
   gradient:{centre:0x143832,rim:0x3e7658,power:1.15,at:[-18,-22],radius:13}
  });
  const DM=WATER.drawStill(SM,{roughness:0.06,metalness:0.06,envMapIntensity:0.48,opacity:0.92,renderOrder:1,pick:true});
  W_OUT.stills++;
  return DM;
 }

 if(SKEY==='gorge'){
  // 1. Upper canyon forebay (+24.60 m) & mid-ledge pool (+12.80 m)
  const upPoly=[[-118,-7.5],[-40,-7.5],[-40,7.5],[-118,7.5]];
  const SU=WATER.still({
   name:'Sol-Cleft Upper Moss-Slot Forebay',
   level:24.60,
   poly:upPoly,
   gradient:{centre:0x12484a,rim:0x3c9288,power:1.1,at:[-75,0],radius:45}
  });
  WATER.drawStill(SU,{roughness:0.07,metalness:0.06,envMapIntensity:0.48,opacity:0.93,renderOrder:1,pick:true});

  const midPoly=[[-40,-8.0],[-12,-8.0],[-12,8.0],[-40,8.0]];
  const SM=WATER.still({
   name:'Sol-Cleft Mid-Tier Ledge Pool',
   level:12.80,
   poly:midPoly,
   gradient:{centre:0x124c4e,rim:0x429e92,power:1.1,at:[-26,0],radius:18}
  });
  WATER.drawStill(SM,{roughness:0.07,metalness:0.06,envMapIntensity:0.48,opacity:0.93,renderOrder:1,pick:true});

  // 2. Two-tier Sol-Cleft cataract falls (image_4!)
  const f1=WATER.fall({
   name:'Sol-Cleft Upper Cataract Curtain',
   lip:[[-40,-5.5,24.58],[-40,5.5,24.58]],
   dir:[1.0,0.0],
   speed:2.5,
   drop:11.76,
   foot:[-35,0,12.82],
   fit:true
  });
  const f2=WATER.fall({
   name:'Sol-Cleft Main Jade-Pool Waterfall Curtain',
   lip:[[-12,-6.2,12.78],[-12,6.2,12.78]],
   dir:[1.0,0.0],
   speed:2.7,
   drop:12.36,
   foot:[-4,0,0.42],
   fit:true
  });
  WATER.drawFalls([f1,f2],{
   name:'Sol-Cleft Two-Tier Mossy Cataract',
   color:0xdaf4f0,
   opacity:0.93,
   margin:1.0,
   edge:1.4,
   plungeR:10.5,
   plungeFade:0.75,
   plungeY:0.45,
   spray:'drop',
   renderOrder:3,
   pick:true
  });
  W_OUT.falls+=2;

  // 3. Emerald-jade chasm plunge basin at +0.40 m (image_4!)
  const plungePoly=makeOvalPoly(22,0,32,19.5,24,9272);
  const SP=WATER.still({
   name:'Sol-Cleft Emerald-Jade Chasm Plunge Pool',
   level:0.40,
   poly:plungePoly,
   fountain:[-2,0],
   gradient:{centre:0x0c4a4e,rim:0x38a896,power:1.15,at:[14,0],radius:34}
  });
  const DP=WATER.drawStill(SP,{roughness:0.05,metalness:0.08,envMapIntensity:0.54,opacity:0.93,renderOrder:1,pick:true});
  W_OUT.stills+=3;
  return DP;
 }

 if(SKEY==='kanopi'){
  // 1. Roaring 65 m waterfall pouring straight out of Kanopi's broken lower bronze oculus lip ([-32, 0, +65.4 m] -> [-14, 0, +0.44 m], image_8!)
  const fOculus=WATER.fall({
   name:'Kanopi Weeping Oculus 65 m Waterfall',
   lip:[[-32.0,-5.2,65.40],[-32.0,5.2,65.40]],
   dir:[1.0,0.0],
   speed:3.1,
   drop:64.96,
   foot:[-14.0,0.0,0.44],
   fit:false
  });
  WATER.drawFalls([fOculus],{
   name:'The Weeping Oculus 65 m Waterfall',
   color:0xe2f6f4,
   opacity:0.94,
   margin:1.2,
   edge:1.6,
   plungeR:14.0,
   plungeFade:0.78,
   plungeY:0.46,
   spray:'drop',
   renderOrder:3,
   pick:true
  });
  W_OUT.falls+=1;

  // 2. Calm lily-and-moss rainforest tarn at +0.40 m (image_8!)
  const tarnPoly=makeOvalPoly(10,0,47,35,28,9273);
  const ST=WATER.still({
   name:'Kanopi Sacred Lily & Moss Rainforest Tarn',
   level:0.40,
   poly:tarnPoly,
   fountain:[-12,0],
   gradient:{centre:0x143834,rim:0x467c5e,power:1.15,at:[6,0],radius:48}
  });
  const DT=WATER.drawStill(ST,{roughness:0.05,metalness:0.08,envMapIntensity:0.52,opacity:0.93,renderOrder:1,pick:true});
  W_OUT.stills+=1;
  return DT;
 }

 if(SKEY==='southvale'){
  const bogPoly=makeOvalPoly(-24,-44,18.5,13.5,20,9275);
  const SB=WATER.still({
   name:'Hush-Edge Cushion-Moss Moraine Tarn',
   level:0.45,
   poly:bogPoly,
   gradient:{centre:0x102e2c,rim:0x386a52,power:1.15,at:[-24,-44],radius:18}
  });
  const DB=WATER.drawStill(SB,{roughness:0.05,metalness:0.06,envMapIntensity:0.48,opacity:0.92,renderOrder:1,pick:true});
  W_OUT.stills+=1;
  return DB;
 }

 return null;
})();

// Monotone non-rising river & braided torrent flows cleanly keep-faded at every WATER.still edge!
FLOW_LINES.forEach(FL=>{
 const pts=[];
 let yc=FL.levelTop;
 for(let i=0;i<FL.pts.length;i++){
  const px=FL.pts[i][0],pz=FL.pts[i][1];
  const u=i/(FL.pts.length-1);
  const targetY=FL.levelTop-FL.drop*u;
  yc=Math.min(yc,targetY);
  pts.push([px,pz,yc]);
 }
 const isGlacial=SKEY==='veilpass';
 const fw=WATER.flow({
  name:FL.name,
  pts:pts,
  width:FL.w*2,
  speed:FL.speed,
  rapids:isGlacial?[0.022,0.095]:[0.014,0.065]
 });
 const drawOpt={
  shallow:lin(isGlacial?0x7ec6ca:0x429c8e),
  deep:lin(isGlacial?0x1e5668:0x124244),
  color:0xffffff,
  roughness:isGlacial?0.12:0.08,
  metalness:0.06,
  envMapIntensity:0.50,
  step:5,
  across:5,
  margin:1.2,
  endFade:9,
  spray:isGlacial||SKEY==='gorge',
  renderOrder:2,
  pick:true
 };
 if(FL.keep)drawOpt.keep=FL.keep;
 const fd=WATER.drawFlow(fw,drawOpt);
 fd.mesh.userData.inspectLabel=FL.name;
 W_OUT.flows++;
});

if(WATER.breakupFlows)WATER.breakupFlows();

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
