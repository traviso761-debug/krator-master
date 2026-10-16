/* ============================== ATMOS: the shared atmosphere module, bound to Locus ==============================
   core/atmos (its README.md). Locus (and Mungo, which reads this fragment by name) takes it for the water: the open
   lake is core/water's (90w-lake.js: the shared wave field, calm, on the module clock wrapped at a whole number of
   cycles, and the sky's light, 89-atmos-b-skylight.js, given to the lake only: this is a Lambert world); the sheet of
   75-terrain.js (the river, the channels, the pools) shades with the wave field where it is open (waterOpenAt) and is
   not displaced. Nothing else is placed
   through ATMOS: the lamps, fires and glow are the world's own (72-lights, 81-glow). frame() in 80-camera.js calls
   atmosFrame(dt) last, just before it draws. */
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
if(waterUni) ATMOS.waveUniforms(waterUni);
