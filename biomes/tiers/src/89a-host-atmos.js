// ================================================================= HOST - the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water and the open world's one clock can take this biome; the
// hour is the host clock's (the Great Chasm's, less its dust and shimmer: the lake tread is neither dusty nor hot; the great tread's dust storms are
// station 4's, PLAN.md section 5). What it takes:
//   R8 + R7      the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind); cut-outs by alpha-to-coverage (89z, after the bake)
//   R1 (?hfog=0) height fog: the lake's haze, thick at the water and thinning with height, so the risers stand out of it (LAND.fog)
//   R10          the rain occlusion map: no rain under a crown or an overhang
//   THE WEATHER  the land's climate (a Mediterranean shore: a dry summer, a wet winter); it opens clear, the panel's selector picks the rest
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13,seed:6111,viewH:()=>innerHeight});
BIO.bindAtmosWind();
const AIR=(function(){const q=new URLSearchParams(location.search),out={hfog:false,raincover:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog(LAND.fog||{falloff:1/700,sun:.3,sky:.3});ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
ATMOS.bindWeather({climate:LAND.climate||{dry:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:LAND.wet?[MAT_GROUND]:[]});   /* the ground takes no wet-ground maps (45: the texture units go to the four layers) */
const AIR_CONTROL=null,SHIMMER=null;   /* no air select (no dust on the lake tread) and no heat shimmer (20 degC): 99 reads both */
