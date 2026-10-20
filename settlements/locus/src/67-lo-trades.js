/* ======================================================================
   LO_TRADES: the census table [G data]. Every trade of the Voth city's census (tools/trades_census.json, the list
   IS_TRADES and BR_TRADES carry), and the Locus buildings that carry it, or `na` and why a salt-lake oil town of the
   eastern abyss has none, or `gap` and what building is missing. Plain data, no three.js and no DOM;
   tools/check_trades.py reads it (and verify.py --assert runs it as 'voth-trades'): every census trade has a row,
   every key is a quoted literal in this build's src, and a row stripped of keys, na and gap is caught.
   The table records what EXISTS (2026-10-19), on the world page (locus.html); the two kit sheets and the plants
   page are flavours of the same source. The keys are the ASSETs of the Locus kit (64-locus-*: the Geomancers'
   chapterhouse, the salt-rice farm, the warehouse, the fishing dock, the petroleum works, the generator house, the
   fuel station), of the Abyss kit (65-abyss-*) and of the Yuni assets the town places (mid_*, trade_*, rich_*,
   civic_*, prop_*).
   ====================================================================== */
const LO_TRADES = [
  { trade: 'bakers', keys: [], gap: 'a bakery with its ovens (a cookshop and fish stall only)' },
  { trade: 'butchers', keys: [], gap: 'a butcher\'s shop and slaughter yard' },
  { trade: 'weavers and dyers', keys: ['trade_dyer_yard', 'trade_craft_shed'], note: 'the dyer\'s yard with its vats; the weaver\'s and carpenter\'s shed' },
  { trade: 'brewers', keys: [], gap: 'a brewhouse or date-wine press' },
  { trade: 'tanners', keys: [], gap: 'a tannery' },
  { trade: 'shipwrights and boatbuilders', keys: ['abyss_shop_sailmaker'], note: 'sails, canvas and rope for the lake boats', gap: 'a small boatyard on the salt lake' },
  { trade: 'innkeepers and grooms', keys: ['abyss_caravanserai', 'trade_caravanserai', 'abyss_inn'], note: 'the caravanserai yards stable the caravans\' animals' },
  { trade: 'town guard', keys: ['abyss_guard_tower', 'abyss_palisade_gate', 'abyss_wall_tower'] },
  { trade: 'coast guard', na: 'a salt lake, not a coast: no sea to patrol; the wall and the guard towers keep the town' },
  { trade: 'temple priests and servants', keys: ['abyss_temple'], note: 'the Temple of the Altar' },
  { trade: 'shrine keepers', keys: [], gap: 'a wayside shrine for the villages and the farm belt' },
  { trade: 'shopkeepers and assistants', keys: ['trade_shop_house', 'abyss_shop_general'] },
  { trade: 'smiths and craftsmen', keys: ['trade_smithy', 'trade_potter_yard', 'abyss_shop_weapons', 'abyss_shop_armor', 'abyss_shop_salvage'], note: 'the open forge, the potter\'s kiln yard, the weapon and armour smiths, the tinker' },
  { trade: 'innkeepers and servers', keys: ['abyss_tavern', 'trade_tavern', 'abyss_inn'] },
  { trade: 'porters and warehousemen', keys: ['locus_warehouse', 'abyss_warehouse'], note: 'the salt-and-oil warehouse' },
  { trade: 'industrial workers', keys: ['ind_refinery', 'ind_oil_tank', 'prop_pipe_rack', 'prop_drum_stack'], note: 'the petroleum works: refinery, tanks, pipe racks, drum stacks' },
  { trade: 'power-house stokers and engineers', keys: ['ind_generator_house'], note: 'the Geomancers\' generator house round a salvaged Ancient engine; the distribution line (71g-locus-grid.js)' },
  { trade: 'household service', keys: ['abyss_house_rich', 'rich_merchant_palace', 'rich_family_compound', 'abyss_mayor_compound'] },
  { trade: 'soldiers', keys: ['abyss_barracks', 'abyss_fortress'] },
  { trade: 'teachers and scholars', keys: ['abyss_school', 'civic_school', 'abyss_library'] },
  { trade: 'guild officers and clerks', keys: ['civic_geomancer_chapterhouse', 'civic_hall_records'], note: 'the Geomancers\' guild at its chapterhouse; the hall of records' },
  { trade: 'customs officers and clerks', keys: ['abyss_toll_house'], note: 'the toll house at the trailhead' },
  { trade: 'healers and nurses', keys: [], gap: 'a house of healing (the alchemist sells remedies only)' },
  { trade: 'priests and undertakers', keys: ['abyss_temple'], note: 'the temple', gap: 'a funerary court' },
  { trade: 'lighthouse keepers', na: 'a salt lake with a fishing dock, no sea routes to light' },
  { trade: 'dockers and stevedores', na: 'no harbour: the lake serves a fishing dock only; goods come by road and by the dock road to the warehouse' },
  { trade: 'river bargemen and quay hands', na: 'the lake and its distributaries are shallow salt marsh; goods move on the highways' },
  { trade: 'fishers', keys: ['infra_fishing_dock', 'abyss_shop_salt'], note: 'the fishing dock with its net frames; the salt and fish merchant' },
  { trade: 'market traders', keys: ['prop_market_stall', 'prop_market_tent', 'trade_market_hall'] },
  { trade: 'farmhands and ploughmen', keys: ['farm_saltrice', 'abyss_farmhouse'], note: 'the salt-rice farm; the marsh farmhouse' },
  { trade: 'chinampa growers', keys: ['farm_saltrice_paddies'], note: 'the salt-rice paddies' },
  { trade: 'orchardmen', keys: [], gap: 'a date-palm grove with its farmhouse' },
  { trade: 'miners', keys: ['ind_pumpjack'], note: 'oil is the resource: the pumpjacks work the oil nodes', gap: 'a mine head for ore, if a node lies near' },
  { trade: 'quarrymen and masons', keys: [], gap: 'a quarry (laterite and umber)' },
  { trade: 'granary keepers and millers', keys: ['abyss_granary', 'prop_granary'], note: 'the silo granary and the granary on stilts', gap: 'a mill (the windpump lifts water only)' },
  { trade: 'beetle herders', na: 'the beetles are the Staghorn riders\' stock (LORE 6.6); the abyss herds goats and oxen' },
  { trade: 'dairymen', keys: [], gap: 'a dairy (milk herd and byre)' },
  { trade: 'swineherds and duck keepers', keys: ['prop_animal_pen'], note: 'the thorn-fenced pen', gap: 'duck coops on the marsh edge' },
  { trade: 'mushroom growers', na: 'a salt desert and marsh: no dark cellars or damp woods for a fungus farm in the abyssal lore' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'plank bridges and earth causeways cross every pool (68c-locus-crossings.js): no ferry' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs: caravans are drawn by oxen and camels' },
  { trade: 'monks and lay brothers', keys: ['civic_geomancer_chapterhouse'], note: 'the Geomancers\' brothers live at the chapterhouse' },
  { trade: 'palace and canton staffs', keys: ['rich_emir_palace', 'abyss_palace', 'abyss_mayor_compound'] }
];
globalThis.LO_TRADES = LO_TRADES;
