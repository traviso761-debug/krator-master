/* ============================== WEATHER ==============================
   A three-state cycle (clear / storm / ash), layered on top of whatever
   82-daynight.js's own hour-of-day lighting already set this frame — this
   file only ever multiplies/darkens further and adds particles/lightning/
   volcano-forcing, it never overwrites the day/night values outright, so
   the two compose correctly regardless of which hour a storm hits. Driven
   by the #weatherToggle button in the page shell (click cycles clear ->
   storm -> ash -> clear); updateWeather(dt) is called explicitly from
   82-daynight.js's own tick() (function declarations hoist across
   fragments inside the single BUILD() scope, so the call site there
   predating this file's own text is fine). */
reseed(830001);

var WEATHER = 'clear';   /* 'clear' | 'storm' | 'ash' */
var WEATHER_STORM_K = 0; /* smoothed 0..1 per state, eases in/out over ~1.5s */
var WEATHER_ASH_K = 0;   /* so the toggle doesn't snap */

var STORM_FOG_COL = new THREE.Color(0x4a4f57);
var STORM_SKY_COL = new THREE.Color(0x565c66);
/* ash storm: a dusty, volcano-warmed haze — browner and denser than the
   thunderstorm's cool grey, since this is airborne ash and grit, not rain
   cloud, and the forced 'violent' eruption (below) is meant to glow
   through it rather than just darken the scene. */
var ASH_FOG_COL = new THREE.Color(0x6b5d49);
var ASH_SKY_COL = new THREE.Color(0x8a7454);
var _wxFog = new THREE.Color();

/* rain: one InstancedMesh of thin falling streaks, following the camera
   in x/z so it always reads as "raining around you" without needing a
   city-spanning particle field. One more draw call, only while raining. */
var RAIN_N = 420;
var RAIN_SPAN = 380, RAIN_TOP = 210, RAIN_BOTTOM = -4;
var rainGeo = new THREE.BoxGeometry(0.06, 2.4, 0.06);
var rainMat = new THREE.MeshBasicMaterial({ color:0xb9c6d1, transparent:true, opacity:0,
  fog:false, depthWrite:false });
var rainMesh = new THREE.InstancedMesh(rainGeo, rainMat, RAIN_N);
rainMesh.frustumCulled = false;
var rainY = new Float32Array(RAIN_N), rainOX = new Float32Array(RAIN_N), rainOZ = new Float32Array(RAIN_N);
(function(){
  for(var i=0;i<RAIN_N;i++){
    rainOX[i] = rr(-RAIN_SPAN, RAIN_SPAN);
    rainOZ[i] = rr(-RAIN_SPAN, RAIN_SPAN);
    rainY[i]  = rr(RAIN_BOTTOM, RAIN_TOP);
  }
})();
scene.add(rainMesh);
var _wxM = new THREE.Matrix4(), _wxQ = new THREE.Quaternion(), _wxS1 = new THREE.Vector3(0.6,1,0.6);

/* ashfall + dust gales: a second, separate particle pool — flat, tumbling
   flecks (not thin streaks like rain), pale ash colour, falling much
   slower than rain but with a strong sideways gale drift so it reads as
   wind-blown ash rather than vertical precipitation. Own InstancedMesh
   (own draw call, budgeted below) since it needs a different geometry,
   colour and motion from rain and both can in principle be toggled
   independently later even though today's UI only exposes one state at
   a time. */
var ASH_N = 360;
var ASH_SPAN = 340, ASH_TOP = 190, ASH_BOTTOM = -4;
var ashGeo = new THREE.BoxGeometry(0.35, 0.05, 0.35);
var ashMat = new THREE.MeshBasicMaterial({ color:0xc9bda3, transparent:true, opacity:0,
  fog:false, depthWrite:false });
var ashMesh = new THREE.InstancedMesh(ashGeo, ashMat, ASH_N);
ashMesh.frustumCulled = false;
var ashY = new Float32Array(ASH_N), ashOX = new Float32Array(ASH_N), ashOZ = new Float32Array(ASH_N);
var ashRotY = new Float32Array(ASH_N), ashRotSpin = new Float32Array(ASH_N);
var GALE_DX = 14, GALE_DZ = 6;   /* world units/sec of sideways drift — the "gale" */
(function(){
  for(var i=0;i<ASH_N;i++){
    ashOX[i] = rr(-ASH_SPAN, ASH_SPAN);
    ashOZ[i] = rr(-ASH_SPAN, ASH_SPAN);
    ashY[i]  = rr(ASH_BOTTOM, ASH_TOP);
    ashRotY[i] = rr(0, Math.PI*2);
    ashRotSpin[i] = rr(-2.2, 2.2);
  }
})();
scene.add(ashMesh);
var _wxQ2 = new THREE.Quaternion(), _wxS2 = new THREE.Vector3(1,1,1), _wxAxisY = new THREE.Vector3(0,1,0);

/* lightning: a brief whole-scene flash, fog/background pushed toward white
   and a momentary hemi-light spike, no new geometry needed. */
var lightningT = 0, nextLightning = rr(7,15), lightningFlash = 0;
var FLASH_COL = new THREE.Color(0xeaeefb);

