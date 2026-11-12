// ================================================================= HOST — Krator's sky over Opal Valley (core/atmos, the shared sky)
// ATMOS.skyBiome draws ATMOS.sky at the station's place on the scale model (SITE.sky: old canvas px = 5.1 px - (272, 330)), on the host clock (#hour=,
// #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fills, the fog and the
// exposure. The air is the station's (0.95 atm on the ice to 1.59 at the mouth); the painted ridges stand for the walls the far field does not reach:
// the Oidong divide north (to 10 km), the southern cordillera south (to 12.7 km, snow from ~4.8 km: the EF line), the Rift's far side west.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:SITE.sky,
 preset:{"air":{"pressure":SITE.atm,"humidity":SITE.atm>1.4?0.62:SITE.atm>1.2?0.5:0.3},"clouds":{"cover":SITE.atm>1.4?0.3:0.18,"cumulus":SITE.atm>1.4?0.35:0.15,"cirrus":0.4},"fogDensity":SITE.atm>1.4?0.00016:0.00011,
  "ridges":[{"base":4.6,"amp":3.4,"cycles":48,"octaves":3,"seed":81,"peaks":40,"peakAmp":0.9,"win":[110,250,2.3],"floor":1.2,"dist":26000,"haze":0.15,"snowH":Math.max(300,4800-SITE.base),"forestH":0,"rock":[0.6,0.6,0.66],"snow":[0.93,0.95,0.97]},
   {"base":3.2,"amp":2.4,"cycles":48,"octaves":3,"seed":82,"peaks":40,"peakAmp":0.7,"win":[290,70,2.0],"floor":0.4,"dist":18000,"haze":0.22,"snowH":Math.max(300,4800-SITE.base),"forestH":SITE.base<2000?700:0,"rock":[0.52,0.5,0.54],"snow":[0.93,0.94,0.96]},
   {"base":1.0,"amp":0.4,"cycles":60,"octaves":2,"seed":83,"win":[250,320,1.6],"floor":-0.4,"dist":60000,"haze":0.05,"forestH":0,"rock":[0.64,0.66,0.72]}],
  "landmarks":[]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
