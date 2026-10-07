/* ======================================================================
   Scyvoi furniture: common and court tiers, the trade roles, and the
   bespoke tent furnishings the Scyvoi building kit places by key.
   The Scyvoi (they call themselves Baer-San) are semi-nomadic salamander
   riders of the central crater's drylands. Influences: Kazakh, Kyrgyz,
   Mongol, Bedouin, Moroccan. Rich tents for nearly everyone: felt and
   knotted rugs, cushions and bolsters, low tables, brass trays, pierced
   lanterns, mosaic-glass chandeliers, red-painted chests and shyrdak felt
   hangings with ram's-horn scrolls; the chief's tent (court tier) is the
   most ornate. Smiths, hunters, fire-fruit harvesters and shamans.
   No socket pack yet: the hangings draw the 'horns' symbol.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('scyvoi', { name: 'Scyvoi', pack: null, influences: 'Kazakh, Kyrgyz, Mongol, Bedouin, Moroccan',
  materials: 'felt, wool, velvet, leather, poplar and walnut, red-lacquered timber, brass, copper, black iron, mosaic glass, bone and horn; court: crimson velvet, gold, knotted carpets',
  palette: {
    feltCream: 0xe6dcc4, feltWhite: 0xf2eee4, feltGrey: 0x8c8780, feltBrown: 0x6e5440,
    madder: 0xa8322a, madderDark: 0x6e1e1c, crimson: 0x8e1426, teal: 0x1f7a78, tealDark: 0x14504e, indigo: 0x2a3266,
    saffron: 0xe0a020, gold: 0xd4a83a, brass: 0xb8913a, copper: 0xb5683a, ironBlack: 0x2a2824,
    timberPoplar: 0xc2a878, timberWalnut: 0x5e3e28, timberWalnutDark: 0x3e281a, timberRed: 0xa02a1e, timberRedDark: 0x6a1a14,
    leatherTan: 0xa87a4a, leatherDark: 0x5a3a22, boneIvory: 0xe6dcc2, horn: 0x6e5638,
    stoneGrey: 0x5e5850, stoneDark: 0x403c36, ash: 0x3e3a36,
    glassRuby: 0xd0283c, glassAmber: 0xf0a02a, glassBlue: 0x2a62d0, glassGreen: 0x2aa060, teaAmber: 0xa04812,
    flame: 0xffb04a, ember: 0xe0521e, ropeHemp: 0xb09a6a, wicker: 0xb48a52,
    fruitFire: 0xe2461c, fruitDeep: 0xb02a14, fruitGold: 0xf0b42a, leafGreen: 0x3a5a2a,
    herbGreen: 0x5e7034, herbSage: 0x8a9670, herbDry: 0xa8985a, herbRed: 0x9a3020,
    ribbonBlue: 0x3a78c8, hairBlack: 0x1e1c1a, stew: 0x6a4426, smoke: 0xc8c4bc
  } });
/* END PALETTE */

const SCYVOI_COMMON = {
  sym: 'horns',
  emblem: { field: 'madder', edge: 'indigo', band: 'saffron', ink: 'feltCream', ink2: 'teal' },
  wood: 'timberWalnut', woodDark: 'timberWalnutDark', woodLight: 'timberPoplar', woodFam: 'wood',
  cloth: ['madder', 'teal', 'feltCream', 'indigo'], clothFam: 'cloth',
  accent: 'brass', accentFam: 'bronze', metal: 'ironBlack', metalFam: 'metal',
  clay: 'copper', clayFam: 'bronze', stone: 'stoneGrey', stoneFam: 'stone', rope: 'ropeHemp',
  flame: 'flame', ember: 'ember', lampCol: 'glassAmber',
  legs: 'block', motif: 'spiral', bedBase: 'plank', seat: 'cushion', finial: 'ball',
  hearth: 'iron', fire: 'bowl', lamp: 'lantern', rug: 'felt', screen: 'lattice', store: 'sacks',
  shelfFill: 'bundles', rack: 'weapons', art: 'horns', art2: 'plate', statue: 'totem', tapestry: 'spiral',
  canopy: false, board: 'hide'
};
const SCYVOI_COURT = Object.assign({}, SCYVOI_COMMON, {
  emblem: { field: 'crimson', edge: 'indigo', band: 'gold', disc: 'teal', ink: 'feltWhite', ink2: 'gold' },
  wood: 'timberRed', woodDark: 'timberRedDark', woodLight: 'timberPoplar', woodFam: 'lacquer',
  cloth: ['crimson', 'saffron', 'teal', 'feltWhite'],
  accent: 'gold', accentFam: 'gold', finial: 'disc', rug: 'knotted', tapestry: 'medallion', canopy: true
});
FK.set({ culture: 'scyvoi', tier: 'common', S: SCYVOI_COMMON, names: {
  bed: 'Felt-covered bed', bench: 'Felt-cushioned bench', chair: 'Camp chair', stool: 'Felt-topped stool', table: 'Walnut feast table',
  low_table: 'Low painted table', desk: 'Writing box on legs', chest: 'Brass-cornered chest', bookcase: 'Painted shelf cupboard', wall_shelves: 'Hanging shelves',
  store: 'Felt saddle-bags', hearth: 'Iron stove hearth', fire: 'Brass fire-bowl', lamp: 'Pierced lantern on a stand', candle: 'Brass oil lamp',
  hanging: 'Hanging pierced lantern', rug: 'Felt rug', screen: 'Lattice screen', counter: 'Trade counter', workbench: 'Workbench',
  loom: 'Ground loom', rack: 'Weapon pegs', ladder: 'Ladder', board: 'Hide board', art: 'Ram\'s horns', banner: 'Felt banner',
  scroll: 'Painted hide scroll', pennants: 'Ribbon pennants', bowl: 'Copper bowl', jug: 'Copper ewer and cups', books: 'Bundled scrolls' } });
FK.set({ culture: 'scyvoi', tier: 'court', S: SCYVOI_COURT, names: {
  bed: 'Khan\'s canopy bed', throne: 'Khan\'s seat', divan: 'Khan\'s divan', table: 'Khan\'s feast table', low_table: 'Gilt low table',
  desk: 'Khan\'s writing desk', cabinet: 'Painted cabinet', bookcase: 'Khan\'s shelves', hearth: 'Great iron stove', fire: 'Gilt fire-bowl',
  lamp: 'Gilt lantern on a stand', candelabra: 'Gilt candelabra', hanging: 'Hanging gilt lantern', carpet: 'Great knotted carpet', screen: 'Carved lattice screen',
  tapestry: 'Medallion hanging', banner: 'Khan\'s banner', frieze: 'Felt frieze', wall_rug: 'Knotted wall carpet', scroll: 'Painted hide scroll',
  painted_hanging: 'Painted hide hanging', art: 'Gilt horns', statue: 'Ancestor totem', jug: 'Gilt ewer and cups', bowl: 'Gilt bowl' } });
/* trades and households (FK.ROLES.trade): keyed scyvoi_trade_<role> */
FK.set({ culture: 'scyvoi', tier: 'common', roles: 'trade', prefix: 'scyvoi_trade_', S: SCYVOI_COMMON, names: {
  forge: 'Smith\'s forge', anvil: 'Anvil on a stump', trough: 'Watering trough', stall: 'Salamander stall', hayrack: 'Fodder rack',
  display: 'Felt-trader\'s display', armour_stand: 'Lamellar on a stand', weapon_rack: 'Lance and sabre rack', vat: 'Felt-maker\'s vat',
  still: 'Milk-spirit still', bin: 'Grain bins', larder: 'Hanging larder', bunk: 'Herders\' bunk', locker: 'Painted locker',
  lathe: 'Bow lathe', press: 'Felt press', kiln: 'Potter\'s kiln', grindstone: 'Grindstone', altar: 'Spirit altar', barrel: 'Barrel rack' } });

/* ---------------------------------------------------------------------- shared shapes
   Everything here draws through the frame F it is handed, and takes colours, not palette keys. */
