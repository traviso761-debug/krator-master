// ================================================================= BIOME CORE — placement
// Where things go. Ported from the Hexahedron's forest rebuild (the forest is
// PLACEMENT, not plants) and Girder's keep-clear tests.

// SPECIES COME IN STANDS. A per-tree random draw mixes species so evenly the
// eye integrates them back into one colour; an fbm patch field a few hundred
// metres across picks a dominant species with a fraction off-pattern.
// fbm is bell-shaped (mean .5, sd ~.11): splitting its raw value n ways gave
// 1/27/53/20 % for four species. The value is stretched through the middle of
// the bell first so the n bands come out roughly even.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rngState,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
BIO.standAt=function(x,z,n,scale,seed){scale=scale==null?.0017:scale;const f=fbm(x*scale+31,z*scale-19,seed==null?9483:seed,2);
 const u=smooth(.30,.70,f);return clamp(Math.floor(u*n),0,n-1);};
BIO.stand=function(x,z,n,off,scale,seed){return rng()<(off==null?.26:off)?Math.floor(rng()*n):BIO.standAt(x,z,n,scale,seed);};

// THE CLIFF GATE (CORE-IMPROVEMENTS item 7; the owner's standing rule, 2026-10-05: no trees on cliffs). Nothing roots on a
// sheer or layered rock face unless it belongs there. cliff(x, z) is 0 on soil and gentle ground and 1 on a steep face that
// shows rock: smooth(slope) * smooth(rock), slope the ground's rise over run (BIO.placeH by central differences over BIO.CLIFF.e
// metres, or the host's own slope(x, z)) and rock the host's 'rock' field (a host with none: slope alone). A host with its own
// rule hands cliff(x, z) -> 0..1 in. BIO.cliffW = 1 - cliff, and 0 from cliff >= .99, so a full face never takes a root.
// The grid applies it to every pass: always in the cell form; in the numeric form when the page asks (BIO.init({cliffGate:
// true})) or the pass does (opt.cliff 'gate'). opt.cliff true: the pass grows ON faces, never gated. No random draws.
BIO.CLIFF={slope:[1,1.5],rock:[.3,.6],e:2,full:.99};
BIO.slopeAt=function(x,z){const h=BIO.host;if(h&&h.slope)return h.slope(x,z);const e=BIO.CLIFF.e;
 return Math.hypot(BIO.placeH(x+e,z)-BIO.placeH(x-e,z),BIO.placeH(x,z+e)-BIO.placeH(x,z-e))/(2*e);};
BIO.cliff=function(x,z){const h=BIO.host;if(h&&h.cliff)return clamp(h.cliff(x,z),0,1);const C=BIO.CLIFF;
 const s=smooth(C.slope[0],C.slope[1],BIO.slopeAt(x,z));if(s<=0)return 0;
 return s*(BIO.hasField('rock')?smooth(C.rock[0],C.rock[1],BIO.field('rock',x,z)):1);};
BIO.cliffW=function(x,z){const c=BIO.cliff(x,z);return c>=BIO.CLIFF.full?0:1-c;};
function cliffOld(opt){return opt.cliff!==true&&(opt.cliff==='gate'||!!(BIO.host&&BIO.host.cliffGate));}
// THE CHECK (verify's side): every instanced item ROOTED on the ground (its origin within `near` metres of terrainH) that
// stands where cliff >= BIO.CLIFF.full, unless the item belongs on faces (BIO.def opt.cliff, or BIO.cliffItem(names)).
// opt.points: the kit's own records too ([{x, z, label}], e.g. its trees), opt.near (1.5 m). With a negative control: a
// rooted point on the steepest face the check finds (a scan of the centre's disc, opt.R, default the far LOD radius) must
// fail, or the check says it cannot see a cliff. {ok, bad: [{kit, item, n, at}], checked, control: {at, flagged}|null}
BIO.cliffItem=function(names,kit){const R=BIO.kits[kit==null?BIO.kitName||'':kit];if(!R)return;
 (Array.isArray(names)?names:[names]).forEach(n=>{if(R.defs[n])R.defs[n].cliff=true;else BIO.err('BIO.cliffItem: no item '+n);});};
