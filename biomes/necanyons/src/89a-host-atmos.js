// ================================================================= HOST - the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost), so core/water (the creek, the rain pools:
// WATER.drawFlow, stillMaterial need ATMOS.init, and for the sky in the water the skylight in 89w-host-water.js) and the open world's one
// clock can take this biome. The binding alone draws nothing (ATMOS.root is an empty group). The module's hour is the world hour
// (89n-host-night.js: the panel's slider, ?hour=; 13 by default), read each frame.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>NIGHT.hourNow,seed:4747,viewH:()=>innerHeight});
// R8: the foliage sways in core/atmos's wind and its travelling gusts (one wind field); R7: leaf and grass cut-outs by
// alpha-to-coverage where the canvas has MSAA (the alpha test stays without it). Both before the first frame (2026-10-27)
BIO.bindAtmosWind();BIO.setA2C(renderer);
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): a wet canyon country (rain, storms, the morning fog); the
// ground wets in the rain. It starts clear, so the page looks as it did: the Weather selector in the panel picks rain or fog.
/* 2026-10-26 (core/water R9): the floor wets by Lagarde's porous model (litter and sand: porosity .8) and puddles fill its hollows as W.wet climbs,
   ringed by the rain: a hollow mask baked from the floor's height over the canyon box (512 x 512 cells of 6.6 m, 256 KB; a 14 m blur finds the local dips, not the canyon floor), WATER.hollows. bindWeather's own
   wetGround call below then only fills in its options (WATER.wetGround is idempotent). */
const WET_HOLLOWS=WATER.hollows({h:(x,z)=>groundH(x,z),box:[-1700,-1700,1700,1700],cell:3400/512,blur:14,depth:.5,mask:(x,z)=>waterMask(x,z)});   /* mask: no puddle in the creek's channel (its own water) */
WATER.wetGround(MAT_GROUND,{rain:true,porosity:.8,puddles:WET_HOLLOWS});
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:[MAT_GROUND]});
