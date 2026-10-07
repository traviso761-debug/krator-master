/* ======================================================================
   Ash Nomad furniture: common and court tiers, the trade roles, and the
   bespoke tent furnishings the Ash Nomads building kit places by key.
   The Ash Nomads wander the ash plains round the great volcano, cousins
   of the Chichani and the Zeijani of Dhelv. They ride staghorn beetles,
   herd millipedes (for chitin and grubs) and a pig-sized six-legged
   runner (hides, eggs, meat); they use no carts. Tents black to grey
   outside with ornate yellow and red patterns; inside, the yellow-red
   palette: chitin furniture and vessels, hanging banners, paper and
   chitin lanterns, ash and dust screens. Patterns are a cross of Nazca
   line figures (birds, spirals, the beetle) and Dunmer key-and-step
   frets. Influences: Nazca; Morrowind Ashlander and Dunmer; Bedouin.
   No socket pack yet: the hangings draw the 'triskele' symbol (three spirals).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('ashnomad', { name: 'Ash Nomads', pack: null, influences: 'Nazca; Morrowind Ashlander and Dunmer; Bedouin',
  materials: 'chitin (beetle and millipede), hide, felt, ash-grey and black cloth, bone, black iron, red clay, paper; court: lacquered chitin, gold, red and yellow silk',
  palette: {
    clothBlack: 0x24221f, clothCharcoal: 0x3a3733, clothAsh: 0x77736c, clothAshPale: 0xa8a39a,
    ochre: 0xd49a24, ochreDark: 0xa8741a, yellow: 0xe6b830, red: 0xa82a1e, redDark: 0x6e1a14, rust: 0x8e3e1e, vermilion: 0xc8401e,
    bone: 0xe2d6bc, boneDark: 0xb8a888, chitin: 0x4a3a2a, chitinDark: 0x2a2018, chitinAmber: 0x8a5a24, chitinGreen: 0x3a4a30,
    hide: 0x8a6444, hideDark: 0x5a3e28, paper: 0xe8c878, paperRed: 0xc8502a, ironBlack: 0x2a2826, gold: 0xc89a3a,
    timberAsh: 0x6a5a48, timberDark: 0x3e3226, clayRed: 0x9a4a30, ropeHemp: 0xa8926a, stoneDark: 0x3e3c38, stoneGrey: 0x6a6660,
    flame: 0xffb04a, ember: 0xe0521e, grub: 0xe8dcb0, egg: 0xd8ccb0, meat: 0x8a3a2a, ash: 0x8a8680,
    chitinGlow: 0xf2a838, reed: 0xb89a5e, reedDark: 0x7e6a40, basket: 0xa8844e, gourd: 0xc8a050, fodder: 0x7e7a3e, straw: 0xb8a468,
    herbGreen: 0x5e7034, herbSage: 0x8a9670, herbDry: 0xa8985a, herbRed: 0x9a3020, candle: 0xeee2c4, smoke: 0xc8c4bc,
    liquor: 0x2e1c10, lime: 0xe6e2d6, barkChip: 0x7a5434, hideRaw: 0xcaa88a, hideFat: 0xe0cdb0, hideTanned: 0x8e5a30, hideSmoked: 0x6a4024,
    grubWine: 0x6a2030, teaHerb: 0x8a5a1e, meatDark: 0x5a2418, coal: 0x1c1a18
  } });
/* END PALETTE */

const ASHNOMAD_COMMON = {
  sym: 'triskele',
  emblem: { field: 'clothBlack', edge: 'red', band: 'ochre', ink: 'yellow', ink2: 'red' },
  wood: 'chitin', woodDark: 'chitinDark', woodLight: 'boneDark', woodFam: 'wood',
  cloth: ['clothCharcoal', 'red', 'ochre', 'clothAsh'], clothFam: 'cloth',
  accent: 'bone', accentFam: 'bone', metal: 'ironBlack', metalFam: 'metal',
  clay: 'clayRed', clayFam: 'stone', stone: 'stoneDark', stoneFam: 'stone', rope: 'ropeHemp',
  flame: 'flame', ember: 'ember', lampCol: 'paper',
  legs: 'block', motif: 'chevron', bedBase: 'plank', seat: 'cushion', finial: 'ball',
  hearth: 'iron', fire: 'bowl', lamp: 'lantern', rug: 'woven', screen: 'cloth', store: 'sacks',
  shelfFill: 'bundles', rack: 'weapons', art: 'shield', art2: 'plate', statue: 'totem', tapestry: 'chevrons',
  canopy: false, board: 'hide'
};
const ASHNOMAD_COURT = Object.assign({}, ASHNOMAD_COMMON, {
  emblem: { field: 'clothBlack', edge: 'gold', band: 'red', disc: 'ochre', ink: 'yellow', ink2: 'gold' },
  wood: 'chitinAmber', woodDark: 'chitinDark', woodFam: 'lacquer',
  cloth: ['red', 'yellow', 'clothBlack', 'ochre'],
  accent: 'gold', accentFam: 'gold', finial: 'disc', rug: 'knotted', tapestry: 'medallion', canopy: true
});
FK.set({ culture: 'ashnomad', tier: 'common', S: ASHNOMAD_COMMON, names: {
  bed: 'Hide sleeping pallet', bench: 'Chitin bench', chair: 'Chitin camp chair', stool: 'Carapace stool', table: 'Chitin trestle table',
  low_table: 'Low chitin table', desk: 'Writing board', chest: 'Chitin-plated chest', bookcase: 'Bundle shelves', wall_shelves: 'Hanging shelves',
  store: 'Hide saddle-bags', hearth: 'Iron fire-box', fire: 'Iron fire-bowl', lamp: 'Paper lantern on a stand', candle: 'Clay grease lamp',
  hanging: 'Hanging paper lantern', rug: 'Woven rug', screen: 'Ash screen', counter: 'Trade counter', workbench: 'Chitin-cutter\'s bench',
  loom: 'Ground loom', rack: 'Spear pegs', ladder: 'Ladder', board: 'Hide board', art: 'Painted hide shield', banner: 'Hanging banner',
  scroll: 'Painted hide scroll', pennants: 'Ribbon pennants', bowl: 'Chitin bowl', jug: 'Red clay jug and cups', books: 'Bundled scrolls' } });
FK.set({ culture: 'ashnomad', tier: 'court', S: ASHNOMAD_COURT, names: {
  bed: 'Chieftain\'s canopy pallet', throne: 'Chieftain\'s carapace seat', divan: 'Chieftain\'s divan', table: 'Feast table', low_table: 'Lacquered low table',
  desk: 'Chieftain\'s writing board', cabinet: 'Lacquered chitin cabinet', bookcase: 'Chieftain\'s shelves', hearth: 'Great iron fire-box', fire: 'Gilt fire-bowl',
  lamp: 'Gilt lantern on a stand', candelabra: 'Bone candelabra', hanging: 'Hanging gilt lantern', carpet: 'Great knotted carpet', screen: 'Lacquered ash screen',
  tapestry: 'Medallion banner', banner: 'Chieftain\'s banner', frieze: 'Felt frieze', wall_rug: 'Knotted wall carpet', scroll: 'Painted hide scroll',
  painted_hanging: 'Painted hide hanging', art: 'Gilt mandibles', statue: 'Ancestor pole', jug: 'Gilt ewer and cups', bowl: 'Gilt chitin bowl' } });
/* trades and households (FK.ROLES.trade): keyed ashnomad_trade_<role> */
FK.set({ culture: 'ashnomad', tier: 'common', roles: 'trade', prefix: 'ashnomad_trade_', S: ASHNOMAD_COMMON, names: {
  forge: 'Smith\'s forge', anvil: 'Anvil on a stone', trough: 'Grub trough', stall: 'Beetle stall', hayrack: 'Fodder rack',
  display: 'Chitin-trader\'s display', armour_stand: 'Chitin armour on a stand', weapon_rack: 'Spear and blade rack', vat: 'Dye vat',
  still: 'Grub-wine still', bin: 'Grain bins', larder: 'Hanging larder', bunk: 'Herders\' bunk', locker: 'Chitin locker',
  lathe: 'Bow lathe', press: 'Chitin press', kiln: 'Potter\'s kiln', grindstone: 'Grindstone', altar: 'Ancestor altar', barrel: 'Jar rack' } });

/* ---------------------------------------------------------------------- bespoke pieces
   The Ash Nomads building kit (kits/ash-nomads) places these by key: see its README for the list. */

/* ---------------------------------------------------------------------- shared shapes
   The canvas painters take CSS colours; the 3D helpers draw through the frame F they are handed and take colours,
   not palette keys. Chitin (beetle carapace, millipede plate) is the glossy 'lacquer' family; bone 'bone'; hide 'hide'. */
