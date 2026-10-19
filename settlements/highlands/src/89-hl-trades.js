// ================================================================= HIGHLANDS — the Voth census trades [G data]
/* HL_TRADES: every trade of the Voth city's census (tools/trades_census.json, 44 trades) and the Highlands building keys
   (Republican hl_rep_, Rustic hl_rus_, Tribal hl_tri_; the kit page and Roketstad take them all) that carry it, or `na`
   and why the highlands have none, or `gap` for the building still to be drawn (KNOWN_ISSUES.md, "Voth census trades").
   Plain data, no three.js, no DOM; `python3 tools/check_trades.py settlements/highlands` and the `voth-trades` assert
   in verify.py read it, and a key must be a building key found elsewhere in src/. The Iron Republic is an inland
   upland with no sea or lake in the kit's geography, so the sea and river trades are na. */
const HL_TRADES = [
  { trade: 'bakers', keys: [], gap: 'a bakery (ovens and a shop front)' },
  { trade: 'butchers', keys: [], gap: 'a butcher\'s shop and slaughter yard' },
  { trade: 'weavers and dyers', keys: [], gap: 'a weaver\'s and dyer\'s workshop' },
  { trade: 'brewers', keys: ['hl_rep_workshop_b'], note: 'the brewery and cooperage' },
  { trade: 'tanners', keys: [], gap: 'a tannery' },
  { trade: 'shipwrights and boatbuilders', keys: [], gap: 'a boatyard (the shipbreakers take ships apart; nothing builds a hull)' },
  { trade: 'innkeepers and grooms', keys: ['hl_rep_inn', 'hl_rep_stables'], note: 'the coaching inn; the caravanserai with its stables' },
  { trade: 'town guard', keys: ['hl_rep_watch', 'hl_rep_gate', 'hl_rep_wall_tower'] },
  { trade: 'coast guard', na: 'inland upland: no coast; the wall towers and the city watch hold the gates' },
  { trade: 'temple priests and servants', keys: ['hl_rep_temple', 'hl_rus_temple'], note: 'the Temple of the Pantheon; the stave church' },
  { trade: 'shrine keepers', keys: ['hl_tri_shaman', 'hl_tri_stone_circle'], note: 'the Painted Men\'s shaman and stone circle' },
  { trade: 'shopkeepers and assistants', keys: ['hl_rep_shops', 'hl_rus_shops', 'hl_rep_cont_shops'] },
  { trade: 'smiths and craftsmen', keys: ['hl_rep_smithy_small', 'hl_rep_smithy_large', 'hl_rep_workshop_a', 'hl_rus_smithy', 'hl_tri_smithy'] },
  { trade: 'innkeepers and servers', keys: ['hl_rep_tavern_a', 'hl_rep_tavern_b', 'hl_rep_tavern_c', 'hl_rus_tavern'] },
  { trade: 'porters and warehousemen', keys: ['hl_rep_warehouse_a', 'hl_rep_warehouse_b', 'hl_rep_hull_vault'] },
  { trade: 'industrial workers', keys: ['hl_rep_forgehouse', 'hl_rep_smelter', 'hl_rep_press_works', 'hl_rep_powder_works'] },
  { trade: 'power-house stokers and engineers', keys: ['hl_rep_generator'], note: 'the generator house' },
  { trade: 'household service', keys: ['hl_rep_house_rich_a', 'hl_rep_house_rich_b', 'hl_rep_house_rich_c', 'hl_rus_house_rich_b'] },
  { trade: 'soldiers', keys: ['hl_rep_barracks', 'hl_rep_muster', 'hl_rep_arsenal', 'hl_rep_fortress'] },
  { trade: 'teachers and scholars', keys: ['hl_rep_school', 'hl_rep_guild_astro'], note: 'the schoolhouse; the Astronomers\' Guild' },
  { trade: 'guild officers and clerks', keys: ['hl_rep_guild_smith', 'hl_rep_guild_mech', 'hl_rep_guild_scav', 'hl_rep_guild_farm', 'hl_rep_town_hall'] },
  { trade: 'customs officers and clerks', na: 'inland: no port to clear; the Scrap Kontor is a trading house, not a toll' },
  { trade: 'healers and nurses', keys: ['hl_rep_hospital'] },
  { trade: 'priests and undertakers', keys: ['hl_rep_temple'], gap: 'a funerary temple or burying ground' },
  { trade: 'lighthouse keepers', na: 'inland upland: no coast to light' },
  { trade: 'dockers and stevedores', na: 'inland: no harbour; goods move by cart and caravan' },
  { trade: 'river bargemen and quay hands', na: 'no navigable river in the kit\'s geography (Roketstad\'s terrain has none)' },
  { trade: 'fishers', na: 'no sea, lake or river in the kit\'s geography' },
  { trade: 'market traders', keys: ['hl_rep_market_hall', 'hl_rep_wreck_market', 'hl_rus_scrap_market', 'hl_rep_lantern_stall'] },
  { trade: 'farmhands and ploughmen', keys: ['hl_rep_farmhouse', 'hl_rep_farm', 'hl_rus_farmhouse', 'hl_rus_farm', 'hl_tri_farmhouse', 'hl_tri_farm'] },
  { trade: 'chinampa growers', na: 'no marsh or lake gardens in the highlands: the farms are fields and terraces' },
  { trade: 'orchardmen', keys: [], gap: 'an orchard plot' },
  { trade: 'miners', keys: ['hl_rep_mine'] },
  { trade: 'quarrymen and masons', keys: ['hl_rep_quarry'] },
  { trade: 'granary keepers and millers', keys: ['hl_rep_granary', 'hl_rep_windmill', 'hl_rep_watermill', 'hl_rus_granary', 'hl_rus_mill', 'hl_tri_granary'] },
  { trade: 'beetle herders', na: 'no beetles: the highland stock is cattle, pigs and sheep in pens' },
  { trade: 'dairymen', keys: [], gap: 'a dairy' },
  { trade: 'swineherds and duck keepers', keys: ['hl_rep_pens', 'hl_rus_pens', 'hl_tri_pen'], note: 'the animal pens' },
  { trade: 'mushroom growers', na: 'no mushroom farms in the highlands' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'no river or lake crossing in the kit\'s geography' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs in the highlands: loads go by cart, crawler and caravan' },
  { trade: 'monks and lay brothers', na: 'the highlands keep a pantheon temple, a stave church and the Painted Men\'s shamans, no monasteries' },
  { trade: 'palace and canton staffs', keys: ['hl_rep_hall_republic', 'hl_rep_town_hall', 'hl_rep_mint'], note: 'the Hall of the Republic; the town hall; the Mint' }
];
globalThis.HL_TRADES = HL_TRADES;
