// TARGET: strongbow — Strongbow, the Ancients' cliff arcology: a city hung down a cliff at the Oidong Valley's west end, toward
// Qiblai, as built and as a thousand years have left it.
//
// The tower, a slender wedge hull 462 m tall, 60 m of it over the lip, standing free in a bay quarried into a 900 m face, held by fans of stays; the crown
// with its raked mast and arc ramp; the Nock, the deck at mid-height with the landing pad before the tower's prow; the Spine, one
// column of drums and terraces coming down from under the Nock to the foot, plumb in places and stepping out in others; the lower
// hull; the galleries, the pads, the rim gallery and the heliostats; the Rift line's terminus at the foot; about 27 000 people as
// built (8aw0, NOTES.md). Its own target because it is a
// megastructure on its own: it takes core/rand
// and core/tags (build.py TAGS_TARGETS), and its fragments live here, not in src/.
const TITLE='Strongbow — the cliff arcology';
const GROUND_C=0;
const DECAYS=[0,1];
// s 1 100: each site draws 2 200 m of the same escarpment, so the two meet at x = 0 and the page is one cliff (intact west, ruin east)
const ROWS={
 strongbow:{z:0,s:1100,r:700},
};
const RUINS=[[-1100,300,500],[1100,300,600]];
const EXTRA_BUILDERS={strongbow:buildStrongbow};
