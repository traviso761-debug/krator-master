// ================================================================= HOST - the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost, core/atmos/host/), so core/water
// (WATER.draw, drawFlow: they need ATMOS.init, and for the sky in the water the skylight) and the shared sky can draw here.
// The hour is the host clock's (the shared sky reads it too: 89s-host-sky.js).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:16.8,seed:8902,viewH:()=>innerHeight});
