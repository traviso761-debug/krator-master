/* ==== 5b. KRATOR SKY ==== */
reseed(210001);

var SKY_D = Math.PI/180;

/* ==== params ==== */
var SKY = {
  latitude      : -40,      /* deg, south. Westerlies belt; the sun crosses through the NORTH */
  dayLengthH    : 24,       /* h, one orbit of the giant (tidally locked)  */
  yearLengthD   : 365,      /* d                                           */
  tiltDeg       : 23,       /* axial tilt, Earth-like seasons              */

  subPlanetLonDeg  : 57,    /* deg east. 57 -> alt 24.66, az 67.34 (NE)    */
  giantAzOverride  : null,  /* deg, or null to derive from the two above   */
  giantAltOverride : null,
  giantAz       : 67.34,    /* READ-ONLY mirror of the derived value, so    */
  giantAlt      : 24.66,
                            /* read a plain number every frame.             */
  giantDiaDeg   : 30,       /* deg, 60 full moons across                   */
  giantSpinH    : 10,       /* h per rotation of the giant's own bands     */
  sunDiaDeg     : 0.53,     /* deg                                         */
  pressureAtm   : 1.6,      /* 0.8 plateau · 1.6 lowland · 2.0 Ring Sea    */
  skyModelK     : 0.86,     /* how much of the baked dome the pressure/sun model replaces above the horizon band */
  forceEclipse  : false,
  showRings     : true,
  secPerHour    : 5,        /* real seconds per sky hour (the city's own)  */
  timeScale     : 1,        /* 0 · 1 · 60 · 600                            */
  paused        : false
};

/* ==== palette ==== */
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

/* ==== math ==== */
function altAzToVec(altDeg, azDeg, out){
  var a = altDeg*SKY_D, z = azDeg*SKY_D, ca = Math.cos(a);
  return (out || new THREE.Vector3()).set(Math.sin(z)*ca, Math.sin(a), -Math.cos(z)*ca);
}

function skyDeclination(doy){
  return SKY.tiltDeg*SKY_D * Math.sin(2*Math.PI*(doy - 80)/SKY.yearLengthD);
}

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

/* ==== clock ==== */
var SKY_DAY0 = 80;
var SKY_T    = 10*3600;
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

/* ==== scene ==== */
var skyScene = new THREE.Scene();
var skyCam   = new THREE.PerspectiveCamera(camera.fov, camera.aspect, 5, 30000);

skyScene.background = scene.background;
scene.background = null;

var SKY_R_GIANT = 1000, SKY_R_STARS = 3000, SKY_R_SUN = 5000;

/* ==== layer 0: the existing baked volcano dome, moved across ==== */
scene.remove(skyMesh);
skyMesh.position.set(0,0,0);
skyMesh.material.depthTest = false;
skyMesh.renderOrder = -10;
skyScene.add(skyMesh);

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
  uSunGlowP : { value: 16.0 }
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
        '  }',
        '#include <tonemapping_fragment>' ].join('\n'));
};
skyMesh.material.customProgramCacheKey = function(){ return 'kratorDome'; };
skyMesh.material.needsUpdate = true;

/* ==== layer 1: the stars ==== */
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

