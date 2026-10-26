// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the south-east desert, px 876, 576), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Dry, dusty air. Kept from the dome: the Inner Wall in the west and the ranges behind it, the Abyss's far side and the mesas
// (ridges); the wall's strata, gullies and talus are not drawn.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:876,py:576},
 preset:{"air":{"pressure":1.3,"dustK":0.4,"dust":[0.85,0.77,0.67]},"clouds":{"cover":0.25},"fogDensity":0.0001662,"ridges":[{"base":0.25,"amp":0.2,"cycles":40,"octaves":2,"seed":113,"win":[90,90,1.6],"floor":-1,"dist":60000,"haze":0.1101,"rock":[0.69,0.66,0.67]},{"base":3.6,"amp":2.2,"cycles":19,"octaves":5,"seed":61,"peaks":24,"peakAmp":4.5,"win":[270,90,1.2],"floor":0.67,"dist":45000,"haze":0.1278,"rock":[0.59,0.63,0.71]},{"base":14.6,"amp":2.6,"cycles":19,"octaves":5,"seed":62,"peaks":24,"peakAmp":4.5,"win":[270,90,1.2],"floor":0.3,"dist":15000,"haze":0.2441,"rock":[0.42,0.39,0.44]},{"base":0.1,"amp":0.5,"cycles":60,"octaves":2,"seed":17,"win":[270,180,0.6],"floor":0.02,"dist":10000,"haze":0.3661,"rock":[0.6,0.45,0.39]}]}});
const {sky,giant}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
