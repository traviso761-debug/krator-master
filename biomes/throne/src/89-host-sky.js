// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the Throne, px 571, 514), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Station 1, the plume's edge, 1.26 atm with the plume's dust. Kept from the dome: the Throne's flank to the summit NNW, the
// near flank's swells and cones, the Inner Wall's faint line over the Ring Sea (ridges); the plume across the sky, its haze
// and the sea's silver line are not drawn (no landmark layer yet). Day and night are hours (13:00, 22:00): the old sun is out
// of reach at 40 S (SKY-PLAN 8).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:571,py:514},
 preset:{"air":{"pressure":1.26,"humidity":0.45,"dustK":0.3,"dust":[0.59,0.55,0.47]},"clouds":{"cover":0.3},"fogDensity":0.0002667,"ridges":[{"base":0.1,"amp":0.5,"cycles":16,"octaves":2,"seed":41,"win":[165,70,0.5],"floor":-0.6,"dist":300000,"haze":0.0142,"forestH":0,"rock":[0.69,0.71,0.73]},{"base":5.25,"amp":0.36,"cycles":25,"octaves":3,"seed":42,"win":[330,180,4.4],"floor":-1.2,"dist":95000,"snowH":5150,"forestH":0,"haze":0.0248,"rock":[0.59,0.59,0.6],"snow":[0.93,0.93,0.95]},{"base":0.93,"amp":0.35,"cycles":33,"octaves":3,"peaks":49,"peakAmp":0.6,"seed":43,"win":[330,180,3.2],"floor":-0.4,"dist":12000,"haze":0.1649,"forestH":0,"rock":[0.38,0.36,0.32]}],"landmarks":[{"kind":"plume","from":[330,6],"via":[50,75],"to":[134,6],"width":[2,14],"lit":[0.74,0.7,0.64],"belly":[0.35,0.31,0.29],"alpha":0.8,"haze":0.3,"drift":0.01},{"kind":"band","win":[160,60,4],"el":[-1.25,-1.0],"lit":[1.1,1.1,1.05],"alpha":0.5,"noise":0,"haze":0.25}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
SKY.modes({hours:{day:13,night:22},hooks:_onLight,set:m=>{LIGHT_MODE=m;}});   /* the Day and Night buttons, the night views, key n */