BIO.cliffCheck=function(opt){opt=opt||{};const near=opt.near==null?1.5:opt.near,full=BIO.CLIFF.full,bad=new Map();let checked=0;
 const on=(x,y,z)=>Math.abs(y-BIO.terrainH(x,z))<=near&&BIO.cliff(x,z)>=full;
 const hit=(kit,item,x,y,z)=>{const k=kit+'|'+item;let b=bad.get(k);if(!b){b={kit,item,n:0,at:[x,y,z]};bad.set(k,b);}b.n++;};
 for(const m of BIO.baked){if(!m.isInstancedMesh||!m.name||m.name.indexOf('biome:')!==0)continue;
  const kit=m.userData.kit||'',item=m.name.slice(6),R=BIO.kits[kit],def=R&&R.defs[item];if(!def||def.cliff)continue;
  const A=m.instanceMatrix.array;for(let i=0;i<m.count;i++){const x=A[i*16+12],y=A[i*16+13],z=A[i*16+14];checked++;if(on(x,y,z))hit(kit,item,x,y,z);}}
 for(const p of opt.points||[]){checked++;const y=p.y==null?BIO.terrainH(p.x,p.z):p.y;if(on(p.x,y,p.z))hit('points',p.label||'point',p.x,y,p.z);}
 let control=null;const o=BIO.center(),R=opt.R||BIO.radii().far,st=opt.step||Math.max(8,R/150);let best=0,bx=0,bz=0;
 for(let z=o[1]-R;z<=o[1]+R;z+=st)for(let x=o[0]-R;x<=o[0]+R;x+=st){const c=BIO.cliff(x,z);if(c>best){best=c;bx=x;bz=z;}}
 if(best>=full)control={at:[bx,BIO.terrainH(bx,bz),bz],flagged:on(bx,BIO.terrainH(bx,bz),bz)};
 const L=[...bad.values()];return {ok:!L.length&&(!control||control.flagged),bad:L,checked,control};};

