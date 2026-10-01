/* ======================== The placer: furnishRoom() ========================
   furnishRoom(room, catalog, opts) -> plan. Pure data; nothing is built (IX.buildRoom does that).

   SPEC "Placement", in its fixed order:
   1. FILTER  setting in {indoor, both}, rooms contains room.kind, fits under the ceiling;
              culture tried along the chain own -> CULTURE_FAMILY -> any (opts.fallback:
              'any' default | 'family' | 'none'); every step down the chain is reported.
   2. REQUIRE the room kind's PROGRAMS[kind].require slots first, then its optional pieces.
              Each piece goes where its anchor and ROLES ask: against a wall (back to the wall,
              clear of its back clearance), free-standing, beside a table, hung, or on a top.
   3. KEEP    no footprint in a door's swing, in a window's sill zone (if taller than the sill),
              in another piece's clearance zone, or overlapping another footprint; every
              clearance zone inside the room; and on the occupancy grid (40-grid.js) every door
              reaches every other door and every usable piece's use zone.
   4. SEED    rng = IX.rng(room.seed ^ opts.seed); room.seed defaults to a hash of the room id,
              so a room furnishes the same on every load.
   Greedy, then bounded backtracking: each piece takes the first slot that passes. When a
   required piece then finds no fit, the room is furnished again with that requirement first
   (opts.passes orders, default 3), and then by LIMITED-DISCREPANCY SEARCH over the required
   pieces placed before the one that failed: a discrepancy tells piece i to refuse the first
   slot(s) greedy gave it (and anything within 0.6 m of them), so it lands somewhere else and
   leaves room. Discrepancy vectors are tried in a fixed order (fewest first, earliest piece
   first), at most opts.backtrack runs (default 48; 0 = greedy only). Deterministic: every run
   reseeds from the room. plan.stats = { ms, runs } says what it cost (not exported: timing).
   A room's fixtures (a stair, a stairwell: 20-rooms.js) are in place before anything else.
   Ported from Yuni's furnishGroup (settlements/yuni/src/64-interiors.js): its anchors (back,
   left/right, corner, run, centre, grid) become wall slots on ANY polygon edge and a centre
   search, its rectangle keep-outs become oriented rectangles, and its door keep-out becomes
   the door's swing zone plus the grid walk check.

   The catalog is an ADAPTER (API.md "Writing an adapter"):
     catalog.list()                               -> [{ key, name, culture, type, setting, rooms[], anchor, clearance{}, variants }]
     catalog.dims(key, variant)                   -> { w, d, h }
     catalog.anchorY(key, variant, { floorY, surfaceY, ceilingY }) -> y
     catalog.build(placement, room)               -> host object (only IX.buildRoom calls it)

     catalog.lights(key, variant, { seed, wealth })  OPTIONAL: the lights a piece carries, in its own
                                                  frame [{ lx, ly, lz, color, intensity, distance }]

   plan = { room, kind, culture, seed, placements[], lights[], grid, zones{ doors[][], windows[] }, report, stats }
   placement = { id, key, variant, seed, x, z, ry, y, anchor, type, role, culture, need, host, lights? }
   plan.lights = every placement's lights in world terms, { placement, x, y, z, color, intensity, distance }:
   a host lights the room from this data (or a budget of it) instead of one real light per lamp.
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom, R3 = IX.round;
  const EPS = 0.005;                 /* overlap tolerance, metres */
  const WALL_GAP = 0.03;             /* a wall piece's back stands this far off the wall */
  const MIN_USE = 0.45;              /* a usable piece keeps at least this much free in front */

  /* ---------- the piece model: one candidate = descriptor + variant + pose.
     Clearance sides in the piece's frame (kits/furniture/SPEC.md): front +z, back -z,
     left -x, right +x, left and right as seen standing in front of the piece, facing it. */
  function clearanceZones(P, x, z, ry, forUse) {
    const c = P.clear, hw = P.w / 2, hd = P.d / 2, out = [];
    const f = forUse && P.usable ? Math.max(c.front || 0, MIN_USE) : (c.front || 0);
    if (f > 0) out.push({ side: 'front', r: G.localRect(x, z, ry, -hw, hw, hd, hd + f) });
    if (c.back > 0) out.push({ side: 'back', r: G.localRect(x, z, ry, -hw, hw, -hd - c.back, -hd) });
    if (c.left > 0) out.push({ side: 'left', r: G.localRect(x, z, ry, -hw - c.left, -hw, -hd, hd) });
    if (c.right > 0) out.push({ side: 'right', r: G.localRect(x, z, ry, hw, hw + c.right, -hd, hd) });
    return out;
  }
  IX.clearanceZones = function (P, x, z, ry) { return clearanceZones(P, x, z, ry, true); };
  /* where someone stands to use a piece (the grid must reach one of these cells) */
  function useZones(Q) {
    const hw = Q.P.w / 2, hd = Q.P.d / 2, D = 0.5;
    if (Q.host && Q.pairedHost) {           /* a seat drawn up to a table: get in from its back or ends */
      return [G.localRect(Q.x, Q.z, Q.ry, -hw, hw, -hd - D, -hd), G.localRect(Q.x, Q.z, Q.ry, -hw - D, -hw, -hd, hd),
        G.localRect(Q.x, Q.z, Q.ry, hw, hw + D, -hd, hd)];
    }
    return Q.zones.map(function (zn) { return zn.r; });
  }
  IX.useZones = useZones;

  function describe(catalog, d, v, room) {
    const dm = catalog.dims(d.key, v);
    const type = d.type || 'other';
    return { key: d.key, desc: d, variant: v, w: dm.w, d: dm.d, h: dm.h, type: type, anchor: d.anchor || 'floor',
      culture: d.culture, clear: d.clearance || {},
      usable: IX.NO_ACCESS_TYPES.indexOf(type) < 0 && (d.anchor || 'floor') !== 'ceiling' && d.anchor !== 'surface' };
  }

  function now() { return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now(); }
  function nofitOf(plan) { return plan.report.missing.filter(function (m) { return m.reason === 'no-fit'; }); }

  /* discrepancy vectors over items [0, m): fewest discrepancies first, then earliest items,
     each entry 1..K skips. Deterministic order; the caller stops at its run budget. */
  function discrepancies(m, K, maxD, limit) {
    const out = [];
    function rec(start, left, vec) {
      if (out.length >= limit) return;
      if (left === 0) { out.push(Object.assign({}, vec)); return; }
      for (let i = start; i < m && out.length < limit; i++) for (let k = 1; k <= Math.min(K, left) && out.length < limit; k++) {
        vec[i] = k; rec(i + 1, left - k, vec); delete vec[i];
      }
    }
    for (let d = 1; d <= maxD && out.length < limit; d++) rec(0, d, {});
    return out;
  }

  /* Greedy placement can box itself in (a bar's clearance eats the depth a table needed). When a
     required piece finds no fit, furnish again from scratch with that requirement moved first
     (up to opts.passes orders), then backtrack by limited discrepancy (header). Keep the first
     plan with nothing missing, else the one missing least. */
  IX.furnishRoom = function (roomIn, catalog, opts) {
    opts = opts || {};
    const t0 = now();
    const room = roomIn.walls ? roomIn : (IX.roomById[roomIn.id] || IX.normRoom(roomIn));
    let order = ((IX.PROGRAMS[room.kind] || IX.DEFAULT_PROGRAM).require).slice(), best = null, runs = 0;
    const passes = opts.passes == null ? 3 : Math.max(1, opts.passes);
    for (let pass = 0; pass < passes; pass++) {
      const plan = furnishOnce(room, catalog, opts, order, null); runs++;
      const nofit = nofitOf(plan);
      plan.report.passes = pass + 1;
      if (!best || nofit.length < best.nofit) best = { plan: plan, nofit: nofit.length, order: order };
      if (!nofit.length) break;
      const need = nofit[0].need;
      order = order.filter(function (r) { return r.need === need; }).concat(order.filter(function (r) { return r.need !== need; }));
    }
    const budget = opts.backtrack == null ? 48 : Math.max(0, opts.backtrack | 0);
    if (best.nofit && budget) {
      const first = nofitOf(best.plan)[0];
      const vecs = discrepancies(first.item, 2, 3, budget);
      for (const vec of vecs) {
        const plan = furnishOnce(room, catalog, opts, best.order, vec); runs++;
        const nf = nofitOf(plan).length;
        if (nf < best.nofit) {
          plan.report.passes = best.plan.report.passes;
          plan.report.backtrack = { skips: vec };
          best = { plan: plan, nofit: nf, order: best.order };
          if (!nf) break;
        }
      }
      if (!best.plan.report.backtrack) best.plan.report.backtrack = { skips: null, tried: vecs.length };
    }
    best.plan.stats = { ms: Math.round((now() - t0) * 100) / 100, runs: runs };
    return best.plan;
  };

  function furnishOnce(room, catalog, opts, reqs, skips) {
    const seed = ((room.seed ^ (opts.seed || 0)) >>> 0);
    const rng = IX.rng(seed);
    const fallback = opts.fallback || 'any';
    const grid = IX.makeGrid(room, { cell: opts.cell, agent: opts.agent, nbr: opts.nbr, cutCorners: opts.cutCorners });
    const doorZones = room.doors.map(function (d) { return IX.doorZones(room, d); });
    const doorPolys = [].concat.apply([], doorZones);
    const winZones = room.windows.map(function (w) { return { sill: w.sill, r: IX.windowZone(room, w) }; });
    const placed = [];
    const report = { culture: room.culture, own: 0, thin: false, fallbacks: [], missing: [], required: [], optional: 0, tries: 0 };
    const prog = IX.PROGRAMS[room.kind] || IX.DEFAULT_PROGRAM;
    /* the room's fixtures (a stair, a stairwell) stand before any furniture does */
    (room.fixtures || []).forEach(function (f) {
      const P = { key: f.id, w: f.w, d: f.d, h: Math.min(f.h, room.h), type: 'fixture', anchor: 'floor', clear: f.clearance || {}, usable: !!f.reach, fixture: true };
      const fp = G.rect(f.x, f.z, f.ry, f.w, f.d);
      const Q = { id: f.id, P: P, x: f.x, z: f.z, ry: f.ry, fp: fp, zones: clearanceZones(P, f.x, f.z, f.ry, false), layer: 'floor', host: null, fixture: true };
      Q.top = room.y + P.h;
      placed.push(Q);
      grid.stamp(fp, +1);
    });
    let nFurn = 0;
    const doorStarts = room.doors.map(function (d) { return grid.doorCells(d); });
    /* the ways in: every door, and every fixture's front (a stair's foot, the landing at a well's top) */
    const entries = doorStarts.concat(placed.filter(function (Q) { return Q.fixture && Q.P.usable; }).map(function (Q) { return useCells(Q); }));
    if (!room.doors.length) report.noDoors = true;
    doorStarts.forEach(function (s, i) { if (!s.length) report.missing.push({ need: 'door ' + i, reason: 'door has no walkable cell inside it' }); });

    /* ---- 1. FILTER */
    const all = catalog.list();
    const base = all.filter(function (d) {
      return (d.setting === 'indoor' || d.setting === 'both') && (d.rooms || []).indexOf(room.kind) >= 0;
    });
    const chain = [room.culture].concat(IX.CULTURE_FAMILY[room.culture] || []);
    report.own = base.filter(function (d) { return d.culture === room.culture; }).length;
    report.thin = report.own < 3;
    report.candidates = base.length;
    function levels(scope) {
      const L = chain.map(function (c) { return { culture: c, list: base.filter(function (d) { return d.culture === c; }) }; });
      if (scope === 'none') return L.slice(0, 1);
      if (scope === 'family') return L;
      L.push({ culture: '*', list: base.filter(function (d) { return chain.indexOf(d.culture) < 0; }) });
      return L;
    }
    function pickVariant(d) {
      const n = d.variants || 1;
      if (n === 1) return 0;
      let v = Math.floor(room.wealth * n + (rng() - 0.5) * 0.8);
      return Math.max(0, Math.min(n - 1, v));
    }

    /* ---- 3. KEEP: the geometric test, then the walk test */
    function layerOf(P) { return P.anchor === 'ceiling' ? 'ceiling' : P.anchor === 'surface' ? 'surface' : 'floor'; }
    function exempt(P, Q, pairedHost) {      /* a seat and the table it is drawn up to ignore each other's clearance */
      return pairedHost && pairedHost === Q;
    }
    function geomOK(P, x, z, ry, hostQ, pairedHost) {
      const fp = G.rect(x, z, ry, P.w, P.d), layer = layerOf(P);
      if (layer === 'surface') {
        if (!hostQ) return null;
        const top = G.grow(hostQ.fp, -0.03);
        for (const c of G.corners(fp)) if (!G.containsPt(top, c[0], c[1])) return null;
        for (const Q of placed) if (Q.layer === 'surface' && Q.host === hostQ.id && G.overlap(fp, Q.fp, EPS)) return null;
        if (hostQ.top + P.h > room.y + room.h - 0.02) return null;
        return { fp: fp, zones: [] };
      }
      if (!G.rectInPoly(room.poly, fp, 0.02)) return null;
      if (P.h > room.h - 0.02) return null;
      if (layer === 'ceiling') {
        for (const Q of placed) {
          if (Q.layer === 'ceiling' && G.overlap(fp, Q.fp, EPS)) return null;
          if (Q.layer === 'floor' && Q.P.h > room.h - P.h - 0.05 && G.overlap(fp, Q.fp, EPS)) return null;
        }
        return { fp: fp, zones: [] };
      }
      const fpPoly = G.corners(fp);
      for (const dz of doorPolys) if (G.convexOverlap(fpPoly, dz, EPS)) return null;
      for (const wz of winZones) if (P.h > wz.sill - 0.02 && G.overlap(fp, wz.r, EPS)) return null;
      const zones = clearanceZones(P, x, z, ry, true);
      for (const zn of zones) if (!G.rectInPoly(room.poly, zn.r, 0)) return null;
      for (const Q of placed) {
        if (Q.layer === 'ceiling') { if (P.h > room.h - Q.P.h - 0.05 && G.overlap(fp, Q.fp, EPS)) return null; continue; }
        if (Q.layer !== 'floor') continue;
        if (G.overlap(fp, Q.fp, EPS)) return null;
        if (exempt(P, Q, pairedHost)) continue;
        for (const zn of Q.zones) if (G.overlap(fp, zn.r, EPS)) return null;
        for (const zn of zones) if (G.overlap(zn.r, Q.fp, EPS)) return null;
      }
      return { fp: fp, zones: zones };
    }
    function useCells(Q) {
      if (Q._use) return Q._use;
      const out = [];
      for (const zr of useZones(Q)) for (const k of grid.cellsIn(zr)) out.push(k);
      return (Q._use = out);
    }
    function reachAll(extra) {
      if (!entries.length) return true;
      const groups = entries.slice(1);
      const list = placed.concat(extra ? [extra] : []);
      for (const Q of list) if (Q.layer === 'floor' && Q.P.usable && !Q.fixture) groups.push(useCells(Q));
      return grid.reaches(entries[0], groups);
    }
    function tryPose(P, x, z, ry, extra) {
      report.tries++;
      x = R3(x); z = R3(z); ry = R3(normAng(ry), 4);
      const hostQ = extra && extra.host || null, paired = extra && extra.paired ? hostQ : null;
      const g = geomOK(P, x, z, ry, hostQ, paired);
      if (!g) return null;
      const Q = { id: room.id + '.f' + nFurn, P: P, x: x, z: z, ry: ry, fp: g.fp, zones: g.zones, layer: layerOf(P),
        host: hostQ ? hostQ.id : null, pairedHost: !!paired, role: extra && extra.role };
      if (Q.layer === 'floor') {
        grid.stamp(Q.fp, +1);
        if (!reachAll(Q)) { grid.stamp(Q.fp, -1); return null; }
      }
      Q.top = (Q.layer === 'surface' ? hostQ.top : room.y) + P.h;
      placed.push(Q); nFurn++;
      return Q;
    }
    function unplace(Q) {                     /* undo the last tryPose (backtracking) */
      if (placed[placed.length - 1] !== Q) throw new Error('unplace: not the last piece');
      placed.pop(); nFurn--;
      if (Q.layer === 'floor') grid.stamp(Q.fp, -1);
    }
    function normAng(a) { const T = Math.PI * 2; a = a % T; if (a > Math.PI) a -= T; if (a <= -Math.PI) a += T; return a; }

    /* ---- slot generators (Yuni's anchors on arbitrary polygons) */
    function minDoorDist(x, z) {
      let m = 1e9;
      for (const d of room.doors) m = Math.min(m, Math.hypot(x - d.at[0], z - d.at[1]));
      return room.doors.length ? m : 5;
    }
    function wallSlots(P, role) {
      const back = (P.clear.back || 0) + WALL_GAP, out = [];
      for (const W of room.walls) {
        const lo = P.w / 2 + 0.03, hi = W.len - P.w / 2 - 0.03;
        if (hi < lo) continue;
        const us = [];
        for (const f of [0.5, 0.3, 0.7, 0.15, 0.85, 0, 1]) us.push(lo + (hi - lo) * f);
        for (let u = lo; u <= hi + 1e-6; u += 0.25) us.push(u);
        for (const u of us) {
          const off = back + P.d / 2;
          const x = W.a[0] + W.t[0] * u + W.n[0] * off, z = W.a[1] + W.t[1] * u + W.n[1] * off;
          const endness = Math.min(u - lo, hi - u);
          let s;
          if (role === 'back') s = minDoorDist(x, z) * 1.2 - Math.abs(u - W.len / 2) * 0.6;
          else if (role === 'corner') s = -endness * 2 + minDoorDist(x, z) * 0.4;
          else s = minDoorDist(x, z) * 0.5 - endness * 0.4;
          out.push({ x: x, z: z, ry: W.ry, s: s + rng() * 0.6 });
        }
      }
      return out.sort(function (a, b) { return b.s - a.s; });
    }
    let mainRy = 0;
    (function () { let L = -1; for (const W of room.walls) if (W.len > L + 1e-6) { L = W.len; mainRy = W.ry; } })();
    function centreSlots(P, role) {
      const out = [], bb = room.bbox, c = room.centroid, step = 0.3;
      const target = role === 'corner' ? null : c, minEdge = Math.min(P.w, P.d) / 2;
      for (let x = bb[0] + 0.15; x < bb[2]; x += step) for (let z = bb[1] + 0.15; z < bb[3]; z += step) {
        if (!G.inside(room.poly, x, z) || G.edgeDist(room.poly, x, z) < minEdge) continue;
        let s;
        if (target) s = -Math.hypot(x - target[0], z - target[1]);
        else {                             /* Yuni's 'corner': as near a room corner as it fits, away from the doors */
          let dc = 1e9;
          for (const v of room.poly) dc = Math.min(dc, Math.hypot(x - v[0], z - v[1]));
          s = -dc * 2 + minDoorDist(x, z) * 0.3;
        }
        s += rng() * 0.25;
        out.push({ x: x, z: z, ry: mainRy, s: s + 0.05 });
        out.push({ x: x, z: z, ry: mainRy + Math.PI / 2, s: s });
      }
      out.sort(function (a, b) { return b.s - a.s; });
      return out.slice(0, 400);
    }
    function seatSlots(P) {
      const out = [];
      for (const H of placed) {
        if (H.layer !== 'floor' || H.fixture || ['table', 'desk'].indexOf(H.P.type) < 0) continue;
        const hw = H.P.w / 2, hd = H.P.d / 2, gap = 0.06;
        const sides = [
          { lx: 0, lz: hd + gap + P.d / 2, rot: Math.PI, span: hw },      /* in front of the table, facing it */
          { lx: 0, lz: -hd - gap - P.d / 2, rot: 0, span: hw },           /* behind it */
          { lx: hw + gap + P.d / 2, lz: 0, rot: -Math.PI / 2, span: hd },  /* its right (+x) end */
          { lx: -hw - gap - P.d / 2, lz: 0, rot: Math.PI / 2, span: hd }   /* its left (-x) end */
        ];
        for (const S of sides) {
          if (S.span * 2 < P.w * 0.7) continue;
          const offs = [0];
          if (S.span - P.w / 2 > 0.2) offs.push(S.span - P.w / 2, -(S.span - P.w / 2));
          for (const o of offs) {
            const lx = S.lx + (S.lz !== 0 ? o : 0), lz = S.lz + (S.lx !== 0 ? o : 0);
            const c = Math.cos(H.ry), s = Math.sin(H.ry);
            out.push({ x: H.x + lx * c + lz * s, z: H.z - lx * s + lz * c, ry: H.ry + S.rot, host: H, paired: true,
              s: (S.lz !== 0 ? 1 : 0.5) - Math.abs(o) * 0.2 + rng() * 0.5 });
          }
        }
      }
      return out.sort(function (a, b) { return b.s - a.s; });
    }
    function surfaceSlots(P) {
      const out = [];
      for (const H of placed) {
        if (H.layer !== 'floor' || H.fixture || IX.SURFACE_HOSTS.indexOf(H.P.type) < 0) continue;
        for (const o of [0, -0.3, 0.3]) {
          const c = Math.cos(H.ry), s = Math.sin(H.ry), lx = o * H.P.w;
          out.push({ x: H.x + lx * c, z: H.z - lx * s, ry: H.ry, host: H, s: rng() });
        }
      }
      return out.sort(function (a, b) { return b.s - a.s; });
    }
    function roleOf(P) {
      if (P.anchor === 'ceiling') return 'ceiling';
      if (P.anchor === 'surface') return 'surface';
      const r = IX.ROLES[P.type] || 'centre';
      if (P.anchor === 'wall') return r === 'back' ? 'back' : 'wall';
      return r;
    }
    /* ban = { left: fits still to refuse, poses: [[x, z, ry], ...] refused } (backtracking) */
    function banned(ban, S) {
      if (!ban) return false;
      for (const b of ban.poses) if (Math.hypot(S.x - b[0], S.z - b[1]) < 0.6) return true;
      return false;
    }
    function place(P, ban) {
      const role = roleOf(P);
      const order = {
        back: ['back', 'wall'], wall: ['wall', 'centre'], corner: ['corner', 'centre'], centre: ['centre', 'wall'],
        seat: ['seat', 'wall', 'centre'], ceiling: ['ceiling'], surface: ['surface']
      }[role];
      for (const r of order) {
        if (P.anchor === 'wall' && (r === 'centre' || r === 'seat')) continue;
        let slots;
        if (r === 'back' || r === 'wall') slots = wallSlots(P, r);
        else if (r === 'corner') slots = P.anchor === 'wall' ? wallSlots(P, 'corner') : centreSlots(P, 'corner');
        else if (r === 'seat') slots = seatSlots(P);
        else if (r === 'surface') slots = surfaceSlots(P);
        else slots = centreSlots(P, r);
        for (const S of slots) {
          if (banned(ban, S)) continue;
          const Q = tryPose(P, S.x, S.z, S.ry, { host: S.host, paired: S.paired, role: r });
          if (!Q) continue;
          if (ban && ban.left > 0) { unplace(Q); ban.left--; ban.poses.push([Q.x, Q.z, Q.ry]); continue; }
          return Q;
        }
      }
      return null;
    }

    /* ---- 2. REQUIRE, then optional */
    const used = {};
    function offRole(d) { return d.anchor === 'wall' && (IX.ROLES[d.type] || 'centre') === 'centre' ? 1 : 0; }
    function attempt(list, need, preferKey, ban) {
      const order = rng.shuffle(list.slice());
      if (preferKey) order.sort(function (a, b) { return (b.key === preferKey) - (a.key === preferKey); });
      else order.sort(function (a, b) { return (used[a.key] || 0) - (used[b.key] || 0); });   /* variety first */
      /* a type that stands free (a table) prefers pieces that can: a wall-anchored console comes last */
      order.sort(function (a, b) { return offRole(a) - offRole(b); });
      for (const d of order) {
        /* the wealth-picked variant first, then the others, smallest footprint first */
        const v0 = pickVariant(d), vs = [v0];
        const others = [];
        for (let v = 0; v < (d.variants || 1); v++) if (v !== v0) others.push(v);
        others.sort(function (a, b) { const A = catalog.dims(d.key, a), B = catalog.dims(d.key, b); return A.w * A.d - B.w * B.d || a - b; });
        for (const v of vs.concat(others)) {
          const Q = place(describe(catalog, d, v, room), ban);
          if (Q) { Q.need = need; used[d.key] = (used[d.key] || 0) + 1; return Q; }
        }
      }
      return null;
    }
    let nItem = 0;
    for (const rq of reqs) {
      const L = levels(fallback).map(function (lv) {
        return { culture: lv.culture, list: lv.list.filter(function (d) { return rq.types.indexOf(d.type) >= 0; }) };
      }).filter(function (lv) { return lv.list.length; });
      const rec = { need: rq.need, types: rq.types, n: rq.n || 1, placed: 0 };
      report.required.push(rec);
      if (!L.length) { report.missing.push({ need: rq.need, types: rq.types, reason: 'none-in-catalog', scope: fallback }); nItem += rec.n; continue; }
      let lastKey = null;
      for (let i = 0; i < rec.n; i++) {
        let Q = null;
        const item = nItem++;
        const ban = skips && skips[item] ? { left: skips[item], poses: [] } : null;
        for (const lv of L) {
          Q = attempt(lv.list, rq.need, lastKey, ban);
          if (Q) {
            if (lv.culture !== room.culture) report.fallbacks.push({ need: rq.need, wanted: room.culture, used: Q.P.culture, key: Q.P.key });
            break;
          }
        }
        if (!Q) { report.missing.push({ need: rq.need, types: rq.types, reason: 'no-fit', index: i, item: item }); nItem += rec.n - i - 1; break; }
        lastKey = Q.P.key; rec.placed++;
      }
    }
    if (opts.optional !== false) {
      const budget = Math.max(0, Math.floor(room.area / prog.extra * (0.5 + room.wealth)));
      const own = levels('family');
      const counts = prog.optional.map(function () { return 0; });
      const dead = prog.optional.map(function () { return false; });
      let added = 0, guard = 0;
      while (added < budget && guard++ < 60) {
        let any = false;
        for (let gi = 0; gi < prog.optional.length && added < budget; gi++) {
          const O = prog.optional[gi];
          if (dead[gi] || counts[gi] >= O.max) continue;
          any = true;
          let Q = null;
          for (const lv of own) {
            const list = lv.list.filter(function (d) {
              return (!O.types || O.types.indexOf(d.type) >= 0) && (!O.anchor || (d.anchor || 'floor') === O.anchor);
            });
            if (list.length && (Q = attempt(list, null))) break;
          }
          if (Q) { counts[gi]++; added++; } else dead[gi] = true;
        }
        if (!any) break;
      }
      report.optional = added;
    }

    /* ---- the plan, as data */
    const furn = placed.filter(function (Q) { return !Q.fixture; });
    const lights = [];
    const placements = furn.map(function (Q, i) {
      const P = Q.P;
      const hostQ = Q.host ? placed.filter(function (H) { return H.id === Q.host; })[0] : null;
      const y = catalog.anchorY(P.key, P.variant, { floorY: room.y, surfaceY: hostQ ? hostQ.top : null, ceilingY: room.y + room.h });
      const p = { id: Q.id, key: P.key, variant: P.variant, seed: 1 + ((seed + i * 7919) % 99991), x: Q.x, z: Q.z, ry: Q.ry, y: R3(y),
        anchor: P.anchor, type: P.type, role: Q.role, culture: P.culture, need: Q.need || null, host: Q.host,
        w: R3(P.w), d: R3(P.d), h: R3(P.h), clearance: P.clear };
      const L = catalog.lights ? catalog.lights(P.key, P.variant, { seed: p.seed, wealth: room.wealth }) : null;
      if (L && L.length) {
        const c = Math.cos(p.ry), s = Math.sin(p.ry);
        p.lights = L.map(function (l) {
          const o = { placement: p.id, x: R3(p.x + l.lx * c + l.lz * s), y: R3(p.y + l.ly), z: R3(p.z - l.lx * s + l.lz * c),
            color: l.color == null ? 0xffb066 : l.color, intensity: l.intensity == null ? 1 : l.intensity, distance: l.distance == null ? 10 : l.distance };
          lights.push(o);
          return o;
        });
      }
      return p;
    });
    report.placed = placements.length;
    report.lights = lights.length;
    const B = entries.length ? grid.bfs(entries[0]) : null;
    return { room: room.id, kind: room.kind, culture: room.culture, seed: seed, placements: placements, lights: lights, grid: grid, reach: B,
      opts: { seed: opts.seed || 0, fallback: fallback, cell: grid.cell, agent: grid.agent, nbr: grid.nbr, cutCorners: grid.cutCorners,
        optional: opts.optional !== false, passes: opts.passes, backtrack: opts.backtrack },
      zones: { doors: doorZones, windows: winZones.map(function (w) { return w.r; }) }, report: report, _placed: placed };
  }
})(KratorInteriors);
