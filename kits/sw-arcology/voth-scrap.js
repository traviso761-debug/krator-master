/* ======================================================================
   Voth: scrap Voth (voth-scrap). The owner, 2026-11-12: "a 'scrap Voth'
   along similar principles [to scrap Xanadu]: the dark elven/Dunmer
   character shines through with scrap carefully integrated."
   catalog/PLAN-SCRAP.md has the rules: the Vothic body (battered basalt,
   capped pylons, small domes, Hlaalu roofs, Redoran shells, the diamond)
   stays in charge; the Ancients' scrap takes over only where Voth had a
   piece of the same form: a tank head for a dome, hull plates for a shell
   roof, girders for flying buttresses, verdigris panels for a copper roof,
   glass in the slit windows, cable on the rails, bronze on the caps.
   Opt-in: shown on the catalog page (index.html?src=voth-scrap), not in
   the city build's kit, so core/city does not place these in Voth.
   Conventions as in voth-housing: +z is the FRONT; side s: 0 = +z,
   1 = -z, 2 = +x, 3 = -x; a block B is {x, z, w, d}.
   ====================================================================== */
(function () {
  /* ---- palette: Voth's (src/05-palette.js), and the scrap greyed into its ashen family ---- */
  const STONE = [0x8c8579, 0x958e80, 0x87816f, 0x97907f, 0x9a9384, 0x8f8873, 0xa19a8a, 0x928c7c];
  const STONE_POOR = [0x8b8069, 0x7e7460, 0x968b73, 0x726851, 0x877d66];
  const BASALT = [0x2b2a28, 0x322f2b, 0x242220];
  const PORPH = [0x5e1e2d, 0x6a2434, 0x521826];
  const MUD = [0x6b5c46, 0x76664d, 0x6f6149];
  const SAIL = [0xcfc2a3, 0xc0b190, 0xb8a880, 0xa89878];
  const BANNER = [0x7a2028, 0x8a2f2a, 0x5c4028, 0xc9b8d6, 0xb0c8d8];
  const TIMBERS = [0x4a3a28, 0x5a4a34, 0x5d5140];
  const PANEL = [0xc9c6bb, 0xbfbcb1, 0xd2cfc4, 0xb8b5aa];      /* the Ancients' white, weathered to ash */
  const VERD = [0x5f8a74, 0x557d69, 0x6a957f];                  /* the hull's copper skin, olive-green */
  const STEEL = 0x34322e, BRONZE = 0xa8823e, GOLD = 0xd0a53c, GLASSC = 0x7fb2cc;
  const DOOR = 0x1c1a16, GLOW = 0xffcf87, TIMBER = 0x4a3a28, CABLE = 0x2c2e32;
  /* the surfaces by texture family ('tex/render': core/catalog mat() keeps the render family's look and sets
     userData.texFamily), so a page that loads the library's detail maps (catalog/materials.json -> tex/ -> tex/kf-tex.js,
     core/catalog/krator-furniture-detail.js) gives each its grain; without them they draw as before, in plain colour */
  const FS = 'vsStone/stone', FB = 'vsBasalt/stone', FM = 'vsMud/stone', FP = 'vsPanel/plastic', FV = 'vsVerd/plastic';
  const FT = 'vsSteel/metal', FZ = 'vsBronze/bronze', FW = 'vsWood/wood', FC = 'vsCloth/cloth';
  const FK = 'vsCont/metal', FD = 'vsSand/stone';   /* the containers' corrugated steel, the arena's sand */

  /* the walk records (catalog/README.md, "Walk records"): every stair or ladder a person climbs */
  function walkRec(F, kind, ax, ay, az, bx, by, bz, w) {
    if (F.walk) { F.walk(kind, ax, ay, az, bx, by, bz, w); return; }
    const R = typeof window !== 'undefined' ? window.KWALK_REC : null; if (!R) return;
    const c = Math.cos(F.ry == null ? 0 : F.ry), s = Math.sin(F.ry == null ? 0 : F.ry), y = (F.y == null ? 0 : F.y);
    R.push({ kind: kind, a: [F.x + ax * c + az * s, F.z - ax * s + az * c, y + ay], b: [F.x + bx * c + bz * s, F.z - bx * s + bz * c, y + by], w: w });
  }

  /* ================================================================ kit */
  function kit(F) {
    const K = {}, N = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    K.at = function (B, s, u, off) { const n = N[s]; return s < 2 ? [B.x + u, B.z + n[1] * (B.d / 2 + off)] : [B.x + n[0] * (B.w / 2 + off), B.z + u]; };
    K.fb = function (B, s, u, y, along, h, dep, off, col, fam) { const p = K.at(B, s, u, off); F.box(p[0], y, p[1], s < 2 ? along : dep, h, s < 2 ? dep : along, 0, col, fam || FS); };
    /* the diamond on a face (Voth's sign): a square turned on its point, `k` from the centre to a point */
    K.dia = function (B, s, u, y, k, off, col, fam, t) {
      const p = K.at(B, s, u, off), L = k * Math.SQRT2, th = t == null ? 0.08 : t;
      if (s < 2) F.beam(p[0] - k / 2, y - k / 2, p[1], p[0] + k / 2, y + k / 2, p[1], L, th, col, fam || FZ);
      else F.beam(p[0], y - k / 2, p[1] - k / 2, p[0], y + k / 2, p[1] + k / 2, th, L, col, fam || FZ);
    };
    /* panel courses on face s of B from y0 up h: whole Ancient panels with a shadow joint; skip(u, y) leaves cells open */
    K.plates = function (B, s, y0, h, o) {
      o = o || {}; const along = s < 2 ? B.w : B.d, n = Math.max(1, Math.round(along / (o.pw == null ? 1.6 : o.pw))), m = Math.max(1, Math.round(h / (o.ph == null ? 0.9 : o.ph)));
      const pw = along / n, ph = h / m, g = 0.05, cols = o.cols || PANEL;
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
        const u = -along / 2 + pw * (i + 0.5), y = y0 + j * ph;
        if (o.skip && o.skip(u, y + ph / 2)) continue;
        const c = o.pat === 'band' && j === m - 1 ? (o.band || PORPH[0]) : shade(cols[(i * 7 + j * 3) % cols.length], (F.rnd() - 0.5) * 0.06);
        K.fb(B, s, u, y + g / 2, pw - g, ph - g, 0.07, 0.035, c, FP);
      }
    };
    /* a slit window, Dunmer-tall: a dark reveal, the Ancients' glass (amber when lit) in a bronze frame, a small diamond over it */
    K.slit = function (B, s, u, y, w, h, o) {
      o = o || {}; const off = (o.off == null ? 0 : o.off);
      K.fb(B, s, u, y, w, h, 0.3, off - 0.1, o.lit ? GLOW : DOOR, o.lit ? 'glow' : FW);
      if (!o.lit) K.fb(B, s, u, y + 0.03, w - 0.06, h - 0.06, 0.03, off + 0.06, GLASSC, 'glass');
      [-1, 1].forEach(function (k) { K.fb(B, s, u + k * (w / 2 + 0.05), y - 0.05, 0.1, h + 0.1, 0.12, off + 0.02, BRONZE, FZ); });
      K.fb(B, s, u, y - 0.12, w + 0.3, 0.12, 0.22, off + 0.04, o.sill || shade(STONE[0], -0.2), FS);
      if (o.dia !== false) K.dia(B, s, u, y + h + 0.32, 0.36, off + 0.04, BRONZE, FZ, 0.06);
    };
    /* a door: leaf (timber or an Ancient panel), stone jambs, a girder lintel, a threshold step, the diamond over it */
    K.door = function (B, s, u, y, dw, dh, o) {
      o = o || {}; const off = (o.off == null ? 0 : o.off), wall = o.wall || STONE[0];
      K.fb(B, s, u, y, dw, dh, 0.2, off - 0.05, o.leaf || TIMBERS[0], o.panel ? FP : FW);
      [-1, 1].forEach(function (k) { K.fb(B, s, u + k * (dw / 2 + 0.14), y, 0.28, dh + 0.1, 0.36, off, shade(wall, -0.15), FS); });
      K.fb(B, s, u, y + dh + 0.06, dw + 0.8, 0.3, 0.3, off + 0.06, STEEL, FT);
      K.fb(B, s, u, Math.max(0, y - 0.16), dw + 0.6, 0.16, 0.7, off + 0.3, shade(wall, -0.25), FS);
      if (o.dia !== false) K.dia(B, s, u, y + dh + 0.9, (o.diaK == null ? 0.5 : o.diaK), off + 0.12, o.diaC || BRONZE, o.diaC === GOLD ? 'gold' : FZ);
      if (o.lamp) { const p = K.at(B, s, u + dw / 2 + 0.55, off + 0.28); F.cyl(p[0], y + dh - 0.2, p[1], 0.12, 0.34, 0, GLOW, 'glow'); F.cyl(p[0], y + dh + 0.14, p[1], 0.16, 0.06, 0, BRONZE, FZ); }
    };
    K.parapet = function (B, y, h, t, col) {
      F.box(B.x, y, B.z + B.d / 2 - t / 2, B.w, h, t, 0, col, FS); F.box(B.x, y, B.z - B.d / 2 + t / 2, B.w, h, t, 0, col, FS);
      F.box(B.x + B.w / 2 - t / 2, y, B.z, t, h, B.d - 2 * t, 0, col, FS); F.box(B.x - B.w / 2 + t / 2, y, B.z, t, h, B.d - 2 * t, 0, col, FS);
    };
    /* a capped pylon (Velothi): a battered stone pier, its cap a bronze cone */
    K.pylon = function (x, z, y, r, h, col) { F.frustum(x, y, z, r, r * 0.72, h, 0, col, FS, 4); F.box(x, y + h, z, r * 1.7, 0.12, r * 1.7, 0, STEEL, FT); F.cone(x, y + h + 0.12, z, r * 0.8, r * 1.6, 0, BRONZE, FZ); };
    /* a whole Ancient tank stood up: its body, blackened steel bands */
    K.tank = function (x, z, y, r, h, col, o) { o = o || {}; F.cyl(x, y, z, r, h, 0, col, FP); const st = o.band == null ? 1.6 : o.band; for (let yy = st; yy < h - 0.2; yy += st) F.cyl(x, y + yy - 0.06, z, r + 0.04, 0.12, 0, STEEL, FT); return y + h; };
    /* an Ancient tank head as a dome, ribbed with blackened girders, a bronze finial */
    K.tankDome = function (x, z, y, r, h, col, o) {
      o = o || {}; F.dome(x, y, z, r, h, 0, col, FP); const n = (o.ribs == null ? 8 : o.ribs);
      for (let i = 0; i < n; i++) { const a = i / n * TAU; let px = r * 1.01, py = 0;
        for (let k = 1; k <= 3; k++) { const t = k / 3 * Math.PI / 2, qx = r * 1.01 * Math.cos(t), qy = h * 1.01 * Math.sin(t);
          F.beam(x + Math.sin(a) * px, y + py, z + Math.cos(a) * px, x + Math.sin(a) * qx, y + qy, z + Math.cos(a) * qx, 0.09, 0.09, STEEL, FT); px = qx; py = qy; } }
      F.cyl(x, y + h - 0.05, z, 0.18, 0.2, 0, BRONZE, FZ); F.cyl(x, y + h + 0.15, z, 0.06, o.fin == null ? 0.8 : o.fin, 0, BRONZE, FZ); F.ball(x, y + h + 0.15 + (o.fin == null ? 0.8 : o.fin), z, 0.15, o.gold ? GOLD : BRONZE, o.gold ? 'gold' : FZ);
      return y + h;
    };
    /* a carapace of hull plates (the Redoran shell in Ancient copper): n overlapping half-shells along z, centred on the wall top
       (their lower halves inside the walls: w is the walls' width), a girder rib over each, a bronze boss on its crown */
    K.carapace = function (x, z, y, w, d, h, o) {
      o = o || {}; const n = (o.n == null ? 3 : o.n), seg = d / n, col = o.col || VERD[0];
      for (let i = 0; i < n; i++) {
        const zc = z - d / 2 + seg * (i + 0.5), hh = h * (1 - 0.08 * Math.abs(i - (n - 1) / 2));
        F.ell(x, y, zc, w / 2, hh, seg * 0.62, 0, shade(col, (i % 2 ? -0.05 : 0.03)), FV);
        let px = -w / 2 - 0.02, py = 0;
        for (let k = 1; k <= 6; k++) { const t = k / 6 * Math.PI, qx = -Math.cos(t) * (w / 2 + 0.02), qy = Math.sin(t) * (hh + 0.02);
          F.beam(x + px, y + py, zc, x + qx, y + qy, zc, 0.12, 0.12, STEEL, FT); px = qx; py = qy; }
        F.cyl(x, y + hh - 0.05, zc, 0.22, 0.2, 0, BRONZE, FZ);
      }
    };
    /* a flying buttress of girders: a pier standing out from the wall, a girder from its head to the wall */
    K.buttress = function (px, pz, wx, wz, hp, hw, col) { F.frustum(px, 0, pz, 0.45, 0.32, hp, 0, col, FS, 4); F.cone(px, hp, pz, 0.36, 0.6, 0, BRONZE, FZ);
      F.beam(px, hp - 0.3, pz, wx, hw, wz, 0.26, 0.26, STEEL, FT); };
    /* a cable rail: girder posts every ~1.5 m, two cables, a bronze rail */
    K.rail = function (x0, z0, x1, z1, y) { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 1.5));
      for (let i = 0; i <= n; i++) { const t = i / n; F.box(x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, 0.09, 1.0, 0.09, 0, STEEL, FT); }
      [0.38, 0.7].forEach(function (h) { F.rod(x0, y + h, z0, x1, y + h, z1, 0.012, CABLE, FT); });
      F.rod(x0, y + 1.02, z0, x1, y + 1.02, z1, 0.035, BRONZE, FZ); };
    /* a solid stone flight from (x0, z0) at y0 to (x1, z1) at y1, recorded for the walkers */
    K.flight = function (x0, z0, x1, z1, y0, y1, wd, col) {
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round((y1 - y0) / 0.2)), ry = Math.atan2(x1 - x0, z1 - z0);
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; F.box(x0 + (x1 - x0) * t, y0, z0 + (z1 - z0) * t, wd, (y1 - y0) * (i + 1) / n, L / n + 0.02, ry, col, FS); }
      walkRec(F, 'stair', x0, y0, z0, x1, y1, z1, wd);
    };
    K.ladder = function (x, z, y0, y1, ry) { const c = Math.cos(ry), s = Math.sin(ry);
      [-0.25, 0.25].forEach(function (k) { F.rod(x + k * c, y0, z - k * s, x + k * c, y1 + 0.8, z - k * s, 0.04, TIMBER, FW); });
      for (let yy = y0 + 0.3; yy < y1 + 0.6; yy += 0.32) F.rod(x - 0.25 * c, yy, z + 0.25 * s, x + 0.25 * c, yy, z - 0.25 * s, 0.025, TIMBER, FW);
      walkRec(F, 'ladder', x, y0, z, x, y1, z, 0.5); };
    /* flat cloth on a frame of four poles (never tilted cloth: voth-housing's rule) */
    K.canopy = function (x, z, y, w, d, cloth) { [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.rod(x + p[0] * w / 2, y, z + p[1] * d / 2, x + p[0] * w / 2, y + 2.3, z + p[1] * d / 2, 0.05, TIMBER, FW); });
      F.box(x, y + 2.3, z, w + 0.2, 0.05, d + 0.2, 0, cloth, FC); };
    K.jar = function (x, z, y, s) { F.ell(x, y + 0.32 * s, z, 0.24 * s, 0.34 * s, 0.24 * s, 0, F.pick([0x8a5a3a, 0x6b4a32, 0x9a7a5a]), 'ceramic'); };
    K.crate = function (x, z, y, s) { F.box(x, y, z, 0.7 * s, 0.6 * s, 0.7 * s, F.rr(-0.3, 0.3), 0x7a6040, FW); };
    K.banner = function (B, s, u, y, h, col) { const p = K.at(B, s, u, 0.18); F.box(p[0], y - h, p[1], s < 2 ? 0.9 : 0.05, h, s < 2 ? 0.05 : 0.9, 0, col, FC); const q = K.at(B, s, u, 0.3); F.rod(q[0] - (s < 2 ? 0.55 : 0), y, q[1] - (s < 2 ? 0 : 0.55), q[0] + (s < 2 ? 0.55 : 0), y, q[1] + (s < 2 ? 0 : 0.55), 0.04, BRONZE, FZ); };
    return K;
  }

  /* ================================================================ poor */
  function poor(F, K) {
    const c = F.pick(STONE_POOR), mud = F.pick(MUD), bas = F.pick(BASALT), pan = F.pick(PANEL), cloth = F.pick(SAIL);
    if (F.variant === 0) {
      /* -------- tank hovel: a whole tank stood on a basalt ring, a battered mud lean-to beside it with a roof terrace */
      F.cyl(0, 0, 0, 2.7, 0.4, 0, bas, FB);
      const top = K.tank(0, 0, 0.4, 2.4, 3.2, pan);
      K.tankDome(0, 0, top, 2.45, 1.1, shade(pan, -0.04), { ribs: 6, fin: 0.4 });
      const T = { x: 0, z: 0, w: 4.8, d: 4.8 };
      K.door(T, 0, 0, 0.4, 1.0, 2.1, { wall: c, diaK: 0.4, off: -0.06 });
      [[2, 0], [3, 0], [1, 0]].forEach(function (w) { K.slit(T, w[0], w[1], 1.6, 0.35, 1.1, { off: -0.08, dia: false }); });
      const L = { x: -3.6, z: 0.4, w: 2.8, d: 3.4 };
      F.frustum(L.x, 0, L.z, 1.5, 1.32, 2.6, 0, mud, FM, 4);
      F.box(L.x, 2.6, L.z, 2.9, 0.18, 3.0, 0, shade(mud, -0.15), FM);
      K.door({ x: L.x, z: L.z, w: 2.64, d: 2.64 }, 0, 0, 0, 0.9, 1.9, { wall: mud, dia: false, off: 0.05 });
      K.canopy(L.x, L.z, 2.78, 2.2, 2.2, cloth);
      K.jar(L.x - 0.7, L.z - 0.6, 2.78, 1); K.jar(L.x + 0.6, L.z - 0.7, 2.78, 0.8); K.crate(L.x + 0.4, L.z + 0.5, 2.78, 0.8);
      K.ladder(L.x - 1.75, L.z + 1.2, 0, 2.78, Math.PI / 2);
      F.rod(1.2, top + 0.5, -1.2, 1.2, top + 1.6, -1.2, 0.1, STEEL, FT);   /* the stove pipe */
      K.jar(1.9, 2.2, 0, 1.1); K.crate(-1.5, 2.6, 0, 1);
    } else if (F.variant === 1) {
      /* -------- carapace hovel: battered mud walls under two overlapping hull shells, girder ribs, a panel lean-to */
      const B = { x: 0, z: 0, w: 5.0, d: 4.2 };
      F.frustum(0, 0, 0, 2.55, 2.35, 2.4, 0, mud, FM, 4);
      F.box(0, 0, 0, 5.4, 0.35, 4.6, 0, bas, FB);
      K.carapace(0, 0, 2.4, 4.68, 4.0, 1.7, { n: 2, col: F.pick(VERD) });
      K.door(B, 0, -0.9, 0.35, 0.95, 1.9, { wall: mud, off: -0.15, diaK: 0.35 });
      K.slit(B, 0, 1.2, 1.0, 0.35, 0.9, { off: -0.15, lit: true, dia: false });
      K.slit(B, 2, 0, 1.0, 0.35, 0.9, { off: -0.15, dia: false }); K.slit(B, 1, 0.6, 1.0, 0.35, 0.9, { off: -0.15, dia: false });
      /* the lean-to: one Ancient panel on two girder posts, a hearth under it */
      F.box(-3.6, 0, 1.6, 0.2, 2.1, 0.2, 0, STEEL, FT); F.box(-3.6, 0, -1.2, 0.2, 2.1, 0.2, 0, STEEL, FT);
      F.beam(-3.9, 2.1, 0.2, -2.3, 2.5, 0.2, 0.08, 3.4, pan, FP);
      F.box(-3.3, 0, 0.2, 0.9, 0.5, 0.9, 0, bas, FB); F.cyl(-3.3, 0.5, 0.2, 0.3, 0.12, 0, GLOW, 'glow');
      K.jar(1.9, 2.6, 0, 1); K.jar(2.4, 2.4, 0, 0.8);
    } else {
      /* -------- row of three cells: basalt party walls, fronts of Ancient panels in courses, flat roofs, a canopy and a ladder */
      const W = 3.2, D = 4.0, H = 2.8;
      for (let i = 0; i < 3; i++) {
        const x = (i - 1) * (W + 0.4), B = { x: x, z: 0, w: W, d: D }, h = i === 1 ? H + 0.6 : H;
        F.box(x, 0, -0.1, W, h, D - 0.2, 0, shade(c, -0.1), FS);
        K.plates(B, 0, 0, h, { pw: 1.07, ph: 0.93, skip: function (u, y) { return u > -1.2 && u < 0 && y < 2.1; } });
        K.door(B, 0, -0.55, 0, 0.9, 1.95, { wall: c, leaf: F.pick(BANNER), dia: i === 1, diaK: 0.3, off: 0.05 });
        K.slit(B, 0, 0.9, 1.0, 0.32, 0.9, { off: 0.07, dia: false, lit: i === 2 });
        F.box(x, h, -0.1, W + 0.25, 0.16, D, 0, shade(c, -0.2), FS);
        if (i < 2) F.frustum(x + W / 2 + 0.2, 0, -0.1, 0.22, 0.18, H + 0.3, 0, bas, FB, 4);
      }
      F.frustum(-1.5 * (W + 0.4) - 0.0, 0, -0.1, 0.25, 0.2, H + 0.2, 0, bas, FB, 4);
      K.canopy(0, -0.3, H + 0.76, 2.4, 2.6, cloth); K.jar(-0.8, -0.8, H + 0.76, 0.9); K.crate(0.7, 0.4, H + 0.76, 0.8);
      K.ladder(1.0 * (W + 0.4), D / 2 + 0.25, 0, H + 0.16, 0);
      K.jar(-4.4, 2.6, 0, 1); K.crate(2.4, 2.8, 0, 0.9);
    }
  }

  /* ================================================================ middle */
  function middle(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), verd = F.pick(VERD), cloth = F.pick(SAIL), bc = shade(c, -0.12);
    if (F.variant === 0) {
      /* -------- Velothi tower-house under a tank-head dome: battered tower, panel courses on its upper third, bronze-capped pylons,
         a wing with a roof terrace, girder buttresses at the back */
      const r0 = 3.2, r1 = 2.7, TH = 11.5, tf = function (y) { return r0 - (r0 - r1) * y / TH; };
      const TB = function (y) { const f = tf(y); return { x: 0, z: 0, w: 2 * f, d: 2 * f }; };
      F.frustum(0, 0, 0, r0 + 0.3, r0 + 0.2, 0.6, 0, bas, FB, 4);
      F.frustum(0, 0, 0, r0, r1, TH, 0, c, FS, 4);
      [0, 1, 2, 3].forEach(function (s) { K.plates(TB(9.4), s, 7.4, 3.9, { pw: 1.1, ph: 0.78, skip: function (u, y) { return Math.abs(u) < 0.45 && y > 8.2 && y < 9.9; } }); });
      F.frustum(0, 7.25, 0, tf(7.25) + 0.14, tf(7.25) + 0.14, 0.15, 0, BRONZE, FZ, 4);
      F.frustum(0, TH, 0, r1 + 0.25, r1 + 0.25, 0.35, 0, bc, FS, 4);
      const yT = TH + 0.35, TT = { x: 0, z: 0, w: 2 * r1 + 0.5, d: 2 * r1 + 0.5 };
      K.parapet(TT, yT, 0.7, 0.3, c);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { K.pylon(p[0] * (r1 + 0.05), p[1] * (r1 + 0.05), yT, 0.42, 1.5, shade(c, -0.05)); });
      F.cyl(0, yT, 0, 1.9, 0.9, 0, shade(c, 0.04), FS);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; F.box(Math.sin(a) * 1.89, yT + 0.2, Math.cos(a) * 1.89, 0.36, 0.5, 0.12, a, GLOW, 'glow'); }
      K.tankDome(0, 0, yT + 0.9, 2.0, 1.7, pan, { ribs: 8, gold: true });
      [0, 1, 2, 3].forEach(function (s) { K.slit(TB(8.6), s, 0, 8.2, 0.5, 1.7, { off: 0.04 }); K.slit(TB(4), s, s === 0 ? 0 : -0.9, 4.0, 0.45, 1.5, { off: -0.02, lit: s === 1 }); });
      K.door(TB(1), 0, -0.8, 0.6, 1.2, 2.5, { wall: c, lamp: true });
      /* the wing: a battered block, its roof a terrace under a canopy, a door out of the tower onto it, the stair up its flank */
      const wx = 4.4, wz = 1.0, w0 = 2.4, WH = 4.6;
      F.frustum(wx, 0, wz, w0, w0 - 0.25, WH, 0, shade(c, 0.03), FS, 4);
      const WT = { x: wx, z: wz, w: 2 * w0 - 0.2, d: 2 * w0 - 0.2 };
      K.parapet(WT, WH, 0.7, 0.25, c);
      K.canopy(wx + 0.2, wz, WH, 3.2, 3.2, cloth); K.jar(wx - 1.2, wz + 1.3, WH, 1); K.crate(wx + 1.2, wz - 1.2, WH, 0.9);
      K.door({ x: wx, z: wz, w: 2 * w0, d: 2 * w0 }, 0, 0.6, 0, 1.1, 2.3, { wall: c, leaf: shade(TIMBER, 0.05), diaK: 0.35 });
      K.slit({ x: wx, z: wz, w: 2 * w0, d: 2 * w0 }, 2, 0, 1.6, 0.45, 1.4, { off: -0.1 });
      K.door(TB(WH + 1), 2, 1.0, WH, 0.9, 2.1, { wall: c, dia: false, off: -0.04 });
      K.flight(wx + w0 + 0.7, wz + 3.6, wx + w0 + 0.7, wz - 1.6, 0, WH, 1.2, shade(c, -0.08));
      /* the back: two girder buttresses */
      [-1.6, 1.6].forEach(function (x) { K.buttress(x, -r0 - 2.4, x, -tf(6) - 0.05, 4.6, 6.6, shade(c, -0.06)); });
    } else if (F.variant === 1) {
      /* -------- Hlaalu block under a copper hull roof: two stone storeys, the upper on girder brackets; a hip roof of verdigris
         hull panels with bronze seam strips; a girder balcony with a cable rail; a roof loft and its canopy at the back */
      const W = 8.6, D = 7.0, H1 = 3.6, H2 = 3.2;
      F.box(0, 0, 0, W + 0.4, 0.4, D + 0.4, 0, bas, FB);
      F.box(0, 0.4, 0, W, H1, D, 0, c, FS);
      F.box(0, 0.4 + H1, 0, W + 0.5, 0.25, D + 0.5, 0, bc, FS);
      const y2 = 0.65 + H1, B2 = { x: 0, z: 0.2, w: W + 0.4, d: D + 0.4 };
      F.box(0, y2, 0.2, W + 0.4, H2, D + 0.4, 0, shade(c, 0.04), FS);
      [0, 1].forEach(function (s) { K.plates(B2, s, y2 + H2 - 1.0, 1.0, { pw: 1.2, ph: 1.0, pat: 'band', band: PORPH[0] }); });
      const yR = y2 + H2;
      F.box(0, yR, 0.2, W + 1.4, 0.2, D + 1.4, 0, bc, FS);
      F.hipRoof(0, yR + 0.2, 0.2, W + 1.6, 2.3, D + 1.6, 0, verd, FV);
      const rr = ((W + 1.6) - (D + 1.6)) / 2;
      for (let i = 0; i < 7; i++) { const x = -(W + 1.6) / 2 + 0.9 + i * ((W + 1.6 - 1.8) / 6), xr = Math.max(-rr, Math.min(rr, x));
        [-1, 1].forEach(function (k) { F.beam(x, yR + 0.27, 0.2 + k * ((D + 1.6) / 2 - 0.05), xr, yR + 2.5, 0.2, 0.06, 0.06, BRONZE, FZ); }); }
      /* front: a door with the diamond, shuttered windows of white panel, a girder balcony upstairs */
      const B1 = { x: 0, z: 0, w: W, d: D };
      K.door(B1, 0, 0, 0.4, 1.4, 2.6, { wall: c, lamp: true, diaK: 0.5 });
      [-2.8, 2.8].forEach(function (u) { K.slit(B1, 0, u, 1.4, 0.55, 1.5, { lit: u > 0 }); });
      F.box(0, y2, D / 2 + 1.2, 4.2, 0.18, 1.6, 0, STEEL, FT);
      [-1, 1].forEach(function (k) { F.beam(k * 1.9, y2 - 1.0, D / 2 + 0.4, k * 1.9, y2, D / 2 + 1.8, 0.2, 0.2, STEEL, FT); });
      K.rail(-2.1, D / 2 + 2.0, 2.1, D / 2 + 2.0, y2 + 0.18);
      K.door(B2, 0, 0, y2, 1.1, 2.3, { wall: c, dia: false, off: 0.02 });
      [-3.0, 3.0].forEach(function (u) { K.slit(B2, 0, u, y2 + 0.5, 0.5, 1.4, { off: 0.02, dia: false });
        [-1, 1].forEach(function (k) { K.fb(B2, 0, u + k * 0.6, y2 + 0.4, 0.42, 1.6, 0.06, 0.1, F.pick(PANEL), FP); }); });
      [2, 3].forEach(function (s) { [-1.8, 1.8].forEach(function (u) { K.slit(B1, s, u, 1.4, 0.5, 1.4, { dia: false }); K.slit(B2, s, u, y2 + 0.5, 0.5, 1.4, { off: 0.02, dia: false }); }); });
      [-2, 2].forEach(function (u) { K.slit(B1, 1, u, 1.4, 0.5, 1.4, { dia: false }); });
      K.banner(B2, 0, 0, yR - 0.1, 1.8, F.pick(PORPH));
      /* the loft at the back: a terrace on the lower block's back, its canopy, a ladder */
      F.box(0, 0.4, -D / 2 - 1.6, W, H1, 3.2, 0, shade(c, -0.03), FS);
      K.parapet({ x: 0, z: -D / 2 - 1.6, w: W, d: 3.2 }, 0.4 + H1, 0.6, 0.2, c);
      K.canopy(-1.6, -D / 2 - 1.7, 0.4 + H1, 3.0, 2.2, cloth); K.jar(1.6, -D / 2 - 1.2, 0.4 + H1, 1); K.crate(2.6, -D / 2 - 2.3, 0.4 + H1, 1);
      K.ladder(W / 2 + 0.3, -D / 2 - 1.6, 0, 0.4 + H1, Math.PI / 2);
    } else {
      /* -------- canal house on girder piles: a stone house on a deck of panels over girder piles, a stair down to a landing,
         panel courses on the upper storey, a roof terrace and canopy */
      const W = 7.0, D = 6.0, PY = 1.8, H = 5.6;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) F.box(-3 + i * 2, 0, -2.4 + j * 2.4, 0.3, PY, 0.3, 0, STEEL, FT);
      F.box(0, PY, 0, W + 2.6, 0.25, D + 1.2, 0, shade(pan, -0.1), FP);
      const B = { x: 0, z: 0, w: W, d: D }, y0 = PY + 0.25;
      F.box(0, y0, 0, W, H, D, 0, c, FS);
      [0, 1, 2, 3].forEach(function (s) { K.plates(B, s, y0 + 2.9, H - 2.9, { pw: 1.17, ph: 0.9, skip: function (u, y) { return Math.abs(u) < 0.5 && y > y0 + 3.2 && y < y0 + 4.9; } }); });
      F.box(0, y0 + 2.85, 0, W + 0.16, 0.1, D + 0.16, 0, BRONZE, FZ);
      K.door(B, 0, -1.2, y0, 1.2, 2.4, { wall: c, lamp: true });
      K.slit(B, 0, 1.5, y0 + 0.7, 0.55, 1.5, { lit: true });
      [0, 1, 2, 3].forEach(function (s) { K.slit(B, s, 0, y0 + 3.3, 0.5, 1.5, { off: 0.07 }); });
      [2, 3, 1].forEach(function (s) { K.slit(B, s, -1.2, y0 + 0.7, 0.5, 1.4, { dia: false }); });
      F.box(0, y0 + H, 0, W + 0.3, 0.18, D + 0.3, 0, bc, FS);
      K.parapet({ x: 0, z: 0, w: W + 0.3, d: D + 0.3 }, y0 + H + 0.18, 0.7, 0.25, c);
      K.canopy(0.8, -0.5, y0 + H + 0.18, 3.6, 3.0, cloth); K.jar(-2.2, 1.6, y0 + H + 0.18, 1); K.jar(-2.6, 1.0, y0 + H + 0.18, 0.8);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { K.pylon(p[0] * (W / 2 + 0.05), p[1] * (D / 2 + 0.05), y0 + H + 0.18, 0.3, 1.1, shade(c, -0.05)); });
      K.ladder(W / 2 + 0.35, -1.6, y0, y0 + H + 0.18, Math.PI / 2);
      K.flight(-W / 2 - 0.7, 3.6, -W / 2 - 0.7, 0.4, 0, PY + 0.25, 1.1, shade(STONE[0], -0.1));
      K.rail(-W / 2 - 1.3, -D / 2 - 0.6, -W / 2 - 1.3, D / 2 + 0.6, y0); K.rail(W / 2 + 1.3, -D / 2 - 0.6, W / 2 + 1.3, D / 2 + 0.6, y0);
    }
  }

  /* ================================================================ rich */
  function rich(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), verd = F.pick(VERD), porph = F.pick(PORPH), bc = shade(c, -0.12);
    if (F.variant === 0) {
      /* -------- Redoran carapace hall: battered walls under a great shell of four overlapping hull plates, girder ribs, a bronze
         ridge; a porch on two capped girder pylons hung with purple; a round tank tower with a tank-head dome; a walled forecourt */
      const W = 11.0, D = 8.4, H = 4.8, B = { x: 0, z: 0, w: W, d: D };
      F.box(0, 0, 0, W + 0.8, 0.5, D + 0.8, 0, bas, FB);
      F.frustum(0, 0.5, 0, W / 2, W / 2 - 0.3, H, Math.PI / 4 * 0, c, FS, 4);
      F.box(0, 0.5, 0, W - 0.2, H, D, 0, c, FS);
      F.box(0, 0.5 + H, 0, W + 0.4, 0.3, D + 0.4, 0, bc, FS);
      K.carapace(0, 0, 0.8 + H, W - 0.2, D, 3.6, { n: 4, col: verd });
      K.door(B, 0, 0, 0.5, 1.8, 3.0, { wall: c, leaf: porph, diaC: GOLD, diaK: 0.7 });
      [-3.6, 3.6].forEach(function (u) { K.slit(B, 0, u, 1.6, 0.55, 2.0, { lit: true }); });
      [2, 3].forEach(function (s) { [-2.4, 0, 2.4].forEach(function (u) { K.slit(B, s, u, 1.6, 0.5, 1.8, {}); }); });
      [-3, 0, 3].forEach(function (u) { K.slit(B, 1, u, 1.6, 0.5, 1.8, { dia: false }); });
      /* the porch: two girder pylons with bronze caps, a girder lintel, purple hangings */
      [-1.8, 1.8].forEach(function (x) { F.box(x, 0.5, D / 2 + 1.6, 0.4, 3.8, 0.4, 0, STEEL, FT); F.cone(x, 4.3, D / 2 + 1.6, 0.32, 0.7, 0, BRONZE, FZ);
        F.box(x, 2.0, D / 2 + 1.82, 0.7, 2.2, 0.05, 0, porph, FC); });
      F.beam(-2.2, 3.9, D / 2 + 1.6, 2.2, 3.9, D / 2 + 1.6, 0.4, 0.3, STEEL, FT);
      F.box(0, 4.1, D / 2 + 0.8, 4.4, 0.2, 1.9, 0, shade(pan, -0.1), FP);
      /* the tower: a whole tank on a basalt drum, slits, a tank-head dome, a gilt finial */
      const tx = W / 2 + 1.0, tz = -D / 2 + 0.4;
      F.cyl(tx, 0, tz, 2.4, 0.8, 0, bas, FB);
      const tt = K.tank(tx, tz, 0.8, 2.1, 8.6, pan, { band: 2.2 });
      F.cyl(tx, tt, tz, 2.25, 0.3, 0, bc, FS);
      K.tankDome(tx, tz, tt + 0.3, 2.15, 1.9, shade(pan, -0.03), { ribs: 10, gold: true, fin: 1.1 });
      [0.6, -0.6].forEach(function (a) { const r = 2.12; F.box(tx + Math.sin(a) * r, 5.2, tz + Math.cos(a) * r, 0.42, 1.6, 0.12, a, GLOW, 'glow'); F.box(tx + Math.sin(a) * (r + 0.02), 6.9, tz + Math.cos(a) * (r + 0.02), 0.5, 0.06, 0.14, a, BRONZE, FZ); });
      /* the forecourt: a low basalt wall with a gate and capped pylons, lanterns of Ancient glass */
      const fz = D / 2 + 5.6;
      [-1, 1].forEach(function (k) { F.box(k * 4.0, 0, fz, 5.0, 1.4, 0.5, 0, bas, FB); F.box(k * 6.3, 0, (D / 2 + fz) / 2 + 0.6, 0.5, 1.4, fz - D / 2 - 1.4, 0, bas, FB);
        K.pylon(k * 1.6, fz, 0, 0.42, 2.6, shade(c, -0.08)); F.cyl(k * 1.6, 3.15, fz, 0.2, 0.42, 0, GLOW, 'glow'); });
      K.dia({ x: 0, z: fz, w: 3, d: 0.5 }, 0, 0, 2.6, 0.5, 0.1, GOLD, 'gold');
      F.beam(-1.6, 2.5, fz, 1.6, 2.5, fz, 0.22, 0.22, STEEL, FT);
    } else {
      /* -------- Velothi domed manor: two battered tiers, the upper faced in panel courses; girder flying buttresses between the
         tiers; a great tank-head dome on a drum with a ring of lit slits; four small tank-head domes on corner pylons; purple and gold */
      const W0 = 14, D0 = 11, H0 = 4.2, W1 = 9.4, D1 = 7.4, H1 = 4.6;
      F.frustum(0, 0, 0, W0 / 2 + 0.3, W0 / 2 + 0.2, 0.5, 0, bas, FB, 4);
      F.box(0, 0, 0, W0, H0, D0, 0, c, FS);
      F.box(0, H0, 0, W0 + 0.4, 0.3, D0 + 0.4, 0, bc, FS);
      K.parapet({ x: 0, z: 0, w: W0 + 0.4, d: D0 + 0.4 }, H0 + 0.3, 0.6, 0.3, c);
      const B0 = { x: 0, z: 0, w: W0, d: D0 }, y1 = H0 + 0.3, B1 = { x: 0, z: 0, w: W1, d: D1 };
      F.box(0, y1, 0, W1, H1, D1, 0, shade(c, 0.04), FS);
      [0, 1, 2, 3].forEach(function (s) { K.plates(B1, s, y1, H1, { pw: 1.2, ph: 0.92, pat: 'band', band: porph, skip: function (u, y) { return Math.abs(Math.abs(u) - 2.4) < 0.5 && y > y1 + 1.0 && y < y1 + 3.0; } }); });
      [0, 1, 2, 3].forEach(function (s) { [-2.4, 2.4].forEach(function (u) { K.slit(B1, s, u, y1 + 1.15, 0.5, 1.7, { off: 0.07, lit: s === 0 }); }); });
      F.box(0, y1 + H1, 0, W1 + 0.4, 0.3, D1 + 0.4, 0, bc, FS);
      /* the flying buttresses: from piers on the lower roof to the upper tier's walls */
      [[-1, 0], [1, 0]].forEach(function (p) { [-2.4, 2.4].forEach(function (z) {
        F.frustum(p[0] * (W0 / 2 - 0.6), y1, z, 0.4, 0.3, 2.6, 0, shade(c, -0.06), FS, 4); F.cone(p[0] * (W0 / 2 - 0.6), y1 + 2.6, z, 0.32, 0.55, 0, BRONZE, FZ);
        F.beam(p[0] * (W0 / 2 - 0.6), y1 + 2.3, z, p[0] * (W1 / 2 + 0.02), y1 + 3.6, z, 0.24, 0.24, STEEL, FT); }); });
      const yD = y1 + H1 + 0.3;
      F.cyl(0, yD, 0, 3.0, 1.3, 0, shade(c, 0.05), FS);
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; F.box(Math.sin(a) * 2.98, yD + 0.3, Math.cos(a) * 2.98, 0.34, 0.7, 0.12, a, GLOW, 'glow'); }
      K.tankDome(0, 0, yD + 1.3, 3.1, 2.8, pan, { ribs: 12, gold: true, fin: 1.4 });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { const x = p[0] * (W1 / 2 - 0.3), z = p[1] * (D1 / 2 - 0.3);
        F.frustum(x, yD - 0.3, z, 0.7, 0.6, 1.4, 0, shade(c, -0.04), FS, 4); K.tankDome(x, z, yD + 1.1, 0.75, 0.75, shade(pan, -0.05), { ribs: 6, fin: 0.4 }); });
      /* the lower tier's doors and windows, the purple and gold portal */
      K.door(B0, 0, 0, 0.5, 2.0, 3.0, { wall: c, leaf: porph, diaC: GOLD, diaK: 0.8, lamp: true });
      [-4.6, -2.6, 2.6, 4.6].forEach(function (u) { K.slit(B0, 0, u, 1.2, 0.55, 1.8, { lit: Math.abs(u) < 3 }); });
      [2, 3].forEach(function (s) { [-3, 0, 3].forEach(function (u) { K.slit(B0, s, u, 1.2, 0.5, 1.7, {}); }); });
      [-4, 0, 4].forEach(function (u) { K.slit(B0, 1, u, 1.2, 0.5, 1.7, { dia: false }); });
      [-3.4, 3.4].forEach(function (u) { K.banner(B0, 0, u, H0 - 0.1, 2.2, porph); });
      K.flight(W0 / 2 + 0.7, 4.0, W0 / 2 + 0.7, -2.6, 0, y1, 1.3, shade(c, -0.08));
    }
  }

  /* ================================================================ shop */
  function shop(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), verd = F.pick(VERD), cloth = F.pick(SAIL), bc = shade(c, -0.12);
    if (F.variant === 0) {
      /* -------- trader: a stone shop whose front is shuttered by one big Ancient panel, propped up on girders as its awning;
         a counter, the goods; a loft above with a canopy; the trade's diamond sign on a bracket */
      const W = 7.2, D = 6.2, H = 3.6, B = { x: 0, z: 0, w: W, d: D };
      F.box(0, 0, 0, W + 0.3, 0.3, D + 0.3, 0, bas, FB);
      F.box(0, 0.3, 0, W, H, D, 0, c, FS);
      K.fb(B, 0, -0.6, 0.3, 4.4, 2.3, 0.3, -0.1, DOOR, FW);
      F.box(-0.6, 0.3, D / 2 + 0.3, 4.4, 1.0, 0.6, 0, shade(TIMBER, 0.1), FW);
      F.beam(-2.8, 2.65, D / 2 + 0.06, -2.8 + 0, 2.65 + 0.9, D / 2 + 2.0, 0.08, 0.08, STEEL, FT);
      F.beam(1.6, 2.65, D / 2 + 0.06, 1.6, 2.65 + 0.9, D / 2 + 2.0, 0.08, 0.08, STEEL, FT);
      F.beam(-0.6 - 2.4, 2.7, D / 2 + 0.05, -0.6 + 2.4, 2.7, D / 2 + 0.05, 0.12, 0.12, BRONZE, FZ);
      F.beam(-0.6, 2.7, D / 2 + 0.1, -0.6, 3.55, D / 2 + 2.05, 4.6, 0.08, pan, FP);
      [-2.4, -1.2, 0, 1.2].forEach(function (x, i) { K.jar(x, D / 2 + 0.3, 1.3, 0.6 + 0.1 * (i % 2)); });
      K.door(B, 0, 2.6, 0.3, 1.0, 2.3, { wall: c, dia: false });
      [2, 3, 1].forEach(function (s) { K.slit(B, s, 0, 1.3, 0.5, 1.4, { dia: false }); });
      F.box(0, 0.3 + H, 0, W + 0.3, 0.2, D + 0.3, 0, bc, FS);
      K.parapet({ x: 0, z: 0, w: W + 0.3, d: D + 0.3 }, 0.5 + H, 0.65, 0.25, c);
      F.box(-1.2, 0.5 + H, -0.6, 3.6, 2.4, 3.2, 0, shade(c, 0.03), FS);
      K.door({ x: -1.2, z: -0.6, w: 3.6, d: 3.2 }, 0, 0, 0.5 + H, 0.9, 2.0, { wall: c, dia: false, off: 0.02 });
      [1, 2, 3].forEach(function (s) { K.slit({ x: -1.2, z: -0.6, w: 3.6, d: 3.2 }, s, 0, 1.2 + H, 0.4, 1.1, { dia: false }); });
      K.door(B, 1, 1.6, 0.3, 1.0, 2.2, { wall: c, dia: false });
      K.canopy(2.0, 0.8, 0.5 + H, 2.4, 2.6, cloth); K.crate(2.0, 0.4, 0.5 + H, 0.9); K.jar(2.6, 1.4, 0.5 + H, 0.9);
      K.ladder(W / 2 + 0.3, -1.6, 0.3, 0.5 + H, Math.PI / 2);
      const sp = K.at(B, 0, -3.3, 0.9); F.beam(-W / 2 + 0.3, 3.2, D / 2 + 0.05, sp[0], 3.2, sp[1], 0.1, 0.1, STEEL, FT);
      K.dia({ x: sp[0], z: sp[1], w: 0.1, d: 0.1 }, 0, 0, 2.6, 0.55, 0, BRONZE, FZ);
      K.crate(-3.0, D / 2 + 1.6, 0, 1); K.crate(-3.4, D / 2 + 2.4, 0, 0.9); K.jar(3.4, D / 2 + 1.4, 0, 1);
    } else {
      /* -------- smithy in a tank: a wide Ancient tank as the workshop, a forge chimney of pipe, a yard roofed with one curved hull
         plate on girder posts over the anvil and the quench barrel */
      const R = 3.0, B = { x: 0, z: 0, w: 2 * R, d: 2 * R };
      F.cyl(0, 0, 0, R + 0.3, 0.4, 0, bas, FB);
      const top = K.tank(0, 0, 0.4, R, 4.2, pan, { band: 1.4 });
      F.cyl(0, top, 0, R + 0.08, 0.25, 0, bc, FS);
      K.tankDome(0, 0, top + 0.25, R, 1.0, shade(pan, -0.05), { ribs: 8, fin: 0.3 });
      K.door(B, 0, 0, 0.4, 1.6, 2.6, { wall: c, off: -0.08 });
      [2, 3].forEach(function (s) { K.slit(B, s, 0, 1.8, 0.4, 1.4, { off: -0.1, lit: s === 2, dia: false }); });
      F.cyl(-1.4, top + 0.5, -1.2, 0.35, 3.0, 0, STEEL, FT); F.cone(-1.4, top + 3.5, -1.2, 0.5, 0.6, 0, BRONZE, FZ);
      /* the yard: two girder frames, a curved hull plate over them (a shallow half-shell), the anvil, the quench barrel, a rack */
      const yz = R + 2.6;
      [-2.2, 2.2].forEach(function (x) { [R + 0.8, R + 4.4].forEach(function (z) { F.box(x, 0, z, 0.24, 2.8, 0.24, 0, STEEL, FT); }); });
      F.ell(0, 2.8, yz, 2.7, 0.7, 2.3, 0, verd, FV);
      F.box(0, 2.6, yz, 4.8, 0.2, 0.24, 0, STEEL, FT);
      F.box(0.4, 0, yz, 0.6, 0.6, 0.5, 0, bas, FB); F.box(0.4, 0.6, yz, 0.9, 0.22, 0.35, 0, 0x2a2a2c, FT);
      F.cyl(-1.2, 0, yz + 0.8, 0.45, 0.8, 0, TIMBER, FW); F.cyl(-1.2, 0.72, yz + 0.8, 0.4, 0.04, 0, 0x30404a, 'glass');
      F.box(1.8, 0, yz - 0.9, 1.6, 0.9, 0.6, 0, bas, FB); F.cyl(1.8, 0.9, yz - 0.9, 0.35, 0.1, 0, GLOW, 'glow');
      F.box(-2.0, 0, yz - 1.2, 0.12, 1.8, 1.6, 0, TIMBER, FW);
      K.crate(2.6, R + 5.4, 0, 1); K.jar(-2.8, R + 5.2, 0, 1);
    }
  }

  /* ================================================================ tavern */
  function tavern(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), cloth = F.pick(SAIL), porph = F.pick(PORPH), bc = shade(c, -0.12);
    /* -------- cornerclub in two stacked tanks: a wide lower tank (the hall), a narrower upper one (the rooms), a gallery
       between them on girder brackets with a cable rail, a stair up, a lantern of Ancient glass at the door, a terrace canopy */
    const R0 = 3.6, R1 = 2.6, B0 = { x: 0, z: 0, w: 2 * R0, d: 2 * R0 }, B1 = { x: 0, z: 0, w: 2 * R1, d: 2 * R1 };
    F.cyl(0, 0, 0, R0 + 0.35, 0.5, 0, bas, FB);
    const t0 = K.tank(0, 0, 0.5, R0, 3.8, pan, { band: 1.9 });
    F.cyl(0, t0, 0, R0 + 1.1, 0.25, 0, shade(pan, -0.15), FP);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; F.beam(Math.sin(a) * R0, t0 - 0.9, Math.cos(a) * R0, Math.sin(a) * (R0 + 0.9), t0, Math.cos(a) * (R0 + 0.9), 0.16, 0.16, STEEL, FT); }
    for (let i = 0; i < 12; i++) { const a0 = i / 12 * TAU, a1 = (i + 1) / 12 * TAU, r = R0 + 1.0; if (i === 5) continue;
      K.rail(Math.sin(a0) * r, Math.cos(a0) * r, Math.sin(a1) * r, Math.cos(a1) * r, t0 + 0.25); }
    const t1 = K.tank(0, -0.4, t0 + 0.25, R1, 3.2, shade(pan, 0.03), { band: 1.6 });
    K.tankDome(0, -0.4, t1, R1 + 0.05, 1.3, shade(pan, -0.04), { ribs: 8, gold: false, fin: 0.6 });
    K.door(B0, 0, 0, 0.5, 1.5, 2.6, { wall: c, leaf: porph, lamp: true, off: -0.1 });
    [2, 3, 1].forEach(function (s) { K.slit(B0, s, 0, 1.4, 0.5, 1.6, { off: -0.12, lit: true, dia: false }); });
    K.door({ x: 0, z: -0.4, w: 2 * R1, d: 2 * R1 }, 0, 0, t0 + 0.25, 1.0, 2.2, { wall: c, dia: false, off: -0.1 });
    [2, 3].forEach(function (s) { K.slit({ x: 0, z: -0.4, w: 2 * R1, d: 2 * R1 }, s, 0, t0 + 1.0, 0.45, 1.3, { off: -0.1, lit: s === 3, dia: false }); });
    /* the stair up to the gallery, the sign: a bronze diamond on a girder bracket, a terrace under a canopy */
    K.flight(R0 + 1.6, 3.4, R0 + 1.6, -1.6, 0, t0 + 0.25, 1.1, shade(c, -0.08));
    F.beam(-R0 + 0.2, 3.4, 1.4, -R0 - 1.1, 3.4, 1.4, 0.12, 0.12, STEEL, FT);
    K.dia({ x: -R0 - 1.1, z: 1.4, w: 0.1, d: 0.1 }, 3, 0, 2.7, 0.6, 0, BRONZE, FZ);
    F.box(-R0 - 1.1, 2.0, 1.4, 0.05, 0.9, 0.9, 0, porph, FC);
    K.canopy(0, R0 + 2.6, 0, 4.4, 2.6, cloth);
    [-1.2, 1.2].forEach(function (x) { F.box(x, 0, R0 + 2.6, 1.6, 0.72, 0.8, 0, TIMBER, FW); K.jar(x - 0.4, R0 + 2.6, 0.72, 0.5); });
  }

  /* ================================================================ warehouse */
  function warehouse(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), bc = shade(c, -0.12);
    /* -------- canal store: a long stone block, its upper half faced in panel courses with stacked loading doors framed in girders,
       a girder hoist beam with a block and a cable, a flat roof with a parapet, two tanks as cisterns, crates on the quay */
    const W = 14, D = 8, H = 8.2, B = { x: 0, z: 0, w: W, d: D };
    F.box(0, 0, 0, W + 0.6, 0.4, D + 0.6, 0, bas, FB);
    F.box(0, 0.4, 0, W, H, D, 0, c, FS);
    [0, 1, 2, 3].forEach(function (s) { K.plates(B, s, 4.4, H - 4.0, { pw: 1.27, ph: 0.95, skip: function (u, y) { return s === 0 && Math.abs(u) < 1.2; } }); });
    F.box(0, 4.35, 0, W + 0.16, 0.1, D + 0.16, 0, BRONZE, FZ);
    [0.4, 3.0, 5.6].forEach(function (y, i) { K.fb(B, 0, 0, y, 1.9, 2.2, 0.2, -0.05, i ? F.pick(PANEL) : TIMBERS[0], i ? FP : FW);
      [-1, 1].forEach(function (k) { K.fb(B, 0, k * 1.08, y, 0.22, 2.3, 0.3, 0.06, STEEL, FT); }); K.fb(B, 0, 0, y + 2.25, 2.4, 0.22, 0.3, 0.06, STEEL, FT); });
    F.beam(0, H + 0.1, D / 2 - 0.2, 0, H + 0.1, D / 2 + 2.0, 0.34, 0.26, STEEL, FT);
    F.box(0, H - 0.25, D / 2 + 1.8, 0.4, 0.35, 0.4, 0, BRONZE, FZ);
    F.rod(0, H - 0.25, D / 2 + 1.8, 0, 2.2, D / 2 + 1.8, 0.015, CABLE, FT); K.crate(0, D / 2 + 1.8, 1.4, 1);
    [-4.6, 4.6].forEach(function (u) { K.door(B, 0, u, 0.4, 1.3, 2.6, { wall: c, dia: Math.abs(u) > 4 && u < 0 }); K.slit(B, 0, u, 5.6, 0.5, 1.6, { off: 0.07, dia: false }); });
    [2, 3].forEach(function (s) { [-1.8, 1.8].forEach(function (u) { K.slit(B, s, u, 1.6, 0.5, 1.6, { dia: false }); K.slit(B, s, u, 5.6, 0.5, 1.6, { off: 0.07, dia: false }); }); });
    [-4, 0, 4].forEach(function (u) { K.slit(B, 1, u, 5.6, 0.5, 1.6, { off: 0.07, dia: false }); });
    F.box(0, H + 0.4, 0, W + 0.3, 0.2, D + 0.3, 0, bc, FS);
    K.parapet({ x: 0, z: 0, w: W + 0.3, d: D + 0.3 }, H + 0.6, 0.7, 0.25, c);
    [-W / 2 - 1.8, W / 2 + 1.8].forEach(function (x) { F.cyl(x, 0, -1, 1.6, 0.4, 0, bas, FB); const t = K.tank(x, -1, 0.4, 1.4, 4.0, pan, { band: 1.3 }); K.tankDome(x, -1, t, 1.42, 0.6, shade(pan, -0.05), { ribs: 6, fin: 0.25 });
      F.rod(x, 3.8, -1 + 0.5, x > 0 ? W / 2 : -W / 2, 6.6, -1 + 0.5, 0.06, STEEL, FT); });
    for (let i = 0; i < 5; i++) K.crate(-5 + i * 1.1, D / 2 + 1.4 + (i % 2) * 0.5, 0, 1);
    K.jar(4.4, D / 2 + 1.6, 0, 1); K.jar(5.0, D / 2 + 1.2, 0, 0.9);
  }

  /* ================================================================ tomb */
  function tomb(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), bc = shade(c, -0.12);
    if (F.variant === 0) {
      /* -------- fuel-tank family tomb (Hook's necropolis): a fuel-tank segment laid on a basalt plinth, its end walled in stone with
         a purple door under the gold diamond, steel bands, ancestral urns on the steps, candles */
      const R = 2.2, L = 7.0, Y = 0.9;
      F.box(0, 0, 0, 2 * R + 1.0, Y, L + 1.0, 0, bas, FB);
      F.rod(0, Y + R, -L / 2, 0, Y + R, L / 2, R, pan, FP);
      for (let k = 0; k <= 4; k++) F.rod(0, Y + R, -L / 2 + 0.3 + k * (L - 0.6) / 4 - 0.06, 0, Y + R, -L / 2 + 0.3 + k * (L - 0.6) / 4 + 0.06, R + 0.05, STEEL, FT);
      F.ell(0, Y + R, -L / 2, R, R, 0.5, 0, shade(pan, -0.05), FP);
      F.box(0, Y, L / 2, 2 * R + 0.3, 2 * R, 0.5, 0, c, FS);
      F.box(0, Y + 2 * R, L / 2, 2 * R + 0.5, 0.25, 0.7, 0, bc, FS);
      const B = { x: 0, z: L / 2, w: 2 * R + 0.3, d: 0.5 };
      K.door(B, 0, 0, Y, 1.0, 2.0, { wall: c, leaf: porph, diaC: GOLD, diaK: 0.45 });
      [-1, 1].forEach(function (k) { K.pylon(k * (R + 0.15), L / 2 + 0.15, Y + 2 * R + 0.25, 0.25, 0.9, shade(c, -0.05)); });
      K.flight(0, L / 2 + 2.2, 0, L / 2 + 0.6, 0, Y, 2.2, shade(c, -0.1));
      [-1.4, 1.4].forEach(function (x) { F.box(x, 0, L / 2 + 1.4, 0.7, Y, 0.9, 0, bc, FS); K.jar(x, L / 2 + 1.4, Y, 0.9); F.cyl(x + 0.25, Y, L / 2 + 1.7, 0.05, 0.22, 0, GLOW, 'glow'); });
    } else {
      /* -------- pylon tomb: a stepped Velothi block faced in panel courses with a porphyry band, the gold diamond on its door,
         capped pylons at its corners, a lantern of Ancient glass on its top */
      const W = 4.4, D = 4.4, H = 3.6, B = { x: 0, z: 0, w: W, d: D };
      F.box(0, 0, 0, W + 1.6, 0.5, D + 1.6, 0, bas, FB);
      F.box(0, 0.5, 0, W + 0.8, 0.4, D + 0.8, 0, bc, FS);
      F.frustum(0, 0.9, 0, W / 2, W / 2 - 0.25, H, 0, c, FS, 4);
      [0, 1, 2, 3].forEach(function (s) { K.plates({ x: 0, z: 0, w: W - 0.25, d: D - 0.25 }, s, 1.8, H - 1.0, { pw: 1.03, ph: 0.85, pat: 'band', band: porph, skip: function (u, y) { return s === 0 && Math.abs(u) < 0.7 && y < 3.3; } }); });
      K.door({ x: 0, z: 0, w: W - 0.2, d: D - 0.2 }, 0, 0, 0.9, 0.9, 2.0, { wall: c, leaf: porph, diaC: GOLD, diaK: 0.4 });
      F.box(0, 0.9 + H, 0, W + 0.1, 0.3, D + 0.1, 0, bc, FS);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { K.pylon(p[0] * (W / 2 - 0.1), p[1] * (D / 2 - 0.1), 1.2 + H, 0.3, 1.0, shade(c, -0.05)); });
      F.cyl(0, 1.2 + H, 0, 0.7, 0.3, 0, bc, FS); F.cyl(0, 1.5 + H, 0, 0.5, 0.9, 0, GLASSC, 'glass'); F.cyl(0, 1.6 + H, 0, 0.25, 0.6, 0, GLOW, 'glow');
      K.tankDome(0, 0, 2.4 + H, 0.6, 0.45, pan, { ribs: 6, fin: 0.3 });
      [-1.5, 1.5].forEach(function (x) { K.jar(x, D / 2 + 0.6, 0.5, 0.7); });
    }
  }

  /* ================================================================ shrine */
  function shrine(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), bc = shade(c, -0.12);
    if (F.variant === 0) {
      /* -------- Sun shrine: a small stepped platform (the Chichani pyramid) faced in panel courses, a stair up its front, an altar,
         a reclaimed Ancient dish set up as the sun's disc in gold, rays of bronze */
      const T = [[9, 0.9], [7, 0.9], [5, 0.9]];
      let y = 0;
      T.forEach(function (t, i) { const B = { x: 0, z: 0, w: t[0], d: t[0] }; F.box(0, y, 0, t[0], t[1], t[0], 0, i % 2 ? shade(c, 0.04) : c, FS);
        [0, 1, 2, 3].forEach(function (s) { K.plates(B, s, y, t[1], { pw: 1.0, ph: t[1], skip: function (u) { return s === 0 && Math.abs(u) < 1.0; } }); });
        F.box(0, y + t[1], 0, t[0] + 0.16, 0.06, t[0] + 0.16, 0, BRONZE, FZ); F.box(0, y + t[1], 0, t[0] - 0.4, 0.1, t[0] - 0.4, 0, bc, FS); y += t[1] + 0.1; });
      K.flight(0, 4.5 + 1.8, 0, 2.5 - 0.2, 0, y, 1.8, shade(c, -0.1));
      F.box(0, y, -0.8, 2.0, 0.9, 1.0, 0, porph, FS); F.cyl(0, y + 0.9, -0.8, 0.3, 0.12, 0, GLOW, 'glow');
      F.box(0, y, -1.8, 0.4, 2.6, 0.4, 0, STEEL, FT);
      F.rod(0, y + 3.4, -1.75, 0, y + 3.4, -1.6, 1.3, GOLD, 'paint');   /* the dish, gilt: painted gold reads bright where the metal look goes dark */
      F.rod(0, y + 3.4, -1.85, 0, y + 3.4, -1.75, 1.42, BRONZE, FZ);
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; F.beam(Math.sin(a) * 1.5, y + 3.4 + Math.cos(a) * 1.5, -1.7, Math.sin(a) * 2.2, y + 3.4 + Math.cos(a) * 2.2, -1.7, 0.12, 0.05, GOLD, 'paint'); }
      [[-1, 1], [1, 1]].forEach(function (p) { K.pylon(p[0] * 4.2, p[1] * 4.2, 0, 0.35, 2.2, shade(c, -0.06)); F.cyl(p[0] * 4.2, 3.1, p[1] * 4.2, 0.15, 0.35, 0, GLOW, 'glow'); });
    } else {
      /* -------- wayside pylon shrine: a girder pylon on a basalt step, capped by a tank-head cone, a gold sun disc, offerings */
      F.box(0, 0, 0, 3.0, 0.4, 3.0, 0, bas, FB); F.box(0, 0.4, 0, 2.2, 0.3, 2.2, 0, bc, FS);
      [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].forEach(function (p) { F.beam(p[0], 0.7, p[1], p[0] * 0.5, 4.2, p[1] * 0.5, 0.16, 0.16, STEEL, FT); });
      [1.6, 2.9].forEach(function (y) { const h = 0.5 - 0.25 * (y - 0.7) / 3.5; F.box(0, y, 0, 2 * h + 0.2, 0.1, 2 * h + 0.2, 0, BRONZE, FZ); });
      F.box(0, 4.2, 0, 0.8, 0.15, 0.8, 0, STEEL, FT);
      F.cone(0, 4.35, 0, 0.6, 1.3, 0, pan, FP); F.ball(0, 5.7, 0, 0.14, GOLD, 'gold');
      F.rod(0, 3.4, 0.3, 0, 3.4, 0.4, 0.6, GOLD, 'paint');
      F.box(0, 0.7, 0.75, 1.0, 0.5, 0.5, 0, porph, FS); F.cyl(-0.25, 1.2, 0.75, 0.05, 0.2, 0, GLOW, 'glow'); F.cyl(0.25, 1.2, 0.75, 0.05, 0.2, 0, GLOW, 'glow');
      K.jar(1.0, 1.0, 0.7, 0.6); K.jar(-1.0, 1.0, 0.7, 0.5);
    }
  }

  /* ================================================================ watch */
  function watch(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), bc = shade(c, -0.12);
    if (F.variant === 0) {
      /* -------- Ordinator watchtower: a battered tower, its upper half faced in panel courses, girder buttresses on two sides,
         a crenellated top with bronze-capped pylons, a lantern room of Ancient glass, the diamond over the door, purple hung */
      const r0 = 3.0, r1 = 2.4, TH = 13, tf = function (y) { return r0 - (r0 - r1) * y / TH; };
      const TB = function (y) { const f = tf(y); return { x: 0, z: 0, w: 2 * f, d: 2 * f }; };
      F.frustum(0, 0, 0, r0 + 0.4, r0 + 0.3, 0.7, 0, bas, FB, 4);
      F.frustum(0, 0, 0, r0, r1, TH, 0, c, FS, 4);
      [0, 1, 2, 3].forEach(function (s) { K.plates(TB(10), s, 7.0, 5.6, { pw: 1.05, ph: 0.93, pat: 'band', band: porph, skip: function (u, y) { return Math.abs(u) < 0.45 && y > 8.2 && y < 10.1; } }); });
      [0, 1, 2, 3].forEach(function (s) { K.slit(TB(9), s, 0, 8.3, 0.45, 1.7, { off: 0.06 }); K.slit(TB(4), s, 0, 4.0, 0.4, 1.4, { dia: s !== 0, off: -0.02 }); });
      F.frustum(0, TH, 0, r1 + 0.4, r1 + 0.4, 0.4, 0, bc, FS, 4);
      const yT = TH + 0.4;
      [0, 1, 2, 3].forEach(function (s) { [-1.5, 0, 1.5].forEach(function (u) { const B = { x: 0, z: 0, w: 2 * r1 + 0.6, d: 2 * r1 + 0.6 }; K.fb(B, s, u, yT, 0.7, 0.9, 0.35, -0.18, c, FS); }); });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { K.pylon(p[0] * (r1 + 0.15), p[1] * (r1 + 0.15), yT, 0.4, 1.6, shade(c, -0.05)); });
      F.box(0, yT, 0, 2.6, 0.2, 2.6, 0, STEEL, FT);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.box(p[0] * 1.15, yT + 0.2, p[1] * 1.15, 0.16, 2.0, 0.16, 0, BRONZE, FZ); });
      F.box(0, yT + 0.2, 0, 2.2, 2.0, 2.2, 0, GLASSC, 'glass'); F.box(0, yT + 0.5, 0, 1.0, 1.2, 1.0, 0, GLOW, 'glow');
      F.pyrRoof(0, yT + 2.2, 0, 2.8, 1.4, 2.8, 0, F.pick(VERD), FV); F.ball(0, yT + 3.7, 0, 0.18, GOLD, 'gold');
      K.door(TB(1), 0, 0, 0.7, 1.4, 2.7, { wall: c, leaf: porph, diaC: GOLD, diaK: 0.55, lamp: true });
      K.banner(TB(7), 0, 0, 6.8, 2.2, porph);
      [2, 3].forEach(function (s) { const x = s === 2 ? r0 + 2.4 : -r0 - 2.4; K.buttress(x, 0, (s === 2 ? 1 : -1) * (tf(6.5) + 0.05), 0, 4.8, 6.5, shade(c, -0.06)); });
    } else {
      /* -------- canton gate: two battered pylons, a girder lintel, the great diamond over the gate in gold, gate leaves of Ancient
         panels, a walk over it behind a cable rail, capped pylons */
      const PW = 3.4, PD = 4.0, PH = 7.4, GW = 4.2;
      [-1, 1].forEach(function (k) { const x = k * (GW / 2 + PW / 2), B = { x: x, z: 0, w: PW, d: PD };
        F.frustum(x, 0, 0, PW / 2 + 0.25, PW / 2 + 0.15, 0.6, 0, bas, FB, 4);
        F.frustum(x, 0, 0, PW / 2, PW / 2 - 0.3, PH, 0, c, FS, 4);
        K.plates({ x: x, z: 0, w: PW - 0.6, d: PD - 0.6 }, 0, 4.2, 3.0, { pw: 0.93, ph: 1.0, pat: 'band', band: porph });
        K.slit({ x: x, z: 0, w: PW - 0.3, d: PD - 0.3 }, 0, 0, 2.0, 0.4, 1.4, { dia: false });
        F.box(x, PH, 0, PW - 0.2, 0.3, PD - 0.4, 0, bc, FS);
        K.pylon(x, 0, PH + 0.3, 0.55, 1.8, shade(c, -0.05)); });
      F.beam(-GW / 2 - 0.4, 5.0, PD / 2 - 0.6, GW / 2 + 0.4, 5.0, PD / 2 - 0.6, 0.6, 0.4, STEEL, FT);
      F.box(0, 5.3, 0, GW + 0.6, 0.4, PD - 1.0, 0, bc, FS);
      F.box(0, 5.7, 0, GW + 0.6, 1.8, 0.4, 0, c, FS);
      K.dia({ x: 0, z: 0, w: GW, d: 0.4 }, 0, 0, 6.6, 1.0, 0.02, GOLD, 'paint', 0.12);
      [-1, 1].forEach(function (k) { F.box(k * GW / 4, 0, 0.1, GW / 2 - 0.06, 4.6, 0.16, 0, F.pick(PANEL), FP);
        [1.0, 2.3, 3.6].forEach(function (y) { F.box(k * GW / 4, y, 0.2, GW / 2 - 0.1, 0.12, 0.06, 0, STEEL, FT); }); });
      K.rail(-GW / 2 - 0.2, -PD / 2 + 0.7, GW / 2 + 0.2, -PD / 2 + 0.7, 5.7);
      F.box(0, 0, 0, GW, 0.08, PD, 0, shade(bas, 0.1), FB);
    }
  }

  /* ================================================================ market (the owner, 2026-11-12: "slave market yes") */
  /* an Ancient shipping container as found, set square: its body (the library's corrugated steel), dark corner posts and
     rails, lock bars on its door end; o.pen: the inner long face opened and barred (a dark interior behind steel bars) */
  function container(F, K, x, z, y, ry, col, o) {
    o = o || {}; const L = 6.1, W = 2.44, H = 2.6, c = Math.cos(ry), s = Math.sin(ry);
    const P = function (u, v) { return [x + u * c + v * s, z - u * s + v * c]; };
    F.box(x, y, z, L, H, W, ry, col, FK);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { const p = P(q[0] * (L / 2 - 0.06), q[1] * (W / 2 - 0.06)); F.box(p[0], y, p[1], 0.16, H + 0.02, 0.16, ry, STEEL, FT); });
    [-1, 1].forEach(function (k) { const p = P(0, k * (W / 2 - 0.06)); F.box(p[0], y + H - 0.1, p[1], L, 0.12, 0.14, ry, STEEL, FT); });
    const d = P(L / 2 + 0.03, 0); [-0.5, -0.2, 0.2, 0.5].forEach(function (v) { const p = P(L / 2 + 0.04, v); F.box(p[0], y + 0.2, p[1], 0.04, H - 0.4, 0.04, ry, STEEL, FT); });
    F.box(d[0], y + 0.1, d[1], 0.03, H - 0.2, W - 0.1, ry, shade(col, -0.08), FK);
    if (o.pen) {
      const sd = o.pen, q = P(0, sd * (W / 2 + 0.02));
      F.box(q[0], y + 0.15, q[1], L - 0.9, H - 0.45, 0.06, ry, DOOR, FT);
      for (let u = -L / 2 + 0.6; u <= L / 2 - 0.6; u += 0.26) { const b = P(u, sd * (W / 2 + 0.1)); F.rod(b[0], y + 0.1, b[1], b[0], y + H - 0.25, b[1], 0.025, STEEL, FT); }
      [0.25, H - 0.3].forEach(function (h) { const a = P(-L / 2 + 0.5, sd * (W / 2 + 0.1)), b = P(L / 2 - 0.5, sd * (W / 2 + 0.1)); F.beam(a[0], y + h, a[1], b[0], y + h, b[1], 0.08, 0.08, STEEL, FT); });
    }
    return y + H;
  }
  const CONT = [0x6b5446, 0x55605a, 0x6a5a40, 0x4c5662, 0x5e4a4a];
  function market(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), porph = F.pick(PORPH), bc = shade(c, -0.12);
    if (F.variant === 0) {
      /* -------- the compound (Hook's container compounds): containers ranged round a square two high at the back and the
         sides, their pens barred inward; a Vothic gate in the front row; the auction block in the middle under a purple
         canopy; the overseers' walk on the back stack behind a cable rail, a stair up to it */
      const S = 12.2;
      F.box(0, 0, 0, 2 * S + 2.4, 0.08, 2 * S + 2.4, 0, shade(bas, 0.15), FB);
      for (let i = 0; i < 4; i++) { const u = -S + 3.05 + i * 6.1;
        [0, 2.6].forEach(function (y, l) {
          container(F, K, u, -S, y, 0, CONT[(i + l) % CONT.length], { pen: l === 0 ? 1 : 0 });
          container(F, K, -S, u, y, Math.PI / 2, CONT[(i + l + 2) % CONT.length], { pen: l === 0 ? -1 : 0 });
          container(F, K, S, u, y, Math.PI / 2, CONT[(i + l + 3) % CONT.length], { pen: l === 0 ? 1 : 0 }); });
        if (i !== 1 && i !== 2) container(F, K, u, S, 0, 0, CONT[(i + 1) % CONT.length], { pen: -1 }); }
      /* the gate: two capped pylons, a girder lintel, the gold diamond, purple hangings */
      [-1, 1].forEach(function (k) { K.pylon(k * 3.4, S, 0, 0.55, 4.6, shade(c, -0.06)); F.box(k * 3.4, 1.4, S + 0.62, 0.9, 2.6, 0.05, 0, porph, FC); });
      F.beam(-3.9, 4.4, S, 3.9, 4.4, S, 0.5, 0.4, STEEL, FT);
      K.dia({ x: 0, z: S, w: 6, d: 0.4 }, 0, 0, 5.3, 0.7, 0.02, GOLD, 'paint', 0.1);
      F.box(0, 4.65, S, 1.8, 0.3, 0.3, 0, STEEL, FT);
      /* the block: two basalt steps and a stone top, four girder posts, a purple canopy, the auctioneer's desk and his diamond */
      F.box(0, 0, 0, 6.4, 0.45, 6.4, 0, bas, FB); F.box(0, 0.45, 0, 4.8, 0.45, 4.8, 0, bc, FS); F.box(0, 0.9, 0, 3.6, 0.15, 3.6, 0, c, FS);
      K.flight(0, 4.8, 0, 3.2, 0, 0.9, 1.6, shade(c, -0.1));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.box(p[0] * 1.6, 1.05, p[1] * 1.6, 0.2, 2.6, 0.2, 0, STEEL, FT); F.cone(p[0] * 1.6, 3.65, p[1] * 1.6, 0.16, 0.35, 0, BRONZE, FZ); });
      F.box(0, 3.65, 0, 3.8, 0.08, 3.8, 0, porph, FC);
      F.box(0, 1.05, -1.2, 1.4, 1.0, 0.6, 0, TIMBER, FW); F.box(0, 2.05, -1.2, 1.5, 0.06, 0.7, 0, shade(TIMBER, 0.1), FW);
      K.dia({ x: 0, z: -1.6, w: 0.3, d: 0.1 }, 0, 0, 3.0, 0.4, 0, BRONZE, FZ);
      /* the overseers' walk on the back stack, its rail, the stair up */
      K.rail(-S + 0.4, -S + 1.4, S - 0.4, -S + 1.4, 5.2);
      K.flight(S - 3.0, -S + 6.6, S - 3.0, -S + 1.6, 0, 5.2, 1.2, shade(c, -0.08));
      [-6, 6].forEach(function (x) { F.cyl(x, 0, 4, 0.12, 2.6, 0, TIMBER, FW); F.cyl(x, 2.55, 4, 0.18, 0.3, 0, GLOW, 'glow'); });
    } else {
      /* -------- the market lane: two rows of container pens two high facing a basalt-paved lane, the walks on top behind cable
         rails; at the head the block under a carapace of hull plates on girder posts; a Vothic arch at the lane's mouth */
      const LZ = 13.4;
      F.box(0, 0, 0, 7.6, 0.08, 2 * LZ + 4, 0, shade(bas, 0.1), FB);
      for (let i = 0; i < 3; i++) { const z = -LZ + 6.1 + i * 6.1 + 2.0;
        [0, 2.6].forEach(function (y, l) {
          container(F, K, -5.0, z, y, Math.PI / 2, CONT[(i + l) % CONT.length], { pen: l === 0 ? 1 : 0 });
          container(F, K, 5.0, z, y, Math.PI / 2, CONT[(i + l + 2) % CONT.length], { pen: l === 0 ? -1 : 0 }); }); }
      [-1, 1].forEach(function (k) { K.rail(k * 3.9, -LZ + 3.1, k * 3.9, LZ - 0.4, 5.2); });
      K.flight(-7.6, LZ - 1.0, -7.6, LZ - 6.2, 0, 5.2, 1.1, shade(c, -0.08));
      /* the block and its shell canopy */
      const bz = -LZ + 0.8;
      F.box(0, 0, bz, 5.6, 0.5, 4.4, 0, bas, FB); F.box(0, 0.5, bz, 4.2, 0.4, 3.2, 0, c, FS);
      K.flight(0, bz + 4.2, 0, bz + 2.2, 0, 0.9, 1.8, shade(c, -0.1));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.box(p[0] * 2.3, 0.5, bz + p[1] * 1.7, 0.24, 3.4, 0.24, 0, STEEL, FT); });
      F.box(0, 3.9, bz, 5.0, 0.35, 3.8, 0, bc, FS);
      K.carapace(0, bz, 4.25, 4.8, 3.6, 1.6, { n: 2, col: F.pick(VERD) });
      [-1.6, 1.6].forEach(function (x) { F.box(x, 1.6, bz + 1.95, 0.9, 2.2, 0.05, 0, porph, FC); });
      /* the arch at the lane's mouth */
      [-1, 1].forEach(function (k) { K.pylon(k * 3.0, LZ + 1.2, 0, 0.5, 4.4, shade(c, -0.06)); });
      F.beam(-3.5, 4.2, LZ + 1.2, 3.5, 4.2, LZ + 1.2, 0.5, 0.4, STEEL, FT);
      F.box(0, 4.4, LZ + 1.2, 6.4, 1.2, 0.4, 0, c, FS);
      K.dia({ x: 0, z: LZ + 1.2, w: 6.4, d: 0.4 }, 0, 0, 5.0, 0.55, 0.02, GOLD, 'paint', 0.1);
      [-2, 2].forEach(function (x) { F.cyl(x, 0, LZ - 2, 0.12, 2.5, 0, TIMBER, FW); F.cyl(x, 2.45, LZ - 2, 0.18, 0.3, 0, GLOW, 'glow'); });
    }
  }

  /* ================================================================ arena (the owner, 2026-11-12: "build an arena") */
  function arena(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), porph = F.pick(PORPH), pan = F.pick(PANEL), bc = shade(c, -0.12), sail = F.pick(SAIL);
    if (F.variant === 0) {
      /* -------- the round arena: a sand floor inside a podium wall faced in Ancient panels with barred pit gates; tiers of
         stone seats; a battered basalt drum round them with a porphyry band; twelve girder masts with bronze caps carrying
         shade sails on cable to an inner ring; two Vothic gates; the royal box under a tank-head dome */
      const R0 = 9.0, NT = 6, TD = 1.0, TH = 0.55, R1 = R0 + 0.6 + NT * TD, RO = R1 + 0.8, N = 36, HW = 6.6;
      F.cyl(0, 0, 0, R0, 0.12, 0, shade(0xb8a27a, -0.05), FD);
      const seg = function (r, y, h, dep, col, fam, skip) { for (let i = 0; i < N; i++) { if (skip && skip(i)) continue; const a = (i + 0.5) / N * TAU, w = 2 * r * Math.tan(Math.PI / N) + 0.06;
        F.box(Math.sin(a) * r, y, Math.cos(a) * r, w, h, dep, a, col, fam); } };
      const gate = function (i) { return i === 0 || i === N / 2; };
      /* the podium wall: stone, faced with panel courses (two rows), the pit gates barred */
      seg(R0 + 0.3, 0, 1.6, 0.6, bc, FS);
      for (let i = 0; i < N; i++) { const a = (i + 0.5) / N * TAU, w = 2 * (R0 - 0.02) * Math.tan(Math.PI / N);
        const pit = i % 9 === 4;
        [0.1, 0.85].forEach(function (y) { if (pit) return; F.box(Math.sin(a) * (R0 - 0.02), y, Math.cos(a) * (R0 - 0.02), w - 0.06, 0.7, 0.06, a, shade(pan, (i % 2 ? -0.04 : 0)), FP); });
        if (pit) { F.box(Math.sin(a) * (R0 + 0.05), 0.1, Math.cos(a) * (R0 + 0.05), w - 0.2, 1.4, 0.08, a, DOOR, FT);
          for (let k = -3; k <= 3; k++) { const b = a + k * 0.022; F.rod(Math.sin(b) * (R0 - 0.06), 0.1, Math.cos(b) * (R0 - 0.06), Math.sin(b) * (R0 - 0.06), 1.5, Math.cos(b) * (R0 - 0.06), 0.03, STEEL, FT); } } }
      seg(R0 + 0.3, 1.6, 0.14, 0.8, BRONZE, FZ);
      /* the tiers */
      for (let k = 0; k < NT; k++) seg(R0 + 0.6 + (k + 0.5) * TD, 0, 1.6 + (k + 1) * TH, TD + 0.02, k % 2 ? c : shade(c, 0.04), FS, gate);
      /* the drum: battered basalt, a porphyry band of panels, slits; the gates */
      seg(RO, 0, HW, 1.4, bas, FB, gate);
      seg(RO + 0.72, HW - 1.4, 0.9, 0.06, porph, FP, gate);
      seg(RO, HW, 0.25, 1.6, bc, FS, gate);
      for (let i = 2; i < N; i += 4) { if (gate(i)) continue; const a = (i + 0.5) / N * TAU; F.box(Math.sin(a) * (RO + 0.7), 2.0, Math.cos(a) * (RO + 0.7), 0.42, 1.6, 0.05, a, GLASSC, 'glass'); }
      [0, Math.PI].forEach(function (a) { const s = Math.sin(a), co = Math.cos(a), px = function (u, r) { return [s * r + co * u, co * r - s * u]; };
        [-1, 1].forEach(function (k) { const p = px(k * 2.2, RO + 0.6); K.pylon(p[0], p[1], 0, 0.6, HW + 0.8, shade(c, -0.06)); });
        const a0 = px(-2.6, RO + 0.6), a1 = px(2.6, RO + 0.6); F.beam(a0[0], 4.6, a0[1], a1[0], 4.6, a1[1], 0.55, 0.45, STEEL, FT);
        const m = px(0, RO + 0.9); F.beam(m[0] - co * 0.42, 5.3 - 0.42, m[1] + s * 0.42, m[0] + co * 0.42, 5.3 + 0.42, m[1] - s * 0.42, 0.84, 0.08, GOLD, 'paint');
        const f = px(0, R0 + 0.6); F.box(f[0], 0, f[1], 3.4, 0.1, 2 * (RO - R0), a, shade(0xb8a27a, -0.1), FD); });
      /* the masts, the inner ring, the sails (sloped strips: F.beam is rotation-safe) */
      const RM = RO + 0.2, YM = 11.5, RI = R0 - 0.5, YI = 8.8, M = 12;
      for (let i = 0; i < M; i++) { const a = (i + 0.25) / M * TAU, x = Math.sin(a) * RM, z = Math.cos(a) * RM;
        F.box(x, HW + 0.25, z, 0.3, YM - HW - 0.25, 0.3, a, STEEL, FT); F.cone(x, YM, z, 0.24, 0.6, 0, BRONZE, FZ);
        const xi = Math.sin(a) * RI, zi = Math.cos(a) * RI;
        F.rod(x, YM - 0.2, z, xi, YI, zi, 0.025, CABLE, FT);
        if (i % 2 === 0) { const b = (i + 0.75) / M * TAU; F.beam(Math.sin(b) * (RM - 0.4), YM - 0.6, Math.cos(b) * (RM - 0.4), Math.sin(b) * (RI + 0.4), YI + 0.15, Math.cos(b) * (RI + 0.4), 0.04, 4.6, i % 4 ? sail : porph, FC); } }
      for (let i = 0; i < 24; i++) { const a0 = i / 24 * TAU, a1 = (i + 1) / 24 * TAU; F.rod(Math.sin(a0) * RI, YI, Math.cos(a0) * RI, Math.sin(a1) * RI, YI, Math.cos(a1) * RI, 0.06, BRONZE, FZ); }
      /* the royal box: on the east, over the top tier, four girder posts, a drum and a tank-head dome, purple hangings */
      const bx = R1 - 1.2, by = 1.6 + NT * TH;
      F.box(bx, by, 0, 3.0, 0.3, 4.2, 0, bc, FS);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.box(bx + p[0] * 1.3, by + 0.3, p[1] * 1.9, 0.2, 2.6, 0.2, 0, STEEL, FT); });
      F.box(bx, by + 2.9, 0, 3.2, 0.3, 4.4, 0, bc, FS);
      K.tankDome(bx, 0, by + 3.2, 1.6, 1.3, pan, { ribs: 8, gold: true, fin: 0.6 });
      [-1.2, 1.2].forEach(function (z) { F.box(bx - 1.32, by + 1.0, z, 0.05, 1.9, 0.9, 0, porph, FC); });
    } else {
      /* -------- the fighting pit: a sunken square floor of sand walled in Ancient panels with barred gates, stands of
         containers stacked in steps on four sides with timber benches and cable rails, a girder gantry over the pit with a
         hanging cage, the master's canopy with the gold diamond */
      const P = 5.5, WH = 2.5;   /* the pit's floor at the ground, its wall standing round it, the stands rising behind */
      F.box(0, 0, 0, 2 * P, 0.1, 2 * P, 0, shade(0xb8a27a, -0.05), FD);
      [0, 1, 2, 3].forEach(function (s) { const B = { x: 0, z: 0, w: 2 * P, d: 2 * P }; const W = 2 * P;
        K.fb(B, s, 0, 0, W + 0.4, WH, 0.4, 0.2, bc, FS);
        K.plates({ x: 0, z: 0, w: W, d: W }, [1, 0, 3, 2][s], 0.1, WH - 0.15, { pw: 1.1, ph: 0.78, skip: function (u, y) { return Math.abs(u) < 0.8 && y < 2.0; } });
        const g = K.at(B, [1, 0, 3, 2][s], 0, -0.02); for (let k = -3; k <= 3; k++) F.rod(g[0] + (s < 2 ? k * 0.2 : 0), 0.1, g[1] + (s < 2 ? 0 : k * 0.2), g[0] + (s < 2 ? k * 0.2 : 0), 2.0, g[1] + (s < 2 ? 0 : k * 0.2), 0.03, STEEL, FT); });
      /* the stands: two steps of containers on each side, benches on each, cable rails at the front */
      [[0, 1, 0], [0, -1, 0], [1, 0, Math.PI / 2], [-1, 0, Math.PI / 2]].forEach(function (q, si) {
        [0, 1].forEach(function (k) { const r = P + 1.6 + k * 2.5, y = k * 2.6;
          [-1, 0, 1].forEach(function (j) { const along = j * 6.1; const x = q[0] ? q[0] * r : along, z = q[1] ? q[1] * r : along;
            if (Math.abs(along) > 6 && k === 0 && si > 1) return;
            container(F, K, x, z, 0, q[2], CONT[(si + j + k + 3) % CONT.length]); if (k === 1) container(F, K, x, z, 2.6, q[2], CONT[(si + j + 2) % CONT.length]);
            const yb = (k + 1) * 2.6; const bxp = q[0] ? q[0] * (r - 0.6) : along, bzp = q[1] ? q[1] * (r - 0.6) : along;
            F.box(bxp, yb, bzp, q[0] ? 0.5 : 5.6, 0.45, q[0] ? 5.6 : 0.5, 0, TIMBER, FW); }); });
        const r0 = P + 0.35; K.rail(q[0] ? q[0] * r0 : -P, q[1] ? q[1] * r0 : -P, q[0] ? q[0] * r0 : P, q[1] ? q[1] * r0 : P, WH); });
      /* the gantry and its cage */
      [-1, 1].forEach(function (k) { F.box(k * (P + 0.6), WH, 0, 0.3, 5.4, 0.3, 0, STEEL, FT); F.cone(k * (P + 0.6), 7.9, 0, 0.24, 0.5, 0, BRONZE, FZ); });
      F.beam(-P - 0.8, 7.6, 0, P + 0.8, 7.6, 0, 0.45, 0.35, STEEL, FT);
      F.rod(1.4, 7.4, 0, 1.4, 4.8, 0, 0.02, CABLE, FT);
      F.cyl(1.4, 2.6, 0, 0.75, 0.12, 0, STEEL, FT); F.cyl(1.4, 4.66, 0, 0.75, 0.12, 0, STEEL, FT);
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; F.rod(1.4 + Math.sin(a) * 0.72, 2.7, Math.cos(a) * 0.72, 1.4 + Math.sin(a) * 0.72, 4.7, Math.cos(a) * 0.72, 0.025, STEEL, FT); }
      /* the master's canopy on the north stand */
      const mz = -(P + 1.6 + 2.5), my = 5.2;   /* on the top row of the north stand */
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.box(p[0] * 2.0, my, mz + p[1] * 0.9, 0.18, 2.6, 0.18, 0, STEEL, FT); });
      F.box(0, my + 2.6, mz, 4.6, 0.12, 2.4, 0, porph, FC);
      K.dia({ x: 0, z: mz, w: 4.6, d: 2.4 }, 0, 0, my + 3.3, 0.5, 0, GOLD, 'paint', 0.08);
      F.box(0, my + 2.72, mz - 1.2, 0.2, 1.4, 0.2, 0, STEEL, FT);
    }
  }

  /* ================================================================ vassal set (Drum & Torus, PLAN-SCRAP / sw-arcology PLAN §3) */
  function tenement(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), verd = F.pick(VERD), bc = shade(c, -0.1);
    const B = { x: 0, z: 0, w: 16.4, d: 15.6 };
    F.box(0, 0, 0, B.w + 0.8, 0.55, B.d + 0.8, 0, bas, FB);
    /* U-shaped 3-storey battered stone & Ancient-panel courtyard tenement around a +z gallery court */
    F.box(0, 0.55, -4.4, B.w, 10.2, 6.4, 0, c, FS);
    [-1, 1].forEach(function (sx) {
      F.box(sx * 5.6, 0.55, 1.8, 5.2, 9.4, 6.0, 0, shade(c, -0.04), FS);
      K.plates({ x: sx * 5.6, z: 1.8, w: 5.2, d: 6.0 }, 0, 6.4, 3.3, { pat: 'band', band: porph });
      K.slit({ x: sx * 5.6, z: 1.8, w: 5.2, d: 6.0 }, 0, 0, 4.0, 0.42, 1.45, { lit: sx > 0 });
      K.pylon(sx * 7.8, 4.6, 9.95, 0.45, 1.8, bc);
    });
    K.plates({ x: 0, z: -4.4, w: B.w, d: 6.4 }, 0, 7.2, 3.4, { pat: 'band', band: porph });
    K.carapace(0, -4.4, 10.75, B.w - 0.6, 6.2, 2.2, { n: 3, col: verd });
    K.door({ x: 0, z: -4.4, w: B.w, d: 6.4 }, 0, 0, 0.55, 1.45, 2.45, { wall: c, leaf: porph, diaC: GOLD, lamp: true });
    [-3.6, 3.6].forEach(function (u) {
      K.slit({ x: 0, z: -4.4, w: B.w, d: 6.4 }, 0, u, 4.1, 0.45, 1.5, { lit: true });
      K.slit({ x: 0, z: -4.4, w: B.w, d: 6.4 }, 0, u, 7.5, 0.45, 1.4, { lit: u < 0, dia: false });
    });
    /* exterior stone stair & cable-railed court gallery */
    F.box(0, 3.8, -0.5, 6.0, 0.24, 1.5, 0, STEEL, FT);
    K.rail(-2.9, 0.2, 2.9, 0.2, 4.04);
    K.flight(-2.2, 3.8, -2.2, 0.3, 0.55, 4.04, 1.25, bc);
    K.banner({ x: 0, z: -4.4, w: B.w, d: 6.4 }, 0, 0, 9.8, 2.6, porph);
  }

  function vsSmithy(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), bc = shade(c, -0.12);
    F.box(0, 0, 0, 13.4, 0.45, 11.2, 0, bas, FB);
    const B = { x: -2.8, z: -1.0, w: 6.8, d: 8.2 };
    F.box(B.x, 0.45, B.z, B.w, 5.2, B.d, 0, c, FS);
    K.plates(B, 0, 3.6, 2.0, { pat: 'band', band: porph });
    K.tankDome(B.x, B.z, 5.65, 3.1, 1.6, pan, { ribs: 8, fin: 0.6 });
    K.door(B, 0, 0, 0.45, 1.25, 2.25, { wall: c, leaf: STEEL, diaC: BRONZE, lamp: true });
    /* basalt forge stack with gold diamond & hull-plate anvil hood on +x */
    F.frustum(2.8, 0.45, -2.4, 1.35, 0.9, 7.8, 0, bas, FB, 4);
    K.dia({ x: 2.8, z: -2.4, w: 2.1, d: 2.1 }, 0, 0, 5.8, 0.48, 0.04, GOLD, 'gold');
    F.cyl(2.8, 8.25, -2.4, 0.45, 0.65, 0, STEEL, FT);
    F.box(3.2, 0.45, 0.8, 4.8, 0.18, 5.6, 0, bc, FS);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { F.box(3.2 + q[0] * 2.1, 0.63, 0.8 + q[1] * 2.4, 0.18, 3.1, 0.18, 0, STEEL, FT); });
    F.ell(3.2, 3.73, 0.8, 2.5, 0.85, 2.8, 0, F.pick(VERD), FV);
    F.box(2.8, 0.63, -1.1, 1.5, 0.85, 1.2, 0, bas, FB);
    F.box(2.8, 1.48, -1.1, 0.9, 0.16, 0.7, 0, GLOW, 'glow');
    K.jar(5.2, 3.8, 0.45, 1.0); K.crate(4.4, 4.1, 0.45, 0.9);
  }

  function vsBakery(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), cloth = F.pick(SAIL);
    F.box(0, 0, 0, 13.2, 0.4, 11.2, 0, bas, FB);
    const B = { x: 1.8, z: -0.6, w: 8.2, d: 8.4 };
    F.box(B.x, 0.4, B.z, B.w, 4.8, B.d, 0, c, FS);
    K.parapet(B, 5.2, 0.45, 0.35, shade(c, -0.1));
    K.plates(B, 0, 3.4, 1.7, { pat: 'band', band: porph });
    K.door(B, 0, -2.0, 0.4, 1.15, 2.15, { wall: c, leaf: porph, diaC: BRONZE });
    K.slit(B, 0, 1.8, 1.5, 0.5, 1.4, { lit: true });
    /* domed basalt & tank-head beehive oven on -x + ration bread canopy in front */
    F.cyl(-4.0, 0.4, -1.2, 2.25, 1.8, 0, bas, FB);
    K.tankDome(-4.0, -1.2, 2.2, 2.2, 1.65, pan, { ribs: 6, fin: 0.35 });
    F.cyl(-4.0, 3.85, -1.2, 0.32, 3.4, 0, STEEL, FT);
    F.box(-4.0, 0.9, 1.05, 0.9, 0.7, 0.3, 0, GLOW, 'glow');
    K.canopy(1.8, 4.3, 0.4, 5.4, 2.0, cloth);
    F.box(1.8, 0.4, 4.1, 4.4, 0.95, 0.65, 0, TIMBER, FW);
    K.jar(-1.6, 4.2, 0.4, 1.1); K.jar(-0.8, 4.4, 0.4, 0.9);
  }

  function vsBrewery(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), verd = F.pick(VERD);
    F.box(0, 0, 0, 15.2, 0.45, 11.2, 0, bas, FB);
    const B = { x: -2.4, z: -0.6, w: 9.2, d: 8.6 };
    F.box(B.x, 0.45, B.z, B.w, 6.6, B.d, 0, c, FS);
    K.carapace(B.x, B.z, 7.05, B.w - 0.5, B.d - 0.6, 2.1, { n: 3, col: verd });
    K.door(B, 0, -1.6, 0.45, 1.3, 2.3, { wall: c, leaf: porph, diaC: GOLD, lamp: true });
    K.slit(B, 0, 2.0, 1.8, 0.45, 1.5, { lit: true });
    K.slit(B, 0, 2.0, 4.3, 0.45, 1.3, { lit: false, dia: false });
    /* twin salvaged copper/panel brewing stills on +x with bronze condenser bridge */
    [[-1.8, 5.2], [1.8, 4.6]].forEach(function (q) {
      const top = K.tank(4.6, q[0], 0.45, 1.65, q[1], pan);
      K.tankDome(4.6, q[0], top, 1.68, 0.95, BRONZE, { ribs: 6, fin: 0.5 });
    });
    F.rod(4.6, 6.1, -1.8, 1.8, 5.8, -1.0, 0.14, BRONZE, FZ);
    K.banner(B, 0, 0.4, 6.5, 2.4, porph);
    K.jar(4.8, 4.2, 0.45, 1.15); K.crate(3.4, 4.4, 0.45, 0.95);
  }

  function vsWorkshop(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), bc = shade(c, -0.1);
    F.box(0, 0, 0, 13.4, 0.45, 11.2, 0, bas, FB);
    const B = { x: 0, z: -0.5, w: 11.8, d: 8.8 };
    F.box(B.x, 0.45, B.z, B.w, 6.2, B.d, 0, c, FS);
    K.plates(B, 0, 4.1, 2.4, { pat: 'band', band: porph });
    K.parapet(B, 6.65, 0.45, 0.35, bc);
    /* Ancient-glass clerestory lantern framed in salvaged I-beams on roof */
    F.box(0, 6.65, -0.5, 6.8, 1.55, 3.6, 0, GLASSC, 'glass');
    F.box(0, 6.85, -0.5, 4.2, 1.0, 2.0, 0, GLOW, 'glow');
    F.pyrRoof(0, 8.2, -0.5, 7.4, 1.05, 4.2, 0, pan, FP);
    K.door(B, 0, -2.6, 0.45, 1.35, 2.3, { wall: c, leaf: TIMBERS[0], panel: true, diaC: BRONZE, lamp: true });
    [-0.2, 2.2, 4.2].forEach(function (u) { K.slit(B, 0, u, 1.6, 0.55, 1.6, { lit: u < 3 }); });
    [-5.9, 5.9].forEach(function (x) { K.pylon(x, 3.9, 6.65, 0.42, 1.5, bc); });
    K.crate(-4.6, 4.5, 0.45, 1.0); K.jar(4.8, 4.4, 0.45, 1.0);
  }

  function vsBathhouse(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), bc = shade(c, -0.12);
    F.box(0, 0, 0, 19.2, 0.55, 17.2, 0, bas, FB);
    const B = { x: -1.4, z: -0.4, w: 14.6, d: 13.6 };
    F.box(B.x, 0.55, B.z, B.w, 6.4, B.d, 0, c, FS);
    K.plates(B, 0, 4.5, 2.3, { pat: 'band', band: porph });
    K.parapet(B, 6.95, 0.5, 0.4, bc);
    /* twin ribbed Ancient tank-head steam domes crowning the caldarium & tepidarium */
    K.tankDome(-4.6, -0.4, 6.95, 3.6, 2.6, pan, { ribs: 10, fin: 0.9, gold: true });
    K.tankDome(2.2, -0.4, 6.95, 2.9, 2.1, shade(pan, -0.05), { ribs: 8, fin: 0.7 });
    K.door(B, 0, -1.4, 0.55, 1.65, 2.65, { wall: c, leaf: porph, diaC: GOLD, diaK: 0.6, lamp: true });
    [-5.6, 2.6, 4.8].forEach(function (u) { K.slit(B, 0, u, 2.2, 0.48, 1.6, { lit: true }); });
    /* salvaged vertical boiler tank & steam pipe on +x */
    const bTop = K.tank(7.6, -1.8, 0.55, 1.6, 5.8, STEEL);
    F.cyl(7.6, bTop, -1.8, 0.32, 3.2, 0, STEEL, FT);
    F.rod(7.6, 4.4, -1.8, 5.9, 4.4, -0.8, 0.16, BRONZE, FZ);
    K.banner(B, 0, -4.4, 6.4, 2.6, porph); K.banner(B, 0, 1.6, 6.4, 2.6, porph);
  }

  function vsGranary(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), bc = shade(c, -0.1);
    F.box(0, 0, 0, 21.2, 0.65, 17.2, 0, bas, FB);
    const B = { x: 0, z: -1.4, w: 18.6, d: 11.8 };
    F.box(B.x, 0.65, B.z, B.w, 8.2, B.d, 0, c, FS);
    /* girder flying buttresses along both flanks & 3 tribute tank-head domes along ridge */
    [-6.2, 0, 6.2].forEach(function (x, i) {
      K.tankDome(x, B.z, 8.85, 2.7, 2.1, pan, { ribs: 8, fin: 0.85, gold: i === 1 });
    });
    [-1, 1].forEach(function (sx) {
      [-3.8, 1.0].forEach(function (z) { K.buttress(sx * 10.2, z, sx * 9.3, z, 5.8, 7.6, bc); });
    });
    K.plates(B, 0, 5.6, 3.1, { pat: 'band', band: porph });
    /* elevated tribute weigh-porch & Ordinator gold diamond seal at +z */
    F.box(0, 0.65, 5.6, 8.4, 1.1, 2.6, 0, bc, FS);
    K.flight(0, 8.0, 0, 6.9, 0.65, 1.75, 2.4, shade(c, -0.08));
    K.door(B, 0, 0, 1.75, 1.8, 2.8, { wall: c, panel: true, diaC: GOLD, diaK: 0.75, lamp: true });
    [-5.6, 5.6].forEach(function (u) { K.slit(B, 0, u, 3.8, 0.42, 1.6, { lit: false }); });
    K.jar(-3.2, 5.8, 1.75, 1.2); K.jar(3.2, 5.8, 1.75, 1.2);
  }

  function vsBarracks(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), porph = F.pick(PORPH), bc = shade(c, -0.12);
    F.box(0, 0, 0, 23.2, 0.55, 17.2, 0, bas, FB);
    const B = { x: 0, z: -1.6, w: 21.4, d: 11.4 };
    F.box(B.x, 0.55, B.z, B.w, 7.6, B.d, 0, c, FS);
    K.plates(B, 0, 5.0, 2.9, { pat: 'band', band: porph });
    K.parapet(B, 8.15, 0.55, 0.4, bc);
    /* flanking Velothi corner pylons, central watch lantern, double billet doors */
    [-10.2, 10.2].forEach(function (x) {
      [-6.8, 3.6].forEach(function (z) { K.pylon(x, z, 8.15, 0.55, 2.1, bc); });
    });
    K.tankDome(0, B.z, 8.15, 2.8, 1.95, pan, { ribs: 8, fin: 0.85, gold: true });
    [-4.8, 4.8].forEach(function (u) {
      K.door(B, 0, u, 0.55, 1.45, 2.45, { wall: c, leaf: porph, diaC: BRONZE, lamp: true });
    });
    [-8.2, -1.8, 1.8, 8.2].forEach(function (u) {
      K.slit(B, 0, u, 2.0, 0.42, 1.45, { lit: true, dia: false });
      K.slit(B, 0, u, 5.2, 0.42, 1.45, { lit: Math.abs(u) < 4 });
    });
    K.dia(B, 0, 0, 6.4, 0.95, 0.08, GOLD, 'gold', 0.11);
    K.banner(B, 0, -2.2, 7.4, 3.0, porph); K.banner(B, 0, 2.2, 7.4, 3.0, porph);
    /* front muster wall with weapon racks */
    [-7.6, 7.6].forEach(function (x) { F.box(x, 0.55, 7.4, 6.2, 1.35, 0.45, 0, bas, FB); });
  }

  /* ================================================================ the entries */
  const E = [
    ['voth_scrap_house_poor', 'Scrap Poor House', 'housing', ['poor', 'warren', 'shore'], [0, 0.3], 3, poor,
      'Poor houses of the Ancient scrap: a whole tank stood up as a hovel beside a mud lean-to; battered mud walls under two overlapping hull shells; a row of panel-fronted cells.'],
    ['voth_scrap_house', 'Scrap House', 'housing', ['common', 'canton', 'harbour'], [0.3, 0.65], 3, middle,
      'Middle houses with the scrap set in: a Velothi tower-house under an Ancient tank-head dome; a Hlaalu block under a hip roof of copper hull panels; a canal house on girder piles.'],
    ['voth_scrap_manor', 'Scrap Manor', 'housing', ['wealthy', 'manor', 'canton'], [0.65, 1], 2, rich,
      'A Redoran hall under a carapace of hull plates beside a tank tower; a Velothi domed manor with girder flying buttresses and tank-head domes, in purple and gold.'],
    ['voth_scrap_shop', 'Scrap Shop', 'shop', ['market', 'common', 'harbour'], [0.2, 0.6], 2, shop,
      'A trader whose front is shuttered by one big Ancient panel propped up as its awning; a smithy in a tank with a hull-plate yard roof.'],
    ['voth_scrap_tavern', 'Scrap Cornerclub', 'tavern', ['common', 'harbour', 'market'], [0.25, 0.6], 1, tavern,
      'A cornerclub in two stacked tanks, a gallery between them on girder brackets behind a cable rail, a lantern of Ancient glass at its door.'],
    ['voth_scrap_warehouse', 'Scrap Canal Store', 'industrial', ['harbour', 'industry'], [0.2, 0.6], 1, warehouse,
      'A canal store faced in panel courses above the stone, stacked loading doors framed in girders under a girder hoist, two tank cisterns.'],
    ['voth_scrap_tomb', 'Scrap Family Tomb', 'religious', ['temple', 'outskirts'], [0.2, 0.9], 2, tomb,
      'A family tomb in a fuel-tank segment (Hook\'s necropolis in the tank farm), its end walled with a purple door under the gold diamond; a panel-faced pylon tomb with a glass lantern.'],
    ['voth_scrap_shrine', 'Scrap Sun Shrine', 'religious', ['temple', 'common'], [0.3, 0.9], 2, shrine,
      'A stepped Sun shrine faced in panel courses, a reclaimed Ancient dish set up as the sun\'s disc in gold; a wayside girder pylon shrine.'],
    ['voth_scrap_watch', 'Scrap Watch and Gate', 'military', ['wall', 'gate', 'harbour', 'fortress'], [0.3, 0.8], 2, watch,
      'An Ordinator watchtower faced in panel courses above the stone, girder buttresses, a lantern room of Ancient glass; a canton gate with the gold diamond over leaves of Ancient panel.'],
    ['voth_scrap_market', 'Scrap Slave Market', 'civic', ['market', 'harbour'], [0.2, 0.8], 2, market,
      'The slave market in the container compounds (Hook): Ancient containers ranged round a square, their pens barred inward, the auction block under a purple canopy, a gate under the gold diamond; or a lane of container pens to a block under a hull-plate shell.'],
    ['voth_scrap_arena', 'Scrap Arena', 'civic', ['canton', 'common'], [0.3, 1], 2, arena,
      'A round arena: a sand floor in a podium wall faced in Ancient panels with barred pit gates, stone tiers, a basalt drum with a porphyry band, girder masts carrying shade sails on cable, a royal box under a tank-head dome; or a fighting pit ringed by container stands under a girder gantry and its cage.'],
    ['voth_scrap_tenement', 'Scrap Courtyard Tenement', 'housing', ['common', 'canton', 'vassal'], [0.2, 0.6], 1, tenement,
      'Three-storey U-shaped battered stone and Ancient-panel courtyard tenement under a copper hull-plate carapace, with exterior stone stair and cable-railed gallery.'],
    ['voth_scrap_smithy', 'Scrap Voth Smithy', 'industrial', ['industry', 'market', 'vassal'], [0.25, 0.65], 1, vsSmithy,
      'Domed forge hall beside a battered basalt chimney stamped with the gold diamond, open anvil yard under a verdigris hull-plate shell.'],
    ['voth_scrap_bakery', 'Scrap Voth Bakery', 'shop', ['market', 'common', 'vassal'], [0.2, 0.6], 1, vsBakery,
      'Ration bakehouse with a tank-head beehive oven, steel flue, and street bread counter under a flat sail canopy.'],
    ['voth_scrap_brewery', 'Scrap Voth Brewery & Vat-House', 'industrial', ['industry', 'common', 'vassal'], [0.25, 0.65], 1, vsBrewery,
      'Carapace-roofed vat-house flanked by twin salvaged Ancient distillation tanks with bronze dome heads and condenser bridge.'],
    ['voth_scrap_workshop', 'Scrap Voth Craft Hall', 'industrial', ['common', 'market', 'vassal'], [0.25, 0.7], 1, vsWorkshop,
      'Skylit craft and artisan workshop framed in salvaged I-beams, faced in Ancient panel courses with corner Velothi pylons.'],
    ['voth_scrap_bathhouse', 'Scrap Voth Steam Bathhouse', 'civic', ['common', 'canton', 'vassal'], [0.3, 0.85], 1, vsBathhouse,
      'Twin tank-head domed caldarium and tepidarium heated by an exterior salvaged steel steam boiler and bronze header pipe.'],
    ['voth_scrap_granary', 'Scrap Voth Tribute Granary', 'industrial', ['industry', 'market', 'vassal'], [0.35, 0.85], 1, vsGranary,
      'Girder-buttressed imperial tribute granary under three tank-head domes with elevated weigh porch and gold Ordinator seal.'],
    ['voth_scrap_barracks', 'Scrap Voth Garrison Barracks', 'military', ['fortress', 'canton', 'vassal'], [0.3, 0.8], 1, vsBarracks,
      'Two-storey Chichani and vassal levy billet block with four corner Velothi pylons, central tank-head watch dome, and basalt muster wall.']
  ];
  /* measured sizes per variant (shoot.py --audit), including stairs, canopies, yards and props */
  const DIMS = {
    voth_scrap_market: [{ w: 27.1, d: 26.9, h: 6.3 }, { w: 14.4, d: 30.8, h: 6.3 }],
    voth_scrap_arena: [{ w: 34.5, d: 35.2, h: 13 }, { w: 21.7, d: 21.7, h: 9.3 }],
    voth_scrap_house_poor: [{ w: 8.1, d: 5.7, h: 5.4 }, { w: 6.6, d: 5.4, h: 4.2 }, { w: 11.0, d: 5.3, h: 5.9 }],
    voth_scrap_house: [{ w: 11.6, d: 10.7, h: 15.6 }, { w: 10.2, d: 12.2, h: 10.0 }, { w: 9.7, d: 7.3, h: 10.2 }],
    voth_scrap_manor: [{ w: 15.4, d: 16.4, h: 13.0 }, { w: 15.7, d: 14.6, h: 15.2 }],
    voth_scrap_shop: [{ w: 7.8, d: 9.6, h: 6.5 }, { w: 6.6, d: 12.1, h: 8.7 }],
    voth_scrap_tavern: [{ w: 10.5, d: 12.3, h: 9.9 }],
    voth_scrap_warehouse: [{ w: 20.8, d: 10.6, h: 9.5 }],
    voth_scrap_tomb: [{ w: 5.4, d: 9.7, h: 7.0 }, { w: 6.0, d: 6.0, h: 7.1 }],
    voth_scrap_shrine: [{ w: 9.2, d: 10.9, h: 8.6 }, { w: 3.0, d: 3.0, h: 5.8 }],
    voth_scrap_watch: [{ w: 11.7, d: 7.0, h: 17.3 }, { w: 11.5, d: 4.0, h: 10.5 }],
    voth_scrap_tenement: [{ w: 18.0, d: 18.0, h: 14.0 }],
    voth_scrap_smithy: [{ w: 14.0, d: 12.0, h: 9.0 }],
    voth_scrap_bakery: [{ w: 14.0, d: 12.0, h: 8.0 }],
    voth_scrap_brewery: [{ w: 16.0, d: 12.0, h: 10.0 }],
    voth_scrap_workshop: [{ w: 14.0, d: 12.0, h: 9.0 }],
    voth_scrap_bathhouse: [{ w: 20.0, d: 18.0, h: 11.0 }],
    voth_scrap_granary: [{ w: 22.0, d: 18.0, h: 13.0 }],
    voth_scrap_barracks: [{ w: 24.0, d: 18.0, h: 11.0 }]
  };
  E.forEach(function (e) {
    const V = DIMS[e[0]], mx = function (k) { return Math.max.apply(null, V.map(function (q) { return q[k]; })); };
    ASSET({
      key: e[0], name: e[1], culture: 'voth', family: e[2], source: 'voth-scrap', districts: e[3], wealth: e[4],
      blurb: e[7], w: mx('w'), d: mx('d'), h: mx('h'), variants: e[5], variantDims: V,
      build: function (F) { e[6](F, kit(F)); }
    });
  });
})();
