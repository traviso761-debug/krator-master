// ================================================================= JIMJAM — the Voth census trades [G data]
/* JJ_TRADES: every trade of the Voth city's census (tools/trades_census.json, 44 trades) and the Jimjam building keys
   that carry it, or `na` and why Jimjam has none, or `gap` for the building still to be drawn (KNOWN_ISSUES.md, "Voth
   census trades"). Plain data, no three.js, no DOM; `python3 tools/check_trades.py settlements/jimjam` and the
   `voth-trades` assert in verify.py read it, and a key must be a building key found elsewhere in src/. The table is for
   the kit page (dist/jimjam-kit.html, the only page). Jimjam stands by a lake on flood silt, lit by oil lamps and
   braziers (DESIGN.md): no electricity, no coast. */
const JJ_TRADES = [
  { trade: 'bakers', keys: ['jj_shop_food'], note: 'the grocer and baker, with the bread oven in the yard' },
  { trade: 'butchers', keys: [], gap: 'a butcher\'s shop' },
  { trade: 'weavers and dyers', keys: [], gap: 'a weaver\'s and dyer\'s workshop (the cloth and carpet merchant only sells)' },
  { trade: 'brewers', keys: [], gap: 'a brewhouse' },
  { trade: 'tanners', keys: [], gap: 'a tannery' },
  { trade: 'shipwrights and boatbuilders', keys: [], gap: 'a small boatyard on the lake shore' },
  { trade: 'innkeepers and grooms', keys: ['jj_caravanserai'] },
  { trade: 'town guard', keys: ['jj_wall_gate', 'jj_wall_tower', 'jj_wall_corner'] },
  { trade: 'coast guard', na: 'a lake-shore city on flood silt: no coast; the wall towers and the barracks keep the watch' },
  { trade: 'temple priests and servants', keys: ['jj_temple_sun'], note: 'the solstice temple' },
  { trade: 'shrine keepers', keys: [], gap: 'a wayside shrine' },
  { trade: 'shopkeepers and assistants', keys: ['jj_shop_general', 'jj_shop_spice', 'jj_shop_jeweler', 'jj_house_mid_c'], note: 'the shops; the middle shop-house' },
  { trade: 'smiths and craftsmen', keys: ['jj_shop_weapons', 'jj_shop_armor', 'jj_shop_jeweler'] },
  { trade: 'innkeepers and servers', keys: ['jj_inn', 'jj_tavern'] },
  { trade: 'porters and warehousemen', keys: ['jj_warehouse_a', 'jj_warehouse_b'] },
  { trade: 'industrial workers', keys: [], gap: 'a works (brick kiln, foundry or press)' },
  { trade: 'power-house stokers and engineers', na: 'pre-electric: oil lamps and braziers light the rich and civic buildings (DESIGN.md), no generator' },
  { trade: 'household service', keys: ['jj_house_rich_a', 'jj_house_rich_b', 'jj_house_rich_c'] },
  { trade: 'soldiers', keys: ['jj_barracks', 'jj_fortress'] },
  { trade: 'teachers and scholars', keys: ['jj_school', 'jj_library'] },
  { trade: 'guild officers and clerks', keys: [], gap: 'a guild hall' },
  { trade: 'customs officers and clerks', na: 'a lake-shore city with no port; the caravanserai takes the caravans\' trade' },
  { trade: 'healers and nurses', keys: [], gap: 'a house of healing (the alchemist\'s shop only sells)' },
  { trade: 'priests and undertakers', keys: ['jj_temple_sun'], gap: 'a funerary temple or burial court' },
  { trade: 'lighthouse keepers', na: 'a lake-shore city: no sea to light' },
  { trade: 'dockers and stevedores', na: 'no harbour: goods come in by caravan to the warehouses' },
  { trade: 'river bargemen and quay hands', na: 'no river freight in the lore: the caravan network carries the goods' },
  { trade: 'fishers', keys: [], gap: 'a fishing dock on the lake' },
  { trade: 'market traders', keys: ['jj_furn_market_stall'], gap: 'a market square or hall (only the stall frame is drawn)' },
  { trade: 'farmhands and ploughmen', keys: ['jj_farm_field', 'jj_farmhouse_a', 'jj_farmhouse_b'] },
  { trade: 'chinampa growers', na: 'no raised-bed lake gardens in Jimjam: its farms are brick-walled fields' },
  { trade: 'orchardmen', keys: [], gap: 'an orchard plot' },
  { trade: 'miners', na: 'flood-silt lowland: no ore to mine; metal comes in by caravan' },
  { trade: 'quarrymen and masons', keys: [], gap: 'a stone yard or brick kiln (the marble trim and the brick are drawn, their makers are not)' },
  { trade: 'granary keepers and millers', keys: ['jj_granary', 'jj_windmill'] },
  { trade: 'beetle herders', na: 'no beetles in Jimjam' },
  { trade: 'dairymen', keys: [], gap: 'a dairy' },
  { trade: 'swineherds and duck keepers', keys: ['jj_farmhouse_a'], note: 'the courtyard and pens of farmhouse A' },
  { trade: 'mushroom growers', na: 'no mushroom farms in Jimjam' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'no river crossing: the city stands on one shore of the lake' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs in Jimjam' },
  { trade: 'monks and lay brothers', na: 'Jimjam\'s faith is the solstice temple and its calendar; no monasteries' },
  { trade: 'palace and canton staffs', keys: ['jj_palace', 'jj_palace_plaza'], note: 'the Raja\'s palace and the great sunray plaza' }
];
globalThis.JJ_TRADES = JJ_TRADES;
