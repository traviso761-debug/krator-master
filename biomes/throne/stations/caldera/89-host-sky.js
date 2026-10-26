// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the Throne, px 571, 514), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// Station 10, the caldera rim, about 0.4 atm: an indigo zenith. No far land; the plume is real geometry (86). The cloud sea all round
// below the horizon is not drawn (no landmark layer yet). Snow and ash weather grey the sky and darken the hour's light.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:571,py:514},
 preset:{"air":{"pressure":0.4,"humidity":0.5},"clouds":{"cover":0.05},"fogDensity":0.00036,"ridges":[]},onLook:SKY_LOOK,weatherOver:true,weatherLook:true});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene, a layer) */
SKY.modes({hours:{day:13,night:22},hooks:_onLight,set:m=>{LIGHT_MODE=m;}});   /* the Day and Night buttons, the night views, key n */
HEAT.before=SKY.renderSky;   /* the shared sky drawn first into the shimmer's target (83-host-heat.js) */
