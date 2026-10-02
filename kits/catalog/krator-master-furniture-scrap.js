/* ======================================================================
   Generic scrap set: the POOR tier of the post-apocalyptic world. Rusted
   angle iron, cut drums and pipe, tarpaulin, rag and salvaged plastic,
   concrete block. The poor counterpart of 'post-apoc' (the high-value
   salvaged-Ancients set) and the fallback for Screamers, Republicans and
   anyone living in a kits/post-apoc building.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('scrap', { name: 'Scrap', pack: 'generic', influences: 'post-apocalyptic salvage, any culture',
  materials: 'rusted steel, pipe, drum, tarpaulin, rag, plastic, concrete block',
  palette: {
    rustRed: 0x7a3b22, rustBrown: 0x5e3a28, rustDark: 0x3e2a20, steelGrey: 0x6e7376, steelDull: 0x55595c,
    tarpBlue: 0x3a6a9a, tarpOrange: 0xc8642a, ragGrey: 0x8a8478, ragOlive: 0x6a6a4a, ragBlack: 0x2a2a2a,
    plasticBlue: 0x2f6fb0, plasticOrange: 0xe08a2a, plasticWhite: 0xd8d4c8, plasticGreen: 0x4a8a4a,
    concrete: 0x9a9890, concreteDark: 0x6a6860, wireCopper: 0xb5723a, timberGrey: 0x8a8070,
    ember: 0xd9762c, flame: 0xff8a3c, bulb: 0xfff2c9,
    /* harvested from kits/post-apoc (its PAL and builders' colours), the pa_* pieces at the end of this file */
    tyreBlack: 0x232120, tyreGrey: 0x3a3634, sackPad: 0x4a4034,
    cordOchre: 0xa8892a, cordOlive: 0x6a7a3a, cordOrange: 0x9a5a2a, cordWhite: 0xb8b0a0,
    woodOxblood: 0x5a2a24, woodPine: 0xa88a5e, woodTeak: 0x7a5236,
    plankWeathered: 0x9a7a52, plankBrown: 0x8a6a44, plankDark: 0x7a5c3c, plankPale: 0xb09468, plankTan: 0xa08258, plankGrey: 0x6a5a44,
    postBrown: 0x5c4630, timberDark: 0x6a5238, timberUmber: 0x4a3a2c, stumpBrown: 0x6a4a30, timberBlack: 0x3a2a1c,
    ironDark: 0x3a3430, ironBrown: 0x4a4038, ironUmber: 0x5a4a3c, ironTaupe: 0x6a5a4c, ironBlack: 0x2a2826,
    steelLight: 0x8a8a86, steelMid: 0x6a6a66, steelBlock: 0x4a4a46, steelBlade: 0xb8b8b0, galv: 0xb4b8b8, galvDull: 0xa8a49a,
    rustOrange: 0x8a4a2a, rustPipe: 0x8a5a3a, rustRebar: 0x6a3a26, rustPlate: 0x7a4a3a,
    drumRed: 0x8a3a2c, drumGrey: 0x5a5a56, paintBlue: 0x2f5f8f, paintOlive: 0x4d6f3c, paintOchre: 0x8a6a3a, paintGrey: 0x9a9a92,
    paintMustard: 0xc99a2e, paintTeal: 0x3b7f6e, paintRed: 0x7a2e28, paintOrange: 0xc45a30, paintCyan: 0x2f7f8e,
    paintCream: 0xe8dcc0, paintPlum: 0x8a3a6a, paintBrick: 0x9a3a2c, paintSea: 0x3b6f7e, flagRed: 0xc9442a, flagGold: 0xd8a020,
    tarpGreen: 0x5a7a4a, tarpOchre: 0xb09a4a, buttBlue: 0x3a6a8a, buttGrey: 0x6a7a78,
    sackcloth: 0xb8a888, sackclothTan: 0xa89a7c, sackclothDark: 0x8a7a62, sackclothPale: 0xc6b898, charcoal: 0x2a2624,
    earthBrick: 0x8a4a3a, earthRammed: 0xb0a088, earthAsh: 0xa08a70, earthDark: 0x8a7a64,
    soilBrown: 0x4a3220, soilDark: 0x3e2a1c, soilFurrow: 0x4a301c,
    stoneField: 0x8a8478, stonePale: 0x9a9488, stoneLight: 0xb0a898,
    glowFire: 0xff9a3a, glowFlame: 0xffe28a, glowBulb: 0xffd890, glowCoal: 0xff7a2a, glowHot: 0xffb040, glowStrip: 0xf2c26a,
    waterSteel: 0x2a5a6a, waterTeal: 0x3a6a70, waterDark: 0x1a2a30, waterDeep: 0x1a3a4a, shaftBlack: 0x14100c,
    produceRed: 0xc23a2a, produceYellow: 0xd8a02a, produceGreen: 0x5a9a3a, produceOrange: 0xe07a2a, producePlum: 0x8a3a5a,
    produceLime: 0x7ab04a, produceTan: 0xe0b060, produceAmber: 0xc88a3a, breadCrust: 0xc8843a,
    fishSilver: 0xc8ccc8, fishGrey: 0xb8bcb4, fishTan: 0xd8b98a, fishTail: 0xc9843a, fishDry: 0xc8a878, fishPink: 0xd88a5a,
    fishDark: 0x8a8a7a, meatRed: 0x8a2f24, meatDark: 0x6a2a20,
    hubcap: 0xdcd8cc, brass: 0xb8902a, padlockBrass: 0xb8983a, capSilver: 0xc8ccd0, capGrey: 0xa8acb0, capBrass: 0xc9a03a,
    helmetCopper: 0xb87a4a, helmetTeal: 0x7a8a8a,
    straw: 0xb89a48, strawDark: 0xa8883e, hayGold: 0xd8b840, strawTarget: 0xc8a860,
    boneWhite: 0xe0d6c0, dollPale: 0xe8d8c0, dollTan: 0xd8c0a8, dollDark: 0xc8b090, eyeBlack: 0x1a1614,
    ropeTan: 0x8a7a5a, ropeDark: 0x6a5a44, netBrown: 0x7a6a4a, clothRust: 0xa04a2a, clothBurlap: 0xd8c090, clothDenim: 0x4a5a6a,
    targetWhite: 0xd8d0c0, targetBlue: 0x2a5a8a, targetGold: 0xe0b830,
    bottleGreen: 0x3f9a52, bottleAmber: 0xc98a2a, bottleBlue: 0x2f62b8, bottleClear: 0xd5ecea,
    wireBrass: 0xc98a3a, wireBlue: 0x3a5a8a, potCopper: 0xb8683a, potBlue: 0x4a6a8a,
    lidGrey: 0x5a6a68, lidOchre: 0x9a8a4a, rockerBrown: 0x8a5a30, rockerBlue: 0x3f7fc0
  } });
/* END PALETTE */
const SCRAP_STYLE = {
  wood: 'steelDull', woodDark: 'rustBrown', woodLight: 'steelGrey', woodFam: 'rust',
  cloth: ['tarpBlue', 'ragGrey', 'ragOlive', 'tarpOrange'], clothFam: 'cloth',
  accent: 'plasticOrange', accentFam: 'plastic', metal: 'rustRed', metalFam: 'rust',
  clay: 'plasticWhite', clayFam: 'plastic', stone: 'concrete', stoneFam: 'concrete', rope: 'wireCopper',
  flame: 'flame', ember: 'ember',
  legs: 'strut', motif: 'rivet', bedBase: 'plank', seat: 'cushion', finial: 'none',
  hearth: 'drum', fire: 'drum', lamp: 'bulb', lampCol: 'bulb', rug: 'rag', store: 'crates', rack: 'tools', board: 'plastic'
};
FK.set({ culture: 'scrap', tier: 'poor', S: SCRAP_STYLE, names: {
  bed: 'Strut-frame bunk', bench: 'Angle-iron bench', stool: 'Welded stool', table: 'Strut table', chest: 'Footlocker',
  wall_shelves: 'Rack shelving', store: 'Salvage crates', hearth: 'Drum stove', fire: 'Cut-drum fire',
  lamp: 'Salvaged bulb on a stand', mat: 'Rag mat', counter: 'Sheet-metal counter', workbench: 'Scrap workbench',
  rack: 'Tool rack', ladder: 'Pipe ladder', board: 'Scratched plastic board', bowl: 'Plastic bowl', jug: 'Jerrycan and cups' },
  override: {
    jug: { name: 'Jerrycan and cups', w: 0.42, d: 0.26, h: 0.34, materials: ['plastic', 'rustSteel'], build: function (F, S, o) {
      F.box(-0.08, 0, 0, 0.18, 0.28, 0.14, 0, F.col('plasticGreen'), 'plastic');
      F.box(-0.08, 0.28, 0.02, 0.06, 0.05, 0.06, 0, F.col('plasticOrange'), 'plastic');
      F.box(-0.08, 0.26, -0.05, 0.14, 0.03, 0.02, 0, F.shade('plasticGreen', -0.2), 'plastic');
      for (const [x, z] of [[0.1, 0.05], [0.16, -0.07]]) F.frustum(x, 0, z, 0.03, 0.038, 0.08, 0, F.col('steelGrey'), 'rust', 10);
    } }
  } });

FURN({
  key: 'scrap_poor_car_seat', name: 'Salvaged vehicle seat', culture: 'scrap', tier: 'poor', type: 'seating', setting: 'both',
  rooms: ['hall', 'tavern', 'bedroom', 'yard', 'antechamber'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['cloth', 'rustSteel', 'plastic'],
  w: 0.62, d: 0.62, h: 0.95, variants: 2, variantNames: ['single', 'bench seat'],
  variantDims: [{ w: 0.62, d: 0.62, h: 0.95 }, { w: 1.3, d: 0.62, h: 0.95 }],
  build: function (F) {
    const W = F.variant ? 1.3 : 0.62, c = F.pick(['tarpBlue', 'ragGrey', 'ragOlive', 'ragBlack']);
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.08), 0, 0, 0.1, 0.12, 0.5, 0, F.col('rustBrown'), 'rust');
    F.box(0, 0.12, 0.04, W - 0.04, 0.16, 0.54, 0, c, 'cloth');
    F.box(0, 0.28, 0.04, W - 0.04, 0.08, 0.54, 0, F.shade(c, 0.08), 'cloth');
    F.box(0, 0.12, -0.26, W - 0.04, 0.7, 0.1, 0, F.shade(c, -0.08), 'cloth');
    F.box(0, 0.82, -0.26, W - 0.04, 0.1, 0.1, 0, F.shade(c, -0.15), 'cloth');
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.02), 0.3, -0.1, 0.03, 0.4, 0.4, 0, F.col('plasticWhite'), 'plastic');
    F.box(0, 0.86, -0.27, Math.min(0.26, W * 0.4), 0.09, 0.08, 0, F.shade(c, -0.25), 'cloth');
  }
});
FURN({
  key: 'scrap_poor_tyre_table', name: 'Tyre and cable-drum table', culture: 'scrap', tier: 'poor', type: 'table', setting: 'both',
  rooms: ['hall', 'tavern', 'yard', 'kitchen'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['rustSteel', 'plastic', 'timber'],
  w: 0.9, d: 0.9, h: 0.72, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.3, 0.2, 0, F.col('ragBlack'), 'plastic');
    F.cyl(0, 0.2, 0, 0.3, 0.2, 0, F.shade('ragBlack', -0.1), 'plastic');
    F.cyl(0, 0.4, 0, 0.13, 0.26, 0, F.col('timberGrey'), 'wood');
    F.cyl(0, 0.66, 0, 0.45, 0.06, 0, F.col('timberGrey'), 'wood');
    for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.box(Math.cos(a) * 0.3, 0.72, Math.sin(a) * 0.3, 0.04, 0.004, 0.14, -a, F.shade('timberGrey', -0.3), 'wood'); }
    F.cyl(0, 0.72, 0, 0.1, 0.004, 0, F.col('rustRed'), 'rust');
  }
});

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed scrap_trade_<role> */
FK.set({ culture: 'scrap', tier: 'poor', roles: 'trade', prefix: 'scrap_trade_', S: SCRAP_STYLE, names: {
  forge: 'Drum-and-brick forge', anvil: 'Rail-iron anvil', trough: 'Cut-tank trough', stall: 'Pallet stall', hayrack: 'Mesh hay rack', display: 'Crate display', armour_stand: 'Scrap-plate armour on a pipe', weapon_rack: 'Pipe weapon rack', vat: 'Drum vat', still: 'Jerrycan still', bin: 'Drum bins', larder: 'Fridge-shell larder', bunk: 'Strut bunk', locker: 'Steel locker', lathe: 'Salvaged lathe', press: 'Jack press', kiln: 'Brick-and-drum kiln', grindstone: 'Pedal grinder', barrel: 'Drum rack', altar: 'Scrap shrine' } });

/* ======== Harvested from kits/post-apoc (61 pieces) ======== */
/* Every piece of furniture the Post-Apoc kit draws: the helpers of kits/post-apoc/src/34-adds.js and the
   pieces its builders (40-58) draw inline. Keys pa_*. The high-value salvaged pieces (the big man's throne,
   the battery bank, the radio sets) are in krator-master-furniture-post-apoc.js.
   The kit's material families map as: plank / wood -> plank / wood, iron -> metal, sheet / corr -> rust,
   rubber -> plastic, earth -> plaster, conc -> stone or concrete, glow -> glow; its plain paint by what it
   paints (produce -> plant, fish and meat -> skin, straw -> thatch, cord and rope -> rope).
   THE TYRE: the kit's tire() is a torus; the catalog engine has none. PA_tyre() draws one as a ring of short
   rods (radius t) round the circle R - t: a round tube with a real hole, so it reads as a tyre from every
   side. plane 'h' lies flat (axis up), 'z' stands on edge facing +z, 'x' stands on edge facing +x. */
function PA_tyre(F, x, y, z, R, t, col, plane, n, rot, fam) {
  n = n || 10; rot = rot || 0; fam = fam || 'plastic';
  const rc = R - t, e = 0.05;
  for (let i = 0; i < n; i++) {
    const a = rot + i * F.TAU / n - e, b = rot + (i + 1) * F.TAU / n + e;
    const ca = Math.cos(a) * rc, sa = Math.sin(a) * rc, cb = Math.cos(b) * rc, sb = Math.sin(b) * rc;
    if (plane === 'z') F.rod(x + ca, y + sa, z, x + cb, y + sb, z, t, col, fam);
    else if (plane === 'x') F.rod(x, y + sa, z + ca, x, y + sb, z + cb, t, col, fam);
    else F.rod(x + ca, y, z + sa, x + cb, y, z + sb, t, col, fam);
  }
}
/* tireWeave(): the cord lattice across a tyre's hole, flat ('h') or upright ('v'). The kit's flat lattice
   sets its cross cords half a chord behind the tyre (a box is base-anchored in y only); here they are centred. */
function PA_weave(F, cx, cy, cz, r, col, n, plane) {
  n = n || 5;
  for (let i = -n + 1; i < n; i++) {
    const off = i * r / n, h = Math.sqrt(Math.max(0, r * r - off * off));
    if (h < 0.03) continue;
    if (plane === 'v') {
      F.box(cx, cy + off - 0.008, cz, 2 * h, 0.018, 0.018, 0, col, 'rope');
      F.box(cx + off - 0.008, cy - h, cz, 0.018, 2 * h, 0.018, 0, col, 'rope');
    } else {
      F.box(cx, cy, cz + off - 0.008, 2 * h, 0.018, 0.018, 0, col, 'rope');
      F.box(cx + off - 0.008, cy, cz, 0.018, 0.018, 2 * h, 0, col, 'rope');
    }
  }
}
/* barrel(): a 0.58 m oil drum 0.88 tall, two rolling hoops, a lid (or, open, a dark rim) */
function PA_drum(F, x, y, z, c, open) {
  F.cyl(x, y, z, 0.29, 0.88, 0, c, 'rust');
  for (const f of [0.18, 0.7]) F.cyl(x, y + f, z, 0.31, 0.05, 0, F.col('ironDark'), 'metal');
  if (!open) F.cyl(x, y + 0.88, z, 0.27, 0.02, 0, F.col('ironBrown'), 'metal');
  else F.cyl(x, y + 0.85, z, 0.26, 0.04, 0, F.col('tyreBlack'), 'plastic');
}
const PA_DRUM_COLS = ['drumRed', 'paintBlue', 'paintOlive', 'paintOchre', 'paintGrey', 'paintMustard', 'drumGrey'];
const PA_WOOD = ['plankWeathered', 'plankBrown', 'woodPine', 'plankDark', 'plankPale'];
/* crate(): a plank cube with a dark band round it */
function PA_crate(F, x, y, z, s, ry, c) {
  F.box(x, y, z, s, s, s, ry, c, 'plank');
  F.box(x, y + s * 0.42, z, s * 1.02, 0.05, s * 1.02, ry, F.col('timberUmber'), 'plank');
}
/* shGoods(): a heap of produce on a tray, w x d */
function PA_goods(F, x, y, z, w, d, keys) {
  const n = Math.round(w * d * 10);
  for (let k = 0; k < n; k++) {
    const px = x + F.rr(-w / 2 + 0.08, w / 2 - 0.08), pz = z + F.rr(-d / 2 + 0.08, d / 2 - 0.08), h = (1 - Math.abs(px - x) / (w / 2)) * 0.08;
    F.ball(px, y + 0.1 + h + F.rr(0, 0.04), pz, F.rr(0.09, 0.14), F.pick(keys), 'plant');
  }
}
/* fire(): seven logs laid in a star, a ring of eight stones, two flame cones; a light */
function PA_fire(F, x, y, z, r) {
  for (let k = 0; k < 7; k++) { const a = k / 7 * F.TAU; F.box(x + Math.cos(a) * r * 0.5, y + 0.05, z + Math.sin(a) * r * 0.5, 0.07, 0.07, r * 0.9, a, F.col('timberBlack'), 'wood'); }
  for (let k = 0; k < 8; k++) { const a = k / 8 * F.TAU; F.box(x + Math.cos(a) * r * 1.05, y, z + Math.sin(a) * r * 1.05, 0.16, 0.14, 0.16, a, F.shade('stoneField', F.rr(-0.06, 0.06)), 'stone'); }
  F.cone(x, y + 0.06, z, r * 0.42, r * 1.1, 0, F.col('glowFire'), 'glow');
  F.cone(x, y + 0.06, z, r * 0.22, r * 1.5, 0, F.col('glowFlame'), 'glow');
  F.lamp(x, y + r, z, 1.2, 6);
}
/* stovepipe(): a pipe, a collar and a coolie-hat cap */
function PA_flue(F, x, y, z, h, r) {
  const c = F.pick(['ironBrown', 'ironUmber', 'ironTaupe']);
  F.cyl(x, y, z, r, h, 0, c, 'metal'); F.cyl(x, y + h, z, r * 1.5, 0.06, 0, c, 'metal');
  F.cone(x, y + h + 0.06, z, r * 2.2, 0.16, 0, F.col('ironDark'), 'metal');
}
/* tireRing(): courses of flat tyres round a circle of radius R on a rammed-earth core (wells, planters) */
function PA_tyreRing(F, R, courses) {
  const d = 0.7056, n = Math.max(3, Math.round(F.TAU * R / d)), step = F.TAU / n;
  F.cyl(0, 0, 0, R + 0.24, courses * 0.22, 0, F.col('earthRammed'), 'plaster');
  for (let c = 0; c < courses; c++) {
    const half = (c % 2) ? 0.5 : 0;
    for (let k = 0; k < n; k++) { const a = (k + half) * step; PA_tyre(F, Math.cos(a) * R, c * 0.22 + 0.12, Math.sin(a) * R, 0.36, 0.12, F.col('tyreBlack'), 'h', 8, F.rr(0, F.TAU)); }
  }
}

