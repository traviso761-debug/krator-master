// ================================================================= JIMJAM — Standard Krator Skybox at (-34.34 deg S, 56.27 deg) (core/atmos)
// [web] Binds ATMOS.skyBiome at Jimjam's exact Scale Model 5.1 latitude (-34.34 deg S, subGiantLon 56.27 deg, 1.506 atm),
// framing the ringed Gas Giant at Az 70.5 deg ENE (+28.1 deg), stationary Companion at Az 353.3 deg N (+56.1 deg), and
// the day-350 summer-solstice sunset at Az 244.04 deg WSW (+3.00 deg).
const SKY = ATMOS.skyBiome({
  renderer: renderer,
  camera: camera,
  scene: scene,
  sun: sun,
  hemi: hemi,
  shade: false,
  site: {
    latitude: JJ_MODEL.latitude,
    subGiantLon: JJ_MODEL.subGiantLon
  },
  preset: {
    air: { pressure: JJ_MODEL.pressureAtm, humidity: 0.68 },
    clouds: { cover: 0.20, cumulus: 0.34, cirrus: 0.38 },
    fogDensity: 0.000052
  },
  onLook: [
    function (S) {
      /* Keep hemisphere sky-bounce healthy for MeshLambertMaterial biome foliage & bark (which do not sample PMREM) */
      const dayK = Math.max(0, Math.min(1, (S.state.sunAlt + 4) / 16));
      hemi.intensity = Math.max(hemi.intensity, 0.06 + 0.68 * dayK);
      fill.intensity = Math.max(fill.intensity, 0.03 + 0.32 * dayK);
      if (typeof JJ_FLORA_BUNDLE !== 'undefined' && JJ_FLORA_BUNDLE.BIO && JJ_FLORA_BUNDLE.BIO.setSun) {
        JJ_FLORA_BUNDLE.BIO.setSun(S.state.sunDir);
      }
    }
  ]
});

SKY.modes({
  hours: { day: 10.4, dawn: 6.2, night: 1.4 },
  set: function (m) {
    NIGHT = (m === 'night');
  },
  hooks: []
});

ATMOS.bindHost({
  THREE: THREE,
  scene: scene,
  camera: camera,
  renderer: renderer,
  ticks: TICKS,
  ground: function (x, z) { return JJ_GROUND.h(x, z); },
  hour: function () { return SKY.clock.hour; },
  seed: 745546,
  viewH: function () { return window.innerHeight; }
});
