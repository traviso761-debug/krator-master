/* ======================================================================
   GI_TRADES: the census table [G data]. Every trade of the Voth city's census (tools/trades_census.json, the list
   IS_TRADES and BR_TRADES carry), and the Girder buildings that carry it, or `na` and why a village of the crater has
   none, or `gap` and what building is missing. Plain data, no three.js and no DOM; tools/check_trades.py reads it (and
   verify.py --assert runs it as 'voth-trades'): every census trade has a row, every key is a quoted literal in this
   build's src, and a row stripped of keys, na and gap is caught.
   The table records what EXISTS (2026-10-19). Girder is an outlying Beast Rider village of a few hundred in a
   four-tower ruin, no electricity: its buildings are the tower slots (br_bldg_girder_dwelling and its #1 to #4
   programmes: store, workshop with a forge, common hall, shrine), the ground houses (br_bldg_girder_house), the
   Assembly Hall (br_bldg_girder_assembly_hall), the roost decks and keepers' shelters (br_bldg_girder_roost_deck),
   and the REGISTERed sites of the terrace: stall, plot (crop, paddy, orchard, garden, pen), palisade, watch, gate.
   ====================================================================== */
const GI_TRADES = [
  { trade: 'bakers', keys: [], gap: 'a bake house with its clay ovens (the kitchens bake at home; no bakery)' },
  { trade: 'butchers', keys: [], gap: 'a butcher\'s shop and smokehouse (a Dried meats stall only)' },
  { trade: 'weavers and dyers', keys: ['stall'], note: 'the Weaver stall and the workshop slots', gap: 'a weaving house and a dye works' },
  { trade: 'brewers', keys: [], gap: 'a brewhouse (mead hall)' },
  { trade: 'tanners', keys: [], gap: 'a tannery (pit shed with its bark mill)' },
  { trade: 'shipwrights and boatbuilders', na: 'a crater village with a brook, no water to float a hull on' },
  { trade: 'innkeepers and grooms', keys: ['br_bldg_girder_roost_deck', 'roost', 'keeper'], note: 'the roost hands and keepers tend the flyers; strangers\' mounts perch on the decks', gap: 'an inn for guests' },
  { trade: 'town guard', keys: ['palisade', 'watch', 'gate'], note: 'the palisade, its wall-walk, watch posts and gatehouses' },
  { trade: 'coast guard', na: 'no coast: the village stands in the crater hyperjungle, far from the sea' },
  { trade: 'temple priests and servants', keys: [], gap: 'a temple hall for the five nature shrines (only a shrine slot in a tower)' },
  { trade: 'shrine keepers', keys: ['br_bldg_girder_dwelling'], note: 'the shrine programme (#4) of a tower slot' },
  { trade: 'shopkeepers and assistants', keys: ['stall'], note: 'market stalls only; no shophouse' },
  { trade: 'smiths and craftsmen', keys: ['br_bldg_girder_dwelling', 'stall'], note: 'the workshop slot with its forge (#2); the Potter, Fletcher and Rope & cord stalls' },
  { trade: 'innkeepers and servers', keys: [], gap: 'a mead hall or tavern' },
  { trade: 'porters and warehousemen', keys: ['br_bldg_girder_dwelling'], note: 'the store programme (#1) of a tower slot' },
  { trade: 'industrial workers', na: 'a village of a few hundred with no works; what is made is made by hand in the workshop slots' },
  { trade: 'power-house stokers and engineers', na: 'the Beast Riders have no electricity: no power house; the lifts are drawn by beasts at a capstan' },
  { trade: 'household service', keys: ['br_bldg_girder_house', 'br_bldg_girder_dwelling'] },
  { trade: 'soldiers', keys: [], gap: 'a Wing\'s barracks (the sentries sleep in their homes)' },
  { trade: 'teachers and scholars', keys: [], gap: 'a lore house and riding school' },
  { trade: 'guild officers and clerks', keys: ['br_bldg_girder_assembly_hall'], note: 'no guilds: the riders\' assembly meets in the hall' },
  { trade: 'customs officers and clerks', keys: [], gap: 'a toll house at the gatehouse where strangers\' loads are tallied' },
  { trade: 'healers and nurses', keys: [], gap: 'a house of healing' },
  { trade: 'priests and undertakers', keys: [], gap: 'a funerary court with its pyre stone' },
  { trade: 'lighthouse keepers', na: 'no coast and no water to guide a ship over' },
  { trade: 'dockers and stevedores', na: 'no harbour: a brook and a crater' },
  { trade: 'river bargemen and quay hands', na: 'the brook is too small to carry a barge' },
  { trade: 'fishers', na: 'the brook is a trickle; the villagers farm and ride rather than fish' },
  { trade: 'market traders', keys: ['stall'], note: 'eight kinds of stall round the market' },
  { trade: 'farmhands and ploughmen', keys: ['plot'], note: 'crop rows and the kitchen gardens' },
  { trade: 'chinampa growers', keys: ['plot'], note: 'the paddy plots' },
  { trade: 'orchardmen', keys: ['plot'], note: 'the pod orchards' },
  { trade: 'miners', keys: [], gap: 'a mine head, if resource nodes lie near the crater' },
  { trade: 'quarrymen and masons', keys: [], gap: 'a quarry (the ruin is salvaged instead)' },
  { trade: 'granary keepers and millers', keys: [], gap: 'a granary and a beast-turned mill (grain sits in the store slots)' },
  { trade: 'beetle herders', na: 'the Staghorn tribe\'s beetles (LORE 6.6) are not Girder\'s: it keeps millipedes and flyers' },
  { trade: 'dairymen', keys: [], gap: 'a beast shed for milk stock' },
  { trade: 'swineherds and duck keepers', keys: ['plot'], note: 'the millipede pen is the village\'s herd', gap: 'sties and duck coops' },
  { trade: 'mushroom growers', keys: [], gap: 'a fungus house (dark-grown fungus under the towers)' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'no river to cross: the bridges are rope and log' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs: the riders\' carriers are the flyers at the roost decks' },
  { trade: 'monks and lay brothers', keys: [], gap: 'a temple precinct for the keepers of the Green Silence' },
  { trade: 'palace and canton staffs', na: 'an outlying village: no palace and no canton seat; the assembly hall serves' }
];
globalThis.GI_TRADES = GI_TRADES;
