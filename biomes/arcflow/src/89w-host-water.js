// ================================================================= HOST — Klint 55 m falls, koski rapids, cerulean terraces & humic fen (core/water; [draw])
// Implements Arcflow's 5-station hydrology (PLAN.md sections 1 & 4):
//   - Station 1 (klint):  Upper Suur-Neva forebay (+55.40 m) -> 3-segment curved 55 m horseshoe waterfall (WATER.drawFalls)
//                         -> plunge pool (+0.40 m) -> overlapped lower gorge river (WATER.flow +0.36 -> -1.84 m, endFade: 9)
//   - Station 2 (koski):  Upper calm reach (+12.25 m) -> 3-step zebra-cumulate cataract (WATER.flow, endFade: 9) -> lower reach
//                         (+0.20 m) + 4 cylindrical Hiidenkirnu swirl-kettle pools (WATER.drawPools)
//   - Station 3 (seep):   6-tread pH 11.5 milky-cerulean Ca-OH travertine cascade (WATER.terraces + WATER.drawTerraces)
//   - Station 4 (neva):   Tea-black humic Musta-Jogi river (WATER.flow) + 3 raha-maak penny-ore bog pools (WATER.drawPools)
//   - Station 5 (auger):  Clear seepage tarn (+5.45 m) inside the 45 m lime-phosphate birch oasis
//   - WATER.mirrorSwitch attached strictly OFF at page load.
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer:renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x3e5648)});
}

const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const W_OUT={station:SKEY,stills:0,flows:0,falls:0,poolStepMinM:0.10};

function makeOvalPoly(cx,cz,rx,rz,nPts,seed){
 const pts=[];
 for(let i=0;i<nPts;i++){
  const a=(i/nPts)*TAU;
  const wob=1.0+0.05*(KRAND.unit(KRAND.hash(seed,i,1))-0.5);
  pts.push([cx+Math.cos(a)*rx*wob,cz+Math.sin(a)*rz*wob]);
 }
 return pts;
}

