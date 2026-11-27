// ================================================================= OPEN WORLD — the far level as octahedral impostors (opt-in)
// [web] A region lists this fragment after 84-world-nursery.js, and a kit in its registry asks for it
// (WORLD_KITS[].impostor = {lv, variants, grid, cell, gain, wrap}). Then that kit's far level (lv 0) is not the kit's own far tree (the
// hyperjungle's blob crowns, ~500 triangles) but ONE quad: the biome core's octahedral impostor (core/biome/34-core-impostor.js,
// which the region's page lists), baked once per species and variant from the tree the nursery grows at level `lv` (1, the
// mid, by default: the far quad and the mid tree it follows then match at the hand-over). The quad turns to the camera and
// blends the three nearest of grid x grid baked views; one draw call for each variant drawn, two triangles a tree.
//   the bake    one set per kit (one atlas pair, one material: up to 25 slots, species x variants); each slot grows its tree
//               on the nursery's stage exactly as 84 grows it (the same seed, the same profile and origin), and the core
//               renders its views once the kit's textures are in (BIO.bakeImpostors waits for them, 30 s at most)
//   the draw    NURSERY.get for a far record of that kit hands the slot's quad (keyed as 84 keys the far level, so 85 draws it
//               in its pool like any prototype); until the bake is done it hands nothing (85 falls back to a level already
//               grown), and NURSERY.queued counts the bake, so the curtain stays down until the far forest can draw
//   the depth   the core's impostor material writes the plain depth; the world's renderer has a logarithmic depth buffer, so
//               the world draws the quads with a copy of that material that writes the logarithmic depth (its uniforms
//               shared: the atlases and the lights the core sets reach it)
// A kit with no `impostor` entry is grown by 84 as before; a page without this fragment never changes.
(function(){'use strict';
if(typeof NURSERY==='undefined'||!BIO.impostor||!BIO.IMP||!BIO.IMP.GLSL)return;
const ASK=WORLD_KITS.map((k,i)=>k.impostor?{i,k,o:k.impostor}:null).filter(Boolean);
if(!ASK.length)return;
/* the nursery's stage while a tree grows (84-world-nursery.js NEUTRAL, the same values: a tree's builder reads none of them
   but make() may read wet) */
const NEUTRAL={wet:.4,flow:0,upland:.3,canyon:0,rim:0,rock:0,dune:0,oasis:0,slope:.05,abyss:0,salt:0,cold:0,mist:0,abyssUp:.4,h:0,water:-1e9,depth:-1e9};
const ST={sets:0,slots:0,baked:0,failed:0,ms:0,pending:0};
/* the core's impostor shaders with the logarithmic depth written (r128 chunks); the vertex shader takes <common> for
   isPerspectiveMatrix */
const G=BIO.IMP.GLSL;
const VERT='#include <common>\n#include <logdepthbuf_pars_vertex>\n'+G.vertex.replace(/\n #include <fog_vertex>\n\}$/,'\n #include <fog_vertex>\n #include <logdepthbuf_vertex>\n}');
const FRAG='#include <logdepthbuf_pars_fragment>\n'+G.fragment.replace(/void main\(\)\{/,'void main(){\n #include <logdepthbuf_fragment>\n');
if(VERT.indexOf('logdepthbuf_vertex')<0||FRAG.indexOf('logdepthbuf_fragment')<0)reportErr('84i: the impostor shader changed shape (core/biome/34): no logarithmic depth');
const KITS=ASK.map(A=>{const o=A.o,name=A.k.name,api=WORLD_KITS.api(A.k),nv=Math.max(1,Math.min(4,o.variants==null?2:o.variants)),lv=o.lv==null?1:o.lv;
 const nsp=api.SPECIES.length,slots=Math.min(25,nsp*nv);
 const prev=BIO.kit(name);let set,recs=[],mat=null;
 try{set=BIO.impostorSet('world.'+name+'.far',{grid:o.grid==null?8:o.grid,cell:o.cell==null?64:o.cell,slots,label:'far '+name});
  for(let sp=0;sp<nsp;sp++)for(let v=0;v<nv;v++){if(recs.length>=slots)break;const R={sp,v,H:1,rec:null};
   R.rec=BIO.impostor('world.'+name+'.'+sp+'.'+v,()=>{R.H=growOne(name,A.i,api,sp,v,lv);},{set,label:name+' '+sp+'/'+v+' (far)'});
   if(R.rec){R.rec.kit=name;recs.push(R);}}}
 finally{BIO.kit(prev);}
 if(set){mat=new THREE.ShaderMaterial({uniforms:set.mat.uniforms,vertexShader:VERT,fragmentShader:FRAG,fog:true,side:THREE.DoubleSide});mat.userData.kind='impostor';}
 ST.sets++;ST.slots+=recs.length;return{name,i:A.i,nv,lv,set,recs,mat,protos:new Map()};});
/* one tree on the nursery's stage, as 84's growTree grows it (its seed, its origin: a hypertree's mid is grown 1.3 km off) */
function growOne(name,ki,api,sp,v,lv){HOST.nursery(NEUTRAL,name==='hyperjungle'&&lv===1?[1300,0]:[0,0]);
 try{BIO.fn.reseed(KRAND.hash(7001,ki,sp,v,0));const T=api.make(sp,0,0,0,false);api.grow(T,lv);return T.H;}finally{HOST.world();}}
/* the quad of one slot: the core's unit quad, its slot in a vertex attribute (the world's pools instance the matrix only) */
function quad(K,R){const g=new THREE.PlaneGeometry(2,2),n=g.attributes.position.count,a=new Float32Array(n*4);
 for(let i=0;i<n;i++)a[i*4]=R.rec.slot;g.setAttribute('aImp',new THREE.Float32BufferAttribute(a,4));
 g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),R.rec.radius*2);
 return{parts:[{geo:g,mat:K.mat}],H:R.H,tris:2,top:R.rec.centre[1]+R.rec.radius,radius:R.rec.radius,impostor:true};}
/* the impostors' light (BIO.impostorLook: page-wide, one look for every set): the bake comes out darker than the drawn
   crowns, and each kit's own page sets the gain and wrap it measured against its near trees (the hyperjungle: 1.6 and 1,
   biomes/hyperjungle/src/88-host-build.js); the registry's entry gives the same numbers here (the first kit that gives them) */
{const L=ASK.find(A=>A.o.gain!=null||A.o.wrap!=null);if(L&&BIO.impostorLook)BIO.impostorLook({gain:L.o.gain==null?1:L.o.gain,wrap:L.o.wrap==null?0:L.o.wrap});}
let baking=true;const t0=performance.now();
const done=()=>{baking=false;ST.ms=Math.round(performance.now()-t0);for(const K of KITS)for(const R of K.recs){if(R.rec.ready)ST.baked++;else ST.failed++;}};
/* the bake runs once the frame loop runs (the kits' textures are loading; the core waits for them in a tick) */
LATE.push(()=>{HOST.TICKS.push(function first(){const i=HOST.TICKS.indexOf(first);if(i>=0)HOST.TICKS.splice(i,1);
 BIO.bakeImpostors(HOST.renderer,{onDone:done});});});
const BY=new Map(KITS.map(K=>[K.name,K]));
const get0=NURSERY.get,queued0=NURSERY.queued;
NURSERY.get=function(key,spec,pri){const K=spec&&spec.lv===0&&!spec.sapling&&!spec.patch?BY.get(spec.kit):null;
 if(!K)return get0(key,spec,pri);
 let P=K.protos.get(key);if(P)return P;if(baking)return null;
 const R=K.recs[spec.sp*K.nv+(spec.v%K.nv)];
 if(!R||!R.rec.ready)return get0(key,spec,pri);   /* a slot that failed: the kit's own far tree */
 P=quad(K,R);K.protos.set(key,P);NURSERY.protos.set(key,P);return P;};
NURSERY.queued=()=>queued0()+(baking?1:0);
NURSERY.impostors={stats:ST,kits:KITS,baking:()=>baking};
})();
