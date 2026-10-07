/* ======================================================================
   Eastern Nomad furniture: common and court tiers (the three harvested
   Yuni nomad pieces, yuni_nomad_*, stay in krator-master-furniture.js).
   Influences: pueblo, Arab, Bedouin, Moroccan. Portable folding frames on
   x-legs, adobe hearths and ovens, striped kilims, cloth screens, copper
   and bone; the khan's tent in lozenge-banded rugs and copper. No socket
   pack yet.
   The bespoke tent furnishings (2026-10-07) are what the desert-nomads
   building kit (kits/desert-nomads) places by key in the black goat-hair
   tents, the square caidal tents, the khaimas and the pavilions: austere
   outside, Moroccan and Arabian inside but MUTED (the Scyvoi are the bright
   ones): sadu weave stripes in rust, black, cream, ochre and a little
   indigo, undyed camel and goat browns, cream wool, dull brass and copper,
   dark walnut and tamarisk with bone and brass inlay, pierced brass lanterns
   with star cut-outs, mashrabiya lattice. The abyssal nomads ride lizards.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('nomad', { name: 'Eastern Nomads', pack: null, influences: 'pueblo; Arab; Bedouin; Moroccan',
  materials: 'poplar, tamarisk, walnut, goat hair, camel wool, hide, felt, adobe, red and porous clay, dull brass, copper, bone; court: muted gold, deep madder, knotted carpets',
  palette: {
    plasterAdobe: 0xc08a5a, plasterAdobeDark: 0x9a6a40, clayRed: 0xa0503a, copper: 0xb5723a, boneIvory: 0xe8e0cc,
    clothCream: 0xe8dcc0, clothRust: 0x9a4a2a, clothTurquoise: 0x2c8aa0, flame: 0xffb04a, timberPoplar: 0xb09a6a,
    /* the keys the style sheets and the harvested Yuni nomad pieces name: the core's FPAL['nomad'] defaults, declared here */
    amber: 0xffb755, blackIron: 0x2a2622,
    clothViolet: 0x6a3a7a, clothIndigo: 0x2e5a8a, clothJade: 0x2f8a6a, clothMud: 0x8a7a54,
    clothMadder: 0xb83a2e, clothOrange: 0xc8642a, clothSaffron: 0xd8a030, ember: 0xd9762c,
    hideWalnut: 0x4e3222, hideChestnut: 0x6a4630, hideOak: 0x8a5c3c, ropeMustard: 0x85743e,
    stoneBlack: 0x14161a, stoneGranite: 0x7a7264, timberSepia: 0x4e3a28, timberUmber: 0x5e5236,
    /* the tent furnishings: sadu weave, camel and goat, dull metals, dark woods */
    saduRust: 0x8a3524, saduBlack: 0x221d1a, saduCream: 0xe0d4b8, saduOchre: 0xb48838, saduIndigo: 0x2f3a58,
    camelBrown: 0x8e6c4a, camelLight: 0xbfa07a, goatBlack: 0x262220, goatBrown: 0x4e3e30, woolCream: 0xe2d8c2, woolGrey: 0x8c857a,
    brassDull: 0x9c8048, brassDark: 0x6a5634, copperDull: 0x96603e, goldMuted: 0xb39150, madderDeep: 0x6c2a24, madderMuted: 0x8e4434,
    timberWalnut: 0x4a3426, timberWalnutDark: 0x2e2119, timberTamarisk: 0x7a6248, palmFrond: 0xb59f68, palmDark: 0x857145,
    leatherRed: 0x8c3e2c, leatherTan: 0xa47a4c, leatherDark: 0x4a3122, leatherGreen: 0x4e5a3e, ropeGoat: 0x3a322a,
    clayPorous: 0xc9a47c, clayDark: 0x8c6242, stoneSand: 0xb39c7a, stoneGrey: 0x6e665a, sand: 0xd4b88c, sandDark: 0xa88e68,
    ash: 0x4a4440, charcoal: 0x2a2522, glassSmoke: 0x7e9a90, glassGreen: 0x3e6e58, beadBlue: 0x2a5ea8,
    coffee: 0x3a2416, teaAmber: 0x8e3c14, mintGreen: 0x5a7a44, bread: 0xc8995a, breadChar: 0x6a4424,
    dateBrown: 0x5a2814, dateAmber: 0x8c4a1c, grain: 0xd4bc84, flour: 0xe8e0d0, sackJute: 0xa8926a,
    hideRaw: 0xcaa88a, hideFat: 0xe0cdb0, hideTanned: 0x8e5a30, hideSmoked: 0x6a4024, liquor: 0x2e1c10, lime: 0xe6e2d6, acaciaPod: 0x8a6a2a,
    glowAmber: 0xffbf5a, glowWarm: 0xffa040, chartSky: 0x262a3a
  } });
/* END PALETTE */
const NOMAD_COMMON = {
  emblem: { field: 'clothMadder', edge: 'timberSepia', band: 'clothSaffron', ink: 'clothCream', ink2: 'copper' },
  wood: 'timberUmber', woodDark: 'timberSepia', woodLight: 'timberPoplar', woodFam: 'wood',
  cloth: ['clothMadder', 'clothIndigo', 'clothSaffron', 'clothMud'], clothFam: 'cloth',
  accent: 'copper', accentFam: 'bronze', metal: 'blackIron', metalFam: 'metal',
  clay: 'clayRed', clayFam: 'stone', stone: 'plasterAdobe', stoneFam: 'plaster', rope: 'ropeMustard',
  flame: 'flame', ember: 'ember',
  legs: 'x', motif: 'chevron', bedBase: 'woven', seat: 'cushion', finial: 'none',
  hearth: 'mud', fire: 'ring', lamp: 'oil', rug: 'woven', screen: 'cloth', store: 'sacks',
  shelfFill: 'bundles', rack: 'cloaks', art: 'shield', art2: 'plate', statue: 'urn', tapestry: 'stripes',
  canopy: false, board: 'hide'
};
/* the court tier in the muted desert look: deep madder, muted gold, sadu indigo, cream (2026-10-07) */
const NOMAD_COURT = Object.assign({}, NOMAD_COMMON, {
  emblem: { field: 'madderDeep', edge: 'saduIndigo', band: 'goldMuted', ink: 'clothCream', ink2: 'goldMuted' },
  cloth: ['madderDeep', 'goldMuted', 'saduIndigo', 'clothCream'],
  accent: 'copper', accentFam: 'bronze', motif: 'lozenge', finial: 'ball', rug: 'knotted', statue: 'vase', tapestry: 'chevrons', screen: 'cloth'
});
FK.set({ culture: 'nomad', tier: 'common', S: NOMAD_COMMON, names: {
  bed: 'Folding bed frame', bench: 'Folding bench', chair: 'Folding chair', stool: 'Folding stool', table: 'Trestle table',
  low_table: 'Low folding table', desk: 'Scribe\'s desk', chest: 'Copper-cornered chest', bookcase: 'Bundle shelves', wall_shelves: 'Pot shelves',
  store: 'Saddle sacks', hearth: 'Adobe hearth', fire: 'Fire ring and tripod', lamp: 'Oil lamp on a stand', candle: 'Clay oil lamp',
  hanging: 'Hanging oil lamp', rug: 'Kilim', screen: 'Cloth screen', counter: 'Trade counter', workbench: 'Workbench',
  loom: 'Ground loom', rack: 'Cloak pegs', ladder: 'Ladder', board: 'Hide board', art: 'Hide shield', bowl: 'Red clay bowl',
  jug: 'Red clay jug and cups', books: 'Bundled scrolls' } });
FK.set({ culture: 'nomad', tier: 'court', S: NOMAD_COURT, names: {
  bed: 'Khan\'s dais bed', throne: 'Khan\'s seat', divan: 'Khan\'s divan', table: 'Feast table', low_table: 'Copper tray table',
  desk: 'Khan\'s writing desk', cabinet: 'Copper-bound cabinet', bookcase: 'Khan\'s shelves', hearth: 'Great adobe hearth', fire: 'Copper fire-bowl',
  lamp: 'Copper lamp stand', candelabra: 'Copper candelabra', hanging: 'Hanging copper lamp', carpet: 'Great kilim', screen: 'Silk screen',
  tapestry: 'Chevron hanging', art: 'Copper shield', statue: 'Great vase', jug: 'Copper ewer and cups', bowl: 'Copper bowl' } });
/* trades and households (FK.ROLES.trade): keyed nomad_trade_<role> */
FK.set({ culture: 'nomad', tier: 'common', roles: 'trade', prefix: 'nomad_trade_', S: NOMAD_COMMON, names: {
  forge: 'Smith\'s clay forge', anvil: 'Anvil on a stump', trough: 'Camel watering trough', stall: 'Camel stall', hayrack: 'Fodder rack',
  display: 'Cloth-merchant\'s display', armour_stand: 'Mail on a stand', weapon_rack: 'Spear and sword rack', vat: 'Dyer\'s vat',
  still: 'Rosewater still', bin: 'Grain bins', larder: 'Date and grain larder', bunk: 'Herders\' bunk', locker: 'Studded locker',
  lathe: 'Bow lathe', press: 'Date press', kiln: 'Potter\'s kiln', grindstone: 'Grindstone', altar: 'Seer\'s altar', barrel: 'Water-cask rack' } });

FURN({
  key: 'nomad_common_saddle_rack', name: 'Saddle rack', culture: 'nomad', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['hall', 'store', 'yard', 'antechamber'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'hide', 'cloth', 'bronze'],
  w: 0.8, d: 1.3, h: 1.1, variants: 1,
  build: function (F) {
    const wood = F.col('timberUmber'), hide = F.col('hideChestnut');
    for (const s of [-1, 1]) { F.beam(s * 0.34, 0, -0.5, 0, 0.8, -0.5, 0.06, 0.06, wood, 'wood'); F.beam(s * 0.34, 0, 0.5, 0, 0.8, 0.5, 0.06, 0.06, wood, 'wood'); }
    F.box(0, 0.76, 0, 0.14, 0.1, 1.3, 0, wood, 'wood');
    F.box(0, 0.86, 0, 0.5, 0.1, 0.9, 0, hide, 'hide');
    F.box(0, 0.96, -0.32, 0.4, 0.14, 0.1, 0, F.shade(hide, -0.1), 'hide');
    F.box(0, 0.96, 0.3, 0.3, 0.1, 0.1, 0, F.shade(hide, -0.1), 'hide');
    F.box(0, 0.9, 0, 0.56, 0.02, 0.5, 0, F.col('clothMadder'), 'cloth');            /* saddle cloth */
    for (const s of [-1, 1]) F.box(s * 0.3, 0.3, 0.05, 0.05, 0.56, 0.3, 0, F.shade(hide, 0.1), 'hide');
    F.ball(0, 1.06, 0.3, 0.035, F.col('copper'), 'bronze');
  }
});
FURN({
  key: 'nomad_court_tent_pole', name: 'Tent pole with hangings', culture: 'nomad', tier: 'court', type: 'banner', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber', 'bedroom'], anchor: 'floor', clearance: {},
  materials: ['timber', 'cloth', 'bronze', 'bone'],
  w: 0.9, d: 0.9, h: 2.8, variants: 1,
  build: function (F) {
    const wood = F.col('timberSepia');
    F.cyl(0, 0, 0, 0.1, 0.08, 0, F.col('copper'), 'bronze');
    F.cyl(0, 0.08, 0, 0.06, 2.6, 0, wood, 'wood');
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4 + 0.4; F.box(Math.cos(a) * 0.25, 1.2, Math.sin(a) * 0.25, 0.32, 1.4, 0.02, -a + Math.PI / 2, F.pick(['clothMadder', 'clothSaffron', 'clothTurquoise', 'clothCream']), 'cloth'); }
    F.cyl(0, 2.55, 0, 0.3, 0.05, 0, F.col('copper'), 'bronze');
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.rod(Math.cos(a) * 0.3, 2.56, Math.sin(a) * 0.3, Math.cos(a) * 0.4, 2.2, Math.sin(a) * 0.4, 0.012, F.col('boneIvory'), 'bone'); }
    F.ball(0, 2.74, 0, 0.06, F.col('copper'), 'bronze');
  }
});

/* ---------------------------------------------------------------------- shared shapes (2026-10-07)
   Everything here draws through the frame F it is handed; colours, not palette keys, unless it says so. */
const NOMAD_FX = {
  /* a closed ring of n beams: plane 'xy' (faces z), 'zy' (faces x) or 'xz' (lies flat); ry2 its height radius */
  ring: function (F, cx, cy, cz, R, n, w, d, col, fam, plane, ry2) {
    const Ry = ry2 || R, pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (i + 0.5) * F.TAU / n, c = Math.cos(a) * R, s = Math.sin(a);
      pts.push(plane === 'xz' ? [cx + c, cy, cz + s * R] : plane === 'zy' ? [cx, cy + s * Ry, cz + c] : [cx + c, cy + s * Ry, cz]);
    }
    for (let i = 0; i < n; i++) F.beam(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0], pts[i + 1][1], pts[i + 1][2], w, d, col, fam);
  },
  /* a run of beams through points [[x,y,z], ...], width tapering w0 -> w1 */
  chain: function (F, pts, w0, w1, col, fam) {
    for (let i = 0; i < pts.length - 1; i++) {
      const w = w0 + (w1 - w0) * i / Math.max(1, pts.length - 2);
      F.beam(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0], pts[i + 1][1], pts[i + 1][2], w, w, col, fam);
    }
  },
  /* a wool tassel hanging from (x, y, z), len long: a knot and a skirt */
  tassel: function (F, x, y, z, len, col, knot, fam) {
    fam = fam || 'cloth';
    F.frustum(x, y - len * 0.3, z, len * 0.09, len * 0.07, len * 0.3, 0, knot, fam, 6);
    F.cone(x, y - len, z, len * 0.17, len * 0.72, 0, col, fam);
  },
  /* a cushion from its arguments P = { x, y, z, w, h, d, ry, o } (F.pillow's), so a band can follow it; returns top() */
  cushion: function (F, P, col, fam) { return F.pillow(P.x, P.y, P.z, P.w, P.h, P.d, P.ry || 0, col, fam, P.o); },
  /* a woven stripe on a cushion P: a narrow pillow on the same centre, as thick as the cushion is there and a hair proud.
     axis 'x': narrow in the cushion's own x (runs along its d); 'z': narrow in its own z. off its centre, bw its width. */
  band: function (F, P, axis, off, bw, col, fam) {
    const o = P.o || {}, side = Math.min(0.95, Math.max(0, o.side || 0)), puff = o.puff == null ? 0.35 : o.puff, q = o.round == null ? 5 : o.round;
    const hs = P.h * side / 2, hb = P.h / 2 - hs, half = axis === 'x' ? P.w / 2 : P.d / 2, s = Math.min(0.98, Math.abs(off) / half);
    const k = Math.pow(Math.max(0, 1 - s * s), puff), hs2 = hs + 0.002, hb2 = hb * k + 0.003, h2 = 2 * (hs2 + hb2);
    const span = Math.pow(Math.max(0, 1 - Math.pow(s, q)), 1 / q) * (1 - (o.pinch == null ? 0.05 : o.pinch) * (1 - s * s));
    const rx = o.rx || 0, ry = P.ry || 0;
    let lx = 0, ly = 0, lz = 0;
    if (axis === 'x') lx = off; else { ly = -off * Math.sin(rx); lz = off * Math.cos(rx); }
    const dx = lx * Math.cos(ry) + lz * Math.sin(ry), dz = -lx * Math.sin(ry) + lz * Math.cos(ry);
    F.pillow(P.x + dx, P.y + ly, P.z + dz, axis === 'x' ? bw : P.w * span, h2, axis === 'x' ? P.d * span : bw, ry, col, fam,
      { rx: rx, side: hs2 / (hs2 + hb2), puff: puff, pinch: 0, round: 10, sag: 0 });
  },
  /* a cloth or fleece laid down a slope in the x-y plane: from the top point (x0, y0) along the unit direction (dx, dy)
     (dx > 0 down the right side, < 0 the left), len long, wz wide in z, th thick; returns its P for bands */
  drape: function (F, x0, y0, dx, dy, len, wz, th, col, fam, o) {
    const sg = dx >= 0 ? 1 : -1, nx = sg * -dy, ny = Math.abs(dx);
    const P = { x: x0 + dx * len / 2 + nx * th / 2, y: y0 + dy * len / 2 + ny * th / 2, z: 0, w: wz, h: th, d: len, ry: sg * Math.PI / 2,
      o: Object.assign({}, o || {}, { rx: Math.atan2(-dy, Math.abs(dx)) }) };
    NOMAD_FX.cushion(F, P, col, fam);
    return P;
  },
  /* sadu weave on a canvas: bands across H (top to bottom), each [share, css, motif, css2, css3]; motif 'plain', 'zig'
     (triangles), 'eyes' (the 'ayn lozenges, each with a dot), 'teeth' (the dhurus checker), 'tree' (the shajara chevrons) */
  paintSadu: function (g, W, H, bands) {
    let tot = 0; for (const b of bands) tot += b[0];
    const dia = function (x, y, rx, ry) { g.beginPath(); g.moveTo(x, y - ry); g.lineTo(x + rx, y); g.lineTo(x, y + ry); g.lineTo(x - rx, y); g.closePath(); g.fill(); };
    let y = 0;
    for (const b of bands) {
      const h = H * b[0] / tot, c1 = b[1], m = b[2], c2 = b[3], c3 = b[4];
      g.fillStyle = c1; g.fillRect(0, Math.floor(y), W, Math.ceil(h) + 1);
      if (m === 'zig') {
        const tw = h * 1.2; g.fillStyle = c2;
        for (let x = 0; x < W + tw; x += tw) { g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + tw / 2, y + h * 0.1); g.lineTo(x + tw, y + h); g.closePath(); g.fill(); }
      } else if (m === 'eyes') {
        const ew = h * 1.5;
        for (let x = ew / 2; x < W + ew; x += ew) { g.fillStyle = c2; dia(x, y + h / 2, h * 0.55, h * 0.42); g.fillStyle = c1; dia(x, y + h / 2, h * 0.3, h * 0.22); g.fillStyle = c3 || c2; dia(x, y + h / 2, h * 0.13, h * 0.1); }
      } else if (m === 'teeth') {
        const s = Math.max(2, h / 2); g.fillStyle = c2;
        for (let i = 0; i * s < W; i++) g.fillRect(i * s, y + (i % 2) * s, s, s);
      } else if (m === 'tree') {
        const tw = h * 0.9; g.strokeStyle = c2; g.lineWidth = Math.max(1.5, h * 0.08);
        for (let x = tw / 2; x < W + tw; x += tw) {
          g.beginPath(); g.moveTo(x, y + h * 0.1); g.lineTo(x, y + h * 0.9);
          for (let k = 0; k < 3; k++) { const yy = y + h * (0.3 + k * 0.22); g.moveTo(x - tw * 0.3, yy + h * 0.1); g.lineTo(x, yy - h * 0.04); g.lineTo(x + tw * 0.3, yy + h * 0.1); }
          g.stroke();
          if (c3) { g.fillStyle = c3; dia(x + tw / 2, y + h / 2, h * 0.08, h * 0.12); }
        }
      }
      y += h;
    }
  },
  /* bands given as palette keys -> css, for paintSadu */
  saduCss: function (F, bands) { return bands.map(b => [b[0], F.css(F.col(b[1])), b[2], b[3] && F.css(F.col(b[3])), b[4] && F.css(F.col(b[4]))]); },
  /* an eight-point star on an axis-aligned face with normal (nx, 0, nz): four strokes of square section, s across */
  star: function (F, x, y, z, s, nx, nz, col, fam) {
    const q = Math.max(0.02, s * 0.22), tx = -nz, tz = nx;
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 4, ux = tx * Math.cos(a), uy = Math.sin(a), uz = tz * Math.cos(a);
      F.beam(x - ux * s / 2, y - uy * s / 2, z - uz * s / 2, x + ux * s / 2, y + uy * s / 2, z + uz * s / 2, q, q, col, fam);
    }
  },
  /* a square pierced lantern: a footed base, four metal panels each pierced with n stars that glow, corner posts,
     a pyramid roof and a little dome; (x, z) its axis, y0 its foot, r its half-width, bh its panel height. Returns its top y. */
  lantern: function (F, x, y0, z, r, bh, M, mf, glow, n) {
    const dk = F.shade(M, -0.18), lt = F.shade(M, 0.1), p = r * 0.92;
    F.frustum(x, y0, z, r * 0.7, r * 0.88, bh * 0.08, 0, dk, mf, 4);
    F.frustum(x, y0 + bh * 0.08, z, r * 0.88, r * 1.0, bh * 0.06, 0, M, mf, 4);
    const yb = y0 + bh * 0.14;
    for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      F.box(x + nx * p, yb, z + nz * p, nz ? 2 * p : 0.012, bh, nz ? 0.012 : 2 * p, 0, M, mf);
      const s = Math.min(bh / (n + 0.5), p * 0.95);
      for (let i = 0; i < n; i++) NOMAD_FX.star(F, x + nx * (p + 0.016), yb + bh * (i + 0.5) / n, z + nz * (p + 0.016), s, nx, nz, glow, 'glow');
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(x + sx * p, yb, z + sz * p, 0.024, bh, 0.024, 0, lt, mf);
    F.frustum(x, yb + bh - 0.02, z, r * 1.02, r * 1.02, 0.025, 0, lt, mf, 4);
    F.frustum(x, yb + bh, z, r * 1.04, r * 0.3, bh * 0.3, 0, M, mf, 4);
    const yr = yb + bh * 1.3;
    F.dome(x, yr - 0.005, z, r * 0.34, r * 0.4, 0, M, mf);
    F.cone(x, yr + r * 0.36, z, r * 0.1, r * 0.4, 0, lt, mf);
    return yr + r * 0.76;
  },
  /* a dallah coffee pot: foot, belly, waist, flared shoulder, tiered lid and finial, the crescent beak spout toward
     angle ang (0 = +x), the handle opposite; bottom at y0, s its scale (1 = 0.36 m tall) */
  dallah: function (F, x, y0, z, s, ang, col, fam) {
    const c = Math.cos(ang), sn = Math.sin(ang), dk = F.shade(col, -0.15), lt = F.shade(col, 0.1);
    const P = (u, y) => [x + u * s * c, y0 + y * s, z - u * s * sn];
    F.frustum(x, y0, z, 0.07 * s, 0.088 * s, 0.03 * s, 0, dk, fam, 12);
    F.frustum(x, y0 + 0.03 * s, z, 0.088 * s, 0.1 * s, 0.05 * s, 0, col, fam, 14);
    F.frustum(x, y0 + 0.08 * s, z, 0.1 * s, 0.042 * s, 0.075 * s, 0, col, fam, 14);
    F.frustum(x, y0 + 0.152 * s, z, 0.048 * s, 0.048 * s, 0.016 * s, 0, dk, fam, 12);
    F.frustum(x, y0 + 0.165 * s, z, 0.042 * s, 0.07 * s, 0.075 * s, 0, lt, fam, 14);
    F.frustum(x, y0 + 0.236 * s, z, 0.072 * s, 0.072 * s, 0.014 * s, 0, dk, fam, 14);
    F.frustum(x, y0 + 0.25 * s, z, 0.062 * s, 0.026 * s, 0.045 * s, 0, col, fam, 12);
    F.frustum(x, y0 + 0.292 * s, z, 0.026 * s, 0.014 * s, 0.028 * s, 0, lt, fam, 8);
    F.cone(x, y0 + 0.318 * s, z, 0.014 * s, 0.04 * s, 0, lt, fam);
    NOMAD_FX.chain(F, [P(0.088, 0.06), P(0.125, 0.11), P(0.15, 0.175), P(0.165, 0.24), P(0.185, 0.272), P(0.22, 0.282)], 0.032 * s, 0.014 * s, col, fam);
    NOMAD_FX.chain(F, [P(-0.06, 0.225), P(-0.115, 0.232), P(-0.13, 0.17), P(-0.11, 0.1), P(-0.09, 0.07)], 0.016 * s, 0.016 * s, dk, fam);
  },
  /* the shadad camel saddle: two arches of crossed sticks (front and back, z = +-zf), each pair crossing under a pair of
     pommel posts capped in brass, lashed where they cross, joined by side boards; y0 the stick feet */
  shadad: function (F, y0, zf, wood, cap, capFam, rope) {
    for (const z of [-zf, zf]) {
      for (const s of [-1, 1]) {
        F.rod(s * 0.36, y0, z, -s * 0.1, y0 + 0.6, z, 0.024, wood, 'wood');
        F.ball(-s * 0.1, y0 + 0.615, z, 0.034, cap, capFam);
      }
      F.box(0, y0 + 0.43, z, 0.09, 0.08, 0.065, 0, rope, 'rope');
    }
    for (const s of [-1, 1]) F.beam(s * 0.27, y0 + 0.12, -zf - 0.07, s * 0.27, y0 + 0.12, zf + 0.07, 0.03, 0.11, F.shade(wood, 0.08), 'wood');
  },
  /* a palm-leaf basket heaped with dates: rb/rt its bottom/top radius, h its height, heap the heap's height */
  basket: function (F, x, z, rb, rt, h, heap, palm, palmDk, dates) {
    F.frustum(x, 0, z, rb, rt, h, 0, palm, 'wicker', 12);
    for (let y = 0.035; y < h - 0.03; y += 0.05) F.cyl(x, y, z, rb + (rt - rb) * (y + 0.01) / h + 0.004, 0.02, 0, palmDk, 'wicker');
    F.cyl(x, h - 0.02, z, rt + 0.012, 0.03, 0, F.shade(palm, -0.1), 'wicker');
    if (heap > 0) {
      F.dome(x, h - 0.02, z, rt * 0.92, heap, 0, F.shade(dates[0], -0.2), 'food');
      const n = Math.max(5, Math.round(rt * 45));
      for (let i = 0; i < n; i++) {
        const a = i * F.TAU / n + F.rr(0, 0.4), rr = rt * (i % 2 ? 0.35 : 0.65), yy = h - 0.02 + heap * (i % 2 ? 0.8 : 0.5);
        F.blob(x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr, 0.02, 0.04, a, dates[i % dates.length], 'food');
      }
    }
  }
};

