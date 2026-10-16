/* ======================================================================
   Beast Rider furniture: common and court tiers (the harvested Mav's Refuge
   and Girder pieces stay in krator-master-furniture.js, keys br_*).
   Influences: Amerindian, Javan; simple but not primitive. Lashed hardwood,
   woven and hide seats, bone and horn, big animal skulls; court pieces in
   hyper-mahogany with bone inlay and skull crests. Greens and claw-pale
   cloth from the Beast Rider pack (core/sockets/80-cultures.js).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('beast-rider', { name: 'Beast Riders', pack: 'beast-rider', influences: 'Amerindian; Javan; big animal skulls',
  materials: 'lashed hardwood, hide, woven fibre, bone and horn; court: hyper-mahogany, bone inlay, skulls',
  palette: {
    boneIvory: 0xe8e0cc, boneDark: 0xc8b898, mahoganyRed: 0x6a2a1e, mahoganyDark: 0x44190f, mahoganyLight: 0x8a4030,
    clothClawGreen: 0x3f7a3a, clothClawPale: 0xe6dcc2, clothMossDark: 0x2e5a2c, flame: 0xff8a3c, ember: 0xd9762c,
    gourdOchre: 0xb89040,
    /* the harvested br_h_* pieces: Mav's Refuge and Girder's own palette (05-palette.js) and the
       Beast Rider building file's literals, where no key above already matches */
    plankHoney: 0x9a7a52, plankTan: 0x8a6c48, plankSand: 0xa8865c, plankDark: 0x7c6040,
    timberBistre: 0x5e4630, timberCocoa: 0x6a5038, timberSmoke: 0x4e3a28, timberTawny: 0x745a3e,
    timberBark: 0x6a5238, timberLeather: 0x7a6248, timberDoor: 0x40331f, leatherBrown: 0x5a4630,
    wallWicker: 0xb89a6c, wallReed: 0xa88a5e, wallFlax: 0xc4a878, wallKhaki: 0x9a7e56, wallCream: 0xd0b88a,
    wallTar: 0x6e5238, wallTarRed: 0x7a5c40,
    thatchStraw: 0xb09a5a, thatchHay: 0xa08a4e, thatchPale: 0xc0aa68, thatchOld: 0x8e7a44, thatchDun: 0x9a8a52,
    shingleBrown: 0x6a5a44, shingleDark: 0x5a4c3a,
    lacquerRed: 0x8a2f2a, gilt: 0xb08432, verdigris: 0x2f6a5a, lacquerDeep: 0x7a2028,
    ropeHemp: 0xa8966a, ropeJute: 0x98865c, ropeTwine: 0x9a8a62,
    clothRust: 0x8a5a2a, clothForest: 0x2f5a3a, clothMustard: 0xc2a24e, clothPlum: 0x4a3a6a, clothTerracotta: 0xb8683e,
    clothSage: 0x8a9a5a, clothMauve: 0x7a4a6a, clothBrick: 0xa85040, clothWheat: 0xb0894a,
    silkWhite: 0xe8ecec, silkGrey: 0xd8dede,
    cropGreen: 0x5c8a3a, cropLeaf: 0x7a9a3e, cropPale: 0x9aa848, cropDeep: 0x4e7a32,
    fernGreen: 0x2e5a2a, fernMoss: 0x3a6a30, saplingGreen: 0x3a6a34, leafJade: 0x3a7a4c,
    fruitOrange: 0xe0862a, fruitAmber: 0xd06a20, fruitGold: 0xf0a040, flowerViolet: 0x9a6ad8,
    gourdGreen: 0x8a9a4a, gourdRust: 0xb07a3a, gourdPale: 0xc2a05a,
    crateTan: 0x877558, crateDark: 0x6d5e45,
    stoneSlate: 0x6d665c, stoneDusk: 0x5c574f, stoneAsh: 0x7b7468, stoneCoal: 0x4f4a44, stonePlinth: 0x9a9484,
    ironDark: 0x2a2620, ironGrey: 0x6a655a, ironPot: 0x4a4038,
    waterGreen: 0x6f8f6a, glowWarm: 0xffb347, glowCool: 0x7fd8ff
  } });
/* END PALETTE */
const BR_COMMON = {
  emblem: { field: 'clothClawGreen', edge: 'clothMossDark', band: 'leafOlive', ink: 'clothClawPale' },
  wood: 'timberMud', woodDark: 'timberSepia', woodLight: 'timberStraw', woodFam: 'wood',
  cloth: ['clothVermilion', 'clothSaffron', 'clothTeal', 'hideOak'], clothFam: 'hide',
  accent: 'boneIvory', accentFam: 'bone', metal: 'iron', metalFam: 'metal',
  clay: 'gourdOchre', clayFam: 'stone', stone: 'stoneTaupe', stoneFam: 'stone', rope: 'timberStraw',
  flame: 'flame', ember: 'ember',
  legs: 'lashed', motif: 'lash', bedBase: 'woven', seat: 'hide', finial: 'none',
  hearth: 'stone', fire: 'pit', lamp: 'torch', rug: 'hide', screen: 'hide', store: 'gourds',
  shelfFill: 'bundles', rack: 'spears', art: 'skull', art2: 'antler', statue: 'totem', tapestry: 'claw',
  canopy: false, board: 'hide'
};
const BR_COURT = Object.assign({}, BR_COMMON, {
  wood: 'mahoganyRed', woodDark: 'mahoganyDark', woodLight: 'mahoganyLight', woodFam: 'mahogany',
  cloth: ['clothClawGreen', 'clothClawPale', 'clothVermilion', 'clothMossDark'], clothFam: 'cloth',
  legs: 'block', motif: 'skull', finial: 'skull', statue: 'skullpole', art: 'skull', art2: 'antler', rug: 'hide', screen: 'carved'
});
FK.set({ culture: 'beast-rider', tier: 'common', prefix: 'br_common_', S: BR_COMMON, names: {
  bed: 'Lashed bed with a hide', bench: 'Lashed bench', chair: 'Hide-seat chair', stool: 'Lashed stool', table: 'Lashed table',
  low_table: 'Low lashed table', desk: 'Tally desk', chest: 'Hide-bound chest', bookcase: 'Bundle shelves', wall_shelves: 'Gourd shelves',
  store: 'Gourds', hearth: 'Stone hearth', fire: 'Fire pit', lamp: 'Torch stand', candle: 'Tallow dish',
  hanging: 'Hanging torch cage', rug: 'Beast hide', screen: 'Hide screen', counter: 'Trade counter', workbench: 'Workbench',
  loom: 'Loom', rack: 'Spear rack', ladder: 'Ladder', board: 'Hide tally board', art: 'Mounted skull', bowl: 'Gourd bowl',
  jug: 'Gourd and cups', books: 'Tally sticks' } });
FK.set({ culture: 'beast-rider', tier: 'court', prefix: 'br_court_', S: BR_COURT, names: {
  bed: 'Chief\'s dais bed', throne: 'Skull throne', divan: 'Chief\'s divan', table: 'Mahogany feast table', low_table: 'Low mahogany table',
  desk: 'Chief\'s tally desk', cabinet: 'Bone-inlaid cabinet', bookcase: 'Trophy shelves', hearth: 'Great hearth', fire: 'Iron fire-bowl',
  lamp: 'Bone lamp stand', candelabra: 'Horn candelabra', hanging: 'Hanging torch cage', carpet: 'Great hide', screen: 'Carved screen',
  tapestry: 'Claw hanging', art: 'Great skull', statue: 'Skull pole', jug: 'Bone-inlaid ewer', bowl: 'Bone-inlaid bowl' },
  override: {
    throne: { name: 'Skull throne', w: 1.1, d: 0.9, h: 2.0, build: function (F, S, o) {
      FK.build.throne(F, S, Object.assign({}, o, { h: 1.3 }));
      const bone = F.col('boneIvory');
      F.blob(0, 1.6, -0.18, 0.25, 0.6, 0, bone, 'bone');                          /* the great skull crest */
      F.box(0, 1.22, -0.2, 0.4, 0.2, 0.3, 0, F.shade(bone, -0.08), 'bone');
      for (const s of [-1, 1]) { F.ball(s * 0.13, 1.68, -0.08, 0.07, F.col('mahoganyDark'), 'mahogany'); F.rod(s * 0.3, 1.8, -0.3, s * 0.52, 1.96, -0.38, 0.03, F.shade(bone, -0.12), 'bone'); }
    } }
  } });

