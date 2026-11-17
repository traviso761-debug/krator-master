// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws ATMOS.sky at this station's place on the scale model (STN.px on the 5.1 canvas; the sky's site is the old canvas's, 5.1 less
// 272, 330, as the southern highlands' kit converts it) on the host clock, with the real sun, giant, ring, moons, station, stars and clouds, and
// drives the sun, the hemisphere, the fog and the exposure. The far ridges are the southern highlands': the Throne far to the north out of the
// cloud sea, the Inner Wall east and west, the lowland south. The face looks north, into the noon sun at 40 S (PLAN.md section 3).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:STN.px[0]-272,py:STN.px[1]-330},
 preset:{"air":{"pressure":STN.sky.pressure,"humidity":STN.sky.humidity},"clouds":{"cover":STN.sky.cover,"cumulus":0.6,"cirrus":0.6},"fogDensity":0.000256,
  "ridges":[{"base":2.25,"amp":0.25,"cycles":20,"octaves":2,"seed":21,"win":[25,26.4,2.1],"floor":-0.2,"dist":250000,"haze":0.0194,"forestH":0,"rock":[0.66,0.71,0.78]},
   {"base":0.3,"amp":1.9,"cycles":48,"octaves":3,"peaks":45,"peakAmp":1.2,"seed":22,"win":[[90,90,3],[270,90,3]],"floor":-0.3,"dist":25000,"haze":0.145,"forestH":0,"rock":[0.5,0.57,0.67]},
   {"base":0.04,"amp":0.4,"cycles":40,"octaves":2,"seed":24,"win":[180,90,2],"floor":-0.26,"dist":30000,"haze":0.1857,"forestH":0,"rock":[0.69,0.67,0.55]}],
  "landmarks":[{"kind":"sea","top":0.18,"win":[0,90,0.6],"bump":0.5,"lit":[1,1,1],"shade":[0.66,0.7,0.8],"alpha":0.95}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;
