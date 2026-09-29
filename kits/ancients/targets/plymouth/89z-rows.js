// TARGET: plymouth — the Plymouth Arcology, intact and ruined side by side.
// SimCity 2000's first arcology read as what it actually is: a residential
// mountain. A broad stepped mass on a chamfered rectilinear plan, 732 x 524 m at
// the foot and 267 m to the roof, with fourteen terraces of housing, a covered
// public street cut through it at deck level, a plaza at the west end of that
// street, and a working crown of plant, tanks, gardens and a mast.
// (The Forest Tower is the planted-torus reading; Darco is the swept horn.)
const TITLE='Plymouth Arcology — the residential mountain';
const GROUND_C=0;
const DECAYS=[0,1];
const ROWS={
 plymouth:{z:0,s:980,r:620},
};
// SITEX in 90-scene.js puts d=0 at -s and d=1 at +s, so both halves of the
// ground want greening. The ruin gets the wider circle: it has had time to be
// overgrown, and its collapsed flank has spilled well past the podium skirt.
const RUINS=[[-ROWS.plymouth.s,ROWS.plymouth.z,ROWS.plymouth.r],
             [ROWS.plymouth.s,ROWS.plymouth.z,ROWS.plymouth.r*1.22]];
const EXTRA_BUILDERS={plymouth:buildPlymouth};
