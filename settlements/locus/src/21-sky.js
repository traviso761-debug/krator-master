/* ============================== 5b. KRATOR SKY: the clock and the sky's state ==============================
   W7 (STAGE-8/G-weather.md; core/atmos/SKY-PLAN.md section 9, "later"; PLAN-ONMAP.md), 2026-11-24: Locus's sky moved onto the
   shared sky, as Girder's did. The layered background scene this fragment drew (the baked dome of 20-stage.js with the shelf
   painted on it, its silhouette mask and skyFront redrawing the shelf over the sun and the giant, the stars, the giant and its
   ring, the sun disc and the sprites) is gone: 90s-host-sky.js draws ATMOS.sky at the page's place on the scale model
   (LOCUS_SITE, 09-locus-site.js), with the real sun, giant, ring, moons, station, cluster and clouds, and the far land is the
   model's own ground (76f-locus-far.js: the abyss wall; the ridges past it). The sky drives the sun, the hemisphere, the fog
   and the exposure from the colour script. Mungo reads this fragment by name: its own site record, the same code.

   What stays here is what the rest of the page reads:
     THE CLOCK   SKY_T, skyHour(), skyDayOfYear(), skyAdvance(dt), skySetHour(h), skySetDayOfYear(d). The page's KCLOCK (LCLOCK,
                 Mungo's MCLOCK, 80-camera.js) sets the hour each frame (skySetHour); 82-daynight's dayNightHour() reads it.
     SKY         the day's speed (SKY.timeScale: 80-camera's day length), the pause, the air's pressure (the site's).
     SKY_STATE   recomputed by updateSky() from the shared sky each frame: sunDir, giantDir, keyDir (the sun by day, the giant
                 by night: the shadow light's place, the water's sun, the flora's light), dayK (0..1: the lamps' night factor,
                 the water's day), ecl (the eclipse), fogScale.
     skyRender() the sky's pass alone (80-camera's camDraw renders the world over it).

   DETERMINISM: nothing here draws from rnd(); the reseed keeps the fragment's place in the build's seed rules.
======================================================================== */
reseed(210001);

var SKY = {
  yearLengthD : 365,
  pressureAtm : typeof LOCUS_SITE!=='undefined' && LOCUS_SITE.site ? LOCUS_SITE.site.atm : 2.16,   /* the site's air (the model's rule) */
  skyModelK   : 1,          /* kept for the skylight's key: the whole sky is the model now */
  secPerHour  : 5,          /* real seconds per sky hour, when skyAdvance runs it (80-camera's KCLOCK sets the hour instead) */
  timeScale   : 1,          /* 0 · 1 · 60 · 600: the day's speed */
  paused      : false
};

/* ---------------------------------------------------------------- clock
   SKY_DAY0 = 80 is the spring equinox, game start's day (the shared sky's day 0). The page opens at 06:00 (SKY-PLAN.md 2.1). */
var SKY_DAY0 = 80;
var SKY_T    = 6*3600;
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
   One object, recomputed once a frame from the shared sky (GSKY, 90s-host-sky.js); before the sky exists it holds a plain noon. */
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
  S.dayK = S.sunUp * (1 - 0.85*S.ecl);               /* the day's light: the sun up and not eclipsed */
  S.keyDir.copy(S.sunUp > 0.02 ? S.sunDir : S.giantDir);   /* the shadow light: the sun while it is up, then the giant */
  S.fogScale = L && L.fogD && PAL.fogDensity ? L.fogD / PAL.fogDensity : 1;
}
function skyFogBase(){ return scene.fog.density; }  /* the sky sets it */

/* ---------------------------------------------------------------- render */
function skyRender(){ if(GSKY) GSKY.renderSky(); }
