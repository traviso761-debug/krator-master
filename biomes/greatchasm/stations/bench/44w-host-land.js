// ================================================================= HOST — STATION 2, THE LONG BENCH: its land
// The plan pins this station at 1708,935 (1,640 m: the code's pin). THE SURVEY (PLAN.md "The sites as drawn", 2026-11-11) found that pin a lone
// knob: a 2 km cell at 1,640 m whose neighbours stand 300-1,000 m lower, on the ramp between the floor and the bench. The east bench itself runs
// at x 1716-1733: here, at 1718,924 (1,750 m, BWk, tm 16 degC (24/9), 47 mm, 1.29 atm), it slopes gently west from 1.9 km to its lip at the
// page's west edge (1,511 m at 1716), where the ramp falls 1.4 km over 10 km to the floor at -0.6 km (the model smears the lip's scarp into a
// ramp of 7 degrees: the station keeps the drawn heights, it does not invent the scarp). The knob of the pin stands 22 km west-south-west in the
// far field. Its cells carry the code's dike ribs (dike_rib_gc): 100-250 m swells along a NNW-SSE strike. On the model's bench the station sets:
//   THE DIKES       rows of dike fins along the strike, the harder rock the bench weathered out of (KSTACKS.row: PLAN.md section 2), talus at
//                   their feet
//   THE ROAD        the bench road (468 km of it on the benches), along the strike on the bench's back, worn into the pavement; a Coyote
//                   milestone in contour carving (this is the road's north half, Hum country: PLAN.md section 5) where it passes the fins
//   THE NIGHT CAMP  a caravan's camp in the lee of the biggest fin (PLAN.md section 7: core/camp's records are owed: here as pending stand-ins)
//   THE PAVEMENT    on the bench's flats (KRELIEF.pavement); a dry wadi from the east down to the lip
const STATION=(function(){
 const base=(x,z)=>MODEL.h(x,z);
 const ROAD={name:'The bench road',pts:[[600,-2900],[350,-1800],[150,-800],[200,200],[50,1300],[-150,2400],[-250,2950]],w:5};
 const roadD=(x,z)=>nearLine(ROAD.pts,x,z).d/ROAD.w;
 const WADI=KRELIEF.wadi({pts:[[2900,-600],[2100,-450],[1300,-150],[700,100],[-300,300],[-1300,550],[-2700,700]],ground:base,w:7,bank:1.8,bankW:4,braids:2,pools:0,fan:false,seed:94401});
 const g1=(x,z)=>KRELIEF.shape(WADI,x,z,base(x,z));
 function ground(x,z){let h=g1(x,z);const rd=roadD(x,z);if(rd<2)h-=.4*smooth(2,0,rd);return h;}
 const PAVE=KRELIEF.pavement({h:ground,ground:base,wadis:[WADI],slope:[.05,.18],seed:94402});
 const wash=(x,z)=>{const a=KRELIEF.at(WADI,x,z,base(x,z));return a&&(a.part==='floor'||a.part==='bar')?1:0;};
 const L=chasmLand({R:2600,ground,
  rockAt:(x,z,h,sl)=>smooth(.5,.82,sl),strataK:(x,z,h,sl)=>smooth(.4,.75,sl),
  talus:(x,z)=>{if(!ROCKS.length)return 0;const f=KSTACKS.foot(ROCKS,x,z);return f?smooth(36,3,f.d):0;},
  pave:(x,z)=>PAVE(x,z)*smooth(1.5,3,roadD(x,z)),wash,road:(x,z)=>smooth(1.6,.6,roadD(x,z)),
  strata:GCH_STRATA({}),
  spine:[[0,0],[350,-1800],[150,-800],[50,1300],[-150,2400],[-1600,600],[1500,-200],[-1100,-1300]]});
 Object.assign(L,{ROAD,roadD,WADI,base});return L;})();
// THE DIKES: three rows on the strike (NNW-SSE, the trench's axis), the middle one the longest; each foot set under the lowest ground round it
var ROCKS=[];
{const G=(x,z)=>STATION.terrainH(x,z);
 ROCKS=KSTACKS.row({id:'bench-dike-a',seed:94411,a:[-700,-2500],b:[-150,2300],n:9,kind:'fin',H:[10,26],r:[6,11],e:[4.5,6.5],ground:G})
  .concat(KSTACKS.row({id:'bench-dike-b',seed:94412,a:[900,-2300],b:[1300,800],n:6,kind:'fin',H:[8,18],r:[5,8],e:[4,6],ground:G}))
  .concat(KSTACKS.row({id:'bench-dike-c',seed:94413,a:[-2300,-1500],b:[-1900,1200],n:5,kind:'fin',H:[6,14],r:[4,7],e:[4,5.5],ground:G}));
 ROCKS=ROCKS.filter(B=>STATION.roadD(B.x,B.z)>B.R/STATION.ROAD.w+3);}   /* the road keeps a gap in the dike where it passes */
