// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the Throne, px 571, 514), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Station 5, the cloud forest, inside the cloud belt. Kept from the dome: the Throne's flank east and the Spice isle (ridges); the
// cloud's veil and fog are the weather's, laid over the sky each frame.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:571,py:514},
 preset:{"air":{"pressure":0.7,"humidity":0.5},"clouds":{"cover":0.8},"fogDensity":0.0125714,"ridges":[{"base":5.6,"amp":0.36,"cycles":25,"octaves":3,"seed":42,"win":[90,180,4.4],"floor":-1.6,"dist":110000,"snowH":6920,"forestH":2880,"haze":0.0008,"rock":[0.46,0.49,0.49],"forest":[0.23,0.31,0.22],"snow":[0.93,0.94,0.96]},{"base":-0.75,"amp":0.1,"cycles":40,"octaves":2,"seed":44,"win":[252,16,1],"floor":-1.15,"dist":40000,"haze":0.0035,"forestH":100000.0,"rock":[0.47,0.54,0.51],"forest":[0.47,0.54,0.51]}]},onLook:SKY_LOOK,weatherOver:true,weatherLook:true});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
SKY.modes({hours:{day:13,night:22},hooks:_onLight,set:m=>{LIGHT_MODE=m;}});   /* the Day and Night buttons, the night views, key n */
