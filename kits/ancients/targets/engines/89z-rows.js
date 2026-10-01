// TARGET: engines — fifteen cyclopean machines of unclear purpose on one plain,
// all ruined: the Harrow, the Strider, the Breech, the Gyre and the Press
// (src/8ah-engines.js); the Sleeper, the Carapace, the Retorts, the Needle and
// the Ram (src/8ai-engines2.js); the Loom, the Coil, the Bell, the Bellows and
// the Grasp (src/8aj-engines3.js).
//
// One landscape, not a row of pairs: each machine is shown once, ruined
// (decay 1), and they stand 1-2 km apart so any one of them looms behind
// another. SITEX puts decay 1 at x = s, so `s` is simply each machine's x.
const TITLE='The Engines — fifteen machines on the plain';
const GROUND_C=-1000;
const DECAYS=[1];
const ROWS={
 harrow:  {z:  300,s: -500,r:420},
 strider: {z: -100,s:  650,r:300},
 breech:  {z: -900,s:-1100,r:320},
 gyre:    {z:-1300,s:  250,r:360},
 press:   {z:-1100,s: 1350,r:300},
 sleeper: {z: -200,s:-1800,r:320},
 carapace:{z:  300,s: 2200,r:340},
 retorts: {z:-2400,s: -500,r:300},
 needle:  {z:-2700,s: 1400,r:420},
 ram:     {z:-1500,s:-2600,r:380},
 loom:    {z:-2350,s:  500,r:300},
 coil:    {z:-1350,s: 2750,r:330},
 bell:    {z:-2050,s:-1600,r:300},
 bellows: {z:  850,s:-2250,r:330},
 grasp:   {z: 1050,s: 1200,r:300},
};
// A little greening under each machine.
const RUINS=Object.keys(ROWS).map(k=>[ROWS[k].s,ROWS[k].z,ROWS[k].r*.9]);
const EXTRA_BUILDERS={harrow:buildHarrow,strider:buildStrider,breech:buildBreech,gyre:buildGyre,press:buildPress,
 sleeper:buildSleeper,carapace:buildCarapace,retorts:buildRetorts,needle:buildNeedle,ram:buildRam,
 loom:buildLoom,coil:buildCoil,bell:buildBell,bellows:buildBellows,grasp:buildGrasp};
