// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:6,seed:8104,viewH:()=>innerHeight});
// R8 (the final rebuild; nhighlands' lines): the foliage sways in core/atmos's wind and its travelling gusts; R7's alpha-to-coverage comes after the kits are built (89z)
BIO.bindAtmosWind();
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): wet: the south-west lowlands, a rainy plain. It starts clear, so the page looks as it did;
// the Weather selector in the panel picks the rest.
// WET GROUND AND PUDDLES (R9, WATER.wetGround and WATER.hollows): in the rain the ground darkens and glosses and its dips hold puddles ringed by the drops; the mask is baked
// from terrainH over the map (512 cells of 12.9 m; a 28 m blur finds the hollows), none under water, on the river or in a spring. The weather's own wetGround then only fills
// in its options (it is idempotent). ?wet=0 for the old ground
if(new URLSearchParams(location.search).get('wet')!=='0'){const B=TERR.R*1.1;
 const WET_HOLLOWS=WATER.hollows({h:(x,z)=>terrainH(x,z),box:[-B,-B,B,B],cell:2*B/512,blur:28,depth:.6,mask:(x,z)=>terrainH(x,z)<.8||riverD(x,z)<40?0:1});
 WATER.wetGround(MAT_GROUND,{rain:true,porosity:.8,puddles:WET_HOLLOWS});}
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// HEIGHT FOG (R1): the bayou's mist pools under 8 m, thin on the hills; ?hfog=0 to compare. A station sets its own (STATION_FOG). THE RAIN'S COVER (R10): no rain under the crowns
if(new URLSearchParams(location.search).get('hfog')!=='0'){const FG=typeof STATION_FOG!=='undefined'?STATION_FOG:{falloff:1/380,sun:.3,sky:.3,mist:{density:.0012,y:-1,depth:9,noise:.7}};ATMOS.heightFog(FG);ATMOS.heightFogScene(scene);}
ATMOS.rainCover({renderer});
