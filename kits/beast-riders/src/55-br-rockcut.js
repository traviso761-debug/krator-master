// prefix: brr
/* ======================================================================
   The Beast Riders kit: ROCK-CUT pieces (2026-10-19; the owner: "adapt some of the 'carved into tree' interiors into
   'carved into rock' interiors"). Mav's Refuge cuts rooms into its gate baobabs (settlements/mavs-refuge/src/56-levels.js,
   GOAL B: gtFacade and its seven kinds, gtWin, gtBarkWin, gtBalcony, gtVent); Pinnacle Rock cuts them into its red
   sandstone stacks and the mesa's walls (settlements/pinnacle-rock/PLAN.md, the town and the Deep Root cavern). These are
   those carvings re-cut in stone, as catalog ASSETs (culture 'beast-rider') on the catalog's engine, for any world:

     br_bldg_rock_facade      the gate-tree carvings in sandstone: storehouse, vault, shrine, dorm, inn, barracks, guard post
     br_bldg_rock_door        door surrounds with beast-head reliefs: corbelled lintel, arch with a beast keystone, great door
     br_bldg_rock_window      window slots: a tall slot, a shuttered row of three, an arched pair with a lattice, a round light
     br_bldg_rock_balcony     a balcony ledge cut from the face on beast-head corbels; a long gallery ledge with two doors
     br_bldg_rock_stair       a stair cut into the face: rising right, rising left, a double flight to a landing door
     br_bldg_rock_room_front  rock-cut room fronts: apartment, store, workshop, a roost cell for the flyers
     br_bldg_rock_shrine      a rock-cut shrine: a wayside niche, a shrine front with its pilasters and pediment
     br_bldg_rock_cistern     a rock-cut cistern: a wall cistern under its rain channel, a stepped cistern under an arch
   (the Deep Root cavern's dressing is src/56-br-rockcut-b.js, on this vocabulary)

   THE FRAME. The catalog's: origin at the footprint's centre on the ground, +z the front. Every piece stands against a
   near-vertical wall behind it: its BACK is the plane z = -d/2 (d the declared depth), the wall's face is `embed` metres in
   front of that (option embed, default 0.5: what is buried in the rock, so an uneven face never shows a gap), and
   nothing is drawn behind the back. With option {wallR: R} the face wraps a round stack of radius R (KSTACKS.ring gives a
   stack's outline at a height): every part is laid along the arc, the back follows the curve, and the declared depth
   grows by the arc's sag over the piece's width (BR_ROCK.dims). A world places a piece with BR_ROCK.place / onWall /
   onStack (end of src/56-br-rockcut-b.js), which pass the options; buildAsset() alone builds the flat piece.

   THE CARVING (as gtFacade's: "a solid block from trunkR-1.0, buried, to >= trunkR+0.7, always proud"): a dressed panel
   from the back to the face, a rough rim of raw rock round each carving (gtCollar's swollen bark), the carving's jambs,
   lintel and plinth standing proud of the panel, its recess (the door wall) set back between them, so the panel reads as
   cut INTO the rock. Surfaces: 'sandstone/stone' (the library's rock.sandstone.bedded.red: the dressed faces and
   reliefs) and 'navajo/stone' (rock.sandstone.navajo, cross-bedded: the raw rims and the cut cheeks), by materials.json;
   the riders' timber, red and gilt paint, verdigris, hides and rope from Girder's palette (src/50-br-mounts.js BRM), so a
   rock-cut room front stands beside a stave stable as one town.
   ====================================================================== */

/* the sandstone, the paints and the offerings (sRGB, turned to linear as the mounts' palette is: brmLin) */
const BRR_SRGB = { rock: [0xa85c40, 0x9c5238, 0xb26a4c, 0x8a4630], dressed: 0xb8714f, relief: 0xc78462, reliefPale: 0xdcab84, shadow: 0x5e2e20,
  void: 0x1e100b, soot: 0x2e2420, ochre: 0xc8923e, bone: 0xe2d6ba, green: 0x3f7a3a, greenDeep: 0x2e5a2c, rain: 0x3a6a78,
  water: 0x2f5a5c, leaf: 0x4f7a34, moss: 0x56723a, clay: 0xa8643c, iron: 0x2a2620, white: 0xe8e2d2, black: 0x2a2420,
  fruit: 0xd07a2a, flower: 0xd04a5a, feather: 0x2f8a6a, honey: 0xc08a2a, seed: 0x7a5a32 };
const BRR = {}; for (const k in BRR_SRGB) BRR[k] = brmLin(BRR_SRGB[k]);
const BRR_STONE = 'sandstone/stone', BRR_RAW = 'navajo/stone';
/* light (unlit 'glow' colours, turned to linear like the rest: the page's renderer writes sRGB): a lamp's flame, a lit
   room behind a pane, the cool lamps of the shrines */
const BRR_GLOW = { flame: 0xffc060, warm: 0x7a4a22, dim: 0x3a2412, cool: 0x9fe8ff, coolDim: 0x2a4a50, ember: 0xff7a2a };
for (const k in BRR_GLOW) BRR_GLOW[k] = brmLin(BRR_GLOW[k]);

/* the twelve tribes (LORE.md 6.6), in the lore's order; each one's beast (brrBeast), its two colours (cloth, paint) and
   what its people bring to its niche (56: br_bldg_rock_tribe_niche) */
const BRR_TRIBES = ['quetzal', 'wingclaw', 'dragonfly', 'nightwing', 'spider', 'raptor', 'staghorn', 'threehorn', 'hardshell', 'tiger', 'mammoth', 'longcrawler'];
const BRR_TRIBE = {
  quetzal: { name: 'Quetzal', beast: 'quetzalcoatlus', col: [0x2f7a5a, 0xc89a3a] },
  wingclaw: { name: 'Wingclaw', beast: 'giant archaeopteryx', col: [0x9a4a2a, 0xe0d0a8] },
  dragonfly: { name: 'Dragonfly', beast: 'giant dragonfly', col: [0x2a8a8a, 0x6a4a9a] },
  nightwing: { name: 'Nightwing', beast: 'giant bat', col: [0x3a2a44, 0x8a2f2a] },
  spider: { name: 'Spider', beast: 'giant spider', col: [0xd8dcd8, 0x2a2624] },
  raptor: { name: 'Raptor', beast: 'velociraptor', col: [0xc0883a, 0x5a3a24] },
  staghorn: { name: 'Staghorn', beast: 'stag beetle', col: [0x4a4a24, 0xc07a2a] },
  threehorn: { name: 'Threehorn', beast: 'triceratops', col: [0xb8683e, 0xe2d6ba] },
  hardshell: { name: 'Hardshell', beast: 'glyptodont', col: [0x6a6a5a, 0xc2a24e] },
  tiger: { name: 'Tiger', beast: 'tiger', col: [0xd07a2a, 0x2a2420] },
  mammoth: { name: 'Mammoth', beast: 'mammoth', col: [0x7a4a30, 0xe8e0cc] },
  longcrawler: { name: 'Longcrawler', beast: 'giant millipede', col: [0x6a3a4a, 0xd0b040] }
};
BRR_TRIBES.forEach(function (t) { BRR_TRIBE[t].lin = BRR_TRIBE[t].col.map(brmLin); });
function brrTribe(t, dflt) {
  if (typeof t === 'number') return BRR_TRIBES[((t % 12) + 12) % 12];
  return BRR_TRIBE[t] ? t : (dflt == null ? 'quetzal' : dflt);
}

/* the options of the build in hand (BR_ROCK.place sets them round buildAsset; a plain buildAsset() has none: flat) */
let BRR_OPT = null;
function brrOpt() { return BRR_OPT || {}; }

/* ==== frames */
/* a catalog frame at the piece's local (lx, lz), turned th more than the piece: x along the wall, +z out of it. Its own
   makeFrame, so a beam's roll and a sloped slab are worked out in ITS frame (an awning on a curved wall lies true) */
function brrG(F, lx, lz, th) {
  const c = Math.cos(F.ry), s = Math.sin(F.ry);
  const G = makeFrame(F.x + lx * c + lz * s, F.z - lx * s + lz * c, F.ry + (th || 0), { y: F.y, seed: F.seed, variant: F.variant, wealth: F.wealth });
  G.asset = F.asset;
  return G;
}
/* Catmull-Rom through control points [a, y, c], n samples a span */
function brrCurve(P, n) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t, q = [];
      for (let j = 0; j < 3; j++) q.push(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3));
      out.push(q);
    }
  }
  out.push(P[P.length - 1].slice());
  return out;
}
/* the wall a piece stands against: K.at(u, n) is the piece-local [x, z, turn] of the point u metres along the face and n
   out of it; K.g(u) a frame on the face there (G-local x along the face, z = n out of it); K.seg splits a run along the
   face into pieces short enough to follow a curved wall (one piece on a flat one) */
function brrK(F) {
  const o = brrOpt(), dm = entryDims(F.asset, F.variant), e = o.embed == null ? 0.5 : o.embed;
  const R = o.wallR == null || !(o.wallR > 0) ? 0 : Math.max(o.wallR, dm.w * 0.6);
  const ex = R ? (R - e) * (1 - Math.cos(dm.w / 2 / R)) : 0;
  const zW = -(dm.d + ex) / 2 + ex + e;
  const K = { F: F, R: R, e: e, zW: zW, W: dm.w, D: dm.d, H: dm.h, tribe: o.tribe };
  K.at = function (u, n) {
    if (!R) return [u, zW + n, 0];
    const t = u / R, r = R + n;
    return [r * Math.sin(t), zW - R + r * Math.cos(t), t];
  };
  K.g = function (u, yaw) { const p = K.at(u, 0); return brrG(F, p[0], p[1], p[2] + (yaw || 0)); };
  K.gn = function (u, n, yaw) { const p = K.at(u, n); return brrG(F, p[0], p[1], p[2] + (yaw || 0)); };   /* a frame n out of the face */
  K.seg = function (u0, u1, nOut, fn, step) {
    const L = u1 - u0; if (!(L > 1e-4)) return;
    const n = R ? Math.max(1, Math.ceil(L / (step || 1.2))) : 1, k = R ? (R + Math.max(0, nOut)) / R * 1.015 : 1;
    for (let i = 0; i < n; i++) { const a = u0 + L * i / n, b = u0 + L * (i + 1) / n; fn(K.g((a + b) / 2), (b - a) * k + (R ? 0.01 : 0), (a + b) / 2); }
  };
  /* a slab along the face: u0..u1, from y up h, from n0 out to n1 */
  K.slab = function (u0, u1, y, h, n0, n1, col, fam) {
    K.seg(u0, u1, n1, function (G, w) { G.box(0, y, (n0 + n1) / 2, w, h, n1 - n0, 0, col, fam); });
  };
  /* a sloped slab along the face (a pentice, an awning): its back edge (yB, nB), its front edge (yF, nF), thickness t */
  K.slope = function (u0, u1, yB, nB, yF, nF, t, col, fam) {
    K.seg(u0, u1, nF, function (G, w) { G.beam(0, yB, nB, 0, yF, nF, w, t, col, fam); }, 1.0);
  };
  /* a rail or beam along the face at (y, n) */
  K.rail = function (u0, u1, y, n, w, d, col, fam) {
    K.seg(u0, u1, n, function (G, L) { G.beam(-L / 2, y, n, L / 2, y, n, w, d, col, fam); });
  };
  /* a catalog piece at (u, ly, n), turned lry from facing out of the wall */
  K.furn = function (key, u, ly, n, lry, o2) { const p = K.at(u, n); return F.furn(key, p[0], ly, p[1], p[2] + (lry || 0), o2); };
  return K;
}

/* ==== the carving vocabulary */
/* the dressed panel: the face smoothed for a carving, from the back of the piece to n */
function brrPanel(K, u0, u1, y0, y1, n, col) { K.slab(u0, u1, y0, y1 - y0, -K.e, n == null ? 0.06 : n, col == null ? BRR.dressed : col, BRR_STONE); }
/* the raw rim round a carving (gtCollar's swollen bark): the living rock left standing round the cut, so the dressed
   face sits in an alcove. Each side is rough chunks of the raw stone in three steps, the cheek at the carving's edge out
   to pk, falling back to the face outward over the margin m; the top a brow that overhangs a little. sides 'l' 'r' 't' */
function brrRim(K, u0, u1, y0, y1, m, pk, sides) {
  const F = K.F, rk = function () { return shade(F.pick(BRR.rock), F.rr(-0.07, 0.05)); };
  sides = sides || 'lrt';
  const steps = [[0, 0.24, 1.0], [0.24, 0.56, 0.7], [0.56, 1, 0.38]];
  for (const s of [-1, 1]) {
    if (sides.indexOf(s < 0 ? 'l' : 'r') < 0) continue;
    const nb = Math.max(1, Math.round((y1 - y0) / 0.85));
    for (let i = 0; i < nb; i++) {
      const ya = y0 + (y1 - y0) * i / nb, yb = y0 + (y1 - y0) * (i + 1) / nb + 0.03;
      for (const st of steps) {
        const a = st[0] * m, b = (st[1] * m) * F.rr(0.9, 1.1) + 0.04, ua = s < 0 ? u0 - b : u1 + a, ub = s < 0 ? u0 - a : u1 + b;
        K.slab(ua, ub, ya, yb - ya, -K.e, pk * st[2] * F.rr(0.82, 1.08), rk(), BRR_RAW);
      }
    }
  }
  if (sides.indexOf('b') >= 0) {
    const L = u1 - u0 + 2 * m, nb = Math.max(1, Math.round(L / 0.95));
    for (let i = 0; i < nb; i++) {
      const ua = u0 - m + L * i / nb, ub = u0 - m + L * (i + 1) / nb + 0.03;
      K.slab(ua, ub, y0 - m * F.rr(0.6, 0.9), 0.0 + m * 0.75, -K.e, pk * 0.62 * F.rr(0.8, 1.1), rk(), BRR_RAW);
    }
  }
  if (sides.indexOf('t') >= 0) {
    const L = u1 - u0 + 2 * m, nb = Math.max(1, Math.round(L / 0.95));
    for (let i = 0; i < nb; i++) {
      const ua = u0 - m + L * i / nb, ub = u0 - m + L * (i + 1) / nb + 0.03, edge = Math.min(ua - u0 + m, u1 + m - ub) < m * 0.6;
      K.slab(ua, ub, y1 - 0.12, 0.42 * F.rr(0.85, 1.15), -K.e, pk * (edge ? 0.8 : 1.12) * F.rr(0.85, 1.05), rk(), BRR_RAW);
      const yb = y1 + F.rr(0.15, 0.3);
      K.slab(ua, ub, yb, Math.min(y1 + 0.25 + 0.9 * m, yb + m * F.rr(0.4, 0.95)) - yb, -K.e, pk * 0.55 * F.rr(0.75, 1.15), rk(), BRR_RAW);
    }
  }
}
/* the top of a carving's dressed face, so the rim's brow (margin m) stays inside the piece's declared height */
function brrTop(K, m) { return K.H - 0.27 - 0.92 * m; }
/* an arched head over an opening (gtFacade's): the soffit cut in n slices, its spring at ys, its crown rise above, the
   head block to yHead; from n0 (the recess) to n1 (the face of the jambs) */
