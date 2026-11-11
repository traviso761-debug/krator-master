// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// station's place on the scale model (5.1 px: LAND.sky, PLAN.md "On scale model 5.1"), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Kept from the dome: the far ranges beyond the Outer Rim, the abyss's far rim in the west and the mesas (ridges). The Outer
// Rim's near wall is the map's own range (real terrain), so it is not painted again.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:LAND.sky||{px:437,py:1330},   /* a station has its own place (44w: LAND.sky) */

 preset:{"air":{"pressure":LAND.atm==null?1.0:LAND.atm,"dustK":0.12,"dust":[0.8,0.82,0.86]},"clouds":{"cover":LAND.cloud==null?0.35:LAND.cloud},"fogDensity":0.0001257,"ridges":[{"base":0.25,"amp":0.2,"cycles":40,"octaves":2,"seed":113,"win":[270,90,1.6],"floor":-1,"dist":60000,"haze":0.1351,"rock":[0.69,0.66,0.67]},{"base":3.6,"amp":2.2,"cycles":19,"octaves":5,"seed":61,"peaks":24,"peakAmp":4.5,"win":[90,90,1.2],"floor":0.67,"dist":45000,"haze":0.1569,"rock":[0.59,0.63,0.71],"snow":[0.96,0.97,0.99],"snowH":3000},{"base":0.12,"amp":0.45,"cycles":60,"octaves":2,"seed":17,"win":[90,180,0.6],"floor":0.02,"dist":15000,"haze":0.3514,"rock":[0.66,0.52,0.45]},{"base":0.07,"amp":0.28,"cycles":60,"octaves":2,"seed":42,"win":[90,180,0.6],"floor":0.01,"dist":6000,"haze":0.6296,"rock":[0.55,0.38,0.33]}]}});
const {sky,giant,giantRing,giantDir,GIANT_DIST}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
