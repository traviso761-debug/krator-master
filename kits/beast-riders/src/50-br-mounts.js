// prefix: brm
/* ======================================================================
   The Beast Riders kit: the mounts' buildings (2026-10-18; restyled 2026-10-18 to stand beside the ports). Catalog
   ASSETs (krator-furniture-core.js: ASSET, F.*, shade, TAU), culture 'beast-rider', drawn in Girder's and Mav's
   Refuge's own vocabulary as the ports show it (src/60-br-ports.js; settlements/girder/src/55-arch.js): Girder's
   palette (05-palette.js: timber, tarred stave walls, shingle, red lacquer, gilt, verdigris), carved posts with collar
   bands and a cap, steep shingle roofs with verdigris hip ribs and a red eave band, crossed beast-head finials at the
   ridge ends, the stave longhouse's raking struts, Girder's pole fence, the hall's tiered cone and gilt spire.
   Frame: origin at the footprint's centre on the ground, +z the front. Each declared w, d, h holds everything the
   builder draws (verify.py measures it).

   Surfaces are texture families (family 'texFamily/renderFamily': krator-furniture-core.js mat()), which the kit's
   materials.json maps to the library, Girder's picks: 'shingle' (roof.shingle.neutral), 'timber' (wood.medieval_wood),
   'reed' (fibre.cane, Girder's woven walls), and the kit's own 'straw' (straw.bedding), 'guano' (wood.guano),
   'yard' (ground.stable.yard).

     br_bldg_raptor_stable   a stave stable for the running mounts (raptor, staghorn, tiger), its paddock before it
     br_bldg_great_byre      an open byre for the great beasts (threehorn, hardshell, mammoth) under a joglo roof
     br_bldg_rookery_tower   a free-standing roost tower for the flyers (quetzal, wingclaw, nightwing), the hall's roof
   ====================================================================== */

/* Girder's palette (settlements/girder/src/05-palette.js PAL), the colours its buildings are drawn in. Girder turns
   each colour from sRGB to linear before it draws (45-kit.js mbCol, emitBuckets); the catalog's mat() takes a colour as
   it is, so the palette is turned here once (brmLin), and the stables read as dark as the ports beside them */
function brmLin(v) { return Array.isArray(v) ? v.map(brmLin) : new THREE.Color(v).convertSRGBToLinear().getHex(); }
const BRM_SRGB = { timber: [0x5e4630, 0x6a5038, 0x4e3a28, 0x745a3e], stave: [0x6e5238, 0x5e4630, 0x7a5c40], wall: 0xa88a5e,
  shingle: [0x6a5a44, 0x5a4c3a, 0x7a684e, 0x4e4234], thatch: [0xa08a4e, 0x8e7a44], red: 0x8a2f2a, gilt: 0xb08432,
  verd: 0x2f6a5a, deep: 0x7a2028, rope: 0xa8966a, rock: 0x6d665c, plank: 0x8a6c48, straw: 0xc9b07a, mud: 0x5a4532,
  pane: 0x2b2620, hide: 0x8a6a48 };
const BRM = {}; for (const k in BRM_SRGB) BRM[k] = brmLin(BRM_SRGB[k]);
const BRM_TIMBER = 'timber/wood', BRM_SHINGLE = 'shingle/thatch', BRM_STAVE = 'timber/wood';

