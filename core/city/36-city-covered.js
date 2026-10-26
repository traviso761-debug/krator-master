/* ============================== 36. COVERED WAYS: tunnels between doors ============================== */
/* [G data] Pure functions and plain arrays only: no THREE, no DOM, no draws (nothing random). A covered way is the
   half-buried, roofed passage the Khaayken run between their buildings for warm travel in winter (kits/yeti/PLAN.md
   section 3): a way kind beside avenue, main, side, alley, highway and lane, `cls: 'covered'`, added for that kit
   (the owner, 2026-10-25; core/city/PLAN.md, "Covered ways"). It is self-contained: it registers on KCITY when the
   module is loaded and makes the namespace when it is not, so a build may take this file alone (kits/yeti does; Voth
   and Verge do not list it, so their pages do not change).

     KCITY.covered(nodes, o) -> {ways, junctions}
       nodes  [{id, x, z}]: the doors to join (a passage mouth each), in any order (they are sorted by id)
       o      {w: inner width (1.7), section: 'full' | 'slab' | 'open' (the roof: whole, removable slabs on stone ribs,
               or the ribs alone), warmEvery: a warming dome every this many metres of run (80), endGap: no branch
               joins a way within this distance of a door (3), root: the id the network grows from (the first),
               blocked(ax, az, bx, bz) -> true when a straight run there is not allowed (a building in the way)}
       ways       [{id: 'cov:<n>', cls: 'covered', section, w, pts: [[x, z], ...], a, b, len}]: a and b are the ends'
                  ids (a door's id, or a junction's)
       junctions  [{id: 'cj:<n>', kind: 'junction' | 'warming', x, z}]: a junction where a branch meets a way (a small
                  dome over the crossing), a warming dome along a long run

   The method is greedy and deterministic: the network starts at the root door; then, again and again, the door
   nearest to the network joins it by the shortest run to a door already joined (the first only) or to a point on a
   way at least endGap from a door end, which splits that way at a new junction. A run that blocked() refuses is tried
   as an L by either corner; if both are refused it is laid straight and marked `blocked: true` for the caller. */
