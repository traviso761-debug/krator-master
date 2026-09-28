// TARGET: wing — the Wing, first of the memorial group, intact and ruined.
//
// A coffered drum held in a yoke on one pedestal, and two wings of seven stacked
// dwelling slabs in echelon cantilevering out of it: 468 m high, 1 400 m tip to
// tip, on a 900 x 500 m three-tier plinth.
//
// Its own target because it is a 700 k-triangle megastructure on its own and a
// 1.4 km gesture needs its own stand-off.
const TITLE='The Wing — a monument that is also a city';
const GROUND_C=0;
const DECAYS=[0,1];
// The intact span is 1 400 m; the ruin throws its east wing out to x = +1 250.
// s = 2 600 puts 5 200 m between the axes, so a hero 1 400 m off one site has
// the other only as a far speck.
const ROWS={
 wing:{z:0,s:2600,r:1300},
};
const RUINS=[[-ROWS.wing.s,0,ROWS.wing.r*.7],
             [ROWS.wing.s,0,ROWS.wing.r*1.05]];
const EXTRA_BUILDERS={wing:buildWing};
