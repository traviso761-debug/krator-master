// ================================================================ DAM BASINS — the weather (core/atmos: ATMOS.bindWeather)
// [web] The bed's weather in one call (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26), after the kit's ATMOS.init (90-scene.js):
// dry: the drained beds lie in n semiarid's steppe (median ~410 mm), rain rare, so the fog and the rain's haze go the colour of dust
// and the ground never wets. The sun and the sky light are the kit's (setNight in 92-camera.js swings them; the binding follows).
// It starts clear, so the page looks as it did; the Weather selector (in #ui) picks the rest.
ATMOS.bindWeather({climate:{dry:true,dust:[.76,.71,.62]},sun,hemi});
// the wind setting's share after the weather's write (91c, DB_WIND.k; 2026-11-03): the weather's hook is registered here, after 91c's, and writes
// ATMOS.windScale outright each tick, so the share is applied once more behind it
if(typeof DB_WIND!=='undefined'&&DB_WIND.apply)ATMOS.hook(()=>DB_WIND.apply());
