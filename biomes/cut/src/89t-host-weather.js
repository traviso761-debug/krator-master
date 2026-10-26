// ================================================================= HOST — the weather (core/atmos: ATMOS.bindWeather)
// [web] The bowl's weather in one call (core/atmos/host/89-atmos-e-weatherhost.js): rain and storms wet the ground and grey the
// fog, sun and sky light; the Weather selector in the host's panel. The mode starts clear so the views stay what they are;
// PLAN.md section 6's day (fog on the lakes at dawn, storms most afternoons in the wet season) is the selector's to show for now.
const WX=ATMOS.bindWeather({climate:{wet:true,cold:!!STAGE.cold,frozen:false},sun,hemi:HEMI,fog:scene.fog,grounds:[GROUND.mat],mode:'clear'});
