// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (between the hyperjungle and Korona (the kit overlies the hyperjungle's polygon), px 730, 330), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// It read the hyperjungle's dome in place; now its own shared sky with the canopy lines (ridges). NIGHT (89n) keeps its hooks
// and the skylight key; the sky drives the lights, fog and exposure over it each frame.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:730,py:330},
 preset:{"air":{"pressure":1.9,"humidity":0.85},"clouds":{"cover":0.45},"fogDensity":0.0002189,"ridges":[{"base":1.3,"amp":1.7,"cycles":56,"octaves":3,"seed":13,"dist":6000,"haze":0.11538461538461539,"forestH":100000.0,"rock":[0.44,0.53,0.48],"forest":[0.44,0.53,0.48]},{"base":0.65,"amp":1.5,"cycles":88,"octaves":3,"seed":14,"dist":4500,"haze":0.11538461538461539,"forestH":100000.0,"rock":[0.3,0.4,0.35],"forest":[0.3,0.4,0.35]}]}});
const {sky,giant,giantDir}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
