// ================================================================= OPEN WORLD — landforms under a cell, stamped at 1:1
// [G data] The scale model's 2 km cells cannot hold an islet 300 m across, so an edit records it (DATA.landforms:
// tools/scale-model/model/data/landforms.json, written by edit_512; {id, kind, px, py, r_m, crest_m, water_m, note}, the
// crest absolute) and holds its cell's bed as a shoal. extract_region.py carries the records inside a region's box into
// region.json ('landforms', with x and z in the region's frame); this fragment stamps them into the land through
// WORLD.landHook (chained onto the hook the region has when WORLD.init runs, so a region's own coast or reef keeps its
// place under it). A town's footprint is the town's ground (41 townAt comes after the hook), so a stamp under a town
// shows only in its band. No THREE, no DOM; the noise is core/terrain's KRELIEF (integer hashes).
//
// The kinds (openworld/PLAN-VOTH.md section 3, item 4):
//   island | islet | stack   the ground rises from the bed to crest_m inside r_m (r_m the waterline's radius at water_m),
//                            a skirt falling past it to the bed; the waterline wobbles by up to 12 % with noise
//   shoal                    the same with crest_m under the water: a bank, no land
// Any other kind is left out and named in WLAND.skipped (a new kind adds its profile here first).
//
//   WLAND.list        the stamped records (in metres)
//   WLAND.skipped     [{id, kind}] the records of a kind this fragment does not know
//   WLAND.at(x,z)     the record whose reach holds (x,z), or null
//   WLAND.check()     each record: the land at its centre, at r_m (the waterline), past its skirt, against what it asks
var WLAND=(function(){'use strict';
const W=WORLD,lerp=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const KN=KRELIEF.noise(1414),REACH=1.8,SKIRT=8;
const KINDS={island:1,islet:1,stack:1,shoal:1};
const api={list:[],skipped:[]};
// the waterline's radius at (x,z) for record L: r_m wobbled by up to 12 % (noise on the scale of the landform)
const radius=(L,x,z)=>L.r*(1+.24*(KN.fbm(x/(L.r*.9)+L.ox,z/(L.r*.9)+L.oz,2)-.5));
// the stamped ground of record L at (x,z) over the land h
function stamp(L,x,z,h){const d=Math.hypot(x-L.x,z-L.z);if(d>=L.r*REACH*1.15)return h;
 const u=d/radius(L,x,z);if(u>=REACH)return h;
 const rise=L.crest-L.water,cap=1-smooth(.15,1,u),t=L.water+rise*cap-SKIRT*smooth(1,1.6,u)+(KN.vn(x/45+L.ox,z/45+L.oz)-.5)*.12*Math.max(0,rise)*cap;
 return Math.max(h,lerp(h,t,1-smooth(1.3,REACH,u)));}
function find(x,z){for(const L of api.list)if(Math.hypot(x-L.x,z-L.z)<L.r*REACH*1.15)return L;return null;}
function build(){const R=WORLD_DATA.meta.landforms||[];api.list.length=0;api.skipped.length=0;
 for(const r of R){if(!KINDS[r.kind]){api.skipped.push({id:r.id,kind:r.kind});continue;}
  const xz=r.x!=null?[r.x,r.z]:W.fromPx(r.px,r.py),h=KRAND.child(1414,r.id||r.kind);   // the record's own noise offset, by its id
  api.list.push({id:r.id,kind:r.kind,x:xz[0],z:xz[1],r:r.r_m,crest:r.crest_m,water:r.water_m,ox:(h%997)/9.97,oz:((h>>>10)%991)/9.91});}}
const base=W.init;
W.init=function(R){build();
 if(api.list.length){const prev=W.landHook;W.landHook=(x,z,h,mw)=>{if(prev)h=prev(x,z,h,mw);const L=find(x,z);return L?stamp(L,x,z,h):h;};}
 base(R);};
api.at=(x,z)=>find(x,z);
api.check=()=>api.list.map(L=>{const top=W.Hbare(L.x,L.z),far=W.Hbare(L.x+L.r*2.2,L.z),dirs=[0,1,2,3,4,5,6,7].map(k=>[Math.cos(k*Math.PI/4),Math.sin(k*Math.PI/4)]);
 // the waterline: along 8 rays, where the land crosses water_m (between 0.7 r and 1.3 r: the wobble's reach)
 const wl=dirs.map(([dx,dz])=>{let a=W.Hbare(L.x,L.z)-L.water;for(let s=.02;s<=1.6;s+=.02){const b=W.Hbare(L.x+dx*L.r*s,L.z+dz*L.r*s)-L.water;if((a>0)!==(b>0))return +s.toFixed(2);a=b;}return null;});
 const land=L.crest>L.water;
 return{id:L.id,kind:L.kind,crest:L.crest,top:+top.toFixed(1),far:+far.toFixed(1),waterline:wl,
  ok:land?Math.abs(top-L.crest)<.2*(L.crest-L.water)+3&&wl.every(s=>s!==null&&s>.7&&s<1.35):top<L.water};});
return api;})();