function brrArchHead(K, u, w, ys, rise, yHead, n0, n1, col) {
  /* the head over an arch: slices down to the curve, and along each slice's chord a stone (the intrados) whose underside
     IS the chord, so the arch's edge reads as a curve, not as steps */
  const nsl = Math.max(10, Math.round(w / 0.18)), yA = function (v) { return ys + rise * Math.sqrt(Math.max(0, 1 - 4 * v * v / (w * w))); };
  const nm = (n0 + n1) / 2;
  for (let i = 0; i < nsl; i++) {
    const v0 = -w / 2 + w * i / nsl, v1 = -w / 2 + w * (i + 1) / nsl, vm = (v0 + v1) / 2, a0 = yA(v0), a1 = yA(v1), hi = Math.max(a0, a1);
    const c = i % 2 ? col : shade(col, -0.04);
    if (yHead - hi > 0.02) K.slab(u + v0, u + v1, hi, yHead - hi, n0, n1, c, BRR_STONE);
    const dx = v1 - v0, dy = a1 - a0, L = Math.hypot(dx, dy), th = Math.min(Math.abs(dy) + 0.06, Math.max(0.06, yHead - Math.min(a0, a1)));
    const ox = -dy / L * th / 2, oy = dx / L * th / 2;   /* up the chord's normal by half the stone's thickness */
    K.g(u + vm).beam(v0 - vm + ox, a0 + oy, nm, v1 - vm + ox, a1 + oy, nm, th, n1 - n0, c, BRR_STONE);
  }
}
/* a portal: plinth step, jambs, recess (the door wall at nP), head (square or arched), the keystone; returns its heights.
   o: { u, y (sill), W (outer), H (opening to the springing, or the head), jw (jamb width), arched, rise, nP, nS, col } */
function brrPortal(K, o) {
  const u = o.u || 0, y = o.y, W = o.W, H = o.H, jw = o.jw == null ? 0.42 : o.jw, nP = o.nP == null ? 0.3 : o.nP, nS = o.nS == null ? 0.65 : o.nS;
  const col = o.col == null ? BRR.dressed : o.col, wo = W - 2 * jw, rise = o.arched ? (o.rise == null ? Math.min(1.15, wo * 0.3) : o.rise) : 0;
  const yHead = y + H + (o.arched ? 0.1 : 0), headH = o.headH == null ? (o.arched ? 0.45 : 0.6) : o.headH;
  K.slab(u - W / 2, u + W / 2, y - (o.plinth == null ? 0.3 : o.plinth), o.plinth == null ? 0.3 : o.plinth, -K.e, nS + 0.12, shade(col, -0.12), BRR_STONE);
  K.slab(u - W / 2, u - W / 2 + jw, y, yHead - y, -K.e, nS, col, BRR_STONE);
  K.slab(u + W / 2 - jw, u + W / 2, y, yHead - y, -K.e, nS, col, BRR_STONE);
  K.slab(u - wo / 2, u + wo / 2, y, yHead - y, -K.e, nP, o.recess == null ? shade(col, -0.32) : o.recess, BRR_STONE);
  if (o.arched) brrArchHead(K, u, wo, y + H - rise, rise, yHead, nP, nS, shade(col, -0.08));
  K.slab(u - W / 2 - 0.12, u + W / 2 + 0.12, yHead, headH, -K.e, nS + 0.09, shade(col, 0.06), BRR_STONE);
  /* a band of red paint along the head, the riders' eave band in stone */
  if (o.band !== false) K.slab(u - W / 2 - 0.08, u + W / 2 + 0.08, yHead + headH * 0.32, 0.12, nS + 0.09, nS + 0.11, BRM.red, BRR_STONE);
  if (o.keystone !== false) K.g(u).box(0, yHead - (o.arched ? 0.16 : 0.04), nS + 0.1, 0.5, headH + 0.2, 0.18, 0, shade(col, -0.16), BRR_STONE);
  return { yHead: yHead, yTop: yHead + headH, rise: rise, wo: wo };
}
/* a door in a recess at nP: the timber frame, then a plank leaf ('plank', banded 'iron' or 'vault'), a hide curtain
   ('hide'), or the dark of an open room ('open', 'glow' lit warm, 'cool' lit cool) */
function brrDoor(K, u, y, dw, dh, nP, kind) {
  const G = K.g(u), tc = BRM.timber[0];
  G.box(-dw / 2 - 0.08, y, nP + 0.06, 0.16, dh + 0.18, 0.12, 0, tc, BRM_TIMBER);
  G.box(dw / 2 + 0.08, y, nP + 0.06, 0.16, dh + 0.18, 0.12, 0, tc, BRM_TIMBER);
  G.box(0, y + dh, nP + 0.06, dw + 0.32, 0.2, 0.14, 0, BRM.timber[2], BRM_TIMBER);
  if (kind === 'open' || kind === 'glow' || kind === 'cool') {
    G.box(0, y, nP + 0.005, dw, dh, 0.02, 0, kind === 'open' ? BRR.void : (kind === 'cool' ? BRR_GLOW.coolDim : BRR_GLOW.dim), kind === 'open' ? BRR_STONE : 'glow');
    return G;
  }
  if (kind === 'hide') {
    G.box(0, y + 0.02, nP + 0.005, dw, dh, 0.02, 0, BRR.void, BRR_STONE);
    G.rod(-dw / 2 - 0.1, y + dh - 0.12, nP + 0.2, dw / 2 + 0.1, y + dh - 0.12, nP + 0.2, 0.04, BRM.timber[2], BRM_TIMBER);
    G.box(-dw * 0.14, y + 0.25, nP + 0.17, dw * 0.74, dh - 0.4, 0.04, 0, BRM.hide, 'hide');
    G.box(dw * 0.4, y + 0.9, nP + 0.17, dw * 0.22, dh - 1.05, 0.12, 0, shade(BRM.hide, -0.12), 'hide');
    return G;
  }
  const lc = kind === 'vault' ? shade(BRM.timber[2], -0.25) : shade(BRM.plank, -0.28);
  G.box(0, y, nP + 0.14, dw, dh, 0.06, 0, lc, BRM_TIMBER);
  if (dw > 1.6) G.box(0, y, nP + 0.18, 0.06, dh, 0.03, 0, shade(lc, -0.5), BRM_TIMBER);
  const nb = kind === 'vault' ? 3 : (kind === 'iron' ? 2 : 0);
  for (let b = 0; b < nb; b++) G.box(0, y + 0.3 + b * (dh - 0.6) / Math.max(1, nb - 1) - 0.07, nP + 0.19, dw, 0.14, 0.03, 0, BRR.iron, 'metal');
  if (kind === 'vault') G.cyl(dw * 0.3, y + dh * 0.5, nP + 0.2, 0.12, 0.06, 0, BRR.iron, 'metal');
  if (kind === 'plank' && dw <= 1.6) { G.box(0, y + dh * 0.32, nP + 0.18, dw * 0.9, 0.1, 0.03, 0, shade(lc, -0.3), BRM_TIMBER); G.box(0, y + dh * 0.72, nP + 0.18, dw * 0.9, 0.1, 0.03, 0, shade(lc, -0.3), BRM_TIMBER); }
  return G;
}
/* a window slot in the face at n (gtWin, gtBarkWin): the dark reveal cut back into the rock, a stone sill and hood, and
   its style: 'slot' (bare), 'shutter' (red plank shutters open flat on the face), 'lattice' (a timber grille), 'arch'
   (a round head). lit: a lit room (warm), 'cool', or dark */
function brrWin(K, u, yc, w, h, n, style, lit) {
  const G = K.g(u), y0 = yc - h / 2;
  G.box(0, y0, n - 0.2, w, h, 0.42, 0, BRR.void, BRR_STONE);
  if (lit) G.box(0, y0 + h * 0.04, n + 0.012, w * 0.9, h * 0.92, 0.01, 0, lit === 'cool' ? BRR_GLOW.coolDim : BRR_GLOW.dim, 'glow');
  G.box(0, y0 - 0.14, n + 0.05, w + 0.34, 0.14, 0.3, 0, shade(BRR.dressed, 0.08), BRR_STONE);
  if (style === 'arch') {
    G.ell(0, y0 + h, n + 0.06, w / 2 + 0.16, w / 2 + 0.16, 0.08, 0, shade(BRR.dressed, 0.04), BRR_STONE);
    G.ell(0, y0 + h, n + 0.08, w / 2, w / 2, 0.08, 0, BRR.void, BRR_STONE);
    if (lit) G.ell(0, y0 + h, n + 0.092, w / 2 - 0.04, w / 2 - 0.04, 0.07, 0, lit === 'cool' ? BRR_GLOW.coolDim : BRR_GLOW.dim, 'glow');
  } else G.box(0, y0 + h, n + 0.02, w + 0.28, 0.2, 0.22, 0, shade(BRR.dressed, 0.06), BRR_STONE);
  if (style === 'shutter') for (const s of [-1, 1]) {
    G.box(s * (w / 2 + w * 0.27 + 0.04), y0 - 0.02, n + 0.06, w * 0.5, h + 0.04, 0.05, 0, BRM.red, BRM_TIMBER);
    G.box(s * (w / 2 + w * 0.27 + 0.04), y0 + h * 0.45, n + 0.09, w * 0.5, 0.06, 0.02, 0, BRM.gilt, BRM_TIMBER);
  }
  if (style === 'lattice') {
    for (let i = 1; i < 4; i++) G.box(-w / 2 + w * i / 4, y0, n + 0.04, 0.05, h, 0.05, 0, BRM.timber[2], BRM_TIMBER);
    for (let i = 1; i < 3; i++) G.box(0, y0 + h * i / 3 - 0.025, n + 0.04, w, 0.05, 0.05, 0, BRM.timber[2], BRM_TIMBER);
  }
  return G;
}
/* a hearth's smoke shaft where it comes out of the face (gtVent): the slot, a little stone hood, the soot above it */
function brrVent(K, u, y) {
  const G = K.g(u);
  G.box(0, y, 0.02, 0.36, 0.3, 0.12, 0, BRR.void, BRR_STONE);
  G.box(0, y + 0.3, 0.12, 0.62, 0.14, 0.34, 0, shade(BRR.dressed, 0.06), BRR_STONE);
  for (let i = 0; i < 4; i++) G.box(0, y + 0.44 + i * 0.32, 0.075 - i * 0.003, 0.5 - i * 0.09, 0.34, 0.02, 0, shade(BRR.soot, i * 0.12), BRR_STONE);
}
/* a lamp: a clay dish (or a cup of stone) and its flame, in the frame G at (a, y, c) */
function brrLamp(G, a, y, c, s, cool) {
  s = s == null ? 1 : s;
  G.frustum(a, y, c, 0.07 * s, 0.13 * s, 0.07 * s, 0, BRR.clay, BRR_STONE, 10);
  G.cone(a, y + 0.07 * s, c, 0.045 * s, 0.14 * s, 0, cool ? BRR_GLOW.cool : BRR_GLOW.flame, 'glow');
}
/* the claw (the riders' sign: three talon slashes) in relief, green with an edge, s its height */
function brrClaw(G, a, y, c, s, col, edge) {
  for (let i = -1; i <= 1; i++) {
    const P = [[a + (i * 0.3 - 0.16) * s, y + 0.5 * s, c + 0.03 * s], [a + (i * 0.3 - 0.03) * s, y + 0.12 * s, c + 0.07 * s],
      [a + (i * 0.3 + 0.06) * s, y - 0.2 * s, c + 0.07 * s], [a + (i * 0.3 + 0.13) * s, y - 0.5 * s, c + 0.03 * s]];
    const pts = brrCurve(P, 4);
    if (edge != null) G.tube(pts.map(function (p) { return [p[0], p[1], p[2] - 0.045 * s]; }), function (t) { return s * (0.016 + 0.098 * Math.pow(Math.sin(Math.PI * t), 0.8)); }, edge, BRR_STONE);
    G.tube(pts, function (t) { return s * (0.008 + 0.08 * Math.pow(Math.sin(Math.PI * t), 0.8)); }, col, BRR_STONE);
  }
}

/* ==== the beasts in relief
   brrBeast(G, tribe, s, y0, col, P): the tribe's beast cut in relief in the frame G, centred at (0, y0) on the face (c = 0),
   about 1.6 s wide and 1.4 s high, standing out up to 0.3 s; col the stone, P { dark, accent, eye, bone } its paint.
   Heads where the beast is known by its head (quetzal, wingclaw, raptor and the hardshell in profile; nightwing, threehorn,
   tiger, mammoth and the staghorn's head facing out); the whole beast where its body is the sign (the dragonfly, the
   spider, the longcrawler coiled) */
