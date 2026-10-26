// ================================================================= HOST - the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water (WATER.drawFlow, drawStill: they need
// ATMOS.init, and for the sky in the water the skylight) can draw here. The hour is the host clock's (the shared sky reads it too).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:6,seed:10213,viewH:()=>innerHeight});
