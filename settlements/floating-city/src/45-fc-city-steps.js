// ================================================================= FLOATING CITY — Multi-Kit Layout (Suudme + Lower/Upper Ria), 28 Pontoons & Voth Trades [G data]
// Places non-Ancient architecture across the Floating City using BOTH:
//   - KLK (`kits/kulanewa` `style: 'suudme'`): Assimilated lowland estuary Kuruneva *Tooka-Hoov* Treaty Pontoons (K1-K6),
//     NE Dyke & Bluff-Harbour tidal wharves/Ishtar water-gates, and Crown Headland syndicate bourses/thermae/dwellings;
//   - RIK (`kits/ria` `style: 'lower-ria'` + `'upper-ria'`): Western Ria Dynasty Pontoons (P1-P18), Boulevard-Dyke finger-piers,
//     AS-01 Court of the Amber Seal Bluff Citadel, and SE Upper Ria *Hongsa* Co-Court Pontoons (U1-U2).
// Pure [G data]: zero THREE, zero DOM, deterministic on KRAND, 0 OBB overlaps, 0 permanent mainland homes < +65.0 m.
const FC_DIMS = {
  /* KLK (kits/kulanewa style: 'suudme' — all 21 syncretic estuary defs) */
  kl_suudme_amber_bourse:       { kit: 'kulanewa', style: 'suudme', w: 30, d: 24, h: 22.4, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'bank' },
  kl_suudme_sauna_thermae:      { kit: 'kulanewa', style: 'suudme', w: 26, d: 22, h: 18.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'bath' },
  kl_suudme_uktena_bell_shrine: { kit: 'kulanewa', style: 'suudme', w: 28, d: 22, h: 19.4, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'shrine' },
  kl_suudme_pontoon_factor:     { kit: 'kulanewa', style: 'suudme', w: 26, d: 20, h: 17.8, wealth: 'rich',   res: true,  hh: 8,  pop: 36, role: 'trading' },
  kl_suudme_covered_bazaar:     { kit: 'kulanewa', style: 'suudme', w: 28, d: 22, h: 18.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'market' },
  kl_suudme_paktong_braziery:   { kit: 'kulanewa', style: 'suudme', w: 26, d: 20, h: 18.2, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'smithy' },
  kl_suudme_glaze_kilnworks:    { kit: 'kulanewa', style: 'suudme', w: 24, d: 20, h: 15.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'kiln' },
  kl_suudme_compass_atelier:    { kit: 'kulanewa', style: 'suudme', w: 22, d: 19, h: 15.8, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'instrument' },
  kl_suudme_silk_dyeworks:      { kit: 'kulanewa', style: 'suudme', w: 24, d: 20, h: 15.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'weaver' },
  kl_suudme_ziggurat_granary:   { kit: 'kulanewa', style: 'suudme', w: 26, d: 20, h: 18.4, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'granary' },
  kl_suudme_tidal_wharf:        { kit: 'kulanewa', style: 'suudme', w: 28, d: 22, h: 17.6, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'wharf' },
  kl_suudme_ishtar_watergate:   { kit: 'kulanewa', style: 'suudme', w: 28, d: 22, h: 20.6, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'gate' },
  kl_suudme_caravanserai:       { kit: 'kulanewa', style: 'suudme', w: 28, d: 24, h: 17.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'inn' },
  kl_suudme_strategion_keep:    { kit: 'kulanewa', style: 'suudme', w: 26, d: 22, h: 20.2, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'keep' },
  kl_suudme_beacon_frustum:     { kit: 'kulanewa', style: 'suudme', w: 20, d: 20, h: 21.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'beacon' },
  kl_suudme_mandarin_court:     { kit: 'kulanewa', style: 'suudme', w: 28, d: 24, h: 18.4, wealth: 'rich',   res: true,  hh: 10, pop: 46, role: 'dwelling' },
  kl_suudme_patrician_palazzo:  { kit: 'kulanewa', style: 'suudme', w: 28, d: 24, h: 20.6, wealth: 'rich',   res: true,  hh: 16, pop: 72, role: 'dwelling' },
  kl_suudme_sanjhya_villa:      { kit: 'kulanewa', style: 'suudme', w: 18, d: 20, h: 15.8, wealth: 'middle', res: true,  hh: 8,  pop: 36, role: 'dwelling' },
  kl_suudme_arcade_insula:      { kit: 'kulanewa', style: 'suudme', w: 26, d: 19, h: 16.0, wealth: 'middle', res: true,  hh: 18, pop: 78, role: 'dwelling' },
  kl_suudme_trestle_cottage:    { kit: 'kulanewa', style: 'suudme', w: 16, d: 18, h: 12.2, wealth: 'poor',   res: true,  hh: 6,  pop: 28, role: 'dwelling' },
  kl_suudme_quay_tenement:      { kit: 'kulanewa', style: 'suudme', w: 22, d: 19, h: 15.2, wealth: 'poor',   res: true,  hh: 16, pop: 70, role: 'dwelling' },

  /* RIK (kits/ria style: 'lower-ria' & 'upper-ria') */
  ra_west_prasat_palace:        { kit: 'ria', style: 'lower-ria', w: 36, d: 28, h: 27.5, wealth: 'rich',   res: true,  hh: 14, pop: 64, role: 'palace' },
  ra_west_chakri_chancellery:   { kit: 'ria', style: 'lower-ria', w: 36, d: 24, h: 25.8, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'ministry' },
  ra_west_amber_scriptorium:    { kit: 'ria', style: 'lower-ria', w: 22, d: 19, h: 17.2, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'archive' },
  ra_west_strategion_keep:      { kit: 'ria', style: 'lower-ria', w: 28, d: 24, h: 23.6, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'keep' },
  ra_west_celadon_prang_terrace:{ kit: 'ria', style: 'lower-ria', w: 28, d: 24, h: 24.5, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'temple' },
  ra_west_mondop_library:       { kit: 'ria', style: 'lower-ria', w: 24, d: 24, h: 25.0, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'library' },
  ra_west_pyatthat_hall:        { kit: 'ria', style: 'lower-ria', w: 26, d: 24, h: 27.0, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'civic' },
  ra_west_lotus_pavilion:       { kit: 'ria', style: 'lower-ria', w: 32, d: 28, h: 18.5, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'court' },
  ra_west_lotus_thermae:        { kit: 'ria', style: 'lower-ria', w: 24, d: 22, h: 17.2, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'bath' },
  ra_west_covered_bazaar:       { kit: 'ria', style: 'lower-ria', w: 24, d: 20, h: 18.0, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'market' },
  ra_west_crane_wharf:          { kit: 'ria', style: 'lower-ria', w: 28, d: 22, h: 16.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'wharf' },
  ra_west_barge_commissary:     { kit: 'ria', style: 'lower-ria', w: 28, d: 18, h: 15.4, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'warehouse' },
  ra_west_water_gate:           { kit: 'ria', style: 'lower-ria', w: 28, d: 22, h: 22.0, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'gate' },
  ra_west_bussabok_gate:        { kit: 'ria', style: 'lower-ria', w: 26, d: 20, h: 19.5, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'gate' },
  ra_west_ziggurat_granary:     { kit: 'ria', style: 'lower-ria', w: 20, d: 18, h: 15.4, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'granary' },
  ra_west_glaze_kiln:           { kit: 'ria', style: 'lower-ria', w: 20, d: 18, h: 13.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'kiln' },
  ra_west_silk_dyeworks:        { kit: 'ria', style: 'lower-ria', w: 21, d: 18, h: 13.6, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'weaver' },
  ra_west_bronze_smithy:        { kit: 'ria', style: 'lower-ria', w: 19, d: 17, h: 14.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'smithy' },
  ra_west_boom_arsenal:         { kit: 'ria', style: 'lower-ria', w: 28, d: 22, h: 19.6, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'arsenal' },
  ra_west_caravanserai_inn:     { kit: 'ria', style: 'lower-ria', w: 26, d: 24, h: 15.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'inn' },
  ra_west_weigh_station:        { kit: 'ria', style: 'lower-ria', w: 26, d: 20, h: 18.0, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'customs' },
  ra_west_aqueduct_cistern:     { kit: 'ria', style: 'lower-ria', w: 26, d: 20, h: 16.4, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'cistern' },
  ra_west_spiral_beacon:        { kit: 'ria', style: 'lower-ria', w: 19, d: 19, h: 23.5, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'beacon' },
  ra_west_mandarin_court:       { kit: 'ria', style: 'lower-ria', w: 28, d: 24, h: 19.2, wealth: 'rich',   res: true,  hh: 12, pop: 54, role: 'dwelling' },
  ra_west_clan_compound:        { kit: 'ria', style: 'lower-ria', w: 30, d: 26, h: 18.6, wealth: 'rich',   res: true,  hh: 14, pop: 62, role: 'dwelling' },
  ra_west_arcade_villa:         { kit: 'ria', style: 'lower-ria', w: 22, d: 19, h: 15.0, wealth: 'middle', res: true,  hh: 10, pop: 44, role: 'dwelling' },
  ra_west_artisan_shophouse:    { kit: 'ria', style: 'lower-ria', w: 16, d: 20, h: 15.2, wealth: 'middle', res: true,  hh: 12, pop: 52, role: 'dwelling' },
  ra_west_insula_apartments:    { kit: 'ria', style: 'lower-ria', w: 26, d: 18, h: 15.8, wealth: 'middle', res: true,  hh: 20, pop: 88, role: 'dwelling' },
  ra_west_courtyard_tenement:   { kit: 'ria', style: 'lower-ria', w: 22, d: 20, h: 16.8, wealth: 'poor',   res: true,  hh: 18, pop: 80, role: 'dwelling' },
  ra_west_stilt_house:          { kit: 'ria', style: 'lower-ria', w: 18, d: 18, h: 13.4, wealth: 'poor',   res: true,  hh: 8,  pop: 36, role: 'dwelling' },
  ra_west_canal_cottage:        { kit: 'ria', style: 'lower-ria', w: 14, d: 14, h: 10.8, wealth: 'poor',   res: true,  hh: 6,  pop: 28, role: 'dwelling' },

  /* Upper Ria ('upper-ria') Hongsa Co-Court Enclave */
  ra_east_swan_prasat:          { kit: 'ria', style: 'upper-ria', w: 36, d: 30, h: 27.5, wealth: 'rich',   res: true,  hh: 12, pop: 54, role: 'embassy' },
  ra_east_stoa_agora:           { kit: 'ria', style: 'upper-ria', w: 26, d: 18, h: 16.8, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'truce-court' },
  ra_east_archon_residences:    { kit: 'ria', style: 'upper-ria', w: 28, d: 24, h: 19.4, wealth: 'rich',   res: true,  hh: 14, pop: 62, role: 'dwelling' },
  ra_east_peristyle_villa:      { kit: 'ria', style: 'upper-ria', w: 24, d: 22, h: 17.2, wealth: 'middle', res: true,  hh: 10, pop: 44, role: 'dwelling' }
};