const MAIN_STILL=(function(){
 if(SKEY==='klint'){
  // 1. Upper Suur-Neva calm forebay above the 55 m Klint lip (x = -410..-18, |z| <= 21.5, level +55.40 m)
  const forebay=[[-410,-21.5],[-22,-21.5],[-18,-14],[-18,14],[-22,21.5],[-410,21.5]];
  const SU=WATER.still({
   name:'Suur-Neva Upper Basalt Caprock Forebay (1066 m3/s)',
   level:55.40,
   poly:forebay,
   gradient:{centre:0x1b4c5e,rim:0x4a8e94,power:1.2,at:[-160,0],radius:220}
  });
  WATER.drawStill(SU,{roughness:0.07,metalness:0.06,envMapIntensity:0.48,opacity:0.93,renderOrder:1,pick:true});

  // 2. Three curved horseshoe waterfall curtains plunging 55.0 m into the kukersite amphitheatre
  const fallSpecs=[
   {lip:[[-18,-20,55.38],[-23,-7,55.38]],dir:[0.92,0.39],foot:[2,-12,0.42]},
   {lip:[[-23,-7,55.38],[-23,7,55.38]],dir:[1.0,0.0],foot:[-4,0,0.42]},
   {lip:[[-23,7,55.38],[-18,20,55.38]],dir:[0.92,-0.39],foot:[2,12,0.42]}
  ];
  const fallList=fallSpecs.map((fs,idx)=>WATER.fall({
   name:'Kulaneva-Klint 55 m Horseshoe Curtain '+idx,
   lip:fs.lip,
   dir:fs.dir,
   speed:2.8,
   drop:54.96,
   foot:fs.foot,
   fit:true
  }));
  WATER.drawFalls(fallList,{
   name:'Kulaneva-Klint 55 m Horseshoe Waterfall',
   color:0xd8eef4,
   opacity:0.93,
   margin:1.2,
   edge:1.6,
   plungeR:15.0,
   plungeFade:0.75,
   plungeY:0.46,
   spray:'drop',
   renderOrder:3,
   pick:true
  });
  W_OUT.falls+=fallList.length;

  // 3. Deep amphitheatre plunge basin at +0.40 m (overlapping downstream +0.36 m river start at x = +42!)
  const plungePoly=makeOvalPoly(26,0,48,27,24,8161);
  const SP=WATER.still({
   name:'Kulaneva-Klint Horseshoe Plunge Basin',
   level:0.40,
   poly:plungePoly,
   fountain:[0,0],
   gradient:{centre:0x103c58,rim:0x429ca2,power:1.15,at:[8,0],radius:52}
  });
  const DP=WATER.drawStill(SP,{roughness:0.06,metalness:0.08,envMapIntensity:0.52,opacity:0.93,renderOrder:1,pick:true});
  W_OUT.stills+=2;
  W_OUT.poolStepMinM=0.04;
  return DP;
 }

 if(SKEY==='koski'){
  // Upper calm reach (-410..-76 at +12.25 m, overlapping chute start x = -112 by 36 m!)
  const upN=[],upS=[];
  for(let i=0;i<=14;i++){
   const x=-410+(334*i)/14,zr=koskiMeanderZ(x),hw=x<-92?30.0:17.5;
   upN.push([x,zr-hw]);upS.unshift([x,zr+hw]);
  }
  const SU=WATER.still({
   name:'Helme-Koski Upper Calm Reach',
   level:12.25,
   poly:upN.concat(upS),
   gradient:{centre:0x1a4e5e,rim:0x4c9aa0,power:1.15,at:[-220,0],radius:190}
  });
  WATER.drawStill(SU,{roughness:0.08,metalness:0.06,envMapIntensity:0.46,opacity:0.93,renderOrder:1,pick:true});

  // Lower calm plunge reach (+76..+410 at +0.20 m, overlapping chute tail x = +114 by 38 m!)
  const loN=[],loS=[];
  for(let i=0;i<=14;i++){
   const x=76+(334*i)/14,zr=koskiMeanderZ(x),hw=x<92?18.0:30.0;
   loN.push([x,zr-hw]);loS.unshift([x,zr+hw]);
  }
  const SL=WATER.still({
   name:'Helme-Koski Lower Calm Pool',
   level:0.20,
   poly:loN.concat(loS),
   fountain:[86,koskiMeanderZ(86)],
   gradient:{centre:0x164658,rim:0x48969c,power:1.15,at:[190,0],radius:190}
  });
  const DL=WATER.drawStill(SL,{roughness:0.07,metalness:0.06,envMapIntensity:0.48,opacity:0.93,renderOrder:1,pick:true});
  W_OUT.stills+=2;

  // 4 cylindrical Hiidenkirnu swirl-kettle pools
  if(SITE.kettles&&SITE.kettles.length){
   const kPools=SITE.kettles.map((kt,idx)=>WATER.still({
    name:'Hiidenkirnu Swirl-Kettle Pool '+idx,
    level:koskiWaterProfileY(kt.x)+0.65,
    poly:makeOvalPoly(kt.x,kt.z,kt.r*0.92,kt.r*0.92,16,8170+idx),
    gradient:{centre:0x0f3e4e,rim:0x6ab4a8,power:1.1,at:[kt.x,kt.z],radius:kt.r}
   }));
   WATER.drawPools(kPools,{name:'Hiidenkirnu Swirl-Kettle Pools',roughness:0.05,metalness:0.10,envMapIntensity:0.55,opacity:0.92,renderOrder:1,pick:true});
   W_OUT.stills+=kPools.length;
  }
  return DL;
 }

 if(SKEY==='seep'){
  // 6-tread pH 11.5 milky-cerulean Ca-OH travertine cascade via WATER.terraces + WATER.drawTerraces
  const tLine=[];
  for(let i=0;i<=20;i++){
   const x=-32+(100*i)/20;
   tLine.push([x,6.0*Math.sin((x+30)*0.022)]);
  }
  const TR=WATER.terraces({
   name:'pH 11.5 Cerulean Ca-OH Travertine Cascade',
   line:tLine,
   levels:[24.6,19.8,15.2,10.8,6.6,2.8],
   width:[14,17,20,23,25,27],
   riser:2.2,
   speed:0.75,
   treadSpeed:0.35
  });
  const DT=WATER.drawTerraces(TR,{
   pick:true,
   pool:{
    color:0x78dcf6,
    roughness:0.05,
    metalness:0.08,
    envMapIntensity:0.56,
    opacity:0.92,
    gradient:{centre:0x2ebce8,rim:0xe2f8ff,power:1.05},
    renderOrder:1
   },
   fall:{
    color:0xe4f7ff,
    opacity:0.92,
    plungeR:5.2,
    plungeFade:0.75,
    spray:false,
    renderOrder:3
   }
  });
  W_OUT.stills+=TR.pools.length;
  W_OUT.falls+=TR.falls.length;
  return{S:TR.pools[TR.pools.length-1],material:DT.pools.material,mesh:DT.pools.mesh};
 }

 if(SKEY==='neva'){
  // 3 tea-black humic bog-pool shoals holding regenerating raha-maak penny-ore nodules
  if(SITE.shoals&&SITE.shoals.length){
   const sPools=SITE.shoals.map((sh,idx)=>WATER.still({
    name:'Musta-Jogi Humic Raha-Maak Shoal Pool '+idx,
    level:1.18-1.80*clamp((sh.x+420)/840,0,1)+0.12,
    poly:makeOvalPoly(sh.x,sh.z,sh.r*0.92,sh.r*0.78,18,8180+idx),
    gradient:{centre:0x1b120b,rim:0x664620,power:1.15,at:[sh.x,sh.z],radius:sh.r}
   }));
   const DP=WATER.drawPools(sPools,{name:'Musta-Jogi Tea-Black Penny-Ore Shoal Pools',roughness:0.06,metalness:0.08,envMapIntensity:0.46,opacity:0.92,renderOrder:1,pick:true});
   W_OUT.stills+=sPools.length;
   return{S:sPools[0],material:DP.material,mesh:DP.mesh};
  }
  return null;
 }

 // Station 5 (auger): clear seepage tarn inside the 45 m lime-phosphate birch oasis
 const tarnPoly=makeOvalPoly(46,-36,11.5,10.2,18,8190);
 const ST=WATER.still({
  name:'Auger Lime-Oasis Clear Seepage Tarn',
  level:5.45,
  poly:tarnPoly,
  gradient:{centre:0x165268,rim:0x58b4aa,power:1.15,at:[46,-36],radius:12}
 });
 const DT=WATER.drawStill(ST,{roughness:0.06,metalness:0.08,envMapIntensity:0.50,opacity:0.91,renderOrder:1,pick:true});
 W_OUT.stills++;
 return DT;
})();