const ASHNOMAD_FX = {
  /* a step-fret band (Nazca and Dunmer): a base line, squared hooks and stepped pyramids, in ink, inside (x0, y0, W, H) */
  fret: function (g, x0, y0, W, H, ink) {
    const u = H / 5, P = 9 * u;
    g.save(); g.beginPath(); g.rect(x0, y0, W, H); g.clip();
    g.fillStyle = ink; g.strokeStyle = ink; g.lineWidth = u * 0.8; g.lineJoin = 'miter'; g.lineCap = 'butt';
    g.fillRect(x0, y0 + H - 0.8 * u, W, 0.8 * u);
    for (let ox = x0 - u; ox < x0 + W; ox += P) {
      g.beginPath(); g.moveTo(ox + u, y0 + H - 0.4 * u); g.lineTo(ox + u, y0 + 0.6 * u); g.lineTo(ox + 4.4 * u, y0 + 0.6 * u);
      g.lineTo(ox + 4.4 * u, y0 + 3.0 * u); g.lineTo(ox + 2.6 * u, y0 + 3.0 * u); g.lineTo(ox + 2.6 * u, y0 + 1.9 * u); g.stroke();
      const cx = ox + 6.9 * u;
      for (let k = 0; k < 3; k++) g.fillRect(cx - (0.45 + 0.6 * k) * u, y0 + (1.0 + 1.1 * k) * u, (0.9 + 1.2 * k) * u, 1.15 * u);
    }
    g.restore();
  },
  /* an open spiral from the centre out, `turns` round, starting at angle a0 */
  spiral: function (g, cx, cy, R, turns, ink, lw, a0) {
    g.strokeStyle = ink; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath();
    const n = Math.round(40 * turns);
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = (a0 || 0) + t * turns * Math.PI * 2, r = R * (0.08 + 0.92 * t), px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
      if (i) g.lineTo(px, py); else g.moveTo(px, py);
    }
    g.stroke();
  },
  /* a stepped lozenge: three concentric diamonds, a and b alternating */
  diamond: function (g, cx, cy, s, a, b) {
    for (let k = 0; k < 3; k++) {
      const r = s * (1 - k / 3);
      g.fillStyle = k % 2 ? b : a; g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx + r, cy); g.lineTo(cx, cy + r); g.lineTo(cx - r, cy); g.closePath(); g.fill();
    }
  },
  /* a Nazca line figure, R its half-height: 'bird' (the hummingbird), 'beetle', 'monkey' or 'spiral'. Drawn twice, a fat
     line in one colour then a thin one in another, it reads as a two-tone figure. cut: the beetle's seam and spots */
  figure: function (g, kind, cx, cy, R, ink, lw, cut) {
    g.save(); g.translate(cx, cy); g.scale(R, R);
    g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = lw / R; g.lineCap = 'round'; g.lineJoin = 'round';
    const L = function (pts) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); };
    const E = function (x, y, rx, ry, fill) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); if (fill) g.fill(); g.stroke(); };
    if (kind === 'bird') {
      L([[0, -0.36], [0, -1]]);
      E(0, -0.28, 0.09, 0.09, true);
      E(0, 0.02, 0.12, 0.24, false);
      for (const s of [-1, 1]) {
        const a0 = [s * 0.1, -0.08], a1 = [s * 0.95, -0.52], b0 = [s * 0.11, 0.1], b1 = [s * 0.98, -0.3];
        L([a0, a1, b1, b0]);
        for (let k = 1; k < 5; k++) { const t = k / 5; L([[a0[0] + (a1[0] - a0[0]) * t, a0[1] + (a1[1] - a0[1]) * t], [b0[0] + (b1[0] - b0[0]) * t, b0[1] + (b1[1] - b0[1]) * t]]); }
        L([[s * 0.05, 0.24], [s * 0.2, 0.82], [s * 0.07, 0.62]]);
      }
    } else if (kind === 'beetle') {
      E(0, 0.18, 0.36, 0.48, true);
      E(0, -0.36, 0.25, 0.14, true);
      E(0, -0.54, 0.12, 0.08, true);
      for (const s of [-1, 1]) {
        L([[s * 0.06, -0.58], [s * 0.2, -0.82], [s * 0.1, -1.0]]);
        L([[s * 0.15, -0.74], [s * 0.3, -0.8]]);
        L([[s * 0.24, -0.36], [s * 0.55, -0.5], [s * 0.6, -0.72]]);
        L([[s * 0.32, 0.0], [s * 0.7, 0.06], [s * 0.82, -0.1]]);
        L([[s * 0.3, 0.42], [s * 0.58, 0.66], [s * 0.62, 0.9]]);
      }
      if (cut) {
        g.strokeStyle = cut; g.fillStyle = cut; g.lineWidth = Math.max(0.04, lw / R * 0.6);
        L([[0, -0.3], [0, 0.62]]);
        for (const s of [-1, 1]) for (const y of [0.05, 0.36]) { g.beginPath(); g.arc(s * 0.17, y, 0.06, 0, Math.PI * 2); g.fill(); }
      }
    } else if (kind === 'monkey') {
      E(0, -0.62, 0.13, 0.13, false);
      E(0, -0.2, 0.17, 0.27, false);
      L([[-0.14, -0.36], [-0.5, -0.62], [-0.66, -0.46]]);
      for (let k = 0; k < 4; k++) { const a = -2.2 + k * 0.45; L([[-0.66, -0.46], [-0.66 + 0.12 * Math.cos(a), -0.46 + 0.12 * Math.sin(a)]]); }
      L([[0.14, -0.34], [0.48, -0.16], [0.6, -0.3]]);
      for (let k = 0; k < 4; k++) { const a = -1.4 + k * 0.45; L([[0.6, -0.3], [0.6 + 0.12 * Math.cos(a), -0.3 + 0.12 * Math.sin(a)]]); }
      L([[-0.1, 0.05], [-0.3, 0.4], [-0.18, 0.58]]); L([[0.1, 0.05], [0.24, 0.42], [0.38, 0.5]]);
      L([[0.02, 0.07], [0.04, 0.55]]);
      ASHNOMAD_FX.spiral(g, 0.34, 0.55, 0.3, 2.5, ink, lw / R, 0);
    } else {
      ASHNOMAD_FX.spiral(g, 0, 0, 0.92, 3, ink, lw / R, 0);
    }
    g.restore();
  },
  /* a long banner: black field, red edges, fret bands top and bottom, the figure in red and yellow, stepped lozenges */
  paintBanner: function (g, W, H, c, kind) {
    g.fillStyle = c.field; g.fillRect(0, 0, W, H);
    const e = Math.max(3, Math.round(W * 0.07)), b = Math.round(W * 0.2);
    g.fillStyle = c.ink2; g.fillRect(0, 0, e, H); g.fillRect(W - e, 0, e, H);
    for (const y of [Math.round(b * 0.5), H - Math.round(b * 1.5)]) { g.fillStyle = c.ink2; g.fillRect(e, y, W - 2 * e, b); ASHNOMAD_FX.fret(g, e, y + b * 0.12, W - 2 * e, b * 0.76, c.ink); }
    const top = b * 1.8, bot = H - b * 1.8, R = Math.min(W * 0.36, (bot - top) * 0.3), cy = (top + bot) / 2;
    ASHNOMAD_FX.figure(g, kind, W / 2, cy, R, c.ink2, R * 0.16);
    ASHNOMAD_FX.figure(g, kind, W / 2, cy, R, c.ink, R * 0.07, c.field);
    const s = Math.min(W * 0.12, (cy - R - top) * 0.4);
    ASHNOMAD_FX.diamond(g, W / 2, top + (cy - R - top) / 2, s, c.ink, c.ink2);
    ASHNOMAD_FX.diamond(g, W / 2, bot - (bot - cy - R) / 2, s, c.ink, c.ink2);
  },
  /* a narrow strip (a drape, a saddle cloth): edged, stepped lozenges alternating with spirals */
  paintStrip: function (g, W, H, c) {
    g.fillStyle = c.ink2; g.fillRect(0, 0, W, H);
    const e = Math.max(2, Math.round(Math.min(W, H) * 0.1));
    g.fillStyle = c.field; g.fillRect(e, e, W - 2 * e, H - 2 * e);
    const vert = H >= W, L = vert ? H : W, S = vert ? W : H, n = Math.max(2, Math.round((L - 2 * e) / (S * 0.9)));
    for (let i = 0; i < n; i++) {
      const t = e + (L - 2 * e) * (i + 0.5) / n, cx = vert ? W / 2 : t, cy = vert ? t : H / 2;
      if (i % 2) ASHNOMAD_FX.spiral(g, cx, cy, S * 0.3, 2, c.ink, Math.max(1.5, S * 0.05));
      else ASHNOMAD_FX.diamond(g, cx, cy, S * 0.32, c.ink, c.ink2);
    }
  },
  /* a front panel (a chest, an altar cloth, a dais): fret bands top and bottom, a figure in the middle, lozenges either side */
  paintFront: function (g, W, H, c, kind) {
    g.fillStyle = c.field; g.fillRect(0, 0, W, H);
    const b = Math.max(6, Math.round(H * 0.2));
    for (const y of [0, H - b]) { g.fillStyle = c.ground; g.fillRect(0, y, W, b); ASHNOMAD_FX.fret(g, 0, y + b * 0.12, W, b * 0.76, c.ink); }
    const R = (H - 2 * b) * 0.42, cy = H / 2;
    if (kind) { ASHNOMAD_FX.figure(g, kind, W / 2, cy, R, c.ink2, R * 0.18); ASHNOMAD_FX.figure(g, kind, W / 2, cy, R, c.ink, R * 0.08, c.field); }
    for (const s of [-1, 1]) for (let x = W / 2 + s * R * 2.4; x > R * 0.6 && x < W - R * 0.6; x += s * R * 2.2) ASHNOMAD_FX.diamond(g, x, cy, R * 0.6, c.ink, c.ink2);
  },
  /* a screen panel: 'reed' (woven reed, a black band with a red fret, spirals) or 'hide' (painted hide, a figure) */
  paintPanel: function (g, W, H, c, kind, i) {
    g.fillStyle = c.ground; g.fillRect(0, 0, W, H);
    if (kind === 'reed') {
      g.fillStyle = c.line; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
      for (let x = W / 6; x < W; x += W / 3) g.fillRect(x - 1, 0, 2, H);
      const b = H * 0.08;
      g.fillStyle = c.field; g.fillRect(0, H / 2 - b, W, 2 * b); ASHNOMAD_FX.fret(g, 0, H / 2 - b * 0.8, W, b * 1.6, c.ink);
      for (const y of [H * 0.08, H * 0.86]) { g.fillStyle = c.field; g.fillRect(0, y, W, H * 0.06); ASHNOMAD_FX.fret(g, 0, y + 1, W, H * 0.06 - 2, c.ink2); }
      for (const y of [H * 0.29, H * 0.71]) ASHNOMAD_FX.spiral(g, W / 2, y, W * 0.24, 2.5, c.field, Math.max(2, W * 0.035), i);
    } else {
      g.strokeStyle = c.ink2; g.lineWidth = Math.max(2, W * 0.04); g.strokeRect(W * 0.06, H * 0.03, W * 0.88, H * 0.94);
      for (const y of [H * 0.06, H * 0.87]) ASHNOMAD_FX.fret(g, W * 0.1, y, W * 0.8, H * 0.07, c.ink2);
      const kind2 = ['bird', 'beetle', 'monkey'][i % 3], R = Math.min(W * 0.38, H * 0.3);
      ASHNOMAD_FX.figure(g, kind2, W / 2, H / 2, R, c.ink2, R * 0.15);
      ASHNOMAD_FX.figure(g, kind2, W / 2, H / 2, R, c.ink, R * 0.065, c.ground);
    }
  },
  /* the wall hanging: a fret above and below, three medallions (spiral, beetle, hummingbird) */
  paintHanging: function (g, W, H, c) {
    g.fillStyle = c.field; g.fillRect(0, 0, W, H);
    const b = Math.round(H * 0.12);
    for (const y of [0, H - b]) { g.fillStyle = c.ground; g.fillRect(0, y, W, b); ASHNOMAD_FX.fret(g, 0, y + b * 0.12, W, b * 0.76, c.ink); }
    g.fillStyle = c.ink; g.fillRect(0, b, W, 2); g.fillRect(0, H - b - 2, W, 2);
    const kinds = ['spiral', 'beetle', 'bird'], R = Math.min(W / 6, (H - 2 * b) / 2) * 0.78;
    for (let i = 0; i < 3; i++) {
      const cx = W * (i + 0.5) / 3, cy = H / 2;
      g.fillStyle = c.ground; g.beginPath(); g.arc(cx, cy, R * 1.08, 0, Math.PI * 2); g.fill();
      g.fillStyle = c.disc; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
      ASHNOMAD_FX.figure(g, kinds[i], cx, cy, R * 0.74, c.field, R * 0.09, c.disc);
    }
    for (const x of [W / 3, 2 * W / 3]) ASHNOMAD_FX.diamond(g, x, H / 2, R * 0.28, c.ink, c.ground);
  },
  /* the war standard: a sun-disc of red and yellow rays over a hummingbird, frets, gilt edges */
  paintSun: function (g, W, H, c) {
    g.fillStyle = c.field; g.fillRect(0, 0, W, H);
    const e = Math.max(3, Math.round(W * 0.05)), b = Math.round(W * 0.16);
    g.fillStyle = c.edge; g.fillRect(0, 0, e, H); g.fillRect(W - e, 0, e, H);
    for (const y of [Math.round(b * 0.4), H - Math.round(b * 1.4)]) { g.fillStyle = c.ink2; g.fillRect(e, y, W - 2 * e, b); ASHNOMAD_FX.fret(g, e, y + b * 0.12, W - 2 * e, b * 0.76, c.ink); }
    const cx = W / 2, cy = H * 0.4, R = W * 0.38;
    for (let k = 0; k < 16; k++) {
      const a = k * Math.PI / 8, a1 = a - Math.PI / 16, a2 = a + Math.PI / 16, ro = R * (k % 2 ? 0.86 : 1);
      g.fillStyle = k % 2 ? c.ink2 : c.ink; g.beginPath(); g.moveTo(cx + Math.cos(a1) * R * 0.6, cy + Math.sin(a1) * R * 0.6);
      g.lineTo(cx + Math.cos(a) * ro, cy + Math.sin(a) * ro); g.lineTo(cx + Math.cos(a2) * R * 0.6, cy + Math.sin(a2) * R * 0.6); g.closePath(); g.fill();
    }
    g.fillStyle = c.ink; g.beginPath(); g.arc(cx, cy, R * 0.62, 0, Math.PI * 2); g.fill();
    g.strokeStyle = c.ink2; g.lineWidth = R * 0.05; g.beginPath(); g.arc(cx, cy, R * 0.52, 0, Math.PI * 2); g.stroke();
    ASHNOMAD_FX.spiral(g, cx, cy, R * 0.4, 2.5, c.ink2, R * 0.06);
    ASHNOMAD_FX.figure(g, 'bird', cx, H * 0.7, W * 0.22, c.ink2, W * 0.035);
    ASHNOMAD_FX.figure(g, 'bird', cx, H * 0.7, W * 0.22, c.ink, W * 0.015);
  },
  /* a drum skin: a ring of dots round a beetle, spirals in the corners */
  paintDrum: function (g, W, H, c) {
    g.fillStyle = c.skin; g.fillRect(0, 0, W, H);
    g.fillStyle = c.ink2;
    for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; g.beginPath(); g.arc(W / 2 + Math.cos(a) * W * 0.42, H / 2 + Math.sin(a) * H * 0.42, W * 0.025, 0, Math.PI * 2); g.fill(); }
    ASHNOMAD_FX.figure(g, 'beetle', W / 2, H / 2, W * 0.32, c.ink, W * 0.02, c.skin);
  },
  /* ---- 3D ---- */
  /* a closed ring of n beams: plane 'xy' (faces z), 'zy' (faces x) or 'xz' (lies flat); R2 its second radius */
  ring: function (F, cx, cy, cz, R, n, w, d, col, fam, plane, R2) {
    const Q = R2 || R, pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (i + 0.5) * F.TAU / n, c = Math.cos(a), s = Math.sin(a);
      pts.push(plane === 'xz' ? [cx + c * R, cy, cz + s * Q] : plane === 'zy' ? [cx, cy + s * Q, cz + c * R] : [cx + c * R, cy + s * Q, cz]);
    }
    for (let i = 0; i < n; i++) F.beam(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0], pts[i + 1][1], pts[i + 1][2], w, d, col, fam);
  },
  /* a run of beams through points, width tapering w0 -> w1 */
  chain: function (F, pts, w0, w1, col, fam) {
    for (let i = 0; i < pts.length - 1; i++) {
      const w = w0 + (w1 - w0) * i / Math.max(1, pts.length - 2);
      F.beam(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0], pts[i + 1][1], pts[i + 1][2], w, w, col, fam);
    }
  },
  /* a tassel hanging from (x, y, z), len long: a knot and a skirt */
  tassel: function (F, x, y, z, len, col, knot, fam) {
    fam = fam || 'cloth';
    F.frustum(x, y - len * 0.3, z, len * 0.09, len * 0.07, len * 0.3, 0, knot, fam, 6);
    F.cone(x, y - len, z, len * 0.17, len * 0.72, 0, col, fam);
  },
  /* a ribbon hanging straight down from (x, y, z): a thin painted strip */
  ribbon: function (F, x, y, z, w, len, ry, colKey) {
    const css = F.css(F.col(colKey));
    F.decal(x, y - len, z, w, len, ry, 'ashnomad-ribbon-' + colKey, function (g, W, H) { g.fillStyle = css; g.fillRect(0, 0, W, H); }, 'cloth');
  },
  /* a millipede plate laid flat, bottom at y: a glossy slab with soft edges, its rim bound with hide (bind: a colour, or null) */
  plate: function (F, x, y, z, w, d, th, ry, col, bind) {
    F.pillow(x, y + th / 2, z, w, th, d, ry, col, 'lacquer', { side: 0.55, puff: 0.35, round: 3.5, pinch: 0.03 });
    if (bind) F.pillow(x, y + th / 2, z, w + 0.014, th * 0.45, d + 0.014, ry, bind, 'hide', { side: 0.9, puff: 0.3, round: 3.5, pinch: 0.03 });
    return y + th;
  },
  /* a plate stood on end, facing +z (turned ry): centre (x, yc, z), w across, ht tall, th thick */
  platePanel: function (F, x, yc, z, w, ht, th, ry, col, bind) {
    F.pillow(x, yc, z, w, th, ht, ry, col, 'lacquer', { rx: -Math.PI / 2, side: 0.5, puff: 0.35, round: 3.5, pinch: 0.03 });
    if (bind) F.pillow(x, yc, z, w + 0.014, th * 0.45, ht + 0.014, ry, bind, 'hide', { rx: -Math.PI / 2, side: 0.9, puff: 0.3, round: 3.5, pinch: 0.03 });
  },
  /* a whole millipede plate: arched across x (span, rise), len along z, its feet at y */
  arch: function (F, x, y, z, span, rise, len, th, col, fam, n) {
    n = n || 6; const pts = [];
    for (let i = 0; i <= n; i++) { const t = -1 + 2 * i / n; pts.push([x + t * span / 2, y + th / 2 + rise * (1 - t * t), z]); }
    for (let i = 0; i < n; i++) F.beam(pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0], pts[i + 1][1], pts[i + 1][2], th, len, col, fam);
    return pts;
  },
  /* a jointed chitin leg: two tapering segments and a knuckle */
  leg: function (F, a, k, b, r, col, fam) {
    F.rod(a[0], a[1], a[2], k[0], k[1], k[2], r, col, fam);
    F.rod(k[0], k[1], k[2], b[0], b[1], b[2], r * 0.8, col, fam);
    F.ball(k[0], k[1], k[2], r * 1.35, F.shade(col, 0.12), fam);
  },
  /* a beetle carapace or wing-case: a glossy lens, oval in plan, CENTRED at y; returns its top(lx, lz) */
  carapace: function (F, x, y, z, w, h, d, ry, col, o) {
    return F.pillow(x, y, z, w, h, d, ry, col, 'lacquer', Object.assign({ round: 2.3, puff: 0.7, pinch: 0, side: 0.1 }, o || {}));
  },
  /* a paper lantern hung by its top at yTop: a chitin cap, a barrel of glowing paper hoops (two bands of the second
     colour), split-chitin ribs over it, a cap below and a tassel. Returns the centre height (for the light) */
  lantern: function (F, x, yTop, z, r, len, body, band, cap) {
    const y1 = yTop - 0.05, y0 = y1 - len, n = 8, rad = t => r * (0.6 + 0.4 * Math.sin(Math.PI * t));
    F.frustum(x, y1, z, rad(1) + 0.012, r * 0.25, 0.05, 0, cap, 'lacquer', 10);
    for (let i = 0; i < n; i++) F.frustum(x, y0 + i * len / n, z, rad(i / n), rad((i + 1) / n), len / n, 0, (i === 1 || i === n - 2) ? band : body, 'glow', 14);
    for (let k = 0; k < 6; k++) {
      const a = k * F.TAU / 6, ca = Math.cos(a), sa = Math.sin(a), pts = [];
      for (let j = 0; j <= 4; j++) { const t = j / 4, rr = rad(t) + 0.006; pts.push([x + ca * rr, y0 + t * len, z + sa * rr]); }
      ASHNOMAD_FX.chain(F, pts, 0.012, 0.012, cap, 'lacquer');
    }
    F.frustum(x, y0 - 0.04, z, r * 0.25, rad(0) + 0.012, 0.04, 0, cap, 'lacquer', 10);
    ASHNOMAD_FX.tassel(F, x, y0 - 0.04, z, Math.min(0.16, len * 0.25), band, cap);
    return y0 + len / 2;
  },
  /* a runner's skull (the pig-sized six-legged runner): cranium, a long snout, tusks; base at y, faces +z turned ry */
  skull: function (F, x, y, z, s, ry, bone, dark) {
    const c = Math.cos(ry), sn = Math.sin(ry), at = (u, w) => [x + u * c + w * sn, z - u * sn + w * c];
    F.blob(x, y + s * 0.4, z, s * 0.42, s * 0.8, 0, bone, 'bone');
    const p = at(0, s * 0.2), q = at(0, s * 0.8);
    F.beam(p[0], y + s * 0.3, p[1], q[0], y + s * 0.2, q[1], s * 0.36, s * 0.3, bone, 'bone');
    for (const k of [-1, 1]) {
      const e = at(k * s * 0.2, s * 0.3), t = at(k * s * 0.17, s * 0.62);
      F.ball(e[0], y + s * 0.52, e[1], s * 0.08, dark, 'bone');
      F.cone(t[0], y + s * 0.1, t[1], s * 0.05, s * 0.32, 0, F.shade(bone, 0.06), 'bone');
    }
  },
  /* a staghorn beetle's head: a carapace lens, branching mandibles, amber eyes; base at y, faces +z turned ry */
  beetleHead: function (F, x, y, z, s, ry, col, mand, eye) {
    const c = Math.cos(ry), sn = Math.sin(ry), at = (u, v, w) => [x + u * c + w * sn, y + v, z - u * sn + w * c];
    ASHNOMAD_FX.carapace(F, x, y + s * 0.16, z, s * 0.56, s * 0.32, s * 0.5, ry, col, { puff: 0.8 });
    for (const k of [-1, 1]) {
      const pts = [at(k * 0.1 * s, 0.18 * s, 0.16 * s), at(k * 0.27 * s, 0.32 * s, 0.3 * s), at(k * 0.3 * s, 0.54 * s, 0.38 * s), at(k * 0.14 * s, 0.72 * s, 0.34 * s)];
      ASHNOMAD_FX.chain(F, pts, s * 0.09, s * 0.04, mand, 'lacquer');
      const b = pts[2], tip = at(k * 0.44 * s, 0.6 * s, 0.4 * s);
      F.beam(b[0], b[1], b[2], tip[0], tip[1], tip[2], s * 0.035, s * 0.035, mand, 'lacquer');
      const e = at(k * 0.22 * s, 0.22 * s, 0.12 * s);
      F.ball(e[0], e[1], e[2], s * 0.05, eye, 'lacquer');
    }
  },
  /* a geometric rug of laid boxes (cloth): border, a line, the field, a border of small lozenges and a field device.
     kind 0: three stepped lozenges; 1: a medallion over a lattice of small lozenges; 2: zigzag rows; 'court': a sun-disc
     medallion with corner lozenges. c: colours { border, line, field, ink, ink2, fringe }. Fringe at the short ends. */
  rug: function (F, W, D, c, kind) {
    const fr = 0.05, Wb = W - 2 * fr, b = Math.min(Wb, D) * 0.12, fw = Wb - 2 * b, fd = D - 2 * b;
    F.box(0, 0, 0, Wb, 0.02, D, 0, c.border, 'cloth');
    F.box(0, 0.002, 0, fw + 0.05, 0.02, fd + 0.05, 0, c.line, 'cloth');
    F.box(0, 0.004, 0, fw, 0.02, fd, 0, c.field, 'cloth');
    const nx = Math.max(3, Math.round(Wb / (b * 1.3))), nz = Math.max(2, Math.round(D / (b * 1.3))), sq = b * 0.34;
    for (let i = 0; i < nx; i++) for (const s of [-1, 1]) F.box(-Wb / 2 + (i + 0.5) * Wb / nx, 0.002, s * (D / 2 - b / 2), sq, 0.02, sq, Math.PI / 4, i % 2 ? c.ink : c.ink2, 'cloth');
    for (let i = 1; i < nz - 1; i++) for (const s of [-1, 1]) F.box(s * (Wb / 2 - b / 2), 0.002, -D / 2 + (i + 0.5) * D / nz, sq, 0.02, sq, Math.PI / 4, i % 2 ? c.ink : c.ink2, 'cloth');
    const loz = function (x, z, size, cols) {
      for (let k = 0; k < cols.length; k++) { const sz = size * (1 - k / cols.length); F.box(x, 0.006 + 0.002 * k, z, sz, 0.02, sz, Math.PI / 4, cols[k], 'cloth'); }
    };
    if (kind === 0) {
      const s = Math.min(fw / 3, fd) * 0.66;
      for (let k = -1; k <= 1; k++) {
        loz(k * fw / 3, 0, s, [c.ink, c.field, c.ink2, c.ink]);
        for (const sx of [-1, 1]) F.box(k * fw / 3 + sx * s * 0.62, 0.006, 0, s * 0.18, 0.02, 0.05, 0, c.ink2, 'cloth');
      }
    } else if (kind === 1) {
      for (let i = -3; i <= 3; i++) for (let j = -1; j <= 1; j++) if (Math.abs(i) > 1 || j !== 0) F.box(i * fw / 7.5, 0.006, j * fd / 3.2, 0.09, 0.02, 0.09, Math.PI / 4, (i + j) % 2 ? c.ink : c.ink2, 'cloth');
      loz(0, 0, Math.min(fw, fd) * 0.62, [c.ink2, c.ink, c.field, c.ink2]);
    } else if (kind === 2) {
      const rows = 4, seg = 0.22, n = Math.floor(fw / seg);
      for (let r = 0; r < rows; r++) {
        const z0 = -fd / 2 + fd * (r + 0.5) / rows;
        for (let i = 0; i < n; i++) {
          const x = -n * seg / 2 + (i + 0.5) * seg, up = i % 2 ? 1 : -1;
          F.box(x, 0.006, z0, seg * 1.42, 0.02, 0.05, up * Math.PI / 4 * 0.6, r % 2 ? c.ink : c.ink2, 'cloth');
        }
      }
    } else {
      const R = Math.min(fw, fd) * 0.3;
      for (let k = 0; k < 16; k++) { const a = k * F.TAU / 16, ro = R * (k % 2 ? 1.25 : 1.45); F.box(Math.cos(a) * ro * 0.8, 0.006, Math.sin(a) * ro * 0.8, ro * 0.45, 0.02, 0.06, -a, k % 2 ? c.ink2 : c.ink, 'cloth'); }
      F.cyl(0, 0.008, 0, R, 0.02, 0, c.ink, 'cloth');
      F.cyl(0, 0.01, 0, R * 0.8, 0.02, 0, c.ink2, 'cloth');
      F.cyl(0, 0.012, 0, R * 0.68, 0.02, 0, c.ink, 'cloth');
      F.cyl(0, 0.014, 0, R * 0.3, 0.02, 0, c.ink2, 'cloth');
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) loz(sx * fw * 0.36, sz * fd * 0.3, Math.min(fw, fd) * 0.22, [c.ink2, c.ink, c.field]);
    }
    for (const s of [-1, 1]) for (let i = 0; i < Math.round(D / 0.05); i++) F.box(s * (Wb / 2 + fr / 2), 0, -D / 2 + (i + 0.5) * D / Math.round(D / 0.05), fr, 0.02, 0.012, 0, c.fringe, 'cloth');
  }
};