/* ==== layer 2: the giant ==== */
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

    uHazeCol : { value: null },
    uHazeK   : { value: 0 },
    uHazeH   : { value: 0.1 }
  },
  vertexShader: [
    'varying vec3 vN; varying vec3 vV; varying vec3 vSky;',
    'void main(){',
    '  vec4 wp = modelMatrix * vec4(position, 1.0);',
    '  vN = normalize(mat3(modelMatrix) * normal);',
    '  vV = normalize(cameraPosition - wp.xyz);',

    '  vSky = normalize(wp.xyz);',
    '  gl_Position = projectionMatrix * viewMatrix * wp;',
    '}' ].join('\n'),
  fragmentShader: [
    'uniform vec3 uSunDir, uAxis, uE1, uE2, uZone, uBelt, uStormC, uRimCol, uNightC, uHazeCol;',
    'uniform vec4 uS1, uS2;',
    'uniform float uSpin, uSunI, uRim, uMoonSh, uShadR, uRingSh, uRingLat, uHazeK, uHazeH;',
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

    '  float hz = uHazeK * exp(-max(vSky.y, 0.0)/max(uHazeH, 0.004));',
    '  outc = mix(outc, uHazeCol, clamp(hz, 0.0, 0.92));',
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

/* ==== rings: a hairline, seen from within their own plane ==== */
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

var ringMesh = new THREE.Mesh(new THREE.RingGeometry(1.30, 2.12, 384, 1), ringMat);
ringMesh.renderOrder = -7;
ringMesh.frustumCulled = false;
skyScene.add(ringMesh);

/* ==== layer 3: the sun ==== */
var sunDiscMat = new THREE.MeshBasicMaterial({ color: SKYC_SUN_CORE, fog: false, depthWrite: false });
var sunDisc = new THREE.Mesh(new THREE.CircleGeometry(1, 40), sunDiscMat);
sunDisc.renderOrder = -4;
sunDisc.frustumCulled = false;
skyScene.add(sunDisc);

[sunSprite, moonSprite, moon2].forEach(function(s){
  scene.remove(s);
  s.material.depthTest = true;
  skyScene.add(s);
});
sunSprite.renderOrder  = -3;
moonSprite.renderOrder = -5;
moon2.renderOrder      = -5;

/* ==== state ==== */
var SKY_STATE = {
  hour: 10, dayOfYear: 80,
  sunDir: new THREE.Vector3(0,1,0), giantDir: new THREE.Vector3(0,1,0),
  sunAlt: 0, sunAz: 0, sepDeg: 90,
  sunUp: 1, ecl: 0, lit: 0, dayK: 1, sunK: 1,
  keyDir: new THREE.Vector3(0,1,0), keyCol: new THREE.Color(0xffffff), keyI: 1,
  hemiSky: new THREE.Color(0xffffff), hemiGround: new THREE.Color(SKYC_SOIL),
  fogScale: 1, shadowSoft: 0
};

var _skKey = new THREE.Vector3(), _skQ = new THREE.Quaternion(), _skQ2 = new THREE.Quaternion();
var _skWarm = new THREE.Color(PAL.sunColor), _skShine = new THREE.Color(SKYC_SHINE);
var _skLow = new THREE.Color(SKYC_SUN_LOW), _skSunC = new THREE.Color(SKYC_SUN_CORE);
var _skEclRim = new THREE.Color(SKYC_ECL_RIM), _skGlare = new THREE.Color(SKYC_SUN_GLARE);

var SKY_ECL_FLOOR = 0.15, SKY_ECL_KEY = 0.34;

var SKY_GIANT_HAZE_K = 1.7;
var _skZenD = new THREE.Color(SKYC_ZEN_DEEP), _skZenH = new THREE.Color(SKYC_ZEN_HAZY);
var _skHorD = new THREE.Color(SKYC_HOR_DEEP), _skHorH = new THREE.Color(SKYC_HOR_HAZY);
var _skNZen = new THREE.Color(SKYC_NIGHT_ZEN), _skNHor = new THREE.Color(SKYC_NIGHT_HOR);
var _skTwi  = new THREE.Color(SKYC_TWILIGHT),  _skSet  = new THREE.Color(SKYC_SUNSET);
var _skA = new THREE.Color(), _skB = new THREE.Color();

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
  SKY.giantAlt = gp.alt; SKY.giantAz = gp.az;
  altAzToVec(SKY.giantAlt, SKY.giantAz, GIANT_DIR);

  _skyTmpA.set(0,1,0).addScaledVector(GIANT_DIR, -GIANT_DIR.y).normalize();
  _skyTmpB.copy(GIANT_DIR).cross(_skyTmpA).normalize();
  GIANT_AXIS.copy(_skyTmpA).multiplyScalar(Math.cos(SKY.tiltDeg*SKY_D))
            .addScaledVector(_skyTmpB, Math.sin(SKY.tiltDeg*SKY_D));

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

  S.dayK  = S.sunUp*(1 - (1 - SKY_ECL_FLOOR)*ecl);

  /* --- stars --------------------------------------------------------- */
  starGroup.setRotationFromAxisAngle(SKY_POLE, 2*Math.PI*hour/SKY.dayLengthH);
  /* stars come out at night, and near the ZENITH ONLY during an eclipse */
  skyStarMat.uniforms.uOpacity.value = Math.max(0, 1 - S.sunUp)*0.95 + 0.55*ecl*S.sunUp;
  skyStarMat.uniforms.uZenK.value = ecl*S.sunUp;

  /* --- the giant ----------------------------------------------------- */
  giantMat.uniforms.uSunDir.value.copy(S.sunDir);
  giantMat.uniforms.uSpin.value = (SKY_T/3600)/SKY.giantSpinH * Math.PI*2;

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
  /* a low sun reddens the horizon, and thick air holds the afterglow longer */
  _skB.lerp(_skSet, duskK*(0.35 + 0.42*pk));
  _skA.lerp(_skNZen, Math.max(0, 1 - S.sunUp));
  _skB.lerp(_skNHor, Math.max(0, 1 - S.sunUp));

  _skA.lerp(_skTwi, ecl*0.92); _skB.lerp(_skTwi, ecl*0.78);
  SKY_DOME_U.uSkyZen.value.copy(_skA).convertSRGBToLinear();
  SKY_DOME_U.uSkyHor.value.copy(_skB).convertSRGBToLinear();
  SKY_DOME_U.uSkyK.value = SKY.skyModelK;
  SKY_DOME_U.uHazeCol.value.copy(_skB).convertSRGBToLinear();
  SKY_DOME_U.uHazeH.value = 0.030 + 0.115*pk;          /* thicker band at high pressure */
  SKY_DOME_U.uHazeA.value = (0.22 + 0.46*pk)*(0.35 + 0.65*S.dayK);
  SKY_DOME_U.uSunDirS.value.copy(S.sunDir);
  _skA.copy(_skSunC).lerp(_skSet, duskK);
  SKY_DOME_U.uSunGlowC.value.copy(_skA).convertSRGBToLinear();
  SKY_DOME_U.uSunGlowK.value = (0.22 + 0.30*duskK)*S.sunUp*(1 - ecl);
  SKY_DOME_U.uSunGlowP.value = 42 - 30*duskK - 8*pk;   /* a longer afterglow in thick air */

  giantMat.uniforms.uHazeH.value = SKY_DOME_U.uHazeH.value;
  giantMat.uniforms.uHazeK.value = SKY_GIANT_HAZE_K*pk*pk;

  var sunI   = S.sunK;
  var shineI = 0.30*S.lit*(1 - S.sunUp) + SKY_ECL_KEY*ecl;
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

  S.fogScale    = Math.pow(p/1.6, 1.15);
  S.shadowSoft  = pk;
}