// A JITTERED GRID over a disc [rIn,rOut] round the origin: one candidate per
// cell, jittered, tested against the host mask, an fbm patch mask (the floor
// is patchy) and `accept(x,z,d)->0..1`. Even coverage with no clumps of
// rejection-sampling luck, and the count is predictable from the cell size.
// opt.depth: [lo,hi] of BIO.depth (ground under the local water) a cell must lie in
// (sedesert-1, additive): a pass that plants IN the water asks for its window.
// THE CELL FORM (CORE-IMPROVEMENTS item 13, 2026-10-27): BIO.grid(salt, cell, accept, fn, opt), a string first. Each cell is
// seeded from a hash of (the world's seed, the kit, salt, the cell's ix and iz, the candidate's index): the cell's jitter and
// its accept draw come from that seed, and rng() is reseeded from it before fn runs, so fn's own draws (rr, pick) are the
// cell's too. The page's stream is put back when the grid returns: adding, dropping or reordering a pass moves nothing in
// any other pass, and a box (a tile) built alone draws what it draws in the full build. The lattice is the world's
// (ix = floor(x / cell)), not the disc's. Its patch field is KRAND.fbm (portable), not the sin-based fbm.
//   opt.box [x0,z0,x1,z1], or opt.rOut (and opt.rIn, opt.center) for a disc: where it looks (one is needed)
//   opt.n   candidates per cell (default 1), each its own seed;  opt.depth, reach, patch, patchScale, pad, noMask as below
//   opt.cliff  true: the pass grows ON faces (lichens, cliff plants, hanging vines), no cliff gate. Unset: gated (BIO.cliffW)
//   accept(x, z, d) -> 0..1 as below; fn(x, y, z, seed, d): seed is the candidate's u32 (KRAND.stream(seed) for a stream
//   of its own). Returns the count placed.
// The numeric form below is the old stream-ordered grid, kept unchanged for the pages not yet rebuilt.
function gridCells(salt,cell,accept,fn,opt){opt=opt||{};
 if(typeof KRAND==='undefined')throw new Error('BIO.grid(\''+salt+'\', ...): the cell form needs core/rand (08-core-rand.js) on the page');
 if(!(cell>0))throw new Error('BIO.grid(\''+salt+'\', ...): cell must be a positive number of metres');
 const o=opt.center||BIO.center(),rIn=opt.rIn||0,rOut=opt.rOut,B0=opt.box;
 if(!B0&&!(rOut>0))throw new Error('BIO.grid(\''+salt+'\', ...): give opt.box or opt.rOut');
 const B=B0||[o[0]-rOut,o[1]-rOut,o[0]+rOut,o[1]+rOut],disc=rOut>0,D=opt.depth,per=opt.n==null?1:opt.n;
 const W=BIO.host?BIO.host.seed>>>0:1,root=KRAND.child(KRAND.child(W,'bio:'+(BIO.kitName||'')),String(salt)),pseed=KRAND.child(W,'bio.patch');
 const pk=opt.patch==null?.85:opt.patch,ps=opt.patchScale||.016,gate=opt.cliff!==true;
 const ix0=Math.floor(B[0]/cell),ix1=Math.floor(B[2]/cell),iz0=Math.floor(B[1]/cell),iz1=Math.floor(B[3]/cell);
 const saved=rngState();let n=0;
 try{for(let iz=iz0;iz<=iz1;iz++)for(let ix=ix0;ix<=ix1;ix++)for(let k=0;k<per;k++){
  const seed=KRAND.hash(root,ix,iz,k),s=KRAND.stream(seed),x=(ix+s.next())*cell,z=(iz+s.next())*cell,u=s.next();
  if(x<B[0]||z<B[1]||x>B[2]||z>B[3])continue;
  const d=Math.hypot(x-o[0],z-o[1]);if(disc&&(d<rIn||d>rOut))continue;
  let a=accept?accept(x,z,d):1;if(a<=0)continue;
  if(opt.reach){a*=BIO.reachW(opt.reach,x,z);if(a<=0)continue;}
  if(gate){a*=BIO.cliffW(x,z);if(a<=0)continue;}
  if(D){const dep=BIO.depth(x,z);if(dep<D[0]||dep>D[1])continue;}
  const m=opt.noMask?1:BIO.mask(x,z);if(m<=0)continue;
  const patch=pk>0?(1-pk*.5)+pk*KRAND.fbm(x*ps+7,z*ps-3,0,2,pseed):1;
  if(u>a*m*clamp(patch,0,1.15))continue;
  if(!BIO.clearOf(x,z,opt.pad||0))continue;
  reseed(s.u32());fn(x,BIO.terrainH(x,z),z,seed,d);n++;}}
 finally{reseed(saved);}
 return n;}
BIO.grid=function(cell,rIn,rOut,accept,fn,opt){if(typeof cell==='string')return gridCells(cell,rIn,rOut,accept,fn);
 opt=opt||{};const o=opt.center||BIO.center(),N=Math.ceil(rOut*2/cell);let n=0;const D=opt.depth;const gate=cliffOld(opt);
 const pk=opt.patch==null?.85:opt.patch,ps=opt.patchScale||.016;
 const B=opt.box;   // optional [x0,z0,x1,z1] window (a zone strip); cells outside it cost nothing
 let ix0=0,ix1=N-1,iz0=0,iz1=N-1;
 if(B){ix0=Math.max(0,Math.floor((B[0]-(o[0]-rOut))/cell));ix1=Math.min(N-1,Math.ceil((B[2]-(o[0]-rOut))/cell));iz0=Math.max(0,Math.floor((B[1]-(o[1]-rOut))/cell));iz1=Math.min(N-1,Math.ceil((B[3]-(o[1]-rOut))/cell));}
 for(let iz=iz0;iz<=iz1;iz++)for(let ix=ix0;ix<=ix1;ix++){
  const x=o[0]-rOut+(ix+rng())*cell,z=o[1]-rOut+(iz+rng())*cell,u=rng();
  if(B&&(x<B[0]||z<B[1]||x>B[2]||z>B[3]))continue;
  const d=Math.hypot(x-o[0],z-o[1]);if(d<rIn||d>rOut)continue;
  // accept first (sedesert-1): a zero there (out of the zone, out of the LOD band) costs
  // nothing more, and the host mask (terrain calls) is only paid for the rest.
  // Same result as testing it last: a zero never passed the u test anyway.
  let a=accept?accept(x,z,d):1;if(a<=0)continue;
  if(opt.reach){a*=BIO.reachW(opt.reach,x,z);if(a<=0)continue;}
  if(gate){a*=BIO.cliffW(x,z);if(a<=0)continue;}
  if(D){const dep=BIO.depth(x,z);if(dep<D[0]||dep>D[1])continue;}
  const m=opt.noMask?1:BIO.mask(x,z);if(m<=0)continue;
  const patch=pk>0?(1-pk*.5)+pk*fbm(x*ps+7,z*ps-3,9484,2):1;
  if(u>a*m*clamp(patch,0,1.15))continue;
  if(!BIO.clearOf(x,z,opt.pad||0))continue;
  fn(x,BIO.terrainH(x,z),z,d);n++;}
 return n;};
