// ================================================================= ARCODIGA — Multi-Kit Footprint Manifest & KRATOR_KITS Registration [G data]
// Exact building dimensions (w, d, h, family, wealth, types, tier) for kits/hueru-kuran ('hueru-kuran') and kits/eternian ('eternian')
// so KCITY.multikit and tests/test-arcodiga-town.js run deterministically in both pure Node and WebGL2 browser host.
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const ADG_TUNE = (function(){
 const HK_PIECES = {
  hk_house_poor_flenser:   { w: 12.8, d: 13.6, h:  7.6, family: 'poor',   wealth: 0.25, types: ['dwelling'], tier: 1 },
  hk_house_poor_kelper:    { w: 13.2, d: 14.4, h:  7.5, family: 'poor',   wealth: 0.28, types: ['dwelling'], tier: 1 },
  hk_house_poor_diver:     { w: 17.6, d: 13.8, h:  7.6, family: 'poor',   wealth: 0.32, types: ['dwelling'], tier: 1 },
  hk_house_mid_carver:     { w: 16.8, d: 14.8, h:  8.4, family: 'mid',    wealth: 0.52, types: ['dwelling', 'workshop'], tier: 1 },
  hk_house_mid_harpooneer: { w: 16.6, d: 14.6, h:  8.5, family: 'mid',    wealth: 0.55, types: ['dwelling'], tier: 1 },
  hk_house_mid_skipper:    { w: 17.8, d: 14.8, h:  9.8, family: 'mid',    wealth: 0.62, types: ['dwelling'], tier: 1 },
  hk_house_rich_steward:   { w: 21.2, d: 17.8, h:  9.6, family: 'rich',   wealth: 0.78, types: ['dwelling'], tier: 2 },
  hk_house_rich_whalelord: { w: 21.6, d: 17.4, h: 11.6, family: 'rich',   wealth: 0.86, types: ['dwelling'], tier: 2 },
  hk_house_rich_clan:      { w: 22.4, d: 19.6, h:  9.4, family: 'rich',   wealth: 0.88, types: ['dwelling'], tier: 2 },
  hk_inn_terrace:          { w: 19.6, d: 15.6, h:  9.6, family: 'hosp',   wealth: 0.58, types: ['inn', 'hospitality'], tier: 2 },
  hk_tavern_whale:         { w: 18.4, d: 16.4, h:  9.2, family: 'hosp',   wealth: 0.50, types: ['tavern', 'hospitality'], tier: 2 },
  hk_embassy_hayrant:      { w: 19.2, d: 15.8, h: 10.4, family: 'civic',  wealth: 0.82, types: ['civic', 'embassy'], tier: 3 },
  hk_nuraghe_complesso:    { w: 25.6, d: 23.6, h: 14.2, family: 'civic',  wealth: 0.95, types: ['civic', 'fortress'], tier: 3 },
  hk_stepwell_sanctuary:   { w: 19.6, d: 20.4, h:  8.6, family: 'sacred', wealth: 0.92, types: ['sacred', 'civic'], tier: 3 },
  hk_ukor_council:         { w: 22.4, d: 21.2, h: 11.2, family: 'civic',  wealth: 0.90, types: ['civic'], tier: 3 },
  hk_ukor_matron_lodge:    { w: 22.8, d: 16.8, h: 10.4, family: 'rich',   wealth: 0.90, types: ['civic', 'dwelling'], tier: 2 },
  hk_jade_exchange:        { w: 19.6, d: 15.8, h:  9.8, family: 'trade',  wealth: 0.76, types: ['market', 'trade'], tier: 2 },
  hk_lore_hall:            { w: 16.8, d: 14.6, h:  8.8, family: 'civic',  wealth: 0.74, types: ['civic', 'school'], tier: 3 },
  hk_healer_lodge:         { w: 18.2, d: 14.8, h:  8.4, family: 'civic',  wealth: 0.68, types: ['civic'], tier: 2 },
  hk_ossuary_barrow:       { w: 19.4, d: 17.2, h:  8.6, family: 'sacred', wealth: 0.72, types: ['sacred'], tier: 3 },
  hk_jade_sawmill:         { w: 21.6, d: 16.8, h:  9.6, family: 'work',   wealth: 0.62, types: ['industry', 'work'], tier: 2 },
  hk_blubber_tryworks:     { w: 19.2, d: 15.4, h:  8.8, family: 'work',   wealth: 0.48, types: ['industry', 'work'], tier: 2 },
  hk_baleen_loft:          { w: 19.4, d: 14.6, h:  8.4, family: 'work',   wealth: 0.52, types: ['craft', 'work'], tier: 2 },
  hk_kelp_glassworks:      { w: 18.8, d: 15.4, h:  9.4, family: 'work',   wealth: 0.58, types: ['industry', 'work'], tier: 2 },
  hk_harpoon_smithy:       { w: 16.8, d: 14.4, h:  8.6, family: 'work',   wealth: 0.56, types: ['craft', 'work'], tier: 2 },
  hk_kaen_kiln:            { w: 18.6, d: 16.2, h:  8.8, family: 'work',   wealth: 0.52, types: ['industry', 'work'], tier: 2 },
  hk_smokehouse_saltery:   { w: 18.2, d: 14.8, h:  8.6, family: 'work',   wealth: 0.48, types: ['craft', 'work'], tier: 2 },
  hk_bakehouse:            { w: 16.4, d: 14.4, h:  8.4, family: 'shop',   wealth: 0.50, types: ['shop', 'craft'], tier: 2 },
  hk_sealhide_tailor:      { w: 17.6, d: 14.6, h:  8.4, family: 'shop',   wealth: 0.52, types: ['shop', 'craft'], tier: 2 },
  hk_brew_kelp:            { w: 17.4, d: 14.6, h:  8.6, family: 'shop',   wealth: 0.50, types: ['shop', 'craft'], tier: 2 },
  hk_cypress_flume_yard:   { w: 22.4, d: 16.4, h:  9.4, family: 'work',   wealth: 0.60, types: ['industry', 'work'], tier: 2 },
  hk_market_terrace:       { w: 19.6, d: 13.4, h:  6.4, family: 'market', wealth: 0.56, types: ['market', 'shop'], tier: 2 },
  hk_granary_nuraghe:      { w: 15.4, d: 15.8, h: 11.4, family: 'work',   wealth: 0.62, types: ['work', 'storage'], tier: 2 },
  hk_warehouse_vault:      { w: 20.4, d: 15.6, h:  9.2, family: 'work',   wealth: 0.64, types: ['work', 'storage'], tier: 2 },
  hk_terrace_croft:        { w: 20.4, d: 16.8, h:  7.6, family: 'farm',   wealth: 0.42, types: ['farm', 'work'], tier: 1 },
  hk_jade_quarry:          { w: 20.6, d: 16.4, h:  9.6, family: 'work',   wealth: 0.58, types: ['industry', 'mine'], tier: 2 },
  hk_wave_splitter:        { w: 16.8, d: 19.6, h: 10.6, family: 'harbor', wealth: 0.70, types: ['infrastructure'], tier: 3 },
  hk_prou_torre:           { w: 16.4, d: 18.8, h: 14.6, family: 'harbor', wealth: 0.76, types: ['military', 'infrastructure'], tier: 3 },
  hk_cliff_hoist:          { w: 19.6, d: 17.8, h: 13.8, family: 'harbor', wealth: 0.74, types: ['infrastructure', 'work'], tier: 3 },
  hk_baidarka_yard:        { w: 21.2, d: 16.8, h:  9.4, family: 'harbor', wealth: 0.56, types: ['work', 'harbor'], tier: 2 },
  hk_crater_quay:          { w: 20.4, d: 16.4, h:  9.6, family: 'harbor', wealth: 0.62, types: ['harbor', 'trade'], tier: 2 },
  hk_ferry_causeway:       { w: 15.6, d: 16.8, h:  8.8, family: 'harbor', wealth: 0.58, types: ['harbor', 'infrastructure'], tier: 2 },
  hk_beacon_nuraghe:       { w: 14.4, d: 14.8, h: 15.6, family: 'harbor', wealth: 0.78, types: ['infrastructure', 'civic'], tier: 3 },
  hk_cliff_gatehouse:      { w: 19.6, d: 14.2, h: 10.8, family: 'civic',  wealth: 0.74, types: ['military', 'civic'], tier: 3 },
  hk_watch_barracks:       { w: 19.4, d: 15.4, h:  9.6, family: 'civic',  wealth: 0.68, types: ['military'], tier: 3 }
 };

 const ET_PIECES = {
  et_block_hut:        { w:  7.2, d:  5.4, h:  4.0, family: 'poor',   wealth: 0.25, types: ['dwelling'], tier: 1 },
  et_reed_house:       { w:  7.0, d:  7.0, h:  5.4, family: 'poor',   wealth: 0.28, types: ['dwelling'], tier: 1 },
  et_hex_hut:          { w:  8.0, d:  8.0, h:  6.0, family: 'poor',   wealth: 0.32, types: ['dwelling'], tier: 1 },
  et_canal_house:      { w: 10.0, d: 12.0, h: 10.0, family: 'mid',    wealth: 0.52, types: ['dwelling'], tier: 1 },
  et_canal_row:        { w: 13.0, d:  9.0, h:  8.0, family: 'mid',    wealth: 0.50, types: ['dwelling'], tier: 1 },
  et_hex_house:        { w: 11.0, d: 11.0, h: 11.0, family: 'mid',    wealth: 0.58, types: ['dwelling'], tier: 1 },
  et_court_house:      { w: 14.4, d: 14.4, h:  7.0, family: 'mid',    wealth: 0.64, types: ['dwelling'], tier: 1 },
  et_corner_turret:    { w: 11.0, d: 11.0, h: 16.5, family: 'mid',    wealth: 0.66, types: ['dwelling'], tier: 2 },
  et_merchant_house:   { w: 12.4, d: 11.4, h: 18.4, family: 'rich',   wealth: 0.78, types: ['dwelling', 'trade'], tier: 2 },
  et_hex_villa:        { w: 24.0, d: 24.0, h: 15.0, family: 'rich',   wealth: 0.84, types: ['dwelling'], tier: 2 },
  et_official_villa:   { w: 24.6, d: 20.6, h: 11.6, family: 'rich',   wealth: 0.90, types: ['dwelling', 'civic'], tier: 2 },
  et_shophouse:        { w: 10.0, d: 10.0, h: 10.0, family: 'shop',   wealth: 0.54, types: ['shop', 'commercial'], tier: 2 },
  et_tea_house:        { w: 14.0, d: 14.0, h:  9.0, family: 'hosp',   wealth: 0.58, types: ['tavern', 'hospitality'], tier: 2 },
  et_inn:              { w: 22.0, d: 20.0, h: 15.0, family: 'hosp',   wealth: 0.66, types: ['inn', 'hospitality'], tier: 2 },
  et_bakehouse:        { w: 11.0, d: 11.0, h: 10.0, family: 'shop',   wealth: 0.48, types: ['shop', 'craft'], tier: 2 },
  et_butcher:          { w: 10.0, d:  9.0, h:  8.0, family: 'shop',   wealth: 0.46, types: ['shop', 'craft'], tier: 2 },
  et_weaver:           { w: 12.0, d: 12.0, h: 10.0, family: 'work',   wealth: 0.52, types: ['craft', 'work'], tier: 2 },
  et_brewhouse:        { w: 12.0, d: 11.0, h: 11.0, family: 'work',   wealth: 0.50, types: ['craft', 'work'], tier: 2 },
  et_tannery:          { w: 14.0, d: 12.0, h:  6.0, family: 'work',   wealth: 0.44, types: ['craft', 'work'], tier: 2 },
  et_smithy:           { w: 11.0, d: 10.0, h: 10.0, family: 'work',   wealth: 0.56, types: ['craft', 'work'], tier: 2 },
  et_kiln:             { w: 26.0, d: 26.0, h: 14.0, family: 'work',   wealth: 0.58, types: ['industry', 'work'], tier: 2 },
  et_porcelain:        { w: 16.0, d: 10.0, h: 12.0, family: 'work',   wealth: 0.64, types: ['industry', 'work'], tier: 2 },
  et_paper_mill:       { w: 16.0, d: 13.0, h: 12.0, family: 'work',   wealth: 0.58, types: ['industry', 'work'], tier: 2 },
  et_tile_works:       { w: 24.0, d: 28.0, h: 14.0, family: 'work',   wealth: 0.56, types: ['industry', 'work'], tier: 2 },
  et_warehouse:        { w: 20.0, d: 22.0, h: 18.0, family: 'work',   wealth: 0.66, types: ['work', 'storage'], tier: 2 },
  et_granary:          { w: 15.0, d: 15.0, h: 14.0, family: 'work',   wealth: 0.62, types: ['work', 'storage'], tier: 2 },
  et_mine:             { w: 22.0, d: 18.0, h: 16.0, family: 'work',   wealth: 0.58, types: ['industry', 'mine'], tier: 2 },
  et_quarry:           { w: 24.0, d: 18.0, h: 12.0, family: 'work',   wealth: 0.54, types: ['industry', 'work'], tier: 2 },
  et_terraces:         { w: 24.0, d: 20.0, h:  4.0, family: 'farm',   wealth: 0.42, types: ['farm'], tier: 1 },
  et_tea_garden:       { w: 26.0, d: 22.0, h:  8.0, family: 'farm',   wealth: 0.48, types: ['farm'], tier: 1 },
  et_goat_fold:        { w: 20.0, d: 20.0, h:  3.2, family: 'farm',   wealth: 0.40, types: ['farm'], tier: 1 },
  et_stock_pens:       { w: 22.0, d: 18.0, h:  7.0, family: 'farm',   wealth: 0.40, types: ['farm'], tier: 1 },
  et_ministry:         { w: 27.0, d: 22.0, h: 46.0, family: 'civic',  wealth: 0.96, types: ['civic'], tier: 3 },
  et_registry:         { w: 30.0, d: 18.0, h: 17.0, family: 'civic',  wealth: 0.88, types: ['civic'], tier: 3 },
  et_examination_hall: { w: 26.0, d: 26.0, h: 30.0, family: 'civic',  wealth: 0.90, types: ['civic'], tier: 3 },
  et_customs_house:    { w: 21.0, d: 13.0, h: 15.0, family: 'civic',  wealth: 0.84, types: ['civic', 'trade'], tier: 3 },
  et_market_hall:      { w: 26.0, d: 26.0, h: 22.0, family: 'market', wealth: 0.80, types: ['market', 'commercial'], tier: 3 },
  et_fort:             { w: 98.0, d: 88.0, h: 32.0, family: 'civic',  wealth: 0.98, types: ['military', 'fortress'], tier: 3 },
  et_barracks:         { w: 25.0, d: 21.0, h: 12.0, family: 'civic',  wealth: 0.76, types: ['military'], tier: 3 },
  et_gate:             { w: 26.0, d: 10.0, h: 30.0, family: 'civic',  wealth: 0.82, types: ['military', 'civic'], tier: 3 },
  et_wall_tower:       { w: 11.0, d: 11.0, h: 26.0, family: 'civic',  wealth: 0.74, types: ['military'], tier: 3 },
  et_clock:            { w: 24.0, d:  8.0, h: 26.0, family: 'civic',  wealth: 0.94, types: ['civic', 'landmark'], tier: 3 },
  et_tube_station:     { w: 10.0, d: 10.0, h:  9.0, family: 'civic',  wealth: 0.80, types: ['infrastructure', 'civic'], tier: 3 },
  et_relic_hall:       { w: 22.0, d: 27.0, h: 18.0, family: 'civic',  wealth: 0.92, types: ['civic', 'sacred'], tier: 3 },
  et_ancestor_gallery: { w: 13.0, d: 30.0, h: 23.4, family: 'sacred', wealth: 0.90, types: ['sacred', 'civic'], tier: 3 },
  et_historians_house: { w: 18.0, d: 13.0, h: 22.0, family: 'civic',  wealth: 0.86, types: ['civic'], tier: 3 },
  et_healer:           { w: 14.0, d: 14.0, h: 10.0, family: 'civic',  wealth: 0.72, types: ['civic'], tier: 2 },
  et_mask_house:       { w: 15.0, d: 11.0, h:  8.0, family: 'sacred', wealth: 0.70, types: ['sacred'], tier: 2 },
  et_shrine_niche:     { w:  2.4, d:  1.6, h:  3.4, family: 'sacred', wealth: 0.60, types: ['sacred'], tier: 2 },
  et_talking_head:     { w:  5.0, d:  3.4, h:  5.4, family: 'sacred', wealth: 0.88, types: ['sacred', 'landmark'], tier: 3 },
  et_quay:             { w: 32.0, d: 14.0, h: 12.0, family: 'harbor', wealth: 0.72, types: ['harbor', 'trade'], tier: 2 },
  et_dock:             { w: 30.0, d: 26.0, h: 12.0, family: 'harbor', wealth: 0.76, types: ['harbor', 'work'], tier: 2 },
  et_canal_landing:    { w: 12.0, d: 12.0, h:  5.0, family: 'harbor', wealth: 0.58, types: ['harbor'], tier: 2 },
  et_ferry_landing:    { w: 12.0, d: 16.0, h:  5.0, family: 'harbor', wealth: 0.58, types: ['harbor'], tier: 2 },
  et_fish_landing:     { w: 14.0, d: 16.0, h:  4.0, family: 'harbor', wealth: 0.54, types: ['harbor'], tier: 2 },
  et_lighthouse:       { w: 14.0, d: 14.0, h: 34.0, family: 'harbor', wealth: 0.84, types: ['harbor', 'landmark'], tier: 3 }
 };

 function installManifest(KK){
  if (!KK || !KK.loadManifest) return null;
  KK.loadManifest({
   version: 1,
   kits: {
    'hueru-kuran': {
     id: 'hueru-kuran', name: 'Hueru-Kuran Whale Clans', culture: 'hueru-kuran',
     lineage: 'engine', pack: 'hueru-kuran', defaultDoorH: 2.1, pieces: HK_PIECES
    },
    'eternian': {
     id: 'eternian', name: 'Eternal State Superintendency', culture: 'eternian',
     lineage: 'engine', pack: 'eternian', defaultDoorH: 2.2, pieces: ET_PIECES
    }
   }
  });
  return KK.manifest();
 }

 function dimsOf(qkey, v){
  const s = String(qkey || '');
  const idx = s.indexOf(':');
  const kitId = idx > 0 ? s.slice(0, idx) : (s.indexOf('et_') === 0 ? 'eternian' : 'hueru-kuran');
  const rawKey = idx > 0 ? s.slice(idx + 1) : s;
  const src = kitId === 'eternian' ? ET_PIECES[rawKey] : HK_PIECES[rawKey];
  if (!src) return null;
  return {
   qkey: kitId + ':' + rawKey,
   kit: kitId,
   rawKey: rawKey,
   v: v == null ? 0 : (v | 0),
   w: src.w,
   d: src.d,
   h: src.h,
   family: src.family,
   wealth: src.wealth,
   types: src.types.slice(),
   tier: src.tier
  };
 }

 function isDwellingKey(qkey){
  const dm = dimsOf(qkey, 0);
  if (!dm) return false;
  if (dm.family === 'harbor' || dm.family === 'work' || dm.family === 'market' || dm.family === 'sacred') return false;
  for (let i = 0; i < dm.types.length; i++) {
   const t = dm.types[i];
   if (t === 'dwelling' || t === 'inn') return true;
  }
  return false;
 }

 return {
  HK_PIECES: HK_PIECES,
  ET_PIECES: ET_PIECES,
  installManifest: installManifest,
  dimsOf: dimsOf,
  isDwellingKey: isDwellingKey
 };
})();
