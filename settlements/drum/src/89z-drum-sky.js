// ================================================================= DRUM — 89z: Shared Sky & Atmosphere ([web])
// ATMOS.skyBiome at Drum's Scale Model 5.1 coordinates (px=673, py=932, elev=-792 m, SW Basin).

const SKY = ATMOS.skyBiome({
  renderer: renderer,
  camera: camera,
  scene: scene,
  sun: sun,
  site: { px: 673, py: 932 },
  preset: { air: { pressure: 1.12, humidity: 0.44 }, clouds: { cover: 0.28, cumulus: 0.5, cirrus: 0.35 }, fogDensity: 0.00016 }
});
ATMOS.bindHost({ THREE: THREE, scene: scene, camera: camera, renderer: renderer, ticks: ANC_TICKS, ground: drumGroundAt, hour: function () { return 15.2; }, seed: DRUM_SEED, viewH: function () { return window.innerHeight; } });
