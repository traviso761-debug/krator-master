// ================================================================= VERGE — the rigs: people, camels, riding lizards ([draw])
// The instanced figures the life layer animates. Engine side only: no decisions and no paths. The life layer makes the
// pools once at load and calls set(...) for every figure it shows, every frame, with a pose; nothing else runs per frame.
//
//   RIGS.person(n) / RIGS.camel(n) / RIGS.lizard(n) -> pool      n = capacity; the meshes go into `scene` at once
//   pool.set(i, x,y,z, yaw, o)   y = ground under the figure (for 'sit'/'ride': the seat, the hips go there);
//                                 yaw = three's rotation.y (faces (sin yaw, cos yaw)). o = {phase 0..1 (the caller
//                                 advances it by distance walked), speed m/s (0 = standing, idle sway), pitch radians
//                                 (+ = nose up; animals tilt with it, people lean a third of it), look, pose, t}
//       person pose  'walk' | 'stand' | 'sit' | 'ride' | 'lead' (walking, right arm forward on a rope)
//       camel pose   'walk' | 'stand' | 'couch' (kneeling, legs folded under)      lizard pose 'walk' | 'stand' | 'rest'
//       look  an integer seed (a look drawn from the palettes below) or an object:
//         person {robe, trim, skin: 0xRRGGBB sRGB, head:'turban'|'hood'|'cap'|'bare'|'helmet', pack, spear, cloak: 0|1}
//         camel  {coat, tassels: 0xRRGGBB, load: 0 none | 1 bales | 2 crates in a frame | 3 riding saddle}
//         lizard {skin, belly, frill: 0xRRGGBB, saddle: 0|1}
//       Colours are rewritten only when the look changes (=== the last one): pass the same object or seed each frame.
//       o.t (seconds) drives the idle sway; it defaults to the world clock CLOCK.t.
//   pool.hide(i)  pool.label(i, text)  pool.flush() (once per frame)  pool.meshes  pool.n
//   RIGS.stats()   {person:{n, tris, base, pool}, camel:{...}, lizard:{...}}: tris per figure with every part on,
//                  base without the optional parts, pool = n*tris over every pool of that kind
//   RIGS.SADDLE    {camel, lizard}: the seat height above the animal's ground; a rider is set with pose 'ride' at
//                  y = ground + SADDLE (on flat ground; on a slope the animal's pitch moves the seat a little)
//   RIGS.HEIGHT    {person, camel (hump top), lizard (top of the back)}
//
// How it is drawn. Each pool is a few InstancedMeshes sharing the instance index i: a merged body (torso and head
// for people; barrel, hump and tail for camels; trunk for lizards), the limbs (one InstancedMesh for all legs,
// index i*legs+k), and small parts (headgear, loads, saddles) scaled to zero when absent. One material for all:
// MeshLambertMaterial with vertex colours (baked shades: hooves, callouses, mottling) times TWO per-instance colours,
// instanceColor (A) and instanceColor2 (B), mixed per vertex by the attribute `tw` (0 = A, 1 = B): a robe and its
// trim, a sleeve and its hand, a lizard's back and its belly in one draw. Godot: INSTANCE_CUSTOM carries B.
// Gaits: a person's legs and arms alternate (straight legs: the body drops by the hip's arc so the stance foot
// stays down, the swinging leg shortens to clear); a camel paces (both legs of one side together, the swinging
// pair bends at the knee, the body rolls to the stance side, the neck bobs twice a stride); a lizard trots
// diagonally with a sprawl (legs swing about the vertical at the shoulder, the swinging leg lifts by flattening),
// and its four body segments (head and frill, trunk, two tail pieces) undulate as a travelling wave.
const RIGS=(function(){
'use strict';
const TAU=Math.PI*2,PI=Math.PI;
const V3=THREE.Vector3;

// ---------------------------------------------------------------- colour (sRGB hex in, linear out, cached)
const _lin=new Map();
function lin(hex){let c=_lin.get(hex);if(!c){c=new THREE.Color(hex).convertSRGBToLinear();_lin.set(hex,c);}return c;}
function mixHex(a,b,t){const ch=s=>Math.round(((a>>s)&255)*(1-t)+((b>>s)&255)*t);return (ch(16)<<16)|(ch(8)<<8)|ch(0);}

// ---------------------------------------------------------------- geometry: parts merged into one indexed geometry
function newG(){return {p:[],n:[],c:[],w:[],i:[]};}
const _a=new V3(),_b=new V3(),_c=new V3(),_v=new V3();
function rgb(c,d){if(typeof c==='function')c=c(d);if(c==null)c=1;return typeof c==='number'?[c,c,c]:c;}
function num(w,d){if(typeof w==='function')w=w(d);return w||0;}
// P = {p:[x,y,z...], c:[r,g,b...], w:[...], i:[...]}; m transforms it; normals: area-weighted over shared vertices
function addPart(G,P,m){
 const nv=P.p.length/3,pos=P.p.slice(),nor=new Float32Array(nv*3),base=G.p.length/3;
 if(m)for(let k=0;k<nv;k++)_v.fromArray(pos,k*3).applyMatrix4(m).toArray(pos,k*3);
 for(let t=0;t<P.i.length;t+=3){const ia=P.i[t],ib=P.i[t+1],ic=P.i[t+2];
  _a.fromArray(pos,ia*3);_b.fromArray(pos,ib*3).sub(_a);_c.fromArray(pos,ic*3).sub(_a);_b.cross(_c);
  for(const q of [ia,ib,ic]){nor[q*3]+=_b.x;nor[q*3+1]+=_b.y;nor[q*3+2]+=_b.z;}}
 for(let k=0;k<nv;k++){_v.fromArray(nor,k*3);if(_v.lengthSq()<1e-20)_v.set(0,1,0);_v.normalize();
  G.p.push(pos[k*3],pos[k*3+1],pos[k*3+2]);G.n.push(_v.x,_v.y,_v.z);}
 for(const c of P.c)G.c.push(c);for(const w of P.w)G.w.push(w);for(const q of P.i)G.i.push(q+base);
}
// a tube through points {p:[x,y,z], r:[rx,ry] | r (0 = an apex), c, w, cut:{c,w}} with n sides. Each ring lies across
// the local tangent t, spanned by s (o.ref, default +x, made square to t) and w = t x s: +y for a tube along +z, -z
// for a tube up +y. c / w (vertex shade, B weight) may be functions of {x,y,z (radial unit), j, k}. A `cut` point
// doubles its ring so the colour steps there. o: {ref, arc:[a0,a1] (open), rot, cap0, cap1 (flat ends), both
// (also the inside faces), m (a Matrix4 for the whole part)}
function tube(G,n,pts,o){o=o||{};
 const P={p:[],c:[],w:[],i:[]},arc=o.arc,m=arc?n+1:n,rot=o.rot||0,ref=new V3().fromArray(o.ref||[1,0,0]);
 const t=new V3(),s=new V3(),ww=new V3(),d=new V3(),rings=[];
 const vert=(x,y,z,c,w)=>{P.p.push(x,y,z);const q=rgb(c.c,c.d);P.c.push(q[0],q[1],q[2]);P.w.push(num(w,c.d));return P.p.length/3-1;};
 for(let k=0;k<pts.length;k++){const q=pts[k],p=q.p,r=Array.isArray(q.r)?q.r:[q.r,q.r];
  const a=pts[Math.max(0,k-1)].p,b=pts[Math.min(pts.length-1,k+1)].p;
  t.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize();
  s.copy(ref).addScaledVector(t,-ref.dot(t));if(s.lengthSq()<1e-6)s.set(0,0,1).addScaledVector(t,-t.z);s.normalize();ww.crossVectors(t,s);
  const mk=(c,w)=>{if(!(r[0]>0||r[1]>0)){const D={x:t.x,y:t.y,z:t.z,j:0,k};return [vert(p[0],p[1],p[2],{c,d:D},w)];}
   const ids=[];for(let j=0;j<m;j++){const ang=arc?arc[0]+(arc[1]-arc[0])*j/n:rot+TAU*j/n,ca=Math.cos(ang),sa=Math.sin(ang);
    d.copy(s).multiplyScalar(ca).addScaledVector(ww,sa);
    const D={x:d.x,y:d.y,z:d.z,j,k};
    ids.push(vert(p[0]+r[0]*ca*s.x+r[1]*sa*ww.x,p[1]+r[0]*ca*s.y+r[1]*sa*ww.y,p[2]+r[0]*ca*s.z+r[1]*sa*ww.z,{c,d:D},w));}
   return ids;};
  const inR=mk(q.c,q.w);rings.push({inR,outR:q.cut?mk(q.cut.c!=null?q.cut.c:q.c,q.cut.w!=null?q.cut.w:q.w):inR,t:t.clone()});}
 const J=j=>arc?j+1:(j+1)%n;
 for(let k=0;k<rings.length-1;k++){const A=rings[k].outR,B=rings[k+1].inR;
  if(A.length===1&&B.length===1)continue;
  for(let j=0;j<n;j++){
   if(B.length===1)P.i.push(A[j],A[J(j)],B[0]);
   else if(A.length===1)P.i.push(A[0],B[J(j)],B[j]);
   else P.i.push(A[j],A[J(j)],B[j],A[J(j)],B[J(j)],B[j]);}}
 const cap=(R,first)=>{if(R.length<2||arc)return;const ids=R.map(q=>{P.p.push(P.p[q*3],P.p[q*3+1],P.p[q*3+2]);P.c.push(P.c[q*3],P.c[q*3+1],P.c[q*3+2]);P.w.push(P.w[q]);return P.p.length/3-1;});
  let cx=0,cy=0,cz=0;for(const q of R){cx+=P.p[q*3];cy+=P.p[q*3+1];cz+=P.p[q*3+2];}
  P.p.push(cx/R.length,cy/R.length,cz/R.length);P.c.push(P.c[R[0]*3],P.c[R[0]*3+1],P.c[R[0]*3+2]);P.w.push(P.w[R[0]]);const C=P.p.length/3-1;
  for(let j=0;j<n;j++)first?P.i.push(C,ids[J(j)],ids[j]):P.i.push(C,ids[j],ids[J(j)]);};
 if(o.cap0)cap(rings[0].inR,true);if(o.cap1)cap(rings[rings.length-1].outR,false);
 addPart(G,P,o.m);
 if(o.both){const Q={p:P.p,c:P.c,w:P.w,i:[]};for(let q=0;q<P.i.length;q+=3)Q.i.push(P.i[q],P.i[q+2],P.i[q+1]);addPart(G,Q,o.m);}
}
// an axis-aligned box [x0,x1]x[y0,y1]x[z0,z1]; skip: a string of faces left out ('+x','-x','+y','-y','+z','-z')
function box(G,x0,x1,y0,y1,z0,z1,c,w,skip,m){
 const P={p:[],c:[],w:[],i:[]},q=rgb(c),F=[['+x',[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1],[1,0,0]],['-x',[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0]],
  ['+y',[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,1,0]],['-y',[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0]],
  ['+z',[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1]],['-z',[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0],[0,0,-1]]];
 for(const f of F){if(skip&&skip.split(',').indexOf(f[0])>=0)continue;const b=P.p.length/3;
  for(let k=1;k<=4;k++){P.p.push(f[k][0],f[k][1],f[k][2]);P.c.push(q[0],q[1],q[2]);P.w.push(w||0);}
  _a.fromArray(f[1]);_b.fromArray(f[2]).sub(_a);_c.fromArray(f[3]).sub(_a);_b.cross(_c);
  if(_b.dot(_v.fromArray(f[5]))>=0)P.i.push(b,b+1,b+2,b,b+2,b+3);else P.i.push(b,b+2,b+1,b,b+3,b+2);}
 addPart(G,P,m);
}
function toGeo(G){const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(G.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(G.n,3));
 g.setAttribute('color',new THREE.Float32BufferAttribute(G.c,3));g.setAttribute('tw',new THREE.Float32BufferAttribute(G.w,1));
 g.setIndex(G.i);g.computeBoundingSphere();g.userData.tris=G.i.length/3;return g;}
function geo(fn){const G=newG();fn(G);return toGeo(G);}
const mat4=()=>new THREE.Matrix4();

// ---------------------------------------------------------------- the material: vertex colour x mix(A, B, tw)
const MAT=new THREE.MeshLambertMaterial({vertexColors:true});
MAT.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader
 .replace('#include <color_pars_vertex>','#include <color_pars_vertex>\nattribute float tw;\nattribute vec3 instanceColor2;')
 .replace('#include <color_vertex>','#include <color_vertex>\n#ifdef USE_INSTANCING_COLOR\n vColor.xyz=color.xyz*mix(instanceColor.xyz,instanceColor2,tw);\n#endif');};
MAT.customProgramCacheKey=()=>'verge-rigs-2c';

// ---------------------------------------------------------------- matrices (reused; no allocation per frame)
const _r=mat4(),mB=mat4(),mT=mat4(),mJ=mat4();
function base(m,x,y,z,yaw,pitch){m.makeRotationY(yaw);if(pitch){_r.makeRotationX(-pitch);m.multiply(_r);}const e=m.elements;e[12]=x;e[13]=y;e[14]=z;return m;}
function tr(m,x,y,z){_r.makeTranslation(x,y,z);return m.multiply(_r);}
function rx(m,a){if(a){_r.makeRotationX(a);m.multiply(_r);}return m;}
function ry(m,a){if(a){_r.makeRotationY(a);m.multiply(_r);}return m;}
function rz(m,a){if(a){_r.makeRotationZ(a);m.multiply(_r);}return m;}
function pivotY(m,z,a){if(a){tr(m,0,0,z);ry(m,a);tr(m,0,0,-z);}return m;}
function clockT(o){if(o&&o.t!=null)return o.t;try{return (typeof CLOCK!=='undefined'&&CLOCK)?CLOCK.t:0;}catch(e){return 0;}}

// ---------------------------------------------------------------- the pool: InstancedMeshes sharing instance i
const STATS={person:{n:0,tris:0,base:0},camel:{n:0,tris:0,base:0},lizard:{n:0,tris:0,base:0}};
function makePool(kind,n,defs,api){
 const P={kind,n,meshes:[],M:{},labels:new Array(n).fill(''),looks:new Array(n).fill(undefined),seen:new Uint8Array(n),dirty:false};
 for(const d of defs){const cnt=n*d.mult,g=d.geo;
  const A=new Float32Array(cnt*3).fill(1),B=new Float32Array(cnt*3).fill(1);
  g.setAttribute('instanceColor2',new THREE.InstancedBufferAttribute(B,3));
  const mesh=new THREE.InstancedMesh(g,MAT,cnt);mesh.instanceMatrix.array.fill(0);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor=new THREE.InstancedBufferAttribute(A,3);
  mesh.frustumCulled=false;mesh.name='rigs-'+kind+'-'+d.key;mesh.userData.life=true;mesh.userData.rigKind=kind;mesh.userData.rigPart=d.key;
  const mult=d.mult;mesh.userData.inspectFn=id=>{const i=(id/mult)|0;return P.labels[i]||(kind+' '+i);};
  mesh.userData.mult=mult;scene.add(mesh);P.meshes.push(mesh);P.M[d.key]=mesh;}
 // tris per figure: every part, but of a group of alternatives (one headgear, one load) only the largest
 const grp={},grpB={};let tris=0,baseT=0;
 for(const d of defs){const q=d.geo.userData.tris*d.mult;
  if(d.group){grp[d.group]=Math.max(grp[d.group]||0,q);if(!d.opt)grpB[d.group]=Math.max(grpB[d.group]||0,q);}else{tris+=q;if(!d.opt)baseT+=q;}}
 for(const k in grp)tris+=grp[k];for(const k in grpB)baseT+=grpB[k];
 const S=STATS[kind];S.n+=n;S.tris=tris;S.base=baseT;
 P.put=(key,idx,m)=>{m.toArray(P.M[key].instanceMatrix.array,idx*16);};
 P.zero=(key,idx)=>{P.M[key].instanceMatrix.array.fill(0,idx*16,idx*16+16);};
 P.col=(key,idx,a,b)=>{const me=P.M[key],A=me.instanceColor.array,B=me.geometry.attributes.instanceColor2.array,ca=lin(a),cb=lin(b==null?a:b);
  A[idx*3]=ca.r;A[idx*3+1]=ca.g;A[idx*3+2]=ca.b;B[idx*3]=cb.r;B[idx*3+1]=cb.g;B[idx*3+2]=cb.b;P.dirty=true;};
 const pool={meshes:P.meshes,n,kind,
  set(i,x,y,z,yaw,o){if(!(i>=0&&i<n))return;o=o||{};const L=o.look;
   if(!P.seen[i]||P.looks[i]!==L){P.seen[i]=1;P.looks[i]=L;api.look(P,i,L);}
   api.set(P,i,x,y,z,yaw||0,o);},
  hide(i){if(!(i>=0&&i<n))return;for(const me of P.meshes){const k=me.userData.mult;me.instanceMatrix.array.fill(0,i*k*16,(i+1)*k*16);}},
  label(i,text){if(i>=0&&i<n)P.labels[i]=String(text);},
  flush(){for(const me of P.meshes){me.instanceMatrix.needsUpdate=true;if(P.dirty){me.instanceColor.needsUpdate=true;me.geometry.attributes.instanceColor2.needsUpdate=true;}}P.dirty=false;}};
 return pool;
}
const pick=(arr,u)=>arr[Math.min(arr.length-1,Math.floor(u*arr.length))];
const unitOf=(seed,k)=>KRAND.unit(KRAND.hash(seed>>>0,k));
const has=(v,d)=>v!=null?v:d;

// ================================================================ PEOPLE (1.75 m; feet at y 0, facing +z, right = -x)
const P_HIP=0.92,P_SH=[0.235,1.37,0],P_ARM=0.64;
const ROBES=[0xd8ccb0,0xe6dfcf,0x2e3f6a,0x8a3424,0xb8862e,0x6a4a32,0x2a2624,0xc89a3a,0x7a8060,0xa0522d,0x5a6a7a,0xcfc0a0,0x4a3a5a];
const TRIMS=[0x8a2a20,0x2a3a6a,0xc8a040,0x1e1a18,0xe0d8c4,0x3a6a5a,0x7a3a6a,0xb05a28];
const SKINS=[0x8a5a3c,0x6a4028,0xa87452,0x5a3420,0xb88a64,0x7a4c30,0x9a6a48];
const HAIRS=[0x1e1612,0x2e221a,0x3a2a1e,0x6a6460];
const SACKS=[0xa08660,0x8a7050,0xb89a70,0x7a6a58];
const HEADS=['turban','hood','cap','bare','helmet'];
function personLook(L){let s,o;
 if(L!=null&&typeof L==='object'){o=L;s=KRAND.hash(has(o.robe,0),has(o.trim,0),has(o.skin,0));}
 else{s=(L|0)>>>0;const u=k=>unitOf(s,k),hu=u(4);
  o={robe:pick(ROBES,u(1)),trim:pick(TRIMS,u(2)),skin:pick(SKINS,u(3)),head:hu<.42?'turban':hu<.62?'hood':hu<.77?'cap':hu<.97?'bare':'helmet',
   pack:u(5)<.25?1:0,spear:u(6)<.06?1:0,cloak:u(7)<.22?1:0};}
 const robe=has(o.robe,0xd8ccb0),trim=has(o.trim,0x8a2a20),skin=has(o.skin,0x8a5a3c);
 return {robe,trim,skin,head:HEADS.indexOf(o.head)>=0?o.head:'turban',pack:o.pack?1:0,spear:o.spear?1:0,cloak:o.cloak?1:0,
  hair:pick(HAIRS,unitOf(s,8)),legs:mixHex(robe,0x3a3028,.55),mantle:mixHex(robe,0x4a3a2c,.5),sack:pick(SACKS,unitOf(s,9)),ph:unitOf(s,10)*TAU};}
function personGeos(){
 const g={};
 // body: robe to the shins, a trim sash, the shoulders closing on the neck   5 sides, 35 tris
 g.body=geo(G=>tube(G,5,[{p:[0,.36,0],r:[.25,.21],c:.92},{p:[0,.86,0],r:[.2,.15],cut:{w:1}},{p:[0,1.0,0],r:[.195,.145],w:1,cut:{w:0}},
  {p:[0,1.36,0],r:[.235,.15]},{p:[0,1.49,.005],r:0}],{ref:[1,0,0]}));
 // head: skin, the crown in B (hair); its lower half sits in the collar   10 tris
 g.head=geo(G=>tube(G,5,[{p:[0,1.43,.01],r:0},{p:[0,1.625,.018],r:[.1,.112]},{p:[0,1.75,0],r:0,w:1}],{rot:PI/2}));
 // legs (2): from the hip down, A = trousers   3 sides, 6 tris. Seated (sit, ride): the bent leg instead, the thigh
 // forward, the shin down to a point at the foot, 9 tris; one of the two is shown
 g.leg=geo(G=>tube(G,3,[{p:[0,0,0],r:.075},{p:[0,-P_HIP,.02],r:.05,c:.8}],{rot:PI/2}));
 g.legb=geo(G=>tube(G,3,[{p:[0,0,-.04],r:.08},{p:[0,-.02,.45],r:.06},{p:[0,-.47,.47],r:0,c:.8}],{ref:[1,0,0],rot:PI/2}));
 // arms (2): a sleeve (A) and a hand (B = skin)   9 tris
 g.arm=geo(G=>tube(G,3,[{p:[0,0,0],r:.068},{p:[0,-.5,0],r:.05,cut:{w:1}},{p:[0,-P_ARM,.01],r:0,w:1}],{rot:PI/2}));
 // headgear, one InstancedMesh each, 15 tris
 g.turban=geo(G=>tube(G,5,[{p:[0,1.6,-.005],r:[.118,.128]},{p:[0,1.73,-.01],r:[.135,.145]},{p:[0,1.8,-.012],r:0,c:.9}],{rot:PI/2}));
 g.hood=geo(G=>tube(G,5,[{p:[0,1.38,-.03],r:[.215,.16],c:.85},{p:[0,1.65,-.05],r:[.13,.14]},{p:[0,1.775,-.08],r:0}],{rot:PI/2}));
 g.cap=geo(G=>tube(G,5,[{p:[0,1.645,0],r:[.106,.116]},{p:[0,1.73,-.004],r:[.1,.11]},{p:[0,1.74,-.004],r:0,c:.85}],{rot:PI/2}));
 g.helmet=geo(G=>tube(G,5,[{p:[0,1.62,0],r:[.12,.13],c:.8},{p:[0,1.72,-.004],r:[.104,.114]},{p:[0,1.84,-.006],r:0,c:1.15}],{rot:PI/2}));
 // a load on the back (a sack without its bottom and its face against the back)   8 tris
 g.pack=geo(G=>{box(G,-.15,.15,1.0,1.4,-.38,-.12,1,0,'-y,+z');});
 // the spear, held in the right hand: modelled in the arm's frame, upright when the arm is at SPEAR_ARM   9 tris
 const SPEAR_ARM=-.35,ms=mat4().makeTranslation(0,-.6,0).multiply(mat4().makeRotationX(-SPEAR_ARM));
 g.spear=geo(G=>{tube(G,3,[{p:[0,-1.05,0],r:.02},{p:[0,1.25,0],r:.018}],{m:ms});tube(G,3,[{p:[0,1.22,0],r:.042,w:1},{p:[0,1.48,0],r:0,w:1}],{m:ms});});
 g.SPEAR_ARM=SPEAR_ARM;
 // a cloak: the back half of a cone from the shoulders to the shins   6 tris
 g.cloak=geo(G=>tube(G,3,[{p:[0,1.42,0],r:[.255,.18]},{p:[0,.44,-.03],r:[.32,.28],c:.85}],{arc:[-.12*PI,1.12*PI]}));
 return g;}
const P_GEAR=['turban','hood','cap','helmet'];
const personApi={
 look(P,i,L){const k=personLook(L);P.lk=P.lk||[];P.lk[i]=k;
  P.col('body',i,k.robe,k.trim);P.col('head',i,k.skin,k.hair);
  for(let j=0;j<2;j++){P.col('leg',i*2+j,k.legs,k.legs);P.col('legb',i*2+j,k.legs,k.legs);P.col('arm',i*2+j,k.robe,k.skin);}
  P.col('turban',i,k.trim,k.trim);P.col('hood',i,k.mantle,k.mantle);P.col('cap',i,k.trim,k.trim);P.col('helmet',i,0x8e8c86,0x8e8c86);
  P.col('pack',i,k.sack,k.sack);P.col('spear',i,0x6e5032,0xa0a09c);P.col('cloak',i,k.mantle,k.trim);},
 set(P,i,x,y,z,yaw,o){const k=P.lk[i],sp=+o.speed||0;let pose=o.pose||(sp>0?'walk':'stand');
  const walking=(pose==='walk'||pose==='lead')&&sp>0,seated=pose==='sit'||pose==='ride',t=clockT(o);
  const ph=TAU*(((+o.phase||0)%1)+1),s=Math.sin(ph),c=Math.cos(ph);
  const A=walking?Math.min(.5,.22+.13*sp):0,drop=walking?P_HIP*(1-Math.cos(A*s)):0;
  base(mB,x,y-drop-(seated?P_HIP:0),z,yaw,0);rx(mB,.33*(+o.pitch||0));
  if(walking){rz(mB,.025*s);ry(mB,-.06*s);}
  else{rz(mB,.012*Math.sin(.9*t+k.ph));rx(mB,(seated?.05:0)+.01*Math.sin(.63*t+k.ph*1.7));}
  P.put('body',i,mB);P.put('head',i,mB);
  for(const h of P_GEAR)h===k.head?P.put(h,i,mB):P.zero(h,i);
  k.pack?P.put('pack',i,mB):P.zero('pack',i);k.cloak?P.put('cloak',i,mB):P.zero('cloak',i);
  for(let j=0;j<2;j++){const side=j?-1:1;mJ.copy(mB);tr(mJ,side*.1,P_HIP,0);
   if(seated){if(pose==='ride'){rz(mJ,side*.42);rx(mJ,.42);}else{rz(mJ,side*.08);rx(mJ,.04*Math.sin(.5*t+k.ph+j));}
    P.put('legb',i*2+j,mJ);P.zero('leg',i*2+j);continue;}
   if(walking){rx(mJ,-side*A*s);const lift=Math.max(0,side*c)*A;if(lift){_r.makeScale(1,1-.22*lift,1);mJ.multiply(_r);}}
   P.put('leg',i*2+j,mJ);P.zero('legb',i*2+j);}
  for(let j=0;j<2;j++){const side=j?-1:1;mJ.copy(mB);tr(mJ,side*P_SH[0],P_SH[1],P_SH[2]);rz(mJ,side*.09);
   let a=walking?side*.85*A*s:.03*Math.sin(.8*t+k.ph+j);
   if(pose==='ride')a=-.6;else if(pose==='sit')a=-.42;
   if(j===1){if(k.spear)a=GEO.person.SPEAR_ARM;else if(pose==='lead')a=-1.15;}
   rx(mJ,a);P.put('arm',i*2+j,mJ);
   if(j===1)k.spear?P.put('spear',i,mJ):P.zero('spear',i);}
 }};

// ================================================================ CAMELS (dromedary; shoulder 1.9, hump 2.31, 3 m)
const C_JOINT=1.32,C_UP=.62,C_LO=.7,C_NECK=[0,1.6,.62];
const C_LEGS=[[.2,.5],[-.2,.5],[.21,-.66],[-.21,-.66]];     // LF, RF, LH, RH (left = +x)
const COATS=[0xc8a878,0xb08a5a,0x9a7048,0xd8c4a0,0x7a5a3c,0xbca08a,0xa88058];
const TASSELS=[0xa02820,0x2a3a8a,0xd0a030,0x2a7a5a,0x7a2a6a,0xc04a20];
const BALES=[0xd8c8a4,0xb8a07a,0x8a6a48,0xc8b490,0x6a5a4a];
function camelLook(L){let s,o;
 if(L!=null&&typeof L==='object'){o=L;s=KRAND.hash(has(o.coat,0),has(o.tassels,0),has(o.load,0));}
 else{s=(L|0)>>>0;o={coat:pick(COATS,unitOf(s,1)),tassels:pick(TASSELS,unitOf(s,2)),load:Math.floor(unitOf(s,3)*4)};}
 const coat=has(o.coat,0xc8a878);
 return {coat,tassels:has(o.tassels,0xa02820),load:Math.max(0,Math.min(3,o.load|0)),bale:pick(BALES,unitOf(s,4)),
  muzzle:mixHex(coat,0x3a2a1e,.35),ph:unitOf(s,5)*TAU};}
function camelGeos(){const g={};
 g.body=geo(G=>{
  // the barrel along z (w = +y), the chest deep, the belly tucked   8 sides
  tube(G,8,[{p:[0,1.48,-1.0],r:0},{p:[0,1.44,-.92],r:[.27,.3]},{p:[0,1.44,-.72],r:[.38,.42]},{p:[0,1.43,-.2],r:[.42,.44]},
   {p:[0,1.44,.32],r:[.4,.47]},{p:[0,1.5,.66],r:[.3,.42]},{p:[0,1.54,.8],r:0}],{});
  // the hump
  tube(G,8,[{p:[0,1.7,-.1],r:[.33,.5]},{p:[0,2.06,-.12],r:[.27,.38]},{p:[0,2.24,-.13],r:[.15,.2]},{p:[0,2.31,-.13],r:0,c:.92}],{});
  // the tail, a dark tuft at its end
  tube(G,3,[{p:[0,1.62,-.94],r:.05},{p:[0,1.2,-1.04],r:.035},{p:[0,.95,-1.03],r:0,c:.35}],{rot:PI/2});});
 g.neck=geo(G=>{
  tube(G,6,[{p:[0,1.66,.5],r:[.17,.22]},{p:[0,1.5,.98],r:[.12,.15]},{p:[0,1.6,1.27],r:[.1,.12]},{p:[0,1.96,1.4],r:[.095,.11]}],{});
  // the head along z, a darker muzzle (B)
  tube(G,6,[{p:[0,2.03,1.29],r:0},{p:[0,2.0,1.36],r:[.1,.12]},{p:[0,2.0,1.55],r:[.085,.11]},{p:[0,1.95,1.76],r:[.06,.08],w:1},{p:[0,1.93,1.83],r:0,w:1}],{rot:PI/6});
  for(const sx of [1,-1])tube(G,3,[{p:[sx*.08,2.08,1.38],r:.03},{p:[sx*.12,2.17,1.34],r:0,c:.7}],{});});
 // legs: upper from the joint (callused knee at its foot), lower with the broad pad (dark)
 g.up=geo(G=>tube(G,4,[{p:[0,0,0],r:[.11,.15]},{p:[0,-C_UP,0],r:[.075,.08]}],{rot:PI/4}));
 g.lo=geo(G=>tube(G,4,[{p:[0,.06,0],r:.085,c:.72},{p:[0,-.56,0],r:.05},{p:[0,-C_LO,.04],r:[.11,.13],c:.45}],{rot:PI/4,cap1:true}));
 // the pad every load sits on: a blanket round the hump (B)
 const blanket=G=>tube(G,6,[{p:[0,2.27,-.13],r:[.17,.22],w:1},{p:[0,1.74,-.12],r:[.52,.68],w:1,c:.8}],{rot:PI/2});
 // 1 bales and bundles (A = cloth)
 g.bales=geo(G=>{blanket(G);
  for(const sx of [1,-1])tube(G,5,[{p:[sx*.55,1.74,-.58],r:[.2,.26]},{p:[sx*.55,1.74,.22],r:[.2,.26]}],{cap0:true,cap1:true,ref:[0,1,0]});
  tube(G,5,[{p:[-.45,1.99,-.66],r:.12,c:.8},{p:[.45,1.99,-.66],r:.12,c:.8}],{cap0:true,cap1:true,ref:[0,1,0]});});
 // 2 crates in a frame (A = wood)
 g.crates=geo(G=>{blanket(G);
  box(G,.36,.78,1.5,1.95,-.52,.2,1,0,'-x');box(G,-.78,-.36,1.5,1.95,-.52,.2,1,0,'+x');
  for(const z of [-.62,.32])tube(G,3,[{p:[.5,1.95,z],r:.04,c:.7},{p:[0,2.06,z],r:.04,c:.7},{p:[-.5,1.95,z],r:.04,c:.7}],{ref:[0,1,0]});});
 // 3 riding saddle: blanket, seat, two posts, four tassels (A = leather, B = tassels)
 g.saddle=geo(G=>{blanket(G);
  box(G,-.2,.2,2.26,2.36,-.4,.12,1,0,'-y');
  for(const z of [.14,-.42])tube(G,4,[{p:[0,2.3,z],r:.05,c:.8},{p:[0,2.56,z],r:0,c:.8}],{rot:PI/4});
  for(const [sx,z] of [[1,.28],[-1,.28],[1,-.52],[-1,-.52]])tube(G,3,[{p:[sx*.5,1.78,z],r:.04,w:1},{p:[sx*.52,1.56,z],r:0,w:1,c:.8}],{});});
 return g;}
const C_LOADS=['bales','crates','saddle'];
const camelApi={
 look(P,i,L){const k=camelLook(L);P.lk=P.lk||[];P.lk[i]=k;
  P.col('body',i,k.coat,k.coat);P.col('neck',i,k.coat,k.muzzle);
  for(let j=0;j<4;j++){P.col('up',i*4+j,k.coat,k.coat);P.col('lo',i*4+j,k.coat,k.coat);}
  P.col('bales',i,k.bale,k.tassels);P.col('crates',i,0x8a6a44,k.tassels);P.col('saddle',i,0x6a4228,k.tassels);},
 set(P,i,x,y,z,yaw,o){const k=P.lk[i],sp=+o.speed||0,pose=o.pose||(sp>0?'walk':'stand'),t=clockT(o);
  const walking=pose==='walk'&&sp>0,couch=pose==='couch';
  const ph=TAU*(((+o.phase||0)%1)+1),s=Math.sin(ph),c=Math.cos(ph);
  const A=walking?Math.min(.42,.2+.1*sp):0;
  const drop=couch?.9:walking?(C_JOINT)*(1-Math.cos(A*s)):0;
  base(mB,x,y-drop,z,yaw,+o.pitch||0);
  if(walking)rz(mB,.04*c);
  P.put('body',i,mB);
  for(let j=0;j<3;j++)k.load===j+1?P.put(C_LOADS[j],i,mB):P.zero(C_LOADS[j],i);
  mJ.copy(mB);tr(mJ,C_NECK[0],C_NECK[1],C_NECK[2]);
  rx(mJ,walking?.06*Math.sin(2*ph):couch?-.1:.05*Math.sin(.4*t+k.ph));
  if(!walking)ry(mJ,.12*Math.sin(.23*t+k.ph*2));
  tr(mJ,-C_NECK[0],-C_NECK[1],-C_NECK[2]);P.put('neck',i,mJ);
  for(let j=0;j<4;j++){const L=C_LEGS[j],left=L[0]>0;let a,knee;
   if(couch){a=-1.2;knee=2.77;}
   else{const sw=left?Math.max(0,c):Math.max(0,-c);a=left?-A*s:A*s;knee=sw*(.3+1.6*A)*(A>0?1:0);a-=.35*knee;}
   mJ.copy(mB);tr(mJ,L[0],C_JOINT,L[1]);rx(mJ,a);P.put('up',i*4+j,mJ);
   tr(mJ,0,-C_UP,0);rx(mJ,knee);P.put('lo',i*4+j,mJ);}
 }};

// ================================================================ RIDING LIZARDS (the abyss's mounts: 3 m, 0.9 m at the back)
const Z_FRONT=.5,Z_TAIL1=-.32,Z_TAIL2=-.98,Z_TRUNK=.08,L_UP=.38;
const Z_LEGS=[[.27,.42],[-.27,.42],[.28,-.26],[-.28,-.26]];   // LF, RF, LH, RH
const LSKINS=[0x4a4e44,0x3a4048,0x5a5040,0x2e3a3a,0x6a5a48,0x48523a];
const LBELLY=[0xb8a888,0x9a8a6a,0xc0b090,0xa89878];
const LFRILL=[0xb84a2a,0xd0902a,0x6a8aa0,0x8a2a4a,0x3a7a6a];
const BLANKETS=[0x7a2a22,0x2a3a6a,0x8a6a2a,0x3a5a3a,0x5a2a4a];
function lizardLook(L){let s,o;
 if(L!=null&&typeof L==='object'){o=L;s=KRAND.hash(has(o.skin,0),has(o.belly,0),has(o.frill,0));}
 else{s=(L|0)>>>0;o={skin:pick(LSKINS,unitOf(s,1)),belly:pick(LBELLY,unitOf(s,2)),frill:pick(LFRILL,unitOf(s,3)),saddle:unitOf(s,4)<.5?1:0};}
 const skin=has(o.skin,0x4a4e44);
 return {skin,belly:has(o.belly,0xb8a888),frill:has(o.frill,0xb84a2a),saddle:o.saddle?1:0,blanket:pick(BLANKETS,unitOf(s,5)),
  edge:mixHex(has(o.frill,0xb84a2a),0x1a1410,.55),ph:unitOf(s,6)*TAU};}
function lizardGeos(){const g={};
 // belly in B: by the vertex's radial direction (down = 1); mottling baked into the vertex shade
 const bel=d=>Math.max(0,Math.min(1,-d.y*1.7-.15));
 const mot=seed=>d=>.8+.28*KRAND.unit(KRAND.hash(seed,d.j,d.k));
 g.trunk=geo(G=>tube(G,8,[{p:[0,.58,-.4],r:[.24,.2]},{p:[0,.6,-.15],r:[.36,.26]},{p:[0,.62,.2],r:[.4,.27]},{p:[0,.6,.48],r:[.32,.23]},{p:[0,.6,.64],r:[.22,.18]}]
  .map(q=>Object.assign(q,{c:mot(1),w:bel})),{}));
 g.front=geo(G=>tube(G,6,[{p:[0,.6,.42],r:[.25,.2]},{p:[0,.63,.8],r:[.18,.15]},{p:[0,.64,1.0],r:[.17,.13]},{p:[0,.6,1.22],r:[.12,.085]},{p:[0,.56,1.38],r:0}]
  .map(q=>Object.assign(q,{c:mot(2),w:bel})),{rot:PI/6}));
 g.frill=geo(G=>tube(G,8,[{p:[0,.67,.68],r:[.5,.42],w:1,c:.9},{p:[0,.63,.8],r:[.17,.145]}],{arc:[-.22*PI,1.22*PI],both:true}));
 g.tail1=geo(G=>tube(G,6,[{p:[0,.58,-.26],r:[.23,.19]},{p:[0,.52,-.65],r:[.155,.13]},{p:[0,.45,-1.02],r:[.105,.09]}].map(q=>Object.assign(q,{c:mot(3),w:bel})),{rot:PI/6}));
 g.tail2=geo(G=>tube(G,6,[{p:[0,.45,-.95],r:[.108,.093]},{p:[0,.3,-1.35],r:[.06,.055]},{p:[0,.13,-1.68],r:0}].map(q=>Object.assign(q,{c:mot(4),w:bel})),{rot:PI/6}));
 g.up=geo(G=>tube(G,4,[{p:[0,0,0],r:.11},{p:[0,-L_UP,0],r:.08}],{rot:PI/4}));
 g.lo=geo(G=>tube(G,4,[{p:[0,.07,0],r:.085},{p:[0,-.37,0],r:.055},{p:[0,-.41,.05],r:[.11,.14],c:.8},{p:[0,-.44,.06],r:[.11,.14],c:.6}],{rot:PI/4,cap1:true}));
 // saddle: a blanket over the back (B), a seat and a front post (A = leather)
 g.saddle=geo(G=>{tube(G,6,[{p:[0,.6,-.22],r:[.44,.33],w:1},{p:[0,.6,.36],r:[.45,.33],w:1}],{arc:[-.12*PI,1.12*PI]});
  box(G,-.2,.2,.89,.98,-.17,.25,1,0,'-y');tube(G,4,[{p:[0,.95,.26],r:.05},{p:[0,1.14,.29],r:0}],{rot:PI/4});});
 return g;}
const lizardApi={
 look(P,i,L){const k=lizardLook(L);P.lk=P.lk||[];P.lk[i]=k;
  for(const m of ['trunk','front','tail1','tail2'])P.col(m,i,k.skin,k.belly);
  P.col('frill',i,k.frill,k.edge);
  for(let j=0;j<4;j++){P.col('up',i*4+j,k.skin,k.skin);P.col('lo',i*4+j,k.skin,k.belly);}
  P.col('saddle',i,0x5a3a24,k.blanket);},
 set(P,i,x,y,z,yaw,o){const k=P.lk[i],sp=+o.speed||0,pose=o.pose||(sp>0?'walk':'stand'),t=clockT(o);
  const walking=pose==='walk'&&sp>0,rest=pose==='rest';
  const ph=TAU*(((+o.phase||0)%1)+1),s=Math.sin(ph);
  const A=walking?Math.min(.55,.3+.12*sp):0,U=walking?.12:0;
  base(mB,x,y-(rest?.27:0),z,yaw,+o.pitch||0);
  mT.copy(mB);pivotY(mT,Z_TRUNK,U*s);P.put('trunk',i,mT);
  k.saddle?P.put('saddle',i,mT):P.zero('saddle',i);
  const idle=walking?0:.18*Math.sin(.21*t+k.ph);
  mJ.copy(mT);pivotY(mJ,Z_FRONT,-1.25*U*s+idle);P.put('front',i,mJ);P.put('frill',i,mJ);
  mJ.copy(mT);pivotY(mJ,Z_TAIL1,walking?-1.1*U*Math.sin(ph-.8):.06*Math.sin(.17*t+k.ph));P.put('tail1',i,mJ);
  pivotY(mJ,Z_TAIL2,walking?-1.5*U*Math.sin(ph-1.6):.1*Math.sin(.17*t+k.ph-.7));P.put('tail2',i,mJ);
  for(let j=0;j<4;j++){const L=Z_LEGS[j],side=L[0]>0?1:-1,diag=(j===0||j===3)?0:PI;
   const f=A*Math.sin(ph+diag),lift=walking?.38*Math.max(0,Math.cos(ph+diag)):0;
   const spl=rest?1.5:1.25+lift,rel=rest?-.95:-1.25-.3*lift;
   mJ.copy(mT);tr(mJ,L[0],.55,L[1]);ry(mJ,-side*f+side*(j<2?-.12:.18));rz(mJ,side*spl);P.put('up',i*4+j,mJ);
   tr(mJ,0,-L_UP,0);rz(mJ,side*rel);P.put('lo',i*4+j,mJ);}
 }};

// ================================================================ the pools
let GEO=null;
function geos(){if(!GEO)GEO={person:personGeos(),camel:camelGeos(),lizard:lizardGeos()};return GEO;}
const cloneG=g=>{const c=g.clone();c.userData.tris=g.userData.tris;return c;};
function person(n){const g=geos().person;return makePool('person',n,[{key:'body',geo:cloneG(g.body),mult:1},{key:'head',geo:cloneG(g.head),mult:1},
 {key:'leg',geo:cloneG(g.leg),mult:2,group:'legs'},{key:'legb',geo:cloneG(g.legb),mult:2,group:'legs'},{key:'arm',geo:cloneG(g.arm),mult:2},
 ...P_GEAR.map(h=>({key:h,geo:cloneG(g[h]),mult:1,opt:1,group:'head'})),
 {key:'pack',geo:cloneG(g.pack),mult:1,opt:1},{key:'spear',geo:cloneG(g.spear),mult:1,opt:1},{key:'cloak',geo:cloneG(g.cloak),mult:1,opt:1}],personApi);}
function camel(n){const g=geos().camel;return makePool('camel',n,[{key:'body',geo:cloneG(g.body),mult:1},{key:'neck',geo:cloneG(g.neck),mult:1},
 {key:'up',geo:cloneG(g.up),mult:4},{key:'lo',geo:cloneG(g.lo),mult:4},
 ...C_LOADS.map(l=>({key:l,geo:cloneG(g[l]),mult:1,opt:1,group:'load'}))],camelApi);}
function lizard(n){const g=geos().lizard;return makePool('lizard',n,[{key:'trunk',geo:cloneG(g.trunk),mult:1},{key:'front',geo:cloneG(g.front),mult:1},
 {key:'frill',geo:cloneG(g.frill),mult:1},{key:'tail1',geo:cloneG(g.tail1),mult:1},{key:'tail2',geo:cloneG(g.tail2),mult:1},
 {key:'up',geo:cloneG(g.up),mult:4},{key:'lo',geo:cloneG(g.lo),mult:4},{key:'saddle',geo:cloneG(g.saddle),mult:1,opt:1}],lizardApi);}
function stats(){const out={};for(const k in STATS){const S=STATS[k];out[k]={n:S.n,tris:S.tris,base:S.base,pool:S.n*S.tris};}return out;}
return {person,camel,lizard,stats,
 SADDLE:{camel:2.36,lizard:.98},
 HEIGHT:{person:1.75,camel:2.31,lizard:.9}};
})();
