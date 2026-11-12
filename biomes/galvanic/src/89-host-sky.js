// ================================================================= HOST — Krator's sky over the Rift's floor (core/atmos, the shared sky; taken from biomes/highrift's)
// ATMOS.skyBiome draws ATMOS.sky at the station's place on the scale model (SITE.sky: old canvas px), on the host clock (#hour=, #day=, #time=run), with
// the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fills, the fog and the exposure. The air is the
// strand's: 2.21 atm, +36 degC, humid; the painted ridges stand for what the far field does not reach: the Rift's walls north and south, 6-9 km over
// the floor and tens of kilometres off, and the hills of the floor between.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:SITE.sky,
 preset:{"air":{"pressure":SITE.atm,"humidity":0.72},"clouds":{"cover":0.3,"cumulus":0.35,"cirrus":0.3},"fogDensity":0.00022,
  "ridges":[{"base":3.4,"amp":1.6,"cycles":40,"octaves":3,"seed":81,"peaks":30,"peakAmp":0.6,"win":[300,80,2.2],"floor":1.0,"dist":60000,"haze":0.55,"forestH":0.8,"rock":[0.58,0.5,0.46],"snow":[0.9,0.9,0.92]},
   {"base":2.6,"amp":1.2,"cycles":40,"octaves":3,"seed":82,"peaks":24,"peakAmp":0.5,"win":[120,250,2.2],"floor":0.6,"dist":70000,"haze":0.6,"forestH":0.7,"rock":[0.56,0.5,0.48],"snow":[0.9,0.9,0.92]},
   {"base":0.8,"amp":0.6,"cycles":60,"octaves":2,"seed":83,"win":[250,110,1.6],"floor":-0.1,"dist":22000,"haze":0.35,"forestH":0.9,"rock":[0.5,0.42,0.36]}],
  "landmarks":[]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
