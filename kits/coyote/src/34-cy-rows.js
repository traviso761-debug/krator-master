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
/* The Peak tribe (Kam-Hau, the miners and gem tappers): dry-stone rooms in the fog wall's alcoves (Mesa Verde's shape: the owner,
   2026-11-16), the platform village's alcove mode; its kivas the round room (both in the alcove's yard); the mine works at the foot
   or on the node a host passes (spec.resource: the emerald and turquoise nodes are owed by kits/resources). Its lone houses
   (KHAMLET.village, a hamlet on open ground) are the stone hut and the stone house. */
const CY_ROW_PEAK={
 kit:'coyote', household:5, workShare:.5, slopeMax:.45,
 religious:'cy_runner_shrine', civic:'cy_round_room', general:'cy_sorting_shed', food:'cy_stone_store', warehouse:'cy_stone_store',
 services:{religious:1, civic:2, general:3, food:2, warehouse:2},
 houses:{poor:[['cy_stone_hut',1,3]], middling:[['cy_stone_house',1,2]], head:[['cy_stone_house',1,1]], middlingShare:.3},
 works:{
  mine:[{key:'cy_adit',jobs:12,share:.4},{key:'cy_ore_bench',jobs:10,share:.3},{key:'cy_sorting_shed',jobs:5,share:.15},{key:'cy_wash',jobs:4,share:.15}],
  quarry:[{key:'cy_ore_bench',jobs:8,share:.7},{key:'cy_sorting_shed',jobs:3,share:.3}],
  ranch:[{key:'cy_fold',jobs:4,share:1}]
 },
 focusJobs:{mine:30, quarry:16, ranch:10}, reach:{mine:150, quarry:150, ranch:120},
 pending:{},
 platform:{room:'cy_cliff_house', store:'cy_cliff_house', kiva:'cy_round_room', greatKiva:'cy_round_room', court:'cy_court', pen:'cy_fold',
  ladder:'cy_ladder', roomsPer:2, storeys:3, kivas:'plaza'}
};
/* the rows by tribe (the Tiers' and the herders' camp row come in C4 and C5) */
const CY_ROWS={valley:CY_ROW_VALLEY, peak:CY_ROW_PEAK};