FURN({
  key: 'br_court_saddle_stand', name: 'Beast saddle on its stand', culture: 'beast-rider', tier: 'court', type: 'rack', setting: 'both',
  rooms: ['hall', 'court', 'antechamber', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['hyperMahogany', 'hide', 'bone', 'metal'],
  w: 1.0, d: 1.6, h: 1.3, variants: 1,
  build: function (F) {
    const wood = F.col('mahoganyRed'), hide = F.col('hideOak'), bone = F.col('boneIvory');
    for (const s of [-1, 1]) { F.beam(s * 0.4, 0, -0.6, 0, 0.9, -0.6, 0.08, 0.08, wood, 'mahogany'); F.beam(s * 0.4, 0, 0.6, 0, 0.9, 0.6, 0.08, 0.08, wood, 'mahogany'); }
    F.box(0, 0.86, 0, 0.24, 0.12, 1.5, 0, wood, 'mahogany');
    F.box(0, 0.98, 0, 0.6, 0.12, 1.1, 0, hide, 'hide');                          /* the saddle */
    F.box(0, 1.1, -0.42, 0.5, 0.2, 0.14, 0, F.shade(hide, -0.1), 'hide');          /* cantle */
    F.frustum(0, 1.1, 0.4, 0.06, 0.03, 0.2, 0, bone, 'bone', 8);                 /* horn */
    for (const s of [-1, 1]) { F.box(s * 0.32, 0.5, 0.1, 0.06, 0.5, 0.4, 0, F.shade(hide, 0.08), 'hide'); F.box(s * 0.35, 0.44, 0.1, 0.12, 0.08, 0.18, 0, F.col('iron'), 'metal'); }
    for (let i = 0; i < 5; i++) F.ball(-0.2 + i * 0.1, 1.11, -0.5, 0.02, bone, 'bone');
  }
});

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed br_trade_<role> */
FK.set({ culture: 'beast-rider', tier: 'common', roles: 'trade', prefix: 'br_trade_', S: BR_COMMON, names: {
  forge: 'Clay-hood forge', anvil: 'Anvil on a root stump', trough: 'Dugout trough', stall: 'Beast stall', hayrack: 'Fodder rack', display: 'Lashed display steps', armour_stand: 'Hide-and-bone armour on a post', weapon_rack: 'Lance rack', vat: 'Dye vat', still: 'Gourd still', bin: 'Woven grain bins', larder: 'Hanging larder', bunk: 'Lashed bunk', locker: 'Hide locker', lathe: 'Bow lathe', press: 'Fruit press', kiln: 'Clay kiln', grindstone: 'Grindstone', barrel: 'Gourd and cask cradle', altar: 'Beast-spirit altar' } });

/* ======== Harvested from kits/catalog/krator-master-buildings-beast-rider.js, settlements/girder/src/55-arch.js, settlements/mavs-refuge/src/55-arch.js and 56-levels.js (61 pieces) ========
   The furniture the Beast Rider building builders and the Girder / Mav's Refuge dressing draw inline,
   keyed br_h_* (the br_* keys in krator-master-furniture.js are the earlier harvest; nothing here
   repeats them). Colours are the kits' own plank, timber, wall, thatch, ornate and cloth tones, as
   keys in the palette block above. BRH holds the kits' three small shared helpers, through F only:
   LANTERN() (Mav's 72-lights.js), pod() and bush() (both 55-arch.js). */
const BRH = {
  /* Mav's LANTERN(): timber cage, a glowing core turned inside it, a shingle cap, an optional cord up.
     y is the flame height; the piece spans y-0.28 .. y+0.48 (or the cord top) */
  lantern: function (F, x, y, z, hang, cool, cordR) {
    F.box(x, y - 0.28, z, 0.34, 0.5, 0.34, 0, F.col('timberSmoke'), 'wood');
    F.box(x, y - 0.2, z, 0.26, 0.34, 0.26, 0.78, F.col(cool ? 'glowCool' : 'glowWarm'), 'glow');
    F.pyrRoof(x, y + 0.22, z, 0.5, 0.26, 0.5, 0, F.col('shingleDark'), 'plank');
    if (hang) F.rod(x, y + 0.4, z, x, y + 0.4 + hang, z, cordR || 0.02, F.col('ropeJute'), 'rope');
    F.lamp(x, y, z, 0.9, 9);
  },
  /* a baobab pod: a diamond bipyramid, widest (radius r) at y + 0.5r, from y - 0.2r to y + 1.3r */
  pod: function (F, x, y, z, r, c) {
    F.frustum(x, y - 0.2 * r, z, 0.01, r * Math.SQRT1_2, 0.7 * r, Math.PI / 4, F.shade(c, -0.2), 'plant', 4);
    F.frustum(x, y + 0.5 * r, z, r * Math.SQRT1_2, 0.01, 0.8 * r, Math.PI / 4, c, 'plant', 4);
  },
  /* a bush: a six-sided flaring skirt to h*0.4, then a cone to h */
  bush: function (F, x, y, z, r, h, c) {
    F.frustum(x, y, z, r * 0.75, r, h * 0.4, 0, c, 'plant', 6);
    F.frustum(x, y + h * 0.4, z, r, 0.02, h * 0.6, 0, F.shade(c, 0.08), 'plant', 6);
  }
};

FURN({
  key: 'br_h_water_butt', name: 'Water butt', culture: 'beast-rider', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['yard', 'kitchen', 'stable', 'roost', 'store', 'street'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'rope'],
  source: 'kits/catalog/krator-master-buildings-beast-rider.js br_bldg_deck_lot (service clutter), br_bldg_girder_roost_deck (water butt + feed barrels)',
  w: 2.4, d: 1.6, h: 1.2, variants: 2, variantNames: ['hooped butt', 'butt and feed barrel'],
  variantDims: [{ w: 0.96, d: 0.96, h: 1.05 }, { w: 2.4, d: 1.6, h: 1.2 }],
  build: function (F) {
    if (F.variant === 1) {
      F.cyl(-0.65, 0, -0.25, 0.55, 1.2, 0, F.col('timberBark'), 'wood');
      F.cyl(0.75, 0, 0.35, 0.45, 0.9, 0, F.col('timberLeather'), 'wood');
      return;
    }
    F.cyl(0, 0, 0, 0.44, 1.05, 0, F.col('timberBark'), 'wood');
    F.cyl(0, 0.72, 0, 0.48, 0.1, 0, F.shade('ropeTwine', -0.1), 'rope');
  }
});

FURN({
  key: 'br_h_hanging_gourds', name: 'Hanging gourds', culture: 'beast-rider', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['kitchen', 'store', 'living', 'tavern', 'yard', 'market'], anchor: 'ceiling', clearance: {},
  materials: ['timber', 'rope'],
  source: 'kits/catalog/krator-master-buildings-beast-rider.js br_bldg_deck_lot (gourds under the eave), br_bldg_room_front v2, br_bldg_girder_house v0',
  w: 1.82, d: 0.52, h: 1.22, variants: 2, variantNames: ['one gourd', 'three gourds'],
  variantDims: [{ w: 0.48, d: 0.48, h: 1.02 }, { w: 1.82, d: 0.52, h: 1.22 }],
  build: function (F) {
    const rope = F.col('ropeTwine'), tones = ['gourdPale', 'gourdGreen', 'gourdRust'];
    if (F.variant === 0) {
      F.rod(0, 1.02, 0, 0, 0.47, 0, 0.03, rope, 'rope');
      F.ball(0, 0.24, 0, 0.24, F.pick(tones), 'wood');
      return;
    }
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.65, drop = [0.45, 0.65, 0.5][i], top = 1.22;
      F.rod(x, top, 0, x, top - drop, 0, 0.03, rope, 'rope');
      F.ball(x, top - drop - 0.25, 0, 0.26, F.pick(tones), 'wood');
    }
  }
});

FURN({
  key: 'br_h_wall_ladder', name: 'Lashed ladder', culture: 'beast-rider', tier: 'common', type: 'ladder', setting: 'both',
  rooms: ['yard', 'store', 'stable', 'roost', 'workshop', 'barracks'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber'],
  source: 'kits/catalog/krator-master-buildings-beast-rider.js br_bldg_deck_lot (wall ladder), br_bldg_roost_gallery (perch ladder), br_bldg_girder_palisade (step ladder)',
  w: 1.04, d: 0.94, h: 6.6, variants: 3, variantNames: ['wall ladder', 'perch ladder', 'leaning step ladder'],
  variantDims: [{ w: 0.81, d: 0.12, h: 4.7 }, { w: 1.04, d: 0.14, h: 6.6 }, { w: 0.94, d: 0.94, h: 2.0 }],
  build: function (F) {
    const post = F.col('timberBistre'), rung = F.shade(post, 0.1);
    if (F.variant === 2) {
      for (const x of [-0.4, 0.4]) F.rod(x, 0.08, 0.4, x, 1.93, -0.4, 0.07, post, 'wood');
      for (let i = 0; i < 3; i++) { const t = (i + 1) / 4; F.rod(-0.4, 0.08 + t * 1.85, 0.4 - t * 0.8, 0.4, 0.08 + t * 1.85, 0.4 - t * 0.8, 0.04, rung, 'wood'); }
      return;
    }
    const big = F.variant === 1, hw = big ? 0.45 : 0.35, H = big ? 6.6 : 4.7, r = big ? 0.07 : 0.055;
    for (const x of [-hw, hw]) F.rod(x, 0, 0, x, H, 0, r, post, 'wood');
    const n = big ? 5 : 4, y0 = big ? 0.9 : 0.7, dy = big ? 1.2 : 1.1;
    for (let i = 0; i < n; i++) F.rod(-hw, y0 + i * dy, 0, hw, y0 + i * dy, 0, big ? 0.04 : 0.035, rung, 'wood');
  }
});

FURN({
  key: 'br_h_hanging_lantern', name: 'Hanging lantern', culture: 'beast-rider', tier: 'common', type: 'lamp', setting: 'both',
  rooms: ['hall', 'tavern', 'shrine', 'kitchen', 'workshop', 'living', 'market', 'street', 'plaza', 'roost'], anchor: 'ceiling', clearance: {},
  materials: ['timber', 'rope', 'emissive'],
  source: 'kits/catalog/krator-master-buildings-beast-rider.js br_bldg_nature_shrine (lanterns from the eave); settlements/mavs-refuge/src/72-lights.js LANTERN; mavs-refuge/src/55-arch.js the rain canopy\'s great lanterns',
  w: 0.92, d: 0.92, h: 2.3, variants: 3, variantNames: ['glow lantern on a cord', 'framed lantern', 'great canopy lantern'],
  variantDims: [{ w: 0.44, d: 0.44, h: 0.95 }, { w: 0.5, d: 0.5, h: 1.18 }, { w: 0.92, d: 0.92, h: 2.3 }],
  build: function (F) {
    if (F.variant === 0) {
      F.rod(0, 0.95, 0, 0, 0.35, 0, 0.026, F.col('ropeTwine'), 'rope');
      F.box(0, 0, 0, 0.34, 0.36, 0.34, 0.3, F.col('amber'), 'glow');
      F.lamp(0, 0.18, 0, 0.9, 9);
    } else if (F.variant === 1) {
      BRH.lantern(F, 0, 0.28, 0, 0.5, false, 0.03);
    } else {
      F.box(0, 0, 0, 0.7, 0.9, 0.7, 0.4, F.col('glowWarm'), 'glow');
      BRH.lantern(F, 0, 0.9, 0, 1.0, false, 0.03);
      F.lamp(0, 0.45, 0, 1.3, 14);
    }
  }
});

FURN({
  key: 'br_h_lamp_bracket', name: 'Wall lantern bracket', culture: 'beast-rider', tier: 'common', type: 'lamp', setting: 'both',
  rooms: ['street', 'hall', 'tavern', 'shop', 'living', 'store', 'roost'], anchor: 'wall', clearance: {},
  materials: ['timber', 'rope', 'emissive'],
  source: 'kits/catalog/krator-master-buildings-beast-rider.js br_bldg_room_front v0 (lamp bracket); settlements/girder/src/55-arch.js buildDwelling (a lantern by the door)',
  w: 0.5, d: 0.76, h: 3.5, variants: 2, variantNames: ['glow lantern on an arm', 'framed lantern on a bracket'],
  variantDims: [{ w: 0.34, d: 0.76, h: 3.5 }, { w: 0.5, d: 0.5, h: 2.85 }],
  build: function (F) {
    const wood = F.col('timberBistre');
    if (F.variant === 0) {
      /* a mounting plank on the wall, the arm out 0.55 m, the lantern hung under its end */
      F.box(0, 2.6, -0.355, 0.12, 0.9, 0.05, 0, F.shade(wood, -0.1), 'wood');
      F.rod(0, 3.3, -0.33, 0, 3.3, 0.22, 0.03, wood, 'wood');
      F.rod(0, 3.3, 0.22, 0, 3.26, 0.22, 0.015, F.col('ropeTwine'), 'rope');
      F.box(0, 2.9, 0.22, 0.32, 0.36, 0.32, 0, F.col('amber'), 'glow');
      F.lamp(0, 3.08, 0.22, 0.8, 10);
      return;
    }
    F.box(0, 2.1, -0.23, 0.16, 0.75, 0.04, 0, F.shade(wood, -0.1), 'wood');
    F.box(0, 2.62, -0.07, 0.06, 0.06, 0.32, 0, F.col('timberBistre'), 'wood');
    BRH.lantern(F, 0, 2.35, 0, 0, false);
  }
});

FURN({
  key: 'br_h_offering_bowl', name: 'Offering bowl', culture: 'beast-rider', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['shrine', 'temple', 'hall'], anchor: 'surface', clearance: {},
  materials: ['timber', 'gold', 'emissive'],
  source: 'kits/catalog/krator-master-buildings-beast-rider.js br_bldg_nature_shrine (offering bowls); settlements/mavs-refuge/src/56-levels.js the carved shrine front (offering bowls)',
  w: 0.56, d: 0.56, h: 0.2, variants: 2, variantNames: ['wooden bowl', 'brass bowl with a votive flame'],
  variantDims: [{ w: 0.56, d: 0.56, h: 0.2 }, { w: 0.4, d: 0.4, h: 0.14 }],
  build: function (F) {
    if (F.variant === 1) {
      F.frustum(0, 0, 0, 0.1, 0.2, 0.13, 0, F.shade('gilt', -0.1), 'gold', 5);
      F.cyl(0, 0.13, 0, 0.17, 0.01, 0, F.col('glowCool'), 'glow');
      F.lamp(0, 0.3, 0, 0.5, 5);
      return;
    }
    const c = F.pick(['timberMud', 'shingleBrown']);
    F.cyl(0, 0, 0, 0.28, 0.2, 0, c, 'wood');
    F.cyl(0, 0.19, 0, 0.23, 0.01, 0, F.shade(c, -0.3), 'wood');
  }
});

FURN({
  key: 'br_h_offering_stone', name: 'Offering stone with a pod', culture: 'beast-rider', tier: 'common', type: 'shrine', setting: 'both',
  rooms: ['shrine', 'temple', 'garden', 'yard'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['stone', 'foliage'],
  source: 'settlements/girder/src/55-arch.js buildDwelling (shrine: the offering stump and its pod)',
  w: 0.7, d: 0.7, h: 0.77, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.35, 0.5, 0, F.col('stoneSlate'), 'stone');
    BRH.pod(F, 0, 0.53, 0, 0.16, F.pick(['fruitOrange', 'fruitAmber', 'fruitGold']));
  }
});

