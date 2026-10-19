// prefix: brr
/* ======================================================================
   The Beast Riders kit: ROCK-CUT pieces, part two (2026-10-19): THE DEEP ROOT CAVERN'S DRESSING, and the kit's rock-cut
   API (BR_ROCK). The cavern (settlements/pinnacle-rock/PLAN.md, the zone table: "one of the Riders' holiest sites, where
   all five nature shrines are honoured under the Deep Root") is a hall cut into the mesa under its top; its voids are
   KCAVERN in the Pinnacle Rock build (core/terrain/39-core-cavern.js); what is cut and set in its walls is here, on the
   vocabulary of src/55-br-rockcut.js (the frame, the wall, the rim, the portal, the beasts):

     br_bldg_rock_cavern_door   the carved face round the cavern's door: the twelve tribes' beasts on an arch of
                                roundels under the claw, the Deep Root's roots down the pilasters, the orders of the door
     br_bldg_rock_tribe_niche   a tribe's offering niche in the passage of the tribes: one variant a tribe (twelve, in
                                LORE.md 6.6's order), its beast, its colours, its people's offerings
     br_bldg_rock_lamp_niche    the five shrines' lamp niches, one each, each its own carving and offerings: First Bough,
                                Rain Mother, Winged Ones, Deep Root, Green Silence
     br_bldg_rock_offering_ledge  a ledge of offerings cut from the wall (a long one, a short one)
     br_bldg_rock_altar         the altar stone left standing when the hall was cut, its back on the wall under the
                                Deep Root's relief

   Every one stands against a wall as the other rock-cut pieces do (its back at z = -d/2, the face embed metres in front
   of it; {wallR} wraps a curved wall).
   ====================================================================== */

/* the five nature shrines (LORE.md 6.6), in the lore's order: variant n of the lamp niche; each one's sign (brrSign) and
   its paint */
const BRR_SHRINES = [
  { key: 'bough', name: 'First Bough', paint: 0x4f7a34, glow: 'flame' },
  { key: 'rain', name: 'Rain Mother', paint: 0x3a6a78, glow: 'cool' },
  { key: 'wing', name: 'Winged Ones', paint: 0xb08432, glow: 'flame' },
  { key: 'root', name: 'Deep Root', paint: 0x9a4a2a, glow: 'ember' },
  { key: 'silence', name: 'Green Silence', paint: 0x2e5a2c, glow: 'coolDim' }];
BRR_SHRINES.forEach(function (S) { S.lin = brmLin(S.paint); });
/* a shrine's sign in relief, s its height, in the frame G at (a, y) on its face c: the bough a sapling, the rain a drop
   over three falling lines, the wing a fan of feathers, the root a branching root, the silence a closed eye over a leaf */
function brrSign(G, k, a, y, c, s, col, paint) {
  const T = function (P, r0, r1, cl) { G.tube(brrCurve(P.map(function (p) { return [a + p[0] * s, y + p[1] * s, c + p[2] * s]; }), 3), function (t) { return (r0 + (r1 - r0) * t) * s; }, cl, BRR_STONE); };
  const E = function (x, yy, z, rx, ry, rz, cl) { G.ell(a + x * s, y + yy * s, c + z * s, rx * s, ry * s, rz * s, 0, cl, BRR_STONE); };
  if (k === 'bough') {
    T([[0, -0.45, 0.04], [0.02, -0.1, 0.06], [0, 0.2, 0.06]], 0.06, 0.03, col);
    for (const m of [-1, 1]) { T([[0, 0.0, 0.06], [m * 0.2, 0.15, 0.06], [m * 0.32, 0.3, 0.05]], 0.03, 0.012, col); E(m * 0.33, 0.33, 0.07, 0.1, 0.07, 0.04, paint); E(m * 0.18, 0.12, 0.08, 0.08, 0.06, 0.04, paint); }
    E(0, 0.34, 0.08, 0.1, 0.12, 0.05, paint);
  } else if (k === 'rain') {
    E(0, 0.22, 0.06, 0.13, 0.15, 0.06, paint); G.cone(a, y + 0.3 * s, c + 0.06 * s, 0.09 * s, 0.18 * s, 0, paint, BRR_STONE);
    for (let i = -1; i <= 1; i++) { const P = []; for (let k2 = 0; k2 <= 5; k2++) P.push([i * 0.16 + (k2 % 2 ? 0.04 : -0.04), 0.02 - k2 * 0.09, 0.05]); T(P, 0.02, 0.012, col); }
  } else if (k === 'wing') {
    for (let i = 0; i < 6; i++) { const t = -1.1 + i * 0.44; T([[0, -0.2, 0.05], [Math.sin(t) * 0.25, -0.2 + Math.cos(t) * 0.25, 0.07], [Math.sin(t) * 0.5, -0.2 + Math.cos(t) * 0.5, 0.05]], 0.05, 0.015, i % 2 ? paint : col); }
    E(0, -0.22, 0.07, 0.07, 0.07, 0.05, col);
  } else if (k === 'root') {
    T([[0, 0.45, 0.05], [0.03, 0.15, 0.07], [0, -0.1, 0.07]], 0.07, 0.04, col);
    for (const m of [-1, 1]) { T([[0, -0.08, 0.07], [m * 0.15, -0.25, 0.06], [m * 0.3, -0.45, 0.04]], 0.04, 0.012, paint); T([[0, 0.12, 0.07], [m * 0.18, 0.0, 0.06], [m * 0.36, -0.12, 0.04]], 0.03, 0.01, col); }
    T([[0, -0.1, 0.07], [0.02, -0.3, 0.06], [-0.02, -0.5, 0.04]], 0.04, 0.012, paint);
  } else {
    T([[-0.3, 0.12, 0.05], [0, 0.0, 0.08], [0.3, 0.12, 0.05]], 0.03, 0.03, col);
    T([[-0.22, 0.14, 0.06], [0, 0.22, 0.07], [0.22, 0.14, 0.06]], 0.015, 0.015, col);
    E(0, -0.22, 0.06, 0.12, 0.2, 0.04, paint);
    T([[0, -0.4, 0.08], [0, -0.04, 0.09]], 0.012, 0.012, shade(paint, -0.3));
  }
}

/* ==== 1. the carved face round the cavern's door
   (PLAN.md: "a carved face (the tribes' beasts under the claw) round the door"; all twelve, owner 2026-10-19): three
   broad steps cut before it; the door in three receding orders, the inmost red and gilt, the dark of the passage and
   the glow of the hall's lamps beyond it, its leaves folded back; an arch of twelve roundels round it, each a tribe's
   beast on its ring of the tribe's colour, in LORE.md's order from the left springing over to the right; the claw
   over them all, a great green relief edged in gilt; the Deep Root's roots let down from the rock above, spreading
   over the face and down the pilasters to the ground; lamp niches either side of the door, braziers on the steps,
   offerings on the threshold. */
