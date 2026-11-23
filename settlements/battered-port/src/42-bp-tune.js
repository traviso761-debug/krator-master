// ================================================================= BATTERED PORT — Kit footprint dimensions & KCITY tune [G data]
// Deterministic kit footprint boxes [w, d, h] matching kits/eternian/src & Battered Port custom structures,
// plus KCITY tuning for Instance A (rim, >= +85.0 m) & Instance B (cove).
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const BP_KIT_DIMS = {
 et_reed_house:        { w:  7.0, d:  8.0, h:  4.6, cls: 'poor',       types: ['dwelling-single'] },
 et_block_hut:         { w:  7.5, d:  8.5, h:  5.0, cls: 'poor',       types: ['dwelling-single'] },
 et_hex_hut:           { w:  8.0, d:  8.0, h:  5.2, cls: 'poor',       types: ['dwelling-single'] },
 et_canal_house:       { w:  8.5, d: 12.0, h:  9.2, cls: 'middle',     types: ['dwelling-multi'] },
 et_canal_row:         { w: 18.0, d: 11.5, h:  9.4, cls: 'middle',     types: ['dwelling-multi'] },
 et_hex_house:         { w: 10.5, d: 10.5, h:  8.8, cls: 'middle',     types: ['dwelling-single'] },
 et_corner_turret:     { w: 11.0, d: 11.0, h: 12.5, cls: 'middle',     types: ['dwelling-multi'] },
 et_court_house:       { w: 15.0, d: 16.0, h:  9.5, cls: 'rich',       types: ['dwelling-single'] },
 et_merchant_house:    { w: 16.0, d: 18.0, h: 11.5, cls: 'rich',       types: ['dwelling-single', 'shop'] },
 et_hex_villa:         { w: 17.0, d: 17.0, h: 11.0, cls: 'rich',       types: ['dwelling-single'] },
 et_official_villa:    { w: 22.0, d: 24.0, h: 13.5, cls: 'manor',      types: ['dwelling-single', 'civic'] },
 et_shophouse:         { w:  9.0, d: 12.5, h:  9.0, cls: 'shop',       types: ['shop'] },
 et_bakehouse:         { w: 11.0, d: 12.0, h:  7.2, cls: 'shop',       types: ['shop', 'industry'] },
 et_butcher:           { w: 10.0, d: 11.0, h:  6.8, cls: 'shop',       types: ['shop'] },
 et_weaver:            { w: 13.0, d: 14.0, h:  8.0, cls: 'shop',       types: ['industry', 'shop'] },
 et_brewhouse:         { w: 14.0, d: 15.0, h:  8.6, cls: 'tavern',     types: ['industry', 'tavern'] },
 et_tea_house:         { w: 13.0, d: 13.5, h:  8.8, cls: 'tavern',     types: ['tavern'] },
 et_inn:               { w: 18.0, d: 19.0, h: 10.5, cls: 'tavern',     types: ['tavern'] },
 et_market_hall:       { w: 20.0, d: 20.0, h: 12.0, cls: 'civic',      types: ['shop', 'civic'] },
 et_healer:            { w: 15.0, d: 16.0, h:  9.2, cls: 'civic',      types: ['civic'] },
 et_mask_house:        { w: 12.0, d: 13.0, h:  8.4, cls: 'shop',       types: ['shop', 'civic'] },
 et_shrine_niche:      { w:  5.5, d:  5.5, h:  6.2, cls: 'art',        types: ['religious'] },
 et_ancestor_gallery:  { w: 22.0, d: 15.0, h: 13.0, cls: 'civic',      types: ['religious', 'civic'] },
 et_ministry:          { w: 26.0, d: 22.0, h: 16.5, cls: 'landmark',   types: ['civic'] },
 et_registry:          { w: 18.0, d: 16.0, h: 12.5, cls: 'civic',      types: ['civic'] },
 et_examination_hall:  { w: 22.0, d: 20.0, h: 13.0, cls: 'civic',      types: ['civic'] },
 et_historians_house:  { w: 18.0, d: 17.0, h: 12.0, cls: 'civic',      types: ['civic', 'religious'] },
 et_printer:           { w: 14.0, d: 15.0, h:  9.5, cls: 'landmark',   types: ['industry', 'civic'] },
 et_customs_house:     { w: 18.0, d: 16.0, h: 11.5, cls: 'civic',      types: ['civic'] },
 et_lighthouse:        { w: 12.0, d: 12.0, h: 26.0, cls: 'landmark',   types: ['infrastructure', 'civic'] },
 et_gate:              { w: 14.0, d: 10.0, h: 12.0, cls: 'civic',      types: ['defense'] },
 et_wall_tower:        { w:  9.5, d:  9.5, h: 14.0, cls: 'civic',      types: ['defense'] },
 et_barracks:          { w: 22.0, d: 18.0, h: 11.0, cls: 'civic',      types: ['defense', 'civic'] },
 et_warehouse:         { w: 18.0, d: 14.0, h:  9.5, cls: 'industrial', types: ['storage'] },
 et_smithy:            { w: 13.0, d: 13.0, h:  8.2, cls: 'industrial', types: ['industry'] },
 et_tannery:           { w: 14.0, d: 14.0, h:  7.0, cls: 'industrial', types: ['industry'] },
 et_kiln:              { w: 13.0, d: 13.0, h:  8.5, cls: 'industrial', types: ['industry'] },
 et_tile_works:        { w: 16.0, d: 15.0, h:  8.0, cls: 'industrial', types: ['industry'] },
 et_porcelain:         { w: 17.0, d: 16.0, h:  9.2, cls: 'industrial', types: ['industry'] },
 et_paper_mill:        { w: 15.0, d: 14.0, h:  8.0, cls: 'industrial', types: ['industry'] },
 et_kelp_kiln:         { w: 10.0, d:  9.0, h:  3.2, cls: 'industrial', types: ['industry'] },
 et_lime_kiln:         { w: 10.0, d: 10.0, h:  6.4, cls: 'industrial', types: ['industry'] },
 et_tube_station:      { w: 12.0, d: 12.0, h:  9.0, cls: 'industrial', types: ['infrastructure'] },
 et_mine:              { w: 14.0, d: 14.0, h:  7.5, cls: 'industrial', types: ['industry'] },
 et_quarry:            { w: 16.0, d: 15.0, h:  6.5, cls: 'industrial', types: ['industry'] },
 et_farmstead:         { w: 16.0, d: 15.0, h:  7.2, cls: 'poor',       types: ['agriculture', 'dwelling-single'] },
 et_terraces:          { w: 22.0, d: 18.0, h:  3.6, cls: 'poor',       types: ['agriculture'] },
 et_wrack_heap:        { w:  8.0, d:  7.0, h:  2.2, cls: 'poor',       types: ['agriculture'] },
 et_paddy:             { w: 20.0, d: 18.0, h:  1.8, cls: 'poor',       types: ['agriculture'] },
 et_tea_garden:        { w: 18.0, d: 16.0, h:  3.2, cls: 'poor',       types: ['agriculture'] },
 et_granary:           { w: 15.0, d: 13.0, h:  9.2, cls: 'industrial', types: ['storage', 'agriculture'] },
 et_goat_fold:         { w: 14.0, d: 13.0, h:  4.2, cls: 'poor',       types: ['agriculture'] },
 et_stock_pens:        { w: 14.0, d: 14.0, h:  4.5, cls: 'poor',       types: ['agriculture'] },
 et_mushroom_cellar:   { w: 12.0, d: 11.0, h:  4.8, cls: 'industrial', types: ['agriculture'] },
 et_quay:              { w: 28.0, d: 12.0, h:  4.5, cls: 'industrial', types: ['harbor'] },
 et_dock:              { w: 22.0, d: 16.0, h:  8.5, cls: 'industrial', types: ['harbor', 'industry'] },
 et_canal_landing:     { w: 14.0, d: 11.0, h:  4.0, cls: 'industrial', types: ['harbor'] },
 et_fish_landing:      { w: 14.0, d: 12.0, h:  4.5, cls: 'industrial', types: ['harbor'] },
 et_ferry_landing:     { w: 14.0, d: 11.0, h:  4.8, cls: 'industrial', types: ['industrial', 'harbor'] },
 bp_cliff_hoist:       { w: 14.0, d: 24.0, h: 88.0, cls: 'landmark',   types: ['infrastructure', 'harbor'], custom: true },
 bp_dike_boom:         { w: 110.0, d: 12.0, h: 16.0, cls: 'landmark',  types: ['defense', 'harbor'], custom: true }
};

