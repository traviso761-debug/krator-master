// ================================================================= ISLE DEMO — the camps drawn: tents, pens, the hedge and the pasture's rails
// [web] Draws what ISLE_CAMPS.make (48k-world-camps.js) pitched; it decides nothing (CLAUDE.md: a builder draws a record).
// At load: the camps are made once, every record is registered in core/tags (KTAGS, build 'isle-demo:camps': the camp a
// landmark, its tents and pens its children, the hedge and the rails as infrastructure), and the world keeps its flora
// and floor off everything inside the band's hedge (WORLD.clearHook, chained after the hamlets' and the towns': the band
// has cleared its ground) without reshaping the land. Each frame: a camp within FULL of the camera draws the Beast
// Riders' own pieces (CAT, with the kit's tent set: settlements/isle-demo/bundles.py cat_bundle(tents=True); built once
// each and flattened by the shared instancer, settlements/isle-demo/src/58-isle-protos.js), the hedge and the rails cut
// into the kit's pieces by its own BR_RUN; farther, a massing dome a tent out to FAR.
// window._camps holds the camps, their counts and errors, the tag audit and the checks verify.py reads.
var CAMPS_DRAW;LATE.push(()=>{CAMPS_DRAW=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,FULL=3500,FAR=30000;
const S={camps:0,records:0,pieces:0,errors:[],ms:0,full:0,missing:[]};
const t0=performance.now();
const CATK=(CAT&&CAT.ASSET_BY_KEY)||{};
const dims=(k,v)=>{const A=CATK[k];if(!A)return null;const q=A.variantDims&&A.variantDims[v];return q?{w:q.w,d:q.d,h:q.h}:{w:A.w,d:A.d,h:A.h};};
const programs=tribe=>{const T=BR_CAMP[tribe];return T&&T.grounds&&(T.grounds.lower||T.grounds.upper)||null;};
let M;try{M=ISLE_CAMPS.make(dims,programs);}catch(e){reportErr('camps: '+(e.stack||e));M={camps:[],errors:[String(e&&e.message||e)]};}
S.errors=M.errors.slice();
const H=(x,z)=>WORLD.H(x,z);
/* the camps on the sim (48k ISLE_CAMPS.simDeclare: the settlement, its places and people), after the towns (48t) */
let SD={camps:[],problems:[]};try{SD=ISLE_CAMPS.simDeclare(M);}catch(e){reportErr('camps sim: '+(e.stack||e));SD.problems.push(String(e&&e.message||e));}
SD.problems.forEach(p=>S.errors.push('sim: '+p));
/* ---------------------------------------------------------------- the records: heights, tags, the cleared ground */
const TAGS=KTAGS.create({build:'isle-demo:camps'});
const X=M.camps.map(E=>{const c=E.camp,sp=E.spec,BC=BR_CAMP[sp.tribe]||{};
 const base=TAGS.add({class:'landmark',kind:'camp',key:sp.id,name:sp.name,at:[c.site.x,H(c.site.x,c.site.z),c.site.z],r:c.R+40,h:12,
  tags:{culture:'beast-rider',types:['civic'],role:'camp'},note:'a band of the '+(BC.name||sp.tribe)+' tribe: '+E.census.pop+' people, '+E.census.mounts+' mounts; home '+sp.home});
 for(const r of c.records){r.y=H(r.x,r.z)-.12;const A=CATK[r.key]||{},t=A.tags||{};
  TAGS.child(base.id,{class:'building',key:r.key,at:[r.x,r.y,r.z],ry:r.ry,size:[r.w,r.d,r.h],
   tags:{culture:'beast-rider',types:A.types||['residential'],role:t.role||undefined,job:t.job||undefined}});}
 /* the hedge and the rails, cut into the kit's pieces (BR_RUN: its stretches and gates) */
 const runs=[];
 for(const L of [c.hedge,c.fence]){if(!L)continue;
  for(const p of BR_RUN(L.pts,{key:L.key,closed:true,gates:L.gates,seed:KRAND.hash(KCAMP.seedOf(4242,sp.id),runs.length)})){p.y=H(p.x,p.z)-.1;runs.push(p);}}
 const fence=TAGS.child(base.id,{class:'infrastructure',kind:'hedge',key:c.hedge?c.hedge.key:'br_hedge_thorn',at:[c.site.x,H(c.site.x,c.site.z),c.site.z],size:[c.R*2,c.R*2,2],
  tags:{culture:'beast-rider',types:['infrastructure'],role:'boundary'},note:runs.length+' pieces of thorn hedge and rail fence'});
 S.records+=c.records.length;S.pieces+=runs.length;
 /* the cleared ground: inside the hedge (a bounding box first, then the loop) */
 const P=c.hedge?c.hedge.pts:c.records.map(r=>[r.x,r.z]),bb=[1e18,1e18,-1e18,-1e18];
 P.forEach(q=>{bb[0]=Math.min(bb[0],q[0]);bb[1]=Math.min(bb[1],q[1]);bb[2]=Math.max(bb[2],q[0]);bb[3]=Math.max(bb[3],q[1]);});
 return{E,c,sp,base,runs,P,bb,group:null,massG:null};});
const prevClear=WORLD.clearHook;
/* selfOff: the ground rule read as it was when the camp was pitched (WORLD.townW counts what the clear hook keeps clear,
   so with the camp's own clearing on, every tent would stand on "town" ground) */
let selfOff=false;
WORLD.clearHook=(x,z)=>{if(prevClear&&prevClear(x,z))return true;if(selfOff)return false;
 for(const C of X){if(x<C.bb[0]-3||x>C.bb[2]+3||z<C.bb[1]-3||z>C.bb[3]+3)continue;if(KCAMP.inPoly(C.P,x,z))return true;
  /* the hedge line itself, and a margin outside it for its brush */
  for(let i=0;i<C.P.length;i++){const a=C.P[i],b=C.P[(i+1)%C.P.length],ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez,t=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/L2));
   if(Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t)<3)return true;}}
 return false;};
