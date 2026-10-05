/* ============================== ATMOS: the shared atmosphere module, bound to Girder ==============================
   core/atmos (its README.md). Girder takes it for the sky's light (89-atmos-b-skylight.js): the background skyScene of
   21-sky.js is captured into a prefiltered cube map and set as scene.environment, so the library families (45-kit.js
   famMaterial: MeshStandardMaterial with the scan's colour, normal and roughness maps) reflect the actual sky - the
   giant, the sun-side glow, the eclipse twilight - instead of only the sun's highlight. PRESETS.skylight.diffuse stays 0:
   the hemisphere and ambient fill in 82-daynight.js remain the only diffuse sky light, as the palette was tuned on.
   The lower half of the capture is the hemisphere light's ground colour at its current strength. It recaptures as the
   hour moves, and when the eclipse or the air pressure changes. frame() in 80-camera.js calls atmosFrame(dt) last,
   just before it draws, so a capture sees the sky as that frame draws it. */
var ATMOS_HOOKS = [];
function atmosFrame(dt){ for(var i = 0; i < ATMOS_HOOKS.length; i++) ATMOS_HOOKS[i](dt); }
ATMOS.init({ THREE: THREE, scene: scene, camera: camera,
  hour: function(){ return skyHour(); },
  onFrame: function(fn){ ATMOS_HOOKS.push(fn); },
  ground: function(x, z){ return terrainH(x, z); },
  seed: 90002,
  err: function(m){ console.warn(m); },
  viewH: function(){ return innerHeight; },
  pixelRatio: function(){ return renderer.getPixelRatio(); } });
var ATMOS_GROUND_COL = new THREE.Color();
ATMOS.skylight({ renderer: renderer, sky: skyScene, scene: scene,
  ground: function(){ return ATMOS_GROUND_COL.copy(hemiLight.groundColor).multiplyScalar(hemiLight.intensity); },
  key: function(){ return Math.round(SKY_STATE.ecl*20) + '|' + SKY.pressureAtm + '|' + SKY.skyModelK; } });