function skyFogBase(){ return PAL.fogDensity * SKY_STATE.fogScale; }

/* ==== render ==== */
function skyRender(){
  skyCam.quaternion.copy(camera.quaternion);
  if(skyCam.fov !== camera.fov || skyCam.aspect !== camera.aspect){
    skyCam.fov = camera.fov; skyCam.aspect = camera.aspect; skyCam.updateProjectionMatrix();
  }
  renderer.render(skyScene, skyCam);
}

/* ==== panel ==== */
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
  document.body.appendChild(box);
  box.querySelector('h2').onclick = function(){ box.classList.toggle('min'); };

  var rows = [
    ['hour',        0,  24,  0.05, function(){ return skyHour(); },       function(v){ skySetHour(v); },              function(v){ var h=Math.floor(v),m=Math.floor((v-h)*60); return (h<10?'0':'')+h+':'+(m<10?'0':'')+m; }],
    ['dayOfYear',   0, 364,  1,    function(){ return skyDayOfYear(); },  function(v){ skySetDayOfYear(v); },         function(v){ return v|0; }],
    ['latitude',  -80,  80,  1,    function(){ return SKY.latitude; },    function(v){ SKY.latitude = v; },           function(v){ return v.toFixed(0)+'°'; }],
    ['subPlanetLon',-180,180, 1,   function(){ return SKY.subPlanetLonDeg; }, function(v){ SKY.subPlanetLonDeg = v; }, function(v){ return v.toFixed(0)+'°'+(v>0?' E':(v<0?' W':'')); }],

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
  SKY_PANEL_REFRESH = function(){ for(var i=0;i<live.length;i++) live[i](); };
})();