/* ====================================================================== Seating */
FURN({
  key: 'ashnomad_floor_cushion', name: 'Floor cushion', culture: 'ashnomad', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['cloth', 'bone'],
  w: 0.7, d: 0.7, h: 0.24, variants: 3, variantNames: ['vermilion, a yellow spiral', 'ochre, red lozenges and a bone button', 'black, a stepped lozenge and tassels'],
  build: function (F) {
    const v = F.variant, body = F.col(['vermilion', 'ochre', 'clothBlack'][v]), pipe = F.col(['yellow', 'redDark', 'red'][v]);
    const S = 0.64, H = 0.22, c = H / 2, top = F.pillow(0, c, 0, S, H, S, 0, body, 'cloth', { side: 0.3, puff: 1.0, pinch: 0.05, round: 4 });
    const ty = (x, z) => c + top(x, z);
    for (const L of [top.seamTop, top.seamBottom]) for (let i = 0; i < L.length - 1; i++)
      F.rod(L[i][0], c + L[i][1], L[i][2], L[i + 1][0], c + L[i + 1][1], L[i + 1][2], 0.011, pipe, 'cloth');
    if (v === 0) {   /* a spiral couched on the top in yellow cord */
      let p = null;
      for (let i = 0; i <= 22; i++) {
        const t = i / 22, a = t * 2.4 * F.TAU, r = 0.015 + 0.17 * t, x = r * Math.cos(a), z = r * Math.sin(a), q = [x, ty(x, z) + 0.002, z];
        if (p) F.rod(p[0], p[1], p[2], q[0], q[1], q[2], 0.011, F.col('yellow'), 'cloth');
        p = q;
      }
    } else if (v === 1) {
      F.box(0, ty(0, 0) - 0.01, 0, 0.2, 0.02, 0.2, Math.PI / 4, F.col('red'), 'cloth');
      F.box(0, ty(0, 0) - 0.006, 0, 0.11, 0.02, 0.11, Math.PI / 4, F.col('clothBlack'), 'cloth');
      F.ball(0, ty(0, 0) + 0.008, 0, 0.024, F.col('bone'), 'bone');
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.17, ty(0.17, 0.17) - 0.012, sz * 0.17, 0.06, 0.02, 0.06, Math.PI / 4, F.col('red'), 'cloth');
    } else {
      const y0 = ty(0, 0) - 0.012;
      F.box(0, y0, 0, 0.26, 0.02, 0.26, Math.PI / 4, F.col('red'), 'cloth');
      F.box(0, y0 + 0.003, 0, 0.18, 0.02, 0.18, Math.PI / 4, body, 'cloth');
      F.box(0, y0 + 0.006, 0, 0.1, 0.02, 0.1, Math.PI / 4, F.col('yellow'), 'cloth');
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; F.box(Math.cos(a) * 0.2, ty(0.2, 0) - 0.012, Math.sin(a) * 0.2, 0.08, 0.02, 0.03, -a, F.col('yellow'), 'cloth'); }
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) ASHNOMAD_FX.tassel(F, sx * 0.265, c, sz * 0.265, 0.1, F.col('red'), F.col('yellow'));
    }
  }
});
FURN({
  key: 'ashnomad_bolster', name: 'Bolster', culture: 'ashnomad', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court'], anchor: 'floor', clearance: {},
  materials: ['cloth', 'bone'],
  w: 1.0, d: 0.3, h: 0.3, variants: 2, variantNames: ['red, yellow bands, black ends', 'black and ochre stripes'],
  build: function (F) {
    const v = F.variant, R = 0.14, y = R + 0.005, len = 0.9;
    const band = (x0, x1, col, grow) => F.bolster(0, y, 0, len, R, 0, col, 'cloth', { from: (x0 + len / 2) / len, to: (x1 + len / 2) / len, grow: grow || 1.03 });
    if (!v) {
      F.bolster(0, y, 0, len, R, 0, F.col('red'), 'cloth');
      for (const x of [-0.3, -0.25, 0.22, 0.27]) band(x, x + 0.03, F.col('yellow'));
      band(-0.04, 0.04, F.col('clothBlack'));
    } else {
      const keys = ['clothBlack', 'ochre', 'clothBlack', 'ochre', 'clothBlack', 'ochre', 'clothBlack'], n = keys.length, st = len / n;
      for (let i = 0; i < n; i++) band(-len / 2 + i * st, -len / 2 + (i + 1) * st, F.col(keys[i]), 1);
      for (let i = 1; i < n; i++) band(-len / 2 + i * st - 0.008, -len / 2 + i * st + 0.008, F.col('red'));
    }
    for (const s of [-1, 1]) {
      band(s < 0 ? -len / 2 : len / 2 - 0.05, s < 0 ? -len / 2 + 0.05 : len / 2, F.col(v ? 'red' : 'clothBlack'), 1.01);
      F.ball(s * (len / 2 + 0.008), y, 0, 0.03, F.col('bone'), 'bone');
      ASHNOMAD_FX.tassel(F, s * 0.47, y, 0, 0.14, F.col(v ? 'yellow' : 'ochre'), F.col('red'));
    }
  }
});
FURN({
  key: 'ashnomad_sleeping_mat', name: 'Hide sleeping pallet', culture: 'ashnomad', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'hall', 'barracks'], anchor: 'wall', clearance: { front: 0.5, left: 0.4 },
  materials: ['hide', 'cloth', 'lacquer', 'bone'],
  w: 1.0, d: 2.1, h: 0.3, variants: 2, variantNames: ['red blanket, black and yellow stripes', 'black blanket, ochre and yellow stripes'],
  build: function (F) {
    const v = F.variant;
    /* two runner hides, the lower one larger, fur side up */
    F.pillow(0, 0.03, 0.04, 0.96, 0.06, 2.0, 0, F.col('hideDark'), 'hide', { side: 0.4, puff: 0.3, round: 2.8, pinch: 0.08 });
    F.pillow(0, 0.075, 0.08, 0.86, 0.05, 1.8, 0, F.col('hide'), 'hide', { side: 0.3, puff: 0.3, round: 3.2, pinch: 0.06 });
    /* the woven blanket over the lower part, its head turned down; stripes woven across */
    const bl = F.col(v ? 'clothBlack' : 'red'), st = F.col(v ? 'ochre' : 'clothBlack'), st2 = F.col('yellow');
    const bo = { side: 0.4, puff: 0.35, round: 6, pinch: 0.02 };
    F.pillow(0, 0.125, 0.4, 0.9, 0.05, 1.2, 0, bl, 'cloth', bo);
    for (const [z, c] of [[0.86, st], [0.79, st2], [0.72, st], [0.12, st], [0.05, st2], [-0.02, st]]) F.pillow(0, 0.125, z, 0.905, 0.056, 0.05, 0, c, 'cloth', bo);
    F.bolster(0, 0.15, -0.2, 0.9, 0.035, 0, F.shade(bl, 0.08), 'cloth', { gather: 0.9 });
    /* the carved chitin headrest against the wall: a saddle on two feet, its ends curled, bone inlay */
    const ch = F.col(v ? 'chitinAmber' : 'chitin');
    for (const s of [-1, 1]) F.frustum(s * 0.17, 0, -0.93, 0.06, 0.045, 0.1, 0, F.col('chitinDark'), 'lacquer', 6);
    F.pillow(0, 0.13, -0.93, 0.5, 0.07, 0.24, 0, ch, 'lacquer', { side: 0.5, puff: 0.3, round: 4 });
    for (const s of [-1, 1]) F.blob(s * 0.22, 0.2, -0.93, 0.06, 0.12, 0, ch, 'lacquer');
    for (const x of [-0.12, 0, 0.12]) F.ball(x, 0.13, -0.81, 0.02, F.col('bone'), 'bone');
  }
});
FURN({
  key: 'ashnomad_carapace_stool', name: 'Carapace stool', culture: 'ashnomad', tier: 'common', type: 'chair', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kitchen', 'workshop', 'bedroom'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['lacquer', 'bone', 'rope', 'hide', 'cloth'],
  w: 0.5, d: 0.46, h: 0.5, variants: 2, variantNames: ['amber wing-case, red pad', 'green-black wing-case, ochre pad'],
  build: function (F) {
    const v = F.variant, shell = F.col(v ? 'chitinGreen' : 'chitinAmber'), bone = F.col('bone'), rope = F.col('ropeHemp');
    const knees = [];
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      F.rod(c * 0.19, 0.02, s * 0.17, c * 0.09, 0.38, s * 0.08, 0.022, bone, 'bone');
      F.ball(c * 0.19, 0.03, s * 0.17, 0.032, F.shade(bone, -0.08), 'bone');
      knees.push([c * 0.154, 0.15, s * 0.138]);
    }
    for (let i = 0; i < 3; i++) { const p = knees[i], q = knees[(i + 1) % 3]; F.rod(p[0], p[1], p[2], q[0], q[1], q[2], 0.008, rope, 'rope'); F.ball(p[0], p[1], p[2], 0.03, rope, 'rope'); }
    /* the upturned wing-case: its glossy belly below, a rim, the hollow and a felt pad in it, the rim bound with hide */
    F.pillow(0, 0.4, 0, 0.44, 0.08, 0.38, 0, F.shade(shell, -0.15), 'lacquer', { round: 2.3, puff: 0.8, pinch: 0, side: 0 });
    ASHNOMAD_FX.ring(F, 0, 0.44, 0, 0.205, 18, 0.04, 0.035, shell, 'lacquer', 'xz', 0.175);
    ASHNOMAD_FX.ring(F, 0, 0.447, 0, 0.214, 18, 0.012, 0.02, F.col('hideDark'), 'hide', 'xz', 0.184);
    F.pillow(0, 0.445, 0, 0.36, 0.03, 0.3, 0, shell, 'lacquer', { round: 2.3, puff: 0.3, side: 0.3 });
    F.pillow(0, 0.47, 0, 0.26, 0.05, 0.22, 0, F.col(v ? 'ochre' : 'red'), 'cloth', { round: 2.6, puff: 0.9, pinch: 0.04 });
  }
});
FURN({
  key: 'ashnomad_chitin_bench', name: 'Millipede-plate bench', culture: 'ashnomad', tier: 'common', type: 'bench', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kitchen', 'barracks'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['lacquer', 'hide', 'rope'],
  w: 2.4, d: 0.42, h: 0.46, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), hide = F.col('hideDark'), rope = F.col('ropeHemp');
    for (const x of [-0.95, 0, 0.95]) {
      for (const s of [-1, 1]) ASHNOMAD_FX.leg(F, [x, 0, s * 0.17], [x, 0.2, s * 0.19], [x, 0.39, s * 0.1], 0.024, dark, 'lacquer');
      F.beam(x, 0.385, -0.16, x, 0.385, 0.16, 0.06, 0.04, dark, 'lacquer');
      F.rod(x, 0.13, -0.185, x, 0.13, 0.185, 0.016, dark, 'lacquer');
      for (const s of [-1, 1]) F.ball(x, 0.385, s * 0.1, 0.028, rope, 'rope');
    }
    F.rod(-1.1, 0.13, 0, 1.1, 0.13, 0, 0.02, dark, 'lacquer');
    for (const x of [-0.95, 0, 0.95]) F.ball(x, 0.13, 0, 0.03, rope, 'rope');
    for (let i = 0; i < 6; i++) ASHNOMAD_FX.plate(F, -1.0 + i * 0.4, 0.405, 0, 0.39, 0.4, 0.05, F.rr(-0.03, 0.03), F.shade('chitin', F.rr(-0.06, 0.06)), hide);
  }
});

/* ====================================================================== Tables and vessels */
FURN({
  key: 'ashnomad_carapace_table', name: 'Carapace low table', culture: 'ashnomad', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'court', 'antechamber', 'kitchen'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['lacquer', 'hide', 'rope'],
  w: 1.1, d: 0.9, h: 0.42, variants: 2, variantNames: ['green-black carapace', 'amber carapace'],
  build: function (F) {
    const v = F.variant, shell = F.col(v ? 'chitinAmber' : 'chitinGreen'), dark = F.col('chitinDark'), rope = F.col('ropeHemp');
    /* the lashed frame: four splayed legs, X-braces down each long side lashed where they cross, a ring under the top */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { F.rod(sx * 0.38, 0, sz * 0.3, sx * 0.3, 0.31, sz * 0.24, 0.025, dark, 'lacquer'); F.ball(sx * 0.3, 0.3, sz * 0.24, 0.03, rope, 'rope'); }
    for (const sz of [-1, 1]) {
      F.rod(-0.36, 0.05, sz * 0.285, 0.31, 0.28, sz * 0.245, 0.014, dark, 'lacquer');
      F.rod(0.36, 0.05, sz * 0.285, -0.31, 0.28, sz * 0.245, 0.014, dark, 'lacquer');
      F.ball(0, 0.165, sz * 0.265, 0.024, rope, 'rope');
    }
    ASHNOMAD_FX.ring(F, 0, 0.3, 0, 0.36, 14, 0.03, 0.03, dark, 'lacquer', 'xz', 0.28);
    /* the carapace: a broad, flat-topped lens, hide round its edge, the wing-case seam down the middle, two eye-spots */
    const top = ASHNOMAD_FX.carapace(F, 0, 0.35, 0, 1.06, 0.1, 0.86, 0, shell, { puff: 0.25, side: 0.3, round: 2.2 });
    F.pillow(0, 0.35, 0, 1.08, 0.035, 0.88, 0, F.col('hideDark'), 'hide', { round: 2.2, puff: 0.3, side: 0.9 });
    const pts = []; for (let i = 0; i <= 8; i++) { const z = -0.38 + i * 0.095; pts.push([0, 0.35 + top(0, z) + 0.002, z]); }
    ASHNOMAD_FX.chain(F, pts, 0.014, 0.014, F.shade(shell, -0.35), 'lacquer');
    for (const s of [-1, 1]) F.pillow(s * 0.26, 0.35 + top(0.26, 0.05) - 0.006, 0.05, 0.16, 0.02, 0.22, 0, F.shade(shell, 0.28), 'lacquer', { round: 2.2, puff: 0.5 });
  }
});
FURN({
  key: 'ashnomad_mess_table', name: 'Mess-hall trestle table', culture: 'ashnomad', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kitchen', 'barracks'], anchor: 'floor', clearance: { front: 0.7, back: 0.7 },
  materials: ['lacquer', 'hide', 'rope', 'stone', 'food'],
  w: 3.2, d: 0.9, h: 0.86, variants: 2, variantNames: ['bare', 'laid with bowls and cups'], variantDims: [{ w: 3.2, d: 0.9, h: 0.76 }, { w: 3.2, d: 0.9, h: 0.86 }],
  build: function (F) {
    const dark = F.col('chitinDark'), rope = F.col('ropeHemp'), hide = F.col('hideDark');
    for (const x of [-1.25, 0, 1.25]) {
      for (const s of [-1, 1]) { F.rod(x, 0, s * 0.38, x, 0.66, s * 0.28, 0.035, dark, 'lacquer'); F.ball(x, 0.03, s * 0.38, 0.045, F.shade(dark, 0.12), 'lacquer'); F.ball(x, 0.66, s * 0.28, 0.045, rope, 'rope'); }
      F.beam(x, 0.665, -0.38, x, 0.665, 0.38, 0.08, 0.07, dark, 'lacquer');
      F.rod(x, 0.2, -0.36, x, 0.2, 0.36, 0.02, dark, 'lacquer');
    }
    F.rod(-1.4, 0.2, 0, 1.4, 0.2, 0, 0.03, dark, 'lacquer');
    for (const x of [-1.25, 0, 1.25]) F.ball(x, 0.2, 0, 0.04, rope, 'rope');
    /* the top: eight millipede plates across, edges bound with hide, lashed to two long rails */
    for (const s of [-1, 1]) F.rod(-1.55, 0.68, s * 0.33, 1.55, 0.68, s * 0.33, 0.022, dark, 'lacquer');
    for (let i = 0; i < 8; i++) ASHNOMAD_FX.plate(F, -1.365 + i * 0.39, 0.7, 0, 0.385, 0.86, 0.05, F.rr(-0.01, 0.01), F.shade('chitin', F.rr(-0.08, 0.08)), hide);
    if (F.variant) {
      const clay = F.col('clayRed');
      for (let i = 0; i < 6; i++) {
        const x = -1.25 + i * 0.5, z = (i % 2 ? 1 : -1) * 0.22;
        F.frustum(x, 0.75, z, 0.055, 0.09, 0.07, 0, clay, 'stone', 12);
        F.cyl(x, 0.79, z, 0.08, 0.02, 0, F.col(i % 3 ? 'meat' : 'grub'), 'food');
        F.frustum(x + 0.16, 0.75, -z * 0.8, 0.025, 0.033, 0.08, 0, F.col('chitinAmber'), 'lacquer', 10);
      }
    }
  }
});
FURN({
  key: 'ashnomad_brew_set', name: 'Grub-wine and herb tea on a tray', culture: 'ashnomad', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'kitchen', 'antechamber', 'court', 'bedroom', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['lacquer', 'hide', 'stone', 'food', 'bone'],
  w: 0.5, d: 0.4, h: 0.3, variants: 1,
  build: function (F) {
    const clay = F.col('clayRed'), cup = F.col('chitinAmber');
    ASHNOMAD_FX.plate(F, 0, 0, 0, 0.48, 0.36, 0.03, 0, F.col('chitin'), F.col('hideDark'));
    /* the red clay jug: a black and yellow band round its belly, a handle and a lip */
    const jx = -0.1, jz = -0.04, y0 = 0.03;
    F.frustum(jx, y0, jz, 0.05, 0.065, 0.03, 0, F.shade(clay, -0.1), 'stone', 12);
    F.blob(jx, y0 + 0.11, jz, 0.085, 0.17, 0, clay, 'stone');
    F.cyl(jx, y0 + 0.1, jz, 0.087, 0.025, 0, F.col('clothBlack'), 'stone');
    F.cyl(jx, y0 + 0.108, jz, 0.088, 0.008, 0, F.col('yellow'), 'stone');
    F.frustum(jx, y0 + 0.18, jz, 0.04, 0.03, 0.06, 0, clay, 'stone', 12);
    F.frustum(jx, y0 + 0.24, jz, 0.03, 0.042, 0.025, 0, F.shade(clay, 0.08), 'stone', 12);
    ASHNOMAD_FX.chain(F, [[jx + 0.035, 0.25, jz], [jx + 0.11, 0.24, jz], [jx + 0.115, 0.14, jz], [jx + 0.08, 0.1, jz]], 0.016, 0.014, clay, 'stone');
    /* chitin cups of grub-wine, a clay bowl of herb tea with a bone spoon */
    for (const [x, z] of [[0.07, 0.12], [0.17, 0.02], [0.05, -0.12], [0.18, -0.1]]) {
      F.frustum(x, 0.03, z, 0.024, 0.034, 0.06, 0, cup, 'lacquer', 10);
      F.cyl(x, 0.07, z, 0.03, 0.02, 0, F.col('grubWine'), 'food');
    }
    F.frustum(-0.15, 0.03, 0.11, 0.04, 0.065, 0.05, 0, clay, 'stone', 12);
    F.cyl(-0.15, 0.058, 0.11, 0.058, 0.02, 0, F.col('teaHerb'), 'food');
    F.rod(-0.13, 0.08, 0.11, -0.04, 0.12, 0.15, 0.006, F.col('bone'), 'bone');
  }
});
FURN({
  key: 'ashnomad_cookpot', name: 'Iron cookpot on a chitin tripod', culture: 'ashnomad', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['hall', 'kitchen', 'tavern', 'barracks', 'yard'], anchor: 'floor', clearance: { front: 0.7, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['metal', 'lacquer', 'rope', 'stone', 'food', 'bone', 'timber', 'emissive'],
  w: 1.4, d: 1.4, h: 1.6, variants: 1,
  build: function (F) {
    const iron = F.col('ironBlack'), dark = F.col('chitinDark');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      ASHNOMAD_FX.leg(F, [c * 0.62, 0, s * 0.62], [c * 0.36, 0.85, s * 0.36], [c * 0.04, 1.55, s * 0.04], 0.03, dark, 'lacquer');
    }
    F.cyl(0, 1.42, 0, 0.065, 0.12, 0, F.col('ropeHemp'), 'rope');
    F.rod(0, 1.44, 0, 0, 0.98, 0, 0.007, iron, 'metal');
    for (const s of [-1, 1]) F.beam(0, 0.98, 0, s * 0.33, 0.69, 0, 0.012, 0.012, iron, 'metal');
    /* the black iron cauldron: belly, wall, rolled rim, lugs; a stew of runner meat and grubs; a bone ladle */
    F.blob(0, 0.55, 0, 0.33, 0.36, 0, iron, 'metal');
    F.frustum(0, 0.6, 0, 0.318, 0.3, 0.13, 0, iron, 'metal', 16);
    ASHNOMAD_FX.ring(F, 0, 0.73, 0, 0.305, 20, 0.03, 0.03, F.shade(iron, 0.15), 'metal', 'xz');
    F.cyl(0, 0.715, 0, 0.29, 0.02, 0, F.col('meat'), 'food');
    for (let i = 0; i < 7; i++) F.ball(F.rr(-0.18, 0.18), 0.735, F.rr(-0.18, 0.18), F.rr(0.025, 0.04), F.col(i % 2 ? 'grub' : 'meatDark'), 'food');
    for (const s of [-1, 1]) F.box(s * 0.33, 0.66, 0, 0.04, 0.05, 0.07, 0, iron, 'metal');
    F.rod(0.08, 0.72, 0.1, 0.3, 1.05, 0.26, 0.012, F.col('bone'), 'bone');
    F.ball(0.3, 1.05, 0.26, 0.02, F.col('bone'), 'bone');
    /* the fire: a stone ring, scrub wood, embers and flames */
    for (let i = 0; i < 10; i++) {
      const a = i * F.TAU / 10 + F.rr(-0.1, 0.1), hb = F.rr(0.13, 0.17);
      F.blob(Math.cos(a) * 0.5, hb / 2, Math.sin(a) * 0.5, F.rr(0.09, 0.12), hb, 0, F.shade('stoneDark', F.rr(-0.1, 0.15)), 'stone');
    }
    F.cyl(0, 0, 0, 0.42, 0.02, 0, F.col('ash'), 'stone');
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4 + 0.4; F.rod(Math.cos(a) * 0.36, 0.03, Math.sin(a) * 0.36, Math.cos(a) * 0.05, 0.16, Math.sin(a) * 0.05, 0.03, F.col('timberDark'), 'wood'); }
    F.blob(0, 0.04, 0, 0.26, 0.06, 0, F.col('ember'), 'glow');
    F.cone(0, 0.05, 0, 0.1, 0.28, 0, F.col('flame'), 'glow');
    F.cone(0.08, 0.05, 0.05, 0.06, 0.2, 0, F.col('ember'), 'glow');
    F.cone(-0.07, 0.05, -0.04, 0.06, 0.18, 0, F.col('flame'), 'glow');
    F.lamp(0, 0.3, 0, 1.1, 9);
  }
});
FURN({
  key: 'ashnomad_serving_counter', name: 'Mess-hall serving counter', culture: 'ashnomad', tier: 'common', type: 'counter', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kitchen', 'barracks', 'market'], anchor: 'floor', clearance: { front: 1.0, back: 0.8 },
  materials: ['lacquer', 'hide', 'stone', 'food', 'bone'],
  w: 2.6, d: 0.75, h: 1.15, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), hide = F.col('hideDark'), clay = F.col('clayRed'), bone = F.col('bone');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 1.2, 0, sz * 0.3, sx * 1.2, 0.86, sz * 0.3, 0.03, dark, 'lacquer');
    for (const y of [0.12, 0.84]) F.rod(-1.2, y, -0.3, 1.2, y, -0.3, 0.022, dark, 'lacquer');
    /* the front: millipede plates stood on end, lapped, bound with hide; the ends the same */
    for (let i = 0; i < 7; i++) ASHNOMAD_FX.platePanel(F, -1.08 + i * 0.36, 0.43, 0.32 + (i % 2) * 0.014, 0.4, 0.82, 0.05, 0, F.shade('chitin', F.rr(-0.08, 0.06)), hide);
    for (const s of [-1, 1]) ASHNOMAD_FX.platePanel(F, s * 1.24, 0.43, 0.01, 0.62, 0.82, 0.05, Math.PI / 2, F.shade('chitin', -0.05), hide);
    for (let i = 0; i < 7; i++) ASHNOMAD_FX.plate(F, -1.08 + i * 0.36, 0.84, 0, 0.39, 0.7, 0.05, 0, F.shade('chitin', F.rr(-0.06, 0.06)), hide);
    /* on the top: three clay bowls (stew, grubs, eggs) with bone ladles, a stack of chitin bowls */
    const T = 0.89, fills = [['meat', 'meatDark'], ['grub', 'grub'], ['egg', 'yellow']];
    for (let i = 0; i < 3; i++) {
      const x = -0.85 + i * 0.6, z = 0.02;
      F.frustum(x, T, z, 0.1, 0.16, 0.1, 0, clay, 'stone', 14);
      F.cyl(x, T + 0.075, z, 0.155, 0.02, 0, F.shade(clay, -0.15), 'stone');
      F.cyl(x, T + 0.07, z, 0.145, 0.02, 0, F.col(fills[i][0]), 'food');
      for (let k = 0; k < 6; k++) F.ball(x + F.rr(-0.09, 0.09), T + 0.095, z + F.rr(-0.09, 0.09), 0.025, F.col(fills[i][1]), 'food');
      F.rod(x + 0.04, T + 0.08, z, x + 0.2, 1.1, z - 0.12, 0.01, bone, 'bone');
      F.ball(x + 0.2, 1.1, z - 0.12, 0.016, bone, 'bone');
    }
    for (let k = 0; k < 4; k++) F.frustum(0.98, T + k * 0.025, 0, 0.06, 0.1, 0.05, 0, F.shade('chitinAmber', k * 0.04), 'lacquer', 12);
  }
});

