/* ======================== ROOM(): room registration ========================
   kits/interiors/SPEC.md "What a building exposes":

     ROOM({ building, kind, poly: [[x,z],...], y, h,
            doors:   [{ at:[x,z], w, to: 'street' | '<room id>', swing?, hinge? }],
            windows: [{ at:[x,z], w, sill, h? }],
            culture, wealth, id?, seed?, level?, fixtures? })

   poly is the floor outline at the INNER face of the walls, either winding. A door or window
   is snapped onto the nearest wall of the polygon; `at` may sit anywhere within 0.6 m of it (a door's
   `snap` widens that: the planner gives a street door on the OUTER face of a thick wall snap = wall + 0.6).
   Door extras this kit adds (all optional): swing 'in' (default) | 'out' | 'none' (an open
   doorway or curtain), hinge 'left' | 'right' (seen from inside, looking out; default 'left'),
   h (opening height, 2.1), leaf: false (another room draws this door's leaf: a shared door).

   fixtures: [{ id?, kind, x, z, ry, w, d, h?, clearance: { front, ... }, reach? }] are things the
   building already put in the room (a stair's flight, the well a stair rises through): the placer
   keeps furniture off them and out of their clearance, and keeps their front reachable unless
   reach: false. The planner (46-planner.js) writes them; level is the storey (0 = ground).

   ROOM() returns the normalised room. What the placer reads from it:
     id, building, kind, culture, wealth, y, h, seed
     poly            as given (copied), area, centroid, bbox
     walls[]         { i, a, b, len, t:[tx,tz] (a->b), n:[nx,nz] (INWARD unit normal), ry (a piece
                       backed onto this wall faces the room at this heading) }
     doors[]         { at, w, to, swing, hinge, wall, u (metres along the wall from a), n, ry }
     windows[]       { at, w, sill, h, wall, u, n }
     fixtures[]      { id, kind, x, z, ry, w, d, h, clearance, reach, stair?, end? }
   Registered rooms live in KratorInteriors.rooms / roomById; IX.normRoom() normalises without
   registering (the placer accepts either).
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom;
  IX.rooms = [];
  IX.roomById = {};
  IX.ROOM_KINDS_KNOWN = ['hall', 'bedroom', 'kitchen', 'store', 'workshop', 'shrine', 'tavern', 'library', 'school',
    'study', 'barracks', 'court', 'yard', 'rooftop', 'antechamber'];

  function snap(room, at, what, tol) {
    let best = null, bd = Infinity;
    for (const W of room.walls) {
      const d = G.segDist(at[0], at[1], W.a, W.b);
      if (d < bd) { bd = d; best = W; }
    }
    if (!best || bd > (tol || 0.6)) throw new Error('ROOM ' + room.id + ': ' + what + ' at [' + at + '] is ' + bd.toFixed(2) + ' m from every wall');
    const u = Math.max(0, Math.min(best.len, (at[0] - best.a[0]) * best.t[0] + (at[1] - best.a[1]) * best.t[1]));
    return { W: best, u: u, at: [best.a[0] + best.t[0] * u, best.a[1] + best.t[1] * u] };
  }

  IX.normRoom = function (o) {
    if (!o || !Array.isArray(o.poly) || o.poly.length < 3) throw new Error('ROOM needs poly: [[x,z], ...] with 3+ points');
    const poly = o.poly.map(function (p) { return [+p[0], +p[1]]; });
    const sa = G.area(poly);
    if (Math.abs(sa) < 0.5) throw new Error('ROOM ' + (o.id || o.building) + ': polygon area ' + sa.toFixed(2) + ' m2 is too small');
    const sign = sa > 0 ? 1 : -1;
    const R = {
      id: o.id || ((o.building || 'room') + '.room.' + IX.rooms.length),
      building: o.building || null, kind: o.kind || 'hall', culture: o.culture || null,
      wealth: o.wealth == null ? 0.5 : Math.max(0, Math.min(1, +o.wealth)),
      y: +(o.y || 0), h: +(o.h || 3.0),
      poly: poly, area: Math.abs(sa), centroid: G.centroid(poly), bbox: G.bbox(poly),
      walls: [], doors: [], windows: [], fixtures: [], level: o.level == null ? 0 : +o.level, src: o
    };
    R.seed = o.seed != null ? (o.seed >>> 0) : IX.hash(R.id);
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
      if (len < 1e-6) continue;
      const t = [dx / len, dz / len], n = [-t[1] * sign, t[0] * sign];
      R.walls.push({ i: R.walls.length, a: a, b: b, len: len, t: t, n: n, ry: Math.atan2(n[0], n[1]) });
    }
    (o.doors || []).forEach(function (d, k) {
      const s = snap(R, d.at, 'door ' + k, d.snap);
      R.doors.push({ i: k, id: d.id || null, at: s.at, w: +(d.w || 1.0), to: d.to || 'street', swing: d.swing || 'in', hinge: d.hinge || 'left',
        h: +(d.h || 2.1), leaf: d.leaf !== false, wall: s.W.i, u: s.u, n: s.W.n, ry: s.W.ry });
    });
    (o.windows || []).forEach(function (w, k) {
      const s = snap(R, w.at, 'window ' + k);
      R.windows.push({ i: k, at: s.at, w: +(w.w || 0.9), sill: w.sill == null ? 0.9 : +w.sill, h: +(w.h || 1.1), wall: s.W.i, u: s.u, n: s.W.n });
    });
    (o.fixtures || []).forEach(function (f, k) {
      R.fixtures.push({ i: k, id: f.id || (R.id + '.fx' + k), kind: f.kind || 'fixture', x: +f.x, z: +f.z, ry: +(f.ry || 0),
        w: +f.w, d: +f.d, h: f.h == null ? R.h : +f.h, clearance: f.clearance || {}, reach: f.reach !== false,
        stair: f.stair || null, end: f.end || null });
    });
    return R;
  };

  IX.ROOM = function (o) {
    const R = IX.normRoom(o);
    if (IX.roomById[R.id]) throw new Error('ROOM ' + R.id + ' registered twice');
    IX.rooms.push(R); IX.roomById[R.id] = R;
    return R;
  };
  IX.clearRooms = function () { IX.rooms.length = 0; for (const k in IX.roomById) delete IX.roomById[k]; };
})(KratorInteriors);
