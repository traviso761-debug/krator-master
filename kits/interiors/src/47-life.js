/* ======================== Life layer: walkers through doors ========================
   SPEC "What to build first" 3: doors joined to agents. Engine-neutral, deterministic in time:
   a walker's pose is a pure function of t (no per-frame state), so any host can draw it, skip
   frames, scrub time or run it on a server.

     const N = IX.life.nav({ rooms, plans, stairs });   rooms: normalised rooms; plans: furnishRoom()
                                                        plans (array or { roomId: plan }); stairs: the
                                                        stairs of IX.planBuilding() plans (optional)
     N.rooms[id] = { room, plan, grid, links: [...] }   one walk grid per room (the placer's own grid,
                                                        every footprint and fixture stamped)
     N.links  = [{ kind: 'door' | 'stair' | 'street', a, b, ... }]   how rooms join: interior doors
                (a door listed in both rooms, matched by id or by position), stairs (a flight's foot
                in one room, its well's top landing in the room above), street doors
     IX.life.targets(N)  -> [{ room, placement, type, cells, final }]  what a walker can go and use:
                seats, beds, workstations, counters, stoves, desks, altars (TARGET_TYPES)
     IX.life.route(N, from, to) -> { ok, pts: [{ x, y, z, room, kind }], len } | { ok: false, why }
                from / to: { street: doorId } | { room, cells: [k...], final?: [x, z] }. Rooms are
                chained by a breadth-first search over the links; inside each room the grid's
                cheapest 8-neighbour path (40-grid.js route) from the cells it enters by to the
                cells it leaves by, smoothed. kind: 'street' (outside), 'door' (a threshold),
                'stair' (on a flight), 'walk' (on the grid), 'use' (the last step onto a seat)
     IX.life.walker(N, { id, entry: streetDoorId, target, t0, speed: 1.2, dwell: 25, period? })
                -> W = { id, ok, route, t0, tArrive, tLeave, tEnd, at(t) -> { x, y, z, heading,
                   state: 'away' | 'in' | 'dwell' | 'out', room } }
                spawns outside the street door at t0, walks in, dwells at its target, walks back out
                and is 'away'; with period, the whole visit repeats every period seconds
     IX.life.populate(N, { count, seed, t0, spacing, period, speed, dwell }) -> [W, ...]
                picks targets in a fixed order from the seed, each entered by the street door
                nearest it (fewest rooms away)
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom, R3 = IX.round;
  const L = IX.life = {};
  L.TARGET_TYPES = ['chair', 'bench', 'seating', 'bed', 'workstation', 'loom', 'counter', 'stove', 'desk', 'altar', 'shrine', 'table'];
  L.SPEED = 1.2;

  function useQ(p) {                          /* the placer's piece model, rebuilt from a placement */
    return { P: { w: p.w, d: p.d }, x: p.x, z: p.z, ry: p.ry, host: p.host,
      pairedHost: !!(p.host && IX.SEAT_TYPES.indexOf(p.type) >= 0),
      zones: IX.clearanceZones({ w: p.w, d: p.d, clear: p.clearance || {}, usable: true }, p.x, p.z, p.ry) };
  }
  function fixtureCells(grid, f) {
    const P = { w: f.w, d: f.d, clear: f.clearance || {}, usable: true };
    const out = [];
    for (const z of IX.clearanceZones(P, f.x, f.z, f.ry)) if (z.side === 'front') for (const k of grid.cellsIn(z.r)) if (grid.walkable(k)) out.push(k);
    return out;
  }
  function frontEnd(f) { return [f.x + Math.sin(f.ry) * f.d / 2, f.z + Math.cos(f.ry) * f.d / 2]; }

  L.nav = function (o) {
    const N = { rooms: {}, links: [], order: [] };
    const plans = o.plans || [];
    (o.rooms || []).forEach(function (R, i) {
      const plan = Array.isArray(plans) ? plans[i] : plans[R.id];
      if (!plan || !plan.grid) return;
      N.rooms[R.id] = { room: R, plan: plan, grid: plan.grid, links: [] };
      N.order.push(R.id);
    });
    function add(Lk) { N.links.push(Lk); if (N.rooms[Lk.a]) N.rooms[Lk.a].links.push(Lk); if (Lk.b && N.rooms[Lk.b]) N.rooms[Lk.b].links.push(Lk); }
    const done = {};
    N.order.forEach(function (rid) {
      const E = N.rooms[rid], R = E.room;
      R.doors.forEach(function (d) {
        if (d.to === 'street' || !N.rooms[d.to]) {
          if (d.to === 'street') add({ kind: 'street', id: d.id || (rid + '.door' + d.i), a: rid, da: d, b: null });
          return;
        }
        const other = N.rooms[d.to].room;
        let m = null;
        for (const e of other.doors) if (e.to === rid && ((d.id && e.id === d.id) || Math.hypot(e.at[0] - d.at[0], e.at[1] - d.at[1]) < 0.6)) { m = e; break; }
        if (!m) return;
        const key = [rid, d.i, d.to, m.i].join('|'), rkey = [d.to, m.i, rid, d.i].join('|');
        if (done[rkey]) return;
        done[key] = 1;
        add({ kind: 'door', id: d.id || key, a: rid, da: d, b: d.to, db: m });
      });
    });
    (o.stairs || []).forEach(function (S) {
      const lo = N.rooms[S.rooms[0]], up = N.rooms[S.rooms[1]];
      if (!lo || !up) return;
      const ff = lo.room.fixtures.filter(function (f) { return f.stair === S.id && f.end === 'foot'; })[0];
      const ft = up.room.fixtures.filter(function (f) { return f.stair === S.id && f.end === 'top'; })[0];
      if (!ff || !ft) return;
      add({ kind: 'stair', id: S.id, a: lo.room.id, b: up.room.id, fa: ff, fb: ft, stair: S });
    });
    return N;
  };

  /* cells of room `rid` by which link Lk is entered or left, and the crossing points */
  function linkSide(N, Lk, rid) {
    const E = N.rooms[rid], g = E.grid;
    if (Lk.kind === 'stair') {
      const f = rid === Lk.a ? Lk.fa : Lk.fb;
      const end = frontEnd(f);
      return { cells: fixtureCells(g, f), point: [end[0], E.room.y, end[1]] };
    }
    const d = rid === Lk.a ? Lk.da : Lk.db;
    return { cells: g.doorCells(d), point: [d.at[0], E.room.y, d.at[1]], door: d };
  }

  L.targets = function (N) {
    const out = [];
    N.order.forEach(function (rid) {
      const E = N.rooms[rid];
      E.plan.placements.forEach(function (p) {
        if (L.TARGET_TYPES.indexOf(p.type) < 0 || p.anchor === 'ceiling' || p.anchor === 'surface') return;
        const cells = [];
        for (const r of IX.useZones(useQ(p))) for (const k of E.grid.cellsIn(r)) if (E.grid.walkable(k)) cells.push(k);
        if (!cells.length) return;
        const seat = IX.SEAT_TYPES.indexOf(p.type) >= 0;
        out.push({ room: rid, placement: p.id, key: p.key, type: p.type, cells: cells, final: seat ? [p.x, p.z] : null, face: [p.x, p.z],
          seatY: seat ? p.y + Math.min(0.45, p.h * 0.5) : null });
      });
    });
    return out;
  };

  /* breadth-first over rooms; ties broken by link order, so it is deterministic */
  function roomChain(N, a, b) {
    if (a === b) return [];
    const prev = {}, q = [a];
    prev[a] = null;
    while (q.length) {
      const r = q.shift();
      for (const Lk of N.rooms[r].links) {
        if (Lk.kind === 'street') continue;
        const o = Lk.a === r ? Lk.b : Lk.a;
        if (!N.rooms[o] || o in prev) continue;
        prev[o] = { from: r, link: Lk };
        if (o === b) { const out = []; for (let c = b; prev[c]; c = prev[c].from) out.push({ from: prev[c].from, to: c, link: prev[c].link }); return out.reverse(); }
        q.push(o);
      }
    }
    return null;
  }

  L.route = function (N, from, to) {
    let startRoom, startCells, pts = [];
    if (from.street) {
      const Lk = N.links.filter(function (l) { return l.kind === 'street' && l.id === from.street; })[0];
      if (!Lk) return { ok: false, why: 'no street door ' + from.street };
      const E = N.rooms[Lk.a], d = Lk.da, y = E.room.y, lat = from.offset || 0, t = [-d.n[1], d.n[0]];
      pts.push({ x: d.at[0] - d.n[0] * 2.2 + t[0] * lat, y: y, z: d.at[1] - d.n[1] * 2.2 + t[1] * lat, room: null, kind: 'street' });
      pts.push({ x: d.at[0] - d.n[0] * 0.6, y: y, z: d.at[1] - d.n[1] * 0.6, room: null, kind: 'street' });
      pts.push({ x: d.at[0], y: y, z: d.at[1], room: Lk.a, kind: 'door' });
      startRoom = Lk.a; startCells = E.grid.doorCells(d);
    } else { startRoom = from.room; startCells = from.cells; }
    let endRoom, endCells, tail = [];
    if (to.street) {
      const Lk = N.links.filter(function (l) { return l.kind === 'street' && l.id === to.street; })[0];
      if (!Lk) return { ok: false, why: 'no street door ' + to.street };
      const E = N.rooms[Lk.a], d = Lk.da, y = E.room.y;
      endRoom = Lk.a; endCells = E.grid.doorCells(d);
      tail = [{ x: d.at[0], y: y, z: d.at[1], room: Lk.a, kind: 'door' }, { x: d.at[0] - d.n[0] * 2.2, y: y, z: d.at[1] - d.n[1] * 2.2, room: null, kind: 'street' }];
    } else {
      endRoom = to.room; endCells = to.cells;
      if (to.final) tail = [{ x: to.final[0], y: N.rooms[endRoom].room.y + (to.seatY != null ? to.seatY - N.rooms[endRoom].room.y : 0), z: to.final[1], room: endRoom, kind: 'use' }];
    }
    if (!N.rooms[startRoom] || !N.rooms[endRoom]) return { ok: false, why: 'room not in the nav' };
    const chain = roomChain(N, startRoom, endRoom);
    if (!chain) return { ok: false, why: 'no chain of doors and stairs from ' + startRoom + ' to ' + endRoom };
    const legs = [];
    let cur = startRoom, cells = startCells;
    for (const step of chain) {
      const out = linkSide(N, step.link, cur), inn = linkSide(N, step.link, step.to);
      legs.push({ room: cur, from: cells, to: out.cells, exit: out, enter: inn, link: step.link });
      cur = step.to; cells = inn.cells;
    }
    legs.push({ room: cur, from: cells, to: endCells });
    for (const lg of legs) {
      const E = N.rooms[lg.room], g = E.grid, y = E.room.y;
      if (!lg.from.length || !lg.to.length) return { ok: false, why: lg.room + ': nowhere to ' + (lg.from.length ? 'leave by' : 'enter by') };
      const ks = g.route(lg.from, lg.to);
      if (!ks) return { ok: false, why: lg.room + ': the grid does not connect its way in to its way out' };
      const P = g.smooth(ks.map(function (k) { return g.centre(k); }));
      for (const c of P) pts.push({ x: c[0], y: y, z: c[1], room: lg.room, kind: 'walk' });
      if (lg.link) {
        const a = lg.exit.point, b = lg.enter.point;
        if (lg.link.kind === 'stair') {
          pts.push({ x: a[0], y: a[1], z: a[2], room: lg.room, kind: 'stair' });
          pts.push({ x: b[0], y: b[1], z: b[2], room: lg.link.a === lg.room ? lg.link.b : lg.link.a, kind: 'stair' });
        } else {
          pts.push({ x: a[0], y: a[1], z: a[2], room: lg.room, kind: 'door' });
          pts.push({ x: b[0], y: b[1], z: b[2], room: lg.link.a === lg.room ? lg.link.b : lg.link.a, kind: 'door' });
        }
      }
    }
    pts = pts.concat(tail);
    /* drop repeats; measure */
    const P2 = [];
    for (const p of pts) { const q = P2[P2.length - 1]; if (q && Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z) < 1e-6) continue; P2.push({ x: R3(p.x), y: R3(p.y), z: R3(p.z), room: p.room, kind: p.kind }); }
    const cum = [0];
    for (let i = 1; i < P2.length; i++) cum.push(cum[i - 1] + Math.hypot(P2[i].x - P2[i - 1].x, P2[i].y - P2[i - 1].y, P2[i].z - P2[i - 1].z));
    return { ok: true, pts: P2, cum: cum, len: cum[cum.length - 1], rooms: [startRoom].concat(chain.map(function (s) { return s.to; })) };
  };

  function along(Rt, s) {                       /* point and heading at arc length s */
    const P = Rt.pts, C = Rt.cum;
    if (s <= 0) return { p: P[0], i: 0, f: 0 };
    if (s >= Rt.len) return { p: P[P.length - 1], i: P.length - 2, f: 1 };
    let lo = 0, hi = C.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (C[m] <= s) lo = m; else hi = m; }
    const a = P[lo], b = P[lo + 1], f = (s - C[lo]) / Math.max(1e-9, C[lo + 1] - C[lo]);
    return { p: { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, z: a.z + (b.z - a.z) * f, room: f < 0.5 ? a.room : b.room }, i: lo, f: f };
  }
  function headingOf(Rt, i, rev) {
    const P = Rt.pts;
    for (let k = i; k >= 0 && k < P.length - 1; rev ? k-- : k++) {
      const a = P[k], b = P[k + 1], dx = (b.x - a.x) * (rev ? -1 : 1), dz = (b.z - a.z) * (rev ? -1 : 1);
      if (Math.hypot(dx, dz) > 1e-4) return Math.atan2(dx, dz);
    }
    return 0;
  }

  L.walker = function (N, o) {
    const speed = o.speed || L.SPEED, dwell = o.dwell == null ? 25 : o.dwell, t0 = o.t0 || 0;
    const T = o.target;
    const Rt = L.route(N, { street: o.entry, offset: o.offset || 0 }, { room: T.room, cells: T.cells, final: T.final, seatY: T.seatY });
    const W = { id: o.id, target: T, entry: o.entry, ok: !!Rt.ok, why: Rt.why || null, route: Rt, t0: t0, speed: speed, dwell: dwell, period: o.period || 0 };
    if (!Rt.ok) { W.at = function () { return { state: 'away' }; }; return W; }
    const dur = Rt.len / speed;
    W.tArrive = t0 + dur; W.tLeave = W.tArrive + dwell; W.tEnd = W.tLeave + dur;
    const end = Rt.pts[Rt.pts.length - 1];
    const faceH = T.face ? Math.atan2(T.face[0] - end.x, T.face[1] - end.z) : headingOf(Rt, Rt.pts.length - 2, false);
    W.at = function (tIn) {
      let t = tIn;
      if (W.period > 0) { const span = W.period; t = t0 + ((((tIn - t0) % span) + span) % span); }
      if (t < t0 || t > W.tEnd) return { state: 'away' };
      if (t <= W.tArrive) { const A = along(Rt, (t - t0) * speed); return { x: A.p.x, y: A.p.y, z: A.p.z, room: A.p.room, heading: headingOf(Rt, A.i, false), state: 'in' }; }
      if (t <= W.tLeave) return { x: end.x, y: end.y, z: end.z, room: end.room, heading: Math.hypot(T.face[0] - end.x, T.face[1] - end.z) > 0.05 ? faceH : headingOf(Rt, Rt.pts.length - 2, false), state: 'dwell' };
      const A = along(Rt, Rt.len - (t - W.tLeave) * speed);
      return { x: A.p.x, y: A.p.y, z: A.p.z, room: A.p.room, heading: headingOf(Rt, A.i, true), state: 'out' };
    };
    return W;
  };

  /* the street door fewest rooms away from a room */
  L.nearestStreet = function (N, rid) {
    const seen = {}, q = [rid];
    seen[rid] = 1;
    while (q.length) {
      const r = q.shift();
      for (const Lk of N.rooms[r].links) if (Lk.kind === 'street') return Lk.id;
      for (const Lk of N.rooms[r].links) {
        if (Lk.kind === 'street') continue;
        const o = Lk.a === r ? Lk.b : Lk.a;
        if (N.rooms[o] && !seen[o]) { seen[o] = 1; q.push(o); }
      }
    }
    return null;
  };

  L.populate = function (N, o) {
    o = o || {};
    const rng = IX.rng(o.seed || 1), all = L.targets(N).filter(function (T) { return !o.rooms || o.rooms.indexOf(T.room) >= 0; });
    rng.shuffle(all);
    const out = [], count = Math.min(o.count == null ? 8 : o.count, all.length);
    for (let i = 0; i < count; i++) {
      const T = all[i], entry = L.nearestStreet(N, T.room);
      if (!entry) continue;
      out.push(L.walker(N, { id: 'walker.' + i, entry: entry, target: T, t0: (o.t0 || 0) + i * (o.spacing == null ? 4 : o.spacing),
        speed: o.speed, dwell: o.dwell, period: o.period, offset: (rng() - 0.5) * 1.2 }));
    }
    return out;
  };

  /* does every walker reach its target, and stay on walkable cells while it walks? */
  L.audit = function (N, walkers) {
    const fails = [];
    walkers.forEach(function (W) {
      if (!W.ok) { fails.push(W.id + ': no route (' + W.why + ')'); return; }
      const end = W.route.pts[W.route.pts.length - 1], mid = W.at((W.tArrive + W.tLeave) / 2);
      if (mid.state !== 'dwell' || Math.hypot(mid.x - end.x, mid.z - end.z) > 1e-6) fails.push(W.id + ': not at its target while it dwells');
      const T = W.target, last = W.route.pts.filter(function (p) { return p.kind === 'walk'; }).pop();
      const E = N.rooms[T.room], k = E.grid.at(last.x, last.z);
      if (T.cells.indexOf(k) < 0) fails.push(W.id + ': its walk ends outside ' + T.placement + "'s use zone");
      const P = W.route.pts;
      for (let i = 0; i + 1 < P.length; i++) {
        const a = P[i], b = P[i + 1];
        if (a.kind !== 'walk' || b.kind !== 'walk' || a.room !== b.room) continue;
        if (!N.rooms[a.room].grid.clearLine([a.x, a.z], [b.x, b.z])) { fails.push(W.id + ': walks through a blocked cell in ' + a.room); break; }
      }
      const away = W.at(W.tEnd + 1), before = W.at(W.t0 - 1);
      if (!W.period && (away.state !== 'away' || before.state !== 'away')) fails.push(W.id + ': present outside its visit');
    });
    return fails;
  };
})(KratorInteriors);
