// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>13,seed:8107,viewH:()=>innerHeight});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): wet: Xanadu's watered garden country, rain and the river fog. It starts clear, so the page looks as it did;
// the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// ================================================================= the final rebuild's air and wet (BACKPORT.md section 1 and xanadu's row; nwlowlands' lines)
// R8: the foliage in core/atmos's wind and its gust fronts (the A2C cut-outs are set after the bake, 89z)
BIO.bindAtmosWind();
// WET GROUND AND PUDDLES (R9; ?wet=0 the old ground): in the rain the floor darkens and glosses and its dips hold puddles ringed by the drops; the mask at 512 cells
// of 13.7 m, a 28 m blur for the hollows, none under the water, in the river's channel or on the crags
if(XQ_ON('wet')){const box=[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],W0=LAND.waterY||0;
 WATER.wetGround(MAT_GROUND,{rain:true,porosity:.75,puddles:WATER.hollows({h:(x,z)=>terrainH(x,z),box,cell:(box[2]-box[0])/512,blur:28,depth:.5,
  mask:(x,z)=>terrainH(x,z)<W0+.6||!LAND.mask(x,z)||FC.at(FC.a.slope,x,z)>.5?0:1})});}
// HEIGHT FOG (R1; ?hfog=0 the plain fog): the air's fog at the ground under the eye, thinning above it; at dawn a mist pools on the lake and in the river's gorge
// THE FOG BELT ON THE MOUNTAINS (BACKPORT.md xanadu's row "fog belt"; ?belt=0): the lake's wet air drawn south up the cliffs condenses as a broken belt on
// their north faces, where the kit's mist field already grows its cloud band (the cloud frills, the beard trees); a station sets LAND.belt (or null for none)
if(XQ_ON('hfog')){const BELT=LAND.belt===undefined?{y0:380,y1:860,windward:[0,-1]}:LAND.belt,W0=LAND.waterY||0;
 ATMOS.heightFog({falloff:1/700,sun:.35,sky:.35,mist:{density:.0012,y:W0+10,depth:14,noise:.7}});
 if(BELT&&XQ_ON('belt')&&ATMOS.fogBelt)window._belt=ATMOS.fogBelt({y0:BELT.y0,y1:BELT.y1,windward:BELT.windward,density:BELT.density==null?.0009:BELT.density,depth:60,lee:.3,rise:.5,
  extent:[TERR.X0*3,TERR.Z0*3,TERR.X1*3,TERR.Z1*3],res:128,steps:8});
 ATMOS.heightFogScene(scene);}
// THE RAIN OCCLUSION MAP (R10): no rain, wet ground or rings under the crowns (the branched lightning rides with the weather's storm: fx/89-atmos-fx-lightning.js)
ATMOS.rainCover({renderer});
