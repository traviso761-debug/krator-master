// ================================================================= XANADU — the Voth census trades [G data]
/* XA_TRADES: every trade of the Voth city's census (tools/trades_census.json, 44 trades) and the Xanadu building keys
   that carry it, or `na` and why Xanadu has none, or `gap` for the building still to be drawn (KNOWN_ISSUES.md, "Voth
   census trades"). Plain data, no three.js, no DOM; `python3 tools/check_trades.py settlements/xanadu` and the
   `voth-trades` assert in verify.py read it, and a key must be a building key found elsewhere in src/. The table is
   for Erewhon, Pearl of Xanadu (dist/erewhon.html, the city page), whose bay holds a small dockyard (quay, boat shed,
   lighthouse); Xanadu itself is a hill valley, so the heavy sea trades are na. */
const XA_TRADES = [
  { trade: 'bakers', keys: [], gap: 'a bakery' },
  { trade: 'butchers', keys: [], gap: 'a butcher\'s shop' },
  { trade: 'weavers and dyers', keys: [], gap: 'a weaver\'s and dyer\'s workshop' },
  { trade: 'brewers', keys: [], gap: 'a brewhouse' },
  { trade: 'tanners', keys: [], gap: 'a tannery' },
  { trade: 'shipwrights and boatbuilders', keys: ['xa_boatshed'], note: 'the dockyard\'s boat shed' },
  { trade: 'innkeepers and grooms', keys: [], gap: 'an inn or caravanserai with stables' },
  { trade: 'town guard', keys: ['xa_watch', 'xa_gate', 'xa_wall'] },
  { trade: 'coast guard', na: 'a hill valley with a small bay: the city watch and the fortress hold the quays, no coast guard' },
  { trade: 'temple priests and servants', keys: ['xa_temple', 'xa_grand_temple', 'xa_temple_ortakoy'] },
  { trade: 'shrine keepers', keys: [], gap: 'a wayside shrine' },
  { trade: 'shopkeepers and assistants', keys: ['xa_shop_turk_a', 'xa_shop_turk_b', 'xa_andean_poor'] },
  { trade: 'smiths and craftsmen', keys: ['xa_smithy', 'xa_workshop'] },
  { trade: 'innkeepers and servers', keys: ['xa_teahouse'] },
  { trade: 'porters and warehousemen', keys: ['xa_warehouse'] },
  { trade: 'industrial workers', keys: [], gap: 'a works (smelter, mill or press) beyond the small workshops' },
  { trade: 'power-house stokers and engineers', keys: ['xa_generator'] },
  { trade: 'household service', keys: ['xa_rich_a', 'xa_rich_b', 'xa_rich_c', 'xa_vizier', 'xa_andean_rich'] },
  { trade: 'soldiers', keys: ['xa_barracks', 'xa_muster', 'xa_fortress'] },
  { trade: 'teachers and scholars', keys: [], gap: 'a school or madrasa' },
  { trade: 'guild officers and clerks', keys: ['xa_guild_farm', 'xa_guild_mine', 'xa_guild_gold', 'xa_guild_alch', 'xa_guild_mason', 'xa_guild_spicer'] },
  { trade: 'customs officers and clerks', na: 'no large port: the bay is a pleasure harbour and a small dockyard, not a customs port' },
  { trade: 'healers and nurses', keys: [], gap: 'a hospital or healers\' house (the baths are for bathing)' },
  { trade: 'priests and undertakers', keys: ['xa_temple'], gap: 'a funerary temple or burial court' },
  { trade: 'lighthouse keepers', keys: ['xa_lighthouse'] },
  { trade: 'dockers and stevedores', keys: ['xa_quay', 'xa_warehouse'] },
  { trade: 'river bargemen and quay hands', na: 'no river freight: the one barge is the Sultan\'s pleasure barge' },
  { trade: 'fishers', keys: [], gap: 'a fishing dock on the bay' },
  { trade: 'market traders', keys: ['xa_shops', 'xa_lane'], note: 'the bazaar row; the lane of lights' },
  { trade: 'farmhands and ploughmen', keys: ['xa_farm', 'xa_farmhouse'], note: 'the terraced fields and the farmstead' },
  { trade: 'chinampa growers', na: 'no marsh gardens: the valley farms terraces and the palace has chahar bagh gardens' },
  { trade: 'orchardmen', keys: [], gap: 'an orchard plot' },
  { trade: 'miners', keys: ['xa_guild_mine'], gap: 'a mine head (only the Miners\' Guild is drawn; the valley\'s gold mines are the lore)' },
  { trade: 'quarrymen and masons', keys: ['xa_guild_mason'], gap: 'a stone quarry' },
  { trade: 'granary keepers and millers', keys: ['xa_granary', 'xa_windmill', 'xa_watermill'] },
  { trade: 'beetle herders', na: 'no beetles in Xanadu' },
  { trade: 'dairymen', keys: ['xa_dairy', 'xa_corral'] },
  { trade: 'swineherds and duck keepers', keys: ['xa_pens'], gap: 'a coop' },
  { trade: 'mushroom growers', na: 'no mushroom farms in Xanadu' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'the streets cross on bridges (xa_bridge); no ferry' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs in Xanadu: the Sultanate keeps no bug stations' },
  { trade: 'monks and lay brothers', keys: ['xa_monastery'] },
  { trade: 'palace and canton staffs', keys: ['xa_palace', 'xa_palace_gate', 'xa_pleasure_dome', 'xa_vizier'], note: 'the Sultan\'s palace, its gate and Pleasure Dome; the Vizier\'s palace' }
];
globalThis.XA_TRADES = XA_TRADES;
