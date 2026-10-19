// prefix: brm
/* ======================================================================
   The Beast Riders kit: the mounts' buildings (2026-10-18). Catalog ASSETs (krator-furniture-core.js: ASSET, F.*, shade,
   TAU), culture 'beast-rider', in the house style of the catalog's Beast Rider buildings (Girder, Mav's Refuge:
   kits/catalog/krator-master-buildings-beast-rider.js, which this kit reads in place): wet-canopy timber, deep thatch
   eaves, rope collars at the joints, claw-green and red. Frame: origin at the footprint's centre on the ground, +z the
   front. Each declared w, d, h holds everything the builder draws (verify.py measures it).

   Three surfaces arrive as texture families (family 'texFamily/renderFamily': krator-furniture-core.js mat()), which
   the kit's materials.json maps to the library: 'straw' (straw.bedding: stall floors, hay, nests), 'guano'
   (wood.guano: perches and roost decks where the flyers sit), 'yard' (ground.stable.yard: the trampled paddocks).

     br_bldg_raptor_stable   a long stable for the riders' running mounts (raptor, staghorn, tiger), its paddock before it
     br_bldg_great_byre      an open byre for the great beasts (threehorn, hardshell, mammoth), its yard round it
     br_bldg_rookery_tower   a free-standing roost tower for the flyers (quetzal, wingclaw, nightwing) on open ground
   ====================================================================== */

const BRM = { timber: 0x5e4630, timberD: 0x4a3826, rope: 0x9a8a62, red: 0x8a2f2a, green: 0x3f7a3a, thatch: 0x8a7a52, straw: 0xc9b07a,
  stone: 0x8a8274, mud: 0x5a4532 };

/* a pole fence run from (ax, az) to (bx, bz): posts every ~2.4 m, two rails */
function brmFence(F, ax, az, bx, bz, h) {
  const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2.4));
  for (let i = 0; i <= n; i++) { const t = i / n; F.cyl(ax + (bx - ax) * t, 0, az + (bz - az) * t, 0.09, h, 0, BRM.timberD, 'wood'); }
  for (const y of [h * 0.45, h * 0.9]) F.rod(ax, y, az, bx, y, bz, 0.05, BRM.timber, 'wood');
}
/* a hip roof with its eave beam and a thatch course line, the culture's way (the slope is never one blank plane) */
function brmRoof(F, y, w, h, d, c) {
  F.hipRoof(0, y, 0, w, h, d, 0, c, 'thatch');
  const ec = shade(c, -0.24);
  F.beam(-w / 2, y, -d / 2, w / 2, y, -d / 2, 0.24, 0.24, ec, 'wood');
  F.beam(-w / 2, y, d / 2, w / 2, y, d / 2, 0.24, 0.24, ec, 'wood');
  F.beam(-w / 2, y, -d / 2, -w / 2, y, d / 2, 0.24, 0.24, ec, 'wood');
  F.beam(w / 2, y, -d / 2, w / 2, y, d / 2, 0.24, 0.24, ec, 'wood');
  const k = 0.45, cw = w * (1 - k) / 2 + 0.1, cd = d * (1 - k) / 2 + 0.1, cy = y + h * k;
  F.beam(-cw, cy, -cd, cw, cy, -cd, 0.14, 0.14, ec, 'wood');
  F.beam(-cw, cy, cd, cw, cy, cd, 0.14, 0.14, ec, 'wood');
}

