// ================================================================= OPEN WORLD — sites drawn: the baked plan's camps and tracks
// [web] Draws WORLD_DATA.sites, the region's plan (core/world/48s-world-sites.js KSITES, baked by core/world/bake_sites.py
// to openworld/<region>/plan/sites.json); it decides nothing (CLAUDE.md: a builder draws a record). The isle demo's camp
// drawing (openworld/isle-demo/src/88k-world-camps.js) made general: one camp per plan record, not one per spec.
// At load: every record is registered in core/tags (build '<region>:sites': each camp a landmark, its tents and pens its
// children, its hedge and rails infrastructure), and the world keeps its flora and floor off everything inside a camp's
// hedge (WORLD.clearHook, chained). The tracks are already the world's roads (the build put the plan's roads into
// WORLD_DATA.roads: the ground is shaped to them and the terrain draws them). Each frame: a camp within FULL of the
// camera draws the kit's own pieces (CAT with the Beast Riders' tent set, built once each and flattened by the shared
// instancer, settlements/isle-demo/src/58-isle-protos.js), a thorn run past NEAR its card; farther, out to FAR, a massing
// dome a tent, a box a pen, a card a hedge or rail piece (the tiers: "the pieces", below).
// window._sites holds the plan, the counts and errors, the tag audit and the checks verify.py reads.
var SITES_DRAW;LATE.push(()=>{SITES_DRAW=(function(){'use strict';
/* FULL: a camp's own pieces within this of the camera (on the ground's plane; height counts half). Was 3,500 m: over the
   threehorn camp that drew all nine camps' 2,177 hedge and rail pieces and 147 tents in full, 12.7 M triangles and 2,093
   draw calls of the frame's 17.8 M and 2,433 (2026-11-10, openworld/pinnacle KNOWN_ISSUES.md); a tent 900 m off is a dozen
   pixels, as its massing dome draws it */
const scene=HOST.scene,camera=HOST.camera,FULL=900,FAR=30000,t0=performance.now();
const PLAN=WORLD_DATA.sites||{sites:[],errors:['no baked plan (python3 core/world/bake_sites.py <region>)']};
const S={camps:0,records:0,pieces:0,roads:0,errors:(PLAN.errors||[]).slice(),ms:0,full:0,missing:[]};
const CATK=(typeof CAT!=='undefined'&&CAT&&CAT.ASSET_BY_KEY)||{};
const H=(x,z)=>WORLD.H(x,z);
const TAGS=KTAGS.create({build:(PLAN.region||'region')+':sites'});
/* ---------------------------------------------------------------- the records: heights, tags, the cleared ground */
const X=[];
for(const St of PLAN.sites){S.roads+=St.roads.length;
 const site=TAGS.add({class:'landmark',kind:'settlement',key:St.id,name:St.name,at:[St.x,H(St.x,St.z),St.z],r:600,h:40,
  tags:{culture:'beast-rider',types:['civic'],role:'site'},note:'a site of the scale model ('+St.type+'): '+St.camps.length+' camps planned on the world\'s ground'});
 for(const c of St.camps){if(c.kind)continue;   /* a pitched tent camp (48w KWCAMPS): drawn below, "the pitched tent camps" */
  const base=TAGS.child(site.id,{class:'landmark',kind:'camp',key:c.id,name:c.name,at:[c.site.x,H(c.site.x,c.site.z),c.site.z],r:c.R+40,h:12,
   tags:{culture:'beast-rider',types:['civic'],role:'camp'},note:c.census.pop+' people, '+c.census.mounts+' mounts, '+c.census.households+' households'});
  const recs=c.records.map(r=>Object.assign({},r,{y:H(r.x,r.z)-.12}));
  for(const r of recs){const A=CATK[r.key]||{},t=A.tags||{};
   TAGS.child(base.id,{class:'building',key:r.key,at:[r.x,r.y,r.z],ry:r.ry,size:[r.w,r.d,r.h],
    tags:{culture:'beast-rider',types:A.types||['residential'],role:t.role||undefined,job:t.job||undefined}});}
  /* the hedge and the rails, cut into the kit's pieces (BR_RUN: its stretches and gates) */
  const runs=[];
  if(typeof BR_RUN!=='undefined')for(const L of [c.hedge,c.fence]){if(!L)continue;
   for(const p of BR_RUN(L.pts,{key:L.key,closed:true,gates:L.gates,seed:KRAND.hash(KCAMP.seedOf(PLAN.world,c.id),runs.length)})){p.y=H(p.x,p.z)-.1;runs.push(p);}}
  TAGS.child(base.id,{class:'infrastructure',kind:'hedge',key:c.hedge?c.hedge.key:'br_hedge_thorn',at:[c.site.x,H(c.site.x,c.site.z),c.site.z],size:[c.R*2,c.R*2,2],
   tags:{culture:'beast-rider',types:['infrastructure'],role:'boundary'},note:runs.length+' pieces of hedge and rail'});
  S.records+=recs.length;S.pieces+=runs.length;S.camps++;
  const P=c.hedge?c.hedge.pts:recs.map(r=>[r.x,r.z]),bb=[1e18,1e18,-1e18,-1e18];
  P.forEach(q=>{bb[0]=Math.min(bb[0],q[0]);bb[1]=Math.min(bb[1],q[1]);bb[2]=Math.max(bb[2],q[0]);bb[3]=Math.max(bb[3],q[1]);});
  X.push({St,c,recs,base,runs,P,bb,group:null,massG:null});}}
/* ---------------------------------------------------------------- the villages (core/hamlet): records, tags, footings
   A building stands on the highest ground under its footprint (the kit's fw x fd, the house without its yard) over a
   stone footing as deep as the slope falls, as settlements/longsong/src/85h-ls-hamlets.js sites them; the kit's pending
   keys (no def yet) are massing boxes. Lanes are packed earth on the ground. */
/* the village kits by core/hamlet's row `kit`: the declared boxes by key (dims) and a piece (key, variant, footing depth ->
   isleFlatten's parts). xanadu: XAK (kits/xanadu/kit_bundle.py), its own footing; iziz: the Iziz Vernacular (IZV,
   settlements/isle-demo/bundles.py) through the shared instancer (isleProto), on a stone footing box as deep as the drop */
const VK={},VIL=[],footM=new THREE.MeshLambertMaterial({color:0x8f8676});
if(typeof XAK!=='undefined'){try{XAK.bind(typeof KMAT!=='undefined'?KMAT:null);}catch(e){S.errors.push('the Xanadu kit\'s library maps: '+(e&&e.message||e));}
 VK.xanadu={dims:XAK.dims(),piece:(key,v,drop)=>{const G=XAK.proto(key,v,{drop,footC:0x8f8676});return G&&typeof isleFlatten==='function'?isleFlatten(G):null;}};}
if(typeof IZV!=='undefined'&&typeof isleProto==='function')VK.iziz={dims:IZV.dims(),piece:(key,v,drop)=>{const P=isleProto('izv',key,v,CACHE);if(!P)return null;
 const D=VK.iziz.dims[key],g=new THREE.BoxGeometry(D.w,drop,D.d).translate(0,-drop/2+.05,0);return P.parts.concat([{geo:g,mat:footM,tris:12}]);}};
/* beast-riders: the Beast Riders kit's own buildings (CAT, settlements/isle-demo/bundles.py cat_bundle) through the shared
   instancer, on the same footing (2026-11-11: Pinnacle Rock's clearings, core/hamlet's `beast-rider` row) */
if(typeof CAT!=='undefined'&&CAT&&CAT.ASSET_BY_KEY&&typeof isleProto==='function'){const cd={};
 Object.keys(CAT.ASSET_BY_KEY).forEach(k=>{if(!/^br_bldg_/.test(k))return;const A=CAT.ASSET_BY_KEY[k];cd[k]={w:A.w,d:A.d,h:A.h,variants:Array.isArray(A.variants)?A.variants.length:(A.variants|0)||1};});
 VK['beast-riders']={dims:cd,piece:(key,v,drop)=>{const P=isleProto('cat',key,v,CACHE);if(!P)return null;
  const D=cd[key],g=new THREE.BoxGeometry(D.w,drop,D.d).translate(0,-drop/2+.05,0);return P.parts.concat([{geo:g,mat:footM,tris:12}]);}};}
const KD=Object.assign({},...Object.keys(VK).map(k=>VK[k].dims));
/* a village's kit: its core/hamlet row's `kit` (the Order's row draws in the Xanadu kit's pieces), else its culture's name */
const vkit=c=>{const R=typeof KHAMLET!=='undefined'&&KHAMLET.CULTURES&&KHAMLET.CULTURES[c];return R&&R.kit&&VK[R.kit]?R.kit:c;};
const vhash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
/* a link's stops (48s stops()) are drawn as villages of one building and a lane: the same footing, merge, keep-clear,
   tags and checks */
const STOPV=[];for(const Lk of PLAN.links||[])for(const s of Lk.stops||[])STOPV.push({St:{name:s.kind==='inn'?'a caravanserai':'a rest stop'},
 V:{id:s.id,name:s.name,culture:s.culture,focus:s.kind,site:{x:s.x,z:s.z},records:s.records,lanes:[s.lane],census:{pop:s.staff,households:1}},stop:true});
for(const E of PLAN.sites.flatMap(St=>(St.hamlets||[]).map(V=>({St,V}))).concat(STOPV)){const St=E.St,V=E.V;
 const base=TAGS.add({class:'landmark',kind:E.stop?'waystation':'village',key:V.id,name:E.stop?V.name:V.name+' ('+St.name+')',at:[V.site.x,H(V.site.x,V.site.z),V.site.z],r:E.stop?60:220,h:14,
  tags:{culture:V.culture,types:E.stop?['inn']:['dwelling-multi','farm'],role:E.stop?'waystation':'village'},note:E.stop?'core/world 48s stops: '+V.census.pop+' keepers':'core/hamlet ('+V.focus+'): '+V.census.pop+' people, '+V.census.households+' households'});
 const VKit=vkit(V.culture),VD=VK[VKit]?VK[VKit].dims:{};
 const B=V.records.map(r=>{const K=VD[r.key],kit=!!K&&!r.pending,fw=kit&&K.fw?K.fw:r.w,fd=kit&&K.fd?K.fd:r.d,c=Math.cos(r.ry),s=Math.sin(r.ry);
  /* a key the kit lacks that its row does not declare pending (core/hamlet: a pending record is a stand-in by design) is a
     gap, not a stand-in: it fails "every piece the kit's" (2026-11-24, Stage 8 B7, S3-60: it drew a massing box and passed) */
  if(!K&&!r.pending&&S.missing.indexOf(r.key)<0)S.missing.push(r.key);
  const hs=[[-1,-1],[1,-1],[1,1],[-1,1],[0,0]].map(([u,w])=>H(r.x+u*fw/2*c+w*fd/2*s,r.z-u*fw/2*s+w*fd/2*c)),top=Math.max.apply(null,hs),low=Math.min.apply(null,hs);
  const nv=kit?Math.max(1,Math.min(3,K.variants|0)):1;
  /* a laid village's record on the water (48s laidVillage): its deck over the village's water level, a pier's run or light on a
     footing down to the bed, a boat afloat; a run (the mole) stretched along its x from the kit's length to its own (len) */
  const wet=r.on==='water'&&V.level!=null,y=wet?V.level+(r.deck||0):kit?top:low,lo=wet?Math.min(y,low):low;
  TAGS.child(base.id,{class:'building',key:r.key,at:[r.x,lo,r.z],ry:r.ry,size:[r.w,r.d,r.h+(wet?y-lo:top-low)],
   tags:{culture:V.culture,types:kit&&K.types?K.types:[r.role==='house'?'dwelling-single':'farm']},note:kit?undefined:'the kit has no '+r.key+' yet: a massing box'});
  return{r,kit,y,low,base:wet?y-1:low,drop:wet?(r.kind==='boat'?0:Math.max(1,Math.ceil(y-low+.4))):Math.max(1,Math.ceil(top-low+.4)),
   sx:kit&&r.len&&K.w?r.len/K.w:1,v:vhash(r.id)%nv};});
 S.records+=B.length;S.villages=(S.villages||0)+1;
 const bb=[1e18,1e18,-1e18,-1e18];V.records.forEach(r=>{const e=Math.hypot(r.w,r.d)/2+4;bb[0]=Math.min(bb[0],r.x-e);bb[1]=Math.min(bb[1],r.z-e);bb[2]=Math.max(bb[2],r.x+e);bb[3]=Math.max(bb[3],r.z+e);});
 V.lanes.forEach(l=>l.pts.forEach(p=>{bb[0]=Math.min(bb[0],p[0]-l.w);bb[1]=Math.min(bb[1],p[1]-l.w);bb[2]=Math.max(bb[2],p[0]+l.w);bb[3]=Math.max(bb[3],p[1]+l.w);}));
 VIL.push({St,V,B,bb,group:null,massG:null});}
/* is (x, z) on a village's building (its box, 2 m round it) or lane? */
function onVillage(x,z){for(const W of VIL){if(x<W.bb[0]||x>W.bb[2]||z<W.bb[1]||z>W.bb[3])continue;
  for(const b of W.B){const r=b.r,dx=x-r.x,dz=z-r.z,c=Math.cos(r.ry),s=Math.sin(r.ry);if(Math.abs(dx*c-dz*s)<r.w/2+2&&Math.abs(dx*s+dz*c)<r.d/2+2)return true;}
  for(const l of W.V.lanes)for(let i=1;i<l.pts.length;i++){const a=l.pts[i-1],q=l.pts[i],ex=q[0]-a[0],ez=q[1]-a[1],L2=ex*ex+ez*ez||1,t=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/L2));
   if(Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t)<l.w/2+1)return true;}}
 return false;}
const TCD=[];   /* the pitched tent camps' discs kept clear: [x, z, r] (filled below) */
const prevClear=WORLD.clearHook;
/* off: the ground rule as the plan read it (WORLD.townW counts what the clear hook keeps clear, so with the camps' own
   clearing on, every tent would stand on cleared ground) */
let off=false;
WORLD.clearHook=(x,z)=>{if(prevClear&&prevClear(x,z))return true;if(off)return false;
 for(const d of TCD)if(Math.abs(x-d[0])<d[2]&&Math.abs(z-d[1])<d[2]&&Math.hypot(x-d[0],z-d[1])<d[2])return true;
 if(VIL.length&&onVillage(x,z))return true;
 for(const C of X){if(x<C.bb[0]-3||x>C.bb[2]+3||z<C.bb[1]-3||z>C.bb[3]+3)continue;if(KCAMP.inPoly(C.P,x,z))return true;
  for(let i=0;i<C.P.length;i++){const a=C.P[i],b=C.P[(i+1)%C.P.length],ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez,t=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/L2));
   if(Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t)<3)return true;}}
 return false;};
