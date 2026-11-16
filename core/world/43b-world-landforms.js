// ================================================================= OPEN WORLD — relief: landforms as records (P4)
// [G data] Plain functions: no THREE, no DOM, no Math.random. core/world/PLAN-RELIEF.md, R5 and S7: the record engine and
// its first kinds. A record is a core/terrain KSTACKS body (37-core-stacks.js: a butte, a tor, an inselberg's dome, a
// spire, a karst tower), so the world and a settlement's page share one shape: the world folds it into its ground as a
// heightfield (its top, or its wall where a bed tapers: KSTACKS.surface), with a talus apron round its foot; the page
// that wants overhangs draws the same record as a mesh.
// Two sources:
//   - PLACED: each CELL m square of the world takes 0..n records drawn by KRAND from (seed, cell i, cell j, try), never
//     from how many draws came before, so any window of the world gives the same records. What a cell can hold comes from
//     the land style at its middle (KINDS below): buttes only where a caprock lies (WRELIEF.caprock), tors (kopjes) and
//     domes (inselbergs) on the savanna and dry country, spires in the badlands, towers in karst;
//   - PINNED: records a region gives (a site's own landform: openworld/pinnacle's mesa from settlements/pinnacle-rock's
//     layout), with WLAND.pin before init.
// Records are kept off: the region's outside, lakes and the sea, channels and rivers (and 150 m beyond), the small
// streams, and a site's ground (KEEP_SITE m round each region.json site, unless the site pins its own).
//
//   WLAND.pin(f)               before init: f(o) -> KSTACKS bodies (with name), made at init with its ground (or an array)
//   WLAND.init({ox, oz, seed, ground(x, z), styleName(x, z), overlay(x, z), caprock(x, z), keep(x, z), sites})  ground: the land
//                              without records (stable at any LOD); styleName: the land style there; caprock 0..1; keep:
//                              true where no record may stand; sites [{x, z, pinned}]
//   WLAND.apply(h, x, z, minWave)  the ground h with the records near (x, z): the highest of h, a body's surface and its
//                              apron; a body under minWave / 4 across is left out (a far chunk: a kopje, not a mesa, which
//                              the road router, reading the land at 4 km, must see)
//   WLAND.at(x, z)             {S, top, wall} the record surface over (x, z), or null
//   WLAND.list(x0, z0, x1, z1) the records whose middle lies in the box (placing their cells)
//   WLAND.pins()               the pinned records
//   WLAND.KINDS                the table of what each style's cells may hold; WLAND.OVERLAY the carving kinds by overlay
//                              (relief P7: the High Rift's tension fissures, cut from the land after the raised records)
var WLAND=(function(){'use strict';
const L={version:1};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const CELL=2000,KEEP_SITE=3500,TALUS_H=.1,TALUS_W=.35;
// per style: [kind, chance per try, tries per cell, sizes]; a butte asks for caprock (cap: the least WRELIEF.caprock)
L.KINDS={
 savanna: [{kind:'butte',p:.35,cap:.3,h:[45,140],r:[70,220]},{kind:'tor',p:.3,n:2,H:[6,14],r:[8,18]},{kind:'dome',p:.12,H:[40,120],r:[90,240]}],
 desert:  [{kind:'butte',p:.3,cap:.3,h:[40,150],r:[60,200]},{kind:'dome',p:.08,H:[30,100],r:[80,200]},{kind:'spire',p:.12,n:4,H:[18,45],r:[5,11]}],
 dryland: [{kind:'tor',p:.25,n:2,H:[5,12],r:[7,15]},{kind:'dome',p:.12,H:[30,90],r:[70,190]}],
 badland: [{kind:'butte',p:.35,cap:.25,h:[30,110],r:[50,160]},{kind:'spire',p:.4,n:6,H:[12,35],r:[4,9]},{kind:'fin',p:.15,n:2,H:[15,40],r:[8,16]}],
 chasm:   [{kind:'butte',p:.45,cap:.2,h:[60,200],r:[80,260]}],
 steps:   [{kind:'butte',p:.25,cap:.3,h:[40,130],r:[80,240]}],
 korona:  [{kind:'butte',p:.2,cap:.3,h:[60,180],r:[90,260]}],
 highland:[{kind:'tor',p:.3,n:2,H:[6,16],r:[8,20]}],
 karst:   [{kind:'tower',p:.6,n:3,H:[40,135],r:[35,90]}]};
// per overlay (its name, lower case): carving kinds (relief P7). The High Rift's gjar swarm (biomes/highrift/PLAN.md, station 5:
// "a swarm of narrow en-echelon tension fissures, 1-40 m wide and 2-60 m deep", striking NNE-SSW): up to three a cell, each
// offset from the last across its strike, as Thingvellir's are
L.OVERLAY={'high rift':[{kind:'fissure',p:.3,n:3,L:[400,2400],w:[2,30],d:[3,50],strike:20,jit:8}]};
let OX=0,OZ=0,SEED=0,O=null,PINS=[],PINF=[];const CELLS=new Map();
L.pin=function(f){PINF.push(f);return L;};
L.init=function(o){O=o;OX=o.ox||0;OZ=o.oz||0;SEED=KRAND.child(o.seed==null?0x4C4E44:o.seed,'landform');CELLS.clear();
 PINS=[];for(const f of PINF)for(const B of (typeof f==='function'?f(o):f)||[]){B.pinned=1;PINS.push(B);}return L;};
L.reset=function(){PINS=[];PINF=[];CELLS.clear();O=null;};
const u01=(i,j,k,s)=>KRAND.unit(KRAND.hash(SEED,i,j,k*16+s));
const rng=(a,i,j,k,s)=>a[0]+(a[1]-a[0])*u01(i,j,k,s);
// a record may stand at (x, z) with radius R: inside the region, kept clear of what keep() names, and of every site
function free(x,z,R){if(O.keep(x,z))return false;
 for(let a=0;a<8;a++)if(O.keep(x+cosT[a]*R*1.1,z+sinT[a]*R*1.1))return false;
 for(const s of O.sites||[])if(!s.pinned&&Math.hypot(x-s.x,z-s.z)<KEEP_SITE+R)return false;
 return true;}
const cosT=[1,.7071,0,-.7071,-1,-.7071,0,.7071],sinT=[0,.7071,1,.7071,0,-.7071,-1,-.7071];
// the lowest ground round a footprint, less a sink, so a body's foot is under the ground all round it
function footY(x,z,rx,rz){let m=O.ground(x,z);for(let a=0;a<8;a++)for(const k of [.6,1.05])m=Math.min(m,O.ground(x+cosT[a]*rx*k,z+sinT[a]*rz*k));return m-2;}
// the records of cell (i, j) (world-absolute: cell i spans OX + i CELL .. OX + (i + 1) CELL in the world's frame, so two
// regions cut over one place agree): placed once, kept. Positions are the region's (local) metres
function cellOf(i,j){const key=(i+32768)*65536+(j+32768);let C=CELLS.get(key);if(C)return C;C=[];CELLS.set(key,C);
 const bx=i*CELL-OX,bz=j*CELL-OZ,mx=bx+CELL/2,mz=bz+CELL/2,K=L.KINDS[O.styleName(mx,mz)];
 fissures(i,j,bx,bz,mx,mz,C);if(!K)return C;
 K.forEach((D,di)=>{const n=D.n==null?1:D.n;
  for(let t=0;t<n;t++){const k=di*8+t;if(u01(i,j,k,0)>=D.p)continue;
   const big=D.kind==='butte'||D.kind==='dome'||D.kind==='tower',r=rng(D.r,i,j,k,1),inset=Math.min(CELL*.45,(big?r*1.6:r*3)+40);
   const x=bx+inset+(CELL-2*inset)*u01(i,j,k,2),z=bz+inset+(CELL-2*inset)*u01(i,j,k,3);
   if(D.cap&&O.caprock(x,z)<D.cap)continue;
   if(!free(x,z,big?r*1.4:r*2))continue;
   if(C.some(B=>Math.hypot(B.x-x,B.z-z)<B.R+(big?r*1.4:r*2)+30))continue;   /* a body, or a fissure, already in the cell */
   const seed=KRAND.hash(SEED,i,j,k*16+9)>>>0,ry=u01(i,j,k,4)*3.14159,id='lf:'+D.kind+':'+i+':'+j+':'+t;let B=null;
   if(D.kind==='butte'){const e=1+u01(i,j,k,5)*.8,y0=footY(x,z,r/Math.sqrt(e),r*Math.sqrt(e)),h=rng(D.h,i,j,k,6);
    B=KSTACKS.make({id,kind:'butte',x,z,y0,seed,lobes:.18,weather:.8,tiers:[{h:h+(O.ground(x,z)-y0),r,e,ry}],shoulder:{h:Math.min(20,h*.15),back:Math.min(18,h*.12),bed:[3,6]}});
    B.name='A butte ('+Math.round(h)+' m)';}
   else if(D.kind==='dome'){const H=rng(D.H,i,j,k,6),y0=footY(x,z,r,r);B=KSTACKS.make({id,kind:'dome',x,z,H:H+(O.ground(x,z)-y0),r,y0,seed,e:1+u01(i,j,k,5)*.5,ry});B.name='An inselberg ('+Math.round(H)+' m)';}
   else if(D.kind==='tor'){const H=rng(D.H,i,j,k,6),y0=footY(x,z,r,r);B=KSTACKS.make({id,kind:'tor',x,z,H:H+(O.ground(x,z)-y0),r,y0,seed});B.name='A kopje ('+Math.round(H)+' m)';}
   else if(D.kind==='spire'||D.kind==='fin'){const H=rng(D.H,i,j,k,6),y0=footY(x,z,r,r);
    B=KSTACKS.make({id,kind:D.kind,x,z,y0,seed,H:H+(O.ground(x,z)-y0),r,e:D.kind==='fin'?3+u01(i,j,k,5)*2:1+u01(i,j,k,5)*.4,ry,lean:(u01(i,j,k,7)-.5)*.12});
    B.name=(D.kind==='fin'?'A fin (':'A hoodoo (')+Math.round(H)+' m)';}
   else if(D.kind==='tower'){const H=rng(D.H,i,j,k,6),y0=footY(x,z,r,r);B=KSTACKS.tower({id,seed,x,z,H:H+(O.ground(x,z)-y0),R:r,y0});B.name='A karst tower ('+Math.round(H)+' m)';}
   if(B){B.placed=1;C.push(B);}}});
 return C;}
// THE FISSURES of cell (i, j): a carving record {kind 'fissure', carve, a, b (its ends), w, d, x, z, R}, en echelon: each next
// one offset across the strike by 3 to 6 widths and along it by a third of its length
function fissures(i,j,bx,bz,mx,mz,C){const ov=O.overlay?O.overlay(mx,mz):'',F=ov&&L.OVERLAY[ov];if(!F)return;
 F.forEach((D,di)=>{let px=null,pz=null;
  for(let t=0;t<D.n;t++){const k=64+di*8+t;if(u01(i,j,k,0)>=D.p)continue;
   const len=rng(D.L,i,j,k,1),w=rng(D.w,i,j,k,2),d=Math.min(rng(D.d,i,j,k,3),w*2+2),a=(D.strike+(u01(i,j,k,4)-.5)*2*D.jit)*Math.PI/180,ux=Math.sin(a),uz=-Math.cos(a);
   let x,z;if(px==null){x=bx+CELL*(.25+.5*u01(i,j,k,5));z=bz+CELL*(.25+.5*u01(i,j,k,6));}
   else{const off=w*(3+3*u01(i,j,k,5)),al=len*.33*(u01(i,j,k,6)<.5?-1:1);x=px-uz*off+ux*al;z=pz+ux*off+uz*al;}
   const hl=Math.min(len/2,CELL*.45),A=[x-ux*hl,z-uz*hl],B2=[x+ux*hl,z+uz*hl];   /* its reach takes in the wander (R + 14 m) */
   if(O.keep(x,z)||O.keep(A[0],A[1])||O.keep(B2[0],B2[1]))continue;
   C.push({id:'lf:fissure:'+i+':'+j+':'+t,kind:'fissure',carve:1,placed:1,x,z,a:A,b:B2,w,d,R:hl+w+14,name:'A tension fissure ('+Math.round(w)+' m wide, '+Math.round(d)+' m deep)'});px=x;pz=z;}});}
// a fissure's cut at (x, z): its depth across the width (the walls a ramp of a twentieth of the depth, so the land stays
// continuous), easing out over the last fifth of its length at each end
// Its line wanders across the strike (KRAND value noise along it, two octaves, at most 1.5 widths or 12 m): a ruler-straight
// crack read as the grid artifact this module takes out
function fissureCut(F,x,z){const dx=F.b[0]-F.a[0],dz=F.b[1]-F.a[1],l2=dx*dx+dz*dz,l=Math.sqrt(l2);let t=((x-F.a[0])*dx+(z-F.a[1])*dz)/l2;if(t<-.05||t>1.05)return 0;t=t<0?0:t>1?1:t;
 const s=((x-F.a[0])*dz-(z-F.a[1])*dx)/l,u=t*l,sd=F.sd==null?(F.sd=KRAND.hash(SEED,Math.round(F.x),Math.round(F.z),77)>>>0):F.sd,
  wob=((KRAND.vnoise(u/220,0,.5,sd)-.5)*1.4+(KRAND.vnoise(u/70,3.1,.5,sd^0x55)-.5)*.6)*Math.min(12,F.w*1.5);
 const d=Math.abs(s-wob),hw=F.w/2*(1-smooth(.8,1,Math.abs(2*t-1))),edge=hw+F.d/20+.5;if(d>=edge||hw<=0)return 0;
 return F.d*(1-smooth(.8,1,Math.abs(2*t-1)))*(1-smooth(hw,edge,d));}
// the records whose reach covers (x, z): the pins and the placed of the 3 x 3 cells round it
const NEAR=[];
// a body's reach: its radius and its talus apron (TALUS_W of its height, and 8 m)
const ht=B=>B.top==null?B.R:B.top-B.y0,reach=B=>B._reach||(B._reach=B.carve?B.R+2:B.R+ht(B)*TALUS_W+10);
function near(x,z){NEAR.length=0;for(const B of PINS){const R=reach(B);if(Math.abs(x-B.x)<=R&&Math.abs(z-B.z)<=R)NEAR.push(B);}
 const i=Math.floor((x+OX)/CELL),j=Math.floor((z+OZ)/CELL);
 for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const C=cellOf(i+a,j+b);for(const B of C){const R=reach(B);if(Math.abs(x-B.x)<=R&&Math.abs(z-B.z)<=R)NEAR.push(B);}}
 return NEAR;}
const smooth=(a,b,v)=>{let t=(v-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
// THE RASTER: a body's surface (KSTACKS.surface: its top, or its wall where a bed tapers; NaN off the rock) and its talus
// apron (TALUS_H of its height at the foot, easing to nothing TALUS_W of it out: KSTACKS.foot's distance) sampled once on
// a world-aligned grid of cs metres (its radius / 50, 2 to 6 m), when first asked for, and read bilinearly. Asked of the
// body's beds at every call, a weathered butte's ragged outline cost H five to ten times over
function raster(B){if(B._r)return B._r;const R=reach(B),cs=clamp(B.R/50,2,6),x0=Math.floor((B.x-R+OX)/cs)*cs-OX,z0=Math.floor((B.z-R+OZ)/cs)*cs-OZ;
 const nx=Math.ceil((B.x+R-x0)/cs)+1,nz=Math.ceil((B.z+R-z0)/cs)+1,top=new Float32Array(nx*nz),apr=new Float32Array(nx*nz),L1=[B],Ht=ht(B),W=Ht*TALUS_W+8;
 /* the foot first (one bed): outside it, no surface is asked for (the beds above stand inside it), only the apron */
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*cs,z=z0+j*cs,o=j*nx+i,f=KSTACKS.foot(L1,x,z),s=f&&f.d<=cs?KSTACKS.surface(L1,x,z):null;top[o]=s?s.top:LOW;
  if(!s)apr[o]=f&&f.d>0&&f.d<W?Ht*TALUS_H*(1-smooth(0,W,f.d)):0;}
 /* THE WALL'S BATTER: a heightfield has no vertical; a wall drawn as a step between two samples broke the land's continuity
    (49 m within 3 cm). No sample is let lie more than WALL x its distance under a neighbour (max-plus chamfer, both ways), so
    a wall is a ramp of 1 in WALL (87 degrees) read bilinearly: off the rock it leans out over the ground (the max with h) */
 const d1=WALL*cs,d2=WALL*cs*1.41421356;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const o=j*nx+i;let v=top[o];
  if(i>0)v=Math.max(v,top[o-1]-d1);if(j>0){v=Math.max(v,top[o-nx]-d1);if(i>0)v=Math.max(v,top[o-nx-1]-d2);if(i<nx-1)v=Math.max(v,top[o-nx+1]-d2);}top[o]=v;}
 for(let j=nz-1;j>=0;j--)for(let i=nx-1;i>=0;i--){const o=j*nx+i;let v=top[o];
  if(i<nx-1)v=Math.max(v,top[o+1]-d1);if(j<nz-1){v=Math.max(v,top[o+nx]-d1);if(i<nx-1)v=Math.max(v,top[o+nx+1]-d2);if(i>0)v=Math.max(v,top[o+nx-1]-d2);}top[o]=v;}
 return B._r={x0,z0,cs,nx,nz,top,apr};}
const LOW=-1e9,WALL=20;
L.apply=function(h,x,z,minWave){if(!O)return h;const N=near(x,z);if(!N.length)return h;let out=h;
 let cut=0;
 for(const B of N){if(B.carve){if(B.w>=(minWave==null?0:minWave)*.25){const c=fissureCut(B,x,z);if(c>cut)cut=c;}continue;}
  if(B.R*2<(minWave==null?0:minWave)*.25)continue;   /* under a quarter of the asking wavelength across: a far chunk, a kopje */const r=raster(B),u=(x-r.x0)/r.cs,v=(z-r.z0)/r.cs;if(u<0||v<0||u>=r.nx-1||v>=r.nz-1)continue;
  const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*r.nx+i,T=r.top,A=r.apr;
  const t=(T[o]*(1-fu)+T[o+1]*fu)*(1-fv)+(T[o+r.nx]*(1-fu)+T[o+r.nx+1]*fu)*fv;if(t>out)out=t;
  const a=(A[o]*(1-fu)+A[o+1]*fu)*(1-fv)+(A[o+r.nx]*(1-fu)+A[o+r.nx+1]*fu)*fv;if(h+a>out)out=h+a;}
 return out-cut;};
// the record at (x, z): a raised one's surface {S, top, wall, d (into its top from the edge: negative inside, the rim band's
// test)} or a fissure's cut {S, cut}; null where none (the inspector, KSITES' rim, the probe)
L.at=function(x,z){if(!O)return null;const N=near(x,z);if(!N.length)return null;const R=N.filter(B=>!B.carve);
 const s=R.length?KSTACKS.surface(R,x,z):null;if(s)return{S:s.S,top:s.top,wall:s.wall,d:s.d};
 for(const B of N)if(B.carve){const c=fissureCut(B,x,z);if(c>0)return{S:B,cut:c};}return null;};
L.list=function(x0,z0,x1,z1){const out=PINS.filter(B=>B.x>=x0&&B.x<=x1&&B.z>=z0&&B.z<=z1);if(!O)return out;
 for(let j=Math.floor((z0+OZ)/CELL);j<=Math.floor((z1+OZ)/CELL);j++)for(let i=Math.floor((x0+OX)/CELL);i<=Math.floor((x1+OX)/CELL);i++)for(const B of cellOf(i,j))if(B.x>=x0&&B.x<=x1&&B.z>=z0&&B.z<=z1)out.push(B);
 return out;};
L.cells=()=>CELLS.size;L.pins=()=>PINS;
return L;})();
if(typeof module!=='undefined')module.exports=WLAND;
