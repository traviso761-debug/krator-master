// ================================================================= TORUS — 89z: Shared Sky & Atmosphere ([web])
// ATMOS.skyBiome at Torus's Scale Model 5.1 coordinates (px=774, py=1007, elev=-842 m, SW Agricultural Basin).

const SKY = ATMOS.skyBiome({
  renderer: renderer,
  camera: camera,
  scene: scene,
  sun: sun,
  site: { px: 774, py: 1007 },
  preset: { air: { pressure: 1.14, humidity: 0.58 }, clouds: { cover: 0.34, cumulus: 0.55, cirrus: 0.30 }, fogDensity: 0.00010 }
});
ATMOS.bindHost({ THREE: THREE, scene: scene, camera: camera, renderer: renderer, ticks: ANC_TICKS, ground: TORUS.groundAt, hour: function () { return 14.4; }, seed: TORUS_SEED, viewH: function () { return window.innerHeight; } });
