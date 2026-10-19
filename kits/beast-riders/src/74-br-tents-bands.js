// prefix: brt
/* ======================================================================
   The Beast Riders' tents (4): the grounds of the three bands that keep their beasts in their own way (owner,
   2026-10-19; settlements/pinnacle-rock/PLAN.md: "a camp and a smaller pasture each on the floor"), on the tent kit:
     the Dragonfly band   br_tent_pond_nets      a netted breeding pond: a frame of nets over a pond's reed margin
                          br_tent_net_house      the net-house: a hide roof on a ring of poles walled with nets
     the Spider band      br_tent_spider_grove   a fenced grove of standing trees: climbing frames, silk lines, webs
                          br_tent_silk_house     a silk house: a dome sewn of silk sheets, the silk looms inside
                          br_tent_spinning_shed  the spinning shed: an open shed, rope-walk wheels, looms, silk drying
     the Mammoth band     br_tent_mammoth_paddock  a rail-fenced paddock with a byre of hides on log posts
   The grove's trees are the catalog's generic tree (F.tree); their places are hashed (brtU), their limbs are the tree
   helper's own (it draws from the frame's stream).
   ====================================================================== */

/* a pond's outline: radius at angle a, an ellipse rx by rz with two hashed swells, so no two ponds are alike */
function brtPondR(F, rx, rz) {
  const p1 = brtU(F, 101) * 6.28, p2 = brtU(F, 102) * 6.28;
  return function (a) { const e = 1 / Math.sqrt(Math.pow(Math.cos(a) / rx, 2) + Math.pow(Math.sin(a) / rz, 2)); return e * (1 + 0.08 * Math.sin(2 * a + p1) + 0.05 * Math.sin(3 * a + p2)); };
}
/* a net panel: a grid of thin cord between four corners (bilinear), nu by nv meshes */
function brtNet(B, p00, p10, p01, p11, nu, nv) {
  const L = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
  for (let i = 0; i <= nu; i++) { const t = i / nu, a = L(p00, p10, t), b = L(p01, p11, t); B.stick(BRT.net, 'rope', [a[0], a[1], a[2], b[0], b[1], b[2], 0.009]); }
  for (let j = 0; j <= nv; j++) { const t = j / nv, a = L(p00, p01, t), b = L(p10, p11, t); B.stick(BRT.net, 'rope', [a[0], a[1], a[2], b[0], b[1], b[2], 0.009]); }
}

