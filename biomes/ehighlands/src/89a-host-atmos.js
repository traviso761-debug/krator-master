// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13); the module's clock is the host's dt.
// The hour is the host clock's (the shared sky's) where the page has one, else 13 (the final rebuild: korona's line; it was pinned at 13).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock?KHOST.host.clock.hour:13,seed:8110,viewH:()=>innerHeight});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): cold: the high eastern highlands, rain below and snow that lies while it falls (ATMOS.snowCover, melting after: the air thaws). It starts clear, so the page looks as it did;
// the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{wet:true,cold:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// ================================================================= the final rebuild's air (BACKPORT.md section 1; korona's lines; pair 13, 2026-11-09)
// Each look change has its switch (KNOWN_ISSUES.md, "The final rebuild"):
//   R8          the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind); cut-outs by alpha-to-coverage after the bake (89z)
//   R1 ?hfog=0  height fog: thin, as the air is thin (falloff 1/900), the cold air pooled in the bofedal as a morning mist over its water
//   R10         the rain occlusion map: no rain or snow under an overhang (lightning rides with the weather's storm: fx/89-atmos-fx-lightning.js)
//   R9          wet ground and puddles: NOT taken (oidong's finding: WATER.wetGround over a KGROUND floor drew the ground black in clear weather);
//               the weather's own wetting (bindWeather's grounds) stays
//   no fog belt: the dry side of the wall stands above its cloud (PLAN-STATIONS.md); the wet face, station 2, would take one
BIO.bindAtmosWind();
const AIR=(function(){const Q=new URLSearchParams(location.search),out={hfog:false,raincover:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){
  const W0=Math.min(TARNL,...POOLS.map(p=>p.y));   /* the mist over the lowest water: the tarn's and the bog pools' level */
  ATMOS.heightFog({falloff:1/900,sun:.3,sky:.35,mist:{density:.0008,y:W0+6,depth:10,noise:.7}});
  ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
