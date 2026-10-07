/* ======================================================================
   Krator master catalog — generic furniture: containers, food, drink, supplies
   Culture 'generic': pieces no one culture owns. FURN({...}) entries in the
   kits/furniture/SPEC.md shape; their colours join FPAL['generic'] through the
   PALETTE block below. Every piece is tier 'common' with wealth [0, 1]: food and
   storage suit a room of any wealth, so kits/interiors never skips them as off-band.

   Sized to the catalog's furniture. A surface piece (anchor 'surface') is at
   most 0.36 m deep and 0.42 m tall unless it says otherwise, so it fits on
   yuni_common_wall_shelves (0.38 deep, 0.44 between boards), the pantry shelf
   below, any counter (0.8 deep) and any table. Three are table-only, being
   0.38-0.42 m across: generic_roast, generic_fish 'platter', generic_basket
   'flat tray'. Floor containers stand beside a 0.8 m table or a 1.05 m counter.

   KGEN holds the shared shapes (bottle, jar, bowl, mug, crate, a heap of round
   things). It takes colours, never palette keys or literals, so each piece
   still names its own colours with F.col.
   ====================================================================== */

/* PALETTE */
/* the goods' and the biome fruit's colours, added to the generic palette (krator-master-furniture-generic.js
   owns timberPine, clothLinen and iron, which these pieces use too). Role + name: bread*, cheese*, meat*,
   fruit*, veg*, drink*; the fruit keys follow the part each biome draws. */
FURN_CULTURE('generic', { palette: {
    timberOak: 0x8a6a4e, timberWalnut: 0x5e3f2a, timberDark: 0x3e2c20, timberBirch: 0xd2b88a,
    wickerStraw: 0xc4a064, wickerTan: 0x9c7a48, wickerDark: 0x6e5432,
    stoneClay: 0xb06a44, stoneClayDark: 0x8a4e32, stoneBuff: 0xd2bc94, stoneGrey: 0x8e8a82, stoneSlate: 0x4e5258,
    stoneCream: 0xeee6d2, stoneGlazeBlue: 0x3e6a8a, stoneGlazeGreen: 0x5a7a4a, stoneGlazeOchre: 0xc08a3a,
    glassGreen: 0x3e6e44, glassAmber: 0x9a5a1e, glassClear: 0xcfe0e0, glassBlue: 0x3a5a8a, glassViolet: 0x5a3a6e,
    tin: 0xa8acae, brass: 0xc29a44, copper: 0xb06a3a, pewter: 0x8a8f92,
    clothHessian: 0xa8885a, clothMadder: 0xa8402e, clothIndigo: 0x2e4a7a, clothOchre: 0xc9a24a,
    clothSage: 0x7a8a62, clothRose: 0xc87a7a,
    waxBone: 0xeadfc4, waxHoney: 0xd8a848, waxRed: 0xb02a24,
    paperCream: 0xe8dcb8, inkBlack: 0x1a1a22, coalBlack: 0x262422,
    breadCrust: 0xa8682e, breadDark: 0x6e4220, breadCrumb: 0xe8cc90, pieCrust: 0xc88a40,
    cheeseYellow: 0xe8c25a, cheesePale: 0xf0e2b0, cheeseRind: 0xc8963a, cheeseBlue: 0x8a9aa0,
    meatRed: 0x9a3a32, meatCured: 0x7a2e26, meatRoast: 0x8a4a22, meatFat: 0xf0e4cc, meatSausage: 0x8a4a32,
    fishSilver: 0xa8b0b0, fishBack: 0x4e5a62, fishSmoked: 0xb8823a,
    fruitApple: 0xb8302a, fruitAppleGreen: 0x8ab040, fruitPear: 0xc8b048, fruitOrange: 0xe08a24,
    fruitLemon: 0xe8d040, fruitGrape: 0x5a2a5a, fruitPlum: 0x4a2a5a, fruitBerry: 0xc82a2a, fruitBanana: 0xe8cc48,
    vegCarrot: 0xe07a24, vegOnion: 0xc8964a, vegGarlic: 0xeae0cc, vegCabbage: 0x8ab060, vegLeaf: 0x5a8a3a,
    vegHerb: 0x4a6a32, vegPotato: 0xa88a5a, vegPumpkin: 0xd8782a, vegMushroom: 0xc8b090, vegPepper: 0xb82a1e,
    vegBean: 0x7a3a2a, nutBrown: 0x8a5a30, grainStraw: 0xd8c080, flourWhite: 0xf0ead8,
    eggShell: 0xece2cc, eggBrown: 0xc8a070, eggYolk: 0xf0b030,
    honeyAmber: 0xd89a28, jamRuby: 0x8a1e2a, butterYellow: 0xf0d890, creamWhite: 0xf4ece0, icingPink: 0xe8a8b0,
    stewBrown: 0x7a4a24, soupGold: 0xc8902e, sauceRed: 0xa8341e,
    drinkWine: 0x5a1420, drinkAle: 0xb87a28, drinkFoam: 0xf2ead8, drinkMilk: 0xf2efe6, drinkWater: 0x7aa0b0,
    drinkTea: 0x7a4a24, drinkSpirit: 0xc8902e, drinkOil: 0xc8a840,
    saltWhite: 0xf4f2ec, spiceRed: 0xa8401e, spiceTurmeric: 0xd8a020, spiceBlack: 0x2e2620,
    soapCream: 0xe8e0c0, soapGreen: 0x9ab07a, tobaccoBrown: 0x6a4428, herbDry: 0x8a8a4a, medicineRed: 0x9a2a2a,
    /* biome fruit (krator-master-furniture-generic-fruit.js): colours taken from the fruiting part each biome draws */
    fruitScaleRed: 0xc0262a, fruitScaleFlesh: 0xf0b8b0, fruitFernEgg: 0x8a6a3a, fruitFernMeal: 0xe8d8a8,
    fruitTideHusk: 0x7e3030, fruitTideJelly: 0xe8e0c8, fruitCycadRed: 0xb83a2a,
    fruitCocoHusk: 0x6e8a3a, fruitCocoShell: 0x5a3e26, fruitCocoFlesh: 0xf4f0e4, fruitCocoWater: 0xe8eadc,
    fruitGateRind: 0xe0862a, fruitGatePulp: 0xf2ead0, fruitMahogany: 0x5a3a22, fruitMahoganySeed: 0xc89a5a,
    fruitSilkGreen: 0x7a9a4a, fruitSilkFloss: 0xf0e6d0, fruitPandanKey: 0xd87a2a, fruitPandanTip: 0x5a6a2a, fruitPandanPaste: 0xe8a040,
    fruitAril: 0xd0202a, fruitArilSeed: 0x2e3a2a, fruitRowan: 0xd83a2a, fruitRowanJelly: 0xc8502a, fruitBilberry: 0x2a3a6a,
    fruitLanternPod: 0x9a62c8, fruitLanternPodGlow: 0xc89ae8, fruitMast: 0x8a6a4a, fruitMastHusk: 0x6a5a3a, fruitAcorn: 0x9a7a3a,
    fruitBanksia: 0xe88a24, drinkNectar: 0xe8b040,
    fruitBallmelon: 0x8ab838, fruitBallmelonFlesh: 0xf0d850, fruitFrillPink: 0xff40a0, fruitFrillCore: 0xf8e0ec,
    fruitLanternPink: 0xff50a0, fruitLanternGold: 0xffc030, fruitLanternOrange: 0xff7030, fruitLanternBlue: 0x40a0ff,
    fruitLanternViolet: 0xd040e0, fruitLanternTeal: 0x30d0c0, fruitBellDate: 0x857e32,
    fruitMesquite: 0xc8b850, fruitMesquiteCake: 0xb08a4a, fruitDate: 0x8a4a22, fruitDateStrand: 0xc88a3a,
    fruitTuna: 0xe86a20, fruitTunaFlesh: 0xd8402a,
    fruitPinyonCone: 0x8a5a34, fruitPinyonNut: 0x7a4a2a, fruitPinyonKernel: 0xe8d8b0, fruitJuniper: 0x6a7a9a, fruitJuniperTwig: 0x5e7458,
    fruitJuniperDry: 0x3e3e52, fruitYuccaStalk: 0xc89a4a, fruitYuccaRoast: 0x8a5a2a, fruitYuccaBloom: 0xf0ecd8, fruitGrape: 0x3a2a4a,
    fruitGrapeLeaf: 0x5a8a3a, fruitRaisin: 0x4a2a2a, fruitStiltPod: 0x5a9a6a, fruitStiltFlesh: 0xf0e8c8, fruitStiltSeed: 0x3a2a1e,
    fruitUmbelSeed: 0xa8946a, fruitUmbelStalk: 0x8a7a4a,
    fungusCoralOrange: 0xf08a3a, fungusCoralPink: 0xf090b0, fungusCoralViolet: 0x9a70c8, fungusParasol: 0xc8a882,
    fruitMadrone: 0xc82a1e, drinkCider: 0xd8a050, fruitRattlepod: 0x8a2a1c, fruitRattleBean: 0x4a2a1a,
    fruitTamarindShell: 0x4a3424, fruitTamarindPulp: 0x8a4a22, fruitFig: 0x5a3a5a, fruitFigFlesh: 0xd8586a,
    fruitCacaoRed: 0x8a2a3a, fruitCacaoGold: 0xd8a030, fruitCacaoOrange: 0xe07a28, fruitCacaoPulp: 0xf4ecdc, drinkCacao: 0x5a3020,
    fruitPitaya: 0xe0206a, fruitPitayaFlame: 0x7ab040, fruitPitayaFlesh: 0xf4f0ec,
    fruitPlantain: 0xf0d040, fruitPlantainBract: 0x6a2a8a, fruitPlantainFried: 0xd89a3a, fruitWingnut: 0x9ac060,
    fruitArbutusRed: 0xe02a20, fruitArbutusOrange: 0xf08a20, fruitWhorlOlive: 0x6a6a3a, fruitWhorlCream: 0xd8c8a0,
    fruitLotusPod: 0x8a9a5a, fruitLotusSeed: 0xe8e0c0,
    fruitFireseedHusk: 0xc85a2c, fruitFireseedNut: 0x40281e, fruitFireseedMeal: 0x9a6a44,
    fruitParasolCone: 0x8a5230, fruitParasolShell: 0x5e3c28, fruitParasolKernel: 0xeee2bc,
    fruitCliffFig: 0xb4482c, fruitCliffFigRipe: 0x5a2a48, fruitCliffFigFlesh: 0xe07a6a,
    fruitAvenuePod: 0xa86a30, fruitAvenuePulp: 0xf0e6c4, fruitAvenueSeed: 0x4a3022,
    fruitTravellerCapsule: 0x6a5034, fruitTravellerAril: 0x2a6ad0
} });
/* END PALETTE */

