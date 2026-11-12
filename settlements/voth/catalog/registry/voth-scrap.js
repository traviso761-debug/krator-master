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
    K.fb = function (B, s, u, y, along, h, dep, off, col, fam) { const p = K.at(B, s, u, off); F.box(p[0], y, p[1], s < 2 ? along : dep, h, s < 2 ? dep : along, 0, col, fam || 'stone'); };
    /* the diamond on a face (Voth's sign): a square turned on its point, `k` from the centre to a point */
    K.dia = function (B, s, u, y, k, off, col, fam, t) {
      const p = K.at(B, s, u, off), L = k * Math.SQRT2, th = t == null ? 0.08 : t;
      if (s < 2) F.beam(p[0] - k / 2, y - k / 2, p[1], p[0] + k / 2, y + k / 2, p[1], L, th, col, fam || 'bronze');
      else F.beam(p[0], y - k / 2, p[1] - k / 2, p[0], y + k / 2, p[1] + k / 2, th, L, col, fam || 'bronze');
    };
    /* panel courses on face s of B from y0 up h: whole Ancient panels with a shadow joint; skip(u, y) leaves cells open */
    K.plates = function (B, s, y0, h, o) {
      o = o || {}; const along = s < 2 ? B.w : B.d, n = Math.max(1, Math.round(along / (o.pw == null ? 1.6 : o.pw))), m = Math.max(1, Math.round(h / (o.ph == null ? 0.9 : o.ph)));
      const pw = along / n, ph = h / m, g = 0.05, cols = o.cols || PANEL;
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
        const u = -along / 2 + pw * (i + 0.5), y = y0 + j * ph;
        if (o.skip && o.skip(u, y + ph / 2)) continue;
        const c = o.pat === 'band' && j === m - 1 ? (o.band || PORPH[0]) : shade(cols[(i * 7 + j * 3) % cols.length], (F.rnd() - 0.5) * 0.06);
        K.fb(B, s, u, y + g / 2, pw - g, ph - g, 0.07, 0.035, c, 'plastic');
      }
    };
    /* a slit window, Dunmer-tall: a dark reveal, the Ancients' glass (amber when lit) in a bronze frame, a small diamond over it */
    K.slit = function (B, s, u, y, w, h, o) {
      o = o || {}; const off = (o.off == null ? 0 : o.off);
      K.fb(B, s, u, y, w, h, 0.3, off - 0.1, o.lit ? GLOW : DOOR, o.lit ? 'glow' : 'wood');
      if (!o.lit) K.fb(B, s, u, y + 0.03, w - 0.06, h - 0.06, 0.03, off + 0.06, GLASSC, 'glass');
      [-1, 1].forEach(function (k) { K.fb(B, s, u + k * (w / 2 + 0.05), y - 0.05, 0.1, h + 0.1, 0.12, off + 0.02, BRONZE, 'bronze'); });
      K.fb(B, s, u, y - 0.12, w + 0.3, 0.12, 0.22, off + 0.04, o.sill || shade(STONE[0], -0.2), 'stone');
      if (o.dia !== false) K.dia(B, s, u, y + h + 0.32, 0.36, off + 0.04, BRONZE, 'bronze', 0.06);
    };
    /* a door: leaf (timber or an Ancient panel), stone jambs, a girder lintel, a threshold step, the diamond over it */
    K.door = function (B, s, u, y, dw, dh, o) {
      o = o || {}; const off = (o.off == null ? 0 : o.off), wall = o.wall || STONE[0];
      K.fb(B, s, u, y, dw, dh, 0.2, off - 0.05, o.leaf || TIMBERS[0], o.panel ? 'plastic' : 'wood');
      [-1, 1].forEach(function (k) { K.fb(B, s, u + k * (dw / 2 + 0.14), y, 0.28, dh + 0.1, 0.36, off, shade(wall, -0.15), 'stone'); });
      K.fb(B, s, u, y + dh + 0.06, dw + 0.8, 0.3, 0.3, off + 0.06, STEEL, 'metal');
      K.fb(B, s, u, Math.max(0, y - 0.16), dw + 0.6, 0.16, 0.7, off + 0.3, shade(wall, -0.25), 'stone');
      if (o.dia !== false) K.dia(B, s, u, y + dh + 0.9, (o.diaK == null ? 0.5 : o.diaK), off + 0.12, o.diaC || BRONZE, o.diaC === GOLD ? 'gold' : 'bronze');
      if (o.lamp) { const p = K.at(B, s, u + dw / 2 + 0.55, off + 0.28); F.cyl(p[0], y + dh - 0.2, p[1], 0.12, 0.34, 0, GLOW, 'glow'); F.cyl(p[0], y + dh + 0.14, p[1], 0.16, 0.06, 0, BRONZE, 'bronze'); }
    };
    K.parapet = function (B, y, h, t, col) {
      F.box(B.x, y, B.z + B.d / 2 - t / 2, B.w, h, t, 0, col, 'stone'); F.box(B.x, y, B.z - B.d / 2 + t / 2, B.w, h, t, 0, col, 'stone');
      F.box(B.x + B.w / 2 - t / 2, y, B.z, t, h, B.d - 2 * t, 0, col, 'stone'); F.box(B.x - B.w / 2 + t / 2, y, B.z, t, h, B.d - 2 * t, 0, col, 'stone');
    };
    /* a capped pylon (Velothi): a battered stone pier, its cap a bronze cone */
    K.pylon = function (x, z, y, r, h, col) { F.frustum(x, y, z, r, r * 0.72, h, 0, col, 'stone', 4); F.box(x, y + h, z, r * 1.7, 0.12, r * 1.7, 0, STEEL, 'metal'); F.cone(x, y + h + 0.12, z, r * 0.8, r * 1.6, 0, BRONZE, 'bronze'); };
    /* a whole Ancient tank stood up: its body, blackened steel bands */
    K.tank = function (x, z, y, r, h, col, o) { o = o || {}; F.cyl(x, y, z, r, h, 0, col, 'plastic'); const st = o.band == null ? 1.6 : o.band; for (let yy = st; yy < h - 0.2; yy += st) F.cyl(x, y + yy - 0.06, z, r + 0.04, 0.12, 0, STEEL, 'metal'); return y + h; };
    /* an Ancient tank head as a dome, ribbed with blackened girders, a bronze finial */
    K.tankDome = function (x, z, y, r, h, col, o) {
      o = o || {}; F.dome(x, y, z, r, h, 0, col, 'plastic'); const n = (o.ribs == null ? 8 : o.ribs);
      for (let i = 0; i < n; i++) { const a = i / n * TAU; let px = r * 1.01, py = 0;
        for (let k = 1; k <= 3; k++) { const t = k / 3 * Math.PI / 2, qx = r * 1.01 * Math.cos(t), qy = h * 1.01 * Math.sin(t);
          F.beam(x + Math.sin(a) * px, y + py, z + Math.cos(a) * px, x + Math.sin(a) * qx, y + qy, z + Math.cos(a) * qx, 0.09, 0.09, STEEL, 'metal'); px = qx; py = qy; } }
      F.cyl(x, y + h - 0.05, z, 0.18, 0.2, 0, BRONZE, 'bronze'); F.cyl(x, y + h + 0.15, z, 0.06, o.fin == null ? 0.8 : o.fin, 0, BRONZE, 'bronze'); F.ball(x, y + h + 0.15 + (o.fin == null ? 0.8 : o.fin), z, 0.15, o.gold ? GOLD : BRONZE, o.gold ? 'gold' : 'bronze');
      return y + h;
    };
    /* a carapace of hull plates (the Redoran shell in Ancient copper): n overlapping half-shells along z, centred on the wall top
       (their lower halves inside the walls: w is the walls' width), a girder rib over each, a bronze boss on its crown */
    K.carapace = function (x, z, y, w, d, h, o) {
      o = o || {}; const n = (o.n == null ? 3 : o.n), seg = d / n, col = o.col || VERD[0];
      for (let i = 0; i < n; i++) {
        const zc = z - d / 2 + seg * (i + 0.5), hh = h * (1 - 0.08 * Math.abs(i - (n - 1) / 2));
        F.ell(x, y, zc, w / 2, hh, seg * 0.62, 0, shade(col, (i % 2 ? -0.05 : 0.03)), 'plastic');
        let px = -w / 2 - 0.02, py = 0;
        for (let k = 1; k <= 6; k++) { const t = k / 6 * Math.PI, qx = -Math.cos(t) * (w / 2 + 0.02), qy = Math.sin(t) * (hh + 0.02);
          F.beam(x + px, y + py, zc, x + qx, y + qy, zc, 0.12, 0.12, STEEL, 'metal'); px = qx; py = qy; }
        F.cyl(x, y + hh - 0.05, zc, 0.22, 0.2, 0, BRONZE, 'bronze');
      }
    };
    /* a flying buttress of girders: a pier standing out from the wall, a girder from its head to the wall */
    K.buttress = function (px, pz, wx, wz, hp, hw, col) { F.frustum(px, 0, pz, 0.45, 0.32, hp, 0, col, 'stone', 4); F.cone(px, hp, pz, 0.36, 0.6, 0, BRONZE, 'bronze');
      F.beam(px, hp - 0.3, pz, wx, hw, wz, 0.26, 0.26, STEEL, 'metal'); };
    /* a cable rail: girder posts every ~1.5 m, two cables, a bronze rail */
    K.rail = function (x0, z0, x1, z1, y) { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 1.5));
      for (let i = 0; i <= n; i++) { const t = i / n; F.box(x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, 0.09, 1.0, 0.09, 0, STEEL, 'metal'); }
      [0.38, 0.7].forEach(function (h) { F.rod(x0, y + h, z0, x1, y + h, z1, 0.012, CABLE, 'metal'); });
      F.rod(x0, y + 1.02, z0, x1, y + 1.02, z1, 0.035, BRONZE, 'bronze'); };
    /* a solid stone flight from (x0, z0) at y0 to (x1, z1) at y1, recorded for the walkers */
    K.flight = function (x0, z0, x1, z1, y0, y1, wd, col) {
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round((y1 - y0) / 0.2)), ry = Math.atan2(x1 - x0, z1 - z0);
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; F.box(x0 + (x1 - x0) * t, y0, z0 + (z1 - z0) * t, wd, (y1 - y0) * (i + 1) / n, L / n + 0.02, ry, col, 'stone'); }
      walkRec(F, 'stair', x0, y0, z0, x1, y1, z1, wd);
    };
    K.ladder = function (x, z, y0, y1, ry) { const c = Math.cos(ry), s = Math.sin(ry);
      [-0.25, 0.25].forEach(function (k) { F.rod(x + k * c, y0, z - k * s, x + k * c, y1 + 0.8, z - k * s, 0.04, TIMBER, 'wood'); });
      for (let yy = y0 + 0.3; yy < y1 + 0.6; yy += 0.32) F.rod(x - 0.25 * c, yy, z + 0.25 * s, x + 0.25 * c, yy, z - 0.25 * s, 0.025, TIMBER, 'wood');
      walkRec(F, 'ladder', x, y0, z, x, y1, z, 0.5); };
    /* flat cloth on a frame of four poles (never tilted cloth: voth-housing's rule) */
    K.canopy = function (x, z, y, w, d, cloth) { [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.rod(x + p[0] * w / 2, y, z + p[1] * d / 2, x + p[0] * w / 2, y + 2.3, z + p[1] * d / 2, 0.05, TIMBER, 'wood'); });
      F.box(x, y + 2.3, z, w + 0.2, 0.05, d + 0.2, 0, cloth, 'cloth'); };
    K.jar = function (x, z, y, s) { F.ell(x, y + 0.32 * s, z, 0.24 * s, 0.34 * s, 0.24 * s, 0, F.pick([0x8a5a3a, 0x6b4a32, 0x9a7a5a]), 'ceramic'); };
    K.crate = function (x, z, y, s) { F.box(x, y, z, 0.7 * s, 0.6 * s, 0.7 * s, F.rr(-0.3, 0.3), 0x7a6040, 'wood'); };
    K.banner = function (B, s, u, y, h, col) { const p = K.at(B, s, u, 0.18); F.box(p[0], y - h, p[1], s < 2 ? 0.9 : 0.05, h, s < 2 ? 0.05 : 0.9, 0, col, 'cloth'); const q = K.at(B, s, u, 0.3); F.rod(q[0] - (s < 2 ? 0.55 : 0), y, q[1] - (s < 2 ? 0 : 0.55), q[0] + (s < 2 ? 0.55 : 0), y, q[1] + (s < 2 ? 0 : 0.55), 0.04, BRONZE, 'bronze'); };
    return K;
  }

  /* ================================================================ poor */
  function poor(F, K) {
    const c = F.pick(STONE_POOR), mud = F.pick(MUD), bas = F.pick(BASALT), pan = F.pick(PANEL), cloth = F.pick(SAIL);
    if (F.variant === 0) {
      /* -------- tank hovel: a whole tank stood on a basalt ring, a battered mud lean-to beside it with a roof terrace */
      F.cyl(0, 0, 0, 2.7, 0.4, 0, bas, 'stone');
      const top = K.tank(0, 0, 0.4, 2.4, 3.2, pan);
      K.tankDome(0, 0, top, 2.45, 1.1, shade(pan, -0.04), { ribs: 6, fin: 0.4 });
      const T = { x: 0, z: 0, w: 4.8, d: 4.8 };
      K.door(T, 0, 0, 0.4, 1.0, 2.1, { wall: c, diaK: 0.4, off: -0.06 });
      [[2, 0], [3, 0], [1, 0]].forEach(function (w) { K.slit(T, w[0], w[1], 1.6, 0.35, 1.1, { off: -0.08, dia: false }); });
      const L = { x: -3.6, z: 0.4, w: 2.8, d: 3.4 };
      F.frustum(L.x, 0, L.z, 1.5, 1.32, 2.6, 0, mud, 'stone', 4);
      F.box(L.x, 2.6, L.z, 2.9, 0.18, 3.0, 0, shade(mud, -0.15), 'stone');
      K.door({ x: L.x, z: L.z, w: 2.64, d: 2.64 }, 0, 0, 0, 0.9, 1.9, { wall: mud, dia: false, off: 0.05 });
      K.canopy(L.x, L.z, 2.78, 2.2, 2.2, cloth);
      K.jar(L.x - 0.7, L.z - 0.6, 2.78, 1); K.jar(L.x + 0.6, L.z - 0.7, 2.78, 0.8); K.crate(L.x + 0.4, L.z + 0.5, 2.78, 0.8);
      K.ladder(L.x - 1.75, L.z + 1.2, 0, 2.78, Math.PI / 2);
      F.rod(1.2, top + 0.5, -1.2, 1.2, top + 1.6, -1.2, 0.1, STEEL, 'metal');   /* the stove pipe */
      K.jar(1.9, 2.2, 0, 1.1); K.crate(-1.5, 2.6, 0, 1);
    } else if (F.variant === 1) {
      /* -------- carapace hovel: battered mud walls under two overlapping hull shells, girder ribs, a panel lean-to */
      const B = { x: 0, z: 0, w: 5.0, d: 4.2 };
      F.frustum(0, 0, 0, 2.55, 2.35, 2.4, 0, mud, 'stone', 4);
      F.box(0, 0, 0, 5.4, 0.35, 4.6, 0, bas, 'stone');
      K.carapace(0, 0, 2.4, 4.68, 4.0, 1.7, { n: 2, col: F.pick(VERD) });
      K.door(B, 0, -0.9, 0.35, 0.95, 1.9, { wall: mud, off: -0.15, diaK: 0.35 });
      K.slit(B, 0, 1.2, 1.0, 0.35, 0.9, { off: -0.15, lit: true, dia: false });
      K.slit(B, 2, 0, 1.0, 0.35, 0.9, { off: -0.15, dia: false }); K.slit(B, 1, 0.6, 1.0, 0.35, 0.9, { off: -0.15, dia: false });
      /* the lean-to: one Ancient panel on two girder posts, a hearth under it */
      F.box(-3.6, 0, 1.6, 0.2, 2.1, 0.2, 0, STEEL, 'metal'); F.box(-3.6, 0, -1.2, 0.2, 2.1, 0.2, 0, STEEL, 'metal');
      F.beam(-3.9, 2.1, 0.2, -2.3, 2.5, 0.2, 0.08, 3.4, pan, 'plastic');
      F.box(-3.3, 0, 0.2, 0.9, 0.5, 0.9, 0, bas, 'stone'); F.cyl(-3.3, 0.5, 0.2, 0.3, 0.12, 0, GLOW, 'glow');
      K.jar(1.9, 2.6, 0, 1); K.jar(2.4, 2.4, 0, 0.8);
    } else {
      /* -------- row of three cells: basalt party walls, fronts of Ancient panels in courses, flat roofs, a canopy and a ladder */
      const W = 3.2, D = 4.0, H = 2.8;
      for (let i = 0; i < 3; i++) {
        const x = (i - 1) * (W + 0.4), B = { x: x, z: 0, w: W, d: D }, h = i === 1 ? H + 0.6 : H;
        F.box(x, 0, -0.1, W, h, D - 0.2, 0, shade(c, -0.1), 'stone');
        K.plates(B, 0, 0, h, { pw: 1.07, ph: 0.93, skip: function (u, y) { return u > -1.2 && u < 0 && y < 2.1; } });
        K.door(B, 0, -0.55, 0, 0.9, 1.95, { wall: c, leaf: F.pick(BANNER), dia: i === 1, diaK: 0.3, off: 0.05 });
        K.slit(B, 0, 0.9, 1.0, 0.32, 0.9, { off: 0.07, dia: false, lit: i === 2 });
        F.box(x, h, -0.1, W + 0.25, 0.16, D, 0, shade(c, -0.2), 'stone');
        if (i < 2) F.frustum(x + W / 2 + 0.2, 0, -0.1, 0.22, 0.18, H + 0.3, 0, bas, 'stone', 4);
      }
      F.frustum(-1.5 * (W + 0.4) - 0.0, 0, -0.1, 0.25, 0.2, H + 0.2, 0, bas, 'stone', 4);
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
      F.frustum(0, 0, 0, r0 + 0.3, r0 + 0.2, 0.6, 0, bas, 'stone', 4);
      F.frustum(0, 0, 0, r0, r1, TH, 0, c, 'stone', 4);
      [0, 1, 2, 3].forEach(function (s) { K.plates(TB(9.4), s, 7.4, 3.9, { pw: 1.1, ph: 0.78, skip: function (u, y) { return Math.abs(u) < 0.45 && y > 8.2 && y < 9.9; } }); });
      F.frustum(0, 7.25, 0, tf(7.25) + 0.14, tf(7.25) + 0.14, 0.15, 0, BRONZE, 'bronze', 4);
      F.frustum(0, TH, 0, r1 + 0.25, r1 + 0.25, 0.35, 0, bc, 'stone', 4);
      const yT = TH + 0.35, TT = { x: 0, z: 0, w: 2 * r1 + 0.5, d: 2 * r1 + 0.5 };
      K.parapet(TT, yT, 0.7, 0.3, c);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { K.pylon(p[0] * (r1 + 0.05), p[1] * (r1 + 0.05), yT, 0.42, 1.5, shade(c, -0.05)); });
      F.cyl(0, yT, 0, 1.9, 0.9, 0, shade(c, 0.04), 'stone');
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; F.box(Math.sin(a) * 1.89, yT + 0.2, Math.cos(a) * 1.89, 0.36, 0.5, 0.12, a, GLOW, 'glow'); }
      K.tankDome(0, 0, yT + 0.9, 2.0, 1.7, pan, { ribs: 8, gold: true });
      [0, 1, 2, 3].forEach(function (s) { K.slit(TB(8.6), s, 0, 8.2, 0.5, 1.7, { off: 0.04 }); K.slit(TB(4), s, s === 0 ? 0 : -0.9, 4.0, 0.45, 1.5, { off: -0.02, lit: s === 1 }); });
      K.door(TB(1), 0, -0.8, 0.6, 1.2, 2.5, { wall: c, lamp: true });
      /* the wing: a battered block, its roof a terrace under a canopy, a door out of the tower onto it, the stair up its flank */
      const wx = 4.4, wz = 1.0, w0 = 2.4, WH = 4.6;
      F.frustum(wx, 0, wz, w0, w0 - 0.25, WH, 0, shade(c, 0.03), 'stone', 4);
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
      F.box(0, 0, 0, W + 0.4, 0.4, D + 0.4, 0, bas, 'stone');
      F.box(0, 0.4, 0, W, H1, D, 0, c, 'stone');
      F.box(0, 0.4 + H1, 0, W + 0.5, 0.25, D + 0.5, 0, bc, 'stone');
      const y2 = 0.65 + H1, B2 = { x: 0, z: 0.2, w: W + 0.4, d: D + 0.4 };
      F.box(0, y2, 0.2, W + 0.4, H2, D + 0.4, 0, shade(c, 0.04), 'stone');
      [0, 1].forEach(function (s) { K.plates(B2, s, y2 + H2 - 1.0, 1.0, { pw: 1.2, ph: 1.0, pat: 'band', band: PORPH[0] }); });
      const yR = y2 + H2;
      F.box(0, yR, 0.2, W + 1.4, 0.2, D + 1.4, 0, bc, 'stone');
      F.hipRoof(0, yR + 0.2, 0.2, W + 1.6, 2.3, D + 1.6, 0, verd, 'plastic');
      const rr = ((W + 1.6) - (D + 1.6)) / 2;
      for (let i = 0; i < 7; i++) { const x = -(W + 1.6) / 2 + 0.9 + i * ((W + 1.6 - 1.8) / 6), xr = Math.max(-rr, Math.min(rr, x));
        [-1, 1].forEach(function (k) { F.beam(x, yR + 0.27, 0.2 + k * ((D + 1.6) / 2 - 0.05), xr, yR + 2.5, 0.2, 0.06, 0.06, BRONZE, 'bronze'); }); }
      /* front: a door with the diamond, shuttered windows of white panel, a girder balcony upstairs */
      const B1 = { x: 0, z: 0, w: W, d: D };
      K.door(B1, 0, 0, 0.4, 1.4, 2.6, { wall: c, lamp: true, diaK: 0.5 });
      [-2.8, 2.8].forEach(function (u) { K.slit(B1, 0, u, 1.4, 0.55, 1.5, { lit: u > 0 }); });
      F.box(0, y2, D / 2 + 1.2, 4.2, 0.18, 1.6, 0, STEEL, 'metal');
      [-1, 1].forEach(function (k) { F.beam(k * 1.9, y2 - 1.0, D / 2 + 0.4, k * 1.9, y2, D / 2 + 1.8, 0.2, 0.2, STEEL, 'metal'); });
      K.rail(-2.1, D / 2 + 2.0, 2.1, D / 2 + 2.0, y2 + 0.18);
      K.door(B2, 0, 0, y2, 1.1, 2.3, { wall: c, dia: false, off: 0.02 });
      [-3.0, 3.0].forEach(function (u) { K.slit(B2, 0, u, y2 + 0.5, 0.5, 1.4, { off: 0.02, dia: false });
        [-1, 1].forEach(function (k) { K.fb(B2, 0, u + k * 0.6, y2 + 0.4, 0.42, 1.6, 0.06, 0.1, F.pick(PANEL), 'plastic'); }); });
      [2, 3].forEach(function (s) { [-1.8, 1.8].forEach(function (u) { K.slit(B1, s, u, 1.4, 0.5, 1.4, { dia: false }); K.slit(B2, s, u, y2 + 0.5, 0.5, 1.4, { off: 0.02, dia: false }); }); });
      [-2, 2].forEach(function (u) { K.slit(B1, 1, u, 1.4, 0.5, 1.4, { dia: false }); });
      K.banner(B2, 0, 0, yR - 0.1, 1.8, F.pick(PORPH));
      /* the loft at the back: a terrace on the lower block's back, its canopy, a ladder */
      F.box(0, 0.4, -D / 2 - 1.6, W, H1, 3.2, 0, shade(c, -0.03), 'stone');
      K.parapet({ x: 0, z: -D / 2 - 1.6, w: W, d: 3.2 }, 0.4 + H1, 0.6, 0.2, c);
      K.canopy(-1.6, -D / 2 - 1.7, 0.4 + H1, 3.0, 2.2, cloth); K.jar(1.6, -D / 2 - 1.2, 0.4 + H1, 1); K.crate(2.6, -D / 2 - 2.3, 0.4 + H1, 1);
      K.ladder(W / 2 + 0.3, -D / 2 - 1.6, 0, 0.4 + H1, Math.PI / 2);
    } else {
      /* -------- canal house on girder piles: a stone house on a deck of panels over girder piles, a stair down to a landing,
         panel courses on the upper storey, a roof terrace and canopy */
      const W = 7.0, D = 6.0, PY = 1.8, H = 5.6;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) F.box(-3 + i * 2, 0, -2.4 + j * 2.4, 0.3, PY, 0.3, 0, STEEL, 'metal');
      F.box(0, PY, 0, W + 2.6, 0.25, D + 1.2, 0, shade(pan, -0.1), 'plastic');
      const B = { x: 0, z: 0, w: W, d: D }, y0 = PY + 0.25;
      F.box(0, y0, 0, W, H, D, 0, c, 'stone');
      [0, 1, 2, 3].forEach(function (s) { K.plates(B, s, y0 + 2.9, H - 2.9, { pw: 1.17, ph: 0.9, skip: function (u, y) { return Math.abs(u) < 0.5 && y > y0 + 3.2 && y < y0 + 4.9; } }); });
      F.box(0, y0 + 2.85, 0, W + 0.16, 0.1, D + 0.16, 0, BRONZE, 'bronze');
      K.door(B, 0, -1.2, y0, 1.2, 2.4, { wall: c, lamp: true });
      K.slit(B, 0, 1.5, y0 + 0.7, 0.55, 1.5, { lit: true });
      [0, 1, 2, 3].forEach(function (s) { K.slit(B, s, 0, y0 + 3.3, 0.5, 1.5, { off: 0.07 }); });
      [2, 3, 1].forEach(function (s) { K.slit(B, s, -1.2, y0 + 0.7, 0.5, 1.4, { dia: false }); });
      F.box(0, y0 + H, 0, W + 0.3, 0.18, D + 0.3, 0, bc, 'stone');
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
      F.box(0, 0, 0, W + 0.8, 0.5, D + 0.8, 0, bas, 'stone');
      F.frustum(0, 0.5, 0, W / 2, W / 2 - 0.3, H, Math.PI / 4 * 0, c, 'stone', 4);
      F.box(0, 0.5, 0, W - 0.2, H, D, 0, c, 'stone');
      F.box(0, 0.5 + H, 0, W + 0.4, 0.3, D + 0.4, 0, bc, 'stone');
      K.carapace(0, 0, 0.8 + H, W - 0.2, D, 3.6, { n: 4, col: verd });
      K.door(B, 0, 0, 0.5, 1.8, 3.0, { wall: c, leaf: porph, diaC: GOLD, diaK: 0.7 });
      [-3.6, 3.6].forEach(function (u) { K.slit(B, 0, u, 1.6, 0.55, 2.0, { lit: true }); });
      [2, 3].forEach(function (s) { [-2.4, 0, 2.4].forEach(function (u) { K.slit(B, s, u, 1.6, 0.5, 1.8, {}); }); });
      [-3, 0, 3].forEach(function (u) { K.slit(B, 1, u, 1.6, 0.5, 1.8, { dia: false }); });
      /* the porch: two girder pylons with bronze caps, a girder lintel, purple hangings */
      [-1.8, 1.8].forEach(function (x) { F.box(x, 0.5, D / 2 + 1.6, 0.4, 3.8, 0.4, 0, STEEL, 'metal'); F.cone(x, 4.3, D / 2 + 1.6, 0.32, 0.7, 0, BRONZE, 'bronze');
        F.box(x, 2.0, D / 2 + 1.82, 0.7, 2.2, 0.05, 0, porph, 'cloth'); });
      F.beam(-2.2, 3.9, D / 2 + 1.6, 2.2, 3.9, D / 2 + 1.6, 0.4, 0.3, STEEL, 'metal');
      F.box(0, 4.1, D / 2 + 0.8, 4.4, 0.2, 1.9, 0, shade(pan, -0.1), 'plastic');
      /* the tower: a whole tank on a basalt drum, slits, a tank-head dome, a gilt finial */
      const tx = W / 2 + 1.0, tz = -D / 2 + 0.4;
      F.cyl(tx, 0, tz, 2.4, 0.8, 0, bas, 'stone');
      const tt = K.tank(tx, tz, 0.8, 2.1, 8.6, pan, { band: 2.2 });
      F.cyl(tx, tt, tz, 2.25, 0.3, 0, bc, 'stone');
      K.tankDome(tx, tz, tt + 0.3, 2.15, 1.9, shade(pan, -0.03), { ribs: 10, gold: true, fin: 1.1 });
      [0.6, -0.6].forEach(function (a) { const r = 2.12; F.box(tx + Math.sin(a) * r, 5.2, tz + Math.cos(a) * r, 0.42, 1.6, 0.12, a, GLOW, 'glow'); F.box(tx + Math.sin(a) * (r + 0.02), 6.9, tz + Math.cos(a) * (r + 0.02), 0.5, 0.06, 0.14, a, BRONZE, 'bronze'); });
      /* the forecourt: a low basalt wall with a gate and capped pylons, lanterns of Ancient glass */
      const fz = D / 2 + 5.6;
      [-1, 1].forEach(function (k) { F.box(k * 4.0, 0, fz, 5.0, 1.4, 0.5, 0, bas, 'stone'); F.box(k * 6.3, 0, (D / 2 + fz) / 2 + 0.6, 0.5, 1.4, fz - D / 2 - 1.4, 0, bas, 'stone');
        K.pylon(k * 1.6, fz, 0, 0.42, 2.6, shade(c, -0.08)); F.cyl(k * 1.6, 3.15, fz, 0.2, 0.42, 0, GLOW, 'glow'); });
      K.dia({ x: 0, z: fz, w: 3, d: 0.5 }, 0, 0, 2.6, 0.5, 0.1, GOLD, 'gold');
      F.beam(-1.6, 2.5, fz, 1.6, 2.5, fz, 0.22, 0.22, STEEL, 'metal');
    } else {
      /* -------- Velothi domed manor: two battered tiers, the upper faced in panel courses; girder flying buttresses between the
         tiers; a great tank-head dome on a drum with a ring of lit slits; four small tank-head domes on corner pylons; purple and gold */
      const W0 = 14, D0 = 11, H0 = 4.2, W1 = 9.4, D1 = 7.4, H1 = 4.6;
      F.frustum(0, 0, 0, W0 / 2 + 0.3, W0 / 2 + 0.2, 0.5, 0, bas, 'stone', 4);
      F.box(0, 0, 0, W0, H0, D0, 0, c, 'stone');
      F.box(0, H0, 0, W0 + 0.4, 0.3, D0 + 0.4, 0, bc, 'stone');
      K.parapet({ x: 0, z: 0, w: W0 + 0.4, d: D0 + 0.4 }, H0 + 0.3, 0.6, 0.3, c);
      const B0 = { x: 0, z: 0, w: W0, d: D0 }, y1 = H0 + 0.3, B1 = { x: 0, z: 0, w: W1, d: D1 };
      F.box(0, y1, 0, W1, H1, D1, 0, shade(c, 0.04), 'stone');
      [0, 1, 2, 3].forEach(function (s) { K.plates(B1, s, y1, H1, { pw: 1.2, ph: 0.92, pat: 'band', band: porph, skip: function (u, y) { return Math.abs(Math.abs(u) - 2.4) < 0.5 && y > y1 + 1.0 && y < y1 + 3.0; } }); });
      [0, 1, 2, 3].forEach(function (s) { [-2.4, 2.4].forEach(function (u) { K.slit(B1, s, u, y1 + 1.15, 0.5, 1.7, { off: 0.07, lit: s === 0 }); }); });
      F.box(0, y1 + H1, 0, W1 + 0.4, 0.3, D1 + 0.4, 0, bc, 'stone');
      /* the flying buttresses: from piers on the lower roof to the upper tier's walls */
      [[-1, 0], [1, 0]].forEach(function (p) { [-2.4, 2.4].forEach(function (z) {
        F.frustum(p[0] * (W0 / 2 - 0.6), y1, z, 0.4, 0.3, 2.6, 0, shade(c, -0.06), 'stone', 4); F.cone(p[0] * (W0 / 2 - 0.6), y1 + 2.6, z, 0.32, 0.55, 0, BRONZE, 'bronze');
        F.beam(p[0] * (W0 / 2 - 0.6), y1 + 2.3, z, p[0] * (W1 / 2 + 0.02), y1 + 3.6, z, 0.24, 0.24, STEEL, 'metal'); }); });
      const yD = y1 + H1 + 0.3;
      F.cyl(0, yD, 0, 3.0, 1.3, 0, shade(c, 0.05), 'stone');
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; F.box(Math.sin(a) * 2.98, yD + 0.3, Math.cos(a) * 2.98, 0.34, 0.7, 0.12, a, GLOW, 'glow'); }
      K.tankDome(0, 0, yD + 1.3, 3.1, 2.8, pan, { ribs: 12, gold: true, fin: 1.4 });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { const x = p[0] * (W1 / 2 - 0.3), z = p[1] * (D1 / 2 - 0.3);
        F.frustum(x, yD - 0.3, z, 0.7, 0.6, 1.4, 0, shade(c, -0.04), 'stone', 4); K.tankDome(x, z, yD + 1.1, 0.75, 0.75, shade(pan, -0.05), { ribs: 6, fin: 0.4 }); });
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
      F.box(0, 0, 0, W + 0.3, 0.3, D + 0.3, 0, bas, 'stone');
      F.box(0, 0.3, 0, W, H, D, 0, c, 'stone');
      K.fb(B, 0, -0.6, 0.3, 4.4, 2.3, 0.3, -0.1, DOOR, 'wood');
      F.box(-0.6, 0.3, D / 2 + 0.3, 4.4, 1.0, 0.6, 0, shade(TIMBER, 0.1), 'wood');
      F.beam(-2.8, 2.65, D / 2 + 0.06, -2.8 + 0, 2.65 + 0.9, D / 2 + 2.0, 0.08, 0.08, STEEL, 'metal');
      F.beam(1.6, 2.65, D / 2 + 0.06, 1.6, 2.65 + 0.9, D / 2 + 2.0, 0.08, 0.08, STEEL, 'metal');
      F.beam(-0.6 - 2.4, 2.7, D / 2 + 0.05, -0.6 + 2.4, 2.7, D / 2 + 0.05, 0.12, 0.12, BRONZE, 'bronze');
      F.beam(-0.6, 2.7, D / 2 + 0.1, -0.6, 3.55, D / 2 + 2.05, 4.6, 0.08, pan, 'plastic');
      [-2.4, -1.2, 0, 1.2].forEach(function (x, i) { K.jar(x, D / 2 + 0.3, 1.3, 0.6 + 0.1 * (i % 2)); });
      K.door(B, 0, 2.6, 0.3, 1.0, 2.3, { wall: c, dia: false });
      [2, 3, 1].forEach(function (s) { K.slit(B, s, 0, 1.3, 0.5, 1.4, { dia: false }); });
      F.box(0, 0.3 + H, 0, W + 0.3, 0.2, D + 0.3, 0, bc, 'stone');
      K.parapet({ x: 0, z: 0, w: W + 0.3, d: D + 0.3 }, 0.5 + H, 0.65, 0.25, c);
      F.box(-1.2, 0.5 + H, -0.6, 3.6, 2.4, 3.2, 0, shade(c, 0.03), 'stone');
      K.door({ x: -1.2, z: -0.6, w: 3.6, d: 3.2 }, 0, 0, 0.5 + H, 0.9, 2.0, { wall: c, dia: false, off: 0.02 });
      [1, 2, 3].forEach(function (s) { K.slit({ x: -1.2, z: -0.6, w: 3.6, d: 3.2 }, s, 0, 1.2 + H, 0.4, 1.1, { dia: false }); });
      K.door(B, 1, 1.6, 0.3, 1.0, 2.2, { wall: c, dia: false });
      K.canopy(2.0, 0.8, 0.5 + H, 2.4, 2.6, cloth); K.crate(2.0, 0.4, 0.5 + H, 0.9); K.jar(2.6, 1.4, 0.5 + H, 0.9);
      K.ladder(W / 2 + 0.3, -1.6, 0.3, 0.5 + H, Math.PI / 2);
      const sp = K.at(B, 0, -3.3, 0.9); F.beam(-W / 2 + 0.3, 3.2, D / 2 + 0.05, sp[0], 3.2, sp[1], 0.1, 0.1, STEEL, 'metal');
      K.dia({ x: sp[0], z: sp[1], w: 0.1, d: 0.1 }, 0, 0, 2.6, 0.55, 0, BRONZE, 'bronze');
      K.crate(-3.0, D / 2 + 1.6, 0, 1); K.crate(-3.4, D / 2 + 2.4, 0, 0.9); K.jar(3.4, D / 2 + 1.4, 0, 1);
    } else {
      /* -------- smithy in a tank: a wide Ancient tank as the workshop, a forge chimney of pipe, a yard roofed with one curved hull
         plate on girder posts over the anvil and the quench barrel */
      const R = 3.0, B = { x: 0, z: 0, w: 2 * R, d: 2 * R };
      F.cyl(0, 0, 0, R + 0.3, 0.4, 0, bas, 'stone');
      const top = K.tank(0, 0, 0.4, R, 4.2, pan, { band: 1.4 });
      F.cyl(0, top, 0, R + 0.08, 0.25, 0, bc, 'stone');
      K.tankDome(0, 0, top + 0.25, R, 1.0, shade(pan, -0.05), { ribs: 8, fin: 0.3 });
      K.door(B, 0, 0, 0.4, 1.6, 2.6, { wall: c, off: -0.08 });
      [2, 3].forEach(function (s) { K.slit(B, s, 0, 1.8, 0.4, 1.4, { off: -0.1, lit: s === 2, dia: false }); });
      F.cyl(-1.4, top + 0.5, -1.2, 0.35, 3.0, 0, STEEL, 'metal'); F.cone(-1.4, top + 3.5, -1.2, 0.5, 0.6, 0, BRONZE, 'bronze');
      /* the yard: two girder frames, a curved hull plate over them (a shallow half-shell), the anvil, the quench barrel, a rack */
      const yz = R + 2.6;
      [-2.2, 2.2].forEach(function (x) { [R + 0.8, R + 4.4].forEach(function (z) { F.box(x, 0, z, 0.24, 2.8, 0.24, 0, STEEL, 'metal'); }); });
      F.ell(0, 2.8, yz, 2.7, 0.7, 2.3, 0, verd, 'plastic');
      F.box(0, 2.6, yz, 4.8, 0.2, 0.24, 0, STEEL, 'metal');
      F.box(0.4, 0, yz, 0.6, 0.6, 0.5, 0, bas, 'stone'); F.box(0.4, 0.6, yz, 0.9, 0.22, 0.35, 0, 0x2a2a2c, 'metal');
      F.cyl(-1.2, 0, yz + 0.8, 0.45, 0.8, 0, TIMBER, 'wood'); F.cyl(-1.2, 0.72, yz + 0.8, 0.4, 0.04, 0, 0x30404a, 'glass');
      F.box(1.8, 0, yz - 0.9, 1.6, 0.9, 0.6, 0, bas, 'stone'); F.cyl(1.8, 0.9, yz - 0.9, 0.35, 0.1, 0, GLOW, 'glow');
      F.box(-2.0, 0, yz - 1.2, 0.12, 1.8, 1.6, 0, TIMBER, 'wood');
      K.crate(2.6, R + 5.4, 0, 1); K.jar(-2.8, R + 5.2, 0, 1);
    }
  }

  /* ================================================================ tavern */
  function tavern(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), cloth = F.pick(SAIL), porph = F.pick(PORPH), bc = shade(c, -0.12);
    /* -------- cornerclub in two stacked tanks: a wide lower tank (the hall), a narrower upper one (the rooms), a gallery
       between them on girder brackets with a cable rail, a stair up, a lantern of Ancient glass at the door, a terrace canopy */
    const R0 = 3.6, R1 = 2.6, B0 = { x: 0, z: 0, w: 2 * R0, d: 2 * R0 }, B1 = { x: 0, z: 0, w: 2 * R1, d: 2 * R1 };
    F.cyl(0, 0, 0, R0 + 0.35, 0.5, 0, bas, 'stone');
    const t0 = K.tank(0, 0, 0.5, R0, 3.8, pan, { band: 1.9 });
    F.cyl(0, t0, 0, R0 + 1.1, 0.25, 0, shade(pan, -0.15), 'plastic');
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; F.beam(Math.sin(a) * R0, t0 - 0.9, Math.cos(a) * R0, Math.sin(a) * (R0 + 0.9), t0, Math.cos(a) * (R0 + 0.9), 0.16, 0.16, STEEL, 'metal'); }
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
    F.beam(-R0 + 0.2, 3.4, 1.4, -R0 - 1.1, 3.4, 1.4, 0.12, 0.12, STEEL, 'metal');
    K.dia({ x: -R0 - 1.1, z: 1.4, w: 0.1, d: 0.1 }, 3, 0, 2.7, 0.6, 0, BRONZE, 'bronze');
    F.box(-R0 - 1.1, 2.0, 1.4, 0.05, 0.9, 0.9, 0, porph, 'cloth');
    K.canopy(0, R0 + 2.6, 0, 4.4, 2.6, cloth);
    [-1.2, 1.2].forEach(function (x) { F.box(x, 0, R0 + 2.6, 1.6, 0.72, 0.8, 0, TIMBER, 'wood'); K.jar(x - 0.4, R0 + 2.6, 0.72, 0.5); });
  }

  /* ================================================================ warehouse */
  function warehouse(F, K) {
    const c = F.pick(STONE), bas = F.pick(BASALT), pan = F.pick(PANEL), bc = shade(c, -0.12);
    /* -------- canal store: a long stone block, its upper half faced in panel courses with stacked loading doors framed in girders,
       a girder hoist beam with a block and a cable, a flat roof with a parapet, two tanks as cisterns, crates on the quay */
    const W = 14, D = 8, H = 8.2, B = { x: 0, z: 0, w: W, d: D };
    F.box(0, 0, 0, W + 0.6, 0.4, D + 0.6, 0, bas, 'stone');
    F.box(0, 0.4, 0, W, H, D, 0, c, 'stone');
    [0, 1, 2, 3].forEach(function (s) { K.plates(B, s, 4.4, H - 4.0, { pw: 1.27, ph: 0.95, skip: function (u, y) { return s === 0 && Math.abs(u) < 1.2; } }); });
    F.box(0, 4.35, 0, W + 0.16, 0.1, D + 0.16, 0, BRONZE, 'bronze');
    [0.4, 3.0, 5.6].forEach(function (y, i) { K.fb(B, 0, 0, y, 1.9, 2.2, 0.2, -0.05, i ? F.pick(PANEL) : TIMBERS[0], i ? 'plastic' : 'wood');
      [-1, 1].forEach(function (k) { K.fb(B, 0, k * 1.08, y, 0.22, 2.3, 0.3, 0.06, STEEL, 'metal'); }); K.fb(B, 0, 0, y + 2.25, 2.4, 0.22, 0.3, 0.06, STEEL, 'metal'); });
    F.beam(0, H + 0.1, D / 2 - 0.2, 0, H + 0.1, D / 2 + 2.0, 0.34, 0.26, STEEL, 'metal');
    F.box(0, H - 0.25, D / 2 + 1.8, 0.4, 0.35, 0.4, 0, BRONZE, 'bronze');
    F.rod(0, H - 0.25, D / 2 + 1.8, 0, 2.2, D / 2 + 1.8, 0.015, CABLE, 'metal'); K.crate(0, D / 2 + 1.8, 1.4, 1);
    [-4.6, 4.6].forEach(function (u) { K.door(B, 0, u, 0.4, 1.3, 2.6, { wall: c, dia: Math.abs(u) > 4 && u < 0 }); K.slit(B, 0, u, 5.6, 0.5, 1.6, { off: 0.07, dia: false }); });
    [2, 3].forEach(function (s) { [-1.8, 1.8].forEach(function (u) { K.slit(B, s, u, 1.6, 0.5, 1.6, { dia: false }); K.slit(B, s, u, 5.6, 0.5, 1.6, { off: 0.07, dia: false }); }); });
    [-4, 0, 4].forEach(function (u) { K.slit(B, 1, u, 5.6, 0.5, 1.6, { off: 0.07, dia: false }); });
    F.box(0, H + 0.4, 0, W + 0.3, 0.2, D + 0.3, 0, bc, 'stone');
    K.parapet({ x: 0, z: 0, w: W + 0.3, d: D + 0.3 }, H + 0.6, 0.7, 0.25, c);
    [-W / 2 - 1.8, W / 2 + 1.8].forEach(function (x) { F.cyl(x, 0, -1, 1.6, 0.4, 0, bas, 'stone'); const t = K.tank(x, -1, 0.4, 1.4, 4.0, pan, { band: 1.3 }); K.tankDome(x, -1, t, 1.42, 0.6, shade(pan, -0.05), { ribs: 6, fin: 0.25 });
      F.rod(x, 3.8, -1 + 0.5, x > 0 ? W / 2 : -W / 2, 6.6, -1 + 0.5, 0.06, STEEL, 'metal'); });
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
      F.box(0, 0, 0, 2 * R + 1.0, Y, L + 1.0, 0, bas, 'stone');
      F.rod(0, Y + R, -L / 2, 0, Y + R, L / 2, R, pan, 'plastic');
      for (let k = 0; k <= 4; k++) F.rod(0, Y + R, -L / 2 + 0.3 + k * (L - 0.6) / 4 - 0.06, 0, Y + R, -L / 2 + 0.3 + k * (L - 0.6) / 4 + 0.06, R + 0.05, STEEL, 'metal');
      F.ell(0, Y + R, -L / 2, R, R, 0.5, 0, shade(pan, -0.05), 'plastic');
      F.box(0, Y, L / 2, 2 * R + 0.3, 2 * R, 0.5, 0, c, 'stone');
      F.box(0, Y + 2 * R, L / 2, 2 * R + 0.5, 0.25, 0.7, 0, bc, 'stone');
      const B = { x: 0, z: L / 2, w: 2 * R + 0.3, d: 0.5 };
      K.door(B, 0, 0, Y, 1.0, 2.0, { wall: c, leaf: porph, diaC: GOLD, diaK: 0.45 });
      [-1, 1].forEach(function (k) { K.pylon(k * (R + 0.15), L / 2 + 0.15, Y + 2 * R + 0.25, 0.25, 0.9, shade(c, -0.05)); });
      K.flight(0, L / 2 + 2.2, 0, L / 2 + 0.6, 0, Y, 2.2, shade(c, -0.1));
      [-1.4, 1.4].forEach(function (x) { F.box(x, 0, L / 2 + 1.4, 0.7, Y, 0.9, 0, bc, 'stone'); K.jar(x, L / 2 + 1.4, Y, 0.9); F.cyl(x + 0.25, Y, L / 2 + 1.7, 0.05, 0.22, 0, GLOW, 'glow'); });
    } else {
      /* -------- pylon tomb: a stepped Velothi block faced in panel courses with a porphyry band, the gold diamond on its door,
         capped pylons at its corners, a lantern of Ancient glass on its top */
      const W = 4.4, D = 4.4, H = 3.6, B = { x: 0, z: 0, w: W, d: D };
      F.box(0, 0, 0, W + 1.6, 0.5, D + 1.6, 0, bas, 'stone');
      F.box(0, 0.5, 0, W + 0.8, 0.4, D + 0.8, 0, bc, 'stone');
      F.frustum(0, 0.9, 0, W / 2, W / 2 - 0.25, H, 0, c, 'stone', 4);
      [0, 1, 2, 3].forEach(function (s) { K.plates({ x: 0, z: 0, w: W - 0.25, d: D - 0.25 }, s, 1.8, H - 1.0, { pw: 1.03, ph: 0.85, pat: 'band', band: porph, skip: function (u, y) { return s === 0 && Math.abs(u) < 0.7 && y < 3.3; } }); });
      K.door({ x: 0, z: 0, w: W - 0.2, d: D - 0.2 }, 0, 0, 0.9, 0.9, 2.0, { wall: c, leaf: porph, diaC: GOLD, diaK: 0.4 });
      F.box(0, 0.9 + H, 0, W + 0.1, 0.3, D + 0.1, 0, bc, 'stone');
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { K.pylon(p[0] * (W / 2 - 0.1), p[1] * (D / 2 - 0.1), 1.2 + H, 0.3, 1.0, shade(c, -0.05)); });
      F.cyl(0, 1.2 + H, 0, 0.7, 0.3, 0, bc, 'stone'); F.cyl(0, 1.5 + H, 0, 0.5, 0.9, 0, GLASSC, 'glass'); F.cyl(0, 1.6 + H, 0, 0.25, 0.6, 0, GLOW, 'glow');
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
      T.forEach(function (t, i) { const B = { x: 0, z: 0, w: t[0], d: t[0] }; F.box(0, y, 0, t[0], t[1], t[0], 0, i % 2 ? shade(c, 0.04) : c, 'stone');
        [0, 1, 2, 3].forEach(function (s) { K.plates(B, s, y, t[1], { pw: 1.0, ph: t[1], skip: function (u) { return s === 0 && Math.abs(u) < 1.0; } }); });
        F.box(0, y + t[1], 0, t[0] + 0.16, 0.06, t[0] + 0.16, 0, BRONZE, 'bronze'); F.box(0, y + t[1], 0, t[0] - 0.4, 0.1, t[0] - 0.4, 0, bc, 'stone'); y += t[1] + 0.1; });
      K.flight(0, 4.5 + 1.8, 0, 2.5 - 0.2, 0, y, 1.8, shade(c, -0.1));
      F.box(0, y, -0.8, 2.0, 0.9, 1.0, 0, porph, 'stone'); F.cyl(0, y + 0.9, -0.8, 0.3, 0.12, 0, GLOW, 'glow');
      F.box(0, y, -1.8, 0.4, 2.6, 0.4, 0, STEEL, 'metal');
      F.rod(0, y + 3.4, -1.75, 0, y + 3.4, -1.6, 1.3, GOLD, 'paint');   /* the dish, gilt: painted gold reads bright where the metal look goes dark */
      F.rod(0, y + 3.4, -1.85, 0, y + 3.4, -1.75, 1.42, BRONZE, 'bronze');
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; F.beam(Math.sin(a) * 1.5, y + 3.4 + Math.cos(a) * 1.5, -1.7, Math.sin(a) * 2.2, y + 3.4 + Math.cos(a) * 2.2, -1.7, 0.12, 0.05, GOLD, 'paint'); }
      [[-1, 1], [1, 1]].forEach(function (p) { K.pylon(p[0] * 4.2, p[1] * 4.2, 0, 0.35, 2.2, shade(c, -0.06)); F.cyl(p[0] * 4.2, 3.1, p[1] * 4.2, 0.15, 0.35, 0, GLOW, 'glow'); });
    } else {
      /* -------- wayside pylon shrine: a girder pylon on a basalt step, capped by a tank-head cone, a gold sun disc, offerings */
      F.box(0, 0, 0, 3.0, 0.4, 3.0, 0, bas, 'stone'); F.box(0, 0.4, 0, 2.2, 0.3, 2.2, 0, bc, 'stone');
      [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].forEach(function (p) { F.beam(p[0], 0.7, p[1], p[0] * 0.5, 4.2, p[1] * 0.5, 0.16, 0.16, STEEL, 'metal'); });
      [1.6, 2.9].forEach(function (y) { const h = 0.5 - 0.25 * (y - 0.7) / 3.5; F.box(0, y, 0, 2 * h + 0.2, 0.1, 2 * h + 0.2, 0, BRONZE, 'bronze'); });
      F.box(0, 4.2, 0, 0.8, 0.15, 0.8, 0, STEEL, 'metal');
      F.cone(0, 4.35, 0, 0.6, 1.3, 0, pan, 'plastic'); F.ball(0, 5.7, 0, 0.14, GOLD, 'gold');
      F.rod(0, 3.4, 0.3, 0, 3.4, 0.4, 0.6, GOLD, 'paint');
      F.box(0, 0.7, 0.75, 1.0, 0.5, 0.5, 0, porph, 'stone'); F.cyl(-0.25, 1.2, 0.75, 0.05, 0.2, 0, GLOW, 'glow'); F.cyl(0.25, 1.2, 0.75, 0.05, 0.2, 0, GLOW, 'glow');
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
      F.frustum(0, 0, 0, r0 + 0.4, r0 + 0.3, 0.7, 0, bas, 'stone', 4);
      F.frustum(0, 0, 0, r0, r1, TH, 0, c, 'stone', 4);
      [0, 1, 2, 3].forEach(function (s) { K.plates(TB(10), s, 7.0, 5.6, { pw: 1.05, ph: 0.93, pat: 'band', band: porph, skip: function (u, y) { return Math.abs(u) < 0.45 && y > 8.2 && y < 10.1; } }); });
      [0, 1, 2, 3].forEach(function (s) { K.slit(TB(9), s, 0, 8.3, 0.45, 1.7, { off: 0.06 }); K.slit(TB(4), s, 0, 4.0, 0.4, 1.4, { dia: s !== 0, off: -0.02 }); });
      F.frustum(0, TH, 0, r1 + 0.4, r1 + 0.4, 0.4, 0, bc, 'stone', 4);
      const yT = TH + 0.4;
      [0, 1, 2, 3].forEach(function (s) { [-1.5, 0, 1.5].forEach(function (u) { const B = { x: 0, z: 0, w: 2 * r1 + 0.6, d: 2 * r1 + 0.6 }; K.fb(B, s, u, yT, 0.7, 0.9, 0.35, -0.18, c, 'stone'); }); });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { K.pylon(p[0] * (r1 + 0.15), p[1] * (r1 + 0.15), yT, 0.4, 1.6, shade(c, -0.05)); });
      F.box(0, yT, 0, 2.6, 0.2, 2.6, 0, STEEL, 'metal');
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.box(p[0] * 1.15, yT + 0.2, p[1] * 1.15, 0.16, 2.0, 0.16, 0, BRONZE, 'bronze'); });
      F.box(0, yT + 0.2, 0, 2.2, 2.0, 2.2, 0, GLASSC, 'glass'); F.box(0, yT + 0.5, 0, 1.0, 1.2, 1.0, 0, GLOW, 'glow');
      F.pyrRoof(0, yT + 2.2, 0, 2.8, 1.4, 2.8, 0, F.pick(VERD), 'plastic'); F.ball(0, yT + 3.7, 0, 0.18, GOLD, 'gold');
      K.door(TB(1), 0, 0, 0.7, 1.4, 2.7, { wall: c, leaf: porph, diaC: GOLD, diaK: 0.55, lamp: true });
      K.banner(TB(7), 0, 0, 6.8, 2.2, porph);
      [2, 3].forEach(function (s) { const x = s === 2 ? r0 + 2.4 : -r0 - 2.4; K.buttress(x, 0, (s === 2 ? 1 : -1) * (tf(6.5) + 0.05), 0, 4.8, 6.5, shade(c, -0.06)); });
    } else {
      /* -------- canton gate: two battered pylons, a girder lintel, the great diamond over the gate in gold, gate leaves of Ancient
         panels, a walk over it behind a cable rail, capped pylons */
      const PW = 3.4, PD = 4.0, PH = 7.4, GW = 4.2;
      [-1, 1].forEach(function (k) { const x = k * (GW / 2 + PW / 2), B = { x: x, z: 0, w: PW, d: PD };
        F.frustum(x, 0, 0, PW / 2 + 0.25, PW / 2 + 0.15, 0.6, 0, bas, 'stone', 4);
        F.frustum(x, 0, 0, PW / 2, PW / 2 - 0.3, PH, 0, c, 'stone', 4);
        K.plates({ x: x, z: 0, w: PW - 0.6, d: PD - 0.6 }, 0, 4.2, 3.0, { pw: 0.93, ph: 1.0, pat: 'band', band: porph });
        K.slit({ x: x, z: 0, w: PW - 0.3, d: PD - 0.3 }, 0, 0, 2.0, 0.4, 1.4, { dia: false });
        F.box(x, PH, 0, PW - 0.2, 0.3, PD - 0.4, 0, bc, 'stone');
        K.pylon(x, 0, PH + 0.3, 0.55, 1.8, shade(c, -0.05)); });
      F.beam(-GW / 2 - 0.4, 5.0, PD / 2 - 0.6, GW / 2 + 0.4, 5.0, PD / 2 - 0.6, 0.6, 0.4, STEEL, 'metal');
      F.box(0, 5.3, 0, GW + 0.6, 0.4, PD - 1.0, 0, bc, 'stone');
      F.box(0, 5.7, 0, GW + 0.6, 1.8, 0.4, 0, c, 'stone');
      K.dia({ x: 0, z: 0, w: GW, d: 0.4 }, 0, 0, 6.6, 1.0, 0.02, GOLD, 'paint', 0.12);
      [-1, 1].forEach(function (k) { F.box(k * GW / 4, 0, 0.1, GW / 2 - 0.06, 4.6, 0.16, 0, F.pick(PANEL), 'plastic');
        [1.0, 2.3, 3.6].forEach(function (y) { F.box(k * GW / 4, y, 0.2, GW / 2 - 0.1, 0.12, 0.06, 0, STEEL, 'metal'); }); });
      K.rail(-GW / 2 - 0.2, -PD / 2 + 0.7, GW / 2 + 0.2, -PD / 2 + 0.7, 5.7);
      F.box(0, 0, 0, GW, 0.08, PD, 0, shade(bas, 0.1), 'stone');
    }
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
      'An Ordinator watchtower faced in panel courses above the stone, girder buttresses, a lantern room of Ancient glass; a canton gate with the gold diamond over leaves of Ancient panel.']
  ];
  /* measured sizes per variant (shoot.py --audit), including stairs, canopies, yards and props */
  const DIMS = {"voth_scrap_house_poor":[{w:8.1,d:5.7,h:5.4},{w:6.6,d:5.4,h:4.2},{w:11.0,d:5.3,h:5.9}],"voth_scrap_house":[{w:11.6,d:10.7,h:15.6},{w:10.2,d:12.2,h:10.0},{w:9.7,d:7.3,h:10.2}],"voth_scrap_manor":[{w:15.4,d:16.4,h:13.0},{w:15.7,d:14.6,h:15.2}],"voth_scrap_shop":[{w:7.8,d:9.6,h:6.5},{w:6.6,d:12.1,h:8.7}],"voth_scrap_tavern":[{w:10.5,d:12.3,h:9.9}],"voth_scrap_warehouse":[{w:20.8,d:10.6,h:9.5}],"voth_scrap_tomb":[{w:5.4,d:9.7,h:7.0},{w:6.0,d:6.0,h:7.1}],"voth_scrap_shrine":[{w:9.2,d:10.9,h:8.6},{w:3.0,d:3.0,h:5.8}],"voth_scrap_watch":[{w:11.7,d:7.0,h:17.3},{w:11.5,d:4.0,h:10.5}]};
  E.forEach(function (e) {
    const V = DIMS[e[0]], mx = function (k) { return Math.max.apply(null, V.map(function (q) { return q[k]; })); };
    ASSET({
      key: e[0], name: e[1], culture: 'voth', family: e[2], source: 'voth-scrap', districts: e[3], wealth: e[4],
      blurb: e[7], w: mx('w'), d: mx('d'), h: mx('h'), variants: e[5], variantDims: V,
      build: function (F) { e[6](F, kit(F)); }
    });
  });
})();
