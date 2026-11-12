// ================================================================= HOST — Krator's sky: the shared sky (core/atmos, SKY-PLAN.md section 9; replaces the kit's 89-host-sky.js)
// ATMOS.skyBiome at the flood lake's NW lowlands shore, west of station 2's n semiarid half (the site is approximate: the station is on the plan's
// levels, not scale model 5.1's, which moved the trough; KNOWN_ISSUES.md), on the host clock, with the real sun, giant, ring, moons and clouds.
// The air: ~830 m over the basin, ~1.4 atm, the Csa hills' summer haze; the kit's ridges (the Outer Wall far to the NW, low hills round)
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun:sun,site:{px:400,py:170},
 preset:{"air":{"pressure":1.42,"humidity":0.5},"clouds":{"cover":0.3},"fogDensity":0.00016,"ridges":[{"base":2.16,"amp":1.2,"cycles":31,"octaves":3,"seed":21,"win":[315,90,1],"floor":-0.53,"dist":40000,"haze":0.036,"forestH":0,"rock":[0.5,0.56,0.6]},{"base":0.3,"amp":0.8,"cycles":56,"octaves":3,"seed":23,"win":[200,160,0.3],"floor":0,"dist":9000,"haze":0.48,"forestH":100000.0,"rock":[0.52,0.55,0.46],"forest":[0.52,0.55,0.46]}]}});
const {sky,giant,giantRing}=SKY.legacy;   /* the old dome's names, for what still reads them (the water's skylight scene) */
