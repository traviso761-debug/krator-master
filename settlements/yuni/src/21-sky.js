/* ============================== 5b. KRATOR SKY ==============================
   A layered BACKGROUND SCENE rendered before the city (80-camera.js), holding
   the gas giant Krator orbits, the sun, and a star field that wheels around
   the south celestial pole while the giant hangs fixed in the north.

   Why a second scene and not a cubemap: a 30-degree disc needs more detail
   than a cubemap face holds, the stars have to rotate while the giant stays
   put, and the giant's phase changes every hour. The background camera sits
   at the origin and only copies the main camera's orientation, so everything
   here is at a fixed ANGULAR size no matter where the city camera stands, and
   scene.fog (20-stage.js) can never touch it.

   What was already here and is KEPT: the baked volcano skybox from
   20-stage.js (makeSkyTexture/volcTex/skyMesh) is moved into this scene
   wholesale and becomes layer 0. Its texture swap (the eruption cycle) and
   its material.color tint (82/83) both keep working untouched; a
   pressure/sun/eclipse gradient is layered on top of it through
   onBeforeCompile so the volcano band near the horizon is never overpainted.

   This fragment also owns THE CLOCK. 82-daynight.js's dayNightHour() — read
   by the arena, the ordinator drills, the monks, the shopkeepers and the lit
   windows — now delegates here, so hour/dayOfYear/timeScale are one clock
   driving everything rather than two competing ones.

   DETERMINISM: every random choice below comes from skyRnd(), a private LCG
   seeded once from SKY_STARSEED. The shared rnd()/rr()/pick() stream is NOT
   touched after the reseed at the head of this fragment, so nothing this file
   does can shift a building, a farm or a tree generated later.
======================================================================== */
reseed(210001);

var SKY_D = Math.PI/180;

/* ---------------------------------------------------------------- params
   Every number the brief asks to be exposed. window._sky.set(k,v) and the
   debug panel at the bottom of this file both write straight into here. */
var SKY = {
  latitude      : -46,      /* deg, south. Westerlies belt; the sun crosses through the NORTH */
  dayLengthH    : 24,       /* h, one orbit of the giant (tidally locked)  */
  yearLengthD   : 365,      /* d                                           */
  tiltDeg       : 23,       /* axial tilt, Earth-like seasons              */
  /* THE GIANT'S POSITION IS DERIVED, NOT TYPED IN.
     On a tidally locked moon the planet hangs at a fixed point, and that
     point is fully determined by two numbers the city already has: the
     observer's LATITUDE and how far round the moon the city sits from the
     sub-planet meridian. Deriving it is what makes the author's own note
     true — "climate, day length and seasons all depend on latitude, not
     longitude, so none of the model changes" — and it makes the mirror city
     (west of the meridian, under the weather) a single sign flip.

     SIGN CONVENTION, stated explicitly because the source material is
     ambiguous about it: subPlanetLonDeg is the GIANT'S sub-point measured
     from the city, EAST POSITIVE. So +57 puts the sub-point 57 degrees of
     longitude to our east and the giant appears in the NORTH-EAST; -57 puts
     it north-west. Equivalently the city lies 57 degrees WEST of the
     sub-planet meridian. The hour angle of a body at declination 0 is then
     H = -subPlanetLonDeg, and the ordinary horizontal-coordinate transform
     does the rest (skyGiantGeometry below).
     Cross-check, asserted at load: -2.57 reproduces the original brief's
     azimuth 356 / altitude ~50 exactly, which is its "Krator lies a little
     east of the sub-planet meridian" case. */
  subPlanetLonDeg  : 50,    /* deg east. 57 -> alt 24.66, az 67.34 (NE)    */
  giantAzOverride  : null,  /* deg, or null to derive from the two above   */
  giantAltOverride : null,
  giantAz       : 67.34,    /* READ-ONLY mirror of the derived value, so    */
  giantAlt      : 24.66,    /* 80-camera.js's presets and the panel can     */
                            /* read a plain number every frame.             */
  giantDiaDeg   : 30,       /* deg, 60 full moons across                   */
  giantSpinH    : 10,       /* h per rotation of the giant's own bands     */
  sunDiaDeg     : 0.53,     /* deg                                         */
  pressureAtm   : 1.3,      /* 0.8 plateau · 1.6 Voth lowland · 1.9 HERE (hypertropic lee shore) · 2.0 Ring Sea */
  skyModelK     : 0.86,     /* how much of the baked dome the pressure/sun model replaces above the horizon band */
  forceEclipse  : false,
  showRings     : true,
  secPerHour    : 5,        /* real seconds per sky hour (the city's own)  */
  timeScale     : 1,        /* 0 · 1 · 60 · 600                            */
  paused        : false
};

/* ---------------------------------------------------------------- palette
   LOCAL SCALARS, not a palette array — 05-palette.js is planner-owned and
   build.py rejects colour arrays outside it. Every one of these is a
   promotion request; see the hand-off report. */
var SKYC_ZEN_DEEP  = PAL.sky.zenDeep;   /* zenith at 0.8 atm — dark, saturated     */
var SKYC_ZEN_HAZY  = PAL.sky.zenHazy;   /* zenith at 2.0 atm — pale, milky         */
var SKYC_HOR_DEEP  = PAL.sky.horDeep;   /* horizon at 0.8 atm                      */
var SKYC_HOR_HAZY  = PAL.sky.horHazy;   /* horizon at 2.0 atm — thick haze band    */
var SKYC_SUNSET    = PAL.sky.sunset;   /* low-sun afterglow                       */
var SKYC_TWILIGHT  = PAL.sky.twilight;   /* eclipse / deep twilight dome            */
var SKYC_NIGHT_ZEN = PAL.sky.nightZen;
var SKYC_NIGHT_HOR = PAL.sky.nightHor;
var SKYC_STAR      = PAL.sky.star;
var SKYC_SUN_CORE  = PAL.sky.sunCore;
var SKYC_SUN_GLARE = PAL.sky.sunGlare;
var SKYC_SUN_LOW   = PAL.sky.sunLow;   /* sun disc reddened below ~10 deg         */
var GIANTC_ZONE    = PAL.giant.zone;   /* muted teal-blue zones                   */
var GIANTC_BELT    = PAL.giant.belt;   /* cream belts                             */
var GIANTC_STORM   = PAL.giant.storm;
var GIANTC_RIM     = PAL.giant.rim;   /* refracted-sunlight atmospheric rim      */
var GIANTC_NIGHT   = PAL.giant.night;   /* cool planetshine tint on the night side */
var GIANTC_RING    = PAL.giant.ring;
var SKYC_ECL_RIM   = PAL.sky.eclRim;   /* refracted sunlight through the giant's limb */
var SKYC_SOIL      = PAL.sky.soil;   /* Krator's red soils — hemisphere ground  */
var SKYC_SHINE     = PAL.sky.shine;   /* planetshine key-light colour            */

var SKY_STARSEED = 0x5eed17;
var SKY_STAR_N   = 1500;

/* ---------------------------------------------------------------- math
   az: 0 = north, 90 = east. World axes are +Y up, -Z north, +X east, which
   is the same convention API.md states for the city (x east, z south). */
function altAzToVec(altDeg, azDeg, out){
  var a = altDeg*SKY_D, z = azDeg*SKY_D, ca = Math.cos(a);
  return (out || new THREE.Vector3()).set(Math.sin(z)*ca, Math.sin(a), -Math.cos(z)*ca);
}
/* Solar declination. Positive = northern summer, so Krator's midsummer (the
   sun highest in the north) is where dec is most NEGATIVE — day ~355. */