/* ---------------------------------------------------------------- the pitched tent camps (core/world 48w KWCAMPS; Stage 8 T26)
   From the baked plan (version 2: a site's camps with a kind, the region's `camps`, its `uncut`). A page whose bake predates its
   camps (version 1) and that carries the region's WORLD_CAMPS plans them here at load, as xanadu-oidong-highrift's 88t did
   (the villages' clearing on, the camps' own not yet). Every tent, hedge and work is registered in core/tags (build
   '<region>:camps': each camp a landmark, its tents its children, its hedge infrastructure, its works industry) before it is
   drawn, and the world's flora and floor are kept off a disc round each camp (TCD, in the clear hook above). The drawing is
   below ("the pitched tent camps drawn"). */
const TCS={camps:0,records:0,works:0,drawn:0,kit:0,pending:0,uncut:[],errors:[],from:'none',ms:0},TCG=[];
let TPLAN={camps:[],uncut:[],errors:[]};
if(typeof KWCAMPS!=='undefined'){const t1=performance.now();
 if(PLAN.version>=2){const O=KWCAMPS.of(PLAN);TPLAN={camps:O.camps,uncut:O.uncut,errors:[]};TCS.from='the baked plan';}
 else if(typeof WORLD_CAMPS!=='undefined'&&WORLD_CAMPS){TPLAN=KWCAMPS.plan(WORLD_CAMPS,{inside:(x,z)=>WORLD.inside(x,z)});TCS.from='planned at load (the bake predates its camps)';}
 TCS.camps=TPLAN.camps.length;TCS.uncut=TPLAN.uncut.map(u=>u.id+': '+u.why);TCS.errors=TPLAN.errors.slice();
 const CT=KTAGS.create({build:((WORLD_DATA.meta.cut||{}).region||PLAN.region||'region')+':camps'});
 const CULT=c=>KTAGS.VOCAB.cultures.indexOf(c)>=0?c:'generic';
 /* a tent's types by its role and trade, the Tents kit's (TN_ROLES, TN_TRADES: its table, read in place or in the bundle) */
 const RT=(typeof TNK!=='undefined'&&TNK&&TNK.ROLES)||(typeof TN_ROLES!=='undefined'?TN_ROLES:{}),TTR=(typeof TNK!=='undefined'&&TNK&&TNK.TRADES)||(typeof TN_TRADES!=='undefined'?TN_TRADES:{});
 const typesOf=r=>(r.trade&&TTR[r.trade]&&TTR[r.trade].types)||(RT[r.role]&&RT[r.role].types)||['dwelling-single'];
 /* the ground a camp keeps clear: a disc out past its farthest tent */
 const reach=(C,pad)=>C.records.reduce((m,r)=>Math.max(m,Math.hypot(r.x-C.site.x,r.z-C.site.z)+Math.hypot(r.w,r.d)/2),C.R==null?60:C.R)+pad;
 const tagCamp=C=>{const cult=CULT(C.culture),s=C.season||{};
  const base=CT.add({class:'landmark',kind:'camp',key:C.id,name:C.name||C.id,at:[C.site.x,H(C.site.x,C.site.z),C.site.z],r:(C.R==null?60:C.R)+40,h:10,
   tags:{culture:cult,types:['civic'],role:'camp'},note:(C.people?C.people+' people, ':'')+C.records.length+' tents ('+C.kind+'); '+
    (s.days?'pitched '+s.days.map(d=>d.join('-')).join(', ')+' (year days)':'pitched by its rule '+s.rule)});
  for(const r of C.records){TCS.records++;if(r.pending)TCS.pending++;const mk=(C.marks||[]).find(m=>r[m]);
   CT.child(base.id,{class:'building',key:r.def||r.key,at:[r.x,H(r.x,r.z),r.z],ry:r.ry,size:[r.w,r.d,r.h],
    tags:{culture:cult,types:mk?['industry']:typesOf(r),role:mk||r.role||undefined},note:r.pending?'no kit has its box yet: a pending box':undefined});}
  if(C.hedge)CT.child(base.id,{class:'infrastructure',kind:'hedge',key:C.hedge.key,at:[C.site.x,H(C.site.x,C.site.z),C.site.z],size:[C.R*2,C.R*2,2],tags:{culture:cult}});
  for(const w of C.works||[]){TCS.works++;CT.child(base.id,{class:'building',key:w.key,at:[w.x,H(w.x,w.z),w.z],ry:w.ry,size:[w.w,w.d,w.h],tags:{culture:cult,types:['industry'],role:w.kind}});}
  return base;};
 for(const C of TPLAN.camps){tagCamp(C);if(C.escort)tagCamp(Object.assign({season:C.season,works:[],kind:'ring'},C.escort));
  TCD.push([C.site.x,C.site.z,reach(C,30)]);if(C.escort)TCD.push([C.escort.site.x,C.escort.site.z,reach(C.escort,25)]);}
 TCS.tags=()=>CT.audit();TCS.ms=Math.round(performance.now()-t1);}
