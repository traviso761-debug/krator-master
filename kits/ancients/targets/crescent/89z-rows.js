// TARGET: crescent — The Crescent, the terraced moon, intact and ruined.
//
// A crescent 1 112 m tall standing upright on its lower horn, concave mouth to
// the west, the inner edge a cascade of terraces and the outer edge a clean
// bronze shell. Its own target because it is a 700 k-triangle megastructure on
// its own and its forecourt and fallen horn need 2 km of plain.
const TITLE='The Crescent — the terraced moon';
const GROUND_C=0;
const DECAYS=[0,1];
// A site runs from the ruin's fallen horn 1 300 m west of the axis to the plaza
// rim 710 m east of it, so it is about 2 000 m wide and centred west of its own
// axis. s = 2 400 leaves ~2 100 m of open plain between the intact belly and the
// ruin's farthest horn piece, and keeps the two ground-paint discs apart.
const ROWS={
 crescent:{z:0,s:2400,r:1250},
};
// Intact at -s, ruined at +s (SITEX in 90-scene.js). The ruin greens wider: its
// horn lies 1 300 m out across the forecourt and the plain has had it for ages.
const RUINS=[[-ROWS.crescent.s,0,ROWS.crescent.r*.62],
             [ROWS.crescent.s-250,0,ROWS.crescent.r*1.05]];
const EXTRA_BUILDERS={crescent:buildCrescent};
