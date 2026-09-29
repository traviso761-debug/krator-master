// TARGET: screamers — the village in the ruined Hexahedron.
//
// Setting: northern portion of the central crater, hyperjungle, the great
// volcano far to the SOUTH. This project takes +z as south (Krator canon: x
// east, z south), so the hero cameras sit north of the settlement and look
// back across it toward the mountain.
const TITLE='Hexahedron — village of the Screamers';
const GROUND_C=0;
const DECAYS=[2];                       // there is only the ruin
// Insertion order is build order: the Hexahedron runs first and hands the
// village its surviving dwelling clusters and the shaft bundle's centre.
const ROWS={
 hex :{z:0,s:0,r:1100,t:0},          // t:0 puts the ruin on the origin
 vill:{z:0,s:0,r:800,t:0},
 jung:{z:0,s:0,r:3400,t:0},
};
const RUINS=[[0,0,1100]];               // clears the jungle back round the village
const EXTRA_BUILDERS={hex:buildHexahedron,vill:buildVillage,jung:buildJungle};