/* ---------------------------------------------------------------- the pieces: full near, massing far
   Three tiers by the camera's distance to a camp (on the ground's plane, its height counting half):
     within FULL      the kit's own pieces; but a thorn run (br_hedge_thorn, ~9,700 triangles: 240 cut branches with their
                      twigs) is the kit's own only within NEAR of the camera, and past that its card (below), piece by piece
     within FAR       the massing: a dome a tent, a box a pen, a card a hedge or rail piece
   A card is the run piece's own box (its place, its turn, its span), its top ragged for the thorn and two slats for the rails:
   the same pieces and gates as the kit draws, a dozen triangles each. */
const CACHE={protos:{},failed:{},built:0},m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v3=new THREE.Vector3();
const domeG=new THREE.SphereGeometry(.5,10,6,0,Math.PI*2,0,Math.PI/2).scale(1,2,1),boxG=new THREE.BoxGeometry(1,1,1).translate(0,.5,0);
/* the stand-ins' colours are sRGB, as the kit's are (the renderer's colours are linear: unconverted, they read pale) */
const lam=c=>new THREE.MeshLambertMaterial({color:new THREE.Color(c).convertSRGBToLinear()});
const tentM=lam(0xc8b48c),penM=lam(0x7a6248),pendM=lam(0x8a7e6a);
const NEAR=350,HEDGE='br_hedge_thorn';
const hedgeM=lam(0x4a3d2b),railM=lam(0x6e5c44);
/* the thorn's card: a unit box on the ground, its top cut ragged (KRAND, fixed); the rails': two slats */
const hedgeCardG=(()=>{const g=new THREE.BoxGeometry(1,1,1,8,1,1).translate(0,.5,0),P=g.attributes.position;
 for(let i=0;i<P.count;i++)if(P.getY(i)>.9)P.setY(i,.72+.28*KRAND.unit(KRAND.hash(9187,Math.round((P.getX(i)+.5)*8))));g.computeVertexNormals();return g;})();
