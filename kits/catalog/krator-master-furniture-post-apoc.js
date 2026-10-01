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
    gilt: 0xc9a227, flame: 0xffb04a, ember: 0xd9762c, whiteHot: 0xfff2c9,
    /* harvested from kits/post-apoc, the pa_* pieces at the end of this file */
    paintBrick: 0x9a3a2c, hubcap: 0xdcd8cc, ironDark: 0x3a3430, batteryBlack: 0x2a2826, terminalRed: 0xc23a2a,
    terminalBlack: 0x1a1816, plankBase: 0x5c4630, dialGrey: 0xb0b0a8
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

/* ======== Harvested from kits/post-apoc (3 pieces) ======== */
/* The high-value salvaged pieces the Post-Apoc kit draws (keys pa_*); its salvage-junk furniture is in the
   'scrap' file. The kit's families map as iron -> metal, sheet -> metal (painted sheet here), plank -> plank,
   plain paint -> plastic, glow -> glow. */
FURN({
  key: 'pa_chief_throne', name: 'Big man\'s throne', culture: 'post-apoc', tier: 'court', type: 'chair', setting: 'indoor',
  rooms: ['court', 'hall', 'antechamber'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['metal'],
  source: 'kits/post-apoc/src/44-civic.js cvChief (the throne in the projecting throne bay)',
  w: 2.72, d: 1.34, h: 2.67, variants: 1,
  build: function (F) {
    /* a block seat and a tall back of red-painted sheet, a hubcap set flat through the back as a halo, iron spikes fanning behind */
    F.shift(0, 0.22);
    const red = F.col('paintBrick'), ir = F.col('ironDark');
    F.box(0, 0, 0, 1.3, 0.6, 0.9, 0, red, 'metal');
    F.box(0, 0.6, -0.4, 1.3, 1.9, 0.14, 0, red, 'metal');
    F.cyl(0, 1.9, -0.34, 0.55, 0.08, 0, F.col('hubcap'), 'metal');
    for (const sx of [-1, 1]) {
      F.rod(sx * 0.65, 0.6, -0.4, sx * 1.0, 2.6, -0.5, 0.07, ir, 'metal');
      F.rod(sx * 0.65, 1.3, -0.4, sx * 1.3, 2.2, -0.5, 0.06, ir, 'metal');
    }
  }
});
FURN({
  key: 'pa_battery_bank', name: 'Battery bank', culture: 'post-apoc', tier: 'common', type: 'stack', setting: 'indoor',
  rooms: ['workshop', 'store', 'study'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'plastic'],
  source: 'kits/post-apoc/src/48-industry.js inWind (the battery rack in the control shed)',
  w: 3.0, d: 0.9, h: 0.83, variants: 1,
  build: function (F) {
    /* two tiers of five salvaged batteries on a plank, red and black terminals (the kit sets the plank 0.3 m off the row) */
    F.box(0, 0, 0, 3.0, 0.08, 0.9, 0, F.col('plankBase'), 'plank');
    for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) { const x = -1.0 + k * 0.5, y = 0.08 + r * 0.36;
      F.box(x, y, 0, 0.42, 0.34, 0.7, 0, F.shade('batteryBlack', F.rr(-0.04, 0.04)), 'plastic');
      F.box(x - 0.1, y + 0.34, 0, 0.1, 0.05, 0.1, 0, F.col('terminalRed'), 'plastic');
      F.box(x + 0.1, y + 0.34, 0, 0.1, 0.05, 0.1, 0, F.col('terminalBlack'), 'plastic'); }
  }
});
FURN({
  key: 'pa_radio_sets', name: 'Salvaged radio sets', culture: 'post-apoc', tier: 'common', type: 'tool', setting: 'indoor',
  rooms: ['workshop', 'study', 'shop'], anchor: 'surface', clearance: {},
  materials: ['metal'],
  source: 'kits/post-apoc/src/46-shops.js shTinker (radios on the shelf)',
  w: 1.4, d: 0.4, h: 0.3, variants: 1,
  build: function (F) {
    for (let k = 0; k < 3; k++) { const x = -0.5 + k * 0.5;
      F.box(x, 0, 0, 0.4, 0.3, 0.3, 0, F.col('ironDark'), 'metal');
      F.rod(x - 0.06, 0.23, 0.15, x + 0.06, 0.23, 0.15, 0.05, F.col('dialGrey'), 'metal'); }
  }
});