function brrCavernDoor(F) {
  const K = brrK(F), col = BRR.dressed, hw = 7.4, top = brrTop(K, 0.9), yd = 0.54, ow = 3.0, ys = yd + 3.5, Rb = 5.45;
  brrPanel(K, -hw, hw, 0, top, 0.08);
  brrRim(K, -hw, hw, 0, top, 0.9, 1.35, 'lrt');
  /* the steps */
  K.slab(-3.9, 3.9, 0, 0.18, -K.e, 2.65, shade(col, -0.14), BRR_STONE);
  K.slab(-3.5, 3.5, 0.18, 0.18, -K.e, 2.05, shade(col, -0.1), BRR_STONE);
  K.slab(-3.1, 3.1, 0.36, 0.18, -K.e, 1.45, shade(col, -0.06), BRR_STONE);
  /* the band the roundels stand on: a sunk arc of darker stone from the outer order to beyond the roundels */
  const arcSlices = function (r0, r1, yC, n0, n1, cl, step) {
    const ns = Math.max(8, Math.round(2 * r1 / (step || 0.3)));
    for (let i = 0; i < ns; i++) {
      const u0 = -r1 + 2 * r1 * i / ns, u1 = -r1 + 2 * r1 * (i + 1) / ns, um = (u0 + u1) / 2;
      const yo = yC + Math.sqrt(Math.max(0, r1 * r1 - um * um)), yi = Math.abs(um) < r0 ? yC + Math.sqrt(r0 * r0 - um * um) : yC;
      if (yo - yi > 0.02) K.slab(u0, u1, yi, yo - yi, n0, n1, typeof cl === 'function' ? cl(i) : cl, BRR_STONE);
    }
  };
  arcSlices(2.9, Rb + 0.9, ys, -K.e, 0.22, shade(col, -0.24), 0.16);
  const A = K.gn(0, 0.22), arc = function (r) { const P = []; for (let i = 0; i <= 48; i++) { const a = Math.PI * i / 48; P.push([Math.cos(a) * r, ys + Math.sin(a) * r, 0]); } P.unshift([-r, yd, 0]); P.push([r, yd, 0]); return P; };
  A.tube(arc(Rb + 0.97), 0.075, BRM.red, BRR_STONE, { seg: 6 });
  A.tube(arc(Rb + 1.1), 0.04, BRM.gilt, BRR_STONE, { seg: 6 });
  for (const m of [-1, 1]) K.slab(m > 0 ? 2.9 : -(Rb + 0.9), m > 0 ? Rb + 0.9 : -2.9, yd, ys - yd, -K.e, 0.22, shade(col, -0.24), BRR_STONE);
  /* the door: three orders, each a jamb pair and an arch ring, receding to the opening */
  const orders = [[1.5, 1.95, 0.6, BRM.red], [1.95, 2.4, 0.86, shade(col, 0.04)], [2.4, 2.9, 1.12, shade(col, 0.08)]];
  orders.forEach(function (o, k) {
    for (const m of [-1, 1]) K.slab(m > 0 ? o[0] : -o[1], m > 0 ? o[1] : -o[0], yd, ys - yd, -K.e, o[2], o[3], BRR_STONE);
    arcSlices(o[0], o[1], ys, -K.e, o[2], k === 0 ? function (i) { return i % 2 ? BRM.red : BRM.deep; } : o[3], 0.1);
    if (k === 0) for (const m of [-1, 1]) K.slab(m > 0 ? o[0] - 0.04 : -o[0], m > 0 ? o[0] : -o[0] + 0.04, yd, ys - yd, -K.e, o[2] + 0.02, BRM.gilt, BRR_STONE);
  });
  /* the passage: dark, the hall's glow far in, the leaves folded back against the inmost order */
  K.slab(-1.5, 1.5, yd, ys - yd + 1.5, -K.e, 0.1, BRR.void, BRR_STONE);
  const Gd = K.g(0);
  Gd.box(0, yd + 0.6, 0.11, 1.2, 1.9, 0.01, 0, BRR_GLOW.dim, 'glow');
  Gd.ell(0, yd + 2.55, 0.115, 0.6, 0.55, 0.01, 0, BRR_GLOW.dim, 'glow');
  for (const m of [-1, 1]) {
    const L = K.g(m * 1.38, m * 1.25);
    L.box(0, yd, 0.5, 0.1, 3.3, 1.0, 0, shade(BRM.timber[2], -0.2), BRM_TIMBER);
    for (let b = 0; b < 3; b++) L.box(m * 0.06, yd + 0.4 + b * 1.2, 0.5, 0.03, 0.12, 1.0, 0, BRR.iron, 'metal');
  }
  /* the twelve roundels, LORE.md's order from the left springing over the top to the right */
  for (let i = 0; i < 12; i++) {
    const th = Math.PI - (i + 0.5) * Math.PI / 12, u = Math.cos(th) * Rb, yy = ys + Math.sin(th) * Rb, t = BRR_TRIBES[i], TC = BRR_TRIBE[t].lin;
    brrBeastPanel(K.gn(u, 0.22), t, 0, yy, 0.74, 'round', BRR.reliefPale, { ring: TC[0], accent: TC[1], ground: shade(BRR.shadow, 0.1), depth: 2.2 });
  }
  /* the claw over them all, on its boss */
  const yc = ys + Rb + 2.0, C = K.gn(0, 0.22);
  C.ell(0, yc, 0, 1.55, 1.45, 0.22, 0, shade(BRR.shadow, 0.15), BRR_STONE);
  C.ell(0, yc, -0.06, 1.66, 1.56, 0.22, 0, BRM.gilt, BRR_STONE);
  brrClaw(C, 0, yc, 0.16, 2.5, BRR.green, BRM.gilt);
  /* the Deep Root's roots: let down from the rock above, over the face, down the pilasters to the ground */
  const R = K.gn(0, 0.08), rc = shade(BRR.relief, -0.28);
  for (const m of [-1, 1]) {
    for (let j = 0; j < 4; j++) {
      const x0 = m * (1.8 + j * 0.6), x1 = m * (6.85 + (j - 1.5) * 0.16), P = [[x0, top + 0.2, 0.05], [m * (3.2 + j * 0.85), top - 0.3 - j * 0.22, 0.1]];
      P.push([x1 + m * 0.1, ys + 2.0 - j * 0.3, 0.12]); P.push([x1 - m * 0.15, ys - 0.6, 0.12]); P.push([x1 + m * 0.12, 1.6, 0.1]); P.push([x1 + m * (0.25 + j * 0.12), 0.05, 0.06]);
      R.tube(brrCurve(P, 5), function (tt) { return 0.17 - 0.1 * tt; }, j % 2 ? rc : shade(rc, 0.08), BRR_STONE);
    }
    for (let j = 0; j < 3; j++) R.tube(brrCurve([[m * (6.85 + j * 0.12), 0.9 - j * 0.2, 0.12], [m * (7.05 + j * 0.12), 0.4 - j * 0.1, 0.1], [m * (7.2 + j * 0.06), 0.04, 0.06]], 3), function (tt) { return 0.08 - 0.05 * tt; }, rc, BRR_STONE);
  }
  /* lamp niches either side of the door, braziers on the steps, offerings on the threshold */
  for (const m of [-1, 1]) {
    const N = K.gn(m * 3.55, 0.22);
    N.box(0, yd + 1.6, -0.12, 0.55, 0.75, 0.24, 0, BRR.void, BRR_STONE);
    N.box(0, yd + 1.5, 0.02, 0.7, 0.1, 0.18, 0, shade(col, 0.08), BRR_STONE);
    N.box(0, yd + 2.4, 0.0, 0.7, 0.12, 0.16, 0, shade(col, 0.08), BRR_STONE);
    brrLamp(N, 0, yd + 1.62, 0.0, 1.3);
    K.furn('br_h_post_brazier', m * 2.75, 0.36, 1.85, 0);
  }
  const T = K.g(0);
  for (let i = 0; i < 9; i++) T.ball(-1.0 + i * 0.25, yd + 0.05, 1.1 + (i % 2) * 0.12, 0.06, i % 3 === 0 ? BRR.flower : (i % 3 === 1 ? BRR.fruit : BRR.ochre), BRR_STONE);
  F.furn('br_h_offering_bowl', K.at(-0.6, 0.9)[0], yd, K.at(-0.6, 0.9)[1], K.at(-0.6, 0.9)[2], { v: 0 });
  F.furn('br_h_offering_bowl', K.at(0.6, 0.9)[0], yd, K.at(0.6, 0.9)[1], K.at(0.6, 0.9)[2], { v: 1 });
}
ASSET({
  key: 'br_bldg_rock_cavern_door', name: "The Deep Root cavern's carved door", culture: 'beast-rider',
  family: 'religious', types: ['religious'], districts: ['ridertown'], wealth: [0.5, 1],
  w: 16.9, d: 3.2, h: 14.8, variants: 1,
  build: function (F) { brrCavernDoor(F); }
});

