// prefix: lz
/* ======================================================================
   The Voth census of trades, 2026-10-19 [G data]: which of the city's 44 trades (tools/trades_census.json) the Lizardmen kit
   carries. The table records what exists and builds nothing. A row is { trade, keys:[def keys], note? } for a trade the kit
   carries, { trade, na:'why' } where it cannot or should not exist, or { trade, keys:[], gap:'what is missing' } (keys and a gap
   together: partly carried). tools/check_trades.py reads it (verify.py 'voth-trades'); KNOWN_ISSUES.md lists the gaps.
   Lizardmen (DESIGN.md sections 1 and 4): no shops, no coin, never trade or treat, no clothing, hostile to all; combined craft
   and store halls by caste; the dead are matter and the living are reborn; the Rift floor has no sea.
   ====================================================================== */
const LZ_TRADES = [
  { trade: 'bakers', keys: ['lz-bakehouse'], note: 'the earth-oven and yam bakehouse: three domed brick beehive ovens baking the panemone windmills\' flour and roasted Rift tubers (59w-lz-works.js)' },
  { trade: 'butchers', keys: ['lz-hall-bone'], note: 'the bone hall: carcasses on hooks, hides, sorted bone (DESIGN section 5)' },
  { trade: 'weavers and dyers', keys: ['lz-hall-reed'], note: 'reed, weaving and lacquer hall: mats, screens, baskets, lacquer; no garments' },
  { trade: 'brewers', keys: ['lz-fermentery'], note: 'the spore-and-yam fermenting house: seven sunken lacquered mash vats under damp reed matting (59w-lz-works.js)' },
  { trade: 'tanners', keys: ['lz-hall-bone'], note: 'hides on frames and tanning share the bone hall' },
  { trade: 'shipwrights and boatbuilders', keys: ['lz-barge', 'lz-hall-reed'], note: 'eleven-rib waterproofed reed barges (59w-lz-works.js) lashed and lacquered in the reed hall; paddled on the terminal seas, never sailed' },
  { trade: 'innkeepers and grooms', na: 'no inns: they never trade or host strangers (DESIGN section 1)' },
  { trade: 'town guard', keys: ['lz-lookout', 'lk-watchtower', 'lk-gate', 'lk-slot'], note: 'lookouts and the capital\'s gate, Ley Slot and watchtowers' },
  { trade: 'coast guard', na: 'hostile terminal-sea shores watched from land lookouts and watchtowers, no maritime patrol service' },
  { trade: 'temple priests and servants', keys: ['lz-seer', 'lk-college'], note: 'the Interpreters (caste 5) keep the seer\'s hall and the college; the reliquary itself is shut and unstaffed' },
  { trade: 'shrine keepers', keys: ['lz-ley', 'lz-bells', 'lz-circle', 'lz-waystone'], note: 'the ley line shrine, the bell rack, the stone circle and the Coil waystones' },
  { trade: 'shopkeepers and assistants', na: 'there are no shops (DESIGN section 4): craft halls store their own goods' },
  { trade: 'smiths and craftsmen', keys: ['lz-hall-bronze', 'lk-bronzehall', 'lz-hall-reed', 'lz-makers', 'lk-makers'], note: 'the Great Bronze Hall and village bronze/reed halls, and the Makers\' quarters in cane and stone' },
  { trade: 'innkeepers and servers', na: 'no taverns: they eat in their castes\' dwellings and have no hospitality trade' },
  { trade: 'porters and warehousemen', keys: ['lz-warehouse', 'lz-granary', 'lk-granary', 'lk-dockstore', 'lz-wayhalt'], note: 'the plunder warehouse, village and capital Allotment granaries, the Lothal dock store and the 20 km Coil staging halts' },
  { trade: 'industrial workers', keys: ['lk-bronzehall', 'lk-boil', 'lz-hall-bronze'], note: 'Basilisk\'s seven-furnace Great Bronze Hall, the wet-season salt boiling floors and the bronze and stone halls' },
  { trade: 'power-house stokers and engineers', na: 'no electricity: bronze-age craft, wind and hand power' },
  { trade: 'household service', na: 'no servants: a reborn caste order, dwellings are communal' },
  { trade: 'soldiers', keys: ['lz-barracks', 'lz-muster', 'lz-lodge', 'lk-lodge', 'lk-greathall'], note: 'barracks, mustering ground, village and stone warriors\' lodges, the Hall of Intention' },
  { trade: 'teachers and scholars', keys: ['lk-college', 'lz-seer'], note: 'the Interpreters\' college and seer\'s hall; the Tenders also scribe' },
  { trade: 'guild officers and clerks', na: 'no guilds or coin; the castes allot work' },
  { trade: 'customs officers and clerks', na: 'they never trade, so there is nothing to tax' },
  { trade: 'healers and nurses', keys: ['lz-medicine', 'lz-nest', 'lk-nest'], note: 'medicine hut; the village and stone nest halls\' hospice' },
  { trade: 'priests and undertakers', na: 'no funerary rites: the dead are butchered as matter and the same mind is reborn (the bone hall carries the body work)' },
  { trade: 'lighthouse keepers', na: 'no night navigation beacons (signal fires are taboo; barges run by day along the strand or ley line)' },
  { trade: 'dockers and stevedores', keys: ['lk-dockstore', 'lz-barge'], note: 'the Lothal podium dock store with its horned bronze cargo crane and the reed barges on Basilisk\'s bay' },
  { trade: 'river bargemen and quay hands', keys: ['lz-barge', 'lk-dockstore'], note: 'paddled eleven-rib reed barges carrying Coil loads along the terminal seas and river mouths' },
  { trade: 'fishers', keys: ['lz-weir', 'lz-skimmer'], note: 'the fishing weir and drying racks and Gila\'s lakecake skimming jetty (59w-lz-works.js)' },
  { trade: 'market traders', na: 'no markets: they never trade' },
  { trade: 'farmhands and ploughmen', keys: ['lz-farm', 'lz-longhouse', 'lk-longhouse'], note: 'the Drovers\' farm and their village and stone rib houses' },
  { trade: 'chinampa growers', na: 'dry fields on the Rift floor, no raised water beds' },
  { trade: 'orchardmen', keys: ['lz-orchard'], note: 'the walled Rift fruit, bell-date and aril-pod grove (59w-lz-works.js)' },
  { trade: 'miners', keys: ['lz-mine', 'lz-placer'], note: 'the mine head (Tuatara\'s copper and sulfur) and the placer floor (Komodo and Iguana\'s tin), 59w-lz-works.js, 2026-11-17' },
  { trade: 'quarrymen and masons', keys: ['lz-quarry', 'lz-hall-bronze'], note: 'the basalt quarry pit and splitting yard (59w-lz-works.js) and the bronze and stone hall' },
  { trade: 'granary keepers and millers', keys: ['lz-granary', 'lk-granary', 'lz-windmill'], note: 'village and stone Mohenjo-daro granaries and the panemone windmill' },
  { trade: 'beetle herders', na: 'no beetles in the Rift; their stock is frilled lizards and hexapods' },
  { trade: 'dairymen', na: 'reptilian stock gives no milk' },
  { trade: 'swineherds and duck keepers', keys: ['lz-farm'], note: 'the farm\'s frilled-lizard pen stands for small livestock' },
  { trade: 'mushroom growers', na: 'the spore flora of the nest hall is pathogen, not a crop; they grow no mushrooms' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', keys: ['lz-barge'], note: 'reed barges ferrying relics straight along Basilisk\'s ley line and crossing the Western Terminal Sea narrows' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs; their draught animals are the burden beast and hexapods' },
  { trade: 'monks and lay brothers', keys: ['lk-college', 'lk-tower', 'lz-tower'], note: 'the Interpreters\' college and houses (stone in Basilisk, earth-and-brick in the villages): the nearest thing to a cloistered order' },
  { trade: 'palace and canton staffs', keys: ['lk-greathall'], note: 'the Hall of Intention (the Interpreters in concert)' }
];
globalThis.LZ_TRADES = LZ_TRADES;
