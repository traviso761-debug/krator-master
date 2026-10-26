// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the eastern highlands, px 839, 542), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Thin air (0.6 atm): a deep zenith. Kept from the dome: the volcanoes at az 300 and 128 and the plateau edges (ridges); the
// volcano at az 18 with its lenticular cloud, the fumarole plume and the cones behind the real south range are not drawn.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:839,py:542},
 preset:{"air":{"pressure":0.6,"dustK":0.03,"dust":[0.8,0.83,0.88]},"clouds":{"cover":0.12},"fogDensity":0.000112,"ridges":[{"base":3.15,"amp":0.35,"cycles":34,"octaves":2,"seed":300,"win":[300,33.4,2.6],"floor":-1,"dist":40000,"haze":0.1634,"rock":[0.38,0.44,0.55],"snow":[0.96,0.96,0.98],"snowH":1579},{"base":3.95,"amp":0.35,"cycles":34,"octaves":2,"seed":128,"win":[128,36.9,2.6],"floor":-1,"dist":40000,"haze":0.1634,"rock":[0.38,0.44,0.55],"snow":[0.96,0.96,0.98],"snowH":1816},{"base":0.15,"amp":0.65,"cycles":40,"octaves":3,"seed":23,"dist":15000,"haze":0.4356,"rock":[0.47,0.5,0.54]},{"base":0.05,"amp":0.3,"cycles":40,"octaves":3,"seed":47,"dist":6000,"haze":0.8362,"rock":[0.52,0.46,0.35]}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
