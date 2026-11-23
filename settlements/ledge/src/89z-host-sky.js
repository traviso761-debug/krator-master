// ================================================================= HOST — the shared sky (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws Krator's standard sky at Ledge's place on the scale model (5.1 px 437,1330: the sky model's old-canvas frame
// px 165,1000, as riftrim's station 1 gives it) on the host clock, and drives the sun, the hemisphere, the fill and the fog. The air
// is the census's 1.32 atm; the basin's haze rises up the face. ATMOS.bindHost gives core/atmos the page's ground and ticks (the
// clock and the waves the lake reads, 89zw).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun,site:{px:165,py:1000},
 preset:{air:{pressure:1.32,humidity:.66},clouds:{cover:.35,cumulus:.6,cirrus:.3},fogDensity:.00005}});
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:LEDGE_H,hour:()=>13,seed:4377,viewH:()=>innerHeight});
