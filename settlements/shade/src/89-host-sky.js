// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-11-08: sedesert's painted dome (its old 82-host-sky.js, which this page read in place) is gone; this page draws the
// shared sky as sedesert's own src/89-host-sky.js does: ATMOS.skyBiome at the south-east desert's place on the scale model
// (px 876, 576), on the host clock, driving the sun, the hemisphere, the fog and the exposure from the colour script.
// The preset is sedesert's (its air, clouds and ridges: the Inner Wall and the ranges the old dome painted) with this
// page's fog density (the map is 2.6 km, not the kit's 6.8: 45-host-stage.js).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:876,py:576},
 preset:{"air":{"pressure":1.3,"dustK":0.4,"dust":[0.85,0.77,0.67]},"clouds":{"cover":0.25},"fogDensity":0.00036,"ridges":[{"base":0.25,"amp":0.2,"cycles":40,"octaves":2,"seed":113,"win":[90,90,1.6],"floor":-1,"dist":60000,"haze":0.1101,"rock":[0.69,0.66,0.67]},{"base":3.6,"amp":2.2,"cycles":19,"octaves":5,"seed":61,"peaks":24,"peakAmp":4.5,"win":[270,90,1.2],"floor":0.67,"dist":45000,"haze":0.1278,"rock":[0.59,0.63,0.71]},{"base":14.6,"amp":2.6,"cycles":19,"octaves":5,"seed":62,"peaks":24,"peakAmp":4.5,"win":[270,90,1.2],"floor":0.3,"dist":15000,"haze":0.2441,"rock":[0.42,0.39,0.44]},{"base":0.1,"amp":0.5,"cycles":60,"octaves":2,"seed":17,"win":[270,180,0.6],"floor":0.02,"dist":10000,"haze":0.3661,"rock":[0.6,0.45,0.39]}]}});