S.camps=X.length;
/* ---------------------------------------------------------------- the pieces: full near, massing far */
const CACHE={protos:{},failed:{},built:0},m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v3=new THREE.Vector3();
const domeG=new THREE.SphereGeometry(.5,10,6,0,Math.PI*2,0,Math.PI/2).scale(1,2,1),boxG=new THREE.BoxGeometry(1,1,1).translate(0,.5,0);
const tentM=new THREE.MeshLambertMaterial({color:0xd8c8a4}),penM=new THREE.MeshLambertMaterial({color:0x7a6248}),pendM=new THREE.MeshLambertMaterial({color:0x8a7e6a});
function mat(C,x,y,z,ry,sx){q.setFromEuler(e.set(0,ry,0));return m4.compose(v3.set(x-C.c.site.x,y,z-C.c.site.z),q,new THREE.Vector3(sx==null?1:sx,1,1)).clone();}
function full(C){const G=new THREE.Group(),by={},missing=[];
 const add=(key,v,M4)=>{const P=isleProto('cat',key,v,CACHE);if(!P)return false;(by[P.id]||(by[P.id]={P,L:[]})).L.push(M4);return true;};
 for(const r of C.c.records)if(!add(r.key,r.v,mat(C,r.x,r.y,r.z,r.ry)))missing.push(r);
 /* a run piece is built at the kit's default span and stretched to its own; a gate is its own fixed piece */
 for(const p of C.runs){const A=CATK[p.key]||{},sp=A.span||{},def=p.v?(sp.gate||7):(sp.default||8);
  if(!add(p.key,p.v,mat(C,p.x,p.y,p.z,p.ry,p.v?1:p.span/def)))missing.push({key:p.key,x:p.x,y:p.y,z:p.z,ry:p.ry,w:p.span,d:1,h:1.5});}
 for(const id in by){const B=by[id];for(const pt of B.P.parts){const im=new THREE.InstancedMesh(pt.geo,pt.mat,B.L.length);B.L.forEach((M4,i)=>im.setMatrixAt(i,M4));im.name=id;im.userData.inspectLabel=id;G.add(im);}}
 if(missing.length){const im=new THREE.InstancedMesh(boxG,pendM,missing.length);missing.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));im.setMatrixAt(i,m4.compose(v3.set(r.x-C.c.site.x,r.y,r.z-C.c.site.z),q,new THREE.Vector3(r.w,r.h,r.d)));});G.add(im);
  missing.forEach(r=>{if(S.missing.indexOf(r.key)<0)S.missing.push(r.key);});}
 G.position.set(C.c.site.x,0,C.c.site.z);G.name='camp '+C.sp.id;scene.add(G);return G;}
