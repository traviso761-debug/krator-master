// ================================================================= HOST — Krator's sky at a later station (the shared sky, core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome at the station's place on the scale model (STAGE.site: the sky frame's 4.2x canvas, 5.1 minus 272,330) and its air
// (STAGE.sky: pressure, humidity, clouds; the gap's walls either side as ridges, 10-14 km and airless, the far field drawing their flanks).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:STAGE.site,
 preset:Object.assign({"air":{"pressure":1.3,"humidity":0.65},"clouds":{"cover":0.45,"cumulus":0.75,"cirrus":0.35},"fogDensity":0.00008,
  "ridges":[{"base":7.5,"amp":2.2,"cycles":20,"octaves":2,"seed":71,"win":[[90,75,2.2],[270,75,2.2]],"floor":-0.2,"dist":90000,"haze":0.05,"forestH":0,"rock":[0.52,0.48,0.48]},
   {"base":1.2,"amp":1.0,"cycles":36,"octaves":3,"peaks":20,"peakAmp":0.8,"seed":72,"win":[[0,40,2.5],[180,40,2.5]],"floor":-0.3,"dist":40000,"haze":0.12,"forestH":0.3,"rock":[0.5,0.48,0.42]}],
  "landmarks":[]},STAGE.sky||{})});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