ASSET({
  key: 'br_bldg_raptor_stable', name: 'Raptor stable (running mounts)', culture: 'beast-rider',
  family: 'industrial', types: ['farm', 'industry'], districts: ['ridertown'], wealth: [0, 1],
  w: 22, d: 23, h: 8.4, variants: 2,
  build: function (F) {
    /* the stable shed behind (z -11 .. -1): stone footing, posts, wattle stalls, a straw floor under a hip roof */
    const sz0 = -11, sz1 = -1, hw = 10.2, postH = 4.2, zc = (sz0 + sz1) / 2;
    F.box(0, 0, zc, 2 * hw + 0.4, 0.35, sz1 - sz0, 0, BRM.stone, 'stone');
    F.box(0, 0.35, zc, 2 * hw - 0.4, 0.08, sz1 - sz0 - 0.6, 0, BRM.straw, 'straw/cloth');
    const nStall = F.variant === 1 ? 4 : 5, sw = (2 * hw) / nStall;
    for (let i = 0; i <= nStall; i++) {
      const x = -hw + i * sw;
      F.cyl(x, 0.35, sz0 + 0.3, 0.17, postH, 0, BRM.timber, 'wood');
      F.cyl(x, 0.35, sz1 - 0.3, 0.17, postH, 0, BRM.timber, 'wood');
      F.cyl(x, 0.35 + postH - 0.5, sz1 - 0.3, 0.22, 0.14, 0, BRM.rope, 'cloth');
      /* a stall partition: woven wattle to shoulder height */
      if (i > 0 && i < nStall) F.box(x, 0.35, zc - 0.6, 0.12, 1.7, sz1 - sz0 - 2.4, 0, shade(BRM.straw, -0.25), 'reed');
    }
    F.box(0, 0.35, sz0 + 0.1, 2 * hw, 2.6, 0.18, 0, shade(BRM.timber, 0.1), 'wood');
    for (const s of [-1, 1]) F.box(s * hw, 0.35, zc, 0.18, 2.6, sz1 - sz0 - 0.4, 0, shade(BRM.timber, 0.1), 'wood');
    F.beam(-hw, 0.35 + postH, sz1 - 0.3, hw, 0.35 + postH, sz1 - 0.3, 0.26, 0.26, BRM.timber, 'wood');
    F.beam(-hw, 0.35 + postH, sz0 + 0.3, hw, 0.35 + postH, sz0 + 0.3, 0.26, 0.26, BRM.timber, 'wood');
    /* the roof over the shed, its eave out over the stall fronts */
    const ry = 0.35 + postH + 0.2;
    F.hipRoof(0, ry, zc, 2 * hw + 1.6, 3.4, sz1 - sz0 + 2.0, 0, BRM.thatch, 'thatch');
    F.beam(-hw - 0.8, ry, sz1 + 0.7, hw + 0.8, ry, sz1 + 0.7, 0.24, 0.24, shade(BRM.thatch, -0.24), 'wood');
    /* the stall fronts: half doors, a claw-green banner over the middle bay */
    for (let i = 0; i < nStall; i++) F.box(-hw + (i + 0.5) * sw, 0.35, sz1 - 0.25, sw * 0.62, 1.2, 0.1, 0, i % 2 ? BRM.timber : shade(BRM.timber, 0.12), 'wood');
    F.box(0, 0.35 + postH - 1.5, sz1 - 0.15, 1.6, 1.3, 0.05, 0, BRM.green, 'cloth');
    /* the paddock before it (z -1 .. +11): trampled yard, a pole fence with a gate gap at the front, a trough */
    const pz0 = -0.6, pz1 = 10.8, phw = 10.6;
    F.box(0, 0, (pz0 + pz1) / 2, 2 * phw, 0.04, pz1 - pz0, 0, BRM.mud, 'yard/stone');
    brmFence(F, -phw, pz0, -phw, pz1, 1.5); brmFence(F, phw, pz0, phw, pz1, 1.5);
    brmFence(F, -phw, pz1, -1.8, pz1, 1.5); brmFence(F, 1.8, pz1, phw, pz1, 1.5);
    F.furn('br_h_trough', -6.5, 0.04, 6.5, Math.PI / 2, { v: 0 });
    F.furn('br_h_hay_bales', 7.0, 0.04, 2.0, 0, { v: 0 });
    F.furn('br_h_tack_rack', -8.5, 0.43, -9.6, 0, { v: 0 });
    F.furn('br_h_hitching_rail', 4.5, 0.04, 9.6, 0, { v: 0 });
    F.furn('br_h_water_butt', 9.4, 0.04, -0.2, 0, { v: 0 });
  }
});

