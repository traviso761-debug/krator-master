// ================================================================= THE SHOWCASE: rows of the kit, by family (front +z toward the camera)
// A row entry is a def key, or {key, o} (place() options: a variant v). A family with shore:true stands on the beach: the sea
// fills everything north of its centre line (90h-is-shore.js), so it must be the LAST row (rows run north from the first).
const TITLE=KIT.title;
const FAMILIES=[
 {name:'West - poor houses',keys:['iw-hut-scrap','iw-hut-fisher','iw-house-shared']},
 {name:'West - houses',keys:['iw-house-rumah','iw-house-batak','iw-house-tongkonan']},
 {name:'West - rich houses',keys:['iw-house-gadang','iw-house-chief','iw-house-tongkonan-great']},
 {name:'Kautoa - poor houses',keys:['ie-hut-scrap','ie-hut-garden','ie-house-shared']},
 {name:'Kautoa - houses',keys:['ie-house-uma','ie-house-twin','ie-house-clan']},
 {name:'Kautoa - rich houses',keys:['ie-house-wealthy','ie-house-great','ie-house-noble']},
 {name:'Kautoa - civic',keys:['ie-hall','ie-square','ie-school']},
 {name:'Kautoa - trade',keys:['ie-farm','ie-farm-poor','ie-granary','ie-granary-great','ie-windmill','ie-warehouse','ie-smithy','ie-market','ie-kava-house','ie-trader','ie-weaver','ie-potter','ie-chandler']},
 {name:'Kautoa - defence',keys:['ie-wall','ie-gate','ie-watchtower','ie-barracks']},
 {name:'Gardens, groves and stock',keys:['fl-paddy','fl-taro','fl-banana','fl-coconut','fl-breadfruit','pig','hen','duck','buffalo']},
 {name:'Harbours',shore:true,keys:['iw-fishdock','ie-fishdock','ie-dockyard']}
];
