// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws ATMOS.sky at the station's place on scale model 5.1 (STN.site) on the host clock, with the real sun, giant,
// ring, moons, station and stars, and drives the sun, the hemisphere, the fog and the exposure. The air thins with the eye's height on
// the model's law (1.6 atm at the datum, a scale of 8 km: the page's y is the true height): ~1.08 atm on the head step's lip, ~1.18 on
// step 2's floor. A cold steppe's sky (STN.sky): a little cumulus and cirrus, dry air.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:STN.site,
 preset:Object.assign({air:{pressure:1.6,humidity:.2,thin:{y0:0,scale:8000}},clouds:{cover:.2,cumulus:.25,cirrus:.3},fogDensity:.00004,ridges:[]},STN.sky||{})});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
SKY.modes({hours:{day:11.5,dawn:7.2,night:22.5},hooks:LIGHT_HOOKS,set:m=>{LIGHT_MODE=m;}});   /* the Day, Dawn and Night buttons and views */
