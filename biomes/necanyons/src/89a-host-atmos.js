// ================================================================= HOST - the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost), so core/water (the creek, the rain pools:
// WATER.drawFlow, stillMaterial need ATMOS.init, and for the sky in the water the skylight in 89w-host-water.js) and the open world's one
// clock can take this biome. The binding alone draws nothing (ATMOS.root is an empty group). The module's hour is the world hour
// (89n-host-night.js: the panel's slider, ?hour=; 13 by default), read each frame.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>NIGHT.hourNow,seed:4747,viewH:()=>innerHeight});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): a wet canyon country (rain, storms, the morning fog); the
// ground wets in the rain. It starts clear, so the page looks as it did: the Weather selector in the panel picks rain or fog.
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:[MAT_GROUND]});
