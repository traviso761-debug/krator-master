/* ==================== kits/coyote 34: the Coyote rows for core/hamlet, DRAFT (plain data, [G data]) ==================== */
/* PLAN.md section 6. The Valley tribe's row in core/hamlet's shape (core/hamlet/20-hamlet-cultures.js; the platform fields of
   32-hamlet-platform.js): which of this kit's defs a Coyote village is made of. It is a DRAFT kept in the kit until C7 moves
   it into core/hamlet as its own fragment (22-hamlet-coyote.js), so no page that lists core/hamlet changes before then. A
   host passes it as spec.culture (a row is accepted where a name is), with dims(key) from this kit's defs (cyDims).
   The Valley builds Catalhoyuk's way (the owner, 2026-11-16): houses packed wall to wall on the tell, entered through the
   roof, two storeys at most; the platform village's plinth is the tell, its plaza the open yard, its kivas the shrine room
   and the council hall, sunk in the yard (kivas 'plaza'), the pen and the works at the tell's foot. */
const CY_ROW_VALLEY={
 kit:'coyote', household:5, workShare:.45, slopeMax:.3,
 religious:'cy_shrine_room', civic:'cy_hall', general:'cy_cell_store', food:'cy_granary', warehouse:'cy_granary',
 services:{religious:2, civic:2, general:1, food:2, warehouse:2},
 houses:{poor:[['cy_house_poor',1,3]], middling:[['cy_house_mid',1,2]], head:[['cy_house_head',1,1]], middlingShare:.3},
 works:{
  farming:[{key:'cy_threshing',jobs:10,share:.5},{key:'cy_granary',jobs:4,share:.2},{key:'cy_mill',jobs:6,share:.3}],
  ranch:[{key:'cy_pen',jobs:4,share:.6},{key:'cy_granary',jobs:2,share:.4}]
 },
 focusJobs:{farming:40, ranch:20}, reach:{farming:120, ranch:120},
 pending:{},
 platform:{room:'cy_cell', store:'cy_cell_store', kiva:'cy_shrine_room', greatKiva:'cy_hall', court:'cy_court', pen:'cy_pen',
  ladder:'cy_ladder', roomsPer:2, storeys:2, kivas:'plaza'}
};
/* the rows by tribe (Peak, Tiers and the herders' camp row come in C3 to C5) */
const CY_ROWS={valley:CY_ROW_VALLEY};