/* ====================================================================== Seating */
FURN({
  key: 'nomad_majlis_mattress', name: 'Majlis floor mattress', culture: 'nomad', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['cloth'],
  w: 2.0, d: 0.8, h: 0.65, variants: 2, variantNames: ['rust sadu, cream cushions', 'black and cream sadu, rust cushions'],
  build: function (F) {
    const v = F.variant, X = NOMAD_FX;
    const base = F.col(v ? 'saduBlack' : 'saduRust'), cush = F.col(v ? 'saduRust' : 'woolCream');
    const s1 = F.col(v ? 'saduCream' : 'saduBlack'), s2 = F.col('saduOchre'), s3 = F.col(v ? 'saduBlack' : 'saduRust');
    /* the mattress, its back to the wall, a sadu band woven along its front */
    const M = { x: 0, y: 0.075, z: 0, w: 1.96, h: 0.15, d: 0.78, o: { side: 0.5, puff: 0.4, pinch: 0.01 } };
    X.cushion(F, M, base, 'cloth');
    const bands = X.saduCss(F, v
      ? [[1, 'saduCream'], [1, 'saduBlack'], [3, 'saduCream', 'teeth', 'saduBlack'], [1, 'saduBlack'], [1, 'saduRust']]
      : [[1, 'saduBlack'], [1, 'saduCream'], [3, 'saduBlack', 'eyes', 'saduCream', 'saduOchre'], [1, 'saduCream'], [1, 'saduBlack']]);
    F.decal(0, 0.03, 0.393, 1.8, 0.085, 0, 'nomad-majlis-front-' + v, function (g, W, H) { X.paintSadu(g, W, H, bands); }, 'cloth');
    for (let i = 0; i < 8; i++) X.tassel(F, -0.84 + i * 0.24, 0.05, 0.396, 0.07, s2, s1);
    /* back cushions leaning on the wall, striped down their faces */
    for (const x of [-0.64, 0, 0.64]) {
      const B = { x: x, y: 0.38, z: -0.27, w: 0.6, h: 0.18, d: 0.48, o: { rx: -Math.PI / 2 - 0.15, puff: 0.85, pinch: 0.07 } };
      X.cushion(F, B, cush, 'cloth');
      for (const s of [-1, 1]) { X.band(F, B, 'x', s * 0.2, 0.04, s1, 'cloth'); X.band(F, B, 'x', s * 0.145, 0.02, s2, 'cloth'); }
      X.band(F, B, 'x', 0, 0.05, s3, 'cloth');
    }
    /* firm arm cushions at the ends, banded across */
    for (const s of [-1, 1]) {
      const A = { x: s * 0.87, y: 0.255, z: 0.0, w: 0.2, h: 0.22, d: 0.66, o: { side: 0.55, puff: 0.5, round: 6, pinch: 0.03 } };
      X.cushion(F, A, s3 === base ? cush : s3, 'cloth');
      for (const o of [-0.22, 0.22]) X.band(F, A, 'z', o, 0.04, s1, 'cloth');
      X.band(F, A, 'z', 0, 0.06, s2, 'cloth');
      X.tassel(F, s * 0.87, 0.2, 0.33, 0.08, s1, s2);
    }
  }
});
FURN({
  key: 'nomad_floor_cushion', name: 'Floor cushion', culture: 'nomad', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['cloth', 'bronze'],
  w: 0.65, d: 0.65, h: 0.24, variants: 3, variantNames: ['rust sadu weave', 'undyed camel with black bands', 'indigo, cream piping'],
  build: function (F) {
    const v = F.variant, X = NOMAD_FX;
    const P = { x: 0, y: 0.11, z: 0, w: 0.62, h: 0.22, d: 0.62, o: { side: 0.3, puff: 0.9, pinch: 0.06, round: 4 } };
    const body = F.col(['saduRust', 'camelLight', 'saduIndigo'][v]);
    const top = X.cushion(F, P, body, 'cloth');
    if (v === 0) {
      for (const s of [-1, 1]) { X.band(F, P, 'x', s * 0.17, 0.045, F.col('saduBlack'), 'cloth'); X.band(F, P, 'x', s * 0.11, 0.02, F.col('saduCream'), 'cloth'); }
      X.band(F, P, 'x', 0, 0.03, F.col('saduOchre'), 'cloth');
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) X.tassel(F, sx * 0.27, 0.11, sz * 0.27, 0.08, F.col('saduBlack'), F.col('saduCream'));
    } else if (v === 1) {
      X.band(F, P, 'z', 0, 0.1, F.col('goatBlack'), 'cloth');
      for (const s of [-1, 1]) X.band(F, P, 'z', s * 0.13, 0.03, F.col('saduRust'), 'cloth');
    } else {
      const pipe = F.col('saduCream');
      for (const L of [top.seamTop, top.seamBottom]) for (let i = 0; i < L.length - 1; i++)
        F.beam(L[i][0], 0.11 + L[i][1], L[i][2], L[i + 1][0], 0.11 + L[i + 1][1], L[i + 1][2], 0.014, 0.014, pipe, 'cloth');
      const ty = 0.11 + top(0, 0);
      F.box(0, ty - 0.012, 0, 0.16, 0.012, 0.16, 0, pipe, 'cloth');
      F.box(0, ty - 0.012, 0, 0.16, 0.012, 0.16, Math.PI / 4, pipe, 'cloth');
      F.box(0, ty - 0.008, 0, 0.08, 0.012, 0.08, Math.PI / 4, F.col('saduOchre'), 'cloth');
      F.ball(0, ty, 0, 0.02, F.col('brassDull'), 'bronze');
    }
  }
});
FURN({
  key: 'nomad_arm_cushion', name: 'Masnad arm cushion', culture: 'nomad', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['cloth'],
  w: 0.7, d: 0.42, h: 0.48, variants: 2, variantNames: ['rust sadu', 'black and cream sadu'],
  build: function (F) {
    /* a firm wedge: a sloped front face and an upright back meeting at the ridge, the ends closed by gussets */
    const v = F.variant, X = NOMAD_FX;
    const face = F.col(v ? 'saduBlack' : 'saduRust'), back = F.shade(face, -0.12), s1 = F.col(v ? 'saduCream' : 'saduBlack'), s2 = F.col('saduOchre');
    X.cushion(F, { x: 0, y: 0.23, z: -0.12, w: 0.68, h: 0.07, d: 0.46, o: { rx: -Math.PI / 2, puff: 0.6, pinch: 0.04, side: 0.3 } }, back, 'cloth');
    const a = 0.537, Fr = { x: 0, y: 0.248, z: 0.05, w: 0.68, h: 0.07, d: 0.49, o: { rx: -Math.PI / 2 - a, puff: 0.6, pinch: 0.04, side: 0.3 } };
    X.cushion(F, Fr, face, 'cloth');
    for (const o of [-0.13, 0.13]) X.band(F, Fr, 'z', o, 0.04, s1, 'cloth');
    X.band(F, Fr, 'z', 0, 0.06, s2, 'cloth');
    for (const o of [-0.19, 0.19]) X.band(F, Fr, 'z', o, 0.02, s2, 'cloth');
    for (const s of [-1, 1]) {
      for (let k = 0; k < 6; k++) {
        const y = 0.03 + k * 0.07, zf = 0.175 - (y + 0.035 - 0.035) * (0.25 / 0.42) - 0.015;
        F.box(s * 0.31, y, (zf - 0.12) / 2, 0.03, 0.07, Math.max(0.02, zf + 0.12), 0, back, 'cloth');
      }
      X.tassel(F, s * 0.33, 0.44, -0.09, 0.09, s1, s2);
    }
    F.bolster(0, 0.45, -0.1, 0.66, 0.025, 0, s1, 'cloth', { gather: 0.9 });
  }
});
FURN({
  key: 'nomad_pouf', name: 'Embroidered leather pouf', culture: 'nomad', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['hide'],
  w: 0.58, d: 0.58, h: 0.4, variants: 2, variantNames: ['red leather, cream embroidery', 'tan leather, ochre embroidery'],
  build: function (F) {
    const v = F.variant, X = NOMAD_FX, L = F.col(v ? 'leatherTan' : 'leatherRed'), st = F.col(v ? 'saduOchre' : 'saduCream'), dk = F.shade(L, -0.22);
    const P = { x: 0, y: 0.19, z: 0, w: 0.54, h: 0.38, d: 0.54, o: { side: 0.6, puff: 0.6, round: 2, pinch: 0, sag: 0.2 } };
    const top = X.cushion(F, P, L, 'hide');
    for (const Lp of [top.seamTop, top.seamBottom]) for (let i = 0; i < Lp.length - 1; i += 2) {
      const j = Math.min(Lp.length - 1, i + 2);
      F.beam(Lp[i][0], 0.19 + Lp[i][1], Lp[i][2], Lp[j][0], 0.19 + Lp[j][1], Lp[j][2], 0.016, 0.016, dk, 'hide');
    }
    const ty = (x, z) => 0.19 + top(x, z);
    /* the top: an eight-point star, a dark centre, a ring of lozenges */
    F.box(0, ty(0, 0) - 0.012, 0, 0.17, 0.014, 0.17, 0, st, 'hide');
    F.box(0, ty(0, 0) - 0.012, 0, 0.17, 0.014, 0.17, Math.PI / 4, st, 'hide');
    F.box(0, ty(0, 0) - 0.008, 0, 0.08, 0.014, 0.08, Math.PI / 4, dk, 'hide');
    for (let i = 0; i < 8; i++) {
      const a = i * F.TAU / 8 + F.TAU / 16, x = Math.cos(a) * 0.17, z = Math.sin(a) * 0.17;
      F.box(x, ty(x, z) - 0.012, z, 0.04, 0.014, 0.04, Math.PI / 4 - a, i % 2 ? st : dk, 'hide');
    }
    /* the wall: stitched gores and a zigzag of embroidery */
    for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.beam(Math.cos(a) * 0.272, 0.09, Math.sin(a) * 0.272, Math.cos(a) * 0.272, 0.29, Math.sin(a) * 0.272, 0.012, 0.012, dk, 'hide'); }
    const pts = [];
    for (let i = 0; i <= 24; i++) { const a = (i + 0.5) * F.TAU / 24; pts.push([Math.cos(a) * 0.276, i % 2 ? 0.24 : 0.15, Math.sin(a) * 0.276]); }
    X.chain(F, pts, 0.014, 0.014, st, 'hide');
  }
});
FURN({
  key: 'nomad_camel_saddle_seat', name: 'Camel-saddle backrest', culture: 'nomad', tier: 'common', type: 'seating', setting: 'both',
  rooms: ['hall', 'antechamber', 'court', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'hide', 'cloth', 'rope', 'bronze'],
  w: 0.9, d: 0.7, h: 0.7, variants: 1,
  build: function (F) {
    /* a shadad saddle frame set on the ground, a sadu blanket and a sheepskin thrown over it: a backrest */
    const X = NOMAD_FX;
    X.shadad(F, 0.025, 0.2, F.col('timberTamarisk'), F.col('brassDull'), 'bronze', F.col('ropeGoat'));
    const B = X.drape(F, 0.02, 0.5, 0.62, -0.785, 0.6, 0.64, 0.025, F.col('saduRust'), 'cloth', { puff: 0.3, round: 6, pinch: 0.02, side: 0.4 });
    for (const [o, w, k] of [[0.2, 0.04, 'saduBlack'], [0.245, 0.02, 'saduCream'], [0.12, 0.03, 'saduOchre']]) X.band(F, B, 'z', o, w, F.col(k), 'cloth');
    for (const s of [-1, 1]) X.drape(F, s * 0.02, 0.52, s * 0.608, -0.794, 0.52, 0.58, 0.06, F.col('woolCream'), 'hide', { puff: 0.9, round: 2.8, pinch: 0.12 });
  }
});

