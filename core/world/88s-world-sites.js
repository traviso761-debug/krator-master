// ================================================================= OPEN WORLD — sites drawn: the baked plan's camps and tracks
// [web] Draws WORLD_DATA.sites, the region's plan (core/world/48s-world-sites.js KSITES, baked by core/world/bake_sites.py
// to openworld/<region>/plan/sites.json); it decides nothing (CLAUDE.md: a builder draws a record). The isle demo's camp
// drawing (openworld/isle-demo/src/88k-world-camps.js) made general: one camp per plan record, not one per spec.
// At load: every record is registered in core/tags (build '<region>:sites': each camp a landmark, its tents and pens its
// children, its hedge and rails infrastructure), and the world keeps its flora and floor off everything inside a camp's
// hedge (WORLD.clearHook, chained). The tracks are already the world's roads (the build put the plan's roads into
// WORLD_DATA.roads: the ground is shaped to them and the terrain draws them). Each frame: a camp within FULL of the
// camera draws the kit's own pieces (CAT with the Beast Riders' tent set, built once each and flattened by the shared
// instancer, settlements/isle-demo/src/58-isle-protos.js); farther, a massing dome a tent out to FAR.
// window._sites holds the plan, the counts and errors, the tag audit and the checks verify.py reads.
var SITES_DRAW;LATE.push(()=>{SITES_DRAW=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,FULL=3500,FAR=30000,t0=performance.now();
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
const KD=Object.assign({},...Object.keys(VK).map(k=>VK[k].dims));
const vhash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
/* a link's stops (48s stops()) are drawn as villages of one building and a lane: the same footing, merge, keep-clear,
   tags and checks */
const STOPV=[];for(const Lk of PLAN.links||[])for(const s of Lk.stops||[])STOPV.push({St:{name:s.kind==='inn'?'a caravanserai':'a rest stop'},
 V:{id:s.id,name:s.name,culture:s.culture,focus:s.kind,site:{x:s.x,z:s.z},records:s.records,lanes:[s.lane],census:{pop:s.staff,households:1}},stop:true});
for(const E of PLAN.sites.flatMap(St=>(St.hamlets||[]).map(V=>({St,V}))).concat(STOPV)){const St=E.St,V=E.V;
 const base=TAGS.add({class:'landmark',kind:E.stop?'waystation':'village',key:V.id,name:E.stop?V.name:V.name+' ('+St.name+')',at:[V.site.x,H(V.site.x,V.site.z),V.site.z],r:E.stop?60:220,h:14,
  tags:{culture:V.culture,types:E.stop?['inn']:['dwelling-multi','farm'],role:E.stop?'waystation':'village'},note:E.stop?'core/world 48s stops: '+V.census.pop+' keepers':'core/hamlet ('+V.focus+'): '+V.census.pop+' people, '+V.census.households+' households'});
 const VD=VK[V.culture]?VK[V.culture].dims:{};
 const B=V.records.map(r=>{const K=VD[r.key],kit=!!K&&!r.pending,fw=kit&&K.fw?K.fw:r.w,fd=kit&&K.fd?K.fd:r.d,c=Math.cos(r.ry),s=Math.sin(r.ry);
  const hs=[[-1,-1],[1,-1],[1,1],[-1,1],[0,0]].map(([u,w])=>H(r.x+u*fw/2*c+w*fd/2*s,r.z-u*fw/2*s+w*fd/2*c)),top=Math.max.apply(null,hs),low=Math.min.apply(null,hs);
  const nv=kit?Math.max(1,Math.min(3,K.variants|0)):1;
  TAGS.child(base.id,{class:'building',key:r.key,at:[r.x,low,r.z],ry:r.ry,size:[r.w,r.d,r.h+(top-low)],
   tags:{culture:V.culture,types:kit&&K.types?K.types:[r.role==='house'?'dwelling-single':'farm']},note:kit?undefined:'the kit has no '+r.key+' yet: a massing box'});
  return{r,kit,y:kit?top:low,low,drop:Math.max(1,Math.ceil(top-low+.4)),v:vhash(r.id)%nv};});
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
const prevClear=WORLD.clearHook;
/* off: the ground rule as the plan read it (WORLD.townW counts what the clear hook keeps clear, so with the camps' own
   clearing on, every tent would stand on cleared ground) */
let off=false;
WORLD.clearHook=(x,z)=>{if(prevClear&&prevClear(x,z))return true;if(off)return false;
 if(VIL.length&&onVillage(x,z))return true;
 for(const C of X){if(x<C.bb[0]-3||x>C.bb[2]+3||z<C.bb[1]-3||z>C.bb[3]+3)continue;if(KCAMP.inPoly(C.P,x,z))return true;
  for(let i=0;i<C.P.length;i++){const a=C.P[i],b=C.P[(i+1)%C.P.length],ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez,t=Math.max(0,Math.min(1,((x-a[0])*ex+(z-a[1])*ez)/L2));
   if(Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t)<3)return true;}}
 return false;};
/* ---------------------------------------------------------------- the pieces: full near, massing far */
const CACHE={protos:{},failed:{},built:0},m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v3=new THREE.Vector3();
const domeG=new THREE.SphereGeometry(.5,10,6,0,Math.PI*2,0,Math.PI/2).scale(1,2,1),boxG=new THREE.BoxGeometry(1,1,1).translate(0,.5,0);
const tentM=new THREE.MeshLambertMaterial({color:0xd8c8a4}),penM=new THREE.MeshLambertMaterial({color:0x7a6248}),pendM=new THREE.MeshLambertMaterial({color:0x8a7e6a});
function mat(C,x,y,z,ry,sx){q.setFromEuler(e.set(0,ry,0));return m4.compose(v3.set(x-C.c.site.x,y,z-C.c.site.z),q,new THREE.Vector3(sx==null?1:sx,1,1)).clone();}
function full(C){const G=new THREE.Group(),by={},missing=[];
 const add=(key,v,M4)=>{const P=typeof isleProto==='function'?isleProto('cat',key,v,CACHE):null;if(!P)return false;(by[P.id]||(by[P.id]={P,L:[]})).L.push(M4);return true;};
 for(const r of C.recs)if(!add(r.key,r.v,mat(C,r.x,r.y,r.z,r.ry)))missing.push(r);
 /* a run piece is built at the kit's default span and stretched to its own; a gate is its own fixed piece */
 for(const p of C.runs){const A=CATK[p.key]||{},sp=A.span||{},def=p.v?(sp.gate==null?7:sp.gate):(sp.default==null?8:sp.default);
  if(!add(p.key,p.v,mat(C,p.x,p.y,p.z,p.ry,p.v?1:p.span/def)))missing.push({key:p.key,x:p.x,y:p.y,z:p.z,ry:p.ry,w:p.span,d:1,h:1.5});}
 for(const id in by){const B=by[id];for(const pt of B.P.parts){const im=new THREE.InstancedMesh(pt.geo,pt.mat,B.L.length);B.L.forEach((M4,i)=>im.setMatrixAt(i,M4));im.name=id;im.userData.inspectLabel=id;G.add(im);}}
 if(missing.length){const im=new THREE.InstancedMesh(boxG,pendM,missing.length);missing.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));im.setMatrixAt(i,m4.compose(v3.set(r.x-C.c.site.x,r.y,r.z-C.c.site.z),q,new THREE.Vector3(r.w,r.h,r.d)));});G.add(im);
  missing.forEach(r=>{if(S.missing.indexOf(r.key)<0)S.missing.push(r.key);});}
 G.position.set(C.c.site.x,0,C.c.site.z);G.name='camp '+C.c.id;scene.add(G);return G;}