function brrBeast(G, k, s, y0, col, P) {
  P = P || {};
  const dz = P.depth == null ? 1.6 : P.depth;   /* relief: how far it stands out, a share of the round */
  const fx = P.flip ? -s : s;                   /* flip: the head faces -x (a pair facing each other) */
  const dk = P.dark == null ? shade(col, -0.45) : P.dark, ac = P.accent == null ? BRM.red : P.accent, ey = P.eye == null ? BRR.void : P.eye, bn = P.bone == null ? BRR.bone : P.bone;
  const f = BRR_STONE;
  const E = function (a, y, c, rx, ry, rz, cl) { G.ell(a * fx, y0 + y * s, c * s * dz, rx * s, ry * s, rz * s * dz, 0, cl == null ? col : cl, f); };
  const B = function (a, y, c, r, cl) { G.ball(a * fx, y0 + y * s, c * s * dz, r * s, cl == null ? col : cl, f); };
  const X = function (a, y, c, w, h, d, cl) { G.box(a * fx, y0 + y * s, c * s * dz, w * s, h * s, d * s * dz, 0, cl == null ? col : cl, f); };
  const T = function (pts, r0, r1, cl, n) {
    const Q = brrCurve(pts.map(function (p) { return [p[0] * fx, y0 + p[1] * s, p[2] * s * dz]; }), n || 4);
    const rf = typeof r0 === 'function' ? function (t) { return r0(t) * s; } : function (t) { return (r0 + (r1 - r0) * t) * s; };
    G.tube(Q, rf, cl == null ? col : cl, f);
  };
  const sp = function (rm) { return function (t) { return rm * (0.12 + 0.88 * Math.sin(Math.PI * t)); }; };
  const both = function (fn) { fn(1); fn(-1); };
  if (k === 'quetzal') {
    T([[-0.3, -0.75, 0.02], [-0.28, -0.35, 0.05], [-0.18, -0.05, 0.06]], 0.12, 0.1);
    E(-0.12, 0.02, 0.06, 0.2, 0.15, 0.1);
    T([[-0.02, 0.07, 0.07], [0.4, 0.01, 0.06], [0.88, -0.08, 0.04]], 0.09, 0.012);
    T([[-0.02, -0.04, 0.06], [0.4, -0.08, 0.05], [0.8, -0.11, 0.03]], 0.055, 0.01, dk);
    T([[-0.1, 0.14, 0.05], [-0.35, 0.36, 0.04], [-0.64, 0.6, 0.03]], 0.09, 0.015, ac);
    T([[-0.36, -0.42, 0.02], [-0.66, -0.18, 0.03], [-0.86, 0.16, 0.02]], sp(0.07), 0, dk);
    B(-0.06, 0.07, 0.14, 0.035, ey);
  } else if (k === 'wingclaw') {
    T([[-0.18, -0.08, 0.05], [-0.25, -0.4, 0.05], [-0.3, -0.72, 0.03]], 0.11, 0.13);
    E(-0.05, 0.05, 0.06, 0.18, 0.16, 0.1);
    T([[0.08, 0.04, 0.07], [0.32, 0.0, 0.06], [0.54, -0.03, 0.05]], 0.08, 0.03);
    T([[0.05, -0.06, 0.06], [0.3, -0.08, 0.05], [0.5, -0.08, 0.04]], 0.05, 0.02, dk);
    for (let i = 0; i < 5; i++) X(0.15 + i * 0.07, -0.085, 0.08, 0.025, 0.045, 0.02, bn);
    for (let i = 0; i < 4; i++) T([[-0.12, 0.12 - i * 0.06, 0.05], [-0.36 - i * 0.05, 0.3 - i * 0.1, 0.04], [-0.56 - i * 0.06, 0.38 - i * 0.14, 0.02]], sp(0.05), 0, i % 2 ? ac : col);
    T([[-0.1, -0.45, 0.04], [0.2, -0.42, 0.06], [0.42, -0.5, 0.05]], 0.05, 0.03);
    for (let j = 0; j < 3; j++) T([[0.42, -0.5, 0.05], [0.52, -0.47 - j * 0.05, 0.06], [0.56, -0.57 - j * 0.05, 0.05]], 0.022, 0.006, bn);
    B(0.02, 0.1, 0.14, 0.03, ey);
  } else if (k === 'dragonfly') {
    B(0, 0.52, 0.08, 0.1);
    both(function (m) { B(m * 0.08, 0.57, 0.1, 0.075, ey); });
    E(0, 0.3, 0.07, 0.1, 0.16, 0.09);
    T([[0, 0.15, 0.06], [0.0, -0.3, 0.05], [0.04, -0.82, 0.03]], 0.06, 0.025);
    for (let i = 0; i < 5; i++) B(0.005 * i, 0.05 - i * 0.17, 0.08 - i * 0.008, 0.062 - i * 0.006, ac);
    both(function (m) {
      E(m * 0.44, 0.37, 0.03, 0.4, 0.075, 0.025, shade(col, 0.1));
      E(m * 0.41, 0.2, 0.03, 0.36, 0.08, 0.025, shade(col, 0.1));
      T([[m * 0.06, 0.37, 0.055], [m * 0.82, 0.39, 0.045]], 0.012, 0.007, dk, 1);
      T([[m * 0.06, 0.2, 0.055], [m * 0.75, 0.2, 0.045]], 0.012, 0.007, dk, 1);
    });
  } else if (k === 'nightwing') {
    both(function (m) {
      const W = [[m * 0.15, 0.0, 0.05], [m * 0.45, 0.16, 0.05], [m * 0.66, 0.3, 0.04]];
      T(W, 0.035, 0.025, dk);
      for (const q of [[0.96, 0.24], [0.97, -0.06], [0.8, -0.36], [0.55, -0.42]]) T([W[2], [m * q[0], q[1], 0.03]], 0.024, 0.008, dk, 1);
      E(m * 0.62, 0.02, 0.02, 0.33, 0.27, 0.025, shade(col, -0.2));
      T([[m * 0.09, 0.14, 0.07], [m * 0.18, 0.4, 0.06], [m * 0.22, 0.6, 0.04]], 0.08, 0.01);
      B(m * 0.07, 0.1, 0.17, 0.028, ey);
      T([[m * 0.04, -0.08, 0.19], [m * 0.045, -0.2, 0.18]], 0.02, 0.004, bn, 1);
    });
    E(0, -0.3, 0.06, 0.13, 0.2, 0.08);
    E(0, 0.05, 0.08, 0.17, 0.16, 0.11);
    E(0, -0.05, 0.16, 0.09, 0.07, 0.06);
    X(0, 0.0, 0.2, 0.05, 0.09, 0.03, dk);
  } else if (k === 'spider') {
    const knees = [[0.42, 0.55], [0.56, 0.35], [0.56, 0.05], [0.46, -0.25]], feet = [[0.52, 0.86], [0.86, 0.46], [0.86, -0.2], [0.6, -0.66]];
    both(function (m) {
      for (let i = 0; i < 4; i++) T([[m * 0.12, 0.26 - i * 0.07, 0.05], [m * knees[i][0], knees[i][1], 0.09], [m * feet[i][0], feet[i][1], 0.03]], 0.036, 0.014, dk);
      B(m * 0.04, 0.32, 0.15, 0.026, ey); B(m * 0.09, 0.29, 0.14, 0.02, ey);
      T([[m * 0.05, 0.33, 0.1], [m * 0.06, 0.42, 0.12], [m * 0.03, 0.47, 0.1]], 0.03, 0.008, dk);
    });
    E(0, -0.22, 0.07, 0.26, 0.3, 0.14);
    E(0, 0.2, 0.06, 0.17, 0.15, 0.1);
    B(0, -0.16, 0.2, 0.055, ac); B(0, -0.3, 0.19, 0.045, ac);
  } else if (k === 'raptor') {
    T([[-0.28, 0.0, 0.05], [-0.42, -0.3, 0.06], [-0.5, -0.72, 0.04]], 0.13, 0.15);
    T([[-0.3, 0.08, 0.06], [0.05, 0.1, 0.08], [0.52, 0.0, 0.06]], 0.15, 0.06);
    T([[-0.2, -0.06, 0.05], [0.1, -0.08, 0.06], [0.46, -0.08, 0.05]], 0.08, 0.035, dk);
    for (let i = 0; i < 7; i++) X(0.0 + i * 0.065, -0.075, 0.095, 0.022, 0.05, 0.02, bn);
    B(-0.12, 0.13, 0.15, 0.03, ey);
    X(-0.12, 0.15, 0.12, 0.16, 0.04, 0.06, dk);
    for (let i = 0; i < 3; i++) T([[-0.32, 0.12 - i * 0.05, 0.05], [-0.52, 0.28 - i * 0.1, 0.04], [-0.72, 0.3 - i * 0.16, 0.02]], sp(0.045), 0, ac);
    T([[0.2, -0.56, 0.04], [0.35, -0.42, 0.06], [0.46, -0.55, 0.05], [0.42, -0.72, 0.04]], 0.045, 0.008, bn);
  } else if (k === 'staghorn') {
    E(0, -0.62, 0.06, 0.33, 0.22, 0.1, dk);
    X(0, -0.84, 0.16, 0.02, 0.42, 0.02, ac);
    E(0, -0.28, 0.07, 0.3, 0.17, 0.12);
    E(0, 0.0, 0.07, 0.2, 0.13, 0.1);
    both(function (m) {
      T([[m * 0.1, 0.08, 0.07], [m * 0.32, 0.3, 0.09], [m * 0.36, 0.56, 0.08], [m * 0.2, 0.8, 0.05]], 0.06, 0.02, ac);
      T([[m * 0.33, 0.42, 0.09], [m * 0.18, 0.46, 0.09]], 0.026, 0.008, ac, 2);
      B(m * 0.17, 0.04, 0.12, 0.03, ey);
      for (let j = 0; j < 3; j++) T([[m * 0.25, -0.25 - j * 0.15, 0.05], [m * 0.48, -0.2 - j * 0.2, 0.05], [m * 0.6, -0.35 - j * 0.22, 0.03]], 0.03, 0.015, dk);
      T([[m * 0.15, 0.1, 0.06], [m * 0.25, 0.2, 0.06], [m * 0.3, 0.17, 0.06]], 0.012, 0.008, dk, 2);
    });
  } else if (k === 'threehorn') {
    E(0, 0.2, 0.02, 0.58, 0.46, 0.06);
    E(0, 0.26, 0.06, 0.42, 0.3, 0.025, ac);
    for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.1 - i * 0.12); B(0.58 * Math.cos(a), 0.2 + 0.46 * Math.sin(a), 0.06, 0.055, bn); }
    E(0, -0.12, 0.1, 0.2, 0.3, 0.13);
    both(function (m) { T([[m * 0.09, 0.08, 0.18], [m * 0.18, 0.4, 0.2], [m * 0.2, 0.7, 0.16]], 0.065, 0.01, bn); B(m * 0.12, 0.02, 0.18, 0.03, ey); });
    T([[0, -0.2, 0.22], [0, -0.04, 0.27]], 0.05, 0.01, bn, 2);
    T([[0, -0.3, 0.2], [0, -0.48, 0.17]], 0.07, 0.02, dk, 2);
  } else if (k === 'hardshell') {
    X(0, -0.5, 0.0, 1.32, 0.1, 0.14, dk);
    E(0, -0.15, 0.04, 0.62, 0.42, 0.16);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7 - r; i++) {
      const a = (-0.48 + r * 0.08) + i * (0.96 - r * 0.16) / Math.max(1, 6 - r), q = Math.sqrt(Math.max(0, 1 - Math.pow(a / 0.62, 2)));
      B(a, -0.15 + 0.42 * q * (0.85 - r * 0.32), 0.04 + 0.16 * q * (0.92 - r * 0.22), 0.048, (r + i) % 2 ? ac : shade(col, 0.08));
    }
    E(0.7, -0.22, 0.07, 0.14, 0.11, 0.08);
    E(0.68, -0.15, 0.09, 0.11, 0.06, 0.07, ac);
    B(0.75, -0.2, 0.14, 0.022, ey);
    T([[-0.58, -0.3, 0.05], [-0.82, -0.28, 0.05], [-0.98, -0.18, 0.05]], 0.08, 0.06);
    B(-1.02, -0.15, 0.06, 0.11, dk);
    for (const q of [[0.1, 0.06], [-0.06, 0.1], [0.08, -0.08]]) B(-1.02 + q[0], -0.15 + q[1], 0.12, 0.035, bn);
    both(function (m) { X(m * 0.38, -0.64, 0.06, 0.16, 0.18, 0.1, dk); });
  } else if (k === 'tiger') {
    both(function (m) { E(m * 0.26, -0.08, 0.05, 0.14, 0.16, 0.08); E(m * 0.24, 0.25, 0.05, 0.09, 0.09, 0.06); B(m * 0.24, 0.25, 0.1, 0.04, dk); });
    E(0, 0, 0.08, 0.32, 0.28, 0.14);
    E(0, -0.12, 0.2, 0.14, 0.1, 0.07);
    X(0, -0.065, 0.25, 0.07, 0.05, 0.04, dk);
    both(function (m) {
      B(m * 0.11, 0.06, 0.2, 0.036, ey);
      for (let j = 0; j < 3; j++) T([[m * 0.32, 0.02 - j * 0.07, 0.1], [m * 0.22, -0.0 - j * 0.06, 0.17], [m * 0.15, -0.04 - j * 0.05, 0.19]], 0.017, 0.006, dk, 2);
      T([[m * 0.05, -0.18, 0.24], [m * 0.055, -0.42, 0.22]], 0.026, 0.005, bn, 2);
    });
    for (let i = -1; i <= 1; i++) T([[i * 0.07, 0.27, 0.17], [i * 0.09, 0.19, 0.21], [i * 0.05, 0.12, 0.22]], 0.018, 0.008, dk, 2);
  } else if (k === 'mammoth') {
    both(function (m) {
      E(m * 0.4, 0.05, 0.03, 0.22, 0.26, 0.05, dk);
      T([[m * 0.12, -0.12, 0.15], [m * 0.3, -0.45, 0.17], [m * 0.42, -0.56, 0.15], [m * 0.48, -0.36, 0.13]], 0.05, 0.012, bn);
      B(m * 0.13, 0.12, 0.2, 0.025, ey);
    });
    E(0, 0.12, 0.08, 0.26, 0.32, 0.14);
    E(0, 0.38, 0.06, 0.18, 0.12, 0.1);
    for (let i = -2; i <= 2; i++) T([[i * 0.06, 0.4, 0.14], [i * 0.07, 0.3, 0.2], [i * 0.08, 0.2, 0.2]], 0.025, 0.01, ac, 2);
    T([[0, -0.08, 0.18], [0, -0.4, 0.18], [0.04, -0.68, 0.14], [0.16, -0.78, 0.12], [0.22, -0.68, 0.12]], 0.09, 0.035);
  } else {   /* longcrawler: coiled, the head at the outer end */
    const n = 16, pts = [];
    for (let i = 0; i < n; i++) { const t = i / (n - 1), th = 0.6 + t * 4.4, r = 0.1 + t * 0.52; pts.push([r * Math.cos(th), r * Math.sin(th) * 0.86, t]); }
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[Math.min(n - 1, i + 1)], o = pts[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L, ny = dx / L, rs = 0.045 + 0.04 * p[2];
      E(p[0], p[1], 0.06, rs * 1.15, rs * 1.15, rs * 0.9, i % 2 ? ac : col);
      for (const m of [-1, 1]) T([[p[0] + m * nx * rs * 0.9, p[1] + m * ny * rs * 0.9, 0.05], [p[0] + m * nx * (rs + 0.08), p[1] + m * ny * (rs + 0.08), 0.03]], 0.014, 0.006, dk, 1);
    }
    const h = pts[n - 1], g = pts[n - 2], hx = h[0] - g[0], hy = h[1] - g[1], hl = Math.hypot(hx, hy) || 1;
    E(h[0] + hx / hl * 0.08, h[1] + hy / hl * 0.08, 0.07, 0.11, 0.11, 0.09);
    for (const m of [-1, 1]) T([[h[0] + hx / hl * 0.14, h[1] + hy / hl * 0.14, 0.08], [h[0] + hx / hl * 0.3 - m * hy / hl * 0.12, h[1] + hy / hl * 0.3 + m * hx / hl * 0.12, 0.06]], 0.015, 0.006, dk, 2);
  }
}
/* a beast's relief on its own roundel or panel: the dressed ground cut back round it, a painted ring, the beast */
function brrBeastPanel(G, k, a, y, s, shape, col, P) {
  const S = brrG(G, a, 0, 0);
  if (shape === 'round') {
    /* a roundel: a disc on the face (an ellipsoid flattened into it), its rim ringed in paint */
    S.ell(0, y, 0.02 * s, 0.86 * s, 0.86 * s, 0.06 * s, 0, P && P.ground != null ? P.ground : shade(BRR.dressed, -0.06), BRR_STONE);
    S.ell(0, y, -0.03 * s, 0.95 * s, 0.95 * s, 0.08 * s, 0, P && P.ring != null ? P.ring : BRM.red, BRR_STONE);
  } else if (shape === 'panel') {
    S.box(0, y - 0.72 * s, -0.02, 1.8 * s, 1.44 * s, 0.1 * s, 0, shade(BRR.dressed, -0.06), BRR_STONE);
    S.box(0, y - 0.8 * s, 0.0, 1.96 * s, 0.08 * s, 0.14 * s, 0, P && P.ring != null ? P.ring : BRM.red, BRR_STONE);
    S.box(0, y + 0.72 * s, 0.0, 1.96 * s, 0.08 * s, 0.14 * s, 0, P && P.ring != null ? P.ring : BRM.red, BRR_STONE);
  }
  brrBeast(S, k, s * 0.92, y, col == null ? BRR.relief : col, P);
}

