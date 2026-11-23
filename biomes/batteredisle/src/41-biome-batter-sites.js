// ================================================================= BATTERED ISLE — station catalogue, KSTRATA columns & reserves [G data]
// Pure data specification for all four Battered Isle stations (PLAN.md sections 3, 8.1, 8.3):
//   1. cove    (default -> dist/batteredisle.html):         (438, 258), Breached Crater Cove, Palagonite Sea-Arches,
//                                                           Upturned coal=201 Collar Seam, Basal Tuff-Contact Spring Cascade,
//                                                           Sheltered Kelp Anchorage & site:battered-port-rim (+115 m)
//   2. rampart (--station rampart -> batteredisle-rampart): (444, 244), WNW Tsunami-Planed Scoria/Basalt Bench (+6..+48 m),
//                                                           Offshore Radial Feeder-Dike Sea-Stacks (KSTACKS), Wave-Compressed
//                                                           Blowhole Sea-Caves (KCAVERN + ATMOS spray) & +56 m Trimline
//   3. strait  (--station strait -> batteredisle-strait):   (494, 250), Leeward Strait & Tidal Sound (17 km KFAR silhouette
//                                                           of Shroudhills), KCOAST shingle/rock pocket coves, intertidal
//                                                           stormwrack/wineweed beds & coastal rookery cliffs
//   4. plug    (--station plug -> batteredisle-plug):       (474, 248), Exhumed +868.8 m Columnar Olivine-Basalt Volcanic Neck,
//                                                           Radial Feeder-Dike Hogbacks, nickel=180 garnierite-serpentine seams,
//                                                           biomes/arch nickel-hyperaccumulators & site:seamount-beacon

