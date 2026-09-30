/* ======================================================================
   voth-manors — estate manors and clan compounds for Voth
   culture: 'voth'   |  source: 'voth-manors'
   Requires krator-asset-engine.js (ASSET / F / shade / TAU).

   2 keys x 3 designed variants (F.variant 0..2), each with variantDims:
     voth_manor            — Hlaalu walled manor / Velothi terraced keep-house /
                             Mournhold domed hall with stable and servants' wing
     voth_clan_compound_b  — poor mudbrick clan yard / fortified clan compound /
                             waterside clan compound on a platform with a dock

   Everything lives in one IIFE (registry files share one global scope).
   Two tools do most of the work:
     sub(P, ox, oy, oz, q) — a frame with the F API, offset and turned by q
                             quarter turns, so a house can be written once with
                             its door on local +z and dropped in facing any way.
                             Nests (sub of a sub).
     kit(G)                — windows, doors, parapets, stairs, ladders, awnings,
                             pergolas, shade sails, clutter, wells, pools... all
                             in G's frame.
   flatHouse() is the lived-in flat-roofed house every compound uses: roof
   room with its own door and windows, stair or ladder up, parapet with a gap
   where the stair arrives, awning / pergola / shade sail, and roof storage.

   Colours are copied from voth/src/05-palette.js (PAL.stone.*, PAL.roof,
   PAL.dome, PAL.banner, PAL.sail, PAL.mud, PAL.leaf).
   ====================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------- palette */
  const ST = [0x8c8579, 0x958e80, 0x87816f, 0x97907f, 0x827c6e, 0x8f8873, 0x9a9384];
  const POOR = [0x8b8069, 0x7e7460, 0x968b73, 0x877d66, 0x9d9076];
  const MUD = [0x6b5c46, 0x76664d, 0x6f6149];
  const MARBLE = [0xe8e1d2, 0xdfd7c5, 0xf1ebdd];
  const BASALT = [0x2b2a28, 0x322f2b, 0x242220];
  const JADE = [0x3f6b56, 0x35594a, 0x4a7d64];
  const LAPIS = [0x1f3f6e, 0x2a4d80, 0x17335c];
  const PORPH = [0x5e1e2d, 0x6a2434, 0x521826];
  const ROOF = [0xb35a3a, 0xa04f32, 0xc36a42, 0x6b7a4a, 0x7a5a72, 0xc4813f];
  const CU = [0x4a7d64, 0x3f6b56, 0x6b7a4a];           /* verdigris copper: jade + roof green */
  const DOME = [0xb08d3c, 0xa0843f, 0x8f7a44, 0xb0a682, 0x9d9379, 0xa8a08a, 0x93886d];
  const DOMEDK = [0xb08d3c, 0xa0843f, 0x8f7a44, 0x93886d];     /* the gilt/bronze end of PAL.dome */
  const BANNER = [0x7a2028, 0x8a2f2a, 0x5c4028, 0xe8d9a0, 0xc9b8d6, 0xb8d0b0, 0xb0c8d8, 0xcbb08e, 0xe8c090];
  const SAIL = [0xcfc2a3, 0xc0b190, 0xb8a880, 0xa89878];
  const LEAF = [0x4e5a34, 0x43502e, 0x5b6740, 0x616a41];
  const REED = [0x7d7a4e, 0x8b8556, 0x6f6c45];
  const POTS = [0x8a5a3a, 0x7a6a50, 0x6b5c46, 0x9a6a4a];
  const LEAVES = [0x3a2a1c, 0x4a3422, 0x33302a];
  const DOOR = 0x1c1a16, TIMBER = 0x4a3a28, IRON = 0x3a2f22, GLOW = 0xffcf87, ROPE = 0x6b5a3a;
  const WATER = 0x3f5e60, BED = 0x2e3430, SOIL = 0x4e4232, HAY = 0xb8a060, GUAR = 0x7a6a50;

  /* ---------------------------------------------------------- sub-frame */
  function sub(P, ox, oy, oz, q) {
    const th = (q || 0) * Math.PI / 2;
    const c = Math.round(Math.cos(th)), s = Math.round(Math.sin(th));
    const T = function (x, z) { return [ox + x * c + z * s, oz - x * s + z * c]; };
    const G = { rnd: P.rnd, rr: P.rr, pick: P.pick, chance: P.chance, wealth: P.wealth, variant: P.variant };
    G.box = function (x, y, z, w, h, d, r, col, fam) { const p = T(x, z); P.box(p[0], oy + y, p[1], w, h, d, (r || 0) + th, col, fam); };
    ['cyl', 'cone', 'dome', 'blob'].forEach(function (k) {
      G[k] = function (x, y, z, r, h, r2, col, fam) { const p = T(x, z); P[k](p[0], oy + y, p[1], r, h, (r2 || 0) + th, col, fam); };
    });
    G.ball = function (x, y, z, r, col, fam) { const p = T(x, z); P.ball(p[0], oy + y, p[1], r, col, fam); };
    G.frustum = function (x, y, z, rb, rt, h, r2, col, fam, sides) { const p = T(x, z); P.frustum(p[0], oy + y, p[1], rb, rt, h, (r2 || 0) + th, col, fam, sides); };
    G.pyrRoof = function (x, y, z, w, h, d, r2, col, fam) { const p = T(x, z); P.pyrRoof(p[0], oy + y, p[1], w, h, d, (r2 || 0) + th, col, fam); };
    G.hipRoof = function (x, y, z, w, h, d, r2, col, fam) { const p = T(x, z); P.hipRoof(p[0], oy + y, p[1], w, h, d, (r2 || 0) + th, col, fam); };
    G.beam = function (ax, ay, az, bx, by, bz, w, d, col, fam) { const a = T(ax, az), b = T(bx, bz); P.beam(a[0], oy + ay, a[1], b[0], oy + by, b[1], w, d, col, fam); };
    G.rod = function (ax, ay, az, bx, by, bz, r, col, fam) { const a = T(ax, az), b = T(bx, bz); P.rod(a[0], oy + ay, a[1], b[0], oy + by, b[1], r, col, fam); };
    /* a sloping sheet (cloth, planks) from edge-centre a to edge-centre b, `width` across */
    G.sheet = function (ax, ay, az, bx, by, bz, width, col, fam, thick) {
      if (P.sheet) {
        const a = T(ax, az), b = T(bx, bz);
        P.sheet(a[0], oy + ay, a[1], b[0], oy + by, b[1], width, col, fam, thick);
        return;
      }
      const a = T(ax, az), b = T(bx, bz), t = thick || 0.08;
      if (Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1])) P.beam(a[0], oy + ay, a[1], b[0], oy + by, b[1], t, width, col, fam || 'cloth');
      else P.beam(a[0], oy + ay, a[1], b[0], oy + by, b[1], width, t, col, fam || 'cloth');
    };
    G.tree = function (x, z, kind, h, ly) { const p = T(x, z); P.tree(p[0], p[1], kind, h, oy + (ly || 0)); };
    return G;
  }

  /* ---------------------------------------------------------- kit */
  function kit(G) {
    const K = {};
    function nrm(s) { return s === 0 ? [0, 1] : s === 1 ? [0, -1] : s === 2 ? [1, 0] : [-1, 0]; }
    function tan(s) { return s < 2 ? [1, 0] : [0, 1]; }
    K.nrm = nrm; K.tan = tan;

    /* a box laid flat on a face: (cx,cz) on the face line, `along` wide, `th`
       thick, its centre pushed `out` along the face normal */
    K.fb = function (cx, y, cz, along, h, th, s, out, col, fam) {
      const n = nrm(s), f = s < 2;
      G.box(cx + n[0] * out, y, cz + n[1] * out, f ? along : th, h, f ? th : along, 0, col, fam || 'stone');
    };

    /* window: dark pane, sill, lintel; options arch (pointed head), shut, grille */
    K.win = function (cx, y, cz, ww, wh, s, wc, o) {
      o = o || {};
      const trim = o.trim || shade(wc, -0.22), pane = o.pane || DOOR;
      K.fb(cx, y, cz, ww, wh, 0.24, s, 0.04, pane, 'wood');
      let top = y + wh;
      if (o.arch) { K.fb(cx, top, cz, ww * 0.56, wh * 0.2, 0.24, s, 0.04, pane, 'wood'); top += wh * 0.2; }
      if (o.sill !== false) K.fb(cx, y - 0.18, cz, ww + 0.44, 0.18, 0.42, s, 0.15, trim, 'stone');
      if (o.lintel !== false) K.fb(cx, top, cz, (o.arch ? ww * 0.56 : ww) + 0.36, 0.22, 0.34, s, 0.11, o.lintelC || trim, o.lintelC ? 'wood' : 'stone');
      if (o.shut) {
        const t = tan(s);
        [-1, 1].forEach(function (k) {
          K.fb(cx + t[0] * k * (ww / 2 + 0.25), y, cz + t[1] * k * (ww / 2 + 0.25), 0.46, wh, 0.1, s, 0.12, o.shutC || 0x5a4028, 'wood');
        });
      }
      if (o.grille) {
        const t = tan(s), n = nrm(s);
        for (let k = -1; k <= 1; k++) {
          const px = cx + t[0] * k * ww * 0.28 + n[0] * 0.2, pz = cz + t[1] * k * ww * 0.28 + n[1] * 0.2;
          G.rod(px, y, pz, px, y + wh, pz, 0.035, IRON, 'metal');
        }
      }
    };

    /* door: leaf with iron straps, jambs, head, step down to `base` */
    K.door = function (cx, y, cz, ww, hh, s, wc, o) {
      o = o || {};
      const t = tan(s), n = nrm(s), tr = o.trim || shade(wc, -0.2), base = o.base || 0;
      K.fb(cx, y, cz, ww, hh, 0.24, s, 0.04, o.leaf || LEAVES[0], 'wood');
      [0.28, 0.72].forEach(function (f) { K.fb(cx, y + hh * f, cz, ww * 0.94, 0.09, 0.06, s, 0.18, IRON, 'metal'); });
      [-1, 1].forEach(function (k) {
        K.fb(cx + t[0] * k * (ww / 2 + 0.2), y, cz + t[1] * k * (ww / 2 + 0.2), 0.4, hh, 0.46, s, 0.13, tr, 'stone');
      });
      K.fb(cx, y + hh, cz, ww + 0.9, o.head || 0.5, 0.52, s, 0.15, tr, 'stone');
      if (o.step !== false) {
        if (y - base > 0.06) K.fb(cx, base, cz, ww + 1.0, y - base, 0.9, s, 0.45, shade(wc, -0.28), 'stone');
        else K.fb(cx, base, cz, ww + 0.8, 0.1, 0.7, s, 0.35, shade(wc, -0.28), 'stone');
      }
      if (o.lamp) {
        const lx = cx + t[0] * (ww / 2 + 0.8), lz = cz + t[1] * (ww / 2 + 0.8), ly = y + hh + 0.1;
        G.rod(lx, ly, lz, lx + n[0] * 0.7, ly, lz + n[1] * 0.7, 0.06, IRON, 'metal');
        G.ball(lx + n[0] * 0.7, ly - 0.3, lz + n[1] * 0.7, 0.22, GLOW, 'glow');
      }
    };

    /* a row of windows along one face of block B; skip = [[u, halfwidth]], skipFn(u) */
    K.row = function (B, s, y, ww, wh, o, pitch, skip, nForce, skipFn) {
      const n = nrm(s), f = s < 2, len = f ? B.w : B.d;
      const cnt = nForce || Math.max(1, Math.floor((len - 1.2) / pitch));
      const spread = (cnt - 1) * pitch / 2;
      for (let i = 0; i < cnt; i++) {
        const u = cnt === 1 ? 0 : -spread + i * pitch;
        if (skip && skip.some(function (sk) { return Math.abs(u - sk[0]) < sk[1]; })) continue;
        if (skipFn && skipFn(u)) continue;
        K.win(B.x + (f ? u : n[0] * B.w / 2), y, B.z + (f ? n[1] * B.d / 2 : u), ww, wh, s, B.c, o);
      }
    };

    K.mass = function (x, y, z, w, h, d, c, o) {
      o = o || {};
      G.box(x, y, z, w, h, d, 0, c, o.fam || 'stone');
      if (o.base) G.box(x, y, z, w + 0.5, o.base, d + 0.5, 0, shade(c, -0.22), 'stone');
      if (o.cornice !== false) G.box(x, y + h - 0.32, z, w + 0.4, 0.36, d + 0.4, 0, o.corC || shade(c, -0.14), 'stone');
      (o.bands || []).forEach(function (b) { G.box(x, y + b, z, w + 0.18, 0.2, d + 0.18, 0, o.bandC || shade(c, -0.08), 'stone'); });
      return { x: x, y: y, z: z, w: w, h: h, d: d, c: c, top: y + h };
    };

    /* parapet round the top of B; gaps = [{s, u, w}] */
    K.parapet = function (B, ph, t, gaps, capC, merlons) {
      gaps = gaps || [];
      const y = B.top, cc = capC || shade(B.c, -0.16);
      for (let s = 0; s < 4; s++) {
        const n = nrm(s), f = s < 2, half = f ? B.w / 2 : B.d / 2 - t;
        let segs = [[-half, half]];
        gaps.filter(function (g) { return g.s === s; }).forEach(function (g) {
          const out = [];
          segs.forEach(function (sg) {
            const a = g.u - g.w / 2, b = g.u + g.w / 2;
            if (b <= sg[0] || a >= sg[1]) { out.push(sg); return; }
            if (a > sg[0]) out.push([sg[0], a]);
            if (b < sg[1]) out.push([b, sg[1]]);
          });
          segs = out;
        });
        segs.forEach(function (sg) {
          const L = sg[1] - sg[0], m = (sg[0] + sg[1]) / 2;
          if (L < 0.1) return;
          const cx = B.x + (f ? m : n[0] * (B.w / 2 - t / 2)), cz = B.z + (f ? n[1] * (B.d / 2 - t / 2) : m);
          G.box(cx, y, cz, f ? L : t, ph, f ? t : L, 0, B.c, 'stone');
          G.box(cx, y + ph, cz, f ? L + 0.1 : t + 0.14, 0.14, f ? t + 0.14 : L + 0.1, 0, cc, 'stone');
          if (merlons) {
            const nm = Math.floor(L / 1.7);
            for (let i = 0; i < nm; i++) {
              const u = sg[0] + (i + 0.5) * L / nm;
              G.box(f ? B.x + u : cx, y + ph + 0.14, f ? cz : B.z + u, f ? 0.85 : t, 0.75, f ? t : 0.85, 0, B.c, 'stone');
            }
          }
        });
      }
    };

    /* hip roof with a kicked eave: shallow skirt + steeper crown, both ridged
       along the longer side (F.hipRoof); equal inset all round so the crown's
       eaves sit on the skirt's surface. Returns ridge y. */
    K.hip = function (x, y, z, w, d, h, col, o) {
      o = o || {};
      G.box(x, y, z, w, 0.26, d, 0, shade(col, -0.3), 'roof');
      const f = 0.3, hs = h * 0.42, yb = y + 0.26, i = Math.min(w, d) * f / 2;
      G.hipRoof(x, yb, z, w, hs, d, 0, col, 'roof');
      const y2 = yb + hs * f - 0.04, h2 = h - hs * f + 0.04;
      G.hipRoof(x, y2, z, w - 2 * i, h2, d - 2 * i, 0, shade(col, 0.06), 'roof');
      const top = y2 + h2, r = Math.abs(w - d) / 2;
      if (o.finial !== false) {
        (r > 0.3 ? [-1, 1] : [0]).forEach(function (k) {
          const fx = x + (w >= d ? k * r : 0), fz = z + (w >= d ? 0 : k * r);
          G.cyl(fx, top - 0.35, fz, 0.14, 0.95, 0, IRON, 'metal');
          G.ball(fx, top + 0.7, fz, 0.24, 0xb08d3c, 'metal');
        });
      }
      return top;
    };

    /* awning off a wall: cloth from the face at yTop sloping out `depth`; poles to yb or brackets */
    K.awn = function (cx, cz, yTop, s, along, depth, col, yb) {
      const n = nrm(s), t = tan(s), drop = Math.min(0.8, depth * 0.3);
      const bx = cx + n[0] * depth, bz = cz + n[1] * depth;
      K.fb(cx, yTop - 0.12, cz, along + 0.3, 0.22, 0.18, s, 0.09, TIMBER, 'wood');
      G.sheet(cx + n[0] * 0.1, yTop + 0.02, cz + n[1] * 0.1, bx, yTop - drop, bz, along, col);
      K.fb(cx, yTop - drop - 0.22, cz, along, 0.18, 0.14, s, depth - 0.05, TIMBER, 'wood');
      K.fb(cx, yTop - drop - 0.46, cz, along, 0.3, 0.03, s, depth + 0.04, shade(col, -0.14), 'cloth');
      [-1, 1].forEach(function (k) {
        const px = bx + t[0] * k * (along / 2 - 0.12) - n[0] * 0.05, pz = bz + t[1] * k * (along / 2 - 0.12) - n[1] * 0.05;
        if (yb != null) G.rod(px, yb, pz, px, yTop - drop - 0.05, pz, 0.075, TIMBER, 'wood');
        else G.rod(px - n[0] * (depth - 0.15), yTop - drop - 1.3, pz - n[1] * (depth - 0.15), px, yTop - drop - 0.12, pz, 0.06, TIMBER, 'wood');
      });
    };

    /* free-standing pergola, cloth top sloping down toward +z */
    K.pergola = function (x, y, z, w, d, h, col) {
      const hi = y + h, lo = y + h - 0.55;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        const top = p[1] < 0 ? hi : lo;
        G.rod(x + p[0] * w / 2, y, z + p[1] * d / 2, x + p[0] * w / 2, top - 0.02, z + p[1] * d / 2, 0.08, TIMBER, 'wood');
      });
      G.box(x, hi - 0.2, z - d / 2, w + 0.3, 0.2, 0.18, 0, TIMBER, 'wood');
      G.box(x, lo - 0.2, z + d / 2, w + 0.3, 0.2, 0.18, 0, TIMBER, 'wood');
      [-1, 1].forEach(function (k) { G.beam(x + k * w / 2, hi - 0.1, z - d / 2, x + k * w / 2, lo - 0.1, z + d / 2, 0.16, 0.16, TIMBER, 'wood'); });
      G.sheet(x, hi + 0.04, z - d / 2 - 0.1, x, lo + 0.04, z + d / 2 + 0.1, w + 0.2, col);
      G.box(x, lo - 0.3, z + d / 2 + 0.13, w + 0.2, 0.32, 0.03, 0, shade(col, -0.14), 'cloth');
    };

    /* shade sail: four poles, cloth stretched between, guyed at the corners */
    K.sail = function (x, y, z, w, d, h, col) {
      const hi = y + h, lo = y + h - 0.9, px = w / 2 + 0.45, pz = d / 2 + 0.45;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        const cy = p[1] < 0 ? hi : lo, top = cy + 0.35;
        G.rod(x + p[0] * px, y, z + p[1] * pz, x + p[0] * px, top, z + p[1] * pz, 0.07, TIMBER, 'wood');
        G.ball(x + p[0] * px, top, z + p[1] * pz, 0.1, TIMBER, 'wood');
        G.rod(x + p[0] * px, top - 0.12, z + p[1] * pz, x + p[0] * w / 2, cy, z + p[1] * d / 2, 0.025, ROPE, 'rope');
      });
      G.sheet(x, hi, z - d / 2, x, lo, z + d / 2, w, col, 'cloth', 0.05);
    };

    /* ---- clutter */
    K.jar = function (x, y, z, r, col) {
      const H = r * 2.3;
      G.blob(x, y + H / 2, z, r, H, 0, col, 'stone');
      G.cyl(x, y + H - 0.12, z, r * 0.42, 0.26, 0, shade(col, -0.12), 'stone');
    };
    K.crate = function (x, y, z, s, r) {
      G.box(x, y, z, s, s * 0.8, s, r || 0, 0x6b5438, 'wood');
      G.box(x, y + s * 0.34, z, s + 0.04, 0.08, s + 0.04, r || 0, TIMBER, 'wood');
    };
    K.rug = function (x, y, z, len, alongX, col) {
      const r = 0.2;
      if (alongX) G.rod(x - len / 2, y + r, z, x + len / 2, y + r, z, r, col, 'cloth');
      else G.rod(x, y + r, z - len / 2, x, y + r, z + len / 2, r, col, 'cloth');
    };
    K.cistern = function (x, y, z, r, h, col) {
      G.cyl(x, y, z, r, h, 0, col, 'stone');
      G.cyl(x, y + h, z, r + 0.08, 0.12, 0, shade(col, -0.2), 'stone');
      G.cyl(x, y + h + 0.12, z, r * 0.6, 0.1, 0, TIMBER, 'wood');
    };
    K.rack = function (x, y, z, len, alongX, cols) {
      const a = alongX ? [1, 0] : [0, 1];
      [-1, 1].forEach(function (k) {
        G.rod(x + a[0] * k * len / 2, y, z + a[1] * k * len / 2, x + a[0] * k * len / 2, y + 1.95, z + a[1] * k * len / 2, 0.06, TIMBER, 'wood');
      });
      G.rod(x - a[0] * len / 2, y + 1.86, z - a[1] * len / 2, x + a[0] * len / 2, y + 1.86, z + a[1] * len / 2, 0.04, TIMBER, 'wood');
      const n = Math.max(2, Math.floor(len / 0.9));
      for (let i = 0; i < n; i++) {
        const u = -len / 2 + (i + 0.5) * len / n;
        G.box(x + a[0] * u, y + 1.0, z + a[1] * u, alongX ? len / n * 0.8 : 0.04, 0.84, alongX ? 0.04 : len / n * 0.8, 0, cols[i % cols.length], 'cloth');
      }
    };
    K.planter = function (x, y, z, r, col) {
      G.cyl(x, y, z, r, r * 1.1, 0, col, 'stone');
      G.cyl(x, y + r * 1.1, z, r + 0.06, 0.1, 0, shade(col, -0.18), 'stone');
      G.blob(x, y + r * 1.1 + r * 0.55, z, r * 1.05, r * 1.4, 0, G.pick(LEAF), 'leafy');
    };

    /* ladder leaning on face s, foot out from the wall, top 0.9 above y1 */
    K.ladder = function (x, z, y0, y1, s) {
      const n = nrm(s), t = tan(s), foot = 0.75, top = y1 + 0.9;
      [-1, 1].forEach(function (k) {
        G.rod(x + t[0] * k * 0.28 + n[0] * foot, y0, z + t[1] * k * 0.28 + n[1] * foot,
          x + t[0] * k * 0.28 + n[0] * 0.16, top, z + t[1] * k * 0.28 + n[1] * 0.16, 0.05, TIMBER, 'wood');
      });
      const cnt = Math.floor((top - 0.3 - y0) / 0.38);
      for (let i = 1; i <= cnt; i++) {
        const yy = y0 + i * 0.38, f = (yy - y0) / (top - y0), o = foot + (0.16 - foot) * f;
        G.rod(x - t[0] * 0.28 + n[0] * o, yy, z - t[1] * 0.28 + n[1] * o, x + t[0] * 0.28 + n[0] * o, yy, z + t[1] * 0.28 + n[1] * o, 0.03, TIMBER, 'wood');
      }
    };

    /* solid masonry flight from (x,z) at y0 running along (dx,dz), rising to y1 */
    K.stair = function (x, z, y0, y1, dx, dz, width, col, tread) {
      tread = tread || 0.34;
      const n = Math.max(1, Math.round((y1 - y0) / 0.27)), r = (y1 - y0) / n;
      for (let i = 0; i < n; i++) {
        G.box(x + dx * (i + 0.5) * tread, y0, z + dz * (i + 0.5) * tread,
          dx ? tread : width, r * (i + 1), dx ? width : tread, 0, i % 2 ? col : shade(col, 0.04), 'stone');
      }
      const L = n * tread;
      /* one long mass inside the flight so it survives the LOD cull of the small treads */
      if (n > 3) {
        G.beam(x + dx * tread * 1.5, y0 + r * 0.9, z + dz * tread * 1.5, x + dx * (L - tread), y1 - r * 1.6, z + dz * (L - tread),
          dx ? 0.3 : width * 0.9, dx ? width * 0.9 : 0.3, col, 'stone');
      }
      return L;
    };

    /* straight wall between two axis-aligned points; butt = buttress spacing */
    K.wall = function (x0, z0, x1, z1, h, t, c, o) {
      o = o || {};
      const ax = Math.abs(x1 - x0) >= Math.abs(z1 - z0), L = ax ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      const B = function (len, hh, y, th, col, off) {
        G.box(mx + (ax ? 0 : (off || 0)), y, mz + (ax ? (off || 0) : 0), ax ? len : th, hh, ax ? th : len, 0, col, 'stone');
      };
      B(L, h, 0, t, c);
      if (o.base !== false) B(L, o.baseH || 0.5, 0, t + 0.3, shade(c, -0.2));
      if (o.cap !== false) B(L + 0.2, o.capH || 0.26, h, t + 0.3, o.capC || shade(c, -0.16));
      if (o.butt) {
        const n = Math.max(2, Math.round(L / o.butt));
        for (let i = 1; i < n; i++) {
          const u = -L / 2 + i * L / n;
          [-1, 1].forEach(function (k) {
            if (o.bside && o.bside !== k) return;
            const px = ax ? mx + u : mx + k * (t / 2 + 0.28), pz = ax ? mz + k * (t / 2 + 0.28) : mz + u;
            G.box(px, 0, pz, ax ? 0.9 : 0.56, h - 0.35, ax ? 0.56 : 0.9, 0, shade(c, -0.06), 'stone');
          });
        }
      }
      return { ax: ax, L: L, mx: mx, mz: mz };
    };

    /* well head; o.sweep adds a shadoof (counterweighted sweep) */
    K.well = function (x, z, c, o) {
      o = o || {};
      G.cyl(x, 0, z, 1.25, 0.95, 0, c, 'stone');
      G.cyl(x, 0.95, z, 1.38, 0.14, 0, shade(c, -0.2), 'stone');
      G.cyl(x, 1.09, z, 0.95, 0.02, 0, 0x151513, 'stone');
      if (o.sweep) {
        const px = x + 2.1;
        [-1, 1].forEach(function (k) { G.rod(px, 0, z + k * 0.22, px, 3.55, z + k * 0.22, 0.1, TIMBER, 'wood'); });
        G.rod(px, 3.5, z - 0.3, px, 3.5, z + 0.3, 0.06, IRON, 'metal');
        G.rod(x + 4.3, 2.4, z, x - 0.1, 4.6, z, 0.08, shade(TIMBER, 0.1), 'wood');
        G.ball(x + 4.3, 2.25, z, 0.42, shade(c, -0.25), 'stone');
        G.rod(x - 0.1, 4.6, z, x - 0.1, 1.9, z, 0.02, ROPE, 'rope');
        G.cyl(x - 0.1, 1.55, z, 0.24, 0.36, 0, 0x5a4a34, 'wood');
      } else {
        [-1, 1].forEach(function (k) { G.box(x + k * 1.15, 1.09, z, 0.24, 2.0, 0.24, 0, TIMBER, 'wood'); });
        G.rod(x - 1.3, 2.9, z, x + 1.3, 2.9, z, 0.1, TIMBER, 'wood');
        G.rod(x, 2.9, z, x, 1.9, z, 0.02, ROPE, 'rope');
        G.cyl(x, 1.55, z, 0.22, 0.34, 0, 0x5a4a34, 'wood');
        G.hipRoof(x, 3.09, z, 2.9, 0.9, 1.3, 0, shade(TIMBER, 0.1), 'wood');
      }
    };

    /* rectangular pool: bed, water, kerb */
    K.pool = function (x, z, w, d, c, kh, y0) {
      kh = kh || 0.45; y0 = y0 || 0;
      G.box(x, y0, z, w, 0.08, d, 0, BED, 'stone');
      G.box(x, y0 + 0.08, z, w - 0.5, kh - 0.2, d - 0.5, 0, WATER, 'glass');
      const t = 0.4;
      [-1, 1].forEach(function (k) {
        G.box(x, y0, z + k * (d / 2 - t / 2), w, kh, t, 0, c, 'stone');
        G.box(x + k * (w / 2 - t / 2), y0, z, t, kh, d - 2 * t, 0, c, 'stone');
        G.box(x, y0 + kh, z + k * (d / 2 - t / 2), w + 0.1, 0.1, t + 0.1, 0, shade(c, -0.16), 'stone');
        G.box(x + k * (w / 2 - t / 2), y0 + kh, z, t + 0.1, 0.1, d - 2 * t, 0, shade(c, -0.16), 'stone');
      });
    };

    /* raised planting bed: kerb, soil, shrubs */
    K.bed = function (x, z, w, d, c, n, y0) {
      y0 = y0 || 0;
      const t = 0.3;
      [-1, 1].forEach(function (k) {
        G.box(x, y0, z + k * (d / 2 - t / 2), w, 0.5, t, 0, c, 'stone');
        G.box(x + k * (w / 2 - t / 2), y0, z, t, 0.5, d - 2 * t, 0, c, 'stone');
      });
      G.box(x, y0, z, w - 2 * t, 0.42, d - 2 * t, 0, SOIL, 'stone');
      for (let i = 0; i < (n || 4); i++) {
        const bx = x + G.rr(-0.5, 0.5) * (w - 1.6), bz = z + G.rr(-0.5, 0.5) * (d - 1.6), r = G.rr(0.45, 0.8);
        G.blob(bx, y0 + 0.42 + r * 0.5, bz, r, r * 1.3, G.rnd() * TAU, G.pick(LEAF), 'leafy');
      }
    };

    K.fountain = function (x, z, r, c) {
      G.cyl(x, 0, z, r + 0.45, 0.25, 0, shade(c, -0.25), 'stone');
      G.cyl(x, 0.25, z, r, 0.5, 0, c, 'stone');
      const n = 16, arc = TAU * (r - 0.15) / n + 0.06;
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU;
        G.box(x + Math.cos(a) * (r - 0.15), 0.75, z + Math.sin(a) * (r - 0.15), arc, 0.3, 0.3, -(a + Math.PI / 2), shade(c, -0.1), 'stone');
      }
      G.cyl(x, 0.75, z, r - 0.3, 0.14, 0, WATER, 'glass');
      G.cyl(x, 0.75, z, 0.36, 1.35, 0, shade(c, 0.05), 'stone');
      G.cyl(x, 2.1, z, 0.95, 0.24, 0, c, 'stone');
      G.cyl(x, 2.34, z, 0.8, 0.06, 0, WATER, 'glass');
      G.cyl(x, 2.34, z, 0.2, 0.6, 0, shade(c, 0.05), 'stone');
      G.ball(x, 3.0, z, 0.24, 0xb08d3c, 'metal');
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * TAU + 0.4;
        G.rod(x + Math.cos(a) * 0.95, 2.3, z + Math.sin(a) * 0.95, x + Math.cos(a) * 1.55, 0.9, z + Math.sin(a) * 1.55, 0.05, WATER, 'glass');
      }
    };

    /* robed statue on a plinth, staff in hand */
    K.statue = function (x, z, y, c, pc) {
      G.box(x, y, z, 1.5, 0.3, 1.5, 0, shade(pc, -0.2), 'stone');
      G.box(x, y + 0.3, z, 1.15, 1.6, 1.15, 0, pc, 'stone');
      G.box(x, y + 1.9, z, 1.4, 0.24, 1.4, 0, shade(pc, -0.2), 'stone');
      const b = y + 2.14;
      G.frustum(x, b, z, 0.44, 0.27, 1.4, 0, c, 'stone', 8);
      G.ball(x, b + 1.45, z, 0.32, c, 'stone');
      G.ball(x, b + 1.92, z, 0.2, c, 'stone');
      G.cone(x, b + 2.02, z, 0.26, 0.4, 0, c, 'stone');
      G.rod(x + 0.5, b, z + 0.1, x + 0.5, b + 2.6, z + 0.1, 0.045, c, 'stone');
      G.rod(x + 0.22, b + 1.4, z, x + 0.5, b + 1.2, z + 0.1, 0.08, c, 'stone');
    };

    /* a guar: stout body, two strong legs, small arms, long neck and tail */
    K.guar = function (x, z, a) {
      const dx = Math.cos(a), dz = Math.sin(a), px = -dz, pz = dx;
      G.blob(x, 1.25, z, 0.72, 1.15, 0, GUAR, 'skin');
      [-1, 1].forEach(function (k) {
        G.rod(x - dx * 0.2 + px * k * 0.38, 1.1, z - dz * 0.2 + pz * k * 0.38, x - dx * 0.05 + px * k * 0.42, 0, z - dz * 0.05 + pz * k * 0.42, 0.16, shade(GUAR, -0.1), 'skin');
        G.rod(x + dx * 0.55 + px * k * 0.3, 1.3, z + dz * 0.55 + pz * k * 0.3, x + dx * 0.8 + px * k * 0.32, 0.95, z + dz * 0.8 + pz * k * 0.32, 0.06, shade(GUAR, -0.1), 'skin');
      });
      G.rod(x + dx * 0.5, 1.5, z + dz * 0.5, x + dx * 1.05, 2.05, z + dz * 1.05, 0.2, GUAR, 'skin');
      G.blob(x + dx * 1.3, 2.1, z + dz * 1.3, 0.34, 0.44, 0, shade(GUAR, 0.06), 'skin');
      G.rod(x - dx * 0.6, 1.15, z - dz * 0.6, x - dx * 1.8, 0.35, z - dz * 1.8, 0.12, GUAR, 'skin');
    };

    /* small boat with a pointed bow and stern; along local z; (x,y,z) = keel bottom */
    K.boat = function (x, y, z, len, alongX, col, canopy) {
      const S = sub(G, x, y, z, alongX ? 1 : 0), hl = len * 0.31;
      S.box(0, 0, 0, 1.3, 0.14, len * 0.62, 0, shade(col, -0.2), 'wood');
      [-1, 1].forEach(function (k) {
        S.box(k * 0.68, 0, 0, 0.14, 0.8, len * 0.62, 0, col, 'wood');
        S.box(k * 0.68, 0.8, 0, 0.2, 0.1, len * 0.62, 0, shade(col, -0.15), 'wood');
        [-1, 1].forEach(function (e) {
          const ax = k * 0.68, az = e * hl, bz = e * len / 2, mx = ax / 2, mz = (az + bz) / 2;
          const L = Math.hypot(ax, bz - az);
          S.box(mx, 0, mz, 0.14, 0.8, L + 0.1, Math.atan2(-ax, bz - az), col, 'wood');
        });
      });
      S.rod(0, 0.3, len / 2 - 0.05, 0, 1.5, len / 2 + 0.1, 0.07, shade(col, -0.2), 'wood');
      [-0.5, 0.6].forEach(function (f) { S.box(0, 0.5, f * hl, 1.3, 0.1, 0.35, 0, shade(col, 0.1), 'wood'); });
      S.rod(-0.5, 0.75, -hl * 0.3, 0.9, 0.2, hl * 0.9, 0.04, shade(col, 0.15), 'wood');
      if (canopy) {
        [-1, 1].forEach(function (k) { [-1, 1].forEach(function (e) { S.rod(k * 0.6, 0.8, e * hl * 0.5, k * 0.6, 2.0, e * hl * 0.5, 0.04, TIMBER, 'wood'); }); });
        S.box(0, 2.0, 0, 1.5, 0.06, hl * 1.2, 0, canopy, 'cloth');
      }
    };
    return K;
  }

  /* ---------------------------------------------------------- flatHouse
     A lived-in flat-roofed house. Local frame: door on +z, w along x, d along z.
     o: w d fl fh c plinth | stair: 2|3 (masonry up that flank) or 'L2'|'L3' (ladder)
        blind: [sides] no windows below wallH | room (default true) rw rd roomDome
        cover: 'awn'|'pergola'|'sail'|null | cloth | clutter | doorX doorW lamp
        shut arch grille mud canopy balcony */
  function flatHouse(P, ox, oy, oz, q, o) {
    const G = sub(P, ox, oy, oz, q), K = kit(G);
    const w = o.w, d = o.d, fl = o.fl || 2, fh = o.fh || 3.0, c = o.c, pb = o.plinth == null ? 0.3 : o.plinth;
    const H = pb + fl * fh, blind = o.blind || [], wallH = o.wallH == null ? 99 : o.wallH, ph = o.ph || 0.95;
    const ladder = typeof o.stair === 'string';
    const sgn = (o.stair === 2 || o.stair === 'L2') ? 1 : ((o.stair === 3 || o.stair === 'L3') ? -1 : 0);
    const stairSide = sgn > 0 ? 2 : 3;
    const mud = !!o.mud;

    G.box(0, 0, 0, w + 0.5, pb, d + 0.5, 0, shade(c, -0.24), 'stone');
    const bands = [];
    for (let f = 1; f < fl; f++) bands.push(f * fh - 0.1);
    const B = K.mass(0, pb, 0, w, fl * fh, d, c, { cornice: !mud, bands: mud ? [] : bands });

    /* stair / ladder geometry first: windows avoid it */
    const gaps = [];
    let zTop = -d / 2 + 0.45, zStart = 0, L = 0;
    if (sgn && !ladder) {
      const n = Math.round(H / 0.27);
      const tr = Math.max(0.26, Math.min(0.34, (d + 1.0 - 0.45) / n));
      L = n * tr; zStart = zTop + L;
      const sx = sgn * (w / 2 + 0.57);
      K.stair(sx, zStart, 0, H, 0, -1, 1.1, shade(c, -0.08), tr);
      const rx = sgn * (w / 2 + 1.06);
      G.rod(rx, 0.95, zStart - 0.2, rx, H + 0.95, zTop + 0.2, 0.05, TIMBER, 'wood');
      [zStart - 0.2, zTop + 0.2].forEach(function (pz) {
        const yy = pz > zStart - 1 ? 0 : H;
        G.rod(rx, yy, pz, rx, yy + 0.97, pz, 0.06, TIMBER, 'wood');
      });
      gaps.push({ s: stairSide, u: zTop + 0.6, w: 1.2 });
    } else if (sgn && ladder) {
      K.ladder(sgn * w / 2, -d / 2 + 1.1, 0, H, stairSide);
      gaps.push({ s: stairSide, u: -d / 2 + 1.1, w: 1.0 });
    }
    const stairH = function (u) { return H * (zStart - u) / L; };

    /* door, windows */
    const dx = o.doorX || 0, dw = o.doorW || 1.3;
    const leaf = o.leaf || G.pick(LEAVES);
    K.door(dx, pb, d / 2, dw, 2.3, 0, c, { lamp: o.lamp, leaf: leaf });
    if (o.canopy) K.awn(dx, d / 2, pb + 3.0, 0, dw + 1.6, 1.3, o.canopy);
    const wo = { shut: false, arch: o.arch, grille: false, lintelC: mud ? TIMBER : null, sill: !mud };
    for (let f = 0; f < fl; f++) {
      const y = pb + f * fh + (f === 0 ? 1.0 : 0.9);
      for (let s = 0; s < 4; s++) {
        if (blind.indexOf(s) >= 0 && pb + (f + 1) * fh <= wallH + 0.6) continue;
        const skip = [];
        if (s === 0 && f === 0) skip.push([dx, dw / 2 + 1.1]);
        if (s === 0 && o.balcony && f === o.balcony.floor) skip.push([0, o.balcony.w / 2 + 0.4]);
        let fn = null;
        if (sgn && s === stairSide) {
          if (ladder) fn = function (u) { return Math.abs(u - (-d / 2 + 1.1)) < 1.0; };
          else fn = function (u) {
            const sh = stairH(u);
            return u > zTop - 0.5 && u < zStart + 0.5 && sh > y - 0.9 && sh < y + 2.6;
          };
        }
        const ww = s === 0 ? 1.0 : 0.9, wh = f === 0 ? 1.3 : 1.2;
        const opts = Object.assign({}, wo, { shut: o.shut && f === 0 && s === 0, grille: o.grille && f === 0 });
        K.row(B, s, y, ww, wh, opts, o.pitch || 2.7, skip, 0, fn);
      }
    }

    /* balcony (loggia) on the front */
    if (o.balcony) {
      const by = pb + o.balcony.floor * fh, bw = o.balcony.w;
      G.box(0, by - 0.25, d / 2 + 0.65, bw, 0.25, 1.3, 0, shade(c, -0.18), 'stone');
      [-1, 1].forEach(function (k) {
        G.beam(k * (bw / 2 - 0.4), by - 0.25, d / 2 + 0.05, k * (bw / 2 - 0.4), by - 1.2, d / 2 + 0.05, 0.25, 0.25, TIMBER, 'wood');
        G.beam(k * (bw / 2 - 0.4), by - 1.2, d / 2 + 0.1, k * (bw / 2 - 0.4), by - 0.26, d / 2 + 1.15, 0.2, 0.2, TIMBER, 'wood');
        G.box(k * (bw / 2 - 0.06), by, d / 2 + 0.65, 0.12, 0.95, 1.3, 0, TIMBER, 'wood');
      });
      G.box(0, by, d / 2 + 1.24, bw, 0.95, 0.12, 0, TIMBER, 'wood');
      K.door(0, by, d / 2, 1.1, 2.2, 0, c, { leaf: leaf, base: by, step: false });
      if (o.balcony.awn) K.awn(0, d / 2, by + 2.95, 0, bw, 1.3, o.balcony.awn);
    }

    /* spouts and (mud) beam ends */
    [-1, 1].forEach(function (k) {
      if (blind.indexOf(0) < 0) K.fb(k * (w / 2 - 0.7), H - 0.3, d / 2, 0.22, 0.22, 0.8, 0, 0.4, mud ? TIMBER : shade(c, -0.25), mud ? 'wood' : 'stone');
    });
    if (mud) {
      [0, 1].forEach(function (s) {
        if (blind.indexOf(s) >= 0 && H < wallH + 0.5) return;
        const n = Math.floor(w / 1.0);
        for (let i = 0; i < n; i++) {
          const u = -w / 2 + (i + 0.5) * w / n;
          K.fb(u, H - 0.55, K.nrm(s)[1] * d / 2, 0.16, 0.16, 0.5, s, 0.2, TIMBER, 'wood');
        }
      });
    }

    /* parapet */
    K.parapet(B, ph, 0.3, gaps, mud ? shade(c, -0.1) : null);
    if (mud) {
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        G.cyl(p[0] * (w / 2 - 0.15), H + ph + 0.14, p[1] * (d / 2 - 0.15), 0.2, 0.28, 0, shade(c, -0.05), 'stone');
      });
    }

    /* roof room */
    let top = H + ph + 0.14;
    const rw = o.rw || Math.min(w * 0.48, 4.6), rd = o.rd || Math.min(d * 0.46, 4.0), rh = 2.6;
    const rx = (sgn ? -sgn : (o.roomSide || 1)) * (w / 2 - 0.3 - rw / 2), rz = -d / 2 + 0.3 + rd / 2;
    const room = o.room !== false;
    if (room) {
      const rc = shade(c, 0.04);
      const R = K.mass(rx, H, rz, rw, rh, rd, rc, { cornice: !mud });
      K.parapet(R, 0.35, 0.2, [], null);
      const rdx = rw > 3.2 ? rx - Math.sign(rx || 1) * rw * 0.18 : rx;
      K.door(rdx, H, rz + rd / 2, 1.0, 1.95, 0, rc, { leaf: leaf, base: H });
      if (rw > 3.2) K.win(rx + Math.sign(rx || 1) * rw * 0.25, H + 1.0, rz + rd / 2, 0.7, 0.85, 0, rc, wo);
      K.row(R, 2, H + 1.1, 0.7, 0.85, wo, 2.2);
      K.row(R, 3, H + 1.1, 0.7, 0.85, wo, 2.2);
      K.row(R, 1, H + 1.1, 0.7, 0.85, wo, 2.4);
      if (o.roomDome) {
        const dr = Math.min(rw, rd) * 0.36;
        G.cyl(rx, H + rh, rz, dr, 0.5, 0, rc, 'stone');
        G.dome(rx, H + rh + 0.5, rz, dr, dr * 0.9, 0, o.roomDome, 'dome');
        G.ball(rx, H + rh + 0.5 + dr * 0.9 + 0.1, rz, 0.16, 0xb08d3c, 'metal');
        top = Math.max(top, H + rh + 0.6 + dr * 0.9 + 0.2);
      } else {
        const fx = rx + rw * 0.3 * (rx > 0 ? 1 : -1), fz = rz - rd * 0.22;
        G.box(fx, H + rh, fz, 0.55, 0.9, 0.55, 0, shade(rc, -0.22), 'stone');
        G.box(fx, H + rh + 0.9, fz, 0.8, 0.18, 0.8, 0, shade(rc, -0.32), 'stone');
        top = Math.max(top, H + rh + 1.08);
      }
      top = Math.max(top, H + rh + 0.35 + 0.14);
    }

    /* terrace cover and storage */
    const tz0 = room ? rz + rd / 2 : -d / 2 + 0.3, tz1 = d / 2 - 0.3, td = tz1 - tz0;
    const cloth = o.cloth || G.pick(SAIL);
    let cover = o.cover;
    if (cover === 'pergola' && w < 7.5) cover = room ? 'awn' : 'sail';
    let awnD = 0;
    if (cover === 'awn' && room) {
      awnD = Math.min(td - 0.5, 2.4);
      K.awn(rx, rz + rd / 2, H + rh - 0.1, 0, rw, awnD, cloth, H);
      top = Math.max(top, H + rh + 0.1);
    } else if (cover === 'pergola') {
      const pw = Math.min(w - 4.6, 6.5), pd = Math.max(1.6, td - 0.8);
      K.pergola(0, H, tz0 + 0.4 + pd / 2, pw, pd, 2.6, cloth);
      top = Math.max(top, H + 2.8);
    } else if (cover === 'sail') {
      const sw = w - 2.4, sd = Math.max(1.4, td - 1.6);
      K.sail(0, H, tz0 + 0.3 + 0.45 + sd / 2, sw, sd, 2.7, cloth);
      top = Math.max(top, H + 3.1);
    }
    if (o.clutter !== false && td > 1.5) {
      const sideA = sgn ? -sgn : -1, ax = sideA * (w / 2 - 0.85), cz = tz1 - 0.6;
      K.cistern(ax, H, cz, 0.5, 1.0, shade(c, -0.12));
      K.jar(ax, H, cz - 1.15, 0.27, G.pick(POTS));
      if (td > 2.6) K.jar(ax + 0.05, H, cz - 1.8, 0.23, G.pick(POTS));
      const bx = -sideA * (w / 2 - 0.85);
      K.crate(bx, H, cz, 0.8, 0.2);
      K.crate(bx, H + 0.64, cz, 0.6, -0.3);
      if (td > 2.6) K.rug(bx, H, cz - 1.3, 1.0, true, G.pick(BANNER));
      if (cover !== 'pergola' && cover !== 'sail' && td - awnD > 2.2 && w > 6.5) {
        const rl = Math.min(w - 4.8, 3.2);
        K.rack(0, H, (tz0 + awnD + tz1) / 2 + 0.2, rl, true, [G.pick(BANNER), G.pick(SAIL), G.pick(BANNER)]);
      }
    }
    return { G: G, K: K, H: H, top: top, B: B };
  }

  /* ================================================================ MANORS */

  /* v0 — Hlaalu: walled forecourt garden, gatehouse, main hall with stacked
     green copper hip roofs, kitchen-store and stable along the side walls */
  function manorHlaalu(F) {
    const G = sub(F, 0, 0, -0.665, 0), K = kit(G);
    const c = F.pick(ST), cu = F.pick(CU), cor = shade(c, -0.14), dk = shade(c, -0.24);
    const WH = 3.4, WT = 0.8, gz = 22.6, bz = -23.6, sx = 21.6;

    /* enclosure, copper-tiled coping, buttresses outside */
    K.wall(-sx - 0.4, bz, sx + 0.4, bz, WH, WT, c, { butt: 5.5, bside: -1, capC: cu });
    [-1, 1].forEach(function (k) {
      K.wall(k * sx, bz, k * sx, gz, WH, WT, c, { butt: 5.5, bside: k, capC: cu });
      K.wall(k * 4.5, gz, k * (sx + 0.4), gz, WH, WT, c, { butt: 5.5, bside: 1, capC: cu });
    });
    /* back postern */
    K.door(8, 0, bz - WT / 2, 1.2, 2.3, 1, c, { leaf: LEAVES[1] });
    K.fb(8, 0, bz + WT / 2, 1.2, 2.3, 0.1, 0, 0.02, LEAVES[1], 'wood');

    /* gatehouse: two piers, room over the passage, hip roof */
    [-1, 1].forEach(function (k) { G.box(k * 3.05, 0, gz, 2.9, 4.2, 5, 0, c, 'stone'); });
    G.box(0, 3.9, gz, 3.3, 0.35, 5, 0, cor, 'stone');
    G.box(0, 0, gz, 3.2, 3.9, 0.3, 0, LEAVES[1], 'wood');
    [0.9, 2.8].forEach(function (y) { G.box(0, y, gz, 3.2, 0.12, 0.42, 0, IRON, 'metal'); });
    const GB = K.mass(0, 4.2, gz, 9, 3.2, 5, shade(c, 0.03), { bands: [0] });
    G.box(0, 0, gz, 9.4, 0.5, 5.4, 0, dk, 'stone');
    [0, 1].forEach(function (s) {
      G.box(0, 3.55, gz + (s ? -1 : 1) * 2.55, 4.2, 0.65, 0.3, 0, cor, 'stone');
      K.row(GB, s, 5.3, 0.9, 1.2, { arch: true }, 3.2, null, 2);
    });
    K.row(GB, 2, 5.3, 0.9, 1.2, { arch: true }, 3, null, 1);
    K.row(GB, 3, 5.3, 0.9, 1.2, { arch: true }, 3, null, 1);
    K.hip(0, 7.4, gz, 10.8, 6.8, 3.0, cu);
    [-1, 1].forEach(function (k) {
      G.rod(k * 2.3, 3.2, gz + 2.5, k * 2.3, 3.2, gz + 3.2, 0.06, IRON, 'metal');
      G.ball(k * 2.3, 2.9, gz + 3.2, 0.24, GLOW, 'glow');
      G.box(k * 6.3, 0, gz + 1.2, 2.2, 0.5, 0.7, 0, dk, 'stone');
      G.rod(k * 3.4, 6.85, gz + 2.5, k * 3.4, 6.85, gz + 3.05, 0.05, IRON, 'metal');
      G.rod(k * 3.4 - 0.55, 6.8, gz + 2.98, k * 3.4 + 0.55, 6.8, gz + 2.98, 0.04, IRON, 'metal');
      G.box(k * 3.4, 4.5, gz + 2.98, 1.0, 2.3, 0.06, 0, F.pick(BANNER), 'cloth');
    });

    /* main hall: podium, ground storey, copper skirt roof, upper storey, crown roof */
    const hz = -14;
    G.box(0, 0, hz, 29.6, 0.6, 15.6, 0, dk, 'stone');
    const B1 = K.mass(0, 0.6, hz, 28, 5.0, 14, c, { cornice: false, bands: [0.4] });
    G.box(0, 5.6, hz, 30.4, 0.24, 16.4, 0, shade(cu, -0.3), 'roof');
    G.hipRoof(0, 5.84, hz, 30.4, 4.0, 16.4, 0, cu, 'roof');
    const B2 = K.mass(0, 5.6, hz, 20, 4.4, 10, shade(c, 0.03), {});
    K.hip(0, 10.0, hz, 23.4, 13.4, 4.6, cu);
    /* ground-storey windows all round, tall and shuttered to the court */
    K.row(B1, 0, 1.9, 1.2, 1.9, { arch: true, shut: true }, 3.6, [[0, 5.2]]);
    K.row(B1, 1, 1.9, 1.1, 1.8, { arch: true }, 3.6, [[-6, 1.4]]);
    K.row(B1, 2, 1.9, 1.1, 1.8, { arch: true }, 3.4, [[2, 1.5]]);
    K.row(B1, 3, 1.9, 1.1, 1.8, { arch: true }, 3.4, [[2, 1.5]]);
    [0, 1, 2, 3].forEach(function (s) { K.row(B2, s, 7.8, 1.0, 1.3, { arch: true }, s < 2 ? 3.2 : 2.8); });
    K.door(0, 0.6, hz + 7, 2.1, 3.3, 0, c, { head: 0.7, leaf: LEAVES[1] });
    K.door(14, 0.6, hz + 2, 1.4, 2.6, 2, c, {});
    K.door(-14, 0.6, hz + 2, 1.4, 2.6, 3, c, {});
    K.door(-6, 0.6, hz - 7, 1.4, 2.6, 1, c, {});
    /* chimneys through the skirt at the back */
    [-8, 8].forEach(function (x) {
      G.box(x, 5.6, hz - 6, 1.0, 5.4, 1.0, 0, shade(c, -0.2), 'stone');
      G.box(x, 11.0, hz - 6, 1.3, 0.4, 1.3, 0, shade(c, -0.32), 'stone');
    });
    /* porch: timber-and-stone columns under a copper lean-to, front steps */
    G.box(0, 0, -5.3, 10.4, 0.6, 3.4, 0, dk, 'stone');
    G.box(0, 0, -3.25, 7.0, 0.3, 0.7, 0, shade(c, -0.18), 'stone');
    [-4.4, -1.8, 1.8, 4.4].forEach(function (x) {
      G.box(x, 0.6, -3.9, 0.7, 0.3, 0.7, 0, cor, 'stone');
      G.cyl(x, 0.9, -3.9, 0.26, 3.3, 0, shade(c, 0.06), 'stone');
      G.box(x, 4.2, -3.9, 0.75, 0.3, 0.75, 0, cor, 'stone');
    });
    G.box(0, 4.5, -3.9, 10.2, 0.3, 0.45, 0, TIMBER, 'wood');
    G.sheet(0, 5.35, -7.0, 0, 4.42, -3.3, 10.6, cu, 'roof', 0.22);
    [-1, 1].forEach(function (k) {
      G.rod(k * 3.1, 3.6, -7.0, k * 3.1, 3.6, -6.3, 0.06, IRON, 'metal');
      G.ball(k * 3.1, 3.3, -6.3, 0.24, GLOW, 'glow');
    });

    /* left: kitchen and store, flat roof lived on (faces the court, +x) */
    flatHouse(G, -17.7, 0, 4, 1, {
      w: 14, d: 7, fl: 2, fh: 3.0, c: shade(c, 0.02), stair: 2, blind: [1], wallH: WH,
      cover: 'awn', cloth: F.pick(SAIL), shut: true, arch: true
    });

    /* right: stable with hay loft under a copper hip roof, open bays to the court */
    (function () {
      const S = sub(G, 17.7, 0, 4, -1), SK = kit(S), sc = shade(c, -0.03);
      S.box(0, 0, 0, 14.5, 0.3, 7.5, 0, dk, 'stone');
      const SB = SK.mass(0, 0.3, 0, 14, 5.2, 7, sc, { bands: [3.2] });
      [-4.5, -1.5, 1.5, 4.5].forEach(function (x, i) {
        SK.fb(x, 0.3, 3.5, 2.4, 2.8, 0.2, 0, 0.02, 0x241f18, 'wood');
        SK.fb(x, 3.1, 3.5, 2.8, 0.3, 0.3, 0, 0.1, TIMBER, 'wood');
        if (i % 2 === 0) SK.fb(x, 0.3, 3.5, 2.3, 1.2, 0.1, 0, 0.14, 0x5a4028, 'wood');
        else S.box(x, 0.3, 4.4, 1.2, 0.8, 0.9, 0.2, HAY, 'straw');
      });
      [-6, -3, 0, 3, 6].forEach(function (x) { SK.fb(x, 0.3, 3.5, 0.3, 2.8, 0.3, 0, 0.15, TIMBER, 'wood'); });
      SK.fb(0, 3.6, 3.5, 1.6, 1.5, 0.2, 0, 0.04, 0x5a4028, 'wood');
      S.beam(0, 5.1, 3.5, 0, 5.1, 4.8, 0.25, 0.25, TIMBER, 'wood');
      S.rod(0, 5.0, 4.7, 0, 3.4, 4.7, 0.02, ROPE, 'rope');
      SK.row(SB, 2, 1.6, 0.8, 1.0, { grille: true }, 2.6, null, 2);
      SK.row(SB, 3, 1.6, 0.8, 1.0, { grille: true }, 2.6, null, 2);
      SK.row(SB, 2, 3.9, 0.7, 0.9, {}, 2.6, null, 1);
      SK.row(SB, 3, 3.9, 0.7, 0.9, {}, 2.6, null, 1);
      SK.door(-7, 0.3, 0, 1.3, 2.3, 3, sc, {});
      K.hip(17.7, 5.5, 4, 8.6, 15.6, 3.0, cu);
      S.box(-3, 0, 5.4, 3.0, 0.7, 0.8, 0, shade(c, -0.2), 'stone');
      S.box(-3, 0.5, 5.4, 2.6, 0.12, 0.5, 0, WATER, 'glass');
    })();

    /* forecourt garden: paved cross, fountain, four beds with trees */
    G.box(0, 0, 8.5, 3.2, 0.1, 23.2, 0, shade(c, 0.1), 'stone');
    G.box(0, 0, 8, 24, 0.1, 2.4, 0, shade(c, 0.1), 'stone');
    K.fountain(0, 8, 2.4, shade(c, 0.05));
    [[-7.2, 2.5], [7.2, 2.5], [-7.2, 13.6], [7.2, 13.6]].forEach(function (p, i) {
      K.bed(p[0], p[1], 9.4, 7.6, shade(c, -0.1), 5);
      G.tree(p[0] + (p[0] > 0 ? 1.2 : -1.2), p[1], i < 2 ? 'olive' : 'cypress', i < 2 ? 5.2 : 6.5, 0.42);
    });
    [-1, 1].forEach(function (k) {
      G.box(k * 3.6, 0, 8, 0.5, 0.45, 1.8, 0, shade(c, -0.15), 'stone');
      G.box(k * 3.6, 0.45, 8, 0.6, 0.1, 2.0, 0, shade(c, -0.25), 'stone');
    });
    /* service yard behind the hall */
    for (let i = 0; i < 4; i++) G.rod(-12 + i * 0.1, 0.25 + i * 0.4, bz + 1.0, -6, 0.25 + i * 0.4, bz + 1.0, 0.24, 0x5d5140, 'wood');
    K.jar(4, 0, bz + 1.1, 0.35, POTS[0]); K.jar(4.9, 0, bz + 1.1, 0.3, POTS[1]);
    K.crate(11, 0, bz + 1.2, 0.9, 0.1);
  }

  /* v1 — Velothi: battered keep-house with a dome on a podium, terraces
     stepping down a grand stair to a water garden, pylons at the gate */
  function manorVelothi(F) {
    const G = sub(F, 0, 0, -1.9, 0), K = kit(G);
    const c = F.pick(ST), dk = shade(c, -0.22), domeC = F.pick(DOMEDK), cl = F.pick(SAIL);
    const PZ = -10.5, PW = 30, PD = 21, PH = 3.0;

    /* podium (upper terrace) with talus, buttresses, parapet */
    G.box(0, 0, PZ, PW + 1.2, 1.0, PD + 1.2, 0, dk, 'stone');
    const PB = K.mass(0, 0, PZ, PW, PH, PD, c, { corC: dk });
    [-12, -6, 6, 12].forEach(function (x) { G.frustum(x, 0, PZ - PD / 2 - 0.4, 0.7, 0.45, 3.0, 0, shade(c, -0.08), 'stone', 4); });
    [-7, 0, 7].forEach(function (z) {
      [-1, 1].forEach(function (k) { G.frustum(k * (PW / 2 + 0.4), 0, PZ + z, 0.7, 0.45, 3.0, 0, shade(c, -0.08), 'stone', 4); });
    });
    K.parapet(PB, 0.9, 0.35, [{ s: 0, u: 0, w: 4.4 }]);

    /* keep-house: battered square mass */
    const kz = -13, hw = function (y) { return 7 - 0.9 * (y - 3) / 10; };
    G.frustum(0, 3, kz, 7, 6.1, 10, 0, c, 'stone', 4);
    G.frustum(0, 7.7, kz, hw(7.7) + 0.14, hw(8.0) + 0.14, 0.3, 0, dk, 'stone', 4);
    G.box(0, 12.8, kz, 12.9, 0.4, 12.9, 0, dk, 'stone');
    const KB = { x: 0, z: kz, w: 12.4, d: 12.4, c: c, top: 13.2 };
    G.box(0, 13.0, kz, 12.4, 0.2, 12.4, 0, shade(c, 0.05), 'stone');
    K.parapet(KB, 1.0, 0.35, []);
    /* windows on every battered face */
    for (let s = 0; s < 4; s++) {
      const n = K.nrm(s), f = s < 2;
      [[4.3, 1.8, 0.65], [9.0, 1.6, 1.05]].forEach(function (lv, li) {
        const y = lv[0], fz = hw(y + lv[1] / 2) + 0.02;
        const us = s === 0 && li === 0 ? [-3.8, 3.8] : (li === 0 ? [-3.2, 0, 3.2] : [-3.4, 0, 3.4]);
        us.forEach(function (u) {
          if (s === 0 && li === 1 && u === 0) return;
          if (s === 2 && u < -2) return;
          K.win(f ? u : n[0] * fz, y, kz + (f ? n[1] * fz : u), lv[2], lv[1], s, c, { arch: li === 1, grille: li === 0 });
        });
      });
    }
    /* front: pylon-framed portal and a stone balcony above */
    const zf = kz + hw(4.5);
    K.door(0, 3, zf, 1.8, 3.0, 0, c, { base: 3, lamp: true, head: 0.6, leaf: LEAVES[1] });
    [-1, 1].forEach(function (k) {
      G.frustum(k * 2.0, 3, zf + 0.5, 0.65, 0.45, 4.6, 0, dk, 'stone', 4);
      G.pyrRoof(k * 2.0, 7.6, zf + 0.5, 1.1, 0.7, 1.1, 0, domeC, 'roof');
    });
    G.box(0, 6.3, zf + 0.4, 3.4, 0.6, 0.9, 0, dk, 'stone');
    const bzf = kz + hw(9);
    G.box(0, 8.7, bzf + 0.7, 4.2, 0.3, 1.5, 0, dk, 'stone');
    [-1.5, 1.5].forEach(function (x) { G.beam(x, 8.7, bzf + 0.1, x, 7.9, bzf + 0.1, 0.35, 0.35, dk, 'stone'); G.beam(x, 7.9, bzf + 0.1, x, 8.7, bzf + 1.2, 0.3, 0.3, dk, 'stone'); });
    G.box(0, 9.0, bzf + 1.38, 4.2, 0.8, 0.16, 0, c, 'stone');
    [-1, 1].forEach(function (k) { G.box(k * 2.02, 9.0, bzf + 0.7, 0.16, 0.8, 1.5, 0, c, 'stone'); });
    K.door(0, 9.0, bzf, 1.1, 2.1, 0, c, { base: 9.0, step: false, leaf: LEAVES[1], arch: true });

    /* drum and dome set back on the roof; pergola and storage on the roof terrace */
    const dz = kz - 1.4;
    G.cyl(0, 13.2, dz, 3.4, 1.7, 0, shade(c, 0.04), 'stone');
    G.cyl(0, 14.6, dz, 3.5, 0.3, 0, dk, 'stone');
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      G.box(Math.cos(a) * 3.42, 13.6, dz + Math.sin(a) * 3.42, 0.5, 0.8, 0.12, -(a + Math.PI / 2), DOOR, 'wood');
    }
    G.dome(0, 14.9, dz, 3.4, 3.5, 0, domeC, 'dome');
    G.rod(0, 18.2, dz, 0, 19.3, dz, 0.08, IRON, 'metal');
    G.ball(0, 19.3, dz, 0.3, 0xd0a53c, 'metal');
    K.pergola(0, 13.2, -8.6, 7, 2.2, 2.5, cl);
    [-1, 1].forEach(function (k) {
      K.cistern(k * 4.6, 13.2, -8.6, 0.55, 1.0, dk);
      K.jar(k * 4.6, 13.2, -10.2, 0.28, POTS[0]);
      K.jar(k * 4.9, 13.2, -11.0, 0.24, POTS[2]);
    });
    K.rug(-4.4, 13.2, -16.5, 1.4, true, F.pick(BANNER));
    K.crate(4.4, 13.2, -16.6, 0.8, 0.2);

    /* stair turret at the back corner, door out onto the roof */
    const tx = 6.4, tz = -18.0, thw = function (y) { return 1.8 - 0.35 * (y - 3) / 13.4; };
    G.frustum(tx, 3, tz, 1.8, 1.45, 13.4, 0, shade(c, 0.03), 'stone', 4);
    G.box(tx, 16.4, tz, 3.3, 0.35, 3.3, 0, dk, 'stone');
    G.pyrRoof(tx, 16.75, tz, 3.0, 2.0, 3.0, 0, domeC, 'roof');
    K.door(tx - thw(14), 13.2, tz + 0.1, 0.9, 2.0, 3, c, { base: 13.2, step: false });
    K.door(tx + thw(4), 3, tz, 0.9, 2.1, 2, c, { base: 3 });
    [7, 10.5].forEach(function (y) {
      K.win(tx + thw(y), y, tz, 0.4, 1.3, 2, c, { sill: false });
      K.win(tx, y + 1.5, tz - thw(y + 1.5), 0.4, 1.2, 1, c, { sill: false });
    });

    /* left wing: guest house on the podium, roof room and awning */
    flatHouse(G, -9.9, PH, -13, 0, {
      w: 6.4, d: 10, fl: 1, fh: 3.2, c: shade(c, 0.05), stair: 'L3', blind: [2],
      cover: 'awn', cloth: F.pick(SAIL), arch: true, roomDome: domeC
    });
    /* right: kiosk pavilion on four little pylons */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      G.frustum(10.5 + p[0] * 1.8, PH, -7 + p[1] * 1.8, 0.42, 0.32, 3.0, 0, dk, 'stone', 4);
    });
    G.box(10.5, PH + 3.0, -7, 4.6, 0.4, 4.6, 0, dk, 'stone');
    G.cyl(10.5, PH + 3.4, -7, 1.9, 0.5, 0, c, 'stone');
    G.dome(10.5, PH + 3.9, -7, 1.9, 1.7, 0, domeC, 'dome');
    G.ball(10.5, PH + 5.7, -7, 0.2, 0xd0a53c, 'metal');
    G.box(10.5, PH, -7, 2.4, 0.45, 0.8, 0, dk, 'stone');
    [[-13.2, -19.3], [13.2, -19.3], [13.2, -1.5]].forEach(function (p) { K.planter(p[0], PH, p[1], 0.55, shade(c, -0.1)); });

    /* middle terrace and the grand stair axis */
    G.box(0, 0, 4.5, 32.6, 0.7, 9.6, 0, dk, 'stone');
    const MB = K.mass(0, 0, 4.5, 32, 1.5, 9, c, { corC: dk });
    K.parapet({ x: 0, z: 4.5, w: 32, d: 9, c: c, top: 1.5 }, 0.8, 0.3, [{ s: 0, u: 0, w: 5.4 }, { s: 1, u: 0, w: 32 }]);
    K.stair(0, 2.4, 1.5, PH, 0, -1, 4.0, shade(c, 0.05), 0.4);
    [-1, 1].forEach(function (k) { G.box(k * 2.25, 1.5, 1.2, 0.5, 1.9, 2.4, 0, dk, 'stone'); });
    K.stair(0, 11.4, 0, 1.5, 0, -1, 5.0, shade(c, 0.05), 0.4);
    [-1, 1].forEach(function (k) {
      G.box(k * 2.75, 0, 10.2, 0.5, 1.8, 2.4, 0, dk, 'stone');
      G.frustum(k * 3.3, 0, 11.2, 0.55, 0.4, 3.2, 0, dk, 'stone', 4);
      G.pyrRoof(k * 3.3, 3.2, 11.2, 0.95, 0.6, 0.95, 0, domeC, 'roof');
      G.ball(k * 3.3, 3.0, 11.75, 0.2, GLOW, 'glow');
    });
    const MG = sub(G, 0, 1.5, 0, 0), MK = kit(MG);
    [-1, 1].forEach(function (k) {
      MK.bed(k * 9.5, 4.5, 10, 5.4, shade(c, -0.1), 5);
      MG.tree(k * 9.5, 4.5, 'olive', 4.6, 0.42);
      MK.planter(k * 4.2, 0, 1.2, 0.5, shade(c, -0.1));
      MK.planter(k * 4.2, 0, 7.8, 0.5, shade(c, -0.1));
    });
    void MB;

    /* water garden at grade: rill, lily pools, walls, gate pylons */
    G.box(0, 0, 18, 10, 0.1, 13.2, 0, shade(c, 0.1), 'stone');
    K.pool(0, 17.3, 3.6, 9.6, shade(c, -0.05), 0.4, 0.1);
    [-1, 1].forEach(function (k) {
      K.pool(k * 10, 17, 7, 8, shade(c, -0.05), 0.5);
      for (let i = 0; i < 5; i++) {
        const lx = k * 10 + F.rr(-2.4, 2.4), lz = 17 + F.rr(-2.8, 2.8);
        G.cyl(lx, 0.34, lz, F.rr(0.35, 0.6), 0.04, 0, 0x4e6a3a, 'leafy');
        if (i < 2) G.ball(lx, 0.46, lz, 0.14, 0xecc3cf, 'leafy');
      }
      for (let i = 0; i < 6; i++) {
        const rx = k * 13.2 + F.rr(-0.4, 0.4), rz = 12.6 + F.rr(-0.4, 0.4);
        G.rod(rx, 0, rz, rx + F.rr(-0.3, 0.3), F.rr(1.2, 1.9), rz + F.rr(-0.3, 0.3), 0.03, F.pick(REED), 'leafy');
      }
      K.wall(k * 15.7, 9, k * 15.7, 24.5, 1.6, 0.6, c, { butt: 4, bside: k });
      K.wall(k * 6.3, 24.5, k * 16.0, 24.5, 1.6, 0.6, c, { butt: 4, bside: 1 });
      G.tree(k * 13.4, 22.4, 'cypress', 7, 0);
      /* gate pylons */
      G.frustum(k * 5.2, 0, 24.5, 1.3, 0.85, 6.5, 0, c, 'stone', 4);
      G.frustum(k * 5.2, 3.2, 24.5, 1.08 + 0.12, 1.06 + 0.12, 0.3, 0, dk, 'stone', 4);
      G.box(k * 5.2, 6.5, 24.5, 2.1, 0.35, 2.1, 0, dk, 'stone');
      G.pyrRoof(k * 5.2, 6.85, 24.5, 2.0, 1.3, 2.0, 0, domeC, 'roof');
      G.rod(k * 4.3, 4.6, 24.5, k * 3.6, 4.6, 24.5, 0.06, IRON, 'metal');
      G.ball(k * 3.6, 4.3, 24.5, 0.24, GLOW, 'glow');
      G.rod(k * 5.2, 5.55, 25.35, k * 5.2, 5.55, 26.05, 0.05, IRON, 'metal');
      G.rod(k * 5.2 - 0.5, 5.5, 25.98, k * 5.2 + 0.5, 5.5, 25.98, 0.04, IRON, 'metal');
      G.box(k * 5.2, 2.0, 25.98, 0.9, 3.45, 0.06, 0, F.pick(BANNER), 'cloth');
    });
    G.box(0, 0, 24.5, 7.8, 0.14, 1.4, 0, dk, 'stone');
  }

  /* v2 — Redoran/Mournhold: domed hall with painted drum and window band,
     colonnaded porch, statues on plinths, stable and guar pen, servants' wing */
  function manorDomed(F) {
    const G = sub(F, 1.5, 0, -4.45, 0), K = kit(G);
    const c = F.pick(ST), dk = shade(c, -0.22), domeC = F.pick(DOMEDK), lap = F.pick(LAPIS), por = F.pick(PORPH);
    const mar = F.pick(MARBLE), hz = -6;

    /* hall */
    G.box(0, 0, hz, 22.4, 1.2, 22.4, 0, dk, 'stone');
    const HB = K.mass(0, 1.2, hz, 20, 8, 20, c, { bands: [3.9] });
    G.box(0, 6.95, hz, 20.14, 0.6, 20.14, 0, lap, 'stone');
    G.box(0, 6.83, hz, 20.18, 0.12, 20.18, 0, por, 'stone');
    G.box(0, 7.55, hz, 20.18, 0.12, 20.18, 0, por, 'stone');
    for (let s = 0; s < 4; s++) {
      const n = K.nrm(s), f = s < 2;
      for (let i = 0; i < 9; i++) {
        const u = -8 + i * 2;
        G.box(f ? u : n[0] * 10.08, 7.12, hz + (f ? n[1] * 10.08 : u), f ? 0.9 : 0.06, 0.26, f ? 0.06 : 0.9, 0, mar, 'stone');
      }
    }
    K.parapet(HB, 0.8, 0.35, []);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      G.frustum(p[0] * 10, 0, hz + p[1] * 10, 1.4, 0.95, 10.6, 0, dk, 'stone', 4);
      G.box(p[0] * 10, 10.6, hz + p[1] * 10, 2.3, 0.3, 2.3, 0, shade(dk, -0.1), 'stone');
      G.pyrRoof(p[0] * 10, 10.9, hz + p[1] * 10, 2.1, 1.6, 2.1, 0, domeC, 'roof');
    });
    K.row(HB, 0, 5.0, 1.1, 1.6, { arch: true }, 3.4, [[0, 1.6]]);
    K.row(HB, 0, 2.4, 1.1, 1.8, { arch: true, grille: true }, 3.4, [[0, 2.4], [-8.5, 1], [8.5, 1]]);
    [1, 2, 3].forEach(function (s) {
      K.row(HB, s, 2.4, 1.1, 1.8, { arch: true, shut: s === 1 }, 3.4, s === 2 ? [[-2, 1.4]] : null);
      K.row(HB, s, 5.0, 1.1, 1.6, { arch: true }, 3.4);
    });
    K.door(10, 1.2, hz - 2, 1.3, 2.5, 2, c, { base: 1.2, step: false });
    K.door(0, 1.2, hz - 10, 1.4, 2.6, 1, c, {});
    K.door(0, 1.2, hz + 10, 2.4, 3.6, 0, c, { head: 0.8, leaf: LEAVES[1], base: 1.2, step: false });

    /* drum: lapis base band, window band with marble pilasters, porphyry top band */
    const dT = 9.2, R = 7.2;
    G.cyl(0, dT, hz, R, 3.6, 0, shade(c, 0.05), 'stone');
    G.cyl(0, dT, hz, R + 0.1, 0.5, 0, lap, 'stone');
    G.cyl(0, dT + 3.1, hz, R + 0.12, 0.5, 0, por, 'stone');
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * TAU, b = a + TAU / 32;
      G.box(Math.cos(a) * (R + 0.02), dT + 0.9, hz + Math.sin(a) * (R + 0.02), 0.85, 1.7, 0.24, -(a + Math.PI / 2), DOOR, 'wood');
      G.box(Math.cos(b) * (R + 0.05), dT + 0.5, hz + Math.sin(b) * (R + 0.05), 0.4, 2.6, 0.24, -(b + Math.PI / 2), mar, 'stone');
    }
    /* quilted dome: shell plus sixteen curved ribs */
    const dB = dT + 3.6, DH = 6.2;
    G.dome(0, dB, hz, R, DH, 0, domeC, 'dome');
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * TAU;
      let prev = null;
      for (let j = 0; j <= 6; j++) {
        const ph = j / 6 * (Math.PI / 2) * 0.93;
        const pt = [Math.cos(a) * Math.cos(ph) * (R + 0.08), dB + Math.sin(ph) * (DH + 0.08), hz + Math.sin(a) * Math.cos(ph) * (R + 0.08)];
        if (prev) G.rod(prev[0], prev[1], prev[2], pt[0], pt[1], pt[2], 0.13, shade(domeC, -0.2), 'metal');
        prev = pt;
      }
    }
    G.cyl(0, dB + DH - 0.25, hz, 1.1, 1.3, 0, mar, 'stone');
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU;
      G.box(Math.cos(a) * 1.11, dB + DH + 0.2, hz + Math.sin(a) * 1.11, 0.35, 0.6, 0.1, -(a + Math.PI / 2), DOOR, 'wood');
    }
    G.dome(0, dB + DH + 1.05, hz, 1.25, 1.0, 0, domeC, 'dome');
    G.rod(0, dB + DH + 2.0, hz, 0, dB + DH + 2.9, hz, 0.07, IRON, 'metal');
    G.ball(0, dB + DH + 2.9, hz, 0.26, 0xd0a53c, 'metal');

    /* colonnaded porch, flat roof with balustrade, front steps */
    G.box(0, 0, 6.8, 16.8, 1.2, 5.6, 0, dk, 'stone');
    [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].forEach(function (x) {
      G.box(x, 1.2, 9.0, 0.95, 0.3, 0.95, 0, shade(c, -0.14), 'stone');
      G.cyl(x, 1.5, 9.0, 0.38, 4.6, 0, mar, 'stone');
      G.box(x, 6.1, 9.0, 1.05, 0.35, 1.05, 0, shade(c, -0.14), 'stone');
      G.box(x, 1.2, 4.12, 0.7, 5.25, 0.25, 0, shade(c, -0.06), 'stone');
    });
    G.box(0, 6.45, 9.0, 16.6, 0.85, 1.05, 0, c, 'stone');
    G.box(0, 6.62, 9.55, 16.2, 0.3, 0.06, 0, lap, 'stone');
    [-1, 1].forEach(function (k) { G.box(k * 7.9, 6.45, 6.55, 0.8, 0.85, 4.9, 0, c, 'stone'); });
    const PR = { x: 0, z: 6.8, w: 16.8, d: 5.6, c: c, top: 7.65 };
    G.box(0, 7.3, 6.8, 17.2, 0.35, 5.8, 0, dk, 'stone');
    K.parapet({ x: 0, z: 6.8, w: 16.8, d: 5.6, c: c, top: 7.65 }, 0.75, 0.25, [{ s: 1, u: 0, w: 16.8 }]);
    void PR;
    [-1, 1].forEach(function (k) { K.planter(k * 6.5, 7.65, 7.6, 0.45, POTS[0]); });
    K.stair(0, 11.4, 0, 1.2, 0, -1, 10, shade(c, 0.05), 0.45);
    [-1, 1].forEach(function (k) { G.box(k * 5.3, 0, 10.5, 0.6, 1.5, 1.8, 0, dk, 'stone'); });

    /* approach: paving, statues on plinths, lamps */
    G.box(0, 0, 19.1, 5.2, 0.1, 15.4, 0, shade(c, 0.1), 'stone');
    [[-4.2, 15], [4.2, 15], [-4.2, 21.5], [4.2, 21.5], [-7.2, 10.8], [7.2, 10.8]].forEach(function (p) {
      K.statue(p[0], p[1], 0, mar, shade(c, -0.05));
    });
    [-1, 1].forEach(function (k) {
      K.bed(k * 12, 18, 9, 9, shade(c, -0.1), 6);
      G.tree(k * 12, 18, k < 0 ? 'olive' : 'cypress', k < 0 ? 5 : 7, 0.42);
    });

    /* boundary: low wall with pilasters, gate piers with urns and lamps */
    const X0 = -26.3, X1 = 23.3, Z0 = -18.3, Z1 = 26.6;
    K.wall(X0, Z0, X1, Z0, 1.4, 0.5, c, { butt: 4, bside: -1 });
    K.wall(X0, Z0, X0, Z1, 1.4, 0.5, c, { butt: 4, bside: -1 });
    K.wall(X1, Z0, X1, Z1, 1.4, 0.5, c, { butt: 4, bside: 1 });
    K.wall(X0, Z1, -3.2, Z1, 1.4, 0.5, c, { butt: 4, bside: 1 });
    K.wall(3.2, Z1, X1, Z1, 1.4, 0.5, c, { butt: 4, bside: 1 });
    [-1, 1].forEach(function (k) {
      G.box(k * 3.3, 0, Z1, 1.3, 3.0, 1.3, 0, c, 'stone');
      G.box(k * 3.3, 3.0, Z1, 1.6, 0.3, 1.6, 0, dk, 'stone');
      G.cyl(k * 3.3, 3.3, Z1, 0.35, 0.3, 0, mar, 'stone');
      G.blob(k * 3.3, 3.95, Z1, 0.5, 1.0, 0, mar, 'stone');
      G.rod(k * 3.3, 3.0, Z1 + 0.65, k * 3.3, 3.0, Z1 + 1.2, 0.06, IRON, 'metal');
      G.ball(k * 3.3, 2.7, Z1 + 1.2, 0.22, GLOW, 'glow');
    });

    /* servants' wing: two storeys, roof room, pergola, stair up the outer flank */
    flatHouse(G, 16.5, 0, -8, 0, {
      w: 9, d: 16, fl: 2, fh: 3.1, c: shade(c, -0.03), stair: 2,
      cover: 'pergola', cloth: F.pick(SAIL), shut: true, lamp: true
    });
    G.box(11, 0, -8, 2.2, 4.4, 3.4, 0, shade(c, -0.03), 'stone');
    G.box(11, 4.2, -8, 2.4, 0.3, 3.8, 0, dk, 'stone');
    K.win(11, 1.4, -6.3, 0.8, 1.2, 0, c, {});
    K.win(11, 1.4, -9.7, 0.8, 1.2, 1, c, {});

    /* stable: flat roof used as hay loft under a shade sail, ladder up */
    (function () {
      const S = sub(G, -19, 0, -10, 0), SK = kit(S), sc = shade(c, 0.03);
      S.box(0, 0, 0, 10.5, 0.2, 10.5, 0, dk, 'stone');
      const SB = SK.mass(0, 0.2, 0, 10, 3.8, 10, sc, {});
      [-3.2, 0, 3.2].forEach(function (x, i) {
        SK.fb(x, 0.2, 5, 2.5, 2.8, 0.2, 0, 0.02, 0x241f18, 'wood');
        SK.fb(x, 3.0, 5, 2.9, 0.3, 0.3, 0, 0.1, TIMBER, 'wood');
        SK.fb(x, 0.2, 5, 2.4, 1.2, 0.1, 0, 0.14, i === 1 ? 0x5a4028 : 0x4a3a28, 'wood');
      });
      [-4.8, -1.6, 1.6, 4.8].forEach(function (x) { SK.fb(x, 0.2, 5, 0.3, 2.8, 0.3, 0, 0.15, TIMBER, 'wood'); });
      [1, 2, 3].forEach(function (s) { SK.row(SB, s, 2.0, 0.8, 0.9, { grille: true }, 3.0); });
      SK.door(0, 0.2, -5, 1.6, 2.4, 1, sc, {});
      SK.parapet(SB, 0.6, 0.25, [{ s: 2, u: 3.4, w: 1.0 }]);
      SK.ladder(5, 3.4, 0, 4.0, 2);
      SK.sail(-0.5, 4.0, -0.6, 6.6, 5.4, 2.6, F.pick(SAIL));
      for (let i = 0; i < 5; i++) S.box(-2.6 + (i % 3) * 2.0, 4.0 + Math.floor(i / 3) * 0.8, -1.8 + (i % 2) * 1.5, 1.6, 0.8, 1.0, F.rr(-0.2, 0.2), HAY, 'straw');
      SK.jar(3.6, 4.0, -3.6, 0.3, POTS[1]); SK.crate(3.6, 4.0, 2.8, 0.8, 0.3);
    })();

    /* guar pen: rail fence, trough, feed rack, two guar */
    const px0 = -25.2, px1 = -13.6, pz0 = -4.6, pz1 = 8.8;
    const post = function (x, z) { G.rod(x, 0, z, x, 1.5, z, 0.1, TIMBER, 'wood'); };
    const rail = function (ax, az, bx, bz) { [0.65, 1.3].forEach(function (y) { G.rod(ax, y, az, bx, y, bz, 0.05, TIMBER, 'wood'); }); };
    for (let x = px0; x <= px1 + 0.01; x += (px1 - px0) / 5) post(x, pz1);
    for (let z = pz0; z <= pz1 + 0.01; z += (pz1 - pz0) / 5) { post(px0, z); post(px1, z); }
    rail(px0, pz1, px1, pz1); rail(px0, pz0, px0, pz1);
    rail(px1, pz0, px1, 0.4); rail(px1, 3.6, px1, pz1);
    G.box(-16, 0, 6.8, 3.2, 0.7, 0.9, 0, shade(c, -0.2), 'stone');
    G.box(-16, 0.52, 6.8, 2.8, 0.12, 0.6, 0, WATER, 'glass');
    K.rack(-23.6, 0, 2.5, 3.0, false, [HAY, shade(HAY, -0.1)]);
    K.guar(-20, 3.2, 0.5);
    K.guar(-17.2, -1.2, 2.6);
  }

  /* ========================================================= CLAN COMPOUNDS */

  /* v0 — poor mudbrick clan yard: shared well with a sweep, lean-tos, a
     communal roof terrace under shade sails */
  function clanMud(F) {
    const G = sub(F, 0, 0, -0.24, 0), K = kit(G);
    const c = F.pick(MUD), c2 = F.pick(POOR), cl = function () { return F.pick(SAIL); };
    const WH = 2.8, WT = 0.6, X = 16.6, Z = 13.6;

    /* the yard floor and an irregular mud wall, patched and uneven */
    G.box(0, 0, 0, 2 * X, 0.06, 2 * Z, 0, shade(c, 0.12), 'stone');
    const seg = function (x0, z0, x1, z1) {
      const ax = Math.abs(x1 - x0) > Math.abs(z1 - z0), L = ax ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
      const n = Math.max(1, Math.round(L / 4)), lo = WH - 0.3;
      /* one mass per side (so the wall survives LOD), uneven patched tops over it */
      G.box((x0 + x1) / 2, 0, (z0 + z1) / 2, ax ? L : WT, lo, ax ? WT : L, 0, c, 'stone');
      for (let i = 0; i < n; i++) {
        const a = i / n, b = (i + 1) / n, h = WH + F.rr(-0.25, 0.25);
        const mx = x0 + (x1 - x0) * (a + b) / 2, mz = z0 + (z1 - z0) * (a + b) / 2, l = L / n + 0.02;
        G.box(mx, lo, mz, ax ? l : WT, h - lo, ax ? WT : l, 0, i % 2 ? c : shade(c, 0.04), 'stone');
        G.box(mx, h, mz, ax ? l : WT + 0.12, 0.16, ax ? WT + 0.12 : l, 0, shade(c, -0.12), 'stone');
        if (i > 0) {
          const px = ax ? x0 + (x1 - x0) * a : mx, pz = ax ? mz : z0 + (z1 - z0) * a;
          G.box(px, 0, pz, ax ? 0.7 : WT + 0.7, WH - 0.4, ax ? WT + 0.7 : 0.7, 0, shade(c, -0.05), 'stone');
        }
      }
    };
    seg(-X, -Z, X, -Z); seg(-X, -Z, -X, Z); seg(X, -Z, X, Z);
    seg(-X, Z, -6.6, Z); seg(-3.4, Z, X, Z);
    /* gate: timber posts and lintel, a cloth hanging */
    [-6.6, -3.4].forEach(function (x) { G.box(x, 0, Z, 0.8, 3.3, 0.9, 0, shade(c, -0.08), 'stone'); });
    G.box(-5, 3.3, Z, 4.2, 0.3, 1.0, 0, TIMBER, 'wood');
    G.box(-5, 2.1, Z + 0.1, 2.3, 1.2, 0.05, 0, F.pick(BANNER), 'cloth');
    G.box(-9, 0, Z + 0.8, 2.2, 0.45, 0.6, 0, shade(c, -0.1), 'stone');
    K.jar(-1.8, 0, Z + 0.8, 0.35, POTS[0]); K.jar(-1.0, 0, Z + 0.75, 0.3, POTS[2]);

    /* the houses round the yard: every roof is used */
    flatHouse(G, -11.6, 0, -9.8, 0, {
      w: 9.4, d: 7, fl: 2, fh: 2.8, c: c, mud: true, stair: 'L2', blind: [1, 3], wallH: WH,
      cover: 'awn', cloth: cl(), canopy: cl()
    });
    const T = flatHouse(G, 0.3, 0, -9.3, 0, {
      w: 11, d: 8, fl: 1, fh: 3.0, c: shade(c, 0.04), mud: true, stair: 2, blind: [1], wallH: WH,
      room: false, cover: null, clutter: false, doorX: -2.5, canopy: cl()
    });
    /* the communal terrace on the low house: two sails, rugs, loom, cooking */
    (function () {
      const H = T.H, TG = T.G, TK = T.K;
      TK.sail(-2.3, H, -0.6, 4.6, 5.0, 2.6, cl());
      TK.sail(2.9, H, -0.6, 3.4, 5.0, 2.3, cl());
      [[-3.6, 0.8], [-1.2, -1.2], [2.6, 1.2]].forEach(function (p) {
        TG.box(p[0], H, p[1], 1.8, 0.04, 1.2, F.rr(-0.3, 0.3), F.pick(BANNER), 'cloth');
      });
      TG.box(0.8, H, -2.9, 2.6, 0.4, 0.7, 0, shade(c, -0.1), 'stone');
      TG.box(-4.4, H, -2.9, 1.4, 0.4, 0.7, 0, shade(c, -0.1), 'stone');
      /* a standing loom */
      [-1, 1].forEach(function (k) { TG.rod(4.2 + k * 0.8, H, 2.4, 4.2 + k * 0.8, H + 1.8, 2.4, 0.05, TIMBER, 'wood'); });
      TG.rod(3.4, H + 1.75, 2.4, 5.0, H + 1.75, 2.4, 0.05, TIMBER, 'wood');
      TG.box(4.2, H + 0.5, 2.4, 1.5, 1.2, 0.03, 0, F.pick(BANNER), 'cloth');
      TG.cyl(0.4, H, 1.8, 0.45, 0.25, 0, shade(c, -0.25), 'stone');
      TG.ball(0.4, H + 0.35, 1.8, 0.22, 0xffb066, 'glow');
      TK.jar(-4.6, H, 3.0, 0.3, POTS[0]); TK.jar(-4.0, H, 3.1, 0.25, POTS[3]);
      TK.cistern(4.6, H, -3.0, 0.5, 0.9, shade(c, -0.12));
      TK.rack(-1.5, H, 3.1, 2.2, true, [0x8a2f2a, 0x7a2028, 0x8a2f2a]);
    })();
    flatHouse(G, 12.7, 0, -7.5, -1, {
      w: 11.6, d: 7.2, fl: 2, fh: 2.8, c: shade(c, -0.03), mud: true, stair: 'L2', blind: [1, 3], wallH: WH,
      cover: 'pergola', cloth: cl()
    });
    flatHouse(G, -12.7, 0, 4.5, 1, {
      w: 9, d: 7.2, fl: 1, fh: 3.0, c: c2, mud: true, stair: 'L2', blind: [1], wallH: WH,
      cover: 'awn', cloth: cl(), shut: true
    });

    /* lean-to along the front wall: firewood, jars and a tethered guar */
    const la = function (x0, x1, zw, zf, hw, hf) {
      G.sheet((x0 + x1) / 2, hw, zw, (x0 + x1) / 2, hf, zf, x1 - x0 + 0.3, F.pick(REED), 'straw', 0.14);
      const n = Math.max(2, Math.round((x1 - x0) / 2.8));
      for (let i = 0; i <= n; i++) {
        const x = x0 + (x1 - x0) * i / n;
        G.rod(x, 0, zf + 0.1 * Math.sign(zf - zw), x, hf - 0.06, zf + 0.1 * Math.sign(zf - zw), 0.08, TIMBER, 'wood');
      }
      G.rod(x0, hf - 0.1, zf, x1, hf - 0.1, zf, 0.07, TIMBER, 'wood');
    };
    la(2.2, 14.8, Z - WT / 2, 10.6, WH - 0.1, 2.1);
    for (let i = 0; i < 4; i++) G.rod(8.5, 0.2 + i * 0.36, Z - 1.0, 13.8, 0.2 + i * 0.36, Z - 1.0, 0.18, 0x5d5140, 'wood');
    K.jar(3.2, 0, 12.2, 0.4, POTS[0]); K.jar(4.1, 0, 12.4, 0.34, POTS[1]); K.jar(5.0, 0, 12.2, 0.4, POTS[2]);
    K.guar(6.5, 11.2, 3.3);
    /* lean-to kitchen against the right wall: clay oven and hearth */
    (function () {
      const S = sub(G, 0, 0, 0, 0);
      S.sheet(X - WT / 2, WH - 0.1, 5.8, 13.2, 2.1, 5.8, 8.2, F.pick(REED), 'straw', 0.14);
      [2.0, 5.8, 9.6].forEach(function (z) { S.rod(13.3, 0, z, 13.3, 2.05, z, 0.08, TIMBER, 'wood'); });
      S.rod(13.3, 2.0, 1.8, 13.3, 2.0, 9.8, 0.07, TIMBER, 'wood');
      S.dome(15.0, 0, 3.4, 1.0, 1.3, 0, shade(c, -0.1), 'stone');
      K.fb(15.0, 0.15, 3.4, 0.5, 0.5, 0.1, 3, 0.98, 0x151513, 'stone');
      S.cyl(14.8, 0, 7.4, 0.8, 0.3, 0, shade(c, -0.25), 'stone');
      S.ball(14.8, 0.4, 7.4, 0.3, 0xffb066, 'glow');
      S.cyl(14.8, 0.3, 7.4, 0.35, 0.4, 0, IRON, 'metal');
      K.crate(15.4, 0, 9.4, 0.8, 0.2);
    })();

    /* the shared well with its sweep, a hearth, laundry, a vegetable patch */
    K.well(-0.5, 2.5, shade(c, -0.05), { sweep: true });
    G.box(-0.5, 0, 5.2, 2.6, 0.45, 0.6, 0, shade(c, -0.1), 'stone');
    [[-4.6, 7.4], [4.6, 7.4]].forEach(function (p) { G.rod(p[0], 0, p[1], p[0], 2.7, p[1], 0.07, TIMBER, 'wood'); });
    G.rod(-4.6, 2.6, 7.4, 4.6, 2.5, 7.4, 0.02, ROPE, 'rope');
    [-3.3, -1.6, 0.2, 2.0, 3.4].forEach(function (x, i) {
      G.box(x, 1.35 + (i % 2) * 0.2, 7.4, 1.0, 1.1 - (i % 2) * 0.2, 0.04, 0, F.pick(BANNER.concat(SAIL)), 'cloth');
    });
    K.bed(7.2, 2.4, 4.6, 4.0, shade(c, -0.08), 6);
    K.rack(-6.8, 0, -2.6, 2.4, true, [0x8a2f2a, 0x9a8a5a]);
  }

  /* v1 — fortified clan compound: battered keep in one corner, twin-towered
     gatehouse, crenellated walls with a wall-walk, houses round the inner court */
  function clanFort(F) {
    const G = sub(F, 0.15, 0, -0.3, 0), K = kit(G);
    const c = F.pick(ST), dk = shade(c, -0.22), ban = F.pick(BANNER);
    const WH = 7.0, WT = 1.4, X = 18.3, Z = 16.3;

    /* curtain walls: talus, walk, crenellated outer parapet */
    const curtain = function (x0, z0, x1, z1, outK) {
      const w = K.wall(x0, z0, x1, z1, WH, WT, c, { cap: false, base: false, butt: 6, bside: outK });
      const ax = w.ax, L = w.L + WT;
      G.box(w.mx, 0, w.mz, ax ? L : WT + 1.2, 1.6, ax ? WT + 1.2 : L, 0, dk, 'stone');
      const oz = outK * (WT / 2 - 0.25);
      G.box(w.mx + (ax ? 0 : oz), WH, w.mz + (ax ? oz : 0), ax ? L : 0.5, 0.9, ax ? 0.5 : L, 0, c, 'stone');
      const nm = Math.floor(L / 1.8);
      for (let i = 0; i < nm; i++) {
        const u = -L / 2 + (i + 0.5) * L / nm;
        G.box(w.mx + (ax ? u : oz), WH + 0.9, w.mz + (ax ? oz : u), ax ? 0.9 : 0.5, 0.8, ax ? 0.5 : 0.9, 0, c, 'stone');
      }
      G.box(w.mx - (ax ? 0 : oz), WH, w.mz - (ax ? oz : 0), ax ? L : 0.25, 0.35, ax ? 0.25 : L, 0, dk, 'stone');
    };
    curtain(-X, -Z, X, -Z, -1);
    curtain(-X, -Z, -X, Z, -1);
    curtain(X, -Z, X, Z, 1);
    curtain(-X, Z, -6.4, Z, 1);
    curtain(6.4, Z, X, Z, 1);

    /* keep in the back-left corner */
    const kx = -15.2, kz = -14.6, khw = function (y) { return 4.6 - 0.8 * y / 19; };
    G.frustum(kx, 0, kz, 4.6, 3.8, 19, 0, shade(c, 0.03), 'stone', 4);
    G.frustum(kx, 0, kz, 5.3, 4.8, 2.0, 0, dk, 'stone', 4);
    for (let i = 0; i < 16; i++) {
      const s = i % 4, u = -3 + Math.floor(i / 4) * 2, n = K.nrm(s);
      G.box(kx + (s < 2 ? u : n[0] * 3.95), 16.7, kz + (s < 2 ? n[1] * 3.95 : u), s < 2 ? 0.45 : 0.9, 0.7, s < 2 ? 0.9 : 0.45, 0, dk, 'stone');
    }
    G.box(kx, 17.4, kz, 8.8, 1.6, 8.8, 0, c, 'stone');
    G.box(kx, 17.3, kz, 9.0, 0.2, 9.0, 0, dk, 'stone');
    const KT = { x: kx, z: kz, w: 8.8, d: 8.8, c: c, top: 19.0 };
    K.parapet(KT, 0.7, 0.4, [], dk, true);
    for (let s = 0; s < 4; s++) {
      const n = K.nrm(s), f = s < 2;
      [3.2, 6.6, 10.2, 13.6].forEach(function (y, li) {
        [-1.6, 1.6].forEach(function (u, ui) {
          if ((s === 1 || s === 3) && (li + ui) % 2) return;
          const fz = khw(y + 0.7) + 0.02;
          K.win(kx + (f ? u : n[0] * fz), y, kz + (f ? n[1] * fz : u), li > 1 ? 0.8 : 0.45, 1.4, s, c, { sill: li > 1, arch: li > 1 });
        });
      });
    }
    K.door(kx + khw(1.4), 0, kz + 2.2, 1.4, 2.8, 2, c, { lamp: true, leaf: LEAVES[1] });
    K.door(kx + khw(8), WH, -Z, 1.0, 2.2, 2, c, { base: WH, step: false });
    /* keep roof: lookout hut with an awning, banner */
    G.box(kx - 2.0, 19.0, kz - 2.0, 2.4, 2.4, 2.4, 0, c, 'stone');
    G.box(kx - 2.0, 21.4, kz - 2.0, 2.8, 0.3, 2.8, 0, dk, 'stone');
    K.door(kx - 2.0, 19.0, kz - 0.8, 0.9, 1.9, 0, c, { base: 19.0, step: false });
    K.awn(kx - 2.0, kz - 0.8, 21.3, 0, 2.4, 1.6, F.pick(SAIL), 19.0);
    G.rod(kx + 2.4, 19.0, kz + 2.4, kx + 2.4, 23.4, kz + 2.4, 0.09, IRON, 'metal');
    G.box(kx + 2.4, 21.2, kz + 2.95, 0.08, 2.0, 1.1, 0, ban, 'cloth');

    /* twin-towered gatehouse */
    [-1, 1].forEach(function (k) {
      G.frustum(k * 4, 0, Z, 2.4, 2.0, 10.5, 0, shade(c, 0.02), 'stone', 4);
      G.frustum(k * 4, 0, Z, 2.8, 2.5, 1.6, 0, dk, 'stone', 4);
      G.box(k * 4, 10.2, Z, 4.6, 0.3, 4.6, 0, dk, 'stone');
      K.parapet({ x: k * 4, z: Z, w: 4.4, d: 4.4, c: c, top: 10.5 }, 0.6, 0.35, [], dk, true);
      [3.5, 7.2].forEach(function (y) {
        const gh = 2.4 - 0.4 * (y + 0.65) / 10.5 + 0.02;
        K.win(k * (4 + gh), y, Z, 0.4, 1.3, k > 0 ? 2 : 3, c, { sill: false });
        K.win(k * 4, y, Z - gh, 0.4, 1.3, 1, c, { sill: false });
      });
      G.rod(k * 2.2, 4.5, Z + 2.3, k * 2.2, 4.5, Z + 2.9, 0.06, IRON, 'metal');
      G.ball(k * 2.2, 4.2, Z + 2.9, 0.24, GLOW, 'glow');
      G.rod(k * 4, 9.5, Z + 2.0, k * 4, 9.5, Z + 2.55, 0.05, IRON, 'metal');
      G.rod(k * 4 - 0.7, 9.45, Z + 2.5, k * 4 + 0.7, 9.45, Z + 2.5, 0.04, IRON, 'metal');
      G.box(k * 4, 5.0, Z + 2.5, 1.3, 4.4, 0.06, 0, ban, 'cloth');
    });
    G.box(0, 4.6, Z, 3.4, 4.4, 4.2, 0, c, 'stone');
    G.box(0, 9.0, Z, 3.8, 0.3, 4.4, 0, dk, 'stone');
    G.box(0, 7.4, Z + 2.55, 4.2, 1.4, 0.9, 0, shade(c, 0.03), 'stone');
    [-1.5, -0.5, 0.5, 1.5].forEach(function (x) { G.box(x, 6.7, Z + 2.4, 0.35, 0.7, 0.6, 0, dk, 'stone'); });
    G.box(0, 0, Z, 3.2, 4.6, 0.4, 0, LEAVES[1], 'wood');
    for (let i = 0; i < 7; i++) G.rod(-1.35 + i * 0.45, 3.4, Z + 0.9, -1.35 + i * 0.45, 4.6, Z + 0.9, 0.05, IRON, 'metal');
    G.box(0, 3.4, Z + 0.9, 3.2, 0.1, 0.1, 0, IRON, 'metal');
    [1.2, 3.0].forEach(function (y) { G.box(0, y, Z + 0.22, 3.2, 0.12, 0.08, 0, IRON, 'metal'); });
    G.box(0, 0, Z + 3.4, 4.6, 0.25, 1.6, 0, dk, 'stone');

    /* corner bartizans on the three corners without the keep */
    [[1, -1], [-1, 1], [1, 1]].forEach(function (p) {
      const bx = p[0] * (X + 0.5), bz = p[1] * (Z + 0.5);
      G.beam(bx - p[0] * 0.5, WH - 1.6, bz - p[1] * 0.5, bx, WH, bz, 0.9, 0.9, dk, 'stone');
      G.box(bx, WH, bz, 2.4, 2.2, 2.4, 0, c, 'stone');
      G.pyrRoof(bx, WH + 2.2, bz, 2.8, 1.8, 2.8, 0, F.pick(ROOF), 'roof');
      [0, 1, 2, 3].forEach(function (s) {
        const n = K.nrm(s);
        K.win(bx + n[0] * 1.2, WH + 0.7, bz + n[1] * 1.2, 0.3, 0.9, s, c, { sill: false, lintel: false });
      });
    });

    /* houses round the inner court (inner faces x=±17.6, z=±15.6) */
    const hc = shade(c, 0.05);
    flatHouse(G, -5.4, 0, -11.6, 0, { w: 8.4, d: 8, fl: 2, fh: 3.1, c: hc, stair: 'L2', blind: [1], wallH: WH, cover: 'awn', shut: true });
    flatHouse(G, 5.4, 0, -11.6, 0, { w: 8.4, d: 8, fl: 2, fh: 3.1, c: shade(c, 0.02), stair: 'L3', blind: [1], wallH: WH, cover: 'pergola', shut: true });
    flatHouse(G, 14.1, 0, -9.1, -1, { w: 13, d: 7, fl: 2, fh: 3.1, c: hc, stair: 2, blind: [1, 3], wallH: WH, cover: 'awn', arch: true });
    flatHouse(G, -14.1, 0, -0.2, 1, { w: 14, d: 7, fl: 2, fh: 3.1, c: shade(c, -0.02), stair: 'L2', blind: [1], wallH: WH, cover: 'pergola', shut: true });

    /* wall-walk stair inside the front wall, left of the gate */
    K.stair(-6.2, Z - WT / 2 - 0.66, 0, WH, -1, 0, 1.3, shade(c, -0.05), 0.34);
    /* timber gallery storehouse inside the front wall, right of the gate */
    (function () {
      const zb = Z - WT / 2, zf = zb - 3.0;
      G.sheet(12.1, 3.6, zb, 12.1, 3.0, zf, 11.2, F.pick(ROOF), 'roof', 0.16);
      [6.8, 9.4, 12.1, 14.8, 17.4].forEach(function (x) { G.rod(x, 0, zf + 0.15, x, 3.0, zf + 0.15, 0.1, TIMBER, 'wood'); });
      G.rod(6.8, 2.95, zf + 0.15, 17.4, 2.95, zf + 0.15, 0.08, TIMBER, 'wood');
      for (let i = 0; i < 6; i++) K.crate(7.8 + (i % 3) * 1.1, Math.floor(i / 3) * 0.72, zb - 0.8, 0.9, F.rr(-0.2, 0.2));
      K.jar(12.5, 0, zb - 0.7, 0.4, POTS[0]); K.jar(13.4, 0, zb - 0.8, 0.36, POTS[1]); K.jar(14.3, 0, zb - 0.7, 0.4, POTS[3]);
      for (let i = 0; i < 4; i++) G.rod(15.2, 0.2 + i * 0.36, zb - 0.6, 17.3, 0.2 + i * 0.36, zb - 0.6, 0.18, 0x5d5140, 'wood');
    })();

    /* the court: paving, cistern well, ancestor shrine, pells */
    G.box(0, 0, 1.5, 18, 0.08, 20, 0, shade(c, 0.1), 'stone');
    K.well(0, -1.5, dk, {});
    G.box(0, 0, 6.2, 2.2, 1.1, 1.6, 0, dk, 'stone');
    G.frustum(0, 1.1, 6.2, 0.7, 0.5, 1.6, 0, c, 'stone', 4);
    G.pyrRoof(0, 2.7, 6.2, 1.2, 0.8, 1.2, 0, F.pick(DOME), 'roof');
    [-0.7, 0.7].forEach(function (x) { G.ball(x, 1.25, 7.0, 0.12, GLOW, 'glow'); });
    [[6, 6], [8, 3]].forEach(function (p) {
      G.rod(p[0], 0, p[1], p[0], 2.0, p[1], 0.14, TIMBER, 'wood');
      G.rod(p[0] - 0.5, 1.4, p[1], p[0] + 0.5, 1.4, p[1], 0.06, TIMBER, 'wood');
    });
    K.rack(-7, 0, 8.5, 2.6, true, [F.pick(BANNER), F.pick(SAIL)]);
  }

  /* v2 — waterside clan compound: houses on a stone platform, private dock,
     boat sheds over the water, water stairs */
  function clanWater(F) {
    const G = sub(F, 0, 0, -0.8, 0), K = kit(G);
    const c = F.pick(ST), dk = shade(c, -0.22), PH = 1.8, wood = 0x6b5438;
    const PZ0 = -18.8, PZ1 = 6;

    /* water in front, platform with buttress piers and mooring rings */
    G.box(0, 0, 14.6, 38, 0.04, 17.2, 0, BED, 'stone');
    G.box(0, 0.04, 14.6, 38, 0.12, 17.2, 0, WATER, 'glass');
    const PB = K.mass(0, 0, (PZ0 + PZ1) / 2, 36, PH, PZ1 - PZ0, c, { corC: dk });
    [-15, -9, 9, 15].forEach(function (x) {
      G.box(x, 0, PZ1 + 0.3, 1.0, PH - 0.2, 0.6, 0, dk, 'stone');
      G.rod(x + 1.2, 1.1, PZ1 + 0.12, x + 1.2, 1.1, PZ1 + 0.3, 0.14, IRON, 'metal');
    });
    [-12, -4, 4, 12].forEach(function (z) { [-1, 1].forEach(function (k) { G.box(k * 18.3, 0, z - 4, 0.6, PH - 0.2, 1.0, 0, dk, 'stone'); }); });
    /* platform-edge parapets with gaps for the dock, the boat sheds and the water stair */
    K.parapet(PB, 0.9, 0.35, [{ s: 0, u: 0, w: 4.4 }, { s: 0, u: 12, w: 12 }, { s: 0, u: -11.5, w: 3.4 }, { s: 1, u: 0, w: 36 }]);
    /* landward wall behind the houses, gate, steps down to the lane */
    const W = sub(G, 0, PH, 0, 0), WK = kit(W);
    WK.wall(-18, -18.4, 3.6, -18.4, 3.2, 0.6, c, { butt: 4, bside: -1 });
    WK.wall(6.4, -18.4, 18, -18.4, 3.2, 0.6, c, { butt: 4, bside: -1 });
    [3.6, 6.4].forEach(function (x) { W.box(x, 0, -18.4, 0.8, 3.8, 1.0, 0, dk, 'stone'); });
    W.box(5.0, 3.5, -18.4, 3.6, 0.45, 1.0, 0, dk, 'stone');
    W.box(5.0, 0, -18.4, 2.0, 3.5, 0.2, 0, LEAVES[1], 'wood');
    K.stair(5.0, PZ0 - 2.8, 0, PH, 0, 1, 2.6, shade(c, 0.04), 0.4);

    /* the houses */
    const H1 = flatHouse(G, -13.1, PH, -14.1, 0, {
      w: 9, d: 8, fl: 3, fh: 3.0, c: shade(c, 0.04), blind: [1, 3], wallH: 3.2 + 0.3, cover: 'pergola',
      balcony: { floor: 1, w: 4.2, awn: F.pick(SAIL) }, shut: true, arch: true
    });
    void H1;
    flatHouse(G, -1.5, PH, -14.6, 0, {
      w: 10.2, d: 7, fl: 2, fh: 3.0, c: shade(c, -0.02), stair: 'L3', blind: [1], wallH: 3.5,
      cover: 'awn', canopy: F.pick(SAIL)
    });
    flatHouse(G, 12, PH, -12.6, 0, {
      w: 11.2, d: 11, fl: 2, fh: 3.0, c: shade(c, 0.02), stair: 3, blind: [1, 2], wallH: 3.5,
      cover: 'sail', lamp: true, shut: true
    });

    /* the court on the platform */
    const P = sub(G, 0, PH, 0, 0), PK = kit(P);
    PK.cistern(-5, 0, -4, 1.1, 1.0, dk);
    P.box(-5, 1.12, -4, 0.4, 1.3, 0.4, 0, TIMBER, 'wood');
    PK.rack(-10, 0, -1, 4, true, [0x6b6a50, 0x5a5a44, 0x6b6a50]);
    PK.rack(3.5, 0, 2.5, 3, true, [0x6b6a50, 0x5a5a44]);
    [-6.5, -2.5, 2.5].forEach(function (x) { P.cyl(x, 0, 5.3, 0.22, 0.8, 0, TIMBER, 'wood'); P.cyl(x, 0.8, 5.3, 0.28, 0.12, 0, IRON, 'metal'); });
    for (let i = 0; i < 4; i++) PK.crate(-15.5 + (i % 2) * 1.0, Math.floor(i / 2) * 0.72, 2.5, 0.9, F.rr(-0.2, 0.2));
    PK.jar(-13.4, 0, 3.6, 0.38, POTS[0]); PK.jar(-12.6, 0, 3.8, 0.34, POTS[2]);
    P.box(0, 0, -4.5, 1.6, 0.9, 1.2, 0, dk, 'stone');
    P.frustum(0, 0.9, -4.5, 0.5, 0.35, 1.1, 0, c, 'stone', 4);
    P.ball(0, 2.1, -4.5, 0.18, GLOW, 'glow');
    PK.boat(-15.5, 0, -2.5, 4.6, true, wood, null);

    /* private dock on piles, with a T-head and a moored boat */
    const DY = 1.2;
    G.box(0, DY - 0.22, 13.2, 4, 0.22, 14.4, 0, wood, 'wood');
    G.box(0, DY - 0.22, 19.4, 12, 0.22, 2.4, 0, wood, 'wood');
    for (let z = 7.5; z <= 20.6; z += 2.6) [-1.8, 1.8].forEach(function (x) { G.rod(x, 0, z, x, DY - 0.2, z, 0.14, TIMBER, 'wood'); });
    [-5.6, -3, 3, 5.6].forEach(function (x) { [18.4, 20.4].forEach(function (z) { G.rod(x, 0, z, x, DY - 0.2, z, 0.14, TIMBER, 'wood'); }); });
    [[-1.9, 9], [1.9, 9], [-1.9, 15], [1.9, 15], [-5.8, 20.4], [5.8, 20.4]].forEach(function (p) {
      G.cyl(p[0], DY, p[1], 0.18, 0.7, 0, TIMBER, 'wood');
    });
    G.box(0, DY, 6.3, 3.6, PH - DY, 0.6, 0, dk, 'stone');
    G.rod(5.6, DY, 19.4, 5.6, DY + 3.0, 19.4, 0.07, IRON, 'metal');
    G.rod(5.6, DY + 3.0, 19.4, 5.0, DY + 3.0, 19.4, 0.05, IRON, 'metal');
    G.ball(5.0, DY + 2.7, 19.4, 0.24, GLOW, 'glow');
    K.boat(-3.4, 0.05, 13.5, 6.2, false, 0x5d4a32, F.pick(SAIL));
    K.boat(3.3, 0.05, 15.0, 5.0, false, 0x6a5238, null);

    /* two boat sheds over the water: side walks on piles, plank walls, gable roofs */
    [9.0, 15.0].forEach(function (cx, i) {
      const z0 = PZ1, z1 = 16, L = z1 - z0, zc = (z0 + z1) / 2, hw = 2.7;
      [-1, 1].forEach(function (k) {
        G.box(cx + k * (hw - 0.45), DY - 0.2, zc, 0.9, 0.2, L, 0, wood, 'wood');
        for (let z = z0 + 1.5; z <= z1; z += 2.8) G.rod(cx + k * (hw - 0.3), 0, z, cx + k * (hw - 0.3), DY - 0.2, z, 0.13, TIMBER, 'wood');
        G.box(cx + k * hw, DY, zc, 0.16, 2.8, L, 0, shade(wood, -0.1 + i * 0.06), 'wood');
        for (let z = z0 + 1.0; z < z1; z += 2.0) G.box(cx + k * (hw + 0.1), DY, z, 0.12, 2.8, 0.2, 0, TIMBER, 'wood');
        G.sheet(cx, 5.6, zc, cx + k * (hw + 0.45), DY + 2.65, zc, L + 0.6, F.pick(ROOF), 'roof', 0.16);
      });
      /* truss on the open water end */
      G.box(cx, DY + 2.7, z1 - 0.1, 2 * hw + 0.2, 0.2, 0.2, 0, TIMBER, 'wood');
      G.beam(cx, DY + 2.8, z1 - 0.1, cx, 5.55, z1 - 0.1, 0.16, 0.16, TIMBER, 'wood');
      [-1, 1].forEach(function (k) { G.beam(cx + k * hw, DY + 2.8, z1 - 0.1, cx, 5.5, z1 - 0.1, 0.14, 0.14, TIMBER, 'wood'); });
      K.boat(cx, 0.05, zc + 0.5, 6.4, false, i ? 0x5d4a32 : 0x6a5238, null);
      G.box(cx + hw - 0.45, DY, zc - 2, 0.7, 0.5, 0.7, 0, wood, 'wood');
    });
    /* water stair at the front-left */
    K.stair(-11.5, 8.6, 0.05, PH, 0, -1, 3.0, shade(c, -0.05), 0.4);
    [-1, 1].forEach(function (k) { G.box(-11.5 + k * 1.75, 0, 7.3, 0.5, PH + 0.2, 2.6, 0, dk, 'stone'); });
  }

  /* ============================================================== REGISTRY */
  ASSET({
    key: 'voth_manor', name: 'Estate Manor', culture: 'voth', family: 'housing', source: 'voth-manors',
    districts: ['manor', 'estate'], wealth: [0.6, 1],
    blurb: 'Country seat of a wealthy Dunmer house: Hlaalu walled manor, Velothi terraced keep-house, or Mournhold domed hall.',
    w: 45, d: 50.5, h: 16, variants: 3,
    variantDims: [
      { w: 45, d: 50.5, h: 16 },
      { w: 33, d: 48, h: 19.5 },
      { w: 51, d: 47, h: 22 }
    ],
    build: function (F) {
      [manorHlaalu, manorVelothi, manorDomed][F.variant % 3](F);
    }
  });

  ASSET({
    key: 'voth_clan_compound_b', name: 'Clan Compound (varied)', culture: 'voth', family: 'housing', source: 'voth-manors',
    districts: ['common', 'estate', 'warren'], wealth: [0.2, 0.8],
    blurb: 'Walled cluster of clan houses round shared courts: mudbrick yard, fortified keep compound, or waterside compound with a dock.',
    w: 34.5, d: 29, h: 9.6, variants: 3,
    variantDims: [
      { w: 34.5, d: 29, h: 9.6 },
      { w: 40.5, d: 40.5, h: 23.5 },
      { w: 38, d: 45, h: 15 }
    ],
    build: function (F) {
      [clanMud, clanFort, clanWater][F.variant % 3](F);
    }
  });
})();
