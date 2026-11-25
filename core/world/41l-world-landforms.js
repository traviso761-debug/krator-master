// ================================================================= OPEN WORLD — landforms under a cell, stamped at 1:1
// [G data] The scale model's 2 km cells cannot hold an islet 300 m across or a strait 680 m wide, so an edit records them
// (DATA.landforms: tools/scale-model/model/data/landforms.json, written by edit_512 and edit_513; positions in pixels of
// the 5.1 canvas, heights absolute). extract_region.py carries the records whose reach meets a region's box into
// region.json ('landforms', with x and z of the record's px in the region's frame); this fragment stamps them into the
// land through WORLD.landHook (chained onto the hook the region has when WORLD.init runs, so a region's own coast or reef
// keeps its place under it). A town's footprint is the town's ground (41 townAt comes after the hook), so a stamp under a
// town shows only in its band. No THREE, no DOM; the noise is core/terrain's KRELIEF (integer hashes).
//
// The kinds (openworld/PLAN-VOTH.md section 3, item 4):
//   island | islet | stack   the ground rises from the bed to crest_m inside r_m (r_m the waterline's radius at water_m),
//                            a skirt falling past it to the bed; the waterline wobbles by up to 12 % with noise
//   shoal                    the same with crest_m under the water: a bank, no land
//   water                    a body of water finer than the cells, at water_m. Its forms:
//                              page     a settlement page's water as `parts` (circles {px, r_m}, capsules {px, px_to, r_m})
//                                       joined by a smooth minimum of smin_m (edit_513: Voth's bay, narrows, lake, strait)
//                              narrows,
//                              strait   a channel along path_px, width_m across, its bed at bed_m; a strait's raise
//                                       (below) fades over its last TAPER m, where it opens into the sea
//                              river    nothing here: 41's named river carries it (and a town its own river)
//                            All the water records make ONE field, a smooth minimum of their signed distances s, so their
//                            stamps never fight: inside (s < 0) the ground is set to the water less a depth (a shelf's
//                            profile where a shelf record names the water, else down to bed_m: higher ground is cut, a
//                            deeper coarse bed raised, except toward a strait's sea end); outside, ground that lies
//                            near or under the water within REACH_W m is raised to a low shore rising off the water (the
//                            page's: 2 m at the shore, 22 m at 700 m), so the model's coarse wet cells close to the
//                            record's width. Ground well above the water is left as it is.
//   shelf                    the page's bed for the water it names (`of`): 1.2 m deep at the shore, 4.8 m at 70 m, then
//                            13.8 m at 330 m, 36.8 m at 920 m, 51.8 m at 2.1 km (Voth's terrainH, 10-core.js)
//   bench                    a level terrace cut into a slope (settlements/viridian PLAN.md 12b: lf_viridian_bench): a
//                            rectangle w_m across by l_m long round its centre (px/py, or x/z), its long side at `rotation`
//                            (degrees: 0 the long side east-west along x, 90 north-south along z), level at level_m. The
//                            ground inside is set to level_m; outside it is held within a batter of batter_deg (or
//                            batter_run_m metres out per metre of rise; 1.5 if neither) of the level, so the uphill side is
//                            cut down to it and the downhill side filled up to it, each face no steeper than the batter.
//                            The batter's crest rounds over skirt_m/4 off the bench's edge and its toe meets the ground over
//                            about skirt_m (default 30): a smooth minimum, so no step or crease shows. reach_m (default
//                            skirt_m + 1.5 x the long side) bounds it: the batter must meet the ground inside, which it does
//                            on any slope gentler than the batter (WLAND.check reports it when not).
//                            Or an outline (outline_px: a polygon in model pixels, at least three points; rotation, w_m and l_m
//                            are then not read): its edge wanders by up to wobble_m (default 0) with noise on ~900 m, seeded by
//                            the record's id, except along the edges named in keep_edges (index i: point i to point i + 1),
//                            held as drawn within 150 m and easing into the wander by 750 m (a quay, a wall). The faces keep
//                            the batter: where the edge wanders, the batter is divided by its wander's steepest gradient
//                            (settlements/hook/world/landforms.json: Hook's spit, 2026-11-24). fill_only (either shape): the
//                            bench only raises the ground (a drowned shelf: an islet standing on it stays), never cuts;
//                            cut_only the other way: it only lowers (a drowned quarter: deeper water in it stays as it was).
//                            dome_m (outlined): the ground inside rises by up to dome_m over the first dome_run_m (default 300)
//                            in from the edge, smoothly, so a raised hill or ridge has relief, not a flat top
//   pancake_dome             a flat-topped, steep-walled table of viscous lava (the scale model's DATA.domes, edit_518: the
//                            Firebliss and Korona domes; 2026-11-24, Stage 8 B7, D15: drawn at 1:1, not raster-only), its
//                            middle at px [x, y] (or px/py, or x/z), d_km across (or r_m, or radius_px), its top at top_m (or
//                            base_m + h_m, or base_m + relief_m). The model's own profile at 1:1: flat at the top to DOME_TOP of
//                            the radius, then the wall, top - (top - ground) x smoothstep(DOME_TOP, 1, r/R), raising the ground
//                            only (edit_518: prof = top_m - (top_m - E) * sstep(.72, 1, r)), so the cliff the 2 km cells smear
//                            over a cell or two stands within its last 28 % of the radius
// Any other kind is left out and named in WLAND.skipped (a new kind adds its profile here first). Not drawn here: the
// scale model's secondary_crater (the SE Tharn crater, 108 km: its 2 km cells already hold its floor, slump walls and rim,
// which edit_522 shaped from the ground under them and its own noise, so the record carries no profile to draw again) and
// secondary_crater_bay (no record on this line: the Crookshore bays gave way, 2026-11-23); both are listed as skipped.
//
//   WLAND.list        the stamped island records (in metres); WLAND.waters the water records; WLAND.benches the benches;
//                     WLAND.domes the pancake domes
//   WLAND.skipped     [{id, kind}] the records of a kind this fragment does not know
//   WLAND.at(x,z)     the island record whose reach holds (x,z), or null
//   WLAND.benchAt(x,z) the bench record whose reach holds (x,z), or null
//   WLAND.benchD(B,x,z) m off bench B's level ground (0 on it): its rectangle, or its outline as it wanders
//   WLAND.domeAt(x,z) the pancake dome whose radius holds (x,z), or null
//   WLAND.waterAt(x,z) the water field there: {s (m, < 0 in the water), id (the nearest record)}, or null beyond reach
//   WLAND.check()     each record against what it asks: an island's top and waterline; a water record's channel under its
//                     water (and a strait's banks dry beside it), outside every town's footprint; a bench level inside,
//                     no face steeper than its batter, the batter meeting the ground inside its reach, and its earthworks:
//                     the cut's and the fill's depths (max and mean over the ground each moves) and areas; a dome's top at
//                     its top_m over its flat (the fall to the ground past its foot reported)
var WLAND=(function(){'use strict';
const W=WORLD,lerp=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
// REACH_W: how far off a water record its shore raise reaches. It covers a whole coarse cell (2 km) and its ring: a channel
// jogs from wet cell to wet cell, so a wet cell's far side can lie 1.6 km off the line (edit_513's strait)
const KN=KRELIEF.noise(1414),REACH=1.8,SKIRT=8,REACH_W=2400,TAPER=4000;
const KINDS={island:1,islet:1,stack:1,shoal:1};
const api={list:[],waters:[],benches:[],domes:[],skipped:[]};
const smin=(a,b,k)=>{const h=Math.max(0,Math.min(1,.5+.5*(b-a)/k));return lerp(b,a,h)-k*h*(1-h);};
const segD=(x,z,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;let t=l2>0?((x-ax)*dx+(z-az)*dz)/l2:0;t=t<0?0:t>1?1:t;return[Math.hypot(ax+dx*t-x,az+dz*t-z),t];};

// ---------------------------------------------------------------- the islands
// the waterline's radius at (x,z) for record L: r_m wobbled by up to 12 % (noise on the scale of the landform)
const radius=(L,x,z)=>L.r*(1+.24*(KN.fbm(x/(L.r*.9)+L.ox,z/(L.r*.9)+L.oz,2)-.5));
// the stamped ground of record L at (x,z) over the land h
function stamp(L,x,z,h){const d=Math.hypot(x-L.x,z-L.z);if(d>=L.r*REACH*1.15)return h;
 const u=d/radius(L,x,z);if(u>=REACH)return h;
 const rise=L.crest-L.water,cap=1-smooth(.15,1,u),t=L.water+rise*cap-SKIRT*smooth(1,1.6,u)+(KN.vn(x/45+L.ox,z/45+L.oz)-.5)*.12*Math.max(0,rise)*cap;
 return Math.max(h,lerp(h,t,1-smooth(1.3,REACH,u)));}
function find(x,z){for(const L of api.list)if(Math.hypot(x-L.x,z-L.z)<L.r*REACH*1.15)return L;return null;}

// ---------------------------------------------------------------- the water
// the page's bed (Voth's terrainH under its water: 10-core.js), depth (m) at d m off the shore
const pageDepth=d=>1.2+3.6*smooth(0,70,d)+9*smooth(70,330,d)+23*smooth(330,920,d)+15*smooth(920,2100,d);
// one water record's signed distance at (x,z) (m; < 0 inside) and, for a strait, how far (m) from its sea end
function wDist(R,x,z,o){if(R.form==='page'){let s=1e9;for(let i=0;i<R.parts.length;i++){const P=R.parts[i],e=P.b?segD(x,z,P.a[0],P.a[1],P.b[0],P.b[1])[0]-P.r:Math.hypot(x-P.a[0],z-P.a[1])-P.r;s=i?smin(s,e,R.k):e;}o.end=1e9;return s;}
 let best=1e18,at=0;for(let i=0;i<R.path.length-1;i++){const a=R.path[i],b=R.path[i+1],r=segD(x,z,a[0],a[1],b[0],b[1]);if(r[0]<best){best=r[0];at=R.cum[i]+(R.cum[i+1]-R.cum[i])*r[1];}}
 o.end=R.form==='strait'?R.len-at:1e9;return best-R.half;}
const WF={s:0,id:null,R:null,end:1e9},_o={end:1e9};
// the water field at (x,z): the smooth minimum of every record's distance; the record nearest, and its sea end
function wField(x,z){WF.R=null;WF.end=1e9;let near=1e18;
 for(const R of api.waters){if(x<R.box[0]||x>R.box[2]||z<R.box[1]||z>R.box[3])continue;const e=wDist(R,x,z,_o);
  WF.s=WF.R===null?e:smin(WF.s,e,R.k);
  if(e<near){near=e;WF.R=R;WF.end=_o.end;}}
 WF.id=WF.R?WF.R.id:null;return WF.R?WF:null;}
function waterStamp(x,z,h){const F=wField(x,z);if(!F)return h;const R=F.R,L=R.water,s=F.s;
 // inside: the record's bed, set both ways (a deeper coarse bed is raised to it, but not toward a strait's sea end, where
 // the bed falls away into the sea's own)
 if(s<0){const d=-s,dep=R.shelf?pageDepth(d):Math.min(R.depth,1+R.depth*smooth(0,300,d)),t=L-(R.bed!=null?Math.min(L-R.bed,dep):dep);
  return h>t?t:h+(t-h)*smooth(0,TAPER,F.end);}
 if(s>=REACH_W)return h;
 // the shore off the water: raise ground near or under the water to a low shore (never lower it); a strait's raise fades
 // toward its sea end, where it opens into the water beyond
 const t=L+2+20*smooth(0,700,s),g=smooth(L+6,L-1,h),w=(1-smooth(REACH_W*.55,REACH_W,s))*smooth(0,TAPER,F.end);
 return h+Math.max(0,t-h)*g*w;}

// ---------------------------------------------------------------- the benches
// An outlined bench (outline_px) is a polygon, not a rectangle: d is its signed distance (Euclidean, < 0 inside) plus a
// wander of up to wobble_m (core/terrain's noise, seeded by the record's id), which fades out within KEEP_F0..KEEP_F1 m of
// an edge named in keep_edges (a quay, a wall: held as drawn). The wander's gradient makes d steeper than a distance, so the
// batter there is divided by its bound (B.wg, measured at build): no face is steeper than the batter asked
const KEEP_F0=150,KEEP_F1=750;
const BQ={d:0,t:0};
// the wander's shape at (x,z), -1..1: the relief noise (0.06 to 0.93 about 0.5) stretched 1.6 times and soft-clipped by a
// cubic whose slope is 0 at +-1, so wobble_m is a bound the shore reaches, not one it hardly nears
function wobN(B,x,z){let v=1.6*(2*KN.fbm(x/B.wl+B.ox,z/B.wl+B.oz,3)-1);v=v<-1?-1:v>1?1:v;return v*(1.5-.5*v*v);}
// the outline's signed distance and the distance to its kept edges (squared distances, no allocation: every height read
// near an outlined bench comes through here)
function polySD(B,x,z,o){const P=B.poly;let best=1e36,keep=1e36,inside=false;
 for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[j],b=P[i],ax=a[0],az=a[1],dx=b[0]-ax,dz=b[1]-az;
  if((az>z)!==(b[1]>z)&&x<dx*(z-az)/dz+ax)inside=!inside;
  const l2=dx*dx+dz*dz;let t=l2>0?((x-ax)*dx+(z-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const ex=ax+dx*t-x,ez=az+dz*t-z,e=ex*ex+ez*ez;
  if(e<best)best=e;if(B.keep[j]&&e<keep)keep=e;}
 o.keep=Math.sqrt(keep);best=Math.sqrt(best);return inside?-best:best;}
const _p={keep:0};
// the outline's distance on a coarse raster (CG m, built with the record): a read further than the reach and the wander
// off the outline, or deeper inside it than the wander, is settled from the raster alone (a distance moves no faster than
// the point does, so the raster's nearest node is within CG * 0.71 m of the truth)
const CG=50;
function coarseSD(B,x,z){const G=B.cg,i=Math.round((x-G.x0)/CG),j=Math.round((z-G.z0)/CG);if(i<0||j<0||i>=G.nx||j>=G.nz)return null;return G.d[j*G.nx+i];}
// (x,z) on an outlined bench: o.d the distance (0 inside), o.t the batter's slope there
function benchQ(B,x,z,o){
 if(!B.poly){const dx=x-B.x,dz=z-B.z,u=Math.abs(dx*B.c+dz*B.s)-B.a,v=Math.abs(-dx*B.s+dz*B.c)-B.b;
  o.d=u<=0&&v<=0?0:Math.hypot(Math.max(u,0),Math.max(v,0));o.t=B.tan;return o;}
 const c=coarseSD(B,x,z);o.t=B.tan;o.in=0;
 if(c!==null){if(c-CG*.71>B.reach+B.wob){o.d=B.reach+1;return o;}if(c+CG*.71< -B.wob-B.drun){o.d=0;o.in=B.dome?domeDepth(B,x,z):1e9;return o;}}
 const s=polySD(B,x,z,_p),f=1-smooth(KEEP_F0,KEEP_F1,_p.keep),w=1-f;   /* f: 1 on a kept edge's band, 0 past its fade */
 const sd=s+(B.wob>0?B.wob*w*w*wobN(B,x,z):0);
 o.d=sd>0?sd:0;o.in=sd<0?(B.dome?smin(-sd,domeDepth(B,x,z),DOME_K):-sd):0;o.t=B.tan/(1+B.wg*w);return o;}
// a dome's depth in from the edge: the coarse raster's depth blurred (DOME_SIG nodes), read bilinearly, so the crest is round,
// not a crease along the outline's spine; joined to the exact depth near the edge by a smooth minimum (DOME_K m), so the dome
// starts at the bench's level where its batter does
const DOME_SIG=2,DOME_K=40;
function domeDepth(B,x,z){const G=B.cg,u=(x-G.x0)/CG,v=(z-G.z0)/CG,i=Math.floor(u),j=Math.floor(v);
 if(i<0||j<0||i>=G.nx-1||j>=G.nz-1)return 0;const a=u-i,b=v-j,D=B.dd,n=G.nx,k=j*n+i;
 return (D[k]*(1-a)+D[k+1]*a)*(1-b)+(D[k+n]*(1-a)+D[k+n+1]*a)*b;}
// the ground an outlined bench sets inside: its level, plus its dome (dome_m) risen over the first dome_run_m in from the edge
function benchTop(B,din){return B.dome?B.level+B.dome*smooth(0,B.drun,din):B.level;}
// B's frame at (x,z): u along the long side, v across; d (m) off the rectangle (0 inside, Euclidean round the corners), or off
// the outline
function benchD(B,x,z){return benchQ(B,x,z,BQ).d;}
// the stamped ground of bench B at (x,z) over the land h. The batter's allowance m(d): how far from the level the ground may
// stand d m off the edge (0 at the edge, rising at the batter's slope, its crest rounded over B.sc); the ground's own
// offset from the level is drawn into it by a smooth minimum of k (B.k: the toe rounded over about skirt_m), whose two
// weights sum to 1, so the face's slope is never steeper than the batter's or the ground's own
let benchOff=false;   /* WLAND.check reads the ground without the benches */
let benchUpTo=1e9;    /* ...and with only the benches up to the one it judges (their order is the records') */
function benchStamp(B,x,z,h){if(benchOff||x<B.box[0]||x>B.box[2]||z<B.box[1]||z>B.box[3])return h;
 benchQ(B,x,z,BQ);const d=BQ.d;if(d>=B.reach)return h;
 if(B.fill)return Math.max(h,benchCut(B,d,h));   /* fill_only: a drowned shelf raises the bed and cuts nothing (an islet on it stays) */
 if(B.cut)return Math.min(h,benchCut(B,d,h));    /* cut_only: a drowned quarter lowers the land and leaves deeper water as it was */
 return benchCut(B,d,h);}
function benchCut(B,d,h){
 if(d<=0)return benchTop(B,BQ.in);
 const k=B.poly?Math.max(.5,B.skirt*BQ.t):B.k;
 const e=h-B.level,m=BQ.t*(d<B.sc?d*d/(2*B.sc):d-B.sc/2);if(Math.abs(e)<=m-k)return h;   /* past the toe: the ground as it was */
 const f=Math.max(0,smin(Math.abs(e),m,k)),t=B.level+(e<0?-f:f);
 return d<=B.reach-B.skirt?t:lerp(t,h,smooth(B.reach-B.skirt,B.reach,d));}
function benchFind(x,z){for(const B of api.benches)if(x>=B.box[0]&&x<=B.box[2]&&z>=B.box[1]&&z<=B.box[3]&&benchD(B,x,z)<B.reach)return B;return null;}
function benchRec(r,xz,px){const rot=(r.rotation||0)*Math.PI/180,skirt=r.skirt_m==null?30:r.skirt_m,
  tan=r.batter_deg!=null?Math.tan(r.batter_deg*Math.PI/180):1/(r.batter_run_m==null?1.5:r.batter_run_m);
 if(r.outline_px&&r.outline_px.length>=3)return outlineRec(r,px,skirt,tan);
 const a=r.l_m/2,b=r.w_m/2,reach=r.reach_m==null?skirt+1.5*Math.max(r.l_m,r.w_m):r.reach_m,R=Math.hypot(a,b)+reach;
 return{id:r.id,kind:'bench',x:xz[0],z:xz[1],c:Math.cos(rot),s:Math.sin(rot),a,b,level:r.level_m,tan,skirt,sc:skirt/4,k:Math.max(.5,skirt*tan),
  reach,box:[xz[0]-R,xz[1]-R,xz[0]+R,xz[1]+R],fill:!!r.fill_only,cut:!!r.cut_only};}
// an outlined bench: its polygon in the region's metres, its box's middle and half-extents (the check's grid: c 1, s 0), the
// wander's length (WOB_L m, its finest octave a quarter of that), its seed by the record's id, and the bound of the wander's
// gradient (wg: the noise's steepest, sampled every WG_STEP m over WG_SPAN round the middle, and the fade's)
const WOB_L=900,WG_STEP=20,WG_SPAN=3000;
function outlineRec(r,px,skirt,tan){const poly=r.outline_px.map(px),n=poly.length,keep=new Array(n).fill(false);
 for(const e of (r.keep_edges||[]))if(e>=0&&e<n)keep[e]=true;
 let x0=1e18,z0=1e18,x1=-1e18,z1=-1e18;for(const p of poly){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
 const wob=r.wobble_m==null?0:r.wobble_m,reach=r.reach_m==null?skirt+1.5*Math.max(x1-x0,z1-z0):r.reach_m,h=KRAND.child(1414,r.id||'bench');
 const B={id:r.id,kind:'bench',x:(x0+x1)/2,z:(z0+z1)/2,c:1,s:0,a:(x1-x0)/2,b:(z1-z0)/2,level:r.level_m,tan,skirt,sc:skirt/4,k:Math.max(.5,skirt*tan),
  reach,poly,keep,wob,wl:WOB_L,ox:(h%997)/9.97,oz:((h>>>10)%991)/9.91,wg:0,box:[x0-reach-wob,z0-reach-wob,x1+reach+wob,z1+reach+wob],fill:!!r.fill_only,cut:!!r.cut_only,
  dome:r.dome_m==null?0:r.dome_m,drun:r.dome_m==null?0:(r.dome_run_m==null?300:r.dome_run_m)};
 /* the coarse raster of the outline's distance (CG m) over the box */
 const gx0=B.box[0],gz0=B.box[1],gnx=Math.ceil((B.box[2]-gx0)/CG)+1,gnz=Math.ceil((B.box[3]-gz0)/CG)+1,gd=new Float32Array(gnx*gnz);
 for(let j=0;j<gnz;j++)for(let i=0;i<gnx;i++)gd[j*gnx+i]=polySD(B,gx0+i*CG,gz0+j*CG,_p);
 B.cg={x0:gx0,z0:gz0,nx:gnx,nz:gnz,d:gd};
 /* a dome's blurred depth (domeDepth): the raster's depth inside, a separable Gaussian of DOME_SIG nodes */
 if(B.dome){const K=[],r=3*DOME_SIG;let ks=0;for(let t=-r;t<=r;t++){const e=Math.exp(-t*t/(2*DOME_SIG*DOME_SIG));K.push(e);ks+=e;}
  const A=new Float32Array(gnx*gnz),T=new Float32Array(gnx*gnz);for(let k=0;k<gd.length;k++)A[k]=gd[k]<0?-gd[k]:0;
  for(let j=0;j<gnz;j++)for(let i=0;i<gnx;i++){let s=0;for(let t=-r;t<=r;t++){const ii=Math.min(gnx-1,Math.max(0,i+t));s+=A[j*gnx+ii]*K[t+r];}T[j*gnx+i]=s/ks;}
  for(let j=0;j<gnz;j++)for(let i=0;i<gnx;i++){let s=0;for(let t=-r;t<=r;t++){const jj=Math.min(gnz-1,Math.max(0,j+t));s+=T[jj*gnx+i]*K[t+r];}A[j*gnx+i]=s/ks;}
  B.dd=A;}
 /* the wander's gradient bound: wob w^2 n, |grad| <= wob (|grad n| + 2 |grad w|) with |grad w| <= 1.5 / (KEEP_F1 - KEEP_F0)
    (a smoothstep's steepest); |grad n| sampled over a WG_SPAN square of the record's own noise round its middle (wgSample), a
    sixth over. A record may state the sample (wg_n: core/world/landform_wg.js writes it, so a page does not sample 23k points
    a record at load); WLAND.check samples it again and fails a stated value that differs */
 if(wob>0){const G=r.wg_n!=null?r.wg_n:wgSample(B);B.wgN=G;B.wgStated=r.wg_n!=null;B.wg=wob*(G*1.15+3/(KEEP_F1-KEEP_F0));}
 return B;}
function wgSample(B){let G=0;for(let x=B.x-WG_SPAN/2;x<=B.x+WG_SPAN/2;x+=WG_STEP)for(let z=B.z-WG_SPAN/2;z<=B.z+WG_SPAN/2;z+=WG_STEP){const e=wobN(B,x,z);G=Math.max(G,Math.hypot(wobN(B,x+1,z)-e,wobN(B,x,z+1)-e));}
 return G;}

// ---------------------------------------------------------------- the pancake domes
// DOME_TOP: flat to this share of the radius, then the wall (edit_518's DOME_TOP, DOME_EDGE = 0.72, 1.0)
const DOME_TOP=.72;
function domeStamp(D,x,z,h){const d=Math.hypot(x-D.x,z-D.z);if(d>=D.r)return h;
 const t=D.top-(D.top-h)*smooth(DOME_TOP,1,d/D.r);return t>h?t:h;}
function domeFind(x,z){for(const D of api.domes)if(Math.hypot(x-D.x,z-D.z)<D.r)return D;return null;}
function domeRec(r,xz){const R=r.r_m!=null?r.r_m:r.d_km!=null?r.d_km*500:r.radius_px!=null?r.radius_px*2000:null,
  top=r.top_m!=null?r.top_m:r.base_m!=null&&(r.h_m!=null||r.relief_m!=null)?r.base_m+(r.h_m!=null?r.h_m:r.relief_m):null;
 return R>0&&top!=null?{id:r.id,kind:'pancake_dome',name:r.name||null,x:xz[0],z:xz[1],r:R,top,base:r.base_m==null?null:r.base_m}:null;}

// built before 41's init (the hook must be in place when 41 lifts its towns), so the pixels are read on the region's frame
// here, not through WORLD.fromPx: x = (px - cx) * 2 km, z = (py - cy) * 2 km
function build(){const R=WORLD_DATA.meta.landforms||[],O=WORLD_DATA.meta.frame.origin_px,px=(p)=>[(p[0]-O[0])*2000,(p[1]-O[1])*2000];
 api.list.length=0;api.waters.length=0;api.benches.length=0;api.domes.length=0;api.skipped.length=0;
 const shelves=new Set(R.filter(r=>r.kind==='shelf').map(r=>r.of));
 for(const r of R){
  if(r.kind==='water'){if(r.form==='river')continue;   // 41's named river (and a town's own) carries it
   let o=null;
   if(r.form==='page'&&r.parts)o={form:'page',parts:r.parts.map(P=>({a:px(P.px),b:P.px_to?px(P.px_to):null,r:P.r_m})),k:r.smin_m==null?210:r.smin_m,pad:0};
   else if((r.form==='narrows'||r.form==='strait')&&r.path_px){const path=r.path_px.map(px),cum=[0];for(let i=1;i<path.length;i++)cum.push(cum[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));
    o={form:r.form,path,cum,len:cum[cum.length-1],half:r.width_m/2,k:Math.min(210,r.width_m/2),bed:r.bed_m==null?null:r.bed_m};}
   if(!o){api.skipped.push({id:r.id,kind:r.kind+'/'+r.form});continue;}
   o.id=r.id;o.water=r.water_m;o.shelf=shelves.has(r.id)||(r.form!=='page'&&shelves.size>0);o.depth=r.bed_m!=null?r.water_m-r.bed_m:20;
   const pts=o.form==='page'?o.parts.flatMap(P=>[[P.a[0]-P.r,P.a[1]-P.r],[P.a[0]+P.r,P.a[1]+P.r]].concat(P.b?[[P.b[0]-P.r,P.b[1]-P.r],[P.b[0]+P.r,P.b[1]+P.r]]:[])):o.path.flatMap(p=>[[p[0]-o.half,p[1]-o.half],[p[0]+o.half,p[1]+o.half]]);
   const m=REACH_W+250;o.box=[Math.min(...pts.map(p=>p[0]))-m,Math.min(...pts.map(p=>p[1]))-m,Math.max(...pts.map(p=>p[0]))+m,Math.max(...pts.map(p=>p[1]))+m];
   api.waters.push(o);continue;}
  if(r.kind==='shelf')continue;   // read with the water it names
  if(r.kind==='bench'){if(!(((r.outline_px&&r.outline_px.length>=3)||(r.w_m>0&&r.l_m>0))&&r.level_m!=null)){api.skipped.push({id:r.id,kind:'bench (no outline_px or w_m and l_m, or no level_m)'});continue;}
   api.benches.push(benchRec(r,r.x!=null?[r.x,r.z]:px([r.px,r.py]),px));continue;}
  if(r.kind==='pancake_dome'){const D=domeRec(r,r.x!=null?[r.x,r.z]:px(Array.isArray(r.px)?r.px:[r.px,r.py]));
   if(!D){api.skipped.push({id:r.id,kind:'pancake_dome (no d_km, r_m or radius_px, or no top_m or base_m with h_m)'});continue;}
   api.domes.push(D);continue;}
  if(!KINDS[r.kind]){api.skipped.push({id:r.id,kind:r.kind});continue;}
  const xz=r.x!=null?[r.x,r.z]:px([r.px,r.py]),h=KRAND.child(1414,r.id||r.kind);   // the record's own noise offset, by its id
  api.list.push({id:r.id,kind:r.kind,x:xz[0],z:xz[1],r:r.r_m,crest:r.crest_m,water:r.water_m,ox:(h%997)/9.97,oz:((h>>>10)%991)/9.91});}}
const base=W.init;
W.init=function(R){build();
 if(api.list.length||api.waters.length||api.benches.length||api.domes.length){const prev=W.landHook;
  // the benches last: a terrace is level whatever the water, the islands and the domes did under it
  W.landHook=(x,z,h,mw)=>{if(prev)h=prev(x,z,h,mw);if(api.waters.length)h=waterStamp(x,z,h);const L=find(x,z);if(L)h=stamp(L,x,z,h);
   for(let i=0;i<api.domes.length;i++)h=domeStamp(api.domes[i],x,z,h);
   for(let i=0;i<api.benches.length&&i<=benchUpTo;i++)h=benchStamp(api.benches[i],x,z,h);return h;};}
 base(R);};
api.at=(x,z)=>find(x,z);
api.wgSample=B=>wgSample(B);   /* a wandering bench's |grad n|, sampled (core/world/landform_wg.js states it in the record) */
api.benchAt=(x,z)=>benchFind(x,z);
api.benchD=(B,x,z)=>benchD(B,x,z);   /* m off bench B's level ground (0 on it): its rectangle, or its outline as it wanders */
api.domeAt=(x,z)=>domeFind(x,z);
api.waterAt=(x,z)=>{const F=wField(x,z);return F?{s:F.s,id:F.id}:null;};

// ---------------------------------------------------------------- the checks
const inTown=(x,z)=>(W.towns||[]).some(t=>Math.hypot(x-t.x,z-t.z)<t.R+t.band);
function islandCheck(L){const top=W.Hbare(L.x,L.z),far=W.Hbare(L.x+L.r*2.2,L.z),dirs=[0,1,2,3,4,5,6,7].map(k=>[Math.cos(k*Math.PI/4),Math.sin(k*Math.PI/4)]);
 // the waterline: along 8 rays, where the land crosses water_m (between 0.7 r and 1.3 r: the wobble's reach)
 const wl=dirs.map(([dx,dz])=>{let a=W.Hbare(L.x,L.z)-L.water;for(let s=.02;s<=1.6;s+=.02){const b=W.Hbare(L.x+dx*L.r*s,L.z+dz*L.r*s)-L.water;if((a>0)!==(b>0))return +s.toFixed(2);a=b;}return null;});
 const land=L.crest>L.water;
 return{id:L.id,kind:L.kind,crest:L.crest,top:+top.toFixed(1),far:+far.toFixed(1),waterline:wl,inTown:inTown(L.x,L.z),
  ok:land?Math.abs(top-L.crest)<.2*(L.crest-L.water)+3&&wl.every(s=>s!==null&&s>.7&&s<1.35):top<L.water};}
// a channel record: every 200 m down its path, outside the towns and the region's edge, the centre under the water by at
// least half its bed's depth, and (a strait away from its sea end) the ground 1.5 half-widths + 300 m out on both sides
// over the water: the coarse cells closed to the channel's width
// The stamp shapes the ground only: the water over it is the model's wet cells (or a town's, inside its footprint), so a
// station counts as wet when the ground is cut under the water AND the world has water there at the record's level.
const wetAt=(R,x,z,dep)=>W.Hbare(x,z)<R.water-dep&&W.water(x,z)>R.water-.5;
function waterCheck(R){let n=0,wet=0,banks=0,dryBanks=0,firstBad=null;
 if(R.form==='page'){for(const P of R.parts){const x=P.a[0],z=P.a[1];if(inTown(x,z)||!W.inside(x,z))continue;n++;
   if(wetAt(R,x,z,1))wet++;else firstBad=firstBad||['part',Math.round(x),Math.round(z),+W.Hbare(x,z).toFixed(1),+W.water(x,z).toFixed(1)];}
  return{id:R.id,kind:'water/page',stations:n,wet,firstBad,ok:wet===n,note:n?'':'every part inside a town (WTOWN.check judges it) or outside the region'};}
 for(let s=0;s<=R.len;s+=200){let i=0;while(i<R.cum.length-2&&R.cum[i+1]<s)i++;const a=R.path[i],b=R.path[i+1],f=(s-R.cum[i])/Math.max(1e-6,R.cum[i+1]-R.cum[i]);
  const x=lerp(a[0],b[0],f),z=lerp(a[1],b[1],f);if(inTown(x,z)||!W.inside(x,z))continue;n++;
  const dep=R.bed!=null?R.water-R.bed:R.depth;if(wetAt(R,x,z,dep*.5))wet++;else firstBad=firstBad||['bed',Math.round(x),Math.round(z),+W.Hbare(x,z).toFixed(1),+W.water(x,z).toFixed(1)];
  if(R.form==='strait'&&R.len-s>TAPER){const L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L,o=R.half*1.5+300;
   for(const sg of [1,-1]){const px=x+nx*o*sg,pz=z+nz*o*sg,F=wField(px,pz);if(!W.inside(px,pz)||inTown(px,pz)||(F&&F.s<60))continue;banks++;   /* not where another water record is */if(W.Hbare(px,pz)>R.water)dryBanks++;else firstBad=firstBad||['bank',Math.round(px),Math.round(pz),+W.Hbare(px,pz).toFixed(1)];}}}
 return{id:R.id,kind:'water/'+R.form,stations:n,wet,banks,dryBanks,firstBad,ok:wet===n&&dryBanks===banks};}
// a bench: on a grid over its reach (in its own frame, step `step` m), the land with the benches and without them (the
// natural ground). Inside: the largest departure from the level. On the faces (the ground moved, outside the bench): the
// slope (over 1 m either way) against the batter, or the ground's own where that is steeper (a face only follows it there);
// the steepest face where the ground is gentler. The toe: no ground moved in the last skirt_m of the reach. The earthworks:
// cut (the natural ground over the stamped) and fill (under it), max and mean over the ground each moves, and its area
const deg=t=>+(Math.atan(t)*180/Math.PI).toFixed(1);
function slopeAt(x,z){const e=1;return Math.hypot(W.Hbare(x+e,z)-W.Hbare(x-e,z),W.Hbare(x,z+e)-W.Hbare(x,z-e))/(2*e);}
function benchCheck(B,o){const st=(o&&o.step)||Math.max(4,(B.a+B.b)/24),U=B.a+B.reach,V=B.b+B.reach,cut={max:0,sum:0,n:0},fill={max:0,sum:0,n:0};
 let inside=0,faces=0,steep=0,over=0,toeOut=0,firstBad=null,steepAt=null;const earlier=api.benches.slice(0,api.benches.indexOf(B));
 /* judged on the ground as it stood once this bench was stamped: the benches up to it and none after (a later one
    stamps over it there, rightly, and is judged on its own ground) */
 const was=benchOff,upto=benchUpTo;benchUpTo=api.benches.indexOf(B);
 try{
 for(let u=-U;u<=U+1e-9;u+=st)for(let v=-V;v<=V+1e-9;v+=st){const x=B.x+u*B.c-v*B.s,z=B.z+u*B.s+v*B.c,d=benchD(B,x,z),top=benchTop(B,BQ.in);if(d>=B.reach||!W.inside(x,z))continue;
  const h=W.Hbare(x,z);benchOff=true;const n=W.Hbare(x,z);benchOff=was;
  if(d<=0){inside=Math.max(inside,B.fill?Math.max(0,top-h):B.cut?Math.max(0,h-top):Math.abs(h-top));if(inside>1e-6)firstBad=firstBad||['inside',Math.round(x),Math.round(z),+h.toFixed(2)];}   /* fill_only: nothing under the level; what stood over it stays */
  const dh=n-h;if(dh>.01){cut.max=Math.max(cut.max,dh);cut.sum+=dh;cut.n++;}else if(dh<-.01){fill.max=Math.max(fill.max,-dh);fill.sum-=dh;fill.n++;}
  if(d<=0||Math.abs(dh)<=.01)continue;
  if(d>B.reach-B.skirt){toeOut++;firstBad=firstBad||['toe',Math.round(x),Math.round(z),+dh.toFixed(2)];}
  faces++;const s=slopeAt(x,z);benchOff=true;const sn=slopeAt(x,z);benchOff=was;
  /* the batter allowed here: this bench's, or an earlier bench's that reaches the point (that face is its own) */
  let tan=B.tan;for(const C of earlier)if(C.tan>tan&&x>=C.box[0]&&x<=C.box[2]&&z>=C.box[1]&&z<=C.box[3]&&benchD(C,x,z)<C.reach)tan=C.tan;
  if(sn<tan)steep=Math.max(steep,s);
  if(s>Math.max(tan,sn)*1.02+.01){over++;firstBad=firstBad||['steep',Math.round(x),Math.round(z),deg(s)];steepAt=steepAt||[Math.round(x),Math.round(z),deg(s),deg(sn)];}}
 }finally{benchUpTo=upto;}
 const ew=c=>({max:+c.max.toFixed(2),mean:c.n?+(c.sum/c.n).toFixed(2):0,area_m2:Math.round(c.n*st*st)});
 /* a stated wander sample (wg_n) must be the record's own: sampled again here */
 const wgBad=B.wgStated&&wgSample(B)!==B.wgN;if(wgBad)firstBad=firstBad||['wg_n',B.wgN];
 return{id:B.id,kind:'bench',level:B.level,inside:+inside.toFixed(6),batter:{asked:deg(B.tan),steepest:deg(steep),over,faces},toeOut,
  cut:ew(cut),fill:ew(fill),inTown:inTown(B.x,B.z),firstBad,steepAt,wgStated:!!B.wgStated,ok:inside<=1e-6&&over===0&&toeOut===0&&!wgBad};}
/* a dome: its top over the flat (the middle and four points at half the radius) at top_m (the ground's detail may stand a
   little over it, never under); reported, not judged: the least fall from the top to the ground at 1.1 R on 8 rays (the
   world's own ground there: the stamp raises only, as the model's edit did) */
function domeCheck(D){const dirs=[0,1,2,3,4,5,6,7].map(k=>[Math.cos(k*Math.PI/4),Math.sin(k*Math.PI/4)]);
 const flat=[[0,0],[.5,0],[-.5,0],[0,.5],[0,-.5]].map(([a,b])=>W.Hbare(D.x+a*D.r,D.z+b*D.r)),low=Math.min(...flat);
 const fall=Math.min(...dirs.map(([a,b])=>D.top-W.Hbare(D.x+a*D.r*1.1,D.z+b*D.r*1.1)));
 return{id:D.id,kind:'pancake_dome',top:D.top,flatMin:+low.toFixed(1),fallMin:+fall.toFixed(1),inTown:inTown(D.x,D.z),
  ok:low>=D.top-.01};}
api.check=(o)=>api.list.map(islandCheck).concat(api.waters.map(waterCheck),api.benches.map(B=>benchCheck(B,o)),api.domes.map(domeCheck));
return api;})();
