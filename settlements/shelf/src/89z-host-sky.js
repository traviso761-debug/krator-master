// ================================================================= HOST — the shared sky (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws Krator's standard sky at Shelf's place on the scale model (5.1 px 461,1161: the sky model's old-canvas frame px
// 189,831) on the host clock, and drives the sun, the hemisphere, the fill and the fog. The air is the census's 1.00 atm, dry (Dsb, 533 mm).
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun,site:{px:189,py:831},
 preset:{air:{pressure:1.0,humidity:.4},clouds:{cover:.3,cumulus:.5,cirrus:.4},fogDensity:.00004}});
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:SHELF_H,hour:()=>13,seed:4616,viewH:()=>innerHeight});