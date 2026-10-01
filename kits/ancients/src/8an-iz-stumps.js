// ================================================================= TOWER STUMPS — a snapped sibling beside each skyscraper
// A ruined-stump companion for every tower type (A-H, I, J, K): the lower
// storeys of a SIBLING of the tower, the rest of it gone, to stand beside the
// tower in its row. One helper, `skyStump`, parameterised per family by
// STUMP_FAM. It does not redraw any tower: it runs the family's OWN builder
// (so the section, the skins, the lining, the floor plates, the windows and
// every later accretion are that tower's, and follow it when the tower
// changes), then snaps it:
//   1. the whole sibling is turned by `ry` about its own axis, so the stump
//      shows the row camera a different face (and a different hole pattern)
//      from the ruined tower beside it, which is built from the same seed;
//   2. every triangle and every instanced item above a ragged break is
//      dropped. The break is a plane falling toward +z (the row camera) by
//      `slant`, with an fbm edge of a few storeys, so the section it opens is
//      the one the preset sees: floor plates, lining, the rooms behind;
//   3. the band of fabric just above the break (`band` m: shell, lining,
//      plates; glass shatters and is left out) is kept as two or three
//      fallen pieces of the tower's own fabric, rolled over and lying round
//      the foot, with a talus of rubble;
//   4. the sibling's registered volumes are turned with it and cut to the
//      break; any that lay wholly above it (K's rose, J's spire) are dropped.
// Decay: 0 and 1 build the sibling ruined (decay 1) and snap it at f*h, 2 is
// the same stump snapped lower (f*.62) with more of it on the ground, 3 builds
// the sibling at decay 3 (the scene loop's HOLES and repairPass do the rest:
// a stump camped in). `f` is a fraction of the tower's registered height,
// chosen per family so each stump keeps the part that says which tower it is
// (C keeps its whole tripod, G its block stack, I its podium tiers).
// SEEDS: each family's builder below opens with its parent tower's seed + 5
// (A 9100 -> 9105+d ... K 9780 -> 9785+d), which build.py's scan claims as
// N..N+4, clear of every other builder. The sibling builder then reseeds to
// its own stream, so the stump re-enters its own (`reseed(F.seed+d)`) before
// drawing anything: nothing the sibling places differs from the tower's.
const STUMP_FAM={
 A:{fn:buildSkyA,seed:9105,f:.30,band:24,ry:2.25},
 B:{fn:buildSkyB,seed:9115,f:.33,band:20,ry:1.9},
 C:{fn:buildSkyC,seed:9125,f:.46,band:22,ry:Math.PI*2/3},     // a third of a turn: the tripod still stands on its own three feet
 D:{fn:buildSkyD,seed:9135,f:.32,band:22,ry:Math.PI},
 E:{fn:buildSkyE,seed:9145,f:.30,band:20,ry:2.6},
 F:{fn:buildSkyF,seed:9155,f:.34,band:18,ry:2.1},
 G:{fn:buildSkyG,seed:9165,f:.50,band:20,ry:Math.PI},           // the drum snaps above the stack's top tier
 H:{fn:buildSkyH,seed:9175,f:.30,band:22,ry:Math.PI},
 I:{fn:buildSkyI,seed:9765,f:.30,band:22,ry:2.4},
 J:{fn:buildSkyJ,seed:9775,f:.32,band:22,ry:2.0},
 K:{fn:buildSkyK,seed:9785,f:.28,band:22,ry:Math.PI}};
