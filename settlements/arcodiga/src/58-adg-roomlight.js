// ================================================================= ARCODIGA — Stage 7 KROOMLIGHT Interior Vaults & 6-Light Pool [G data]
// Room-graph daylight propagation (KROOMLIGHT.buildTable), 6-light gated portal/lamp pool (KROOMLIGHT.pickPool),
// and dihedral/trihedral corner AO (KROOMLIGHT.vertexCornerAO) across 5 key Arcodiga & Rim complexes:
//   1. Arcodiga Deep Machine-Layer Relic Vault (adg.vault.machine_archive, vault: true -> exact 0.000 sky daylight, 0 sky PMREM leak!)
//   2. Arcodiga East Learning Wing Tsunami Telemetry & Chart Loft (adg.wing.telemetry_loft, panoramic chart windows -> daylight > 0.5)
//   3. Arcodiga Hydrography Cipher Backroom (adg.wing.cipher_room, 1-hop interior doorway from telemetry loft -> attenuated daylight)
//   4. Santa Cristina Sacred Drawdown Chime-Chamber (adg.vault.santa_cristina, vault: true -> exact 0.000 sky daylight, nephrite lamps)
//   5. Di-Ga Wai-Si Superintendency Censorate Hall (adg.hall.superintendency, Z6 Eternian Ministry hall)
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const ADG_ROOMS = (function(){
 const ROOMS = [
  {
   id: 'adg.vault.machine_archive',
   name: 'Arcodiga Deep Machine-Layer Relic Vault (East Wing Core)',
   culture: 'eternian',
   vault: true,
   box: [168.0, 81.2, 202.0, 196.0, 85.6, 218.0],
   doors: [
    { id: 'd_vault_hwy', out: true, w: 2.4, x: 182.0, z: 218.0 }
   ],
   windows: [],
   lamps: [
    { x: 175.0, y: 84.4, z: 210.0, amp: 1.25, r: 12.0, room: 'adg.vault.machine_archive', color: [1.0, 0.78, 0.48] },
    { x: 189.0, y: 84.4, z: 210.0, amp: 1.25, r: 12.0, room: 'adg.vault.machine_archive', color: [1.0, 0.78, 0.48] }
   ],
   furniture: [
    { key: 'eternian_archive_table', x: 176.0, y: 81.2, z: 208.0, ry: 0.0 },
    { key: 'eternian_relic_cabinet', x: 188.0, y: 81.2, z: 212.0, ry: 3.14 }
   ]
  },
  {
   id: 'adg.wing.telemetry_loft',
   name: 'Arcodiga East Learning Wing Tsunami Telemetry & Chart Loft',
   culture: 'eternian',
   vault: false,
   box: [244.0, 90.0, 200.0, 292.0, 94.6, 220.0],
   doors: [
    { id: 'd_loft_out', out: true, w: 2.6, x: 268.0, z: 220.0 },
    { id: 'd_loft_cipher', to: 'adg.wing.cipher_room', w: 1.5, x: 244.0, z: 210.0 }
   ],
   windows: [
    { x: 256.0, y: 92.2, z: 220.0, w: 6.4, h: 2.6, room: 'adg.wing.telemetry_loft' },
    { x: 268.0, y: 92.2, z: 220.0, w: 6.4, h: 2.6, room: 'adg.wing.telemetry_loft' },
    { x: 280.0, y: 92.2, z: 220.0, w: 6.4, h: 2.6, room: 'adg.wing.telemetry_loft' }
   ],
   lamps: [
    { x: 262.0, y: 93.6, z: 210.0, amp: 1.15, r: 12.0, room: 'adg.wing.telemetry_loft', color: [1.0, 0.82, 0.56] },
    { x: 276.0, y: 93.6, z: 210.0, amp: 1.10, r: 12.0, room: 'adg.wing.telemetry_loft', color: [1.0, 0.82, 0.56] }
   ],
   furniture: [
    { key: 'eternian_chart_desk', x: 264.0, y: 90.0, z: 210.0, ry: 0.0 },
    { key: 'eternian_tide_astrolabe', x: 274.0, y: 90.0, z: 210.0, ry: 1.57 }
   ]
  },
  {
   id: 'adg.wing.cipher_room',
   name: 'Arcodiga Farport Relay & Cipher Room (1-Hop Interior)',
   culture: 'eternian',
   vault: false,
   box: [232.0, 90.0, 203.0, 244.0, 94.2, 217.0],
   doors: [
    { id: 'd_loft_cipher', to: 'adg.wing.telemetry_loft', w: 1.5, x: 244.0, z: 210.0 }
   ],
   windows: [],
   lamps: [
    { x: 238.0, y: 93.2, z: 210.0, amp: 1.0, r: 9.0, room: 'adg.wing.cipher_room', color: [0.98, 0.78, 0.50] }
   ],
   furniture: [
    { key: 'eternian_ledger_chest', x: 236.0, y: 90.0, z: 210.0, ry: 1.57 }
   ]
  },
  {
   id: 'adg.vault.santa_cristina',
   name: 'Santa Cristina Subterranean Keyhole Mirror-Well Vault',
   culture: 'hueru-kuran',
   vault: true,
   box: [1027.0, 173.2, -373.0, 1043.0, 178.2, -357.0],
   doors: [
    { id: 'd_santa_stair', out: true, w: 2.0, x: 1035.0, z: -357.0 }
   ],
   windows: [],
   lamps: [
    { x: 1035.0, y: 176.8, z: -365.0, amp: 1.20, r: 11.5, room: 'adg.vault.santa_cristina', color: [0.42, 0.92, 0.68] }
   ],
   furniture: [
    { key: 'hueru-kuran_nephrite_chime_rack', x: 1032.0, y: 174.0, z: -365.0, ry: 0.0 },
    { key: 'hueru-kuran_tide_gauge_plinth',   x: 1038.0, y: 174.0, z: -365.0, ry: 3.14 }
   ]
  },
  {
   id: 'adg.hall.superintendency',
   name: 'Di-Ga Wai-Si Superintendency Censorate Hall',
   culture: 'eternian',
   vault: false,
   box: [984.0, 166.0, 515.0, 1006.0, 171.2, 535.0],
   doors: [
    { id: 'd_hall_court', out: true, w: 2.4, x: 984.0, z: 525.0 }
   ],
   windows: [
    { x: 1006.0, y: 168.5, z: 521.0, w: 3.2, h: 2.2, room: 'adg.hall.superintendency' },
    { x: 1006.0, y: 168.5, z: 529.0, w: 3.2, h: 2.2, room: 'adg.hall.superintendency' }
   ],
   lamps: [
    { x: 995.0, y: 170.0, z: 525.0, amp: 1.15, r: 12.0, room: 'adg.hall.superintendency', color: [1.0, 0.80, 0.52] }
   ],
   furniture: [
    { key: 'eternian_magistrate_dais', x: 992.0, y: 166.0, z: 525.0, ry: 1.57 },
    { key: 'eternian_seal_coffer',     x: 998.0, y: 166.0, z: 522.0, ry: 0.0 }
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
  if (typeof KROOMLIGHT !== 'undefined' && KROOMLIGHT.buildTable) {
   return KROOMLIGHT.buildTable({ rooms: ROOMS });
  }
  return null;
 }

 function auditVaultIsolation(tbl){
  if (!tbl || !tbl.byId) return false;
  const ids = Object.keys(tbl.byId);
  for (let i = 0; i < ids.length; i++) {
   const r = tbl.byId[ids[i]];
   if (r.vault && r.daylight !== 0) return false;
  }
  return true;
 }

 function roomAt(x, y, z){
  for (let i = 0; i < ROOMS.length; i++) {
   const r = ROOMS[i], b = r.box;
   if (x >= b[0] - 0.8 && x <= b[3] + 0.8 && y >= b[1] - 0.8 && y <= b[4] + 1.0 && z >= b[2] - 0.8 && z <= b[5] + 0.8) {
    return r;
   }
  }
  return null;
 }

 function poolForEye(eyeXYZ, sunUp, table){
  const tbl = table || buildLightTable();
  if (!tbl || typeof KROOMLIGHT === 'undefined' || !KROOMLIGHT.pickPool) return [];
  const r = roomAt(eyeXYZ[0], eyeXYZ[1], eyeXYZ[2]) || ROOMS[1];
  return KROOMLIGHT.pickPool({
   eye: eyeXYZ,
   eyeRoom: r.id,
   table: tbl,
   count: 6,
   maxWindows: 3,
   heroShadows: 2,
   sunUp: sunUp == null ? 0.86 : sunUp,
   windows: ALL_WINDOWS,
   lamps: ALL_LAMPS
  });
 }

 return {
  ROOMS: ROOMS,
  ALL_WINDOWS: ALL_WINDOWS,
  ALL_LAMPS: ALL_LAMPS,
  buildLightTable: buildLightTable,
  auditVaultIsolation: auditVaultIsolation,
  roomAt: roomAt,
  poolForEye: poolForEye
 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ADG_ROOMS;
