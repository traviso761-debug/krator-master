// ================================================================= HOST — Krator's sky over Region 98 (core/atmos, the shared sky)
// ATMOS.skyBiome draws ATMOS.sky at the station's place on the scale model (SITE.sky: old canvas px), on the host clock (#hour=, #day=, #time=run), with
// the real sun, giant, ring, moons, station, stars and clouds, and drives the sun, the hemisphere, the fills, the fog and the exposure, at the station's
// own pressure (its record's, the air law's). The painted ridges stand for what the far field does not reach (azimuth from north, degrees):
//   terraces  the Stalker Peaks west (13-15 km: their snow and glaciers), the Ostrukh Wall's long line east (the SE plateau 2 km over the graben)
//   scarp     the plateau's edge running away north and south, the Stalker Peaks far west over the graben
//   pitfloor  the sink's shoulders all round (the plateau 1.5-2.5 km over the floor 8-16 km out): mostly hidden by the maar's own walls and the deck
//   arete     the plateau's broken skyline, the swarm's other pits, the Stalker Peaks far north-west
const RIDGES={
 terraces:[{"base":9.5,"amp":4.5,"cycles":40,"octaves":3,"seed":981,"peaks":30,"peakAmp":1.1,"win":[270,80,2.0],"floor":1.5,"dist":60000,"haze":.22,"snowH":2600,"forestH":0,"rock":[.5,.5,.55],"snow":[.94,.95,.97]},
  {"base":1.9,"amp":.35,"cycles":30,"octaves":2,"seed":982,"win":[100,70,1.6],"floor":.2,"dist":30000,"haze":.25,"snowH":2200,"forestH":0,"rock":[.36,.34,.34]}],
 scarp:[{"base":.9,"amp":.3,"cycles":40,"octaves":2,"seed":983,"win":[[20,40,1.5],[200,40,1.5]],"floor":.2,"dist":20000,"haze":.2,"snowH":800,"forestH":0,"rock":[.32,.3,.3]},
  {"base":9,"amp":4,"cycles":40,"octaves":3,"seed":984,"peaks":30,"peakAmp":1,"win":[280,60,2],"floor":1,"dist":90000,"haze":.3,"snowH":2500,"forestH":0,"rock":[.5,.5,.55],"snow":[.94,.95,.97]}],
 pitfloor:[{"base":2.0,"amp":.6,"cycles":36,"octaves":3,"seed":985,"floor":.4,"dist":14000,"haze":.3,"snowH":1500,"forestH":0,"rock":[.3,.28,.28]}],
 arete:[{"base":.4,"amp":.5,"cycles":50,"octaves":3,"seed":986,"floor":-.1,"dist":12000,"haze":.25,"snowH":0,"forestH":0,"rock":[.32,.3,.32],"snow":[.92,.94,.96]},
  {"base":8,"amp":4,"cycles":40,"octaves":3,"seed":987,"peaks":30,"peakAmp":1,"win":[300,50,2],"floor":1,"dist":150000,"haze":.35,"snowH":1500,"forestH":0,"rock":[.5,.5,.55],"snow":[.94,.95,.97]}]}[SKEY];
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:SITE.sky,
 preset:{"air":{"pressure":SITE.atm,"humidity":SKEY==='pitfloor'?0.8:SKEY==='terraces'?0.4:0.25},"clouds":{"cover":SKEY==='arete'?0.6:0.2,"cumulus":0.15,"cirrus":0.4},"fogDensity":0.00012,
  "ridges":RIDGES,"landmarks":[]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
