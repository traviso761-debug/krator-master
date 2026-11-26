// ================================================================= HOST - the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's ticks, ground and camera (core/water draws through it, and the open world's one
// clock); the hour is the shared sky's. R8: the foliage sways in core/atmos's wind and gusts (BIO.bindAtmosWind); R7: the
// cut-outs by alpha-to-coverage when the canvas has MSAA (BIO.setA2C). Both before the first frame.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>LIGHT_MODE==='night'?0:13,seed:WORLD,viewH:()=>innerHeight});
BIO.bindAtmosWind();BIO.setA2C(renderer);
// WET GROUND AND PUDDLES (R9, core/water 51 WATER.wetGround and WATER.hollows): in the rain the ground darkens and glosses and the
// local dips hold puddles; the mask is baked from terrainH over the map (512 cells of 9.4 m; a 25 m blur finds the hollows, not
// the strike valleys); none in the water courses' beds, the sink or on the steep
const WET_HOLLOWS=WATER.hollows({h:(x,z)=>terrainH(x,z),box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],cell:(TERR.X1-TERR.X0)/512,blur:25,depth:.6,
 mask:(x,z)=>{const K=GORGE.sink;if(Math.hypot(x-K.x,z-K.z)<K.r+6)return 0;const r=streamNear(x,z);if(r&&r.d<r.w+3)return 0;return FC.at(FC.a.slope,x,z)<.35?1:0;}});
if(GROUND)WATER.wetGround(GROUND.material,{rain:true,porosity:.8,puddles:WET_HOLLOWS});
// THE WEATHER (ATMOS.bindWeather): the wet ramp (rain, storms, fog); it starts clear, the Weather selector picks one
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:GROUND?[GROUND.material]:[]});
// HEIGHT FOG (R1): the air's fog up to the ground under the eye, thinning above it; the dawn mist pools in the strike valleys and
// the gaps (below 30 m over the valley floor), and a broken band of cloud lies just over the fold crests (300-420 m)
ATMOS.heightFog({falloff:1/700,shape:'exp',compress:[4000,5000],sun:.35,sky:.35,
 mist:{density:.0011,y:30,depth:35,noise:.7},band:{density:.0012,y:[300,420],cover:.4,noise:1}});
ATMOS.heightFogScene(scene);
// THE RAIN OCCLUSION MAP (R10): no rain or wet under the lattice oaks' pads and the pillar caps
ATMOS.rainCover({renderer});
