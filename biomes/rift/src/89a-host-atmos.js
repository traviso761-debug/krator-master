// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>13,seed:8108,viewH:()=>innerHeight});
// R8: the foliage sways in core/atmos's wind and its travelling gusts (one wind field: BIO.bindAtmosWind); R7: leaf and grass cut-outs by
// alpha-to-coverage when the canvas has MSAA (BIO.setA2C; the alpha test stays without it). Both before the first frame.
BIO.bindAtmosWind();BIO.setA2C(renderer);
// WET GROUND AND PUDDLES (R9, core/water 51 WATER.wetGround and WATER.hollows): in the rain the floor darkens and glosses and its local dips
// hold puddles ringed by the drops. The mask is baked from terrainH over the map's square (512 x 512 cells of ~15 m; a 30 m blur finds the
// hollows, not the trough); none in the lake or its wet rim, the streams' channels, or on the ridge's faces (too steep to hold one).
const WET_R=TERR.R*1.1;
const WET_HOLLOWS=WATER.hollows({h:(x,z)=>terrainH(x,z),box:[-WET_R,-WET_R,WET_R,WET_R],cell:WET_R*2/512,blur:30,depth:.6,
 mask:(x,z)=>{if(lakeIn(x,z)<40||streamD(x,z)<14)return 0;return smooth(1.0,.6,FC.at(FC.a.slope,x,z));}});
WATER.wetGround(MAT_GROUND,{rain:true,porosity:.7,puddles:WET_HOLLOWS});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): wet: the rift valley's floor and walls, rain and storms. It starts clear, so the page looks as it did;
// the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// HEIGHT FOG (R1, core/atmos/sky/89-atmos-j-fog.js + host/89-atmos-j-heightfog.js): the page's fog is the air's up to the ground under
// the eye and thins above it (the crest and the mesas stand clear of the trough's haze; the trough's air is thick, 1.9 bar); the dawn mist
// pools over the algal lake, the shore and the streams' mouths (below 25 m: the trough floor is at 0-10 m), and a broken band of cloud hangs
// on the ridge's south face at the cloud forest's benches (210-320 m: the cloud forest's own mist field, made visible)
ATMOS.heightFog(STATION_PAGE.fog||{falloff:1/700,sun:.35,sky:.35,mist:{density:.0008,y:25,depth:22,noise:.7},band:{density:.0010,y:[210,320],cover:.32,noise:1}});   /* STATION_PAGE.fog: a station's own (its cloud band at its height) */
ATMOS.heightFogScene(scene);
// THE RAIN OCCLUSION MAP (R10, core/atmos/fx/89-atmos-fx-raincover.js): no rain, wet or puddles under the jungle's and the cloud forest's crowns
ATMOS.rainCover({renderer});