/* ====================================================================== Tables and vessels */
FURN({
  key: 'nomad_tray_table', name: 'Engraved brass tray table', culture: 'nomad', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['timber', 'bronze', 'bone', 'hide'],
  w: 0.8, d: 0.8, h: 0.45, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberWalnut'), brass = F.col('brassDull'), bone = F.col('boneIvory'), dk = F.shade(brass, -0.25);
    /* the folding x-stand: two pairs of crossed legs, bone inlay, a pivot pin, webbing straps */
    for (const z of [-0.17, 0.17]) {
      for (const s of [-1, 1]) {
        F.beam(s * 0.24, 0, z, -s * 0.22, 0.4, z, 0.04, 0.03, wood, 'wood');
        for (const t of [0.2, 0.75]) F.rod(s * (0.24 - 0.46 * t), 0.4 * t, z, s * (0.24 - 0.46 * t), 0.4 * t, z + Math.sign(z) * 0.02, 0.01, bone, 'bone');
      }
    }
    F.rod(0, 0.2, -0.2, 0, 0.2, 0.2, 0.012, brass, 'bronze');
    for (const s of [-1, 1]) F.box(s * 0.22, 0.385, 0, 0.05, 0.015, 0.4, 0, F.col('leatherDark'), 'hide');
    /* the tray: rings, an engraved eight-point star, a ring of lozenges, a raised rim */
    F.cyl(0, 0.4, 0, 0.39, 0.025, 0, brass, 'bronze');
    F.cyl(0, 0.407, 0, 0.36, 0.02, 0, dk, 'bronze');
    F.cyl(0, 0.409, 0, 0.3, 0.02, 0, brass, 'bronze');
    for (const r of [0, Math.PI / 4]) F.box(0, 0.411, 0, 0.26, 0.02, 0.26, r, dk, 'bronze');
    F.cyl(0, 0.413, 0, 0.07, 0.02, 0, F.shade(brass, 0.12), 'bronze');
    for (let i = 0; i < 16; i++) { const a = i * F.TAU / 16; F.box(Math.cos(a) * 0.33, 0.413, Math.sin(a) * 0.33, 0.03, 0.02, 0.03, Math.PI / 4 - a, F.shade(brass, 0.12), 'bronze'); }
    X.ring(F, 0, 0.425, 0, 0.39, 24, 0.02, 0.02, F.shade(brass, 0.1), 'bronze', 'xz');
  }
});
FURN({
  key: 'nomad_low_table', name: 'Inlaid octagonal low table', culture: 'nomad', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber', 'bedroom'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['timber', 'bone', 'bronze'],
  w: 0.85, d: 0.85, h: 0.36, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), dk = F.col('timberWalnutDark'), bone = F.col('boneIvory'), brass = F.col('brassDull');
    for (let k = 0; k < 8; k++) {
      const phi = k * Math.PI / 4, c = Math.cos(phi), s = Math.sin(phi), cv = Math.cos(phi + Math.PI / 8), sv = Math.sin(phi + Math.PI / 8);
      F.box(cv * 0.39, 0, sv * 0.39, 0.035, 0.3, 0.035, -(phi + Math.PI / 8), dk, 'wood');
      F.box(c * 0.358, 0.22, s * 0.358, 0.29, 0.08, 0.02, Math.PI / 2 - phi, wood, 'wood');
      F.box(c * 0.358, 0.02, s * 0.358, 0.29, 0.03, 0.02, Math.PI / 2 - phi, wood, 'wood');
      /* a pointed arch under the apron */
      const tx = -s, tz = c, ax = c * 0.36, az = s * 0.36;
      for (const sg of [-1, 1]) F.beam(ax + tx * sg * 0.14, 0.1, az + tz * sg * 0.14, ax, 0.215, az, 0.02, 0.02, dk, 'wood');
      for (const o of [-0.08, 0, 0.08]) F.rod(ax + tx * o, 0.26, az + tz * o, ax + tx * o + c * 0.02, 0.26, az + tz * o + s * 0.02, 0.012, o ? bone : brass, o ? 'bone' : 'bronze');
    }
    F.frustum(0, 0.3, 0, 0.44, 0.44, 0.035, Math.PI / 8, wood, 'wood', 8);
    F.frustum(0, 0.302, 0, 0.42, 0.42, 0.035, Math.PI / 8, dk, 'wood', 8);
    F.frustum(0, 0.304, 0, 0.39, 0.39, 0.035, Math.PI / 8, wood, 'wood', 8);
    for (const r of [0, Math.PI / 4]) F.box(0, 0.322, 0, 0.3, 0.02, 0.3, r, bone, 'bone');
    for (const r of [0, Math.PI / 4]) F.box(0, 0.324, 0, 0.17, 0.02, 0.17, r, dk, 'wood');
    F.cyl(0, 0.326, 0, 0.04, 0.02, 0, brass, 'bronze');
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4 + Math.PI / 8;
      F.box(Math.cos(a) * 0.3, 0.322, Math.sin(a) * 0.3, 0.04, 0.02, 0.04, Math.PI / 4 - a, brass, 'bronze');
    }
  }
});
FURN({
  key: 'nomad_tea_set', name: 'Moroccan tea set on a tray', culture: 'nomad', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'kitchen', 'antechamber', 'court', 'bedroom'], anchor: 'surface', clearance: {},
  materials: ['bronze', 'glass', 'gold', 'foliage'],
  w: 0.42, d: 0.42, h: 0.25, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, brass = F.col('brassDull'), pot = F.shade('brassDull', 0.15), dk = F.shade(brass, -0.2);
    F.cyl(0, 0, 0, 0.2, 0.02, 0, brass, 'bronze');
    F.cyl(0, 0.002, 0, 0.14, 0.02, 0, dk, 'bronze');
    X.ring(F, 0, 0.022, 0, 0.195, 18, 0.016, 0.016, F.shade(brass, 0.1), 'bronze', 'xz');
    /* the berrad teapot: foot, belly, shoulder, a conical lid with finial, long curved spout, loop handle */
    const x = -0.05, z = -0.04;
    F.cyl(x, 0.02, z, 0.04, 0.02, 0, dk, 'bronze');
    F.blob(x, 0.085, z, 0.068, 0.1, 0, pot, 'bronze');
    F.frustum(x, 0.12, z, 0.055, 0.03, 0.03, 0, pot, 'bronze', 14);
    F.cyl(x, 0.15, z, 0.03, 0.02, 0, dk, 'bronze');
    F.frustum(x, 0.168, z, 0.034, 0.012, 0.045, 0, pot, 'bronze', 12);
    F.cone(x, 0.21, z, 0.012, 0.035, 0, F.shade(pot, 0.1), 'bronze');
    X.chain(F, [[x + 0.055, 0.075, z], [x + 0.1, 0.1, z + 0.01], [x + 0.13, 0.145, z + 0.015], [x + 0.15, 0.178, z + 0.02]], 0.02, 0.02, pot, 'bronze');
    X.chain(F, [[x - 0.045, 0.14, z], [x - 0.1, 0.15, z], [x - 0.11, 0.1, z], [x - 0.065, 0.06, z]], 0.02, 0.02, dk, 'bronze');
    /* glasses of tea with gilt bands */
    for (const [gx, gz] of [[0.03, 0.13], [0.1, 0.1], [0.15, 0.03], [0.14, -0.06], [-0.04, 0.15], [0.09, -0.13]]) {
      F.frustum(gx, 0.02, gz, 0.02, 0.026, 0.07, 0, F.col('teaAmber'), 'glass', 10);
      F.cyl(gx, 0.055, gz, 0.026, 0.02, 0, F.col('goldMuted'), 'gold');
    }
    /* the sugar box and a bunch of mint */
    F.box(-0.12, 0.02, 0.09, 0.07, 0.05, 0.07, 0.3, pot, 'bronze');
    F.frustum(-0.12, 0.07, 0.09, 0.037, 0.02, 0.025, 0.3, dk, 'bronze', 4);
    F.cone(-0.12, 0.095, 0.09, 0.012, 0.025, 0, pot, 'bronze');
    F.blob(0.06, 0.04, 0.02, 0.035, 0.04, 0, F.col('mintGreen'), 'plant');
  }
});
FURN({
  key: 'nomad_coffee_set', name: 'Dallahs and coffee things', culture: 'nomad', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'kitchen', 'antechamber', 'court'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['bronze', 'metal', 'ceramic', 'food'],
  w: 0.9, d: 0.6, h: 0.45, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, brass = F.col('brassDull'), cop = F.col('copperDull'), iron = F.col('blackIron');
    X.dallah(F, -0.3, 0, -0.1, 1.0, -0.5, brass, 'bronze');
    X.dallah(F, -0.07, 0, -0.16, 0.85, -0.4, cop, 'bronze');
    X.dallah(F, 0.13, 0, -0.12, 0.72, -0.6, brass, 'bronze');
    /* the brass mortar and its pestle */
    const mx = 0.33, mz = -0.1;
    F.frustum(mx, 0, mz, 0.065, 0.08, 0.025, 0, F.shade(brass, -0.15), 'bronze', 14);
    F.frustum(mx, 0.025, mz, 0.075, 0.085, 0.15, 0, brass, 'bronze', 14);
    for (const y of [0.06, 0.14]) F.cyl(mx, y, mz, 0.083, 0.02, 0, F.shade(brass, -0.2), 'bronze');
    F.rod(mx, 0.12, mz, mx + 0.04, 0.41, mz + 0.02, 0.016, F.shade(brass, 0.1), 'bronze');
    F.ball(mx + 0.042, 0.42, mz + 0.021, 0.024, F.shade(brass, 0.1), 'bronze');
    /* the long-handled roasting pan with beans, and the stirring rod */
    F.cyl(0.08, 0, 0.16, 0.1, 0.03, 0, iron, 'metal');
    F.cyl(0.08, 0.012, 0.16, 0.09, 0.02, 0, F.col('coffee'), 'food');
    F.rod(0.17, 0.025, 0.17, 0.43, 0.05, 0.22, 0.01, iron, 'metal');
    F.rod(0.04, 0.04, 0.13, 0.36, 0.035, 0.26, 0.006, iron, 'metal');
    /* finjan cups on a copper tray */
    F.cyl(-0.24, 0, 0.17, 0.11, 0.02, 0, cop, 'bronze');
    for (const [cx, cz] of [[-0.29, 0.13], [-0.2, 0.12], [-0.26, 0.22], [-0.18, 0.2], [-0.32, 0.2]]) {
      F.frustum(cx, 0.02, cz, 0.022, 0.03, 0.04, 0, F.col('saduCream'), 'ceramic', 10);
      F.cyl(cx, 0.044, cz, 0.031, 0.02, 0, F.col('saduRust'), 'ceramic');
    }
  }
});
FURN({
  key: 'nomad_hookah', name: 'Shisha', culture: 'nomad', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'antechamber', 'court', 'tavern'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['glass', 'bronze', 'stone', 'hide', 'emissive'],
  w: 0.34, d: 0.36, h: 0.78, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, brass = F.col('brassDull'), lt = F.shade(brass, 0.12);
    F.frustum(0, 0, 0, 0.07, 0.06, 0.03, 0, brass, 'bronze', 14);
    F.blob(0, 0.13, 0, 0.11, 0.22, 0, F.col('glassSmoke'), 'glass');
    F.frustum(0, 0.22, 0, 0.04, 0.025, 0.05, 0, F.col('glassSmoke'), 'glass', 12);
    F.cyl(0, 0.26, 0, 0.035, 0.03, 0, brass, 'bronze');
    F.rod(0, 0.28, 0, 0, 0.62, 0, 0.014, brass, 'bronze');
    for (const y of [0.34, 0.45, 0.53]) F.blob(0, y, 0, 0.03, 0.05, 0, lt, 'bronze');
    F.cyl(0, 0.4, 0, 0.032, 0.02, 0, brass, 'bronze');
    F.cyl(0, 0.58, 0, 0.09, 0.015, 0, brass, 'bronze');
    X.ring(F, 0, 0.6, 0, 0.09, 14, 0.014, 0.014, lt, 'bronze', 'xz');
    /* the clay bowl, coals glowing on it */
    F.frustum(0, 0.62, 0, 0.025, 0.055, 0.07, 0, F.col('clayRed'), 'stone', 12);
    F.cyl(0, 0.69, 0, 0.058, 0.02, 0, F.col('clayDark'), 'stone');
    for (const [cx, cz] of [[0.02, 0.01], [-0.02, 0.015], [0, -0.025]]) F.box(cx, 0.705, cz, 0.03, 0.025, 0.03, cx * 20, F.col('ember'), 'glow');
    /* the hose: from its port, down, and coiled on the floor to the mouthpiece */
    const hose = F.col('leatherDark'), pts = [[0.03, 0.4, 0], [0.09, 0.4, 0.02], [0.14, 0.3, 0.06], [0.16, 0.12, 0.1], [0.15, 0.03, 0.13]];
    for (let i = 1; i <= 10; i++) { const a = 1.2 + i * 0.6, r = 0.1 - i * 0.004; pts.push([0.06 + Math.cos(a) * r * 1.4, 0.022, 0.1 + Math.sin(a) * r]); }
    X.chain(F, pts, 0.026, 0.026, hose, 'hide');
    for (let i = 1; i < 4; i++) F.cyl(pts[i][0], pts[i][1] - 0.01, pts[i][2], 0.018, 0.02, 0, F.col('saduRust'), 'hide');
    const e = pts[pts.length - 1];
    F.rod(e[0], 0.022, e[2], e[0] - 0.08, 0.025, e[2] + 0.05, 0.012, brass, 'bronze');
    F.lamp(0, 0.72, 0, 0.15, 2);
  }
});
FURN({
  key: 'nomad_hookah_grand', name: 'Great four-hose shisha', culture: 'nomad', tier: 'court', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber', 'tavern'], anchor: 'floor', clearance: { front: 0.8, back: 0.8, left: 0.8, right: 0.8 },
  materials: ['glass', 'bronze', 'gold', 'stone', 'hide', 'emissive'],
  w: 0.9, d: 0.9, h: 1.15, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, brass = F.col('brassDull'), gold = F.col('goldMuted'), lt = F.shade(brass, 0.12);
    /* the small brass tray it stands on */
    F.cyl(0, 0, 0, 0.3, 0.025, 0, brass, 'bronze');
    X.ring(F, 0, 0.03, 0, 0.3, 24, 0.02, 0.02, lt, 'bronze', 'xz');
    F.frustum(0, 0.025, 0, 0.11, 0.09, 0.04, 0, gold, 'gold', 16);
    F.blob(0, 0.23, 0, 0.17, 0.34, 0, F.col('glassGreen'), 'glass');
    F.frustum(0, 0.38, 0, 0.06, 0.035, 0.07, 0, F.col('glassGreen'), 'glass', 14);
    F.cyl(0, 0.44, 0, 0.05, 0.04, 0, gold, 'gold');
    F.rod(0, 0.47, 0, 0, 0.95, 0, 0.02, brass, 'bronze');
    for (const y of [0.56, 0.66, 0.78, 0.86]) F.blob(0, y, 0, 0.042, 0.07, 0, y > 0.7 ? gold : lt, y > 0.7 ? 'gold' : 'bronze');
    F.cyl(0, 0.52, 0, 0.06, 0.03, 0, gold, 'gold');
    F.cyl(0, 0.9, 0, 0.13, 0.015, 0, brass, 'bronze');
    X.ring(F, 0, 0.92, 0, 0.13, 18, 0.016, 0.016, gold, 'gold', 'xz');
    F.frustum(0, 0.93, 0, 0.03, 0.07, 0.08, 0, F.col('clayRed'), 'stone', 12);
    for (const [cx, cz] of [[0.025, 0.01], [-0.025, 0.02], [0, -0.03]]) F.box(cx, 1.005, cz, 0.035, 0.03, 0.035, cx * 20, F.col('ember'), 'glow');
    /* the pierced wind cover over the bowl */
    F.dome(0, 1.01, 0, 0.085, 0.09, 0, brass, 'bronze');
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.box(Math.cos(a) * 0.075, 1.03, Math.sin(a) * 0.075, 0.02, 0.025, 0.02, -a, F.col('ember'), 'glow'); }
    F.cone(0, 1.09, 0, 0.02, 0.05, 0, gold, 'gold');
    /* four hoses, one to each side, curving off the tray to the floor and looping, each with a mouthpiece */
    const hcols = ['leatherDark', 'saduRust', 'leatherDark', 'saduIndigo'];
    for (let k = 0; k < 4; k++) {
      const a = k * F.TAU / 4 + F.TAU / 8, c = Math.cos(a), s = Math.sin(a), tc = -s, ts = c;
      const P = (r, y, t) => [c * r + tc * t, y, s * r + ts * t];
      F.rod(c * 0.04, 0.6, s * 0.04, c * 0.1, 0.6, s * 0.1, 0.014, brass, 'bronze');
      const pts = [P(0.1, 0.6, 0), P(0.17, 0.55, 0), P(0.24, 0.38, 0.02), P(0.3, 0.18, 0.04), P(0.33, 0.03, 0.06), P(0.37, 0.022, 0.1), P(0.38, 0.022, 0.16), P(0.33, 0.022, 0.19), P(0.29, 0.022, 0.15)];
      X.chain(F, pts, 0.026, 0.026, F.col(hcols[k]), 'hide');
      F.cyl(pts[2][0], 0.37, pts[2][2], 0.02, 0.02, 0, gold, 'gold');
      const e = pts[pts.length - 1];
      F.rod(e[0], 0.022, e[2], e[0] - c * 0.07, 0.03, e[2] - s * 0.07, 0.012, gold, 'gold');
    }
    F.lamp(0, 1.05, 0, 0.2, 2);
  }
});

