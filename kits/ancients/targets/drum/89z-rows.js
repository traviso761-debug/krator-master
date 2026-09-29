// TARGET: drum — The Drum, the second of the memorial group, intact and ruined.
//
// A round tower 836 m tall of radial fins and stacked dwelling blocks in nine
// unlike tiers, bored through by three arched sky gates, crowned by its fins
// alone, standing in a cleared court with low walls radiating from its foot.
// Its own target because it is a 700 k-triangle-class megastructure on its own
// and its court, allée and forest need 2.6 km of plain.
const TITLE='The Drum — fins and blocks';
const GROUND_C=0;
const DECAYS=[0,1];
// A site is the court (560 m), the allée out to 900 m on the south side, and a
// ring of forest out to about 1 430 m; the ruin's fallen top lies inside 900 m.
// s = 2 200 leaves ~1 500 m of plain between the two forests, and a hero camera
// 1 250 m south of one drum, looking a little east of north, has the other
// 56 degrees off its axis — outside the 37 degree half-width of the frame.
const ROWS={
 drum:{z:0,s:2200,r:1450},
};
// Intact at -s, ruined at +s (SITEX in 90-scene.js). The ruin greens wider.
const RUINS=[[-ROWS.drum.s,0,ROWS.drum.r*.45],
             [ROWS.drum.s,0,ROWS.drum.r*.95]];
const EXTRA_BUILDERS={drum:buildDrum};