/* ====================================================================== Storage */
FURN({
  key: 'ashnomad_chitin_chest', name: 'Chitin chest', culture: 'ashnomad', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'hall', 'store', 'court'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['lacquer', 'hide', 'bone'],
  w: 0.95, d: 0.56, h: 0.64, variants: 2, variantNames: ['carapace lid, painted front', 'plated lid, bone clasps'], variantDims: [{ w: 0.95, d: 0.56, h: 0.64 }, { w: 0.95, d: 0.56, h: 0.52 }],
  build: function (F) {
    const v = F.variant, ch = F.col('chitin'), dark = F.col('chitinDark'), hide = F.col('hideDark'), bone = F.col('bone');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.blob(sx * 0.39, 0.035, sz * 0.19, 0.045, 0.07, 0, dark, 'lacquer');
    F.box(0, 0.05, 0, 0.88, 0.4, 0.5, 0, dark, 'lacquer');
    for (const s of [-1, 1]) ASHNOMAD_FX.platePanel(F, s * 0.45, 0.25, 0, 0.52, 0.4, 0.04, Math.PI / 2, ch, null);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.44, 0.05, sz * 0.25, 0.03, 0.4, 0.03, 0, hide, 'hide');
    const cc = { field: F.css(F.col('clothBlack')), ground: F.css(F.col('red')), ink: F.css(F.col('yellow')), ink2: F.css(F.col('vermilion')) };
    F.decal(0, 0.09, 0.2515, 0.74, 0.32, 0, 'ashnomad-chest', function (g, W, H) { ASHNOMAD_FX.paintFront(g, W, H, cc, 'beetle'); }, 'hide');
    for (const y of [0.075, 0.42]) F.box(0, y, 0.255, 0.8, 0.025, 0.012, 0, hide, 'hide');
    if (!v) {
      const shell = F.col('chitinAmber'), top = ASHNOMAD_FX.carapace(F, 0, 0.47, 0, 0.92, 0.3, 0.54, 0, shell, { puff: 0.55, side: 0.15 });
      F.pillow(0, 0.47, 0, 0.94, 0.03, 0.555, 0, hide, 'hide', { round: 2.3, puff: 0.3, side: 0.9 });
      const pts = []; for (let i = 0; i <= 8; i++) { const x = -0.4 + i * 0.1; pts.push([x, 0.47 + top(x, 0) + 0.002, 0]); }
      ASHNOMAD_FX.chain(F, pts, 0.014, 0.014, F.shade(shell, -0.35), 'lacquer');
      F.box(0, 0.38, 0.26, 0.06, 0.1, 0.02, 0, bone, 'bone');
      F.ball(0, 0.41, 0.275, 0.022, bone, 'bone');
    } else {
      for (let i = -1; i <= 1; i++) ASHNOMAD_FX.plate(F, i * 0.31, 0.45, 0, 0.31, 0.54, 0.05, 0, F.shade(ch, i * 0.05), hide);
      for (const x of [-0.25, 0.25]) { F.box(x, 0.36, 0.258, 0.05, 0.12, 0.02, 0, bone, 'bone'); F.rod(x - 0.04, 0.4, 0.27, x + 0.04, 0.4, 0.27, 0.012, bone, 'bone'); }
    }
  }
});
FURN({
  key: 'ashnomad_bedding_stack', name: 'Bedding stack on a plated box', culture: 'ashnomad', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'hall', 'court', 'store'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['lacquer', 'hide', 'cloth', 'bone'],
  w: 1.3, d: 0.6, h: 1.2, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.01, 1.26, 0.36, 0.58, 0, F.col('chitinDark'), 'lacquer');
    for (let i = 0; i < 4; i++) ASHNOMAD_FX.platePanel(F, -0.465 + i * 0.31, 0.19, 0.29, 0.33, 0.32, 0.035, 0, F.shade('chitin', F.rr(-0.06, 0.06)), F.col('hideDark'));
    /* folded felts and blankets, each with its bound edge to the front */
    const keys = ['clothBlack', 'red', 'clothAsh', 'ochre', 'clothCharcoal', 'vermilion', 'clothAshPale'];
    let y = 0.36;
    for (let i = 0; i < 7; i++) {
      const th = 0.08 + F.rr(0, 0.015), x = F.rr(-0.01, 0.01);
      F.pillow(x, y + th / 2, -0.02, 1.2, th, 0.52, 0, F.col(keys[i]), 'cloth', { side: 0.6, puff: 0.35, pinch: 0.01 });
      F.box(x, y + th * 0.15, 0.242, 1.18, th * 0.7, 0.008, 0, F.col(keys[(i + 3) % 7]), 'cloth');
      y += th;
    }
    F.pillow(0, y + 0.035, -0.02, 1.05, 0.07, 0.5, 0.03, F.col('hide'), 'hide', { side: 0.3, puff: 0.4, round: 2.8, pinch: 0.08 });
    y += 0.06;
    for (const s of [-1, 1]) F.pillow(s * 0.33, y + 0.06, -0.02, 0.42, 0.12, 0.36, s * 0.06, F.col(s < 0 ? 'red' : 'ochre'), 'cloth', { puff: 1.0, pinch: 0.08 });
    /* the woven band draped over the front */
    const blk = F.col('clothBlack');
    F.box(0, y, -0.015, 0.3, 0.01, 0.54, 0, blk, 'cloth');
    F.box(0, y - 0.6, 0.252, 0.3, 0.61, 0.012, 0, blk, 'cloth');
    const bc = { field: F.css(blk), ink: F.css(F.col('yellow')), ink2: F.css(F.col('red')) };
    F.decal(0, y - 0.56, 0.2645, 0.26, 0.54, 0, 'ashnomad-bedding-band', function (g, W, H) { ASHNOMAD_FX.paintStrip(g, W, H, bc); }, 'cloth');
    for (const x of [-0.1, 0, 0.1]) ASHNOMAD_FX.tassel(F, x, y - 0.6, 0.258, 0.09, F.col('yellow'), F.col('red'));
  }
});
FURN({
  key: 'ashnomad_saddle_bags', name: 'Hide saddle-bags on a rail', culture: 'ashnomad', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['store', 'stable', 'hall', 'yard', 'antechamber'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['lacquer', 'hide', 'cloth', 'bone', 'rope'],
  w: 0.95, d: 0.5, h: 0.6, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), hide = F.col('hide'), hd = F.col('hideDark'), bone = F.col('bone');
    for (const s of [-1, 1]) {
      for (const z of [-0.2, 0.2]) F.rod(s * 0.42, 0, z, s * 0.42, 0.52, 0, 0.018, dark, 'lacquer');
      F.ball(s * 0.42, 0.52, 0, 0.03, F.col('ropeHemp'), 'rope');
    }
    F.rod(-0.46, 0.53, 0, 0.46, 0.53, 0, 0.022, dark, 'lacquer');
    /* a pair of bags hung either side of the rail, their straps over it; the front one has a red flap and bone toggles */
    F.pillow(0, 0.3, 0.1, 0.7, 0.14, 0.38, 0, hide, 'hide', { rx: -Math.PI / 2 - 0.12, side: 0.3, puff: 0.8, round: 4, pinch: 0.06 });
    F.pillow(0, 0.3, -0.1, 0.7, 0.14, 0.38, 0, F.shade(hide, -0.1), 'hide', { rx: -Math.PI / 2 + 0.12, side: 0.3, puff: 0.8, round: 4, pinch: 0.06 });
    F.pillow(0, 0.545, 0, 0.5, 0.025, 0.24, 0, hd, 'hide', { puff: 0.6, round: 4 });
    F.pillow(0, 0.42, 0.158, 0.64, 0.02, 0.18, 0, F.col('red'), 'cloth', { rx: -Math.PI / 2 - 0.12, side: 0.4, puff: 0.3, round: 4 });
    for (const y of [0.38, 0.45]) F.rod(-0.3, y, 0.172 - (y - 0.38) * 0.12, 0.3, y, 0.172 - (y - 0.38) * 0.12, 0.007, F.col('yellow'), 'cloth');
    for (const x of [-0.18, 0, 0.18]) { F.rod(x, 0.33, 0.165, x, 0.36, 0.17, 0.006, hd, 'hide'); F.ball(x, 0.325, 0.18, 0.02, bone, 'bone'); }
    for (const s of [-1, 1]) for (const z of [-0.12, 0.13]) ASHNOMAD_FX.tassel(F, s * 0.3, 0.13, z, 0.1, F.col('ochre'), F.col('red'));
  }
});
FURN({
  key: 'ashnomad_grub_jars', name: 'Grub jars and scoop', culture: 'ashnomad', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['store', 'kitchen', 'yard', 'market'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['stone', 'food', 'lacquer', 'bone'],
  w: 0.85, d: 0.55, h: 0.62, variants: 1,
  build: function (F) {
    const clay = F.col('clayRed'), bone = F.col('bone'), grub = F.col('grub');
    const jar = function (x, z, s, open) {
      F.frustum(x, 0, z, 0.1 * s, 0.14 * s, 0.06 * s, 0, F.shade(clay, -0.1), 'stone', 14);
      F.blob(x, 0.27 * s, z, 0.2 * s, 0.44 * s, 0, clay, 'stone');
      F.cyl(x, 0.3 * s, z, 0.201 * s, 0.04 * s, 0, F.col('clothBlack'), 'stone');
      F.cyl(x, 0.315 * s, z, 0.203 * s, 0.01 * s, 0, F.col('yellow'), 'stone');
      F.frustum(x, 0.46 * s, z, 0.1 * s, 0.085 * s, 0.06 * s, 0, clay, 'stone', 14);
      F.cyl(x, 0.52 * s, z, 0.1 * s, 0.03 * s, 0, F.shade(clay, 0.08), 'stone');
      if (!open) { F.dome(x, 0.55 * s, z, 0.11 * s, 0.05 * s, 0, F.shade(clay, 0.05), 'stone'); F.ball(x, 0.6 * s + 0.004, z, 0.02, bone, 'bone'); }
      else {
        F.dome(x, 0.53 * s, z, 0.085 * s, 0.03 * s, 0, F.shade(grub, -0.1), 'food');
        for (let i = 0; i < 6; i++) F.ball(x + F.rr(-0.05, 0.05) * s, 0.55 * s, z + F.rr(-0.05, 0.05) * s, 0.018, grub, 'food');
      }
    };
    jar(-0.15, -0.05, 1, false);
    jar(0.24, -0.1, 0.6, true);
    jar(0.12, 0.16, 0.5, false);
    /* the lid of the open jar on the ground, and a chitin scoop with grubs across it */
    F.dome(0.34, 0, 0.14, 0.066, 0.03, 0, F.shade(clay, 0.05), 'stone');
    F.dome(0.3, 0.33, -0.1, 0.06, 0.03, 0, F.col('chitinAmber'), 'lacquer');
    F.rod(0.3, 0.335, -0.1, 0.4, 0.38, 0.0, 0.01, bone, 'bone');
    for (let i = 0; i < 3; i++) F.ball(0.3 + F.rr(-0.02, 0.02), 0.36, -0.1 + F.rr(-0.02, 0.02), 0.016, grub, 'food');
  }
});
FURN({
  key: 'ashnomad_egg_basket', name: 'Basket of runner eggs', culture: 'ashnomad', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['kitchen', 'store', 'market', 'yard'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['wicker', 'food', 'foliage'],
  w: 0.62, d: 0.62, h: 0.44, variants: 1,
  build: function (F) {
    const wick = F.col('basket');
    F.frustum(0, 0, 0, 0.2, 0.27, 0.24, 0, wick, 'wicker', 14);
    for (let y = 0.03; y < 0.22; y += 0.05) F.cyl(0, y, 0, 0.2 + 0.07 * (y + 0.01) / 0.24 + 0.004, 0.014, 0, F.shade(wick, -0.18), 'wicker');
    F.cyl(0, 0.22, 0, 0.278, 0.03, 0, F.shade(wick, -0.08), 'wicker');
    for (const s of [-1, 1]) ASHNOMAD_FX.chain(F, [[s * 0.27, 0.22, -0.06], [s * 0.3, 0.28, 0], [s * 0.27, 0.22, 0.06]], 0.02, 0.02, wick, 'wicker');
    F.dome(0, 0.22, 0, 0.25, 0.04, 0, F.col('straw'), 'plant');
    /* the eggs of the six-legged runner, big and pale */
    const pos = [[0, 0, 0.34]];
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6 + 0.3; pos.push([Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.3]); }
    for (const [x, z, y] of pos) F.blob(x, y, z, 0.065, 0.16, 0, F.shade('egg', F.rr(-0.06, 0.06)), 'food');
    for (let i = 0; i < 5; i++) F.box(F.rr(-0.2, 0.2), 0.24, F.rr(-0.2, 0.2), 0.1, 0.02, 0.012, F.rnd() * 3, F.col('straw'), 'plant');
  }
});
FURN({
  key: 'ashnomad_water_gourds', name: 'Water gourds on a tripod', culture: 'ashnomad', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['yard', 'kitchen', 'store', 'stable'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['lacquer', 'timber', 'hide', 'rope', 'bone'],
  w: 0.9, d: 0.9, h: 1.6, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), rope = F.col('ropeHemp');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3, c = Math.cos(a), s = Math.sin(a);
      ASHNOMAD_FX.leg(F, [c * 0.42, 0, s * 0.42], [c * 0.22, 0.85, s * 0.22], [c * 0.02, 1.58, s * 0.02], 0.022, dark, 'lacquer');
    }
    F.cyl(0, 1.38, 0, 0.05, 0.12, 0, rope, 'rope');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 3, x = Math.cos(a) * 0.17, z = Math.sin(a) * 0.17;
      if (i < 2) {   /* a bottle gourd in a cord net, a bone stopper */
        const gc = F.shade('gourd', F.rr(-0.12, 0.05)), y0 = 0.45 + i * 0.12;
        F.blob(x, y0, z, 0.11, 0.22, 0, gc, 'wood');
        F.blob(x, y0 + 0.16, z, 0.07, 0.13, 0, gc, 'wood');
        F.frustum(x, y0 + 0.21, z, 0.03, 0.025, 0.06, 0, F.shade(gc, -0.1), 'wood', 8);
        F.ball(x, y0 + 0.28, z, 0.024, F.col('bone'), 'bone');
        for (const t of [-1, 1]) F.rod(x + t * 0.09, y0 - 0.06, z, x + t * 0.05, y0 + 0.18, z, 0.004, rope, 'rope');
        F.rod(x, y0 + 0.28, z, x * 0.1, 1.4, z * 0.1, 0.005, rope, 'rope');
      } else {   /* a runner-hide water bag, its neck tied */
        F.blob(x, 0.6, z, 0.13, 0.38, 0, F.col('hideDark'), 'hide');
        F.frustum(x, 0.77, z, 0.05, 0.03, 0.08, 0, F.col('hideDark'), 'hide', 8);
        F.cyl(x, 0.82, z, 0.035, 0.02, 0, rope, 'rope');
        F.rod(x, 0.84, z, x * 0.1, 1.4, z * 0.1, 0.005, rope, 'rope');
      }
    }
  }
});
FURN({
  key: 'ashnomad_supply_bales', name: 'Hide and felt bales, chitin bundles', culture: 'ashnomad', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['store', 'yard', 'market', 'stable', 'shop'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['hide', 'cloth', 'rope', 'lacquer'],
  w: 1.3, d: 0.9, h: 1.0, variants: 1,
  build: function (F) {
    const rope = F.col('ropeHemp'), po = { side: 0.55, puff: 0.5, round: 5, pinch: 0.05 };
    const bale = function (x, y, z, w, h, d, col, fam) {
      F.pillow(x, y + h / 2, z, w, h, d, 0, col, fam, po);
      for (const o of [-0.28, 0.28]) F.pillow(x + o * w, y + h / 2, z, 0.035, h + 0.012, d + 0.012, 0, rope, 'rope', po);
    };
    bale(-0.31, 0, 0.02, 0.6, 0.42, 0.82, F.col('hideDark'), 'hide');
    bale(0.31, 0, 0, 0.6, 0.42, 0.8, F.col('clothAsh'), 'cloth');
    bale(0, 0.4, -0.06, 0.95, 0.32, 0.56, F.col('clothBlack'), 'cloth');
    for (const x of [-0.42, 0.42]) F.pillow(x, 0.56, -0.06, 0.05, 0.326, 0.566, 0, F.col('red'), 'cloth', po);
    /* a bundle of cleaned millipede plates, tied, and a rolled hide */
    let y = 0.71;
    for (let i = 0; i < 5; i++) y = ASHNOMAD_FX.plate(F, 0.12 + F.rr(-0.02, 0.02), y - 0.004, -0.06, 0.5, 0.3, 0.04, F.rr(-0.05, 0.05), F.shade('chitin', F.rr(-0.08, 0.08)), null);
    F.pillow(0.12, 0.8, -0.06, 0.04, 0.2, 0.32, 0, rope, 'rope', { side: 0.8, puff: 0.3, round: 5 });
    F.bolster(-0.25, 0.78, 0.12, 0.42, 0.07, 0.2, F.col('hide'), 'hide', { gather: 0.85 });
  }
});

/* ====================================================================== Light
   Lit paper and chitin are the 'glow' family (unlit, so they read as lit), with an F.lamp inside, as the Scyvoi lanterns do. */
FURN({
  key: 'ashnomad_paper_lantern', name: 'Paper lantern on a post', culture: 'ashnomad', tier: 'common', type: 'lamp', setting: 'both',
  rooms: ['hall', 'court', 'antechamber', 'shrine', 'yard', 'street', 'market'], anchor: 'floor', clearance: {},
  materials: ['lacquer', 'stone', 'bone', 'cloth', 'rope', 'emissive'],
  w: 0.7, d: 0.42, h: 2.1, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), bone = F.col('bone'), px = -0.2;
    F.blob(px, 0.06, 0, 0.1, 0.12, 0, F.col('stoneDark'), 'stone');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      F.rod(px + c * 0.13, 0.01, s * 0.13, px + c * 0.02, 0.32, s * 0.02, 0.016, dark, 'lacquer');
      F.ball(px + c * 0.13, 0.025, s * 0.13, 0.024, bone, 'bone');
    }
    F.rod(px, 0, 0, px, 2.0, 0, 0.026, dark, 'lacquer');
    for (const [y, k] of [[0.7, 'red'], [0.74, 'yellow'], [1.5, 'red'], [1.54, 'yellow']]) F.cyl(px, y, 0, 0.03, 0.03, 0, F.col(k), 'cloth');
    ASHNOMAD_FX.chain(F, [[px, 1.9, 0], [px + 0.12, 1.99, 0], [px + 0.28, 1.98, 0], [px + 0.36, 1.92, 0]], 0.03, 0.02, dark, 'lacquer');
    F.ball(px, 2.02, 0, 0.035, bone, 'bone');
    F.rod(px + 0.36, 1.93, 0, px + 0.36, 1.82, 0, 0.004, F.col('ropeHemp'), 'rope');
    const cy = ASHNOMAD_FX.lantern(F, px + 0.36, 1.82, 0, 0.17, 0.62, F.col('paper'), F.col('paperRed'), dark);
    F.lamp(px + 0.36, cy, 0, 0.8, 7);
  }
});
FURN({
  key: 'ashnomad_hanging_lantern', name: 'Hanging paper lantern', culture: 'ashnomad', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine', 'kitchen', 'tavern'], anchor: 'ceiling', clearance: {},
  materials: ['lacquer', 'bone', 'rope', 'cloth', 'emissive'],
  w: 0.42, d: 0.42, h: 1.0, variants: 2, variantNames: ['round, yellow paper, red bands', 'tall, red paper, yellow bands'],
  build: function (F) {
    const v = F.variant, dark = F.col('chitinDark'), rope = F.col('ropeHemp');
    F.cyl(0, 0.97, 0, 0.05, 0.03, 0, dark, 'lacquer');
    F.ball(0, 0.95, 0, 0.022, F.col('bone'), 'bone');
    const r = v ? 0.14 : 0.18, len = v ? 0.55 : 0.42, yTop = 0.82;
    for (let k = 0; k < 3; k++) { const a = k * F.TAU / 3; F.rod(0, 0.94, 0, Math.cos(a) * r * 0.25, yTop, Math.sin(a) * r * 0.25, 0.004, rope, 'rope'); }
    const cy = ASHNOMAD_FX.lantern(F, 0, yTop, 0, r, len, F.col(v ? 'paperRed' : 'paper'), F.col(v ? 'yellow' : 'paperRed'), dark);
    F.lamp(0, cy, 0, 0.7, 7);
  }
});
FURN({
  key: 'ashnomad_chitin_lamp', name: 'Carapace lamp on a stand', culture: 'ashnomad', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine', 'study'], anchor: 'floor', clearance: {},
  materials: ['lacquer', 'bone', 'stone', 'hide', 'emissive'],
  w: 0.44, d: 0.44, h: 1.3, variants: 1,
  build: function (F) {
    const bone = F.col('bone'), dark = F.col('chitinDark');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      ASHNOMAD_FX.leg(F, [c * 0.19, 0, s * 0.19], [c * 0.12, 0.45, s * 0.12], [c * 0.06, 0.86, s * 0.06], 0.018, bone, 'bone');
      F.rod(c * 0.06, 0.86, s * 0.06, c * 0.15, 1.07, s * 0.12, 0.01, dark, 'lacquer');
    }
    F.frustum(0, 0.85, 0, 0.06, 0.11, 0.05, 0, F.col('clayRed'), 'stone', 12);
    F.cone(0, 0.9, 0, 0.025, 0.08, 0, F.col('flame'), 'glow');
    /* the shell: a translucent amber carapace glowing over the flame, its veins dark, its rim bound with hide */
    const top = F.pillow(0, 1.07, 0, 0.32, 0.36, 0.26, 0, F.col('chitinGlow'), 'glow', { round: 2.3, puff: 0.75, side: 0.2, pinch: 0 });
    ASHNOMAD_FX.ring(F, 0, 1.06, 0, 0.162, 16, 0.025, 0.025, F.col('hideDark'), 'hide', 'xz', 0.132);
    const a1 = [], a2 = [];
    for (let i = 0; i <= 8; i++) { const t = -0.95 + i * 0.2375, z = t * 0.13, x = t * 0.16; a1.push([0, 1.07 + top(0, z) + 0.004, z]); a2.push([x, 1.07 + top(x, 0) + 0.004, 0]); }
    ASHNOMAD_FX.chain(F, a1, 0.012, 0.012, F.col('chitinAmber'), 'lacquer');
    ASHNOMAD_FX.chain(F, a2, 0.012, 0.012, F.col('chitinAmber'), 'lacquer');
    F.ball(0, 1.27, 0, 0.026, bone, 'bone');
    F.lamp(0, 1.05, 0, 0.6, 6);
  }
});
FURN({
  key: 'ashnomad_lantern_pole', name: 'Lantern pole', culture: 'ashnomad', tier: 'common', type: 'lamp', setting: 'outdoor',
  rooms: ['street', 'yard', 'plaza', 'market'], anchor: 'floor', clearance: {},
  materials: ['lacquer', 'stone', 'bone', 'cloth', 'rope', 'emissive'],
  w: 1.6, d: 0.66, h: 3.3, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), bone = F.col('bone'), rope = F.col('ropeHemp');
    for (let i = 0; i < 7; i++) {
      const a = i * F.TAU / 7 + F.rr(-0.2, 0.2), hb = F.rr(0.14, 0.2);
      F.blob(Math.cos(a) * 0.2, hb / 2, Math.sin(a) * 0.2, F.rr(0.09, 0.12), hb, 0, F.shade('stoneDark', F.rr(-0.1, 0.15)), 'stone');
    }
    F.blob(0, 0.15, 0, 0.13, 0.3, 0, F.col('stoneGrey'), 'stone');
    F.frustum(0, 0, 0, 0.06, 0.045, 3.2, 0, dark, 'lacquer', 8);
    for (const [y, k] of [[0.9, 'red'], [0.95, 'yellow'], [1.8, 'red'], [1.85, 'yellow']]) F.cyl(0, y, 0, 0.06, 0.04, 0, F.col(k), 'cloth');
    F.rod(-0.78, 2.85, 0, 0.78, 2.85, 0, 0.025, dark, 'lacquer');
    for (const s of [-1, 1]) { F.ball(s * 0.79, 2.85, 0, 0.03, bone, 'bone'); F.rod(0, 2.55, 0, s * 0.4, 2.85, 0, 0.016, dark, 'lacquer'); }
    F.ball(0, 2.85, 0, 0.055, rope, 'rope');
    for (const s of [-1, 1]) {
      F.rod(s * 0.62, 2.85, 0, s * 0.62, 2.72, 0, 0.004, rope, 'rope');
      ASHNOMAD_FX.lantern(F, s * 0.62, 2.72, 0, 0.13, 0.42, F.col('paper'), F.col('paperRed'), dark);
      for (const o of [0.2, 0.32]) ASHNOMAD_FX.ribbon(F, s * o, 2.83, 0, 0.04, F.rr(0.5, 0.7), 0, o < 0.3 ? 'red' : 'yellow');
    }
    ASHNOMAD_FX.chain(F, [[0, 3.08, 0], [0, 3.16, 0.1], [0, 3.13, 0.2]], 0.026, 0.02, dark, 'lacquer');
    F.rod(0, 3.13, 0.2, 0, 3.05, 0.2, 0.004, rope, 'rope');
    ASHNOMAD_FX.lantern(F, 0, 3.05, 0.2, 0.1, 0.32, F.col('paperRed'), F.col('yellow'), dark);
    F.cone(0, 3.2, 0, 0.03, 0.1, 0, bone, 'bone');
    F.lamp(0, 2.6, 0, 1.0, 10);
  }
});

