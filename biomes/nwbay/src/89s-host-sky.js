// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9)
// 2026-10-26: the painted dome and the giant mesh (the old 82-host-sky.js) are gone. ATMOS.skyBiome draws ATMOS.sky at this
// biome's place on the scale model (the NW bay, px 458, 452), on the host clock (the page opens at 06:00 on game
// start's day; #hour=, #day=, #time=run), with the real sun, giant, ring, moons, station, stars and clouds, and drives the
// sun, the hemisphere, the fills, the fog and the exposure from the colour script; the clouds shade the lit materials.
// The bay's air is thick (1.9 atm) and humid, as swbay's (the standard blue sky with cumulus kept: the owner, 2026-10-26); its fog
// is the old page's (.00016 at 1.9 atm). No painted ridges: the far country is real terrain and the bay opens to the sea.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,ticks:typeof TICKS!=='undefined'?TICKS:undefined,ground:typeof terrainH!=='undefined'?terrainH:undefined,
 site:{px:458,py:452},preset:{air:{pressure:1.9,humidity:.8},clouds:{cover:.45},fogDensity:.000135}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still builds from them (the water's skylight scene) */
