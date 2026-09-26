// TARGET: hill — the Hill Arcology, intact and ruined. A city built INTO a
// slope, climbing sinuously: 111 garden terraces, one per level, each 280 m of
// along-contour frontage (half the structure's 560 m height), each plate 10-100 m
// deep with an irregular edge, and each terrace's floor the partial roof of the
// terrace below it. A great antechamber is cut into the foot; a flattened summit
// 1 320 m across carries twelve Ancient buildings.
//
// Its own target because it brings its own LANDFORM, and a big one: terrainH() is
// flat 0 everywhere in this kit, so the hill is modelled as part of the type — a
// whaleback 3 760 m across and 560 m tall, with the city's corridor excavated
// into its flank and rock walls down both sides of it. None of that fits the
// kit's row layout, and the type is a 700 k-triangle megastructure before the
// roof city is counted.
const TITLE='The Hill Arcology';
// Both sites are hills 3 760 m across standing ON the ground plane rather than
// pits cut into it, so the plane's own paint is only visible outside the toes.
const GROUND_C=0;
const DECAYS=[0,1];
// The built work reaches r = 2 140 (the toe skirt) from each site axis, so
// s=2 600 leaves 920 m of open plain between the two hills' skirts — enough that
// they read as two hills rather than as a ridge.
const ROWS={
 hill:{z:0,s:2600,r:1900},
};
// The intact site stands at -s and the ruined one at +s (SITEX in 90-scene.js).
// Both greenings are centred on their own site: the KNOWN_ISSUES entry about
// RUINS greening the empty mirror position is avoided by naming both explicitly.
// The ruin takes the wider circle — five thousand years of planting has left the
// hill, the debris fan and the plain below it greener than the working city's.
const RUINS=[[-ROWS.hill.s,0,ROWS.hill.r*.62],
             [ROWS.hill.s,0,ROWS.hill.r*1.15]];
const EXTRA_BUILDERS={hill:buildHill};
