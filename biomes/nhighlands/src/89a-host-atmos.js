// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13 by day, 0 in the night mode); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>LIGHT_MODE==='night'?0:13,seed:8102,viewH:()=>innerHeight});
// R8: the foliage sways in core/atmos's wind and its travelling gusts (one wind field: BIO.bindAtmosWind); R7: leaf and grass
// cut-outs by alpha-to-coverage when the canvas has MSAA (BIO.setA2C; the alpha test stays without it). Both before the first frame.
BIO.bindAtmosWind();BIO.setA2C(renderer);
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): a wet upland (rain, storms, fog); it starts clear, so the
// page looks as it did until the Weather selector picks one. The shared sky (89-host-sky.js) drives the fog and the light; the
// binding gives it the weather's look and runs its fog law on the hour's fog (they compose, whichever binds first)
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:GROUND?[GROUND.material]:[]});
// HEIGHT FOG (R1, core/atmos/sky/89-atmos-j-fog.js + host/89-atmos-j-heightfog.js): the page's fog is the air's up to the ground
// under the eye and thins above it (the crest and the range's snow stand clear of the valley haze); the dawn mist pools in the
// lower old growth and the stream's lower valley (below 260 m, the NW corner); a broken band of cloud hangs just over the crest.
// The page's fog chunk is exponential and compresses past 4 km (82-host-sky.js): the same shape here
ATMOS.heightFog({falloff:1/850,shape:'exp',compress:[4000,5000],sun:.35,sky:.35,
 mist:{density:.0012,y:260,depth:45,noise:.7},band:{density:.0016,y:[1560,1720],cover:.38,noise:1}});
ATMOS.heightFogScene(scene);
// THE RAIN OCCLUSION MAP (R10, core/atmos/fx/89-atmos-fx-raincover.js): no rain, wet or fresh snow under the old growth's crowns
ATMOS.rainCover({renderer});