/* ==== 1. the gate-tree carvings in sandstone
   gtFacade's seven kinds, one variant each, kept as Mav's draws them (the jambs, the recess, the arched or square head
   and its keystone, the door by kind, the windows in the recess, the pentice, the lantern on its bracket, the kind's
   dressing on the ground before it) and re-cut: the bark collar is the raw rim, the rows of upper windows (gtUpper)
   are slots in the face, the trunk shrine's idol stands in the arch, and each head carries a beast. Opt tribe: whose
   beast is cut over the door (default by kind). */
const BRR_FAC = [
  { kind: 'storehouse', name: 'Rock-cut storehouse', W: 6.0, H: 3.8, beast: 'threehorn' },
  { kind: 'vault', name: 'Strongroom vault', W: 3.6, H: 2.6, beast: 'hardshell' },
  { kind: 'shrine', name: 'Rock shrine (arched)', W: 4.6, H: 4.2, beast: 'quetzal' },
  { kind: 'dorm', name: 'Dormitory', W: 6.6, H: 3.1, beast: 'nightwing' },
  { kind: 'inn', name: 'Rock-cut inn', W: 5.6, H: 3.4, beast: 'raptor' },
  { kind: 'barracks', name: 'Wing barracks', W: 5.6, H: 3.3, beast: 'wingclaw' },
  { kind: 'guardpost', name: 'Guard post', W: 3.4, H: 2.8, beast: 'tiger' }
];
function brrFacade(F, S) {
  const K = brrK(F), kind = S.kind, W = S.W, H = S.H, y = 0.3, hw = W / 2, jw = kind === 'vault' ? 0.6 : 0.42, nP = 0.3, nS = 0.65;
  const arched = kind === 'shrine' || kind === 'inn' || kind === 'barracks', cool = kind === 'shrine';
  const tribe = brrTribe(K.tribe, S.beast), TC = BRR_TRIBE[tribe].lin;
  const Ktop = brrTop(K, 0.62);                          /* the face is dressed to the brow of the rim */
  brrPanel(K, -hw - 0.1, hw + 0.1, 0, Ktop, 0.06);
  const P = brrPortal(K, { u: 0, y: y, W: W, H: H, jw: jw, arched: arched, nP: nP, nS: nS });
  brrRim(K, -hw - 0.1, hw + 0.1, 0, Ktop, 0.62, nS + 0.25, 'lrt');
  /* the beast over the door, on a sunk panel above the head (a vault's and a guard post's heads are low: their beast is
     on a jamb) */
  if (kind === 'vault' || kind === 'guardpost') brrBeast(K.gn(-hw + jw / 2, nS), tribe, 0.36, y + H * 0.6, BRR.relief, { accent: TC[0] });
  else {
    K.slab(-0.75, 0.75, P.yTop + 0.12, 1.2, -K.e, 0.1, shade(BRR.dressed, -0.22), BRR_STONE);
    brrBeast(K.gn(0, 0.1), tribe, 0.6, P.yTop + 0.72, BRR.relief, { accent: TC[0] });
  }
  /* the door, by kind (gtFacade's) */
  let dv = 0, dw, dh, door = 'plank';
  if (kind === 'storehouse') { dw = Math.min(2.8, W - 2 * jw - 0.8); dh = Math.min(3.0, H - 0.35); door = 'iron'; }
  else if (kind === 'vault') { dw = 1.15; dh = 1.75; door = 'vault'; }
  else if (kind === 'shrine') { dw = Math.min(2.4, W - 2 * jw - 1.2); dh = H - P.rise * 0.55 - 0.35; door = 'cool'; }
  else if (kind === 'guardpost') { dw = Math.min(2.0, W - 2 * jw - 0.4); dh = 2.3; door = 'open'; }
  else if (kind === 'inn') { dw = 1.5; dh = 2.3; door = 'glow'; }
  else if (kind === 'barracks') { dw = 1.3; dh = 2.15; door = 'iron'; }
  else { dw = 1.2; dh = 2.15; dv = -(W / 2 - jw - dw / 2 - 0.5) * 0.7; door = 'hide'; }
  brrDoor(K, dv, y, dw, dh, nP, door);
  /* windows in the recess */
  const room = W / 2 - jw - 0.3;
  if (kind === 'dorm') {
    for (let v = -room + 0.45; v <= room - 0.45 + 1e-3; v += 1.3) if (Math.abs(v - dv) > dw / 2 + 0.55) brrWin(K, v, y + 1.62, 0.55, 0.75, nP, 'shutter', F.chance(0.6) ? 'warm' : null);
  } else if (kind !== 'vault' && kind !== 'guardpost') {
    for (const sg of [-1, 1]) {
      const v = sg * (dw / 2 + room) / 2 + sg * 0.12;
      if (room - Math.abs(v) < 0.3 || Math.abs(v - dv) < dw / 2 + 0.45) continue;
      brrWin(K, v, y + (kind === 'storehouse' ? 2.45 : 1.8), kind === 'shrine' ? 0.5 : 0.62, kind === 'storehouse' ? 0.5 : 0.85, nP, kind === 'shrine' ? 'arch' : 'lattice', cool ? 'cool' : 'warm');
    }
  }
  /* the pentice: shingle on timber brackets let into the rock, eave 2.7 m over the ground */
  let top = P.yTop;
  if (kind === 'inn' || kind === 'barracks' || kind === 'dorm') {
    const yW = P.yTop + 1.75, yE = yW - 1.2;
    K.slope(-hw - 0.45, hw + 0.45, yW, -0.3, yE, 2.45, 0.14, F.pick(BRM.shingle), BRM_SHINGLE);
    K.rail(-hw - 0.45, hw + 0.45, yE - 0.22, 2.42, 0.22, 0.2, BRM.red, BRM_TIMBER);
    for (const f of [-0.78, 0.78]) { const G = K.g(hw * f); G.beam(0, yE - 1.2, nS - 0.05, 0, yE - 0.12, 2.2, 0.15, 0.15, BRM.timber[1], BRM_TIMBER); }
    top = yW + 0.15;
  }
  /* the lantern on its bracket beside the door */
  const lv = dv + (dv > 0 ? -1 : 1) * (dw / 2 + 0.6), ly = y + Math.min(H - 0.2, 2.55);
  if (Math.abs(lv) < hw - 0.1) { const G = K.g(lv); G.beam(0, ly + 0.45, nS - 0.1, 0, ly + 0.45, 1.25, 0.09, 0.09, BRM.timber[0], BRM_TIMBER); brrLamp(G, 0, ly - 0.15, 1.2, 1.2, cool); G.rod(0, ly + 0.45, 1.2, 0, ly + 0.02, 1.2, 0.015, BRM.rope, 'rope'); }
  /* the storeys above the carving (gtUpper): rows of slots in the face, a smoke shaft's vent */
  const rows = kind === 'dorm' ? 2 : (kind === 'storehouse' || kind === 'inn' || kind === 'barracks' ? 1 : 0);
  let yr = top + (kind === 'storehouse' ? 1.9 : 1.2);
  for (let r = 0; r < rows; r++) {
    const nw = kind === 'dorm' ? 4 : 2, gap = kind === 'dorm' ? (W - 1.4) / nw : 1.9;
    for (let i = 0; i < nw; i++) brrWin(K, (i - (nw - 1) / 2) * gap, yr + 0.45, 0.6, 0.85, 0.06, kind === 'dorm' ? 'slot' : (i % 2 ? 'shutter' : 'slot'), F.chance(0.5) ? 'warm' : null);
    yr += 2.9;
  }
  if (kind !== 'vault' && kind !== 'shrine' && kind !== 'guardpost') brrVent(K, hw - 0.45, Math.min((rows ? yr - 2.9 : top) + 1.2, Ktop - 1.7));
  /* the kind's dressing, on the ground before it (n 1.0 .. 2.4) */
  const sd = dv > 0 ? -1 : 1, side = W / 2 - 0.7;
  if (kind === 'barracks') {
    K.furn('br_h_shield_rack', -sd * (dw / 2 + 0.75), y + 0.25, nP + 0.02, 0, { v: 1 });
    K.furn('br_h_shield_rack', sd * (dw / 2 + 0.75), y + 0.25, nP + 0.02, 0, { v: 1 });
    K.furn('br_weapon_rack', -sd * side * 0.5, 0, 1.75, 0);
    K.furn('br_common_bench', sd * side * 0.62, 0, 1.6, 0);
    for (const sg of [-1, 1]) { const G = K.g(sg * (W / 2 - jw / 2)); G.box(0, y + 0.6, nS + 0.03, Math.min(0.62, jw + 0.15), H - 0.9, 0.04, 0, TC[0], 'cloth'); G.box(0, y + H - 0.62, nS + 0.06, 0.3, 0.3, 0.02, 0, BRM.gilt, 'cloth'); }
  } else if (kind === 'inn') {
    const G = K.g(sd * (W / 2 - 0.55)), hb = 3.05;
    G.beam(0, hb + 0.75, nS - 0.1, 0, hb + 0.75, 1.9, 0.12, 0.12, BRM.timber[0], BRM_TIMBER);
    G.rod(0, hb + 0.75, 1.45, 0, hb + 0.55, 1.45, 0.02, BRM.rope, 'rope'); G.rod(0, hb + 0.75, 1.85, 0, hb + 0.55, 1.85, 0.02, BRM.rope, 'rope');
    G.box(0, hb - 0.1, 1.65, 0.07, 0.65, 0.9, 0, BRM.red, BRM_TIMBER);
    G.box(0, hb + 0.1, 1.65, 0.09, 0.3, 0.42, 0, BRM.gilt, BRM_TIMBER);
    K.furn('br_common_bench', -sd * side * 0.5, 0, 1.55, 0);
    K.furn('br_h_barrel_cluster', sd * side * 0.62, 0, 1.75, 0, { v: 0 });
  } else if (kind === 'storehouse') {
    const G = K.g(0), hy = P.yTop + 1.75;
    G.beam(0, hy, -0.3, 0, hy, 2.3, 0.24, 0.28, BRM.timber[0], BRM_TIMBER);
    G.beam(0, hy - 0.5, nS, 0, hy - 0.08, 1.4, 0.14, 0.14, BRM.timber[2], BRM_TIMBER);
    G.rod(0, hy - 0.1, 2.1, 0, 1.4, 2.1, 0.03, BRM.rope, 'rope');
    G.ell(0, 1.15, 2.1, 0.3, 0.28, 0.3, 0, BRM.hide, 'cloth');
    G.beam(-dw / 2 - 0.4, y + dh + 0.95, -0.2, -dw / 2 - 0.4, y + dh + 0.42, 1.5, 0.1, 0.1, BRM.timber[2], BRM_TIMBER);
    K.slope(-dw / 2 - 0.5, dw / 2 + 0.5, y + dh + 1.0, -0.3, y + dh + 0.45, 1.6, 0.12, F.pick(BRM.shingle), BRM_SHINGLE);
    K.furn('br_h_crate_stack', -side * 0.92, 0, 1.6, 0, { v: 1 });
    K.furn('br_h_sack_pile', side * 0.9, 0, 1.55, 0, { v: 1 });
  } else if (kind === 'dorm') {
    K.furn('br_common_bench', sd * side * 0.45, 0, 1.55, 0);
    K.furn('br_h_water_butt', -sd * side * 0.85, 0, 1.55, 0, { v: 0 });
  } else if (kind === 'vault') {
    const nv = sd * (dw / 2 + 0.68);
    K.g(nv).box(0, y + 0.02, nP + 0.005, 0.7, 2.0, 0.02, 0, BRR.void, BRR_STONE);
    K.furn('br_common_stool', sd * (W / 2 - 0.35), 0, 1.4, 0);
    const G = K.g(sd * (W / 2 - 0.1)); G.rod(-0.1, 0, 1.5, -0.14, 2.4, 1.2, 0.025, BRM.timber[3], BRM_TIMBER); G.cone(-0.14, 2.38, 1.2, 0.05, 0.25, 0, BRR.iron, 'metal');
    K.furn('br_h_shield_rack', -sd * (W / 2 - jw / 2), 1.1, nS + 0.02, 0, { v: 1 });
  } else if (kind === 'shrine') {
    K.furn('br_h_shrine_drum', sd * (dw / 2 + 0.62), 0, 1.6, 0, { v: F.chance(0.5) ? 1 : 0 });
    const G = K.g(-sd * (dw / 2 + 0.62)); brrLamp(G, 0, 0.9, 1.4, 1.4, true); G.frustum(0, 0, 1.4, 0.28, 0.2, 0.9, 0, BRR.dressed, BRR_STONE, 8);
    brrClaw(K.g(0), 0, P.yTop + 1.65, 0.1, 1.1, BRR.green, BRM.gilt);
  } else if (kind === 'guardpost') {
    K.furn('br_weapon_rack', sd * side * 0.55, 0, 1.5, 0);
    K.furn('br_common_stool', -sd * side * 0.6, 0, 1.4, 0);
    K.furn('br_h_shield_rack', -sd * (W / 2 - jw / 2), 1.1, nS + 0.02, 0, { v: 1 });
    brrLamp(K.g(0), 0, y + dh - 0.5, nP + 0.25, 1, false);
  }
}
ASSET({
  key: 'br_bldg_rock_facade', name: 'Rock-cut facade (the gate-tree carvings in sandstone)', culture: 'beast-rider',
  family: 'housing', types: ['dwelling-multi', 'religious', 'inn'], districts: ['ridertown'], wealth: [0, 1],
  w: 8.3, d: 3.1, h: 12.5, variants: BRR_FAC.length, variantNames: BRR_FAC.map(function (S) { return S.name; }),
  variantDims: [{ w: 7.7, d: 3.0, h: 9.6 }, { w: 5.3, d: 2.2, h: 5.0 }, { w: 6.3, d: 2.8, h: 7.6 }, { w: 8.3, d: 3.1, h: 12.4 },
    { w: 7.3, d: 3.1, h: 9.6 }, { w: 7.3, d: 3.1, h: 9.6 }, { w: 5.1, d: 2.3, h: 5.0 }],
  build: function (F) { brrFacade(F, BRR_FAC[F.variant] || BRR_FAC[0]); }
});