const KGEN = {
  /* a bottle standing at (x, y, z): body r x 0.6h, shoulder, neck, cork; liquid shows through glass */
  bottle(F, x, y, z, r, h, glass, cork, liquid, fam) {
    fam = fam || 'glass';
    const bh = h * 0.6;
    if (liquid != null) F.cyl(x, y + 0.005, z, r * 0.82, bh * 0.85, 0, liquid, 'food');
    F.cyl(x, y, z, r, bh, 0, glass, fam);
    F.frustum(x, y + bh, z, r, Math.max(r * 0.35, 0.02), h * 0.14, 0, glass, fam, 12);
    F.cyl(x, y + bh + h * 0.14, z, Math.max(r * 0.3, 0.012), h * 0.2, 0, glass, fam);
    F.cyl(x, y + h * 0.93, z, Math.max(r * 0.32, 0.013), h * 0.07, 0, cork, 'wood');
  },
  /* a lidded jar: body, lid a little wider, knob; contents (if given) show through glass */
  jar(F, x, y, z, r, h, body, lid, fam, fill) {
    if (fill != null) F.cyl(x, y + 0.005, z, r * 0.85, h * 0.8, 0, fill, 'food');
    F.cyl(x, y, z, r, h, 0, body, fam);
    F.cyl(x, y + h, z, r * 1.06, 0.02, 0, lid, fam === 'glass' ? 'metal' : fam);
    F.ball(x, y + h + 0.02, z, Math.min(r * 0.3, 0.02), lid, fam === 'glass' ? 'metal' : fam);
  },
  /* a jar with a cloth cap tied on */
  clothJar(F, x, y, z, r, h, glass, fill, cloth, string) {
    F.cyl(x, y + 0.005, z, r * 0.85, h * 0.85, 0, fill, 'food');
    F.cyl(x, y, z, r, h, 0, glass, 'glass');
    F.dome(x, y + h, z, r * 1.12, 0.025, 0, cloth, 'cloth');
    F.cyl(x, y + h - 0.02, z, r * 1.05, 0.02, 0, string, 'cloth');
  },
  plate(F, x, y, z, r, col) { F.cyl(x, y, z, r, 0.02, 0, col, 'stone'); },
  /* an open bowl, flared; fill is the surface of what is in it */
  bowl(F, x, y, z, r, h, col, fam, fill) {
    F.frustum(x, y, z, r * 0.6, r, h, 0, col, fam || 'stone', 16);
    F.cyl(x, y + h - 0.018, z, r * 0.9, 0.02, 0, fill != null ? fill : F.shade(col, -0.35), fill != null ? 'food' : (fam || 'stone'));
  },
  /* a mug or tankard with a handle on +x, liquid at the brim */
  mug(F, x, y, z, r, h, col, fam, liquid) {
    F.cyl(x, y, z, r, h, 0, col, fam);
    if (liquid != null) F.cyl(x, y + h - 0.018, z, r * 0.85, 0.02, 0, liquid, 'food');
    F.box(x + r + 0.008, y + h * 0.2, z, 0.02, h * 0.6, 0.02, 0, col, fam);
  },
  /* a goblet: foot, stem, bowl; wine in it */
  goblet(F, x, y, z, glass, wine) {
    F.cyl(x, y, z, 0.03, 0.02, 0, glass, 'glass');
    F.cyl(x, y + 0.02, z, 0.01, 0.05, 0, glass, 'glass');
    if (wine != null) F.cyl(x, y + 0.075, z, 0.025, 0.03, 0, wine, 'food');
    F.frustum(x, y + 0.07, z, 0.022, 0.038, 0.06, 0, glass, 'glass', 14);
  },
  /* an open slatted crate, base at y; lid: true closes it */
  crate(F, x, y, z, w, h, d, col, lid) {
    const t = 0.02, dark = F.shade(col, -0.3);
    F.box(x, y, z, w - 0.04, 0.02, d - 0.04, 0, dark, 'wood');
    for (const k of [0, 1, 2]) {
      const sy = y + 0.02 + k * (h - 0.04) / 3, sh = (h - 0.04) / 3 - 0.015;
      const c = F.shade(col, F.rr(-0.06, 0.06));
      F.box(x, sy, z + d / 2 - t / 2, w, sh, t, 0, c, 'wood');
      F.box(x, sy, z - d / 2 + t / 2, w, sh, t, 0, c, 'wood');
      F.box(x - w / 2 + t / 2, sy, z, t, sh, d - 2 * t, 0, c, 'wood');
      F.box(x + w / 2 - t / 2, sy, z, t, sh, d - 2 * t, 0, c, 'wood');
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      F.box(x + sx * (w / 2 - 0.025), y, z + sz * (d / 2 - 0.025), 0.05, h - 0.02, 0.05, 0, F.shade(col, -0.12), 'wood');
    if (lid) for (let i = 0; i < 4; i++) F.box(x, y + h - 0.02, z - d / 2 + d * (i + 0.5) / 4, w, 0.02, d / 4 - 0.01, 0, F.shade(col, 0.05 - i * 0.03), 'wood');
  },
  /* a heap of round things on a disc of radius R at height y: a ring, a centre, a second ring, a top */
  heap(F, cx, y, cz, R, r, cols, fam, one) {
    one = one || ((x, yy, z, c) => F.ball(x, yy + r, z, r, c, fam));
    const ring = Math.max(3, Math.floor(F.TAU * (R - r) / (2.05 * r)));
    for (let i = 0; i < ring; i++) {
      const a = i * F.TAU / ring;
      one(cx + Math.cos(a) * (R - r), y, cz + Math.sin(a) * (R - r), F.pick(cols));
    }
    one(cx, y, cz, F.pick(cols));
    if (R > 2.5 * r) {
      const r2 = (R - r) * 0.45, n2 = Math.max(3, Math.floor(F.TAU * r2 / (2.05 * r)));
      for (let i = 0; i < n2; i++) {
        const a = i * F.TAU / n2 + 0.4;
        one(cx + Math.cos(a) * r2, y + r * 1.3, cz + Math.sin(a) * r2, F.pick(cols));
      }
      one(cx, y + r * 2.1, cz, F.pick(cols));
    }
  },
  /* a fish lying on its side along x, head to +x when dir = 1: a chain of flattened lenses and a tail fin */
  fish(F, x, y, z, len, back, belly, dir) {
    const rs = [0.5, 0.95, 1, 0.85, 0.6, 0.35], r0 = len * 0.14;
    for (let i = 0; i < rs.length; i++) {
      const px = x + dir * len * (0.38 - i * 0.12), r = r0 * rs[i];
      F.blob(px, y + r * 0.45, z, r, r * 0.9, 0, i % 2 ? back : F.shade(back, 0.08), 'food');
    }
    F.blob(x + dir * len * 0.1, y + r0 * 0.25, z + r0 * 0.25, r0 * 0.7, r0 * 0.4, 0, belly, 'food');
    const tx = x - dir * len * 0.34;
    F.beam(tx, y + 0.012, z, tx - dir * len * 0.14, y + 0.012, z, len * 0.2, 0.02, F.shade(back, -0.1), 'food');
  },
  /* a capsule lying along x: a loaf, a sausage, a salami */
  capsule(F, x0, x1, y, z, r, col) {
    F.rod(x0, y + r, z, x1, y + r, z, r, col, 'food');
    F.ball(x0, y + r, z, r, col, 'food'); F.ball(x1, y + r, z, r, col, 'food');
  },
  /* an apple-like fruit with a stalk, sitting on y */
  fruit(F, x, y, z, r, col, stalk) {
    F.ball(x, y + r, z, r, col, 'food');
    if (stalk != null) F.cyl(x, y + 2 * r - 0.005, z, 0.01, 0.02, 0, stalk, 'wood');
  }
};

/* ================= Storage containers (17 pieces) ================= */

FURN({
  key: 'generic_barrel', name: 'Barrel', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'tavern', 'yard', 'dock', 'market', 'workshop'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'metal', 'food'],
  w: 0.73, d: 0.67, h: 1.04, variants: 3, variantNames: ['barrel', 'open tub', 'water butt'],
  variantDims: [{ w: 0.62, d: 0.62, h: 0.92 }, { w: 0.73, d: 0.67, h: 0.45 }, { w: 0.64, d: 0.64, h: 1.04 }],
  build: function (F) {
    const oak = F.col('timberOak'), iron = F.col('iron');
    /* a barrel bellied between rEnd and rMid over height H, hooped; returns radius at a height */
    const barrel = (rEnd, rMid, H, hoops) => {
      F.frustum(0, 0, 0, rEnd, rMid, H / 2, 0, oak, 'wood', 18);
      F.frustum(0, H / 2, 0, rMid, rEnd, H / 2, 0, F.shade(oak, 0.04), 'wood', 18);
      const rAt = (y) => rEnd + (rMid - rEnd) * (1 - Math.abs(y - H / 2) / (H / 2));
      for (const f of hoops) F.cyl(0, f * H - 0.015, 0, rAt(f * H) + 0.008, 0.03, 0, iron, 'metal');
    };
    if (F.variant === 0) {
      barrel(0.25, 0.31, 0.9, [0.1, 0.33, 0.67, 0.9]);
      F.cyl(0, 0.885, 0, 0.24, 0.02, 0, F.shade(oak, -0.15), 'wood');
      F.cyl(0.1, 0.9, 0.06, 0.02, 0.01, 0, F.col('timberDark'), 'wood');        /* the bung */
    } else if (F.variant === 1) {
      F.frustum(0, 0, 0, 0.28, 0.33, 0.45, 0, oak, 'wood', 18);
      for (const y of [0.06, 0.36]) F.cyl(0, y, 0, 0.28 + 0.05 * (y + 0.015) / 0.45 + 0.008, 0.03, 0, iron, 'metal');
      F.cyl(0, 0.435, 0, 0.31, 0.02, 0, F.col('drinkWater'), 'food');
      for (const s of [-1, 1]) F.box(s * 0.345, 0.38, 0, 0.04, 0.07, 0.08, 0, F.shade(oak, -0.1), 'wood');
    } else {
      barrel(0.27, 0.32, 0.96, [0.08, 0.32, 0.68, 0.92]);
      F.cyl(0, 0.96, 0, 0.3, 0.03, 0, F.shade(oak, -0.08), 'wood');
      F.cyl(0.08, 0.99, 0, 0.05, 0.03, 0, F.col('tin'), 'metal');               /* the dipper on the lid */
      F.rod(0.08, 1.025, 0, -0.18, 1.025, 0.05, 0.012, F.col('timberPine'), 'wood');
    }
  }
});

FURN({
  key: 'generic_keg', name: 'Keg on a Cradle', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['tavern', 'kitchen', 'store', 'hall'], anchor: 'surface', clearance: {},
  materials: ['timber', 'metal'],
  w: 0.42, d: 0.31, h: 0.31, variants: 2, variantNames: ['oak keg', 'dark keg'],
  build: function (F) {
    F.shift(-0.0275, 0);
    const wood = F.col(F.variant ? 'timberWalnut' : 'timberOak'), iron = F.col('iron');
    for (const s of [-1, 1]) {
      F.box(s * 0.12, 0, 0, 0.05, 0.06, 0.3, 0, F.col('timberDark'), 'wood');   /* the cradle chocks */
      F.box(s * 0.12, 0.06, -0.1, 0.05, 0.03, 0.06, 0, F.col('timberDark'), 'wood');
      F.box(s * 0.12, 0.06, 0.1, 0.05, 0.03, 0.06, 0, F.col('timberDark'), 'wood');
    }
    F.rod(-0.18, 0.175, 0, 0.18, 0.175, 0, 0.12, wood, 'wood');
    F.rod(-0.1, 0.175, 0, 0.1, 0.175, 0, 0.13, F.shade(wood, 0.05), 'wood');
    for (const x of [-0.15, -0.07, 0.07, 0.15]) F.rod(x - 0.012, 0.175, 0, x + 0.012, 0.175, 0, Math.abs(x) > 0.1 ? 0.125 : 0.135, iron, 'metal');
    F.rod(0.18, 0.11, 0, 0.235, 0.11, 0, 0.014, F.col('brass'), 'metal');      /* the tap */
    F.box(0.225, 0.12, 0, 0.02, 0.05, 0.02, 0, F.col('brass'), 'metal');
  }
});

FURN({
  key: 'generic_crate', name: 'Slatted Crate', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'market', 'dock', 'yard', 'workshop'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['timber', 'thatch'],
  w: 0.62, d: 0.52, h: 0.84, variants: 3, variantNames: ['lidded', 'open, straw', 'stacked pair'],
  variantDims: [{ w: 0.62, d: 0.44, h: 0.42 }, { w: 0.62, d: 0.52, h: 0.45 }, { w: 0.62, d: 0.44, h: 0.84 }],
  build: function (F) {
    const pine = F.col('timberPine');
    KGEN.crate(F, 0, 0, 0, 0.62, 0.42, 0.44, pine, F.variant !== 1);
    if (F.variant === 1) F.blob(0, 0.38, 0, 0.27, 0.13, 0, F.col('wickerStraw'), 'thatch');
    if (F.variant === 2) KGEN.crate(F, 0, 0.42, 0, 0.62, 0.42, 0.44, F.shade(pine, -0.1), true);
  }
});

FURN({
  key: 'generic_chest', name: 'Storage Chest', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'store', 'hall', 'barracks', 'study'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'metal'],
  w: 0.96, d: 0.53, h: 0.52, variants: 3, variantNames: ['plain', 'iron-bound', 'painted'],
  build: function (F) {
    const wood = F.col(F.variant === 2 ? 'stoneGlazeBlue' : F.variant === 1 ? 'timberWalnut' : 'timberOak');
    const iron = F.col('iron');
    F.box(0, 0, 0, 0.9, 0.4, 0.5, 0, wood, 'wood');
    F.box(0, 0.4, 0, 0.92, 0.06, 0.52, 0, F.shade(wood, 0.06), 'wood');
    F.box(0, 0.46, 0, 0.84, 0.05, 0.44, 0, F.shade(wood, 0.1), 'wood');
    for (const s of [-1, 1]) F.box(s * 0.465, 0.25, 0, 0.03, 0.04, 0.14, 0, iron, 'metal');   /* side handles */
    F.box(0, 0.3, 0.255, 0.08, 0.1, 0.02, 0, F.col('brass'), 'metal');                  /* the lock plate */
    if (F.variant === 1) for (const x of [-0.3, 0, 0.3]) F.box(x, 0, 0, 0.04, 0.515, 0.525, 0, iron, 'metal');
    if (F.variant === 2) {
      for (const x of [-0.25, 0.25]) F.box(x, 0.1, 0.251, 0.26, 0.2, 0.02, 0, F.col('clothOchre'), 'wood');
      F.box(0, 0.02, 0, 0.92, 0.04, 0.52, 0, F.col('timberDark'), 'wood');
    }
  }
});

FURN({
  key: 'generic_strongbox', name: 'Strongbox', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['study', 'bedroom', 'store', 'hall', 'court'], anchor: 'surface', clearance: {},
  materials: ['timber', 'metal'],
  w: 0.34, d: 0.26, h: 0.21, variants: 2, variantNames: ['iron', 'oak and brass'],
  build: function (F) {
    const body = F.col(F.variant ? 'timberOak' : 'iron'), band = F.col(F.variant ? 'brass' : 'timberDark');
    const fam = F.variant ? 'wood' : 'metal', bfam = F.variant ? 'metal' : 'wood';
    F.box(0, 0, 0, 0.32, 0.14, 0.22, 0, body, fam);
    F.box(0, 0.14, 0, 0.34, 0.05, 0.24, 0, F.shade(body, 0.08), fam);
    for (const x of [-0.1, 0.1]) F.box(x, 0, 0, 0.03, 0.195, 0.245, 0, band, bfam);
    F.box(0, 0.08, 0.12, 0.05, 0.06, 0.02, 0, F.col('brass'), 'metal');
    F.box(0, 0.19, 0, 0.1, 0.02, 0.02, 0, band, bfam);
  }
});

FURN({
  key: 'generic_basket', name: 'Basket', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['kitchen', 'store', 'market', 'bedroom', 'hall'], anchor: 'surface', clearance: {},
  materials: ['thatch', 'metal'],
  w: 0.42, d: 0.42, h: 0.32, variants: 3, variantNames: ['round with handle', 'lidded hamper', 'flat tray'],
  variantDims: [{ w: 0.35, d: 0.35, h: 0.32 }, { w: 0.42, d: 0.31, h: 0.26 }, { w: 0.42, d: 0.42, h: 0.08 }],
  build: function (F) {
    const wk = F.col('wickerStraw'), dk = F.col('wickerTan'), inside = F.col('wickerDark');
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.12, 0.17, 0.16, 0, wk, 'thatch', 14);
      F.cyl(0, 0.145, 0, 0.175, 0.02, 0, dk, 'thatch');
      F.cyl(0, 0.152, 0, 0.155, 0.02, 0, inside, 'thatch');
      F.cyl(0, 0.06, 0, 0.142, 0.02, 0, dk, 'thatch');
      const pts = [[-0.16, 0.16], [-0.12, 0.27], [0, 0.305], [0.12, 0.27], [0.16, 0.16]];
      for (let i = 0; i < 4; i++) F.rod(pts[i][0], pts[i][1], 0, pts[i + 1][0], pts[i + 1][1], 0, 0.012, dk, 'thatch');
    } else if (F.variant === 1) {
      F.box(0, 0, 0, 0.4, 0.22, 0.28, 0, wk, 'thatch');
      for (const y of [0.05, 0.15]) F.box(0, y, 0, 0.41, 0.02, 0.29, 0, dk, 'thatch');
      F.box(0, 0.22, 0, 0.42, 0.04, 0.3, 0, F.shade(wk, 0.06), 'thatch');
      F.box(0, 0.17, 0.145, 0.04, 0.07, 0.01, 0, F.col('brass'), 'metal');
    } else {
      F.frustum(0, 0, 0, 0.19, 0.21, 0.06, 0, wk, 'thatch', 16);
      F.cyl(0, 0.045, 0, 0.19, 0.02, 0, inside, 'thatch');
      F.cyl(0, 0.05, 0, 0.21, 0.02, 0, dk, 'thatch');
      F.cyl(0, 0.052, 0, 0.185, 0.02, 0, F.shade(inside, 0.1), 'thatch');
    }
  }
});

FURN({
  key: 'generic_floor_basket', name: 'Floor Basket', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'market', 'bedroom', 'yard'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['thatch', 'food', 'rope'],
  w: 0.65, d: 0.61, h: 0.61, variants: 3, variantNames: ['tall basket', 'grain basket', 'pannier pair'],
  variantDims: [{ w: 0.56, d: 0.52, h: 0.61 }, { w: 0.61, d: 0.61, h: 0.49 }, { w: 0.65, d: 0.31, h: 0.48 }],
  build: function (F) {
    const wk = F.col('wickerTan'), band = F.col('wickerDark');
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.2, 0.25, 0.6, 0, wk, 'thatch', 16);
      for (const y of [0.1, 0.3, 0.5]) F.cyl(0, y, 0, 0.21 + y * 0.083 + 0.005, 0.03, 0, band, 'thatch');
      F.cyl(0, 0.59, 0, 0.23, 0.02, 0, F.shade(band, -0.3), 'thatch');
      for (const s of [-1, 1]) F.box(s * 0.26, 0.48, 0, 0.04, 0.08, 0.1, 0, band, 'thatch');
    } else if (F.variant === 1) {
      F.frustum(0, 0, 0, 0.24, 0.3, 0.4, 0, F.col('wickerStraw'), 'thatch', 18);
      for (const y of [0.08, 0.3]) F.cyl(0, y, 0, 0.25 + y * 0.15 + 0.005, 0.03, 0, wk, 'thatch');
      F.dome(0, 0.39, 0, 0.29, 0.1, 0, F.col('grainStraw'), 'food');
    } else {
      for (const s of [-1, 1]) {
        F.box(s * 0.17, 0, 0, 0.3, 0.45, 0.3, 0, F.shade(wk, s * 0.05), 'thatch');
        F.box(s * 0.17, 0.44, 0, 0.26, 0.02, 0.26, 0, F.shade(band, -0.3), 'thatch');
        for (const y of [0.1, 0.3]) F.box(s * 0.17, y, 0, 0.31, 0.03, 0.31, 0, band, 'thatch');
      }
      F.beam(-0.17, 0.45, 0, 0.17, 0.45, 0, 0.06, 0.05, F.col('clothHessian'), 'rope');
    }
  }
});

