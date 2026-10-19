// prefix: res
// ================================================================= RESOURCE FIELDS: the area resources, and the rule a works takes from them
// core/hamlet/PLAN.md section 2. Beside the ore nodes (42r-res-ore.js, a point each), a FIELD is an area: a salt pan, a
// pasture, a fishing ground, farmland. Its ground comes from the biome kits' `gather` tag (core/hamlet 12-hamlet-gather.js
// KHAMLET.fieldCapacity: km2 of full-weight ground), so a field is placed where the biome says the thing is. Fields do not
// run out (owner, 2026-10-18, as the nodes): the capacity caps how many can work one, not a stock that drains. Plain data
// and a pure rule (no three.js, no page), read in place by building kits and core/hamlet, and by Godot.
//   RES_FIELD.kinds   per kind: its item, its name, the works that takes it, and the gather key its ground is read from
//                     (farmland has none: its ground is the crops kit's to say, CROPS.at)
//   RES_FIELD.grades  per grade: yield (the multiplier on the works' base rate) and rank, as the nodes' grades
//   RES_FIELD.works   per works: base (lots a worker-hour, as RES_ORE.works), radius (m: how far a worker goes to it: a
//                     canoe's day for fish), perKm2 (workers a km2 of full-weight ground keeps busy), keys (building keys
//                     that are such a works)
//   resFieldGrade(weight)            the grade a field's mean gather weight gives
//   resFieldWorkers(field)           how many can work a field: its capacity (km2) x the works' perKm2
//   resFieldWorksOf(rec)             which field works a placed building is (rec.works, its role, or its key), or null
//   resFieldSource(works, fields, o) the field a works takes from: one it stands in, else the nearest within its radius
//                                    (a tie goes to the higher grade); {field, kind, item, grade, efficiency, rate, dist,
//                                    workers} or null (none in reach: idle). works: {x, z, works}
// A field: {id, kind, grade, poly: [[x, z], ...], cap: km2 of full-weight ground}.
const RES_FIELD={
 kinds:{
  salt:{item:'salt',name:'salt pan',works:'saltworks',gather:'salt'},
  pasture:{item:'livestock',name:'pasture',works:'ranch',gather:'pasture'},
  fish:{item:'fish',name:'fishing ground',works:'fishery',gather:'fish'},
  farmland:{item:'crops',name:'farmland',works:'farm',gather:null}},
 grades:{low:{yield:.5,rank:0,min:0},medium:{yield:1,rank:1,min:.35},high:{yield:2,rank:2,min:.7}},
 works:{
  saltworks:{base:.05,radius:300,perKm2:40,keys:['ie-saltworks','iw-saltworks']},
  ranch:{base:.03,radius:2500,perKm2:4,keys:['ie-byre','iw-byre','ie-pens','iw-pens']},
  fishery:{base:.04,radius:8000,perKm2:6,keys:['ie-fishdock','iw-fishdock','iw-hut-fisher']},
  farm:{base:.05,radius:800,perKm2:60,keys:['ie-farm','iw-farm','ie-farm-poor','iw-farm-poor']}}
};
function resFieldGrade(w){const G=RES_FIELD.grades;return w>=G.high.min?'high':w>=G.medium.min?'medium':'low';}
function resFieldWorkers(f){const K=RES_FIELD.kinds[f.kind],W=K&&RES_FIELD.works[K.works];return W?Math.floor((f.cap||0)*W.perKm2):0;}
function resFieldWorksOf(rec){if(!rec)return null;if(rec.works&&RES_FIELD.works[rec.works])return rec.works;const role=rec.tags&&rec.tags.role||rec.role;
 if(role&&RES_FIELD.works[role])return role;for(const w in RES_FIELD.works)if(RES_FIELD.works[w].keys.includes(rec.key))return w;return null;}
function resPolyDist(poly,x,z){let inside=false,d=Infinity;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){const ax=poly[j][0],az=poly[j][1],bx=poly[i][0],bz=poly[i][1];
  if((bz>z)!==(az>z)&&x<(ax-bx)*(z-bz)/(az-bz)+bx)inside=!inside;
  const ex=bx-ax,ez=bz-az,L=ex*ex+ez*ez,t=L?Math.max(0,Math.min(1,((x-ax)*ex+(z-az)*ez)/L)):0;d=Math.min(d,Math.hypot(x-ax-t*ex,z-az-t*ez));}
 return inside?0:d;}
function resFieldSource(works,fields,o){o=o||{};const wk=works.works,W=RES_FIELD.works[wk];if(!W)return null;const R=o.radius==null?W.radius:o.radius;
 let best=null,bd=Infinity,br=-1;
 for(const f of fields){const K=RES_FIELD.kinds[f.kind];if(!K||K.works!==wk||!RES_FIELD.grades[f.grade]||!f.poly||f.poly.length<3)continue;
  const d=resPolyDist(f.poly,works.x,works.z),r=RES_FIELD.grades[f.grade].rank;if(d>R)continue;
  if(d<bd-1e-6||(Math.abs(d-bd)<=1e-6&&r>br)){best=f;bd=d;br=r;}}
 if(!best)return null;const g=RES_FIELD.grades[best.grade],base=o.base!=null?o.base:W.base;
 return {field:best.id,kind:best.kind,item:RES_FIELD.kinds[best.kind].item,grade:best.grade,efficiency:g.yield,rate:base*g.yield,dist:bd,workers:resFieldWorkers(best)};}
globalThis.RES_FIELD=RES_FIELD;globalThis.resFieldGrade=resFieldGrade;globalThis.resFieldWorkers=resFieldWorkers;
globalThis.resFieldWorksOf=resFieldWorksOf;globalThis.resFieldSource=resFieldSource;globalThis.resPolyDist=resPolyDist;
