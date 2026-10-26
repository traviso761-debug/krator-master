// ================================================================= HOST — the tube's own light on the shared sky (2026-10-26)
// The painted dome and the giant are gone (89-host-sky.js draws ATMOS.sky, seen through the skylights and from above). Inside the
// tube no sun reaches, so the page keeps its own light (the sky is a cave's: ATMOS.skyBiome cave): the directional light off, a
// faint cold ambient, the cave's dark fog, the cave life glowing by day too. LIGHT_MODE follows the sun (night below -6 degrees),
// setLightMode(m) jumps the clock to that mode's hour, and caveLight(m) sets the light and runs the _onLight hooks on each change.
let LIGHT_MODE='day';
const LIGHTS={day:{sunC:0xffdcae,sunI:0,hemiS:0x4a5464,hemiG:0x1a1614,hemiI:.42,fillI:0,fog:0x0b0b0d,exp:1.3,night:.8},
 night:{sunC:0x8aa6c8,sunI:0,hemiS:0x1a2232,hemiG:0x0a0808,hemiI:.16,fillI:0,fog:0x050608,exp:1.35,night:1}};
const _onLight=[];
function caveLight(m){const L=LIGHTS[m]||LIGHTS.day;sun.color.setHex(L.sunC);sun.intensity=L.sunI;
 hemi.color.setHex(L.hemiS);hemi.groundColor.setHex(L.hemiG);hemi.intensity=L.hemiI;fill.intensity=L.fillI;
 scene.fog.color.setHex(L.fog);renderer.toneMappingExposure=L.exp;
 if(typeof THRONE!=='undefined'&&THRONE.setNight)THRONE.setNight(L.night);
 _onLight.forEach(f=>f(m));}
function setLightMode(m){if(typeof SKYB!=='undefined')SKYB.setMode(m);else caveLight(m);}   /* SKYB: the stage's SKY is the skylights */