const railCardG=(()=>{const parts=[[.5,.62],[.98,1.1]].map(([a,b])=>new THREE.BoxGeometry(1,b-a,.1).translate(0,(a+b)/2,0).toNonIndexed());
 const g=new THREE.BufferGeometry();['position','normal'].forEach(n=>{const A=parts.map(p=>p.attributes[n].array),out=new Float32Array(A[0].length+A[1].length);out.set(A[0]);out.set(A[1],A[0].length);g.setAttribute(n,new THREE.BufferAttribute(out,3));});return g;})();
function mat(C,x,y,z,ry,sx,sy,sz){q.setFromEuler(e.set(0,ry,0));return m4.compose(v3.set(x-C.c.site.x,y,z-C.c.site.z),q,new THREE.Vector3(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz)).clone();}
const spanOf=p=>{const A=CATK[p.key]||{},sp=A.span||{};return{def:p.v?(sp.gate==null?7:sp.gate):(sp.default==null?8:sp.default),len:p.v?(sp.gate==null?7:sp.gate):p.span};};
function card(C,p){const s=spanOf(p);return p.key===HEDGE?mat(C,p.x,p.y,p.z,p.ry,s.len,1.75,1.5):mat(C,p.x,p.y,p.z,p.ry,s.len,1,1);}
function full(C){const G=new THREE.Group(),by={},missing=[],thorn=[];
 const add=(key,v,M4)=>{const P=typeof isleProto==='function'?isleProto('cat',key,v,CACHE):null;if(!P)return false;(by[P.id]||(by[P.id]={P,L:[]})).L.push(M4);return true;};
 for(const r of C.recs)if(!add(r.key,r.v,mat(C,r.x,r.y,r.z,r.ry)))missing.push(r);
 /* a run piece is built at the kit's default span and stretched to its own; a gate is its own fixed piece; a thorn run
    waits for the near/far split (below) */
 for(const p of C.runs){const s=spanOf(p),M4=mat(C,p.x,p.y,p.z,p.ry,p.v?1:p.span/s.def);
  if(p.key===HEDGE&&!p.v){const P=typeof isleProto==='function'?isleProto('cat',p.key,p.v,CACHE):null;if(P){thorn.push({p,M4,C4:card(C,p),P});continue;}}
  if(!add(p.key,p.v,M4))missing.push({key:p.key,x:p.x,y:p.y,z:p.z,ry:p.ry,w:p.span,d:1,h:1.5});}
 for(const id in by){const B=by[id];for(const pt of B.P.parts){const im=new THREE.InstancedMesh(pt.geo,pt.mat,B.L.length);B.L.forEach((M4,i)=>im.setMatrixAt(i,M4));im.name=id;im.userData.inspectLabel=id;G.add(im);}}
 if(missing.length){const im=new THREE.InstancedMesh(boxG,pendM,missing.length);missing.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));im.setMatrixAt(i,m4.compose(v3.set(r.x-C.c.site.x,r.y,r.z-C.c.site.z),q,new THREE.Vector3(r.w,r.h,r.d)));});G.add(im);
  missing.forEach(r=>{if(S.missing.indexOf(r.key)<0)S.missing.push(r.key);});}
 /* the thorn runs: the kit's piece near, its card past NEAR (split() fills both lists as the camera moves) */
 if(thorn.length){const P=thorn[0].P,id=P.id;
  C.thorn={L:thorn,near:P.parts.map(pt=>{const im=new THREE.InstancedMesh(pt.geo,pt.mat,thorn.length);im.name=id;im.userData.inspectLabel=id;im.count=0;G.add(im);return im;}),
   cards:new THREE.InstancedMesh(hedgeCardG,hedgeM,thorn.length),at:null};
  C.thorn.cards.name='camp hedge cards';C.thorn.cards.count=0;G.add(C.thorn.cards);}
 G.position.set(C.c.site.x,0,C.c.site.z);G.name='camp '+C.c.id;if(HOST.shadow)HOST.shadow.cast(G);scene.add(G);return G;}
function split(C,P){const T=C.thorn;if(!T)return;if(T.at&&T.at.distanceTo(P)<8){S.near+=T.n;return;}T.at=(T.at||P.clone()).copy(P);let n=0,c=0;
 for(const t of T.L){const d=Math.hypot(P.x-t.p.x,P.z-t.p.z,(P.y-t.p.y)*.5);
  if(d<NEAR){for(const im of T.near)im.setMatrixAt(n,t.M4);n++;}else T.cards.setMatrixAt(c++,t.C4);}
 for(const im of T.near){im.count=n;im.visible=n>0;im.instanceMatrix.needsUpdate=true;}T.cards.count=c;T.cards.visible=c>0;T.cards.instanceMatrix.needsUpdate=true;T.n=n;S.near+=n;}
function massing(C){const T=C.recs.filter(r=>r.kind!=='pen'),Pn=C.recs.filter(r=>r.kind==='pen');
 const a=new THREE.InstancedMesh(domeG,tentM,Math.max(1,T.length)),b=new THREE.InstancedMesh(boxG,penM,Math.max(1,Pn.length));
 T.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));a.setMatrixAt(i,m4.compose(v3.set(r.x-C.c.site.x,r.y,r.z-C.c.site.z),q,new THREE.Vector3(r.w*.9,r.h*.5,r.d*.9)));});
 Pn.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));b.setMatrixAt(i,m4.compose(v3.set(r.x-C.c.site.x,r.y,r.z-C.c.site.z),q,new THREE.Vector3(r.w,1.2,r.d)));});
 a.count=T.length;b.count=Pn.length;const G=new THREE.Group();G.add(a,b);
 const hr=C.runs.filter(p=>p.key===HEDGE),rr=C.runs.filter(p=>p.key!==HEDGE);
 [[hr,hedgeCardG,hedgeM],[rr,railCardG,railM]].forEach(([L,g,m])=>{if(!L.length)return;const im=new THREE.InstancedMesh(g,m,L.length);L.forEach((p,i)=>im.setMatrixAt(i,card(C,p)));G.add(im);});
 G.position.set(C.c.site.x,0,C.c.site.z);G.name='camp massing '+C.c.id;scene.add(G);return G;}
/* a village near the camera: the kit's pieces (VK[kit].piece per key, variant and footing depth, flattened by the shared
   instancer's isleFlatten), every copy merged by material into one mesh (settlements/longsong/src/85h's merge), the
   pending keys as boxes, the lanes as earth ribbons; far, a massing box a building */
const VPROTO={},earthM=new THREE.MeshLambertMaterial({color:0x9a8a6c}),wallM=new THREE.MeshLambertMaterial({color:0xe8e0cc});
function vproto(kit,key,v,drop){const id=kit+':'+key+'#'+v+'@'+drop;if(id in VPROTO)return VPROTO[id];let parts=null;
 try{if(VK[kit])parts=VK[kit].piece(key,v,drop);}catch(e){S.errors.push('the kit could not build '+key+': '+(e&&e.message||e));}
 if(!parts&&S.missing.indexOf(key)<0)S.missing.push(key);return(VPROTO[id]=parts);}
