/* ==================== kits/marr/sim/80-marr-sim.js: Izani Provinces & Marr Regional Economy on core/simulation ([G data]) ==================== */
/* Plain data and core/simulation + core/hamlet binding for Marr Province (Prubinsa de Marr) and the Izani Empire's
   provincial borders. Runs in Node (kits/marr/tests/test-marr-sim.js) and in browser/Godot hosts without three.js or DOM. */
globalThis.MARR_SIM = globalThis.MARR_SIM || {};

/* 1. THE TEN IMPERIAL PROVINCES OF THE EMPIRE OF IZIZ (Empar de Son, scale-model 5.1 coordinates, 2 km/px) */
MARR_SIM.IZANI_PROVINCES = [
  {
    id: 'marr',
    name: 'Provincia Marítima de Porta Marr y las Islas del Cistal',
    izaniName: 'Prubinsa de Porta Marr i laz Islaz de Cistal',
    realmId: 'rmukx6bccnznf',
    capital: {id: 'sxmeztkqg7', name: 'Marr (Porta Marr)', px: 926, py: 1014, elev: -1514, climate: 'XA'},
    settlements: ['Marr', 'San Telmo de la Garita', 'Puerto Koral (Puerto Sombra)', 'Cala del Faro', 'Puerto Carena de Plata', 'Finca Trapiche de Stara', 'Vega del Cistal', 'Salinas del Estero', 'Real de Minas del Cistal', 'Hato de la Sabana'],
    islands: [
      {id: 'isl_garita', scaleModelId: 22, name: 'Isla Garita (Kayo de la Entrada / Isla Cistal)', center: [916, 965], bbox: [912, 962, 919, 967], areaKm2: 112, elevMin: -1519, elevMax: -1399, elevMed: -1447, rainMm: 2722, tempC: 31.0, climate: 'XA', distMarrKm: 100.6, role: 'Naval bastion, customs station, pilotage, solar salt & pearl fishery (San Telmo de la Garita)'},
      {id: 'isl_sombra', scaleModelId: 21, name: 'Isla Koral (Isla de Sombra Verde / Isla Volcán)', center: [897, 969], bbox: [888, 960, 905, 979], areaKm2: 1216, elevMin: -2039, elevMax: -419, elevMed: -1002, rainMm: 2047, tempC: 30.0, climate: 'Af', distMarrKm: 107.3, role: 'Ship-timber logging, charcoal kilns, careening bay, coral quarry & leeward cacao/cane fincas (Puerto Sombra / Puerto Koral)'},
      {id: 'isl_faro', scaleModelId: 19, name: 'Isla Faro (Isla de Cabo Stara / Isla Coralina)', center: [933, 958], bbox: [930, 952, 937, 961], areaKm2: 144, elevMin: -1689, elevMax: -1301, elevMed: -1401, rainMm: 3012, tempC: 31.0, climate: 'XA', distMarrKm: 113.7, role: 'Coralline limestone ashlar quarry, limekilns, 35 m octagonal lighthouse & careening slip (Cala del Faro)'}
    ],
    rivers: ['r025 (Rrivar Cistal, 152.4 m3/s)', 'r339 (Rrivar stara, 55.2 m3/s)', 'r415 (Bruk Guaita)', 'r673 (Guli brij)'],
    points: [[892, 950], [942, 950], [944, 965], [948, 985], [955, 1015], [952, 1042], [939, 1045], [931, 1048], [910, 1048], [895, 1045], [902, 1027], [900, 1002], [895, 982]],
    style: 'marr',
    kitMix: {marr: 0.85, 'iziz-vernacular': 0.15},
    summary: 'Foremost Ring Sea deep-water port, canal metropolis, shipyard arsenal, sugar/rum & cacao staple entrepot, and 3-island maritime shield guarding the Cistal Fjord.'
  },
  {
    id: 'iziz',
    name: 'Provincia Metropolitana de Iziz (Vali de Iziz)',
    izaniName: 'Prubinsa Metrupulitana de Iziz',
    realmId: 'rmukx6bccnznf',
    capital: {id: 'sxxrgmrk8c', name: 'Iziz', px: 963, py: 985, elev: -1488, climate: 'Am'},
    settlements: ['Iziz', 'Port Tobin', 'Atton', 'Gioli', 'Stump'],
    rivers: ['r013 (Bruk Falz, 267.9 m3/s)', 'r028 (Rrivar Falz, 134.9 m3/s)', 'r031 (Rrivar Isguifta, 128.0 m3/s)', 'r264 (Bruk Loña, 48.0 m3/s)'],
    points: [[942, 944], [956, 944], [1000, 944], [1048, 948], [1055, 985], [1048, 1028], [983, 1036], [952, 1042], [955, 1015], [948, 985], [944, 965]],
    style: 'iziz-vernacular',
    kitMix: {'iziz-vernacular': 0.85, marr: 0.10, talia: 0.05},
    summary: 'Imperial capital basin, bureaucratic and military core, northern naval river-mouth port at Port Tobin, irrigated grain/rice plains around Gioli and Atton, and ruined arcology Stump.'
  },
  {
    id: 'pylon',
    name: 'Provincia de Pylon (Meseta del Monolito)',
    izaniName: 'Prubinsa de Pailon',
    realmId: 'rmukx6bccnznf',
    capital: {id: 'sxoqgjn7y0', name: 'Pylon', px: 869, py: 1002, elev: -1380, climate: 'Aw'},
    settlements: ['Pylon', 'Puerto Onda', 'pylon-1', 'pylon-2', 'pylon-3', 'pylon-4', 'pylon-5'],
    rivers: ['r112 (Bruk onda, 76.2 m3/s)', 'r552 (Guli valle)'],
    points: [[845, 965], [892, 965], [895, 982], [900, 1002], [902, 1027], [895, 1045], [855, 1042], [842, 1005], [842, 975]],
    style: 'pylon',
    kitMix: {pylon: 0.85, 'iziz-vernacular': 0.10, marr: 0.05},
    summary: 'Ancient arcology spire of Pylon, western dry-savanna ranching & mining plateau, coastal lagoon port of Puerto Onda at Bruk onda mouth, and offshore Isla Onda.'
  },
  {
    id: 'talia',
    name: 'Provincia de Talia y los Pasos del Este',
    izaniName: 'Prubinsa de Talia i Pazoz del Este',
    realmId: 'rmukx6bccnznf',
    capital: {id: 'sor1zqih8x', name: 'Talia', px: 1073, py: 939, elev: -910, climate: 'Aw'},
    settlements: ['Talia', 'talia-farm-1', 'talia-farm-2', 'talia-farm-3', 'talia-farm-4', 'talia-ranch-1'],
    rivers: ['r035 (Rrivar Goulda, 121.3 m3/s)', 'r036 (Rrivar Grin, 121.3 m3/s)', 'r194 (Rrivar Stona, 64.9 m3/s)'],
    points: [[1048, 935], [1128, 932], [1135, 985], [1108, 1028], [1048, 1028], [1055, 985]],
    style: 'talia',
    kitMix: {talia: 0.85, 'iziz-vernacular': 0.15},
    summary: 'Assimilated Talei piedmont city of Talia guarding the eastern savanna-highland passes, terraced orchards, and copper/gold rivers.'
  },
  {
    id: 'fridon',
    name: 'Marca del Norte (Fridon y Vaklu)',
    izaniName: 'Marka del Norte de Fridon i Vaklu',
    realmId: 'rmukx6bccnznf',
    capital: {id: 'svx3b6k33f', name: 'Fridon', px: 1027, py: 931, elev: -921, climate: 'Aw'},
    settlements: ['Fridon', 'Fort Vaklu', 'Puente Brij', 'Nusidi (claimed ruin)'],
    rivers: ['r063 (Rrivar brij, 99.6 m3/s)'],
    points: [[960, 885], [1020, 875], [1095, 895], [1115, 932], [1048, 935], [1048, 948], [1000, 944], [956, 944]],
    style: 'iziz-vernacular',
    kitMix: {'iziz-vernacular': 0.65, talia: 0.35},
    summary: 'Northern military frontier march anchored on Fort Vaklu and the assimilated Talei town of Fridon, controlling the Rrivar brij corridor toward ruined Nusidi.'
  },
  {
    id: 'seto',
    name: 'Prefectura de las Islas del Anillo (Islas de Seto)',
    izaniName: 'Prefektura de laz Islaz de Seto',
    realmId: 'rmukx6bccnznf',
    capital: {id: 'suml5037h8', name: 'Seto', px: 930, py: 922, elev: -1514, climate: 'XA'},
    settlements: ['Seto', 'Puerto Poniente', 'Paso Medio'],
    rivers: [],
    points: [[840, 905], [955, 905], [955, 950], [840, 950]],
    style: 'marr',
    kitMix: {marr: 0.75, 'iziz-vernacular': 0.25},
    summary: 'Outer Ring Sea island chain north of the y = 950 channel (Isla de Seto, Isla Media, Isla Gran Poniente); forward fleet anchorage, whaling/pelagic fishery, and lighthouse chain.'
  },
  {
    id: 'hook',
    name: 'Marca Occidental de Reconquista (Hook / Uga)',
    izaniName: 'Marka Uksidental de Uga',
    realmId: 'rmukx6bccnznf',
    capital: {id: 'shook809923', name: 'Hook (Uga)', px: 809, py: 923, elev: -1514, climate: 'XA'},
    settlements: ['Hook', 'Isla Uga'],
    rivers: ['r552 (Guli valle mouth)'],
    points: [[795, 895], [845, 905], [845, 965], [842, 975], [800, 965]],
    style: 'iziz-vernacular',
    kitMix: {'iziz-vernacular': 0.55, pylon: 0.25, marr: 0.20},
    summary: 'Northwestern reconquest headland and naval station at Hook (Uga), guarding the western approach to the Ring Sea.'
  },
  {
    id: 'daridel',
    name: 'Marca del Sur y Corredor del Cuenco (Daridel, Arcbeam y Mantis)',
    izaniName: 'Marka del Sur de Daridel, Arkabim i Mantis',
    realmId: 'rmukx6bccnznf',
    capital: {id: 'sory54g10c', name: 'Daridel', px: 937, py: 1068, elev: 2268, climate: 'Cwb'},
    settlements: ['Daridel', 'Arcbeam', 'Mantis', 'Upper Verge'],
    rivers: ['r025 (Upper Rrivar Cistal)', 'r255 (Rrivar Blaca)', 'r453 (Guli Cistal)', 'r845 (Guli Grin)'],
    points: [[855, 1042], [895, 1045], [931, 1048], [952, 1042], [983, 1036], [1048, 1028], [1108, 1028], [1267, 934], [1267, 960], [1150, 1185], [1075, 1185], [987, 1193], [861, 1133]],
    style: 'iziz-vernacular',
    kitMix: {'iziz-vernacular': 0.60, pylon: 0.25, talia: 0.15},
    summary: 'Highland terrace valleys of Daridel (+2,268 m), the active Arcbeam arcology, the southern monsoon oasis of Mantis, and the eastern caravan corridor to Upper Verge.'
  },
  {
    id: 'shell',
    name: 'Provincia Ultramarina de Shell (Costa Boreal del Anillo)',
    izaniName: 'Prubinsa Ultramarina de Xel i Porta Goto',
    realmId: 'rmvlqffsaj2v0',
    capital: {id: 'sshell902659', name: 'Shell', px: 902, py: 659, elev: -1490, climate: 'Aw'},
    settlements: ['Shell', 'Port Goto'],
    rivers: [],
    points: [[870, 640], [945, 640], [945, 715], [870, 715]],
    style: 'iziz-vernacular',
    kitMix: {'iziz-vernacular': 0.70, marr: 0.30},
    summary: 'Autonomous overseas veteran colony across the Ring Sea anchored on the Shell arcology and naval port of Port Goto.'
  },
  {
    id: 'dilihan',
    name: 'Provincia Ultramarina de Dilihan (Poniente del Anillo)',
    izaniName: 'Prubinsa Ultramarina de Dilihan i Porta Visaz',
    realmId: 'rmvlqd5ix7mfn',
    capital: {id: 'sdil744663', name: 'Dilihan', px: 744, py: 663, elev: -1480, climate: 'Aw'},
    settlements: ['Dilihan', 'Port Visas'],
    rivers: [],
    points: [[720, 640], [820, 640], [820, 730], [720, 730]],
    style: 'iziz-vernacular',
    kitMix: {'iziz-vernacular': 0.80, marr: 0.20},
    summary: 'Western overseas veteran province across the Ring Sea governed from Dilihan and its fleet landing at Port Visas.'
  }
];