function skyDeclination(doy){
  return SKY.tiltDeg*SKY_D * Math.sin(2*Math.PI*(doy - 80)/SKY.yearLengthD);
}
/* THE SIGN CHECK (brief, section 5, and it matters).
   The brief's sketch converts its south-referenced azimuth with
   `az = PI - azFromSouth`, which MIRRORS east and west: it puts the 06:00
   sun at azimuth 270 (west). The day-80 noon case the brief tells you to
   check against is exactly the one case that CANNOT catch it, because there
   azFromSouth is 180 and PI-180 and PI+180 both land on due north.
   The standard horizontal-coordinate form below is used instead — it needs
   no quadrant fix-up, keeps the sign of dec (the brief's tan(dec) loses it),
   and reproduces every number in the brief's own table:
     day  80 noon -> alt 50.00, az 0 (north)   day 172 noon -> alt 27.00, az 0
     day 355 noon -> alt 72.99, az 0 (north)   day  80 06:00 -> alt 0, az 90 (EAST)
   See skyCheckSigns() at the bottom of this file, which asserts all of it at
   load and prints to the error panel if it ever stops being true. */
function skySunDir(hour, doy, out){
  var dec = skyDeclination(doy);
  var H   = (360/SKY.dayLengthH)*(hour - 12)*SKY_D;
  var phi = SKY.latitude*SKY_D;
  var sinAlt = Math.sin(phi)*Math.sin(dec) + Math.cos(phi)*Math.cos(dec)*Math.cos(H);
  var alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  var az  = Math.atan2(-Math.cos(dec)*Math.sin(H),
                        Math.cos(phi)*Math.sin(dec) - Math.sin(phi)*Math.cos(dec)*Math.cos(H));
  return altAzToVec(alt/SKY_D, az/SKY_D, out);
}
function skySunAltAz(hour, doy){
  var v = skySunDir(hour, doy, _skyTmpA);
  return { alt: Math.asin(Math.max(-1,Math.min(1,v.y)))/SKY_D,
           az: ((Math.atan2(v.x, -v.z)/SKY_D)%360+360)%360 };
}
function skySmooth(lo, hi, x){ var t = Math.max(0, Math.min(1, (x-lo)/(hi-lo))); return t*t*(3-2*t); }

var _skyTmpA = new THREE.Vector3(), _skyTmpB = new THREE.Vector3();

/* ---------------------------------------------------------------- clock
   One clock. SKY_T is elapsed SKY seconds; hour and dayOfYear are both read
   off it, so advancing 24 h at 600x rolls the date exactly once. 82's
   dayNightHour() delegates here, which is what keeps the arena crowd, the
   ordinator drills, the monks and the lit windows on the same time as the
   sun. */
var SKY_DAY0 = 80;                                  /* the equinox: the brief's own reference day */
var SKY_T    = 10*3600;                             /* opens at 10:00, as 82-daynight.js always did */
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

/* ---------------------------------------------------------------- scene */
var skyScene = new THREE.Scene();
var skyCam   = new THREE.PerspectiveCamera(camera.fov, camera.aspect, 5, 30000);

/* the city's own background colour moves here: with autoClear off for the
   city pass, `scene.background` would repaint over the sky every frame.
   82/83 write skyScene.background instead now. */
skyScene.background = scene.background;
scene.background = null;

var SKY_R_GIANT = 1000, SKY_R_STARS = 3000, SKY_R_SUN = 5000;

/* ---- layer 0: the existing baked volcano dome, moved across ------------ */
scene.remove(skyMesh);
skyMesh.position.set(0,0,0);
skyMesh.material.depthTest = false;
skyMesh.renderOrder = -10;
skyScene.add(skyMesh);

/* A pressure/sun/eclipse gradient layered ON TOP of the bake rather than
   replacing it: the volcano, its plume and the horizon haze bank all live in
   the bottom ~7 degrees of that canvas, and uSkyK below fades the new sky in
   only ABOVE that band, so none of 20-stage.js's careful volcano paint is
   overwritten. */
var SKY_DOME_U = {
  uSkyZen   : { value: new THREE.Color() },
  uSkyHor   : { value: new THREE.Color() },
  uSkyK     : { value: 0.0 },
  uHazeCol  : { value: new THREE.Color() },
  uHazeH    : { value: 0.10 },
  uHazeA    : { value: 0.0 },
  uSunDirS  : { value: new THREE.Vector3(0,1,0) },
  uSunGlowC : { value: new THREE.Color() },
  uSunGlowK : { value: 0.0 },
  uSunGlowP : { value: 16.0 },
  uBelowCol : { value: new THREE.Color() },      /* = the city's fog colour (82-daynight.js) */
  uBelowK   : { value: 0.92 }
};
skyMesh.material.onBeforeCompile = function(sh){
  for(var k in SKY_DOME_U) sh.uniforms[k] = SKY_DOME_U[k];
  sh.vertexShader = 'varying vec3 vSkyDir;\n' + sh.vertexShader.replace(
    '#include <begin_vertex>',
    '#include <begin_vertex>\n  vSkyDir = normalize(position);');
  sh.fragmentShader =
    'varying vec3 vSkyDir;\n' +
    'uniform vec3 uSkyZen; uniform vec3 uSkyHor; uniform float uSkyK;\n' +
    'uniform vec3 uHazeCol; uniform float uHazeH; uniform float uHazeA;\n' +
    'uniform vec3 uSunDirS; uniform vec3 uSunGlowC; uniform float uSunGlowK; uniform float uSunGlowP;\n' +
    'uniform vec3 uBelowCol; uniform float uBelowK;\n' +
    sh.fragmentShader.replace('#include <tonemapping_fragment>',
      [ '  {',
        '    vec3 sd = normalize(vSkyDir);',
        '    float up = max(sd.y, 0.0);',
        /* the new sky model, faded in above the baked horizon/volcano band */
        '    vec3 modelSky = mix(uSkyHor, uSkyZen, pow(up, 0.55));',
        '    float k = uSkyK * smoothstep(0.015, 0.34, up);',
        '    gl_FragColor.rgb = mix(gl_FragColor.rgb, modelSky, k);',
        /* horizon haze band — thickens with pressure */
        '    float hz = exp(-up/max(uHazeH, 0.004));',
        '    gl_FragColor.rgb = mix(gl_FragColor.rgb, uHazeCol, hz*uHazeA);',
        /* sun glow / afterglow */
        '    float cs = max(dot(sd, uSunDirS), 0.0);',
        '    gl_FragColor.rgb += uSunGlowC * pow(cs, uSunGlowP) * uSunGlowK;',
        /* below the horizon the dome IS the fog the world edge fades into, so a high
           camera never sees a bright gap between the terrain and the far forest */
        '    gl_FragColor.rgb = mix(gl_FragColor.rgb, uBelowCol, uBelowK*smoothstep(0.004, -0.055, sd.y));',
        '  }',
        '#include <tonemapping_fragment>' ].join('\n'));
};
skyMesh.material.customProgramCacheKey = function(){ return 'kratorDomeMav'; };
skyMesh.material.needsUpdate = true;

/* ---- layer 1: the stars ------------------------------------------------
   Positions from a PRIVATE LCG (skyRnd), never the shared rnd() stream —
   SUBAGENT.md section 6: any rr()/chance()/pick() call here would advance
   the one stream this fragment shares with the rest of the build and
   reshuffle the whole city. */
var _skySeed = SKY_STARSEED >>> 0;
function skyRnd(){ _skySeed = (Math.imul(_skySeed, 1664525) + 1013904223) >>> 0; return _skySeed/4294967296; }

var starGroup = new THREE.Group();
skyScene.add(starGroup);
var SKY_POLE = altAzToVec(-SKY.latitude, 180);   /* south celestial pole: alt |lat|, due south */
var skyStarMat = null;

