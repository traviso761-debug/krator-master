// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the Vale of Xanadu, px 591, 1173), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Kept from the dome: the snow ranges round the Vale and the near walls, all dipping at the cataract (az 112) as the paint did
// (ridges with a notch); the cataract's white fall and its spray are not drawn (no landmark layer yet).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:591,py:1173},
 preset:{"air":{"pressure":1.9,"humidity":0.8},"clouds":{"cover":0.4},"fogDensity":0.0001432,"ridges":[{"base":8.8,"amp":2.4,"cycles":11,"octaves":3,"seed":51,"peaks":22,"peakAmp":1.6,"win":[180,180,1.4],"floor":-1,"notch":[112,4,16,0.8],"dist":20000,"haze":0.1,"snowH":2670,"forestH":0,"rock":[0.59,0.64,0.72],"snow":[0.93,0.94,0.96]},{"base":6.8,"amp":2.0,"cycles":11,"octaves":3,"seed":52,"peaks":22,"peakAmp":1.2,"win":[0,180,1.0],"floor":-1,"notch":[112,4,16,0.8],"dist":20000,"haze":0.1,"snowH":2670,"forestH":0,"rock":[0.59,0.64,0.72],"snow":[0.93,0.94,0.96]},{"base":4.0,"amp":1.6,"cycles":17,"octaves":3,"seed":53,"peaks":34,"peakAmp":0.8,"win":[0,180,0.5],"floor":-1,"notch":[112,4,16,0.8],"dist":8000,"haze":0.25,"forestH":350,"rock":[0.36,0.42,0.41],"forest":[0.45,0.52,0.47]}]}});
const {sky,giant}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
