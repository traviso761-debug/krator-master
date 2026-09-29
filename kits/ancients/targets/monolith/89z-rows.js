// TARGET: monolith — the Monolith, a slab arcology with a through-arch at its
// foot and three circular oculi, intact and ruined.
//
// Its own target because it is 1 100 m tall — Hexahedron scale — and a
// 700 k-triangle megastructure on its own.
const TITLE='The Monolith — the slab with the arch';
const GROUND_C=0;
const DECAYS=[0,1];
// The slab is 380 m across its foot, the outliers stand 560 m off its axis and
// the ruin's fallen corner lies up to 800 m east of it. s = 2 400 puts 4 800 m
// between the two axes, so a hero camera 1 500 m off one slab does not have
// the other in frame, and edge-on views along x look away from the other site.
const ROWS={
 monolith:{z:0,s:2400,r:1100},
};
// A desert type: only a little greening under each site. Intact at -s, ruin at +s.
const RUINS=[[-ROWS.monolith.s,0,ROWS.monolith.r*.45],
             [ROWS.monolith.s,0,ROWS.monolith.r*.32]];
const EXTRA_BUILDERS={monolith:buildMonolith};
