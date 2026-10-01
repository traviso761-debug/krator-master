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

/* ======== Harvested from kits/catalog/krator-master-buildings-beast-rider.js, settlements/girder/src/55-arch.js, settlements/mavs-refuge/src/55-arch.js and 56-levels.js (@COUNT@ pieces) ========
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
