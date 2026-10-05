// ================================================================= OPEN WORLD — the flora: placement records by tile, drawn as instances
// PLACEMENT [G data] is the kits' own: their pass tables (SEDESERT.PASSES, EASTABYSS.PASSES: species, cell, acceptance
// from the zones) and their zones() read on the world's fields. What changes for an open world (biomes/WORLD.md):
//  - SEEDED BY CELL. Every pass lays a jittered grid aligned to the world (cell origin at multiples of its cell size);
//    a cell's draws are KRAND.hash(seed, kit, pass, cell x, cell z), and a cell belongs to the 512 m tile its origin
//    falls in. A tile built alone holds exactly what it holds in any order of building (the probe checks it).
//  - WEIGHTED BY THE OVERLAY. A kit's acceptance is multiplied by its weight there (WORLD.kitW: the overlays blend over
//    a few km, so two kits' trees interpenetrate at a border), and nothing grows outside the region's polygon.
//  - LEVEL-FREE RECORDS. A record is {kit, species, variant, place, turn, height}; the level is chosen when it is drawn.
// Fields for a tile come from a grid of WORLD.at samples 32 m apart over the tile and its margin, read bilinearly;
// the ground under a placed tree is WORLD.H itself.
// DRAWING [draw]: a record within reach takes its level by distance (hero, mid, far impostor, or nothing) and joins the
// instance list of its prototype (NURSERY), one InstancedMesh per prototype part, positioned at a floating origin.
var FLORA;LATE.push(()=>{FLORA=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,TAU=Math.PI*2;
// MARGIN: a tile also places the cells within this of its edge (the field grid covers them), so a tree near the edge
// sees its neighbours in the next tile when the keep-clear decides; only the tile's own cells are kept
const TS=512,MARGIN=64,FS=32,FG=(TS+2*MARGIN)/FS+1,SEED=424242,VARIANTS=4;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const H=KRAND.hash,U=KRAND.unit;
const ST={tiles:0,records:0,tileMs:0,drawn:0,pools:0,levels:[0,0,0],queue:0,yielded:0};

// ---------------------------------------------------------------- the kits' pass tables, as data (47-world-kits.js)
// Each kit's own table (KIT.PASSES: species, cell, acceptance from its zones) or the one the registry gives for it; a
// stand pass ({stand:true, sp:[a,b]}) picks its species by the kit's stands, a pass with pick(x,z,h) by that.
const KITS=WORLD_KITS.map(k=>{const api=WORLD_KITS.api(k),SP=api.SPECIES;
 const passes=(k.passes||api.PASSES).map(P=>{const sp=Array.isArray(P.sp)?P.sp[0]:P.sp,S=sp!=null?SP[sp]:null;
  return{sp:P.sp,cell:P.cell,accept:P.accept,opt:P.opt||{},stand:!!P.stand,pick:P.pick||null,sapling:!!P.sapling,
   far:P.far!=null?!!P.far:(P.opt&&P.opt.far!=null?!!P.opt.far:!!(S&&S.far)),
   water:!!(P.opt&&P.opt.water),inWater:!!((P.opt&&P.opt.inWater)||(S&&S.depth)),depth:S&&S.depth};});
 return{name:k.name,api,zones:api.zones||null,SP,passes,lod:k.lod};});
const NK=KITS.length,REACH=KITS.map(K=>K.lod.far[2]);

// ---------------------------------------------------------------- a tile's field grid
function fieldGrid(x0,z0){const n=FG*FG,F={};const names=['h','water','slope','wet','flow','upland','abyssUp','canyon','rim','rock','dune','salt','cold','oasis','abyss','mist'];
 names.forEach(k=>F[k]=new Float32Array(n));F.w=KITS.map(()=>new Float32Array(n));F.inside=new Uint8Array(n);
 for(let j=0;j<FG;j++)for(let i=0;i<FG;i++){const x=x0+i*FS,z=z0+j*FS,k=j*FG+i,A=WORLD.at(x,z);
  for(const nm of names)F[nm][k]=A[nm];F.inside[k]=A.inside?1:0;for(let q=0;q<NK;q++)F.w[q][k]=WORLD.kitW(q,x,z);}
 F.names=names;F.x0=x0;F.z0=z0;return F;}
function gridSampler(F){const out={},names=F.names;let lx=NaN,lz=NaN;
 return function(x,z){if(x===lx&&z===lz)return out;const u=(x-F.x0)/FS,v=(z-F.z0)/FS;if(u<0||v<0||u>FG-1||v>FG-1)return null;
  const i=Math.min(FG-2,Math.floor(u)),j=Math.min(FG-2,Math.floor(v)),fu=u-i,fv=v-j,k=j*FG+i,a=(1-fu)*(1-fv),b=fu*(1-fv),c=(1-fu)*fv,d=fu*fv;
  for(const nm of names){const A=F[nm];out[nm]=A[k]*a+A[k+1]*b+A[k+FG]*c+A[k+FG+1]*d;}
  lx=x;lz=z;return out;};}
const bil=(A,F,x,z)=>{const u=(x-F.x0)/FS,v=(z-F.z0)/FS,i=Math.max(0,Math.min(FG-2,Math.floor(u))),j=Math.max(0,Math.min(FG-2,Math.floor(v))),fu=u-i,fv=v-j,k=j*FG+i;
 return A[k]*(1-fu)*(1-fv)+A[k+1]*fu*(1-fv)+A[k+FG]*(1-fu)*fv+A[k+FG+1]*fu*fv;};

// ---------------------------------------------------------------- placing one tile: records
function buildTile(tx,tz){const t0=performance.now(),x0=tx*TS,z0=tz*TS,recs=[];
 // which kits reach this tile at all (five probes); a tile no kit reaches costs five samples
 const live=KITS.map(()=>0);[[.5,.5],[0,0],[1,0],[0,1],[1,1]].forEach(p=>{for(let q=0;q<NK;q++)live[q]=Math.max(live[q],WORLD.kitW(q,x0+p[0]*TS,z0+p[1]*TS));});
 if(Math.max(...live)<.02){ST.tileMs+=performance.now()-t0;return recs;}
 const F=fieldGrid(x0-MARGIN,z0-MARGIN),samp=gridSampler(F),cand=[];
 HOST.fieldSource(samp,null);
 try{for(let ki=0;ki<NK;ki++){if(live[ki]<.02)continue;const K=KITS[ki];
  K.passes.forEach((P,pi)=>{const c=P.cell,pk=P.opt.patch==null?.6:P.opt.patch,ps=P.opt.patchScale||.01;
   const gx0=Math.ceil((x0-MARGIN)/c),gx1=Math.ceil((x0+TS+MARGIN)/c)-1,gz0=Math.ceil((z0-MARGIN)/c),gz1=Math.ceil((z0+TS+MARGIN)/c)-1;
   for(let gz=gz0;gz<=gz1;gz++)for(let gx=gx0;gx<=gx1;gx++){const h=H(SEED,ki,pi,gx,gz),x=(gx+U(H(h,1)))*c,z=(gz+U(H(h,2)))*c,u=U(H(h,3));
    // (the jitter may carry a cell's point over the tile's edge: the cell's own tile still owns it, and no other does)
    const w=bil(F.w[ki],F,x,z);if(w<.02||bil(F.inside,F,x,z)<.5)continue;
    const s=samp(x,z)||WORLD.at(x,z);if(s.slope>.88)continue;
    let a=1;if(K.zones){const Z=K.zones(x,z);a=P.accept(Z,x,z);}else a=P.accept();
    if(!(a>0))continue;
    const patch=pk>0?(1-pk*.5)+pk*BIO.fn.fbm(x*ps+7,z*ps-3,9484,2):1;
    if(u>a*w*Math.min(1.15,Math.max(0,patch)))continue;
    // the ground and the water, exactly
    // nothing grows on a town's ground or on a road (the carriageway, its shoulder and the foot's keep-clear)
    if(WORLD.townW(x,z)>0)continue;
    const y=WORLD.H(x,z),wl=WORLD.water(x,z),dep=wl-y;
    if(P.inWater){const D=P.depth||[-1.6,1.2];if(wl<-1e8||!(dep>=-D[1]&&dep<=-D[0]))continue;}
    else if(dep>-.3)continue;
    if(P.water&&s.flow<.45)continue;   // the kit's water-bound passes: only on a channel's bank
    let sp=P.sp,sap=P.sapling;
    if(P.stand)sp=BIO.standAt(x,z,2,.0022,71)===0?P.sp[0]:P.sp[1];
    if(P.pick)sp=P.pick(x,z,h);
    const S=K.SP[sp];let Ht;
    if(sap)Ht=20+40*Math.pow(U(H(h,5)),1.4);else Ht=S.H[0]+(S.H[1]-S.H[0])*U(H(h,5));
    if(P.opt.size){const T={H:Ht,crownR:0,rb:0};BIO.fn.reseed(h);P.opt.size(T,K.zones(x,z));Ht=T.H;}
    // the keep-clear: the kits' own numbers (a tree holds rb*1.4+1 round its foot, a newcomer keeps its pass's pad)
    const rb=sap?Ht*(sp===3?.085:.032)+.25:(S.rb?(S.rb[0]+S.rb[1])/2:1);
    if(WORLD.roadD(x,z)<rb*1.4+2.5)continue;
    const own=gx*c>=x0&&gx*c<x0+TS&&gz*c>=z0&&gz*c<z0+TS;
    cand.push({k:ki,sp,sap,v:H(h,6)%VARIANTS,x,y:y-.3,z,rot:U(H(h,7))*TAU,Ht,far:P.far,pass:pi,r:rb*1.4+1,pad:P.opt.pad==null?4:P.opt.pad,pr:h,own});}});}}
 finally{HOST.fieldSource(null);}
 // ORDER-FREE SPACING (biomes/WORLD.md: repairs decide from position alone). A candidate yields to a stronger one
 // (taller; a tie goes to the larger hash) standing within the stronger one's keep-clear radius plus its own pad.
 // Every candidate is a pure function of its cell, and the margin holds every neighbour that can reach a tile's own
 // cells, so the same trees survive whatever order the tiles are built in.
 const B=new Map(),BC=24,bk=(i,j)=>i*100003+j;
 for(const q of cand){const k=bk(Math.floor(q.x/BC),Math.floor(q.z/BC));let L=B.get(k);if(!L){L=[];B.set(k,L);}L.push(q);}
 const stronger=(a,b)=>a.Ht>b.Ht||(a.Ht===b.Ht&&a.pr>b.pr);
 for(const q of cand){if(!q.own)continue;const reach=60,i0=Math.floor((q.x-reach)/BC),i1=Math.floor((q.x+reach)/BC),j0=Math.floor((q.z-reach)/BC),j1=Math.floor((q.z+reach)/BC);let ok=true;
  for(let j=j0;j<=j1&&ok;j++)for(let i=i0;i<=i1&&ok;i++){const L=B.get(bk(i,j));if(!L)continue;
   for(const o of L){if(o===q||!stronger(o,q))continue;const d=Math.hypot(o.x-q.x,o.z-q.z);if(d<o.r+q.pad){ok=false;break;}}}
  if(ok){delete q.own;delete q.pr;recs.push(q);}else ST.yielded++;}
 ST.tileMs+=performance.now()-t0;return recs;}

// ---------------------------------------------------------------- residency
const TILES=new Map();let BUILD=[];
const tkey=(tx,tz)=>(tx+4096)*8192+(tz+4096);
function residency(P,budgetMs){const R=Math.max(...REACH),cx=Math.floor(P.x/TS),cz=Math.floor(P.z/TS),n=Math.ceil(R/TS)+1;
 const need=[];
 for(let dz=-n;dz<=n;dz++)for(let dx=-n;dx<=n;dx++){const tx=cx+dx,tz=cz+dz,k=tkey(tx,tz);if(TILES.has(k))continue;
  const d=Math.hypot(Math.max(0,Math.abs(P.x-(tx+.5)*TS)-TS/2),Math.max(0,Math.abs(P.z-(tz+.5)*TS)-TS/2));if(d>R)continue;need.push([d,tx,tz,k]);}
 need.sort((a,b)=>a[0]-b[0]);ST.queue=need.length;
 const t0=performance.now();let built=0;
 for(const q of need){const recs=buildTile(q[1],q[2]);TILES.set(q[3],{tx:q[1],tz:q[2],recs});built++;ST.records+=recs.length;if(performance.now()-t0>budgetMs)break;}
 // drop what is well out of reach (the unload radius is beyond the load radius: no tile flickers on its edge)
 if(TILES.size>4000||built)for(const [k,t] of TILES){const d=Math.hypot(Math.max(0,Math.abs(P.x-(t.tx+.5)*TS)-TS/2),Math.max(0,Math.abs(P.z-(t.tz+.5)*TS)-TS/2));
  if(d>R+2*TS){TILES.delete(k);ST.records-=t.recs.length;}}
 ST.tiles=TILES.size;return built;}

// ---------------------------------------------------------------- drawing: pools of instances per prototype
const POOLS=new Map();
const ORIGIN=new THREE.Vector3();const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_p=new THREE.Vector3(),_s=new THREE.Vector3(),_Y=new THREE.Vector3(0,1,0);
function pool(key,proto){let p=POOLS.get(key);if(!p){p={key,proto,n:0,cap:0,arr:null,attr:null,meshes:[]};POOLS.set(key,p);}return p;}
function ensure(p,n){if(n<=p.cap)return;let cap=Math.max(16,p.cap);while(cap<n)cap*=2;
 for(const m of p.meshes){scene.remove(m);m.dispose&&m.dispose();}p.meshes=[];const old=p.arr;p.arr=new Float32Array(cap*16);if(old)p.arr.set(old);p.attr=new THREE.InstancedBufferAttribute(p.arr,16);p.attr.setUsage(THREE.DynamicDrawUsage);p.cap=cap;
 for(const part of p.proto.parts){const m=new THREE.InstancedMesh(part.geo,part.mat,cap);m.instanceMatrix=p.attr;m.frustumCulled=false;m.count=0;m.userData.flora=p.key;m.userData.inspectLabel='flora';scene.add(m);p.meshes.push(m);}}
const spec=(r,lv)=>({kit:KITS[r.k].name,sp:r.sp,v:r.v,lv:r.sap?2:lv,sapling:r.sap});
const pkey=(r,lv)=>r.k+'|'+r.sp+'|'+r.v+'|'+(r.sap?'s':lv);
let on=true;
function levelOf(r,d){const L=KITS[r.k].lod;if(r.sap){const s=L.sapling;return d<s[1]?2:-1;}
 const lim=a=>Math.min(a[2],Math.max(a[1],a[0]*r.Ht));
 if(d<lim(L.hero))return 2;if(d<lim(L.mid))return 1;if(r.far&&d<lim(L.far))return 0;return -1;}
function draw(){const P=camera.position;ORIGIN.set(Math.round(P.x/1024)*1024,0,Math.round(P.z/1024)*1024);
 for(const p of POOLS.values())p.n=0;
 const lv3=[0,0,0];let n=0;
 if(on)for(const t of TILES.values())for(const r of t.recs){const dx=r.x-P.x,dz=r.z-P.z,dy=r.y-P.y,d=Math.sqrt(dx*dx+dz*dz+dy*dy*.25);
  let lv=levelOf(r,d);if(lv<0)continue;
  // the level wanted, else the nearest coarser one that is ready (a prototype grows while its trees wait)
  let proto=null,key;for(let l=lv;l>=0&&!proto;l--){key=pkey(r,l);proto=NURSERY.get(key,spec(r,l),d);if(r.sap)break;}
  if(!proto){if(lv<2&&!r.sap){for(let l=lv+1;l<=2&&!proto;l++){key=pkey(r,l);const pp=NURSERY.protos.get(key);if(pp)proto=pp;}}if(!proto)continue;}
  if(proto.none||!proto.parts.length)continue;
  const p=pool(key,proto);ensure(p,p.n+1);
  const sc=r.Ht/(proto.H||r.Ht);_q.setFromAxisAngle(_Y,r.rot);_p.set(r.x-ORIGIN.x,r.y,r.z-ORIGIN.z);_s.set(sc,sc,sc);_m.compose(_p,_q,_s);
  _m.toArray(p.arr,p.n*16);p.n++;n++;lv3[r.sap?2:lv]++;}
 let pools=0;for(const p of POOLS.values()){for(const m of p.meshes){m.count=p.n;m.visible=p.n>0;m.position.copy(ORIGIN);m.updateMatrix();m.updateMatrixWorld(true);}
  if(p.attr){p.attr.needsUpdate=true;}if(p.n)pools++;}
 ST.drawn=n;ST.pools=pools;ST.levels=lv3;}
// the record nearest (x,z) within r (the inspector)
function nearest(x,z,r){let best=null,bd=r;for(const t of TILES.values()){if(Math.abs((t.tx+.5)*TS-x)>TS/2+r||Math.abs((t.tz+.5)*TS-z)>TS/2+r)continue;
 for(const q of t.recs){const d=Math.hypot(q.x-x,q.z-z);if(d<bd){bd=d;best=q;}}}
 if(!best)return null;const K=KITS[best.k],S=K.SP[best.sp];return{rec:best,kit:K.name,name:best.sap?'immature '+S.name:S.name,key:S.key,tags:S.tags||null,dist:bd};}
return{residency,draw,nearest,buildTile,stats:ST,KITS,TS,setOn:v=>{on=v;},tiles:TILES,pools:POOLS};})();});
