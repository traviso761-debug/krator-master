// ================================================================= HOST — the shared sky (core/atmos, SKY-PLAN.md section 9) (station 6, the treeline)
// At the station's place on the scale model (px 330, 640: the upper ramp under the crest, a proposal for the owner, PLAN.md section 9
// H0), the 4-5 km band's thinner, drier air (0.91 atm); the crest painted east over the far country's real ramp.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:330,py:640},
 preset:{"air":{"pressure":0.93,"humidity":0.45},"clouds":{"cover":0.32,"cumulus":0.65,"cirrus":0.35},"fogDensity":0.00012,
  "ridges":[{"base":1.8,"amp":5,"cycles":8,"octaves":4,"peaks":18,"peakAmp":5,"seed":41,"win":[90,120,2.5],"floor":-2,"dist":30000,"snowH":6100,"forestH":4400,"haze":0.05,"rock":[0.5,0.47,0.45],"forest":[0.3,0.4,0.4],"snow":[0.94,0.95,0.96]}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
SKY.modes({hours:{day:15.55,dawn:6.9,night:22},hooks:LIGHT_HOOKS,set:m=>{LIGHT_MODE=m;}});
