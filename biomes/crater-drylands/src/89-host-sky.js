// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the northern crater drylands, px 502, 384), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Kept from the dome: the Throne's cone far to the SSE and the kopjes (ridges); its plume, the wildfire smoke at az 48 and the
// Ring Sea's silver line are not drawn (no landmark layer in the sky yet: KNOWN_ISSUES).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:502,py:384},
 preset:{"air":{"pressure":1.9,"dustK":0.25,"dust":[0.85,0.81,0.72]},"clouds":{"cover":0.3},"fogDensity":0.0001516,"ridges":[{"base":3.85,"amp":0.4,"cycles":24,"octaves":2,"seed":31,"win":[152,37.8,2.1],"floor":-1,"dist":300000,"haze":0.0165,"rock":[0.7,0.72,0.75]},{"base":0.2,"amp":0.5,"cycles":48,"octaves":3,"seed":17,"peaks":18,"peakAmp":1.6,"win":[320,180,0.25],"floor":0.05,"dist":20000,"haze":0.187,"rock":[0.69,0.67,0.63]},{"base":0.1,"amp":0.3,"cycles":48,"octaves":3,"seed":42,"peaks":18,"peakAmp":0.9,"win":[320,180,0.25],"floor":0.03,"dist":8000,"haze":0.3433,"rock":[0.53,0.49,0.41]}]}});
const {sky,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
