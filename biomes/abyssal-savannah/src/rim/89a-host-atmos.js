// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>13,seed:8131,viewH:()=>innerHeight});
// R8: the foliage sways in core/atmos's wind and its travelling gusts (one wind field); R7: leaf and grass cut-outs by
// alpha-to-coverage where the canvas has MSAA (the alpha test stays without it). Both before the first frame (2026-10-27).
BIO.bindAtmosWind();BIO.setA2C(renderer);
const ATQ=new URLSearchParams(location.search);
// WET GROUND AND PUDDLES (R9, core/water 51 WATER.wetGround and WATER.hollows, 2026-10-27): in the rain the litter darkens and
// glosses, and the floor's local dips hold puddles ringed by the drops; the mask is baked from terrainH over the painted square
// (512 x 512 cells of 15.5 m; a 30 m blur finds the hollows, not the swells), none in the brook's bed (its own water). A station
// passes its own mask (STATION_WET: its lake, its channels). Before bindWeather, whose own wetGround call then fills in its options
const WET_HOLLOWS=WATER.hollows({h:(x,z)=>terrainH(x,z),box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:TERR.R*2.2/512,blur:30,depth:.5,
 mask:(x,z)=>riverD(x,z)<RIVER.w?0:1});
WATER.wetGround(MAT_GROUND,{rain:true,porosity:.85,puddles:WET_HOLLOWS});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js): the monsoon savannah: drier than the jungle below, its storms in the rains. It starts clear, so the page looks as it did;
// the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:false},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// HEIGHT FOG (R1, core/atmos/sky/89-atmos-j-fog.js + host/89-atmos-j-heightfog.js, 2026-10-27): the air's fog up to the ground under the
// eye, thinning above it, so the tower's top and the canopy views look down into the forest's haze while the floor's views stay as
// they were; the morning mist pools in the floor's hollows and along the brook (below 6 m over the floor's mean). The air is ~1.9 atm
// and saturated, so its falloff is long (1/700 over the canopy's 300 m). ?hfog=0 to compare
if(ATQ.get('hfog')!=='0'){ATMOS.heightFog({falloff:1/500,sun:.35,sky:.35,mist:{density:.0018,y:-4,depth:10,noise:.7}});ATMOS.heightFogScene(scene);}
// THE RAIN OCCLUSION MAP (R10, core/atmos/fx/89-atmos-fx-raincover.js): no rain, wet ground or rings under the crowns
ATMOS.rainCover({renderer});
