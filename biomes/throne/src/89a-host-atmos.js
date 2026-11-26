// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this page. Station 1 and the stations 2, 6 and 11 (station.json "atmosHost") share this fragment; the other stations bind in their
// own 89-host-atmos.js, with weather. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value.
// The hour is the page's sun, fixed: 13 by day, 0 in the night mode (the N key).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>LIGHT_MODE==='night'?0:13,seed:9001,viewH:()=>innerHeight});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): on the pages that list it (station 1 here in build.py; the stations
// in station.json "atmos": the savanna and the kipuka; the tube, underground, does not). The climate is WX_CLIMATE where a station's
// 45-host-stage.js names one, else station 1's: wet with ash (the plume's edge: the rift's vents and the plume overhead, rain, storms
// and ashfall). It starts clear, so the page looks as it did; the Weather selector in the panel picks the rest.
if(ATMOS.bindWeather)ATMOS.bindWeather({climate:typeof WX_CLIMATE!=='undefined'?WX_CLIMATE:{wet:true,ash:true},sun,hemi,grounds:[MAT_GROUND]});