ASSET({
  key: 'br_tent_pond_nets', name: 'Netted breeding pond (Dragonfly)', culture: 'beast-rider', family: 'farm',
  types: ['farm'], districts: ['camp', 'pasture'], wealth: [0, 1], tags: { style: 'net-frame', role: 'breeding', tribe: 'dragonfly' },
  w: 23, d: 19.4, h: 4.6, variants: 2, variantNames: ['a round pond', 'a long pond'],
  variantDims: [{ w: 20.2, d: 19, h: 4.6 }, { w: 23, d: 19.4, h: 4.6 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), rx = v ? 11 : 7.8, rz = v ? 7.4 : 7.8, Rp = brtPondR(F, rx * 0.82, rz * 0.82);
    /* the basin: a rim of mud, the water in it */
    brtSurf(F, 48, 2, function (u, w) { const a = u * Math.PI * 2, r = Rp(a) * (1 + 0.16 * w); return [Math.cos(a) * r, 0.03, Math.sin(a) * r]; }, BRT.earth, 'yard/stone');
    brtSurf(F, 48, 3, function (u, w) { const a = u * Math.PI * 2, r = Rp(a) * w * 1.01; return [Math.cos(a) * r, 0.06, Math.sin(a) * r]; }, BRT.water, 'glass');
    /* the reed margin: clumps round the edge, in and out of the water */
    const nC = Math.round((rx + rz) * 3.2);
    for (let k = 0; k < nC; k++) {
      const a = (k + brtU(F, 103, k) * 0.7) / nC * Math.PI * 2, r0 = Rp(a) * (0.9 + brtU(F, 104, k) * 0.2), cx = Math.cos(a) * r0, cz = Math.sin(a) * r0;
      for (let i = 0; i < 7; i++) { const U = function (j) { return brtU(F, 105 + j, k, i); }, h = 1.2 + U(0) * 1.4, lx = (U(1) - 0.5) * 0.5, lz = (U(2) - 0.5) * 0.5;
        B.stick(BRT.reed[(k + i) % 3], 'reed', [cx + lx * 0.3, 0.02, cz + lz * 0.3, cx + lx, h, cz + lz, 0.02, 0.006]); }
    }
    /* the frame over the margin: outer posts on the bank, inner posts in the shallows, rails, a canopy of nets between,
       net walls hanging from the outer ring */
    const n = v ? 14 : 12, Ro = function (a) { return Rp(a) * 1.28; }, Ri = function (a) { return Rp(a) * 0.72; }, yo = 3.3, yi = 3.8;
    const po = [], pi = [];
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; po.push([Math.cos(a) * Ro(a), Math.sin(a) * Ro(a)]); pi.push([Math.cos(a) * Ri(a), Math.sin(a) * Ri(a)]); }
    for (let k = 0; k < n; k++) {
      const o = po[k], i = pi[k], o2 = po[(k + 1) % n], i2 = pi[(k + 1) % n];
      B.stick(BRT.poleDark, BRT_LASH, [o[0], -0.2, o[1], o[0], yo + 0.15, o[1], 0.08, 0.06]); B.stick(BRT.poleDark, BRT_LASH, [i[0], -0.4, i[1], i[0], yi + 0.15, i[1], 0.08, 0.06]);
      B.stick(BRT.pole, BRT_LASH, [o[0], yo, o[1], i[0], yi, i[1], 0.05]);
      B.stick(BRT.pole, BRT_LASH, [o[0], yo, o[1], o2[0], yo, o2[1], 0.05]); B.stick(BRT.pole, BRT_LASH, [i[0], yi, i[1], i2[0], yi, i2[1], 0.05]);
      brtNet(B, [o[0], yo, o[1]], [o2[0], yo, o2[1]], [i[0], yi, i[1]], [i2[0], yi, i2[1]], 8, 6);
      if (k !== Math.round(n / 4)) brtNet(B, [o[0], yo, o[1]], [o2[0], yo, o2[1]], [o[0], 0.5, o[1]], [o2[0], 0.5, o2[1]], 8, 5);
      if (k % 3 === 0) brtGuy(B, [o[0], yo, o[1]], o[0] * 1.12, o[1] * 1.12);
    }
    /* the boardwalk in, under the open bay (the front), out over the shallows */
    const kf = Math.round(n / 4), a = kf / n * Math.PI * 2 + Math.PI / n, r0 = Ro(a) + 1.0, r1 = Ri(a) - 0.6;
    for (let s = 0; s <= 10; s++) { const r = r0 + (r1 - r0) * s / 10, x = Math.cos(a) * r, z = Math.sin(a) * r;
      F.box(x, 0.32, z, 0.9, 0.06, 1.3, Math.PI / 2 - a, BRT.plank, 'wood');
      if (s % 3 === 0) for (const d of [-0.5, 0.5]) B.stick(BRT.poleDark, BRT_LASH, [x - Math.sin(a) * d, -0.3, z + Math.cos(a) * d, x - Math.sin(a) * d, 0.34, z + Math.cos(a) * d, 0.05]); }
    F.furn('br_h_water_butt', Math.cos(a) * (r0 + 1.6) + 1.4, 0, Math.sin(a) * (r0 + 1.6), 0, { v: 0 });
    B.flush();
  }
});

