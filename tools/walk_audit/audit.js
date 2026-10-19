/* tools/walk_audit/audit.js: can a walker reach every floor a building's GEOMETRY draws?  Engine-neutral, no THREE, no DOM.
   For kits whose buildings are drawn straight from boxes (Islanders, Lizardmen and the rest of the Scyvoi engine), where nothing
   declares a floor or a stair: the audit takes what was DRAWN (oriented boxes, as captured by run.py from the engine's emit)
   and asks core/walk's question of it: from the open ground, stepping up no more than STEP and dropping no more than DROP, with
   headroom HEAD and a body of radius R (tilted boxes, a roof's panels and rafters, and paper-thin ones, a painted band or a cloth under 5 cm, cover but do not block: core/walk has no roofs), which standable surfaces can be reached, and which cannot.
     const A = WALKAUDIT.audit({ boxes, ladders }, opts) -> { boxes, surfaces, reached, components, ladderOnly }
   boxes:   [{ m: [16 numbers, column-major local->world], lo: [x,y,z], hi: [x,y,z] (the geometry's local bounds), t? }]
            t: 'cover' for a mesh whose bounds are not its shape (a roof, a sphere): it covers what is under it but is never stood on or bumped into
   ladders: [{ foot: [x,z], footY?, top: [x,z,y] }]   a climb the geometry cannot show (poles and rungs): joins the ground to the surface at top
   opts:    { cell .1, step .6, drop 1.2, head 1.7, radius .28, pad .06, minArea 2, maxSlope 40 (deg) }
   components: patches of standable surface no walker can reach, even by ladder; ladderOnly: patches reached only by a ladder
   (core/walk needs a strip for each). `covered` = something sits over most of the patch (a floor under a roof: a defect);
   an uncovered one is a roof, a flat top or an open deck (listed, judged by the kit's author).                              */