function vmerge(list,G){const byMat=new Map(),v3=new THREE.Vector3(),n3=new THREE.Matrix3();
 for(const {parts,m} of list)for(const p of parts){const names=Object.keys(p.geo.attributes).sort(),k=p.mat.uuid+'|'+names.join(',');
  (byMat.get(k)||byMat.set(k,{mat:p.mat,names,items:[]}).get(k)).items.push({g:p.geo,m});}
 for(const Q of byMat.values()){let nv=0,ni=0;for(const it of Q.items){nv+=it.g.attributes.position.count;ni+=it.g.index.count;}
  const A={};for(const nm of Q.names)A[nm]=new Float32Array(nv*Q.items[0].g.attributes[nm].itemSize);
  const I=nv>65535?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
  for(const it of Q.items){const g=it.g,cnt=g.attributes.position.count;n3.getNormalMatrix(it.m);
   for(const nm of Q.names){const src=g.attributes[nm],sz=src.itemSize,dst=A[nm],a=src.array;
    if(nm==='position')for(let i=0;i<cnt;i++){v3.set(a[i*3],a[i*3+1],a[i*3+2]).applyMatrix4(it.m);dst[(vo+i)*3]=v3.x;dst[(vo+i)*3+1]=v3.y;dst[(vo+i)*3+2]=v3.z;}
    else if(nm==='normal')for(let i=0;i<cnt;i++){v3.set(a[i*3],a[i*3+1],a[i*3+2]).applyMatrix3(n3).normalize();dst[(vo+i)*3]=v3.x;dst[(vo+i)*3+1]=v3.y;dst[(vo+i)*3+2]=v3.z;}
    else dst.set(a.subarray(0,cnt*sz),vo*sz);}
   const ia=g.index.array;for(let k=0;k<ia.length;k++)I[io+k]=ia[k]+vo;io+=ia.length;vo+=cnt;}
  const geo=new THREE.BufferGeometry();for(const nm of Q.names)geo.setAttribute(nm,new THREE.BufferAttribute(A[nm],Q.items[0].g.attributes[nm].itemSize));
  geo.setIndex(new THREE.BufferAttribute(I,1));geo.computeBoundingSphere();
  const mesh=new THREE.Mesh(geo,Q.mat);mesh.matrixAutoUpdate=false;G.add(mesh);S.vtris=(S.vtris||0)+ni/3;}}
function villageFull(W){const G=new THREE.Group(),copies=[],boxes=[],ox=W.V.site.x,oz=W.V.site.z;
 for(const b of W.B){const r=b.r,m=new THREE.Matrix4().compose(new THREE.Vector3(r.x-ox,b.y,r.z-oz),q.setFromEuler(e.set(0,r.ry,0)).clone(),new THREE.Vector3(b.sx,1,1));
  const parts=b.kit?vproto(vkit(W.V.culture),r.key,b.v,b.drop):null;if(parts)copies.push({parts,m});else boxes.push(b);}
 if(copies.length)vmerge(copies,G);
 if(boxes.length){const im=new THREE.InstancedMesh(boxG,wallM,boxes.length);boxes.forEach((b,i)=>{const r=b.r;im.setMatrixAt(i,m4.compose(v3.set(r.x-ox,b.base-.3,r.z-oz),q.setFromEuler(e.set(0,r.ry,0)),new THREE.Vector3(r.w,r.h+.3,r.d)));});G.add(im);}
 /* the lanes: packed earth, a quad a 4 m step, 0.1 m over the ground */
 const P=[];for(const l of W.V.lanes)for(let i=1;i<l.pts.length;i++){const a=l.pts[i-1],c=l.pts[i],len=Math.hypot(c[0]-a[0],c[1]-a[1]),n=Math.max(1,Math.ceil(len/4)),tx=(c[0]-a[0])/len,tz=(c[1]-a[1])/len,hw=l.w/2;
  for(let k=0;k<n;k++){const p0=[a[0]+tx*len*k/n,a[1]+tz*len*k/n],p1=[a[0]+tx*len*(k+1)/n,a[1]+tz*len*(k+1)/n];
   const Q4=[[p0[0]-tz*hw,p0[1]+tx*hw],[p0[0]+tz*hw,p0[1]-tx*hw],[p1[0]+tz*hw,p1[1]-tx*hw],[p1[0]-tz*hw,p1[1]+tx*hw]].map(([x,z])=>[x-ox,H(x,z)+.1,z-oz]);
   P.push(...Q4[0],...Q4[1],...Q4[2],...Q4[0],...Q4[2],...Q4[3]);}}
 if(P.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();
  const lm=new THREE.Mesh(g,earthM);lm.material.side=THREE.DoubleSide;G.add(lm);}
 G.position.set(ox,0,oz);G.name='village '+W.V.id;if(HOST.shadow)HOST.shadow.cast(G);scene.add(G);return G;}
function villageMass(W){const im=new THREE.InstancedMesh(boxG,wallM,Math.max(1,W.B.length)),ox=W.V.site.x,oz=W.V.site.z;
 W.B.forEach((b,i)=>{const r=b.r;im.setMatrixAt(i,m4.compose(v3.set(r.x-ox,b.base,r.z-oz),q.setFromEuler(e.set(0,r.ry,0)),new THREE.Vector3(r.w*.9,r.h,r.d*.9)));});
 im.count=W.B.length;const G=new THREE.Group();G.add(im);G.position.set(ox,0,oz);G.name='village massing '+W.V.id;scene.add(G);return G;}
/* ---------------------------------------------------------------- the pitched tent camps drawn
   Each camp is drawn PITCHED and STRUCK (the hedge's low ring and the works its spec names stay), and the world clock's year day
   picks one (KWCAMPS.inSeason). Pitched: within FULL of the camera the Tents kit's own tents (TNK.proto, when the page carries
   kits/tents/tents_bundle.py: each (def, dress, role, trade) built once and instanced), else each tent its form's mass at its
   box in its dress's colours (a drum and cone for the round forms, walls and a hip roof for the long ones, a sheet on poles for
   a fly, a wagon on its wheels); a pending box (no kit had it) and a key TNK lacks are plain boxes; the hedge a ring of thorn
   clumps with its ditch, one gap a gate; the works stand-ins at their pending boxes. */
const TG={drum:new THREE.CylinderGeometry(1,1,1,14),cone:new THREE.ConeGeometry(1,1,14),box:new THREE.BoxGeometry(1,1,1),hip:new THREE.ConeGeometry(Math.SQRT1_2,1,4),
 clump:new THREE.DodecahedronGeometry(1,0),disc:new THREE.CylinderGeometry(1,1,1,10),mound:new THREE.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI/2)};
TG.hip.rotateY(Math.PI/4);
/* the dresses' colours (kits/tents/src/41-tn-dress.js names them; a dress not here takes the generic undyed canvas) */
const TDRESS={xanadu:{wall:0xeee6d4,roof:0xd89a2a,trim:0x7a2430},generic:{wall:0xcbbfa5,roof:0xb0a184,trim:0x6a5a48},scyvoi:{wall:0xd8ccb0,roof:0x8a6a48,trim:0x5a3020},
 desert:{wall:0x3a322c,roof:0x2a2420,trim:0x8a5a30},republican:{wall:0xc8c0a0,roof:0x9a9070,trim:0x3a4a6a}};
