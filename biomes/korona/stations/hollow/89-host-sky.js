// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (Korona, px 776, 182), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// It read the hyperjungle's dome in place (all six pages); now the shared sky at Korona with each page's own air (STAGE.air.pressure:
// tepui 1.3 in src/; this station, hollow, 1.74 atm and its own fog). No ridges: the tepuis and gorges are real terrain.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:776,py:182},
 preset:{"air":{"pressure":1.74,"humidity":0.7},"clouds":{"cover":0.4},"fogDensity":0.0002851,"ridges":[]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
