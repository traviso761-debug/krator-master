// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the southern highlands' face, px 486, 700 on the old canvas: 5.1 px 758,1030, re-sited 2026-11-09; the air
// 1.15 atm, the face's middle at ~2.4 km), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// A true blue 1 atm column. Kept from the dome: the Throne far to the north (now at az 25, where the scale model puts it; the
// dome painted it at 8), the Inner Wall running east and west (one ridge in two lobes) and the warm lowland to the south. The
// cloud sea in the north beyond the real cloud deck and the Throne's plume are not drawn; 89z's cloud deck keeps its fixed sun.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:486,py:700},
 preset:{"air":{"pressure":1.15,"humidity":0.8},"clouds":{"cover":0.25,"cumulus":0.6,"cirrus":0.65},"fogDensity":0.000256,"ridges":[{"base":2.25,"amp":0.25,"cycles":20,"octaves":2,"seed":21,"win":[25,26.4,2.1],"floor":-0.2,"dist":250000,"haze":0.0194,"forestH":0,"rock":[0.66,0.71,0.78]},{"base":0.3,"amp":1.9,"cycles":48,"octaves":3,"peaks":45,"peakAmp":1.2,"seed":22,"win":[[90,90,3],[270,90,3]],"floor":-0.3,"dist":25000,"haze":0.145,"forestH":0,"rock":[0.5,0.57,0.67]},{"base":0.04,"amp":0.4,"cycles":40,"octaves":2,"seed":24,"win":[180,90,2],"floor":-0.26,"dist":30000,"haze":0.1857,"forestH":0,"rock":[0.69,0.67,0.55]}],"landmarks":[{"kind":"sea","top":0.18,"win":[0,90,0.6],"bump":0.5,"lit":[1,1,1],"shade":[0.66,0.7,0.8],"alpha":0.95},{"kind":"plume","from":[25,2.4],"via":[17,6.5],"to":[-3,10.4],"width":[0.8,5],"lit":[0.86,0.86,0.84],"belly":[0.42,0.39,0.36],"alpha":0.4,"haze":0.3,"drift":0.02}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
