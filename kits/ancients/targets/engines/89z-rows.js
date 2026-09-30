// TARGET: engines — five cyclopean machines of unclear purpose on one plain:
// the Harrow, the Strider, the Breech, the Gyre and the Press (src/8ah-engines.js).
//
// One landscape, not a row of pairs: each machine is shown once, dormant
// (decay 1), and they stand 1-2 km apart so any one of them looms behind
// another. SITEX puts decay 1 at x = s, so `s` is simply each machine's x.
const TITLE='The Engines — five machines on the plain';
const GROUND_C=0;
const DECAYS=[1];
const ROWS={
 harrow: {z:  300,s: -500,r:420},
 strider:{z: -100,s:  650,r:300},
 breech: {z: -900,s:-1100,r:320},
 gyre:   {z:-1300,s:  250,r:360},
 press:  {z:-1100,s: 1350,r:300},
};
// A little greening under each machine, and along the Harrow's furrow.
const RUINS=Object.keys(ROWS).map(k=>[ROWS[k].s,ROWS[k].z,ROWS[k].r*.9])
 .concat([[ROWS.harrow.s-700,ROWS.harrow.z,260],[ROWS.harrow.s-1300,ROWS.harrow.z,220]]);
const EXTRA_BUILDERS={harrow:buildHarrow,strider:buildStrider,breech:buildBreech,gyre:buildGyre,press:buildPress};
