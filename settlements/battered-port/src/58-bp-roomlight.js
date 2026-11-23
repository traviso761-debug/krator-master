// ================================================================= BATTERED PORT — Stage 7 KROOMLIGHT interiors (I1-I4 & Gate 5 vault=true) [G data]
// Room-graph daylight propagation (KROOMLIGHT.buildTable), 6-light gated portal/lamp pool (KROOMLIGHT.pickPool),
// and dihedral/trihedral corner AO (KROOMLIGHT.vertexCornerAO) for the 3 furnished Bè-tõ-pò cutaway complexes:
//   1. Council of Bare Lintels Counting-Court (Bè-dò Hò, D1 +134.5 m): open portal + lancet windows + skylight -> multi-hop decay.
//   2. Exile Free Block-Press (bp_free_press, D1 +132.5 m): street windows + sã-ma type-tray whale-oil lamps.
//   3. Subterranean Da-wò-hò Palagonite Sea-Cave Vault (D7 +5.2 m, vault: true): strictly ZERO sky daylight per Gate 5!
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const BP_ROOMS = (function(){
 const ROOMS = [
  /* 1. Council of Bare Lintels Counting-Court (Bè-dò Hò, D1 at (-225, 134.5, -445)) */
  {
   id: 'bp.court.hall',
   complex: 'counting_court',
   name: 'Nine-Hull Counting-Hall (Bè-dò Hò)',
   vault: false,
   skylight: true,
   box: [-236.0, 134.5, -454.0, -214.0, 141.5, -436.0],
   doors: [
    { id: 'd_court_out', out: true, w: 2.6, x: -225.0, z: -436.0 },
    { id: 'd_court_ledger', to: 'bp.court.ledger', w: 1.5, x: -214.0, z: -445.0 }
   ],
   windows: [
    { x: -231.0, y: 137.2, z: -436.0, w: 1.5, h: 2.4, room: 'bp.court.hall' },
    { x: -219.0, y: 137.2, z: -436.0, w: 1.5, h: 2.4, room: 'bp.court.hall' }
   ],
   lamps: [
    { x: -229.0, y: 138.2, z: -445.0, amp: 1.15, r: 9.5, room: 'bp.court.hall', color: [1.0, 0.78, 0.46] },
    { x: -221.0, y: 138.2, z: -445.0, amp: 1.15, r: 9.5, room: 'bp.court.hall', color: [1.0, 0.78, 0.46] }
   ],
   furniture: [
    { key: 'council_table', x: -225.0, y: 134.5, z: -446.0, ry: 0 },
    { key: 'figurehead_rostrum', x: -225.0, y: 134.5, z: -451.5, ry: 0 },
    { key: 'share_scale', x: -229.5, y: 134.5, z: -442.0, ry: 0.4 }
   ]
  },
  {
   id: 'bp.court.ledger',
   complex: 'counting_court',
   name: 'Safe-Conduct Charter Room (1-hop interior)',
   vault: false,
   box: [-214.0, 134.5, -452.0, -205.0, 139.5, -438.0],
   doors: [
    { id: 'd_court_ledger', to: 'bp.court.hall', w: 1.5, x: -214.0, z: -445.0 },
    { id: 'd_ledger_cipher', to: 'bp.court.cipher', w: 1.1, x: -209.5, z: -452.0 }
   ],
   windows: [],
   lamps: [
    { x: -209.5, y: 137.4, z: -445.0, amp: 1.0, r: 7.5, room: 'bp.court.ledger', color: [1.0, 0.76, 0.44] }
   ],
   furniture: [
    { key: 'ledger_desk', x: -209.5, y: 134.5, z: -444.5, ry: 1.57 },
    { key: 'chart_chest', x: -207.0, y: 134.5, z: -449.0, ry: 3.14 }
   ]
  },
  {
   id: 'bp.court.cipher',
   complex: 'counting_court',
   name: 'Wash-Face Cipher Strongroom (2-hop windowless)',
   vault: false,
   box: [-214.0, 134.5, -459.0, -205.0, 139.0, -452.0],
   doors: [
    { id: 'd_ledger_cipher', to: 'bp.court.ledger', w: 1.1, x: -209.5, z: -452.0 }
   ],
   windows: [],
   lamps: [
    { x: -209.5, y: 137.2, z: -455.5, amp: 0.95, r: 6.5, room: 'bp.court.cipher', color: [0.98, 0.74, 0.42] }
   ],
   furniture: [
    { key: 'cipher_cabinet', x: -209.5, y: 134.5, z: -457.2, ry: 0 }
   ]
  },

  /* 2. Exile Free Block-Press (bp_free_press, D1 at (-268, 132.5, -432)) */
  {
   id: 'bp.press.shop',
   complex: 'free_press',
   name: 'Free Block-Press Composing Floor',
   vault: false,
   box: [-274.5, 132.5, -438.5, -261.5, 137.3, -425.5],
   doors: [
    { id: 'd_press_out', out: true, w: 1.8, x: -268.0, z: -425.5 },
    { id: 'd_press_back', to: 'bp.press.archive', w: 1.2, x: -268.0, z: -438.5 }
   ],
   windows: [
    { x: -271.5, y: 134.6, z: -425.5, w: 1.4, h: 1.8, room: 'bp.press.shop' },
    { x: -264.5, y: 134.6, z: -425.5, w: 1.4, h: 1.8, room: 'bp.press.shop' }
   ],
   lamps: [
    { x: -268.0, y: 135.8, z: -432.0, amp: 1.1, r: 8.5, room: 'bp.press.shop', color: [1.0, 0.77, 0.45] }
   ],
   furniture: [
    { key: 'screw_press', x: -268.0, y: 132.5, z: -432.0, ry: 0 },
    { key: 'type_case_sama', x: -272.2, y: 132.5, z: -434.0, ry: 1.57 },
    { key: 'chart_drying_rack', x: -263.8, y: 132.5, z: -434.0, ry: -1.57 }
   ]
  },
  {
   id: 'bp.press.archive',
   complex: 'free_press',
   name: 'Uncensored Sea-Chart Plate Room',
   vault: false,
   box: [-274.0, 132.5, -444.0, -262.0, 137.0, -438.5],
   doors: [
    { id: 'd_press_back', to: 'bp.press.shop', w: 1.2, x: -268.0, z: -438.5 }
   ],
   windows: [],
   lamps: [
    { x: -268.0, y: 135.5, z: -441.2, amp: 0.9, r: 6.5, room: 'bp.press.archive', color: [0.98, 0.74, 0.42] }
   ],
   furniture: [
    { key: 'woodblock_shelves', x: -268.0, y: 132.5, z: -442.8, ry: 0 }
   ]
  },

  /* 3. Subterranean Da-wò-hò Palagonite Sea-Cave Vault (D7 at (-292, 5.2, -24), vault: true -> 0 sky daylight!) */
  {
   id: 'bp.vault.silk',
   complex: 'sea_cave_vault',
   name: 'Da-wò-hò Contraband Gossamer-Silk Vault',
   vault: true,
   box: [-301.0, 5.2, -31.0, -283.0, 10.4, -17.0],
   doors: [
    { id: 'd_vault_wharf', out: true, w: 2.2, x: -283.0, z: -24.0 },
    { id: 'd_vault_inner', to: 'bp.vault.alabaster', w: 1.6, x: -301.0, z: -24.0 }
   ],
   windows: [],
   lamps: [
    { x: -295.0, y: 8.6, z: -24.0, amp: 1.25, r: 10.5, room: 'bp.vault.silk', color: [0.95, 0.73, 0.44] },
    { x: -287.0, y: 8.6, z: -24.0, amp: 1.20, r: 10.0, room: 'bp.vault.silk', color: [0.95, 0.73, 0.44] }
   ],
   furniture: [
    { key: 'silk_bale_stack', x: -296.0, y: 5.2, z: -28.0, ry: 0 },
    { key: 'amber_chest_row', x: -288.0, y: 5.2, z: -28.0, ry: 0 },
    { key: 'superconductor_cask', x: -292.0, y: 5.2, z: -20.0, ry: 0.5 }
   ]
  },
  {
   id: 'bp.vault.alabaster',
   complex: 'sea_cave_vault',
   name: 'Da-wò-hò Nephrite and Stolen Alabaster Strongroom',
   vault: true,
   box: [-313.0, 5.2, -30.0, -301.0, 10.0, -18.0],
   doors: [
    { id: 'd_vault_inner', to: 'bp.vault.silk', w: 1.6, x: -301.0, z: -24.0 }
   ],
   windows: [],
   lamps: [
    { x: -307.0, y: 8.4, z: -24.0, amp: 1.15, r: 9.0, room: 'bp.vault.alabaster', color: [0.94, 0.72, 0.44] }
   ],
   furniture: [
    { key: 'nephrite_plaque_crate', x: -309.5, y: 5.2, z: -26.5, ry: 0 },
    { key: 'alabaster_seal_box', x: -305.0, y: 5.2, z: -21.0, ry: 3.14 }
   ]
  }
 ];

 const ALL_WINDOWS = [];
 const ALL_LAMPS = [];
 for (let i = 0; i < ROOMS.length; i++) {
  const R = ROOMS[i];
  for (let w = 0; w < R.windows.length; w++) ALL_WINDOWS.push(R.windows[w]);
  for (let l = 0; l < R.lamps.length; l++) ALL_LAMPS.push(R.lamps[l]);
 }

 function buildLightTable(){
  if (typeof KROOMLIGHT === 'undefined' || !KROOMLIGHT.buildTable) return null;
  return KROOMLIGHT.buildTable({ rooms: ROOMS });
 }

 function roomAt(x, y, z){
  for (let i = 0; i < ROOMS.length; i++) {
   const r = ROOMS[i], b = r.box;
   if (x >= b[0] - 0.5 && x <= b[3] + 0.5 && y >= b[1] - 0.5 && y <= b[4] + 0.8 && z >= b[2] - 0.5 && z <= b[5] + 0.5) {
    return r;
   }
  }
  return null;
 }

 /* Pick 6-light gated pool (I3: priority 1 = eye room, priority 2 = 1-hop doorway neighbors, 0 windows inside vault) */
 function poolForEye(eye, sunUp, table){
  const tbl = table || buildLightTable();
  if (!tbl || typeof KROOMLIGHT === 'undefined' || !KROOMLIGHT.pickPool) return [];
  const r = roomAt(eye[0], eye[1], eye[2]) || ROOMS[0];
  return KROOMLIGHT.pickPool({
   eye: eye,
   eyeRoom: r.id,
   table: tbl,
   count: 6,
   maxWindows: 3,
   heroShadows: 2,
   sunUp: sunUp == null ? 0.88 : sunUp,
   windows: ALL_WINDOWS,
   lamps: ALL_LAMPS
  });
 }

 return {
  ROOMS: ROOMS,
  ALL_WINDOWS: ALL_WINDOWS,
  ALL_LAMPS: ALL_LAMPS,
  buildLightTable: buildLightTable,
  roomAt: roomAt,
  poolForEye: poolForEye
 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = BP_ROOMS;
