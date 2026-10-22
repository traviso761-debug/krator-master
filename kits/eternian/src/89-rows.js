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
 {name:'The wall and its gates (P4)',keys:['et_gate','et_wall',{key:'et_wall_tower',o:{v:0}},{key:'et_wall_tower',o:{v:1}},'et_barracks','et_fort']},
 {name:'The machine layer (P4)',keys:['et_clock','et_tube_station','et_tube_pipe','et_talking_head','et_relic_hall']},
 {name:'The ancestors (P4)',keys:['et_ancestor_gallery','et_shrine_niche','et_withdrawal_house','et_mask_house','et_historians_house']},
 {name:'Dwellings - hexagonal (P6)',keys:['et_hex_hut','et_hex_house','et_hex_villa']},
 {name:'The works (P6)',keys:['et_kiln','et_tile_works','et_porcelain','et_paper_mill','et_printer']},
 {name:'The shop trades (P6), street and hexagonal',keys:[{key:'et_bakehouse',o:{v:0}},{key:'et_bakehouse',o:{v:1}},{key:'et_weaver',o:{v:0}},{key:'et_weaver',o:{v:1}},{key:'et_brewhouse',o:{v:0}},{key:'et_brewhouse',o:{v:1}},{key:'et_smithy',o:{v:0}},{key:'et_smithy',o:{v:1}},{key:'et_shophouse',o:{v:0}},{key:'et_shophouse',o:{v:1}}]},
 {name:'Hospitality and stores (P6)',keys:['et_tea_house',{key:'et_inn',o:{v:0}},{key:'et_inn',o:{v:1}},'et_healer','et_market_hall','et_granary','et_warehouse','et_mushroom_cellar','et_tannery','et_butcher']},
 {name:'The land (P6)',keys:['et_farmstead','et_paddy','et_tea_garden','et_mine','et_quarry','et_stock_pens']},
 {name:'Hydraulics and harbour (P6)',keys:['et_lock','et_reservoir_wall','et_spillway','et_canal_landing','et_ferry_landing','et_fish_landing','et_quay','et_dock','et_lighthouse','et_factory_quarter']},
 {name:'Profile helpers (P1)',keys:['et_sample_piers','et_sample_lancets',{key:'et_sample_screens',o:{v:0}},{key:'et_sample_screens',o:{v:1}},{key:'et_sample_screens',o:{v:2}},'et_sample_block']},
 {name:'Statuary (P2): the head generator',keys:['et_sample_heads','et_sample_figures','et_sample_masks']}
];
