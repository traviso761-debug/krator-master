/* ==================== core/hamlet ext 21: the Yuni culture row (plain data, [G data]; opt-in) ==================== */
/* The Yuni's villages (LORE.md 6.11; the Loom-Chasms' Weavers' Cradle, whose farmers are Yuni colonists: the owner, 2026-11-11; the
   Great Chasm's trade post wants the same row). Keys are the Yuni kit's ASSET keys (kits/yuni/src/56-59: its w, d and h are the boxes
   below). The Yuni kit draws through the Yuni engine, which only the Yuni-lineage worlds carry (MODULARITY-PLAN.md step 4b), so on any
   other page every key is a declared box here (`pending`: the generator places its footprint and the host draws a stand-in); a page
   that can read the kit answers dims(key) and the stand-ins give way. Opt-in (an ext/ fragment): the pages that pool core/hamlet's
   own fragments (the isle demo) do not change. Listed after 20-hamlet-cultures.js. node core/hamlet/ext/test-hamlet-yuni.js */
KHAMLET.CULTURES.yuni = {
  kit: 'yuni', household: 6, workShare: 0.45, slopeMax: 0.2,
  religious: 'civic_chapter_house_small', civic: 'civic_bell_tower', general: 'trade_shop_house', food: 'trade_tavern', warehouse: 'prop_granary_store',
  services: {religious: 2, civic: 3, general: 3, food: 4, warehouse: 3},
  houses: {
    poor: [['poor_musgum', 1, 3], ['poor_mud_house', 1, 3], ['poor_compound', 3, 1]],
    middling: [['mid_courtyard_house', 2, 2], ['mid_washed_house', 1, 2], ['mid_djenne_house', 2, 1]],
    head: [['rich_tower_house', 1, 1]],
    middlingShare: 0.35
  },
  works: {
    farming: [{key: 'poor_compound', jobs: 8, share: 0.7}, {key: 'prop_granary_store', jobs: 5, share: 0.15}, {key: 'prop_hangar', jobs: 3, share: 0.1},
              {key: 'prop_well', jobs: 2, share: 0.05}],
    ranch: [{key: 'poor_compound', jobs: 6, share: 0.5}, {key: 'prop_animal_pen', jobs: 3, share: 0.35}, {key: 'prop_well', jobs: 2, share: 0.15}]
  },
  focusJobs: {farming: 90, ranch: 40},
  reach: {farming: 450, ranch: 520},
  /* every key a box (kits/yuni's ASSET w, d, h; the two the kit has no building for are named for what they are) */
  pending: {
    'poor_musgum': {w: 12, d: 11, h: 9, what: 'a Musgum shell house (kits/yuni 57)'},
    'poor_mud_house': {w: 11, d: 9, h: 5, what: 'a flat-roofed mud house (kits/yuni 57)'},
    'poor_compound': {w: 18, d: 16, h: 7, what: 'a mud-walled farm compound (kits/yuni 57)'},
    'mid_courtyard_house': {w: 12, d: 12, h: 11, what: 'a courtyard house with a corner tower (kits/yuni 56)'},
    'mid_washed_house': {w: 11, d: 9, h: 9, what: 'a washed pinnacle house (kits/yuni 55)'},
    'mid_djenne_house': {w: 11, d: 9, h: 11, what: 'a Djenne-front town house (kits/yuni 56)'},
    'rich_tower_house': {w: 14, d: 14, h: 29, what: 'a tower-house, the headman\'s family (kits/yuni 58)'},
    'trade_shop_house': {w: 9, d: 11, h: 12, what: 'a shop-house (kits/yuni 56)'},
    'trade_tavern': {w: 14, d: 12, h: 13, what: 'a tavern with a shaded yard (kits/yuni 56)'},
    'civic_bell_tower': {w: 8, d: 8, h: 22, what: 'a watch-and-bell tower (kits/yuni 59)'},
    'civic_chapter_house_small': {w: 20, d: 16, h: 10, what: 'a chapter room of the Historians (a village\'s: kits/yuni 59\'s chapter house is a city\'s, 56 x 48 m)'},
    'prop_granary': {w: 3, d: 3, h: 4.6, what: 'a granary on stilts (kits/yuni 57)'},
    'prop_granary_store': {w: 12, d: 8, h: 6, what: 'a granary store (a row of the kit\'s stilt granaries under one roof)'},
    'prop_hangar': {w: 5, d: 4, h: 3, what: 'a shade shelter (kits/yuni 57)'},
    'prop_animal_pen': {w: 8, d: 8, h: 2.4, what: 'a thorn-fenced animal pen (kits/yuni 57)'},
    'prop_well': {w: 4, d: 4, h: 3, what: 'a mud-kerbed well (kits/yuni 57)'}
  }
};