// REACH (PLAN-LANDS.md H1, biomes/hyperjungle): a species carried out of its home polygon by long diffusion, tens of km
// where an ecotone is a few hundred metres. reach = {from, km, falloff} (or a species record holding one as .reach):
// 1 inside the polygon `from`, falling to 0 at km kilometres from it. The distance comes from the host:
//   BIO.host.distance(from, x, z) -> metres, or BIO.host.distance = {from: (x, z) -> metres}; none known -> weight 0
// BIO.reachField(F, frame) turns a core/mask KMASK.distance field into that (x, z) -> metres lookup, frame
// {x0, z0, m}: pixel (i, j) covers x in [x0 + i m, x0 + (i + 1) m), the same frame the open world reads dist.png in.
// falloff: 'smooth' (the default, 1 - smoothstep), 'linear', 'square' ((1 - t)^2), or a function t -> weight on t in [0, 1].
// Only +, -, * and comparisons on the distance, so a page and Godot agree. BIO.grid takes it as opt.reach (a factor on
// accept, before the mask: a cell it zeroes draws nothing more, and a pass without it draws exactly as before).
BIO.reachDist=function(from,x,z){const D=BIO.host&&BIO.host.distance;if(!D)return null;
 const v=typeof D==='function'?D(from,x,z):(typeof D[from]==='function'?D[from](x,z):null);return v==null||v!==v?null:v;};
BIO.reachW=function(r,x,z){r=r&&r.reach&&!r.from?r.reach:r;if(!r||r.from==null)return 0;
 const km=r.km==null?0:r.km,dm=BIO.reachDist(r.from,x,z);if(dm==null)return 0;if(dm<=0)return 1;if(!(km>0))return 0;
 const t=dm/(km*1000);if(t>=1)return 0;const f=r.falloff==null?'smooth':r.falloff;
 if(typeof f==='function')return clamp(f(t),0,1);
 if(f==='linear')return 1-t;if(f==='square')return (1-t)*(1-t);
 if(f==='smooth')return 1-t*t*(3-2*t);
 BIO.err('BIO.reachW: no falloff '+f);return 0;};
BIO.reachField=function(F,frame){const x0=frame.x0==null?0:frame.x0,z0=frame.z0==null?0:frame.z0,m=frame.m==null?1:frame.m;
 return (x,z)=>{const v=F.sample((x-x0)/m,(z-z0)/m);return v===Infinity?null:v*m;};};
// POISSON-ish scatter of n points with a minimum spacing, area-uniform in the
// annulus, biased outward by `pow` (>1 pushes the crowd out). With core/space on the page the spacing test reads the
// accepted points through a KSPACE grid of cell minD (it was a scan of all of them: O(n^2)); the candidates come back
// in the order they were accepted, so the same points pass and the same draws are made.
BIO.scatter=function(n,rIn,rOut,minD,fn,opt){opt=opt||{};const o=opt.center||BIO.center(),P=[],gate=cliffOld(opt);let tries=0;
 const S=typeof KSPACE!=='undefined'&&typeof minD==='number'&&minD>0&&isFinite(minD)?KSPACE.create({cell:minD}):null,near=[];
 while(P.length<n&&tries++<n*40){const a=rng()*TAU,u=Math.pow(rng(),opt.pow||1);
  const r=Math.sqrt(lerp(rIn*rIn,rOut*rOut,u)),x=o[0]+Math.cos(a)*r,z=o[1]+Math.sin(a)*r;
  if(rng()>BIO.mask(x,z))continue;if(gate&&rng()>BIO.cliffW(x,z))continue;if(!BIO.clearOf(x,z,opt.pad||0))continue;
  let ok=true;for(const q of S?S.query(x,z,minD,near):P)if(Math.hypot(x-q[0],z-q[1])<minD){ok=false;break;}
  if(!ok)continue;const p=[x,z];P.push(p);if(S)S.insert(p,x,z,0);fn(x,BIO.terrainH(x,z),z,r);}
 return P;};
