// ================================================================= HOST — Krator's sky: the shared sky with THIN AIR (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws ATMOS.sky at the summit vent's place on the scale model (4.23: px 577.85, 932.59) on the host clock,
// with the real sun, giant, ring, moons, station and stars, and drives the sun, the hemisphere, the fog and the exposure.
// THIN AIR (core/atmos README, "Thin air"; PLAN.md section 2): the pressure falls with the eye's height on the model's law
// (1.6 atm at the datum, a scale of 8 km: the page's y is the true height, so y0 is 0): 0.11 atm on the pit's floor, 0.07 on
// the rim. The zenith goes nearly black and the brightest stars show by day; the sky's fill falls away (hard, dark
// shadows), the sun whitens and strengthens, the haze floor goes and the fog falls to nothing. No cloud stands this high
// (the cloud deck is far below: cover 0); no ridges (everything round the summit is lower than it: the far country is KFAR's).
/* a station that opens at its own hour (the Red Gill: the out-breath's middle, GILLS.peakHour) sets STN.viewHour(); #hour= still wins */
if(STN.viewHour&&!/[?&#]hour=/.test(location.search+location.hash))ATMOS.SKY.viewHour=STN.viewHour();
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:STN.site,
 /* a station lower down sets its own humidity, cloud and haze (STN.sky: merged over the summit's) */
 preset:Object.assign({air:{pressure:1.6,humidity:.02,thin:{y0:0,scale:8000}},clouds:{cover:0,cumulus:0,cirrus:0},fogDensity:.00002,ridges:[]},STN.sky||{})});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
SKY.modes({hours:{day:13.2,dawn:6.9,night:22.5},hooks:LIGHT_HOOKS,set:m=>{LIGHT_MODE=m;}});   /* the Day, Dawn and Night buttons and views */
