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
   Returns { room, pieces, fails: [{ check, msg }], ok }.
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
    const doorZones = room.doors.map(function (d) { return IX.doorZone(room, d); });

    for (const Q of Qs) {
      const p = Q.p;
      if (Q.layer !== 'surface' && !G.rectInPoly(room.poly, Q.fp, 0)) fail('inside', p.id + ' ' + p.key + ' footprint leaves the room');
      if (p.y < room.y - 1e-6 || p.y + p.h > room.y + room.h + 1e-6)
        fail('height', p.id + ' ' + p.key + ' spans y ' + p.y + '..' + (p.y + p.h).toFixed(3) + ', room ' + room.y + '..' + (room.y + room.h));
      if (Q.layer === 'floor') for (let i = 0; i < doorZones.length; i++)
        if (G.overlap(Q.fp, doorZones[i], EPS)) fail('door', p.id + ' ' + p.key + ' stands in door ' + i + "'s swing");
    }
    for (let i = 0; i < Qs.length; i++) for (let j = i + 1; j < Qs.length; j++) {
      const A = Qs[i], B = Qs[j];
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
    const grid = IX.makeGrid(room, { cell: plan.grid ? plan.grid.cell : 0.2, agent: plan.grid ? plan.grid.agent : 0.2 });
    for (const Q of Qs) if (Q.layer === 'floor') grid.stamp(Q.fp, +1);
    const starts = room.doors.map(function (d) { return grid.doorCells(d); });
    let reached = 0, usable = 0;
    if (starts.length) {
      const B = grid.bfs(starts[0]);
      for (let i = 0; i < starts.length; i++) if (!starts[i].some(function (k) { return B.dist[k] >= 0; })) fail('reach', 'door ' + i + ' is cut off from door 0');
      for (const Q of Qs) {
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
})(KratorInteriors);