/* 2. MARR PROVINCE SETTLEMENT, ISLAND & HAMLET CATALOG (all executed in Marr style, KHAMLET.CULTURES.marr) */
MARR_SIM.SPECS = [
  /* The 3 Ring Sea islands of Marr Province (overseas small settlements & outposts) */
  {
    id: 'marr_garita', name: 'San Telmo de la Garita', kind: 'island_outpost', islandId: 'isl_garita',
    focus: 'fishing', parent: 'marr', culture: 'marr', px: 916, py: 965, elev: -1447,
    overseas: true, seaKm: 100.6, popMax: 320,
    site: {x: -20000, z: -98000}, link: {x: -19600, z: -97600},
    landing: {x: -19550, z: -97550, ux: 0.6, uz: 0.8},
    resource: {id: 'res:marr:garita_reef', kind: 'fish', grade: 'high', x: -20220, z: -98160, workers: 96},
    makes: ['fish', 'salt'],
    highlights: ['mar_castillo_bastion', 'mar_garita_watch', 'mar_aduana', 'mar_boatyard_slip', 'mar_canal_quay', 'mar_fishers_row'],
    notes: 'Fortified naval & customs station on Island #22 (112 km2) in the throat of the Cistal Bight; pilots ships into the fjord, rakes solar salt, and fishes the coral banks.'
  },
  {
    id: 'marr_sombra', name: 'Puerto Sombra', kind: 'island_settlement', islandId: 'isl_sombra',
    focus: 'lumber', parent: 'marr', culture: 'marr', px: 903, py: 974, elev: -1002,
    overseas: true, seaKm: 92.4, popMax: 420,
    site: {x: -46000, z: -80000}, link: {x: -45500, z: -79600},
    landing: {x: -45450, z: -79550, ux: 0.707, uz: 0.707},
    resource: {id: 'res:marr:sombra_woods', kind: 'timber', grade: 'high', x: -46320, z: -80240, workers: 96},
    makes: ['timber', 'charcoal', 'cacao'],
    highlights: ['mar_boatyard_slip', 'mar_artisan_court', 'mar_hacienda', 'mar_captains_house', 'mar_canal_quay', 'mar_casa_patio'],
    notes: 'Colonial port on the sheltered SE bay of high volcanic Island #21 (1,216 km2, Af rainforest); fells ship timber and burns charcoal for the Atarazanas while terraced fincas grow cacao.'
  },
  {
    id: 'marr_faro', name: 'Cala del Faro', kind: 'island_hamlet', islandId: 'isl_faro',
    focus: 'quarry', parent: 'marr', culture: 'marr', px: 933, py: 958, elev: -1401,
    overseas: true, seaKm: 113.7, popMax: 240,
    site: {x: 14000, z: -112000}, link: {x: 14400, z: -111600},
    landing: {x: 14450, z: -111550, ux: -0.6, uz: 0.8},
    resource: {id: 'res:marr:faro_coral', kind: 'stone', grade: 'high', x: 13820, z: -112160, workers: 56},
    makes: ['stone', 'fish'],
    highlights: ['mar_garita_watch', 'mar_artisan_court', 'mar_boatyard_slip', 'mar_canal_quay', 'mar_creole_cottage'],
    notes: 'Coral-rag ashlar quarry, limekiln and careening cove on Island #19 (144 km2) guarding the eastern sea lane between Porta Marr and Port Tobin.'
  },
  /* Mainland hamlets, work sites & small settlements of the Cistal Basin */
  {
    id: 'marr_vega', name: 'Vega del Cistal', kind: 'farming_hamlet', islandId: null,
    focus: 'farming', parent: 'marr', culture: 'marr', px: 927, py: 1018, elev: -1420,
    overseas: false, roadKm: 8.5, popMax: 440,
    site: {x: 2000, z: 8000}, link: {x: 0, z: 0},
    resource: {id: 'res:marr:vega_farmland', kind: 'farmland', grade: 'high', x: 2240, z: 8320, workers: 120},
    crops: [{crop: 'rice', kind: 'field', w: 3}, {crop: 'maize', kind: 'field', w: 3}, {crop: 'banana', kind: 'orchard', w: 2}],
    makes: ['rice', 'maize', 'banana'],
    highlights: ['mar_hacienda', 'mar_patio_vegetable', 'mar_smuggler_warehouse', 'mar_chapel_barrio', 'mar_casa_patio'],
    notes: 'Irrigated alluvial-fan farming hamlet on lower Rrivar Cistal (r025); supplies Porta Marr with rice, maize and plantains/bananas along the South Highway.'
  },
  {
    id: 'marr_trapiche', name: 'Finca Trapiche de Stara', kind: 'plantation_hamlet', islandId: null,
    focus: 'farming', plantation: true, parent: 'marr', culture: 'marr', px: 933, py: 1015, elev: -1360,
    overseas: false, roadKm: 14.5, popMax: 450,
    site: {x: 14000, z: 2000}, link: {x: 0, z: 0},
    resource: {id: 'res:marr:stara_cane', kind: 'farmland', grade: 'high', x: 14320, z: 2240, workers: 120},
    crops: [{crop: 'sugar', kind: 'field', w: 4}, {crop: 'cotton', kind: 'field', w: 3}, {crop: 'cacao', kind: 'orchard', w: 2}],
    makes: ['sugar', 'cotton', 'cacao'],
    highlights: ['mar_hacienda', 'mar_rum_bodega', 'mar_creole_cottage', 'mar_shotgun_double', 'mar_smuggler_warehouse'],
    notes: 'Cane, cotton and cacao plantation village at the confluence of Rrivar stara (r339) and Bruk Guaita (r415); crushes cane into raw sugar and molasses for Marr\'s rum bodegas.'
  },
  {
    id: 'marr_salinas', name: 'Salinas del Estero', kind: 'work_site_hamlet', islandId: null,
    focus: 'salt', parent: 'marr', culture: 'marr', px: 930, py: 1010, elev: -1510,
    overseas: false, roadKm: 12.0, seaKm: 11.2, popMax: 340,
    site: {x: 8600, z: -7200}, link: {x: 0, z: 0},
    landing: {x: 8200, z: -7400, ux: -0.8, uz: -0.6},
    resource: {id: 'res:halite:526:544', kind: 'halite', grade: 'high', x: 8780, z: -7080, workers: 96},
    makes: ['salt'],
    highlights: ['mar_patio_working', 'mar_smuggler_warehouse', 'mar_canal_quay', 'mar_fishers_row', 'mar_garita_watch'],
    notes: 'Solar evaporation pans and high-grade halite saltworks on the eastern Cistal Fjord shore (res:halite:526:544); ships salt by barge and road to cure Marr\'s fish and meat.'
  },
  {
    id: 'marr_minas', name: 'Real de Minas del Cistal', kind: 'work_site_hamlet', islandId: null,
    focus: 'mine', parent: 'marr', culture: 'marr', px: 923, py: 1017, elev: -1290,
    overseas: false, roadKm: 9.2, popMax: 410,
    site: {x: -5600, z: 6200}, link: {x: 0, z: 0},
    resource: {id: 'res:iron:434:457', kind: 'iron', grade: 'high', x: -5820, z: 6420, workers: 110},
    makes: ['ore', 'copper', 'pitch'],
    highlights: ['mar_artisan_court', 'mar_patio_working', 'mar_garita_watch', 'mar_shotgun_single', 'mar_cantina'],
    notes: 'Foothill mining and pitch-seep work site SW of Marr working high-grade iron (res:iron:434:457), copper (res:copper:325:344) and natural caulking bitumen (res:oil:261:274).'
  },
  {
    id: 'marr_hato', name: 'Hato de la Sabana', kind: 'ranch_hamlet', islandId: null,
    focus: 'ranch', parent: 'marr', culture: 'marr', px: 917, py: 1012, elev: -1340,
    overseas: false, roadKm: 18.4, popMax: 290,
    site: {x: -18000, z: -4000}, link: {x: 0, z: 0},
    resource: {id: 'res:marr:sabana_pasture', kind: 'pasture', grade: 'high', x: -18320, z: -4240, workers: 64},
    makes: ['meat', 'leather', 'clay'],
    highlights: ['mar_hacienda', 'mar_patio_working', 'mar_artisan_court', 'mar_creole_cottage', 'mar_chapel_barrio'],
    notes: 'Cattle and pack-mule hato on the western savanna bench with riverbank terracotta/azulejo clay pits; supplies beef, hides/leather and potter\'s clay to Marr.'
  },
  {
    id: 'marr_plata', name: 'Puerto Carena de Plata', kind: 'small_settlement', islandId: null,
    focus: 'mine', parent: 'marr', culture: 'marr', px: 922, py: 999, elev: -1390,
    overseas: false, roadKm: 34.0, seaKm: 30.5, popMax: 420,
    site: {x: -8000, z: -30000}, link: {x: -7600, z: -29600},
    landing: {x: -7550, z: -29550, ux: 0.8, uz: 0.6},
    resource: {id: 'res:gold:260:268', kind: 'gold', grade: 'high', x: -8220, z: -30180, workers: 110},
    makes: ['bullion', 'tin', 'stone'],
    highlights: ['mar_garita_watch', 'mar_artisan_court', 'mar_canal_quay', 'mar_casa_patio', 'mar_townhouse_iron', 'mar_smuggler_warehouse'],
    notes: 'Fortified peninsula mining town on the western wall of the Cistal Fjord working high-grade gold (res:gold:260:268), tin (res:tin:325:333) and silver (res:silver:259:267).'
  }
];

