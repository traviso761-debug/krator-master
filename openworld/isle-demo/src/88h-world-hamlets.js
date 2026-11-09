// ================================================================= ISLE DEMO — the hamlets drawn: buildings, lanes, greens, resources, felling
// [web] Draws what ISLE_HAMLETS.make (48-world-hamlets.js) laid out; it decides nothing (CLAUDE.md: a builder draws a
// record). At load: the villages are made once, every record is registered in core/tags (KTAGS, build 'isle-demo'),
// and the world keeps its flora and floor off the buildings, lanes and greens (WORLD.clearHook) without reshaping the
// land. Each frame: a village within FULL of the camera draws its kits' pieces (ISK / CAT, built once each and flattened:
// settlements/isle-demo/src/58-isle-protos.js), farther ones a massing box and roof per building, out to FAR. The lanes
// and greens are ribbons on the ground. The iron node is the Resources kit's own piece.
// THE FELLING: the lumber village fells its stand (the timber trees within its reach, by their kit's harvest.wood tag,
// core/hamlet 10) in the order KHAMLET.standOrder gives, on the world clock (HOST.clock: core/clock, 72-minute days):
// KHAMLET.fellState says, for the hour, which are stumps (drawn here) and which saplings (the flora draws its kit's
// sapling: FLORA.setState). Nothing is stored: the state is the function of the day (kept only while the game runs).
// THE FELLING CREW (2026-11-02; core/camp 40-camp-work.js, settlements/isle-demo 47h): where the sim runs the lumber
// village's crew as a work camp, the stumps follow it instead: each stand of its range the camp has worked, near the
// camera, has its timber trees (the cell's, in the order KHAMLET.standOrder gives from the cell's centre) in the state
// KCAMP.workTree gives for the sim's day and what the sim took from that stand. The camp itself is drawn where
// KCAMP.workAt puts it (stand-in shelters and a log pile: the Islanders kit has no camp pieces yet), registered in
// core/tags at each stand it pitches at, hidden on the march.
// window._hamlets holds the counts and errors a check reads.
var HAMLETS_DRAW;LATE.push(()=>{HAMLETS_DRAW=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,FULL=3500,FAR=30000;
const S={villages:0,buildings:0,pending:0,lanes:0,resources:0,errors:[],ms:0,full:0,protos:0,stand:0,gone:0,young:0,day:null};
const t0=performance.now();
/* the kits' boxes: the Islanders' (ISK.dims), the Beast Riders' (CAT.ASSET_BY_KEY) */
const IDIMS=ISK.dims(),CATK=(CAT&&CAT.ASSET_BY_KEY)||{};
const kitOf=k=>IDIMS[k]?'isk':CATK[k]?'cat':null;
const dims=k=>{const d=IDIMS[k];if(d)return{w:d.w,d:d.d,h:d.h};const a=CATK[k];return a?{w:a.w,d:a.d,h:a.h}:null;};
let M;try{M=ISLE_HAMLETS.made||ISLE_HAMLETS.make(dims);}   /* 48t made them once (and the sim declared them) */catch(e){reportErr('hamlets: '+(e.stack||e));M={villages:[],resources:[],errors:[String(e&&e.message||e)]};}
S.errors=M.errors.slice();
const H=(x,z)=>WORLD.H(x,z);
/* ---------------------------------------------------------------- the records: heights, tags, keep-clear */
const TAGS=KTAGS.create({build:'isle-demo'}),clear=KSPACE.create({cell:32});
const V=M.villages.map(E=>{const v=E.village,recs=v.records||[];
 const base=TAGS.add({class:'landmark',kind:'hamlet',key:v.id,name:E.spec.name,at:[v.site?v.site.x:0,v.site?H(v.site.x,v.site.z):0,v.site?v.site.z:0],r:220,h:20,
  tags:{culture:'islander',types:['civic'],role:E.spec.focus},note:E.spec.focus+' village of '+E.spec.parent+': '+(v.census?v.census.pop:0)+' people'});
 for(const r of recs){r.y=H(r.x,r.z)-.15;r.kit=kitOf(r.key);const d=IDIMS[r.key]||{};
  TAGS.child(base.id,{class:'building',key:r.key,at:[r.x,r.y,r.z],ry:r.ry,size:[r.w,r.d,r.h],
   tags:{culture:r.kit==='cat'?'beast-rider':'islander',types:d.types||['industry'],wealth:d.wealth||'poor',role:d.role||r.role,job:d.job||undefined}});
  clear.insert({x:r.x,z:r.z,r:Math.hypot(r.w,r.d)/2+3},r.x,r.z,Math.hypot(r.w,r.d)/2+3);if(r.pending)S.pending++;}
 for(const l of v.lanes||[]){const [a,b]=l.pts,L=Math.hypot(b[0]-a[0],b[1]-a[1]);
  TAGS.child(base.id,{class:'infrastructure',kind:'lane',key:l.id,at:[(a[0]+b[0])/2,H((a[0]+b[0])/2,(a[1]+b[1])/2),(a[1]+b[1])/2],ry:Math.atan2(b[0]-a[0],b[1]-a[1]),size:[l.w,L,.1],tags:{types:['infrastructure']}});
  for(let t=0;t<=L;t+=6){const x=a[0]+(b[0]-a[0])*t/L,z=a[1]+(b[1]-a[1])*t/L;clear.insert({x,z,r:l.w/2+1.5},x,z,l.w/2+1.5);}}
 if(v.green){clear.insert({x:v.green.x,z:v.green.z,r:Math.hypot(v.green.w,v.green.d)/2+2},v.green.x,v.green.z,Math.hypot(v.green.w,v.green.d)/2+2);}
 S.buildings+=recs.length;S.lanes+=(v.lanes||[]).length;return{E,v,recs,base,state:null,group:null,mass:[]};});
for(const R of M.resources){const y=R.x!=null?H(R.x,R.z):0;S.resources++;
 TAGS.add({class:'feature',kind:R.node?'resource node':R.kind==='stand'?'timber stand':'resource field',key:R.key||R.id,name:R.id,at:[R.x,y,R.z],r:R.node?6:R.radius==null?300:R.radius,h:4,
  tags:{types:['infrastructure'],role:R.kind},note:R.node?R.kind+' node, '+R.grade:R.kind+(R.cap!=null?', '+R.cap+' km2 at full weight, grade '+R.grade:'')});}
WORLD.clearHook=(x,z)=>clear.some(x,z,0,it=>Math.hypot(x-it.x,z-it.z)<it.r);
S.villages=V.length;
/* ---------------------------------------------------------------- lanes and greens: ribbons on the ground */
const laneMat=new THREE.MeshLambertMaterial({color:new THREE.Color(0x9a7e5a).convertSRGBToLinear(),polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}),greenMat=new THREE.MeshLambertMaterial({color:new THREE.Color(0x7f9a4e).convertSRGBToLinear(),polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
function ribbon(a,b,w,mat,lift){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/6)),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,px=-uz*w/2,pz=ux*w/2,c=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 const pos=new Float32Array((n+1)*6),idx=[];for(let i=0;i<=n;i++){const x=a[0]+ux*L*i/n,z=a[1]+uz*L*i/n;
  for(const s of [-1,1]){const xx=x+px*s,zz=z+pz*s,o=(i*2+(s>0?1:0))*3;pos[o]=xx-c[0];pos[o+1]=H(xx,zz)+lift;pos[o+2]=zz-c[1];}
  if(i<n){const q=i*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}}   /* wound to face up: facing down they were culled, every lane and green unseen (2026-10-26, as Longsong's square) */
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,mat);m.position.set(c[0],0,c[1]);m.userData.inspectLabel='lane';scene.add(m);return m;}
for(const X of V){for(const l of X.v.lanes||[])ribbon(l.pts[0],l.pts[1],l.w,laneMat,.35);
 const g=X.v.green;if(g){const a=[g.x-Math.sin(g.ry)*g.d/2,g.z-Math.cos(g.ry)*g.d/2],b=[g.x+Math.sin(g.ry)*g.d/2,g.z+Math.cos(g.ry)*g.d/2];ribbon(a,b,g.w,greenMat,.3);}}
/* ---------------------------------------------------------------- the pieces: full near, massing far */
const CACHE={protos:{},failed:{},built:0},m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v3=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
const boxG=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),roofG=new THREE.ConeGeometry(.72,1,4,1).rotateY(Math.PI/4).translate(0,.5,0);
const bodyM=new THREE.MeshLambertMaterial({color:0xb39a74}),roofM=new THREE.MeshLambertMaterial({color:0xc9ac6e}),pendM=new THREE.MeshLambertMaterial({color:0x8a7e6a});
function local(X,r){q.setFromEuler(e.set(0,r.ry,0));return m4.compose(v3.set(r.x-X.v.site.x,r.y,r.z-X.v.site.z),q,one).clone();}
function massing(X){const n=X.recs.length,b=new THREE.InstancedMesh(boxG,bodyM,n),rf=new THREE.InstancedMesh(roofG,roofM,n);
 X.recs.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));const wh=Math.max(2.5,r.h*.45);
  b.setMatrixAt(i,m4.compose(v3.set(r.x-X.v.site.x,r.y,r.z-X.v.site.z),q,new THREE.Vector3(r.w*.9,wh,r.d*.9)));
  rf.setMatrixAt(i,m4.compose(v3.set(r.x-X.v.site.x,r.y+wh,r.z-X.v.site.z),q,new THREE.Vector3(r.w*1.02,Math.max(1.5,r.h-wh),r.d*1.02)));});
 const G=new THREE.Group();G.add(b,rf);G.position.set(X.v.site.x,0,X.v.site.z);G.name='hamlet massing '+X.v.id;scene.add(G);return G;}
