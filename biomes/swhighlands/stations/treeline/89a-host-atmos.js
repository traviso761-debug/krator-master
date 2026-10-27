// ================================================================= HOST - the atmosphere (core/atmos), bound (station 6, the treeline)
// As station 1's: core/atmos bound to the page, the foliage in its wind, alpha-to-coverage; wet ground and puddles in the hollows
// (core/water: the only water here), the weather (the dry-summer upland: rain, storm, fog, snow), height fog thinning above the eye
// with cloud lying in the cirque and a broken band at the crest, the rain occlusion map.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>LIGHT_MODE==='night'?0:13,seed:WORLD,viewH:()=>innerHeight});
BIO.bindAtmosWind();BIO.setA2C(renderer);
const WET_HOLLOWS=WATER.hollows({h:(x,z)=>terrainH(x,z),box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],cell:(TERR.X1-TERR.X0)/512,blur:25,depth:.5,
 mask:(x,z)=>FC.at(FC.a.slope,x,z)<.3&&FC.at(FC.a.snow,x,z)<.4?1:0});
if(GROUND)WATER.wetGround(GROUND.material,{rain:true,porosity:.6,puddles:WET_HOLLOWS});
ATMOS.bindWeather({climate:{wet:true,cold:true},sun,hemi,grounds:GROUND?[GROUND.material]:[]});
ATMOS.heightFog({falloff:1/900,shape:'exp',compress:[4000,5000],sun:.35,sky:.35,
 mist:{density:.0008,y:CIRQUE.floor+20,depth:40,noise:.7},band:{density:.0011,y:[900,1050],cover:.35,noise:1}});
ATMOS.heightFogScene(scene);
ATMOS.rainCover({renderer});
