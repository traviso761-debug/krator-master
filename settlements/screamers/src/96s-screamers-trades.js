/* ============================== THE VOTH CENSUS OF TRADES [G data] ==============================
   2026-10-19. Which of the Voth city's 44 trades (tools/trades_census.json) the Screamers' village carries. The table
   records what exists and builds nothing. A row is { trade, keys:[...], note? } for a trade the village carries,
   { trade, na:'why' } where it cannot or should not exist, or { trade, keys:[], gap:'what is missing' } (keys and a gap
   together: partly carried). The keys are the village's REGISTER names (src/71-village.js, "Screamer village - ...") or
   its builders' names (warehouse, longhouse). tools/check_trades.py reads it (verify.py 'voth-trades'); KNOWN_ISSUES.md
   lists the gaps. The Screamers (LORE 6.7): a tribal village in a ruined Ancient arcology, hyperjungle, speaking by
   screaming, kidnapping outsiders to "make them Talk Good"; scrap smiths, thatch and lashed timber, a millipede ranch.
   No shops, no coin, no inns. Both pages (screamers and furniture) carry the table; it is the village's. */
const SCREAM_TRADES = [
  { trade: 'bakers', keys: [], gap: 'a cookhouse with a bake oven; food is only grown, penned and stored' },
  { trade: 'butchers', keys: [], gap: 'a slaughter and smoke house for the millipede ranch\'s stock' },
  { trade: 'weavers and dyers', keys: [], gap: 'a weaving and dye shed (the ochre rag, black and bone of the Screamer dress)' },
  { trade: 'brewers', keys: [], gap: 'a brewing shed (jungle fruit from the orchard)' },
  { trade: 'tanners', keys: [], gap: 'a tannery for the ranch\'s hides' },
  { trade: 'shipwrights and boatbuilders', na: 'inland crater hyperjungle, no water traffic' },
  { trade: 'innkeepers and grooms', na: 'no inns: strangers are taken to the captive\'s pen, not lodged' },
  { trade: 'town guard', keys: ['Screamer village — the wall', 'Screamer village — the upper city gate'], note: 'the hexagonal wall with thatched guard towers, the gate cut onto the plaza' },
  { trade: 'coast guard', na: 'no coast: the village is inland in the crater' },
  { trade: 'temple priests and servants', keys: [], gap: 'a rite place for the hypertree the captives are fed to (LORE 6.7: it warps them into more Screamers)' },
  { trade: 'shrine keepers', keys: [], gap: 'a shrine of skulls and painted dots (the Screamer culture marks)' },
  { trade: 'shopkeepers and assistants', na: 'no shops or coin: a tribe that shares and takes' },
  { trade: 'smiths and craftsmen', keys: ['Screamer village — a smithy'], note: 'open-sided forge sheds with scrap heaps: the source of all the salvaged sheet' },
  { trade: 'innkeepers and servers', na: 'no taverns: no hospitality trade among the tribe' },
  { trade: 'porters and warehousemen', keys: ['warehouse'], note: 'big hexagonal warehouses of lashed post, plank and salvaged sheet' },
  { trade: 'industrial workers', keys: ['Screamer village — a smithy'], note: 'the smithies and their spoil heaps; the Ancient industry sheds are quarried for scrap, not worked' },
  { trade: 'power-house stokers and engineers', na: 'no power-house: the tribe works by hand and fire; the Ancient dam, data centre and elevator are relics' },
  { trade: 'household service', na: 'no servants: households are kin in longhouses and salvage homes' },
  { trade: 'soldiers', keys: [], gap: 'a warriors\' lodge or armoury: the wall has guard towers but no barracks' },
  { trade: 'teachers and scholars', keys: [], gap: 'the elders\' place where captives are taught to Talk Good' },
  { trade: 'guild officers and clerks', na: 'no guilds, no writing office: the elders rule by presence' },
  { trade: 'customs officers and clerks', na: 'they do not trade, so nothing to tax' },
  { trade: 'healers and nurses', keys: [], gap: 'a healer\'s hut' },
  { trade: 'priests and undertakers', keys: [], gap: 'a burial or bone ground' },
  { trade: 'lighthouse keepers', na: 'inland, no water traffic to light' },
  { trade: 'dockers and stevedores', na: 'inland, no harbour' },
  { trade: 'river bargemen and quay hands', na: 'no river trade' },
  { trade: 'fishers', keys: [], gap: 'a fishing platform on a jungle stream' },
  { trade: 'market traders', keys: [], gap: 'a barter ground on the plaza' },
  { trade: 'farmhands and ploughmen', keys: ['Screamer village — the fields', 'Screamer village — the orchard workers\' residence'], note: 'radial fields and pens on the terraces; the workers\' residence in the patched dome' },
  { trade: 'chinampa growers', na: 'no raised water beds: terraces and radial plots' },
  { trade: 'orchardmen', keys: ['Screamer village — the orchard', 'Screamer village — the orchard workers\' residence'], note: 'the terrace orchards and the people who work them' },
  { trade: 'miners', na: 'they salvage scrap from the Ancient ruin rather than mine' },
  { trade: 'quarrymen and masons', na: 'stone is robbed from the ruined Ancient fabric (the wall); no quarry' },
  { trade: 'granary keepers and millers', keys: [], gap: 'a granary and a mill; the warehouses store goods generally' },
  { trade: 'beetle herders', na: 'no beetles: their stock is the millipede' },
  { trade: 'dairymen', na: 'millipedes give no milk' },
  { trade: 'swineherds and duck keepers', keys: ['Screamer village — the millipede ranch'], note: 'the double-stockaded ranch with troughs and shelter' },
  { trade: 'mushroom growers', na: 'no mushroom farm in the village or the hyperjungle kit' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'no water crossings' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs: the millipede is the beast of the village' },
  { trade: 'monks and lay brothers', na: 'no monastic order' },
  { trade: 'palace and canton staffs', keys: ['Screamer village — the chief\'s palace (the flatiron)'], note: 'the chief\'s palace in the Hexahedron\'s flatiron wedge' }
];
globalThis.SCREAM_TRADES = SCREAM_TRADES;