function full(X){const G=new THREE.Group(),by={},missing=[];
 for(const r of X.recs){const P=r.kit?isleProto(r.kit,r.key,0,CACHE):null;if(!P){missing.push(r);continue;}(by[P.id]||(by[P.id]={P,L:[]})).L.push(r);}
 for(const id in by){const B=by[id];for(const pt of B.P.parts){const im=new THREE.InstancedMesh(pt.geo,pt.mat,B.L.length);B.L.forEach((r,i)=>im.setMatrixAt(i,local(X,r)));im.name=id;im.userData.inspectLabel=id;G.add(im);}}
 if(missing.length){const im=new THREE.InstancedMesh(boxG,pendM,missing.length);missing.forEach((r,i)=>{q.setFromEuler(e.set(0,r.ry,0));im.setMatrixAt(i,m4.compose(v3.set(r.x-X.v.site.x,r.y,r.z-X.v.site.z),q,new THREE.Vector3(r.w,r.h,r.d)));});G.add(im);}
 G.position.set(X.v.site.x,0,X.v.site.z);G.name='hamlet '+X.v.id;scene.add(G);S.protos=CACHE.built;return G;}
/* the iron node: the Resources kit's own piece (in ISK's bundle) */
for(const R of M.resources)if(R.node){const P=isleProto('isk',R.key,0,CACHE);if(!P)continue;const G=new THREE.Group();
 for(const pt of P.parts){const mesh=new THREE.Mesh(pt.geo,pt.mat);G.add(mesh);}G.position.set(R.x,H(R.x,R.z)-.2,R.z);G.name='resource node '+R.key;scene.add(G);}
