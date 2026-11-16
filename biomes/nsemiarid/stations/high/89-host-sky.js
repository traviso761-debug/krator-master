// ================================================================= HOST — Krator's sky, STATION 2 (replaces src/89-host-sky.js): the shared sky at the high country's place
// ATMOS.skyBiome at scale model 5.1 px 848,564 (station 1's notes in src/89-host-sky.js), the air of ~3.7 km: 1.01 atm (PLAN-STATIONS.md, Dsb), dry,
// a few summer clouds, little dust. The far ridges: the range's crest SW, snow over ~4.2 km; the Outer Rim's ice far north over the basin; the
// basin's low mesas NE in the haze below the bench.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:STATION.px,py:STATION.py},
 preset:{"air":{"pressure":1.01,"humidity":0.38,"dustK":0.12,"dust":[0.86,0.8,0.72]},"clouds":{"cover":0.2,"cumulus":0.6,"cirrus":0.35},"fogDensity":0.00009,
  "ridges":[{"base":3.6,"amp":2.2,"cycles":19,"octaves":5,"seed":61,"peaks":24,"peakAmp":4.5,"win":[0,90,1.2],"floor":0.67,"dist":45000,"haze":0.1569,"rock":[0.59,0.63,0.71],"snow":[0.96,0.97,0.99],"snowH":3000},
   {"base":1.2,"amp":2.4,"cycles":9,"octaves":4,"peaks":18,"peakAmp":1.6,"seed":64,"win":[225,80,2.2],"floor":-1,"dist":30000,"snowH":4200,"forestH":3600,"haze":0.08,"rock":[0.52,0.48,0.46],"forest":[0.3,0.36,0.3],"snow":[0.95,0.96,0.97]},
   {"base":-1.2,"amp":0.6,"cycles":40,"octaves":2,"seed":17,"win":[45,70,0.8],"floor":-2,"dist":40000,"haze":0.35,"rock":[0.66,0.56,0.48]}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
