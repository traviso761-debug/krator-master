// ================================================================= HOST — the weather (core/atmos: ATMOS.bindWeather)
// [web] The valley's weather in one call (core/atmos/host/89-atmos-e-weatherhost.js): rain and storms wet the ground and grey the fog,
// sun and sky light; the Weather selector in the host's panel. The mode starts clear so the views stay what they are; the lake's steam
// and the valley's air (PLAN.md section 8) are a later pass on core/atmos.
const WX=ATMOS.bindWeather({climate:{wet:true,cold:false,frozen:false},sun,hemi:HEMI,fog:scene.fog,grounds:[GROUND.mat],mode:'clear'});