// Monotone non-rising river & cataract flows (klint, koski, neva) tucked seamlessly into still pools!
FLOW_LINES.forEach(FL=>{
 const pts=[];
 let yc=FL.levelTop;
 for(let i=0;i<FL.pts.length;i++){
  const px=FL.pts[i][0],pz=FL.pts[i][1];
  let targetY;
  if(SKEY==='koski'){
   targetY=koskiWaterProfileY(px)-0.02;
  }else{
   const u=i/(FL.pts.length-1);
   targetY=FL.levelTop-FL.drop*u;
  }
  yc=Math.min(yc,targetY);
  pts.push([px,pz,yc]);
 }
 const isHumic=SKEY==='neva';
 const isKoski=SKEY==='koski';
 const fw=WATER.flow({
  name:FL.name,
  pts:pts,
  width:FL.w*2,
  speed:FL.speed,
  rapids:isKoski?[0.024,0.095]:[0.015,0.06]
 });
 const fd=WATER.drawFlow(fw,{
  shallow:lin(isHumic?0x6c4c24:(isKoski?0x80d6d8:0x4aa4a6)),
  deep:lin(isHumic?0x1f140c:(isKoski?0x1a4e5e:0x14445a)),
  color:0xffffff,
  roughness:isKoski?0.13:0.08,
  metalness:0.06,
  envMapIntensity:0.50,
  step:5,
  across:5,
  margin:1.2,
  endFade:9,
  spray:isKoski,
  renderOrder:2,
  pick:true
 });
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
