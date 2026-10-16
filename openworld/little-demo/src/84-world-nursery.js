// ================================================================= OPEN WORLD — the nursery: each species' variants, grown once by its kit
// [draw] The open world never builds a tree where it stands (biomes/WORLD.md: trees as variants). For each species it
// asks the kit to grow K variants alone at the origin of a flat, dry stage (HOST.nursery), each at the levels the kit
// draws (2 hero, 1 mid, 0 the far impostor) with the kit's own builder (KIT.make, KIT.grow), and gathers what the kit
// wrote into its buckets and items into one mesh per material: a PROTOTYPE, drawn as instances wherever the placement
// puts that species (85-world-flora.js). The variant's seed is a hash of the kit, species and variant, so the same
// variant grows the same at every level and in every session.
// The FLOOR is grown the same way: each kit's own floor pass (KIT.buildFloor) run on a 32 m patch under a fixed field
// profile (a zone: scrub, badland, canyon floor, marsh...), BIO.grid clipped to the patch; 86-world-floor.js tiles the
// patches over the near ground.
// Work is queued and done a little each frame, nearest first; a prototype that is not ready yet is not drawn.
var NURSERY=(function(){'use strict';
const KIDX={},KIT={};WORLD_KITS.forEach((k,i)=>{KIDX[k.name]=i;Object.defineProperty(KIT,k.name,{get:()=>WORLD_KITS.api(k)});});
const PROTO=new Map(),QUEUE=new Map(),ST={trees:0,patches:0,ms:0,tris:0,skipped:{}};
// ---------------------------------------------------------------- materials for instancing
// A kit's leaf material reads its per-leaf colour and normal (instanceColor, aN, aC2) as INSTANCE attributes; a grown
// tree is drawn as an instance itself, so its leaves become plain vertices: the colour goes in the vertex colour, aN and
// aC2 in vertex attributes, and the hook below reads them that way (and turns aN with the tree's own rotation).
const WMAT=new Map();
function leafHook(o){return function(sh){
 sh.uniforms.uWindT=BIO.WIND.t;if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);sh.uniforms.uSunDir=BIO.SUN;
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uWindT;varying vec3 vFlWP;varying float vFlD;\n'+
   (o.aN?'attribute vec3 aN;varying vec3 vFlN;\n':'')+(o.irid?'attribute vec3 aC2;varying vec3 vFlC2;\n':''))
  .replace('#include <project_vertex>',['vec4 mvPosition=vec4(transformed,1.0);float _ph=0.0;vec3 _nr='+(o.aN?'aN':'vec3(0.0,1.0,0.0)')+';',
   '#ifdef USE_INSTANCING','mvPosition=instanceMatrix*mvPosition;_ph=dot(instanceMatrix[3].xyz,vec3(0.131,0.073,0.117));_nr=mat3(instanceMatrix)*_nr;','#endif',
   // the crown sways with its height in the tree (the trunk's foot stays put)
   'float _wg=clamp(position.y/9.0,0.0,1.6);',
   'mvPosition.xyz+=_wg*vec3(sin(uWindT*0.9+_ph)+0.45*sin(uWindT*2.3+_ph*1.7+position.x*0.6),0.25*sin(uWindT*1.6+_ph*0.6),cos(uWindT*0.7+_ph*1.3)+0.45*sin(uWindT*2.9+_ph+position.z*0.6))*'+(o.swayA==null?.06:o.swayA).toFixed(3)+';',
   'vFlWP=(modelMatrix*mvPosition).xyz;'+(o.aN?'vFlN=normalize(_nr);':'')+(o.irid?'vFlC2=aC2;':''),
   'mvPosition=modelViewMatrix*mvPosition;vFlD=-mvPosition.z;gl_Position=projectionMatrix*mvPosition;'].join('\n'));
 // the normal pass runs before the position pass: it turns aN itself (by the tree's rotation when instanced)
 if(o.aN)sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>',['vec3 _an=aN;','#ifdef USE_INSTANCING','_an=mat3(instanceMatrix)*_an;','#endif','vec3 transformedNormal=normalize(normalMatrix*_an);'].join('\n'));
 else sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n{vec3 _up=normalize(normalMatrix*vec3(0.0,1.0,0.0));transformedNormal=normalize(mix(normalize(transformedNormal),_up,0.45));}');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWindT;uniform vec3 uSunDir;varying vec3 vFlWP;varying float vFlD;\n'+(o.aN?'varying vec3 vFlN;\n':'')+(o.irid?'varying vec3 vFlC2;\n':''))
  .replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.a*=1.0+clamp(vFlD/650.0,0.0,1.1);')
  .replace('reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;','reflectedLight.indirectDiffuse += 0.72*vIndirectFront + 0.28*vIndirectBack;')
  .replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;','reflectedLight.directDiffuse = vLightFront + 0.30*vLightBack;');
 if(o.irid)sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>',
  '{vec3 _V=normalize(cameraPosition-vFlWP);vec3 _N=normalize('+(o.aN?'vFlN':'vec3(0.0,1.0,0.0)')+');float _fr=1.0-abs(dot(_N,_V));float _sf=dot(_N,uSunDir)*0.5+0.5;',
  ' float _sh=0.16*sin(uWindT*0.8+dot(vFlWP,vec3(0.045,0.083,0.037)))+0.08*sin(uWindT*1.9+dot(vFlWP,vec3(-0.21,0.13,0.17)));',
  ' float _k=smoothstep(0.22,0.78,_sf*1.15-_fr*0.80+0.30+_sh);diffuseColor.rgb*=mix(vFlC2,vColor,_k)/max(vColor,vec3(0.004));}'].join('\n'));};}