const tdress=r=>TDRESS[r.dress]||TDRESS.generic;
function TBatch(){const by={};return{add(g,c,x,y,z,sx,sy,sz,ry){const k=g+':'+c;(by[k]=by[k]||{g,c,m:[]}).m.push([x,y,z,sx,sy,sz,ry==null?0:ry]);},
 build(name){const G=new THREE.Group();G.name=name;const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),s=new THREE.Vector3();
  for(const k in by){const B=by[k],M=new THREE.InstancedMesh(TG[B.g],new THREE.MeshStandardMaterial({color:new THREE.Color(B.c).convertSRGBToLinear(),roughness:.9,metalness:0}),B.m.length);
   B.m.forEach((a,i)=>{q.setFromEuler(e.set(0,a[6],0));m4.compose(v.set(a[0],a[1],a[2]),q,s.set(a[3],a[4],a[5]));M.setMatrixAt(i,m4);});
   M.instanceMatrix.needsUpdate=true;M.castShadow=M.receiveShadow=true;M.name=name+':'+k;
   M.userData.probePoints=[].concat(...B.m.map(a=>[a[0],a[1],a[2]]));G.add(M);}
  scene.add(G);return G;}};}
const TROUND={bell:1,cone:1,yurt:1};
function tentMass(B,r){const f=(/^tn-([a-z]+)-/.exec(r.def||'')||[])[1]||'ridge',D=tdress(r),y=H(r.x,r.z),h=r.h==null?3:r.h,c=Math.cos(r.ry),s=Math.sin(r.ry);
 if(r.pending){B.add('box',D.wall,r.x,y+h/2,r.z,r.w*.9,h,r.d*.9,r.ry);return;}
 /* the tent's own box (KCAMP.tentDims grew it by the role's yard): the mass stands in the box less its yard */
 const yd=KCAMP.TENTS.YARD[r.role]==null?0:KCAMP.TENTS.YARD[r.role],w=Math.max(1.6,r.w-yd),d=Math.max(1.6,r.d-yd),mk=r.goldRoom||r.role==='chief';
 if(TROUND[f]){const R=Math.min(w,d)/2*.92;B.add('drum',D.wall,r.x,y+h*.22,r.z,R,h*.44,R);B.add('cone',mk?D.trim:D.roof,r.x,y+h*.44+h*.28,r.z,R*1.05,h*.56,R*1.05);}
 else if(f==='fly'||f==='awning'){B.add('box',D.roof,r.x,y+h*.85,r.z,w*.95,.08,d*.95,r.ry);for(const a of[-1,1])for(const b of[-1,1])B.add('box',0x5a4632,r.x+c*a*w*.42+s*b*d*.42,y+h*.42,r.z-s*a*w*.42+c*b*d*.42,.1,h*.85,.1);}
 else if(f==='screen'){B.add('box',D.wall,r.x,y+.9,r.z,w*.9,1.8,.08,r.ry);}
 else if(f==='wagon'){B.add('box',0x6a5038,r.x,y+.8,r.z,w*.8,.9,d*.9,r.ry);B.add('hip',D.wall,r.x,y+1.25+.6,r.z,w*.82,1.2,d*.9,r.ry);
  for(const a of[-1,1])for(const b of[-1,1])B.add('disc',0x3a2e22,r.x+c*a*w*.45+s*b*d*.32,y+.45,r.z-s*a*w*.45+c*b*d*.32,.45,.12,.45,r.ry+Math.PI/2);}
 else{B.add('box',D.wall,r.x,y+h*.25,r.z,w*.92,h*.5,d*.92,r.ry);B.add('hip',mk?D.trim:D.roof,r.x,y+h*.5+h*.25,r.z,w*.98,h*.5,d*.98,r.ry);}}
function thornRing(B,L,site,low){if(!L)return 0;let n=0,acc=0;const P=L.pts,GAP=7,step=low?5:2.6;
 for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],seg=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(let t=0;t<seg;t+=step){const d=acc+t;if(L.gates.some(g=>Math.abs(g-d)<GAP/2))continue;const x=a[0]+(b[0]-a[0])*t/seg,z=a[1]+(b[1]-a[1])*t/seg,
    k=KRAND.unit(KRAND.hash(7123,Math.round(x*10),Math.round(z*10))),sc=(low?.5:1)*(1.1+.5*k);
   B.add('clump',low?0x6a5a40:0x4f4230,x,H(x,z)+sc*.45,z,sc*1.3,sc*.85,sc*1.3,k*6);n++;
   /* the ditch outside the hedge */
   if(!low){const ox=x-site.x,oz=z-site.z,o=Math.max(1e-6,Math.hypot(ox,oz));B.add('box',0x3e352a,x+ox/o*3.2,H(x+ox/o*3.2,z+oz/o*3.2)+.02,z+oz/o*3.2,2.2,.06,step+.2,Math.atan2(ox,oz)+Math.PI/2);}}
  acc+=seg;}
 return n;}
function worksMass(B,C,only){for(const w of C.works||[]){if(only&&only.indexOf(w.kind)<0)continue;const y=H(w.x,w.z);
  if(w.kind==='sluice'){B.add('box',0x8a7458,w.x,y+.6,w.z,w.w*.25,1.2,w.d*.9,w.ry);B.add('box',0x4a7f8a,w.x,y+1.22,w.z,w.w*.18,.05,w.d*.85,w.ry);}
  else if(w.kind==='pit'){B.add('disc',0x3a3026,w.x,y+.03,w.z,w.w/2,.06,w.d/2,w.ry);B.add('mound',0x8a7e68,w.x+2.6,y,w.z+1.2,2.2,1.0,1.8);}
  else if(w.kind==='heap')B.add('mound',0x9a907c,w.x,y,w.z,w.w/2,w.h,w.d/2);
  else B.add('box',0x8a7e6a,w.x,y+w.h/2,w.z,w.w,w.h,w.d,w.ry);}}
/* the kit's own tents: TNK.proto once per (def, dress, role, trade), its meshes instanced at every record that takes it */
const TKIT=typeof TNK!=='undefined'&&TNK&&typeof TNK.proto==='function'?TNK:null,TKP={};
const kitOk=r=>!!TKIT&&!r.pending&&!!r.def&&(!TKIT.KEYS||TKIT.KEYS.indexOf(r.def)>=0);
function tnkParts(r){const k=r.def+'|'+r.dress+'|'+(r.role||'')+'|'+(r.trade||'')+'|'+(r.v|0);if(k in TKP)return TKP[k];let parts=null;
 try{const G=TKIT.proto(r.def,{dress:r.dress,role:r.role,trade:r.trade,world:PLAN.world==null?0:PLAN.world,cell:0,index:0,v:r.v|0});
  if(G){G.updateMatrixWorld(true);parts=[];G.traverse(o=>{if(o.isMesh)parts.push({geo:o.geometry,mat:o.material,m:o.matrixWorld.clone()});});}}
 catch(e){TCS.errors.push('TNK.proto '+r.def+': '+(e&&e.message||e));}
 return(TKP[k]=parts&&parts.length?parts:null);}