function updateWeather(dt){
  var stormTarget = (WEATHER === 'storm') ? 1 : 0;
  var ashTarget   = (WEATHER === 'ash') ? 1 : 0;
  WEATHER_STORM_K += (stormTarget - WEATHER_STORM_K) * Math.min(1, dt*0.7);
  WEATHER_ASH_K   += (ashTarget   - WEATHER_ASH_K)   * Math.min(1, dt*0.7);
  var k = WEATHER_STORM_K, a = WEATHER_ASH_K;

  if(k > 0.001){
    sun.intensity *= (1 - 0.72*k);
    hemiLight.intensity *= (1 - 0.42*k);
    ambLight.intensity *= (1 - 0.30*k);

    _wxFog.copy(scene.fog.color).lerp(STORM_FOG_COL, k*0.72);
    scene.fog.color.copy(_wxFog);
    skyScene.background.copy(_wxFog);
    scene.fog.density = skyFogBase() * (1 + 2.4*k);
    waterUni.uFogDen.value = scene.fog.density;
    waterUni.uFogCol.value.copy(_wxFog);
    skyMesh.material.color.lerp(STORM_SKY_COL, k*0.5);
  }

  if(a > 0.001){
    /* ash blocks and scatters daylight more than a rain cloud does, but the
       forced 'violent' eruption below adds its own warm glow back in, so
       the sun/hemi cut is a bit gentler than the storm's and the sky tint
       leans warm/dusty rather than cool/grey. */
    sun.intensity *= (1 - 0.55*a);
    hemiLight.intensity *= (1 - 0.20*a);
    ambLight.intensity *= (1 - 0.15*a) + 0.10*a;   /* ash-lit ambient floor, never fully dark under a glowing sky */

    _wxFog.copy(scene.fog.color).lerp(ASH_FOG_COL, a*0.80);
    scene.fog.color.copy(_wxFog);
    skyScene.background.copy(_wxFog);
    scene.fog.density = skyFogBase() * (1 + 3.6*a);   /* denser than storm — ash cuts visibility hard */
    waterUni.uFogDen.value = scene.fog.density;
    waterUni.uFogCol.value.copy(_wxFog);
    skyMesh.material.color.lerp(ASH_SKY_COL, a*0.62);

    VOLCANO_FORCE = 'violent';
  }else if(VOLCANO_FORCE){
    VOLCANO_FORCE = null;   /* hand the sky back to the normal idle/small/large cycle */
  }

  rainMat.opacity = 0.5*k;
  if(k > 0.02){
    var camXr = camera.position.x, camZr = camera.position.z;
    for(var i=0;i<RAIN_N;i++){
      rainY[i] -= dt*100;
      if(rainY[i] < RAIN_BOTTOM){
        rainY[i] = RAIN_TOP; rainOX[i] = rr(-RAIN_SPAN,RAIN_SPAN); rainOZ[i] = rr(-RAIN_SPAN,RAIN_SPAN);
      }
      _wxM.compose(new THREE.Vector3(camXr+rainOX[i], rainY[i], camZr+rainOZ[i]), _wxQ, _wxS1);
      rainMesh.setMatrixAt(i, _wxM);
    }
    rainMesh.instanceMatrix.needsUpdate = true;
  }

  ashMat.opacity = 0.62*a;
  if(a > 0.02){
    var camXa = camera.position.x, camZa = camera.position.z;
    for(var j=0;j<ASH_N;j++){
      ashY[j] -= dt*10;                 /* slow fall — ash, not rain */
      ashOX[j] += dt*GALE_DX;           /* strong sideways gale drift, the "dust gale" */
      ashOZ[j] += dt*GALE_DZ;
      ashRotY[j] += dt*ashRotSpin[j];   /* tumbling flecks */
      if(ashY[j] < ASH_BOTTOM || ashOX[j] < -ASH_SPAN || ashOX[j] > ASH_SPAN || ashOZ[j] < -ASH_SPAN || ashOZ[j] > ASH_SPAN){
        ashY[j] = ASH_TOP; ashOX[j] = rr(-ASH_SPAN,ASH_SPAN); ashOZ[j] = rr(-ASH_SPAN,ASH_SPAN);
      }
      _wxQ2.setFromAxisAngle(_wxAxisY, ashRotY[j]);
      _wxM.compose(new THREE.Vector3(camXa+ashOX[j], ashY[j], camZa+ashOZ[j]), _wxQ2, _wxS2);
      ashMesh.setMatrixAt(j, _wxM);
    }
    ashMesh.instanceMatrix.needsUpdate = true;
  }

  if(k > 0.5){
    lightningT += dt;
    if(lightningT > nextLightning){
      lightningT = 0; nextLightning = rr(7,16);
      lightningFlash = 1.0;
    }
  }
  if(lightningFlash > 0){
    lightningFlash = Math.max(0, lightningFlash - dt*2.4);
    skyScene.background.lerp(FLASH_COL, lightningFlash*0.65);
    hemiLight.intensity += lightningFlash*1.3;
  }
}

var WEATHER_LABEL = { clear:'Clear', storm:'Thunderstorm', ash:'Ash Storm' };
var WEATHER_NEXT   = { clear:'storm', storm:'ash', ash:'clear' };
function setWeather(w){
  WEATHER = WEATHER_LABEL[w] ? w : 'clear';
  var btn = document.getElementById('weatherToggle');
  if(btn) btn.textContent = 'Weather: ' + WEATHER_LABEL[WEATHER];
}
(function(){
  var btn = document.getElementById('weatherToggle');
  if(btn) btn.onclick = function(){ setWeather(WEATHER_NEXT[WEATHER]); };
})();

window._weather = { get: function(){ return WEATHER; }, set: setWeather };   /* diagnostic + external control */
