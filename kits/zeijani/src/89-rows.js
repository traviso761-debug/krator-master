// ================================================================= THE SHOWCASE: rows of the kit, by family (front +z toward the camera)
// A row entry is a def key, or {key, o} (place() options: a variant v). PLAN.md 6.5 orders the rows; P3 fills them.
const TITLE='Zeijani Kit';
const FAMILIES=[
 {name:'Dwellings: wooden',keys:['zj_hut_a','zj_hut_b','zj_hut_c','zj_house_wood']},
 {name:'Dwellings: constructed',keys:['zj_house_built_poor','zj_house_built_mid','zj_house_built_rich']},
 {name:'Galleries and estates',keys:['zj_gallery_a','zj_gallery_b','zj_estate_a','zj_estate_b']},
 {name:'Sacred and civic',keys:['zj_kiva','zj_catacomb','zj_temple','zj_council','zj_cistern','zj_portal']},
 {name:'Shops: carved fronts',keys:ZS_ITEMS.filter(it=>/_carved$/.test(it.key)).map(it=>it.key)},
 {name:'Shops: constructed',keys:ZS_ITEMS.filter(it=>/_built$/.test(it.key)).map(it=>it.key)},
 {name:'The cavern test block',keys:['zj_testblock']}
];