/* ==== 2. door surrounds with beast heads
   v0 a square door under a lintel on two corbels, a beast's head jutting from each (facing out, as the ridge finials
   of a stave hall); v1 an arch whose keystone is a beast's head; v2 a great double door, two beasts facing each other
   over it on a frieze of claws. Opt tribe: whose beast (default by variant). */
const BRR_DOORS = [
  { name: 'Door on beast-head corbels', W: 3.0, beast: 'raptor' },
  { name: 'Arch with a beast keystone', W: 3.0, beast: 'threehorn' },
  { name: 'Great double door', W: 5.0, beast: 'quetzal' }];
function brrDoorPiece(F, v) {
  const S = BRR_DOORS[v] || BRR_DOORS[0], K = brrK(F), W = S.W, hw = W / 2, y = 0.25, top = brrTop(K, 0.55);
  const tribe = brrTribe(K.tribe, S.beast), TC = BRR_TRIBE[tribe].lin, col = BRR.dressed;
  brrPanel(K, -hw, hw, 0, top, 0.06);
  brrRim(K, -hw, hw, 0, top, 0.55, 0.9, 'lrt');
  if (v === 0) {
    const dw = 1.3, dh = 2.35, jw = (W - dw - 0.4) / 2, yc = y + dh + 0.1;
    K.slab(-hw, hw, 0, y, -K.e, 0.78, shade(col, -0.12), BRR_STONE);
    K.slab(-hw, -hw + jw, y, dh + 0.1, -K.e, 0.62, col, BRR_STONE);
    K.slab(hw - jw, hw, y, dh + 0.1, -K.e, 0.62, col, BRR_STONE);
    K.slab(-hw + jw, hw - jw, y, dh + 0.1, -K.e, 0.3, shade(col, -0.32), BRR_STONE);
    brrDoor(K, 0, y, dw, dh - 0.05, 0.3, 'hide');
    for (const m of [-1, 1]) {
      const u = m * (hw - jw / 2);
      K.slab(u - jw / 2, u + jw / 2, yc, 0.3, -K.e, 0.78, shade(col, 0.04), BRR_STONE);
      K.slab(u - jw / 2 - 0.05, u + jw / 2 + 0.05, yc + 0.3, 0.32, -K.e, 0.95, shade(col, 0.08), BRR_STONE);
      /* the head juts out of the corbel, facing out of the wall */
      brrBeast(K.gn(u, 0.7, -Math.PI / 2), tribe, 0.5, yc + 0.18, BRR.relief, { accent: TC[0], depth: 3.2 });
      brrLamp(K.gn(u, 0.62), 0, y + 1.75, 0.1, 1.1);
    }
    K.slab(-hw - 0.1, hw + 0.1, yc + 0.62, 0.62, -K.e, 0.98, shade(col, 0.06), BRR_STONE);
    K.slab(-hw - 0.05, hw + 0.05, yc + 0.68, 0.1, 0.98, 1.0, BRM.red, BRR_STONE);
    K.slab(-hw - 0.05, hw + 0.05, yc + 1.12, 0.06, 0.98, 1.0, BRM.gilt, BRR_STONE);
    brrClaw(K.gn(0, 0.98), 0, yc + 0.93, 0, 0.36, BRR.green, BRM.gilt);
  } else if (v === 1) {
    const P = brrPortal(K, { u: 0, y: y, W: W, H: 2.9, jw: 0.5, arched: true, rise: 0.95, nP: 0.3, nS: 0.66, keystone: false, headH: 0.5 });
    brrDoor(K, 0, y, 1.4, 2.1, 0.3, 'iron');
    /* the keystone is the beast's head, front on, jutting out over the arch */
    K.slab(-0.4, 0.4, P.yHead - 0.5, P.yTop - P.yHead + 0.62, -K.e, 0.82, shade(col, -0.1), BRR_STONE);
    brrBeast(K.gn(0, 0.82), tribe, 0.62, P.yHead + 0.05, BRR.relief, { accent: TC[0], depth: 2.4 });
    for (const m of [-1, 1]) {
      const G = K.gn(m * (hw - 0.25), 0.66);
      G.box(0, y + 1.5, -0.25, 0.32, 0.46, 0.3, 0, BRR.shadow, BRR_STONE);
      brrLamp(G, 0, y + 1.52, -0.05, 1);
      G.box(0, y + 1.42, 0.0, 0.42, 0.08, 0.12, 0, shade(col, 0.08), BRR_STONE);
    }
  } else {
    const dw = 2.8, dh = 3.4, P = brrPortal(K, { u: 0, y: y, W: W, H: dh + 0.15, jw: 0.7, nP: 0.32, nS: 0.72, headH: 0.7, keystone: false });
    brrDoor(K, 0, y, dw, dh, 0.32, 'iron');
    const G = K.gn(0, 0.32);
    for (const m of [-1, 1]) for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) G.ball(m * (0.32 + c * 0.42), y + 0.45 + r * 0.85, 0.2, 0.045, BRM.gilt, BRR_STONE);
    G.cyl(-0.25, y + 1.6, 0.21, 0.12, 0.05, 0, BRR.iron, 'metal'); G.cyl(0.25, y + 1.6, 0.21, 0.12, 0.05, 0, BRR.iron, 'metal');
    /* the frieze over the head: claws between two beasts that face each other */
    const yf = P.yTop + 0.05;
    K.slab(-hw - 0.1, hw + 0.1, yf, 1.25, -K.e, 0.5, shade(col, -0.18), BRR_STONE);
    K.slab(-hw - 0.15, hw + 0.15, yf + 1.25, 0.24, -K.e, 0.66, shade(col, 0.08), BRR_STONE);
    for (let i = -1; i <= 1; i++) brrClaw(K.gn(i * 0.62, 0.5), 0, yf + 0.62, 0, 0.42, i ? BRR.green : BRM.gilt, i ? BRM.gilt : BRR.green);
    for (const m of [-1, 1]) brrBeast(K.gn(m * (hw - 0.75), 0.5), tribe, 0.62, yf + 0.62, BRR.relief, { accent: TC[0], flip: m > 0, depth: 2.0 });
    K.furn('br_h_post_brazier', -hw + 0.4, 0, 1.25, 0);
    K.furn('br_h_post_brazier', hw - 0.4, 0, 1.25, 0);
  }
}
ASSET({
  key: 'br_bldg_rock_door', name: 'Rock-cut door surround with beast heads', culture: 'beast-rider',
  family: 'housing', types: ['dwelling-multi', 'civic'], districts: ['ridertown'], wealth: [0, 1],
  w: 6.4, d: 2.4, h: 6.6, variants: BRR_DOORS.length, variantNames: BRR_DOORS.map(function (S) { return S.name; }),
  variantDims: [{ w: 4.3, d: 1.6, h: 5.0 }, { w: 4.3, d: 1.8, h: 5.0 }, { w: 6.4, d: 2.4, h: 6.6 }],
  build: function (F) { brrDoorPiece(F, F.variant); }
});

/* ==== 3. window slots
   A window cut into the face, up a wall (place it with opt.y): v0 a tall slot with a splayed reveal; v1 a row of three
   under one hood, red shutters open on the face; v2 an arched pair either side of a carved mullion, a timber lattice,
   a window box; v3 a round light, its grille a claw in stone. The piece is the carving and its rim, from y 0. */
const BRR_WINDOWS = ['Tall slot', 'Row of three, shuttered', 'Arched pair with a lattice', 'Round light'];
function brrWindowPiece(F, v) {
  const K = brrK(F), hw = K.W / 2 - 0.5, y0 = 0.5, y1 = brrTop(K, 0.42), yc = (y0 + y1) / 2, lit = F.chance(0.5) ? 'warm' : null;
  brrPanel(K, -hw, hw, y0 - 0.1, y1, 0.08);
  brrRim(K, -hw, hw, y0, y1, 0.42, 0.5, 'lrtb');
  if (v === 0) {
    const G = K.g(0);
    for (const m of [-1, 1]) G.beam(m * 0.25, y0 + 0.25, 0.3, m * 0.42, y0 + 0.25, 0.1, 0.1, 0.1, BRR.shadow, BRR_STONE);
    brrWin(K, 0, yc, 0.42, 1.55, 0.18, 'slot', lit);
    G.box(0, y0 + 0.08, 0.15, 0.95, 0.2, 0.32, 0, shade(BRR.dressed, 0.06), BRR_STONE);
  } else if (v === 1) {
    for (let i = -1; i <= 1; i++) brrWin(K, i * 1.12, yc - 0.05, 0.6, 0.9, 0.1, i === 0 ? 'slot' : 'shutter', i === 0 ? lit : null);
    K.slab(-hw + 0.15, hw - 0.15, yc + 0.55, 0.26, -K.e, 0.42, shade(BRR.dressed, 0.06), BRR_STONE);
    K.slab(-hw + 0.1, hw - 0.1, yc + 0.6, 0.08, 0.42, 0.44, BRM.red, BRR_STONE);
  } else if (v === 2) {
    for (const m of [-1, 1]) brrWin(K, m * 0.52, yc - 0.25, 0.6, 1.0, 0.12, 'arch', lit);
    for (const m of [-1, 1]) { const G = K.g(m * 0.52); for (let i = 1; i < 3; i++) G.box(-0.3 + 0.6 * i / 3, yc - 0.75, 0.16, 0.04, 1.0, 0.05, 0, BRM.timber[2], BRM_TIMBER); G.box(0, yc - 0.3, 0.16, 0.6, 0.04, 0.05, 0, BRM.timber[2], BRM_TIMBER); }
    const G = K.g(0);
    G.cyl(0, yc - 0.75, 0.14, 0.11, 1.45, 0, shade(BRR.dressed, 0.08), BRR_STONE);
    G.box(0, yc + 0.68, 0.14, 0.34, 0.16, 0.34, 0, shade(BRR.dressed, 0.04), BRR_STONE);
    K.furn('br_h_window_box', -0.52, yc - 1.75, 0.3, 0);
  } else {
    const G = K.gn(0, 0.12), r = 0.62;
    G.ell(0, yc, 0.0, r + 0.22, r + 0.22, 0.2, 0, shade(BRR.dressed, 0.08), BRR_STONE);
    G.ell(0, yc, 0.05, r, r, 0.16, 0, lit ? BRR_GLOW.dim : BRR.void, lit ? 'glow' : BRR_STONE);
    /* the grille: the claw's three slashes in stone across the light, its boss gilt */
    brrClaw(G, 0, yc, 0.2, r * 1.6, shade(BRR.dressed, 0.04), null);
    G.ell(0, yc, 0.18, 0.12, 0.12, 0.08, 0, BRM.gilt, BRR_STONE);
  }
}
ASSET({
  key: 'br_bldg_rock_window', name: 'Rock-cut window', culture: 'beast-rider',
  family: 'housing', types: ['dwelling-multi'], districts: ['ridertown'], wealth: [0, 1],
  w: 4.8, d: 1.1, h: 3.4, variants: BRR_WINDOWS.length, variantNames: BRR_WINDOWS,
  variantDims: [{ w: 2.0, d: 1.1, h: 3.2 }, { w: 4.8, d: 1.1, h: 2.6 }, { w: 2.8, d: 1.1, h: 3.4 }, { w: 2.8, d: 1.1, h: 2.8 }],
  build: function (F) { brrWindowPiece(F, F.variant); }
});

/* ==== 4. a balcony ledge cut from the face (gtBalcony)
   The ledge left standing when the face was cut back, on stepped corbels with beast heads, a timber rail of red posts
   and rope, a door behind it and a window beside, a hide awning on poles let into the rock. Its floor is 1.5 m over the
   piece's foot (the corbels): a world places it at opt.y = the floor - 1.5. v0 a balcony, v1 a gallery of two doors. */
