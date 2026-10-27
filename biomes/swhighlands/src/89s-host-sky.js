// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws ATMOS.sky at this station's place on the scale model (the SW highlands' ramp, px 300, 640: a proposal for
// the owner, PLAN.md section 9 H0), on the host clock (the page opens at ATMOS.SKY.viewHour; #hour=, #day=, #time=run move it),
// with the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fills, the fog and the
// exposure. The air is the 2-3 km band's (1.17 atm, wet). One painted ridge: the Inner Wall's crest to the east (6-6.5 km), over
// the far country's real folds.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:300,py:640},
 preset:{"air":{"pressure":1.17,"humidity":0.75},"clouds":{"cover":0.42,"cumulus":0.75,"cirrus":0.3},"fogDensity":0.00018,
  "ridges":[{"base":3.2,"amp":8,"cycles":8,"octaves":4,"peaks":18,"peakAmp":5,"seed":41,"win":[90,110,2.5],"floor":-2,"dist":55000,"snowH":6000,"forestH":3600,"haze":0.07,"rock":[0.5,0.47,0.45],"forest":[0.3,0.4,0.4],"snow":[0.94,0.95,0.96]}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for the water's skylight scene and a layer */
SKY.modes({hours:{day:15.55,dawn:6.9,night:22},hooks:LIGHT_HOOKS,set:m=>{LIGHT_MODE=m;}});
