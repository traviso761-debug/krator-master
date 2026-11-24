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
//                            on any slope gentler than the batter (WLAND.check reports it when not)
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
// B's frame at (x,z): u along the long side, v across; d (m) off the rectangle (0 inside, Euclidean round the corners)
function benchD(B,x,z){const dx=x-B.x,dz=z-B.z,u=Math.abs(dx*B.c+dz*B.s)-B.a,v=Math.abs(-dx*B.s+dz*B.c)-B.b;
 return u<=0&&v<=0?0:Math.hypot(Math.max(u,0),Math.max(v,0));}
// the stamped ground of bench B at (x,z) over the land h. The batter's allowance m(d): how far from the level the ground may
// stand d m off the edge (0 at the edge, rising at the batter's slope, its crest rounded over B.sc); the ground's own
// offset from the level is drawn into it by a smooth minimum of k (B.k: the toe rounded over about skirt_m), whose two
// weights sum to 1, so the face's slope is never steeper than the batter's or the ground's own
let benchOff=false;   /* WLAND.check reads the ground without the benches */
function benchStamp(B,x,z,h){if(benchOff||x<B.box[0]||x>B.box[2]||z<B.box[1]||z>B.box[3])return h;
 const d=benchD(B,x,z);if(d>=B.reach)return h;
 if(d<=0)return B.level;
 const e=h-B.level,m=B.tan*(d<B.sc?d*d/(2*B.sc):d-B.sc/2);if(Math.abs(e)<=m-B.k)return h;   /* past the toe: the ground as it was */
 const f=Math.max(0,smin(Math.abs(e),m,B.k)),t=B.level+(e<0?-f:f);
 return d<=B.reach-B.skirt?t:lerp(t,h,smooth(B.reach-B.skirt,B.reach,d));}
function benchFind(x,z){for(const B of api.benches)if(x>=B.box[0]&&x<=B.box[2]&&z>=B.box[1]&&z<=B.box[3]&&benchD(B,x,z)<B.reach)return B;return null;}
function benchRec(r,xz){const rot=(r.rotation||0)*Math.PI/180,skirt=r.skirt_m==null?30:r.skirt_m,
  tan=r.batter_deg!=null?Math.tan(r.batter_deg*Math.PI/180):1/(r.batter_run_m==null?1.5:r.batter_run_m),
  a=r.l_m/2,b=r.w_m/2,reach=r.reach_m==null?skirt+1.5*Math.max(r.l_m,r.w_m):r.reach_m,R=Math.hypot(a,b)+reach;
 return{id:r.id,kind:'bench',x:xz[0],z:xz[1],c:Math.cos(rot),s:Math.sin(rot),a,b,level:r.level_m,tan,skirt,sc:skirt/4,k:Math.max(.5,skirt*tan),
  reach,box:[xz[0]-R,xz[1]-R,xz[0]+R,xz[1]+R]};}

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
  if(r.kind==='bench'){if(!(r.w_m>0&&r.l_m>0&&r.level_m!=null)){api.skipped.push({id:r.id,kind:'bench (no w_m, l_m or level_m)'});continue;}
   api.benches.push(benchRec(r,r.x!=null?[r.x,r.z]:px([r.px,r.py])));continue;}
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
   for(let i=0;i<api.benches.length;i++)h=benchStamp(api.benches[i],x,z,h);return h;};}
 base(R);};
api.at=(x,z)=>find(x,z);
api.benchAt=(x,z)=>benchFind(x,z);
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
 let inside=0,faces=0,steep=0,over=0,toeOut=0,firstBad=null;
 const was=benchOff;
 for(let u=-U;u<=U+1e-9;u+=st)for(let v=-V;v<=V+1e-9;v+=st){const x=B.x+u*B.c-v*B.s,z=B.z+u*B.s+v*B.c,d=benchD(B,x,z);if(d>=B.reach||!W.inside(x,z))continue;
  const h=W.Hbare(x,z);benchOff=true;const n=W.Hbare(x,z);benchOff=was;
  if(d<=0){inside=Math.max(inside,Math.abs(h-B.level));if(inside>1e-6)firstBad=firstBad||['inside',Math.round(x),Math.round(z),+h.toFixed(2)];}
  const dh=n-h;if(dh>.01){cut.max=Math.max(cut.max,dh);cut.sum+=dh;cut.n++;}else if(dh<-.01){fill.max=Math.max(fill.max,-dh);fill.sum-=dh;fill.n++;}
  if(d<=0||Math.abs(dh)<=.01)continue;
  if(d>B.reach-B.skirt){toeOut++;firstBad=firstBad||['toe',Math.round(x),Math.round(z),+dh.toFixed(2)];}
  faces++;const s=slopeAt(x,z);benchOff=true;const sn=slopeAt(x,z);benchOff=was;
  if(sn<B.tan)steep=Math.max(steep,s);
  if(s>Math.max(B.tan,sn)*1.02+.01){over++;firstBad=firstBad||['steep',Math.round(x),Math.round(z),deg(s)];}}
 const ew=c=>({max:+c.max.toFixed(2),mean:c.n?+(c.sum/c.n).toFixed(2):0,area_m2:Math.round(c.n*st*st)});
 return{id:B.id,kind:'bench',level:B.level,inside:+inside.toFixed(6),batter:{asked:deg(B.tan),steepest:deg(steep),over,faces},toeOut,
  cut:ew(cut),fill:ew(fill),inTown:inTown(B.x,B.z),firstBad,ok:inside<=1e-6&&over===0&&toeOut===0};}
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
