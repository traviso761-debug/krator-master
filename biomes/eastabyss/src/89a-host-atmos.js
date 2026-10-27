// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>13,seed:8109,viewH:()=>innerHeight});
// R8: the foliage sways in core/atmos's wind and its travelling gusts (one wind field); R7: leaf and grass cut-outs by
// alpha-to-coverage where the canvas has MSAA (the alpha test stays without it). Both before the first frame (2026-10-27).
BIO.bindAtmosWind();BIO.setA2C(renderer);
const ATQ=new URLSearchParams(location.search);
// WET GROUND AND PUDDLES (R9, core/water 51 WATER.wetGround and WATER.hollows, 2026-10-27): in the rain the basin floor darkens and
// glosses, and its local dips hold puddles ringed by the drops; the mask is baked from terrainH over the painted square (512 x 512
// cells of 14.6 m; a 30 m blur finds the hollows, not the basin), none in the lake, the marsh pools or the rivers (their own water).
// Before bindWeather, whose own wetGround call then only fills in its options
const WET_HOLLOWS=WATER.hollows({h:(x,z)=>terrainH(x,z),box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:TERR.R*2.2/512,blur:30,depth:.5,
 mask:(x,z)=>terrainH(x,z)<.6||riverD(x,z)<34?0:1});
WATER.wetGround(MAT_GROUND,{rain:true,porosity:.8,puddles:WET_HOLLOWS});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): wet: the abyss's lake-fed jungle and savanna, rain and storms. It starts clear, so the page looks as it did;
// the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// HEIGHT FOG (R1, core/atmos/sky/89-atmos-j-fog.js + host/89-atmos-j-heightfog.js, 2026-10-27): the air's fog up to the ground under the
// eye, thinning above it (the shelf foot's views stand clear of the basin's haze, the views from above the marsh look down into it);
// the dawn mist pools over the lake, the marsh and its pools (below 9 m: the basin floor lies 1-2 m over the water). The abyss's
// air is ~2 atm and humid, so its falloff is long (1/900 over a relief of 200 m).
// THE ABYSS'S MIST (BACKPORT.md's row, the fog belt, 2026-10-27; ?belt=0 to compare): the lake's wet air carried east by the
// wind and lifted up the shelf foot condenses as a broken belt of cloud lying on the slope (70-190 m), thicker on the faces the
// wind climbs (from the lake, the west), thinning where the savannah rises through it; it clings within 40 m of the ground
ATMOS.heightFog({falloff:1/900,sun:.35,sky:.35,mist:{density:.0016,y:9,depth:14,noise:.7}});
if(ATQ.get('belt')!=='0')window._belt=ATMOS.fogBelt({y0:70,y1:200,windward:[-1,0],density:.0011,depth:40,lee:.3,rise:.5,
 extent:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.6,TERR.R*1.1],res:128,steps:8});
ATMOS.heightFogScene(scene);
// THE RAIN OCCLUSION MAP (R10, core/atmos/fx/89-atmos-fx-raincover.js): no rain, wet ground or rings under the jungle's crowns
ATMOS.rainCover({renderer});