/* 3. ECONOMY TUNING FOR PORTA MARR & ITS HINTERLAND / ISLAND NETWORK */
MARR_SIM.TUNE = {
  seed: 510926,
  clock: {start: 360, secPerMinute: 40, stepMax: 60, lag: 120, reach: 6000},
  foods: ['fish', 'rice', 'maize', 'banana', 'meat', 'bread'],
  goods: [
    'fish', 'rice', 'maize', 'banana', 'meat', 'bread',
    'salt', 'sugar', 'rum', 'cotton', 'cacao', 'cloth', 'cordage',
    'timber', 'charcoal', 'stone', 'clay', 'ore', 'copper', 'pitch',
    'iron', 'tools', 'pottery', 'leather', 'bullion', 'tin', 'hulls'
  ],
  inputs: {
    bread: {maize: 1},
    rum: {sugar: 1},
    cloth: {cotton: 1},
    cordage: {cotton: 1},
    iron: {ore: 1, charcoal: 1},
    tools: {iron: 1, timber: 1},
    pottery: {clay: 1},
    hulls: {timber: 2, cordage: 1, pitch: 1, iron: 1}
  },
  cityProducers: [
    {id: 'marr.fishers_wharf', name: 'Muelle de Pescadores (La Marina)', key: 'mar_fishers_row', kind: 'fishery', x: -80, z: -110, posts: 18, out: ['fish'], rate: 2.2, cap: 600},
    {id: 'marr.mercado_bakery', name: 'Hornos del Mercado de Hierro', key: 'mar_mercado_hall', kind: 'bakery', x: 10, z: -20, posts: 12, out: ['bread'], rate: 2.0, cap: 500},
    {id: 'marr.rum_bodega_1', name: 'Real Bodega de Ron del Cistal', key: 'mar_rum_bodega', kind: 'distillery', x: 95, z: 40, posts: 14, out: ['rum'], rate: 1.6, cap: 400},
    {id: 'marr.rum_bodega_2', name: 'Bodega de Alambiques de Stara', key: 'mar_rum_bodega', kind: 'distillery', x: 120, z: 55, posts: 10, out: ['rum'], rate: 1.6, cap: 400},
    {id: 'marr.sail_loft', name: 'Velamen y Cordelería del Canal', key: 'mar_canal_loft', kind: 'weaver', x: -45, z: 30, posts: 12, out: ['cloth', 'cordage'], rate: 1.5, cap: 350},
    {id: 'marr.iron_foundry', name: 'Rejería y Fragua de Barrio Viejo', key: 'mar_artisan_court', kind: 'smithy', x: 35, z: 25, posts: 14, out: ['iron', 'tools'], rate: 1.4, cap: 350},
    {id: 'marr.azulejo_kiln', name: 'Alfarería de Azulejos de Marr', key: 'mar_artisan_court', kind: 'potter', x: 60, z: 35, posts: 10, out: ['pottery'], rate: 1.5, cap: 300},
    {id: 'marr.atarazana_slip', name: 'Reales Atarazanas de Porta Marr', key: 'mar_boatyard_slip', kind: 'shipyard', x: -30, z: -135, posts: 16, out: ['hulls'], rate: 0.9, cap: 180}
  ],
  cityWarehouses: [
    {id: 'marr.aduana_store', name: 'Almacén Real de la Aduana Marítima', key: 'mar_aduana', x: -10, z: -125},
    {id: 'marr.sombras_bodega', name: 'Bodega del Canal de las Sombras', key: 'mar_smuggler_warehouse', x: -70, z: 15},
    {id: 'marr.stara_bodega', name: 'Almacén de la Puerta de Tierra', key: 'mar_smuggler_warehouse', x: 80, z: 75}
  ],
  cityShops: [
    {id: 'marr.mercado_shop', name: 'Mercado de Hierro', key: 'mar_mercado_hall', x: 15, z: -15, sells: ['fish', 'rice', 'maize', 'banana', 'meat', 'bread', 'pottery']},
    {id: 'marr.portal_shop', name: 'Portal de los Mercaderes', key: 'mar_portal_arcade', x: 25, z: 5, sells: ['shirt', 'hoe', 'pottery', 'rum_flask', 'cacao_cup']},
    {id: 'marr.chandlery_shop', name: 'Proveeduría Naval de la Marina', key: 'mar_chandlery', x: -35, z: -95, sells: ['hoe', 'shirt', 'fish', 'bread', 'rum_flask']},
    {id: 'marr.cantina_shop', name: 'Cantina de las Sombras', key: 'mar_cantina', x: -65, z: 5, sells: ['fish', 'bread', 'rum_flask', 'cacao_cup']}
  ],
  buyers: {
    at: 720,
    floor: {rum: 40, sugar: 45, cacao: 30, salt: 50, cloth: 30, tools: 25, pottery: 25, hulls: 12, bullion: 20, copper: 25, tin: 20},
    ships: [
      {id: 'iziz_imperial_convoy', name: 'Flota Imperial de Iziz', every: 1, phase: 0, calls: ['marr'], buys: {rum: 35, sugar: 30, cacao: 25, salt: 30, bullion: 18, hulls: 6}},
      {id: 'tobin_coaster', name: 'Paquebote de Puerto Tobín', every: 2, phase: 1, calls: ['marr', 'marr_faro'], buys: {rum: 25, cloth: 20, tools: 18, pottery: 20, salt: 25}},
      {id: 'pylon_barge', name: 'Barcaza Costera de Pylon', every: 2, phase: 0, calls: ['marr', 'marr_garita'], buys: {sugar: 25, rum: 20, tools: 15, cloth: 15}},
      {id: 'daridel_mule_train', name: 'Recua de los Altos de Daridel', every: 2, phase: 1, calls: ['marr'], buys: {salt: 35, rum: 20, tools: 15, fish: 30}},
      {id: 'shades_xebec', name: 'Jabeque Contrabandista del Anillo', every: 3, phase: 2, calls: ['marr', 'marr_garita'], buys: {rum: 40, bullion: 15, cacao: 20, copper: 20, tin: 15}}
    ]
  }
};

