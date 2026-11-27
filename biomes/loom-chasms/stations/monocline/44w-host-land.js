// ================================================================= HOST — STATION 2, THE WEAVE-STEP: its land
// The plan's site is 1575,1163 (1,479 m, "on a step; 978-1,900 m within 3 px"). THE SURVEY (PLAN.md 7b, 2026-11-11): the model draws the monocline's
// ramp falling east across the page, 1,740 m at its west edge, 1,479 m at the site, 1,236 m at its east edge (about 6%), and a box canyon opening
// east-south-east past it (993 m 6 km out, 723 m 14 km out, the Csa cells of its sheltered floor); the seasonal wadi Loua Swifta Guli (r609) runs
// east 3 km north of the site, off the page. BSk, tm 15 degC (26/5), 125 mm, 1.33 atm. On the model's surface the station sets:
//   THE BENCHES       the flood basalt weathered into steps across the ramp (KRELIEF.terraces as basalt benches: 22 m risers that stand near
//                     sheer, treads 300-400 m wide on the 6% ramp, the levels wandering): the "Weave-Step" of the Yuni road
//   THE BOX CANYONS   two cut into the benches from the east (KRELIEF.gully, flat `yuan` tops: sheer walls, amphitheatre heads where the
//                     benches' seeps break out), their floors never climbing downstream; they fall to the canyon past the page
//   THE TALUS SKIRTS  broken basalt at the foot of every riser and every canyon wall (the talus field: the ground's scree layer)
//   THE ROAD          the Yuni road from the Cradle down to the chasms and Mungo (PLAN.md section 5: south-west to north-east across the Loom),
//                     east-north-east across the page between the canyons, through a notch it has worn in each bench's riser
//   THE WAYSTATION    a fortified Yuni waystation on a levelled pad beside the road (records first, drawn as pending stand-ins: 86)
const STATION=(function(){
 const base=(x,z)=>MODEL.h(x,z);
 const g0=(x,z)=>base(x,z)+1.5*(KRAND.fbm(x*.006,.5,z*.006,3,99201)-.5);
 // the road: its line, and its worn corridor (the benches give way to the ramp along it: the notches)
 const ROAD={name:'The Yuni road (the Cradle to the chasms and Mungo)',pts:[[-2700,520],[-1700,330],[-800,120],[0,-120],[900,-430],[1800,-760],[2700,-1050]],w:6};
 const roadD=(x,z)=>nearLine(ROAD.pts,x,z).d;
 // the waystation's pad, north of the road (a level tread cut and filled to one height)
 const PAD={x:-420,z:-115,r:62,fade:30};PAD.y=g0(PAD.x,PAD.z);
 // the benches: on the whole ramp, eased out along the road (the notch: 14 m of ramp each side, faded over 30 m more) and under the pad
 const TER=KRELIEF.terraces({rise:22,riser:.06,bund:0,field:4000,wobble:.18,fill:.5,fade:150,
  zone:{poly:[[-2900,-2900],[2900,-2900],[2900,2900],[-2900,2900]]},seed:99210});
 const notch=(x,z)=>Math.max(1-smooth(14,44,roadD(x,z)),smooth(PAD.r+PAD.fade,PAD.r,Math.hypot(x-PAD.x,z-PAD.z)));
 const g1=(x,z)=>{const g=g0(x,z),t=KRELIEF.shape(TER,x,z,g);return mix(t,g,notch(x,z));};
 // the box canyons, cut into the benches (their floors from the benched ground): one south of the road, one north
 const GU=[KRELIEF.gully({pts:[[-900,1350],[-100,1150],[800,1250],[1700,1500],[2800,1700]],ground:g1,depth:120,w:16,tops:'yuan',branches:1.6,blen:[160,420],orders:1,head:2.2,wall:.12,seed:99220}),
  KRELIEF.gully({pts:[[-300,-1500],[600,-1650],[1500,-1800],[2800,-2000]],ground:g1,depth:95,w:14,tops:'yuan',branches:1.4,blen:[140,360],orders:1,head:2.1,wall:.12,seed:99221})];
 const guAt=(x,z)=>{for(const G of GU){const a=KRELIEF.at(G,x,z,g1(x,z));if(a&&a.part!=='yuan')return a;}return null;};
 function ground(x,z){let h=g1(x,z);for(const G of GU)h=KRELIEF.shape(G,x,z,h);
  const rd=roadD(x,z);if(rd<ROAD.w)h-=.35*smooth(ROAD.w,0,rd);
  const dp=Math.hypot(x-PAD.x,z-PAD.z);if(dp<PAD.r+PAD.fade)h=mix(PAD.y,h,smooth(PAD.r,PAD.r+PAD.fade,dp));
  return h;}
 const terAt=(x,z)=>notch(x,z)>.5?null:KRELIEF.at(TER,x,z,g0(x,z));
 /* the talus skirts: a tread within 30 m below a riser (sampled across the fall line), a gully floor near its wall */
 function talus(x,z){const g=guAt(x,z);if(g){if(g.part==='floor'||g.part==='head')return smooth(-16,-2,g.e==null?-16:g.e);return 0;}   /* the scree along the walls' feet */
  const a=terAt(x,z);if(!a||a.part!=='tread')return 0;const e=12,gx=g0(x+e,z)-g0(x-e,z),gz=g0(x,z+e)-g0(x,z-e),l=Math.hypot(gx,gz)||1;
  for(const d of [8,18,30]){const b=terAt(x+gx/l*d,z+gz/l*d);if(b&&b.part==='riser')return smooth(34,6,d);}return 0;}
 const PAVE=KRELIEF.pavement({h:ground,ground:base,slope:[.05,.16],patch:.7,seed:99230});
 const L=chasmLand({R:2600,ground,
  rockAt:(x,z,h,sl)=>smooth(.45,.8,sl),strataK:(x,z,h,sl)=>smooth(.35,.7,sl),
  talus,road:(x,z)=>smooth(ROAD.w*1.1,ROAD.w*.4,roadD(x,z)),
  wash:(x,z)=>{const g=guAt(x,z);return g&&(g.part==='floor'||g.part==='head')?smooth(-2,-8,g.e==null?0:g.e):0;},   /* the canyons' floors (e is negative inside: m in from the edge): the runoff soaks in there */
  pave:(x,z)=>(guAt(x,z)||talus(x,z)>.3)?0:PAVE(x,z)*.8,
  strata:GCH_STRATA({seed:99240}),
  spine:[[0,0],[PAD.x,PAD.z],[-800,120],[900,-430],[-100,1150],[600,-1650],[-1800,-1200],[-1600,1700],[2000,300]]});
 Object.assign(L,{ROAD,roadD,PAD,TER,terAt,GU,guAt,g0,g1,base,talusAt:talus,notch});return L;})();
