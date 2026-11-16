// ================================================================= HOST — Krator's sky over the High Rift (core/atmos, the shared sky)
// ATMOS.skyBiome draws ATMOS.sky at the station's place on the scale model (SITE.sky: old canvas px), on the host clock (#hour=, #day=, #time=run), with
// the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fills, the fog and the exposure. The air is the
// station's (0.95-1.16 atm), dry; the painted ridges stand for the walls the far field does not reach: the Outer Wall south (snow from ~6 km), the
// north wall, the Siphon Pits' plateau east.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:SITE.sky,
 preset:{"air":{"pressure":SITE.atm,"humidity":SKEY==='mirror'||SKEY==='cataract'?0.4:0.22},"clouds":{"cover":0.12,"cumulus":0.1,"cirrus":0.5},"fogDensity":0.00012,
  "ridges":[{"base":4.2,"amp":3.2,"cycles":48,"octaves":3,"seed":71,"peaks":40,"peakAmp":0.9,"win":[110,250,2.3],"floor":1.2,"dist":26000,"haze":0.15,"snowH":900,"forestH":0,"rock":[0.6,0.62,0.68],"snow":[0.93,0.95,0.97]},
   {"base":2.2,"amp":2.0,"cycles":48,"octaves":3,"seed":72,"peaks":40,"peakAmp":0.6,"win":[290,70,2.0],"floor":0.1,"dist":14000,"haze":0.25,"snowH":1400,"forestH":0,"rock":[0.5,0.52,0.58],"snow":[0.93,0.94,0.96]},
   {"base":1.2,"amp":0.3,"cycles":60,"octaves":2,"seed":73,"win":[60,120,1.6],"floor":-0.2,"dist":60000,"haze":0.05,"forestH":0,"rock":[0.64,0.66,0.72]}],
  "landmarks":[]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
