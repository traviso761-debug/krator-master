/* ==================== core/world 48t: travel on the open world's links (S5) [G data] ==================== */
/* core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phase S5 (the owner, 2026-11-11): land logistics from the links a region
   bakes (48s-world-sites.js KSITES, plan/sites.json: each LINK's points with their heights, its length, its stops, and the
   bridges 42b laid on it). A road is not one number of minutes: each leg between two stops takes the time its own climbs
   and descents take at the column's pace; the inns and rest stops are where it spends the night; a journey between two
   sites with no link of their own goes by way of others. Plain data and pure functions: no three.js, no DOM, no draws.
     KTRAVEL.graph(plans, o?)   -> G   one or more baked plans (plan/sites.json's shape) joined: a node for every site and
                                       every stop, an edge for every stretch of a link between two of them (in road
                                       order), with its length, its climb and descent, its steepest grade, the bridges on
                                       it, and its flat-equivalent length each way (below). o.extra: more edges, in the
                                       same shape (a leg the plans do not lay yet, marked `planned`)
     KTRAVEL.legMinutes(e, dir, pace) -> minutes on the move along edge e (dir +1 from a to b, -1 back) at
                                       pace {kmDay, hours} (km a day on the flat and the hours a day the column marches)
     KTRAVEL.path(G, from, to, pace, o?) -> {from, to, legs: [{edge, a, b, length_m, up_m, down_m, minutes, bridges,
                                       planned?}], length_m, up_m, down_m, moving (minutes on the move), nights: [{at, kind:
                                       'inn' | 'rest' | 'camp', km}], days, minutes (door to door: the nights included)} |
                                       null when no road joins them. Least moving time (Dijkstra; ties by id). o.avoid: node
                                       ids not to pass through
     KTRAVEL.slopeK(s)          -> the pace factor on grade s (rise over run, +up): Tobler's hiking rule normalised to 1 on
                                       the flat: exp(-3.5 |s + 0.05|) / exp(-0.175); a column climbing 8 % keeps ~3/4 of
                                       its pace, one descending 5 % a little more than its flat pace
   THE NIGHTS. The column marches `hours` a day. At each stop it passes it looks at the next stop (or the journey's end):
   if that is beyond what today has left and it has marched half its day already, it stays here (an inn, or a rest
   stop); otherwise it goes on, and where its day runs out between stops it pitches a night camp. A journey's minutes
   are its nights x 1440 plus its last day's march, so a leg's carriers keep the hour they set out at. */
