// ================================================================= FLEETBORN COVE — spatial master plan (FCOVE_LAYOUT)  [G data]
// Pure [G data] coordinates and grading functions for Fleetborn Cove (px [236, 242]): seats Arcoforte (kits/arcoforte, 576 m span) on the
// eastern ophiolite cliff-prow facing WSW across the fjord, lays out the three macrotidal graving cradles, salvaged Ancient port segments
// (slPen, ddShed, ddYard at d = 3), paktong smelt-hearth, impounding basin & tide-mill, 4-rotor sill turbine array, -6.0 m White Stacks
// sea-byssus causeway, and 14 moored cFlīt-qBōn & Hueru-Kuran sanctuary vessels (89c..89h) cleared through KSPACE.
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

/* 1. ARCOFORTE FRAME on the eastern cliff-prow spur (s = -310):
      Arcoforte local -z (seaward harbour) points WSW (-VX) into the cove; local +z (park & Linear City) runs ENE (+VX) onto the plateau;
      local +x points NNW (-AX) toward the sill; local -x (NW Marina) points SSE (+AX) toward the sheltered shipyard. */
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

/* Polygon footprint of site:fleetborn-arcoforte (576 m span horseshoe + harbour platform + Linear City throat) in world [x, z] */
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
 /* Signed-like outside distance (>0 outside) around Arcoforte's land/cliff/marina footprint (excludes open deep water outside harbourBox) */
 const ax=Math.abs(lx);
 /* Ring + bastions + cliff face: |lx| <= 294, lz in [-252, +216] */
 const dRing=Math.max(ax-294,-252-lz,lz-216);
 /* Marina wing: lx in [-336, -198], lz in [-262, -148] */
 const dMar=Math.max(-336-lx,lx+198,-262-lz,lz+148);
 /* Linear city throat: |lx| <= 88, lz in [190, 476] */
 const dLin=Math.max(ax-88,190-lz,lz-476);
 return Math.min(dRing,dMar,dLin);
}

/* 2. SHIPYARD, GRAVING CRADLES, SALVAGED PORT SEGMENTS (d = 3) & IMPOUNDING TIDE-MILL (s = +4 .. +520 along sheltered SSE east shore) */
const YARD_DECK_Y=6.0;
const PORT_YAW=Math.atan2(-VX[0],-VX[1]); /* kits/port +z is seaward (-VX) */

