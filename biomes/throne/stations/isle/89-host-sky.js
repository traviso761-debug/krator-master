// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the Throne, px 571, 514), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Station 4, the isle. Kept from the dome: the Throne's flank on the eastern horizon and the other isles low on the sea (ridges).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:571,py:514},
 preset:{"air":{"pressure":1.8,"humidity":0.5},"clouds":{"cover":0.5},"fogDensity":0.0001778,"ridges":[{"base":3.55,"amp":0.36,"cycles":25,"octaves":3,"seed":42,"win":[95,180,6.4],"floor":-2.0,"dist":170000,"snowH":8315,"forestH":3560,"haze":0.0145,"rock":[0.46,0.49,0.49],"forest":[0.23,0.31,0.22],"snow":[0.93,0.94,0.96]},{"base":-0.2,"amp":0.05,"cycles":8,"octaves":1,"peaks":5,"peakAmp":0.35,"seed":45,"floor":-0.2,"dist":30000,"haze":0.1294,"forestH":100000.0,"rock":[0.43,0.5,0.49],"forest":[0.43,0.5,0.49]}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
SKY.modes({hours:{day:13,night:22},hooks:_onLight,set:m=>{LIGHT_MODE=m;}});   /* the Day and Night buttons, the night views, key n */
