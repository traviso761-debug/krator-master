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
  { trade: 'bakers', keys: [], gap: 'a bake house or yam oven: the farm and windmill make flour, nothing bakes it' },
  { trade: 'butchers', keys: ['lz-hall-bone'], note: 'the bone hall: carcasses on hooks, hides, sorted bone (DESIGN section 5)' },
  { trade: 'weavers and dyers', keys: ['lz-hall-reed'], note: 'reed, weaving and lacquer hall: mats, screens, baskets, lacquer; no garments' },
  { trade: 'brewers', keys: [], gap: 'a fermenting house (spore or yam drink); none drawn' },
  { trade: 'tanners', keys: ['lz-hall-bone'], note: 'hides on frames and tanning share the bone hall' },
  { trade: 'shipwrights and boatbuilders', na: 'the Rift floor is landlocked; the Lizardmen have no boats' },
  { trade: 'innkeepers and grooms', na: 'no inns: they never trade or host strangers (DESIGN section 1)' },
  { trade: 'town guard', keys: ['lz-lookout', 'lk-watchtower', 'lk-gate'], note: 'lookouts and the capital\'s gate and watchtowers' },
  { trade: 'coast guard', na: 'landlocked Rift floor, no coast to guard' },
  { trade: 'temple priests and servants', keys: ['lz-seer', 'lk-college'], note: 'the Interpreters (caste 5) keep the seer\'s hall and the college; the reliquary itself is shut and unstaffed' },
  { trade: 'shrine keepers', keys: ['lz-ley', 'lz-bells', 'lz-circle'], note: 'the ley line shrine, the bell rack and the stone circle' },
  { trade: 'shopkeepers and assistants', na: 'there are no shops (DESIGN section 4): craft halls store their own goods' },
  { trade: 'smiths and craftsmen', keys: ['lz-hall-bronze', 'lz-hall-reed', 'lz-makers'], note: 'bronze and stone hall (bronze only, no iron), reed hall, the Makers\' quarters' },
  { trade: 'innkeepers and servers', na: 'no taverns: they eat in their castes\' dwellings and have no hospitality trade' },
  { trade: 'porters and warehousemen', keys: ['lz-warehouse', 'lz-granary'], note: 'the warehouse of unused plunder, the granary' },
  { trade: 'industrial workers', keys: ['lz-hall-bronze'], note: 'casting and stonecutting are the largest works they have' },
  { trade: 'power-house stokers and engineers', na: 'no electricity: bronze-age craft, wind and hand power' },
  { trade: 'household service', na: 'no servants: a reborn caste order, dwellings are communal' },
  { trade: 'soldiers', keys: ['lz-barracks', 'lz-muster', 'lz-lodge', 'lk-greathall'], note: 'barracks, mustering ground, the warriors\' lodge, the warlord\'s hall' },
  { trade: 'teachers and scholars', keys: ['lk-college', 'lz-seer'], note: 'the Interpreters\' college and seer\'s hall; the Tenders also scribe' },
  { trade: 'guild officers and clerks', na: 'no guilds or coin; the castes allot work' },
  { trade: 'customs officers and clerks', na: 'they never trade, so there is nothing to tax' },
  { trade: 'healers and nurses', keys: ['lz-medicine', 'lz-nest'], note: 'medicine hut; the nest hall\'s hospice' },
  { trade: 'priests and undertakers', na: 'no funerary rites: the dead are butchered as matter and the same mind is reborn (the bone hall carries the body work)' },
  { trade: 'lighthouse keepers', na: 'landlocked, no sea or lake traffic to light' },
  { trade: 'dockers and stevedores', na: 'landlocked, no harbour' },
  { trade: 'river bargemen and quay hands', na: 'they do not trade by water; no river quay wanted' },
  { trade: 'fishers', keys: [], gap: 'a small fishing weir or drying rack on the Rift\'s water' },
  { trade: 'market traders', na: 'no markets: they never trade' },
  { trade: 'farmhands and ploughmen', keys: ['lz-farm', 'lz-longhouse'], note: 'the Drovers\' farm (placeholder crops) and their long house' },
  { trade: 'chinampa growers', na: 'dry fields on the Rift floor, no raised water beds' },
  { trade: 'orchardmen', keys: [], gap: 'an orchard of Rift fruit trees; the farm has frill greens, pods and yam only' },
  { trade: 'miners', keys: [], gap: 'a mine head: the bronze hall casts, but no ore workings are drawn' },
  { trade: 'quarrymen and masons', keys: ['lz-hall-bronze'], gap: 'a quarry: the bronze and stone hall cuts stone but the basalt comes from nowhere drawn' },
  { trade: 'granary keepers and millers', keys: ['lz-granary', 'lz-windmill'], note: 'the Mohenjo-daro granary and the panemone windmill' },
  { trade: 'beetle herders', na: 'no beetles in the Rift; their stock is frilled lizards and hexapods' },
  { trade: 'dairymen', na: 'reptilian stock gives no milk' },
  { trade: 'swineherds and duck keepers', keys: ['lz-farm'], note: 'the farm\'s frilled-lizard pen stands for small livestock' },
  { trade: 'mushroom growers', na: 'the spore flora of the nest hall is pathogen, not a crop; they grow no mushrooms' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'landlocked and no waterways crossed by trade' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs; their draught animals are the burden beast and hexapods' },
  { trade: 'monks and lay brothers', keys: ['lk-college', 'lz-tower'], note: 'the Interpreters\' college and house: the nearest thing to a cloistered order' },
  { trade: 'palace and canton staffs', keys: ['lk-greathall'], note: 'the warlord\'s great hall' }
];
globalThis.LZ_TRADES = LZ_TRADES;