/* ---------------------------------------------------------------- the felling: the lumber village's stand on the clock */
const LUM=V.find(X=>X.E.spec.focus==='lumber'&&X.v.site);let STAND=null,IDX=null,SCH=null,stumps=null,lastDay=null;
/* a tree's id: its place to the cm (the flora's records are rebuilt the same from their tile; their hash is not unique) */
const treeId=r=>Math.round(r.x*100)+','+Math.round(r.z*100);
function woodOf(r){const K=FLORA.KITS[r.k],Sp=K&&K.SP&&K.SP[r.sp],h=Sp&&Sp.tags&&Sp.tags.harvest;return h?h.wood:null;}
function buildStand(){if(!LUM||STAND)return;const rad=KHAMLET.CULTURES.islander_east.reach.lumber,s=LUM.v.site,TS=FLORA.TS,trees=[];
 const saw=LUM.recs.filter(r=>r.key==='ie-sawpit'),at=saw.length?[saw[0].x,saw[0].z]:[s.x,s.z];
 for(let tz=Math.floor((s.z-rad)/TS);tz<=Math.floor((s.z+rad)/TS);tz++)for(let tx=Math.floor((s.x-rad)/TS);tx<=Math.floor((s.x+rad)/TS);tx++)
  for(const r of FLORA.buildTile(tx,tz))if(!r.sap&&Math.hypot(r.x-s.x,r.z-s.z)<rad&&KHAMLET.woodWorks(woodOf(r)).indexOf('sawpit')>=0)trees.push({id:treeId(r),x:r.x,z:r.z,rb:r.rb||.4});
 STAND=KHAMLET.standOrder(trees,at);IDX=new Map(STAND.map((t,k)=>[t.id,k]));
 const jobs=LUM.recs.filter(r=>r.key==='ie-sawpit').length*((KHAMLET.CULTURES.islander_east.works.lumber.find(w=>w.key==='ie-sawpit')||{jobs:14}).jobs);
 SCH=KHAMLET.fellSchedule(STAND.length,jobs);S.stand=STAND.length;S.schedule={rate:SCH.rate,cycle:Math.round(SCH.cycle)};
 stumps=new THREE.InstancedMesh(new THREE.CylinderGeometry(.85,1,1,8).translate(0,.5,0),new THREE.MeshLambertMaterial({color:0x8a6a52}),Math.max(1,STAND.length));
 stumps.count=0;stumps.name='felled stumps';stumps.frustumCulled=false;scene.add(stumps);
 FLORA.setState(r=>{if(!IDX||r.sap)return null;const k=IDX.get(treeId(r));return k==null?null:KHAMLET.fellState(SCH,k,dayNow());});}