// keep-clear: outside every host obstacle cylinder (plus pad), on the ground.
// With core/space on the page the obstacles are read through a KSPACE grid (24 m) kept beside BIO.host.obstacles.
// Kits push into that array directly (Throne's trees, while a grid is running), so each query first files what was
// pushed since the last one; a new array (a nursery swaps its own in), a shorter one or a changed last entry is filed
// afresh. The candidates come back in the array's order and get the same test, so the answer is the scan's. An entry
// is read when it is filed: change an obstacle's x, z or r in place and the index does not see it (push a new one).
// An entry whose x, z or r is not a number, or a query whose x, z or pad is not one, goes to the plain scan, which
// answers as it always did. Up to OBS_SCAN obstacles are scanned (the grid costs more than it saves).
const OBS_CELL=24,OBS_SCAN=8;let _obs=null;const _near=[];
function obstacleIndex(){const O=BIO.host.obstacles;
 if(typeof KSPACE==='undefined'||!O||!(O.length>OBS_SCAN))return null;
 let I=_obs;if(!I||I.arr!==O||O.length<I.n||(I.n&&O[I.n-1]!==I.last))I=_obs={arr:O,n:0,last:null,S:KSPACE.create({cell:OBS_CELL}),scan:false};
 for(;I.n<O.length;I.n++){const q=O[I.n];I.last=q;
  if(q&&typeof q.x==='number'&&typeof q.z==='number'&&typeof q.r==='number')I.S.insert(q,q.x,q.z,q.r);else I.scan=true;}
 return I.scan?null:I.S;}
BIO.obstacleIndex=obstacleIndex;
BIO.clearOf=function(x,z,pad){const O=BIO.host.obstacles;pad=pad||0;
 const S=typeof x==='number'&&typeof z==='number'&&typeof pad==='number'?obstacleIndex():null,L=S?S.query(x,z,pad,_near):O;
 for(let i=0;i<L.length;i++){const q=L[i];if(Math.hypot(x-q.x,z-q.z)<q.r+pad)return false;}return true;};
// keep-clear in 3D: a blob of horizontal radius rad, half-height vr at (x,y,z)
BIO.clearOf3=function(x,y,z,rad,vr){const O=BIO.host.obstacles;
 const S=typeof x==='number'&&typeof z==='number'&&typeof rad==='number'?obstacleIndex():null,L=S?S.query(x,z,rad,_near):O;
 for(let i=0;i<L.length;i++){const q=L[i];if(q.y0!=null&&(y+vr<q.y0||y-vr>q.y1))continue;
  if(Math.hypot(x-q.x,z-q.z)<q.r+rad)return false;}return true;};

