/* ======================================================================
   Voth — shops (voth-shops)
   Eight trades, two designed variants each. Every shop reads as its trade
   from the street: a hanging trade sign (an icon on a board on an iron
   bracket), a street counter or open shopfront whose top shutter is propped
   up as an awning, the trade's goods out front, and the shopkeeper's family
   living upstairs, with the flat roof used as terrace / loft / store under an
   upper canopy.

   Conventions (see krator-asset-engine.js): +z is the street FRONT. Side codes
   used by the helpers: 0 = +z front, 1 = -z back, 2 = +x right, 3 = -x left.
   A "block" L is {x, z, w, d} (plus y/h where useful); FB() lays a box against
   one of its faces: `u` runs along the face (+x for sides 0/1, +z for 2/3),
   `off` is the box centre's distance out from the face plane.
   Beams (F.beam) are only ever given square sections here: a non-square beam
   twists when the frame is turned off-axis. Sloped shed roofs are hip roofs
   whose back half is buried in a taller wall.
   All helpers live inside this IIFE: the registries share one global scope.
   ====================================================================== */
(function () {
  'use strict';
  /* ---- palette (copied from PAL, src/05-palette.js) ---- */
  const STONE = [0x8c8579, 0x958e80, 0x87816f, 0x97907f, 0x827c6e, 0x8f8873, 0xa19a8a, 0x8a8272, 0x928c7c];
  const POOR = [0x8b8069, 0x7e7460, 0x968b73, 0x877d66, 0x9d9076];
  const TERRA = [0xb35a3a, 0xa04f32, 0xc36a42, 0xc4813f];
  const GREEN = 0x6b7a4a, PLUM = 0x7a5a72;
  const DOME = [0xb08d3c, 0xa0843f, 0x8f7a44, 0xb0a682, 0x9d9379, 0xa8a08a, 0x93886d];
  const BAN = [0x7a2028, 0x8a2f2a, 0x5c4028, 0xe8d9a0, 0xc9b8d6, 0xb8d0b0, 0xb0c8d8, 0xcbb08e, 0xe8c090];
  const SAIL = [0xcfc2a3, 0xc0b190, 0xb8a880, 0xa89878];
  const JADE = [0x3f6b56, 0x35594a, 0x4a7d64], LAPIS = [0x1f3f6e, 0x2a4d80, 0x17335c];
  const BASALT = [0x2b2a28, 0x322f2b], PORPH = [0x5e1e2d, 0x6a2434];
  const DOORC = 0x1c1a16, DARK = 0x262019, TIMBER = 0x4a3a28, TIMBER2 = 0x5a4028, PLANK = 0x6b5238;
  const IRON = 0x3a2f22, GILT = 0xb08d3c, GLOW = 0xffcf87, WATER = 0x3a4e52;
  const CRATEC = [0x6b5a40, 0x75613f, 0x5f5038], BARRELC = 0x5a4a34, CLAY = [0xa0613f, 0xb0714a, 0x8f5a3c, 0xb88a5a];
  const LEAF = [0x4e5a34, 0x5b6740, 0x616a41];

  /* ---- face geometry ---- */
  function P(L, s, u, off) {
    return s < 2 ? [L.x + u, L.z + (s === 0 ? 1 : -1) * (L.d / 2 + off)]
                 : [L.x + (s === 2 ? 1 : -1) * (L.w / 2 + off), L.z + u];
  }
  function FB(F, L, s, u, y, along, h, out, off, col, fam) {
    const p = P(L, s, u, off);
    if (s < 2) F.box(p[0], y, p[1], along, h, out, 0, col, fam);
    else F.box(p[0], y, p[1], out, h, along, 0, col, fam);
  }
  /* a rod lying along a face (tangential) */
  function FR(F, L, s, u0, u1, y, off, r, col, fam) {
    const a = P(L, s, u0, off), b = P(L, s, u1, off);
    F.rod(a[0], y, a[1], b[0], y, b[1], r, col, fam);
  }
  /* a rod standing out from a face (normal) */
  function FN(F, L, s, u, y0, off0, y1, off1, r, col, fam) {
    const a = P(L, s, u, off0), b = P(L, s, u, off1);
    F.rod(a[0], y0, a[1], b[0], y1, b[1], r, col, fam);
  }

  /* ---- walls ---- */
  function BLOCK(F, L, c, o) {
    o = o || {};
    F.box(L.x, L.y, L.z, L.w, L.h, L.d, 0, c, 'stone');
    F.box(L.x, L.y + L.h - 0.32, L.z, L.w + 0.34, 0.34, L.d + 0.34, 0, shade(c, -0.13), 'stone');
    if (o.band) F.box(L.x, o.band, L.z, L.w + 0.16, 0.22, L.d + 0.16, 0, shade(c, -0.08), 'stone');
    if (o.plinth) F.box(L.x, L.y, L.z, L.w + 0.3, o.plinth, L.d + 0.3, 0, shade(c, -0.22), 'stone');
    if (o.quoin) {
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (q) {
        F.box(L.x + q[0] * (L.w / 2 - 0.2), L.y, L.z + q[1] * (L.d / 2 - 0.2), 0.56, L.h - 0.32, 0.56, 0, shade(c, -0.06), 'stone');
      });
    }
  }
  /* parapet round a flat roof at y; gap = {s, u, w} leaves an opening for a stair */
  function PARA(F, L, y, c, h, gap) {
    const t = 0.3, col = shade(c, -0.04), cap = shade(c, -0.18);
    for (let s = 0; s < 4; s++) {
      const half = s < 2 ? L.w / 2 : L.d / 2 - t;
      let segs = [[-half, half]];
      if (gap && gap.s === s) segs = [[-half, gap.u - gap.w / 2], [gap.u + gap.w / 2, half]];
      segs.forEach(function (sg) {
        const len = sg[1] - sg[0];
        if (len < 0.2) return;
        const uc = (sg[0] + sg[1]) / 2;
        FB(F, L, s, uc, y, len, h, t, -t / 2, col, 'stone');
        FB(F, L, s, uc, y + h, len + 0.06, 0.12, t + 0.12, -t / 2, cap, 'stone');
      });
    }
  }
  function WIN(F, L, s, u, y, ww, wh, c, o) {
    o = o || {};
    FB(F, L, s, u, y, ww, wh, 0.1, 0.03, o.pane || DARK, o.glowing ? 'glow' : 'wood');
    FB(F, L, s, u, y - 0.18, ww + 0.36, 0.18, 0.36, 0.14, shade(c, -0.24), 'stone');
    FB(F, L, s, u, y + wh, ww + 0.3, 0.2, 0.24, 0.08, shade(c, -0.16), 'stone');
    [-1, 1].forEach(function (k) {
      FB(F, L, s, u + k * (ww / 2 + 0.07), y, 0.14, wh, 0.2, 0.07, shade(c, -0.1), 'stone');
    });
    if (o.shut) [-1, 1].forEach(function (k) {
      FB(F, L, s, u + k * (ww / 2 + 0.38), y + 0.05, 0.46, wh - 0.1, 0.07, 0.06, o.shut, 'wood');
    });
    if (o.bars) for (let i = 1; i < 4; i++) {
      const a = P(L, s, u - ww / 2 + ww * i / 4, 0.14);
      F.rod(a[0], y, a[1], a[0], y + wh, a[1], 0.035, IRON, 'metal');
    }
    if (o.glass) FB(F, L, s, u, y + 0.05, ww - 0.1, wh - 0.1, 0.04, 0.1, 0x9fb4b0, 'glass');
  }
  function ROW(F, L, s, y, n, spread, ww, wh, c, o, u0) {
    for (let i = 0; i < n; i++) {
      const u = (u0 || 0) + (n === 1 ? 0 : -spread + 2 * spread * i / (n - 1));
      WIN(F, L, s, u, y, ww, wh, c, o);
    }
  }
  function DOOR(F, L, s, u, y0, ww, wh, c, o) {
    o = o || {};
    const tr = shade(c, -0.2);
    FB(F, L, s, u, y0, ww, wh, 0.1, 0.03, o.leaf || DOORC, 'wood');
    FB(F, L, s, u, y0 + wh * 0.3, ww, 0.07, 0.05, 0.1, IRON, 'metal');
    FB(F, L, s, u, y0 + wh * 0.72, ww, 0.07, 0.05, 0.1, IRON, 'metal');
    [-1, 1].forEach(function (k) {
      FB(F, L, s, u + k * (ww / 2 + 0.16), y0, 0.32, wh, 0.34, 0.12, tr, 'stone');
    });
    FB(F, L, s, u, y0 + wh, ww + 0.9, 0.34, 0.42, 0.14, shade(c, -0.14), 'stone');
    FB(F, L, s, u, y0 - 0.02, ww + 0.32, 0.08, 0.36, 0.14, shade(c, -0.28), 'stone');
    if (y0 > 0.05) FB(F, L, s, u, 0, ww + 0.8, y0, 0.55, 0.28, shade(c, -0.26), 'stone');
    const k = P(L, s, u + ww * 0.3, 0.12);
    F.ball(k[0], y0 + wh * 0.48, k[1], 0.06, GILT, 'metal');
    if (o.lamp) {
      FN(F, L, s, u - ww / 2 - 0.55, y0 + wh + 0.1, 0.02, y0 + wh + 0.1, 0.6, 0.05, IRON, 'metal');
      const g = P(L, s, u - ww / 2 - 0.55, 0.6);
      F.ball(g[0], y0 + wh - 0.15, g[1], 0.2, GLOW, 'glow');
    }
  }
  /* open shopfront: stone stall-riser, drop-down counter on brackets, jambs,
     lintel, and the top shutter propped up flat as an awning. Returns the
     counter-top height and the counter's centre offset from the face. */
  function SHOP(F, L, s, u, y0, ww, wh, c, o) {
    o = o || {};
    const ct = y0 + 1.0, aw = o.aw || 1.3, sc = o.shutC || PLANK;
    FB(F, L, s, u, y0 + 1.0, ww, wh - 1.0, 0.1, 0.03, DARK, 'wood');
    FB(F, L, s, u, y0, ww, 1.0, 0.3, 0.1, shade(c, -0.12), 'stone');
    FB(F, L, s, u, ct, ww + 0.1, 0.1, 0.8, 0.5, sc, 'wood');
    [-1, 1].forEach(function (k) {
      const uu = u + k * (ww / 2 - 0.35);
      const a = P(L, s, uu, 0.25), b = P(L, s, uu, 0.8);
      F.beam(a[0], ct - 0.55, a[1], b[0], ct, b[1], 0.08, 0.08, TIMBER, 'wood');
      FB(F, L, s, u + k * (ww / 2 + 0.18), y0, 0.36, wh, 0.36, 0.12, TIMBER, 'wood');
    });
    FB(F, L, s, u, y0 + wh, ww + 0.8, 0.32, 0.42, 0.15, TIMBER, 'wood');
    /* top shutter swung up flat, on two props */
    FB(F, L, s, u, y0 + wh + 0.32, ww + 0.2, 0.09, aw, aw / 2, sc, 'wood');
    FB(F, L, s, u, y0 + wh + 0.41, 0.1, 0.06, aw, aw / 2, shade(sc, -0.2), 'wood');
    FB(F, L, s, u, y0 + wh + 0.2, ww + 0.2, 0.2, 0.06, aw - 0.03, shade(sc, -0.12), 'wood');
    [-1, 1].forEach(function (k) {
      FN(F, L, s, u + k * (ww / 2 - 0.1), y0 + wh - 0.9, 0.05, y0 + wh + 0.32, aw - 0.12, 0.045, TIMBER, 'wood');
    });
    return { ct: ct + 0.1, off: 0.5, aw: aw };
  }
  /* hanging trade sign: iron arm + strut off a face, chains, board, icon */
  function SIGN(F, L, s, u, y, icon, board, ink) {
    FB(F, L, s, u, y - 1.0, 0.22, 1.25, 0.06, 0.03, IRON, 'metal');
    FN(F, L, s, u, y, 0.02, y, 1.55, 0.045, IRON, 'metal');
    FN(F, L, s, u, y - 0.95, 0.04, y, 0.95, 0.035, IRON, 'metal');
    const e = P(L, s, u, 1.55);
    F.ball(e[0], y, e[1], 0.08, IRON, 'metal');
    [0.45, 1.25].forEach(function (a) {
      FN(F, L, s, u, y, a, y - 0.32, a, 0.02, IRON, 'metal');
    });
    const vb = y - 1.3, vc = vb + 0.49;
    FB(F, L, s, u, vb, 0.07, 0.98, 1.02, 0.85, board, 'wood');
    FB(F, L, s, u, vb + 0.92, 0.1, 0.06, 1.1, 0.85, shade(board, -0.25), 'wood');
    FB(F, L, s, u, vb - 0.04, 0.1, 0.06, 1.1, 0.85, shade(board, -0.25), 'wood');
    const T = 0.15;
    function IB(a, v, wa, hv, col, fam) { FB(F, L, s, u, v, T, hv, wa, a, col, fam || 'wood'); }
    function ID(a, v, r, col, fam) {
      const p0 = P(L, s, u - T / 2, a), p1 = P(L, s, u + T / 2, a);
      if (s < 2) F.rod(p0[0], v, p0[1], p1[0], v, p1[1], r, col, fam || 'wood');
      else F.rod(p0[0], v, p0[1], p1[0], v, p1[1], r, col, fam || 'wood');
    }
    /* icon drawn in (a = out from wall, v = height), centred a = 0.85, v = vc */
    if (icon === 'anvil') {
      IB(0.85, vc - 0.34, 0.42, 0.1, ink, 'metal'); IB(0.85, vc - 0.24, 0.18, 0.2, ink, 'metal');
      IB(0.8, vc - 0.04, 0.5, 0.15, ink, 'metal'); IB(1.12, vc + 0.0, 0.16, 0.08, ink, 'metal');
      IB(0.72, vc + 0.14, 0.07, 0.3, 0x6b5238); IB(0.72, vc + 0.36, 0.26, 0.1, ink, 'metal');
    } else if (icon === 'flask') {
      ID(0.85, vc - 0.12, 0.2, ink, 'glass'); IB(0.85, vc + 0.06, 0.1, 0.24, ink, 'glass');
      IB(0.85, vc + 0.3, 0.16, 0.06, GILT, 'metal'); ID(0.85, vc - 0.14, 0.12, 0x6fa86a, 'glow');
    } else if (icon === 'tunic') {
      IB(0.85, vc - 0.34, 0.32, 0.46, ink); IB(0.85, vc + 0.04, 0.62, 0.16, ink);
      IB(0.85, vc + 0.2, 0.14, 0.06, GILT, 'metal');
    } else if (icon === 'scales') {
      IB(0.85, vc - 0.36, 0.26, 0.06, ink, 'metal'); IB(0.85, vc - 0.3, 0.05, 0.6, ink, 'metal');
      IB(0.85, vc + 0.26, 0.64, 0.05, ink, 'metal');
      ID(0.58, vc - 0.04, 0.12, ink, 'metal'); ID(1.12, vc - 0.04, 0.12, ink, 'metal');
      IB(0.58, vc - 0.02, 0.03, 0.28, ink, 'metal'); IB(1.12, vc - 0.02, 0.03, 0.28, ink, 'metal');
    } else if (icon === 'book') {
      IB(0.7, vc - 0.22, 0.28, 0.4, 0xe0d6bc); IB(1.0, vc - 0.22, 0.28, 0.4, 0xe0d6bc);
      IB(0.85, vc - 0.26, 0.05, 0.46, ink); IB(0.85, vc - 0.3, 0.64, 0.07, ink);
      IB(0.62, vc + 0.02, 0.12, 0.03, ink); IB(0.66, vc - 0.08, 0.16, 0.03, ink);
    } else if (icon === 'gem') {
      ID(0.85, vc, 0.26, ink, 'metal'); ID(0.85, vc, 0.17, 0x9ab8ff, 'glow');
      IB(0.85, vc + 0.28, 0.05, 0.14, ink, 'metal'); IB(0.85, vc - 0.42, 0.05, 0.14, ink, 'metal');
      IB(0.5, vc - 0.02, 0.14, 0.05, ink, 'metal'); IB(1.2, vc - 0.02, 0.14, 0.05, ink, 'metal');
    } else if (icon === 'fish') {
      IB(0.8, vc - 0.1, 0.46, 0.2, ink, 'metal'); ID(0.58, vc, 0.1, ink, 'metal');
      IB(1.1, vc - 0.18, 0.1, 0.36, ink, 'metal'); ID(0.6, vc + 0.02, 0.03, DOORC);
    } else if (icon === 'pot') {
      ID(0.85, vc - 0.1, 0.22, ink); IB(0.85, vc + 0.1, 0.16, 0.22, ink);
      IB(0.85, vc + 0.3, 0.26, 0.05, ink); IB(0.85, vc - 0.38, 0.2, 0.06, ink);
      IB(0.64, vc + 0.04, 0.05, 0.2, ink); IB(1.06, vc + 0.04, 0.05, 0.2, ink);
    }
  }
  /* canopy on poles: a cloth panel over a rect, timber rails, valances on the
     outer edges; `poles` lists the [x,z] feet (poles run from yb to yt). */
  function CANOPY(F, x0, z0, x1, z1, yb, yt, cloth, poles, val) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = Math.abs(x1 - x0), d = Math.abs(z1 - z0);
    (poles || [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]).forEach(function (p) {
      F.box(p[0], yb, p[1], 0.14, yt - yb, 0.14, 0, TIMBER, 'wood');
    });
    F.box(cx, yt - 0.14, z0, w, 0.14, 0.14, 0, TIMBER, 'wood');
    F.box(cx, yt - 0.14, z1, w, 0.14, 0.14, 0, TIMBER, 'wood');
    F.box(x0, yt - 0.14, cz, 0.14, 0.14, d, 0, TIMBER, 'wood');
    F.box(x1, yt - 0.14, cz, 0.14, 0.14, d, 0, TIMBER, 'wood');
    F.box(cx, yt, cz, w + 0.3, 0.05, d + 0.3, 0, cloth, 'cloth');
    (val || []).forEach(function (e) {
      const vc = shade(cloth, -0.12);
      if (e === 'z1') F.box(cx, yt - 0.35, z1 + 0.16, w + 0.3, 0.38, 0.03, 0, vc, 'cloth');
      if (e === 'z0') F.box(cx, yt - 0.35, z0 - 0.16, w + 0.3, 0.38, 0.03, 0, vc, 'cloth');
      if (e === 'x1') F.box(x1 + 0.16, yt - 0.35, cz, 0.03, 0.38, d + 0.3, 0, vc, 'cloth');
      if (e === 'x0') F.box(x0 - 0.16, yt - 0.35, cz, 0.03, 0.38, d + 0.3, 0, vc, 'cloth');
    });
  }
  /* solid masonry stair rising along an axis: from (x,z) going dir*(axis) */
  function STAIR(F, x, z, axis, dir, y0, y1, wd, col) {
    const n = Math.max(1, Math.round((y1 - y0) / 0.27)), rise = (y1 - y0) / n, run = 0.3;
    for (let i = 0; i < n; i++) {
      const t = dir * (i * run + run / 2);
      const hh = rise * (i + 1);
      if (axis === 'x') F.box(x + t, y0, z, run + 0.01, hh, wd, 0, i % 2 ? col : shade(col, 0.03), 'stone');
      else F.box(x, y0, z + t, wd, hh, run + 0.01, 0, i % 2 ? col : shade(col, 0.03), 'stone');
    }
    return n * run;
  }
  /* open timber stair: two stringers, treads, newel posts and a hand rail */
  function TSTAIR(F, x, z, axis, dir, y0, y1, wd) {
    const n = Math.max(1, Math.round((y1 - y0) / 0.27)), rise = (y1 - y0) / n, run = 0.3, L = n * run;
    const ax = axis === 'x', sx = function (t, k) { return ax ? x + dir * t : x + k * wd / 2; },
      sz = function (t, k) { return ax ? z + k * wd / 2 : z + dir * t; };
    [-1, 1].forEach(function (k) {
      F.beam(sx(0, k), y0, sz(0, k), sx(L, k), y1, sz(L, k), 0.14, 0.14, TIMBER, 'wood');
      F.box(sx(0.1, k), y0, sz(0.1, k), 0.14, 1.1, 0.14, 0, TIMBER, 'wood');
      F.rod(sx(0.1, k), y0 + 1.05, sz(0.1, k), sx(L, k), y1 + 1.05, sz(L, k), 0.04, TIMBER, 'wood');
      for (let t = 1.6; t < L - 0.4; t += 1.8) {
        const yy = y0 + (y1 - y0) * t / L;
        F.box(sx(t, k), yy, sz(t, k), 0.1, 1.05, 0.1, 0, TIMBER, 'wood');
        if (yy > 1.2) F.box(sx(t, k), 0, sz(t, k), 0.16, yy, 0.16, 0, TIMBER, 'wood');
      }
    });
    for (let i = 0; i < n; i++) {
      const t = i * run + run / 2, yy = y0 + rise * (i + 1) - 0.06;
      F.box(ax ? x + dir * t : x, yy, ax ? z : z + dir * t, ax ? run - 0.04 : wd - 0.1, 0.06, ax ? wd - 0.1 : run - 0.04, 0, PLANK, 'wood');
    }
    return L;
  }
  /* ---- goods ---- */
  function CRATE(F, x, y, z, sz, ry, col) {
    col = col || CRATEC[0];
    F.box(x, y, z, sz, sz * 0.85, sz, ry || 0, col, 'wood');
    F.box(x, y + sz * 0.38, z, sz + 0.03, 0.07, sz + 0.03, ry || 0, shade(col, -0.2), 'wood');
  }
  function BARREL(F, x, y, z, r, h) {
    F.cyl(x, y, z, r, h, 0, BARRELC, 'wood');
    F.cyl(x, y + h * 0.2, z, r + 0.02, 0.06, 0, IRON, 'metal');
    F.cyl(x, y + h * 0.75, z, r + 0.02, 0.06, 0, IRON, 'metal');
    F.cyl(x, y + h, z, r * 0.92, 0.03, 0, shade(BARRELC, 0.1), 'wood');
  }
  function JAR(F, x, y, z, r, col) {
    F.cyl(x, y, z, r * 0.45, r * 0.3, 0, shade(col, -0.1), 'stone');
    F.ball(x, y + r * 1.05, z, r, col, 'stone');
    F.cyl(x, y + r * 1.75, z, r * 0.38, r * 0.45, 0, col, 'stone');
    F.cyl(x, y + r * 2.15, z, r * 0.5, r * 0.1, 0, shade(col, -0.12), 'stone');
  }
  function SACK(F, x, y, z, r, col) {
    F.blob(x, y + r * 0.62, z, r, r * 1.25, 0, col || 0xa8987a, 'cloth');
    F.ball(x, y + r * 1.3, z, r * 0.25, shade(col || 0xa8987a, -0.1), 'cloth');
  }
  function BASKET(F, x, y, z, r, h, fill) {
    F.cyl(x, y, z, r, h, 0, 0x8a7550, 'wood');
    F.cyl(x, y + h - 0.04, z, r + 0.03, 0.06, 0, 0x6f5d3e, 'wood');
    if (fill != null) F.blob(x, y + h, z, r * 0.9, r * 0.6, 0, fill, 'cloth');
  }
  function POT(F, x, z, y, r, col) { /* a planted pot */
    F.cyl(x, y, z, r, r * 1.2, 0, col || CLAY[0], 'stone');
    F.blob(x, y + r * 1.4, z, r * 1.1, r * 1.2, 0, LEAF[0], 'leafy');
  }
  function LINE(F, x0, z0, x1, z1, y, cols, drop) { /* laundry / drying line */
    F.rod(x0, y, z0, x1, y - 0.1, z1, 0.02, 0x6b5a3a, 'rope');
    const n = cols.length;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0), wd = Math.min(0.9, (alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0)) / n - 0.1);
      F.box(x, y - 0.05 - (drop || 1.0), z, alongX ? wd : 0.03, drop || 1.0, alongX ? 0.03 : wd, 0, cols[i], 'cloth');
    }
  }
  function CHIMNEY(F, x, z, y, h, c) {
    F.box(x, y, z, 0.9, h, 0.9, 0, shade(c, -0.2), 'stone');
    F.box(x, y + h, z, 1.2, 0.35, 1.2, 0, shade(c, -0.32), 'stone');
    F.cyl(x, y + h + 0.35, z, 0.22, 0.45, 0, 0x3a3128, 'stone');
  }
  function BENCH(F, x, y, z, len, alongX, col) {
    col = col || TIMBER2;
    F.box(x, y + 0.42, z, alongX ? len : 0.45, 0.08, alongX ? 0.45 : len, 0, col, 'wood');
    [-1, 1].forEach(function (k) {
      F.box(x + (alongX ? k * (len / 2 - 0.15) : 0), y, z + (alongX ? 0 : k * (len / 2 - 0.15)), alongX ? 0.1 : 0.4, 0.42, alongX ? 0.4 : 0.1, 0, shade(col, -0.15), 'wood');
    });
  }
  function TABLE(F, x, y, z, w, d) {
    F.box(x, y + 0.72, z, w, 0.07, d, 0, PLANK, 'wood');
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
      F.box(x + q[0] * (w / 2 - 0.1), y, z + q[1] * (d / 2 - 0.1), 0.08, 0.72, 0.08, 0, TIMBER, 'wood');
    });
  }
  /* a pale-roofed loft room on a flat roof, door on side ds */
  function LOFT(F, x, y, z, w, d, h, c, ds, o) {
    o = o || {};
    const L = { x: x, z: z, w: w, d: d, y: y, h: h };
    BLOCK(F, L, c, {});
    DOOR(F, L, ds, o.du || 0, y, 1.0, 2.1, c, { leaf: o.leaf });
    for (let s = 0; s < 4; s++) {
      if (o.skip && o.skip.indexOf(s) >= 0) continue;
      const span = s < 2 ? w : d;
      if (s === ds) { if (span > 3.4) WIN(F, L, s, (o.du || 0) > 0 ? -span / 4 : span / 4, y + 1.0, 0.8, 1.0, c, { shut: o.shut }); }
      else WIN(F, L, s, 0, y + 1.0, 0.8, 1.0, c, { shut: o.shut });
    }
    return L;
  }

  /* velothi battered square block on a 0.4 m plinth; returns its top, a
     face-at-height block maker and the roof rectangle */
  function VEL(F, x, z, r0, r1, H, c, o) {
    o = o || {};
    const y0 = 0.4, dk = shade(c, -0.2);
    const fr = function (y) { return r0 - (r0 - r1) * (y - y0) / H; };
    F.frustum(x, 0, z, r0 + 0.3, r0 + 0.22, y0, 0, dk, 'stone', 4);
    F.frustum(x, y0, z, r0, r1, H, 0, c, 'stone', 4);
    if (o.band) F.frustum(x, o.band, z, fr(o.band) + 0.1, fr(o.band + 0.24) + 0.1, 0.24, 0, shade(c, -0.1), 'stone', 4);
    F.frustum(x, y0 + H, z, r1 + 0.2, r1 + 0.2, 0.34, 0, shade(c, -0.15), 'stone', 4);
    return {
      top: y0 + H + 0.34, fr: fr,
      L: function (y) { return { x: x, z: z, w: 2 * fr(y), d: 2 * fr(y) }; },
      R: { x: x, z: z, w: 2 * r1 + 0.4, d: 2 * r1 + 0.4 }
    };
  }
  /* herb bundles hanging from a line (x0,z0)-(x1,z1) at height y */
  function HERBS(F, x0, z0, x1, z1, y, n) {
    const cols = [0x6f7d42, 0x8a8a4a, 0x7d7a4e, 0x9a8a63, 0x5c6b3a];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      F.rod(x, y - 0.16, z, x, y, z, 0.012, 0x6b5a3a, 'rope');
      F.cone(x, y - 0.56, z, 0.12, 0.42, i * 0.7, cols[i % cols.length], 'leafy');
    }
  }
  function LADDER(F, x0, z0, y0, x1, z1, y1, wd, alongX) {
    const ox = alongX ? wd / 2 : 0, oz = alongX ? 0 : wd / 2;
    [-1, 1].forEach(function (k) { F.rod(x0 + k * ox, y0, z0 + k * oz, x1 + k * ox, y1, z1 + k * oz, 0.045, TIMBER, 'wood'); });
    const n = Math.floor((y1 - y0) / 0.32);
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 0.5), x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, y = y0 + (y1 - y0) * t;
      F.rod(x - ox, y, z - oz, x + ox, y, z + oz, 0.03, TIMBER, 'wood');
    }
  }
  /* shelves of jars (on a face, e.g. inside a bay): rows of small coloured pots */
  function JARSHELF(F, x0, x1, z, y, rows, alongX) {
    const jc = [0x6f8f6a, 0x9a6a4a, 0xb8a060, 0x5a6f8a, 0x8a4a5a, 0xd0c8a8];
    for (let r = 0; r < rows; r++) {
      const yy = y + r * 0.6;
      if (alongX) F.box((x0 + x1) / 2, yy, z, Math.abs(x1 - x0), 0.05, 0.32, 0, PLANK, 'wood');
      else F.box(z, yy, (x0 + x1) / 2, 0.32, 0.05, Math.abs(x1 - x0), 0, PLANK, 'wood');
      const n = Math.floor(Math.abs(x1 - x0) / 0.26);
      for (let i = 0; i < n; i++) {
        const t = x0 + (x1 - x0) * (i + 0.5) / n, col = jc[(i * 3 + r * 2) % jc.length];
        const h = 0.18 + ((i + r) % 3) * 0.06;
        if (alongX) F.cyl(t, yy + 0.05, z, 0.08, h, 0, col, (i + r) % 2 ? 'glass' : 'stone');
        else F.cyl(z, yy + 0.05, t, 0.08, h, 0, col, (i + r) % 2 ? 'glass' : 'stone');
      }
    }
  }

  /* =================================================================== */
  ASSET({
    key: 'voth_shop_smithy', name: 'Smithy', culture: 'voth', family: 'shop', source: 'voth-shops',
    districts: ['common', 'poor', 'harbour'], wealth: [0.2, 0.7],
    blurb: 'A smith\'s forge: open work shed with hearth, anvil, quench trough and blade racks beside the family\'s house.',
    w: 17, d: 17, h: 11, variants: 2,
    variantDims: [{ w: 17, d: 11, h: 11 }, { w: 17, d: 17, h: 11 }],
    build: function (F) {
      const c = F.pick(STONE), dk = shade(c, -0.2);
      const metalC = 0x6f7478, board = TIMBER2;
      function anvil(x, z, y) {
        F.cyl(x, y, z, 0.38, 0.55, 0, TIMBER, 'wood');
        F.box(x, y + 0.55, z, 0.34, 0.12, 0.5, 0, IRON, 'metal');
        F.box(x, y + 0.67, z, 0.18, 0.22, 0.3, 0, IRON, 'metal');
        F.box(x, y + 0.89, z, 0.32, 0.16, 0.66, 0, 0x4a4a4c, 'metal');
        F.rod(x, y + 0.98, z + 0.33, x, y + 0.96, z + 0.6, 0.06, 0x4a4a4c, 'metal');
        F.box(x + 0.05, y + 1.05, z - 0.1, 0.07, 0.07, 0.4, 0, TIMBER, 'wood');
        F.box(x + 0.05, y + 1.05, z + 0.12, 0.14, 0.12, 0.12, 0, IRON, 'metal');
      }
      function trough(x, z, w, d) {
        F.box(x, 0, z, w, 0.72, d, 0, dk, 'stone');
        F.box(x, 0.55, z, w - 0.2, 0.12, d - 0.2, 0, WATER, 'glass');
      }
      function bladeRack(x, z, len, alongX) {
        [-1, 1].forEach(function (k) {
          F.box(x + (alongX ? k * len / 2 : 0), 0, z + (alongX ? 0 : k * len / 2), 0.12, 1.5, 0.12, 0, TIMBER, 'wood');
        });
        F.box(x, 1.35, z, alongX ? len : 0.1, 0.1, alongX ? 0.1 : len, 0, TIMBER, 'wood');
        F.box(x, 0.35, z, alongX ? len : 0.12, 0.08, alongX ? 0.12 : len, 0, TIMBER, 'wood');
        const n = Math.floor(len / 0.32);
        for (let i = 0; i < n; i++) {
          const t = -len / 2 + 0.2 + i * (len - 0.4) / Math.max(1, n - 1);
          const bx = x + (alongX ? t : 0.12), bz = z + (alongX ? 0.12 : t);
          F.box(bx, 0.39, bz, alongX ? 0.06 : 0.03, 1.1, alongX ? 0.03 : 0.06, 0, metalC, 'metal');
          F.box(bx, 1.35, bz, alongX ? 0.2 : 0.05, 0.05, alongX ? 0.05 : 0.2, 0, IRON, 'metal');
          F.box(bx, 1.4, bz, 0.05, 0.22, 0.05, 0, TIMBER, 'wood');
        }
      }
      function grindstone(x, z) {
        F.box(x - 0.3, 0, z, 0.08, 0.8, 0.08, 0, TIMBER, 'wood');
        F.box(x + 0.3, 0, z, 0.08, 0.8, 0.08, 0, TIMBER, 'wood');
        F.rod(x - 0.1, 0.72, z, x + 0.1, 0.72, z, 0.4, 0x8a857a, 'stone');
        F.rod(x - 0.36, 0.72, z, x + 0.36, 0.72, z, 0.04, IRON, 'metal');
        F.box(x, 0, z, 0.6, 0.3, 0.9, 0, TIMBER, 'wood');
      }

      if (F.variant === 0) {
        /* ---- velothi street-front forge: battered house + open work shed ---- */
        const hx = -3, r0 = 4.4, r1 = 4.1, H = 7.0, y0 = 0.4;
        const fr = function (y) { return r0 - (r0 - r1) * (y - y0) / H; };
        const Lb = function (y) { return { x: hx, z: 0, w: 2 * fr(y), d: 2 * fr(y) }; };
        F.frustum(hx, 0, 0, r0 + 0.3, r0 + 0.22, y0, 0, dk, 'stone', 4);
        F.frustum(hx, y0, 0, r0, r1, H, 0, c, 'stone', 4);
        F.frustum(hx, 3.6, 0, fr(3.6) + 0.1, fr(3.8) + 0.1, 0.24, 0, shade(c, -0.1), 'stone', 4);
        F.frustum(hx, y0 + H, 0, r1 + 0.2, r1 + 0.2, 0.34, 0, shade(c, -0.15), 'stone', 4);
        const top = y0 + H + 0.34;
        /* front: shopfront counter + house door */
        const L1 = Lb(1.6);
        const sf = SHOP(F, L1, 0, 0.9, y0, 3.8, 2.6, c, { aw: 1.2 });
        for (let i = 0; i < 5; i++) F.box(-1.4 + i * 0.4 + hx + 0.9 + 0.3, sf.ct, L1.d / 2 + 0.45, 0.07, 0.03, 0.72, 0, metalC, 'metal');
        F.dome(hx + 2.5, sf.ct, L1.d / 2 + 0.5, 0.2, 0.2, 0, 0x6f6a60, 'metal');
        F.dome(hx - 0.5, sf.ct, L1.d / 2 + 0.5, 0.2, 0.22, 0, 0x6f6a60, 'metal');
        DOOR(F, L1, 0, -2.9, y0, 1.2, 2.4, c, { lamp: true });
        const L2 = Lb(4.8);
        ROW(F, L2, 0, 4.4, 2, 2.1, 0.9, 1.3, c, { shut: TIMBER2 }, 0);
        SIGN(F, Lb(6.2), 0, 3.5, 6.6, 'anvil', board, 0x4a4a4c);
        /* back: two storeys of windows, a pair of capped buttress pylons */
        ROW(F, Lb(2.2), 1, 1.8, 2, 1.8, 0.9, 1.2, c, {}, 0);
        ROW(F, L2, 1, 4.4, 3, 2.6, 0.8, 1.2, c, { shut: TIMBER2 }, 0);
        [-1, 1].forEach(function (k) {
          F.frustum(hx + k * 3.2, 0, -r0 - 0.35, 0.5, 0.32, 5.2, 0, shade(c, -0.08), 'stone', 4);
          F.box(hx + k * 3.2, 5.2, -r0 - 0.3, 0.8, 0.3, 0.8, 0, dk, 'stone');
          F.cone(hx + k * 3.2, 5.5, -r0 - 0.3, 0.42, 0.6, 0, dk, 'stone');
        });
        /* left: solid stair up the flank to the roof terrace */
        const sx = hx - r0 - 0.35;
        const sl = STAIR(F, sx, 4.9, 'z', -1, 0, top, 1.3, shade(c, -0.1));
        F.rod(sx - 0.62, 1.0, 4.9, sx - 0.62, top + 1.0, 4.9 - sl, 0.04, IRON, 'metal');
        F.rod(sx - 0.62, 0, 4.75, sx - 0.62, 1.0, 4.75, 0.05, IRON, 'metal');
        WIN(F, Lb(5), 3, 2.6, 5.0, 0.8, 1.2, c, { shut: TIMBER2 });
        ROW(F, Lb(6), 2, 5.5, 2, 2.2, 0.8, 1.1, c, { shut: TIMBER2 }, 0);
        /* right: open-sided work shed under a lean-to roof */
        const wx = hx + r0 - 0.25, ox = 7.8, sd = 8.4;
        F.pyrRoof(wx, 3.8, 0, 2 * (ox + 0.5 - wx), 1.5, sd, 0, F.pick(TERRA), 'roof');
        F.box(ox, 3.6, 0, 0.26, 0.26, sd - 0.4, 0, TIMBER, 'wood');
        [-1, 1].forEach(function (k) {
          F.box(ox, 0, k * (sd / 2 - 0.35), 0.28, 3.6, 0.28, 0, TIMBER, 'wood');
          F.cyl(ox, 0, k * (sd / 2 - 0.35), 0.26, 0.3, 0, dk, 'stone');
          F.box((wx + ox) / 2, 3.45, k * (sd / 2 - 0.35), ox - wx, 0.2, 0.2, 0, TIMBER, 'wood');
        });
        F.box(ox, 0, 0, 0.26, 3.6, 0.26, 0, TIMBER, 'wood');
        F.beam(ox, 2.6, 0, ox, 3.6, -1.1, 0.14, 0.14, TIMBER, 'wood');
        F.beam(ox, 2.6, 0, ox, 3.6, 1.1, 0.14, 0.14, TIMBER, 'wood');
        F.box((wx + ox) / 2, 0, 0, ox - wx + 0.6, 0.05, sd, 0, 0x5b5348, 'stone');
        /* forge: hearth, coals, stack through the roof, bellows */
        const fx = 4.2, fz = -3.1;
        F.box(fx, 0, fz, 2.2, 0.95, 1.5, 0, dk, 'stone');
        F.box(fx, 0.95, fz, 2.3, 0.12, 1.6, 0, shade(c, -0.3), 'stone');
        F.blob(fx, 1.1, fz + 0.1, 0.6, 0.3, 0, 0xff8a3a, 'glow');
        F.frustum(fx, 0, -3.95, 0.85, 0.55, 9.8, 0, shade(c, -0.14), 'stone', 4);
        F.box(fx, 9.8, -3.95, 1.4, 0.35, 1.4, 0, dk, 'stone');
        F.box(fx, 10.15, -3.95, 0.7, 0.5, 0.7, 0, 0x3a3128, 'stone');
        F.frustum(fx, 1.9, fz + 0.2, 1.1, 0.55, 1.4, 0, shade(c, -0.25), 'stone', 4);
        F.box(fx + 1.55, 0, fz, 0.6, 0.5, 0.8, 0, TIMBER, 'wood');
        F.box(fx + 1.55, 0.5, fz, 0.8, 0.35, 1.0, 0, 0x5a4028, 'wood');
        F.box(fx + 1.55, 0.85, fz, 0.8, 0.12, 1.0, 0, TIMBER, 'wood');
        anvil(4.8, 0.2, 0.12);
        trough(6.7, 0.9, 0.8, 1.8);
        grindstone(3.3, 2.6);
        bladeRack(6.0, 3.85, 2.8, true);
        /* tools hung on the house wall under the shed */
        const Lw = Lb(2.4);
        FR(F, Lw, 2, -2.2, 0.6, 2.5, 0.08, 0.05, TIMBER, 'wood');
        for (let i = 0; i < 6; i++) FN(F, Lw, 2, -2.0 + i * 0.5, 2.5, 0.1, 1.6, 0.1, 0.03, IRON, 'metal');
        F.blob(7.2, 0.12, -3.0, 0.9, 0.9, 0, 0x2a2826, 'stone');
        for (let i = 0; i < 4; i++) F.box(6.9, 0.12 + i * 0.1, -1.6, 0.9, 0.1, 0.12 + (i % 2) * 0.05, i * 0.2, 0x55585a, 'metal');
        CRATE(F, 7.0, 0, 3.0, 0.7, 0.2);
        /* roof: parapet, loft room with small dome, canopy over stored iron and charcoal */
        const Lr = { x: hx, z: 0, w: 2 * r1 + 0.4, d: 2 * r1 + 0.4 };
        PARA(F, Lr, top, c, 0.9, { s: 3, u: -3.1, w: 1.5 });
        const Lo = LOFT(F, hx - 1.2, top, -1.5, 3.8, 3.4, 2.7, shade(c, 0.04), 0, { du: 0.6, shut: TIMBER2 });
        F.dome(hx - 1.2, top + 2.7, -1.5, 1.3, 1.1, 0, F.pick(DOME), 'dome');
        F.ball(hx - 1.2, top + 3.85, -1.5, 0.16, GILT, 'metal');
        CANOPY(F, hx - 3.4, 1.0, hx + 3.4, 3.6, top, top + 2.4, F.pick(SAIL), null, ['z1']);
        for (let i = 0; i < 3; i++) SACK(F, hx - 2.6 + i * 0.7, top, 2.9, 0.35, 0x3a3632);
        CRATE(F, hx + 0.8, top, 2.4, 0.8, 0.1); CRATE(F, hx + 0.8, top + 0.68, 2.4, 0.6, 0.4);
        for (let i = 0; i < 5; i++) F.box(hx + 2.6, top + i * 0.09, 2.2, 1.2, 0.09, 0.1 + (i % 2) * 0.06, 0.1 * i, 0x55585a, 'metal');
        BENCH(F, hx + 2.3, top, -2.0, 1.6, false);
        CHIMNEY(F, hx + 2.6, -3.0, top, 1.6, c);
        LINE(F, hx - 3.5, -3.7, hx + 1.2, -3.7, top + 2.0, [F.pick(BAN), F.pick(SAIL), F.pick(BAN)], 0.8);
        [hx - 3.5, hx + 1.2].forEach(function (lx) { F.rod(lx, top, -3.7, lx, top + 2.05, -3.7, 0.05, TIMBER, 'wood'); });
      } else {
        /* ---- hlaalu corner yard: L-shaped house round a forge yard ---- */
        const H = 7.0, p = 0.35, top = p + H;
        const A = { x: 0, z: -5, w: 16, d: 5, y: p, h: H };    /* back range */
        const B = { x: -5, z: 2.25, w: 6, d: 9.5, y: p, h: H };  /* street wing */
        F.box(0, 0, -5, 16.3, p, 5.3, 0, dk, 'stone');
        F.box(-5, 0, 2.25, 6.3, p, 9.5, 0, dk, 'stone');
        BLOCK(F, A, c, { band: 3.8, quoin: true });
        BLOCK(F, B, c, { band: 3.8, quoin: true });
        /* street wing front: shopfront + door, balcony above */
        const sf = SHOP(F, B, 0, 0.8, p, 3.0, 2.6, c, { aw: 1.3 });
        for (let i = 0; i < 4; i++) F.box(-5 + 0.8 - 1.0 + i * 0.65, sf.ct, B.z + B.d / 2 + 0.5, 0.08, 0.04, 0.7, 0, metalC, 'metal');
        F.box(-5 + 1.8, sf.ct, B.z + B.d / 2 + 0.45, 0.4, 0.3, 0.3, 0, IRON, 'metal');
        DOOR(F, B, 0, -2.2, p, 1.1, 2.4, c, { lamp: true });
        const bz = B.z + B.d / 2;
        F.box(-5, 4.1, bz + 0.6, 5.0, 0.26, 1.2, 0, TIMBER2, 'wood');
        [-2, 2].forEach(function (ox) { F.beam(-5 + ox, 4.1, bz + 0.05, -5 + ox, 3.3, bz + 0.05 + 0.8, 0.2, 0.2, TIMBER, 'wood'); });
        F.box(-5, 4.36, bz + 1.15, 5.0, 0.9, 0.1, 0, TIMBER, 'wood');
        [-2.45, 2.45].forEach(function (ox) { F.box(-5 + ox, 4.36, bz + 0.6, 0.1, 0.9, 1.2, 0, TIMBER, 'wood'); });
        DOOR(F, B, 0, 0, 4.1, 1.0, 2.2, c);
        WIN(F, B, 0, -2.2, 4.7, 0.8, 1.2, c, { shut: TIMBER2 });
        WIN(F, B, 0, 2.2, 4.7, 0.8, 1.2, c, { shut: TIMBER2 });
        SIGN(F, { x: 4.2, z: 6.8, w: 0.6, d: 0.6 }, 0, 0, 3.2, 'anvil', board, 0x4a4a4c);
        /* street wing left flank + back range: windows all round */
        ROW(F, B, 3, 1.6, 3, 3.2, 0.9, 1.3, c, {}, 0);
        ROW(F, B, 3, 4.7, 3, 3.2, 0.9, 1.3, c, { shut: TIMBER2 }, 0);
        ROW(F, A, 3, 1.6, 1, 0, 0.9, 1.3, c, {}, 0);
        ROW(F, A, 3, 4.7, 1, 0, 0.9, 1.3, c, { shut: TIMBER2 }, 0);
        ROW(F, A, 1, 1.6, 4, 5.8, 0.9, 1.3, c, {}, 0);
        ROW(F, A, 1, 4.7, 5, 6.2, 0.9, 1.3, c, { shut: TIMBER2 }, 0);
        DOOR(F, A, 1, 0, p, 1.1, 2.3, c);
        ROW(F, A, 0, 5.6, 2, 1.0, 0.8, 1.1, c, { shut: TIMBER2 }, 5.6);
        ROW(F, B, 2, 4.7, 2, 1.25, 0.8, 1.2, c, { shut: TIMBER2 }, 2.0);
        /* right flank of back range: second street counter (corner shop) */
        const sf2 = SHOP(F, A, 2, 0, p, 2.6, 2.4, c, { aw: 1.1 });
        for (let i = 0; i < 3; i++) F.box(8 + 0.5, sf2.ct, A.z - 0.8 + i * 0.8, 0.7, 0.05, 0.12, 0, metalC, 'metal');
        WIN(F, A, 2, 0, 4.7, 0.9, 1.3, c, { shut: TIMBER2 });
        /* yard wall, front and right, with a gateway */
        const wc = shade(c, 0.03), yw = 2.6;
        F.box(-0.3, 0, 6.8, 3.4, yw, 0.4, 0, wc, 'stone');
        F.box(6.1, 0, 6.8, 3.8, yw, 0.4, 0, wc, 'stone');
        F.box(7.8, 0, 2.25, 0.4, yw, 9.5, 0, wc, 'stone');
        F.box(-0.3, yw, 6.8, 3.5, 0.16, 0.6, 0, dk, 'stone');
        F.box(6.1, yw, 6.8, 3.9, 0.16, 0.6, 0, dk, 'stone');
        F.box(7.8, yw, 2.25, 0.6, 0.16, 9.5, 0, dk, 'stone');
        [1.4, 4.2].forEach(function (gx) {
          F.box(gx, 0, 6.8, 0.6, 3.4, 0.6, 0, shade(c, -0.1), 'stone');
          F.box(gx, 3.4, 6.8, 0.8, 0.2, 0.8, 0, dk, 'stone');
        });
        F.box(2.8, 3.1, 6.8, 3.4, 0.3, 0.3, 0, TIMBER, 'wood');
        [-1, 1].forEach(function (k) { F.box(2.8 + k * 0.65, 0.05, 7.05, 1.2, 2.5, 0.08, k * 0.9, TIMBER2, 'wood'); });
        /* work shed against the back range: lean-to terracotta roof on posts */
        const sz0 = A.z + A.d / 2, sdp = 4.0;
        F.pyrRoof(3.6, 3.6, sz0, 8.2, 1.6, 2 * sdp + 0.4, 0, F.pick(TERRA), 'roof');
        [0.2, 3.6, 7.0].forEach(function (px) {
          F.box(px, 0, sz0 + sdp - 0.2, 0.26, 3.6, 0.26, 0, TIMBER, 'wood');
          F.beam(px, 2.8, sz0 + sdp - 0.2, px, 3.5, sz0 + sdp - 1.1, 0.12, 0.12, TIMBER, 'wood');
        });
        F.box(3.6, 3.4, sz0 + sdp - 0.2, 7.2, 0.22, 0.22, 0, TIMBER, 'wood');
        /* forge hearth with its stack up the back range's face */
        F.box(1.4, 0, sz0 + 0.8, 2.2, 0.95, 1.6, 0, dk, 'stone');
        F.blob(1.4, 1.0, sz0 + 0.9, 0.6, 0.3, 0, 0xff8a3a, 'glow');
        F.box(1.4, 0, sz0 + 0.3, 1.6, top + 2.2, 0.6, 0, shade(c, -0.14), 'stone');
        F.box(1.4, top + 2.2, sz0 + 0.3, 1.9, 0.3, 0.9, 0, dk, 'stone');
        F.frustum(1.4, 1.9, sz0 + 1.0, 0.9, 0.5, 1.2, 0, shade(c, -0.25), 'stone', 4);
        F.box(2.9, 0, sz0 + 0.8, 0.5, 0.5, 0.8, 0, TIMBER, 'wood');
        F.box(2.9, 0.5, sz0 + 0.8, 0.7, 0.35, 1.0, 0, 0x5a4028, 'wood');
        anvil(3.4, sz0 + 2.8, 0);
        trough(5.4, sz0 + 1.2, 1.6, 0.8);
        bladeRack(7.25, 3.4, 3.0, false);
        grindstone(5.8, 4.8);
        F.blob(6.6, 0, sz0 + 0.8, 0.8, 0.8, 0, 0x2a2826, 'stone');
        for (let i = 0; i < 3; i++) BARREL(F, 0.1, 0, 2.4 + i * 0.9, 0.38, 0.9);
        CRATE(F, 1.2, 0, 4.8, 0.7, 0.3);
        /* roof: timber stair from yard up to street-wing roof, parapets, loft, canopy */
        TSTAIR(F, -1.35, 6.0, 'z', -1, 0, top, 1.1);
        PARA(F, { x: 0, z: -5, w: 16.34, d: 5.34 }, top, c, 0.85, { s: 0, u: -4.1, w: 8.2 });
        PARA(F, { x: -5, z: 2.4, w: 6.34, d: 9.2 }, top, c, 0.85, { s: 1, u: 0, w: 6.4 });
        const Lo = LOFT(F, 4.6, top, -5.1, 5.0, 3.6, 2.8, shade(c, 0.05), 3, { shut: TIMBER2 });
        F.pyrRoof(4.6, top + 2.8, -5.1, 5.8, 1.5, 4.4, 0, GREEN, 'roof');
        CANOPY(F, -7.2, -0.5, -2.8, 5.6, top, top + 2.3, F.pick(BAN), null, ['x0', 'z1']);
        TABLE(F, -5.0, top, 2.4, 1.4, 0.9);
        BENCH(F, -5.0, top, 1.5, 1.4, true); BENCH(F, -5.0, top, 3.3, 1.4, true);
        POT(F, -6.8, 5.8, top, 0.3); POT(F, -3.2, 5.8, top, 0.3, CLAY[1]);
        for (let i = 0; i < 3; i++) CRATE(F, -4.5 + i * 0.9, top, -5.4, 0.8, 0.1 * i);
        F.cyl(0.8, top, -5.6, 0.7, 1.3, 0, dk, 'stone');
        CHIMNEY(F, -6.6, -6.4, top, 1.5, c);
        LINE(F, -7.4, -3.2, -2.9, -3.2, top + 1.9, [F.pick(BAN), F.pick(SAIL), F.pick(BAN), F.pick(SAIL)], 0.7);
        F.rod(-7.4, top, -3.2, -7.4, top + 1.95, -3.2, 0.05, TIMBER, 'wood');
        F.rod(-2.9, top, -3.2, -2.9, top + 1.85, -3.2, 0.05, TIMBER, 'wood');
      }
    }
  });

  /* =================================================================== */
  ASSET({
    key: 'voth_shop_alchemist', name: 'Alchemist', culture: 'voth', family: 'shop', source: 'voth-shops',
    districts: ['common', 'wealthy'], wealth: [0.35, 0.85],
    blurb: 'An apothecary: glazed bay of jars, herbs drying under the eaves and on the roof, a copper still in the herb yard.',
    w: 12, d: 15, h: 13, variants: 2,
    variantDims: [{ w: 12, d: 12, h: 13 }, { w: 11, d: 15, h: 11 }],
    build: function (F) {
      const c = F.pick(STONE), dk = shade(c, -0.2), copper = 0xa8683a;
      const board = F.pick([TIMBER2, 0x46603f]), ink = 0xd8d0b8;
      function still(x, z, ry) {
        F.box(x, 0, z, 1.1, 0.8, 1.0, 0, dk, 'stone');
        FB(F, { x: x, z: z, w: 1.1, d: 1.0 }, 0, 0, 0.12, 0.45, 0.35, 0.1, 0.02, 0xff8a3a, 'glow');
        F.cyl(x, 0.8, z, 0.45, 0.65, 0, copper, 'metal');
        F.dome(x, 1.45, z, 0.45, 0.4, 0, copper, 'metal');
        F.cyl(x, 1.85, z, 0.1, 0.25, 0, copper, 'metal');
        const cx = x + Math.cos(ry) * 1.3, cz = z - Math.sin(ry) * 1.3;
        F.rod(x, 2.05, z, cx, 1.55, cz, 0.05, copper, 'metal');
        F.box(cx, 0, cz, 0.5, 0.35, 0.5, 0, TIMBER, 'wood');
        F.cyl(cx, 0.35, cz, 0.32, 1.1, 0, copper, 'metal');
        F.cyl(cx, 0.55, cz, 0.34, 0.06, 0, IRON, 'metal');
        F.cyl(cx, 1.15, cz, 0.34, 0.06, 0, IRON, 'metal');
        JAR(F, cx + 0.45, 0, cz + 0.2, 0.16, 0x6f8f6a);
      }
      function bayWindow(L, s, u, y0, bw, bh, bd, roofC) {
        /* stone base, timber posts, glass on three sides, shelves of jars inside, lean-to roof */
        FB(F, L, s, u, 0, bw + 0.2, y0, bd + 0.1, (bd + 0.1) / 2, dk, 'stone');
        FB(F, L, s, u, y0, bw, 0.08, bd, bd / 2, PLANK, 'wood');
        [-1, 1].forEach(function (k) {
          FB(F, L, s, u + k * (bw / 2 - 0.06), y0, 0.12, bh, 0.12, bd - 0.06, TIMBER, 'wood');
        });
        FB(F, L, s, u, y0 + bh, bw + 0.1, 0.14, bd + 0.1, (bd + 0.1) / 2, TIMBER, 'wood');
        FB(F, L, s, u, y0 + 0.08, bw - 0.1, bh - 0.08, 0.04, bd - 0.05, 0x9fb4b0, 'glass');
        FB(F, L, s, u, y0 + bh * 0.55, bw - 0.1, 0.05, 0.08, bd - 0.05, TIMBER, 'wood');
        [-1, 1].forEach(function (k) {
          const pp = P(L, s, u + k * (bw / 2 - 0.02), bd / 2);
          if (s < 2) F.box(pp[0], y0 + 0.08, pp[1], 0.04, bh - 0.08, bd - 0.1, 0, 0x9fb4b0, 'glass');
          else F.box(pp[0], y0 + 0.08, pp[1], bd - 0.1, bh - 0.08, 0.04, 0, 0x9fb4b0, 'glass');
        });
        const a = P(L, s, u - bw / 2 + 0.25, bd * 0.45), b = P(L, s, u + bw / 2 - 0.25, bd * 0.45);
        if (s < 2) JARSHELF(F, a[0], b[0], a[1], y0 + 0.1, 3, true);
        else JARSHELF(F, a[1], b[1], a[0], y0 + 0.1, 3, false);
        const pr = P(L, s, u, 0);
        if (s < 2) F.pyrRoof(pr[0], y0 + bh + 0.14, pr[1], bw + 0.5, 0.55, 2 * (bd + 0.3), 0, roofC, 'roof');
        else F.pyrRoof(pr[0], y0 + bh + 0.14, pr[1], 2 * (bd + 0.3), 0.55, bw + 0.5, 0, roofC, 'roof');
      }
      function dryRack(x0, x1, z, y) {
        F.box(x0, y, z, 0.12, 1.9, 0.12, 0, TIMBER, 'wood');
        F.box(x1, y, z, 0.12, 1.9, 0.12, 0, TIMBER, 'wood');
        F.box((x0 + x1) / 2, y + 1.8, z, x1 - x0, 0.1, 0.1, 0, TIMBER, 'wood');
        F.box((x0 + x1) / 2, y + 1.2, z, x1 - x0, 0.08, 0.08, 0, TIMBER, 'wood');
        HERBS(F, x0 + 0.15, z, x1 - 0.15, z, y + 1.8, Math.round((x1 - x0) / 0.3));
        HERBS(F, x0 + 0.3, z, x1 - 0.3, z, y + 1.2, Math.round((x1 - x0) / 0.35));
      }

      if (F.variant === 0) {
        /* ---- hlaalu narrow street-front: glazed bay, balcony, terrace, roof racks ---- */
        const p = 0.3;
        const G = { x: 0, z: 0, w: 7, d: 10, y: p, h: 7.0 }, t1 = p + 7.0;
        const U = { x: 0, z: -1.6, w: 6.2, d: 6.5, y: t1, h: 3.0 }, t2 = t1 + 3.0;
        F.box(0, 0, 0, 7.3, p, 10.3, 0, dk, 'stone');
        BLOCK(F, G, c, { band: 3.75, quoin: true });
        BLOCK(F, U, shade(c, 0.04), {});
        /* street front: bay of jars, door, balcony with herbs drying under it */
        bayWindow(G, 0, -1.4, 0.8, 2.9, 2.0, 1.05, GREEN);
        DOOR(F, G, 0, 2.3, p, 1.1, 2.4, c, { lamp: false });
        FN(F, G, 0, 1.2, 2.9, 0.02, 2.9, 0.5, 0.04, IRON, 'metal');
        const gl = P(G, 0, 1.2, 0.5); F.ball(gl[0], 2.65, gl[1], 0.18, GLOW, 'glow');
        const fz = G.d / 2;
        F.box(0, 3.9, fz + 0.6, 6.4, 0.25, 1.2, 0, TIMBER2, 'wood');
        [-3.05, 0.9, 3.05].forEach(function (bx) { F.beam(bx, 3.9, fz + 0.06, bx, 3.2, fz + 0.06 + 0.7, 0.16, 0.16, TIMBER, 'wood'); });
        F.box(0, 4.15, fz + 1.15, 6.4, 0.95, 0.1, 0, TIMBER, 'wood');
        [-3.15, 3.15].forEach(function (bx) { F.box(bx, 4.15, fz + 0.6, 0.1, 0.95, 1.2, 0, TIMBER, 'wood'); });
        HERBS(F, -2.9, fz + 0.95, 2.9, fz + 0.95, 3.9, 14);
        DOOR(F, G, 0, 0, 4.15, 1.0, 2.2, c);
        WIN(F, G, 0, -2.2, 4.8, 0.8, 1.2, c, { shut: 0x46603f });
        WIN(F, G, 0, 2.2, 4.8, 0.8, 1.2, c, { shut: 0x46603f });
        POT(F, -2.6, fz + 0.85, 4.15, 0.22); POT(F, 2.6, fz + 0.85, 4.15, 0.22, CLAY[2]);
        SIGN(F, G, 2, 4.3, 3.6, 'flask', board, ink);
        /* flanks and back */
        ROW(F, G, 3, 1.5, 3, 3.2, 0.9, 1.3, c, {}, 0);
        ROW(F, G, 3, 4.8, 3, 3.2, 0.9, 1.3, c, { shut: 0x46603f }, 0);
        ROW(F, G, 2, 1.5, 2, 2.4, 0.9, 1.3, c, {}, -0.8);
        ROW(F, G, 2, 4.8, 3, 3.2, 0.9, 1.3, c, { shut: 0x46603f }, 0);
        ROW(F, G, 1, 1.5, 2, 2.0, 0.9, 1.3, c, {}, 0);
        ROW(F, G, 1, 4.8, 2, 2.0, 0.9, 1.3, c, { shut: 0x46603f }, 0);
        F.rod(-3.62, 0.3, -4.7, -3.62, 7.1, -4.7, 0.1, dk, 'metal');
        DOOR(F, G, 3, -3.9, p, 1.0, 2.3, c);
        /* upper storey */
        DOOR(F, U, 0, 0.3, t1, 1.0, 2.1, c);
        WIN(F, U, 0, 2.2, t1 + 1.0, 0.8, 1.1, c, {});
        ROW(F, U, 2, t1 + 1.0, 2, 1.6, 0.8, 1.1, c, { shut: 0x46603f }, 0);
        ROW(F, U, 3, t1 + 1.0, 2, 1.6, 0.8, 1.1, c, { shut: 0x46603f }, 0);
        ROW(F, U, 1, t1 + 1.0, 2, 1.6, 0.8, 1.1, c, {}, 0);
        /* front roof terrace under an awning, pots of herbs */
        PARA(F, { x: 0, z: 0, w: 7.34, d: 10.34 }, t1, c, 0.9);
        CANOPY(F, -3.0, 2.1, 3.0, 4.75, t1, t1 + 2.4, F.pick([0xb8d0b0, 0xcbb08e, 0xc0b190]), null, ['z1']);
        HERBS(F, -2.8, 4.75, 2.8, 4.75, t1 + 2.26, 12);
        for (let i = 0; i < 5; i++) POT(F, -2.8 + i * 1.4, 4.55, t1, 0.24, CLAY[i % 4]);
        TABLE(F, 1.2, t1, 3.2, 1.3, 0.8);
        F.cyl(1.0, t1 + 0.79, 3.2, 0.15, 0.18, 0, 0x8a857a, 'stone');
        BENCH(F, 1.2, t1, 2.5, 1.3, true);
        /* ladder up the upper storey to the drying roof */
        LADDER(F, -2.55, 2.15, t1, -2.55, 1.72, t2 + 1.2, 0.5, true);
        PARA(F, { x: 0, z: -1.6, w: 6.54, d: 6.84 }, t2, c, 0.8, { s: 0, u: -2.55, w: 0.8 });
        CANOPY(F, -2.6, -4.3, 2.6, 0.9, t2, t2 + 2.4, F.pick(SAIL), null, []);
        dryRack(-2.2, 2.2, -3.4, t2);
        dryRack(-2.2, 2.2, -1.9, t2);
        dryRack(-2.2, 2.2, -0.4, t2);
        CHIMNEY(F, 2.6, -4.4, t2, 1.3, c);
        /* herb yard on the right with the copper still */
        const yc = shade(c, 0.03);
        F.box(6.2, 0, -0.55, 0.35, 1.5, 8.0, 0, yc, 'stone');
        F.box(4.85, 0, -4.4, 2.6, 1.5, 0.35, 0, yc, 'stone');
        F.box(4.2, 0, 3.3, 1.4, 1.5, 0.35, 0, yc, 'stone');
        F.box(6.2, 1.5, -0.55, 0.5, 0.12, 8.1, 0, dk, 'stone');
        F.box(4.85, 1.5, -4.4, 2.7, 0.12, 0.5, 0, dk, 'stone');
        F.box(4.2, 1.5, 3.3, 1.5, 0.12, 0.5, 0, dk, 'stone');
        F.box(5.55, 0, 3.3, 0.35, 1.9, 0.35, 0, dk, 'stone');
        F.box(5.55, 1.9, 3.3, 0.5, 0.15, 0.5, 0, dk, 'stone');
        F.box(5.85, 0.05, 3.3, 0.55, 1.4, 0.06, 0, TIMBER2, 'wood');
        CANOPY(F, 3.7, -4.1, 5.9, -1.0, 0, 2.6, F.pick(SAIL), [[5.9, -4.1], [5.9, -1.0], [3.7, -1.0], [3.7, -4.1]], ['x1']);
        still(4.6, -2.8, 0.4);
        [0.2, 1.8].forEach(function (bz) {
          F.box(5.2, 0, bz, 1.4, 0.5, 1.2, 0, dk, 'stone');
          F.box(5.2, 0.5, bz, 1.25, 0.06, 1.05, 0, 0x4a3e30, 'stone');
          for (let i = 0; i < 4; i++) F.blob(4.8 + (i % 2) * 0.8, 0.7, bz - 0.3 + (i >> 1) * 0.6, 0.28, 0.4, 0, LEAF[i % 3], 'leafy');
        });
      } else {
        /* ---- velothi domed apothecary: corner shop, glazed side bay, walled still-yard ---- */
        const V = VEL(F, 0, 0, 4.6, 4.3, 6.6, c, { band: 3.6 }), top = V.top;
        const L1 = V.L(1.6), L4 = V.L(4.6);
        const sf = SHOP(F, L1, 0, 0.9, 0.4, 3.4, 2.6, c, { aw: 1.2, shutC: 0x46603f });
        for (let i = 0; i < 7; i++) JAR(F, -0.5 + i * 0.47, sf.ct, L1.d / 2 + 0.45, 0.13, [0x6f8f6a, 0x9a6a4a, 0xb8a060, 0x5a6f8a][i % 4]);
        DOOR(F, L1, 0, -2.7, 0.4, 1.1, 2.4, c);
        [-3.75, -1.65].forEach(function (px) {
          F.frustum(px, 0, L1.d / 2 + 0.35, 0.28, 0.2, 2.9, 0, shade(c, -0.1), 'stone', 4);
          F.cone(px, 2.9, L1.d / 2 + 0.35, 0.3, 0.5, 0, JADE[0], 'stone');
        });
        ROW(F, L4, 0, 4.3, 2, 2.0, 0.9, 1.3, c, { shut: 0x46603f }, 0);
        SIGN(F, V.L(5.8), 0, -3.6, 6.1, 'flask', board, ink);
        HERBS(F, -1.2, L1.d / 2 + 0.9, 2.8, L1.d / 2 + 0.9, 3.4, 10);
        /* left: glazed bay of jars and upper windows */
        bayWindow(V.L(1.8), 3, 0.8, 0.9, 2.6, 2.0, 0.95, F.pick(LAPIS));
        WIN(F, V.L(1.8), 3, -2.6, 1.6, 0.8, 1.2, c, {});
        ROW(F, L4, 3, 4.3, 2, 2.0, 0.9, 1.3, c, { shut: 0x46603f }, 0);
        /* right: stair up the flank */
        const sx = 4.6 + 0.35;
        const sl = STAIR(F, sx, 4.4, 'z', -1, 0, top, 1.3, shade(c, -0.1));
        F.rod(sx + 0.62, 1.0, 4.4, sx + 0.62, top + 1.0, 4.4 - sl, 0.04, IRON, 'metal');
        F.rod(sx + 0.62, 0, 4.25, sx + 0.62, 1.0, 4.25, 0.05, IRON, 'metal');
        WIN(F, L4, 2, 2.4, 4.6, 0.8, 1.1, c, {});
        /* back: windows, door onto the still-yard */
        ROW(F, V.L(2), 1, 1.6, 2, 2.4, 0.9, 1.2, c, {}, 0);
        ROW(F, L4, 1, 4.3, 3, 2.6, 0.8, 1.2, c, { shut: 0x46603f }, 0);
        DOOR(F, V.L(1.5), 1, 0, 0.4, 1.0, 2.3, c);
        const wz0 = -4.9, wz1 = -8.6, yc = shade(c, 0.02);
        F.box(-4.45, 0, (wz0 + wz1) / 2, 0.4, 1.7, wz0 - wz1, 0, yc, 'stone');
        F.box(4.45, 0, (wz0 + wz1) / 2, 0.4, 1.7, wz0 - wz1, 0, yc, 'stone');
        F.box(-2.6, 0, wz1, 4.1, 1.7, 0.4, 0, yc, 'stone');
        F.box(2.9, 0, wz1, 3.5, 1.7, 0.4, 0, yc, 'stone');
        F.box(-4.45, 1.7, (wz0 + wz1) / 2, 0.55, 0.12, wz0 - wz1, 0, dk, 'stone');
        F.box(4.45, 1.7, (wz0 + wz1) / 2, 0.55, 0.12, wz0 - wz1, 0, dk, 'stone');
        F.box(-2.6, 1.7, wz1, 4.2, 0.12, 0.55, 0, dk, 'stone');
        F.box(2.9, 1.7, wz1, 3.6, 0.12, 0.55, 0, dk, 'stone');
        [-0.35, 1.15].forEach(function (gx) {
          F.box(gx, 0, wz1, 0.45, 2.2, 0.45, 0, dk, 'stone');
          F.cone(gx, 2.2, wz1, 0.3, 0.45, 0, dk, 'stone');
        });
        F.box(0.4, 0.05, wz1 - 0.05, 1.0, 1.5, 0.06, 0, TIMBER2, 'wood');
        still(2.6, -6.6, 2.4);
        [-3.2, -1.6].forEach(function (bx) {
          F.box(bx, 0, -6.8, 1.2, 0.5, 2.8, 0, dk, 'stone');
          F.box(bx, 0.5, -6.8, 1.05, 0.06, 2.65, 0, 0x4a3e30, 'stone');
          for (let i = 0; i < 4; i++) F.blob(bx, 0.72, -7.8 + i * 0.66, 0.34, 0.45, 0, LEAF[i % 3], 'leafy');
        });
        /* roof: drum and dome over the shop, loft behind, herb canopy */
        const Rr = V.R;
        PARA(F, Rr, top, c, 0.85, { s: 2, u: -3.2, w: 1.4 });
        const dx = -1.3, dz = 1.2, dc = F.pick(DOME);
        F.cyl(dx, top, dz, 2.2, 1.3, 0, shade(c, 0.05), 'stone');
        F.cyl(dx, top + 1.2, dz, 2.3, 0.18, 0, dk, 'stone');
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * TAU;
          F.box(dx + Math.sin(a) * 2.18, top + 0.35, dz + Math.cos(a) * 2.18, 0.5, 0.7, 0.12, a, DARK, 'wood');
        }
        F.dome(dx, top + 1.38, dz, 2.25, 1.9, 0, dc, 'dome');
        F.cyl(dx, top + 3.2, dz, 0.3, 0.3, 0, shade(dc, -0.15), 'stone');
        F.cone(dx, top + 3.5, dz, 0.3, 0.6, 0, GILT, 'metal');
        LOFT(F, 1.6, top, -2.2, 2.8, 2.8, 2.5, shade(c, 0.05), 3, { shut: 0x46603f });
        CANOPY(F, 1.3, 0.8, 3.8, 3.8, top, top + 2.3, F.pick([0xb8d0b0, 0xcbb08e]), null, ['z1', 'x1']);
        [1.6, 2.4, 3.2].forEach(function (hx) { HERBS(F, hx, 1.0, hx, 3.6, top + 2.16, 7); });
        for (let i = 0; i < 4; i++) JAR(F, -3.4 + (i % 2) * 0.7, top, -3.0 - (i >> 1) * 0.7, 0.28, CLAY[i]);
        CHIMNEY(F, -3.3, -1.3, top, 1.4, c);
        F.cyl(3.3, top, -3.6, 0.4, 0.9, 0, dk, 'stone');
      }
    }
  });

  /* =================================================================== */
  ASSET({
    key: 'voth_shop_clothier', name: 'Clothier', culture: 'voth', family: 'shop', source: 'voth-shops',
    districts: ['common', 'wealthy', 'poor'], wealth: [0.25, 0.8],
    blurb: 'A weaver-clothier: bolts of cloth on the counter, a loom under a roof awning, dyed lengths drying on frames.',
    w: 17, d: 13, h: 11.5, variants: 2,
    variantDims: [{ w: 17, d: 11, h: 11 }, { w: 17, d: 13, h: 11.5 }],
    build: function (F) {
      const c = F.pick(STONE), dk = shade(c, -0.2);
      const DYE = [0x7a2028, 0x8a2f2a, 0x2a4d80, 0x3f6b56, 0xc4813f, 0x6a2434, 0xe8d9a0, 0xc9b8d6, 0xb0c8d8];
      const dye = function (i) { return DYE[(i + F.variant * 2) % DYE.length]; };
      const board = F.pick([TIMBER2, 0x5c4028]), ink = F.pick([0x8a2f2a, 0x2a4d80, 0xe8c090]);
      function loom(x, y, z) {
        [[-0.8, -0.6], [0.8, -0.6], [-0.8, 0.6], [0.8, 0.6]].forEach(function (q) {
          F.box(x + q[0], y, z + q[1], 0.1, q[1] < 0 ? 1.9 : 1.0, 0.1, 0, TIMBER, 'wood');
        });
        F.box(x, y + 1.8, z - 0.6, 1.7, 0.1, 0.12, 0, TIMBER, 'wood');
        F.box(x, y + 0.92, z + 0.6, 1.7, 0.1, 0.12, 0, TIMBER, 'wood');
        [-0.8, 0.8].forEach(function (k) { F.box(x + k, y + 1.8, z, 0.08, 0.08, 1.2, 0, TIMBER, 'wood'); });
        F.beam(x, y + 1.8, z - 0.55, x, y + 0.98, z + 0.55, 0.03, 0.03, 0xe0d6bc, 'cloth');
        for (let i = 0; i < 9; i++) F.rod(x - 0.64 + i * 0.16, y + 1.8, z - 0.55, x - 0.64 + i * 0.16, y + 0.98, z + 0.55, 0.012, 0xe0d6bc, 'cloth');
        F.box(x, y + 0.98, z + 0.4, 1.4, 0.03, 0.35, 0, dye(2), 'cloth');
        F.box(x, y + 1.3, z - 0.05, 1.6, 0.14, 0.1, 0, TIMBER2, 'wood');
        BENCH(F, x, y, z + 1.05, 1.2, true);
      }
      function frame(x0, z0, x1, z1, y, hgt, n, k) {
        F.rod(x0, y, z0, x0, y + hgt, z0, 0.06, TIMBER, 'wood');
        F.rod(x1, y, z1, x1, y + hgt, z1, 0.06, TIMBER, 'wood');
        const cols = []; for (let i = 0; i < n; i++) cols.push(dye(i + k));
        LINE(F, x0, z0, x1, z1, y + hgt - 0.05, cols, Math.min(1.9, hgt - 0.5));
      }
      function bolts(x0, x1, z, y, alongX) {
        const n = Math.floor(Math.abs(x1 - x0) / 0.28);
        for (let i = 0; i < n; i++) {
          const t = x0 + (x1 - x0) * (i + 0.5) / n;
          if (alongX) F.rod(t, y + 0.12, z - 0.34, t, y + 0.12, z + 0.34, 0.12, dye(i), 'cloth');
          else F.rod(z - 0.34, y + 0.12, t, z + 0.34, y + 0.12, t, 0.12, dye(i), 'cloth');
        }
        for (let i = 0; i < Math.floor(n / 2); i++) {
          const t = x0 + (x1 - x0) * (i * 2 + 1) / n;
          if (alongX) F.rod(t, y + 0.34, z - 0.3, t, y + 0.34, z + 0.3, 0.1, dye(i + 4), 'cloth');
          else F.rod(z - 0.3, y + 0.34, t, z + 0.3, y + 0.34, t, 0.1, dye(i + 4), 'cloth');
        }
      }

      if (F.variant === 0) {
        /* ---- hlaalu weaver's house: wide counter, loom and drying frames on the roof ---- */
        const p = 0.35, G = { x: 0, z: 0, w: 11, d: 8, y: p, h: 7.0 }, top = p + 7.0;
        F.box(0, 0, 0, 11.3, p, 8.3, 0, dk, 'stone');
        BLOCK(F, G, c, { band: 3.8, quoin: true });
        const sf = SHOP(F, G, 0, -1.8, p, 5.0, 2.6, c, { aw: 1.4 });
        bolts(-4.0, 0.4, 4 + sf.off, sf.ct, true);
        DOOR(F, G, 0, 3.3, p, 1.2, 2.5, c, { lamp: true });
        /* a clothes rail out in the street */
        [-4.2, -0.8].forEach(function (rx) { F.box(rx, 0, 6.2, 0.12, 2.3, 0.12, 0, TIMBER, 'wood'); F.box(rx, 0, 6.2, 0.5, 0.08, 0.5, 0, TIMBER, 'wood'); });
        F.box(-2.5, 2.2, 6.2, 3.5, 0.08, 0.08, 0, TIMBER, 'wood');
        for (let i = 0; i < 5; i++) F.box(-3.8 + i * 0.66, 0.75, 6.2, 0.5, 1.45, 0.04, 0, dye(i + 3), 'cloth');
        SIGN(F, G, 0, -5.1, 4.2, 'tunic', board, ink);
        ROW(F, G, 0, 4.9, 4, 4.2, 0.9, 1.3, c, { shut: TIMBER2 }, 0);
        ROW(F, G, 3, 1.6, 2, 2.0, 0.9, 1.3, c, {}, 0);
        ROW(F, G, 3, 4.9, 2, 2.0, 0.9, 1.3, c, { shut: TIMBER2 }, 0);
        ROW(F, G, 1, 1.6, 3, 3.6, 0.9, 1.3, c, {}, 0);
        ROW(F, G, 1, 4.9, 4, 4.2, 0.9, 1.3, c, { shut: TIMBER2 }, 0);
        DOOR(F, G, 1, 1.8, p, 1.0, 2.3, c);
        LINE(F, -4.5, -4.9, 0.2, -4.9, 3.4, [F.pick(SAIL), dye(1), F.pick(SAIL), dye(5)], 0.8);
        [-4.5, 0.2].forEach(function (lx) { FN(F, G, 1, lx, 3.45, 0.02, 3.45, 0.9, 0.04, IRON, 'metal'); });
        /* right: a stone store for bolts with its own door */
        const S = { x: 7.2, z: -1.2, w: 3.1, d: 5.0, y: 0, h: 3.2 };
        BLOCK(F, S, shade(c, -0.04), {});
        DOOR(F, S, 0, 0, 0, 1.3, 2.3, c, { leaf: TIMBER2 });
        WIN(F, S, 2, -1.0, 1.4, 0.7, 0.8, c, { bars: true });
        WIN(F, S, 1, 0, 1.4, 0.7, 0.8, c, { bars: true });
        ROW(F, G, 2, 4.9, 2, 2.2, 0.9, 1.3, c, { shut: TIMBER2 }, 0);
        WIN(F, G, 2, 3.0, 1.6, 0.8, 1.2, c, {});
        for (let i = 0; i < 3; i++) F.rod(S.x - 1.2 + i * 1.2, 3.35, -2.8, S.x - 1.2 + i * 1.2, 3.35, 0.4, 0.2, dye(i + 6), 'cloth');
        /* left: timber stair to the roof */
        TSTAIR(F, -6.15, 4.0, 'z', -1, 0, top, 1.1);
        /* roof: loom under an awning, dyed lengths drying on frames, loft behind */
        PARA(F, { x: 0, z: 0, w: 11.34, d: 8.34 }, top, c, 0.85, { s: 3, u: -3.4, w: 1.3 });
        CANOPY(F, -5.0, 0.3, -1.2, 3.6, top, top + 2.6, dye(0), null, ['z1', 'x0']);
        loom(-3.1, top, 1.6);
        CRATE(F, -4.5, top, 0.7, 0.6, 0.2);
        frame(0.2, 3.5, 5.1, 3.5, top, 3.0, 5, 0);
        frame(0.2, 2.0, 5.1, 2.0, top, 3.0, 5, 3);
        frame(0.2, 0.5, 5.1, 0.5, top, 3.0, 5, 6);
        LOFT(F, -0.8, top, -2.35, 5.2, 2.8, 2.7, shade(c, 0.05), 0, { du: -1.2, shut: TIMBER2 });
        F.pyrRoof(-0.8, top + 2.7, -2.35, 6.0, 1.2, 3.6, 0, F.pick(TERRA), 'roof');
        CHIMNEY(F, 4.4, -3.2, top, 1.5, c);
        F.cyl(3.2, top, -2.9, 0.6, 1.2, 0, dk, 'stone');
      } else {
        /* ---- velothi dye-works: battered house, walled dye yard, weaving loggia on the street ---- */
        const hx = -3.8, hz = -2, V = VEL(F, hx, hz, 4.2, 3.95, 6.6, c, { band: 3.6 }), top = V.top;
        const L1 = V.L(1.6), L4 = V.L(4.6);
        const sf = SHOP(F, L1, 0, 0.9, 0.4, 3.0, 2.6, c, { aw: 1.2 });
        bolts(hx - 0.4, hx + 2.2, hz + L1.d / 2 + sf.off, sf.ct, true);
        DOOR(F, L1, 0, -2.4, 0.4, 1.1, 2.4, c, { lamp: true });
        ROW(F, L4, 0, 4.4, 2, 1.8, 0.9, 1.3, c, { shut: TIMBER2 }, 0);
        ROW(F, L4, 3, 4.4, 2, 1.8, 0.9, 1.3, c, { shut: TIMBER2 }, 0);
        ROW(F, V.L(2), 3, 1.6, 2, 1.8, 0.9, 1.2, c, {}, 0);
        ROW(F, L4, 1, 4.4, 2, 1.8, 0.9, 1.3, c, {}, 0);
        ROW(F, V.L(2), 1, 1.6, 1, 0, 0.9, 1.2, c, {}, 0);
        DOOR(F, V.L(1.5), 2, -1.8, 0.4, 1.0, 2.3, c);
        WIN(F, L4, 2, 0, 4.4, 0.9, 1.3, c, { shut: TIMBER2 });
        WIN(F, L4, 2, 2.2, 1.6, 0.8, 1.1, c, {});
        /* stair on the back of the house */
        const bzs = hz - 4.2 - 0.35;
        const sl = STAIR(F, hx - 4.4, bzs, 'x', 1, 0, top, 1.3, shade(c, -0.1));
        F.rod(hx - 4.4, 1.0, bzs - 0.62, hx - 4.4 + sl, top + 1.0, bzs - 0.62, 0.04, IRON, 'metal');
        /* the yard: walls, gate, dye vats, drying frames */
        const x0 = hx + 4.2, x1 = 8.6, z0 = hz - 4.2, z1 = hz + 4.2, yc = shade(c, 0.03), wh = 1.9;
        F.box(x1, 0, (z0 + z1) / 2, 0.4, wh, z1 - z0, 0, yc, 'stone');
        F.box((x0 + x1) / 2, 0, z0 + 0.2, x1 - x0, wh, 0.4, 0, yc, 'stone');
        F.box(x1, wh, (z0 + z1) / 2, 0.55, 0.12, z1 - z0 + 0.1, 0, dk, 'stone');
        F.box((x0 + x1) / 2, wh, z0 + 0.2, x1 - x0, 0.12, 0.55, 0, dk, 'stone');
        const gA = x0 + 1.4, gB = x0 + 2.9;
        F.box((x0 + gA) / 2, 0, z1 - 0.2, gA - x0, wh, 0.4, 0, yc, 'stone');
        F.box((x0 + gA) / 2, wh, z1 - 0.2, gA - x0, 0.12, 0.55, 0, dk, 'stone');
        [gA, gB].forEach(function (gx) {
          F.box(gx, 0, z1 - 0.2, 0.5, 2.7, 0.5, 0, dk, 'stone');
          F.cone(gx, 2.7, z1 - 0.2, 0.34, 0.5, 0, dk, 'stone');
        });
        F.box((gA + gB) / 2, 2.4, z1 - 0.2, gB - gA, 0.2, 0.2, 0, TIMBER, 'wood');
        SIGN(F, { x: gB, z: z1 - 0.2, w: 0.5, d: 0.5 }, 0, 0, 2.55, 'tunic', board, ink);
        const vats = [[x0 + 1.2, z0 + 1.3], [x0 + 2.6, z0 + 1.3], [x0 + 4.0, z0 + 1.3], [x0 + 1.2, z0 + 2.8], [x0 + 2.6, z0 + 2.8]];
        vats.forEach(function (v, i) {
          F.cyl(v[0], 0, v[1], 0.62, 0.85, 0, dk, 'stone');
          F.cyl(v[0], 0.85, v[1], 0.66, 0.08, 0, shade(c, -0.3), 'stone');
          F.cyl(v[0], 0.72, v[1], 0.52, 0.12, 0, dye(i), 'glass');
        });
        F.rod(x0 + 1.0, 0.95, z0 + 1.3, x0 + 1.7, 1.9, z0 + 1.6, 0.04, TIMBER, 'wood');
        frame(x1 - 1.0, z0 + 0.8, x1 - 1.0, hz + 0.5, 0, 3.0, 4, 1);
        frame(x1 - 2.2, z0 + 0.8, x1 - 2.2, hz + 0.5, 0, 3.0, 4, 5);
        /* weaving loggia at the street corner: counter wall, timber roof, loom */
        const lx0 = gB + 0.4, lz0 = hz + 1.0;
        F.box((lx0 + x1) / 2, 0, z1 - 0.2, x1 - lx0 + 0.2, 1.0, 0.4, 0, yc, 'stone');
        F.box((lx0 + x1) / 2, 1.0, z1 - 0.05, x1 - lx0 + 0.3, 0.1, 0.8, 0, PLANK, 'wood');
        bolts(lx0 + 0.3, x1 - 0.3, z1 + 0.05, 1.1, true);
        [[lx0, lz0], [x1 - 0.1, lz0], [lx0, z1 - 0.1], [x1 - 0.1, z1 - 0.1]].forEach(function (q) {
          F.box(q[0], q[1] > z1 - 1 ? 1.0 : 0, q[1], 0.22, q[1] > z1 - 1 ? 2.2 : 3.2, 0.22, 0, TIMBER, 'wood');
        });
        F.box((lx0 + x1) / 2, 3.2, (lz0 + z1) / 2 + 0.3, x1 - lx0 + 0.6, 0.18, z1 - lz0 + 1.4, 0, TIMBER2, 'wood');
        F.box((lx0 + x1) / 2, 3.38, (lz0 + z1) / 2 + 0.3, x1 - lx0 + 0.4, 0.1, z1 - lz0 + 1.2, 0, F.pick(TERRA), 'roof');
        F.box((lx0 + x1) / 2, 2.85, z1 + 0.95, x1 - lx0 + 0.6, 0.35, 0.04, 0, dye(3), 'cloth');
        loom((lx0 + x1) / 2, 0, lz0 + 1.1);
        /* roof: loft, drying lines and an awning */
        PARA(F, V.R, top, c, 0.85, { s: 1, u: 3.1, w: 1.4 });
        LOFT(F, hx - 1.4, top, hz - 1.9, 3.4, 3.0, 2.6, shade(c, 0.05), 2, { shut: TIMBER2 });
        F.dome(hx - 1.4, top + 2.6, hz - 1.9, 1.2, 0.9, 0, F.pick(DOME), 'dome');
        CANOPY(F, hx - 3.4, hz + 0.6, hx - 0.2, hz + 3.5, top, top + 2.4, dye(2), null, ['z1', 'x0']);
        BENCH(F, hx - 1.8, top, hz + 2.2, 1.8, true);
        frame(hx + 0.5, hz + 3.4, hx + 3.4, hz + 3.4, top, 2.9, 3, 2);
        frame(hx + 0.5, hz + 1.8, hx + 3.4, hz + 1.8, top, 2.9, 3, 6);
        for (let i = 0; i < 3; i++) F.rod(hx + 0.9 + i * 0.9, top + 0.2, hz - 3.2, hx + 0.9 + i * 0.9, top + 0.2, hz - 1.6, 0.2, dye(i + 1), 'cloth');
        CHIMNEY(F, hx + 3.0, hz - 3.2, top, 1.3, c);
      }
    }
  });
})();
