// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws ATMOS.sky at this station's place on the scale model (the old canvas px: 5.1 px less 272,330, from 44f's site), on the
// host clock, with the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fills, the fog and the
// exposure from the colour script (the Great Chasm's, taken as it is). THE TIERS' AIR at the lake (PLAN.md section 3): dense (1.36-1.39 atm),
// mild, a Mediterranean shore's scattered summer cloud, the lake's haze. The stair 5-120 km off is real terrain (83: KFAR from the scale model),
// so no painted ridges stand in front of it; one low painted ridge at 150 km is the country past the model's window (Korona's rings, west).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:LAND.sky||{px:SITE.sky[0],py:SITE.sky[1]},
 preset:{"air":{"pressure":LAND.atm==null?atmAt(SITE.h):LAND.atm,"dustK":0.06,"dust":[0.82,0.82,0.8]},"clouds":{"cover":LAND.cloud==null?0.22:LAND.cloud},"fogDensity":0.000022,
  "ridges":[{"base":0.2,"amp":0.22,"cycles":34,"octaves":2,"seed":117,"win":[200,40,1.6],"floor":-1,"dist":150000,"haze":0.25,"rock":[0.46,0.46,0.48]}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
