// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the south-west lowlands, px 290, 731), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Kept from the dome: the Inner Wall (NE), the Outer Wall (SW) and the canopy lines, open over the inland sea (ridges).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:290,py:731},
 preset:{"air":{"pressure":1.9,"humidity":0.75},"clouds":{"cover":0.4},"fogDensity":0.0001684,"ridges":[{"base":4.34,"amp":1.4,"cycles":31,"octaves":3,"seed":31,"win":[45,90,1],"floor":-0.53,"dist":25000,"haze":0.058,"forestH":0,"rock":[0.41,0.45,0.5]},{"base":7.31,"amp":1.5,"cycles":31,"octaves":3,"seed":32,"win":[225,90,1],"floor":-0.53,"dist":15000,"haze":0.097,"forestH":0,"rock":[0.35,0.38,0.43]},{"base":0.46,"amp":1.0,"cycles":56,"octaves":3,"seed":33,"win":[138,128,0.3],"floor":0,"dist":6000,"haze":0.48,"forestH":100000.0,"rock":[0.5,0.57,0.52],"forest":[0.5,0.57,0.52]},{"base":0.15,"amp":0.8,"cycles":88,"octaves":3,"seed":34,"win":[138,128,0.3],"floor":0,"dist":4500,"haze":0.38,"forestH":100000.0,"rock":[0.38,0.45,0.39],"forest":[0.38,0.45,0.39]}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
