// TARGET: arcpile — the Pile, a stack of blocks: the Rift's ruined arcology, as built and as the Rift has left it.
//
// Ten tiers of slab blocks, each tier crosswise on the one under it with the space between them open: courts, light,
// gardens on every roof. 940 m square at the ground narrowing up to a terraced ziggurat, the capstone, 435 m up; about 153 700 people at its height.
// The top four tiers and the capstone (the crown, a fifth of the floor) reach the ground only by four great cores and two grand stairs,
// and in the ruin those are cut: the crown is an island with its fields (8at0, NOTES.md).
// Its own target because it is a megastructure on its own, it takes core/rand and core/tags (build.py TAGS_TARGETS),
// and its fragments live here, not in src/, so the kit's other pages do not change.
const TITLE='The Pile — a stack of blocks';
const GROUND_C=0;
const DECAYS=[0,1];
// s 1 500: two 940 m piles with their stairs running 60 m out of each face, and 1 800 m of plain between them
const ROWS={
 arcpile:{z:0,s:1500,r:700},
};
const RUINS=[[-1500,0,700*.75],[1500,0,700*1.05]];
const EXTRA_BUILDERS={arcpile:buildArcpile};
