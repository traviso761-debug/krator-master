// ================================================================= THE SHEET: rows by tribe and kind (core/engine 90-scene.js lays them out)
// A row entry is a def key or {key, o}: o carries the placement's options (a milestone's text; a sunk room's floor below the
// ground, so its roof stands 0.84 m over it as it does over the yard). Row names are view names: no apostrophe, no colon
// (tools/check_views.py).
const TITLE=KIT.title;
const FAMILIES=[
 {name:'Valley houses (Ham-Hau)',keys:['cy_room','cy_house_poor','cy_house_mid','cy_house_head']},
 {name:'Village cells and sunk rooms',keys:['cy_cell','cy_cell_store',{key:'cy_shrine_room',o:{y:-2.6}},{key:'cy_hall',o:{y:-2.8}}]},
 {name:'Valley works',keys:['cy_granary','cy_threshing','cy_mill','cy_pen','cy_court','cy_smithy','cy_kiln','cy_dyehouse','cy_press','cy_loom_house']},
 {name:'Shrines and stones',keys:['cy_runner_shrine',{key:'cy_boundary_stone',o:{}},{key:'cy_milestone',o:{}},
  {key:'cy_milestone',o:{text:'Hām-Hau. Kām-Hau. Tōng-Hau. Sī-Hau.'}},{key:'cy_milestone',o:{text:'Tsēk-Gèl!'}}]},
 {name:'The Valley village (KHAMLET.platform)',keys:['cy_village_valley']},
 {name:'Peak houses and stores (Kam-Hau)',keys:['cy_stone_hut','cy_stone_house','cy_stone_store','cy_cliff_house',{key:'cy_round_room',o:{y:-1.76}},'cy_fold']},
 {name:'The mine (emerald and turquoise)',keys:['cy_adit','cy_ore_bench','cy_sorting_shed','cy_tappers_camp','cy_wash']},
 {name:'The Peak alcove village (KHAMLET.platform)',keys:['cy_village_peak']},
 {name:'Herders tipis (Tong-Hau and Si-Hau)',keys:['cy_tipi_s','cy_tipi_m','cy_tipi_l',{key:'cy_tipi_l',o:{role:'chief'}},{key:'cy_tipi_s',o:{role:'shrine'}},
  {key:'cy_tipi_m',o:{tribe:'sunset'}},{key:'cy_tipi_m',o:{v:1}},'cy_winter_base']},
 {name:'Herders pens and works',keys:['cy_ostrich_pen','cy_feather_rack','cy_saddle_rack','cy_egg_cache']},
 {name:'Herders camp in summer (KCAMP)',keys:['cy_camp_summer']},
 {name:'Herders camp in winter (KCAMP)',keys:['cy_camp_winter']},
 {name:'Tierhound ledge houses (Lok-Hau)',keys:['cy_ledge_poor','cy_ledge_mid','cy_ledge_rich','cy_stair_lane','cy_terrace_wall',{key:'cy_terrace_wall',o:{w:5.4,text:'Hau-Gèl Tsēk! Lōk-Hau Kām.'}}]},
 {name:'Tierhound halls and stores',keys:['cy_spring_hall','cy_council','cy_treasury','cy_rock_facade',{key:'cy_rock_facade',o:{kind:'tomb',text:'Sī-Hau Gèl. Lōk Kām-Tōng.'}}]},
 {name:'The lake towns',keys:['cy_lake_house','cy_fish_weir','cy_reed_boat']},
 {name:'Howl and the road',keys:['cy_stage_house','cy_runners_post','cy_larder']},
 {name:'The stepped street (KHAMLET.terrace)',keys:['cy_street_tier']}
];