const SCYVOI_FX = {
  /* a ram's-horn pair (koshkar muiz) on a canvas: a stem and two inward curls, at (cx, cy), size R, turned rot */
  hornPair: function (g, cx, cy, R, rot, fill, line) {
    g.save(); g.translate(cx, cy); g.rotate(rot || 0);
    g.lineCap = 'round'; g.lineJoin = 'round';
    const path = function () {
      g.beginPath(); g.moveTo(0, R * 0.55); g.lineTo(0, 0);
      for (const s of [-1, 1]) {
        g.moveTo(0, 0);
        for (let i = 1; i <= 24; i++) {
          const t = i / 24, th = (s > 0 ? Math.PI : 0) + s * t * 2.4 * Math.PI, r = 0.5 * R * (1 - 0.78 * t);
          g.lineTo(s * 0.5 * R + r * Math.cos(th), r * Math.sin(th));
        }
      }
    };
    path(); g.strokeStyle = line; g.lineWidth = R * 0.3; g.stroke();
    path(); g.strokeStyle = fill; g.lineWidth = R * 0.17; g.stroke();
    g.restore();
  },
  /* four horn pairs round a lozenge: the shyrdak's main device */
  quad: function (g, cx, cy, R, fill, line) {
    for (let k = 0; k < 4; k++) {
      g.save(); g.translate(cx, cy); g.rotate(k * Math.PI / 2);
      SCYVOI_FX.hornPair(g, 0, -R * 0.62, R * 0.62, 0, fill, line);
      g.restore();
    }
    g.save(); g.translate(cx, cy); g.rotate(Math.PI / 4);
    g.fillStyle = line; g.fillRect(-R * 0.17, -R * 0.17, R * 0.34, R * 0.34);
    g.fillStyle = fill; g.fillRect(-R * 0.1, -R * 0.1, R * 0.2, R * 0.2);
    g.restore();
  },
  /* a felt field: border band, cord line, horn pairs round the border and quads in the field */
  paintFelt: function (g, W, H, c) {
    g.fillStyle = c.border; g.fillRect(0, 0, W, H);
    const b = Math.round(Math.min(W, H) * 0.12);
    g.fillStyle = c.cord; g.fillRect(b - 3, b - 3, W - 2 * b + 6, H - 2 * b + 6);
    g.fillStyle = c.field; g.fillRect(b, b, W - 2 * b, H - 2 * b);
    const nx = Math.max(2, Math.round((W - b) / (b * 1.5)));
    for (let i = 0; i < nx; i++) {
      const x = b * 0.5 + (W - b) * (i + 0.5) / nx;
      SCYVOI_FX.hornPair(g, x, b * 0.55, b * 0.55, i % 2 ? Math.PI : 0, c.small, c.cord);
      SCYVOI_FX.hornPair(g, x, H - b * 0.55, b * 0.55, i % 2 ? 0 : Math.PI, c.small, c.cord);
    }
    const cols = c.cols || 3, rows = c.rows || 2, fw = (W - 2 * b) / cols, fh = (H - 2 * b) / rows;
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      SCYVOI_FX.quad(g, b + fw * (q + 0.5), b + fh * (r + 0.5), Math.min(fw, fh) * 0.42, (r + q) % 2 ? c.horn2 : c.horn, c.cord);
    }
  },
  /* the painted chest front: three panels of horn scrolls in a gold frame */
  paintChest: function (g, W, H, c) {
    g.fillStyle = c.frame; g.fillRect(0, 0, W, H);
    const m = Math.round(H * 0.08), pw = (W - 4 * m) / 3;
    for (let i = 0; i < 3; i++) {
      const x0 = m + i * (pw + m);
      g.fillStyle = c.field; g.fillRect(x0, m, pw, H - 2 * m);
      if (i === 1) SCYVOI_FX.quad(g, x0 + pw / 2, H / 2, Math.min(pw, H) * 0.4, c.horn, c.frame);
      else {
        SCYVOI_FX.hornPair(g, x0 + pw / 2, H * 0.56, Math.min(pw, H) * 0.42, 0, c.horn, c.frame);
        g.fillStyle = c.frame; g.beginPath(); g.arc(x0 + pw / 2, H * 0.78, H * 0.04, 0, Math.PI * 2); g.fill();
      }
    }
  },
  /* an embroidered cover band (tall strip): stacked horn pairs */
  paintBand: function (g, W, H, c) {
    g.fillStyle = c.edge; g.fillRect(0, 0, W, H);
    const e = Math.max(3, Math.round(W * 0.1));
    g.fillStyle = c.field; g.fillRect(e, e, W - 2 * e, H - 2 * e);
    const n = Math.max(2, Math.round((H - 2 * e) / (W * 0.9)));
    for (let i = 0; i < n; i++) SCYVOI_FX.hornPair(g, W / 2, e + (H - 2 * e) * (i + 0.62) / n, W * 0.34, 0, c.horn, c.edge);
  },
  /* a shaman's drum skin: a sun, the horizon, a horned figure, in ochre on hide */
  paintDrum: function (g, W, H, c) {
    g.fillStyle = c.skin; g.fillRect(0, 0, W, H);
    g.strokeStyle = c.ink; g.fillStyle = c.ink; g.lineCap = 'round'; g.lineWidth = W * 0.035;
    g.beginPath(); g.arc(W * 0.5, H * 0.26, W * 0.1, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      g.beginPath(); g.moveTo(W * 0.5 + Math.cos(a) * W * 0.14, H * 0.26 + Math.sin(a) * W * 0.14);
      g.lineTo(W * 0.5 + Math.cos(a) * W * 0.2, H * 0.26 + Math.sin(a) * W * 0.2); g.stroke();
    }
    g.beginPath(); g.moveTo(W * 0.04, H * 0.5); g.lineTo(W * 0.96, H * 0.5); g.stroke();
    g.beginPath(); g.moveTo(W * 0.5, H * 0.58); g.lineTo(W * 0.5, H * 0.82);
    g.moveTo(W * 0.5, H * 0.82); g.lineTo(W * 0.4, H * 0.95); g.moveTo(W * 0.5, H * 0.82); g.lineTo(W * 0.6, H * 0.95);
    g.moveTo(W * 0.36, H * 0.66); g.lineTo(W * 0.64, H * 0.66);
    g.moveTo(W * 0.46, H * 0.58); g.quadraticCurveTo(W * 0.36, H * 0.5, W * 0.4, H * 0.42);
    g.moveTo(W * 0.54, H * 0.58); g.quadraticCurveTo(W * 0.64, H * 0.5, W * 0.6, H * 0.42); g.stroke();
    for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(W * (0.18 + k * 0.32), H * 0.72 + (k === 1 ? H * 0.2 : 0), W * 0.03, 0, Math.PI * 2); g.fill(); }
  },
  /* a ribbon hanging straight down from (x, y, z): a thin painted strip (F.box and F.beam are at least 2 cm thick) */
  ribbon: function (F, x, y, z, w, len, ry, colKey) {
    const css = F.css(F.col(colKey));
    F.decal(x, y - len, z, w, len, ry, 'scyvoi-ribbon-' + colKey, function (g, W, H) { g.fillStyle = css; g.fillRect(0, 0, W, H); }, 'cloth');
  },
  /* a tassel hanging from (x, y, z), len long: a knot and a skirt */
  tassel: function (F, x, y, z, len, col, knot, fam) {
    fam = fam || 'cloth';
    F.frustum(x, y - len * 0.3, z, len * 0.09, len * 0.07, len * 0.3, 0, knot, fam, 6);
    F.cone(x, y - len, z, len * 0.17, len * 0.72, 0, col, fam);
  },
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
  /* a horn pair laid flat (felt appliqué on a rug): centre (cx, cz) at height y, size R, its stem pointing
     away from direction rot (radians in the x-z plane), strip width w */
  hornFlat: function (F, cx, y, cz, R, rot, w, col, fam) {
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const at = (u, v) => [cx - u * sr + v * cr, cz + u * cr + v * sr];
    const seg = (a, b) => {
      const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
      F.box((a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2, len + w * 0.5, 0.02, w, Math.atan2(-dz, dx), col, fam);
    };
    seg(at(0, 0), at(0, -0.5 * R));
    for (const s of [-1, 1]) {
      let p = at(0, 0);
      for (let i = 1; i <= 7; i++) {
        const t = i / 7, th = (s > 0 ? Math.PI : 0) - s * t * 2.3 * Math.PI, r = 0.5 * R * (1 - 0.75 * t);
        const q = at(s * 0.5 * R + r * Math.cos(th), r * Math.sin(th));
        seg(p, q); p = q;
      }
    }
  },
  /* a hanging pierced lantern body: hex panes of glow behind bars, from y0, height h, radius r */
  pierced: function (F, y0, h, r, metal, mf, glass) {
    const ap = r * Math.cos(Math.PI / 6);
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3, ca = Math.cos(a), sa = Math.sin(a), g = glass[k % glass.length];
      F.box(ap * ca, y0, ap * sa, r * 0.96, h, 0.008, Math.PI / 2 - a, g, 'glow');
      for (const t of [-0.3, 0, 0.3]) F.box((ap + 0.006) * ca - t * r * sa, y0, (ap + 0.006) * sa + t * r * ca, r * 0.08, h, 0.006, Math.PI / 2 - a, metal, mf);
      const av = a + Math.PI / 6;
      F.box(r * Math.cos(av), y0, r * Math.sin(av), r * 0.12, h, r * 0.12, Math.PI / 2 - av, metal, mf);
    }
    for (const yb of [y0, y0 + h * 0.5 - h * 0.03, y0 + h - h * 0.07]) F.frustum(0, yb, 0, r * 1.07, r * 1.07, h * 0.07, 0, F.shade(metal, 0.08), mf, 6);
  },
  /* a glossy fire-fruit (a placeholder until the crater-drylands biome's fruit lands) */
  fruit: function (F, x, y, z, r, col, leaf) {
    F.blob(x, y, z, r, r * 2.15, 0, col, 'food');
    F.cone(x, y + r * 0.95, z, r * 0.32, r * 0.35, 0, leaf, 'plant');
  },
  /* a wicker basket heaped with fruit */
  basket: function (F, x, z, rb, rt, h, heapH, fruitKeys, wick, leaf) {
    F.frustum(x, 0, z, rb, rt, h, 0, wick, 'wicker', 12);
    for (let y = 0.04; y < h - 0.04; y += 0.06) F.cyl(x, y, z, rb + (rt - rb) * (y + 0.006) / h + 0.004, 0.012, 0, F.shade(wick, -0.18), 'wicker');
    F.cyl(x, h - 0.025, z, rt + 0.012, 0.03, 0, F.shade(wick, -0.08), 'wicker');
    F.dome(x, h - 0.02, z, rt * 0.94, heapH, 0, F.shade(F.pick(fruitKeys), -0.25), 'food');
    const fr = Math.min(0.055, rt * 0.24);
    const rings = [[rt * 0.66, 7, h - 0.02 + heapH * 0.45], [rt * 0.3, 4, h - 0.02 + heapH * 0.85], [0, 1, h - 0.02 + heapH + fr * 0.6]];
    for (const [rr, n, y] of rings) for (let i = 0; i < n; i++) {
      const a = i * F.TAU / n + F.rr(0, 0.5);
      SCYVOI_FX.fruit(F, x + Math.cos(a) * rr, y, z + Math.sin(a) * rr, fr * F.rr(0.85, 1.05), F.pick(fruitKeys), leaf);
    }
  }
};

/* ====================================================================== Seating */
FURN({
  key: 'scyvoi_floor_cushion', name: 'Floor cushion', culture: 'scyvoi', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['cloth', 'gold'],
  w: 0.7, d: 0.7, h: 0.22, variants: 3, variantNames: ['madder velvet', 'teal velvet', 'felt appliqué with tassels'],
  build: function (F) {
    const v = F.variant, body = F.col(['madder', 'teal', 'feltCream'][v]), pipe = F.col(v === 1 ? 'saffron' : v === 2 ? 'madder' : 'gold');
    /* a boxed cushion: puffed top and bottom, a short wall between, piping on both seams */
    const S = 0.64, H = 0.24, c = H / 2, top = F.pillow(0, c, 0, S, H, S, 0, body, 'cloth', { side: 0.3, puff: 1.0, pinch: 0.05, round: 4 });
    const ty = (x, z) => c + top(x, z);   // ty: the top face's height
    for (const L of [top.seamTop, top.seamBottom]) for (let i = 0; i < L.length - 1; i++)   // piping along both seams
      F.rod(L[i][0], c + L[i][1], L[i][2], L[i + 1][0], c + L[i + 1][1], L[i + 1][2], 0.012, pipe, 'cloth');
    if (v < 2) {
      F.box(0, ty(0, 0) - 0.008, 0, 0.18, 0.012, 0.18, Math.PI / 4, F.col('gold'), 'gold');
      F.box(0, ty(0, 0) - 0.004, 0, 0.1, 0.012, 0.1, Math.PI / 4, F.col(v ? 'madder' : 'teal'), 'cloth');
      F.ball(0, ty(0, 0) + 0.004, 0, 0.022, F.col('gold'), 'gold');   // the tufting button
    } else {
      const ap = F.col('madder'), ap2 = F.col('teal');
      F.box(0, ty(0, 0) - 0.008, 0, 0.16, 0.012, 0.16, Math.PI / 4, ap2, 'cloth');
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        F.box(sx * 0.15, ty(0.15, 0.2) - 0.008, sz * 0.2, 0.12, 0.012, 0.035, 0, ap, 'cloth');
        F.box(sx * 0.2, ty(0.2, 0.15) - 0.008, sz * 0.15, 0.035, 0.012, 0.12, 0, ap, 'cloth');
        F.box(sx * 0.1, ty(0.1, 0.1) - 0.008, sz * 0.1, 0.04, 0.012, 0.04, Math.PI / 4, ap, 'cloth');
        SCYVOI_FX.tassel(F, sx * 0.265, c, sz * 0.265, 0.1, F.col('madder'), F.col('teal'));   // at the rounded corners
      }
    }
  }
});
FURN({
  key: 'scyvoi_bolster', name: 'Bolster', culture: 'scyvoi', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court'], anchor: 'floor', clearance: {},
  materials: ['cloth', 'gold'],
  w: 1.1, d: 0.3, h: 0.3, variants: 2, variantNames: ['madder with gold bands', 'teal and indigo stripes'],
  build: function (F) {
    /* a round bolster, its ends gathered and tied with a gold knot; bands are sections of the same profile, a hair proud */
    const v = F.variant, R = 0.14, y = R + 0.005, len = 0.96, gold = F.col('gold');
    const band = (x0, x1, col, fam, grow) => F.bolster(0, y, 0, len, R, 0, col, fam || 'cloth', { from: (x0 + len / 2) / len, to: (x1 + len / 2) / len, grow: grow || 1.03 });
    if (!v) {
      F.bolster(0, y, 0, len, R, 0, F.col('madder'), 'cloth');
      for (const x of [-0.36, -0.3, 0.27, 0.33]) band(x, x + 0.03, gold, 'gold');
    } else {
      const cols = F.cols(['teal', 'indigo', 'teal', 'indigo', 'teal']), n = cols.length, step = len / n;
      for (let i = 0; i < n; i++) band(-len / 2 + i * step, -len / 2 + (i + 1) * step, cols[i], 'cloth', 1);
      for (let i = 1; i < n; i++) band(-len / 2 + i * step - 0.008, -len / 2 + i * step + 0.008, F.col('feltCream'));
    }
    const cap = F.col(v ? 'saffron' : 'teal');
    for (const s of [-1, 1]) {
      band(s < 0 ? -len / 2 : len / 2 - 0.05, s < 0 ? -len / 2 + 0.05 : len / 2, cap, 'cloth', 1.01);
      F.ball(s * (len / 2 + 0.01), y, 0, 0.032, gold, 'gold');
      SCYVOI_FX.tassel(F, s * 0.505, y, 0, 0.14, F.col(v ? 'saffron' : 'madder'), gold);
    }
  }
});
FURN({
  key: 'scyvoi_toshak', name: 'Toshak floor seat', culture: 'scyvoi', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['cloth', 'gold'],
  w: 2.0, d: 0.8, h: 0.65, variants: 2, variantNames: ['madder with teal cushions', 'indigo with crimson cushions'],
  build: function (F) {
    const v = F.variant;
    const base = F.col(v ? 'indigo' : 'madder'), top = F.shade(base, 0.08), cush = F.col(v ? 'crimson' : 'teal');
    const trim = F.col(v ? 'saffron' : 'gold'), band = F.col(v ? 'teal' : 'saffron');
    /* the mattress (its back to the wall): a tufted, boxed pad, piping on both seams, a front band and tassels */
    const mt = F.pillow(0, 0.075, 0, 1.96, 0.15, 0.78, 0, top, 'cloth', { side: 0.5, puff: 0.45, pinch: 0.01 });
    for (const x of [-0.72, -0.36, 0, 0.36, 0.72]) for (const z of [-0.12, 0.16]) F.ball(x, 0.075 + mt(x, z) - 0.004, z, 0.016, F.shade(top, -0.25), 'cloth');   // tufting
    F.rod(-0.97, 0.117, 0.386, 0.97, 0.117, 0.386, 0.011, trim, 'cloth');
    F.rod(-0.97, 0.033, 0.386, 0.97, 0.033, 0.386, 0.011, trim, 'cloth');
    F.box(0, 0.045, 0.39, 1.9, 0.06, 0.01, 0, band, 'cloth');
    for (let i = 0; i < 8; i++) SCYVOI_FX.tassel(F, -0.84 + i * 0.24, 0.07, 0.39, 0.06, trim, F.col('madderDark'));
    /* back cushions leaning on the wall (stood up and tipped back), each with a centre band and a gold clasp */
    for (const x of [-0.62, 0, 0.62]) {
      const rx = -Math.PI / 2 - 0.15;
      F.pillow(x, 0.38, -0.27, 0.58, 0.17, 0.48, 0, cush, 'cloth', { rx: rx, puff: 0.9, pinch: 0.07 });
      F.pillow(x, 0.38, -0.27, 0.13, 0.178, 0.482, 0, band, 'cloth', { rx: rx, puff: 0.9, pinch: 0 });
      F.beam(x, 0.33, -0.255, x, 0.45, -0.273, 0.07, 0.18, F.col('gold'), 'gold');
    }
    /* arm bolsters at the ends, gathered and banded */
    for (const s of [-1, 1]) {
      const L = 0.62, bz = (z0, z1, col, g) => F.bolster(s * 0.86, 0.25, 0, L, 0.11, Math.PI / 2, col, 'cloth', { from: (z0 + L / 2) / L, to: (z1 + L / 2) / L, grow: g });
      F.bolster(s * 0.86, 0.25, 0, L, 0.11, Math.PI / 2, cush, 'cloth');
      bz(-L / 2, -L / 2 + 0.04, band, 1.01); bz(L / 2 - 0.04, L / 2, band, 1.01);
      bz(-0.12, -0.1, trim, 1.05); bz(0.1, 0.12, trim, 1.05);
    }
  }
});
FURN({
  key: 'scyvoi_pouf', name: 'Leather pouf', culture: 'scyvoi', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['hide', 'cloth'],
  w: 0.6, d: 0.6, h: 0.4, variants: 2, variantNames: ['tan leather, madder stitching', 'dark leather, saffron stitching'],
  build: function (F) {
    const v = F.variant, L = F.col(v ? 'leatherDark' : 'leatherTan'), st = F.col(v ? 'saffron' : 'madder');
    F.frustum(0, 0, 0, 0.25, 0.29, 0.06, 0, F.shade(L, -0.08), 'hide', 16);
    F.cyl(0, 0.06, 0, 0.29, 0.26, 0, L, 'hide');
    F.frustum(0, 0.32, 0, 0.29, 0.26, 0.05, 0, L, 'hide', 16);
    F.dome(0, 0.37, 0, 0.26, 0.025, 0, F.shade(L, 0.05), 'hide');
    F.cyl(0, 0.376, 0, 0.09, 0.02, 0, st, 'hide');
    F.cyl(0, 0.379, 0, 0.05, 0.02, 0, F.col('feltCream'), 'hide');
    for (let i = 0; i < 8; i++) {
      const a = i * F.TAU / 8, ca = Math.cos(a), sa = Math.sin(a);
      F.beam(ca * 0.09, 0.394, sa * 0.09, ca * 0.25, 0.376, sa * 0.25, 0.008, 0.008, st, 'hide');
      F.box(ca * 0.292, 0.07, sa * 0.292, 0.008, 0.24, 0.006, Math.PI / 2 - a, st, 'hide');
    }
    const pts = [];
    for (let i = 0; i <= 16; i++) { const a = (i + 0.5) * F.TAU / 16; pts.push([Math.cos(a) * 0.3, i % 2 ? 0.23 : 0.15, Math.sin(a) * 0.3]); }
    for (let i = 0; i < 16; i++) F.beam(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0], pts[i + 1][1], pts[i + 1][2], 0.012, 0.012, st, 'hide');
  }
});

