// ================================================================= HOST - the atmosphere (core/atmos), bound (station 5, the fan coast)
// As station 1's: core/atmos bound to the page, the foliage in its wind, alpha-to-coverage; wet ground and puddles in the hollows after
// the rare rain (core/water), the weather (the rain shadow: dry, the odd storm off the sea), height fog low over the sea and the beach.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>groundH(x,z),hour:()=>LIGHT_MODE==='night'?0:13,seed:WORLD,viewH:()=>innerHeight});
BIO.bindAtmosWind();BIO.setA2C(renderer);
const WET_HOLLOWS=WATER.hollows({h:(x,z)=>groundH(x,z),box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],cell:(TERR.X1-TERR.X0)/512,blur:25,depth:.5,
 mask:(x,z)=>FC.at(FC.a.slope,x,z)<.25&&groundH(x,z)>1?1:0});
if(GROUND)WATER.wetGround(GROUND.material,{rain:true,porosity:.4,puddles:WET_HOLLOWS});
ATMOS.bindWeather({climate:{dry:true},sun,hemi,grounds:GROUND?[GROUND.material]:[]});
ATMOS.heightFog({falloff:1/500,shape:'exp',compress:[4000,5000],sun:.35,sky:.35,mist:{density:.0005,y:6,depth:18,noise:.6}});
ATMOS.heightFogScene(scene);
ATMOS.rainCover({renderer});
