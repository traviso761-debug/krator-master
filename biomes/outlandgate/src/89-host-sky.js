// ================================================================= HOST — Krator's sky at the Narrows (the shared sky, core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome at the station's place on the scale model: 5.1 px 1438,326, given on the sky frame's canvas (4.2x: 5.1 minus 272,330, so
// 1166,-4; the frame's linear, so off the old canvas is no matter) and its air: 1.34 atm, humid, a cumulus field over the gap. The ridges:
// the gap's walls either side, 10-14 km and airless (the far field draws their near flanks; these are the skyline beyond).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:1166,py:-4},
 preset:{"air":{"pressure":1.34,"humidity":0.65},"clouds":{"cover":0.45,"cumulus":0.75,"cirrus":0.35},"fogDensity":0.00008,
  "ridges":[{"base":7.5,"amp":2.2,"cycles":20,"octaves":2,"seed":71,"win":[[90,75,2.2],[270,75,2.2]],"floor":-0.2,"dist":90000,"haze":0.05,"forestH":0,"rock":[0.52,0.48,0.48]},
   {"base":1.2,"amp":1.0,"cycles":36,"octaves":3,"peaks":20,"peakAmp":0.8,"seed":72,"win":[[0,40,2.5],[180,40,2.5]],"floor":-0.3,"dist":40000,"haze":0.12,"forestH":0.3,"rock":[0.5,0.48,0.42]}],
  "landmarks":[]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
