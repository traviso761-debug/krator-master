/* ============================== 27. DAY / NIGHT ==============================
   Ported from Voth's 82-daynight.js, lights-and-fog part only. The clock and
   all the astronomy live in 21-sky.js (SKY_STATE, recomputed by updateSky());
   this fragment turns that state into the city's key light colour/intensity,
   hemisphere + ambient fill, fog colour/density and DAYNIGHT_NIGHT_K.
   NOT here, on purpose: lamps, windows and the night light volume (45-kit.js,
   72-lights.js, 81-glow.js own those), the #dnSlider UI and the key light's
   POSITION (80-camera.js), and the river shader (80-camera.js feeds it). */
reseed(820001);

function dayNightHour(){ return skyHour(); }

/* the two small moons keep a simple arc of their own, opposite the sun */
var DN_MOON_AZ0 = Math.atan2(MOONDIR.x, MOONDIR.z);
var DN_MOON_ELEV_MAX = Math.asin(MOONDIR.y) * 1.15;
var _dnMoon = new THREE.Vector3();
function dnBodyDir(hour, az0, elevMax, out){
  var phase = (hour/24)*Math.PI*2 - Math.PI/2;
  var elev = Math.sin(phase) * elevMax;
  var az = az0 + (hour-12)/24*Math.PI*2;
  return out.set(Math.cos(elev)*Math.sin(az), Math.sin(elev), Math.cos(elev)*Math.cos(az)).normalize();
}

var DN_SUN_I = PAL.sunIntensity, DN_HEMI_I = PAL.hemiIntensity, DN_AMB_I = PAL.ambientIntensity;
/* night floors. (2026-10-01) These were 0.30 / 0.22 with a daytime-coloured
   sky fill: with the planetshine on top and the thick-air multiplier, 21:00
   under a full giant read as an overcast afternoon. A night is now dark: a
   little cool fill so silhouettes survive, the giant's directional key
   (21-sky) for shape and shadows, and the lamps, windows and fires as the
   lights you actually see by. Same fix as Mav's Refuge and Girder. */
var DN_HEMI_NIGHT_I = 0.07, DN_AMB_NIGHT_I = 0.035;
/* extra fill under a well-lit giant (planetshine scattered by the air) */
var DN_SHINE_HEMI = 0.07, DN_SHINE_AMB = 0.03;
/* an eclipse is deep twilight, not night: the refracted rim and the sky beyond
   the giant keep a fill of their own (this used to ride on the night floors) */
var DN_ECL_HEMI = 0.16, DN_ECL_AMB = 0.10;
/* how much a full giant softens the city's own night lighting (lamps stay the main light) */
var DN_SHINE_NL_CUT = 0.08;
/* the night fill's colour: moonlit blue-grey above, the valley's dark sand and mud brick below */
var DN_HEMI_SKY_NIGHT = new THREE.Color(0x5f7193), DN_HEMI_GND_NIGHT = new THREE.Color(0x2e2519);
var DN_SKY_SAMPLE = 0.45, DN_SOIL_SAMPLE = 0.40;

var DN_HAZE_DAY = new THREE.Color(PAL.haze), DN_HAZE_NIGHT = new THREE.Color(PAL.hazeNight);
var DN_SKY_TINT_DAY = new THREE.Color(0xffffff), DN_SKY_TINT_NIGHT = new THREE.Color(0x46566c);
var _dnFog = new THREE.Color(), _dnSky = new THREE.Color(), _dnDusk = new THREE.Color();

