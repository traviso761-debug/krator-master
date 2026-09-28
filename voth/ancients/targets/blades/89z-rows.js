// TARGET: blades — the Blades, six inhabited concrete slabs round a covered
// plaza, curling outward at the top like a flame; intact and ruined.
//
// Its own target because the tallest blade stands ~850 m and the ruin throws
// its upper half ~850 m out onto the plain, and because it is a 700 k-triangle
// megastructure on its own.
const TITLE='The Blades — a flame of six slabs';
const GROUND_C=0;
const DECAYS=[0,1];
// The plinth is ~600 m across; the curls reach ~300 m off the axis; the ruin's
// north-west blade lies out to ~850 m NNW. s = 2 400 puts 4 800 m between the
// two axes, so a hero camera ~1 500 m off one group does not frame the other.
const ROWS={
 blades:{z:0,s:2400,r:1100},
};
// Intact at -s, ruin at +s. The ruin's plain has greened over further.
const RUINS=[[-ROWS.blades.s,0,ROWS.blades.r*.55],
             [ROWS.blades.s,0,ROWS.blades.r*1.0]];
const EXTRA_BUILDERS={blades:buildBlades};