FURN({
  key: 'generic_sack', name: 'Sack', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'market', 'dock', 'yard'], anchor: 'floor', clearance: {},
  materials: ['cloth', 'rope'],
  w: 0.76, d: 0.42, h: 0.63, variants: 3, variantNames: ['standing sack', 'slumped pair', 'flour sack'],
  variantDims: [{ w: 0.4, d: 0.39, h: 0.63 }, { w: 0.76, d: 0.42, h: 0.34 }, { w: 0.37, d: 0.37, h: 0.57 }],
  build: function (F) {
    const hes = F.col('clothHessian'), rope = F.col('wickerTan');
    if (F.variant === 0) {
      F.blob(0, 0.26, 0, 0.2, 0.52, 0, hes, 'cloth');
      F.cyl(0, 0.48, 0, 0.07, 0.06, 0, F.shade(hes, -0.05), 'cloth');
      F.cyl(0, 0.5, 0, 0.075, 0.025, 0, rope, 'rope');
      F.cone(0, 0.53, 0, 0.1, 0.1, 0, F.shade(hes, 0.06), 'cloth');
    } else if (F.variant === 1) {
      F.blob(-0.16, 0.17, 0, 0.22, 0.34, 0, hes, 'cloth');
      F.blob(0.18, 0.15, 0, 0.2, 0.3, 0, F.shade(hes, -0.08), 'cloth');
      F.blob(-0.16, 0.31, 0.05, 0.12, 0.06, 0, F.shade(hes, 0.08), 'cloth');
    } else {
      const lin = F.col('clothLinen');
      F.blob(0, 0.22, 0, 0.18, 0.44, 0, lin, 'cloth');
      F.cyl(0, 0.19, 0, 0.183, 0.04, 0, F.col('clothMadder'), 'cloth');
      F.cyl(0, 0.42, 0, 0.06, 0.04, 0, F.col('clothMadder'), 'rope');
      F.cone(0, 0.45, 0, 0.08, 0.12, 0, F.shade(lin, -0.04), 'cloth');
    }
  }
});

FURN({
  key: 'generic_storage_jar', name: 'Storage Jar', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'yard', 'market', 'hall'], anchor: 'floor', clearance: {},
  materials: ['stone', 'metal', 'cloth', 'timber'],
  w: 0.61, d: 0.61, h: 0.88, variants: 3, variantNames: ['amphora on a ring', 'lidded pithos', 'covered water jar'],
  variantDims: [{ w: 0.39, d: 0.4, h: 0.73 }, { w: 0.61, d: 0.61, h: 0.88 }, { w: 0.5, d: 0.5, h: 0.63 }],
  build: function (F) {
    const clay = F.col('stoneClay'), dark = F.col('stoneClayDark');
    if (F.variant === 0) {
      F.cyl(0, 0, 0, 0.11, 0.04, 0, F.col('iron'), 'metal');
      F.frustum(0, 0.03, 0, 0.07, 0.2, 0.31, 0, clay, 'stone', 14);
      F.frustum(0, 0.34, 0, 0.2, 0.075, 0.22, 0, F.shade(clay, 0.05), 'stone', 14);
      F.cyl(0, 0.56, 0, 0.07, 0.14, 0, clay, 'stone');
      F.cyl(0, 0.7, 0, 0.085, 0.03, 0, dark, 'stone');
      for (const s of [-1, 1]) {
        F.rod(s * 0.07, 0.66, 0, s * 0.165, 0.6, 0, 0.014, dark, 'stone');
        F.rod(s * 0.165, 0.6, 0, s * 0.16, 0.44, 0, 0.014, dark, 'stone');
      }
    } else if (F.variant === 1) {
      F.frustum(0, 0, 0, 0.16, 0.3, 0.45, 0, clay, 'stone', 18);
      F.frustum(0, 0.45, 0, 0.3, 0.18, 0.3, 0, F.shade(clay, 0.05), 'stone', 18);
      F.cyl(0, 0.44, 0, 0.303, 0.03, 0, dark, 'stone');
      F.cyl(0, 0.75, 0, 0.2, 0.05, 0, dark, 'stone');
      F.cyl(0, 0.8, 0, 0.21, 0.03, 0, F.col('timberOak'), 'wood');
      F.ball(0, 0.85, 0, 0.03, F.col('timberDark'), 'wood');
    } else {
      F.frustum(0, 0, 0, 0.14, 0.25, 0.35, 0, F.col('stoneBuff'), 'stone', 16);
      F.frustum(0, 0.35, 0, 0.25, 0.15, 0.2, 0, F.shade(F.col('stoneBuff'), 0.04), 'stone', 16);
      F.cyl(0, 0.55, 0, 0.15, 0.04, 0, F.col('stoneGlazeBlue'), 'stone');
      F.dome(0, 0.59, 0, 0.17, 0.04, 0, F.col('clothLinen'), 'cloth');
      F.cyl(0, 0.57, 0, 0.155, 0.02, 0, F.col('clothMadder'), 'cloth');
    }
  }
});

FURN({
  key: 'generic_crock', name: 'Crock', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'store', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['stone', 'glass', 'metal', 'food'],
  w: 0.3, d: 0.24, h: 0.24, variants: 3, variantNames: ['lidded crock', 'pickling jar', 'bean pot'],
  variantDims: [{ w: 0.24, d: 0.24, h: 0.24 }, { w: 0.2, d: 0.2, h: 0.23 }, { w: 0.3, d: 0.23, h: 0.23 }],
  build: function (F) {
    if (F.variant === 0) {
      const buff = F.col('stoneBuff');
      KGEN.jar(F, 0, 0, 0, 0.11, 0.2, buff, F.shade(buff, -0.08), 'stone');
      F.cyl(0, 0.13, 0, 0.112, 0.03, 0, F.col('stoneGlazeBlue'), 'stone');
    } else if (F.variant === 1) {
      KGEN.jar(F, 0, 0, 0, 0.09, 0.19, F.col('glassClear'), F.col('tin'), 'glass', F.col('vegLeaf'));
      for (let i = 0; i < 5; i++) F.ball(Math.cos(i * 1.3) * 0.04, 0.03 + i * 0.03, Math.sin(i * 1.3) * 0.04, 0.025, F.col(i % 2 ? 'vegCarrot' : 'vegCabbage'), 'food');
    } else {
      const c = F.col('stoneClayDark');
      F.blob(0, 0.09, 0, 0.12, 0.18, 0, c, 'stone');
      F.cyl(0, 0.16, 0, 0.08, 0.03, 0, F.shade(c, 0.08), 'stone');
      F.ball(0, 0.2, 0, 0.025, F.shade(c, -0.1), 'stone');
      for (const s of [-1, 1]) F.box(s * 0.13, 0.1, 0, 0.04, 0.03, 0.05, 0, c, 'stone');
    }
  }
});

FURN({
  key: 'generic_canister_set', name: 'Canister Set', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'store'], anchor: 'surface', clearance: {},
  materials: ['metal', 'stone', 'cloth'],
  w: 0.45, d: 0.17, h: 0.28, variants: 2, variantNames: ['tin', 'glazed'],
  build: function (F) {
    const tin = F.variant === 0;
    const body = F.col(tin ? 'tin' : 'stoneCream'), lid = F.col(tin ? 'pewter' : 'stoneGlazeBlue'), fam = tin ? 'metal' : 'stone';
    const rs = [0.06, 0.07, 0.08], hs = [0.16, 0.2, 0.24], xs = [-0.16, -0.02, 0.14];
    for (let i = 0; i < 3; i++) {
      F.cyl(xs[i], 0, 0, rs[i], hs[i], 0, body, fam);
      F.cyl(xs[i], hs[i], 0, rs[i] + 0.004, 0.02, 0, lid, fam);
      F.ball(xs[i], hs[i] + 0.02, 0, 0.02, lid, fam);
      F.box(xs[i], hs[i] * 0.35, rs[i] - 0.006, rs[i] * 1.1, hs[i] * 0.3, 0.02, 0, F.col(tin ? 'paperCream' : 'stoneGlazeBlue'), tin ? 'cloth' : 'stone');
    }
  }
});

FURN({
  key: 'generic_spice_box', name: 'Spice Box', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'store'], anchor: 'surface', clearance: {},
  materials: ['timber', 'stone', 'food'],
  w: 0.37, d: 0.2, h: 0.09, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut');
    F.box(0, 0, 0, 0.36, 0.015, 0.2, 0, wood, 'wood');
    for (const s of [-1, 1]) { F.box(0, 0, s * 0.09, 0.36, 0.06, 0.02, 0, wood, 'wood'); F.box(s * 0.17, 0, 0, 0.02, 0.06, 0.2, 0, wood, 'wood'); }
    const sp = ['spiceRed', 'spiceTurmeric', 'spiceBlack', 'saltWhite', 'vegHerb', 'herbDry', 'nutBrown', 'spiceRed'];
    for (let i = 0; i < 8; i++) {
      const x = -0.12 + (i % 4) * 0.08, z = i < 4 ? -0.04 : 0.04;
      F.cyl(x, 0.015, z, 0.03, 0.07, 0, F.col('stoneCream'), 'stone');
      F.cyl(x, 0.07, z, 0.026, 0.02, 0, F.col(sp[i]), 'food');
    }
  }
});

FURN({
  key: 'generic_bottle_crate', name: 'Bottle Crate', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['tavern', 'store', 'kitchen', 'dock', 'market'], anchor: 'floor', clearance: {},
  materials: ['timber', 'glass', 'stone', 'food'],
  w: 0.5, d: 0.36, h: 0.36, variants: 2, variantNames: ['wine', 'stoneware ale'],
  variantDims: [{ w: 0.5, d: 0.36, h: 0.36 }, { w: 0.5, d: 0.36, h: 0.32 }],
  build: function (F) {
    KGEN.crate(F, 0, 0, 0, 0.5, 0.22, 0.36, F.col('timberPine'), false);
    for (let i = 0; i < 6; i++) {
      const x = -0.15 + (i % 3) * 0.15, z = i < 3 ? -0.08 : 0.08;
      if (F.variant === 0) KGEN.bottle(F, x, 0.02, z, 0.038, 0.34, F.col(i % 2 ? 'glassGreen' : 'glassAmber'), F.col('timberBirch'), F.col('drinkWine'));
      else KGEN.bottle(F, x, 0.02, z, 0.04, 0.3, F.col('stoneBuff'), F.col('timberBirch'), null, 'stone');
    }
  }
});

FURN({
  key: 'generic_pantry_boxes', name: 'Pantry Boxes', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'store', 'bedroom'], anchor: 'surface', clearance: {},
  materials: ['timber', 'thatch', 'rope'],
  w: 0.39, d: 0.29, h: 0.31, variants: 2, variantNames: ['wooden', 'woven'],
  build: function (F) {
    const fam = F.variant ? 'thatch' : 'wood';
    const cs = F.variant ? ['wickerStraw', 'wickerTan', 'wickerStraw'] : ['timberPine', 'timberOak', 'timberBirch'];
    const dims = [[0.38, 0.12, 0.28, 0], [0.32, 0.1, 0.24, 0.02], [0.22, 0.08, 0.18, -0.04]];
    let y = 0;
    dims.forEach(([w, h, d, x], i) => {
      const c = F.col(cs[i]);
      F.box(x, y, 0, w, h - 0.02, d, 0, c, fam);
      F.box(x, y + h - 0.025, 0, w + 0.005, 0.025, d + 0.005, 0, F.shade(c, 0.08), fam);
      y += h;
    });
    F.box(-0.04, 0.2, 0, 0.02, 0.105, 0.185, 0, F.col('clothMadder'), 'rope');
  }
});

FURN({
  key: 'generic_meal_ark', name: 'Meal Ark', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'indoor',
  rooms: ['kitchen', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'metal'],
  w: 0.81, d: 0.5, h: 0.72, variants: 1,
  build: function (F) {
    const pine = F.col('timberPine'), dark = F.col('timberDark');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.37, 0, sz * 0.22, 0.06, 0.08, 0.06, 0, dark, 'wood');
    F.box(0, 0.08, 0, 0.78, 0.56, 0.48, 0, pine, 'wood');
    for (const x of [-0.26, 0, 0.26]) F.box(x, 0.1, 0.24, 0.02, 0.52, 0.02, 0, F.shade(pine, -0.12), 'wood');
    F.box(0, 0.64, 0, 0.8, 0.04, 0.5, 0, F.shade(pine, 0.06), 'wood');
    for (const x of [-0.25, 0.25]) F.box(x, 0.64, -0.24, 0.08, 0.05, 0.02, 0, F.col('iron'), 'metal');
    F.box(0, 0.68, 0.05, 0.16, 0.04, 0.1, 0, F.col('tin'), 'metal');          /* the scoop on the lid */
  }
});

FURN({
  key: 'generic_churn', name: 'Churn', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'storage', setting: 'both',
  rooms: ['kitchen', 'store', 'yard'], anchor: 'floor', clearance: {},
  materials: ['metal', 'timber'],
  w: 0.4, d: 0.34, h: 0.83, variants: 2, variantNames: ['milk churn', 'butter churn'],
  variantDims: [{ w: 0.4, d: 0.34, h: 0.66 }, { w: 0.31, d: 0.31, h: 0.83 }],
  build: function (F) {
    if (F.variant === 0) {
      const tin = F.col('tin');
      F.cyl(0, 0, 0, 0.16, 0.45, 0, tin, 'metal');
      F.frustum(0, 0.45, 0, 0.16, 0.08, 0.12, 0, tin, 'metal', 16);
      F.cyl(0, 0.57, 0, 0.08, 0.06, 0, tin, 'metal');
      F.cyl(0, 0.63, 0, 0.095, 0.03, 0, F.shade(tin, -0.15), 'metal');
      for (const s of [-1, 1]) F.box(s * 0.18, 0.4, 0, 0.04, 0.08, 0.03, 0, F.shade(tin, -0.2), 'metal');
      F.cyl(0, 0.05, 0, 0.165, 0.03, 0, F.shade(tin, -0.2), 'metal');
    } else {
      const oak = F.col('timberOak');
      F.frustum(0, 0, 0, 0.15, 0.11, 0.55, 0, oak, 'wood', 16);
      for (const y of [0.06, 0.45]) F.cyl(0, y, 0, 0.15 - y * 0.073 + 0.008, 0.03, 0, F.col('iron'), 'metal');
      F.cyl(0, 0.55, 0, 0.12, 0.03, 0, F.shade(oak, 0.08), 'wood');
      F.cyl(0, 0.58, 0, 0.015, 0.25, 0, F.col('timberPine'), 'wood');        /* the dasher */
      F.box(0, 0.8, 0, 0.12, 0.03, 0.03, 0, F.col('timberPine'), 'wood');
    }
  }
});

FURN({
  key: 'generic_pantry_shelf', name: 'Pantry Shelf', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'shelf', setting: 'indoor',
  rooms: ['kitchen', 'store', 'tavern'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'glass', 'stone', 'metal', 'cloth', 'thatch', 'food'],
  w: 1.21, d: 0.4, h: 1.8, variants: 2, variantNames: ['empty', 'stocked'],
  build: function (F) {
    const pine = F.col('timberPine'), dark = F.shade(pine, -0.15);
    F.box(0, 0, -0.19, 1.2, 1.8, 0.02, 0, dark, 'wood');
    for (const s of [-1, 1]) F.box(s * 0.58, 0, 0, 0.04, 1.8, 0.4, 0, pine, 'wood');
    const ys = [0.08, 0.52, 0.96, 1.4, 1.76];
    for (const y of ys) F.box(0, y, 0, 1.12, 0.04, 0.38, 0, F.shade(pine, F.rr(-0.04, 0.04)), 'wood');
    F.box(0, 0, 0.18, 1.12, 0.08, 0.02, 0, dark, 'wood');
    if (F.variant !== 1) return;
    /* the boards hold what the surface pieces hold: jars, bottles, a crock, sacks, a basket */
    let y = 0.12;
    KGEN.jar(F, -0.42, y, 0, 0.07, 0.18, F.col('stoneBuff'), F.col('stoneClayDark'), 'stone');
    KGEN.jar(F, -0.26, y, 0, 0.07, 0.22, F.col('stoneCream'), F.col('stoneGlazeBlue'), 'stone');
    F.blob(0.05, y + 0.15, 0, 0.16, 0.3, 0, F.col('clothHessian'), 'cloth');
    F.blob(0.32, y + 0.13, 0.02, 0.14, 0.26, 0, F.col('clothLinen'), 'cloth');
    y = 0.56;
    for (let i = 0; i < 5; i++) KGEN.bottle(F, -0.46 + i * 0.09, y, -0.02, 0.035, 0.3, F.col(i % 2 ? 'glassGreen' : 'glassAmber'), F.col('timberBirch'), F.col(i % 2 ? 'drinkWine' : 'drinkOil'));
    KGEN.jar(F, 0.15, y, 0, 0.09, 0.2, F.col('stoneClay'), F.col('stoneClayDark'), 'stone');
    F.frustum(0.38, y, 0, 0.11, 0.15, 0.14, 0, F.col('wickerStraw'), 'thatch', 14);
    KGEN.heap(F, 0.38, y + 0.12, 0, 0.13, 0.035, F.cols(['vegOnion', 'vegPotato']), 'food');
    y = 1.0;
    for (let i = 0; i < 4; i++) KGEN.clothJar(F, -0.42 + i * 0.12, y, 0, 0.05, 0.12, F.col('glassClear'), F.col(['honeyAmber', 'jamRuby', 'jamRuby', 'honeyAmber'][i]), F.col('clothLinen'), F.col('clothMadder'));
    F.cyl(0.18, y, 0, 0.16, 0.1, 0, F.col('cheeseRind'), 'food');
    F.cyl(0.42, y, -0.02, 0.07, 0.24, 0, F.col('tin'), 'metal');
    y = 1.44;
    for (let i = 0; i < 6; i++) KGEN.jar(F, -0.44 + i * 0.1, y, 0, 0.04, 0.14, F.col('glassClear'), F.col('pewter'), 'glass', F.col(['vegBean', 'grainStraw', 'flourWhite', 'nutBrown', 'spiceRed', 'vegBean'][i]));
    F.box(0.35, y, 0, 0.32, 0.22, 0.26, 0, F.col('wickerTan'), 'thatch');
  }
});