/* ==== 2. a tribe's offering niche (one variant a tribe)
   In the passage of the tribes, a niche per tribe: an arched niche over a sill block, its back painted the tribe's
   first colour, the tribe's beast cut on it, its name band on the sill, a hanging of its colours drawn aside on a rod,
   a lamp, and what its people bring (brrOfferings). Variant n is BRR_TRIBES[n]; opt tribe overrides. */
function brrOfferings(G, t, y, c) {
  const S = BRR_STONE, TC = BRR_TRIBE[t].lin;
  const leaf = function (a, cc, r) { G.ell(a, y + 0.012, cc, r, 0.012, r * 0.55, 0.3, BRR.leaf, S); };
  if (t === 'quetzal') {
    G.frustum(-0.32, y, c, 0.09, 0.12, 0.3, 0, BRR.clay, S, 10);
    for (let i = 0; i < 5; i++) { const a = -0.32 + (i - 2) * 0.03; G.tube(brrCurve([[a, y + 0.25, c], [a + (i - 2) * 0.05, y + 0.6, c + 0.02], [a + (i - 2) * 0.1, y + 0.9, c - 0.02]], 3), function (tt) { return 0.012 + 0.02 * Math.sin(Math.PI * tt); }, i % 2 ? TC[1] : BRR.feather, S); }
    leaf(0.2, c, 0.22); G.ell(0.2, y + 0.06, c, 0.17, 0.045, 0.06, 0.2, BRR.white, S); G.cone(0.38, y + 0.03, c, 0.05, 0.06, 0, BRR.white, S);
  } else if (t === 'wingclaw') {
    G.tube(brrCurve([[-0.18, y + 0.04, c], [-0.05, y + 0.06, c + 0.13], [0.08, y + 0.04, c], [-0.05, y + 0.06, c - 0.13], [-0.18, y + 0.04, c]], 4), 0.04, BRM.straw, S);
    G.ell(-0.05, y + 0.12, c, 0.08, 0.11, 0.08, 0, BRR.white, S);
    for (let i = 0; i < 3; i++) G.tube(brrCurve([[0.2 + i * 0.07, y + 0.02, c - 0.1], [0.24 + i * 0.07, y + 0.03, c + 0.05], [0.28 + i * 0.07, y + 0.02, c + 0.18]], 3), function (tt) { return 0.008 + 0.018 * Math.sin(Math.PI * tt); }, i % 2 ? TC[0] : TC[1], S);
  } else if (t === 'dragonfly') {
    G.frustum(-0.18, y, c, 0.14, 0.2, 0.1, 0, BRR.clay, S, 12); G.cyl(-0.18, y + 0.08, c, 0.17, 0.02, 0, BRR.water, 'ceramic');
    for (let i = 0; i < 6; i++) G.rod(0.22 + (i % 3) * 0.05, y, c - 0.05 + Math.floor(i / 3) * 0.08, 0.2 + (i % 3) * 0.06, y + 0.55 + i * 0.04, c - 0.03 + Math.floor(i / 3) * 0.06, 0.008, BRR.leaf, S);
  } else if (t === 'nightwing') {
    leaf(0.0, c, 0.3);
    for (let i = 0; i < 7; i++) G.ball(-0.12 + (i % 4) * 0.08, y + 0.05 + Math.floor(i / 4) * 0.06, c + (i % 2 ? 0.05 : -0.04), 0.045, i % 3 ? BRR.fruit : BRR.flower, S);
    G.box(0.3, y, c, 0.18, 0.06, 0.22, 0.3, TC[0], 'cloth');
  } else if (t === 'spider') {
    for (let i = 0; i < 3; i++) G.ell(-0.25 + i * 0.13, y + 0.06, c, 0.06, 0.06, 0.1, 0, BRR.white, S);
    const W = brrG(G, 0.22, c, 0);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; W.rod(0, y + 0.3, 0, Math.cos(a) * 0.22, y + 0.3 + Math.sin(a) * 0.22, 0, 0.005, BRR.white, S); }
    for (const r of [0.08, 0.15, 0.21]) { const P = []; for (let k = 0; k <= 12; k++) { const a = k * Math.PI / 6; P.push([Math.cos(a) * r, y + 0.3 + Math.sin(a) * r, 0]); } W.tube(P, 0.004, BRR.white, S); }
    W.rod(0, y, 0, 0, y + 0.08, 0, 0.01, BRM.timber[2], BRM_TIMBER);
  } else if (t === 'raptor') {
    G.tube([[-0.3, y + 0.04, c], [0.0, y + 0.04, c + 0.02]], 0.025, BRR.bone, S); G.ball(-0.31, y + 0.04, c, 0.045, BRR.bone, S); G.ball(0.01, y + 0.04, c + 0.02, 0.045, BRR.bone, S);
    const P = []; for (let k = 0; k <= 12; k++) { const a = k * Math.PI / 6; P.push([0.22 + Math.cos(a) * 0.12, y + 0.02, c + Math.sin(a) * 0.09]); }
    G.tube(P, 0.008, TC[1], S);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; G.cone(0.22 + Math.cos(a) * 0.12, y + 0.02, c + Math.sin(a) * 0.09, 0.015, 0.06, 0, BRR.bone, S); }
  } else if (t === 'staghorn') {
    G.frustum(-0.22, y, c, 0.1, 0.08, 0.16, 0, BRR.honey, S, 10); G.cyl(-0.22, y + 0.16, c, 0.085, 0.02, 0, shade(BRR.honey, 0.2), 'ceramic');
    for (let i = 0; i < 3; i++) G.tube([[0.08, y + 0.04 + i * 0.06, c - 0.12 + i * 0.03], [0.4, y + 0.04 + i * 0.06, c + 0.06 - i * 0.03]], 0.035, shade(BRR.seed, i * 0.08), S);
  } else if (t === 'threehorn') {
    for (const m of [-1, 1]) G.tube(brrCurve([[-0.05, y + 0.02, c], [m * 0.2 - 0.05, y + 0.12, c + 0.05], [m * 0.3 - 0.05, y + 0.25, c], [m * 0.24 - 0.05, y + 0.32, c - 0.02]], 3), 0.015, BRR.leaf, S);
    G.tube(brrCurve([[0.12, y + 0.04, c], [0.3, y + 0.1, c + 0.04], [0.42, y + 0.28, c + 0.02]], 3), function (tt) { return 0.06 - 0.055 * tt; }, BRR.bone, S);
  } else if (t === 'hardshell') {
    for (let i = 0; i < 5; i++) G.ell(-0.3 + i * 0.1, y + 0.03, c + (i % 2 ? 0.06 : -0.04), 0.05, 0.03, 0.04, i, shade(BRR.rock[3], -0.2 + i * 0.05), S);
    G.dome(0.25, y, c, 0.16, 0.1, 0, TC[1], S);
  } else if (t === 'tiger') {
    G.box(-0.14, y, c, 0.42, 0.04, 0.3, 0.1, TC[0], 'hide');
    for (let i = 0; i < 4; i++) G.box(-0.3 + i * 0.1, y + 0.035, c, 0.025, 0.012, 0.3, 0.1, TC[1], 'hide');
    leaf(0.26, c, 0.16); G.ell(0.26, y + 0.06, c, 0.11, 0.05, 0.07, 0, BRR.flower, S);
  } else if (t === 'mammoth') {
    for (const m of [-1, 1]) G.tube(brrCurve([[-0.35, y + 0.03, c + m * 0.06], [-0.05, y + 0.06, c + m * 0.1], [0.12, y + 0.18, c + m * 0.06]], 3), function (tt) { return 0.035 - 0.028 * tt; }, BRR_TRIBE.mammoth.lin[1], S);
    G.cyl(0.3, y, c, 0.08, 0.32, 0, BRM.straw, 'straw/cloth'); G.cyl(0.3, y + 0.14, c, 0.085, 0.04, 0, BRM.rope, 'rope');
  } else {
    for (let i = 0; i < 6; i++) G.ell(-0.32 + i * 0.09, y + 0.01, c + (i % 2 ? 0.05 : -0.05), 0.07, 0.01, 0.04, i * 0.7, i % 2 ? BRR.seed : BRR.moss, S);
    const P = []; for (let k = 0; k <= 20; k++) { const a = k * 0.55, r = 0.03 + k * 0.006; P.push([0.24 + Math.cos(a) * r, y + 0.03, c + Math.sin(a) * r]); }
    G.tube(P, 0.022, TC[1], S);
  }
}
function brrTribeNiche(F) {
  const K = brrK(F), t = brrTribe(K.tribe == null ? F.variant : K.tribe), Tr = BRR_TRIBE[t], TC = Tr.lin, col = BRR.dressed;
  const hw = 0.95, top = brrTop(K, 0.45), ys = 0.85;
  brrPanel(K, -hw, hw, 0, top, 0.06);
  brrRim(K, -hw, hw, 0, top, 0.45, 0.72, 'lrt');
  /* the sill block, its name band in the tribe's colours */
  K.slab(-0.9, 0.9, 0, ys - 0.1, -K.e, 0.66, shade(col, -0.08), BRR_STONE);
  K.slab(-0.95, 0.95, ys - 0.1, 0.1, -K.e, 0.72, shade(col, 0.08), BRR_STONE);
  K.slab(-0.82, 0.82, 0.35, 0.22, 0.66, 0.68, TC[0], BRR_STONE);
  K.slab(-0.82, 0.82, 0.32, 0.03, 0.66, 0.685, BRM.gilt, BRR_STONE);
  K.slab(-0.82, 0.82, 0.57, 0.03, 0.66, 0.685, BRM.gilt, BRR_STONE);
  for (let i = 0; i < 7; i++) K.g(-0.6 + i * 0.2).box(0, 0.41, 0.685, 0.06, 0.1, 0.02, 0, TC[1], BRR_STONE);
  /* the niche: its back the tribe's colour, the beast cut on it */
  const P = brrPortal(K, { u: 0, y: ys, W: 1.75, H: 2.0, jw: 0.26, arched: true, rise: 0.55, nP: 0.06, nS: 0.62, plinth: 0.0, headH: 0.32, recess: shade(TC[0], -0.25) });
  brrBeast(K.gn(0, 0.06), t, 0.55, ys + 1.12, BRR.relief, { accent: TC[1], depth: 2.0 });
  /* the hanging, drawn aside on its rod */
  const H = K.g(0);
  H.rod(-0.8, P.yHead - 0.3, 0.66, 0.8, P.yHead - 0.3, 0.66, 0.025, BRM.timber[2], BRM_TIMBER);
  H.box(-0.68, ys + 0.25, 0.68, 0.22, P.yHead - 0.55 - ys, 0.05, 0, TC[0], 'cloth');
  H.box(-0.68, ys + 0.6, 0.71, 0.24, 0.07, 0.03, 0, TC[1], 'cloth');
  H.box(0, P.yHead - 0.6, 0.68, 1.5, 0.28, 0.04, 0, TC[0], 'cloth');
  H.box(0, P.yHead - 0.55, 0.705, 1.5, 0.05, 0.02, 0, TC[1], 'cloth');
  /* the lamp and the offerings on the sill */
  brrLamp(K.gn(0.58, 0.3), 0, ys, 0, 1.1);
  brrOfferings(K.gn(-0.05, 0.38), t, ys, 0);
  void P;
}
ASSET({
  key: 'br_bldg_rock_tribe_niche', name: "A tribe's offering niche (the passage of the tribes)", culture: 'beast-rider',
  family: 'religious', types: ['religious'], districts: ['ridertown'], wealth: [0.3, 1],
  w: 3.0, d: 1.4, h: 3.9, variants: BRR_TRIBES.length, variantNames: BRR_TRIBES.map(function (t) { return BRR_TRIBE[t].name + ' (' + BRR_TRIBE[t].beast + ')'; }),
  build: function (F) { brrTribeNiche(F); }
});

