// TARGET: spire — Vashtir, the recursive spire, on its own at the origin.
//
// A colossal pale pyramid-mountain grown from a self-similar hierarchy of
// broad, shallow, many-sided tiers: out of the shoulders of each tier grow
// smaller copies of the same form, three levels deep, so the silhouette is one
// great triangular mass that dissolves into a lace of spines and fins at its
// edges. Built by buildSpire() in src/61-spire.js, which is registered here
// through EXTRA_BUILDERS so the work lives entirely in its own target.
const TITLE='Vashtir — megastructure';
const GROUND_C=0;                            // z centre of the ground plane and its paint
const ROWS={spire:{z:0,s:900,r:700}};        // intact at x=-900, ruined at x=+900
const RUINS=Object.values(ROWS).flatMap(r=>r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]]);
const EXTRA_BUILDERS={spire:buildSpire};     // hook that registers the builder