function massing(C){const T=C.recs.filter(r=>r.kind!=='pen'),Pn=C.recs.filter(r=>r.kind==='pen');
 const a=new THREE.InstancedMesh(domeG,tentM,Math.max(1,T.length)),b=new THREE.InstancedMesh(boxG,penM,Math.max(1,Pn.length));
 T.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));a.setMatrixAt(i,m4.compose(v3.set(r.x-C.c.site.x,r.y,r.z-C.c.site.z),q,new THREE.Vector3(r.w*.9,r.h*.5,r.d*.9)));});
 Pn.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));b.setMatrixAt(i,m4.compose(v3.set(r.x-C.c.site.x,r.y,r.z-C.c.site.z),q,new THREE.Vector3(r.w,1.2,r.d)));});
 a.count=T.length;b.count=Pn.length;const G=new THREE.Group();G.add(a,b);G.position.set(C.c.site.x,0,C.c.site.z);G.name='camp massing '+C.c.id;scene.add(G);return G;}
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
 for(const b of W.B){const r=b.r,m=new THREE.Matrix4().compose(new THREE.Vector3(r.x-ox,b.y,r.z-oz),q.setFromEuler(e.set(0,r.ry,0)).clone(),new THREE.Vector3(1,1,1));
  const parts=b.kit?vproto(W.V.culture,r.key,b.v,b.drop):null;if(parts)copies.push({parts,m});else boxes.push(b);}
 if(copies.length)vmerge(copies,G);
 if(boxes.length){const im=new THREE.InstancedMesh(boxG,wallM,boxes.length);boxes.forEach((b,i)=>{const r=b.r;im.setMatrixAt(i,m4.compose(v3.set(r.x-ox,b.low-.3,r.z-oz),q.setFromEuler(e.set(0,r.ry,0)),new THREE.Vector3(r.w,r.h+.3,r.d)));});G.add(im);}
 /* the lanes: packed earth, a quad a 4 m step, 0.1 m over the ground */
 const P=[];for(const l of W.V.lanes)for(let i=1;i<l.pts.length;i++){const a=l.pts[i-1],c=l.pts[i],len=Math.hypot(c[0]-a[0],c[1]-a[1]),n=Math.max(1,Math.ceil(len/4)),tx=(c[0]-a[0])/len,tz=(c[1]-a[1])/len,hw=l.w/2;
  for(let k=0;k<n;k++){const p0=[a[0]+tx*len*k/n,a[1]+tz*len*k/n],p1=[a[0]+tx*len*(k+1)/n,a[1]+tz*len*(k+1)/n];
   const Q4=[[p0[0]-tz*hw,p0[1]+tx*hw],[p0[0]+tz*hw,p0[1]-tx*hw],[p1[0]+tz*hw,p1[1]-tx*hw],[p1[0]-tz*hw,p1[1]+tx*hw]].map(([x,z])=>[x-ox,H(x,z)+.1,z-oz]);
   P.push(...Q4[0],...Q4[1],...Q4[2],...Q4[0],...Q4[2],...Q4[3]);}}
 if(P.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();
  const lm=new THREE.Mesh(g,earthM);lm.material.side=THREE.DoubleSide;G.add(lm);}
 G.position.set(ox,0,oz);G.name='village '+W.V.id;scene.add(G);return G;}
