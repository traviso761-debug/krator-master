// ================================================================= BIOME CORE — placement
// Where things go. Ported from the Hexahedron's forest rebuild (the forest is
// PLACEMENT, not plants) and Girder's keep-clear tests.

// SPECIES COME IN STANDS. A per-tree random draw mixes species so evenly the
// eye integrates them back into one colour; an fbm patch field a few hundred
// metres across picks a dominant species with a fraction off-pattern.
// fbm is bell-shaped (mean .5, sd ~.11): splitting its raw value n ways gave
// 1/27/53/20 % for four species. The value is stretched through the middle of
// the bell first so the n bands come out roughly even.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
BIO.standAt=function(x,z,n,scale,seed){scale=scale||.0017;const f=fbm(x*scale+31,z*scale-19,seed||9483,2);
 const u=smooth(.30,.70,f);return clamp(Math.floor(u*n),0,n-1);};
BIO.stand=function(x,z,n,off,scale,seed){return rng()<(off==null?.26:off)?Math.floor(rng()*n):BIO.standAt(x,z,n,scale,seed);};

// A JITTERED GRID over a disc [rIn,rOut] round the origin: one candidate per
// cell, jittered, tested against the host mask, an fbm patch mask (the floor
// is patchy) and `accept(x,z,d)->0..1`. Even coverage with no clumps of
// rejection-sampling luck, and the count is predictable from the cell size.
// opt.depth: [lo,hi] of BIO.depth (ground under the local water) a cell must lie in;
// the default (up to .3 m above the water) keeps everything out of the water.
BIO.grid=function(cell,rIn,rOut,accept,fn,opt){opt=opt||{};const o=opt.center||BIO.center(),N=Math.ceil(rOut*2/cell);let n=0;const D=opt.depth;
 const pk=opt.patch==null?.85:opt.patch,ps=opt.patchScale||.016;
 const B=opt.box;   // optional [x0,z0,x1,z1] window (a zone strip); cells outside it cost nothing
 let ix0=0,ix1=N-1,iz0=0,iz1=N-1;
 if(B){ix0=Math.max(0,Math.floor((B[0]-(o[0]-rOut))/cell));ix1=Math.min(N-1,Math.ceil((B[2]-(o[0]-rOut))/cell));iz0=Math.max(0,Math.floor((B[1]-(o[1]-rOut))/cell));iz1=Math.min(N-1,Math.ceil((B[3]-(o[1]-rOut))/cell));}
 for(let iz=iz0;iz<=iz1;iz++)for(let ix=ix0;ix<=ix1;ix++){
  const x=o[0]-rOut+(ix+rng())*cell,z=o[1]-rOut+(iz+rng())*cell,u=rng();
  if(B&&(x<B[0]||z<B[1]||x>B[2]||z>B[3]))continue;
  const d=Math.hypot(x-o[0],z-o[1]);if(d<rIn||d>rOut)continue;
  // accept first: a zero there (out of the zone, out of the LOD band) costs
  // nothing more, and the host mask (terrain calls) is only paid for the rest.
  // Same result as testing it last: a zero never passed the u test anyway.
  const a=accept?accept(x,z,d):1;if(a<=0)continue;
  if(D){const dep=BIO.depth(x,z);if(dep<D[0]||dep>D[1])continue;}
  const m=opt.noMask?1:BIO.mask(x,z);if(m<=0)continue;
  const patch=pk>0?(1-pk*.5)+pk*fbm(x*ps+7,z*ps-3,9484,2):1;
  if(u>a*m*clamp(patch,0,1.15))continue;
  if(!BIO.clearOf(x,z,opt.pad||0))continue;
  fn(x,BIO.terrainH(x,z),z,d);n++;}
 return n;};
// POISSON-ish scatter of n points with a minimum spacing, area-uniform in the
// annulus, biased outward by `pow` (>1 pushes the crowd out)
BIO.scatter=function(n,rIn,rOut,minD,fn,opt){opt=opt||{};const o=opt.center||BIO.center(),P=[];let tries=0;
 while(P.length<n&&tries++<n*40){const a=rng()*TAU,u=Math.pow(rng(),opt.pow||1);
  const r=Math.sqrt(lerp(rIn*rIn,rOut*rOut,u)),x=o[0]+Math.cos(a)*r,z=o[1]+Math.sin(a)*r;
  if(rng()>BIO.mask(x,z))continue;if(!BIO.clearOf(x,z,opt.pad||0))continue;
  let ok=true;for(const q of P)if(Math.hypot(x-q[0],z-q[1])<minD){ok=false;break;}
  if(!ok)continue;P.push([x,z]);fn(x,BIO.terrainH(x,z),z,r);}
 return P;};
// keep-clear: outside every host obstacle cylinder (plus pad), on the ground
BIO.clearOf=function(x,z,pad){const O=BIO.host.obstacles;pad=pad||0;
 for(let i=0;i<O.length;i++){const q=O[i];if(Math.hypot(x-q.x,z-q.z)<q.r+pad)return false;}return true;};
// keep-clear in 3D: a blob of horizontal radius rad, half-height vr at (x,y,z)
BIO.clearOf3=function(x,y,z,rad,vr){const O=BIO.host.obstacles;
 for(let i=0;i<O.length;i++){const q=O[i];if(q.y0!=null&&(y+vr<q.y0||y-vr>q.y1))continue;
  if(Math.hypot(x-q.x,z-q.z)<q.r+rad)return false;}return true;};

// ---------------------------------------------------------------- surface sampling
// For growing on a structure the host hands over as BufferGeometry[] in world
// space. Samples by triangle area, then filters by facing:
//   upFaces    normal.y > minUp   (ledges, treads, roofs)      -> moss, plants
//   downFaces  normal.y < -minDown (soffits, ceilings)          -> mats, curtains
//   sideFaces  |normal.y| < .35                                 -> vines, brackets
// Each sample: {p:[x,y,z], n:[nx,ny,nz], a:area}
BIO.faceSamples=function(geos,n,filt){const out=[];const F=[];let tot=0;
 for(const g of geos){const p=g.attributes.position;if(!p)continue;const idx=g.index?g.index.array:null;const cnt=idx?idx.length:p.count;
  for(let i=0;i<cnt;i+=3){const a=idx?idx[i]:i,b=idx?idx[i+1]:i+1,c=idx?idx[i+2]:i+2;
   const ax=p.getX(a),ay=p.getY(a),az=p.getZ(a),bx=p.getX(b),by=p.getY(b),bz=p.getZ(b),cx=p.getX(c),cy=p.getY(c),cz=p.getZ(c);
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;
   let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);if(l<1e-9)continue;nx/=l;ny/=l;nz/=l;
   if(filt&&!filt(nx,ny,nz))continue;
   const ar=l*.5;tot+=ar;F.push([ax,ay,az,bx,by,bz,cx,cy,cz,nx,ny,nz,ar,tot]);}}
 if(!F.length)return out;
 for(let k=0;k<n;k++){const r=rng()*tot;let lo=0,hi=F.length-1;while(lo<hi){const m=(lo+hi)>>1;if(F[m][13]<r)lo=m+1;else hi=m;}
  const f=F[lo];let u=rng(),v=rng();if(u+v>1){u=1-u;v=1-v;}const w=1-u-v;
  out.push({p:[f[0]*w+f[3]*u+f[6]*v,f[1]*w+f[4]*u+f[7]*v,f[2]*w+f[5]*u+f[8]*v],n:[f[9],f[10],f[11]],a:f[12]});}
 return out;};
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