/* ====================================================================== Tables and storage */
FURN({
  key: 'scyvoi_bedding_stack', name: 'Bedding stack on a painted chest', culture: 'scyvoi', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'hall', 'court', 'store'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['cloth', 'lacquer', 'timber', 'bronze'],
  w: 1.4, d: 0.6, h: 1.3, variants: 1,
  build: function (F) {
    const red = F.col('timberRed'), brass = F.col('brass');
    F.box(0, 0, 0, 1.36, 0.06, 0.56, 0, F.col('timberWalnutDark'), 'wood');
    F.box(0, 0.06, 0, 1.34, 0.38, 0.54, 0, red, 'lacquer');
    const cc = { frame: F.css(F.col('saffron')), field: F.css(red), horn: F.css(F.col('teal')) };
    F.decal(0, 0.1, 0.271, 1.2, 0.3, 0, 'scyvoi-zhuk-chest', function (g, W, H) { SCYVOI_FX.paintChest(g, W, H, cc); }, 'lacquer');
    for (const s of [-1, 1]) F.box(s * 0.67, 0.06, 0.27, 0.05, 0.38, 0.02, 0, brass, 'bronze');
    /* folded quilts and felts, each with its bound edge to the front */
    const keys = ['madder', 'teal', 'feltCream', 'indigo', 'saffron', 'crimson', 'feltWhite'];
    let y = 0.44;
    for (let i = 0; i < 7; i++) {
      const th = 0.085 + F.rr(0, 0.015), x = F.rr(-0.01, 0.01), c = F.col(keys[i]);
      F.pillow(x, y + th / 2, 0, 1.26, th, 0.52, 0, c, 'cloth', { side: 0.6, puff: 0.35, pinch: 0.01 });   // a folded quilt: soft edges
      F.box(x, y + th * 0.15, 0.262, 1.24, th * 0.7, 0.008, 0, F.col(keys[(i + 3) % 7]), 'cloth');
      y += th;
    }
    /* pillows and the embroidered cover band draped over the front */
    for (const s of [-1, 1]) {
      F.pillow(s * 0.4, y + 0.055, 0, 0.44, 0.13, 0.4, s * 0.06, F.col('feltWhite'), 'cloth', { puff: 1.0, pinch: 0.08 });
    }
    const crim = F.col('crimson');
    F.box(0, y, -0.02, 0.34, 0.01, 0.56, 0, crim, 'cloth');
    F.box(0, y - 0.62, 0.275, 0.34, 0.63, 0.012, 0, crim, 'cloth');
    const bc = { edge: F.css(F.col('teal')), field: F.css(crim), horn: F.css(F.col('gold')) };
    F.decal(0, y - 0.58, 0.2875, 0.3, 0.56, 0, 'scyvoi-zhuk-band', function (g, W, H) { SCYVOI_FX.paintBand(g, W, H, bc); }, 'cloth');
    for (const x of [-0.12, 0, 0.12]) SCYVOI_FX.tassel(F, x, y - 0.62, 0.281, 0.09, F.col('gold'), F.col('teal'));
  }
});
FURN({
  key: 'scyvoi_tray_table', name: 'Brass tray table', culture: 'scyvoi', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['timber', 'bronze', 'hide'],
  w: 0.8, d: 0.8, h: 0.45, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), brass = F.col('brass');
    for (const z of [-0.17, 0.17]) {
      F.beam(-0.24, 0, z, 0.22, 0.4, z, 0.04, 0.03, wood, 'wood');
      F.beam(0.24, 0, z, -0.22, 0.4, z, 0.04, 0.03, wood, 'wood');
      F.cyl(0, 0.19, z, 0.025, 0.02, 0, brass, 'bronze');
    }
    F.rod(0, 0.2, -0.2, 0, 0.2, 0.2, 0.01, brass, 'bronze');
    for (const s of [-1, 1]) F.box(s * 0.22, 0.385, 0, 0.05, 0.015, 0.4, 0, F.col('leatherDark'), 'hide');
    F.cyl(0, 0.40, 0, 0.4, 0.03, 0, brass, 'bronze');
    F.cyl(0, 0.412, 0, 0.37, 0.02, 0, F.shade(brass, -0.12), 'bronze');
    F.cyl(0, 0.414, 0, 0.26, 0.02, 0, F.shade(brass, 0.1), 'bronze');
    F.cyl(0, 0.416, 0, 0.12, 0.02, 0, F.shade(brass, -0.2), 'bronze');
    SCYVOI_FX.ring(F, 0, 0.435, 0, 0.39, 24, 0.02, 0.02, F.shade(brass, 0.12), 'bronze', 'xz');
    for (let i = 0; i < 12; i++) {
      const a = i * F.TAU / 12;
      F.box(Math.cos(a) * 0.315, 0.413, Math.sin(a) * 0.315, 0.1, 0.02, 0.02, -a, F.shade(brass, -0.25), 'bronze');
    }
  }
});
FURN({
  key: 'scyvoi_low_round_table', name: 'Carved round low table', culture: 'scyvoi', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber', 'kitchen'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['timber', 'lacquer', 'cloth'],
  w: 1.0, d: 1.0, h: 0.34, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), red = F.col('timberRed');
    for (let i = 0; i < 4; i++) {
      const a = F.TAU / 8 + i * F.TAU / 4, x = Math.cos(a) * 0.32, z = Math.sin(a) * 0.32;
      F.frustum(x, 0, z, 0.045, 0.035, 0.27, 0, wood, 'wood', 8);
      F.cyl(x, 0.12, z, 0.05, 0.02, 0, red, 'lacquer');
    }
    F.cyl(0, 0.22, 0, 0.36, 0.05, 0, F.shade(wood, -0.12), 'wood');
    F.cyl(0, 0.27, 0, 0.46, 0.045, 0, wood, 'wood');
    for (let i = 0; i < 24; i++) {
      const a = i * F.TAU / 24;
      F.box(Math.cos(a) * 0.462, 0.28, Math.sin(a) * 0.462, 0.05, 0.025, 0.012, Math.PI / 2 - a, F.shade(wood, i % 2 ? -0.2 : 0.12), 'wood');
    }
    F.cyl(0, 0.297, 0, 0.455, 0.02, 0, red, 'lacquer');
    F.cyl(0, 0.299, 0, 0.43, 0.02, 0, wood, 'wood');
    /* the cloth: fringe, an embroidered centre and lozenges */
    const cloth = F.col('feltCream');
    F.cyl(0, 0.301, 0, 0.38, 0.02, 0, cloth, 'cloth');
    for (let i = 0; i < 36; i++) {
      const a = i * F.TAU / 36;
      F.box(Math.cos(a) * 0.4, 0.3, Math.sin(a) * 0.4, 0.04, 0.02, 0.02, -a, F.col('saffron'), 'cloth');
    }
    F.cyl(0, 0.303, 0, 0.33, 0.02, 0, F.col('madder'), 'cloth');
    F.cyl(0, 0.305, 0, 0.31, 0.02, 0, cloth, 'cloth');
    F.cyl(0, 0.307, 0, 0.11, 0.02, 0, F.col('madder'), 'cloth');
    for (let i = 0; i < 8; i++) {
      const a = i * F.TAU / 8;
      F.box(Math.cos(a) * 0.22, 0.307, Math.sin(a) * 0.22, 0.05, 0.02, 0.05, Math.PI / 4 - a, F.col('teal'), 'cloth');
    }
  }
});
FURN({
  key: 'scyvoi_painted_chest', name: 'Painted chest', culture: 'scyvoi', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'hall', 'store', 'court'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['lacquer', 'timber', 'bronze'],
  w: 1.0, d: 0.55, h: 0.6, variants: 2, variantNames: ['painted scrolls, brass corners', 'brass-strapped'],
  build: function (F) {
    const v = F.variant, red = F.col('timberRed'), brass = F.col('brass'), dark = F.col('timberWalnutDark');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.44, 0, sz * 0.21, 0.08, 0.05, 0.08, 0, dark, 'wood');
    F.box(0, 0.05, 0, 0.96, 0.45, 0.5, 0, red, 'lacquer');
    F.box(0, 0.5, 0, 0.98, 0.08, 0.52, 0, F.shade(red, 0.05), 'lacquer');
    F.box(0, 0.58, 0, 0.9, 0.015, 0.44, 0, F.shade(red, -0.12), 'lacquer');
    if (!v) {
      const cc = { frame: F.css(F.col('saffron')), field: F.css(red), horn: F.css(F.col('teal')) };
      F.decal(0, 0.09, 0.2515, 0.86, 0.36, 0, 'scyvoi-chest-v0', function (g, W, H) { SCYVOI_FX.paintChest(g, W, H, cc); }, 'lacquer');
      F.box(0, 0.52, 0.261, 0.9, 0.025, 0.004, 0, F.col('saffron'), 'lacquer');
    } else {
      for (const x of [-0.3, 0, 0.3]) F.box(x, 0.05, 0.252, 0.05, 0.45, 0.008, 0, brass, 'bronze');
      for (const y of [0.13, 0.38]) F.box(0, y, 0.252, 0.92, 0.04, 0.008, 0, F.shade(brass, -0.08), 'bronze');
      for (const x of [-0.15, 0.15]) for (const y of [0.25, 0.42, 0.1]) F.rod(x, y, 0.25, x, y, 0.262, 0.014, F.shade(brass, 0.12), 'bronze');
      for (const x of [-0.3, 0, 0.3]) F.box(x, 0.5, 0.262, 0.05, 0.08, 0.006, 0, brass, 'bronze');
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0.05, 0.4]) {
      F.box(sx * 0.44, y, sz * 0.252, 0.1, 0.1, 0.008, 0, brass, 'bronze');
      F.box(sx * 0.482, y, sz * 0.21, 0.008, 0.1, 0.1, 0, brass, 'bronze');
    }
    F.box(0, 0.36, 0.255, 0.1, 0.12, 0.012, 0, brass, 'bronze');
    F.box(0, 0.45, 0.262, 0.03, 0.09, 0.01, 0, F.shade(brass, -0.25), 'bronze');
    for (const s of [-1, 1]) {
      F.rod(s * 0.5, 0.36, -0.08, s * 0.5, 0.36, 0.08, 0.008, F.col('ironBlack'), 'bronze');
      for (const z of [-0.08, 0.08]) F.rod(s * 0.48, 0.38, z, s * 0.5, 0.36, z, 0.008, F.col('ironBlack'), 'bronze');
    }
  }
});