function massing(C){const T=C.c.records.filter(r=>r.kind!=='pen'),Pn=C.c.records.filter(r=>r.kind==='pen');
 const a=new THREE.InstancedMesh(domeG,tentM,Math.max(1,T.length)),b=new THREE.InstancedMesh(boxG,penM,Math.max(1,Pn.length));
 T.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));a.setMatrixAt(i,m4.compose(v3.set(r.x-C.c.site.x,r.y,r.z-C.c.site.z),q,new THREE.Vector3(r.w*.9,r.h*.5,r.d*.9)));});
 Pn.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));b.setMatrixAt(i,m4.compose(v3.set(r.x-C.c.site.x,r.y,r.z-C.c.site.z),q,new THREE.Vector3(r.w,1.2,r.d)));});
 a.count=T.length;b.count=Pn.length;const G=new THREE.Group();G.add(a,b);G.position.set(C.c.site.x,0,C.c.site.z);G.name='camp massing '+C.sp.id;scene.add(G);return G;}
/* ---------------------------------------------------------------- the band's people: stand-ins where the sim poses them */
/* the camp presented while the camera is within PRESENT of it (its people decide and walk), abstract beyond (88t keeps the
   towns' own levels); the people within SHOW of the camera's ground point drawn as a body and a head, coloured by work */
const PRESENT=2500,SHOW=600,CAP=120,ROLE_COL={chief:0xd8a63a,shaman:0x8a4ab0,healer:0x8a4ab0,smith:0x5a5a5a,tackmaker:0x9a6a3a,hidemaker:0x7a5a3a,trader:0x2f8f6f,
 trainer:0xb23a2a,herder:0x6a8a3a,hunter:0x9a2e22,gatherer:0x3e7a5a,child:0xe8c890,elder:0xc8c8c8};
const bodyG=new THREE.CylinderGeometry(.22,.28,1.2,6).translate(0,.6,0),headG=new THREE.SphereGeometry(.17,8,6).translate(0,1.42,0);
const bodyM=new THREE.MeshLambertMaterial({color:0xffffff}),headM=new THREE.MeshLambertMaterial({color:0xb08060});
const folkB=new THREE.InstancedMesh(bodyG,bodyM,CAP),folkH=new THREE.InstancedMesh(headG,headM,CAP);
for(let i=0;i<CAP;i++)folkB.setColorAt(i,new THREE.Color(0xaaaaaa));   /* the colour buffer before the first draw, or the shader is built without it */
folkB.count=folkH.count=0;folkB.frustumCulled=folkH.frustumCulled=false;folkB.name='camp people';folkH.name='camp people (heads)';scene.add(folkB,folkH);
const col=new THREE.Color(),FOLK={drawn:0,level:{},posed:[]};
const poseT=()=>window._isleLife&&_isleLife.poseT?_isleLife.poseT():SIM.time();
function folk(){let n=0;FOLK.posed.length=0;const P=camera.position;
 if(typeof SIM==='undefined'||!SIM.R)return;
 for(const C of X){const s=C.sp.id,d=Math.hypot(P.x-C.c.site.x,P.z-C.c.site.z),want=d<PRESENT?'presented':'abstract';
  if(SIM.levelOf&&SIM.levelOf(s)!==want){SIM.level(s,want);}FOLK.level[s]=want;
  if(want!=='presented'||d>SHOW+C.c.R+800)continue;const t=poseT();
  for(const a of SIM.all('actor')){if(a.settlement!==s||n>=CAP)continue;const p=SIM.pose(a,t,{cheap:true});if(!p||p.hidden)continue;
   if(Math.hypot(p.x-P.x,p.z-P.z)>SHOW+200)continue;
   const y=H(p.x,p.z);m4.makeTranslation(p.x,y,p.z);folkB.setMatrixAt(n,m4);folkH.setMatrixAt(n,m4);folkB.setColorAt(n,col.setHex(ROLE_COL[a.job]||0xaaaaaa));
   FOLK.posed.push({id:a.id,x:p.x,z:p.z,act:p.act});n++;}}
 folkB.count=folkH.count=n;folkB.instanceMatrix.needsUpdate=folkH.instanceMatrix.needsUpdate=true;if(folkB.instanceColor)folkB.instanceColor.needsUpdate=true;FOLK.drawn=n;}
