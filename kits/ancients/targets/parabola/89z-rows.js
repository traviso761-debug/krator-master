// TARGET: parabola — Parabola, the Bowl's arcology: a terraced paraboloid dish that was a solar furnace, as built and as the
// Bowl has left it.
//
// A dish 1 800 m across and 320 m deep, tilted 30 degrees to the north (Krator's noon sun), on three Cyclopean piers; 41 level
// terraces of homes behind glazed fronts with farms on their roofs, mirror panels on every lip, a receiver of bronze and blue
// glass at the focus on a tripod mast, the terminus hall under the basin; about 120 000 people as built (8av0, NOTES.md).
// Its own target because it is a megastructure on its own: it takes core/rand and core/tags (build.py TAGS_TARGETS) and
// core/water's still water for the rain lake (TARGET_READS), and its fragments live here, not in src/.
const TITLE='Parabola — the Bowl arcology';
const GROUND_C=0;
const DECAYS=[0,1];
// s 1 700: two 1 800 m dishes and the ruin's debris fan to the west of the east one, with 1 400 m of plain between them
const ROWS={
 parabola:{z:0,s:1700,r:950},
};
const RUINS=[[-1700,0,950*.75],[1700,0,950*1.1]];
const EXTRA_BUILDERS={parabola:buildParabola};
