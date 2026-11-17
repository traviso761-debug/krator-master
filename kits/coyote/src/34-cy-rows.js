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
   or on the nearest emerald or turquoise node (kits/resources, KHAMLET.resourceFor), or the node a host passes. Its lone houses
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
/* The herders' camp row for core/camp (Sunrise and Sunset, Tong-Hau and Si-Hau; PLAN.md section 6), in KCAMP.CULTURES' shape
   (core/camp/10-camp-cultures.js). A program key is a def's key with its role after '@' (cy_tipi_l@chief): kind() reads the role,
   the def draws it (58-cy-herders.js). DRAFT: registered into KCAMP.CULTURES by this fragment where the page has core/camp, until
   C7 moves it to core/camp as its own fragment. */
const CY_CAMP_HERDER={
 kind:function(k){const q=String(k).split('@'),key=q[0],role=q[1];
  if(role==='chief')return 'chief';if(role==='council')return 'council';if(role==='shrine')return 'shrine';
  if(/^cy_tipi_[ml]$/.test(key))return 'dwelling';if(key==='cy_tipi_s')return 'sleep';
  if(key==='cy_feather_rack'||key==='cy_saddle_rack')return 'trade';
  if(key==='cy_ostrich_pen'||key==='cy_fold'||key==='cy_egg_cache')return 'pen';return null;},
 households:{'cy_tipi_l@chief':1,cy_tipi_m:1,cy_tipi_l:2},
 household:[5,8],chiefHousehold:[6,9],sleepers:[3,4],
 work:{'cy_tipi_s@shrine':{role:'priest',n:1},cy_feather_rack:{role:'featherworker',n:2},cy_saddle_rack:{role:'saddler',n:1},
  cy_ostrich_pen:{role:'herder',n:2},cy_fold:{role:'herder',n:1}},
 elderShare:.4, mountsPer:1, wind:[0.7071,0.7071], formation:'horseshoe'
};
if(typeof KCAMP!=='undefined'){KCAMP.CULTURES=KCAMP.CULTURES||{};KCAMP.CULTURES['coyote-herder']=CY_CAMP_HERDER;}
/* The Tierhounds (Lok-Hau, the Kingdom of the Tiers): terrace villages down the canyon walls on core/hamlet's terraced layout
   (36-hamlet-terrace.js, Masuleh's rule: the owner, 2026-11-16), lake towns. A row's piece is one storey (3.2 m to its roof's
   top), a band 6 m deep: the ledge houses; the rest (the council megaron, the runner shrine at the road's foot, the larder, the
   works) stands below the foot street. The gaps are terrace gardens; stair lanes every 20 m. The Howl's trade post takes the
   stage house as its serai and the larder as its store (34-hamlet-trade.js). */
const CY_ROW_TIER={
 kit:'coyote', household:5, workShare:.45, slopeMax:.8,
 religious:'cy_runner_shrine', civic:'cy_council', general:'cy_larder', food:'cy_larder', warehouse:'cy_larder',
 services:{religious:1, civic:2, general:1, food:2, warehouse:2},
 houses:{poor:[['cy_ledge_poor',1,3]], middling:[['cy_ledge_mid',1,2]], head:[['cy_ledge_rich',1,1]], middlingShare:.35},
 works:{
  farming:[{key:'cy_threshing',jobs:10,share:.4},{key:'cy_granary',jobs:4,share:.3},{key:'cy_press',jobs:6,share:.3}],
  fishing:[{key:'cy_fish_weir',jobs:6,share:.6},{key:'cy_lake_house',jobs:4,share:.4}]
 },
 focusJobs:{farming:36, fishing:24}, reach:{farming:150, fishing:150},
 pending:{},
 terrace:{step:3.2, depth:6, stairW:2.4, landing:1.6, every:20, street:4, stair:'cy_stair_lane', wall:'cy_terrace_wall'},
 trade:{serai:'cy_stage_house', store:'cy_larder'}
};
/* the rows by tribe */
const CY_ROWS={valley:CY_ROW_VALLEY, peak:CY_ROW_PEAK, tier:CY_ROW_TIER};
