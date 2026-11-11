// ================================================================= HOST — Krator's sky at a later station (the shared sky, core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome at the station's place on the scale model (STAGE.site: the 4.2x canvas, as station 1; the 5.1 canvas adds 272,330: the sky
// reads only the latitude and the giant's bearing, which the shift barely moves) and its air (STAGE.sky: the preset's air, clouds and ridges).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:STAGE.site,preset:STAGE.sky});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
