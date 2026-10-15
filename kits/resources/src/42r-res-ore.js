// prefix: res
// ================================================================= RESOURCE NODES: the kinds, and the rule a works takes its product by
// The owner (2026-10-15): a mine takes its product from a nearby node; the nodes are visible and placeable, in a low, a
// medium and a high grade each, and the grade sets the job's efficiency (the works' yield a worker-hour). Nodes do not run
// out (owner, for now). The kinds: the metals (iron, copper, gold, tin, silver), sulfur, saltpeter, rare earth and coal, all dug by a
// MINE; and oil, drawn by a DERRICK (the only one so far is Locus's Geomancer pumpjack, `ind_pumpjack`; the owner: no
// derrick for other cultures yet). The nodes are world content, not any culture's, so they live in their own kit; a
// building kit reads this fragment and 44r-res-nodes.js in place (kits/islanders build.py). Plain data and a pure rule (no
// three.js, no page): core/simulation takes them as they are (settlements/isle-demo/PLAN.md, P7), and Godot reads the same.
//   RES_ORE.kinds   per kind: its item (the good the works puts in its store), its display name, its class (metal, mineral,
//                   fuel) and the works that takes it ('mine' | 'derrick')
//   RES_ORE.grades  per grade: yield (the multiplier on the works' base rate: the workers' efficiency), size (m), rank
//   RES_ORE.works   per works: base (lots a worker-hour: Voth's mine producer, settlements/voth 15-vc-tune.js, for both),
//                   radius (m: how near is "nearby"), cap (the works' store), keys (catalog or def keys that are such a
//                   works without a role tag)
//   resNodeKey(kind, grade)          the node def's key, 'node-<kind>-<grade>'
//   resWorksOf(rec)                  which works a placed building is: rec.works, or role 'mine' / 'derrick', or its key
//                                    in RES_ORE.works[*].keys; null for anything else
//   resRate(grade, works, o)         a works' output a worker-hour on a node of that grade
//   resSource(works, nodes, o)       the node a works takes from: the nearest node of a kind it can work, within its radius
//                                    (a tie goes to the higher grade); returns {node, kind, item, grade, efficiency, rate,
//                                    dist} or null (none in reach: it stands idle). works: {x, z, works:'mine'|'derrick'}
// A node: {id, kind, grade, x, z}.
const RES_ORE={
 kinds:{
  iron:{item:'iron_ore',name:'iron',cls:'metal',works:'mine'},
  copper:{item:'copper_ore',name:'copper',cls:'metal',works:'mine'},
  gold:{item:'gold_ore',name:'gold',cls:'metal',works:'mine'},
  tin:{item:'tin_ore',name:'tin',cls:'metal',works:'mine'},
  silver:{item:'silver_ore',name:'silver',cls:'metal',works:'mine'},
  sulfur:{item:'sulfur',name:'sulfur',cls:'mineral',works:'mine'},
  saltpeter:{item:'saltpeter',name:'saltpeter',cls:'mineral',works:'mine'},
  'rare-earth':{item:'rare_earth_ore',name:'rare earth',cls:'mineral',works:'mine'},
  coal:{item:'coal',name:'coal',cls:'fuel',works:'mine'},
  oil:{item:'crude_oil',name:'oil',cls:'fuel',works:'derrick'}},
 grades:{low:{yield:.5,size:3.2,rank:0},medium:{yield:1,size:5.2,rank:1},high:{yield:2,size:8,rank:2}},
 works:{mine:{base:.05,radius:400,cap:2000,keys:[]},derrick:{base:.05,radius:400,cap:2000,keys:['ind_pumpjack']}}
};
function resNodeKey(kind,grade){return 'node-'+kind+'-'+grade;}
function resWorksOf(rec){if(!rec)return null;if(rec.works&&RES_ORE.works[rec.works])return rec.works;const role=rec.tags&&rec.tags.role||rec.role;
 if(role&&RES_ORE.works[role])return role;for(const w in RES_ORE.works)if(RES_ORE.works[w].keys.includes(rec.key))return w;return null;}
function resRate(grade,works,o){const g=RES_ORE.grades[grade],W=RES_ORE.works[works||'mine'];if(!g||!W)return 0;const base=o&&o.base!=null?o.base:W.base;return base*g.yield;}
function resSource(works,nodes,o){o=o||{};const wk=works.works||'mine',W=RES_ORE.works[wk];if(!W)return null;const R=o.radius==null?W.radius:o.radius;let best=null,bd=Infinity,br=-1;
 for(const n of nodes){const K=RES_ORE.kinds[n.kind];if(!K||K.works!==wk||!RES_ORE.grades[n.grade])continue;
  const d=Math.hypot(n.x-works.x,n.z-works.z),r=RES_ORE.grades[n.grade].rank;if(d>R)continue;
  if(d<bd-1e-6||(Math.abs(d-bd)<=1e-6&&r>br)){best=n;bd=d;br=r;}}
 if(!best)return null;
 return {node:best.id,kind:best.kind,item:RES_ORE.kinds[best.kind].item,grade:best.grade,efficiency:RES_ORE.grades[best.grade].yield,rate:resRate(best.grade,wk,o),dist:bd};}
globalThis.RES_ORE=RES_ORE;globalThis.resSource=resSource;globalThis.resRate=resRate;globalThis.resNodeKey=resNodeKey;globalThis.resWorksOf=resWorksOf;