/* Voth 44-Trade Census Closure (`41/44` carried across Lower Ria + Suudme + Pioneer Hydro-Dynamo; `3` canonical northern `na`) */
const FC_TRADES = [
  { id: 1,  trade: 'farmers and crop hands',              keys: ['ra_west_ziggurat_granary', 'kl_suudme_ziggurat_granary'] },
  { id: 2,  trade: 'herders and stockmen',                keys: ['ra_west_barge_commissary'] },
  { id: 3,  trade: 'fishermen and shellfish gatherers',   keys: ['kl_suudme_tidal_wharf', 'ra_west_crane_wharf'] },
  { id: 4,  trade: 'hunters and trappers',                keys: ['kl_suudme_trestle_cottage'] },
  { id: 5,  trade: 'woodcutters and charcoal burners',    keys: ['ra_west_barge_commissary'] },
  { id: 6,  trade: 'quarrymen and stonecutters',          keys: ['ra_west_glaze_kiln'] },
  { id: 7,  trade: 'miners and ore dressers',             keys: ['kl_suudme_paktong_braziery'] },
  { id: 8,  trade: 'clay diggers and brickmakers',        keys: ['ra_west_glaze_kiln', 'kl_suudme_glaze_kilnworks'] },
  { id: 9,  trade: 'millers and grain grinders',          keys: ['ra_west_ziggurat_granary', 'kl_suudme_ziggurat_granary'] },
  { id: 10, trade: 'bakers and pastry cooks',             keys: ['ra_west_artisan_shophouse', 'kl_suudme_arcade_insula'] },
  { id: 11, trade: 'brewers, vintners and distillers',    keys: ['ra_west_caravanserai_inn', 'kl_suudme_caravanserai'] },
  { id: 12, trade: 'butchers and salters',                keys: ['ra_west_covered_bazaar', 'kl_suudme_covered_bazaar'] },
  { id: 13, trade: 'weavers, spinners and fullers',       keys: ['ra_west_silk_dyeworks', 'kl_suudme_silk_dyeworks'] },
  { id: 14, trade: 'dyers and cloth finishers',           keys: ['ra_west_silk_dyeworks', 'kl_suudme_silk_dyeworks'] },
  { id: 15, trade: 'tailors, cobblers and leatherworkers',keys: ['ra_west_artisan_shophouse'] },
  { id: 16, trade: 'blacksmiths and toolmakers',          keys: ['ra_west_bronze_smithy', 'kl_suudme_paktong_braziery'] },
  { id: 17, trade: 'power-house stokers and engineers',   keys: ['kl_suudme_compass_atelier', 'fc.mega.submarine_cone'] },
  { id: 18, trade: 'potters, glaziers and kiln-masters',  keys: ['ra_west_glaze_kiln', 'kl_suudme_glaze_kilnworks'] },
  { id: 19, trade: 'carpenters, joiners and coopers',     keys: ['ra_west_boom_arsenal', 'kl_suudme_tidal_wharf'] },
  { id: 20, trade: 'shipwrights, caulkers and ropemakers',keys: ['ra_west_boom_arsenal', 'kl_suudme_tidal_wharf'] },
  { id: 21, trade: 'masons, tilers and plasterers',       keys: ['ra_west_glaze_kiln', 'kl_suudme_glaze_kilnworks'] },
  { id: 22, trade: 'braziers, founders and whitesmiths',  keys: ['kl_suudme_paktong_braziery', 'ra_west_bronze_smithy'] },
  { id: 23, trade: 'instrument makers and clockmakers',   keys: ['kl_suudme_compass_atelier'] },
  { id: 24, trade: 'paper-makers, scribes and printers',  keys: ['ra_west_amber_scriptorium', 'ra_west_mondop_library'] },
  { id: 25, trade: 'merchants, factors and brokers',      keys: ['kl_suudme_amber_bourse', 'kl_suudme_pontoon_factor', 'ra_west_covered_bazaar'] },
  { id: 26, trade: 'shopkeepers and hawkers',             keys: ['ra_west_covered_bazaar', 'kl_suudme_covered_bazaar'] },
  { id: 27, trade: 'innkeepers, cooks and bath-keepers',  keys: ['kl_suudme_sauna_thermae', 'ra_west_lotus_thermae', 'ra_west_caravanserai_inn'] },
  { id: 28, trade: 'boatmen, lightermen and lock-keepers',keys: ['kl_suudme_ishtar_watergate', 'ra_west_water_gate', 'ra_west_crane_wharf'] },
  { id: 29, trade: 'carters, drovers and hoist-men',      keys: ['ra_west_weigh_station', 'kl_suudme_caravanserai'] },
  { id: 30, trade: 'porters and warehousemen',            keys: ['ra_west_barge_commissary', 'kl_suudme_pontoon_factor'] },
  { id: 31, trade: 'bankers, assayers and seal-clerks',   keys: ['ra_west_chakri_chancellery', 'kl_suudme_amber_bourse'] },
  { id: 32, trade: 'magistrates, clerks and tax-officers',keys: ['ra_west_chakri_chancellery', 'ra_east_stoa_agora'] },
  { id: 33, trade: 'soldiers, watchmen and marine guards',keys: ['ra_west_strategion_keep', 'kl_suudme_strategion_keep'] },
  { id: 34, trade: 'priests, shrine-keepers and chanters',keys: ['ra_west_celadon_prang_terrace', 'kl_suudme_uktena_bell_shrine'] },
  { id: 35, trade: 'scholars, archivists and teachers',   keys: ['ra_west_mondop_library', 'ra_west_amber_scriptorium'] },
  { id: 36, trade: 'healers, apothecaries and herbalists',keys: ['ra_west_lotus_thermae', 'kl_suudme_sauna_thermae'] },
  { id: 37, trade: 'musicians, dancers and players',      keys: ['ra_west_lotus_pavilion', 'ra_west_pyatthat_hall'] },
  { id: 38, trade: 'servants and household retainers',    keys: ['ra_west_prasat_palace', 'kl_suudme_patrician_palazzo', 'ra_east_archon_residences'] },
  { id: 39, trade: 'water-carriers and cistern-keepers',  keys: ['ra_west_aqueduct_cistern'] },
  { id: 40, trade: 'watch-beacon and signal keepers',     keys: ['kl_suudme_beacon_frustum', 'ra_west_spiral_beacon'] },
  { id: 41, trade: 'salvagers and hull-divers',           keys: ['kl_suudme_tidal_wharf', 'ra_west_crane_wharf'] },
  { id: 42, trade: 'beetle herders',                      keys: [], na: 'Temperate-subtropical Ria Sound estuary; chitin beetles are an arid southern/rift livestock.' },
  { id: 43, trade: 'mushroom growers',                    keys: [], na: 'Surface sun-lit estuarine capital; dark subterranean fungal caverns are not farmed here.' },
  { id: 44, trade: 'elephant bug handlers and station hands', keys: [], na: 'Maritime barge and sea-lock hub; giant overland elephant-bugs are not used in Ria Sound.' }
];