ASSET({
  key: 'br_bldg_great_byre', name: 'Great byre (threehorn, hardshell, mammoth)', culture: 'beast-rider',
  family: 'industrial', types: ['farm', 'industry'], districts: ['ridertown'], wealth: [0, 1],
  w: 30, d: 24, h: 12.5, variants: 1,
  build: function (F) {
    /* a yard round it (the great beasts are walked and fed outside), then an open byre on log posts: no walls but a
       windbreak of hung hides at the back, a straw floor, hay ricks and long troughs */
    F.box(0, 0, 0, 29.4, 0.04, 23.4, 0, BRM.mud, 'yard/stone');
    const hw = 11, hd = 7.5, postH = 6.4, nx = 5;
    F.box(0, 0.04, 0, 2 * hw, 0.3, 2 * hd, 0, BRM.stone, 'stone');
    F.box(0, 0.34, 0, 2 * hw - 0.8, 0.08, 2 * hd - 0.8, 0, BRM.straw, 'straw/cloth');
    for (let i = 0; i < nx; i++) for (const s of [-1, 1]) {
      const x = -hw + i * (2 * hw) / (nx - 1), z = s * hd;
      F.cyl(x, 0.34, z, 0.32, postH, 0, BRM.timberD, 'bark');
      F.cyl(x, 0.34 + postH - 0.8, z, 0.38, 0.18, 0, BRM.rope, 'cloth');
      if (i < nx - 1) F.rod(x, 0.34 + postH - 1.8, z, x + 1.6, 0.34 + postH - 0.2, z, 0.1, BRM.timber, 'wood');
    }
    for (const s of [-1, 1]) F.beam(-hw, 0.34 + postH, s * hd, hw, 0.34 + postH, s * hd, 0.36, 0.36, BRM.timber, 'wood');
    for (let i = 0; i < nx; i++) { const x = -hw + i * (2 * hw) / (nx - 1); F.beam(x, 0.34 + postH + 0.2, -hd, x, 0.34 + postH + 0.2, hd, 0.26, 0.3, BRM.timber, 'wood'); }
    /* the hide windbreak along the back, the long troughs along the front */
    for (let i = 0; i < 4; i++) F.box(-hw + 2.6 + i * 5.4, 0.34 + 1.2, -hd + 0.2, 4.6, 4.2, 0.06, F.rr(-0.04, 0.04), shade(0x8a6a48, F.rr(-0.1, 0.06)), 'hide');
    F.box(-5.5, 0.34, hd - 1.2, 8, 0.8, 1.0, 0, shade(BRM.timber, 0.1), 'wood');
    F.box(5.5, 0.34, hd - 1.2, 8, 0.8, 1.0, 0, shade(BRM.timber, 0.1), 'wood');
    /* the roof: a deep hip of thatch, its eaves 2 m past the posts */
    brmRoof(F, 0.34 + postH + 0.5, 2 * hw + 4, 4.6, 2 * hd + 4, BRM.thatch);
    F.cone(0, 0.34 + postH + 0.5 + 4.6, 0, 0.3, 0.7, 0, shade(BRM.thatch, -0.3), 'wood');
    /* hay ricks in the yard, the feed under the eave */
    for (const p of [[-12.5, -9.5], [12.5, -9.5], [-12.5, 9.5]]) {
      F.cyl(p[0], 0.04, p[1], 1.6, 1.8, 0, BRM.straw, 'straw/cloth');
      F.cone(p[0], 1.84, p[1], 1.7, 1.4, 0, shade(BRM.straw, -0.08), 'straw/cloth');
    }
    F.furn('br_h_hay_bales', 9.0, 0.42, -4.0, 0, { v: 0 });
    F.furn('br_h_feed_basket', -9.0, 0.42, -4.5, 0, { v: 0 });
    F.furn('br_h_water_butt', 12.6, 0.04, 6.0, 0, { v: 0 });
  }
});

