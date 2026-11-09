// ================================================================= HOST — the atmosphere for the STATIONS above the scarp (core/atmos), bound
// src/89z-host-atmos.js's binding without the cloud deck: the stations stand 2.5-4 km above the hyperjungle's cloud sea, which the sky draws as
// its landmark north of the rim (89-host-sky.js). The weather is a cold upland's (core/atmos/host/89-atmos-e-weatherhost.js: snowfall and the
// blizzard join the modes; snow that lies, fx/89-atmos-fx-snowcover.js, on every lit material while it snows; STATION_AIR.snowBase the season's
// old snow, STATION_AIR.frozen for a summit's air that never melts it). It starts clear. Then the final rebuild's air as on station 1: the wind
// on the foliage, height fog (?hfog=0) with the station's own mist (STATION_AIR.mist), the rain cover; no fog belt (it is the scarp's).
ATMOS.init({THREE,scene,camera,hour:()=>11,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>FC.at(FC.a.h,x,z),seed:(STATION_LAND.seed==null?47:STATION_LAND.seed)+11,err:reportErr});
ATMOS.bindWeather({climate:{wet:true,cold:true,frozen:!!STATION_AIR.frozen},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND],snowBase:STATION_AIR.snowBase||0});
BIO.bindAtmosWind();
const AIR=(function(){const Q=new URLSearchParams(location.search),out={hfog:false,raincover:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/700,sun:.3,sky:.35,mist:STATION_AIR.mist||undefined});ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