/* ====================================================================== Storage */
FURN({
  key: 'nomad_studded_chest', name: 'Studded mandoos chest', culture: 'nomad', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'hall', 'store', 'court'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'bronze'],
  w: 1.0, d: 0.55, h: 0.6, variants: 2, variantNames: ['brass bands and studs', 'brass-plated panels'],
  build: function (F) {
    const X = NOMAD_FX, v = F.variant, dk = F.col('timberWalnutDark'), wood = F.col('timberWalnut'), brass = F.col('brassDull'), stud = F.shade('brassDull', 0.18);
    const st = (x, y) => F.rod(x, y, 0.255, x, y, 0.272, 0.009, stud, 'bronze');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.44, 0, sz * 0.21, 0.07, 0.05, 0.07, 0, dk, 'wood');
    F.box(0, 0.05, 0, 0.96, 0.44, 0.5, 0, wood, 'wood');
    F.box(0, 0.05, 0, 0.98, 0.05, 0.52, 0, dk, 'wood');
    F.box(0, 0.49, 0, 0.98, 0.08, 0.52, 0, dk, 'wood');
    F.box(0, 0.57, 0, 0.92, 0.02, 0.46, 0, wood, 'wood');
    if (!v) {
      for (const x of [-0.33, 0, 0.33]) { F.box(x, 0.1, 0.252, 0.05, 0.39, 0.012, 0, brass, 'bronze'); for (let y = 0.13; y < 0.48; y += 0.05) st(x, y); }
      for (const y of [0.14, 0.44]) { F.box(0, y, 0.254, 0.94, 0.035, 0.012, 0, brass, 'bronze'); for (let x = -0.45; x <= 0.46; x += 0.075) st(x, y + 0.0175); }
      for (const cx of [-0.165, 0.165]) for (const [ox, oy] of [[0, 0.07], [0.05, 0], [0, -0.07], [-0.05, 0], [0, 0]]) st(cx + ox, 0.3 + oy);
    } else {
      for (const x of [-0.31, 0, 0.31]) {
        F.box(x, 0.13, 0.252, 0.27, 0.3, 0.012, 0, brass, 'bronze');
        for (let i = 0; i < 6; i++) { st(x - 0.12 + i * 0.048, 0.145); st(x - 0.12 + i * 0.048, 0.415); }
        for (let i = 1; i < 5; i++) { st(x - 0.12, 0.145 + i * 0.054); st(x + 0.12, 0.145 + i * 0.054); }
        X.star(F, x, 0.28, 0.27, 0.1, 0, 1, F.shade(brass, -0.25), 'bronze');
      }
    }
    for (const sx of [-1, 1]) for (const y of [0.05, 0.47]) {
      F.box(sx * 0.45, y, 0.254, 0.08, 0.1, 0.012, 0, brass, 'bronze');
      F.box(sx * 0.484, y, 0.21, 0.012, 0.1, 0.08, 0, brass, 'bronze');
    }
    F.box(0, 0.4, 0.262, 0.07, 0.13, 0.014, 0, F.col('brassDark'), 'bronze');
    F.box(0, 0.37, 0.27, 0.09, 0.06, 0.02, 0, brass, 'bronze');
    for (const s of [-1, 1]) { F.box(s * 0.49, 0.36, 0, 0.02, 0.05, 0.08, 0, brass, 'bronze'); X.ring(F, s * 0.5, 0.33, 0, 0.045, 10, 0.012, 0.012, F.col('blackIron'), 'bronze', 'zy'); }
  }
});
FURN({
  key: 'nomad_bedding_stack', name: 'Bedding stack on a stand', culture: 'nomad', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'hall', 'court', 'store'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'cloth', 'hide'],
  w: 1.5, d: 0.65, h: 1.2, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberTamarisk');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.68, 0, sz * 0.26, 0.06, 0.12, 0.06, 0, F.shade(wood, -0.15), 'wood');
    F.box(0, 0.12, 0, 1.46, 0.04, 0.62, 0, wood, 'wood');
    for (let i = 0; i < 7; i++) F.box(-0.6 + i * 0.2, 0.1, 0.31, 0.1, 0.06, 0.02, 0, F.shade(wood, -0.1), 'wood');
    /* folded quilts, rugs and a fleece, each with a bound edge to the front */
    const keys = ['goatBlack', 'saduRust', 'woolCream', 'camelBrown', 'saduIndigo', 'saduCream', 'madderMuted'];
    const edges = ['saduCream', 'saduBlack', 'saduRust', 'saduBlack', 'saduCream', 'saduOchre', 'saduBlack'];
    let y = 0.16;
    for (let i = 0; i < 7; i++) {
      const th = 0.09 + F.rr(0, 0.015);
      const P = { x: F.rr(-0.015, 0.015), y: y + th / 2, z: 0, w: 1.36, h: th, d: 0.62, o: { side: 0.6, puff: 0.35, pinch: 0.01 } };
      X.cushion(F, P, F.col(keys[i]), i === 3 ? 'hide' : 'cloth');
      X.band(F, P, 'z', 0.27, 0.03, F.col(edges[i]), 'cloth');
      y += th;
    }
    /* a rolled sadu rug and two pillows on top */
    F.bolster(0, y + 0.08, -0.1, 1.2, 0.08, 0, F.col('saduRust'), 'cloth', { gather: 0.92 });
    for (const [a, b, k] of [[0, 0.06, 'saduBlack'], [0.94, 1, 'saduBlack'], [0.3, 0.34, 'saduCream'], [0.66, 0.7, 'saduCream'], [0.45, 0.55, 'saduBlack']])
      F.bolster(0, y + 0.08, -0.1, 1.2, 0.08, 0, F.col(k), 'cloth', { gather: 0.92, from: a, to: b, grow: 1.03 });
    for (const s of [-1, 1]) F.pillow(s * 0.36, y + 0.06, 0.13, 0.42, 0.12, 0.3, s * 0.05, F.col('woolCream'), 'cloth', { puff: 1.0, pinch: 0.08 });
    /* a sadu blanket hung over the front of the stack */
    const bands = X.saduCss(F, [[1, 'saduBlack'], [0.4, 'saduCream'], [2, 'saduRust', 'eyes', 'saduBlack', 'saduOchre'], [0.4, 'saduCream'], [1, 'saduBlack', 'teeth', 'saduCream'], [0.6, 'saduOchre'], [1, 'saduBlack']]);
    F.box(0.3, y - 0.5, 0.318, 0.36, 0.5, 0.012, 0, F.col('saduBlack'), 'cloth');
    F.decal(0.3, y - 0.5, 0.326, 0.34, 0.5, 0, 'nomad-bedding-sadu', function (g, W, H) { X.paintSadu(g, W, H, bands); }, 'cloth');
    for (const x of [0.16, 0.3, 0.44]) X.tassel(F, x, y - 0.5, 0.324, 0.08, F.col('saduRust'), F.col('saduBlack'));
  }
});
FURN({
  key: 'nomad_saddle_bags', name: 'Khurj saddle-bags on a stand', culture: 'nomad', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['hall', 'store', 'antechamber', 'stable', 'yard'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'cloth'],
  w: 1.0, d: 0.6, h: 0.9, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberTamarisk');
    for (const x of [-0.42, 0.42]) for (const s of [-1, 1]) F.beam(x, 0, s * 0.24, x, 0.84, 0, 0.04, 0.04, wood, 'wood');
    F.rod(-0.47, 0.84, 0, 0.47, 0.84, 0, 0.025, F.shade(wood, 0.08), 'wood');
    /* the woven strap over the rail, and a bag hanging each side, banded in sadu with tassels at the foot */
    F.pillow(0, 0.86, 0, 0.7, 0.03, 0.2, 0, F.col('saduBlack'), 'cloth', { side: 0.5, puff: 0.3 });
    for (const s of [-1, 1]) {
      const P = { x: 0, y: 0.56, z: s * 0.075, w: 0.72, h: 0.08, d: 0.46, o: { rx: -Math.PI / 2 - s * 0.1, puff: 0.6, pinch: 0.06, side: 0.3 } };
      X.cushion(F, P, F.col('saduRust'), 'cloth');
      for (const [o, w, k] of [[0.15, 0.03, 'saduCream'], [0.1, 0.02, 'saduBlack'], [0, 0.1, 'saduBlack'], [-0.1, 0.02, 'saduBlack'], [-0.15, 0.03, 'saduCream']]) X.band(F, P, 'z', o, w, F.col(k), 'cloth');
      for (let i = 0; i < 5; i++) X.tassel(F, -0.3 + i * 0.15, 0.345, s * 0.1, 0.12, F.col(i % 2 ? 'saduOchre' : 'saduBlack'), F.col('saduCream'));
    }
  }
});
FURN({
  key: 'nomad_grain_sacks', name: 'Grain sacks', culture: 'nomad', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'market', 'yard'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['cloth', 'rope', 'food', 'timber'],
  w: 1.1, d: 0.8, h: 0.7, variants: 1,
  build: function (F) {
    const rope = F.col('ropeMustard');
    const sack = function (x, z, r, h, col) {
      F.blob(x, h * 0.42, z, r, h * 0.84, F.rr(0, 3), col, 'cloth');
      F.frustum(x, h * 0.78, z, r * 0.38, r * 0.22, h * 0.1, 0, col, 'cloth', 10);
      F.cyl(x, h * 0.85, z, r * 0.24, 0.025, 0, rope, 'rope');
      F.blob(x, h * 0.92, z, r * 0.32, h * 0.12, 0, F.shade(col, 0.05), 'cloth');
    };
    sack(-0.32, -0.12, 0.2, 0.62, F.col('sackJute'));
    sack(0.06, -0.12, 0.21, 0.66, F.col('saduRust'));
    for (const y of [0.2, 0.36]) { const t = (y - 0.277) / 0.277, r = 0.21 * Math.sqrt(1 - t * t) + 0.005; F.cyl(0.06, y, -0.12, r, 0.03, 0, F.col('saduBlack'), 'cloth'); }
    /* an open sack with a heap of grain and a wooden scoop */
    F.frustum(0.33, 0, 0.1, 0.17, 0.19, 0.4, 0, F.col('sackJute'), 'cloth', 14);
    F.cyl(0.33, 0.38, 0.1, 0.2, 0.04, 0, F.shade('sackJute', -0.1), 'cloth');
    F.dome(0.33, 0.41, 0.1, 0.17, 0.07, 0, F.col('grain'), 'food');
    F.frustum(0.36, 0.45, 0.06, 0.03, 0.045, 0.03, 0, F.col('timberWalnut'), 'wood', 10);
    F.rod(0.36, 0.47, 0.06, 0.46, 0.5, 0.02, 0.01, F.col('timberWalnut'), 'wood');
    /* a sack lying down in front */
    F.pillow(-0.12, 0.12, 0.15, 0.55, 0.24, 0.3, 0.3, F.col('camelLight'), 'cloth', { puff: 0.9, round: 3, pinch: 0.1 });
  }
});
FURN({
  key: 'nomad_water_skins', name: 'Goatskin water bags on a tripod', culture: 'nomad', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['yard', 'kitchen', 'store', 'stable', 'hall'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'hide', 'rope'],
  w: 0.9, d: 0.9, h: 1.6, variants: 1,
  build: function (F) {
    const pole = F.col('timberTamarisk'), rope = F.col('ropeGoat');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + Math.PI / 6, c = Math.cos(a), s = Math.sin(a); F.rod(c * 0.4, 0, s * 0.4, -c * 0.03, 1.6, -s * 0.03, 0.022, pole, 'wood'); }
    F.cyl(0, 1.38, 0, 0.05, 0.1, 0, rope, 'rope');
    /* two girba skins, hung by their tied legs, necks tied below */
    for (const k of [-1, 1]) {
      const x = k * 0.17, z = 0.06, skin = F.shade(k > 0 ? 'goatBrown' : 'hideOak', F.rr(-0.08, 0.04));
      F.blob(x, 0.78, z, 0.14, 0.46, k * 0.3, skin, 'hide');
      for (const s of [-1, 1]) {
        F.rod(x + s * 0.07, 0.98, z, x + s * 0.1, 1.06, z, 0.02, skin, 'hide');
        F.rod(x + s * 0.08, 0.62, z, x + s * 0.12, 0.54, z, 0.02, skin, 'hide');
        F.rod(x + s * 0.1, 1.06, z, x * 0.15, 1.38, 0.0, 0.005, rope, 'rope');
      }
      F.frustum(x, 0.5, z, 0.035, 0.05, 0.07, 0, F.shade(skin, -0.15), 'hide', 8);
      F.cyl(x, 0.5, z, 0.04, 0.02, 0, rope, 'rope');
    }
    /* a leather bucket on the third side, and a wooden bowl under the skins */
    F.frustum(0, 0.3, -0.18, 0.09, 0.11, 0.16, 0, F.col('leatherDark'), 'hide', 12);
    NOMAD_FX.ring(F, 0, 0.46, -0.18, 0.11, 12, 0.02, 0.02, F.col('leatherTan'), 'hide', 'xz');
    for (const s of [-1, 1]) F.rod(s * 0.1, 0.46, -0.18, 0, 1.38, -0.02, 0.005, rope, 'rope');
    F.frustum(0, 0, 0.12, 0.08, 0.13, 0.07, 0, F.col('timberWalnut'), 'wood', 12);
  }
});
FURN({
  key: 'nomad_water_jars', name: 'Porous water jars on a stand', culture: 'nomad', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['kitchen', 'hall', 'yard', 'store', 'antechamber'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'stone', 'wicker', 'bronze'],
  w: 0.9, d: 0.5, h: 1.1, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberTamarisk'), dk = F.shade(wood, -0.15), clay = F.col('clayPorous');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.42, 0, sz * 0.17, 0.04, 0.78, 0.04, 0, wood, 'wood');
    for (const y of [0.13, 0.58]) {
      for (const sz of [-1, 1]) F.box(0, y, sz * 0.17, 0.88, 0.04, 0.04, 0, dk, 'wood');
      for (const x of [-0.42, 0, 0.42]) F.box(x, y, 0, 0.04, 0.04, 0.34, 0, dk, 'wood');
    }
    for (const sx of [-1, 1]) {
      const x = sx * 0.21;
      X.ring(F, x, 0.61, 0, 0.17, 12, 0.03, 0.03, wood, 'wood', 'xz');
      F.blob(x, 0.74, 0, 0.19, 0.56, 0, clay, 'stone');
      F.blob(x, 0.6, 0, 0.17, 0.2, 0, F.col('clayDark'), 'stone');
      F.frustum(x, 0.99, 0, 0.08, 0.065, 0.06, 0, clay, 'stone', 12);
      F.cyl(x, 1.04, 0, 0.08, 0.025, 0, F.shade(clay, -0.08), 'stone');
      F.cyl(x, 1.065, 0, 0.09, 0.02, 0, F.col('palmFrond'), 'wicker');
      F.frustum(x, 0.17, 0, 0.06, 0.1, 0.06, 0, F.col('clayRed'), 'stone', 12);
    }
    /* a copper cup on a hook from the front rail */
    F.rod(0, 0.58, 0.19, 0, 0.52, 0.2, 0.006, F.col('blackIron'), 'bronze');
    F.frustum(0, 0.4, 0.2, 0.04, 0.05, 0.1, 0, F.col('copperDull'), 'bronze', 12);
    X.ring(F, 0, 0.47, 0.2, 0.03, 8, 0.01, 0.01, F.col('copperDull'), 'bronze', 'zy');
  }
});
FURN({
  key: 'nomad_date_baskets', name: 'Palm baskets of dates', culture: 'nomad', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'market', 'hall', 'shop'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['wicker', 'food'],
  w: 0.9, d: 0.6, h: 0.45, variants: 2, variantNames: ['three baskets', 'a heaped basket and a palm tray'],
  build: function (F) {
    const X = NOMAD_FX, palm = F.col('palmFrond'), pd = F.col('palmDark'), dates = F.cols(['dateBrown', 'dateAmber', 'dateBrown']);
    if (!F.variant) {
      X.basket(F, -0.25, -0.08, 0.14, 0.18, 0.24, 0.07, palm, pd, dates);
      X.basket(F, 0.12, -0.08, 0.16, 0.2, 0.28, 0.08, palm, pd, dates);
      X.basket(F, 0.3, 0.16, 0.1, 0.13, 0.16, 0.05, palm, pd, dates);
    } else {
      X.basket(F, -0.2, 0, 0.2, 0.24, 0.32, 0.08, palm, pd, dates);
      F.cyl(0.26, 0, 0, 0.17, 0.02, 0, palm, 'wicker');
      for (const [r, k] of [[0.15, 'saduRust'], [0.12, 'palmDark'], [0.06, 'saduRust']]) F.cyl(0.26, 0.002 + (0.17 - r) * 0.02, 0, r, 0.02, 0, F.col(k), 'wicker');
      for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 0.03 + (i % 4) * 0.03; F.blob(0.26 + Math.cos(a) * r, 0.04, Math.sin(a) * r, 0.02, 0.04, a, dates[i % 3], 'food'); }
    }
  }
});
FURN({
  key: 'nomad_supply_bales', name: 'Wool bales and rolled rugs', culture: 'nomad', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['store', 'yard', 'market', 'stable', 'shop'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['cloth', 'rope', 'hide'],
  w: 1.2, d: 0.8, h: 0.8, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, rope = F.col('ropeMustard');
    for (const [x, k] of [[-0.3, 'goatBlack'], [0.3, 'camelBrown']]) {
      const P = { x: x, y: 0.21, z: 0, w: 0.58, h: 0.42, d: 0.78, o: { side: 0.65, puff: 0.3, pinch: 0.04, round: 6 } };
      X.cushion(F, P, F.col(k), 'cloth');
      for (const o of [-0.22, 0.22]) X.band(F, P, 'z', o, 0.035, rope, 'rope');
    }
    for (const [z, r, k, k2] of [[-0.12, 0.085, 'saduRust', 'saduBlack'], [0.06, 0.08, 'saduIndigo', 'saduCream']]) {
      F.bolster(0, 0.42 + r, z, 1.1, r, 0, F.col(k), 'cloth', { gather: 0.9 });
      for (const [a, b] of [[0, 0.07], [0.93, 1], [0.46, 0.54]]) F.bolster(0, 0.42 + r, z, 1.1, r, 0, F.col(k2), 'cloth', { gather: 0.9, from: a, to: b, grow: 1.03 });
    }
    const T = { x: 0.05, y: 0.65, z: -0.03, w: 0.5, h: 0.12, d: 0.3, ry: 0.15, o: { puff: 0.5, side: 0.4 } };
    X.cushion(F, T, F.col('woolCream'), 'hide');
    X.band(F, T, 'x', 0, 0.03, rope, 'rope');
  }
});

/* ====================================================================== Light */
FURN({
  key: 'nomad_floor_lantern', name: 'Pierced brass floor lantern', culture: 'nomad', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine'], anchor: 'floor', clearance: {},
  materials: ['bronze', 'emissive'],
  w: 0.32, d: 0.32, h: 0.62, variants: 2, variantNames: ['brass, three stars a side', 'copper, an onion dome'],
  build: function (F) {
    const X = NOMAD_FX, v = F.variant, M = F.col(v ? 'copperDull' : 'brassDull'), glow = F.col(v ? 'glowWarm' : 'glowAmber');
    const top = X.lantern(F, 0, 0, 0, v ? 0.13 : 0.12, v ? 0.26 : 0.3, M, 'bronze', glow, v ? 2 : 3);
    if (v) F.blob(0, top - 0.06, 0, 0.05, 0.08, 0, F.shade(M, 0.1), 'bronze');
    X.ring(F, 0, top + 0.03, 0, 0.022, 8, 0.008, 0.008, M, 'bronze', 'xy');
    F.lamp(0, 0.2, 0, 0.7, 6);
  }
});
FURN({
  key: 'nomad_hanging_lantern', name: 'Hanging pierced lantern', culture: 'nomad', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine', 'kitchen'], anchor: 'ceiling', clearance: {},
  materials: ['bronze', 'emissive'],
  w: 0.3, d: 0.3, h: 0.95, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, M = F.col('brassDull');
    F.frustum(0, 0, 0, 0.012, 0.04, 0.06, 0, M, 'bronze', 6);
    const top = X.lantern(F, 0, 0.06, 0, 0.12, 0.28, M, 'bronze', F.col('glowAmber'), 3);
    const n = Math.max(3, Math.round((0.92 - top) / 0.05));
    for (let i = 0; i < n; i++) X.ring(F, 0, top + 0.02 + i * (0.9 - top) / n, 0, 0.014, 6, 0.006, 0.006, F.shade(M, -0.1), 'bronze', i % 2 ? 'zy' : 'xy', 0.026);
    F.cyl(0, 0.92, 0, 0.06, 0.03, 0, M, 'bronze');
    F.lamp(0, 0.25, 0, 0.7, 7);
  }
});
FURN({
  key: 'nomad_lantern_cluster', name: 'Cluster of hanging lanterns', culture: 'nomad', tier: 'court', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber'], anchor: 'ceiling', clearance: {},
  materials: ['bronze', 'gold', 'emissive'],
  w: 0.9, d: 0.9, h: 1.6, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, brass = F.col('brassDull');
    F.frustum(0, 1.52, 0, 0.06, 0.16, 0.08, 0, brass, 'bronze', 12);
    X.ring(F, 0, 1.5, 0, 0.15, 16, 0.016, 0.016, F.col('goldMuted'), 'gold', 'xz');
    const L = [[0, 0, 0.08, 0.13, 0.3, 'goldMuted', 'gold', 'glowAmber', 3]];
    const drops = [0.42, 0.66, 0.32, 0.58, 0.48, 0.74];
    for (let k = 0; k < 6; k++) {
      const a = k * F.TAU / 6 + 0.3, r = 0.3;
      L.push([Math.cos(a) * r, Math.sin(a) * r, drops[k], k % 2 ? 0.08 : 0.09, k % 2 ? 0.2 : 0.23, k % 3 === 1 ? 'copperDull' : 'brassDull', 'bronze', k % 2 ? 'glowWarm' : 'glowAmber', 2]);
    }
    for (const [x, z, y0, r, bh, mk, mf, gk, n] of L) {
      F.frustum(x, y0 - 0.05, z, 0.012, r * 0.3, 0.05, 0, F.col(mk), mf, 6);
      const top = X.lantern(F, x, y0, z, r, bh, F.col(mk), mf, F.col(gk), n);
      F.rod(x, top, z, x * 0.45, 1.5, z * 0.45, 0.005, F.shade(brass, -0.15), 'bronze');
    }
    F.lamp(0, 0.7, 0, 1.0, 9);
  }
});
FURN({
  key: 'nomad_oil_lamp', name: 'Clay oil lamp on a stand', culture: 'nomad', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'shrine', 'antechamber', 'kitchen', 'study'], anchor: 'floor', clearance: {},
  materials: ['timber', 'bone', 'stone', 'emissive'],
  w: 0.3, d: 0.3, h: 0.5, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberWalnut'), bone = F.col('boneIvory'), clay = F.col('clayRed');
    F.frustum(0, 0, 0, 0.11, 0.07, 0.04, 0, F.shade(wood, -0.12), 'wood', 12);
    F.frustum(0, 0.04, 0, 0.03, 0.02, 0.34, 0, wood, 'wood', 8);
    for (const y of [0.1, 0.22, 0.34]) F.cyl(0, y, 0, 0.03, 0.02, 0, bone, 'bone');
    F.frustum(0, 0.38, 0, 0.05, 0.085, 0.03, 0, wood, 'wood', 12);
    /* the slipper lamp: body, filling hole, nozzle, ring handle, the flame */
    F.blob(0, 0.43, 0, 0.05, 0.045, 0, clay, 'stone');
    F.cyl(0, 0.445, 0, 0.018, 0.02, 0, F.col('clayDark'), 'stone');
    F.beam(0.03, 0.43, 0, 0.085, 0.44, 0, 0.03, 0.025, clay, 'stone');
    X.ring(F, -0.055, 0.45, 0, 0.018, 8, 0.01, 0.01, clay, 'stone', 'zy');
    F.cone(0.088, 0.448, 0, 0.012, 0.045, 0, F.col('flame'), 'glow');
    F.lamp(0.09, 0.47, 0, 0.4, 4);
  }
});

