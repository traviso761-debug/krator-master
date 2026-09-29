// TARGET: wheel — the Wheel, a raised ring of parkland on eight towers, intact
// and ruined.
//
// A band of forested parkland and buildings 2.9 km across, carried 300 m up on
// eight inhabited towers, with a 1.1 km central tower on the axis and eight
// parkland spokes running from it to the rim towers, the whole pierced with
// light wells over a lower city. Its own target because it is 3.7 km across
// with its lower city and a 700 k-triangle megastructure on its own.
const TITLE='The Wheel — the ring city on eight towers';
const GROUND_C=0;
const DECAYS=[0,1];
// Each site is the wheel (outer radius 1 450 m) inside its lower city (radius
// 1 850 m); the ruin throws its broken tower another 450 m out past the rim.
// s = 3 800 puts 7 600 m between the axes: 3 900 m of open plain between the two
// cities, and every preset below looks away from the other site or has 7 km of
// haze between it and the other one.
const ROWS={
 wheel:{z:0,s:3800,r:2100},
};
// A green belt round each city; the ruin's plain has gone wild further out.
const RUINS=[[-ROWS.wheel.s,0,ROWS.wheel.r*.95],
             [ROWS.wheel.s,0,ROWS.wheel.r*1.12]];
const EXTRA_BUILDERS={wheel:buildWheel};
