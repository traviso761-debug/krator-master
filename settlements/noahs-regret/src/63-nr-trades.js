// prefix: nr
/* ======================================================================
   Noah's Regret: the census of the Voth city's trades (2026-10-19) [G data]. NR_TRADES says, for each of the 44 trades of
   tools/trades_census.json, which room, building or pier of this build carries it (keys: NR.ROOMS / NR.ZONES / NR.FORE_HALLS
   ids and the deck-building defs), why it cannot exist here (na) or what is missing (gap; keys and a gap together =
   partly carried). It is a table of what exists: no drawing, no browser. tools/check_trades.py reads it (verify.py
   asserts 'voth-trades'); KNOWN_ISSUES.md lists the gaps. The build is one grounded Ancient arcology that Bloody Ruephus's
   pirates hold: a crew's base, not a city, so its trades are a ship's and a garrison's.
   ====================================================================== */
const NR_TRADES = [
 {trade:'bakers', keys:[], gap:'a bakery: the galleys cook but no ovens are drawn'},
 {trade:'butchers', keys:[], gap:'a butchery or smokehouse'},
 {trade:'weavers and dyers', keys:['sailloft'], gap:'no dye works; the sail loft stands for the cloth trade', note:'the sail loft (D4)'},
 {trade:'brewers', keys:[], gap:'a still or brewhouse: the grog is only served (the forward hall)'},
 {trade:'tanners', keys:[], gap:'a tannery'},
 {trade:'shipwrights and boatbuilders', keys:['carpenter','cooper'], gap:'a slipway or boat yard: the harbour has no ships and the carpenter\'s and cooper\'s shops only repair', note:'the ship\'s carpenter and cooper'},
 {trade:'innkeepers and grooms', na:'no caravans or beasts of burden aboard a ship; the crews have no stables'},
 {trade:'town guard', keys:['brig'], gap:'a watch house: the brig is the only guard post', note:'NR_FACTION activity watch: GUARD'},
 {trade:'coast guard', na:'the pirates are the coast\'s outlaws: the base keeps no coast guard'},
 {trade:'temple priests and servants', keys:['chapel']},
 {trade:'shrine keepers', keys:['chapel']},
 {trade:'shopkeepers and assistants', keys:['fwd-hall','plaza'], note:'the pirates\' market in the forward hall; the stalls on the forecourt plaza'},
 {trade:'smiths and craftsmen', keys:['carpenter','cooper'], gap:'a forge: the engine room holds only a pirates\' workshop', note:'the carpenter\'s and cooper\'s shops'},
 {trade:'innkeepers and servers', keys:['fwd-hall','mess-s','mess-p','dining','wardroom'], note:'the grog hall, the crew messes, the great dining room, the wardroom'},
 {trade:'porters and warehousemen', keys:['fwd-store','bosun'], note:'the forward store; the bosun\'s store'},
 {trade:'industrial workers', na:'no industry: the Ancients\' machinery is stripped or dead and the pirates work by hand'},
 {trade:'power-house stokers and engineers', na:'the twin engine rooms (engine-s, engine-p) have been silent a thousand years; the pirates burn lanterns and fires'},
 {trade:'household service', na:'a crew\'s base: no rich houses or manors; Ruephus\'s headquarters is served from the barracks'},
 {trade:'soldiers', keys:['nr-anc-apt-ribbon','nr-anc-apt-drum','nr-anc-office-lens','armoury','fwd-drill'], note:'the barracks (the apartments and offices), the armoury and the drill hall'},
 {trade:'teachers and scholars', keys:[], gap:'a school or a reading room: the Reliquary (nr-anc-reliquary) is the pirates\' headquarters, not a library'},
 {trade:'guild officers and clerks', na:'a crew under one captain: no guilds'},
 {trade:'customs officers and clerks', na:'a pirate base: it levies no customs (the purser\'s strongroom keeps the loot)'},
 {trade:'healers and nurses', keys:['sickbay-s','sickbay-p'], note:'the two sick bays'},
 {trade:'priests and undertakers', keys:['chapel'], gap:'no burial ground or undertaker'},
 {trade:'lighthouse keepers', keys:[], gap:'a keeper\'s room at the harbour-mouth beacons (drawn in 40-nr-hull.js, unmanned)'},
 {trade:'dockers and stevedores', keys:['pier-mole','nr-pirate-float'], note:'the liner mole and the pirates\' floats; no ships lie in the basin yet'},
 {trade:'river bargemen and quay hands', na:'a sea harbour, no river'},
 {trade:'fishers', keys:[], gap:'a fishing dock and drying racks on the inner quay'},
 {trade:'market traders', keys:['fwd-hall','plaza'], note:'the market and the plaza stalls'},
 {trade:'farmhands and ploughmen', keys:['greenhouse'], note:'the greenhouse beds (D4)'},
 {trade:'chinampa growers', na:'no lake: the greenhouse beds and the top-deck meadow stand in for them'},
 {trade:'orchardmen', na:'the park trees are placeholders (KNOWN_ISSUES); no orchard on a ship\'s top deck'},
 {trade:'miners', na:'a grounded ship: no ore'},
 {trade:'quarrymen and masons', na:'a grounded ship of Ancient steel and glass: no stone to cut'},
 {trade:'granary keepers and millers', keys:[], gap:'a granary or mill: the forward store holds loot, not grain'},
 {trade:'beetle herders', na:'no beetles kept aboard'},
 {trade:'dairymen', na:'no cattle aboard a ship'},
 {trade:'swineherds and duck keepers', na:'no livestock pens aboard a ship'},
 {trade:'mushroom growers', na:'no fungus farms: the greenhouse grows the ship\'s greens'},
 {trade:'envoys and embassy staff', na:'tabled until embassies have an in-game purpose'},
 {trade:'ferrymen', keys:[], gap:'a ferry stage on the pirates\' floats (nr-pirate-float is a boat landing only)'},
 {trade:'elephant bug handlers and station hands', na:'no elephant bugs aboard'},
 {trade:'monks and lay brothers', na:'no monastery: the chapel serves the crew'},
 {trade:'palace and canton staffs', keys:['nr-anc-reliquary','bridge'], note:'Ruephus\'s headquarters under his flag; the bridge'}
];
globalThis.NR_TRADES=NR_TRADES;