/* ====================================================================== Light */
FURN({
  key: 'scyvoi_floor_lantern', name: 'Pierced floor lantern', culture: 'scyvoi', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine'], anchor: 'floor', clearance: {},
  materials: ['bronze', 'metal', 'emissive'],
  w: 0.3, d: 0.3, h: 0.6, variants: 2, variantNames: ['brass, amber glass', 'iron, ruby and amber glass'],
  build: function (F) {
    const v = F.variant, M = F.col(v ? 'ironBlack' : 'brass'), MF = v ? 'metal' : 'bronze';
    const glass = v ? F.cols(['glassRuby', 'glassAmber']) : F.cols(['glassAmber']);
    F.frustum(0, 0, 0, 0.12, 0.13, 0.03, 0, M, MF, 6);
    F.frustum(0, 0.03, 0, 0.13, 0.1, 0.03, 0, F.shade(M, 0.08), MF, 6);
    SCYVOI_FX.pierced(F, 0.06, 0.28, 0.1, M, MF, glass);
    F.frustum(0, 0.34, 0, 0.115, 0.05, 0.12, 0, M, MF, 6);
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3;
      F.box(Math.cos(a) * 0.072, 0.37, Math.sin(a) * 0.072, 0.02, 0.03, 0.006, Math.PI / 2 - a, glass[0], 'glow');
    }
    F.dome(0, 0.46, 0, 0.05, 0.05, 0, M, MF);
    F.cyl(0, 0.51, 0, 0.012, 0.04, 0, M, MF);
    F.cyl(0, 0.55, 0, 0.025, 0.02, 0, F.shade(M, 0.1), MF);
    SCYVOI_FX.ring(F, 0, 0.585, 0, 0.012, 8, 0.006, 0.006, M, MF, 'xy');
    F.lamp(0, 0.2, 0, 0.7, 6);
  }
});
FURN({
  key: 'scyvoi_hanging_lantern', name: 'Hanging pierced lantern', culture: 'scyvoi', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine', 'kitchen'], anchor: 'ceiling', clearance: {},
  materials: ['bronze', 'emissive'],
  w: 0.28, d: 0.28, h: 0.9, variants: 1,
  build: function (F) {
    const M = F.col('brass'), MF = 'bronze';
    F.frustum(0, 0, 0, 0.012, 0.04, 0.05, 0, M, MF, 6);
    F.frustum(0, 0.05, 0, 0.06, 0.13, 0.08, 0, M, MF, 6);
    SCYVOI_FX.pierced(F, 0.13, 0.26, 0.12, M, MF, F.cols(['glassAmber', 'glassRuby', 'glassBlue']));
    F.frustum(0, 0.39, 0, 0.13, 0.05, 0.1, 0, M, MF, 6);
    F.dome(0, 0.49, 0, 0.05, 0.04, 0, M, MF);
    F.cyl(0, 0.53, 0, 0.012, 0.03, 0, M, MF);
    for (let i = 0; i < 6; i++) SCYVOI_FX.ring(F, 0, 0.585 + i * 0.048, 0, 0.014, 6, 0.006, 0.006, F.shade(M, -0.1), MF, i % 2 ? 'zy' : 'xy', 0.026);
    F.cyl(0, 0.87, 0, 0.06, 0.03, 0, M, MF);
    F.lamp(0, 0.26, 0, 0.7, 7);
  }
});
FURN({
  key: 'scyvoi_glass_chandelier', name: 'Mosaic-glass chandelier', culture: 'scyvoi', tier: 'court', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber', 'bedroom'], anchor: 'ceiling', clearance: {},
  materials: ['bronze', 'emissive'],
  w: 0.9, d: 0.9, h: 1.4, variants: 1,
  build: function (F) {
    const brass = F.col('brass');
    F.frustum(0, 1.33, 0, 0.06, 0.12, 0.07, 0, brass, 'bronze', 12);
    F.rod(0, 1.33, 0, 0, 0.98, 0, 0.012, brass, 'bronze');
    F.blob(0, 1.2, 0, 0.035, 0.07, 0, F.shade(brass, 0.1), 'bronze');
    F.blob(0, 1.06, 0, 0.03, 0.06, 0, F.shade(brass, 0.1), 'bronze');
    F.cyl(0, 0.93, 0, 0.06, 0.06, 0, brass, 'bronze');
    SCYVOI_FX.ring(F, 0, 0.96, 0, 0.34, 16, 0.022, 0.022, brass, 'bronze', 'xz');
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4 + 0.2; F.rod(0, 0.96, 0, Math.cos(a) * 0.33, 0.96, Math.sin(a) * 0.33, 0.008, brass, 'bronze'); }
    const glass = ['glassRuby', 'glassAmber', 'glassBlue', 'glassGreen'];
    const globe = function (x, cy, z, R, k) {
      const c = F.col(glass[k % 4]), c2 = F.col(glass[(k + 2) % 4]);
      F.ball(x, cy, z, R, c, 'glow');
      F.cyl(x, cy + R * 0.35, z, R * 0.95, R * 0.18, 0, c2, 'glow');
      F.cyl(x, cy - R * 0.53, z, R * 0.95, R * 0.18, 0, c2, 'glow');
      F.frustum(x, cy + R * 0.8, z, R * 0.5, R * 0.25, R * 0.32, 0, brass, 'bronze', 12);
      F.frustum(x, cy - R - 0.03, z, 0.006, R * 0.3, 0.035, 0, brass, 'bronze', 8);
    };
    const drops = [0.62, 0.46, 0.68, 0.42, 0.6, 0.5, 0.7, 0.44];
    for (let i = 0; i < 8; i++) {
      const a = i * F.TAU / 8, x = Math.cos(a) * 0.34, z = Math.sin(a) * 0.34, R = 0.085, cy = drops[i];
      F.rod(x, 0.96, z, x, cy + R * 1.1, z, 0.003, brass, 'bronze');
      globe(x, cy, z, R, i);
    }
    F.rod(0, 0.93, 0, 0, 0.35, 0, 0.004, brass, 'bronze');
    globe(0, 0.2, 0, 0.12, 1);
    F.lamp(0, 0.55, 0, 1.0, 9);
  }
});

/* ====================================================================== Vessels */
FURN({
  key: 'scyvoi_tea_set', name: 'Tea set on a brass tray', culture: 'scyvoi', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'kitchen', 'antechamber', 'court', 'bedroom'], anchor: 'surface', clearance: {},
  materials: ['bronze', 'glass', 'gold'],
  w: 0.4, d: 0.4, h: 0.22, variants: 1,
  build: function (F) {
    const brass = F.col('brass'), pot = F.shade(brass, 0.12);
    F.cyl(0, 0, 0, 0.19, 0.02, 0, brass, 'bronze');
    F.cyl(0, 0.002, 0, 0.12, 0.02, 0, F.shade(brass, -0.15), 'bronze');
    SCYVOI_FX.ring(F, 0, 0.022, 0, 0.18, 16, 0.02, 0.02, F.shade(brass, 0.1), 'bronze', 'xz');
    const x = -0.04, z = -0.03;
    F.cyl(x, 0.02, z, 0.04, 0.02, 0, pot, 'bronze');
    F.blob(x, 0.075, z, 0.065, 0.11, 0, pot, 'bronze');
    F.frustum(x, 0.115, z, 0.05, 0.035, 0.03, 0, pot, 'bronze', 12);
    F.frustum(x, 0.145, z, 0.035, 0.02, 0.03, 0, F.shade(pot, 0.08), 'bronze', 12);
    F.cone(x, 0.175, z, 0.012, 0.035, 0, F.shade(pot, 0.08), 'bronze');
    F.rod(x + 0.05, 0.07, z + 0.02, x + 0.12, 0.14, z + 0.05, 0.008, pot, 'bronze');
    SCYVOI_FX.chain(F, [[x - 0.055, 0.115, z], [x - 0.1, 0.105, z], [x - 0.1, 0.055, z], [x - 0.055, 0.045, z]], 0.01, 0.01, F.shade(pot, -0.1), 'bronze');
    for (const [gx, gz] of [[0.0, 0.13], [0.08, 0.12], [0.13, -0.05], [0.06, -0.12]]) {
      F.frustum(gx, 0.02, gz, 0.018, 0.024, 0.065, 0, F.col('teaAmber'), 'glass', 10);
      F.cyl(gx, 0.072, gz, 0.025, 0.02, 0, F.col('gold'), 'gold');
    }
    F.blob(-0.1, 0.045, 0.1, 0.035, 0.06, 0, F.col('copper'), 'bronze');
    F.cone(-0.1, 0.07, 0.1, 0.012, 0.025, 0, F.col('copper'), 'bronze');
  }
});
FURN({
  key: 'scyvoi_samovar', name: 'Brass samovar', culture: 'scyvoi', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'kitchen', 'antechamber', 'court'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['bronze', 'timber', 'glass', 'gold'],
  w: 0.45, d: 0.45, h: 0.7, variants: 1,
  build: function (F) {
    const brass = F.col('brass'), cop = F.col('copper');
    F.cyl(0, 0, 0, 0.22, 0.012, 0, brass, 'bronze');
    SCYVOI_FX.ring(F, 0, 0.012, 0, 0.215, 18, 0.01, 0.01, F.shade(brass, 0.1), 'bronze', 'xz');
    for (let i = 0; i < 4; i++) { const a = F.TAU / 8 + i * F.TAU / 4; F.cyl(Math.cos(a) * 0.08, 0.012, Math.sin(a) * 0.08, 0.018, 0.03, 0, cop, 'bronze'); }
    F.frustum(0, 0.042, 0, 0.1, 0.07, 0.04, 0, cop, 'bronze', 4);
    F.cyl(0, 0.082, 0, 0.05, 0.04, 0, brass, 'bronze');
    F.frustum(0, 0.122, 0, 0.07, 0.15, 0.07, 0, brass, 'bronze', 16);
    F.cyl(0, 0.192, 0, 0.15, 0.2, 0, brass, 'bronze');
    F.cyl(0, 0.294, 0, 0.152, 0.012, 0, cop, 'bronze');
    F.frustum(0, 0.392, 0, 0.15, 0.1, 0.06, 0, brass, 'bronze', 16);
    F.cyl(0, 0.452, 0, 0.105, 0.02, 0, cop, 'bronze');
    F.cyl(0, 0.472, 0, 0.035, 0.08, 0, F.shade(brass, -0.1), 'bronze');
    for (const s of [-1, 1]) F.rod(s * 0.06, 0.25, 0.135, s * 0.06, 0.25, 0.15, 0.018, F.col('gold'), 'gold');
    /* the teapot warming on top */
    F.blob(0, 0.6, 0, 0.07, 0.1, 0, F.shade(brass, 0.12), 'bronze');
    F.dome(0, 0.645, 0, 0.04, 0.03, 0, F.shade(brass, 0.12), 'bronze');
    F.cone(0, 0.675, 0, 0.012, 0.025, 0, cop, 'bronze');
    F.rod(0.06, 0.6, 0, 0.11, 0.64, 0, 0.007, F.shade(brass, 0.12), 'bronze');
    for (const s of [-1, 1]) {
      SCYVOI_FX.chain(F, [[s * 0.15, 0.36, 0], [s * 0.2, 0.37, 0], [s * 0.2, 0.28, 0], [s * 0.15, 0.27, 0]], 0.014, 0.014, cop, 'bronze');
      F.box(s * 0.2, 0.29, 0, 0.022, 0.07, 0.03, 0, F.col('timberWalnutDark'), 'wood');
    }
    F.rod(0, 0.22, 0.14, 0, 0.22, 0.2, 0.012, cop, 'bronze');
    F.rod(0, 0.22, 0.2, 0, 0.17, 0.205, 0.008, cop, 'bronze');
    F.box(0, 0.23, 0.19, 0.05, 0.015, 0.015, 0, F.col('timberWalnutDark'), 'wood');
    F.frustum(0.13, 0.012, 0.13, 0.018, 0.024, 0.065, 0, F.col('teaAmber'), 'glass', 10);
  }
});

