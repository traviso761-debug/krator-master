// ================================================================= FLOATING CITY — Building Defs, Voth Trades & Bluff Metropolis Plan [G data]
// Pure [G data]: zero THREE, zero DOM, deterministic on KRAND.
// Curated 68-def multi-kit architectural palette across KLK ('suudme') and RIK ('lower-ria' & 'upper-ria'),
// Voth 44-trade census (41 active + 3 reasoned regional N/A), and 9-Avenue Crown Headland Bluff Metropolis Plan.
const FC_DIMS = {
  /* KLK (kits/kulanewa style: 'suudme' — all 21 syncretic estuary defs) */
  kl_suudme_amber_bourse:       { kit: 'kulanewa', style: 'suudme', w: 30, d: 24, h: 22.4, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'bank' },
  kl_suudme_sauna_thermae:      { kit: 'kulanewa', style: 'suudme', w: 26, d: 22, h: 18.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'bath' },
  kl_suudme_uktena_bell_shrine: { kit: 'kulanewa', style: 'suudme', w: 28, d: 22, h: 19.4, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'shrine' },
  kl_suudme_pontoon_factor:     { kit: 'kulanewa', style: 'suudme', w: 26, d: 20, h: 17.8, wealth: 'rich',   res: true,  hh: 9,  pop: 42, role: 'trading' },
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
  kl_suudme_mandarin_court:     { kit: 'kulanewa', style: 'suudme', w: 28, d: 24, h: 18.4, wealth: 'rich',   res: true,  hh: 11, pop: 50, role: 'dwelling' },
  kl_suudme_patrician_palazzo:  { kit: 'kulanewa', style: 'suudme', w: 28, d: 24, h: 20.6, wealth: 'rich',   res: true,  hh: 16, pop: 72, role: 'dwelling' },
  kl_suudme_sanjhya_villa:      { kit: 'kulanewa', style: 'suudme', w: 18, d: 20, h: 15.8, wealth: 'middle', res: true,  hh: 8,  pop: 38, role: 'dwelling' },
  kl_suudme_arcade_insula:      { kit: 'kulanewa', style: 'suudme', w: 26, d: 19, h: 16.0, wealth: 'middle', res: true,  hh: 18, pop: 80, role: 'dwelling' },
  kl_suudme_trestle_cottage:    { kit: 'kulanewa', style: 'suudme', w: 16, d: 18, h: 12.2, wealth: 'poor',   res: true,  hh: 7,  pop: 32, role: 'dwelling' },
  kl_suudme_quay_tenement:      { kit: 'kulanewa', style: 'suudme', w: 22, d: 19, h: 15.2, wealth: 'poor',   res: true,  hh: 16, pop: 72, role: 'dwelling' },

  /* RIK (kits/ria style: 'lower-ria' — Western Ria Imperial Majority) */
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
  ra_west_ishtar_barracks:      { kit: 'ria', style: 'lower-ria', w: 22, d: 18, h: 18.0, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'keep' },
  ra_west_courier_mansio:       { kit: 'ria', style: 'lower-ria', w: 22, d: 20, h: 18.2, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'inn' },
  ra_west_curtain_bastion:      { kit: 'ria', style: 'lower-ria', w: 26, d: 16, h: 17.4, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'keep' },
  ra_west_mandarin_court:       { kit: 'ria', style: 'lower-ria', w: 28, d: 24, h: 19.2, wealth: 'rich',   res: true,  hh: 12, pop: 54, role: 'dwelling' },
  ra_west_clan_compound:        { kit: 'ria', style: 'lower-ria', w: 30, d: 26, h: 18.6, wealth: 'rich',   res: true,  hh: 14, pop: 62, role: 'dwelling' },
  ra_west_arcade_villa:         { kit: 'ria', style: 'lower-ria', w: 22, d: 19, h: 15.0, wealth: 'middle', res: true,  hh: 10, pop: 46, role: 'dwelling' },
  ra_west_artisan_shophouse:    { kit: 'ria', style: 'lower-ria', w: 16, d: 20, h: 15.2, wealth: 'middle', res: true,  hh: 12, pop: 54, role: 'dwelling' },
  ra_west_insula_apartments:    { kit: 'ria', style: 'lower-ria', w: 26, d: 18, h: 15.8, wealth: 'middle', res: true,  hh: 20, pop: 88, role: 'dwelling' },
  ra_west_courtyard_tenement:   { kit: 'ria', style: 'lower-ria', w: 22, d: 20, h: 16.8, wealth: 'poor',   res: true,  hh: 18, pop: 80, role: 'dwelling' },
  ra_west_stilt_house:          { kit: 'ria', style: 'lower-ria', w: 18, d: 18, h: 13.4, wealth: 'poor',   res: true,  hh: 9,  pop: 40, role: 'dwelling' },
  ra_west_canal_cottage:        { kit: 'ria', style: 'lower-ria', w: 14, d: 14, h: 10.8, wealth: 'poor',   res: true,  hh: 7,  pop: 32, role: 'dwelling' },
  ra_west_mudbrick_hut:         { kit: 'ria', style: 'lower-ria', w: 14, d: 14, h: 9.6,  wealth: 'poor',   res: true,  hh: 6,  pop: 28, role: 'dwelling' },

  /* Upper Ria ('upper-ria') Hongsa Co-Court Enclave & River-Factor Wards */
  ra_east_swan_prasat:          { kit: 'ria', style: 'upper-ria', w: 36, d: 30, h: 27.5, wealth: 'rich',   res: true,  hh: 12, pop: 54, role: 'embassy' },
  ra_east_stoa_agora:           { kit: 'ria', style: 'upper-ria', w: 26, d: 18, h: 16.8, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'truce-court' },
  ra_east_gopura_gate:          { kit: 'ria', style: 'upper-ria', w: 28, d: 20, h: 24.8, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'gate' },
  ra_east_saffron_viharn:       { kit: 'ria', style: 'upper-ria', w: 24, d: 26, h: 21.0, wealth: 'rich',   res: false, hh: 0,  pop: 0,  role: 'temple' },
  ra_east_skiff_boathouse:      { kit: 'ria', style: 'upper-ria', w: 22, d: 20, h: 15.0, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'wharf' },
  ra_east_stone_atelier:        { kit: 'ria', style: 'upper-ria', w: 20, d: 18, h: 13.8, wealth: 'middle', res: false, hh: 0,  pop: 0,  role: 'instrument' },
  ra_east_archon_residences:    { kit: 'ria', style: 'upper-ria', w: 28, d: 24, h: 19.4, wealth: 'rich',   res: true,  hh: 14, pop: 62, role: 'dwelling' },
  ra_east_peristyle_villa:      { kit: 'ria', style: 'upper-ria', w: 24, d: 22, h: 17.2, wealth: 'middle', res: true,  hh: 10, pop: 46, role: 'dwelling' },
  ra_east_veranda_insula:       { kit: 'ria', style: 'upper-ria', w: 26, d: 18, h: 16.0, wealth: 'middle', res: true,  hh: 18, pop: 80, role: 'dwelling' },
  ra_east_stepped_tenement:     { kit: 'ria', style: 'upper-ria', w: 22, d: 20, h: 17.2, wealth: 'poor',   res: true,  hh: 16, pop: 72, role: 'dwelling' },
  ra_east_lapidary_shophouse:   { kit: 'ria', style: 'upper-ria', w: 16, d: 20, h: 15.4, wealth: 'middle', res: true,  hh: 11, pop: 50, role: 'dwelling' },
  ra_east_terrace_house:        { kit: 'ria', style: 'upper-ria', w: 17, d: 16, h: 14.4, wealth: 'middle', res: true,  hh: 9,  pop: 40, role: 'dwelling' },
  ra_east_karst_cottage:        { kit: 'ria', style: 'upper-ria', w: 14, d: 14, h: 10.8, wealth: 'poor',   res: true,  hh: 7,  pop: 32, role: 'dwelling' }
};