/* ====================================================================== Textiles and screens */
FURN({
  key: 'ashnomad_hanging_banner', name: 'Hanging figure banner', culture: 'ashnomad', tier: 'common', type: 'banner', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber', 'shrine', 'tavern'], anchor: 'ceiling', clearance: {},
  materials: ['cloth', 'lacquer', 'bone', 'rope'],
  w: 0.8, d: 0.08, h: 2.6, variants: 3, variantNames: ['the hummingbird', 'the beetle', 'the monkey'],
  build: function (F) {
    /* hung from the tent's roof by two cords to a ring: a chitin crossbar, the black cloth with a Nazca figure, a bone weight-rod, tassels */
    const v = F.variant, dark = F.col('chitinDark'), bone = F.col('bone'), rope = F.col('ropeHemp'), blk = F.col('clothBlack');
    F.cyl(0, 2.57, 0, 0.04, 0.03, 0, dark, 'lacquer');
    for (const s of [-1, 1]) F.rod(0, 2.58, 0, s * 0.36, 2.35, 0, 0.005, rope, 'rope');
    F.rod(-0.38, 2.35, 0, 0.38, 2.35, 0, 0.018, dark, 'lacquer');
    for (const s of [-1, 1]) F.ball(s * 0.385, 2.35, 0, 0.026, bone, 'bone');
    for (let i = 0; i < 5; i++) F.box(-0.28 + i * 0.14, 2.3, 0, 0.06, 0.08, 0.045, 0, blk, 'cloth');
    F.box(0, 0.2, -0.008, 0.7, 2.12, 0.012, 0, blk, 'cloth');
    const c = { field: F.css(blk), ink: F.css(F.col('yellow')), ink2: F.css(F.col('red')) }, kind = ['bird', 'beetle', 'monkey'][v];
    F.decal(0, 0.2, 0.004, 0.7, 2.12, 0, 'ashnomad-banner-' + kind, function (g, W, H) { ASHNOMAD_FX.paintBanner(g, W, H, c, kind); }, 'cloth');
    F.rod(-0.37, 0.2, 0, 0.37, 0.2, 0, 0.014, bone, 'bone');
    for (let i = 0; i < 5; i++) ASHNOMAD_FX.tassel(F, -0.28 + i * 0.14, 0.19, 0, 0.16, F.col(i % 2 ? 'yellow' : 'red'), blk);
  }
});
FURN({
  key: 'ashnomad_ash_screen', name: 'Ash screen', culture: 'ashnomad', tier: 'common', type: 'screen', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['lacquer', 'bone', 'rope', 'reed', 'hide'],
  w: 1.8, d: 0.3, h: 1.9, variants: 2, variantNames: ['woven reed, a red fret', 'painted hide, the figures'],
  build: function (F) {
    /* a folding screen against the ash: four chitin posts in a zigzag, rails lashed to them, three panels */
    const v = F.variant, dark = F.col('chitinDark'), bone = F.col('bone'), rope = F.col('ropeHemp');
    const P = [[-0.86, -0.1], [-0.29, 0.1], [0.29, -0.1], [0.86, 0.1]];
    for (const [x, z] of P) { F.rod(x, 0, z, x, 1.84, z, 0.022, dark, 'lacquer'); F.ball(x, 1.86, z, 0.032, bone, 'bone'); F.blob(x, 0.03, z, 0.035, 0.06, 0, bone, 'bone'); }
    const c = v
      ? { ground: F.css(F.col('hide')), ink: F.css(F.col('clothBlack')), ink2: F.css(F.col('red')) }
      : { ground: F.css(F.col('reed')), line: F.css(F.col('reedDark')), field: F.css(F.col('clothBlack')), ink: F.css(F.col('red')), ink2: F.css(F.col('yellow')) };
    for (let i = 0; i < 3; i++) {
      const a = P[i], b = P[i + 1], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, ry = Math.atan2(-(b[1] - a[1]), b[0] - a[0]), L = Math.hypot(b[0] - a[0], b[1] - a[1]) - 0.05;
      for (const y of [0.18, 1.72]) { F.beam(a[0], y, a[1], b[0], y, b[1], 0.03, 0.03, dark, 'lacquer'); F.ball(a[0], y, a[1], 0.03, rope, 'rope'); F.ball(b[0], y, b[1], 0.03, rope, 'rope'); }
      F.decal(mx, 0.2, mz, L, 1.5, ry, 'ashnomad-screen-' + v + '-' + i, function (g, W, H) { ASHNOMAD_FX.paintPanel(g, W, H, c, v ? 'hide' : 'reed', i); }, v ? 'hide' : 'reed');
    }
  }
});
FURN({
  key: 'ashnomad_rug', name: 'Woven rug', culture: 'ashnomad', tier: 'common', type: 'rug', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'court', 'shrine', 'antechamber'], anchor: 'floor', clearance: {},
  materials: ['cloth'],
  w: 2.4, d: 1.6, h: 0.03, variants: 3, variantNames: ['red field, three stepped lozenges', 'black field, a medallion on a lattice', 'charcoal field, zigzag rows'],
  build: function (F) {
    const v = F.variant;
    const k = [
      { border: 'clothBlack', line: 'yellow', field: 'red', ink: 'yellow', ink2: 'clothBlack', fringe: 'clothAshPale' },
      { border: 'red', line: 'ochre', field: 'clothBlack', ink: 'ochre', ink2: 'vermilion', fringe: 'clothAshPale' },
      { border: 'ochre', line: 'clothBlack', field: 'clothCharcoal', ink: 'red', ink2: 'yellow', fringe: 'clothAsh' }][v];
    const c = {}; for (const n in k) c[n] = F.col(k[n]);
    ASHNOMAD_FX.rug(F, 2.4, 1.6, c, v);
  }
});
FURN({
  key: 'ashnomad_wall_hanging', name: 'Painted wall hanging', culture: 'ashnomad', tier: 'common', type: 'banner', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'antechamber', 'court', 'shrine'], anchor: 'wall', clearance: {},
  materials: ['cloth', 'lacquer', 'bone', 'rope'],
  w: 1.8, d: 0.08, h: 1.7, variants: 1,
  build: function (F) {
    const blk = F.col('clothBlack'), dark = F.col('chitinDark');
    F.box(0, 0.15, -0.03, 1.6, 1.42, 0.02, 0, blk, 'cloth');
    const c = { field: F.css(blk), ground: F.css(F.col('red')), ink: F.css(F.col('yellow')), disc: F.css(F.col('ochre')) };
    F.decal(0, 0.15, -0.0195, 1.6, 1.42, 0, 'ashnomad-wall-hanging', function (g, W, H) { ASHNOMAD_FX.paintHanging(g, W, H, c); }, 'cloth');
    F.rod(-0.86, 1.6, -0.02, 0.86, 1.6, -0.02, 0.02, dark, 'lacquer');
    for (const s of [-1, 1]) F.ball(s * 0.875, 1.6, -0.02, 0.025, F.col('bone'), 'bone');
    for (let i = 0; i < 6; i++) F.box(-0.7 + i * 0.28, 1.55, -0.02, 0.07, 0.08, 0.04, 0, blk, 'cloth');
    for (const s of [-1, 1]) F.rod(s * 0.8, 1.6, -0.02, 0, 1.68, -0.03, 0.004, F.col('ropeHemp'), 'rope');
    F.ball(0, 1.68, -0.025, 0.018, F.col('bone'), 'bone');
    for (let i = 0; i < 9; i++) ASHNOMAD_FX.tassel(F, -0.72 + i * 0.18, 0.15, -0.025, 0.13, F.col(i % 2 ? 'yellow' : 'red'), blk);
  }
});

/* ====================================================================== Fire */
FURN({
  key: 'ashnomad_fire_pit', name: 'Fire pit with a chitin spit', culture: 'ashnomad', tier: 'common', type: 'brazier', setting: 'both',
  rooms: ['hall', 'yard', 'kitchen', 'court'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['stone', 'timber', 'lacquer', 'bone', 'food', 'emissive'],
  w: 1.6, d: 1.6, h: 0.9, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark');
    F.cyl(0, 0, 0, 0.5, 0.02, 0, F.col('ash'), 'stone');
    for (let i = 0; i < 12; i++) {
      const a = i * F.TAU / 12 + F.rr(-0.08, 0.08), hb = F.rr(0.14, 0.18);
      F.blob(Math.cos(a) * 0.58, hb / 2, Math.sin(a) * 0.58, F.rr(0.1, 0.12), hb, 0, F.shade('stoneDark', F.rr(-0.1, 0.15)), 'stone');
    }
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4 + 0.4; F.rod(Math.cos(a) * 0.4, 0.03, Math.sin(a) * 0.4, Math.cos(a) * 0.05, 0.2, Math.sin(a) * 0.05, 0.035, F.col('timberDark'), 'wood'); }
    F.blob(0, 0.04, 0, 0.3, 0.06, 0, F.col('ember'), 'glow');
    F.cone(0, 0.06, 0, 0.12, 0.36, 0, F.col('flame'), 'glow');
    F.cone(0.08, 0.06, 0.05, 0.07, 0.24, 0, F.col('ember'), 'glow');
    F.cone(-0.07, 0.06, -0.04, 0.07, 0.22, 0, F.col('flame'), 'glow');
    /* the spit: two forked chitin uprights, a bone spit with a crank, a runner haunch roasting */
    for (const s of [-1, 1]) {
      F.rod(s * 0.72, 0, 0, s * 0.72, 0.68, 0, 0.03, dark, 'lacquer');
      for (const t of [-1, 1]) ASHNOMAD_FX.chain(F, [[s * 0.72, 0.66, 0], [s * 0.72, 0.74, t * 0.04], [s * 0.72, 0.8, t * 0.06]], 0.03, 0.018, dark, 'lacquer');
    }
    F.rod(-0.76, 0.73, 0, 0.74, 0.73, 0, 0.015, F.col('bone'), 'bone');
    F.rod(-0.76, 0.73, 0, -0.76, 0.6, 0, 0.012, F.col('bone'), 'bone');
    F.rod(-0.76, 0.6, 0, -0.76, 0.6, 0.1, 0.012, F.col('bone'), 'bone');
    F.blob(0, 0.73, 0, 0.16, 0.22, 0, F.col('meat'), 'food');
    F.blob(0.15, 0.73, 0, 0.11, 0.16, 0, F.shade('meat', -0.15), 'food');
    F.ball(-0.18, 0.73, 0, 0.04, F.col('bone'), 'bone');
    F.lamp(0, 0.3, 0, 1.1, 9);
  }
});
FURN({
  key: 'ashnomad_brazier', name: 'Iron fire-bowl on chitin legs', culture: 'ashnomad', tier: 'common', type: 'brazier', setting: 'both',
  rooms: ['hall', 'court', 'antechamber', 'yard', 'shrine'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['metal', 'lacquer', 'bone', 'stone', 'emissive'],
  w: 0.7, d: 0.7, h: 0.95, variants: 1,
  build: function (F) {
    const iron = F.col('ironBlack'), dark = F.col('chitinDark');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 6, c = Math.cos(a), s = Math.sin(a);
      ASHNOMAD_FX.leg(F, [c * 0.28, 0.02, s * 0.28], [c * 0.3, 0.3, s * 0.3], [c * 0.16, 0.56, s * 0.16], 0.024, dark, 'lacquer');
      F.ball(c * 0.28, 0.025, s * 0.28, 0.03, F.col('bone'), 'bone');
    }
    F.frustum(0, 0.52, 0, 0.1, 0.3, 0.2, 0, iron, 'metal', 16);
    ASHNOMAD_FX.ring(F, 0, 0.72, 0, 0.3, 20, 0.03, 0.03, F.shade(iron, 0.15), 'metal', 'xz');
    for (const s of [-1, 1]) ASHNOMAD_FX.ring(F, s * 0.31, 0.66, 0, 0.05, 8, 0.012, 0.012, iron, 'metal', 'zy');
    F.blob(0, 0.73, 0, 0.27, 0.05, 0, F.col('ember'), 'glow');
    for (let i = 0; i < 6; i++) F.box(F.rr(-0.15, 0.15), 0.745, F.rr(-0.15, 0.15), 0.05, 0.03, 0.04, F.rnd() * 3, F.col('coal'), 'stone');
    F.cone(0, 0.74, 0, 0.1, 0.18, 0, F.col('flame'), 'glow');
    F.cone(0.08, 0.74, -0.05, 0.05, 0.11, 0, F.col('flame'), 'glow');
    F.lamp(0, 0.85, 0, 0.9, 7);
  }
});
FURN({
  key: 'ashnomad_smoke_rack', name: 'Meat-smoking rack', culture: 'ashnomad', tier: 'common', type: 'rack', setting: 'outdoor',
  rooms: ['yard', 'market', 'street'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['lacquer', 'rope', 'food', 'stone', 'glass', 'emissive'],
  w: 2.2, d: 1.1, h: 1.9, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), rope = F.col('ropeHemp');
    for (const x of [-1.0, 1.0]) { for (const s of [-1, 1]) F.rod(x, 0, s * 0.45, x, 1.85, 0, 0.025, dark, 'lacquer'); F.ball(x, 1.8, 0, 0.04, rope, 'rope'); }
    F.rod(-1.08, 1.8, 0, 1.08, 1.8, 0, 0.022, dark, 'lacquer');
    for (const s of [-1, 1]) F.rod(-1.06, 1.25, s * 0.15, 1.06, 1.25, s * 0.15, 0.018, dark, 'lacquer');
    /* strips of runner meat hung to smoke */
    for (let i = 0; i < 9; i++) {
      const x = -0.85 + i * 0.21 + F.rr(-0.03, 0.03), l = F.rr(0.35, 0.5);
      F.beam(x, 1.79, 0, x + F.rr(-0.03, 0.03), 1.79 - l, F.rr(-0.02, 0.02), 0.06, 0.015, F.shade(F.pick(['meat', 'meatDark']), F.rr(-0.08, 0.05)), 'food');
    }
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {
      const x = -0.8 + i * 0.32 + F.rr(-0.04, 0.04), l = F.rr(0.3, 0.42);
      F.beam(x, 1.24, s * 0.15, x + F.rr(-0.03, 0.03), 1.24 - l, s * 0.15, 0.07, 0.015, F.shade(F.pick(['meat', 'meatDark']), F.rr(-0.08, 0.05)), 'food');
    }
    /* the smudge under it: ash, embers, smoke */
    F.cyl(0, 0, 0, 0.36, 0.03, 0, F.col('ash'), 'stone');
    for (let i = 0; i < 6; i++) F.ball(F.rr(-0.22, 0.22), 0.04, F.rr(-0.2, 0.2), 0.05, F.col('ember'), 'glow');
    for (let i = 0; i < 4; i++) F.blob(F.rr(-0.1, 0.1), 0.3 + i * 0.18, F.rr(-0.08, 0.08), 0.12 + i * 0.03, 0.18, 0, F.col('smoke'), 'glass');
    F.lamp(0, 0.2, 0, 0.5, 4);
  }
});