/* ====================================================================== Fire */
FURN({
  key: 'scyvoi_ger_stove', name: 'Iron tent stove', culture: 'scyvoi', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['hall', 'kitchen', 'bedroom', 'court', 'smithy'], anchor: 'floor', clearance: { front: 0.8, left: 0.4, right: 0.4 },
  materials: ['metal', 'bronze', 'emissive'],
  w: 0.7, d: 0.9, h: 3.6, variants: 2, variantNames: ['flue 2.6 m', 'flue 3.6 m'], variantDims: [{ w: 0.7, d: 0.9, h: 2.6 }, { w: 0.7, d: 0.9, h: 3.6 }],
  build: function (F) {
    const H = F.variant ? 3.6 : 2.6, iron = F.col('ironBlack'), brass = F.col('brass'), ember = F.col('ember');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.27, 0, sz * 0.37, 0.04, 0.14, 0.04, 0, iron, 'metal');
    F.box(0, 0.14, 0, 0.6, 0.42, 0.8, 0, iron, 'metal');
    F.box(0, 0.5, 0, 0.62, 0.03, 0.82, 0, brass, 'bronze');
    F.box(0, 0.56, 0, 0.64, 0.025, 0.84, 0, F.shade(iron, -0.15), 'metal');
    F.cyl(0, 0.585, 0.18, 0.12, 0.006, 0, F.shade(iron, 0.15), 'metal');
    /* the door, with glowing slits, and the glowing grate under it */
    F.box(0, 0.22, 0.4, 0.34, 0.26, 0.012, 0, F.shade(iron, 0.1), 'metal');
    for (const y of [0.3, 0.34, 0.38]) F.box(0, y, 0.406, 0.22, 0.015, 0.004, 0, ember, 'glow');
    F.box(0.13, 0.33, 0.406, 0.02, 0.06, 0.02, 0, brass, 'bronze');
    F.box(0, 0.15, 0.4, 0.4, 0.05, 0.008, 0, ember, 'glow');
    /* a kettle on the hot plate */
    F.blob(0, 0.66, 0.18, 0.1, 0.15, 0, F.col('copper'), 'bronze');
    F.cyl(0, 0.72, 0.18, 0.04, 0.02, 0, brass, 'bronze');
    F.rod(0.08, 0.65, 0.18, 0.17, 0.73, 0.18, 0.01, F.col('copper'), 'bronze');
    SCYVOI_FX.chain(F, [[-0.06, 0.73, 0.18], [0, 0.8, 0.18], [0.06, 0.73, 0.18]], 0.008, 0.008, iron, 'metal');
    /* the flue, straight up through the crown */
    const fz = -0.25;
    F.cyl(0, 0.585, fz, 0.08, 0.05, 0, iron, 'metal');
    F.cyl(0, 0.635, fz, 0.06, H - 0.635 - 0.06, 0, F.shade(iron, 0.06), 'metal');
    for (let y = 1.2; y < H - 0.2; y += 0.6) F.cyl(0, y, fz, 0.066, 0.025, 0, F.shade(iron, -0.1), 'metal');
    F.box(0, 1.0, fz, 0.16, 0.012, 0.02, 0, brass, 'bronze');
    for (const s of [-1, 1]) F.rod(s * 0.05, H - 0.07, fz, s * 0.07, H - 0.04, fz, 0.006, iron, 'metal');
    F.frustum(0, H - 0.05, fz, 0.11, 0.02, 0.05, 0, iron, 'metal', 12);
    F.lamp(0, 0.3, 0.55, 0.8, 7);
  }
});
FURN({
  key: 'scyvoi_fire_pit', name: 'Fire pit with kettle tripod', culture: 'scyvoi', tier: 'common', type: 'brazier', setting: 'both',
  rooms: ['hall', 'yard', 'kitchen', 'court'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['stone', 'timber', 'metal', 'rope', 'emissive'],
  w: 1.4, d: 1.4, h: 1.2, variants: 1,
  build: function (F) {
    const iron = F.col('ironBlack');
    F.cyl(0, 0, 0, 0.48, 0.02, 0, F.col('ash'), 'stone');
    for (let i = 0; i < 11; i++) {
      const a = i * F.TAU / 11 + F.rr(-0.1, 0.1), hb = F.rr(0.14, 0.18);
      F.blob(Math.cos(a) * 0.56, hb / 2, Math.sin(a) * 0.56, F.rr(0.1, 0.13), hb, F.rnd() * F.TAU, F.shade('stoneGrey', F.rr(-0.15, 0.1)), 'stone');
    }
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + 0.4;
      F.rod(Math.cos(a) * 0.4, 0.03, Math.sin(a) * 0.4, Math.cos(a) * 0.05, 0.2, Math.sin(a) * 0.05, 0.035, F.shade('timberWalnutDark', -0.2), 'wood');
    }
    F.blob(0, 0.04, 0, 0.3, 0.06, 0, F.col('ember'), 'glow');
    F.cone(0, 0.06, 0, 0.12, 0.38, 0, F.col('flame'), 'glow');
    F.cone(0.08, 0.06, 0.05, 0.07, 0.26, 0, F.col('ember'), 'glow');
    F.cone(-0.07, 0.06, -0.04, 0.07, 0.22, 0, F.col('flame'), 'glow');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.3; F.rod(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62, 0, 1.18, 0, 0.018, iron, 'metal'); }
    F.cyl(0, 1.1, 0, 0.03, 0.09, 0, F.col('ropeHemp'), 'rope');
    F.rod(0, 1.12, 0, 0, 0.78, 0, 0.006, iron, 'metal');
    /* the kettle */
    F.blob(0, 0.62, 0, 0.13, 0.2, 0, iron, 'metal');
    F.dome(0, 0.7, 0, 0.07, 0.04, 0, F.shade(iron, 0.1), 'metal');
    SCYVOI_FX.chain(F, [[-0.12, 0.66, 0], [0, 0.78, 0], [0.12, 0.66, 0]], 0.01, 0.01, iron, 'metal');
    F.rod(0.1, 0.6, 0, 0.2, 0.7, 0, 0.012, iron, 'metal');
    F.lamp(0, 0.3, 0, 1.1, 9);
  }
});
FURN({
  key: 'scyvoi_brazier', name: 'Brass brazier', culture: 'scyvoi', tier: 'common', type: 'brazier', setting: 'both',
  rooms: ['hall', 'court', 'antechamber', 'yard', 'shrine'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['bronze', 'emissive', 'stone'],
  w: 0.7, d: 0.7, h: 0.9, variants: 1,
  build: function (F) {
    const brass = F.col('brass'), ember = F.col('ember');
    const knees = [];
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 6, c = Math.cos(a), s = Math.sin(a);
      SCYVOI_FX.chain(F, [[c * 0.3, 0.03, s * 0.3], [c * 0.27, 0.25, s * 0.27], [c * 0.18, 0.56, s * 0.18]], 0.026, 0.022, F.shade(brass, -0.1), 'bronze');
      F.blob(c * 0.3, 0.025, s * 0.3, 0.04, 0.05, 0, brass, 'bronze');
      knees.push([c * 0.27, 0.25, s * 0.27]);
    }
    for (let i = 0; i < 3; i++) { const p = knees[i], q = knees[(i + 1) % 3]; F.beam(p[0], p[1], p[2], q[0], q[1], q[2], 0.014, 0.014, brass, 'bronze'); }
    F.frustum(0, 0.55, 0, 0.1, 0.3, 0.18, 0, brass, 'bronze', 16);
    SCYVOI_FX.ring(F, 0, 0.72, 0, 0.3, 20, 0.03, 0.03, F.shade(brass, -0.1), 'bronze', 'xz');
    for (let i = 0; i < 12; i++) {
      const a = i * F.TAU / 12, r = 0.1 + 0.2 * (0.635 - 0.55) / 0.18 + 0.006;
      F.box(Math.cos(a) * r, 0.62, Math.sin(a) * r, 0.03, 0.03, 0.01, Math.PI / 2 - a, ember, 'glow');
    }
    F.blob(0, 0.73, 0, 0.27, 0.05, 0, ember, 'glow');
    for (let i = 0; i < 6; i++) F.box(F.rr(-0.15, 0.15), 0.745, F.rr(-0.15, 0.15), 0.05, 0.03, 0.04, F.rnd() * 3, F.col('ash'), 'stone');
    F.cone(0, 0.74, 0, 0.1, 0.16, 0, F.col('flame'), 'glow');
    F.cone(0.08, 0.74, -0.05, 0.05, 0.1, 0, F.col('flame'), 'glow');
    F.lamp(0, 0.85, 0, 0.9, 7);
  }
});
FURN({
  key: 'scyvoi_cauldron', name: 'Copper cauldron over a fire', culture: 'scyvoi', tier: 'common', type: 'vessel', setting: 'outdoor',
  rooms: ['yard', 'street', 'market'], anchor: 'floor', clearance: { front: 0.6, back: 0.4, left: 0.4, right: 0.4 },
  materials: ['bronze', 'metal', 'stone', 'timber', 'food', 'emissive'],
  w: 1.1, d: 1.1, h: 1.3, variants: 1,
  build: function (F) {
    const iron = F.col('ironBlack'), cop = F.col('copper');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + Math.PI / 2; F.rod(Math.cos(a) * 0.53, 0, Math.sin(a) * 0.53, 0, 1.25, 0, 0.02, iron, 'metal'); }
    F.cyl(0, 1.18, 0, 0.035, 0.1, 0, F.shade(iron, 0.1), 'metal');
    F.rod(0, 1.2, 0, 0, 0.8, 0, 0.006, iron, 'metal');
    for (const s of [-1, 1]) F.beam(0, 0.8, 0, s * 0.275, 0.47, 0, 0.01, 0.01, iron, 'metal');
    F.frustum(0, 0.24, 0, 0.09, 0.2, 0.09, 0, F.shade(cop, -0.2), 'bronze', 16);
    F.frustum(0, 0.33, 0, 0.2, 0.255, 0.1, 0, cop, 'bronze', 16);
    F.cyl(0, 0.43, 0, 0.255, 0.05, 0, cop, 'bronze');
    SCYVOI_FX.ring(F, 0, 0.48, 0, 0.262, 20, 0.022, 0.022, F.shade(cop, 0.12), 'bronze', 'xz');
    F.cyl(0, 0.48, 0, 0.25, 0.012, 0, F.col('stew'), 'food');
    for (const s of [-1, 1]) F.box(s * 0.27, 0.44, 0, 0.03, 0.05, 0.06, 0, F.shade(cop, -0.15), 'bronze');
    for (let i = 0; i < 8; i++) {
      const a = i * F.TAU / 8 + 0.2;
      F.blob(Math.cos(a) * 0.36, 0.05, Math.sin(a) * 0.36, 0.08, 0.1, F.rnd() * 3, F.shade('stoneGrey', F.rr(-0.15, 0.1)), 'stone');
    }
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3;
      F.rod(Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3, Math.cos(a) * 0.03, 0.12, Math.sin(a) * 0.03, 0.03, F.shade('timberWalnutDark', -0.2), 'wood');
    }
    F.blob(0, 0.03, 0, 0.22, 0.05, 0, F.col('ember'), 'glow');
    F.cone(0, 0.04, 0, 0.09, 0.19, 0, F.col('flame'), 'glow');
    F.cone(0.07, 0.04, 0.04, 0.05, 0.13, 0, F.col('ember'), 'glow');
    F.lamp(0, 0.15, 0, 1.0, 8);
  }
});
FURN({
  key: 'scyvoi_smoke_bowl', name: 'Smoke bowl on a tripod', culture: 'scyvoi', tier: 'common', type: 'brazier', setting: 'indoor',
  rooms: ['shrine', 'hall', 'bedroom', 'antechamber'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['bronze', 'emissive', 'foliage', 'glass'],
  w: 0.4, d: 0.4, h: 0.7, variants: 1,
  build: function (F) {
    const brass = F.col('brass');
    const mids = [];
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      F.rod(c * 0.17, 0.0, s * 0.17, c * 0.07, 0.5, s * 0.07, 0.01, brass, 'bronze');
      F.cyl(c * 0.17, 0, s * 0.17, 0.02, 0.015, 0, brass, 'bronze');
      mids.push([c * 0.11, 0.3, s * 0.11]);
    }
    for (let i = 0; i < 3; i++) { const p = mids[i], q = mids[(i + 1) % 3]; F.rod(p[0], p[1], p[2], q[0], q[1], q[2], 0.006, brass, 'bronze'); }
    F.frustum(0, 0.48, 0, 0.05, 0.13, 0.09, 0, brass, 'bronze', 14);
    SCYVOI_FX.ring(F, 0, 0.565, 0, 0.128, 14, 0.014, 0.014, F.shade(brass, 0.1), 'bronze', 'xz');
    F.blob(0, 0.57, 0, 0.11, 0.03, 0, F.col('ember'), 'glow');
    for (let i = 0; i < 3; i++) F.box(F.rr(-0.05, 0.05), 0.578, F.rr(-0.05, 0.05), 0.06, 0.012, 0.02, F.rnd() * 3, F.col('herbGreen'), 'plant');
    F.blob(0.01, 0.62, 0, 0.04, 0.06, 0, F.col('smoke'), 'glass');
    F.blob(-0.01, 0.655, 0.01, 0.035, 0.06, 0, F.col('smoke'), 'glass');
    F.lamp(0, 0.6, 0, 0.3, 3);
  }
});