/* ==== 3. the five shrines' lamp niches (one each)
   v0 First Bough: a tree carved out of the niche's back, its boughs over the head, the lamp in a fork, green boughs and
   fruit laid on the sill. v1 Rain Mother: her face in the niche, her hair falling as rain, a runnel to a basin on the
   sill where the lamp floats in a shell, shells and bowls of water. v2 Winged Ones: two great wings spread across the
   niche holding the lamp up between them, a bird's head for keystone, feathers in a jar, an egg. v3 Deep Root: roots
   let down from the head into a black pool on the sill, the lamp an ember in a hollow of roots, a bowl of earth, seed.
   v4 Green Silence: a square niche, plain; moss on its back, a closed-eyed face with a leaf over its mouth, the lamp
   under a pierced cover, a folded cloth, one stone. */
function brrLampNiche(F) {
  const K = brrK(F), S = BRR_SHRINES[F.variant] || BRR_SHRINES[0], col = BRR.dressed, hw = 1.0, top = brrTop(K, 0.45), ys = 0.9, PT = S.lin;
  brrPanel(K, -hw, hw, 0, top, 0.06);
  brrRim(K, -hw, hw, 0, top, 0.45, 0.75, 'lrt');
  K.slab(-0.95, 0.95, 0, ys - 0.1, -K.e, 0.66, shade(col, -0.08), BRR_STONE);
  K.slab(-1.0, 1.0, ys - 0.1, 0.1, -K.e, 0.74, shade(col, 0.08), BRR_STONE);
  brrSign(K.gn(0, 0.66), S.key, 0, ys * 0.45, 0, 0.55, BRR.relief, PT);
  const sq = S.key === 'silence';
  const P = brrPortal(K, { u: 0, y: ys, W: 1.85, H: sq ? 1.75 : 2.0, jw: 0.28, arched: !sq, rise: 0.55, nP: 0.06, nS: 0.62, plinth: 0.0, headH: 0.32,
    recess: sq ? BRR.greenDeep : shade(col, -0.3), band: !sq, keystone: S.key !== 'wing' });
  const N = K.gn(0, 0.06), y0 = ys, rc = BRR.relief;
  const lampAt = function (G, a, y, c, s) { if (S.glow === 'coolDim') { brrLamp(G, a, y, c, s, true); G.dome(a, y + 0.06 * s, c, 0.1 * s, 0.14 * s, 0, BRR.iron, 'metal'); } else { G.frustum(a, y, c, 0.07 * s, 0.13 * s, 0.07 * s, 0, BRR.clay, BRR_STONE, 10); G.cone(a, y + 0.07 * s, c, 0.05 * s, 0.16 * s, 0, BRR_GLOW[S.glow], 'glow'); } };
  if (S.key === 'bough') {
    N.tube(brrCurve([[0, y0, 0.08], [0.03, y0 + 0.6, 0.12], [-0.02, y0 + 1.2, 0.12], [0, y0 + 1.6, 0.1]], 4), function (t) { return 0.13 - 0.07 * t; }, rc, BRR_STONE);
    for (const m of [-1, 1]) for (let j = 0; j < 3; j++) {
      const yb = y0 + 0.8 + j * 0.35, P2 = [[0, yb, 0.12], [m * (0.3 + j * 0.05), yb + 0.2, 0.1], [m * (0.6 + j * 0.15), yb + 0.42 + j * 0.15, 0.07]];
      if (j === 2) P2.push([m * 0.98, P.yTop + 0.25, 0.62]);
      N.tube(brrCurve(P2, 3), function (t) { return 0.05 - 0.035 * t; }, rc, BRR_STONE);
      for (let k = 0; k < 3; k++) N.ell(m * (0.25 + j * 0.05 + k * 0.17), yb + 0.18 + k * 0.12 + j * 0.03, 0.14, 0.09, 0.05, 0.04, 0, k % 2 ? PT : shade(PT, 0.12), BRR_STONE);
    }
    N.ell(0, y0 + 1.7, 0.12, 0.22, 0.14, 0.06, 0, PT, BRR_STONE);
    N.box(0.0, y0 + 0.98, 0.2, 0.2, 0.06, 0.16, 0, rc, BRR_STONE);
    lampAt(N, 0, y0 + 1.04, 0.2, 1);
    for (let i = 0; i < 3; i++) N.tube([[-0.55 + i * 0.08, y0 + 0.03, 0.45], [-0.1 + i * 0.05, y0 + 0.04, 0.28]], 0.015, BRR.leaf, BRR_STONE);
    for (let i = 0; i < 5; i++) N.ball(0.25 + (i % 3) * 0.09, y0 + 0.05 + Math.floor(i / 3) * 0.07, 0.38, 0.045, BRR.fruit, BRR_STONE);
  } else if (S.key === 'rain') {
    brrRainFace(N, 0, y0 + 1.35, 0.02, 0.85, rc, PT);
    N.box(0, y0 + 0.2, 0.12, 0.08, 0.5, 0.04, 0, shade(BRR.water, 0.25), 'ceramic');
    N.frustum(0, y0, 0.32, 0.22, 0.26, 0.12, 0, shade(col, 0.06), BRR_STONE, 12);
    N.cyl(0, y0 + 0.1, 0.32, 0.23, 0.02, 0, BRR.water, 'ceramic');
    N.dome(0, y0 + 0.12, 0.32, 0.08, 0.04, 0, BRR.white, BRR_STONE);
    N.cone(0, y0 + 0.15, 0.32, 0.03, 0.09, 0, BRR_GLOW.cool, 'glow');
    for (const m of [-1, 1]) { N.dome(m * 0.55, y0, 0.4, 0.07, 0.05, 0, BRR.white, BRR_STONE); N.cyl(m * 0.42, y0, 0.25, 0.09, 0.07, 0, BRR.clay, BRR_STONE); N.cyl(m * 0.42, y0 + 0.06, 0.25, 0.08, 0.015, 0, BRR.water, 'ceramic'); }
  } else if (S.key === 'wing') {
    for (const m of [-1, 1]) for (let i = 0; i < 7; i++) {
      const a = -0.25 + i * 0.22, L = 0.45 + i * 0.07;
      N.tube(brrCurve([[m * 0.12, y0 + 0.75, 0.1], [m * (0.12 + Math.cos(a) * L * 0.5), y0 + 0.75 + Math.sin(a) * L * 0.5, 0.13], [m * (0.12 + Math.cos(a) * L), y0 + 0.75 + Math.sin(a) * L, 0.1]], 3), function (t) { return 0.02 + 0.045 * Math.sin(Math.PI * Math.min(1, t * 1.2)); }, i % 2 ? PT : rc, BRR_STONE);
    }
    N.ell(0, y0 + 0.78, 0.12, 0.12, 0.16, 0.08, 0, rc, BRR_STONE);
    N.box(0, y0 + 0.92, 0.18, 0.24, 0.05, 0.18, 0, BRM.gilt, BRR_STONE);
    lampAt(N, 0, y0 + 0.97, 0.18, 1.1);
    brrBeast(K.gn(0, 0.62), 'quetzal', 0.3, P.yHead + 0.08, rc, { accent: PT, depth: 2.4 });
    N.frustum(-0.5, y0, 0.32, 0.07, 0.1, 0.28, 0, BRR.clay, BRR_STONE, 10);
    for (let i = 0; i < 4; i++) N.tube(brrCurve([[-0.5 + (i - 1.5) * 0.02, y0 + 0.25, 0.32], [-0.5 + (i - 1.5) * 0.08, y0 + 0.6, 0.33]], 2), function (t) { return 0.01 + 0.02 * Math.sin(Math.PI * t); }, i % 2 ? PT : BRR.feather, BRR_STONE);
    N.ell(0.48, y0 + 0.09, 0.34, 0.07, 0.09, 0.07, 0, BRR.white, BRR_STONE);
  } else if (S.key === 'root') {
    for (let j = 0; j < 7; j++) {
      const a0 = -0.6 + j * 0.2;
      N.tube(brrCurve([[a0 * 0.8, P.yHead + 0.1, 0.12], [a0 * 0.9 + (j % 2 ? 0.08 : -0.08), y0 + 1.3, 0.14], [a0 * 0.6, y0 + 0.6, 0.18], [a0 * 0.3, y0 + 0.15, 0.3]], 4), function (t) { return 0.06 - 0.045 * t; }, j % 2 ? rc : PT, BRR_STONE);
    }
    N.cyl(0, y0, 0.3, 0.32, 0.03, 0, BRR.void, 'ceramic');
    N.cyl(0, y0, 0.3, 0.36, 0.02, 0, shade(col, -0.2), BRR_STONE);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; N.tube([[Math.cos(a) * 0.04, y0 + 0.04, 0.3 + Math.sin(a) * 0.04], [Math.cos(a) * 0.12, y0 + 0.16, 0.3 + Math.sin(a) * 0.12]], 0.02, rc, BRR_STONE); }
    N.cone(0, y0 + 0.04, 0.3, 0.05, 0.1, 0, BRR_GLOW.ember, 'glow');
    N.frustum(0.58, y0, 0.36, 0.08, 0.12, 0.08, 0, BRR.clay, BRR_STONE, 10); N.dome(0.58, y0 + 0.08, 0.36, 0.1, 0.05, 0, BRR.black, BRR_STONE);
    for (let i = 0; i < 6; i++) N.ball(-0.5 + i * 0.05, y0 + 0.02, 0.42 + (i % 2) * 0.04, 0.02, BRR.seed, BRR_STONE);
  } else {
    for (let i = 0; i < 9; i++) N.ell(-0.55 + (i % 3) * 0.55 + (i > 5 ? 0.1 : 0), y0 + 0.3 + Math.floor(i / 3) * 0.5, 0.07, 0.26, 0.2, 0.03, 0, i % 2 ? BRR.moss : shade(BRR.moss, -0.15), BRR_STONE);
    N.ell(0, y0 + 1.05, 0.12, 0.24, 0.32, 0.08, 0, rc, BRR_STONE);
    for (const m of [-1, 1]) N.tube(brrCurve([[m * 0.15, y0 + 1.12, 0.19], [m * 0.09, y0 + 1.09, 0.2], [m * 0.03, y0 + 1.12, 0.19]], 2), 0.012, BRR.shadow, BRR_STONE);
    N.ell(0, y0 + 0.86, 0.2, 0.13, 0.08, 0.03, 0, PT, BRR_STONE);
    N.tube([[0, y0 + 0.8, 0.22], [0, y0 + 0.93, 0.22]], 0.008, shade(PT, -0.3), BRR_STONE);
    lampAt(N, -0.45, y0, 0.32, 1.1);
    N.box(0.35, y0, 0.34, 0.36, 0.05, 0.26, 0.15, PT, 'cloth');
    N.ell(0.36, y0 + 0.09, 0.34, 0.06, 0.04, 0.05, 0, BRR.rock[3], BRR_RAW);
  }
}
ASSET({
  key: 'br_bldg_rock_lamp_niche', name: "A nature shrine's lamp niche", culture: 'beast-rider',
  family: 'religious', types: ['religious'], districts: ['ridertown'], wealth: [0.3, 1],
  w: 3.1, d: 1.4, h: 4.0, variants: BRR_SHRINES.length, variantNames: BRR_SHRINES.map(function (S) { return S.name; }),
  build: function (F) { brrLampNiche(F); }
});