function villageMass(W){const im=new THREE.InstancedMesh(boxG,wallM,Math.max(1,W.B.length)),ox=W.V.site.x,oz=W.V.site.z;
 W.B.forEach((b,i)=>{const r=b.r;im.setMatrixAt(i,m4.compose(v3.set(r.x-ox,b.low,r.z-oz),q.setFromEuler(e.set(0,r.ry,0)),new THREE.Vector3(r.w*.9,r.h,r.d*.9)));});
 im.count=W.B.length;const G=new THREE.Group();G.add(im);G.position.set(ox,0,oz);G.name='village massing '+W.V.id;scene.add(G);return G;}
const FULL_V=4000;
function update(){const P=camera.position;let nf=0;
 for(const W of VIL){const d=Math.hypot(P.x-W.V.site.x,P.z-W.V.site.z),want=d<FULL_V?'full':d<FAR?'mass':'none';
  if(want==='full'&&!W.group)W.group=villageFull(W);if(want==='mass'&&!W.massG)W.massG=villageMass(W);
  if(W.group)W.group.visible=want==='full';if(W.massG)W.massG.visible=want==='mass';if(want==='full')nf++;}
 for(const C of X){const d=Math.hypot(P.x-C.c.site.x,P.z-C.c.site.z),want=d<FULL?'full':d<FAR?'mass':'none';
  if(want==='full'&&!C.group)C.group=full(C);
  if(want==='mass'&&!C.massG)C.massG=massing(C);
  if(C.group)C.group.visible=want==='full';if(C.massG)C.massG.visible=want==='mass';if(want==='full')nf++;}
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
  R.push({name:'the sites: the baked plan is the plan made here',ok:!!P2&&h2===PLAN.hash,detail:err||('baked '+PLAN.hash+', made here '+h2+(P2?', '+P2.sites.reduce((n,s)=>n+s.camps.length,0)+' camps, '+P2.sites.reduce((n,s)=>n+(s.hamlets||[]).length,0)+' villages':''))});}
 {off=true;let K;try{K=KSITES.check(neg==='ground'?shifted(PLAN):PLAN);}finally{off=false;}
  R.push({name:"the sites on the world's ground: every camp and village whole, its boxes apart and on good ground, inside its hedge, every road at its gate or lane end",ok:K.ok&&(K.counts.camps+(K.counts.hamlets||0))>0,
   detail:K.ok?JSON.stringify(K.counts):K.problems.slice(0,6).join('; ')});}
 {const clr=neg==='clear'?prevClear:WORLD.clearHook,bad=[];
  for(const C of X){const pts=C.recs.map(r=>[r.x,r.z]).concat(C.c.pasture?C.c.pasture.pts:[]),kept=pts.filter(p=>!(clr&&clr(p[0],p[1]))).length;if(kept)bad.push(C.c.id+': '+kept+' places not clear');}
  for(const W of VIL){const pts=W.V.records.map(r=>[r.x,r.z]).concat(...W.V.lanes.map(l=>l.pts.slice(1).map((p,i)=>[(p[0]+l.pts[i][0])/2,(p[1]+l.pts[i][1])/2]))),kept=pts.filter(p=>!(clr&&clr(p[0],p[1]))).length;if(kept)bad.push(W.V.id+': '+kept+' places not clear');}
  const A=TAGS.audit();if(A.unknown)bad.push(A.unknown+' unknown tag values');
  if(S.missing.length&&!neg)bad.push('no piece for '+S.missing.join(', '));
  R.push({name:'the sites drawn: cleared of flora, tagged, every piece the kit\'s',ok:!bad.length&&(X.length+VIL.length)>0,detail:bad.length?bad.join('; '):X.length+' camps, '+VIL.length+' villages, '+S.records+' buildings, tents and pens, '+S.pieces+' hedge and rail pieces, '+S.roads+' roads'});}
 return R;}
