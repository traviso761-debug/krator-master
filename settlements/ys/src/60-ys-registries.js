// ================================================================ YS REGISTRIES
// The data every pass shares, declared here before any pass exists, so no leaf
// fragment ever edits a shared file (skill §5). Everything a later consumer
// reads (the interiors pass, the Godot export, the life layer) is a plain
// array a builder pushes into through the helpers below. World units, metres;
// x east, z south, north is -z, y up; sea level y = 0.
const YS={version:'p0',name:'Ys'};
// Openings and lights: {bld,key,kind:'door'|'wetdoor'|'window'|'light', x,y,z, nx,nz, w,h, level, room, lit, warm}
// level: 'ground'|'quay'|'wet'|'L1'|'L2'. A door also records its doorstep (a pace outside) and
// its threshold (a pace inside): {step:[x,z], thresh:[x,z]}.
const MARKS=[];
// Rooms per kits/interiors/SPEC.md: {id,building,key,kind,poly:[[x,z]..],y,h,doors:[{at,w,to}],windows:[...],culture,wealth}
const ROOMS=[];
// Furniture anchors the later placer must fill: {room,kind:'bed'|'food'|'store'|'hearth'|'seat'|'table'|'work'|'shrine', x,z, ry, w,d}
const SPOTS=[];
// Drowned hosts on the canton model (DESIGN §3): {n,key,x,z,ry,cap:{hw}|{poly},cutY,floors[],landings[],heads[],piers[],ring,lit}
const HOSTS=[];
// Builder-fills / consumer-reads records for the life layer: moorings, ferry stops, water-level doors,
// and every deck over water the nav grids must know about ({x0,z0,x1,z1,w,y,kind,own}).
const BERTHS=[],FERRY_STOPS=[],WET_DOORS=[],NAV_EXTRA=[];
function ysMark(o){if(!o||!o.kind){reportErr('ysMark: no kind');return null;}MARKS.push(o);if(o.kind==='wetdoor')WET_DOORS.push(o);return o;}
function ysRoom(o){if(!o||!o.poly||o.poly.length<3){reportErr('ysRoom: a room needs a polygon');return null;}o.id=ROOMS.length;ROOMS.push(o);return o;}
function ysSpot(o){if(!o||!o.kind){reportErr('ysSpot: no kind');return null;}SPOTS.push(o);return o;}
function ysHost(o){if(!o||!o.n){reportErr('ysHost: no name');return null;}HOSTS.push(o);return o;}
function ysDeck(o){NAV_EXTRA.push(o);return o;}
// ---------------------------------------------------------------- the Hykkousoi kit registry (the kit sheet lays out whatever is here)
// HYK.def({key,name,family,row,w,d,h,r,tags:{type:[...],wealth,lit},views?,build}). Local frame: origin at the plot
// centre on the ground, +z the front, x to the right seen from the front. `build(G,o)` draws one instance. The
// placement frame (HYK.place) arrives with the kit in phase 1; the registry exists now so the sheet and the
// audits have a spine to hang on.
const HYK_TYPES=['civic','market/shop','tavern/inn','industry','farm','single-family dwelling','multi-family dwelling','infrastructure','religious','funerary','military'];
const HYK={defs:{},order:[],cur:null,
 def(o){if(!o||!o.key){reportErr('HYK.def: no key');return null;}if(this.defs[o.key]){reportErr('HYK.def: duplicate key '+o.key);return null;}
  const t=o.tags||{};if(!t.type||!t.type.length)reportErr('HYK.def '+o.key+': tags.type is required');
  else for(const k of t.type)if(HYK_TYPES.indexOf(k)<0)reportErr('HYK.def '+o.key+': unknown type '+k);
  if(!t.wealth)reportErr('HYK.def '+o.key+': tags.wealth is required (poor|middle|rich|civic)');
  if(!(o.w>0&&o.d>0&&o.h>0))reportErr('HYK.def '+o.key+': w, d, h must be positive');
  if(typeof o.build!=='function')reportErr('HYK.def '+o.key+': build must be a function');
  o.tags=Object.assign({culture:'hykkousoi'},t);o.r=o.r||Math.max(o.w,o.d)/2;o.grown=!!o.grown;this.defs[o.key]=o;this.order.push(o.key);return o;}};
// A grown-on def (`grown:true`) is built by HYK.placeOn (62) in the G frame: origin at the host's face at the pod's floor
// level, +z outward from the face, x along it; w,d,h are the pod's size and `into:true` asks the sheet to declare a
// way through the host's wall for it (API.md).
