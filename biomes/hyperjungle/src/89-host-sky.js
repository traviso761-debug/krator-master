// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the hyperjungle, px 690, 489), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Kept from the dome: the volcano due south and its satellite hills, the two canopy lines (ridges); its plume and crater glow
// are not drawn (no landmark layer yet). src/82-host-sky.js stays for the builds that read it in place (guilin, korona,
// necanyons until they move; settlements/pinnacle-rock); build.py leaves it out of this page.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:typeof STATION_SKY!=='undefined'?{px:STATION_SKY.px,py:STATION_SKY.py}:{px:690,py:489},   /* a station's own place (its 45) */

 preset:{"air":{"pressure":1.9,"humidity":0.85},"clouds":{"cover":0.45},"fogDensity":0.0002526,"ridges":[{"base":1.9,"amp":1.0,"cycles":9,"octaves":2,"seed":11,"win":[180,105,0.5],"floor":-1,"dist":30000,"haze":0.17,"forestH":0,"rock":[0.62,0.69,0.67]},{"base":5.4,"amp":0.5,"cycles":48,"octaves":2,"seed":12,"win":[180,34,3.5],"floor":-1,"dist":25000,"haze":0.12,"forestH":0,"rock":[0.56,0.62,0.61]},{"base":1.3,"amp":1.7,"cycles":56,"octaves":3,"seed":13,"dist":6000,"haze":0.1,"forestH":100000.0,"rock":[0.44,0.53,0.48],"forest":[0.44,0.53,0.48]},{"base":0.65,"amp":1.5,"cycles":88,"octaves":3,"seed":14,"dist":4500,"haze":0.1,"forestH":100000.0,"rock":[0.3,0.4,0.35],"forest":[0.3,0.4,0.35]}],"landmarks":[{"kind":"plume","from":[179.5,4.9],"via":[172,10],"to":[151,14.5],"width":[0.8,5.6],"lit":[0.88,0.9,0.88],"belly":[0.5,0.52,0.5],"alpha":0.4,"haze":0.3,"drift":0.02}]}});
const {sky,giant}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
