// ================================================================= THE SHOWCASE: rows of the kit, by family (front +z toward the camera)
// A row entry is a def key, or {key, o} (place() options: a variant v). The rows grow phase by phase (PLAN.md section 11).
const TITLE=KIT.title;
const FAMILIES=[
 {name:'Dwellings - poor (P3)',keys:['et_reed_house','et_block_hut','et_canal_row']},
 {name:'Dwellings - middle',keys:['et_canal_house',{key:'et_canal_house',o:{v:1}},'et_court_house','et_corner_turret']},
 {name:'Dwellings - rich (P3)',keys:['et_merchant_house','et_official_villa']},
 {name:'The court over water (P3)',keys:[{key:'et_heir_pavilion',o:{v:0}},{key:'et_heir_pavilion',o:{v:1}},{key:'et_heir_pavilion',o:{v:2}},'et_heir_gallery']},
 {name:'The canal street (P3)',keys:['et_canal_street']},
 {name:'The State (P4)',keys:['et_ministry','et_registry','et_examination_hall','et_customs_house']},
 {name:'The wall and its gates (P4)',keys:['et_gate','et_wall',{key:'et_wall_tower',o:{v:0}},{key:'et_wall_tower',o:{v:1}},'et_barracks']},
 {name:'The machine layer (P4)',keys:['et_clock','et_tube_station','et_tube_pipe','et_talking_head','et_relic_hall']},
 {name:'The ancestors (P4)',keys:['et_ancestor_gallery','et_shrine_niche','et_withdrawal_house','et_mask_house','et_historians_house']},
 {name:'Profile helpers (P1)',keys:['et_sample_piers','et_sample_lancets',{key:'et_sample_screens',o:{v:0}},{key:'et_sample_screens',o:{v:1}},{key:'et_sample_screens',o:{v:2}},'et_sample_block']},
 {name:'Statuary (P2): the head generator',keys:['et_sample_heads','et_sample_figures','et_sample_masks']}
];
