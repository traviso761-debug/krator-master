/* ======================================================================
   voth-taverns — second-generation Voth taverns (source 'voth-taverns')
   One IIFE so the shared kit below is not a top-level declaration.
   Three designed variants under voth_tavern_b:
     0  harbour tavern on a raised quay, covered drinking terrace on piles
        over the water, guest-room gallery, blue hip roof, moored punt
     1  Hlaalu corner inn: three storeys in an L round a walled guar yard
        with stables, a pagoda-capped corner tower, roof terrace under sails
     2  Velothi cornerclub: a domed drum half-sunk in a stone berm, a stair
        down to its door, braziers and benches out front, smoke vent, a
        guest-room annex behind carrying a roof garden
   ====================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- kit */
  function kit(F, trimC) {
    const K = {};
    const doorC = 0x1c1a16, iron = 0x3a3530, glow = 0xffcf87;
    K.timber = 0x4a3a28; K.iron = iron; K.glow = glow; K.doorC = doorC;
    K.nrm = function (s) { return s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0]; };
    /* point on face s of block L at along-offset u (x for front/back, z for
       the flanks, relative to the block centre) and `out` metres proud */
    K.at = function (L, s, u, out) {
      const n = K.nrm(s), fl = n[1] !== 0;
      return [L.x + (fl ? u : n[0] * (L.w / 2 + out)), L.z + (fl ? n[1] * (L.d / 2 + out) : u), fl];
    };
    /* a box laid on a face: a = width along the face, dep = depth off it,
       out = distance of its centre from the face plane */
    K.fbox = function (L, s, u, y, a, h, dep, out, col, fam) {
      const p = K.at(L, s, u, out);
      F.box(p[0], y, p[1], p[2] ? a : dep, h, p[2] ? dep : a, 0, col, fam);
    };
    K.win = function (L, s, u, y, ww, wh, o) {
      o = o || {};
      const tc = o.trim || trimC;
      K.fbox(L, s, u, y, ww, wh, 0.12, 0.03, o.lit ? 0x6a4a26 : doorC, 'wood');
      K.fbox(L, s, u - ww / 2 - 0.1, y, 0.2, wh, 0.22, 0.09, tc, 'stone');
      K.fbox(L, s, u + ww / 2 + 0.1, y, 0.2, wh, 0.22, 0.09, tc, 'stone');
      K.fbox(L, s, u, y + wh, ww + 0.5, 0.24, 0.28, 0.1, tc, 'stone');
      K.fbox(L, s, u, y - 0.18, ww + 0.4, 0.18, 0.38, 0.17, tc, 'stone');
      if (o.bars) [-0.25, 0, 0.25].forEach(function (t) {
        K.fbox(L, s, u + t * ww, y, 0.05, wh, 0.05, 0.12, iron, 'metal');
      });
      if (o.shut) [-1, 1].forEach(function (k) {
        K.fbox(L, s, u + k * (ww * 0.75 + 0.22), y, ww / 2, wh, 0.07, 0.08, o.shut, 'wood');
      });
      if (o.box) {
        K.fbox(L, s, u, y - 0.55, ww + 0.2, 0.35, 0.36, 0.3, 0x5a4028, 'wood');
        [-0.3, 0, 0.3].forEach(function (t) {
          const p = K.at(L, s, u + t * ww, 0.32);
          F.blob(p[0], y - 0.12, p[1], 0.24, 0.3, 0, F.pick([0x5b6740, 0x4e5a34, 0x616a41]), 'leaf');
        });
      }
    };
    K.door = function (L, s, u, y, dw, dh, o) {
      o = o || {};
      const tc = o.trim || trimC, base = o.base == null ? y : o.base;
      K.fbox(L, s, u, y, dw, dh, 0.1, 0.03, o.leaf || doorC, 'wood');
      [0.22, 0.72].forEach(function (t) { K.fbox(L, s, u, y + dh * t, dw * 0.92, 0.1, 0.04, 0.09, iron, 'metal'); });
      K.fbox(L, s, u - dw / 2 - 0.18, y, 0.36, dh, 0.34, 0.12, tc, 'stone');
      K.fbox(L, s, u + dw / 2 + 0.18, y, 0.36, dh, 0.34, 0.12, tc, 'stone');
      K.fbox(L, s, u, y + dh, dw + 0.8, 0.4, 0.42, 0.15, tc, 'stone');
      const rise = y - base;
      if (rise < 0.05) K.fbox(L, s, u, y, dw + 0.6, 0.1, 0.6, 0.3, shade(tc, -0.1), 'stone');
      else {
        const n = Math.max(1, Math.round(rise / 0.26));
        for (let i = 0; i < n; i++) {
          K.fbox(L, s, u, base, dw + 0.8, rise * (n - i) / n, 0.4, 0.2 + 0.4 * i, shade(tc, -0.08), 'stone');
        }
      }
    };
    K.lantern = function (x, y, z, dx, dz) {
      const ex = x + dx, ez = z + dz;
      F.rod(x, y, z, ex, y, ez, 0.04, iron, 'metal');
      F.rod(ex, y, ez, ex, y - 0.3, ez, 0.02, iron, 'metal');
      F.cone(ex, y - 0.42, ez, 0.2, 0.16, 0, iron, 'metal');
      F.box(ex, y - 0.8, ez, 0.22, 0.38, 0.22, 0, glow, 'glow');
      F.box(ex, y - 0.86, ez, 0.28, 0.06, 0.28, 0, iron, 'metal');
    };
    K.hangLamp = function (x, ytop, z, drop) {
      F.rod(x, ytop, z, x, ytop - drop, z, 0.02, iron, 'metal');
      F.cone(x, ytop - drop - 0.12, z, 0.18, 0.14, 0, iron, 'metal');
      F.box(x, ytop - drop - 0.46, z, 0.2, 0.34, 0.2, 0, glow, 'glow');
    };
    K.postLamp = function (x, z, y0, h) {
      F.box(x, y0, z, 0.4, 0.3, 0.4, 0, shade(trimC, -0.15), 'stone');
      F.rod(x, y0 + 0.3, z, x, y0 + h, z, 0.07, iron, 'metal');
      F.cone(x, y0 + h + 0.36, z, 0.26, 0.24, 0, iron, 'metal');
      F.box(x, y0 + h, z, 0.3, 0.38, 0.3, 0, glow, 'glow');
    };
    K.barrel = function (x, y, z, r, h) {
      F.cyl(x, y, z, r * 0.9, h, 0, 0x5a4a34, 'wood');
      F.cyl(x, y + h * 0.2, z, r, h * 0.6, 0, 0x604e36, 'wood');
      [0.08, 0.86].forEach(function (t) { F.cyl(x, y + h * t, z, r * 0.94, 0.07, 0, iron, 'metal'); });
      F.cyl(x, y + h * 0.48, z, r * 1.02, 0.07, 0, iron, 'metal');
    };
    K.barrelX = function (x, y, z, r, len, alongX) {
      const dx = alongX ? len / 2 : 0, dz = alongX ? 0 : len / 2;
      F.rod(x - dx, y + r, z - dz, x + dx, y + r, z + dz, r * 0.92, 0x5a4a34, 'wood');
      F.rod(x - dx * 0.6, y + r, z - dz * 0.6, x + dx * 0.6, y + r, z + dz * 0.6, r, 0x604e36, 'wood');
      [-0.8, 0.8].forEach(function (t) {
        F.rod(x + dx * t - dx * 0.05, y + r, z + dz * t - dz * 0.05, x + dx * t + dx * 0.05, y + r, z + dz * t + dz * 0.05, r * 0.96, iron, 'metal');
      });
    };
    K.crate = function (x, y, z, sz, ry) {
      F.box(x, y, z, sz, sz * 0.85, sz, ry || 0, F.pick([0x7a6040, 0x6b5436, 0x806848]), 'wood');
      F.box(x, y + sz * 0.38, z, sz + 0.04, 0.1, sz + 0.04, ry || 0, 0x4a3a28, 'wood');
    };
    K.bench = function (x, z, y, len, alongX, col) {
      col = col || 0x5a4630;
      F.box(x, y + 0.4, z, alongX ? len : 0.42, 0.08, alongX ? 0.42 : len, 0, col, 'wood');
      [-1, 1].forEach(function (k) {
        const o = k * (len / 2 - 0.2);
        F.box(x + (alongX ? o : 0), y, z + (alongX ? 0 : o), alongX ? 0.1 : 0.36, 0.4, alongX ? 0.36 : 0.1, 0, shade(col, -0.15), 'wood');
      });
    };
    K.roundTable = function (x, z, y, r) {
      F.cyl(x, y, z, 0.28, 0.05, 0, 0x3a3128, 'wood');
      F.cyl(x, y, z, 0.08, 0.72, 0, 0x4a3a28, 'wood');
      F.cyl(x, y + 0.72, z, r, 0.07, 0, 0x6b5436, 'wood');
      F.cyl(x + r * 0.4, y + 0.79, z, 0.07, 0.16, 0, 0x8a8478, 'metal');
      [0, 1, 2].forEach(function (i) {
        const a = i / 3 * TAU + 0.4;
        F.cyl(x + Math.cos(a) * (r + 0.45), y, z + Math.sin(a) * (r + 0.45), 0.2, 0.45, 0, 0x5a4630, 'wood');
      });
    };
    K.longTable = function (x, z, y, len, alongX) {
      const w = alongX ? len : 0.85, d = alongX ? 0.85 : len;
      F.box(x, y + 0.72, z, w, 0.07, d, 0, 0x6b5436, 'wood');
      [-1, 1].forEach(function (k) {
        const o = k * (len / 2 - 0.25);
        F.box(x + (alongX ? o : 0), y, z + (alongX ? 0 : o), alongX ? 0.12 : 0.7, 0.72, alongX ? 0.7 : 0.12, 0, 0x4a3a28, 'wood');
        K.bench(x + (alongX ? 0 : k * 0.85), z + (alongX ? k * 0.85 : 0), y, len, alongX);
      });
      F.cyl(x + (alongX ? len * 0.2 : 0), y + 0.79, z + (alongX ? 0 : len * 0.2), 0.07, 0.16, 0, 0x8a8478, 'metal');
      F.cyl(x - (alongX ? len * 0.25 : 0.15), y + 0.79, z - (alongX ? 0.15 : len * 0.25), 0.07, 0.16, 0, 0x8a8478, 'metal');
    };
    /* hanging sign on an iron bracket, projecting (dx,dz) off a wall point */
    K.sign = function (x, y, z, dx, dz, col, emb) {
      const L = 1.5, alongX = Math.abs(dx) > 0.5;
      F.rod(x, y, z, x + dx * L, y, z + dz * L, 0.05, iron, 'metal');
      F.rod(x, y - 0.75, z, x + dx * 0.9, y, z + dz * 0.9, 0.035, iron, 'metal');
      F.box(x, y - 0.9, z, alongX ? 0.06 : 0.3, 1.1, alongX ? 0.3 : 0.06, 0, iron, 'metal');
      const cx = x + dx * 0.9, cz = z + dz * 0.9;
      [-0.42, 0.42].forEach(function (t) {
        F.rod(cx + dx * t, y, cz + dz * t, cx + dx * t, y - 0.3, cz + dz * t, 0.02, iron, 'metal');
      });
      F.box(cx, y - 1.28, cz, alongX ? 1.1 : 0.1, 0.98, alongX ? 0.1 : 1.1, 0, col, 'wood');
      F.box(cx, y - 1.34, cz, alongX ? 1.2 : 0.12, 0.1, alongX ? 0.12 : 1.2, 0, 0x3a2f22, 'wood');
      F.box(cx, y - 0.34, cz, alongX ? 1.2 : 0.12, 0.08, alongX ? 0.12 : 1.2, 0, 0x3a2f22, 'wood');
      /* the emblem, through the board so it reads from both sides */
      if (emb === 'jug') {
        F.cyl(cx, y - 1.1, cz, 0.17, 0.42, 0, 0xc4a04a, 'metal');
        F.cyl(cx, y - 0.68, cz, 0.1, 0.12, 0, 0xc4a04a, 'metal');
      } else if (emb === 'fish') {
        F.blob(cx, y - 0.84, cz, 0.3, 0.26, 0, 0xb0c8d8, 'metal');
        F.cone(cx + (alongX ? 0.36 : 0), y - 0.98, cz + (alongX ? 0 : 0.36), 0.12, 0.28, 0, 0xb0c8d8, 'metal');
      } else {
        F.ball(cx, y - 0.84, cz, 0.24, 0xc4a04a, 'metal');
      }
    };
    /* sloped awning/pentice off a wall face; poles (u offsets) to `base` */
    K.awning = function (L, s, u, y, a, proj, drop, col, fam, poles, base, stripe) {
      const p1 = K.at(L, s, u, proj);
      const fl = p1[2];
      const n = stripe ? Math.max(2, Math.round(a / 1.1)) : 1;
      for (let i = 0; i < n; i++) {
        const uu = u - a / 2 + a * (i + 0.5) / n, sa = a / n + 0.01;
        const q0 = K.at(L, s, uu, 0.02), q1 = K.at(L, s, uu, proj);
        const c = stripe && i % 2 ? stripe : col;
        F.beam(q0[0], y, q0[1], q1[0], y - drop, q1[1], fl ? sa : 0.08, fl ? 0.08 : sa, c, fam);
        if (fam === 'cloth') K.fbox(L, s, uu, y - drop - 0.32, sa, 0.32, 0.04, proj, c, 'cloth');
      }
      K.fbox(L, s, u, y - 0.05, a + 0.1, 0.16, 0.16, 0.08, K.timber, 'wood');
      if (poles) poles.forEach(function (pu) {
        const q = K.at(L, s, pu, proj - 0.1);
        F.rod(q[0], base, q[1], q[0], y - drop, q[1], 0.09, K.timber, 'wood');
      });
      else [-1, 1].forEach(function (k) {
        const q0 = K.at(L, s, u + k * (a / 2 - 0.2), 0.02), q1 = K.at(L, s, u + k * (a / 2 - 0.2), proj * 0.9);
        F.beam(q0[0], y - drop - 0.9, q0[1], q1[0], y - drop - 0.05, q1[1], 0.08, 0.08, K.timber, 'wood');
      });
    };
    /* a tilted shade sail on corner poles: high edge at z0 (yA), low at z1 (yB) */
    K.sailZ = function (x0, x1, z0, z1, yA, yB, base, col) {
      const cx = (x0 + x1) / 2;
      F.beam(cx, yA, z0, cx, yB, z1, x1 - x0, 0.05, col, 'cloth');
      [[x0 + 0.1, z0, yA], [x1 - 0.1, z0, yA], [x0 + 0.1, z1, yB], [x1 - 0.1, z1, yB]].forEach(function (p) {
        F.rod(p[0], base, p[1], p[0], p[2] + 0.2, p[1], 0.07, K.timber, 'wood');
      });
    };
    K.sailX = function (x0, x1, z0, z1, yA, yB, base, col) {
      const cz = (z0 + z1) / 2;
      F.beam(x0, yA, cz, x1, yB, cz, 0.05, z1 - z0, col, 'cloth');
      [[x0, z0 + 0.1, yA], [x0, z1 - 0.1, yA], [x1, z0 + 0.1, yB], [x1, z1 - 0.1, yB]].forEach(function (p) {
        F.rod(p[0], base, p[1], p[0], p[2] + 0.2, p[1], 0.07, K.timber, 'wood');
      });
    };
    K.parapet = function (L, y, h, t, col, skip) {
      skip = skip || [];
      [0, 1, 2, 3].forEach(function (s) {
        if (skip.indexOf(s) >= 0) return;
        const fl = s < 2;
        K.fbox(L, s, 0, y, fl ? L.w : L.d - 2 * t, h, t, -t / 2, col, 'stone');
        K.fbox(L, s, 0, y + h, fl ? L.w + 0.1 : L.d - 2 * t, 0.12, t + 0.12, -t / 2, shade(col, -0.12), 'stone');
      });
    };
    /* straight flight between two points; solid stone or open timber */
    K.flight = function (x0, z0, x1, z1, y0, y1, wd, col, solid) {
      const n = Math.max(2, Math.round((y1 - y0) / 0.26));
      const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      const run = Math.hypot(x1 - x0, z1 - z0) / n;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, cx = x0 + (x1 - x0) * t, cz = z0 + (z1 - z0) * t;
        const top = y0 + (y1 - y0) * (i + 1) / n;
        if (solid) F.box(cx, y0, cz, alongX ? run + 0.02 : wd, top - y0, alongX ? wd : run + 0.02, 0, col, 'stone');
        else F.box(cx, top - 0.08, cz, alongX ? run * 1.1 : wd, 0.08, alongX ? wd : run * 1.1, 0, col, 'wood');
      }
      if (!solid) [-1, 1].forEach(function (k) {
        const ox = alongX ? 0 : k * wd / 2, oz = alongX ? k * wd / 2 : 0;
        F.beam(x0 + ox, y0 + 0.1, z0 + oz, x1 + ox, y1 - 0.05, z1 + oz, alongX ? 0.28 : 0.1, alongX ? 0.1 : 0.28, K.timber, 'wood');
      });
    };
    K.rail = function (x0, z0, x1, z1, y, h, col) {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 1.3));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        F.box(x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, 0.12, h, 0.12, 0, col, 'wood');
      }
      F.rod(x0, y + h, z0, x1, y + h, z1, 0.06, col, 'wood');
      F.rod(x0, y + h * 0.5, z0, x1, y + h * 0.5, z1, 0.035, col, 'wood');
    };
    K.chimney = function (x, z, base, h, col) {
      F.box(x, base, z, 0.9, h, 0.9, 0, shade(col, -0.2), 'stone');
      F.box(x, base + h, z, 1.2, 0.35, 1.2, 0, shade(col, -0.32), 'stone');
      F.cyl(x, base + h + 0.35, z, 0.25, 0.45, 0, 0x3a3128, 'stone');
    };
    K.ladder = function (x, z, y0, y1, alongX) {
      [-0.25, 0.25].forEach(function (k) {
        F.rod(x + (alongX ? k : 0), y0, z + (alongX ? 0 : k), x + (alongX ? k : 0), y1, z + (alongX ? 0 : k), 0.04, K.timber, 'wood');
      });
      for (let y = y0 + 0.3; y < y1 - 0.1; y += 0.35) {
        F.rod(x - (alongX ? 0.25 : 0), y, z - (alongX ? 0 : 0.25), x + (alongX ? 0.25 : 0), y, z + (alongX ? 0 : 0.25), 0.025, K.timber, 'wood');
      }
    };
    K.planter = function (x, z, y, w, d) {
      F.box(x, y, z, w, 0.55, d, 0, 0x7e7460, 'stone');
      F.box(x, y + 0.5, z, w - 0.12, 0.08, d - 0.12, 0, 0x5f523e, 'stone');
      const n = Math.max(1, Math.round(Math.max(w, d) / 0.8));
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n - 0.5;
        F.blob(x + (w > d ? t * w : 0), y + 0.8, z + (w > d ? 0 : t * d), 0.36, 0.55, 0,
          F.pick([0x5b6740, 0x4e5a34, 0x6a6c46, 0x616a41]), 'leaf');
      }
    };
    /* wheel as a thin disc: a short rod along the axle */
    K.wheel = function (x, y, z, r, alongX) {
      F.rod(x - (alongX ? 0.06 : 0), y, z - (alongX ? 0 : 0.06), x + (alongX ? 0.06 : 0), y, z + (alongX ? 0 : 0.06), r, 0x4a3a28, 'wood');
      F.rod(x - (alongX ? 0.1 : 0), y, z - (alongX ? 0 : 0.1), x + (alongX ? 0.1 : 0), y, z + (alongX ? 0 : 0.1), r * 0.25, 0x3a3128, 'metal');
    };
    return K;
  }

  ASSET({
    key: 'voth_tavern_b', name: 'Tavern (second series)', culture: 'voth', family: 'tavern',
    source: 'voth-taverns',
    districts: ['harbour', 'common', 'market', 'temple'], wealth: [0.25, 0.75],
    blurb: 'Three taverns: a harbour house with a covered terrace on piles over the water, a three-storey Hlaalu corner inn round a guar yard, and a half-sunken Velothi domed cornerclub.',
    w: 23.6, d: 25.2, h: 18.0, variants: 3,
    /* measured including the street furniture, signs and eaves */
    variantDims: [
      { w: 18.4, d: 25.2, h: 13.3 },
      { w: 23.6, d: 24.7, h: 18.0 },
      { w: 17.8, d: 22.0, h: 10.6 }
    ],
    build: function (F) {
      const stoneT = [0x8c8579, 0x958e80, 0x87816f, 0x9a9384, 0x8f8873];
      const blue = 0x2f5a86, lapis = 0x2a4d80, cream = 0xcfc2a3, sailT = [0xcfc2a3, 0xc0b190, 0xb8a880];
      const bannerT = [0x7a2028, 0x8a2f2a, 0xe8d9a0, 0xb0c8d8, 0xcbb08e, 0xe8c090];
      const rich = F.wealth > 0.6;

      if (F.variant === 0) {
        /* ================= harbour tavern on the quay ================= */
        const c = F.pick(stoneT), trim = shade(c, -0.2), cornice = shade(c, -0.13);
        const K = kit(F, trim), T = K.timber;
        const Q = 1.2;                       /* quay deck height */
        const water = 0x33494a;

        /* water, quay, coping, courses on the quay walls */
        F.box(0, 0, -8.0, 18, 0.2, 9.6, 0, water, 'stone');           /* water: opaque, a transparent sheet reads as bare ground */
        F.box(0, 0, 3.8, 18, Q, 14, 0, shade(c, -0.1), 'stone');
        F.box(0, Q - 0.05, -3.0, 18.2, 0.2, 0.5, 0, shade(c, -0.26), 'stone');
        F.box(0, 0, -3.25, 18.1, 0.35, 0.2, 0, 0x3f4640, 'stone');            /* weed line */
        [-9.02, 9.02].forEach(function (x) {
          F.box(x, 0.55, 3.8, 0.1, 0.14, 14, 0, shade(c, -0.22), 'stone');
        });
        F.box(0, 0.55, 10.82, 18, 0.14, 0.1, 0, shade(c, -0.22), 'stone');
        /* front steps down to the street, and kerbs either side */
        for (let i = 0; i < 4; i++) {
          F.box(-1, 0, 11.0 + i * 0.4, 10, Q * (4 - i) / 4, 0.4, 0, shade(c, -0.14 - i * 0.02), 'stone');
        }
        /* mooring ring + stair down into the water off the east quay */
        F.rod(-6.5, 0.7, -3.3, -6.5, 0.7, -3.42, 0.2, K.iron, 'metal');
        for (let i = 0; i < 4; i++) F.box(8.4, 0, -3.45 - i * 0.35, 1.2, Q * (4 - i) / 4.4, 0.35, 0, shade(c, -0.18), 'stone');

        /* ---- main block: taproom + guest-room storey + blue hip roof ---- */
        const L = { x: -1, z: 3.5, w: 13, d: 9 };
        F.box(L.x, Q, L.z, L.w, 4.2, L.d, 0, c, 'stone');
        F.box(L.x, Q, L.z, L.w + 0.3, 0.45, L.d + 0.3, 0, shade(c, -0.24), 'stone');
        F.box(L.x, Q + 4.05, L.z, L.w + 0.4, 0.3, L.d + 0.4, 0, cornice, 'stone');
        F.box(L.x, Q + 4.2, L.z, L.w, 3.4, L.d, 0, shade(c, 0.05), 'stone');
        F.box(L.x, Q + 7.4, L.z, L.w + 0.5, 0.3, L.d + 0.5, 0, T, 'wood');
        F.pyrRoof(L.x, Q + 7.7, L.z, L.w + 2, 2.9, L.d + 2, 0, blue, 'roof');
        F.box(L.x, Q + 7.7, L.z, L.w + 2.05, 0.12, L.d + 2.05, 0, shade(blue, -0.25), 'roof');
        F.ball(L.x, Q + 10.55, L.z, 0.3, 0xc4a04a, 'metal');
        /* rafter ends under the eaves, front and back */
        for (let x = -7; x <= 5.01; x += 1.2) {
          [1, -1].forEach(function (k) {
            F.box(x, Q + 7.45, L.z + k * (L.d / 2 + 0.55), 0.14, 0.2, 1.1, 0, T, 'wood');
          });
        }
        K.chimney(3.2, 1.6, Q + 8.2, 3.1, c);

        /* front: door, pentice on posts, windows, sign, lamps */
        K.door(L, 0, 0, Q, 1.9, 2.7, { leaf: 0x3a2618 });
        K.awning(L, 0, 0, Q + 3.9, 11.6, 1.9, 0.55, shade(blue, 0.08), 'roof', [-5.4, -2.0, 2.0, 5.4], Q);
        [-4.2, 3.8].forEach(function (u) { K.win(L, 0, u, Q + 1.0, 1.5, 1.7, { shut: 0x2f4a66, bars: false }); });
        [-4.8, -1.6, 1.6, 4.8].forEach(function (u) { K.win(L, 0, u, Q + 5.1, 1.1, 1.5, { shut: 0x2f4a66, box: rich || u < 0 }); });
        K.sign(4.8, Q + 6.9, 8.05, 0, 1, F.pick(bannerT), 'fish');
        [-1.5, 1.5].forEach(function (u) { K.lantern(L.x + u, Q + 3.2, 8.05, 0, 0.45); });
        K.postLamp(-6.6, 10.3, Q, 2.6);
        K.postLamp(4.6, 10.3, Q, 2.6);
        /* benches under the windows, tables and stools, a cask stack */
        K.bench(-5.2, 8.35, Q, 2.6, true);
        K.bench(2.8, 8.35, Q, 2.2, true);
        K.roundTable(-3.4, 9.8, Q, 0.55);
        K.roundTable(1.4, 9.9, Q, 0.55);
        K.barrelX(7.4, Q, 8.6, 0.42, 1.1, false);
        K.barrelX(8.3, Q, 8.6, 0.42, 1.1, false);
        K.barrelX(7.85, Q + 0.76, 8.6, 0.42, 1.1, false);
        F.box(7.85, Q, 8.6, 2.1, 0.1, 1.3, 0, T, 'wood');
        K.barrel(-8.2, Q, 9.8, 0.4, 1.0);

        /* ---- west flank: open timber stair to the guest gallery ---- */
        K.flight(-8.3, 7.6, -8.3, 0.0, Q, Q + 4.2, 1.1, 0x5a4630, false);
        F.box(-8.3, Q + 4.08, -1.25, 1.15, 0.14, 2.6, 0, 0x5a4630, 'wood');
        [0.0, -2.45].forEach(function (z) { F.rod(-8.75, Q, z, -8.75, Q + 4.08, z, 0.1, T, 'wood'); });
        F.rod(-8.9, Q + 1.0, 7.4, -8.9, Q + 5.1, -0.1, 0.04, T, 'wood');
        [-1.8, 2.0].forEach(function (u) { K.win(L, 3, u, Q + 1.0, 1.2, 1.6, { shut: 0x2f4a66 }); });
        [-2.4, 1.2].forEach(function (u) { K.win(L, 3, u, Q + 5.1, 1.0, 1.4, {}); });
        F.rod(-7.62, Q + 0.3, 7.7, -7.62, Q + 7.5, 7.7, 0.1, shade(c, -0.3), 'metal');

        /* ---- back (water side): terrace doors, guest-room gallery ---- */
        [-3.6, 2.6].forEach(function (u) { K.door(L, 1, u, Q, 1.8, 2.6, { leaf: 0x3a2618 }); });
        [-6.0, -0.5, 5.0].forEach(function (u) { K.win(L, 1, u, Q + 1.0, 1.1, 1.6, {}); });
        F.box(-1.65, Q + 4.08, -1.8, 14.3, 0.2, 1.6, 0, 0x5a4630, 'wood');
        [-7.4, -3.6, 0.1, 3.8, 5.4].forEach(function (x) {
          F.rod(x, Q, -2.45, x, Q + 4.08, -2.45, 0.1, T, 'wood');
          F.beam(x, Q + 3.1, -1.05, x, Q + 4.08, -2.2, 0.12, 0.12, T, 'wood');
        });
        K.rail(-8.8, -2.55, 5.4, -2.55, Q + 4.28, 1.0, T);
        [-5.4, -1.8, 1.8].forEach(function (u) { K.door(L, 1, u - 1, Q + 4.28, 1.0, 2.2, { leaf: 0x46302a, base: Q + 4.28 }); });
        [-3.4, 0.2, 3.9].forEach(function (u) { K.win(L, 1, u - 1, Q + 5.0, 0.9, 1.3, { shut: 0x2f4a66 }); });
        /* laundry on a line along the gallery */
        F.rod(-7.4, Q + 6.8, -2.45, 5.4, Q + 6.8, -2.45, 0.02, 0x6b5a3a, 'wood');
        [-5.8, -4.6, 1.2].forEach(function (x) {
          F.box(x, Q + 6.0, -2.45, 0.8, 0.8, 0.04, 0, F.pick([0xb8d0b0, 0xe8d9a0, 0xc9b8d6, 0xcfc2a3]), 'cloth');
        });

        /* ---- east annex: kitchen, roof storage under a sail ---- */
        const A = { x: 7.2, z: 3.0, w: 3.4, d: 7 };
        F.box(A.x, Q, A.z, A.w, 3.6, A.d, 0, shade(c, -0.04), 'stone');
        F.box(A.x, Q, A.z, A.w + 0.3, 0.45, A.d + 0.3, 0, shade(c, -0.24), 'stone');
        F.box(A.x, Q + 3.5, A.z, A.w + 0.3, 0.25, A.d + 0.3, 0, cornice, 'stone');
        K.parapet({ x: A.x, z: A.z, w: A.w + 0.3, d: A.d + 0.3 }, Q + 3.75, 0.8, 0.25, shade(c, -0.04), [3]);
        K.door(A, 0, 0, Q, 1.2, 2.3, {});
        K.win(A, 2, -1.8, Q + 1.1, 0.9, 1.2, { bars: true });
        K.win(A, 2, 1.8, Q + 1.1, 0.9, 1.2, { bars: true });
        K.win(A, 1, 0, Q + 1.1, 0.9, 1.2, { bars: true });
        F.cyl(8.2, Q + 3.75, 0.4, 0.2, 2.2, 0, 0x3a3128, 'metal');
        F.cone(8.2, Q + 5.95, 0.4, 0.4, 0.35, 0, 0x2a241e, 'metal');
        K.door(L, 2, -0.3, Q + 3.75, 1.0, 2.2, { base: Q + 3.75 });
        [-3.2, 2.9].forEach(function (u) { K.win(L, 2, u, Q + 5.1, 1.0, 1.4, {}); });
        K.sailZ(5.9, 8.7, 0.2, 5.9, Q + 6.4, Q + 5.9, Q + 3.75, F.pick(sailT));
        K.barrel(6.4, Q + 3.75, 5.6, 0.36, 0.9);
        K.barrel(7.2, Q + 3.75, 5.7, 0.36, 0.9);
        K.crate(8.2, Q + 3.75, 4.6, 0.8, 0.2);
        F.box(6.4, Q + 3.75, 1.6, 0.9, 0.3, 1.8, 0, 0x8a2f2a, 'cloth');         /* rolled rugs */
        F.rod(6.4, Q + 4.2, 0.8, 6.4, Q + 4.2, 2.4, 0.2, 0xcbb08e, 'cloth');
        K.ladder(9.1, 5.0, Q, Q + 4.6, false);

        /* ---- the terrace on piles over the water ---- */
        F.box(0, Q - 0.25, -6.6, 16, 0.25, 6.8, 0, 0x5d4a34, 'wood');
        F.box(0, Q - 0.45, -10.0, 16.1, 0.3, 0.14, 0, T, 'wood');
        [-8.0, 8.0].forEach(function (x) { F.box(x, Q - 0.45, -6.6, 0.14, 0.3, 6.8, 0, T, 'wood'); });
        [-7.6, -3.8, 0, 3.8, 7.6].forEach(function (x) {
          [-4.0, -6.8, -9.7].forEach(function (z) { F.cyl(x, 0, z, 0.18, Q - 0.25, 0, 0x3f3326, 'wood'); });
          F.rod(x, 0.2, -4.0, x, Q - 0.3, -6.8, 0.05, 0x3f3326, 'wood');
        });
        /* canopy posts, striped cloth roof, lanterns */
        const cA = Q + 3.2, cB = Q + 2.3;
        [-7.7, -2.6, 2.6, 7.7].forEach(function (x) {
          F.rod(x, Q, -3.6, x, cA, -3.6, 0.11, T, 'wood');
          F.rod(x, Q, -9.75, x, cB, -9.75, 0.11, T, 'wood');
        });
        F.box(0, cA - 0.18, -3.6, 15.7, 0.2, 0.2, 0, T, 'wood');
        F.box(0, cB - 0.18, -9.75, 15.7, 0.2, 0.2, 0, T, 'wood');
        for (let i = 0; i < 6; i++) {
          const x = -7.85 + (i + 0.5) * 15.7 / 6;
          F.beam(x, cA + 0.05, -3.4, x, cB + 0.05, -9.95, 15.7 / 6 + 0.01, 0.06, i % 2 ? cream : blue, 'cloth');
          F.box(x, cB - 0.3, -9.97, 15.7 / 6, 0.32, 0.04, 0, i % 2 ? cream : blue, 'cloth');
        }
        [-5.1, 0, 5.1].forEach(function (x) { K.hangLamp(x, cA - 0.45 - 0.5, -6.7, 0.3); });
        [-5.1, 0, 5.1].forEach(function (x) { K.longTable(x, -6.8, Q, 2.4, false); });
        /* rails round the deck, a gap at the ladder */
        K.rail(-8.0, -3.3, -8.0, -10.0, Q, 1.0, T);
        K.rail(8.0, -3.3, 8.0, -10.0, Q, 1.0, T);
        K.rail(-8.0, -10.0, 5.6, -10.0, Q, 1.0, T);
        K.ladder(6.8, -10.1, 0.1, Q, true);
        /* mooring posts, a punt with a pole and a net */
        [[-8.4, -12.1], [2.6, -12.2], [7.8, -10.6]].forEach(function (p) {
          F.cyl(p[0], 0, p[1], 0.2, 2.2, 0, 0x3f3326, 'wood');
          F.cyl(p[0], 2.2, p[1], 0.26, 0.12, 0, K.iron, 'metal');
        });
        F.box(-2.8, 0.12, -11.75, 4.4, 0.5, 1.3, 0, 0x5a4630, 'wood');
        F.box(-2.8, 0.62, -11.75, 4.5, 0.1, 1.4, 0, 0x3f3326, 'wood');
        [-4.2, -2.8, -1.4].forEach(function (x) { F.box(x, 0.45, -11.75, 0.3, 0.1, 1.2, 0, 0x6b5436, 'wood'); });
        F.rod(-4.6, 0.55, -11.6, -0.3, 1.1, -11.9, 0.04, 0x6b5436, 'wood');
        F.rod(-0.5, 0.6, -11.75, 2.5, 1.4, -12.2, 0.02, 0x8a7a5a, 'wood');
        K.crate(-3.4, 0.62, -11.8, 0.6, 0.3);
      } else if (F.variant === 1) {
        /* ================= Hlaalu corner inn round a guar yard ================= */
        const c = F.pick(stoneT), trim = shade(c, -0.2), cornice = shade(c, -0.14);
        const K = kit(F, trim), T = K.timber;
        const green = F.pick([0x6b7a4a, 0x5f6e42]), terra = F.pick([0xb35a3a, 0xa04f32]);
        const shut = F.pick([0x46603f, 0x5a4028]);
        const H1 = 4.0, H2 = 7.3, H3 = 10.6;
        const FW = { x: 0, z: 7.0, w: 21, d: 7 };            /* front wing */
        const SW = { x: -7, z: -3.5, w: 7, d: 14 };          /* side wing  */
        const TW = { x: -8, z: 8, w: 5.2, d: 5.2 };          /* corner tower */

        /* masses and cornices */
        [FW, SW].forEach(function (B) {
          F.box(B.x, 0, B.z, B.w, H3, B.d, 0, c, 'stone');
          F.box(B.x, 0, B.z, B.w + 0.3, 0.5, B.d + 0.3, 0, shade(c, -0.24), 'stone');
          [H1, H2].forEach(function (y) { F.box(B.x, y - 0.15, B.z, B.w + 0.35, 0.3, B.d + 0.35, 0, cornice, 'stone'); });
        });
        F.box(FW.x, H3 - 0.2, FW.z, FW.w + 0.5, 0.4, FW.d + 0.5, 0, cornice, 'stone');
        F.box(SW.x, H3 - 0.2, SW.z, SW.w + 0.5, 0.4, SW.d + 0.5, 0, cornice, 'stone');
        /* tower: one storey higher, pagoda cap with flared eaves */
        F.box(TW.x, 0, TW.z, TW.w, 14.0, TW.d, 0, shade(c, 0.05), 'stone');
        F.box(TW.x, 0, TW.z, TW.w + 0.3, 0.5, TW.d + 0.3, 0, shade(c, -0.24), 'stone');
        [H1, H2, H3].forEach(function (y) { F.box(TW.x, y - 0.15, TW.z, TW.w + 0.35, 0.3, TW.d + 0.35, 0, cornice, 'stone'); });
        F.box(TW.x, 13.8, TW.z, TW.w + 0.6, 0.4, TW.d + 0.6, 0, cornice, 'stone');
        F.box(TW.x, 14.2, TW.z, TW.w + 2.2, 0.16, TW.d + 2.2, 0, shade(green, -0.2), 'roof');
        F.pyrRoof(TW.x, 14.36, TW.z, TW.w + 2.2, 1.0, TW.d + 2.2, 0, green, 'roof');
        F.box(TW.x, 15.1, TW.z, 3.0, 0.7, 3.0, 0, shade(c, 0.02), 'stone');
        F.pyrRoof(TW.x, 15.8, TW.z, 4.2, 1.8, 4.2, 0, green, 'roof');
        F.rod(TW.x, 17.5, TW.z, TW.x, 18.0, TW.z, 0.06, 0xc4a04a, 'metal');
        F.ball(TW.x, 17.85, TW.z, 0.15, 0xc4a04a, 'metal');
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
          F.box(TW.x + p[0] * 1.3, 15.1, TW.z + p[1] * 1.3, 0.4, 0.7, 0.4, 0, cornice, 'stone');
        });
        /* side wing: low green hip roof with wide eaves */
        /* a true hipped roof: two long slopes meeting at a ridge along z,
           and a square hip pyramid at each end (their inner faces sit
           under the slopes) */
        (function () {
          const rw = SW.w + 1.4, rd = SW.d + 0.7, rz = SW.z - 0.35, y0 = H3 + 0.2, rh = 2.4;
          const len = rd - rw, zc = rz;
          [-1, 1].forEach(function (k) {
            F.pyrRoof(SW.x, y0, zc + k * len / 2, rw, rh, rw, 0, green, 'roof');
            F.beam(SW.x + k * rw / 2, y0 + 0.04, zc, SW.x, y0 + rh + 0.04, zc, 0.1, len, green, 'roof');
          });
          F.beam(SW.x, y0 + rh - 0.05, zc - len / 2, SW.x, y0 + rh - 0.05, zc + len / 2, 0.26, 0.2, shade(green, -0.22), 'roof');
          [-1, 1].forEach(function (k) { F.ball(SW.x, y0 + rh + 0.05, zc + k * len / 2, 0.16, 0xc4a04a, 'metal'); });
          F.box(SW.x, y0 - 0.02, rz, rw + 0.06, 0.1, rd + 0.06, 0, shade(green, -0.25), 'roof');
          /* rafter ends under the long eaves */
          for (let z = rz - rd / 2 + 0.6; z <= rz + rd / 2 - 0.5; z += 1.1) {
            [-1, 1].forEach(function (k) { F.box(SW.x + k * (SW.w / 2 + 0.35), y0 - 0.2, z, 0.7, 0.18, 0.14, 0, T, 'wood'); });
          }
        })();
        K.chimney(-9.2, -8.4, H3 + 0.6, 2.4, c);
        K.chimney(-4.9, -1.6, H3 + 0.6, 2.2, c);

        /* ---- front (+z): taproom door, windows, balcony + canopy ---- */
        K.door(FW, 0, 0.8, 0, 2.2, 2.9, { leaf: 0x3a2618 });
        [-3.2, 4.8, 8.4].forEach(function (u) { K.win(FW, 0, u, 1.0, 1.5, 1.9, { shut: shut }); });
        const bz = FW.z + FW.d / 2;
        F.box(4.0, H1 - 0.05, bz + 0.75, 11.2, 0.22, 1.5, 0, 0x5a4630, 'wood');
        [-1.4, 1.8, 4.0, 6.2, 9.4].forEach(function (x) {
          F.beam(x, H1 - 1.1, bz + 0.05, x, H1 - 0.05, bz + 1.35, 0.14, 0.14, T, 'wood');
        });
        K.rail(-1.6, bz + 1.45, 9.6, bz + 1.45, H1 + 0.17, 1.0, T);
        K.rail(-1.6, bz + 0.05, -1.6, bz + 1.45, H1 + 0.17, 1.0, T);
        K.rail(9.6, bz + 0.05, 9.6, bz + 1.45, H1 + 0.17, 1.0, T);
        [-0.4, 2.8, 6.0, 9.0].forEach(function (u) { K.door(FW, 0, u, H1 + 0.17, 1.0, 2.2, { leaf: shut, base: H1 + 0.17 }); });
        K.awning(FW, 0, 4.0, H2 - 0.3, 11.4, 1.7, 0.6, F.pick(sailT), 'cloth', [-1.5, 9.5], H1 + 0.17, 0x7a2028);
        [-3.4, -0.4, 2.8, 6.0, 9.0].forEach(function (u) { K.win(FW, 0, u, H2 + 0.9, 1.1, 1.5, { shut: shut, box: u > 0 && (rich || u < 5) }); });
        [-3.4].forEach(function (u) { K.win(FW, 0, u, H1 + 0.9, 1.1, 1.5, { shut: shut }); });
        K.lantern(-0.9, 3.4, bz + 0.05, 0, 0.45);
        K.lantern(2.5, 3.4, bz + 0.05, 0, 0.45);
        /* tables, benches, casks on the street */
        K.longTable(-3.4, bz + 1.9, 0, 2.6, true);
        K.roundTable(5.6, bz + 1.9, 0, 0.5);
        K.bench(8.4, bz + 0.35, 0, 2.2, true);
        K.barrel(9.6, 0, bz + 0.6, 0.42, 1.05);
        K.barrel(9.7, 0, bz + 1.5, 0.42, 1.05);
        K.barrel(9.65, 1.05, bz + 1.05, 0.4, 1.0);

        /* ---- corner tower: guest door, windows on the outer faces, sign ---- */
        K.door(TW, 0, 0, 0, 1.6, 2.7, { leaf: shut });
        K.awning(TW, 0, 0, 3.7, 3.0, 1.2, 0.4, shade(green, 0.05), 'roof', null, 0);
        [H1 + 0.9, H2 + 0.9, H3 + 0.9].forEach(function (y) {
          K.win(TW, 0, 0, y, 1.0, 1.5, { shut: shut });
          K.win(TW, 3, 0, y, 1.0, 1.5, { shut: shut });
        });
        K.win(TW, 3, 0, 1.1, 1.1, 1.6, { bars: true });
        K.win(TW, 1, 0, 11.3, 0.9, 1.3, {});
        K.door(TW, 2, -0.8, H3, 1.0, 2.2, { base: H3 });
        K.win(TW, 2, 1.3, H3 + 1.0, 0.7, 1.1, {});
        K.sign(TW.x - TW.w / 2 - 0.02, 6.2, TW.z + 1.6, -1, 0, F.pick(bannerT), 'jug');
        K.sign(TW.x + 1.8, 6.2, TW.z + TW.d / 2 + 0.02, 0, 1, F.pick(bannerT), 'jug');
        K.postLamp(-10.9, 10.9, 0, 2.8);

        /* ---- west flank of the side wing (street) ---- */
        [-5.2, -1.4, 2.4].forEach(function (u) {
          K.win(SW, 3, u, 1.1, 1.2, 1.7, { bars: true });
          K.win(SW, 3, u, H2 + 0.9, 1.0, 1.5, { shut: shut });
        });
        [-5.2, 2.4].forEach(function (u) { K.win(SW, 3, u, H1 + 0.9, 1.0, 1.5, { shut: shut }); });
        /* bracketed balcony with its own little canopy */
        F.box(-11.2, H1 - 0.05, -2.9, 1.4, 0.22, 2.8, 0, 0x5a4630, 'wood');
        [-3.9, -1.9].forEach(function (z) { F.beam(-10.55, H1 - 1.0, z, -11.75, H1 - 0.05, z, 0.14, 0.14, T, 'wood'); });
        K.rail(-11.85, -4.25, -11.85, -1.55, H1 + 0.17, 1.0, T);
        K.door(SW, 3, 0.6, H1 + 0.17, 1.0, 2.2, { leaf: shut, base: H1 + 0.17 });
        K.awning(SW, 3, 0.6, H1 + 3.0, 3.0, 1.45, 0.5, F.pick(sailT), 'cloth', null, 0);
        K.door(SW, 3, -3.2, 0, 1.2, 2.4, {});
        F.rod(-10.62, 0.5, -10.2, -10.62, H3 - 0.1, -10.2, 0.1, shade(c, -0.3), 'metal');

        /* ---- back of the side wing ---- */
        [-1.6, 1.6].forEach(function (u) {
          K.win(SW, 1, u, 1.1, 1.1, 1.6, { bars: true });
          K.win(SW, 1, u, H1 + 0.9, 1.0, 1.5, { shut: shut });
          K.win(SW, 1, u, H2 + 0.9, 1.0, 1.5, { shut: shut });
        });
        /* ---- east end of the front wing ---- */
        [-1.4, 1.6].forEach(function (u) {
          K.win(FW, 2, u, H1 + 0.9, 1.0, 1.5, { shut: shut });
          K.win(FW, 2, u, H2 + 0.9, 1.0, 1.5, { shut: shut });
        });
        K.win(FW, 2, 1.6, 1.1, 1.2, 1.7, { bars: true });
        K.door(FW, 2, -1.6, 0, 1.2, 2.4, {});

        /* ---- the yard: paving, walls, gate, stable lean-to, guar ---- */
        F.box(3.5, 0, -3.5, 14, 0.06, 14, 0, 0x7e7460, 'stone');
        F.box(10.25, 0, -6.7, 0.5, 2.8, 7.6, 0, shade(c, -0.05), 'stone');
        F.box(10.25, 0, 2.6, 0.5, 2.8, 1.8, 0, shade(c, -0.05), 'stone');
        F.box(3.5, 0, -10.25, 14, 2.8, 0.5, 0, shade(c, -0.05), 'stone');
        F.box(10.25, 2.8, -6.7, 0.7, 0.2, 7.8, 0, cornice, 'stone');
        F.box(3.5, 2.8, -10.25, 14.2, 0.2, 0.7, 0, cornice, 'stone');
        F.box(10.25, 2.8, 2.6, 0.7, 0.2, 1.8, 0, cornice, 'stone');
        /* gate: piers, beam, leaves swung open, lantern */
        [-2.6, 1.4].forEach(function (z) {
          F.box(10.25, 0, z, 0.9, 3.8, 0.9, 0, shade(c, -0.1), 'stone');
          F.box(10.25, 3.8, z, 1.1, 0.25, 1.1, 0, cornice, 'stone');
        });
        F.box(10.25, 3.4, -0.6, 0.4, 0.4, 3.2, 0, T, 'wood');
        F.box(9.1, 0.1, -2.05, 1.7, 2.6, 0.12, 0, 0x5a4028, 'wood');
        F.box(9.1, 0.1, 0.85, 1.7, 2.6, 0.12, 0, 0x5a4028, 'wood');
        K.lantern(10.8, 3.2, 1.4, 0.45, 0);
        /* stable lean-to along the back wall, stalls, troughs, hay */
        [-2.6, 0.9, 4.4, 7.9].forEach(function (x) { F.rod(x, 0, -6.9, x, 2.35, -6.9, 0.12, T, 'wood'); });
        F.beam(3.5, 3.2, -10.0, 3.5, 2.35, -6.7, 11.4, 0.1, terra, 'roof');
        F.box(3.5, 2.2, -6.9, 11.0, 0.18, 0.2, 0, T, 'wood');
        [-0.85, 2.65, 6.15].forEach(function (x) { F.box(x, 0, -8.5, 0.12, 1.5, 3.0, 0, 0x5a4630, 'wood'); });
        F.box(3.5, 0, -9.6, 10.4, 0.6, 0.6, 0, shade(c, -0.18), 'stone');
        F.box(3.5, 0.5, -9.6, 10.2, 0.06, 0.45, 0, 0x33494a, 'stone');
        [-1.8, 1.5, 5.4].forEach(function (x) { F.box(x, 0, -8.0, 1.0, 0.6, 0.7, 0.2, 0xb8a068, 'wood'); });
        F.box(8.9, 0, -8.2, 1.1, 0.6, 1.6, 0, 0xb8a068, 'wood');
        F.box(8.9, 0.6, -8.4, 1.0, 0.55, 0.8, 0.1, 0xab9660, 'wood');
        /* a guar tethered in the yard */
        (function (gx, gz) {
          const g = 0x8a7a5a, gd = shade(g, -0.2);
          F.blob(gx, 1.25, gz, 0.62, 1.05, 0, g, 'wood');
          [-0.3, 0.3].forEach(function (k) {
            F.rod(gx + k, 1.1, gz - 0.1, gx + k * 1.2, 0.35, gz - 0.25, 0.15, gd, 'wood');
            F.rod(gx + k * 1.2, 0.35, gz - 0.25, gx + k * 1.2, 0.04, gz - 0.05, 0.1, gd, 'wood');
            F.box(gx + k * 1.2, 0, gz + 0.05, 0.22, 0.08, 0.4, 0, gd, 'wood');
            F.rod(gx + k * 0.8, 1.35, gz + 0.45, gx + k * 0.9, 1.0, gz + 0.65, 0.05, gd, 'wood');
          });
          F.rod(gx, 1.5, gz + 0.4, gx, 1.85, gz + 0.8, 0.2, g, 'wood');
          F.blob(gx, 1.95, gz + 1.0, 0.36, 0.5, 0, g, 'wood');
          F.ball(gx, 1.88, gz + 1.32, 0.18, shade(g, 0.08), 'wood');
          F.ball(gx - 0.2, 2.08, gz + 1.08, 0.05, 0x1c1a16, 'wood');
          F.ball(gx + 0.2, 2.08, gz + 1.08, 0.05, 0x1c1a16, 'wood');
          F.rod(gx, 1.1, gz - 0.45, gx, 0.5, gz - 1.2, 0.15, g, 'wood');
          F.rod(gx, 0.5, gz - 1.2, gx, 0.12, gz - 1.9, 0.08, g, 'wood');
          F.box(gx, 1.55, gz - 0.1, 0.9, 0.12, 0.8, 0, 0x7a2028, 'cloth');
          F.rod(gx, 1.85, gz + 1.25, 8.8, 1.2, -3.6, 0.02, 0x8a7a5a, 'wood');
        })(4.4, -3.4);
        F.cyl(8.8, 0, -3.6, 0.12, 1.3, 0, T, 'wood');
        /* well + handcart */
        F.cyl(0.6, 0, -2.0, 0.8, 0.9, 0, shade(c, -0.1), 'stone');
        F.cyl(0.6, 0.85, -2.0, 0.62, 0.06, 0, 0x33494a, 'stone');
        [-0.75, 0.75].forEach(function (k) { F.rod(0.6 + k, 0.9, -2.0, 0.6 + k, 2.4, -2.0, 0.07, T, 'wood'); });
        F.rod(-0.2, 2.2, -2.0, 1.4, 2.2, -2.0, 0.07, T, 'wood');
        F.box(0.6, 2.4, -2.0, 1.8, 0.1, 1.0, 0, shade(green, 0.02), 'roof');
        F.box(7.0, 0.6, -5.2, 1.3, 0.5, 2.0, 0, 0x6b5436, 'wood');
        K.wheel(6.3, 0.6, -4.9, 0.6, true);
        K.wheel(7.7, 0.6, -4.9, 0.6, true);
        F.rod(7.0, 0.8, -6.1, 7.0, 0.05, -6.6, 0.05, T, 'wood');
        K.crate(7.0, 1.1, -4.9, 0.6, 0.1);

        /* ---- yard faces: L-shaped timber gallery on the first floor ---- */
        const gy = H1 - 0.05;
        F.box(3.5, gy, 2.8, 14.0, 0.22, 1.4, 0, 0x5a4630, 'wood');
        F.box(-2.8, gy, -3.5, 1.4, 0.22, 14.0, 0, 0x5a4630, 'wood');
        [-2.2, 1.6, 5.2, 8.9].forEach(function (x) { F.rod(x, 0, 2.2, x, gy, 2.2, 0.11, T, 'wood'); });
        [-7.8, -4.4, -1.0].forEach(function (z) { F.rod(-2.2, 0, z, -2.2, gy, z, 0.11, T, 'wood'); });
        K.rail(-2.1, 2.1, 8.4, 2.1, gy + 0.22, 1.0, T);
        K.rail(-2.1, 2.1, -2.1, -10.0, gy + 0.22, 1.0, T);
        K.flight(4.4, 1.5, 8.6, 1.5, 0, gy + 0.1, 1.0, 0x5a4630, false);
        F.box(9.45, gy, 1.52, 1.7, 0.22, 1.16, 0, 0x5a4630, 'wood');
        F.rod(10.2, 0, 1.0, 10.2, gy, 1.0, 0.11, T, 'wood');
        K.rail(10.25, 0.95, 10.25, 3.4, gy + 0.22, 1.0, T);
        [0.0, 4.0, 7.4].forEach(function (u) { K.door(FW, 1, u, gy + 0.22, 1.0, 2.2, { leaf: shut, base: gy + 0.22 }); });
        [-6.6, -2.4, 1.4].forEach(function (u) { K.door(SW, 2, u, gy + 0.22, 1.0, 2.2, { leaf: shut, base: gy + 0.22 }); });
        K.awning(FW, 1, 4.0, H2 + 0.2, 13.4, 1.4, 0.5, F.pick(sailT), 'cloth', null, 0);
        [-1.5, 2.0, 5.8, 9.4].forEach(function (u) { K.win(FW, 1, u, H2 + 0.9, 1.0, 1.4, { shut: shut }); });
        [-6.0, -2.0, 1.8].forEach(function (u) { K.win(SW, 2, u, H2 + 0.9, 1.0, 1.4, { shut: shut }); });
        K.door(FW, 1, 2.0, 0, 1.6, 2.6, {});
        [5.4, 9.2].forEach(function (u) { K.win(FW, 1, u, 1.1, 1.1, 1.5, { bars: true }); });
        K.door(SW, 2, -1.5, 0, 1.4, 2.5, {});
        [-5.8, 2.4].forEach(function (u) { K.win(SW, 2, u, 1.1, 1.1, 1.5, { bars: true }); });

        /* ---- roof terrace on the front wing ---- */
        const R = { x: 2.55, z: FW.z, w: 15.9, d: FW.d };
        K.parapet(R, H3 + 0.2, 0.9, 0.3, shade(c, 0.02), [3]);
        /* stair-head room with its door and window */
        F.box(9.1, H3 + 0.2, 5.2, 2.6, 2.6, 3.0, 0, shade(c, 0.03), 'stone');
        F.box(9.1, H3 + 2.8, 5.2, 3.0, 0.25, 3.4, 0, cornice, 'stone');
        const SH = { x: 9.1, z: 5.2, w: 2.6, d: 3.0 };
        K.door(SH, 3, 0, H3 + 0.2, 1.0, 2.1, { base: H3 + 0.2 });
        K.win(SH, 0, 0, H3 + 1.1, 0.7, 1.0, {});
        K.win(SH, 2, 0, H3 + 1.1, 0.7, 1.0, {});
        /* two shade sails, tables, planters, cistern, rugs on a rack */
        K.sailZ(-4.9, 1.6, 4.0, 10.1, H3 + 3.3, H3 + 2.7, H3 + 0.2, F.pick(sailT));
        K.sailX(1.6, 7.6, 6.9, 10.1, H3 + 3.1, H3 + 2.6, H3 + 0.2, 0xb0c8d8);
        K.roundTable(-2.4, 7.2, H3 + 0.2, 0.55);
        K.roundTable(4.4, 8.4, H3 + 0.2, 0.55);
        K.planter(-2.0, 10.0 - 0.3, H3 + 0.2, 4.4, 0.6);
        K.planter(7.4, 4.0, H3 + 0.2, 0.6, 0.6);
        F.cyl(10.0, H3 + 0.2, 8.9, 0.75, 1.6, 0, shade(c, -0.15), 'stone');
        F.cyl(10.0, H3 + 1.8, 8.9, 0.8, 0.12, 0, T, 'wood');
        [[5.2, 4.2], [8.0, 4.2]].forEach(function (p) { F.rod(p[0], H3 + 0.2, p[1], p[0], H3 + 1.8, p[1], 0.06, T, 'wood'); });
        F.rod(5.2, H3 + 1.8, 4.2, 8.0, H3 + 1.8, 4.2, 0.05, T, 'wood');
        F.box(6.0, H3 + 0.9, 4.2, 1.0, 0.9, 0.05, 0, 0x7a2028, 'cloth');
        F.box(7.2, H3 + 1.0, 4.2, 1.0, 0.8, 0.05, 0, 0xc9b8d6, 'cloth');
      } else {
        /* ================= Velothi cornerclub, half-sunk under a dome ================= */
        const c = F.pick(stoneT), trim = shade(c, -0.2), cornice = shade(c, -0.15);
        const K = kit(F, trim), T = K.timber;
        const domeC = F.pick([0xb0a682, 0x9d9379, 0xa8a08a]);
        const P = 1.6;                                     /* berm top */
        const cz = -0.5, R0 = 5.6;                         /* hall centre + drum radius */

        /* ---- the berm, built round the trench that leads down to the door ---- */
        const berm = shade(c, -0.08);
        F.box(0, 0, -3.0, 17, P, 16, 0, berm, 'stone');              /* z -11 .. 5 */
        F.box(-5.1, 0, 7.0, 6.8, P, 4, 0, berm, 'stone');             /* front left  */
        F.box(5.1, 0, 7.0, 6.8, P, 4, 0, berm, 'stone');              /* front right */
        F.box(0, 0, 8.6, 3.4, P, 0.8, 0, berm, 'stone');               /* head of trench */
        F.box(0, 0, 3.4, 3.4, 0.08, 3.4, 0, shade(c, -0.25), 'stone');  /* trench floor */
        /* coping and plinth course round the outside */
        F.box(0, P - 0.12, -3.0, 17.3, 0.2, 16.3, 0, cornice, 'stone');
        F.box(-5.1, P - 0.12, 7.15, 7.1, 0.2, 4.3, 0, cornice, 'stone');
        F.box(5.1, P - 0.12, 7.15, 7.1, 0.2, 4.3, 0, cornice, 'stone');
        F.box(0, P - 0.12, 8.75, 3.4, 0.2, 0.8, 0, cornice, 'stone');
        F.box(0, 0, -3.0, 17.25, 0.35, 16.25, 0, shade(c, -0.26), 'stone');
        [-1, 1].forEach(function (k) { F.box(k * 5.1, 0, 7.1, 7.05, 0.35, 4.25, 0, shade(c, -0.26), 'stone'); });
        /* buttress pilasters on the berm faces */
        [-6.5, -3.5, 3.5, 6.5].forEach(function (x) { F.frustum(x, 0, 9.05, 0.35, 0.2, P, 0, shade(c, -0.14), 'stone', 4); });
        [-6.5, -2.2, 2.2, 6.5].forEach(function (x) { F.frustum(x, 0, -11.05, 0.35, 0.2, P, 0, shade(c, -0.14), 'stone', 4); });
        [-8.0, -4.0, 0, 4.0].forEach(function (z) {
          F.frustum(-8.55, 0, z, 0.35, 0.2, P, 0, shade(c, -0.14), 'stone', 4);
          F.frustum(8.55, 0, z, 0.35, 0.2, P, 0, shade(c, -0.14), 'stone', 4);
        });
        /* street steps up onto the berm */
        for (let i = 0; i < 4; i++) F.box(-5.0, 0, 9.2 + i * 0.35, 4.2, P * (4 - i) / 4, 0.35, 0, shade(c, -0.14 - 0.02 * i), 'stone');
        for (let i = 0; i < 4; i++) F.box(5.0, 0, 9.2 + i * 0.35, 4.2, P * (4 - i) / 4, 0.35, 0, shade(c, -0.14 - 0.02 * i), 'stone');
        /* trench: stair down, walls with kerbs, a lamp at the bottom */
        for (let i = 0; i < 6; i++) F.box(0, 0, 8.0 - i * 0.4, 3.4, P * (6 - i) / 6.6, 0.4, 0, shade(c, -0.18), 'stone');
        [-1, 1].forEach(function (k) {
          F.box(k * 1.85, P, 6.6, 0.3, 0.6, 4.0, 0, trim, 'stone');
          F.box(k * 1.85, 0.8, 4.4, 0.08, 0.05, 1.6, 0, 0x3f4640, 'stone');
        });

        /* ---- the hall: battered drum, band, ribbed dome, smoke vent ---- */
        const rot = TAU / 32;                      /* a flat, not an edge, faces front */
        F.frustum(0, 0, cz, R0 + 0.5, R0, 4.4, rot, c, 'stone', 16);
        F.frustum(0, 4.4, cz, R0 + 0.15, R0 + 0.15, 0.4, rot, cornice, 'stone', 16);
        F.frustum(0, 4.8, cz, R0 - 0.1, R0 - 0.3, 0.5, rot, shade(c, 0.04), 'stone', 16);
        F.dome(0, 5.3, cz, R0 - 0.3, 3.4, 0, domeC, 'dome');
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * TAU + TAU / 16;
          let px = Math.sin(a) * (R0 - 0.25), pz = cz + Math.cos(a) * (R0 - 0.25), py = 5.3;
          for (let k = 1; k <= 4; k++) {
            const t = k / 4 * 1.25, rr = (R0 - 0.25) * Math.cos(t), yy = 5.3 + 3.45 * Math.sin(t);
            const nx = Math.sin(a) * rr, nz = cz + Math.cos(a) * rr;
            F.rod(px, py, pz, nx, yy, nz, 0.13, shade(domeC, -0.22), 'stone');
            px = nx; pz = nz; py = yy;
          }
        }
        /* smoke vent: sooty ring, drum, cap on posts */
        F.cyl(0, 8.35, cz, 1.3, 0.25, 0, 0x4d463f, 'stone');
        F.cyl(0, 8.5, cz, 0.85, 0.8, 0, shade(c, -0.1), 'stone');
        [0, 1, 2, 3].forEach(function (i) {
          const a = i / 4 * TAU + TAU / 8;
          F.box(Math.sin(a) * 0.65, 9.3, cz + Math.cos(a) * 0.65, 0.18, 0.45, 0.18, 0, 0x3a3128, 'stone');
        });
        F.cone(0, 9.75, cz, 1.2, 0.55, 0, shade(domeC, -0.25), 'roof');
        F.ball(0, 9.35, cz, 0.35, 0x4d463f, 'stone');
        /* clerestory slits round the drum above the berm, lit from within */
        const apo = Math.cos(Math.PI / 16);
        for (let k = 0; k < 16; k++) {
          const a = k / 16 * TAU;
          if (k === 0 || k === 7 || k === 8 || k === 9) continue;
          const r = (R0 + 0.5 - 0.5 * (2.6 / 4.4)) * apo + 0.04;
          F.box(Math.sin(a) * r, 2.2, cz + Math.cos(a) * r, 0.55, 1.5, 0.14, a, k % 2 ? 0x6a4a26 : 0x1c1a16, 'wood');
          F.box(Math.sin(a) * (r + 0.02), 3.7, cz + Math.cos(a) * (r + 0.02), 0.95, 0.22, 0.3, a, cornice, 'stone');
        }
        /* battered buttresses round the drum (clear of door and annex) */
        [2, 6, 10, 14].forEach(function (k) {
          const a = (k + 0.5) / 16 * TAU, r = R0 + 0.55;
          F.frustum(Math.sin(a) * r, P, cz + Math.cos(a) * r, 0.45, 0.25, 2.3, a, shade(c, -0.1), 'stone', 4);
          F.cone(Math.sin(a) * r, P + 2.3, cz + Math.cos(a) * r, 0.36, 0.5, 0, cornice, 'stone');
        });
        /* door at the bottom of the trench: pointed hood, leaf, lamp */
        const dz = cz + (R0 + 0.5 - 0.5 * (1.2 / 4.4)) * apo;
        F.box(0, 0, dz + 0.1, 2.8, 3.3, 0.6, 0, trim, 'stone');
        F.box(0, 0.08, dz + 0.42, 1.6, 2.5, 0.1, 0, 0x3a2618, 'wood');
        F.box(0, 2.58, dz + 0.42, 1.0, 0.4, 0.1, 0, 0x3a2618, 'wood');
        F.box(0, 3.3, dz + 0.1, 3.2, 0.3, 0.8, 0, cornice, 'stone');
        F.cone(0, 3.6, dz + 0.1, 0.9, 0.9, rot, cornice, 'stone');
        K.lantern(-1.2, 2.6, dz + 0.42, 0, 0.35);
        K.lantern(1.2, 2.6, dz + 0.42, 0, 0.35);

        /* ---- out front on the berm: pylons with braziers, benches, sign ---- */
        [-7.9, 7.9].forEach(function (x) {
          F.frustum(x, P, 8.3, 0.6, 0.42, 2.6, 0, shade(c, 0.03), 'stone', 4);
          F.box(x, P + 2.6, 8.3, 1.0, 0.2, 1.0, 0, cornice, 'stone');
          F.cyl(x, P + 2.8, 8.3, 0.45, 0.35, 0, 0x3a3128, 'metal');
          F.blob(x, P + 3.3, 8.3, 0.4, 0.55, 0, 0xffb066, 'glow');
        });
        [-4.2, 4.2].forEach(function (x) {
          [[-0.3, -0.2], [0.3, -0.2], [0, 0.3]].forEach(function (p) {
            F.rod(x + p[0] * 1.6, P, 6.4 + p[1] * 1.6, x, P + 0.8, 6.4, 0.04, K.iron, 'metal');
          });
          F.cyl(x, P + 0.75, 6.4, 0.5, 0.3, 0, 0x3a3128, 'metal');
          F.blob(x, P + 1.2, 6.4, 0.42, 0.5, 0, 0xffb066, 'glow');
        });
        [-5.6, 5.6].forEach(function (x) {
          F.box(x, P, 8.3, 3.0, 0.45, 0.6, 0, trim, 'stone');
          F.box(x, P + 0.45, 8.3, 3.2, 0.1, 0.7, 0, cornice, 'stone');
        });
        [-6.2, 6.2].forEach(function (x) {
          F.box(x, P, 5.2, 0.6, 0.45, 2.4, 0, trim, 'stone');
          F.box(x, P, 4.0, 0.9, 0.2, 0.9, 0, 0x7a2028, 'cloth');
          K.roundTable(x - Math.sign(x) * 1.5, 3.0, P, 0.5);
        });
        F.rod(2.3, P, 8.7, 2.3, P + 3.3, 8.7, 0.08, T, 'wood');
        K.sign(2.3, P + 3.2, 8.7, -1, 0, F.pick(bannerT), 'jug');
        K.barrel(-2.6, P, 5.6, 0.4, 1.0);
        K.barrel(-2.6, P + 1.0, 5.6, 0.38, 0.95);
        K.barrel(-3.3, P, 6.1, 0.4, 1.0);

        /* ---- guest-room annex behind the hall, roof garden on top ---- */
        const A = { x: 0, z: -8.2, w: 11.4, d: 5.6 };
        const aT = P + 6.2;
        F.box(A.x, P, A.z, A.w, 6.2, A.d, 0, shade(c, 0.03), 'stone');
        F.box(A.x, P, A.z, A.w + 0.3, 0.4, A.d + 0.3, 0, shade(c, -0.24), 'stone');
        F.box(A.x, P + 3.0, A.z, A.w + 0.3, 0.25, A.d + 0.3, 0, cornice, 'stone');
        F.box(A.x, aT - 0.2, A.z, A.w + 0.4, 0.35, A.d + 0.4, 0, cornice, 'stone');
        K.parapet({ x: A.x, z: A.z, w: A.w + 0.3, d: A.d + 0.3 }, aT + 0.15, 0.8, 0.3, shade(c, 0.03));
        /* capped corner pylons on the annex */
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
          const x = A.x + p[0] * (A.w / 2 + 0.05), z = A.z + p[1] * (A.d / 2 + 0.05);
          F.frustum(x, P, z, 0.55, 0.4, 7.4, 0, shade(c, -0.05), 'stone', 4);
          F.pyrRoof(x, P + 7.4, z, 1.1, 0.7, 1.1, 0, domeC, 'roof');
        });
        /* windows: arched-hood slits, all round */
        [-3.8, -1.5, 1.5, 3.8].forEach(function (u) {
          K.win(A, 1, u, P + 1.0, 0.7, 1.5, { bars: true });
          K.win(A, 1, u, P + 4.0, 0.8, 1.4, { shut: 0x5a4028 });
        });
        [-4.1, 4.1].forEach(function (u) {
          K.win(A, 0, u, P + 1.0, 0.7, 1.5, {});
          K.win(A, 0, u, P + 4.0, 0.8, 1.4, { box: true });
        });
        K.win(A, 3, -0.8, P + 1.0, 0.7, 1.5, { bars: true });
        K.win(A, 3, 0.4, P + 4.0, 0.8, 1.4, { shut: 0x5a4028 });
        K.win(A, 2, 1.0, P + 1.0, 0.7, 1.5, { bars: true });
        /* east: stone stair up to the guest-room door, then a ladder to the roof */
        K.flight(7.25, 1.4, 7.25, -5.4, P, P + 3.2, 1.1, shade(c, -0.12), true);
        F.box(7.25, P, -6.6, 1.1, 3.2, 2.4, 0, shade(c, -0.12), 'stone');
        F.box(6.2, P + 3.0, -6.8, 1.2, 0.2, 2.0, 0, shade(c, -0.12), 'stone');
        F.box(7.25, P + 3.2, -6.6, 1.25, 0.12, 2.5, 0, cornice, 'stone');
        K.rail(7.8, 1.2, 7.8, -7.8, P + 3.3, 0.9, T);
        K.door(A, 2, 1.4, P + 3.2, 1.0, 2.2, { base: P + 3.2 });
        K.ladder(6.95, -9.4, P + 3.2, aT + 1.0, false);
        K.awning(A, 2, 1.4, P + 6.0, 2.2, 1.0, 0.35, 0x7a2028, 'cloth', null, 0);
        /* roof garden: planters, pergola with vines, bench, water jars */
        K.planter(-3.8, -10.3, aT + 0.15, 3.4, 0.7);
        K.planter(3.2, -10.3, aT + 0.15, 3.4, 0.7);
        K.planter(-5.1, -8.2, aT + 0.15, 0.7, 2.4);
        F.tree(-4.0, -7.2, 'shrub', 1.1, aT + 0.15);
        F.tree(4.4, -6.8, 'olive', 2.8, aT + 0.15);
        [-2.4, 1.6].forEach(function (x) {
          [-9.6, -6.6].forEach(function (z) { F.rod(x, aT + 0.15, z, x, aT + 2.5, z, 0.08, T, 'wood'); });
          F.box(x, aT + 2.5, -8.1, 0.16, 0.16, 3.4, 0, T, 'wood');
        });
        for (let i = 0; i < 6; i++) F.box(-0.4, aT + 2.66, -9.6 + i * 0.6, 4.6, 0.1, 0.1, 0, T, 'wood');
        for (let i = 0; i < 6; i++) {
          F.blob(-2.2 + i * 0.75, aT + 2.55, -8.1 + F.rr(-1.2, 1.2), 0.5, 0.35, 0, F.pick([0x6f7d42, 0x7b8a4c, 0x66743e]), 'leaf');
        }
        K.bench(-0.4, -9.5, aT + 0.15, 2.4, true);
        [[1.1, -7.0], [1.6, -7.1]].forEach(function (p) {
          F.blob(p[0], aT + 0.5, p[1], 0.3, 0.7, 0, 0x9a6a4a, 'stone');
        });
      }
    }
  });
})();
