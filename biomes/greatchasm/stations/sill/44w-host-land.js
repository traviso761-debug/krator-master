// ================================================================= HOST — STATION 1, THE SILL (the trade post): its land
// Scale model 5.1 px 1697,1028 (PLAN.md sections 5 and 7; the survey of 2026-11-11 in PLAN.md "The sites as drawn"): 1,695 m, BWk, tm 16 degC
// (23/8), 47 mm, 1.29 atm. The page is the model's own surface (44v: MODEL.h through its 2 km cells): the sill's north-facing ramp, 1,150 m at
// the page's north edge and 1,940 m at its south, the crest (2,040-2,080 m) a kilometre past the south edge; the ground falls to 761 m within
// 8 km north (the one ramp down onto the floor) and rises east toward the east bench (1,786 m 2 km east). On it the station sets:
//   THE POST'S TERRACE  cut and filled level at the site's height (1,695 m) where the three roads meet; the post itself is 86 (its records)
//   THE ROADS           the bench road arriving from the north-east (the east bench, 468 km of it), the Yuni road leaving south-west over the
//                       sill toward Spindle Fan, and the track down the ramp north onto the floor; a worn track (the road field), not a cut
//   THE WADI            a dry channel down the ramp from the sill's lee, its fan spilling at the page's north edge (KRELIEF.wadi)
//   THE DIKES           a row of dike fins east of the post, the harder rock the slope weathered out of (KSTACKS.row: PLAN.md section 2)
//   THE QANAT           its shafts' spoil rings running south up the sill toward the post's cistern (86 draws them; open shafts are pits)
// The far field (83) carries the model on 120 km: the east wall to 11 km, the west wall to 6.5 km, the floor's trough opening north.
const STATION=(function(){
 const PAD={x:0,z:0,y:SITE.h,r:150,feather:110,ex:1,ez:1};
 /* THE CISTERN (PLAN.md section 5: Yuni-built, fed by the qanat): a stone tank cut 3 m into the terrace beside the market court, its water 1.2 m
    under the terrace; the one still on the page (core/water) */
 const CIST={x0:-34,x1:-4,z0:-92,z1:-74,floor:PAD.y-3.2,level:PAD.y-1.3};
 const ROADS=[
  {name:'The bench road (from the east bench)',pts:[[2700,-1700],[1800,-1150],[900,-520],[200,-80]],w:6},
  {name:'The Yuni road (over the sill to Spindle Fan)',pts:[[-150,120],[-700,700],[-1300,1400],[-1800,2100],[-2300,2700]],w:5},
  {name:'The track down the ramp (onto the floor)',pts:[[-60,-150],[-250,-900],[-200,-1700],[-500,-2700]],w:4}];
 const roadD=(x,z)=>{let d=1e9;for(const R of ROADS)d=Math.min(d,nearLine(R.pts,x,z).d/R.w);return d;};
 const base=(x,z)=>MODEL.h(x,z);
 const WADI=KRELIEF.wadi({pts:[[-900,2500],[-1050,1700],[-1250,900],[-1150,100],[-1350,-800],[-1250,-1700],[-1500,-2650]],ground:base,w:9,bank:2.2,bankW:4,braids:2,pools:0,fan:false,seed:94201});
 const g1=(x,z)=>KRELIEF.shape(WADI,x,z,base(x,z));
 function ground(x,z){let h=g1(x,z);h=padTo(h,x,z,PAD);
  if(x>CIST.x0-1&&x<CIST.x1+1&&z>CIST.z0-1&&z<CIST.z1+1){const e=Math.min(x-CIST.x0,CIST.x1-x,z-CIST.z0,CIST.z1-z);h=mix(h,CIST.floor,smooth(-1,.8,e));}
  /* the road's bed: a little worn into the slope (half a metre at its middle), never a cut */
  const rd=roadD(x,z);if(rd<2)h-=.5*smooth(2,0,rd);return h;}
 const PAVE=KRELIEF.pavement({h:ground,ground:base,wadis:[WADI],slope:[.06,.2],seed:94202});
 const wash=(x,z)=>{const a=KRELIEF.at(WADI,x,z,base(x,z));return a&&(a.part==='floor'||a.part==='bar')?1:0;};
 const L=chasmLand({R:2600,ground,lakes:[{name:'The post\'s cistern (fed by the qanat)',kind:'cistern',level:CIST.level,poly:boxPoly(CIST.x0+.4,CIST.z0+.4,CIST.x1-.4,CIST.z1-.4)}],
  rockAt:(x,z,h,sl)=>smooth(.5,.82,sl),strataK:(x,z,h,sl)=>smooth(.4,.75,sl),
  talus:(x,z)=>{if(!ROCKS.length)return 0;const f=KSTACKS.foot(ROCKS,x,z);return f?smooth(40,4,f.d):0;},
  pave:(x,z)=>PAVE(x,z)*smooth(1.5,3,roadD(x,z))*smooth(PAD.r*.9,PAD.r+40,Math.hypot(x,z)),
  wash,road:(x,z)=>Math.max(smooth(1.6,.6,roadD(x,z)),.8*smooth(PAD.r+20,PAD.r-30,Math.hypot(x,z))),
  strata:GCH_STRATA({}),
  spine:[[0,0],[900,-520],[1800,-1150],[-700,700],[-1300,1400],[-250,-900],[-1150,100],[-1250,-1700],[1200,300]]});
 Object.assign(L,{PAD,CIST,ROADS,roadD,WADI,base});return L;})();