ASSET({
  key: 'br_tent_net_house', name: 'Net-house (Dragonfly)', culture: 'beast-rider', family: 'farm',
  types: ['farm', 'industry'], districts: ['camp', 'pasture'], wealth: [0.2, 0.7], tags: { style: 'net-frame', role: 'breeding', tribe: 'dragonfly' },
  w: 10.4, d: 8, h: 6.2, variants: 2, variantNames: ['the nymph tubs under a hide roof', 'the larger, three tubs and the mender\'s bench'],
  variantDims: [{ w: 9, d: 6.4, h: 5.6 }, { w: 10.4, d: 8, h: 6.2 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), R = v ? 4.2 : 3.5, H = v ? 4.6 : 4.0, base = 2.0, F0 = BRT_FRONT;
    brtDome(F, B, { R: R, H: H, base: base, gores: v ? 12 : 10, courses: 3, old: 0.3, skirt: false,
      crown: { kind: 'ring', mast: 0.9, banner: BRT.verd }, sigils: [{ a: Math.PI, y: base + 1.0, s: 0.9, kind: 'spiral' }] });
    const S = brtDomeSurf(0, 0, R, H, 0.16 * R), rw = S.rAt(base) - 0.02, n = v ? 12 : 10;
    for (let k = 0; k < n; k++) {
      const a = F0 + Math.PI / n + k * Math.PI * 2 / n, a2 = a + Math.PI * 2 / n, p = brtAt(rw, a), q = brtAt(rw, a2);
      B.stick(BRT.poleDark, BRT_LASH, [p[0], -0.1, p[1], p[0], base + 0.1, p[1], 0.07]);
      B.stick(BRT.pole, BRT_LASH, [p[0], base - 0.05, p[1], q[0], base - 0.05, q[1], 0.045]);
      if (k === n - 1) continue;   /* the door bay, open */
      brtNet(B, [p[0], base - 0.05, p[1]], [q[0], base - 0.05, q[1]], [p[0], 0.05, p[1]], [q[0], 0.05, q[1]], 7, 6);
    }
    F.cyl(0, 0, 0, rw - 0.05, 0.04, 0, BRT.earth, 'yard/stone');
    const tubs = v ? 3 : 2;
    for (let k = 0; k < tubs; k++) brtIn(F, 'br_trade_vat', rw - 1.0, F0 + Math.PI * (0.7 + k * 0.3), 0, 0, {});
    brtIn(F, 'br_common_workbench', rw - 0.4, F0 + Math.PI * (v ? 1.72 : 1.6), 0, 0, {});
    brtIn(F, 'br_trade_bin', rw - 0.4, F0 + Math.PI * 0.42, 0, 0, {});
    F.furn('br_h_hanging_gourds', 0.3, H - 0.4 - 1.22, 0, 0.5, { v: 0 });
    F.furn('br_h_water_butt', rw + 1.2, 0, 1.6, 0, { v: 1 });
    B.flush();
  }
});

