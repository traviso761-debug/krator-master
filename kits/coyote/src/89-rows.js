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
 {name:'The Valley village (KHAMLET.platform)',keys:['cy_village_valley']}
];
