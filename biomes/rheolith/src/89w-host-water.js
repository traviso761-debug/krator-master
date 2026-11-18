// ================================================================= HOST — hot vitriol springs & throttled geyser column (core/water + geyser)
// 1. Two hot sulfuric pools (pH 1.4 and pH 1.8) drawn via WATER.spring / WATER.drawSpring.
// 2. Central Breached Throat geyser-steam plume drawn via WATER.geyser / WATER.drawGeyser and coupled live to THROAT.state
//    (silent when gagged, towering eruption on [Salt seam] or phreatic blowout, steady throttled jet otherwise).
// 3. Low fumarole steam wisps on the four satellite vents.
{
 const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));
 {const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x46403c)});
}

const SPRING_MATS=new Map(),W_OUT={springs:0,geysers:0};
const THERM_U=WATER.thermalUniforms({THREE,wind:SITE.wind});

SPRINGS.forEach((sp,i)=>{
 const lvl=SPRING_LEVELS[i];
 const S=WATER.spring({
  key:sp.key,name:sp.name,x:sp.x,z:sp.z,r:sp.r,level:lvl,
  temp:sp.temp,mineral:sp.mineral,milky:.18,boil:.65,steam:0
 });
 const d=WATER.drawSpring(S,{THREE,scene,fog:scene.fog,mats:SPRING_MATS,uniforms:THERM_U,renderOrder:1});
 d.mesh.userData.probeSkip=true;
 d.mesh.userData.inspectLabel=sp.name+' (hot sulfuric pool; hydrolyses cold siloxane below 140 degC, preserves dormant cores only when concentrated at 260 degC)';
 W_OUT.springs++;
});

// Central Breached Throat column coupled to THROAT.state
const BASE_H=22,BASE_PER=38,BASE_PRE=5,BASE_DUR=10,BASE_STM=15;
let geyserOff=0;
const MAIN_GEYSER=WATER.geyser({
 key:'breached-throat-jet',
 name:'The Breached Throat Acid-Steam Column',
 vents:[[PIT.x,PIT.z]],
 top:-7.5,
 H:BASE_H,
 style:'fountain',
 period:BASE_PER,
 pre:BASE_PRE,
 dur:BASE_DUR,
 steam:BASE_STM,
 off:()=>geyserOff,
 world:5107,
 drop:11,
 ventR:3.4
});
const MAIN_GEYSER_DRAW=WATER.drawGeyser(MAIN_GEYSER,{THREE,scene,fog:scene.fog,uniforms:THERM_U,wind:SITE.wind});
MAIN_GEYSER_DRAW.points.userData.inspectLabel='The Breached Throat Acid-Steam Column (throttled by subsurface Choke-Coral)';
W_OUT.geysers++;

// Satellite fumarole steam plumes
VENTS.slice(1).forEach((v,i)=>{
 const y0=terrainH(v.x,v.z);
 const fg=WATER.geyser({
  key:'fumarole-'+v.id,
  name:v.name+' Steam Plume',
  vents:[[v.x,v.z]],
  top:y0-.4,
  H:v.aperture<.22?2.4:5.2,
  style:'spouter',
  period:24,pre:3,dur:10,steam:11,
  world:5110+i,
  drop:2.5,
  ventR:1.1
 });
 WATER.drawGeyser(fg,{THREE,scene,fog:scene.fog,uniforms:THERM_U,wind:SITE.wind});
 W_OUT.geysers++;
});

let lastBlastSeen=-1e9;
tick(()=>{
 const st=THROAT.state,uT=THERM_U.uT.value,U=MAIN_GEYSER_DRAW.material.uniforms;
 if(st.state==='gagged'){
  U.uH.value=0.15;
  // Hold cycle clock in quiet rest phase while choked shut
  geyserOff=uT-(BASE_PRE+BASE_DUR+BASE_STM+4);
 }else{
  const per=clamp(BASE_PER*st.periodScale,18,120);
  U.uCyc.value.set(per,BASE_PRE,BASE_DUR,BASE_STM);
  U.uH.value=BASE_H*st.heightScale;
  if(THROAT.blastAt>lastBlastSeen){
   lastBlastSeen=THROAT.blastAt;
   // Jump cycle directly into column eruption peak
   geyserOff=uT-(BASE_PRE+0.6);
  }
 }
});

window._water=W_OUT;
