// ================================================================= HOST — Krator's sky (station 3, the lagoon: src/89-host-sky.js with one ridge more)
// The lee shore's hypertree wall, 60 km to the east-north-east of the bank (5.1: Talon at px 1026,760 from the bank's px 1002,779), is a low forested ridge
// on the horizon (the first entry of ridges); the rest is src/'s. The sky's site stays the isles' (px 653, 521 on the sky model's own frame): the bank
// lies in the same reach of the Ring Sea, and the sky's site table is not re-cut for 5.1 (biomes/STATIONS-MAP-5.1.md, "Regions needing a re-cut")
// (src/'s header follows)
// ---- Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the East Ring Isles, px 653, 521), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Kept from the dome: the Throne, moved to where it stands from the isles (due west, about 160 km); the canopy lines the dome
// inherited from the geyser kit's coast are dropped (sea on every side). Day and night are hours now (13:00 and 22:00).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:653,py:521},
 preset:{"air":{"pressure":1.9,"humidity":0.85},"clouds":{"cover":0.45},"fogDensity":0.0002189,"ridges":[{"base":0.35,"amp":0.18,"cycles":40,"octaves":3,"seed":31,"win":[52,80,0.9],"floor":-0.4,"dist":60000,"haze":0.02,"forestH":0.25,"rock":[0.3,0.38,0.3]},{"base":1.5,"amp":1.4,"cycles":6,"octaves":3,"seed":11,"win":[267.5,105,0.6],"floor":-0.4,"dist":300000,"haze":0.0114,"forestH":0,"rock":[0.65,0.72,0.7]},{"base":2.2,"amp":0.3,"cycles":24,"octaves":3,"seed":12,"win":[265,35,3.5],"floor":-0.4,"dist":244000,"haze":0.0122,"forestH":0,"rock":[0.56,0.62,0.61]}],"landmarks":[{"kind":"plume","from":[265,2.3],"via":[261,6],"to":[236,11],"width":[0.9,5],"lit":[0.86,0.86,0.84],"belly":[0.42,0.39,0.36],"alpha":0.45,"haze":0.3,"drift":0.02}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
SKY.modes({hours:{day:13,night:22},hooks:_onLight,set:m=>{LIGHT_MODE=m;}});   /* the Day and Night buttons, the night views, key n */
