// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the Throne, px 571, 514), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Station 2, the kipuka. Kept from the dome: the Throne's flank to the east and the Spice isle low on the sea to the west (ridges); its
// cloud belt and small plume are not drawn.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:571,py:514},
 preset:{"air":{"pressure":1.66,"humidity":0.5},"clouds":{"cover":0.5},"fogDensity":0.0002506,"ridges":[{"base":5.6,"amp":0.36,"cycles":25,"octaves":3,"seed":42,"win":[82,180,4.4],"floor":-1.6,"dist":110000,"snowH":6920,"forestH":2880,"haze":0.0173,"rock":[0.46,0.49,0.49],"forest":[0.23,0.31,0.22],"snow":[0.93,0.94,0.96]},{"base":-0.75,"amp":0.1,"cycles":40,"octaves":2,"seed":44,"win":[252,16,1],"floor":-1.15,"dist":40000,"haze":0.0747,"forestH":100000.0,"rock":[0.47,0.54,0.51],"forest":[0.47,0.54,0.51]}],"landmarks":[{"kind":"plume","from":[82,5.8],"via":[91.0,6.5],"to":[112,6.8],"width":[1,5],"lit":[0.8,0.78,0.74],"belly":[0.42,0.39,0.36],"alpha":0.5,"haze":0.3,"drift":0.02},{"kind":"band","win":[82,80,1],"el":[1.6,3.2],"lit":[0.95,0.95,0.95],"alpha":0.45,"noise":0.8,"haze":0.3}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
SKY.modes({hours:{day:13,night:22},hooks:_onLight,set:m=>{LIGHT_MODE=m;}});   /* the Day and Night buttons, the night views, key n */