(function(){
  var pos = new Float32Array(SKY_STAR_N*3), mag = new Float32Array(SKY_STAR_N);
  for(var i=0;i<SKY_STAR_N;i++){
    var u = skyRnd()*2 - 1, ph = skyRnd()*Math.PI*2, s = Math.sqrt(Math.max(0,1-u*u));
    pos[i*3]   = Math.cos(ph)*s*SKY_R_STARS;
    pos[i*3+1] = u*SKY_R_STARS;
    pos[i*3+2] = Math.sin(ph)*s*SKY_R_STARS;
    var m = skyRnd();
    mag[i] = 0.12 + 0.88*m*m*m;            /* a few bright, most faint */
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aMag', new THREE.BufferAttribute(mag, 1));
  var starMat = new THREE.ShaderMaterial({
    uniforms: {
      uOpacity  : { value: 0 },
      uZenK     : { value: 0 },
      uSize     : { value: 2.8 },
      uColor    : { value: new THREE.Color(SKYC_STAR).convertSRGBToLinear() },
      uGiantDir : { value: new THREE.Vector3(0,1,0) },
      uWashCos  : { value: Math.cos(20*SKY_D) }
    },
    vertexShader: [
      'attribute float aMag;',
      'uniform float uSize; uniform float uOpacity; uniform float uZenK;',
      'uniform vec3 uGiantDir; uniform float uWashCos;',
      'varying float vB;',
      'void main(){',
      '  vec4 wp = modelMatrix * vec4(position, 1.0);',
      '  vec3 d = normalize(wp.xyz);',
      /* washed out within ~20 deg of the giant */
      '  float near = smoothstep(uWashCos, 1.0, dot(d, uGiantDir));',
      '  vB = aMag * uOpacity * (1.0 - 0.92*near);',
      /* during an eclipse only the zenith darkens enough to show stars */
      '  vB *= mix(1.0, smoothstep(0.52, 0.90, d.y), uZenK);',
      '  gl_Position = projectionMatrix * viewMatrix * wp;',
      '  gl_PointSize = uSize * (0.55 + 1.05*aMag);',
      '}' ].join('\n'),
    fragmentShader: [
      'uniform vec3 uColor;',
      'varying float vB;',
      'void main(){',
      '  vec2 c = gl_PointCoord - vec2(0.5);',
      '  float r = dot(c,c);',
      '  if(r > 0.25) discard;',
      '  float a = vB * (1.0 - smoothstep(0.02, 0.25, r));',
      '  if(a < 0.002) discard;',
      '  gl_FragColor = vec4(uColor * a, a);',
      '  #include <tonemapping_fragment>',
      '  #include <encodings_fragment>',
      '}' ].join('\n'),
    transparent: true, depthWrite: false, depthTest: true,
    blending: THREE.AdditiveBlending, fog: false
  });
  var stars = new THREE.Points(g, starMat);
  stars.frustumCulled = false;
  stars.renderOrder = -6;
  starGroup.add(stars);
  skyStarMat = starMat;
})();

/* ---- layer 2: the giant ------------------------------------------------
   Unit sphere, scaled so it subtends SKY.giantDiaDeg from the origin. Its
   band coordinates are computed in the FRAGMENT shader from the world-space
   normal against a world-space spin axis (uAxis/uE1/uE2), so the mesh itself
   needs no rotation and there is no local/world convention to get wrong.

   The axis lies in the PLANE OF THE SKY, tilted 23 degrees from the local
   vertical as projected there. That is the only reading of the brief that
   satisfies both of its own requirements at once: "its own rotation axis
   tilted 23 deg from the observer's up" (section 4.1) AND "the moon orbits
   in the ring plane, so the rings appear as a hairline" (section 4.5). An
   axis literally 23 deg off world-up would sit 43 deg out of the ring plane
   and the rings would be wide open, not a razor line. A residual 0.9 deg of
   tilt toward the viewer is what gives the rings any thickness at all. */
var GIANT_DIR  = new THREE.Vector3();
var GIANT_AXIS = new THREE.Vector3(), GIANT_E1 = new THREE.Vector3(), GIANT_E2 = new THREE.Vector3();
var SKY_RING_OPEN_DEG = 0.9;

var giantMat = new THREE.ShaderMaterial({
  uniforms: {
    uSunDir  : { value: new THREE.Vector3(0,1,0) },
    uAxis    : { value: new THREE.Vector3(0,1,0) },
    uE1      : { value: new THREE.Vector3(1,0,0) },
    uE2      : { value: new THREE.Vector3(0,0,1) },
    uZone    : { value: new THREE.Color(GIANTC_ZONE).convertSRGBToLinear() },
    uBelt    : { value: new THREE.Color(GIANTC_BELT).convertSRGBToLinear() },
    uStormC  : { value: new THREE.Color(GIANTC_STORM).convertSRGBToLinear() },
    uRimCol  : { value: new THREE.Color(GIANTC_RIM).convertSRGBToLinear() },
    uNightC  : { value: new THREE.Color(GIANTC_NIGHT).convertSRGBToLinear() },
    uS1      : { value: new THREE.Vector4(-0.36, 1.10, 0.40, 0.13) },   /* lat, lon, half-lon, half-lat */
    uS2      : { value: new THREE.Vector4( 0.21, 4.05, 0.26, 0.085) },
    uSpin    : { value: 0 },
    uSunI    : { value: 0.86 },
    uRim     : { value: 0 },
    uMoonSh  : { value: 0 },
    uShadR   : { value: 0.0433 },
    uRingSh  : { value: 0 },
    uRingLat : { value: 0 },
    /* uHazeCol SHARES the dome's own live horizon Color object (assigned
       just below), so the disc always washes toward exactly the air it is
       sitting in — pale at noon, red at sunset, near-black at night, twilight
       during an eclipse — with no second colour to keep in sync and no new
       palette entry. */
    uHazeCol : { value: null },
    uHazeK   : { value: 0 },
    uAir     : { value: new THREE.Color(0,0,0) },   /* YUNI: daytime airlight in front of the disc */
    uHazeH   : { value: 0.1 }
  },
  vertexShader: [
    'varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
    'void main(){',
    '  vec4 wp = modelMatrix * vec4(position, 1.0);',
    '  vN = normalize(mat3(modelMatrix) * normal);',
    '  vV = normalize(cameraPosition - wp.xyz);',
    /* the sky direction of THIS fragment: the background camera sits at the
       origin, so the world position is already the look direction, and its y
       is the sine of the fragment's own apparent altitude. That is what the
       haze term below needs — the disc spans 30 degrees, so its lower limb
       is a good deal deeper in the air than its upper one. */
    '  vSky = normalize(wp.xyz);',
    '  gl_Position = projectionMatrix * viewMatrix * wp;',
    '}' ].join('\n'),
  fragmentShader: [
    'uniform vec3 uSunDir, uAxis, uE1, uE2, uZone, uBelt, uStormC, uRimCol, uNightC, uHazeCol;',
    'uniform vec4 uS1, uS2;',
    'uniform float uSpin, uSunI, uRim, uMoonSh, uShadR, uRingSh, uRingLat, uHazeK, uHazeH; uniform vec3 uAir;',
    'varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
    'float oval(float lat, float lon, vec4 s){',
    '  float dl = lat - s.x;',
    '  float dg = mod(lon - s.y + 3.14159265, 6.28318531) - 3.14159265;',
    '  return (dg*dg)/(s.z*s.z) + (dl*dl)/(s.w*s.w);',
    '}',
    'void main(){',
    '  vec3 N = normalize(vN);',
    '  vec3 V = normalize(vV);',
    '  float sLat = clamp(dot(N, uAxis), -1.0, 1.0);',
    '  float lat  = asin(sLat);',
    '  float lon  = atan(dot(N, uE2), dot(N, uE1)) + uSpin;',
    /* 1. bands: ~10 zone/belt pairs, wavering along longitude */
    '  float wav = 0.42*sin(lon*3.0 + lat*6.0) + 0.24*sin(lon*7.0 - 2.1) + 0.13*sin(lon*13.0 + lat*3.0);',
    '  float b   = sin(lat*10.0 + wav);',
    '  vec3 col  = mix(uZone, uBelt, smoothstep(-0.45, 0.45, b));',
    '  col *= 0.93 + 0.12*sin(lat*37.0 + 1.6*sin(lon*2.0 + 0.7));',
    '  col  = mix(col, uZone*0.70, smoothstep(0.70, 1.0, abs(sLat)));',
    /* a couple of oval storms */
    '  col  = mix(uStormC, col, smoothstep(0.45, 1.0, oval(lat, lon, uS1)));',
    '  col  = mix(uStormC*1.12, col, smoothstep(0.45, 1.0, oval(lat, lon, uS2)));',
    /* 5. ring shadow: a dark stripe drifting north/south with the season */
    '  col *= 1.0 - 0.42*uRingSh*(1.0 - smoothstep(0.0, 0.075, abs(lat - uRingLat)));',
    /* 3. limb darkening — without it the disc is a flat cut-out.
       clamp(), not max(): two normalised vectors can dot to a hair OVER 1.0
       in fragment precision, and the fresnel below raises (1.0 - ndv) to a
       fractional-free but still real power. pow() of a negative base is
       UNDEFINED in GLSL — NaN on plenty of real drivers, silently benign
       under SwiftShader, which is the only thing we test on. */
    '  float ndv  = clamp(dot(N, V), 0.0, 1.0);',
    '  float limb = pow(max(ndv, 0.0015), 0.35);',
    /* 2. phase: Lambert with a ~10 degree soft terminator, faint night side */
    '  float ndl = dot(N, uSunDir);',
    '  float day = smoothstep(-0.17, 0.17, ndl);',
    '  vec3 outc = col*limb*(uSunI*day) + col*limb*uNightC*0.03;',
    /* moon shadow transiting the full disc */
    '  float ang = acos(clamp(ndl, -1.0, 1.0));',
    '  outc *= mix(1.0, 0.06 + 0.94*smoothstep(uShadR*0.55, uShadR*1.30, ang), uMoonSh);',
    /* 4. atmospheric rim — the main feature during an eclipse */
    '  float fres   = pow(max(1.0 - ndv, 0.0), 3.2);',
    '  float rimLit = mix(smoothstep(-0.35, 0.45, ndl), 1.0, uRim);',
    '  outc += uRimCol * fres * (0.14 + 3.2*uRim) * rimLit;',
    /* ATMOSPHERIC EXTINCTION ACROSS THE DISC.
       Sitting 25 degrees up and 30 degrees wide, the giant now has its lower
       limb around 10 degrees above the horizon and its upper limb around 40,
       and the light path through Krator\'s dense air is far longer for the
       first than the second — so the bottom of the disc washes toward the
       horizon haze while the top stays clean.
       Deliberately NOT done by putting scene.fog on the sky scene: that
       would satisfy the sentence and break acceptance item 8, which tests
       that the city\'s fog never dims the giant. This is per-fragment
       altitude, not distance, so a camera on a tower sees exactly the same
       gradient as one in the street. uHazeK/uHazeH come off pressureAtm, so
       an abyss city gets a strongly tinted lower limb and a plateau city
       gets none — the same way pressure drives everything else here. */
    '  float hz = uHazeK * exp(-max(vSky.y, 0.0)/max(uHazeH, 0.004));',
    '  outc = mix(outc, uHazeCol, clamp(hz, 0.0, 0.92));',
    /* YUNI (1.3 atm): by day the sky's own scattered light lies in front of the giant, so its unlit side can never be darker
       than the sky beside it. At 1.9 atm the haze term above did this job; in this thinner air it has to be explicit. */
    '  outc = max(outc, uAir * (0.80 + 0.20*limb));',
    /* soft shoulder rather than a clip, so a bright limb never flat-tops to white */
    '  outc = outc / (1.0 + outc*0.34);',
    '  gl_FragColor = vec4(outc, 1.0);',
    '  #include <tonemapping_fragment>',
    '  #include <encodings_fragment>',
    '}' ].join('\n'),
  fog: false
});
giantMat.uniforms.uHazeCol.value = SKY_DOME_U.uSkyHor.value;   /* one object, two materials */
var giantMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), giantMat);
giantMesh.renderOrder = -8;
giantMesh.frustumCulled = false;
skyScene.add(giantMesh);

