// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the north-west lowlands, px 263, 339), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Kept from the dome: the Outer Wall far across the lake (NW) and the canopy lines, open over the inland sea (ridges). The
// Inner Wall's range is far-field geometry now (83-host-range.js), so its painted band is not drawn again.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:263,py:339},
 preset:{"air":{"pressure":1.9,"humidity":0.75},"clouds":{"cover":0.4},"fogDensity":0.0001684,"ridges":[{"base":2.16,"amp":1.2,"cycles":31,"octaves":3,"seed":21,"win":[315,90,1],"floor":-0.53,"dist":40000,"haze":0.036,"forestH":0,"rock":[0.5,0.56,0.6]},{"base":0.46,"amp":1.0,"cycles":56,"octaves":3,"seed":23,"win":[138,128,0.3],"floor":0,"dist":6000,"haze":0.48,"forestH":100000.0,"rock":[0.5,0.57,0.52],"forest":[0.5,0.57,0.52]},{"base":0.15,"amp":0.8,"cycles":88,"octaves":3,"seed":24,"win":[138,128,0.3],"floor":0,"dist":4500,"haze":0.38,"forestH":100000.0,"rock":[0.38,0.45,0.39],"forest":[0.38,0.45,0.39]}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
