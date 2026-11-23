// ================================================================= HOST — STATION 4, MOUNT CAELUM: its land
// The plan's site is the summit, 1622,1166 (4,431 m, the pin). THE SURVEY (PLAN.md 7b, 2026-11-12): the model draws a low-angle shield, its top a
// plateau of 4,300-4,440 m some 4 km across with a shallow dip round 1622,1165-1167 (4,310-4,334 m) and the scale model's own vent at 1622,1166
// (vents.json: a `geyser`, the Caelum fumaroles); the flanks fall 150-250 m a cell beyond. ET, tm -2 degC (11/-15), 439 mm, 0.92 atm. The station sets:
//   THE CALDERA      the summit's pit round the vent: an ellipse 1.2 by 1 km, 110 m deep, its walls stepped (KRELIEF.stepcut, a pit), its floor
//                    the fumaroles' field
//   THE RIFTS        the shield's two rift zones, north-east and south-west from the caldera: fissures 140 m across at their lips and 70 m deep,
//                    stepped, pinching out at both ends (stepcut's `head`); the PARENT COLONY's cables across them (86: src/85's slotCanopy)
//   THE FUMAROLES    vents on the caldera's floor and in the rifts' throats (KRAND by index): steam (ATMOS.smoke), the sulphur crust round each
//                    (the geo field), and their gas and hot ground as hazards (KHAZ.GROUND.gasVent, hotGround)
//   THE SUMMIT       scoria and cinder over the plateau (the cinder field), snow lying in the hollows and the lee, never on the vents' warm ground
const STATION=(function(){
 const base=(x,z)=>MODEL.h(x,z),W=99400;
 const g0=(x,z)=>base(x,z)+2.2*(KRAND.fbm(x*.005,.5,z*.005,3,99401)-.5);
 const CAL={c:[150,-80],rx:620,rz:500,ry:.4};
 const CUT=KRELIEF.stepcut({ell:CAL,depth:110,steps:3,tread:34,riser:2,rim:3,warp:{amp:30,scale:1/320},seed:99402});
 const RIFT_NE={pts:[[620,-560],[1250,-1150],[1900,-1700],[2500,-2250]],w:30},RIFT_SW={pts:[[-360,360],[-1000,950],[-1650,1550],[-2300,2150]],w:28};
 const RC={ne:KRELIEF.stepcut({line:RIFT_NE,depth:72,steps:2,tread:18,riser:2,rim:1.5,warp:{amp:10,scale:1/240},head:{len:500,minW:.35},seed:99403}),
  sw:KRELIEF.stepcut({line:RIFT_SW,depth:66,steps:2,tread:16,riser:2,rim:1.5,warp:{amp:10,scale:1/240},head:{len:500,minW:.35},seed:99404})};
 const ground=(x,z)=>KRELIEF.shape(CUT,x,z,KRELIEF.shape(RC.sw,x,z,KRELIEF.shape(RC.ne,x,z,g0(x,z))));
 const partAt=(x,z)=>{const g=g0(x,z);return KRELIEF.at(CUT,x,z,g)||KRELIEF.at(RC.ne,x,z,g)||KRELIEF.at(RC.sw,x,z,g);};
 const pitOf=(x,z)=>{const g=g0(x,z);return KRELIEF.at(CUT,x,z,g)?'caldera':KRELIEF.at(RC.ne,x,z,g)?'ne':KRELIEF.at(RC.sw,x,z,g)?'sw':null;};
 // THE VENTS: on the caldera's floor (KRAND: candidates by index, kept where the cut's part is `floor`), and two in each rift's throat (its end
 // nearest the caldera), each with its strength (the steam's rate, the gas's reach)
 const VENTS=[];
 {const u=(k,q)=>KRAND.unit(KRAND.hash(W,k,q,0x41));for(let k=0;VENTS.length<6&&k<200;k++){const a=u(k,1)*Math.PI*2,r=Math.sqrt(u(k,2))*.8,
   x=CAL.c[0]+Math.cos(a)*r*CAL.rx*Math.cos(CAL.ry)-Math.sin(a)*r*CAL.rz*Math.sin(CAL.ry),z=CAL.c[1]+Math.cos(a)*r*CAL.rx*Math.sin(CAL.ry)+Math.sin(a)*r*CAL.rz*Math.cos(CAL.ry);
   const p=KRELIEF.at(CUT,x,z,g0(x,z));if(!p||p.part!=='floor')continue;if(VENTS.some(v=>Math.hypot(v.x-x,v.z-z)<160))continue;
   VENTS.push({id:'vent:caldera:'+k,x,z,pit:'caldera',k:.5+.5*u(k,3),r:14+14*u(k,4)});}
  for(const [nm,R] of [['ne',RIFT_NE],['sw',RIFT_SW]])for(let j=0;j<2;j++){const a=R.pts[0],b=R.pts[1],t=.75+.35*j,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
   VENTS.push({id:'vent:'+nm+':'+j,x,z,pit:nm,k:.35+.25*u(90+j,nm==='ne'?5:6),r:10+6*u(90+j,7)});}}
 const geo=(x,z)=>{let g=0;for(const v of VENTS){const d=Math.hypot(x-v.x,z-v.z);if(d<v.r*3)g=Math.max(g,smooth(v.r*3,v.r*.6,d)*(.6+.4*v.k));}return g;};
 const cinder=(x,z)=>clamp(.55+.6*(KRAND.fbm(x*.004,.5,z*.004,3,99405)-.5),0,1);
 const snowAt=(x,z,h,sl)=>clamp(smooth(.52,.68,KRAND.fbm(x*.003,.5,z*.003,3,99406))*smooth(.45,.2,sl)*(1-smooth(.05,.25,geo(x,z))),0,1);
 const L=chasmLand({R:2600,ground,
  rockAt:(x,z,h,sl)=>smooth(.45,.8,sl),strataK:(x,z,h,sl)=>smooth(.35,.7,sl),
  talus:(x,z)=>{const a=partAt(x,z);return a&&a.part==='floor'?smooth(28,2,a.e==null?28:a.e):0;},
  geo,cinder:(x,z)=>partAt(x,z)?cinder(x,z)*.4:cinder(x,z),snowAt,
  strata:GCH_STRATA({seed:99410}),
  spine:[[0,0],CAL.c,[1250,-1150],[-1000,950],[-1600,-1200],[1600,1400],[2200,-200],[-2200,0]]});
 Object.assign(L,{CAL,CUT,RIFT_NE,RIFT_SW,RC,partAt,pitOf,VENTS,geo,base,g0});return L;})();
