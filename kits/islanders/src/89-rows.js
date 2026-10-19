// ================================================================= THE SHOWCASE: rows of the kit, by family (front +z toward the camera)
// A row entry is a def key, or {key, o} (place() options: a variant v). A family with shore:true stands on the beach: the sea
// fills everything north of its centre line (90h-is-shore.js), so it must be the LAST row (rows run north from the first).
const TITLE=KIT.title;
const FAMILIES=[
 {name:'West - poor houses',keys:['iw-hut-scrap','iw-hut-fisher','iw-house-shared']},
 {name:'West - houses',keys:['iw-house-rumah','iw-house-batak','iw-house-tongkonan','iw-house-peak']},
 {name:'West - rich houses',keys:['iw-house-gadang','iw-house-chief','iw-house-tongkonan-great']},
 {name:'West - civic',keys:['iw-hall','iw-square','iw-school']},
 {name:'West - trade',keys:['iw-farm','iw-farm-poor','iw-granary','iw-granary-row','iw-windmill','iw-warehouse','iw-smithy','iw-market','iw-kava','iw-shophouse','iw-weaver','iw-potter','iw-chandler']},
 {name:'West - trades II',keys:['iw-temple','iw-bakehouse','iw-butcher','iw-tannery','iw-healer','iw-guesthouse','iw-harbourmaster','iw-beacon','iw-quarry','iw-sulphur','iw-saltworks','iw-pens','iw-byre']},
 {name:'West - defence',keys:['iw-palisade','iw-gate','iw-watchtower','iw-barracks']},
 {name:'Kautoa - poor houses',keys:['ie-hut-scrap','ie-hut-garden','ie-house-shared']},
 {name:'Kautoa - houses',keys:['ie-house-uma','ie-house-twin','ie-house-clan','ie-house-long','ie-house-cross']},
 {name:'Kautoa - rich houses',keys:['ie-house-wealthy','ie-house-great','ie-house-noble','ie-house-chief']},
 {name:'Kautoa - civic',keys:['ie-hall','ie-square','ie-school']},
 {name:'Kautoa - trade',keys:['ie-farm','ie-farm-poor','ie-granary','ie-granary-great','ie-windmill','ie-warehouse','ie-smithy','ie-market','ie-kava-house','ie-trader','ie-weaver','ie-potter','ie-chandler']},
 {name:'Kautoa - trades II',keys:['ie-temple','ie-bakehouse','ie-butcher','ie-tannery','ie-healer','ie-guesthouse','ie-harbourmaster','ie-beacon','ie-quarry','ie-sulphur','ie-saltworks','ie-pens','ie-byre','ie-envoy']},
 {name:'Kautoa - defence',keys:['ie-wall','ie-gate','ie-watchtower','ie-barracks']},
 {name:'Kautoa - palace',keys:['ip-palace']},
 {name:'Mines and resource nodes (kits/resources)',keys:['iw-mine','node-iron-low','node-iron-medium','node-iron-high','node-copper-low','node-copper-medium','node-copper-high','node-gold-low','node-gold-medium','node-gold-high','node-tin-low','node-tin-medium','node-tin-high','node-silver-low','node-silver-medium','node-silver-high','node-rare-earth-low','node-rare-earth-medium','node-rare-earth-high','node-coal-low','node-coal-medium','node-coal-high','node-sulfur-low','node-sulfur-medium','node-sulfur-high','node-saltpeter-low','node-saltpeter-medium','node-saltpeter-high','node-oil-low','node-oil-medium','node-oil-high','ie-mine']},
 {name:'Gardens, groves and stock',keys:['fl-paddy','fl-taro','fl-banana','fl-coconut','fl-breadfruit','pig','hen','duck','buffalo']},
 {name:'Harbours',shore:true,keys:['iw-fishdock','iw-dockyard','iw-godown','iw-quay','iw-canoeshed','iw-ferry','ie-fishdock','ie-dockyard','ie-quay','ie-canoeshed','ie-ferry']}
];
