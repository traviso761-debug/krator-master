/* ================================================================= ARDENT — Standard Krator Skybox at (830, 553) (core/atmos)
   [web] Binds ATMOS.skyBiome at Ardent's Scale Model 5.1 pin (px 830, py 553, +2,801.9 m ASL, pressure 1.127 atm:
   crisp sub-alpine Rayleigh sky, scattered highland clouds & ENE Gas Giant) and ATMOS.bindHost before WATER.drawFlow. */
const SKY = ATMOS.skyBiome({
  renderer: renderer,
  camera: camera,
  scene: scene,
  sun: sun,
  hemi: hemi,
  shade: false,
  site: { px: AR_MODEL.px, py: AR_MODEL.py },
  preset: {
    air: { pressure: AR_MODEL.pressureAtm, humidity: 0.48 },
    clouds: { cover: 0.26, cumulus: 0.42, cirrus: 0.36 },
    fogDensity: 0.000058
  }
});

SKY.modes({
  hours: { day: 10.6, dawn: 6.4, night: 1.1 },
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
  ground: function (x, z) { return AR_GROUND.h(x, z); },
  hour: function () { return SKY.clock.hour; },
  seed: 830553,
  viewH: function () { return window.innerHeight; }
});
