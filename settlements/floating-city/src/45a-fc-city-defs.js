// ================================================================= FLOATING CITY — Building Defs, Voth Trades, 52 Pontoons & Bluff Street Network [G data]
// Pure [G data]: zero THREE, zero DOM, deterministic on KRAND.
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

/* Mainland Bluff Paved Street & Civic Square Plan (D6 & D7 Crown Headland, 100% >= +65.0 m) */
const FC_BLUFF_PLAN = (function () {
  'use strict';

  /* 5 East-West Curving Boulevards/Avenues following the Crown Headland escarpment contour */
  const AVE_OFFSETS = [
    { id: 'ave_esplanade', name: 'Grand Cliff-Lip Esplanade of the Amber Seal', dInland: 168.0, widthM: 20.0, cls: 'esplanade' },
    { id: 'ave_high',      name: 'Chancellery and Suudme Bourse High Avenue',   dInland: 242.0, widthM: 15.0, cls: 'avenue'    },
    { id: 'ave_guild',     name: 'Guildhall and Lotus Thermae Street',          dInland: 316.0, widthM: 13.5, cls: 'main'      },
    { id: 'ave_silk',      name: 'Caravanserai and Silk-Loft Street',           dInland: 390.0, widthM: 12.5, cls: 'main'      },
    { id: 'ave_granary',   name: 'Upper Loess Terrace and Granary Road',        dInland: 464.0, widthM: 11.5, cls: 'side'      },
    { id: 'ave_terrace',   name: 'North Tea-Garden and Orchard Way',            dInland: 536.0, widthM: 11.0, cls: 'side'      }
  ];

  /* 13 North-South Cross-Streets (4 aligned directly with the 4 Upper Funicular Terminals at x=215, 312, 412, 785!) */
  const CROSS_X = [118, 215, 312, 412, 492, 738, 785, 882, 978, 1074, 1170, 1266, 1362];

  /* 4 Paved Flagstone Civic Plazas */
  const PLAZAS = [
    { id: 'plaza_amber_seal', x0: 205, x1: 325, d0: 162, d1: 248, name: 'Court of the Amber Seal Grand Square' },
    { id: 'plaza_suudme',     x0: 385, x1: 485, d0: 162, d1: 248, name: 'Tooka-Suurgild Suudme Bourse Square' },
    { id: 'plaza_east_gate',  x0: 768, x1: 878, d0: 162, d1: 246, name: 'East Bluff Treaty & Funicular Square' },
    { id: 'plaza_bazaar',     x0: 985, x1: 1070,d0: 238, d1: 320, name: 'Crown Headland Spice & Silk Agora' }
  ];

  function inReservoirBasin(x, z, padM) {
    const pad = padM == null ? 0 : padM;
    const rx = 144.0 + pad, rz = 76.0 + pad;
    return Math.hypot((x - 615.0) / rx, (z + 1095.0) / rz) < 1.0;
  }

  function buildWays() {
    const ways = [];
    for (let a = 0; a < AVE_OFFSETS.length; a++) {
      const av = AVE_OFFSETS[a];
      /* Ave 0 (Esplanade) crosses the Reservoir mouth on a 5-Arch Stone Aqueduct Bridge; inland avenues split cleanly around Reservoir! */
      const xRanges = (a === 0 || a >= 3) ? [[85, 1410]] : [[85, 488], [738, 1410]];
      for (let r = 0; r < xRanges.length; r++) {
        const xr = xRanges[r];
        const pts = [];
        const steps = Math.max(8, Math.round((xr[1] - xr[0]) / 24));
        for (let s = 0; s <= steps; s++) {
          const x = xr[0] + (xr[1] - xr[0]) * (s / steps);
          const z = FC_SITE.bluffShoreZ(x) - av.dInland;
          pts.push([+x.toFixed(2), +z.toFixed(2)]);
        }
        ways.push({
          id: av.id + '_' + r,
          cls: av.cls,
          widthM: av.widthM,
          isBridge: (a === 0),
          pts: pts
        });
      }
    }

    for (let c = 0; c < CROSS_X.length; c++) {
      const x = CROSS_X[c];
      const pts = [];
      for (let s = 0; s <= 14; s++) {
        const d = 160.0 + (552.0 - 160.0) * (s / 14);
        const z = FC_SITE.bluffShoreZ(x) - d;
        if (inReservoirBasin(x, z, 6.0)) continue;
        pts.push([+x.toFixed(2), +z.toFixed(2)]);
      }
      if (pts.length >= 2) {
        ways.push({ id: 'cross_' + c, cls: 'cross', widthM: 11.0, isBridge: false, pts: pts });
      }
    }
    return ways;
  }

  return {
    AVE_OFFSETS: AVE_OFFSETS,
    CROSS_X: CROSS_X,
    PLAZAS: PLAZAS,
    inReservoirBasin: inReservoirBasin,
    buildWays: buildWays
  };
})();
