// ================================================================= XANADU, OIDONG AND THE HIGH RIFT: the lake's small islands at 1:1
// [G data] Scale-model edit 5.1-512 (Erewhon's caldera lake, 2026-11-11) left two islands too small for its 2 km cells as
// landform records (tools/scale-model/model/data/landforms.json; build.py copies the records inside the cut into
// WORLD_DATA.landforms): the Pleasure Dome's isle, at the Erewhon page's own island (settlements/xanadu, target erewhon,
// ISLAND_C: the page's centre stands on Erehwon's pin, unturned), and a basalt stack off the west shore. This stamps them
// into the land: a record is {id, kind:'island', px, py, r_m (its shore's mean radius), rx_m, rz_m (the shore's half-axes
// east and south, r_m when absent), crest_m, water_m}. Inside the shore the ground rises from the water to the crest
// (level over the inner fifth); past it the bank falls under the water to meet the lake's bed by 1.8 times the radius.
// The shore wobbles by a few tenths of the radius, its phase from the record's place (KRAND), so no isle is an ellipse.
// Chained on WORLD.landHook (after any hook set before it), so the coast's or a town's hook keeps its own shaping.
// Below a wavelength of twice the shore's short half-axis (a far tile's spacing) the stamp is left out: a far tile would
// alias it into specks. WORLD.LANDFORMS lists the records in metres; WORLD.LANDFORMS.off=true reads the land without
// them (verify's negative).
(function(){'use strict';
const W=WORLD,D=(typeof WORLD_DATA!=='undefined'&&WORLD_DATA.landforms)||[],L=[];
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
W.LANDFORMS=L;L.off=false;
let ready=false;
/* the records in metres: the frame is set at WORLD.init, so they are placed at the first height read */
function place(){ready=true;for(const r of D){if(r.kind!=='island')continue;const c=W.fromPx(r.px,r.py),rx=r.rx_m==null?r.r_m:r.rx_m,rz=r.rz_m==null?r.r_m:r.rz_m;
 const s=KRAND.hash(0x1a4df0,Math.round(r.px*1000),Math.round(r.py*1000));
 L.push({id:r.id,x:c[0],z:c[1],rx,rz,crest:r.crest_m,water:r.water_m,p1:(s&1023)/1023*6.2832,p2:((s>>>10)&1023)/1023*6.2832,reach:1.9*Math.max(rx,rz)*1.2});}}
/* the stamped height at (x,z) over the land's h, for one record */
function stamp(I,x,z,h){const dx=x-I.x,dz=z-I.z;if(Math.abs(dx)>I.reach||Math.abs(dz)>I.reach)return h;
 const a=Math.atan2(dz,dx),q=Math.hypot(dx/I.rx,dz/I.rz)/(1+.14*Math.sin(3*a+I.p1)+.07*Math.sin(5*a+I.p2));
 if(q>=1.8)return h;
 const t=q<1?I.water+(I.crest-I.water)*(1-sm(.2,1,q)):I.water-(q-1)/.8*Math.max(3,I.water-h+2);
 return Math.max(h,t);}
const prev=W.landHook;
W.landHook=function(x,z,h,mw){if(prev)h=prev(x,z,h,mw);if(L.off)return h;if(!ready)place();
 for(let i=0;i<L.length;i++){const I=L[i];if((mw||0)>=2*Math.min(I.rx,I.rz))continue;h=stamp(I,x,z,h);}return h;};
})();