var BATTER_SITES = (function(){
 'use strict';

 /* Custom lateral rock columns matching the worn cinder cone & upturned SE coal collar ([G data], PLAN.md 8.1) */
 var STRATA = {
  'worn-scoria-palagonite': {
   dipDeg: 14.0,
   layers: [
    { key: 'basalt_sill',     h: 12.0, hard: 0.94, col: '#25262B' },
    { key: 'palagonite_tuff', h: 28.0, hard: 0.52, col: '#B9985A' },
    { key: 'welded_spatter',  h:  4.5, hard: 0.88, col: '#3B2826' },
    { key: 'oxidized_scoria', h: 36.0, hard: 0.28, col: '#7A2E22' }
   ]
  },
  'olivine-plug-basalt': {
   dipDeg: 82.0,
   layers: [
    { key: 'olivine_cumulate', h: 45.0, hard: 0.96, col: '#2A332B' },
    { key: 'columnar_neck',    h: 65.0, hard: 0.98, col: '#2E3036' },
    { key: 'garnierite_vein',  h:  3.0, hard: 0.65, col: '#4F8A6B' }
   ]
  },
  'upturned-coal-collar': {
   dipDeg: 42.0,
   layers: [
    { key: 'collar_sandstone', h: 14.0, hard: 0.74, col: '#A89674' },
    { key: 'baked_coal_201',   h:  1.8, hard: 0.44, col: '#141518' },
    { key: 'estuarine_shale',  h:  9.5, hard: 0.48, col: '#4E5258' },
    { key: 'palagonite_cap',   h: 18.0, hard: 0.54, col: '#B59458' }
   ]
  }
 };

 var STATIONS = {
  cove: {
   key: 'cove',
   alias: 'portcove',
   out: 'batteredisle.html',
   title: 'Battered Isle — Breached Scoria Cove, Palagonite Arches & Port Rim Overlook',
   px: [438, 258],
   pinRefPx: [435, 259],
   skyOffsetPx: [166, -72],
   elevOffset: 0,
   pAtm: 1.59,
   rainMmYr: 1788,
   tempC: 28,
   koppen: 'Am',
   azFromPlugDeg: 162,
   exposedWNW: false,
   lithology: 'ultramafic',
   hasCollarOutcrop: true,
   strataStack: 'worn-scoria-palagonite',
   trimElevM: 18.0,
   seaLevel: 0.0,
   wind: [0.92, 0.39],
   reserves: [
    { id: 'site:battered-port-rim', name: 'Bare-Stone Port Crescentic Rim Reserve', x: 245, z: -195, r: 110, elevM: 115.0 },
    { id: 'site:seamount-beacon',   name: 'WSW Seamount-Watch Dike Crag Reserve',   x: -255, z: -165, r: 34, elevM: 124.0 }
   ],
   works: [
    { id: 'work:cove-leading-cairn', kind: 'cairn', name: 'Unmasked Basalt Leading-Mark Cairn', x: -128, z: 118, r: 3.4 },
    { id: 'work:spring-cask-landing', kind: 'cooperage', name: 'Palagonite Spring-Cask Cooperage Landing', x: 38, z: -42, r: 4.5 },
    { id: 'work:collar-coal-adit', kind: 'coal-cut', name: 'Upturned Collar Coal=201 Seam Bunker Cut', x: 164, z: 76, r: 5.2 }
   ],
   modes: ['Calm', 'Gale', 'Tsunami Drawdown']
  },

  rampart: {
   key: 'rampart',
   alias: 'rampart',
   out: 'batteredisle-rampart.html',
   title: 'Battered Isle — WNW Megatsunami Rampart, Blowhole Sea-Caves & Radial-Dike Stacks',
   px: [444, 244],
   skyOffsetPx: [172, -86],
   elevOffset: 0,
   pAtm: 1.60,
   rainMmYr: 1898,
   tempC: 27,
   koppen: 'Am',
   azFromPlugDeg: 278,
   exposedWNW: true,
   lithology: 'ultramafic',
   hasCollarOutcrop: false,
   strataStack: 'worn-scoria-palagonite',
   trimElevM: 56.0,
   seaLevel: 0.0,
   wind: [0.96, 0.28],
   reserves: [],
   works: [
    { id: 'work:trimline-marker', kind: 'cairn', name: 'Exile +56 m Tsunami Trimline Basalt Post', x: 148, z: -24, r: 2.8 }
   ],
   blowholes: [
    { id: 'bh-north', x: -58, z: -112, r: 2.1, phase: 0.00 },
    { id: 'bh-mid',   x: -36, z:   14, r: 2.5, phase: 0.37 },
    { id: 'bh-south', x: -48, z:  128, r: 1.9, phase: 0.71 }
   ],
   modes: ['Calm', 'Gale', 'Tsunami Drawdown']
  },

  strait: {
   key: 'strait',
   alias: 'archcove',
   out: 'batteredisle-strait.html',
   title: 'Battered Isle — Leeward Shroudhills Strait, Shingle Pocket Coves & Wrack Rookeries',
   px: [494, 250],
   skyOffsetPx: [222, -80],
   elevOffset: 0,
   pAtm: 1.60,
   rainMmYr: 1741,
   tempC: 27,
   koppen: 'Am',
   azFromPlugDeg: 96,
   exposedWNW: false,
   lithology: 'sedimentary',
   hasCollarOutcrop: true,
   strataStack: 'upturned-coal-collar',
   trimElevM: 16.0,
   seaLevel: 0.0,
   shroudhillsDistKm: 17.0,
   wind: [0.78, 0.62],
   reserves: [],
   works: [
    { id: 'work:strait-coal-bench', kind: 'coal-cut', name: 'Smuggler Coal=201 & Bitumen=78 Bunkering Bench', x: -64, z: -86, r: 4.8 },
    { id: 'work:veiled-lantern-niche', kind: 'lantern', name: 'Veiled Strait Signal-Lantern Niche', x: 32, z: 108, r: 2.6 }
   ],
   modes: ['Calm', 'Gale', 'Tsunami Drawdown']
  },

  plug: {
   key: 'plug',
   alias: 'plugcrest',
   out: 'batteredisle-plug.html',
   title: 'Battered Isle — Exhumed +868.8 m Columnar Olivine-Basalt Volcanic Neck & Hogbacks',
   px: [474, 248],
   skyOffsetPx: [202, -82],
   elevOffset: 620.0,
   summitElevM: 868.8,
   pAtm: 1.44,
   rainMmYr: 1616,
   tempC: 22,
   koppen: 'Cfa',
   azFromPlugDeg: 280,
   exposedWNW: false,
   lithology: 'ultramafic',
   hasCollarOutcrop: false,
   strataStack: 'olivine-plug-basalt',
   trimElevM: 58.0,
   seaLevel: null,
   wind: [0.95, 0.31],
   reserves: [
    { id: 'site:seamount-beacon', name: 'Summit Plug Seamount-Watch Reserve (+868.8 m)', x: 0, z: 0, r: 42, elevM: 868.8 }
   ],
   works: [
    { id: 'work:plug-garnierite-pit', kind: 'cairn', name: 'Exile Garnierite Nickel=180 Prospecting Cut', x: 118, z: -84, r: 3.8 }
   ],
   modes: ['Calm', 'Gale', 'Tsunami Drawdown']
  }
 };

 /* Alias lookup so both cove/rampart/strait/plug and portcove/archcove/plugcrest resolve cleanly */
 function get(k){
  if (!k) return STATIONS.cove;
  if (STATIONS[k]) return STATIONS[k];
  if (k === 'portcove') return STATIONS.cove;
  if (k === 'archcove') return STATIONS.strait;
  if (k === 'plugcrest') return STATIONS.plug;
  return STATIONS.cove;
 }

 return {
  STRATA: STRATA,
  STATIONS: STATIONS,
  ORDER: ['cove', 'rampart', 'strait', 'plug'],
  get: get
 };
})();

if (typeof window !== 'undefined') window.BATTER_SITES = BATTER_SITES;
if (typeof module !== 'undefined' && module.exports) module.exports = BATTER_SITES;