function kitGroup(E){const g=new THREE.Group(),by=new Map(),ox=E.C.site.x,oz=E.C.site.z,q4=new THREE.Quaternion(),e4=new THREE.Euler(),one=new THREE.Vector3(1,1,1);
 for(const r of E.kitRecs){const P=tnkParts(r);if(!P)continue;TCS.kit++;
  const M=new THREE.Matrix4().compose(new THREE.Vector3(r.x-ox,H(r.x,r.z),r.z-oz),q4.setFromEuler(e4.set(0,r.ry,0)),one);
  for(const p of P){const key=p.geo.uuid+'|'+(Array.isArray(p.mat)?p.mat.map(m=>m.uuid).join(','):p.mat.uuid);let L=by.get(key);if(!L)by.set(key,L={p,M:[]});L.M.push(new THREE.Matrix4().multiplyMatrices(M,p.m));}}
 for(const L of by.values()){const im=new THREE.InstancedMesh(L.p.geo,L.p.mat,L.M.length);L.M.forEach((m,i)=>im.setMatrixAt(i,m));im.castShadow=im.receiveShadow=true;g.add(im);}
 g.position.set(ox,0,oz);g.name='camp kit '+E.C.id;if(HOST.shadow)HOST.shadow.cast(g);scene.add(g);return g;}
for(const C of TPLAN.camps){const all=C.records.concat(C.escort?C.escort.records:[]),kitRecs=all.filter(kitOk);
 const pB=TBatch(),mB=TBatch(),sB=TBatch();
 for(const r of all){tentMass(kitOk(r)?mB:pB,r);TCS.drawn++;}
 const nh=thornRing(pB,C.hedge,C.site,false);if(C.escort&&C.escort.hedge)thornRing(pB,C.escort.hedge,C.escort.site,false);
 worksMass(pB,C);
 if(C.struck&&C.struck.hedge)thornRing(sB,C.hedge,C.site,true);worksMass(sB,C,C.struck?C.struck.works:[]);
 TCG.push({C,kitRecs,pitched:pB.build('camp:'+C.id+':pitched'),mass:mB.build('camp:'+C.id+':tents'),struck:sB.build('camp:'+C.id+':struck'),kit:null,hedge:nh});}
const today=()=>KWCAMPS.yearDay(HOST.clock?HOST.clock.day:0);
function campSeason(P){const d=today();
 for(const E of TCG){const on=KWCAMPS.inSeason(E.C,d),near=!!P&&E.kitRecs.length>0&&Math.hypot(P.x-E.C.site.x,P.z-E.C.site.z)<FULL+(E.C.R==null?60:E.C.R);
  if(on&&near&&!E.kit)E.kit=kitGroup(E);
  E.pitched.visible=on;E.mass.visible=on&&!(near&&E.kit);if(E.kit)E.kit.visible=on&&near;E.struck.visible=!on;}
 return d;}
if(TCG.length)campSeason(null);
const FULL_V=4000;
function update(){const P=camera.position;let nf=0;S.near=0;
 if(TCG.length)campSeason(P);
 for(const W of VIL){const d=Math.hypot(P.x-W.V.site.x,P.z-W.V.site.z),want=d<FULL_V?'full':d<FAR?'mass':'none';
  if(want==='full'&&!W.group)W.group=villageFull(W);if(want==='mass'&&!W.massG)W.massG=villageMass(W);
  if(W.group)W.group.visible=want==='full';if(W.massG)W.massG.visible=want==='mass';if(want==='full')nf++;}
 for(const C of X){const d=Math.hypot(P.x-C.c.site.x,P.z-C.c.site.z,(P.y-H(C.c.site.x,C.c.site.z))*.5),want=d<FULL?'full':d<FAR?'mass':'none';
  if(want==='full'&&!C.group)C.group=full(C);
  if(want==='mass'&&!C.massG)C.massG=massing(C);
  if(C.group)C.group.visible=want==='full';if(C.massG)C.massG.visible=want==='mass';if(want==='full'){nf++;split(C,P);}}
 S.full=nf;}
HOST.TICKS.push(()=>update());
/* every camp's pieces built once now, behind the loading curtain: each band pitches its own tents, so a flight past the
   camps otherwise built a band's pieces the first time its camp came within FULL (a 0.5 s frame on the Arc 140T,
   2026-11-16); a camp coming near now only places its instances */
{const t1=performance.now();if(typeof isleProto==='function')for(const C of X){for(const r of C.recs)isleProto('cat',r.key,r.v,CACHE);for(const p of C.runs)isleProto('cat',p.key,p.v,CACHE);}
 S.protoMs=Math.round(performance.now()-t1);}
S.ms=Math.round(performance.now()-t0);
/* ---------------------------------------------------------------- the checks verify.py reads (each with its negative)
   plan: the baked plan made again here, in the browser, on the page's own land: the same hash (a stale bake fails)
   ground: KSITES.check on the land as it stands (whole, apart, on good ground, inside the hedge, each track at its gate)
   clear: every tent, pen and pasture corner kept clear of the flora */
function checks(neg){const R=[];
 {let P2=null,err='';off=true;try{if(typeof SITE_SPEC!=='undefined'){P2=KSITES.plan(SITE_SPEC,{dims:siteDims,programs:sitePrograms});}}catch(e){err=String(e&&e.stack||e);}finally{off=false;}
  const h2=P2?(neg==='plan'?KSITES.hash(Object.assign({},P2,{world:P2.world+1})):P2.hash):'-';
  R.push({name:'the sites: the baked plan is the plan made here',ok:!!P2&&h2===PLAN.hash,detail:err||('baked '+PLAN.hash+', made here '+h2+(P2?', '+P2.sites.reduce((n,s)=>n+s.camps.length,0)+' camps, '+P2.sites.reduce((n,s)=>n+(s.hamlets||[]).length,0)+' villages':''))});}
 {off=true;let K;try{K=KSITES.check(neg==='ground'?shifted(PLAN):PLAN);}finally{off=false;}
  R.push({name:"the sites on the world's ground: every camp and village whole, its boxes apart and on good ground, inside its hedge, every road at its gate or lane end",ok:K.ok&&(K.counts.camps+(K.counts.hamlets||0))>0,
   detail:K.ok?JSON.stringify(K.counts):K.problems.slice(0,6).join('; ')});}
 {const clr=neg==='clear'?prevClear:WORLD.clearHook,bad=[];
  /* every camp's pieces looked up, drawn or not (a camp past FULL has not asked for its pieces yet) */
  for(const C of X){for(const r of C.recs)if(!(typeof isleProto==='function'&&isleProto('cat',r.key,r.v,CACHE))&&S.missing.indexOf(r.key)<0)S.missing.push(r.key);
   for(const p of C.runs)if(!(typeof isleProto==='function'&&isleProto('cat',p.key,p.v,CACHE))&&S.missing.indexOf(p.key)<0)S.missing.push(p.key);}
  for(const C of X){const pts=C.recs.map(r=>[r.x,r.z]).concat(C.c.pasture?C.c.pasture.pts:[]),kept=pts.filter(p=>!(clr&&clr(p[0],p[1]))).length;if(kept)bad.push(C.c.id+': '+kept+' places not clear');}
  for(const W of VIL){const pts=W.V.records.map(r=>[r.x,r.z]).concat(...W.V.lanes.map(l=>l.pts.slice(1).map((p,i)=>[(p[0]+l.pts[i][0])/2,(p[1]+l.pts[i][1])/2]))),kept=pts.filter(p=>!(clr&&clr(p[0],p[1]))).length;if(kept)bad.push(W.V.id+': '+kept+' places not clear');}
  /* the pitched tent camps (48w): every tent's place cleared, its tags known */
  for(const E of TCG){const pts=E.C.records.concat(E.C.escort?E.C.escort.records:[]).map(r=>[r.x,r.z]),kept=pts.filter(p=>!(clr&&clr(p[0],p[1]))).length;if(kept)bad.push(E.C.id+': '+kept+' places not clear');}
  const A=TAGS.audit();if(A.unknown)bad.push(A.unknown+' unknown tag values');
  const A2=TCS.tags?TCS.tags():null;if(A2&&A2.unknown)bad.push(A2.unknown+' unknown tag values in the tent camps');
  if(S.missing.length&&!neg)bad.push('no piece for '+S.missing.join(', '));
  R.push({name:'the sites drawn: cleared of flora, tagged, every piece the kit\'s',ok:!bad.length&&(X.length+VIL.length+TCG.length)>0,detail:bad.length?bad.join('; '):X.length+' camps, '+VIL.length+' villages, '+TCG.length+' tent camps, '+S.records+' buildings, tents and pens, '+S.pieces+' hedge and rail pieces, '+S.roads+' roads'});}
 return R;}
