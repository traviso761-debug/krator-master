/* ======================== Plan audit (declared geometry) ========================
   IX.audit(room, plan, catalog?, opts?) re-checks a plan from its DATA alone, the way a game
   import would see it: footprints are the declared w x d at (x, z, ry). verify.py runs it on
   every demo room and adds the measured-geometry checks the page can make (75-audit.js).

     inside       every floor/ceiling footprint inside the room polygon
     height       y >= floor and y + h <= ceiling
     overlap      no two footprints on one layer overlap (a surface piece sits on its host)
     door         no floor footprint in a door's swing zone
     clearance    no footprint in another piece's DECLARED clearance zone (a seat and the table
                  it is drawn up to excepted: that zone is what the seat is for)
     reach        a fresh grid (all floor footprints stamped) connects every door to every other
                  door and to a use zone of every usable piece
     required     every PROGRAMS[kind].require slot is filled, or reported 'none-in-catalog'
     determinism  (with catalog) furnishing again gives byte-identical placements
   A room's fixtures (a stair, a stairwell) count as floor footprints for overlap, clearance and
   reach (their front must be reached from the doors).
   Returns { room, pieces, fails: [{ check, msg }], ok }.

   IX.auditBuilding(B, plansByRoom?) checks a planBuilding() plan:
     rooms-inside   every room inside the storey's inner outline, no two rooms of a storey overlap
     doors          every interior door joins two rooms of one storey, listed in both
     stairs         every stair joins storey k to k + 1, its flight and well are fixtures of a room
                    on each, inside them
     reach-graph    every room reachable from the street over doors and stairs (the walk graph)
     reach-grid     (with plans) the same on the walk GRIDS: from a street door, through every door
                    and stair, every room's grid is entered (IX.life.route to each room)
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom, EPS = 0.005;
  function asQ(p, byId) {
    const usable = IX.NO_ACCESS_TYPES.indexOf(p.type) < 0 && p.anchor !== 'ceiling' && p.anchor !== 'surface';
    const P = { w: p.w, d: p.d, h: p.h, type: p.type, usable: usable, clear: p.clearance || {} };
    const host = p.host ? byId[p.host] : null;
    const Q = { p: p, P: P, x: p.x, z: p.z, ry: p.ry, fp: G.rect(p.x, p.z, p.ry, p.w, p.d), host: p.host,
      pairedHost: !!(host && IX.SEAT_TYPES.indexOf(p.type) >= 0 && IX.TABLE_TYPES.indexOf(host.type) >= 0),
      layer: p.anchor === 'ceiling' ? 'ceiling' : p.anchor === 'surface' ? 'surface' : 'floor' };
    Q.zones = IX.clearanceZones(P, p.x, p.z, p.ry);
    const c = P.clear, hw = p.w / 2, hd = p.d / 2, L = G.localRect;
    Q.declared = [];
    if (c.front > 0) Q.declared.push(L(p.x, p.z, p.ry, -hw, hw, hd, hd + c.front));
    if (c.back > 0) Q.declared.push(L(p.x, p.z, p.ry, -hw, hw, -hd - c.back, -hd));
    if (c.left > 0) Q.declared.push(L(p.x, p.z, p.ry, -hw - c.left, -hw, -hd, hd));
    if (c.right > 0) Q.declared.push(L(p.x, p.z, p.ry, hw, hw + c.right, -hd, hd));
    return Q;
  }

  IX.audit = function (roomIn, plan, catalog, opts) {
    opts = opts || {};
    const room = roomIn.walls ? roomIn : IX.normRoom(roomIn);
    const fails = [];
    function fail(check, msg) { fails.push({ check: check, msg: room.id + ': ' + msg }); }
    const byId = {};
    plan.placements.forEach(function (p) { byId[p.id] = p; });
    const Qs = plan.placements.map(function (p) { return asQ(p, byId); });
    const fixQs = (room.fixtures || []).map(function (f) {
      const Q = asQ({ id: f.id, key: f.kind, type: 'fixture', anchor: 'floor', x: f.x, z: f.z, ry: f.ry, w: f.w, d: f.d, h: f.h, y: room.y, clearance: f.clearance }, byId);
      Q.P.usable = !!f.reach; Q.fixture = true;
      return Q;
    });
    const doorZones = room.doors.map(function (d) { return IX.doorZones(room, d); });

    for (const Q of Qs) {
      const p = Q.p;
      if (Q.layer !== 'surface' && !G.rectInPoly(room.poly, Q.fp, 0)) fail('inside', p.id + ' ' + p.key + ' footprint leaves the room');
      if (p.y < room.y - 1e-6 || p.y + p.h > room.y + room.h + 1e-6)
        fail('height', p.id + ' ' + p.key + ' spans y ' + p.y + '..' + (p.y + p.h).toFixed(3) + ', room ' + room.y + '..' + (room.y + room.h));
      if (Q.layer === 'floor') for (let i = 0; i < doorZones.length; i++)
        if (doorZones[i].some(function (z) { return G.convexOverlap(G.corners(Q.fp), z, EPS); })) fail('door', p.id + ' ' + p.key + ' stands in door ' + i + "'s swing");
    }
    const QF = Qs.concat(fixQs);
    for (let i = 0; i < QF.length; i++) for (let j = i + 1; j < QF.length; j++) {
      const A = QF[i], B = QF[j];
      if (A.fixture && B.fixture) continue;
      if (A.layer === B.layer && A.layer !== 'surface' && G.overlap(A.fp, B.fp, EPS))
        fail('overlap', A.p.id + ' ' + A.p.key + ' overlaps ' + B.p.id + ' ' + B.p.key);
      if (A.layer === 'surface' && B.layer === 'surface' && A.host === B.host && G.overlap(A.fp, B.fp, EPS))
        fail('overlap', A.p.id + ' overlaps ' + B.p.id + ' on one top');
      if (A.layer !== 'floor' || B.layer !== 'floor') continue;
      const pair = (A.pairedHost && A.host === B.p.id) || (B.pairedHost && B.host === A.p.id);
      if (pair) continue;
      for (const z of B.declared) if (G.overlap(A.fp, z, EPS)) fail('clearance', A.p.id + ' ' + A.p.key + " is in the clearance of " + B.p.id + ' ' + B.p.key);
      for (const z of A.declared) if (G.overlap(B.fp, z, EPS)) fail('clearance', B.p.id + ' ' + B.p.key + " is in the clearance of " + A.p.id + ' ' + A.p.key);
    }
    for (const Q of Qs) if (Q.layer === 'surface') {
      const H = Q.host && Qs.filter(function (o) { return o.p.id === Q.host; })[0];
      if (!H) fail('overlap', Q.p.id + ' surface piece has no host');
    }
    /* reach, on a grid built from the plan alone */
    const go = plan.grid ? { cell: plan.grid.cell, agent: plan.grid.agent, nbr: plan.grid.nbr, cutCorners: plan.grid.cutCorners } : {};
    const grid = IX.makeGrid(room, go);
    for (const Q of QF) if (Q.layer === 'floor') grid.stamp(Q.fp, +1);
    const starts = room.doors.map(function (d) { return grid.doorCells(d); });
    const names = room.doors.map(function (d, i) { return 'door ' + i; });
    fixQs.forEach(function (Q) {                  /* a stair's foot or top landing is a way in too */
      if (!Q.P.usable) return;
      const cells = [];
      for (const r of IX.useZones(Q)) for (const k of grid.cellsIn(r)) cells.push(k);
      starts.push(cells); names.push(Q.p.id);
    });
    let reached = 0, usable = 0;
    if (starts.length) {
      const B = grid.bfs(starts[0]);
      for (let i = 0; i < starts.length; i++) if (!starts[i].some(function (k) { return B.dist[k] >= 0; })) fail('reach', names[i] + ' is cut off from ' + names[0]);
      for (const Q of QF) {
        if (Q.layer !== 'floor' || !Q.P.usable) continue;
        usable++;
        const ok = IX.useZones(Q).some(function (r) { return grid.cellsIn(r).some(function (k) { return B.dist[k] >= 0; }); });
        if (ok) reached++; else fail('reach', Q.p.id + ' ' + Q.p.key + ' cannot be reached from the doors');
      }
    }
    /* required pieces */
    const rep = plan.report;
    for (const r of rep.required) {
      if (r.placed >= r.n) continue;
      const why = rep.missing.filter(function (m) { return m.need === r.need; })[0];
      if (!why || why.reason !== 'none-in-catalog') fail('required', 'needs ' + r.n + ' x ' + r.need + ', placed ' + r.placed + (why ? ' (' + why.reason + ')' : ''));
    }
    /* determinism */
    if (catalog) {
      const again = IX.furnishRoom(room, catalog, opts.furnishOpts || plan.opts || {});
      if (JSON.stringify(again.placements) !== JSON.stringify(plan.placements)) fail('determinism', 'furnishing twice gave different placements');
    }
    return { room: room.id, kind: room.kind, culture: room.culture, pieces: Qs.length, usable: usable, reached: usable ? reached : 0,
      fails: fails, ok: !fails.length };
  };

  IX.auditBuilding = function (B, plans) {
    const fails = [];
    function fail(check, msg) { fails.push({ check: check, msg: B.id + ': ' + msg }); }
    const byId = {};
    B.rooms.forEach(function (R) { byId[R.id] = R; });
    B.levels.forEach(function (Lv) {
      const rs = Lv.rooms.map(function (id) { return byId[id]; });
      let sum = 0;
      rs.forEach(function (R) {
        sum += R.area;
        for (const p of R.poly) if (!G.inside(Lv.inner, p[0], p[1]) && G.edgeDist(Lv.inner, p[0], p[1]) > 0.01)
          fail('rooms-inside', R.id + ' corner [' + p + '] leaves storey ' + Lv.k + "'s inner outline");
        if (R.level !== Lv.k) fail('rooms-inside', R.id + ' says storey ' + R.level + ', listed on ' + Lv.k);
      });
      for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
        const A = rs[i], C = rs[j];
        const inA = C.poly.some(function (p) { return G.inside(A.poly, p[0], p[1]) && G.edgeDist(A.poly, p[0], p[1]) > 0.02; });
        const inC = A.poly.some(function (p) { return G.inside(C.poly, p[0], p[1]) && G.edgeDist(C.poly, p[0], p[1]) > 0.02; });
        if (inA || inC || G.inside(A.poly, C.centroid[0], C.centroid[1])) fail('rooms-inside', A.id + ' and ' + C.id + ' overlap');
      }
      const inner = Math.abs(G.area(Lv.inner));
      if (sum > inner + 0.01) fail('rooms-inside', 'storey ' + Lv.k + ' rooms cover ' + sum.toFixed(2) + ' m2 of ' + inner.toFixed(2));
    });
    B.doors.forEach(function (d) {
      if (d.kind === 'street') { if (!byId[d.rooms[0]] || byId[d.rooms[0]].level !== 0) fail('doors', d.id + ' street door not on a ground-floor room'); return; }
      const A = byId[d.rooms[0]], C = byId[d.rooms[1]];
      if (!A || !C) { fail('doors', d.id + ' joins a missing room'); return; }
      if (A.level !== C.level) fail('doors', d.id + ' joins two storeys');
      if (!A.doors.some(function (x) { return x.id === d.id; }) || !C.doors.some(function (x) { return x.id === d.id; })) fail('doors', d.id + ' is not listed in both rooms');
    });
    B.stairs.forEach(function (S) {
      const lo = byId[S.rooms[0]], up = byId[S.rooms[1]];
      if (!lo || !up) { fail('stairs', S.id + ' does not land in a room on each storey'); return; }
      if (lo.level !== S.from || up.level !== S.to || S.to !== S.from + 1) fail('stairs', S.id + ' joins storeys ' + lo.level + ' and ' + up.level);
      if (Math.abs((S.y1 - S.y0) - S.rise) > 1e-3 || Math.abs(up.y - lo.y - S.rise) > 1e-3) fail('stairs', S.id + ' rise ' + S.rise + ' does not match the storeys');
      const ff = lo.fixtures.filter(function (f) { return f.stair === S.id && f.end === 'foot'; })[0];
      const ft = up.fixtures.filter(function (f) { return f.stair === S.id && f.end === 'top'; })[0];
      if (!ff || !ft) { fail('stairs', S.id + ' has no flight or no well fixture'); return; }
      if (!G.rectInPoly(lo.poly, G.rect(ff.x, ff.z, ff.ry, ff.w, ff.d), 0)) fail('stairs', S.id + ' flight leaves ' + lo.id);
      if (!G.rectInPoly(up.poly, G.rect(ft.x, ft.z, ft.ry, ft.w, ft.d), 0)) fail('stairs', S.id + ' well leaves ' + up.id);
    });
    if (B.levels.length > 1 && B.stairs.length < B.levels.length - 1) fail('stairs', (B.levels.length - 1 - B.stairs.length) + ' storey(s) without a stair up');
    (B.report.unreached || []).forEach(function (r) { fail('reach-graph', r + ' cannot be reached from the street'); });
    (B.report.warnings || []).forEach(function (w) { fail('plan', w); });
    let routes = 0;
    if (plans) {
      const N = IX.life.nav({ rooms: B.rooms, plans: plans, stairs: B.stairs });
      const street = B.doors.filter(function (d) { return d.kind === 'street'; });
      if (!street.length) fail('reach-grid', 'no street door');
      B.rooms.forEach(function (R) {
        const E = N.rooms[R.id];
        if (!E) { fail('reach-grid', R.id + ' has no plan'); return; }
        const cells = [];
        for (let k = 0; k < E.grid.nx * E.grid.nz; k++) if (E.grid.walkable(k)) cells.push(k);
        const rt = street.length ? IX.life.route(N, { street: street[0].id }, { room: R.id, cells: cells }) : { ok: false, why: 'no street door' };
        if (!rt.ok) fail('reach-grid', R.id + ' cannot be walked to from the street: ' + rt.why); else routes++;
      });
    }
    return { building: B.id, rooms: B.rooms.length, levels: B.levels.length, stairs: B.stairs.length, doors: B.doors.length, routes: routes, fails: fails, ok: !fails.length };
  };

})(KratorInteriors);