/* Girder's carved post (55-arch.js carvedPost): a square shaft, two collar bands turned 45 degrees, a broad cap */
function brmPost(F, x, y, z, h, s, col, trim) {
  F.box(x, y, z, s, h, s, 0, col, BRM_TIMBER);
  F.box(x, y + h * 0.3, z, s * 1.35, 0.14, s * 1.35, 0.78, trim, BRM_TIMBER);
  F.box(x, y + h * 0.62, z, s * 1.35, 0.14, s * 1.35, 0.78, trim, BRM_TIMBER);
  F.box(x, y + h - 0.2, z, s * 1.7, 0.2, s * 1.7, 0, trim, BRM_TIMBER);
}
/* Girder's beast-head finial (55-arch.js finial): a neck rising from (x, y, z) out along (dx, dz), then the head */
function brmFinial(F, x, y, z, dx, dz, s, col) {
  const qx = x + dx * 0.7 * s, qy = y + 1.1 * s, qz = z + dz * 0.7 * s;
  F.beam(x - dx * 0.2 * s, y - 0.1, z - dz * 0.2 * s, qx, qy, qz, 0.16 * s, 0.22 * s, col, BRM_TIMBER);
  F.beam(qx, qy - 0.05 * s, qz, qx + dx * 0.55 * s, qy + 0.12 * s, qz + dz * 0.55 * s, 0.2 * s, 0.24 * s, col, BRM_TIMBER);
}
/* Girder's pole fence (55-arch.js fence): square posts every ~2.7 m, a top rail and a lighter mid rail */
function brmFence(F, ax, az, bx, bz, h) {
  const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2.7)), c = BRM.timber[2];
  for (let i = 0; i <= n; i++) { const t = i / n; F.box(ax + (bx - ax) * t, -0.2, az + (bz - az) * t, 0.14, h + 0.3, 0.14, 0, c, BRM_TIMBER); }
  F.beam(ax, h * 0.9, az, bx, h * 0.9, bz, 0.07, 0.09, shade(c, 0.08), BRM_TIMBER);
  F.beam(ax, h * 0.5, az, bx, h * 0.5, bz, 0.06, 0.08, shade(c, -0.05), BRM_TIMBER);
}
/* a steep shingle hip roof as Girder's halls have it: the hip faces, a red eave band all round, verdigris ribs up the
   four hips to the ridge, a timber ridge beam and, when finial > 0, crossed beast heads at its ends */
function brmHip(F, cx, cz, y, w, h, d, col, finial) {
  F.hipRoof(cx, y, cz, w, h, d, 0, col, BRM_SHINGLE);
  const hw = w / 2, hd = d / 2, along = w >= d, r = along ? (w - d) / 2 : (d - w) / 2;
  for (const e of [[-hw, -hd, hw, -hd], [-hw, hd, hw, hd], [-hw, -hd, -hw, hd], [hw, -hd, hw, hd]])
    F.beam(cx + e[0], y - 0.2, cz + e[1], cx + e[2], y - 0.2, cz + e[3], 0.26, 0.34, BRM.red, BRM_TIMBER);
  const P = along ? [-r, 0] : [0, -r], Q = along ? [r, 0] : [0, r];
  for (const c of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const top = (along ? c[0] : c[1]) < 0 ? P : Q;
    F.beam(cx + c[0] * hw, y + 0.05, cz + c[1] * hd, cx + top[0], y + h + 0.08, cz + top[1], 0.22, 0.2, BRM.verd, BRM_TIMBER);
  }
  if (r > 0.3) F.beam(cx + P[0], y + h + 0.05, cz + P[1], cx + Q[0], y + h + 0.05, cz + Q[1], 0.26, 0.3, BRM.timber[2], BRM_TIMBER);
  if (finial > 0) {
    const ux = along ? 1 : 0, uz = along ? 0 : 1;
    brmFinial(F, cx + Q[0], y + h, cz + Q[1], ux, uz, finial, BRM.deep);
    brmFinial(F, cx + P[0], y + h, cz + P[1], -ux, -uz, finial, BRM.deep);
  }
}
/* a tier of the hall's roof (55-arch.js: MCONE with an eave ring and ribs): a 16-sided frustum of shingle, a red eave
   ring at its foot, n verdigris ribs from foot to head */