const DRAWN_CELL=2600*2.2/640;   /* the ground mesh's cell (45: TERR.R x 2.2 over groundN) */
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Weave-Step (loom-chasms station 2)',title:'Krator biome — the Loom-Chasms: the Weave-Step',build_id:'loom-chasms-monocline',
 hint:'Station 2 of the Loom-Chasms: the Weave-Step (scale model 5.1 px 1575,1163; 1,479 m, 1.33 atm, BSk, 125 mm): the monocline\'s stepped basalt benches falling east, two box canyons cut into them, talus skirting the risers, a fortified Yuni waystation on the road down to the chasms',
 region:{name:'The Weave-Step (station 2)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.2,
 fog:{falloff:1/1200,sun:.3,sky:.3},climate:{cold:false,dry:true},wet:false,groundN:640,shimmer:false,
 groundLayers:['pave','steppe','wadi','lichen'],
 plants:['needle','cush','pebble','rosette','grass','sac'],
 modelTol:40,sculpt:(x,z)=>!!STATION.guAt(x,z),
 /* nothing roots on a riser or a canyon's wall, nor a drawn cell from one (the drawn triangle bridges the drop there), nor on the road and the pad */
 noRoot:(x,z)=>{if(STATION.roadD(x,z)<STATION.ROAD.w*1.2||Math.hypot(x-STATION.PAD.x,z-STATION.PAD.z)<STATION.PAD.r+4)return true;
  const e=DRAWN_CELL;for(const o of [[0,0],[e,0],[-e,0],[0,e],[0,-e]]){const g=STATION.guAt(x+o[0],z+o[1]);if(g&&(g.part==='wall'||g.part==='rim'))return true;
   const a=STATION.terAt(x+o[0],z+o[1]);if(a&&a.part==='riser')return true;}return false;},
 farLabel:'The Weave-Step\'s benches and box canyons, the Cradle\'s fans west, the chasm net east (the scale model 5.1)',
 kin:[],
 prebuild:()=>typeof STEP!=='undefined'?STEP.build():null,
 hazards:()=>typeof STEP!=='undefined'?STEP.hazards():[],
 hazardMin:6,
 views:H=>typeof STEP!=='undefined'?STEP.views(H):{'From afar':H.look(-2600,2600,450,0,0,0)},
 checks:add=>{if(typeof STEP!=='undefined')STEP.checks(add);},
 negatives:add=>{if(typeof STEP!=='undefined')STEP.negatives(add);},
 probes:{}};
