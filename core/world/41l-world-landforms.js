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
// Any other kind is left out and named in WLAND.skipped (a new kind adds its profile here first).
//
//   WLAND.list        the stamped island records (in metres); WLAND.waters the water records
//   WLAND.skipped     [{id, kind}] the records of a kind this fragment does not know
//   WLAND.at(x,z)     the island record whose reach holds (x,z), or null
//   WLAND.waterAt(x,z) the water field there: {s (m, < 0 in the water), id (the nearest record)}, or null beyond reach
//   WLAND.check()     each record against what it asks: an island's top and waterline; a water record's channel under its
//                     water (and a strait's banks dry beside it), outside every town's footprint
var WLAND=(function(){'use strict';
const W=WORLD,lerp=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
// REACH_W: how far off a water record its shore raise reaches. It covers a whole coarse cell (2 km) and its ring: a channel
// jogs from wet cell to wet cell, so a wet cell's far side can lie 1.6 km off the line (edit_513's strait)
const KN=KRELIEF.noise(1414),REACH=1.8,SKIRT=8,REACH_W=2400,TAPER=4000;
const KINDS={island:1,islet:1,stack:1,shoal:1};
const api={list:[],waters:[],skipped:[]};
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

// built before 41's init (the hook must be in place when 41 lifts its towns), so the pixels are read on the region's frame
// here, not through WORLD.fromPx: x = (px - cx) * 2 km, z = (py - cy) * 2 km
function build(){const R=WORLD_DATA.meta.landforms||[],O=WORLD_DATA.meta.frame.origin_px,px=(p)=>[(p[0]-O[0])*2000,(p[1]-O[1])*2000];
 api.list.length=0;api.waters.length=0;api.skipped.length=0;
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
  if(!KINDS[r.kind]){api.skipped.push({id:r.id,kind:r.kind});continue;}
  const xz=r.x!=null?[r.x,r.z]:px([r.px,r.py]),h=KRAND.child(1414,r.id||r.kind);   // the record's own noise offset, by its id
  api.list.push({id:r.id,kind:r.kind,x:xz[0],z:xz[1],r:r.r_m,crest:r.crest_m,water:r.water_m,ox:(h%997)/9.97,oz:((h>>>10)%991)/9.91});}}
const base=W.init;
W.init=function(R){build();
 if(api.list.length||api.waters.length){const prev=W.landHook;
  W.landHook=(x,z,h,mw)=>{if(prev)h=prev(x,z,h,mw);if(api.waters.length)h=waterStamp(x,z,h);const L=find(x,z);return L?stamp(L,x,z,h):h;};}
 base(R);};
api.at=(x,z)=>find(x,z);
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
api.check=()=>api.list.map(islandCheck).concat(api.waters.map(waterCheck));
return api;})();
