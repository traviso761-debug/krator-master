// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the Throne, px 571, 514), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Station 9, the glacier, thin bright air. Kept from the dome: the Throne's snow crown to the SE (a ridge); the cloud sea to the west
// and the rock ribs on the snow are not drawn. Snow weather greys the sky and darkens the hour's light.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:571,py:514},
 preset:{"air":{"pressure":0.7,"humidity":0.5},"clouds":{"cover":0.08},"fogDensity":0.0004114,"ridges":[{"base":4.75,"amp":0.3,"cycles":16,"octaves":2,"seed":46,"win":[135,140,1.2],"floor":-0.2,"dist":54000,"snowH":-2000,"forestH":0,"haze":0.0317,"rock":[0.38,0.39,0.43],"snow":[0.93,0.94,0.96]}],"landmarks":[{"kind":"band","win":[0,360,1],"el":[-2.2,-1.0],"lit":[0.85,0.88,0.92],"alpha":0.45,"noise":0,"haze":0.25},{"kind":"sea","top":-1.4,"win":[270,100,1],"bump":0.6,"lit":[1,1,1],"shade":[0.66,0.7,0.8],"alpha":0.95},{"kind":"plume","from":[135,5.0],"via":[140.4,5.7],"to":[153,6.0],"width":[1,4],"lit":[0.8,0.78,0.74],"belly":[0.42,0.39,0.36],"alpha":0.5,"haze":0.3,"drift":0.02}]},onLook:SKY_LOOK,weatherOver:true,weatherLook:true});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
SKY.modes({hours:{day:13,night:22},hooks:_onLight,set:m=>{LIGHT_MODE=m;}});   /* the Day and Night buttons, the night views, key n */
