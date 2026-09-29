/* ======================================================================
   voth-civic — Voth building catalog, civic / industrial / rural entries
   source: 'voth-civic'   |  culture: 'voth'
     voth_school            2 variants  temple college | neighbourhood schoolhouse
     voth_generator         2 variants  steam turbine hall | fumarole vent house
     voth_farmhouse         3 variants  velothi farmstead | chinampa | hlaalu farm
     voth_governor_palace   1 variant   domed audience hall, wings, garden court

   Everything lives in one IIFE so the helper kit below never leaks into the
   shared global scope the registries are concatenated into. Colours are
   copied from voth/src/05-palette.js (the registries cannot see PAL).
   Frame: origin = footprint centre on the ground, +z FRONT.
   Faces: s 0 = +z (front), 1 = -z (back), 2 = +x, 3 = -x.
   ====================================================================== */
(function () {
  /* ---------------------------------------------------------- palette */
  const ST = [0x8c8579, 0x958e80, 0x87816f, 0x827c6e, 0x9a9384, 0x8f8873, 0x97907f];
  const POOR = [0x8b8069, 0x7e7460, 0x968b73, 0x877d66];
  const MARBLE = [0xe8e1d2, 0xdfd7c5, 0xf1ebdd];
  const JADE = [0x3f6b56, 0x35594a, 0x4a7d64];
  const LAPIS = [0x1f3f6e, 0x2a4d80, 0x17335c];
  const PORPH = [0x5e1e2d, 0x6a2434, 0x521826];
  const ROOF = [0xb35a3a, 0xa04f32, 0xc36a42, 0x6b7a4a, 0x7a5a72, 0xc4813f];
  const DOME = [0xb08d3c, 0xa0843f, 0x8f7a44, 0xb0a682, 0x9d9379, 0xa8a08a, 0x93886d];
  const BANNER = [0x7a2028, 0x8a2f2a, 0x5c4028, 0xe8d9a0, 0xc9b8d6, 0xb8d0b0, 0xb0c8d8, 0xcbb08e];
  const SAIL = [0xcfc2a3, 0xc0b190, 0xb8a880, 0xa89878];
  const MUD = [0x6b5c46, 0x5f523e, 0x76664d, 0x564b3a, 0x6f6149];
  const CROP = [0x5c6b3a, 0x4e5c32, 0x68753f, 0x556140, 0x707a46, 0x8a8a4a, 0x7b7d3e];
  const REED = [0x7d7a4e, 0x8b8556, 0x6f6c45];
  const LEAF = [0x4e5a34, 0x43502e, 0x5b6740, 0x616a41];
  const DARK = 0x1c1a16, TIMBER = 0x4a3a28, LEAFC = 0x3d2c1f, IRON = 0x3a3630, BRACKET = 0x3a2f22;
  const GLOW = 0xffcf87, GILT = 0xd0a53c, BRASS = 0xb08d3c, BRONZE = 0x8f7a44, WATER = 0x44554f;
  const HAY = 0xb8a060, STEAM = 0xd9d5cc, SLATE = 0x2e3430;

  /* ------------------------------------------------------------- kit
     Helper closures over one build frame F. */
  function kit(F) {
    const K = {};
    function nrm(s) { return s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0]; }
    K.nrm = nrm;
    /* point on a face plane (cx, cz) moved u along the face */
    K.along = function (cx, cz, s, u) { return nrm(s)[1] !== 0 ? [cx + u, cz] : [cx, cz + u]; };
    /* a box laid on a face: centre `off` out from the plane, a wide along it, t thick */
    function fb(cx, y, cz, s, off, a, h, t, col, fam) {
      const n = nrm(s), fl = n[1] !== 0;
      F.box(cx + n[0] * off, y, cz + n[1] * off, fl ? a : t, h, fl ? t : a, 0, col, fam || 'stone');
    }
    K.fb = fb;
    /* a disc on a face: a short rod along the face normal, centred y */
    function fd(cx, y, cz, s, off, r, t, col, fam) {
      const n = nrm(s);
      F.rod(cx + n[0] * (off - t / 2), y, cz + n[1] * (off - t / 2),
        cx + n[0] * (off + t / 2), y, cz + n[1] * (off + t / 2), r, col, fam || 'stone');
    }
    K.fd = fd;

    /* window: frame, dark pane, lintel or round arch, sill; options shut/bars/mull */
    K.win = function (cx, y, cz, s, ww, wh, wallC, o) {
      o = o || {};
      const tr = shade(wallC, -0.22), fr = shade(wallC, -0.13), pane = o.pane || DARK, pf = o.fam || 'wood';
      if (o.frame !== false) fb(cx, y - 0.12, cz, s, 0.05, ww + 0.36, wh + 0.12 + (o.arch ? 0 : 0.12), 0.2, fr, 'stone');
      fb(cx, y, cz, s, 0.08, ww, wh, 0.28, pane, pf);
      if (o.arch) {
        if (o.frame !== false) fd(cx, y + wh, cz, s, 0.05, ww / 2 + 0.18, 0.2, fr, 'stone');
        fd(cx, y + wh, cz, s, 0.08, ww / 2, 0.28, pane, pf);
      } else if (o.lintel !== false) fb(cx, y + wh, cz, s, 0.14, ww + 0.6, 0.28, 0.32, tr, 'stone');
      if (o.sill !== false) fb(cx, y - 0.24, cz, s, 0.2, ww + 0.5, 0.24, 0.44, tr, 'stone');
      if (o.shut) {
        const sc = o.shutC || 0x5a4028;
        [-1, 1].forEach(function (k) {
          const p = K.along(cx, cz, s, k * (ww / 2 + 0.3));
          fb(p[0], y, p[1], s, 0.2, 0.5, wh, 0.1, sc, 'wood');
        });
      }
      if (o.bars) {
        const n = nrm(s);
        [-0.25, 0, 0.25].forEach(function (f) {
          const p = K.along(cx, cz, s, f * ww);
          F.rod(p[0] + n[0] * 0.26, y, p[1] + n[1] * 0.26, p[0] + n[0] * 0.26, y + wh + (o.arch ? ww * 0.35 : 0), p[1] + n[1] * 0.26, 0.04, IRON, 'metal');
        });
      }
      if (o.mull) {
        fb(cx, y, cz, s, 0.24, 0.1, wh, 0.06, o.mull, 'metal');
        fb(cx, y + wh * 0.5, cz, s, 0.24, ww, 0.1, 0.06, o.mull, 'metal');
        if (wh > 3) fb(cx, y + wh * 0.25, cz, s, 0.24, ww, 0.08, 0.06, o.mull, 'metal');
        if (wh > 3) fb(cx, y + wh * 0.75, cz, s, 0.24, ww, 0.08, 0.06, o.mull, 'metal');
      }
    };
    /* a row of windows centred on face point (cx, cz), at offsets us */
    K.row = function (cx, y, cz, s, us, ww, wh, wallC, o) {
      us.forEach(function (u) { const p = K.along(cx, cz, s, u); K.win(p[0], y, p[1], s, ww, wh, wallC, o); });
    };
    /* door: surround, leaf, lintel or arch, iron straps, threshold or steps down to 0 */
    K.door = function (cx, y, cz, s, ww, wh, wallC, o) {
      o = o || {};
      const sur = o.sur || shade(wallC, -0.18), leaf = o.leaf || LEAFC, lf = o.leafFam || 'wood';
      fb(cx, y, cz, s, 0.12, ww + 0.9, wh + (o.arch ? 0 : 0.45), 0.44, sur, 'stone');
      fb(cx, y, cz, s, 0.24, ww, wh, 0.3, leaf, lf);
      if (o.arch) {
        fd(cx, y + wh, cz, s, 0.12, ww / 2 + 0.45, 0.44, sur, 'stone');
        fd(cx, y + wh, cz, s, 0.24, ww / 2, 0.3, leaf, lf);
        fb(cx, y + wh + ww / 2 + 0.05, cz, s, 0.3, 0.5, 0.5, 0.36, shade(sur, -0.12), 'stone');
      } else {
        fb(cx, y + wh + 0.05, cz, s, 0.3, ww + 1.4, 0.4, 0.66, shade(wallC, -0.26), 'stone');
      }
      if (!o.open && leaf !== DARK) {
        [0.28, 0.7].forEach(function (f) { fb(cx, y + wh * f, cz, s, 0.4, ww * 0.94, 0.1, 0.04, BRACKET, 'metal'); });
        if (ww > 1.6) fb(cx, y, cz, s, 0.4, 0.06, wh, 0.04, DARK, 'wood');
      }
      const n = o.steps || 0;
      if (n > 0 && y > 0.05) {
        const rise = y / n;
        for (let k = 1; k <= n; k++) {
          const D = 0.45 + (n - k + 1) * 0.42;
          fb(cx, 0, cz, s, D / 2, ww + 1.3 + (n - k) * 0.3, k * rise, D, shade(wallC, -0.26 + k * 0.02), 'stone');
        }
      } else {
        fb(cx, y, cz, s, 0.45, ww + 0.8, 0.16, 0.7, shade(wallC, -0.28), 'stone');
      }
      if (o.lamp) {
        const p = K.along(cx, cz, s, (ww / 2 + 0.9) * (o.lamp < 0 ? -1 : 1));
        K.lamp(p[0], y + wh + 0.1, p[1], s);
      }
    };
    K.lamp = function (cx, y, cz, s) {
      const n = nrm(s);
      F.rod(cx, y, cz, cx + n[0] * 0.75, y, cz + n[1] * 0.75, 0.06, BRACKET, 'metal');
      F.rod(cx + n[0] * 0.72, y, cz + n[1] * 0.72, cx + n[0] * 0.72, y - 0.25, cz + n[1] * 0.72, 0.03, BRACKET, 'metal');
      F.ball(cx + n[0] * 0.72, y - 0.45, cz + n[1] * 0.72, 0.22, GLOW, 'glow');
    };
    /* four strips round a w x d rectangle, centred on its edges */
    K.band = function (x, z, w, d, y, h, t, col, fam) {
      F.box(x, y, z + d / 2, w + t, h, t, 0, col, fam || 'stone');
      F.box(x, y, z - d / 2, w + t, h, t, 0, col, fam || 'stone');
      F.box(x + w / 2, y, z, t, h, d - t, 0, col, fam || 'stone');
      F.box(x - w / 2, y, z, t, h, d - t, 0, col, fam || 'stone');
    };
    /* parapet standing flush with the outer face of a w x d roof, with coping */
    K.parapet = function (x, z, w, d, y, h, t, col) {
      K.band(x, z, w - t, d - t, y, h, t, col);
      K.band(x, z, w - t, d - t, y + h, 0.14, t + 0.16, shade(col, -0.16));
    };
    /* an axis-aligned wall run between two points */
    K.run = function (x0, z0, x1, z1, y, h, t, col, fam) {
      if (Math.abs(x1 - x0) >= Math.abs(z1 - z0)) F.box((x0 + x1) / 2, y, z0, Math.abs(x1 - x0), h, t, 0, col, fam || 'stone');
      else F.box(x0, y, (z0 + z1) / 2, t, h, Math.abs(z1 - z0), 0, col, fam || 'stone');
    };
    K.wall = function (x0, z0, x1, z1, h, t, col) {
      K.run(x0, z0, x1, z1, 0, h, t, col);
      const ex = Math.abs(x1 - x0) >= Math.abs(z1 - z0) ? 0.09 : 0, ez = ex ? 0 : 0.09;
      K.run(x0 - (x0 < x1 ? ex : -ex), z0 - (z0 < z1 ? ez : -ez), x1 + (x0 < x1 ? ex : -ex), z1 + (z0 < z1 ? ez : -ez), h, 0.14, t + 0.18, shade(col, -0.16));
    };
    /* stair from (x, z) climbing y0 -> y1 in dir '+x' '-x' '+z' '-z'; solid to ground unless flying */
    K.stair = function (x, z, y0, y1, dir, w, col, o) {
      o = o || {};
      const n = Math.max(1, Math.round((y1 - y0) / (o.rise || 0.3))), r = (y1 - y0) / n, run = o.run || 0.3;
      const ax = dir[1] === 'x', sg = dir[0] === '+' ? 1 : -1;
      for (let i = 0; i < n; i++) {
        const al = (i + 0.5) * run * sg, top = y0 + (i + 1) * r;
        const bot = o.flying ? top - r - 0.18 : (o.base != null ? o.base : 0);
        F.box(ax ? x + al : x, bot, ax ? z : z + al, ax ? run : w, top - bot, ax ? w : run, 0,
          i % 2 ? col : shade(col, 0.04), o.fam || 'stone');
      }
      return n * run;
    };
    /* cloth awning on poles over [x0,x1] x [z0,z1]; the z1 edge is lower (drop) */
    K.awning = function (x0, z0, x1, z1, y, h, cloth, o) {
      o = o || {};
      const drop = o.drop == null ? 0.35 : o.drop, xm = (x0 + x1) / 2, w = x1 - x0;
      const pc = o.pole || TIMBER;
      const posts = o.posts || [[x0, z0], [x1, z0], [x0, z1], [x1, z1]];
      posts.forEach(function (p) {
        const t = (p[1] - z0) / (z1 - z0);
        F.rod(p[0], y, p[1], p[0], y + h - drop * t, p[1], 0.08, pc, 'wood');
      });
      /* the frame rails go with the canopy: family 'cloth' so the far LOD, which
         drops cloth and the thin posts, does not leave them hanging */
      [x0, x1].forEach(function (xx) { F.beam(xx, y + h - 0.07, z0, xx, y + h - drop - 0.07, z1, 0.13, 0.13, pc, 'cloth'); });
      F.box(xm, y + h - 0.16, z0, w, 0.14, 0.14, 0, pc, 'cloth');
      F.box(xm, y + h - drop - 0.16, z1, w, 0.14, 0.14, 0, pc, 'cloth');
      F.beam(xm, y + h + 0.02, z0 - 0.12, xm, y + h - drop + 0.02, z1 + 0.25, w + 0.3, 0.05, cloth, 'cloth');
      F.box(xm, y + h - drop - 0.32, z1 + 0.25, w + 0.3, 0.34, 0.04, 0, shade(cloth, -0.12), 'cloth');
      if (o.stripe) {
        [-0.25, 0.25].forEach(function (f) {
          F.beam(xm + f * w, y + h + 0.05, z0 - 0.12, xm + f * w, y + h - drop + 0.05, z1 + 0.25, w * 0.1, 0.03, o.stripe, 'cloth');
        });
      }
    };
    K.crate = function (x, y, z, s, ry) {
      F.box(x, y, z, s, s, s, ry || 0, 0x6b5438, 'wood');
      F.box(x, y + s * 0.42, z, s + 0.04, 0.08, s + 0.04, ry || 0, 0x4a3a28, 'wood');
    };
    K.jar = function (x, y, z, r, col) {
      col = col || 0x8a5a3a;
      F.blob(x, y + r * 0.95, z, r, r * 1.9, 0, col, 'clay');
      F.cyl(x, y + r * 1.65, z, r * 0.42, r * 0.5, 0, shade(col, -0.1), 'clay');
    };
    K.barrel = function (x, y, z, r, h) {
      F.cyl(x, y, z, r, h, 0, 0x5a4a34, 'wood');
      F.cyl(x, y + h * 0.18, z, r * 1.04, 0.07, 0, IRON, 'metal');
      F.cyl(x, y + h * 0.78, z, r * 1.04, 0.07, 0, IRON, 'metal');
    };
    K.sack = function (x, y, z, col) { F.blob(x, y + 0.3, z, 0.32, 0.62, 0, col || 0xa8987a, 'cloth'); };
    K.bench = function (x, y, z, len, alongX, col) {
      col = col || 0x5a4630;
      F.box(x, y + 0.36, z, alongX ? len : 0.42, 0.1, alongX ? 0.42 : len, 0, col, 'wood');
      [-1, 1].forEach(function (k) {
        const o = k * (len / 2 - 0.25);
        F.box(alongX ? x + o : x, y, alongX ? z : z + o, alongX ? 0.14 : 0.36, 0.36, alongX ? 0.36 : 0.14, 0, shade(col, -0.1), 'wood');
      });
    };
    /* flagpole on a block, crossbar at the top with a banner hanging beside the pole */
    K.flag = function (x, y, z, h, col, dirX) {
      F.box(x, y, z, 0.8, 0.5, 0.8, 0, 0x6f6a5c, 'stone');
      F.rod(x, y + 0.5, z, x, y + h, z, 0.08, IRON, 'metal');
      F.ball(x, y + h + 0.12, z, 0.15, GILT, 'metal');
      const dx = dirX === false ? 0 : 1, dz = dirX === false ? 1 : 0;
      F.rod(x, y + h - 0.35, z, x + dx * 1.65, y + h - 0.35, z + dz * 1.65, 0.04, IRON, 'metal');
      const L = h * 0.45, bx = x + dx * 0.85, bz = z + dz * 0.85;
      F.box(bx, y + h - 0.35 - L, bz, dx ? 1.35 : 0.05, L, dx ? 0.05 : 1.35, 0, col, 'cloth');
      F.box(bx, y + h - 0.35 - L - 0.45, bz, dx ? 0.6 : 0.05, 0.45, dx ? 0.05 : 0.6, 0, col, 'cloth');
      F.box(bx, y + h - 0.35 - L * 0.3, bz, dx ? 1.36 : 0.06, 0.18, dx ? 0.06 : 1.36, 0, shade(col, -0.25), 'cloth');
    };
    /* robed Dunmer figure with a staff on a stepped plinth; face = +1 faces +x, -1 -x, 0 faces +z */
    K.statue = function (x, y, z, fig, stoneC, face) {
      const fam = fig === BRONZE || fig === GILT ? 'metal' : 'stone';
      F.box(x, y, z, 1.7, 0.35, 1.7, 0, shade(stoneC, -0.15), 'stone');
      F.box(x, y + 0.35, z, 1.2, 1.6, 1.2, 0, stoneC, 'stone');
      F.box(x, y + 1.95, z, 1.5, 0.3, 1.5, 0, shade(stoneC, -0.1), 'stone');
      const b = y + 2.25;
      const fx = face === 1 ? 1 : face === -1 ? -1 : 0, fz = face ? 0 : 1, sx = -fz, sz = fx;
      F.frustum(x, b, z, 0.46, 0.28, 1.45, Math.PI / 8, fig, fam, 8);
      F.blob(x, b + 1.47, z, 0.36, 0.36, 0, fig, fam);
      F.ball(x, b + 1.84, z, 0.17, fig, fam);
      F.cone(x, b + 1.9, z, 0.2, 0.34, 0, shade(fig, -0.08), fam);
      F.rod(x + sx * 0.3, b + 1.5, z + sz * 0.3, x + sx * 0.42 + fx * 0.25, b + 1.0, z + sz * 0.42 + fz * 0.25, 0.08, fig, fam);
      F.rod(x - sx * 0.3, b + 1.5, z - sz * 0.3, x - sx * 0.2 + fx * 0.35, b + 1.15, z - sz * 0.2 + fz * 0.35, 0.08, fig, fam);
      F.rod(x + sx * 0.45 + fx * 0.25, b, z + sz * 0.45 + fz * 0.25, x + sx * 0.45 + fx * 0.25, b + 2.3, z + sz * 0.45 + fz * 0.25, 0.05, fig, fam);
      F.ball(x + sx * 0.45 + fx * 0.25, b + 2.35, z + sz * 0.45 + fz * 0.25, 0.1, GILT, 'metal');
    };
    /* velothi pylon: battered square pier, cap slab and a little pyramid cap */
    K.pylon = function (x, z, h, r, col, capC) {
      F.frustum(x, 0, z, r, r * 0.72, h, 0, col, 'stone', 4);
      F.box(x, h, z, r * 1.44 + 0.4, 0.3, r * 1.44 + 0.4, 0, shade(col, -0.15), 'stone');
      F.pyrRoof(x, h + 0.3, z, r * 1.44 + 0.5, r * 0.9, r * 1.44 + 0.5, 0, capC || shade(col, -0.2), 'roof');
    };
    K.drain = function (x, z, y0, h, wallC) {
      F.rod(x, y0, z, x, y0 + h, z, 0.12, shade(wallC, -0.3), 'metal');
      F.box(x, y0 + h - 0.15, z, 0.45, 0.4, 0.45, 0, shade(wallC, -0.3), 'metal');
    };
    K.chimney = function (x, z, y, h, wallC) {
      F.box(x, y, z, 0.85, h, 0.85, 0, shade(wallC, -0.2), 'stone');
      F.box(x, y + h, z, 1.15, 0.4, 1.15, 0, shade(wallC, -0.32), 'stone');
      F.cyl(x, y + h + 0.4, z, 0.22, 0.45, 0, 0x3a3128, 'stone');
    };
    /* a guar: two-legged, long-tailed Morrowind beast of burden, facing angle a in plan */
    K.guar = function (x, z, a, col) {
      col = col || 0x7d6a4e;
      const dx = Math.cos(a), dz = Math.sin(a), px = -dz, pz = dx;
      function P(f, s, y) { return [x + dx * f + px * s, y, z + dz * f + pz * s]; }
      function rod(A, B, r, c) { F.rod(A[0], A[1], A[2], B[0], B[1], B[2], r, c || col, 'hide'); }
      let p = P(0.35, 0, 1.55); F.blob(p[0], p[1], p[2], 0.6, 1.1, 0, col, 'hide');
      p = P(-0.35, 0, 1.35); F.blob(p[0], p[1], p[2], 0.7, 1.25, 0, shade(col, -0.06), 'hide');
      [-1, 1].forEach(function (s) {
        const hip = P(-0.3, s * 0.42, 1.2), knee = P(0.08, s * 0.5, 0.62), foot = P(-0.12, s * 0.48, 0.1);
        rod(hip, knee, 0.2); rod(knee, foot, 0.14); F.ball(knee[0], knee[1], knee[2], 0.19, col, 'hide');
        F.box(foot[0] + dx * 0.12, 0, foot[2] + dz * 0.12, 0.4, 0.14, 0.4, 0, shade(col, -0.18), 'hide');
      });
      rod(P(-0.9, 0, 1.3), P(-1.8, 0, 0.72), 0.18); rod(P(-1.8, 0, 0.72), P(-2.5, 0, 0.3), 0.1);
      rod(P(0.7, 0, 1.8), P(1.15, 0, 2.3), 0.2);
      p = P(1.3, 0, 2.38); F.blob(p[0], p[1], p[2], 0.3, 0.42, 0, col, 'hide');
      p = P(1.55, 0, 2.32); F.blob(p[0], p[1], p[2], 0.2, 0.28, 0, shade(col, 0.07), 'hide');
      [-1, 1].forEach(function (s) { rod(P(0.72, s * 0.3, 1.6), P(0.95, s * 0.3, 1.1), 0.07); });
    };
    return K;
  }

  /* ================================================================ SCHOOL */

  /* v0 — Temple college: four two-storey ranges round a cloistered court,
     a domed lecture hall on the back range, a battered library tower at
     the back-left corner, a Velothi gate pylon on the front. */
  function schoolCollege(F, K) {
    const c = F.pick(ST), tr = shade(c, -0.14), base = shade(c, -0.26);
    const tile = F.pick(LAPIS), domeC = F.pick([0xb08d3c, 0x93886d, 0xa0843f, 0xb0a682]);
    const P = 0.5, RT = 8.0, G = 2.0, U = 5.6;

    F.box(0, 0, 0, 38.8, P, 32.8, 0, base, 'stone');
    F.box(0, P, 12.5, 38, RT - P, 7, 0, c, 'stone');
    F.box(0, P, -11.5, 38, RT - P, 9, 0, c, 'stone');
    F.box(-15.5, P, 1, 7, RT - P, 16, 0, shade(c, 0.02), 'stone');
    F.box(15.5, P, 1, 7, RT - P, 16, 0, shade(c, 0.02), 'stone');
    K.band(0, 0, 38, 32, 4.3, 0.26, 0.3, shade(c, -0.08));
    K.band(0, 0, 38, 32, RT - 0.4, 0.4, 0.55, tr);
    K.band(0, 1, 24, 16, RT - 0.4, 0.4, 0.5, tr);
    K.parapet(0, 0, 38, 32, RT, 0.9, 0.45, c);
    K.band(0, 1, 24.45, 16.45, RT, 0.9, 0.45, c);
    K.band(0, 1, 24.45, 16.45, RT + 0.9, 0.14, 0.6, shade(c, -0.16));

    /* lecture hall: taller block on the back range, drum + dome */
    const hz = -11.8;
    F.box(0, P, hz, 18, 12, 9.6, 0, shade(c, 0.03), 'stone');
    K.band(0, hz, 18, 9.6, 11.4, 0.4, 0.2, tile);
    K.band(0, hz, 18, 9.6, 12.1, 0.4, 0.55, tr);
    K.parapet(0, hz, 18, 9.6, 12.5, 0.8, 0.4, c);
    F.cyl(0, 12.5, hz, 3.6, 2.2, 0, shade(c, 0.05), 'stone');
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) / 8 * TAU;
      F.box(Math.sin(a) * 3.62, 13.0, hz + Math.cos(a) * 3.62, 0.6, 1.2, 0.3, a, DARK, 'wood');
      const b = i / 8 * TAU;
      F.box(Math.sin(b) * 3.6, 12.5, hz + Math.cos(b) * 3.6, 0.35, 2.2, 0.3, b, shade(c, -0.1), 'stone');
    }
    F.cyl(0, 14.45, hz, 3.78, 0.3, 0, tile, 'stone');
    F.dome(0, 14.7, hz, 3.6, 3.2, 0, domeC, 'dome');
    F.cyl(0, 17.75, hz, 0.4, 0.4, 0, GILT, 'metal');
    F.ball(0, 18.35, hz, 0.3, GILT, 'metal');
    F.cone(0, 18.5, hz, 0.18, 0.9, 0, GILT, 'metal');
    /* hall back: tall arched windows between stepped buttresses */
    [-5, 0, 5].forEach(function (x) {
      K.win(x, 3.0, -16.6, 1, 1.6, 5.4, c, { arch: true });
      K.win(x, 10.0, -16.6, 1, 0.9, 0.9, c, { arch: true, sill: false });
    });
    [-7.5, -2.5, 2.5, 7.5].forEach(function (x) {
      F.box(x, P, -17.1, 0.9, 10.6, 1.0, 0, shade(c, -0.04), 'stone');
      F.box(x, P, -17.4, 1.15, 4.5, 1.6, 0, shade(c, -0.08), 'stone');
      F.box(x, P + 4.5, -17.35, 1.3, 0.3, 1.75, 0, tr, 'stone');
      F.box(x, P + 10.6, -17.1, 1.1, 0.35, 1.2, 0, tr, 'stone');
    });
    /* hall clerestory over the side ranges, and its courtyard face */
    [-9.6, -14.0].forEach(function (z) {
      K.win(9, 9.0, z, 2, 1.1, 1.9, c, { arch: true });
      K.win(-9, 9.0, z, 3, 1.1, 1.9, c, { arch: true });
    });
    [-5, 0, 5].forEach(function (x) { K.win(x, 9.0, -7, 0, 1.3, 1.9, c, { arch: true }); });

    /* library tower */
    const TX = -17, TZ = -14;
    const tf = function (y) { return 4.6 - 0.8 * (y - 0.9) / 18.1; };
    F.frustum(TX, 0, TZ, 5.0, 4.7, 0.9, 0, base, 'stone', 4);
    F.frustum(TX, 0.9, TZ, 4.6, 3.8, 18.1, 0, shade(c, 0.04), 'stone', 4);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      F.beam(TX + p[0] * 4.55, 0.9, TZ + p[1] * 4.55, TX + p[0] * 3.75, 19, TZ + p[1] * 3.75, 0.7, 0.7, shade(c, -0.06), 'stone');
    });
    [8.4, 14.2].forEach(function (y) {
      const r = tf(y + 0.35);
      F.box(TX, y, TZ, 2 * r + 0.35, 0.35, 2 * r + 0.35, 0, tr, 'stone');
    });
    [9.6, 15.2].forEach(function (y) {
      [0, 1, 2, 3].forEach(function (s) {
        const n = K.nrm(s), f = tf(y + 1.1) + 0.02;
        K.win(TX + n[0] * f, y, TZ + n[1] * f, s, 0.55, 2.2, c, { frame: false });
      });
    });
    [1, 3].forEach(function (s) {
      const n = K.nrm(s), f = tf(4.0) + 0.02;
      K.win(TX + n[0] * f, 3.2, TZ + n[1] * f, s, 0.55, 2.0, c, { frame: false, bars: true });
    });
    F.box(TX, 19, TZ, 8.2, 0.5, 8.2, 0, tr, 'stone');
    F.frustum(TX, 19.5, TZ, 3.5, 3.3, 3.3, 0, shade(c, 0.06), 'stone', 4);
    [0, 1, 2, 3].forEach(function (s) {
      const n = K.nrm(s);
      K.win(TX + n[0] * 3.42, 20.1, TZ + n[1] * 3.42, s, 1.1, 1.5, c, { arch: true });
    });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      F.cone(TX + p[0] * 3.75, 19.5, TZ + p[1] * 3.75, 0.32, 1.3, 0, shade(c, -0.25), 'stone');
    });
    F.box(TX, 22.5, TZ, 7.0, 0.3, 7.0, 0, tile, 'stone');
    F.box(TX, 22.8, TZ, 7.3, 0.4, 7.3, 0, tr, 'stone');
    F.dome(TX, 23.2, TZ, 3.0, 2.7, 0, domeC, 'dome');
    F.ball(TX, 26.0, TZ, 0.3, GILT, 'metal');
    F.cone(TX, 26.2, TZ, 0.16, 1.0, 0, GILT, 'metal');
    K.door(TX - tf(1.5) - 0.02, 0.9, TZ, 3, 1.3, 2.4, c, { arch: true, steps: 3 });

    /* gate pylon on the front */
    F.box(0, 0, 16.8, 11.6, 0.6, 3.0, 0, base, 'stone');
    F.box(0, 0, 16.8, 11, 10.6, 2.4, 0, shade(c, 0.04), 'stone');
    F.box(0, 10.6, 16.8, 11.8, 0.45, 3.2, 0, tr, 'stone');
    F.box(0, 11.05, 16.8, 10.6, 0.7, 2.2, 0, shade(c, 0.04), 'stone');
    F.box(0, 11.75, 16.8, 10.9, 0.15, 2.5, 0, tr, 'stone');
    [-1, 1].forEach(function (s) {
      F.box(s * 4.9, 11.9, 16.8, 1.0, 0.4, 1.0, 0, tr, 'stone');
      F.cone(s * 4.9, 12.3, 16.8, 0.5, 1.5, 0, shade(c, -0.3), 'stone');
      F.beam(s * 5.4, 0.6, 18.35, s * 5.4, 10.4, 18.05, 0.6, 0.5, shade(c, -0.03), 'stone');
    });
    K.door(0, P, 18.0, 0, 3.2, 4.2, c, { arch: true, leaf: DARK });
    K.fb(0, 8.4, 18.0, 0, 0.06, 8.4, 0.9, 0.12, DARK, 'stone');
    for (let i = 0; i < 13; i++) {
      K.fb(-3.8 + i * 0.63, 8.55 + F.rr(0, 0.2), 18.0, 0, 0.14, F.rr(0.15, 0.35), F.rr(0.3, 0.5), 0.05, 0xd8cfb8, 'stone');
    }
    K.fb(0, 9.65, 18.0, 0, 0.06, 11, 0.35, 0.12, tile, 'stone');
    [-1, 1].forEach(function (s) {
      const bc = F.pick(BANNER);
      F.rod(s * 3.6 - 0.85, 7.6, 18.3, s * 3.6 + 0.85, 7.6, 18.3, 0.05, BRACKET, 'metal');
      K.fb(s * 3.6, 3.4, 18.0, 0, 0.26, 1.35, 4.2, 0.06, bc, 'cloth');
      K.fb(s * 3.6, 2.9, 18.0, 0, 0.26, 0.6, 0.5, 0.06, bc, 'cloth');
      K.fb(s * 3.6, 6.4, 18.0, 0, 0.3, 1.36, 0.25, 0.06, shade(bc, -0.3), 'cloth');
      K.lamp(s * 2.9, 5.9, 18.0, 0);
      K.win(s * 5.5, 6.0, 17.0, s > 0 ? 2 : 3, 0.5, 2.0, c, { frame: false });
    });
    K.win(0, 8.6, 15.6, 1, 1.2, 1.4, c, { arch: true });
    F.box(0, 0, 18.6, 7.4, 0.5, 1.2, 0, shade(base, 0.05), 'stone');
    F.box(0, 0, 19.5, 8.0, 0.25, 0.6, 0, shade(base, 0.08), 'stone');

    /* windows and pilasters, outer elevations */
    const fx = [-16.5, -13.5, -10.5, -7.5, 7.5, 10.5, 13.5, 16.5];
    K.row(0, G, 16, 0, fx, 1.2, 1.7, c, { shut: true });
    K.row(0, U, 16, 0, fx, 1.1, 1.5, c, {});
    [-18, -15, -12, -9, -6, 6, 9, 12, 15, 18].forEach(function (x) {
      K.fb(x, P, 16, 0, 0.15, 0.6, RT - 0.4 - P, 0.3, shade(c, 0.05), 'stone');
    });
    K.row(0, G, -16, 1, [-10.8, 11.5, 14.5, 17.5], 1.2, 1.7, c, {});
    K.row(0, U, -16, 1, [-10.8, 11.5, 14.5, 17.5], 1.1, 1.5, c, {});
    K.row(-19, G, 0, 3, [-5, -1.5, 2, 5.5, 10, 13.5], 1.2, 1.7, c, { shut: true });
    K.row(-19, U, 0, 3, [-5, -1.5, 2, 5.5, 10, 13.5], 1.1, 1.5, c, {});
    K.row(19, G, 0, 2, [-14, -10.5, -5, -1.5, 5.5, 10, 13.5], 1.2, 1.7, c, {});
    K.row(19, U, 0, 2, [-14, -10.5, -5, -1.5, 2, 5.5, 10, 13.5], 1.1, 1.5, c, {});
    K.door(19, P, 2, 2, 1.5, 2.6, c, { steps: 2, lamp: 1 });
    K.drain(19.15, 15.6, P, RT - P - 0.2, c);
    K.drain(-19.15, 15.6, P, RT - P - 0.2, c);
    K.drain(19.15, -15.6, P, RT - P - 0.2, c);

    /* courtyard elevations */
    K.door(0, P, 9, 1, 2.8, 2.3, c, { arch: true, leaf: DARK });
    K.row(0, G, 9, 1, [-9, -5, 5, 9], 1.1, 1.6, c, {});
    K.row(0, U, 9, 1, [-10.5, -7, -3.5, 3.5, 7, 10.5], 1.1, 1.4, c, {});
    K.door(0, P, -7, 0, 2.0, 2.8, c, { arch: true });
    K.row(0, G, -7, 0, [-10.5, -7.3, -4, 4, 7.3, 10.5], 1.1, 1.6, c, {});
    K.row(0, U, -7, 0, [-10.5, -7.3, -4, 4, 7.3, 10.5], 1.1, 1.4, c, {});
    [[-12, 2], [12, 3]].forEach(function (q) {
      K.door(q[0], P, 1, q[1], 1.4, 2.4, c, {});
      K.row(q[0], G, 1, q[1], [-5.5, -2.8, 2.8, 5.5], 1.1, 1.6, c, {});
      K.row(q[0], U, 1, q[1], [-5.5, -2.8, 0, 2.8, 5.5], 1.1, 1.4, c, {});
    });

    /* cloister: columns, lintels and a lean roof on all four walks */
    const cx = 9.4, cN = 6.4, cS = -4.4;
    function col(x, z) {
      F.box(x, P, z, 0.8, 0.25, 0.8, 0, tr, 'stone');
      F.cyl(x, P + 0.25, z, 0.28, 3.35, 0, shade(c, 0.08), 'stone');
      F.box(x, 4.1, z, 0.85, 0.3, 0.85, 0, tr, 'stone');
    }
    for (let i = 0; i <= 8; i++) { col(-cx + i * (2 * cx / 8), cN); col(-cx + i * (2 * cx / 8), cS); }
    for (let j = 1; j <= 3; j++) { col(-cx, cS + j * (cN - cS) / 4); col(cx, cS + j * (cN - cS) / 4); }
    F.box(0, 4.4, cN, 2 * cx + 0.6, 0.4, 0.6, 0, shade(c, 0.02), 'stone');
    F.box(0, 4.4, cS, 2 * cx + 0.6, 0.4, 0.6, 0, shade(c, 0.02), 'stone');
    F.box(-cx, 4.4, 1, 0.6, 0.4, cN - cS, 0, shade(c, 0.02), 'stone');
    F.box(cx, 4.4, 1, 0.6, 0.4, cN - cS, 0, shade(c, 0.02), 'stone');
    const rf = shade(c, -0.05);
    F.box(0, 4.8, (cN - 0.35 + 9) / 2, 24, 0.3, 9 - (cN - 0.35), 0, rf, 'stone');
    F.box(0, 4.8, (-7 + cS + 0.35) / 2, 24, 0.3, (cS + 0.35) + 7, 0, rf, 'stone');
    F.box(-(12 + cx - 0.35) / 2, 4.8, 1, 12 - (cx - 0.35), 0.3, 16, 0, rf, 'stone');
    F.box((12 + cx - 0.35) / 2, 4.8, 1, 12 - (cx - 0.35), 0.3, 16, 0, rf, 'stone');
    F.box(0, 4.8, cN - 0.4, 2 * cx + 0.8, 0.32, 0.12, 0, tile, 'stone');
    F.box(0, 4.8, cS + 0.4, 2 * cx + 0.8, 0.32, 0.12, 0, tile, 'stone');
    F.box(-cx + 0.4, 4.8, 1, 0.12, 0.32, cN - cS + 0.8, 0, tile, 'stone');
    F.box(cx - 0.4, 4.8, 1, 0.12, 0.32, cN - cS + 0.8, 0, tile, 'stone');

    /* garth: paving, cross paths, fountain, olive trees, benches */
    F.box(0, P, 1, 2 * cx - 0.6, 0.05, cN - cS - 0.6, 0, shade(base, 0.14), 'stone');
    F.box(0, P + 0.05, 1, 1.6, 0.03, cN - cS - 0.6, 0, shade(base, 0.26), 'stone');
    F.box(0, P + 0.05, 1, 2 * cx - 0.6, 0.03, 1.6, 0, shade(base, 0.26), 'stone');
    F.frustum(0, P, 1, 2.3, 2.2, 0.7, Math.PI / 8, tr, 'stone', 8);
    F.cyl(0, P + 0.05, 1, 2.0, 0.62, 0, WATER, 'water');
    F.cyl(0, P, 1, 0.35, 1.6, 0, tr, 'stone');
    F.cyl(0, P + 1.6, 1, 0.9, 0.2, 0, tr, 'stone');
    F.blob(0, P + 2.0, 1, 0.22, 0.6, 0, 0xc8d4d0, 'water');
    [[-5.8, -1.8], [5.8, -1.8], [-5.8, 3.8], [5.8, 3.8]].forEach(function (p) {
      F.cyl(p[0], P, p[1], 1.1, 0.4, 0, tr, 'stone');
      F.cyl(p[0], P + 0.05, p[1], 0.95, 0.38, 0, MUD[0], 'soil');
      F.tree(p[0], p[1], 'olive', 4.2, P);
    });
    K.bench(0, P, 4.2, 2.4, true);
    K.bench(0, P, -2.2, 2.4, true);
    K.bench(-3.4, P, 1, 2.4, false);
    K.bench(3.4, P, 1, 2.4, false);

    /* roofs in use: a canopied open-air classroom on the east range,
       stair head on the west, a cistern and jars on the front range */
    K.awning(12.9, -5, 18.3, 6, RT, 2.5, F.pick(SAIL), { drop: 0.3, stripe: tile });
    [-3, -1.2, 0.6, 2.4].forEach(function (z) { K.bench(15.6, RT, z, 4.0, true); });
    F.box(15.6, RT, 4.6, 0.8, 1.15, 0.6, 0, TIMBER, 'wood');
    F.box(15.6, RT + 1.15, 4.6, 1.0, 0.08, 0.8, 0, shade(TIMBER, 0.1), 'wood');
    F.box(-16.5, RT, 5.5, 3, 2.3, 3, 0, c, 'stone');
    F.box(-16.5, RT + 2.3, 5.5, 3.3, 0.25, 3.3, 0, tr, 'stone');
    K.door(-15, RT, 5.5, 2, 0.95, 1.7, c, {});
    F.cyl(-8, RT, 12.5, 1.1, 1.3, 0, shade(c, -0.1), 'stone');
    F.cyl(-8, RT + 1.3, 12.5, 1.15, 0.12, 0, TIMBER, 'wood');
    K.jar(-6.2, RT, 12.2, 0.35); K.jar(-6.0, RT, 13.1, 0.3, 0x7a6a4a); K.jar(9.5, RT, 13.5, 0.4);
    K.crate(10.6, RT, 12.2, 0.7, 0.3);
  }

  /* v1 — neighbourhood schoolhouse: two storeys, classrooms upstairs, a
     canopied roof terrace for lessons, a walled play yard in front. */
  function schoolHouse(F, K) {
    const c = F.pick(ST), tr = shade(c, -0.14), base = shade(c, -0.26);
    const P = 0.4, RT = 7.6, BZ = -4;
    F.box(0, 0, BZ, 13.6, P, 9.6, 0, base, 'stone');
    F.box(0, P, BZ, 13, RT - P, 9, 0, c, 'stone');
    K.band(0, BZ, 13, 9, 4.0, 0.25, 0.3, shade(c, -0.08));
    K.band(0, BZ, 13, 9, RT - 0.35, 0.35, 0.5, tr);
    K.parapet(0, BZ, 13, 9, RT, 0.9, 0.4, c);

    /* front */
    K.door(0, P, 0.5, 0, 1.5, 2.4, c, { steps: 2 });
    K.fb(0, 3.35, 0.5, 0, 0.18, 2.6, 0.55, 0.1, 0x6b4a2a, 'wood');
    for (let i = 0; i < 6; i++) K.fb(-0.95 + i * 0.38, 3.48, 0.5, 0, 0.25, 0.14, 0.3, 0.04, 0xe0d4b0, 'wood');
    K.row(0, 1.4, 0.5, 0, [-4.2, 4.2], 1.2, 1.6, c, { shut: true });
    K.row(0, 4.6, 0.5, 0, [-4.5, -1.5, 1.5, 4.5], 1.4, 1.6, c, { arch: true });
    /* back */
    K.row(0, 1.4, -8.5, 1, [-4.2, -1], 1.2, 1.5, c, {});
    K.door(3.6, P, -8.5, 1, 1.1, 2.2, c, { steps: 2 });
    K.row(0, 4.6, -8.5, 1, [-4.5, -1.5, 1.5, 4.5], 1.4, 1.6, c, { arch: true });
    /* west */
    K.row(-6.5, 1.4, BZ, 3, [-2.2, 2.2], 1.2, 1.5, c, { shut: true });
    K.row(-6.5, 4.6, BZ, 3, [-2.2, 2.2], 1.4, 1.6, c, { arch: true });
    K.drain(-6.65, 0.3, P, RT - P, c);
    /* east: stair up to the upper classrooms */
    K.win(6.5, 1.4, -1.6, 2, 1.1, 1.5, c, {});
    K.win(6.5, 4.6, -5.9, 2, 1.4, 1.6, c, { arch: true });
    K.stair(7.2, -8.3, 0, 4.1, '+z', 1.3, shade(c, -0.06), { run: 0.36 });
    F.box(7.2, 3.8, -1.73, 1.4, 0.3, 3.1, 0, shade(c, -0.1), 'stone');
    F.rod(7.75, 0, -0.45, 7.75, 3.8, -0.45, 0.14, TIMBER, 'wood');
    K.door(6.5, 4.1, -1.6, 2, 1.0, 2.1, c, {});
    F.rod(7.8, 1.0, -8.2, 7.8, 5.0, -3.3, 0.05, TIMBER, 'wood');
    [0, 5, 10, 13].forEach(function (i) {
      const z = -8.3 + (i + 0.5) * 0.36, y = (i + 1) * 4.1 / 14;
      F.rod(7.8, y, z, 7.8, y + 0.95, z, 0.04, TIMBER, 'wood');
    });
    F.rod(7.85, 5.0, -3.3, 7.85, 5.0, -0.2, 0.05, TIMBER, 'wood');
    F.rod(7.85, 4.1, -0.25, 7.85, 5.0, -0.25, 0.05, TIMBER, 'wood');

    /* roof terrace: canopy over benches and a slate, stair head, cistern */
    K.awning(-5.7, -4.6, 5.7, -0.2, RT, 2.6, F.pick(SAIL), { drop: 0.3, stripe: F.pick(BANNER) });
    [-1.0, -2.1, -3.2].forEach(function (z) { K.bench(0, RT, z, 7.2, true); });
    F.box(0, RT + 0.85, -4.25, 2.2, 1.3, 0.1, 0, SLATE, 'stone');
    F.box(0, RT + 0.8, -4.2, 2.3, 0.08, 0.2, 0, TIMBER, 'wood');
    [-0.9, 0.9].forEach(function (x) { F.rod(x, RT, -4.1, x, RT + 2.2, -4.3, 0.05, TIMBER, 'wood'); });
    F.box(-4.5, RT, -6.6, 3, 2.5, 2.8, 0, c, 'stone');
    F.box(-4.5, RT + 2.5, -6.6, 3.3, 0.25, 3.1, 0, tr, 'stone');
    K.door(-3, RT, -6.6, 2, 0.95, 1.85, c, {});
    K.win(-4.8, RT + 1.0, -5.2, 0, 0.7, 0.8, c, {});
    F.cyl(4.2, RT, -6.8, 0.9, 1.3, 0, shade(c, -0.1), 'stone');
    F.cyl(4.2, RT + 1.3, -6.8, 0.95, 0.12, 0, TIMBER, 'wood');
    K.jar(2.6, RT, -7.6, 0.32); K.jar(5.5, RT, -5.5, 0.28, 0x7a6a4a);
    [-1.5, 0.2, 1.9].forEach(function (x) {
      F.cyl(x, RT, -7.8, 0.3, 0.45, 0, 0x8a5a3a, 'clay');
      F.blob(x, RT + 0.7, -7.8, 0.35, 0.5, 0, F.pick(LEAF), 'leafy');
    });
    K.chimney(-1.9, -6.6, RT, 1.8, c);

    /* walled play yard */
    const Z0 = 0.5, Z1 = 9.2;
    K.wall(-6.3, Z0, -6.3, Z1, 2.0, 0.4, c);
    K.wall(6.3, Z0, 6.3, Z1, 2.0, 0.4, c);
    K.wall(-6.5, 9.0, -1.4, 9.0, 2.0, 0.4, c);
    K.wall(1.4, 9.0, 6.5, 9.0, 2.0, 0.4, c);
    [-1.75, 1.75].forEach(function (x) {
      F.box(x, 0, 9.0, 0.7, 2.6, 0.7, 0, shade(c, 0.03), 'stone');
      F.box(x, 2.6, 9.0, 0.9, 0.2, 0.9, 0, tr, 'stone');
      F.ball(x, 3.0, 9.0, 0.22, GLOW, 'glow');
    });
    F.box(-1.3, 0.1, 8.1, 0.1, 1.6, 1.3, 0, 0x5a4028, 'wood');
    F.box(1.3, 0.1, 8.1, 0.1, 1.6, 1.3, 0, 0x5a4028, 'wood');
    [-6.3, 6.3].forEach(function (x) {
      [3.0, 6.0].forEach(function (z) { F.box(x, 0, z, 0.6, 2.2, 0.6, 0, shade(c, 0.03), 'stone'); });
    });
    F.box(0, 0, 4.85, 12.2, 0.04, 8.3, 0, shade(POOR[0], 0.08), 'soil');
    F.box(0, 0.04, 4.85, 1.8, 0.03, 8.3, 0, shade(base, 0.2), 'stone');
    /* shade tree with a ring bench, well, sandpit, slate, stools, ball */
    F.cyl(3.8, 0, 5.6, 1.2, 0.45, 0, 0x5a4630, 'wood');
    F.tree(3.8, 5.6, 'olive', 5.2);
    F.cyl(-4.2, 0, 6.4, 0.85, 0.8, 0, tr, 'stone');
    F.cyl(-4.2, 0.05, 6.4, 0.65, 0.78, 0, WATER, 'water');
    [-1, 1].forEach(function (s) { F.rod(-4.2 + s * 0.8, 0.8, 6.4, -4.2 + s * 0.8, 2.2, 6.4, 0.07, TIMBER, 'wood'); });
    F.rod(-5.1, 2.1, 6.4, -3.3, 2.1, 6.4, 0.06, TIMBER, 'wood');
    F.rod(-4.2, 2.1, 6.4, -4.2, 1.35, 6.4, 0.02, 0x6b5a3a, 'rope');
    F.cyl(-4.2, 1.05, 6.4, 0.18, 0.3, 0, 0x5a4a34, 'wood');
    F.box(-3.9, 0, 2.6, 2.4, 0.3, 2.0, 0, TIMBER, 'wood');
    F.box(-3.9, 0.05, 2.6, 2.1, 0.27, 1.7, 0, 0xc8b890, 'soil');
    F.box(-6.05, 0.9, 4.6, 0.08, 1.0, 1.6, 0, SLATE, 'stone');
    F.box(-5.95, 0.85, 4.6, 0.2, 0.06, 1.7, 0, TIMBER, 'wood');
    [[1.6, 2.4], [2.5, 3.1], [-2.2, 5.0]].forEach(function (p) { F.cyl(p[0], 0, p[1], 0.22, 0.42, 0, 0x5a4630, 'wood'); });
    F.ball(0.9, 0.2, 3.2, 0.2, 0x8a5a3a, 'cloth');
    K.bench(-4.6, 0, 8.4, 2.4, true);
    K.jar(5.5, 0, 1.3, 0.35);
  }

  /* ============================================================= GENERATOR */

  /* geothermal steam power house: a buttressed turbine hall with a clerestory
     monitor, boiler house with bronze drums, three stacks, cooling tanks, a
     turbine casing, a crane gantry, conduits out on pylons, control tower */
  function genHall(F, K) {
    const c = shade(F.pick(ST), -0.1), tr = shade(c, -0.14), base = shade(c, -0.26);
    const P = 0.6, HT = 15;
    /* turbine hall */
    F.box(0, 0, 0, 25, P, 14.8, 0, base, 'stone');
    F.box(0, P, 0, 24, HT - P, 14, 0, c, 'stone');
    F.box(0, P, 0, 24.6, 2.6, 14.6, 0, shade(c, -0.08), 'stone');
    F.box(0, P + 2.6, 0, 24.9, 0.3, 14.9, 0, tr, 'stone');
    K.band(0, 0, 24, 14, 12.2, 0.3, 0.3, tr);
    K.band(0, 0, 24, 14, HT - 0.45, 0.45, 0.6, tr);
    K.parapet(0, 0, 24, 14, HT, 0.9, 0.45, c);
    F.box(0, HT, 0, 19, 2.3, 4.6, 0, shade(c, 0.04), 'stone');
    F.box(0, HT + 2.3, 0, 19.8, 0.3, 5.4, 0, tr, 'stone');
    for (let i = 0; i < 11; i++) {
      const x = -8.5 + i * 1.7;
      [0, 1].forEach(function (s) {
        K.fb(x, HT + 0.5, s ? -2.3 : 2.3, s, 0.06, 1.1, 1.3, 0.12, DARK, 'wood');
        K.fb(x, HT + 1.1, s ? -2.3 : 2.3, s, 0.13, 1.1, 0.07, 0.04, IRON, 'metal');
      });
    }
    [[-8, 4.9], [8, 4.9], [-8, -4.9], [8, -4.9], [0, 4.9]].forEach(function (p) {
      F.cyl(p[0], HT, p[1], 0.45, 1.3, 0, IRON, 'metal');
      F.cone(p[0], HT + 1.3, p[1], 0.8, 0.6, 0, IRON, 'metal');
    });
    /* buttresses: front all four, back only where the boiler house does not stand */
    [[-9, 1], [-3, 1], [3, 1], [9, 1], [9, -1]].forEach(function (q) {
      const x = q[0], sz = q[1];
      F.box(x, 0, sz * 8.2, 1.5, P + 0.5, 1.8, 0, base, 'stone');
      F.beam(x, P, sz * 8.2, x, HT - 1.3, sz * 7.25, 1.0, 1.0, shade(c, -0.04), 'stone');
      F.box(x, HT - 1.45, sz * 7.3, 1.25, 0.4, 1.1, 0, tr, 'stone');
    });
    /* front: tall iron-mullioned windows, the iron door, pipework */
    [-6, 6].forEach(function (x) { K.win(x, 3.8, 7, 0, 2.4, 5.6, c, { arch: true, mull: IRON }); });
    K.door(0, P, 7, 0, 2.6, 3.4, c, { leaf: IRON, leafFam: 'metal', steps: 2, lamp: 1 });
    K.win(0, 6.4, 7, 0, 2.4, 3.1, c, { arch: true, mull: IRON });
    [-10.5, 10.5].forEach(function (x) {
      K.win(x, 5.2, 7, 0, 1.0, 2.2, c, { bars: true });
      K.win(x, 9.6, 7, 0, 1.0, 1.8, c, {});
    });
    F.rod(-11.4, 3.9, 7.55, -7.6, 3.9, 7.55, 0.2, BRASS, 'metal');
    F.rod(-7.6, 3.9, 7.55, -7.6, 0.6, 7.55, 0.2, BRASS, 'metal');
    F.ball(-7.6, 3.9, 7.55, 0.24, BRASS, 'metal');
    F.rod(-7.6, 2.0, 7.3, -7.6, 2.0, 8.0, 0.35, BRONZE, 'metal');
    F.rod(-7.6, 2.0, 8.0, -7.6, 2.0, 8.1, 0.05, IRON, 'metal');
    F.rod(-7.6, 2.05, 8.06, -7.6, 2.05, 8.14, 0.42, IRON, 'metal');
    /* back */
    [-6, 0].forEach(function (x) { K.win(x, 10.2, -7, 1, 1.8, 2.6, c, { arch: true, mull: IRON }); });
    K.win(7.5, 3.8, -7, 1, 1.8, 5.6, c, { arch: true, mull: IRON });
    K.win(10.5, 5.2, -7, 1, 1.0, 2.2, c, { bars: true });
    K.win(-11, 10.2, -7, 1, 0.9, 1.8, c, {});

    /* east end: machine door, bronze gear emblem, rails out into the yard */
    K.door(12, P, 0, 2, 5.4, 7.0, c, { leaf: IRON, leafFam: 'metal' });
    K.fd(12, 11.6, 0, 2, 0.15, 1.9, 0.3, shade(BRONZE, -0.15), 'metal');
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU, ca = Math.cos(a), sa = Math.sin(a);
      F.beam(12.18, 11.6 + ca * 1.75, sa * 1.75, 12.18, 11.6 + ca * 2.35, sa * 2.35, 0.34, 0.42, BRONZE, 'metal');
      if (i % 2 === 0) F.beam(12.34, 11.6 + ca * 0.45, sa * 0.45, 12.34, 11.6 + ca * 1.7, sa * 1.7, 0.1, 0.28, BRASS, 'metal');
    }
    K.fd(12, 11.6, 0, 2, 0.35, 0.55, 0.3, BRASS, 'metal');
    [-4.5, 4.5].forEach(function (z) {
      K.win(12, 9.0, z, 2, 1.3, 3.2, c, { arch: true, mull: IRON });
      K.win(12, 3.6, z, 2, 1.0, 1.8, c, { bars: true });
    });
    [-0.75, 0.75].forEach(function (z) { F.box(15.9, 0.06, z, 7.6, 0.14, 0.14, 0, IRON, 'metal'); });
    for (let i = 0; i < 9; i++) F.box(12.6 + i * 0.85, 0, 0, 0.3, 0.07, 2.2, 0, TIMBER, 'wood');
    /* crane gantry over the east yard */
    const gz = 5.2, GH = 12.4;
    [13.6, 18.6].forEach(function (x) {
      [1, -1].forEach(function (s) {
        F.box(x, 0, s * gz, 1.3, 0.5, 1.3, 0, base, 'stone');
        F.box(x, 0.5, s * gz, 0.5, GH - 0.5, 0.5, 0, IRON, 'metal');
      });
      F.box(x, GH, 0, 0.7, 0.8, 2 * gz + 0.7, 0, IRON, 'metal');
      F.rod(x, 1.2, gz, x, GH - 0.3, 1.2, 0.07, IRON, 'metal');
      F.rod(x, 1.2, -gz, x, GH - 0.3, -1.2, 0.07, IRON, 'metal');
    });
    [1, -1].forEach(function (s) {
      F.box(16.1, GH, s * gz, 5.7, 0.8, 0.6, 0, IRON, 'metal');
      F.rod(13.6, 1.0, s * gz, 18.6, GH - 0.4, s * gz, 0.07, IRON, 'metal');
      F.rod(18.6, 1.0, s * gz, 13.6, GH - 0.4, s * gz, 0.07, IRON, 'metal');
    });
    F.box(16.3, GH + 0.8, 0, 1.0, 0.9, 2 * gz + 0.4, 0, shade(BRONZE, -0.2), 'metal');
    F.box(16.3, GH + 1.7, 0.8, 1.6, 0.7, 1.4, 0, BRASS, 'metal');
    [-0.3, 0.3].forEach(function (d) { F.rod(16.3 + d, GH + 0.8, 0.8, 16.3 + d, 6.9, 0.8, 0.04, IRON, 'metal'); });
    F.box(16.3, 6.4, 0.8, 0.8, 0.55, 0.55, 0, IRON, 'metal');
    F.rod(15.2, 5.3, 0.8, 16.3, 6.4, 0.8, 0.03, IRON, 'metal');
    F.rod(17.4, 5.3, 0.8, 16.3, 6.4, 0.8, 0.03, IRON, 'metal');
    F.rod(15.0, 5.3, 0.8, 17.6, 5.3, 0.8, 0.8, BRONZE, 'metal');
    [15.3, 15.9, 16.5, 17.1].forEach(function (x) { F.rod(x - 0.06, 5.3, 0.8, x + 0.06, 5.3, 0.8, 1.15, BRASS, 'metal'); });
    for (let i = 0; i < 5; i++) F.box(18.6 + 0.3, 0.8 + i * 2.2, gz, 0.06, 0.06, 0.6, 0, IRON, 'metal');
    F.rod(18.95, 0.5, gz - 0.28, 18.95, 11.5, gz - 0.28, 0.035, IRON, 'metal');
    F.rod(18.95, 0.5, gz + 0.28, 18.95, 11.5, gz + 0.28, 0.035, IRON, 'metal');
    F.box(14.8, 0.2, 0, 2.2, 0.35, 1.9, 0, TIMBER, 'wood');
    [[14.1, -0.95], [15.5, -0.95], [14.1, 0.95], [15.5, 0.95]].forEach(function (p) {
      F.rod(p[0], 0.3, p[1] - 0.08, p[0], 0.3, p[1] + 0.08, 0.3, IRON, 'metal');
    });
    K.crate(14.8, 0.55, -0.2, 1.0, 0.1);

    /* west end: bronze turbine casing on a masonry saddle */
    const TY = 5.8, TZc = -2.2;
    F.box(-13.3, 0, TZc, 2.4, 3.6, 3.8, 0, shade(c, -0.1), 'stone');
    F.box(-13.3, 3.6, TZc, 2.6, 0.2, 4.0, 0, tr, 'stone');
    F.rod(-12, TY, TZc, -14.3, TY, TZc, 2.6, BRONZE, 'metal');
    F.rod(-14.3, TY, TZc, -14.6, TY, TZc, 2.8, BRASS, 'metal');
    F.rod(-14.6, TY, TZc, -15.2, TY, TZc, 0.9, BRASS, 'metal');
    F.rod(-15.2, TY, TZc, -15.4, TY, TZc, 0.5, IRON, 'metal');
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU, ca = Math.cos(a), sa = Math.sin(a);
      F.beam(-14.64, TY + ca * 0.95, TZc + sa * 0.95, -14.64, TY + ca * 2.6, TZc + sa * 2.6, 0.2, 0.28, IRON, 'metal');
      F.ball(-14.3, TY + ca * 2.72, TZc + sa * 2.72, 0.12, IRON, 'metal');
    }
    [-13.0, -13.7].forEach(function (x) { F.rod(x - 0.08, TY, TZc, x + 0.08, TY, TZc, 2.68, shade(BRONZE, -0.2), 'metal'); });
    F.rod(-13.2, TY + 2.4, TZc, -13.2, 12.4, TZc, 0.5, BRASS, 'metal');
    F.ball(-13.2, 12.4, TZc, 0.55, BRASS, 'metal');
    F.rod(-13.2, 12.4, TZc, -11.9, 12.4, TZc, 0.5, BRASS, 'metal');
    K.fd(-12, 12.4, TZc, 3, 0.1, 0.72, 0.2, BRONZE, 'metal');
    K.win(-12, 9.6, -5.4, 3, 1.1, 2.4, c, { arch: true, mull: IRON });
    K.win(-12, 13.0, -5.4, 3, 0.8, 0.8, c, { sill: false });

    /* control tower on the front-west corner, glowing gauge cabin on top */
    const CX = -14.8, CZ = 4.6, CH = 18;
    const cf = function (y) { return 2.8 - 0.6 * (y - 0.8) / (CH - 0.8); };
    F.frustum(CX, 0, CZ, 3.1, 2.85, 0.8, 0, base, 'stone', 4);
    F.frustum(CX, 0.8, CZ, 2.8, 2.2, CH - 0.8, 0, shade(c, 0.05), 'stone', 4);
    [6.5, 12.5].forEach(function (y) { const r = cf(y + 0.3); F.box(CX, y, CZ, 2 * r + 0.3, 0.3, 2 * r + 0.3, 0, tr, 'stone'); });
    [3.4, 8.6, 14.2].forEach(function (y) {
      [0, 1, 3].forEach(function (s) {
        const n = K.nrm(s), f = cf(y + 0.9) + 0.02;
        K.win(CX + n[0] * f, y, CZ + n[1] * f, s, 0.5, 1.8, c, { frame: false });
      });
    });
    K.door(CX, 0.8, CZ + cf(1.8) + 0.02, 0, 1.2, 2.3, c, { leaf: IRON, leafFam: 'metal', steps: 2 });
    F.box(CX, CH, CZ, 6.9, 0.45, 6.9, 0, tr, 'stone');
    [0, 1, 2, 3].forEach(function (s) {
      const n = K.nrm(s);
      [-1.4, 0, 1.4].forEach(function (u) {
        const p = K.along(CX, CZ, s, u);
        F.beam(p[0] + n[0] * cf(CH - 1.6), CH - 1.6, p[1] + n[1] * cf(CH - 1.6), p[0] + n[0] * 3.2, CH + 0.05, p[1] + n[1] * 3.2, 0.35, 0.35, shade(c, -0.1), 'stone');
      });
    });
    F.box(CX, CH + 0.45, CZ, 6.0, 3.0, 6.0, 0, shade(c, 0.02), 'stone');
    [0, 1, 2, 3].forEach(function (s) {
      const n = K.nrm(s), fx = CX + n[0] * 3.0, fz = CZ + n[1] * 3.0;
      K.fb(fx, CH + 1.25, fz, s, 0.05, 4.8, 1.2, 0.12, 0xffc27a, 'glow');
      [-1.6, -0.8, 0, 0.8, 1.6].forEach(function (u) {
        const p = K.along(fx, fz, s, u);
        K.fb(p[0], CH + 1.25, p[1], s, 0.12, 0.12, 1.2, 0.08, IRON, 'metal');
      });
      K.fb(fx, CH + 1.1, fz, s, 0.12, 5.0, 0.15, 0.2, IRON, 'metal');
      [-1.4, 0, 1.4].forEach(function (u) {
        const p = K.along(fx, fz, s, u);
        K.fd(p[0], CH + 2.95, p[1], s, 0.06, 0.34, 0.12, BRASS, 'metal');
        K.fd(p[0], CH + 2.95, p[1], s, 0.14, 0.26, 0.06, u === 0 ? 0xffc27a : 0x9fe8b0, 'glow');
        K.fb(p[0], CH + 2.95, p[1], s, 0.19, 0.04, 0.22, 0.03, DARK, 'wood');
      });
    });
    K.band(CX, CZ, 6.7, 6.7, CH + 1.4, 0.08, 0.08, IRON, 'metal');
    [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 1], [0, -1], [1, 0], [-1, 0]].forEach(function (p) {
      F.rod(CX + p[0] * 3.35, CH + 0.45, CZ + p[1] * 3.35, CX + p[0] * 3.35, CH + 1.45, CZ + p[1] * 3.35, 0.04, IRON, 'metal');
    });
    F.box(CX, CH + 3.45, CZ, 6.6, 0.3, 6.6, 0, tr, 'stone');
    F.pyrRoof(CX, CH + 3.75, CZ, 6.6, 1.5, 6.6, 0, shade(BRONZE, -0.12), 'metal');
    F.rod(CX, CH + 5.2, CZ, CX, CH + 7.4, CZ, 0.08, IRON, 'metal');
    F.ball(CX, CH + 7.5, CZ, 0.25, BRASS, 'metal');
    F.cyl(CX + 3.15, CH + 0.45, CZ + 3.15, 0.14, 1.1, 0, BRASS, 'metal');
    F.cone(CX + 3.15, CH + 1.55, CZ + 3.15, 0.25, 0.35, 0, BRASS, 'metal');
    F.rod(CX + 2.25, CH - 0.2, CZ - 2.4, CX + 2.25, 1.0, CZ - 2.4, 0.12, IRON, 'metal');

    /* boiler house behind the hall, bronze drums on its roof */
    const BX = -2, BZ = -11, BW = 16, BD = 8, BH = 9;
    F.box(BX, 0, BZ, BW + 0.6, 0.5, BD + 0.6, 0, base, 'stone');
    F.box(BX, 0.5, BZ, BW, BH - 0.5, BD, 0, shade(c, 0.03), 'stone');
    K.band(BX, BZ, BW, BD, 4.6, 0.25, 0.3, tr);
    K.band(BX, BZ, BW, BD, BH - 0.35, 0.35, 0.5, tr);
    K.parapet(BX, BZ, BW, BD, BH, 0.5, 0.35, c);
    K.row(BX, 1.8, -15, 1, [-2, 4], 1.3, 2.3, c, { arch: true, bars: true });
    K.row(BX, 6.0, -15, 1, [-6.5, -2, 4, 6.5], 0.9, 1.5, c, {});
    K.row(6, 1.8, BZ, 2, [-2, 2], 1.2, 2.2, c, { arch: true, bars: true });
    K.row(6, 6.0, BZ, 2, [-2, 2], 0.9, 1.5, c, {});
    K.door(-10, 0.5, -13.2, 3, 2.4, 3.0, c, { leaf: IRON, leafFam: 'metal', steps: 1 });
    K.win(-10, 6.0, -11, 3, 0.9, 1.5, c, {});
    [-9.4, -12.6].forEach(function (z) {
      [-7, -2.5, 2].forEach(function (x) { F.box(x, BH, z, 0.9, 1.35, 2.3, 0, shade(c, -0.12), 'stone'); });
      F.rod(-8.5, 11.3, z, 3.5, 11.3, z, 1.3, BRONZE, 'metal');
      F.ball(-8.5, 11.3, z, 1.3, shade(BRONZE, 0.05), 'metal');
      F.ball(3.5, 11.3, z, 1.3, shade(BRONZE, 0.05), 'metal');
      [-6, -3, 0, 3].forEach(function (x) { F.rod(x - 0.1, 11.3, z, x + 0.1, 11.3, z, 1.37, BRASS, 'metal'); });
      F.cyl(-4.5, 12.4, z, 0.45, 0.45, 0, IRON, 'metal');
      F.cyl(1.0, 12.5, z, 0.16, 0.8, 0, BRASS, 'metal');
      F.ball(1.0, 13.35, z, 0.2, BRASS, 'metal');
      F.rod(-1.5, 12.4, z, -1.5, 13.8, z, 0.28, BRASS, 'metal');
      F.ball(-1.5, 13.8, z, 0.32, BRASS, 'metal');
      F.rod(-1.5, 13.8, z, -1.5, 13.8, -7.0, 0.28, BRASS, 'metal');
      F.rod(-1.5, 13.8, -7.35, -1.5, 13.8, -7.0, 0.42, BRONZE, 'metal');
    });
    F.rod(2.0, 11.3, -9.4, 2.0, 11.3, -7.0, 0.5, BRASS, 'metal');
    F.rod(2.0, 11.3, -7.4, 2.0, 11.3, -7.0, 0.7, BRONZE, 'metal');
    K.fd(3.5, 11.3, -9.4, 0, 1.2, 0.3, 0.1, BRASS, 'metal');
    K.fd(-3.2, 11.0, -9.4, 0, 1.35, 0.28, 0.1, BRASS, 'metal');
    K.fd(-3.2, 11.0, -9.4, 0, 1.42, 0.2, 0.05, 0x9fe8b0, 'glow');

    /* stacks, flues and steam */
    [-7, -1.5, 4].forEach(function (x, i) {
      const sz = -17.0, top = 23 + (i === 1 ? 1.2 : 0);
      F.box(x, 0, sz, 2.8, 2.2, 2.8, 0, base, 'stone');
      F.box(x, 2.2, sz, 3.0, 0.25, 3.0, 0, tr, 'stone');
      F.frustum(x, 2.2, sz, 1.25, 0.95, top - 2.2, 0, shade(c, -0.06), 'stone', 12);
      [6, 11, 16, 21].forEach(function (y) {
        const r = 1.25 - 0.3 * (y - 2.2) / (top - 2.2);
        F.cyl(x, y, sz, r + 0.07, 0.25, 0, IRON, 'metal');
      });
      F.cyl(x, top, sz, 1.12, 0.5, 0, IRON, 'metal');
      F.cyl(x, top + 0.5, sz, 0.8, 0.04, 0, DARK, 'stone');
      F.box(x, 4.4, -15.75, 1.3, 1.6, 1.5, 0, IRON, 'metal');
      [[0.1, 1.0, 0, 0.85, 1.5], [0.5, 2.0, 0.2, 1.1, 1.9], [1.1, 3.1, 0.45, 1.35, 2.3],
        [1.9, 4.0, 0.7, 1.5, 2.4], [0.6, 3.3, -0.35, 1.0, 1.8]].forEach(function (b, k) {
        F.blob(x + b[0], top + b[1], sz + b[2], b[3], b[4], k, shade(STEAM, -0.04 + k * 0.025), 'steam');
      });
    });

    /* cooling tanks west of the hall */
    [[-19, -4.0], [-19, -11]].forEach(function (p, i) {
      F.cyl(p[0], 0, p[1], 3.0, 0.4, 0, base, 'stone');
      F.cyl(p[0], 0.4, p[1], 2.8, 5.6, 0, shade(BRONZE, -0.08), 'metal');
      [1.4, 2.8, 4.2, 5.6].forEach(function (y) { F.cyl(p[0], y, p[1], 2.87, 0.16, 0, IRON, 'metal'); });
      F.cone(p[0], 6.0, p[1], 2.95, 1.1, 0, BRASS, 'metal');
      F.cyl(p[0], 6.9, p[1], 0.35, 0.8, 0, IRON, 'metal');
      F.cone(p[0], 7.7, p[1], 0.55, 0.35, 0, IRON, 'metal');
      [-0.3, 0.3].forEach(function (d) { F.rod(p[0] - 2.9, 0.4, p[1] + d, p[0] - 2.9, 6.2, p[1] + d, 0.04, IRON, 'metal'); });
      for (let k = 0; k < 9; k++) F.rod(p[0] - 2.9, 0.9 + k * 0.62, p[1] - 0.3, p[0] - 2.9, 0.9 + k * 0.62, p[1] + 0.3, 0.03, IRON, 'metal');
      K.fd(p[0], 2.2, p[1] + 2.8, 0, 0.05, 0.4, 0.1, BRASS, 'metal');
      K.fd(p[0], 2.2, p[1] + 2.8, 0, 0.12, 0.3, 0.05, 0x9fe8b0, 'glow');
      if (i === 0) {
        F.rod(-16.1, 2.0, -3.3, -14.4, 2.0, -3.3, 0.35, BRASS, 'metal');
        F.rod(-15.3, 1.7, -3.3, -15.3, 2.3, -3.3, 0.5, BRONZE, 'metal');
      } else {
        F.rod(-16.1, 2.0, -9.2, -10.0, 2.0, -9.2, 0.35, BRASS, 'metal');
        F.rod(-13.0, 1.7, -9.2, -13.0, 2.3, -9.2, 0.5, BRONZE, 'metal');
        F.box(-13.0, 0, -9.2, 0.6, 1.65, 0.6, 0, shade(c, -0.1), 'stone');
      }
    });

    /* conduits leaving the front on two velothi pylons, dropping into a valve pit */
    const pxs = [4.7, 5.9], cy = 11.35;
    pxs.forEach(function (x) {
      F.rod(x, cy, 7, x, cy, 16.3, 0.33, BRASS, 'metal');
      F.rod(x, cy, 7.0, x, cy, 7.45, 0.46, BRONZE, 'metal');
      F.ball(x, cy, 16.3, 0.36, BRASS, 'metal');
      F.rod(x, cy, 16.3, x, 1.0, 16.3, 0.33, BRASS, 'metal');
      F.rod(x, 3.4, 16.3, x, 3.6, 16.3, 0.45, BRONZE, 'metal');
      F.rod(x, 2.6, 16.3, x, 2.6, 16.75, 0.05, IRON, 'metal');
      F.rod(x, 2.6, 16.7, x, 2.6, 16.8, 0.36, BRASS, 'metal');
    });
    F.box(7.1, cy - 0.35, 11.7, 0.7, 0.7, 9.4, 0, IRON, 'metal');
    F.box(7.1, 1.0, 16.05, 0.7, cy - 0.35 - 1.0 + 0.7, 0.7, 0, IRON, 'metal');
    [10.8, 14.6].forEach(function (z) {
      F.frustum(5.9, 0, z, 0.9, 0.6, 10.4, 0, shade(c, 0.02), 'stone', 4);
      F.box(5.9, 0, z, 2.2, 0.5, 2.2, 0, base, 'stone');
      F.box(5.9, 10.4, z, 3.8, 0.6, 1.0, 0, tr, 'stone');
      [3.8, 8.0].forEach(function (x) {
        F.box(x, 11.0, z, 0.5, 0.5, 0.8, 0, tr, 'stone');
        F.hipRoof(x, 11.5, z, 0.7, 0.5, 1.0, 0, shade(c, -0.25), 'roof');
      });
      K.fb(5.9, 5.0, z + 0.78, 0, 0.02, 0.6, 1.0, 0.06, F.pick(BANNER), 'cloth');
    });
    F.box(6.1, 0, 16.3, 3.6, 1.0, 1.6, 0, base, 'stone');
    F.box(6.1, 1.0, 16.3, 3.8, 0.2, 1.8, 0, tr, 'stone');
    K.barrel(-3.5, 0, 8.6, 0.45, 1.1); K.barrel(-2.6, 0, 8.9, 0.45, 1.1); K.barrel(-3.1, 1.1, 8.75, 0.45, 1.1);
    K.crate(10.4, 0, 8.4, 1.0, 0.2); K.crate(10.9, 1.0, 8.5, 0.8, -0.1);
  }

  /* v1 — fumarole vent house: a battered Velothi rotunda over a steam vent,
     bronze-ribbed dome, a glowing gauge gallery round its drum, a turbine
     shed with a great bronze flywheel in a pit, one tall stack, a tank,
     conduits out on pylons */
  function genVent(F, K) {
    const c = shade(F.pick(ST), -0.08), tr = shade(c, -0.14), base = shade(c, -0.26);
    const RX = -5, RZ = -2;
    const rf = function (y) { return 6.0 - 0.8 * (y - 0.6) / 9; };
    F.frustum(RX, 0, RZ, 6.5, 6.3, 0.6, 0, base, 'stone', 16);
    F.frustum(RX, 0.6, RZ, 6.0, 5.2, 9, 0, c, 'stone', 16);
    [3.4, 9.3].forEach(function (y) { F.cyl(RX, y, RZ, rf(y + 0.15) + 0.1, 0.3, 0, tr, 'stone'); });
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) / 8 * TAU, sa = Math.sin(a), ca = Math.cos(a);
      F.beam(RX + sa * 6.0, 0.6, RZ + ca * 6.0, RX + sa * 5.22, 9.3, RZ + ca * 5.22, 0.7, 0.7, shade(c, -0.05), 'stone');
      F.beam(RX + sa * rf(4.6), 4.6, RZ + ca * rf(4.6), RX + sa * 6.35, 5.25, RZ + ca * 6.35, 0.3, 0.3, shade(c, -0.1), 'stone');
    }
    /* gauge gallery */
    F.cyl(RX, 5.2, RZ, 6.45, 0.22, 0, tr, 'stone');
    F.cyl(RX, 6.25, RZ, 6.4, 0.06, 0, IRON, 'metal');
    for (let i = 0; i < 24; i++) {
      const a = i / 24 * TAU;
      F.rod(RX + Math.sin(a) * 6.38, 5.42, RZ + Math.cos(a) * 6.38, RX + Math.sin(a) * 6.38, 6.3, RZ + Math.cos(a) * 6.38, 0.03, IRON, 'metal');
    }
    for (let i = 0; i < 16; i++) {
      const a = (i + 0.5) / 16 * TAU, r = rf(6.1) + 0.03;
      F.box(RX + Math.sin(a) * r, 5.7, RZ + Math.cos(a) * r, 0.9, 0.9, 0.2, a, i % 3 ? 0xffc27a : 0x9fe8b0, 'glow');
      F.box(RX + Math.sin(a) * (r + 0.05), 5.62, RZ + Math.cos(a) * (r + 0.05), 1.05, 0.1, 0.2, a, BRASS, 'metal');
    }
    /* slit windows between the ribs, the iron door, base vents leaking steam */
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      [[1.8, 1.6], [7.2, 1.6]].forEach(function (q) {
        if (i === 0 && q[0] < 5) return;
        const r = rf(q[0] + 0.8) + 0.02;
        F.box(RX + Math.sin(a) * r, q[0], RZ + Math.cos(a) * r, 0.5, q[1], 0.3, a, DARK, 'wood');
        F.box(RX + Math.sin(a) * (r + 0.05), q[0] - 0.2, RZ + Math.cos(a) * (r + 0.05), 0.8, 0.2, 0.4, a, tr, 'stone');
      });
    }
    K.door(RX, 0.6, RZ + rf(2.0) + 0.05, 0, 2.2, 2.8, c, { arch: true, leaf: IRON, leafFam: 'metal', steps: 2 });
    [2.2, 4.0].forEach(function (a) {
      const r = 6.3;
      F.box(RX + Math.sin(a) * r, 0.1, RZ + Math.cos(a) * r, 1.2, 0.5, 0.3, a, DARK, 'wood');
      F.blob(RX + Math.sin(a) * (r + 0.5), 0.7, RZ + Math.cos(a) * (r + 0.5), 0.6, 1.2, 0, STEAM, 'steam');
      F.blob(RX + Math.sin(a) * (r + 0.9), 1.5, RZ + Math.cos(a) * (r + 0.9), 0.75, 1.2, 1, shade(STEAM, 0.03), 'steam');
    });
    /* dome, bronze ribs, lantern vent */
    F.cyl(RX, 9.6, RZ, 5.3, 0.35, 0, tr, 'stone');
    F.dome(RX, 9.95, RZ, 5.1, 3.8, 0, shade(c, 0.05), 'dome');
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU, sa = Math.sin(a), ca = Math.cos(a);
      let prev = null;
      for (let k = 0; k <= 5; k++) {
        const t = k / 5 * 1.3;
        const pt = [RX + sa * 5.14 * Math.cos(t), 9.95 + 3.84 * Math.sin(t), RZ + ca * 5.14 * Math.cos(t)];
        if (prev) F.rod(prev[0], prev[1], prev[2], pt[0], pt[1], pt[2], 0.14, BRONZE, 'metal');
        prev = pt;
      }
    }
    F.cyl(RX, 13.4, RZ, 0.95, 1.3, 0, BRONZE, 'metal');
    F.cone(RX, 14.7, RZ, 1.3, 0.8, 0, shade(BRONZE, -0.15), 'metal');
    F.blob(RX + 0.3, 15.6, RZ, 0.9, 1.4, 0, STEAM, 'steam');
    F.blob(RX + 0.9, 16.6, RZ + 0.2, 1.1, 1.6, 1, shade(STEAM, 0.03), 'steam');

    /* turbine shed */
    const SX = 6, SZ = -2;
    F.box(SX, 0, SZ, 10.6, 0.5, 7.6, 0, base, 'stone');
    F.box(SX, 0.5, SZ, 10, 7, 7, 0, shade(c, 0.03), 'stone');
    K.band(SX, SZ, 10, 7, 3.6, 0.25, 0.3, tr);
    K.band(SX, SZ, 10, 7, 7.1, 0.4, 0.5, tr);
    K.parapet(SX, SZ, 10, 7, 7.5, 0.7, 0.35, c);
    F.box(SX + 0.5, 7.5, SZ, 7, 1.6, 2.6, 0, shade(c, 0.05), 'stone');
    F.box(SX + 0.5, 9.1, SZ, 7.5, 0.25, 3.1, 0, tr, 'stone');
    for (let i = 0; i < 6; i++) {
      [0, 1].forEach(function (s) { K.fb(SX - 2.3 + i * 1.15, 7.8, SZ + (s ? -1.3 : 1.3), s, 0.05, 0.75, 0.9, 0.12, DARK, 'wood'); });
    }
    K.row(SX, 2.2, 1.5, 0, [-2.5, 2.5], 1.8, 3.2, c, { arch: true, mull: IRON });
    K.door(SX, 0.5, 1.5, 0, 1.8, 2.8, c, { leaf: IRON, leafFam: 'metal', steps: 1, lamp: -1 });
    K.row(SX, 2.4, -5.5, 1, [-2.5, 0, 2.5], 1.4, 2.8, c, { arch: true, mull: IRON });
    K.row(11, 4.6, SZ, 2, [-2.4, 2.4], 1.0, 1.4, c, {});
    F.cyl(SX - 2, 7.5, SZ - 2.6, 0.4, 1.1, 0, IRON, 'metal');
    F.cone(SX - 2, 8.6, SZ - 2.6, 0.7, 0.5, 0, IRON, 'metal');
    /* great bronze flywheel in a pit off the east end */
    const WX = 12.9, WY = 3.3;
    F.box(WX, 0, SZ, 1.8, 0.8, 7.0, 0, base, 'stone');
    F.box(WX, 0.8, SZ, 1.9, 0.12, 7.1, 0, tr, 'stone');
    F.rod(WX - 0.28, WY, SZ, WX + 0.28, WY, SZ, 3.0, BRONZE, 'metal');
    F.rod(WX - 0.32, WY, SZ, WX + 0.32, WY, SZ, 2.5, shade(BRONZE, -0.35), 'metal');
    [-1, 1].forEach(function (k) {
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * TAU;
        F.beam(WX + k * 0.36, WY + Math.cos(a) * 0.5, SZ + Math.sin(a) * 0.5, WX + k * 0.36, WY + Math.cos(a) * 2.55, SZ + Math.sin(a) * 2.55, 0.12, 0.4, BRASS, 'metal');
      }
      F.rod(WX + k * 0.3, WY, SZ, WX + k * 0.5, WY, SZ, 0.6, BRASS, 'metal');
    });
    F.rod(11, WY, SZ, 14.4, WY, SZ, 0.28, IRON, 'metal');
    K.fd(11, WY, SZ, 2, 0.12, 0.7, 0.24, BRONZE, 'metal');
    F.box(14.3, 0, SZ, 0.9, WY - 0.2, 1.3, 0, shade(c, -0.1), 'stone');
    F.box(14.3, WY - 0.3, SZ, 0.7, 0.7, 0.9, 0, IRON, 'metal');
    [[WX - 1.1, SZ - 3.6], [WX + 1.1, SZ - 3.6], [WX - 1.1, SZ + 3.6], [WX + 1.1, SZ + 3.6]].forEach(function (p) {
      F.rod(p[0], 0, p[1], p[0], 1.1, p[1], 0.05, IRON, 'metal');
    });
    [-1, 1].forEach(function (k) {
      F.rod(WX - 1.1, 1.05, SZ + k * 3.6, WX + 1.1, 1.05, SZ + k * 3.6, 0.04, IRON, 'metal');
      F.rod(WX + k * 1.1, 1.05, SZ - 3.6, WX + k * 1.1, 1.05, SZ + 3.6, 0.04, IRON, 'metal');
    });
    /* pipes from the rotunda up and over onto the shed roof */
    [0.75, 1.05].forEach(function (a, i) {
      const px = RX + Math.sin(a) * 6.35, pz = RZ + Math.cos(a) * 6.35, top = 10.4 + i * 0.6;
      F.rod(px, 0.6, pz, px, top, pz, 0.26, BRASS, 'metal');
      F.ball(px, top, pz, 0.3, BRASS, 'metal');
      F.rod(px, top, pz, 3.2 + i * 0.7, top, pz, 0.26, BRASS, 'metal');
      F.ball(3.2 + i * 0.7, top, pz, 0.3, BRASS, 'metal');
      F.rod(3.2 + i * 0.7, top, pz, 3.2 + i * 0.7, 7.5, pz, 0.26, BRASS, 'metal');
      F.rod(3.2 + i * 0.7, 7.5, pz, 3.2 + i * 0.7, 7.9, pz, 0.4, BRONZE, 'metal');
      F.rod(px - 0.4, 3.0, pz, px + 0.4, 3.0, pz, 0.36, BRONZE, 'metal');
    });
    /* stack and flue */
    const TX = -5, TZ = -10.3;
    F.box(TX, 0, TZ, 3.0, 2.0, 3.0, 0, base, 'stone');
    F.frustum(TX, 2.0, TZ, 1.3, 1.0, 20, Math.PI / 8, shade(c, -0.05), 'stone', 8);
    [6, 11, 16, 21].forEach(function (y) { F.cyl(TX, y, TZ, 1.3 - 0.3 * (y - 2) / 20 + 0.08, 0.3, 0, BRONZE, 'metal'); });
    F.cyl(TX, 22, TZ, 1.15, 0.5, 0, IRON, 'metal');
    F.box(TX, 3.0, -8.6, 1.4, 1.8, 2.2, 0, IRON, 'metal');
    [[0.1, 1.0, 0, 0.85, 1.5], [0.5, 2.0, 0.2, 1.1, 1.9], [1.1, 3.1, 0.45, 1.35, 2.3], [1.9, 4.0, 0.7, 1.5, 2.4]].forEach(function (b, k) {
      F.blob(TX + b[0], 22.5 + b[1], TZ + b[2], b[3], b[4], k, shade(STEAM, -0.04 + k * 0.025), 'steam');
    });
    /* tank */
    const QX = -12.3, QZ = 4.4;
    F.cyl(QX, 0, QZ, 2.4, 0.4, 0, base, 'stone');
    F.cyl(QX, 0.4, QZ, 2.2, 4.4, 0, shade(BRONZE, -0.08), 'metal');
    [1.4, 2.8, 4.2].forEach(function (y) { F.cyl(QX, y, QZ, 2.27, 0.15, 0, IRON, 'metal'); });
    F.cone(QX, 4.8, QZ, 2.35, 0.9, 0, BRASS, 'metal');
    {
      const vx = RX - QX, vz = RZ - QZ, L = Math.hypot(vx, vz), ux = vx / L, uz = vz / L;
      F.rod(QX + ux * 2.1, 1.6, QZ + uz * 2.1, QX + ux * (L - 5.8), 1.6, QZ + uz * (L - 5.8), 0.3, BRASS, 'metal');
      F.rod(QX + ux * 3.0, 1.6, QZ + uz * 3.0, QX + ux * 3.3, 1.6, QZ + uz * 3.3, 0.45, BRONZE, 'metal');
      F.box(QX + ux * 3.15, 0, QZ + uz * 3.15, 0.5, 1.2, 0.5, 0, shade(c, -0.1), 'stone');
    }
    /* conduits out to the front on two pylons, down into a valve pit */
    [9.9, 10.6].forEach(function (x) {
      F.rod(x, 5.9, 1.5, x, 5.9, 10.4, 0.26, BRASS, 'metal');
      F.rod(x, 5.9, 1.5, x, 5.9, 1.85, 0.38, BRONZE, 'metal');
      F.ball(x, 5.9, 10.4, 0.29, BRASS, 'metal');
      F.rod(x, 5.9, 10.4, x, 0.9, 10.4, 0.26, BRASS, 'metal');
    });
    [5.2, 8.6].forEach(function (z) {
      F.box(10.25, 0, z, 1.8, 0.4, 1.8, 0, base, 'stone');
      F.frustum(10.25, 0, z, 0.7, 0.5, 5.2, 0, shade(c, 0.02), 'stone', 4);
      F.box(10.25, 5.2, z, 2.4, 0.45, 0.8, 0, tr, 'stone');
      [9.2, 11.3].forEach(function (x) {
        F.box(x, 5.65, z, 0.35, 0.4, 0.6, 0, tr, 'stone');
        F.hipRoof(x, 6.05, z, 0.5, 0.4, 0.8, 0, shade(c, -0.25), 'roof');
      });
    });
    F.box(10.25, 0, 10.5, 2.4, 0.9, 1.4, 0, base, 'stone');
    F.box(10.25, 0.9, 10.5, 2.6, 0.15, 1.6, 0, tr, 'stone');
    K.barrel(-1.2, 0, 5.4, 0.45, 1.1); K.barrel(-0.3, 0, 5.8, 0.45, 1.1);
    K.crate(3.6, 0, 3.4, 1.0, 0.25); K.crate(4.3, 0, 4.6, 0.8, -0.2);
    K.jar(-10.0, 0, 7.4, 0.4, 0x6a6458);
  }

  /* ============================================================= FARMHOUSE */

  /* v0 — Velothi farmstead: battered domed house, walled yard, granaries,
     guar pen and shelter, a stair up to a shaded roof terrace */
  function farmVelothi(F, K) {
    const c = F.pick(POOR), tr = shade(c, -0.14), base = shade(c, -0.26);
    const domeC = F.pick([0xb0a682, 0x9d9379, 0xa8a08a, 0x93886d]);
    const HX = -3, HZ = -2, HH = 6.6;
    const hf = function (y) { return 4.5 - 0.6 * y / HH; };
    F.frustum(HX, 0, HZ, 4.8, 4.55, 0.5, 0, base, 'stone', 4);
    F.frustum(HX, 0, HZ, 4.5, 3.9, HH, 0, c, 'stone', 4);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      F.beam(HX + p[0] * 4.45, 0.3, HZ + p[1] * 4.45, HX + p[0] * 3.85, HH, HZ + p[1] * 3.85, 0.5, 0.5, shade(c, -0.05), 'stone');
    });
    F.box(HX, 3.3, HZ, 2 * hf(3.4) + 0.3, 0.25, 2 * hf(3.4) + 0.3, 0, tr, 'stone');
    F.box(HX, HH, HZ, 8.2, 0.3, 8.2, 0, tr, 'stone');
    const R = HH + 0.3;
    K.run(-6.9, -5.9, 0.9, -5.9, R, 0.7, 0.3, c);
    K.run(-6.9, 1.9, 0.9, 1.9, R, 0.7, 0.3, c);
    K.run(-6.9, -5.9, -6.9, 1.9, R, 0.7, 0.3, c);
    K.run(0.9, -2.9, 0.9, 1.9, R, 0.7, 0.3, c);
    K.run(0.9, -5.9, 0.9, -4.6, R, 0.7, 0.3, c);
    F.cyl(HX, R, -3.0, 2.3, 0.6, 0, shade(c, 0.04), 'stone');
    F.cyl(HX, R + 0.5, -3.0, 2.38, 0.15, 0, tr, 'stone');
    F.dome(HX, R + 0.6, -3.0, 2.3, 2.0, 0, domeC, 'dome');
    F.cone(HX, R + 2.5, -3.0, 0.2, 0.7, 0, shade(domeC, -0.25), 'stone');
    [0.5, 2.1, 3.7, 5.3].forEach(function (a) {
      F.box(HX + Math.sin(a) * 2.32, R, -3.0 + Math.cos(a) * 2.32, 0.4, 0.45, 0.2, a, DARK, 'wood');
    });

    /* front door with little capped pylons, slit windows round the house */
    const dz = HZ + hf(1.2);
    K.door(HX, 0, dz, 0, 1.3, 2.2, c, { arch: true, lamp: 1 });
    [-1, 1].forEach(function (s) {
      F.frustum(HX + s * 1.75, 0, dz + 0.55, 0.38, 0.28, 2.8, 0, shade(c, -0.05), 'stone', 4);
      F.cone(HX + s * 1.75, 2.8, dz + 0.55, 0.36, 0.6, 0, shade(c, -0.25), 'stone');
    });
    function bw(s, u, y, ww, wh, o) {
      const n = K.nrm(s), f = hf(y + wh / 2) + 0.02, p = K.along(HX + n[0] * f, HZ + n[1] * f, s, u);
      K.win(p[0], y, p[1], s, ww, wh, c, o || {});
    }
    bw(0, -2.3, 4.0, 0.6, 1.3); bw(0, 2.1, 4.0, 0.6, 1.3); bw(0, 2.2, 1.2, 0.6, 1.2, { shut: true });
    bw(1, -1.8, 1.4, 0.6, 1.3); bw(1, 1.8, 1.4, 0.6, 1.3); bw(1, 0, 4.2, 0.6, 1.2);
    bw(3, -2.0, 1.4, 0.6, 1.3, { shut: true }); bw(3, 2.0, 1.4, 0.6, 1.3); bw(3, 0, 4.2, 0.6, 1.2);
    bw(2, -3.2, 1.4, 0.6, 1.2);

    /* stair up the east face to the roof, balustrade on its outer edge */
    for (let i = 0; i < 22; i++) {
      const top = (i + 1) * R / 22, z = 2.3 - (i + 0.5) * 0.27;
      const x0 = HX + hf(top) - 0.05, x1 = 2.9;
      F.box((x0 + x1) / 2, 0, z, x1 - x0, top, 0.27, 0, i % 2 ? shade(c, -0.06) : shade(c, -0.02), 'stone');
    }
    F.beam(2.75, 0.8, 2.3, 2.75, R + 0.8, 2.3 - 22 * 0.27, 0.25, 0.25, tr, 'stone');
    F.box(HX + hf(R) + 0.9, R - 0.3, -3.75, 1.9, 0.3, 1.3, 0, shade(c, -0.06), 'stone');

    /* roof terrace: awning over drying racks, jars */
    K.awning(-6.6, -0.6, 0.6, 1.6, R, 2.2, F.pick(SAIL), { drop: 0.3 });
    [-5.5, -3.8, -2.1].forEach(function (x, i) {
      F.rod(x - 0.6, R, 0.5, x - 0.6, R + 1.4, 0.5, 0.04, TIMBER, 'wood');
      F.rod(x + 0.6, R, 0.5, x + 0.6, R + 1.4, 0.5, 0.04, TIMBER, 'wood');
      F.rod(x - 0.6, R + 1.35, 0.5, x + 0.6, R + 1.35, 0.5, 0.04, TIMBER, 'wood');
      for (let k = 0; k < 4; k++) F.box(x - 0.45 + k * 0.3, R + 0.75, 0.5, 0.12, 0.6, 0.12, 0, i === 1 ? 0x9a3a28 : HAY, 'crop');
    });
    K.jar(-0.3, R, 0.9, 0.35); K.jar(-0.1, R, -5.2, 0.3, 0x7a6a4a); K.jar(-6.2, R, -5.3, 0.32);
    K.sack(-6.2, R, -4.4);

    /* walled yard with a gate */
    const wc = shade(c, 0.03);
    K.wall(-10, -8.5, 10, -8.5, 1.9, 0.5, wc);
    K.wall(-10, -8.5, -10, 10, 1.9, 0.5, wc);
    K.wall(10, -8.5, 10, 10, 1.9, 0.5, wc);
    K.wall(-10, 10, -0.3, 10, 1.9, 0.5, wc);
    K.wall(3.3, 10, 10, 10, 1.9, 0.5, wc);
    [-0.6, 3.6].forEach(function (x) {
      F.frustum(x, 0, 10, 0.5, 0.38, 2.6, 0, shade(c, -0.04), 'stone', 4);
      F.cone(x, 2.6, 10, 0.45, 0.7, 0, shade(c, -0.25), 'stone');
    });
    F.box(0.3, 0.1, 9.35, 1.1, 1.6, 0.1, 0.5, 0x5a4028, 'wood');
    F.box(2.8, 0.1, 9.3, 1.1, 1.6, 0.1, -0.6, 0x5a4028, 'wood');
    [-5, 0, 5].forEach(function (z) {
      F.box(-10, 0, z, 0.8, 2.1, 0.8, 0, shade(wc, -0.05), 'stone');
      F.box(10, 0, z, 0.8, 2.1, 0.8, 0, shade(wc, -0.05), 'stone');
    });
    [-6, -2, 3, 7].forEach(function (x) {
      F.box(x, 0, -8.5, 0.8, 2.1, 0.8, 0, shade(wc, -0.05), 'stone');
      if (x < -1 || x > 4) F.box(x, 0, 10, 0.8, 2.1, 0.8, 0, shade(wc, -0.05), 'stone');
    });

    /* granaries */
    [[6.5, -5, 2.0, 3.8], [8.1, -1.1, 1.3, 3.0]].forEach(function (g) {
      F.frustum(g[0], 0, g[1], g[2], g[2] * 0.85, g[3], 0, shade(c, 0.05), 'stone', 12);
      F.cyl(g[0], g[3], g[1], g[2] * 0.88, 0.25, 0, tr, 'stone');
      F.dome(g[0], g[3] + 0.25, g[1], g[2] * 0.88, g[2] * 0.75, 0, domeC, 'dome');
      F.cone(g[0], g[3] + 0.2 + g[2] * 0.75, g[1], 0.15, 0.4, 0, shade(domeC, -0.25), 'stone');
      const a = -2.3, r = g[2] * 0.9;
      F.box(g[0] + Math.sin(a) * r, g[3] * 0.55, g[1] + Math.cos(a) * r, 0.7, 0.9, 0.3, a, LEAFC, 'wood');
    });
    {
      const a = -2.3, hx = 6.5 + Math.sin(a) * 2.2, hz = -5 + Math.cos(a) * 2.2;
      [-0.25, 0.25].forEach(function (d) {
        F.rod(hx - 0.9 + d * 0.7, 0, hz - 0.5 - d * 0.7, hx + d * 0.7, 2.3, hz - d * 0.7 + 0.1, 0.04, TIMBER, 'wood');
      });
      for (let k = 1; k < 5; k++) {
        const t = k / 5;
        F.rod(hx - 0.9 * (1 - t) - 0.18, 2.3 * t, hz - 0.5 * (1 - t) + 0.17, hx - 0.9 * (1 - t) + 0.18, 2.3 * t, hz - 0.5 * (1 - t) - 0.17, 0.03, TIMBER, 'wood');
      }
    }

    /* guar pen: fence, lean-to shelter, trough, hay, guar */
    for (let i = 0; i <= 4; i++) {
      F.rod(3.5, 0, 2.5 + i * 1.75, 3.5, 1.4, 2.5 + i * 1.75, 0.09, TIMBER, 'wood');
      F.rod(3.5 + i * 1.5, 0, 2.5, 3.5 + i * 1.5, 1.4, 2.5, 0.09, TIMBER, 'wood');
    }
    [0.7, 1.25].forEach(function (y) {
      F.rod(3.5, y, 2.5, 3.5, y, 9.75, 0.05, TIMBER, 'wood');
      F.rod(3.5, y, 2.5, 9.75, y, 2.5, 0.05, TIMBER, 'wood');
    });
    [4.6, 9.2].forEach(function (z) { F.rod(7.2, 0, z, 7.2, 2.05, z, 0.1, TIMBER, 'wood'); });
    F.beam(9.75, 2.35, 6.9, 7.0, 2.0, 6.9, 0.15, 5.2, F.pick(REED), 'cloth');
    F.box(8.7, 0, 3.4, 1.8, 0.6, 0.7, 0, tr, 'stone');
    F.box(8.7, 0.45, 3.4, 1.5, 0.12, 0.45, 0, WATER, 'water');
    F.blob(8.6, 0.4, 8.2, 0.9, 0.8, 0, HAY, 'crop');
    F.blob(8.9, 0.3, 7.2, 0.7, 0.6, 0.6, shade(HAY, -0.05), 'crop');
    K.guar(5.6, 6.0, 2.6);

    /* yard: well, jars, a cart, a fruit tree, saltrice sacks */
    F.cyl(-7.6, 0, 6.2, 0.9, 0.8, 0, tr, 'stone');
    F.cyl(-7.6, 0.05, 6.2, 0.7, 0.77, 0, WATER, 'water');
    [-1, 1].forEach(function (s) { F.rod(-7.6 + s * 0.85, 0.8, 6.2, -7.6 + s * 0.85, 2.1, 6.2, 0.07, TIMBER, 'wood'); });
    F.rod(-8.6, 2.0, 6.2, -6.6, 2.0, 6.2, 0.06, TIMBER, 'wood');
    F.tree(-4.5, 7.6, 'olive', 4.6);
    F.box(-2.0, 0.45, 5.4, 1.6, 0.15, 2.4, 0, TIMBER, 'wood');
    [-1, 1].forEach(function (s) { F.rod(-2.0 + s * 0.9, 0.5, 5.0, -2.0 + s * 0.98, 0.5, 5.0, 0.5, 0x5a4630, 'wood'); });
    F.rod(-2.0, 0.55, 6.6, -2.0, 0.1, 8.2, 0.05, TIMBER, 'wood');
    K.sack(-2.2, 0.6, 5.6); K.sack(-1.8, 0.6, 4.8, 0x9a8a6a);
    K.jar(-7.4, 0, 2.8, 0.4); K.jar(-8.2, 0, 3.4, 0.35, 0x7a6a4a); K.jar(-7.9, 0, 2.2, 0.3);
    K.jar(2.3, 0, -7.4, 0.35);
  }

  /* v1 — chinampa farmhouse on the lake beds: house on a stone-faced mound,
     net shed on piles, landing jetty with a reed boat, drying racks,
     fish traps and a reed shade */
  function farmChinampa(F, K) {
    const c = F.pick(POOR), tr = shade(c, -0.14), mud = F.pick(MUD), reed = F.pick(REED);
    F.box(0, 0, 0, 24, 0.05, 22, 0, WATER, 'water');

    /* raised beds */
    [[-9.25, 4.5], [-3.5, 4.0]].forEach(function (b) {
      const x = b[0], w = b[1], z0 = -10.5, z1 = 10;
      F.box(x, 0, (z0 + z1) / 2, w, 0.5, z1 - z0, 0, mud, 'soil');
      [-1, 1].forEach(function (s) {
        F.box(x + s * (w / 2 - 0.06), 0, (z0 + z1) / 2, 0.14, 0.62, z1 - z0, 0, shade(reed, -0.15), 'reed');
        for (let z = z0 + 1; z < z1; z += 2.4) F.rod(x + s * (w / 2 + 0.02), 0, z, x + s * (w / 2 + 0.02), 0.85, z, 0.06, TIMBER, 'wood');
      });
      for (let k = 0; k < Math.floor(w / 0.75) - 1; k++) {
        const rx = x - w / 2 + 0.7 + k * 0.75, cc = F.pick(CROP);
        F.box(rx, 0.5, (z0 + z1) / 2 - 1.0, 0.35, 0.28, z1 - z0 - 3.5, 0, cc, 'crop');
        for (let z = z0 + 1.2; z < z1 - 2.8; z += 1.3) F.blob(rx, 0.85, z, 0.24, 0.32, 0, shade(cc, 0.06), 'crop');
      }
      F.tree(x - w / 2 + 0.4, z1 - 0.6, 'olive', 4.4, 0.5);
      K.crate(x + 0.6, 0.5, z1 - 1.4, 0.55, 0.3);
    });
    F.box(-6.75, 0.5, 5.0, 1.8, 0.12, 1.0, 0, shade(TIMBER, 0.08), 'wood');
    F.beam(-1.4, 0.55, -5.0, 0.6, 1.3, -5.0, 0.12, 1.0, shade(TIMBER, 0.08), 'wood');

    /* mound with a stone retaining face */
    const MX = 5.75, MZ = -5.75;
    F.box(MX, 0, MZ, 11.5, 1.3, 9.5, 0, c, 'stone');
    K.band(MX, MZ, 11.5, 9.5, 1.15, 0.15, 0.3, tr);
    F.box(MX, 1.25, MZ, 11.0, 0.08, 9.0, 0, shade(mud, 0.06), 'soil');
    [2.0, 5.2, 8.4].forEach(function (x) { K.fb(x, 0, -1.0, 0, 0.12, 0.5, 1.3, 0.25, shade(c, -0.08), 'stone'); });
    for (let i = 0; i < 4; i++) F.box(0.9 - 0.25, i * 0.32, -1.0 + 0.45 - i * 0.0, 0.9, 0.32, 0.9 - i * 0.2, 0, shade(c, -0.1), 'stone');

    /* house */
    const hx = 6.5, hz = -6.5, Y = 1.3, HT = 4.9;
    F.box(hx, Y, hz, 7, HT - Y, 6, 0, shade(c, 0.04), 'stone');
    K.band(hx, hz, 7, 6, HT - 0.3, 0.3, 0.45, tr);
    K.run(3.2, -3.7, 9.8, -3.7, HT, 0.6, 0.3, c);
    K.run(3.2, -9.3, 9.8, -9.3, HT, 0.6, 0.3, c);
    K.run(9.8, -9.3, 9.8, -3.7, HT, 0.6, 0.3, c);
    K.run(3.2, -9.3, 3.2, -5.2, HT, 0.6, 0.3, c);
    K.door(7.2, Y, -3.5, 0, 1.2, 2.2, c, {});
    K.row(hx, Y + 1.1, -3.5, 0, [-2.2, 2.3], 0.9, 1.1, c, { shut: true, shutC: 0x46603f });
    K.row(hx, Y + 1.1, -9.5, 1, [-2, 0.8], 0.9, 1.1, c, {});
    K.row(10, Y + 1.1, hz, 2, [-1.5, 1.5], 0.9, 1.1, c, {});
    K.row(3, Y + 1.1, hz, 3, [-1.2], 0.9, 1.1, c, { shut: true, shutC: 0x46603f });
    K.drain(10.15, -3.7, Y, HT - Y, c);
    /* roof loft with its own door, reed shade over the drying terrace */
    F.box(8.3, HT, -7.8, 3.0, 2.3, 2.8, 0, shade(c, 0.07), 'stone');
    F.box(8.3, HT + 2.3, -7.8, 3.3, 0.22, 3.1, 0, tr, 'stone');
    K.door(6.8, HT, -7.8, 3, 0.9, 1.75, c, {});
    K.win(8.6, HT + 0.9, -6.4, 0, 0.7, 0.8, c, {});
    K.win(9.8, HT + 0.9, -7.8, 2, 0.7, 0.8, c, {});
    [[3.6, -9.0], [6.2, -9.0], [3.6, -4.0], [6.2, -4.0]].forEach(function (p) {
      F.rod(p[0], HT, p[1], p[0], HT + 2.0 - (p[1] > -6 ? 0.3 : 0), p[1], 0.07, TIMBER, 'wood');
    });
    F.beam(4.9, HT + 2.05, -9.2, 4.9, HT + 1.75, -3.8, 3.0, 0.12, reed, 'cloth');
    [-8.2, -6.6, -5.0].forEach(function (z) {
      F.rod(3.8, HT + 1.5, z, 6.0, HT + 1.5, z, 0.03, TIMBER, 'wood');
      for (let k = 0; k < 5; k++) F.box(4.0 + k * 0.45, HT + 0.95, z, 0.1, 0.5, 0.2, 0, 0x9aa0a0, 'fish');
    });
    /* ladder from the mound to the roof */
    [3.3, 3.9].forEach(function (x) { F.rod(x, Y, -2.8, x, HT + 0.8, -3.55, 0.05, TIMBER, 'wood'); });
    for (let k = 1; k < 12; k++) {
      const t = k / 12;
      F.rod(3.3, Y + t * (HT + 0.8 - Y), -2.8 - t * 0.75, 3.9, Y + t * (HT + 0.8 - Y), -2.8 - t * 0.75, 0.03, TIMBER, 'wood');
    }

    /* reed shade in front of the house over a gutting table */
    F.rod(4.0, Y, -1.5, 4.0, 3.5, -1.5, 0.07, TIMBER, 'wood');
    F.rod(9.5, Y, -1.5, 9.5, 3.5, -1.5, 0.07, TIMBER, 'wood');
    F.beam(6.75, 3.85, -3.5, 6.75, 3.45, -1.25, 5.9, 0.1, reed, 'cloth');
    F.box(6.75, 3.6, -3.4, 5.9, 0.12, 0.2, 0, TIMBER, 'cloth');
    F.box(5.0, Y, -2.3, 1.8, 0.8, 0.8, 0, TIMBER, 'wood');
    F.box(5.0, Y + 0.8, -2.3, 1.9, 0.08, 0.9, 0, shade(TIMBER, 0.12), 'wood');
    F.box(8.7, Y, -2.4, 2.0, 0.04, 1.4, 0, reed, 'reed');
    K.jar(9.3, Y, -2.4, 0.33); K.jar(8.4, Y, -2.7, 0.3, 0x7a6a4a);

    /* drying racks on the mound */
    [[1.4, -8.4], [1.4, -5.6]].forEach(function (r) {
      [-1.1, 1.1].forEach(function (d) {
        F.rod(r[0] - 0.4, Y, r[1] + d, r[0], Y + 2.3, r[1] + d, 0.05, TIMBER, 'wood');
        F.rod(r[0] + 0.4, Y, r[1] + d, r[0], Y + 2.3, r[1] + d, 0.05, TIMBER, 'wood');
      });
      F.rod(r[0], Y + 2.25, r[1] - 1.2, r[0], Y + 2.25, r[1] + 1.2, 0.04, TIMBER, 'wood');
      for (let k = 0; k < 6; k++) {
        F.box(r[0], Y + 1.55, r[1] - 0.9 + k * 0.36, 0.12, 0.65, 0.18, 0, k % 2 ? 0x9aa0a0 : HAY, 'fish');
      }
    });

    /* net shed on piles over the water */
    const SX = 9.25, SZ = 1.25;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) F.rod(7.2 + i * 2.05, 0, -0.8 + j * 2.05, 7.2 + i * 2.05, 1.1, -0.8 + j * 2.05, 0.13, TIMBER, 'wood');
    }
    F.box(SX, 1.05, SZ, 4.5, 0.25, 4.5, 0, shade(TIMBER, 0.08), 'wood');
    F.box(SX + 0.3, 1.3, SZ + 0.3, 3.4, 2.4, 3.0, 0, shade(c, 0.06), 'stone');
    F.hipRoof(SX + 0.3, 3.7, SZ + 0.3, 4.0, 1.2, 3.6, 0, reed, 'reed');
    K.door(SX - 1.4, 1.3, SZ + 0.3, 3, 0.9, 1.8, c, {});
    K.win(SX + 0.3, 2.3, SZ + 1.8, 0, 0.7, 0.7, c, {});
    F.rod(7.1, 1.3, 3.4, 11.4, 1.3, 3.4, 0.03, 0x6b5a3a, 'rope');
    F.box(9.25, 1.3, 3.35, 3.8, 0.9, 0.04, 0, 0x8a8468, 'net');

    /* landing jetty and a reed boat */
    for (let z = -0.5; z <= 8.5; z += 1.8) {
      [0.95, 2.45].forEach(function (x) { F.rod(x, 0, z, x, 0.85, z, 0.11, TIMBER, 'wood'); });
    }
    F.box(1.7, 0.8, 4.0, 1.8, 0.18, 10.0, 0, shade(TIMBER, 0.1), 'wood');
    F.rod(2.6, 0, 8.9, 2.6, 1.6, 8.9, 0.13, TIMBER, 'wood');
    F.box(4.0, 0.05, 5.4, 1.1, 0.35, 5.0, 0, reed, 'reed');
    [-1, 1].forEach(function (s) { F.box(4.0 + s * 0.5, 0.2, 5.4, 0.2, 0.4, 4.8, 0, shade(reed, -0.1), 'reed'); });
    F.beam(4.0, 0.25, 7.8, 4.0, 1.1, 8.6, 0.55, 0.4, shade(reed, 0.05), 'reed');
    F.beam(4.0, 0.25, 3.0, 4.0, 0.95, 2.3, 0.55, 0.4, shade(reed, 0.05), 'reed');
    F.rod(3.7, 0.5, 3.6, 4.3, 0.5, 7.2, 0.04, TIMBER, 'wood');
    F.rod(4.0, 1.0, 8.4, 2.6, 1.3, 8.9, 0.02, 0x6b5a3a, 'rope');

    /* fish traps and a stake weir */
    [[7.0, 7.5], [8.6, 8.8], [10.2, 7.2]].forEach(function (p) {
      F.cone(p[0], 0, p[1], 0.5, 1.2, 0, shade(reed, -0.08), 'reed');
      F.rod(p[0], 0, p[1] + 0.6, p[0], 1.6, p[1] + 0.6, 0.05, TIMBER, 'wood');
    });
    for (let k = 0; k < 9; k++) {
      const x = 5.6 + k * 0.75, z = 10.2 - Math.abs(k - 4) * 0.35;
      F.rod(x, 0, z, x, 1.1, z, 0.05, TIMBER, 'wood');
    }
    [[5.6, 8.8, 8.6, 10.2], [8.6, 10.2, 11.6, 8.8]].forEach(function (q) {
      const dx = q[2] - q[0], dz = q[3] - q[1];
      F.box((q[0] + q[2]) / 2, 0.15, (q[1] + q[3]) / 2, Math.hypot(dx, dz), 0.7, 0.06, -Math.atan2(dz, dx), shade(reed, -0.12), 'reed');
    });
    F.box(-1.0, 0.05, 8.0, 0.8, 0.2, 0.5, 0.3, 0xb0a070, 'float');
  }

  /* v2 — Hlaalu farmhouse: two-storey block with a roof room and an awning
     over crop-drying trays, a stone-and-timber barn with a hayloft and
     hoist, a walled kitchen garden */
  function farmHlaalu(F, K) {
    const c = F.pick(ST), tr = shade(c, -0.14), base = shade(c, -0.26);
    const P = 0.4, RT = 7.2, HXc = -7, HZc = -2;
    F.box(HXc, 0, HZc, 10.6, P, 8.6, 0, base, 'stone');
    F.box(HXc, P, HZc, 10, RT - P, 8, 0, c, 'stone');
    K.band(HXc, HZc, 10, 8, 3.8, 0.25, 0.3, shade(c, -0.08));
    K.band(HXc, HZc, 10, 8, RT - 0.35, 0.35, 0.5, tr);
    K.run(-11.8, 1.8, -2.2, 1.8, RT, 0.8, 0.4, c);
    K.run(-11.8, -5.8, -2.2, -5.8, RT, 0.8, 0.4, c);
    K.run(-2.2, -5.8, -2.2, 1.8, RT, 0.8, 0.4, c);
    K.run(-11.8, -2.9, -11.8, 1.8, RT, 0.8, 0.4, c);
    K.run(-11.8, -5.8, -11.8, -4.7, RT, 0.8, 0.4, c);
    /* front */
    K.door(-7, P, 2, 0, 1.4, 2.4, c, { steps: 1 });
    F.box(-7, 3.1, 2.7, 2.8, 0.12, 1.5, 0, shade(TIMBER, 0.1), 'wood');
    [-1, 1].forEach(function (s) { F.beam(-7 + s * 1.2, 2.3, 2.05, -7 + s * 1.2, 3.1, 3.2, 0.14, 0.14, TIMBER, 'wood'); });
    K.row(-7, 1.5, 2, 0, [-3, 3], 1.1, 1.5, c, { shut: true });
    K.row(-7, 4.6, 2, 0, [-3, 0, 3], 1.1, 1.5, c, { shut: true });
    /* back, sides */
    K.row(-7, 1.5, -6, 1, [-3, 0], 1.1, 1.4, c, {});
    K.door(-4, P, -6, 1, 1.1, 2.2, c, { steps: 1 });
    K.row(-7, 4.6, -6, 1, [-3, 0, 3], 1.1, 1.4, c, {});
    K.row(-2, 1.5, HZc, 2, [-2, 2], 1.1, 1.4, c, { shut: true });
    K.row(-2, 4.6, HZc, 2, [-2, 2], 1.1, 1.4, c, {});
    K.win(-12, 1.5, -5.2, 3, 1.0, 1.4, c, {});
    K.win(-12, 4.6, -5.2, 3, 1.0, 1.4, c, {});
    K.win(-12, 4.8, 0.9, 3, 1.0, 1.3, c, {});
    K.drain(-1.85, 1.85, P, RT - P, c);
    /* stair up the west face to the roof terrace */
    const run = K.stair(-12.7, 1.9, 0, RT, '-z', 1.3, shade(c, -0.06), { run: 0.26 });
    F.beam(-13.3, 0.9, 1.9, -13.3, RT + 0.9, 1.9 - run, 0.2, 0.2, tr, 'stone');
    F.box(-12.7, RT - 0.3, -4.3, 1.3, 0.3, 1.0, 0, shade(c, -0.06), 'stone');
    /* roof room + terrace under an awning with drying trays */
    F.box(-4.0, RT, -3.9, 3.6, 2.6, 3.6, 0, shade(c, 0.04), 'stone');
    F.box(-4.0, RT + 2.6, -3.9, 3.9, 0.25, 3.9, 0, tr, 'stone');
    K.door(-5.8, RT, -3.9, 3, 0.95, 1.9, c, {});
    K.win(-4.0, RT + 1.0, -2.1, 0, 0.8, 0.9, c, { shut: true });
    K.win(-2.2, RT + 1.0, -3.9, 2, 0.8, 0.9, c, {});
    K.chimney(-2.9, -5.2, RT + 2.85, 0.5, c);
    K.awning(-11.4, -5.4, -6.2, 1.4, RT, 2.4, F.pick(SAIL), { drop: 0.35, stripe: F.pick(BANNER) });
    [[-9.9, -3.6], [-7.7, -3.6], [-9.9, -0.6], [-7.7, -0.6]].forEach(function (p, i) {
      [-0.8, 0.8].forEach(function (d) {
        [-0.5, 0.5].forEach(function (e) { F.rod(p[0] + d, RT, p[1] + e, p[0] + d, RT + 0.7, p[1] + e, 0.03, TIMBER, 'wood'); });
      });
      F.box(p[0], RT + 0.7, p[1], 1.8, 0.08, 1.2, 0, TIMBER, 'wood');
      F.box(p[0], RT + 0.78, p[1], 1.65, 0.06, 1.05, 0, [0x9a3a28, 0xc9a24a, 0x6b7a3a, 0xb05a2a][i], 'crop');
    });
    F.rod(-11.3, RT + 1.9, 0.9, -6.3, RT + 1.9, 0.9, 0.03, 0x6b5a3a, 'rope');
    for (let k = 0; k < 7; k++) F.box(-10.8 + k * 0.7, RT + 1.3, 0.9, 0.18, 0.6, 0.18, 0, k % 2 ? 0x9a3a28 : HAY, 'crop');
    K.jar(-6.6, RT, -5.1, 0.3); K.sack(-11.0, RT, -5.0); K.sack(-10.4, RT, -5.2, 0x9a8a6a);

    /* barn: stone ground storey, timber hayloft, hipped green roof */
    const BX = 7, BZ = -2.5, bc = shade(c, -0.03), wood = 0x6a5438;
    F.box(BX, 0, BZ, 10.4, 0.35, 11.4, 0, base, 'stone');
    F.box(BX, 0.35, BZ, 10, 4.0, 11, 0, bc, 'stone');
    F.box(BX, 4.35, BZ, 10.2, 0.25, 11.2, 0, tr, 'stone');
    F.box(BX, 4.6, BZ, 9.8, 2.6, 10.8, 0, wood, 'wood');
    for (let k = 0; k < 11; k++) {
      const x = BX - 4.5 + k * 0.9;
      F.box(x, 4.6, BZ + 5.43, 0.12, 2.6, 0.08, 0, shade(wood, -0.18), 'wood');
      F.box(x, 4.6, BZ - 5.43, 0.12, 2.6, 0.08, 0, shade(wood, -0.18), 'wood');
    }
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      F.box(BX + p[0] * 4.85, 4.6, BZ + p[1] * 5.35, 0.3, 2.6, 0.3, 0, shade(wood, -0.25), 'wood');
    });
    const roofC = F.pick([0x6b7a4a, 0x6b7a4a, 0xb35a3a, 0xa04f32]);
    F.hipRoof(BX, 7.2, BZ, 11.4, 3.0, 12.4, 0, roofC, 'roof');
    F.box(BX, 9.5, BZ, 1.0, 0.8, 1.0, 0, wood, 'wood');
    F.pyrRoof(BX, 10.3, BZ, 1.4, 0.6, 1.4, 0, shade(roofC, -0.1), 'roof');
    K.door(BX, 0.35, 3.0, 0, 3.4, 3.2, bc, {});
    K.fb(BX + 0.9, 0.35, 3.0, 0, 0.42, 0.06, 3.2, 0.04, DARK, 'wood');
    F.beam(BX - 1.7, 0.4, 3.45, BX + 1.7, 3.5, 3.45, 0.14, 0.05, shade(LEAFC, 0.15), 'wood');
    K.fb(BX, 4.8, 3.0, 0, 0.06, 1.8, 1.8, 0.14, DARK, 'wood');
    F.box(BX - 1.5, 4.8, 3.55, 0.08, 1.8, 0.9, 0.5, LEAFC, 'wood');
    F.blob(BX, 5.0, 2.9, 0.8, 0.8, 0, HAY, 'crop');
    F.box(BX, 7.0, 4.0, 0.3, 0.3, 2.3, 0, TIMBER, 'wood');
    F.rod(BX, 6.8, 4.9, BX, 6.8, 5.0, 0.2, IRON, 'metal');
    F.rod(BX, 6.8, 5.05, BX, 3.3, 5.05, 0.02, 0x6b5a3a, 'rope');
    F.box(BX, 2.7, 5.05, 1.0, 0.6, 0.6, 0, HAY, 'crop');
    K.row(12, 1.8, BZ, 2, [-3.5, 0, 3.5], 0.3, 1.4, bc, { sill: false });
    K.row(2, 1.8, BZ, 3, [-3.5, 0, 3.5], 0.3, 1.4, bc, { sill: false });
    K.row(12, 5.3, BZ, 2, [-2.5, 2.5], 0.9, 0.9, wood, { frame: false, sill: false, lintel: false });
    K.row(2, 5.3, BZ, 3, [-2.5, 2.5], 0.9, 0.9, wood, { frame: false, sill: false, lintel: false });
    K.door(BX + 2.5, 0.35, -8.0, 1, 1.2, 2.3, bc, {});
    K.fb(BX - 2, 5.0, -8.0, 1, 0.06, 1.4, 1.4, 0.12, DARK, 'wood');
    /* hay bales, cart, trough */
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3 - i; j++) F.box(10.9, i * 0.55, 4.5 + j * 1.05 + i * 0.5, 1.2, 0.55, 1.0, 0, shade(HAY, i * 0.04 - 0.04), 'crop');
    }
    F.box(0.2, 0.55, 5.6, 1.7, 0.15, 2.8, 0, TIMBER, 'wood');
    [-1, 1].forEach(function (s) {
      F.box(0.2 + s * 0.8, 0.7, 5.6, 0.08, 0.5, 2.8, 0, TIMBER, 'wood');
      F.rod(0.2 + s * 0.95, 0.55, 5.4, 0.2 + s * 1.05, 0.55, 5.4, 0.55, 0x5a4630, 'wood');
    });
    F.rod(-0.1, 0.6, 7.0, -0.2, 0.15, 8.4, 0.05, TIMBER, 'wood');
    F.rod(0.5, 0.6, 7.0, 0.6, 0.15, 8.4, 0.05, TIMBER, 'wood');
    F.blob(0.2, 1.1, 5.6, 0.8, 0.7, 0, HAY, 'crop');
    F.box(12.6, 0, -4.0, 0.8, 0.7, 2.4, 0, tr, 'stone');
    F.box(12.6, 0.55, -4.0, 0.6, 0.12, 2.2, 0, WATER, 'water');

    /* kitchen garden in front of the house */
    const gc = shade(c, 0.02);
    K.wall(-12, 2.6, -12, 10.6, 0.9, 0.35, gc);
    K.wall(-2.2, 2.6, -2.2, 10.6, 0.9, 0.35, gc);
    K.wall(-12, 10.6, -7.9, 10.6, 0.9, 0.35, gc);
    K.wall(-6.1, 10.6, -2.2, 10.6, 0.9, 0.35, gc);
    [-7.9, -6.1].forEach(function (x) { F.box(x, 0, 10.6, 0.5, 1.3, 0.5, 0, tr, 'stone'); });
    F.box(-7, 0, 6.3, 1.4, 0.04, 8.0, 0, shade(base, 0.2), 'stone');
    [[-9.8, 4.4], [-9.8, 8.4], [-4.3, 4.4], [-4.3, 8.4]].forEach(function (b) {
      F.box(b[0], 0, b[1], 3.6, 0.3, 3.0, 0, shade(TIMBER, 0.05), 'wood');
      F.box(b[0], 0.05, b[1], 3.4, 0.3, 2.8, 0, F.pick(MUD), 'soil');
      const cc = F.pick(CROP);
      for (let r = 0; r < 3; r++) {
        for (let k = 0; k < 4; k++) F.blob(b[0] - 1.2 + k * 0.8, 0.5, b[1] - 0.9 + r * 0.9, 0.28, 0.4, 0, shade(cc, F.rr(-0.05, 0.08)), 'crop');
      }
    });
    F.rod(-4.3, 0.3, 8.4, -4.3, 1.9, 8.4, 0.05, TIMBER, 'wood');
    F.rod(-4.9, 1.5, 8.4, -3.7, 1.5, 8.4, 0.04, TIMBER, 'wood');
    F.box(-4.3, 0.9, 8.4, 0.5, 0.7, 0.3, 0, 0x8a7a5a, 'cloth');
    F.ball(-4.3, 1.8, 8.4, 0.17, HAY, 'crop');
    F.cone(-4.3, 1.9, 8.4, 0.35, 0.25, 0, HAY, 'crop');
    F.cyl(-10.9, 0, 9.8, 0.6, 0.7, 0, tr, 'stone');
    F.tree(-3.3, 9.1, 'olive', 3.6);
    K.jar(-11.2, 0, 3.3, 0.3); K.jar(-3.0, 0, 3.2, 0.3, 0x7a6a4a);
  }

  /* ========================================================== GOVERNOR PALACE */

  /* the Governor's palace: a domed audience hall on a podium (Mournhold drum,
     window band, tiled trim, ribbed dome and lantern), a columned portico
     and ceremonial stair, two office wings, a formal garden court behind a
     guard gatehouse, statues and flagpoles */
  function govPalace(F, K) {
    const c = F.pick([0x958e80, 0x9a9384, 0x97907f, 0xa19a8a]), tr = shade(c, -0.14), base = shade(c, -0.26);
    const mar = F.pick(MARBLE), tile = F.pick(LAPIS), tile2 = F.pick(JADE), por = F.pick(PORPH);
    const domeC = F.pick([shade(0x2a4d80, 0.28), shade(0x3f6b56, 0.18), 0x4d6a8a]);
    const PH = 2.4;

    /* podium and hall */
    F.box(0, 0, -7, 23.5, 0.5, 18.5, 0, base, 'stone');
    F.box(0, 0, -7, 23, PH, 18, 0, shade(c, -0.06), 'stone');
    F.box(0, 0, 4.1, 17.5, 0.5, 4.2, 0, base, 'stone');
    F.box(0, 0, 4, 17, PH, 4, 0, shade(c, -0.06), 'stone');
    K.band(0, -7, 23, 18, 1.1, 0.3, 0.12, por);
    K.band(0, -7, 23, 18, PH - 0.3, 0.3, 0.45, mar);
    F.box(0, PH - 0.3, 6, 17.4, 0.3, 0.45, 0, mar, 'stone');
    F.box(0, 1.1, 6.0, 17.1, 0.3, 0.12, 0, por, 'stone');
    [-1, 1].forEach(function (s) { F.box(s * 8.5, PH - 0.3, 4, 0.45, 0.3, 4.4, 0, mar, 'stone'); });
    F.box(0, PH, -7, 20, 11, 16, 0, c, 'stone');
    K.band(0, -7, 20, 16, 9.8, 0.3, 0.3, tr);
    K.band(0, -7, 20, 16, 12.2, 0.5, 0.2, tile);
    K.band(0, -7, 20, 16, 12.9, 0.5, 0.6, mar);
    K.parapet(0, -7, 20, 16, 13.4, 1.0, 0.45, c);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      F.box(p[0] * 9.7, 13.4, -7 + p[1] * 7.7, 0.8, 1.35, 0.8, 0, tr, 'stone');
      F.cone(p[0] * 9.7, 14.75, -7 + p[1] * 7.7, 0.4, 1.4, 0, shade(c, -0.3), 'stone');
      F.ball(p[0] * 9.7, 16.2, -7 + p[1] * 7.7, 0.16, GILT, 'metal');
    });
    /* hall sides and back: pilasters, tall arched windows, clerestory */
    [-1, 1].forEach(function (s) {
      const fx = s * 10, side = s > 0 ? 2 : 3;
      [-15, -11, -7, -3, 1].forEach(function (z) { K.fb(fx, PH, z, side, 0.15, 0.8, 9.8 - PH, 0.3, shade(c, 0.05), 'stone'); });
      K.row(fx, 4.0, -7, side, [-6, -2, 2, 6], 1.5, 4.4, c, { arch: true });
      K.row(fx, 10.4, -7, side, [-6, -2, 2, 6], 1.0, 1.2, c, { arch: true, sill: false });
    });
    [-10, -6, -2, 2, 6, 10].forEach(function (x) { K.fb(x, PH, -15, 1, 0.15, 0.8, 9.8 - PH, 0.3, shade(c, 0.05), 'stone'); });
    K.row(0, 4.0, -15, 1, [-8, -4, 4, 8], 1.5, 4.4, c, { arch: true });
    K.row(0, 10.4, -15, 1, [-8, -4, 0, 4, 8], 1.0, 1.2, c, { arch: true, sill: false });
    K.door(0, PH, -15, 1, 2.0, 3.2, c, { arch: true, lamp: 1 });
    K.stair(0, -18.8, 0, PH, '+z', 3.6, shade(c, -0.08), { run: 0.35 });

    /* front: bronze main door, portico, attic with calligraphy, stair */
    K.door(0, PH, 1, 0, 3.0, 4.4, c, { arch: true, leaf: BRONZE, leafFam: 'metal', sur: mar });
    K.row(0, 4.0, 1, 0, [-5.6, 5.6], 1.2, 3.2, c, { arch: true });
    [-7.9, 7.9].forEach(function (x) { K.fb(x, PH, 1, 0, 0.2, 1.0, 7.3, 0.4, mar, 'stone'); });
    [-7, -4.2, -1.4, 1.4, 4.2, 7].forEach(function (x) {
      F.box(x, PH, 5.2, 1.2, 0.4, 1.2, 0, shade(mar, -0.08), 'stone');
      F.cyl(x, PH + 0.4, 5.2, 0.45, 6.4, 0, mar, 'stone');
      F.cyl(x, PH + 0.4, 5.2, 0.52, 0.22, 0, shade(mar, -0.1), 'stone');
      F.cyl(x, PH + 6.55, 5.2, 0.52, 0.25, 0, tile, 'stone');
      F.box(x, PH + 6.8, 5.2, 1.3, 0.5, 1.3, 0, shade(mar, -0.05), 'stone');
    });
    F.box(0, 9.7, 3.4, 17.2, 1.4, 5.2, 0, shade(mar, -0.06), 'stone');
    K.fb(0, 10.1, 6.0, 0, 0.05, 17.2, 0.5, 0.1, tile, 'stone');
    F.box(0, 11.1, 3.4, 17.8, 0.35, 5.8, 0, mar, 'stone');
    F.box(0, 11.45, 5.95, 17.2, 1.1, 0.5, 0, c, 'stone');
    [-1, 1].forEach(function (s) { F.box(s * 8.35, 11.45, 3.4, 0.5, 1.1, 4.6, 0, c, 'stone'); });
    F.box(0, 11.45, 5.95, 6.2, 2.0, 0.6, 0, c, 'stone');
    F.box(0, 13.45, 5.95, 6.6, 0.25, 0.8, 0, mar, 'stone');
    K.fb(0, 11.65, 6.25, 0, 0.04, 5.4, 0.55, 0.08, DARK, 'stone');
    for (let i = 0; i < 12; i++) K.fb(-2.4 + i * 0.44, 11.75 + F.rr(0, 0.15), 6.25, 0, 0.1, F.rr(0.12, 0.26), F.rr(0.2, 0.34), 0.04, GILT, 'metal');
    K.fd(0, 12.85, 6.25, 0, 0.06, 0.42, 0.12, GILT, 'metal');
    K.stair(0, 12, 0, PH, '-z', 13, shade(c, -0.03), { run: 0.75 });
    [-1, 1].forEach(function (s) {
      F.box(s * 7.1, 0, 8.1, 1.2, PH + 0.6, 4.2, 0, shade(c, -0.04), 'stone');
      F.box(s * 7.1, PH + 0.6, 8.1, 1.4, 0.2, 4.4, 0, mar, 'stone');
      F.box(s * 7.1, 0, 11.2, 1.9, 1.2, 1.9, 0, shade(c, -0.04), 'stone');
      K.statue(s * 7.1, 1.2, 11.2, s > 0 ? mar : mar, tr, 0);
      F.cyl(s * 7.1, PH + 0.8, 6.5, 0.18, 0.7, 0, BRONZE, 'metal');
      F.ball(s * 7.1, PH + 1.7, 6.5, 0.28, GLOW, 'glow');
    });

    /* drum with window band and tiled trim, ribbed dome, lantern */
    const DZ = -7, DY = 13.4, DR = 7.0, DT = 19.05, DH = 6.0;
    F.cyl(0, DY, DZ, DR + 0.6, 0.8, 0, shade(c, -0.04), 'stone');
    F.cyl(0, DY + 0.8, DZ, DR, 4.6, 0, c, 'stone');
    F.cyl(0, DY + 0.8, DZ, DR + 0.08, 0.5, 0, tile, 'stone');
    F.cyl(0, 18.2, DZ, DR + 0.08, 0.3, 0, tile2, 'stone');
    F.cyl(0, 18.5, DZ, DR + 0.35, 0.3, 0, mar, 'stone');
    F.cyl(0, 18.8, DZ, DR + 0.05, 0.25, 0, GILT, 'metal');
    for (let i = 0; i < 16; i++) {
      const a = (i + 0.5) / 16 * TAU, sa = Math.sin(a), ca = Math.cos(a);
      F.box(sa * (DR + 0.03), 15.2, DZ + ca * (DR + 0.03), 1.0, 2.2, 0.3, a, DARK, 'wood');
      F.rod(sa * (DR - 0.12), 17.4, DZ + ca * (DR - 0.12), sa * (DR + 0.18), 17.4, DZ + ca * (DR + 0.18), 0.5, DARK, 'wood');
      F.box(sa * (DR + 0.1), 14.95, DZ + ca * (DR + 0.1), 1.4, 0.25, 0.4, a, mar, 'stone');
      const b = i / 16 * TAU;
      F.box(Math.sin(b) * DR, DY + 1.3, DZ + Math.cos(b) * DR, 0.55, 4.1, 0.45, b, shade(c, 0.07), 'stone');
    }
    F.dome(0, DT, DZ, DR, DH, 0, domeC, 'dome');
    F.cyl(0, DT, DZ, DR + 0.02, 0.4, 0, shade(domeC, -0.15), 'dome');
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * TAU, sa = Math.sin(a), ca = Math.cos(a);
      let prev = null;
      for (let k = 0; k <= 6; k++) {
        const t = k / 6 * 1.36;
        const pt = [sa * (DR + 0.04) * Math.cos(t), DT + (DH + 0.04) * Math.sin(t), DZ + ca * (DR + 0.04) * Math.cos(t)];
        if (prev) F.rod(prev[0], prev[1], prev[2], pt[0], pt[1], pt[2], 0.12, GILT, 'metal');
        prev = pt;
      }
    }
    [0.35, 0.8].forEach(function (t) {
      F.cyl(0, DT + DH * Math.sin(t) - 0.1, DZ, DR * Math.cos(t) + 0.04, 0.2, 0, i2c(t), 'dome');
    });
    function i2c(t) { return t < 0.5 ? tile : shade(domeC, 0.12); }
    F.cyl(0, DT + DH - 0.3, DZ, 1.3, 1.7, 0, mar, 'stone');
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU;
      F.box(Math.sin(a) * 1.32, DT + DH + 0.05, DZ + Math.cos(a) * 1.32, 0.45, 0.9, 0.2, a, DARK, 'wood');
    }
    F.dome(0, DT + DH + 1.4, DZ, 1.45, 1.1, 0, GILT, 'metal');
    F.ball(0, DT + DH + 2.6, DZ, 0.3, GILT, 'metal');
    F.cone(0, DT + DH + 2.8, DZ, 0.16, 1.3, 0, GILT, 'metal');
    /* little domed turrets on the hall roof corners */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      const x = p[0] * 8.0, z = DZ + p[1] * 6.0;
      F.cyl(x, 13.4, z, 0.8, 2.0, 0, shade(c, 0.04), 'stone');
      F.cyl(x, 15.4, z, 0.9, 0.2, 0, tile, 'stone');
      F.dome(x, 15.6, z, 0.85, 0.9, 0, domeC, 'dome');
      F.ball(x, 16.55, z, 0.14, GILT, 'metal');
      [0, 1, 2, 3].forEach(function (k) {
        const a = k * Math.PI / 2 + Math.PI / 4;
        F.box(x + Math.sin(a) * 0.82, 14.1, z + Math.cos(a) * 0.82, 0.3, 0.8, 0.12, a, DARK, 'wood');
      });
    });

    /* office wings */
    [-1, 1].forEach(function (s) {
      const WX = s * 16.5, WZ = -7, outer = s > 0 ? 2 : 3, inner = s > 0 ? 3 : 2;
      F.box(WX, 0, WZ, 10.6, 0.4, 14.6, 0, base, 'stone');
      F.box(WX, 0.4, WZ, 10, 8.2, 14, 0, shade(c, 0.02), 'stone');
      K.band(WX, WZ, 10, 14, 4.4, 0.26, 0.3, tr);
      K.band(WX, WZ, 10, 14, 7.5, 0.35, 0.18, tile);
      K.band(WX, WZ, 10, 14, 8.2, 0.4, 0.55, mar);
      K.parapet(WX, WZ, 10, 14, 8.6, 0.9, 0.4, c);
      /* front: arcaded loggia below, windows and a balcony above */
      [-2.8, 0, 2.8].forEach(function (u) {
        K.win(WX + u, 0.4, 0, 0, 2.0, 2.4, c, { arch: true, sill: false });
        K.win(WX + u, 5.3, 0, 0, 1.2, 1.7, c, { shut: u === 0 });
      });
      [-4.2, -1.4, 1.4, 4.2].forEach(function (u) { K.fb(WX + u, 0.4, 0, 0, 0.2, 0.6, 3.9, 0.4, mar, 'stone'); });
      F.box(WX, 4.7, 0.6, 3.0, 0.25, 1.2, 0, mar, 'stone');
      F.box(WX, 4.95, 1.15, 3.0, 0.8, 0.1, 0, BRONZE, 'metal');
      [-1, 1].forEach(function (k) { F.box(WX + k * 1.45, 4.95, 0.65, 0.1, 0.8, 1.1, 0, BRONZE, 'metal'); });
      K.fb(WX, 8.7 - 0.4, 0, 0, 0.3, 1.6, 0.1, 0.2, GILT, 'metal');
      K.row(WX + s * 5, 1.6, WZ, outer, [-5, -1.7, 1.7, 5], 1.2, 1.8, c, { shut: true });
      K.row(WX + s * 5, 5.3, WZ, outer, [-5, -1.7, 1.7, 5], 1.2, 1.7, c, {});
      K.row(WX - s * 5, 5.3, WZ, inner, [-4.5, 0, 4.5], 1.1, 1.6, c, {});
      K.row(WX, 1.6, -14, 1, [-3, 0], 1.2, 1.8, c, {});
      K.door(WX + 3, 0.4, -14, 1, 1.3, 2.4, c, { steps: 1, lamp: -1 });
      K.row(WX, 5.3, -14, 1, [-3, 0, 3], 1.2, 1.7, c, {});
      K.drain(WX + s * 5.15, -13.85, 0.4, 8.2, c);
      /* roof: clerks' terrace under an awning, stair head, chimney */
      K.awning(WX - 4.0, -13.1, WX + 4.0, -8.4, 8.6, 2.4, F.pick(SAIL), { drop: 0.3, stripe: tile });
      [-2.2, 1.6].forEach(function (u) {
        F.box(WX + u, 8.6, -10.9, 1.8, 0.8, 0.9, 0, TIMBER, 'wood');
        F.box(WX + u, 9.4, -10.9, 2.0, 0.08, 1.1, 0, shade(TIMBER, 0.12), 'wood');
        F.cyl(WX + u, 8.6, -12.0, 0.25, 0.45, 0, 0x5a4630, 'wood');
        F.box(WX + u + 0.3, 9.48, -10.8, 0.5, 0.05, 0.35, 0, 0xe0d4b0, 'cloth');
      });
      F.box(WX + s * 2.4, 8.6, -3.6, 2.6, 2.3, 2.6, 0, shade(c, 0.04), 'stone');
      F.box(WX + s * 2.4, 10.9, -3.6, 2.9, 0.22, 2.9, 0, tr, 'stone');
      K.door(WX + s * 2.4, 8.6, -2.3, 0, 0.9, 1.7, c, {});
      K.chimney(WX - s * 3.6, -1.6, 8.6, 1.8, c);
    });

    /* court enclosure and gatehouse */
    const wc = shade(c, -0.02);
    K.wall(-21.3, 0, -21.3, 29.8, 3.0, 0.6, wc);
    K.wall(21.3, 0, 21.3, 29.8, 3.0, 0.6, wc);
    K.wall(-21.6, 29.8, -6.2, 29.8, 3.0, 0.6, wc);
    K.wall(6.2, 29.8, 21.6, 29.8, 3.0, 0.6, wc);
    [5, 10, 15, 20, 25].forEach(function (z) {
      [-1, 1].forEach(function (s) {
        F.box(s * 21.3, 0, z, 1.0, 3.2, 1.0, 0, shade(wc, 0.04), 'stone');
        F.cyl(s * 21.3, 3.2, z, 0.3, 0.5, 0, mar, 'stone');
        F.ball(s * 21.3, 3.9, z, 0.28, mar, 'stone');
      });
    });
    [-18, -13, -9, 9, 13, 18].forEach(function (x) {
      F.box(x, 0, 29.8, 1.0, 3.2, 1.0, 0, shade(wc, 0.04), 'stone');
      F.cyl(x, 3.2, 29.8, 0.3, 0.5, 0, mar, 'stone');
      F.ball(x, 3.9, 29.8, 0.28, mar, 'stone');
    });
    [-1, 1].forEach(function (s) {
      const tx = s * 4.2, tz = 30;
      F.frustum(tx, 0, tz, 2.3, 1.95, 9.5, 0, shade(c, 0.03), 'stone', 12);
      F.cyl(tx, 3.4, tz, 2.3 - 0.35 * 3.4 / 9.5 + 0.07, 0.3, 0, tr, 'stone');
      F.cyl(tx, 8.6, tz, 2.02, 0.45, 0, tile, 'stone');
      F.cyl(tx, 9.5, tz, 2.3, 0.4, 0, mar, 'stone');
      F.cone(tx, 9.9, tz, 2.3, 3.2, 0, domeC, 'roof');
      F.cyl(tx, 9.9, tz, 2.32, 0.18, 0, GILT, 'metal');
      F.ball(tx, 13.2, tz, 0.2, GILT, 'metal');
      F.cone(tx, 13.3, tz, 0.1, 0.9, 0, GILT, 'metal');
      [0, Math.PI, s * Math.PI / 2, s * Math.PI / 4, s * 3 * Math.PI / 4].forEach(function (a) {
        const r = 2.3 - 0.35 * 6.3 / 9.5 + 0.02;
        F.box(tx + Math.sin(a) * r, 5.4, tz + Math.cos(a) * r, 0.45, 1.8, 0.3, a, DARK, 'wood');
      });
      K.door(tx, 0, tz - 2.24, 1, 1.0, 2.1, c, {});
      const bc = F.pick([0x7a2028, 0x8a2f2a]);
      F.rod(tx - 0.8, 8.1, tz + 2.2, tx + 0.8, 8.1, tz + 2.2, 0.05, BRACKET, 'metal');
      F.box(tx, 4.0, tz + 2.2, 1.3, 4.0, 0.06, 0, bc, 'cloth');
      F.box(tx, 3.5, tz + 2.2, 0.6, 0.5, 0.06, 0, bc, 'cloth');
      F.box(tx, 7.0, tz + 2.23, 1.32, 0.2, 0.06, 0, GILT, 'cloth');
    });
    F.box(0, 0, 30, 4.8, 8.0, 4.4, 0, c, 'stone');
    F.box(0, 8.0, 30, 5.2, 0.35, 4.8, 0, mar, 'stone');
    [-1.6, 0, 1.6].forEach(function (x) {
      F.box(x, 8.35, 31.95, 0.8, 1.0, 0.5, 0, c, 'stone');
      F.box(x, 8.35, 28.05, 0.8, 1.0, 0.5, 0, c, 'stone');
    });
    K.win(0, 0, 32.2, 0, 2.6, 3.4, c, { arch: true, sill: false, bars: true });
    K.win(0, 0, 27.8, 1, 2.6, 3.4, c, { arch: true, sill: false });
    K.win(0, 5.6, 32.2, 0, 1.0, 1.3, c, {});
    K.win(0, 5.6, 27.8, 1, 1.0, 1.3, c, {});
    K.fb(0, 7.2, 32.2, 0, 0.05, 4.8, 0.35, 0.1, tile, 'stone');
    K.lamp(-2.0, 4.6, 32.2, 0); K.lamp(2.0, 4.6, 32.2, 0);

    /* garden court: paving, paths, parterre beds, pool, cypresses, statues, flags */
    F.box(0, 0, 14, 42, 0.05, 28, 0, shade(base, 0.2), 'stone');
    F.box(0, 0.05, 20, 4.2, 0.04, 15.6, 0, mar, 'stone');
    F.box(0, 0.05, 19.5, 36, 0.04, 3, 0, mar, 'stone');
    [-1, 1].forEach(function (s) {
      [[12.8, 17.8], [21.2, 27.0]].forEach(function (zr) {
        const x0 = 3.4, x1 = 19.6, cx = s * (x0 + x1) / 2, cz = (zr[0] + zr[1]) / 2, w = x1 - x0, d = zr[1] - zr[0];
        F.box(cx, 0, cz, w, 0.35, d, 0, shade(c, -0.1), 'stone');
        F.box(cx, 0.05, cz, w - 0.5, 0.42, d - 0.5, 0, 0x5b6740, 'leafy');
        F.box(cx, 0.47, cz, w - 2.0, 0.28, 0.5, 0, 0x43502e, 'leafy');
        F.box(cx, 0.47, cz, 0.5, 0.28, d - 2.0, 0, 0x43502e, 'leafy');
        [-1, 1].forEach(function (k) {
          F.box(cx + k * w / 4, 0.47, cz, 0.4, 0.22, d - 2.4, 0, 0x4e5a34, 'leafy');
          for (let j = 0; j < 4; j++) F.ball(cx + k * w / 4 + 0.9, 0.55, cz - 1.5 + j, 0.16, F.pick([0xecc3cf, 0xe8d9a0, 0xc9b8d6]), 'bloom');
        });
        F.tree(s * (x0 + 0.8), zr[0] + 0.8, 'cypress', 4.4, 0.47);
        F.tree(s * (x0 + 0.8), zr[1] - 0.8, 'cypress', 4.4, 0.47);
        F.tree(s * (x1 - 0.8), zr[0] + 0.8, 'cypress', 4.0, 0.47);
        F.tree(s * (x1 - 0.8), zr[1] - 0.8, 'cypress', 4.0, 0.47);
      });
      K.statue(s * 3.0, 0, 14.6, s > 0 ? BRONZE : mar, tr, -s);
      K.statue(s * 3.0, 0, 24.6, s > 0 ? mar : BRONZE, tr, -s);
      F.cyl(s * 2.6, 0, 18.0, 0.15, 3.2, 0, BRONZE, 'metal');
      F.ball(s * 2.6, 3.45, 18.0, 0.3, GLOW, 'glow');
      F.cyl(s * 2.6, 0, 22.3, 0.15, 3.2, 0, BRONZE, 'metal');
      F.ball(s * 2.6, 3.45, 22.3, 0.3, GLOW, 'glow');
      K.flag(s * 10.5, 0, 9.0, 10, F.pick(BANNER), true);
      K.flag(s * 16.0, 0, 9.0, 10, F.pick([0x7a2028, 0x8a2f2a, 0x5c4028]), true);
    });
    F.cyl(0, 0.05, 19.5, 3.4, 0.6, 0, mar, 'stone');
    F.cyl(0, 0.08, 19.5, 3.1, 0.6, 0, WATER, 'water');
    F.cyl(0, 0.6, 19.5, 0.35, 1.4, 0, mar, 'stone');
    F.cyl(0, 2.0, 19.5, 1.1, 0.25, 0, mar, 'stone');
    F.cyl(0, 2.25, 19.5, 0.2, 0.5, 0, BRONZE, 'metal');
    F.blob(0, 2.95, 19.5, 0.25, 0.8, 0, 0xc8d4d0, 'water');
    K.bench(-4.6, 0, 17.8, 2.2, false, mar);
    K.bench(4.6, 0, 21.2, 2.2, false, mar);
  }

  /* ============================================================= REGISTRY */

  ASSET({
    key: 'voth_school', name: 'School', culture: 'voth', source: 'voth-civic', family: 'civic',
    districts: ['canton', 'common', 'temple'], wealth: [0.3, 0.9],
    blurb: 'A Temple college round a cloistered court with a domed lecture hall and library tower, or a small flat-roofed schoolhouse with a canopied roof classroom and walled play yard.',
    w: 41, d: 38.4, h: 27.2, variants: 2,
    variantDims: [
      { w: 41, d: 38.4, h: 27.2 },
      { w: 14.6, d: 18.4, h: 10.7 }
    ],
    build: function (F) {
      const K = kit(F);
      if (F.variant === 1) schoolHouse(F, K); else schoolCollege(F, K);
    }
  });

  ASSET({
    key: 'voth_generator', name: 'Power House', culture: 'voth', source: 'voth-civic', family: 'industrial',
    districts: ['industrial', 'harbour', 'guild-row'], wealth: [0.3, 0.7],
    blurb: 'Geothermal steam power house: a buttressed turbine hall or a domed fumarole vent house with a flywheel; bronze boiler drums and turbine casing, smoking stacks, cooling tanks, a crane gantry, conduits out on pylons and a control tower with glowing gauges.',
    w: 41.7, d: 35.7, h: 29.4, variants: 2,
    variantDims: [
      { w: 41.7, d: 35.7, h: 29.4 },
      { w: 29.2, d: 23.4, h: 27.4 }
    ],
    build: function (F) {
      const K = kit(F);
      if (F.variant === 1) genVent(F, K); else genHall(F, K);
    }
  });

  ASSET({
    key: 'voth_farmhouse', name: 'Farmhouse', culture: 'voth', source: 'voth-civic', family: 'rural',
    districts: ['rural', 'lakeside', 'outskirts'], wealth: [0, 0.6],
    blurb: 'A working farm: a battered, domed Velothi farmstead with granaries and a guar pen; a chinampa house on the lake beds with jetty, racks and fish traps; or a Hlaalu farmhouse with barn, hayloft and kitchen garden.',
    w: 26.2, d: 22, h: 10.4, variants: 3,
    variantDims: [
      { w: 20.6, d: 19.2, h: 10.1 },
      { w: 24, d: 22, h: 8.0 },
      { w: 26.2, d: 19.5, h: 10.9 }
    ],
    build: function (F) {
      const K = kit(F);
      if (F.variant === 1) farmChinampa(F, K);
      else if (F.variant === 2) farmHlaalu(F, K);
      else farmVelothi(F, K);
    }
  });

  ASSET({
    key: 'voth_governor_palace', name: "Governor's Palace", culture: 'voth', source: 'voth-civic', family: 'civic',
    districts: ['canton', 'wealthy'], wealth: [0.8, 1],
    blurb: "The Governor's seat: a domed audience hall on a podium with portico and ceremonial stair, flanking office wings, and a formal garden court with statues and flags behind a guard gatehouse.",
    w: 43.6, d: 51.2, h: 29.4, variants: 1,
    build: function (F) { govPalace(F, kit(F)); }
  });
})();