/* 4. GENERATE HAMLET PLANS & DECLARE THE PROVINCIAL SIM */
MARR_SIM.buildVillages = function () {
  var row = KHAMLET.row('marr'), MDIMS = row.pending || {};
  var dims = function (k) { return MDIMS[k] || null; };
  var names = KHAMLET.dealNames('marr', MARR_SIM.TUNE.seed, MARR_SIM.SPECS.map(function (s) { return s.id; }));
  return MARR_SIM.SPECS.map(function (sp) {
    var vSpec = {
      id: sp.id, world: MARR_SIM.TUNE.seed, culture: 'marr', focus: sp.focus,
      site: sp.site, link: sp.link, resource: sp.resource, popMax: sp.popMax,
      dims: dims, landing: sp.landing || null,
      worksOut: sp.focus === 'farming' ? ['mar_hacienda'] : []
    };
    var v = KHAMLET.village(vSpec);
    var farm = null;
    if (sp.focus === 'farming' && !v.error) {
      var hw = (v.outWorks || []).filter(function (w) { return w.key === 'mar_hacienda'; })[0] || null;
      farm = KHAMLET.farmland({
        id: sp.id + ':farmland', world: MARR_SIM.TUNE.seed,
        centre: {x: sp.resource.x, z: sp.resource.z},
        hands: v.census.focusJobs, crops: sp.crops,
        farms: hw ? {key: hw.key, n: hw.n, box: hw.box} : null,
        from: {x: v.site.x, z: v.site.z}
      });
      if (farm.records && farm.records.length) v.records = v.records.concat(farm.records);
    }
    return {spec: sp, village: v, farmland: farm, dealtName: names[sp.id]};
  });
};

