/* ==================== core/hamlet 22: the Coyote Men's rows (plain data, [G data]) ==================== */
/* kits/coyote/PLAN.md section 6; the shape is 20-hamlet-cultures.js's, with 32-hamlet-platform.js's `platform`,
   34-hamlet-trade.js's `trade` and 36-hamlet-terrace.js's `terrace`. Three rows for the settled tribes of the Coyote Men
   (kits/coyote; the nomad Sunrise and Sunset bands are core/camp/11-camp-coyote.js), all with `kit: 'coyote'`:
     coyote        the Valley (Ham-Hau): Catalhoyuk's roof-entered mud-brick rooms packed on a tell (`platform`), or lone
                   houses (`village`) and the Great Chasm's border post (`tradePost`); farming, goat ranching and salt
     coyote_peak   the Peak (Kam-Hau): dry-stone cliff rooms in the fog wall's alcoves (`platform` alcove mode) and stone
                   huts on open benches (`village`), working the emerald, turquoise and copper nodes (`mine`, `quarry`, `ranch`)
     coyote_tier   the Tierhounds (Lok-Hau, the Kingdom of the Tiers): stepped streets down the canyon walls (`terrace`,
                   Masuleh's rule: each row's roofs the lane above), lake towns (`fishing`), and Howl's caravanserai (`trade`)
   This file is its own fragment so that pages listing 20 or 21 do not move; a host that wants Coyote settlements lists it
   after 20. Every key is a real def in kits/coyote; `pending` carries those same declared footprints (and the sunk rooms'
   and ladder's layout boxes) so a host that has not loaded KratorCoyote yet still lays the footprints out without throwing
   and marks them `pending`, while a host that passes kits/coyote's `dims` gets `pending: false` on every `cy_*` record. */