const DRAWN_CELL=2600*2.2/720;   /* the ground mesh's cell (45: TERR.R x 2.2 over groundN) */
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'Mount Caelum (loom-chasms station 4)',title:'Krator biome — the Loom-Chasms: Mount Caelum',build_id:'loom-chasms-caelum',
 hint:'Station 4 of the Loom-Chasms: Mount Caelum\'s summit (scale model 5.1 px 1622,1166; 4,431 m, 0.92 atm, ET, -2 degC): the caldera and its fumaroles, the parent colony of the cable spinners across the rift fissures, the chasm net spread out below',
 region:{name:'Mount Caelum (station 4)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.25,
 fog:{falloff:1/1600,sun:.3,sky:.3},climate:{cold:true,dry:true},wet:false,groundN:720,shimmer:false,
 groundLayers:['cinder','lichen','snow','sulphur'],
 plants:['cush','lichen'],
 modelTol:45,sculpt:(x,z)=>!!STATION.partAt(x,z),
 /* nothing roots on the pits' risers and lips, nor a drawn cell from one, nor on a vent's hot ground */
 noRoot:(x,z)=>{if(STATION.geo(x,z)>.15)return true;const e=DRAWN_CELL;for(const o of [[0,0],[e,0],[-e,0],[0,e],[0,-e]]){const a=STATION.partAt(x+o[0],z+o[1]);if(a&&(a.part==='riser'||a.part==='rim'))return true;}return false;},
 farLabel:'Mount Caelum\'s summit, the chasm net east to the Loom and the White Loom, the Cradle\'s fans west (the scale model 5.1)',
 kin:[],
 prebuild:()=>typeof CAELUM!=='undefined'?CAELUM.build():null,
 hazards:()=>typeof CAELUM!=='undefined'?CAELUM.hazards():[],
 hazardMin:10,
 views:H=>typeof CAELUM!=='undefined'?CAELUM.views(H):{'From afar':H.look(-2600,2600,450,0,0,0)},
 checks:add=>{if(typeof CAELUM!=='undefined')CAELUM.checks(add);},
 negatives:add=>{if(typeof CAELUM!=='undefined')CAELUM.negatives(add);},
 probes:{}};