/* ====================================================================== Riders and herders */
FURN({
  key: 'ashnomad_beetle_saddle_rack', name: 'Beetle saddle on a rack', culture: 'ashnomad', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['stable', 'store', 'hall', 'yard', 'antechamber'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['lacquer', 'hide', 'cloth', 'bone', 'rope'],
  w: 0.95, d: 1.5, h: 1.55, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), amber = F.col('chitinAmber'), hide = F.col('hide'), hd = F.col('hideDark'), bone = F.col('bone'), red = F.col('red');
    for (const z of [-0.6, 0.6]) { for (const s of [-1, 1]) F.rod(s * 0.3, 0, z, 0, 0.76, z, 0.028, dark, 'lacquer'); F.ball(0, 0.76, z, 0.04, F.col('ropeHemp'), 'rope'); }
    F.rod(0, 0.76, -0.68, 0, 0.76, 0.68, 0.04, dark, 'lacquer');
    /* the saddle blanket: red, with fret-painted drapes down both flanks */
    F.pillow(0, 0.81, 0, 0.84, 0.03, 0.9, 0, red, 'cloth', { side: 0.5, puff: 0.3, round: 6 });
    const sc = { field: F.css(F.col('clothBlack')), ink: F.css(F.col('yellow')), ink2: F.css(red) };
    for (const s of [-1, 1]) {
      F.pillow(s * 0.41, 0.6, 0, 0.86, 0.02, 0.44, Math.PI / 2, red, 'cloth', { rx: -Math.PI / 2, puff: 0.3, side: 0.5, round: 6 });
      F.decal(s * 0.423, 0.42, 0, 0.8, 0.34, s * Math.PI / 2, 'ashnomad-saddle-drape', function (g, W, H) { ASHNOMAD_FX.paintStrip(g, W, H, sc); }, 'cloth');
      for (const z of [-0.36, 0.36]) ASHNOMAD_FX.tassel(F, s * 0.425, 0.38, z, 0.1, F.col('yellow'), red);
    }
    /* the seat, a high back of carapace bound with hide, a hooked pommel of chitin */
    F.pillow(0, 0.88, 0.05, 0.5, 0.1, 0.55, 0, hide, 'hide', { side: 0.4, puff: 0.6, round: 3.5 });
    const th = -Math.PI / 2 - 0.25;
    F.pillow(0, 1.13, -0.34, 0.52, 0.07, 0.62, 0, amber, 'lacquer', { rx: th, round: 2.6, puff: 0.5, side: 0.2 });
    F.pillow(0, 1.13, -0.34, 0.536, 0.03, 0.636, 0, hd, 'hide', { rx: th, round: 2.6, puff: 0.3, side: 0.9 });
    for (const s of [-1, 1]) F.rod(s * 0.18, 0.88, -0.2, s * 0.15, 1.0, -0.33, 0.02, dark, 'lacquer');
    ASHNOMAD_FX.chain(F, [[0, 0.9, 0.28], [0, 1.06, 0.36], [0, 1.15, 0.33], [0, 1.14, 0.26]], 0.07, 0.03, dark, 'lacquer');
    /* stirrups: bone rings on hide straps */
    for (const s of [-1, 1]) {
      F.box(s * 0.44, 0.4, 0.12, 0.012, 0.45, 0.04, 0, hd, 'hide');
      ASHNOMAD_FX.ring(F, s * 0.445, 0.33, 0.12, 0.07, 10, 0.016, 0.016, bone, 'bone', 'zy', 0.07);
    }
  }
});
FURN({
  key: 'ashnomad_tack_pegs', name: 'Reins, goads and harness on pegs', culture: 'ashnomad', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['stable', 'store', 'hall', 'antechamber', 'yard'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['lacquer', 'hide', 'cloth', 'bone', 'rope'],
  w: 1.2, d: 0.2, h: 1.3, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), hd = F.col('hideDark'), hide = F.col('hide'), bone = F.col('bone');
    F.box(0, 0.15, -0.09, 1.1, 1.0, 0.02, 0, F.col('clothCharcoal'), 'cloth');
    F.box(0, 1.0, -0.07, 1.16, 0.1, 0.03, 0, dark, 'lacquer');
    for (const s of [-1, 1]) F.box(s * 0.56, 0.96, -0.07, 0.06, 0.16, 0.035, 0, F.col('red'), 'cloth');
    const pegs = [-0.42, -0.14, 0.14, 0.42];
    for (const x of pegs) { F.rod(x, 1.05, -0.06, x, 1.07, 0.05, 0.016, bone, 'bone'); F.ball(x, 1.07, 0.055, 0.022, bone, 'bone'); }
    /* a beetle's head-harness: cheek straps, a red browband with bone toggles, the long reins */
    let x = pegs[0];
    for (const s of [-1, 1]) F.beam(x + s * 0.03, 1.05, 0.03, x + s * 0.09, 0.6, 0.03, 0.025, 0.006, hd, 'hide');
    F.box(x, 0.88, 0.035, 0.19, 0.03, 0.006, 0, F.col('red'), 'cloth');
    for (const o of [-0.06, 0, 0.06]) F.ball(x + o, 0.895, 0.045, 0.014, bone, 'bone');
    F.box(x, 0.64, 0.035, 0.2, 0.025, 0.006, 0, hd, 'hide');
    for (const s of [-1, 1]) F.beam(x + s * 0.09, 0.62, 0.04, x + s * 0.02, 0.22, 0.045, 0.02, 0.006, hide, 'hide');
    /* a goad: a chitin rod with a bone hook, hung by its thong */
    x = pegs[1];
    F.rod(x, 1.05, 0.04, x + 0.06, 0.12, 0.05, 0.014, F.col('chitinAmber'), 'lacquer');
    ASHNOMAD_FX.chain(F, [[x + 0.06, 0.12, 0.05], [x + 0.1, 0.07, 0.05], [x + 0.13, 0.11, 0.05]], 0.02, 0.014, bone, 'bone');
    F.box(x + 0.005, 0.95, 0.045, 0.04, 0.09, 0.03, 0, F.col('red'), 'cloth');
    /* harness straps with bone buckles */
    x = pegs[2];
    for (let i = 0; i < 4; i++) {
      const o = -0.045 + i * 0.03, y1 = 0.42 + F.rr(-0.06, 0.06);
      F.beam(x + o * 0.5, 1.05, 0.02 + i * 0.006, x + o * 1.8, y1, 0.02 + i * 0.006, 0.04, 0.006, i % 2 ? hide : hd, 'hide');
      F.box(x + o * 1.4, 0.72 - i * 0.05, 0.03 + i * 0.006, 0.05, 0.04, 0.008, 0, bone, 'bone');
    }
    /* a coil of rope */
    x = pegs[3];
    for (let i = 0; i < 3; i++) ASHNOMAD_FX.ring(F, x + (i - 1) * 0.012, 0.8 - i * 0.01, -0.03 + i * 0.025, 0.17 + i * 0.01, 12, 0.025, 0.025, F.shade('ropeHemp', i * 0.05 - 0.05), 'rope', 'xy');
    F.rod(x, 1.05, 0.03, x, 0.95, 0.03, 0.014, F.col('ropeHemp'), 'rope');
  }
});
FURN({
  key: 'ashnomad_spear_rack', name: 'Spear rack with a chitin shield', culture: 'ashnomad', tier: 'common', type: 'weapon', setting: 'both',
  rooms: ['hall', 'antechamber', 'court', 'yard', 'store', 'barracks'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['lacquer', 'bone', 'hide', 'cloth', 'rope'],
  w: 1.0, d: 0.6, h: 2.7, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), bone = F.col('bone'), rope = F.col('ropeHemp');
    ASHNOMAD_FX.plate(F, 0, 0, -0.05, 0.96, 0.4, 0.06, 0, F.col('chitin'), F.col('hideDark'));
    for (const s of [-1, 1]) { F.rod(s * 0.44, 0.06, -0.05, s * 0.44, 1.32, -0.05, 0.025, dark, 'lacquer'); F.ball(s * 0.44, 1.34, -0.05, 0.035, bone, 'bone'); }
    F.rod(-0.46, 1.2, -0.05, 0.46, 1.2, -0.05, 0.022, dark, 'lacquer');
    /* four spears: chitin shafts, bone or amber-chitin heads, ribbons under the heads */
    for (let i = 0; i < 4; i++) {
      const x = -0.3 + i * 0.2, z = -0.05, hb = i % 2 ? F.col('chitinAmber') : bone, hf = i % 2 ? 'lacquer' : 'bone';
      F.rod(x, 0.06, z, x, 2.42, z, 0.016, F.col(i % 2 ? 'chitin' : 'chitinDark'), 'lacquer');
      F.cyl(x, 1.17, z, 0.03, 0.06, 0, rope, 'rope');
      F.cyl(x, 2.36, z, 0.022, 0.06, 0, rope, 'rope');
      F.frustum(x, 2.42, z, 0.03, 0.004, 0.24, 0, hb, hf, 4);
      ASHNOMAD_FX.ribbon(F, x + 0.03, 2.36, z, 0.035, F.rr(0.18, 0.28), 0, i % 2 ? 'yellow' : 'red');
    }
    /* the shield: a green-black wing-case leaning on the rack, bound with hide, a bone boss and a red cross-band */
    const th = -Math.PI / 2 - 0.2, cy = 0.42, cz = 0.18, ct = Math.cos(th), st = Math.sin(th);
    const at = (lx, ly, lz) => [lx, cy + ly * ct - lz * st, cz + ly * st + lz * ct];
    F.pillow(0, cy, cz, 0.5, 0.07, 0.7, 0, F.col('chitinGreen'), 'lacquer', { rx: th, round: 2.3, puff: 0.6, side: 0.15 });
    F.pillow(0, cy, cz, 0.516, 0.03, 0.716, 0, F.col('hideDark'), 'hide', { rx: th, round: 2.3, puff: 0.3, side: 0.9 });
    const a = at(0, -0.04, -0.3), b = at(0, -0.04, 0.3), f = at(0, -0.04, 0);
    F.beam(a[0], a[1], a[2], b[0], b[1], b[2], 0.05, 0.02, F.col('red'), 'cloth');
    F.ball(f[0], f[1], f[2] + 0.01, 0.045, bone, 'bone');
  }
});
FURN({
  key: 'ashnomad_tying_post', name: 'Beetle tethering post', culture: 'ashnomad', tier: 'common', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'street', 'stable', 'market'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'lacquer', 'cloth', 'metal', 'bone'],
  w: 0.42, d: 0.6, h: 2.35, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), iron = F.col('ironBlack');
    F.frustum(0, 0, 0, 0.22, 0.18, 0.16, 0, F.col('stoneDark'), 'stone', 6);
    F.frustum(0, 0.16, 0, 0.085, 0.07, 1.86, 0, F.col('chitin'), 'lacquer', 8);
    for (const y of [0.5, 1.55]) { F.cyl(0, y, 0, 0.09, 0.06, 0, F.col('red'), 'cloth'); F.cyl(0, y + 0.06, 0, 0.088, 0.02, 0, F.col('yellow'), 'cloth'); }
    F.box(0, 1.1, 0.075, 0.04, 0.03, 0.03, 0, iron, 'metal');
    ASHNOMAD_FX.ring(F, 0, 1.03, 0.1, 0.07, 10, 0.014, 0.014, iron, 'metal', 'xy');
    F.box(0.075, 1.3, 0, 0.03, 0.03, 0.04, 0, iron, 'metal');
    ASHNOMAD_FX.ring(F, 0.1, 1.23, 0, 0.07, 10, 0.014, 0.014, iron, 'metal', 'zy');
    /* the carved staghorn beetle head on top, its mandibles raised */
    F.frustum(0, 1.98, 0, 0.075, 0.065, 0.06, 0, dark, 'lacquer', 8);
    ASHNOMAD_FX.beetleHead(F, 0, 2.02, -0.05, 0.42, 0, dark, F.col('chitin'), F.col('chitinAmber'));
  }
});
FURN({
  key: 'ashnomad_grub_trough', name: 'Fodder and grub trough', culture: 'ashnomad', tier: 'common', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'stable', 'street'], anchor: 'floor', clearance: { front: 0.8, back: 0.8 },
  materials: ['lacquer', 'hide', 'food', 'foliage'],
  w: 1.6, d: 0.66, h: 0.5, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), ch = F.col('chitin'), hd = F.col('hideDark');
    for (const x of [-0.6, 0.6]) for (const s of [-1, 1]) ASHNOMAD_FX.leg(F, [x, 0, s * 0.26], [x, 0.1, s * 0.27], [x, 0.2, s * 0.14], 0.022, dark, 'lacquer');
    F.pillow(0, 0.2, 0, 1.46, 0.04, 0.2, 0, ch, 'lacquer', { side: 0.5, puff: 0.35, round: 4 });
    for (const s of [-1, 1]) {
      F.pillow(0, 0.3, s * 0.17, 1.5, 0.04, 0.3, 0, F.shade(ch, s * 0.05), 'lacquer', { rx: -s * 0.6, side: 0.5, puff: 0.35, round: 4 });
      F.rod(-0.74, 0.39, s * 0.255, 0.74, 0.39, s * 0.255, 0.016, hd, 'hide');
      ASHNOMAD_FX.platePanel(F, s * 0.76, 0.3, 0, 0.5, 0.26, 0.04, Math.PI / 2, ch, null);
    }
    F.pillow(0, 0.3, 0, 1.44, 0.14, 0.34, 0, F.col('fodder'), 'plant', { puff: 0.6, round: 6, side: 0.2 });
    for (let i = 0; i < 12; i++) F.ball(F.rr(-0.6, 0.6), 0.37 + F.rr(0, 0.01), F.rr(-0.1, 0.1), 0.022, F.col('grub'), 'food');
  }
});

/* ====================================================================== Work: the chitin-cutters */
FURN({
  key: 'ashnomad_chitin_bench_work', name: 'Chitin-cutter\'s bench', culture: 'ashnomad', tier: 'common', type: 'workstation', setting: 'both', job: 'carpentry',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['lacquer', 'hide', 'bone', 'metal', 'rope'],
  w: 2.0, d: 0.85, h: 1.1, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), amber = F.col('chitinAmber'), bone = F.col('bone'), iron = F.col('ironBlack'), rope = F.col('ropeHemp');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.frustum(sx * 0.85, 0, sz * 0.32, 0.075, 0.06, 0.78, 0, dark, 'lacquer', 6);
    for (const sz of [-1, 1]) F.rod(-0.85, 0.2, sz * 0.32, 0.85, 0.2, sz * 0.32, 0.025, dark, 'lacquer');
    for (const sx of [-1, 1]) { F.rod(sx * 0.85, 0.2, -0.32, sx * 0.85, 0.2, 0.32, 0.025, dark, 'lacquer'); for (const sz of [-1, 1]) F.ball(sx * 0.85, 0.2, sz * 0.32, 0.04, rope, 'rope'); }
    for (const x of [-0.64, 0, 0.64]) ASHNOMAD_FX.plate(F, x, 0.78, 0, 0.62, 0.8, 0.08, 0, F.shade('chitin', F.rr(-0.06, 0.06)), F.col('hideDark'));
    /* the clamp: two chitin jaws and an iron screw, a millipede plate stood up in it */
    for (const z of [0.0, 0.18]) F.box(0.62, 0.86, z, 0.3, 0.14, 0.05, 0, dark, 'lacquer');
    F.rod(0.62, 0.94, -0.06, 0.62, 0.94, 0.3, 0.014, iron, 'metal');
    F.rod(0.52, 0.94, 0.3, 0.72, 0.94, 0.3, 0.012, bone, 'bone');
    ASHNOMAD_FX.platePanel(F, 0.62, 0.98, 0.09, 0.5, 0.2, 0.03, 0, amber, null);
    /* saws, scrapers, a bow drill, offcuts and shavings */
    F.box(-0.55, 0.86, 0.12, 0.48, 0.02, 0.08, 0.1, F.shade(iron, 0.2), 'metal');
    F.box(-0.84, 0.86, 0.09, 0.14, 0.035, 0.04, 0.1, bone, 'bone');
    for (const [x, z, r] of [[-0.2, 0.25, 0.3], [-0.05, 0.22, -0.4]]) { F.box(x, 0.86, z, 0.12, 0.025, 0.035, r, bone, 'bone'); F.box(x + 0.08 * Math.cos(r), 0.86, z - 0.08 * Math.sin(r), 0.04, 0.02, 0.06, r, iron, 'metal'); }
    ASHNOMAD_FX.chain(F, [[-0.4, 0.875, -0.25], [-0.2, 0.9, -0.3], [0.0, 0.875, -0.25]], 0.018, 0.018, bone, 'bone');
    F.rod(-0.4, 0.875, -0.25, 0.0, 0.875, -0.25, 0.003, rope, 'rope');
    F.rod(0.15, 0.86, -0.2, 0.2, 1.06, -0.22, 0.008, dark, 'lacquer');
    F.pillow(-0.2, 0.875, -0.05, 0.36, 0.03, 0.22, 0.4, amber, 'lacquer', { side: 0.5, puff: 0.3, round: 3 });
    for (let i = 0; i < 8; i++) F.box(F.rr(0.2, 0.9), 0.86, F.rr(-0.3, 0.3), 0.04, 0.02, 0.012, F.rnd() * 3, amber, 'lacquer');
    for (let i = 0; i < 3; i++) ASHNOMAD_FX.arch(F, 0, 0.23 + i * 0.04, 0, 1.2, 0.08, 0.5, 0.025, F.shade('chitin', i * 0.06), 'lacquer', 5);
  }
});
FURN({
  key: 'ashnomad_plate_stack', name: 'Stack of millipede plates', culture: 'ashnomad', tier: 'common', type: 'stack', setting: 'both', job: 'carpentry',
  rooms: ['workshop', 'store', 'yard', 'market'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['lacquer', 'hide', 'rope'],
  w: 1.0, d: 0.8, h: 0.72, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), rope = F.col('ropeHemp');
    for (const s of [-1, 1]) F.rod(s * 0.36, 0.04, -0.38, s * 0.36, 0.04, 0.38, 0.04, dark, 'lacquer');
    let pts = null;
    for (let i = 0; i < 8; i++) {
      const y = 0.08 + i * 0.06, col = F.shade(F.pick(['chitin', 'chitinGreen', 'chitinAmber', 'chitin']), F.rr(-0.06, 0.06));
      pts = ASHNOMAD_FX.arch(F, F.rr(-0.02, 0.02), y, F.rr(-0.02, 0.02), 0.9, 0.16, 0.7, 0.03, col, 'lacquer', 6);
      for (let k = 0; k < pts.length - 1; k++) F.rod(pts[k][0], pts[k][1], pts[k][2] + 0.35, pts[k + 1][0], pts[k + 1][1], pts[k + 1][2] + 0.35, 0.01, F.col('hideDark'), 'hide');
    }
    for (const z of [-0.2, 0.2]) {
      const r = pts.map(p => [p[0], p[1] + 0.025, z]);
      r.unshift([-0.46, 0.04, z]); r.push([0.46, 0.04, z]);
      ASHNOMAD_FX.chain(F, r, 0.02, 0.02, rope, 'rope');
    }
  }
});
FURN({
  key: 'ashnomad_carapace_stack', name: 'Stacked beetle wing-cases', culture: 'ashnomad', tier: 'common', type: 'stack', setting: 'both', job: 'carpentry',
  rooms: ['workshop', 'store', 'yard', 'market'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['lacquer', 'hide', 'rope'],
  w: 1.3, d: 0.8, h: 0.72, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark');
    for (const z of [-0.22, 0.22]) F.rod(-0.55, 0.04, z, 0.55, 0.04, z, 0.04, dark, 'lacquer');
    const keys = ['chitinGreen', 'chitin', 'chitinAmber', 'chitinGreen', 'chitinDark'];
    for (let i = 0; i < 5; i++) {
      const y = 0.15 + i * 0.12, x = -0.06 + i * 0.03, col = F.shade(keys[i], F.rr(-0.05, 0.05)), ry = F.rr(-0.08, 0.08);
      const top = ASHNOMAD_FX.carapace(F, x, y, 0, 1.1, 0.15, 0.6, ry, col, { puff: 0.8 });
      const pts = []; for (let k = 0; k <= 6; k++) { const lx = -0.45 + k * 0.15; pts.push([x + lx * Math.cos(ry), y + top(lx, 0.16) + 0.004, -lx * Math.sin(ry) + 0.16]); }
      ASHNOMAD_FX.chain(F, pts, 0.012, 0.012, F.shade(col, -0.35), 'lacquer');
    }
    F.rod(0.4, 0.04, -0.28, 0.4, 0.72, -0.1, 0.012, F.col('ropeHemp'), 'rope');
    F.rod(0.4, 0.04, 0.28, 0.4, 0.72, -0.1, 0.012, F.col('ropeHemp'), 'rope');
    F.pillow(0.52, 0.06, 0.3, 0.2, 0.05, 0.14, 0.4, F.col('hideDark'), 'hide', { round: 2.6, puff: 0.4 });
  }
});
FURN({
  key: 'ashnomad_ground_loom', name: 'Ground loom', culture: 'ashnomad', tier: 'common', type: 'loom', setting: 'both', job: 'weaving',
  rooms: ['workshop', 'yard', 'hall'], anchor: 'floor', clearance: { front: 0.6, left: 0.6 },
  materials: ['lacquer', 'bone', 'cloth', 'rope', 'stone'],
  w: 1.2, d: 2.4, h: 0.3, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), bone = F.col('bone'), yarn = F.col('clothAshPale');
    /* the warp and cloth beams, staked to the ground */
    for (const z of [-1.08, 1.0]) {
      F.rod(-0.55, 0.08, z, 0.55, 0.08, z, 0.03, dark, 'lacquer');
      for (const s of [-1, 1]) F.rod(s * 0.5, 0, z + (z < 0 ? -0.08 : 0.08), s * 0.5, 0.2, z, 0.022, bone, 'bone');
    }
    /* the warp: undyed threads from the warp beam to the fell */
    for (let i = 0; i < 16; i++) { const x = -0.45 + i * 0.06; F.rod(x, 0.085, -1.06, x, 0.085, 0.0, 0.005, yarn, 'cloth'); }
    /* the woven part: black, banded in red and yellow, a row of lozenges */
    const wo = { side: 0.5, puff: 0.3, round: 8, pinch: 0 };
    F.pillow(0, 0.085, 0.49, 0.96, 0.012, 0.98, 0, F.col('clothBlack'), 'cloth', wo);
    for (const [z, k] of [[0.9, 'red'], [0.84, 'yellow'], [0.1, 'yellow'], [0.04, 'red']]) F.pillow(0, 0.085, z, 0.962, 0.014, 0.04, 0, F.col(k), 'cloth', wo);
    for (let i = 0; i < 6; i++) F.box(-0.38 + i * 0.152, 0.083, 0.47, 0.09, 0.02, 0.09, Math.PI / 4, F.col(i % 2 ? 'ochre' : 'red'), 'cloth');
    /* the heddle rod on two stone piles, its loops down to the warp; the shed stick; the bone sword in the shed; a ball of weft */
    for (const s of [-1, 1]) F.blob(s * 0.55, 0.12, -0.35, 0.06, 0.24, 0, F.col('stoneDark'), 'stone');
    F.rod(-0.58, 0.25, -0.35, 0.58, 0.25, -0.35, 0.016, dark, 'lacquer');
    for (let i = 0; i < 8; i++) { const x = -0.42 + i * 0.12; F.rod(x, 0.25, -0.35, x, 0.09, -0.35, 0.004, F.col('ropeHemp'), 'rope'); }
    F.box(0, 0.08, -0.65, 1.0, 0.06, 0.03, 0, F.col('chitin'), 'lacquer');
    F.box(0, 0.09, -0.08, 0.95, 0.02, 0.07, 0, bone, 'bone');
    F.ball(0.5, 0.06, 0.2, 0.06, F.col('red'), 'cloth');
  }
});