ASSET({
  key: 'br_tent_spider_grove', name: 'Fenced spider grove (Spider)', culture: 'beast-rider', family: 'farm',
  types: ['farm'], districts: ['camp', 'pasture'], wealth: [0, 1], tags: { style: 'grove', role: 'breeding', tribe: 'spider' },
  w: 37, d: 34, h: 15.4, variants: 2, variantNames: ['five trees, two climbing frames', 'seven trees, three climbing frames'],
  variantDims: [{ w: 29, d: 29, h: 14.4 }, { w: 37, d: 34, h: 15.4 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), r = v ? 16 : 12.6, P = brtRing(v ? 11 : 9, r, r, Math.PI / 2 + Math.PI / (v ? 11 : 9));
    F.cyl(0, 0, 0, r - 0.3, 0.03, 0, BRT.litter, 'straw/cloth');
    const fe = brtFrontEdge(P);
    for (let e = 0; e < P.length; e++) {
      const a = P[e], b = P[(e + 1) % P.length];
      if (e !== fe) { brtRail(F, B, a[0], a[1], b[0], b[1], 1.5, 3); continue; }
      const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
      brtRail(F, B, a[0], a[1], mx - ux * 1.8, mz - uz * 1.8, 1.5, 3); brtRail(F, B, mx + ux * 1.8, mz + uz * 1.8, b[0], b[1], 1.5, 3);
      for (const s of [-1, 1]) brmPost(F, mx + ux * 1.8 * s, 0, mz + uz * 1.8 * s, 2.6, 0.26, BRM.red, BRM.gilt);
    }
    /* the trees, hashed into the ring, the climbing frames against some, silk lines and orb webs between */
    const nT = v ? 7 : 5, T = [];
    for (let k = 0; k < nT; k++) { const a = (k + brtU(F, 111, k) * 0.6) / nT * Math.PI * 2, rr = r * (0.3 + brtU(F, 112, k) * 0.42); T.push([Math.cos(a) * rr, Math.sin(a) * rr, 9.5 + brtU(F, 113, k) * (v ? 4.5 : 3.5)]); }
    T.forEach(function (t) { F.tree(t[0], t[1], 'olive', t[2], 0); });
    for (let k = 0; k < (v ? 3 : 2); k++) {
      const t = T[k], a = Math.atan2(-t[1], -t[0]), fx = t[0] + Math.cos(a) * 2.4, fz = t[1] + Math.sin(a) * 2.4, tx = -Math.sin(a), tz = Math.cos(a), top = 6.2;
      for (const s of [-0.4, 0.4]) B.stick(BRT.pole, BRT_LASH, [fx + tx * s, -0.1, fz + tz * s, t[0] + Math.cos(a) * 0.45 + tx * s, top, t[1] + Math.sin(a) * 0.45 + tz * s, 0.055]);
      for (let i = 1; i < 18; i++) { const q = i / 18, x = fx + (t[0] + Math.cos(a) * 0.45 - fx) * q, z = fz + (t[1] + Math.sin(a) * 0.45 - fz) * q;
        B.stick(BRT.pole, BRT_LASH, [x - tx * 0.42, top * q, z - tz * 0.42, x + tx * 0.42, top * q, z + tz * 0.42, 0.025]); }
    }
    for (let k = 0; k < nT; k++) {
      const p = T[k], q = T[(k + 1) % nT];
      for (const y of [3.2, 5.6]) brtRope(B, [p[0], y + brtU(F, 114, k) * 1.2, p[1]], [q[0], y + 0.5, q[1]], 0.2, 0.01, BRT.silk);
      if (k % 2 === 0) {   /* an orb web hung between this trunk and the next */
        const mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, my = 4.4, wr = Math.min(1.6, Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.3), ux = (q[0] - p[0]), uz = (q[1] - p[1]), ul = Math.hypot(ux, uz) || 1;
        const at = function (ang, rr) { return [mx + ux / ul * Math.cos(ang) * rr, my + Math.sin(ang) * rr, mz + uz / ul * Math.cos(ang) * rr]; };
        for (let i = 0; i < 10; i++) { const e = at(i / 10 * Math.PI * 2, wr); B.stick(BRT.silk, 'cloth', [mx, my, mz, e[0], e[1], e[2], 0.008]); }
        for (const rr of [0.4, 0.8, 1.2]) if (rr < wr) { const pts = []; for (let i = 0; i <= 10; i++) pts.push(at(i / 10 * Math.PI * 2, rr)); B.line(BRT.silk, 'cloth', pts, 0.006); }
        brtRope(B, at(0, wr), [p[0], my, p[1]], 0, 0.008, BRT.silk); brtRope(B, at(Math.PI, wr), [q[0], my, q[1]], 0, 0.008, BRT.silk);
      }
    }
    F.furn('br_h_water_butt', 3.2, 0, -2.6, 0.4, { v: 0 });
    B.flush();
  }
});

ASSET({
  key: 'br_tent_silk_house', name: 'Silk house (Spider)', culture: 'beast-rider', family: 'housing',
  types: ['dwelling-single', 'industry'], districts: ['camp'], wealth: [0.3, 0.8], tags: { style: 'silk-dome', role: 'dwelling', job: 'weaving', tribe: 'spider' },
  w: 17.2, d: 13.8, h: 7.2, variants: 2, variantNames: ['a weaver household: the silk loom, beds', 'the larger: two looms, bolts of silk'],
  variantDims: [{ w: 14.6, d: 11.4, h: 6.6 }, { w: 17.2, d: 13.8, h: 7.2 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), R = v ? 4.0 : 3.3, H = v ? 4.9 : 4.3, F0 = BRT_FRONT;
    const silk = [0xeceee8, 0xe0e2da, 0xe8e4d6, 0xd8dcd4, 0xf0eee4].map(brmLin);
    const S = brtDome(F, B, { R: R, H: H, gores: 12, courses: 4, hides: silk, old: 0, door: { w: 1.2, h: 1.7 },
      skirt: { col: brmLin(0xc8c4b4), fam: BRT_HIDE, spots: false, rag: 0.32 }, crown: { kind: 'star', mast: 1.3, sign: 'banner', banner: BRT.verd },
      guys: 10, floor: BRT.straw, sigils: [{ a: 1.2, y: 2.2, s: 1.1, kind: 'spiral', col: BRT.verd }] });
    /* silk cords over the dome from the crown, a web's spiral round it */
    for (let k = 0; k < 12; k++) { const a = F0 + k * Math.PI / 6 + 0.13, pts = []; for (let i = 0; i <= 10; i++) pts.push(S.pt(a, 0.08 + i * 0.092, 0.05)); B.line(BRT.silk, 'cloth', pts, 0.012); }
    for (const t of [0.45, 0.7]) { const pts = []; for (let i = 0; i <= 48; i++) pts.push(S.pt(F0 + i / 48 * Math.PI * 2, t, 0.055)); B.line(BRT.silk, 'cloth', pts, 0.01); }
    brtIn(F, 'br_loom_frame', R - 1.15, F0 + Math.PI, 0, 0, {});
    if (v) brtIn(F, 'br_loom_frame', R - 1.2, F0 + Math.PI * 1.5, 0, 0, {});
    brtIn(F, 'br_common_bed', R - 1.1, F0 + Math.PI * (v ? 0.62 : 0.6), 0, 0, { v: 1 });
    brtIn(F, 'br_h_cloth_bolts', R - 1.2, F0 + Math.PI * 1.38 + (v ? 0.42 : 0), 0, 0, {});
    brtIn(F, 'br_common_chest', R - 0.7, F0 + Math.PI * 0.3, 0, 0, { v: 1 });
    F.furn('br_common_fire', 0.5, 0.04, 0.6, 0, {});
    B.flush();
  }
});

