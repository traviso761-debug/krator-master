// ================================================================= HOST — the shared sky (core/atmos, SKY-PLAN.md section 9) (station 4, the pillar rim)
// At the station's place on the scale model (px 276, 690: Span's tableland's south-west edge, downstream of Span on Pan Riba, a
// proposal for the owner, PLAN.md section 10), ~2.3-2.6 km: the cool, wet edge of the tableland; the highlands painted beyond.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:276,py:690},
 preset:{"air":{"pressure":0.96,"humidity":0.65},"clouds":{"cover":0.42,"cumulus":0.7,"cirrus":0.3},"fogDensity":0.00016,
  "ridges":[{"base":1.6,"amp":4,"cycles":7,"octaves":4,"peaks":14,"peakAmp":4,"seed":43,"win":[90,120,2.5],"floor":-2,"dist":30000,"snowH":6100,"forestH":4300,"haze":0.06,"rock":[0.56,0.44,0.4],"forest":[0.3,0.42,0.36],"snow":[0.94,0.95,0.96]}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
SKY.modes({hours:{day:14.2,dawn:6.7,night:22},hooks:LIGHT_HOOKS,set:m=>{LIGHT_MODE=m;}});
