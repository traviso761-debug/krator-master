// ================================================================= HOST — Krator's sky at the Fog Wall (the shared sky, core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome at the station's place on the scale model (legacy px 1340,392, between S1 and S4: SURVEY.md section 6; the 5.1 canvas
// adds 272,330) and its air: 1.0 atm at the belt, wetter than the shoulder below it, a cumulus field over the wall. The ridges: the
// S basin's rim walls round the station (the outer crater wall far to the west, the basin's own walls east and south).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:1340,py:392},
 preset:{"air":{"pressure":1.05,"humidity":0.6},"clouds":{"cover":0.35,"cumulus":0.7,"cirrus":0.45},"fogDensity":0.00022,
  "ridges":[{"base":2.6,"amp":0.6,"cycles":18,"octaves":2,"seed":51,"win":[270,80,2.2],"floor":-0.2,"dist":120000,"haze":0.03,"forestH":0,"rock":[0.62,0.56,0.58]},
   {"base":0.6,"amp":1.4,"cycles":40,"octaves":3,"peaks":30,"peakAmp":1.0,"seed":52,"win":[[90,70,2.5],[180,70,2.5]],"floor":-0.3,"dist":30000,"haze":0.12,"forestH":0,"rock":[0.58,0.44,0.4]}],
  "landmarks":[]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
