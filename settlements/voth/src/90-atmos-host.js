/* ============================== ATMOS: the shared atmosphere module, bound to Voth ==============================
   core/atmos (its README.md). Voth takes it for the wave field the bay's water shader reads (89-atmos-a-waves.js,
   PRESETS.waves): three families of travelling waves in sets, on the module clock wrapped at a whole number of cycles,
   so the bay never steps or jumps however long the page runs, and ATMOS.clock.fixed = t pins it for a repeatable shot.
   Voth places nothing else through ATMOS yet: its lamps, braziers, weather and night lights are its own (82-daynight.js,
   83-weather.js). frame() in 80-camera.js calls atmosFrame(dt) last, just before it draws. */
var ATMOS_HOOKS = [];
function atmosFrame(dt){ for(var i = 0; i < ATMOS_HOOKS.length; i++) ATMOS_HOOKS[i](dt); }
ATMOS.init({ THREE: THREE, scene: scene, camera: camera,
  hour: function(){ return skyHour(); },
  onFrame: function(fn){ ATMOS_HOOKS.push(fn); },
  ground: function(x, z){ return terrainH(x, z); },
  seed: 90001,
  err: function(m){ console.warn(m); },
  viewH: function(){ return innerHeight; },
  pixelRatio: function(){ return renderer.getPixelRatio(); } });
ATMOS.waveUniforms(waterUni);
