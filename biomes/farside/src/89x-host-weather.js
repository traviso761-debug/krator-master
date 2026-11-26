// ================================================================= HOST — the weather (core/atmos: ATMOS.bindWeather)
// Farside's climate in one call: wet (3,500 mm on the coast, 2,850 in the fog belt), never cold below the heights. The
// selector in the host's panel offers auto, clear, rain, storm and fog; the page opens in the station's weather (STAGE.weather:
// clear on the coast, fog in the fog belt, where it hardly ever lifts). The rain darkens and wets the ground (on a coast
// station the sea's swash binding already carries the rain's wetness: 89w-host-water.js).
const WEATHER=ATMOS.bindWeather({climate:{wet:true},sun,hemi:HEMI,fog:scene.fog,grounds:SEA?[]:[GROUND_MAT],mode:STAGE.weather||'clear'});