/* ==== 4. a ledge of offerings
   A shelf left standing in the wall at 1 m, the wall cut back under it, a frieze of roots along its edge; on it, rows
   of what the five shrines and the twelve tribes are brought (bowls, gourds, flowers, feathers, a skull, little
   figures, folded cloths in the tribes' colours, stones, lamps); above it the hands of the givers printed in ochre;
   strings of beads and feathers hung from its edge. v0 a long ledge (6 m), v1 a short one (3 m). */
function brrLedgePiece(F, v) {
  const K = brrK(F), col = BRR.dressed, L = v === 1 ? 3.0 : 6.0, hl = L / 2, yl = 1.0, top = brrTop(K, 0.4);
  brrPanel(K, -hl - 0.1, hl + 0.1, 0, top, 0.06);
  brrRim(K, -hl - 0.1, hl + 0.1, 0, top, 0.4, 0.6, 'lrt');
  K.slab(-hl, hl, 0, yl - 0.14, -K.e, 0.3, shade(col, -0.2), BRR_STONE);
  K.slab(-hl, hl, yl - 0.14, 0.14, -K.e, 0.78, shade(col, 0.06), BRR_STONE);
  K.slab(-hl - 0.05, hl + 0.05, yl - 0.24, 0.1, 0.3, 0.72, shade(col, -0.06), BRR_STONE);
  const R = K.gn(0, 0.78), P = [];
  for (let i = 0; i <= Math.round(L * 3); i++) { const a = -hl + 0.05 + (L - 0.1) * i / Math.round(L * 3); P.push([a, yl - 0.07 + (i % 2 ? 0.035 : -0.035), 0.02]); }
  R.tube(brrCurve(P, 2), 0.035, shade(BRR.relief, -0.25), BRR_STONE);
  /* the givers' hands above */
  const H = K.gn(0, 0.06), nh = Math.round(L * 2.2);
  for (let i = 0; i < nh; i++) {
    const a = -hl + 0.25 + F.rr(0, L - 0.5), y = yl + 0.9 + F.rr(0, top - yl - 1.4), r = F.rr(-0.4, 0.4), c = F.chance(0.7) ? BRR.ochre : BRM.red, s = F.rr(0.85, 1.1);
    H.ell(a, y, 0.005, 0.055 * s, 0.065 * s, 0.006, 0, c, BRR_STONE);
    for (let k = 0; k < 5; k++) { const fa = r + (k - 2) * 0.32 + (k === 0 ? -0.35 : 0), fl = (k === 0 ? 0.06 : 0.09) * s; H.tube([[a + Math.sin(fa) * 0.05 * s, y + Math.cos(fa) * 0.05 * s, 0.006], [a + Math.sin(fa) * (0.05 * s + fl), y + Math.cos(fa) * (0.05 * s + fl), 0.006]], 0.012 * s, c, BRR_STONE); }
  }
  /* the offerings, by slot along the ledge */
  const G = K.gn(0, 0.38), ns = Math.round(L / 0.42);
  for (let i = 0; i < ns; i++) {
    const a = -hl + 0.25 + (L - 0.5) * i / Math.max(1, ns - 1), k = (i * 7 + (v === 1 ? 3 : 0)) % 9, cc = F.rr(-0.12, 0.12);
    if (k === 0) G.frustum(a, yl, cc, 0.11, 0.15, 0.09, 0, BRR.clay, BRR_STONE, 12);
    else if (k === 1) { G.ell(a, yl + 0.13, cc, 0.1, 0.13, 0.1, 0, BRR.ochre, BRR_STONE); G.cyl(a, yl + 0.24, cc, 0.03, 0.1, 0, BRM.timber[2], BRR_STONE); }
    else if (k === 2) for (let j = 0; j < 4; j++) G.ball(a + (j % 2) * 0.08 - 0.04, yl + 0.05 + Math.floor(j / 2) * 0.06, cc, 0.045, j % 2 ? BRR.flower : BRR.fruit, BRR_STONE);
    else if (k === 3) { G.ball(a, yl + 0.12, cc, 0.12, BRR.bone, BRR_STONE); G.box(a, yl, cc + 0.05, 0.14, 0.06, 0.1, 0, shade(BRR.bone, -0.1), BRR_STONE); for (const m of [-1, 1]) G.ball(a + m * 0.045, yl + 0.13, cc + 0.1, 0.03, BRR.shadow, BRR_STONE); }
    else if (k === 4) brrIdol(G, a, yl, cc, 0.4, BRR.relief, BRR_TRIBE[BRR_TRIBES[i % 12]].lin[0]);
    else if (k === 5) { const t = BRR_TRIBES[(i * 5) % 12]; G.box(a, yl, cc, 0.3, 0.07, 0.22, F.rr(-0.3, 0.3), BRR_TRIBE[t].lin[0], 'cloth'); G.box(a, yl + 0.07, cc, 0.24, 0.05, 0.18, F.rr(-0.3, 0.3), BRR_TRIBE[t].lin[1], 'cloth'); }
    else if (k === 6) { brrLamp(G, a, yl, cc, 1.1); }
    else if (k === 7) { G.frustum(a, yl, cc, 0.06, 0.08, 0.22, 0, BRR.clay, BRR_STONE, 8); for (let j = 0; j < 3; j++) G.tube([[a, yl + 0.2, cc], [a + (j - 1) * 0.08, yl + 0.55, cc + 0.02]], function (t) { return 0.01 + 0.02 * Math.sin(Math.PI * t); }, j === 1 ? BRR.feather : BRR_TRIBE.quetzal.lin[1], BRR_STONE); }
    else for (let j = 0; j < 3; j++) G.ell(a + (j - 1) * 0.09, yl + 0.035, cc + (j % 2) * 0.05, 0.05, 0.035, 0.045, j, shade(BRR.rock[3], -0.15 + j * 0.08), BRR_STONE);
  }
  /* strings of beads and feathers hung from the edge */
  const S2 = K.gn(0, 0.74);
  for (let i = 0; i < Math.round(L / 0.8); i++) {
    const a = -hl + 0.4 + i * 0.8 + F.rr(-0.1, 0.1), dy = F.rr(0.35, 0.6);
    S2.rod(a, yl - 0.24, 0, a, yl - 0.24 - dy, 0, 0.006, BRM.rope, 'rope');
    for (let j = 0; j < 4; j++) S2.ball(a, yl - 0.3 - j * dy / 4, 0, 0.022, j % 2 ? BRM.gilt : BRR_TRIBE[BRR_TRIBES[(i + j) % 12]].lin[0], BRR_STONE);
    S2.tube([[a, yl - 0.24 - dy, 0], [a + 0.02, yl - 0.4 - dy, 0.01]], function (t) { return 0.008 + 0.02 * Math.sin(Math.PI * t); }, BRR.feather, BRR_STONE);
  }
}
ASSET({
  key: 'br_bldg_rock_offering_ledge', name: 'A ledge of offerings cut from the wall', culture: 'beast-rider',
  family: 'religious', types: ['religious'], districts: ['ridertown'], wealth: [0.3, 1],
  w: 7.2, d: 1.4, h: 3.4, variants: 2, variantNames: ['Long ledge (6 m)', 'Short ledge (3 m)'],
  variantDims: [{ w: 7.2, d: 1.4, h: 3.4 }, { w: 4.2, d: 1.4, h: 3.4 }],
  build: function (F) { brrLedgePiece(F, F.variant); }
});

