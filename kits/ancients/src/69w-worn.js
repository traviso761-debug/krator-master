// ---------------------------------------------------------------- the WORN variant (decay 5)
// Worn: the intact structure, whole, with a thousand years of weather on it. It
// is not ruined (nothing is removed) and not colonised (nothing grows on it
// except a few tufts on the tall towers). Ported from Yuni's copy of the kit
// (settlements/yuni/tools/anc_kit_tail.js), where it was written for the
// `ancient_*` assets, so any build can now show an Ancient building worn.
//
// How a build asks for it: call the builder at decay 0 with HOLES=1, then
// wornPass(G, lens0, plants), where lens0 is wornLens() taken just before the
// builder ran. 90-scene.js does this for decay 5 in any target that lists it.
// The pass:
//  1. re-skins every MAT.white mesh of the structure in MAT.whiteWorn (the
//     panel grid with rust bleeding from seams and fasteners, tinted dirty
//     white) and moves the white instanced parts the builder placed onto a
//     worn twin of their kit item;
//  2. rust: a multiply streak under every ledge, sill and ring, long runs down
//     the walls, and flush rusted plates where the skin has gone;
//  3. weather: water staining under the ledges and, only when `plants` > 0, a
//     trace of moss and vine.
// All of it goes through existing kit items ('stain', 'patchPlate', 'moss',
// 'vine'), so a worn building costs no extra draw call beyond the worn twins.
// Sizes are metres; S is the build scale for a host that builds the kit scaled
// down (Yuni builds at 0.34-1.0), and is 1 here.
//
// The texture and material are made on first use, so a target that never shows
// decay 5 pays nothing for them.

function wornMaterial(){if(MAT.whiteWorn)return MAT.whiteWorn;
 TEX.panelWorn=canvasTex(512,512,(g,w,h)=>{
  const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
   let v=228+(panTone(x,y)-.5)*13;
   v+=(fbm(x/70,y/70,1.7,3)-.5)*15;
   v+=(fbm(x/3,y/30,4.4,2)-.5)*7;
   const sd=panSeam(x,y),bd=panBolt(x,y);
   if(sd<1)v-=54; else if(sd<2)v-=25; else if(sd<4)v+=7;
   if(bd<1.7)v-=28; else if(bd<2.7)v+=11;
   const fy=y%PANH;
   let r=clamp((2.2-sd)*.42,0,1)*.75                                    // bleed out of the seam
        +clamp((3.4-bd)*.32,0,1)*.95                                    // halo round the fastener
        +clamp((fbm(x/34,y/22,9.1,3)-.47)*3.4,0,1)*.9                   // blotches of tarnish
        +clamp((fbm(x/6,y/60,2.7,2)-.45)*2.8,0,1)*clamp(fy/PANH*1.6,0,1)*.75;  // runs down each course
   r=clamp(r,0,1)*.42;                                                  // a WASH: the panel tone must still win
   const R0=176+(panTone(x,y)-.5)*30,G0=112,B0=84;
   d[i]=lerp(v,R0,r); d[i+1]=lerp(v-1,G0,r); d[i+2]=lerp(v-7,B0,r); d[i+3]=255;}
  g.putImageData(id,0,0);});
 // Yuni tinted every worn white part by (0.90, 0.87, 0.81); here the tint is the material colour.
 MAT.whiteWorn=new THREE.MeshStandardMaterial({map:TEX.panelWorn,roughnessMap:TEX.panelRM,metalnessMap:TEX.panelRM,
  color:new THREE.Color(.90,.87,.81),metalness:1,roughness:1,side:DS});
 return MAT.whiteWorn;}

// Planting on a worn structure, by builder key: only the tall towers (Yuni's table).
const WORN_PLANTS={skyA:.6,skyB:.6,skyD:.6,skyH:.6};

// How many of each kit item exist now. Take it just before the builder runs.
function wornLens(){const o={};for(const n of KIT.order)o[n]=KIT.items[n].length;return o;}

