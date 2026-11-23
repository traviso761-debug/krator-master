// TARGET: shelf — the cantilevered cliff city (built 2026-09 as the Ledge; designated for Shelf, the Line's north
// station town, by the owner 2026-11-17 and renamed 2026-11-22: settlements/shelf/PLAN.md). Terraced slab layers off a
// sandstone cliff, intact and ruined. Its builder keeps its name (src/89i-ledge.js, buildLedge): every kit page carries
// that fragment, so renaming it would change them all. Shelf's own page draws the form from records (kits/ancients/cliff).
//
// Its own target because the cliff it hangs off is 2 km of escarpment and
// 850 m tall, and the city is a 700 k-triangle megastructure on its own.
const TITLE='Shelf — the cantilevered cliff city';
const GROUND_C=0;
const DECAYS=[0,1];
// The cliff faces WEST (-x), toward the sun, and runs along z. Each site is a
// massif 1 500 m deep behind its face with a 2 000 m town-and-plain apron in
// front of it, so a site spans about x = -2 600 .. +1 500 about its own axis.
// s = 3 600 puts the intact massif's back 3 900 m clear of the ruin's plain,
// and every preset looks either along z or into +x, away from the other site.
const ROWS={
 shelf:{z:0,s:3600,r:1500},
};
// Desert: a little green round the foot of each. Intact at -s, ruin at +s.
const RUINS=[[-ROWS.shelf.s-450,0,ROWS.shelf.r*.40],
             [ROWS.shelf.s-450,0,ROWS.shelf.r*.30]];
const EXTRA_BUILDERS={shelf:buildLedge};
