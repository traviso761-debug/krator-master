// ================================================================= HOST - the atmosphere (core/atmos), bound (station 4, the pillar rim)
// As station 1's: core/atmos bound to the page, the foliage in its wind, alpha-to-coverage; wet ground and puddles in the floor's
// hollows (core/water), the weather (the tableland's edge: rain, storm, fog), height fog thinning above the eye with mist lying round
// the towers' tops (refs/01) and a thin band on the floor at dawn, the rain occlusion map.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>groundH(x,z),hour:()=>LIGHT_MODE==='night'?0:13,seed:WORLD,viewH:()=>innerHeight});
BIO.bindAtmosWind();BIO.setA2C(renderer);
const WET_HOLLOWS=WATER.hollows({h:(x,z)=>groundH(x,z),box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],cell:(TERR.X1-TERR.X0)/512,blur:25,depth:.5,
 mask:(x,z)=>FC.at(FC.a.slope,x,z)<.3&&FC.at(FC.a.floor,x,z)>.5?1:0});
if(GROUND)WATER.wetGround(GROUND.material,{rain:true,porosity:.6,puddles:WET_HOLLOWS});
ATMOS.bindWeather({climate:{wet:true,cold:false},sun,hemi,grounds:GROUND?[GROUND.material]:[]});
ATMOS.heightFog({falloff:1/700,shape:'exp',compress:[4000,5000],sun:.35,sky:.35,
 mist:{density:.0007,y:6,depth:14,noise:.7},band:{density:.0014,y:[200,300],cover:.5,noise:1}});   /* the band: the mist round the towers' tops */
ATMOS.heightFogScene(scene);
ATMOS.rainCover({renderer});
