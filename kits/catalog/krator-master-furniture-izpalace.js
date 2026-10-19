/* ======================================================================
   krator-master-furniture-izpalace.js — THE IZIZ IMPERIAL PALACE: its court pieces (2026-10)
   Not a culture file. Like -jobs.js its name is a category: a build bundles it only when it names 'izpalace'
   (furniture_bundle.bundle([..., 'izpalace'])). Every entry is culture 'iziz' and is drawn for the palace of
   settlements/iziz/palace (BLUEPRINT.md, FURNITURE.md: the throne, the lararium's busts and altar, the bath, the
   treasury's strongboxes, the map room, the standards, the heliograph, and the extravagance round them: chandeliers,
   torcheres, orbs, sun reliefs, urns and palms, couches, the banquet table, mirrors, the harp, the trophy of Hook,
   fan screens, the crimson runner and the baldachin).
   Every `rooms` list here is PALACE-ONLY (the pal_* kinds): no other build has a room of these kinds, so the
   placer elsewhere never picks these pieces.
   The file adds the colours its pieces need to the Iziz palette through its own PALETTE block, as DEFAULTS (the
   culture's own file wins for a key both define), and draws only through F, so it needs no file beside it.
   Influences as the Iziz court set: Art Deco (stepped profiles, sunbursts, fluting), Roman (busts, standards,
   couches), science fantasy (salvaged electrics, glowing glass, the Orb).
   ====================================================================== */
/* PALETTE */
/* every key a piece here names that the core's Iziz palette lacks, as a DEFAULT: Iziz's own file wins for a key both
   define (the marble, mahogany and cream below repeat its values), so this file only fills gaps and recolours nothing */
FURN_CULTURE('iziz', { palette: Object.assign({
  /* repeated from krator-master-furniture-iziz.js, so the file stands alone */
  marbleWhite: 0xe8e4dc, marbleVein: 0xc8c0b0, mahoganyRed: 0x6a2a1e, mahoganyDark: 0x44190f, mahoganyLight: 0x8a4030,
  clothCream: 0xf3e2c0, ceramicTeal: 0x2f8f8a,
  /* the court finishes (krator-master-furniture-iziz.js, 2026-10-19): the court's veneer, upholstery and gilding draw in these
     keys, so a page that packs the court sets lays marquetry, brocade, velvet and gold leaf on them (FAMILY_SPLITS) */
  courtMahogany: 0x6b2b1f, courtBrocade: 0x9b2c2c, courtClothGold: 0xd3ae36, courtClothTeal: 0x2e8e89, courtClothCream: 0xf2e1bf,
  courtGilt: 0xd8b13b,
  /* new: warm electric bulbs, the Orb, crystal */
  bulbWarm: 0xffe2a8, orbCore: 0xfff2c8, orbGlass: 0xffd890, glassCrystal: 0xe6f2f6,
  /* new: enamel (the Iziz colours as glazed enamel) */
  enamelOrange: 0xe07a2a, enamelTeal: 0x2f8f8a, enamelCream: 0xf3e2c0,
  /* new: the bath */
  poolWater: 0x1f6468, poolDeep: 0x0f3436, towelWhite: 0xf2ede2,
  /* new: the map of the crater */
  mapLand: 0xc8aa78, mapGreen: 0x6a8a4a, mapRim: 0x8a7a62, mapLake: 0x1a3440,
  /* new: books, mirrors */
  paperPage: 0xefe6d0, bookCalf: 0x5a2418, mirrorGlass: 0xcfe4e8, mirrorSilver: 0xb8bcc0,
  /* new: palms and their soil */
  palmFrond: 0x2f7a30, palmFrondDark: 0x245a24, palmStem: 0x6a7a3a, palmTrunk: 0x6a5440, palmTrunkDark: 0x5a4636, soilDark: 0x3a2a1e,
  /* new: the broken mech of Hook */
  mechPaint: 0x5a6450, mechSteel: 0x5c5f60, mechScorch: 0x2a2622, mechLens: 0x6a1a12, mechCable: 0x1e1e1e, mechMark: 0xb8b0a0,
  /* new: the banquet's fruit */
  fruitPomegranate: 0xa8322a, fruitGrape: 0x5a2a5a
}, FPAL['iziz'] || {}) });
/* END PALETTE */

/* ---- helpers (draw only through F) ---- */
/* a stepped (deco) plinth of n steps, each sh high and inset (iw, id) a side from the one below; returns its top y */
function izpSteps(F, x, y, z, w, d, n, sh, iw, id, col, fam) {
  for (let i = 0; i < n; i++) F.box(x, y + i * sh, z, w - 2 * iw * i, sh, d - 2 * id * i, 0, col, fam);
  return y + n * sh;
}
/* a ring of radius R (tube radius r) about (cx, cy, cz) in the plane of the unit vectors u, v (local frame) */
const IZP_X = [1, 0, 0], IZP_Y = [0, 1, 0], IZP_Z = [0, 0, 1];
function izpRing(F, cx, cy, cz, R, r, u, v, col, fam, n, seg) {
  n = n || 20; const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = i / n * F.TAU, c = Math.cos(a) * R, s = Math.sin(a) * R;
    pts.push([cx + u[0] * c + v[0] * s, cy + u[1] * c + v[1] * s, cz + u[2] * c + v[2] * s]);
  }
  F.tube(pts, r, col, fam, { seg: seg || 6 });
}
/* a round medallion facing +z (a flat ellipsoid), CENTRED at (x, y, z), thickness t */
function izpDisc(F, x, y, z, R, t, col, fam) {
  if (R < 0.1) F.rod(x, y, z - t / 2, x, y, z + t / 2, R, col, fam);   /* a small one: an eight-sided coin */
  else F.ell(x, y, z, R, R, t / 2, 0, col, fam);
}
/* draw fn() in a frame moved to local (x, z) and turned ry more (restored after) */
function izpAt(F, x, z, ry, fn) {
  const X = F.x, Z = F.z, RY = F.ry;
  F.shift(x, z); F.ry = RY + ry;
  fn();
  F.x = X; F.z = Z; F.ry = RY;
}
/* a ray of a sunburst in the x-y plane at depth z: a beam from radius r0 to r1 about (cx, cy), angle a, width w, depth d */
function izpRay(F, cx, cy, z, a, r0, r1, w, d, col, fam) {
  const c = Math.cos(a), s = Math.sin(a);
  F.beam(cx + c * r0, cy + s * r0, z, cx + c * r1, cy + s * r1, z, w, d, col, fam);
}
/* a fan palm's crown: n fronds from (x, y, z), each a stem and a two-part blade turned out along its own heading
   (the frame is turned per frond so every blade lies flat across its heading); reaches y + 0.93 H and radius R */
function izpPalm(F, x, y, z, H, R, n, ph) {
  const st = F.col('palmStem'), fr = [F.col('palmFrond'), F.col('palmFrondDark')], wA = Math.min(0.34, R * 0.4), wB = wA * 0.55;
  for (let i = 0; i < n; i++) {
    const k = ((i * 5) % n) / n;
    izpAt(F, x, z, (ph || 0) + i / n * F.TAU, function () {
      const r1 = R * (0.22 + 0.22 * k), y1 = y + H * (0.72 - 0.3 * k);
      const rA = r1 + R * 0.26, yA = y1 + H * 0.2 * (1 - k);
      const rB = R * 0.9 - wB / 2, yB = yA - H * 0.16 * k;
      F.rod(0, y, 0, 0, y1, r1, 0.014, st, 'plant');
      F.beam(0, y1, r1, 0, yA, rA, wA, 0.02, fr[i % 2], 'plant');
      F.beam(0, yA, rA, 0, yB, rB, wB, 0.02, fr[(i + 1) % 2], 'plant');
    });
  }
}
/* the palace's state rooms (where the court's extravagance goes) */
const IZP_STATE = ['pal_throne', 'pal_feast', 'pal_reception', 'pal_atrium', 'pal_council', 'pal_bedchamber', 'pal_library', 'pal_lararium', 'pal_music'];

/* ======== the blueprint's NEW pieces (settlements/iziz/palace/FURNITURE.md) ======== */