/* ====================================================================== Textiles */
FURN({
  key: 'nomad_kilim', name: 'Muted kilim', culture: 'nomad', tier: 'common', type: 'rug', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'court', 'antechamber', 'shrine'], anchor: 'floor', clearance: {},
  materials: ['cloth'],
  w: 3.6, d: 2.0, h: 0.03, variants: 3, variantNames: ['rust field, stepped lozenges', 'sadu runner', 'indigo lattice'],
  variantDims: [{ w: 3.0, d: 2.0, h: 0.03 }, { w: 3.6, d: 1.0, h: 0.03 }, { w: 2.5, d: 1.6, h: 0.03 }],
  build: function (F) {
    const v = F.variant, C = k => F.col(k);
    const dia = (x, y, z, s, k) => F.box(x, y, z, s, 0.02, s, Math.PI / 4, C(k), 'cloth');
    const fringe = (W, D) => { for (const s of [-1, 1]) for (let z = -D / 2 + 0.05; z < D / 2 - 0.04; z += 0.06) F.box(s * (W / 2 - 0.03), 0, z, 0.06, 0.012, 0.02, 0, C('woolCream'), 'cloth'); };
    if (v === 0) {
      F.box(0, 0, 0, 2.88, 0.02, 1.98, 0, C('saduBlack'), 'cloth');
      F.box(0, 0.002, 0, 2.68, 0.02, 1.76, 0, C('saduRust'), 'cloth');
      for (let x = -1.33; x <= 1.34; x += 0.14) for (const s of [-1, 1]) dia(x, 0.002, s * 0.935, 0.06, Math.round(x / 0.14) % 2 ? 'saduCream' : 'saduOchre');
      for (let z = -0.84; z <= 0.85; z += 0.14) for (const s of [-1, 1]) dia(s * 1.395, 0.002, z, 0.06, Math.round(z / 0.14) % 2 ? 'saduCream' : 'saduOchre');
      const rings = ['saduBlack', 'saduCream', 'saduOchre', 'saduRust', 'saduBlack'];
      for (const x of [-0.85, 0, 0.85]) {
        for (let i = 0; i < 5; i++) dia(x, 0.004 + i * 0.002, 0, 0.9 - i * 0.17, x ? rings[i] : rings[(i + 1) % 5]);
        for (const [ox, oz] of [[0.36, 0], [-0.36, 0], [0, 0.36], [0, -0.36]]) dia(x + ox * 1.75, 0.004, oz * 1.75, 0.1, 'saduIndigo');
      }
      fringe(3.0, 1.9);
    } else if (v === 1) {
      F.box(0, 0, 0, 3.48, 0.02, 0.98, 0, C('saduBlack'), 'cloth');
      for (const [z, d, k] of [[0.375, 0.04, 'saduCream'], [-0.375, 0.04, 'saduCream'], [0.255, 0.2, 'saduRust'], [-0.255, 0.2, 'saduRust'], [0.145, 0.02, 'saduOchre'], [-0.145, 0.02, 'saduOchre']])
        F.box(0, 0.002, z, 3.44, 0.02, d, 0, C(k), 'cloth');
      for (let x = -1.5; x <= 1.51; x += 0.3) { dia(x, 0.004, 0, 0.17, 'saduCream'); dia(x, 0.006, 0, 0.09, 'saduBlack'); dia(x, 0.008, 0, 0.04, 'saduOchre'); }
      for (let x = -1.65; x <= 1.66; x += 0.1) for (const s of [-1, 1]) F.box(x, 0.004, s * 0.255, 0.04, 0.02, 0.04, 0, C(Math.round(x * 10) % 2 ? 'saduBlack' : 'saduRust'), 'cloth');
      fringe(3.6, 0.9);
    } else {
      F.box(0, 0, 0, 2.38, 0.02, 1.58, 0, C('saduCream'), 'cloth');
      F.box(0, 0.002, 0, 2.08, 0.02, 1.3, 0, C('saduIndigo'), 'cloth');
      for (let x = -1.1; x <= 1.11; x += 0.11) for (const s of [-1, 1]) dia(x, 0.002, s * 0.715, 0.07, 'saduRust');
      for (let z = -0.66; z <= 0.67; z += 0.11) for (const s of [-1, 1]) dia(s * 1.115, 0.002, z, 0.07, 'saduRust');
      for (let x = -0.9; x <= 0.91; x += 0.3) for (let z = -0.45; z <= 0.46; z += 0.3) { dia(x, 0.004, z, 0.14, 'saduCream'); dia(x, 0.006, z, 0.06, (Math.round(x / 0.3 + z / 0.3)) % 2 ? 'saduOchre' : 'saduRust'); }
      fringe(2.5, 1.5);
    }
  }
});
FURN({
  key: 'nomad_sadu_hanging', name: 'Sadu wall hanging', culture: 'nomad', tier: 'common', type: 'banner', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine'], anchor: 'wall', clearance: {},
  materials: ['cloth', 'timber', 'bronze'],
  w: 1.5, d: 0.06, h: 1.7, variants: 2, variantNames: ['rust and black', 'black and cream with indigo'],
  build: function (F) {
    const X = NOMAD_FX, v = F.variant;
    const rows = v
      ? [[2, 'saduBlack'], [0.5, 'saduCream'], [2, 'saduBlack', 'eyes', 'saduCream', 'saduIndigo'], [0.5, 'saduCream'], [1.5, 'saduIndigo', 'teeth', 'saduCream'], [0.5, 'saduCream'], [3, 'saduBlack', 'tree', 'saduCream', 'saduRust'], [0.5, 'saduCream'], [1.5, 'saduIndigo', 'teeth', 'saduCream'], [0.5, 'saduCream'], [2, 'saduBlack', 'eyes', 'saduCream', 'saduIndigo'], [0.5, 'saduCream'], [2, 'saduBlack']]
      : [[2, 'saduBlack'], [0.5, 'saduCream'], [2, 'saduRust', 'eyes', 'saduBlack', 'saduOchre'], [0.5, 'saduCream'], [1.5, 'saduBlack', 'teeth', 'saduCream'], [0.5, 'saduOchre'], [3, 'saduRust', 'tree', 'saduBlack', 'saduCream'], [0.5, 'saduOchre'], [1.5, 'saduBlack', 'teeth', 'saduCream'], [0.5, 'saduCream'], [2, 'saduRust', 'eyes', 'saduBlack', 'saduOchre'], [0.5, 'saduCream'], [2, 'saduBlack']];
    const bands = X.saduCss(F, rows);
    F.decal(0, 0.2, -0.025, 1.36, 1.38, 0, 'nomad-sadu-hanging-' + v, function (g, W, H) { X.paintSadu(g, W, H, bands); }, 'cloth');
    F.rod(-0.72, 1.63, -0.02, 0.72, 1.63, -0.02, 0.02, F.col('timberWalnut'), 'wood');
    for (const s of [-1, 1]) F.ball(s * 0.73, 1.63, -0.02, 0.025, F.col('brassDull'), 'bronze');
    for (let i = 0; i < 6; i++) F.box(-0.6 + i * 0.24, 1.55, -0.025, 0.06, 0.09, 0.02, 0, F.col('saduBlack'), 'cloth');
    for (let i = 0; i < 7; i++) X.tassel(F, -0.63 + i * 0.21, 0.2, -0.025, 0.14, F.col(i % 2 ? 'saduOchre' : 'saduRust'), F.col('saduBlack'));
  }
});
FURN({
  key: 'nomad_tent_divider', name: 'Qata tent divider', culture: 'nomad', tier: 'common', type: 'screen', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'court', 'antechamber'], anchor: 'floor', clearance: {},
  materials: ['timber', 'cloth', 'rope'],
  w: 3.0, d: 0.5, h: 1.9, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, pole = F.col('timberTamarisk'), rope = F.col('ropeGoat');
    for (const s of [-1, 1]) {
      F.rod(s * 1.45, 0, 0, s * 1.45, 1.84, 0, 0.035, pole, 'wood');
      F.cone(s * 1.45, 1.82, 0, 0.03, 0.07, 0, F.shade(pole, -0.2), 'wood');
      F.beam(s * 1.45, 0.02, -0.22, s * 1.45, 0.02, 0.22, 0.06, 0.04, F.shade(pole, -0.1), 'wood');
    }
    F.rod(-1.45, 1.76, 0, 1.45, 1.76, 0, 0.012, rope, 'rope');
    const bands = X.saduCss(F, [[3, 'goatBlack'], [0.4, 'saduCream'], [1.2, 'saduBlack', 'teeth', 'saduCream'], [0.4, 'saduCream'], [1.6, 'saduRust', 'eyes', 'saduBlack', 'saduOchre'], [0.4, 'saduCream'], [1.2, 'saduBlack', 'teeth', 'saduCream'], [0.4, 'saduCream'], [2, 'goatBlack', 'tree', 'saduCream', 'saduRust'], [0.4, 'saduOchre'], [3, 'goatBlack']]);
    F.decal(0, 0.12, 0, 2.8, 1.6, 0, 'nomad-qata', function (g, W, H) { X.paintSadu(g, W, H, bands); }, 'cloth');
    for (let i = 0; i < 12; i++) F.box(-1.32 + i * 0.24, 1.68, 0, 0.05, 0.1, 0.02, 0, F.col('goatBlack'), 'cloth');
    for (let i = 0; i < 12; i++) X.tassel(F, -1.32 + i * 0.24, 0.12, 0, 0.1, F.col(i % 3 ? 'saduRust' : 'saduOchre'), F.col('saduBlack'));
  }
});
FURN({
  key: 'nomad_mashrabiya_screen', name: 'Mashrabiya folding screen', culture: 'nomad', tier: 'common', type: 'screen', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'court', 'antechamber', 'study'], anchor: 'floor', clearance: {},
  materials: ['timber'],
  w: 1.5, d: 0.32, h: 1.7, variants: 1,
  build: function (F) {
    F.shift(0, 0.11);
    const wood = F.col('timberWalnut'), dk = F.col('timberWalnutDark'), lt = F.shade('timberWalnut', 0.15);
    /* three leaves: the middle one square to the front, the two outer ones folded forward */
    const W = 0.48;
    const leaf = function (x0, z0, ang) {
      const ux = Math.cos(ang), uz = -Math.sin(ang), at = t => [x0 + ux * t, z0 + uz * t], ry = ang;
      for (const t of [0.012, W - 0.012]) { const p = at(t); F.box(p[0], 0, p[1], 0.035, 1.66, 0.035, ry, dk, 'wood'); }
      const mid = at(W / 2);
      F.box(mid[0], 0.06, mid[1], W - 0.04, 0.22, 0.02, ry, wood, 'wood');
      F.box(mid[0], 1.38, mid[1], W - 0.04, 0.2, 0.02, ry, wood, 'wood');
      F.box(mid[0], 1.58, mid[1], W - 0.02, 0.04, 0.04, ry, dk, 'wood');
      /* the lattice: spindles, rails and a turned bead at each crossing */
      for (let i = 1; i <= 5; i++) { const p = at(W * i / 6); F.box(p[0], 0.28, p[1], 0.016, 1.1, 0.016, ry, wood, 'wood'); }
      for (let j = 0; j < 12; j++) {
        const y = 0.32 + j * 0.088;
        F.box(mid[0], y, mid[1], W - 0.04, 0.014, 0.014, ry, wood, 'wood');
        for (let i = 1; i <= 5; i++) { const p = at(W * i / 6); F.frustum(p[0], y - 0.012, p[1], 0.016, 0.016, 0.038, ry, (i + j) % 2 ? lt : wood, 'wood', 6); }
      }
      const e = at(W - 0.012);
      F.cone(e[0], 1.62, e[1], 0.025, 0.06, 0, dk, 'wood');
    };
    leaf(-0.25, 0, Math.PI - 0.5);
    leaf(-0.25, 0, 0);
    leaf(0.25, 0, 0.5);
  }
});

/* ====================================================================== Fire */
FURN({
  key: 'nomad_coffee_hearth', name: 'Coffee hearth in the sand', culture: 'nomad', tier: 'common', type: 'stove', setting: 'both',
  rooms: ['hall', 'court', 'antechamber', 'yard', 'kitchen'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['stone', 'bronze', 'timber', 'metal', 'emissive'],
  w: 1.3, d: 1.3, h: 0.42, variants: 1,
  build: function (F) {
    const X = NOMAD_FX;
    F.frustum(0, 0, 0, 0.63, 0.52, 0.06, 0, F.col('sand'), 'stone', 18);
    F.cyl(0, 0.045, 0, 0.42, 0.02, 0, F.col('ash'), 'stone');
    for (let i = 0; i < 11; i++) {
      const a = i * F.TAU / 11 + F.rr(-0.1, 0.1), hb = F.rr(0.1, 0.14);
      F.blob(Math.cos(a) * 0.48, 0.04 + hb / 2, Math.sin(a) * 0.48, F.rr(0.07, 0.09), hb, F.rnd() * 3, F.shade('stoneSand', F.rr(-0.2, 0.05)), 'stone');
    }
    F.blob(-0.05, 0.07, 0, 0.2, 0.05, 0, F.col('ember'), 'glow');
    for (let i = 0; i < 6; i++) F.box(F.rr(-0.18, 0.08), 0.07, F.rr(-0.12, 0.12), 0.05, 0.03, 0.04, F.rnd() * 3, F.col(i % 2 ? 'charcoal' : 'ember'), i % 2 ? 'stone' : 'glow');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.8; F.rod(Math.cos(a) * 0.36, 0.07, Math.sin(a) * 0.36, -0.05 + Math.cos(a) * 0.04, 0.1, Math.sin(a) * 0.04, 0.025, F.col('timberTamarisk'), 'wood'); }
    F.cone(-0.05, 0.08, 0, 0.09, 0.26, 0, F.col('flame'), 'glow');
    F.cone(0.02, 0.08, 0.05, 0.05, 0.17, 0, F.col('ember'), 'glow');
    /* two dallahs warming in the ashes at the rim, tongs beside */
    X.dallah(F, 0.24, 0.05, 0.14, 0.8, 2.4, F.col('brassDull'), 'bronze');
    X.dallah(F, 0.22, 0.05, -0.18, 0.7, 2.9, F.col('copperDull'), 'bronze');
    F.rod(-0.3, 0.07, 0.3, 0.05, 0.06, 0.38, 0.01, F.col('blackIron'), 'metal');
    F.rod(-0.3, 0.07, 0.33, 0.04, 0.06, 0.42, 0.01, F.col('blackIron'), 'metal');
    F.lamp(0, 0.25, 0, 0.9, 7);
  }
});
FURN({
  key: 'nomad_brazier', name: 'Copper mangal brazier', culture: 'nomad', tier: 'common', type: 'brazier', setting: 'both',
  rooms: ['hall', 'court', 'antechamber', 'yard', 'shrine'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['bronze', 'metal', 'stone', 'emissive'],
  w: 0.62, d: 0.62, h: 0.62, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, cop = F.col('copperDull'), dk = F.shade(cop, -0.2), ember = F.col('ember');
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
      X.chain(F, [[c * 0.25, 0.02, s * 0.25], [c * 0.24, 0.14, s * 0.24], [c * 0.18, 0.3, s * 0.18]], 0.026, 0.022, dk, 'bronze');
      F.blob(c * 0.25, 0.02, s * 0.25, 0.035, 0.04, 0, cop, 'bronze');
    }
    F.frustum(0, 0.27, 0, 0.12, 0.26, 0.14, 0, cop, 'bronze', 16);
    X.ring(F, 0, 0.41, 0, 0.265, 22, 0.026, 0.026, F.shade(cop, 0.1), 'bronze', 'xz');
    for (const s of [-1, 1]) X.ring(F, s * 0.285, 0.36, 0, 0.035, 8, 0.012, 0.012, F.col('blackIron'), 'metal', 'zy');
    F.blob(0, 0.41, 0, 0.24, 0.05, 0, ember, 'glow');
    for (let i = 0; i < 7; i++) F.box(F.rr(-0.16, 0.16), 0.42, F.rr(-0.16, 0.16), 0.05, 0.03, 0.04, F.rnd() * 3, F.col(i % 2 ? 'charcoal' : 'ash'), 'stone');
    X.dallah(F, 0.06, 0.42, -0.04, 0.55, 0.3, F.col('brassDull'), 'bronze');
    F.lamp(0, 0.5, 0, 0.8, 6);
  }
});
FURN({
  key: 'nomad_saj_oven', name: 'Saj griddle over a fire', culture: 'nomad', tier: 'common', type: 'stove', setting: 'outdoor',
  rooms: ['yard', 'street', 'market'], anchor: 'floor', clearance: { front: 0.6, back: 0.4, left: 0.4, right: 0.4 },
  materials: ['metal', 'stone', 'timber', 'food', 'wicker', 'emissive'],
  w: 1.0, d: 1.0, h: 0.32, variants: 1,
  build: function (F) {
    const iron = F.col('blackIron');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.5; F.blob(Math.cos(a) * 0.3, 0.1, Math.sin(a) * 0.3, 0.1, 0.2, a, F.shade('stoneSand', -0.1 * i), 'stone'); }
    F.cyl(0, 0, 0, 0.3, 0.02, 0, F.col('ash'), 'stone');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 1.5; F.rod(Math.cos(a) * 0.45, 0.02, Math.sin(a) * 0.45, Math.cos(a) * 0.05, 0.06, Math.sin(a) * 0.05, 0.025, F.col('timberTamarisk'), 'wood'); }
    F.blob(0, 0.04, 0, 0.18, 0.05, 0, F.col('ember'), 'glow');
    F.cone(0, 0.05, 0, 0.08, 0.14, 0, F.col('flame'), 'glow');
    /* the domed griddle and the flatbread spread on it */
    F.dome(0, 0.2, 0, 0.38, 0.09, 0, iron, 'metal');
    F.dome(0, 0.206, 0, 0.3, 0.075, 0, F.col('bread'), 'food');
    for (let i = 0; i < 7; i++) { const a = i * 0.9, r = 0.05 + (i % 3) * 0.07; F.box(Math.cos(a) * r, 0.27 - r * 0.18, Math.sin(a) * r, 0.03, 0.02, 0.03, a, F.col('breadChar'), 'food'); }
    /* a palm tray with a stack of bread */
    F.cyl(0.33, 0, 0.3, 0.14, 0.02, 0, F.col('palmFrond'), 'wicker');
    for (let i = 0; i < 4; i++) F.cyl(0.33 + F.rr(-0.01, 0.01), 0.02 + i * 0.012, 0.3, 0.12, 0.02, 0, F.shade('bread', i * 0.03), 'food');
    F.lamp(0, 0.1, 0, 0.7, 6);
  }
});
FURN({
  key: 'nomad_incense_burner', name: 'Mabkhara incense burner', culture: 'nomad', tier: 'common', type: 'brazier', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'shrine', 'antechamber', 'court'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['timber', 'bronze', 'bone', 'emissive'],
  w: 0.25, d: 0.25, h: 0.3, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnutDark'), brass = F.col('brassDull'), bone = F.col('boneIvory');
    F.frustum(0, 0, 0, 0.1, 0.085, 0.03, 0, wood, 'wood', 4);
    F.frustum(0, 0.03, 0, 0.065, 0.045, 0.05, 0, wood, 'wood', 4);
    F.frustum(0, 0.08, 0, 0.05, 0.1, 0.16, 0, F.col('timberWalnut'), 'wood', 4);
    for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      NOMAD_FX.star(F, nx * 0.083, 0.17, nz * 0.083, 0.06, nx, nz, brass, 'bronze');
      for (const y of [0.11, 0.22]) F.rod(nx * (0.06 + (y - 0.08) * 0.31), y, nz * (0.06 + (y - 0.08) * 0.31), nx * (0.075 + (y - 0.08) * 0.31), y, nz * (0.075 + (y - 0.08) * 0.31), 0.008, bone, 'bone');
    }
    F.frustum(0, 0.24, 0, 0.1, 0.11, 0.03, 0, brass, 'bronze', 4);
    F.box(0, 0.255, 0, 0.16, 0.02, 0.16, 0, F.col('ember'), 'glow');
    for (let i = 0; i < 4; i++) F.box(F.rr(-0.04, 0.04), 0.27, F.rr(-0.04, 0.04), 0.025, 0.02, 0.02, F.rnd() * 3, F.col('dateBrown'), 'wood');
    F.lamp(0, 0.29, 0, 0.2, 2);
  }
});