STATION.ROCK.push(...ROCKS);
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
// THE CAMP and THE MILESTONE: records first (pending stand-ins: core/camp's camp records and kits/coyote's carved stone are owed), registered before
// they are drawn (89z: LAND.prebuild); the camp in the lee (east: the wind runs up the trench from the hot floor in the afternoon) of the tallest fin
const BENCH_SITE=(function(){const big=ROCKS.slice().sort((a,b)=>(b.top-b.y0)-(a.top-a.y0))[0]||{x:-400,z:0,R:10};
 const cx=big.x+big.R+28,cz=big.z+6,y=terrainH(cx,cz),R=[];
 for(let k=0;k<6;k++){const a=k/6*TAU+.3;R.push({id:'camp:tent-'+k,name:'A caravan\'s tent (the night camp: core/camp owed)',kind:'tent',x:cx+Math.cos(a)*11,z:cz+Math.sin(a)*11,w:4,d:3,h:2.2});}
 R.push({id:'camp:hearth',name:'The camp\'s hearth',kind:'hearth',x:cx,z:cz,w:1.6,d:1.6,h:.4});
 for(let k=0;k<5;k++){const a=k/5*TAU+1.1;R.push({id:'camp:load-'+k,name:'A pack load (the caravan\'s goods)',kind:'load',x:cx+Math.cos(a)*20,z:cz+Math.sin(a)*20,w:1.4,d:1,h:1});}
 const m=nearLine(STATION.ROAD.pts,big.x,big.z),a=STATION.ROAD.pts[m.i],b=STATION.ROAD.pts[m.i+1],mx=a[0]+(b[0]-a[0])*m.u+9,mz=a[1]+(b[1]-a[1])*m.u;
 R.push({id:'road:milestone',name:'A Coyote milestone (contour-carved: the Hum; kits/coyote owed)',kind:'milestone',x:mx,z:mz,w:.8,d:.6,h:2.1});
 R.forEach(r=>{r.y=terrainH(r.x,r.z);r.pending=true;});
 const MAT={tent:0xa88a64,hearth:0x3a302a,load:0x7a5a3e,milestone:0x6e6862},acc={};
 function build(){const geo=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),cone=new THREE.ConeGeometry(.5,1,6).translate(0,.5,0);
  R.forEach(r=>{const y0=Math.min(terrainH(r.x+r.w*.4,r.z),terrainH(r.x-r.w*.4,r.z),terrainH(r.x,r.z+r.d*.4),terrainH(r.x,r.z-r.d*.4),r.y)-.3;r.regY=y0;
   REGISTER({name:r.name,key:r.id,x:r.x,z:r.z,y:y0,r:Math.max(1,Math.hypot(r.w,r.d)*.5),h:r.y+r.h-y0+1,tags:{pending:true,culture:r.kind==='milestone'?'coyote':'caravan',settlement:'bench-camp'}});
   const me=new THREE.Mesh(r.kind==='tent'?cone:geo,new THREE.MeshLambertMaterial({color:MAT[r.kind]}));me.position.set(r.x,y0,r.z);me.scale.set(r.w,r.y+r.h-y0,r.d);
   me.rotation.y=Math.atan2(r.x-cx,r.z-cz);me.userData.host=true;me.userData.post=true;me.userData.inspectLabel=r.name;scene.add(me);});return{records:R.length};}
 return{R,build,cx,cz,big};})();
const LAND={name:'The Long Bench (greatchasm station 2)',title:'Krator biome — the Great Chasm: the Long Bench',build_id:'greatchasm-bench',
 hint:'Station 2 of the Great Chasm: the east bench at 1,750 m (scale model 5.1 px 1718,924; 1.29 atm, BWk), the bench road among the dike fins, a caravan\'s night camp, the ramp falling west to the Deep and the east wall rising to 11 km 40 km off',
 region:{name:'The Long Bench (station 2)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.12,
 fog:{falloff:1/1100,sun:.3,sky:.3},climate:{cold:false,dry:true},wet:false,groundN:560,shimmer:false,
 groundLayers:['pave','steppe','wadi','lichen'],
 plants:['needle','cush','pebble','rosette','ember','grass','sac'],
 modelTol:40,
 farLabel:'The Great Chasm from the east bench: the floor west, the east wall rising to 11 km (the scale model 5.1)',
 /* the eastern badlands' alien needle bloom, read in place (its stilt pod's tendrils float 2.3-2.6 m off it here: the attach audit, KNOWN_ISSUES.md): the stand-ins for the Outlands' bench trees (PLAN.md section 4: the
    Outlands kit is not built); thin, in the dikes' lee and the wadi */
 kin:[{ref:'ebadlands.needlebloom',key:'needlebloom',name:'Needle bloom (the eastern badlands\', read in place)',cell:60,minR:3,accept:Z=>Z.desert*.05*Z.gentle+Z.wadi*.2}],
 prebuild:()=>BENCH_SITE.build(),
 hazards:()=>ROCKS.map(B=>({name:'Rockfall under a dike fin',kind:'crush',x:B.x,z:B.z,r:Math.max(8,B.R*1.2),h:B.top-B.y0+4,danger:.4,tell:{sign:'fresh spalls at the fin\'s foot'}})),
 hazardMin:6,
 views:H=>{const {look}=H,B=BENCH_SITE.big,R=STATION.ROAD.pts;
  return{
  'The bench road':look(R[2][0]+8,R[2][1],1.7,R[3][0],R[3][1],2),
  'Among the dike fins':look(B.x-B.R*3,B.z-30,2,B.x,B.z,(B.top-B.y0)*.5),
  'The night camp':look(BENCH_SITE.cx+34,BENCH_SITE.cz+22,2.5,BENCH_SITE.cx,BENCH_SITE.cz,1),
  'Over the lip to the Deep':look(-2200,300,5,-30000,0,-1500),
  'The east wall':look(1400,0,3,45000,-5000,8000),
  'Down the bench (south)':look(-150,-1600,6,-400,6000,40),
  'From afar':look(2900,2900,500,0,0,0)};}};
