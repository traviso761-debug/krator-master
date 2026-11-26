// ================================================================= HOST - the atmosphere (core/atmos), bound, and the final rebuild's air (2026-11-03)
// core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water (WATER.drawFlow, drawStill: they need
// ATMOS.init, and for the sky in the water the skylight) can draw here. The hour is the host clock's (the shared sky reads it too).
// What the final rebuild added (BACKPORT.md section 1, the air row; oidong's lines; each look change has its switch):
//   wind          the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind)
//   R1 (?hfog=0)  height fog: the dense air's haze thick on the foot and the floor below and thinning up the rim, so the bench stands out of it
//   R10           the rain occlusion map: no rain and no wet ground under a crown
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:6,seed:10213,viewH:()=>innerHeight});
if(BIO.bindAtmosWind)BIO.bindAtmosWind();
const AIR=(function(){const q=new URLSearchParams(location.search),out={hfog:false,raincover:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){try{ATMOS.heightFog({falloff:1/700,sun:.3,sky:.3});ATMOS.heightFogScene(scene);out.hfog=true;}catch(e){reportErr('height fog: '+e.stack);}}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): wet: a tropical savanna (Aw) on the climb, wet season and dry (5.1: ~1,240 mm at
// the foot, ~1,100 on the bench). It starts clear, so the page looks as it did; the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true},sun,hemi:HEMI,grounds:[MAT_GROUND]});
