// ================================================================= HOST - the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost), so core/water (the creek, the rain pools:
// WATER.drawFlow, stillMaterial need ATMOS.init, and for the sky in the water the skylight in 89w-host-water.js) and the open world's one
// clock can take this biome. The binding alone draws nothing (ATMOS.root is an empty group). The module's hour is the world hour
// (89n-host-night.js: the panel's slider, ?hour=; 13 by default), read each frame.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>NIGHT.hourNow,seed:4747,viewH:()=>innerHeight});
