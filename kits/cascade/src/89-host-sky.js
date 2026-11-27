// ================================================================= HOST — shared sky & atmosphere (core/atmos)  [web]
// Binds core/atmos to the page clock, wind field and Northern Highlands / Cascade upland sky (ATMOS.skyBiome).
let LIGHT_MODE = 'day';
const LIGHT_HOOKS = [];

ATMOS.bindHost({
  THREE: THREE,
  scene: scene,
  camera: camera,
  renderer: renderer,
  ticks: TICKS,
  ground: function (x, z) { return terrainH(x, z); },
  hour: function () { return LIGHT_MODE === 'night' ? 22.0 : (LIGHT_MODE === 'dawn' ? 6.9 : 15.2); },
  seed: 19690,
  viewH: function () { return innerHeight; }
});
BIO.bindAtmosWind();
BIO.setA2C(renderer);

const SKY = ATMOS.skyBiome({
  renderer: renderer,
  camera: camera,
  scene: scene,
  sun: sun,
  site: { px: 412, py: 335 },
  preset: {
    air: { pressure: 1.32, humidity: 0.62 },
    clouds: { cover: 0.30, cumulus: 0.68, cirrus: 0.28 },
    fogDensity: 0.00012,
    ridges: [
      { base: 2.6, amp: 0.8, cycles: 22, octaves: 3, seed: 31, win: [315, 90, 1], floor: -1, dist: 150000, haze: 0.028, forestH: 0, rock: [0.62, 0.67, 0.71] },
      { base: 3.8, amp: 13.0, cycles: 7, octaves: 4, peaks: 22, peakAmp: 8.5, seed: 32, win: [135, 90, 2.75], floor: -2, dist: 42000, snowH: 6200, forestH: 2400, haze: 0.070, rock: [0.43, 0.47, 0.50], forest: [0.36, 0.42, 0.45], snow: [0.94, 0.95, 0.96] },
      { base: 1.5, amp: 3.8, cycles: 16, octaves: 3, seed: 33, win: [[55, 45, 1], [215, 45, 1]], floor: -2, dist: 36000, haze: 0.10, forestH: 0, rock: [0.38, 0.47, 0.49] }
    ]
  }
});
const sky = SKY.legacy.sky;
const giant = SKY.legacy.giant;
const giantRing = SKY.legacy.giantRing;
const giantDir = SKY.legacy.giantDir;
const GIANT_DIST = SKY.legacy.GIANT_DIST;

SKY.modes({
  hours: { day: 15.2, dawn: 6.9, night: 22.0 },
  hooks: LIGHT_HOOKS,
  set: function (m) {
    LIGHT_MODE = m;
    if (AV.setNight) AV.setNight(m === 'night' ? 1.0 : (m === 'dawn' ? 0.35 : 0.0));
  }
});
function setLightMode(m) {
  SKY.setMode(m);
}
