// ================================================================= HOST - the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water (the sea, the streams: they need
// ATMOS.init, and for the sky in the water the skylight), the shared sky and the weather can take it. The hour is the host
// clock's (the shared sky reads it too: 89s-host-sky.js); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:6,seed:STAGE.seed,viewH:()=>innerHeight});
