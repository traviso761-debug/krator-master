// ================================================================= HOST — Sill-Damped Pocket-Fjord Tsunami & Refuge Hazard (Station 6: cove)
// Loaded after 89w-host-water.js. Composes WATER.tsunami with live KTIDE sea level: the NNW -11 m ophiolite sill & dogleg throat
// attenuate open-sea tsunami energy by 74-87% (Tsunami Coast Atlas [2]: ~8 m sill bore, +12.5 m outer-throat run-up damped to ~7 m
// inside the inner sanctuary basin), while the +76 m Arcoforte cliff-prow (site:fleetborn-arcoforte) stands >63 m clear in safe_refuge.
const ARCH_TSUNAMI_COVE=(function(){
 if(typeof WATER==='undefined'||typeof WATER.tsunami!=='function')return null;
 const S=SITE,orig=L.XZ(-860,L.centerA(-860));
 const seaFn=()=>typeof COVE_TIDE!=='undefined'&&COVE_TIDE&&COVE_TIDE.T?COVE_TIDE.T.level:0;
 const shelter=(x,z)=>mix(1.0,0.56,smooth(-780,-280,L.S_OF(x,z)));
 const TS=WATER.tsunami({
  key:'arch-cove-sill-tsunami',
  name:'Fleetborn Cove sill-damped tsunami',
  regime:'ghost',
  g:7.36,
  dir:S.axis,
  shoreOrigin:orig,
  seaLevel:seaFn,
  bed:terrainH,
  shelterFn:shelter,
  bounds:[-TERR.R,-TERR.R,TERR.R,TERR.R],
  startS:-560,
  inlandReachM:2150,
  frontWidthM:26,
  drawdownM:4.5,
  boreHeightM:8.2,
  runupMaxM:12.5,
  mode:'calm',
  seed:S.seed^0x545306
 });
 if(typeof KHAZ!=='undefined'&&typeof KHAZ.bindTsunami==='function'){
  KHAZ.bindTsunami(TS.key,TS);
 }
 const rec=TS.hazardRecord({
  id:'arch:cove:tsunami',
  at:[orig[0],0,orig[1]],
  area:{w:TERR.R*1.9,d:TERR.R*1.9,h:34},
  trimlineM:12.5,
  fullDepth:1.4,
  fluxLethal:18.0
 });
 REGISTER(Object.assign({
  cls:'hazard',
  kind:'hazard',
  key:'arch:cove:tsunami',
  name:'Sill-damped tsunami surge zone (< +12.5 m throat trimline; +76 m Arcoforte prow is safe refuge)',
  x:orig[0],
  y:-14,
  z:orig[1],
  r:1450,
  h:34,
  ground:true
 },rec));
 const drawH=typeof WATER.drawTsunami==='function'?WATER.drawTsunami(TS,{
  THREE,
  scene,
  seaMesh:BIG_DRAW?BIG_DRAW.mesh:null,
  cell:22,
  sMin:-420,
  qMin:-520,
  qMax:520,
  mist:true
 }):null;
 return{TS,drawH,rec};
})();
const ARCH_TSUNAMI_REC=ARCH_TSUNAMI_COVE?ARCH_TSUNAMI_COVE.rec:null;
function ARCH_TSUNAMI_MOUNT(){
 if(!ARCH_TSUNAMI_COVE||typeof WATER.mountTsunamiUI!=='function')return null;
 return WATER.mountTsunamiUI(ARCH_TSUNAMI_COVE.TS,ARCH_TSUNAMI_COVE.drawH,{tick});
}
