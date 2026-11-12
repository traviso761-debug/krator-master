// ================================================================= HOST — STATION 5, THE WHITE LOOM: its land
// The plan's site, about 1697,1176 (Lake Nim's shore at 243 m). THE SURVEY (PLAN.md 7b, 2026-11-12): the model's Lake Nim (124 cells, about 500 km2,
// level 240 m, bed 218 m, class WX) reaches the page's west edge, the shore near x 1695.5-1696.5; the playa rises east from 240 m to 250 m at the
// page's east edge (XS, tm 24 degC (35/13), 47 mm, 1.55 atm), under the scarp that climbs to 340-460 m 8 km east. On the model's surface the station sets:
//   LAKE NIM         its water at 240 m over the page's west (a still, the `brine` look): hypersaline and shallow at its shore
//   THE PLAYA        the halite crust over the flats from the shore to 247 m (the salt field: the crust and its polygons, the ground's salt layers),
//                    thinning onto the desert pavement of the rising ground east
//   THE BRINE POOLS  pools in hollows under the crust (KRAND by index on the playa), each a still at its own level just under the crust, ringed by
//                    the mats (the geo field's paint: the Danakil's yellows and ochres), the crust round them thin over brine (a `sink` hazard)
//   THE CAMP         a salt-cutters' camp on the flat by the shore, and the halite sifters at the biggest pool (86)
const STATION=(function(){
 const base=(x,z)=>MODEL.h(x,z),W=99500,LEVEL=240;
 const g0=(x,z)=>base(x,z)+.25*(KRAND.fbm(x*.01,.5,z*.01,3,99501)-.5);
 /* THE POOLS: candidates by index, kept on the open playa (241-246 m, flat, 250 m apart and 300 m from the lake) */
 const POOLS=[];{const u=(k,q)=>KRAND.unit(KRAND.hash(W,k,q,0x51));
  for(let k=0;POOLS.length<7&&k<400;k++){const x=-2300+4600*u(k,1),z=-2300+4600*u(k,2),h=base(x,z);if(h<241||h>246)continue;
   let near=false;for(let a=0;a<8&&!near;a++){const q=a/8*Math.PI*2;if(base(x+Math.cos(q)*300,z+Math.sin(q)*300)<LEVEL)near=true;}if(near)continue;
   if(POOLS.some(p=>Math.hypot(p.x-x,p.z-z)<250))continue;const r=14+22*u(k,3);
   POOLS.push({id:'pool:'+k,x,z,r,level:g0(x,z)-.15,depth:1+1.4*u(k,4)});}}
 const poolAt=(x,z)=>{let best=null;for(const p of POOLS){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r*2.4&&(!best||d/p.r<best.d/best.p.r))best={p,d};}return best;};
 function ground(x,z){let h=g0(x,z);const q=poolAt(x,z);if(q){const p=q.p,d=q.d;
   if(d<p.r*1.6)h=mix(Math.min(h,p.level-p.depth*smooth(p.r,p.r*.35,d)-(d<p.r?.12:0)),h,smooth(p.r*1.1,p.r*1.6,d));}   /* the pool's bowl under its level, its rim at the crust */
  return h;}
 /* the salt crust: the flats from the shore to 247 m, its edge wandering; the mats round the pools (geo); the pavement on the rising ground */
 const salt=(x,z)=>{const h=g0(x,z);return clamp(smooth(247.5,245.5,h+1.2*(KRAND.fbm(x*.004,.5,z*.004,3,99502)-.5))*smooth(LEVEL-.2,LEVEL+.4,h),0,1);};
 const mats=(x,z)=>{const q=poolAt(x,z);if(!q)return 0;return smooth(q.p.r*2.1,q.p.r*1.05,q.d)*smooth(q.p.r*.9,q.p.r*1.02,q.d)*(.75+.25*KRAND.fbm(x*.08,.5,z*.08,2,99503));};
 /* the lake's outline: everything west of the shore, the still drawn at its level (the ground shows where it stands above it) */
 let shoreX=-2900;for(let z=-2900;z<=2900;z+=100){for(let x=-2900;x<2900;x+=25){if(base(x,z)>LEVEL+.6){shoreX=Math.max(shoreX,x);break;}}}
 const LAKE_POLY=[[-3100,-3100],[shoreX+150,-3100],[shoreX+150,3100],[-3100,3100]];
 const CAMP={x:-700,z:-650};CAMP.y=g0(CAMP.x,CAMP.z);
 const L=chasmLand({R:2600,ground,
  lakes:[{name:'Lake Nim (hypersaline)',kind:'brine',level:LEVEL,poly:LAKE_POLY}].concat(POOLS.map(p=>({name:'A brine pool (under the crust)',kind:'brine',level:p.level,poly:discPolyL(p.x,p.z,p.r,32)}))),
  rockAt:(x,z,h,sl)=>smooth(.45,.8,sl),strataK:(x,z,h,sl)=>smooth(.35,.7,sl),
  salt,geo:mats,pave:(x,z)=>(1-salt(x,z))*smooth(244,248,g0(x,z))*.8,
  strata:GCH_STRATA({seed:99510}),
  spine:[[0,0],[CAMP.x,CAMP.z]].concat(POOLS.map(p=>[p.x,p.z])).concat([[-1800,-1200],[1800,1400],[2200,-1600],[-2000,1800]])});
 Object.assign(L,{POOLS,poolAt,LEVEL,LAKE_POLY,shoreX,CAMP,salt,mats,base,g0});return L;})();