MARR_SIM.declare = function (opts) {
  opts = opts || {};
  var T = MARR_SIM.TUNE, m0 = T.clock.start;
  var C = {m: m0, day: Math.floor(m0 / 1440), hour: (m0 % 1440 + 0.5) / 60, t: 0};
  var state = MARR_SIM.STATE = {clock: C, problems: [], settlements: {}, villages: [], routes: [], buyersSold: {}, ships: {}};

  SIM.init({
    seed: T.seed,
    hour: function () { return C.hour; },
    day: function () { return C.day; },
    t: function () { return C.t; },
    err: function (m) { state.problems.push(m); }
  });
  SIM.STEP_MAX = T.clock.stepMax; SIM.LAG = T.clock.lag; SIM.REACH = T.clock.reach;

  ['SLEEP', 'EAT', 'REST', 'IDLE', 'HOUSEWORK', 'WORK', 'BUY', 'SOCIALIZE', 'HAUL', 'UNLOAD'].forEach(function (a) {
    if (!SIM.R.activity[a]) SIM.activity({id: a, indoor: a === 'SLEEP' || a === 'EAT' || a === 'HOUSEWORK'});
  });
  SIM.faction({id: 'izani_marr', name: 'Gobernación Marítima de Marr (Empar de Son)'});

  /* Items & diet */
  var itemKinds = {
    shirt: {cat: 'clothes', slot: 'torso', life: 45, good: 'cloth'},
    hoe: {cat: 'tool', workLife: 180, good: 'tools'},
    pottery: {cat: 'household', material: 12, good: 'pottery'},
    rum_flask: {cat: 'luxury', material: 20, good: 'rum'},
    cacao_cup: {cat: 'luxury', material: 18, good: 'cacao'}
  };
  T.foods.forEach(function (f) { itemKinds[f] = {cat: 'food', food: true}; });
  SIM.items({
    kinds: itemKinds,
    free: ['IDLE', 'REST'],
    secPerMinute: T.clock.secPerMinute,
    meals: 2,
    perMeal: 1,
    days: 3,
    low: 1,
    treat: {at: 25, items: [[0, 'rum_flask'], [1, 'cacao_cup'], [2, 'pottery']]}
  });

  /* Walking graph for Porta Marr */
  var nodes = [
    {id: 0, x: -10, y: 2, z: -125},
    {id: 1, x: -30, y: 2, z: -135},
    {id: 2, x: -80, y: 2, z: -110},
    {id: 3, x: -35, y: 2, z: -95},
    {id: 4, x: 10, y: 3, z: -20},
    {id: 5, x: 25, y: 4, z: 5},
    {id: 6, x: 35, y: 4, z: 25},
    {id: 7, x: 60, y: 5, z: 35},
    {id: 8, x: -70, y: 2, z: 15},
    {id: 9, x: -45, y: 2, z: 30},
    {id: 10, x: 95, y: 6, z: 40},
    {id: 11, x: 120, y: 6, z: 55},
    {id: 12, x: 80, y: 6, z: 75},
    {id: 13, x: 0, y: 8, z: 95}
  ];
  var pairs = [[0, 1], [0, 3], [1, 2], [2, 3], [0, 4], [3, 4], [4, 5], [5, 6], [6, 7], [4, 8], [8, 9], [7, 10], [10, 11], [10, 12], [5, 13], [12, 13]];
  var edges = pairs.map(function (e, i) {
    var a = nodes[e[0]], b = nodes[e[1]];
    return {id: i, a: e[0], b: e[1], kind: 'street', len: Math.hypot(a.x - b.x, a.z - b.z), w: 8};
  });
  SIM.nav.layer('pedestrian', {nodes: nodes, edges: edges});

  /* Declare Porta Marr (Capital Settlement) */
  SIM.settlement({id: 'marr', faction: 'izani_marr', name: 'Porta Marr'});
  SIM.org({id: 'marr.folk', faction: 'izani_marr', name: 'Los Vecinos y Gremios de Marr'});

  var marrPlaces = [];
  var homeKeys = ['mar_casa_patio', 'mar_townhouse_iron', 'mar_corner_french', 'mar_corner_mirador', 'mar_bruges_canal_house', 'mar_creole_cottage', 'mar_shotgun_double', 'mar_shades_tenement', 'mar_garden_mansion', 'mar_palacio_baroque'];
  for (var h = 0; h < 28; h++) {
    var nd = nodes[h % nodes.length], hk = homeKeys[h % homeKeys.length], beds = 8;
    var Ph = SIM.place({
      id: 'marr.home' + h, name: 'Casa de Marr #' + (h + 1), kind: 'home',
      x: nd.x + (h % 4 - 1.5) * 6, y: nd.y, z: nd.z + (Math.floor(h / 4) - 3) * 5,
      door: {x: nd.x, y: nd.y, z: nd.z},
      activities: {SLEEP: beds, EAT: beds, REST: beds, IDLE: beds, HOUSEWORK: beds},
      indoor: true, settlement: 'marr', tags: {key: hk, role: 'house'}
    });
    marrPlaces.push(Ph);
  }
  /* Civic & Plaza social places */
  marrPlaces.push(SIM.place({
    id: 'marr.palace_plaza', name: 'Palacio de Gobernar y Plaza de Armas', kind: 'plaza',
    x: 0, y: 8, z: 95, door: {x: 0, y: 8, z: 95},
    activities: {SOCIALIZE: 60}, indoor: {}, open: [6, 23], settlement: 'marr', tags: {key: 'mar_governor_palace', role: 'civic'}
  }));
  marrPlaces.push(SIM.place({
    id: 'marr.guild_hall', name: 'Gilda de Navigarz y Templa de Mar', kind: 'civic',
    x: -10, y: 2, z: -125, door: {x: -10, y: 2, z: -125},
    activities: {WORK: 12, SOCIALIZE: 30}, indoor: true, open: [6, 22], settlement: 'marr', tags: {key: 'mar_navigators_guild', role: 'civic'}
  }));
  /* Harbour canoe/ship stop */
  var marrStop = SIM.place({
    id: 'marr.stop', name: 'Muelle Real de la Aduana (Porta Marr)', kind: 'canoe stop',
    x: -10, y: 2, z: -125, door: {x: -10, y: 2, z: -125},
    activities: {WORK: 8}, indoor: {}, settlement: 'marr', tags: {key: 'mar_canal_quay', role: 'landing'}
  });
  marrPlaces.push(marrStop);

  /* City Warehouses */
  T.cityWarehouses.forEach(function (w) {
    marrPlaces.push(SIM.place({
      id: w.id, name: w.name, kind: 'warehouse', x: w.x, y: 3, z: w.z,
      door: {x: w.x, y: 3, z: w.z}, activities: {WORK: 4}, indoor: true, settlement: 'marr', tags: {key: w.key, role: 'warehouse'}
    }));
  });
  /* City Producers */
  T.cityProducers.forEach(function (p) {
    marrPlaces.push(SIM.place({
      id: p.id, name: p.name, kind: p.kind, x: p.x, y: 3, z: p.z,
      door: {x: p.x, y: 3, z: p.z}, activities: {WORK: p.posts}, indoor: true, settlement: 'marr', tags: {key: p.key, role: 'works'}
    }));
  });
  /* City Shops */
  T.cityShops.forEach(function (sh) {
    marrPlaces.push(SIM.place({
      id: sh.id, name: sh.name, kind: 'shop', x: sh.x, y: 3, z: sh.z,
      door: {x: sh.x, y: 3, z: sh.z}, activities: {WORK: 3, BUY: 12, SOCIALIZE: 10}, open: [6, 22], indoor: true, settlement: 'marr', tags: {key: sh.key, role: 'shop'}
    }));
  });

  var workKinds = {};
  marrPlaces.forEach(function (P) { if (P.activities.WORK && P.kind !== 'home') workKinds[P.kind] = 1; });
  var totalPosts = marrPlaces.reduce(function (n, P) { return n + (P.kind !== 'home' && P.activities.WORK ? P.activities.WORK : 0); }, 0);
  var prefers = {SLEEP: {pin: 'home'}, EAT: {pin: 'home'}, REST: {pin: 'home'}, IDLE: {pin: 'home'}, HOUSEWORK: {pin: 'home'}, WORK: {pin: 'work'}};
  var workSched = [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [18, 'SOCIALIZE'], [20, 'REST'], [22, 'SLEEP']];
  var kinSched = [[0, 'SLEEP'], [6, 'EAT'], [7, 'HOUSEWORK'], [10, 'BUY'], [12, 'EAT'], [13, 'HOUSEWORK'], [17, 'SOCIALIZE'], [20, 'REST'], [22, 'SLEEP']];

  SIM.role({id: 'marr.worker', name: 'artesano de Marr', org: 'marr.folk', settlement: 'marr', count: totalPosts, homes: ['home'], prefers: prefers, work: {kinds: Object.keys(workKinds), act: 'WORK', near: true}, sched: workSched});
  SIM.role({id: 'marr.kin', name: 'vecino de Marr', org: 'marr.folk', settlement: 'marr', fill: true, homes: ['home'], prefers: prefers, sched: kinSched});
  var marrPop = SIM.populate({settlement: 'marr', prefix: 'marr.'});

  /* City Economy */
  var goodsCfg = {};
  T.goods.forEach(function (g) {
    goodsCfg[g] = {unit: T.foods.indexOf(g) >= 0 ? 'serving' : 'lot', minLoad: 5};
  });
  var E_marr = SIM.economy({
    goods: goodsCfg,
    inputs: Object.assign({}, T.inputs),
    every: 60,
    window: 1,
    cart: {cap: 120, load: 5, unload: 5, minLoad: 5},
    meal: {per: 1, foods: T.foods.slice()},
    useShort: true,
    govern: {every: 60, cover: 3, ti: 1.5, alpha: 0.3, min: 0.25, max: 1.5}
  }, {settlement: 'marr'});

  SIM.store('marr.stop', {kind: 'site'});
  T.cityWarehouses.forEach(function (w) { SIM.store(w.id, {kind: 'warehouse'}); });
  T.cityProducers.forEach(function (p) { SIM.recipe(p.id, {out: p.out.slice(), rate: p.rate, cap: p.cap}); });
  T.cityShops.forEach(function (sh) { SIM.shop(sh.id, sh.sells.slice()); });

  /* Opening stock in Porta Marr warehouses & household larders */
  var W_marr = E_marr.warehouses;
  T.goods.forEach(function (g) {
    var initN = T.foods.indexOf(g) >= 0 ? 900 : 180;
    W_marr.forEach(function (W, j) { W.stock[g] = Math.floor(initN / W_marr.length) + (j === 0 ? initN % W_marr.length : 0); });
  });
  marrPlaces.filter(function (P) { return P.kind === 'home'; }).forEach(function (P) {
    P.people = 8;
    P.store = {fish: 16, rice: 12, maize: 12, banana: 8, meat: 8, bread: 12};
  });

  /* City Carts */
  SIM.role({id: 'marr.cart', org: 'marr.folk', name: 'carretero de Marr', sched: [[0, 'HAUL']], speed: SIM.SPEED.cart});
  for (var c = 0; c < 4; c++) {
    var Hw = W_marr[c % W_marr.length];
    var ca = SIM.actor({id: 'marr.cart' + c, role: 'marr.cart', org: 'marr.folk', home: Hw.id, cls: 'cart', job: 'carters'});
    ca.pos = {x: Hw.x, y: Hw.y || 0, z: Hw.z};
    SIM.cart(ca);
  }
  if (opts.abstractCity !== false) SIM.level('marr', 'abstract');
  state.settlements.marr = {id: 'marr', name: 'Porta Marr', pop: marrPop, places: marrPlaces.length};

  /* Declare the 9 Marr-style Subordinate Settlements, Island Outposts, Hamlets & Work Sites */
  var built = MARR_SIM.buildVillages();
  built.forEach(function (B) {
    var sp = B.spec, v = B.village, id = sp.id;
    SIM.settlement({id: id, faction: 'izani_marr', name: sp.name + ' (' + B.dealtName.name + ')', parent: 'marr'});
    SIM.org({id: id + '.folk', faction: 'izani_marr', name: 'Los Vecinos de ' + sp.name});

    var row = KHAMLET.row('marr'), jobsOf = {};
    (row.works[sp.focus] || []).forEach(function (w) { jobsOf[w.key] = w.jobs; });
    var vPlaces = [], beds = 0, quay = null;
    v.records.forEach(function (r) {
      var role = r.role;
      var kind = role === 'house' ? 'home' : role === 'warehouse' ? 'warehouse' : role === 'food' ? 'staples' : role === 'landing' ? 'canoe stop' : role === 'works' ? 'works_' + sp.focus : role;
      var acts = {};
      if (role === 'house') {
        var b = Math.max(4, Math.round((r.households > 0 ? r.households : 1) * row.household));
        acts = {SLEEP: b, EAT: b, REST: b, IDLE: b, HOUSEWORK: b};
        beds += b;
      } else if (role === 'works') {
        acts = {WORK: jobsOf[r.key] || 8};
      } else if (role === 'landing') {
        acts = {WORK: 4};
      } else {
        acts = {WORK: row.services[role] || 2};
        if (role === 'food' || role === 'general') acts.BUY = 6;
      }
      var Pl = SIM.place({
        id: r.id, name: sp.name + ': ' + r.key, kind: kind,
        x: r.x, y: 0, z: r.z, ry: r.ry || 0, door: {x: r.x, y: 0, z: r.z},
        activities: acts, indoor: role === 'landing' ? {} : true, settlement: id,
        tags: {key: r.key, role: role, hamlet: id, focus: sp.focus}
      });
      if (role === 'landing') { quay = Pl; }
      vPlaces.push(Pl);
    });

    var vWk = {}, vPosts = 0;
    vPlaces.forEach(function (P) { if (P.activities.WORK && P.kind !== 'home') { vPosts += P.activities.WORK; vWk[P.kind] = 1; } });
    SIM.role({id: id + '.worker', name: 'vecino trabajador', org: id + '.folk', settlement: id, count: Math.min(vPosts, beds), homes: ['home'], prefers: prefers, work: {kinds: Object.keys(vWk), act: 'WORK', near: true}, sched: workSched});
    SIM.role({id: id + '.kin', name: 'familiar', org: id + '.folk', settlement: id, fill: true, homes: ['home'], prefers: prefers, sched: kinSched});
    var vPop = SIM.populate({settlement: id, prefix: id + '.'});

    var Ev = SIM.economy({
      goods: goodsCfg,
      inputs: {},
      every: 60,
      window: 1,
      cart: {cap: 100, load: 5, unload: 5, minLoad: 5},
      meal: {per: 1, foods: T.foods.slice()},
      useShort: true,
      govern: {every: 60, cover: 3, ti: 1.5, alpha: 0.3, min: 0.25, max: 1.5, exported: false, pool: ['marr']}
    }, {settlement: id});

    if (quay) SIM.store(quay.id, {kind: 'site'});
    SIM.site({id: sp.resource.id, settlement: id, kind: sp.resource.kind, goods: sp.makes.slice(), grade: sp.resource.grade, amount: 250000, regen: 600, yield: 1.5});

    var worksIdx = 0;
    vPlaces.forEach(function (P) {
      if (P.kind === 'warehouse') { SIM.store(P.id, {kind: 'warehouse'}); return; }
      if (P.kind === 'staples') { SIM.shop(P.id, T.foods.slice()); return; }
      if (P.tags.role === 'works') {
        var gOut = [sp.makes[worksIdx % sp.makes.length]];
        worksIdx++;
        SIM.recipe(P.id, {out: gOut, rate: 1.8, cap: 350, site: sp.resource.id});
      }
    });

    var Wv = Ev.warehouses;
    var vActors = SIM.all('actor').filter(function (a) { return !a.driven && SIM.settlementOf(a) === id; });
    var foodNeed = vActors.length * 2 * 5;
    T.foods.forEach(function (f, j) { Wv[j % Wv.length].stock[f] = (Wv[j % Wv.length].stock[f] || 0) + Math.round(foodNeed / T.foods.length); });
    sp.makes.forEach(function (g) { Wv[0].stock[g] = (Wv[0].stock[g] || 0) + 120; });

    vPlaces.filter(function (P) { return P.kind === 'home'; }).forEach(function (P) {
      P.people = Math.round(row.household);
      P.store = {fish: 10, rice: 10, maize: 10, banana: 6, meat: 6, bread: 8};
    });

    SIM.role({id: id + '.cart', org: id + '.folk', name: 'carretero', sched: [[0, 'HAUL']], speed: SIM.SPEED.cart});
    for (var kc = 0; kc < 2; kc++) {
      var Hc = Wv[kc % Wv.length];
      var ac = SIM.actor({id: id + '.cart' + kc, role: id + '.cart', org: id + '.folk', home: Hc.id, cls: 'cart', job: 'carters'});
      ac.pos = {x: Hc.x, y: 0, z: Hc.z};
      SIM.cart(ac);
    }

    /* Trade routes to/from Porta Marr (sea route for islands & coastal ports, road route for mainland villages) */
    var isSea = !!(sp.overseas && quay);
    var mins = isSea ? Math.max(60, Math.round(sp.seaKm * 1000 / (14 * 1000 / 60))) : Math.max(60, Math.round(sp.roadKm * 1000 / (9 * 1000 / 60)));
    var stopA = isSea ? quay.id : Wv[0].id;
    var stopB = isSea ? 'marr.stop' : W_marr[0].id;
    var gOut = {}, eOut = {}, gIn = {}, eIn = {};
    gOut[id] = sp.makes.slice(); gOut.marr = [];
    eOut.marr = {}; sp.makes.forEach(function (g) { eOut.marr[g] = 40; });
    gIn.marr = T.foods.filter(function (f) { return sp.makes.indexOf(f) < 0; }); gIn[id] = [];
    eIn[id] = {}; gIn.marr.forEach(function (f) { eIn[id][f] = vActors.length * 2 / T.foods.length; });

    var rOut = SIM.trade({id: id + ':out', stops: [{settlement: id, place: stopA}, {settlement: 'marr', place: stopB}], cap: isSea ? 260 : 160, carriers: 1, minutes: mins, mins: 20, keep: sp.focus === 'farming' ? 80 : 15, want: 1e6, goods: gOut, expect: eOut});
    var rIn = SIM.trade({id: id + ':in', stops: [{settlement: 'marr', place: stopB}, {settlement: id, place: stopA}], cap: isSea ? 260 : 160, carriers: 1, minutes: mins, mins: 20, keep: 120, want: 240, goods: gIn, expect: eIn});
    state.routes.push(rOut.id, rIn.id);

    /* Coastal dual leg (Salinas & Puerto Carena de Plata also ship by fjord barge to Marr's Aduana stop) */
    var seaRoute = null;
    if (!sp.overseas && sp.seaKm != null && quay) {
      var sMins = Math.max(60, Math.round(sp.seaKm * 1000 / (14 * 1000 / 60)));
      var rSea = SIM.trade({id: id + ':sea', stops: [{settlement: id, place: quay.id}, {settlement: 'marr', place: 'marr.stop'}], cap: 240, carriers: 1, minutes: sMins, mins: 20, keep: 15, want: 1e6, goods: gOut, expect: eOut});
      seaRoute = rSea.id;
      state.routes.push(rSea.id);
    }

    SIM.level(id, 'abstract');
    state.villages.push({
      id: id, name: sp.name, dealtName: B.dealtName, kind: sp.kind, islandId: sp.islandId,
      focus: sp.focus, px: sp.px, py: sp.py, overseas: !!sp.overseas,
      people: vActors.length, workers: vActors.filter(function (a) { return a.work; }).length,
      posts: vPosts, beds: beds, records: v.records.length,
      makes: sp.makes.slice(), outRoute: rOut.id, inRoute: rIn.id, seaRoute: seaRoute,
      farmlandHa: B.farmland ? B.farmland.farmedHa : 0
    });
  });

  if (SIM.stepHooks.indexOf(MARR_SIM.simBuyers) < 0) SIM.stepHooks.push(MARR_SIM.simBuyers);
  MARR_SIM.initHarbour();
  if (SIM.stepHooks.indexOf(MARR_SIM.simHarbourStep) < 0) SIM.stepHooks.push(MARR_SIM.simHarbourStep);
  state.problems = state.problems.concat(SIM.check());
  return state;
};