/* ---- rings: a hairline, seen from within their own plane --------------- */
var ringMat = new THREE.ShaderMaterial({
  uniforms: {
    uCol     : { value: new THREE.Color(GIANTC_RING).convertSRGBToLinear() },
    uSunDir  : { value: new THREE.Vector3(0,1,0) },
    uCentre  : { value: new THREE.Vector3() },
    uInner   : { value: 1.30 },
    uOuter   : { value: 2.12 },
    uOpacity : { value: 0.9 }
  },
  vertexShader: [
    'varying vec3 vW;',
    'void main(){',
    '  vec4 wp = modelMatrix * vec4(position, 1.0);',
    '  vW = wp.xyz;',
    '  gl_Position = projectionMatrix * viewMatrix * wp;',
    '}' ].join('\n'),
  fragmentShader: [
    'uniform vec3 uCol; uniform vec3 uCentre; uniform float uInner, uOuter, uOpacity;',
    'varying vec3 vW;',
    'void main(){',
    '  float r = length(vW - uCentre);',
    /* a handful of gaps so the hairline is not a uniform smear */
    '  float t = r;',
    '  float g = 0.62 + 0.38*sin(t*0.16) * sin(t*0.047 + 1.3);',
    '  float a = uOpacity * clamp(g, 0.06, 1.0);',
    '  gl_FragColor = vec4(uCol * a, a);',
    '  #include <tonemapping_fragment>',
    '  #include <encodings_fragment>',
    '}' ].join('\n'),
  transparent: true, depthWrite: false, depthTest: true,
  side: THREE.DoubleSide, blending: THREE.NormalBlending, fog: false
});
/* 384 segments, not 192: seen ~1 degree off edge-on the whole annulus is
   about a pixel tall, so a coarse tessellation reads as a dotted zigzag
   rather than a hairline (worst under verify.py, which runs with
   antialias off because navigator.webdriver sets FAST). */
var ringMesh = new THREE.Mesh(new THREE.RingGeometry(1.30, 2.12, 384, 1), ringMat);
ringMesh.renderOrder = -7;
ringMesh.frustumCulled = false;
skyScene.add(ringMesh);

/* ---- layer 3: the sun -------------------------------------------------
   A hard 0.53-degree disc plus the glare sprite that was already in
   20-stage.js (reused, not duplicated: net zero draw calls for the glare).
   Both depth-test, so the giant occludes them geometrically during an
   eclipse without any separate visibility rule. */
var sunDiscMat = new THREE.MeshBasicMaterial({ color: SKYC_SUN_CORE, fog: false, depthWrite: false });
var sunDisc = new THREE.Mesh(new THREE.CircleGeometry(1, 40), sunDiscMat);
sunDisc.renderOrder = -4;
sunDisc.frustumCulled = false;
skyScene.add(sunDisc);

/* the existing sprites move across: sun glare, and the two small moons that
   were already in this world's sky. Depth-tested now, at a radius beyond the
   giant's, so the giant hides them properly. */
[sunSprite, moonSprite, moon2].forEach(function(s){
  scene.remove(s);
  s.material.depthTest = true;
  skyScene.add(s);
});
sunSprite.renderOrder  = -3;
moonSprite.renderOrder = -5;
moon2.renderOrder      = -5;

/* ---------------------------------------------------------------- state
   One object, recomputed once per frame, read by 82-daynight.js (lights,
   fog, night-light gating) and 83-weather.js (fog base). */
var SKY_STATE = {
  hour: 10, dayOfYear: 80,
  sunDir: new THREE.Vector3(0,1,0), giantDir: new THREE.Vector3(0,1,0),
  sunAlt: 0, sunAz: 0, sepDeg: 90,
  sunUp: 1, ecl: 0, lit: 0, dayK: 1, sunK: 1,
  keyDir: new THREE.Vector3(0,1,0), keyCol: new THREE.Color(0xffffff), keyI: 1,
  hemiSky: new THREE.Color(0xffffff), hemiGround: new THREE.Color(SKYC_SOIL),
  fogScale: 1, shadowSoft: 0, duskK: 0
};

var _skKey = new THREE.Vector3(), _skQ = new THREE.Quaternion(), _skQ2 = new THREE.Quaternion();
var _skWarm = new THREE.Color(PAL.sunColor), _skShine = new THREE.Color(SKYC_SHINE);
var _skLow = new THREE.Color(SKYC_SUN_LOW), _skSunC = new THREE.Color(SKYC_SUN_CORE);
var _skEclRim = new THREE.Color(SKYC_ECL_RIM), _skGlare = new THREE.Color(SKYC_SUN_GLARE);
/* a totalised eclipse keeps this fraction of daylight in the mood (fog,
   hemisphere, water, night-light gate) and this much key light from the
   giant's refracted rim — deep twilight, never black. */