const DRAWN_CELL=2600*2.2/720;   /* the ground mesh's cell (45: TERR.R x 2.2 over groundN) */
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The White Loom (loom-chasms station 5)',title:'Krator biome — the Loom-Chasms: the White Loom',build_id:'loom-chasms-whiteloom',
 hint:'Station 5 of the Loom-Chasms: the White Loom (scale model 5.1 px 1697,1176; Lake Nim\'s shore at 243 m, 1.55 atm, XS, 24 degC, 47 mm): the halite playa and its crust over brine, the brine pools and their mats, the halite sifters at a pool, a salt-cutters\' camp',
 region:{name:'The White Loom (station 5)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.08,
 fog:{falloff:1/1500,sun:.35,sky:.3},climate:{cold:false,dry:true},wet:false,groundN:720,shimmer:true,
 groundLayers:['salt','efflo','pave','sulphur'],
 plants:['needle','pebble'],   /* the Great Chasm kit's desert set on the rising ground; its salt tufts are keyed to the Deep's floor and do not place here (the playa's halophytes are owed: KNOWN_ISSUES.md) */
 modelTol:12,sculpt:(x,z)=>!!STATION.poolAt(x,z)&&STATION.poolAt(x,z).d<STATION.poolAt(x,z).p.r*1.6,
 /* nothing roots in a pool or its mats, nor on the camp's ground */
 noRoot:(x,z)=>{const q=STATION.poolAt(x,z);if(q&&q.d<q.p.r*2.1)return true;return Math.hypot(x-STATION.CAMP.x,z-STATION.CAMP.z)<55;},
 farLabel:'The White Loom: Lake Nim west, the scarp east, Mount Caelum far west (the scale model 5.1)',
 kin:[],
 prebuild:()=>typeof NIM!=='undefined'?NIM.build():null,
 hazards:()=>typeof NIM!=='undefined'?NIM.hazards():[],
 hazardMin:8,
 views:H=>typeof NIM!=='undefined'?NIM.views(H):{'From afar':H.look(2600,2600,400,0,0,0)},
 checks:add=>{if(typeof NIM!=='undefined')NIM.checks(add);},
 negatives:add=>{if(typeof NIM!=='undefined')NIM.negatives(add);},
 probes:{}};
