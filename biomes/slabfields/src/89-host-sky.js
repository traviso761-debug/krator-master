// ================================================================= HOST — Krator's sky over the Slabfields (core/atmos, the shared sky)
// ATMOS.skyBiome draws ATMOS.sky at the station's place on the scale model (SITE.sky: old canvas px), on the host clock (#hour=, #day=, #time=run), with
// the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fills, the fog and the exposure. The air is the
// station's (1.07 atm), dry (141 mm). The painted ridges stand for what the far field does not reach: the outer wall 100 km east (5-10 km, snow from
// ~6 km), the Siphon Pits plateau's edge south behind the Anvil, the Loom-Chasms' low country north.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:SITE.sky,
 preset:{"air":{"pressure":SITE.atm,"humidity":0.2},"clouds":{"cover":0.1,"cumulus":0.08,"cirrus":0.45},"fogDensity":0.0001,
  "ridges":[{"base":3.6,"amp":3.4,"cycles":48,"octaves":3,"seed":81,"peaks":40,"peakAmp":1.0,"win":[40,140,2.3],"floor":1.0,"dist":60000,"haze":0.12,"snowH":800,"forestH":0,"rock":[0.6,0.6,0.64],"snow":[0.93,0.95,0.97]},
   {"base":1.4,"amp":0.6,"cycles":48,"octaves":3,"seed":82,"win":[150,230,2.0],"floor":0.2,"dist":30000,"haze":0.2,"snowH":1400,"forestH":0,"rock":[0.52,0.5,0.5],"snow":[0.93,0.94,0.96]},
   {"base":0.3,"amp":0.2,"cycles":60,"octaves":2,"seed":83,"win":[290,60,1.8],"floor":-0.3,"dist":50000,"haze":0.08,"forestH":0,"rock":[0.66,0.62,0.58]}],
  "landmarks":[]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