/* UNIQUE: the imperial throne on its dais, the Orb behind and above it in a gilt sunburst (the Aula Regia, pal_throne) */
FURN({
  key: 'iziz_court_imperial_throne', name: 'Imperial throne and the Orb (unique)', culture: 'iziz', tier: 'court', type: 'chair', role: 'throne', setting: 'indoor',
  rooms: ['pal_throne'], anchor: 'floor', clearance: { front: 2.0 },
  materials: ['stone', 'gold', 'hyperMahogany', 'cloth', 'bronze', 'glass', 'emissive', 'ceramic'],
  w: 4.0, d: 3.2, h: 5.0, variants: 1,
  build: function (F) {
    const M = F.col('marbleWhite'), MV = F.col('marbleVein'), G = F.col('courtGilt'), GL = F.col('giltLight'), B = F.col('bronze'), BD = F.col('bronzeDark');
    const W = F.col('courtMahogany'), CR = F.col('courtBrocade'), OR = F.col('enamelOrange'), BU = F.col('bulbWarm');
    /* the dais: three white-marble steps, backs flush, a gilt nosing on each, a crimson runner up the middle */
    for (let i = 0; i < 3; i++) {
      const w = 4 - 0.6 * i, d = 3.2 - 0.5 * i, zc = -1.6 + d / 2, y = 0.2 * i;
      F.box(0, y, zc, w, 0.2, d, 0, M, 'stone');
      F.box(0, y + 0.03, zc + d / 2 - 0.004, w, 0.03, 0.012, 0, MV, 'stone');                 /* a vein band on the riser */
      F.box(0, y + 0.16, zc + d / 2 - 0.02, w, 0.04, 0.05, 0, G, 'gold');                     /* the gilt nosing */
      F.box(0, y, zc + d / 2 + 0.004, 1.3, 0.2, 0.012, 0, CR, 'cloth');                       /* the runner on the riser */
      const next = i < 2 ? -1.6 + (3.2 - 0.5 * (i + 1)) : 0.05;
      F.box(0, y + 0.2, (zc + d / 2 + next) / 2, 1.3, 0.012, zc + d / 2 - next, 0, CR, 'cloth');   /* ... and its tread */
    }
    /* two lamp posts on the top step's front corners */
    for (const s of [-1, 1]) {
      F.box(s * 1.2, 0.6, 0.35, 0.3, 0.7, 0.3, 0, M, 'stone');
      F.box(s * 1.2, 1.3, 0.35, 0.36, 0.08, 0.36, 0, G, 'gold');
      F.frustum(s * 1.2, 1.38, 0.35, 0.06, 0.11, 0.1, 0, B, 'bronze', 8);
      F.ball(s * 1.2, 1.58, 0.35, 0.11, BU, 'glow');
    }
    /* the throne: a mahogany seat with gilt arms, a crimson cushion and upholstered back, a stepped gilt crown */
    F.box(0, 0.6, -0.4, 1.36, 0.08, 0.96, 0, G, 'gold');
    F.box(0, 0.68, -0.4, 1.3, 0.37, 0.9, 0, W, 'mahogany');
    F.box(0, 0.74, 0.055, 0.9, 0.22, 0.02, 0, OR, 'ceramic');                                   /* the enamel front */
    for (let i = 0; i < 5; i++) F.box(-0.36 + i * 0.18, 0.8, 0.068, 0.06, 0.1, 0.01, 0, G, 'gold');
    F.pillow(0, 1.12, -0.42, 1.0, 0.14, 0.76, 0, CR, 'cloth', { side: 0.4 });
    for (const s of [-1, 1]) {
      F.box(s * 0.58, 1.05, -0.4, 0.16, 0.42, 0.86, 0, G, 'gold');
      F.box(s * 0.58, 1.47, -0.42, 0.12, 0.06, 0.8, 0, GL, 'gold');
      F.ball(s * 0.58, 1.6, 0.0, 0.08, G, 'gold');
    }
    F.box(0, 1.05, -0.94, 1.3, 2.05, 0.18, 0, W, 'mahogany');
    for (const s of [-1, 1]) F.box(s * 0.61, 1.05, -0.84, 0.08, 2.05, 0.03, 0, G, 'gold');
    F.box(0, 1.3, -0.835, 0.95, 1.5, 0.04, 0, CR, 'cloth');
    izpDisc(F, 0, 2.45, -0.8, 0.15, 0.03, G, 'gold');
    F.box(0, 3.1, -0.94, 1.3, 0.12, 0.22, 0, G, 'gold');
    F.box(0, 3.22, -0.94, 0.9, 0.12, 0.22, 0, G, 'gold');
    F.box(0, 3.34, -0.94, 0.5, 0.14, 0.22, 0, GL, 'gold');
    /* the Orb's bronze stand behind the throne */
    F.box(0, 0.6, -1.3, 0.5, 0.1, 0.4, 0, BD, 'bronze');
    F.box(0, 0.7, -1.3, 0.3, 0.1, 0.25, 0, B, 'bronze');
    F.cyl(0, 0.8, -1.3, 0.06, 2.5, 0, B, 'bronze');
    F.frustum(0, 3.3, -1.3, 0.07, 0.16, 0.14, 0, B, 'bronze', 10);
    /* the gilt sunburst behind the Orb: stepped rays, long and short, round all but the bottom */
    const cy = 3.8, zr = -1.47;
    izpDisc(F, 0, cy, zr, 0.5, 0.06, G, 'gold');
    izpRing(F, 0, cy, -1.43, 0.44, 0.03, IZP_X, IZP_Y, OR, 'ceramic', 24, 6);
    for (let k = 0; k <= 16; k++) {
      const a = (-25 + k * 230 / 16) * Math.PI / 180, long = k % 2 === 0;
      izpRay(F, 0, cy, zr, a, 0.52, 0.86, 0.14, 0.04, G, 'gold');
      izpRay(F, 0, cy, zr, a, 0.86, long ? 1.18 : 0.98, long ? 0.07 : 0.1, 0.04, GL, 'gold');
    }
    /* the Orb: a glowing sphere in glass, held in two bronze rings */
    F.ball(0, cy, -1.3, 0.2, F.col('orbCore'), 'glow');
    F.ball(0, cy, -1.3, 0.28, F.col('orbGlass'), 'glass');
    izpRing(F, 0, cy, -1.3, 0.38, 0.025, IZP_X, IZP_Y, B, 'bronze', 24, 6);
    izpRing(F, 0, cy, -1.3, 0.31, 0.02, IZP_Z, IZP_Y, B, 'bronze', 20, 6);
    F.lamp(0, cy, -1.0, 1.6, 12);
    F.lamp(0, 1.6, 0.6, 0.6, 5);
  }
});

