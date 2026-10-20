// TARGET: sanctum — the Sanctum, the spiral arcology, as the Ancients built it and as the True Heirs keep it.
//
// A tapering drum 660 m tall on a six-pointed podium 690 m across: three great arches at the heads of three of its six
// stairs, and from each a staircase spiralling counterclockwise up the drum, arch to arch, thirty arches in all (8aq0). West: the Ancients' live/work arcology, intact, lit and planted. East: the same plan with
// the Eternal State's deltas (8aq1): the Sanctum, the True Heirs' forbidden city, with onyx in bronze tracery, faces
// everywhere, a moat and a wall, and a titanium colossus on the crown. The two share one seed: one building.
// Its own target because it is a megastructure on its own, it takes core/rand and core/tags (build.py TAGS_TARGETS),
// and its fragments live here, not in src/, so the kit's other 41 pages do not change.
const TITLE='The Sanctum — the spiral arcology and the Sanctum';
const GROUND_C=0;
const DECAYS=[0];
// s 1 700: two 690 m podiums and their 140 m aprons, with a kilometre of plain between them
const ROWS={
 built:{z:0,s:1700,r:520},
 kept:{z:0,s:-1700,r:520},
};
const RUINS=[[-1700,0,520*.7],[1700,0,520*.7]];
const EXTRA_BUILDERS={built:buildSanctum,kept:buildSanctumKept};
