// ================================================================= HOST — core/atmos bound to this page  [web]
// The one-time binding (ATMOS.bindHost: the clock on TICKS, the ground, the view); the stage places the phenomena's weather on it
// and calls ATMOS.finish. The hour is the host's clock (KHOST.take), as the biome kits do it.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:10.5,seed:4410,viewH:()=>innerHeight});
