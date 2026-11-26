// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the northern semiarid, px 444, 143), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// 1.42 atm (PLAN.md), a milky dust haze. Kept from the dome: the iced Outer Rim in the north and the ranges behind it, the mesas
// (ridges); the Inner Wall highlands in the south are the map's own upland. biomes/scablands (an overlay build) takes this sky.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:444,py:143},
 preset:{"air":{"pressure":1.42,"dustK":0.35,"dust":[0.85,0.77,0.67]},"clouds":{"cover":0.25},"fogDensity":0.0001239,"ridges":[{"base":3.6,"amp":2.2,"cycles":19,"octaves":5,"seed":61,"peaks":24,"peakAmp":4.5,"win":[0,90,1.2],"floor":0.67,"dist":45000,"haze":0.1569,"rock":[0.59,0.63,0.71],"snow":[0.96,0.97,0.99],"snowH":3000},{"base":14.6,"amp":2.6,"cycles":19,"octaves":5,"seed":62,"peaks":24,"peakAmp":4.5,"win":[0,90,1.2],"floor":0.3,"dist":15000,"haze":0.2996,"rock":[0.45,0.44,0.49],"snow":[0.96,0.97,0.99],"snowH":4000},{"base":0.12,"amp":0.45,"cycles":60,"octaves":2,"seed":17,"win":[0,180,0.6],"floor":0.02,"dist":15000,"haze":0.3514,"rock":[0.66,0.52,0.45]},{"base":0.07,"amp":0.28,"cycles":60,"octaves":2,"seed":42,"win":[0,180,0.6],"floor":0.01,"dist":6000,"haze":0.6296,"rock":[0.55,0.38,0.33]}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
