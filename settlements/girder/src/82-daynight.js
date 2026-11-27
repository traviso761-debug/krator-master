/* ============================== 27. DAY / NIGHT ==============================
   W7, 2026-11-24: the shared sky (90s-host-sky.js, ATMOS.sky) now sets the key light (the sun's direction, colour and
   intensity), the hemisphere, the fog and the exposure from the colour script at Girder's site, and adds its own
   giantshine light: each page's light is the model's at its site (SKY-PLAN.md section 2). The old light law here (the
   sun and planetshine key, the hemisphere sampled from the dome, the fog's haze colours, the moon sprites) is gone with
   the old dome. What stays is what the city reads:
     dayNightHour()      the clock's hour (21-sky.js)
     DAYNIGHT_NIGHT_K    0 day .. 1 night: the lamps, windows and night light volume (45-kit, 72-lights, 81-glow); an
                         eclipse raises it (21-sky.js's dayK is the effective daylight)
     the ambient fill    the sky drives no ambient light, so this keeps the tuned day and night floors
   NOT here, on purpose: lamps, windows and the night light volume (45-kit.js, 72-lights.js, 81-glow.js own those), the
   hour slider (80-camera.js), the key light's POSITION (98-start.js, from SKY_STATE.keyDir). */
reseed(820001);

function dayNightHour(){ return skyHour(); }

var DN_AMB_I = PAL.ambientIntensity, DN_AMB_NIGHT_I = 0.035;

var DAYNIGHT_NIGHT_K = 0;
function updateDayNight(){
  var S = SKY_STATE, daylight = S.dayK;
  SUNDIR.copy(S.sunDir);
  ambLight.intensity = DN_AMB_NIGHT_I + (DN_AMB_I - DN_AMB_NIGHT_I)*daylight;
  DAYNIGHT_NIGHT_K = 1 - daylight;
}

window._dn = {
  nightK: function(){ return DAYNIGHT_NIGHT_K; },
  lights: function(){ return { sun:+sun.intensity.toFixed(3), hemi:+hemiLight.intensity.toFixed(3), amb:+ambLight.intensity.toFixed(3),
                               fog:+scene.fog.density.toFixed(6), fogCol:scene.fog.color.getHexString(),
                               dir:[+SKY_STATE.keyDir.x.toFixed(3), +SKY_STATE.keyDir.y.toFixed(3), +SKY_STATE.keyDir.z.toFixed(3)] }; }
};
