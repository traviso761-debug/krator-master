// ================================================================= HOST - the atmosphere (core/atmos), bound, and the final rebuild's air (2026-11-03)
// core/atmos's one-time init on this page's frame ticks, ground and camera (2026-10-20), so core/water and the open world's one clock can take this
// biome; the hour is the host clock's. What the final rebuild added (BACKPORT.md section 1, the air row; each look change has its switch):
//   R8 + R7      the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind; the KNOWN_ISSUES item "No core/atmos" closes); cut-outs
//                by alpha-to-coverage (89z, after the bake)
//   R1 (?hfog=0) height fog: the steam's haze low over the floors, thinning up the walls
//   R10          the rain occlusion map: no rain and no wet ground under a crown
//   R9 (?wet=1)  in the rain the ground darkens and glosses and its hollows hold puddles; off by default here (below)
//   SNOW (?snow=0) snow that lies (fx/snowcover), on the station's own line (SNOW_LINE, from its site); kept off the hot ground (89b: ATMOS.snowBare)
// THE CLIMATE (5.1, surveyed 2026-11-03): 220-439 mm a year, the weather `cold` everywhere (PLAN.md section 3).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13,seed:8106,viewH:()=>innerHeight});
if(BIO.bindAtmosWind)BIO.bindAtmosWind();
const AIR=(function(){const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,wet:false,snow:false};
 const R=TERR.R*1.05,BOX=[-R,-R,R,R],under=(x,z)=>{const w=waterH(x,z);return w>-1e8&&w>=terrainH(x,z)-.3;};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/520,sun:.3,sky:.3});ATMOS.heightFogScene(scene);out.hfog=true;}
 /* the rain's occlusion map takes a unit in every lit material: only where the ground keeps it beside the snow and the weather (85: RAIN_FITS) */
 if(ATMOS.rainCover&&RAIN_FITS){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 else if(ATMOS.rainCover)out.raincover='skipped: the ground reads '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 /* R9 on ?wet=1 only: on this page WATER.wetGround over KGROUND's Standard ground drew the whole ground black in clear weather (seen on the Arc, 2026-11-03,
    not traced; KNOWN_ISSUES.md), and at 188 mm the valley is semi-arid: the weather's own wetting (bindWeather's grounds) stays */
 if(q.get('wet')==='1'&&WATER.hollows&&WATER.wetGround&&typeof USE_KG!=='undefined'&&USE_KG){try{
  const H=WATER.hollows({h:(x,z)=>terrainH(x,z),box:BOX,cell:(BOX[2]-BOX[0])/512,blur:25,depth:.5,mask:(x,z)=>under(x,z)||FIELD.flow(x,z)>.5||FIELD.rock(x,z)>.6?0:1});
  WATER.wetGround(MAT_GROUND,{rain:true,porosity:.5,puddles:H});out.wet=true;}catch(e){reportErr('wet ground: '+e.stack);}}
 if(q.get('snow')!=='0'&&ATMOS.snowCover){ATMOS.snowCover({line:typeof SNOW_LINE!=='undefined'?SNOW_LINE:[1950,2450],lee:.45,base:0})   /* a station names its own (SNOW_LINE) */;out.snow=true;}   /* every lit material takes it after the bake (89z: snowOnScene) */
 return out;})();
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js): it starts clear, so the page looks as it did; the Weather selector in the panel picks the rest
ATMOS.bindWeather({climate:{cold:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
