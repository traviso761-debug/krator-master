// ================================================================= HOST - the atmosphere (core/atmos), bound (station 6, the treeline)
// As station 1's: core/atmos bound to the page, the foliage in its wind, alpha-to-coverage; wet ground and puddles in the hollows
// (core/water: the only water here), the weather (the dry-summer upland: rain, storm, fog, snow), height fog thinning above the eye
// with cloud lying in the cirque and a broken band at the crest, the rain occlusion map.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>LIGHT_MODE==='night'?0:13,seed:WORLD,viewH:()=>innerHeight});
BIO.bindAtmosWind();BIO.setA2C(renderer);
const WET_HOLLOWS=WATER.hollows({h:(x,z)=>terrainH(x,z),box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],cell:(TERR.X1-TERR.X0)/512,blur:25,depth:.5,
 mask:(x,z)=>FC.at(FC.a.slope,x,z)<.3&&FC.at(FC.a.snow,x,z)<.4?1:0});
if(GROUND)WATER.wetGround(GROUND.material,{rain:true,porosity:.6,puddles:WET_HOLLOWS});
// SNOW THAT LIES (core/atmos/fx/89-atmos-fx-snowcover.js; the owner, 2026-10-27): in a snowfall or a blizzard it builds on the
// up-facing faces of every lit material (the ground, the whorls, the bottle brushes' crowns by their bent normals, the stones) and
// melts after it stops, slower at night; deeper on the lee faces (lee .5, downwind of core/atmos's wind); none under the crowns'
// cover for the fresh fall (the rain occlusion map). Started here, before bindWeather, so it carries the lee; bindWeather drives it
if(ATMOS.snowCover){ATMOS.snowCover({frozen:false,lee:.5});ATMOS.snowOnScene(scene);
 /* the crowns' materials were compiled when the impostors were baked (88-host-build.js), before the snow's hook: compile them again */
 scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.needsUpdate=true;});});}
ATMOS.bindWeather({climate:{wet:true,cold:true},sun,hemi,grounds:GROUND?[GROUND.material]:[]});
ATMOS.heightFog({falloff:1/900,shape:'exp',compress:[4000,5000],sun:.35,sky:.35,
 mist:{density:.0008,y:CIRQUE.floor+20,depth:40,noise:.7},band:{density:.0011,y:[900,1050],cover:.35,noise:1}});
ATMOS.heightFogScene(scene);
ATMOS.rainCover({renderer});