function brmTier(F, y, rb, rt, h, col, n, ribCol) {
  F.frustum(0, y, 0, rb, rt, h, 0, col, BRM_SHINGLE, 16);
  F.frustum(0, y - 0.35, 0, rb + 0.12, rb - 0.2, 0.4, 0, BRM.red, BRM_TIMBER, 16);
  for (let i = 0; i < n; i++) {
    const a = (i + 0.5) / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    F.beam(c * (rb + 0.05), y + 0.1, s * (rb + 0.05), c * rt, y + h + 0.12, s * rt, 0.2, 0.18, ribCol, BRM_TIMBER);
  }
}
/* a window in a wall facing +z or -z (side 1 / -1) or +x / -x (axis 'x'): a frame and a dark pane, as Girder's winAt */
function brmWin(F, x, y, z, w, h, axisX) {
  const fw = axisX ? 0.1 : w + 0.2, fd = axisX ? w + 0.2 : 0.1;
  F.box(x, y - h / 2 - 0.09, z, fw, h + 0.18, fd, 0, BRM.timber[2], BRM_TIMBER);
  F.box(x, y - h / 2, z, axisX ? 0.13 : w, h, axisX ? w : 0.13, 0, BRM.pane, 'wood');
  F.box(x, y - h / 2 - 0.16, z, axisX ? 0.16 : w + 0.34, 0.08, axisX ? w + 0.34 : 0.16, 0, BRM.timber[2], BRM_TIMBER);
}