(function (root) {
  'use strict';
  var K = root.KCITY || (root.KCITY = { version: 1 });

  function closestOn(ax, az, bx, bz, px, pz) {
    var dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz, t = L2 > 0 ? ((px - ax) * dx + (pz - az) * dz) / L2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return { t: t, x: ax + dx * t, z: az + dz * t };
  }
  function plLen(pts) { var s = 0; for (var i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; }

  K.covered = function (nodes, o) {
    o = o || {};
    var w = o.w == null ? 1.7 : o.w, section = o.section || 'full', warmEvery = o.warmEvery == null ? 80 : o.warmEvery,
      endGap = o.endGap == null ? 3 : o.endGap, blocked = o.blocked || null;
    var N = nodes.slice().sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    var ways = [], junctions = [], isDoor = {}, done = {}, nWay = 0, nJ = 0;
    N.forEach(function (n) { isDoor[n.id] = n; });
    if (!N.length) return { ways: ways, junctions: junctions };
    var start = o.root != null && isDoor[o.root] ? isDoor[o.root] : N[0];
    done[start.id] = true;
    function addWay(pts, a, b, extra) {
      var wy = { id: 'cov:' + (nWay++), cls: 'covered', section: section, w: w, pts: pts, a: a, b: b, len: +plLen(pts).toFixed(3) };
      if (extra) for (var k in extra) wy[k] = extra[k];
      ways.push(wy); return wy;
    }
    /* the best attachment of door n: {d, x, z, way (index) or null, piece, s (arc length along the way)} */
    function attach(n) {
      var best = null, i, j;
      if (!ways.length) { best = { d: Math.hypot(n.x - start.x, n.z - start.z), x: start.x, z: start.z, way: null, to: start.id }; return best; }
      for (i = 0; i < ways.length; i++) {
        var W = ways[i], P = W.pts, s0 = 0, L = W.len;
        var lo = isDoor[W.a] ? endGap : 0, hi = isDoor[W.b] ? L - endGap : L;
        if (hi < lo) { lo = hi = L / 2; }
        for (j = 1; j < P.length; j++) {
          var seg = Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1]), c = closestOn(P[j - 1][0], P[j - 1][1], P[j][0], P[j][1], n.x, n.z);
          var s = s0 + c.t * seg;
          if (s < lo || s > hi) {   /* clamp along the way to the allowed stretch, then re-point */
            var sc = s < lo ? lo : hi;
            if (sc >= s0 && sc <= s0 + seg && seg > 0) { var tt = (sc - s0) / seg; c = { x: P[j - 1][0] + (P[j][0] - P[j - 1][0]) * tt, z: P[j - 1][1] + (P[j][1] - P[j - 1][1]) * tt }; s = sc; }
            else { s0 += seg; continue; }
          }
          var d = Math.hypot(n.x - c.x, n.z - c.z);
          if (!best || d < best.d - 1e-9) best = { d: d, x: c.x, z: c.z, way: i, piece: j, s: s };
          s0 += seg;
        }
      }
      return best;
    }
    function route(ax, az, bx, bz) {
      if (!blocked || !blocked(ax, az, bx, bz)) return { pts: [[ax, az], [bx, bz]] };
      var c1 = [ax, bz], c2 = [bx, az];
      if (!blocked(ax, az, c1[0], c1[1]) && !blocked(c1[0], c1[1], bx, bz)) return { pts: [[ax, az], c1, [bx, bz]] };
      if (!blocked(ax, az, c2[0], c2[1]) && !blocked(c2[0], c2[1], bx, bz)) return { pts: [[ax, az], c2, [bx, bz]] };
      return { pts: [[ax, az], [bx, bz]], blocked: true };
    }
    var left = N.filter(function (n) { return !done[n.id]; });
    while (left.length) {
      var pickN = null, pickA = null;
      for (var k = 0; k < left.length; k++) { var a = attach(left[k]); if (!pickA || a.d < pickA.d - 1e-9) { pickA = a; pickN = left[k]; } }
      var target;
      if (pickA.way == null) target = pickA.to;
      else {   /* split the way at a new junction */
        var W = ways[pickA.way], J = { id: 'cj:' + (nJ++), kind: 'junction', x: +pickA.x.toFixed(3), z: +pickA.z.toFixed(3) };
        junctions.push(J);
        var head = W.pts.slice(0, pickA.piece).concat([[J.x, J.z]]), tail = [[J.x, J.z]].concat(W.pts.slice(pickA.piece));
        var b = W.b; W.pts = head; W.b = J.id; W.len = +plLen(head).toFixed(3);
        addWay(tail, J.id, b, W.blocked ? { blocked: true } : null);
        target = J.id;
      }
      var r = route(pickN.x, pickN.z, pickA.x, pickA.z);
      addWay(r.pts, pickN.id, target, r.blocked ? { blocked: true } : null);
      done[pickN.id] = true;
      left = left.filter(function (n) { return !done[n.id]; });
    }
    /* warming domes along the long runs, evenly spaced, none closer than half a spacing to an end */
    if (warmEvery > 0) ways.forEach(function (W) {
      var n = Math.floor(W.len / warmEvery);
      for (var i = 1; i <= n; i++) {
        var s = W.len * i / (n + 1), P = W.pts, acc = 0;
        for (var j = 1; j < P.length; j++) {
          var seg = Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1]);
          if (acc + seg >= s) { var t = seg > 0 ? (s - acc) / seg : 0;
            junctions.push({ id: 'cj:' + (nJ++), kind: 'warming', x: +(P[j - 1][0] + (P[j][0] - P[j - 1][0]) * t).toFixed(3), z: +(P[j - 1][1] + (P[j][1] - P[j - 1][1]) * t).toFixed(3), way: W.id });
            break; }
          acc += seg;
        }
      }
    });
    return { ways: ways, junctions: junctions };
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
