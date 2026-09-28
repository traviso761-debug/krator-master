// TARGET: ledge — the Ledge, an arcology of terraced slab layers cantilevered
// off a sandstone cliff, intact and ruined.
//
// Its own target because the cliff it hangs off is 2 km of escarpment and
// 850 m tall, and the city is a 700 k-triangle megastructure on its own.
const TITLE='The Ledge — the cantilevered cliff city';
const GROUND_C=0;
const DECAYS=[0,1];
// The cliff faces WEST (-x), toward the sun, and runs along z. Each site is a
// massif 1 500 m deep behind its face with a 2 000 m town-and-plain apron in
// front of it, so a site spans about x = -2 600 .. +1 500 about its own axis.
// s = 3 600 puts the intact massif's back 3 900 m clear of the ruin's plain,
// and every preset looks either along z or into +x, away from the other site.
const ROWS={
 ledge:{z:0,s:3600,r:1500},
};
// Desert: a little green round the foot of each. Intact at -s, ruin at +s.
const RUINS=[[-ROWS.ledge.s-450,0,ROWS.ledge.r*.40],
             [ROWS.ledge.s-450,0,ROWS.ledge.r*.30]];
const EXTRA_BUILDERS={ledge:buildLedge};