/* ================= Food (21 pieces) ================= */

FURN({
  key: 'generic_bread', name: 'Bread', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['food', 'timber', 'metal'],
  w: 0.56, d: 0.22, h: 0.15, variants: 4, variantNames: ['loaf', 'round boule', 'baguettes', 'sliced on a board'],
  variantDims: [{ w: 0.32, d: 0.12, h: 0.13 }, { w: 0.22, d: 0.22, h: 0.11 }, { w: 0.56, d: 0.17, h: 0.06 }, { w: 0.4, d: 0.22, h: 0.15 }],
  build: function (F) {
    const crust = F.col('breadCrust'), crumb = F.col('breadCrumb');
    if (F.variant === 0) {
      KGEN.capsule(F, -0.1, 0.1, 0, 0, 0.06, crust);
      for (const x of [-0.07, 0, 0.07]) F.box(x, 0.11, 0, 0.02, 0.02, 0.07, 0.5, F.shade(crust, 0.3), 'food');
    } else if (F.variant === 1) {
      F.dome(0, 0, 0, 0.11, 0.1, 0, crust, 'food');
      F.dome(0, 0.06, 0, 0.06, 0.045, 0, F.col('flourWhite'), 'food');
    } else if (F.variant === 2) {
      [-0.05, 0, 0.05].forEach((z, i) => KGEN.capsule(F, -0.25, 0.25, 0, z + (i - 1) * 0.005, 0.03, F.shade(crust, i * 0.06 - 0.06)));
    }
    if (F.variant === 3) {
      F.box(0, 0, 0, 0.4, 0.03, 0.22, 0, F.col('timberPine'), 'wood');
      KGEN.capsule(F, -0.12, 0.03, 0.03, -0.02, 0.06, crust);
      for (const x of [0.1, 0.13, 0.16]) F.box(x, 0.03, -0.02, 0.02, 0.1, 0.1, 0, crumb, 'food');
      F.box(0.02, 0.03, 0.08, 0.2, 0.02, 0.02, 0, F.col('pewter'), 'metal');
    }
  }
});

FURN({
  key: 'generic_bread_basket', name: 'Bread Basket', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'market'], anchor: 'surface', clearance: {},
  materials: ['thatch', 'cloth', 'food'],
  w: 0.34, d: 0.34, h: 0.25, variants: 2, variantNames: ['rolls', 'flatbreads'],
  variantDims: [{ w: 0.34, d: 0.34, h: 0.25 }, { w: 0.34, d: 0.34, h: 0.2 }],
  build: function (F) {
    F.frustum(0, 0, 0, 0.13, 0.17, 0.1, 0, F.col('wickerStraw'), 'thatch', 14);
    F.cyl(0, 0.085, 0, 0.17, 0.02, 0, F.col('clothLinen'), 'cloth');
    const crust = F.col('breadCrust');
    if (F.variant === 0) KGEN.heap(F, 0, 0.1, 0, 0.15, 0.04, [crust, F.shade(crust, 0.1), F.col('breadDark')], 'food',
      (x, y, z, c) => F.blob(x, y + 0.03, z, 0.045, 0.06, 0, c, 'food'));
    else for (let i = 0; i < 6; i++) F.cyl(Math.cos(i) * 0.012, 0.1 + i * 0.016, Math.sin(i) * 0.012, 0.135, 0.02, 0, F.shade(crust, 0.15 - i * 0.03), 'food');
  }
});

FURN({
  key: 'generic_cheese', name: 'Cheese', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['food', 'timber', 'metal', 'cloth'],
  w: 0.4, d: 0.34, h: 0.14, variants: 4, variantNames: ['wheel', 'wedge on a board', 'waxed truckles', 'cheese board'],
  variantDims: [{ w: 0.34, d: 0.34, h: 0.11 }, { w: 0.31, d: 0.31, h: 0.1 }, { w: 0.26, d: 0.13, h: 0.14 }, { w: 0.4, d: 0.26, h: 0.09 }],
  build: function (F) {
    const yel = F.col('cheeseYellow'), rind = F.col('cheeseRind');
    if (F.variant === 0) {
      F.cyl(0, 0, 0, 0.17, 0.1, 0, rind, 'food');
      F.cyl(0, 0.09, 0, 0.06, 0.02, 0, F.col('paperCream'), 'cloth');
    } else if (F.variant === 1) {
      F.cyl(0, 0, 0, 0.15, 0.025, 0, F.col('timberOak'), 'wood');
      F.frustum(-0.02, 0.025, 0, 0.1, 0.1, 0.07, 0.3, yel, 'food', 3);
      F.box(0.06, 0.025, 0.07, 0.14, 0.02, 0.02, 0.4, F.col('pewter'), 'metal');
    } else if (F.variant === 2) {
      for (const [x, y] of [[-0.065, 0], [0.065, 0], [0, 0.07]]) F.cyl(x, y, 0, 0.062, 0.07, 0, F.col(y ? 'waxRed' : 'cheesePale'), 'food');
    } else {
      F.box(0, 0, 0, 0.4, 0.025, 0.26, 0, F.col('timberPine'), 'wood');
      F.frustum(-0.1, 0.025, 0, 0.08, 0.08, 0.06, 0.6, yel, 'food', 3);
      F.cyl(0.05, 0.025, -0.05, 0.05, 0.05, 0, F.col('cheeseBlue'), 'food');
      F.cyl(0.05, 0.025, 0.06, 0.045, 0.04, 0, F.col('cheesePale'), 'food');
      for (let i = 0; i < 6; i++) F.ball(0.14 + (i % 2) * 0.03, 0.045 + Math.floor(i / 2) * 0.012, -0.03 + Math.floor(i / 2) * 0.035, 0.02, F.col('fruitGrape'), 'food');
    }
  }
});

FURN({
  key: 'generic_cured_meat', name: 'Cured Meat', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['food', 'timber', 'stone', 'rope'],
  w: 0.38, d: 0.31, h: 0.18, variants: 3, variantNames: ['ham on a board', 'salami pair', 'sausage coil'],
  variantDims: [{ w: 0.37, d: 0.24, h: 0.18 }, { w: 0.38, d: 0.2, h: 0.09 }, { w: 0.31, d: 0.31, h: 0.07 }],
  build: function (F) {
    const cured = F.col('meatCured');
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.36, 0.03, 0.24, 0, F.col('timberOak'), 'wood');
      F.blob(-0.03, 0.105, 0, 0.12, 0.15, 0, cured, 'food');
      F.blob(-0.07, 0.14, 0.02, 0.06, 0.06, 0, F.col('meatFat'), 'food');
      F.rod(0.07, 0.1, 0, 0.15, 0.11, 0, 0.022, F.col('meatFat'), 'food');
      F.ball(0.16, 0.11, 0, 0.025, F.col('stoneCream'), 'stone');
    } else if (F.variant === 1) {
      F.box(0, 0, 0, 0.36, 0.02, 0.2, 0, F.col('timberPine'), 'wood');
      KGEN.capsule(F, -0.12, 0.1, 0.02, -0.05, 0.035, cured);
      KGEN.capsule(F, -0.1, 0.12, 0.02, 0.04, 0.03, F.shade(cured, 0.1));
      for (let i = 0; i < 3; i++) F.cyl(0.13 + i * 0.012, 0.02 + i * 0.006, 0.05 - i * 0.03, 0.033, 0.02, 0, F.col('meatRed'), 'food');
      F.cyl(-0.155, 0.04, -0.05, 0.012, 0.02, 0, F.col('wickerStraw'), 'rope');
    } else {
      KGEN.plate(F, 0, 0, 0, 0.15, F.col('stoneCream'));
      let px = 0.11, pz = 0, a = 0;
      for (let i = 1; i <= 14; i++) {
        a = i * 0.62; const r = 0.11 - i * 0.0055, nx = Math.cos(a) * r, nz = Math.sin(a) * r;
        F.rod(px, 0.045, pz, nx, 0.045, nz, 0.022, F.col('meatSausage'), 'food');
        F.ball(nx, 0.045, nz, 0.022, F.col('meatSausage'), 'food');
        px = nx; pz = nz;
      }
    }
  }
});

FURN({
  key: 'generic_roast', name: 'Roast on a Platter', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kitchen', 'court'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'metal'],
  w: 0.4, d: 0.4, h: 0.16, variants: 2, variantNames: ['roast fowl', 'roast joint'],
  build: function (F) {
    const roast = F.col('meatRoast'), leaf = F.col('vegLeaf');
    KGEN.plate(F, 0, 0, 0, 0.2, F.col('stoneCream'));
    F.cyl(0, 0.02, 0, 0.17, 0.02, 0, F.shade(F.col('stoneCream'), -0.06), 'stone');
    if (F.variant === 0) {
      F.blob(0, 0.09, -0.01, 0.11, 0.13, 0, roast, 'food');
      F.blob(0, 0.11, 0.04, 0.07, 0.08, 0, F.shade(roast, 0.12), 'food');
      for (const s of [-1, 1]) {
        F.rod(s * 0.07, 0.06, 0.05, s * 0.11, 0.05, 0.13, 0.026, F.shade(roast, -0.06), 'food');
        F.ball(s * 0.115, 0.05, 0.145, 0.02, F.col('meatFat'), 'food');
      }
    } else {
      F.rod(-0.09, 0.09, 0, 0.07, 0.09, 0, 0.065, roast, 'food');
      F.ball(-0.09, 0.09, 0, 0.065, F.shade(roast, -0.06), 'food');
      F.cyl(0.07, 0.04, 0, 0.06, 0.02, 0, F.col('meatRed'), 'food');
      F.rod(0.1, 0.09, 0, 0.17, 0.1, 0, 0.018, F.col('meatFat'), 'food');
      F.box(-0.02, 0.03, 0.12, 0.22, 0.02, 0.02, 0.15, F.col('pewter'), 'metal');
    }
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; F.blob(Math.cos(a) * 0.155, 0.045, Math.sin(a) * 0.155, 0.03, 0.02, 0, leaf, 'food'); }
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.8; F.ball(Math.cos(a) * 0.14, 0.06, Math.sin(a) * 0.14, 0.02, F.col('vegPotato'), 'food'); }
  }
});

FURN({
  key: 'generic_fish', name: 'Fish', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'market', 'dock', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['food', 'timber', 'stone', 'cloth'],
  w: 0.4, d: 0.38, h: 0.07, variants: 3, variantNames: ['pair on a board', 'platter with lemon', 'smoked on paper'],
  variantDims: [{ w: 0.4, d: 0.2, h: 0.07 }, { w: 0.38, d: 0.38, h: 0.07 }, { w: 0.38, d: 0.26, h: 0.06 }],
  build: function (F) {
    const back = F.col('fishBack'), belly = F.col('fishSilver');
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.4, 0.025, 0.2, 0, F.col('timberPine'), 'wood');
      KGEN.fish(F, 0, 0.025, -0.045, 0.3, back, belly, 1);
      KGEN.fish(F, 0.01, 0.025, 0.05, 0.28, F.shade(back, 0.1), belly, -1);
    } else if (F.variant === 1) {
      KGEN.plate(F, 0, 0, 0, 0.19, F.col('stoneGlazeBlue'));
      KGEN.fish(F, 0, 0.02, -0.02, 0.33, back, belly, 1);
      for (const x of [-0.07, 0.07]) F.dome(x, 0.02, 0.1, 0.035, 0.03, 0, F.col('fruitLemon'), 'food');
      for (let i = 0; i < 4; i++) F.blob(-0.1 + i * 0.06, 0.03, -0.12, 0.025, 0.02, 0, F.col('vegHerb'), 'food');
    } else {
      F.box(0, 0, 0, 0.36, 0.02, 0.24, 0.05, F.col('paperCream'), 'cloth');
      for (const z of [-0.06, 0, 0.06]) KGEN.fish(F, z * 0.3, 0.02, z, 0.24, F.col('fishSmoked'), F.shade(F.col('fishSmoked'), 0.2), z > 0 ? 1 : -1);
    }
  }
});

