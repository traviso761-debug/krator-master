// ================================================================= HOST - the atmosphere (core/atmos), bound (station 2, the rain wall)
// As station 1's: core/atmos bound to the page, the foliage in its wind, alpha-to-coverage; wet ground and puddles in the hollows
// (core/water), the weather (the rain wall: rain most days, storm, fog), height fog thinning above the eye with CLOUD LYING ON THE LAKE and
// a broken band along the walls' upper slopes (the station is in cloud: PLAN.md section 7), the rain occlusion map.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>LIGHT_MODE==='night'?0:13,seed:WORLD,viewH:()=>innerHeight});
BIO.bindAtmosWind();BIO.setA2C(renderer);
const WET_HOLLOWS=WATER.hollows({h:(x,z)=>terrainH(x,z),box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],cell:(TERR.X1-TERR.X0)/512,blur:25,depth:.5,
 mask:(x,z)=>FC.at(FC.a.slope,x,z)<.3&&!inLake(x,z)?1:0});
if(GROUND)WATER.wetGround(GROUND.material,{rain:true,porosity:.7,puddles:WET_HOLLOWS});
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:GROUND?[GROUND.material]:[]});
ATMOS.heightFog({falloff:1/650,shape:'exp',compress:[4000,5000],sun:.35,sky:.35,
 mist:{density:.0016,y:LAKE.level+12,depth:45,noise:.75},band:{density:.0012,y:[520,700],cover:.45,noise:1}});
ATMOS.heightFogScene(scene);
ATMOS.rainCover({renderer});
