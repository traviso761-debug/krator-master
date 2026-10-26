// ================================================================= HOST - the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water (WATER.drawFlow, drawStill: they need
// ATMOS.init, and for the sky in the water the skylight) can draw here. The hour is the host clock's (the shared sky reads it too).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:6,seed:10213,viewH:()=>innerHeight});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): wet: a tropical savanna (Aw) on the climb, wet season and dry, the rains wrung from the lake air at the foot. It starts clear, so the page looks as it did;
// the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi:HEMI,grounds:[GROUND_MESH&&GROUND_MESH.material]});
