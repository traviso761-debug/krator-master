// ================================================================= HOST — light modes on the shared sky (2026-10-26)
// The painted dome, the giant and the LIGHTS table are gone (89-host-sky.js draws ATMOS.sky). The names the rest of the page
// reads stay, here, before the fragments that push hooks at load: LIGHT_MODE follows the sun (night below -6 degrees), the
// _onLight hooks fire on each change, and setLightMode(m) jumps the clock to that mode's hour (SKY.modes in 89-host-sky.js).
// Krator's own life glows at night as before (THRONE.setNight).
let LIGHT_MODE='day';const _onLight=[];
function setLightMode(m){if(typeof SKY!=='undefined')SKY.setMode(m);}
_onLight.push(m=>{if(typeof THRONE!=='undefined'&&THRONE.setNight)THRONE.setNight(m==='night'?1:0);});
// the weather darkens the sky's light, not a fixed table: 89-host-atmos.js re-reads its base values (WXB) from the sky each frame
// through SKY_LOOK, and its weather law runs again after the sky (ATMOS.skyBiome weatherOver)
const SKY_LOOK=[];
