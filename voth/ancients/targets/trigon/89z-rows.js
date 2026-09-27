// TARGET: trigon — the Trigon, a pyramid on an equilateral base three times as
// tall as it is wide, intact and ruined.
//
// 1 100 m to the apex on a 367 m base edge. Three faces, three cities: a
// ziggurat of planted terraces (WNW), a sheer grid of balconies (S) and an ochre
// face pierced by five nested triangular portals over lit atria (ENE).
//
// Its own target because it is a 700 k-triangle megastructure on its own and a
// kilometre-tall spike needs its own stand-off.
const TITLE='Trigon — the three-faced pyramid';
const GROUND_C=0;
const DECAYS=[0,1];
// The mass is 424 m across its corners and the plinth 530; the ruin throws its
// apex 700 m south-east. s = 2 400 puts 4 800 m between the two axes, so the
// hero camera 1 750 m off one pyramid has the other only as a far silhouette.
const ROWS={
 trigon:{z:0,s:2400,r:950},
};
const RUINS=[[-ROWS.trigon.s,0,ROWS.trigon.r*.7],
             [ROWS.trigon.s,0,ROWS.trigon.r*1.05]];
const EXTRA_BUILDERS={trigon:buildTrigon};
