// TARGET: ring — the Forest Ring, intact and ruined side by side.
// SimCity 2000's forest arcology read as the squat tree-covered DRUM rather
// than as a tower: one barrel-shaped mass, bulging at the waist and drawn in
// top and bottom, carrying three concentric circular toruses of forest with a
// terraced living band between each pair. The hexagonal reading of the same
// source is the Forest Tower, in its own target.
const TITLE='Forest Ring — the barrel arcology';
const GROUND_C=0;
const DECAYS=[0,1];
// s 1100 -> 1500. The wheel is 1440 m across, so at the old spacing the two
// sites' rims overlapped by 640 m — measured, not guessed: 2*1100 = 2200 of
// centre-to-centre against 2*720 = 1440 of structure. 3000 leaves 1560 m of
// clear ground between them.
const ROWS={
 ring:{z:0,s:1500,r:1100},
};
// The d=0 site is at -s and d=1 at +s (SITEX in 90-scene.js), so both sides of
// the ground texture want greening — the ruin more than the intact one, since
// the forest has had time to come off the crown and down the plinth.
const RUINS=[[-ROWS.ring.s,ROWS.ring.z,ROWS.ring.r],
             [ROWS.ring.s,ROWS.ring.z,ROWS.ring.r*1.22]];
const EXTRA_BUILDERS={ring:buildForestRing};