/* 5. RING SEA VESSEL HARBOUR BERTHS & SIM-LAYER DOCKING, UNLOADING & RELOADING (Porta Marr & Canals) */
MARR_SIM.HARBOUR_FLEET = [
  {
    id: 'ship.koralia', name: 'Nao Santa Koralia', vesselKey: 'hykGalleon', origin: 'marr_sombra',
    berthName: 'Guarfa de Aduana', placeId: 'marr.aduana_store',
    dock: [-78, -162, Math.PI * 0.5], approach: [-145, -245, 0.35], sea: [-210, -345, 0.45],
    inbound: {sugar: 18, cacao: 14, timber: 16, stone: 12},
    outbound: {rum: 16, pottery: 10, cloth: 10, cordage: 12},
    initPhase: 'unloading', initProg: 0.35, cycleMins: {approaching: 18, docking: 8, unloading: 22, reloading: 22, departing: 14, at_sea: 16}
  },
  {
    id: 'ship.soldeson', name: 'Karraka Sol de Son', vesselKey: 'xanaduCarrack', origin: 'marr_garita',
    berthName: 'Piar de Kostomz', placeId: 'marr.aduana_store',
    dock: [-54, -172, -Math.PI * 0.5], approach: [-68, -238, -0.15], sea: [-95, -340, -0.2],
    inbound: {salt: 20, fish: 18, charcoal: 14},
    outbound: {rum: 16, sugar: 14, cordage: 12, hulls: 2},
    initPhase: 'reloading', initProg: 0.45, cycleMins: {approaching: 16, docking: 8, unloading: 20, reloading: 20, departing: 14, at_sea: 16}
  },
  {
    id: 'ship.estrella', name: 'Korbita Estrella del Anillo', vesselKey: 'hykCorbita', origin: 'marr_plata',
    berthName: 'Piar de Sidi Olda', placeId: 'marr.aduana_store',
    dock: [-30, -170, Math.PI * 0.48], approach: [-28, -232, 0.08], sea: [-20, -335, 0.1],
    inbound: {timber: 18, pitch: 12, charcoal: 14},
    outbound: {bread: 14, rum: 12, tools: 8, cordage: 10},
    initPhase: 'docking', initProg: 0.65, cycleMins: {approaching: 15, docking: 7, unloading: 18, reloading: 18, departing: 12, at_sea: 15}
  },
  {
    id: 'ship.feri', name: 'Feri de las Islas', vesselKey: 'vothFerry', origin: 'marr_garita',
    berthName: 'Islipa de Feri', placeId: 'marr.aduana_store',
    dock: [26, -158, Math.PI], approach: [30, -218, Math.PI * 0.92], sea: [78, -318, Math.PI * 0.85],
    inbound: {fish: 16, salt: 12, banana: 14},
    outbound: {bread: 14, rice: 12, maize: 12},
    initPhase: 'unloading', initProg: 0.7, cycleMins: {approaching: 12, docking: 6, unloading: 14, reloading: 14, departing: 10, at_sea: 12}
  },
  {
    id: 'ship.jade', name: 'Junko Dragón de Jade', vesselKey: 'vothJunk', origin: 'marr_stara',
    berthName: 'Guarfa de Kren', placeId: 'marr.sombras_bodega',
    dock: [56, -162, Math.PI * 0.5], approach: [74, -235, -0.25], sea: [120, -342, -0.35],
    inbound: {cotton: 22, clay: 16, cacao: 14},
    outbound: {sugar: 16, rum: 16, pottery: 10, cordage: 10},
    initPhase: 'unloading', initProg: 0.2, cycleMins: {approaching: 18, docking: 8, unloading: 22, reloading: 22, departing: 14, at_sea: 16}
  },
  {
    id: 'ship.brisa', name: 'Dhow Brisa de Stara', vesselKey: 'vothDhow', origin: 'marr_faro',
    berthName: 'Piar de Marchondaz Guesta', placeId: 'marr.sombras_bodega',
    dock: [86, -172, -Math.PI * 0.48], approach: [104, -236, -0.3], sea: [155, -335, -0.4],
    inbound: {stone: 20, fish: 14, salt: 12},
    outbound: {maize: 12, rice: 12, bread: 12, cloth: 8},
    initPhase: 'approaching', initProg: 0.6, cycleMins: {approaching: 14, docking: 7, unloading: 18, reloading: 18, departing: 12, at_sea: 14}
  },
  {
    id: 'ship.vapor', name: 'Vapor Rrivar Cistal', vesselKey: 'izizWheel', origin: 'marr_salinas',
    berthName: 'Piar de Marchondaz Esta', placeId: 'marr.sombras_bodega',
    dock: [118, -175, Math.PI * 0.52], approach: [132, -238, -0.22], sea: [188, -332, -0.35],
    inbound: {salt: 22, fish: 16, meat: 12, leather: 10},
    outbound: {rum: 14, tools: 8, cordage: 10, cloth: 8},
    initPhase: 'reloading', initProg: 0.8, cycleMins: {approaching: 15, docking: 7, unloading: 18, reloading: 18, departing: 12, at_sea: 14}
  },
  {
    id: 'ship.tortuga', name: 'Tortuga Imperial de Marr', vesselKey: 'izizTurtle', origin: 'marr_garita',
    berthName: 'Berth de Kostgarda', placeId: 'marr.aduana_store',
    dock: [-162, -184, Math.PI * 0.55], approach: [-176, -232, 0.4], sea: [-265, -328, 0.55],
    inbound: {bullion: 10, salt: 14, tin: 10},
    outbound: {bread: 12, meat: 10, rum: 10, hulls: 2},
    initPhase: 'unloading', initProg: 0.5, cycleMins: {approaching: 16, docking: 8, unloading: 20, reloading: 20, departing: 14, at_sea: 16}
  },
  {
    id: 'ship.galera', name: 'Galera Guardia del Cistal', vesselKey: 'hykGalley', origin: 'marr_minas',
    berthName: 'Kostgarda Pier', placeId: 'marr.aduana_store',
    dock: [-102, -172, -Math.PI * 0.5], approach: [-118, -234, 0.25], sea: [-165, -338, 0.35],
    inbound: {ore: 18, copper: 14, pitch: 14},
    outbound: {tools: 10, bread: 12, rum: 10, cordage: 10},
    initPhase: 'departing', initProg: 0.4, cycleMins: {approaching: 14, docking: 6, unloading: 16, reloading: 16, departing: 12, at_sea: 14}
  },
  {
    id: 'ship.koralina', name: 'Dhoni Koralina', vesselKey: 'izizDhoni', origin: 'marr_sombra',
    berthName: 'Landiñ de Fix', placeId: 'marr.stara_bodega',
    dock: [194, -172, Math.PI * 0.55], approach: [204, -228, -0.35], sea: [248, -322, -0.45],
    inbound: {fish: 24, banana: 16, cacao: 12},
    outbound: {salt: 14, cordage: 10, tools: 8},
    initPhase: 'unloading', initProg: 0.6, cycleMins: {approaching: 13, docking: 6, unloading: 16, reloading: 16, departing: 11, at_sea: 13}
  },
  {
    id: 'ship.lakatoi', name: 'Lakatoi de Seto', vesselKey: 'islanderLakatoi', origin: 'marr_faro',
    berthName: 'Piar de Xedaz', placeId: 'marr.stara_bodega',
    dock: [226, -184, -Math.PI * 0.46], approach: [238, -238, -0.4], sea: [285, -328, -0.5],
    inbound: {fish: 18, timber: 16, cacao: 12, cotton: 14},
    outbound: {rum: 14, sugar: 12, cloth: 8, pottery: 10},
    initPhase: 'reloading', initProg: 0.3, cycleMins: {approaching: 15, docking: 7, unloading: 18, reloading: 18, departing: 12, at_sea: 15}
  },
  {
    id: 'ship.urca', name: 'Urca Maderera de Koral', vesselKey: 'vothHulk', origin: 'marr_sombra',
    berthName: 'Guarfa de Rropa', placeId: 'marr.stara_bodega',
    dock: [256, -186, Math.PI * 0.54], approach: [268, -242, -0.38], sea: [318, -332, -0.48],
    inbound: {timber: 24, cotton: 20, pitch: 14, charcoal: 14},
    outbound: {cordage: 14, hulls: 2, rum: 12},
    initPhase: 'unloading', initProg: 0.85, cycleMins: {approaching: 18, docking: 8, unloading: 24, reloading: 22, departing: 14, at_sea: 16}
  },
  {
    id: 'ship.remolcador', name: 'Remolcador Faro de Stara', vesselKey: 'salvageTug', origin: 'marr_plata',
    berthName: 'Piar de Rropa', placeId: 'marr.stara_bodega',
    dock: [288, -196, -Math.PI * 0.45], approach: [302, -246, -0.45], sea: [348, -325, -0.55],
    inbound: {ore: 16, stone: 14, charcoal: 14},
    outbound: {cordage: 10, tools: 8, rum: 10},
    initPhase: 'approaching', initProg: 0.25, cycleMins: {approaching: 12, docking: 6, unloading: 14, reloading: 14, departing: 10, at_sea: 12}
  },
  {
    id: 'ship.gabarra_aduana', name: 'Gabarra de Aduana', vesselKey: 'izizLighter', origin: 'marr_vega',
    berthName: 'Quay de Knal Greta Guesta', placeId: 'marr.aduana_store', canal: 'greta',
    dock: [-9, -55, Math.PI * 0.5], approach: [-4, -118, Math.PI * 0.5], sea: [-2, -162, Math.PI * 0.5],
    inbound: {rice: 18, maize: 18, cotton: 14},
    outbound: {salt: 12, tools: 8, pottery: 8},
    initPhase: 'unloading', initProg: 0.4, cycleMins: {approaching: 12, docking: 5, unloading: 15, reloading: 15, departing: 10, at_sea: 10}
  },
  {
    id: 'ship.barcaza_palas', name: 'Barcaza de Trapiche', vesselKey: 'vothBarge', origin: 'marr_stara',
    berthName: 'Quay de Palas', placeId: 'marr.sombras_bodega', canal: 'greta_south',
    dock: [-8, 35, -Math.PI * 0.5], approach: [0, 145, -Math.PI * 0.5], sea: [1, 245, -Math.PI * 0.5],
    inbound: {sugar: 22, cacao: 14, banana: 14},
    outbound: {rum: 14, tools: 8, cordage: 10},
    initPhase: 'reloading', initProg: 0.55, cycleMins: {approaching: 14, docking: 5, unloading: 16, reloading: 16, departing: 12, at_sea: 10}
  },
  {
    id: 'ship.gabarra_sauta', name: 'Gabarra de Alambik', vesselKey: 'izizLighter', origin: 'marr_stara',
    berthName: 'Quay de Sauta Guesta', placeId: 'marr.stara_bodega', canal: 'greta_deep',
    dock: [-9, 412, -Math.PI * 0.5], approach: [1, 478, -Math.PI * 0.5], sea: [3, 555, -Math.PI * 0.5],
    inbound: {sugar: 18, cacao: 14, banana: 16},
    outbound: {rum: 12, cloth: 8, bread: 10},
    initPhase: 'unloading', initProg: 0.3, cycleMins: {approaching: 12, docking: 5, unloading: 15, reloading: 15, departing: 10, at_sea: 10}
  },
  {
    id: 'ship.barcaza_xedaz', name: 'Barcaza de Melaza', vesselKey: 'vothBarge', origin: 'marr_salinas',
    berthName: 'Quay de Barjaz', placeId: 'marr.stara_bodega', canal: 'xedaz',
    dock: [158, 105, Math.PI * 0.5], approach: [162, 18, Math.PI * 0.5], sea: [158, -115, Math.PI * 0.5],
    inbound: {salt: 18, cotton: 16, pitch: 12},
    outbound: {rum: 14, cordage: 12},
    initPhase: 'approaching', initProg: 0.5, cycleMins: {approaching: 14, docking: 5, unloading: 16, reloading: 16, departing: 12, at_sea: 10}
  },
  {
    id: 'ship.oruwa_peska', name: 'Oruwa de Peskadarz', vesselKey: 'islanderOruwa', origin: 'marr_garita',
    berthName: 'Quay de Xedaz Guesta', placeId: 'marr.stara_bodega',
    dock: [174, -158, Math.PI * 0.45], approach: [166, -198, 0.3], sea: [152, -265, 0.25],
    inbound: {fish: 16, salt: 10},
    outbound: {bread: 10, cordage: 8},
    initPhase: 'docking', initProg: 0.4, cycleMins: {approaching: 10, docking: 5, unloading: 12, reloading: 12, departing: 8, at_sea: 10}
  }
];

