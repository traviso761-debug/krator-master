// ================================================================= FLEETBORN COVE — spatial master plan (FCOVE_LAYOUT)  [G data]
// Pure [G data] coordinates and grading functions for Fleetborn Cove (px [236, 242]): seats Arcoforte (kits/arcoforte, 576 m span) on the
// eastern ophiolite cliff-prow facing WSW across the fjord, lays out the three macrotidal graving cradles, salvaged Ancient port segments
// (slPen, ddShed, ddYard at d = 3), raised +9.2 m Shore-kin Harbour Client Work-Bench (sk_client_hall, sk_paktong_foundry, sk_boat_grid_shed),
// paktong smelt-hearth, impounding basin & tide-mill, 4-rotor sill turbine array, -6.0 m White Stacks sea-byssus causeway, all 5 Shore-kin
// client hinterland villages (village_ash, village_spars + 3D timber log-chute, village_cordage, village_ore, village_saltery), and 5 nomad
// fleet mooring groups (34 berths across 89c..89h) cleared through KSPACE.
// Zero THREE, zero DOM, zero Math.random, zero numeric || defaults.
(function(root){
'use strict';
if(root.FCOVE_LAYOUT)return;

const AX=Object.freeze([0.422618,0.906308]);
const VX=Object.freeze([0.906308,-0.422618]);
const SEED=0x4A2C06;

const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
function smooth(a,b,x){
 const d=b-a;
 const t=clamp((x-a)/(d===0?1:d),0,1);
 return t*t*(3-2*t);
}

const S_OF=(x,z)=>x*AX[0]+z*AX[1];
const A_OF=(x,z)=>x*VX[0]+z*VX[1];
const XZ=(s,a)=>[s*AX[0]+a*VX[0],s*AX[1]+a*VX[1]];

/* Mirror of 45-host-stage.js cove centerline & half-widths so FCOVE_LAYOUT is pure [G data] even before 45 runs */
function centerA(s){
 return -95*smooth(-560,-1060,s)
  +54*Math.sin(s*0.0028+0.85)*smooth(-1250,-480,s)*smooth(1500,850,s)
  -46*smooth(-300,140,s)*smooth(640,220,s)
  +36*smooth(260,680,s)*smooth(1280,920,s);
}
function hwE(s){
 const throat=-52*smooth(-1060,-840,s)*smooth(-560,-740,s);
 const prow=-58*Math.exp(-Math.pow((s+370)/115,2));
 const bightE=66*Math.exp(-Math.pow((s+95)/165,2))+38*Math.exp(-Math.pow((s-470)/180,2));
 const inner=lerp(176,19,smooth(860,1140,s));
 const flare=240*smooth(-920,-1380,s);
 return Math.max(17,inner+throat+prow+bightE+flare);
}
function hwW(s){
 const throat=-48*smooth(-1080,-850,s)*smooth(-560,-740,s);
 const bightW=50*Math.exp(-Math.pow((s+260)/150,2))+68*Math.exp(-Math.pow((s-360)/195,2));
 const inner=lerp(172,19,smooth(860,1140,s));
 const flare=240*smooth(-960,-1420,s);
 return Math.max(17,inner+throat+bightW+flare);
}

const eastShoreA=s=>centerA(s)+hwE(s);
const westShoreA=s=>centerA(s)-hwW(s);

/* 1. ARCOFORTE FRAME on the eastern cliff-prow spur (s = -310) */
const AF_S0=-310;
const AF_SHORE_A=eastShoreA(AF_S0);
const AF_A0=+(AF_SHORE_A+244).toFixed(2);
const AF_ORIG=XZ(AF_S0,AF_A0);
const AF_YAW=Math.atan2(VX[0],VX[1]);
const AF_COS=Math.cos(AF_YAW),AF_SIN=Math.sin(AF_YAW);

function afToWorld(lx,ly,lz){
 return[
  AF_ORIG[0]+lx*AF_COS+lz*AF_SIN,
  ly,
  AF_ORIG[1]-lx*AF_SIN+lz*AF_COS
 ];
}
function afToLocal(wx,wz){
 const dx=wx-AF_ORIG[0],dz=wz-AF_ORIG[1];
 return[dx*AF_COS-dz*AF_SIN,dx*AF_SIN+dz*AF_COS];
}

const AF_FOOTPRINT_LOCAL=[
 [-84,-340],[84,-340],[176,-250],[294,-150],[294,160],
 [76,220],[76,474],[-76,474],[-76,220],
 [-294,160],[-294,-150],[-304,-262],[-200,-262],[-130,-252]
];
const AF_FOOTPRINT_WORLD=Object.freeze(AF_FOOTPRINT_LOCAL.map(p=>{
 const w=afToWorld(p[0],0,p[1]);
 return Object.freeze([+w[0].toFixed(2),+w[2].toFixed(2)]);
}));

function afLandEnvelopeDist(lx,lz){
 const ax=Math.abs(lx);
 const dRing=Math.max(ax-294,-252-lz,lz-216);
 const dMar=Math.max(-336-lx,lx+198,-262-lz,lz+148);
 const dLin=Math.max(ax-88,190-lz,lz-476);
 return Math.min(dRing,dMar,dLin);
}

/* 2. SHIPYARD, GRAVING CRADLES, HARBOUR CLIENT WORK-BENCH (+9.2 m), SALVAGED PORT SEGMENTS (d = 3) & IMPOUNDING TIDE-MILL */
const YARD_DECK_Y=6.0;
const HARBOUR_BENCH_Y=9.2;
const PORT_YAW=Math.atan2(-VX[0],-VX[1]); /* seaward (-VX) */

function quayA(s){
 return 208+18*smooth(40,360,s)+14*smooth(320,520,s);
}

const CRADLES=Object.freeze([
 Object.freeze({
  id:'cradle_deep',
  name:'Deep Spring Graving Cradle',
  s:22,
  w:20,
  len:50,
  a0:quayA(22),
  pitFloor:-3.6,
  blocks:-3.0,
  sill:0.0,
  deckY:YARD_DECK_Y,
  vesselKey:'arkCatamaran',
  vesselDraft:5.2
 }),
 Object.freeze({
  id:'cradle_great',
  name:'Great Careening Inner Pit',
  s:52,
  w:18,
  len:44,
  a0:quayA(52),
  pitFloor:-0.6,
  blocks:0.0,
  sill:0.0,
  deckY:YARD_DECK_Y,
  vesselKey:null,
  vesselDraft:6.2
 }),
 Object.freeze({
  id:'cradle_shallow',
  name:'Shallow Slip and Tender Cradle',
  s:80,
  w:14,
  len:32,
  a0:quayA(80),
  pitFloor:-1.5,
  blocks:-1.0,
  sill:-1.0,
  deckY:YARD_DECK_Y,
  vesselKey:'arkScoutTri',
  vesselDraft:1.3
 })
]);

const SMELT_HEARTH=Object.freeze((function(){
 const s=52,a=quayA(52)+58,p=XZ(s,a);
 return{id:'fcove.smelt_hearth',name:'Paktong Reverberatory Smelt-Hearth',s:s,a:a,x:+p[0].toFixed(2),z:+p[1].toFixed(2),y:YARD_DECK_Y,r:14,h:19};
})());

/* Shore-kin Harbour Client Work-Bench (+9.2 m terrace inshore of the cradles & cupola, dry above +7.3 m spring flood) */
const HARBOUR_WORKS=Object.freeze([
 Object.freeze((function(){
  const s=96,a=quayA(s)+114,p=XZ(s,a);
  return{
   id:'fcove.harbour.client_hall',
   key:'sk_client_hall',
   role:'civic',
   name:'Caretaker House Shore-Kin Client Moot and Tally Hall',
   s:s,a:+a.toFixed(2),
   x:+p[0].toFixed(2),z:+p[1].toFixed(2),y:HARBOUR_BENCH_Y,
   ry:PORT_YAW,w:22.8,d:23.6,h:15.8,
   types:Object.freeze(['civic','market'])
  };
 })()),
 Object.freeze((function(){
  const s=48,a=quayA(s)+112,p=XZ(s,a);
  return{
   id:'fcove.harbour.paktong_foundry',
   key:'sk_paktong_foundry',
   role:'works',
   name:'Harbour Shore-Kin Paktong Ingot and Sheathing Foundry',
   s:s,a:+a.toFixed(2),
   x:+p[0].toFixed(2),z:+p[1].toFixed(2),y:HARBOUR_BENCH_Y,
   ry:PORT_YAW,w:20.6,d:17.2,h:10.8,
   types:Object.freeze(['industry'])
  };
 })()),
 Object.freeze((function(){
  const s=138,a=quayA(s)+110,p=XZ(s,a);
  return{
   id:'fcove.harbour.boat_grid_shed',
   key:'sk_boat_grid_shed',
   role:'works',
   name:'Harbour Shore-Kin Tender and Skiff Careening Shed',
   s:s,a:+a.toFixed(2),
   x:+p[0].toFixed(2),z:+p[1].toFixed(2),y:HARBOUR_BENCH_Y,
   ry:PORT_YAW,w:16.8,d:20.4,h:10.2,
   types:Object.freeze(['industry','infrastructure'])
  };
 })())
]);

/* Salvaged Ancient Port segments (kits/port at d = 3) seated along the sheltered shipyard quay */
const PORT_SEGS=Object.freeze([
 Object.freeze((function(){
  const s=162,a=quayA(s)+92,p=XZ(s,a);
  return{id:'fcove.port.slPen',key:'slPen',name:'Submarine Wet-Pen and Shore-kin Quarters',d:3,s:s,a:a,x:+p[0].toFixed(2),z:+p[1].toFixed(2),yaw:PORT_YAW,W:110,LAND:60,SEA:196};
 })()),
 Object.freeze((function(){
  const s=276,a=quayA(s)+6,p=XZ(s,a);
  return{id:'fcove.port.ddShed',key:'ddShed',name:'Covered Boatbuilding Hall',d:3,s:s,a:a,x:+p[0].toFixed(2),z:+p[1].toFixed(2),yaw:PORT_YAW,W:110,LAND:120,SEA:40};
 })()),
 Object.freeze((function(){
  const s=384,a=quayA(s)+34,p=XZ(s,a);
  return{id:'fcove.port.ddYard',key:'ddYard',name:'Slipway and Fabrication Yard',d:3,s:s,a:a,x:+p[0].toFixed(2),z:+p[1].toFixed(2),yaw:PORT_YAW,W:100,LAND:100,SEA:120};
 })())
]);

/* Impounding Basin & Tide-Mill Wheelhouse (s = 478) */
const TIDE_MILL=Object.freeze((function(){
 const s=478,aWeir=quayA(s)+8,pWeir=XZ(s,aWeir),pBasin=XZ(s,aWeir+30);
 return{
  id:'fcove.tide_mill',
  name:'Impounding Basin and Paktong Tide-Mill',
  s:s,
  aWeir:aWeir,
  x:+pWeir[0].toFixed(2),
  z:+pWeir[1].toFixed(2),
  basinX:+pBasin[0].toFixed(2),
  basinZ:+pBasin[1].toFixed(2),
  w:58,
  basinLen:46,
  basinFloor:-4.2,
  weirTop:7.4,
  wheelR:4.8,
  yaw:PORT_YAW
 };
})());

/* 3. NNW SILL-THROAT REVERSIBLE PAKTONG ROTOR ARRAY (s = -790) */
const SILL_ROTORS=Object.freeze((function(){
 const s=-790,ca=centerA(s);
 const offsets=[-84,-56,56,84];
 const units=offsets.map((da,i)=>{
  const a=ca+da,p=XZ(s,a);
  return Object.freeze({
   id:'fcove.rotor.'+i,
   index:i,
   side:da<0?'west':'east',
   s:s,
   a:+a.toFixed(2),
   x:+p[0].toFixed(2),
   z:+p[1].toFixed(2),
   bedY:-11.2,
   hubY:-5.6,
   pierTopY:8.6,
   bladeR:3.4
  });
 });
 const pMid=XZ(s,ca);
 return{
  id:'fcove.sill_rotors',
  name:'Sill-Throat Reversible Paktong Rotor Array',
  s:s,
  centerA:+ca.toFixed(2),
  x:+pMid[0].toFixed(2),
  z:+pMid[1].toFixed(2),
  fairwayHalfW:44,
  axis:AX,
  units:Object.freeze(units)
 };
})());

/* 4. LOW-WATER -6.0 M WHITE STACKS CAUSEWAY & SEA-BYSSUS BEDS (s = -665) */
const CAUSEWAY=Object.freeze((function(){
 const s=-665,ca=centerA(s),ww=hwW(s);
 const aStart=ca-ww-14,aEnd=ca-ww+78;
 const p0=XZ(s,aStart),p1=XZ(s,aEnd),pMid=XZ(s,0.5*(aStart+aEnd));
 return{
  id:'fcove.white_stacks_causeway',
  name:'White Stacks Low-Water Causeway and Sea-Byssus Beds',
  s:s,
  aStart:+aStart.toFixed(2),
  aEnd:+aEnd.toFixed(2),
  startXZ:Object.freeze([+p0[0].toFixed(2),+p0[1].toFixed(2)]),
  endXZ:Object.freeze([+p1[0].toFixed(2),+p1[1].toFixed(2)]),
  x:+pMid[0].toFixed(2),
  z:+pMid[1].toFixed(2),
  width:7.5,
  crestY:-6.0,
  byssusY:-6.2
 };
})());

/* 5. THE 5 SHORE-KIN CLIENT HINTERLAND VILLAGES & 3D TIMBER SPAR LOG-CHUTE */
const SPAR_CHUTE=Object.freeze((function(){
 const sHead=955,aHead=eastShoreA(sHead)+158;
 const sFoot=426,aFoot=quayA(sFoot)+86;
 const pH=XZ(sHead,aHead),pF=XZ(sFoot,aFoot);
 const pMid=XZ(0.5*(sHead+sFoot),0.5*(aHead+aFoot));
 const L=Math.hypot(pF[0]-pH[0],pF[1]-pH[1]);
 return{
  id:'fcove.spar_log_chute',
  name:'Kauri-Chute Timber Spar Flume and Boatyard Catch-Crib',
  sHead:sHead,aHead:+aHead.toFixed(2),
  sFoot:sFoot,aFoot:+aFoot.toFixed(2),
  headXZ:Object.freeze([+pH[0].toFixed(2),+pH[1].toFixed(2)]),
  footXZ:Object.freeze([+pF[0].toFixed(2),+pF[1].toFixed(2)]),
  x:+pMid[0].toFixed(2),
  z:+pMid[1].toFixed(2),
  headY:126.5,
  footY:8.4,
  lengthM:+L.toFixed(1),
  widthM:3.2,
  nBents:28
 };
})());

const VILLAGES=Object.freeze((function(){
 function mk(o){
  const p=XZ(o.s,o.a),lk=XZ(o.linkSA[0],o.linkSA[1]),rs=XZ(o.resSA[0],o.resSA[1]);
  let lnd=null;
  if(o.landingSA){
   const lp=XZ(o.landingSA[0],o.landingSA[1]);
   lnd=Object.freeze({
    s:o.landingSA[0],a:o.landingSA[1],
    x:+lp[0].toFixed(2),z:+lp[1].toFixed(2),
    ux:o.landingDir[0],uz:o.landingDir[1],
    deckY:o.landingY
   });
  }
  return Object.freeze({
   id:o.id,
   name:o.name,
   epithet:o.epithet,
   focus:o.focus,
   zone:o.zone,
   s:o.s,
   a:+o.a.toFixed(2),
   x:+p[0].toFixed(2),
   z:+p[1].toFixed(2),
   benchY:o.benchY,
   tiltA:o.tiltA,
   rFlat:o.rFlat,
   rBlend:o.rBlend,
   gjarWest:!!o.gjarWest,
   workers:o.workers,
   popMax:o.popMax,
   link:Object.freeze({x:+lk[0].toFixed(2),z:+lk[1].toFixed(2)}),
   resource:Object.freeze({x:+rs[0].toFixed(2),z:+rs[1].toFixed(2),workers:o.workers,kind:o.resKind}),
   landing:lnd,
   plinthMat:o.plinthMat
  });
 }
 return[
  /* 1. Pycnandra-Clamps (Ash-Burners): eastern red-laterite Pycnandra/verdigris plateau (y ~ +148 m > +90 m) */
  mk({
   id:'village_ash',
   name:'Pycnandra-Clamps (Shore-Kin Ash-Burners)',
   epithet:'Pycnandra-Clamps',
   focus:'ash',
   zone:'Eastern red-laterite Pycnandra and verdigris plateau',
   s:185,
   a:eastShoreA(185)+545,
   benchY:148.0,
   tiltA:0.018,
   rFlat:195,
   rBlend:255,
   workers:82,
   popMax:235,
   linkSA:[64,quayA(64)+105],
   resSA:[252,eastShoreA(252)+662],
   resKind:'nickel_ash_hollow',
   plinthMat:'laterite'
  }),
  /* 2. Kauri-Chute (Spar-Cutters): Agathis/Araucaria ridge above the southern gjar (y ~ +128.5 m), feeding SPAR_CHUTE */
  mk({
   id:'village_spars',
   name:'Kauri-Chute (Shore-Kin Spar-Cutters)',
   epithet:'Kauri-Chute',
   focus:'spars',
   zone:'Agathis and Araucaria serpentine ridge above the southern gjar',
   s:1095,
   a:eastShoreA(1095)+265,
   benchY:128.5,
   tiltA:0.02,
   rFlat:190,
   rBlend:245,
   workers:80,
   popMax:225,
   linkSA:[SPAR_CHUTE.sHead,SPAR_CHUTE.aHead],
   resSA:[1185,eastShoreA(1185)+355],
   resKind:'araucaria_kauri_stand',
   plinthMat:'serpentinite'
  }),
  /* 3. Seep-Walk (Pitch & Rope): dry +16.4 m southern gjar neck bench (y in +14..+20 m, safely above +-7 m tidal band) */
  mk({
   id:'village_cordage',
   name:'Seep-Walk (Shore-Kin Pitch and Ropewalk)',
   epithet:'Seep-Walk',
   focus:'cordage',
   zone:'Dry +16 m southern gjar bitumen-seep neck bench',
   s:1365,
   a:centerA(1365)-205,
   benchY:16.4,
   tiltA:-0.014,
   rFlat:172,
   rBlend:192,
   gjarWest:true,
   workers:74,
   popMax:210,
   linkSA:[885,centerA(885)-95],
   resSA:[1305,centerA(1305)-68],
   resKind:'gjar_bitumen_hibiscus',
   plinthMat:'pillowbasalt'
  }),
  /* 4. Dyke-Roast (Copper/Zinc & Smelt): southeastern sheeted-dyke mineralized bench (y ~ +64 m > +25 m) */
  mk({
   id:'village_ore',
   name:'Dyke-Roast (Shore-Kin Copper-Zinc Roast and Smelt)',
   epithet:'Dyke-Roast',
   focus:'smelt',
   zone:'Southeastern sheeted-dyke mineralized bench',
   s:685,
   a:eastShoreA(685)+345,
   benchY:64.0,
   tiltA:0.018,
   rFlat:182,
   rBlend:228,
   workers:86,
   popMax:240,
   linkSA:[384,quayA(384)+95],
   resSA:[752,eastShoreA(752)+438],
   resKind:'sheeted_dyke_copper_zinc',
   plinthMat:'serpentinite'
  }),
  /* 5. Sill-Pans (Fish & Salt): western/NW outer basalt headland bench beyond the sill (y ~ +14.4 m > +9 m) + landing */
  mk({
   id:'village_saltery',
   name:'Sill-Pans (Shore-Kin Outer-Sill Fish and Salt)',
   epithet:'Sill-Pans',
   focus:'saltery',
   zone:'Northwestern outer pillow-basalt headland bench beyond the sill',
   s:-935,
   a:-485,
   benchY:14.4,
   tiltA:-0.015,
   rFlat:185,
   rBlend:235,
   workers:80,
   popMax:225,
   linkSA:[-1075,-465],
   resSA:[-1015,-555],
   resKind:'outer_sill_salt_shoal',
   landingSA:[-1078,-465],
   landingDir:[-AX[0],-AX[1]],
   landingY:8.8,
   plinthMat:'pillowbasalt'
  })
 ];
})());

/* 6. MOORED PELAGIC SANCTUARY FLEETS (5 visiting fleets, 32 hulls total across 89c..89h, cleared via KSPACE) */
function headingYaw(dx,dz){
 return Math.atan2(-dz,dx);
}

const FLEET_SLOTS=Object.freeze((function(){
 const raw=[
  /* Fleet 1: ward_ring (Home Clans — 2x 89g Chained Ark-Ward, 2x 89c Catamaran, 2x 89f Scout Trimaran = 6 hulls) */
  {id:'fcove.vessel.ward_north',fleetId:'ward_ring',rsKey:'arkChainedWard',ruleKey:'ark_ward',name:'North Ward-Ring Chained Ark-Ward',culture:'cflit-qbon',s:-35,da:-38,r:27,bowS:-1},
  {id:'fcove.vessel.ward_south',fleetId:'ward_ring',rsKey:'arkChainedWard',ruleKey:'ark_ward',name:'South Clan-Moot Chained Ark-Ward',culture:'cflit-qbon',s:215,da:-46,r:27,bowS:-1},
  {id:'fcove.vessel.cat_alpha',fleetId:'ward_ring',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Ward-Ring Moon-Pool Ark-Catamaran I',culture:'cflit-qbon',s:55,da:-92,r:21,bowS:-1},
  {id:'fcove.vessel.cat_beta',fleetId:'ward_ring',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Ward-Ring Moon-Pool Ark-Catamaran II',culture:'cflit-qbon',s:135,da:-12,r:21,bowS:-1},
  {id:'fcove.vessel.scout_sill',fleetId:'ward_ring',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Sill-Watch Scout Trimaran',culture:'cflit-qbon',s:-560,da:-18,r:13,bowS:-1},
  {id:'fcove.vessel.scout_cove',fleetId:'ward_ring',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Ward-Herald Scout Trimaran',culture:'cflit-qbon',s:95,da:42,r:13,bowS:1},

  /* Fleet 2: smelt_fleet (Deep-Ward <-> Copper Tarn <-> Arcoforte — 2x 89d Smelt-Barge, 2x 89c Catamaran, 1x 89e Tender, 1x 89f Trimaran = 6 hulls) */
  {id:'fcove.vessel.smelt_east',fleetId:'smelt_fleet',rsKey:'arkSmelter',ruleKey:'smelt_barge',name:'Ash-Chute Paktong Smelt-Barge I',culture:'cflit-qbon',s:-115,da:34,r:18,bowS:-1},
  {id:'fcove.vessel.smelt_inner',fleetId:'smelt_fleet',rsKey:'arkSmelter',ruleKey:'smelt_barge',name:'Copper-Tarn Paktong Smelt-Barge II',culture:'cflit-qbon',s:395,da:-18,r:18,bowS:-1},
  {id:'fcove.vessel.smelt_cat1',fleetId:'smelt_fleet',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Copper-Tarn Ore Carrier Catamaran',culture:'cflit-qbon',s:-15,da:44,r:21,bowS:-1},
  {id:'fcove.vessel.cat_gamma',fleetId:'smelt_fleet',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Deep-Ward Ingot Envoy Catamaran',culture:'cflit-qbon',s:315,da:-68,r:21,bowS:-1},
  {id:'fcove.vessel.smelt_tend',fleetId:'smelt_fleet',rsKey:'arkDiveTender',ruleKey:'dive_tender',name:'Slag-Sounding Dive Tender',culture:'cflit-qbon',s:345,da:22,r:15,bowS:-1},
  {id:'fcove.vessel.smelt_tri',fleetId:'smelt_fleet',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Farport Assay Runner Trimaran',culture:'cflit-qbon',s:-445,da:32,r:13,bowS:-1},

  /* Fleet 3: trench_fleet (Deep-Trench Divers — 1x 89g Ark-Ward, 2x 89c Catamaran, 3x 89e Vent Tender = 6 hulls) */
  {id:'fcove.vessel.trench_ward',fleetId:'trench_fleet',rsKey:'arkChainedWard',ruleKey:'ark_ward',name:'Abyssal Bell Chained Ark-Ward',culture:'cflit-qbon',s:-205,da:-18,r:27,bowS:-1},
  {id:'fcove.vessel.trench_cat1',fleetId:'trench_fleet',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Trench-Diver Moon-Pool Catamaran I',culture:'cflit-qbon',s:-305,da:-42,r:21,bowS:-1},
  {id:'fcove.vessel.trench_cat2',fleetId:'trench_fleet',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Trench-Diver Moon-Pool Catamaran II',culture:'cflit-qbon',s:495,da:-22,r:21,bowS:-1},
  {id:'fcove.vessel.tender_1',fleetId:'trench_fleet',rsKey:'arkDiveTender',ruleKey:'dive_tender',name:'Vent-Harvester Dive Tender I',culture:'cflit-qbon',s:-195,da:-88,r:15,bowS:-1},
  {id:'fcove.vessel.tender_2',fleetId:'trench_fleet',rsKey:'arkDiveTender',ruleKey:'dive_tender',name:'Hollow-Water Sounding Tender II',culture:'cflit-qbon',s:275,da:24,r:15,bowS:-1},
  {id:'fcove.vessel.trench_tend3',fleetId:'trench_fleet',rsKey:'arkDiveTender',ruleKey:'dive_tender',name:'Black-Smoker Salvage Tender III',culture:'cflit-qbon',s:-385,da:-12,r:15,bowS:-1},

  /* Fleet 4: outer_whalers (Outer Fleet & Hueru-Kuran Whalers — 1x 89c Catamaran, 4x 89h HK Whaler, 1x 89e Tender = 6 hulls) */
  {id:'fcove.vessel.outer_cat',fleetId:'outer_whalers',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Outer-Shoal Flensing Catamaran',culture:'cflit-qbon',s:-135,da:-118,r:21,bowS:-1},
  {id:'fcove.vessel.whaler_1',fleetId:'outer_whalers',rsKey:'hkWhaleCat',ruleKey:'hk_whaler',name:'Hueru-Kuran Whalebone Baidarka I',culture:'hueru-kuran',s:-265,da:-108,r:14,bowS:-1},
  {id:'fcove.vessel.whaler_2',fleetId:'outer_whalers',rsKey:'hkWhaleCat',ruleKey:'hk_whaler',name:'Hueru-Kuran Whalebone Baidarka II',culture:'hueru-kuran',s:465,da:-82,r:14,bowS:-1},
  {id:'fcove.vessel.whaler_3',fleetId:'outer_whalers',rsKey:'hkWhaleCat',ruleKey:'hk_whaler',name:'Hueru-Kuran Harpoon Catamaran III',culture:'hueru-kuran',s:-455,da:-74,r:14,bowS:-1},
  {id:'fcove.vessel.whaler_4',fleetId:'outer_whalers',rsKey:'hkWhaleCat',ruleKey:'hk_whaler',name:'Hueru-Kuran Blubber-Try Whaler IV',culture:'hueru-kuran',s:165,da:-112,r:14,bowS:-1},
  {id:'fcove.vessel.outer_tend',fleetId:'outer_whalers',rsKey:'arkDiveTender',ruleKey:'dive_tender',name:'Ambergris Sounding Tender',culture:'cflit-qbon',s:585,da:-54,r:15,bowS:-1},

  /* Fleet 5: island_traders (Arch & Ria Sound Island Traders — 1x 89c Catamaran, 4x 89f Scout Trimaran, 1x 89h Whaler = 6 hulls) */
  {id:'fcove.vessel.trade_cat',fleetId:'island_traders',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Ria-Sound Spice & Byssus Catamaran',culture:'cflit-qbon',s:575,da:14,r:21,bowS:1},
  {id:'fcove.vessel.scout_gjar',fleetId:'island_traders',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Gjar-Neck Messenger Trimaran',culture:'cflit-qbon',s:645,da:-18,r:13,bowS:1},
  {id:'fcove.vessel.trade_tri2',fleetId:'island_traders',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Crookshore Packet Trimaran',culture:'cflit-qbon',s:-505,da:-28,r:13,bowS:-1},
  {id:'fcove.vessel.trade_tri3',fleetId:'island_traders',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Kaskedi-Kuran Outrigger Trimaran',culture:'cflit-qbon',s:25,da:-132,r:13,bowS:1},
  {id:'fcove.vessel.trade_tri4',fleetId:'island_traders',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Byssus-Fair Crab-Claw Trimaran',culture:'cflit-qbon',s:385,da:-112,r:13,bowS:1},
  {id:'fcove.vessel.trade_hk',fleetId:'island_traders',rsKey:'hkWhaleCat',ruleKey:'hk_whaler',name:'Northern Pelagic Fur-Trade Catamaran',culture:'hueru-kuran',s:-345,da:-104,r:14,bowS:-1}
 ];
 const space=(typeof root.KSPACE!=='undefined'&&root.KSPACE)?root.KSPACE.create({cell:64}):null;
 const out=[];
 for(let i=0;i<raw.length;i++){
  const sp=raw[i];
  const jS=(root.KRAND?root.KRAND.unit(root.KRAND.hash(SEED,810+i,1))-0.5:0)*6;
  const jA=(root.KRAND?root.KRAND.unit(root.KRAND.hash(SEED,810+i,2))-0.5:0)*5;
  const yawJit=(root.KRAND?root.KRAND.unit(root.KRAND.hash(SEED,810+i,3))-0.5:0)*0.20;
  const s=sp.s+jS,a=centerA(s)+sp.da+jA,p=XZ(s,a);
  const bDir=[AX[0]*sp.bowS,AX[1]*sp.bowS];
  const yaw=headingYaw(bDir[0],bDir[1])+yawJit;
  let overlap=false;
  if(space){
   const hits=[];
   space.query(p[0],p[1],sp.r,hits);
   overlap=hits.length>0;
   space.insert(i,p[0],p[1],sp.r);
  }
  out.push(Object.freeze({
   id:sp.id,
   fleetId:sp.fleetId,
   rsKey:sp.rsKey,
   ruleKey:sp.ruleKey,
   name:sp.name,
   culture:sp.culture,
   s:+s.toFixed(2),
   a:+a.toFixed(2),
   x:+p[0].toFixed(2),
   z:+p[1].toFixed(2),
   yaw:+yaw.toFixed(4),
   r:sp.r,
   overlap:overlap
  }));
 }
 return out;
})());

/* Keep-clear & ground-shaping queries shared by 46-fcove-stage-bind.js, KHAMLET siting, and host audits */
function inVillageReserve(x,z){
 for(let i=0;i<VILLAGES.length;i++){
  const v=VILLAGES[i];
  if(Math.hypot(x-v.x,z-v.z)<=v.rFlat+10)return true;
  if(v.landing&&Math.hypot(x-v.landing.x,z-v.landing.z)<=34)return true;
 }
 return false;
}

function inChuteCorridor(x,z,halfW){
 const ax=SPAR_CHUTE.headXZ[0],az=SPAR_CHUTE.headXZ[1];
 const bx=SPAR_CHUTE.footXZ[0],bz=SPAR_CHUTE.footXZ[1];
 const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz;
 const t=clamp(((x-ax)*dx+(z-az)*dz)/(L2===0?1:L2),0,1);
 const px=ax+dx*t,pz=az+dz*t;
 return Math.hypot(x-px,z-pz)<=(halfW==null?12:halfW);
}

function inReserve(x,z){
 const lp=afToLocal(x,z),lx=lp[0],lz=lp[1];
 if(afLandEnvelopeDist(lx,lz)<=28)return true;
 if(Math.abs(lx)<=92&&lz>=-348&&lz<=-240)return true;
 const s=S_OF(x,z),a=A_OF(x,z);
 if(s>=-8&&s<=532&&a>=quayA(s)-135&&a<=quayA(s)+178)return true;
 if(Math.abs(s-CAUSEWAY.s)<=18&&a>=CAUSEWAY.aStart-10&&a<=CAUSEWAY.aEnd+14)return true;
 if(inVillageReserve(x,z))return true;
 if(inChuteCorridor(x,z,14))return true;
 return false;
}

function groundAt(x,z,rawH,afGroundFn){
 let h=rawH;
 const lp=afToLocal(x,z),lx=lp[0],lz=lp[1];

 /* A. Arcoforte 576 m horseshoe + park + Linear City + sub-cliff bench + harbour caisson bed */
 if(afGroundFn){
  if(Math.abs(lx)<=92&&lz>=-348&&lz<-246){
   const dBox=Math.max(Math.abs(lx)-80,-338-lz,lz+248);
   const wHarb=1-smooth(0,26,Math.max(0,dBox));
   if(wHarb>0){
    const targetBed=lerp(-18.5,-14.5,smooth(-338,-250,lz));
    h=lerp(h,Math.min(Math.max(h,-22),targetBed),wHarb);
   }
  }
  const dEnv=afLandEnvelopeDist(lx,lz);
  if(dEnv<86){
   const gAf=afGroundFn(lx,lz);
   const wAf=1-smooth(0,82,Math.max(0,dEnv));
   h=lerp(h,gAf,wAf);
  }
 }

 /* B. Sheltered SSE Shipyard Quay (+6.0 m), Raised Harbour Client Work-Bench (+9.2 m), Cradles, Port Berths & Impounding Basin */
 const s=S_OF(x,z),a=A_OF(x,z);
 if(s>=-8&&s<=535){
  const qA=quayA(s);
  const wS=smooth(-8,12,s)*smooth(535,512,s);
  if(wS>0&&a>=qA-145&&a<=qA+205){
   let yTarget=h;
   if(a<qA-2){
    const wBerth=smooth(qA-140,qA-95,a);
    yTarget=lerp(h,Math.min(h,-15.5),wBerth);
   }else if(a<=qA+82){
    yTarget=YARD_DECK_Y;
   }else if(s>=18&&s<=162&&a<=qA+148){
    /* Raised +9.2 m Shore-kin Harbour Client Work-Bench inshore of the cradles & cupola */
    const wHb=smooth(18,30,s)*smooth(162,148,s)*smooth(qA+82,qA+94,a);
    yTarget=lerp(YARD_DECK_Y,HARBOUR_BENCH_Y,wHb);
   }else if(a<=qA+132){
    yTarget=YARD_DECK_Y;
   }else{
    const baseIn=(s>=18&&s<=162)?lerp(YARD_DECK_Y,HARBOUR_BENCH_Y,smooth(18,30,s)*smooth(162,148,s)):YARD_DECK_Y;
    const tBack=smooth(qA+148,qA+202,a);
    yTarget=lerp(baseIn,h,tBack);
   }
   for(let i=0;i<CRADLES.length;i++){
    const c=CRADLES[i];
    if(Math.abs(s-c.s)<=c.w*0.5+4.5&&a>=c.a0-6&&a<=c.a0+c.len+4){
     yTarget=Math.min(yTarget,c.pitFloor-1.6);
    }
   }
   const pen=PORT_SEGS[0];
   if(Math.abs(s-pen.s)<=46&&a>=qA-95&&a<=pen.a+36){
    yTarget=-14.2;
   }
   const yrd=PORT_SEGS[2];
   if(Math.abs(s-(yrd.s+28))<=20&&a>=qA-90&&a<=yrd.a+84){
    yTarget=a<yrd.a-36?-13.5:lerp(-5.8,YARD_DECK_Y,clamp((a-(yrd.a-36))/120,0,1));
   }
   if(Math.abs(s-TIDE_MILL.s)<=TIDE_MILL.w*0.5&&a>=TIDE_MILL.aWeir-3&&a<=TIDE_MILL.aWeir+TIDE_MILL.basinLen){
    yTarget=a<TIDE_MILL.aWeir+3.2?TIDE_MILL.weirTop:TIDE_MILL.basinFloor;
   }
   h=lerp(h,yTarget,wS);
  }
 }

 /* C. Low-Water -6.0 m White Stacks Causeway (s = -665) */
 if(Math.abs(s-CAUSEWAY.s)<=14&&a>=CAUSEWAY.aStart-6&&a<=CAUSEWAY.aEnd+6){
  const wAcross=1-smooth(CAUSEWAY.width*0.5,CAUSEWAY.width*0.5+6,Math.abs(s-CAUSEWAY.s));
  const uAlong=clamp((a-CAUSEWAY.aStart)/(CAUSEWAY.aEnd-CAUSEWAY.aStart),0,1);
  const cwyY=uAlong<0.18?lerp(2.4,CAUSEWAY.crestY,uAlong/0.18):CAUSEWAY.crestY;
  if(wAcross>0){
   h=Math.max(h,lerp(h,cwyY,wAcross));
  }
 }

 /* D. The 5 Shore-Kin Client Hinterland Village Benches & Outer-Sill Coastal Landing */
 for(let i=0;i<VILLAGES.length;i++){
  const v=VILLAGES[i];
  const d=Math.hypot(x-v.x,z-v.z);
  if(d<v.rBlend){
   let wV=1-smooth(v.rFlat,v.rBlend,d);
   if(v.gjarWest){
    /* Keep the southern gjar stream channel (|a - centerA(s)| < 18 m) untouched in its natural bed */
    const daG=a-centerA(s);
    wV*=smooth(-16,-32,daG);
   }
   if(wV>0){
    const gentle=v.benchY+(a-v.a)*v.tiltA+0.35*Math.sin(s*0.035+i)*smooth(v.rBlend,v.rFlat*0.5,d);
    h=lerp(h,Math.max(9.0,gentle),wV);
   }
  }
  if(v.landing){
   const dl=Math.hypot(x-v.landing.x,z-v.landing.z);
   if(dl<58){
    const wL=1-smooth(26,58,dl);
    const sRel=(x-v.landing.x)*v.landing.ux+(z-v.landing.z)*v.landing.uz;
    const tL=sRel>8?lerp(v.landing.deckY,-4.5,clamp((sRel-8)/26,0,1)):lerp(v.landing.deckY+1.4,v.landing.deckY,clamp((sRel+18)/26,0,1));
    h=lerp(h,tL,wL);
   }
  }
 }

 return h;
}

root.FCOVE_LAYOUT=Object.freeze({
 seed:SEED,
 axis:AX,
 across:VX,
 S_OF:S_OF,
 A_OF:A_OF,
 XZ:XZ,
 centerA:centerA,
 hwE:hwE,
 hwW:hwW,
 eastShoreA:eastShoreA,
 westShoreA:westShoreA,
 quayA:quayA,
 yardDeckY:YARD_DECK_Y,
 harbourBenchY:HARBOUR_BENCH_Y,
 portYaw:PORT_YAW,
 arcoforte:Object.freeze({
  id:'site:fleetborn-arcoforte',
  s0:AF_S0,
  a0:AF_A0,
  x:+AF_ORIG[0].toFixed(2),
  z:+AF_ORIG[1].toFixed(2),
  y0:0,
  yaw:+AF_YAW.toFixed(6),
  span:576,
  toWorld:afToWorld,
  toLocal:afToLocal,
  footprint:AF_FOOTPRINT_WORLD,
  envelopeDist:afLandEnvelopeDist
 }),
 cradles:CRADLES,
 smeltHearth:SMELT_HEARTH,
 harbourWorks:HARBOUR_WORKS,
 portSegs:PORT_SEGS,
 tideMill:TIDE_MILL,
 sillRotors:SILL_ROTORS,
 causeway:CAUSEWAY,
 sparChute:SPAR_CHUTE,
 villages:VILLAGES,
 fleet:FLEET_SLOTS,
 fleetSlots:FLEET_SLOTS,
 inVillageReserve:inVillageReserve,
 inChuteCorridor:inChuteCorridor,
 inReserve:inReserve,
 groundAt:groundAt
});
if(typeof module!=='undefined'&&module.exports)module.exports=root.FCOVE_LAYOUT;
})(typeof window!=='undefined'?window:globalThis);