var KTRAVEL = (function () {
  'use strict';
  var T = {};
  T.slopeK = function (s) { return Math.exp(-3.5 * Math.abs(s + 0.05)) / Math.exp(-0.175); };
  function flatKm(pts, i0, i1, dir) {   /* the flat-equivalent km between point indices i0 < i1, walked in direction dir */
    var k = 0;
    for (var i = i0; i < i1; i++) {
      var a = pts[i], b = pts[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]); if (d <= 0) continue;
      var s = (b[2] - a[2]) / d * dir; k += d / 1000 / T.slopeK(s);
    }
    return k;
  }
  /* the point index nearest a distance along the road (the stops and bridges are placed by at_m / s0) */
  function cum(pts) { var c = [0]; for (var i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; }
  function idxAt(c, m) { var lo = 0, hi = c.length - 1; while (lo < hi) { var mid = (lo + hi) >> 1; if (c[mid] < m) lo = mid + 1; else hi = mid; } return lo; }
  T.graph = function (plans, o) {
    o = o || {};
    var G = { nodes: {}, edges: [], adj: {} }, node = function (n) { if (!G.nodes[n.id]) { G.nodes[n.id] = n; G.adj[n.id] = []; } return G.nodes[n.id]; };
    var add = function (e) { e.i = G.edges.length; G.edges.push(e); G.adj[e.a].push({ e: e.i, dir: 1, to: e.b }); G.adj[e.b].push({ e: e.i, dir: -1, to: e.a }); };
    (Array.isArray(plans) ? plans : [plans]).forEach(function (P) {
      (P.sites || []).forEach(function (S) { node({ id: S.id, kind: 'site', name: S.name, x: S.x, z: S.z, region: P.region }); });
      var bridges = P.bridges || [];
      (P.links || []).forEach(function (L) {
        var pts = L.pts, c = cum(pts), total = c[c.length - 1], scale = L.length_m > 0 && total > 0 ? L.length_m / total : 1;
        /* the stretch's stops, in road order: the start site, its stops, the end site */
        var marks = [{ id: L.from, m: 0 }].concat((L.stops || []).slice().sort(function (p, q) { return p.at_m - q.at_m; }).map(function (St) {
          node({ id: St.id, kind: St.kind, name: St.name, x: St.x, z: St.z, link: L.id, at_m: St.at_m, culture: St.culture }); return { id: St.id, m: St.at_m / scale };
        })).concat([{ id: L.to, m: total }]);
        if (!G.nodes[L.from] || !G.nodes[L.to]) return;
        for (var k = 0; k + 1 < marks.length; k++) {
          var i0 = idxAt(c, marks[k].m), i1 = idxAt(c, marks[k + 1].m); if (i1 <= i0) i1 = Math.min(pts.length - 1, i0 + 1);
          var up = 0, down = 0, mg = 0;
          for (var i = i0; i < i1; i++) { var dy = pts[i + 1][2] - pts[i][2], d = c[i + 1] - c[i]; if (dy > 0) up += dy; else down -= dy; if (d > 1) mg = Math.max(mg, Math.abs(dy) / d); }
          var m0 = c[i0] * scale, m1 = c[i1] * scale;
          add({ id: L.id + '#' + k, a: marks[k].id, b: marks[k + 1].id, link: L.id, m0: m0, m1: m1, length_m: m1 - m0, up_m: up, down_m: down, maxGrade: mg,
            fwd: flatKm(pts, i0, i1, 1) * scale, back: flatKm(pts, i0, i1, -1) * scale,
            bridges: bridges.filter(function (B) { return B.road === L.id && B.s0 >= c[i0] && B.s0 < c[i1]; }).map(function (B) { return B.id; }) });
        }
      });
    });
    (o.extra || []).forEach(function (e) { node(Object.assign({ kind: 'site' }, e.nodeA || { id: e.a })); node(Object.assign({ kind: 'site' }, e.nodeB || { id: e.b }));
      add({ id: e.id, a: e.a, b: e.b, link: e.link || e.id, m0: 0, m1: e.length_m, length_m: e.length_m, up_m: e.up_m || 0, down_m: e.down_m || 0, maxGrade: e.maxGrade || 0,
        fwd: e.fwd != null ? e.fwd : e.length_m / 1000, back: e.back != null ? e.back : e.length_m / 1000, bridges: [], planned: !!e.planned }); });
    return G;
  };
  T.legMinutes = function (e, dir, pace) { var kmH = pace.kmDay / pace.hours; return (dir > 0 ? e.fwd : e.back) / kmH * 60; };
  T.path = function (G, from, to, pace, o) {
    o = o || {};
    if (!G.nodes[from] || !G.nodes[to]) return null;
    var avoid = {}; (o.avoid || []).forEach(function (n) { avoid[n] = 1; });
    var dist = {}, prev = {}, done = {}, ids = Object.keys(G.nodes).sort();
    ids.forEach(function (n) { dist[n] = Infinity; }); dist[from] = 0;
    for (;;) {
      var u = null; for (var q = 0; q < ids.length; q++) { var n = ids[q]; if (!done[n] && dist[n] < Infinity && (u == null || dist[n] < dist[u])) u = n; }
      if (u == null || u === to) break; done[u] = 1;
      G.adj[u].forEach(function (A) { if (avoid[A.to] && A.to !== to) return; var w = dist[u] + T.legMinutes(G.edges[A.e], A.dir, pace); if (w < dist[A.to] - 1e-9) { dist[A.to] = w; prev[A.to] = { u: u, e: A.e, dir: A.dir }; } });
    }
    if (!(dist[to] < Infinity)) return null;
    var legs = [], n2 = to;
    while (n2 !== from) { var p = prev[n2], e = G.edges[p.e];
      legs.unshift({ edge: e.id, link: e.link, a: p.u, b: n2, length_m: e.length_m, up_m: p.dir > 0 ? e.up_m : e.down_m, down_m: p.dir > 0 ? e.down_m : e.up_m,
        minutes: T.legMinutes(e, p.dir, pace), bridges: e.bridges.slice(), planned: e.planned || undefined }); n2 = p.u; }
    /* the nights: march `hours` a day; stay at a stop when the next is out of today's reach and half the day is spent */
    var day = pace.hours * 60, used = 0, nights = [], km = 0, moving = 0;
    for (var i = 0; i < legs.length; i++) {
      var L = legs[i], left = L.minutes, kmPerMin = L.length_m / 1000 / L.minutes;
      while (used + left > day + 1e-6) {   /* the day runs out on this leg: a night camp where it ends */
        var go = day - used; left -= go; km += go * kmPerMin; moving += go; nights.push({ at: null, kind: 'camp', km: Math.round(km * 10) / 10, leg: L.edge }); used = 0;
      }
      used += left; moving += left; km += left * kmPerMin;
      var stop = G.nodes[L.b];
      if (i + 1 < legs.length && stop.kind !== 'site' && used + legs[i + 1].minutes > day && used >= day / 2) { nights.push({ at: L.b, kind: stop.kind, km: Math.round(km * 10) / 10 }); used = 0; }
      else if (i + 1 < legs.length && stop.kind === 'site' && used + legs[i + 1].minutes > day && used >= day / 2) { nights.push({ at: L.b, kind: 'site', km: Math.round(km * 10) / 10 }); used = 0; }
    }
    var sum = function (k) { return legs.reduce(function (s, l) { return s + l[k]; }, 0); };
    return { from: from, to: to, legs: legs, length_m: sum('length_m'), up_m: sum('up_m'), down_m: sum('down_m'), moving: moving, nights: nights, days: nights.length + 1,
      minutes: nights.length * 1440 + used };
  };
  return T;
})();
if (typeof globalThis !== 'undefined') globalThis.KTRAVEL = KTRAVEL;
