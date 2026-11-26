// ================================================================= HOST - the atmosphere (core/atmos), bound
// [web] ATMOS.bindHost (core/atmos/host/89-atmos-c-hostbind.js): core/atmos on this page's frame ticks, ground and camera, so
// core/water, its wave field, the skylight and the weather can take it. The hour is the host clock's (the shared sky reads it too).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:9,seed:(STAGE.seed|0)+4600,viewH:()=>innerHeight});
