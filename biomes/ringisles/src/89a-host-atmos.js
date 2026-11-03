// ================================================================= HOST - the atmosphere (core/atmos), bound, and the final rebuild's air (2026-11-03, pair 8)
// core/atmos's one-time init on this page's frame ticks, ground and camera (it was in 89w-host-sea.js, an ATMOS.init of its own); the hour is the host clock's,
// which the shared sky draws (89-host-sky.js). What the final rebuild added (BACKPORT.md section 1, the air row, and ringisles' row: "fog belt (sea fog)"):
//   R8 + R7       the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind); cut-outs by alpha-to-coverage (89zz, after the bake)
//   R1 (?hfog=0)  height fog: the sea haze of a 1.9 atm shore, thick on the water and the strand and thinning up the mountain, with a low mist over the
//                 lagoon and the reef in the morning. The island is at the sea's level and its peak at ~190 m: the haze's falloff is the Throne's isle's
//   R10           the rain occlusion map (no rain under a crown): 89zz-host-core.js, which counts the ground's texture units first
//   R9            the sand already drinks the swash and the rain (WATER.wetGround on the sea's surface, 89w): no second wet layer
const ATMOS_AIR={falloff:1/700,sun:.32,sky:.38,mist:{density:.0010,below:14,depth:10,noise:.7}};
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),seed:5303,viewH:()=>innerHeight,
 hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13});
if(BIO.bindAtmosWind)BIO.bindAtmosWind();
