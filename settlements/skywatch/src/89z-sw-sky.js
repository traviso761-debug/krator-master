// ================================================================= SKYWATCH — Standard Krator Skybox at (776, 470) (core/atmos)
// [web] Binds ATMOS.skyBiome at Skywatch's Scale Model 5.1 pin (px 776, py 470, +3,745.5 m ASL, pressure 1.002 atm:
// deep cobalt high-altitude Rayleigh zenith, crisp stars & ENE Gas Giant) and ATMOS.bindHost for WATER.drawStill.
const SKY = ATMOS.skyBiome({
  renderer: renderer,
  camera: camera,
  scene: scene,
  sun: sun,
  hemi: hemi,
  shade: false,
  site: { px: SW_MODEL.px, py: SW_MODEL.py },
  preset: {
    air: { pressure: SW_MODEL.pressureAtm, humidity: 0.34 },
    clouds: { cover: 0.18, cumulus: 0.35, cirrus: 0.45 },
    fogDensity: 0.000042
  }
});

SKY.modes({
  hours: { day: 11.2, dawn: 6.4, night: 1.1 },
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
  ground: function (x, z) { return SW_GROUND.h(x, z); },
  hour: function () { return SKY.clock.hour; },
  seed: 776470,
  viewH: function () { return window.innerHeight; }
});
