/* ======================================================================
   Post-Apoc furniture: common and court tiers of high-value salvaged
   Ancients goods (the poor tier is the 'scrap' set). Alloy and steel on
   strut legs, synthetic cloth, white ceramic and concrete, salvaged bulbs
   and glass, riveted bands; the court in gilt-trimmed alloy, glass and
   Ancients light. Pack: generic.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('post-apoc', { name: 'Post-Apoc salvage', pack: 'generic', influences: 'high-value salvaged Ancients goods',
  materials: 'Ancients alloy, steel, glass, synthetic cloth, white ceramic, concrete, salvaged light; court: gilt, glass',
  palette: {
    alloyWhite: 0xe6e4dc, alloyGrey: 0xb4b0a2, steel: 0x5a5f62, steelLight: 0x6e7376, glassSky: 0x5a9ec9, glassBlack: 0x14161a, electric: 0x6fd0ff,
    clothSynthBlack: 0x1e2024, clothSynthRed: 0xb5432f, clothSynthBlue: 0x2a4a7a, clothSynthWhite: 0xe8e8e0, clothSynthTeal: 0x2a8a8a,
    plasticWhite: 0xd8d4c8, plasticBlack: 0x2a2a2a, ceramicWhite: 0xe8e6e0, timberSalvage: 0x8a6a4e, concrete: 0x9a9890,
    gilt: 0xc9a227, flame: 0xffb04a, ember: 0xd9762c, whiteHot: 0xfff2c9
  } });
/* END PALETTE */
const PA_COMMON = {
  wood: 'timberSalvage', woodDark: 'steel', woodLight: 'alloyGrey', woodFam: 'wood',
  cloth: ['clothSynthBlue', 'clothSynthRed', 'clothSynthWhite', 'clothSynthBlack'], clothFam: 'cloth',
  accent: 'alloyWhite', accentFam: 'metal', metal: 'steel', metalFam: 'metal',
  clay: 'ceramicWhite', clayFam: 'ceramic', stone: 'concrete', stoneFam: 'concrete', rope: 'plasticBlack',
  flame: 'flame', ember: 'ember', lampCol: 'whiteHot',
  legs: 'strut', motif: 'rivet', bedBase: 'plank', seat: 'cushion', finial: 'none',
  hearth: 'iron', fire: 'basket', lamp: 'bulb', rug: 'felt', screen: 'panel', store: 'crates',
  shelfFill: 'parts', rack: 'tools', art: 'panel', art2: 'plate', statue: 'globe', tapestry: 'grid',
  canopy: false, board: 'plastic'
};
const PA_COURT = Object.assign({}, PA_COMMON, {
  wood: 'plasticWhite', woodDark: 'steel', woodLight: 'alloyWhite', woodFam: 'plastic',
  cloth: ['clothSynthBlack', 'clothSynthTeal', 'clothSynthWhite', 'clothSynthRed'],
  accent: 'gilt', accentFam: 'gold', lamp: 'glass', lampCol: 'electric', motif: 'studs', finial: 'disc', statue: 'globe', screen: 'panel', rug: 'knotted', art: 'plate', art2: 'panel', canopy: true
});
FK.set({ culture: 'post-apoc', tier: 'common', S: PA_COMMON, names: {
  bed: 'Alloy-framed bed', bench: 'Strut bench', chair: 'Strut chair', stool: 'Strut stool', table: 'Alloy-topped table',
  low_table: 'Low alloy table', desk: 'Salvaged desk', chest: 'Alloy footlocker', bookcase: 'Parts shelving', wall_shelves: 'Ceramic shelves',
  store: 'Salvage crates', hearth: 'Iron stove', fire: 'Steel fire-basket', lamp: 'Salvaged bulb stand', candle: 'Candle dish',
  hanging: 'Salvaged pendant', rug: 'Felt rug', screen: 'Panel screen', counter: 'Alloy counter', workbench: 'Salvage workbench',
  loom: 'Loom', rack: 'Tool rack', ladder: 'Alloy ladder', board: 'Scratched plastic board', art: 'Ancients panel', bowl: 'White ceramic bowl',
  jug: 'White ceramic jug and cups', books: 'Salvaged manuals' } });
FK.set({ culture: 'post-apoc', tier: 'court', S: PA_COURT, names: {
  bed: 'Canopied alloy bed', throne: 'Salvage lord\'s chair', divan: 'Moulded divan', table: 'Gilt-edged alloy table', low_table: 'Gilt-edged low table',
  desk: 'Salvage lord\'s desk', cabinet: 'Gilt-inlaid cabinet', bookcase: 'Great archive shelving', hearth: 'Great iron stove', fire: 'Gilt fire-basket',
  lamp: 'Ancients glass lamp', candelabra: 'Gilt candelabra', hanging: 'Ancients glass pendant', carpet: 'Great synthetic carpet', screen: 'Gilt panel screen',
  tapestry: 'Grid hanging', art: 'Gilt plate', statue: 'Gilt globe', jug: 'Gilt ewer and cups', bowl: 'Gilt bowl' } });

FURN({
  key: 'post-apoc_court_cryo_berth', name: 'Cryo-berth bed', culture: 'post-apoc', tier: 'court', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'glass', 'cloth', 'emissive', 'plastic'],
  w: 1.2, d: 2.3, h: 1.3, variants: 1,
  build: function (F) {
    const alloy = F.col('alloyWhite');
    F.box(0, 0, 0, 1.2, 0.5, 2.3, 0, alloy, 'metal');
    F.box(0, 0.5, 0, 1.1, 0.12, 2.2, 0, F.col('clothSynthWhite'), 'cloth');
    F.blob(0, 0.68, -0.8, 0.3, 0.12, 0, F.col('clothSynthTeal'), 'cloth');
    F.box(0, 0, -1.1, 1.2, 1.3, 0.1, 0, F.shade(alloy, -0.1), 'metal');                  /* the head unit on the wall */
    F.box(0, 0.9, -1.04, 0.8, 0.25, 0.02, 0, F.col('electric'), 'glow');
    for (const s of [-1, 1]) F.box(s * 0.58, 0.5, 0.1, 0.04, 0.5, 2.0, 0, F.col('glassSky'), 'glass');   /* the raised lid, open */
    F.beam(-0.58, 1.0, 0.1, 0.58, 1.0, 0.1, 0.04, 0.04, F.col('plasticWhite'), 'plastic');
    F.box(0, 0.62, 0.3, 1.0, 0.03, 1.4, 0, F.col('clothSynthBlue'), 'cloth');
    F.lamp(0, 0.9, -0.9, 0.5, 4);
  }
});

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed post-apoc_trade_<role> */
FK.set({ culture: 'post-apoc', tier: 'common', roles: 'trade', prefix: 'post-apoc_trade_', S: PA_COMMON, names: {
  forge: 'Arc-forge', anvil: 'Alloy anvil', trough: 'Coolant trough', stall: 'Alloy stall', hayrack: 'Feed hopper', display: 'Salvage display', armour_stand: 'Ancients plate on a mannequin', weapon_rack: 'Locked weapon rack', vat: 'Process tank', still: 'Glass-coil still', bin: 'Sealed bins', larder: 'Cold cabinet', bunk: 'Crew bunk', locker: 'Alloy locker', lathe: 'Salvaged machine lathe', press: 'Hydraulic press', kiln: 'Ceramic furnace', grindstone: 'Belt grinder', barrel: 'Canister rack', altar: 'Salvage reliquary' } });
