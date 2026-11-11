/* ======================================================================
   The Ancient Port kit: the census of the Voth city's trades (2026-10-19) [G data]. PORT_TRADES says, for each of the 44
   trades of tools/trades_census.json, which segment or vessel of this kit houses it (keys: PORT_SEG / PORT_VESSEL
   keys), why it is not a port segment's work (na) or what is missing (gap; keys and a gap together = partly carried).
   This is a KIT of quays, docks and harbours, not a town: the harbour, customs, shipwright and dock rows are its own and
   the town trades (bakers, priests, teachers, farmers ...) belong to Hook's town buildings, so they are na here. A table of
   what exists: no drawing, no browser. tools/check_trades.py reads it (verify.py asserts 'voth-trades'); KNOWN_ISSUES.md
   lists the gaps.
   ====================================================================== */
const PORT_TRADES = [
 {trade:'bakers', na:'a town trade: Hook\'s town houses its bakers, not a quay segment'},
 {trade:'butchers', na:'a town trade: Hook\'s town houses its butchers, not a quay segment'},
 {trade:'weavers and dyers', na:'a town trade: not a port segment\'s work'},
 {trade:'brewers', na:'a town trade: not a port segment\'s work'},
 {trade:'tanners', na:'a town trade: not a port segment\'s work'},
 {trade:'shipwrights and boatbuilders', keys:['ddYard','ddDock','ddShed'], note:'the boat yard and slipway; the graving dock and its covered form'},
 {trade:'innkeepers and grooms', keys:[], gap:'a travellers\' hostel by the passenger terminal (tmPass)'},
 {trade:'town guard', keys:[], gap:'a watch house on the quays (the Port Authority\'s gatehouses exist only in its reclaimed state)'},
 {trade:'coast guard', keys:['hbHaven'], note:'the lifeboat house, slipway and harbour office'},
 {trade:'temple priests and servants', na:'a town trade: Hook\'s temples stand in its town, not on the quays'},
 {trade:'shrine keepers', na:'a town trade: not a port segment\'s work'},
 {trade:'shopkeepers and assistants', keys:[], gap:'a chandlery or harbour shop'},
 {trade:'smiths and craftsmen', keys:['ddYard'], note:'the yard\'s fabrication shed and plate-rolling hall'},
 {trade:'innkeepers and servers', keys:[], gap:'a harbour tavern or seamen\'s mess'},
 {trade:'porters and warehousemen', keys:['cgStore','lbStores'], note:'the warehouses and storage; the land block of stores'},
 {trade:'industrial workers', keys:['ddYard','lbTanks','lbStores'], note:'the yard\'s fabrication halls, the fuel-tank farm, the silos'},
 {trade:'power-house stokers and engineers', keys:[], gap:'a port power house or substation (the tank farm holds fuel only)'},
 {trade:'household service', na:'no rich houses: the housing is poor container and silo dwellings (chStack, chCourt, chTank)'},
 {trade:'soldiers', keys:['slPen','slBerth'], note:'the submarine pen and the deep-water berth (slCarrier and slSub are the vessels)'},
 {trade:'teachers and scholars', na:'a town trade: not a port segment\'s work'},
 {trade:'guild officers and clerks', keys:['lbAuthority'], note:'the Port Authority\'s administration complex'},
 {trade:'customs officers and clerks', keys:['tmShip'], note:'the customs and operations building'},
 {trade:'healers and nurses', na:'a town trade: not a port segment\'s work'},
 {trade:'priests and undertakers', na:'a town trade: not a port segment\'s work'},
 {trade:'lighthouse keepers', keys:['hbHaven'], note:'the lighthouse on the breakwater head'},
 {trade:'dockers and stevedores', keys:['quay','pier','cgBox','cgCrane','tmShip'], note:'the working quay and great pier, the container dock and its cranes, the shipping terminal'},
 {trade:'river bargemen and quay hands', na:'a sea port: the kit has no river quay'},
 {trade:'fishers', keys:['hbFish'], note:'the fishing harbour'},
 {trade:'market traders', keys:['cgStore'], note:'the reclaimed (decay 3) covered markets in its halls and under its canopy'},
 {trade:'farmhands and ploughmen', na:'a quay: the farms belong to the town behind it'},
 {trade:'chinampa growers', na:'a quay: no gardens on water'},
 {trade:'orchardmen', na:'a quay: the orchards belong to the town behind it'},
 {trade:'miners', na:'a quay: no ore here'},
 {trade:'quarrymen and masons', na:'a quay: the stone is quarried for it elsewhere'},
 {trade:'granary keepers and millers', keys:['lbStores','cgStore'], gap:'no mill: the board-formed silos with their elevator tower store bulk goods only', note:'the silos'},
 {trade:'beetle herders', na:'no beetles kept on the Ancient quays'},
 {trade:'dairymen', na:'a town trade: not a port segment\'s work'},
 {trade:'swineherds and duck keepers', na:'a town trade: not a port segment\'s work'},
 {trade:'mushroom growers', na:'no fungus farms on the quays'},
 {trade:'envoys and embassy staff', na:'tabled until embassies have an in-game purpose'},
 {trade:'ferrymen', keys:[], gap:'a ferry landing (hbHaven has a small landing pontoon, tmPass the liner berth; neither runs a ferry)'},
 {trade:'elephant bug handlers and station hands', na:'no elephant bugs on the Ancient quays'},
 {trade:'monks and lay brothers', na:'a town trade: no monastery on the quays'},
 {trade:'palace and canton staffs', keys:['lbAuthority'], note:'the Port Authority, whose reclaimed state is the fortress palace with its throne-hall court'}
];
globalThis.PORT_TRADES=PORT_TRADES;