function quayA(s){
 /* Straightened smooth quay line along the sheltered inner-cove eastern shore */
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

/* 3. NNW SILL-THROAT REVERSIBLE PAKTONG ROTOR ARRAY (s = -790, leaving a 92 m deep-hull fairway in the centre) */
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

/* 4. LOW-WATER -6.0 M WHITE STACKS CAUSEWAY & SEA-BYSSUS BEDS (s = -665, western sill-ledge to Lost-City brucite chimneys) */
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

/* 5. MOORED PELAGIC SANCTUARY FLEET (89c..89h) in the -45..-59 m inner cove, verified with KSPACE */
function headingYaw(dx,dz){
 /* Ringsea vessels have bow at +x, starboard at +z; Group.rotation.y = atan2(-dz, dx) aims bow along (dx, dz) */
 return Math.atan2(-dz,dx);
}

const FLEET=Object.freeze((function(){
 const specs=[
  {id:'fcove.vessel.ward_north',rsKey:'arkChainedWard',ruleKey:'ark_ward',name:'North Ward-Ring Chained Ark-Ward',culture:'cflit-qbon',s:-35,da:-38,r:28,bowS:-1},
  {id:'fcove.vessel.ward_south',rsKey:'arkChainedWard',ruleKey:'ark_ward',name:'South Clan-Moot Chained Ark-Ward',culture:'cflit-qbon',s:215,da:-46,r:28,bowS:-1},
  {id:'fcove.vessel.cat_alpha',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Trench-Diver Moon-Pool Ark-Catamaran I',culture:'cflit-qbon',s:55,da:-88,r:22,bowS:-1},
  {id:'fcove.vessel.cat_beta',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Trench-Diver Moon-Pool Ark-Catamaran II',culture:'cflit-qbon',s:135,da:-12,r:22,bowS:-1},
  {id:'fcove.vessel.cat_gamma',rsKey:'arkCatamaran',ruleKey:'ark_catamaran',name:'Deep-Ward Envoy Moon-Pool Ark-Catamaran',culture:'cflit-qbon',s:315,da:-64,r:22,bowS:-1},
  {id:'fcove.vessel.smelt_east',rsKey:'arkSmelter',ruleKey:'smelt_barge',name:'Ash-Chute Paktong Smelt-Barge I',culture:'cflit-qbon',s:-115,da:34,r:18,bowS:-1},
  {id:'fcove.vessel.smelt_inner',rsKey:'arkSmelter',ruleKey:'smelt_barge',name:'Copper-Tarn Paktong Smelt-Barge II',culture:'cflit-qbon',s:395,da:-18,r:18,bowS:-1},
  {id:'fcove.vessel.tender_1',rsKey:'arkDiveTender',ruleKey:'dive_tender',name:'Vent-Harvester Dive Tender I',culture:'cflit-qbon',s:-195,da:-54,r:15,bowS:-1},
  {id:'fcove.vessel.tender_2',rsKey:'arkDiveTender',ruleKey:'dive_tender',name:'Hollow-Water Sounding Tender II',culture:'cflit-qbon',s:275,da:24,r:15,bowS:-1},
  {id:'fcove.vessel.scout_sill',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Sill-Runner Scout Trimaran',culture:'cflit-qbon',s:-560,da:-18,r:13,bowS:-1},
  {id:'fcove.vessel.scout_cove',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Drift-Spar Scout Trimaran',culture:'cflit-qbon',s:95,da:42,r:13,bowS:1},
  {id:'fcove.vessel.scout_gjar',rsKey:'arkScoutTri',ruleKey:'scout_trimaran',name:'Gjar-Neck Messenger Trimaran',culture:'cflit-qbon',s:535,da:-12,r:13,bowS:1},
  {id:'fcove.vessel.whaler_1',rsKey:'hkWhaleCat',ruleKey:'hk_whaler',name:'Hueru-Kuran Whalebone Baidarka I',culture:'hueru-kuran',s:-265,da:-92,r:14,bowS:-1},
  {id:'fcove.vessel.whaler_2',rsKey:'hkWhaleCat',ruleKey:'hk_whaler',name:'Hueru-Kuran Whalebone Baidarka II',culture:'hueru-kuran',s:465,da:-74,r:14,bowS:-1}
 ];
 const space=(typeof root.KSPACE!=='undefined'&&root.KSPACE)?root.KSPACE.create({cell:64}):null;
 const out=[];
 for(let i=0;i<specs.length;i++){
  const sp=specs[i];
  const jS=(root.KRAND?root.KRAND.unit(root.KRAND.hash(SEED,810+i,1))-0.5:0)*8;
  const jA=(root.KRAND?root.KRAND.unit(root.KRAND.hash(SEED,810+i,2))-0.5:0)*6;
  const yawJit=(root.KRAND?root.KRAND.unit(root.KRAND.hash(SEED,810+i,3))-0.5:0)*0.22;
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

/* Keep-clear & ground-shaping queries shared by 46-fcove-stage-bind.js and host audits */
function inReserve(x,z){
 const lp=afToLocal(x,z),lx=lp[0],lz=lp[1];
 if(afLandEnvelopeDist(lx,lz)<=28)return true;
 if(Math.abs(lx)<=92&&lz>=-348&&lz<=-240)return true;
 const s=S_OF(x,z),a=A_OF(x,z);
 if(s>=-8&&s<=532&&a>=quayA(s)-135&&a<=quayA(s)+175)return true;
 if(Math.abs(s-CAUSEWAY.s)<=18&&a>=CAUSEWAY.aStart-10&&a<=CAUSEWAY.aEnd+14)return true;
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

 /* B. Sheltered SSE Shipyard Quay (+6.0 m), Three Graving Cradles, Port Berths & Impounding Basin */
 const s=S_OF(x,z),a=A_OF(x,z);
 if(s>=-8&&s<=535){
  const qA=quayA(s);
  const wS=smooth(-8,12,s)*smooth(535,512,s);
  if(wS>0&&a>=qA-145&&a<=qA+195){
   let yTarget=h;
   if(a<qA-2){
    /* Dredged -15.5 m shipyard fairway & slPen/ddYard wet berths */
    const wBerth=smooth(qA-140,qA-95,a);
    yTarget=lerp(h,Math.min(h,-15.5),wBerth);
   }else if(a<=qA+132){
    yTarget=YARD_DECK_Y;
   }else{
    const tBack=smooth(qA+132,qA+192,a);
    yTarget=lerp(YARD_DECK_Y,h,tBack);
   }
   /* Cut the three stepped tidal graving cradles cleanly below their concrete slabs */
   for(let i=0;i<CRADLES.length;i++){
    const c=CRADLES[i];
    if(Math.abs(s-c.s)<=c.w*0.5+4.5&&a>=c.a0-6&&a<=c.a0+c.len+4){
     yTarget=Math.min(yTarget,c.pitFloor-1.6);
    }
   }
   /* Cut the slPen wet-bays & approach pocket (s = 162) */
   const pen=PORT_SEGS[0];
   if(Math.abs(s-pen.s)<=46&&a>=qA-95&&a<=pen.a+36){
    yTarget=-14.2;
   }
   /* Cut the ddYard slipway ramp & launch channel (s = 384) */
   const yrd=PORT_SEGS[2];
   if(Math.abs(s-(yrd.s+28))<=20&&a>=qA-90&&a<=yrd.a+84){
    yTarget=a<yrd.a-36?-13.5:lerp(-5.8,YARD_DECK_Y,clamp((a-(yrd.a-36))/120,0,1));
   }
   /* Cut the Impounding Basin behind its +7.4 m weir wall (s = 478) */
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
 portSegs:PORT_SEGS,
 tideMill:TIDE_MILL,
 sillRotors:SILL_ROTORS,
 causeway:CAUSEWAY,
 fleet:FLEET,
 inReserve:inReserve,
 groundAt:groundAt
});
if(typeof module!=='undefined'&&module.exports)module.exports=root.FCOVE_LAYOUT;
})(typeof window!=='undefined'?window:globalThis);
