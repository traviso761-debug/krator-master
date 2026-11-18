// ================================================================= THE OIDONG VALLEY AND THE HIGH RIFT — the High Rift kit in an open world
// [G data] core/world reads a kit as {SPECIES, PASSES, zones, make, grow} for its trees (85-world-flora.js) and as
// buildFloor(R, q) for its floor (84-world-nursery.js grows a 32 m patch under a field profile; 86-world-floor.js tiles the
// patches by the kit's floor.pick(x, z)). The High Rift kit (biomes/highrift) has no trees and no pass table: its life is a
// station function, HRIFT.buildRift(R, q, {heat, acid, grass}), that reads the ground's temperature and acid from its
// station's host (KTHERM's bake round the vents). This presents it to the world as a floor-only kit:
//   HRIFT_WORLD.highrift   no species of its own (the world's flora pass grows none), buildFloor runs HRIFT.buildRift on
//                          the patch with the profile's heat and acid (the nursery's profile carries `hrheat`, `hracid`)
//   (the floor's four grounds, cold, graben, warm and hot, are field profiles in 47-world-kits.js: WORLD_KITS is read
//   before the kits load)
//   HRIFT_WORLD.pick(x, z) the weights at a point: hot within ~500 m of a vent of the region (WORLD_DATA.meta.vents), warm
//                          out to ~2.5 km, the graben where the world is mild (WORLD.temp over 6 degC), cold elsewhere
// The bladed quartz (HRIFT.combs) wants fissure walls the world does not model: not grown here (PLAN.md section 4). The
// kit's own world fragment belongs in biomes/highrift; it lives here until that kit's session takes it, because a new
// fragment in its src/ would change its pages.
var HRIFT_WORLD=(function(){'use strict';
const VENTS=((WORLD_DATA.meta.vents)||[]).map(v=>{const F=WORLD_DATA.meta.frame;return{x:(v.px[0]-F.origin_px[0])*2000,z:(v.px[1]-F.origin_px[1])*2000,r:(v.radius==null?1.5:v.radius)*400};});
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const field=(n,d)=>(x,z)=>{const v=BIO.field(n,x,z);return v==null?d:v;};
const highrift={name:'highrift',SPECIES:[],PASSES:[],zones:()=>({}),make:()=>null,grow:()=>null,
 buildFloor:(R,q)=>HRIFT.buildRift(R,q,{heat:field('hrheat',4),acid:field('hracid',0),grass:BIO.field('hrgrass',0,0)==null?1:BIO.field('hrgrass',0,0)})};
function pick(x,z){let d=1e18,r=400;for(const V of VENTS){const e=Math.hypot(x-V.x,z-V.z);if(e<d){d=e;r=V.r;}}
 const hot=1-sm(r*.6,r*1.3,d),warm=(1-sm(r*2,r*6,d))*(1-hot),rest=Math.max(0,1-hot-warm),mild=sm(4,8,WORLD.temp(x,z));
 return{hot,warm,graben:rest*mild,cold:rest*(1-mild)};}
return{highrift,pick,VENTS};})();