MARR_SIM.PHASE_ORDER = ['approaching', 'docking', 'unloading', 'reloading', 'departing', 'at_sea'];

MARR_SIM.initHarbour = function () {
  var S = MARR_SIM.STATE;
  if (!S) return null;
  var H = {
    totalUnloaded: 0,
    totalReloaded: 0,
    unloadedByGood: {},
    reloadedByGood: {},
    completedDockings: 0,
    vessels: []
  };
  MARR_SIM.HARBOUR_FLEET.forEach(function (spec) {
    var phase = spec.initPhase || 'approaching';
    var prog = spec.initProg == null ? 0 : spec.initProg;
    var hold = {};
    if (phase === 'approaching' || phase === 'docking') {
      Object.keys(spec.inbound).forEach(function (g) { hold[g] = spec.inbound[g]; });
    } else if (phase === 'unloading') {
      Object.keys(spec.inbound).forEach(function (g) { hold[g] = Math.round(spec.inbound[g] * (1 - prog)); });
    } else if (phase === 'reloading') {
      Object.keys(spec.outbound).forEach(function (g) { hold[g] = Math.round(spec.outbound[g] * prog); });
    } else {
      Object.keys(spec.outbound).forEach(function (g) { hold[g] = spec.outbound[g]; });
    }
    var v = {
      id: spec.id,
      name: spec.name,
      vesselKey: spec.vesselKey,
      origin: spec.origin,
      berthName: spec.berthName,
      placeId: spec.placeId,
      canal: spec.canal || null,
      dock: spec.dock.slice(),
      approach: spec.approach.slice(),
      sea: spec.sea.slice(),
      inbound: Object.assign({}, spec.inbound),
      outbound: Object.assign({}, spec.outbound),
      cycleMins: Object.assign({}, spec.cycleMins),
      phase: phase,
      progress: prog,
      hold: hold,
      pierStageRatio: phase === 'unloading' ? prog : (phase === 'reloading' ? (1 - prog * 0.5) : (phase === 'docking' ? 0.15 : 0.1)),
      unloadedTotal: {},
      reloadedTotal: {},
      cycles: 0,
      pos: {x: spec.dock[0], y: 0, z: spec.dock[1], ry: spec.dock[2]}
    };
    MARR_SIM._updateVesselPose(v);
    H.vessels.push(v);
  });
  S.harbour = H;
  return H;
};

MARR_SIM._lerpAngle = function (a, b, t) {
  var d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return a + d * t;
};

MARR_SIM._updateVesselPose = function (v) {
  var p = Math.max(0, Math.min(1, v.progress));
  var s = p * p * (3 - 2 * p);
  if (v.phase === 'unloading' || v.phase === 'reloading') {
    v.pos.x = v.dock[0];
    v.pos.z = v.dock[1];
    v.pos.ry = v.dock[2];
    v.pierStageRatio = v.phase === 'unloading' ? (0.2 + 0.8 * p) : (1.0 - 0.65 * p);
  } else if (v.phase === 'docking') {
    v.pos.x = v.approach[0] + (v.dock[0] - v.approach[0]) * s;
    v.pos.z = v.approach[1] + (v.dock[1] - v.approach[1]) * s;
    v.pos.ry = MARR_SIM._lerpAngle(v.approach[2], v.dock[2], s);
    v.pierStageRatio = 0.15 * s;
  } else if (v.phase === 'approaching') {
    v.pos.x = v.sea[0] + (v.approach[0] - v.sea[0]) * s;
    v.pos.z = v.sea[1] + (v.approach[1] - v.sea[1]) * s;
    v.pos.ry = MARR_SIM._lerpAngle(v.sea[2], v.approach[2], s);
    v.pierStageRatio = 0.08;
  } else if (v.phase === 'departing') {
    v.pos.x = v.dock[0] + (v.approach[0] - v.dock[0]) * s;
    v.pos.z = v.dock[1] + (v.approach[1] - v.dock[1]) * s;
    v.pos.ry = MARR_SIM._lerpAngle(v.dock[2], v.approach[2] + Math.PI, s * 0.6);
    v.pierStageRatio = Math.max(0.08, 0.35 * (1 - s));
  } else {
    /* at_sea: outbound from approach to sea, then turns for next approach */
    v.pos.x = v.approach[0] + (v.sea[0] - v.approach[0]) * s;
    v.pos.z = v.approach[1] + (v.sea[1] - v.approach[1]) * s;
    v.pos.ry = MARR_SIM._lerpAngle(v.approach[2] + Math.PI, v.sea[2], s);
    v.pierStageRatio = 0.05;
  }
};