/* ==== probe ==== */
window._sky = {
  params: SKY, state: SKY_STATE,
  hour: skyHour, dayOfYear: skyDayOfYear,
  setHour: skySetHour, setDay: skySetDayOfYear,
  set: function(k, v){ if(k in SKY){ SKY[k] = v; return true; } return false; },
  sunAltAz: skySunAltAz,

  update: function(){ updateSky(); if(typeof updateDayNight === 'function') updateDayNight(); },
  fogOnSkyScene: function(){ return skyScene.fog ? 'PRESENT' : 'none'; },
  contents: function(){ return skyScene.children.map(function(o){ return o.type+'#'+o.renderOrder; }); },
  domeUniforms: SKY_DOME_U,

  starDir: function(i){
    starGroup.updateMatrixWorld(true);
    var pts = starGroup.children[0];
    return new THREE.Vector3().fromBufferAttribute(pts.geometry.attributes.position, i||0)
             .applyMatrix4(pts.matrixWorld).normalize();
  },
  poleDir: function(){ return SKY_POLE.clone(); },

  sunPositionAngle: function(){
    var g = SKY_STATE.giantDir, s = SKY_STATE.sunDir;
    var up = new THREE.Vector3(0,1,0).addScaledVector(g, -g.y).normalize();
    var right = new THREE.Vector3().copy(g).cross(up).normalize();
    var p = new THREE.Vector3().copy(s).addScaledVector(g, -s.dot(g));
    if(p.lengthSq() < 1e-12) return 0;
    return Math.atan2(p.dot(right), p.dot(up))/SKY_D;
  },
  refreshPanel: function(){ if(SKY_PANEL_REFRESH) SKY_PANEL_REFRESH(); },

  giantPixelWidth: function(){
    var r = giantMesh.scale.x, c = giantMesh.position;
    var a = new THREE.Vector3().copy(c), b = new THREE.Vector3().copy(c);
    var side = new THREE.Vector3().copy(c).cross(new THREE.Vector3(0,1,0)).normalize();
    a.addScaledVector(side, r); b.addScaledVector(side, -r);
    skyCam.updateMatrixWorld();
    a.project(skyCam); b.project(skyCam);
    return Math.abs(a.x-b.x)*0.5*renderer.domElement.width;
  },
  giantAngularDeg: function(){ return 2*Math.atan(giantMesh.scale.x/SKY_R_GIANT)/SKY_D; },
  scene: skyScene, cam: skyCam, giant: giantMesh, rings: ringMesh, stars: starGroup
};

/* ==== the sign check, run once ==== */
(function skyCheckSigns(){
  function near(a, b, tol){ return Math.abs(a-b) <= tol; }
  var bad = [];
  var cases = [
    [12,  80,  50.00,   0, 'noon day 80: due north at 50'],
    [ 6,  80,   0.00,  90, '06:00 day 80: due EAST (the case the noon test cannot catch)'],

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

  var v6 = skySunDir(6, 80, new THREE.Vector3());
  var v12 = skySunDir(12, 80, new THREE.Vector3());
  v6.applyAxisAngle(SKY_POLE, Math.PI/2);
  if(v6.distanceTo(v12) > 1e-4)
    bad.push('star rotation sign: +2pi*h/24 about the south pole does not track the sun (' +
             v6.distanceTo(v12).toFixed(4) + ')');

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
    skyGiantGeometry();
  })();
  if(bad.length) report('sky sign check', new Error(bad.join('\n  ')));
  window._skySignCheck = bad.length ? bad : 'ok';
})();
