/* ============================== 5b. KRATOR SKY: the clock and the sky's state ==============================
   W7 (STAGE-8/G-weather.md; core/atmos/SKY-PLAN.md section 9, "later"), 2026-11-24: Girder's sky moved onto the shared
   sky. The layered background scene this fragment drew (the baked volcano dome of 20-stage.js, the stars, the giant and
   its ring, the sun disc and the sprites) is gone: 90s-host-sky.js draws ATMOS.sky at Girder's place on the scale model,
   with the real sun, giant, ring, moons, station, cluster, clouds and the far volcano's plume, and it drives the sun, the
   hemisphere, the fog and the exposure from the colour script.

   What stays here is what the rest of the page reads:
     THE CLOCK   SKY_T, skyHour(), skyDayOfYear(), skyAdvance(dt), skySetHour(h), skySetDayOfYear(d): one clock for the
                 sky, the arena, the drills, the monks, the shops and the lit windows (82's dayNightHour() delegates here).
                 The page opens at 06:00 (the owner: every page opens at sunrise; SKY-PLAN.md 2.1).
     SKY         the clock's speed and pause (78-life, 80-camera), the air's pressure (90-atmos-host's skylight key).
     SKY_STATE   recomputed by updateSky() from the shared sky each frame: sunDir, giantDir, keyDir (the sun by day, the
                 giant by night: the shadow light's place, 98-start; the trees' light, 60-trees), dayK (the day's light,
                 0..1: the lamps' night factor, 82-daynight), ecl (the eclipse), fogScale.
     skyRender() the sky's pass alone (98-start's draw renders the world over it).

   DETERMINISM: nothing here draws from rnd(); the reseed keeps the fragment's place in the build's seed rules.
======================================================================== */
reseed(210001);

var SKY = {
  latitude    : -40,        /* deg: Girder's band (the shared sky takes its own from the site on the scale model)        */
  yearLengthD : 365,        /* d                                                                                          */
  pressureAtm : 1.9,        /* the hypertropic lee shore: the sky's air (90s-host-sky.js) and the skylight's key            */
  skyModelK   : 1,          /* kept for the skylight's key (90-atmos-host.js): the whole sky is the model now               */
  secPerHour  : 5,          /* real seconds per sky hour (the city's own)                                                   */
  timeScale   : 1,          /* 0 · 1 · 60 · 600                                                                             */
  paused      : false
};

/* ---------------------------------------------------------------- clock
   One clock. SKY_T is elapsed sky seconds; hour and day of year are both read off it. SKY_DAY0 = 80 is the spring
   equinox, game start's day (the shared sky's day 0). */
var SKY_DAY0 = 80;
var SKY_T    = 6*3600;                              /* opens at 06:00 (SKY-PLAN.md 2.1); verify.py --hour moves it */
function skyHour(){ return (SKY_T/3600) % 24; }
function skyDayOfYear(){ return (SKY_DAY0 + Math.floor(SKY_T/86400)) % SKY.yearLengthD; }
function skyAdvance(dtReal){
  if(SKY.paused || SKY.timeScale === 0) return;
  SKY_T += dtReal * (3600/SKY.secPerHour) * SKY.timeScale;
}
function skySetHour(h){
  h = ((h % 24) + 24) % 24;
  SKY_T = Math.floor(SKY_T/86400)*86400 + h*3600;
}
function skySetDayOfYear(d){
  d = ((Math.round(d) % SKY.yearLengthD) + SKY.yearLengthD) % SKY.yearLengthD;
  SKY_DAY0 = ((d - Math.floor(SKY_T/86400)) % SKY.yearLengthD + SKY.yearLengthD) % SKY.yearLengthD;
}

/* ---------------------------------------------------------------- state
   One object, recomputed once a frame from the shared sky (GSKY, 90s-host-sky.js); before the sky exists it holds a
   plain noon. */
var SKY_STATE = {
  hour: 6, dayOfYear: 80,
  sunDir: new THREE.Vector3(0,1,0), giantDir: new THREE.Vector3(0,1,0),
  sunAlt: 0, sunUp: 1, ecl: 0, dayK: 1,
  keyDir: new THREE.Vector3(0,1,0),
  fogScale: 1
};
var GSKY = null;                                    /* the shared sky: 90s-host-sky.js sets it */
function skySmooth(lo, hi, x){ var t = Math.max(0, Math.min(1, (x-lo)/(hi-lo))); return t*t*(3-2*t); }
function updateSky(){
  var S = SKY_STATE;
  S.hour = skyHour(); S.dayOfYear = skyDayOfYear();
  if(!GSKY) return;
  GSKY.update(0);
  var st = GSKY.state, L = GSKY.look;
  S.sunDir.set(st.sunDir[0], st.sunDir[1], st.sunDir[2]);
  S.giantDir.set(st.giantDir[0], st.giantDir[1], st.giantDir[2]);
  S.sunAlt = st.sunAlt; S.ecl = st.eclipse || 0;
  S.sunUp = skySmooth(-2, 4, st.sunAlt);
  /* the day's light: the sun up and not eclipsed (an eclipse reads as dusk, as the old sky had it) */
  S.dayK = S.sunUp * (1 - 0.85*S.ecl);
  /* the shadow light: the sun while it is up, the giant (the sky's own giantshine light) after it sets */
  S.keyDir.copy(S.sunUp > 0.02 ? S.sunDir : S.giantDir);
  S.fogScale = L && L.fogD && PAL.fogDensity ? L.fogD / PAL.fogDensity : 1;
}
function skyFogBase(){ return scene.fog.density; }  /* the sky sets it (the colour script's fog at 1.9 atm) */

/* ---------------------------------------------------------------- render */
function skyRender(){ if(GSKY) GSKY.renderSky(); }