/* ---------------------------------------------------------------- each frame */
function update(){const P=camera.position;let nf=0;folk();
 for(const C of X){const d=Math.hypot(P.x-C.c.site.x,P.z-C.c.site.z),want=d<FULL?'full':d<FAR?'mass':'none';
  if(want==='full'&&!C.group)C.group=full(C);
  if(want==='mass'&&!C.massG)C.massG=massing(C);
  if(C.group)C.group.visible=want==='full';if(C.massG)C.massG.visible=want==='mass';if(want==='full')nf++;}
 S.full=nf;}
HOST.TICKS.push(()=>update());
S.ms=Math.round(performance.now()-t0);
/* ---------------------------------------------------------------- the checks verify.py reads (each with its negative) */
function checks(neg){const R=[],bad=[];
 if(!X.length)bad.push('no camp on the page');
 for(const C of X){const c=C.c,cs=C.E.census;
  if(c.short.length)bad.push(C.sp.id+': not pitched '+c.short.join(','));
  if(!(cs.pop>=40&&cs.pop<=70))bad.push(C.sp.id+': '+cs.pop+' people (a band is 40 to 70)');
  const recs=neg==='overlap'?c.records.map((r,i)=>i===1?Object.assign({},r,{x:c.records[0].x,z:c.records[0].z}):r):c.records;
  selfOff=true;let k;try{k=KCAMP.check({records:recs,hedge:c.hedge},{ok:ISLE_CAMPS.groundOk});}finally{selfOff=false;}
  if(k.overlaps)bad.push(C.sp.id+': '+k.overlaps+' overlapping boxes');if(k.offGround)bad.push(C.sp.id+': '+k.offGround+' boxes off good ground');
  if(k.outside)bad.push(C.sp.id+': '+k.outside+' boxes outside the hedge');
  const pts=c.records.map(r=>[r.x,r.z]).concat(c.pasture?c.pasture.pts:[]);
  const clr=neg==='clear'?prevClear:WORLD.clearHook,kept=pts.filter(q=>!(clr&&clr(q[0],q[1]))).length;
  if(kept)bad.push(C.sp.id+': '+kept+' of its places not kept clear of flora');}
 const A=TAGS.audit();if(A.unknown)bad.push(A.unknown+' unknown tag values');
 if(S.missing.length&&neg!=='overlap'&&neg!=='clear')bad.push('no piece for '+S.missing.join(', '));
 R.push({name:'the camps: pitched whole, a band of 40 to 70, no overlap, on good ground, inside the hedge, cleared, tagged',ok:!bad.length,
  detail:bad.length?bad.join('; '):X.map(C=>C.sp.id+': '+C.E.census.pop+' people in '+C.c.records.length+' tents and pens, '+C.runs.length+' hedge and rail pieces, ring '+C.c.R.toFixed(0)+' m').join('; ')});
 return R;}
window._camps={stats:S,sim:SD,folk:FOLK,camps:X.map(C=>({id:C.sp.id,site:C.c.site,R:C.c.R,records:C.c.records.length,pieces:C.runs.length,census:{pop:C.E.census.pop,mounts:C.E.census.mounts,households:C.E.census.households.length}})),
 tags:()=>TAGS.audit(),checks,raw:X};
return{update,stats:S,tags:TAGS};})();});