ASSET({
  key: 'br_tent_spinning_shed', name: 'Spinning shed (Spider)', culture: 'beast-rider', family: 'industrial',
  types: ['industry'], districts: ['camp'], wealth: [0.2, 0.7], tags: { style: 'hide-lean-to', job: 'weaving', role: 'silk', tribe: 'spider' },
  w: 13.8, d: 9.8, h: 4.1, variants: 2, variantNames: ['two wheels and a loom, silk drying', 'three wheels, two looms'],
  variantDims: [{ w: 9.8, d: 9.8, h: 4.1 }, { w: 13.8, d: 9.8, h: 4.1 }],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), hw = v ? 6.0 : 4.2;
    /* a ridge shed: two lean-tos back to back, open on every side */
    brtLeanTo(F, B, -hw, hw, 2.6, 0, 2.1, 3.5, BRT.hideOld[2]); brtLeanTo(F, B, -hw, hw, -2.6, 0, 2.1, 3.5, BRT.hide[1]);
    F.box(0, 0, 0, 2 * hw + 0.4, 0.04, 5.6, 0, BRT.earth, 'yard/stone');
    for (const x of [-hw, hw]) for (const s of [-1, 1]) brtGuy(B, [x, 2.0, s * 2.6], x * 1.12, s * 4.6);
    const nW = v ? 3 : 2;
    for (let k = 0; k < nW; k++) F.furn('br_h_rope_wheel', -hw + 1.4 + k * 2.4, 0.04, -1.3, 0, {});
    F.furn('br_common_loom', hw - 1.6, 0.04, -1.9, 0, {}); if (v) F.furn('br_loom_frame', hw - 1.8, 0.04, 1.0, Math.PI, {});
    F.furn('br_h_cloth_bolts', -1.0, 0.04, 1.2, 0, {}); F.furn('br_common_stool', 0.6, 0.04, -0.4, Math.PI, {});
    /* silk drying: lines between posts beyond the shed, skeins hanging */
    for (let l = 0; l < 2; l++) { const z = 3.9 + l * 0.9, x0 = -hw + 0.6, x1 = hw - 0.6;
      for (const x of [x0, x1]) B.stick(BRT.poleDark, BRT_LASH, [x, -0.1, z, x, 2.05, z, 0.05]);
      brtRope(B, [x0, 2.0, z], [x1, 2.0, z], 0.15, 0.01);
      const nS = Math.round((x1 - x0) / 0.55);
      for (let i = 1; i < nS; i++) { const x = x0 + (x1 - x0) * i / nS, sag = 0.15 * 4 * (i / nS) * (1 - i / nS);
        B.quad(BRT.silk, 'cloth', [x - 0.12, 2.0 - sag, z], [x + 0.12, 2.0 - sag, z], [x - 0.1, 1.2 - sag, z], [x + 0.1, 1.25 - sag, z]); } }
    B.flush();
  }
});