const FC_CITY = (function () {
  'use strict';

  /* Exact 2D Oriented Bounding Box intersection test for overlap verification */
  function obbCorners(L, pad) {
    const p = pad == null ? 0 : pad;
    const hw = (L.w * 0.5) + p, hd = (L.d * 0.5) + p;
    const c = Math.cos(L.ry), s = Math.sin(L.ry);
    return [
      [L.x - hw * c - hd * s, L.z - hw * s + hd * c],
      [L.x + hw * c - hd * s, L.z + hw * s + hd * c],
      [L.x + hw * c + hd * s, L.z + hw * s - hd * c],
      [L.x - hw * c + hd * s, L.z - hw * s - hd * c]
    ];
  }

  function obbOverlap(A, B, pad) {
    const dx = A.x - B.x, dz = A.z - B.z;
    const rMax = 0.55 * (Math.hypot(A.w, A.d) + Math.hypot(B.w, B.d)) + (pad == null ? 0 : pad * 2);
    if (dx * dx + dz * dz > rMax * rMax) return false;
    const cA = obbCorners(A, pad), cB = obbCorners(B, pad);
    const axes = [
      [Math.cos(A.ry), Math.sin(A.ry)], [-Math.sin(A.ry), Math.cos(A.ry)],
      [Math.cos(B.ry), Math.sin(B.ry)], [-Math.sin(B.ry), Math.cos(B.ry)]
    ];
    for (let i = 0; i < 4; i++) {
      const ax = axes[i][0], az = axes[i][1];
      let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
      for (let k = 0; k < 4; k++) {
        const pA = cA[k][0] * ax + cA[k][1] * az;
        const pB = cB[k][0] * ax + cB[k][1] * az;
        if (pA < minA) minA = pA;
        if (pA > maxA) maxA = pA;
        if (pB < minB) minB = pB;
        if (pB > maxB) maxB = pB;
      }
      if (maxA <= minB + 1e-4 || maxB <= minA + 1e-4) return false;
    }
    return true;
  }

  /* 28 Cellular Moon-Pool Pontoons matching 2D Blueprint Sheet FC-01 */
  const PONTOONS = [
    /* NE Sector: 6 Assimilated Kuruneva 'suudme' Tooka-Hoov Treaty Pontoons (K1-K6) facing East Bluff [649,141] */
    { id: 'K1', x: 245,  z: -155, rOut: 48, rMoon: 13, sides: 8, kind: 'suudme', freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'K2', x: 375,  z: -195, rOut: 46, rMoon: 12, sides: 6, kind: 'suudme', freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'K3', x: 505,  z: -135, rOut: 48, rMoon: 13, sides: 8, kind: 'suudme', freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'K4', x: 305,  z: -32,  rOut: 46, rMoon: 12, sides: 6, kind: 'suudme', freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'K5', x: 435,  z: -8,   rOut: 48, rMoon: 13, sides: 8, kind: 'suudme', freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'K6', x: 565,  z: -28,  rOut: 45, rMoon: 12, sides: 6, kind: 'suudme', freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    /* SE Sector: 2 Upper Ria 'upper-ria' Hongsa Co-Court Pontoons (U1-U2) + 6 Lower Ria Pontoons (P1-P6) */
    { id: 'U1', x: 355,  z: 118,  rOut: 50, rMoon: 14, sides: 8, kind: 'upper',  freeboardM: 2.3, draftM: 3.3, bedY: -12.4 },
    { id: 'U2', x: 495,  z: 158,  rOut: 48, rMoon: 13, sides: 8, kind: 'upper',  freeboardM: 2.3, draftM: 3.3, bedY: -12.4 },
    { id: 'P1', x: 235,  z: 215,  rOut: 47, rMoon: 12, sides: 6, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P2', x: 368,  z: 262,  rOut: 48, rMoon: 13, sides: 8, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P3', x: 505,  z: 298,  rOut: 46, rMoon: 12, sides: 6, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P4', x: 218,  z: 352,  rOut: 46, rMoon: 12, sides: 6, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P5', x: 348,  z: 408,  rOut: 48, rMoon: 13, sides: 8, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P6', x: 192,  z: 482,  rOut: 45, rMoon: 12, sides: 6, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    /* S / SW Sector: 6 Lower Ria Craft & Market Pontoons (P7-P12) */
    { id: 'P7', x: -128, z: 438,  rOut: 48, rMoon: 13, sides: 8, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P8', x: -248, z: 378,  rOut: 46, rMoon: 12, sides: 6, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P9', x: -135, z: 562,  rOut: 46, rMoon: 12, sides: 6, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P10',x: -265, z: 512,  rOut: 47, rMoon: 12, sides: 8, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P11',x: -395, z: 342,  rOut: 46, rMoon: 12, sides: 6, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P12',x: -492, z: 248,  rOut: 45, rMoon: 12, sides: 6, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    /* W / NW / N Sector: 2 Farport/cFlit-qBon Free-Port Pontoons (F1-F2) + 6 Lower Ria & Mixed Suudme Pontoons (P13-P18) */
    { id: 'F1', x: -498, z: 68,   rOut: 48, rMoon: 13, sides: 8, kind: 'free',   freeboardM: 2.1, draftM: 3.1, bedY: -12.4 },
    { id: 'F2', x: -535, z: -65,  rOut: 46, rMoon: 12, sides: 6, kind: 'free',   freeboardM: 2.1, draftM: 3.1, bedY: -12.4 },
    { id: 'P13',x: -368, z: 82,   rOut: 47, rMoon: 12, sides: 8, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P14',x: -385, z: -48,  rOut: 46, rMoon: 12, sides: 6, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P15',x: -252, z: -18,  rOut: 47, rMoon: 12, sides: 8, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P16',x: -222, z: -242, rOut: 47, rMoon: 12, sides: 8, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P17',x: -88,  z: -258, rOut: 48, rMoon: 13, sides: 8, kind: 'ria',    freeboardM: 2.2, draftM: 3.2, bedY: -12.4 },
    { id: 'P18',x: 42,   z: -288, rOut: 46, rMoon: 12, sides: 6, kind: 'suudme', freeboardM: 2.2, draftM: 3.2, bedY: -12.4 }
  ];

  const BASCULE_LINKS = [
    { id: 'basc_01', from: 'K1', to: 'K2' }, { id: 'basc_02', from: 'K2', to: 'K3' },
    { id: 'basc_03', from: 'K1', to: 'K4' }, { id: 'basc_04', from: 'K4', to: 'K5' },
    { id: 'basc_05', from: 'K5', to: 'K6' }, { id: 'basc_06', from: 'K3', to: 'K6' },
    { id: 'basc_07', from: 'K4', to: 'U1' }, { id: 'basc_08', from: 'U1', to: 'U2' },
    { id: 'basc_09', from: 'U1', to: 'P1' }, { id: 'basc_10', from: 'P1', to: 'P2' },
    { id: 'basc_11', from: 'P2', to: 'P3' }, { id: 'basc_12', from: 'P1', to: 'P4' },
    { id: 'basc_13', from: 'P4', to: 'P5' }, { id: 'basc_14', from: 'P4', to: 'P6' },
    { id: 'basc_15', from: 'P7', to: 'P8' }, { id: 'basc_16', from: 'P7', to: 'P9' },
    { id: 'basc_17', from: 'P8', to: 'P10'}, { id: 'basc_18', from: 'P11',to: 'P12'},
    { id: 'basc_19', from: 'F1', to: 'F2' }, { id: 'basc_20', from: 'F1', to: 'P13'},
    { id: 'basc_21', from: 'P13',to: 'P14'}, { id: 'basc_22', from: 'P14',to: 'P15'},
    { id: 'basc_23', from: 'P16',to: 'P17'}, { id: 'basc_24', from: 'P17',to: 'P18'},
    /* Fixed Sala-Nam dock bascules (span >= 32 m so max 4 m lagoon tide excursion stays <= 7.2 deg!) */
    { id: 'basc_sala_ne', from: 'sala_ne', to: 'K1',  spanM: 38.0 },
    { id: 'basc_sala_se', from: 'sala_se', to: 'P1',  spanM: 38.0 },
    { id: 'basc_sala_sw', from: 'sala_sw', to: 'P7',  spanM: 40.0 },
    { id: 'basc_sala_w',  from: 'sala_w',  to: 'P15', spanM: 38.0 },
    { id: 'basc_sala_n',  from: 'sala_n',  to: 'P17', spanM: 38.0 }
  ].map(function (B) {
    const pA = PONTOONS.find(function (p) { return p.id === B.from; });
    const pB = PONTOONS.find(function (p) { return p.id === B.to; });
    const x0 = pA ? pA.x : (B.from === 'sala_ne' ? 168 : B.from === 'sala_se' ? 168 : B.from === 'sala_sw' ? -115 : B.from === 'sala_w' ? -185 : -78);
    const z0 = pA ? pA.z : (B.from === 'sala_ne' ? -120 : B.from === 'sala_se' ? 215 : B.from === 'sala_sw' ? 368 : B.from === 'sala_w' ? -18 : -190);
    const x1 = pB ? pB.x : 0;
    const z1 = pB ? pB.z : 0;
    const dist = B.spanM == null ? Math.max(28.0, Math.hypot(x1 - x0, z1 - z0) - 56.0) : B.spanM;
    return Object.assign({}, B, { x0: x0, z0: z0, x1: x1, z1: z1, spanM: +dist.toFixed(2), maxPitchDeg: 12.0 });
  });

  const CABLE_CHAINS = [
    [[0, 80], [245, -155], [375, -195], [505, -135], [565, -28]],
    [[0, 80], [305, -32], [435, -8], [355, 118], [495, 158]],
    [[0, 80], [235, 215], [368, 262], [505, 298]],
    [[0, 80], [235, 215], [218, 352], [348, 408], [192, 482]],
    [[0, 80], [-128, 438], [-248, 378], [-265, 512], [-135, 562]],
    [[0, 80], [-368, 82], [-498, 68], [-535, -65], [-385, -48], [-252, -18]],
    [[0, 80], [-88, -258], [-222, -242], [-335, -305]],
    [[0, 80], [42, -288], [215, -805]]
  ];

  function buildPlans(opts) {
    opts = opts || {};
    const tags = opts.tags || null;
    const lots = [];
    const byDistrict = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0, D6: 0, D7: 0 };

    function tryPlace(spec) {
      const dim = FC_DIMS[spec.key];
      if (!dim) throw new Error('FC_CITY: unknown building key ' + spec.key);
      const cand = {
        id: spec.id,
        key: spec.key,
        kit: dim.kit,
        style: dim.style,
        district: spec.district,
        instance: spec.instance,
        wardId: spec.wardId || null,
        x: +spec.x.toFixed(2),
        y: +spec.y.toFixed(2),
        localY: spec.localY == null ? 0 : +spec.localY.toFixed(2),
        z: +spec.z.toFixed(2),
        ry: +(spec.ry == null ? 0 : spec.ry).toFixed(4),
        v: spec.v == null ? 0 : (spec.v | 0),
        w: dim.w,
        d: dim.d,
        h: dim.h,
        wealth: dim.wealth,
        res: dim.res,
        hh: dim.hh,
        pop: dim.pop,
        role: dim.role
      };
      for (let i = 0; i < lots.length; i++) {
        if (obbOverlap(cand, lots[i], 0.8)) {
          if (spec.required) throw new Error('FC_CITY: required lot ' + cand.id + ' overlaps ' + lots[i].id);
          return null;
        }
      }
      lots.push(cand);
      byDistrict[cand.district] = (byDistrict[cand.district] || 0) + 1;
      if (tags && tags.add) {
        const rec = tags.add({
          id: cand.id,
          class: 'building',
          kind: cand.key,
          name: cand.key.replace(/_/g, ' '),
          at: [cand.x, cand.y, cand.z],
          ry: cand.ry,
          size: [cand.w, cand.d, cand.h],
          tags: {
            culture: cand.kit === 'kulanewa' ? 'kulanewa' : 'ria',
            style: cand.style,
            wealth: cand.wealth,
            types: [cand.res ? 'dwelling' : 'civic']
          }
        });
        cand.tag = rec.id;
      }
      return cand;
    }

    /* -----------------------------------------------------------------------
       INSTANCE 1 (`bluff` on KCITY): D6 AS-01 Amber-Seal Bluff Citadel & Mixed
       Lower-Ria + Suudme Upper Port Town (+90..+136 m, 100% >= +65.0 m!) + D7 Terraces
       ----------------------------------------------------------------------- */
    const bluffAnchors = [
      /* AS-01 Court of the Amber Seal Citadel & Tooka-Suurgild Suudme Bourse */
      { id: 'fc.bluff.as01_chancellery', key: 'ra_west_chakri_chancellery', district: 'D6', dx: 245, dz: -1125, ry: 0.22, req: true },
      { id: 'fc.bluff.suudme_bourse',    key: 'kl_suudme_amber_bourse',     district: 'D6', dx: 315, dz: -1105, ry: 0.22, req: true },
      { id: 'fc.bluff.as01_scriptorium', key: 'ra_west_amber_scriptorium',  district: 'D6', dx: 378, dz: -1088, ry: 0.22, req: true },
      { id: 'fc.bluff.strategion',       key: 'ra_west_strategion_keep',    district: 'D6', dx: 182, dz: -1142, ry: 0.22, req: true },
      { id: 'fc.bluff.suudme_keep',      key: 'kl_suudme_strategion_keep',  district: 'D6', dx: 438, dz: -1072, ry: 0.22, req: true },
      { id: 'fc.bluff.mondop_lib',       key: 'ra_west_mondop_library',     district: 'D6', dx: 255, dz: -1192, ry: 0.22, req: true },
      { id: 'fc.bluff.suudme_thermae',   key: 'kl_suudme_sauna_thermae',    district: 'D6', dx: 325, dz: -1175, ry: 0.22, req: true },
      { id: 'fc.bluff.suudme_shrine',    key: 'kl_suudme_uktena_bell_shrine',district:'D6', dx: 392, dz: -1158, ry: 0.22, req: true },
      { id: 'fc.bluff.cistern',          key: 'ra_west_aqueduct_cistern',   district: 'D6', dx: 485, dz: -1135, ry: 0.22, req: true },
      { id: 'fc.bluff.beacon_suudme',    key: 'kl_suudme_beacon_frustum',   district: 'D6', dx: 132, dz: -1165, ry: 0.22, req: true }
    ];
    for (let i = 0; i < bluffAnchors.length; i++) {
      const B = bluffAnchors[i];
      const y = FC_SITE.elevAt(B.dx, B.dz);
      tryPlace({ id: B.id, key: B.key, district: B.district, instance: 'bluff', x: B.dx, y: y, z: B.dz, ry: B.ry, required: B.req });
    }

    /* Upper Bluff Street Blocks (East & West of Reservoir, mixing RIK Lower-Ria & KLK Suudme!) */
    const bluffPool = [
      'kl_suudme_patrician_palazzo', 'ra_west_mandarin_court', 'kl_suudme_mandarin_court',
      'ra_west_clan_compound', 'kl_suudme_arcade_insula', 'ra_west_insula_apartments',
      'kl_suudme_sanjhya_villa', 'ra_west_arcade_villa', 'kl_suudme_caravanserai',
      'ra_west_caravanserai_inn', 'ra_west_lotus_thermae', 'ra_west_celadon_prang_terrace',
      'kl_suudme_covered_bazaar', 'ra_west_covered_bazaar'
    ];
    let bIdx = 0;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        const bx = 815 + col * 52;
        const bz = -955 - row * 56 + col * 14;
        const y = FC_SITE.elevAt(bx, bz);
        /* Verify all 4 footprint corners stand >= +72.0 m (well above +65.0 m safe floor!) */
        const minC = Math.min(
          FC_SITE.elevAt(bx - 18, bz - 18), FC_SITE.elevAt(bx + 18, bz - 18),
          FC_SITE.elevAt(bx - 18, bz + 18), FC_SITE.elevAt(bx + 18, bz + 18)
        );
        if (minC < 72.0) continue;
        const key = bluffPool[(bIdx++) % bluffPool.length];
        tryPlace({
          id: 'fc.bluff.east_' + row + '_' + col,
          key: key,
          district: row >= 2 && col >= 6 ? 'D7' : 'D6',
          instance: 'bluff',
          x: bx, y: y, z: bz, ry: 0.24,
          v: (row + col) % 3
        });
      }
    }
    /* D7 Loess Terrace Granaries & Tea-Estate Villas */
    const d7Pool = ['kl_suudme_ziggurat_granary', 'ra_west_ziggurat_granary', 'kl_suudme_sanjhya_villa', 'ra_west_arcade_villa'];
    for (let k = 0; k < 12; k++) {
      const tx = 1360 + (k % 4) * 58;
      const tz = -860 - Math.floor(k / 4) * 62;
      const minC = Math.min(FC_SITE.elevAt(tx - 16, tz - 16), FC_SITE.elevAt(tx + 16, tz + 16));
      if (minC >= 76.0) {
        tryPlace({
          id: 'fc.d7.terrace_' + k,
          key: d7Pool[k % d7Pool.length],
          district: 'D7',
          instance: 'bluff',
          x: tx, y: FC_SITE.elevAt(tx, tz), z: tz, ry: 0.20, v: k % 2
        });
      }
    }

    /* -----------------------------------------------------------------------
       INSTANCE 2 (`dykes` on KCITY): D3 Boulevard-Dyke V-Wedge Finger-Piers,
       D4 Sea-Ring Lock Enclaves, & D5 Non-Residential Waterfall Slipway Works
       ----------------------------------------------------------------------- */
    const dykePoolNE = [
      'kl_suudme_arcade_insula', 'ra_west_artisan_shophouse', 'kl_suudme_sanjhya_villa',
      'kl_suudme_paktong_braziery', 'kl_suudme_compass_atelier', 'kl_suudme_silk_dyeworks',
      'ra_west_covered_bazaar', 'kl_suudme_quay_tenement'
    ];
    const dykePoolWest = [
      'ra_west_artisan_shophouse', 'ra_west_insula_apartments', 'ra_west_glaze_kiln',
      'ra_west_silk_dyeworks', 'ra_west_bronze_smithy', 'kl_suudme_glaze_kilnworks',
      'ra_west_courtyard_tenement', 'ra_west_stilt_house'
    ];

    const dykeConfigs = [
      { tag: 'nne', angDeg: -66.0, pool: dykePoolNE,   rList: [210, 272, 348, 412, 575, 638] },
      { tag: 'sw',  angDeg: 152.0, pool: dykePoolWest, rList: [210, 272, 352, 418, 565] },
      { tag: 'nw',  angDeg: -144.0,pool: dykePoolWest, rList: [210, 272, 352, 418, 565] }
    ];
    for (let d = 0; d < dykeConfigs.length; d++) {
      const dc = dykeConfigs[d];
      const a = dc.angDeg * Math.PI / 180;
      const nx = -Math.sin(a), nz = Math.cos(a);
      for (let ri = 0; ri < dc.rList.length; ri++) {
        const rf = dc.rList[ri];
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          const px = FC_SITE.WEIR_CX + rf * Math.cos(a) + sgn * 42.0 * nx;
          const pz = FC_SITE.WEIR_CZ + rf * Math.sin(a) + sgn * 42.0 * nz;
          const key = dc.pool[(ri * 2 + (sgn > 0 ? 1 : 0)) % dc.pool.length];
          tryPlace({
            id: 'fc.dyke.' + dc.tag + '_' + ri + '_' + (sgn > 0 ? 'R' : 'L'),
            key: key,
            district: 'D3',
            instance: 'dykes',
            x: px, y: 6.2, z: pz,
            ry: a + (sgn > 0 ? Math.PI * 0.5 : -Math.PI * 0.5),
            v: ri % 3
          });
        }
      }
    }

    /* D4 Sea-Ring Lock Gates, Weigh Stations & Beacons (+18 m Weir Promenade) */
    const d4Defs = [
      { id: 'fc.weir.suur_gate',   key: 'kl_suudme_ishtar_watergate', angDeg: -6.0  },
      { id: 'fc.weir.suur_wharf',  key: 'kl_suudme_tidal_wharf',      angDeg: -27.0 },
      { id: 'fc.weir.riwa_gate',   key: 'ra_west_water_gate',         angDeg: 62.0  },
      { id: 'fc.weir.riwa_bussabok',key:'ra_west_bussabok_gate',      angDeg: 86.0  },
      { id: 'fc.weir.west_arsenal',key: 'ra_west_boom_arsenal',       angDeg: 179.0 },
      { id: 'fc.weir.west_weigh',  key: 'ra_west_weigh_station',      angDeg: 204.0 },
      { id: 'fc.weir.west_beacon', key: 'ra_west_spiral_beacon',      angDeg: 168.0 },
      { id: 'fc.weir.upper_stoa',  key: 'ra_east_stoa_agora',         angDeg: 32.0  }
    ];
    for (let i = 0; i < d4Defs.length; i++) {
      const W = d4Defs[i], a = W.angDeg * Math.PI / 180;
      const wx = FC_SITE.WEIR_CX + 678.0 * Math.cos(a);
      const wz = FC_SITE.WEIR_CZ + 678.0 * Math.sin(a);
      tryPlace({
        id: W.id, key: W.key, district: 'D4', instance: 'dykes',
        x: wx, y: 18.0, z: wz, ry: a + Math.PI, v: i % 2
      });
    }

    /* D5 Lower Waterfall-Harbour & Slipway Ghat Works (< +65 m: STRICTLY non-residential works!) */
    const d5Works = [
      { id: 'fc.d5.suudme_wharf_1', key: 'kl_suudme_tidal_wharf',    x: 248, z: -792, ry: 0.22 },
      { id: 'fc.d5.ria_wharf_1',    key: 'ra_west_crane_wharf',      x: 328, z: -775, ry: 0.22 },
      { id: 'fc.d5.commissary',     key: 'ra_west_barge_commissary', x: 405, z: -758, ry: 0.22 },
      { id: 'fc.d5.suudme_wharf_2', key: 'kl_suudme_tidal_wharf',    x: 715, z: -698, ry: 0.24 }
    ];
    for (let i = 0; i < d5Works.length; i++) {
      const G = d5Works[i];
      tryPlace({
        id: G.id, key: G.key, district: 'D5', instance: 'dykes',
        x: G.x, y: Math.max(4.8, FC_SITE.elevAt(G.x, G.z)), z: G.z, ry: G.ry, required: true
      });
    }

    /* -----------------------------------------------------------------------
       INSTANCE 3 (`pontoons` via KCITY.floatPose): All 28 Cellular Moon-Pool
       Pontoons (K1-K6 Suudme, U1-U2 Upper Ria, F1-F2 Free-Port, P1-P18 Lower Ria)
       ----------------------------------------------------------------------- */
    const suudmePontoonSets = [
      ['kl_suudme_pontoon_factor', 'kl_suudme_sanjhya_villa', 'kl_suudme_trestle_cottage'],
      ['kl_suudme_uktena_bell_shrine', 'kl_suudme_arcade_insula', 'kl_suudme_sanjhya_villa'],
      ['kl_suudme_pontoon_factor', 'kl_suudme_compass_atelier', 'kl_suudme_quay_tenement']
    ];
    const riaPontoonSets = [
      ['ra_west_arcade_villa', 'ra_west_artisan_shophouse', 'ra_west_stilt_house', 'ra_west_canal_cottage'],
      ['ra_west_covered_bazaar', 'ra_west_artisan_shophouse', 'ra_west_courtyard_tenement'],
      ['ra_west_lotus_pavilion', 'ra_west_arcade_villa', 'ra_west_stilt_house'],
      ['ra_west_mandarin_court', 'ra_west_artisan_shophouse', 'ra_west_canal_cottage']
    ];
    const upperPontoonSet = ['ra_east_archon_residences', 'ra_east_peristyle_villa', 'ra_east_stoa_agora'];
    const freePontoonSet  = ['kl_suudme_pontoon_factor', 'ra_west_artisan_shophouse', 'kl_suudme_trestle_cottage'];

    const initLagoonY = FC_TIDE.tideY('lagoon', 0);
    for (let p = 0; p < PONTOONS.length; p++) {
      const W = PONTOONS[p];
      const pose = KCITY.floatPose(W, initLagoonY);
      const set = W.kind === 'suudme' ? suudmePontoonSets[p % suudmePontoonSets.length]
                : W.kind === 'upper'  ? upperPontoonSet
                : W.kind === 'free'   ? freePontoonSet
                : riaPontoonSets[p % riaPontoonSets.length];
      const nB = set.length;
      for (let k = 0; k < nB; k++) {
        const ang = (k * (2 * Math.PI / nB)) + (p % 2) * 0.35;
        const rRing = 27.5;
        const bx = W.x + rRing * Math.cos(ang);
        const bz = W.z + rRing * Math.sin(ang);
        /* Face inward toward the open central Moon-Pool! */
        const ry = Math.atan2(W.x - bx, W.z - bz);
        tryPlace({
          id: 'fc.pontoon.' + W.id + '_' + k,
          key: set[k],
          district: 'D2',
          instance: 'pontoons',
          wardId: W.id,
          x: bx,
          y: pose.deckY,
          localY: 0.0,
          z: bz,
          ry: ry,
          v: (p + k) % 3
        });
      }
    }

    /* Royal Sumeru Landmark Residences on Central Plinth (D1) */
    tryPlace({
      id: 'fc.d1.prasat_palace',
      key: 'ra_west_prasat_palace',
      district: 'D1',
      instance: 'dykes',
      x: 0, y: 16.0, z: 168, ry: 0, required: true
    });
    tryPlace({
      id: 'fc.d1.hongsa_prasat',
      key: 'ra_east_swan_prasat',
      district: 'D4',
      instance: 'dykes',
      x: 432, y: 6.2, z: 205, ry: -0.65
    });

    /* Continuous Pedestrian, Bascule, Cliff-Hoist & Submarine Lift Walk Graph */
    const walkNodes = ['bluff_as01', 'd5_ghat', 'dyke_nne', 'sumeru_plinth', 'dynamo_minus90', 'sala_ne', 'sala_se', 'sala_sw', 'sala_w', 'sala_n'];
    PONTOONS.forEach(function (w) { walkNodes.push(w.id); });
    const walkEdges = [
      ['bluff_as01', 'd5_ghat'],        /* 4x 90s Pioneer Cliff-Hoists */
      ['d5_ghat', 'dyke_nne'],          /* Bluff-Link Boulevard-Dyke foot */
      ['dyke_nne', 'sumeru_plinth'],    /* NNE Dyke to Sumeru Mandala */
      ['sumeru_plinth', 'dynamo_minus90'], /* Central vertical lift shaft to -90 m Dynamo Hall */
      ['sumeru_plinth', 'sala_ne'], ['sumeru_plinth', 'sala_se'],
      ['sumeru_plinth', 'sala_sw'], ['sumeru_plinth', 'sala_w'], ['sumeru_plinth', 'sala_n'],
      ['P7', 'P11'], ['P15', 'P16']     /* Naga boardwalk ferry-pier cross-links */
    ];
    BASCULE_LINKS.forEach(function (b) { walkEdges.push([b.from, b.to]); });

    return {
      lots: lots,
      byDistrict: byDistrict,
      pontoons: PONTOONS,
      bascules: BASCULE_LINKS,
      cables: CABLE_CHAINS,
      walkGraph: { nodes: walkNodes, edges: walkEdges }
    };
  }

  function auditLayout(planOut) {
    const L = planOut.lots;
    let overlaps = 0, badMainlandDwell = 0, suudmeCount = 0, lowerRiaCount = 0, upperRiaCount = 0;
    for (let i = 0; i < L.length; i++) {
      const a = L[i];
      if (a.style === 'suudme') suudmeCount++;
      else if (a.style === 'lower-ria') lowerRiaCount++;
      else if (a.style === 'upper-ria') upperRiaCount++;

      /* Check mainland permanent dwelling floor >= +65.0 m */
      if (a.instance === 'bluff' || (a.instance === 'dykes' && a.district === 'D5')) {
        if (a.res) {
          const corners = obbCorners(a, 0);
          for (let c = 0; c < 4; c++) {
            if (FC_SITE.elevAt(corners[c][0], corners[c][1]) < FC_SITE.SAFE_DWELL_Y) badMainlandDwell++;
          }
          if (a.y < FC_SITE.SAFE_DWELL_Y) badMainlandDwell++;
        }
      }
      for (let j = i + 1; j < L.length; j++) {
        if (obbOverlap(a, L[j], 0.15)) overlaps++;
      }
    }

    /* BFS Walk Graph Reachability from AS-01 Bluff Citadel to every Pontoon & -90 m Dynamo Hall */
    const adj = {};
    planOut.walkGraph.nodes.forEach(function (n) { adj[n] = []; });
    planOut.walkGraph.edges.forEach(function (e) {
      if (adj[e[0]] && adj[e[1]]) {
        adj[e[0]].push(e[1]);
        adj[e[1]].push(e[0]);
      }
    });
    const seen = new Set(['bluff_as01']);
    const q = ['bluff_as01'];
    while (q.length) {
      const cur = q.shift();
      const nb = adj[cur] || [];
      for (let i = 0; i < nb.length; i++) {
        if (!seen.has(nb[i])) {
          seen.add(nb[i]);
          q.push(nb[i]);
        }
      }
    }
    const unreached = planOut.walkGraph.nodes.filter(function (n) { return !seen.has(n); });

    return {
      ok: overlaps === 0 && badMainlandDwell === 0 && unreached.length === 0 && suudmeCount >= 24 && lowerRiaCount >= 60 && upperRiaCount >= 5,
      totalLots: L.length,
      overlaps: overlaps,
      badMainlandDwell: badMainlandDwell,
      suudmeCount: suudmeCount,
      lowerRiaCount: lowerRiaCount,
      upperRiaCount: upperRiaCount,
      unreachedNodes: unreached
    };
  }

  return {
    PONTOONS: PONTOONS,
    BASCULE_LINKS: BASCULE_LINKS,
    CABLE_CHAINS: CABLE_CHAINS,
    obbOverlap: obbOverlap,
    buildPlans: buildPlans,
    auditLayout: auditLayout
  };
})();
