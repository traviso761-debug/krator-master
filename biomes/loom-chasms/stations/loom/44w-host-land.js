// ================================================================= HOST — STATION 3, THE LOOM: its land
// The plan's site is 1662,1162 (748 m, "on a mesa's shoulder"). THE SURVEY (PLAN.md section 7b, 2026-11-11) found it mid-wall: the model's 2 km cells
// draw the mesa's west wall as a ramp from the floor at 270 m (x 1659) to the mesa top at 1,520-1,610 m (x 1665), and the plan's slot "on the mesa
// rim" lies 4 km east of that site. The station stands at 1664,1161 (1,488 m, BWk, tm 15 degC (26/5), 78 mm, 1.30 atm): the rim crosses the page's
// west half, the wall falling west from it (1,140-1,195 m at the page's west edge, 720 m 4 km past it, the floor at 270-490 m 8-12 km out), the mesa
// top filling the east (1,470-1,610 m). On the model's surface the station sets:
//   THE SLOT   a tension fissure on the mesa top, parallel to the rim (NNE-SSW, the warp chasms' strike), 230 m across at its lips and 180 m deep, with
//              sheer stepped walls (KRELIEF.stepcut: two risers and a tread), pinching out at both ends over its last 700 m (the
//              chasm head: stepcut's `head`, PLAN.md section 8, item 1); runoff gathers on its floor (the wash field: cobble, the Great Chasm's wadi plants)
//   THE CABLES the canopy across it (86-host-slot.js: the anchors found by rays at the drawn walls, the records, then the kit's builders)
// The far field (83) carries the model on 120 km: the chasm floor west, Mount Caelum 84 km west (4,431 m), the airless east rim 150 km east.
const STATION=(function(){
 const base=(x,z)=>MODEL.h(x,z);
 /* the slot's line: its south and north ends on the mesa top, 4 km long */
 const SLOT={pts:[[700,2000],[1000,600],[1250,-700],[1500,-2000]],w:70,depth:180,steps:2,tread:40};
 const CUT=KRELIEF.stepcut({line:{pts:SLOT.pts,w:SLOT.w},depth:SLOT.depth,steps:SLOT.steps,tread:SLOT.tread,riser:2,rim:1.2,warp:{amp:14,scale:1/260},head:{len:700,minW:.3},seed:99301});
 const g0=(x,z)=>base(x,z)+1.2*(KRAND.fbm(x*.008,.5,z*.008,3,99302)-.5);
 const ground=(x,z)=>KRELIEF.shape(CUT,x,z,g0(x,z));
 const partAt=(x,z)=>KRELIEF.at(CUT,x,z,g0(x,z));
 const PAVE=KRELIEF.pavement({h:ground,slope:[.05,.16],seed:99303});
 const L=chasmLand({R:2600,ground,
  rockAt:(x,z,h,sl)=>smooth(.45,.8,sl),strataK:(x,z,h,sl)=>smooth(.35,.7,sl),
  talus:(x,z)=>{const a=partAt(x,z);return a&&a.part==='floor'?smooth(30,2,a.e==null?30:a.e):0;},
  wash:(x,z)=>{const a=partAt(x,z);return a&&a.part==='floor'?smooth(8,24,a.e==null?0:a.e):0;},
  pave:(x,z)=>partAt(x,z)?0:PAVE(x,z),
  strata:GCH_STRATA({seed:99310}),
  spine:[[0,0],[1000,600],[1250,-700],[1500,-2000],[700,2000],[-600,-200],[-1800,300],[2200,1200]]});
 Object.assign(L,{SLOT,CUT,partAt,base,g0});return L;})();
const DRAWN_CELL=2600*2.2/720;   /* the ground mesh's cell (45: TERR.R x 2.2 over groundN) */
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Loom (loom-chasms station 3)',title:'Krator biome — the Loom-Chasms: the Loom',build_id:'loom-chasms',
 hint:'Station 3 of the Loom-Chasms: a slot on a Shuttle Mesa\'s rim (scale model 5.1 px 1664,1161; 1,488 m, 1.30 atm, BWk), the living cables across it in tiers, pioneer shoots arching on their bladders, the great chasm opening below the rim to the west',
 region:{name:'The Loom (station 3)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.15,
 fog:{falloff:1/1100,sun:.3,sky:.3},climate:{cold:false,dry:true},wet:false,groundN:720,shimmer:false,
 groundLayers:['pave','steppe','wadi','lichen'],
 plants:['needle','cush','pebble','rosette','grass','sac'],
 modelTol:40,sculpt:(x,z)=>!!STATION.partAt(x,z),
 /* nothing roots on the slot's risers and lips (the sheer faces: terrainH and the drawn triangles part there; the wall curtains are seated by rays, 86) */
 noRoot:(x,z)=>{const a=STATION.partAt(x,z);if(!a){const e=DRAWN_CELL;for(const o of [[e,0],[-e,0],[0,e],[0,-e]]){const b=STATION.partAt(x+o[0],z+o[1]);if(b&&(b.part==='riser'||b.part==='rim'))return true;}return false;}   /* outside: a cell from the lip */
 if(a.part==='riser'||a.part==='rim')return true;   /* a cell's width round every riser: the drawn triangle bridges the drop */
  const C=STATION.CUT,e=a.e;let at=0;for(let i=0;i<C.drops.length;i++){if(Math.abs(e-at)<DRAWN_CELL+1||Math.abs(e-(at+C.riser))<DRAWN_CELL+1)return true;at+=C.riser+(i<C.treads.length?C.treads[i]:0);}return false;},
 farLabel:'The Shuttle Mesas and the chasm net, Mount Caelum to the west (the scale model 5.1)',
 kin:[],
 prebuild:()=>typeof SLOT_SITE!=='undefined'?SLOT_SITE.build():null,
 hazards:()=>typeof SLOT_SITE!=='undefined'?SLOT_SITE.hazards():[],
 hazardMin:6,
 views:H=>{const {look,anyH}=H,S=typeof SLOT_SITE!=='undefined'?SLOT_SITE:null;return S?S.views(H):{'From afar':look(-2600,2600,500,0,0,0)};},
 checks:add=>{if(typeof SLOT_SITE!=='undefined')SLOT_SITE.checks(add);},
 negatives:add=>{if(typeof SLOT_SITE!=='undefined')SLOT_SITE.negatives(add);},
 probes:{}};