// ---------------------------------------------------------------- surface sampling
// For growing on a structure the host hands over as BufferGeometry[] in world
// space. Samples by triangle area, then filters by facing:
//   upFaces    normal.y > minUp   (ledges, treads, roofs)      -> moss, plants
//   downFaces  normal.y < -minDown (soffits, ceilings)          -> mats, curtains
//   sideFaces  |normal.y| < .35                                 -> vines, brackets
// Each sample: {p:[x,y,z], n:[nx,ny,nz], a:area}
// SHELLS: geos may hold {geos:[...], share} groups (a roof, the walls, the ledges) instead of
// plain geometries. Area decides where samples go WITHIN a shell, so one huge roof plate no
// longer takes a structure's moss from its small ledges: the n samples are split across the
// shells by share (default: equal), then each shell is sampled by area. A shell with no face
// the filter accepts (piers asked for ledges) takes no share: its part goes to the others.
// A list of plain geometries is one shell and draws exactly as before.
// the faces of geos the filter accepts, with their running area (no random draws)
function faceList(geos,filt){const F=[];let tot=0;
 for(const g of geos){const p=g.attributes.position;if(!p)continue;const idx=g.index?g.index.array:null;const cnt=idx?idx.length:p.count;
  for(let i=0;i<cnt;i+=3){const a=idx?idx[i]:i,b=idx?idx[i+1]:i+1,c=idx?idx[i+2]:i+2;
   const ax=p.getX(a),ay=p.getY(a),az=p.getZ(a),bx=p.getX(b),by=p.getY(b),bz=p.getZ(b),cx=p.getX(c),cy=p.getY(c),cz=p.getZ(c);
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;
   let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);if(l<1e-9)continue;nx/=l;ny/=l;nz/=l;
   if(filt&&!filt(nx,ny,nz))continue;
   const ar=l*.5;tot+=ar;F.push([ax,ay,az,bx,by,bz,cx,cy,cz,nx,ny,nz,ar,tot]);}}
 return {F,tot};}
// n samples by area from a face list, appended to out (three random draws each)
function sampleFaces(L,n,out){const F=L.F,tot=L.tot;if(!F.length)return out;
 for(let k=0;k<n;k++){const r=rng()*tot;let lo=0,hi=F.length-1;while(lo<hi){const m=(lo+hi)>>1;if(F[m][13]<r)lo=m+1;else hi=m;}
  const f=F[lo];let u=rng(),v=rng();if(u+v>1){u=1-u;v=1-v;}const w=1-u-v;
  out.push({p:[f[0]*w+f[3]*u+f[6]*v,f[1]*w+f[4]*u+f[7]*v,f[2]*w+f[5]*u+f[8]*v],n:[f[9],f[10],f[11]],a:f[12]});}
 return out;}
BIO.faceSamples=function(geos,n,filt){
 if(geos.some(g=>g&&g.geos)){
  const S=geos.map(g=>g&&g.geos?g:{geos:[g],share:1}).map(x=>({L:faceList(x.geos,filt),share:x.share==null?1:x.share})).filter(x=>x.L.F.length&&x.share>0);
  const tot=S.reduce((s,x)=>s+x.share,0)||1,out=[];let given=0;
  S.forEach((x,i)=>{const k=i===S.length-1?n-given:Math.round(n*x.share/tot);given+=k;if(k>0)sampleFaces(x.L,k,out);});
  return out;}
 return sampleFaces(faceList(geos,filt),n,[]);};
BIO.upFaces=function(geos,n,minUp){return BIO.faceSamples(geos,n,(nx,ny,nz)=>ny>(minUp==null?.62:minUp));};
BIO.downFaces=function(geos,n,minDown){return BIO.faceSamples(geos,n,(nx,ny,nz)=>ny<-(minDown==null?.62:minDown));};
BIO.sideFaces=function(geos,n){return BIO.faceSamples(geos,n,(nx,ny,nz)=>Math.abs(ny)<.35);};
// LEDGE POINTS: the outer edges of up-facing faces -- where a vine roots and
// hangs off. Found as up-face samples that have empty air just outboard of them
// (no up-face within `gap` metres in the direction away from the surface's centroid).
BIO.ledgePoints=function(geos,n,gap){gap=gap||2.5;const S=BIO.upFaces(geos,n*4,.62);if(!S.length)return[];
 let cx=0,cz=0;S.forEach(s=>{cx+=s.p[0];cz+=s.p[2];});cx/=S.length;cz/=S.length;
 const cell=gap,H={};const key=(x,y,z)=>(Math.floor(x/cell))+','+(Math.floor(y/(cell*2)))+','+(Math.floor(z/cell));
 S.forEach(s=>{H[key(s.p[0],s.p[1],s.p[2])]=1;});
 const out=[];
 for(const s of S){if(out.length>=n)break;const dx=s.p[0]-cx,dz=s.p[2]-cz,l=Math.hypot(dx,dz)||1;const ox=dx/l,oz=dz/l;
  if(!H[key(s.p[0]+ox*gap,s.p[1],s.p[2]+oz*gap)])out.push({p:s.p,n:[ox,0,oz]});}
 return out;};

})();