FURN({
  key: 'br_h_standing_stone', name: 'Standing stone with pod offerings', culture: 'beast-rider', tier: 'common', type: 'shrine', setting: 'both',
  rooms: ['shrine', 'temple', 'garden', 'plaza'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'foliage'],
  source: 'settlements/mavs-refuge/src/55-arch.js RING BUILDINGS (nature shrine: the living heart, standing stone)',
  w: 2.92, d: 2.92, h: 3.2, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.85, 0.5, 2.7, 0, F.shade('stoneSlate', 0.05), 'stone', 6);
    F.frustum(0, 2.7, 0, 0.5, 0.05, 0.5, 0, F.col('stoneAsh'), 'stone', 6);
    const fruit = ['fruitOrange', 'fruitAmber', 'fruitGold'];
    for (let k = 0; k < 5; k++) { const a = k / 5 * F.TAU; BRH.pod(F, Math.cos(a) * 1.3, 0.04, Math.sin(a) * 1.3, 0.16, F.col(fruit[k % 3])); }
  }
});

FURN({
  key: 'br_h_shrine_drum', name: 'Shrine drum: idol or sapling, with bowls', culture: 'beast-rider', tier: 'common', type: 'shrine', setting: 'both',
  rooms: ['shrine', 'temple', 'hall'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'gold', 'emissive', 'foliage'],
  source: 'settlements/mavs-refuge/src/56-levels.js the carved shrine front (idol or sapling on a drum, offering bowls at its foot)',
  w: 1.3, d: 1.18, h: 2.17, variants: 2, variantNames: ['carved idol', 'sapling'],
  variantDims: [{ w: 1.3, d: 1.18, h: 1.7 }, { w: 1.3, d: 1.18, h: 2.17 }],
  build: function (F) {
    const col = F.col('hideOak'), z = -0.17;
    F.frustum(0, 0, z, 0.42, 0.36, 0.7, 0, F.shade(col, 0.08), 'wood', 6);
    if (F.variant === 1) {
      F.rod(0, 0.7, z, 0.04, 1.5, z + 0.03, 0.04, F.col('barkUmber'), 'wood');
      F.blob(0.02, 1.75, z, 0.43, 0.84, 0, F.col('saplingGreen'), 'plant');
    } else {
      F.frustum(0, 0.7, z, 0.22, 0.13, 0.6, 0, F.shade(col, -0.2), 'wood', 5);
      F.blob(0, 1.5, z, 0.2, 0.4, 0, F.shade(col, -0.1), 'wood');
    }
    for (let k = 0; k < 3; k++) {
      const x = (k - 1) * 0.45;
      F.frustum(x, 0, 0.38, 0.1, 0.2, 0.13, 0, F.shade('gilt', -0.1), 'gold', 5);
      F.cyl(x, 0.13, 0.38, 0.17, 0.01, 0, k === 1 ? F.col('glowCool') : F.shade('gilt', -0.5), k === 1 ? 'glow' : 'gold');
    }
    F.lamp(0, 0.4, 0.45, 0.5, 5);
  }
});

FURN({
  key: 'br_h_shrine_sapling', name: 'Shrine sapling', culture: 'beast-rider', tier: 'common', type: 'planter', setting: 'both',
  rooms: ['shrine', 'temple', 'garden', 'plaza', 'court'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'foliage'],
  source: 'kits/catalog/krator-master-buildings-beast-rider.js br_bldg_nature_shrine (a young sapling in a pot); settlements/mavs-refuge/src/55-arch.js RING BUILDINGS (nature shrine: the sapling in its plank ring)',
  w: 2.6, d: 2.6, h: 3.9, variants: 2, variantNames: ['potted sapling', 'sapling in a plank ring'],
  variantDims: [{ w: 0.84, d: 0.84, h: 1.79 }, { w: 2.6, d: 2.6, h: 3.9 }],
  build: function (F) {
    if (F.variant === 0) {
      F.cyl(0, 0, 0, 0.42, 0.4, 0, F.col('timberLeather'), 'wood');
      F.rod(0, 0.4, 0, 0, 1.44, 0, 0.05, F.col('timberBistre'), 'wood');
      F.blob(0, 1.54, 0, 0.42, 0.5, 0, F.col('leafJade'), 'plant');
      return;
    }
    /* the plank ring: twelve tangent boards between r 1.0 and 1.3 */
    const n = 12, plank = F.col('plankSand');
    for (let i = 0; i < n; i++) {
      const a = (i + 0.5) / n * F.TAU, r = 1.15;
      F.box(Math.cos(a) * r, 0, Math.sin(a) * r, 2 * 1.0 * Math.sin(Math.PI / n) + 0.04, 0.35, 0.3, -a - Math.PI / 2, F.shade(plank, (i % 2) * 0.05), 'plank');
    }
    F.cyl(0, 0, 0, 0.16, 2.2, 0, F.col('timberBistre'), 'wood');
    BRH.bush(F, 0, 2.0, 0, 1.3, 1.9, F.col('saplingGreen'));
    BRH.bush(F, 0.5, 1.5, -0.4, 0.8, 1.2, F.col('fernGreen'));
  }
});

FURN({
  key: 'br_h_cloth_line', name: 'Drying line', culture: 'beast-rider', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['yard', 'workshop', 'roost', 'street', 'garden'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'cloth', 'rope'],
  source: 'settlements/mavs-refuge/src/55-arch.js dryRack(), RING BUILDINGS (silk-house frames); settlements/girder/src/55-arch.js yardLine()',
  w: 5.62, d: 0.12, h: 2.53, variants: 3, variantNames: ['drying frame', 'washing line', 'silk drying frame'],
  variantDims: [{ w: 3.4, d: 0.12, h: 2.3 }, { w: 5.62, d: 0.12, h: 2.5 }, { w: 3.12, d: 0.12, h: 2.53 }],
  build: function (F) {
    const post = F.col('timberBistre'), bar = F.col('timberCocoa');
    const cloths = ['lacquerDeep', 'clothRust', 'clothForest', 'clothMustard', 'clothPlum', 'clothTerracotta'];
    if (F.variant === 1) {
      for (const x of [-2.75, 2.75]) F.box(x, 0, 0, 0.12, 2.5, 0.12, 0, bar, 'wood');
      F.rod(-2.75, 2.4, 0, 2.75, 2.4, 0, 0.015, F.col('ropeHemp'), 'rope');
      const n = 3 + Math.floor(F.rnd() * 3);
      for (let j = 0; j < n; j++) {
        const t = (j + 0.7) / (n + 0.4), dr = F.rr(0.6, 1.1), cw = F.rr(0.5, 0.9);
        F.box(-2.25 + 4.5 * t, 2.4 - dr, 0, cw, dr, 0.03, 0, F.chance(0.3) ? F.col('silkGrey') : F.pick(cloths), 'cloth');
      }
      return;
    }
    const silk = F.variant === 2, hw = silk ? 1.5 : 1.6, H = silk ? 2.5 : 2.3, barY = silk ? 2.45 : 2.2;
    for (const x of [-hw, hw]) F.box(x, 0, 0, 0.12, H, 0.12, 0, post, 'wood');
    F.box(0, barY, 0, silk ? 3.0 : 3.4, 0.08, 0.08, 0, bar, 'wood');
    for (let i = 0; i < 3; i++) {
      if (silk) F.box((i - 1) * 0.95, 0.55, 0, 0.8, 1.9, 0.04, 0, F.col(['silkWhite', 'clothMustard', 'silkGrey'][i]), 'cloth');
      else { const L = F.rr(1.2, 1.7); F.box(-1.0 + i, barY - L, 0, 0.8, L, 0.04, 0, F.pick(['clothRust', 'clothTerracotta', 'clothMustard']), 'cloth'); }
    }
  }
});