ASSET({
  key: 'br_bldg_raptor_stable', name: 'Raptor stable (running mounts)', culture: 'beast-rider',
  family: 'industrial', types: ['farm', 'industry'], districts: ['ridertown'], wealth: [0, 1],
  w: 23, d: 24, h: 11, variants: 2,
  build: function (F) {
    /* the stable: Girder's stave longhouse with its front opened into stalls (z -11 .. -1) on a stone footing; tarred
       stave walls at the back and ends, a carved post at each stall division, raking struts down the ends */
    const sz0 = -11, sz1 = -1, hw = 10.2, wallH = 2.4, zc = (sz0 + sz1) / 2, y0 = 0.35;
    F.box(0, 0, zc, 2 * hw + 0.8, y0, sz1 - sz0 + 0.8, 0, BRM.rock, 'stone');
    F.box(0, y0, zc, 2 * hw - 0.4, 0.06, sz1 - sz0 - 0.6, 0, BRM.straw, 'straw/cloth');
    F.box(0, y0, sz0 + 0.1, 2 * hw, wallH, 0.2, 0, BRM.stave[0], BRM_STAVE);
    for (const s of [-1, 1]) F.box(s * hw, y0, zc, 0.2, wallH, sz1 - sz0 - 0.2, 0, BRM.stave[1], BRM_STAVE);
    /* a plank sill and a top plate round the walls, a window at each end */
    F.box(0, y0 + wallH - 0.2, sz0 + 0.12, 2 * hw + 0.2, 0.22, 0.26, 0, BRM.timber[2], BRM_TIMBER);
    for (const s of [-1, 1]) brmWin(F, s * (hw + 0.06), y0 + 1.6, zc - 1.0, 0.8, 0.6, true);
    for (const s of [-1, 1]) for (let t = 0; t < 3; t++) {
      const z = sz0 + 1.2 + t * (sz1 - sz0 - 2.4) / 2;
      F.beam(s * (hw + 1.0), 0, z, s * (hw + 0.05), y0 + wallH + 0.15, z, 0.22, 0.22, BRM.timber[2], BRM_TIMBER);
    }
    const nStall = F.variant === 1 ? 4 : 5, sw = (2 * hw) / nStall, postH = 3.1;
    for (let i = 0; i <= nStall; i++) {
      const x = -hw + i * sw;
      brmPost(F, x, y0, sz1 - 0.2, postH, 0.3, i % 2 ? BRM.deep : BRM.red, BRM.gilt);
      /* a stall partition: woven cane to the shoulder */
      if (i > 0 && i < nStall) F.box(x, y0, zc - 0.4, 0.1, 1.7, sz1 - sz0 - 1.8, 0, BRM.wall, 'reed');
    }
    F.box(0, y0 + postH - 0.25, sz1 - 0.2, 2 * hw + 0.3, 0.24, 0.24, 0, BRM.red, BRM_TIMBER);
    /* the stall fronts: half doors of tarred plank, a verdigris rail along the front at chest height */
    for (let i = 0; i < nStall; i++) F.box(-hw + (i + 0.5) * sw - sw * 0.18, y0, sz1 - 0.12, sw * 0.5, 1.25, 0.1, 0, i % 2 ? BRM.stave[2] : BRM.stave[0], BRM_STAVE);
    F.beam(-hw, y0 + 1.3, sz1 - 0.05, hw, y0 + 1.3, sz1 - 0.05, 0.08, 0.1, BRM.verd, BRM_TIMBER);
    /* the roof: a great steep shingle hip over the stalls, its eave out over the stall fronts, beast heads at the ridge;
       a smoke hood on the ridge, as the longhouse has */
    const ry = y0 + postH, rh = 5.6, rd = sz1 - sz0 + 2.6, rcz = zc + 0.3;
    brmHip(F, 0, rcz, ry, 2 * hw + 1.8, rh, rd, BRM.shingle[1], 1.3);
    F.box(0, ry + rh - 0.35, rcz, 1.0, 0.6, 1.6, 0, BRM.stave[1], BRM_STAVE);
    F.pyrRoof(0, ry + rh + 0.2, rcz, 1.5, 0.6, 2.2, 0, BRM.shingle[3], BRM_SHINGLE);
    /* a red banner with its gilt mark over the middle bay, lanterns at the ends of the front */
    F.box(0, y0 + 0.9, sz1 + 0.05, 1.2, 2.0, 0.05, 0, BRM.deep, 'cloth');
    F.box(0, y0 + 1.6, sz1 + 0.08, 0.55, 0.55, 0.03, 0.78, BRM.gilt, 'cloth');
    F.furn('br_h_hanging_lantern', -hw + 0.4, y0 + postH - 1.0, sz1 + 0.3, 0, { v: 1 });
    F.furn('br_h_hanging_lantern', hw - 0.4, y0 + postH - 1.0, sz1 + 0.3, 0, { v: 1 });
    /* the paddock before it (z -1 .. +11): trampled yard, Girder's pole fence, carved gate posts at the gap */
    const pz0 = -0.6, pz1 = 10.8, phw = 10.6;
    F.box(0, 0, (pz0 + pz1) / 2, 2 * phw, 0.04, pz1 - pz0, 0, BRM.mud, 'yard/stone');
    brmFence(F, -phw, pz0, -phw, pz1, 1.4); brmFence(F, phw, pz0, phw, pz1, 1.4);
    brmFence(F, -phw, pz1, -1.9, pz1, 1.4); brmFence(F, 1.9, pz1, phw, pz1, 1.4);
    for (const s of [-1, 1]) brmPost(F, s * 1.9, 0, pz1, 2.6, 0.26, BRM.red, BRM.gilt);
    F.beam(-1.9, 2.5, pz1, 1.9, 2.5, pz1, 0.2, 0.24, BRM.timber[2], BRM_TIMBER);
    F.furn('br_h_trough', -6.5, 0.04, 6.5, Math.PI / 2, { v: 0 });
    F.furn('br_h_hay_bales', 7.0, 0.04, 2.0, 0, { v: 0 });
    F.furn('br_h_tack_rack', -8.5, y0, -9.6, 0, { v: 0 });
    F.furn('br_h_hitching_rail', 4.5, 0.04, 9.6, 0, { v: 0 });
    F.furn('br_h_water_butt', 9.4, 0.04, -0.2, 0, { v: 0 });
  }
});