/* ==== 5. the altar stone left standing
   A block of the mesa left standing when the hall was cut, against the wall: its sides raw (the beds still in them),
   its top dressed, its front cut with the five shrines' signs in five panels, on two steps; on it the fire bowl, lamps
   at its corners, bowls, a folded green cloth, ochre run down its front. Behind it on the wall, the Deep Root: roots
   pouring down from the top round a roundel with the claw, the five signs in roundels about it; two lamp stands. */
function brrAltarPiece(F) {
  const K = brrK(F), col = BRR.dressed, hw = 2.8, top = brrTop(K, 0.5);
  brrPanel(K, -hw, hw, 0, top, 0.08);
  brrRim(K, -hw, hw, 0, top, 0.5, 0.9, 'lrt');
  /* the reredos: the Deep Root on the wall */
  const Rr = K.gn(0, 0.08), rc = shade(BRR.relief, -0.22), yC = 4.3;
  Rr.ell(0, yC, 0.02, 0.9, 0.9, 0.16, 0, shade(col, 0.05), BRR_STONE);
  Rr.ell(0, yC, 0.03, 0.97, 0.97, 0.13, 0, BRM.gilt, BRR_STONE);
  brrClaw(Rr, 0, yC, 0.13, 1.35, BRR.green, BRM.gilt);
  for (let j = 0; j < 9; j++) {
    const a0 = (j - 4) * 0.55, a1 = (j - 4) * 0.62 + (j % 2 ? 0.2 : -0.2), P = [[a0 * 0.4, top + 0.1, 0.05], [a0 * 0.75, yC + 1.1, 0.12]];
    if (Math.abs(j - 4) <= 1) P.push([a0 * 1.6 + (j - 4) * 0.5, yC + 0.1, 0.18]); else P.push([a0 * 1.1, yC + 0.2, 0.15]);
    P.push([a1, 2.2, 0.12]); P.push([a1 * 1.08, 1.25, 0.06]);
    Rr.tube(brrCurve(P, 5), function (t) { return 0.15 - 0.11 * t; }, j % 2 ? rc : shade(rc, 0.1), BRR_STONE);
  }
  BRR_SHRINES.forEach(function (S, i) {
    const a = (i - 2) * 1.0, y = i === 2 ? yC + 1.45 : (i === 1 || i === 3 ? yC + 0.8 : yC - 0.25), aa = i === 2 ? 0 : (i < 2 ? -1 : 1) * (i === 0 || i === 4 ? 1.95 : 1.55);
    void a;
    Rr.ell(aa, y, 0.1, 0.36, 0.36, 0.08, 0, shade(col, -0.14), BRR_STONE);
    Rr.ell(aa, y, 0.11, 0.4, 0.4, 0.06, 0, S.lin, BRR_STONE);
    brrSign(Rr, S.key, aa, y - 0.02, 0.12, 0.5, BRR.relief, S.lin);
  });
  /* the steps and the block */
  K.slab(-2.3, 2.3, 0, 0.18, -K.e, 2.45, shade(col, -0.14), BRR_STONE);
  K.slab(-2.05, 2.05, 0.18, 0.18, -K.e, 2.15, shade(col, -0.08), BRR_STONE);
  const y0 = 0.36, bh = 1.0, n0 = 0.3, n1 = 1.75, bw = 1.6;
  for (let i = 0; i < 4; i++) K.slab(-bw, bw, y0 + i * bh / 4, bh / 4 + 0.01, n0 + F.rr(-0.04, 0.04), n1 - F.rr(0, 0.08), shade(F.pick(BRR.rock), F.rr(-0.08, 0.04)), BRR_RAW);
  K.slab(-bw - 0.08, bw + 0.08, y0 + bh, 0.14, n0 - 0.05, n1 + 0.08, shade(col, 0.1), BRR_STONE);
  const Fr = K.gn(0, n1 - 0.02);
  BRR_SHRINES.forEach(function (S, i) {
    const a = (i - 2) * 0.6;
    Fr.box(a, y0 + 0.14, 0.0, 0.5, 0.72, 0.06, 0, shade(col, -0.16), BRR_STONE);
    brrSign(Fr, S.key, a, y0 + 0.5, 0.02, 0.48, BRR.relief, S.lin);
  });
  for (let i = 0; i < 3; i++) Fr.box(-1.2 + i * 1.15 + F.rr(-0.1, 0.1), y0 + 0.25, 0.05, 0.06, bh - 0.25, 0.012, 0, BRM.red, BRR_STONE);
  /* on the top: the fire bowl, lamps at the corners, bowls, the folded cloth */
  const yt = y0 + bh + 0.14, T = K.gn(0, (n0 + n1) / 2);
  T.frustum(0, yt, 0, 0.18, 0.34, 0.18, 0, BRR.iron, 'metal', 12);
  T.cone(0, yt + 0.12, 0, 0.26, 0.22, 0, BRR_GLOW.ember, 'glow');
  for (const m of [-1, 1]) for (const q of [-1, 1]) brrLamp(T, m * (bw - 0.15), yt, q * 0.55, 1.1);
  T.box(-0.95, yt, 0.0, 0.42, 0.06, 0.32, 0.2, BRR.green, 'cloth'); T.box(-0.95, yt + 0.06, 0.0, 0.36, 0.04, 0.26, 0.2, BRR_TRIBE.quetzal.lin[1], 'cloth');
  F.furn('br_h_offering_bowl', K.at(0.85, (n0 + n1) / 2)[0], yt, K.at(0.85, (n0 + n1) / 2)[1], K.at(0.85, (n0 + n1) / 2)[2], { v: 0 });
  for (let i = 0; i < 5; i++) T.ball(0.45 + (i % 2) * 0.1, yt + 0.04, -0.35 + i * 0.14, 0.04, i % 2 ? BRR.flower : BRR.fruit, BRR_STONE);
  /* the lamp stands */
  for (const m of [-1, 1]) { const G = K.g(m * 2.15); G.cyl(0, 0.36, 1.5, 0.07, 1.85, 0, BRM.timber[2], BRM_TIMBER); G.cyl(0, 2.2, 1.5, 0.2, 0.06, 0, BRM.gilt, BRM_TIMBER); brrLamp(G, 0, 2.26, 1.5, 1.4); }
}
ASSET({
  key: 'br_bldg_rock_altar', name: 'The altar stone left standing (the Deep Root)', culture: 'beast-rider',
  family: 'religious', types: ['religious'], districts: ['ridertown'], wealth: [0.5, 1],
  w: 6.8, d: 3.0, h: 7.2, variants: 1,
  build: function (F) { brrAltarPiece(F); }
});

