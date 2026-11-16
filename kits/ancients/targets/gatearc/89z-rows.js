// TARGET: gatearc — the Hall of Heroes, the Kimrs' ancestral arcology at the Labyrinth's mouth, and its five carved stacks
// (biomes/labyrinth/PLAN-GATE.md): Soleri's Arcvillage II, a hexagon 424 m across and 400 m high on six columns 100 m
// across, two topographies, a skylight well and a cellular skin, in a reflecting pond, bridged to the stacks. As built
// (west) and as the ruin the Kimr bury their dead in (east). Its fragments live here, not in src/, so the kit's other
// pages do not change; it takes core/rand, core/tags (build.py TAGS_TARGETS) and core/terrain's KSTACKS (TARGET_READS).
const TITLE='The Hall of Heroes — the Kimrs\' ancestral arcology';
const GROUND_C=-120;
const DECAYS=[0,1];
// The stacks reach x -680 .. +700 and z -560 from the Hall's centre, the pond +-450 x +-325. s = 1 050 leaves about
// 700 m of plain between the intact site's Quarry and the ruin's Lookout.
const ROWS={
 gatearc:{z:0,s:1050,r:820},
};
const RUINS=[[-1050,-120,820*.7],[1050,-120,820*1.0]];
const EXTRA_BUILDERS={gatearc:(sc,x,z,d)=>{const G=buildGatearc(sc,x,z,d);buildGatestacks(sc,x,z,d);return G;}};
