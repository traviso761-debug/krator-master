// ================================================================= HOST — Krator's sky over the Arch (core/atmos, the shared sky)
// ATMOS.skyBiome draws ATMOS.sky at the station's place on the scale model (SITE.sky: old canvas px; the Arch is north and west of the old canvas, so they
// run negative: the sky's frame is linear and extends), on the host clock (#hour=, #day=, #time=run), with the real sun, giant, ring, moons, station,
// stars and clouds. The air is the station's (1.56 atm), humid (Am: the monsoon's sea air); the painted ridges stand for what the far field does not
// reach: the dome's summit (1,456 m) north-west, the north-western horst across the sound, the sea's horizon to the south-west.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:SITE.sky,
 preset:{"air":{"pressure":SITE.atm,"humidity":0.78},"clouds":{"cover":0.42,"cumulus":0.55,"cirrus":0.25},"fogDensity":0.00018,
  "ridges":[{"base":0.9,"amp":0.7,"cycles":30,"octaves":3,"seed":81,"peaks":20,"peakAmp":0.5,"win":[250,340,2.2],"floor":0.1,"dist":22000,"haze":0.35,"snowH":99,"forestH":0.9,"rock":[0.3,0.36,0.3],"snow":[0.3,0.36,0.3]},
   {"base":0.5,"amp":0.4,"cycles":40,"octaves":3,"seed":82,"peaks":20,"peakAmp":0.3,"win":[20,110,2.0],"floor":0.0,"dist":30000,"haze":0.45,"snowH":99,"forestH":0.9,"rock":[0.32,0.38,0.34],"snow":[0.32,0.38,0.34]}],
  "landmarks":[]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
