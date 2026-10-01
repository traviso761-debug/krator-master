/* ------------------------------------------------------------------ kit tail (hand-written; tools/anc_kit_tail.js) */
/* THE REPAIRED PASS at Yuni scale: the kit's salvage patches (corrugated sheet, plate, boards, tarpaulin) riveted onto
   the near-vertical faces. Sizes are real metres (divided by the build scale). The accretion that stands on flat
   surfaces is done in the ENGINE's kit by the asset's dressing, so it matches the town. */
function repairPassY(G,S){
 const bb=new THREE.Box3().setFromObject(G); if(!isFinite(bb.min.x))return;
 const sz=clamp(bb.max.distanceTo(bb.min)*S,18,400), K=1/S;
 const nSide=Math.round(clamp(sz*.9,16,260));
 const PATCH=['patchSheet','patchPlate','patchBoard','patchTarp'];
 for(const f of sideFaces(G,nSide)){
  if(rng()<.3)continue;
  const n=f.n,w=rr(1.6,4.5)*K,h=rr(1.4,3.4)*K;
  const q=qFacing(n).multiply(qEuler(0,0,rr(-.2,.2)));
  kput(PATCH[(rng()*4)|0],[f.p[0]+n[0]*.2*K,f.p[1]+n[1]*.2*K,f.p[2]+n[2]*.2*K],q,[w,h,1],null);}
 /* roof-top water butts and planters, sparse */
 for(const f of upFaces(G,Math.round(sz*.18),.93)){const p=f.p,r=rng();
  if(r<.4)kput('waterButt',[p[0],p[1]+.8*K,p[2]],null,[.7*K,1.6*K,.7*K],null);
  else if(r<.8){kput('planter',[p[0],p[1]+.25*K,p[2]],qEuler(0,rng()*TAU,0),[rr(1.2,2.6)*K,.5*K,rr(.7,1.2)*K],null);
   for(let k=0;k<2;k++)kput('moss',[p[0]+rr(-.8,.8)*K,p[1]+.75*K,p[2]+rr(-.4,.4)*K],null,[.6*K,.45*K,.6*K],new THREE.Color().setHSL(rr(.26,.34),.55,.28));}
  else kput('plank',[p[0],p[1]+.1*K,p[2]],qEuler(0,rng()*TAU,0),[rr(2,4)*K,.15*K,rr(.4,.9)*K],null);}}
function buildGreatSilo(scene,gx,gz,d){reseed(9205+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);factorySilo(G,d,SHELL(d));if(d>0)rubbleRing(110,6,-60,10,44,30,2);KOFF=[0,0,0];return G;}

