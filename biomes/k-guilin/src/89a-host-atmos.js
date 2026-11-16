// ================================================================= HOST — the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost: core/atmos/host), so core/water
// (the lake, the wadi, the pond and the paddies: 89w) and the open world's one clock can take this biome. The hour is the
// host clock's; the shared sky reads it too (89s-host-sky.js). The weather is bound in 89s, after the clouds' shade.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:10,seed:5151,viewH:()=>innerHeight});
// ================================================================= the final rebuild's air (pair 13, 2026-11-09; BACKPORT.md k-guilin's row; korona's lines)
// Each look change has its switch (PLAN.md, "Core adoption"):
//   R8          the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind); cut-outs by alpha-to-coverage after the bake (88)
//   R1 ?hfog=0  height fog: the lake's wet air thick on the plain, thinning up the towers, so each row stands paler than the one before it and a
//               view up a tower sees less haze than a level one; and THE MIST IN THE KARST VALLEYS (BACKPORT.md's "fog belt in the karst valleys"):
//               a pool over the lake and the plain between the towers, to ~14 m over the lake and thinning over 18 m above it, so the domes stand
//               out of it; it rises before dawn and burns off by mid-morning (core/atmos's default hours), thicker in the weather's fog
//   R10         the rain occlusion map: no rain under a crown or an overhang (lightning rides with the weather's storm: fx/89-atmos-fx-lightning.js)
//   R9          wet ground and puddles: NOT taken (oidong's and korona's finding: WATER.wetGround over a KGROUND floor drew the ground black in clear
//               weather, not traced); the weather's own wetting (bindWeather's grounds, 89s) stays
// Before the shared sky (89s) and the water (89w): heightFogScene hooks the lit materials standing now (the ground, the rock, the flora, the
// karst beyond); the sky and the water draw their own air
BIO.bindAtmosWind();
const AIR=(function(){const Q=new URLSearchParams(location.search),out={hfog:false,raincover:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({falloff:1/700,sun:.3,sky:.35,mist:{density:.0012,y:LAKE.level+14,depth:18,noise:.7}});
  ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
