// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>13,seed:8105,viewH:()=>innerHeight});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): wet: the north-west lowlands, rain (median ~970 mm) and the river fog. It starts clear, so the page looks as it did;
// the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND,MAT_MARL].filter(Boolean)});
// ================================================================= the final rebuild's air and wet (BACKPORT.md section 1, eastabyss' lines)
// R8: the foliage in core/atmos's wind and its gust fronts; R7: leaf and grass cut-outs by alpha-to-coverage on an MSAA canvas. Before the first frame
BIO.bindAtmosWind();BIO.setA2C(renderer);
// WET GROUND AND PUDDLES (R9; ?wet=0 the old ground): in the rain the floor darkens and glosses and its dips hold puddles ringed by the drops; the mask at 512 cells of 12.9 m, a 28 m blur for the hollows,
// none under the water or in the gorge. The band by the water is the water's own edge: wetShare, 86-host-fields.js
if(NWQ_ON('wet')){const box=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
 WATER.wetGround(MAT_GROUND,{rain:true,porosity:.8,puddles:WATER.hollows({h:(x,z)=>terrainH(x,z),box,cell:(box[2]-box[0])/512,blur:28,depth:.5,mask:(x,z)=>WF.shore(x,z)<3||gorgeCut(x,z)>.5?0:1})});}
// HEIGHT FOG (R1; ?hfog=0 the plain fog): the air's fog at the ground under the eye, thinning above it; at dawn a mist pools over the lake, the bayou and the river (below 12 m)
// THE FOG BELT ON THE INNER WALL (BACKPORT.md's row; ?belt=0): the lake's wet air carried south-east and lifted up the range condenses as a broken belt on its faces, 450-1150 m, thin where the ridges pierce it
if(NWQ_ON('hfog')){ATMOS.heightFog({falloff:1/800,sun:.35,sky:.35,mist:{density:.0014,y:12,depth:16,noise:.7}});
 if(NWQ_ON('belt')&&ATMOS.fogBelt)window._belt=ATMOS.fogBelt({y0:450,y1:1150,windward:[-.71,-.71],density:.001,depth:60,lee:.3,rise:.5,extent:[-TERR.R*1.1,-TERR.R*1.1,11000,11000],res:128,steps:8});
 ATMOS.heightFogScene(scene);}
// THE RAIN OCCLUSION MAP (R10): no rain, wet ground or rings under the crowns
ATMOS.rainCover({renderer});