// the per-family builders (the scene loop calls builders by key; see the dev target iziz-variants)
function buildStumpA(scene,gx,gz,d){reseed(9105+d);return skyStump(scene,gx,gz,d,'A');}
function buildStumpB(scene,gx,gz,d){reseed(9115+d);return skyStump(scene,gx,gz,d,'B');}
function buildStumpC(scene,gx,gz,d){reseed(9125+d);return skyStump(scene,gx,gz,d,'C');}
function buildStumpD(scene,gx,gz,d){reseed(9135+d);return skyStump(scene,gx,gz,d,'D');}
function buildStumpE(scene,gx,gz,d){reseed(9145+d);return skyStump(scene,gx,gz,d,'E');}
function buildStumpF(scene,gx,gz,d){reseed(9155+d);return skyStump(scene,gx,gz,d,'F');}
function buildStumpG(scene,gx,gz,d){reseed(9165+d);return skyStump(scene,gx,gz,d,'G');}
function buildStumpH(scene,gx,gz,d){reseed(9175+d);return skyStump(scene,gx,gz,d,'H');}
function buildStumpI(scene,gx,gz,d){reseed(9765+d);return skyStump(scene,gx,gz,d,'I');}
function buildStumpJ(scene,gx,gz,d){reseed(9775+d);return skyStump(scene,gx,gz,d,'J');}
function buildStumpK(scene,gx,gz,d){reseed(9785+d);return skyStump(scene,gx,gz,d,'K');}
const STUMP_BUILDERS={stumpA:buildStumpA,stumpB:buildStumpB,stumpC:buildStumpC,stumpD:buildStumpD,stumpE:buildStumpE,stumpF:buildStumpF,
 stumpG:buildStumpG,stumpH:buildStumpH,stumpI:buildStumpI,stumpJ:buildStumpJ,stumpK:buildStumpK};