// How far a streak may run before it is hanging in mid-air. A coarse floor grid of the structure's own meshes:
// under a cantilevered ward tower the floor is the tower's own underside, under a tower shell it is the ground.
function wornFloorGrid(G,bb){const N=28,x0=bb.min.x,z0=bb.min.z,dx=(bb.max.x-x0)/N||1,dz=(bb.max.z-z0)/N||1;
 const g=new Float32Array(N*N).fill(1e9),b=new THREE.Box3();
 G.updateMatrixWorld(true);
 G.traverse(o=>{if(!o.isMesh||!o.geometry)return;const gm=o.geometry;if(!gm.boundingBox)gm.computeBoundingBox();
  if(!gm.boundingBox||!isFinite(gm.boundingBox.min.x))return;b.copy(gm.boundingBox).applyMatrix4(o.matrixWorld);
  const i0=clamp(Math.floor((b.min.x-x0)/dx),0,N-1),i1=clamp(Math.floor((b.max.x-x0)/dx),0,N-1);
  const j0=clamp(Math.floor((b.min.z-z0)/dz),0,N-1),j1=clamp(Math.floor((b.max.z-z0)/dz),0,N-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*N+i;if(b.min.y<g[k])g[k]=b.min.y;}});
 return (x,z)=>{const i=clamp(Math.floor((x-x0)/dx),0,N-1),j=clamp(Math.floor((z-z0)/dz),0,N-1);
  const v=g[j*N+i];return v>1e8?bb.min.y:v;};}

// THE SURFACE TABLE. Where the structure's skin actually is, as a distance from the axis, per compass sector and
// per height band, read off the structure's own wall faces. A streak is laid ON that surface: each segment is pushed
// out to the distance for its own band, so it follows a battered, fluted or stepped shell instead of standing off it
// as a flat card, and a band with no surface in it ends the streak.
function wornSurfTable(G,bb){
 const NS=24, y0=bb.min.y, H=Math.max(1e-3,bb.max.y-y0), NB=Math.min(72,Math.max(4,Math.round(H/2.2))), bh=H/NB;
 const dd=new Float32Array(NS*NB), has=new Uint8Array(NS*NB), dirs=[];
 for(let k=0;k<NS;k++){const a=(k+.5)/NS*TAU-Math.PI;dirs.push([Math.cos(a),Math.sin(a)]);}
 const sect=(nx,nz)=>{const L=Math.hypot(nx,nz);if(!(L>1e-6))return -1;
  return ((Math.floor((Math.atan2(nz/L,nx/L)+Math.PI)/TAU*NS)%NS)+NS)%NS;};
 for(const f of faceSamples(G,2200,0,.5)){const k=sect(f.n[0],f.n[2]); if(k<0)continue;
  const j=clamp(Math.floor((f.p[1]-y0)/bh),0,NB-1), i=k*NB+j, v=f.p[0]*dirs[k][0]+f.p[2]*dirs[k][1];
  if(!has[i]||v>dd[i]){dd[i]=v;has[i]=1;}}
 return { NB:NB, bh:bh, dirs:dirs, sect:sect,
  band:y=>clamp(Math.floor((y-y0)/bh),0,NB-1),
  at:(k,j)=>has[k*NB+j]?dd[k*NB+j]:null };}

