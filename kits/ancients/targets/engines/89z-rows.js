// TARGET: engines — twenty cyclopean machines of unclear purpose on one plain,
// all ruined: the Harrow, the Strider, the Breech, the Gyre and the Press
// (src/8ah-engines.js), and the Sleeper, the Carapace, the Retorts, the
// Needle and the Ram (src/8ai-engines2.js); and north of them the industrial set
// (the owner, 2026-11-10; targets/engines/8aj-engines3.js): the Coil, the
// Procession, the Mortar, the Vigil, the Receiver, the Loom, the Iris, the
// Hive, the Star and the Abacus.
//
// One landscape, not a row of pairs: each machine is shown once, ruined
// (decay 1), and they stand 1-2 km apart so any one of them looms behind
// another. SITEX puts decay 1 at x = s, so `s` is simply each machine's x.
const TITLE='The Engines — twenty machines on the plain';
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
 coil:      {z:-4300,s:-1500,r:260},
 procession:{z:-4300,s: 1200,r:420},
 mortar:    {z:-5300,s:-2700,r:300},
 vigil:     {z:-5400,s:  -300,r:220},
 receiver:  {z:-5500,s: 2200,r:380},
 loom:      {z:-6500,s:-1500,r:300},
 iris:      {z:-6500,s:  900,r:220},
 hive:      {z:-7400,s:-2800,r:200},
 star:      {z:-7500,s:  -400,r:220},
 abacus:    {z:-7500,s: 2100,r:440},
};
// A little greening under each machine.
const RUINS=Object.keys(ROWS).map(k=>[ROWS[k].s,ROWS[k].z,ROWS[k].r*.9]);
const EXTRA_BUILDERS={harrow:buildHarrow,strider:buildStrider,breech:buildBreech,gyre:buildGyre,press:buildPress,
 sleeper:buildSleeper,carapace:buildCarapace,retorts:buildRetorts,needle:buildNeedle,ram:buildRam,
 coil:buildCoil,procession:buildProcession,mortar:buildMortar,vigil:buildVigil,receiver:buildReceiver,loom:buildLoom,
 iris:buildIris,hive:buildHive,star:buildStar,abacus:buildAbacus};
