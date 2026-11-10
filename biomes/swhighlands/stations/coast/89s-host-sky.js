// ================================================================= HOST — the shared sky (core/atmos, SKY-PLAN.md section 9) (station 5, the fan coast)
// Below the scarp on the Ring Sea (4.22 px ~335, 620: PLAN.md section 1, the scarp at y 620), sea-level air (1.35 atm), dry: the rain
// shadow's thin cloud; the crest painted west over the far country's real scarp.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:335,py:620},
 preset:{"air":{"pressure":1.35,"humidity":0.4},"clouds":{"cover":0.22,"cumulus":0.45,"cirrus":0.4},"fogDensity":0.00011,
  "ridges":[{"base":3.2,"amp":7,"cycles":6,"octaves":4,"peaks":12,"peakAmp":5,"seed":45,"win":[200,340,2.5],"floor":-2,"dist":30000,"snowH":6000,"forestH":3600,"haze":0.06,"rock":[0.55,0.5,0.44],"forest":[0.42,0.4,0.32],"snow":[0.94,0.95,0.96]}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
SKY.modes({hours:{day:10.5,dawn:6.6,night:22},hooks:LIGHT_HOOKS,set:m=>{LIGHT_MODE=m;}});