var SKY_ECL_FLOOR = 0.15, SKY_ECL_KEY = 0.34;
/* strength of the giant's own atmospheric extinction at 2.0 atm; scaled by
   pk*pk so a plateau city (0.8 atm) gets none at all and a lowland city gets
   a visible but gentle wash on the lower limb. */
var SKY_GIANT_HAZE_K = 1.7;
var _skZenD = new THREE.Color(SKYC_ZEN_DEEP), _skZenH = new THREE.Color(SKYC_ZEN_HAZY);
var _skHorD = new THREE.Color(SKYC_HOR_DEEP), _skHorH = new THREE.Color(SKYC_HOR_HAZY);
var _skNZen = new THREE.Color(SKYC_NIGHT_ZEN), _skNHor = new THREE.Color(SKYC_NIGHT_HOR);
var _skTwi  = new THREE.Color(SKYC_TWILIGHT),  _skSet  = new THREE.Color(SKYC_SUNSET);
var _skA = new THREE.Color(), _skB = new THREE.Color();

/* Where the giant hangs, from the city's latitude and its longitude offset
   from the sub-planet meridian. The sub-planet point sits on the moon's
   equator (the moon orbits in the giant's equatorial/ring plane), so this is
   the ordinary horizontal-coordinate transform for a body at declination 0
   with hour angle H = -subPlanetLonDeg:
       sin(alt) = cos(lat) * cos(H)
       az       = atan2(-sin H, -sin(lat) * cos H)
   At lat -40: offset 0 -> 50.00 deg due north; offset 57 east -> 24.66 deg
   at azimuth 67.34 (north-east); offset 57 west -> 24.66 at 292.66. */
function skyGiantPos(){
  var H = -SKY.subPlanetLonDeg*SKY_D, phi = SKY.latitude*SKY_D;
  var alt = Math.asin(Math.max(-1, Math.min(1, Math.cos(phi)*Math.cos(H))))/SKY_D;
  var az  = ((Math.atan2(-Math.sin(H), -Math.sin(phi)*Math.cos(H))/SKY_D)%360+360)%360;
  return { alt: (SKY.giantAltOverride == null ? alt : SKY.giantAltOverride),
           az : (SKY.giantAzOverride  == null ? az  : SKY.giantAzOverride) };
}

function skyGiantGeometry(){
  altAzToVec(-SKY.latitude, 180, SKY_POLE);       /* the pole follows the latitude parameter */
  var gp = skyGiantPos();
  SKY.giantAlt = gp.alt; SKY.giantAz = gp.az;     /* published for 80-camera.js and the panel */
  altAzToVec(SKY.giantAlt, SKY.giantAz, GIANT_DIR);
  /* "up" projected into the plane of the sky at the giant, then rotated by
     the tilt inside that plane — see the comment at giantMesh above. */
  _skyTmpA.set(0,1,0).addScaledVector(GIANT_DIR, -GIANT_DIR.y).normalize();
  _skyTmpB.copy(GIANT_DIR).cross(_skyTmpA).normalize();
  GIANT_AXIS.copy(_skyTmpA).multiplyScalar(Math.cos(SKY.tiltDeg*SKY_D))
            .addScaledVector(_skyTmpB, Math.sin(SKY.tiltDeg*SKY_D));
  /* open the rings by a fraction of a degree so they are a hairline and not
     a degenerate zero-width sliver */
  GIANT_AXIS.addScaledVector(GIANT_DIR, Math.tan(SKY_RING_OPEN_DEG*SKY_D)).normalize();
  GIANT_E1.copy(GIANT_DIR).addScaledVector(GIANT_AXIS, -GIANT_DIR.dot(GIANT_AXIS)).normalize();
  GIANT_E2.copy(GIANT_AXIS).cross(GIANT_E1).normalize();

  var rad = SKY_R_GIANT * Math.tan(SKY.giantDiaDeg*0.5*SKY_D);
  giantMesh.position.copy(GIANT_DIR).multiplyScalar(SKY_R_GIANT);
  giantMesh.scale.setScalar(rad);
  ringMesh.position.copy(giantMesh.position);
  ringMesh.scale.setScalar(rad);
  _skQ.setFromUnitVectors(_skyTmpA.set(0,0,1), GIANT_AXIS);
  ringMesh.quaternion.copy(_skQ);
  ringMat.uniforms.uCentre.value.copy(ringMesh.position);
  ringMat.uniforms.uInner.value = 1.30*rad;
  ringMat.uniforms.uOuter.value = 2.12*rad;

  giantMat.uniforms.uAxis.value.copy(GIANT_AXIS);
  giantMat.uniforms.uE1.value.copy(GIANT_E1);
  giantMat.uniforms.uE2.value.copy(GIANT_E2);
  giantMat.uniforms.uShadR.value = Math.asin(Math.min(0.9, 0.65/(SKY.giantDiaDeg*0.5)));
  skyStarMat.uniforms.uGiantDir.value.copy(GIANT_DIR);
  skyStarMat.uniforms.uWashCos.value = Math.cos((SKY.giantDiaDeg*0.5 + 20)*SKY_D);
}
skyGiantGeometry();

