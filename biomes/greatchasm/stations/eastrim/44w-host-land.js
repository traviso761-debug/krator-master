// ================================================================= HOST — STATION 5, THE EAST RIM (optional; PLAN.md section 7): its land
// The plan pins this station at 1726,888 to 6,850 m (the code's pin: HT, -16 degC (-8/-23), 0 mm, 0.68 atm). THE SURVEY (PLAN.md "The sites as
// drawn") found the pin a HORN, not the rim: the cell stands at 6,850 m, its four neighbours at 6,020-6,030, the four corners at 5,290-5,370, and
// the ring 4 km out at 4,100-4,300, on a bench at 1.9-2.6 km; the true east wall's crest (11-12.3 km, airless) stands 30-40 km farther east. The
// station is the horn AS DRAWN (the model's surface through its cells: a peak with 20-25 degree upper slopes steepening to 40 past 2 km), its
// summit the chasm's best seat: the whole trench below it to the west, the floor 7.9 km down and 70 km off, the wall's crest over it to the east.
// On the model's horn the station sets:
//   THE STRATA     the flood basalt's beds showing on every steep face (KSTRATA chasm-trap, its colonnade and entablature)
//   THE TORS       basalt tors on the summit ridge and its shoulders (KSTACKS), frost-shattered blocks round them
//   THE FROST      rime and firn in the hollows and on the lee (north and east) faces over ~6.2 km (the snow field: no snowfall here, 0 mm; it is
//                  frost and old firn), lichen and cushions on the rock, frost puffs in the fellfield (the high zone)
// Owed (KNOWN_ISSUES.md): the amethyst geodes in the basalt (KCAVERN with KSPELEO.AMETHYST: PLAN.md section 8), the golden bird on the thermals.
const STATION=(function(){
 const ground=(x,z)=>MODEL.h(x,z)+3*(KRAND.fbm(x*.006,.5,z*.006,3,94601)-.5);
 const lee=(x,z)=>{const e=4,hx=MODEL.h(x+e,z)-MODEL.h(x-e,z),hz=MODEL.h(x,z+e)-MODEL.h(x,z-e),l=Math.hypot(hx,hz)||1;return clamp(((-hx/l)*.4+(hz/l)*-.7+.3),0,1);};
 const L=chasmLand({R:2600,ground,
  rockAt:(x,z,h,sl)=>smooth(.42,.75,sl),strataK:(x,z,h,sl)=>smooth(.3,.65,sl),
  talus:(x,z)=>{if(!ROCKS.length)return 0;const f=KSTACKS.foot(ROCKS,x,z);return f?smooth(20,2,f.d):0;},
  snowAt:(x,z,h,sl)=>smooth(6150,6500,h)*smooth(.55,.25,sl)*(.35+.65*lee(x,z))*smooth(.42,.58,KRAND.fbm(x*.01,.5,z*.01,2,94602)),
  pave:(x,z)=>0,
  strata:GCH_STRATA({}),
  spine:[[0,0],[600,-200],[-700,300],[300,900],[-400,-1100],[1500,800],[-1700,-600]]});
 Object.assign(L,{lee});return L;})();
var ROCKS=[];
{const W=94611,u=(i,k)=>KRAND.unit(KRAND.hash(W,i,k,0x54));
 for(let i=0;i<14;i++){const a=u(i,1)*TAU,d=40+1100*u(i,2),x=Math.cos(a)*d,z=Math.sin(a)*d;const sl=Math.hypot(STATION.terrainH(x+8,z)-STATION.terrainH(x-8,z),STATION.terrainH(x,z+8)-STATION.terrainH(x,z-8))/16;
  if(sl>.5||u(i,3)<.25)continue;const y0=Math.min(...[[0,0],[8,0],[-8,0],[0,8],[0,-8]].map(o=>STATION.terrainH(x+o[0],z+o[1])))-1;
  ROCKS.push(KSTACKS.make({id:'rim-tor-'+i,kind:'tor',x,z,y0,seed:W+i,H:4+8*u(i,4),r:4+6*u(i,5),e:1+.5*u(i,6),ry:u(i,7)*6.28}));}}
STATION.ROCK.push(...ROCKS);
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The East Rim (greatchasm station 5)',title:'Krator biome — the Great Chasm: the East Rim',build_id:'greatchasm-eastrim',
 hint:'Station 5 of the Great Chasm (optional): the horn the code pins at 6,850 m on the east side (scale model 5.1 px 1726,888; 0.68 atm, HT, -16 degC mean): the whole trench below, the floor 7.9 km down and 70 km west, the east wall\'s airless crest 30-40 km east',
 region:{name:'The East Rim (station 5)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.08,
 fog:{falloff:1/2400,sun:.25,sky:.25},climate:{cold:true,dry:true},wet:false,groundN:560,shimmer:false,dust:false,
 groundLayers:['lichen','snow','pave','black'],
 plants:['lichen','cush','puff'],
 modelTol:20,
 farLabel:'The Great Chasm from the horn: the trench west, the east wall\'s crest east (the scale model 5.1)',
 kin:[],
 hazards:()=>{const out=[];for(let k=0;k<8;k++){const a=k/8*TAU;let best=null;for(let d=500;d<=2400;d+=100){const x=Math.cos(a)*d,z=Math.sin(a)*d,s=FIELD.slope(x,z);if(!best||s>best.s)best={x,z,s};}
   if(best&&best.s>.55)out.push({name:'The horn\'s steep flank (a fall)',kind:'fall',x:best.x,z:best.z,r:120,h:60,danger:.8,tell:{sign:'the slope steepening past the shoulder, frost on the rock'}});}
  return out.concat(ROCKS.map(B=>({name:'A tor\'s frost-shattered face (rockfall)',kind:'crush',x:B.x,z:B.z,r:B.R*1.3,h:B.top-B.y0+3,danger:.3,tell:{sign:'new blocks on the frost-heaved ground'}})));},
 hazardMin:2,
 views:H=>{const {look}=H,T=ROCKS[0]||{x:200,z:200,R:6,top:6850,y0:6840};
  return{
  'The summit':look(-30,25,1.7,-70000,0,-1500),
  'West over the chasm':look(-500,100,3,-90000,-10000,-2000),
  'East to the wall\'s crest':look(500,-100,3,40000,0,9000),
  'A summit tor':look(T.x+T.R*3,T.z+T.R*2,1.7,T.x,T.z,(T.top-T.y0)*.5),
  'Frost in the lee':look(400,-700,2,700,-1200,-30),
  'North along the trench':look(0,-1400,5,-15000,-100000,-1500),
  'From afar':look(-2900,2900,400,0,0,0)};},
 probes:{}};