const BP_DISTRICT_POOLS = {
 D1: ['et_court_house', 'et_merchant_house', 'et_registry', 'et_shophouse', 'et_tea_house', 'et_shrine_niche'],
 D2: ['et_official_villa', 'et_merchant_house', 'et_hex_villa', 'et_court_house', 'et_tea_house', 'et_inn', 'et_warehouse', 'et_customs_house', 'et_tube_station'],
 D3: ['et_smithy', 'et_kiln', 'et_tile_works', 'et_porcelain', 'et_paper_mill', 'et_kelp_kiln', 'et_lime_kiln', 'et_tannery', 'et_mine', 'et_quarry', 'et_warehouse', 'et_block_hut', 'et_canal_house'],
 D4: ['et_canal_house', 'et_canal_row', 'et_hex_house', 'et_corner_turret', 'et_shophouse', 'et_bakehouse', 'et_butcher', 'et_weaver', 'et_brewhouse', 'et_tea_house', 'et_inn', 'et_healer', 'et_mask_house', 'et_reed_house', 'et_block_hut', 'et_hex_hut'],
 D5: ['et_farmstead', 'et_terraces', 'et_paddy', 'et_tea_garden', 'et_granary', 'et_goat_fold', 'et_stock_pens', 'et_mushroom_cellar', 'et_wrack_heap', 'et_reed_house', 'et_block_hut'],
 D6: ['et_quay', 'et_dock', 'et_fish_landing', 'et_canal_landing', 'et_ferry_landing', 'et_customs_house', 'et_warehouse', 'et_shrine_niche'],
 D7: ['et_warehouse', 'et_mushroom_cellar', 'et_barracks', 'et_canal_landing']
};

const BP_TUNE = {
 exact: true,
 stance: 'door',
 stanceOpt: { maxDrop: 6.5, cut: 4.5 },
 roadW: { avenue: 11.0, main: 8.5, side: 6.0, alley: 4.2 },
 population: 5000,
 households: 1020,
 dimsOf: function(key, v){
  const D = BP_KIT_DIMS[key];
  if (!D) return null;
  return { key: key, v: v == null ? 0 : (v | 0), w: D.w, d: D.d, h: D.h, cls: D.cls, types: D.types, custom: !!D.custom };
 }
};

if (typeof module !== 'undefined' && module.exports) {
 module.exports = { BP_KIT_DIMS: BP_KIT_DIMS, BP_DISTRICT_POOLS: BP_DISTRICT_POOLS, BP_TUNE: BP_TUNE };
}
