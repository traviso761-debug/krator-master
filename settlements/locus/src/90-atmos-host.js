/* ============================== ATMOS: the shared atmosphere module, bound to Locus ==============================
   core/atmos (its README.md). Locus (and Mungo, which reads this fragment by name) takes it for the wave field the
   lake's water shader reads (89-atmos-a-waves.js, PRESETS.waves): the open lake shades with it (75-terrain.js,
   waterOpenAt: away from the shore, the river and the pools), on the module clock wrapped at a whole number of cycles.
   The sheet is not displaced: the swell would come up through the reed decks and the jetties. Not the sky's light
   (89-atmos-b-skylight.js): it lights MeshStandardMaterial only, and this is a Lambert world. Nothing else is placed
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
