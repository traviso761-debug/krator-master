/* ======================================================================
   MR_TRADES: the census table [G data]. Every trade of the Voth city's census (tools/trades_census.json, the list
   IS_TRADES and BR_TRADES carry), and the Mav's Refuge buildings that carry it, or `na` and why a refuge of the
   riders has none, or `gap` and what building is missing. Plain data, no three.js and no DOM; tools/check_trades.py
   reads it (and verify.py --assert runs it as 'voth-trades'): every census trade has a row, every key is a quoted
   literal in this build's src, and a row stripped of keys, na and gap is caught.
   The table records what EXISTS (2026-10-19). The keys are the REGISTER kinds of 55-arch.js / 50-structure.js /
   56-levels.js: the ring lots (home, fancy, shop, tavern, inn, shrine, barracks, armoury, mess, store, silkhouse), the
   levels below the decks (workshop, storehouse, kitchen, roost, gatehouse, guardhut, winch), and the sites (council,
   market, stall, proving, muster, farm, guardpost, waypost, signal, well, lift, landing). The shops are named from
   N_SHOP (a Baker, a Cooper, a Saddler, a Potter, a Weaver, a Fletcher ...). No electricity: fire and oil, beast-drawn
   lifts.
   ====================================================================== */
const MR_TRADES = [
  { trade: 'bakers', keys: ['shop'], note: 'a Baker among the shop names (N_SHOP); no bake house with ovens' },
  { trade: 'butchers', keys: [], gap: 'a butcher\'s shop and smokehouse (no butcher among the shop names)' },
  { trade: 'weavers and dyers', keys: ['silkhouse'], note: 'the silk houses with their looms and cloth lines', gap: 'a dye works' },
  { trade: 'brewers', keys: [], gap: 'a brewhouse (the taverns and the mess have kitchens only)' },
  { trade: 'tanners', keys: [], gap: 'a tannery (pit shed with its bark mill)' },
  { trade: 'shipwrights and boatbuilders', keys: [], gap: 'a canoe shed on the river or the lee shore (small: a double-hulled voyaging canoe)' },
  { trade: 'innkeepers and grooms', keys: ['inn', 'roost'], note: 'the inn; the roost levels\' hands keep the guests\' mounts' },
  { trade: 'town guard', keys: ['guardpost', 'waypost', 'gatehouse', 'guardhut'] },
  { trade: 'coast guard', keys: [], gap: 'a shore watch and a war-canoe shed (the Wings patrol from the air)' },
  { trade: 'temple priests and servants', keys: ['shrine'], note: 'the nature shrines of the ring lots', gap: 'a temple hall for the five shrines' },
  { trade: 'shrine keepers', keys: ['shrine'] },
  { trade: 'shopkeepers and assistants', keys: ['shop', 'stall'], note: 'the shop with the family upstairs; market stalls' },
  { trade: 'smiths and craftsmen', keys: ['workshop', 'armoury', 'shop'], note: 'the workshop levels (live/work), the armoury; Cooper, Saddler, Fletcher, Potter and Carver among the shops' },
  { trade: 'innkeepers and servers', keys: ['tavern', 'inn'] },
  { trade: 'porters and warehousemen', keys: ['store', 'storehouse'] },
  { trade: 'industrial workers', na: 'no works with engines: the riders have no electricity; what is made is made in the workshop levels' },
  { trade: 'power-house stokers and engineers', na: 'the Beast Riders have no electricity: no power house; the lifts are drawn by beasts at a capstan' },
  { trade: 'household service', keys: ['fancy', 'home'], note: 'the rider-captains\' houses' },
  { trade: 'soldiers', keys: ['barracks', 'armoury', 'mess', 'muster'], note: 'a Wing\'s barracks, armoury and mess; the mustering ground' },
  { trade: 'teachers and scholars', keys: [], gap: 'a lore house and riding school (the proving ground trains riders only)' },
  { trade: 'guild officers and clerks', keys: ['council'], note: 'no guilds: the tribes\' council and its tally-keepers (the council chamber, the store\'s tally clerk)' },
  { trade: 'customs officers and clerks', keys: [], gap: 'a toll house at the gate yard where strangers\' loads are tallied' },
  { trade: 'healers and nurses', keys: [], gap: 'a house of healing (and the beast-healer\'s)' },
  { trade: 'priests and undertakers', keys: ['shrine'], note: 'the shrines', gap: 'a funerary court with its pyre stone' },
  { trade: 'lighthouse keepers', keys: ['signal'], note: 'the signal drum and horn towers and the lantern masts: no lamp-house' },
  { trade: 'dockers and stevedores', keys: ['landing'], note: 'the landing stage of a lift: loads go up by beast-drawn lift', gap: 'a river or shore landing for cargo canoes' },
  { trade: 'river bargemen and quay hands', keys: [], gap: 'a river landing with a beast-worked crane' },
  { trade: 'fishers', keys: [], gap: 'a fishers\' landing on the river or the shore' },
  { trade: 'market traders', keys: ['market', 'stall'], note: 'the City Market and its stalls' },
  { trade: 'farmhands and ploughmen', keys: ['farm'], note: 'the bough farms: raised crop beds' },
  { trade: 'chinampa growers', keys: ['farm'], note: 'raised beds on the platforms (no paddies)' },
  { trade: 'orchardmen', keys: [], gap: 'orchard terraces and their farmhouses' },
  { trade: 'miners', keys: [], gap: 'a mine head with a beast whim' },
  { trade: 'quarrymen and masons', keys: [], gap: 'a quarry' },
  { trade: 'granary keepers and millers', keys: [], gap: 'a granary and a beast-turned mill (grain sits in the storehouses)' },
  { trade: 'beetle herders', keys: [], gap: 'a beetle pen (Staghorn tribe, LORE 6.6), if a Staghorn quarter is wanted' },
  { trade: 'dairymen', keys: [], gap: 'a beast shed for milk stock' },
  { trade: 'swineherds and duck keepers', keys: [], gap: 'sties and duck coops' },
  { trade: 'mushroom growers', keys: [], gap: 'a fungus house (dark-grown fungus, glow fungus for lamps)' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', keys: [], gap: 'a ferry landing on the river (a raft on a rope)' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs: the riders\' carriers are the flyers at the roost levels and the lifts\' draught beasts' },
  { trade: 'monks and lay brothers', keys: [], gap: 'a temple precinct for the keepers of the Green Silence' },
  { trade: 'palace and canton staffs', keys: ['council'], note: 'the Council Chamber, seat of the Refuge' }
];
globalThis.MR_TRADES = MR_TRADES;