FURN({
  key: 'generic_fruit_bowl', name: 'Fruit Bowl', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['hall', 'kitchen', 'court', 'study', 'bedroom', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['stone', 'timber', 'food'],
  w: 0.31, d: 0.31, h: 0.23, variants: 4, variantNames: ['apples', 'pears and plums', 'citrus', 'grapes'],
  variantDims: [{ w: 0.31, d: 0.31, h: 0.23 }, { w: 0.31, d: 0.31, h: 0.23 }, { w: 0.31, d: 0.31, h: 0.23 }, { w: 0.31, d: 0.31, h: 0.15 }],
  build: function (F) {
    const wood = F.variant % 2 === 1;
    KGEN.bowl(F, 0, 0, 0, 0.15, 0.08, F.col(wood ? 'timberOak' : 'stoneGlazeBlue'), wood ? 'wood' : 'stone');
    const stalk = F.col('timberWalnut');
    if (F.variant === 0) KGEN.heap(F, 0, 0.065, 0, 0.13, 0.035, F.cols(['fruitApple', 'fruitAppleGreen', 'fruitApple']), 'food',
      (x, y, z, c) => KGEN.fruit(F, x, y, z, 0.035, c, stalk));
    else if (F.variant === 1) KGEN.heap(F, 0, 0.065, 0, 0.13, 0.035, F.cols(['fruitPear', 'fruitPlum']), 'food',
      (x, y, z, c) => { if (c === F.col('fruitPear')) { F.blob(x, y + 0.03, z, 0.033, 0.06, 0, c, 'food'); F.ball(x, y + 0.06, z, 0.022, c, 'food'); } else F.ball(x, y + 0.03, z, 0.03, c, 'food'); });
    else if (F.variant === 2) KGEN.heap(F, 0, 0.065, 0, 0.13, 0.038, F.cols(['fruitOrange', 'fruitLemon', 'fruitOrange']), 'food');
    else {
      F.cyl(0, 0.06, 0, 0.13, 0.02, 0, F.col('vegLeaf'), 'food');
      for (const [cx, cz, a] of [[-0.04, -0.02, 0], [0.05, 0.03, 2.4]]) {
        const rows = [4, 3, 3, 2, 1];
        rows.forEach((n, j) => { for (let k = 0; k < n; k++) {
          const u = (k - (n - 1) / 2) * 0.034, v = -0.05 + j * 0.026;
          F.ball(cx + Math.cos(a) * v - Math.sin(a) * u, 0.1 + (j < 3 ? 0.012 : 0), cz + Math.sin(a) * v + Math.cos(a) * u, 0.02, F.shade('fruitGrape', F.rr(-0.06, 0.08)), 'food');
        } });
        F.ball(cx + Math.cos(a) * 0.012, 0.13, cz + Math.sin(a) * 0.012, 0.02, F.shade('fruitGrape', 0.05), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_veg_basket', name: 'Vegetable Basket', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'market', 'store', 'garden'], anchor: 'surface', clearance: {},
  materials: ['thatch', 'food'],
  w: 0.35, d: 0.35, h: 0.31, variants: 4, variantNames: ['carrots', 'onions and garlic', 'potatoes', 'greens'],
  variantDims: [{ w: 0.35, d: 0.35, h: 0.24 }, { w: 0.35, d: 0.35, h: 0.31 }, { w: 0.35, d: 0.35, h: 0.27 }, { w: 0.35, d: 0.35, h: 0.26 }],
  build: function (F) {
    F.frustum(0, 0, 0, 0.13, 0.17, 0.14, 0, F.col('wickerTan'), 'thatch', 14);
    F.cyl(0, 0.13, 0, 0.175, 0.02, 0, F.col('wickerDark'), 'thatch');
    if (F.variant === 0) {
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4, r = i ? 0.05 + (i % 3) * 0.03 : 0, x = Math.cos(a) * r, z = Math.sin(a) * r;
        F.cone(x, 0.09, z, 0.022, 0.08, 0, F.col('vegCarrot'), 'food');
        F.blob(x, 0.2, z, 0.035, 0.08, 0, F.shade('vegLeaf', F.rr(-0.1, 0.1)), 'food');
      }
    } else if (F.variant === 1) {
      KGEN.heap(F, 0, 0.13, 0, 0.16, 0.04, F.cols(['vegOnion', 'vegOnion', 'vegGarlic']), 'food',
        (x, y, z, c) => { F.ball(x, y + 0.035, z, 0.035, c, 'food'); F.cone(x, y + 0.065, z, 0.012, 0.025, 0, F.shade(c, -0.2), 'food'); });
    } else if (F.variant === 2) {
      KGEN.heap(F, 0, 0.13, 0, 0.16, 0.04, [F.col('vegPotato'), F.shade('vegPotato', -0.1), F.shade('vegPotato', 0.08)], 'food',
        (x, y, z, c) => F.blob(x, y + 0.025, z, 0.04, 0.05, F.rr(0, 3), c, 'food'));
    } else {
      for (const [x, z] of [[-0.06, -0.04], [0.06, 0.03], [-0.02, 0.07]]) {
        F.ball(x, 0.19, z, 0.07, F.col('vegCabbage'), 'food');
        F.dome(x, 0.14, z, 0.085, 0.06, 0, F.shade('vegCabbage', -0.15), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_produce', name: 'Loose Produce', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'market', 'store', 'garden'], anchor: 'surface', clearance: {},
  materials: ['food', 'cloth', 'rope'],
  w: 0.44, d: 0.31, h: 0.24, variants: 4, variantNames: ['cabbages', 'pumpkin', 'onion braid', 'garlic heads'],
  variantDims: [{ w: 0.35, d: 0.18, h: 0.16 }, { w: 0.31, d: 0.31, h: 0.24 }, { w: 0.44, d: 0.13, h: 0.08 }, { w: 0.28, d: 0.23, h: 0.09 }],
  build: function (F) {
    if (F.variant === 0) {
      for (const x of [-0.085, 0.085]) {
        F.ball(x, 0.08, 0, 0.075, F.col('vegCabbage'), 'food');
        F.dome(x, 0, 0, 0.088, 0.09, 0, F.shade('vegCabbage', -0.15), 'food');
      }
    } else if (F.variant === 1) {
      const p = F.col('vegPumpkin');
      for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.blob(Math.cos(a) * 0.07, 0.1, Math.sin(a) * 0.07, 0.085, 0.2, 0, F.shade(p, i % 2 ? -0.06 : 0.04), 'food'); }
      F.blob(0, 0.1, 0, 0.12, 0.2, 0, p, 'food');
      F.cyl(0, 0.19, 0, 0.018, 0.05, 0, F.col('vegHerb'), 'food');
    } else if (F.variant === 2) {
      F.rod(-0.22, 0.04, 0, 0.22, 0.04, 0, 0.012, F.col('wickerStraw'), 'rope');
      for (let i = 0; i < 6; i++) F.ball(-0.18 + i * 0.072, 0.04, (i % 2 ? 0.025 : -0.025), 0.04, F.shade('vegOnion', F.rr(-0.08, 0.06)), 'food');
    } else {
      F.box(0, 0, 0, 0.26, 0.02, 0.2, 0.1, F.col('clothLinen'), 'cloth');
      for (const [x, z] of [[-0.07, -0.04], [0.02, -0.05], [0.08, 0.03], [-0.04, 0.05], [0.0, 0.0]]) {
        F.blob(x, 0.045, z, 0.035, 0.05, 0, F.col('vegGarlic'), 'food');
        F.cone(x, 0.065, z, 0.012, 0.015, 0, F.shade('vegGarlic', -0.2), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_eggs', name: 'Eggs', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'market', 'store'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'timber', 'thatch'],
  w: 0.31, d: 0.26, h: 0.12, variants: 3, variantNames: ['bowl of eggs', 'egg tray', 'nest basket'],
  variantDims: [{ w: 0.24, d: 0.24, h: 0.11 }, { w: 0.31, d: 0.22, h: 0.08 }, { w: 0.26, d: 0.26, h: 0.12 }],
  build: function (F) {
    const egg = (x, y, z) => F.blob(x, y + 0.027, z, 0.022, 0.054, 0, F.pick(['eggShell', 'eggBrown', 'eggShell']), 'food');
    if (F.variant === 0) {
      KGEN.bowl(F, 0, 0, 0, 0.12, 0.07, F.col('stoneCream'), 'stone');
      egg(0, 0.055, 0); for (let i = 0; i < 6; i++) egg(Math.cos(i * 1.05) * 0.06, 0.055, Math.sin(i * 1.05) * 0.06);
    } else if (F.variant === 1) {
      const pine = F.col('timberPine');
      F.box(0, 0, 0, 0.3, 0.02, 0.22, 0, pine, 'wood');
      for (const s of [-1, 1]) { F.box(0, 0, s * 0.1, 0.3, 0.03, 0.02, 0, pine, 'wood'); F.box(s * 0.14, 0, 0, 0.02, 0.03, 0.22, 0, pine, 'wood'); }
      for (let i = 0; i < 12; i++) egg(-0.1 + (i % 4) * 0.066, 0.02, -0.06 + Math.floor(i / 4) * 0.06);
    } else {
      F.frustum(0, 0, 0, 0.1, 0.13, 0.07, 0, F.col('wickerTan'), 'thatch', 14);
      F.dome(0, 0.05, 0, 0.12, 0.03, 0, F.col('wickerStraw'), 'thatch');
      egg(0, 0.065, 0); for (let i = 0; i < 5; i++) egg(Math.cos(i * 1.26) * 0.055, 0.06, Math.sin(i * 1.26) * 0.055);
    }
  }
});

FURN({
  key: 'generic_pie', name: 'Pie', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'market'], anchor: 'surface', clearance: {},
  materials: ['food', 'metal', 'stone'],
  w: 0.33, d: 0.3, h: 0.1, variants: 3, variantNames: ['whole pie', 'fruit tart', 'pasties'],
  variantDims: [{ w: 0.3, d: 0.3, h: 0.1 }, { w: 0.28, d: 0.28, h: 0.08 }, { w: 0.33, d: 0.24, h: 0.08 }],
  build: function (F) {
    const crust = F.col('pieCrust');
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.12, 0.14, 0.04, 0, F.col('tin'), 'metal', 18);
      F.dome(0, 0.035, 0, 0.135, 0.055, 0, crust, 'food');
      for (let i = 0; i < 16; i++) { const a = i * F.TAU / 16; F.ball(Math.cos(a) * 0.13, 0.045, Math.sin(a) * 0.13, 0.02, F.shade(crust, 0.08), 'food'); }
      for (const a of [0, 2.1, 4.2]) F.box(Math.cos(a) * 0.03, 0.08, Math.sin(a) * 0.03, 0.03, 0.02, 0.02, a, F.col('breadDark'), 'food');
    } else if (F.variant === 1) {
      F.frustum(0, 0, 0, 0.125, 0.14, 0.035, 0, crust, 'food', 18);
      F.cyl(0, 0.02, 0, 0.125, 0.02, 0, F.col('jamRuby'), 'food');
      for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 0.03 + (i % 4) * 0.025; F.ball(Math.cos(a) * r, 0.055, Math.sin(a) * r, 0.02, F.col('fruitBerry'), 'food'); }
    } else {
      KGEN.plate(F, 0, 0, 0, 0.12, F.col('stoneCream'));
      for (const [x, z] of [[-0.11, -0.05], [-0.04, 0.06], [0.04, -0.05], [0.11, 0.06]]) {
        F.blob(x, 0.045, z, 0.055, 0.05, 0, crust, 'food');
        F.beam(x - 0.05, 0.065, z, x + 0.05, 0.065, z, 0.02, 0.02, F.shade(crust, 0.1), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_cake', name: 'Cake', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['kitchen', 'hall', 'court', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'cloth'],
  w: 0.32, d: 0.32, h: 0.3, variants: 3, variantNames: ['layer cake', 'cake on a stand', 'small cakes'],
  variantDims: [{ w: 0.32, d: 0.32, h: 0.17 }, { w: 0.31, d: 0.31, h: 0.3 }, { w: 0.31, d: 0.31, h: 0.08 }],
  build: function (F) {
    const sponge = F.col('breadCrumb'), cream = F.col('creamWhite');
    if (F.variant === 0) {
      KGEN.plate(F, 0, 0, 0, 0.16, F.col('stoneCream'));
      F.cyl(0, 0.02, 0, 0.12, 0.1, 0, sponge, 'food');
      F.cyl(0, 0.06, 0, 0.122, 0.02, 0, F.col('jamRuby'), 'food');
      F.cyl(0, 0.11, 0, 0.123, 0.02, 0, cream, 'food');
      for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.ball(Math.cos(a) * 0.09, 0.15, Math.sin(a) * 0.09, 0.02, F.col('fruitBerry'), 'food'); }
    } else if (F.variant === 1) {
      const st = F.col('stoneCream');
      F.cyl(0, 0, 0, 0.06, 0.02, 0, st, 'stone'); F.cyl(0, 0.02, 0, 0.02, 0.1, 0, st, 'stone');
      F.cyl(0, 0.12, 0, 0.15, 0.02, 0, st, 'stone');
      F.cyl(0, 0.14, 0, 0.11, 0.11, 0, F.col('icingPink'), 'food');
      F.cyl(0, 0.24, 0, 0.06, 0.04, 0, cream, 'food');
      F.ball(0, 0.28, 0, 0.02, F.col('fruitBerry'), 'food');
    } else {
      KGEN.plate(F, 0, 0, 0, 0.15, F.col('stoneCream'));
      for (let i = 0; i < 7; i++) {
        const a = i * F.TAU / 6, r = i === 6 ? 0 : 0.09, x = Math.cos(a) * r, z = Math.sin(a) * r;
        F.frustum(x, 0.02, z, 0.025, 0.032, 0.03, 0, F.col('paperCream'), 'cloth', 10);
        F.dome(x, 0.05, z, 0.032, 0.028, 0, F.pick(['creamWhite', 'icingPink', 'butterYellow']), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_stew_pot', name: 'Stew Pot', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['kitchen', 'tavern', 'hall'], anchor: 'surface', clearance: {},
  materials: ['metal', 'food', 'timber'],
  w: 0.34, d: 0.29, h: 0.3, variants: 3, variantNames: ['stew with ladle', 'lidded pot', 'kettle'],
  variantDims: [{ w: 0.34, d: 0.28, h: 0.3 }, { w: 0.34, d: 0.29, h: 0.23 }, { w: 0.25, d: 0.2, h: 0.23 }],
  build: function (F) {
    if (F.variant === 2) F.shift(-0.0245, 0);
    const iron = F.col('iron');
    if (F.variant < 2) {
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.cyl(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1, 0.012, 0.03, 0, iron, 'metal'); }
      F.cyl(0, 0.03, 0, 0.14, 0.14, 0, iron, 'metal');
      for (const s of [-1, 1]) F.box(s * 0.155, 0.13, 0, 0.03, 0.03, 0.06, 0, iron, 'metal');
    }
    if (F.variant === 0) {
      F.cyl(0, 0.155, 0, 0.13, 0.02, 0, F.col('stewBrown'), 'food');
      for (let i = 0; i < 5; i++) F.ball(Math.cos(i * 1.3) * 0.07, 0.175, Math.sin(i * 1.3) * 0.07, 0.02, F.col(i % 2 ? 'vegCarrot' : 'vegPotato'), 'food');
      F.rod(0.04, 0.12, 0, 0.12, 0.29, 0.06, 0.01, F.col('timberOak'), 'wood');
    } else if (F.variant === 1) {
      F.dome(0, 0.17, 0, 0.145, 0.035, 0, F.shade(iron, 0.1), 'metal');
      F.ball(0, 0.205, 0, 0.02, F.col('timberOak'), 'wood');
    } else {
      F.cyl(0, 0, 0, 0.08, 0.02, 0, iron, 'metal');
      F.blob(0, 0.08, 0, 0.1, 0.14, 0, iron, 'metal');
      F.cyl(0, 0.14, 0, 0.04, 0.02, 0, iron, 'metal'); F.ball(0, 0.165, 0, 0.02, iron, 'metal');
      F.rod(0.08, 0.06, 0, 0.14, 0.13, 0, 0.012, iron, 'metal');
      const h = [[-0.07, 0.12], [-0.05, 0.22], [0.05, 0.22], [0.07, 0.12]];
      for (let i = 0; i < 3; i++) F.rod(h[i][0], h[i][1], 0, h[i + 1][0], h[i + 1][1], 0, 0.01, F.col('brass'), 'metal');
    }
  }
});

FURN({
  key: 'generic_meal', name: 'Place Setting', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kitchen', 'court', 'barracks'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'metal', 'timber'],
  w: 0.43, d: 0.29, h: 0.08, variants: 4, variantNames: ['breakfast', 'dinner', 'soup and bread', 'porridge and tea'],
  variantDims: [{ w: 0.43, d: 0.29, h: 0.08 }, { w: 0.43, d: 0.29, h: 0.08 }, { w: 0.43, d: 0.24, h: 0.08 }, { w: 0.43, d: 0.24, h: 0.08 }],
  build: function (F) {
    if (F.variant >= 2) F.shift(0, -0.0275);
    const ware = F.col(F.variant % 2 ? 'stoneCream' : 'stoneBuff'), pew = F.col('pewter');
    F.box(-0.205, 0, 0.0, 0.02, 0.02, 0.18, 0, pew, 'metal');              /* fork and knife either side */
    F.box(0.085, 0, 0.06, 0.02, 0.02, 0.17, 0, pew, 'metal');
    KGEN.mug(F, 0.16, 0, -0.04, 0.035, 0.075, F.col(F.variant === 3 ? 'stoneGlazeBlue' : 'timberOak'), F.variant === 3 ? 'stone' : 'wood',
      F.col(F.variant === 3 ? 'drinkTea' : F.variant === 0 ? 'drinkMilk' : 'drinkAle'));
    if (F.variant === 0) {
      KGEN.plate(F, -0.06, 0, 0, 0.12, ware);
      for (const x of [-0.1, -0.03]) { F.cyl(x, 0.02, -0.03, 0.035, 0.02, 0, F.col('eggShell'), 'food'); F.dome(x, 0.03, -0.03, 0.02, 0.015, 0, F.col('eggYolk'), 'food'); }
      F.box(-0.04, 0.02, 0.05, 0.09, 0.02, 0.07, 0.2, F.col('breadCrumb'), 'food');
      KGEN.capsule(F, -0.13, -0.08, 0.02, 0.05, 0.015, F.col('meatSausage'));
    } else if (F.variant === 1) {
      KGEN.plate(F, -0.06, 0, 0, 0.12, ware);
      F.cyl(-0.06, 0.02, 0, 0.1, 0.02, 0, F.col('sauceRed'), 'food');
      F.box(-0.09, 0.025, 0.0, 0.08, 0.035, 0.06, 0.3, F.col('meatRoast'), 'food');
      F.dome(-0.01, 0.03, -0.03, 0.04, 0.04, 0, F.col('creamWhite'), 'food');
      for (let i = 0; i < 6; i++) F.ball(-0.04 + (i % 3) * 0.022, 0.045, 0.05 + Math.floor(i / 3) * 0.02, 0.02, F.col('vegLeaf'), 'food');
    } else {
      KGEN.bowl(F, -0.06, 0, 0, 0.09, 0.06, ware, 'stone', F.col(F.variant === 2 ? 'soupGold' : 'creamWhite'));
      if (F.variant === 3) F.cyl(-0.06, 0.044, 0, 0.03, 0.02, 0, F.col('honeyAmber'), 'food');
      F.box(-0.03, 0.05, 0.03, 0.02, 0.02, 0.14, -0.5, pew, 'metal');
      if (F.variant === 2) F.blob(0.04, 0.03, 0.08, 0.04, 0.06, 0, F.col('breadCrust'), 'food');
    }
  }
});

FURN({
  key: 'generic_preserves', name: 'Preserves', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['kitchen', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['glass', 'food', 'cloth', 'metal', 'timber'],
  w: 0.43, d: 0.15, h: 0.21, variants: 3, variantNames: ['honey and jam', 'pickles', 'dried goods'],
  variantDims: [{ w: 0.32, d: 0.11, h: 0.13 }, { w: 0.31, d: 0.15, h: 0.21 }, { w: 0.43, d: 0.1, h: 0.17 }],
  build: function (F) {
    const glass = F.col('glassClear');
    if (F.variant === 0) {
      ['honeyAmber', 'jamRuby', 'fruitPlum'].forEach((k, i) => KGEN.clothJar(F, -0.105 + i * 0.105, 0, 0, 0.048, 0.1, glass, F.col(k), F.col(i === 1 ? 'clothMadder' : 'clothLinen'), F.col('wickerTan')));
    } else if (F.variant === 1) {
      for (const x of [-0.08, 0.08]) {
        KGEN.jar(F, x, 0, 0, 0.07, 0.17, glass, F.col('tin'), 'glass', F.shade('vegLeaf', 0.2));
        for (let i = 0; i < 4; i++) F.cyl(x + Math.cos(i * 1.6) * 0.03, 0.01, Math.sin(i * 1.6) * 0.03, 0.015, 0.14, 0, F.col('vegHerb'), 'food');
      }
    } else {
      ['vegBean', 'grainStraw', 'flourWhite', 'fruitBerry'].forEach((k, i) => KGEN.bottle(F, -0.165 + i * 0.11, 0, 0, 0.05, 0.16, glass, F.col('timberBirch'), F.col(k)));
    }
  }
});

FURN({
  key: 'generic_dairy', name: 'Butter and Milk', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['kitchen', 'store', 'hall'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'glass', 'timber'],
  w: 0.32, d: 0.16, h: 0.25, variants: 2, variantNames: ['butter and jug', 'milk bottles'],
  variantDims: [{ w: 0.32, d: 0.16, h: 0.19 }, { w: 0.31, d: 0.09, h: 0.25 }],
  build: function (F) {
    if (F.variant === 0) {
      const cr = F.col('stoneCream');
      KGEN.plate(F, -0.08, 0, 0, 0.08, cr);
      F.box(-0.08, 0.02, 0, 0.1, 0.05, 0.06, 0.2, F.col('butterYellow'), 'food');
      F.frustum(0.08, 0, 0, 0.06, 0.05, 0.1, 0, cr, 'stone', 14);
      F.frustum(0.08, 0.1, 0, 0.05, 0.065, 0.08, 0, cr, 'stone', 14);
      F.cyl(0.08, 0.165, 0, 0.055, 0.02, 0, F.col('drinkMilk'), 'food');
      F.cone(0.08, 0.16, 0.06, 0.02, 0.03, 0, cr, 'stone');
      F.box(0.15, 0.06, 0, 0.02, 0.1, 0.02, 0, cr, 'stone');
    } else {
      for (const x of [-0.11, 0, 0.11]) KGEN.bottle(F, x, 0, 0, 0.045, 0.24, F.col('glassClear'), F.col('paperCream'), F.col('drinkMilk'));
    }
  }
});

FURN({
  key: 'generic_snack_bowl', name: 'Bowl of Dry Goods', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'market', 'store'], anchor: 'surface', clearance: {},
  materials: ['stone', 'timber', 'food'],
  w: 0.19, d: 0.19, h: 0.1, variants: 4, variantNames: ['nuts', 'grain', 'beans', 'olives'],
  build: function (F) {
    const k = ['nutBrown', 'grainStraw', 'vegBean', 'fruitPlum'][F.variant];
    const wood = F.variant % 2 === 0;
    KGEN.bowl(F, 0, 0, 0, 0.095, 0.06, F.col(wood ? 'timberOak' : 'stoneClay'), wood ? 'wood' : 'stone', F.col(k));
    F.dome(0, 0.055, 0, 0.08, 0.03, 0, F.shade(k, -0.08), 'food');
    for (let i = 0; i < 7; i++) { const a = i * 0.9, r = i ? 0.04 : 0; F.ball(Math.cos(a) * r, 0.08 - r * 0.25, Math.sin(a) * r, 0.02, F.shade(k, F.rr(-0.1, 0.1)), 'food'); }
  }
});

FURN({
  key: 'generic_pastries', name: 'Pastries', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'tavern', 'hall', 'market', 'court'], anchor: 'surface', clearance: {},
  materials: ['food', 'stone', 'glass'],
  w: 0.28, d: 0.28, h: 0.12, variants: 3, variantNames: ['buns', 'biscuits', 'sweets dish'],
  variantDims: [{ w: 0.28, d: 0.28, h: 0.11 }, { w: 0.28, d: 0.28, h: 0.12 }, { w: 0.26, d: 0.26, h: 0.12 }],
  build: function (F) {
    if (F.variant === 2) {
      F.frustum(0, 0, 0, 0.08, 0.13, 0.05, 0, F.col('glassClear'), 'glass', 16);
      KGEN.heap(F, 0, 0.03, 0, 0.11, 0.02, F.cols(['fruitBerry', 'icingPink', 'fruitLemon', 'stoneGlazeGreen', 'creamWhite']), 'food');
      return;
    }
    KGEN.plate(F, 0, 0, 0, 0.14, F.col('stoneCream'));
    const crust = F.col('breadCrust');
    if (F.variant === 0) {
      for (let i = 0; i < 6; i++) {
        const a = i * F.TAU / 5, r = i === 5 ? 0 : 0.085, x = Math.cos(a) * r, z = Math.sin(a) * r;
        F.blob(x, 0.05 + (i === 5 ? 0.02 : 0), z, 0.045, 0.06, 0, F.shade(crust, 0.1), 'food');
        F.dome(x, 0.065 + (i === 5 ? 0.02 : 0), z, 0.025, 0.02, 0, F.col('creamWhite'), 'food');
      }
    } else {
      for (const [x, z, n] of [[-0.06, -0.04, 5], [0.06, -0.03, 4], [0, 0.07, 3]])
        for (let j = 0; j < n; j++) F.cyl(x, 0.02 + j * 0.018, z, 0.038, 0.018, 0, F.shade('pieCrust', j % 2 ? 0.08 : 0), 'food');
    }
  }
});

FURN({
  key: 'generic_condiments', name: 'Cruet Tray', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kitchen', 'court'], anchor: 'surface', clearance: {},
  materials: ['metal', 'glass', 'stone', 'timber', 'food'],
  w: 0.22, d: 0.14, h: 0.18, variants: 3, variantNames: ['salt and pepper', 'oil and vinegar', 'mustard and sauce'],
  build: function (F) {
    F.box(0, 0, 0, 0.22, 0.02, 0.14, 0, F.col(F.variant === 1 ? 'pewter' : 'timberWalnut'), F.variant === 1 ? 'metal' : 'wood');
    if (F.variant === 0) {
      F.cyl(-0.05, 0.02, 0, 0.03, 0.08, 0, F.col('stoneCream'), 'stone'); F.dome(-0.05, 0.1, 0, 0.03, 0.02, 0, F.col('pewter'), 'metal');
      F.cyl(0.05, 0.02, 0, 0.028, 0.12, 0, F.col('timberOak'), 'wood'); F.ball(0.05, 0.15, 0, 0.022, F.col('timberDark'), 'wood');
      F.cyl(-0.05, 0.03, 0.04, 0.02, 0.02, 0, F.col('saltWhite'), 'food');
    } else if (F.variant === 1) {
      KGEN.bottle(F, -0.05, 0.02, 0, 0.035, 0.15, F.col('glassClear'), F.col('pewter'), F.col('drinkOil'));
      KGEN.bottle(F, 0.05, 0.02, 0, 0.035, 0.15, F.col('glassClear'), F.col('pewter'), F.col('drinkWine'));
    } else {
      KGEN.jar(F, -0.05, 0.02, 0, 0.035, 0.07, F.col('stoneGlazeOchre'), F.col('stoneCream'), 'stone');
      KGEN.bottle(F, 0.05, 0.02, 0, 0.035, 0.14, F.col('glassAmber'), F.col('waxRed'), F.col('sauceRed'));
    }
  }
});

FURN({
  key: 'generic_mushrooms', name: 'Mushrooms', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: ['kitchen', 'market', 'store'], anchor: 'surface', clearance: {},
  materials: ['food', 'thatch', 'stone'],
  w: 0.28, d: 0.28, h: 0.15, variants: 2, variantNames: ['basket', 'plate'],
  variantDims: [{ w: 0.28, d: 0.28, h: 0.15 }, { w: 0.26, d: 0.26, h: 0.08 }],
  build: function (F) {
    const shroom = (x, y, z, s) => {
      F.cyl(x, y, z, 0.012 * s, 0.035 * s, 0, F.col('creamWhite'), 'food');
      F.dome(x, y + 0.03 * s, z, 0.032 * s, 0.025 * s, 0, F.shade('vegMushroom', F.rr(-0.15, 0.05)), 'food');
    };
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.11, 0.14, 0.08, 0, F.col('wickerTan'), 'thatch', 14);
      F.cyl(0, 0.065, 0, 0.13, 0.02, 0, F.col('wickerDark'), 'thatch');
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 0.025 + (i % 3) * 0.03; shroom(Math.cos(a) * r, 0.085, Math.sin(a) * r, 1.1); }
    } else {
      KGEN.plate(F, 0, 0, 0, 0.13, F.col('stoneBuff'));
      for (let i = 0; i < 7; i++) { const a = i * 2.4, r = i ? 0.04 + (i % 2) * 0.04 : 0; shroom(Math.cos(a) * r, 0.02, Math.sin(a) * r, 1); }
    }
  }
});

FURN({
  key: 'generic_hanging_larder', name: 'Hanging Larder', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'indoor',
  rooms: ['kitchen', 'store', 'tavern'], anchor: 'ceiling', clearance: {},
  materials: ['timber', 'food', 'rope'],
  w: 0.93, d: 0.2, h: 0.8, variants: 1,
  build: function (F) {
    const rope = F.col('wickerTan');
    F.rod(-0.46, 0.74, 0, 0.46, 0.74, 0, 0.025, F.col('timberOak'), 'wood');
    for (const x of [-0.4, 0.4]) F.rod(x, 0.74, 0, x, 0.8, 0, 0.008, rope, 'rope');
    F.box(0, 0.78, 0, 0.9, 0.02, 0.04, 0, F.col('timberDark'), 'wood');
    /* a ham, two strings of sausage, herb bunches stems up, a garlic string */
    F.rod(-0.3, 0.74, 0, -0.3, 0.62, 0, 0.006, rope, 'rope');
    F.blob(-0.3, 0.48, 0, 0.1, 0.28, 0, F.col('meatCured'), 'food');
    for (const x of [-0.12, -0.06]) for (let i = 0; i < 5; i++) F.ball(x, 0.69 - i * 0.07, 0, 0.025, F.shade('meatSausage', i % 2 ? 0.05 : -0.05), 'food');
    for (const x of [0.06, 0.16, 0.26]) {
      F.cyl(x, 0.62, 0, 0.015, 0.12, 0, rope, 'rope');
      F.cone(x, 0.42, 0, 0.06, 0.22, 0, F.shade('herbDry', F.rr(-0.1, 0.1)), 'food');
    }
    for (let i = 0; i < 6; i++) F.ball(0.4 + (i % 2 ? 0.02 : -0.02), 0.68 - i * 0.065, 0, 0.032, F.col('vegGarlic'), 'food');
  }
});

/* ================= Drink (6 pieces) ================= */

FURN({
  key: 'generic_wine', name: 'Wine', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'indoor',
  rooms: ['tavern', 'hall', 'court', 'kitchen', 'store'], anchor: 'surface', clearance: {},
  materials: ['glass', 'food', 'timber', 'metal'],
  w: 0.4, d: 0.3, h: 0.32, variants: 4, variantNames: ['bottle and goblet', 'two bottles', 'wine rack', 'decanter set'],
  variantDims: [{ w: 0.2, d: 0.08, h: 0.32 }, { w: 0.18, d: 0.08, h: 0.32 }, { w: 0.4, d: 0.3, h: 0.24 }, { w: 0.34, d: 0.2, h: 0.28 }],
  build: function (F) {
    const cork = F.col('timberBirch'), wine = F.col('drinkWine'), clear = F.col('glassClear');
    if (F.variant === 0) {
      KGEN.bottle(F, -0.05, 0, 0, 0.04, 0.32, F.col('glassGreen'), cork, wine);
      KGEN.goblet(F, 0.06, 0, 0.0, clear, wine);
    } else if (F.variant === 1) {
      KGEN.bottle(F, -0.05, 0, 0, 0.04, 0.32, F.col('glassGreen'), cork, wine);
      KGEN.bottle(F, 0.05, 0, 0, 0.04, 0.3, F.col('glassAmber'), F.col('waxRed'), F.col('drinkSpirit'));
    } else if (F.variant === 2) {
      const wood = F.col('timberOak');
      for (const s of [-1, 1]) F.box(s * 0.19, 0, 0, 0.02, 0.24, 0.24, 0, wood, 'wood');
      for (const y of [0, 0.11, 0.22]) F.box(0, y, 0, 0.36, 0.02, 0.24, 0, F.shade(wood, 0.05), 'wood');
      for (const y of [0.02, 0.13]) for (const x of [-0.12, 0, 0.12]) {
        F.rod(x, y + 0.04, -0.13, x, y + 0.04, 0.07, 0.04, F.col(x ? 'glassGreen' : 'glassAmber'), 'glass');
        F.rod(x, y + 0.04, 0.07, x, y + 0.04, 0.15, 0.014, cork, 'wood');
      }
    } else {
      F.box(0, 0, 0, 0.34, 0.02, 0.2, 0, F.col('brass'), 'metal');
      F.cyl(-0.08, 0.02, 0, 0.055, 0.04, 0, clear, 'glass');
      F.blob(-0.08, 0.11, 0, 0.07, 0.14, 0, clear, 'glass');
      F.blob(-0.08, 0.09, 0, 0.055, 0.08, 0, F.col('drinkSpirit'), 'food');
      F.cyl(-0.08, 0.17, 0, 0.018, 0.07, 0, clear, 'glass'); F.ball(-0.08, 0.255, 0, 0.025, clear, 'glass');
      for (const [x, z] of [[0.06, -0.04], [0.11, 0.05]]) KGEN.mug(F, x, 0.02, z, 0.03, 0.07, clear, 'glass', F.col('drinkSpirit'));
    }
  }
});

FURN({
  key: 'generic_ale', name: 'Ale', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'both',
  rooms: ['tavern', 'hall', 'kitchen', 'barracks'], anchor: 'surface', clearance: {},
  materials: ['timber', 'metal', 'food', 'stone', 'glass'],
  w: 0.36, d: 0.21, h: 0.25, variants: 3, variantNames: ['tankard pair', 'pitcher and mugs', 'foaming stein'],
  variantDims: [{ w: 0.28, d: 0.19, h: 0.16 }, { w: 0.36, d: 0.21, h: 0.25 }, { w: 0.13, d: 0.09, h: 0.2 }],
  build: function (F) {
    const foam = F.col('drinkFoam'), ale = F.col('drinkAle');
    const tankard = (x, z, wood, h) => {
      KGEN.mug(F, x, 0, z, 0.05, h, wood, 'wood', ale);
      for (const y of [0.02, h - 0.04]) F.cyl(x, y, z, 0.053, 0.015, 0, F.col('iron'), 'metal');
      F.dome(x, h, z, 0.046, 0.03, 0, foam, 'food');
    };
    if (F.variant === 0) { tankard(-0.08, -0.03, F.col('timberOak'), 0.13); tankard(0.07, 0.04, F.col('timberWalnut'), 0.12); }
    else if (F.variant === 1) {
      const buff = F.col('stoneBuff');
      F.frustum(-0.08, 0, 0, 0.08, 0.06, 0.18, 0, buff, 'stone', 14);
      F.frustum(-0.08, 0.18, 0, 0.06, 0.075, 0.06, 0, F.col('stoneGlazeOchre'), 'stone', 14);
      F.cyl(-0.08, 0.225, 0, 0.065, 0.02, 0, ale, 'food');
      F.cone(-0.08, 0.215, 0.08, 0.025, 0.035, 0, buff, 'stone');
      F.box(-0.17, 0.06, 0, 0.02, 0.14, 0.03, 0, buff, 'stone');
      KGEN.mug(F, 0.08, 0, -0.06, 0.04, 0.1, buff, 'stone', ale);
      KGEN.mug(F, 0.1, 0, 0.06, 0.04, 0.1, buff, 'stone', ale);
    } else {
      F.cyl(0, 0, 0, 0.045, 0.16, 0, F.col('glassAmber'), 'glass');
      F.cyl(0, 0.005, 0, 0.04, 0.14, 0, ale, 'food');
      F.dome(0, 0.155, 0, 0.044, 0.04, 0, foam, 'food');
      F.box(0.055, 0.03, 0, 0.02, 0.1, 0.02, 0, F.col('glassAmber'), 'glass');
    }
  }
});

FURN({
  key: 'generic_spirits', name: 'Spirits', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'both',
  rooms: ['tavern', 'store', 'barracks', 'kitchen', 'study'], anchor: 'surface', clearance: {},
  materials: ['stone', 'timber', 'metal', 'food', 'glass'],
  w: 0.29, d: 0.24, h: 0.3, variants: 3, variantNames: ['stoneware jug', 'hip flask and cups', 'cordial bottles'],
  variantDims: [{ w: 0.29, d: 0.24, h: 0.3 }, { w: 0.24, d: 0.1, h: 0.18 }, { w: 0.23, d: 0.07, h: 0.25 }],
  build: function (F) {
    if (F.variant === 1) F.shift(-0.0175, -0.005);
    if (F.variant === 0) {
      const buff = F.col('stoneBuff'), dip = F.col('stoneClayDark');
      F.frustum(0, 0, 0, 0.1, 0.12, 0.13, 0, buff, 'stone', 16);
      F.frustum(0, 0.13, 0, 0.12, 0.04, 0.09, 0, dip, 'stone', 16);
      F.cyl(0, 0.22, 0, 0.035, 0.05, 0, dip, 'stone');
      F.cyl(0, 0.27, 0, 0.03, 0.03, 0, F.col('timberBirch'), 'wood');
      F.beam(0.03, 0.25, 0, 0.13, 0.17, 0, 0.025, 0.02, dip, 'stone');
      F.beam(0.13, 0.17, 0, 0.115, 0.1, 0, 0.025, 0.02, dip, 'stone');
    } else if (F.variant === 1) {
      const tin = F.col('pewter');
      F.box(-0.05, 0, 0, 0.1, 0.14, 0.035, 0, tin, 'metal');
      F.cyl(-0.05, 0.14, 0, 0.015, 0.02, 0, tin, 'metal'); F.cyl(-0.05, 0.16, 0, 0.02, 0.02, 0, F.col('brass'), 'metal');
      for (const [x, z] of [[0.05, -0.02], [0.095, 0.03]]) KGEN.mug(F, x, 0, z, 0.022, 0.045, tin, 'metal', F.col('drinkSpirit'));
    } else {
      ['glassViolet', 'glassBlue', 'glassGreen'].forEach((k, i) => KGEN.bottle(F, -0.08 + i * 0.08, 0, 0, 0.035, [0.24, 0.2, 0.17][i], F.col(k), F.col('waxRed'), F.col(['fruitPlum', 'drinkSpirit', 'vegHerb'][i])));
    }
  }
});

FURN({
  key: 'generic_tea_set', name: 'Tea Set', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'indoor',
  rooms: ['hall', 'court', 'study', 'kitchen', 'bedroom'], anchor: 'surface', clearance: {},
  materials: ['stone', 'metal', 'food', 'timber'],
  w: 0.4, d: 0.26, h: 0.4, variants: 3, variantNames: ['teapot and cups', 'coffee pot', 'samovar'],
  variantDims: [{ w: 0.4, d: 0.26, h: 0.19 }, { w: 0.31, d: 0.2, h: 0.26 }, { w: 0.28, d: 0.25, h: 0.4 }],
  build: function (F) {
    if (F.variant === 2) F.shift(0, -0.0175);
    const ware = F.col('stoneCream'), blue = F.col('stoneGlazeBlue');
    const cup = (x, z) => { F.cyl(x, 0.02, z, 0.05, 0.02, 0, ware, 'stone'); KGEN.mug(F, x, 0.04, z, 0.035, 0.045, ware, 'stone', F.col('drinkTea')); };
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.4, 0.02, 0.26, 0, F.col('timberWalnut'), 'wood');
      F.blob(-0.07, 0.085, 0, 0.08, 0.13, 0, blue, 'stone');
      F.dome(-0.07, 0.14, 0, 0.04, 0.025, 0, ware, 'stone'); F.ball(-0.07, 0.17, 0, 0.02, ware, 'stone');
      F.rod(0.0, 0.07, 0, 0.06, 0.13, 0, 0.012, blue, 'stone');
      F.beam(-0.14, 0.13, 0, -0.17, 0.07, 0, 0.02, 0.02, blue, 'stone');
      cup(0.12, -0.06); cup(0.13, 0.07);
    } else if (F.variant === 1) {
      const cu = F.col('copper');
      F.frustum(-0.06, 0, 0, 0.07, 0.045, 0.2, 0, cu, 'metal', 14);
      F.dome(-0.06, 0.2, 0, 0.045, 0.03, 0, cu, 'metal'); F.ball(-0.06, 0.24, 0, 0.02, F.col('brass'), 'metal');
      F.rod(-0.02, 0.1, 0, 0.04, 0.2, 0, 0.012, cu, 'metal');
      F.box(-0.135, 0.06, 0, 0.02, 0.12, 0.02, 0, F.col('timberDark'), 'wood');
      cup(0.09, -0.04); cup(0.1, 0.05);
    } else {
      const br = F.col('brass');
      F.frustum(0, 0, 0, 0.1, 0.06, 0.04, 0, br, 'metal', 14);
      F.cyl(0, 0.04, 0, 0.03, 0.04, 0, br, 'metal');
      F.blob(0, 0.17, 0, 0.11, 0.2, 0, br, 'metal');
      F.cyl(0, 0.26, 0, 0.05, 0.04, 0, F.shade(br, -0.1), 'metal');
      for (const s of [-1, 1]) F.box(s * 0.125, 0.18, 0, 0.03, 0.05, 0.02, 0, F.col('timberDark'), 'wood');
      F.rod(0, 0.1, 0.1, 0, 0.1, 0.14, 0.012, br, 'metal');
      F.blob(0, 0.33, 0, 0.06, 0.08, 0, blue, 'stone');                        /* the teapot on top */
      F.ball(0, 0.38, 0, 0.02, ware, 'stone');
      F.rod(0.05, 0.32, 0, 0.09, 0.37, 0, 0.01, blue, 'stone');
    }
  }
});

FURN({
  key: 'generic_water', name: 'Water', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'both',
  rooms: ['bedroom', 'kitchen', 'hall', 'barracks', 'yard'], anchor: 'surface', clearance: {},
  materials: ['stone', 'food', 'glass', 'skin', 'metal', 'timber'],
  w: 0.36, d: 0.37, h: 0.26, variants: 3, variantNames: ['pitcher and basin', 'carafe and cups', 'waterskin'],
  variantDims: [{ w: 0.36, d: 0.37, h: 0.26 }, { w: 0.28, d: 0.14, h: 0.24 }, { w: 0.33, d: 0.23, h: 0.1 }],
  build: function (F) {
    const water = F.col('drinkWater');
    if (F.variant === 0) {
      const ware = F.col('stoneCream');
      F.frustum(0, 0, 0, 0.1, 0.18, 0.09, 0, ware, 'stone', 18);
      F.cyl(0, 0.075, 0, 0.165, 0.02, 0, water, 'food');
      F.frustum(0.03, 0.02, 0, 0.06, 0.05, 0.13, 0, F.col('stoneGlazeBlue'), 'stone', 14);
      F.frustum(0.03, 0.15, 0, 0.05, 0.07, 0.09, 0, F.col('stoneGlazeBlue'), 'stone', 14);
      F.cone(0.03, 0.22, 0.07, 0.025, 0.035, 0, F.col('stoneGlazeBlue'), 'stone');
      F.box(-0.05, 0.1, 0, 0.02, 0.12, 0.02, 0, F.col('stoneGlazeBlue'), 'stone');
    } else if (F.variant === 1) {
      const clear = F.col('glassClear');
      F.cyl(-0.05, 0.005, 0, 0.05, 0.13, 0, water, 'food');
      F.frustum(-0.05, 0, 0, 0.06, 0.06, 0.14, 0, clear, 'glass', 14);
      F.frustum(-0.05, 0.14, 0, 0.06, 0.025, 0.06, 0, clear, 'glass', 14);
      F.cyl(-0.05, 0.2, 0, 0.025, 0.04, 0, clear, 'glass');
      for (const [x, z] of [[0.06, -0.03], [0.09, 0.04]]) KGEN.mug(F, x, 0, z, 0.028, 0.08, clear, 'glass', water);
    } else {
      const sk = F.col('timberWalnut');
      F.blob(-0.02, 0.05, 0, 0.12, 0.1, 0, sk, 'skin');
      F.blob(0.08, 0.04, 0, 0.06, 0.07, 0, F.shade(sk, 0.06), 'skin');
      F.rod(0.1, 0.04, 0, 0.13, 0.05, 0, 0.018, F.col('pewter'), 'metal');
      F.cyl(0.14, 0.03, 0, 0.022, 0.04, 0, F.col('timberBirch'), 'wood');
    }
  }
});

/* ================= Supplies (11 pieces) ================= */

FURN({
  key: 'generic_candle_supply', name: 'Candle Stock', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['store', 'shrine', 'kitchen', 'bedroom', 'study', 'temple'], anchor: 'surface', clearance: {},
  materials: ['cloth', 'timber', 'rope'],
  w: 0.32, d: 0.14, h: 0.21, variants: 3, variantNames: ['tied bundle', 'candle box', 'tallow row'],
  variantDims: [{ w: 0.28, d: 0.1, h: 0.05 }, { w: 0.32, d: 0.14, h: 0.08 }, { w: 0.31, d: 0.08, h: 0.21 }],
  build: function (F) {
    const wax = F.col(F.variant === 2 ? 'waxHoney' : 'waxBone');
    if (F.variant === 0) {
      for (let i = 0; i < 7; i++) { const z = (i % 4 - 1.5) * 0.024, y = i < 4 ? 0.012 : 0.034, zz = i < 4 ? z : z + 0.012; F.rod(-0.14, y, zz, 0.14, y, zz, 0.012, F.shade(wax, -i * 0.01), 'cloth'); }
      for (const x of [-0.06, 0.06]) F.box(x, 0, 0, 0.015, 0.05, 0.1, 0, F.col('clothMadder'), 'rope');
    } else if (F.variant === 1) {
      const pine = F.col('timberPine');
      F.box(0, 0, 0, 0.32, 0.015, 0.14, 0, pine, 'wood');
      for (const s of [-1, 1]) { F.box(0, 0, s * 0.06, 0.32, 0.06, 0.02, 0, pine, 'wood'); F.box(s * 0.15, 0, 0, 0.02, 0.06, 0.14, 0, pine, 'wood'); }
      for (let i = 0; i < 4; i++) F.rod(-0.13, 0.05 + (i % 2) * 0.012, -0.036 + i * 0.024, 0.13, 0.05 + (i % 2) * 0.012, -0.036 + i * 0.024, 0.012, wax, 'cloth');
    } else {
      F.box(0, 0, 0, 0.3, 0.02, 0.08, 0, F.col('timberOak'), 'wood');
      [0.17, 0.14, 0.12, 0.16, 0.1].forEach((h, i) => { F.cyl(-0.12 + i * 0.06, 0.02, 0, 0.015, h, 0, F.shade(wax, -i * 0.02), 'cloth'); F.cyl(-0.12 + i * 0.06, 0.02 + h, 0, 0.01, 0.02, 0, F.col('inkBlack'), 'rope'); });
    }
  }
});

FURN({
  key: 'generic_lamp_oil', name: 'Lamp Oil and Tinder', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['store', 'kitchen', 'bedroom', 'study', 'workshop'], anchor: 'surface', clearance: {},
  materials: ['stone', 'metal', 'timber', 'food', 'cloth'],
  w: 0.31, d: 0.15, h: 0.26, variants: 3, variantNames: ['oil jar and lamp', 'oil can', 'tinderbox and spills'],
  variantDims: [{ w: 0.31, d: 0.15, h: 0.26 }, { w: 0.25, d: 0.14, h: 0.24 }, { w: 0.25, d: 0.12, h: 0.05 }],
  build: function (F) {
    if (F.variant === 1) F.shift(-0.0215, 0);
    if (F.variant === 0) {
      const clay = F.col('stoneClay');
      F.frustum(-0.07, 0, 0, 0.06, 0.075, 0.14, 0, clay, 'stone', 14);
      F.frustum(-0.07, 0.14, 0, 0.075, 0.03, 0.06, 0, clay, 'stone', 14);
      F.cyl(-0.07, 0.2, 0, 0.03, 0.04, 0, clay, 'stone');
      F.cyl(-0.07, 0.24, 0, 0.033, 0.02, 0, F.col('timberBirch'), 'wood');
      F.blob(0.07, 0.025, 0, 0.055, 0.05, 0, F.col('stoneClayDark'), 'stone');
      F.cyl(0.07, 0.035, 0, 0.025, 0.02, 0, F.col('drinkOil'), 'food');
      F.rod(0.11, 0.03, 0, 0.15, 0.035, 0, 0.012, F.col('stoneClayDark'), 'stone');
    } else if (F.variant === 1) {
      const tin = F.col('tin');
      F.cyl(-0.03, 0, 0, 0.07, 0.16, 0, tin, 'metal');
      F.dome(-0.03, 0.16, 0, 0.07, 0.03, 0, F.shade(tin, -0.1), 'metal');
      F.rod(0.02, 0.17, 0, 0.14, 0.23, 0, 0.007, tin, 'metal');
      F.rod(-0.08, 0.17, 0, -0.08, 0.22, 0, 0.008, F.col('iron'), 'metal');
      F.rod(-0.08, 0.22, 0, 0.0, 0.22, 0, 0.008, F.col('iron'), 'metal');
    } else {
      const tin = F.col('tin');
      F.box(-0.06, 0, 0, 0.1, 0.035, 0.07, 0, tin, 'metal');
      F.box(-0.06, 0.035, 0, 0.1, 0.01, 0.07, 0, F.shade(tin, 0.1), 'metal');
      F.box(-0.06, 0.03, 0.05, 0.06, 0.02, 0.02, 0, F.col('stoneGrey'), 'stone');
      for (let i = 0; i < 5; i++) F.rod(0.03, 0.006 + (i % 2) * 0.008, -0.04 + i * 0.02, 0.12, 0.006 + (i % 2) * 0.008, -0.03 + i * 0.02, 0.005, F.col('paperCream'), 'cloth');
    }
  }
});

FURN({
  key: 'generic_soap', name: 'Soap and Towels', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['bedroom', 'kitchen', 'store', 'barracks'], anchor: 'surface', clearance: {},
  materials: ['food', 'cloth', 'timber', 'stone'],
  w: 0.3, d: 0.17, h: 0.08, variants: 2, variantNames: ['soap bars', 'wash set'],
  variantDims: [{ w: 0.2, d: 0.13, h: 0.07 }, { w: 0.3, d: 0.17, h: 0.08 }],
  build: function (F) {
    const bars = ['soapCream', 'soapGreen', 'clothRose', 'soapCream'];
    if (F.variant === 0) {
      bars.forEach((k, i) => F.box(i < 2 ? -0.045 : 0.045, (i % 2) * 0.035, 0, 0.08, 0.035, 0.11, i * 0.1, F.col(k), 'food'));
    } else {
      F.box(-0.06, 0, 0, 0.18, 0.04, 0.16, 0, F.col('clothLinen'), 'cloth');
      F.box(-0.06, 0.04, 0, 0.18, 0.04, 0.16, 0, F.col('clothSage'), 'cloth');
      F.box(-0.06, 0.04, 0.075, 0.18, 0.04, 0.02, 0, F.col('clothIndigo'), 'cloth');
      F.cyl(0.1, 0, -0.03, 0.05, 0.02, 0, F.col('stoneCream'), 'stone');
      F.box(0.1, 0.02, -0.03, 0.07, 0.03, 0.05, 0, F.col('soapGreen'), 'food');
      F.box(0.1, 0, 0.06, 0.1, 0.03, 0.04, 0, F.col('timberOak'), 'wood');
      F.box(0.1, 0.03, 0.06, 0.08, 0.02, 0.03, 0, F.col('wickerStraw'), 'cloth');
    }
  }
});

FURN({
  key: 'generic_medicine', name: 'Medicines', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['study', 'bedroom', 'store', 'shrine', 'barracks'], anchor: 'surface', clearance: {},
  materials: ['glass', 'food', 'cloth', 'metal', 'stone', 'timber'],
  w: 0.34, d: 0.15, h: 0.19, variants: 3, variantNames: ['apothecary bottles', 'bandages and salve', 'mortar and pestle'],
  variantDims: [{ w: 0.34, d: 0.06, h: 0.19 }, { w: 0.32, d: 0.15, h: 0.06 }, { w: 0.28, d: 0.15, h: 0.16 }],
  build: function (F) {
    if (F.variant === 0) {
      const g = ['glassBlue', 'glassAmber', 'glassGreen', 'glassViolet', 'glassClear'], hs = [0.18, 0.12, 0.15, 0.1, 0.13];
      for (let i = 0; i < 5; i++) KGEN.bottle(F, -0.14 + i * 0.07, 0, 0, i % 2 ? 0.025 : 0.03, hs[i], F.col(g[i]), F.col(i === 2 ? 'waxRed' : 'timberBirch'),
        F.col(['medicineRed', 'honeyAmber', 'vegHerb', 'fruitPlum', 'drinkWater'][i]));
    } else if (F.variant === 1) {
      for (let i = 0; i < 3; i++) F.rod(-0.13 + i * 0.07, 0.03, -0.04, -0.13 + i * 0.07, 0.03, 0.05, 0.03, F.shade('clothLinen', -i * 0.04), 'cloth');
      for (const [x, z] of [[0.08, -0.03], [0.12, 0.04]]) { F.cyl(x, 0, z, 0.032, 0.02, 0, F.col('tin'), 'metal'); F.cyl(x, 0.02, z, 0.033, 0.01, 0, F.col('medicineRed'), 'metal'); }
    } else {
      const st = F.col('stoneGrey');
      F.frustum(-0.06, 0, 0, 0.055, 0.075, 0.07, 0, st, 'stone', 16);
      F.cyl(-0.06, 0.055, 0, 0.06, 0.02, 0, F.col('herbDry'), 'food');
      F.rod(-0.07, 0.04, 0, -0.01, 0.15, 0.03, 0.014, F.shade(st, 0.1), 'stone');
      KGEN.bowl(F, 0.08, 0, 0, 0.06, 0.04, F.col('timberOak'), 'wood', F.col('vegHerb'));
    }
  }
});

FURN({
  key: 'generic_herb_bundles', name: 'Herbs', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['kitchen', 'study', 'shrine', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['food', 'timber', 'rope', 'glass', 'metal'],
  w: 0.37, d: 0.24, h: 0.16, variants: 2, variantNames: ['drying bundles', 'herb jars'],
  variantDims: [{ w: 0.37, d: 0.24, h: 0.05 }, { w: 0.3, d: 0.1, h: 0.16 }],
  build: function (F) {
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.36, 0.02, 0.24, 0, F.col('timberPine'), 'wood');
      for (const [z, k] of [[-0.07, 'herbDry'], [0, 'vegHerb'], [0.07, 'clothSage']]) {
        for (let j = -2; j <= 2; j++) F.rod(-0.12, 0.03, z, 0.13, 0.03, z + j * 0.012, 0.006, F.shade(k, -0.2), 'food');
        for (let j = 0; j < 4; j++) F.blob(-0.02 + j * 0.045, 0.03, z, 0.028, 0.025, 0, F.shade(k, F.rr(-0.1, 0.1)), 'food');
        F.cyl(-0.1, 0.02, z, 0.012, 0.02, 0, F.col('clothMadder'), 'rope');
      }
    } else {
      ['vegHerb', 'herbDry', 'clothSage'].forEach((k, i) => KGEN.jar(F, -0.1 + i * 0.1, 0, 0, 0.045, 0.12, F.col('glassClear'), F.col('pewter'), 'glass', F.col(k)));
    }
  }
});

FURN({
  key: 'generic_tobacco', name: 'Pipe and Tobacco', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['tavern', 'study', 'hall', 'barracks'], anchor: 'surface', clearance: {},
  materials: ['timber', 'skin', 'food', 'stone'],
  w: 0.28, d: 0.13, h: 0.16, variants: 2, variantNames: ['pipe and pouch', 'tobacco jar'],
  variantDims: [{ w: 0.25, d: 0.11, h: 0.07 }, { w: 0.28, d: 0.13, h: 0.16 }],
  build: function (F) {
    if (F.variant === 1) F.shift(-0.0235, 0);
    const pipe = (x, z) => {
      F.cyl(x, 0, z, 0.018, 0.04, 0, F.col('timberWalnut'), 'wood');
      F.cyl(x, 0.035, z, 0.012, 0.01, 0, F.col('coalBlack'), 'food');
      F.rod(x + 0.015, 0.012, z, x + 0.13, 0.025, z + 0.02, 0.006, F.col('timberDark'), 'wood');
    };
    if (F.variant === 0) {
      F.blob(-0.07, 0.03, 0, 0.055, 0.06, 0, F.col('timberWalnut'), 'skin');
      F.blob(-0.07, 0.06, 0, 0.025, 0.02, 0, F.col('tobaccoBrown'), 'food');
      pipe(-0.01, -0.03);
    } else {
      const ware = F.col('stoneGlazeGreen');
      KGEN.jar(F, -0.05, 0, 0, 0.06, 0.12, ware, F.shade(ware, -0.15), 'stone');
      pipe(0.03, 0.03);
    }
  }
});

FURN({
  key: 'generic_writing_supplies', name: 'Writing Supplies', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['study', 'library', 'school', 'court', 'store'], anchor: 'surface', clearance: {},
  materials: ['cloth', 'glass', 'food', 'metal'],
  w: 0.33, d: 0.31, h: 0.21, variants: 2, variantNames: ['ink and quill', 'paper and sealing wax'],
  variantDims: [{ w: 0.12, d: 0.07, h: 0.21 }, { w: 0.33, d: 0.31, h: 0.04 }],
  build: function (F) {
    if (F.variant === 0) {
      F.cyl(-0.03, 0, 0, 0.03, 0.045, 0, F.col('glassClear'), 'glass');
      F.cyl(-0.03, 0.003, 0, 0.026, 0.035, 0, F.col('inkBlack'), 'food');
      F.rod(-0.03, 0.03, 0, 0.04, 0.19, 0.02, 0.004, F.col('paperCream'), 'cloth');
      F.beam(0.0, 0.1, 0.008, 0.045, 0.2, 0.022, 0.03, 0.02, F.col('waxBone'), 'cloth');
    } else {
      for (let i = 0; i < 4; i++) F.box(-0.06 + i * 0.004, i * 0.008, 0, 0.21, 0.008, 0.297, i * 0.02, F.shade('paperCream', -i * 0.03), 'cloth');
      F.rod(0.1, 0.008, -0.06, 0.12, 0.008, 0.06, 0.008, F.col('waxRed'), 'food');
      F.cyl(0.13, 0, 0.1, 0.02, 0.04, 0, F.col('brass'), 'metal');
    }
  }
});

FURN({
  key: 'generic_sewing', name: 'Sewing Supplies', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'indoor',
  rooms: ['bedroom', 'workshop', 'store', 'market'], anchor: 'surface', clearance: {},
  materials: ['timber', 'cloth', 'thatch', 'metal'],
  w: 0.3, d: 0.31, h: 0.25, variants: 2, variantNames: ['spools', 'yarn basket'],
  variantDims: [{ w: 0.21, d: 0.13, h: 0.06 }, { w: 0.3, d: 0.31, h: 0.25 }],
  build: function (F) {
    const yarns = ['clothMadder', 'clothIndigo', 'clothOchre', 'clothSage', 'clothRose', 'clothLinen'];
    if (F.variant === 0) {
      for (let i = 0; i < 6; i++) {
        const x = -0.08 + (i % 3) * 0.08, z = i < 3 ? -0.03 : 0.03;
        F.cyl(x, 0, z, 0.025, 0.01, 0, F.col('timberBirch'), 'wood');
        F.cyl(x, 0.01, z, 0.02, 0.035, 0, F.col(yarns[i]), 'cloth');
        F.cyl(x, 0.045, z, 0.025, 0.01, 0, F.col('timberBirch'), 'wood');
      }
      F.box(0.0, 0, 0.055, 0.08, 0.02, 0.01, 0, F.col('pewter'), 'metal');
    } else {
      F.frustum(0, 0, 0, 0.12, 0.15, 0.09, 0, F.col('wickerStraw'), 'thatch', 14);
      F.cyl(0, 0.075, 0, 0.13, 0.02, 0, F.col('wickerDark'), 'thatch');
      KGEN.heap(F, 0, 0.08, 0, 0.13, 0.04, F.cols(yarns), 'cloth');
      F.rod(-0.06, 0.1, 0.02, 0.06, 0.16, -0.02, 0.005, F.col('timberBirch'), 'wood');
    }
  }
});

FURN({
  key: 'generic_rations', name: 'Travel Rations', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'both',
  rooms: ['barracks', 'store', 'dock', 'yard', 'market'], anchor: 'surface', clearance: {},
  materials: ['cloth', 'rope', 'food', 'skin', 'metal'],
  w: 0.36, d: 0.18, h: 0.13, variants: 2, variantNames: ['ration bundle', 'hardtack and jerky'],
  variantDims: [{ w: 0.36, d: 0.18, h: 0.13 }, { w: 0.31, d: 0.15, h: 0.08 }],
  build: function (F) {
    if (F.variant === 0) {
      F.box(-0.06, 0, 0, 0.2, 0.1, 0.16, 0, F.col('clothHessian'), 'cloth');
      F.box(-0.06, 0, 0, 0.21, 0.105, 0.02, 0, F.col('wickerTan'), 'rope');
      F.box(-0.06, 0, 0, 0.02, 0.105, 0.17, 0, F.col('wickerTan'), 'rope');
      F.blob(0.11, 0.05, 0.02, 0.07, 0.1, 0, F.col('timberWalnut'), 'skin');
      F.cyl(0.11, 0.09, 0.02, 0.018, 0.04, 0, F.col('pewter'), 'metal');
    } else {
      for (let i = 0; i < 4; i++) F.box(-0.07 + (i % 2) * 0.004, i * 0.018, 0, 0.12, 0.018, 0.12, i * 0.08, F.shade('pieCrust', 0.1 - i * 0.02), 'food');
      for (let i = 0; i < 4; i++) F.box(0.09, 0, -0.05 + i * 0.033, 0.12, 0.02, 0.025, 0.05 * i, F.col('meatCured'), 'food');
    }
  }
});

FURN({
  key: 'generic_fuel', name: 'Fuel', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'supply', setting: 'both',
  rooms: ['kitchen', 'hall', 'workshop', 'store', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'rope', 'metal', 'food', 'foliage'],
  w: 0.57, d: 0.39, h: 0.43, variants: 3, variantNames: ['kindling bundle', 'coal scuttle', 'peat stack'],
  variantDims: [{ w: 0.57, d: 0.2, h: 0.2 }, { w: 0.36, d: 0.31, h: 0.43 }, { w: 0.54, d: 0.39, h: 0.4 }],
  build: function (F) {
    if (F.variant) F.shift(F.variant === 1 ? -0.018 : -0.037, 0);   /* centre the footprint */
    if (F.variant === 0) {
      for (let i = 0; i < 14; i++) { const a = i * 2.4, r = (i % 4) * 0.025, z = Math.cos(a) * r, y = 0.1 + Math.sin(a) * r; F.rod(-0.28, y, z, 0.28, y + F.rr(-0.02, 0.02), z, 0.016, F.shade('timberBirch', F.rr(-0.2, 0)), 'wood'); }
      for (const x of [-0.14, 0.14]) F.box(x, 0, 0, 0.03, 0.2, 0.2, 0, F.col('wickerTan'), 'rope');
    } else if (F.variant === 1) {
      const iron = F.col('iron');
      F.frustum(0, 0, 0, 0.13, 0.15, 0.3, 0, iron, 'metal', 16);
      F.cyl(0, 0.28, 0, 0.14, 0.02, 0, F.col('coalBlack'), 'food');
      KGEN.heap(F, 0, 0.28, 0, 0.14, 0.035, [F.col('coalBlack'), F.shade('coalBlack', 0.1)], 'food');
      const h = [[-0.15, 0.3], [-0.1, 0.4], [0.1, 0.4], [0.15, 0.3]];
      for (let i = 0; i < 3; i++) F.rod(h[i][0], h[i][1], 0, h[i + 1][0], h[i + 1][1], 0, 0.01, iron, 'metal');
      F.box(0.17, 0, 0.1, 0.04, 0.32, 0.04, 0.3, F.col('timberDark'), 'wood');
    } else {
      const peat = F.col('breadDark');
      for (let j = 0; j < 4; j++) for (let i = 0; i < 3 - (j > 1 ? 1 : 0); i++)
        F.box(-0.15 + i * 0.15 + (j % 2) * 0.075, j * 0.1, 0, 0.14, 0.1, 0.38, F.rr(-0.05, 0.05), F.shade(peat, F.rr(-0.1, 0.1)), 'plant');
    }
  }
});