function worldMat(m){if(WMAT.has(m))return WMAT.get(m);let w=null;const b=m.userData&&m.userData.bio;
 if(b&&b.kind==='leaf'){const o=b.opts||{};w=new THREE.MeshLambertMaterial({map:m.map,alphaTest:m.alphaTest||.42,side:THREE.DoubleSide,vertexColors:true});
  w.onBeforeCompile=leafHook(o);const ck='wleaf|'+(o.aN?1:0)+(o.irid?1:0)+'|'+(o.swayA==null?.06:o.swayA);w.customProgramCacheKey=()=>ck;w.userData.kind='leaf';w.userData.opts=o;}
 else if(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial||m.isMeshBasicMaterial){
  // a bark, a rod, a rock: the same material with vertex colours on (an item's per-instance colour is a vertex colour
  // now). A kit's own hook on it (iridescent bark, gloss bark) is kept: it reads no instance attribute.
  w=m.clone();w.vertexColors=true;
  if(m.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile)w.onBeforeCompile=m.onBeforeCompile;
  if(m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey){const k=m.customProgramCacheKey();w.customProgramCacheKey=()=>'w|'+k;}
  w.userData.kind=b?b.kind:'plain';}
 WMAT.set(m,w);return w;}

// ---------------------------------------------------------------- harvest: what the kit wrote, as one geometry per material
// Positions relative to (ox,oz). anchor: each vertex also carries where its plant stands, [x, z, item] (an item's own
// origin, item 1; a bucket's vertex its own place, item 0), for the floor, which sets every plant on the ground it lands
// on and thins whole plants, never a rock's triangles.
const _m=new THREE.Matrix4(),_nm=new THREE.Matrix3(),_v=new THREE.Vector3(),_n=new THREE.Vector3();
function harvest(kn,ox,oz,anchor){const R=BIO.kits[kn],G=new Map();
 const grp=m=>{const w=worldMat(m);if(!w)return null;let g=G.get(w);if(!g){g={mat:w,P:[],N:[],U:[],C:[],AN:[],AC:[],A:[],aN:false,aC2:false};G.set(w,g);}return g;};
 for(const name of R.order){const it=R.items[name];if(!it.count)continue;const def=R.defs[name],g=grp(def.mat);
  if(g){const geo=def.geo,P=geo.attributes.position.array,N=geo.attributes.normal?geo.attributes.normal.array:null,U=geo.attributes.uv?geo.attributes.uv.array:null,VC=geo.attributes.color?geo.attributes.color.array:null,nv=geo.attributes.position.count;
   const hasN=def.attrs&&def.attrs.indexOf('aN')>=0,hasC2=def.attrs&&def.attrs.indexOf('aC2')>=0;if(hasN)g.aN=true;if(hasC2)g.aC2=true;
   const IM=it.m.a,IC=it.c.a,INN=it.n.a,IC2=it.c2.a;
   for(let i=0;i<it.count;i++){_m.fromArray(IM,i*16);_nm.getNormalMatrix(_m);const tx=IM[i*16+12]-ox,tz=IM[i*16+14]-oz;
    for(let k=0;k<nv;k++){_v.set(P[k*3],P[k*3+1],P[k*3+2]).applyMatrix4(_m);g.P.push(_v.x-ox,_v.y,_v.z-oz);
     if(N){_n.set(N[k*3],N[k*3+1],N[k*3+2]).applyMatrix3(_nm).normalize();g.N.push(_n.x,_n.y,_n.z);}else g.N.push(0,1,0);
     g.U.push(U?U[k*2]:0,U?U[k*2+1]:0);
     const r=IC[i*3],gg=IC[i*3+1],b=IC[i*3+2];if(VC)g.C.push(r*VC[k*3],gg*VC[k*3+1],b*VC[k*3+2]);else g.C.push(r,gg,b);
     g.AN.push(hasN?INN[i*3]:0,hasN?INN[i*3+1]:1,hasN?INN[i*3+2]:0);g.AC.push(hasC2?IC2[i*3]:r,hasC2?IC2[i*3+1]:gg,hasC2?IC2[i*3+2]:b);
     if(anchor)g.A.push(tx,tz,1);}}}
  else ST.skipped[name]=(ST.skipped[name]||0)+1;
  it.m=new BIO.F32();it.c=new BIO.F32();it.n=new BIO.F32();it.c2=new BIO.F32();for(const a in it.x)it.x[a]=new BIO.F32();it.k=[];it.count=0;}
 for(const fam in R.buckets){const K=R.buckets[fam];if(!K.pos.length)continue;const g=grp(K.mat);
  if(g){const P=K.pos.a,N=K.nor.a,U=K.uv.a,C=K.col.a,n=K.pos.length/3;
   for(let k=0;k<n;k++){g.P.push(P[k*3]-ox,P[k*3+1],P[k*3+2]-oz);g.N.push(N[k*3],N[k*3+1],N[k*3+2]);g.U.push(U[k*2],U[k*2+1]);g.C.push(C[k*3],C[k*3+1],C[k*3+2]);
    g.AN.push(N[k*3],N[k*3+1],N[k*3+2]);g.AC.push(C[k*3],C[k*3+1],C[k*3+2]);if(anchor)g.A.push(P[k*3]-ox,P[k*3+2]-oz,0);}}
  K.pos=new BIO.F32();K.nor=new BIO.F32();K.uv=new BIO.F32();K.col=new BIO.F32();K.k=[];K.tris=0;}
 const parts=[];let tris=0,y1=0,r=0;
 for(const g of G.values()){if(!g.P.length)continue;const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(g.P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(g.N,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(g.U,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(g.C,3));
  if(g.mat.userData.kind==='leaf'){if(g.mat.userData.opts.aN)geo.setAttribute('aN',new THREE.Float32BufferAttribute(g.AN,3));if(g.mat.userData.opts.irid)geo.setAttribute('aC2',new THREE.Float32BufferAttribute(g.AC,3));}
  if(anchor)geo.userData.anchor=new Float32Array(g.A);
  geo.computeBoundingSphere();tris+=g.P.length/9;
  for(let k=0;k<g.P.length;k+=3){if(g.P[k+1]>y1)y1=g.P[k+1];const d=Math.hypot(g.P[k],g.P[k+2]);if(d>r)r=d;}
  parts.push({geo,mat:g.mat});}
 return{parts,tris,top:y1,radius:r};}

// ---------------------------------------------------------------- growing
// the stage's fields while a tree grows: neutral (a tree's builder reads none of them but make() may read wet)
const NEUTRAL={wet:.4,flow:0,upland:.3,canyon:0,rim:0,rock:0,dune:0,oasis:0,slope:.05,abyss:0,salt:0,cold:0,mist:0,abyssUp:.4,h:0,water:-1e9,depth:-1e9};
function growTree(S){const K=KIT[S.kit],t0=performance.now();
 // a hypertree's mid level is its hero grown as if 1.3 km from the viewer: the kit's own lighter crown
 HOST.nursery(NEUTRAL,S.kit==='hyperjungle'&&S.lv===1?[1300,0]:[0,0]);
 let out=null;
 try{BIO.fn.reseed(KRAND.hash(7001,KIDX[S.kit],S.sp,S.v,S.sapling?1:0));const T=K.make(S.sp,0,0,0,S.sapling);
  const st=K.grow(T,S.lv);const h=harvest(S.kit,0,0,false);
  out=st===null?{none:true,parts:[],H:T.H}:Object.assign(h,{H:T.H,crownR:T.crownR||T.cr||5,rb:T.rb||1});}
 catch(e){reportErr('nursery '+S.kit+'/'+S.sp+'/'+S.lv+': '+(e.stack||e));out={none:true,parts:[],H:1};}
 finally{HOST.world();}
 ST.trees++;ST.tris+=out.tris||0;ST.ms+=performance.now()-t0;return out;}
// the floor patches: 32 m, the kit's floor pass clipped to them, under a zone's profile
const PATCH=16;
function clipGrid(box,fn){const g=BIO.grid;BIO.grid=function(cell,rIn,rOut,accept,f,opt){opt=Object.assign({},opt||{});const b=opt.box;
  opt.box=b?[Math.max(b[0],box[0]),Math.max(b[1],box[1]),Math.min(b[2],box[2]),Math.min(b[3],box[3])]:box;
  if(opt.box[0]>=opt.box[2]||opt.box[1]>=opt.box[3])return 0;return g.call(BIO,cell,rIn,rOut,accept,f,opt);};
 try{return fn();}finally{BIO.grid=g;}}
function growPatch(S){const K=KIT[S.kit],t0=performance.now(),prof=FLOORS[S.kit].profiles[S.profile];
 // each variant grows somewhere else on the stage, so the kit's own noise (stands, patchiness) differs
 const ox=7919*(S.v+1)+1013*prof.i,oz=-4801*(S.v+1)+613*prof.i;
 HOST.nursery(Object.assign({},NEUTRAL,prof.f),[ox,oz]);
 let out=null;
 try{clipGrid([ox-PATCH,oz-PATCH,ox+PATCH,oz+PATCH],()=>K.buildFloor(PATCH*1.5,1));out=harvest(S.kit,ox,oz,true);}
 catch(e){reportErr('floor patch '+S.kit+'/'+S.profile+': '+(e.stack||e));out={parts:[],tris:0};}
 finally{HOST.world();}
 ST.patches++;ST.tris+=out.tris||0;ST.ms+=performance.now()-t0;return out;}
// the floor profiles per kit (WORLD_KITS[].floor.profiles): the fields that make the kit's zones() give that zone; each
// profile's index i moves its patches elsewhere on the stage
const FLOORS={};WORLD_KITS.forEach(k=>{const P={};Object.keys(k.floor.profiles).forEach((n,i)=>P[n]={i,f:k.floor.profiles[n]});FLOORS[k.name]={profiles:P};});
// ---------------------------------------------------------------- the queue
// get(key) is a prototype or null (and asks for it); pri: lower first (the distance it is wanted at)
function get(key,spec,pri){const p=PROTO.get(key);if(p)return p;const q=QUEUE.get(key);if(q){if(pri<q.pri)q.pri=pri;}else QUEUE.set(key,{key,spec,pri});return null;}
function update(budgetMs){if(!QUEUE.size)return 0;const t0=performance.now();let n=0;
 const L=[...QUEUE.values()].sort((a,b)=>a.pri-b.pri);
 for(const q of L){QUEUE.delete(q.key);PROTO.set(q.key,q.spec.patch?growPatch(q.spec):growTree(q.spec));n++;if(performance.now()-t0>budgetMs)break;}
 return n;}
return{get,update,FLOORS,KIDX,stats:ST,queued:()=>QUEUE.size,protos:PROTO,worldMat};})();