// One streak, cut into segments. The first sits where the sample is, on the surface; each one below follows the
// shell's taper, read off the table as a change from the starting band. It may only ever move INWARD: a card inside
// the fabric is invisible, a card outside it is the stuck-on-card defect. A band with no surface ends the run.
function wornRun(T,low,K,p,nx,nz,L,w,col,off,jump){
 const k=T.sect(nx,nz); if(k<0) return 0; const dir=T.dirs[k], q=qFacing([dir[0],0,dir[1]]);
 const perp=p[0]*dir[0]+p[2]*dir[1], tx=p[0]-perp*dir[0], tz=p[2]-perp*dir[1];
 const j0=T.band(p[1]); let dPrev=T.at(k,j0); const d0=dPrev;
 const seg=Math.max(0.8*K,Math.min(2.5*K,L)); let y=p[1], left=L, laid=0, miss=0;
 w=Math.min(w,1.2*K);
 while(left>0.35*K){
  const h=Math.min(seg,left), yc=y-h/2, j=T.band(yc), d=T.at(k,j);
  if(d==null){ if(!laid&&miss<3){miss++;y-=h;left-=h;continue;} break; }            // under an overhang: find the wall, then stop at its foot
  if(dPrev!=null && Math.abs(d-dPrev)>(jump||0.6)*K) break;                          // the shell steps in or out here: the run ends at that edge
  const dd=perp+((d0==null)?0:Math.min(0,d-d0));                                     // follow the batter inward, never outward
  dPrev=d;
  const px=tx+(dd+(off==null?0.03:off)*K)*dir[0], pz=tz+(dd+(off==null?0.03:off)*K)*dir[1];
  if(yc-h/2 < low(px,pz)-0.25*K) break;
  kput('stain',[px,yc,pz],q,[w,h*1.04,1],col); laid++; y-=h; left-=h; }
 return laid;}

const wornRustC=()=>new THREE.Color(rr(.90,.985),rr(.74,.90),rr(.66,.82));

// RUST. Staining is the cheapest thing that makes a building old, so it is used hard: a rust-coloured multiply
// streak under every ledge, sill and ring, long runs down the tall shells, and flush rusted plates where the white
// skin has gone. `off` is the builder's world offset, so the parts it placed (world space) can be read locally.
function wornRustPass(G,S,lens0,off){
 const K=1/S, bb=new THREE.Box3().setFromObject(G); if(!isFinite(bb.min.x))return;
 const sz=clamp(bb.max.distanceTo(bb.min)*S,18,460), tall=(bb.max.y-bb.min.y)*S;
 const cx=(bb.min.x+bb.max.x)/2, cz=(bb.min.z+bb.max.z)/2;
 const n=Math.round(clamp(sz*2.6,70,950)), low=wornFloorGrid(G,bb), T=wornSurfTable(G,bb);
 // 1. every flat edge bleeds. ledgePoints keeps the outer band of the up-facing faces, which is where the water goes.
 for(const f of ledgePoints(G,n,.8)){const dx=f.p[0]-cx, dz=f.p[2]-cz, L0=Math.hypot(dx,dz); if(!(L0>1e-3))continue;
  wornRun(T,low,K,f.p,dx/L0,dz/L0, rr(3,18)*K, rr(.5,1.2)*K, wornRustC());}
 // 2. long runs down the walls themselves: this is what reads at 300 m on a tower
 for(const f of sideFaces(G,Math.round(Math.max(n*.35,tall*1.5)))){
  const c=wornRustC(), L=rr(5,Math.max(12,tall*.55))*K; if(L>14*K) c.multiplyScalar(.94);
  wornRun(T,low,K,f.p,f.n[0],f.n[2], L, rr(.35,1.1)*K, c, null, 2.5);}   // a long run rides over a band or a rib
 // 3. patches where the white skin has gone and the rusted substrate shows through, laid flat on the skin
 for(const f of sideFaces(G,Math.round(clamp(sz*.35,8,110)))){if(rng()<.5)continue;
  const k=T.sect(f.n[0],f.n[2]); if(k<0)continue; const dir=T.dirs[k];
  const h=rr(1.0,3.0)*K;                                                             // the sample is already ON the skin: stay there
  const px=f.p[0]+dir[0]*.025*K, pz=f.p[2]+dir[1]*.025*K;
  let y=f.p[1]; const fl=low(px,pz); if(y-h/2<fl) y=fl+h/2; if(y+h/2>bb.max.y) y=bb.max.y-h/2;
  if(T.at(k,T.band(y-h/2))==null||T.at(k,T.band(y+h/2))==null) continue;            // keep it inside the panel it is on
  kput('patchPlate',[px,y,pz],qFacing([dir[0],0,dir[1]]).multiply(qEuler(0,0,rr(-.3,.3))),[rr(1.0,2.4)*K,h,1],null);}
 // 4. sills, rings and fastener rows: a streak under every one the builder just placed
 const ox=off?off[0]:0, oy=off?off[1]:0, oz=off?off[2]:0;
 if(lens0)for(const nm of ['winI','winD','winBigI','winBigD','winSmI','winSmD','ovalI','ovalD','ringW','ringR','slab','cell','mullW','colW'])
  {const arr=KIT.items[nm]; if(!arr)continue; const i0=lens0[nm]||0; const step=(nm==='slab'||nm==='mullW'||nm==='colW')?4:2;
   for(let i=i0;i<arr.length;i+=step){const it=arr[i];if(rng()<.45)continue;
    const p=[it.p[0]-ox,it.p[1]-oy,it.p[2]-oz];
    const q=it.q?it.q.clone():new THREE.Quaternion(), nr=new THREE.Vector3(0,0,1).applyQuaternion(q);
    if(Math.abs(nr.y)>.7){nr.set(p[0]-cx,0,p[2]-cz).normalize();}                 // a ring or a slab: run it off the rim
    wornRun(T,low,K,p,nr.x,nr.z, rr(2.5,11)*K, rr(.4,1.1)*K, wornRustC());}}}