/* ==== BR_ROCK: the rock-cut pieces for any world
     BR_ROCK.keys                 every rock-cut key (br_bldg_rock_*), BR_ROCK.cavern the cavern's
     BR_ROCK.tribes, .tribe       the twelve tribes and their beasts and colours (variant n of the niche is tribes[n])
     BR_ROCK.shrines              the five nature shrines (variant n of the lamp niche)
     BR_ROCK.dims(key, v, opt)    {w, d, h} as built with opt (a wrapped piece is deeper by its arc's sag)
     BR_ROCK.face(key, v, opt)    the local z of the wall's face at the piece's middle
     BR_ROCK.place(key, x, z, ry, opt)   buildAsset with the options: {variant, seed, y, wealth, embed, wallR, tribe}
     BR_ROCK.onWall(key, px, pz, ry, opt)  the face's middle at (px, pz), facing ry (the wall's outward normal)
     BR_ROCK.onStack(key, cx, cz, R, ang, opt)  on a round stack of radius R about (cx, cz), at the math angle ang
                                  (outward (cos ang, sin ang)), wrapped to it (wallR = R)
     BR_ROCK.backOf(g, key, v, opt, x, z, ry)  measured: {minZ (the deepest local z), minN (the deepest point under the
                                  wall's face, negative inside the rock), e, d}: verify.py holds minZ >= -d/2, minN >= -e
   ====================================================================== */