/* ====================================================================== Tanning: the hide and chitin worker (job tanning)
   Runner hides go from the fleshing beam to the vats, onto the frames and the line, then folded onto the stack. A hide is a
   flat F.pillow with a low round exponent; the runner's has six leg flaps. */
FURN({
  key: 'ashnomad_hide_frame', name: 'Hide stretching frame', culture: 'ashnomad', tier: 'common', type: 'workstation', setting: 'both', job: 'tanning',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 0.8 }, materials: ['lacquer', 'hide', 'rope', 'bone'],
  w: 1.9, d: 0.9, h: 2.0, variants: 2, variantNames: ['a runner hide, fresh', 'a runner hide, half scraped'],
  build: function (F) {
    F.shift(0, 0.2);
    const dark = F.col('chitinDark'), cord = F.col('ropeHemp'), v = F.variant, lean = 0.22;
    const at = (x, y) => [x, y * Math.cos(lean), -y * Math.sin(lean)];
    const corners = [[-0.85, 0.15], [0.85, 0.15], [0.85, 1.9], [-0.85, 1.9]];
    for (let i = 0; i < 4; i++) { const a = at(...corners[i]), b = at(...corners[(i + 1) % 4]); F.rod(a[0], a[1], a[2], b[0], b[1], b[2], 0.035, dark, 'lacquer'); F.ball(a[0], a[1], a[2], 0.045, cord, 'rope'); }
    for (const x of [-0.85, 0.85]) { const t = at(x, 1.95); F.rod(x, 0, 0.02, t[0], t[1], t[2], 0.04, dark, 'lacquer'); F.rod(x, 0, -0.55, t[0], t[1] * 0.75, t[2] * 0.75, 0.03, dark, 'lacquer'); }
    const c = at(0, 1.02), hide = F.col(v ? 'hideSmoked' : 'hideRaw'), o = { rx: -Math.PI / 2 + lean, round: 2.6, puff: 0.3, pinch: 0.12 };
    F.pillow(c[0], c[1], c[2] + 0.01, 0.95, 0.025, 1.3, 0, hide, 'hide', o);
    for (const s of [-1, 1]) for (const yy of [0.62, 1.02, 1.42]) { const p = at(s * 0.52, yy); F.pillow(p[0], p[1], p[2] + 0.012, 0.26, 0.02, 0.12, 0, hide, 'hide', o); }
    if (v) F.pillow(c[0] + 0.15, c[1] + 0.15, c[2] + 0.025, 0.45, 0.012, 0.55, 0, F.col('hideFat'), 'hide', { rx: -Math.PI / 2 + lean, round: 2.4, puff: 0.2 });
    for (let k = 0; k < 14; k++) {
      const a = k / 14 * F.TAU, ex = Math.cos(a) * 0.48, ey = 1.02 + Math.sin(a) * 0.62;
      const fx = Math.max(-0.84, Math.min(0.84, Math.cos(a) * 1.2)), fy = Math.max(0.16, Math.min(1.89, 1.02 + Math.sin(a) * 1.1));
      const p = at(ex, ey), q = at(fx, fy); F.rod(p[0], p[1], p[2] + 0.015, q[0], q[1], q[2], 0.006, cord, 'rope');
    }
    if (v) { const p = at(0.4, 0.5); F.box(p[0], p[1], p[2] + 0.04, 0.1, 0.03, 0.03, 0, F.col('bone'), 'bone'); }
  }
});
FURN({
  key: 'ashnomad_fleshing_beam', name: 'Fleshing beam', culture: 'ashnomad', tier: 'common', type: 'workstation', setting: 'both', job: 'tanning',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 0.9 }, materials: ['lacquer', 'hide', 'bone', 'rope'],
  w: 0.8, d: 1.8, h: 1.05, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark');
    F.rod(0, 0.06, -0.85, 0, 0.92, 0.65, 0.11, F.col('chitin'), 'lacquer');
    for (const s of [-1, 1]) F.rod(s * 0.3, 0, 0.45, -s * 0.05, 0.85, 0.5, 0.04, dark, 'lacquer');
    F.ball(0, 0.85, 0.5, 0.06, F.col('ropeHemp'), 'rope');
    const hide = F.col('hideRaw'), slope = Math.atan2(0.86, 1.5), by = z => 0.06 + (z + 0.85) * 0.86 / 1.5;
    F.pillow(0, by(0.3) + 0.12, 0.3, 0.34, 0.025, 0.8, 0, hide, 'hide', { rx: -slope, round: 2.6, puff: 0.4, pinch: 0.08 });
    for (const s of [-1, 1]) F.pillow(s * 0.125, by(0.3) - 0.14, 0.3, 0.7, 0.02, 0.48, s * Math.PI / 2, hide, 'hide', { rx: Math.PI / 2, round: 2.6, puff: 0.3, pinch: 0.12 });
    /* the two-handled scraper: an amber chitin blade, bone grips */
    F.box(0, 0.98, 0.25, 0.42, 0.02, 0.05, 0, F.col('chitinAmber'), 'lacquer');
    for (const s of [-1, 1]) F.rod(s * 0.21, 0.99, 0.25, s * 0.33, 0.99, 0.25, 0.018, F.col('bone'), 'bone');
  }
});
FURN({
  key: 'ashnomad_tanning_vat', name: 'Hide tanning vat', culture: 'ashnomad', tier: 'common', type: 'storage', setting: 'both', job: 'tanning',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 0.6 }, materials: ['lacquer', 'hide', 'rope', 'stone', 'timber', 'bone'],
  w: 1.2, d: 1.2, h: 1.7, variants: 2, variantNames: ['bark liquor', 'lime'],
  build: function (F) {
    /* a hide sack slung in four chitin posts, its rim lashed to them */
    const dark = F.col('chitinDark'), hd = F.col('hideDark'), rope = F.col('ropeHemp');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      F.rod(sx * 0.48, 0, sz * 0.48, sx * 0.46, 0.88, sz * 0.46, 0.03, dark, 'lacquer');
      F.rod(sx * 0.46, 0.78, sz * 0.46, sx * 0.34, 0.78, sz * 0.34, 0.012, rope, 'rope');
    }
    F.blob(0, 0.16, 0, 0.36, 0.3, 0, hd, 'hide');
    F.frustum(0, 0.12, 0, 0.36, 0.47, 0.66, 0, hd, 'hide', 14);
    ASHNOMAD_FX.ring(F, 0, 0.78, 0, 0.48, 16, 0.04, 0.04, F.shade(hd, -0.15), 'hide', 'xz');
    F.cyl(0, 0.74, 0, 0.46, 0.02, 0, F.col(F.variant ? 'lime' : 'liquor'), 'stone');
    F.pillow(0.28, 0.82, 0.28, 0.5, 0.03, 0.36, 0.7, F.col('hideRaw'), 'hide', { rx: 0.35, round: 2.6, puff: 0.3 });
    F.rod(-0.2, 0.6, -0.1, -0.45, 1.65, 0.3, 0.025, F.col('bone'), 'bone');
    if (!F.variant) for (let i = 0; i < 6; i++) F.box(F.rr(-0.5, 0.5), 0, F.rr(0.5, 0.56), 0.08, 0.03, 0.05, F.rr(0, 3), F.col('barkChip'), 'wood');
  }
});
FURN({
  key: 'ashnomad_hide_stack', name: 'Stack of tanned hides', culture: 'ashnomad', tier: 'common', type: 'stack', setting: 'both', job: 'tanning',
  rooms: ['workshop', 'store', 'shop', 'yard'], anchor: 'floor', clearance: { front: 0.5 }, materials: ['lacquer', 'hide'],
  w: 1.2, d: 0.9, h: 0.65, variants: 1,
  build: function (F) {
    for (const x of [-0.28, 0.28]) ASHNOMAD_FX.plate(F, x, 0, 0, 0.56, 0.82, 0.08, 0, F.col('chitinDark'), null);
    const keys = ['hideTanned', 'hideSmoked', 'hideDark', 'hideTanned', 'hide', 'hideSmoked', 'hideDark', 'hideTanned'];
    let y = 0.08;
    for (let i = 0; i < 8; i++) {
      const th = 0.055 + F.rr(0, 0.015);
      F.pillow(F.rr(-0.04, 0.04), y + th / 2, F.rr(-0.03, 0.03), 1.0 - i * 0.02, th, 0.72, F.rr(-0.06, 0.06), F.col(keys[i]), 'hide', { side: 0.5, puff: 0.3, round: 4, pinch: 0.06 });
      y += th;
    }
  }
});
FURN({
  key: 'ashnomad_drying_line', name: 'Hide drying line', culture: 'ashnomad', tier: 'common', type: 'rack', setting: 'outdoor', job: 'tanning',
  rooms: ['yard'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 }, materials: ['lacquer', 'hide', 'rope'],
  w: 3.0, d: 0.25, h: 1.9, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark');
    for (const s of [-1, 1]) { F.rod(s * 1.4, 0, 0, s * 1.4, 1.75, 0, 0.045, dark, 'lacquer'); F.rod(s * 1.4, 1.62, 0, s * 1.48, 1.84, 0, 0.025, dark, 'lacquer'); F.rod(s * 1.4, 1.62, 0, s * 1.32, 1.84, 0, 0.025, dark, 'lacquer'); F.ball(s * 1.4, 1.78, 0, 0.05, F.col('ropeHemp'), 'rope'); }
    F.rod(-1.5, 1.78, 0, 1.5, 1.78, 0, 0.035, F.col('chitin'), 'lacquer');
    const keys = ['hideRaw', 'hideTanned', 'hideDark', 'hideSmoked'];
    for (let i = 0; i < 4; i++) {
      const x = -1.0 + i * 0.68, c = F.col(keys[i]);
      for (const s of [-1, 1]) F.pillow(x, 1.4, s * 0.06, 0.52, 0.018, 0.72, 0, c, 'hide', { rx: -Math.PI / 2 + s * 0.12, round: 2.8, puff: 0.3, pinch: 0.12 });
    }
  }
});

/* ====================================================================== Smithy */
FURN({
  key: 'ashnomad_bellows', name: 'Bag bellows', culture: 'ashnomad', tier: 'common', type: 'workstation', setting: 'both', job: 'smithing',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { back: 0.5 },
  materials: ['hide', 'lacquer', 'bone', 'stone', 'rope'],
  w: 0.8, d: 1.0, h: 0.5, variants: 1,
  build: function (F) {
    /* two hide bag-bellows, chitin boards on top with hand loops, bone nozzles into a clay tuyere */
    const hide = F.col('hide'), bone = F.col('bone'), rope = F.col('ropeHemp');
    for (const s of [-1, 1]) {
      const x = s * 0.18;
      F.pillow(x, 0.13, -0.05, 0.3, 0.24, 0.62, 0, F.shade(hide, s * 0.06), 'hide', { side: 0.5, puff: 0.6, round: 3.5, pinch: 0.12 });
      for (const z of [-0.2, 0.0, 0.18]) F.pillow(x, 0.13, z, 0.305, 0.245, 0.03, 0, F.col('hideDark'), 'hide', { side: 0.5, puff: 0.6, round: 3.5 });
      ASHNOMAD_FX.plate(F, x, 0.245, -0.08, 0.26, 0.48, 0.03, 0, F.col('chitin'), null);
      ASHNOMAD_FX.ring(F, x, 0.36, -0.3, 0.06, 8, 0.014, 0.014, rope, 'rope', 'zy', 0.08);
      F.frustum(x, 0.08, 0.27, 0.06, 0.03, 0.06, 0, F.col('hideDark'), 'hide', 8);
      F.rod(x, 0.11, 0.3, 0, 0.11, 0.4, 0.016, bone, 'bone');
    }
    F.rod(0, 0.11, 0.38, 0, 0.11, 0.5, 0.05, F.col('clayRed'), 'stone');
    F.blob(0, 0.06, 0.44, 0.08, 0.12, 0, F.col('stoneDark'), 'stone');
  }
});