/* ====================================================================== Riders' gear */
FURN({
  key: 'nomad_camel_saddle_rack', name: 'Camel saddle on a stand', culture: 'nomad', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['hall', 'store', 'stable', 'yard', 'antechamber'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'cloth', 'hide', 'rope', 'bronze'],
  w: 0.9, d: 1.2, h: 1.0, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberTamarisk');
    for (const z of [-0.5, 0.5]) for (const s of [-1, 1]) F.beam(s * 0.32, 0, z, 0, 0.66, z, 0.05, 0.05, F.shade(wood, -0.1), 'wood');
    F.box(0, 0.62, 0, 0.1, 0.08, 1.1, 0, wood, 'wood');
    /* the saddle cloth over the stand, sadu bands to its hem and long tassels */
    for (const s of [-1, 1]) {
      const P = X.drape(F, s * 0.02, 0.73, s * 0.608, -0.794, 0.62, 0.9, 0.025, F.col('saduRust'), 'cloth', { puff: 0.3, round: 7, pinch: 0.02, side: 0.4 });
      for (const [o, w, k] of [[0.26, 0.05, 'saduBlack'], [0.2, 0.02, 'saduCream'], [0.15, 0.03, 'saduOchre']]) X.band(F, P, 'z', o, w, F.col(k), 'cloth');
      for (let i = 0; i < 5; i++) X.tassel(F, s * 0.41, 0.24, -0.36 + i * 0.18, 0.14, F.col(i % 2 ? 'saduOchre' : 'saduBlack'), F.col('saduRust'));
    }
    X.shadad(F, 0.25, 0.22, F.col('timberWalnut'), F.col('brassDull'), 'bronze', F.col('ropeGoat'));
    for (const s of [-1, 1]) X.drape(F, s * 0.02, 0.74, s * 0.608, -0.794, 0.34, 0.5, 0.05, F.col('woolCream'), 'hide', { puff: 0.9, round: 2.8, pinch: 0.12 });
    for (const z of [-0.22, 0.22]) for (const s of [-1, 1]) X.tassel(F, -s * 0.1, 0.83, z + s * 0.03, 0.2, F.col('saduRust'), F.col('saduBlack'));
  }
});
FURN({
  key: 'nomad_horse_saddle_rack', name: 'Arab horse saddle on a rack', culture: 'nomad', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['hall', 'store', 'stable', 'yard', 'antechamber'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'cloth', 'hide', 'metal', 'bronze'],
  w: 0.7, d: 1.2, h: 1.15, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberWalnut'), red = F.col('leatherRed'), dark = F.col('leatherDark'), iron = F.col('blackIron'), brass = F.col('brassDull');
    for (const z of [-0.45, 0.45]) for (const s of [-1, 1]) F.beam(s * 0.28, 0, z, 0, 0.74, z, 0.05, 0.05, wood, 'wood');
    F.box(0, 0.7, 0, 0.1, 0.08, 1.1, 0, wood, 'wood');
    /* the shabraque, hanging nearly straight, an ochre and black border at its hem */
    for (const s of [-1, 1]) {
      const P = X.drape(F, s * 0.02, 0.8, s * 0.3, -0.954, 0.48, 0.82, 0.022, F.col('madderMuted'), 'cloth', { puff: 0.3, round: 7, pinch: 0.02, side: 0.4 });
      X.band(F, P, 'z', 0.2, 0.04, F.col('saduOchre'), 'cloth');
      X.band(F, P, 'z', 0.15, 0.02, F.col('saduBlack'), 'cloth');
      for (let i = 0; i < 9; i++) X.tassel(F, s * 0.17, 0.35, -0.36 + i * 0.09, 0.06, F.col('saduOchre'), F.col('saduBlack'));
    }
    /* the seat, the high pommel and cantle, the skirts */
    for (const s of [-1, 1]) X.drape(F, s * 0.1, 0.85, s * 0.45, -0.893, 0.28, 0.46, 0.02, dark, 'hide', { puff: 0.3, round: 6, side: 0.5 });
    F.pillow(0, 0.87, 0, 0.36, 0.1, 0.5, 0, red, 'hide', { puff: 0.6, round: 4, pinch: 0.08, side: 0.3 });
    F.beam(0, 0.86, 0.22, 0, 1.04, 0.3, 0.1, 0.06, dark, 'hide');
    F.ball(0, 1.06, 0.31, 0.03, brass, 'bronze');
    F.beam(0, 0.86, -0.24, 0, 1.02, -0.32, 0.3, 0.05, dark, 'hide');
    F.rod(-0.15, 1.02, -0.32, 0.15, 1.02, -0.32, 0.016, brass, 'bronze');
    /* stirrup leathers and the broad shovel stirrups */
    for (const s of [-1, 1]) {
      F.box(s * 0.215, 0.42, 0.05, 0.012, 0.44, 0.035, 0, dark, 'hide');
      F.box(s * 0.22, 0.34, 0.05, 0.11, 0.015, 0.18, 0, iron, 'metal');
      for (const z of [-0.03, 0.13]) F.rod(s * 0.22, 0.35, z, s * 0.22, 0.43, 0.05, 0.007, iron, 'metal');
    }
  }
});
FURN({
  key: 'nomad_lizard_saddle_rack', name: 'Lizard saddle on a long rack', culture: 'nomad', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['hall', 'store', 'stable', 'yard', 'antechamber'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'cloth', 'hide', 'rope', 'metal', 'bronze'],
  w: 0.8, d: 1.8, h: 0.95, variants: 1,
  build: function (F) {
    /* the abyssal nomads ride low on riding lizards: a long, low saddle with a baggage seat behind */
    const X = NOMAD_FX, wood = F.col('timberTamarisk'), green = F.col('leatherGreen'), dark = F.col('leatherDark'), iron = F.col('blackIron'), brass = F.col('brassDull');
    for (const z of [-0.75, 0, 0.75]) for (const s of [-1, 1]) F.beam(s * 0.28, 0, z, 0, 0.58, z, 0.05, 0.05, F.shade(wood, -0.1), 'wood');
    F.box(0, 0.54, 0, 0.1, 0.07, 1.7, 0, wood, 'wood');
    for (const s of [-1, 1]) {
      const P = X.drape(F, s * 0.02, 0.62, s * 0.3, -0.954, 0.38, 1.6, 0.022, F.col('saduIndigo'), 'cloth', { puff: 0.3, round: 8, pinch: 0.02, side: 0.4 });
      for (const [o, w, k] of [[0.15, 0.04, 'saduBlack'], [0.11, 0.02, 'saduOchre'], [0.0, 0.05, 'saduRust']]) X.band(F, P, 'z', o, w, F.col(k), 'cloth');
    }
    /* the long seat, a low pommel, a low cantle, the baggage pad behind it */
    F.pillow(0, 0.66, 0.15, 0.36, 0.08, 0.95, 0, green, 'hide', { puff: 0.5, round: 5, pinch: 0.06, side: 0.4 });
    for (let i = 0; i < 6; i++) F.box(0, 0.7 - Math.abs(i - 2.5) * 0.004, -0.2 + i * 0.12, 0.3, 0.012, 0.012, 0, dark, 'hide');
    F.beam(0, 0.66, 0.6, 0, 0.82, 0.66, 0.16, 0.06, dark, 'hide');
    F.ball(0, 0.84, 0.67, 0.03, brass, 'bronze');
    F.beam(0, 0.66, -0.3, 0, 0.78, -0.34, 0.26, 0.05, dark, 'hide');
    F.pillow(0, 0.66, -0.58, 0.34, 0.1, 0.4, 0, F.col('camelBrown'), 'cloth', { puff: 0.6, side: 0.3 });
    for (const z of [-0.68, -0.48]) F.rod(-0.18, 0.7, z, 0.18, 0.7, z, 0.012, F.col('ropeGoat'), 'rope');
    /* girth straps with buckles, stirrups set forward */
    for (const s of [-1, 1]) {
      for (const z of [-0.1, 0.35]) { F.box(s * 0.205, 0.22, z, 0.012, 0.42, 0.05, 0, dark, 'hide'); F.box(s * 0.21, 0.3, z, 0.016, 0.04, 0.06, 0, brass, 'bronze'); }
      F.box(s * 0.22, 0.32, 0.5, 0.012, 0.32, 0.035, 0, dark, 'hide');
      X.ring(F, s * 0.225, 0.26, 0.5, 0.065, 10, 0.014, 0.014, iron, 'metal', 'zy', 0.06);
      F.box(s * 0.225, 0.195, 0.5, 0.05, 0.014, 0.09, 0, iron, 'metal');
    }
  }
});
FURN({
  key: 'nomad_tack_pegs', name: 'Halters and bridles on wall pegs', culture: 'nomad', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['stable', 'store', 'hall', 'antechamber', 'yard'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber', 'cloth', 'hide', 'rope', 'metal', 'bronze', 'bone'],
  w: 1.2, d: 0.2, h: 1.2, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberWalnut'), dark = F.col('leatherDark'), tan = F.col('leatherTan'), brass = F.col('brassDull'), iron = F.col('blackIron'), rope = F.col('ropeGoat');
    F.box(0, 0.15, -0.09, 1.12, 0.98, 0.012, 0, F.col('camelBrown'), 'hide');
    F.box(0, 1.0, -0.075, 1.16, 0.1, 0.03, 0, wood, 'wood');
    const pegs = [-0.42, -0.14, 0.14, 0.42];
    for (const x of pegs) { F.rod(x, 1.05, -0.06, x, 1.07, 0.05, 0.016, wood, 'wood'); F.cyl(x, 1.055, 0.055, 0.022, 0.025, 0, F.col('boneIvory'), 'bone'); }
    /* a camel halter: a sadu-woven headstall, rope cheeks, tassels, a coiled lead */
    let x = pegs[0];
    for (const s of [-1, 1]) F.beam(x + s * 0.03, 1.05, 0.03, x + s * 0.09, 0.62, 0.03, 0.02, 0.02, rope, 'rope');
    F.box(x, 0.86, 0.034, 0.19, 0.04, 0.008, 0, F.col('saduRust'), 'cloth');
    F.box(x, 0.872, 0.04, 0.19, 0.012, 0.006, 0, F.col('saduCream'), 'cloth');
    F.box(x, 0.62, 0.034, 0.2, 0.035, 0.008, 0, F.col('saduBlack'), 'cloth');
    for (const o of [-0.07, 0, 0.07]) X.tassel(F, x + o, 0.62, 0.04, 0.1, F.col(o ? 'saduRust' : 'saduOchre'), F.col('saduBlack'));
    for (let i = 0; i < 3; i++) X.ring(F, x + (i - 1) * 0.01, 0.34 - i * 0.01, 0.0 + i * 0.02, 0.1, 10, 0.02, 0.02, F.shade(rope, i * 0.06), 'rope', 'xy');
    F.rod(x, 0.6, 0.04, x, 0.44, 0.03, 0.01, rope, 'rope');
    /* a horse bridle: cheek straps, a brow band with brass rosettes, the bit and the reins */
    x = pegs[1];
    for (const s of [-1, 1]) F.beam(x + s * 0.03, 1.05, 0.03, x + s * 0.08, 0.62, 0.03, 0.025, 0.006, dark, 'hide');
    F.box(x, 0.88, 0.035, 0.17, 0.025, 0.006, 0, F.col('madderMuted'), 'cloth');
    for (const o of [-0.06, 0, 0.06]) F.rod(x + o, 0.892, 0.036, x + o, 0.892, 0.045, 0.012, brass, 'bronze');
    F.rod(x - 0.1, 0.62, 0.04, x + 0.1, 0.62, 0.04, 0.007, iron, 'metal');
    for (const s of [-1, 1]) F.beam(x + s * 0.09, 0.62, 0.04, x, 0.3, 0.045, 0.02, 0.006, tan, 'hide');
    /* rope hobbles */
    x = pegs[2];
    for (const [dy, dz] of [[0.86, 0.0], [0.7, 0.03]]) X.ring(F, x, dy, dz, 0.08, 10, 0.02, 0.02, F.col('ropeMustard'), 'rope', 'xy');
    F.rod(x, 1.05, 0.03, x, 0.94, 0.02, 0.01, F.col('ropeMustard'), 'rope');
    /* the camel stick hung by its crook, and a leather pouch */
    x = pegs[3];
    const crook = [[x - 0.04, 1.0, 0.04], [x - 0.02, 1.08, 0.04], [x + 0.03, 1.09, 0.04], [x + 0.05, 1.04, 0.04], [x + 0.05, 0.2, 0.05]];
    X.chain(F, crook, 0.02, 0.02, F.col('timberTamarisk'), 'wood');
    F.beam(x, 1.05, 0.0, x - 0.06, 0.78, 0.0, 0.015, 0.006, dark, 'hide');
    F.box(x - 0.06, 0.58, 0.0, 0.16, 0.2, 0.07, 0, tan, 'hide');
    F.box(x - 0.06, 0.72, 0.0, 0.17, 0.07, 0.075, 0, dark, 'hide');
    X.tassel(F, x - 0.06, 0.58, 0.04, 0.08, F.col('saduRust'), F.col('saduBlack'));
  }
});
FURN({
  key: 'nomad_spear_rack', name: 'Spears, sword and hide shield', culture: 'nomad', tier: 'common', type: 'weapon', setting: 'both',
  rooms: ['hall', 'antechamber', 'court', 'yard', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'metal', 'bronze', 'hide', 'cloth'],
  w: 0.9, d: 0.5, h: 2.6, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberWalnut'), iron = F.col('blackIron'), brass = F.col('brassDull'), dark = F.col('leatherDark');
    F.box(0, 0, 0, 0.86, 0.07, 0.42, 0, wood, 'wood');
    for (const s of [-1, 1]) { F.box(s * 0.4, 0.07, -0.08, 0.06, 1.25, 0.06, 0, wood, 'wood'); F.cone(s * 0.4, 1.32, -0.08, 0.04, 0.08, 0, brass, 'bronze'); }
    F.box(0, 1.15, -0.08, 0.86, 0.07, 0.1, 0, F.shade(wood, -0.1), 'wood');
    /* three spears: shafts, iron sockets and leaf blades, rust tassels */
    for (let i = 0; i < 3; i++) {
      const x = -0.2 + i * 0.2, top = 2.3 + (i === 1 ? 0.06 : 0);
      F.rod(x, 0.07, -0.08, x, top, -0.08, 0.016, F.col(i === 1 ? 'timberTamarisk' : 'timberPoplar'), 'wood');
      F.cyl(x, top - 0.05, -0.08, 0.022, 0.06, 0, iron, 'metal');
      F.frustum(x, top, -0.08, 0.035, 0.004, 0.24, 0, F.shade(iron, 0.3), 'metal', 4);
      F.frustum(x, top - 0.17, -0.08, 0.045, 0.02, 0.14, 0, F.col('saduRust'), 'cloth', 8);
    }
    /* a sword in its scabbard hung from the right post */
    const sx = 0.33;
    X.chain(F, [[sx, 0.3, 0.05], [sx + 0.02, 0.55, 0.05], [sx + 0.025, 0.8, 0.05], [sx + 0.02, 0.95, 0.05]], 0.045, 0.04, dark, 'hide');
    F.box(sx, 0.27, 0.05, 0.045, 0.06, 0.03, 0, brass, 'bronze');
    for (const y of [0.78, 0.9]) F.box(sx + 0.023, y, 0.05, 0.055, 0.03, 0.035, 0, brass, 'bronze');
    F.box(sx + 0.02, 0.97, 0.05, 0.12, 0.02, 0.03, 0, brass, 'bronze');
    F.rod(sx + 0.02, 0.99, 0.05, sx + 0.015, 1.1, 0.05, 0.014, dark, 'hide');
    F.ball(sx + 0.012, 1.12, 0.05, 0.022, brass, 'bronze');
    F.beam(sx + 0.02, 0.92, 0.04, 0.4, 1.3, -0.03, 0.015, 0.015, F.col('saduRust'), 'cloth');
    /* a round hide shield on the left post: domed, a brass boss and a ring of studs */
    const cx = -0.2, cy = 0.72, cz = 0.13;
    F.pillow(cx, cy, cz, 0.5, 0.05, 0.5, 0, F.col('hideOak'), 'hide', { rx: -Math.PI / 2, round: 2, puff: 0.6, side: 0.3, pinch: 0 });
    X.ring(F, cx, cy, cz, 0.245, 20, 0.022, 0.03, F.col('hideWalnut'), 'hide', 'xy');
    F.ball(cx, cy, cz + 0.04, 0.045, brass, 'bronze');
    for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.rod(cx + Math.cos(a) * 0.17, cy + Math.sin(a) * 0.17, cz + 0.02, cx + Math.cos(a) * 0.17, cy + Math.sin(a) * 0.17, cz + 0.035, 0.012, brass, 'bronze'); }
  }
});
FURN({
  key: 'nomad_hobble_post', name: 'Camel tethering post', culture: 'nomad', tier: 'common', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'street', 'stable', 'market'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'timber', 'rope', 'metal'],
  w: 0.9, d: 0.7, h: 1.3, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberTamarisk'), rope = F.col('ropeGoat'), rope2 = F.col('ropeMustard');
    for (let i = 0; i < 7; i++) { const a = i * F.TAU / 7 + F.rr(-0.2, 0.2), hb = F.rr(0.1, 0.15); F.blob(Math.cos(a) * 0.17, hb / 2, Math.sin(a) * 0.17, F.rr(0.07, 0.09), hb, F.rnd() * 3, F.shade('stoneSand', F.rr(-0.15, 0.05)), 'stone'); }
    F.frustum(0, 0, 0, 0.08, 0.065, 0.72, 0, wood, 'wood', 7);
    F.frustum(0.015, 0.7, 0, 0.065, 0.05, 0.55, 0.4, F.shade(wood, -0.08), 'wood', 7);
    for (const y of [0.9, 0.96]) F.cyl(0.01, y, 0, 0.068, 0.03, 0, rope, 'rope');
    F.box(0, 0.8, 0.06, 0.03, 0.03, 0.03, 0, F.col('blackIron'), 'metal');
    X.ring(F, 0, 0.73, 0.09, 0.06, 10, 0.014, 0.014, F.col('blackIron'), 'metal', 'xy');
    /* a hobble hanging from the ring, another lying on the ground, a lead rope trailing */
    X.ring(F, 0, 0.6, 0.11, 0.07, 10, 0.02, 0.02, rope2, 'rope', 'xy');
    X.ring(F, 0.02, 0.47, 0.12, 0.06, 10, 0.02, 0.02, rope2, 'rope', 'xy');
    for (const dx of [-0.07, 0.07]) X.ring(F, 0.28 + dx, 0.012, 0.25, 0.065, 10, 0.022, 0.022, rope2, 'rope', 'xz');
    X.chain(F, [[0, 0.68, 0.1], [0.05, 0.3, 0.2], [0.1, 0.02, 0.28], [-0.1, 0.02, 0.36], [-0.32, 0.02, 0.3], [-0.38, 0.02, 0.1]], 0.02, 0.02, rope, 'rope');
  }
});
FURN({
  key: 'nomad_tying_stone', name: 'Camel kneeling stone', culture: 'nomad', tier: 'common', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'street', 'stable', 'market'], anchor: 'floor', clearance: { front: 1.2 },
  materials: ['stone', 'metal', 'rope'],
  w: 1.0, d: 0.9, h: 0.5, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, stone = F.col('stoneSand'), iron = F.col('blackIron');
    F.cyl(0, 0, 0.05, 0.45, 0.02, 0, F.col('sandDark'), 'stone');
    F.blob(-0.05, 0.2, -0.1, 0.32, 0.4, 0.4, stone, 'stone');
    F.blob(0.17, 0.12, -0.18, 0.2, 0.24, 1.1, F.shade(stone, -0.1), 'stone');
    F.box(-0.04, 0.36, 0.12, 0.08, 0.04, 0.05, 0, iron, 'metal');
    X.ring(F, -0.04, 0.3, 0.17, 0.07, 10, 0.016, 0.016, iron, 'metal', 'xy');
    X.chain(F, [[-0.04, 0.24, 0.18], [0.0, 0.1, 0.25], [0.08, 0.02, 0.33], [0.3, 0.02, 0.36], [0.42, 0.02, 0.22], [0.4, 0.02, 0.05]], 0.022, 0.022, F.col('ropeGoat'), 'rope');
  }
});