ASSET({
  key: 'br_tent_mammoth_paddock', name: 'Mammoth paddock and byre', culture: 'beast-rider', family: 'farm',
  types: ['farm'], districts: ['pasture'], wealth: [0, 1], tags: { style: 'rail-and-hide', role: 'herding', tribe: 'mammoth' },
  w: 34.6, d: 28.6, h: 6.3, variants: 2, variantNames: ['an open byre on log posts', 'the byre walled with hides on the weather side, hay ricks'],
  build: function (F) {
    const v = F.variant, B = brtBatch(F), hw = 17, hd = 13;
    F.box(0, 0, 0, 2 * hw - 0.2, 0.04, 2 * hd - 0.2, 0, BRT.earth, 'yard/stone');
    brtRail(F, B, -hw, -hd, hw, -hd, 1.9, 4); brtRail(F, B, -hw, hd, -hw, -hd, 1.9, 4); brtRail(F, B, hw, -hd, hw, hd, 1.9, 4);
    brtRail(F, B, -hw, hd, -3, hd, 1.9, 4); brtRail(F, B, 3, hd, hw, hd, 1.9, 4);
    for (const s of [-1, 1]) brmPost(F, s * 3, 0, hd, 3.2, 0.42, BRM.red, BRM.gilt);
    B.stick(BRT.poleDark, BRT_LASH, [-3, 2.95, hd, 3, 2.95, hd, 0.16]);
    /* a gate of rails swung half open */
    const ga = 0.9; for (const y of [0.5, 1.0, 1.5, 2.0]) B.stick(BRT.rail, BRT_LASH, [-2.8, y, hd, -2.8 + Math.cos(ga) * 2.7, y, hd + Math.sin(ga) * 2.7, 0.07]);
    B.stick(BRT.rail, BRT_LASH, [-2.8, 0.4, hd, -2.8 + Math.cos(ga) * 2.6, 2.1, hd + Math.sin(ga) * 2.6, 0.06]);
    /* the byre at the back: a great lean-to of hides on log posts, high enough for a mammoth (4 m at the shoulder) */
    const bx0 = -8, bx1 = 8, bz0 = -4.0, bz1 = -11.5;
    brtLeanTo(F, B, bx0, bx1, bz0, bz1, 5.6, 4.8);
    for (let i = 0; i < 5; i++) { const x = bx0 + (bx1 - bx0) * i / 4; for (const z of [bz0, bz1]) B.stick(BRT.poleDark, BRT_LASH, [x, -0.3, z, x, (z === bz0 ? 5.6 : 4.8) + 0.05, z, 0.26, 0.22]); }
    F.box(0, 0.04, (bz0 + bz1) / 2, bx1 - bx0 + 0.6, 0.06, bz0 - bz1 + 0.6, 0, BRT.straw, 'straw/cloth');
    if (v) for (let i = 0; i < 6; i++) { const x0 = bx0 + (bx1 - bx0) * i / 6, x1 = bx0 + (bx1 - bx0) * (i + 1) / 6;
      brtSurf(F, 2, 3, function (u, w) { return [x0 + (x1 - x0) * u, 4.7 * (1 - w) + 0.2 * w + (brtU(F, 121, i, Math.round(u * 2)) * 0.3) * w, bz1 - 0.25 - (i % 2) * 0.014]; }, brtPick(F, [BRT.fur, BRT.furPale, BRT.hideOld[1]], 122, i), BRT_HIDE); }
    F.furn('br_h_trough', -4.5, 0.1, -6.0, 0, { v: 1 }); F.furn('br_h_trough', 0, 0.1, -6.0, 0, { v: 2 }); F.furn('br_h_trough', 4.5, 0.1, -6.0, 0, { v: 0 });
    F.furn('br_h_hay_bales', -6.5, 0.1, -10.0, 0, { v: 2 }); F.furn('br_h_hay_bales', 6.5, 0.1, -10.0, 0, { v: 1 });
    F.furn('br_h_water_butt', 12.5, 0, -9.5, 0, { v: 0 });
    for (const p of v ? [[-13, -9], [13, -4], [-13, 4]] : [[13, -9]]) { F.cyl(p[0], 0.04, p[1], 1.7, 2.0, 0, BRT.straw, 'straw/cloth'); F.cone(p[0], 2.04, p[1], 1.8, 1.5, 0, BRT.straw, 'straw/cloth'); }
    B.flush();
  }
});
