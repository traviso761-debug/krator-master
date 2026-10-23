// ================================================================= DALAB — the Voth census trades [G data]
/* DALAB_TRADES: every trade of the Voth city's census (tools/trades_census.json, 44 trades) and the Dalab building keys
   that carry it, or `na` and why Dalab has none, or `gap` for the building still to be drawn (listed in KNOWN_ISSUES.md,
   "Voth census trades"). Plain data, no three.js, no DOM; `python3 tools/check_trades.py settlements/dalab` and the
   `voth-trades` assert in verify.py read it, and a key must be a building key found elsewhere in src/. Dalab is a
   landlocked river lowland of mound towns: Ancient light (the God's light) is a relic the priests keep, not a power
   works; the sea trades are na, the river keeps at most a fishing dock. */
const DALAB_TRADES = [
  { trade: 'bakers', keys: [], gap: 'a bake house (clay ovens) in the town types' },
  { trade: 'butchers', keys: [], gap: 'a butcher\'s shop and slaughter yard' },
  { trade: 'weavers and dyers', keys: ['dalab_weaver', 'dalab_dyer'] },
  { trade: 'brewers', keys: [], gap: 'a brewhouse (the tavern pours, nothing brews)' },
  { trade: 'tanners', keys: [], gap: 'a tannery pit shed' },
  { trade: 'shipwrights and boatbuilders', keys: [], gap: 'a small river boatyard on the river bank' },
  { trade: 'innkeepers and grooms', keys: ['dalab_inn'], note: 'the travellers\' inn round a court with lizard stalls' },
  { trade: 'town guard', keys: ['dalab_watchtower', 'dalab_barracks'], note: 'the watch tower; the giants\' barracks' },
  { trade: 'coast guard', na: 'landlocked river lowland: no coast; the watch towers and the giant patrols hold the roads' },
  { trade: 'temple priests and servants', keys: ['dalab_temple', 'dalab_priest_house', 'dalab_priest_compound'] },
  { trade: 'shrine keepers', keys: ['dalab_shrine'] },
  { trade: 'shopkeepers and assistants', keys: ['dalab_shops'] },
  { trade: 'smiths and craftsmen', keys: ['dalab_smithy', 'dalab_workshop', 'dalab_potter'] },
  { trade: 'innkeepers and servers', keys: ['dalab_tavern'] },
  { trade: 'porters and warehousemen', keys: ['dalab_warehouse'] },
  { trade: 'industrial workers', keys: ['dalab_earthyard'], note: 'no works with engines: the block yard (stacks, mixing pit, ramming shed)' },
  { trade: 'power-house stokers and engineers', na: 'no power works: the God\'s light is an Ancient relic the priests keep alive; fire is the only fuel (DESIGN.md, the lighting rule)' },
  { trade: 'household service', keys: ['dalab_noble_a', 'dalab_noble_b', 'dalab_noble_c', 'dalab_compound'] },
  { trade: 'soldiers', keys: ['dalab_barracks'] },
  { trade: 'teachers and scholars', keys: ['dalab_scribes', 'dalab_chapterhouse'], note: 'the scribes\' hall; the Historians\' chapterhouse' },
  { trade: 'guild officers and clerks', keys: ['dalab_scribes'], gap: 'a guild hall (the scribes\' hall keeps the clerks, no trade guild has a house)' },
  { trade: 'customs officers and clerks', na: 'landlocked: no port to clear; the highway circuit has no toll house in the lore' },
  { trade: 'healers and nurses', keys: ['dalab_healers'] },
  { trade: 'priests and undertakers', keys: ['dalab_temple'], gap: 'a funerary temple or burial court (the ceremonial mounds are not drawn as tombs)' },
  { trade: 'lighthouse keepers', na: 'landlocked river lowland: no coast to light' },
  { trade: 'dockers and stevedores', na: 'landlocked: no sea harbour; river cargo is carried to the market, not worked at a quay' },
  { trade: 'river bargemen and quay hands', na: 'the river is shallow and cut through the lowland (84-city-geo.js) and carries no barge trade in the lore' },
  { trade: 'fishers', keys: [], gap: 'a river fishing dock with drying racks' },
  { trade: 'market traders', keys: ['dalab_market_small', 'dalab_market_large'] },
  { trade: 'farmhands and ploughmen', keys: ['dalab_ranch'], note: 'the ranch house and barn; the fields themselves are the farm wedges of the city target' },
  { trade: 'chinampa growers', na: 'no lake or marsh gardens: the lowland is watered by irrigation channels, not raised beds' },
  { trade: 'orchardmen', keys: ['dalab_orchard'] },
  { trade: 'miners', keys: [], gap: 'a mine head (the scrap smithy has no ore of its own)' },
  { trade: 'quarrymen and masons', keys: ['dalab_earthyard'], gap: 'a stone quarry (the earth yard makes only blocks of earth)' },
  { trade: 'granary keepers and millers', keys: ['dalab_granaries', 'dalab_windmill'] },
  { trade: 'beetle herders', na: 'no beetles: the herders keep lizards on the ranch (DFAUNA)' },
  { trade: 'dairymen', keys: [], gap: 'a dairy' },
  { trade: 'swineherds and duck keepers', keys: [], gap: 'a sty and a coop (the ranch keeps lizards only)' },
  { trade: 'mushroom growers', na: 'Dalab has no mushroom farms: the lowland grows grain, orchards and lizards' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'the river is bridged (87-city-layout.js bridges); no ferry' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs in Dalab: the beasts of burden are lizards' },
  { trade: 'monks and lay brothers', keys: ['dalab_chapterhouse'], note: 'the Order of Historians\' chapterhouse' },
  { trade: 'palace and canton staffs', keys: ['dalab_palace_mound', 'dalab_halls'], note: 'the High Priest\'s palace mound; the Halls of Reformation' }
];
globalThis.DALAB_TRADES = DALAB_TRADES;
