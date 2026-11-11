// ================================================================= HOST - the atmosphere (core/atmos), bound, and the final rebuild's air (every station)
// core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water and the open world's one clock can take this biome; the hour is
// the host clock's. The air row of BACKPORT.md section 1, each look change with its switch:
//   R8 + R7      the foliage sways in core/atmos's wind (BIO.bindAtmosWind); cut-outs by alpha-to-coverage (89z, after the bake)
//   R1 (?hfog=0) height fog: the steam and the cold air pooled over the valley floor and the tarn, thinning up the slopes
//   R10          the rain occlusion map: no rain under the pines
//   SNOW (?snow=0) snow that lies (fx/snowcover), its line the station's (SITE.snowLine); on Mons bare round the vents (ATMOS.snowBare on KTHERM's
//                mask: the ground's heat, 47)
// R9 (wet ground and puddles) is not taken: Oidong found WATER.wetGround over KGROUND's Standard ground drew it black (its KNOWN_ISSUES.md); the weather's
// own wetting of the ground stays.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13,seed:8109,viewH:()=>innerHeight});
if(BIO.bindAtmosWind)BIO.bindAtmosWind();
const AIR=(function(){const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,wet:false,snow:false,bare:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/420,sun:.3,sky:.3});ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 if(q.get('snow')!=='0'&&ATMOS.snowCover){ATMOS.snowCover({line:SITE.snowLine,lee:.45,base:0});out.snow=true;
  if(SITE.iceAt&&ATMOS.snowBare){try{ATMOS.snowBare(THERM.snowMask({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8,t0:SOIL+6,soft:4}));out.bare=true;}catch(e){reportErr('snow bare: '+e.stack);}}}
 return out;})();
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js): it starts clear; the Weather selector in the panel picks the rest
ATMOS.bindWeather({climate:{cold:!SITE.tarn},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:GROUND_MESHES.map(m=>m.material).filter((m,i,a)=>a.indexOf(m)===i)});
