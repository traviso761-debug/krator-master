/* ============================== 5h5. THE PALACE'S DOORS ONTO ITS TERRACES ============================== */
/* [G data] The owner (2026-10-16): "there doesn't seem to be any exterior palace entrances aside from the dock level";
   "stairs may be blocking some of these entrances". The blueprint's sheets mark them: each sheet's `doors` (the garden
   doors at the service halls' ends, the upper terrace's) and its `entrance` rooms (tier 0's Water Gate, Gate of Carts,
   North Water Door and East Door). On the first storey of each tier (the one level with the terrace outside it) each
   becomes an exit as the suite's are (40b-vc-suites.js VC.suiteExit): a tunnel from the open floor nearest it inside,
   straight out through the tier's wall and its battered stone to the face (VC.faceOut), and a portal on the terrace there
   (VC.intEntrances draws it). An exit is kept only
   where the terrace is there to step onto and no canton flight runs across its landing; a blocked one slides along the
   wall (`TUNE.interiors.blueprintDoors.slide`) to the first clear spot, else it is dropped. Called from VC.bpFinish
   (40d-vc-blueprint.js) before the doors are found, so the rooms the tunnels cross give way and the search sees them. */
/* where the stone ends, out from the interior's wall along a line (at(r): the point r m out), at a door's height y: the
   tiers' faces are battered and banded, so the stone outside an interior's wall runs on 20 m and more; null if it never does */
