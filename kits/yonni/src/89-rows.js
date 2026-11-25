// ================================================================= SHEET ROWS ([G data])
// Every def in DEFS is placed at least once so kit-coverage passes 100%.
// Special sculpted rows (90y-yn-terrain.js):
//   hillside: true -> 26 deg sloped coastal ridge proving zero boxy podiums & telescoping cobble root-skirts!
//   cliff: true    -> 28 m bedded coastal-granite cliff scarp behind engaged cliff rotundas, clusters & cleft-bridges!
//   shore: true    -> coastal beach & seabed drop with #include <atmos_waves> sea (MUST be last)!
const TITLE='Yonni Spear-Queens Kit - Yonni (346, 418) & the Scoured Hills';
const YN_RES_KEYS=[];
for(const k of Object.keys(RES_ORE.kinds))for(const g of Object.keys(RES_ORE.grades))YN_RES_KEYS.push(resNodeKey(k,g));

const FAMILIES=[
 {name:'Poor Round-Cots (Freestanding)',keys:['yn-hut-fisher','yn-hut-shepherd','yn-hut-miner']},
 {name:'Middle Round-Towers (Freestanding)',keys:['yn-house-drum','yn-house-twindrum','yn-house-corbel']},
 {name:'Rich Spear-Noble Compounds',keys:['yn-manor-triad','yn-manor-cupola','yn-manor-envoy','yn-manor-apserose']},
 {name:'Royal Palaces, Civic & Sacred Rotundas',keys:['yn-palace-citadel','yn-court-rotunda','yn-citadel-twinkande','yn-rotunda-seer','yn-hall-sisterhood','yn-school-scriptorium','yn-bath-cistern']},
 {name:'Monumental Spires, Ring-Courts & Sanctuaries',keys:['yn-spire-saucers','yn-monastery-giltcluster','yn-arena-ringcourt','yn-sanctuary-giltgate','yn-shrine-pylondome','yn-citadel-hexstilt']},
 {name:'Inns, Villas, Bazaar-Drums & Sun-Towers',keys:['yn-inn-staineddrum','yn-villa-belvedere','yn-bazaar-drum','yn-tower-sunpetal','yn-compound-sails','yn-smelter-scallop']},
 {name:'Formline & Coastal Fortifications',keys:['yn-wall-curtain','yn-gatehouse-portal','yn-tower-formline','yn-gate-twindrum','yn-watchtower','yn-barracks-lance']},
 {name:'Trades I - Forges, Kilns & Tavern',keys:['yn-smithy','yn-foundry-bronze','yn-bakery','yn-butcher','yn-weaver','yn-tannery','yn-potter','yn-carpenter','yn-alchemist','yn-tavern']},
 {name:'Trades II - Market, Mill, Farms & Mines',keys:[
  'yn-market','yn-shophouse','yn-granary','yn-watermill','yn-warehouse','yn-farmstead','yn-byre-stock',
  {key:'yn-mine',o:{metal:'iron'}},{key:'yn-mine',o:{v:1,metal:'tin'}},'yn-quarry','yn-beacon'
 ]},
 {name:'Scoured-Hills 26 deg Slope Showcase (Zero Podiums)',hillside:true,keys:[
  {key:'yn-hut-miner',o:{v:1}},{key:'yn-house-drum',o:{v:1}},{key:'yn-house-twindrum',o:{v:1}},
  {key:'yn-house-corbel',o:{v:1}},{key:'yn-manor-cupola',o:{v:1}},{key:'yn-tower-sunpetal',o:{v:1}}
 ]},
 {name:'Cliff-Flush Engaged Scarp Mode',cliff:true,keys:[
  'yn-cliff-dwelling-poor','yn-cliff-cluster','yn-cliff-rotunda','yn-cliff-lanternhold','yn-cliff-viaduct-hall','yn-border-fort','yn-cliff-bridge','yn-cliff-smithy','yn-cliff-watch'
 ]},
 {name:'Livestock & Wet-Coastal Flora',keys:['ynb-sheep','ynb-goat','ynb-horse','ynb-hen','ynb-hill-oat','ynb-sea-kale','ynb-amber-pine','ynb-creek-alder']},
 {name:'Resource Nodes (kits/resources)',keys:YN_RES_KEYS},
 {name:'Coastal Harbour & War-Galley Quays',shore:true,keys:['yn-fishquay','yn-dockyard','yn-customs-quay','yn-canoeshed-guard']}
];