/* the negative for the ground check: one camp's first tent moved 500 m off (into the open, onto whatever is there) */
function shifted(P){const Q=JSON.parse(JSON.stringify(P)),S0=Q.sites[0],C=S0&&(S0.camps[0]||(S0.hamlets||[])[0]);if(C){C.records[0].x=C.records[1].x;C.records[0].z=C.records[1].z;}return Q;}
const siteDims=(k,v)=>{const A=CATK[k];if(!A){const X2=KD[k];return X2?{w:X2.w,d:X2.d,h:X2.h}:null;}const qd=A.variantDims&&A.variantDims[v];return qd?{w:qd.w,d:qd.d,h:qd.h}:{w:A.w,d:A.d,h:A.h};};
const sitePrograms=t=>{const T=typeof BR_CAMP!=='undefined'&&BR_CAMP[t];return T&&T.grounds&&T.grounds.lower||null;};
window._sites={plan:PLAN,stats:S,tags:()=>TAGS.audit(),checks,raw:X,villages:VIL.map(W=>({id:W.V.id,site:W.V.site,records:W.B.length,pop:W.V.census.pop})),
 camps:X.map(C=>({id:C.c.id,site:C.c.site,R:C.c.R,records:C.recs.length,pieces:C.runs.length,pop:C.c.census.pop}))};
return{update,stats:S,tags:TAGS};})();});