FURN({
  key: 'pa_tyre_stool', name: 'Tyre stool', culture: 'scrap', tier: 'poor', type: 'chair', setting: 'both',
  rooms: ['hall', 'tavern', 'yard', 'living', 'kitchen', 'workshop', 'street', 'plaza'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['plastic', 'cloth', 'rope'],
  source: 'kits/post-apoc/src/34-adds.js tireStool (the arena draws it low-poly: 56-arena.js arStool)',
  w: 0.72, d: 0.72, h: 0.48, variants: 2, variantNames: ['two tyres', 'three tyres'],
  variantDims: [{ w: 0.72, d: 0.72, h: 0.48 }, { w: 0.72, d: 0.72, h: 0.71 }],
  build: function (F) {
    /* tyres stacked, a sack-cloth pad in the hole, a cord lattice across the top */
    const n = F.variant ? 3 : 2, cord = F.pick(['cordOchre', 'cordOlive', 'cordOrange', 'cordWhite']);
    for (let k = 0; k < n; k++) PA_tyre(F, 0, 0.12 + k * 0.235, 0, 0.36, 0.12, F.col('tyreBlack'), 'h', 10, F.rr(0, F.TAU));
    F.cyl(0, 0.02, 0, 0.228, n * 0.235 - 0.1, 0, F.col('sackPad'), 'cloth');
    PA_weave(F, 0, n * 0.235 - 0.01, 0, 0.24, cord, 5, 'h');
  }
});
FURN({
  key: 'pa_tyre_chair', name: 'Tyre armchair', culture: 'scrap', tier: 'poor', type: 'chair', setting: 'both',
  rooms: ['hall', 'tavern', 'yard', 'living', 'court', 'plaza'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['plastic', 'cloth', 'rope', 'timber'],
  source: 'kits/post-apoc/src/34-adds.js tireChair (low-poly in the arena stands and loge: 56-arena.js arChair)',
  w: 1.12, d: 0.96, h: 1.53, variants: 1,
  build: function (F) {
    /* the tyre stool; a tyre on edge behind it with a cord net, held by two posts to the ground; sloping arm rails on front posts */
    const wc = F.pick(['woodOxblood', 'woodPine', 'woodTeak']), cord = F.pick(['cordOchre', 'cordOlive', 'cordOrange', 'cordWhite']), sy = 0.47, bz = -0.36, by = sy + 0.42;
    for (let k = 0; k < 2; k++) PA_tyre(F, 0, 0.12 + k * 0.235, 0, 0.36, 0.12, F.col('tyreBlack'), 'h', 10, F.rr(0, F.TAU));
    F.cyl(0, 0.02, 0, 0.228, 0.37, 0, F.col('sackPad'), 'cloth');
    PA_weave(F, 0, 0.46, 0, 0.24, cord, 5, 'h');
    PA_tyre(F, 0, by, bz, 0.403, 0.12, F.col('tyreBlack'), 'z', 12);
    PA_weave(F, 0, by, bz, 0.277, cord, 5, 'v');
    for (const sx of [-1, 1]) {
      F.rod(sx * 0.46, 0, bz - 0.02, sx * 0.46, by + 0.62, bz - 0.02, 0.06, wc, 'wood');
      F.rod(sx * 0.46, sy + 0.04, bz, sx * 0.5, sy + 0.3, 0.42, 0.055, wc, 'wood');
      F.rod(sx * 0.5, 0, 0.4, sx * 0.5, sy + 0.3, 0.4, 0.055, wc, 'wood');
    }
    F.rod(-0.46, by + 0.6, bz - 0.02, 0.46, by + 0.6, bz - 0.02, 0.035, wc, 'wood');
    F.rod(-0.46, sy - 0.02, bz - 0.02, 0.46, sy - 0.02, bz - 0.02, 0.035, wc, 'wood');
  }
});
FURN({
  key: 'pa_tyre_table', name: 'Tyre table', culture: 'scrap', tier: 'poor', type: 'table', setting: 'both',
  rooms: ['hall', 'tavern', 'yard', 'living', 'court', 'plaza'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['plastic', 'timber'],
  source: 'kits/post-apoc/src/34-adds.js tireTable (arena: 56-arena.js arTable, two tyres high in the loge)',
  w: 1.03, d: 1.03, h: 0.54, variants: 2, variantNames: ['one tyre', 'two tyres'],
  variantDims: [{ w: 1.03, d: 1.03, h: 0.54 }, { w: 1.03, d: 1.03, h: 0.78 }],
  build: function (F) {
    /* a wide tyre (or two), four legs round it, a round plank top */
    const n = F.variant ? 2 : 1, R = 0.414, wc = F.shade('woodTeak', F.rr(-0.05, 0.05)), top = n * 0.24 + 0.25;
    for (let k = 0; k < n; k++) PA_tyre(F, 0, 0.13 + k * 0.24, 0, R, 0.132, F.col('tyreBlack'), 'h', 12, F.rr(0, F.TAU));
    for (const a of [0.6, 2.2, 3.8, 5.4]) F.rod(Math.cos(a) * (R + 0.02), 0, Math.sin(a) * (R + 0.02), Math.cos(a) * (R + 0.02), top, Math.sin(a) * (R + 0.02), 0.05, wc, 'wood');
    F.cyl(0, top, 0, R + 0.1, 0.05, 0, wc, 'wood');
  }
});
FURN({
  key: 'pa_tyre_stack', name: 'Tyre stack', culture: 'scrap', tier: 'poor', type: 'stack', setting: 'both',
  rooms: ['yard', 'workshop', 'store', 'street', 'smithy', 'dock'], anchor: 'floor', clearance: {},
  materials: ['plastic'],
  source: 'kits/post-apoc/src/34-adds.js tireStack',
  w: 0.78, d: 0.78, h: 0.48, variants: 3, variantNames: ['two', 'three', 'five'],
  variantDims: [{ w: 0.78, d: 0.78, h: 0.48 }, { w: 0.78, d: 0.78, h: 0.72 }, { w: 0.78, d: 0.78, h: 1.2 }],
  build: function (F) {
    const n = [2, 3, 5][F.variant];
    for (let k = 0; k < n; k++) PA_tyre(F, F.rr(-0.03, 0.03), 0.12 + k * 0.24, F.rr(-0.03, 0.03), 0.36, 0.12, F.shade('tyreBlack', F.rr(0, 0.06)), 'h', 10, F.rr(0, F.TAU));
  }
});
FURN({
  key: 'pa_drum', name: 'Oil drum', culture: 'scrap', tier: 'poor', type: 'storage', setting: 'both', role: 'barrel',
  rooms: ['store', 'yard', 'kitchen', 'workshop', 'shop', 'dock', 'smithy'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['rustSteel', 'metal', 'plastic'],
  source: 'kits/post-apoc/src/34-adds.js barrel',
  w: 0.62, d: 0.62, h: 0.9, variants: 2, variantNames: ['sealed', 'open'],
  build: function (F) {
    PA_drum(F, 0, 0, 0, F.shade(F.pick(PA_DRUM_COLS), F.rr(-0.06, 0.06)), F.variant === 1);
  }
});
FURN({
  key: 'pa_drum_store', name: 'Drums on a pallet', culture: 'scrap', tier: 'poor', type: 'stack', setting: 'both',
  rooms: ['store', 'yard', 'workshop', 'dock'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['rustSteel', 'metal', 'plastic', 'timber'],
  source: 'kits/post-apoc/src/48-industry.js inFuel (the drum store)',
  w: 2.8, d: 1.22, h: 1.9, variants: 1,
  build: function (F) {
    /* a pallet, eight drums in two rows, three more on top (the middle one open) */
    F.box(0, 0, 0, 2.8, 0.12, 1.2, 0, F.col('postBrown'), 'plank');
    for (let k = 0; k < 4; k++) for (const z of [-0.25, 0.3]) PA_drum(F, -1.0 + k * 0.62, 0.12, z, F.shade(F.pick(PA_DRUM_COLS), F.rr(-0.06, 0.06)), false);
    for (let k = 0; k < 3; k++) PA_drum(F, -0.7 + k * 0.62, 1.0, -0.1 + F.rr(-0.02, 0.02), F.shade(F.pick(PA_DRUM_COLS), F.rr(-0.06, 0.06)), k === 1);
  }
});
FURN({
  key: 'pa_crate', name: 'Plank crate', culture: 'scrap', tier: 'poor', type: 'storage', setting: 'both', role: 'crates',
  rooms: ['store', 'kitchen', 'shop', 'workshop', 'yard', 'dock', 'market'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber'],
  source: 'kits/post-apoc/src/34-adds.js crate',
  w: 0.62, d: 0.62, h: 0.6, variants: 3, variantNames: ['small', 'large', 'two stacked'],
  variantDims: [{ w: 0.62, d: 0.62, h: 0.6 }, { w: 0.82, d: 0.82, h: 0.8 }, { w: 0.82, d: 0.82, h: 1.4 }],
  build: function (F) {
    const c = F.shade(F.pick(PA_WOOD), F.rr(-0.05, 0.05));
    if (F.variant === 0) PA_crate(F, 0, 0, 0, 0.6, 0, c);
    else PA_crate(F, 0, 0, 0, 0.8, 0, c);
    if (F.variant === 2) PA_crate(F, 0, 0.8, 0, 0.6, 0.3, F.shade(F.pick(PA_WOOD), F.rr(-0.05, 0.05)));
  }
});
FURN({
  key: 'pa_produce_crate', name: 'Crate of produce', culture: 'scrap', tier: 'poor', type: 'storage', setting: 'both', role: 'crates',
  rooms: ['shop', 'market', 'kitchen', 'store'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'foliage'],
  source: 'kits/post-apoc/src/46-shops.js shCrateProduce',
  w: 0.72, d: 0.72, h: 0.94, variants: 2, variantNames: ['mixed fruit', 'greens'],
  variantDims: [{ w: 0.72, d: 0.72, h: 0.94 }, { w: 0.62, d: 0.62, h: 0.84 }],
  build: function (F) {
    /* the kit heaps the produce at 0.46 of the crate's height, inside the solid crate, where it never shows; here it crowns the crate */
    const s = F.variant ? 0.6 : 0.7;
    PA_crate(F, 0, 0, 0, s, 0, F.shade(F.pick(PA_WOOD), F.rr(-0.05, 0.05)));
    PA_goods(F, 0, s - 0.12, 0, s * 0.85, s * 0.85, F.variant ? ['produceGreen', 'produceLime'] : ['produceRed', 'produceYellow', 'produceGreen', 'produceOrange', 'producePlum']);
  }
});
FURN({
  key: 'pa_sacks', name: 'Sacks', culture: 'scrap', tier: 'poor', type: 'storage', setting: 'both', role: 'sacks',
  rooms: ['store', 'kitchen', 'yard', 'shop', 'market', 'smithy', 'dock'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['cloth'],
  source: 'kits/post-apoc/src/34-adds.js sacks (and the smithy\'s charcoal sacks, 48-industry.js inSmithy)',
  w: 1.24, d: 0.54, h: 0.32, variants: 3, variantNames: ['three sacks', 'six sacks', 'charcoal sacks'],
  variantDims: [{ w: 1.24, d: 0.54, h: 0.32 }, { w: 1.24, d: 0.54, h: 0.64 }, { w: 1.38, d: 0.68, h: 0.68 }],
  build: function (F) {
    if (F.variant === 2) {
      for (let k = 0; k < 5; k++) F.blob(-0.45 + (k % 3) * 0.45, 0.2 + Math.floor(k / 3) * 0.3, (k % 2) * 0.1 - 0.05, 0.24, 0.36, 0, F.shade('charcoal', F.rr(-0.04, 0.04)), 'cloth');
      return;
    }
    const n = F.variant ? 6 : 3;
    for (let k = 0; k < n; k++) { const r = k < 3 ? k : k - 3, yy = k < 3 ? 0 : 0.32;
      F.blob(-0.4 + r * 0.4, yy + 0.16, F.rr(-0.05, 0.05), 0.22, 0.308, 0, F.shade(F.pick(['sackcloth', 'sackclothTan', 'sackclothDark', 'sackclothPale']), F.rr(-0.05, 0.05)), 'cloth'); }
  }
});
FURN({
  key: 'pa_pallet_load', name: 'Pallet load', culture: 'scrap', tier: 'poor', type: 'stack', setting: 'both',
  rooms: ['store', 'yard', 'dock', 'workshop'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'cloth'],
  source: 'kits/post-apoc/src/34-adds.js pallet (loads: 48-industry.js inWarehouse dock crates and tarped yard stacks)',
  w: 1.2, d: 0.9, h: 0.12, variants: 3, variantNames: ['bare pallet', 'crates on a pallet', 'tarped load'],
  variantDims: [{ w: 1.2, d: 0.9, h: 0.12 }, { w: 1.6, d: 1.2, h: 2.52 }, { w: 1.7, d: 1.36, h: 2.04 }],
  build: function (F) {
    if (F.variant === 0) { F.box(0, 0, 0, 1.2, 0.12, 0.9, 0, F.col('postBrown'), 'plank'); return; }
    if (F.variant === 1) {
      F.box(0, 0, 0, 1.6, 0.12, 1.2, 0, F.col('postBrown'), 'plank');
      for (let q = 0; q < 3; q++) PA_crate(F, 0, 0.12 + q * 0.8, 0, 0.8, F.rr(-0.08, 0.08), F.pick(['plankBrown', 'timberDark', 'plankTan']));
      return;
    }
    /* two plank-clad bales on a pallet, a tarp thrown over the top and down the front */
    F.box(0, 0, 0, 1.4, 0.12, 1.2, 0, F.col('postBrown'), 'plank');
    for (let q = 0; q < 2; q++) F.box(0, 0.12 + q * 0.95, 0, 1.3, 0.9, 1.1, F.rr(-0.04, 0.04), F.pick(['plankWeathered', 'postBrown', 'plankBrown']), 'plank');
    F.beam(0, 1.99, -0.55, 0, 1.49, 0.66, 1.7, 0.02, F.pick(['bottleBlue', 'paintCyan', 'bottleAmber']), 'cloth');
  }
});
FURN({
  key: 'pa_junk_pile', name: 'Junk pile', culture: 'scrap', tier: 'poor', type: 'debris', setting: 'both',
  rooms: ['yard', 'workshop', 'street', 'smithy', 'store'], anchor: 'floor', clearance: {},
  materials: ['rustSteel', 'metal', 'plastic', 'timber'],
  source: 'kits/post-apoc/src/34-adds.js junkPile',
  w: 2.0, d: 2.0, h: 1.05, variants: 2, variantNames: ['small', 'large'],
  variantDims: [{ w: 2.0, d: 2.0, h: 1.05 }, { w: 2.8, d: 2.8, h: 1.2 }],
  build: function (F) {
    /* sheets, rods, tyres, black boxes, open drums and planks, heaped higher toward the middle (the kit tilts the sheets and planks every way; here they lie flat) */
    const r = F.variant ? 1.4 : 1.0, n = F.variant ? 10 : 7;
    const at = (m) => { const a = F.rnd() * F.TAU, d = Math.sqrt(F.rnd()) * Math.max(0, r - m); return [Math.cos(a) * d, Math.sin(a) * d, (1 - d / r) * r * 0.35]; };
    for (let k = 0; k < n; k++) {
      const t = F.rnd();
      if (t < 0.3) { const [px, pz, py] = at(0.6); F.box(px, py, pz, F.rr(0.4, 0.8), F.rr(0.03, 0.06), F.rr(0.4, 0.8), F.rnd() * F.TAU, F.pick(['rustOrange', 'rustRed', 'galv', 'galvDull']), 'rust'); }
      else if (t < 0.5) { const [px, pz, py] = at(0.7);
        F.rod(px, py + 0.09, pz, px + F.rr(-0.6, 0.6), py + F.rr(0.2, 0.6), pz + F.rr(-0.6, 0.6), F.rr(0.04, 0.09), F.pick(['rustOrange', 'rustRed']), 'metal'); }
      else if (t < 0.65) { const [px, pz, py] = at(0.4); PA_tyre(F, px, py + 0.12, pz, 0.36, 0.12, F.col('tyreBlack'), 'h', 10, F.rr(0, F.TAU)); }
      else if (t < 0.8) { const [px, pz, py] = at(0.36); F.box(px, py, pz, F.rr(0.2, 0.5), F.rr(0.15, 0.4), F.rr(0.2, 0.5), F.rnd() * F.TAU, F.pick(['ironBlack', 'ragBlack']), 'metal'); }
      else if (t < 0.9) { const [px, pz] = at(0.35); PA_drum(F, px, 0, pz, F.pick(PA_DRUM_COLS), true); }
      else { const [px, pz, py] = at(0.55); F.box(px, py, pz, F.rr(0.6, 1.0), 0.05, F.rr(0.1, 0.2), F.rnd() * F.TAU, F.col('postBrown'), 'plank'); }
    }
  }
});
FURN({
  key: 'pa_bench', name: 'Plank bench', culture: 'scrap', tier: 'poor', type: 'bench', setting: 'both',
  rooms: ['hall', 'tavern', 'barracks', 'dormitory', 'kitchen', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'],
  source: 'kits/post-apoc/src/44-civic.js cvBench (longhouse, mess hall)',
  w: 2.0, d: 0.42, h: 0.5, variants: 2, variantNames: ['2 m', '3.6 m'],
  variantDims: [{ w: 2.0, d: 0.42, h: 0.5 }, { w: 3.6, d: 0.42, h: 0.5 }],
  build: function (F) {
    const len = F.variant ? 3.6 : 2.0;
    F.box(0, 0.42, 0, len, 0.08, 0.42, 0, F.shade('plankBrown', F.rr(-0.05, 0.05)), 'plank');
    for (const sx of [-1, 1]) F.box(sx * (len / 2 - 0.2), 0, 0, 0.1, 0.42, 0.36, 0, F.col('postBrown'), 'plank');
  }
});
FURN({
  key: 'pa_long_table', name: 'Long plank table', culture: 'scrap', tier: 'poor', type: 'table', setting: 'both',
  rooms: ['hall', 'tavern', 'kitchen', 'barracks', 'dormitory'], anchor: 'floor', clearance: { front: 0.7, back: 0.7 },
  materials: ['timber'],
  source: 'kits/post-apoc/src/44-civic.js cvTable (feast hall, head table, mess hall)',
  w: 3.0, d: 0.9, h: 0.89, variants: 2, variantNames: ['3 m', 'head table, 6.8 m'],
  variantDims: [{ w: 3.0, d: 0.9, h: 0.89 }, { w: 6.8, d: 0.9, h: 0.89 }],
  build: function (F) {
    /* the kit's legs start at the builder's y, so on the longhouse floor they stop short of it; here they reach the floor */
    const len = F.variant ? 6.8 : 3.0;
    F.box(0, 0.82, 0, len, 0.07, 0.9, 0, F.shade('plankWeathered', F.rr(-0.05, 0.05)), 'plank');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.beam(sx * (len / 2 - 0.2), 0, sz * 0.35, sx * (len / 2 - 0.2), 0.82, sz * 0.35, 0.09, 0.09, F.col('postBrown'), 'wood');
  }
});
FURN({
  key: 'pa_porch_bench', name: 'Box bench', culture: 'scrap', tier: 'poor', type: 'bench', setting: 'both',
  rooms: ['yard', 'street', 'shop', 'tavern', 'living'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'],
  source: 'kits/post-apoc/src/46-shops.js shGeneral (the porch bench)',
  w: 1.6, d: 0.54, h: 1.0, variants: 1,
  build: function (F) {
    F.shift(0, 0.065);
    F.box(0, 0, 0, 1.6, 0.5, 0.4, 0, F.shade('plankBrown', F.rr(-0.05, 0.05)), 'plank');
    F.beam(0, 0.5, -0.2, 0, 0.5 + 0.5 * Math.cos(0.2), -0.2 - 0.5 * Math.sin(0.2), 1.6, 0.06, F.shade('plankBrown', F.rr(-0.05, 0.05)), 'plank');
  }
});
FURN({
  key: 'pa_rocking_chair', name: 'Rocking chair', culture: 'scrap', tier: 'poor', type: 'chair', setting: 'both',
  rooms: ['living', 'yard', 'bedroom', 'hall'], anchor: 'floor', clearance: { front: 0.6, back: 0.3 },
  materials: ['timber', 'cloth'],
  source: 'kits/post-apoc/src/50-farm.js fmRocker',
  w: 0.62, d: 0.86, h: 1.1, variants: 1,
  build: function (F) {
    /* painted frame on two rockers, slat seat, a mustard back board, a cushion */
    const c = F.pick(['rockerBrown', 'rockerBlue', 'paintOrange']);
    for (const s of [-1, 1]) {
      F.beam(s * 0.28, 0.55, -0.3, s * 0.28, 0.55, 0.3, 0.04, 0.04, c, 'wood');
      F.beam(s * 0.28, 0.12, -0.4, s * 0.28, 0.05, 0, 0.04, 0.04, c, 'wood'); F.beam(s * 0.28, 0.05, 0, s * 0.28, 0.12, 0.4, 0.04, 0.04, c, 'wood');
      F.beam(s * 0.28, 0.12, -0.4, s * 0.28, 0.55, -0.3, 0.035, 0.035, c, 'wood'); F.beam(s * 0.28, 0.12, 0.4, s * 0.28, 0.55, 0.3, 0.035, 0.035, c, 'wood');
      F.beam(s * 0.28, 0.55, -0.3, s * 0.28, 1.0, -0.38, 0.04, 0.04, c, 'wood');
    }
    F.box(0, 0.5, 0, 0.6, 0.05, 0.6, 0, c, 'plank');
    F.beam(0, 0.7, -0.34, 0, 0.7 + 0.4 * Math.cos(0.15), -0.34 - 0.4 * Math.sin(0.15), 0.6, 0.04, F.col('paintMustard'), 'plank');
    F.box(0, 0.56, 0.05, 0.5, 0.06, 0.4, 0, F.col('clothRust'), 'cloth');
  }
});
FURN({
  key: 'pa_council_chair', name: 'Council chair', culture: 'scrap', tier: 'poor', type: 'chair', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal'],
  source: 'kits/post-apoc/src/44-civic.js cvLonghouse (the council hall\'s chair on its dais)',
  w: 1.2, d: 1.36, h: 2.24, variants: 1,
  build: function (F) {
    /* a plank block seat, a tall plank back, a brass hubcap set flat through the back near its top */
    F.shift(0, 0.18);
    const c = F.col('stumpBrown');
    F.box(0, 0, 0, 1.0, 0.55, 1.0, 0, c, 'plank');
    F.box(0, 0.54, -0.6, 1.2, 1.7, 0.2, 0, c, 'plank');
    F.cyl(0, 2.04, -0.46, 0.4, 0.06, 0, F.col('brass'), 'metal');
  }
});
FURN({
  key: 'pa_lamp_post', name: 'Lamp post', culture: 'scrap', tier: 'poor', type: 'lamp', setting: 'outdoor',
  rooms: ['street', 'plaza', 'yard', 'dock', 'market'], anchor: 'floor', clearance: {},
  materials: ['metal', 'emissive'],
  source: 'kits/post-apoc/src/34-adds.js lamp',
  w: 0.56, d: 0.32, h: 3.24, variants: 2, variantNames: ['3.2 m', '3.8 m'],
  variantDims: [{ w: 0.56, d: 0.32, h: 3.24 }, { w: 0.56, d: 0.32, h: 3.84 }],
  build: function (F) {
    /* a pipe pole, a short arm, a cone hood over a bare bulb */
    F.shift(-0.23, 0);
    const h = F.variant ? 3.8 : 3.2, c = F.col('ironBrown');
    F.rod(0, 0, 0, 0, h, 0, 0.05, c, 'metal');
    F.rod(0, h, 0, 0.35, h - 0.05, 0, 0.04, c, 'metal');
    F.cone(0.35, h - 0.3, 0, 0.16, 0.2, 0, F.col('ironUmber'), 'metal');
    F.ball(0.35, h - 0.34, 0, 0.09, F.col('glowBulb'), 'glow');
    F.lamp(0.35, h - 0.4, 0, 1.0, 10);
  }
});
FURN({
  key: 'pa_hanging_lamp', name: 'Hanging bulb', culture: 'scrap', tier: 'poor', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'tavern', 'dormitory', 'barracks', 'kitchen', 'shop', 'workshop', 'living'], anchor: 'ceiling', clearance: {},
  materials: ['metal', 'emissive'],
  source: 'kits/post-apoc/src/44-civic.js cvLonghouse lampH and cvMess (hall lamps)',
  w: 0.44, d: 0.44, h: 0.8, variants: 3, variantNames: ['short drop', 'longhouse drop', 'mess-hall drop'],
  variantDims: [{ w: 0.44, d: 0.44, h: 0.8 }, { w: 0.44, d: 0.44, h: 1.32 }, { w: 0.44, d: 0.44, h: 1.86 }],
  build: function (F) {
    /* a wire from the ceiling, a flat iron disc over a bare bulb; a small plate where the wire meets the ceiling */
    const h = [0.8, 1.32, 1.86][F.variant];
    F.rod(0, 0.37, 0, 0, h, 0, 0.012, F.col('ironBrown'), 'metal');
    F.cyl(0, h - 0.02, 0, 0.06, 0.02, 0, F.col('ironBrown'), 'metal');
    F.cyl(0, 0.32, 0, 0.22, 0.04, 0, F.col('ironDark'), 'metal');
    F.ball(0, 0.17, 0, 0.17, F.col('glowBulb'), 'glow');
    F.lamp(0, 0.1, 0, 0.8, 7);
  }
});
FURN({
  key: 'pa_camp_fire', name: 'Fire pit', culture: 'scrap', tier: 'poor', type: 'brazier', setting: 'both',
  rooms: ['yard', 'hall', 'plaza', 'street', 'court'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['timber', 'stone', 'emissive', 'plastic'],
  source: 'kits/post-apoc/src/34-adds.js fire (council hearth ring: 44-civic.js cvLonghouse; tyre seats: 54-compound.js cpGround)',
  w: 1.28, d: 1.28, h: 0.81, variants: 3, variantNames: ['camp fire', 'council hearth ring', 'fire pit with tyre seats'],
  variantDims: [{ w: 1.28, d: 1.28, h: 0.81 }, { w: 3.3, d: 3.3, h: 0.89 }, { w: 4.56, d: 4.56, h: 0.96 }],
  build: function (F) {
    if (F.variant === 0) { PA_fire(F, 0, 0, 0, 0.5); return; }
    if (F.variant === 1) {
      PA_fire(F, 0, 0, 0, 0.55);
      for (let k = 0; k < 11; k++) { const a = k / 11 * F.TAU; F.blob(Math.cos(a) * 1.4, 0.12, Math.sin(a) * 1.4, 0.24, 0.336, 0, F.pick(['stonePale', 'stoneLight', 'stoneField']), 'stone'); }
      return;
    }
    /* five seats of two tyres round the fire */
    PA_fire(F, 0, 0, 0, 0.6);
    for (let k = 0; k < 5; k++) { const a = k / 5 * F.TAU + 0.3;
      for (const y of [0.14, 0.32]) PA_tyre(F, Math.cos(a) * 1.9, y, Math.sin(a) * 1.9, 0.36, 0.119, F.col('tyreBlack'), 'h', 9, F.rr(0, F.TAU)); }
  }
});
FURN({
  key: 'pa_water_butt', name: 'Water butt on stilts', culture: 'scrap', tier: 'poor', type: 'vessel', setting: 'outdoor',
  rooms: ['yard', 'garden', 'kitchen', 'roost'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'rustSteel', 'metal'],
  source: 'kits/post-apoc/src/34-adds.js waterButt',
  w: 1.2, d: 1.2, h: 2.53, variants: 2, variantNames: ['tall stand', 'low stand'],
  variantDims: [{ w: 1.2, d: 1.2, h: 2.53 }, { w: 1.1, d: 1.1, h: 2.22 }],
  build: function (F) {
    /* four square legs, a painted tank, a lid and a cone cap */
    const y = F.variant ? 1.1 : 1.4, r = F.variant ? 0.55 : 0.6, h = 0.9, c = F.shade(F.pick(['buttBlue', 'earthBrick', 'buttGrey', 'paintOlive']), F.rr(-0.05, 0.05));
    for (let k = 0; k < 4; k++) { const a = k * F.TAU / 4 + F.TAU / 8; F.beam(Math.cos(a) * r * 0.8, 0, Math.sin(a) * r * 0.8, Math.cos(a) * r * 0.8, y, Math.sin(a) * r * 0.8, 0.09, 0.09, F.col('postBrown'), 'wood'); }
    F.cyl(0, y, 0, r, h, 0, c, 'rust');
    F.cyl(0, y + h, 0, r * 0.9, 0.05, 0, F.col('ironDark'), 'metal');
    F.cone(0, y + h + 0.05, 0, r * 0.95, r * 0.3, 0, F.col('ironBrown'), 'metal');
  }
});
FURN({
  key: 'pa_water_trough', name: 'Plank water trough', culture: 'scrap', tier: 'poor', type: 'vessel', setting: 'outdoor',
  rooms: ['yard', 'stable', 'garden'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'glass'],
  source: 'kits/post-apoc/src/50-farm.js fmTrough',
  w: 1.1, d: 0.4, h: 0.32, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.1, 0.3, 0.4, 0, F.col('postBrown'), 'plank');
    F.box(0, 0.3, 0, 1.0, 0.02, 0.3, 0, F.col('waterTeal'), 'glass');
  }
});
FURN({
  key: 'pa_bunk_stall', name: 'Bunk stall', culture: 'scrap', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['dormitory', 'barracks', 'hall'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'cloth'],
  source: 'kits/post-apoc/src/44-civic.js cvLonghouse (the sleeping hall\'s bunk stalls)',
  w: 4.5, d: 3.6, h: 2.4, variants: 2, variantNames: ['open', 'curtained'],
  build: function (F) {
    /* two plank decks on four posts, bedding and a pillow on each, a plank partition at one end, a hung curtain */
    F.shift(0.3, -0.8);
    const pc = F.col('postBrown');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.beam(sx * 1.9, 0, sz * 0.9, sx * 1.9, 2.0, sz * 0.9, 0.09, 0.09, pc, 'wood');
    for (const yy of [0.45, 1.45]) {
      F.box(0, yy, 0, 3.9, 0.1, 2.0, 0, F.col('plankBrown'), 'plank');
      F.box(-0.2, yy + 0.1, 0, 3.3, 0.14, 1.6, 0, F.pick(['flagRed', 'paintCyan', 'flagGold', 'paintOlive', 'paintPlum', 'paintCream']), 'cloth');
      F.box(1.4, yy + 0.1, 0, 0.6, 0.18, 0.9, 0, F.col('paintCream'), 'cloth');
    }
    F.box(-2.5, 0, 1.0, 0.1, 2.4, 3.2, 0, F.col('plankDark'), 'plank');
    if (F.variant) F.box(0, 0.6, 1.6, 3.2, 1.6, 0.02, 0, F.pick(['drumRed', 'tarpGreen', 'tarpOchre']), 'cloth');
  }
});
FURN({
  key: 'pa_plank_chest', name: 'Plank chest', culture: 'scrap', tier: 'poor', type: 'storage', setting: 'indoor', role: 'chest',
  rooms: ['bedroom', 'dormitory', 'hall', 'store', 'barracks'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'],
  source: 'kits/post-apoc/src/44-civic.js cvLonghouse (sleeping-hall chests; the feast hall\'s painted boxes)',
  w: 1.14, d: 0.64, h: 0.66, variants: 2, variantNames: ['plank chest', 'painted box'],
  variantDims: [{ w: 1.14, d: 0.64, h: 0.66 }, { w: 0.7, d: 0.7, h: 0.7 }],
  build: function (F) {
    if (F.variant) { F.box(0, 0, 0, 0.7, 0.7, 0.7, 0, F.pick(['paintRed', 'paintBlue']), 'plank'); return; }
    F.box(0, 0, 0, 1.1, 0.6, 0.6, 0, F.pick(['plankDark', 'stumpBrown']), 'plank');
    F.box(0, 0.6, 0, 1.14, 0.06, 0.64, 0, F.col('timberUmber'), 'plank');
  }
});
FURN({
  key: 'pa_shop_counter', name: 'Shop counter', culture: 'scrap', tier: 'poor', type: 'counter', setting: 'both',
  rooms: ['shop', 'market', 'tavern', 'kitchen'], anchor: 'floor', clearance: { front: 0.8, back: 0.7 },
  materials: ['timber', 'rustSteel', 'foliage', 'metal', 'plastic'],
  source: 'kits/post-apoc/src/46-shops.js shCounter (food shop, tinker\'s, armour shop: their wares on top)',
  w: 3.12, d: 0.82, h: 1.46, variants: 3, variantNames: ['grocer\'s, with produce', 'tinker\'s, with junk', 'armourer\'s, with plates'],
  variantDims: [{ w: 3.12, d: 0.82, h: 1.46 }, { w: 3.12, d: 0.72, h: 1.3 }, { w: 3.12, d: 0.72, h: 1.1 }],
  build: function (F) {
    /* a plank body, a wider top, a painted corrugated panel on the customer's side (+z); the kit draws it 4.6-5.6 m long across a container front */
    const v = F.variant, w = 3.0, d = v ? 0.6 : 0.7, h = [1.05, 0.95, 1.0][v];
    F.box(0, 0, 0, w, h - 0.06, d, 0, v === 1 ? F.col('drumGrey') : F.col('plankDark'), 'plank');
    F.box(0, h - 0.06, 0, w + 0.12, 0.07, d + 0.12, 0, F.col('plankWeathered'), 'plank');
    F.box(0, 0.05, d / 2 + 0.01, w - 0.1, h - 0.2, 0.03, 0, F.pick(['paintRed', 'paintBlue', 'paintTeal', 'paintOlive', 'paintMustard', 'paintOrange']), 'rust');
    if (v === 0) {
      PA_goods(F, -0.9, h, 0, 1.0, 0.55, ['produceRed', 'produceYellow', 'produceGreen', 'produceOrange', 'producePlum']);
      PA_goods(F, 0.2, h, 0, 0.8, 0.55, ['produceYellow', 'produceTan', 'produceAmber']);
      for (let k = 0; k < 4; k++) F.blob(0.75 + k * 0.13, h + 0.12, 0, 0.13, 0.18, 0, F.col('breadCrust'), 'plant');
      F.box(1.35, h + 0.06, 0.05, 0.3, 0.05, 0.3, 0, F.col('steelLight'), 'metal');
      F.cyl(1.35, h + 0.11, 0.05, 0.03, 0.3, 0, F.col('steelMid'), 'metal');
    } else if (v === 1) {
      for (let k = 0; k < 6; k++) F.box(-1.25 + k * 0.5, h, F.rr(-0.1, 0.1), F.rr(0.14, 0.3), F.rr(0.12, 0.34), F.rr(0.14, 0.3), F.rnd() * F.TAU, F.pick(['potCopper', 'bottleBlue', 'capBrass', 'steelMid', 'produceRed']), 'plastic');
    } else {
      for (let k = 0; k < 4; k++) F.box(-1.1 + k * 0.72, h, 0, 0.7, 0.04, 0.4, F.rr(-0.1, 0.1), F.pick(['steelLight', 'galvDull', 'rustPlate']), 'rust');
    }
  }
});
FURN({
  key: 'pa_servery', name: 'Mess-hall servery', culture: 'scrap', tier: 'poor', type: 'counter', setting: 'indoor',
  rooms: ['tavern', 'kitchen', 'hall'], anchor: 'floor', clearance: { front: 0.9, back: 0.7 },
  materials: ['timber', 'rustSteel', 'emissive'],
  source: 'kits/post-apoc/src/44-civic.js cvMess (the serving counter and its shelf of cans)',
  w: 3.2, d: 0.75, h: 2.24, variants: 1,
  build: function (F) {
    /* plank counter, a deeper top, a shelf of cans over it and a warm strip light. The kit hangs the shelf and the strip from
       the container's open front; here two posts on the counter carry them */
    F.box(0, 0, 0, 3.0, 0.9, 0.5, 0, F.col('plankBrown'), 'plank');
    F.box(0, 0.9, 0, 3.2, 0.08, 0.75, 0, F.col('postBrown'), 'plank');
    for (const sx of [-1.4, 1.4]) F.rod(sx, 0.98, 0.05, sx, 2.2, 0.05, 0.04, F.col('postBrown'), 'wood');
    F.box(0, 1.74, 0.05, 3.0, 0.06, 0.4, 0, F.col('timberDark'), 'plank');
    for (let k = 0; k < 3; k++) F.cyl(-1.0 + k * 1.0, 1.8, 0.05, 0.12, 0.28, 0, F.pick(['galvDull', 'paintOrange', 'rustOrange']), 'rust');
    F.box(0, 2.14, -0.1, 2.8, 0.1, 0.05, 0, F.col('glowStrip'), 'glow');
    F.lamp(0, 2.0, 0.2, 0.9, 6);
  }
});
FURN({
  key: 'pa_goods_shelf', name: 'Shelf of goods', culture: 'scrap', tier: 'poor', type: 'shelf', setting: 'indoor',
  rooms: ['shop', 'store', 'kitchen', 'workshop'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['timber', 'plastic'],
  source: 'kits/post-apoc/src/46-shops.js shShelf (food shop, tinker\'s)',
  w: 2.45, d: 0.36, h: 2.2, variants: 2, variantNames: ['grocer\'s, 2.4 m', 'tinker\'s, 3.6 m'],
  variantDims: [{ w: 2.45, d: 0.36, h: 2.2 }, { w: 3.65, d: 0.36, h: 2.15 }],
  build: function (F) {
    /* three boards on side boards, packets and tins of every colour; hung on the wall half a metre up, as in the kit */
    const v = F.variant, w = v ? 3.6 : 2.4, y = v ? 0.5 : 0.55, gap = 0.55;
    const cols = v ? ['rustPipe', 'paintTeal', 'capBrass', 'steelMid', 'produceRed', 'ironBlack'] : ['produceRed', 'bottleBlue', 'produceYellow', 'produceGreen', 'cordWhite', 'rockerBrown'];
    for (let l = 0; l < 3; l++) { const yy = y + l * gap;
      F.box(0, yy, 0, w, 0.05, 0.36, 0, F.col('timberDark'), 'plank');
      const n = Math.round(w / 0.22);
      for (let k = 0; k < n; k++) F.box(-w / 2 + (k + 0.5) * w / n, yy + 0.05, F.rr(-0.04, 0.04), F.rr(0.1, 0.2), F.rr(0.12, gap * 0.7), F.rr(0.14, 0.24), 0, F.pick(cols), 'plastic');
    }
    for (const sx of [-1, 1]) F.box(sx * w / 2, y, 0, 0.05, 3 * gap, 0.36, 0, F.col('postBrown'), 'plank');
  }
});
FURN({
  key: 'pa_goods_rail', name: 'Hanging rail of goods', culture: 'scrap', tier: 'poor', type: 'rack', setting: 'both',
  rooms: ['shop', 'market', 'kitchen', 'store', 'workshop'], anchor: 'ceiling', clearance: { front: 0.5 },
  materials: ['metal', 'rope', 'skin', 'glass', 'timber'],
  source: 'kits/post-apoc/src/46-shops.js shHang (fish and meat, tools and wire, pots and bottles)',
  w: 2.7, d: 0.36, h: 1.6, variants: 3, variantNames: ['fish and meat', 'tools and wire', 'pots and bottles'],
  variantDims: [{ w: 2.7, d: 0.36, h: 1.6 }, { w: 2.7, d: 0.14, h: 1.6 }, { w: 2.7, d: 0.38, h: 1.6 }],
  build: function (F) {
    /* an iron rail on two hangers from the ceiling, goods on strings */
    const y = 1.3, L = 2.6, v = F.variant;
    F.rod(-L / 2, y, 0, L / 2, y, 0, 0.05, F.col('ironBrown'), 'metal');
    for (const sx of [-1, 1]) F.rod(sx * (L / 2 - 0.05), y, 0, sx * (L / 2 - 0.05), 1.6, 0, 0.02, F.col('ironBrown'), 'metal');
    const n = 8;
    for (let k = 0; k < n; k++) {
      const x = -L / 2 + L * (k + 0.5) / n + F.rr(-0.05, 0.05), yy = y - F.rr(0.12, 0.32), kind = [['fish', 'meat'], ['tools', 'wire'], ['pots', 'bottles']][v][k < 5 ? 0 : 1];
      F.rod(x, y, 0, x, yy, 0, 0.012, F.col('ropeDark'), 'rope');
      if (kind === 'fish') { F.box(x, yy - 0.8, 0, 0.1, 0.8, 0.18, 0, F.pick(['fishSilver', 'fishGrey', 'fishTan']), 'skin');
        F.box(x, yy - 0.92, 0.07, 0.2, 0.14, 0.04, 0, F.col('fishTail'), 'skin'); F.box(x, yy - 0.3, 0, 0.11, 0.06, 0.2, 0, F.col('produceRed'), 'skin'); }
      else if (kind === 'meat') F.blob(x, yy - 0.3, 0, 0.17, 0.646, 0, F.pick(['meatRed', 'paintBrick', 'meatDark']), 'skin');
      else if (kind === 'tools') { const t = k % 3;
        if (t === 0) F.box(x, yy - 0.45, 0, 0.045, 0.45, 0.03, 0, F.col('steelLight'), 'metal');
        else if (t === 1) F.rod(x, yy - 0.25, -0.015, x, yy - 0.25, 0.015, 0.22, F.col('paintGrey'), 'metal');
        else { F.box(x, yy - 0.5, 0, 0.05, 0.5, 0.05, 0, F.col('stumpBrown'), 'wood'); F.box(x - 0.08, yy - 0.62, 0, 0.2, 0.13, 0.06, 0, F.col('steelMid'), 'metal'); } }
      else if (kind === 'wire') PA_tyre(F, x, yy - 0.22, 0, 0.24, 0.05, F.pick(['wireCopper', 'wireBrass', 'wireBlue']), 'z', 10, 0, 'metal');
      else if (kind === 'pots') F.frustum(x, yy - 0.3, 0, 0.14, 0.18, 0.28, 0, F.pick(['steelLight', 'potCopper', 'potBlue']), 'metal', 8);
      else { F.cyl(x, yy - 0.3, 0, 0.05, 0.26, 0, F.pick(['bottleGreen', 'bottleAmber', 'bottleBlue', 'bottleClear']), 'glass'); }
    }
  }
});
FURN({
  key: 'pa_market_table', name: 'Market table', culture: 'scrap', tier: 'poor', type: 'stall', setting: 'both',
  rooms: ['market', 'shop', 'street', 'plaza'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'foliage', 'rustSteel', 'metal', 'plastic'],
  source: 'kits/post-apoc/src/46-shops.js shFood (the side stall\'s table of produce and dried goods)',
  w: 3.7, d: 1.0, h: 1.87, variants: 1,
  build: function (F) {
    /* a plank box table, two heaps of produce, an open drum of dried goods on top (the kit stands three, overlapping) */
    F.box(0, 0, 0, 3.5, 0.9, 0.9, 0, F.col('plankBrown'), 'plank');
    F.box(0, 0.9, 0, 3.7, 0.06, 1.0, 0, F.col('plankTan'), 'plank');
    PA_goods(F, -1.0, 0.96, 0, 1.2, 0.8, ['produceRed', 'produceYellow', 'produceGreen', 'produceOrange', 'producePlum']);
    PA_goods(F, 0.3, 0.96, 0, 1.0, 0.8, ['produceGreen', 'produceLime', 'produceOrange']);
    PA_drum(F, 1.4, 0.96, 0, F.shade(F.pick(PA_DRUM_COLS), F.rr(-0.06, 0.06)), true);
  }
});
FURN({
  key: 'pa_lean_to_stall', name: 'Lean-to stall', culture: 'scrap', tier: 'poor', type: 'stall', setting: 'outdoor',
  rooms: ['market', 'street', 'plaza', 'dock'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'rustSteel', 'metal', 'skin'],
  source: 'kits/post-apoc/src/54-compound.js cpGround (toll stall); 56-arena.js arEntry and 58-dock.js dkLand (food and fish stalls)',
  w: 3.4, d: 2.5, h: 2.64, variants: 3, variantNames: ['toll booth', 'food stall', 'fish stall'],
  variantDims: [{ w: 3.4, d: 2.5, h: 2.64 }, { w: 4.4, d: 2.62, h: 2.94 }, { w: 4.4, d: 2.62, h: 2.94 }],
  build: function (F) {
    const roof = F.pick(['galv', 'paintTeal', 'drumRed', 'paintBlue']);
    if (F.variant === 0) {
      /* plank floor, four posts, a plank back screen and a counter shelf, a sheet roof falling to the front */
      F.shift(0, -0.05);
      F.box(0, 0, 0, 3.0, 0.1, 2.2, 0, F.col('plankGrey'), 'plank');
      for (const px of [-1.4, 1.4]) for (const pz of [-1.0, 1.0]) F.rod(px, 0, pz, px, 2.3, pz, 0.07, F.col('postBrown'), 'wood');
      F.beam(0, 2.6, -1.2, 0, 2.15, 1.3, 3.4, 0.07, roof, 'rust');
      F.box(0, 0.1, -1.0, 3.0, 0.9, 0.1, 0, F.col('paintOchre'), 'plank');
      F.box(0, 1.0, 0.9, 3.0, 0.08, 0.5, 0, F.col('plankGrey'), 'plank');
      return;
    }
    /* a plank back wall in the stall's colour, two front posts, a counter with its top, a sheet roof, stock behind */
    const c = F.pick(['drumRed', 'paintTeal', 'paintCyan', 'paintOrange']);
    F.box(0, 0, 0, 4.0, 0.1, 2.4, 0, F.col('plankGrey'), 'plank');
    F.box(0, 0.1, -1.1, 4.0, 2.4, 0.1, 0, c, 'plank');
    for (const px of [-1.9, 1.9]) F.rod(px, 0, 1.1, px, 2.5, 1.1, 0.07, F.col('postBrown'), 'wood');
    F.box(0, 0.1, 0.95, 4.0, 0.9, 0.1, 0, F.col('paintOchre'), 'plank');
    F.box(0, 1.0, 0.95, 4.2, 0.07, 0.5, 0, F.col('plankGrey'), 'plank');
    F.beam(0, 2.9, -1.3, 0, 2.5, 1.3, 4.4, 0.07, roof, 'rust');
    PA_drum(F, 1.4, 0.1, -0.5, F.pick(PA_DRUM_COLS), false);
    PA_crate(F, -1.3, 0.1, -0.5, 0.6, 0.2, F.pick(PA_WOOD));
    if (F.variant === 2) for (let k = 0; k < 3; k++) F.box(-0.9 + k * 0.9, 1.08, 0.9, 0.5, 0.06, 0.22, 0, F.pick(['fishGrey', 'fishPink']), 'skin');
  }
});
FURN({
  key: 'pa_armour_mannequin', name: 'Scrap armour on a post', culture: 'scrap', tier: 'poor', type: 'rack', setting: 'both',
  rooms: ['shop', 'smithy', 'barracks'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'plastic', 'metal', 'cloth'],
  source: 'kits/post-apoc/src/46-shops.js shMannequin',
  w: 1.08, d: 0.68, h: 2.38, variants: 2, variantNames: ['crested', 'with a belt of plates'],
  variantDims: [{ w: 1.08, d: 0.68, h: 2.38 }, { w: 1.08, d: 0.68, h: 2.2 }],
  build: function (F) {
    /* a post on a plank foot wearing a tyre-tread torso, hubcap shoulders and chest plate, rubber arms, a cape and a can helmet.
       The kit sets the cape, visor and crest off-centre by half their width; here they are centred */
    const c = F.pick(['capSilver', 'helmetCopper', 'capGrey', 'capBrass']), band = F.pick(['flagGold', 'produceRed', 'paintCyan']);
    F.box(0, 0, 0, 0.6, 0.12, 0.6, 0, F.col('timberDark'), 'plank');
    F.rod(0, 0.12, 0, 0, 1.05, 0, 0.09, F.col('postBrown'), 'wood');
    for (let k = 0; k < 4; k++) PA_tyre(F, 0, 1.0 + k * 0.16, 0, 0.33 - Math.abs(k - 1.5) * 0.02, 0.1, k === 1 ? band : F.col('tyreGrey'), 'h', 10, F.rr(0, F.TAU));
    F.rod(0, 1.55, 0, 0, 1.9, 0, 0.09, F.col('postBrown'), 'wood');
    for (const sx of [-1, 1]) {
      F.rod(sx * 0.385, 1.5, 0, sx * 0.455, 1.5, 0, 0.25, c, 'metal');
      F.beam(sx * 0.43, 0.8, 0, sx * 0.49, 1.5, 0, 0.09, 0.09, F.col('charcoal'), 'plastic');
    }
    F.rod(0, 1.3, 0.27, 0, 1.3, 0.33, 0.26, c, 'metal');
    F.box(0, 0.7, -0.24, 0.6, 1.0, 0.03, 0, F.pick(['produceRed', 'paintCyan', 'flagGold']), 'cloth');
    if (F.variant === 1) for (let k = 0; k < 3; k++) F.rod(0, 0.86 + k * 0.02, 0.185, 0, 0.86 + k * 0.02, 0.215, 0.32 - k * 0.02, F.col('steelLight'), 'metal');
    F.blob(0, 1.98, 0, 0.19, 0.4, 0, F.pick(['paintGrey', 'helmetCopper']), 'metal');
    F.box(0, 1.9, 0.16, 0.24, 0.04, 0.03, 0, F.col('ironBlack'), 'metal');
    if (F.variant === 0) F.box(0, 2.12, 0, 0.08, 0.26, 0.3, 0, F.pick(['produceRed', 'flagGold', 'paintCyan']), 'cloth');
  }
});
FURN({
  key: 'pa_vice_bench', name: 'Workbench with a vice', culture: 'scrap', tier: 'poor', type: 'workstation', setting: 'both',
  rooms: ['workshop', 'smithy', 'shop'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal', 'plastic'],
  source: 'kits/post-apoc/src/46-shops.js shArmor (the armourer\'s bench) and shTinker (the tinker\'s stall bench)',
  w: 2.5, d: 0.7, h: 1.36, variants: 2, variantNames: ['armourer\'s', 'tinker\'s'],
  variantDims: [{ w: 2.5, d: 0.7, h: 1.36 }, { w: 3.2, d: 1.04, h: 1.3 }],
  build: function (F) {
    if (F.variant === 0) {
      /* a plank body under an iron top, a vice at the left, plates laid out to work */
      F.box(0, 0, 0, 2.4, 0.95, 0.6, 0, F.col('plankDark'), 'plank');
      F.box(0, 0.95, 0, 2.5, 0.07, 0.7, 0, F.col('ironBrown'), 'metal');
      F.box(-0.8, 1.02, 0.1, 0.22, 0.3, 0.16, 0, F.col('ironDark'), 'metal');
      F.box(-0.8, 1.3, 0.1, 0.1, 0.06, 0.1, 0, F.col('steelLight'), 'metal');
      for (let k = 0; k < 4; k++) F.box(k * 0.2, 1.02, 0.08, 0.12, 0.06, 0.5, 0.3 * k, F.col('steelLight'), 'metal');
      return;
    }
    F.box(0, 0, 0, 3.0, 0.95, 0.9, 0, F.col('timberDark'), 'plank');
    F.box(0, 0.95, 0, 3.2, 0.06, 1.0, 0, F.col('plankBrown'), 'plank');
    F.box(0.9, 1.01, 0.25, 0.22, 0.24, 0.18, 0, F.col('ironDark'), 'metal');
    F.box(0.9, 1.24, 0.25, 0.3, 0.05, 0.14, 0, F.col('steelLight'), 'metal');
    F.cyl(0.9, 1.0, 0.48, 0.02, 0.3, 0, F.col('steelLight'), 'metal');
    for (let k = 0; k < 6; k++) F.box(-1.2 + k * 0.3, 1.01, -0.1, F.rr(0.12, 0.24), F.rr(0.1, 0.2), F.rr(0.12, 0.2), F.rnd() * F.TAU, F.pick(['steelLight', 'potCopper', 'capBrass']), 'plastic');
  }
});
FURN({
  key: 'pa_plate_rack', name: 'Rack of armour plates', culture: 'scrap', tier: 'poor', type: 'rack', setting: 'indoor',
  rooms: ['shop', 'smithy', 'barracks'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'rustSteel'],
  source: 'kits/post-apoc/src/46-shops.js shArmor (the plate racks)',
  w: 0.96, d: 0.06, h: 1.7, variants: 1,
  build: function (F) {
    /* two posts, five plates of sheet across them (the kit hangs the plates half a width off the posts) */
    for (const sx of [-1, 1]) F.box(sx * 0.45, 0, 0, 0.06, 1.7, 0.06, 0, F.col('postBrown'), 'wood');
    for (let q = 0; q < 5; q++) F.box(0, 0.3 + q * 0.28, 0, 0.72, 0.22, 0.03, 0, F.pick(['steelLight', 'galvDull', 'rustPlate', 'paintSea']), 'rust');
  }
});
FURN({
  key: 'pa_helmet_board', name: 'Pegboard of helmets', culture: 'scrap', tier: 'poor', type: 'rack', setting: 'indoor',
  rooms: ['shop', 'barracks', 'smithy'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal', 'cloth'],
  source: 'kits/post-apoc/src/46-shops.js shArmor (the helmet pegboard)',
  w: 5.4, d: 0.38, h: 2.4, variants: 2, variantNames: ['long, fourteen helmets', 'short, eight helmets'],
  variantDims: [{ w: 5.4, d: 0.38, h: 2.4 }, { w: 2.9, d: 0.38, h: 2.4 }],
  build: function (F) {
    /* a plank board on the wall from 0.9 m, two rows of pegs, cans, pots and bowls as helmets, a red plume on every other */
    const n = F.variant ? 4 : 7, w = F.variant ? 2.9 : 5.4;
    F.box(0, 0.9, -0.165, w, 1.5, 0.05, 0, F.col('timberDark'), 'plank');
    for (let r = 0; r < 2; r++) for (let k = 0; k < n; k++) {
      const x = -(n - 1) / 2 * 0.72 + k * 0.72;
      F.rod(x, 1.15 + r * 0.7, -0.14, x, 1.15 + r * 0.7, 0.07, 0.03, F.col('ironBlack'), 'metal');
      F.blob(x, 1.27 + r * 0.7, 0.035, 0.15, 0.285, 0, F.pick(['paintGrey', 'helmetCopper', 'capSilver', 'helmetTeal', 'earthBrick']), 'metal');
      if (k % 2 === 0) F.box(x, 1.32 + r * 0.7, 0.035, 0.06, 0.12, 0.2, 0, F.col('produceRed'), 'cloth');
    }
  }
});
FURN({
  key: 'pa_weapon_rack', name: 'Weapon rack', culture: 'scrap', tier: 'poor', type: 'weapon', setting: 'both',
  rooms: ['shop', 'barracks', 'smithy', 'yard'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['timber', 'metal'],
  source: 'kits/post-apoc/src/46-shops.js shWeapon (the racks along the fence: spears, blades and pipe clubs, hung blades)',
  w: 1.6, d: 0.3, h: 2.8, variants: 3, variantNames: ['spears', 'blades and pipe clubs', 'hung blades'],
  variantDims: [{ w: 1.6, d: 0.3, h: 2.8 }, { w: 2.7, d: 0.3, h: 1.65 }, { w: 2.56, d: 0.16, h: 1.5 }],
  build: function (F) {
    const v = F.variant, z0 = v === 2 ? -0.08 : -0.15;
    if (v === 0) {
      /* a rail on the wall, seven spears leaning back on it */
      F.box(0, 0.9, z0 + 0.04, 1.6, 0.06, 0.08, 0, F.col('postBrown'), 'wood');
      for (let k = 0; k < 7; k++) { const x = -0.66 + k * 0.22, hh = F.rr(2.1, 2.5);
        F.rod(x, 0, z0 + 0.18, x, hh, z0 + 0.04, 0.045, F.col('stumpBrown'), 'wood');
        F.cone(x, hh, z0 + 0.04, 0.05, 0.3, 0, F.col('steelBlade'), 'metal'); }
    } else if (v === 1) {
      /* blades standing on their grips, pipe clubs with knobbed heads leaning beside them */
      F.box(0, 0.9, z0 + 0.04, 2.6, 0.06, 0.08, 0, F.col('postBrown'), 'wood');
      for (let k = 0; k < 6; k++) { const x = -1.2 + k * 0.24;
        F.box(x, 0.55, z0 + 0.08, 0.09, 1.1, 0.025, F.rr(-0.06, 0.06), F.pick(['steelBlade', 'paintGrey']), 'metal');
        F.box(x, 0.4, z0 + 0.08, 0.05, 0.18, 0.05, 0, F.col('timberUmber'), 'wood'); }
      for (let k = 0; k < 5; k++) { const x = 0.15 + k * 0.25;
        F.rod(x, 0, z0 + 0.18, x + 0.1, 1.45, z0 + 0.1, 0.07, F.col('drumGrey'), 'metal');
        F.ball(x + 0.1, 1.5, z0 + 0.1, 0.1, F.col('steelBlock'), 'metal'); }
    } else {
      /* two posts and a rail, blades hung by their handles */
      for (const q of [-1.2, 1.2]) F.rod(q, 0, z0 + 0.08, q, 1.5, z0 + 0.08, 0.08, F.col('postBrown'), 'wood');
      F.box(0, 1.3, z0 + 0.08, 2.5, 0.06, 0.06, 0, F.col('postBrown'), 'wood');
      for (let k = 0; k < 7; k++) { const x = -0.9 + k * 0.3;
        F.rod(x, 1.28, z0 + 0.08, x + 0.02, 0.7, z0 + 0.08, 0.03, F.col('timberUmber'), 'wood');
        F.box(x, 0.15, z0 + 0.08, 0.04, 0.55, 0.02, 0, F.col('paintGrey'), 'metal'); }
    }
  }
});
FURN({
  key: 'pa_spear_drum', name: 'Drum of spears', culture: 'scrap', tier: 'poor', type: 'weapon', setting: 'both',
  rooms: ['shop', 'barracks', 'yard'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['rustSteel', 'metal', 'plastic', 'timber'],
  source: 'kits/post-apoc/src/46-shops.js shWeapon (barrel with shSpear)',
  w: 0.68, d: 0.68, h: 2.2, variants: 1,
  build: function (F) {
    PA_drum(F, 0, 0, 0, F.col('drumGrey'), true);
    for (let k = 0; k < 4; k++) { const x = F.rr(-0.1, 0.1), z = F.rr(-0.1, 0.1), ry = k * 1.5, hh = F.rr(1.5, 1.9), tx = Math.sin(ry) * 0.18, tz = Math.cos(ry) * 0.18;
      F.rod(x, 0, z, x + tx, hh, z + tz, 0.045, F.col('stumpBrown'), 'wood');
      F.cone(x + tx, hh, z + tz, 0.05, 0.3, 0, F.col('steelBlade'), 'metal'); }
  }
});
FURN({
  key: 'pa_archery_target', name: 'Archery target', culture: 'scrap', tier: 'poor', type: 'weapon', setting: 'outdoor',
  rooms: ['yard', 'barracks'], anchor: 'floor', clearance: { front: 3.0 },
  materials: ['timber', 'thatch', 'cloth'],
  source: 'kits/post-apoc/src/46-shops.js shWeapon (the archery target)',
  w: 1.7, d: 1.2, h: 2.4, variants: 1,
  build: function (F) {
    /* a straw disc on an A-frame, painted rings, four arrows in it */
    F.shift(0, 0.075);
    for (const q of [-1, 1]) F.rod(q * 0.7, 0, -0.6, q * 0.15, 1.6, -0.2, 0.07, F.col('postBrown'), 'wood');
    F.rod(0, 1.55, -0.08, 0, 1.55, 0.04, 0.85, F.col('strawTarget'), 'thatch');
    F.box(0, 1.0, -0.16, 0.12, 1.2, 0.05, 0, F.col('postBrown'), 'wood');
    [['targetWhite', 0.7], ['targetBlue', 0.5], ['produceRed', 0.32], ['targetGold', 0.14]].forEach(([k, r], i) => F.rod(0, 1.55, 0.04 + i * 0.012, 0, 1.55, 0.06 + i * 0.012, r, F.col(k), 'cloth'));
    for (let k = 0; k < 4; k++) { const a = k * 1.5 + 0.4, r = F.rr(0.1, 0.5);
      F.rod(Math.cos(a) * r, 1.55 + Math.sin(a) * r, 0.5, Math.cos(a) * r, 1.55 + Math.sin(a) * r, 0.1, 0.02, F.col('boneWhite'), 'wood'); }
  }
});
FURN({
  key: 'pa_hay_bales', name: 'Hay bales', culture: 'scrap', tier: 'poor', type: 'stack', setting: 'both',
  rooms: ['stable', 'yard', 'store', 'barracks'], anchor: 'floor', clearance: {},
  materials: ['thatch'],
  source: 'kits/post-apoc/src/46-shops.js shWeapon (bales by the archery target)',
  w: 2.0, d: 0.36, h: 0.36, variants: 1,
  build: function (F) {
    for (let k = 0; k < 3; k++) F.box(-0.7 + k * 0.7, 0, 0, 0.6, 0.36, 0.36, F.rr(-0.04, 0.04), F.shade('straw', F.rr(-0.06, 0.06)), 'thatch');
  }
});
FURN({
  key: 'pa_hand_cart', name: 'Hand cart', culture: 'scrap', tier: 'poor', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'street', 'market', 'stable', 'workshop', 'smithy'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'plastic', 'metal', 'thatch'],
  source: 'kits/post-apoc/src/46-shops.js shTinker (cart); 48-industry.js inSmithy (engine trolley); 50-farm.js fmFarmhouse (hay cart)',
  w: 2.98, d: 1.48, h: 1.5, variants: 3, variantNames: ['tinker\'s cart', 'trolley with an engine block', 'hay cart'],
  variantDims: [{ w: 2.98, d: 1.48, h: 1.5 }, { w: 1.5, d: 1.25, h: 1.11 }, { w: 1.74, d: 3.04, h: 1.28 }],
  build: function (F) {
    const v = F.variant;
    if (v === 0) {
      /* a plank bed on two tyre wheels, corner rails, two handles to a stand, a load of junk. The kit draws both wheels in one
         plane, one behind the other; here they stand at the sides on their axle */
      F.shift(0.585, 0);
      F.box(0, 0.6, 0, 1.8, 0.14, 1.1, 0, F.col('plankDark'), 'plank');
      for (const q of [-1, 1]) { PA_tyre(F, 0.1, 0.5, q * 0.65, 0.5, 0.09, F.col('tyreBlack'), 'z', 12);
        F.box(-0.88, 0.7, q * 0.5, 0.06, 0.4, 0.06, 0, F.col('postBrown'), 'wood');
        F.rod(-0.9, 0.7, q * 0.4, -2.0, 0.4, q * 0.4, 0.07, F.col('postBrown'), 'wood'); }
      F.box(-2.0, 0, 0, 0.1, 0.4, 0.9, 0, F.col('postBrown'), 'wood');
      for (let k = 0; k < 5; k++) F.box(-0.5 + F.rr(-0.4, 0.4), 0.74 + (k % 2) * 0.3, F.rr(-0.25, 0.25), F.rr(0.3, 0.55), F.rr(0.25, 0.45), F.rr(0.3, 0.45), F.rnd() * F.TAU, F.pick(['drumRed', 'bottleBlue', 'steelMid', 'capBrass']), 'plastic');
    } else if (v === 1) {
      /* a low plank deck on two small tyres, an engine block on it */
      F.shift(0.1, -0.175);
      F.box(0, 0.55, 0, 1.3, 0.1, 0.9, 0, F.col('timberDark'), 'plank');
      for (const s of [-1, 1]) PA_tyre(F, s * 0.5, 0.3, 0.5, 0.3, 0.09, F.col('tyreBlack'), 'x', 10);
      F.box(-0.4, 0.65, -0.2, 0.9, 0.4, 0.5, 0, F.col('steelBlock'), 'metal');
      F.cyl(-0.25, 1.05, -0.2, 0.09, 0.06, 0, F.col('ironBlack'), 'metal');
    } else {
      /* a plank bed with low sides on two tyre wheels, shafts forward, a heap of hay */
      F.shift(0, -1.915);
      F.box(0, 0.55, 1.5, 1.3, 0.1, 2.2, 0, F.col('plankDark'), 'plank');
      for (const s of [-1, 1]) {
        PA_tyre(F, s * 0.78, 0.5, 1.3, 0.5, 0.09, F.col('tyreBlack'), 'x', 12);
        F.rod(s * 0.71, 0.5, 1.3, s * 0.77, 0.5, 1.3, 0.16, F.col('steelLight'), 'metal');
        F.beam(s * 0.55, 0.6, 1.5, s * 0.5, 0.5, 3.4, 0.06, 0.06, F.col('timberDark'), 'wood');
        F.box(s * 0.6, 0.65, 1.5, 0.06, 0.4, 2.2, 0, F.col('plankDark'), 'plank');
      }
      F.blob(0, 0.95, 1.2, 0.55, 0.66, 0, F.col('hayGold'), 'thatch');
    }
  }
});
FURN({
  key: 'pa_hitching_post', name: 'Hitching rail', culture: 'scrap', tier: 'poor', type: 'rack', setting: 'outdoor',
  rooms: ['stable', 'yard', 'street', 'shop'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber', 'metal'],
  source: 'kits/post-apoc/src/46-shops.js shGeneral (the hitching post)',
  w: 2.24, d: 0.24, h: 1.3, variants: 1,
  build: function (F) {
    for (const q of [-1, 1]) F.rod(q, 0, 0, q, 1.3, 0, 0.12, F.col('postBrown'), 'wood');
    F.rod(-1.0, 1.15, 0, 1.0, 1.15, 0, 0.09, F.col('postBrown'), 'wood');
    for (const q of [-0.4, 0.4]) PA_tyre(F, q, 0.95, 0, 0.1, 0.02, F.col('steelLight'), 'z', 8, 0, 'metal');
  }
});
FURN({
  key: 'pa_tool_rack', name: 'Smith\'s tool rack', culture: 'scrap', tier: 'poor', type: 'rack', setting: 'indoor',
  rooms: ['smithy', 'workshop'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['timber', 'metal'],
  source: 'kits/post-apoc/src/48-industry.js inSmithy (the rack of tongs and hammers on the back wall, with shHang tools)',
  w: 3.0, d: 0.36, h: 2.65, variants: 1,
  build: function (F) {
    /* a shelf board with bars stood on it, an iron rail of tongs, saw blades and hammers. The kit's rail hangs free; two battens
       on the wall carry it here */
    const z0 = -0.18;
    F.box(0, 1.3, z0 + 0.07, 3.0, 0.06, 0.14, 0, F.col('postBrown'), 'plank');
    for (let k = 0; k < 6; k++) F.box(-1.2 + k * 0.45, 1.3, z0 + 0.18, 0.05, 0.4, 0.03, 0, F.col('steelMid'), 'metal');
    for (const sx of [-1, 1]) { F.box(sx * 1.35, 1.2, z0 + 0.03, 0.08, 1.45, 0.06, 0, F.col('postBrown'), 'wood');
      F.rod(sx * 1.3, 2.6, z0 + 0.03, sx * 1.3, 2.6, z0 + 0.3, 0.03, F.col('ironBrown'), 'metal'); }
    F.rod(-1.3, 2.6, z0 + 0.3, 1.3, 2.6, z0 + 0.3, 0.05, F.col('ironBrown'), 'metal');
    for (let k = 0; k < 8; k++) { const x = -1.3 + 2.6 * (k + 0.5) / 8 + F.rr(-0.05, 0.05), yy = 2.6 - F.rr(0.12, 0.32), t = k % 3, z = z0 + 0.3;
      F.rod(x, 2.6, z, x, yy, z, 0.012, F.col('ropeDark'), 'metal');
      if (t === 0) F.box(x, yy - 0.45, z, 0.045, 0.45, 0.03, 0, F.col('steelLight'), 'metal');
      else if (t === 1) F.rod(x, yy - 0.25, z - 0.015, x, yy - 0.25, z + 0.015, 0.22, F.col('paintGrey'), 'metal');
      else { F.box(x, yy - 0.5, z, 0.05, 0.5, 0.05, 0, F.col('stumpBrown'), 'wood'); F.box(x - 0.08, yy - 0.62, z, 0.2, 0.13, 0.06, 0, F.col('steelMid'), 'metal'); } }
  }
});
FURN({
  key: 'pa_forge', name: 'Forge', culture: 'scrap', tier: 'poor', type: 'stove', setting: 'both',
  rooms: ['smithy', 'workshop'], anchor: 'floor', clearance: { front: 1.2, left: 0.5, right: 0.5 },
  materials: ['plaster', 'plastic', 'metal', 'rustSteel', 'emissive'],
  source: 'kits/post-apoc/src/48-industry.js inSmithy (tyre-and-earth forge); 46-shops.js shArmor (brick forge in the lean-to)',
  w: 3.1, d: 2.84, h: 5.0, variants: 2, variantNames: ['tyre-and-earth forge', 'brick forge'],
  variantDims: [{ w: 3.1, d: 2.84, h: 5.0 }, { w: 2.1, d: 2.3, h: 4.46 }],
  build: function (F) {
    /* the kit's flues run 6-9 m up through the roof; here they stop at 4.5 m with their caps */
    if (F.variant === 0) {
      /* an earth hearth faced with four courses of tyres, a glowing mouth and coal bed, a sheet hood on an iron rim, a banded flue */
      F.shift(0, 0.05);
      F.box(0, 0, 0.95, 2.8, 0.88, 0.44, 0, F.col('earthRammed'), 'plaster');
      for (let c = 0; c < 4; c++) for (let x = -1.047 + (c % 2) * 0.3528; x <= 1.047 + 1e-6; x += 0.7056)
        PA_tyre(F, x + F.rr(-0.02, 0.02), c * 0.22 + 0.12, 0.95 + F.rr(-0.02, 0.02), 0.36, 0.12, F.col('tyreBlack'), 'h', 8, F.rr(0, F.TAU));
      F.box(0, 0.05, -0.1, 3.0, 1.0, 1.9, 0, F.col('earthAsh'), 'plaster');
      F.box(0, 1.0, -0.05, 3.1, 0.14, 2.0, 0, F.col('earthDark'), 'plaster');
      F.box(0, 0.35, 1.2, 1.2, 0.6, 0.06, 0, F.col('glowCoal'), 'glow');
      F.blob(0, 1.5, 0.4, 0.5, 0.5, 0, F.col('glowFire'), 'glow');
      F.box(0, 1.14, 0.1, 1.5, 0.06, 0.9, 0, F.col('glowCoal'), 'glow');
      F.cone(0, 1.16, 0.1, 0.5, 0.9, 0, F.col('glowHot'), 'glow');
      F.cone(0, 1.16, 0.1, 0.25, 1.3, 0, F.col('glowFlame'), 'glow');
      F.cone(0, 1.9, -0.05, 1.4, 1.3, 0, F.col('ironUmber'), 'rust');
      F.cyl(0, 1.85, -0.05, 1.42, 0.12, 0, F.col('ironDark'), 'metal');
      F.cyl(0, 3.2, -0.05, 0.3, 1.3, 0, F.col('ironBrown'), 'metal');
      F.cyl(0, 3.6, -0.05, 0.34, 0.1, 0, F.col('ironDark'), 'metal');
      F.cyl(0, 4.5, -0.05, 0.5, 0.1, 0, F.col('ironDark'), 'metal');
      F.cone(0, 4.6, -0.05, 0.55, 0.4, 0, F.col('ironBrown'), 'metal');
      F.lamp(0, 1.4, 0.3, 1.5, 7);
      return;
    }
    /* a brick body under an iron top, coals and a flame, an iron hood, the flue kinked back to the wall */
    F.shift(0, -0.605);
    F.box(0, 0, 0.7, 1.7, 0.95, 1.1, 0, F.col('earthBrick'), 'plaster');
    F.box(0, 0.95, 0.7, 1.8, 0.07, 1.2, 0, F.col('ironDark'), 'metal');
    F.box(0, 0.98, 0.75, 0.9, 0.06, 0.6, 0, F.col('glowCoal'), 'glow');
    F.cone(0, 1.0, 0.75, 0.3, 0.6, 0, F.col('glowHot'), 'glow');
    F.cone(0, 1.55, 0.7, 1.05, 1.0, 0, F.col('ironBrown'), 'metal');
    const p = [[0, 2.5, 0.7], [0, 2.9, -0.3], [0, 3.6, -0.3], [0, 4.4, -0.3]];
    for (let i = 0; i < 3; i++) { F.rod(p[i][0], p[i][1], p[i][2], p[i + 1][0], p[i + 1][1], p[i + 1][2], 0.15, F.col('ironBrown'), 'metal'); if (i) F.ball(p[i][0], p[i][1], p[i][2], 0.15, F.col('ironBrown'), 'metal'); }
    F.cyl(0, 4.4, -0.3, 0.24, 0.06, 0, F.col('ironDark'), 'metal');
    F.lamp(0, 1.2, 0.75, 1.2, 6);
  }
});
FURN({
  key: 'pa_anvil', name: 'Scrap anvil', culture: 'scrap', tier: 'poor', type: 'workstation', setting: 'both',
  rooms: ['smithy', 'workshop'], anchor: 'floor', clearance: { front: 0.8, left: 0.4, right: 0.4 },
  materials: ['timber', 'metal', 'emissive'],
  source: 'kits/post-apoc/src/48-industry.js inSmithy (engine-block anvil); 46-shops.js shArmor (stump anvil)',
  w: 0.9, d: 0.8, h: 1.18, variants: 2, variantNames: ['engine block on a stump, hot work on it', 'rail-iron anvil on a stump'],
  variantDims: [{ w: 0.9, d: 0.8, h: 1.18 }, { w: 0.67, d: 0.5, h: 0.86 }],
  build: function (F) {
    if (F.variant === 0) {
      /* the kit sets the block half off its stump and its horn in the air; here the block is centred and the horn left off */
      F.cyl(0, 0, 0, 0.4, 0.72, 0, F.col('stumpBrown'), 'wood');
      F.box(0, 0.72, 0, 0.9, 0.36, 0.5, 0, F.col('steelBlock'), 'metal');
      for (let k = 0; k < 4; k++) F.cyl(-0.34 + k * 0.23, 1.08, 0, 0.07, 0.04, 0, F.col('ironBlack'), 'metal');
      F.box(0, 1.08, 0, 0.6, 0.06, 0.5, 0, F.col('steelLight'), 'metal');
      F.box(0, 1.14, 0, 0.4, 0.04, 0.1, 0, F.col('glowCoal'), 'glow');
      F.lamp(0, 1.3, 0, 0.4, 3);
      return;
    }
    F.shift(0.085, 0);
    F.cyl(0, 0, 0, 0.25, 0.5, 0, F.col('stumpBrown'), 'wood');
    F.box(0, 0.5, 0, 0.5, 0.12, 0.22, 0, F.col('tyreGrey'), 'metal');
    F.cone(-0.35, 0.62, 0, 0.07, 0.24, 0, F.col('tyreGrey'), 'metal');
  }
});
FURN({
  key: 'pa_bellows', name: 'Forge bellows', culture: 'scrap', tier: 'poor', type: 'workstation', setting: 'both',
  rooms: ['smithy', 'workshop'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'hide', 'metal'],
  source: 'kits/post-apoc/src/48-industry.js inSmithy (the bellows)',
  w: 1.0, d: 1.96, h: 2.15, variants: 1,
  build: function (F) {
    /* two boards with a leather gusset on two legs, a handle; a short nozzle (the kit pipes it on to the forge) */
    F.shift(0, -0.175);
    for (const sx of [-1, 1]) F.rod(sx * 0.4, 0, -0.3, sx * 0.4, 0.7, -0.3, 0.1, F.col('postBrown'), 'wood');
    F.box(0, 0.7, 0, 1.0, 0.06, 1.6, 0, F.col('plankBrown'), 'plank');
    F.box(0, 0.76, 0.15, 0.98, 0.12, 1.3, 0, F.col('stumpBrown'), 'hide');
    F.beam(0, 0.89 - 0.75 * Math.sin(0.28), 0.1 - 0.75 * Math.cos(0.28), 0, 0.89 + 0.75 * Math.sin(0.28), 0.1 + 0.75 * Math.cos(0.28), 1.0, 0.06, F.col('plankDark'), 'plank');
    F.rod(0, 1.15, 0.7, 0, 2.1, 1.1, 0.05, F.col('postBrown'), 'wood');
    F.rod(0, 0.78, 0.8, 0, 0.74, 1.0, 0.05, F.col('ironDark'), 'metal');
  }
});
FURN({
  key: 'pa_quench', name: 'Quench tank', culture: 'scrap', tier: 'poor', type: 'vessel', setting: 'both',
  rooms: ['smithy', 'workshop'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'glass', 'metal', 'rustSteel'],
  source: 'kits/post-apoc/src/48-industry.js inSmithy (plank trough); 46-shops.js shArmor (quench drum)',
  w: 2.1, d: 0.85, h: 0.66, variants: 2, variantNames: ['plank trough', 'drum'],
  variantDims: [{ w: 2.1, d: 0.85, h: 0.66 }, { w: 0.64, d: 0.64, h: 0.75 }],
  build: function (F) {
    if (F.variant === 0) {
      F.box(0, 0, 0, 2.1, 0.62, 0.8, 0, F.col('timberDark'), 'plank');
      F.box(0, 0.6, 0, 1.9, 0.03, 0.6, 0, F.col('waterSteel'), 'glass');
      for (const s of [-1, 1]) F.box(s * 0.6, 0, 0, 0.05, 0.66, 0.85, 0, F.col('ironDark'), 'metal');
      return;
    }
    F.cyl(0, 0, 0, 0.32, 0.75, 0, F.col('wireBlue'), 'rust');
    F.cyl(0, 0.7, 0, 0.28, 0.02, 0, F.col('waterDeep'), 'glass');
  }
});
FURN({
  key: 'pa_box_stove', name: 'Iron box stove', culture: 'scrap', tier: 'poor', type: 'stove', setting: 'indoor',
  rooms: ['kitchen', 'hall', 'tavern', 'workshop'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['metal', 'emissive'],
  source: 'kits/post-apoc/src/44-civic.js cvMess (the kitchen shed\'s stove with stovepipe)',
  w: 0.8, d: 1.4, h: 3.52, variants: 2, variantNames: ['flue to the roof', 'short flue'],
  variantDims: [{ w: 0.8, d: 1.4, h: 3.52 }, { w: 0.8, d: 1.4, h: 2.32 }],
  build: function (F) {
    /* an iron box, a fire door glowing on its end (the kit buries that glow inside the box), a stovepipe with its cap */
    F.box(0, 0, 0, 0.8, 0.9, 1.4, 0, F.col('ironDark'), 'metal');
    F.box(0, 0.26, 0.71, 0.4, 0.3, 0.03, 0, F.col('glowCoal'), 'glow');
    PA_flue(F, 0, 0.9, 0, F.variant ? 1.2 : 2.4, 0.09);
    F.lamp(0, 0.4, 0.9, 0.8, 5);
  }
});
FURN({
  key: 'pa_brick_grill', name: 'Brick grill oven', culture: 'scrap', tier: 'poor', type: 'stove', setting: 'both',
  rooms: ['kitchen', 'yard', 'tavern', 'market'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['plaster', 'metal', 'emissive', 'timber'],
  source: 'kits/post-apoc/src/46-shops.js shFood (the grill and oven, with its chopping block)',
  w: 2.38, d: 1.2, h: 4.28, variants: 2, variantNames: ['flue to the roof', 'short flue'],
  variantDims: [{ w: 2.38, d: 1.2, h: 4.28 }, { w: 2.38, d: 1.2, h: 2.68 }],
  build: function (F) {
    /* a brick body, an iron top with a glowing coal bed and grill bars, a glowing oven mouth, a stovepipe; a chopping block beside */
    F.shift(-0.3875, 0);
    F.box(0, 0, 0, 1.5, 1.0, 1.1, 0, F.col('earthBrick'), 'plaster');
    F.box(0, 1.0, 0, 1.6, 0.06, 1.2, 0, F.col('ironDark'), 'metal');
    F.box(-0.3, 1.06, 0.02, 0.7, 0.04, 0.7, 0, F.col('glowCoal'), 'glow');
    for (let k = 0; k < 6; k++) F.box(-0.6 + k * 0.24, 1.12, 0, 0.03, 0.03, 0.9, 0, F.col('ironBlack'), 'metal');
    F.box(0.1, 0.25, 0.56, 0.6, 0.4, 0.03, 0, F.col('glowFire'), 'glow');
    F.box(0, 0.6, 0.55, 0.9, 0.05, 0.03, 0, F.col('ironBlack'), 'metal');
    PA_flue(F, 0.55, 1.06, -0.35, F.variant ? 1.4 : 3.0, 0.09);
    F.box(1.35, 0, 0.4, 0.45, 0.5, 0.45, 0, F.col('plankBrown'), 'wood');
    F.lamp(-0.3, 1.25, 0, 1.0, 6);
  }
});
FURN({
  key: 'pa_scrap_bin', name: 'Bin of sorted scrap', culture: 'scrap', tier: 'poor', type: 'stack', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'rustSteel', 'metal'],
  source: 'kits/post-apoc/src/48-industry.js inSmithy (the scrap pens: sheets, pipes, gears)',
  w: 1.98, d: 1.48, h: 0.67, variants: 3, variantNames: ['sheets', 'pipes', 'gears and wheels'],
  variantDims: [{ w: 1.98, d: 1.48, h: 0.67 }, { w: 1.98, d: 1.48, h: 0.75 }, { w: 1.98, d: 1.48, h: 0.6 }],
  build: function (F) {
    /* three plank sides, open to the front, and what has been sorted into it */
    F.shift(0, 0.02);
    F.box(0, 0, -0.7, 1.9, 0.6, 0.08, 0, F.col('timberDark'), 'plank');
    for (const s of [-1, 1]) F.box(s * 0.95, 0, 0, 0.08, 0.6, 1.4, 0, F.col('timberDark'), 'plank');
    if (F.variant === 0) for (let q = 0; q < 8; q++) F.box(F.rr(-0.1, 0.1), 0.05 + q * 0.08, F.rr(-0.05, 0.05), 1.6, 0.06, 1.1, F.rr(-0.1, 0.1), F.pick(['rustOrange', 'galv', 'paintBlue', 'paintRed', 'rustRed']), 'rust');
    else if (F.variant === 1) for (let q = 0; q < 7; q++) { const x = -0.75 + q * 0.25, y = 0.2 + (q % 3) * 0.2; F.rod(x, y, -0.5, x, y, 0.5, 0.1 + (q % 2) * 0.05, F.pick(['rustOrange', 'rustRed']), 'metal'); }
    else for (let q = 0; q < 6; q++) PA_tyre(F, F.rr(-0.6, 0.6), 0.16 + (q > 3 ? 0.28 : 0), F.rr(-0.4, 0.4), F.rr(0.2, 0.34), 0.09, F.pick(['earthBrick', 'steelMid', 'steelBlock']), 'h', 10, 0, 'metal');
  }
});
FURN({
  key: 'pa_planter', name: 'Salvage planter', culture: 'scrap', tier: 'poor', type: 'planter', setting: 'outdoor',
  rooms: ['garden', 'yard', 'roost'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['plastic', 'plaster', 'rustSteel', 'metal', 'timber'],
  source: 'kits/post-apoc/src/50-farm.js fmTyreBed, fmBarrelBed, fmPlankBed',
  w: 2.52, d: 2.52, h: 0.52, variants: 3, variantNames: ['tyre ring', 'half drum', 'plank bed'],
  variantDims: [{ w: 2.52, d: 2.52, h: 0.52 }, { w: 0.88, d: 0.88, h: 0.52 }, { w: 2.6, d: 1.0, h: 0.4 }],
  build: function (F) {
    /* soil only: what grows in it is flora, placed by the biome (the kit's plant() slots) */
    if (F.variant === 0) { PA_tyreRing(F, 0.9, 2); F.cyl(0, 0.3, 0, 0.6, 0.22, 0, F.pick(['soilBrown', 'soilDark']), 'plaster'); return; }
    if (F.variant === 1) {
      F.cyl(0, 0, 0, 0.42, 0.5, 0, F.shade(F.pick(['drumRed', 'paintBlue', 'paintOlive', 'paintOchre', 'paintMustard']), F.rr(-0.06, 0.06)), 'rust');
      for (const f of [0.1, 0.4]) F.cyl(0, f, 0, 0.44, 0.04, 0, F.col('ironDark'), 'metal');
      F.cyl(0, 0.46, 0, 0.38, 0.06, 0, F.pick(['soilBrown', 'soilDark']), 'plaster');
      return;
    }
    const w = 2.6, d = 1.0, h = 0.4;
    for (const sz of [-1, 1]) F.box(0, 0, sz * (d / 2 - 0.03), w, h, 0.06, 0, F.pick(PA_WOOD), 'plank');
    for (const sx of [-1, 1]) F.box(sx * (w / 2 - 0.03), 0, 0, 0.06, h, d, 0, F.pick(PA_WOOD), 'plank');
    F.box(0, 0.02, 0, w - 0.1, h - 0.06, d - 0.1, 0, F.pick(['soilBrown', 'soilDark']), 'plaster');
    for (let r = 0; r < 2; r++) F.box(0, h - 0.04, -0.2 + r * 0.4, w - 0.4, 0.04, 0.15, 0, F.col('soilFurrow'), 'plaster');
  }
});
FURN({
  key: 'pa_cold_frame', name: 'Bottle-glass cold frame', culture: 'scrap', tier: 'poor', type: 'planter', setting: 'outdoor',
  rooms: ['garden', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'plaster', 'glass'],
  source: 'kits/post-apoc/src/50-farm.js fmCold',
  w: 3.48, d: 1.84, h: 0.96, variants: 1,
  build: function (F) {
    /* a plank box, low at the back and high at the front, soil inside, lids of bottle glass in timber bars, the last propped open.
       The kit's lids are 0.3 m bottle walls on trapezoid sides; here 0.12 m panes, the sides stepped */
    const w = 3.4, d = 1.7, hb = 0.4, ht = 0.85, n = 3, pw = w / n;
    for (const sx of [-1, 1]) {
      F.box(sx * w / 2, 0, 0, 0.06, hb, d, 0, F.col('plankWeathered'), 'plank');
      F.box(sx * w / 2, hb, d / 4, 0.06, (ht - hb) * 0.75, d / 2, 0, F.col('plankWeathered'), 'plank');
    }
    F.box(0, 0, -d / 2, w, hb, 0.08, 0, F.pick(PA_WOOD), 'plank');
    F.box(0, 0, d / 2 - 0.04, w, ht, 0.08, 0, F.pick(PA_WOOD), 'plank');
    F.box(0, 0.05, 0, w - 0.2, 0.2, d - 0.2, 0, F.pick(['soilBrown', 'soilDark']), 'plaster');
    for (let k = 0; k < n; k++) { const x = -w / 2 + (k + 0.5) * pw, op = k === n - 1 ? 0.3 : 0;
      F.beam(x, ht + 0.02, d / 2, x, hb + 0.05 + op, -d / 2, pw - 0.06, 0.12, F.pick(['bottleGreen', 'bottleAmber', 'bottleClear']), 'glass'); }
    for (let k = 0; k <= n; k++) { const x = -w / 2 + k * pw; F.beam(x, ht + 0.02, d / 2 + 0.03, x, hb + 0.06, -d / 2 - 0.03, 0.07, 0.07, F.col('timberDark'), 'wood'); }
  }
});
FURN({
  key: 'pa_chicken_coop', name: 'Coop on tyres', culture: 'scrap', tier: 'poor', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'garden'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'rustSteel', 'plastic', 'metal'],
  source: 'kits/post-apoc/src/50-farm.js fmCoop (the hens are animals and stay out)',
  w: 3.98, d: 1.66, h: 1.8, variants: 1,
  build: function (F) {
    /* a sheet box on a plank floor up on four tyre wheels, a sloping roof, a little door and nest hatch, a tow bar and a ramp */
    F.shift(0.155, 0);
    const w = 2.0, d = 1.3, c = F.pick(['paintTeal', 'paintMustard', 'drumRed']);
    F.box(0, 0.55, 0, w, 0.1, d, 0, F.col('plankGrey'), 'plank');
    F.box(0, 0.65, -d / 2 + 0.03, w, 0.85, 0.06, 0, c, 'rust');
    F.box(0, 0.65, d / 2 - 0.03, w * 0.6, 0.85, 0.06, 0, c, 'rust');
    for (const sx of [-1, 1]) F.box(sx * (w / 2 - 0.03), 0.65, 0, 0.06, 0.85, d, 0, c, 'rust');
    F.beam(0, 1.5, d / 2 + 0.1, 0, 1.75, -d / 2 - 0.1, w + 0.2, 0.05, F.col('galv'), 'rust');
    F.box(-0.35, 0.75, d / 2 + 0.03, 0.4, 0.6, 0.04, 0, F.col('paintOrange'), 'plank');
    F.box(0.75, 0.7, d / 2 + 0.02, 0.5, 0.5, 0.04, 0, F.col('timberBlack'), 'plank');
    for (const sx of [-1, 1]) { for (const sz of [-1, 1]) PA_tyre(F, sx * 0.8, 0.36, sz * (d / 2 + 0.05), 0.36, 0.1, F.col('tyreBlack'), 'z', 10);
      F.rod(sx * 0.8, 0.36, -d / 2, sx * 0.8, 0.36, d / 2, 0.05, F.col('ironBrown'), 'metal'); }
    F.beam(-w / 2, 0.55, 0, -w / 2 - 1.1, 0.2, 0, 0.07, 0.07, F.col('postBrown'), 'wood');
    F.beam(w / 2 - 0.05, 0.62, 0.35, w / 2 + 0.8, 0.02, 0.8, 0.05, 0.05, F.col('plankGrey'), 'wood');
  }
});
FURN({
  key: 'pa_well', name: 'Tyre-ring well', culture: 'scrap', tier: 'poor', type: 'well', setting: 'outdoor',
  rooms: ['yard', 'garden', 'plaza', 'street'], anchor: 'floor', clearance: { front: 1.0, left: 0.6, right: 0.6 },
  materials: ['plastic', 'plaster', 'stone', 'timber', 'rope', 'metal', 'rustSteel'],
  source: 'kits/post-apoc/src/42-lg-dwell.js lgWell (windlass and roof); 50-farm.js fmWell; 54-compound.js cpGround (open well)',
  w: 3.2, d: 2.52, h: 3.28, variants: 3, variantNames: ['windlass well with a roof', 'farm well', 'open well'],
  variantDims: [{ w: 3.2, d: 2.52, h: 3.28 }, { w: 1.98, d: 1.98, h: 2.53 }, { w: 2.64, d: 2.64, h: 2.24 }],
  build: function (F) {
    /* courses of tyres on a rammed-earth ring, a black shaft mouth; then posts and what hangs from them */
    const v = F.variant, wd = F.col('postBrown');
    if (v === 0) {
      F.shift(-0.08, 0);
      PA_tyreRing(F, 0.9, 3);
      F.cyl(0, 0.64, 0, 1.25, 0.1, 0, F.col('stonePale'), 'stone');
      F.cyl(0, 0.74, 0, 0.66, 0.01, 0, F.col('shaftBlack'), 'stone');
      for (const sx of [-1, 1]) { F.rod(sx * 1.15, 0, 0, sx * 1.15, 2.5, 0, 0.13, wd, 'wood');
        for (const sz of [-1, 1]) F.rod(sx * 1.15, 0.5, sz * 0.5, sx * 1.15, 1.9, 0, 0.07, wd, 'wood'); }
      F.rod(-1.15, 2.3, 0, 1.15, 2.3, 0, 0.1, F.col('plankDark'), 'wood');
      F.rod(-0.25, 2.3, 0, 0.25, 2.3, 0, 0.2, F.col('ropeTan'), 'rope');
      F.rod(1.2, 2.3, 0, 1.6, 2.3, 0, 0.04, F.col('ironDark'), 'metal'); F.rod(1.6, 2.3, 0, 1.6, 1.95, 0.28, 0.04, F.col('ironDark'), 'metal');
      F.ball(1.6, 1.93, 0.3, 0.06, wd, 'wood');
      F.rod(0, 2.15, 0, 0, 1.05, 0, 0.02, F.col('ropeTan'), 'rope');
      F.frustum(0, 0.78, 0, 0.19, 0.17, 0.28, 0, F.col('plankBrown'), 'rust', 10);
      F.cyl(0, 1.04, 0, 0.2, 0.03, 0, F.col('ironDark'), 'metal');
      for (const sz of [-1, 1]) F.beam(0, 2.55, sz * 0.955, 0, 3.2, 0, 3.0, 0.07, F.pick(['earthBrick', 'paintMustard']), 'rust');
      F.box(0, 3.18, 0, 3.0, 0.1, 0.16, 0, F.col('ironUmber'), 'metal');
      return;
    }
    if (v === 1) {
      PA_tyreRing(F, 0.62, 3);
      F.cyl(0, 0.66, 0, 0.38, 0.01, 0, F.col('waterDark'), 'stone');
      for (const s of [-1, 1]) F.beam(s * 0.67, 0, 0, s * 0.67, 2.1, 0, 0.09, 0.09, wd, 'wood');
      F.beam(-0.72, 2.1, 0, 0.72, 2.1, 0, 0.09, 0.09, wd, 'wood');
      F.rod(-0.62, 1.7, 0, 0.62, 1.7, 0, 0.09, F.col('plankDark'), 'wood');
      F.beam(0, 2.0, 0.8, 0, 2.5, -0.8, 1.94, 0.05, F.col('rustOrange'), 'rust');
      F.rod(0, 1.65, 0, 0, 1.0, 0, 0.012, F.col('ropeDark'), 'rope');
      F.cyl(0, 0.75, 0, 0.13, 0.26, 0, F.col('steelLight'), 'rust');
      return;
    }
    PA_tyreRing(F, 0.95, 3);
    F.cyl(0, 0.66, 0, 0.7, 0.01, 0, F.col('waterDark'), 'stone');
    for (const s of [-1, 1]) F.rod(s * 0.9, 0, 0, s * 0.9, 2.2, 0, 0.06, wd, 'wood');
    F.beam(-0.9, 2.2, 0, 0.9, 2.2, 0, 0.06, 0.06, wd, 'wood');
  }
});
FURN({
  key: 'pa_scarecrow', name: 'Rag scarecrow', culture: 'scrap', tier: 'poor', type: 'statue', setting: 'outdoor',
  rooms: ['garden', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'cloth', 'rustSteel'],
  source: 'kits/post-apoc/src/50-farm.js fmScarecrow',
  w: 1.9, d: 0.6, h: 2.44, variants: 1,
  build: function (F) {
    const wd = F.col('postBrown');
    F.rod(0, 0, 0, 0, 2.1, 0, 0.08, wd, 'wood');
    F.rod(-0.85, 1.7, 0, 0.85, 1.7, 0, 0.07, wd, 'wood');
    F.box(0, 1.0, 0, 0.5, 0.8, 0.24, 0, F.col('clothRust'), 'cloth');
    F.box(-0.6, 1.45, 0, 0.7, 0.25, 0.08, 0, F.col('paintMustard'), 'cloth');
    F.box(0.6, 1.45, 0, 0.7, 0.25, 0.08, 0, F.col('paintTeal'), 'cloth');
    F.ball(0, 2.05, 0, 0.2, F.col('clothBurlap'), 'cloth');
    F.cyl(0, 2.2, 0, 0.3, 0.05, 0, F.col('plankGrey'), 'rust');
    F.cyl(0, 2.24, 0, 0.17, 0.2, 0, F.col('plankGrey'), 'rust');
    for (const s of [-1, 1]) F.box(s * 0.15, 0.35, 0, 0.1, 0.65, 0.06, 0, F.col('clothDenim'), 'cloth');
    F.box(0.3, 1.7, 0.1, 0.04, 0.5, 0.02, 0, F.col('produceRed'), 'cloth');
    F.box(-0.3, 1.7, 0.1, 0.04, 0.4, 0.02, 0, F.col('paintCream'), 'cloth');
  }
});
FURN({
  key: 'pa_fish_rack', name: 'Fish-drying rack', culture: 'scrap', tier: 'poor', type: 'rack', setting: 'outdoor',
  rooms: ['dock', 'yard', 'market'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'skin', 'rope', 'plastic'],
  source: 'kits/post-apoc/src/58-dock.js dkLand (fish-drying racks with hanging fish and nets)',
  w: 4.42, d: 1.12, h: 2.65, variants: 2, variantNames: ['fish', 'fish and a net'],
  build: function (F) {
    /* two A-frames, a top rail of fish and a lower rail of dried ones; a net with floats hung between */
    F.shift(-2.15, 0);
    const wd = F.col('postBrown');
    for (const dx of [0, 4.0]) { F.rod(dx, 0, -0.5, dx + 0.3, 2.6, 0, 0.06, wd, 'wood'); F.rod(dx, 0, 0.5, dx + 0.3, 2.6, 0, 0.06, wd, 'wood'); }
    F.rod(0.3, 2.6, 0, 4.3, 2.6, 0, 0.05, wd, 'wood');
    F.rod(0.15, 1.6, 0, 4.15, 1.6, 0, 0.04, wd, 'wood');
    for (let k = 0; k < 11; k++) { const fx = 0.6 + k * 0.34;
      F.box(fx, 2.15 + (k % 2) * 0.02, 0.05, 0.09, 0.42, 0.05, 0, F.pick(['fishGrey', 'fishPink', 'fishDark']), 'skin');
      if (k % 2) F.box(fx, 1.15, 0.05, 0.09, 0.42, 0.05, 0, F.col('fishDry'), 'skin'); }
    if (F.variant) {
      F.box(2.15, 0.7, -0.1, 3.9, 1.2, 0.02, 0, F.col('ropeTan'), 'rope');
      for (let k = 0; k < 6; k++) F.ball(0.35 + k * 0.72, 0.75, -0.08, 0.07, F.pick(['flagGold', 'paintOrange']), 'plastic');
    }
  }
});
FURN({
  key: 'pa_net_pile', name: 'Nets and pots', culture: 'scrap', tier: 'poor', type: 'stack', setting: 'outdoor',
  rooms: ['dock', 'yard', 'store'], anchor: 'floor', clearance: {},
  materials: ['rope', 'rustSteel'],
  source: 'kits/post-apoc/src/58-dock.js dkLand (net pile and pots)',
  w: 3.94, d: 1.4, h: 0.6, variants: 1,
  build: function (F) {
    /* heaped nets, a row of painted pots */
    F.shift(-0.16, 0);
    for (let k = 0; k < 5; k++) { const r = F.rr(0.3, 0.45); F.blob(-1.0 + F.rr(-0.35, 0.35), 0.25, F.rr(-0.2, 0.2), r, r * 1.2, 0, F.shade('netBrown', F.rr(-0.08, 0.08)), 'rope'); }
    for (let k = 0; k < 4; k++) F.cyl(0.4 + k * 0.5, 0, 0.3, 0.22, 0.4, 0, F.pick(['drumRed', 'paintOlive', 'paintMustard']), 'rust');
  }
});
FURN({
  key: 'pa_prisoner_cage', name: 'Rebar cage', culture: 'scrap', tier: 'poor', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'barracks', 'plaza'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'metal', 'rustSteel', 'thatch', 'plastic'],
  source: 'kits/post-apoc/src/52-defence.js dfCage (on skids, on stilts, on wheels)',
  w: 2.5, d: 2.56, h: 2.37, variants: 3, variantNames: ['on skids', 'on stilts', 'on wheels'],
  variantDims: [{ w: 2.5, d: 2.56, h: 2.37 }, { w: 2.4, d: 2.46, h: 3.45 }, { w: 3.96, d: 2.3, h: 2.35 }],
  build: function (F) {
    /* welded rebar bars round a plank floor, barrel hoops at three heights, a rebar roof half lidded with sheet, a barred door
       with a padlocked hasp at the front (+z); straw and a bucket inside */
    const v = F.variant, w = [2.4, 2.3, 2.2][v], d = [2.4, 2.3, 1.8][v], h = [2.2, 2.1, 1.8][v], y = [0.12, 1.3, 0.5][v];
    const bar = (ax, ay, az, bx, by, bz, r) => F.rod(ax, ay, az, bx, by, bz, r || 0.03, F.pick(['ironUmber', 'rustRebar', 'ironBrown', 'rustPipe']), 'metal');
    const hoop = F.col('ironDark'), wd = F.col('postBrown');
    if (v === 2) F.shift(-0.6675, 0);
    F.box(0, y - 0.12, 0, w + 0.1, 0.12, d + 0.1, 0, F.col('timberDark'), 'plank');
    if (v === 1) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.beam(sx * (w / 2 - 0.1), 0, sz * (d / 2 - 0.1), sx * (w / 2 - 0.1), y - 0.12, sz * (d / 2 - 0.1), 0.13, 0.13, wd, 'wood');
      for (const sz of [-1, 1]) F.beam(-w / 2, y * 0.45, sz * (d / 2 - 0.1), w / 2, y * 0.7, sz * (d / 2 - 0.1), 0.06, 0.06, wd, 'wood');
    }
    if (v === 2) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) PA_tyre(F, sx * (w / 2 - 0.15), 0.36, sz * (d / 2 + 0.14), 0.36, 0.1, F.col('tyreBlack'), 'z', 10);
      for (const sx of [-1, 1]) F.rod(sx * (w / 2 - 0.2), 0.36, -d / 2 - 0.1, sx * (w / 2 - 0.2), 0.36, d / 2 + 0.1, 0.06, F.col('ironBrown'), 'metal');
      F.beam(w / 2, y - 0.2, 0, w / 2 + 1.5, 0.3, 0, 0.09, 0.09, wd, 'wood');
      F.beam(w / 2, y - 0.2, -0.3, w / 2 + 1.5, 0.3, -0.05, 0.05, 0.05, wd, 'wood');
    }
    const nx = Math.round(w / 0.17), nz = Math.round(d / 0.17);
    for (let k = 0; k <= nx; k++) { const xx = -w / 2 + k * w / nx; bar(xx, y, -d / 2, xx, y + h, -d / 2); if (Math.abs(xx) > 0.5) bar(xx, y, d / 2, xx, y + h, d / 2); }
    for (let k = 1; k < nz; k++) { const zz = -d / 2 + k * d / nz; bar(-w / 2, y, zz, -w / 2, y + h, zz); bar(w / 2, y, zz, w / 2, y + h, zz); }
    const cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (const f of [0.02, 0.5, 0.98]) { const yy = y + h * f; for (let i = 0; i < 4; i++) { const a = cs[i], c = cs[(i + 1) % 4]; F.rod(a[0] * w / 2, yy, a[1] * d / 2, c[0] * w / 2, yy, c[1] * d / 2, 0.045, hoop, 'metal'); } }
    for (const [sx, sz] of cs) F.rod(sx * w / 2, y, sz * d / 2, sx * w / 2, y + h, sz * d / 2, 0.06, hoop, 'metal');
    for (let k = 0; k <= 3; k++) { const xx = -w / 2 + k * w / 3; bar(xx, y + h, -d / 2, xx, y + h, d / 2); }
    for (let k = 0; k <= 3; k++) { const zz = -d / 2 + k * d / 3; bar(-w / 2, y + h, zz, w / 2, y + h, zz); }
    F.box(-w / 4, y + h + 0.02, 0, w / 2, 0.03, d, 0, F.pick(['drumRed', 'lidGrey', 'lidOchre']), 'rust');
    const dw = 0.9, dh = h - 0.3;
    F.box(0, y, d / 2 + 0.02, dw, 0.05, 0.05, 0, hoop, 'metal');
    for (const sx of [-1, 1]) F.rod(sx * dw / 2, y, d / 2 + 0.03, sx * dw / 2, y + dh, d / 2 + 0.03, 0.05, hoop, 'metal');
    F.rod(-dw / 2, y + dh, d / 2 + 0.03, dw / 2, y + dh, d / 2 + 0.03, 0.05, hoop, 'metal');
    F.rod(-dw / 2, y + 0.05, d / 2 + 0.03, dw / 2, y + dh, d / 2 + 0.03, 0.03, hoop, 'metal');
    for (let k = 0; k <= 4; k++) bar(-dw / 2 + k * dw / 4, y, d / 2, -dw / 2 + k * dw / 4, y + dh, d / 2);
    const px = dw / 2 - 0.02, py = y + h * 0.42, pz = d / 2 + 0.07;
    F.box(px, py, pz, 0.13, 0.14, 0.06, 0, F.col('padlockBrass'), 'metal');
    F.rod(px - 0.04, py + 0.14, pz, px - 0.04, py + 0.22, pz, 0.02, F.col('steelLight'), 'metal'); F.rod(px + 0.04, py + 0.14, pz, px + 0.04, py + 0.22, pz, 0.02, F.col('steelLight'), 'metal');
    F.rod(px - 0.04, py + 0.22, pz, px + 0.04, py + 0.22, pz, 0.02, F.col('steelLight'), 'metal');
    for (const yy of [0.3, h - 0.5]) F.box(-dw / 2, y + yy, d / 2 + 0.05, 0.16, 0.06, 0.05, 0, hoop, 'metal');
    F.blob(-w / 4, y + 0.12, -d / 4, 0.4, 0.32, 0, F.col('straw'), 'thatch');
    F.blob(w / 5, y + 0.1, -d / 5, 0.3, 0.24, 0, F.col('strawDark'), 'thatch');
    F.cyl(w / 3, y, d / 4, 0.16, 0.24, 0, F.col('steelLight'), 'rust');
  }
});
FURN({
  key: 'pa_drum_cage', name: 'Drum cage', culture: 'scrap', tier: 'poor', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'barracks', 'plaza'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'metal', 'thatch'],
  source: 'kits/post-apoc/src/52-defence.js dfDrum',
  w: 2.12, d: 2.16, h: 2.67, variants: 1,
  build: function (F) {
    /* a ring of rebar bars on a plank base, barrel hoops at four heights, spokes to a knobbed finial, a barred door to the front */
    const r = 1.0, h = 2.2, y = 0.1, n = 22, hoop = F.col('ironDark'), lc = F.col('ironBrown');
    const bar = (ax, ay, az, bx, by, bz) => F.rod(ax, ay, az, bx, by, bz, 0.03, F.pick(['ironUmber', 'rustRebar', 'ironBrown', 'rustPipe']), 'metal');
    F.box(0, 0, 0, r * 2.1, 0.1, r * 2.1, 0, F.col('timberDark'), 'plank');
    F.cyl(0, 0, 0, r + 0.05, 0.1, 0, hoop, 'metal');
    for (let k = 0; k < n; k++) { const a = k / n * F.TAU; if (Math.abs(Math.sin(a - F.TAU / 4)) < 0.11 && Math.cos(a - F.TAU / 4) > 0.5) continue;
      bar(Math.cos(a) * r, y, Math.sin(a) * r, Math.cos(a) * r, y + h, Math.sin(a) * r); }
    for (const f of [0, 0.33, 0.66, 1]) { const yy = y + h * f; for (let k = 0; k < 14; k++) { const a = k / 14 * F.TAU, c = (k + 1) / 14 * F.TAU;
      F.rod(Math.cos(a) * r, yy, Math.sin(a) * r, Math.cos(c) * r, yy, Math.sin(c) * r, 0.045, hoop, 'metal'); } }
    for (let k = 0; k < 6; k++) { const a = k * F.TAU / 6; F.rod(0, y + h, 0, Math.cos(a) * r, y + h - 0.1, Math.sin(a) * r, 0.03, lc, 'metal'); }
    F.rod(0, y + h, 0, 0, y + h + 0.3, 0, 0.04, lc, 'metal'); F.ball(0, y + h + 0.3, 0, 0.07, lc, 'metal');
    F.box(0.15, y + h * 0.45, r + 0.05, 0.13, 0.14, 0.06, 0, F.col('padlockBrass'), 'metal');
    for (const s of [-1, 1]) F.rod(s * 0.45, y, r * 0.9, s * 0.45, y + h - 0.2, r * 0.9, 0.05, hoop, 'metal');
    F.rod(-0.45, y + h - 0.2, r * 0.9, 0.45, y + h - 0.2, r * 0.9, 0.05, hoop, 'metal');
    for (let k = 0; k < 4; k++) bar(-0.3 + k * 0.2, y, r * 0.9, -0.3 + k * 0.2, y + h - 0.2, r * 0.9);
    F.blob(-0.2, y + 0.1, -0.3, 0.4, 0.32, 0, F.col('straw'), 'thatch');
  }
});
FURN({
  key: 'pa_stocks', name: 'Stocks', culture: 'scrap', tier: 'poor', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'plaza', 'barracks'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'metal'],
  source: 'kits/post-apoc/src/52-defence.js dfStocks',
  w: 1.95, d: 1.31, h: 1.55, variants: 1,
  build: function (F) {
    /* two posts and a head beam, two boards with neck and wrist holes between them, iron straps, a bench before it */
    F.shift(0, -0.545);
    const c = F.col('postBrown');
    for (const s of [-1, 1]) F.beam(s * 0.9, 0, 0, s * 0.9, 1.5, 0, 0.15, 0.15, c, 'wood');
    F.box(0, 0.65, -0.06, 1.9, 0.14, 0.1, 0, F.col('timberDark'), 'plank');
    F.box(0, 0.95, 0.06, 1.9, 0.14, 0.1, 0, F.col('timberDark'), 'plank');
    for (const s of [-0.5, 0.05, 0.55]) F.box(s, 0.79, 0, 0.22, 0.16, 0.12, 0, F.col('timberBlack'), 'plank');
    F.beam(-0.9, 1.5, 0, 0.9, 1.5, 0, 0.1, 0.1, c, 'wood');
    for (const s of [-1, 1]) F.box(s * 0.9, 0.85, 0.09, 0.06, 0.3, 0.04, 0, F.col('ironDark'), 'metal');
    F.box(0, 0, 0.9, 1.6, 0.16, 0.6, 0, F.col('timberDark'), 'plank');
    F.box(0.15, 0.85, 0.15, 0.14, 0.12, 0.06, 0, F.col('padlockBrass'), 'metal');
  }
});
FURN({
  key: 'pa_whipping_post', name: 'Whipping post', culture: 'scrap', tier: 'poor', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'plaza', 'barracks'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'concrete', 'metal'],
  source: 'kits/post-apoc/src/52-defence.js dfWhipPost (the stain on the ground is left out)',
  w: 1.5, d: 0.8, h: 2.6, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.4, 0.14, 0, F.col('stoneField'), 'concrete');
    F.rod(0, 0, 0, 0, 2.6, 0, 0.18, F.col('postBrown'), 'wood');
    F.beam(-0.7, 2.15, 0, 0.7, 2.15, 0, 0.1, 0.1, F.col('postBrown'), 'wood');
    for (const s of [-1, 1]) { F.cyl(s * 0.55, 1.85, 0, 0.09, 0.09, 0, F.col('ironBrown'), 'metal'); F.rod(s * 0.55, 1.85, 0, s * 0.5, 1.3, 0.1, 0.02, F.col('ironDark'), 'metal'); }
    for (let k = 0; k < 5; k++) F.rod(0, 1.15, 0.15, F.rr(-0.2, 0.2), 0.55 + k * 0.02, 0.2, 0.02, F.col('ironDark'), 'metal');
  }
});
FURN({
  key: 'pa_gibbet', name: 'Hanging gibbet cage', culture: 'scrap', tier: 'poor', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'plaza'], anchor: 'ceiling', clearance: {},
  materials: ['metal', 'plaster'],
  source: 'kits/post-apoc/src/52-defence.js dfGibbet (with a length of dfChain)',
  w: 0.78, d: 0.58, h: 3.0, variants: 1,
  build: function (F) {
    /* a man-shaped cage of iron bands and straps, a dark shape inside, a ring and a chain up to its hook */
    const c = F.col('ironDark'), rs = [0.14, 0.3, 0.34, 0.26, 0.2, 0.13], ys = [0, 0.35, 0.75, 1.15, 1.5, 1.8];
    for (let i = 0; i < 6; i++) for (let k = 0; k < 10; k++) { const a = k / 10 * F.TAU, b = (k + 1) / 10 * F.TAU;
      F.rod(Math.cos(a) * rs[i], ys[i], Math.sin(a) * rs[i] * 0.7, Math.cos(b) * rs[i], ys[i], Math.sin(b) * rs[i] * 0.7, 0.04, c, 'metal'); }
    for (let k = 0; k < 8; k++) { const a = k / 8 * F.TAU; for (let i = 0; i < 5; i++)
      F.rod(Math.cos(a) * rs[i], ys[i], Math.sin(a) * rs[i] * 0.7, Math.cos(a) * rs[i + 1], ys[i + 1], Math.sin(a) * rs[i + 1] * 0.7, 0.03, c, 'metal'); }
    F.blob(0, 1.05, 0, 0.16, 0.48, 0, F.col('timberUmber'), 'plaster');
    F.rod(0, 1.8, 0, 0, 2.3, 0, 0.04, c, 'metal'); F.ball(0, 2.32, 0, 0.09, c, 'metal');
    for (let k = 0; k < 6; k++) F.box(0, 2.4 + k * 0.1, 0, 0.06, 0.06, 0.06, k % 2 ? 0.7 : 0, F.col('ironBrown'), 'metal');
    F.box(0, 2.94, 0, 0.12, 0.06, 0.12, 0, F.col('ironBrown'), 'metal');
  }
});
FURN({
  key: 'pa_junk_totem', name: 'Junk totem', culture: 'scrap', tier: 'poor', type: 'shrine', setting: 'outdoor',
  rooms: ['shrine', 'temple', 'yard', 'plaza'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal', 'plastic', 'rustSteel'],
  source: 'kits/post-apoc/src/44-civic.js cvShaman (totem) and cvChief (the hubcap spikes)',
  w: 1.7, d: 1.5, h: 5.2, variants: 3, variantNames: ['hubcap totem', 'totem with a painted plate', 'hubcap spike'],
  variantDims: [{ w: 1.7, d: 1.5, h: 5.2 }, { w: 1.7, d: 1.5, h: 6.0 }, { w: 0.66, d: 0.66, h: 4.1 }],
  build: function (F) {
    const v = F.variant;
    if (v === 2) {
      /* a spiked pole threaded with hubcaps and brass discs */
      F.cyl(0, 0, 0, 0.07, 3.6, 0, F.col('ironBrown'), 'wood');
      F.cone(0, 3.6, 0, 0.06, 0.5, 0, F.col('ironDark'), 'metal');
      for (let k = 0; k < 5; k++) F.cyl(0, 1.2 + k * 0.32, 0, 0.32 - 0.02 * k, 0.05, 0, F.col(k % 2 ? 'hubcap' : 'brass'), 'metal');
      return;
    }
    /* a pole, a stack of hubcaps and brass discs, doll heads, a bent pipe, rebar sprays and a crossbar, an iron spike */
    const h = v ? 5.4 : 4.6;
    F.cyl(0, 0, 0, 0.14, h, 0, F.col('postBrown'), 'wood');
    for (let k = 0; k < 6; k++) F.cyl(0, 0.9 + k * 0.3, 0, 0.42 - 0.02 * k, 0.05, 0, F.col(k % 2 ? 'hubcap' : 'brass'), 'metal');
    for (let k = 0; k < 3; k++) { const y = 2.9 + k * 0.55, a = k * 2.1, x = Math.cos(a) * 0.24, z = Math.sin(a) * 0.24;
      F.ball(x, y, z, 0.17, F.pick(['dollPale', 'dollTan', 'dollDark']), 'plastic');
      F.ball(x + 0.06, y + 0.03, z + 0.13, 0.03, F.col('eyeBlack'), 'plastic'); F.ball(x - 0.06, y + 0.03, z + 0.13, 0.03, F.col('eyeBlack'), 'plastic'); }
    const p = [[0.15, 0.5, 0.1], [0.55, 0.9, 0.2], [0.55, 2.0, 0.1], [0.3, 2.5, 0]];
    for (let i = 0; i < 3; i++) F.rod(p[i][0], p[i][1], p[i][2], p[i + 1][0], p[i + 1][1], p[i + 1][2], 0.06, F.col('rustPipe'), 'metal');
    for (const [dx, dy, dz] of [[-0.8, h - 0.3, 0], [0.8, h - 0.5, 0.1], [0.1, h - 0.4, 0.7], [-0.4, h - 0.4, -0.7]]) F.rod(0, h - 1.1, 0, dx, dy, dz, 0.04, F.col('rustRebar'), 'metal');
    F.box(0, h - 0.2, 0, 1.4, 0.12, 0.12, 0, F.col('postBrown'), 'plank');
    F.cone(0, h, 0, 0.13, 0.6, 0, F.col('ironDark'), 'metal');
    if (v === 1) { const cy = h - 0.55, q = 0.318; F.beam(-q, cy - q, 0.16, q, cy + q, 0.16, 0.9, 0.05, F.col('flagGold'), 'rust'); }
  }
});
FURN({
  key: 'pa_offerings', name: 'Shaman\'s offerings', culture: 'scrap', tier: 'poor', type: 'altar', setting: 'both',
  rooms: ['shrine', 'temple', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['rustSteel', 'foliage', 'plaster', 'emissive', 'timber', 'bone'],
  source: 'kits/post-apoc/src/44-civic.js cvShaman (the offerings at the foot of the totems: bowls, candles, a box, bones)',
  w: 3.56, d: 1.0, h: 0.3, variants: 1,
  build: function (F) {
    /* painted bowls of fruit, a row of candles, an offering box, bones laid out */
    F.shift(-0.085, -0.15);
    for (const [x, z] of [[-1.5, -0.15], [-1.2, 0.35]]) { F.cyl(x, 0, z, 0.18, 0.08, 0, F.pick(['drumRed', 'paintBlue', 'paintMustard']), 'rust');
      F.ball(x, 0.1, z, 0.09, F.pick(['flagGold', 'paintOrange', 'paintOlive']), 'plant'); }
    for (let k = 0; k < 4; k++) { F.cyl(-0.9 + k * 0.6, 0, -0.3, 0.04, 0.16, 0, F.col('boneWhite'), 'plaster'); F.ball(-0.9 + k * 0.6, 0.2, -0.3, 0.045, F.col('glowBulb'), 'glow'); }
    F.lamp(0, 0.3, -0.2, 0.5, 4);
    F.box(1.5, 0, -0.05, 0.7, 0.3, 0.5, 0, F.col('plankBrown'), 'plank');
    for (let k = 0; k < 3; k++) F.rod(-0.6 + k * 0.4, 0.04, 0.3, -0.6 + k * 0.4 + F.rr(-0.15, 0.15), 0.06, 0.6, 0.04, F.col('boneWhite'), 'bone');
  }
});
