// ================================================================= HOST — Krator's sky over the painted highlands (core/atmos, the shared sky)
// ATMOS.skyBiome draws ATMOS.sky at the station's place on the scale model (SITE.sky: old canvas px), on the host clock (#hour=, #day=, #time=run), with
// the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fills, the fog and the exposure. The air is the
// station's (1.06-1.24 atm), dry; the painted ridges stand for what the far field does not reach: the plateau's far hogbacks, banded, all round;
// Korona's tepuis and rings to the east (snow on the high tables), the Inner Wall's crest to the west, falling to the crater.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:SITE.sky,
 preset:{"air":{"pressure":SITE.atm,"humidity":SKEY==='cliff'?0.45:0.2},"clouds":{"cover":0.14,"cumulus":0.16,"cirrus":0.45},"fogDensity":SKEY==='cliff'?0.00016:0.0001,
  "ridges":[{"base":2.6,"amp":2.2,"cycles":40,"octaves":3,"seed":81,"peaks":30,"peakAmp":0.8,"win":[40,140,2.0],"floor":0.6,"dist":30000,"haze":0.18,"snowH":1500,"forestH":0,"rock":[0.6,0.5,0.48],"snow":[0.93,0.95,0.97]},
   {"base":1.0,"amp":0.7,"cycles":64,"octaves":3,"seed":82,"win":[0,360,1.0],"floor":-0.2,"dist":16000,"haze":0.28,"forestH":0,"rock":[0.66,0.5,0.46]},
   {"base":1.6,"amp":0.9,"cycles":48,"octaves":2,"seed":83,"win":[230,320,1.8],"floor":0.4,"dist":45000,"haze":0.12,"snowH":1200,"forestH":0,"rock":[0.62,0.62,0.66],"snow":[0.93,0.95,0.97]}],
  "landmarks":[]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