/* ====================================================================== Riders' gear */
FURN({
  key: 'scyvoi_saddle_rack', name: 'Salamander saddle on a rack', culture: 'scyvoi', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['hall', 'store', 'stable', 'yard', 'antechamber'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'hide', 'cloth', 'lacquer', 'bronze', 'metal'],
  w: 0.9, d: 1.4, h: 1.1, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), leather = F.col('leatherTan'), dark = F.col('leatherDark'), red = F.col('timberRed'), brass = F.col('brass');
    for (const z of [-0.55, 0.55]) for (const s of [-1, 1]) F.beam(s * 0.3, 0, z, 0, 0.78, z, 0.06, 0.06, wood, 'wood');
    F.box(0, 0.76, 0, 0.12, 0.08, 1.24, 0, wood, 'wood');
    F.box(0, 0.15, 0, 0.05, 0.05, 1.1, 0, F.shade(wood, -0.1), 'wood');
    /* the saddle cloth: felt with a teal border, side drapes and tassels */
    const felt = F.col('madder'), edge = F.col('teal');
    F.box(0, 0.838, 0, 0.86, 0.016, 0.9, 0, edge, 'cloth');
    F.box(0, 0.84, 0, 0.82, 0.02, 0.86, 0, felt, 'cloth');
    for (const s of [-1, 1]) {
      F.box(s * 0.41, 0.55, 0, 0.02, 0.3, 0.8, 0, felt, 'cloth');
      F.box(s * 0.41, 0.55, 0, 0.024, 0.05, 0.82, 0, edge, 'cloth');
      for (const z of [-0.38, 0.38]) SCYVOI_FX.tassel(F, s * 0.415, 0.55, z, 0.08, F.col('saffron'), edge);
    }
    /* the saddle: tree bars, seat, a red-lacquered pommel and a high cantle */
    for (const s of [-1, 1]) F.box(s * 0.27, 0.84, 0, 0.06, 0.06, 0.74, 0, dark, 'hide');
    F.box(0, 0.86, 0, 0.5, 0.08, 0.62, 0, leather, 'hide');
    F.box(0, 0.94, 0.02, 0.36, 0.04, 0.36, 0, F.col('crimson'), 'cloth');
    F.box(0, 0.86, 0.3, 0.3, 0.2, 0.08, 0, red, 'lacquer');
    F.box(0, 0.9, 0.345, 0.18, 0.12, 0.01, 0, brass, 'bronze');
    F.cyl(0, 1.06, 0.3, 0.03, 0.03, 0, brass, 'bronze');
    F.beam(0, 0.88, -0.3, 0, 1.06, -0.36, 0.44, 0.08, red, 'lacquer');
    F.rod(-0.22, 1.06, -0.36, 0.22, 1.06, -0.36, 0.014, brass, 'bronze');
    for (const x of [-0.14, 0, 0.14]) F.rod(x, 0.97, -0.29, x, 0.97, -0.28, 0.02, brass, 'bronze');
    /* stirrup leathers and irons */
    for (const s of [-1, 1]) {
      F.box(s * 0.425, 0.44, 0.05, 0.012, 0.44, 0.04, 0, dark, 'hide');
      SCYVOI_FX.ring(F, s * 0.43, 0.38, 0.05, 0.075, 10, 0.014, 0.014, F.col('ironBlack'), 'metal', 'zy', 0.07);
      F.box(s * 0.43, 0.305, 0.05, 0.06, 0.014, 0.1, 0, F.col('ironBlack'), 'metal');
    }
  }
});
FURN({
  key: 'scyvoi_tack_pegs', name: 'Tack on wall pegs', culture: 'scyvoi', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['stable', 'store', 'hall', 'antechamber', 'yard'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber', 'lacquer', 'cloth', 'hide', 'rope', 'metal', 'bronze'],
  w: 1.2, d: 0.2, h: 1.2, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), dark = F.col('leatherDark'), tan = F.col('leatherTan'), brass = F.col('brass'), iron = F.col('ironBlack');
    F.box(0, 0.2, -0.095, 1.1, 0.95, 0.01, 0, F.col('feltGrey'), 'cloth');
    F.box(0, 1.0, -0.075, 1.16, 0.1, 0.03, 0, wood, 'wood');
    for (const s of [-1, 1]) F.box(s * 0.56, 0.96, -0.075, 0.06, 0.16, 0.03, 0, F.col('timberRed'), 'lacquer');
    const pegs = [-0.42, -0.14, 0.14, 0.42];
    for (const x of pegs) { F.rod(x, 1.05, -0.06, x, 1.07, 0.05, 0.016, wood, 'wood'); F.cyl(x, 1.055, 0.055, 0.022, 0.025, 0, wood, 'wood'); }
    /* a bridle: cheek straps, a madder browband with brass rosettes, a noseband, the bit and the reins */
    let x = pegs[0];
    for (const s of [-1, 1]) F.beam(x + s * 0.03, 1.05, 0.03, x + s * 0.08, 0.62, 0.03, 0.025, 0.006, dark, 'hide');
    F.box(x, 0.88, 0.035, 0.17, 0.025, 0.006, 0, F.col('madder'), 'cloth');
    for (const o of [-0.06, 0, 0.06]) F.rod(x + o, 0.892, 0.036, x + o, 0.892, 0.045, 0.012, brass, 'bronze');
    F.box(x, 0.66, 0.035, 0.18, 0.025, 0.006, 0, dark, 'hide');
    F.rod(x - 0.1, 0.62, 0.04, x + 0.1, 0.62, 0.04, 0.007, iron, 'metal');
    for (const s of [-1, 1]) F.beam(x + s * 0.09, 0.62, 0.04, x, 0.3, 0.045, 0.02, 0.006, tan, 'hide');
    /* harness straps with buckles */
    x = pegs[1];
    for (let i = 0; i < 4; i++) {
      const o = -0.045 + i * 0.03, y1 = 0.42 + F.rr(-0.06, 0.06);
      F.beam(x + o * 0.5, 1.05, 0.02 + i * 0.006, x + o * 1.8, y1, 0.02 + i * 0.006, 0.04, 0.006, i % 2 ? tan : dark, 'hide');
      F.box(x + o * 1.4, 0.72 - i * 0.05, 0.03 + i * 0.006, 0.05, 0.04, 0.008, 0, brass, 'bronze');
    }
    /* a coil of rope */
    x = pegs[2];
    for (let i = 0; i < 3; i++) SCYVOI_FX.ring(F, x + (i - 1) * 0.012, 0.8 - i * 0.01, -0.03 + i * 0.025, 0.17 + i * 0.01, 12, 0.025, 0.025, F.shade('ropeHemp', i * 0.05 - 0.05), 'rope', 'xy');
    F.rod(x, 1.05, 0.03, x, 0.95, 0.03, 0.014, F.col('ropeHemp'), 'rope');
    /* a whip and a pouch */
    x = pegs[3];
    F.rod(x, 1.05, 0.04, x + 0.06, 0.75, 0.05, 0.014, F.col('timberRedDark'), 'lacquer');
    F.beam(x + 0.06, 0.75, 0.05, x + 0.1, 0.25, 0.04, 0.008, 0.008, dark, 'hide');
    F.beam(x, 1.05, 0.0, x - 0.04, 0.78, 0.0, 0.015, 0.006, dark, 'hide');
    F.box(x - 0.04, 0.58, 0.0, 0.18, 0.22, 0.08, 0, tan, 'hide');
    F.box(x - 0.04, 0.72, 0.0, 0.19, 0.08, 0.085, 0, dark, 'hide');
    F.rod(x - 0.04, 0.72, 0.04, x - 0.04, 0.72, 0.05, 0.015, brass, 'bronze');
  }
});
FURN({
  key: 'scyvoi_lance_stand', name: 'Lance stand with bow and quiver', culture: 'scyvoi', tier: 'common', type: 'weapon', setting: 'both',
  rooms: ['hall', 'antechamber', 'court', 'yard', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'lacquer', 'metal', 'bronze', 'hide', 'bone', 'cloth', 'rope'],
  w: 0.8, d: 0.5, h: 3.0, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), red = F.col('timberRed'), iron = F.col('ironBlack');
    F.box(0, 0, 0, 0.78, 0.08, 0.46, 0, wood, 'wood');
    for (const s of [-1, 1]) {
      F.box(s * 0.36, 0.08, 0, 0.06, 1.3, 0.06, 0, wood, 'wood');
      F.cyl(s * 0.36, 1.38, 0, 0.04, 0.03, 0, red, 'lacquer');
    }
    F.box(0, 1.2, 0, 0.78, 0.07, 0.1, 0, red, 'lacquer');
    /* three lances: iron heads, a hair tassel or a pennant under each */
    for (let i = 0; i < 3; i++) {
      const x = -0.2 + i * 0.2;
      F.cyl(x, 0.08, 0, 0.03, 0.004, 0, F.shade(wood, -0.4), 'wood');
      F.rod(x, 0.08, 0, x, 2.72, 0, 0.018, i === 1 ? red : F.col('timberPoplar'), i === 1 ? 'lacquer' : 'wood');
      F.cyl(x, 2.67, 0, 0.024, 0.05, 0, iron, 'metal');
      F.frustum(x, 2.72, 0, 0.022, 0.004, 0.26, 0, F.shade(iron, 0.25), 'metal', 4);
      if (i === 1) SCYVOI_FX.ribbon(F, x + 0.12, 2.6, 0, 0.2, 0.18, 0, 'madder');
      else F.frustum(x, 2.38, 0, 0.05, 0.02, 0.28, 0, F.col(i ? 'madder' : 'hairBlack'), 'hide', 8);
    }
    /* a recurve bow on two pegs across the front */
    for (const s of [-1, 1]) F.rod(s * 0.3, 0.96, 0.03, s * 0.3, 0.96, 0.12, 0.012, wood, 'wood');
    const bow = [];
    for (let i = 0; i <= 10; i++) {
      const t = -1 + i / 5, a = Math.abs(t);
      bow.push([0.36 * t, 0.98 + 0.07 * (1 - t * t) - (a > 0.75 ? (a - 0.75) * 0.3 : 0), 0.1]);
    }
    SCYVOI_FX.chain(F, bow, 0.026, 0.026, F.col('horn'), 'bone');
    F.box(0, 1.01, 0.1, 0.1, 0.05, 0.03, 0, F.col('leatherDark'), 'hide');
    F.rod(bow[0][0], bow[0][1], 0.1, bow[10][0], bow[10][1], 0.1, 0.003, F.col('ropeHemp'), 'rope');
    /* a quiver of arrows hung by its strap */
    const qx = -0.24, qz = 0.16;
    F.cyl(qx, 0.3, qz, 0.05, 0.45, 0, F.col('leatherTan'), 'hide');
    F.cyl(qx, 0.66, qz, 0.053, 0.04, 0, F.col('brass'), 'bronze');
    F.cyl(qx, 0.4, qz, 0.053, 0.03, 0, F.col('madder'), 'cloth');
    for (let i = 0; i < 5; i++) {
      const ox = F.rr(-0.025, 0.025), oz = F.rr(-0.025, 0.025), top = 0.88 + F.rr(0, 0.04);
      F.rod(qx + ox, 0.7, qz + oz, qx + ox * 1.4, top, qz + oz * 1.4, 0.005, F.col('timberPoplar'), 'wood');
      F.box(qx + ox * 1.4, top - 0.08, qz + oz * 1.4, 0.004, 0.07, 0.03, F.rnd() * 3, F.col(i % 2 ? 'madder' : 'feltWhite'), 'cloth');
    }
    F.beam(qx, 0.7, qz - 0.04, -0.36, 1.1, 0.03, 0.025, 0.006, F.col('leatherDark'), 'hide');
  }
});
FURN({
  key: 'scyvoi_water_skins', name: 'Water skins on a tripod', culture: 'scyvoi', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['yard', 'kitchen', 'store', 'stable'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'hide', 'rope'],
  w: 0.8, d: 0.8, h: 1.6, variants: 1,
  build: function (F) {
    const pole = F.col('timberPoplar'), rope = F.col('ropeHemp');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3, c = Math.cos(a), s = Math.sin(a);
      F.rod(c * 0.38, 0, s * 0.38, -c * 0.05, 1.6, -s * 0.05, 0.02, pole, 'wood');
    }
    F.cyl(0, 1.36, 0, 0.05, 0.1, 0, rope, 'rope');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 3, x = Math.cos(a) * 0.2, z = Math.sin(a) * 0.2;
      const skin = F.shade('leatherTan', F.rr(-0.3, -0.12));
      F.blob(x, 0.75, z, 0.13, 0.4, a, skin, 'hide');
      F.blob(x, 0.62, z, 0.11, 0.16, a, F.shade(skin, -0.2), 'hide');
      F.frustum(x, 0.94, z, 0.05, 0.03, 0.08, 0, skin, 'hide', 8);
      F.cyl(x, 0.99, z, 0.035, 0.02, 0, rope, 'rope');
      for (const t of [-0.6, 0.6]) {
        const lx = x + Math.cos(a + t) * 0.11, lz = z + Math.sin(a + t) * 0.11;
        F.rod(lx, 0.72, lz, lx * 1.1, 0.6, lz * 1.1, 0.02, skin, 'hide');
      }
      F.rod(x, 1.02, z, x * 0.15, 1.38, z * 0.15, 0.006, rope, 'rope');
    }
  }
});
FURN({
  key: 'scyvoi_fruit_baskets', name: 'Fire-fruit baskets', culture: 'scyvoi', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'market', 'yard', 'shop'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['wicker', 'food', 'foliage'],
  w: 1.0, d: 0.6, h: 0.5, variants: 2, variantNames: ['two baskets', 'a heaped tray and a tall basket'],
  build: function (F) {
    const wick = F.col('wicker'), leaf = F.col('leafGreen');
    if (!F.variant) {
      SCYVOI_FX.basket(F, -0.24, 0, 0.2, 0.25, 0.22, 0.07, ['fruitFire', 'fruitDeep', 'fruitFire'], wick, leaf);
      SCYVOI_FX.basket(F, 0.24, 0, 0.2, 0.25, 0.22, 0.07, ['fruitGold', 'fruitFire', 'fruitGold'], wick, leaf);
    } else {
      SCYVOI_FX.basket(F, -0.18, 0, 0.25, 0.29, 0.12, 0.11, ['fruitFire', 'fruitDeep', 'fruitGold'], wick, leaf);
      SCYVOI_FX.basket(F, 0.32, 0.02, 0.13, 0.16, 0.3, 0.05, ['fruitGold', 'fruitGold', 'fruitFire'], wick, leaf);
      for (const [x, z] of [[0.15, 0.22], [0.08, -0.2]]) SCYVOI_FX.fruit(F, x, 0.055, z, 0.05, F.pick(['fruitFire', 'fruitGold']), leaf);
    }
  }
});
FURN({
  key: 'scyvoi_supply_bales', name: 'Felt and wool bales', culture: 'scyvoi', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['store', 'yard', 'market', 'stable', 'shop'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['cloth', 'rope'],
  w: 1.2, d: 0.8, h: 0.9, variants: 1,
  build: function (F) {
    const rope = F.col('ropeHemp');
    const bale = function (x, y, z, w, h, d, col, alongX) {
      F.box(x, y, z, w, h, d, 0, col, 'cloth');
      F.box(x, y + 0.025, z, w + 0.02, h - 0.05, d - 0.05, 0, F.shade(col, -0.04), 'cloth');
      F.box(x, y + 0.025, z, w - 0.05, h - 0.05, d + 0.02, 0, F.shade(col, -0.04), 'cloth');
      for (const o of [-0.28, 0.28]) {
        if (alongX) F.box(x + o * w, y - 0.004, z, 0.03, h + 0.008, d + 0.03, 0, rope, 'rope');
        else F.box(x, y - 0.004, z + o * d, w + 0.03, h + 0.008, 0.03, 0, rope, 'rope');
      }
    };
    bale(-0.29, 0, 0, 0.55, 0.38, 0.74, F.col('feltGrey'), false);
    bale(0.29, 0, 0, 0.55, 0.38, 0.74, F.col('feltBrown'), false);
    bale(0, 0.38, 0, 0.9, 0.33, 0.5, F.col('indigo'), true);
    for (const x of [-0.37, -0.12, 0.12, 0.37]) F.box(x, 0.39, 0, 0.08, 0.31, 0.545, 0, F.col(Math.abs(x) > 0.2 ? 'madder' : 'saffron'), 'cloth');
    F.rod(-0.35, 0.8, 0, 0.35, 0.8, 0, 0.09, F.col('feltWhite'), 'cloth');
    for (const s of [-1, 1]) F.rod(s * 0.35, 0.8, 0, s * 0.36, 0.8, 0, 0.07, F.shade('feltWhite', -0.15), 'cloth');
    for (const x of [-0.2, 0.2]) F.rod(x - 0.015, 0.8, 0, x + 0.015, 0.8, 0, 0.094, rope, 'rope');
  }
});

/* ====================================================================== Felts and rugs */
FURN({
  key: 'scyvoi_wall_felt', name: 'Shyrdak felt hanging', culture: 'scyvoi', tier: 'common', type: 'banner', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine'], anchor: 'wall', clearance: {},
  materials: ['cloth', 'lacquer', 'bronze'],
  w: 1.6, d: 0.06, h: 1.4, variants: 2, variantNames: ['madder field, teal horns', 'teal field, madder horns'],
  build: function (F) {
    const v = F.variant;
    const field = F.col(v ? 'teal' : 'madder'), border = F.col(v ? 'madder' : 'indigo');
    F.box(0, 0.12, -0.02, 1.5, 1.22, 0.02, 0, border, 'cloth');
    const c = v
      ? { border: F.css(border), cord: F.css(F.col('feltCream')), field: F.css(field), horn: F.css(F.col('madder')), horn2: F.css(F.col('saffron')), small: F.css(F.col('teal')) }
      : { border: F.css(border), cord: F.css(F.col('feltCream')), field: F.css(field), horn: F.css(F.col('teal')), horn2: F.css(F.col('indigo')), small: F.css(F.col('madder')) };
    F.decal(0, 0.12, -0.0075, 1.5, 1.22, 0, 'scyvoi-shyrdak-' + v, function (g, W, H) { SCYVOI_FX.paintFelt(g, W, H, c); }, 'cloth');
    F.rod(-0.78, 1.37, -0.015, 0.78, 1.37, -0.015, 0.018, F.col('timberRed'), 'lacquer');
    for (const s of [-1, 1]) F.ball(s * 0.79, 1.37, -0.015, 0.022, F.col('brass'), 'bronze');
    for (let i = 0; i < 5; i++) F.box(-0.6 + i * 0.3, 1.32, -0.02, 0.06, 0.07, 0.024, 0, border, 'cloth');
    for (let i = 0; i < 7; i++) SCYVOI_FX.tassel(F, -0.66 + i * 0.22, 0.12, -0.02, 0.11, F.col(i % 2 ? 'teal' : 'saffron'), F.col('feltCream'));
  }
});
FURN({
  key: 'scyvoi_felt_rug_round', name: 'Round felt rug', culture: 'scyvoi', tier: 'common', type: 'rug', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'court', 'shrine', 'antechamber'], anchor: 'floor', clearance: {},
  materials: ['cloth'],
  w: 2.4, d: 2.4, h: 0.03, variants: 2, variantNames: ['madder border, teal field', 'indigo border, cream field'],
  build: function (F) {
    const v = F.variant;
    const border = F.col(v ? 'indigo' : 'madder'), field = F.col(v ? 'feltCream' : 'teal'), cord = F.col(v ? 'saffron' : 'feltCream');
    const horn = F.col(v ? 'madder' : 'saffron');
    F.cyl(0, 0, 0, 1.2, 0.02, 0, border, 'cloth');
    F.cyl(0, 0.002, 0, 1.06, 0.02, 0, cord, 'cloth');
    F.cyl(0, 0.004, 0, 1.02, 0.02, 0, field, 'cloth');
    F.cyl(0, 0.006, 0, 0.42, 0.02, 0, border, 'cloth');
    F.cyl(0, 0.008, 0, 0.36, 0.02, 0, cord, 'cloth');
    for (let i = 0; i < 12; i++) { const a = i * F.TAU / 12; SCYVOI_FX.hornFlat(F, Math.cos(a) * 1.11, 0.002, Math.sin(a) * 1.11, 0.1, a + (i % 2 ? Math.PI : 0), 0.018, cord, 'cloth'); }
    for (let i = 0; i < 4; i++) { const a = F.TAU / 8 + i * F.TAU / 4; SCYVOI_FX.hornFlat(F, Math.cos(a) * 0.72, 0.006, Math.sin(a) * 0.72, 0.3, a, 0.04, horn, 'cloth'); }
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4; SCYVOI_FX.hornFlat(F, Math.cos(a) * 0.2, 0.01, Math.sin(a) * 0.2, 0.16, a, 0.025, horn, 'cloth'); }
  }
});

