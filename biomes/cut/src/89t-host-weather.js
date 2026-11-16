// ================================================================= HOST — the weather (core/atmos: ATMOS.bindWeather), the height fog, the rain cover
// [web] The bowl's weather in one call (core/atmos/host/89-atmos-e-weatherhost.js): rain and storms wet the ground and grey the
// fog, sun and sky light; the Weather selector in the host's panel (the branched lightning in a storm, core/atmos/fx). The mode starts
// clear so the views stay what they are; PLAN.md section 6's day (storms most afternoons in the wet season) is the selector's to show.
// The final rebuild (pair 10, 2026-11-04; BACKPORT.md's universal set, "Sky and air"): the wet ground's puddles in the floor's hollows (WATER.hollows,
// none under the lake or in the creek's bed) before bindWeather, whose own wetGround call then only fills in its options; then HEIGHT FOG (R1) and THE
// RAIN OCCLUSION MAP (R10) after the scene is built.
const WET_HOLLOWS=(function(){try{const B=TERR.R*1.05;return WATER.hollows({h:(x,z)=>terrainH(x,z),box:[-B,-B,B,B],cell:B*2/512,blur:30,depth:.5,
 mask:(x,z)=>{if(terrainH(x,z)<WATER_LEVEL+.3)return 0;if(STAGE.creek&&STAGE.creek.d&&STAGE.creek.d(x,z)<12)return 0;return 1;}});}catch(e){reportErr('hollows: '+e.stack);return null;}})();
if(WET_HOLLOWS)WATER.wetGround(GROUND.mat,{rain:true,porosity:.8,puddles:WET_HOLLOWS});
const WX=ATMOS.bindWeather({climate:{wet:true,cold:!!STAGE.cold,frozen:false},sun,hemi:HEMI,fog:scene.fog,grounds:[GROUND.mat],mode:'clear'});
// HEIGHT FOG (core/atmos/sky/89-atmos-j-fog.js + host/89-atmos-j-heightfog.js): the page's fog is the dense air's up to the ground under the eye and thins
// above it (the walls and the lip stand out of the floor's haze). PLAN.md section 6's day, its first two lines: MIST pooling at dawn on the lake and the
// floor's hollows (station 1: below 8 m over the water, burning off by mid-morning: "fog on the lakes at dawn, cool air lying in the hollows"), and a broken
// BAND of cloud on the walls ("towers of cloud on the walls by noon": a slab at the walls' mid-height, under the lip). A station gives its own (STAGE.fog)
const HFOG=(function(){if(!ATMOS.heightFog)return null;try{const F=STAGE.fog||{falloff:1/1100,sun:.35,sky:.35,mist:{density:.0011,y:8,depth:14,noise:.65},
  band:{density:.0008,y:[3600,4600],cover:.34,noise:1}};const H=ATMOS.heightFog(F);ATMOS.heightFogScene(scene);return H;}catch(e){reportErr('height fog: '+e.stack);return null;}})();
// THE RAIN OCCLUSION MAP (core/atmos/fx/89-atmos-fx-raincover.js): no rain, wet or fresh snow under the groves' and the trees' crowns (3 m margin, the preset's)
const RAINCOVER=ATMOS.rainCover?ATMOS.rainCover({renderer}):null;
