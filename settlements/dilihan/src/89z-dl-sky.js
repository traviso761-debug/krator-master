// ================================================================= DILIHAN — Standard Krator Skybox at (-31.50 deg S, 56.27 deg) (core/atmos)
// [web] Binds ATMOS.skyBiome at Dilihan's exact Scale Model 5.1 latitude (-31.50 deg S, subGiantLon 56.27 deg, matching
// ATMOS.siteAt(744 - 272, 663 - 330) = ATMOS.siteAt(472, 333): PLAN.md §2.2), dense-air 1.788 atm horizon scattering,
// Cut bowl horizon ridges, and ATMOS.bindHost for core/water surfaces.
const SKY = ATMOS.skyBiome({
  renderer: renderer,
  camera: camera,
  scene: scene,
  sun: sun,
  hemi: hemi,
  shade: false,
  site: {
    latitude: DL_MODEL.latitude,
    subGiantLon: DL_MODEL.subGiantLon
  },
  preset: {
    air: { pressure: DL_MODEL.pressureAtm, humidity: 0.62 },
    clouds: { cover: 0.22, cumulus: 0.38, cirrus: 0.36 },
    fogDensity: 0.000058
  }
});

SKY.modes({
  hours: { day: 10.6, dawn: 6.3, night: 1.2 },
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
  ground: function (x, z) { return DL_GROUND.h(x, z); },
  hour: function () { return SKY.clock.hour; },
  seed: 744663,
  viewH: function () { return window.innerHeight; }
});