/* the pitched tent camps' checks (verify.py reads them as window._worldCamps.checks; each with its negative: 'plan' lays one
   tent on another, 'season' reads the season backwards): whole on the world's ground, its form (its formation's check, its marks
   each on one tent, its bed works laid, its people about its census), pitched in its season and struck out of it */
function campChecks(neg){off=true;try{return campChecks0(neg);}finally{off=false;}}
function campChecks0(neg){const R=[],P=neg==='plan'?JSON.parse(JSON.stringify(TPLAN)):TPLAN,ok=KSITES.groundOk,dNow=today();
 if(neg==='plan'&&P.camps[0]&&P.camps[0].records[1]){P.camps[0].records[0].x=P.camps[0].records[1].x;P.camps[0].records[0].z=P.camps[0].records[1].z;}
 for(const C of P.camps){const all=C.records.concat(C.escort?C.escort.records:[]),short=C.short.concat(C.escort?C.escort.short:[]);let ov=0,offg=0;
  for(let i=0;i<all.length;i++){for(let j=i+1;j<all.length;j++)if(KCAMP.overlaps(all[i],all[j],.5))ov++;
   if(!KCAMP.box(all[i],0).every(q=>ok(q[0],q[1])))offg++;}
  R.push({name:'the camp '+C.id+': pitched whole on the world\'s ground, no two tents within half a metre',ok:!ov&&!offg&&!short.length&&all.length>0,
   detail:all.length+' tents, '+ov+' overlapping, '+offg+' off good ground, '+short.length+' not pitched'+(C.boxes?' (boxes: '+C.boxes+')':'')});
  const F=KWCAMPS.check(C),marks=(C.marks||[]).map(m=>[m,C.records.filter(r=>r[m]).length]),beds=(C.worksAsked||[]).filter(w=>w.rule==='bed'),
   bedOk=beds.every(w=>C.works.filter(x=>x.kind===w.kind).length>=Math.min(2,w.n)),pop=C.census?C.census.pop:null,
   ppl=C.people==null||pop==null||Math.abs(pop-C.people)<=C.people*.25;
  R.push({name:'the camp '+C.id+': its form ('+C.kind+'), its marks, its works and its people',ok:F.ok&&marks.every(m=>m[1]===1)&&bedOk&&ppl,
   detail:F.detail+(marks.length?', marks '+marks.map(m=>m[0]+' '+m[1]).join(', '):'')+(C.works.length?', works '+C.works.length:'')+
    (beds.length?' ('+beds.map(w=>w.kind+' in the bed: '+C.works.filter(x=>x.kind===w.kind).length).join(', ')+')':'')+(C.people!=null?', people '+pop+' / '+C.people:'')});
  /* the season: pitched on a day of its window, struck on the first day after it that is out (the negative reads it backwards) */
  const f=neg==='season'?(d=>!KWCAMPS.inSeason(C,d)):(d=>KWCAMPS.inSeason(C,d)),s=C.season||{};let inD=null,outD=null;
  if(s.days&&s.days.length){inD=s.days[0][0];for(let k=1;k<=365&&outD==null;k++){const d=(s.days[0][1]+k)%365;if(!KWCAMPS.inSeason(C,d))outD=d;}}
  else for(let d=0;d<365;d++){if(inD==null&&KWCAMPS.inSeason(C,d))inD=d;if(outD==null&&!KWCAMPS.inSeason(C,d))outD=d;}
  R.push({name:'the camp '+C.id+': pitched in its season (year day '+inD+'), struck out of it ('+(outD==null?'never: pitched all year':'year day '+outD)+')',
   ok:inD!=null&&f(inD)&&(outD==null||!f(outD)),detail:(s.days?'window '+s.days.map(d=>d.join('-')).join(', '):'rule '+s.rule)+(s.name?' ('+s.name+')':'')+'; today year day '+dNow});}
 for(const u of P.uncut)R.push({name:'the camp '+u.id+': awaiting the region\'s recut (not drawn)',ok:true,na:true,detail:u.why});
 R.push({name:'the pitched camps: planned with no error, every one drawn in its season\'s state',ok:!P.errors.length&&TCG.every(E=>E.pitched.visible===KWCAMPS.inSeason(E.C,dNow)&&E.struck.visible!==E.pitched.visible),
  detail:P.camps.length+' camps drawn ('+TCS.from+')'+(P.uncut.length?', '+P.uncut.length+' awaiting the recut':'')+(P.errors.length?'; errors: '+P.errors.join('; '):'')});
 return R;}
if(typeof KWCAMPS!=='undefined')window._worldCamps={plan:TPLAN,stats:TCS,checks:campChecks,season:()=>campSeason(camera.position),today};
/* the negative for the ground check: one camp's first tent moved 500 m off (into the open, onto whatever is there) */
function shifted(P){const Q=JSON.parse(JSON.stringify(P)),S0=Q.sites[0],C=S0&&(S0.camps[0]||(S0.hamlets||[])[0]);if(C){C.records[0].x=C.records[1].x;C.records[0].z=C.records[1].z;}return Q;}
const siteDims=(k,v)=>{const A=CATK[k];if(!A){const X2=KD[k];return X2?{w:X2.w,d:X2.d,h:X2.h}:null;}const qd=A.variantDims&&A.variantDims[v];return qd?{w:qd.w,d:qd.d,h:qd.h}:{w:A.w,d:A.d,h:A.h};};
const sitePrograms=t=>{const T=typeof BR_CAMP!=='undefined'&&BR_CAMP[t];return T&&T.grounds&&T.grounds.lower||null;};
window._sites={plan:PLAN,stats:S,tags:()=>TAGS.audit(),checks,raw:X,villages:VIL.map(W=>({id:W.V.id,site:W.V.site,records:W.B.length,pop:W.V.census.pop})),
 camps:X.map(C=>({id:C.c.id,site:C.c.site,R:C.c.R,records:C.recs.length,pieces:C.runs.length,pop:C.c.census.pop}))};
return{update,stats:S,tags:TAGS};})();});
