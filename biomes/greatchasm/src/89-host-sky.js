// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws ATMOS.sky at this station's place on the scale model (the old canvas px: 5.1 px less 272,330, from 44f's site), on the
// host clock, with the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fills, the fog and the
// exposure from the colour script. THE CHASM'S AIR (PLAN.md section 3): dense on the floor (1.86 atm on the Deep) and thin on the rim (0.68),
// dry, a desert's few clouds. The air's own fog is thin (fogDensity 1.6e-5, a sixth of the standard): the walls 30-120 km off are the chasm,
// and they are real terrain (83: KFAR from the scale model), so no painted ridges stand in front of them; one low painted ridge at 150 km is
// the country past the model's window. The height fog (89a) carries the dust haze on the floor.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:LAND.sky||{px:SITE.sky[0],py:SITE.sky[1]},
 preset:{"air":{"pressure":LAND.atm==null?atmAt(SITE.h):LAND.atm,"dustK":0.16,"dust":[0.86,0.8,0.72]},"clouds":{"cover":LAND.cloud==null?0.12:LAND.cloud},"fogDensity":0.000016,
  "ridges":[{"base":0.25,"amp":0.25,"cycles":40,"octaves":2,"seed":113,"win":[270,90,1.6],"floor":-1,"dist":150000,"haze":0.2,"rock":[0.52,0.48,0.47]}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
