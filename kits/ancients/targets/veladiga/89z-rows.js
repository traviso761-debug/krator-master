// TARGET: veladiga — Soleri's other dam arcology, intact and breached.
const TITLE='Veladiga — dam arcology';
const GROUND_C=0;
const DECAYS=[0,2];                    // intact, and blown open
const ROWS={veladiga:{z:0,s:1800,r:1300,t:5400}};
// RUINS greens the ground where a RUIN stands. This target builds only decays
// 0 (at -s) and 2 (at t), so the shared one-liner's [+s] greened an empty
// patch of plain at x=+1800 (KNOWN_ISSUES, the Hexahedron entry). Only the
// breached dam is a ruin here.
const RUINS=Object.values(ROWS).map(r=>[r.t,r.z,r.r*1.4]);
const EXTRA_BUILDERS={veladiga:buildVeladiga};