var SKY_GIANT_KEY = '';
function updateSky(){
  var S = SKY_STATE;
  /* the giant only needs rebuilding when a parameter actually moves */
  var gk = SKY.subPlanetLonDeg+'|'+SKY.giantAzOverride+'|'+SKY.giantAltOverride+'|'+
           SKY.giantDiaDeg+'|'+SKY.tiltDeg+'|'+SKY.latitude;
  if(gk !== SKY_GIANT_KEY){ SKY_GIANT_KEY = gk; skyGiantGeometry(); }

  var hour = S.hour = skyHour(), doy = S.dayOfYear = skyDayOfYear();
  skySunDir(hour, doy, S.sunDir);
  S.giantDir.copy(GIANT_DIR);
  S.sunAlt = Math.asin(Math.max(-1,Math.min(1,S.sunDir.y)))/SKY_D;
  S.sunAz  = ((Math.atan2(S.sunDir.x, -S.sunDir.z)/SKY_D)%360+360)%360;

  /* --- eclipse: soft over the sun's own 0.53 deg width at the limb ----- */
  var half = SKY.giantDiaDeg*0.5;
  S.sepDeg = S.sunDir.angleTo(GIANT_DIR)/SKY_D;
  var ecl = 1 - skySmooth(half - SKY.sunDiaDeg, half + SKY.sunDiaDeg, S.sepDeg);
  if(SKY.forceEclipse) ecl = 1;
  S.ecl = ecl;

  /* --- phase --------------------------------------------------------- */
  S.lit   = (1 - S.sunDir.dot(GIANT_DIR))*0.5;
  S.sunUp = skySmooth(Math.sin(-6*SKY_D), Math.sin(8*SKY_D), S.sunDir.y);
  S.sunK  = S.sunUp*(1 - ecl);                /* direct sunlight only */
  /* dayK is what everything downstream reads as "how lit is the world".
     An eclipse keeps a floor of it, because the brief is explicit that total
     darkness never happens on this side of the moon: the 30-degree ring of
     refracted sunlight round the giant, plus the sky scattered in from
     beyond it, is a real light source. */
  S.dayK  = S.sunUp*(1 - (1 - SKY_ECL_FLOOR)*ecl);

  /* --- stars --------------------------------------------------------- */
  starGroup.setRotationFromAxisAngle(SKY_POLE, 2*Math.PI*hour/SKY.dayLengthH);
  /* stars come out at night, and near the ZENITH ONLY during an eclipse */
  skyStarMat.uniforms.uOpacity.value = Math.max(0, 1 - S.sunUp)*0.95 + 0.55*ecl*S.sunUp;
  skyStarMat.uniforms.uZenK.value = ecl*S.sunUp;

  /* --- the giant ----------------------------------------------------- */
  giantMat.uniforms.uSunDir.value.copy(S.sunDir);
  giantMat.uniforms.uSpin.value = (SKY_T/3600)/SKY.giantSpinH * Math.PI*2;
  /* The rim is the eclipse's main feature, but it is NOT only an eclipse
     feature: a new giant is a dark disc with a thin bright edge all round it,
     because the sun is behind it whether or not it is exactly behind it. So
     the rim is driven by the PHASE as well as by the separation, and the
     phase term is the weaker of the two. */
  giantMat.uniforms.uRim.value = Math.max(1 - skySmooth(0, half, S.sepDeg),
                                          0.45*Math.pow(1 - S.lit, 5));
  /* the moon's own shadow crosses the full disc when the sun is opposite it */
  _skyTmpA.copy(S.sunDir).negate();
  giantMat.uniforms.uMoonSh.value = 1 - skySmooth(0, half, _skyTmpA.angleTo(GIANT_DIR)/SKY_D);
  /* ring shadow drifts north and south with the season */
  var season = Math.sin(2*Math.PI*(doy-80)/SKY.yearLengthD);
  giantMat.uniforms.uRingLat.value = -0.42*season;
  giantMat.uniforms.uRingSh.value  = SKY.showRings ? Math.abs(season)*0.9 + 0.1 : 0;
  ringMesh.visible = SKY.showRings;
  ringMat.uniforms.uOpacity.value = 0.88;

  /* --- the sun ------------------------------------------------------- */
  var sunR = SKY_R_SUN*Math.tan(SKY.sunDiaDeg*0.5*SKY_D);
  sunDisc.position.copy(S.sunDir).multiplyScalar(SKY_R_SUN);
  sunDisc.scale.setScalar(sunR);
  sunDisc.lookAt(0,0,0);
  var lowK = 1 - skySmooth(0, Math.sin(11*SKY_D), Math.max(0,S.sunDir.y));
  _skA.copy(_skSunC).lerp(_skLow, lowK*0.85);
  sunDiscMat.color.copy(_skA);
  sunDisc.visible = S.sunDir.y > -0.08;
  sunSprite.userData.dir.copy(S.sunDir);
  sunSprite.scale.setScalar(SKY_R_SUN*Math.tan(2.6*SKY_D)*2*(1 + 0.45*lowK));
  sunSprite.material.color.copy(_skGlare).lerp(_skLow, lowK*0.9);
  sunSprite.material.opacity = S.sunUp*(1 - ecl)*(0.55 + 0.45*lowK);
  sunSprite.visible = sunSprite.material.opacity > 0.01;

  /* --- dome colour: pressure, sun altitude, eclipse -------------------- */
  var p = SKY.pressureAtm, pk = Math.max(0, Math.min(1, (p - 0.8)/1.2));
  _skA.copy(_skZenD).lerp(_skZenH, pk);        /* daytime zenith */
  _skB.copy(_skHorD).lerp(_skHorH, pk);        /* daytime horizon */
  var duskK = 1 - skySmooth(Math.sin(-3*SKY_D), Math.sin(16*SKY_D), S.sunDir.y);
  S.duskK = duskK*S.sunUp;
  /* a low sun reddens the horizon, and thick air holds the afterglow longer */
  _skB.lerp(_skSet, duskK*(0.35 + 0.42*pk));
  _skA.lerp(_skNZen, Math.max(0, 1 - S.sunUp));
  /* (Mav's Refuge) the HORIZON goes to night later than the zenith does: at
     1.9 atm the afterglow hangs on until the sun is ~13 deg down */
  var twiK = skySmooth(Math.sin(-13*SKY_D), Math.sin(-1*SKY_D), S.sunDir.y);
  _skB.lerp(_skNHor, Math.max(0, 1 - Math.max(S.sunUp, 0.80*twiK)));
  /* an eclipse is deep TWILIGHT, not night: the rim and the sky beyond the
     giant still light it */
  _skA.lerp(_skTwi, ecl*0.92); _skB.lerp(_skTwi, ecl*0.78);
  SKY_DOME_U.uSkyZen.value.copy(_skA).convertSRGBToLinear();
  SKY_DOME_U.uSkyHor.value.copy(_skB).convertSRGBToLinear();
  SKY_DOME_U.uSkyK.value = SKY.skyModelK;
  SKY_DOME_U.uHazeCol.value.copy(_skB).convertSRGBToLinear();
  SKY_DOME_U.uHazeH.value = 0.030 + 0.115*pk;          /* thicker band at high pressure */
  /* x0.62 against Voth: this build's bake already carries its own haze bank, and
     the canopy silhouette + far volcano have to survive the band */
  SKY_DOME_U.uHazeA.value = 0.62*(0.22 + 0.46*pk)*(0.35 + 0.65*S.dayK);
  SKY_DOME_U.uSunDirS.value.copy(S.sunDir);
  _skA.copy(_skSunC).lerp(_skSet, duskK);
  SKY_DOME_U.uSunGlowC.value.copy(_skA).convertSRGBToLinear();
  SKY_DOME_U.uSunGlowK.value = (0.22 + 0.30*duskK)*Math.max(S.sunUp, 0.55*twiK)*(1 - ecl);
  SKY_DOME_U.uSunGlowP.value = 42 - 30*duskK - 8*pk;   /* a longer afterglow in thick air */
  /* the giant's own extinction, off the same pressure the dome's haze uses.
     uHazeCol is already the same Color object as uSkyHor, so it is current. */
  giantMat.uniforms.uHazeH.value = SKY_DOME_U.uHazeH.value;
  giantMat.uniforms.uHazeK.value = SKY_GIANT_HAZE_K*pk*pk;
  giantMat.uniforms.uAir.value.copy(SKY_DOME_U.uSkyZen.value).lerp(SKY_DOME_U.uSkyHor.value, 0.45).multiplyScalar(0.92*SKY_DOME_U.uSkyK.value);

  /* --- the key light -------------------------------------------------
     ONE directional light, not two. The brief asks for a second
     DirectionalLight along giantDir for planetshine, but a second
     shadow-casting light means a whole second shadow-map pass, and a
     non-shadow-casting one cannot deliver the brief's own acceptance test
     ("city lit softly from the north with SOUTH-POINTING SHADOWS"). So the
     city's existing shadow-casting `sun` is slerped between the two
     directions, weighted by their relative strength: by construction
     planetshine only matters where sunlight does not, so the two are never
     both strong and the swing happens entirely in the dim. During an
     eclipse the two directions are within a few degrees of each other
     anyway, so the handover there is a no-op.

     NOTE ON THE BRIEF'S OWN PLANETSHINE FORMULA. It reads
     `0.08 * illuminatedFraction * (1 - sunUp)`, and adds "it also survives
     an eclipse, dimmed, and is the reason the eclipse is dusk rather than
     black". Those two cannot both hold: during an eclipse the giant is
     between the observer and the sun, so it is NEW by construction and
     illuminatedFraction is ~0.001 (measured). Driving eclipse light from
     planetshine gives a total blackout at noon, which the brief itself
     forbids. What actually lights an eclipse is the ring of sunlight
     refracted through the giant's limb — the same thing the brief makes the
     giant's headline visual. So the eclipse term is its own, independent of
     the phase, warm (refracted, not reflected), and still coming from the
     giant's direction, so the shadows stay northern. */
  var sunI   = S.sunK;
  var shineI = 0.44*S.lit*(1 - S.sunUp) + SKY_ECL_KEY*ecl;
  var w = shineI/(sunI + shineI + 1e-6);
  _skKey.copy(S.sunDir);
  S.keyDir.copy(_skKey);
  if(w > 0.0005){
    if(_skKey.angleTo(GIANT_DIR) > 1e-4){
      _skQ.setFromUnitVectors(_skKey, GIANT_DIR);     /* the full sun -> giant rotation */
      _skQ2.set(0,0,0,1).slerp(_skQ, w);              /* take the w-th part of it */
      S.keyDir.copy(_skKey).applyQuaternion(_skQ2).normalize();
    }else S.keyDir.copy(GIANT_DIR);
  }
  S.keyCol.copy(_skWarm).lerp(_skLow, lowK*0.55*(1-w)).lerp(_skShine, w).lerp(_skEclRim, ecl*0.85);
  S.keyI = sunI + shineI;

  /* --- sky ambient ---------------------------------------------------- */
  S.hemiSky.copy(SKY_DOME_U.uSkyZen.value).convertLinearToSRGB();
  S.hemiGround.setHex(SKYC_SOIL);

  /* --- pressure -> fog and shadow contrast ----------------------------
     r128's PCFSoftShadowMap ignores shadow.radius, so "hard vs soft
     shadows" is delivered the way the atmosphere actually delivers it:
     the ratio of the directional key to the scattered sky fill. Thin air
     = a hard, contrasty key; thick air = a milky, low-contrast one. */
  S.fogScale    = Math.pow(p/1.6, 1.15);
  S.shadowSoft  = pk;
}

