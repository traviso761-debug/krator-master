// ================================================================= HOST — light modes on the shared sky (2026-10-26)
// The painted dome, the giant and the LIGHTS table are gone (89-host-sky.js draws ATMOS.sky). The names the rest of the page
// reads stay, here, before the fragments that push hooks at load: LIGHT_MODE follows the sun (night below -6 degrees), the
// _onLight hooks fire on each change, and setLightMode(m) jumps the clock to that mode's hour (SKY.modes in 89-host-sky.js).
let LIGHT_MODE='day';const _onLight=[];
function setLightMode(m){if(typeof SKY!=='undefined')SKY.setMode(m);}