function brrBalconyPiece(F, v) {
  const K = brrK(F), L = v === 1 ? 7.0 : 3.6, hl = L / 2, yf = 1.5, out = 1.6, nB = 0.12;
  const tribe = brrTribe(K.tribe, 'wingclaw'), TC = BRR_TRIBE[tribe].lin, col = BRR.dressed;
  brrPanel(K, -hl - 0.2, hl + 0.2, 0.0, brrTop(K, 0.4), nB);
  brrRim(K, -hl - 0.2, hl + 0.2, 0.0, brrTop(K, 0.4), 0.4, 0.5, 'lrt');
  /* the ledge: a slab of the rock, its edge under a moulding */
  K.slab(-hl, hl, yf - 0.32, 0.32, -K.e, out, shade(col, 0.04), BRR_STONE);
  K.slab(-hl - 0.05, hl + 0.05, yf - 0.42, 0.12, nB, out + 0.06, shade(col, -0.1), BRR_STONE);
  /* the corbels: three steps out, a beast's head on the front of each */
  const nc = v === 1 ? 3 : 2;
  for (let i = 0; i < nc; i++) {
    const u = -hl + 0.55 + i * (L - 1.1) / (nc - 1);
    K.slab(u - 0.3, u + 0.3, 0.0, 0.5, -K.e, 0.45, shade(col, -0.06), BRR_STONE);
    K.slab(u - 0.32, u + 0.32, 0.5, 0.5, -K.e, 0.9, shade(col, -0.02), BRR_STONE);
    K.slab(u - 0.34, u + 0.34, 1.0, 0.18, -K.e, 1.3, col, BRR_STONE);
    brrBeast(K.gn(u, 0.9), tribe, 0.36, 0.72, BRR.relief, { accent: TC[0], depth: 2.2 });
  }
  /* the rail: red posts with gilt caps, a top rail, rope between */
  const np = Math.max(3, Math.round(L / 0.9));
  for (let i = 0; i <= np; i++) { const G = K.g(-hl + 0.1 + (L - 0.2) * i / np); G.box(0, yf, out - 0.1, 0.1, 1.0, 0.1, 0, BRM.red, BRM_TIMBER); G.box(0, yf + 1.0, out - 0.1, 0.15, 0.06, 0.15, 0, BRM.gilt, BRM_TIMBER); }
  K.rail(-hl + 0.1, hl - 0.1, yf + 0.95, out - 0.1, 0.08, 0.1, BRM.timber[2], BRM_TIMBER);
  K.rail(-hl + 0.1, hl - 0.1, yf + 0.5, out - 0.1, 0.03, 0.03, BRM.rope, 'rope');
  for (const m of [-1, 1]) { const G = K.g(m * (hl - 0.1)); G.beam(0, yf + 0.95, 0.15, 0, yf + 0.95, out - 0.1, 0.08, 0.1, BRM.timber[2], BRM_TIMBER); }
  /* doors and a window on the ledge, under the awning */
  const doors = v === 1 ? [-hl + 1.3, hl - 1.3] : [-0.55];
  doors.forEach(function (u) {
    brrPortal(K, { u: u, y: yf, W: 1.6, H: 2.05, jw: 0.2, arched: true, rise: 0.4, nP: nB, nS: nB + 0.2, plinth: 0.0, headH: 0.25, band: false });
    brrDoor(K, u, yf, 1.0, 2.0, nB, 'hide');
  });
  brrWin(K, v === 1 ? 0 : 1.05, yf + 1.4, 0.6, 0.75, nB, v === 1 ? 'lattice' : 'shutter', F.chance(0.6) ? 'warm' : null);
  const yA = yf + 2.85;
  K.slope(-hl, hl, yA + 0.4, -0.25, yA - 0.25, out + 0.1, 0.05, BRM.hide, 'hide');
  for (const m of [-1, 1]) { const G = K.g(m * (hl - 0.15)); G.beam(0, yA + 0.2, 0.1, 0, yA - 0.2, out, 0.08, 0.08, BRM.timber[1], BRM_TIMBER); G.rod(0, yA - 0.22, out, 0, yf + 1.0, out - 0.1, 0.012, BRM.rope, 'rope'); }
  const lu = v === 1 ? 0 : -1.6;
  brrLamp(K.gn(lu, nB), 0, yf + 2.3, 0.15, 1.1);
  K.g(lu).box(0, yf + 2.22, nB + 0.1, 0.3, 0.08, 0.22, 0, shade(col, 0.08), BRR_STONE);
  if (v === 1) K.furn('br_common_bench', 0, yf, 0.55, 0);
  else K.furn('br_common_stool', 1.0, yf, 0.75, 0);
}
ASSET({
  key: 'br_bldg_rock_balcony', name: 'Rock-cut balcony ledge', culture: 'beast-rider',
  family: 'housing', types: ['dwelling-multi'], districts: ['ridertown'], wealth: [0, 1],
  w: 8.6, d: 2.3, h: 5.5, variants: 2, variantNames: ['Balcony', 'Gallery ledge (two doors)'],
  variantDims: [{ w: 5.2, d: 2.3, h: 5.5 }, { w: 8.6, d: 2.3, h: 5.5 }],
  build: function (F) { brrBalconyPiece(F, F.variant); }
});

/* ==== 5. a stair cut into the face
   A flight of steps cut out of the rock along the face, the rock under it left solid, a parapet of the raw rock on its
   open side, a rope rail on iron pins along the wall, a landing and an arched door at the top (3.2 m up), a lamp.
   v0 rises to the right, v1 to the left, v2 two flights rising to one landing in the middle. */
function brrStairPiece(F, v) {
  const K = brrK(F), rise = 0.2, tread = 0.3, n = 16, H = n * rise, run = n * tread, dep = 1.15, land = 1.4, col = BRR.dressed;
  const flights = v === 2 ? [[-1, -land / 2], [1, land / 2]] : [[v === 1 ? -1 : 1, 0]];
  const span = v === 2 ? run * 2 + land : run + land, u0 = -span / 2;
  brrPanel(K, u0 - 0.2, -u0 + 0.2, 0, brrTop(K, 0.35), 0.06);
  brrRim(K, u0 - 0.2, -u0 + 0.2, 0, brrTop(K, 0.35), 0.35, 0.4, 'lrt');
  /* the landing at the flights' top, a door over it, a lamp beside the door */
  const ul = v === 2 ? 0 : (v === 1 ? u0 + land / 2 : -u0 - land / 2), lu = v === 1 ? ul + 0.95 : (v === 2 ? 0.95 : ul - 0.95);
  K.slab(ul - land / 2, ul + land / 2, 0, H, -K.e, dep, shade(col, -0.04), BRR_STONE);
  brrPortal(K, { u: ul, y: H, W: 1.5, H: 2.1, jw: 0.22, arched: true, rise: 0.45, nP: 0.06, nS: 0.3, plinth: 0.0, headH: 0.3, band: false });
  brrDoor(K, ul, H, 0.95, 2.05, 0.06, 'plank');
  brrLamp(K.gn(lu, 0.06), 0, H + 1.9, 0.18, 1.1);
  K.g(lu).box(0, H + 1.82, 0.16, 0.3, 0.08, 0.24, 0, shade(col, 0.08), BRR_STONE);
  flights.forEach(function (fl) {
    const dir = fl[0], top = ul + fl[1], foot = top - dir * run;     /* the flight climbs toward dir, to the landing */
    for (let i = 0; i < n; i++) {
      const ua = top - dir * (i + 1) * tread, ub = top - dir * i * tread, hh = H - i * rise;
      K.slab(Math.min(ua, ub), Math.max(ua, ub), 0, hh, -K.e, dep, i % 2 ? col : shade(col, -0.05), BRR_STONE);
      K.slab(Math.min(ua, ub), Math.max(ua, ub), hh - 0.04, 0.04, dep - 0.04, dep + 0.03, shade(col, 0.1), BRR_STONE);
    }
    /* the parapet on the open side: raw rock, its top following the flight; a rope rail on iron pins along the wall */
    for (let i = 0; i < 8; i++) {
      const ua = foot + dir * i * run / 8, ub = foot + dir * (i + 1) * run / 8, hh = rise * 2 * (i + 1) + 0.7;
      K.slab(Math.min(ua, ub), Math.max(ua, ub), 0, hh * F.rr(0.95, 1.05), -K.e + 0.1, dep + 0.32, shade(F.pick(BRR.rock), F.rr(-0.06, 0.04)), BRR_RAW);
    }
    for (let i = 0; i <= 4; i++) { const u = foot + dir * (i * run / 4), hy = rise * (i * n / 4) + 0.95; K.g(u).box(0, hy - 0.05, 0.12, 0.05, 0.1, 0.12, 0, BRR.iron, 'metal'); }
    const pa = K.at(foot, 0.18), pb = K.at(top, 0.18);
    F.rod(pa[0], 0.95, pa[1], pb[0], H + 0.95, pb[1], 0.022, BRM.rope, 'rope');
  });
}
ASSET({
  key: 'br_bldg_rock_stair', name: 'Stair cut into the face', culture: 'beast-rider',
  family: 'infrastructure', types: ['infrastructure'], districts: ['ridertown'], wealth: [0, 1],
  w: 12.3, d: 2.0, h: 6.4, variants: 3, variantNames: ['Rising right', 'Rising left', 'Two flights to a landing'],
  variantDims: [{ w: 7.5, d: 2.0, h: 6.4 }, { w: 7.5, d: 2.0, h: 6.4 }, { w: 12.3, d: 2.0, h: 6.4 }],
  build: function (F) { brrStairPiece(F, F.variant); }
});


/* ==== 6. rock-cut room fronts (Mav's room fronts re-cut)
   The face of a room cut into the rock, as Mav's Refuge's levels front theirs (56-levels.js lvlApt, lvlStore, lvlWork;
   the kit's br_port_mavs_room_front): v0 an apartment (a door under a hide, shuttered windows, a window box, the
   hearth's smoke shaft, washing on a line); v1 a store (iron-banded double doors under a hood, a hoist and its sack, a
   tally cut in the jamb, crates and sacks); v2 a workshop (an open arch on the lit room, a counter under a hide awning,
   the forge's soot, planks); v3 a roost cell for the flyers (a tall arch on the dark, a landing lip with straw spilling
   out, a perch beam streaked white, a feed basket, the hide furled over the opening). The room behind is
   kits/interiors/sets/beast-rider-rock.js's item for the same key and variant. */
const BRR_ROOMS = [
  { kind: 'apt', name: 'Apartment front', beast: 'staghorn' },
  { kind: 'store', name: 'Store front', beast: 'hardshell' },
  { kind: 'work', name: 'Workshop front', beast: 'mammoth' },
  { kind: 'roost', name: 'Roost cell (flyers)', beast: 'quetzal' }];