/* The city's fog density with the local air pressure folded in — the brief's
   "scene fog density proportional to pressure". 83-weather.js multiplies its
   storm/ash factors on top of THIS rather than PAL.fogDensity, so a storm in
   an abyss city is thicker than a storm on a plateau. At the default 1.6 atm
   this returns PAL.fogDensity exactly, so nothing already tuned moves. */
function skyFogBase(){ return PAL.fogDensity * SKY_STATE.fogScale; }

/* ---------------------------------------------------------------- render
   Called from 80-camera.js's frame(), before the city pass. */
function skyRender(){
  skyCam.quaternion.copy(camera.quaternion);
  if(skyCam.fov !== camera.fov || skyCam.aspect !== camera.aspect){
    skyCam.fov = camera.fov; skyCam.aspect = camera.aspect; skyCam.updateProjectionMatrix();
  }
  renderer.render(skyScene, skyCam);
}

/* ---------------------------------------------------------------- panel */
var SKY_PANEL_REFRESH = null;
(function(){
  var css = document.createElement('style');
  css.textContent =
    '#skyUI{position:fixed;right:10px;bottom:10px;z-index:12;width:212px;padding:7px 9px;' +
      'background:rgba(22,20,26,.80);border:1px solid rgba(216,200,154,.28);border-radius:3px;' +
      'font:10.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#c9c0ac}' +
    '#skyUI h2{margin:0 0 5px;font:600 10px/1 inherit;letter-spacing:.14em;text-transform:uppercase;color:#d8c89a}' +
    '#skyUI label{display:flex;justify-content:space-between;margin-top:3px}' +
    '#skyUI input[type=range]{width:100%;accent-color:#d8c89a;display:block;margin:0 0 2px;height:12px}' +
    '#skyUI .row{display:flex;gap:6px;margin-top:5px;flex-wrap:wrap}' +
    '#skyUI .row span{cursor:pointer;padding:1px 5px;border:1px solid rgba(216,200,154,.30);border-radius:2px}' +
    '#skyUI .row span.on{background:rgba(216,200,154,.26);border-color:rgba(216,200,154,.8);color:#f0e6cc}' +
    '#skyUI.min > *:not(h2){display:none}';
  document.head.appendChild(css);
  var box = document.createElement('div'); box.id = 'skyUI';
  box.innerHTML = '<h2 style="cursor:pointer">Krator sky</h2>';
  box.style.display = 'none';
  document.body.appendChild(box);
  (function(){
    var host = document.getElementById('ui'); if(!host) return;
    var b = document.createElement('button'); b.id = 'skyPanelToggle'; b.textContent = 'Sky panel';
    b.onclick = function(){ var on = box.style.display === 'none'; box.style.display = on ? 'block' : 'none'; b.classList.toggle('on', on); };
    host.appendChild(b);
  })();
  box.querySelector('h2').onclick = function(){ box.classList.toggle('min'); };

  var rows = [
    ['hour',        0,  24,  0.05, function(){ return skyHour(); },       function(v){ skySetHour(v); },              function(v){ var h=Math.floor(v),m=Math.floor((v-h)*60); return (h<10?'0':'')+h+':'+(m<10?'0':'')+m; }],
    ['dayOfYear',   0, 364,  1,    function(){ return skyDayOfYear(); },  function(v){ skySetDayOfYear(v); },         function(v){ return v|0; }],
    ['latitude',  -80,  80,  1,    function(){ return SKY.latitude; },    function(v){ SKY.latitude = v; },           function(v){ return v.toFixed(0)+'°'; }],
    ['subPlanetLon',-180,180, 1,   function(){ return SKY.subPlanetLonDeg; }, function(v){ SKY.subPlanetLonDeg = v; }, function(v){ return v.toFixed(0)+'°'+(v>0?' E':(v<0?' W':'')); }],
    /* these two READ the derived value and WRITE an override, so dragging
       either one detaches it from subPlanetLon until 'derived' is clicked */
    ['giantAz',     0, 360,  1,    function(){ return SKY.giantAz; },     function(v){ SKY.giantAzOverride = v; },    function(v){ return v.toFixed(0)+'°'; }],
    ['giantAlt',    0,  89,  1,    function(){ return SKY.giantAlt; },    function(v){ SKY.giantAltOverride = v; },   function(v){ return v.toFixed(0)+'°'; }],
    ['giantDia',    4,  60,  0.5,  function(){ return SKY.giantDiaDeg; }, function(v){ SKY.giantDiaDeg = v; },        function(v){ return v.toFixed(1)+'°'; }],
    ['pressureAtm',0.4, 2.6, 0.05, function(){ return SKY.pressureAtm; }, function(v){ SKY.pressureAtm = v; },        function(v){ return v.toFixed(2); }]
  ];
  var live = [];
  rows.forEach(function(r){
    var lab = document.createElement('label');
    var out = document.createElement('span');
    lab.innerHTML = '<span>'+r[0]+'</span>'; lab.appendChild(out);
    var inp = document.createElement('input');
    inp.type='range'; inp.min=r[1]; inp.max=r[2]; inp.step=r[3]; inp.value=r[4]();
    var dragging = false;
    inp.addEventListener('pointerdown', function(){ dragging = true; });
    ['pointerup','pointercancel'].forEach(function(e){ inp.addEventListener(e, function(){ dragging=false; }); });
    inp.addEventListener('input', function(){ r[5](parseFloat(inp.value)); });
    box.appendChild(lab); box.appendChild(inp);
    live.push(function(){ if(!dragging) inp.value = r[4]();  out.textContent = r[6](parseFloat(inp.value)); });
  });
  function toggleRow(items, get, set){
    var row = document.createElement('div'); row.className='row';
    items.forEach(function(it){
      var s = document.createElement('span'); s.textContent = it[0];
      s.onclick = function(){ set(it[1]); };
      row.appendChild(s);
      live.push(function(){ s.classList.toggle('on', get() === it[1]); });
    });
    box.appendChild(row);
  }
  toggleRow([['0x',0],['1x',1],['60x',60],['600x',600]],
            function(){ return SKY.timeScale; }, function(v){ SKY.timeScale = v; });
  toggleRow([['eclipse',true],['no eclipse',false]],
            function(){ return SKY.forceEclipse; }, function(v){ SKY.forceEclipse = v; });
  toggleRow([['rings',true],['no rings',false]],
            function(){ return SKY.showRings; }, function(v){ SKY.showRings = v; });
  /* 'derived' drops the az/alt overrides so the giant goes back to being a
     consequence of latitude + subPlanetLon; 'NE'/'NW' are the two cities the
     author names, one sign flip apart. */
  toggleRow([['derived',0],['57 E / NE',57],['57 W / NW',-57]],
            function(){ return (SKY.giantAzOverride == null && SKY.giantAltOverride == null) ? SKY.subPlanetLonDeg : -999; },
            function(v){ SKY.giantAzOverride = null; SKY.giantAltOverride = null;
                         if(v) SKY.subPlanetLonDeg = v; });
  var read = document.createElement('div');
  read.style.cssText = 'margin-top:6px;color:#9a917f;white-space:pre';
  box.appendChild(read);
  live.push(function(){
    var S = SKY_STATE;
    read.textContent = 'sun  alt ' + S.sunAlt.toFixed(1) + '°  az ' + S.sunAz.toFixed(1) + '°\n' +
                       'sep  ' + S.sepDeg.toFixed(1) + '°   lit ' + S.lit.toFixed(2) +
                       '   ecl ' + S.ecl.toFixed(2);
  });
  SKY_PANEL_REFRESH = function(){ if(box.style.display === 'none') return; for(var i=0;i<live.length;i++) live[i](); };
})();