// WEATHER. Water staining under every ledge, and moss and vine only when `plants` > 0.
function wornWeatherPass(G,S,plants){
 const K=1/S, bb=new THREE.Box3().setFromObject(G); if(!isFinite(bb.min.x))return;
 const sz=clamp(bb.max.distanceTo(bb.min)*S,18,420);
 const n=Math.round(clamp(sz*1.7,40,420));
 const low=wornFloorGrid(G,bb), T=wornSurfTable(G,bb), cx=(bb.min.x+bb.max.x)/2, cz=(bb.min.z+bb.max.z)/2;
 for(const f of ledgePoints(G,Math.round(n*.45),.6)){const dx=f.p[0]-cx, dz=f.p[2]-cz, L0=Math.hypot(dx,dz); if(!(L0>1e-3))continue;
  wornRun(T,low,K,f.p,dx/L0,dz/L0, rr(5,17)*K, rr(.6,1.2)*K, null);}
 if(!plants)return;                                            // no planting on a worn structure unless asked
 for(const f of upFaces(G,Math.round(n*.22*plants),.72)){const s=rr(.3,1.2)*K;
  kput('moss',[f.p[0],f.p[1]+s*.15,f.p[2]],qEuler(0,rng()*TAU,0),[s*rr(.8,1.5),s*rr(.2,.4),s*rr(.8,1.5)],new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.06,.13)));}
 for(const f of ledgePoints(G,Math.round(n*.11*plants),.28)){const L=Math.max(1*K,Math.min(rr(2,6)*K,f.p[1]-low(f.p[0],f.p[2])+.5*K));
  kput('vine',[f.p[0],f.p[1],f.p[2]],qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),[rr(.6,1.2)*K,L,rr(.6,1.2)*K],null);}}

// The whole variant, on the group a decay-0 builder returned. The passes read the structure in its own frame, so
// the group is stood at the origin while they run; KOFF must hold its world offset so their kput()s land on it.
// S is the build scale (1 in this kit).
function wornPass(G,lens0,plants,S){S=S||1;const W=wornMaterial();
 // rust and weather first: the rust pass reads the sills and rings the builder placed, before they move
 const pos=G.position.clone(),off=KOFF.slice();G.position.set(0,0,0);G.updateMatrixWorld(true);
 try{wornRustPass(G,S,lens0,off);wornWeatherPass(G,S,plants||0);}
 finally{G.position.copy(pos);G.updateMatrixWorld(true);}
 // then the skin: white shells and white instanced parts go worn
 G.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.material===MAT.white)o.material=W;});
 for(const n of KIT.order.slice()){const def=KIT.defs[n];if(def.mat!==MAT.white)continue;
  const arr=KIT.items[n],i0=lens0[n]||0;if(arr.length<=i0)continue;
  const tw=n+'~worn';if(!KIT.defs[tw])kdef(tw,def.geo,W);
  const tgt=KIT.items[tw];for(let i=i0;i<arr.length;i++)tgt.push(arr[i]);arr.length=i0;}}