MARR_SIM._transferCargoSlice = function (v, phase, dp, bookLiveEcon) {
  var H = MARR_SIM.STATE && MARR_SIM.STATE.harbour;
  if (!H) return;
  if (phase === 'unloading') {
    Object.keys(v.inbound).forEach(function (g) {
      var targetRem = Math.max(0, Math.round(v.inbound[g] * (1 - v.progress)));
      var cur = v.hold[g] || 0;
      var delta = Math.max(0, cur - targetRem);
      if (delta <= 0 && dp >= 0.99 && cur > 0) delta = cur;
      if (delta > 0) {
        v.hold[g] = Math.max(0, cur - delta);
        v.unloadedTotal[g] = (v.unloadedTotal[g] || 0) + delta;
        H.totalUnloaded += delta;
        H.unloadedByGood[g] = (H.unloadedByGood[g] || 0) + delta;
        if (bookLiveEcon && typeof SIM !== 'undefined' && SIM.econ && SIM.econ('marr')) {
          SIM.withEcon('marr', function () {
            if (SIM.ECON && SIM.ECON.goods && SIM.ECON.goods[g]) {
              SIM.economyLand(g, delta, v.placeId);
              SIM.economyBook('imported', g, delta);
            }
          });
        }
      }
    });
  } else if (phase === 'reloading') {
    var B = MARR_SIM.TUNE && MARR_SIM.TUNE.buyers;
    Object.keys(v.outbound).forEach(function (g) {
      var targetHave = Math.min(v.outbound[g], Math.round(v.outbound[g] * v.progress));
      var cur = v.hold[g] || 0;
      var want = Math.max(0, targetHave - cur);
      if (want > 0) {
        var taken = want;
        if (bookLiveEcon && typeof SIM !== 'undefined' && SIM.econ && SIM.econ('marr')) {
          SIM.withEcon('marr', function () {
            if (SIM.ECON && SIM.ECON.goods && SIM.ECON.goods[g]) {
              var floor = (B && B.floor && B.floor[g] != null) ? B.floor[g] : 60;
              var avail = Math.max(0, Math.floor(SIM.stockOf(g) - floor));
              var toTake = Math.min(want, avail);
              if (toTake > 0) {
                var got = SIM.economyTake(g, toTake);
                if (got > 0) SIM.economyBook('exported', g, got);
              }
            }
          });
        }
        v.hold[g] = cur + taken;
        v.reloadedTotal[g] = (v.reloadedTotal[g] || 0) + taken;
        H.totalReloaded += taken;
        H.reloadedByGood[g] = (H.reloadedByGood[g] || 0) + taken;
      }
    });
  }
};

MARR_SIM.stepHarbour = function (dtMinutes, bookLiveEcon) {
  var H = MARR_SIM.STATE && MARR_SIM.STATE.harbour;
  if (!H) H = MARR_SIM.initHarbour();
  if (!H) return null;
  var dm = dtMinutes == null ? 1.0 : dtMinutes;
  var doBook = bookLiveEcon !== false;
  H.vessels.forEach(function (v) {
    var dur = (v.cycleMins && v.cycleMins[v.phase]) || 15;
    var dp = dm / Math.max(1, dur);
    v.progress += dp;
    if (v.phase === 'unloading' || v.phase === 'reloading') {
      MARR_SIM._transferCargoSlice(v, v.phase, dp, doBook);
    }
    while (v.progress >= 1.0) {
      if (v.phase === 'unloading' || v.phase === 'reloading') {
        v.progress = 1.0;
        MARR_SIM._transferCargoSlice(v, v.phase, 1.0, doBook);
      }
      var idx = MARR_SIM.PHASE_ORDER.indexOf(v.phase);
      var nextPhase = MARR_SIM.PHASE_ORDER[(idx + 1) % MARR_SIM.PHASE_ORDER.length];
      v.progress = Math.max(0, v.progress - 1.0);
      v.phase = nextPhase;
      if (nextPhase === 'unloading') {
        H.completedDockings++;
        v.hold = Object.assign({}, v.inbound);
      } else if (nextPhase === 'reloading') {
        v.hold = {};
      } else if (nextPhase === 'approaching') {
        v.cycles++;
        v.hold = Object.assign({}, v.inbound);
      }
    }
    MARR_SIM._updateVesselPose(v);
  });
  return H;
};

MARR_SIM.simHarbourStep = function () {
  /* During batch SIM.step() runs, SIM.trade routes already book village<->Marr warehouse flows; advance harbour vessels without double-booking SIM.trade */
  MARR_SIM.stepHarbour(1.0, false);
};

/* External Imperial & Ring Sea buyers calling at Porta Marr and its island ports */
MARR_SIM.simBuyers = function (minute) {
  var B = MARR_SIM.TUNE.buyers, S = MARR_SIM.STATE;
  if (!B || !S || minute % 1440 !== B.at) return;
  var day = Math.floor(minute / 1440);
  B.ships.forEach(function (sh) {
    if ((day - sh.phase) % sh.every !== 0 || day < sh.phase) return;
    var rec = S.ships[sh.id] || (S.ships[sh.id] = {name: sh.name, calls: 0, bought: {}});
    rec.calls++;
    sh.calls.forEach(function (s) {
      if (!SIM.econ(s)) return;
      SIM.withEcon(s, function () {
        Object.keys(sh.buys).forEach(function (g) {
          if (!SIM.ECON.goods[g]) return;
          var floor = B.floor[g] == null ? 20 : B.floor[g];
          var avail = Math.floor(SIM.stockOf(g) - floor);
          var n = Math.min(sh.buys[g], avail);
          if (n <= 0) return;
          var got = SIM.economyTake(g, n);
          if (got <= 0) return;
          SIM.economyBook('exported', g, got);
          var bs = S.buyersSold[s] || (S.buyersSold[s] = {});
          bs[g] = (bs[g] || 0) + got;
          rec.bought[g] = (rec.bought[g] || 0) + got;
        });
      });
    });
  });
};

MARR_SIM.run = function (minutes) {
  var C = MARR_SIM.STATE.clock, spm = MARR_SIM.TUNE.clock.secPerMinute;
  for (var i = 0; i < minutes; i++) {
    C.m++;
    C.day = Math.floor(C.m / 1440);
    C.hour = (C.m % 1440 + 0.5) / 60;
    C.t += spm;
    SIM.step();
  }
  return C.m;
};

MARR_SIM.books = function () {
  var S = MARR_SIM.STATE, E = SIM.econ('marr'), St = SIM.stocks('marr');
  var cityGoods = {};
  MARR_SIM.TUNE.goods.forEach(function (g) {
    var r = St && St.by[g];
    cityGoods[g] = {
      made: E.made[g] || 0, imported: E.imported[g] || 0, exported: E.exported[g] || 0,
      used: E.used[g] || 0, hauled: E.hauled[g] || 0, short: E.short[g] || 0,
      stock: r ? r.total : 0,
      today: r && r.today ? Object.assign({}, r.today) : null
    };
  });
  var villages = {};
  S.villages.forEach(function (V) {
    var Ev = SIM.econ(V.id), Sv = SIM.stocks(V.id), R1 = SIM.tradeReport(V.outRoute), R2 = SIM.tradeReport(V.inRoute);
    var made = {};
    V.makes.forEach(function (g) { made[g] = Ev.made[g] || 0; });
    villages[V.id] = {
      name: V.name, dealtName: V.dealtName.name, kind: V.kind, islandId: V.islandId,
      focus: V.focus, overseas: V.overseas, people: V.people, workers: V.workers,
      records: V.records, farmlandHa: V.farmlandHa,
      made: made,
      shipped: R1.shipped[V.id + '>marr'] || {},
      landed: R1.landed[V.id + '>marr'] || {},
      fed: R2.landed['marr>' + V.id] || {},
      balanced: MARR_SIM.TUNE.goods.every(function (g) {
        var f = Sv && Sv.by[g] && Sv.by[g].today;
        return !f || Math.abs(f.made + f.imported - f.exported - f.consumed - f.change) <= 1;
      })
    };
  });
  return {
    minute: SIM.minute(),
    day: S.clock.day,
    problems: S.problems.slice(),
    marr: {people: S.settlements.marr.pop.actors, workers: S.settlements.marr.pop.workers, goods: cityGoods},
    villages: villages,
    ships: JSON.parse(JSON.stringify(S.ships)),
    buyersSold: JSON.parse(JSON.stringify(S.buyersSold)),
    harbour: S.harbour ? {
      totalUnloaded: S.harbour.totalUnloaded,
      totalReloaded: S.harbour.totalReloaded,
      completedDockings: S.harbour.completedDockings,
      unloadedByGood: Object.assign({}, S.harbour.unloadedByGood),
      reloadedByGood: Object.assign({}, S.harbour.reloadedByGood),
      vessels: S.harbour.vessels.map(function (v) {
        return {id: v.id, name: v.name, vesselKey: v.vesselKey, berthName: v.berthName, phase: v.phase, progress: +v.progress.toFixed(2), cycles: v.cycles, hold: Object.assign({}, v.hold)};
      })
    } : null
  };
};
