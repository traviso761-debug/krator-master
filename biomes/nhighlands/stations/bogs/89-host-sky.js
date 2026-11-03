// ================================================================= HOST — Krator's sky, STATION 5: the bog country (replaces src/89-host-sky.js)
// The shared sky at the Footfall plateau (scale model 5.1, px 543,780: PLAN-STATIONS.md station 5), 1.06 atm (the plan's survey), the air a little
// drier than the wet face's below; the far ridges are station 1's (a nearer crest drew as striped spires: the first look).
// ================================================================= (station 1's notes follow)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the northern highlands, px 412, 335), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Kept from the dome: the Outer Wall far over the lowlands (NW), the Inner Wall's crest (SE, snow and forest by height) and
// the flank's spurs NE and SW (one ridge in two lobes), all beyond the far country's real mesh (82-host-sky.js keeps it, with
// the fog curve and the light modes). The mist wisps and the cumulus pinned over the range are not drawn.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:543,py:780},
 preset:{"air":{"pressure":1.06,"humidity":0.62},"clouds":{"cover":0.35,"cumulus":0.7,"cirrus":0.3},"fogDensity":0.00019,"ridges":[{"base":2.75,"amp":0.75,"cycles":22,"octaves":3,"seed":31,"win":[315,90,1],"floor":-1,"dist":150000,"haze":0.0281,"forestH":0,"rock":[0.62,0.67,0.71]},{"base":4,"amp":14,"cycles":7,"octaves":4,"peaks":22,"peakAmp":9,"seed":32,"win":[135,90,2.75],"floor":-2,"dist":40000,"snowH":6300,"forestH":2450,"haze":0.071,"rock":[0.43,0.47,0.5],"forest":[0.36,0.42,0.45],"snow":[0.94,0.95,0.96]},{"base":1.5,"amp":4,"cycles":16,"octaves":3,"seed":33,"win":[[55,45,1],[215,45,1]],"floor":-2,"dist":36000,"haze":0.1007,"forestH":0,"rock":[0.38,0.47,0.49]}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
SKY.modes({hours:{day:15.55,dawn:6.9,night:22},hooks:LIGHT_HOOKS,set:m=>{LIGHT_MODE=m;}});   /* the Day, Dawn and Night buttons and views (82-host-sky.js) */
