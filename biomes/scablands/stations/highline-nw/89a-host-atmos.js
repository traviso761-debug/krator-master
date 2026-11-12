// ================================================================= HOST - the atmosphere (core/atmos), bound (replaces the kit's 89a-host-atmos.js: no gorge, no lake, no fog belt)
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>13,seed:8107,viewH:()=>innerHeight});
// THE WEATHER: the Csa hills (~850 mm, a summer drought); it starts clear, the panel's selector picks the rest
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// R8: the foliage in core/atmos's wind and its gust fronts; R7: leaf and grass cut-outs by alpha-to-coverage on an MSAA canvas. Before the first frame
BIO.bindAtmosWind();BIO.setA2C(renderer);
// WET GROUND AND PUDDLES (R9; ?wet=0): in the rain the floor darkens and glosses and its dips hold puddles, none in the pond or on the scoured rock
if(NWQ_ON('wet')){const box=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
 WATER.wetGround(MAT_GROUND,{rain:true,porosity:.8,puddles:WATER.hollows({h:(x,z)=>terrainH(x,z),box,cell:(box[2]-box[0])/512,blur:28,depth:.5,mask:(x,z)=>WF.shore(x,z)<3||FIELD.scour(x,z)>.5?0:1})});}
// HEIGHT FOG (R1; ?hfog=0): the air's fog at the ground under the eye, thinning above it; at dawn a mist pools on the old bed (below the line)
if(NWQ_ON('hfog')){ATMOS.heightFog({falloff:1/800,sun:.35,sky:.35,mist:{density:.0011,y:HL.level-120,depth:22,noise:.7}});ATMOS.heightFogScene(scene);}
// THE RAIN OCCLUSION MAP (R10): no rain, wet ground or rings under the crowns
ATMOS.rainCover({renderer});