// o (optional): {f, ry, band, slant} override the family's numbers
function skyStump(scene,gx,gz,d,fam,o){const F=STUMP_FAM[fam];o=o||{};const sd=d===3?3:1;
 // I, J and K publish per-decay site data for their presets; a sibling must not overwrite the tower's
 const sites=[typeof SI_SITE!=='undefined'?SI_SITE:null,typeof SJ_SITE!=='undefined'?SJ_SITE:null,typeof SK_SITE!=='undefined'?SK_SITE:null];
 const saved=sites.map(S=>S?S[sd]:undefined);
 const snap={};for(const n in KIT.items)snap[n]=KIT.items[n].length;const r0=REG.length;
 const G=F.fn(scene,gx,gz,sd);KOFF=[0,0,0];KXF=null;
 sites.forEach((S,i)=>{if(S){if(saved[i]===undefined)delete S[sd];else S[sd]=saved[i];}});
 reseed(F.seed+d);
 const ry=o.ry!=null?o.ry:F.ry,cy=Math.cos(ry),sy=Math.sin(ry),qy=qEuler(0,ry,0);
 // --- 1. turn the sibling about its own axis -------------------------------
 if(G){G.rotation.y+=ry;}
 const rot=(x,z)=>{const dx=x-gx,dz=z-gz;return[gx+dx*cy+dz*sy,gz-dx*sy+dz*cy];};
 for(const n in KIT.items){const it=KIT.items[n];for(let i=snap[n]||0;i<it.length;i++){const q=it[i];const p=rot(q.p[0],q.p[2]);q.p=[p[0],q.p[1],p[1]];q.q=q.q?q.q.clone().premultiply(qy):qy.clone();}}
 const base=REG[r0]||{r:100,h:300,y:0};
 for(let i=r0;i<REG.length;i++){const p=rot(REG[i].x,REG[i].z);REG[i].x=p[0];REG[i].z=p[1];}
 // --- 2. the break ----------------------------------------------------------
 const Hb=base.h,gy=base.y||0,R=Math.max(24,base.r*.45);
 const hc=gy+Hb*(o.f||F.f)*(d===2?.62:1),slant=o.slant!=null?o.slant:.14,J=5+.05*Hb*(o.f||F.f);
 const cutAt=(x,z)=>{const lx=x-gx,lz=z-gz,t=clamp(lz/R,-1.5,1.5),a=Math.atan2(lz,lx);
  return hc*(1-slant*t)+(fbm(Math.cos(a)*1.4+F.seed*.01,Math.sin(a)*1.4+3.1,F.seed*.37,3)*2-1)*J+(fbm(Math.cos(a)*5,Math.sin(a)*5,F.seed*.11,2)-.5)*J*.8;};
 const topMax=hc*(1+slant*1.5)+J*1.4;
 const t=tcur();
 // instanced items: dropped when their centre is above the break, or their top is well above it (a centre test
 // kept J's 500 m mast and K's campanile: long items whose middle sits below the break)
 const vb=new THREE.Vector3();
 const topOf=(n,q)=>{const g=KIT.defs[n]&&KIT.defs[n].geo;if(!g)return q.p[1];if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox;
  const sc=typeof q.s==='number'?[q.s,q.s,q.s]:(q.s||[1,1,1]);let top=-1e9;
  for(const x of[bb.min.x,bb.max.x])for(const y of[bb.min.y,bb.max.y])for(const z of[bb.min.z,bb.max.z]){vb.set(x*sc[0],y*sc[1],z*sc[2]);if(q.q)vb.applyQuaternion(q.q);top=Math.max(top,vb.y);}
  return q.p[1]+top;};
 for(const n in KIT.items){const it=KIT.items[n];const a=snap[n]||0;if(it.length<=a)continue;let w=a;
  for(let i=a;i<it.length;i++){const q=it[i],cut=cutAt(q.p[0],q.p[2]);if(q.p[1]>cut||topOf(n,q)>cut+3){if(t){t.inst--;t.tris-=ktri(n);}continue;}it[w++]=q;}it.length=w;}
 // meshes: triangle by triangle, in world space. The band just above the break is kept aside for the fallen pieces.
 const band=o.band||F.band,chunks={};   // material uuid -> {mat, pos[], uv[], ang[]}
 const dead=[],v=new THREE.Vector3(),mboxes=[];
 if(G){G.updateMatrixWorld(true);G.traverse(m=>{if(!m.isMesh||!m.geometry||!m.geometry.attributes.position)return;
  const g=m.geometry;
  const P=g.attributes.position,UV=g.attributes.uv,nv=P.count,W=new Float32Array(nv*3);
  for(let i=0;i<nv;i++){v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);W[i*3]=v.x;W[i*3+1]=v.y;W[i*3+2]=v.z;}
  const src=g.index?g.index.array:null,nt=src?src.length/3:nv/3,keep=[];
  const mat=Array.isArray(m.material)?m.material[0]:m.material,toChunk=mat&&!mat.transparent;
  for(let k=0;k<nt;k++){const a=src?src[k*3]:k*3,b=src?src[k*3+1]:k*3+1,c=src?src[k*3+2]:k*3+2;
   const cx=(W[a*3]+W[b*3]+W[c*3])/3,cz=(W[a*3+2]+W[b*3+2]+W[c*3+2])/3,yc=(W[a*3+1]+W[b*3+1]+W[c*3+1])/3,ym=Math.max(W[a*3+1],W[b*3+1],W[c*3+1]);
   const cut=cutAt(cx,cz);if(ym<=cut){keep.push(a,b,c);continue;}
   if(toChunk&&yc<cut+band){let C=chunks[mat.uuid];if(!C)C=chunks[mat.uuid]={mat,pos:[],uv:[],ang:[]};
    const an=Math.atan2(cz-gz,cx-gx);for(const j of[a,b,c]){C.pos.push(W[j*3],W[j*3+1],W[j*3+2]);C.uv.push(UV?UV.getX(j):0,UV?UV.getY(j):0);}C.ang.push(an);}}
  const lost=nt-keep.length/3;
  if(keep.length){const B=[1e9,1e9,1e9,-1e9,-1e9,-1e9];for(const j of keep)for(let e=0;e<3;e++){B[e]=Math.min(B[e],W[j*3+e]);B[e+3]=Math.max(B[e+3],W[j*3+e]);}mboxes.push({m,B,tris:keep.length/3});}
  if(!lost)return;if(t)t.tris-=lost;
  if(!keep.length){dead.push(m);return;}
  // a new geometry on the same attributes: the source is never edited, whoever else may share it
  const g2=new THREE.BufferGeometry();for(const k in g.attributes)g2.setAttribute(k,g.attributes[k]);g2.setIndex(keep);m.geometry=g2;});
  for(const m of dead){m.parent.remove(m);if(t)t.meshes--;}}
 // --- 2b. nothing may hang in the air ---------------------------------------
 // The break can take away what held a piece up without touching the piece: G's surviving top-tier block kept
 // whole while the core and bridges beside it went, and floated. A mesh whose kept fabric starts more than 8 m up
 // must have something (another kept mesh, or an instanced item: a stilt, a strut, a slab) reaching from at or
 // below its underside to within 6 m of it (E and F stand 5 m clear of their podium top on their own cores), overlapping its footprint; otherwise it fell. Repeated until nothing
 // more drops, since one fall can strand the next. What it carried (windows, rings, slabs inside its box) goes too.
 const iboxes=[];
 const boxOf=(n,q)=>{const g=KIT.defs[n]&&KIT.defs[n].geo;if(!g)return null;if(!g.boundingBox)g.computeBoundingBox();const bb=g.boundingBox;
  const sc=typeof q.s==='number'?[q.s,q.s,q.s]:(q.s||[1,1,1]);const B=[1e9,1e9,1e9,-1e9,-1e9,-1e9];
  for(const x of[bb.min.x,bb.max.x])for(const y of[bb.min.y,bb.max.y])for(const z of[bb.min.z,bb.max.z]){vb.set(x*sc[0],y*sc[1],z*sc[2]);if(q.q)vb.applyQuaternion(q.q);
   const w=[vb.x+q.p[0],vb.y+q.p[1],vb.z+q.p[2]];for(let e=0;e<3;e++){B[e]=Math.min(B[e],w[e]);B[e+3]=Math.max(B[e+3],w[e]);}}return B;};
 for(const n in KIT.items){const it=KIT.items[n];for(let i=snap[n]||0;i<it.length;i++){const B=boxOf(n,it[i]);if(B)iboxes.push({n,q:it[i],B});}}
 const holds=(o,B)=>o[1]<B[1]-.5&&o[4]>=B[1]-6&&o[0]<=B[3]+1&&o[3]>=B[0]-1&&o[2]<=B[5]+1&&o[5]>=B[2]-1;
 const fell=[];
 for(let pass=0;pass<4;pass++){let n0=fell.length;
  for(const mb of mboxes){if(mb.gone||mb.B[1]<8)continue;const B=mb.B;
   if(mboxes.some(o=>o!==mb&&!o.gone&&holds(o.B,B))||iboxes.some(o=>!o.gone&&holds(o.B,B)))continue;
   mb.gone=true;mb.m.parent&&mb.m.parent.remove(mb.m);if(t){t.meshes--;t.tris-=mb.tris;}
   for(const o of iboxes){if(o.gone)continue;const c=[(o.B[0]+o.B[3])/2,(o.B[1]+o.B[4])/2,(o.B[2]+o.B[5])/2];
    if(c[0]>B[0]-1.5&&c[0]<B[3]+1.5&&c[1]>B[1]-1.5&&c[1]<B[4]+1.5&&c[2]>B[2]-1.5&&c[2]<B[5]+1.5){o.gone=true;o.q._gone=true;if(t){t.inst--;t.tris-=ktri(o.n);}}}
   fell.push([(B[0]+B[3])/2,(B[2]+B[5])/2,Math.max(B[3]-B[0],B[5]-B[2])/2]);}
  if(fell.length===n0)break;}
 if(fell.length)for(const n in KIT.items){const it=KIT.items[n];const a=snap[n]||0;let w=a;for(let i=a;i<it.length;i++){if(it[i]._gone)continue;it[w++]=it[i];}it.length=w;}
 // --- 3. the fallen band: two or three pieces of the tower's own fabric -----
 // split by bearing into sectors; each rolls outward off its own side and lies on the ground beside the foot
 const NS=Hb*(o.f||F.f)>90?3:2,a0=rng()*TAU;
 for(let s=0;s<NS;s++){const lo=a0+s/NS*TAU,hi=lo+TAU/NS;const inS=an=>{let e=(an-lo)%TAU;if(e<0)e+=TAU;return e<TAU/NS;};
  const parts=[];let cxs=0,czs=0,cys=0,cn=0;
  for(const u in chunks){const C=chunks[u],pos=[],uv=[];for(let k=0;k<C.ang.length;k++){if(!inS(C.ang[k]))continue;
    for(let j=0;j<3;j++){const i=k*3+j;pos.push(C.pos[i*3],C.pos[i*3+1],C.pos[i*3+2]);uv.push(C.uv[i*2],C.uv[i*2+1]);cxs+=C.pos[i*3];cys+=C.pos[i*3+1];czs+=C.pos[i*3+2];cn++;}}
   if(pos.length)parts.push({mat:C.mat,pos,uv});}
  if(!cn)continue;cxs/=cn;cys/=cn;czs/=cn;
  if(rng()<.25&&d!==2)continue;                       // some of the band went down as rubble only
  const Pc=new THREE.Group();scene.add(Pc);
  for(const p of parts){for(let i=0;i<p.pos.length;i+=3){p.pos[i]-=cxs;p.pos[i+1]-=cys;p.pos[i+2]-=czs;}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p.pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(p.uv,2));g.computeVertexNormals();
   mesh(g,p.mat,Pc);}
  // roll it outward off its own side, about the tangent at its bearing
  // past the podium's edge (the registered radius is podium + skirt): a piece lying among struts or legs reads as clipping
  const am=(lo+hi)/2,dir=[Math.cos(am),Math.sin(am)],dist=Math.max(Math.hypot(cxs-gx,czs-gz)+band,base.r*rr(.85,1.05))+band*rr(.3,.7);
  Pc.position.set(gx+dir[0]*dist,0,gz+dir[1]*dist);
  Pc.quaternion.copy(qAxis(dir[1],0,-dir[0],rr(1.25,1.75))).multiply(qEuler(0,rr(-.3,.3),0));
  dropFragment(Pc,0,rr(.6,2));
  rubbleRing(Pc.position.x,0,Pc.position.z,4,band*1.1,40,3.2);}
 // the talus at the foot, heaviest on the low (+z) side of the break
 KOFF=[gx,0,gz];
 rubbleRing(0,0,R*.4,R*.9,R*2.4,d===2?220:150,4.2);
 for(let k=0;k<(d===2?14:8);k++){const a=rng()*TAU,r=R*rr(1,2.2);
  kput('slabCR',[r*Math.cos(a),rr(.5,2),r*Math.sin(a)],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),[rr(4,9),rr(.5,.9),rr(4,9)],null);}
 KOFF=[0,0,0];
 // what fell in 2b lies under where it stood (drawn last, so a stump that lost nothing keeps its stream)
 for(const f of fell)rubbleRing(f[0],0,f[1],2,f[2]*1.4,Math.round(20+f[2]*2),3.6);
 if(fell.length)(window._stumpFell=window._stumpFell||[]).push([fam,d,fell.length]);
 // --- 4. the registered volumes follow the break ----------------------------
 for(let i=REG.length-1;i>=r0;i--){const r=REG[i];const y=r.y||0;
  if(y>=topMax){REG.splice(i,1);continue;}r.h=Math.min(r.h,topMax-y+4);}
 if(REG[r0])REG[r0].name='Stump — '+REG[r0].name.replace(/ \((ruined|repaired|intact|toppled)\)$/,'')+' (snapped'+(d===3?', repaired':'')+')';
 REGISTER({name:'Stump of Skyscraper '+fam+' — the fallen storeys',x:gx,z:gz,r:R*2.6,h:12});
 return G;}