function brrRoomFront(F, v) {
  const S = BRR_ROOMS[v] || BRR_ROOMS[0], K = brrK(F), W = 6.4, hw = W / 2, top = brrTop(K, 0.55), y = 0.3, col = BRR.dressed;
  const tribe = brrTribe(K.tribe, S.beast), TC = BRR_TRIBE[tribe].lin;
  brrPanel(K, -hw, hw, 0, top, 0.06);
  brrRim(K, -hw, hw, 0, top, 0.55, 0.85, 'lrt');
  if (S.kind !== 'roost') K.slab(-hw, hw, 0, y, -K.e, 0.45, shade(col, -0.12), BRR_STONE);
  if (S.kind === 'apt') {
    const P = brrPortal(K, { u: -1.4, y: y, W: 1.7, H: 2.3, jw: 0.25, arched: true, rise: 0.35, nP: 0.06, nS: 0.36, plinth: 0.0, headH: 0.32 });
    brrDoor(K, -1.4, y, 1.1, 2.2, 0.06, 'hide');
    brrBeast(K.gn(-1.4, 0.36), tribe, 0.34, P.yTop + 0.3, BRR.relief, { accent: TC[0], depth: 2.0 });
    const lit = F.chance(0.6) ? 'warm' : null;
    brrWin(K, 0.65, y + 1.55, 0.72, 0.9, 0.06, 'shutter', lit);
    brrWin(K, 2.25, y + 1.55, 0.72, 0.9, 0.06, 'shutter', F.chance(0.5) ? 'warm' : null);
    K.furn('br_h_window_box', 0.65, y + 1.0 - 0.14 - 0.86, 0.22, 0);
    for (const u of [-1.4, 1.45]) brrWin(K, u, y + 3.95, 0.55, 0.75, 0.06, 'slot', F.chance(0.4) ? 'warm' : null);
    brrVent(K, 2.6, y + 4.1);
    const G = K.g(-0.35); G.beam(0, y + 2.4, 0.06, 0, y + 2.4, 0.75, 0.08, 0.08, BRM.timber[0], BRM_TIMBER); brrLamp(G, 0, y + 1.95, 0.72, 1.1); G.rod(0, y + 2.4, 0.72, 0, y + 2.08, 0.72, 0.012, BRM.rope, 'rope');
    K.furn('br_h_water_butt', -2.65, 0, 0.95, 0, { v: 0 });
    K.furn('br_h_cloth_line', 1.45, 0, 1.55, 0, { v: 2 });
  } else if (S.kind === 'store') {
    const P = brrPortal(K, { u: -0.6, y: y, W: 3.4, H: 3.0, jw: 0.38, nP: 0.3, nS: 0.62, plinth: 0.0, headH: 0.55, keystone: false });
    brrDoor(K, -0.6, y, 2.5, 2.85, 0.3, 'iron');
    K.slab(-0.95, -0.25, P.yHead - 0.05, 0.65, -K.e, 0.72, shade(col, -0.12), BRR_STONE);
    brrBeast(K.gn(-0.6, 0.72), tribe, 0.36, P.yHead + 0.27, BRR.relief, { accent: TC[0], depth: 2.0 });
    K.slope(-2.45, 1.25, P.yTop + 0.5, -0.3, P.yTop - 0.05, 1.5, 0.12, F.pick(BRM.shingle), BRM_SHINGLE);
    for (const u of [-2.2, 1.0]) K.g(u).beam(0, P.yTop - 0.75, 0.6, 0, P.yTop - 0.05, 1.35, 0.1, 0.1, BRM.timber[2], BRM_TIMBER);
    /* the tally cut beside the door: strokes in fives, a gilt mark of the store's owner */
    const T = K.gn(2.15, 0.06);
    T.box(0, y + 0.9, -0.02, 0.95, 1.5, 0.06, 0, shade(col, -0.2), BRR_STONE);
    for (let g = 0; g < 3; g++) for (let i = 0; i < 5; i++) {
      const yy = y + 1.05 + g * 0.45;
      if (i < 4) T.box(-0.3 + i * 0.1, yy, 0.02, 0.03, 0.32, 0.03, 0, BRR.shadow, BRR_STONE);
      else T.beam(-0.38, yy + 0.04, 0.03, 0.02, yy + 0.28, 0.03, 0.03, 0.03, BRR.shadow, BRR_STONE);
    }
    T.ell(0.32, y + 2.15, 0.03, 0.12, 0.12, 0.04, 0, BRM.gilt, BRR_STONE);
    const H = K.g(-0.6), hy = P.yTop + 1.45;
    H.beam(0, hy, -0.3, 0, hy, 2.1, 0.24, 0.28, BRM.timber[0], BRM_TIMBER);
    H.beam(0.0, hy - 0.8, 0.06, 0, hy - 0.08, 1.2, 0.13, 0.13, BRM.timber[2], BRM_TIMBER);
    H.rod(0, hy - 0.1, 1.95, 0, 1.6, 1.95, 0.03, BRM.rope, 'rope');
    H.ell(0, 1.35, 1.95, 0.28, 0.28, 0.28, 0, BRM.hide, 'cloth');
    for (const u of [-2.3, 1.8]) brrWin(K, u, P.yTop + 1.4, 0.55, 0.7, 0.06, 'slot', null);
    K.furn('br_h_crate_stack', 2.3, 0, 1.25, 0, { v: 1 });
    K.furn('br_h_sack_pile', -2.6, 0, 1.15, 0, { v: 1 });
    K.furn('br_h_barrel_cluster', 1.05, 0, 1.55, 0, { v: 0 });
  } else if (S.kind === 'work') {
    const P = brrPortal(K, { u: -0.4, y: y, W: 4.4, H: 2.9, jw: 0.4, arched: true, rise: 0.75, nP: 0.06, nS: 0.42, plinth: 0.0, headH: 0.4 });
    brrDoor(K, -0.4, y, 3.4, 2.9, 0.06, 'glow');
    brrBeast(K.gn(-0.4, 0.42), tribe, 0.36, P.yTop + 0.35, BRR.relief, { accent: TC[0], depth: 2.0 });
    K.furn('br_h_work_counter', -0.4, 0, 1.05, 0, { v: 1 });
    /* the awning: a hide on a pole frame, two posts in front */
    const yA = P.yTop + 0.95;
    K.slope(-2.9, 2.1, yA, -0.2, yA - 0.85, 2.25, 0.05, shade(BRM.hide, 0.05), 'hide');
    for (const u of [-2.7, 1.9]) { const G = K.g(u); G.rod(0, 0, 2.15, 0, yA - 0.85, 2.15, 0.06, BRM.timber[1], BRM_TIMBER); G.rod(0, yA - 0.8, 2.15, 0, yA - 0.1, 0.1, 0.045, BRM.timber[1], BRM_TIMBER); }
    /* the forge's soot: a broad black plume up the face from the smoke shaft */
    brrVent(K, 2.55, P.yTop + 0.2);
    for (let i = 0; i < 3; i++) K.g(2.55).box(0, P.yTop + 1.4 + i * 0.45, 0.072, 0.9 - i * 0.2, 0.45, 0.02, 0, shade(BRR.soot, 0.1 + i * 0.1), BRR_STONE);
    /* tools on pegs in the jamb */
    const T = K.gn(-2.55, 0.42);
    for (let i = 0; i < 3; i++) { T.box(-0.12 + i * 0.12, y + 1.3, 0.04, 0.03, 0.75 - i * 0.15, 0.03, 0, BRM.timber[2], BRM_TIMBER); T.box(-0.12 + i * 0.12, y + 1.3, 0.05, 0.12, 0.1, 0.04, 0, BRR.iron, 'metal'); }
    K.furn('br_h_plank_stack', 2.35, 0, 1.15, 0, { v: 1 });
    K.furn('br_h_water_butt', -2.75, 0, 1.0, 0, { v: 0 });
  } else {
    /* the roost cell: its lip is the floor of the cell, at the piece's foot */
    const P = brrPortal(K, { u: 0, y: y, W: 5.0, H: 4.3, jw: 0.45, arched: true, rise: 1.05, nP: 0.06, nS: 0.5, plinth: 0.3, headH: 0.45, keystone: false });
    brrDoor(K, 0, y, 4.05, 4.2, 0.06, 'open');
    K.slab(-2.5, 2.5, 0, y, -K.e, 1.9, shade(col, -0.08), BRR_STONE);
    K.slab(-2.55, 2.55, -0.18, 0.2, 0.3, 2.0, shade(col, -0.18), BRR_STONE);
    /* straw spilling out over the lip, a nest heap just inside */
    for (let i = 0; i < 9; i++) { const G = K.g(F.rr(-1.8, 1.8)); G.box(0, y, F.rr(0.3, 1.3), F.rr(0.5, 1.0), 0.06, F.rr(0.3, 0.6), F.rr(-0.6, 0.6), shade(BRM.straw, F.rr(-0.1, 0.05)), 'straw/cloth'); }
    K.g(-0.9).dome(0, y, 0.3, 0.75, 0.42, 0, BRM.straw, 'straw/cloth');
    /* the perch beam out of the face, its perch bar across the end, white streaks below it */
    const G = K.g(2.3);
    G.beam(0, 3.35, -0.3, 0, 3.5, 2.45, 0.24, 0.24, shade(BRM.timber[1], 0.05), 'guano/wood');
    G.rod(-0.8, 3.68, 2.25, 0.8, 3.68, 2.25, 0.09, shade(BRM.timber[1], 0.05), 'guano/wood');
    G.box(0, 3.62, 2.25, 0.22, 0.12, 0.22, 0, BRR.iron, 'metal');
    for (let i = 0; i < 3; i++) K.g(2.12 + i * 0.13).box(0, 1.2 + i * 0.35, 0.505, 0.05, 2.0 - i * 0.35, 0.015, 0, shade(BRR.white, -0.05 * i), 'guano/wood');
    /* the hide, furled on its pole over the opening, one flap let down */
    const Q = K.g(0);
    Q.rod(-2.3, P.yHead - 0.3, 0.62, 2.3, P.yHead - 0.3, 0.62, 0.05, BRM.timber[2], BRM_TIMBER);
    Q.rod(-2.1, P.yHead - 0.45, 0.66, 2.1, P.yHead - 0.45, 0.66, 0.15, BRM.hide, 'hide');
    Q.box(-1.75, P.yHead - 2.4, 0.66, 0.6, 2.0, 0.04, 0, shade(BRM.hide, -0.1), 'hide');
    /* the feed basket on a bracket, a hitching ring, the keystone beast */
    const B = K.g(-2.75); B.beam(0, 3.45, 0.06, 0, 3.45, 1.0, 0.1, 0.1, BRM.timber[0], BRM_TIMBER);
    K.furn('br_h_feed_basket', -2.75, 1.85, 0.95, 0);
    K.g(2.75).cyl(0, 1.3, 0.62, 0.14, 0.04, 0, BRR.iron, 'metal');
    K.slab(-0.45, 0.45, P.yHead - 0.55, P.yTop - P.yHead + 0.7, -K.e, 0.7, shade(col, -0.1), BRR_STONE);
    brrBeast(K.gn(0, 0.7), tribe, 0.6, P.yHead + 0.05, BRR.relief, { accent: TC[0], depth: 2.2 });
    brrLamp(K.gn(-2.75, 0.5), 0, P.yHead - 0.3, 0.1, 1.1);
  }
}
ASSET({
  key: 'br_bldg_rock_room_front', name: 'Rock-cut room front', culture: 'beast-rider',
  family: 'housing', types: ['dwelling-multi', 'shop', 'industry'], districts: ['ridertown'], wealth: [0, 1],
  w: 7.8, d: 3.0, h: 7.6, variants: BRR_ROOMS.length, variantNames: BRR_ROOMS.map(function (S) { return S.name; }),
  variantDims: [{ w: 7.8, d: 2.2, h: 6.2 }, { w: 7.8, d: 2.8, h: 6.8 }, { w: 7.8, d: 2.8, h: 6.8 }, { w: 7.8, d: 3.0, h: 7.6 }],
  build: function (F) { brrRoomFront(F, F.variant); }
});

/* ==== 7. a rock-cut shrine
   v0 a wayside niche: an arched niche over an altar block, its back lit cool, an idol in it, bowls and flowers on the
   sill, a garland across, the claw over it, cool lamps either side; v1 a shrine front in the Nabataean manner the
   riders took from the ruins: three steps, pilasters with beasts at their capitals, an entablature banded red and
   gilt, a crown of stepped merlons, the claw in a roundel, a lit door, offering stones and lamps on posts. */
function brrIdol(G, a, y, c, s, col, cloak) {
  G.frustum(a, y, c, 0.16 * s, 0.13 * s, 0.12 * s, 0, shade(col, -0.1), BRR_STONE, 8);
  G.ell(a, y + 0.42 * s, c, 0.13 * s, 0.3 * s, 0.1 * s, 0, cloak, 'cloth');
  G.ell(a, y + 0.5 * s, c + 0.04 * s, 0.1 * s, 0.24 * s, 0.08 * s, 0, col, BRR_STONE);
  G.ball(a, y + 0.84 * s, c, 0.1 * s, col, BRR_STONE);
  G.cone(a, y + 0.9 * s, c, 0.12 * s, 0.2 * s, 0, BRM.gilt, BRR_STONE);
  for (const m of [-1, 1]) G.tube(brrCurve([[a + m * 0.1 * s, y + 0.62 * s, c + 0.04 * s], [a + m * 0.24 * s, y + 0.5 * s, c + 0.08 * s], [a + m * 0.14 * s, y + 0.36 * s, c + 0.1 * s]], 3), 0.025 * s, col, BRR_STONE);
}
function brrGarland(G, a0, a1, y, c, sag, n) {
  const P = [];
  for (let i = 0; i <= n; i++) { const t = i / n; P.push([a0 + (a1 - a0) * t, y - sag * 4 * t * (1 - t), c]); }
  G.tube(P, 0.04, BRR.leaf, BRR_STONE);
  for (let i = 1; i < n; i++) G.ball(P[i][0], P[i][1] - 0.03, c + 0.03, 0.05, i % 2 ? BRR.flower : BRR.ochre, BRR_STONE);
}
function brrShrinePiece(F, v) {
  const K = brrK(F), col = BRR.dressed;
  if (v === 0) {
    const hw = 1.25, top = brrTop(K, 0.45), ys = 0.9;
    brrPanel(K, -hw, hw, 0, top, 0.06);
    brrRim(K, -hw, hw, 0, top, 0.45, 0.72, 'lrt');
    K.slab(-0.95, 0.95, 0, ys, -K.e, 0.72, shade(col, -0.06), BRR_STONE);
    K.slab(-1.0, 1.0, ys - 0.1, 0.1, -K.e, 0.8, shade(col, 0.08), BRR_STONE);
    brrClaw(K.gn(0, 0.72), 0, ys * 0.5, 0, 0.42, BRR.green, BRM.gilt);
    const P = brrPortal(K, { u: 0, y: ys, W: 1.9, H: 1.9, jw: 0.3, arched: true, rise: 0.45, nP: 0.06, nS: 0.6, plinth: 0.0, headH: 0.3, recess: BRR_GLOW.coolDim });
    K.g(0).box(0, ys + 0.02, 0.07, 1.25, 1.3, 0.01, 0, BRR_GLOW.coolDim, 'glow');
    const G = K.g(0);
    G.frustum(0, ys, 0.32, 0.22, 0.18, 0.12, 0, shade(col, 0.06), BRR_STONE, 8);
    brrIdol(G, 0, ys + 0.12, 0.32, 1.05, BRR.relief, BRR.green);
    F.furn('br_h_offering_bowl', K.at(-0.5, 0.42)[0], ys, K.at(-0.5, 0.42)[1], K.at(-0.5, 0.42)[2], { v: 1 });
    F.furn('br_h_offering_bowl', K.at(0.5, 0.42)[0], ys, K.at(0.5, 0.42)[1], K.at(0.5, 0.42)[2], { v: 1 });
    for (let i = 0; i < 6; i++) G.ball(-0.32 + i * 0.13, ys + 0.05, 0.6, 0.045, i % 2 ? BRR.flower : BRR.fruit, BRR_STONE);
    brrGarland(K.gn(0, 0.6), -0.95, 0.95, P.yHead + 0.05, 0.05, 0.35, 8);
    brrClaw(K.gn(0, 0.06), 0, P.yTop + 0.5, 0, 0.5, BRR.green, BRM.gilt);
    for (const m of [-1, 1]) { const L = K.g(m * 1.05); L.beam(0, 2.1, 0.06, 0, 2.1, 0.55, 0.07, 0.07, BRM.timber[0], BRM_TIMBER); brrLamp(L, 0, 1.75, 0.52, 1, true); L.rod(0, 2.1, 0.52, 0, 1.86, 0.52, 0.01, BRM.rope, 'rope'); }
    K.furn('br_h_offering_stone', 0.75, 0, 1.25, 0);
  } else {
    const hw = 3.0, top = brrTop(K, 0.5), yf = 0.6;
    brrPanel(K, -hw - 0.3, hw + 0.3, 0, top, 0.06);
    brrRim(K, -hw - 0.3, hw + 0.3, 0, top, 0.5, 0.95, 'lrt');
    K.slab(-hw - 0.2, hw + 0.2, 0, 0.2, -K.e, 2.0, shade(col, -0.14), BRR_STONE);
    K.slab(-hw - 0.05, hw + 0.05, 0.2, 0.2, -K.e, 1.6, shade(col, -0.08), BRR_STONE);
    K.slab(-hw + 0.1, hw - 0.1, 0.4, 0.2, -K.e, 1.2, shade(col, -0.02), BRR_STONE);
    const P = brrPortal(K, { u: 0, y: yf, W: 3.2, H: 3.2, jw: 0.35, arched: true, rise: 0.8, nP: 0.06, nS: 0.42, plinth: 0.0, headH: 0.35, band: false });
    brrDoor(K, 0, yf, 1.8, 3.0, 0.06, 'cool');
    /* the pilasters: base, shaft, capital with a beast; a green hanging on each */
    const ye = 5.3, beasts = ['quetzal', 'wingclaw'];
    for (const m of [-1, 1]) {
      const u = m * 2.35;
      K.slab(u - 0.38, u + 0.38, yf, 0.3, -K.e, 0.66, shade(col, 0.04), BRR_STONE);
      K.slab(u - 0.3, u + 0.3, yf + 0.3, ye - yf - 0.9, -K.e, 0.55, col, BRR_STONE);
      K.slab(u - 0.42, u + 0.42, ye - 0.6, 0.6, -K.e, 0.7, shade(col, 0.06), BRR_STONE);
      brrBeast(K.gn(u, 0.7), beasts[m > 0 ? 1 : 0], 0.3, ye - 0.3, BRR.relief, { accent: BRM.gilt, flip: m > 0, depth: 2.2 });
      K.g(u).box(0, yf + 1.2, 0.58, 0.44, 2.6, 0.03, 0, BRR.green, 'cloth');
      K.g(u).box(0, yf + 3.4, 0.6, 0.22, 0.22, 0.02, 0, BRM.gilt, 'cloth');
    }
    /* the entablature, banded, and the crown of stepped merlons */
    K.slab(-hw, hw, ye, 0.62, -K.e, 0.78, shade(col, 0.05), BRR_STONE);
    K.slab(-hw + 0.05, hw - 0.05, ye + 0.12, 0.12, 0.78, 0.8, BRM.red, BRR_STONE);
    K.slab(-hw + 0.05, hw - 0.05, ye + 0.42, 0.06, 0.78, 0.8, BRM.gilt, BRR_STONE);
    K.slab(-hw + 0.3, hw - 0.3, ye + 0.62, 0.7, -K.e, 0.4, shade(col, -0.12), BRR_STONE);
    const C = K.gn(0, 0.4);
    C.ell(0, ye + 1.0, 0, 0.62, 0.42, 0.12, 0, shade(col, 0.04), BRR_STONE);
    brrClaw(C, 0, ye + 1.0, 0.06, 0.6, BRR.green, BRM.gilt);
    for (let i = 0; i < 5; i++) {
      const u = -hw + 0.6 + i * (2 * hw - 1.2) / 4;
      K.slab(u - 0.36, u + 0.36, ye + 1.32, 0.32, -K.e, 0.5, shade(col, 0.02), BRR_STONE);
      K.slab(u - 0.22, u + 0.22, ye + 1.64, 0.3, -K.e, 0.45, shade(col, 0.04), BRR_STONE);
      K.slab(u - 0.1, u + 0.1, ye + 1.94, 0.26, -K.e, 0.4, shade(col, 0.06), BRR_STONE);
    }
    /* offerings and lamps */
    K.furn('br_h_offering_stone', -1.55, 0.6, 0.85, 0);
    K.furn('br_h_offering_stone', 1.55, 0.6, 0.85, 0);
    for (const m of [-1, 1]) { const G = K.g(m * 3.0); G.cyl(0, 0, 1.75, 0.08, 2.0, 0, BRM.timber[2], BRM_TIMBER); G.cyl(0, 2.0, 1.75, 0.18, 0.06, 0, BRM.gilt, BRM_TIMBER); brrLamp(G, 0, 2.06, 1.75, 1.3, true); }
    F.furn('br_h_offering_bowl', K.at(-0.9, 0.85)[0], 0.6, K.at(-0.9, 0.85)[1], K.at(-0.9, 0.85)[2], { v: 0 });
    F.furn('br_h_offering_bowl', K.at(0.9, 0.85)[0], 0.6, K.at(0.9, 0.85)[1], K.at(0.9, 0.85)[2], { v: 0 });
    void P;
  }
}
ASSET({
  key: 'br_bldg_rock_shrine', name: 'Rock-cut shrine', culture: 'beast-rider',
  family: 'religious', types: ['religious'], districts: ['ridertown'], wealth: [0, 1],
  w: 7.8, d: 2.6, h: 8.4, variants: 2, variantNames: ['Wayside niche', 'Shrine front'],
  variantDims: [{ w: 3.6, d: 2.1, h: 4.6 }, { w: 7.8, d: 2.6, h: 8.4 }],
  build: function (F) { brrShrinePiece(F, F.variant); }
});