/* ====================================================================== Work */
FURN({
  key: 'scyvoi_bellows', name: 'Forge bellows', culture: 'scyvoi', tier: 'common', type: 'workstation', setting: 'both', job: 'smithing',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { back: 0.5 },
  materials: ['timber', 'hide', 'metal'],
  w: 0.6, d: 1.0, h: 0.5, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), tan = F.col('leatherTan'), dark = F.col('leatherDark'), iron = F.col('ironBlack');
    for (const s of [-1, 1]) {
      F.box(s * 0.24, 0.1, 0, 0.05, 0.05, 0.9, 0, wood, 'wood');
      for (const z of [-0.4, 0.4]) F.box(s * 0.24, 0, z, 0.06, 0.12, 0.06, 0, F.shade(wood, -0.1), 'wood');
    }
    F.box(0, 0.15, -0.05, 0.46, 0.03, 0.7, 0, wood, 'wood');
    F.beam(0, 0.40, -0.38, 0, 0.215, 0.28, 0.46, 0.03, F.shade(wood, 0.08), 'wood');
    const yTop = (z) => 0.40 + (0.215 - 0.40) * (z + 0.38) / 0.66;
    for (let i = 0; i < 4; i++) {
      const z0 = -0.36 + i * 0.155, zc = z0 + 0.0775, hh = yTop(zc) - 0.18 - 0.02;
      F.box(0, 0.18, zc, i % 2 ? 0.41 : 0.44, hh, 0.155, 0, i % 2 ? dark : tan, 'hide');
    }
    F.rod(0, 0.2, 0.26, 0, 0.2, 0.44, 0.035, iron, 'metal');
    F.rod(0, 0.2, 0.44, 0, 0.2, 0.49, 0.02, F.shade(iron, 0.15), 'metal');
    for (const s of [-1, 1]) F.rod(s * 0.15, 0.40, -0.37, s * 0.15, 0.47, -0.45, 0.018, wood, 'wood');
    F.rod(-0.17, 0.48, -0.45, 0.17, 0.48, -0.45, 0.02, F.col('timberRed'), 'wood');
  }
});
FURN({
  key: 'scyvoi_tying_post', name: 'Salamander tying post', culture: 'scyvoi', tier: 'common', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'street', 'stable', 'market'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'timber', 'lacquer', 'metal', 'gold'],
  w: 0.5, d: 0.5, h: 2.2, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), red = F.col('timberRed'), teal = F.col('teal'), iron = F.col('ironBlack');
    F.frustum(0, 0, 0, 0.22, 0.18, 0.14, 0, F.col('stoneGrey'), 'stone', 6);
    F.frustum(0, 0.14, 0, 0.085, 0.07, 1.8, 0, wood, 'wood', 8);
    for (const y of [0.5, 1.55]) {
      F.cyl(0, y, 0, 0.092, 0.06, 0, red, 'lacquer');
      F.cyl(0, y - 0.02, 0, 0.09, 0.015, 0, teal, 'lacquer');
      F.cyl(0, y + 0.065, 0, 0.088, 0.015, 0, teal, 'lacquer');
    }
    F.box(0, 1.1, 0.075, 0.04, 0.03, 0.03, 0, iron, 'metal');
    SCYVOI_FX.ring(F, 0, 1.03, 0.1, 0.07, 10, 0.014, 0.014, iron, 'metal', 'xy');
    F.box(0.075, 1.3, 0, 0.03, 0.03, 0.04, 0, iron, 'metal');
    SCYVOI_FX.ring(F, 0.1, 1.23, 0, 0.07, 10, 0.014, 0.014, iron, 'metal', 'zy');
    /* the salamander head: flat skull, a wide snout, bulging gold eyes, a crest and gill frills */
    F.frustum(0, 1.94, 0, 0.07, 0.06, 0.06, 0, red, 'lacquer', 8);
    F.blob(0, 2.06, 0.03, 0.085, 0.11, 0, red, 'lacquer');
    F.beam(0, 2.05, 0.06, 0, 2.06, 0.2, 0.12, 0.07, red, 'lacquer');
    F.box(0, 2.035, 0.13, 0.13, 0.012, 0.13, 0, F.col('timberRedDark'), 'lacquer');
    for (const s of [-1, 1]) {
      F.ball(s * 0.055, 2.1, 0.07, 0.02, F.col('gold'), 'gold');
      F.box(s * 0.09, 2.02, -0.02, 0.02, 0.08, 0.06, s * 0.4, teal, 'lacquer');
    }
    for (let i = 0; i < 3; i++) F.cone(0, 2.1 - i * 0.02, 0.0 - i * 0.05, 0.02, 0.07 - i * 0.01, 0, teal, 'lacquer');
  }
});
FURN({
  key: 'scyvoi_tying_boulder', name: 'Carved tying boulder', culture: 'scyvoi', tier: 'common', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'street', 'stable', 'market'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'metal'],
  w: 1.4, d: 1.2, h: 1.0, variants: 1,
  build: function (F) {
    const stone = F.col('stoneGrey');
    const blobs = [[0, 0.46, 0, 0.58, 0.92], [0.22, 0.32, -0.08, 0.45, 0.64], [-0.35, 0.2, 0.15, 0.3, 0.4]];
    blobs.forEach(function (b, i) { F.blob(b[0], b[1], b[2], b[3], b[4], i * 1.1 + 0.3, F.shade(stone, -0.06 * i), 'stone'); });
    const surfZ = function (x, y) {
      let z = -1;
      for (const b of blobs) {
        const k = 1 - Math.pow((x - b[0]) / b[3], 2) - Math.pow((y - b[1]) / (b[4] / 2), 2);
        if (k > 0) z = Math.max(z, b[2] + b[3] * Math.sqrt(k));
      }
      return z + 0.004;
    };
    /* two pecked spirals on the front, wound opposite ways */
    for (const [cx, cy, dir] of [[-0.14, 0.5, 1], [0.2, 0.44, -1]]) {
      const pts = [];
      for (let i = 0; i <= 18; i++) {
        const t = i / 18, a = dir * t * 3.2 * Math.PI, r = 0.02 + 0.16 * t, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        pts.push([x, y, surfZ(x, y)]);
      }
      SCYVOI_FX.chain(F, pts, 0.026, 0.026, F.shade(stone, 0.22), 'stone');
    }
    const iron = F.col('ironBlack');
    F.box(0, 0.9, 0.08, 0.08, 0.04, 0.04, 0, iron, 'metal');
    SCYVOI_FX.ring(F, 0, 0.905, 0.18, 0.09, 10, 0.018, 0.018, iron, 'metal', 'xz');
  }
});

