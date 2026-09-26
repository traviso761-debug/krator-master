// TARGET: forest — the Forest Tower, intact and ruined side by side.
// SimCity 2000's tree-covered arcology crossed with Soleri's Arcvillage II:
// six cylindrical columns on a hexagon, five planted toruses staggered up and
// inward off them, a funnel of skylight down the middle, and a hexagonal hotel
// tube carried 660 m up on the columns with the funnel running on through it.
// (The Forest RING, its sibling, is the barrel-and-circular-toruses reading.)
const TITLE='Forest Tower — the Canopy';
const GROUND_C=0;
const DECAYS=[0,1];
const ROWS={
 forest:{z:0,s:1100,r:760},
};
// The d=0 site is at -s and d=1 at +s (SITEX in 90-scene.js), so both sides of
// the ground texture want greening — the ruin more than the intact one.
const RUINS=[[-ROWS.forest.s,ROWS.forest.z,ROWS.forest.r],
             [ROWS.forest.s,ROWS.forest.z,ROWS.forest.r*1.25]];
const EXTRA_BUILDERS={forest:buildForest};
