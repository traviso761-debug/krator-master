// TARGET: veladiga — Soleri's other dam arcology, intact and breached.
const TITLE='Veladiga — dam arcology';
const GROUND_C=0;
const DECAYS=[0,2];                    // intact, and blown open
const ROWS={veladiga:{z:0,s:1800,r:1300,t:5400}};
const RUINS=Object.values(ROWS).flatMap(r=>r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]]);
const EXTRA_BUILDERS={veladiga:buildVeladiga};