ASSET({
  key: 'br_bldg_great_byre', name: 'Great byre (threehorn, hardshell, mammoth)', culture: 'beast-rider',
  family: 'industrial', types: ['farm', 'industry'], districts: ['ridertown'], wealth: [0, 1],
  w: 30, d: 24, h: 14.5, variants: 1,
  build: function (F) {
    /* a yard round it (the great beasts are walked and fed outside), then Girder's joglo pendopo grown for beasts: an
       open hall on carved posts on a two-step stone plinth, a hide windbreak at the back, a straw floor, long troughs;
       the joglo's roof, a shallow skirt of thatch and a steep shingle crown, beast heads on the ridge */
    F.box(0, 0, 0, 29.4, 0.04, 23.4, 0, BRM.mud, 'yard/stone');
    const hw = 11, hd = 7.5, postH = 5.6, nx = 5, y0 = 0.5;
    F.box(0, 0.04, 0, 2 * hw + 1.6, 0.26, 2 * hd + 1.6, 0, shade(BRM.rock, -0.05), 'stone');
    F.box(0, 0.3, 0, 2 * hw + 0.6, 0.2, 2 * hd + 0.6, 0, BRM.rock, 'stone');
    F.box(0, y0, 0, 2 * hw - 0.4, 0.06, 2 * hd - 0.4, 0, BRM.straw, 'straw/cloth');
    for (let i = 0; i < nx; i++) for (const s of [-1, 1]) {
      const x = -hw + i * (2 * hw) / (nx - 1);
      brmPost(F, x, y0, s * hd, postH, 0.42, (i + (s > 0 ? 1 : 0)) % 2 ? BRM.deep : BRM.red, BRM.gilt);
    }
    for (const s of [-1, 1]) brmPost(F, s * hw, y0, 0, postH, 0.42, BRM.red, BRM.gilt);
    /* the ring beam (red), the tie beams across, a verdigris rail along the ends */
    for (const s of [-1, 1]) F.beam(-hw, y0 + postH, s * hd, hw, y0 + postH, s * hd, 0.36, 0.4, BRM.red, BRM_TIMBER);
    for (let i = 0; i < nx; i++) { const x = -hw + i * (2 * hw) / (nx - 1); F.beam(x, y0 + postH + 0.3, -hd, x, y0 + postH + 0.3, hd, 0.26, 0.3, BRM.timber[2], BRM_TIMBER); }
    for (const s of [-1, 1]) F.beam(s * hw, y0 + 1.0, -hd, s * hw, y0 + 1.0, hd, 0.12, 0.14, BRM.verd, BRM_TIMBER);
    /* the hide windbreak along the back, the long troughs along the front */
    for (let i = 0; i < 4; i++) F.box(-hw + 2.6 + i * 5.4, y0 + 1.0, -hd + 0.3, 4.6, 3.8, 0.06, F.rr(-0.04, 0.04), shade(BRM.hide, F.rr(-0.1, 0.06)), 'hide');
    F.box(-5.5, y0, hd - 1.4, 8, 0.8, 1.0, 0, BRM.timber[3], BRM_TIMBER);
    F.box(5.5, y0, hd - 1.4, 8, 0.8, 1.0, 0, BRM.timber[3], BRM_TIMBER);
    /* the roof (55-arch.js joglo): a shallow hipped skirt of thatch 2 m past the posts, then the steep crown */
    const ry = y0 + postH + 0.6, W = 2 * hw + 4, D = 2 * hd + 4;
    F.hipRoof(0, ry, 0, W, 1.6, D, 0, shade(BRM.thatch[1], -0.3), 'thatch');
    for (const e of [[-W / 2, -D / 2, W / 2, -D / 2], [-W / 2, D / 2, W / 2, D / 2], [-W / 2, -D / 2, -W / 2, D / 2], [W / 2, -D / 2, W / 2, D / 2]])
      F.beam(e[0], ry - 0.2, e[1], e[2], ry - 0.2, e[3], 0.26, 0.34, BRM.red, BRM_TIMBER);
    brmHip(F, 0, 0, ry + 1.25, W * 0.56, 4.4, D * 0.5, BRM.shingle[1], 1.4);
    /* hay ricks in the yard, the feed under the eave, lanterns at the front corners */
    for (const p of [[-12.5, -9.5], [12.5, -9.5], [-12.5, 9.5]]) {
      F.cyl(p[0], 0.04, p[1], 1.6, 1.8, 0, BRM.straw, 'straw/cloth');
      F.cone(p[0], 1.84, p[1], 1.7, 1.4, 0, shade(BRM.straw, -0.08), 'straw/cloth');
    }
    F.furn('br_h_hay_bales', 9.0, y0, -4.0, 0, { v: 0 });
    F.furn('br_h_feed_basket', -9.0, y0, -4.5, 0, { v: 0 });
    F.furn('br_h_water_butt', 12.6, 0.04, 6.0, 0, { v: 0 });
    F.furn('br_h_hanging_lantern', -hw + 0.5, y0 + postH - 1.2, hd + 0.4, 0, { v: 1 });
    F.furn('br_h_hanging_lantern', hw - 0.5, y0 + postH - 1.2, hd + 0.4, 0, { v: 1 });
  }
});