/* ====================================================================== The shaman's things */
FURN({
  key: 'scyvoi_spirit_pole', name: 'Shaman\'s spirit pole', culture: 'scyvoi', tier: 'common', type: 'statue', setting: 'outdoor',
  rooms: ['yard', 'street', 'temple', 'graveyard'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['stone', 'timber', 'lacquer', 'cloth', 'bronze', 'bone', 'hide'],
  w: 0.8, d: 0.8, h: 3.5, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), red = F.col('timberRed'), bone = F.col('boneIvory'), brass = F.col('brass');
    for (let i = 0; i < 6; i++) {
      const a = i * F.TAU / 6 + F.rr(-0.2, 0.2), hb = F.rr(0.16, 0.22);
      F.blob(Math.cos(a) * 0.2, hb / 2, Math.sin(a) * 0.2, F.rr(0.1, 0.13), hb, F.rnd() * 3, F.shade('stoneGrey', F.rr(-0.15, 0.1)), 'stone');
    }
    F.blob(0, 0.16, 0, 0.14, 0.32, 0, F.shade('stoneGrey', -0.1), 'stone');
    F.frustum(0, 0, 0, 0.07, 0.05, 3.05, 0, wood, 'wood', 8);
    for (const y of [1.2, 1.9]) F.cyl(0, y, 0, 0.065, 0.06, 0, red, 'lacquer');
    /* crossbars hung with ribbons and bells */
    F.rod(-0.3, 2.55, 0, 0.3, 2.55, 0, 0.02, red, 'lacquer');
    F.rod(0, 2.48, -0.3, 0, 2.48, 0.3, 0.02, red, 'lacquer');
    const ribbons = ['ribbonBlue', 'feltWhite', 'saffron', 'madder', 'teal', 'ribbonBlue'];
    for (let i = 0; i < 12; i++) {
      const alongX = i < 6, o = (i % 6 - 2.5) * 0.11, y = alongX ? 2.55 : 2.48;
      const px = alongX ? o : 0, pz = alongX ? 0 : o, L = F.rr(0.7, 1.0);
      SCYVOI_FX.ribbon(F, px, y - 0.02, pz, 0.045, L, alongX ? F.rr(-0.4, 0.4) : Math.PI / 2 + F.rr(-0.4, 0.4), ribbons[i % 6]);
    }
    for (const [x, z] of [[-0.29, 0], [0.29, 0], [0, -0.29], [0, 0.29]]) {
      const y = Math.abs(x) > 0 ? 2.55 : 2.48;
      F.rod(x, y, z, x, y - 0.12, z, 0.003, F.col('ropeHemp'), 'cloth');
      F.frustum(x, y - 0.17, z, 0.035, 0.012, 0.05, 0, brass, 'bronze', 10);
      F.cyl(x, y - 0.19, z, 0.008, 0.02, 0, F.shade(brass, -0.3), 'bronze');
    }
    F.frustum(0, 2.75, 0, 0.11, 0.05, 0.3, 0, F.col('hairBlack'), 'hide', 10);
    /* the horned skull on top */
    F.blob(0, 3.13, 0, 0.09, 0.14, 0, bone, 'bone');
    F.beam(0, 3.12, 0.04, 0, 3.04, 0.2, 0.09, 0.07, bone, 'bone');
    for (const s of [-1, 1]) F.box(s * 0.045, 3.13, 0.08, 0.03, 0.03, 0.012, 0, F.col('ironBlack'), 'bone');
    for (const s of [-1, 1]) SCYVOI_FX.chain(F, [[s * 0.05, 3.18, -0.01], [s * 0.09, 3.3, -0.06], [s * 0.12, 3.4, -0.14], [s * 0.15, 3.46, -0.24], [s * 0.17, 3.48, -0.33]], 0.045, 0.018, F.col('horn'), 'bone');
  }
});
FURN({
  key: 'scyvoi_shaman_drum', name: 'Shaman\'s frame drum on a stand', culture: 'scyvoi', tier: 'common', type: 'shrine', setting: 'indoor',
  rooms: ['shrine', 'hall', 'antechamber'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'hide', 'cloth', 'bronze', 'lacquer'],
  w: 0.7, d: 0.4, h: 1.1, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), hide = F.col('feltCream'), red = F.col('timberRed');
    for (const s of [-1, 1]) {
      F.box(s * 0.3, 0, 0, 0.06, 0.05, 0.4, 0, wood, 'wood');
      F.box(s * 0.3, 0.05, 0, 0.05, 0.95, 0.05, 0, wood, 'wood');
      F.cone(s * 0.3, 1.0, 0, 0.03, 0.1, 0, red, 'lacquer');
    }
    F.rod(-0.3, 0.97, 0, 0.3, 0.97, 0, 0.016, red, 'lacquer');
    const cy = 0.6, R = 0.25;
    for (let i = 0; i < 10; i++) {
      const y0 = -R + i * 2 * R / 10, y1 = y0 + 2 * R / 10, yi = Math.min(Math.abs(y0), Math.abs(y1)), hw = Math.sqrt(R * R - yi * yi);
      F.box(0, cy + y0, 0, hw * 2, y1 - y0, 0.02, 0, F.shade(hide, -0.08), 'hide');
    }
    const dc = { skin: F.css(F.shade(hide, -0.08)), ink: F.css(F.col('madderDark')) };
    F.decal(0, cy - 0.16, 0.0125, 0.32, 0.32, 0, 'scyvoi-drum', function (g, W, H) { SCYVOI_FX.paintDrum(g, W, H, dc); }, 'hide');
    SCYVOI_FX.ring(F, 0, cy, 0, R, 20, 0.03, 0.09, wood, 'wood', 'xy');
    F.beam(-0.17, cy - 0.17, -0.03, 0.17, cy + 0.17, -0.03, 0.012, 0.012, F.col('leatherDark'), 'hide');
    F.beam(0.17, cy - 0.17, -0.03, -0.17, cy + 0.17, -0.03, 0.012, 0.012, F.col('leatherDark'), 'hide');
    for (const s of [-1, 1]) {
      F.rod(s * 0.265, cy, 0, s * 0.3, cy, 0, 0.012, wood, 'wood');
      F.rod(s * 0.12, cy + 0.22, 0, s * 0.12, 0.97, 0, 0.004, F.col('ropeHemp'), 'cloth');
    }
    const rib = ['ribbonBlue', 'madder', 'saffron'];
    for (let i = 0; i < 3; i++) {
      const x = -0.08 + i * 0.08;
      SCYVOI_FX.ribbon(F, x, cy - R + 0.01, 0.03, 0.03, 0.18 + F.rr(0, 0.04), F.rr(-0.3, 0.3), rib[i]);
    }
    for (const x of [-0.15, 0.15]) F.frustum(x, cy - 0.27, 0.03, 0.025, 0.01, 0.035, 0, F.col('brass'), 'bronze', 8);
    F.rod(0.2, 0.05, 0.12, 0.1, 0.5, 0.16, 0.012, wood, 'wood');
    F.blob(0.2, 0.06, 0.12, 0.035, 0.06, 0, F.col('feltGrey'), 'cloth');
  }
});
FURN({
  key: 'scyvoi_bone_rack', name: 'Antler and skull rack', culture: 'scyvoi', tier: 'common', type: 'art', setting: 'indoor',
  rooms: ['shrine', 'hall', 'antechamber'], anchor: 'wall', clearance: {},
  materials: ['timber', 'hide', 'bone', 'rope'],
  w: 1.2, d: 0.3, h: 1.6, variants: 1,
  build: function (F) {
    const wood = F.col('timberWalnut'), bone = F.col('boneIvory'), horn = F.col('horn'), dark = F.col('ironBlack');
    for (const s of [-1, 1]) F.box(s * 0.55, 0, -0.13, 0.05, 1.6, 0.04, 0, wood, 'wood');
    for (const y of [0.1, 0.75, 1.4]) {
      F.box(0, y, -0.12, 1.16, 0.05, 0.05, 0, wood, 'wood');
      for (const s of [-1, 1]) F.box(s * 0.55, y - 0.01, -0.12, 0.07, 0.07, 0.07, 0.6, F.col('ropeHemp'), 'rope');
    }
    F.box(0, 0.2, -0.143, 1.0, 1.15, 0.01, 0, F.col('leatherTan'), 'hide');
    /* a pair of antlers on a plaque */
    F.box(0, 1.16, -0.1, 0.16, 0.2, 0.04, 0, F.shade(wood, -0.1), 'wood');
    F.blob(0, 1.26, -0.07, 0.05, 0.08, 0, bone, 'bone');
    for (const s of [-1, 1]) {
      const main = [[s * 0.04, 1.27, -0.06], [s * 0.2, 1.36, -0.02], [s * 0.32, 1.47, 0.03], [s * 0.38, 1.57, 0.06]];
      SCYVOI_FX.chain(F, main, 0.032, 0.016, bone, 'bone');
      for (let i = 1; i < 3; i++) F.beam(main[i][0], main[i][1], main[i][2], main[i][0] - s * 0.04, main[i][1] + 0.12, main[i][2] + 0.02, 0.014, 0.014, bone, 'bone');
    }
    /* a shelf of small skulls */
    F.box(0, 0.8, -0.06, 1.1, 0.03, 0.16, 0, wood, 'wood');
    for (const x of [-0.32, 0, 0.32]) {
      F.blob(x, 0.88, -0.03, 0.06, 0.09, 0, bone, 'bone');
      F.box(x, 0.835, 0.02, 0.05, 0.04, 0.1, 0, F.shade(bone, -0.05), 'bone');
      for (const s of [-1, 1]) F.box(x + s * 0.025, 0.885, 0.025, 0.02, 0.02, 0.01, 0, dark, 'bone');
    }
    for (const s of [-1, 1]) SCYVOI_FX.chain(F, [[s * 0.03, 0.92, -0.04], [s * 0.08, 0.98, -0.06], [s * 0.1, 0.96, 0.0], [s * 0.07, 0.92, 0.03]], 0.02, 0.012, horn, 'bone');
    /* ram's horns hung low */
    for (const s of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 9; i++) {
        const t = i / 9, a = Math.PI / 2 + s * t * 1.7 * Math.PI, r = 0.13 - 0.08 * t;
        pts.push([s * 0.25 + Math.cos(a) * r * s, 0.42 + Math.sin(a) * r, -0.06 + t * 0.05]);
      }
      SCYVOI_FX.chain(F, pts, 0.05, 0.016, horn, 'bone');
    }
  }
});
FURN({
  key: 'scyvoi_herb_bundles', name: 'Drying herb bundles', culture: 'scyvoi', tier: 'common', type: 'supply', setting: 'indoor',
  rooms: ['kitchen', 'store', 'shrine', 'hall'], anchor: 'ceiling', clearance: {},
  materials: ['timber', 'rope', 'foliage', 'metal'],
  w: 1.0, d: 0.2, h: 0.6, variants: 1,
  build: function (F) {
    const rope = F.col('ropeHemp');
    for (const s of [-1, 1]) {
      F.cyl(s * 0.42, 0.585, 0, 0.02, 0.015, 0, F.col('ironBlack'), 'metal');
      F.rod(s * 0.42, 0.59, 0, s * 0.42, 0.5, 0, 0.006, rope, 'rope');
    }
    F.rod(-0.48, 0.5, 0, 0.48, 0.5, 0, 0.015, F.col('timberWalnut'), 'wood');
    const herbs = ['herbGreen', 'herbSage', 'herbDry', 'herbRed', 'herbGreen', 'herbDry'];
    for (let i = 0; i < 6; i++) {
      const x = -0.38 + i * 0.152, z = F.rr(-0.03, 0.03), c = F.col(herbs[i]);
      F.cyl(x, 0.44, z, 0.02, 0.06, 0, rope, 'rope');
      F.frustum(x, 0.12, z, 0.07, 0.02, 0.32, F.rnd() * 3, c, 'plant', 8);
      F.blob(x, 0.12, z, 0.075, 0.08, F.rnd() * 3, F.shade(c, 0.08), 'plant');
      for (let k = 0; k < 2; k++) F.box(x + F.rr(-0.05, 0.05), 0.08, z + F.rr(-0.04, 0.04), 0.012, 0.06, 0.012, F.rnd() * 3, F.shade(c, -0.1), 'plant');
    }
  }
});

/* training furniture (FK.ROLES.training, 2026-10): a melee and a ranged practice piece in this culture's style sheet, keyed scyvoi_training_<role> */
FK.set({ culture: 'scyvoi', tier: 'common', roles: 'training', prefix: 'scyvoi_training_', S: SCYVOI_COMMON, names: {
  training_dummy: 'Felt practice dummy', archery_butt: 'Felt-ring target' } });
