// TARGET: darco — the swept-horn arcology, intact and with the horn brought down.
const TITLE='Darco Arcology — the swept horn';
const GROUND_C=0;
const DECAYS=[0,1];
const ROWS={
 darco:{z:0,s:900,r:340},
};
// The intact site is at -s and the ruined one at +s (see SITEX in 90-scene.js).
// The ruin gets the wider greening: that is the one the forest has had time to
// reach, and its fallen horn lies 400 m out from the plaza rim.
const RUINS=[[-ROWS.darco.s,0,ROWS.darco.r*.85],[ROWS.darco.s,0,ROWS.darco.r*1.35]];
const EXTRA_BUILDERS={darco:buildDarco};