const dayNow=()=>{const C=HOST.clock;return C?C.day+C.hour/24:0;};
function felling(){if(!STAND)return;const d=dayNow();if(lastDay!=null&&Math.abs(d-lastDay)<.02)return;lastDay=d;let g=0,y=0;
 STAND.forEach((t,k)=>{const s=KHAMLET.fellState(SCH,k,d);if(s==='gone'){q.identity();stumps.setMatrixAt(g++,m4.compose(v3.set(t.x,H(t.x,t.z)-.05,t.z),q,new THREE.Vector3(t.rb*.9,.55,t.rb*.9)));}else if(s==='young')y++;});
 stumps.count=g;stumps.instanceMatrix.needsUpdate=true;S.gone=g;S.young=y;S.day=Math.round(d*100)/100;}
/* ---------------------------------------------------------------- the felling crews' camps and stands (core/camp 40) */
/* every lumber village's crew (Kautoa's, and Valapo's since 2026-11-04), each its camp and its stands' stumps; one flora
   state over them all (a tree belongs to at most one crew's stand) */
const CREWS=(typeof ISLE!=='undefined'&&ISLE.SIM&&ISLE.SIM.crews||[]).map(C=>({C,campG:null,cstumps:null,cLast:null})),CREW=CREWS.length?CREWS[0].C:null,CSTAND=new Map(),CIDX=new Map(),CTAG={};let flState=false;
const simDay=()=>typeof SIM!=='undefined'&&SIM.minute?SIM.minute()/1440:dayNow();
function crewTaken(K,s){const E=SIM.econ(K.settlement),W=K.W;if(!W.cur||W.cur.stand!==s)return undefined;const St=E&&E.resSites[s];return St?St.taken-K.taken0:0;}
function crewTrees(K,St){if(CSTAND.has(St.id))return CSTAND.get(St.id);const c=K.W.cfg.cell,x0=St.x-c/2,z0=St.z-c/2,TS=FLORA.TS,trees=[];
 for(let tz=Math.floor(z0/TS);tz<=Math.floor((z0+c)/TS);tz++)for(let tx=Math.floor(x0/TS);tx<=Math.floor((x0+c)/TS);tx++)
  for(const r of FLORA.buildTile(tx,tz))if(!r.sap&&r.x>=x0&&r.x<x0+c&&r.z>=z0&&r.z<z0+c&&KHAMLET.woodWorks(woodOf(r)).indexOf('sawpit')>=0)trees.push({id:treeId(r),x:r.x,z:r.z,rb:r.rb||.4});
 const L=KHAMLET.standOrder(trees,[St.x,St.z]);L.forEach((t,k)=>CIDX.set(t.id,{K,s:St.id,k,n:L.length}));CSTAND.set(St.id,L);return L;}
function crewCamp(K){const n=Math.max(3,Math.round(K.posts/4)),G=new THREE.Group(),im=new THREE.InstancedMesh(boxG,pendM,n+1);
 for(let i=0;i<n;i++){const a=i/n*Math.PI*2+.3,rr=14+(i%2)*4;q.setFromEuler(e.set(0,-a,0));im.setMatrixAt(i,m4.compose(v3.set(Math.cos(a)*rr,0,Math.sin(a)*rr),q,new THREE.Vector3(3.2,2.2,4)));}
 q.identity();im.setMatrixAt(n,m4.compose(v3.set(0,0,0),q,new THREE.Vector3(6,1.4,2.5)));   /* the log pile */
 G.add(im);G.name='felling camp '+K.id;scene.add(G);return G;}