/* a wall niche with the bust of a deified emperor (the Lararium, the Aula Regia, the atrium, the library) */
FURN({
  key: 'iziz_court_bust_niche', name: 'Niche with an emperor\'s bust', culture: 'iziz', tier: 'court', type: 'statue', setting: 'indoor',
  rooms: ['pal_lararium', 'pal_throne', 'pal_atrium', 'pal_library'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['stone', 'gold', 'ceramic', 'bronze', 'emissive'],
  w: 1.2, d: 0.5, h: 2.6, variants: 2, variantNames: ['Bearded emperor', 'Laurelled emperor'],
  build: function (F) {
    const M = F.col('marbleWhite'), MV = F.col('marbleVein'), G = F.col('courtGilt'), B = F.col('bronze');
    /* the plinth */
    F.box(0, 0, 0, 1.2, 0.12, 0.5, 0, MV, 'stone');
    F.box(0, 0.12, -0.03, 1.1, 0.7, 0.44, 0, M, 'stone');
    F.box(0, 0.82, -0.02, 1.12, 0.05, 0.46, 0, G, 'gold');
    F.box(0, 0.87, 0, 1.2, 0.08, 0.5, 0, M, 'stone');
    F.box(0, 0.4, 0.195, 0.5, 0.14, 0.01, 0, G, 'gold');                                       /* the dedication plate */
    /* the niche: a back, a teal-tiled lining, fluted pilasters with gilt capitals, a stepped head */
    F.box(0, 0.95, -0.22, 1.2, 1.25, 0.06, 0, M, 'stone');
    F.box(0, 0.95, -0.18, 0.76, 1.19, 0.02, 0, F.col('ceramicTeal'), 'ceramic');
    for (const s of [-1, 1]) {
      F.box(s * 0.5, 0.95, -0.07, 0.2, 1.19, 0.36, 0, M, 'stone');
      for (const f of [-0.05, 0.05]) F.box(s * 0.5 + f, 1.0, 0.112, 0.03, 1.08, 0.01, 0, MV, 'stone');
      F.box(s * 0.5, 2.14, -0.06, 0.22, 0.06, 0.38, 0, G, 'gold');
    }
    F.box(0, 2.14, -0.06, 0.8, 0.06, 0.3, 0, M, 'stone');
    F.box(0, 2.2, -0.04, 1.2, 0.12, 0.42, 0, M, 'stone');
    F.box(0, 2.32, -0.07, 0.9, 0.12, 0.36, 0, M, 'stone');
    F.box(0, 2.44, -0.1, 0.54, 0.16, 0.3, 0, M, 'stone');
    for (const y of [2.29, 2.41]) F.box(0, y, y < 2.3 ? 0.172 : 0.107, y < 2.3 ? 1.2 : 0.9, 0.03, 0.01, 0, G, 'gold');
    izpDisc(F, 0, 2.52, 0.06, 0.07, 0.02, G, 'gold');
    /* the lamp under the head */
    F.rod(0, 2.14, -0.02, 0, 2.08, -0.02, 0.008, B, 'bronze');
    F.frustum(0, 1.98, -0.02, 0.07, 0.03, 0.1, 0, B, 'bronze', 8);
    F.ball(0, 1.97, -0.02, 0.04, F.col('bulbWarm'), 'glow');
    F.lamp(0, 1.9, 0.12, 0.5, 4);
    /* the bust on its herm */
    F.box(0, 0.95, -0.03, 0.3, 0.18, 0.26, 0, MV, 'stone');
    F.cyl(0, 1.13, -0.03, 0.08, 0.05, 0, M, 'stone');
    F.ell(0, 1.3, -0.03, 0.22, 0.14, 0.12, 0, M, 'stone');
    F.cyl(0, 1.4, -0.03, 0.055, 0.12, 0, M, 'stone');
    F.ell(0, 1.6, -0.02, 0.095, 0.125, 0.11, 0, M, 'stone');
    F.box(0, 1.55, 0.085, 0.03, 0.05, 0.03, 0, M, 'stone');
    if (F.variant === 1) {
      izpRing(F, 0, 1.66, -0.025, 0.1, 0.018, IZP_X, IZP_Z, G, 'gold', 16, 5);              /* a gilt laurel */
      F.ell(0, 1.67, -0.03, 0.098, 0.075, 0.105, 0, F.shade(M, -0.05), 'stone');
    } else {
      F.ell(0, 1.5, 0.03, 0.08, 0.07, 0.06, 0, F.shade(M, -0.06), 'stone');                     /* the beard */
      F.ell(0, 1.67, -0.03, 0.1, 0.08, 0.11, 0, F.shade(M, -0.06), 'stone');                    /* the curls */
      F.beam(-0.18, 1.4, 0.06, 0.12, 1.2, 0.08, 0.06, 0.03, F.shade(M, -0.04), 'stone');        /* the cloak's fold */
    }
  }
});

/* the altar of the house (the Lararium, pal_lararium): marble, gilt mouldings, a lit fire bowl and a small orb */
FURN({
  key: 'iziz_court_altar_of_the_house', name: 'Altar of the house', culture: 'iziz', tier: 'court', type: 'altar', setting: 'indoor',
  rooms: ['pal_lararium'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['stone', 'gold', 'ceramic', 'bronze', 'emissive', 'glass'],
  w: 1.4, d: 0.9, h: 1.48, variants: 1,
  build: function (F) {
    const M = F.col('marbleWhite'), MV = F.col('marbleVein'), G = F.col('courtGilt'), B = F.col('bronze');
    F.box(0, 0, 0, 1.4, 0.1, 0.9, 0, MV, 'stone');
    F.box(0, 0.1, 0, 1.3, 0.05, 0.8, 0, G, 'gold');
    F.box(0, 0.15, 0, 1.2, 0.07, 0.72, 0, M, 'stone');
    F.box(0, 0.22, 0, 1.0, 0.7, 0.6, 0, M, 'stone');
    F.box(0, 0.3, 0, 1.04, 0.04, 0.64, 0, G, 'gold');
    F.box(0, 0.42, 0.302, 0.62, 0.38, 0.01, 0, F.col('ceramicTeal'), 'ceramic');
    izpDisc(F, 0, 0.61, 0.31, 0.12, 0.02, G, 'gold');
    for (let k = 0; k < 8; k++) izpRay(F, 0, 0.61, 0.31, k * Math.PI / 4, 0.13, 0.17, 0.03, 0.012, G, 'gold');
    F.box(0, 0.92, 0, 1.1, 0.04, 0.7, 0, G, 'gold');
    F.box(0, 0.96, 0, 1.2, 0.08, 0.78, 0, M, 'stone');
    for (const s of [-1, 1]) {                                                                  /* the pulvini */
      F.rod(s * 0.5, 1.1, -0.35, s * 0.5, 1.1, 0.35, 0.06, MV, 'stone');
      for (const t of [-1, 1]) F.rod(s * 0.5, 1.1, t * 0.33, s * 0.5, 1.1, t * 0.36, 0.065, G, 'gold');
    }
    /* the fire bowl */
    F.frustum(-0.18, 1.04, 0, 0.1, 0.2, 0.16, 0, B, 'bronze', 12);
    F.cyl(-0.18, 1.18, 0, 0.17, 0.02, 0, F.col('amber'), 'glow');
    F.cone(-0.18, 1.2, 0, 0.12, 0.28, 0, F.col('flame'), 'glow');
    F.cone(-0.18, 1.2, 0, 0.06, 0.18, 0, F.col('whiteHot'), 'glow');
    /* the house's small orb */
    F.frustum(0.28, 1.04, 0, 0.07, 0.04, 0.12, 0, B, 'bronze', 8);
    F.ball(0.28, 1.26, 0, 0.07, F.col('orbCore'), 'glow');
    F.ball(0.28, 1.26, 0, 0.09, F.col('orbGlass'), 'glass');
    izpRing(F, 0.28, 1.26, 0, 0.1, 0.012, IZP_X, IZP_Y, B, 'bronze', 16, 5);
    F.lamp(-0.18, 1.35, 0.1, 0.9, 6);
  }
});

/* the sunken bath pool (the emperor's bath, pal_bath): marble rim, teal tile bands, dark water just under the rim */
FURN({
  key: 'iziz_court_bath_pool', name: 'Marble bath pool', culture: 'iziz', tier: 'court', type: 'fountain', setting: 'indoor',
  rooms: ['pal_bath'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'ceramic', 'glass', 'gold', 'bronze'],
  w: 4.2, d: 3.2, h: 0.56, variants: 1,
  build: function (F) {
    const M = F.col('marbleWhite'), TE = F.col('ceramicTeal'), G = F.col('courtGilt'), B = F.col('bronze');
    const W = 4.2, D = 3.2, r = 0.3, H = 0.5, iw = W - 2 * r, id = D - 2 * r;
    F.box(0, 0, 0, iw, 0.06, id, 0, F.col('poolDeep'), 'ceramic');
    for (const s of [-1, 1]) {
      F.box(0, 0, s * (D / 2 - r / 2), W, H, r, 0, M, 'stone');
      F.box(s * (W / 2 - r / 2), 0, 0, r, H, id, 0, M, 'stone');
      F.box(0, 0.3, s * (id / 2 - 0.005), iw, 0.08, 0.012, 0, TE, 'ceramic');               /* tile bands on the inner faces */
      F.box(s * (iw / 2 - 0.005), 0.3, 0, 0.012, 0.08, id, 0, TE, 'ceramic');
      F.box(0, 0.16, s * (id / 2 - 0.005), iw, 0.04, 0.012, 0, F.col('enamelCream'), 'ceramic');
      F.box(0, H, s * (D / 2 - r / 2), W - 0.4, 0.008, 0.07, 0, TE, 'ceramic');            /* inlay on the rim's top */
      F.box(s * (W / 2 - r / 2), H, 0, 0.07, 0.008, D - 0.4, 0, TE, 'ceramic');
      for (const t of [-1, 1]) F.box(s * (W / 2 - 0.17), H, t * (D / 2 - 0.17), 0.34, 0.06, 0.34, 0, G, 'gold');
    }
    /* steps down into it, under the water */
    F.box(-1.3, 0.06, id / 2 - 0.18, 0.9, 0.24, 0.36, 0, M, 'stone');
    F.box(-1.3, 0.06, id / 2 - 0.54, 0.9, 0.12, 0.36, 0, M, 'stone');
    /* the bronze spout on the far rim */
    F.box(0, 0.3, -id / 2 + 0.03, 0.26, 0.18, 0.06, 0, B, 'bronze');
    F.rod(0, 0.4, -id / 2 + 0.06, 0, 0.42, -id / 2 + 0.2, 0.02, F.col('poolWater'), 'glass');
    /* the water */
    F.box(0, 0.4, 0, iw, 0.02, id, 0, F.col('poolWater'), 'glass');
  }
});

/* a heated marble slab, a reclining bench on bronze feet (the bath, pal_bath) */
FURN({
  key: 'iziz_court_bath_slab', name: 'Heated marble slab', culture: 'iziz', tier: 'court', type: 'bench', setting: 'indoor',
  rooms: ['pal_bath'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['stone', 'bronze', 'gold', 'emissive', 'cloth'],
  w: 2.1, d: 0.8, h: 0.7, variants: 1,
  build: function (F) {
    const M = F.col('marbleWhite'), MV = F.col('marbleVein'), B = F.col('bronze');
    for (const x of [-0.85, 0.85]) for (const z of [-0.28, 0.28]) {
      F.ball(x, 0.06, z, 0.06, B, 'bronze');
      F.frustum(x, 0.06, z, 0.055, 0.04, 0.32, 0, B, 'bronze', 8);
    }
    F.box(0, 0.1, 0, 1.6, 0.04, 0.5, 0, F.col('bronzeDark'), 'bronze');                        /* the hot-plate */
    F.box(0, 0.14, 0, 1.5, 0.02, 0.44, 0, F.col('amber'), 'glow');
    F.box(0, 0.38, 0, 2.0, 0.14, 0.75, 0, M, 'stone');
    F.box(0, 0.43, 0.38, 2.0, 0.03, 0.01, 0, F.col('courtGilt'), 'gold');
    F.box(-0.84, 0.52, 0, 0.32, 0.1, 0.75, 0, MV, 'stone');
    F.rod(-0.84, 0.62, -0.35, -0.84, 0.62, 0.35, 0.06, MV, 'stone');
    /* a folded towel, its tail over the front */
    F.box(0.62, 0.52, 0.05, 0.42, 0.04, 0.34, 0, F.col('towelWhite'), 'cloth');
    F.box(0.62, 0.56, 0.05, 0.4, 0.04, 0.32, 0, F.col('courtClothCream'), 'cloth');
    F.box(0.62, 0.34, 0.386, 0.36, 0.2, 0.012, 0, F.col('towelWhite'), 'cloth');
    F.lamp(0, 0.14, 0.3, 0.3, 3);
  }
});

/* a bronze-bound mahogany strongbox (the treasuries, the bedchamber, the offices): an item container */
FURN({
  key: 'iziz_court_strongbox', name: 'Bronze-bound strongbox', culture: 'iziz', tier: 'court', type: 'storage', role: 'strongbox', setting: 'indoor',
  rooms: ['pal_treasury', 'pal_bedchamber', 'pal_office'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['hyperMahogany', 'bronze', 'gold', 'metal'],
  w: 1.1, d: 0.66, h: 0.72, variants: 2, variantNames: ['Strongbox', 'Great strongbox'],
  variantDims: [{ w: 0.62, d: 0.44, h: 0.46 }, { w: 1.1, d: 0.66, h: 0.72 }],
  build: function (F) {
    const big = F.variant === 1, w = big ? 1.1 : 0.62, d = big ? 0.66 : 0.44, h = big ? 0.72 : 0.46;
    const W = F.col('courtMahogany'), WD = F.col('mahoganyDark'), B = F.col('bronze'), BD = F.col('bronzeDark'), G = F.col('courtGilt');
    const hb = h * 0.62, hl = h * 0.22, top = 0.045 + hb + hl;
    for (const x of [-1, 1]) for (const z of [-1, 1]) F.cyl(x * (w / 2 - 0.06), 0, z * (d / 2 - 0.06), 0.035, 0.04, 0, BD, 'bronze');
    F.box(0, 0.04, 0, w - 0.02, hb, d - 0.02, 0, W, 'mahogany');
    F.box(0, 0.045 + hb, 0, w - 0.02, hl, d - 0.02, 0, F.shade(W, 0.06), 'mahogany');
    F.box(0, top, 0, w - 0.12, 0.03, d - 0.12, 0, WD, 'mahogany');
    for (const x of big ? [-0.36, 0, 0.36] : [-0.3, 0.3]) F.box(x * w, 0.04, 0, 0.05, hb + hl + 0.005, d, 0, B, 'bronze');
    F.box(0, 0.035 + hb, 0, w, 0.03, d, 0, B, 'bronze');
    for (const x of [-1, 1]) for (const z of [-1, 1]) for (const y of [0.04, top - 0.06]) F.box(x * (w / 2 - 0.03), y, z * (d / 2 - 0.03), 0.06, 0.06, 0.06, 0, BD, 'bronze');
    F.box(0, 0.04 + hb - 0.17, d / 2 - 0.004, 0.14, 0.16, 0.014, 0, G, 'gold');               /* the lock plate */
    F.box(0, 0.04 + hb - 0.12, d / 2 + 0.003, 0.02, 0.05, 0.004, 0, F.col('blackIron'), 'metal');
    for (const s of [-1, 1]) F.box(s * (w / 2 - 0.01), 0.04 + hb * 0.6, 0, 0.03, 0.06, 0.2, 0, B, 'bronze');
    if (big) F.cyl(0, top + 0.03, 0, 0.08, 0.015, 0, G, 'gold');                               /* a gilt sun stud */
  }
});

/* a map table, the crater inlaid in its top, cities as gilt studs, the legions as bronze markers (the map room, the council) */
FURN({
  key: 'iziz_court_map_table', name: 'Map table of the crater', culture: 'iziz', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['pal_maproom', 'pal_council'], anchor: 'floor', clearance: { front: 0.9, back: 0.9 }, task: ['reading', 'socializing'],
  materials: ['hyperMahogany', 'gold', 'bronze', 'stone', 'cloth'],
  w: 2.4, d: 1.6, h: 1.0, variants: 1,
  build: function (F) {
    const W = F.col('courtMahogany'), WD = F.col('mahoganyDark'), G = F.col('courtGilt'), B = F.col('bronze');
    for (const x of [-1.05, 0, 1.05]) for (const z of [-0.65, 0.65]) {                         /* six turned legs */
      F.frustum(x, 0, z, 0.07, 0.055, 0.06, 0, B, 'bronze', 8);
      F.cyl(x, 0.06, z, 0.05, 0.62, 0, W, 'mahogany');
      F.frustum(x, 0.26, z, 0.052, 0.072, 0.05, 0, G, 'gold', 8);                              /* a turned gilt bead */
      F.frustum(x, 0.31, z, 0.072, 0.052, 0.05, 0, G, 'gold', 8);
      F.cyl(x, 0.6, z, 0.06, 0.04, 0, G, 'gold');
    }
    F.box(0, 0.68, 0, 2.24, 0.14, 1.44, 0, W, 'mahogany');
    F.box(0, 0.82, 0, 2.4, 0.06, 1.6, 0, WD, 'mahogany');
    for (const s of [-1, 1]) { F.box(0, 0.86, s * 0.79, 2.4, 0.02, 0.02, 0, G, 'gold'); F.box(s * 1.19, 0.86, 0, 0.02, 0.02, 1.6, 0, G, 'gold'); }
    /* the map: the land, the crater's rim, its green ring and the dark lake */
    F.box(0, 0.88, 0, 2.2, 0.01, 1.4, 0, F.col('mapLand'), 'stone');
    const cx = 0.15;
    F.cyl(cx, 0.89, 0, 0.66, 0.008, 0, F.col('mapRim'), 'stone');
    F.cyl(cx, 0.89, 0, 0.6, 0.012, 0, F.col('mapGreen'), 'stone');
    F.cyl(cx, 0.89, 0, 0.38, 0.016, 0, F.col('mapLake'), 'stone');
    F.box(cx + 0.55, 0.89, 0.25, 0.5, 0.014, 0.03, -0.5, F.col('mapLake'), 'stone');           /* a river out through the rim */
    /* the cities: gilt studs round the ring, the capital the largest */
    for (let k = 0; k < 7; k++) {
      const a = 0.4 + k * 0.85, r = 0.49;
      F.cyl(cx + Math.cos(a) * r, 0.89, Math.sin(a) * r, 0.025, 0.022, 0, G, 'gold');
    }
    F.cyl(cx - 0.49, 0.89, 0.05, 0.045, 0.03, 0, G, 'gold');
    F.ball(cx - 0.49, 0.93, 0.05, 0.025, F.col('giltLight'), 'gold');
    /* the legions' markers: bronze cones with little flags, orange for ours, teal for the enemy */
    const mk = [[-0.75, -0.3, 0], [-0.62, 0.35, 0], [cx + 0.2, -0.52, 0], [cx + 0.75, 0.45, 1], [cx + 0.85, -0.2, 1], [-0.95, 0.05, 0]];
    for (const [x, z, foe] of mk) {
      F.frustum(x, 0.89, z, 0.03, 0.015, 0.06, 0, B, 'bronze', 6);
      F.box(x + 0.02, 0.92, z, 0.04, 0.025, 0.006, 0, F.col(foe ? 'clothTeal' : 'clothOrange'), 'cloth');
    }
    /* a compass rose and a pointer */
    F.box(-0.85, 0.89, 0.48, 0.22, 0.006, 0.03, 0, G, 'gold');
    F.box(-0.85, 0.89, 0.48, 0.22, 0.006, 0.03, Math.PI / 2, G, 'gold');
    F.box(-0.85, 0.89, 0.48, 0.12, 0.008, 0.02, Math.PI / 4, G, 'gold');
    F.box(-0.85, 0.89, 0.48, 0.12, 0.008, 0.02, -Math.PI / 4, G, 'gold');
    F.rod(-0.95, 0.9, -0.5, -0.35, 0.9, -0.6, 0.008, B, 'bronze');
  }
});

/* a bronze lectern with an open book (the Lararium, the library, the council, the palace school) */
FURN({
  key: 'iziz_court_lectern', name: 'Bronze lectern', culture: 'iziz', tier: 'court', type: 'desk', setting: 'indoor',
  rooms: ['pal_lararium', 'pal_library', 'pal_council', 'pal_school'], anchor: 'floor', clearance: { front: 0.7 }, task: ['reading'],
  materials: ['bronze', 'gold', 'hide', 'cloth'],
  w: 0.66, d: 0.6, h: 1.3, variants: 1,
  build: function (F) {
    const B = F.col('bronze'), BD = F.col('bronzeDark'), G = F.col('courtGilt');
    izpSteps(F, 0, 0, 0, 0.6, 0.5, 3, 0.07, 0.07, 0.06, BD, 'bronze');
    F.cyl(0, 0.21, 0, 0.045, 0.75, 0, B, 'bronze');
    F.ball(0, 0.55, 0, 0.07, G, 'gold');
    F.cyl(0, 0.92, 0, 0.06, 0.04, 0, G, 'gold');
    F.box(0, 0.96, 0, 0.3, 0.06, 0.2, 0, B, 'bronze');
    /* the sloped desk, its ledge, and the open book on it */
    const p0 = [1.02, 0.18], p1 = [1.2, -0.12], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const ny = (p0[1] - p1[1]) / L, nz = (p1[0] - p0[0]) / L;   /* the slope's normal, up and to the front */
    const at = (o, p) => [p[0] + ny * o, p[1] + nz * o];
    F.beam(0, p0[0], p0[1], 0, p1[0], p1[1], 0.62, 0.035, B, 'bronze');
    F.box(0, 0.99, 0.2, 0.62, 0.05, 0.03, 0, G, 'gold');
    let a = at(0.025, p0), b = at(0.025, p1);
    F.beam(0, a[0], a[1], 0, b[0], b[1], 0.52, 0.012, F.col('bookCalf'), 'hide');
    a = at(0.042, p0); b = at(0.042, p1);
    for (const s of [-1, 1]) F.beam(s * 0.125, a[0], a[1], s * 0.125, b[0], b[1], 0.235, 0.025, F.col('paperPage'), 'cloth');
    F.beam(0, a[0], a[1], 0, b[0], b[1], 0.008, 0.03, F.col('courtBrocade'), 'cloth');         /* the ribbon */
  }
});

/* the astronomers' armillary sphere, its polar axis the gnomon, on a fluted marble pedestal (the observatory, the library) */
FURN({
  key: 'iziz_court_armillary', name: 'Armillary sphere', culture: 'iziz', tier: 'court', type: 'statue', setting: 'indoor',
  rooms: ['pal_observatory', 'pal_library'], anchor: 'floor', clearance: { front: 0.6 }, task: ['reading'],
  materials: ['stone', 'gold', 'bronze', 'ceramic'],
  w: 0.9, d: 0.9, h: 2.05, variants: 1,
  build: function (F) {
    const M = F.col('marbleWhite'), G = F.col('courtGilt'), B = F.col('bronze');
    izpSteps(F, 0, 0, 0, 0.8, 0.8, 2, 0.1, 0.1, 0.1, M, 'stone');
    F.lathe(0, 0.2, 0, [[0.17, 0], [0.17, 0.75], [0.2, 0.8]], 0, M, 'stone', { nu: 20, nv: 4, flute: { n: 10, amp: 0.06, sharp: 3 } });
    F.box(0, 1.0, 0, 0.48, 0.06, 0.48, 0, G, 'gold');
    F.box(0, 1.06, 0, 0.4, 0.06, 0.4, 0, M, 'stone');
    F.frustum(0, 1.12, 0, 0.08, 0.04, 0.06, 0, B, 'bronze', 8);
    F.cyl(0, 1.12, 0, 0.025, 0.08, 0, B, 'bronze');
    const C = 1.6, t = 35 * Math.PI / 180, P = [0, Math.cos(t), Math.sin(t)], V = [0, -Math.sin(t), Math.cos(t)];
    const e = 23 * Math.PI / 180, U = [Math.cos(e), Math.sin(e) * P[1], Math.sin(e) * P[2]];
    izpRing(F, 0, C, 0, 0.42, 0.02, IZP_Y, IZP_Z, G, 'gold', 24, 5);                           /* the meridian */
    izpRing(F, 0, C, 0, 0.42, 0.018, IZP_X, IZP_Z, B, 'bronze', 24, 5);                         /* the horizon */
    izpRing(F, 0, C, 0, 0.38, 0.022, IZP_X, V, G, 'gold', 20, 5);                               /* the equator */
    izpRing(F, 0, C, 0, 0.36, 0.03, U, V, F.col('enamelOrange'), 'ceramic', 20, 5);             /* the zodiac band */
    F.rod(0, C - P[1] * 0.5, -P[2] * 0.5, 0, C + P[1] * 0.5, P[2] * 0.5, 0.012, B, 'bronze');  /* the polar axis: the gnomon */
    for (const s of [-1, 1]) F.ball(0, C + s * P[1] * 0.5, s * P[2] * 0.5, 0.025, G, 'gold');
    F.ball(0, C, 0, 0.07, F.col('ceramicTeal'), 'ceramic');                                    /* the world at the centre */
  }
});

/* the vexillum's cloth: orange (crimson for the Praetorians), a gilt sun, a teal fringe (painted once per variant) */
function izpVexillum(F, v) {
  const or = F.css(F.col(v ? 'clothCrimson' : 'clothOrange')), te = F.css(F.col('courtClothTeal')), cr = F.css(F.col('courtClothCream')), go = F.css(F.col('courtClothGold'));
  return function (g, W, H) {
    g.fillStyle = or; g.fillRect(0, 0, W, H);
    g.fillStyle = te; g.fillRect(0, H * 0.9, W, H * 0.1);
    for (let i = 2; i < W; i += 7) g.fillRect(i, H * 0.86, 3, H * 0.05);
    g.strokeStyle = go; g.lineWidth = Math.max(2, W * 0.025); g.strokeRect(W * 0.06, H * 0.05, W * 0.88, H * 0.78);
    const cx = W / 2, cy = H * 0.4, R = W * 0.22;
    g.fillStyle = go;
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2, b = a + 0.12, c = a - 0.12, r2 = k % 2 ? R * 1.35 : R * 1.7;
      g.beginPath(); g.moveTo(cx + Math.cos(b) * R * 0.8, cy + Math.sin(b) * R * 0.8); g.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      g.lineTo(cx + Math.cos(c) * R * 0.8, cy + Math.sin(c) * R * 0.8); g.fill();
    }
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    g.fillStyle = cr; g.beginPath(); g.arc(cx, cy, R * 0.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = go; for (let k = 0; k < 3; k++) g.fillRect(W * (0.26 + k * 0.18), H * 0.7, W * 0.12, H * 0.05);   /* the legion's letters */
  };
}
/* a legion standard on its stand: eagle (or imago and orb), sun disc, vexillum, battle honours (the Aula Regia, the
   council, the map room, the atrium, the guard) */
FURN({
  key: 'iziz_court_standard', name: 'Legion standard', culture: 'iziz', tier: 'court', type: 'banner', setting: 'indoor',
  rooms: ['pal_throne', 'pal_council', 'pal_maproom', 'pal_atrium', 'pal_guard'], anchor: 'floor', clearance: {},
  materials: ['bronze', 'gold', 'hyperMahogany', 'cloth'],
  w: 0.9, d: 0.5, h: 3.25, variants: 2, variantNames: ['Eagle standard', 'Praetorian standard (imago and orb)'],
  build: function (F) {
    const G = F.col('courtGilt'), GL = F.col('giltLight'), B = F.col('bronze'), BD = F.col('bronzeDark'), v = F.variant === 1;
    F.box(0, 0, 0, 0.6, 0.08, 0.5, 0, BD, 'bronze');
    F.box(0, 0.08, 0, 0.44, 0.08, 0.36, 0, B, 'bronze');
    F.box(0, 0.16, 0, 0.28, 0.08, 0.22, 0, G, 'gold');
    F.cyl(0, 0.24, 0, 0.05, 0.12, 0, B, 'bronze');
    F.cyl(0, 0.24, 0, 0.028, 2.62, 0, F.col('mahoganyDark'), 'mahogany');
    /* the battle honours */
    for (let i = 0; i < (v ? 5 : 4); i++) izpDisc(F, 0, 0.62 + i * 0.18, 0.04, 0.075, 0.03, i % 2 ? B : G, i % 2 ? 'bronze' : 'gold');
    /* the crossbar and the vexillum */
    F.rod(-0.38, 2.38, 0.03, 0.38, 2.38, 0.03, 0.015, G, 'gold');
    for (const s of [-1, 1]) F.ball(s * 0.39, 2.38, 0.03, 0.028, G, 'gold');
    F.decal(0, 1.56, 0.045, 0.7, 0.8, 0, 'izpalace-vexillum-' + (v ? 1 : 0), izpVexillum(F, v), 'cloth');
    F.box(0, 1.5, 0.045, 0.7, 0.06, 0.012, 0, F.col('courtClothTeal'), 'cloth');
    for (const s of [-1, 1]) F.ball(s * 0.35, 1.48, 0.045, 0.025, F.col('courtClothTeal'), 'cloth');
    /* the sun disc */
    izpDisc(F, 0, 2.62, 0.035, 0.15, 0.04, G, 'gold');
    for (let k = 0; k < 12; k++) izpRay(F, 0, 2.62, 0.035, k * Math.PI / 6, 0.15, k % 2 ? 0.22 : 0.27, 0.035, 0.02, GL, 'gold');
    if (!v) {                                                                                   /* the eagle */
      F.box(0, 2.86, 0, 0.2, 0.04, 0.1, 0, G, 'gold');
      F.ell(0, 2.99, 0, 0.06, 0.09, 0.07, 0, G, 'gold');
      F.ball(0, 3.12, 0.04, 0.045, G, 'gold');
      F.cone(0, 3.1, 0.09, 0.015, 0.04, 0, GL, 'gold');
      for (const s of [-1, 1]) {
        F.beam(s * 0.04, 3.02, 0, s * 0.27, 3.2, -0.02, 0.07, 0.02, G, 'gold');
        F.beam(s * 0.04, 2.97, 0, s * 0.23, 3.07, -0.02, 0.06, 0.02, GL, 'gold');
      }
    } else {                                                                                    /* the imago in a laurel, the orb above */
      izpDisc(F, 0, 2.62, 0.06, 0.09, 0.03, B, 'bronze');
      izpRing(F, 0, 2.62, 0.06, 0.12, 0.022, IZP_X, IZP_Y, G, 'gold', 16, 5);
      F.box(0, 2.86, 0, 0.16, 0.05, 0.1, 0, G, 'gold');
      F.ball(0, 3.03, 0, 0.1, G, 'gold');
      izpRing(F, 0, 3.03, 0, 0.13, 0.016, IZP_X, IZP_Y, B, 'bronze', 16, 5);
      F.cone(0, 3.13, 0, 0.03, 0.1, 0, GL, 'gold');
    }
  }
});

/* the heliograph on its bronze tripod: a mirror in a gimbal, a louvred shutter, a sighting tube (the signal room) */
FURN({
  key: 'iziz_court_heliograph', name: 'Heliograph', culture: 'iziz', tier: 'court', type: 'workstation', setting: 'both',
  rooms: ['pal_signal'], anchor: 'floor', clearance: { front: 0.8, back: 0.6 },
  materials: ['bronze', 'gold', 'glass', 'metal'],
  w: 1.0, d: 1.0, h: 1.9, variants: 1,
  build: function (F) {
    const B = F.col('bronze'), BD = F.col('bronzeDark'), G = F.col('courtGilt');
    for (let k = 0; k < 3; k++) {                                                              /* the tripod */
      const a = -Math.PI / 2 + k * F.TAU / 3, x = Math.cos(a) * 0.44, z = Math.sin(a) * 0.44;
      F.rod(x, 0.02, z, 0, 1.14, 0, 0.022, B, 'bronze');
      F.ball(x, 0.03, z, 0.03, BD, 'bronze');
    }
    F.cyl(0, 1.1, 0, 0.06, 0.1, 0, BD, 'bronze');
    F.cyl(0, 1.2, 0, 0.1, 0.03, 0, G, 'gold');
    /* the gimbal fork and the mirror */
    F.box(0, 1.23, 0, 0.7, 0.04, 0.06, 0, B, 'bronze');
    for (const s of [-1, 1]) {
      F.box(s * 0.33, 1.23, 0, 0.04, 0.42, 0.06, 0, B, 'bronze');
      F.rod(s * 0.285, 1.5, 0, s * 0.33, 1.5, 0, 0.015, G, 'gold');
    }
    izpDisc(F, 0, 1.5, -0.016, 0.27, 0.02, F.col('mirrorSilver'), 'metal');
    izpDisc(F, 0, 1.5, 0.0, 0.265, 0.016, F.col('mirrorGlass'), 'glass');
    izpRing(F, 0, 1.5, 0, 0.28, 0.025, IZP_X, IZP_Y, B, 'bronze', 24, 6);
    /* the sighting tube on top of the fork */
    for (const s of [-1, 1]) F.box(s * 0.33, 1.65, 0, 0.03, 0.14, 0.03, 0, B, 'bronze');
    F.rod(-0.36, 1.82, 0, 0.36, 1.82, 0, 0.03, BD, 'bronze');
    /* the shutter: a louvred frame on an arm before the mirror, and its lever */
    const zs = 0.33;
    F.rod(0, 1.25, 0.03, 0, 1.2, zs, 0.015, B, 'bronze');
    F.box(0, 1.18, zs, 0.62, 0.04, 0.03, 0, B, 'bronze');
    F.box(0, 1.78, zs, 0.62, 0.04, 0.03, 0, B, 'bronze');
    for (const s of [-1, 1]) F.box(s * 0.29, 1.18, zs, 0.04, 0.64, 0.03, 0, B, 'bronze');
    for (let i = 0; i < 7; i++) F.box(0, 1.25 + i * 0.075, zs, 0.54, 0.025, 0.06, 0, i % 2 ? BD : B, 'bronze');
    F.rod(0.31, 1.3, zs, 0.38, 1.0, zs + 0.06, 0.012, B, 'bronze');
    F.ball(0.38, 1.0, zs + 0.06, 0.03, G, 'gold');
  }
});

/* ======== extras, for extravagance (the owner: "decorate extravagantly") ======== */

/* a great deco chandelier: three tiers of crystal rings on gilt rods, electric bulbs (every state room) */
FURN({
  key: 'iziz_court_great_chandelier', name: 'Great deco chandelier', culture: 'iziz', tier: 'court', type: 'lamp', setting: 'indoor',
  rooms: IZP_STATE.slice(), anchor: 'ceiling', clearance: {},
  materials: ['gold', 'glass', 'emissive'],
  w: 2.4, d: 2.4, h: 2.8, variants: 1,
  build: function (F) {
    const G = F.col('courtGilt'), GL = F.col('giltLight'), X = F.col('glassCrystal'), BU = F.col('bulbWarm');
    F.cyl(0, 2.74, 0, 0.3, 0.06, 0, G, 'gold');                                               /* the ceiling rose */
    F.cyl(0, 2.68, 0, 0.2, 0.06, 0, GL, 'gold');
    F.rod(0, 2.68, 0, 0, 1.95, 0, 0.03, G, 'gold');
    F.frustum(0, 1.95, 0, 0.16, 0.06, 0.12, 0, G, 'gold', 8);                                  /* the stepped crown */
    F.cyl(0, 0.75, 0, 0.1, 1.2, 0, X, 'glass');                                               /* the crystal column */
    F.cyl(0, 0.75, 0, 0.045, 1.2, 0, BU, 'glow');
    const tiers = [{ R: 1.12, y: 1.05, n: 12 }, { R: 0.8, y: 1.5, n: 9 }, { R: 0.46, y: 1.9, n: 6 }];
    tiers.forEach(function (T, ti) {
      izpRing(F, 0, T.y, 0, T.R, 0.045, IZP_X, IZP_Z, X, 'glass', 20, 5);
      izpRing(F, 0, T.y + 0.05, 0, T.R, 0.012, IZP_X, IZP_Z, G, 'gold', 20, 4);               /* a gilt lip on it */
      const ns = ti ? 4 : 6;
      for (let k = 0; k < ns; k++) {                                                           /* gilt spokes */
        const a = k / ns * F.TAU + ti * 0.26, c = Math.cos(a), s = Math.sin(a);
        F.rod(c * 0.1, T.y + 0.25, s * 0.1, c * T.R, T.y, s * T.R, 0.012, G, 'gold');
        if (ti < 2) { const U = tiers[ti + 1]; F.rod(c * T.R, T.y, s * T.R, c * U.R, U.y, s * U.R, 0.01, GL, 'gold'); }
      }
      for (let k = 0; k < T.n; k++) {                                                          /* the bulbs in gilt cups */
        const a = (k + 0.5) / T.n * F.TAU, x = Math.cos(a) * T.R, z = Math.sin(a) * T.R;
        F.box(x, T.y + 0.03, z, 0.045, 0.1, 0.045, a, BU, 'glow');
        if (ti === 0 && k % 2 === 0) F.rod(x, T.y - 0.02, z, x, T.y - 0.2, z, 0.012, X, 'glass');            /* crystal drops */
      }
    });
    F.frustum(0, 0.55, 0, 0.04, 0.12, 0.2, 0, G, 'gold', 8);                                  /* the finial and its drop */
    F.ball(0, 0.44, 0, 0.1, BU, 'glow');
    F.rod(0, 0.34, 0, 0, 0.12, 0, 0.014, X, 'glass');
    F.frustum(0, 0.02, 0, 0.005, 0.04, 0.1, 0, X, 'glass', 6);
    F.lamp(0, 1.3, 0, 2.2, 14);
  }
});

/* a 2.6 m bronze-and-gilt electric torchere, a crystal bowl uplight (state rooms, the bath, the treasury, the map room) */
FURN({
  key: 'iziz_court_torchere', name: 'Electric torchere', culture: 'iziz', tier: 'court', type: 'lamp', setting: 'indoor',
  rooms: IZP_STATE.concat(['pal_bath', 'pal_treasury', 'pal_maproom']), anchor: 'floor', clearance: {},
  materials: ['bronze', 'gold', 'glass', 'emissive'],
  w: 0.6, d: 0.6, h: 2.6, variants: 1,
  build: function (F) {
    const B = F.col('bronze'), BD = F.col('bronzeDark'), G = F.col('courtGilt');
    F.box(0, 0, 0, 0.56, 0.08, 0.56, 0, BD, 'bronze');
    F.box(0, 0.08, 0, 0.42, 0.08, 0.42, 0, G, 'gold');
    F.frustum(0, 0.16, 0, 0.12, 0.05, 0.12, 0, B, 'bronze', 8);
    F.cyl(0, 0.28, 0, 0.032, 1.9, 0, B, 'bronze');
    for (const y of [0.9, 1.6]) { F.frustum(0, y - 0.04, 0, 0.034, 0.06, 0.04, 0, G, 'gold', 8); F.frustum(0, y, 0, 0.06, 0.034, 0.04, 0, G, 'gold', 8); }
    for (let k = 0; k < 3; k++) {                                                              /* three gilt fins up the foot of the shaft */
      const a = k / 3 * F.TAU;
      F.box(Math.cos(a) * 0.075, 0.28, Math.sin(a) * 0.075, 0.09, 0.45, 0.012, -a, G, 'gold');
    }
    F.frustum(0, 2.18, 0, 0.04, 0.09, 0.12, 0, G, 'gold', 10);
    F.lathe(0, 2.3, 0, [[0.05, 0], [0.18, 0.08], [0.26, 0.18], [0.28, 0.25]], 0, F.col('glassCrystal'), 'glass', { nu: 16, double: true });
    F.ell(0, 2.47, 0, 0.2, 0.05, 0.2, 0, F.col('bulbWarm'), 'glow');
    izpRing(F, 0, 2.55, 0, 0.28, 0.015, IZP_X, IZP_Z, G, 'gold', 20, 5);
    F.lamp(0, 2.55, 0, 1.2, 9);
  }
});

/* the Orb on a fluted marble pedestal with a gilt capital, glowing (the Aula Regia, the atrium, the Lararium, reception) */
FURN({
  key: 'iziz_court_orb_pedestal', name: 'Orb on a pedestal', culture: 'iziz', tier: 'court', type: 'monument', setting: 'indoor',
  rooms: ['pal_throne', 'pal_atrium', 'pal_lararium', 'pal_reception'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['stone', 'gold', 'bronze', 'glass', 'emissive'],
  w: 0.8, d: 0.8, h: 2.1, variants: 1,
  build: function (F) {
    const M = F.col('marbleWhite'), G = F.col('courtGilt'), B = F.col('bronze');
    izpSteps(F, 0, 0, 0, 0.78, 0.78, 3, 0.08, 0.07, 0.07, M, 'stone');
    F.cyl(0, 0.24, 0, 0.235, 0.04, 0, G, 'gold');
    F.lathe(0, 0.28, 0, [[0.2, 0], [0.18, 0.96]], 0, M, 'stone', { nu: 24, nv: 2, flute: { n: 12, amp: 0.08, sharp: 2 } });
    F.box(0, 1.24, 0, 0.46, 0.06, 0.46, 0, G, 'gold');
    F.frustum(0, 1.3, 0, 0.18, 0.25, 0.12, 0, G, 'gold', 4);
    F.box(0, 1.42, 0, 0.5, 0.05, 0.5, 0, M, 'stone');
    F.frustum(0, 1.47, 0, 0.15, 0.08, 0.06, 0, B, 'bronze', 8);
    for (let k = 0; k < 3; k++) { const a = k / 3 * F.TAU; F.rod(Math.cos(a) * 0.06, 1.52, Math.sin(a) * 0.06, Math.cos(a) * 0.17, 1.6, Math.sin(a) * 0.17, 0.014, B, 'bronze'); }
    F.ball(0, 1.78, 0, 0.18, F.col('orbCore'), 'glow');
    F.ball(0, 1.78, 0, 0.25, F.col('orbGlass'), 'glass');
    izpRing(F, 0, 1.78, 0, 0.3, 0.02, IZP_X, IZP_Y, B, 'bronze', 24, 6);
    izpRing(F, 0, 1.78, 0, 0.285, 0.016, IZP_X, IZP_Z, G, 'gold', 24, 5);
    F.lamp(0, 1.78, 0.25, 1.0, 8);
  }
});

/* a gilt sun-disc relief for a wall: stepped rays, a cream-and-orange enamel centre (state rooms) */
FURN({
  key: 'iziz_court_sun_relief', name: 'Gilt sun relief', culture: 'iziz', tier: 'court', type: 'art', setting: 'indoor',
  rooms: IZP_STATE.slice(), anchor: 'wall', clearance: {},
  materials: ['gold', 'ceramic'],
  w: 2.2, d: 0.12, h: 2.2, variants: 1,
  build: function (F) {
    const G = F.col('courtGilt'), GL = F.col('giltLight'), cy = 1.1;
    izpDisc(F, 0, cy, -0.035, 0.56, 0.05, G, 'gold');
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * F.TAU, long = k % 2 === 0;
      if (long) {
        izpRay(F, 0, cy, -0.0425, a, 0.55, 0.82, 0.17, 0.035, G, 'gold');
        izpRay(F, 0, cy, -0.045, a, 0.82, 1.08, 0.09, 0.03, GL, 'gold');
      } else izpRay(F, 0, cy, -0.045, a, 0.55, 0.86, 0.1, 0.03, GL, 'gold');
    }
    izpRing(F, 0, cy, -0.03, 0.6, 0.025, IZP_X, IZP_Y, G, 'gold', 24, 6);
    izpDisc(F, 0, cy, -0.01, 0.46, 0.06, F.col('enamelCream'), 'ceramic');
    izpRing(F, 0, cy, 0.01, 0.36, 0.03, IZP_X, IZP_Y, F.col('enamelOrange'), 'ceramic', 24, 6);
    izpRing(F, 0, cy, 0.015, 0.26, 0.02, IZP_X, IZP_Y, F.col('enamelTeal'), 'ceramic', 20, 5);
    izpDisc(F, 0, cy, 0.02, 0.18, 0.06, F.col('enamelOrange'), 'ceramic');
    izpDisc(F, 0, cy, 0.04, 0.07, 0.04, G, 'gold');
  }
});

/* a marble urn on a square plinth, a fan of palm leaves rising from it (state rooms, the bath, the atrium) */
FURN({
  key: 'iziz_court_urn', name: 'Marble urn with palm fronds', culture: 'iziz', tier: 'court', type: 'planter', setting: 'indoor',
  rooms: IZP_STATE.concat(['pal_bath']), anchor: 'floor', clearance: {},
  materials: ['stone', 'gold', 'foliage'],
  w: 1.3, d: 1.3, h: 2.3, variants: 1,
  build: function (F) {
    const M = F.col('marbleWhite'), MV = F.col('marbleVein'), G = F.col('courtGilt');
    F.box(0, 0, 0, 0.62, 0.08, 0.62, 0, MV, 'stone');
    F.box(0, 0.08, 0, 0.54, 0.42, 0.54, 0, M, 'stone');
    F.box(0, 0.4, 0, 0.56, 0.04, 0.56, 0, G, 'gold');
    F.box(0, 0.5, 0, 0.62, 0.06, 0.62, 0, M, 'stone');
    izpDisc(F, 0, 0.27, 0.272, 0.08, 0.01, G, 'gold');
    F.lathe(0, 0.56, 0, [[0.12, 0], [0.16, 0.04], [0.12, 0.1], [0.26, 0.3], [0.3, 0.45], [0.24, 0.62], [0.17, 0.7], [0.2, 0.76], [0.23, 0.8]], 0, M, 'stone',
      { nu: 20, nv: 10, flute: { n: 14, amp: 0.05, sharp: 2 } });
    F.cyl(0, 1.3, 0, 0.19, 0.02, 0, F.col('soilDark'), 'stone');
    for (const s of [-1, 1]) F.tube([[s * 0.2, 1.3, 0], [s * 0.33, 1.27, 0], [s * 0.35, 1.12, 0], [s * 0.28, 0.98, 0]], 0.018, G, 'gold', { seg: 5 });
    izpPalm(F, 0, 1.32, 0, 0.98, 0.62, 9, 0.2);
  }
});

/* a big bronze planter with a fan palm (state rooms, the atrium, the bath, the offices) */
FURN({
  key: 'iziz_court_palm_pot', name: 'Fan palm in a bronze planter', culture: 'iziz', tier: 'court', type: 'planter', setting: 'indoor',
  rooms: IZP_STATE.concat(['pal_bath', 'pal_office']), anchor: 'floor', clearance: {},
  materials: ['bronze', 'gold', 'stone', 'foliage', 'bark'],
  w: 1.8, d: 1.8, h: 2.6, variants: 1,
  build: function (F) {
    const B = F.col('bronze'), G = F.col('courtGilt');
    for (const x of [-1, 1]) for (const z of [-1, 1]) F.box(x * 0.27, 0, z * 0.27, 0.12, 0.06, 0.12, 0, G, 'gold');
    F.frustum(0, 0.06, 0, 0.34, 0.42, 0.6, 0, B, 'bronze', 8);
    F.frustum(0, 0.3, 0, 0.385, 0.395, 0.05, 0, G, 'gold', 8);
    F.frustum(0, 0.66, 0, 0.44, 0.44, 0.05, 0, G, 'gold', 8);
    F.cyl(0, 0.66, 0, 0.38, 0.03, 0, F.col('soilDark'), 'stone');
    for (let i = 0; i < 4; i++) F.frustum(0, 0.68 + i * 0.18, 0, 0.1 - i * 0.008, 0.085 - i * 0.008, 0.18, i * 0.4, F.col(i % 2 ? 'palmTrunkDark' : 'palmTrunk'), 'bark', 6);
    izpPalm(F, 0, 1.4, 0, 1.18, 0.88, 11, 0);
  }
});

/* a Roman dining couch in mahogany and gilt, a bolster and cushions (the triclinia, the reception rooms) */
FURN({
  key: 'iziz_court_kline', name: 'Dining couch', culture: 'iziz', tier: 'court', type: 'seating', setting: 'indoor',
  rooms: ['pal_feast', 'pal_reception'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['hyperMahogany', 'gold', 'cloth'],
  w: 2.2, d: 0.9, h: 1.0, variants: 2, variantNames: ['Couch, one headrest (cream)', 'Couch, two headrests (teal)'],
  build: function (F) {
    const W = F.col('courtMahogany'), G = F.col('courtGilt'), v = F.variant === 1;
    const mat = F.col(v ? 'clothTeal' : 'clothCream'), bol = F.col(v ? 'clothOrange' : 'clothTeal');
    for (const x of [-0.95, 0.95]) for (const z of [-0.36, 0.36]) {
      F.frustum(x, 0, z, 0.05, 0.04, 0.06, 0, G, 'gold', 8);
      F.cyl(x, 0.06, z, 0.035, 0.34, 0, W, 'mahogany');
      F.cyl(x, 0.2, z, 0.045, 0.03, 0, G, 'gold');
      F.frustum(x, 0.32, z, 0.035, 0.06, 0.08, 0, W, 'mahogany', 8);
    }
    F.box(0, 0.4, 0, 2.1, 0.12, 0.82, 0, W, 'mahogany');
    F.box(0, 0.45, 0.413, 2.1, 0.025, 0.01, 0, G, 'gold');
    F.box(0, 0.42, 0.413, 0.3, 0.08, 0.012, 0, G, 'gold');
    F.pillow(0, 0.6, 0, 2.0, 0.16, 0.78, 0, mat, 'cloth', { side: 0.5, puff: 0.3 });
    /* the fulcrum: a curved mahogany headrest, gilt medallions on its ends */
    const ends = v ? [-1, 1] : [-1];
    for (const s of ends) {
      const pts = [[0.72, 0.62], [0.86, 0.68], [0.96, 0.78], [1.0, 0.9], [0.98, 0.97]];
      for (let i = 0; i < pts.length - 1; i++) F.beam(s * pts[i][0], pts[i][1], 0, s * pts[i + 1][0], pts[i + 1][1], 0, 0.07, 0.8, W, 'mahogany');
      for (const t of [-1, 1]) izpDisc(F, s * 0.93, 0.8, t * 0.405, 0.06, 0.012, G, 'gold');
      F.rod(s * 0.8, 0.76, -0.34, s * 0.8, 0.76, 0.34, 0.08, bol, 'cloth');                   /* the bolster, gold-tied */
      for (const t of [-1, 1]) F.rod(s * 0.8, 0.76, t * 0.34, s * 0.8, 0.76, t * 0.37, 0.05, F.col('courtClothGold'), 'cloth');
    }
    F.pillow(v ? 0.2 : -0.42, 0.73, -0.12, 0.38, 0.1, 0.36, 0.3, F.col(v ? 'clothCream' : 'clothOrange'), 'cloth', { side: 0.3 });
  }
});

/* a long mahogany banquet table on gilt step-feet, a cream runner, gilt bowls of fruit (the triclinia) */
FURN({
  key: 'iziz_court_banquet_table', name: 'Banquet table', culture: 'iziz', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['pal_feast'], anchor: 'floor', clearance: { front: 0.8, back: 0.8 },
  materials: ['hyperMahogany', 'gold', 'cloth', 'food'],
  w: 4.8, d: 1.2, h: 0.95, variants: 1,
  build: function (F) {
    const W = F.col('courtMahogany'), WD = F.col('mahoganyDark'), G = F.col('courtGilt');
    for (const x of [-1.9, 0, 1.9]) {
      F.box(x, 0, 0, 0.34, 0.06, 1.0, 0, G, 'gold');
      F.box(x, 0.06, 0, 0.26, 0.06, 0.86, 0, G, 'gold');
      F.box(x, 0.12, 0, 0.16, 0.42, 0.7, 0, W, 'mahogany');
      for (const s of [-1, 1]) F.box(x + s * 0.081, 0.24, 0, 0.004, 0.18, 0.4, 0, G, 'gold');
      F.box(x, 0.54, 0, 0.24, 0.04, 0.8, 0, G, 'gold');
    }
    F.box(0, 0.2, 0, 3.64, 0.06, 0.08, 0, W, 'mahogany');
    F.box(0, 0.58, 0, 4.5, 0.12, 0.96, 0, WD, 'mahogany');
    F.box(0, 0.7, 0, 4.8, 0.06, 1.2, 0, W, 'mahogany');
    for (const s of [-1, 1]) F.box(0, 0.72, s * 0.6, 4.8, 0.02, 0.01, 0, G, 'gold');
    /* the runner, hanging over both ends, with gold stripes */
    const CC = F.col('courtClothCream');
    F.box(0, 0.76, 0, 4.8, 0.008, 0.42, 0, CC, 'cloth');
    for (const s of [-1, 1]) {
      F.box(s * 2.404, 0.54, 0, 0.008, 0.228, 0.42, 0, CC, 'cloth');
      F.box(0, 0.768, s * 0.17, 4.8, 0.004, 0.03, 0, F.col('courtClothGold'), 'cloth');
    }
    for (const x of [-1.5, 0, 1.5]) {
      F.frustum(x, 0.768, 0, 0.08, 0.16, 0.1, 0, G, 'gold', 12);
      for (let k = 0; k < 4; k++) F.ball(x + Math.cos(k * 1.7) * 0.07, 0.88 + (k === 3 ? 0.03 : 0), Math.sin(k * 1.7) * 0.07 * (k === 3 ? 0 : 1), 0.05, F.col(k % 2 ? 'fruitGrape' : 'fruitPomegranate'), 'food');
    }
  }
});

/* a tall gilt deco pier mirror (the bedchamber, the wardrobe, the bath, reception) */
FURN({
  key: 'iziz_court_mirror', name: 'Gilt pier mirror', culture: 'iziz', tier: 'court', type: 'art', setting: 'indoor',
  rooms: ['pal_bedchamber', 'pal_wardrobe', 'pal_bath', 'pal_reception'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['gold', 'glass', 'metal', 'ceramic'],
  w: 1.0, d: 0.1, h: 2.2, variants: 1,
  build: function (F) {
    const G = F.col('courtGilt'), GL = F.col('giltLight');
    F.box(0, 0, -0.02, 0.5, 0.06, 0.06, 0, G, 'gold');
    F.box(0, 0.06, -0.015, 1.0, 0.1, 0.07, 0, G, 'gold');
    F.box(0, 0.16, -0.04, 0.84, 1.78, 0.02, 0, F.col('mirrorSilver'), 'metal');
    F.box(0, 0.16, -0.024, 0.8, 1.78, 0.012, 0, F.col('mirrorGlass'), 'glass');
    for (const s of [-1, 1]) {
      F.box(s * 0.45, 0.16, -0.015, 0.1, 1.78, 0.07, 0, G, 'gold');
      F.box(s * 0.45, 0.25, 0.022, 0.03, 1.6, 0.006, 0, F.col('enamelTeal'), 'ceramic');
    }
    F.box(0, 1.94, -0.015, 1.0, 0.1, 0.07, 0, G, 'gold');
    F.box(0, 2.04, -0.02, 0.7, 0.05, 0.06, 0, GL, 'gold');
    izpDisc(F, 0, 2.06, -0.02, 0.1, 0.03, G, 'gold');
    for (let k = 0; k < 7; k++) izpRay(F, 0, 2.04, -0.02, (15 + k * 25) * Math.PI / 180, 0.08, k % 2 ? 0.13 : 0.16, 0.035, 0.04, GL, 'gold');
  }
});

/* a tall gilt harp with a mahogany soundbox (the music room) */
FURN({
  key: 'iziz_court_harp', name: 'Gilt harp', culture: 'iziz', tier: 'court', type: 'tool', setting: 'indoor',
  rooms: ['pal_music'], anchor: 'floor', clearance: { front: 0.8 }, task: [],
  materials: ['gold', 'hyperMahogany'],
  w: 0.8, d: 0.45, h: 1.9, variants: 1,
  build: function (F) {
    const G = F.col('courtGilt'), GL = F.col('giltLight'), W = F.col('courtMahogany');
    F.box(0, 0, 0, 0.62, 0.08, 0.42, 0, G, 'gold');
    F.box(0, 0.08, 0, 0.5, 0.06, 0.34, 0, G, 'gold');
    /* the column and its stepped capital */
    F.frustum(-0.32, 0.14, 0, 0.07, 0.045, 0.12, 0, G, 'gold', 8);
    F.cyl(-0.32, 0.14, 0, 0.035, 1.6, 0, G, 'gold');
    F.box(-0.32, 1.72, 0, 0.14, 0.05, 0.12, 0, G, 'gold');
    F.box(-0.32, 1.77, 0, 0.1, 0.05, 0.1, 0, GL, 'gold');
    F.ball(-0.32, 1.85, 0, 0.045, G, 'gold');
    /* the soundbox: wider at the foot, a gilt rib down its face */
    F.beam(-0.22, 0.16, 0, 0.04, 0.79, 0, 0.2, 0.22, W, 'mahogany');
    F.beam(0.04, 0.79, 0, 0.3, 1.42, 0, 0.13, 0.2, W, 'mahogany');
    F.beam(-0.22, 0.16, 0, 0.3, 1.42, 0, 0.035, 0.235, G, 'gold');
    /* the neck, and the strings from it to the soundbox */
    const neck = [[-0.32, 1.74], [-0.18, 1.7], [-0.02, 1.6], [0.14, 1.56], [0.28, 1.5], [0.34, 1.42]];
    F.tube(neck.map(p => [p[0], p[1], 0]), 0.04, G, 'gold', { seg: 6 });
    const ny = x => { for (let i = 0; i < neck.length - 1; i++) if (x <= neck[i + 1][0]) { const t = (x - neck[i][0]) / (neck[i + 1][0] - neck[i][0]); return neck[i][1] + t * (neck[i + 1][1] - neck[i][1]); } return neck[neck.length - 1][1]; };
    for (let i = 0; i < 11; i++) {
      const x = -0.2 + i * 0.044, yb = 0.16 + (x + 0.22) / 0.52 * 1.26;
      F.rod(x, yb, 0, x, ny(x) - 0.03, 0, 0.004, GL, 'gold');
    }
  }
});

/* the inscription on the trophy's plaque: lines of incised letters on bronze */
function izpPlaque(F) {
  const bz = F.css(F.col('bronzeLight')), dk = F.css(F.col('bronzeDark'));
  return function (g, W, H) {
    g.fillStyle = bz; g.fillRect(0, 0, W, H);
    g.strokeStyle = dk; g.lineWidth = 2; g.strokeRect(3, 3, W - 6, H - 6);
    g.fillStyle = dk;
    for (let r = 0; r < 3; r++) for (let x = W * 0.1; x < W * 0.9;) { const w = 3 + ((x * 7 + r * 13) % 5); g.fillRect(x, H * (0.22 + r * 0.24), w, H * 0.1); x += w + 3; }
  };
}
/* a trophy of Hook: the head and a shoulder plate of a broken enemy mech on a stepped marble plinth (Aula Regia, council, atrium) */
FURN({
  key: 'iziz_court_mech_trophy', name: 'Trophy of Hook (a broken mech)', culture: 'iziz', tier: 'court', type: 'monument', setting: 'indoor',
  rooms: ['pal_throne', 'pal_council', 'pal_atrium'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['stone', 'gold', 'bronze', 'metal', 'glass'],
  w: 1.8, d: 1.4, h: 2.1, variants: 1,
  build: function (F) {
    const M = F.col('marbleWhite'), G = F.col('courtGilt'), P = F.col('mechPaint'), S = F.col('mechSteel'), K = F.col('mechScorch');
    izpSteps(F, 0, 0, 0, 1.8, 1.4, 3, 0.2, 0.12, 0.1, M, 'stone');
    F.box(0, 0.6, 0, 1.2, 0.4, 0.9, 0, M, 'stone');
    F.box(0, 1.0, 0, 1.3, 0.06, 1.0, 0, M, 'stone');
    F.box(0, 0.97, 0, 1.24, 0.03, 0.94, 0, G, 'gold');
    F.box(0, 0.68, 0.451, 0.7, 0.24, 0.012, 0, F.col('bronze'), 'bronze');
    F.decal(0, 0.71, 0.4585, 0.62, 0.18, 0, 'izpalace-hook-plaque', izpPlaque(F), 'bronze');
    /* the head, knocked askew, a gilt wreath of victory on it */
    izpAt(F, 0.05, 0.05, 0.3, function () {
      F.box(0, 1.06, 0, 0.76, 0.5, 0.66, 0, P, 'metal');
      F.box(0, 1.06, 0.3, 0.5, 0.18, 0.14, 0, S, 'metal');
      F.box(0, 1.34, 0.335, 0.6, 0.08, 0.02, 0, K, 'metal');
      for (const s of [-1, 1]) F.ell(s * 0.16, 1.38, 0.345, 0.06, 0.04, 0.015, 0, F.col('mechLens'), 'glass');
      F.box(0, 1.56, -0.05, 0.12, 0.14, 0.5, 0, S, 'metal');
      F.box(0.375, 1.15, 0.05, 0.02, 0.25, 0.3, 0, K, 'metal');
      F.rod(-0.25, 1.56, -0.2, -0.32, 1.82, -0.25, 0.015, S, 'metal');
      F.tube([[0.05, 1.1, -0.33], [0.12, 1.04, -0.42], [0.1, 0.85, -0.47]], 0.03, F.col('mechCable'), 'metal', { seg: 5 });
      izpRing(F, 0, 1.58, 0, 0.24, 0.025, IZP_X, IZP_Z, G, 'gold', 20, 5);
    });
    /* the shoulder plate, leaning on it, with the enemy's faded marking and its rivets */
    F.beam(0.62, 1.06, -0.12, 0.52, 1.95, -0.26, 0.5, 0.12, P, 'metal');
    F.beam(0.6, 1.3, -0.05, 0.55, 1.8, -0.13, 0.1, 0.01, F.col('mechMark'), 'metal');
    for (const t of [0.25, 0.75]) for (const s of [-1, 1]) F.ball(0.62 - 0.1 * t + s * 0.19, 1.06 + 0.89 * t, -0.12 - 0.14 * t + 0.065, 0.018, S, 'metal');
  }
});

/* a fan screen's leaf: a cream enamel field, a sunburst of orange and teal from its foot, a gilt border */
function izpFanLeaf(F) {
  const cr = F.css(F.col('enamelCream')), or = F.css(F.col('enamelOrange')), te = F.css(F.col('enamelTeal')), go = F.css(F.col('courtGilt'));
  return function (g, W, H) {
    g.fillStyle = cr; g.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H * 0.98;
    for (let k = 0; k < 9; k++) {
      const a0 = Math.PI + k / 9 * Math.PI, a1 = a0 + Math.PI / 9;
      g.fillStyle = k % 2 ? te : or;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a0) * H, cy + Math.sin(a0) * H); g.lineTo(cx + Math.cos(a1) * H, cy + Math.sin(a1) * H); g.fill();
    }
    g.fillStyle = cr; g.beginPath(); g.arc(cx, cy, W * 0.5, Math.PI, 0); g.fill();
    g.fillStyle = or; g.beginPath(); g.arc(cx, cy, W * 0.32, Math.PI, 0); g.fill();
    g.strokeStyle = go; g.lineWidth = Math.max(3, W * 0.05); g.strokeRect(W * 0.04, W * 0.04, W * 0.92, H - W * 0.08);
    for (let y = H * 0.12; y < H * 0.3; y += H * 0.06) { g.beginPath(); g.moveTo(W * 0.15, y + H * 0.03); g.lineTo(cx, y); g.lineTo(W * 0.85, y + H * 0.03); g.stroke(); }   /* chevrons */
  };
}
/* a gilt-and-enamel folding screen of four leaves, a sunray on each (the bedchamber, reception, the bath, the triclinia) */
FURN({
  key: 'iziz_court_fan_screen', name: 'Sunray folding screen', culture: 'iziz', tier: 'court', type: 'screen', setting: 'indoor',
  rooms: ['pal_bedchamber', 'pal_reception', 'pal_bath', 'pal_feast'], anchor: 'floor', clearance: {},
  materials: ['gold', 'ceramic'],
  w: 1.9, d: 0.3, h: 1.9, variants: 1,
  build: function (F) {
    const G = F.col('courtGilt'), GL = F.col('giltLight'), L = 0.5, a = 0.38, paint = izpFanLeaf(F);
    const P = [[0, 0]];
    for (let i = 0; i < 4; i++) P.push([P[i][0] + L * Math.cos(a), (i % 2 ? 0 : L * Math.sin(a))]);
    const cx = 2 * L * Math.cos(a), cz = L * Math.sin(a) / 2;
    for (let i = 0; i < 4; i++) {
      const s = i % 2 ? -1 : 1, ry = -s * a, mx = (P[i][0] + P[i + 1][0]) / 2 - cx, mz = (P[i][1] + P[i + 1][1]) / 2 - cz;
      const nx = Math.sin(ry), nz = Math.cos(ry);
      F.box(mx, 0, mz, L - 0.1, 0.08, 0.08, ry, G, 'gold');
      F.box(mx, 0.08, mz, L - 0.02, 1.7, 0.04, ry, G, 'gold');
      F.box(mx, 1.78, mz, L - 0.14, 0.06, 0.04, ry, GL, 'gold');
      F.box(mx, 1.84, mz, L - 0.28, 0.06, 0.04, ry, G, 'gold');
      for (const o of [1, -1]) F.decal(mx + nx * 0.021 * o, 0.16, mz + nz * 0.021 * o, L - 0.08, 1.54, o > 0 ? ry : ry + Math.PI, 'izpalace-fanscreen', paint, 'ceramic');
    }
    for (let i = 1; i < 4; i++) F.cyl(P[i][0] - cx, 0.1, P[i][1] - cz, 0.02, 1.68, 0, GL, 'gold');
  }
});

/* a long crimson carpet runner, a gold border and repeated sun medallions (the Aula Regia, the triclinia, reception, the atrium) */
FURN({
  key: 'iziz_court_runner', name: 'Crimson sun runner', culture: 'iziz', tier: 'court', type: 'rug', setting: 'indoor',
  rooms: ['pal_throne', 'pal_feast', 'pal_reception', 'pal_atrium'], anchor: 'floor', clearance: {},
  materials: ['cloth'],
  w: 2.2, d: 9.0, h: 0.03, variants: 1,
  build: function (F) {
    const CR = F.col('courtBrocade'), GO = F.col('courtClothGold'), OR = F.col('clothOrange'), CC = F.col('courtClothCream'), TE = F.col('courtClothTeal');
    F.box(0, 0, 0, 2.2, 0.014, 8.8, 0, CR, 'cloth');
    for (const s of [-1, 1]) {
      F.box(0, 0, s * 4.45, 2.0, 0.006, 0.1, 0, CC, 'cloth');                                   /* the fringes */
      F.box(s * 1.0, 0.014, 0, 0.12, 0.006, 8.8, 0, GO, 'cloth');                                /* the gold border */
      F.box(0, 0.014, s * 4.3, 1.88, 0.006, 0.12, 0, GO, 'cloth');
      F.box(s * 0.88, 0.014, 0, 0.03, 0.004, 8.4, 0, TE, 'cloth');                               /* a teal line inside it */
      F.box(0, 0.014, s * 4.18, 1.79, 0.004, 0.03, 0, TE, 'cloth');
    }
    for (const z of [-3.2, -1.6, 0, 1.6, 3.2]) {                                               /* the sun medallions */
      F.cyl(0, 0.014, z, 0.5, 0.006, 0, GO, 'cloth');
      F.cyl(0, 0.014, z, 0.38, 0.008, 0, OR, 'cloth');
      F.cyl(0, 0.014, z, 0.16, 0.01, 0, CC, 'cloth');
      for (let k = 0; k < 8; k++) { const a = k / 8 * F.TAU + Math.PI / 8; F.box(Math.cos(a) * 0.62, 0.014, z + Math.sin(a) * 0.62, 0.26, 0.006, 0.07, -a, GO, 'cloth'); }
    }
    for (const z of [-4.0, -2.4, -0.8, 0.8, 2.4, 4.0]) F.box(0, 0.014, z, 0.2, 0.006, 0.2, Math.PI / 4, OR, 'cloth');   /* lozenges between */
  }
});

/* a baldachin: a crimson canopy with a gold fringe on four slender gilt columns, over a bed or a seat of state (the Aula
   Regia, the bedchamber). A frame: things stand under it, so it keeps no clearance */
FURN({
  key: 'iziz_court_baldachin', name: 'Baldachin', culture: 'iziz', tier: 'court', type: 'shelter', setting: 'indoor',
  rooms: ['pal_throne', 'pal_bedchamber'], anchor: 'floor', clearance: {},
  materials: ['gold', 'cloth'],
  w: 3.4, d: 3.4, h: 4.6, variants: 1,
  build: function (F) {
    const G = F.col('courtGilt'), GL = F.col('giltLight'), CR = F.col('courtBrocade'), GO = F.col('courtClothGold');
    for (const x of [-1, 1]) for (const z of [-1, 1]) {
      const X = x * 1.58, Z = z * 1.58;
      F.box(X, 0, Z, 0.24, 0.12, 0.24, 0, G, 'gold');
      F.box(X, 0.12, Z, 0.18, 0.08, 0.18, 0, GL, 'gold');
      F.cyl(X, 0.2, Z, 0.055, 3.66, 0, G, 'gold');
      for (const y of [1.2, 2.6]) F.cyl(X, y, Z, 0.07, 0.04, 0, GL, 'gold');
      F.box(X, 3.86, Z, 0.2, 0.08, 0.2, 0, GL, 'gold');
      F.ball(x * 1.66, 3.8, z * 1.66, 0.045, GO, 'cloth');                                      /* corner tassels */
    }
    /* the valance and its fringe, gold suns on it */
    for (const s of [-1, 1]) {
      F.box(0, 3.94, s * 1.68, 3.4, 0.36, 0.04, 0, CR, 'cloth');
      F.box(s * 1.68, 3.94, 0, 0.04, 0.36, 3.32, 0, CR, 'cloth');
      F.box(0, 3.86, s * 1.675, 3.4, 0.08, 0.05, 0, GO, 'cloth');
      F.box(s * 1.675, 3.86, 0, 0.05, 0.08, 3.3, 0, GO, 'cloth');
      for (let i = 0; i < 3; i++) {
        const t = -1.0 + i * 1.0;
        izpDisc(F, t, 4.12, s * 1.705, 0.08, 0.012, GO, 'cloth');
        izpAt(F, s * 1.705, t, Math.PI / 2, function () { izpDisc(F, 0, 4.12, 0, 0.08, 0.012, GO, 'cloth'); });
      }
    }
    /* the roof, its crimson underside with a gold sun, the finial */
    F.box(0, 4.29, 0, 3.32, 0.01, 3.32, 0, CR, 'cloth');
    F.cyl(0, 4.28, 0, 0.6, 0.01, 0, GO, 'cloth');
    F.pyrRoof(0, 4.3, 0, 3.4, 0.24, 3.4, 0, CR, 'cloth');
    F.ball(0, 4.55, 0, 0.05, G, 'gold');
    /* curtains gathered at the two back columns, tied with gold */
    for (const s of [-1, 1]) {
      F.box(s * 1.42, 2.0, -1.5, 0.4, 1.86, 0.16, 0, CR, 'cloth');
      F.box(s * 1.42, 0.25, -1.5, 0.3, 1.75, 0.14, 0, CR, 'cloth');
      F.box(s * 1.42, 1.96, -1.5, 0.34, 0.05, 0.18, 0, GO, 'cloth');
    }
  }
});