FURN({
  key: 'br_h_perch_bar', name: 'Perch log on posts', culture: 'beast-rider', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['roost', 'stable', 'yard'], anchor: 'floor', clearance: { front: 1.0, back: 1.0 },
  materials: ['timber'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlRoost (landing lip: the perch log on its posts); kits/catalog/krator-master-buildings-beast-rider.js br_bldg_roost_gallery (claw-scored perch rails)',
  w: 5.0, d: 0.4, h: 0.92, variants: 3, variantNames: ['small perch', 'roost perch', 'great perch'],
  variantDims: [{ w: 2.0, d: 0.3, h: 0.87 }, { w: 3.0, d: 0.3, h: 0.87 }, { w: 5.0, d: 0.4, h: 0.92 }],
  build: function (F) {
    const W = [2.0, 3.0, 5.0][F.variant], r = F.variant === 2 ? 0.2 : 0.15;
    for (const s of [-1, 1]) F.box(s * W * 0.42, 0, 0, 0.24, 0.75, 0.24, 0, F.col('timberCocoa'), 'wood');
    const log = F.col('timberTawny');
    F.rod(-W / 2, 0.72, 0, W / 2, 0.72, 0, r, log, 'wood');
    /* claw wear on the top of the log */
    const n = Math.round(W / 1.2);
    for (let i = 0; i < n; i++) F.box(-W / 2 + (i + 0.5) * W / n, 0.72 + r - 0.04, 0, 0.35, 0.05, r * 1.1, F.rr(-0.1, 0.1), F.shade(log, -0.32), 'wood');
  }
});

FURN({
  key: 'br_h_feed_basket', name: 'Hanging feed basket', culture: 'beast-rider', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['roost', 'stable', 'store', 'kitchen'], anchor: 'ceiling', clearance: {},
  materials: ['wicker', 'rope'],
  source: 'kits/catalog/krator-master-buildings-beast-rider.js br_bldg_roost_gallery (hanging feed baskets)',
  w: 0.94, d: 0.94, h: 1.6, variants: 1,
  build: function (F) {
    const c = F.pick(['clothWheat', 'thatchDun']);
    F.rod(0, 1.6, 0, 0, 0.6, 0, 0.03, F.col('ropeTwine'), 'rope');
    F.cyl(0, 0, 0, 0.45, 0.6, 0, c, 'wicker');
    F.cyl(0, 0.54, 0, 0.47, 0.06, 0, F.shade(c, -0.15), 'wicker');
  }
});

FURN({
  key: 'br_h_nest', name: 'Beast nest', culture: 'beast-rider', tier: 'common', type: 'bed', setting: 'both',
  rooms: ['roost', 'stable'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['thatch'],
  source: 'kits/catalog/krator-master-buildings-beast-rider.js br_bldg_roost_gallery (thatch nest bundles); settlements/mavs-refuge/src/56-levels.js lvlRoost (nest)',
  w: 4.76, d: 5.5, h: 1.2, variants: 3, variantNames: ['thatch nest bundle', 'roost nest', 'great roost nest'],
  variantDims: [{ w: 2.0, d: 2.0, h: 1.2 }, { w: 3.3, d: 3.8, h: 0.42 }, { w: 4.76, d: 5.5, h: 0.42 }],
  build: function (F) {
    if (F.variant === 0) { F.cone(0, 0, 0, 1.0, 1.2, 0.3, F.col('leafOchre'), 'thatch'); return; }
    const nr = F.variant === 2 ? 2.4 : 1.55, c = F.pick(['thatchStraw', 'thatchHay', 'thatchPale', 'thatchDun']);
    F.frustum(0, 0, 0, nr + 0.35, nr - 0.1, 0.42, 0, c, 'thatch', 6);
    F.cyl(0, 0.42, 0, nr - 0.3, 0.01, 0, F.shade('thatchOld', -0.3), 'thatch');
  }
});

FURN({
  key: 'br_h_straw_bedding', name: 'Straw bedding', culture: 'beast-rider', tier: 'common', type: 'bed', setting: 'both',
  rooms: ['roost', 'stable'], anchor: 'floor', clearance: {},
  materials: ['thatch'],
  source: 'settlements/girder/src/55-arch.js ROOST STALLS (straw mats and a heap in a back corner)',
  w: 4.3, d: 3.3, h: 0.75, variants: 1,
  build: function (F) {
    const tones = ['thatchStraw', 'thatchHay', 'thatchPale', 'thatchOld', 'thatchDun'];
    const mats = [[-0.9, -0.55], [0.9, -0.55], [-0.9, 0.55], [0.9, 0.55], [0, 0]];
    for (let i = 0; i < mats.length; i++) {
      F.box(mats[i][0], 0.01, mats[i][1], F.rr(1.8, 2.0), F.rr(0.05, 0.13), F.rr(1.4, 1.6), F.rr(-0.25, 0.25), F.shade(F.pick(tones), F.rr(-0.1, 0.12)), 'thatch');
    }
    F.frustum(1.1, 0, -0.6, 1.0, 0.15, 0.75, 0, F.col('thatchPale'), 'thatch', 7);
  }
});

FURN({
  key: 'br_h_hay_bales', name: 'Hay bales', culture: 'beast-rider', tier: 'common', type: 'stack', setting: 'both',
  rooms: ['stable', 'roost', 'store', 'yard'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['thatch'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlRoost (hay bales); settlements/girder/src/55-arch.js ROOST STALLS (two stacked bales)',
  w: 1.7, d: 1.2, h: 1.15, variants: 3, variantNames: ['one bale', 'two stacked', 'bale and a stack'],
  variantDims: [{ w: 1.2, d: 0.8, h: 0.6 }, { w: 1.22, d: 0.89, h: 1.15 }, { w: 1.7, d: 1.2, h: 1.15 }],
  build: function (F) {
    const tones = ['thatchStraw', 'thatchHay', 'thatchPale', 'thatchOld', 'thatchDun'];
    if (F.variant === 0) { F.box(0, 0, 0, 1.2, 0.6, 0.8, 0, F.pick(tones), 'thatch'); return; }
    if (F.variant === 1) {
      F.box(0, 0, 0, 1.1, 0.6, 0.7, 0, F.col('thatchStraw'), 'thatch');
      F.box(0, 0.6, 0, 1.0, 0.55, 0.7, 0.2, F.col('thatchOld'), 'thatch');
      return;
    }
    F.box(-0.45, 0, 0, 0.8, 0.6, 1.2, 0, F.pick(tones), 'thatch');
    F.box(0.45, 0, 0, 0.8, 0.6, 1.2, 0, F.pick(tones), 'thatch');
    F.box(0.45, 0.6, 0.05, 0.8, 0.55, 1.1, 0, F.pick(tones), 'thatch');
  }
});

FURN({
  key: 'br_h_trough', name: 'Feed and water trough', culture: 'beast-rider', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['stable', 'roost', 'yard', 'smithy'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'thatch', 'plaster'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlRoost (trough), the gate trees\' water trough; settlements/girder/src/55-arch.js ROOST STALLS (trough along a partition)',
  w: 2.8, d: 0.9, h: 0.67, variants: 3, variantNames: ['fodder trough', 'water trough', 'great water trough'],
  variantDims: [{ w: 1.7, d: 0.6, h: 0.67 }, { w: 2.6, d: 0.7, h: 0.5 }, { w: 2.8, d: 0.9, h: 0.65 }],
  build: function (F) {
    if (F.variant === 0) {
      F.box(0, 0, 0, 1.7, 0.62, 0.6, 0, F.col('plankDark'), 'plank');
      F.box(0, 0.62, 0, 1.5, 0.05, 0.45, 0, F.col('cropPale'), 'thatch');
      return;
    }
    /* a plank box open at the top, water standing just under the rim */
    const big = F.variant === 2, L = big ? 2.8 : 2.6, D = big ? 0.9 : 0.7, H = big ? 0.65 : 0.5, t = 0.1;
    const c = F.col(big ? 'timberTawny' : 'plankDark');
    F.box(0, 0, 0, L, 0.12, D, 0, F.shade(c, -0.1), 'plank');
    for (const s of [-1, 1]) {
      F.box(0, 0, s * (D - t) / 2, L, H, t, 0, c, 'plank');
      F.box(s * (L - t) / 2, 0, 0, t, H, D - 2 * t, 0, F.shade(c, -0.06), 'plank');
    }
    F.box(0, H - 0.1, 0, L - 2 * t, 0.04, D - 2 * t, 0, F.col('waterGreen'), 'plaster');
  }
});

FURN({
  key: 'br_h_tack_rack', name: 'Tack rack with saddles', culture: 'beast-rider', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['stable', 'roost', 'store', 'yard', 'barracks'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber', 'hide', 'cloth', 'rope'],
  source: 'settlements/mavs-refuge/src/55-arch.js provingGround (tack racks: saddles on rails); settlements/girder/src/55-arch.js ROOST STALLS (tack rack: rail, saddles, blankets, hanging harness)',
  w: 3.3, d: 0.8, h: 1.83, variants: 2, variantNames: ['tack rail with three saddles', 'roost tack rack'],
  variantDims: [{ w: 3.3, d: 0.75, h: 1.52 }, { w: 2.2, d: 0.8, h: 1.83 }],
  build: function (F) {
    if (F.variant === 0) {
      for (const x of [-1.5, 1.5]) F.box(x, 0, 0, 0.14, 1.3, 0.14, 0, F.col('timberBistre'), 'wood');
      F.box(0, 1.2, 0, 3.3, 0.16, 0.16, 0, F.col('timberCocoa'), 'wood');
      const c = ['clothRust', 'timberTawny', 'lacquerDeep'];
      for (let s = 0; s < 3; s++) F.box(-1 + s, 1.3, 0, 0.55, 0.22, 0.75, 0, F.col(c[s]), 'hide');
      return;
    }
    for (const x of [-0.9, 0.9]) F.box(x, 0, 0, 0.14, 1.55, 0.14, 0, F.col('timberCocoa'), 'wood');
    F.box(0, 1.45, 0, 2.2, 0.12, 0.16, 0, F.col('timberBistre'), 'wood');
    const cloths = ['lacquerDeep', 'clothRust', 'clothForest', 'clothMustard', 'clothPlum', 'clothTerracotta'];
    for (let j = 0; j < 2; j++) {
      const x = j ? 0.5 : -0.5;
      F.box(x, 1.57, 0, 0.5, 0.26, 0.75, 0, F.shade('leatherBrown', j ? 0.1 : -0.05), 'hide');
      F.box(x, 0.95, 0, 0.62, 0.6, 0.8, 0, F.pick(cloths), 'cloth');
    }
    const ropes = ['ropeHemp', 'ropeJute'];
    for (let h = 0; h < 3; h++) F.rod(-0.8 + h * 0.8, 1.45, 0.15, -0.8 + h * 0.8 + F.rr(-0.1, 0.1), 0.45 + F.rr(0, 0.3), 0.2, 0.02, F.col(ropes[h % 2]), 'rope');
  }
});

FURN({
  key: 'br_h_saddle_trestle', name: 'Saddle on a trestle', culture: 'beast-rider', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['workshop', 'shop', 'stable', 'store'], anchor: 'floor', clearance: { front: 0.6, left: 0.3, right: 0.3 },
  materials: ['timber', 'hide'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (saddler: saddle trees on A-legs)',
  w: 1.45, d: 0.9, h: 1.44, variants: 1,
  build: function (F) {
    const legs = F.col('timberBistre');
    F.beam(-0.7, 1.0, 0, 0.7, 1.0, 0, 0.22, 0.22, F.col('timberTawny'), 'wood');
    for (const x of [-0.6, 0.6]) {
      F.beam(x, 0, -0.4, x, 1.0, 0, 0.1, 0.1, legs, 'wood');
      F.beam(x, 0, 0.4, x, 1.0, 0, 0.1, 0.1, legs, 'wood');
    }
    const leather = F.shade('clothRust', F.rr(-0.35, 0));
    F.box(0, 1.08, 0, 0.62, 0.22, 0.62, 0, leather, 'hide');
    F.box(0.26, 1.28, 0, 0.14, 0.16, 0.3, 0, F.shade('clothRust', -0.4), 'hide');
  }
});

FURN({
  key: 'br_h_hide_frame', name: 'Hide drying frame', culture: 'beast-rider', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['workshop', 'yard', 'shop', 'store'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'hide'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (saddler: hides stretched on frames)',
  w: 2.0, d: 0.1, h: 2.3, variants: 1,
  build: function (F) {
    const post = F.col('timberCocoa');
    for (const x of [-0.95, 0.95]) F.box(x, 0, 0, 0.1, 2.3, 0.1, 0, post, 'wood');
    F.beam(-1.0, 2.25, 0, 1.0, 2.25, 0, 0.1, 0.1, post, 'wood');
    const drop = F.rr(1.4, 1.8);
    F.box(0, 2.2 - drop, 0, 1.7, drop, 0.04, 0, F.shade(F.pick(['clothRust', 'clothTerracotta', 'wallReed']), -0.15), 'hide');
  }
});

FURN({
  key: 'br_h_hung_hide', name: 'Hung hide', culture: 'beast-rider', tier: 'common', type: 'banner', setting: 'both',
  rooms: ['hall', 'barracks', 'workshop', 'yard', 'stable', 'living'], anchor: 'wall', clearance: {},
  materials: ['timber', 'hide'],
  source: 'settlements/girder/src/55-arch.js GALLERY DRESSING (a banner / drying hide over the girder); kits/catalog/krator-master-buildings-beast-rider.js br_bldg_girder_palisade (hides on the outer face)',
  w: 1.6, d: 0.1, h: 3.08, variants: 2, variantNames: ['hide on a bar', 'pinned hide'],
  variantDims: [{ w: 1.6, d: 0.1, h: 3.08 }, { w: 0.9, d: 0.1, h: 2.2 }],
  build: function (F) {
    if (F.variant === 1) {
      const c = F.pick(['hideOak', 'clothVermilion', 'thatchDun']);
      F.box(0, 1.1, -0.03, 0.9, 1.1, 0.04, 0, c, 'hide');
      for (const x of [-0.35, 0.35]) F.cyl(x, 2.08, 0.0, 0.03, 0.06, 0, F.col('timberBistre'), 'wood');
      return;
    }
    const bl = F.rr(2.0, 2.6), bw = F.rr(1.0, 1.3);
    F.box(0, 3.0, -0.01, 1.6, 0.08, 0.08, 0, F.col('timberBistre'), 'wood');
    F.box(0, 3.0 - bl, -0.03, bw, bl, 0.04, 0, F.pick(['lacquerDeep', 'clothRust', 'clothForest', 'clothMustard', 'clothPlum', 'clothTerracotta']), 'hide');
  }
});

FURN({
  key: 'br_h_training_post', name: 'Training post', culture: 'beast-rider', tier: 'common', type: 'workstation', task: ['melee-training'], setting: 'both',
  rooms: ['yard', 'barracks', 'court'], anchor: 'floor', clearance: { front: 1.2, back: 1.2, left: 0.8, right: 0.8 },
  materials: ['timber', 'rope'],
  source: 'settlements/mavs-refuge/src/55-arch.js provingGround (training posts: padded pells and a quintain)',
  w: 2.2, d: 0.54, h: 2.3, variants: 2, variantNames: ['padded pell', 'quintain'],
  variantDims: [{ w: 0.54, d: 0.54, h: 2.3 }, { w: 2.2, d: 0.54, h: 2.3 }],
  build: function (F) {
    F.cyl(0, 0, 0, 0.16, 2.3, 0, F.pick(['timberBistre', 'timberCocoa', 'timberSmoke', 'timberTawny']), 'wood');
    F.cyl(0, 1.2, 0, 0.27, 0.7, 0, F.col('ropeJute'), 'rope');
    if (F.variant === 1) F.beam(-1.1, 1.95, 0, 1.1, 1.95, 0, 0.1, 0.1, F.col('timberBistre'), 'wood');
  }
});

FURN({
  key: 'br_h_viewing_stand', name: 'Viewing stand', culture: 'beast-rider', tier: 'common', type: 'seating', setting: 'outdoor',
  rooms: ['yard', 'plaza', 'court', 'market'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber', 'cloth'],
  source: 'settlements/mavs-refuge/src/55-arch.js provingGround (viewing stand)',
  w: 8.6, d: 4.25, h: 4.53, variants: 1,
  build: function (F) {
    F.shift(0, -0.1); /* centre the footprint on the origin */
    const planks = ['plankHoney', 'plankTan', 'plankSand'];
    for (let s = 0; s < 3; s++) F.box(0, 0, 1.2 - s * 1.2, 8, 0.5 + s * 0.55, 1.2, 0, F.col(planks[s]), 'plank');
    for (const x of [-3.9, 3.9]) {
      F.box(x, 0, -1.7, 0.16, 4.4, 0.16, 0, F.col('timberBistre'), 'wood');
      F.box(x, 0, 1.7, 0.16, 3.4, 0.16, 0, F.col('timberBistre'), 'wood');
    }
    F.beam(0, 4.5, -2.0, 0, 3.4, 2.2, 8.6, 0.06, F.col('clothBrick'), 'cloth');
  }
});

FURN({
  key: 'br_h_reviewing_dais', name: 'Reviewing dais', culture: 'beast-rider', tier: 'court', type: 'seating', setting: 'both',
  rooms: ['court', 'plaza', 'hall', 'yard'], anchor: 'floor', clearance: { front: 2.0 },
  materials: ['timber', 'cloth', 'gold', 'rope', 'emissive'],
  source: 'settlements/mavs-refuge/src/55-arch.js MAV\'S CROWN (the mustering ground: reviewing dais)',
  w: 11.4, d: 5.4, h: 5.25, variants: 1,
  build: function (F) {
    F.shift(0, -0.36); /* centre the footprint on the origin */
    F.box(0, 0, 0, 11, 0.9, 4.4, 0, F.col('plankTan'), 'plank');
    F.box(0, 0, 2.6, 5, 0.45, 0.9, 0, F.col('plankDark'), 'plank');
    const red = F.col('lacquerRed');
    for (const x of [-5.2, 5.2]) {
      F.box(x, 0.9, -1.9, 0.18, 4.2, 0.18, 0, red, 'wood');
      F.box(x, 0.9, 1.9, 0.18, 3.4, 0.18, 0, red, 'wood');
    }
    F.beam(0, 5.2, -2.3, 0, 4.2, 2.4, 11.4, 0.06, F.col('lacquerDeep'), 'cloth');
    /* the chief's seat: a timber block with a gilt back */
    F.box(0, 0.9, -0.8, 1.4, 1.5, 1.1, 0, F.col('timberSmoke'), 'wood');
    F.box(0, 2.4, -1.2, 1.6, 1.1, 0.2, 0, F.col('gilt'), 'gold');
    for (const x of [-4.4, 4.4]) BRH.lantern(F, x, 3.6, 1.9, 0.5, false);
  }
});

FURN({
  key: 'br_h_speaker_rostrum', name: 'Speaker\'s platform', culture: 'beast-rider', tier: 'court', type: 'desk', setting: 'both',
  rooms: ['court', 'plaza', 'hall'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber'],
  source: 'settlements/mavs-refuge/src/55-arch.js MAV\'S CROWN (the public plaza: speaker\'s platform)',
  w: 4.6, d: 5.25, h: 2.25, variants: 1,
  build: function (F) {
    F.shift(0, -0.325); /* centre the footprint on the origin */
    F.cyl(0, 0, 0, 2.3, 1.1, 0, F.col('plankTan'), 'plank');
    F.box(0, 0, 2.6, 1.6, 0.37, 0.7, 0, F.col('plankDark'), 'plank');
    F.box(0, 0, 2.1, 1.6, 0.74, 0.6, 0, F.col('plankDark'), 'plank');
    for (let rp = 0; rp < 7; rp++) { const a = (rp - 3) * 0.62; F.box(Math.sin(a) * 2.1, 1.1, -Math.cos(a) * 2.1, 0.12, 1.05, 0.12, -a, F.col('lacquerRed'), 'wood'); }
    F.box(0, 1.1, 1.2, 0.8, 1.15, 0.5, 0, F.col('timberSmoke'), 'wood');
  }
});

FURN({
  key: 'br_h_council_seat', name: 'Council seat', culture: 'beast-rider', tier: 'court', type: 'chair', setting: 'indoor',
  rooms: ['court', 'hall', 'antechamber'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'],
  source: 'settlements/mavs-refuge/src/55-arch.js THE COUNCIL CHAMBER (council seats round the wall)',
  w: 1.4, d: 1.08, h: 1.55, variants: 2, variantNames: ['red lacquer back', 'verdigris back'],
  build: function (F) {
    F.shift(0, 0.09); /* centre the footprint on the origin */
    F.box(0, 0, 0, 1.4, 0.55, 0.9, 0, F.col('lacquerDeep'), 'plank');
    F.box(0, 0.55, -0.55, 1.4, 1.0, 0.16, 0, F.col(F.variant === 1 ? 'verdigris' : 'lacquerRed'), 'plank');
  }
});

FURN({
  key: 'br_h_ring_bench', name: 'Assembly ring bench', culture: 'beast-rider', tier: 'court', type: 'bench', setting: 'indoor',
  rooms: ['hall', 'court', 'temple', 'school'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber'],
  source: 'settlements/girder/src/55-arch.js THE ASSEMBLY HALL (inside: a ring of benches, two tiers)',
  w: 4.8, d: 2.62, h: 0.79, variants: 1,
  build: function (F) {
    /* one 4 m arc of the hall's two-tier ring; the hall's centre lies 9.7 m to the front */
    const Zc = 9.7, A = 0.22, n = 6;
    const rings = [[8.6, 9.4, 0.44, 'plankSand'], [10.2, 11.0, 0.79, 'plankDark']];
    for (const R of rings) {
      const rm = (R[0] + R[1]) / 2, da = 2 * A / n;
      for (let i = 0; i < n; i++) {
        const a = -A + (i + 0.5) * da;
        F.box(rm * Math.sin(a), 0, Zc - rm * Math.cos(a), 2 * rm * Math.sin(da / 2) + 0.02, R[2], R[1] - R[0], -a, F.shade(R[3], (i % 2) * 0.04), 'plank');
      }
    }
  }
});

FURN({
  key: 'br_h_fire_pit', name: 'Fire pit', culture: 'beast-rider', tier: 'common', type: 'brazier', setting: 'both',
  rooms: ['yard', 'hall', 'kitchen', 'living', 'tavern', 'barracks'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['stone', 'emissive'],
  source: 'settlements/girder/src/55-arch.js GROUND HOUSES (round-hut compound fire pit), buildDwelling (common room hearth)',
  w: 1.5, d: 1.5, h: 0.49, variants: 2, variantNames: ['yard fire pit', 'common-room hearth'],
  variantDims: [{ w: 1.4, d: 1.4, h: 0.37 }, { w: 1.5, d: 1.5, h: 0.49 }],
  build: function (F) {
    if (F.variant === 1) {
      F.cyl(0, 0, 0, 0.75, 0.35, 0, F.col('stoneDusk'), 'stone');
      F.box(0, 0.35, 0, 0.7, 0.14, 0.7, 0.6, F.col('glowWarm'), 'glow');
      F.lamp(0, 1.0, 0, 1.0, 12);
      return;
    }
    F.cyl(0, 0, 0, 0.7, 0.25, 0, F.col('stoneAsh'), 'stone');
    F.box(0, 0.25, 0, 0.5, 0.12, 0.5, 0.5, F.col('glowWarm'), 'glow');
    F.lamp(0, 0.8, 0, 0.9, 12);
  }
});

FURN({
  key: 'br_h_speakers_hearth', name: 'Speaker\'s hearth', culture: 'beast-rider', tier: 'court', type: 'brazier', setting: 'indoor',
  rooms: ['hall', 'court', 'temple'], anchor: 'floor', clearance: { front: 1.0, back: 1.0, left: 1.0, right: 1.0 },
  materials: ['stone', 'emissive'],
  source: 'settlements/girder/src/55-arch.js THE ASSEMBLY HALL (the speaker\'s hearth)',
  w: 3.0, d: 3.0, h: 0.6, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 1.5, 0.4, 0, F.col('stoneCoal'), 'stone');
    F.box(0, 0.4, 0, 1.3, 0.2, 1.3, 0.5, F.col('glowWarm'), 'glow');
    F.lamp(0, 1.6, 0, 1.4, 18);
  }
});

FURN({
  key: 'br_h_kitchen_hearth', name: 'Hooded kitchen hearth', culture: 'beast-rider', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['kitchen', 'tavern', 'hall', 'living'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['stone', 'emissive'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlApt (shared kitchen: hearth at the back)',
  w: 2.2, d: 1.15, h: 3.4, variants: 1,
  build: function (F) {
    F.shift(0, -0.025); /* centre the footprint on the origin */
    F.box(0, 0, 0, 2.2, 1.0, 1.1, 0, F.col('stoneDusk'), 'stone');
    F.box(0, 1.0, -0.15, 1.3, 2.4, 0.7, 0, F.col('stoneCoal'), 'stone');
    F.box(0, 0.45, 0.35, 1.2, 0.4, 0.5, 0, F.col('glowWarm'), 'glow');
    F.lamp(0, 0.8, 0.9, 0.8, 12);
  }
});

FURN({
  key: 'br_h_smithy_forge', name: 'Smithy forge', culture: 'beast-rider', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['smithy', 'workshop'], anchor: 'floor', clearance: { front: 1.2 },
  materials: ['stone', 'timber', 'hide', 'emissive'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (smithy: forge, hood, flue, bellows); settlements/girder/src/55-arch.js buildDwelling (workshop: a forge in some)',
  w: 3.51, d: 2.9, h: 3.9, variants: 2, variantNames: ['hooded forge with bellows', 'stone forge with a box hood'],
  variantDims: [{ w: 3.51, d: 2.9, h: 3.9 }, { w: 1.5, d: 1.5, h: 3.3 }],
  build: function (F) {
    if (F.variant === 1) {
      F.box(0, 0, 0, 1.3, 0.9, 1.3, 0, F.shade('stoneCoal', -0.2), 'stone');
      F.box(0, 0.9, 0, 0.8, 0.12, 0.8, 0, F.col('glowWarm'), 'glow');
      F.box(0, 2.2, 0, 1.5, 1.1, 1.5, 0, F.shade('stoneCoal', -0.35), 'stone');
      F.lamp(0, 1.5, 0.6, 0.9, 11);
      return;
    }
    F.shift(0.497, 0); /* centre the footprint on the origin */
    F.box(0, 0, 0, 1.7, 0.95, 1.7, 0, F.col('stoneDusk'), 'stone');
    F.box(0, 0.95, 0, 1.1, 0.1, 1.1, 0, F.col('glowWarm'), 'glow');
    F.frustum(0, 2.0, 0, 1.45, 0.32, 1.5, 0, F.shade('timberSmoke', -0.4), 'wood', 6);
    F.box(0, 3.45, 0, 0.5, 0.45, 0.5, 0, F.shade('timberSmoke', -0.45), 'wood');
    F.box(-1.9, 0.5, -0.3, 0.7, 0.5, 1.5, 0, F.shade('clothRust', -0.3), 'hide');
    F.lamp(0, 1.5, 0.8, 1.2, 14);
  }
});

FURN({
  key: 'br_h_anvil_stump', name: 'Anvil on a block', culture: 'beast-rider', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['smithy', 'workshop'], anchor: 'floor', clearance: { front: 0.8, back: 0.5 },
  materials: ['timber', 'metal'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (smithy: anvil on its block)',
  w: 0.8, d: 0.5, h: 0.79, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.5, 0.55, 0.5, 0, F.col('timberBistre'), 'wood');
    F.box(0, 0.55, 0, 0.8, 0.24, 0.34, 0, F.col('ironDark'), 'metal');
  }
});

FURN({
  key: 'br_h_tool_wall', name: 'Tool shelf with hanging tools', culture: 'beast-rider', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['workshop', 'smithy', 'store', 'stable'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal'],
  source: 'kits/catalog/krator-master-buildings-beast-rider.js br_bldg_girder_dwelling v2 (tool rack on the back wall)',
  w: 6.0, d: 0.34, h: 2.2, variants: 1,
  build: function (F) {
    const wood = F.col('timberBistre');
    F.box(0, 1.2, -0.15, 6.0, 1.0, 0.04, 0, F.shade(wood, -0.1), 'wood');
    F.box(0, 2.1, 0, 6.0, 0.1, 0.34, 0, wood, 'wood');
    for (let i = 0; i < 5; i++) F.box(-2.4 + i * 1.2, 1.45, -0.08, 0.14, 0.62, 0.1, F.rr(-0.2, 0.2), F.col('ironGrey'), 'metal');
  }
});

FURN({
  key: 'br_h_workshop_shelves', name: 'Workshop shelf block', culture: 'beast-rider', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['workshop', 'store', 'kitchen', 'shop'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber'],
  source: 'settlements/girder/src/55-arch.js buildDwelling (workshop: racks along the back)',
  w: 1.7, d: 0.6, h: 1.9, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.05, 1.6, 1.9, 0.5, 0, F.col('timberCocoa'), 'wood');
    for (const y of [0.7, 1.3]) F.box(0, y, 0, 1.7, 0.06, 0.6, 0, F.col('plankTan'), 'plank');
  }
});

FURN({
  key: 'br_h_work_counter', name: 'Workshop counter', culture: 'beast-rider', tier: 'common', type: 'counter', setting: 'indoor',
  rooms: ['workshop', 'shop', 'store', 'market'], anchor: 'floor', clearance: { front: 0.8, back: 0.6 },
  materials: ['timber'],
  source: 'settlements/girder/src/55-arch.js buildDwelling (workshop: half-height counter; bench along the side)',
  w: 3.2, d: 0.9, h: 1.08, variants: 2, variantNames: ['half-height counter', 'plank workbench'],
  variantDims: [{ w: 3.1, d: 0.7, h: 1.08 }, { w: 3.2, d: 0.9, h: 0.85 }],
  build: function (F) {
    if (F.variant === 1) { F.box(0, 0, 0, 3.2, 0.85, 0.9, 0, F.col('plankSand'), 'plank'); return; }
    F.box(0, 0, 0, 2.9, 1.0, 0.5, 0, F.pick(['timberMudDark', 'crateTan', 'crateDark']), 'plank');
    F.box(0, 1.0, 0, 3.1, 0.08, 0.7, 0, F.col('plankHoney'), 'plank');
  }
});

FURN({
  key: 'br_h_plank_stack', name: 'Plank and stave stack', culture: 'beast-rider', tier: 'common', type: 'stack', setting: 'both',
  rooms: ['workshop', 'store', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (carpenter: stacked planks; cooper: staves)',
  w: 4.5, d: 1.0, h: 0.86, variants: 2, variantNames: ['timber stack', 'stave stack'],
  variantDims: [{ w: 4.5, d: 1.0, h: 0.86 }, { w: 2.2, d: 0.7, h: 0.47 }],
  build: function (F) {
    const planks = ['plankHoney', 'plankTan', 'plankSand', 'plankDark'];
    if (F.variant === 1) { for (let s = 0; s < 3; s++) F.box(0, s * 0.16, 0, 2.2, 0.15, 0.7 - s * 0.1, 0, F.col(planks[s]), 'plank'); return; }
    for (let p = 0; p < 4; p++) F.box(-p * 0.05, p * 0.22, 0, 4.5 - p * 0.4, 0.2, 1.0 - p * 0.12, 0, F.col(planks[p]), 'plank');
  }
});

FURN({
  key: 'br_h_shield_rack', name: 'Shield wall', culture: 'beast-rider', tier: 'common', type: 'weapon', setting: 'indoor',
  rooms: ['barracks', 'hall', 'smithy', 'shop', 'antechamber'], anchor: 'wall', clearance: {},
  materials: ['timber', 'hide'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (armourer: shield wall on a rack), the carved barracks and guard-post fronts (lvlShield)',
  w: 3.6, d: 0.2, h: 2.2, variants: 2, variantNames: ['shield board', 'single shield'],
  variantDims: [{ w: 3.6, d: 0.2, h: 2.2 }, { w: 0.66, d: 0.08, h: 2.08 }],
  build: function (F) {
    const cloths = ['lacquerDeep', 'clothRust', 'clothForest', 'clothMustard', 'clothPlum', 'clothTerracotta'];
    const boss = F.shade('timberSmoke', -0.4);
    if (F.variant === 1) {
      F.rod(0, 1.75, -0.04, 0, 1.75, -0.01, 0.33, F.shade(F.pick(cloths), -0.1), 'hide');
      F.rod(0, 1.75, -0.01, 0, 1.75, 0.02, 0.33 * 0.28, boss, 'wood');
      return;
    }
    F.box(0, 0, -0.04, 3.6, 2.2, 0.12, 0, F.col('timberSmoke'), 'plank');
    for (let sh = 0; sh < 4; sh++) {
      const x = (sh - 1.5) * 0.9, y = sh % 2 ? 1.0 : 1.65;
      F.rod(x, y, 0.02, x, y, 0.05, 0.42, F.shade(F.pick(cloths), -0.1), 'hide');
      F.rod(x, y, 0.05, x, y, 0.08, 0.42 * 0.28, boss, 'wood');
    }
  }
});

FURN({
  key: 'br_h_bow_table', name: 'Bow-stave table', culture: 'beast-rider', tier: 'common', type: 'weapon', setting: 'indoor',
  rooms: ['barracks', 'workshop', 'shop', 'smithy'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (armourer: a table with bow staves leant on it; lvlTable)',
  w: 2.8, d: 1.0, h: 2.5, variants: 1,
  build: function (F) {
    const planks = ['plankHoney', 'plankTan', 'plankSand', 'plankDark'];
    F.box(0, 0.8, 0, 2.8, 0.1, 1.0, 0, F.pick(planks), 'plank');
    for (const z of [-0.38, 0.38]) F.box(0, 0, z, 2.24, 0.8, 0.12, 0, F.col('timberBistre'), 'wood');
    for (let bw = 0; bw < 5; bw++) { const x = -1.0 + bw * 0.5; F.rod(x, 0.9, 0, x, 2.5, 0.2, 0.025, F.col(planks[bw % 4]), 'wood'); }
  }
});

FURN({
  key: 'br_h_arrow_barrel', name: 'Barrel of arrows', culture: 'beast-rider', tier: 'common', type: 'weapon', setting: 'indoor',
  rooms: ['barracks', 'smithy', 'shop', 'workshop'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (armourer: a barrel of arrows)',
  w: 0.61, d: 0.7, h: 1.5, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.35, 0.308, 0.8, 0, F.pick(['timberBistre', 'timberCocoa', 'timberSmoke', 'timberTawny']), 'plank', 6);
    for (let ar = 0; ar < 5; ar++) F.rod(0, 0.5, 0, F.rr(-0.15, 0.15), 1.5, F.rr(-0.15, 0.15), 0.012, F.col('plankSand'), 'wood');
  }
});

FURN({
  key: 'br_h_rope_coils', name: 'Rope coils', culture: 'beast-rider', tier: 'common', type: 'stack', setting: 'both',
  rooms: ['workshop', 'store', 'dock', 'yard', 'stable', 'roost'], anchor: 'floor', clearance: {},
  materials: ['rope'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (ropewalk: coils on the floor)',
  w: 2.16, d: 1.5, h: 0.53, variants: 2, variantNames: ['one coil', 'pile of coils'],
  variantDims: [{ w: 1.2, d: 1.2, h: 0.31 }, { w: 2.16, d: 1.5, h: 0.53 }],
  build: function (F) {
    const top = F.shade('ropeJute', -0.3);
    const coil = (x, y, z, r, h) => {
      F.frustum(x, y, z, r, r, h, 0, F.pick(['ropeHemp', 'ropeJute']), 'rope', 7);
      F.frustum(x, y + h, z, r * 0.97, r * 0.97, 0.01, 0, top, 'rope', 7);
    };
    if (F.variant === 0) { coil(0, 0, 0, 0.6, 0.3); return; }
    coil(-0.5, 0, -0.2, 0.55, 0.3);
    coil(0.6, 0, 0.25, 0.48, 0.25);
    coil(-0.45, 0.3, -0.15, 0.45, 0.22);
  }
});

FURN({
  key: 'br_h_rope_wheel', name: 'Rope-walk wheel', culture: 'beast-rider', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['workshop'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber', 'metal'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (ropewalk: the twisting wheel on its block)',
  w: 1.6, d: 0.65, h: 2.0, variants: 1,
  build: function (F) {
    F.shift(0, -0.075); /* centre the footprint on the origin */
    F.box(0, 0, 0, 1.6, 1.6, 0.5, 0, F.col('timberCocoa'), 'wood');
    F.rod(0, 1.2, 0.27, 0, 1.2, 0.33, 0.8, F.col('timberTawny'), 'wood');
    F.rod(0, 1.2, 0.2, 0, 1.2, 0.4, 0.06, F.col('ironDark'), 'metal');
  }
});

FURN({
  key: 'br_h_cloth_bolts', name: 'Cloth bolts', culture: 'beast-rider', tier: 'common', type: 'stack', setting: 'indoor',
  rooms: ['workshop', 'shop', 'store', 'market'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['cloth'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (weaver: bolts laid out on the floor)',
  w: 2.2, d: 1.3, h: 0.36, variants: 1,
  build: function (F) {
    const cloths = ['lacquerDeep', 'clothRust', 'clothForest', 'clothMustard', 'clothPlum', 'clothTerracotta'];
    const o = Math.floor(F.rnd() * 6);
    for (let bl = 0; bl < 5; bl++) F.box(-0.9 + bl * 0.45, 0, 0, 0.4, 0.36, 1.3, 0, F.col(cloths[(bl + o) % 6]), 'cloth');
  }
});

FURN({
  key: 'br_h_barrel_cluster', name: 'Barrel cluster', culture: 'beast-rider', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['store', 'tavern', 'kitchen', 'yard', 'market', 'dock'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber'],
  source: 'settlements/mavs-refuge/src/55-arch.js barrels()',
  w: 1.86, d: 1.85, h: 1.15, variants: 2, variantNames: ['two barrels', 'three barrels'],
  variantDims: [{ w: 1.86, d: 1.11, h: 1.15 }, { w: 1.86, d: 1.85, h: 1.15 }],
  build: function (F) {
    const tones = ['timberBistre', 'timberCocoa', 'timberSmoke'];
    F.shift(-0.443, F.variant === 1 ? 0.304 : -0.069); /* centre the footprint on the origin */
    F.cyl(0, 0, 0, 0.483, 1.15, 0, F.pick(tones), 'wood');
    F.cyl(0.95, 0, 0.2, 0.42, 1.0, 0, F.pick(tones), 'wood');
    if (F.variant === 1) F.cyl(0.4, 0, -0.85, 0.378, 0.9, 0, F.pick(tones), 'wood');
  }
});

FURN({
  key: 'br_h_crate_stack', name: 'Crate stack', culture: 'beast-rider', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['store', 'market', 'shop', 'dock', 'yard'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber'],
  source: 'settlements/mavs-refuge/src/55-arch.js MAV\'S CROWN (stores of crates between the market rows), crate(); settlements/girder/src/55-arch.js buildDwelling (store: goods stacked in the recess)',
  w: 3.33, d: 2.23, h: 1.36, variants: 2, variantNames: ['market crate pile', 'two crates'],
  variantDims: [{ w: 3.33, d: 2.23, h: 1.36 }, { w: 0.85, d: 0.85, h: 0.98 }],
  build: function (F) {
    const tones = ['timberMudDark', 'crateTan', 'crateDark'];
    if (F.variant === 1) {
      F.box(0, 0, 0, 0.7, 0.56, 0.7, F.rr(-0.2, 0.2), F.pick(tones), 'plank');
      F.box(0, 0.56, 0, 0.525, 0.42, 0.525, F.rr(-0.4, 0.4), F.pick(tones), 'plank');
      return;
    }
    F.shift(0, -0.05); /* centre the footprint on the origin */
    const at = [[-1, -0.4], [0, -0.4], [1, -0.4], [-1, 0.5]];
    for (let c = 0; c < 4; c++) F.box(at[c][0], 0, at[c][1], 0.95, 0.76, 0.95, c * 0.3, F.pick(tones), 'plank');
    F.box(-1, 0.76, 0.5, 0.75, 0.6, 0.75, 1.2, F.pick(tones), 'plank');
  }
});

FURN({
  key: 'br_h_sack_pile', name: 'Sacks', culture: 'beast-rider', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['store', 'kitchen', 'market', 'shop'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['cloth'],
  source: 'settlements/girder/src/55-arch.js buildDwelling (store: sacks); settlements/mavs-refuge/src/56-levels.js lvlStore (sacks seen through the doorway, lvlSac)',
  w: 1.1, d: 1.05, h: 1.14, variants: 2, variantNames: ['bagged sacks', 'round sacks'],
  variantDims: [{ w: 0.82, d: 0.69, h: 0.75 }, { w: 1.1, d: 1.05, h: 1.14 }],
  build: function (F) {
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.8, 0.4, 0.55, 0, F.col('clothRust'), 'cloth');
      F.box(0, 0.4, 0, 0.7, 0.35, 0.5, 0.3, F.shade('clothRust', 0.12), 'cloth');
      return;
    }
    F.shift(-0.08, -0.055); /* centre the footprint on the origin */
    const tones = ['wallWicker', 'wallReed', 'wallFlax', 'wallKhaki', 'wallCream'];
    F.blob(0, 0.34, 0, 0.47, 0.68, 0, F.pick(tones), 'cloth');
    F.blob(0.2, 0.84, 0.15, 0.43, 0.6, 0.5, F.pick(tones), 'cloth');
  }
});

FURN({
  key: 'br_h_pottery_kiln', name: 'Pottery kiln', culture: 'beast-rider', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 1.2 },
  materials: ['stone', 'timber', 'emissive'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (potter: kiln with a glowing mouth and its flue)',
  w: 2.7, d: 2.72, h: 3.45, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 1.35, 1.25, 1.7, 0, F.col('stoneSlate'), 'stone', 8);
    F.frustum(0, 1.7, 0, 1.25, 0.35, 1.0, 0, F.col('stoneAsh'), 'stone', 8);
    F.box(0, 0.3, 1.3, 0.7, 0.6, 0.12, 0, F.col('glowWarm'), 'glow');
    F.box(0, 2.7, 0, 0.5, 0.75, 0.5, 0, F.shade('timberSmoke', -0.45), 'wood');
    F.lamp(0, 0.8, 1.7, 0.9, 12);
  }
});

FURN({
  key: 'br_h_potters_wheel', name: 'Potter\'s wheel', culture: 'beast-rider', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['workshop'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (potter: the wheel)',
  w: 1.1, d: 1.1, h: 0.78, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.2, 0.2, 0.7, 0, F.col('timberBistre'), 'wood', 6);
    F.frustum(0, 0.7, 0, 0.55, 0.55, 0.08, 0, F.col('plankSand'), 'plank', 8);
  }
});

FURN({
  key: 'br_h_pot_shelf', name: 'Pot shelves', culture: 'beast-rider', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['workshop', 'shop', 'kitchen', 'store'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'ceramic'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlWork (potter: three shelves of pots)',
  w: 3.08, d: 0.5, h: 2.3, variants: 1,
  build: function (F) {
    for (const x of [-1.5, 1.5]) F.box(x, 0, 0, 0.08, 2.0, 0.5, 0, F.col('timberCocoa'), 'wood');
    for (let sf = 0; sf < 3; sf++) {
      F.box(0, 0.6 + sf * 0.65, 0, 3.0, 0.06, 0.5, 0, F.col('plankTan'), 'plank');
      for (let pt = 0; pt < 4; pt++) F.frustum((pt - 1.5) * 0.7, 0.66 + sf * 0.65, 0, 0.17, 0.1, 0.34, 0, F.shade('clothTerracotta', F.rr(-0.3, 0.2)), 'ceramic', 5);
    }
  }
});

FURN({
  key: 'br_h_planter_box', name: 'Planter box', culture: 'beast-rider', tier: 'common', type: 'planter', setting: 'both',
  rooms: ['garden', 'yard', 'street', 'plaza', 'market', 'court', 'living'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'foliage'],
  source: 'settlements/mavs-refuge/src/55-arch.js planter(), RING BUILDINGS (a planter by a home); settlements/girder/src/55-arch.js buildDwelling (home: planter by the door)',
  w: 2.75, d: 1.4, h: 1.75, variants: 3, variantNames: ['long planter', 'house planter', 'small planter'],
  variantDims: [{ w: 2.75, d: 1.4, h: 1.75 }, { w: 1.8, d: 1.0, h: 1.2 }, { w: 0.9, d: 0.8, h: 1.0 }],
  build: function (F) {
    const crops = ['cropGreen', 'cropLeaf', 'cropPale', 'cropDeep'], ferns = ['fernGreen', 'fernMoss'];
    const box = F.col('plankDark');
    if (F.variant === 2) { F.box(0, 0, 0, 0.9, 0.35, 0.45, 0, box, 'plank'); BRH.bush(F, 0, 0.3, 0, 0.4, 0.7, F.pick(crops)); return; }
    if (F.variant === 1) {
      F.box(0, 0, 0, 1.8, 0.45, 0.7, 0, box, 'plank');
      BRH.bush(F, 0.4, 0.4, 0, 0.5, 0.8, F.pick(ferns));
      BRH.bush(F, -0.45, 0.4, 0, 0.42, 0.65, F.pick(crops));
      return;
    }
    F.box(0, 0, 0, 2.6, 0.5, 1.1, 0, box, 'plank');
    for (let i = 0; i < 3; i++) BRH.bush(F, -0.85 + i * 0.85, 0.45, F.rr(-0.1, 0.1), F.rr(0.4, 0.6), F.rr(0.6, 1.3), F.chance(0.5) ? F.pick(crops) : F.pick(ferns));
  }
});

FURN({
  key: 'br_h_window_box', name: 'Window box', culture: 'beast-rider', tier: 'common', type: 'planter', setting: 'both',
  rooms: ['living', 'bedroom', 'kitchen', 'street', 'garden'], anchor: 'wall', clearance: {},
  materials: ['timber', 'foliage'],
  source: 'settlements/mavs-refuge/src/56-levels.js lvlApt (dressing: a window box)',
  w: 1.1, d: 0.34, h: 1.2, variants: 1,
  build: function (F) {
    F.box(0, 0.78, 0, 1.1, 0.22, 0.3, 0, F.shade(F.pick(['plankHoney', 'plankTan', 'plankSand', 'plankDark']), -0.2), 'plank');
    F.box(0, 1.0, 0, 1.0, 0.2, 0.34, 0, F.chance(0.5) ? F.pick(['cropGreen', 'cropLeaf', 'cropPale', 'cropDeep']) : F.col('flowerViolet'), 'plant');
  }
});

FURN({
  key: 'br_h_bean_trellis', name: 'Pod trellis', culture: 'beast-rider', tier: 'common', type: 'planter', setting: 'outdoor',
  rooms: ['garden', 'yard'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'foliage'],
  source: 'settlements/mavs-refuge/src/55-arch.js SATELLITES (farms: trellises hung with pods)',
  w: 3.2, d: 0.42, h: 2.27, variants: 1,
  build: function (F) {
    F.shift(0, -0.095); /* centre the footprint on the origin */
    const wood = F.col('timberCocoa');
    for (const x of [-1.5, 1.5]) F.box(x, 0, 0, 0.1, 2.3, 0.1, 0, wood, 'wood');
    F.box(0, 2.2, 0, 3.2, 0.07, 0.07, 0, wood, 'wood');
    F.box(0, 1.1, 0, 3.2, 0.06, 0.06, 0, wood, 'wood');
    F.box(0, 0.35, 0, 2.9, 1.75, 0.22, 0, F.pick(['cropGreen', 'cropLeaf', 'cropPale', 'cropDeep']), 'plant');
    const fruit = ['fruitOrange', 'fruitAmber', 'fruitGold'];
    for (let i = 0; i < 4; i++) BRH.pod(F, -1.1 + i * 0.75, 0.9 + (i % 2) * 0.6, 0.18, 0.12, F.col(fruit[i % 3]));
  }
});

FURN({
  key: 'br_h_scarecrow', name: 'Scarecrow', culture: 'beast-rider', tier: 'common', type: 'statue', setting: 'outdoor',
  rooms: ['garden', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'cloth', 'ceramic', 'thatch'],
  source: 'settlements/mavs-refuge/src/55-arch.js SATELLITES (farms: a scarecrow with a pot head)',
  w: 1.5, d: 0.62, h: 2.11, variants: 1,
  build: function (F) {
    const wood = F.col('timberBistre');
    F.box(0, 0, 0, 0.1, 2.1, 0.1, 0, wood, 'wood');
    F.box(0, 1.5, 0, 1.5, 0.08, 0.08, 0, wood, 'wood');
    F.box(0, 0.75, 0, 0.7, 0.8, 0.12, 0, F.pick(['lacquerDeep', 'clothRust', 'clothForest', 'clothMustard', 'clothPlum', 'clothTerracotta']), 'cloth');
    F.box(0, 1.75, 0, 0.3, 0.32, 0.3, 0, F.col('wallCream'), 'ceramic');
    F.box(0, 2.05, 0, 0.62, 0.06, 0.62, 0, F.col('thatchStraw'), 'thatch');
  }
});

FURN({
  key: 'br_h_lantern_string', name: 'Lantern string', culture: 'beast-rider', tier: 'common', type: 'lamp', setting: 'outdoor',
  rooms: ['market', 'plaza', 'street', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'rope', 'emissive'],
  source: 'settlements/mavs-refuge/src/55-arch.js MAV\'S CROWN (lantern strings between the market rows)',
  w: 8.56, d: 0.5, h: 5.2, variants: 1,
  build: function (F) {
    for (const x of [-4.2, 4.2]) F.box(x, 0, 0, 0.16, 5.2, 0.16, 0, F.col('timberBistre'), 'wood');
    const sag = (t) => 5.1 - 1.2 * 4 * t * (1 - t), X = (t) => -4.2 + 8.4 * t;
    for (let s = 0; s < 4; s++) {
      const t0 = s / 4, t1 = (s + 1) / 4;
      F.rod(X(t0), sag(t0), 0, X(t1), sag(t1), 0, 0.025, F.col('ropeHemp'), 'rope');
      if (s > 0) BRH.lantern(F, X(t0), sag(t0) - 0.55, 0, 0.15, false);
    }
  }
});

FURN({
  key: 'br_h_signal_mast', name: 'Signal lantern mast', culture: 'beast-rider', tier: 'common', type: 'lamp', setting: 'outdoor',
  rooms: ['street', 'yard', 'plaza', 'roost', 'dock'], anchor: 'floor', clearance: {},
  materials: ['timber', 'rope', 'emissive'],
  source: 'settlements/mavs-refuge/src/55-arch.js SATELLITES (wayposts: signal lantern mast)',
  w: 1.47, d: 1.03, h: 5.2, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.22, 5.2, 0.22, 0, F.col('timberBistre'), 'wood');
    F.box(0, 4.9, 0, 1.3, 0.12, 0.12, 0.5, F.col('timberBistre'), 'wood');
    const cx = 0.55 * Math.cos(0.5), cz = 0.55 * Math.sin(0.5);
    BRH.lantern(F, cx, 4.35, -cz, 0.35, false);
    BRH.lantern(F, -cx, 4.35, cz, 0.35, true);
  }
});

FURN({
  key: 'br_h_post_brazier', name: 'Brazier on a post', culture: 'beast-rider', tier: 'court', type: 'brazier', setting: 'both',
  rooms: ['court', 'hall', 'temple', 'antechamber', 'plaza'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['timber', 'metal', 'emissive'],
  source: 'settlements/mavs-refuge/src/55-arch.js THE COUNCIL CHAMBER (braziers at the doors); settlements/girder/src/55-arch.js THE ASSEMBLY HALL (door braziers)',
  w: 1.24, d: 1.24, h: 2.02, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.16, 1.3, 0, F.shade('timberSmoke', -0.1), 'wood');
    F.cyl(0, 1.3, 0, 0.62, 0.4, 0, F.shade('stoneCoal', -0.3), 'metal');
    F.box(0, 1.62, 0, 0.75, 0.4, 0.75, 0.6, F.col('glowWarm'), 'glow');
    F.lamp(0, 2.1, 0, 1.3, 16);
  }
});

FURN({
  key: 'br_h_signal_brazier', name: 'Signal brazier', culture: 'beast-rider', tier: 'common', type: 'brazier', setting: 'outdoor',
  rooms: ['yard', 'street', 'plaza', 'roost', 'barracks', 'dock'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['stone', 'metal', 'emissive'],
  source: 'settlements/mavs-refuge/src/56-levels.js the gate-tree landing stage (signal brazier); kits/catalog/krator-master-buildings-beast-rider.js br_bldg_girder_palisade (brazier on the watch platform)',
  w: 1.22, d: 1.4, h: 1.75, variants: 2, variantNames: ['stone-drum brazier', 'watch fire pot'],
  variantDims: [{ w: 1.22, d: 1.4, h: 1.75 }, { w: 0.6, d: 0.6, h: 0.76 }],
  build: function (F) {
    if (F.variant === 1) {
      F.cyl(0, 0, 0, 0.3, 0.35, 0, F.col('ironPot'), 'metal');
      F.ball(0, 0.5, 0, 0.26, F.col('amber'), 'glow');
      F.lamp(0, 0.9, 0, 1.0, 12);
      return;
    }
    F.frustum(0, 0, 0, 0.6, 0.42, 1.15, 0, F.col('stoneDusk'), 'stone', 6);
    F.frustum(0, 1.15, 0, 0.38, 0.7, 0.35, 0, F.col('iron'), 'metal', 6);
    F.frustum(0, 1.49, 0, 0.66, 0.66, 0.01, 0, F.col('glowWarm'), 'glow', 6);
    F.box(0, 1.45, 0, 0.5, 0.3, 0.5, 0.6, F.col('glowWarm'), 'glow');
    F.lamp(0, 1.95, 0, 1.3, 16);
  }
});

FURN({
  key: 'br_h_hitching_rail', name: 'Hitching rail', culture: 'beast-rider', tier: 'common', type: 'rack', setting: 'outdoor',
  rooms: ['stable', 'yard', 'roost', 'street'], anchor: 'floor', clearance: { front: 1.2 },
  materials: ['timber', 'metal'],
  source: 'settlements/mavs-refuge/src/56-levels.js the gate-tree ground (hitching rail), lvlRoost (chained post)',
  w: 4.6, d: 1.2, h: 1.25, variants: 2, variantNames: ['hitching rail', 'tether post with chain'],
  variantDims: [{ w: 4.6, d: 0.24, h: 1.25 }, { w: 1.2, d: 1.2, h: 1.2 }],
  build: function (F) {
    if (F.variant === 1) {
      F.shift(0.43, -0.43); /* centre the footprint on the origin */
      F.box(0, 0, 0, 0.28, 1.2, 0.28, 0, F.col('timberBistre'), 'wood');
      F.rod(0, 1.05, 0, -1.0, 0.05, 1.0, 0.025, F.col('ironDark'), 'metal');
      return;
    }
    for (const x of [-1.9, 1.9]) F.box(x, 0, 0, 0.24, 1.25, 0.24, 0, F.col('timberBistre'), 'wood');
    F.beam(-2.3, 1.05, 0, 2.3, 1.05, 0, 0.16, 0.16, F.col('timberCocoa'), 'wood');
  }
});

FURN({
  key: 'br_h_stall_goods', name: 'Stall goods', culture: 'beast-rider', tier: 'common', type: 'stack', setting: 'both',
  rooms: ['market', 'shop', 'store', 'kitchen'], anchor: 'surface', clearance: {},
  materials: ['foliage', 'cloth', 'ceramic'],
  source: 'settlements/mavs-refuge/src/55-arch.js stall(), podPile() (goods on the counter); settlements/girder/src/55-arch.js MARKET STALLS',
  w: 1.05, d: 1.24, h: 0.36, variants: 3, variantNames: ['pod pile', 'cloth bundle', 'clay pot'],
  variantDims: [{ w: 1.05, d: 1.24, h: 0.36 }, { w: 0.6, d: 0.45, h: 0.3 }, { w: 0.44, d: 0.44, h: 0.35 }],
  build: function (F) {
    if (F.variant === 1) { F.box(0, 0, 0, 0.6, 0.3, 0.45, 0, F.pick(['lacquerDeep', 'clothRust', 'clothForest', 'clothMustard', 'clothPlum', 'clothTerracotta']), 'cloth'); return; }
    if (F.variant === 2) { F.cyl(0, 0, 0, 0.22, 0.35, 0, F.pick(['wallWicker', 'wallReed', 'wallFlax', 'wallKhaki', 'wallCream']), 'ceramic'); return; }
    F.shift(0.0275, 0.0425); /* centre the footprint on the origin */
    const fruit = ['fruitOrange', 'fruitAmber', 'fruitGold'];
    for (let i = 0; i < 4; i++) { const a = i * 2.4, r = i ? 0.42 : 0; BRH.pod(F, Math.cos(a) * r, 0.048, Math.sin(a) * r, 0.24, F.col(fruit[i % 3])); }
  }
});

FURN({
  key: 'br_h_banner_pole', name: 'Banner pole', culture: 'beast-rider', tier: 'common', type: 'banner', setting: 'outdoor',
  rooms: ['plaza', 'yard', 'street', 'court', 'market'], anchor: 'floor', clearance: {},
  materials: ['timber', 'cloth'],
  source: 'settlements/mavs-refuge/src/55-arch.js banner() (banner poles on the platforms and round the mustering ground)',
  w: 1.2, d: 0.14, h: 8.5, variants: 2, variantNames: ['street banner', 'parade banner'],
  variantDims: [{ w: 1.2, d: 0.14, h: 5.5 }, { w: 1.2, d: 0.14, h: 8.5 }],
  build: function (F) {
    F.shift(-0.5, 0); /* centre the footprint on the origin */
    const H = F.variant === 1 ? 8.5 : 5.5, wood = F.col('timberBistre');
    F.box(0, 0, 0, 0.14, H, 0.14, 0, wood, 'wood');
    F.box(0.5, H - 0.35, 0, 1.2, 0.08, 0.08, 0, wood, 'wood');
    F.box(0.62, H - 0.4 - H * 0.5, 0, 0.85, H * 0.5, 0.04, 0, F.pick(['lacquerDeep', 'clothMustard', 'clothForest']), 'cloth');
  }
});

FURN({
  key: 'br_h_guard_shelter', name: 'Guard shelter', culture: 'beast-rider', tier: 'common', type: 'shelter', setting: 'outdoor',
  rooms: ['street', 'yard', 'dock', 'roost', 'plaza'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'thatch', 'rope', 'emissive'],
  source: 'settlements/mavs-refuge/src/55-arch.js gateYard (sentry boxes), SATELLITES (wayposts: waypost shelter)',
  w: 4.67, d: 4.67, h: 4.6, variants: 2, variantNames: ['sentry box', 'waypost shelter'],
  variantDims: [{ w: 2.12, d: 2.12, h: 3.9 }, { w: 4.67, d: 4.67, h: 4.6 }],
  build: function (F) {
    if (F.variant === 0) {
      F.box(0, 0, 0, 1.5, 2.5, 1.5, 0, F.col('timberBistre'), 'plank');
      F.box(0, 0.1, 0.76, 0.8, 1.9, 0.06, 0, F.shade('timberBistre', -0.5), 'plank');
      F.pyrRoof(0, 2.5, 0, 2.12, 1.4, 2.12, 0, F.col('shingleBrown'), 'plank');
      F.rod(1.0, 0, 0.9, 1.0, 3.0, 0.9, 0.035, F.col('timberTawny'), 'wood');
      return;
    }
    for (const c of [[-1.6, -1.6], [1.6, -1.6], [1.6, 1.6], [-1.6, 1.6]]) F.box(c[0], 0, c[1], 0.2, 2.6, 0.2, 0, F.col('timberSmoke'), 'wood');
    F.box(0, 0, -1.6, 3.2, 1.2, 0.14, 0, F.col('wallTar'), 'plank');
    F.box(-1.6, 0, 0, 0.14, 1.2, 3.2, 0, F.col('wallTar'), 'plank');
    F.pyrRoof(0, 2.5, 0, 4.67, 2.1, 4.67, 0, F.pick(['thatchStraw', 'thatchHay', 'thatchPale', 'thatchOld', 'thatchDun']), 'thatch');
    F.box(0, 0.42, -1.1, 2.6, 0.1, 0.5, 0, F.col('plankSand'), 'plank');
    F.box(0, 0, -1.1, 2.2, 0.42, 0.14, 0, F.col('timberCocoa'), 'wood');
    for (let s = 0; s < 3; s++) F.rod(1.2 + s * 0.2, 0, -1.3, 1.2 + s * 0.2, 2.4, -1.5, 0.03, F.col('timberTawny'), 'wood');
    BRH.lantern(F, 0, 2.2, 0, 0.3, false);
  }
});

FURN({
  key: 'br_h_winged_totem', name: 'Totem of the winged beast', culture: 'beast-rider', tier: 'court', type: 'statue', setting: 'outdoor',
  rooms: ['plaza', 'court', 'temple'], anchor: 'floor', clearance: { front: 2.0, back: 1.0, left: 1.0, right: 1.0 },
  materials: ['timber', 'gold'],
  source: 'settlements/mavs-refuge/src/55-arch.js MAV\'S CROWN (the public plaza: Totem of the First Mount)',
  w: 13.8, d: 8.4, h: 15.45, variants: 1,
  build: function (F) {
    /* stepped plank plinth, then the carved shaft (Mav's TUBE, as stacked eight-sided frusta) */
    F.cyl(0, 0, 0, 4.2, 0.45, 0, F.col('plankDark'), 'plank');
    F.cyl(0, 0.45, 0, 3.0, 0.45, 0, F.col('plankTan'), 'plank');
    const ty = 0.9, hT = 12, tcol = F.shade('hideOak', -0.1);
    const rAt = (t) => (1.05 + (0.62 - 1.05) * t) * (1 + 0.12 * Math.sin(t * 19));
    for (let i = 0; i < 6; i++) {
      const t0 = i / 6, t1 = (i + 1) / 6;
      F.frustum(0, ty + hT * t0, 0, rAt(t0), rAt(t1), hT / 6, 0, (i % 2) ? tcol : F.shade(tcol, 0.12), 'wood', 8);
    }
    const bands = ['lacquerRed', 'gilt', 'verdigris'];
    [2.2, 5.0, 7.6].forEach(function (h, ix) { F.cyl(0, ty + h, 0, 1.18 - ix * 0.1, 0.35, 0, F.col(bands[ix]), ix === 1 ? 'gold' : 'wood'); });
    /* the wings: two spars a side, five long feathers hanging off them */
    const wy = ty + hT - 2.6;
    for (const sd of [-1, 1]) {
      const w0 = [sd * 0.6, wy, 0], w1 = [sd * 3.4, wy + 2.3, 0], w2 = [sd * 6.6, wy + 1.3, 0];
      F.beam(w0[0], w0[1], w0[2], w1[0], w1[1], w1[2], 0.4, 0.5, tcol, 'wood');
      F.beam(w1[0], w1[1], w1[2], w2[0], w2[1], w2[2], 0.3, 0.4, tcol, 'wood');
      for (let q = 0; q < 5; q++) {
        const t = (q + 0.6) / 5.2, a = t < 0.5 ? w0 : w1, b = t < 0.5 ? w1 : w2, u = t < 0.5 ? t * 2 : t * 2 - 1;
        const bx = a[0] + (b[0] - a[0]) * u, by = a[1] + (b[1] - a[1]) * u;
        F.beam(bx, by, 0, bx + sd * 0.5, by - 2.2 - q * 0.35, -0.3, 0.55, 0.08, (q % 2) ? F.col('verdigris') : F.shade(tcol, 0.1), 'wood');
      }
    }
    /* the head, beak and crest, facing the front */
    F.beam(0, ty + hT - 0.4, 0, 0, ty + hT + 1.2, 1.3, 0.7, 0.8, tcol, 'wood');
    F.beam(0, ty + hT + 1.0, 1.1, 0, ty + hT + 0.7, 2.7, 0.5, 0.45, F.col('gilt'), 'gold');
    F.beam(0, ty + hT + 1.3, 0.9, 0, ty + hT + 2.4, -0.5, 0.3, 0.2, F.col('lacquerRed'), 'wood');
  }
});
