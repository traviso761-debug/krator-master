/* ======================================================================
   YU_TRADES: the census table [G data]. Every trade of the Voth city's census (tools/trades_census.json, the list
   IS_TRADES and BR_TRADES carry), and the Yuni buildings that carry it, or `na` and why a valley city of the Order
   and the Emir has none, or `gap` and what building is missing. Plain data, no three.js and no DOM;
   tools/check_trades.py reads it (and verify.py --assert runs it as 'voth-trades'): every census trade has a row,
   every key is a quoted literal in this build's src, and a row stripped of keys, na and gap is caught.
   The table records what EXISTS (2026-10-19), on the world page (yuni.html); the building sheet and the plants page
   are flavours of the same source. The keys are the ASSETs of 55-59 (the Yuni houses, trades, civic and park
   pieces, the Emir's palace of the rich band), of 61d (the Ancients' ruins that stand in and over the city: the
   Foundry, the Cloister hospital, the Crown library, the Well fuel station) and the wall's gate towers (50-structure).
   The Order's electric runs from the Vault; the Emir's town burns oil.
   ====================================================================== */
const YU_TRADES = [
  { trade: 'bakers', keys: [], gap: 'a bakery with its ovens (the shop-houses sell bread but bake at home)' },
  { trade: 'butchers', keys: [], gap: 'a butcher\'s shop and slaughter yard' },
  { trade: 'weavers and dyers', keys: ['trade_dyer_yard', 'trade_craft_shed'], note: 'the dyer\'s yard with its vats; the weaver\'s and carpenter\'s shed' },
  { trade: 'brewers', keys: [], gap: 'a brewhouse or date-wine press' },
  { trade: 'tanners', keys: [], gap: 'a tannery' },
  { trade: 'shipwrights and boatbuilders', na: 'a valley city of the desert road with a canal: no water to float a hull on' },
  { trade: 'innkeepers and grooms', keys: ['trade_caravanserai'], note: 'the caravanserai of the desert road: yard, stables, rooms' },
  { trade: 'town guard', keys: ['gatetower', 'civic_bell_tower'], note: 'the wall\'s gate towers and sentry towers; the watch-and-bell tower' },
  { trade: 'coast guard', na: 'a landlocked valley: no coast' },
  { trade: 'temple priests and servants', keys: [], gap: 'a temple or mosque hall (the Sankore spire is a tower, not a prayer hall)' },
  { trade: 'shrine keepers', keys: [], gap: 'a wayside shrine for the farms and the Thatch' },
  { trade: 'shopkeepers and assistants', keys: ['trade_shop_house'] },
  { trade: 'smiths and craftsmen', keys: ['trade_smithy', 'trade_potter_yard', 'trade_craft_shed'], note: 'the open forge; the potter\'s yard with its beehive kiln; the carpenter\'s shed' },
  { trade: 'innkeepers and servers', keys: ['trade_tavern'], note: 'the tavern with its shaded yard' },
  { trade: 'porters and warehousemen', keys: [], gap: 'a warehouse (the life layer\'s carts load at the market halls and a depot, which have no building of their own)' },
  { trade: 'industrial workers', keys: ['ancient_factory', 'ancient_fuel'], note: 'the Foundry, where the factory workers work 6 to 18; the Well fuel station' },
  { trade: 'power-house stokers and engineers', keys: [], gap: 'a power house (the Order\'s electric runs from the Vault; no engine hall or stokers are modelled)' },
  { trade: 'household service', keys: ['rich_family_compound', 'rich_merchant_palace', 'rich_tower_house', 'rich_emir_palace'] },
  { trade: 'soldiers', keys: [], gap: 'a barracks for the wall\'s garrison (the towers have no quarters)' },
  { trade: 'teachers and scholars', keys: ['civic_school', 'civic_library', 'civic_archive'], note: 'the School of the Order; the Library of Yuni; the Archive' },
  { trade: 'guild officers and clerks', keys: ['civic_hall_records'], note: 'the Hall of Records; the Order\'s clerks' },
  { trade: 'customs officers and clerks', keys: [], gap: 'a customs house at the Caravan Gate' },
  { trade: 'healers and nurses', keys: ['ancient_hospital'], note: 'the Cloister, the Ancient hospital the academics work at' },
  { trade: 'priests and undertakers', keys: [], gap: 'a funerary court or cemetery chapel' },
  { trade: 'lighthouse keepers', na: 'a landlocked valley: no coast to light' },
  { trade: 'dockers and stevedores', na: 'a landlocked valley: no harbour; goods come on the desert road' },
  { trade: 'river bargemen and quay hands', na: 'the canal is an irrigation cut in a semiarid valley, not a trade route' },
  { trade: 'fishers', na: 'a semiarid valley: no water to fish' },
  { trade: 'market traders', keys: ['prop_market_stall', 'prop_market_tent', 'trade_market_hall'], note: 'the great market circle: four halls and four rings of stalls and tents' },
  { trade: 'farmhands and ploughmen', keys: ['poor_compound', 'prop_granary'], note: 'the farmstead on one plot in five: a compound with its granary, well and stock pen' },
  { trade: 'chinampa growers', na: 'a semiarid valley: irrigated fields along the canal, no sunken beds' },
  { trade: 'orchardmen', keys: [], gap: 'an olive and date-palm grove with its farmhouse (the trees exist as plants only)' },
  { trade: 'miners', keys: [], gap: 'a mine head, if resource nodes lie in the butte' },
  { trade: 'quarrymen and masons', keys: [], gap: 'a quarry (stone for the viaducts and the wall)' },
  { trade: 'granary keepers and millers', keys: ['prop_granary'], note: 'the granary on stilts', gap: 'a mill' },
  { trade: 'beetle herders', na: 'the beetles are the Beast Riders\' stock (LORE 6.6); the valley herds goats and oxen' },
  { trade: 'dairymen', keys: [], gap: 'a dairy (milk herd and byre)' },
  { trade: 'swineherds and duck keepers', keys: ['prop_animal_pen'], note: 'the thorn-fenced stock pen', gap: 'duck coops by the canal' },
  { trade: 'mushroom growers', na: 'a dry valley: no dark damp cellars for a fungus farm in the Yuni lore' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'the canal is crossed by bridges and the viaduct: no ferry' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs: the carts are drawn by oxen and camels' },
  { trade: 'monks and lay brothers', keys: ['civic_chapter_house', 'ancient_apartments_cobs'], note: 'the saffron-robed monks of the Order: the Historians\' chapter house; they sleep in the corn-cob apartments' },
  { trade: 'palace and canton staffs', keys: ['rich_emir_palace', 'civic_hall_records'], note: 'the Emir\'s palace and the Order\'s clerks' }
];
globalThis.YU_TRADES = YU_TRADES;
