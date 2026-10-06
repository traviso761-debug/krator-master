// ================================================================= HOST — trees as variants (biomes/WORLD.md)
// The showcase no longer builds 35,000 unique trees. The kit places level-free RECORDS (EBADLANDS.buildTrees(R,q,
// {records:true})); this fragment grows K VARIANTS of every species once at each level (2 hero, 1 mid, 0 the far
// impostor) with the kit's own builder (EBADLANDS.make / grow), harvests what the kit wrote into one geometry per
// material (a PROTOTYPE), and draws every record as an instance of its variant, at the level its distance from the
// CAMERA asks for, re-chosen as the camera moves. The open world does the same (openworld/little-demo, 84-world-nursery
// and 85-world-flora: harvest() and the leaf hook below are its, unchanged in substance).
//   What it saves: geometry (some 330 prototypes instead of 35k trees), build time and memory; and the triangles drawn,
//   because only the trees near the camera are heroes. Every hero is grown rich (EBADLANDS.RICH_ALL): a variant is paid
//   for once, so the spruce's full branches cost nothing per tree.
//   Heights: the K variants of a species span its height range and each record takes the nearest, so a tree is scaled
//   by little (a stretched variant's leaf cards read as giant leaves).
//   Forms: a record much smaller than its species (the treeline's krummholz spruce) takes a variant grown small, so it
//   keeps the flag-tree habit instead of being a shrunken tall spruce.
//   ?unique=1 builds every tree unique as before (88-host-build), for comparison.
var VARIANTS=(function(){
const K=6,ST={protos:0,growMs:0,drawn:0,levels:[0,0,0],pools:0,tris:0,calls:0};
const LOD={hero:[14,60,220],mid:[50,300,1000],far:[200,900,3200]};   // [metres per metre of height, at least, at most]
const lim=(a,H)=>Math.min(a[2],Math.max(a[1],a[0]*H));
// ---------------------------------------------------------------- materials for instancing (the open world's)
// A kit's leaf material reads its per-leaf colour and normal as INSTANCE attributes; a grown tree is an instance itself,
// so its leaves are plain vertices: the colour is the vertex colour, aN a vertex attribute turned by the tree's rotation.
const WMAT=new Map();
function leafHook(o){return function(sh){
 sh.uniforms.uWindT=BIO.WIND.t;if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);sh.uniforms.uSunDir=BIO.SUN;
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uWindT;varying vec3 vFlWP;varying float vFlD;\n'+(o.aN?'attribute vec3 aN;varying vec3 vFlN;\n':''))
  .replace('#include <project_vertex>',['vec4 mvPosition=vec4(transformed,1.0);float _ph=0.0;vec3 _nr='+(o.aN?'aN':'vec3(0.0,1.0,0.0)')+';',
   '#ifdef USE_INSTANCING','mvPosition=instanceMatrix*mvPosition;_ph=dot(instanceMatrix[3].xyz,vec3(0.131,0.073,0.117));_nr=mat3(instanceMatrix)*_nr;','#endif',
   'float _wg=clamp(position.y/9.0,0.0,1.6);',
   'mvPosition.xyz+=_wg*vec3(sin(uWindT*0.9+_ph)+0.45*sin(uWindT*2.3+_ph*1.7+position.x*0.6),0.25*sin(uWindT*1.6+_ph*0.6),cos(uWindT*0.7+_ph*1.3)+0.45*sin(uWindT*2.9+_ph+position.z*0.6))*'+(o.swayA==null?.06:o.swayA).toFixed(3)+';',
   'vFlWP=(modelMatrix*mvPosition).xyz;'+(o.aN?'vFlN=normalize(_nr);':''),
   'mvPosition=modelViewMatrix*mvPosition;vFlD=-mvPosition.z;gl_Position=projectionMatrix*mvPosition;'].join('\n'));
 if(o.aN)sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>',['vec3 _an=aN;','#ifdef USE_INSTANCING','_an=mat3(instanceMatrix)*_an;','#endif','vec3 transformedNormal=normalize(normalMatrix*_an);'].join('\n'));
 else sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n{vec3 _up=normalize(normalMatrix*vec3(0.0,1.0,0.0));transformedNormal=normalize(mix(normalize(transformedNormal),_up,0.45));}');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWindT;uniform vec3 uSunDir;varying vec3 vFlWP;varying float vFlD;\n'+(o.aN?'varying vec3 vFlN;\n':''))
  .replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.a*=1.0+clamp(vFlD/650.0,0.0,1.1);')
  .replace('reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;','reflectedLight.indirectDiffuse += 0.72*vIndirectFront + 0.28*vIndirectBack;')
  .replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;','reflectedLight.directDiffuse = vLightFront + 0.30*vLightBack;');};}
function worldMat(m){if(WMAT.has(m))return WMAT.get(m);let w=null;const b=m.userData&&m.userData.bio;
 if(b&&b.kind==='leaf'){const o=b.opts||{};w=new THREE.MeshLambertMaterial({map:m.map,alphaTest:m.alphaTest||.42,side:THREE.DoubleSide,vertexColors:true});
  w.onBeforeCompile=leafHook(o);const ck='vleaf|'+(o.aN?1:0)+'|'+(o.swayA==null?.06:o.swayA);w.customProgramCacheKey=()=>ck;w.userData.kind='leaf';w.userData.opts=o;}
 else{w=m.clone();w.vertexColors=true;w.userData.kind=b?b.kind:'plain';}
 WMAT.set(m,w);return w;}
// ---------------------------------------------------------------- harvest: what the kit wrote, one geometry per material
const _m=new THREE.Matrix4(),_nm=new THREE.Matrix3(),_v=new THREE.Vector3(),_n=new THREE.Vector3();
function harvest(){const R=BIO.kits.ebadlands,G=new Map();
 const grp=m=>{const w=worldMat(m);let g=G.get(w);if(!g){g={mat:w,P:[],N:[],U:[],C:[],AN:[]};G.set(w,g);}return g;};
 for(const name of R.order){const it=R.items[name];if(!it.count)continue;const def=R.defs[name],g=grp(def.mat),geo=def.geo;
  const P=geo.attributes.position.array,N=geo.attributes.normal?geo.attributes.normal.array:null,U=geo.attributes.uv?geo.attributes.uv.array:null,VC=geo.attributes.color?geo.attributes.color.array:null,nv=geo.attributes.position.count;
  const hasN=def.attrs&&def.attrs.indexOf('aN')>=0,IM=it.m.a,IC=it.c.a,INN=it.n.a;
  for(let i=0;i<it.count;i++){_m.fromArray(IM,i*16);_nm.getNormalMatrix(_m);
   for(let k=0;k<nv;k++){_v.set(P[k*3],P[k*3+1],P[k*3+2]).applyMatrix4(_m);g.P.push(_v.x,_v.y,_v.z);
    if(N){_n.set(N[k*3],N[k*3+1],N[k*3+2]).applyMatrix3(_nm).normalize();g.N.push(_n.x,_n.y,_n.z);}else g.N.push(0,1,0);
    g.U.push(U?U[k*2]:0,U?U[k*2+1]:0);const r=IC[i*3],gg=IC[i*3+1],b=IC[i*3+2];
    if(VC)g.C.push(r*VC[k*3],gg*VC[k*3+1],b*VC[k*3+2]);else g.C.push(r,gg,b);g.AN.push(hasN?INN[i*3]:0,hasN?INN[i*3+1]:1,hasN?INN[i*3+2]:0);}}
  it.m=new BIO.F32();it.c=new BIO.F32();it.n=new BIO.F32();it.c2=new BIO.F32();for(const a in it.x)it.x[a]=new BIO.F32();it.k=[];it.count=0;}
 for(const fam in R.buckets){const Kb=R.buckets[fam];if(!Kb.pos.length)continue;const g=grp(Kb.mat),P=Kb.pos.a,N=Kb.nor.a,U=Kb.uv.a,C=Kb.col.a,n=Kb.pos.length/3;
  for(let k=0;k<n;k++){g.P.push(P[k*3],P[k*3+1],P[k*3+2]);g.N.push(N[k*3],N[k*3+1],N[k*3+2]);g.U.push(U[k*2],U[k*2+1]);g.C.push(C[k*3],C[k*3+1],C[k*3+2]);g.AN.push(N[k*3],N[k*3+1],N[k*3+2]);}
  Kb.pos=new BIO.F32();Kb.nor=new BIO.F32();Kb.uv=new BIO.F32();Kb.col=new BIO.F32();Kb.k=[];Kb.tris=0;}
 const parts=[];let tris=0;
 for(const g of G.values()){if(!g.P.length)continue;const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(g.P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(g.N,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(g.U,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(g.C,3));
  if(g.mat.userData.kind==='leaf'&&g.mat.userData.opts.aN)geo.setAttribute('aN',new THREE.Float32BufferAttribute(g.AN,3));
  geo.computeBoundingSphere();tris+=g.P.length/9;parts.push({geo,mat:g.mat,tris:g.P.length/9});}
 return{parts,tris};}
// ---------------------------------------------------------------- growing the variants
const PROTO=new Map(),SP=()=>EBADLANDS.SPECIES;
const formOf=r=>r.H<SP()[r.sp].H[0]*.6?'s':'n';   // 's': grown small (the treeline's krummholz)
// a record's variant: the one grown nearest its height (scaling a 16 m spruce to 30 m doubled its spray cards)
const varOf=r=>{if(formOf(r)==='s')return r.seed%K;const S=SP()[r.sp],u=(r.H-S.H[0])/Math.max(.01,S.H[1]-S.H[0]);return Math.max(0,Math.min(K-1,Math.floor(u*K)));};
function grow(sp,form,v,lv){const S=SP()[sp],key=sp+'|'+form+'|'+v+'|'+lv;if(PROTO.has(key))return PROTO.get(key);
 BIO.fn.reseed(((sp+1)*7919+v*104729+(form==='s'?31:0))>>>0);const T=EBADLANDS.make(sp,0,0,0);
 if(form==='s'){T.H=S.H[0]*.25+v*.15;T.crownR=S.crownR[0]*.6;T.rb=S.rb[0]*.5;}
 else{const H=S.H[0]+(S.H[1]-S.H[0])*(v+.5)/K,k=H/T.H;T.H=H;T.rb*=Math.sqrt(k);}   // the variants span the species' heights (a tree scales little)
 const st=EBADLANDS.grow(T,lv),out=st===null?{parts:[],tris:0}:harvest();out.H=T.H;out.key=key;PROTO.set(key,out);ST.protos++;return out;}
function growAll(){const t0=performance.now(),H0=BIO.host.terrainH,R0=BIO.host.register,O0=BIO.host.obstacles,M0=BIO.host.mask;
 // the nursery: flat ground at y=0, no obstacles, nothing registered (a variant stands nowhere)
 BIO.host.terrainH=()=>0;BIO.host.register=()=>{};BIO.host.obstacles=[];BIO.host.mask=()=>1;EBADLANDS.RICH_ALL=true;BIO.cur='badlands/nursery';
 try{const forms=new Set(EBADLANDS.TREES.map(r=>r.sp+'|'+formOf(r)));
  for(const f of forms){const [sp,form]=f.split('|');for(let v=0;v<K;v++)for(const lv of [2,1,0])grow(+sp,form,v,lv);}}
 finally{BIO.host.terrainH=H0;BIO.host.register=R0;BIO.host.obstacles=O0;BIO.host.mask=M0;EBADLANDS.RICH_ALL=false;BIO.cur=null;}
 ST.growMs=Math.round(performance.now()-t0);}
// ---------------------------------------------------------------- drawing: one pool of instances per prototype
const POOLS=new Map(),_q=new THREE.Quaternion(),_p=new THREE.Vector3(),_s=new THREE.Vector3(),_Y=new THREE.Vector3(0,1,0),M4=new THREE.Matrix4();
function pool(proto,sp){let p=POOLS.get(proto.key);if(!p){p={proto,n:0,cap:0,arr:null,attr:null,meshes:[],sp};POOLS.set(proto.key,p);}return p;}
function ensure(p,n){if(n<=p.cap)return;let cap=Math.max(16,p.cap);while(cap<n)cap*=2;
 for(const m of p.meshes)scene.remove(m);p.meshes=[];const old=p.arr;p.arr=new Float32Array(cap*16);if(old)p.arr.set(old);
 p.attr=new THREE.InstancedBufferAttribute(p.arr,16);p.attr.setUsage(THREE.DynamicDrawUsage);p.cap=cap;
 const white=new THREE.InstancedBufferAttribute(new Float32Array(cap*3).fill(1),3),S=SP()[p.sp];
 for(const part of p.proto.parts){const m=new THREE.InstancedMesh(part.geo,part.mat,cap);m.instanceMatrix=p.attr;m.instanceColor=white;m.frustumCulled=false;m.count=0;
  m.userData.biome=true;m.userData.species=S.key;m.userData.inspectLabel=S.name;m.name='variant:'+p.proto.key;m.userData.partTris=part.tris;scene.add(m);p.meshes.push(m);}}
function levelOf(r,d){if(d<lim(LOD.hero,r.H))return 2;if(d<lim(LOD.mid,r.H))return 1;if(d<lim(LOD.far,r.H))return 0;return -1;}
let last=null;
function update(P,force){if(!force&&last&&Math.hypot(P.x-last.x,P.y-last.y,P.z-last.z)<6)return;last=P.clone?P.clone():{x:P.x,y:P.y,z:P.z};
 for(const p of POOLS.values())p.n=0;const lv3=[0,0,0];let n=0;
 for(const r of EBADLANDS.TREES){const dx=r.x-P.x,dz=r.z-P.z,dy=r.y0-P.y,d=Math.sqrt(dx*dx+dz*dz+dy*dy*.25),lv=levelOf(r,d);if(lv<0)continue;
  const proto=PROTO.get(r.sp+'|'+formOf(r)+'|'+varOf(r)+'|'+lv);if(!proto||!proto.parts.length)continue;
  const p=pool(proto,r.sp);ensure(p,p.n+1);const sc=r.H/(proto.H||r.H);
  _q.setFromAxisAngle(_Y,(r.seed%628)/100);_p.set(r.x,r.y0+.4,r.z);_s.set(sc,sc,sc);M4.compose(_p,_q,_s);M4.toArray(p.arr,p.n*16);p.n++;n++;lv3[lv]++;}
 let pools=0,tris=0,calls=0;
 for(const p of POOLS.values()){for(const m of p.meshes){m.count=p.n;m.visible=p.n>0;if(p.n){tris+=p.n*m.userData.partTris;calls++;}}if(p.attr)p.attr.needsUpdate=true;if(p.n)pools++;}
 ST.drawn=n;ST.levels=lv3;ST.pools=pools;ST.tris=Math.round(tris);ST.calls=calls;}
// the record nearest a point (the inspector names a tree from it)
function nearest(x,z,r){let b=null,bd=r||1e9;for(const T of EBADLANDS.TREES){const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;}
const api={K,LOD,stats:ST,protos:PROTO,pools:POOLS,ready:false,nearest,
 init(){growAll();api.ready=true;update(camera.position,true);},update};
return api;})();
