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
 for(const c of St.camps){
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
const prevClear=WORLD.clearHook;
/* off: the ground rule as the plan read it (WORLD.townW counts what the clear hook keeps clear, so with the camps' own
   clearing on, every tent would stand on cleared ground) */
let off=false;
WORLD.clearHook=(x,z)=>{if(prevClear&&prevClear(x,z))return true;if(off)return false;
 for(const C of X){if(x<C.bb[0]-3||x>C.bb[2]+3||z<C.bb[1]-3||z>C.bb[3]+3)continue;if(KCAMP.inPoly(C.P,x,z))return true;
  for(let i=0;i<C.P.length;i++){const a=C.P[i],b=C.P[(i+1)%C.P.length],ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez,t=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/L2));
   if(Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t)<3)return true;}}
 return false;};
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
 G.position.set(C.c.site.x,0,C.c.site.z);G.name='camp '+C.c.id;scene.add(G);return G;}
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
function update(){const P=camera.position;let nf=0;S.near=0;
 for(const C of X){const d=Math.hypot(P.x-C.c.site.x,P.z-C.c.site.z,(P.y-H(C.c.site.x,C.c.site.z))*.5),want=d<FULL?'full':d<FAR?'mass':'none';
  if(want==='full'&&!C.group)C.group=full(C);
  if(want==='mass'&&!C.massG)C.massG=massing(C);
  if(C.group)C.group.visible=want==='full';if(C.massG)C.massG.visible=want==='mass';if(want==='full'){nf++;split(C,P);}}
 S.full=nf;}
HOST.TICKS.push(()=>update());
S.ms=Math.round(performance.now()-t0);
/* ---------------------------------------------------------------- the checks verify.py reads (each with its negative)
   plan: the baked plan made again here, in the browser, on the page's own land: the same hash (a stale bake fails)
   ground: KSITES.check on the land as it stands (whole, apart, on good ground, inside the hedge, each track at its gate)
   clear: every tent, pen and pasture corner kept clear of the flora */
function checks(neg){const R=[];
 {let P2=null,err='';off=true;try{if(typeof SITE_SPEC!=='undefined'){P2=KSITES.plan(SITE_SPEC,{dims:siteDims,programs:sitePrograms});}}catch(e){err=String(e&&e.stack||e);}finally{off=false;}
  const h2=P2?(neg==='plan'?KSITES.hash(Object.assign({},P2,{world:P2.world+1})):P2.hash):'-';
  R.push({name:'the sites: the baked plan is the plan made here',ok:!!P2&&h2===PLAN.hash,detail:err||('baked '+PLAN.hash+', made here '+h2+(P2?', '+P2.sites.reduce((n,s)=>n+s.camps.length,0)+' camps':''))});}
 {off=true;let K;try{K=KSITES.check(neg==='ground'?shifted(PLAN):PLAN);}finally{off=false;}
  R.push({name:"the sites on the world's ground: every camp whole, its boxes apart and on good ground, inside its hedge, every track at its gate",ok:K.ok&&K.counts.camps>0,
   detail:K.ok?JSON.stringify(K.counts):K.problems.slice(0,6).join('; ')});}
 {const clr=neg==='clear'?prevClear:WORLD.clearHook,bad=[];
  /* every camp's pieces looked up, drawn or not (a camp past FULL has not asked for its pieces yet) */
  for(const C of X){for(const r of C.recs)if(!(typeof isleProto==='function'&&isleProto('cat',r.key,r.v,CACHE))&&S.missing.indexOf(r.key)<0)S.missing.push(r.key);
   for(const p of C.runs)if(!(typeof isleProto==='function'&&isleProto('cat',p.key,p.v,CACHE))&&S.missing.indexOf(p.key)<0)S.missing.push(p.key);}
  for(const C of X){const pts=C.recs.map(r=>[r.x,r.z]).concat(C.c.pasture?C.c.pasture.pts:[]),kept=pts.filter(p=>!(clr&&clr(p[0],p[1]))).length;if(kept)bad.push(C.c.id+': '+kept+' places not clear');}
  const A=TAGS.audit();if(A.unknown)bad.push(A.unknown+' unknown tag values');
  if(S.missing.length&&!neg)bad.push('no piece for '+S.missing.join(', '));
  R.push({name:'the sites drawn: cleared of flora, tagged, every piece the kit\'s',ok:!bad.length&&X.length>0,detail:bad.length?bad.join('; '):X.length+' camps, '+S.records+' tents and pens, '+S.pieces+' hedge and rail pieces, '+S.roads+' tracks'});}
 return R;}
/* the negative for the ground check: one camp's first tent moved 500 m off (into the open, onto whatever is there) */
function shifted(P){const Q=JSON.parse(JSON.stringify(P)),C=Q.sites[0]&&Q.sites[0].camps[0];if(C){C.records[0].x=C.records[1].x;C.records[0].z=C.records[1].z;}return Q;}
const siteDims=(k,v)=>{const A=CATK[k];if(!A)return null;const qd=A.variantDims&&A.variantDims[v];return qd?{w:qd.w,d:qd.d,h:qd.h}:{w:A.w,d:A.d,h:A.h};};
const sitePrograms=t=>{const T=typeof BR_CAMP!=='undefined'&&BR_CAMP[t];return T&&T.grounds&&T.grounds.lower||null;};
window._sites={plan:PLAN,stats:S,tags:()=>TAGS.audit(),checks,raw:X,
 camps:X.map(C=>({id:C.c.id,site:C.c.site,R:C.c.R,records:C.recs.length,pieces:C.runs.length,pop:C.c.census.pop}))};
return{update,stats:S,tags:TAGS};})();});
