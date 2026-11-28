// ================================================================= HOST — Steaming Seamounts Surtseyan Tsunami & Trimline Hazard (Station 5: coast)
// Loaded after 89w-host-water.js (so BIGW and BIG_DRAW exist) and before 89z-host-build.js / 99-host-take.js.
// Models the near-field Surtseyan caldera tsunami (px 166,338, 3 km SW; PLAN.md section 9, KNOWN_ISSUES.md) using the reusable core
// modules core/water/ext/64-core-water-tsunami.js, 64b-core-water-tsunami-draw.js, and core/hazard/24-core-hazard-tsunami.js:
//   - 'calm' at initial page load (zero visual or water-audit disturbance until triggered or ?tsunami=...);
//   - 'tremor' -> 'drawdown' (-5.8 m withdrawal exposing the pillow-lava tide-pool platform and foreshore) ->
//   - 'bore' (14.5 m curling white-water & tephra-streaked breaking bore surging NE across the black-sand beach) ->
//   - 'runup' (+26 m overland run-up climbing the dunes and outer tuff-cone apron while the +70 m tuff-cone rim stays safe_refuge) ->
//   - 'backwash' (seaward scouring sheet flow) -> 'seiche'.
const ARCH_TSUNAMI_COAST=(function(){
 if(typeof WATER==='undefined'||typeof WATER.tsunami!=='function')return null;
 const S=SITE,inlandDir=[-S.shore[0],-S.shore[1]],orig=L.XZ(0,-15);
 const TS=WATER.tsunami({
  key:'arch-coast-seamount',
  name:'Steaming Seamounts Surtseyan tsunami',
  regime:'seamount',
  g:7.36,
  dir:inlandDir,
  shoreOrigin:orig,
  seaLevel:0,
  bed:terrainH,
  bounds:[-TERR.R,-TERR.R,TERR.R,TERR.R],
  startS:-680,
  inlandReachM:1380,
  frontWidthM:32,
  drawdownM:5.8,
  boreHeightM:14.5,
  runupMaxM:26.0,
  mode:'calm',
  seed:S.seed^0x545305
 });
 if(typeof KHAZ!=='undefined'&&typeof KHAZ.bindTsunami==='function'){
  KHAZ.bindTsunami(TS.key,TS);
 }
 const rec=TS.hazardRecord({
  id:'arch:coast:tsunami',
  at:[orig[0],0,orig[1]],
  area:{w:TERR.R*1.9,d:TERR.R*1.9,h:44},
  trimlineM:26.0,
  fullDepth:1.4,
  fluxLethal:18.0
 });
 REGISTER(Object.assign({
  cls:'hazard',
  kind:'hazard',
  key:'arch:coast:tsunami',
  name:'Surtseyan caldera tsunami run-up zone (< +26 m trimline; +70 m tuff-cone rim is safe refuge)',
  x:orig[0],
  y:-8,
  z:orig[1],
  r:1350,
  h:38,
  ground:true
 },rec));
 const drawH=typeof WATER.drawTsunami==='function'?WATER.drawTsunami(TS,{
  THREE,
  scene,
  seaMesh:BIG_DRAW?BIG_DRAW.mesh:null,
  cell:20,
  sMin:-420,
  qMin:-1650,
  qMax:1650,
  mist:true
 }):null;
 return{TS,drawH,rec};
})();
const ARCH_TSUNAMI_REC=ARCH_TSUNAMI_COAST?ARCH_TSUNAMI_COAST.rec:null;
function ARCH_TSUNAMI_MOUNT(){
 if(!ARCH_TSUNAMI_COAST||typeof WATER.mountTsunamiUI!=='function')return null;
 return WATER.mountTsunamiUI(ARCH_TSUNAMI_COAST.TS,ARCH_TSUNAMI_COAST.drawH,{tick});
}