ASSET({
  key: 'br_bldg_rookery_tower', name: 'Rookery tower (flyers)', culture: 'beast-rider',
  family: 'industrial', types: ['infrastructure', 'farm'], districts: ['ridertown'], wealth: [0, 1],
  w: 13, d: 13, h: 20.5, variants: 1,
  build: function (F) {
    /* four raked log legs braced in three stages, a roost deck at 13.5 m with perch rails out on all four sides
       (streaked where the flyers sit), nest bundles, a conical canopy, a ladder and a feed hoist; a feed shed at the foot */
    const top = 13.5, b0 = 4.2, b1 = 2.8;
    const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    legs.forEach(function (s) { F.rod(s[0] * b0, 0, s[1] * b0, s[0] * b1, top, s[1] * b1, 0.26, BRM.timberD, 'bark'); F.cyl(s[0] * b0, 0, s[1] * b0, 0.42, 0.5, 0, BRM.stone, 'stone'); });
    for (const y of [4, 8.5]) {
      const r = b0 + (b1 - b0) * y / top;
      for (let i = 0; i < 4; i++) {
        const a = legs[i], b = legs[(i + 1) % 4];
        F.rod(a[0] * r, y, a[1] * r, b[0] * r, y, b[1] * r, 0.1, BRM.timber, 'wood');
        F.rod(a[0] * r, y, a[1] * r, b[0] * (b0 + (b1 - b0) * (y + 4) / top), Math.min(top, y + 4), b[1] * (b0 + (b1 - b0) * (y + 4) / top), 0.07, BRM.timber, 'wood');
      }
    }
    /* the deck, its edge and the perch rails out beyond it: the flyers' wood, streaked white */
    F.box(0, top, 0, 7.6, 0.3, 7.6, 0, shade(BRM.timber, 0.12), 'guano/wood');
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      F.beam(c * 3.8, top + 0.4, s * 3.8, c * 6.2, top + 0.6, s * 6.2, 0.22, 0.22, shade(BRM.timber, 0.05), 'guano/wood');
      F.rod(c * 6.1 + s * 1.2, top + 0.65, s * 6.1 - c * 1.2, c * 6.1 - s * 1.2, top + 0.65, s * 6.1 + c * 1.2, 0.12, shade(BRM.timber, 0.05), 'guano/wood');
      F.box(c * 2.6, top + 0.3, s * 2.6, 1.5, 0.6, 1.5, a, BRM.straw, 'straw/cloth');
    }
    for (const p of [[-3.6, -3.6], [3.6, -3.6], [3.6, 3.6], [-3.6, 3.6]]) F.cyl(p[0], top + 0.3, p[1], 0.14, 3.2, 0, BRM.timber, 'wood');
    /* the canopy: a cone of thatch, a claw-green pennant at its tip */
    F.cone(0, top + 3.4, 0, 5.4, 3.0, 0, BRM.thatch, 'thatch');
    F.cyl(0, top + 6.3, 0, 0.08, 0.7, 0, BRM.timber, 'wood');
    F.box(0.45, top + 6.6, 0, 0.9, 0.4, 0.03, 0, BRM.green, 'cloth');
    /* the ladder up one face, the hoist arm, the feed shed at the foot */
    F.rod(-1.0, 0, b0 + 0.2, -0.9, top, b1 + 0.15, 0.06, BRM.timber, 'wood');
    F.rod(1.0, 0, b0 + 0.2, 0.9, top, b1 + 0.15, 0.06, BRM.timber, 'wood');
    for (let k = 1; k < 24; k++) { const t = k / 24, z = b0 + 0.2 + (b1 - b0 - 0.05) * t; F.rod(-0.95, top * t, z, 0.95, top * t, z, 0.035, BRM.timber, 'wood'); }
    F.beam(0, top + 1.5, -b1, 0, top + 1.5, -b1 - 2.4, 0.16, 0.16, BRM.timber, 'wood');
    F.rod(0, top + 1.4, -b1 - 2.3, 0, 2.5, -b1 - 2.3, 0.025, BRM.rope, 'cloth');
    F.box(0, 0, 0, 4.4, 2.2, 3.4, 0, shade(BRM.timber, 0.15), 'wood');
    F.pyrRoof(0, 2.2, 0, 5.2, 1.2, 4.2, 0, BRM.thatch, 'thatch');
    F.box(-5.0, 0, 5.0, 2.4, 0.5, 2.4, 0, BRM.straw, 'straw/cloth');
  }
});
