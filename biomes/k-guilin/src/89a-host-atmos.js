// ================================================================= HOST — the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost: core/atmos/host), so core/water
// (the lake, the wadi, the pond and the paddies: 89w) and the open world's one clock can take this biome. The hour is the
// host clock's; the shared sky reads it too (89s-host-sky.js). The weather is bound in 89s, after the clouds' shade.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:10,seed:5151,viewH:()=>innerHeight});