ASSET({
  key: 'br_bldg_rookery_tower', name: 'Rookery tower (flyers)', culture: 'beast-rider',
  family: 'industrial', types: ['infrastructure', 'farm'], districts: ['ridertown'], wealth: [0, 1],
  w: 13.5, d: 13.5, h: 26.5, variants: 1,
  build: function (F) {
    /* four raked log legs braced in two stages, a roost deck at 13.5 m with perch beams out on all four sides (the
       flyers' wood, streaked white), nest bundles, carved posts at the deck's corners carrying the assembly hall's
       roof in little (a shingle tier, a window drum, a steep cone, the gilt spire), a ladder, a feed hoist, a stave
       feed shed at the foot */
    const top = 13.5, b0 = 4.2, b1 = 2.8;
    const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    legs.forEach(function (s) {
      F.rod(s[0] * b0, 0, s[1] * b0, s[0] * b1, top, s[1] * b1, 0.28, BRM.timber[2], 'bark');
      F.box(s[0] * b0, 0, s[1] * b0, 1.0, 0.5, 1.0, 0, BRM.rock, 'stone');
      F.cyl(s[0] * (b0 + (b1 - b0) * 0.62), top * 0.62, s[1] * (b0 + (b1 - b0) * 0.62), 0.36, 0.16, 0, BRM.rope, 'rope');
    });
    for (const y of [4, 8.5]) {
      const r = b0 + (b1 - b0) * y / top;
      for (let i = 0; i < 4; i++) {
        const a = legs[i], b = legs[(i + 1) % 4];
        F.rod(a[0] * r, y, a[1] * r, b[0] * r, y, b[1] * r, 0.1, BRM.timber[0], BRM_TIMBER);
        F.rod(a[0] * r, y, a[1] * r, b[0] * (b0 + (b1 - b0) * (y + 4) / top), Math.min(top, y + 4), b[1] * (b0 + (b1 - b0) * (y + 4) / top), 0.07, BRM.timber[0], BRM_TIMBER);
      }
    }
    /* the deck on its joists, a red rail round it, the perch beams out beyond it */
    F.box(0, top - 0.5, 0, 7.4, 0.5, 7.4, 0, BRM.timber[2], BRM_TIMBER);
    F.box(0, top, 0, 7.8, 0.3, 7.8, 0, shade(BRM.plank, 0.05), 'guano/wood');
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2, c = Math.cos(a), s = Math.sin(a), tx = -s, tz = c;
      F.beam(c * 3.8, top + 0.4, s * 3.8, c * 6.4, top + 0.6, s * 6.4, 0.22, 0.22, shade(BRM.timber[1], 0.05), 'guano/wood');
      F.rod(c * 6.3 + tx * 1.2, top + 0.65, s * 6.3 + tz * 1.2, c * 6.3 - tx * 1.2, top + 0.65, s * 6.3 - tz * 1.2, 0.12, shade(BRM.timber[1], 0.05), 'guano/wood');
      F.box(c * 2.4 + tx * 1.4, top + 0.3, s * 2.4 + tz * 1.4, 1.4, 0.55, 1.4, a, BRM.straw, 'straw/cloth');
      /* the rail on the deck's edge, open where the perch beam goes out */
      for (const sd of [-1, 1]) F.beam(c * 3.8 + tx * sd * 0.9, top + 1.0, s * 3.8 + tz * sd * 0.9, c * 3.8 + tx * sd * 3.8, top + 1.0, s * 3.8 + tz * sd * 3.8, 0.12, 0.12, BRM.red, BRM_TIMBER);
    }
    /* carved posts at the corners and mid-sides carrying the roof */
    const pr = 3.55, ph = 3.0;
    for (const p of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) brmPost(F, p[0] * pr, top + 0.3, p[1] * pr, ph, 0.3, BRM.red, BRM.gilt);
    /* the roof, the hall's in little: a shingle tier with its red eave ring and verdigris ribs, a drum of dark windows
       banded red, a steep cone with gilt ribs, the gilt spire and its cross */
    let yy = top + 0.3 + ph;
    F.box(0, yy - 0.3, 0, 7.6, 0.3, 7.6, 0, BRM.red, BRM_TIMBER);
    brmTier(F, yy, 6.0, 2.4, 2.4, BRM.shingle[1], 12, BRM.verd); yy += 2.4;
    F.frustum(0, yy - 0.2, 0, 2.3, 2.3, 1.2, 0, BRM.wall, 'reed', 16);
    for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; F.box(Math.cos(a) * 2.3, yy + 0.05, Math.sin(a) * 2.3, 0.55, 0.7, 0.55, -a, BRM.pane, 'wood'); }
    F.frustum(0, yy + 0.85, 0, 2.38, 2.38, 0.18, 0, BRM.red, BRM_TIMBER, 16);
    yy += 1.0;
    brmTier(F, yy, 2.9, 0.18, 3.6, BRM.shingle[3], 8, BRM.gilt); yy += 3.6;
    F.cyl(0, yy - 0.2, 0, 0.22, 0.5, 0, BRM.gilt, BRM_TIMBER);
    F.box(0, yy + 0.2, 0, 0.1, 2.0, 0.1, 0, BRM.gilt, BRM_TIMBER);
    F.box(0, yy + 1.2, 0, 0.8, 0.08, 0.08, 0, BRM.gilt, BRM_TIMBER);
    F.box(0, yy + 1.2, 0, 0.08, 0.08, 0.8, 0, BRM.gilt, BRM_TIMBER);
    F.box(0.45, yy + 1.55, 0, 0.9, 0.4, 0.03, 0, BRM.deep, 'cloth');
    /* the ladder up one face, the hoist arm, the feed shed at the foot */
    F.rod(-1.0, 0, b0 + 0.2, -0.9, top, b1 + 0.15, 0.06, BRM.timber[0], BRM_TIMBER);
    F.rod(1.0, 0, b0 + 0.2, 0.9, top, b1 + 0.15, 0.06, BRM.timber[0], BRM_TIMBER);
    for (let k = 1; k < 24; k++) { const t = k / 24, z = b0 + 0.2 + (b1 - b0 - 0.05) * t; F.rod(-0.95, top * t, z, 0.95, top * t, z, 0.035, BRM.timber[0], BRM_TIMBER); }
    F.beam(0, top + 1.5, -b1, 0, top + 1.5, -b1 - 2.4, 0.16, 0.16, BRM.timber[2], BRM_TIMBER);
    F.rod(0, top + 1.4, -b1 - 2.3, 0, 2.5, -b1 - 2.3, 0.025, BRM.rope, 'rope');
    F.box(0, 0, 0, 4.4, 2.2, 3.4, 0, BRM.stave[0], BRM_STAVE);
    F.box(0, 0.6, 1.72, 1.0, 1.6, 0.06, 0, BRM.stave[2], BRM_STAVE);
    brmHip(F, 0, 0, 2.2, 5.4, 1.5, 4.4, BRM.shingle[1], 0);
    F.box(-5.0, 0, 5.0, 2.4, 0.5, 2.4, 0, BRM.straw, 'straw/cloth');
    F.furn('br_h_hanging_lantern', 0, top + 0.3 + ph - 1.0, 0, 0, { v: 1 });
  }
});