var DAYNIGHT_NIGHT_K = 0;
function updateDayNight(){
  var S = SKY_STATE;
  dnBodyDir((S.hour+12)%24, DN_MOON_AZ0, DN_MOON_ELEV_MAX, _dnMoon);
  SUNDIR.copy(S.sunDir); MOONDIR.copy(_dnMoon);
  moonSprite.userData.dir.copy(_dnMoon);

  /* EFFECTIVE daylight (sun up AND not eclipsed): a noon eclipse reads as
     dusk everywhere at once because everything below hangs off this. */
  var daylight = S.dayK;
  var moonUp = smooth(-0.05, 0.10, _dnMoon.y);
  var shine = S.lit*(1 - daylight);                    /* planetshine strength 0..1 */

  /* one key light: sun by day, the giant by night and through an eclipse */
  sun.color.copy(S.keyCol);
  sun.intensity = DN_SUN_I * S.keyI;
  var eclK = S.ecl*S.sunUp;
  hemiLight.intensity = DN_HEMI_NIGHT_I + DN_SHINE_HEMI*shine + DN_ECL_HEMI*eclK + (DN_HEMI_I-DN_HEMI_NIGHT_I)*daylight;
  ambLight.intensity  = DN_AMB_NIGHT_I  + DN_SHINE_AMB*shine  + DN_ECL_AMB*eclK  + (DN_AMB_I-DN_AMB_NIGHT_I)*daylight + 0.01*moonUp;
  /* thick air scatters: a milky low-contrast key at ~2 atm, a hard one at 0.8 */
  sun.intensity       *= 1.16 - 0.30*S.shadowSoft;
  hemiLight.intensity *= 0.80 + 0.42*S.shadowSoft;
  ambLight.intensity  *= 0.80 + 0.42*S.shadowSoft;
  /* the hemisphere's sky half is sampled from the dome's zenith, its ground
     half leans to Krator's red soil — blended with the tuned PAL values */
  /* (sampled less at night: the night zenith is near-black and would cancel the floors) */
  hemiLight.color.setHex(PAL.hemiSky).lerp(S.hemiSky, DN_SKY_SAMPLE*(0.25 + 0.75*daylight));
  hemiLight.groundColor.setHex(PAL.hemiGround).lerp(S.hemiGround, DN_SOIL_SAMPLE);
  /* ...and at night the fill goes cool and dark, not a dimmed copy of the day's */
  hemiLight.color.lerp(DN_HEMI_SKY_NIGHT, 1 - daylight);
  hemiLight.groundColor.lerp(DN_HEMI_GND_NIGHT, 1 - daylight);

  /* fog: jungle haze by day, a warm cast while the sun is low, blue-black at night */
  _dnFog.copy(DN_HAZE_NIGHT).lerp(DN_HAZE_DAY, daylight);
  _dnDusk.setHex(PAL.sky.sunset);
  _dnFog.lerp(_dnDusk, 0.22*S.duskK*daylight);
  scene.fog.color.copy(_dnFog);
  skyScene.background.copy(_dnFog);
  SKY_DOME_U.uBelowCol.value.copy(_dnFog).convertSRGBToLinear();
  scene.fog.density = skyFogBase();                    /* PAL.fogDensity x pressure */
  _dnSky.copy(DN_SKY_TINT_NIGHT).lerp(DN_SKY_TINT_DAY, daylight);
  skyMesh.material.color.copy(_dnSky);

  moonSprite.material.opacity = (0.15 + 0.55*moonUp) * (1 - daylight*0.85);
  moon2.material.opacity = (0.10 + 0.30*moonUp) * (1 - daylight*0.7);

  /* 0 day .. 1 night. An eclipse raises it (daylight is effective daylight);
     a full giant lowers it a little — the lamps are not fighting total dark. */
  DAYNIGHT_NIGHT_K = (1 - daylight) * (1 - DN_SHINE_NL_CUT*S.lit);
}

/* the sky sprites ride their own direction at a fixed radius in the sky scene */
TICKS.push(function(){
  sunSprite.position.copy(sunSprite.userData.dir).multiplyScalar(SKY_R_SUN);
  moonSprite.position.copy(moonSprite.userData.dir).multiplyScalar(SKY_R_SUN*0.9);
  moon2.position.copy(moon2.userData.dir).multiplyScalar(SKY_R_SUN*0.9);
  if(SKY_PANEL_REFRESH) SKY_PANEL_REFRESH();
});

window._dn = {
  nightK: function(){ return DAYNIGHT_NIGHT_K; },
  lights: function(){ return { sun:+sun.intensity.toFixed(3), hemi:+hemiLight.intensity.toFixed(3), amb:+ambLight.intensity.toFixed(3),
                               fog:+scene.fog.density.toFixed(6), fogCol:scene.fog.color.getHexString(),
                               dir:[+SKY_STATE.keyDir.x.toFixed(3), +SKY_STATE.keyDir.y.toFixed(3), +SKY_STATE.keyDir.z.toFixed(3)] }; }
};
