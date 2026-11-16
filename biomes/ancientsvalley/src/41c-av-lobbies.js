// ================================================================= THE ANCIENT'S VALLEY — lobbies and climbs: doors, approaches, open and blocked towers  [G data]
// PLAN.md section 15 (the owner, 2026-11-09: "at least a fraction of the buildings here to be actually enterable and climbable; we can strategically
// block entrance or ascent to most with well-placed rubble"; "no proper ramp to get into lobby"; "more climbable stumps"; "a collapsing floor hazard").
// Plain records and pure functions: no THREE, no DOM. Every pick is KRAND.hash(seed, tower index, salt), never by order. Axes: y up, x east, z south.
// A tower's own frame (u, v) is the plan's: world = (T.x + u cos yaw - v sin yaw, T.z + u sin yaw + v cos yaw), as 46z's plinths and 70's drawn
// forms (turned by -yaw in three's sense since 2026-11-10) both read it.
//
//   AV.lobbies(o) -> {doors, open, counts}
//        o: {towers, family(key) -> F, ruin(F, state) -> MP.ruin's numbers, skin(F, y) -> {r} | {hw, hd} (the skin's half size at y), lattice {c, s, pitch},
//            street(axis, k) -> {levelAt(x, z), half, pave} | null (the roadway's half width and its pavement), seed, near {x, z}, kerbH (0.15)}
//        a door: {id, ti, tower, family, state, x, z, y (the plinth), nx, nz (outward, toward the street), tx, tz (along the frontage), w, lat,
//                 approach {kind steps|ramp|rubble|none, a [x, z, y] its foot on the pavement, b its head on the plinth, w, rise, run},
//                 mode open|door|stair, choke (the stair's storey, mode stair), climb (AV.climb, open and stair), heap (KRUBBLE.heap's input), blocks [[x0,x1,z0,z1,y0,y1]]}
//   AV.climb(F, state, T, o) -> {floors [{y, h}], top, stair {su, sv, ax, L, W}, plates [[{pts [[u, v]], weak}]], landings, flights, route [[u, v, y]]}
//   AV.doorWorld(T, u, v)      the tower frame to the world
//   AV.walkRoute(W, ground, pts, o) -> {ok, i, y, why}: the camera's stand rules (core/host 90) along a polyline of [x, z] or [x, z, y]: the highest
//        floor at or under the feet plus a step (0.7), the ground when it is higher, a drop over 1.4 m or a block (r 0.35, h 1.7) ends the walk
var AV = (typeof AV !== 'undefined') ? AV : {};
(function () {
  'use strict';
  var KR = (typeof KRAND !== 'undefined') ? KRAND : null;
  var u01 = function (seed, i, salt) { return KR.unit(KR.hash(seed | 0, i | 0, salt | 0)); };
  var SLOPE = 0.55, STEP_UP = 0.7, DROP = 1.4, STAIR_L = 7.2, STAIR_W = 3.0, LAND = 1.3, FLIGHT_W = 1.4, MAX_FLOORS = 70;
  /* the open share by state (the owner: more climbable stumps); the rest blocked, seven in ten at the door, three at the stair */
  /* intact towers keep their glass: walking in by a door the page chose would be walking through it, so none opens (2026-11-10) */
  AV.OPEN_SHARE = { intact: 0, gutted: 0.08, crown: 0.10, broken: 0.10, skeleton: 0.15, stump: 0.30 };
  AV.WEAK_STATES = { broken: 1, crown: 1, skeleton: 1 };
  AV.LOBBY = { slope: SLOPE, maxRise: 6.3, stairL: STAIR_L, stairW: STAIR_W, land: LAND, flightW: FLIGHT_W };
  /* the plan's frame (2026-11-10: 70 now draws every form turned by -yaw in three's sense, so a tower's local x points along (cos yaw, sin yaw),
     as 46z padD, AV.kerbPlace and HCHK.kerb read it) */
  AV.doorWorld = function (T, u, v) { var c = Math.cos(T.yaw || 0), s = Math.sin(T.yaw || 0); return [T.x + u * c - v * s, T.z + u * s + v * c]; };
  var toLocal = function (T, dx, dz) { var c = Math.cos(T.yaw || 0), s = Math.sin(T.yaw || 0); return [dx * c + dz * s, -dx * s + dz * c]; };
  /* a convex or simple polygon [[u, v]] clipped to the half plane where coordinate `ax` is above (keep > 0) or below (keep < 0) `val` */
  function clip(P, ax, val, keep) {
    var out = [];
    for (var i = 0; i < P.length; i++) {
      var a = P[i], b = P[(i + 1) % P.length], da = (a[ax] - val) * keep, db = (b[ax] - val) * keep;
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) { var t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out.length >= 3 ? out : null;
  }
  var area = function (P) { var s = 0; for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; };
  /* the plate's outline at a storey: a disc of 0.8 of the skin's radius (32 sides), or a slab's rectangle less 2.5 m; `torn` breaks its rim by hash */
  function outline(sk, reach, torn, seed) {
    var P = [];
    if (sk.r != null) {
      var r = Math.max(reach + 1.5, Math.min(26, sk.r * 0.8));
      for (var i = 0; i < 32; i++) { var a = i / 32 * Math.PI * 2, k = torn ? 0.55 + 0.45 * u01(seed, i, 41) : 1, rr = Math.max(reach + 1.5, r * k); P.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    } else {
      var hw = Math.max(reach + 1.5, sk.hw - 2.5), hd = Math.max(reach + 1.5, sk.hd - 2.5);
      if (!torn) P = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
      else for (var j = 0; j < 24; j++) { var b = j / 24 * Math.PI * 2, cu = Math.cos(b), sv = Math.sin(b), m = Math.min(hw / Math.max(1e-6, Math.abs(cu)), hd / Math.max(1e-6, Math.abs(sv))), q = Math.max(reach + 1.5, m * (0.55 + 0.45 * u01(seed, j, 43))); P.push([cu * q, sv * q]); }
    }
    return P;
  }
  // ---------------------------------------------------------------- one open tower's climb, in its own frame
  AV.climb = function (F, state, T, o) {
    var lv = F && F.levels; if (!lv || !lv.length) return null;
    var R = state === 'intact' || state === 'gutted' ? null : (o.ruin ? o.ruin(F, state) : null);
    var last = lv[lv.length - 1], roof = last.y + last.h, top = R ? Math.max(0, R.cut - R.torn) : roof;
    var floors = [];
    for (var i = 0; i < lv.length && floors.length < MAX_FLOORS; i++) { if (lv[i].y <= top + 0.01) floors.push({ y: lv[i].y, h: lv[i].h }); }
    /* the floor over the last storey that fits under the top: the roof, or the ruin's torn floor */
    var lf = floors[floors.length - 1]; if (lf && lf.y + lf.h <= top + 0.01 && floors.length < MAX_FLOORS) floors.push({ y: lf.y + lf.h, h: 0 });
    while (floors.length && floors[floors.length - 1].y > top + 0.01) floors.pop();
    /* a storey over 8 m (the Stalk's stem: 50 m to its first saucer) has no stair across it: the climb stops under it */
    for (var g = 1; g < floors.length; g++) if (floors[g].y - floors[g - 1].y > 8) { floors.length = g; break; }
    if (floors.length < 2) return null;
    /* the stair: the family's first stair shaft, along its long side; at the axis when the shaft leaves it outside the plate */
    var sh = (F.core && F.core.shafts || []).filter(function (s) { return s.kind === 'stair'; })[0] || { x: 0, z: 0, w: 3, d: 3 };
    var ax = (sh.w >= sh.d) ? 0 : 1, half = [ax === 0 ? STAIR_L / 2 : STAIR_W / 2, ax === 0 ? STAIR_W / 2 : STAIR_L / 2];
    var minSkin = Infinity; floors.forEach(function (f) { var sk = o.skin(F, f.y); var m = sk.r != null ? sk.r * 0.8 : Math.min(sk.hw, sk.hd) - 2.5; if (m < minSkin) minSkin = m; });
    var su = sh.x || 0, sv = sh.z || 0, fits = function (cu, cv) { var sk0 = o.skin(F, 0); if (sk0.r != null) return Math.hypot(Math.abs(cu) + half[0], Math.abs(cv) + half[1]) <= minSkin - 0.5; return Math.abs(cu) + half[0] <= sk0.hw - 3 && Math.abs(cv) + half[1] <= Math.min(minSkin, sk0.hd - 2.5) - 0.5; };
    if (!fits(su, sv)) { su = 0; sv = 0; }
    var reach = Math.hypot(Math.abs(su) + half[0], Math.abs(sv) + half[1]);
    /* the stair's own axes: `al` along it, `ac` across; a point (al, ac) in the tower's frame */
    var P = function (al, ac) { return ax === 0 ? [su + al, sv + ac] : [su + ac, sv + al]; };
    var L2 = STAIR_L / 2, W2 = STAIR_W / 2, A0 = -L2 + LAND, B0 = L2 - LAND, fo = FLIGHT_W / 2 + 0.1;
    var seed = KR.hash(o.seed | 0, T.ti | 0, 401);
    var weakOK = !!AV.WEAK_STATES[state], plates = [], landings = [], flights = [], route = [], weak = 0;
    for (var k = 0; k < floors.length; k++) {
      var f = floors[k], isTop = k === floors.length - 1, torn = isTop && !!R;
      var O = outline(o.skin(F, f.y + 0.5), reach, torn, KR.hash(seed, k, 3)), lo = [su - half[0] + 0.02, sv - half[1] + 0.02], hi = [su + half[0] - 0.02, sv + half[1] - 0.02];   /* 2 cm over the box's edge: no gap to fall through */
      /* four pieces round the stair's hole: before its A end (the way onto the stair), past its B end, and the two sides */
      var oa = ax, oc = 1 - ax, aA = lo[oa], aB = hi[oa];
      var pieces = [{ end: 'A', pts: clip(O, oa, aA, -1) }, { end: 'B', pts: clip(O, oa, aB, 1) }];
      var mid = clip(clip(O, oa, aA, 1) || [], oa, aB, -1);
      if (mid) { pieces.push({ end: 'S-', pts: clip(mid, oc, lo[oc], -1) }); pieces.push({ end: 'S+', pts: clip(mid, oc, hi[oc], 1) }); }
      pieces = pieces.filter(function (p) { return p.pts && area(p.pts) > 1; });
      /* a weak floor: one piece away from the stair's A end, in about one storey in five, never the lobby's or the top two */
      if (weakOK && k >= 1 && k <= floors.length - 3 && u01(seed, k, 7) < 0.22) {
        var cand = pieces.filter(function (p) { return p.end !== 'A'; }).sort(function (p, q) { return area(q.pts) - area(p.pts); })[0];
        if (cand) { cand.weak = true; weak++; }
      }
      plates.push(pieces.map(function (p) { return { pts: p.pts, weak: !!p.weak, end: p.end, y: f.y }; }));
      /* the landings: at the A end on every floor, at the B end half a storey up on every floor but the top */
      landings.push({ pts: [P(-L2, -W2), P(A0, -W2), P(A0, W2), P(-L2, W2)], y: f.y, k: k, end: 'A' });
      if (!isTop) {
        var g = floors[k + 1].y - f.y, ym = f.y + g / 2;
        landings.push({ pts: [P(B0, -W2), P(L2, -W2), P(L2, W2), P(B0, W2)], y: ym, k: k, end: 'B' });
        flights.push({ a: P(A0, fo).concat([f.y]), b: P(B0, fo).concat([ym]), w: FLIGHT_W, k: k, n: 1 });
        flights.push({ a: P(B0, -fo).concat([ym]), b: P(A0, -fo).concat([floors[k + 1].y]), w: FLIGHT_W, k: k, n: 2 });
        route.push(P(-L2 + LAND / 2, 0).concat([f.y]), P(A0 + 0.05, fo).concat([f.y]), P(B0 - 0.05, fo).concat([ym]), P(L2 - LAND / 2, 0).concat([ym]),
          P(B0 - 0.05, -fo).concat([ym]), P(A0 + 0.05, -fo).concat([floors[k + 1].y]));
      } else route.push(P(-L2 + LAND / 2, 0).concat([f.y]), P(-L2 - 1.2, 0).concat([f.y]));
    }
    return { floors: floors, top: floors[floors.length - 1].y, skinTop: top, stair: { su: su, sv: sv, ax: ax, L: STAIR_L, W: STAIR_W }, plates: plates, landings: landings, flights: flights, route: route, weak: weak };
  };
  // ---------------------------------------------------------------- every kerb tower's door, approach and fate
  AV.lobbies = function (o) {
    var L = o.lattice, p = L.pitch, c = L.c, s = L.s, kerbH = o.kerbH == null ? 0.15 : o.kerbH, doors = [], open = [];
    var counts = { doors: 0, open: 0, door: 0, stair: 0, rubble: 0, none: 0, byState: {} };
    var nearest = null;
    o.towers.forEach(function (T, ti) {
      if (!T.kerb || T.state === 'fallen') return;
      var F = o.family(T.family); if (!F) return;
      var lx = T.x * c + T.z * s, lz = -T.x * s + T.z * c, a = T.kerb.axis, sg = T.kerb.side > 0 ? 1 : -1, v = a === 0 ? lx : lz;
      var k0 = Math.floor(v / p - 0.5), kk = sg > 0 ? k0 + 1 : k0, line = (kk + 0.5) * p, D0 = Math.abs(line - v);
      var st = o.street(a, kk); if (!st) return;
      var nx = a === 0 ? c * sg : -s * sg, nz = a === 0 ? s * sg : c * sg, tx = -nz, tz = nx;
      /* the door: the portal nearest the street, else the frontage's middle; on the skin at the ground */
      var dl = toLocal(T, nx, nz), th = Math.atan2(dl[1], dl[0]);
      /* a portal only when it faces the street (within 70 degrees: the Spiral's took one on its back and the way in crossed the tower) */
      if (F.portals && F.portals.length) { var best = F.portals[0], bd = 9; F.portals.forEach(function (q) { var d = Math.abs(Math.atan2(Math.sin(q - th), Math.cos(q - th))); if (d < bd) { bd = d; best = q; } }); if (bd < 1.22) th = best; }
      var sk = o.skin(F, 0), du = Math.cos(th), dv = Math.sin(th), rr = sk.r != null ? sk.r : Math.min(sk.hw / Math.max(1e-6, Math.abs(du)), sk.hd / Math.max(1e-6, Math.abs(dv)));
      var dw = AV.doorWorld(T, du * rr, dv * rr), lat = (dw[0] - T.x) * tx + (dw[1] - T.z) * tz;
      /* the approach: from the pavement's back edge (dB from the street's line) toward the plinth, at the door's lateral place */
      var X = function (d) { return [T.x + nx * (D0 - d) + tx * lat, T.z + nz * (D0 - d) + tz * lat]; };
      /* depth: the door's distance from the street's line (an off-middle portal stands further back than the skin's radius says) */
      var dB = st.half + st.pave, depth = D0 - ((dw[0] - T.x) * nx + (dw[1] - T.z) * nz);
      /* the plinth's front edge on this line: the pad is an ellipse (46z padD: semi-axes rx, rz in the frame (c, s)), so a door off the frontage's
         middle meets it further back than the kerb's 3 m (the Telescope's portals: 15 m) */
      var inPad = function (d) { if (T.rx == null) return d >= dB + 3; var p = X(d), dx = p[0] - T.x, dz = p[1] - T.z, c = T.c == null ? Math.cos(T.yaw || 0) : T.c, s = T.s == null ? Math.sin(T.yaw || 0) : T.s;
        return Math.hypot((dx * c + dz * s) / T.rx, (-dx * s + dz * c) / T.rz) < 1; };
      var dE = dB; while (dE < depth && !inPad(dE)) dE += 0.1;
      /* the flight: from the pavement's back edge to half a metre onto the plinth; a rise that wants more run takes the pavement, then the plinth.
         The pavement's level is read where the foot lands (a crater's carving changes it), so the fit runs three times */
      var head = Math.min(dE + 0.5, depth - 1), foot = dB, fy = 0, rise = 0, lv = function (d) { var q = X(d); return st.levelAt(q[0], q[1]) + kerbH; };
      for (var it = 0; it < 3; it++) { fy = lv(foot); rise = T.y - fy; var need = Math.max(2, Math.abs(rise) / SLOPE); if (head - foot < need) { foot = Math.max(st.half + 0.3, head - need); if (head - foot < need) head = Math.min(depth - 1, foot + need); } }
      fy = lv(foot); rise = T.y - fy; var run = Math.max(0.1, head - foot), kind = Math.abs(rise) < 0.6 ? 'ramp' : 'steps';
      if (Math.abs(rise) / run > 0.6 || Math.abs(rise) > AV.LOBBY.maxRise) kind = rise > 0 ? 'rubble' : 'none';
      /* Dn: a metre out of the door; Di: four metres in (the level path runs through the doorway, where a slab's wall stands past its plinth) */
      var A = X(foot), B = X(head), Dn = [dw[0] + nx * 1.0, dw[1] + nz * 1.0], Di = [dw[0] - nx * 4, dw[1] - nz * 4];
      var D = { id: 'av.door.' + ti, ti: ti, tower: T.id, family: T.family, state: T.state, x: dw[0], z: dw[1], y: T.y, nx: nx, nz: nz, tx: tx, tz: tz, lat: lat,
        w: F.portals && F.portals.length ? 8 : 6, skinR: rr, edge: X(dE), kerb: X(st.half),
        approach: { kind: kind, a: [A[0], A[1], fy], b: [B[0], B[1], T.y], w: 6, rise: rise, run: run },
        path: { a: [B[0], B[1], T.y], b: [Di[0], Di[1], T.y] } };
      /* the plinth between the flight's head and the door: a road's cutting, a crater or a sinkhole can bite it. Under 2.5 m the ground takes a level
         path there (46z); deeper, the door is cut off (D.cut 'ground'). A fallen tower's shaft across the way cuts it too (D.cut 'fallen') */
      if (o.ground) { var worst = 0, Lp = Math.hypot(Di[0] - B[0], Di[1] - B[1]); for (var sp = 0; sp <= Lp; sp += 1) { var gx = B[0] + (Di[0] - B[0]) * sp / Math.max(Lp, 1e-6), gz = B[1] + (Di[1] - B[1]) * sp / Math.max(Lp, 1e-6); worst = Math.max(worst, Math.abs(o.ground(gx, gz) - T.y)); } if (worst > 2.5) D.cut = 'ground'; D.plinthDev = worst; }
      if (o.fallen && o.fallen.length) { var hits = function (p, q) { var L2 = Math.hypot(q[0] - p[0], q[1] - p[1]); for (var s2 = 0; s2 <= L2; s2 += 0.5) { var x2 = p[0] + (q[0] - p[0]) * s2 / Math.max(L2, 1e-6), z2 = p[1] + (q[1] - p[1]) * s2 / Math.max(L2, 1e-6);
          for (var b = 0; b < o.fallen.length; b++) { var Bx = o.fallen[b]; if (x2 > Bx[0] - 0.4 && x2 < Bx[1] + 0.4 && z2 > Bx[2] - 0.4 && z2 < Bx[3] + 0.4) return true; } } return false; };
        if (hits(A, B) || hits(B, Dn) || hits(Dn, [dw[0] - nx * 4, dw[1] - nz * 4])) D.cut = 'fallen'; }
      counts.doors++;
      if (kind === 'rubble' || kind === 'none') counts[kind]++;
      if (D.cut) counts.cut = (counts.cut || 0) + 1;
      /* open or blocked, by hash */
      /* a lean does not keep a tower shut: an open tower is set plumb below (its plates are level; every ruin on the page leans a little) */
      var share = AV.OPEN_SHARE[T.state] || 0, climb = null, eligible = (kind === 'steps' || kind === 'ramp') && !D.cut;
      /* open wants two storeys of climb at least (a broken Stalk keeps one 4.5 m floor: a stair-blocked lobby at most) */
      /* a family of several bodies (the Organ's pipes, the Pods, the Crescent's towers: F.towers) has no one axis for the plates and the stair:
         it is shut at its door, never climbed (its floors would hang between its parts) */
      var multi = !!(F.towers && F.towers.length > 1);
      climb = multi ? null : AV.climb(F, T.state, T, { ruin: o.ruin, skin: o.skin, seed: o.seed }); if (!climb || climb.floors.length < 3) eligible = false;
      D.mode = eligible && u01(o.seed, ti, 501) < share ? 'open' : (u01(o.seed, ti, 503) < 0.7 || !climb ? 'door' : 'stair');
      if (eligible && o.near && share > 0) { var dn = Math.hypot(T.x - o.near.x, T.z - o.near.z); if (!nearest || dn < nearest.d) nearest = { d: dn, D: D, climb: climb }; }
      if (D.mode !== 'door') D.climb = climb;
      if (D.mode === 'stair') D.choke = Math.max(1, Math.min(climb.floors.length - 1, 1 + Math.floor(u01(o.seed, ti, 505) * 3)));
      D.approach.w = D.mode === 'open' ? 6 : 4;
      doors.push(D);
    });
    if (nearest && nearest.D.mode !== 'open') { nearest.D.mode = 'open'; nearest.D.climb = nearest.climb; nearest.D.choke = null; nearest.D.approach.w = 6; nearest.D.forced = true; }
    /* the blocking: a heap against the skin across the doorway and blocks along its line; or a heap on the stair's B landing under the choke's floor */
    var blockOf = function (D) { AV.doorBlocks(D, o.towers[D.ti], o.seed); };
    doors.forEach(blockOf);
    /* a door whose way (the flight, the plinth, the doorway) crosses another door's rubble, two towers on a corner with their doors facing,
       is cut off by it (D.cut 'rubble'); an open one there is shut at its own door */
    var near = function (P, Q, D2) { var L = Math.hypot(Q[0] - P[0], Q[1] - P[1]); for (var s = 0; s <= L; s += 0.5) { var x = P[0] + (Q[0] - P[0]) * s / Math.max(L, 1e-6), z = P[1] + (Q[1] - P[1]) * s / Math.max(L, 1e-6);
      for (var b = 0; b < D2.blocks.length; b++) { var Bx = D2.blocks[b]; if (x > Bx[0] - 0.4 && x < Bx[1] + 0.4 && z > Bx[2] - 0.4 && z < Bx[3] + 0.4) return true; } } return false; };
    doors.forEach(function (D) {
      if (D.cut || (D.approach.kind !== 'steps' && D.approach.kind !== 'ramp')) return;
      var A = D.approach.a, B = D.approach.b, P = D.path.b;
      for (var j = 0; j < doors.length; j++) { var E = doors[j]; if (E === D || !E.blocks || E.mode !== 'door' || Math.hypot(E.x - D.x, E.z - D.z) > 200) continue;
        if (near(A, B, E) || near(B, P, E)) { D.cut = 'rubble'; counts.cut = (counts.cut || 0) + 1; if (D.mode === 'open') { D.mode = 'door'; D.climb = null; D.forced = false; blockOf(D); } break; } }
    });
    doors.forEach(function (D) {
      var T = o.towers[D.ti];
      /* an open tower stands plumb: its record's lean goes before anything is drawn (the hero, shell and rubble read it at draw time) */
      if (D.mode === 'open' && T.lean) { D.unleaned = T.lean; T.lean = 0; T.q = null; }
      if (D.mode === 'open') { open.push(D.id); counts.open++; } else counts[D.mode]++;
      var bs = counts.byState[D.state] || (counts.byState[D.state] = { n: 0, open: 0 }); bs.n++; if (D.mode === 'open') bs.open++;
      /* the route: the approach, across the plinth to the door, in, and (open or stair) up the stair */
      var Ap = D.approach, r = [];
      if (Ap.kind === 'steps' || Ap.kind === 'ramp') { r.push([Ap.a[0] + D.nx * -0.05, Ap.a[1] + D.nz * -0.05, Ap.a[2]]); r.push([Ap.b[0], Ap.b[1]]); }
      /* in through the door; then (a climb) radially in to a circle just outside the stair's box, round it to the bearing of the stair's A end,
         and in to that end: a portal can stand 60 degrees off the street's normal, and a turn made at the skin clips the wall beside the door */
      r.push([D.x + D.nx * 1.0, D.z + D.nz * 1.0]); r.push([D.x, D.z]);
      if (!D.climb) r.push([D.x - D.nx * 1.5, D.z - D.nz * 1.5]);
      if (D.climb) {
        var S2 = D.climb.stair, ae = -S2.L / 2 - 1.2, SP = function (al, ac) { var q = S2.ax === 0 ? [S2.su + al, S2.sv + ac] : [S2.su + ac, S2.sv + al]; return AV.doorWorld(T, q[0], q[1]); };
        var cu = S2.su, cv = S2.sv, rIn = Math.hypot(S2.L / 2, S2.W / 2) + 1.5, dl0 = toLocal(T, D.x - T.x, D.z - T.z), a0 = Math.atan2(dl0[1] - cv, dl0[0] - cu);
        var tgt = S2.ax === 0 ? [cu + ae, cv] : [cu, cv + ae], a1 = Math.atan2(tgt[1] - cv, tgt[0] - cu), da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0)), ns = Math.max(1, Math.ceil(Math.abs(da) / 0.25));
        var ring = function (a) { return AV.doorWorld(T, cu + Math.cos(a) * rIn, cv + Math.sin(a) * rIn); };
        for (var si = 0; si <= ns; si++) r.push(ring(a0 + da * si / ns));
        r.push(SP(ae, 0));
        D.climb.route.forEach(function (q) { var w = AV.doorWorld(T, q[0], q[1]); r.push([w[0], w[1], T.y + q[2]]); });
      }
      D.route = r;
    });
    return { doors: doors, open: open, counts: counts, fallen: o.fallen || [] };
  };
  /* a door's blocking (its mode door or stair): a heap against the skin across the doorway and blocks along its line; or a heap on the
     stair's B landing under the choke's floor and blocks across it. The page calls it too, for a door it shuts (76: an inner wall on the way) */
  AV.doorBlocks = function (D, T, seed) {
      D.heap = null; D.blocks = null;
      if (D.mode === 'door') {
        var hc = [D.x + D.nx * 2.2, D.z + D.nz * 2.2];
        D.heap = { id: D.id + '.heap', x: hc[0], z: hc[1], y0: D.y, rx: D.w / 2 + 2, rz: 2.8, ry: Math.atan2(D.tz, D.tx), h: 3.8, lumps: 4, blocks: 7, size: [0.8, 2.4], cover: 1.1, seed: KR.hash(seed, D.ti, 601) };
        D.blocks = []; for (var q = -D.w / 2 - 0.5; q <= D.w / 2 + 0.5; q += 0.5) { var bx = D.x + D.tx * q, bz = D.z + D.tz * q; D.blocks.push([bx - 0.3, bx + 0.3, bz - 0.3, bz + 0.3, D.y - 1, D.y + 5]); }
      } else if (D.mode === 'stair') {
        var Cb = D.climb, S = Cb.stair, k = D.choke - 1, fl = Cb.floors, ym = fl[k].y + (fl[k + 1].y - fl[k].y) / 2;
        var bu = S.ax === 0 ? S.su + (S.L / 2 - 0.65) : S.su, bv = S.ax === 0 ? S.sv : S.sv + (S.L / 2 - 0.65), w = AV.doorWorld(T, bu, bv);
        D.heap = { id: D.id + '.choke', x: w[0], z: w[1], y0: T.y + ym, rx: 2.2, rz: 1.8, ry: (T.yaw || 0), h: 2.6, lumps: 3, blocks: 5, size: [0.6, 1.8], cover: 0.9, seed: KR.hash(seed, D.ti, 603) };
        /* blocks across the B landing and the head of the first flight, from the landing up */
        D.blocks = []; for (var al = S.L / 2 - LAND - 1.2; al <= S.L / 2; al += 0.5) for (var ac = -S.W / 2; ac <= S.W / 2; ac += 0.5) {
          var pu = S.ax === 0 ? S.su + al : S.su + ac, pv = S.ax === 0 ? S.sv + ac : S.sv + al, pw = AV.doorWorld(T, pu, pv);
          D.blocks.push([pw[0] - 0.3, pw[0] + 0.3, pw[1] - 0.3, pw[1] + 0.3, T.y + ym - 1.2, T.y + ym + 3]); }
      }
  };
  /* the ground part of a door's route (every leg before the climb's first point) against boxes in plan: the first leg a walker of radius r
     standing on it would overlap one of them, or -1 */
  AV.routeHits = function (route, boxes, r) {
    r = r == null ? 0.35 : r;
    for (var i = 1; i < route.length; i++) {
      if (route[i].length > 2) break; var a = route[i - 1], b = route[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / 0.25));
      for (var j = 0; j <= n; j++) { var x = a[0] + (b[0] - a[0]) * j / n, z = a[1] + (b[1] - a[1]) * j / n;
        for (var k = 0; k < boxes.length; k++) { var B = boxes[k], cx = Math.max(B[0], Math.min(x, B[1])), cz = Math.max(B[2], Math.min(z, B[3])); if ((x - cx) * (x - cx) + (z - cz) * (z - cz) < r * r) return i; } }
    }
    return -1;
  };
  /* a fallen tower's shaft sections (kits/metropolis 40 MP.debrisPlan, drawn by 57: a hollow tube laid on its side, crushed to 0.42 of its height,
     its ends open) are not a place to walk into (the owner walked into one at -450, 424 and read its stretched inner face as shells inside a tower):
     each is blocked along its axis, boxes of 0.75 of its radius every 0.8 of it, from under the ground to over its crushed top. The debris lies in the
     tower's frame at its plinth, in the plan's frame (70 avDebris, turned by -yaw in three's sense). plan(F, state) is MP.debrisPlan */
  AV.fallenBlocks = function (towers, family, plan) {
    var out = [];
    towers.forEach(function (T) {
      if (T.state !== 'fallen') return; var F = family(T.family); if (!F) return; var P = null; try { P = plan(F, 'fallen'); } catch (e) { P = null; } if (!P) return;
      P.pieces.forEach(function (pc) {
        if (pc.kind !== 'shaft') return; var r = pc.r, du = Math.cos(pc.ry), dv = Math.sin(pc.ry), st = Math.max(1, r * 0.8), hw = r * 0.75, top = T.y + r * 0.42 * 0.55 + r * 0.42 + 0.5;
        for (var s = -pc.len / 2; s <= pc.len / 2 + 1e-6; s += st) { var w = AV.doorWorld(T, pc.x + du * s, pc.z + dv * s); out.push([w[0] - hw, w[0] + hw, w[1] - hw, w[1] + hw, T.y - 1, top]); }
      });
    });
    return out;
  };
  // ---------------------------------------------------------------- the records into a core/walk registry (the page's and the test's, the same)
  /* every approach a strip; an open or stair-blocked tower's plates, landings and flights; the rubble's blocks; with o.rubble (KRUBBLE) each heap's
     surface as polys. Returns the floor records by door id (AV's weak floors carry rec.weak = [door id, floor, piece]) */
  AV.lobbyWalk = function (W, LOB, towers, o) {
    o = o || {}; var out = { floors: 0, blocks: 0, fallen: 0, weak: [], heaps: [] };
    (LOB.fallen || []).forEach(function (b) { W.block(b, 'fallen-shaft'); out.fallen++; });
    LOB.doors.forEach(function (D) {
      var T = towers[D.ti], Ap = D.approach;
      if (Ap.kind === 'steps' || Ap.kind === 'ramp') { W.strip({ a: Ap.a, b: Ap.b, w: Ap.w, name: D.id + '.approach', tag: 'approach' }); out.floors++; }
      if (D.climb) {
        var C = D.climb, nF = D.mode === 'stair' ? D.choke + 1 : C.floors.length, wpt = function (q, y) { var w = AV.doorWorld(T, q[0], q[1]); return [w[0], w[1], y]; };
        for (var k = 0; k < nF; k++) C.plates[k].forEach(function (pc, j) {
          var rec = W.poly({ pts: pc.pts.map(function (q) { return wpt(q, T.y + pc.y); }), name: D.id + '.floor' + k + '.' + pc.end, tag: pc.weak ? 'weak' : 'plate' }); out.floors++;
          if (pc.weak && D.mode === 'open') { rec.weak = [D.id, k, j]; out.weak.push(rec); }
        });
        C.landings.forEach(function (Ld) { if (Ld.k >= nF) return; W.poly({ pts: Ld.pts.map(function (q) { return wpt(q, T.y + Ld.y); }), name: D.id + '.landing' + Ld.k + Ld.end, tag: 'stair' }); out.floors++; });
        C.flights.forEach(function (Fl) { if (Fl.k >= nF - 1) return; var a = AV.doorWorld(T, Fl.a[0], Fl.a[1]), b = AV.doorWorld(T, Fl.b[0], Fl.b[1]);
          W.strip({ a: [a[0], a[1], T.y + Fl.a[2]], b: [b[0], b[1], T.y + Fl.b[2]], w: Fl.w, name: D.id + '.flight' + Fl.k + '.' + Fl.n, tag: 'stair' }); out.floors++; });
      }
      (D.blocks || []).forEach(function (b) { W.block(b, 'rubble'); out.blocks++; });
      if (D.heap && o.rubble) { var H = o.rubble.heap(D.heap); out.heaps.push(H); o.rubble.walkTris(H, 2).forEach(function (t) { try { W.poly({ pts: t.map(function (p) { return [p[0], p[1], p[2]]; }), name: H.id, tag: 'rubble' }); out.floors++; } catch (e) { } }); }
    });
    return out;
  };
  // ---------------------------------------------------------------- a tower's walls: its ground outline as blocks, open only at its door
  /* The outline in the tower's frame: a design hero's own (kits/metropolis 54 records its lobby's ground outline as userData.walk: [{pts, doors,
     closed}]); the Spindle's skirt and its root fins, the Ledger's arcade glass and end walls, from their records (as kits/metropolis 56
     towerBlocks reads them). AV.towerOutlines(F, skin, heroWalk) -> [{pts, closed, t}] (t a half thickness) */
  AV.towerOutlines = function (F, skin, heroWalk) {
    if (heroWalk && heroWalk.length) return heroWalk.map(function (o) { return { pts: o.pts, closed: !!o.closed, t: 0.55 }; });
    var out = [], fp = F.footprint || {};
    if (F.core && F.core.kind === 'round' && !F.design) {
      var s15 = skin(F, 1.5).r, r = (s15 != null ? s15 : fp.r != null ? fp.r : 30) - 0.6, P = [], N = Math.max(16, Math.ceil(2 * Math.PI * r / 2));
      for (var i = 0; i < N; i++) { var a = 2 * Math.PI * i / N; P.push([Math.cos(a) * r, Math.sin(a) * r]); }
      out.push({ pts: P, closed: true, t: 0.55 });
      if (F.fins) for (var f = 0; f < F.fins.n; f++) { var fa = F.fins.a0 + f * 2 * Math.PI / F.fins.n, r1 = r + F.fins.out + 1; out.push({ pts: [[Math.cos(fa) * r, Math.sin(fa) * r], [Math.cos(fa) * r1, Math.sin(fa) * r1]], closed: false, t: Math.max(0.55, F.fins.t / 2) }); }
      return out;
    }
    /* a round design without its hero's outline: a circle at its skin (envR at the walker's height, else the footprint's radius) */
    if (fp.shape !== 'rect' && (fp.r != null || F.envR)) {
      var rc = (skin(F, 1).r != null ? skin(F, 1).r : fp.r), Q = [], M = Math.max(16, Math.ceil(2 * Math.PI * rc / 2));
      for (var m = 0; m < M; m++) { var b = 2 * Math.PI * m / M; Q.push([Math.cos(b) * rc, Math.sin(b) * rc]); }
      out.push({ pts: Q, closed: true, t: 0.55 }); return out;
    }
    var hw = fp.w == null ? 30 : fp.w / 2, hd = fp.d == null ? 30 : fp.d / 2, dep = F.arcade ? F.arcade.depth : 0;
    out.push({ pts: [[-hw, -(hd - dep)], [hw, -(hd - dep)], [hw, hd - dep], [-hw, hd - dep]], closed: true, t: 0.55 });
    return out;
  };
  /* the blocks: a box every 1.5 m along each outline (0.8 m half-width, so neighbours overlap at any bearing: no gap a walker of 0.35 m fits
     through), from under the plinth to over the lobby; none in the door's corridor of an open or stair-blocked tower (the door's width, from 6 m
     inside it out to the street: a hero's lobby outline can stand metres outside the skin radius the door was set on). A door-blocked tower is
     shut all round */
  AV.towerWalls = function (T, outlines, D, o) {
    o = o || {}; var y0 = T.y - 1, y1 = T.y + (o.h == null ? 6 : o.h), out = [], open = D && (D.mode === 'open' || D.mode === 'stair'), sp = o.step == null ? 1.5 : o.step;
    outlines.forEach(function (O) {
      var P = O.pts.concat(O.closed ? [O.pts[0]] : []), t = Math.max(O.t, sp / 2 + 0.05);
      for (var i = 0; i + 1 < P.length; i++) {
        var p = P[i], q = P[i + 1], k = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / sp));
        for (var j = 0; j < k; j++) {
          var w = AV.doorWorld(T, p[0] + (q[0] - p[0]) * j / k, p[1] + (q[1] - p[1]) * j / k);
          /* the corridor flares inside the door (a metre wider for each metre in), as the way turns toward the stair */
          if (open) { var dx = w[0] - D.x, dz = w[1] - D.z, dn = dx * D.nx + dz * D.nz; if (Math.abs(dx * D.tx + dz * D.tz) < D.w / 2 + t + 0.3 + Math.max(0, -dn) && dn > -6 && dn < 30) continue; }
          out.push([w[0] - t, w[0] + t, w[1] - t, w[1] + t, y0, y1]);
        }
      }
    });
    return out;
  };
  // ---------------------------------------------------------------- walking a route with the camera's rules
  AV.walkRoute = function (W, ground, pts, o) {
    o = o || {}; var step = o.step == null ? STEP_UP : o.step, drop = o.drop == null ? DROP : o.drop, r = o.r == null ? 0.35 : o.r, h = o.h == null ? 1.7 : o.h, ds = o.ds == null ? 0.25 : o.ds;
    var at = function (x, z, y) { var g = ground(x, z), f = W.floorBelow(x, z, y, step); return f && f[0] >= g - 0.3 ? f[0] : g; };
    /* the start: o.y0, else the first point's own height (an approach's foot on the pavement), else what stands there */
    var y = o.y0 != null ? o.y0 : pts[0].length > 2 ? pts[0][2] : at(pts[0][0], pts[0][1], 1e9);
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / ds));
      for (var j = 1; j <= n; j++) {
        var x = a[0] + (b[0] - a[0]) * j / n, z = a[1] + (b[1] - a[1]) * j / n, ny = at(x, z, y);
        if (ny - y > step + 1e-6) return { ok: false, i: i, y: y, why: 'a step of ' + (ny - y).toFixed(2) + ' m', at: [x, z] };
        if (y - ny > drop + 1e-6) return { ok: false, i: i, y: y, why: 'a drop of ' + (y - ny).toFixed(2) + ' m', at: [x, z] };
        var bk = W.blocked(x, ny, z, r, h); if (bk) return { ok: false, i: i, y: ny, why: 'blocked', tag: bk.tag, at: [x, z] };
        y = ny;
      }
      if (b.length > 2 && Math.abs(y - b[2]) > 0.75) return { ok: false, i: i, y: y, why: 'off the route by ' + (y - b[2]).toFixed(2) + ' m', at: [b[0], b[1]] };
    }
    return { ok: true, i: pts.length, y: y };
  };
})();