/* ==== 8. a rock-cut cistern
   The rain the mesa drinks: 3,000 mm a year runs off its top. v0 a wall cistern: a channel cut down the face gathers
   the run-off to a spout over a basin cut at the foot, the cistern's arched mouth behind it, the Rain Mother's face
   over the arch, a sweep to draw with, a jar and a trough; v1 a stepped cistern: a tank whose rim is reached by steps,
   steps inside down to the water, the chamber's great arch behind it. */
function brrRainFace(G, a, y, c, s, col, rain) {
  G.ell(a, y, c, 0.32 * s, 0.4 * s, 0.1 * s, 0, col, BRR_STONE);
  for (const m of [-1, 1]) {
    G.tube(brrCurve([[a + m * 0.18 * s, y + 0.06 * s, c + 0.08 * s], [a + m * 0.1 * s, y + 0.03 * s, c + 0.1 * s], [a + m * 0.03 * s, y + 0.06 * s, c + 0.09 * s]], 3), 0.014 * s, BRR.shadow, BRR_STONE);
    /* the rain from her closed eyes, and her hair falling as rain round the face */
    G.tube(brrCurve([[a + m * 0.1 * s, y + 0.0, c + 0.1 * s], [a + m * 0.13 * s, y - 0.25 * s, c + 0.08 * s], [a + m * 0.09 * s, y - 0.5 * s, c + 0.05 * s], [a + m * 0.12 * s, y - 0.8 * s, c + 0.03 * s]], 3), 0.016 * s, rain, BRR_STONE);
    for (let i = 0; i < 4; i++) {
      const r0 = 0.3 + i * 0.07;
      G.tube(brrCurve([[a + m * 0.05 * s, y + 0.42 * s, c + 0.05 * s], [a + m * r0 * s, y + 0.25 * s, c + 0.05 * s], [a + m * (r0 + 0.05) * s, y - 0.25 * s, c + 0.04 * s], [a + m * (r0 - 0.02) * s, y - (0.75 + i * 0.1) * s, c + 0.02 * s]], 3), 0.028 * s, i % 2 ? rain : shade(rain, 0.15), BRR_STONE);
    }
  }
  G.ell(a, y - 0.1 * s, c + 0.09 * s, 0.05 * s, 0.09 * s, 0.05 * s, 0, col, BRR_STONE);
  G.ell(a, y - 0.24 * s, c + 0.08 * s, 0.08 * s, 0.03 * s, 0.03 * s, 0, BRR.shadow, BRR_STONE);
  G.cone(a, y + 0.36 * s, c, 0.16 * s, 0.24 * s, 0, BRM.gilt, BRR_STONE);
}
function brrWater(K, u0, u1, y, n0, n1) { K.slab(u0, u1, y - 0.05, 0.05, n0, n1, BRR.water, 'ceramic'); }
function brrCisternPiece(F, v) {
  const K = brrK(F), col = BRR.dressed, top = brrTop(K, 0.5);
  if (v === 0) {
    const hw = 2.2;
    brrPanel(K, -hw, hw, 0, top, 0.06);
    brrRim(K, -hw, hw, 0, top, 0.5, 0.8, 'lrt');
    const P = brrPortal(K, { u: 0, y: 0.2, W: 3.0, H: 1.6, jw: 0.32, arched: true, rise: 0.62, nP: 0.06, nS: 0.42, plinth: 0.2, headH: 0.3, recess: BRR.void });
    brrWater(K, -1.15, 1.15, 0.45, 0.07, 0.45);
    /* the basin cut at the foot: three walls round the water */
    K.slab(-2.0, 2.0, 0, 0.75, 1.85, 2.15, shade(col, -0.06), BRR_STONE);
    for (const m of [-1, 1]) K.slab(m > 0 ? 1.7 : -2.0, m > 0 ? 2.0 : -1.7, 0, 0.75, 0.42, 1.85, shade(col, -0.06), BRR_STONE);
    brrWater(K, -1.7, 1.7, 0.58, 0.42, 1.85);
    K.slab(-2.05, 2.05, 0.75, 0.08, 1.8, 2.22, shade(col, 0.1), BRR_STONE);
    /* the rain channel down the face to a spout, the Rain Mother's face over the arch, wavy rain cut beside the channel */
    const yS = P.yTop + 1.55;
    for (const m of [-1, 1]) K.slab(m * 0.22 - 0.06, m * 0.22 + 0.06, yS, top - yS + 0.3, -K.e, 0.24, shade(col, 0.06), BRR_STONE);
    K.slab(-0.16, 0.16, yS, top - yS + 0.3, 0.06, 0.1, shade(BRR.water, 0.1), BRR_STONE);
    const G = K.g(0);
    G.box(0, yS - 0.12, 0.42, 0.34, 0.16, 0.86, 0, shade(col, 0.04), BRR_STONE);
    G.box(0, yS - 0.03, 0.46, 0.18, 0.1, 0.86, 0, BRR.water, 'ceramic');
    G.box(0, 0.6, 0.9, 0.06, yS - 0.7, 0.04, 0, shade(BRR.water, 0.25), 'ceramic');
    brrRainFace(K.gn(0, 0.06), 0, P.yTop + 0.7, 0, 0.95, BRR.relief, BRR.rain);
    for (const m of [-1, 1]) for (let i = 0; i < 3; i++) {
      const a0 = m * (0.75 + i * 0.32), P2 = [];
      for (let k = 0; k <= 8; k++) P2.push([a0 + (k % 2 ? 0.08 : -0.08), yS + 0.2 + k * 0.28, 0.08]);
      K.g(0).tube(P2, 0.025, BRR.rain, BRR_STONE);
    }
    /* the sweep: a post, the pole on its pivot, the bucket over the water */
    const W = K.g(2.75);
    W.cyl(0, 0, 1.3, 0.11, 2.2, 0, BRM.timber[2], BRM_TIMBER);
    W.box(0, 2.15, 1.3, 0.3, 0.18, 0.12, 0, BRM.timber[0], BRM_TIMBER);
    W.beam(0.55, 1.7, 1.3, -1.9, 3.35, 1.3, 0.07, 0.07, BRM.timber[1], BRM_TIMBER);
    W.ball(0.62, 1.62, 1.3, 0.16, BRR.rock[3], BRR_RAW);
    W.rod(-1.9, 3.3, 1.3, -1.9, 1.6, 1.3, 0.012, BRM.rope, 'rope');
    W.frustum(-1.9, 1.3, 1.3, 0.13, 0.16, 0.3, 0, BRM.timber[0], BRM_TIMBER, 8);
    K.furn('br_h_water_butt', -2.65, 0, 1.25, 0, { v: 0 });
    K.furn('br_h_trough', 0.3, 0, 2.55, 0, { v: 1 });
  } else {
    const hw = 2.6;
    brrPanel(K, -hw, hw, 0, top, 0.06);
    brrRim(K, -hw, hw, 0, top, 0.5, 0.8, 'lrt');
    const P = brrPortal(K, { u: 0, y: 0.25, W: 4.4, H: 2.5, jw: 0.42, arched: true, rise: 1.15, nP: 0.06, nS: 0.5, plinth: 0.25, headH: 0.4, recess: BRR.void });
    brrWater(K, -1.75, 1.75, 0.55, 0.07, 0.5);
    /* the tank: rim 1.2 m, walls round three sides, the water 0.65 m down, steps inside and out at the front */
    const yr = 1.2, n0 = 0.5, n1 = 2.55;
    K.slab(-2.5, 2.5, 0, yr, n1, n1 + 0.3, shade(col, -0.06), BRR_STONE);
    for (const m of [-1, 1]) K.slab(m > 0 ? 2.2 : -2.5, m > 0 ? 2.5 : -2.2, 0, yr, n0, n1, shade(col, -0.06), BRR_STONE);
    K.slab(-2.55, 2.55, yr, 0.08, n1 - 0.05, n1 + 0.36, shade(col, 0.1), BRR_STONE);
    for (const m of [-1, 1]) K.slab(m > 0 ? 2.15 : -2.55, m > 0 ? 2.55 : -2.15, yr, 0.08, n0, n1, shade(col, 0.1), BRR_STONE);
    brrWater(K, -2.2, 2.2, 0.55, n0, n1);
    for (let i = 0; i < 3; i++) K.slab(-0.6, 0.6, 0, yr - (i + 1) * 0.3, n1 + 0.3 + i * 0.3, n1 + 0.6 + i * 0.3, shade(col, -0.03 * i), BRR_STONE);
    for (let i = 0; i < 2; i++) K.slab(-0.6, 0.6, 0.55, yr - 0.55 - i * 0.25 + 0.2, n1 - 0.3 - i * 0.3, n1, shade(col, -0.06 - 0.03 * i), BRR_STONE);
    /* over the arch: the Rain Mother between two spouts, the claw */
    brrRainFace(K.gn(0, 0.06), 0, P.yTop + 0.75, 0, 0.9, BRR.relief, BRR.rain);
    for (const m of [-1, 1]) {
      const G = K.g(m * 1.6);
      G.box(0, P.yTop + 0.1, 0.4, 0.3, 0.16, 0.8, 0, shade(col, 0.04), BRR_STONE);
      G.box(0, 1.25, 0.82, 0.05, P.yTop - 1.1, 0.04, 0, shade(BRR.water, 0.25), 'ceramic');
    }
    K.furn('br_h_water_butt', -2.95, 0, 3.05, 0, { v: 0 });
  }
}
ASSET({
  key: 'br_bldg_rock_cistern', name: 'Rock-cut cistern', culture: 'beast-rider',
  family: 'infrastructure', types: ['infrastructure'], districts: ['ridertown'], wealth: [0, 1],
  w: 6.7, d: 4.3, h: 6.0, variants: 2, variantNames: ['Wall cistern under its rain channel', 'Stepped cistern'],
  variantDims: [{ w: 6.7, d: 3.4, h: 6.0 }, { w: 6.7, d: 4.3, h: 6.0 }],
  build: function (F) { brrCisternPiece(F, F.variant); }
});
