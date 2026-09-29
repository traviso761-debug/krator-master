// TARGET: arcoindian — Arcoindian I, the cliff-topography arcology, intact and
// ruined. A city built into an overhang bitten out of a cliff face: three round
// towers on a courtyard plinth carried on nine irregular terraces, with half
// the city excavated back into the rock behind it and lit by wells dropped from
// the plateau above.
//
// Its own target because it brings its own site: 1 170 m of escarpment, a
// 620 m plateau, a 300 m rock vault and 2 300 m of ground in z. None of that
// fits the kit's row layout, and the type is a 700 k-triangle megastructure.
//
// Arcoindian II is a separate type whose drawings have not arrived; nothing
// here is sized for it and seed block 9590 is left alone for it.
const TITLE='Arcoindian I — the cliff arcology';
// The model runs z = -1320 (the back of the plateau) to +960 (where the
// inter-city viaduct leaves the frame), so the ground plane is centred on the
// middle of that rather than on the cliff line.
const GROUND_C=-180;
const DECAYS=[0,1];
// The built work reaches x = -1560 (the west taper) to +348 (the spoil beyond
// the section cut), i.e. 1 908 m wide and NOT centred on its own axis. s=1650
// puts 3 300 m between the two axes, which leaves 1 392 m of open plain between
// the ruined site's west taper and the intact site's spoil — enough that the
// two escarpments read as two cliffs and not as one long one.
const ROWS={
 arcoindian:{z:0,s:1650,r:1100},
};
// The intact site stands at -s and the ruined one at +s (SITEX in 90-scene.js).
// Both greenings are centred on the city rather than on the builder origin,
// because the builder origin is out on the plain 270 m in front of it. The ruin
// takes the wider circle: its roof fall threw debris well past the shelf. Both
// are small: the greening is a strong green against red Tharnish soil, and at
// r=950 the whole plain in front of the cliff came back looking mown.
const RUINS=[[-ROWS.arcoindian.s-130,-270,ROWS.arcoindian.r*.52],
             [ROWS.arcoindian.s-130,-270,ROWS.arcoindian.r*.68]];
const EXTRA_BUILDERS={arcoindian:buildArcoindian};