VC.faceOut = function (M, at, r0, y, k) {
  /* solid stone at the door's own height (its floor to 3 m over it): a piece of the canton's stack (a tier's frustum, a
     slab, a cornice: CANT.read's M.stack, half-width hb at its foot to ht at its top) or a raised band on the terrace
     (M.bands). A cornice far overhead is no bar (tier 0 flares out 15 m under its top), a band at the door's feet is
     (the state floor's terrace has bands out to 199 m) */
  var y0 = y + 0.3, y1 = y + 3, ym = y + 1.5;
  var solid = function (x, z) {
    /* the captured canton's own pieces at the door's height (CANT.hits: their boxes; the state floor's terrace carries
       plinths of stone out to 198 m that the stack's records leave out) */
    if (CANT.grid && CANT.hits && CANT.hits([x - 0.3, x + 0.3, z - 0.3, z + 0.3, y0, y1]).some(function (Pq) { return Pq.M === M && !Pq.rail && !(CANT.cuts[M.n] && CANT.cuts[M.n][Pq.k]); })) return true;   /* (a piece cut from the canton is not drawn) */
    /* and the stack's tiers: a hollowed canton's grid no longer holds its frustums (tier 0's face, 199 m at a door's height) */
    var sq = CANT.sq(M, x, z);
    if ((M.stack || []).some(function (s) { if (s.y0 > y1 || s.y1 < y0) return false; var f = s.y1 > s.y0 ? Math.max(0, Math.min(1, (ym - s.y0) / (s.y1 - s.y0))) : 0; return sq <= s.hb + ((s.ht != null ? s.ht : s.hb) - s.hb) * f; })) return true;
    return (M.bands || []).some(function (b) { return x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1 && b.y > y0; });
  };
  /* past the last stone with 6 m clear beyond it (a gap between a tier and the plinths on its terrace is not the face), and
     3 m on, so the porch stands proud of the drawn face (the merged mesh runs a little outside the records) */
  var last = r0 - 0.5;
  for (var r = r0; r < r0 + 96; r += 0.5) { var q = at(r); if (solid(q[0], q[1])) last = r; else if (r - last >= 6) return last + 3; }
  return null;
};
VC.bpDoors = function (P, M, allSt) {
  var T = TUNE.interiors, BD = T.blueprintDoors || { slide: [0, 3, -3, 6, -6, 9, -9, 12, -12, 15, -15, 18, -18], land: 4, near: 8, reach: 60 };
  var C = VC.bpConf(M); if (!C) return '';
  var ax = P.axis, pv = [-ax[1], ax[0]], pt = function (u, v) { return [M.x + ax[0] * u + pv[0] * v, M.z + ax[1] * u + pv[1] * v]; };
  P.suite = P.suite || { rooms: {}, doors: [], exits: [], decor: [], keep: [] };
  var log = { made: 0, slid: 0, blocked: 0, noTerrace: 0, noFloor: 0, near: 0, oldBlocked: [] };
  var fl = (CANT.flights || []).filter(function (f) { return f.canton === M.n; }), flB = fl.map(function (f) { return CANT.flightBoxes(f); });
  /* is the landing in front of a door (outward from its outer point, a little wider than it) crossed by a flight? */
  var blocked = function (b, n, w, y) {
    var t = [-n[1], n[0]], xs = [], zs = [];
    [[0, -w / 2 - 1], [0, w / 2 + 1], [BD.land, -w / 2 - 1], [BD.land, w / 2 + 1]].forEach(function (q) { xs.push(b[0] + n[0] * q[0] + t[0] * q[1]); zs.push(b[1] + n[1] * q[0] + t[1] * q[1]); });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), z0 = Math.min.apply(null, zs), z1 = Math.max.apply(null, zs);
    return flB.some(function (L) { return L.some(function (s) { var q = s.box; return q[0] < x1 && q[1] > x0 && q[2] < z1 && q[3] > z0 && q[4] < y + 3 && q[5] > y - 0.5; }); });
  };
  /* the exits there already (the suite's) that a flight blocks: reported */
  P.suite.exits.forEach(function (D) { if (blocked([D.x, D.z], D.n, D.w || T.tunnelW, D.y)) log.oldBlocked.push(D.id); });
  allSt.forEach(function (o, si) {
    if (o.s.dungeon || o.s.j !== 0) return;
    var id = VC.bpSheet(C, o.t, o.s), sh = id && VC.PALACE_PLAN.sheets[id]; if (!sh) return;
    var S = P.storeys[si], R = S.R, Rw = R + T.wall + 0.6, w = T.tunnelW;
    var cands = (sh.doors || []).map(function (q) { return [q[0], q[1]]; }).concat(sh.rooms.filter(function (r) { return r[2] === 'entrance'; }).map(function (r) { return [(r[3] + r[4]) / 2, (r[5] + r[6]) / 2]; }));
    var open = P.halls.filter(function (h) { return h.storey === si && !h.nofloor && h.kind !== 'suite'; }).concat(P.tunnels.filter(function (h) { return (h.storey || 0) === si && !h.exit; }));
    var inOpen = function (x, z) { return open.some(function (h) { return x > h.x0 + 0.2 && x < h.x1 - 0.2 && z > h.z0 + 0.2 && z < h.z1 - 0.2; }); };
    cands.forEach(function (c) {
      /* the face: the one the point lies toward; along it, the lateral offset */
      var alongU = Math.abs(c[0]) >= Math.abs(c[1]), sg = (alongU ? c[0] : c[1]) >= 0 ? 1 : -1, n = alongU ? [ax[0] * sg, ax[1] * sg] : [pv[0] * sg, pv[1] * sg];
      var done = false;
      for (var k = 0; k < BD.slide.length && !done; k++) {
        var lat = (alongU ? c[1] : c[0]) + BD.slide[k], at = function (r) { return alongU ? pt(sg * r, lat) : pt(lat, sg * r); };
        if (Math.abs(lat) > R - w) continue;
        var rF = VC.faceOut(M, at, Rw, S.y, S.tier); if (rF == null) { if (k === 0) log.noTerrace++; continue; }
        /* the terrace there to step onto, past the face */
        var tq = at(rF + 2), ty = CANT.surface(M, tq[0], tq[1]); if (ty != null && ty < S.y - 1.5) { if (k === 0) log.noTerrace++; continue; }
        var outer = at(rF);
        /* an exit here already (the suite's, or one made just now) */
        if (P.suite.exits.some(function (D) { return D.storey === si && Math.hypot(D.x - outer[0], D.z - outer[1]) < BD.near; })) { log.near++; done = true; break; }
        /* the terrace outside, at this storey's floor */
        if (blocked(outer, n, w, S.y)) { if (k === 0) log.blocked++; continue; }
        /* inside: in from the wall to the first open floor */
        var rIn = null; for (var r = R - 0.5; r > R - BD.reach && r > 0; r -= 0.5) { var q = at(r); if (inOpen(q[0], q[1])) { rIn = r - 0.3; break; } }
        if (rIn == null) { if (k === 0) log.noFloor++; continue; }
        var a = at(rIn), tun = Object.assign({ y: S.y, h: Math.min(S.h, T.tunnelH + 1.5), kind: 'tunnel', storey: si, tier: S.tier, door: 'exit_' + P.n + '_' + P.suite.exits.length, exit: true, bp: true }, VC.intSeg(a, outer, w / 2));
        P.tunnels.push(tun);
        P.suite.exits.push({ id: tun.door, canton: P.n, kind: 'terrace', x: outer[0], z: outer[1], y: S.y, n: n.slice(), w: w, h: tun.h, storey: si, entrance: false, sheet: id });
        /* the rooms it crosses give way */
        P.rooms = P.rooms.filter(function (rm) {
          if (!rm.bp || rm.storey !== si || !VC.intOverlap(rm, tun, 0.05)) return true;
          var qq = VC.bpTrim(rm, [tun]); if (!qq || qq.x1 - qq.x0 < 2 || qq.z1 - qq.z0 < 2) return false;
          rm.x0 = qq.x0; rm.x1 = qq.x1; rm.z0 = qq.z0; rm.z1 = qq.z1; return true;
        });
        log.made++; if (k > 0) log.slid++; done = true;
      }
    });
  });
  P.bpLog.doors = log;
  return log.made + ' terrace doors (' + log.slid + ' slid clear of a flight, ' + log.blocked + ' blocked, ' + log.noTerrace + ' with no terrace, ' + log.noFloor + ' with no floor inside, ' + log.near + ' by an exit there already)' + (log.oldBlocked.length ? '; the suite\'s exits a flight crosses: ' + log.oldBlocked.join(', ') : '');
};