/* ================= THE WORN SKIN =================
   White metal that nobody has repainted for a thousand years: the same panel grid, with rust bleeding out of the
   recessed seams and haloing every fastener, low-frequency blotches over it, and long runs below each panel course.
   The sheen has to survive — this is a DIRTY WHITE building, so the rust is a wash over the panel tone, not a
   replacement for it. Used as the shell material by SHELL() whenever WORN is set. */
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
  let r=clamp((2.2-sd)*.42,0,1)*.75                                   // bleed out of the seam
       +clamp((3.4-bd)*.32,0,1)*.95                                   // halo round the fastener
       +clamp((fbm(x/34,y/22,9.1,3)-.47)*3.4,0,1)*.9                  // blotches of tarnish
       +clamp((fbm(x/6,y/60,2.7,2)-.45)*2.8,0,1)*clamp(fy/PANH*1.6,0,1)*.75;  // runs down each course
  r=clamp(r,0,1)*.42;                                                 // a WASH: the panel tone must still win
  const R0=176+(panTone(x,y)-.5)*30,G0=112,B0=84;
  d[i]=lerp(v,R0,r); d[i+1]=lerp(v-1,G0,r); d[i+2]=lerp(v-7,B0,r); d[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.whiteWorn=new THREE.MeshStandardMaterial({map:TEX.panelWorn,roughnessMap:TEX.panelRM,metalnessMap:TEX.panelRM,color:0xffffff,metalness:1,roughness:1,side:DS});

/* ================= RUST PASS (the WORN variant) =================
   Staining is the cheapest thing that makes a building old, so it is used hard: a rust-coloured multiply streak
   under every ledge, every window sill and every ring, long runs down the tall shells, and a scatter of flush
   MAT.rust panels where the white skin has gone entirely. All of it goes through the kit's own 'stain' item, tinted
   per instance, so the whole pass costs no extra draw call. Sizes are metres (divided by the build scale). */
/* How far a streak may run before it is hanging in mid-air. A coarse floor grid of the structure's own meshes:
   under a cantilevered ward tower the floor is the tower's own underside, under a tower shell it is the ground. */
function floorGrid(G,bb){const N=28,x0=bb.min.x,z0=bb.min.z,dx=(bb.max.x-x0)/N||1,dz=(bb.max.z-z0)/N||1;
 const g=new Float32Array(N*N).fill(1e9),b=new THREE.Box3();
 G.updateMatrixWorld(true);
 G.traverse(o=>{if(!o.isMesh||!o.geometry)return;const gm=o.geometry;if(!gm.boundingBox)gm.computeBoundingBox();
  if(!gm.boundingBox||!isFinite(gm.boundingBox.min.x))return;b.copy(gm.boundingBox).applyMatrix4(o.matrixWorld);
  const i0=clamp(Math.floor((b.min.x-x0)/dx),0,N-1),i1=clamp(Math.floor((b.max.x-x0)/dx),0,N-1);
  const j0=clamp(Math.floor((b.min.z-z0)/dz),0,N-1),j1=clamp(Math.floor((b.max.z-z0)/dz),0,N-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*N+i;if(b.min.y<g[k])g[k]=b.min.y;}});
 return (x,z)=>{const i=clamp(Math.floor((x-x0)/dx),0,N-1),j=clamp(Math.floor((z-z0)/dz),0,N-1);
  const v=g[j*N+i];return v>1e8?bb.min.y:v;};}
/* THE SURFACE TABLE. Where the structure's skin actually is, as a distance from the axis, per compass sector and
   per height band, read off the structure's own wall faces. A streak is then laid ON that surface: each of its
   segments is pushed out to the distance for its own band, so it follows a battered, fluted or stepped shell
   instead of standing off it as a flat card — and a band with no surface in it ends the streak, so nothing runs
   down past the bottom edge of the thing it bleeds from. */
function surfTable(G,bb){
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

/* One streak, cut into segments. The first segment sits exactly where the sample is — on the surface — and each
   one below follows the shell's own taper, read off the table as a RELATIVE change from the starting band. It may
   only ever move INWARD: a card that ends up inside the fabric is invisible, a card that ends up outside it is the
   stuck-on-card defect. A band with no surface in it ends the run, so nothing hangs past the bottom edge. */
function rustRun(T,low,K,p,nx,nz,L,w,col,off,jump){
 const k=T.sect(nx,nz); if(k<0) return 0; const dir=T.dirs[k], q=qFacing([dir[0],0,dir[1]]);
 const perp=p[0]*dir[0]+p[2]*dir[1], tx=p[0]-perp*dir[0], tz=p[2]-perp*dir[1];
 const j0=T.band(p[1]); let dPrev=T.at(k,j0); const d0=dPrev;
 const seg=Math.max(0.8*K,Math.min(2.5*K,L)); let y=p[1], left=L, laid=0, miss=0;
 w=Math.min(w,1.2*K);
 while(left>0.35*K){
  const h=Math.min(seg,left), yc=y-h/2, j=T.band(yc), d=T.at(k,j);
  if(d==null){ if(!laid&&miss<3){miss++;y-=h;left-=h;continue;} break; }            /* under an overhang: find the wall, then stop at its foot */
  if(dPrev!=null && Math.abs(d-dPrev)>(jump||0.6)*K) break;                          /* the shell steps in or out here: the run ends at that edge */
  const dd=perp+((d0==null)?0:Math.min(0,d-d0));                                     /* follow the batter inward, never outward */
  dPrev=d;
  const px=tx+(dd+(off==null?0.03:off)*K)*dir[0], pz=tz+(dd+(off==null?0.03:off)*K)*dir[1];
  if(yc-h/2 < low(px,pz)-0.25*K) break;
  kput('stain',[px,yc,pz],q,[w,h*1.04,1],col); laid++; y-=h; left-=h; }
 return laid;}

const RUSTC=()=>new THREE.Color(rr(.90,.985),rr(.74,.90),rr(.66,.82));
function rustPass(G,S,lens0){
 const K=1/S, bb=new THREE.Box3().setFromObject(G); if(!isFinite(bb.min.x))return;
 const sz=clamp(bb.max.distanceTo(bb.min)*S,18,460), tall=(bb.max.y-bb.min.y)*S;
 const cx=(bb.min.x+bb.max.x)/2, cz=(bb.min.z+bb.max.z)/2;
 const n=Math.round(clamp(sz*2.6,70,950)), low=floorGrid(G,bb), T=surfTable(G,bb);
 // 1. every flat edge bleeds. ledgePoints keeps the outer band of the up-facing faces, which is where the water goes.
 for(const f of ledgePoints(G,n,.8)){const dx=f.p[0]-cx, dz=f.p[2]-cz, L0=Math.hypot(dx,dz); if(!(L0>1e-3))continue;
  rustRun(T,low,K,f.p,dx/L0,dz/L0, rr(3,18)*K, rr(.5,1.2)*K, RUSTC());}
 // 2. long runs down the walls themselves — this is what reads at 300 m on a tower
 for(const f of sideFaces(G,Math.round(Math.max(n*.35,tall*1.5)))){
  const c=RUSTC(), L=rr(5,Math.max(12,tall*.55))*K; if(L>14*K) c.multiplyScalar(.94);
  rustRun(T,low,K,f.p,f.n[0],f.n[2], L, rr(.35,1.1)*K, c, null, 2.5);}   /* a long run rides over a band or a rib */
 // 3. patches where the white skin has gone and the rusted substrate shows through, laid flat on the skin
 for(const f of sideFaces(G,Math.round(clamp(sz*.35,8,110)))){if(rng()<.5)continue;
  const k=T.sect(f.n[0],f.n[2]); if(k<0)continue; const dir=T.dirs[k];
  const h=rr(1.0,3.0)*K;                                                             /* the sample is already ON the skin: stay there */
  const px=f.p[0]+dir[0]*.025*K, pz=f.p[2]+dir[1]*.025*K;
  let y=f.p[1]; const fl=low(px,pz); if(y-h/2<fl) y=fl+h/2; if(y+h/2>bb.max.y) y=bb.max.y-h/2;
  if(T.at(k,T.band(y-h/2))==null||T.at(k,T.band(y+h/2))==null) continue;            /* keep it inside the panel it is on */
  kput('patchPlate',[px,y,pz],qFacing([dir[0],0,dir[1]]).multiply(qEuler(0,0,rr(-.3,.3))),[rr(1.0,2.4)*K,h,1],null);}
 // 4. sills, rings and fastener rows: a streak under every one the builder just placed
 if(lens0)for(const nm of ['winI','winD','winBigI','winBigD','winSmI','winSmD','ovalI','ovalD','ringW','ringR','slab','cell','mullW','colW'])
  {const arr=KIT.items[nm]; if(!arr)continue; const i0=lens0[nm]||0; const step=(nm==='slab'||nm==='mullW'||nm==='colW')?4:2;
   for(let i=i0;i<arr.length;i+=step){const it=arr[i];if(rng()<.45)continue;
    const q=it.q?it.q.clone():new THREE.Quaternion(), nr=new THREE.Vector3(0,0,1).applyQuaternion(q);
    if(Math.abs(nr.y)>.7){nr.set(it.p[0]-cx,0,it.p[2]-cz).normalize();}       /* a ring or a slab: run it off the rim */
    rustRun(T,low,K,it.p,nr.x,nr.z, rr(2.5,11)*K, rr(.4,1.1)*K, RUSTC());}}}

/* ================= WEATHERING (the WORN variant) =================
   The structure is whole — built from the intact path with HOLES = 0 — so nothing here may remove fabric.
   All it does is put a thousand years of weather on it: water staining under every ledge, and — only where the
   caller asks for it — a trace of moss and vine. A worn building has NOT been colonised: nothing grows on it
   except on the tall towers, where a few tufts on the high ledges read well. Sizes are divided by the build
   scale, so a stain is metres, not kit units. */
function weatherPass(G,S,plants){
 const K=1/S, bb=new THREE.Box3().setFromObject(G); if(!isFinite(bb.min.x))return;
 const sz=clamp(bb.max.distanceTo(bb.min)*S,18,420);
 const n=Math.round(clamp(sz*1.7,40,420));
 const low2=floorGrid(G,bb), T2=surfTable(G,bb), cx2=(bb.min.x+bb.max.x)/2, cz2=(bb.min.z+bb.max.z)/2;
 for(const f of ledgePoints(G,Math.round(n*.45),.6)){const dx=f.p[0]-cx2, dz=f.p[2]-cz2, L0=Math.hypot(dx,dz); if(!(L0>1e-3))continue;
  rustRun(T2,low2,K,f.p,dx/L0,dz/L0, rr(5,17)*K, rr(.6,1.2)*K, null);}
 if(!plants)return;                                            // no planting on a worn structure unless asked
 for(const f of upFaces(G,Math.round(n*.22*plants),.72)){const s=rr(.3,1.2)*K;
  kput('moss',[f.p[0],f.p[1]+s*.15,f.p[2]],qEuler(0,rng()*TAU,0),[s*rr(.8,1.5),s*rr(.2,.4),s*rr(.8,1.5)],new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.06,.13)));}
 for(const f of ledgePoints(G,Math.round(n*.11*plants),.28)){const L=Math.max(1*K,Math.min(rr(2,6)*K,f.p[1]-low2(f.p[0],f.p[2])+.5*K));
  kput('vine',[f.p[0],f.p[1],f.p[2]],qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),[rr(.6,1.2)*K,L,rr(.6,1.2)*K],null);}}

