// ================================================================= DRUM — 31: Kit Catalogs & Census Data ([G data])
// Exact dimensions (w x d x h), depth classes (S=10m, M=12m, L=18m, XL=22-24m), resident capacities, valid core/tags
// metadata, Voth 46-trade census mappings, and ruined vehicle palisade palette. Zero THREE, zero DOM.
(function (root) {
  'use strict';

  var DRUM = root.DRUM || (root.DRUM = {});

  function def(kit, key, cls, w, d, h, st, pop, culture, style, types, wealth, job, trades) {
    return {
      kit: kit,
      key: key,
      cls: cls,
      w: w,
      d: d,
      h: h,
      st: st,
      pop: pop,
      culture: culture,
      style: style,
      types: types,
      wealth: wealth,
      job: job,
      trades: trades || []
    };
  }

  // 1. SW Arcology Vassal Kit (kits/sw-arcology/PLAN.md): 28 silo, storage-tank, Horton-sphere & drum definitions
  var SWA = [
    /* Class S (d = 10 m) */
    def('sw-arcology', 'swa-drum-hut', 'S', 10, 10, 7, 1, 6, 'post-apoc', 'sw-arcology', ['dwelling-single'], 'poor', null, []),
    def('sw-arcology', 'swa-silo-cot', 'S', 10, 10, 9, 2, 8, 'post-apoc', 'sw-arcology', ['dwelling-single'], 'poor', null, []),
    def('sw-arcology', 'swa-tank-shack', 'S', 12, 10, 7, 1, 6, 'post-apoc', 'sw-arcology', ['dwelling-single'], 'poor', null, []),
    def('sw-arcology', 'swa-hopper-stall', 'S', 10, 10, 8, 1, 2, 'post-apoc', 'sw-arcology', ['shop', 'market'], 'poor', 'trading', ['market traders', 'shopkeepers and assistants']),
    def('sw-arcology', 'swa-drum-tinker', 'S', 12, 10, 7, 1, 3, 'post-apoc', 'sw-arcology', ['shop', 'industry'], 'poor', 'pottery', ['smiths and craftsmen']),
    def('sw-arcology', 'swa-pipe-shrine', 'S', 8, 10, 9, 1, 1, 'post-apoc', 'sw-arcology', ['religious'], null, 'worship', ['shrine keepers']),
    def('sw-arcology', 'swa-valve-well', 'S', 8, 10, 6, 1, 0, 'post-apoc', 'sw-arcology', ['infrastructure'], null, null, []),

    /* Class M (d = 12 m) */
    def('sw-arcology', 'swa-twindrum-house', 'M', 14, 12, 9, 2, 12, 'post-apoc', 'sw-arcology', ['dwelling-multi'], 'middle', null, []),
    def('sw-arcology', 'swa-tank-duplex', 'M', 16, 12, 10, 2, 14, 'post-apoc', 'sw-arcology', ['dwelling-multi'], 'middle', null, []),
    def('sw-arcology', 'swa-silo-stack', 'M', 12, 12, 14, 3, 18, 'post-apoc', 'sw-arcology', ['dwelling-multi'], 'middle', null, []),
    def('sw-arcology', 'swa-drum-smithy', 'M', 14, 12, 9, 2, 4, 'post-apoc', 'sw-arcology', ['industry', 'shop'], 'middle', 'smithing', ['smiths and craftsmen', 'industrial workers']),
    def('sw-arcology', 'swa-still-vat', 'M', 14, 12, 10, 2, 4, 'post-apoc', 'sw-arcology', ['industry'], 'middle', 'brewing', ['brewers', 'weavers and dyers']),
    def('sw-arcology', 'swa-drum-butcher', 'M', 12, 12, 8, 1, 3, 'post-apoc', 'sw-arcology', ['shop', 'industry'], 'middle', 'butchery', ['butchers', 'tanners']),
    def('sw-arcology', 'swa-tank-bakery', 'M', 14, 12, 8, 1, 4, 'post-apoc', 'sw-arcology', ['shop'], 'middle', 'baking', ['bakers']),
    def('sw-arcology', 'swa-drum-tavern', 'M', 16, 12, 10, 2, 8, 'post-apoc', 'sw-arcology', ['tavern', 'inn'], 'middle', 'brewing', ['innkeepers and servers', 'innkeepers and grooms']),
    def('sw-arcology', 'swa-cutter-yard', 'M', 16, 12, 9, 1, 4, 'post-apoc', 'sw-arcology', ['industry'], 'middle', 'quarrying', ['quarrymen and masons', 'miners', 'industrial workers']),
    def('sw-arcology', 'swa-weaver-drums', 'M', 14, 12, 9, 2, 5, 'post-apoc', 'sw-arcology', ['industry', 'shop'], 'middle', 'weaving', ['weavers and dyers']),
    def('sw-arcology', 'swa-apothecary-pod', 'M', 12, 12, 9, 2, 4, 'post-apoc', 'sw-arcology', ['shop', 'civic'], 'middle', 'healing', ['healers and nurses', 'teachers and scholars']),

    /* Class L (d = 18 m) */
    def('sw-arcology', 'swa-trisilo-tenement', 'L', 20, 18, 16, 4, 36, 'post-apoc', 'sw-arcology', ['dwelling-multi'], 'middle', null, []),
    def('sw-arcology', 'swa-sphere-manor', 'L', 20, 18, 15, 3, 22, 'post-apoc', 'sw-arcology', ['dwelling-single'], 'rich', null, ['household service']),
    def('sw-arcology', 'swa-clarifier-court', 'L', 24, 18, 12, 3, 34, 'post-apoc', 'sw-arcology', ['dwelling-multi'], 'middle', null, []),
    def('sw-arcology', 'swa-tank-barracks', 'L', 26, 18, 11, 2, 40, 'post-apoc', 'sw-arcology', ['military'], 'middle', null, ['soldiers', 'town guard']),
    def('sw-arcology', 'swa-silo-granary', 'L', 24, 18, 16, 3, 4, 'post-apoc', 'sw-arcology', ['industry', 'infrastructure'], 'middle', 'milling', ['granary keepers and millers']),
    def('sw-arcology', 'swa-drum-warehouse', 'L', 26, 18, 11, 2, 4, 'post-apoc', 'sw-arcology', ['industry'], 'middle', 'warehousing', ['porters and warehousemen', 'dockers and stevedores']),
    def('sw-arcology', 'swa-bath-boilers', 'L', 22, 18, 11, 2, 4, 'post-apoc', 'sw-arcology', ['civic'], 'middle', 'healing', ['healers and nurses', 'power-house stokers and engineers']),
    def('sw-arcology', 'swa-beetle-kraal', 'L', 26, 18, 9, 1, 6, 'post-apoc', 'sw-arcology', ['farm'], 'poor', 'herding', ['beetle herders', 'elephant bug handlers and station hands', 'dairymen']),

    /* Class XL (d = 22-24 m) */
    def('sw-arcology', 'swa-salvage-foundry', 'XL', 30, 22, 14, 2, 8, 'post-apoc', 'sw-arcology', ['industry'], 'middle', 'smithing', ['industrial workers', 'power-house stokers and engineers', 'smiths and craftsmen']),
    def('sw-arcology', 'swa-bourse-rotunda', 'XL', 28, 24, 13, 2, 6, 'post-apoc', 'sw-arcology', ['market', 'civic'], 'rich', 'trading', ['market traders', 'guild officers and clerks', 'customs officers and clerks'])
  ];

  // 2. Scrap Voth Set (settlements/voth/catalog/registry/voth-scrap.js: 11 merged + 8 census/tenement additions = 19)
  var VOTH_SCRAP = [
    /* Class S (d <= 10 m) */
    def('voth-scrap', 'voth_scrap_house_poor', 'S', 11, 8, 6, 1, 6, 'voth', 'scrap-voth', ['dwelling-single'], 'poor', null, []),
    def('voth-scrap', 'voth_scrap_shop', 'S', 9, 10, 7, 1, 3, 'voth', 'scrap-voth', ['shop'], 'middle', 'trading', ['shopkeepers and assistants']),
    def('voth-scrap', 'voth_scrap_tomb', 'S', 6, 10, 7, 1, 1, 'voth', 'scrap-voth', ['funerary', 'religious'], null, 'worship', ['priests and undertakers']),
    def('voth-scrap', 'voth_scrap_watch', 'S', 12, 8, 11, 2, 4, 'voth', 'scrap-voth', ['military'], null, null, ['town guard', 'lighthouse keepers']),

    /* Class M (d = 11-12 m) */
    def('voth-scrap', 'voth_scrap_house', 'M', 12, 12, 9, 2, 12, 'voth', 'scrap-voth', ['dwelling-single'], 'middle', null, []),
    def('voth-scrap', 'voth_scrap_tavern', 'M', 12, 12, 9, 2, 8, 'voth', 'scrap-voth', ['tavern', 'inn'], 'middle', 'brewing', ['innkeepers and servers']),
    def('voth-scrap', 'voth_scrap_warehouse', 'M', 21, 11, 9, 2, 4, 'voth', 'scrap-voth', ['industry'], 'middle', 'warehousing', ['porters and warehousemen']),
    def('voth-scrap', 'voth_scrap_shrine', 'M', 10, 11, 10, 1, 3, 'voth', 'scrap-voth', ['religious'], 'middle', 'worship', ['temple priests and servants', 'shrine keepers', 'monks and lay brothers']),
    def('voth-scrap', 'voth_scrap_smithy', 'M', 14, 12, 9, 2, 4, 'voth', 'scrap-voth', ['industry', 'shop'], 'middle', 'smithing', ['smiths and craftsmen']),
    def('voth-scrap', 'voth_scrap_bakery', 'M', 14, 12, 8, 1, 4, 'voth', 'scrap-voth', ['shop'], 'middle', 'baking', ['bakers', 'butchers']),
    def('voth-scrap', 'voth_scrap_brewery', 'M', 16, 12, 10, 2, 4, 'voth', 'scrap-voth', ['industry'], 'middle', 'brewing', ['brewers', 'weavers and dyers']),
    def('voth-scrap', 'voth_scrap_workshop', 'M', 14, 12, 9, 2, 5, 'voth', 'scrap-voth', ['industry', 'shop'], 'middle', 'carpentry', ['smiths and craftsmen', 'teachers and scholars', 'guild officers and clerks']),

    /* Class L (d = 16-18 m) */
    def('voth-scrap', 'voth_scrap_manor', 'L', 16, 17, 12, 2, 20, 'voth', 'scrap-voth', ['dwelling-single'], 'rich', null, ['household service', 'envoys and embassy staff']),
    def('voth-scrap', 'voth_scrap_tenement', 'L', 18, 18, 14, 3, 32, 'voth', 'scrap-voth', ['dwelling-multi'], 'middle', null, []),
    def('voth-scrap', 'voth_scrap_bathhouse', 'L', 20, 18, 11, 2, 4, 'voth', 'scrap-voth', ['civic'], 'middle', 'healing', ['healers and nurses']),
    def('voth-scrap', 'voth_scrap_granary', 'L', 22, 18, 13, 3, 4, 'voth', 'scrap-voth', ['industry'], 'middle', 'milling', ['granary keepers and millers', 'customs officers and clerks']),
    def('voth-scrap', 'voth_scrap_barracks', 'L', 24, 18, 11, 2, 36, 'voth', 'scrap-voth', ['military'], 'middle', null, ['soldiers', 'palace and canton staffs']),

    /* Class XL */
    def('voth-scrap', 'voth_scrap_market', 'XL', 27, 24, 9, 1, 4, 'voth', 'scrap-voth', ['market'], 'middle', 'trading', ['market traders', 'shopkeepers and assistants']),
    def('voth-scrap', 'voth_scrap_arena', 'XL', 22, 22, 10, 1, 2, 'voth', 'scrap-voth', ['civic'], 'middle', null, ['town guard'])
  ];

  // 3. Regular Post-Apoc Kit (kits/post-apoc): concentrated in outer shanties, kraals, river bank & salvage alleys
  var POST_APOC = [
    /* Class S (d = 8-11 m, fits 10m shanty slot) */
    def('post-apoc', 'dw-box', 'S', 14, 8, 6, 1, 7, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-silo', 'S', 11, 10, 8, 2, 8, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-tire', 'S', 11, 10, 6, 1, 6, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-bus', 'S', 14, 9, 6, 1, 8, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-tank', 'S', 11, 9, 7, 1, 7, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-bottle', 'S', 12, 10, 6, 1, 6, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'dw-stilt', 'S', 9, 10, 8, 2, 7, 'post-apoc', 'post-apoc', ['dwelling-single'], 'poor', null, []),
    def('post-apoc', 'shop-parts', 'S', 14, 9, 6, 1, 3, 'post-apoc', 'post-apoc', ['shop'], 'poor', 'trading', ['shopkeepers and assistants', 'market traders']),
    def('post-apoc', 'shop-food', 'S', 14, 9, 6, 1, 3, 'post-apoc', 'post-apoc', ['shop'], 'poor', 'baking', ['bakers', 'butchers', 'fishers']),

    /* Class M (d = 12-14 m -> fits 12m mid-ring slot cleanly with 12m trim) */
    def('post-apoc', 'smithy', 'M', 14, 12, 8, 1, 4, 'post-apoc', 'post-apoc', ['industry'], 'poor', 'smithing', ['smiths and craftsmen']),
    def('post-apoc', 'gen-fuel', 'M', 14, 12, 9, 1, 3, 'post-apoc', 'post-apoc', ['infrastructure', 'industry'], 'poor', null, ['power-house stokers and engineers']),
    def('post-apoc', 'gen-wind', 'M', 12, 12, 14, 2, 2, 'post-apoc', 'post-apoc', ['infrastructure'], 'poor', 'milling', ['granary keepers and millers']),
    def('post-apoc', 'shaman', 'M', 12, 12, 8, 1, 3, 'post-apoc', 'post-apoc', ['religious'], 'poor', 'healing', ['healers and nurses', 'shrine keepers']),
    def('post-apoc', 'farmhouse', 'M', 18, 12, 8, 2, 12, 'post-apoc', 'post-apoc', ['farm', 'dwelling-single'], 'poor', 'farming', ['farmhands and ploughmen', 'swineherds and duck keepers', 'orchardmen', 'chinampa growers']),
    def('post-apoc', 'mess', 'M', 20, 12, 8, 1, 10, 'post-apoc', 'post-apoc', ['tavern'], 'poor', 'baking', ['innkeepers and servers']),

    /* Class L (d = 18 m) */
    def('post-apoc', 'lg-stack', 'L', 22, 18, 13, 3, 28, 'post-apoc', 'post-apoc', ['dwelling-multi'], 'poor', null, []),
    def('post-apoc', 'lg-twinsilo', 'L', 26, 18, 14, 3, 30, 'post-apoc', 'post-apoc', ['dwelling-multi'], 'middle', null, []),
    def('post-apoc', 'warehouse', 'L', 24, 18, 10, 2, 4, 'post-apoc', 'post-apoc', ['industry'], 'poor', 'warehousing', ['porters and warehousemen', 'river bargemen and quay hands', 'ferrymen', 'shipwrights and boatbuilders', 'coast guard']),
    def('post-apoc', 'granary', 'L', 24, 18, 12, 2, 4, 'post-apoc', 'post-apoc', ['industry'], 'poor', 'milling', ['granary keepers and millers']),
    def('post-apoc', 'cages', 'L', 24, 18, 9, 1, 6, 'post-apoc', 'post-apoc', ['farm'], 'poor', 'herding', ['beetle herders', 'swineherds and duck keepers'])
  ];

  // 4. Ruined Ancient's Valley Vehicles (kits/motor-vehicles) embedded in the Outer Palisade
  var PALISADE_VEHICLES = [
    { key: 'bus_transit', len: 12.2, wid: 2.6, h: 3.2, states: ['wreck', 'burnt', 'weathered'], weight: 3 },
    { key: 'truck_semi', len: 14.0, wid: 2.6, h: 3.6, states: ['wreck', 'weathered'], weight: 3 },
    { key: 'truck_dump', len: 8.8, wid: 2.6, h: 3.3, states: ['wreck', 'burnt'], weight: 2 },
    { key: 'truck_cargo', len: 8.2, wid: 2.5, h: 3.1, states: ['wreck', 'weathered'], weight: 3 },
    { key: 'van_step', len: 6.4, wid: 2.3, h: 2.8, states: ['wreck', 'burnt', 'weathered'], weight: 2 },
    { key: 'van_panel', len: 5.4, wid: 2.1, h: 2.3, states: ['wreck', 'burnt'], weight: 2 },
    { key: 'apc_wheeled', len: 7.6, wid: 2.7, h: 2.9, states: ['wreck', 'burnt'], weight: 1 },
    { key: 'car_sedan', len: 4.7, wid: 1.9, h: 1.5, states: ['wreck', 'burnt', 'weathered'], weight: 4 }
  ];

  // All 46 Voth census trade names (matched 1:1 against tools/trades_census.json)
  var VOTH_CENSUS_TRADES = [
    'bakers', 'butchers', 'weavers and dyers', 'brewers', 'tanners',
    'shipwrights and boatbuilders', 'innkeepers and grooms', 'town guard', 'coast guard',
    'temple priests and servants', 'shrine keepers', 'shopkeepers and assistants',
    'smiths and craftsmen', 'innkeepers and servers', 'porters and warehousemen',
    'industrial workers', 'power-house stokers and engineers', 'household service',
    'soldiers', 'teachers and scholars', 'guild officers and clerks',
    'customs officers and clerks', 'healers and nurses', 'priests and undertakers',
    'lighthouse keepers', 'dockers and stevedores', 'river bargemen and quay hands',
    'fishers', 'market traders', 'farmhands and ploughmen', 'chinampa growers',
    'orchardmen', 'miners', 'quarrymen and masons', 'granary keepers and millers',
    'beetle herders', 'dairymen', 'swineherds and duck keepers', 'mushroom growers',
    'envoys and embassy staff', 'ferrymen', 'elephant bug handlers and station hands',
    'monks and lay brothers', 'palace and canton staffs'
  ];

  var BY_KEY = {};
  var ALL = SWA.concat(VOTH_SCRAP, POST_APOC);
  for (var i = 0; i < ALL.length; i++) BY_KEY[ALL[i].key] = ALL[i];

  DRUM.KITS = {
    swa: SWA,
    vothScrap: VOTH_SCRAP,
    postApoc: POST_APOC,
    all: ALL,
    byKey: BY_KEY,
    palisadeVehicles: PALISADE_VEHICLES,
    vothCensusTrades: VOTH_CENSUS_TRADES
  };
})(typeof window !== 'undefined' ? window : globalThis);