/* ====================================================================== Work */
FURN({
  key: 'nomad_ground_loom', name: 'Ground loom with a sadu band', culture: 'nomad', tier: 'common', type: 'loom', setting: 'both',
  rooms: ['hall', 'workshop', 'yard', 'court'], anchor: 'floor', clearance: { left: 0.6, right: 0.6 },
  materials: ['timber', 'cloth', 'stone', 'rope', 'bone'],
  w: 1.0, d: 3.6, h: 0.3, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberTamarisk'), rope = F.col('ropeGoat');
    /* warp stripes across the band, the same on the woven part and the threads */
    const stripe = x => { const a = Math.abs(x); return a < 0.09 ? 'saduBlack' : a < 0.12 ? 'saduCream' : a < 0.2 ? 'saduRust' : a < 0.23 ? 'saduOchre' : 'goatBlack'; };
    for (const z of [-1.65, 1.65]) {
      F.rod(-0.4, 0.06, z, 0.4, 0.06, z, 0.03, wood, 'wood');
      for (const s of [-1, 1]) { F.rod(s * 0.43, 0, z + Math.sign(z) * 0.1, s * 0.4, 0.14, z + Math.sign(z) * 0.02, 0.022, F.shade(wood, -0.15), 'wood'); F.rod(s * 0.4, 0.06, z, s * 0.43, 0.02, z + Math.sign(z) * 0.1, 0.008, rope, 'rope'); }
    }
    /* the woven band, from the front beam to the fell */
    for (const [x0, x1] of [[-0.3, -0.23], [-0.23, -0.2], [-0.2, -0.12], [-0.12, -0.09], [-0.09, 0.09], [0.09, 0.12], [0.12, 0.2], [0.2, 0.23], [0.23, 0.3]])
      F.box((x0 + x1) / 2, 0.045, 1.0, x1 - x0, 0.02, 1.24, 0, F.col(stripe((x0 + x1) / 2)), 'cloth');
    for (let z = 0.48; z < 1.6; z += 0.12) { F.box(0, 0.05, z, 0.11, 0.02, 0.11, Math.PI / 4, F.col('saduCream'), 'cloth'); F.box(0, 0.052, z, 0.04, 0.02, 0.04, Math.PI / 4, F.col('saduOchre'), 'cloth'); }
    /* the warp threads: alternate ones lifted over the heddle rod */
    for (let i = 0; i < 20; i++) {
      const x = -0.285 + i * 0.03, yh = i % 2 ? 0.2 : 0.1, c = F.col(stripe(x));
      F.rod(x, 0.06, 0.38, x, yh, -0.3, 0.005, c, 'cloth');
      F.rod(x, yh, -0.3, x, 0.07, -1.62, 0.005, c, 'cloth');
    }
    /* the heddle rod on two stone piles, the shed stick, the beater, the horn pick, a ball of wool */
    F.rod(-0.42, 0.2, -0.3, 0.42, 0.2, -0.3, 0.015, wood, 'wood');
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) F.blob(s * 0.4, 0.05 + k * 0.09, -0.3, 0.07 - k * 0.015, 0.1, k, F.shade('stoneSand', -0.1 * k), 'stone');
    F.box(0, 0.12, -0.7, 0.7, 0.02, 0.07, 0, F.shade(wood, 0.1), 'wood');
    F.box(0, 0.06, 0.32, 0.74, 0.02, 0.07, 0, F.col('timberWalnut'), 'wood');
    X.chain(F, [[0.36, 0.02, 0.7], [0.4, 0.03, 0.82], [0.41, 0.05, 0.92]], 0.025, 0.012, F.col('boneIvory'), 'bone');
    F.ball(0.4, 0.05, 0.2, 0.05, F.col('saduRust'), 'cloth');
  }
});
FURN({
  key: 'nomad_quern', name: 'Hand quern on a hide', culture: 'nomad', tier: 'common', type: 'workstation', setting: 'both',
  rooms: ['kitchen', 'hall', 'yard', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['stone', 'hide', 'timber', 'wicker', 'food'],
  w: 0.9, d: 0.9, h: 0.3, variants: 1,
  build: function (F) {
    F.pillow(0, 0.012, 0, 0.86, 0.02, 0.76, 0.3, F.col('hideRaw'), 'hide', { round: 2.4, puff: 0.2, pinch: 0.15 });
    F.cyl(0, 0.015, 0, 0.26, 0.02, 0, F.col('flour'), 'food');
    F.cyl(0, 0.02, 0, 0.2, 0.07, 0, F.col('stoneGrey'), 'stone');
    F.cyl(0, 0.09, 0, 0.19, 0.06, 0, F.shade('stoneGrey', 0.1), 'stone');
    F.cyl(0, 0.14, 0, 0.045, 0.02, 0, F.col('stoneGrey'), 'stone');
    F.dome(0, 0.15, 0, 0.035, 0.02, 0, F.col('grain'), 'food');
    F.rod(0.14, 0.14, 0, 0.15, 0.29, 0.01, 0.018, F.col('timberWalnut'), 'wood');
    NOMAD_FX.basket(F, -0.3, 0.25, 0.09, 0.11, 0.12, 0, F.col('palmFrond'), F.col('palmDark'), []);
    F.dome(-0.3, 0.1, 0.25, 0.1, 0.04, 0, F.col('grain'), 'food');
    F.frustum(0.3, 0.015, -0.24, 0.06, 0.1, 0.06, 0, F.col('timberWalnut'), 'wood', 12);
    F.dome(0.3, 0.07, -0.24, 0.085, 0.025, 0, F.col('flour'), 'food');
  }
});
FURN({
  key: 'nomad_butter_churn', name: 'Goatskin churn on a tripod', culture: 'nomad', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['kitchen', 'yard', 'hall', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'hide', 'rope'],
  w: 1.2, d: 1.2, h: 1.6, variants: 1,
  build: function (F) {
    const pole = F.col('timberTamarisk'), rope = F.col('ropeGoat'), skin = F.col('hideTanned');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a); F.rod(c * 0.55, 0, s * 0.55, -c * 0.03, 1.6, -s * 0.03, 0.025, pole, 'wood'); }
    F.cyl(0, 1.42, 0, 0.05, 0.1, 0, rope, 'rope');
    /* the skin slung on two ropes, its leg stubs tied off, its neck stoppered */
    F.bolster(0, 0.78, 0, 0.62, 0.15, 0, skin, 'hide', { gather: 0.55 });
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) F.rod(sx * 0.2, 0.7, sz * 0.08, sx * 0.24, 0.6, sz * 0.12, 0.022, F.shade(skin, -0.1), 'hide');
      F.rod(sx * 0.25, 0.86, 0, 0, 1.42, 0, 0.007, rope, 'rope');
    }
    F.rod(0.3, 0.8, 0, 0.4, 0.86, 0, 0.04, F.shade(skin, -0.15), 'hide');
    F.cyl(0.36, 0.82, 0, 0.05, 0.03, 0, rope, 'rope');
    F.frustum(0, 0, 0.1, 0.1, 0.15, 0.08, 0, F.col('timberWalnut'), 'wood', 12);
  }
});
FURN({
  key: 'nomad_spindle_basket', name: 'Spindles and wool in a basket', culture: 'nomad', tier: 'common', type: 'tool', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'workshop', 'court'], anchor: 'floor', clearance: {},
  materials: ['wicker', 'cloth', 'timber'],
  w: 0.5, d: 0.5, h: 0.6, variants: 1,
  build: function (F) {
    NOMAD_FX.basket(F, 0, 0, 0.17, 0.21, 0.2, 0, F.col('palmFrond'), F.col('palmDark'), []);
    F.dome(0, 0.18, 0, 0.2, 0.06, 0, F.col('woolCream'), 'cloth');
    const balls = ['camelBrown', 'saduRust', 'goatBlack', 'saduIndigo', 'woolCream'];
    for (let i = 0; i < 5; i++) { const a = i * F.TAU / 5 + 0.3; F.ball(Math.cos(a) * 0.11, 0.25, Math.sin(a) * 0.11, 0.05, F.col(balls[i]), 'cloth'); }
    /* two drop spindles stood in the wool, cops of spun yarn on them; a third across the rim */
    for (const [x0, z0, x1, z1, k] of [[-0.04, 0.02, -0.12, 0.08, 'camelBrown'], [0.05, -0.03, 0.14, -0.1, 'woolCream']]) {
      F.rod(x0, 0.16, z0, x1, 0.58, z1, 0.007, F.col('timberWalnut'), 'wood');
      const mx = x0 + (x1 - x0) * 0.75, mz = z0 + (z1 - z0) * 0.75;
      F.blob(mx, 0.48, mz, 0.03, 0.09, 0, F.col(k), 'cloth');
      F.cyl(x0 + (x1 - x0) * 0.9, 0.53, z0 + (z1 - z0) * 0.9, 0.035, 0.02, 0, F.col('timberWalnutDark'), 'wood');
    }
    F.rod(-0.22, 0.22, 0.12, 0.2, 0.24, 0.16, 0.007, F.col('timberWalnut'), 'wood');
  }
});

/* ====================================================================== Tanning: the hidemaker's tent (job tanning) */
FURN({
  key: 'nomad_hide_frame', name: 'Hide stretching frame', culture: 'nomad', tier: 'common', type: 'workstation', setting: 'both', job: 'tanning',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 0.8 }, materials: ['timber', 'hide', 'rope'],
  w: 1.6, d: 0.9, h: 1.9, variants: 2, variantNames: ['a goat hide', 'a camel hide, half scraped'],
  build: function (F) {
    F.shift(0, 0.2);
    const wood = F.col('timberTamarisk'), cord = F.col('ropeGoat'), v = F.variant, lean = 0.22;
    const at = (x, y) => [x, y * Math.cos(lean), -y * Math.sin(lean)];
    const corners = [[-0.72, 0.15], [0.72, 0.15], [0.72, 1.8], [-0.72, 1.8]];
    for (let i = 0; i < 4; i++) { const a = at(...corners[i]), b = at(...corners[(i + 1) % 4]); F.rod(a[0], a[1], a[2], b[0], b[1], b[2], 0.035, wood, 'wood'); }
    for (const x of [-0.72, 0.72]) { const t = at(x, 1.86); F.rod(x, 0, 0.02, t[0], t[1], t[2], 0.04, wood, 'wood'); F.rod(x, 0, -0.55, t[0], t[1] * 0.75, t[2] * 0.75, 0.03, wood, 'wood'); }
    const c = at(0, 0.98), hide = F.col(v ? 'camelBrown' : 'hideRaw');
    F.pillow(c[0], c[1], c[2] + 0.01, v ? 1.2 : 0.95, 0.025, 1.35, 0, hide, 'hide', { rx: -Math.PI / 2 + lean, round: 2.6, puff: 0.3, pinch: 0.12 });
    if (v) F.pillow(c[0] - 0.2, c[1] + 0.1, c[2] + 0.025, 0.45, 0.012, 0.55, 0, F.col('hideFat'), 'hide', { rx: -Math.PI / 2 + lean, round: 2.4, puff: 0.2 });
    for (let k = 0; k < 14; k++) {
      const a = k / 14 * F.TAU, ex = Math.cos(a) * (v ? 0.55 : 0.44), ey = 0.98 + Math.sin(a) * 0.63;
      const fx = Math.max(-0.71, Math.min(0.71, Math.cos(a) * 1.1)), fy = Math.max(0.16, Math.min(1.79, 0.98 + Math.sin(a) * 1.05));
      const p = at(ex, ey), q = at(fx, fy); F.rod(p[0], p[1], p[2] + 0.015, q[0], q[1], q[2], 0.006, cord, 'rope');
    }
  }
});
FURN({
  key: 'nomad_fleshing_beam', name: 'Fleshing beam', culture: 'nomad', tier: 'common', type: 'workstation', setting: 'both', job: 'tanning',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 0.9 }, materials: ['timber', 'hide', 'metal', 'stone'],
  w: 0.8, d: 1.8, h: 1.05, variants: 1,
  build: function (F) {
    const wood = F.col('timberTamarisk');
    F.rod(0, 0.06, -0.85, 0, 0.92, 0.65, 0.1, wood, 'wood');
    for (const s of [-1, 1]) F.rod(s * 0.3, 0, 0.45, -s * 0.05, 0.85, 0.5, 0.04, F.shade(wood, -0.15), 'wood');
    const hide = F.col('goatBrown');
    const slope = Math.atan2(0.86, 1.5), by = z => 0.06 + (z + 0.85) * 0.86 / 1.5;
    F.pillow(0, by(0.3) + 0.11, 0.3, 0.32, 0.025, 0.8, 0, hide, 'hide', { rx: -slope, round: 2.6, puff: 0.4, pinch: 0.08 });
    for (const s of [-1, 1]) F.pillow(s * 0.12, by(0.3) - 0.14, 0.3, 0.7, 0.02, 0.48, s * Math.PI / 2, hide, 'hide', { rx: Math.PI / 2, round: 2.6, puff: 0.3, pinch: 0.12 });
    /* a curved two-handled scraper across the beam, a scraping stone at its foot */
    F.box(0, 0.98, 0.25, 0.42, 0.012, 0.05, 0, F.col('blackIron'), 'metal');
    for (const s of [-1, 1]) F.rod(s * 0.21, 0.99, 0.25, s * 0.33, 0.99, 0.25, 0.018, F.col('timberWalnut'), 'wood');
    F.blob(0.25, 0.04, -0.5, 0.07, 0.08, 0.4, F.col('stoneGrey'), 'stone');
  }
});
FURN({
  key: 'nomad_tanning_vat', name: 'Hide tanning trough', culture: 'nomad', tier: 'common', type: 'storage', setting: 'both', job: 'tanning',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 0.6 }, materials: ['timber', 'hide', 'rope', 'stone', 'food'],
  w: 1.3, d: 1.3, h: 0.9, variants: 2, variantNames: ['acacia-pod liquor', 'lime'],
  build: function (F) {
    /* a hide slung between four stakes as a trough, full of liquor; a clay pot of acacia pods beside */
    const wood = F.col('timberTamarisk'), rope = F.col('ropeGoat');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      F.rod(sx * 0.48, 0, sz * 0.48, sx * 0.5, 0.75, sz * 0.5, 0.03, wood, 'wood');
      F.rod(sx * 0.49, 0.62, sz * 0.49, sx * 0.4, 0.58, sz * 0.4, 0.008, rope, 'rope');
    }
    F.frustum(0, 0.16, 0, 0.26, 0.44, 0.44, 0, F.col('hideTanned'), 'hide', 14);
    F.cyl(0, 0.55, 0, 0.43, 0.02, 0, F.col(F.variant ? 'lime' : 'liquor'), 'stone');
    F.pillow(0.25, 0.62, 0.25, 0.55, 0.03, 0.38, 0.7, F.col('hideRaw'), 'hide', { rx: 0.4, round: 2.6, puff: 0.3 });
    F.rod(-0.2, 0.5, -0.1, -0.45, 0.88, 0.3, 0.022, F.col('timberPoplar'), 'wood');
    F.blob(-0.42, 0.14, 0.42, 0.13, 0.28, 0, F.col('clayRed'), 'stone');
    if (!F.variant) for (let i = 0; i < 6; i++) F.box(F.rr(-0.6, -0.2), 0, F.rr(0.5, 0.6), 0.1, 0.02, 0.03, F.rr(0, 3), F.col('acaciaPod'), 'food');
  }
});
FURN({
  key: 'nomad_hide_stack', name: 'Stack of tanned hides', culture: 'nomad', tier: 'common', type: 'stack', setting: 'both', job: 'tanning',
  rooms: ['workshop', 'store', 'shop', 'yard'], anchor: 'floor', clearance: { front: 0.5 }, materials: ['wicker', 'hide', 'cloth'],
  w: 1.2, d: 0.9, h: 0.6, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.14, 0.02, 0.84, 0, F.col('palmFrond'), 'wicker');
    for (let i = 0; i < 6; i++) F.box(-0.5 + i * 0.2, 0.002, 0, 0.03, 0.02, 0.84, 0, F.col('palmDark'), 'wicker');
    const keys = ['hideTanned', 'camelBrown', 'goatBlack', 'hideOak', 'hideSmoked', 'goatBrown', 'hideTanned', 'goatBlack'];
    let y = 0.025;
    for (let i = 0; i < 8; i++) {
      const th = 0.055 + F.rr(0, 0.012);
      F.pillow(F.rr(-0.04, 0.04), y + th / 2, F.rr(-0.03, 0.03), 1.0 - i * 0.02, th, 0.72, F.rr(-0.06, 0.06), F.col(keys[i]), keys[i] === 'goatBlack' ? 'cloth' : 'hide', { side: 0.5, puff: 0.3, round: 4, pinch: 0.06 });
      y += th;
    }
  }
});
FURN({
  key: 'nomad_drying_line', name: 'Hide drying line', culture: 'nomad', tier: 'common', type: 'rack', setting: 'outdoor', job: 'tanning',
  rooms: ['yard'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 }, materials: ['timber', 'hide', 'cloth', 'rope'],
  w: 3.0, d: 0.32, h: 1.9, variants: 1,
  build: function (F) {
    const wood = F.col('timberTamarisk');
    for (const s of [-1, 1]) { F.rod(s * 1.4, 0, 0, s * 1.4, 1.72, 0, 0.045, wood, 'wood'); F.rod(s * 1.4, 1.6, 0, s * 1.47, 1.84, 0, 0.025, wood, 'wood'); F.rod(s * 1.4, 1.6, 0, s * 1.33, 1.84, 0, 0.025, wood, 'wood'); F.rod(s * 1.4, 1.7, 0, s * 1.48, 0, 0.2, 0.006, F.col('ropeGoat'), 'rope'); }
    F.rod(-1.48, 1.77, 0, 1.48, 1.77, 0, 0.012, F.col('ropeGoat'), 'rope');
    const keys = ['hideRaw', 'camelBrown', 'goatBlack', 'hideTanned'];
    for (let i = 0; i < 4; i++) {
      const x = -1.0 + i * 0.68, c = F.col(keys[i]), fam = keys[i] === 'goatBlack' ? 'cloth' : 'hide';
      for (const s of [-1, 1]) F.pillow(x, 1.4, s * 0.05, 0.52, 0.018, 0.72, 0, c, fam, { rx: -Math.PI / 2 + s * 0.1, round: 2.8, puff: 0.3, pinch: 0.12 });
    }
  }
});

