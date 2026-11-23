// ================================================================= HOST — the shared sky (core/atmos, SKY-PLAN.md section 9) (station 2, the rain wall)
// At the landslide lake on the scale model (4.22 px 278, 629: PLAN.md section 1), the 2-3 km band's air (1.17 atm), wet: low cloud,
// the walls of the rain wall painted round the far country's real valleys.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:278,py:629},
 preset:{"air":{"pressure":1.12,"humidity":0.85},"clouds":{"cover":0.72,"cumulus":0.55,"cirrus":0.25},"fogDensity":0.00024,
  "ridges":[{"base":2.2,"amp":6,"cycles":7,"octaves":4,"peaks":14,"peakAmp":4,"seed":43,"win":[90,120,2.5],"floor":-2,"dist":30000,"snowH":6200,"forestH":4600,"haze":0.08,"rock":[0.46,0.45,0.43],"forest":[0.2,0.3,0.26],"snow":[0.94,0.95,0.96]}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
SKY.modes({hours:{day:14.2,dawn:6.9,night:22},hooks:LIGHT_HOOKS,set:m=>{LIGHT_MODE=m;}});
