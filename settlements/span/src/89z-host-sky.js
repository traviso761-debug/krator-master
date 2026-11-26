// ================================================================= HOST — the shared sky (core/atmos, SKY-PLAN.md section 9)
// ATMOS.skyBiome draws Krator's standard sky at Span's place on the scale model (px 282, 680; the SW highlands' tableland),
// on the host clock, and drives the sun, the hemisphere, the fill and the fog from its colour script. The binding
// (ATMOS.bindHost) gives core/atmos this page's ground and ticks; the water is the biome kit's, not drawn here yet.
const SKY=ATMOS.skyBiome({renderer,camera,scene,sun,site:{px:282,py:680},
 preset:{air:{pressure:1.1,humidity:.6},clouds:{cover:.3,cumulus:.6,cirrus:.3},fogDensity:.00012}});
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>SPAN.groundAt(SPAN_LAYOUT,x,z),hour:()=>13,seed:2820,viewH:()=>innerHeight});