/* ---------------------------------------------------------------- probe */
window._sky = {
  params: SKY, state: SKY_STATE,
  hour: skyHour, dayOfYear: skyDayOfYear,
  setHour: skySetHour, setDay: skySetDayOfYear,
  set: function(k, v){ if(k in SKY){ SKY[k] = v; return true; } return false; },
  sunAltAz: skySunAltAz,
  /* recompute without waiting a frame, so a headless probe can sweep hours
     and days and read the state back synchronously */
  update: function(){ updateSky(); if(typeof updateDayNight === 'function') updateDayNight(); },
  fogOnSkyScene: function(){ return skyScene.fog ? 'PRESENT' : 'none'; },
  contents: function(){ return skyScene.children.map(function(o){ return o.type+'#'+o.renderOrder; }); },
  domeUniforms: SKY_DOME_U,
  /* a star's CURRENT world direction — matrixWorld is only refreshed by a
     render, so a headless sweep that steps the hour without rendering must
     force it or it measures the previous frame and concludes the stars are
     nailed down */
  starDir: function(i){
    starGroup.updateMatrixWorld(true);
    var pts = starGroup.children[0];
    return new THREE.Vector3().fromBufferAttribute(pts.geometry.attributes.position, i||0)
             .applyMatrix4(pts.matrixWorld).normalize();
  },
  poleDir: function(){ return SKY_POLE.clone(); },
  /* Position angle of the sun as seen FROM the giant, in the plane of the
     sky: 0 = the sun is directly above the disc, +90 = directly to its right
     (clockwise). The terminator runs PERPENDICULAR to this, so a vertical
     terminator means a position angle of +/-90. Worth having as a number
     rather than an eyeball: the brief's "vertical terminator at the half
     phases" is a property of WHERE the giant sits, not of the phase code,
     and it stops being true once the giant leaves the meridian. */
  sunPositionAngle: function(){
    var g = SKY_STATE.giantDir, s = SKY_STATE.sunDir;
    var up = new THREE.Vector3(0,1,0).addScaledVector(g, -g.y).normalize();
    var right = new THREE.Vector3().copy(g).cross(up).normalize();
    var p = new THREE.Vector3().copy(s).addScaledVector(g, -s.dot(g));
    if(p.lengthSq() < 1e-12) return 0;
    return Math.atan2(p.dot(right), p.dot(up))/SKY_D;
  },
  refreshPanel: function(){ if(SKY_PANEL_REFRESH) SKY_PANEL_REFRESH(); },
  /* the disc's apparent diameter, measured off the projection rather than
     asserted — the "30 degrees from street level or a tower" acceptance test */
  giantPixelWidth: function(){
    var r = giantMesh.scale.x, c = giantMesh.position;
    var a = new THREE.Vector3().copy(c), b = new THREE.Vector3().copy(c);
    var side = new THREE.Vector3().copy(c).cross(new THREE.Vector3(0,1,0)).normalize();
    a.addScaledVector(side, r); b.addScaledVector(side, -r);
    /* sync the sky camera the way skyRender() does before projecting: this is
       called from headless probes that step the clock WITHOUT rendering, and
       an unsynced skyCam still holds the previous frame's orientation and
       projection — which silently returns a huge number when the giant is
       behind that stale camera. */
    skyCam.quaternion.copy(camera.quaternion);
    skyCam.fov = camera.fov; skyCam.aspect = camera.aspect;
    skyCam.updateProjectionMatrix();
    skyCam.updateMatrixWorld(true);
    a.project(skyCam); b.project(skyCam);
    /* behind the camera: projection is meaningless, say so rather than lie */
    if(a.z > 1 || b.z > 1) return -1;
    return Math.abs(a.x-b.x)*0.5*renderer.domElement.width;
  },
  giantAngularDeg: function(){ return 2*Math.atan(giantMesh.scale.x/SKY_R_GIANT)/SKY_D; },
  scene: skyScene, cam: skyCam, giant: giantMesh, rings: ringMesh, stars: starGroup
};

/* ------------------------------------------------- the sign check, run once
   A mirrored azimuth is silent: every screenshot still shows a sun in the
   sky, just on the wrong side, and every later test then measures garbage.
   So it is asserted at load against the brief's own table instead of trusted.
   Failures print into the page's error panel, which verify.py --assert reads. */
(function skyCheckSigns(){
  function near(a, b, tol){ return Math.abs(a-b) <= tol; }
  var bad = [], keepLatY = SKY.latitude; SKY.latitude = -40;   /* the table below is the brief's, written for 40 S; Yuni's own latitude is restored after */
  var cases = [
    [12,  80,  50.00,   0, 'noon day 80: due north at 50'],
    [ 6,  80,   0.00,  90, '06:00 day 80: due EAST (the case the noon test cannot catch)'],
    /* the brief author's own second acceptance point, added after they found
       the same mirrored-azimuth bug independently: 08:00 on day 80 must put
       the sun about 22 degrees up in the NORTH-EAST. Guarded here rather
       than left to coincide. */
    [ 8,  80,  22.52,  69.64, '08:00 day 80: ~22 deg up at ~70 deg, north-east'],
    [18,  80,   0.00, 270, '18:00 day 80: due west'],
    [12, 172,  27.00,   0, 'noon day 172: midwinter, 27 in the north'],
    [12, 355,  72.99,   0, 'noon day 355: midsummer, 73 in the north']
  ];
  cases.forEach(function(c){
    var r = skySunAltAz(c[0], c[1]);
    if(!near(r.alt, c[2], 0.05) || !near(((r.az - c[3] + 540)%360)-180, 0, 0.05))
      bad.push(c[4] + ' -> alt ' + r.alt.toFixed(2) + ' az ' + r.az.toFixed(2));
  });
  /* the stars must wheel the same way the sun does: at equinox the sun sits
     ON the celestial equator, so rotating the 06:00 sun +90 degrees about the
     south celestial pole must land exactly on the 12:00 sun. */
  var v6 = skySunDir(6, 80, new THREE.Vector3());
  var v12 = skySunDir(12, 80, new THREE.Vector3());
  v6.applyAxisAngle(altAzToVec(-SKY.latitude, 180, new THREE.Vector3()), Math.PI/2);   /* the pole for the latitude under test */
  if(v6.distanceTo(v12) > 1e-4)
    bad.push('star rotation sign: +2pi*h/24 about the south pole does not track the sun (' +
             v6.distanceTo(v12).toFixed(4) + ')');
  /* the giant's derivation, against BOTH known reference points: the current
     57-east city, and the original brief's own "a little east of the
     sub-planet meridian" case, which must still come out at azimuth 356.
     This is the check that would catch the east/west sign of
     subPlanetLonDeg being flipped — the analogue, for the giant, of the
     mirrored sun azimuth above. */
  (function(){
    var keepLon = SKY.subPlanetLonDeg, keepAz = SKY.giantAzOverride, keepAlt = SKY.giantAltOverride;
    SKY.giantAzOverride = SKY.giantAltOverride = null;
    [[57, 24.66, 67.34, '57 deg east -> north-east'],
     [-57, 24.66, 292.66, '57 deg west -> north-west'],
     [-2.57, 49.93, 356.01, "the brief's original 'a little east of the meridian'"],
     [0, 50.00, 0.00, 'on the sub-planet meridian -> due north at 90-|lat|']
    ].forEach(function(c){
      SKY.subPlanetLonDeg = c[0];
      var g = skyGiantPos();
      if(!near(g.alt, c[1], 0.02) || !near(((g.az - c[2] + 540)%360)-180, 0, 0.02))
        bad.push('giant from subPlanetLon ' + c[3] + ' -> alt ' + g.alt.toFixed(2) + ' az ' + g.az.toFixed(2));
    });
    SKY.subPlanetLonDeg = keepLon; SKY.giantAzOverride = keepAz; SKY.giantAltOverride = keepAlt;
    SKY.latitude = keepLatY;
    skyGiantGeometry();
  })();
  if(bad.length && typeof ERR === 'function') ERR('SKY SIGN CHECK FAILED:\n  ' + bad.join('\n  '));
  window._skySignCheck = bad.length ? bad : 'ok';
})();
