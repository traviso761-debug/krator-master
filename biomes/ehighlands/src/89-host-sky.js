// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the station's site, STAGE.site), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Thin air: a deep zenith. Kept from the dome: the volcanoes at az 300 and 128 and the plateau edges (ridges); the
// volcano at az 18 with its lenticular cloud, the fumarole plume and the cones behind the real south range are not drawn.
// 2026-11-09: the site and the preset are the station's (STAGE.site, old canvas; STAGE.sky): station 1 re-sited to the crest's lee (861, 402), 0.86 atm.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:STAGE.site,
 preset:STAGE.sky});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
