/* ======================== The planner: planBuilding() ========================
   planBuilding(shell, program, opts) -> building plan. Pure data, engine-neutral: it FINDS the
   rooms inside a building, as Yuni's planner does (settlements/yuni/src/64-interiors.js,
   planGroup / emitGroup / navGroup), and hands back ROOM() inputs the placer furnishes.

     shell = { id, poly: [[x,z],...]  footprint, the OUTER face of the exterior walls (world metres)
               y: 0                   ground floor height (floor top)
               levels: 2 | [{ h, poly? }, ...]   storeys (h: clear height, default shell.h or 3.0)
               doors: [{ at:[x,z], w }]          street doors on the footprint edge (ground floor);
                                                 none given: one in the middle of edge `front` (0)
               culture, wealth, wall: 0.25, partition: 0.12, slab: 0.25,
               roof: 'gable' | 'hip' | 'flat', pitch: 0.6 (radians), windows: false (none; default on every exterior wall) }
     program = a name in IX.BUILDING_PROGRAMS | [kind, ...] (every storey) | [[kinds of storey 0], [storey 1], ...]
               | fn(level, area, shell) -> [kind, ...].  The first kind of a storey gets the street
               door (ground floor) or the top of the stair (upper floors).
     opts    = { seed, register: false (true: ROOM() every room), door: 0.9 (interior door width),
               stair: { w: 1.0, riser: 0.19, tread: 0.27 }, minWidth: 2.2 }

   How (Yuni's planGroup on any footprint): the building gets a frame (V = inward from the street
   door, U along its wall); every storey's inner outline (the footprint inset by the wall) is
   cut in two, again and again, perpendicular to its longer side, at the point that gives each
   side its share of the area (IX.KIND_WEIGHT); the side holding the street door (or the stair
   top) takes the first kinds. A cut snaps to a reflex corner of an L, never crosses a stair or
   its landings, never lands on a street door, and never leaves a room narrower than minWidth;
   when no cut fits, the storey has fewer rooms (report.dropped). Each cut becomes one
   PARTITION with one interior DOOR (every cut joins its two sides, so every room is reachable),
   swinging into the deeper room. A STAIR (a straight flight, else a ladder) rises along an
   exterior wall from a room of storey k to the room above; in the lower room it is a fixture
   (the flight, its foot kept reachable), in the upper one a fixture too (the well, its top
   landing kept reachable). Windows go on the exterior walls of every room.

   Returns B = {
     id, culture, wealth, y, frame: { O, U, V }, outer, wall, partition, slab,
     levels: [{ k, y, h, inner, rooms: [id] }],
     rooms:  [normalised room (IX.normRoom / ROOM), with .level],   roomDefs: [ROOM() inputs]
     walls:  [{ id, kind: 'exterior' | 'partition', level, a, b, thick, y, h, out?, openings: [{ u, w, y0, y1, door?, window? }] }]
     doors:  [{ id, kind: 'street' | 'interior', level, at, w, rooms: [a, b | 'street'], into }]
     stairs: [{ id, kind: 'stair' | 'ladder', from, to, rooms: [lower, upper], w, run, rise, risers,
                foot, top, centre, dir, ry, y0, y1 }]
     floors: [{ level, y, poly, holes: [[[x,z] x4]] }],  roof: { kind, pitch, y, parts },
     graph:  { nodes: [{ id, tag: street|door|room|stairfoot|stairtop, x, y, z, level, ref }], edges: [{ a, b, kind, len }] },
     report: { dropped: [], warnings: [], unreached: [] } }
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom, R3 = IX.round;

  /* ---------- polygon helpers in the building frame (u, v): axis 0 = u, 1 = v */
  function clean(poly) {
    let P = poly.slice(), changed = true;
    while (changed && P.length > 3) {
      changed = false;
      for (let i = 0; i < P.length && P.length > 3; i++) {
        const a = P[(i + P.length - 1) % P.length], b = P[i], c = P[(i + 1) % P.length];
        const dup = Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-6;
        const cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
        const col = Math.abs(cr) < 1e-7 * (1 + Math.hypot(c[0] - a[0], c[1] - a[1]));
        if (dup || col) { P.splice(i, 1); changed = true; i--; }
      }
    }
    return P;
  }
  function clipAxis(poly, ax, c, low) {
    const out = [], ins = function (p) { return low ? p[ax] <= c + 1e-9 : p[ax] >= c - 1e-9; };
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length], pi = ins(p), qi = ins(q);
      if (pi) out.push(p);
      if (pi !== qi) { const t = (c - p[ax]) / (q[ax] - p[ax]); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out.length >= 3 ? clean(out) : [];
  }
  function areaOf(p) { return p.length >= 3 ? Math.abs(G.area(p)) : 0; }
  function crossings(poly, ax, c) {           /* where the line axis = c crosses the outline */
    const o = 1 - ax, hits = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      if ((p[ax] < c) !== (q[ax] < c)) { const t = (c - p[ax]) / (q[ax] - p[ax]); hits.push(p[o] + (q[o] - p[o]) * t); }
    }
    return hits.sort(function (a, b) { return a - b; });
  }
  function bboxF(p) { return G.bbox(p); }
  /* inset each edge i by d[i] (inward), vertices at the intersections of the moved edges */
  function insetEdges(poly, d) {
    const n = poly.length, s = G.area(poly) > 0 ? 1 : -1, L = [];
    for (let i = 0; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
      const nI = [-dz / l * s, dx / l * s];                   /* inward normal */
      L.push({ p: [a[0] + nI[0] * d[i], a[1] + nI[1] * d[i]], t: [dx / l, dz / l], n: nI });
    }
    const out = [];
    for (let i = 0; i < n; i++) {
      const A = L[(i + n - 1) % n], B = L[i], den = A.t[0] * B.t[1] - A.t[1] * B.t[0];
      if (Math.abs(den) < 1e-9) { out.push([B.p[0], B.p[1]]); continue; }
      const t = ((B.p[0] - A.p[0]) * B.t[1] - (B.p[1] - A.p[1]) * B.t[0]) / den;
      out.push([A.p[0] + A.t[0] * t, A.p[1] + A.t[1] * t]);
    }
    return out;
  }
  function boxHit(b, ax, c, s0, s1, m) {      /* does the cut axis = c, from s0 to s1, pass through box b (grown by m)? */
    const o = 1 - ax;
    return c > b[ax] - m && c < b[ax + 2] + m && s1 > b[o] - m && s0 < b[o + 2] + m;
  }
  function boxesTouch(a, b, m) { return a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m; }

  function resolveProgram(program, k, area, shell) {
    if (typeof program === 'string') program = IX.BUILDING_PROGRAMS[program] || [program];
    if (typeof program === 'function') return program(k, area, shell).slice();
    if (Array.isArray(program) && Array.isArray(program[0])) return program[Math.min(k, program.length - 1)].slice();
    if (Array.isArray(program)) return program.slice();
    return ['hall'];
  }

  IX.planBuilding = function (shell, program, opts) {
    opts = opts || {};
    const id = shell.id || ('building.' + IX.hash(JSON.stringify(shell.poly)));
    const rng = IX.rng((IX.hash(id) ^ (opts.seed || 0)) >>> 0);
    const wallT = shell.wall || 0.25, partT = shell.partition || 0.12, slab = shell.slab == null ? 0.25 : shell.slab;
    const minW = opts.minWidth || 2.2, doorW = opts.door || 0.9;
    const SO = Object.assign({ w: 1.0, riser: 0.19, tread: 0.25 }, opts.stair || {});
    const report = { dropped: [], warnings: [], unreached: [] };
    let outer = shell.poly.map(function (p) { return [+p[0], +p[1]]; });
    if (G.area(outer) < 0) outer = outer.slice().reverse();     /* CCW in (x, z) from here on */

    /* ---- street doors and the frame */
    let sdoors = (shell.doors || []).map(function (d) { return { at: [+d.at[0], +d.at[1]], w: +(d.w || 1.0), swing: d.swing, hinge: d.hinge }; });
    if (!sdoors.length) {
      const e = (shell.front || 0) % outer.length, a = outer[e], b = outer[(e + 1) % outer.length];
      sdoors = [{ at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], w: 1.0 }];
    }
    let fe = 0, fd = Infinity;
    for (let i = 0; i < outer.length; i++) { const d = G.segDist(sdoors[0].at[0], sdoors[0].at[1], outer[i], outer[(i + 1) % outer.length]); if (d < fd) { fd = d; fe = i; } }
    const ea = outer[fe], eb = outer[(fe + 1) % outer.length], el = Math.hypot(eb[0] - ea[0], eb[1] - ea[1]);
    const U = [(eb[0] - ea[0]) / el, (eb[1] - ea[1]) / el], V = [-U[1], U[0]];   /* CCW: the inward normal is left of the edge */
    const O = ea;
    const toF = function (p) { const dx = p[0] - O[0], dz = p[1] - O[1]; return [dx * U[0] + dz * U[1], dx * V[0] + dz * V[1]]; };
    const toW = function (q) { return [R3(O[0] + U[0] * q[0] + V[0] * q[1]), R3(O[1] + U[1] * q[0] + V[1] * q[1])]; };
    const dirW = function (q) { return [U[0] * q[0] + V[0] * q[1], U[1] * q[0] + V[1] * q[1]]; };
    const sdF = sdoors.map(function (d) { return toF(d.at); });

    /* ---- storeys */
    const lvSpec = typeof shell.levels === 'number' || shell.levels == null
      ? Array.from({ length: Math.max(1, shell.levels | 0 || 1) }, function () { return {}; }) : shell.levels;
    const levels = [];
    let y = +(shell.y || 0);
    lvSpec.forEach(function (L, k) {
      const h = +(L.h || shell.h || 3.0);
      let po = L.poly ? L.poly.map(function (p) { return [+p[0], +p[1]]; }) : outer;
      if (G.area(po) < 0) po = po.slice().reverse();
      const inner = G.offset(po, -wallT);
      levels.push({ k: k, y: R3(y), h: h, outer: po, innerF: clean(inner.map(toF)), inner: inner.map(function (p) { return [R3(p[0]), R3(p[1])]; }), rooms: [], keep: [], cuts: [] });
      y += h + slab;
    });

    /* ---- stairs: storey k -> k + 1 along an exterior wall (Yuni: along the left wall, front to back) */
    const stairs = [];
    for (let k = 0; k + 1 < levels.length; k++) {
      const L0 = levels[k], L1 = levels[k + 1], rise = L1.y - L0.y;
      const risers = Math.ceil(rise / SO.riser - 1e-9);
      const kinds = [{ kind: 'stair', w: SO.w, run: (risers - 1) * SO.tread, land: 1.0 }, { kind: 'ladder', w: 0.7, run: 1.2, land: 0.9 }];
      let best = null;
      const cands = [];
      for (const K of kinds) {
        const P = L0.innerF;
        for (let i = 0; i < P.length; i++) {
          const a = P[i], b = P[(i + 1) % P.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const t = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], nI = [-t[1], t[0]];
          for (const sgn of [1, -1]) {
            const dir = [t[0] * sgn, t[1] * sgn], start = sgn > 0 ? a : b;
            for (let s = K.land + 0.05; s + K.run + K.land <= len + 1e-6; s += 0.25) {
              const off = 0.03 + K.w / 2;
              const c = [start[0] + dir[0] * (s + K.run / 2) + nI[0] * off, start[1] + dir[1] * (s + K.run / 2) + nI[1] * off];
              const ry = Math.atan2(dir[0], dir[1]);
              const rect = G.rect(c[0], c[1], ry, K.w, K.run);
              const foot = G.rect(c[0] - dir[0] * (K.run / 2 + K.land / 2), c[1] - dir[1] * (K.run / 2 + K.land / 2), ry, K.w, K.land);
              const top = G.rect(c[0] + dir[0] * (K.run / 2 + K.land / 2), c[1] + dir[1] * (K.run / 2 + K.land / 2), ry, K.w, K.land);
              if (!G.rectInPoly(L0.innerF, rect, 0.01) || !G.rectInPoly(L0.innerF, foot, 0.01)) continue;
              if (!G.rectInPoly(L1.innerF, rect, 0.01) || !G.rectInPoly(L1.innerF, top, 0.01)) continue;
              const box = G.bbox(G.corners(rect).concat(G.corners(foot), G.corners(top)));
              let bad = false;
              if (k === 0) for (const d of sdF) if (d[0] > box[0] - 1.6 && d[0] < box[2] + 1.6 && d[1] > box[1] - 1.6 && d[1] < box[3] + 1.6) bad = true;
              for (const kb of L0.keep.concat(L1.keep)) if (boxesTouch(kb, box, 0.3)) bad = true;
              if (bad) continue;
              /* prefer: a side wall (not the street wall), the foot near the street door, a long free wall */
              const fp = [c[0] - dir[0] * K.run / 2, c[1] - dir[1] * K.run / 2];
              const side = Math.abs(dir[1]) > 0.7 ? 1 : 0;
              const dd = Math.hypot(fp[0] - sdF[0][0], fp[1] - sdF[0][1]);
              const sc = side * 0.5 - dd * 0.15 + rng() * 0.2;
              cands.push({ sc: sc, K: K, c: c, dir: dir, ry: ry, box: box, fp: fp });
            }
          }
        }
        if (cands.length) break;
      }
      /* of the best-scoring dozen, take the one that leaves both storeys their full programme */
      cands.sort(function (p, q) { return q.sc - p.sc; });
      for (const cd of cands.slice(0, 16)) {
        let lost = 0;
        for (const Lv of [L0, L1]) {
          const dry = { k: Lv.k, innerF: Lv.innerF, keep: Lv.keep.concat([cd.box]), cuts: [] }, rp = { dropped: [] };
          splitStorey(dry, resolveProgram(program, Lv.k, areaOf(Lv.innerF), shell), Lv.k === 0 ? sdF[0] : null, rp);
          lost += rp.dropped.reduce(function (a, d) { return a + d.kinds.length; }, 0);
        }
        if (!best || lost < best.lost) { best = cd; best.lost = lost; }
        if (!lost) break;
      }
      if (!best) { report.warnings.push('no room for a stair or ladder from storey ' + k + ' to ' + (k + 1)); continue; }
      const K = best.K, sid = id + '.stair.' + k;
      const S = { id: sid, kind: K.kind, from: k, to: k + 1, w: K.w, run: R3(K.run), rise: R3(rise), risers: K.kind === 'stair' ? risers : Math.ceil(rise / 0.3),
        cF: best.c, dirF: best.dir, ry: best.ry, land: K.land, box: best.box, y0: L0.y, y1: L1.y, rooms: [null, null] };
      stairs.push(S);
      L0.keep.push(best.box); L1.keep.push(best.box);
    }

    /* ---- split each storey into rooms */
    function weight(kind) { return IX.KIND_WEIGHT[kind] || 1; }
    function splitStorey(Lv, kinds, anchor, report) {
      const leaves = [];
      const doorAvoid = Lv.k === 0 ? sdF : [];
      function rec(poly, ks, anc) {
        if (ks.length === 1) { leaves.push({ poly: poly, kind: ks[0], anchor: anc }); return; }
        const total = areaOf(poly), wsum = ks.reduce(function (a, k) { return a + weight(k); }, 0);
        let m = 1, md = Infinity;
        for (let i = 1; i < ks.length; i++) {
          const wa = ks.slice(0, i).reduce(function (a, k) { return a + weight(k); }, 0), d = Math.abs(wa - wsum / 2);
          if (d < md - 1e-9) { md = d; m = i; }
        }
        const fA = ks.slice(0, m).reduce(function (a, k) { return a + weight(k); }, 0) / wsum;
        const bb = bboxF(poly), ext = [bb[2] - bb[0], bb[3] - bb[1]];
        const axes = ext[0] >= ext[1] ? [0, 1] : [1, 0];
        const reflex = [];
        for (let i = 0; i < poly.length; i++) if (!G.convexAt(poly, i)) reflex.push(poly[i]);
        let pick = null;
        for (const ax of axes) {
          const lo = bb[ax], hi = bb[ax + 2];
          const lowArea = function (c) { return areaOf(clipAxis(poly, ax, c, true)); };
          const solve = function (target) {
            let a = lo, b = hi;
            for (let it = 0; it < 48; it++) { const mid = (a + b) / 2; if (lowArea(mid) < target) a = mid; else b = mid; }
            return (a + b) / 2;
          };
          const opts2 = [{ c: solve(fA * total), aLow: true }, { c: solve((1 - fA) * total), aLow: false }];
          for (const op of opts2) {
            const cands = [];
            for (const r of reflex) if (Math.abs(r[ax] - op.c) < 1.4) cands.push({ c: r[ax], pen: Math.abs(r[ax] - op.c) * 0.5 });
            for (let i = 0; i <= 16; i++) for (const sg of i ? [1, -1] : [1]) cands.push({ c: op.c + sg * i * 0.1, pen: i * 0.1 });
            for (const kb of Lv.keep) for (const e of [kb[ax] - 0.12, kb[ax + 2] + 0.12]) cands.push({ c: e, pen: Math.abs(e - op.c) + 0.05 });
            cands.sort(function (p, q) { return p.pen - q.pen || p.c - q.c; });
            for (const cd of cands) {
              const c = cd.c;
              if (c <= lo + minW - 1e-6 || c >= hi - minW + 1e-6) continue;
              const hits = crossings(poly, ax, c);
              if (hits.length !== 2) continue;
              const s0 = hits[0], s1 = hits[1];
              if (s1 - s0 < doorW + 0.6) continue;
              const A = clipAxis(poly, ax, c, op.aLow), B = clipAxis(poly, ax, c, !op.aLow);
              if (A.length < 3 || B.length < 3) continue;
              const ba = bboxF(A), bbb = bboxF(B);
              if (ba[2] - ba[0] < minW || ba[3] - ba[1] < minW || bbb[2] - bbb[0] < minW || bbb[3] - bbb[1] < minW) continue;
              if (areaOf(A) < 0.55 * fA * total || areaOf(B) < 0.55 * (1 - fA) * total) continue;
              if (anc && (op.aLow ? anc[ax] > c - 0.6 : anc[ax] < c + 0.6)) continue;
              let bad = false;
              for (const kb of Lv.keep) if (boxHit(kb, ax, c, s0, s1, 0.1)) { bad = true; break; }
              for (const d of doorAvoid) if (Math.abs(d[ax] - c) < 1.0 && d[1 - ax] > s0 - 0.3 && d[1 - ax] < s1 + 0.3) bad = true;
              if (bad) continue;
              pick = { ax: ax, c: c, s0: s0, s1: s1, A: A, B: B, pen: cd.pen };
              break;
            }
            if (pick) break;
          }
          if (pick) break;
        }
        if (!pick) {
          report.dropped.push({ level: Lv.k, kinds: ks.slice(1), why: 'no cut fits' });
          leaves.push({ poly: poly, kind: ks[0], anchor: anc });
          return;
        }
        const mid = pick.ax === 0 ? [pick.c, (pick.s0 + pick.s1) / 2] : [(pick.s0 + pick.s1) / 2, pick.c];
        const cut = { ax: pick.ax, c: pick.c, s0: pick.s0, s1: pick.s1, a: [], b: [] };
        Lv.cuts.push(cut);
        const n0 = leaves.length;
        rec(pick.A, ks.slice(0, m), anc);
        const n1 = leaves.length;
        rec(pick.B, ks.slice(m), mid);
        for (let i = n0; i < n1; i++) cut.a.push(i);
        for (let i = n1; i < leaves.length; i++) cut.b.push(i);
      }
      rec(Lv.innerF, kinds, anchor);
      return leaves;
    }

    const rooms = [], roomDefs = [], doors = [], walls = [], used = {};
    function roomId(kind) { used[kind] = (used[kind] || 0) + 1; return id + '.' + kind + (used[kind] > 1 ? used[kind] : ''); }
    function onCut(Lv, p, q) {
      for (const c of Lv.cuts) if (Math.abs(p[c.ax] - c.c) < 1e-6 && Math.abs(q[c.ax] - c.c) < 1e-6) return c;
      return null;
    }
    function intervalsOn(poly, cut) {
      const o = 1 - cut.ax, out = [];
      for (let i = 0; i < poly.length; i++) {
        const p = poly[i], q = poly[(i + 1) % poly.length];
        if (Math.abs(p[cut.ax] - cut.c) < 1e-6 && Math.abs(q[cut.ax] - cut.c) < 1e-6) out.push([Math.min(p[o], q[o]), Math.max(p[o], q[o])]);
      }
      return out;
    }

    levels.forEach(function (Lv) {
      const area = areaOf(Lv.innerF);
      const kinds = resolveProgram(program, Lv.k, area, shell);
      if (!kinds.length) kinds.push('hall');
      const upStair = stairs.filter(function (s) { return s.to === Lv.k; })[0];
      const anchor = Lv.k === 0 ? sdF[0] : upStair ? [upStair.cF[0] + upStair.dirF[0] * (upStair.run / 2 + upStair.land / 2), upStair.cF[1] + upStair.dirF[1] * (upStair.run / 2 + upStair.land / 2)] : null;
      const leaves = splitStorey(Lv, kinds, anchor, report);
      Lv.leaves = leaves;
      leaves.forEach(function (lf) {
        lf.id = roomId(lf.kind);
        lf.doors = []; lf.windows = []; lf.fixtures = [];
        Lv.rooms.push(lf.id);
      });
      /* interior doors: one per cut, between a room on each side whose walls share the cut */
      Lv.cuts.forEach(function (cut, ci) {
        const pairs = [];
        for (const ia of cut.a) for (const ib of cut.b) {
          const A = leaves[ia], B = leaves[ib];
          for (const p of intervalsOn(A.poly, cut)) for (const q of intervalsOn(B.poly, cut)) {
            const s0 = Math.max(p[0], q[0]), s1 = Math.min(p[1], q[1]);
            if (s1 - s0 >= doorW + 0.5) pairs.push({ ia: ia, ib: ib, s0: s0, s1: s1,
              sc: (s1 - s0) * 0.1 + (ia === cut.a[0] ? 2 : 0) + (ib === cut.b[0] ? 1 : 0) });
          }
        }
        pairs.sort(function (p, q) { return q.sc - p.sc || p.ia - q.ia || p.ib - q.ib; });
        let made = null;
        for (const P of pairs) {
          const mid = (P.s0 + P.s1) / 2, lo = P.s0 + doorW / 2 + 0.25, hi = P.s1 - doorW / 2 - 0.25;
          for (let i = 0; i <= 20 && !made; i++) for (const sg of i ? [1, -1] : [1]) {
            const s = mid + sg * i * 0.15;
            if (s < lo || s > hi) continue;
            const box = cut.ax === 0 ? [cut.c - doorW - 0.15, s - doorW / 2 - 0.15, cut.c + doorW + 0.15, s + doorW / 2 + 0.15]
              : [s - doorW / 2 - 0.15, cut.c - doorW - 0.15, s + doorW / 2 + 0.15, cut.c + doorW + 0.15];
            if (Lv.keep.some(function (kb) { return boxesTouch(kb, box, 0); })) continue;
            made = { P: P, s: s }; break;
          }
          if (made) break;
        }
        if (!made) { report.warnings.push('storey ' + Lv.k + ': no door fits across cut ' + ci); return; }
        const at = toW(cut.ax === 0 ? [cut.c, made.s] : [made.s, cut.c]);
        const A = leaves[made.P.ia], B = leaves[made.P.ib], did = id + '.door.' + doors.length;
        doors.push({ id: did, kind: 'interior', level: Lv.k, at: at, w: doorW, rooms: [A.id, B.id], into: B.id, cut: ci });
        A.doors.push({ id: did, at: at, w: doorW, to: B.id, swing: 'out', hinge: 'left', leaf: false });
        B.doors.push({ id: did, at: at, w: doorW, to: A.id, swing: 'in', hinge: 'left' });
        cut.door = { id: did, s: made.s, w: doorW };
      });
      /* street doors (ground floor): the room whose exterior wall holds them */
      if (Lv.k === 0) sdoors.forEach(function (d, i) {
        const f = sdF[i];
        let best = null, bd = Infinity;
        for (const lf of leaves) { const dd = G.edgeDist(lf.poly, f[0], f[1]) + (G.inside(lf.poly, f[0], f[1]) ? 0 : 0.001); if (dd < bd) { bd = dd; best = lf; } }
        const did = id + '.street.' + i;
        doors.push({ id: did, kind: 'street', level: 0, at: [R3(d.at[0]), R3(d.at[1])], w: d.w, rooms: [best.id, 'street'], into: best.id });
        best.doors.push({ id: did, at: d.at, w: d.w, to: 'street', swing: d.swing || 'in', hinge: d.hinge || 'left', snap: wallT + 0.6 });
      });
    });

    /* ---- stairs into rooms: the flight in the lower room, the well in the upper */
    stairs.forEach(function (S) {
      const L0 = levels[S.from], L1 = levels[S.to];
      const find = function (Lv) { for (const lf of Lv.leaves) if (G.inside(lf.poly, S.cF[0], S.cF[1])) return lf; return null; };
      const lo = find(L0), up = find(L1);
      const cW = toW(S.cF), d = dirW(S.dirF);
      S.centre = cW; S.dir = [R3(d[0], 4), R3(d[1], 4)]; S.ry = R3(Math.atan2(d[0], d[1]), 4);
      S.foot = [R3(cW[0] - d[0] * S.run / 2), R3(cW[1] - d[1] * S.run / 2)];
      S.top = [R3(cW[0] + d[0] * S.run / 2), R3(cW[1] + d[1] * S.run / 2)];
      S.rooms = [lo ? lo.id : null, up ? up.id : null];
      if (!lo || !up) { report.warnings.push(S.id + ' is not inside one room on each storey'); return; }
      const ryFoot = R3(Math.atan2(-d[0], -d[1]), 4);
      lo.fixtures.push({ id: S.id + '.flight', kind: S.kind, x: cW[0], z: cW[1], ry: ryFoot, w: S.w, d: S.run, clearance: { front: S.land - 0.1 }, reach: true, stair: S.id, end: 'foot' });
      up.fixtures.push({ id: S.id + '.well', kind: 'stairwell', x: cW[0], z: cW[1], ry: S.ry, w: S.w, d: S.run, clearance: { front: S.land - 0.1 }, reach: true, stair: S.id, end: 'top' });
    });

    /* ---- room polygons (cut edges inset by half a partition), windows, ROOM() inputs */
    levels.forEach(function (Lv) {
      Lv.leaves.forEach(function (lf) {
        const P = lf.poly, n = P.length, d = [];
        for (let i = 0; i < n; i++) d.push(onCut(Lv, P[i], P[(i + 1) % n]) ? partT / 2 : 0);
        const polyF = insetEdges(P, d);
        const poly = polyF.map(toW);
        /* windows: on the exterior walls, clear of doors and corners (shell.windows === false: none, a
           container, a byre, a store with no openings drawn) */
        for (let i = 0; i < n && shell.windows !== false; i++) {
          if (d[i]) continue;
          const a = toW(P[i]), b = toW(P[(i + 1) % n]), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          if (len < 1.8) continue;
          const cnt = len >= 5.5 ? 2 : 1;
          for (let j = 0; j < cnt; j++) {
            const u = len * (j + 1) / (cnt + 1), at = [a[0] + (b[0] - a[0]) * u / len, a[1] + (b[1] - a[1]) * u / len];
            if (u < 0.8 || u > len - 0.8) continue;
            if (lf.doors.some(function (dd) { return Math.hypot(dd.at[0] - at[0], dd.at[1] - at[1]) < dd.w / 2 + 1.0; })) continue;
            if (S_near(at, Lv)) continue;
            lf.windows.push({ at: [R3(at[0]), R3(at[1])], w: 0.9, sill: Lv.k ? 0.9 : 0.95, h: 1.1 });
          }
        }
        const def = { id: lf.id, building: id, kind: lf.kind, culture: shell.culture || null, wealth: shell.wealth == null ? 0.5 : shell.wealth,
          poly: poly, y: Lv.y, h: Lv.h, level: Lv.k, doors: lf.doors, windows: lf.windows, fixtures: lf.fixtures };
        roomDefs.push(def);
        const R = opts.register ? IX.ROOM(def) : IX.normRoom(def);
        rooms.push(R);
      });
    });
    function S_near(at, Lv) {                   /* a window over a stair flight or its landing: skip it */
      const f = toF(at);
      return Lv.keep.some(function (kb) { return f[0] > kb[0] - 0.5 && f[0] < kb[2] + 0.5 && f[1] > kb[1] - 0.5 && f[1] < kb[3] + 0.5; });
    }

    /* ---- walls: exterior (per storey and footprint edge) and partitions (one per cut, drawn once) */
    const roomById = {};
    rooms.forEach(function (R) { roomById[R.id] = R; });
    levels.forEach(function (Lv) {
      const top = Lv.k + 1 < levels.length ? levels[Lv.k + 1].y - Lv.y : Lv.h;
      const po = Lv.outer;
      for (let i = 0; i < po.length; i++) {
        const a = po[i], b = po[(i + 1) % po.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len < 1e-6) continue;
        const t = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], out = [t[1], -t[0]];
        const ops = [];
        Lv.rooms.forEach(function (rid) {
          const R = roomById[rid];
          R.doors.forEach(function (dd) {
            if (dd.to !== 'street') return;
            if (G.segDist(dd.at[0], dd.at[1], a, b) > wallT + 0.15) return;
            const u = (dd.at[0] - a[0]) * t[0] + (dd.at[1] - a[1]) * t[1];
            ops.push({ u: R3(u), w: dd.w, y0: 0, y1: Math.min(dd.h, Lv.h - 0.1), door: dd.id || true });
          });
          R.windows.forEach(function (w) {
            if (G.segDist(w.at[0], w.at[1], a, b) > wallT + 0.15) return;
            const u = (w.at[0] - a[0]) * t[0] + (w.at[1] - a[1]) * t[1];
            ops.push({ u: R3(u), w: w.w, y0: w.sill, y1: Math.min(w.sill + w.h, Lv.h - 0.1), window: true });
          });
        });
        ops.sort(function (p, q) { return p.u - q.u; });
        walls.push({ id: id + '.wall.' + walls.length, kind: 'exterior', level: Lv.k, a: [R3(a[0]), R3(a[1])], b: [R3(b[0]), R3(b[1])],
          out: [R3(out[0], 4), R3(out[1], 4)], thick: wallT, y: Lv.y, h: R3(top), openings: ops });
      }
      Lv.cuts.forEach(function (cut) {
        const a = toW(cut.ax === 0 ? [cut.c, cut.s0] : [cut.s0, cut.c]), b = toW(cut.ax === 0 ? [cut.c, cut.s1] : [cut.s1, cut.c]);
        const ops = cut.door ? [{ u: R3(cut.door.s - cut.s0), w: cut.door.w, y0: 0, y1: Math.min(2.1, Lv.h - 0.1), door: cut.door.id }] : [];
        walls.push({ id: id + '.wall.' + walls.length, kind: 'partition', level: Lv.k, a: a, b: b, thick: partT, y: Lv.y, h: Lv.h, openings: ops });
      });
    });

    /* ---- floors (an upper floor has the stair's well cut out) and the roof */
    const floors = levels.map(function (Lv) {
      const holes = stairs.filter(function (S) { return S.to === Lv.k && S.centre; }).map(function (S) {
        return G.corners(G.rect(S.centre[0], S.centre[1], S.ry, S.w, S.run)).map(function (p) { return [R3(p[0]), R3(p[1])]; });
      });
      return { level: Lv.k, y: Lv.y, thick: slab, poly: Lv.outer.map(function (p) { return [R3(p[0]), R3(p[1])]; }), holes: holes };
    });
    const topL = levels[levels.length - 1];
    const roof = { kind: shell.roof || 'gable', pitch: shell.pitch || 0.6, y: R3(topL.y + topL.h), overhang: shell.overhang == null ? 0.35 : shell.overhang, parts: [] };
    (function () {                              /* rectangles that tile the footprint (cut at reflex corners) */
      const parts = [];
      function dec(P, depth) {
        P = clean(P);
        const bb = bboxF(P);
        if (Math.abs(areaOf(P) - (bb[2] - bb[0]) * (bb[3] - bb[1])) < 1e-3 * (1 + areaOf(P))) { parts.push(bb); return true; }
        if (depth > 3) return false;
        for (let i = 0; i < P.length; i++) {
          if (G.convexAt(P, i)) continue;
          for (const ax of [0, 1]) {
            const c = P[i][ax];
            if (crossings(P, ax, c).length !== 2) continue;
            const A = clipAxis(P, ax, c, true), B = clipAxis(P, ax, c, false);
            if (A.length >= 3 && B.length >= 3 && Math.abs(areaOf(A) + areaOf(B) - areaOf(P)) < 1e-3) { return dec(A, depth + 1) && dec(B, depth + 1); }
          }
        }
        return false;
      }
      const ok = dec(topL.outer.map(toF), 0);
      if (!ok) { roof.kind = roof.kind === 'flat' ? 'flat' : 'pyramid'; roof.poly = topL.outer.map(function (p) { return [R3(p[0]), R3(p[1])]; }); return; }
      roof.parts = parts.map(function (bb) {
        const c = toW([(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2]);
        return { centre: c, U: [R3(U[0], 6), R3(U[1], 6)], V: [R3(V[0], 6), R3(V[1], 6)], hu: R3((bb[2] - bb[0]) / 2), hv: R3((bb[3] - bb[1]) / 2) };
      });
    })();

    /* ---- the walk graph (Yuni's navGroup): street, door, room, stairfoot, stairtop nodes */
    const graph = { nodes: [], edges: [] }, nodeOf = {};
    function node(tag, x, yy, z, level, ref) {
      const n = { id: id + '.n' + graph.nodes.length, tag: tag, x: R3(x), y: R3(yy), z: R3(z), level: level, ref: ref };
      graph.nodes.push(n); return n;
    }
    function edge(a, b, kind) { graph.edges.push({ a: a.id, b: b.id, kind: kind, len: R3(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)) }); }
    rooms.forEach(function (R) { nodeOf[R.id] = node('room', R.centroid[0], R.y, R.centroid[1], R.level, R.id); });
    doors.forEach(function (d) {
      const lv = levels[d.level], dn = node('door', d.at[0], lv.y, d.at[1], d.level, d.id);
      if (d.kind === 'street') {
        const R = roomById[d.rooms[0]], rd = R.doors.filter(function (x) { return x.id === d.id; })[0];
        const sn = node('street', d.at[0] - rd.n[0] * 1.2, lv.y, d.at[1] - rd.n[1] * 1.2, 0, d.id);
        edge(sn, dn, 'door'); edge(dn, nodeOf[R.id], 'room');
      } else d.rooms.forEach(function (rid) { if (nodeOf[rid]) edge(dn, nodeOf[rid], 'room'); });
    });
    stairs.forEach(function (S) {
      if (!S.rooms[0] || !S.rooms[1]) return;
      const fo = node('stairfoot', S.foot[0], S.y0, S.foot[1], S.from, S.id), to = node('stairtop', S.top[0], S.y1, S.top[1], S.to, S.id);
      edge(fo, to, S.kind); edge(fo, nodeOf[S.rooms[0]], 'room'); edge(to, nodeOf[S.rooms[1]], 'room');
    });
    /* every room reachable from the street? */
    (function () {
      const adj = {};
      graph.edges.forEach(function (e) { (adj[e.a] = adj[e.a] || []).push(e.b); (adj[e.b] = adj[e.b] || []).push(e.a); });
      const seen = {}, q = graph.nodes.filter(function (n) { return n.tag === 'street'; }).map(function (n) { return n.id; });
      q.forEach(function (k) { seen[k] = 1; });
      while (q.length) { const k = q.shift(); for (const m of adj[k] || []) if (!seen[m]) { seen[m] = 1; q.push(m); } }
      rooms.forEach(function (R) { if (!seen[nodeOf[R.id].id]) report.unreached.push(R.id); });
    })();

    return {
      id: id, culture: shell.culture || null, wealth: shell.wealth == null ? 0.5 : shell.wealth, y: levels[0].y,
      frame: { O: [R3(O[0]), R3(O[1])], U: [R3(U[0], 6), R3(U[1], 6)], V: [R3(V[0], 6), R3(V[1], 6)] },
      outer: outer.map(function (p) { return [R3(p[0]), R3(p[1])]; }), wall: wallT, partition: partT, slab: slab,
      levels: levels.map(function (Lv) { return { k: Lv.k, y: Lv.y, h: Lv.h, inner: Lv.inner, outer: Lv.outer.map(function (p) { return [R3(p[0]), R3(p[1])]; }), rooms: Lv.rooms.slice() }; }),
      rooms: rooms, roomDefs: roomDefs, walls: walls, doors: doors,
      stairs: stairs.map(function (S) {
        return { id: S.id, kind: S.kind, from: S.from, to: S.to, rooms: S.rooms, w: S.w, run: S.run, rise: S.rise, risers: S.risers,
          land: S.land, foot: S.foot, top: S.top, centre: S.centre, dir: S.dir, ry: S.ry, y0: S.y0, y1: S.y1 };
      }),
      floors: floors, roof: roof, graph: graph, report: report
    };
  };

  /* the plan as plain JSON (rooms as their ROOM() inputs) */
  IX.exportBuilding = function (B) {
    return { id: B.id, culture: B.culture, wealth: B.wealth, frame: B.frame, outer: B.outer, wall: B.wall, partition: B.partition, slab: B.slab,
      levels: B.levels, rooms: B.roomDefs, walls: B.walls, doors: B.doors, stairs: B.stairs, floors: B.floors, roof: B.roof,
      graph: B.graph, report: B.report };
  };
})(KratorInteriors);
