// TARGET: lozenge — the Lozenge: the Arccube at a quarter height, intact and ruined.
//
// Soleri's cube: a kilometre on a side, stood on a horizontal diagonal so the
// front elevation is a DIAMOND and the side elevation a RECTANGLE, carried clear
// of the ground on vertical-structure legs, with concentric diamond bands of
// living-working, living, cultural centre and city centre wrapped round a void
// bored straight through the middle of it, a heliport on the top vertex and
// seven slot light wells cut down both long flanks.
//
// Its own target because it is 2 414 m across its plan, which nothing in the
// kit's row layout can hold, and because it is a megastructure on its own. At
// the owner's quarter height (2026-10-27) it stands 375 m, its upper faces
// farmed in terraces (NOTES.md, plan/BLUEPRINT.md).
const TITLE='The Lozenge — the cube at a quarter height';
const GROUND_C=0;
const DECAYS=[0,1];
// The mass is 1 000 m along x and the ground works reach 1 080 m west of the
// axis for the arrival plaza, so a site is about 2 200 m wide in x and is NOT
// centred on itself. s = 2 600 puts 5 200 m between the two axes, which leaves
// roughly 3 000 m of open plain between the intact site's plaza and the ruined
// site's west face — enough that a hero camera 1 950 m off one cube does not
// have the other in frame, and enough that neither ground-paint disc touches.
const ROWS={
 lozenge:{z:0,s:2600,r:1500},
};
// The intact site stands at -s and the ruined one at +s (SITEX in 90-scene.js).
// The ruin takes the wider greening: its fallen corner leg throws debris 700 m
// south-east of the footprint and the plain has had five thousand years at it.
const RUINS=[[-ROWS.lozenge.s,0,ROWS.lozenge.r*.78],
             [ROWS.lozenge.s,0,ROWS.lozenge.r*1.05]];
const EXTRA_BUILDERS={lozenge:buildLozenge};