/* Voth 44-Trade Census Closure (`41/44` carried across Lower Ria + Suudme + Pioneer Hydro-Dynamo; `3` canonical northern `na`) */
const FC_TRADES = [
  { id: 1,  trade: 'farmers and crop hands',              keys: ['ra_west_ziggurat_granary', 'kl_suudme_ziggurat_granary'] },
  { id: 2,  trade: 'herders and stockmen',                keys: ['ra_west_barge_commissary'] },
  { id: 3,  trade: 'fishermen and shellfish gatherers',   keys: ['kl_suudme_tidal_wharf', 'ra_west_crane_wharf'] },
  { id: 4,  trade: 'hunters and trappers',                keys: ['kl_suudme_trestle_cottage'] },
  { id: 5,  trade: 'woodcutters and charcoal burners',    keys: ['ra_west_barge_commissary'] },
  { id: 6,  trade: 'quarrymen and stonecutters',          keys: ['ra_west_glaze_kiln', 'ra_east_stone_atelier'] },
  { id: 7,  trade: 'miners and ore dressers',             keys: ['kl_suudme_paktong_braziery'] },
  { id: 8,  trade: 'clay diggers and brickmakers',        keys: ['ra_west_glaze_kiln', 'kl_suudme_glaze_kilnworks'] },
  { id: 9,  trade: 'millers and grain grinders',          keys: ['ra_west_ziggurat_granary', 'kl_suudme_ziggurat_granary'] },
  { id: 10, trade: 'bakers and pastry cooks',             keys: ['ra_west_artisan_shophouse', 'kl_suudme_arcade_insula'] },
  { id: 11, trade: 'brewers, vintners and distillers',    keys: ['ra_west_caravanserai_inn', 'kl_suudme_caravanserai'] },
  { id: 12, trade: 'butchers and salters',                keys: ['ra_west_covered_bazaar', 'kl_suudme_covered_bazaar'] },
  { id: 13, trade: 'weavers, spinners and fullers',       keys: ['ra_west_silk_dyeworks', 'kl_suudme_silk_dyeworks'] },
  { id: 14, trade: 'dyers and cloth finishers',           keys: ['ra_west_silk_dyeworks', 'kl_suudme_silk_dyeworks'] },
  { id: 15, trade: 'tailors, cobblers and leatherworkers',keys: ['ra_west_artisan_shophouse', 'ra_east_lapidary_shophouse'] },
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

/* Expanded Mainland Bluff Metropolis & Upland Terraced Farms Plan (D6 & D7 Crown Headland, 100% >= +65.0 m) */
const FC_BLUFF_PLAN = (function () {
  'use strict';

  /* 9 East-West Curving Boulevards/Avenues across 2.52 km of Crown Headland (x = -860..+1660, dInland = 168..680 m) */
  const AVE_OFFSETS = [
    { id: 'ave_esplanade', name: 'Grand Cliff-Brow Promenade of the Amber Seal', dInland: 168.0, widthM: 21.0, cls: 'esplanade' },
    { id: 'ave_seal',      name: 'Chancellery and Imperial Vault Avenue',        dInland: 232.0, widthM: 15.5, cls: 'avenue'    },
    { id: 'ave_bourse',    name: 'Tooka-Suurgild Suudme Bourse High Street',     dInland: 296.0, widthM: 14.5, cls: 'avenue'    },
    { id: 'ave_bazaar',    name: 'Covered Bazaar and Lotus Thermae Street',      dInland: 360.0, widthM: 13.5, cls: 'main'      },
    { id: 'ave_silk',      name: 'Silk-Loft, Indigo and Guildhall Street',       dInland: 424.0, widthM: 13.0, cls: 'main'      },
    { id: 'ave_insula',    name: 'Mandarin Quarter and Caravanserai Road',       dInland: 488.0, widthM: 12.5, cls: 'main'      },
    { id: 'ave_warehouse', name: 'State Granary and Foundry Terrace Road',       dInland: 552.0, widthM: 12.0, cls: 'side'      },
    { id: 'ave_terrace',   name: 'Upper Loess Tea-Factor and Kiln Way',          dInland: 616.0, widthM: 11.5, cls: 'side'      },
    { id: 'ave_orchard',   name: 'North Rim Camphor and Mulberry Orchard Way',   dInland: 680.0, widthM: 11.0, cls: 'side'      }
  ];

  /* 19 North-South Cross-Streets & Citadel Radial Spokes (aligned with all 4 Upper Funicular Terminals [165, 315, 465, 865]!) */
  const CROSS_X = [-820, -695, -570, -445, -320, -195, -70, 50, 165, 315, 465, 790, 865, 985, 1105, 1225, 1345, 1465, 1585];

  /* 6 Paved Flagstone Civic Plazas */
  const PLAZAS = [
    { id: 'plaza_west_keep',  x0: -435, x1: -330, d0: 164, d1: 238, name: 'West Headland Watch & Guild Square' },
    { id: 'plaza_amber_seal', x0:  175, x1:  305, d0: 164, d1: 238, name: 'Court of the Amber Seal Supreme Square' },
    { id: 'plaza_suudme',     x0:  330, x1:  455, d0: 164, d1: 238, name: 'Tooka-Suurgild Suudme Bourse Square' },
    { id: 'plaza_east_gate',  x0:  800, x1:  920, d0: 164, d1: 238, name: 'East Bluff Treaty & Funicular Square' },
    { id: 'plaza_bazaar',     x0: 1115, x1: 1215, d0: 292, d1: 366, name: 'Crown Headland Spice & Silk Agora' },
    { id: 'plaza_citadel_n',  x0:  180, x1:  305, d0: 356, d1: 428, name: 'Chakri Scriptorium & Library Court' }
  ];

  /* 16 Lush Upland Terraced Farm & Tea/Citrus/Mulberry Orchard Fields behind the Bluff Metropolis (y >= +130 m) */
  const UPLAND_FARMS = [];
  for (let i = 0; i < 16; i++) {
    const x = -760 + i * 156;
    const dIn = (i % 2 === 0) ? 752.0 : 816.0;
    const cropKind = (i % 4 === 0) ? 'tea' : (i % 4 === 1 ? 'mulberry' : (i % 4 === 2 ? 'citrus' : 'taro'));
    UPLAND_FARMS.push({
      id: 'fc.upland_farm.' + i,
      x: x,
      dInland: dIn,
      w: 118.0,
      d: 52.0,
      crop: cropKind,
      harvest: cropKind === 'mulberry' ? { silk: 0.85, food: 1.8 } : { food: 3.6 }
    });
  }

  function inReservoirBasin(x, z, padM) {
    const pad = padM == null ? 0 : padM;
    const rx = 136.0 + pad, rz = 70.0 + pad;
    return Math.hypot((x - 636.0) / rx, (z + 1358.0) / rz) < 1.0;
  }

  function plazaBounds(P) {
    /* Snap each plaza's N-S span cleanly to the block interior between flanking avenues so plazas never overlap avenues! */
    let dMin = P.d0, dMax = P.d1;
    for (let a = 0; a < AVE_OFFSETS.length - 1; a++) {
      const avS = AVE_OFFSETS[a], avN = AVE_OFFSETS[a + 1];
      const nEdge = avS.dInland + avS.widthM * 0.5 + 1.25;
      const sEdge = avN.dInland - avN.widthM * 0.5 - 1.25;
      const midP = 0.5 * (P.d0 + P.d1);
      if (midP > avS.dInland && midP < avN.dInland) {
        dMin = nEdge;
        dMax = sEdge;
        break;
      }
    }
    return { x0: P.x0, x1: P.x1, d0: +dMin.toFixed(2), d1: +dMax.toFixed(2) };
  }

  function buildWays() {
    const ways = [];
    for (let a = 0; a < AVE_OFFSETS.length; a++) {
      const av = AVE_OFFSETS[a];
      /* Ave 0 (Esplanade) crosses Reservoir mouth on a 6-Pier Stone Aqueduct Bridge; Aves 1-2 split cleanly around Reservoir! */
      const xRanges = (a === 0 || a >= 3) ? [[-860, 1660]] : [[-860, 492], [780, 1660]];
      for (let r = 0; r < xRanges.length; r++) {
        const xr = xRanges[r];
        const pts = [];
        const steps = Math.max(8, Math.round((xr[1] - xr[0]) / 28));
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

    const trimmedPlazas = PLAZAS.map(plazaBounds);
    for (let c = 0; c < CROSS_X.length; c++) {
      const x = CROSS_X[c];
      for (let a = 0; a < AVE_OFFSETS.length - 1; a++) {
        const dStart = AVE_OFFSETS[a].dInland + AVE_OFFSETS[a].widthM * 0.5 + 1.25;
        const dEnd = AVE_OFFSETS[a + 1].dInland - AVE_OFFSETS[a + 1].widthM * 0.5 - 1.25;
        if (dEnd - dStart < 4.0) continue;

        /* Skip block segment if this cross-street runs inside a paved Civic Plaza in this avenue block */
        let insidePlaza = false;
        const dMid = 0.5 * (dStart + dEnd);
        for (let p = 0; p < trimmedPlazas.length; p++) {
          const TP = trimmedPlazas[p];
          if (x + 5.7 > TP.x0 && x - 5.7 < TP.x1 && dMid > TP.d0 - 1.0 && dMid < TP.d1 + 1.0) {
            insidePlaza = true;
            break;
          }
        }
        if (insidePlaza) continue;

        const zStart = FC_SITE.bluffShoreZ(x) - dStart;
        const zEnd = FC_SITE.bluffShoreZ(x) - dEnd;
        const zMid = 0.5 * (zStart + zEnd);
        if (inReservoirBasin(x, zStart, 8.0) || inReservoirBasin(x, zEnd, 8.0) || inReservoirBasin(x, zMid, 8.0)) continue;

        const pts = [];
        const nSub = 3;
        for (let s = 0; s <= nSub; s++) {
          const d = dStart + (dEnd - dStart) * (s / nSub);
          const z = FC_SITE.bluffShoreZ(x) - d;
          pts.push([+x.toFixed(2), +z.toFixed(2)]);
        }
        ways.push({ id: 'cross_' + c + '_' + a, cls: 'cross', widthM: 11.0, isBridge: false, pts: pts });
      }
    }
    return ways;
  }

  return {
    AVE_OFFSETS: AVE_OFFSETS,
    CROSS_X: CROSS_X,
    PLAZAS: PLAZAS,
    UPLAND_FARMS: UPLAND_FARMS,
    plazaBounds: plazaBounds,
    inReservoirBasin: inReservoirBasin,
    buildWays: buildWays
  };
})();