KHAMLET.CULTURES = KHAMLET.CULTURES || {};
(function () {
  'use strict';
  var BOX = {
    cy_house_poor: {w: 8.4, d: 6.9, h: 3.95, what: 'a Valley poor house (main room and ear-door store)'},
    cy_house_mid: {w: 10.9, d: 6.9, h: 3.95, what: 'a Valley middling house (two stores and roof oven)'},
    cy_house_head: {w: 12.1, d: 6.9, h: 3.95, what: 'the Valley headman\'s house (painted room and loom room)'},
    cy_cell: {w: 5.4, d: 5.4, h: 2.99, what: 'a Valley roomblock cell'},
    cy_cell_store: {w: 5.4, d: 5.4, h: 2.99, what: 'a Valley store cell'},
    cy_shrine_room: {w: 5, d: 5, h: 3.2, what: 'a sunk Valley shrine room'},
    cy_hall: {w: 5, d: 5, h: 3.4, what: 'a sunk Valley council room'},
    cy_runner_shrine: {w: 4.6, d: 4.6, h: 2.6, what: 'a road-runner shrine'},
    cy_granary: {w: 6, d: 4.5, h: 3.4, what: 'three beehive silos under a reed shade'},
    cy_threshing: {w: 12, d: 12, h: 1.6, what: 'a kerbed threshing floor'},
    cy_mill: {w: 6, d: 4.2, h: 3, what: 'saddle querns under a lean-to'},
    cy_press: {w: 7, d: 4, h: 2.6, what: 'a beam oil press'},
    cy_pen: {w: 14, d: 10, h: 2.6, what: 'a mud-walled goat pen'},
    cy_court: {w: 20, d: 14, h: 3.4, what: 'a walled court with an ear-door gate'},
    cy_ladder: {w: 0.7, d: 0.4, h: 4, what: 'a notched juniper roof ladder'},
    cy_stone_hut: {w: 4.7, d: 4.3, h: 2.9, what: 'a Peak dry-stone hut'},
    cy_stone_house: {w: 6.2, d: 7, h: 3, what: 'a Peak dry-stone house'},
    cy_stone_store: {w: 3.4, d: 3.4, h: 2.6, what: 'a Peak dry-stone store'},
    cy_cliff_house: {w: 4.6, d: 4.6, h: 2.7, what: 'an alcove cliff-house room'},
    cy_round_room: {w: 5.2, d: 5.2, h: 2.36, what: 'a sunk Peak round council room'},
    cy_fold: {w: 10, d: 8, h: 1.8, what: 'a dry-stone goat fold'},
    cy_adit: {w: 8, d: 6, h: 6, what: 'a timbered mine adit'},
    cy_ore_bench: {w: 12, d: 10, h: 4.2, what: 'an ore-crushing bench'},
    cy_sorting_shed: {w: 6, d: 4, h: 2.8, what: 'a gem and ore sorting shed'},
    cy_wash: {w: 7, d: 3, h: 1.4, what: 'a stepped washing trough'},
    cy_ledge_poor: {w: 5, d: 6, h: 3.2, what: 'a Tierhound poor ledge house (one storey)'},
    cy_ledge_mid: {w: 7, d: 6, h: 3.2, what: 'a Tierhound middling ledge house (one storey)'},
    cy_ledge_rich: {w: 9, d: 6, h: 3.2, what: 'a Tierhound rich ledge house (one storey)'},
    cy_stair_lane: {w: 2.4, d: 6, h: 3.2, what: 'a cut stone stair flight between two terrace lanes'},
    cy_terrace_wall: {w: 4, d: 6, h: 3.4, what: 'a battered ashlar terrace riser'},
    cy_council: {w: 10, d: 14, h: 4.9, what: 'a Tierhound council megaron'},
    cy_lake_house: {w: 9, d: 10, h: 6.8, what: 'a stilted lake house with boat slip'},
    cy_fish_weir: {w: 14, d: 8, h: 1.6, what: 'a V-shaped stake and basket fish weir'},
    cy_stage_house: {w: 24, d: 22, h: 6.8, what: 'a walled caravanserai court (Howl\'s stage house)'},
    cy_larder: {w: 10, d: 6, h: 4.2, what: 'a vaulted stone caravan larder'}
  };
  var pick = function (keys) {
    var out = {};
    keys.forEach(function (k) { out[k] = BOX[k]; });
    return out;
  };

  KHAMLET.CULTURES.coyote = {
    kit: 'coyote', household: 5, workShare: 0.45, slopeMax: 0.3,
    religious: 'cy_runner_shrine', civic: 'cy_hall', general: 'cy_cell_store', food: 'cy_granary', warehouse: 'cy_granary',
    services: {religious: 2, civic: 2, general: 1, food: 2, warehouse: 2},
    houses: {poor: [['cy_house_poor', 1, 3]], middling: [['cy_house_mid', 1, 2]], head: [['cy_house_head', 1, 1]], middlingShare: 0.3},
    works: {
      farming: [{key: 'cy_threshing', jobs: 10, share: 0.5}, {key: 'cy_granary', jobs: 4, share: 0.2}, {key: 'cy_mill', jobs: 6, share: 0.3}],
      ranch: [{key: 'cy_pen', jobs: 4, share: 0.6}, {key: 'cy_granary', jobs: 2, share: 0.4}],
      salt: [{key: 'cy_wash', jobs: 6, share: 0.6}, {key: 'cy_granary', jobs: 4, share: 0.4}]
    },
    focusJobs: {farming: 40, ranch: 20, salt: 20},
    reach: {farming: 120, ranch: 120, salt: 150},
    pending: pick(['cy_runner_shrine', 'cy_hall', 'cy_cell_store', 'cy_granary', 'cy_house_poor', 'cy_house_mid', 'cy_house_head',
      'cy_threshing', 'cy_mill', 'cy_pen', 'cy_wash', 'cy_cell', 'cy_shrine_room', 'cy_court', 'cy_ladder', 'cy_stage_house']),
    platform: {room: 'cy_cell', store: 'cy_cell_store', kiva: 'cy_shrine_room', greatKiva: 'cy_hall', court: 'cy_court', pen: 'cy_pen',
      ladder: 'cy_ladder', roomsPer: 2, storeys: 2, kivas: 'plaza'},
    trade: {serai: 'cy_stage_house', store: 'cy_granary'}
  };

  KHAMLET.CULTURES.coyote_peak = {
    kit: 'coyote', household: 5, workShare: 0.5, slopeMax: 0.45,
    religious: 'cy_runner_shrine', civic: 'cy_round_room', general: 'cy_sorting_shed', food: 'cy_stone_store', warehouse: 'cy_stone_store',
    services: {religious: 1, civic: 2, general: 3, food: 2, warehouse: 2},
    houses: {poor: [['cy_stone_hut', 1, 3]], middling: [['cy_stone_house', 1, 2]], head: [['cy_stone_house', 1, 1]], middlingShare: 0.3},
    works: {
      mine: [{key: 'cy_adit', jobs: 12, share: 0.4}, {key: 'cy_ore_bench', jobs: 10, share: 0.3}, {key: 'cy_sorting_shed', jobs: 5, share: 0.15}, {key: 'cy_wash', jobs: 4, share: 0.15}],
      quarry: [{key: 'cy_ore_bench', jobs: 8, share: 0.7}, {key: 'cy_sorting_shed', jobs: 3, share: 0.3}],
      ranch: [{key: 'cy_fold', jobs: 4, share: 1}]
    },
    focusJobs: {mine: 30, quarry: 16, ranch: 10},
    reach: {mine: 150, quarry: 150, ranch: 120},
    pending: pick(['cy_runner_shrine', 'cy_round_room', 'cy_sorting_shed', 'cy_stone_store', 'cy_stone_hut', 'cy_stone_house',
      'cy_adit', 'cy_ore_bench', 'cy_wash', 'cy_fold', 'cy_cliff_house', 'cy_court', 'cy_ladder']),
    platform: {room: 'cy_cliff_house', store: 'cy_cliff_house', kiva: 'cy_round_room', greatKiva: 'cy_round_room', court: 'cy_court', pen: 'cy_fold',
      ladder: 'cy_ladder', roomsPer: 2, storeys: 3, kivas: 'plaza'}
  };

  KHAMLET.CULTURES.coyote_tier = {
    kit: 'coyote', household: 5, workShare: 0.45, slopeMax: 0.8,
    religious: 'cy_runner_shrine', civic: 'cy_council', general: 'cy_larder', food: 'cy_larder', warehouse: 'cy_larder',
    services: {religious: 1, civic: 2, general: 1, food: 2, warehouse: 2},
    houses: {poor: [['cy_ledge_poor', 1, 3]], middling: [['cy_ledge_mid', 1, 2]], head: [['cy_ledge_rich', 1, 1]], middlingShare: 0.35},
    works: {
      farming: [{key: 'cy_threshing', jobs: 10, share: 0.4}, {key: 'cy_granary', jobs: 4, share: 0.3}, {key: 'cy_press', jobs: 6, share: 0.3}],
      fishing: [{key: 'cy_fish_weir', jobs: 6, share: 0.6}, {key: 'cy_lake_house', jobs: 4, share: 0.4}]
    },
    focusJobs: {farming: 36, fishing: 24},
    reach: {farming: 150, fishing: 150},
    pending: pick(['cy_runner_shrine', 'cy_council', 'cy_larder', 'cy_ledge_poor', 'cy_ledge_mid', 'cy_ledge_rich',
      'cy_threshing', 'cy_granary', 'cy_press', 'cy_fish_weir', 'cy_lake_house', 'cy_stair_lane', 'cy_terrace_wall', 'cy_stage_house']),
    terrace: {step: 3.2, depth: 6, stairW: 2.4, landing: 1.6, every: 20, street: 4, stair: 'cy_stair_lane', wall: 'cy_terrace_wall'},
    trade: {serai: 'cy_stage_house', store: 'cy_larder'}
  };
})();
