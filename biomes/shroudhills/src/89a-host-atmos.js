// ================================================================= HOST — core/atmos binding [web]
ATMOS.bindHost({
 THREE: THREE,
 scene: scene,
 camera: camera,
 renderer: renderer,
 ticks: TICKS,
 ground: function(x, z){ return terrainH(x, z); },
 hour: function(){ return typeof KHOST !== 'undefined' && KHOST.host ? KHOST.host.clock.hour : 10; },
 seed: STAGE.seed,
 viewH: function(){ return innerHeight; }
});
