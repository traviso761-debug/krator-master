// ================================================================= HOST - the atmosphere (core/atmos), bound, and the final rebuild's air (every station)
// core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water and the open world's one clock can take this biome; the hour is
// the host clock's. The air row of BACKPORT.md section 1, each look change with its switch:
//   R8 + R7      the foliage sways in core/atmos's wind (BIO.bindAtmosWind); cut-outs by alpha-to-coverage (89z, after the bake)
//   R1 (?hfog=0) height fog: the cold air pooled over the tarn and the ice, thinning up the walls
//   R10          the rain occlusion map: no rain under the seracs or a coral
//   SNOW (?snow=0) snow that lies (fx/snowcover), its line the station's (SITE.snowLine), deeper in the lee
// R9 (wet ground and puddles) is not taken: Oidong found WATER.wetGround over KGROUND's Standard ground drew it black (its KNOWN_ISSUES.md); the weather's
// own wetting of the ground stays.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13,seed:8107,viewH:()=>innerHeight});
if(BIO.bindAtmosWind)BIO.bindAtmosWind();
const AIR=(function(){const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,wet:false,snow:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/480,sun:.3,sky:.3});ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 if(q.get('snow')!=='0'&&ATMOS.snowCover){ATMOS.snowCover({line:SITE.snowLine[1]>SITE.snowLine[0]+1?SITE.snowLine:[SITE.snowLine[0]-400,SITE.snowLine[0]],lee:.45,base:0});out.snow=true;}
 return out;})();
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js): it starts clear; the Weather selector in the panel picks the rest
ATMOS.bindWeather({climate:{cold:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
