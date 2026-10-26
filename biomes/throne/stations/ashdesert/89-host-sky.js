// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the Throne, px 571, 514), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Station 7, the ash desert, under the plume. Kept from the dome: the Throne's flank NW, its near swells and the Inner Wall's line
// (ridges); the ash weather greys the sky and darkens the hour's light. The plume's brown ceiling over the whole sky is not drawn
// (no landmark layer yet): the ash veil and the weather stand in for it.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:571,py:514},
 preset:{"air":{"pressure":1.26,"humidity":0.5,"dustK":0.75,"dust":[0.41,0.38,0.35]},"clouds":{"cover":0.85},"fogDensity":0.0007619,"ridges":[{"base":0.1,"amp":0.5,"cycles":16,"octaves":2,"seed":41,"win":[165,70,0.5],"floor":-0.6,"dist":300000,"haze":0.005,"forestH":0,"rock":[0.69,0.71,0.73]},{"base":5.25,"amp":0.36,"cycles":25,"octaves":3,"seed":42,"win":[315,180,4.4],"floor":-1.2,"dist":95000,"snowH":5150,"forestH":0,"haze":0.0087,"rock":[0.59,0.59,0.6],"snow":[0.93,0.93,0.95]},{"base":0.93,"amp":0.35,"cycles":33,"octaves":3,"peaks":49,"peakAmp":0.6,"seed":43,"win":[315,180,3.2],"floor":-0.4,"dist":12000,"haze":0.0577,"forestH":0,"rock":[0.38,0.36,0.32]}]},onLook:SKY_LOOK,weatherOver:true,weatherLook:true});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
SKY.modes({hours:{day:13,night:22},hooks:_onLight,set:m=>{LIGHT_MODE=m;}});   /* the Day and Night buttons, the night views, key n */