/* ====================================================================== The shaman's hut */
FURN({
  key: 'ashnomad_spirit_pole', name: 'Shaman\'s spirit pole', culture: 'ashnomad', tier: 'common', type: 'statue', setting: 'outdoor',
  rooms: ['yard', 'street', 'temple', 'graveyard'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['stone', 'lacquer', 'bone', 'cloth'],
  w: 0.9, d: 0.9, h: 3.7, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), bone = F.col('bone');
    for (let i = 0; i < 6; i++) {
      const a = i * F.TAU / 6 + F.rr(-0.2, 0.2), hb = F.rr(0.16, 0.22);
      F.blob(Math.cos(a) * 0.22, hb / 2, Math.sin(a) * 0.22, F.rr(0.1, 0.13), hb, 0, F.shade('stoneDark', F.rr(-0.1, 0.15)), 'stone');
    }
    F.rod(0, 0, 0, 0, 3.2, 0, 0.05, dark, 'lacquer');
    /* the stack: carved chitin drums studded with bone, bone discs between, a wing-case pair, a runner skull */
    const drums = ['chitin', 'chitinAmber', 'chitinGreen', 'chitin', 'chitinAmber'];
    let y = 0.3;
    for (let i = 0; i < 5; i++) {
      F.cyl(0, y, 0, 0.13, 0.04, 0, bone, 'bone'); y += 0.04;
      F.frustum(0, y, 0, 0.11, 0.09, 0.26, 0, F.col(drums[i]), 'lacquer', 8);
      for (let k = 0; k < 6; k++) { const a = k * F.TAU / 6 + i * 0.5; F.ball(Math.cos(a) * 0.1, y + 0.13, Math.sin(a) * 0.1, 0.022, bone, 'bone'); }
      y += 0.26;
      if (i === 2) { for (const s of [-1, 1]) ASHNOMAD_FX.carapace(F, s * 0.12, y + 0.12, 0, 0.12, 0.08, 0.3, 0, F.col('chitinAmber'), {}); y += 0.04; }
    }
    ASHNOMAD_FX.skull(F, 0, y, 0.02, 0.26, 0, bone, F.col('clothBlack'));
    /* the crossbars and their ribbons */
    const yb = 2.75;
    F.rod(-0.32, yb, 0, 0.32, yb, 0, 0.02, dark, 'lacquer');
    F.rod(0, yb - 0.07, -0.32, 0, yb - 0.07, 0.32, 0.02, dark, 'lacquer');
    const rib = ['red', 'yellow', 'ochre', 'clothBlack', 'vermilion', 'yellow'];
    for (let i = 0; i < 12; i++) {
      const alongX = i < 6, o = (i % 6 - 2.5) * 0.11, yy = alongX ? yb : yb - 0.07;
      ASHNOMAD_FX.ribbon(F, alongX ? o : 0, yy - 0.02, alongX ? 0 : o, 0.045, F.rr(0.7, 1.0), alongX ? F.rr(-0.4, 0.4) : Math.PI / 2 + F.rr(-0.4, 0.4), rib[i % 6]);
    }
    /* the staghorn beetle's head on top */
    F.cyl(0, 3.18, 0, 0.08, 0.04, 0, bone, 'bone');
    ASHNOMAD_FX.beetleHead(F, 0, 3.22, -0.06, 0.6, 0, dark, F.col('chitin'), F.col('chitinAmber'));
  }
});
FURN({
  key: 'ashnomad_shaman_drum', name: 'Shaman\'s frame drum on a stand', culture: 'ashnomad', tier: 'common', type: 'shrine', setting: 'indoor',
  rooms: ['shrine', 'hall', 'antechamber'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['lacquer', 'hide', 'cloth', 'bone', 'rope'],
  w: 0.7, d: 0.4, h: 1.1, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), skin = F.col('hideRaw'), bone = F.col('bone');
    for (const s of [-1, 1]) {
      F.box(s * 0.3, 0, 0, 0.06, 0.05, 0.4, 0, dark, 'lacquer');
      F.rod(s * 0.3, 0.05, 0, s * 0.3, 1.0, 0, 0.025, dark, 'lacquer');
      F.ball(s * 0.3, 1.02, 0, 0.035, bone, 'bone');
    }
    F.rod(-0.3, 0.97, 0, 0.3, 0.97, 0, 0.016, dark, 'lacquer');
    const cy = 0.6, R = 0.25;
    F.pillow(0, cy, 0, 0.5, 0.02, 0.5, 0, F.shade(skin, -0.06), 'hide', { rx: -Math.PI / 2, round: 2, puff: 0.2, side: 0.6 });
    const dc = { skin: F.css(F.shade(skin, -0.06)), ink: F.css(F.col('clothBlack')), ink2: F.css(F.col('red')) };
    F.decal(0, cy - 0.17, 0.0125, 0.34, 0.34, 0, 'ashnomad-drum', function (g, W, H) { ASHNOMAD_FX.paintDrum(g, W, H, dc); }, 'hide');
    ASHNOMAD_FX.ring(F, 0, cy, 0, R, 20, 0.03, 0.09, F.col('chitinAmber'), 'lacquer', 'xy');
    for (const s of [-1, 1]) {
      F.rod(s * 0.265, cy, 0, s * 0.3, cy, 0, 0.012, dark, 'lacquer');
      F.rod(s * 0.12, cy + 0.22, 0, s * 0.12, 0.97, 0, 0.004, F.col('ropeHemp'), 'rope');
    }
    const rib = ['red', 'yellow', 'ochre'];
    for (let i = 0; i < 3; i++) ASHNOMAD_FX.ribbon(F, -0.08 + i * 0.08, cy - R + 0.01, 0.03, 0.03, 0.18 + F.rr(0, 0.04), F.rr(-0.3, 0.3), rib[i]);
    for (const x of [-0.15, 0.15]) F.ball(x, cy - 0.25, 0.03, 0.02, bone, 'bone');
    F.rod(0.2, 0.05, 0.12, 0.1, 0.5, 0.16, 0.012, bone, 'bone');
    F.blob(0.2, 0.06, 0.12, 0.035, 0.06, 0, F.col('hide'), 'hide');
  }
});
FURN({
  key: 'ashnomad_bone_rack', name: 'Skull and mandible rack', culture: 'ashnomad', tier: 'common', type: 'art', setting: 'indoor',
  rooms: ['shrine', 'hall', 'antechamber'], anchor: 'wall', clearance: {},
  materials: ['lacquer', 'hide', 'bone', 'rope', 'cloth'],
  w: 1.2, d: 0.3, h: 1.5, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), bone = F.col('bone');
    for (const s of [-1, 1]) F.box(s * 0.55, 0, -0.13, 0.05, 1.5, 0.04, 0, dark, 'lacquer');
    for (const y of [0.1, 0.75, 1.36]) { F.box(0, y, -0.12, 1.16, 0.05, 0.05, 0, dark, 'lacquer'); for (const s of [-1, 1]) F.ball(s * 0.55, y + 0.025, -0.11, 0.04, F.col('ropeHemp'), 'rope'); }
    F.box(0, 0.18, -0.14, 1.0, 1.15, 0.02, 0, F.col('hide'), 'hide');
    /* a pair of great staghorn mandibles at the top */
    for (const s of [-1, 1]) {
      const pts = [[s * 0.05, 1.12, -0.1], [s * 0.22, 1.2, -0.06], [s * 0.34, 1.32, -0.03], [s * 0.3, 1.44, 0.0], [s * 0.16, 1.48, 0.02]];
      ASHNOMAD_FX.chain(F, pts, 0.06, 0.025, dark, 'lacquer');
      F.beam(pts[2][0], pts[2][1], pts[2][2], s * 0.46, 1.44, -0.02, 0.03, 0.03, dark, 'lacquer');
      for (let k = 1; k < 4; k++) F.cone(pts[k][0] - s * 0.03, pts[k][1] - 0.02, pts[k][2], 0.012, 0.05, 0, bone, 'bone');
    }
    F.blob(0, 1.12, -0.08, 0.08, 0.1, 0, F.col('chitin'), 'lacquer');
    /* a shelf of runner skulls */
    F.box(0, 0.75, -0.06, 1.1, 0.03, 0.18, 0, dark, 'lacquer');
    for (const x of [-0.34, 0, 0.34]) ASHNOMAD_FX.skull(F, x, 0.78, -0.05, 0.2, 0, bone, F.col('clothBlack'));
    /* crossed bone goads and charms below */
    F.rod(-0.4, 0.15, -0.09, 0.4, 0.62, -0.09, 0.016, bone, 'bone');
    F.rod(0.4, 0.15, -0.08, -0.4, 0.62, -0.08, 0.016, bone, 'bone');
    for (const x of [-0.25, 0, 0.25]) { F.rod(x, 0.72, -0.07, x, 0.5, -0.07, 0.003, F.col('ropeHemp'), 'rope'); F.ball(x, 0.48, -0.07, 0.025, F.col(x ? 'red' : 'yellow'), 'cloth'); }
  }
});
FURN({
  key: 'ashnomad_herb_bundles', name: 'Drying herb bundles', culture: 'ashnomad', tier: 'common', type: 'supply', setting: 'indoor',
  rooms: ['kitchen', 'store', 'shrine', 'hall'], anchor: 'ceiling', clearance: {},
  materials: ['lacquer', 'rope', 'foliage', 'bone'],
  w: 1.0, d: 0.2, h: 0.6, variants: 1,
  build: function (F) {
    const rope = F.col('ropeHemp');
    for (const s of [-1, 1]) {
      F.cyl(s * 0.42, 0.585, 0, 0.025, 0.015, 0, F.col('bone'), 'bone');
      F.rod(s * 0.42, 0.59, 0, s * 0.42, 0.5, 0, 0.006, rope, 'rope');
    }
    F.rod(-0.48, 0.5, 0, 0.48, 0.5, 0, 0.015, F.col('chitinDark'), 'lacquer');
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
FURN({
  key: 'ashnomad_smoke_bowl', name: 'Smoke bowl on a tripod', culture: 'ashnomad', tier: 'common', type: 'brazier', setting: 'indoor',
  rooms: ['shrine', 'hall', 'bedroom', 'antechamber'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['lacquer', 'stone', 'emissive', 'foliage', 'glass', 'bone'],
  w: 0.4, d: 0.4, h: 0.72, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), clay = F.col('clayRed');
    const mids = [];
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      F.rod(c * 0.17, 0.0, s * 0.17, c * 0.07, 0.5, s * 0.07, 0.012, dark, 'lacquer');
      F.ball(c * 0.17, 0.015, s * 0.17, 0.02, F.col('bone'), 'bone');
      mids.push([c * 0.11, 0.3, s * 0.11]);
    }
    for (let i = 0; i < 3; i++) { const p = mids[i], q = mids[(i + 1) % 3]; F.rod(p[0], p[1], p[2], q[0], q[1], q[2], 0.006, F.col('ropeHemp'), 'lacquer'); }
    F.frustum(0, 0.48, 0, 0.05, 0.13, 0.09, 0, clay, 'stone', 14);
    ASHNOMAD_FX.ring(F, 0, 0.565, 0, 0.128, 14, 0.014, 0.014, F.col('clothBlack'), 'stone', 'xz');
    F.blob(0, 0.57, 0, 0.11, 0.03, 0, F.col('ember'), 'glow');
    for (let i = 0; i < 3; i++) F.box(F.rr(-0.05, 0.05), 0.578, F.rr(-0.05, 0.05), 0.06, 0.012, 0.02, F.rnd() * 3, F.col('herbGreen'), 'plant');
    F.blob(0.01, 0.62, 0, 0.04, 0.06, 0, F.col('smoke'), 'glass');
    F.blob(-0.01, 0.665, 0.01, 0.035, 0.06, 0, F.col('smoke'), 'glass');
    F.lamp(0, 0.6, 0, 0.3, 3);
  }
});
FURN({
  key: 'ashnomad_skull_shrine', name: 'Skull altar', culture: 'ashnomad', tier: 'common', type: 'altar', setting: 'indoor',
  rooms: ['shrine', 'hall'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['stone', 'lacquer', 'hide', 'cloth', 'bone', 'emissive', 'food'],
  w: 1.3, d: 0.75, h: 0.8, variants: 1,
  build: function (F) {
    const bone = F.col('bone'), blk = F.col('clothBlack');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.blob(sx * 0.48, 0.16, sz * 0.2, 0.13, 0.32, 0, F.shade('stoneDark', F.rr(-0.05, 0.1)), 'stone');
    ASHNOMAD_FX.plate(F, 0, 0.3, 0, 1.26, 0.7, 0.1, 0, F.col('chitinDark'), F.col('hideDark'));
    /* the black cloth, its front drape painted with a fret and a spiral */
    F.box(0, 0.4, 0, 0.9, 0.012, 0.6, 0, blk, 'cloth');
    F.box(0, 0.12, 0.31, 0.9, 0.29, 0.012, 0, blk, 'cloth');
    const cc = { field: F.css(blk), ground: F.css(F.col('red')), ink: F.css(F.col('yellow')), ink2: F.css(F.col('red')) };
    F.decal(0, 0.13, 0.3175, 0.86, 0.26, 0, 'ashnomad-altar-cloth', function (g, W, H) { ASHNOMAD_FX.paintFront(g, W, H, cc, 'spiral'); }, 'cloth');
    for (let i = 0; i < 7; i++) ASHNOMAD_FX.tassel(F, -0.42 + i * 0.14, 0.12, 0.314, 0.08, F.col(i % 2 ? 'yellow' : 'red'), blk);
    /* a staghorn beetle's skull in the middle, runners' skulls either side, candles and an offering of grubs */
    ASHNOMAD_FX.beetleHead(F, 0, 0.41, -0.1, 0.5, 0, F.col('chitinDark'), F.col('chitin'), F.col('chitinAmber'));
    for (const s of [-1, 1]) ASHNOMAD_FX.skull(F, s * 0.4, 0.41, -0.05, 0.22, -s * 0.3, bone, blk);
    for (const [x, z, h] of [[-0.22, 0.18, 0.14], [0.22, 0.18, 0.1], [-0.55, 0.2, 0.12], [0.55, 0.2, 0.16]]) {
      F.cyl(x, 0.41, z, 0.025, h, 0, F.col('candle'), 'stone');
      F.cone(x, 0.41 + h, z, 0.013, 0.04, 0, F.col('flame'), 'glow');
    }
    F.frustum(0, 0.41, 0.2, 0.05, 0.08, 0.05, 0, F.col('clayRed'), 'stone', 12);
    for (let i = 0; i < 5; i++) F.ball(F.rr(-0.04, 0.04), 0.46, 0.2 + F.rr(-0.04, 0.04), 0.016, F.col('grub'), 'food');
    F.lamp(0, 0.7, 0.15, 0.4, 4);
  }
});

/* ====================================================================== The chief's tent and the assembly (court) */
FURN({
  key: 'ashnomad_chief_seat', name: 'Chieftain\'s high seat', culture: 'ashnomad', tier: 'court', type: 'chair', setting: 'indoor',
  rooms: ['hall', 'court'], anchor: 'floor', clearance: { front: 1.0, left: 0.4, right: 0.4 },
  materials: ['lacquer', 'gold', 'cloth', 'hide'],
  w: 1.2, d: 1.0, h: 2.25, variants: 1,
  build: function (F) {
    const amber = F.col('chitinAmber'), dark = F.col('chitinDark'), gold = F.col('gold'), red = F.col('red'), yel = F.col('yellow'), hd = F.col('hideDark');
    /* the dais and the plated seat box, a fret painted on its front */
    ASHNOMAD_FX.plate(F, 0, 0, 0, 1.16, 0.96, 0.1, 0, dark, hd);
    F.box(0, 0.1, 0.0, 0.8, 0.34, 0.62, 0, dark, 'lacquer');
    ASHNOMAD_FX.platePanel(F, 0, 0.27, 0.32, 0.84, 0.34, 0.04, 0, amber, hd);
    const cc = { field: F.css(F.col('clothBlack')), ground: F.css(red), ink: F.css(F.col('gold')), ink2: F.css(yel) };
    F.decal(0, 0.15, 0.345, 0.66, 0.24, 0, 'ashnomad-chief-seat', function (g, W, H) { ASHNOMAD_FX.paintFront(g, W, H, cc, 'beetle'); }, 'lacquer');
    F.pillow(0, 0.5, 0.04, 0.78, 0.14, 0.6, 0, red, 'cloth', { side: 0.3, puff: 0.9, pinch: 0.05 });
    for (const s of [-1, 1]) ASHNOMAD_FX.tassel(F, s * 0.37, 0.48, 0.32, 0.1, gold, yel, 'gold');
    /* the back: a great carapace stood on end, bound with hide, a gilt seam and amber eye-spots */
    const th = -Math.PI / 2 - 0.12, ct = Math.cos(th), st = Math.sin(th), cy = 1.25, cz = -0.34;
    const top = F.pillow(0, cy, cz, 1.0, 0.14, 1.5, 0, dark, 'lacquer', { rx: th, round: 2.3, puff: 0.7, side: 0.1 });
    F.pillow(0, cy, cz, 1.02, 0.04, 1.52, 0, hd, 'hide', { rx: th, round: 2.3, puff: 0.3, side: 0.9 });
    const front = (lx, lz, off) => { const t = -(top(lx, lz) + (off || 0.004)); return [lx, cy + t * ct - lz * st, cz + t * st + lz * ct]; };
    const seam = []; for (let i = 0; i <= 10; i++) seam.push(front(0, -0.66 + i * 0.132));
    ASHNOMAD_FX.chain(F, seam, 0.025, 0.025, gold, 'gold');
    for (const s of [-1, 1]) { const p = front(s * 0.24, 0.3, 0.0); F.ball(p[0], p[1], p[2] + 0.01, 0.06, amber, 'lacquer'); F.ball(p[0], p[1], p[2] + 0.04, 0.03, gold, 'gold'); }
    /* gilt mandibles over it */
    for (const s of [-1, 1]) {
      const pts = [[s * 0.3, 1.9, -0.42], [s * 0.45, 2.02, -0.38], [s * 0.42, 2.14, -0.34], [s * 0.22, 2.19, -0.32], [s * 0.08, 2.16, -0.3]];
      ASHNOMAD_FX.chain(F, pts, 0.07, 0.025, gold, 'gold');
      F.beam(pts[1][0], pts[1][1], pts[1][2], s * 0.55, 2.1, -0.36, 0.03, 0.03, gold, 'gold');
    }
    /* millipede-segment arms ending in gilt knobs; a yellow bolster against the back */
    for (const s of [-1, 1]) {
      for (let k = 0; k < 5; k++) F.blob(s * 0.43, 0.68, -0.2 + k * 0.12, 0.07, 0.11, 0, k % 2 ? amber : dark, 'lacquer');
      F.ball(s * 0.43, 0.68, 0.35, 0.05, gold, 'gold');
      F.rod(s * 0.43, 0.1, 0.3, s * 0.43, 0.63, 0.3, 0.025, dark, 'lacquer');
    }
    F.bolster(0, 0.66, -0.17, 0.72, 0.08, 0, yel, 'cloth');
    for (const x of [-0.25, 0.25]) F.bolster(0, 0.66, -0.17, 0.72, 0.08, 0, gold, 'gold', { from: (x + 0.36) / 0.72 - 0.02, to: (x + 0.36) / 0.72 + 0.02, grow: 1.05 });
  }
});
FURN({
  key: 'ashnomad_chief_divan', name: 'Chieftain\'s divan', culture: 'ashnomad', tier: 'court', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'court', 'bedroom', 'antechamber'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['lacquer', 'gold', 'cloth', 'hide'],
  w: 2.4, d: 1.0, h: 0.95, variants: 1,
  build: function (F) {
    const amber = F.col('chitinAmber'), dark = F.col('chitinDark'), gold = F.col('gold'), hd = F.col('hideDark');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.blob(sx * 1.1, 0.03, sz * 0.4, 0.05, 0.06, 0, gold, 'gold');
    F.box(0, 0.04, -0.02, 2.3, 0.3, 0.9, 0, dark, 'lacquer');
    for (let i = 0; i < 6; i++) {
      const x = -1.0 + i * 0.4;
      ASHNOMAD_FX.platePanel(F, x, 0.19, 0.455, 0.4, 0.3, 0.04, 0, F.shade(amber, F.rr(-0.06, 0.06)), hd);
      ASHNOMAD_FX.platePanel(F, x, 0.62, -0.47, 0.4, 0.46, 0.04, 0, F.shade(amber, F.rr(-0.06, 0.06)), hd);
      F.ball(x, 0.31, 0.48, 0.02, gold, 'gold');
      F.ball(x, 0.84, -0.47, 0.025, gold, 'gold');
    }
    const sc = { field: F.css(F.col('clothBlack')), ink: F.css(F.col('yellow')), ink2: F.css(F.col('red')) };
    F.box(0, 0.09, 0.48, 2.2, 0.12, 0.012, 0, F.col('red'), 'cloth');
    F.decal(0, 0.095, 0.4875, 2.16, 0.11, 0, 'ashnomad-divan-band', function (g, W, H) { ASHNOMAD_FX.paintStrip(g, W, H, sc); }, 'cloth');
    F.pillow(0, 0.42, 0, 2.3, 0.16, 0.9, 0, F.col('red'), 'cloth', { side: 0.5, puff: 0.45, pinch: 0.01 });
    F.rod(-1.12, 0.48, 0.44, 1.12, 0.48, 0.44, 0.012, gold, 'gold');
    const cush = ['yellow', 'clothBlack', 'ochre', 'vermilion'];
    for (let i = 0; i < 4; i++) {
      const x = -0.78 + i * 0.52, rx = -Math.PI / 2 - 0.15;
      F.pillow(x, 0.7, -0.3, 0.5, 0.17, 0.46, 0, F.col(cush[i]), 'cloth', { rx: rx, puff: 0.9, pinch: 0.07 });
      F.pillow(x, 0.7, -0.3, 0.1, 0.178, 0.462, 0, F.col(i % 2 ? 'red' : 'clothBlack'), 'cloth', { rx: rx, puff: 0.9, pinch: 0 });
    }
    for (const s of [-1, 1]) {
      const L = 0.8;
      F.bolster(s * 1.06, 0.6, 0, L, 0.11, Math.PI / 2, F.col('ochre'), 'cloth');
      for (const z of [-0.3, 0.3]) F.bolster(s * 1.06, 0.6, 0, L, 0.11, Math.PI / 2, gold, 'gold', { from: (z + L / 2) / L - 0.02, to: (z + L / 2) / L + 0.02, grow: 1.04 });
    }
  }
});
FURN({
  key: 'ashnomad_war_standard', name: 'Chieftain\'s war standard', culture: 'ashnomad', tier: 'court', type: 'banner', setting: 'both',
  rooms: ['hall', 'court', 'antechamber', 'yard', 'plaza'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['lacquer', 'gold', 'cloth', 'stone', 'bone', 'rope'],
  w: 1.1, d: 0.7, h: 3.65, variants: 1,
  build: function (F) {
    const dark = F.col('chitinDark'), gold = F.col('gold'), blk = F.col('clothBlack');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      ASHNOMAD_FX.leg(F, [c * 0.3, 0, s * 0.3], [c * 0.22, 0.28, s * 0.22], [c * 0.03, 0.5, s * 0.03], 0.025, dark, 'lacquer');
      F.ball(c * 0.3, 0.025, s * 0.3, 0.03, F.col('bone'), 'bone');
    }
    F.blob(0, 0.08, 0, 0.12, 0.16, 0, F.col('stoneDark'), 'stone');
    F.rod(0, 0, 0, 0, 3.24, 0, 0.035, dark, 'lacquer');
    for (const y of [0.55, 1.0, 3.05]) F.cyl(0, y, 0, 0.045, 0.04, 0, gold, 'gold');
    F.rod(-0.5, 3.0, 0.05, 0.5, 3.0, 0.05, 0.02, dark, 'lacquer');
    for (const s of [-1, 1]) { F.ball(s * 0.51, 3.0, 0.05, 0.03, gold, 'gold'); ASHNOMAD_FX.ribbon(F, s * 0.48, 2.98, 0.06, 0.05, 1.2, 0, s < 0 ? 'red' : 'yellow'); }
    /* the great banner: a sun-disc over the hummingbird */
    F.box(0, 1.05, 0.05, 0.86, 1.93, 0.012, 0, blk, 'cloth');
    const c = { field: F.css(blk), edge: F.css(gold), ink: F.css(F.col('yellow')), ink2: F.css(F.col('red')) };
    F.decal(0, 1.05, 0.062, 0.86, 1.93, 0, 'ashnomad-war-standard', function (g, W, H) { ASHNOMAD_FX.paintSun(g, W, H, c); }, 'cloth');
    for (let i = 0; i < 7; i++) ASHNOMAD_FX.tassel(F, -0.36 + i * 0.12, 1.05, 0.055, 0.16, i % 2 ? gold : F.col('red'), blk, i % 2 ? 'gold' : 'cloth');
    /* the gilt sun-disc on top: a disc, a red ring, a boss, rays */
    const sy = 3.38;
    F.pillow(0, sy, 0, 0.32, 0.04, 0.32, 0, gold, 'gold', { rx: -Math.PI / 2, round: 2, puff: 0.5, side: 0.4 });
    F.pillow(0, sy, 0.012, 0.2, 0.04, 0.2, 0, F.col('red'), 'cloth', { rx: -Math.PI / 2, round: 2, puff: 0.5, side: 0.4 });
    F.ball(0, sy, 0.03, 0.04, gold, 'gold');
    for (let k = 0; k < 12; k++) { const a = k * F.TAU / 12, r1 = 0.17, r2 = k % 2 ? 0.23 : 0.26; F.beam(Math.cos(a) * r1, sy + Math.sin(a) * r1, 0, Math.cos(a) * r2, sy + Math.sin(a) * r2, 0, 0.03, 0.02, gold, 'gold'); }
  }
});

/* training furniture (FK.ROLES.training, 2026-10): a melee and a ranged practice piece in this culture's style sheet, keyed ashnomad_training_<role> */
FK.set({ culture: 'ashnomad', tier: 'common', roles: 'training', prefix: 'ashnomad_training_', S: ASHNOMAD_COMMON, names: {
  training_dummy: 'Chitin-plated practice dummy', archery_butt: 'Painted hide target' } });
