// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the Throne, px 571, 514), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Station 12, the lava delta on the south-east coast (map 5.1 px 900, 858; 628, 528 on the old canvas the sky reads), ~1.85 atm at the shore. The cloud sea all round
// below the horizon is not drawn (no landmark layer yet). Snow and ash weather grey the sky and darken the hour's light.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:628,py:528},
 preset:{"air":{"pressure":1.85,"humidity":0.6},"clouds":{"cover":0.25},"fogDensity":0.00036,"ridges":[],"landmarks":[{"kind":"sea","top":-2.0,"win":[0,360,1],"bump":0.8,"lit":[1,1,1],"shade":[0.66,0.7,0.8],"alpha":0.95}]},onLook:SKY_LOOK,weatherOver:true,weatherLook:true});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
SKY.modes({hours:{day:13,night:22},hooks:_onLight,set:m=>{LIGHT_MODE=m;}});   /* the Day and Night buttons, the night views, key n */

