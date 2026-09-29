// TARGET: arcoindian2 — Arcoindian II, the half-cave, intact and ruined. Not a
// sequence of underground spaces but the use of a deep shelf on the wall of a
// canyon: a gaping hollow bitten into the cliff, its mouth open to the south so
// it is a winter sun trap and a summer parasol, with a flattened lens of city
// slung inside it and hung on a shaft of learning that drops 430 m to the water
// on the floor of the valley.
//
// Its own target because it brings its own site, and a bigger one than
// Arcoindian I's: 1 650 m of escarpment, a 690 m rim plateau, a 280 m hollow,
// a gorge 800 m across with a far wall and a water body in it, and a 740 m
// transportation bridge spanning the lot. None of that fits the kit's row
// layout, and the type is a 700 k-triangle megastructure.
const TITLE='Arcoindian II — the half-cave';
// The model runs z = -1250 (the back of the rim plateau) to +692 (the far wall
// of the canyon), so the ground plane is centred on the middle of that rather
// than on the cliff line.
const GROUND_C=-280;
const DECAYS=[0,1];
// The built work reaches x = -1500 (the west taper) to +570 (the spoil and the
// gorge floor beyond the master joint), i.e. 2 070 m wide and NOT centred on
// its own axis. s=1800 puts 3 600 m between the two axes, which leaves 1 530 m
// of open gorge between the ruined site's west taper and the intact site's
// spoil — enough that the two escarpments read as two cliffs rather than as one
// continuous wall.
const ROWS={
 arcoindian2:{z:0,s:1800,r:1200},
};
// The intact site stands at -s and the ruined one at +s (SITEX in 90-scene.js).
// Both greenings are centred on the gorge floor in front of the cave rather
// than on the builder origin: this is the one part of the site at y = 0, it is
// where the parks and the marina are, and it is the only place the ground paint
// can be seen at all — everything else in the composition is 340 m up or is
// rock. The ruin takes the wider circle; its roof fall threw debris off the
// shelf and across the valley floor.
const RUINS=[[-ROWS.arcoindian2.s-14,120,ROWS.arcoindian2.r*.46],
             [ROWS.arcoindian2.s-14,120,ROWS.arcoindian2.r*.60]];
const EXTRA_BUILDERS={arcoindian2:buildArcoindian2};