// THE DIKES: fins along a strike NNW-SSE, east of the post on the rise toward the bench; each foot under the lowest ground round it
var ROCKS=[];
ROCKS=KSTACKS.row({id:'sill-dikes',seed:94211,a:[1050,-900],b:[1500,1100],n:6,kind:'fin',H:[9,22],r:[5,9],e:[4,6],ground:(x,z)=>STATION.terrainH(x,z)})
 .concat(KSTACKS.row({id:'sill-dikes-w',seed:94212,a:[-2100,-400],b:[-1800,900],n:4,kind:'fin',H:[7,15],r:[4,7],e:[4,5.5],ground:(x,z)=>STATION.terrainH(x,z)}));
STATION.ROCK.push(...ROCKS);
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Sill (greatchasm station 1)',title:'Krator biome — the Great Chasm: the Sill and the trade post',build_id:'greatchasm',
 hint:'Station 1 of the Great Chasm: the sill at its south end (scale model 5.1 px 1697,1028; 1,695 m, 1.29 atm, BWk), where the bench road, the Yuni road and the track down onto the floor meet at the trade post (name TBD), the Yuni half and the Coyote half side by side',
 region:{name:'The Sill (station 1)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.12,
 fog:{falloff:1/1100,sun:.3,sky:.3},climate:{cold:false,dry:true},wet:false,groundN:560,
 groundLayers:['pave','steppe','wadi','lichen'],
 plants:['needle','cush','pebble','rosette','grass','sac'],
 modelTol:40,sculpt:(x,z)=>Math.hypot(x,z)<STATION.PAD.r+STATION.PAD.feather,
 farLabel:'The Great Chasm north of the sill, the Loom-Chasms\' plateau south (the scale model 5.1)',
 /* the neighbours' trees, read in place (station.json): the eastern badlands' alien needle bloom in the wadi, as the stand-in for the Loom-Chasms'
    and the Outlands' wadi trees (neither kit is built: PLAN.md section 4) */
 kin:[{ref:'ebadlands.needlebloom',key:'needlebloom',name:'Needle bloom (the eastern badlands\', read in place)',cell:50,minR:3,accept:Z=>Z.wadi*.5+Z.desert*.02*Z.gentle}],
 /* the export's box: the post's terrace, its cistern (the water) and the market court; no tree there, so no bucket (the kit has no trees of its own) */
 exportBox:[-150,-150,150,150],exportProfile:['registry','items','materials','textures','terrain','stage','atmos','hazards','water'],
 prebuild:()=>typeof POST!=='undefined'?POST.build():null,
 hazards:()=>(typeof POST!=='undefined'?POST.hazards():[]).concat(ROCKS.map((B,i)=>({name:'Rockfall under a dike fin',kind:'crush',x:B.x,z:B.z,r:Math.max(8,B.R*1.2),h:B.top-B.y0+4,danger:.4,
  tell:{sign:'fresh spalls at the fin\'s foot'}}))),
 hazardMin:4,
 views:H=>{const {look,gh,solidH}=H,P=STATION.PAD,R0=STATION.ROADS[0].pts,R1=STATION.ROADS[1].pts;
  return{
  'The post from the bench road':look(R0[1][0],R0[1][1],3,0,0,8),
  'The serai\'s gate':look(-40,-150,1.7,-40,-40,6),
  'The market court and its line of stones':look(70,-95,8,40,10,1),
  'The Coyote rooms over the court':look(30,-150,4,95,40,8),
  'Down the ramp to the floor':look(-250,-950,4,-300,-2600,-250),
  'The Yuni road over the sill':look(-300,330,2.5,R1[3][0],R1[3][1],10),
  'The chasm from the sill':look(-600,1700,30,-200,-2600,-200),
  'The dike fins':look(700,-300,2,1250,-150,12),
  'From afar':look(-2900,-2900,600,0,0,0)};},
 probes:{}};