function crewDraw(X,P){if(typeof KCAMP==='undefined')return;const K=X.C,W=K.W,d=simDay();
 if(X.cLast!=null&&Math.abs(d-X.cLast)<.02)return;X.cLast=d;
 const at=KCAMP.workAt(W,d);if(!X.campG)X.campG=crewCamp(K);
 if(at&&at.state!=='marching'){X.campG.visible=true;X.campG.position.set(at.x,H(at.x,at.z),at.z);
  if(!CTAG[at.stand]){CTAG[at.stand]=TAGS.add({class:'landmark',kind:'camp',key:K.id,name:'Felling camp',at:[at.x,H(at.x,at.z),at.z],r:25,h:3,
   tags:{culture:'islander',types:['industry'],role:'lumber'},note:'a lumber village\'s felling crew at '+at.stand});}}
 else X.campG.visible=false;
 (S.camps||(S.camps={}))[K.id]={state:at?at.state:null,stand:at?at.stand:null,moves:K.moves};if(X===CREWS[0])S.camp=S.camps[K.id];
 const near=W.stands.filter(St=>(W.last[St.id]||(W.cur&&W.cur.stand===St.id))&&Math.hypot(St.x-P.x,St.z-P.z)<1500);
 if(!flState){flState=true;FLORA.setState(r=>{if(r.sap)return null;const qq=CIDX.get(treeId(r));return qq?KCAMP.workTree(qq.K.W,qq.s,qq.k,qq.n,simDay(),crewTaken(qq.K,qq.s)):null;});}
 if(!X.cstumps){X.cstumps=new THREE.InstancedMesh(new THREE.CylinderGeometry(.85,1,1,8).translate(0,.5,0),new THREE.MeshLambertMaterial({color:0x8a6a52}),6000);X.cstumps.count=0;X.cstumps.name='felled stumps '+K.id;X.cstumps.frustumCulled=false;scene.add(X.cstumps);}
 let g=0,y=0,tot=0;for(const St of near){const L=crewTrees(K,St),tk=crewTaken(K,St.id);tot+=L.length;
  L.forEach((t,k)=>{const st=KCAMP.workTree(W,St.id,k,L.length,d,tk);if(st==='gone'&&g<6000){q.identity();X.cstumps.setMatrixAt(g++,m4.compose(v3.set(t.x,H(t.x,t.z)-.05,t.z),q,new THREE.Vector3(t.rb*.9,.55,t.rb*.9)));}else if(st==='young')y++;});}
 X.cstumps.count=g;X.cstumps.instanceMatrix.needsUpdate=true;if(X===CREWS[0]){S.stand=tot;S.gone=g;S.young=y;S.day=Math.round(d*100)/100;}}
/* ---------------------------------------------------------------- each frame */
function update(){const P=camera.position;let nf=0;
 for(const X of V){if(!X.v.site)continue;const d=Math.hypot(P.x-X.v.site.x,P.z-X.v.site.z),want=d<FULL?'full':d<FAR?'mass':'none';
  if(want==='full'&&!X.group){X.group=full(X);}
  if(want!=='none'&&!X.massG)X.massG=massing(X);
  if(X.group)X.group.visible=want==='full';if(X.massG)X.massG.visible=want==='mass';if(want==='full')nf++;}
 S.full=nf;if(CREWS.length){for(const X of CREWS){const W=X.C.W,c=W.cur?W.by[W.cur.stand]:null;if(c&&Math.hypot(P.x-c.x,P.z-c.z)<FULL*2)crewDraw(X,P);}}
 else if(LUM&&LUM.v.site&&Math.hypot(P.x-LUM.v.site.x,P.z-LUM.v.site.z)<FULL*2){buildStand();felling();}}
HOST.TICKS.push(()=>update());
S.ms=Math.round(performance.now()-t0);
window._hamlets={stats:S,villages:V.map(X=>({id:X.v.id,focus:X.E.spec.focus,parent:X.E.spec.parent,site:X.v.site,census:X.v.census,error:X.v.error||null,
 buildings:X.recs.length,resource:X.E.resource})),resources:M.resources,tags:()=>TAGS.audit(),views:V.filter(X=>X.v.site).map(X=>({id:X.v.id,x:X.v.site.x,z:X.v.site.z}))};
return{update,stats:S,tags:TAGS};})();});