/* ====================================================================== The smithy */
FURN({
  key: 'nomad_bellows', name: 'Goatskin bellows', culture: 'nomad', tier: 'common', type: 'workstation', setting: 'both', job: 'smithing',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { back: 0.6 },
  materials: ['hide', 'timber', 'metal', 'stone'],
  w: 0.8, d: 1.0, h: 0.4, variants: 1,
  build: function (F) {
    /* two whole goatskins worked by hand: wooden slats at the open ends behind, the necks tied to an iron pipe and a clay nozzle */
    const wood = F.col('timberWalnut'), iron = F.col('blackIron');
    for (const s of [-1, 1]) {
      const x = s * 0.17, skin = F.col(s > 0 ? 'goatBrown' : 'hideTanned');
      F.bolster(x, 0.14, -0.05, 0.6, 0.14, Math.PI / 2, skin, 'hide', { gather: 0.4 });
      for (const sz of [-1, 1]) F.rod(x + 0.1, 0.07, -0.05 + sz * 0.18, x + 0.15, 0.02, -0.05 + sz * 0.2, 0.02, F.shade(skin, -0.12), 'hide');
      for (const dy of [-0.05, 0.05]) F.box(x, 0.14 + dy, -0.36, 0.2, 0.02, 0.03, 0, wood, 'wood');
      F.rod(x, 0.13, 0.25, 0, 0.1, 0.36, 0.025, iron, 'metal');
    }
    F.rod(0, 0.1, 0.36, 0, 0.09, 0.42, 0.04, iron, 'metal');
    F.rod(0, 0.09, 0.42, 0, 0.08, 0.5, 0.045, F.col('clayRed'), 'stone');
    F.blob(0.1, 0.06, 0.42, 0.07, 0.11, 0.5, F.col('stoneGrey'), 'stone');
  }
});

/* ====================================================================== The seer's tent */
FURN({
  key: 'nomad_sand_table', name: 'Seer\'s sand table', culture: 'nomad', tier: 'common', type: 'shrine', setting: 'indoor',
  rooms: ['shrine', 'hall', 'study', 'antechamber'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'stone', 'bone'],
  w: 0.9, d: 0.7, h: 0.42, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberWalnut'), dk = F.col('timberWalnutDark'), sand = F.col('sand'), sk = F.shade('sand', -0.18);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.frustum(sx * 0.4, 0, sz * 0.3, 0.03, 0.025, 0.3, 0, dk, 'wood', 6);
    for (const sz of [-1, 1]) F.box(0, 0.24, sz * 0.31, 0.84, 0.06, 0.03, 0, wood, 'wood');
    for (const sx of [-1, 1]) F.box(sx * 0.41, 0.24, 0, 0.03, 0.06, 0.6, 0, wood, 'wood');
    F.box(0, 0.3, 0, 0.84, 0.03, 0.64, 0, dk, 'wood');
    for (const sz of [-1, 1]) F.box(0, 0.3, sz * 0.31, 0.86, 0.09, 0.03, 0, wood, 'wood');
    for (const sx of [-1, 1]) F.box(sx * 0.42, 0.3, 0, 0.03, 0.09, 0.62, 0, wood, 'wood');
    F.box(0, 0.33, 0, 0.8, 0.03, 0.58, 0, sand, 'stone');
    /* raked lines at one end, a drawn circle with spokes, the geomancer's dot figures, pebbles */
    for (let i = 0; i < 6; i++) F.box(-0.25, 0.342, -0.25 + i * 0.1, 0.24, 0.02, 0.012, 0, sk, 'stone');
    X.ring(F, 0.12, 0.352, 0, 0.16, 18, 0.012, 0.012, sk, 'stone', 'xz');
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; F.box(0.12, 0.343, 0, 0.3, 0.02, 0.012, a, sk, 'stone'); }
    const figs = [[1, 2, 1, 1], [2, 1, 2, 2], [1, 1, 2, 1]];
    figs.forEach(function (fig, k) { fig.forEach(function (n, r) { for (let j = 0; j < n; j++) F.box(-0.32 + k * 0.08 + (n === 2 ? (j - 0.5) * 0.025 : 0), 0.343, 0.13 + r * 0.035, 0.014, 0.02, 0.014, 0, sk, 'stone'); }); });
    for (const [x, z, k] of [[0.3, 0.2, 'boneIvory'], [0.02, 0.22, 'stoneGrey'], [0.2, -0.2, 'boneIvory'], [-0.05, -0.15, 'charcoal'], [0.33, -0.06, 'stoneGrey']]) F.blob(x, 0.36, z, 0.022, 0.025, x, F.col(k), k === 'boneIvory' ? 'bone' : 'stone');
    F.rod(-0.38, 0.4, 0.3, 0.05, 0.4, 0.32, 0.007, F.col('boneIvory'), 'bone');
  }
});
FURN({
  key: 'nomad_amulet_strings', name: 'Strings of amulets', culture: 'nomad', tier: 'common', type: 'art', setting: 'indoor',
  rooms: ['shrine', 'bedroom', 'hall', 'antechamber'], anchor: 'ceiling', clearance: {},
  materials: ['bronze', 'glass', 'hide', 'bone', 'cloth'],
  w: 0.4, d: 0.4, h: 1.0, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, brass = F.col('brassDull'), blue = F.col('beadBlue'), cord = F.col('saduRust');
    F.cyl(0, 0.97, 0, 0.04, 0.03, 0, brass, 'bronze');
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; F.rod(0, 0.97, 0, Math.cos(a) * 0.15, 0.9, Math.sin(a) * 0.15, 0.004, cord, 'cloth'); }
    X.ring(F, 0, 0.9, 0, 0.15, 16, 0.016, 0.016, brass, 'bronze', 'xz');
    /* eight strings: blue beads, then a charm: a brass hand, a leather amulet case, a blue eye, a cowrie */
    const lens = [0.62, 0.45, 0.7, 0.5, 0.58, 0.4, 0.66, 0.52];
    for (let i = 0; i < 8; i++) {
      const a = i * F.TAU / 8 + 0.2, x = Math.cos(a) * 0.15, z = Math.sin(a) * 0.15, y1 = 0.9 - lens[i], fx = Math.cos(a), fz = Math.sin(a), ry = Math.PI / 2 - a;
      F.rod(x, 0.9, z, x, y1, z, 0.003, F.col(i % 2 ? 'saduRust' : 'saduBlack'), 'cloth');
      for (let j = 1; j <= 3; j++) F.ball(x, 0.9 - j * lens[i] / 4.5, z, 0.02, j === 2 ? F.col('boneIvory') : blue, j === 2 ? 'bone' : 'glass');
      const t = i % 4;
      if (t === 0) {
        F.box(x, y1 - 0.08, z, 0.06, 0.07, 0.012, ry, brass, 'bronze');
        for (let f = 0; f < 5; f++) F.box(x + (f - 2) * 0.012 * Math.cos(ry), y1 - 0.11, z - (f - 2) * 0.012 * Math.sin(ry), 0.01, 0.035, 0.01, ry, brass, 'bronze');
        F.rod(x, y1 - 0.045, z, x + fx * 0.012, y1 - 0.045, z + fz * 0.012, 0.012, blue, 'glass');
      } else if (t === 1) {
        F.box(x, y1 - 0.08, z, 0.07, 0.08, 0.02, ry, F.col('leatherRed'), 'hide');
        F.box(x, y1 - 0.04, z, 0.075, 0.012, 0.024, ry, F.col('saduOchre'), 'hide');
      } else if (t === 2) {
        F.ball(x, y1 - 0.03, z, 0.03, blue, 'glass');
        F.rod(x + fx * 0.024, y1 - 0.03, z + fz * 0.024, x + fx * 0.032, y1 - 0.03, z + fz * 0.032, 0.014, F.col('saduCream'), 'glass');
        F.rod(x + fx * 0.03, y1 - 0.03, z + fz * 0.03, x + fx * 0.036, y1 - 0.03, z + fz * 0.036, 0.007, F.col('saduBlack'), 'glass');
      } else {
        F.blob(x, y1 - 0.025, z, 0.02, 0.045, a, F.col('boneIvory'), 'bone');
        X.tassel(F, x, y1 - 0.045, z, 0.06, cord, F.col('saduBlack'));
      }
    }
  }
});
FURN({
  key: 'nomad_star_chart', name: 'Painted hide star chart', culture: 'nomad', tier: 'common', type: 'board', setting: 'indoor',
  rooms: ['shrine', 'study', 'hall', 'antechamber'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'hide', 'rope'],
  w: 1.1, d: 0.6, h: 1.65, variants: 1,
  build: function (F) {
    F.shift(0, 0.12);
    const wood = F.col('timberTamarisk'), cord = F.col('ropeGoat');
    for (const s of [-1, 1]) {
      F.rod(s * 0.5, 0, 0, s * 0.5, 1.6, 0, 0.025, wood, 'wood');
      F.rod(s * 0.5, 1.4, -0.01, s * 0.46, 0, -0.38, 0.02, wood, 'wood');
      F.cone(s * 0.5, 1.6, 0, 0.025, 0.05, 0, F.shade(wood, -0.2), 'wood');
    }
    for (const y of [0.28, 1.5]) F.rod(-0.52, y, 0, 0.52, y, 0, 0.022, wood, 'wood');
    const C = k => F.css(F.col(k));
    const c = { edge: C('hideWalnut'), hide: C('hideOak'), sky: C('chartSky'), gold: C('goldMuted'), cream: C('saduCream'), rust: C('saduRust') };
    F.decal(0, 0.36, 0.012, 0.86, 1.06, 0, 'nomad-star-chart', function (g, W, H) {
      g.fillStyle = c.edge; g.fillRect(0, 0, W, H);
      g.fillStyle = c.hide; g.beginPath();
      const pts = [[0.08, 0.02], [0.3, 0.06], [0.5, 0.03], [0.7, 0.06], [0.92, 0.02], [0.9, 0.3], [0.97, 0.5], [0.9, 0.7], [0.93, 0.97], [0.7, 0.93], [0.5, 0.97], [0.3, 0.93], [0.06, 0.98], [0.1, 0.7], [0.03, 0.5], [0.1, 0.3]];
      pts.forEach(function (p, i) { if (i) g.lineTo(p[0] * W, p[1] * H); else g.moveTo(p[0] * W, p[1] * H); }); g.closePath(); g.fill();
      const cx = W / 2, cy = H * 0.48, R = W * 0.38;
      g.fillStyle = c.sky; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
      g.strokeStyle = c.gold; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.arc(cx, cy, R * 0.86, 0, Math.PI * 2); g.stroke();
      for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke(); }
      let st = 7;
      const rnd = function () { st = (st * 16807) % 2147483647; return st / 2147483647; };
      const stars = [];
      for (let k = 0; k < 40; k++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * R * 0.8; stars.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1 + rnd() * 2.5]); }
      g.strokeStyle = c.cream; g.lineWidth = 1;
      for (const run of [[0, 3, 7, 12, 5], [9, 14, 20, 17], [22, 25, 30, 28, 33]]) { g.beginPath(); run.forEach(function (i, j) { const s = stars[i]; if (j) g.lineTo(s[0], s[1]); else g.moveTo(s[0], s[1]); }); g.stroke(); }
      g.fillStyle = c.gold; for (const s of stars) { g.beginPath(); g.arc(s[0], s[1], s[2], 0, Math.PI * 2); g.fill(); }
      g.fillStyle = c.cream; g.beginPath(); g.arc(cx + R * 0.45, cy - R * 0.5, R * 0.14, 0, Math.PI * 2); g.fill();
      g.fillStyle = c.sky; g.beginPath(); g.arc(cx + R * 0.5, cy - R * 0.54, R * 0.12, 0, Math.PI * 2); g.fill();
      g.fillStyle = c.rust;
      for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + k * Math.PI / 3; g.fillRect(cx + Math.cos(a) * R * 1.12 - 3, cy + Math.sin(a) * R * 1.12 - 3, 6, 6); }
    }, 'hide');
    for (let k = 0; k < 10; k++) {
      const t = k / 9, left = k % 2, yy = 0.42 + t * 0.94;
      F.rod(left ? -0.43 : 0.43, yy, 0.012, left ? -0.5 : 0.5, yy + 0.04, 0, 0.005, cord, 'rope');
    }
    for (const x of [-0.3, 0, 0.3]) { F.rod(x, 0.36, 0.012, x, 0.28, 0, 0.005, cord, 'rope'); F.rod(x, 1.42, 0.012, x, 1.5, 0, 0.005, cord, 'rope'); }
  }
});
FURN({
  key: 'nomad_astrolabe', name: 'Brass astrolabe on a stand', culture: 'nomad', tier: 'common', type: 'tool', setting: 'indoor',
  rooms: ['shrine', 'study', 'hall', 'library'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'bronze', 'gold'],
  w: 0.5, d: 0.36, h: 1.1, variants: 1,
  build: function (F) {
    const X = NOMAD_FX, wood = F.col('timberWalnutDark'), brass = F.col('brassDull'), dk = F.shade(brass, -0.25), gold = F.col('goldMuted');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 - Math.PI / 2, c = Math.cos(a), s = Math.sin(a); F.rod(c * 0.2, 0, s * 0.18, 0, 0.82, -0.02, 0.018, wood, 'wood'); }
    F.cyl(0, 0.8, -0.02, 0.035, 0.04, 0, brass, 'bronze');
    F.rod(0, 0.84, -0.02, 0, 1.04, -0.02, 0.014, wood, 'wood');
    X.chain(F, [[0, 1.04, -0.02], [0, 1.07, 0.02], [0, 1.04, 0.06], [0, 1.0, 0.06]], 0.016, 0.016, brass, 'bronze');
    /* the astrolabe hanging by its ring: mater, plate, limb scale, rete with star pointers, alidade */
    const cy = 0.8, cz = 0.06;
    X.ring(F, 0, 0.98, cz, 0.022, 8, 0.008, 0.008, brass, 'bronze', 'xy');
    F.box(0, 0.93, cz, 0.06, 0.04, 0.025, 0, brass, 'bronze');
    F.pillow(0, cy, cz, 0.28, 0.024, 0.28, 0, brass, 'bronze', { rx: -Math.PI / 2, round: 2, side: 0.9, puff: 0.1, pinch: 0 });
    F.pillow(0, cy, cz, 0.23, 0.028, 0.23, 0, dk, 'bronze', { rx: -Math.PI / 2, round: 2, side: 0.9, puff: 0.1, pinch: 0 });
    X.ring(F, 0, cy, cz, 0.13, 24, 0.02, 0.032, F.shade(brass, 0.1), 'bronze', 'xy');
    for (let k = 0; k < 24; k++) { const a = k * F.TAU / 24; F.box(Math.cos(a) * 0.123, cy + Math.sin(a) * 0.123 - 0.004, cz + 0.016, 0.02, 0.008, 0.004, -a, dk, 'bronze'); }
    X.ring(F, 0, cy, cz + 0.018, 0.08, 18, 0.008, 0.008, gold, 'gold', 'xy');
    X.ring(F, 0.02, cy + 0.02, cz + 0.018, 0.05, 14, 0.008, 0.008, gold, 'gold', 'xy');
    for (let k = 0; k < 6; k++) { const a = k * F.TAU / 6 + 0.3; F.beam(Math.cos(a) * 0.05, cy + Math.sin(a) * 0.05, cz + 0.018, Math.cos(a) * 0.105, cy + Math.sin(a) * 0.105, cz + 0.018, 0.008, 0.008, gold, 'gold'); }
    F.beam(-0.12, cy - 0.06, cz + 0.024, 0.12, cy + 0.06, cz + 0.024, 0.016, 0.006, F.shade(brass, 0.15), 'bronze');
    F.rod(0, cy, cz - 0.02, 0, cy, cz + 0.035, 0.008, dk, 'bronze');
  }
});
/* training furniture (FK.ROLES.training, 2026-10): a melee and a ranged practice piece in this culture's style sheet, keyed nomad_training_<role> */
FK.set({ culture: 'nomad', tier: 'common', roles: 'training', prefix: 'nomad_training_', S: NOMAD_COMMON, names: {
  training_dummy: 'Felt practice dummy', archery_butt: 'Horse-archery target' } });
