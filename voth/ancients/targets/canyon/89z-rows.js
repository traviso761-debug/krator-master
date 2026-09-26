// TARGET: canyon — the cross-canyon pipe works and everything hung beneath them.
// Its own target because it has its own site (a gorge) and nothing to do with
// the kit's row layout.
const TITLE='The Span — canyon works';
const GROUND_C=0;
const ROWS={canyon:{z:0,s:2900,r:1400,t:8700}};   // intact west, rusted east, fallen far east
const RUINS=Object.values(ROWS).flatMap(r=>r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]]);
const EXTRA_BUILDERS={canyon:buildCanyon};