/* ================= ACADEMIC QUADRANGLE — "the Cloisters" =================
   Written for Yuni (not in the source kit): a closed court ringed by terraced ranges, a deep parabolic cloister walk
   on all four sides, a lecture drum and two stair towers breaking the skyline, a monumental arch on the +z side.
   Built in METRES (placed at scale 1), 120 x 100 m overall, court 84 x 64.        */
kdef('qArchW',arcShape(5.0,6.2,.85,3.4),MAT.white); kdef('qArchR',arcShape(5.0,6.2,.85,3.4),MAT.rust);
kdef('qRibW',arcShape(17,5.6,.7,.9),MAT.white);     kdef('qRibR',arcShape(17,5.6,.7,.9),MAT.rust);
kdef('qGateW',arcShape(12,11.5,1.7,4.6),MAT.white); kdef('qGateR',arcShape(12,11.5,1.7,4.6),MAT.rust);
function buildQuad(scene,gx,gz,d){reseed(9600+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const skin=SHELL(d), CB=BOXC(d), QA=d>0?'qArchR':'qArchW', QR=d>0?'qRibR':'qRibW', PL=PLATE(d), CO=d>0?'colR':'colW';
 const HX=60,HZ=50,CX=42,CZ=32,SH=4.0,WALK=3.4;      // outer half-extents, court half-extents, storey, cloister depth
 // court floor, with a shallow lobed basin at its centre
 kput(CB,[0,.15,0],null,[CX*2,.3,CZ*2],null);
 kput(d>0?'slabCR':'slabC',[0,.5,-2],null,[9,.8,9],null); kput(d>0?'slabCR':'slabC',[0,.95,-2],null,[6.6,.5,6.6],new THREE.Color(d>0?0x4a4a44:0x9fb0b4));
 // --- the four ranges. side = [nx,nz] outward normal; L = half length along the range; nf = storeys; back = terraced
 [[0,1,HX,2,41,false],[0,-1,HX,4,-41,true],[-1,0,HZ-18,3,-51,false],[1,0,HZ-18,3,51,false]].forEach(function(R,ri){
  const nx=R[0],nz=R[1],L=R[2],nf=R[3],c=R[4],back=R[5];
  const ax=nz?1:0, az=nz?0:1;                                   // along-range axis
  const q=qEuler(0,nz?0:Math.PI/2,0);                           // box yaw for this range
  const cx0=nz?0:c, cz0=nz?c:0;                                 // range centre
  const gate=(nz>0);                                            // the +z range carries the monumental arch
  for(let f=0;f<nf;f++){const y=f*SH, st=back?f*2.2:0;          // st = setback away from the court on the back range
   const dep=18-st, cc=c-nx*st/2-nz*st/2;                       // this storey's depth and centre
   const cxf=nz?0:cc, czf=nz?cc:0;
   // the storey mass, hollowed on the court side at ground level to make the cloister walk
   const inset=(f===0)?WALK:0, dd=dep-inset, ccf=cc+ (nx?nx:nz)*inset/2;
   kput(CB,[nz?0:ccf, y+SH/2, nz?ccf:0],q,[L*2,SH-.35,dd],null);
   kput(PL,[nz?0:ccf, y+SH-.1, nz?ccf:0],q,[L*2+.6,.45,dd+.6],null);     // floor band, proud of the face
   // arched windows along the court face and the outer face
   const nw=Math.round(L/4.2);
   for(let k=0;k<nw;k++){ if(d>0&&rng()<.22) continue;
    const t=(k+.5)/nw*2-1, px=nz?t*L:ccf-(nx||0)*dd/2*0, pz=nz?ccf:t*L;
    const cfx=nz? t*L : (cc-nx*dd/2-.1), cfz=nz? (cc-nz*dd/2-.1) : t*L;   // court-side face
    if(!(gate&&f===0&&Math.abs(t*L)<8))
      kput(d>0?'winD':'winI',[cfx,y+1.9,cfz],qFacing([-nx,0,-nz]),[.95,.95,1],null);
    if(f>0||!gate){const ofx=nz? t*L : (cc+nx*dep/2+.1), ofz=nz? (cc+nz*dep/2+.1) : t*L;
      if(!(d>0&&rng()<.25)) kput(d>0?'winSmD':'winSmI',[ofx,y+2.2,ofz],qFacing([nx,0,nz]),[1.5,1.5,1],null);}}
   // glass gallery behind the court face on the first floor (survives while the structure is whole)
   if(f===1&&d===0){const gx2=nz?0:(cc-nx*dep/2-.05), gz2=nz?(cc-nz*dep/2-.05):0;
    kput('pane',[gx2,y+2.6,gz2],q,[L*1.9,2.6,1],null);}
   // terrace planting on the back range's setbacks
   if(back&&f>0)for(let k=0;k<Math.round(L/7);k++){const t=(k+.5)/Math.round(L/7)*2-1;
    kput('hedge',[t*L,y+.55,cc+nz*(dep/2-1.2)],q,[5,.9,1.8],new THREE.Color().setHSL(.29,.5,d>0?.14:.22));}}
  // roof: slab, parapet, and a row of parabolic ribs (a pergola) on the side ranges
  const ry=nf*SH, dep=18-(back?(nf-1)*2.2:0), cc=c-(nx+nz)*((back?(nf-1)*2.2:0))/2;
  kput(CB,[nz?0:cc, ry+.25, nz?cc:0],q,[L*2+1,.5,dep+1],null);
  for(let s2=-1;s2<=1;s2+=2) kput(PL,[nz?0:cc+(nx?0:0), ry+1.1, nz?cc:0].map(function(v,i2){ return i2===0&&!nz? cc+s2*dep/2 : (i2===2&&nz? cc+s2*dep/2 : v); }),q,[nz?L*2+1:.5, 1.2, nz?.5:L*2+1],null);
  if(!nz)for(let k=0;k<Math.round(L/6);k++){const t=(k+.5)/Math.round(L/6)*2-1; if(d>0&&rng()<.3)continue;
   kput(QR,[cc,ry+.5,t*L],qFacing([nx,0,nz]),[1,1,1],null);}
  // the cloister walk: parabolic arcade standing in front of the ground storey, with its own roof slab
  const wy=cc-(nx+nz)*(18/2-WALK)*0, wc=c-(nx+nz)*(18/2)+(nx+nz)*(WALK/2);   // walk centre line
  const wcx=nz?0:wc, wcz=nz?wc:0;
  const na=Math.round(L/2.6);
  for(let k=0;k<na;k++){const t=(k+.5)/na*2-1; if(gate&&Math.abs(t*L)<8.5) continue; if(d>0&&rng()<.16) continue;
   kput(QA,[nz?t*L:wc-(nx)*0, .0, nz?wc:t*L],qFacing([nz?0:1,0,nz?1:0]),[1,1,1],null);}
  kput(CB,[wcx,6.3,wcz],q,[L*2,.55,WALK+1.2],null);
  if(d>0&&ri<2)rubbleRing(nz?L*.7:c, .3, nz?c:L*.7, 2, 9, 14, 1.1);
  // the monumental gate: the +z range bridges over a 12 m parabolic arch
  if(gate){ kput(d>0?'qGateR':'qGateW',[0,0,c],qFacing([0,0,1]),[1,1,1],null);
   kput('archOpen',[0,0,c-2.4],qFacing([0,0,1]),[1.5,1.2,1],null);
   for(let s2=-1;s2<=1;s2+=2)kput(CO,[s2*8.5,0,c],null,[1.5,12,1.5],null); }});
 // --- the lecture drum: a fluted paraboloid in the back-left of the court, capped by a shallow dome
 {const dx=-26,dz=-20,R=10.5,H=23;
  mesh(lathe({rFn:y=>R*(1-.10*Math.pow(y/H,2)),H:H,flutes:8,amp:.09,sharp:2,nu:56,nv:16,hole:holeFn(d*.7,4401,null,1.4),seed:4401}),skin,G,dx,0,dz);
  mesh(lathe({rFn:y=>R*.9,H:H,nu:24,nv:2}),MAT.dark,G,dx,0,dz);
  mesh(lathe({rFn:y=>(R+.8)*Math.sqrt(clamp(1-Math.pow(y/6.4,2),0,1)),H:6.4,nu:48,nv:10}),skin,G,dx,H,dz);
  kput(d>0?'slabCR':'slabC',[dx,H-.3,dz],null,[R+1.1,.6,R+1.1],null);
  for(let k=0;k<12;k++){const th=(k+.4)/12*TAU; if(d>0&&rng()<.25)continue;
   kput(d>0?'winD':'winI',[dx+R*Math.cos(th)*1.01,4.4,dz+R*Math.sin(th)*1.01],qFacing([Math.cos(th),0,Math.sin(th)]),[1.1,1.3,1],null);
   if(d===0)kput('pane',[dx+R*Math.cos(th)*1.02,11.5,dz+R*Math.sin(th)*1.02],qFacing([Math.cos(th),0,Math.sin(th)]),[4.6,5,1],null);}
  kput('archOpen',[dx,0,dz+R-.2],qFacing([0,0,1]),[.75,.62,1],null);
  stripRing(dx,H+.4,dz,R*.8,d,20); if(d>0){mossOnRing(dx,H+.2,dz,R,14,1.4);vinesOnRing(dx,H,dz,R,8,9);} }
 // --- two stair towers at the court's +z corners
 [[-36,25],[36,25]].forEach(function(p,i){const R=4.6,H=d>0&&i===1?19:31;
  mesh(lathe({rFn:y=>R*(1-.22*Math.pow(y/H,1.6)),H:H,cut:d>0&&i===1?H:null,jag:d>0&&i===1?1.6:0,flutes:6,amp:.12,sharp:2,nu:36,nv:20,hole:holeFn(d*.6,4410+i,null,1.2),seed:4410+i}),skin,G,p[0],0,p[1]);
  mesh(lathe({rFn:y=>R*.86,H:H,nu:18,nv:2}),MAT.dark,G,p[0],0,p[1]);
  for(let y=3;y<H-3;y+=3.4){const th=Math.PI*(i?.25:.75);
   kput(d>0?'winSmD':'winSmI',[p[0]+R*Math.cos(th),y,p[1]+R*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.6,1],null);}
  if(!(d>0&&i===1)){kput(d>0?'slabCR':'slabC',[p[0],H,p[1]],null,[R+1,.5,R+1],null);
   mesh(lathe({rFn:y=>(R*.8)*Math.sqrt(clamp(1-Math.pow(y/3.4,2),0,1)),H:3.4,nu:28,nv:6}),skin,G,p[0],H+.3,p[1]);
   if(d===0)kput('finial',[p[0],H+4.6,p[1]],null,[1.1,1.8,1.1],null);}
  else rubbleRing(p[0],0,p[1],3,11,16,1.2); });
 // --- weathering / ruin dressing read off the court ranges
 if(d>0){scatterMoss(0,.3,0,10,CX,60,1.1);rubbleRing(0,.3,0,CX-6,CX+14,40,1.4);}
 KOFF=[0,0,0];return G;}

/* ================= HONEYCOMB APARTMENTS, SHORT — a thick perimeter block =================
   The stubby sibling of Apartments B: the same Beksinski hexagonal cell lattice, but wrapped round a squircle
   plan 60 x 50 and only five storeys, with a real roof.  Metres, scale 1. */
function buildCombShort(scene,gx,gz,d){reseed(9620+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const skin=SHELL(d),RX=29,RZ=24,H=17.5,NF=5,SH=H/NF;
 const rad=th=>se(th,4.5);                                  /* squircle: flat-ish long faces, rounded corners */
 const pt=(th,r)=>[Math.cos(th)*RX*rad(th)*r, 0, Math.sin(th)*RZ*rad(th)*r];
 const hex=(u,v)=>{const cx=u*42,cy=v*9;const rowOff=(Math.floor(cy)%2)*.5;const fx=((cx+rowOff)%1)-.5,fy=(cy%1)-.5;
  return Math.abs(fx)<.33&&Math.abs(fy)<.35&&Math.abs(fx)+Math.abs(fy)*1.15<.54;};
 const dh=holeFn(d*.8,4500,null,1.4);
 const shellAt=(r,off)=>gridSurface((u,v)=>{const th=u*TAU,p=pt(th,r);return[p[0],off+v*(H-off),p[2]];},200,56,
   {uS:26,vS:9,hole:(u,v)=>hex(u,v)||(dh?dh(u*3,v*H):false)});
 const parts=[shellAt(1,2.6),shellAt(.80,2.6)];             /* outer and inner skin: a 5-6 m deep sandwich */
 parts.push(gridSurface((u,v)=>{const th=u*TAU,a=pt(th,.80),b=pt(th,1);return[lerp(a[0],b[0],v),H,lerp(a[2],b[2],v)];},110,3,{uS:20,vS:2}));   /* roof ring */
 for(let f=1;f<NF;f++){const y=f*SH;                        /* cell floors between the skins */
  parts.push(gridSurface((u,v)=>{const th=u*TAU,a=pt(th,.80),b=pt(th,1);return[lerp(a[0],b[0],v),y,lerp(a[2],b[2],v)];},80,2,
    {hole:d>0?(u,v)=>fbm(u*10,f,4510+f,2)<.2:null}));}
 parts.push(gridSurface((u,v)=>{const th=u*TAU,p=pt(th,.80);return[p[0],H+v*1.5,p[2]];},110,2,{uS:20,vS:1}));      /* parapet */
 meshMerged(parts,skin,G);
 mesh(gridSurface((u,v)=>{const th=u*TAU,p=pt(th,.78);return[p[0],2.6+v*(H-2.6),p[2]];},60,6,{}),MAT.dark,G);      /* dark core */
 mesh(gridSurface((u,v)=>{const th=u*TAU,p=pt(th,.80*v);return[p[0],H+1.1*(1-v*v),p[2]];},90,6,{uS:14,vS:6}),skin,G);   /* the roof proper: a cambered lid over the core */
 /* the open ground storey: parabolic arcade all round, court slab, lit cells behind the lattice */
 for(let k=0;k<30;k++){const th=(k+.5)/30*TAU,p=pt(th,.92);
  if(d>0&&rng()<.18)continue;
  kput(d>0?'colR':'colW',[p[0],0,p[2]],null,[1.5,2.7,1.5],null);}
 kput(d>0?'slabCR':'slabC',[0,1.4,0],null,[RX*.84,.5,RZ*.84],null);
 kput(d>0?'slabCR':'slabC',[0,2.75,0],null,[RX*1.06,.55,RZ*1.06],null);
 for(let f=0;f<NF;f++)for(let k=0;k<22;k++){if(rng()>.5)continue;const th=(k+.5)/22*TAU,p=pt(th,.88),y=2.9+f*SH+1.4;
  kput('cell',[p[0],y,p[2]],qFacing([Math.cos(th),0,Math.sin(th)]),[1.9,1.5,1],DEAD);}
 for(let k=0;k<14;k++){const th=(k+.5)/14*TAU,p=pt(th,1.0);                                    /* roof-edge finials */
  if(d>0&&rng()<.4)continue; kput(PLATE(d),[p[0]*.99,H+1.9,p[2]*.99],qEuler(0,-th,0),[1.4,1.1,1.4],null);}
 if(d>0){mossOnRing(0,H+1.3,0,RX*.9,26,1.3);vinesOnRing(0,H,0,RX*.95,14,10);rubbleRing(0,0,0,RX+2,RX+16,40,1.5);scatterMoss(0,0,0,RX,RX+20,40,1.2);}
 KOFF=[0,0,0];return G;}
const B={gsilo:buildGreatSilo,quad:buildQuad,combShort:buildCombShort,skyA:buildSkyA,skyB:buildSkyB,skyC:buildSkyC,mega:buildMega,fac:buildFactory,port:buildStarport,gov:buildGovernment,lib:buildLibrary,bunk:buildBunker,off:buildOffices,apt:buildApartments,amph:buildAmphitheater,fuel:buildFuelStation,radar:buildRadarTower,dish:buildDish,house:buildHouses,lab:buildLab,house2:buildHouses2,skyD:buildSkyD,skyE:buildSkyE,skyF:buildSkyF,arc:buildArc,robo:buildRobotics,campus:buildCampus,skyG:buildSkyG,skyH:buildSkyH,dc:buildDataCenter,police:buildPolice,hosp:buildHospital,hotel:buildHotel,dam:buildDam};
return { B:B, MAT:MAT, KIT:KIT, TSTAT:TSTAT, rust:rustPass,
  setWorn:function(w){WORN=!!w;}, setDish:function(k){DISHOK=!!k;}, setTight:function(t){LABTIGHT=!!t;},
  setTH:function(f){ANC_TH=f;}, setHoles:function(h){HOLES=h;}, setRSC:function(k){RSC=k;}, resetXF:function(){KXF=null;KOFF=[0,0,0];KSKIP=false;},
  setSeg:function(k,t,names,uvk){SEGK=k;KTHIN=t;KTN=0;KTNAMES=names||[];UVK=uvk||1;}, triOf:triOf, repair:repairPassY, weather:weatherPass };
})();