(function (root) {
  'use strict';
  function prep(b) {
    const m = b.m, ax = [m[0], m[1], m[2]], ay = [m[4], m[5], m[6]], az = [m[8], m[9], m[10]], c = [m[12], m[13], m[14]];
    const lc = [(b.lo[0] + b.hi[0]) / 2, (b.lo[1] + b.hi[1]) / 2, (b.lo[2] + b.hi[2]) / 2], h = [(b.hi[0] - b.lo[0]) / 2, (b.hi[1] - b.lo[1]) / 2, (b.hi[2] - b.lo[2]) / 2];
    const cen = [c[0] + ax[0] * lc[0] + ay[0] * lc[1] + az[0] * lc[2], c[1] + ax[1] * lc[0] + ay[1] * lc[1] + az[1] * lc[2], c[2] + ax[2] * lc[0] + ay[2] * lc[1] + az[2] * lc[2]];
    /* A: columns are the world axes scaled by the half sizes; I = A^-1 maps a world offset to [-1,1] box coordinates */
    const A = [[ax[0] * h[0], ay[0] * h[1], az[0] * h[2]], [ax[1] * h[0], ay[1] * h[1], az[1] * h[2]], [ax[2] * h[0], ay[2] * h[1], az[2] * h[2]]];
    const d = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    if (Math.abs(d) < 1e-12) return null;
    const I = [[(A[1][1] * A[2][2] - A[1][2] * A[2][1]) / d, (A[0][2] * A[2][1] - A[0][1] * A[2][2]) / d, (A[0][1] * A[1][2] - A[0][2] * A[1][1]) / d],
      [(A[1][2] * A[2][0] - A[1][0] * A[2][2]) / d, (A[0][0] * A[2][2] - A[0][2] * A[2][0]) / d, (A[0][2] * A[1][0] - A[0][0] * A[1][2]) / d],
      [(A[1][0] * A[2][1] - A[1][1] * A[2][0]) / d, (A[0][1] * A[2][0] - A[0][0] * A[2][1]) / d, (A[0][0] * A[1][1] - A[0][1] * A[1][0]) / d]];
    const ex = Math.abs(A[0][0]) + Math.abs(A[0][1]) + Math.abs(A[0][2]), ey = Math.abs(A[1][0]) + Math.abs(A[1][1]) + Math.abs(A[1][2]), ez = Math.abs(A[2][0]) + Math.abs(A[2][1]) + Math.abs(A[2][2]);
    const ln = (v) => Math.hypot(v[0], v[1], v[2]);
    return { cover: b.t === 'cover', I: I, cen: cen, ln: [ln(ax) * h[0] * 2, ln(ay) * h[1] * 2, ln(az) * h[2] * 2], bb: [cen[0] - ex, cen[0] + ex, cen[1] - ey, cen[1] + ey, cen[2] - ez, cen[2] + ez], up: ay[1] / (ln(ay) || 1) };
  }
  /* the y interval of a vertical line at (x,z) through box p, its plan footprint grown by pad (metres), or null */
  function hit(p, x, z, pad) {
    const I = p.I, dx = x - p.cen[0], dz = z - p.cen[2], dy0 = -p.cen[1];
    let t0 = -1e9, t1 = 1e9;
    for (let i = 0; i < 3; i++) {
      const o = I[i][0] * dx + I[i][1] * dy0 + I[i][2] * dz, s = I[i][1];     /* local_i(t) = o + s*t, t the world y */
      const lim = 1 + (i === 1 ? 0 : pad / Math.max(1e-6, p.ln[i] / 2));
      if (Math.abs(s) < 1e-9) { if (Math.abs(o) > lim) return null; continue; }
      const a = (-lim - o) / s, b = (lim - o) / s; t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
      if (t0 > t1) return null;
    }
    return [t0, t1];
  }
  function audit(scene, o) {
    o = o || {};
    const CELL = o.cell || 0.1, STEP = o.step || 0.6, DROP = o.drop || 1.2, HEAD = o.head || 1.7, R = o.radius == null ? 0.28 : o.radius, PAD = o.pad == null ? 0.06 : o.pad,
      MINA = o.minArea == null ? 2 : o.minArea, SLOPE = Math.cos((o.maxSlope || 40) * Math.PI / 180), MINSZ = 0.12;
    const P = []; for (const b of scene.boxes || []) { const p = prep(b); if (p && Math.max(p.ln[0], p.ln[1], p.ln[2]) >= MINSZ) P.push(p); }
    const out = { boxes: P.length, surfaces: 0, reached: 0, components: [], ladderOnly: [] };
    if (!P.length) return out;
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const p of P) { x0 = Math.min(x0, p.bb[0]); x1 = Math.max(x1, p.bb[1]); z0 = Math.min(z0, p.bb[4]); z1 = Math.max(z1, p.bb[5]); }
    x0 = Math.floor((x0 - 3) / CELL) * CELL; z0 = Math.floor((z0 - 3) / CELL) * CELL; const nx = Math.ceil((x1 + 3 - x0) / CELL), nz = Math.ceil((z1 + 3 - z0) / CELL);
    if (nx * nz > 4e6) throw new Error('walk audit: a footprint of ' + nx + ' x ' + nz + ' cells');
    const BK = 2, bnx = Math.ceil(nx * CELL / BK) + 1, bnz = Math.ceil(nz * CELL / BK) + 1, buckets = new Array(bnx * bnz);
    P.forEach((p, i) => {
      const i0 = Math.max(0, Math.floor((p.bb[0] - R - 0.1 - x0) / BK)), i1 = Math.min(bnx - 1, Math.floor((p.bb[1] + R + 0.1 - x0) / BK)),
        j0 = Math.max(0, Math.floor((p.bb[4] - R - 0.1 - z0) / BK)), j1 = Math.min(bnz - 1, Math.floor((p.bb[5] + R + 0.1 - z0) / BK));
      for (let a = i0; a <= i1; a++) for (let b = j0; b <= j1; b++) (buckets[a * bnz + b] || (buckets[a * bnz + b] = [])).push(i);
    });
    /* per cell: its standable surfaces [{h, cov}], the ground first. A surface is blocked when anything solid (grown by the body's radius) cuts the body above it. */
    const surf = new Array(nx * nz);
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const x = x0 + (i + 0.5) * CELL, z = z0 + (j + 0.5) * CELL, bl = buckets[Math.floor((i * CELL) / BK) * bnz + Math.floor((j * CELL) / BK)] || [];
      const own = [], grown = [];
      for (const k of bl) { const p = P[k], a = p.cover ? null : hit(p, x, z, PAD); if (a && p.up >= SLOPE) own.push([a[1], k]); const g = hit(p, x, z, R); if (g) grown.push([g[0], g[1], k, !p.cover && Math.min(p.ln[0], p.ln[1], p.ln[2]) >= 0.05 && (p.up >= 0.94 || p.up <= 0.3)]); }
      const cand = [[0, -1]].concat(own.filter(s => s[0] > 0.02)), list = [];
      for (const c of cand) {
        const h = c[0]; if (list.some(s => Math.abs(s.h - h) < 0.04) || list.length >= 8) continue;
        let blocked = false, cov = false;
        for (const g of grown) { if (g[2] === c[1] || !g[3]) continue; if (g[0] < h + HEAD - 0.05 && g[1] > h + STEP) { blocked = true; break; } }
        if (blocked) continue;
        for (const g of grown) if (g[0] > h + HEAD - 0.01 && g[0] < h + 8) { cov = true; break; }
        list.push({ h: h, cov: cov });
      }
      if (list.length) surf[i * nz + j] = list;
    }
    const id = (i, j, s) => (i * nz + j) * 8 + s, N = nx * nz * 8;
    surf.forEach(l => { if (l) out.surfaces += l.length; });
    const ladders = (scene.ladders || []).map(l => ({ a: [Math.floor((l.foot[0] - x0) / CELL), Math.floor((l.foot[1] - z0) / CELL)], t: l.top, fy: l.footY || 0 }));
    function flood(starts, useLadders, mark) {
      const q = []; for (const s of starts) if (!mark[s]) { mark[s] = 1; q.push(s); }
      const ok = (L, h) => L && L.some(t => t.h - h <= STEP && h - t.h <= DROP);
      while (q.length) {
        const n = q.pop(), s = n % 8, c = (n - s) / 8, i = Math.floor(c / nz), j = c % nz, h = surf[c][s].h;
        for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
          if (!di && !dj) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= nz) continue;
          const L = surf[a * nz + b]; if (!L) continue;
          if (di && dj && !(ok(surf[a * nz + j], h) && ok(surf[i * nz + b], h))) continue;       /* a diagonal needs both flanks open */
          for (let k = 0; k < L.length; k++) { const d = L[k].h - h; if (d <= STEP && d >= -DROP) { const m = id(a, b, k); if (!mark[m]) { mark[m] = 1; q.push(m); } } }
        }
        if (useLadders) for (const l of ladders) {
          if (Math.abs(h - l.fy) > 0.6) continue;                                   /* a ladder starts from the ground or from a landing */
          if (Math.abs(i - l.a[0]) > 4 || Math.abs(j - l.a[1]) > 4) continue;
          const ti = Math.floor((l.t[0] - x0) / CELL), tj = Math.floor((l.t[1] - z0) / CELL);
          for (let a = ti - 5; a <= ti + 5; a++) for (let b = tj - 5; b <= tj + 5; b++) {
            if (a < 0 || b < 0 || a >= nx || b >= nz) continue; const L = surf[a * nz + b]; if (!L) continue;
            L.forEach((t, k) => { if (Math.abs(t.h - l.t[2]) <= 0.6) { const m = id(a, b, k); if (!mark[m]) { mark[m] = 1; q.push(m); } } });
          }
        }
      }
    }
    const starts = []; for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) if ((i < 8 || j < 8 || i >= nx - 8 || j >= nz - 8) && surf[i * nz + j] && surf[i * nz + j][0].h === 0) starts.push(id(i, j, 0));
    const r1 = new Uint8Array(N), r2 = new Uint8Array(N); flood(starts, false, r1); flood(starts, true, r2);
    for (let n = 0; n < N; n++) if (r2[n]) out.reached++;
    /* patches of the surfaces `mask` did not reach */
    function patches(mask) {
      const lab = new Uint8Array(N), res = [];
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const L = surf[i * nz + j]; if (!L) continue;
        for (let s = 0; s < L.length; s++) { const n = id(i, j, s); if (mask[n] || lab[n]) continue;
          const q = [n], c = { cells: 0, hmin: 1e9, hmax: -1e9, cov: 0, sx: 0, sz: 0, x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9, rep: n }; lab[n] = 1;
          while (q.length) { const m = q.pop(), ss = m % 8, cc = (m - ss) / 8, ii = Math.floor(cc / nz), jj = cc % nz, t = surf[cc][ss];
            c.cells++; c.hmin = Math.min(c.hmin, t.h); c.hmax = Math.max(c.hmax, t.h); if (t.cov) c.cov++;
            const px = x0 + (ii + 0.5) * CELL, pz = z0 + (jj + 0.5) * CELL; c.sx += px; c.sz += pz; c.x0 = Math.min(c.x0, px); c.x1 = Math.max(c.x1, px); c.z0 = Math.min(c.z0, pz); c.z1 = Math.max(c.z1, pz);
            for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { if (!di && !dj) continue; const a = ii + di, b = jj + dj; if (a < 0 || b < 0 || a >= nx || b >= nz) continue; const L2 = surf[a * nz + b]; if (!L2) continue;
              for (let k = 0; k < L2.length; k++) { const m2 = id(a, b, k); if (!mask[m2] && !lab[m2] && Math.abs(L2[k].h - t.h) <= STEP) { lab[m2] = 1; q.push(m2); } } } }
          res.push(c); } }
      return res.filter(c => c.cells * CELL * CELL >= MINA).map(c => ({ area: +(c.cells * CELL * CELL).toFixed(2), y0: +c.hmin.toFixed(2), y1: +c.hmax.toFixed(2), covered: c.cov / c.cells > 0.5,
        at: [+(c.sx / c.cells).toFixed(1), +(c.sz / c.cells).toFixed(1)], box: [+c.x0.toFixed(1), +c.x1.toFixed(1), +c.z0.toFixed(1), +c.z1.toFixed(1)], rep: c.rep }));
    }
    /* probe(x, z): the standable surfaces at a point, each [height, covered, reached on foot, reached with ladders] (for debugging a verdict) */
    out.probe = function (x, z) { const i = Math.floor((x - x0) / CELL), j = Math.floor((z - z0) / CELL), L = surf[i * nz + j] || []; return L.map((t, k) => [+t.h.toFixed(2), t.cov, !!r1[id(i, j, k)], !!r2[id(i, j, k)]]); };
    out.components = patches(r2).map(c => { delete c.rep; return c; });
    out.ladderOnly = patches(r1).filter(c => r2[c.rep]).map(c => { delete c.rep; return c; });     /* off on foot, on by a ladder */
    return out;
  }
  const api = { audit: audit, prep: prep, hit: hit };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.WALKAUDIT = api;
})(typeof window !== 'undefined' ? window : globalThis);
