// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws ATMOS.sky at the station's place on scale model 5.1 (STN.site) on the host clock, with the real sun, giant, ring,
// moons, station and stars, and drives the sun, the hemisphere, the fog and the exposure. THE AIR (core/atmos README, "Thin air"; PLAN.md
// section 1.2): the pressure falls with the eye's height on the model's law (1.6 atm at the datum, a scale of 8 km; the page's y is the
// true height, so y0 is 0): 0.94 atm at the pyroduct's skylight, 0.77 on the SE Twin's glacier. Cold, clear, high air with a little
// cloud (the range makes its own: PLAN.md section 1.2, rime-fog and graupel on the col), the haze thin. The far country is KFAR's.
/* a station that opens at its own hour sets STN.viewHour(); #hour= still wins */
if(STN.viewHour&&!/[?&#]hour=/.test(location.search+location.hash))ATMOS.SKY.viewHour=STN.viewHour();
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:STN.site,
 preset:Object.assign({air:{pressure:1.6,humidity:.3,thin:{y0:0,scale:8000}},clouds:{cover:.28,cumulus:.35,cirrus:.25},fogDensity:.000035,ridges:[]},STN.sky||{})});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
SKY.modes({hours:{day:13.2,dawn:6.9,night:22.5},hooks:LIGHT_HOOKS,set:m=>{LIGHT_MODE=m;}});   /* the Day, Dawn and Night buttons and views */
