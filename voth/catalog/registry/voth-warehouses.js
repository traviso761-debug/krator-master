/* ======================================================================
   voth-warehouses — second-generation Voth warehouses (source 'voth-warehouses')
   One IIFE so the shared kit below is not a top-level declaration.
   Two designed variants under voth_warehouse_b:
     0  canal warehouse: five storeys rising out of the water, a loading
        door with its own davit on every floor, a roof hoist hood with the
        main pulley, a water door onto a landing stage, nets, a barge
     1  bonded grain store: long two-storey louvred store on a loading dock,
        a walled yard with gate, a scale house with a beam scale, ramp,
        and an open roof loft under a tiled canopy
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
    key: 'voth_warehouse_b', name: 'Warehouse (second series)', culture: 'voth', family: 'industrial',
    source: 'voth-warehouses',
    districts: ['harbour', 'market', 'common'], wealth: [0.2, 0.65],
    blurb: 'Two warehouses: a tall five-storey canal store with stacked loading doors, hoists and a water door onto a landing stage, and a long bonded grain store with a walled yard, scale house, loading dock and a louvred roof loft.',
    w: 29.8, d: 22.4, h: 20.6, variants: 2,
    /* measured including the basin, stairs, steps and hoist gear */
    variantDims: [
      { w: 16.4, d: 18.9, h: 20.6 },
      { w: 29.8, d: 22.4, h: 13.4 }
    ],
    build: function (F) {
      const stoneT = [0x7f7a6d, 0x87816f, 0x8c8579, 0x7b7669, 0x827c6e];
      const basalt = F.pick([0x2b2a28, 0x322f2b]);
      const sailT = [0xcfc2a3, 0xc0b190, 0xb8a880, 0xa89878];
      const water = 0x33494a;
      /* sacks: squashed blobs, stacked in a loose pyramid */
      function sacks(K, x, y, z, n, alongX) {
        let k = 0;
        for (let row = 0; k < n; row++) {
          const m = Math.max(1, 3 - row);
          for (let i = 0; i < m && k < n; i++, k++) {
            const o = (i - (m - 1) / 2) * 0.62;
            F.blob(x + (alongX ? o : 0), y + 0.17 + row * 0.3, z + (alongX ? 0 : o), 0.34, 0.36, 0,
              F.pick([0xcbb08e, 0xbba27e, 0xc4ae88]), 'cloth');
          }
        }
      }
      /* a louvred vent: dark backing, frame, sloping slats */
      function louvre(K, L, s, u, y, a, h, tc) {
        K.fbox(L, s, u, y, a, h, 0.1, 0.02, 0x1c1a16, 'wood');
        K.fbox(L, s, u - a / 2 - 0.1, y, 0.2, h, 0.22, 0.09, tc, 'stone');
        K.fbox(L, s, u + a / 2 + 0.1, y, 0.2, h, 0.22, 0.09, tc, 'stone');
        K.fbox(L, s, u, y + h, a + 0.5, 0.24, 0.28, 0.1, tc, 'stone');
        K.fbox(L, s, u, y - 0.18, a + 0.4, 0.18, 0.36, 0.16, tc, 'stone');
        const n = Math.max(2, Math.round(h / 0.32));
        for (let i = 0; i < n; i++) {
          const yy = y + (i + 0.5) * h / n;
          const p0 = K.at(L, s, u, 0.03), p1 = K.at(L, s, u, 0.22);
          F.beam(p0[0], yy + 0.1, p0[1], p1[0], yy - 0.06, p1[1], p0[2] ? a : 0.04, p0[2] ? 0.04 : a, 0x5a4630, 'wood');
        }
      }

      if (F.variant === 0) {
        /* ================= canal warehouse: five storeys over the water ================= */
        const c = F.pick(stoneT), trim = shade(c, -0.2), cornice = shade(c, -0.15);
        const K = kit(F, trim), T = K.timber;
        const L = { x: 0, z: -1, w: 11, d: 12 };
        const FL = [0, 4.0, 7.2, 10.4, 13.6], TOP = 16.8;

        /* canal basin in front, kerbed; quay kerbs either side of the house */
        F.box(0, 0, 8.25, 16, 0.2, 6.5, 0, water, 'stone');
        [-1, 1].forEach(function (k) {
          F.box(k * 7.8, 0, 8.25, 0.4, 0.55, 6.5, 0, shade(c, -0.18), 'stone');
          F.box(k * 6.75, 0, 5.2, 2.5, 0.55, 0.4, 0, shade(c, -0.18), 'stone');
        });
        F.box(0, 0, 11.3, 16, 0.55, 0.4, 0, shade(c, -0.18), 'stone');

        /* the tower-like body: basalt water plinth, floor bands, quoins, cornice */
        F.box(L.x, 0, L.z, L.w + 0.3, 1.0, L.d + 0.3, 0, basalt, 'stone');
        F.box(L.x, 0, L.z, L.w, TOP, L.d, 0, c, 'stone');
        FL.slice(1).forEach(function (y) { F.box(L.x, y - 0.12, L.z, L.w + 0.25, 0.24, L.d + 0.25, 0, cornice, 'stone'); });
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
          F.box(L.x + p[0] * (L.w / 2 - 0.3), 1.0, L.z + p[1] * (L.d / 2 - 0.3), 0.8, TOP - 1.0, 0.8, 0, shade(c, -0.07), 'stone');
        });
        F.box(L.x, TOP - 0.2, L.z, L.w + 0.5, 0.4, L.d + 0.5, 0, cornice, 'stone');
        K.parapet({ x: L.x, z: L.z, w: L.w + 0.2, d: L.d + 0.2 }, TOP + 0.2, 0.8, 0.3, c);
        /* storage, not housing: narrow barred slit vents instead of windows */
        function slit(s, u, y) {
          K.win(L, s, u, y, 0.32, 1.2, { bars: true });
          K.fbox(L, s, u, y, 0.05, 1.2, 0.05, 0.12, K.iron, 'metal');
        }
        /* heavy pilasters on the long flanks, iron tie-plates at every floor */
        [2, 3].forEach(function (s) {
          [-2.2, 1.8].forEach(function (u) {
            K.fbox(L, s, u, 1.0, 0.9, TOP - 1.2, 0.4, 0.2, shade(c, -0.07), 'stone');
            K.fbox(L, s, u, TOP - 0.6, 1.2, 0.45, 0.55, 0.27, cornice, 'stone');
          });
          FL.slice(1).forEach(function (f) {
            [-5.2 + 0.3, -1.0 + 0.2, 5.2 - 0.3].forEach(function (u) {
              if (Math.abs(u) > 4.6) return;
              K.fbox(L, s, u, f + 0.14, 0.5, 0.5, 0.06, 0.03, 0x3a3530, 'metal');
              const p = K.at(L, s, u, 0.1);
              F.ball(p[0], f + 0.39, p[1], 0.1, 0x3a3530, 'metal');
            });
          });
        });
        [-1, 1].forEach(function (k) {
          FL.slice(1).forEach(function (f) {
            K.fbox(L, 0, k * 4.6, f + 0.14, 0.45, 0.45, 0.06, 0.03, 0x3a3530, 'metal');
            K.fbox(L, 1, k * 1.8, f + 0.14, 0.45, 0.45, 0.06, 0.03, 0x3a3530, 'metal');
          });
        });
        F.box(L.x, 0.95, L.z + L.d / 2 + 0.16, L.w + 0.3, 0.12, 0.05, 0, 0x3f4640, 'stone');   /* tide line */

        /* ---- front (canal): water door, landing stage, stacked loading doors ---- */
        K.door(L, 0, 0, 0.65, 3.0, 3.0, { leaf: 0x3a2618 });
        K.fbox(L, 0, 0, 0.0, 3.8, 0.65, 0.3, 0.15, basalt, 'stone');
        F.box(0, 0.45, 6.25, 7.0, 0.2, 2.5, 0, 0x5d4a34, 'wood');
        F.box(0, 0.3, 7.5, 7.1, 0.25, 0.14, 0, T, 'wood');
        [-3.2, -1.1, 1.1, 3.2].forEach(function (x) {
          [5.4, 7.3].forEach(function (z) { F.cyl(x, 0, z, 0.15, 0.45, 0, 0x3f3326, 'wood'); });
        });
        [[-3.4, 7.4], [3.4, 7.4]].forEach(function (p) {
          F.cyl(p[0], 0, p[1], 0.18, 1.6, 0, 0x3f3326, 'wood');
          F.cyl(p[0], 1.6, p[1], 0.24, 0.1, 0, K.iron, 'metal');
        });
        FL.slice(1).forEach(function (f, i) {
          K.door(L, 0, 0, f + 0.1, 1.8, 2.5, { leaf: i % 2 ? 0x5a4028 : 0x46302a, base: f + 0.1 });
          K.fbox(L, 0, 0, f - 0.05, 2.4, 0.15, 0.7, 0.35, 0x5d4a34, 'wood');           /* sill ledge */
          const p = K.at(L, 0, 0, 0.5);
          F.rod(p[0] - 1.0, f + 1.1, p[1] - 0.2, p[0] + 1.0, f + 1.1, p[1] - 0.2, 0.05, K.iron, 'metal');
          /* a small davit + pulley over each door */
          const a = K.at(L, 0, 1.4, 0), b = K.at(L, 0, 1.4, 1.1);
          F.beam(a[0], f + 3.0, a[1], b[0], f + 3.0, b[1], 0.2, 0.2, T, 'wood');
          F.beam(a[0], f + 2.4, a[1], b[0] * 0.5 + a[0] * 0.5, f + 3.0, b[1] * 0.5 + a[1] * 0.5, 0.1, 0.1, T, 'wood');
          K.wheel(b[0], f + 2.8, b[1] - 0.1, 0.16, true);
          F.rod(b[0] + 0.1, f + 2.8, b[1] - 0.1, b[0] + 0.1, f + 1.2, b[1] - 0.1, 0.02, 0x8a7a5a, 'wood');
          F.box(b[0] + 0.1, f + 1.05, b[1] - 0.1, 0.14, 0.18, 0.06, 0, K.iron, 'metal');
          [-3.4, 3.4].forEach(function (u) { slit(0, u, f + 0.9); });
        });
        [-3.4, 3.4].forEach(function (u) { K.win(L, 0, u, 1.6, 0.9, 1.3, { bars: true }); });
        /* the main hoist hood on the roof edge */
        F.box(0, TOP + 0.2, 4.2, 2.6, 2.6, 1.8, 0, shade(c, 0.03), 'stone');
        F.pyrRoof(0, TOP + 2.8, 4.25, 3.2, 1.0, 2.5, 0, F.pick([0xb35a3a, 0xa04f32]), 'roof');
        K.fbox(L, 0, 0, TOP + 0.3, 1.5, 1.8, 0.1, 0.12, 0x46302a, 'wood');
        F.beam(0, 18.6, 3.4, 0, 18.6, 6.6, 0.32, 0.36, T, 'wood');
        F.beam(0, 17.4, 5.2, 0, 18.6, 6.0, 0.14, 0.14, T, 'wood');
        K.wheel(0, 18.25, 6.35, 0.3, true);
        F.rod(0.15, 18.25, 6.4, 0.15, 10.3, 6.4, 0.025, 0x8a7a5a, 'wood');
        F.rod(-0.15, 18.25, 6.3, -0.15, 1.6, 5.9, 0.025, 0x8a7a5a, 'wood');
        F.rod(0.15, 10.3, 6.4, -0.3, 9.95, 6.4, 0.02, 0x8a7a5a, 'wood');
        F.rod(0.15, 10.3, 6.4, 0.6, 9.95, 6.4, 0.02, 0x8a7a5a, 'wood');
        K.crate(0.15, 9.2, 6.4, 0.9, 0.3);

        /* ---- landing stage clutter: crates, nets on a rack, baskets ---- */
        K.crate(-2.6, 0.65, 6.0, 0.9, 0.2);
        K.crate(-2.5, 1.42, 6.0, 0.7, -0.3);
        K.crate(-1.6, 0.65, 6.6, 0.8, 0.5);
        [2.0, 3.3].forEach(function (x) { F.rod(x, 0.65, 7.0, x, 2.6, 7.0, 0.05, T, 'wood'); });
        F.rod(1.8, 2.5, 7.0, 3.5, 2.5, 7.0, 0.04, T, 'wood');
        F.box(2.65, 1.0, 7.0, 1.2, 1.45, 0.04, 0, 0x4f5046, 'cloth');
        F.box(2.65, 0.7, 7.0, 1.1, 0.06, 0.08, 0, 0xc4a04a, 'wood');                    /* floats */
        [[1.5, 5.8], [2.1, 5.7], [1.8, 6.3]].forEach(function (p) {
          F.cyl(p[0], 0.65, p[1], 0.26, 0.4, 0, 0x8b7a52, 'wood');
        });
        /* a moored barge with cargo */
        F.box(-4.2, 0.12, 9.6, 5.6, 0.55, 1.9, 0, 0x5a4630, 'wood');
        F.box(-4.2, 0.67, 9.6, 5.7, 0.1, 2.0, 0, 0x3f3326, 'wood');
        [-6.2, -2.2].forEach(function (x) { F.box(x, 0.4, 9.6, 0.3, 0.1, 1.8, 0, 0x6b5436, 'wood'); });
        K.crate(-5.2, 0.45, 9.5, 0.9, 0.1);
        sacks(K, -3.6, 0.45, 9.6, 5, true);
        F.rod(-6.9, 0.7, 9.4, -3.4, 1.55, 7.4, 0.025, 0x8a7a5a, 'wood');
        F.rod(-1.6, 0.4, 9.2, 1.2, 2.8, 10.4, 0.04, 0x6b5436, 'wood');

        /* ---- east flank (street): door, windows, lean-to shed ---- */
        K.door(L, 2, 2.6, 0, 1.4, 2.6, {});
        FL.forEach(function (f, i) {
          if (i === 0) { [-4.0, -0.2].forEach(function (u) { K.win(L, 2, u, 1.4, 0.9, 1.1, { bars: true }); }); return; }
          K.win(L, 2, 3.6, f + 1.0, 0.8, 1.0, { shut: 0x5a4028 });          /* the office corner */
          if (i % 2) slit(2, -4.0, f + 0.9); else louvre(K, L, 2, -4.0, f + 1.0, 1.0, 1.0, trim);
          slit(2, -0.2, f + 0.9);
        });
        F.box(6.75, 0, -4.0, 2.5, 2.8, 3.8, 0, shade(c, 0.03), 'stone');
        F.beam(5.6, 3.35, -4.0, 8.0, 2.85, -4.0, 0.1, 4.2, F.pick([0xb35a3a, 0xa04f32]), 'roof');
        const S = { x: 6.75, z: -4.0, w: 2.5, d: 3.8 };
        K.door(S, 0, 0, 0, 1.0, 2.1, {});
        K.win(S, 2, 0, 1.2, 0.8, 0.9, { bars: true });
        K.crate(6.9, 0, -0.8, 1.0, 0.15);
        K.crate(6.7, 0.85, -0.8, 0.8, -0.2);
        K.barrel(7.1, 0, 1.2, 0.4, 1.0);
        K.lantern(5.5, 3.3, 2.6 - 1.0, 0.45, 0);

        /* ---- west flank: windows, drainpipe, a davit on the top floor ---- */
        FL.forEach(function (f, i) {
          if (i === 0) { [-3.8, 0, 3.8].forEach(function (u) { K.win(L, 3, u, 1.4, 0.9, 1.1, { bars: true }); }); return; }
          [-3.8, 3.8].forEach(function (u) { slit(3, u, f + 0.9); });
          if (i % 2 === 0) louvre(K, L, 3, -0.2, f + 1.0, 1.2, 1.0, trim);
        });
        F.rod(-5.7, 1.0, 4.6, -5.7, TOP, 4.6, 0.1, shade(c, -0.3), 'metal');
        F.box(-5.7, TOP - 0.3, 4.6, 0.45, 0.4, 0.45, 0, shade(c, -0.3), 'metal');
        sacks(K, -6.4, 0, -3.0, 6, false);

        /* ---- back (street): cart door, windows, a stepped ramp ---- */
        K.door(L, 1, 0, 0.3, 2.6, 3.2, { base: 0 });
        FL.forEach(function (f, i) {
          if (i === 0) [-3.4, 3.4].forEach(function (u) { K.win(L, 1, u, 1.4, 0.9, 1.1, { bars: true }); });
          else [-3.4, 3.4].forEach(function (u) { slit(1, u, f + 0.9); });
          if (i === 4) louvre(K, L, 1, 0, f + 1.0, 1.4, 1.0, trim);
        });
        F.rod(5.7, 1.0, -7.2, 5.7, TOP, -7.2, 0.1, shade(c, -0.3), 'metal');

        /* ---- roof: storage under a shade canopy, cistern ---- */
        K.sailZ(-4.6, 4.6, -1.4, -6.4, TOP + 2.7, TOP + 2.2, TOP + 0.2, F.pick(sailT));
        sacks(K, -2.6, TOP + 0.2, -4.0, 6, true);
        K.crate(1.6, TOP + 0.2, -3.2, 1.0, 0.1);
        K.crate(2.8, TOP + 0.2, -4.6, 0.9, -0.2);
        K.crate(1.9, TOP + 1.05, -3.3, 0.8, 0.3);
        F.cyl(3.6, TOP + 0.2, 1.4, 0.8, 1.3, 0, shade(c, -0.15), 'stone');
        F.cyl(3.6, TOP + 1.5, 1.4, 0.85, 0.1, 0, T, 'wood');
        F.box(-3.4, TOP + 0.2, 1.8, 1.4, 1.2, 1.4, 0, shade(c, -0.05), 'stone');   /* stair hatch */
        F.box(-3.4, TOP + 1.4, 1.8, 1.7, 0.12, 1.7, 0, cornice, 'stone');
        K.fbox({ x: -3.4, z: 1.8, w: 1.4, d: 1.4 }, 2, 0, TOP + 0.2, 0.8, 1.0, 0.08, 0.04, 0x46302a, 'wood');
      } else {
        /* ================= bonded grain store with walled yard ================= */
        const c = F.pick(stoneT), trim = shade(c, -0.2), cornice = shade(c, -0.15);
        const K = kit(F, trim), T = K.timber;
        const terra = F.pick([0xb35a3a, 0xa04f32, 0xc36a42]);
        const L = { x: 0, z: -4, w: 26, d: 10 };
        const P = 1.2, TOP = 9.0;

        /* body */
        F.box(L.x, 0, L.z, L.w + 0.3, P, L.d + 0.3, 0, shade(c, -0.24), 'stone');
        F.box(L.x, 0, L.z, L.w, TOP, L.d, 0, c, 'stone');
        F.box(L.x, 5.1, L.z, L.w + 0.25, 0.24, L.d + 0.25, 0, cornice, 'stone');
        F.box(L.x, TOP - 0.2, L.z, L.w + 0.5, 0.4, L.d + 0.5, 0, cornice, 'stone');
        K.parapet({ x: L.x, z: L.z, w: L.w + 0.2, d: L.d + 0.2 }, TOP + 0.2, 0.7, 0.3, c);
        /* buttresses on the back and the ends */
        [-10.4, -5.2, 0, 5.2, 10.4].forEach(function (x) {
          F.box(x, 0, -9.35, 0.9, 7.6, 0.7, 0, shade(c, -0.08), 'stone');
          F.beam(x, 7.6, -9.35, x, 8.6, -9.0, 0.9, 0.5, shade(c, -0.12), 'stone');
        });
        [-6.5, -1.5].forEach(function (z) {
          [-1, 1].forEach(function (k) { F.box(k * 13.35, 0, z, 0.7, 7.6, 0.9, 0, shade(c, -0.08), 'stone'); });
        });
        /* louvres: upper storey all round, lower on the back and ends */
        [-10.4 + 2.6, -2.6, 2.6, 7.8].forEach(function (u) {
          louvre(K, L, 1, u, 6.0, 1.8, 2.0, trim);
          louvre(K, L, 1, u, 2.0, 1.4, 1.6, trim);
        });
        [-10.4, -5.2, 0, 5.2, 10.4].forEach(function (u) { louvre(K, L, 0, u, 6.0, 1.6, 2.0, trim); });
        [-1, 1].forEach(function (k) {
          const s = k > 0 ? 2 : 3;
          louvre(K, L, s, -4.0, 6.0, 1.4, 2.0, trim);
          louvre(K, L, s, 1.2, 6.0, 1.4, 2.0, trim);
          louvre(K, L, s, 1.2, 2.0, 1.2, 1.6, trim);
        });
        K.door(L, 3, -4.0, P, 1.4, 2.6, { base: 0 });
        K.door(L, 1, 0, P, 1.6, 2.6, { base: 0 });

        /* ---- loading dock along the front, pentice on posts, doors ---- */
        F.box(0, 0, 2.0, 24, P, 2.0, 0, shade(c, -0.12), 'stone');
        F.box(0, P - 0.1, 2.05, 24.2, 0.14, 2.1, 0, cornice, 'stone');
        F.box(0, 0.3, 3.03, 24, 0.14, 0.08, 0, T, 'wood');                     /* fender */
        [-8, 0, 8].forEach(function (u) {
          K.door(L, 0, u, P, 3.0, 3.4, { leaf: 0x5a4028, base: P });
          K.fbox(L, 0, u, P + 1.7, 3.0, 0.08, 0.05, 0.1, 0x3a3128, 'metal');
        });
        [-4, 4, 11].forEach(function (u) { K.win(L, 0, u, P + 1.2, 1.1, 1.4, { bars: true }); });
        K.awning(L, 0, 0, 5.0, 24, 2.1, 0.7, terra, 'roof', [-11.8, -4, 4, 11.8], P);
        /* steps at the west end, a ramp at the east end */
        for (let i = 0; i < 4; i++) F.box(-8.8, 0, 3.2 + i * 0.35, 2.4, P * (4 - i) / 4.4, 0.35, 0, shade(c, -0.14), 'stone');
        F.beam(10.6, P - 0.15, 3.0, 10.6, 0.0, 7.2, 2.4, 0.3, shade(c, -0.1), 'stone');
        [-1, 1].forEach(function (k) {
          F.beam(10.6 + k * 1.25, P + 0.05, 3.0, 10.6 + k * 1.25, 0.15, 7.2, 0.2, 0.3, shade(c, -0.22), 'stone');
        });
        /* sacks, a cart and a hand-barrow on the dock and in the yard */
        sacks(K, -5.0, P, 2.0, 6, true);
        sacks(K, 4.6, P, 1.8, 5, true);
        K.crate(-11.0, P, 2.0, 1.0, 0.1);
        F.box(3.4, 0.7, 7.6, 1.6, 0.5, 2.6, 0, 0x6b5436, 'wood');
        K.wheel(2.5, 0.7, 7.8, 0.7, true);
        K.wheel(4.3, 0.7, 7.8, 0.7, true);
        F.rod(3.4, 0.95, 6.3, 3.4, 0.1, 4.6, 0.06, T, 'wood');
        sacks(K, 3.4, 1.2, 7.8, 4, false);
        /* jib hoist off the upper storey */
        K.fbox(L, 0, 13 - 2.4, 5.4, 1.4, 2.2, 0.1, 0.03, 0x46302a, 'wood');
        const j0 = K.at(L, 0, 10.6, 0), j1 = K.at(L, 0, 10.6, 1.8);
        F.beam(j0[0], 8.2, j0[1], j1[0], 8.2, j1[1], 0.24, 0.24, T, 'wood');
        K.wheel(j1[0], 8.0, j1[1] - 0.1, 0.2, true);
        F.rod(j1[0] + 0.1, 8.0, j1[1] - 0.1, j1[0] + 0.1, 5.6, j1[1] - 0.1, 0.02, 0x8a7a5a, 'wood');

        /* ---- the walled yard, gate with a plaque ---- */
        F.box(0, 0, 6.0, 26, 0.05, 10, 0, 0x7e7460, 'stone');
        const wc = shade(c, -0.04);
        F.box(-5.5, 0, 10.75, 15, 2.8, 0.5, 0, wc, 'stone');
        F.box(10.5, 0, 10.75, 5, 2.8, 0.5, 0, wc, 'stone');
        [-1, 1].forEach(function (k) {
          F.box(k * 12.75, 0, 6.0, 0.5, 2.8, 10, 0, wc, 'stone');
          F.box(k * 12.75, 2.8, 6.0, 0.7, 0.18, 10.2, 0, cornice, 'stone');
        });
        F.box(-5.5, 2.8, 10.75, 15.2, 0.18, 0.7, 0, cornice, 'stone');
        F.box(10.5, 2.8, 10.75, 5.2, 0.18, 0.7, 0, cornice, 'stone');
        [2.0, 8.0].forEach(function (x) {
          F.box(x, 0, 10.75, 1.0, 3.8, 1.0, 0, shade(c, -0.1), 'stone');
          F.box(x, 3.8, 10.75, 1.2, 0.3, 1.2, 0, cornice, 'stone');
          F.pyrRoof(x, 4.1, 10.75, 1.2, 0.5, 1.2, 0, terra, 'roof');
        });
        F.box(5.0, 3.3, 10.75, 5.0, 0.35, 0.35, 0, T, 'wood');
        F.box(5.0, 2.3, 10.95, 1.8, 0.8, 0.1, 0, 0x5c4028, 'wood');
        F.box(5.0, 2.45, 11.01, 1.2, 0.5, 0.04, 0, 0xc4a04a, 'metal');
        F.box(2.85, 0.1, 9.6, 0.12, 2.5, 2.2, 0, 0x5a4028, 'wood');
        F.box(7.15, 0.1, 9.6, 0.12, 2.5, 2.2, 0, 0x5a4028, 'wood');
        /* buttressing pilasters on the outside of the yard wall */
        [-11, -7, -3].forEach(function (x) { F.box(x, 0, 11.1, 0.6, 2.6, 0.2, 0, shade(wc, -0.1), 'stone'); });
        [3.5, 8.5].forEach(function (z) {
          [-1, 1].forEach(function (k) { F.box(k * 13.1, 0, z, 0.2, 2.6, 0.6, 0, shade(wc, -0.1), 'stone'); });
        });

        /* ---- scale house / office in the yard corner, beam scale outside ---- */
        const O = { x: -9.6, z: 7.8, w: 5, d: 4.4 };
        F.box(O.x, 0, O.z, O.w, 3.6, O.d, 0, shade(c, 0.05), 'stone');
        F.box(O.x, 0, O.z, O.w + 0.2, 0.35, O.d + 0.2, 0, shade(c, -0.24), 'stone');
        F.box(O.x, 3.5, O.z, O.w + 0.3, 0.25, O.d + 0.3, 0, cornice, 'stone');
        K.parapet({ x: O.x, z: O.z, w: O.w + 0.1, d: O.d + 0.1 }, 3.75, 0.6, 0.2, shade(c, 0.05));
        K.door(O, 2, 0.6, 0, 1.1, 2.3, { leaf: 0x46302a });
        K.win(O, 2, -1.3, 1.1, 0.9, 1.2, { shut: 0x46603f });
        K.win(O, 1, 0, 1.1, 1.2, 1.2, { shut: 0x46603f });
        K.win(O, 0, -1, 1.1, 0.9, 1.1, { bars: true });
        K.awning(O, 2, 0, 3.2, 3.6, 1.2, 0.4, F.pick(sailT), 'cloth', null, 0);
        F.cyl(-11.2, 3.75, 8.6, 0.16, 1.4, 0, 0x3a3128, 'metal');
        F.box(-8.2, 3.75, 7.0, 1.4, 0.4, 1.0, 0, 0x7a6040, 'wood');               /* roof chest */
        /* weighing platform + beam scale */
        F.box(-5.4, 0, 7.8, 2.4, 0.12, 2.4, 0, 0x5a5a5e, 'metal');
        F.box(-5.4, 0.12, 7.8, 2.2, 0.03, 2.2, 0, 0x4a4a4e, 'metal');
        F.rod(-5.4, 0.12, 6.3, -5.4, 3.4, 6.3, 0.1, T, 'wood');
        F.rod(-6.6, 3.2, 6.3, -4.2, 3.2, 6.3, 0.05, K.iron, 'metal');
        F.rod(-6.4, 3.2, 6.3, -6.4, 1.6, 6.3, 0.015, K.iron, 'metal');
        F.cyl(-6.4, 1.5, 6.3, 0.35, 0.08, 0, 0xc4a04a, 'metal');
        F.rod(-4.4, 3.2, 6.3, -4.4, 1.9, 6.3, 0.015, K.iron, 'metal');
        F.cyl(-4.4, 1.8, 6.3, 0.35, 0.08, 0, 0xc4a04a, 'metal');
        F.cyl(-4.4, 1.88, 6.3, 0.18, 0.2, 0, 0x5a5a5e, 'metal');
        sacks(K, -5.4, 0.15, 7.9, 3, true);
        K.postLamp(-7.6, 5.4, 0, 2.6);

        /* ---- open roof loft under a canopy, stair up the east end ---- */
        const lz = -4.25;
        [-9, -6, -3, 0, 3, 6, 9].forEach(function (x) {
          [-7.4, -1.1].forEach(function (z) { F.box(x, TOP + 0.2, z, 0.25, 2.4, 0.25, 0, T, 'wood'); });
        });
        F.box(0, TOP + 0.2, -7.4, 18.2, 0.9, 0.12, 0, 0x5a4630, 'wood');
        [-7.4, -1.1].forEach(function (z) { F.box(0, TOP + 2.5, z, 18.4, 0.2, 0.25, 0, T, 'wood'); });
        [-9, 9].forEach(function (x) { F.box(x, TOP + 0.2, lz, 0.12, 0.9, 6.3, 0, 0x5a4630, 'wood'); });
        F.box(0, TOP + 2.7, lz, 19.6, 0.12, 7.9, 0, shade(terra, -0.2), 'roof');
        F.pyrRoof(0, TOP + 2.82, lz, 19.6, 1.2, 7.9, 0, terra, 'roof');
        F.box(0, TOP + 3.2, lz, 3.0, 0.6, 1.4, 0, shade(c, -0.1), 'stone');       /* ridge vent */
        F.pyrRoof(0, TOP + 3.8, lz, 3.6, 0.5, 2.0, 0, terra, 'roof');
        sacks(K, -6.5, TOP + 0.2, -5.4, 6, true);
        sacks(K, -1.8, TOP + 0.2, -3.2, 5, true);
        sacks(K, 4.0, TOP + 0.2, -5.0, 6, true);
        F.box(6.8, TOP + 0.2, -2.8, 1.1, 0.7, 1.6, 0, 0xb8a068, 'wood');
        F.box(6.8, TOP + 0.9, -2.8, 1.0, 0.6, 1.5, 0.1, 0xab9660, 'wood');
        F.box(0, TOP + 0.2, lz, 0.9, 0.9, 0.9, 0, 0x46302a, 'wood');               /* hatch head */
        K.flight(14.25, 0.3, 14.25, -8.6, 0, TOP + 0.2, 1.0, 0x5a4630, false);
        F.box(14.0, TOP + 0.1, -8.95, 1.6, 0.14, 0.9, 0, 0x5a4630, 'wood');
        [-8.6, -4.0].forEach(function (z) { F.rod(14.7, 0, z, 14.7, TOP + 0.1, z, 0.08, T, 'wood'); });
        F.rod(14.8, 1.0, 0.3, 14.8, TOP + 1.1, -8.6, 0.04, T, 'wood');
      }
    }
  });
})();