const BR_ROCK = (function () {
  const keys = ASSETS.filter(function (A) { return /^br_bldg_rock_/.test(A.key); }).map(function (A) { return A.key; });
  const cavern = keys.filter(function (k) { return /^br_bldg_rock_(cavern_door|tribe_niche|lamp_niche|offering_ledge|altar)$/.test(k); });
  function dims(key, v, opt) {
    opt = opt || {};
    const dm = entryDims(ASSET_BY_KEY[key], v == null ? 0 : v), e = opt.embed == null ? 0.5 : opt.embed;
    const R = opt.wallR == null || !(opt.wallR > 0) ? 0 : Math.max(opt.wallR, dm.w * 0.6);
    const ex = R ? (R - e) * (1 - Math.cos(dm.w / 2 / R)) : 0;
    /* wrapped, the parts standing out spread wider than the face's arc: (R + the depth out) on each side */
    const w = R ? Math.max(dm.w, 2 * (R + dm.d - e) * Math.sin(Math.min(dm.w / 2 / R, Math.PI / 2))) : dm.w;
    return { w: +w.toFixed(3), d: dm.d + ex, h: dm.h, ex: ex, R: R, e: e };
  }
  function face(key, v, opt) { const D = dims(key, v, opt); return -D.d / 2 + D.ex + D.e; }
  function place(key, x, z, ry, opt) {
    opt = opt || {};
    const bo = { variant: opt.variant == null ? 0 : opt.variant, seed: opt.seed == null ? 1 : opt.seed, y: opt.y == null ? 0 : opt.y };
    if (opt.wealth != null) bo.wealth = opt.wealth;
    BRR_OPT = opt;
    try { return buildAsset(key, x, z, ry, bo); } finally { BRR_OPT = null; }
  }
  function onWall(key, px, pz, ry, opt) {
    const zW = face(key, opt && opt.variant, opt);
    return place(key, px - Math.sin(ry) * zW, pz - Math.cos(ry) * zW, ry, opt);
  }
  function onStack(key, cx, cz, R, ang, opt) {
    const o = Object.assign({}, opt || {}, { wallR: R });
    return onWall(key, cx + Math.cos(ang) * R, cz + Math.sin(ang) * R, Math.atan2(Math.cos(ang), Math.sin(ang)), o);
  }
  const _v = new THREE.Vector3();
  function backOf(g, key, v, opt, x, z, ry) {
    const D = dims(key, v, opt), zW = face(key, v, opt), c = Math.cos(ry || 0), s = Math.sin(ry || 0);
    let minZ = Infinity, minN = Infinity;
    g.updateMatrixWorld(true);
    g.traverse(function (m) {
      const geo = m.geometry; if (!geo || !geo.attributes || !geo.attributes.position) return;
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        _v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
        const dx = _v.x - x, dz = _v.z - z, lx = dx * c - dz * s, lz = dx * s + dz * c;
        minZ = Math.min(minZ, lz);
        minN = Math.min(minN, D.R ? Math.hypot(lx, lz - (zW - D.R)) - D.R : lz - zW);
      }
    });
    return { minZ: +minZ.toFixed(3), minN: +minN.toFixed(3), e: D.e, d: +D.d.toFixed(3), R: D.R };
  }
  /* the sheet (src/90-br-sheet.js): the rock-cut rows, a wall behind each, and the pieces wrapped round a stack */
  function rows(all) {
    const mine = function (A) { return keys.indexOf(A.key) >= 0; };
    return [{ title: 'Rock-cut (this kit)', rock: true, list: all.filter(function (A) { return mine(A) && cavern.indexOf(A.key) < 0; }) },
      { title: 'The Deep Root cavern (this kit)', rock: true, list: all.filter(function (A) { return cavern.indexOf(A.key) >= 0; }) },
      { title: 'Rock-cut, wrapped round a stack (wallR 9 m)', rock: true, list: [], build: stackDemo }];
  }
  function wallMesh(x0, x1, z0, z1, h, col, fam) {
    const g = new THREE.Group(), prev = _target;
    _target = g; mkBox((x0 + x1) / 2, -0.02, (z0 + z1) / 2, x1 - x0, h, z1 - z0, 0, col, fam); _target = prev;
    g.traverse(function (m) { if (m.isMesh) m.userData.furniture = true; });
    scene.add(g); KF_API.detailize(g);
    return g;
  }
  /* the rock behind a row: its face 0.02 m behind the pieces' faces (their backs are on the row's line z0) */
  function backdrop(z0, x1) { wallMesh(-8, x1 - 4, z0 - 4, z0 + 0.48, 16, BRR.rock[1], BRR_RAW); }
  /* a stack of radius 9 with rock-cut pieces round it, each wrapped to it (BR_ROCK.onStack) */
  function stackDemo(z0, out) {
    const R = 9, cx = R + 6, cz = z0 + R + 1.5, set = [['br_bldg_rock_facade', 2], ['br_bldg_rock_room_front', 0], ['br_bldg_rock_room_front', 3],
      ['br_bldg_rock_facade', 4], ['br_bldg_rock_window', 1], ['br_bldg_rock_tribe_niche', 0]];
    const g = new THREE.Group(), prev = _target;
    _target = g; mkFrustum(cx, -0.02, cz, R + 0.02, R - 0.6, 14, 0, BRR.rock[1], BRR_RAW, 40); _target = prev;
    g.traverse(function (m) { if (m.isMesh) m.userData.furniture = true; }); scene.add(g); KF_API.detailize(g);
    let tris = 0;
    set.forEach(function (p, i) {
      const ang = Math.PI / 2 + (i - (set.length - 1) / 2) * 0.62, opt = { variant: p[1], wallR: R, seed: 1 };
      /* the frustum leans in 0.6 m over 14 m: the face at the piece's foot is R */
      let gg = null;
      try { gg = onStack(p[0], cx, cz, R, ang, opt); } catch (err) { out.errors.push(p[0] + ' (wrapped): ' + (err && err.message || err)); }
      if (!gg) return;
      if (gg.userData.error) out.errors.push(p[0] + ' (wrapped): ' + gg.userData.error);
      gg.traverse(function (m) { if (m.isMesh) m.userData.furniture = true; }); KF_API.detailize(gg);
      const M = measureInstance(gg), D = dims(p[0], p[1], opt), u = gg.userData, ry = u.ry;
      tris += M.tris;
      /* the box in the piece's own frame: measured on a copy turned back to ry 0 */
      const L = backOf(gg, p[0], p[1], opt, u.x, u.z, ry);
      const W = localBox(gg, u.x, u.z, ry);
      out.built.push({ key: p[0], v: p[1], own: true, port: false, wrapped: R, w: W.w, d: W.d, h: +M.h.toFixed(2), decl: { w: D.w, d: D.d, h: D.h },
        min: null, max: null, missing: u.missingFurniture || [], rock: L });
    });
    groundLabel('Wrapped round a stack (wallR 9 m)', cx, cz + R + 6);
    return { x: cx + R + 12, depth: 2 * R + 6, tris: tris };
  }
  /* the measured w and d of a group in a frame turned ry about (x, z) */
  function localBox(g, x, z, ry) {
    const c = Math.cos(ry), s = Math.sin(ry);
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    g.traverse(function (m) {
      const geo = m.geometry; if (!geo || !geo.attributes || !geo.attributes.position) return;
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        _v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
        const dx = _v.x - x, dz = _v.z - z, lx = dx * c - dz * s, lz = dx * s + dz * c;
        x0 = Math.min(x0, lx); x1 = Math.max(x1, lx); z0 = Math.min(z0, lz); z1 = Math.max(z1, lz);
      }
    });
    return { w: +(x1 - x0).toFixed(2), d: +(z1 - z0).toFixed(2) };
  }
  return { keys: keys, cavern: cavern, tribes: BRR_TRIBES, tribe: BRR_TRIBE, shrines: BRR_SHRINES.map(function (S) { return S.name; }),
    dims: dims, face: face, place: place, onWall: onWall, onStack: onStack, backOf: backOf, rows: rows, backdrop: backdrop };
})();
