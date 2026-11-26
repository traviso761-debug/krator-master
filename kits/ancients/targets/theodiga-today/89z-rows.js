// TARGET: theodiga-today — Theodiga as it stands now (settlements/theodiga, T-town-2, 2026-11-16): the ruined dam with the
// Dome on the Water and the river through the Notch (the theodiga target's fragments, read in place by build.py), and the town
// on the east rim: core/city's records (settlements/theodiga/src/40-th-town.js) drawn from the scrap Xanadu set and the Qiblai
// kit (src/8ay1-th-town.js). The ruin only: the intact dam is the theodiga target's.
const TITLE='Theodiga today — the shrine of the Decree and its town';
const GROUND_C=0;            // z centre of the ground plane and its paint
const DECAYS=[1];
const ROWS={dam:{z:0,s:1150,r:900}};
const RUINS=Object.values(ROWS).flatMap(r=>r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]]);
