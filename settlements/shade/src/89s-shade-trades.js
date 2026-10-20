/* ============================== THE VOTH CENSUS OF TRADES [G data] ==============================
   2026-10-19. Which of the Voth city's 44 trades (tools/trades_census.json) Shade carries. The table records what
   exists and builds nothing. A row is { trade, keys:[...], note? } for a trade Shade carries, { trade, na:'why' } where
   it cannot or should not exist, or { trade, keys:[], gap:'what is missing' } (keys and a gap together: partly carried).
   The keys are the Eastern Nomad kit's builders (src/77b..e: buildTreasury, buildCaravanserai ...) and the ids of the
   reserved places (PLACES in src/44-host-layout.js: 'khan', 'market', 'terraces' ...). tools/check_trades.py reads it
   (verify.py 'voth-trades'); KNOWN_ISSUES.md lists the gaps. Shade (LORE 6.8): about 1,000 Eastern Nomads in a sunken
   sandstone basin of the high desert, a stream and a plunge pool, no sea; carved facades, cliff dwellings, pueblo
   blocks, black tents, the Khan caravanserai and a market; the Wardens of the Deep Aquifer (priests), the canyon guard,
   caravans and the dune raiders; Dasri, an Arabic-leaning culture. */
const SHADE_TRADES = [
  { trade: 'bakers', keys: [], gap: 'a bakehouse with adobe ovens in the pueblo quarter' },
  { trade: 'butchers', keys: [], gap: 'a slaughter yard and butcher\'s stall for the goat and camel herds' },
  { trade: 'weavers and dyers', keys: [], gap: 'a goat-hair weaving and dye yard (the tents and stalls use goat-hair cloth and dyes, nobody is shown making them)' },
  { trade: 'brewers', na: 'Dasri is an Arabic-leaning culture (LORE 6.8): no brewing trade; drink is water, tea and dates' },
  { trade: 'tanners', keys: [], gap: 'a tannery downwind of the basin for the herd hides' },
  { trade: 'shipwrights and boatbuilders', na: 'a desert basin with a plunge pool and a stream, no boats' },
  { trade: 'innkeepers and grooms', keys: ['buildCaravanserai', 'khan'], note: 'the Khan: a ring of rooms behind an arcade, a court with a well and troughs for the camel lines' },
  { trade: 'town guard', keys: ['buildPuebloTower', 'switchback_gate', 'canyon_watch'], note: 'the switchback gatehouse and the canyon watch tower (the canyon guard)' },
  { trade: 'coast guard', na: 'no sea in the high desert' },
  { trade: 'temple priests and servants', keys: ['buildTreasury', 'shrine'], note: 'the Shrine of the Deep Aquifer and the rock-cut hall: the Wardens\' temple fronts' },
  { trade: 'shrine keepers', keys: ['shrine'], note: 'the Shrine of the Deep Aquifer behind the falls, worshipped at dawn and dusk' },
  { trade: 'shopkeepers and assistants', keys: ['buildMarketStall', 'market'], note: 'market stalls on the market grounds; the Khan also has the market/shop type' },
  { trade: 'smiths and craftsmen', keys: [], gap: 'a smithy and craft yard (metal, pottery); none drawn' },
  { trade: 'innkeepers and servers', keys: ['buildCaravanserai'], note: 'the Khan is the inn (types tavern/inn, market/shop)' },
  { trade: 'porters and warehousemen', keys: ['buildCaravanserai'], gap: 'a warehouse for caravan goods: the Khan\'s rooms lodge and store but no store-house is drawn' },
  { trade: 'industrial workers', na: 'no industry: a nomad basin of pastoralists, farmers and caravan trade' },
  { trade: 'power-house stokers and engineers', na: 'no power-house: pre-electric nomads, water and muscle' },
  { trade: 'household service', na: 'kin households in dwellings and tents; no servant class is shown' },
  { trade: 'soldiers', keys: [], gap: 'a barracks or muster court for the canyon guard (only its two towers are drawn)' },
  { trade: 'teachers and scholars', keys: [], gap: 'a school or letter-house (the caravan hand is learned at Yuni)' },
  { trade: 'guild officers and clerks', na: 'no guilds: the Shade clans rule through their elders' },
  { trade: 'customs officers and clerks', keys: [], gap: 'a toll house at the switchback gatehouse or the Khan gate for caravans and the dune raiders\' trade' },
  { trade: 'healers and nurses', keys: [], gap: 'a healer\'s house' },
  { trade: 'priests and undertakers', keys: [], gap: 'a burial ground (the crow-step rock-cut fronts are houses, not tombs)' },
  { trade: 'lighthouse keepers', na: 'no sea or lake traffic' },
  { trade: 'dockers and stevedores', na: 'no harbour; goods move by camel at the Khan' },
  { trade: 'river bargemen and quay hands', na: 'the stream is a wadi too small for boats; caravans trade by land' },
  { trade: 'fishers', keys: [], gap: 'a small fishing platform at the pool shore' },
  { trade: 'market traders', keys: ['buildMarketStall', 'market'], note: 'the market stall builder and the market grounds' },
  { trade: 'farmhands and ploughmen', keys: ['terraces', 'north_fields'], gap: 'field plots and ditches: the irrigated terraces and north bank fields are reserved places the biome plants, with no field builder', note: 'reserved farm ground' },
  { trade: 'chinampa growers', na: 'irrigated terraces and bank fields, not water beds' },
  { trade: 'orchardmen', keys: [], gap: 'a date or fruit grove on the terraces' },
  { trade: 'miners', keys: [], gap: 'a mine in the rim for stone salt or ore; none drawn' },
  { trade: 'quarrymen and masons', keys: [], gap: 'a stone-cutters\' yard: the facades are rock-cut but no one is shown cutting' },
  { trade: 'granary keepers and millers', keys: [], gap: 'a granary and a mill for the terrace grain' },
  { trade: 'beetle herders', na: 'no beetles: their stock is goats and camels' },
  { trade: 'dairymen', keys: [], gap: 'a goat and camel dairy' },
  { trade: 'swineherds and duck keepers', keys: ['grazing'], gap: 'goat pens and camel lines (livestock keepers; no pigs): the plateau grazing is a reserved place only', note: 'the plateau grazing' },
  { trade: 'mushroom growers', na: 'a dry high desert: no mushroom farming' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'the stream is forded on foot and by camel (the ford place)' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs: camels carry the caravans' },
  { trade: 'monks and lay brothers', na: 'no monastic order: the Wardens of the Deep Aquifer are a priesthood' },
  { trade: 'palace and canton staffs', keys: [], gap: 'a clan elders\' hall or the Khan\'s residence for the Shade clans\' rulers' }
];
globalThis.SHADE_TRADES = SHADE_TRADES;
