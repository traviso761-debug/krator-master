// ================================================================= SPAN — the layout's rules ([G data])
// Plain functions on SPAN_LAYOUT's records (30-span-layout.js): the geometry, the checks the plan names (PLAN.md
// section 6: parts disjoint on each level, every gallery on its bench, every bridge's ends on its walls, rim things on
// the rim, floor things on the floor, the portals in their walls, the ways clear of the parts, the walk graph, the
// hold's gated boundary, the size), the floor area, the decay seeds and the frame. Needs core/rand (KRAND) and
// core/space (KSPACE); core/tags (KTAGS) for SPAN.tags. No THREE, no DOM: test-span.js runs it in node.
//
//   SPAN.byId(L)                     {id: part | way}
//   SPAN.bbox(shape)                 [u0, u1, v0, v1]
//   SPAN.inShape(shape, u, v, pad)   is (u, v) inside the shape (grown by pad)
//   SPAN.overlap(a, b)               do two parts' footprints overlap (touching is not overlap)
//   SPAN.checks(L)                   [{name, pass, detail}]: every rule, in order
//   SPAN.graph(L, {shut})            {adj, edges}: the walk graph (links and in -> parent); shut: closed gates are not passable
//   SPAN.reach(L, from, opt)         the set of ids a walker reaches from `from`
//   SPAN.area(L)                     {floor, people, rows}: floor m2 and people at the peak, part by part
//   SPAN.seed(world, part)           the part's seed: KRAND.child(world, id). SPAN.draw(world, part, i, salt) -> [0,1)
//   SPAN.toWorld(F, u, v, y)         [x, y, z] in the world; F = {x, z, ang (the u axis's bearing, rad, from +x toward +z), y0}
//   SPAN.fromWorld(F, x, y, z)       [u, v, y]
//   SPAN.tags(L, F, T)               every part registered in T (a KTAGS.create registry) at its world place
(function(root){
'use strict';
var R = typeof globalThis !== 'undefined' ? globalThis : root;
var STATES = ['intact', 'ruined', 'toppled', 'rehab', 'worn'];
var EPS = .01;

function byId(L){ var m = {}; L.parts.forEach(function(p){ m[p.id] = p; }); L.ways.forEach(function(w){ m[w.id] = w; }); return m; }
function bbox(s){
  if (s[0] === 'box') return [s[1], s[2], s[3], s[4]];
  if (s[0] === 'circ') return [s[1] - s[3], s[1] + s[3], s[2] - s[3], s[2] + s[3]];
  return [s[1] - s[3], s[1] + s[3], s[2] - s[4], s[2] + s[4]];
}
function inShape(s, u, v, pad){
  pad = pad == null ? 0 : pad;
  if (s[0] === 'box') return u >= s[1] - pad && u <= s[2] + pad && v >= s[3] - pad && v <= s[4] + pad;
  if (s[0] === 'circ') return Math.hypot(u - s[1], v - s[2]) <= s[3] + pad;
  var a = s[3] + pad, b = s[4] + pad, du = (u - s[1]) / a, dv = (v - s[2]) / b; return du * du + dv * dv <= 1;
}
// points round a shape's outline (and its centre): what containment and the sampled tests read
function outline(s, n){
  n = n == null ? 32 : n; var out = [], i, t;
  if (s[0] === 'box'){
    for (i = 0; i < n; i++){ t = i / n * 4; var k = Math.floor(t), f = t - k;
      out.push(k === 0 ? [s[1] + f * (s[2] - s[1]), s[3]] : k === 1 ? [s[2], s[3] + f * (s[4] - s[3])] : k === 2 ? [s[2] - f * (s[2] - s[1]), s[4]] : [s[1], s[4] - f * (s[4] - s[3])]); }
    out.push([(s[1] + s[2]) / 2, (s[3] + s[4]) / 2]); return out;
  }
  var a = s[0] === 'circ' ? s[3] : s[3], b = s[0] === 'circ' ? s[3] : s[4];
  for (i = 0; i < n; i++){ t = i / n * 2 * Math.PI; out.push([s[1] + a * Math.cos(t), s[2] + b * Math.sin(t)]); }
  out.push([s[1], s[2]]); return out;
}
function inside(child, parent){ return outline(child, 48).every(function(q){ return inShape(parent, q[0], q[1], EPS); }); }
function overlap(a, b){
  var A = a.shape, Bs = b.shape, ba = bbox(A), bb = bbox(Bs);
  if (ba[0] >= bb[1] - EPS || bb[0] >= ba[1] - EPS || ba[2] >= bb[3] - EPS || bb[2] >= ba[3] - EPS) return false;
  if (A[0] === 'box' && Bs[0] === 'box') return true;
  if (A[0] === 'circ' && Bs[0] === 'circ') return Math.hypot(A[1] - Bs[1], A[2] - Bs[2]) < A[3] + Bs[3] - EPS;
  if (A[0] !== 'oval' && Bs[0] !== 'oval'){
    var c = A[0] === 'circ' ? A : Bs, x = A[0] === 'box' ? A : Bs;
    var qu = Math.max(x[1], Math.min(c[1], x[2])), qv = Math.max(x[3], Math.min(c[2], x[4]));
    return Math.hypot(qu - c[1], qv - c[2]) < c[3] - EPS;
  }
  // an oval with anything: sampled both ways (a deck and what stands beside it)
  return outline(A, 96).some(function(q){ return inShape(Bs, q[0], q[1], -EPS); }) || outline(Bs, 96).some(function(q){ return inShape(A, q[0], q[1], -EPS); });
}
function band(p){ return [p.y, p.y + Math.max(p.h, 1)]; }
function bandsMeet(a, b){ var x = band(a), y = band(b); return x[0] < y[1] - EPS && y[0] < x[1] - EPS; }
function halfAt(L, y){ var h = L.half[String(y)]; return h == null ? null : h; }
function nearestLevel(L, y){ var best = null; Object.keys(L.half).forEach(function(k){ if (best == null || Math.abs(+k - y) < Math.abs(best - y)) best = +k; }); return best; }

// is (u, v) open canyon at the rim (no ground to stand on at y 0)?
function canyonAt(L, u, v){
  var bay = L.bay, hd = L.canyon.head;
  if (u >= L.reach[0] && u <= L.reach[1] && Math.abs(v) < L.half['0'] - EPS) return true;
  if (inShape(['oval', bay.c[0], bay.c[1], bay.rim[0], bay.rim[1]], u, v, -EPS)) return true;
  if (u >= hd[0][0] && u <= hd[1][0]){ var w = hd[0][1] + (hd[1][1] - hd[0][1]) * (u - hd[0][0]) / (hd[1][0] - hd[0][0]); if (Math.abs(v) < w) return true; }
  if (u >= -300 && u <= L.reach[0] && Math.abs(v) < L.half['0'] - EPS) return true;
  return false;
}

// ---------------------------------------------------------------- the ground the layout needs (the stand-in, and the station's spec)
// SPAN.groundAt(L, u, v): the height the arcology stands on, from the layout's section alone: the tableland at y 0, the lake's
// bed, the outlet over the weir, the canyon head, the Upper Bay (its terrace at y -30, the Apron's rock at -46, the river's
// slot), the reach under the Cross, the Deep Reach stepped on its benches (L.half), the canyon on downstream, and the
// portals' cuttings (L.cuts). It is what the swhighlands station carves (PLAN.md section 5); until then the page draws it.
function inPoly(P, u, v){ var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++){ var a = P[i], b = P[j];
  if ((a[1] > v) !== (b[1] > v) && u < (b[0] - a[0]) * (v - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
function polyDist(P, u, v){ var d = Infinity; for (var i = 0, j = P.length - 1; i < P.length; j = i++){ var a = P[j], b = P[i], dx = b[0] - a[0], dy = b[1] - a[1],
  t = Math.max(0, Math.min(1, ((u - a[0]) * dx + (v - a[1]) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(a[0] + t * dx - u, a[1] + t * dy - v)); } return d; }
function floorAt(L, u){ var r = L.reach;
  if (u <= r[1] - 40) return L.levels.floor;
  if (u <= r[1] - 20) return L.levels.floor + (L.canyon.floorEnd - L.levels.floor) * (u - (r[1] - 40)) / 20;
  if (u <= r[1] + 10) return L.canyon.floorEnd;
  return L.canyon.floorEnd - 15 * Math.min(1, (u - r[1] - 10) / 420); }
function sectionAt(L, a, fy, k){ var H = L.half; k = k == null ? 1 : k;
  if (a < H['-180'] * k) return fy;
  if (a < H['-130'] * k) return Math.min(fy + 20 * (a - H['-180'] * k) / ((H['-130'] - H['-180']) * k), L.levels.b3);
  if (a < H['-85'] * k) return L.levels.b3;
  if (a < H['-40'] * k) return L.levels.b2;
  if (a < H['0'] * k) return L.levels.b1;
  return 0; }
// the rim's line at a v (L.rim: station 4's site record mapped into Span's frame, west to east, v falling), the ends held
function rimAt(L, v){ var R = L.rim; if (v >= R[0].v) return R[0];
  for (var i = 1; i < R.length; i++) if (v >= R[i].v){ var f = (v - R[i - 1].v) / (R[i].v - R[i - 1].v), a = R[i - 1], b = R[i];
    return { u: a.u + (b.u - a.u) * f, v: v, top: a.top + (b.top - a.top) * f, floor: a.floor + (b.floor - a.floor) * f }; }
  return R[R.length - 1]; }
function groundAt(L, u, v){
  var i, c, a = Math.abs(v), hd = L.canyon.head, bay = L.bay;
  for (i = 0; i < L.cuts.length; i++){ c = L.cuts[i].box; if (u >= c[0] && u <= c[1] && v >= c[2] && v <= c[3]) return L.cuts[i].y; }
  if (L.rim && L.rim.length){ var rm = rimAt(L, v), ap = L.apron, d = u - rm.u;   /* past station 4's rim (its site record, mapped): the apron, then the open floor */
    if (d >= 0){ if (!ap || d <= ap.d) return rm.floor; if (d >= ap.end) return ap.open; return rm.floor + (ap.open - rm.floor) * (d - ap.d) / (ap.end - ap.d); } }
  if (inPoly(L.lake.pts, u, v)) return Math.max(L.lake.bed, L.lake.level - .25 * polyDist(L.lake.pts, u, v));
  if (u >= -1050 && u < hd[0][0]) return a < 15 ? L.lake.level : 0;
  if (u >= hd[0][0] && u <= hd[1][0]){ var w = hd[0][1] + (hd[1][1] - hd[0][1]) * (u - hd[0][0]) / (hd[1][0] - hd[0][0]); if (a < w) return -60; }
  if (inShape(['oval', bay.c[0], bay.c[1], bay.rim[0], bay.rim[1]], u, v)){
    if (inShape(['oval', bay.c[0], bay.c[1], bay.apron[0], bay.apron[1]], u, v)) return a < 25 ? -60 - 50 * Math.max(0, Math.min(1, (u + 750) / 450)) : -46;
    return L.levels.bayTerrace; }
  if (u >= -300 && u < L.reach[0] && a < L.half['0']){ var fy = -110 - 70 * (u + 300) / 120;
    return a < L.half['-180'] ? fy : sectionAt(L, a, Math.max(fy, L.levels.b3), 1); }
  if (u >= L.reach[0] && u <= L.reach[1] + 10) return sectionAt(L, a, floorAt(L, u), 1);
  if (u > L.reach[1] + 10){ var k = 1 - .2 * Math.min(1, (u - L.reach[1]) / 380); return sectionAt(L, a, floorAt(L, u), k); }
  return 0; }

// ---------------------------------------------------------------- the walk graph
function graph(L, opt){
  opt = opt || {}; var adj = {}, edges = [], ids = byId(L);
  function add(a, b, o){ (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); edges.push([a, b, o || {}]); }
  L.links.forEach(function(k){ if (!(opt.shut && k[2].state === 'closed')) add(k[0], k[1], k[2]); });
  L.parts.forEach(function(p){ if (p.in) add(p.id, p.in, { kind: 'in' }); });
  return { adj: adj, edges: edges, ids: ids };
}
function reach(L, from, opt){
  var G = graph(L, opt), seen = {}, q = [from]; seen[from] = 1;
  while (q.length){ var a = q.shift(); (G.adj[a] || []).forEach(function(b){ if (!seen[b]){ seen[b] = 1; q.push(b); } }); }
  return seen;
}
function isHeld(x){ return !!(x && x.held); }

// ---------------------------------------------------------------- the size
function area(L){
  var rows = [], floor = 0, people = 0;
  L.parts.forEach(function(p){
    if (p.in || !p.st) return;
    var b = p.shape, fp = b[0] === 'box' ? (b[2] - b[1]) * (b[4] - b[3]) : b[0] === 'circ' ? Math.PI * b[3] * b[3] : Math.PI * b[3] * b[4];
    var f = fp * p.cover * p.st, h = f * p.home / L.m2PerHead; floor += f; people += h;
    rows.push({ id: p.id, name: p.name, footprint: fp * p.cover, st: p.st, floor: f, home: p.home, people: h });
  });
  return { floor: floor, people: people, rows: rows };
}

// ---------------------------------------------------------------- decay: one seed per part, never a stream's position
function seed(world, part){ return R.KRAND.child(world >>> 0, 'span:' + part.id); }
function draw(world, part, i, salt){ return R.KRAND.unit(R.KRAND.hash(seed(world, part), i | 0, salt == null ? 0 : salt | 0)); }

// ---------------------------------------------------------------- the frame
function toWorld(F, u, v, y){ var c = Math.cos(F.ang || 0), s = Math.sin(F.ang || 0); return [F.x + u * c - v * s, (F.y0 || 0) + y, F.z + u * s + v * c]; }
function fromWorld(F, x, y, z){ var c = Math.cos(F.ang || 0), s = Math.sin(F.ang || 0), dx = x - F.x, dz = z - F.z; return [dx * c + dz * s, -dx * s + dz * c, y - (F.y0 || 0)]; }

// ---------------------------------------------------------------- core/tags records
var CLASS = { bridge: 'infrastructure', weir: 'infrastructure', portal: 'infrastructure', ramp: 'infrastructure', pad: 'infrastructure', deck: 'infrastructure',
  ledge: 'infrastructure', tank: 'infrastructure', payload: 'prop', craft: 'prop', fallen: 'prop', bay: 'feature', mound: 'landmark', wall: 'infrastructure' };
function tags(L, F, T){
  var out = [];
  L.parts.forEach(function(p){
    var s = p.shape, cu = s[0] === 'box' ? (s[1] + s[2]) / 2 : s[1], cv = s[0] === 'box' ? (s[3] + s[4]) / 2 : s[2], at = toWorld(F, cu, cv, p.y);
    var tg = { culture: p.by === 'dalab' ? 'dalab' : p.by === 'highland' ? 'post-apoc' : 'ancient', state: p.state === 'worn' ? 'ruined' : p.state, part: p.kind };
    if (p.by === 'highland') tg.role = 'sw-highlanders';
    if (p.state === 'worn') tg.finish = 'worn';
    if (p.types) tg.types = p.types;
    if (p.held) tg.role = 'dalab-held';
    var rec = { id: 'span.' + p.id, class: p.in && p.kind !== 'dalab' ? 'part' : (CLASS[p.kind] || 'building'), kind: p.kind, key: p.key || null, name: p.name,
      at: at, ry: -(F.ang || 0), tags: tg, src: 'settlements/span/src/30-span-layout.js' };
    if (s[0] === 'box') rec.size = [s[2] - s[1], s[4] - s[3], Math.max(p.h, 1)]; else { rec.r = s[0] === 'circ' ? s[3] : Math.max(s[3], s[4]); rec.h = Math.max(p.h, 1); }
    out.push(T.add(rec));
  });
  return out;
}

// ---------------------------------------------------------------- the checks
function checks(L){
  var out = [], ids = byId(L);
  function ok(name, bad, detail){ out.push({ name: name, pass: bad.length === 0, detail: bad.slice(0, 4).join('; ') + (bad.length > 4 ? ' (+' + (bad.length - 4) + ')' : '') + (detail ? ' ' + detail : '') }); }
  // ids and vocabulary
  var seen = {}, dup = [];
  L.parts.concat(L.ways).forEach(function(x){ if (seen[x.id]) dup.push(x.id); seen[x.id] = 1; if (typeof x.id !== 'string' || !/^[a-z][a-z0-9_]*$/.test(x.id)) dup.push('bad id ' + x.id); });
  ok('every part and way has a unique, stable id', dup);
  ok('every part\'s state is the kit\'s (' + STATES.join(', ') + ') and its maker ancient, dalab or highland',
    L.parts.filter(function(p){ return STATES.indexOf(p.state) < 0 || (p.by !== 'ancient' && p.by !== 'dalab' && p.by !== 'highland'); }).map(function(p){ return p.id + ':' + p.state + '/' + p.by; }));
  // containment
  ok('every part with a parent lies inside it', L.parts.filter(function(p){ return p.in && (!ids[p.in] || !inside(p.shape, ids[p.in].shape)); }).map(function(p){ return p.id + ' in ' + p.in; }));
  // disjoint on each level: siblings (same parent) whose height bands meet must not overlap; core/space finds the candidates
  var S = R.KSPACE.create({ cell: 50 }), bad = [];
  L.parts.forEach(function(p){ if (p.kind === 'bay' || p.kind === 'enclosure') return; var b = bbox(p.shape); S.insert(p, (b[0] + b[1]) / 2, (b[2] + b[3]) / 2, Math.max(b[1] - b[0], b[3] - b[2]) / 2); });
  L.parts.forEach(function(p){
    if (p.kind === 'bay') return; var b = bbox(p.shape), cu = (b[0] + b[1]) / 2, cv = (b[2] + b[3]) / 2, r = Math.max(b[1] - b[0], b[3] - b[2]) / 2;
    S.query(cu, cv, r, []).forEach(function(q){
      if (q.id <= p.id || q.kind === 'bay' || (q.in || null) !== (p.in || null) || q.in === p.id || p.in === q.id) return;
      if (bandsMeet(p, q) && overlap(p, q)) bad.push(p.id + ' x ' + q.id);
    });
  });
  ok('no two parts overlap on one level', bad);
  // galleries and ledges on their benches
  ok('every gallery and service ledge stands on its bench, its back to the wall above', L.parts.filter(function(p){
    if (p.kind !== 'gallery' && p.kind !== 'ledge') return false;
    var lo = halfAt(L, p.y), up = { '-40': 0, '-85': -40, '-130': -85 }[String(p.y)], hi = up == null ? null : halfAt(L, up), s = p.shape;
    if (lo == null || hi == null || s[0] !== 'box') return true;
    var a = Math.min(Math.abs(s[3]), Math.abs(s[4])), b = Math.max(Math.abs(s[3]), Math.abs(s[4]));
    return Math.abs(a - lo) > EPS || Math.abs(b - hi) > EPS || s[1] < L.reach[0] - EPS || s[2] > L.reach[1] + EPS;
  }).map(function(p){ return p.id + ' at y ' + p.y; }));
  // bridges: a standing bridge's two ends on its level's walls; a toppled stub has one end on a wall
  ok('every bridge\'s ends are on its level\'s walls', L.parts.filter(function(p){
    if (p.kind !== 'bridge') return false;
    var lv = nearestLevel(L, p.y), h = halfAt(L, lv), s = p.shape;
    if (Math.abs(lv - p.y) > 5) return true;
    var e0 = Math.abs(Math.abs(s[3]) - h) <= 2, e1 = Math.abs(Math.abs(s[4]) - h) <= 2;
    return p.state === 'toppled' ? !(e0 || e1) : !(e0 && e1 && s[3] < 0 && s[4] > 0);
  }).map(function(p){ return p.id; }));
  // the rim: what stands at y 0 stands on rock, not over the canyon (bridges, the Cross and its towers span or bear on it)
  ok('pads, domes, ranges and sites at the rim stand on rock', L.parts.filter(function(p){
    if (p.y !== 0 || ['bridge', 'cross', 'gate', 'bay'].indexOf(p.kind) >= 0 || p.in) return false;
    return outline(p.shape, 32).some(function(q){ return canyonAt(L, q[0], q[1]); });
  }).map(function(p){ return p.id; }));
  // the bay's terrace domes: inside the bay's rim, clear of the Apron
  var bayRim = ['oval', L.bay.c[0], L.bay.c[1], L.bay.rim[0], L.bay.rim[1]], apron = ['oval', L.bay.c[0], L.bay.c[1], L.bay.apron[0], L.bay.apron[1]];
  ok('the bay\'s terrace domes stand in the bay, off the Apron', L.parts.filter(function(p){
    return /^bay_dome_/.test(p.id) && (!inside(p.shape, bayRim) || outline(p.shape, 32).some(function(q){ return inShape(apron, q[0], q[1], -EPS); }));
  }).map(function(p){ return p.id; }));
  // the floor: on the floor between the walls; hangars and portals cut into a wall from the floor's edge
  var fh = halfAt(L, L.levels.floor);
  ok('floor parts stand on the floor; hangars and portals are cut into a wall from its edge', L.parts.filter(function(p){
    if (p.y > L.levels.floor + EPS || p.y < L.canyon.floorEnd - EPS || p.kind === 'weir' && p.id === 'sluice') return false;
    var b = bbox(p.shape);
    if (p.kind === 'hangar' || p.kind === 'portal') return !(Math.abs(Math.min(Math.abs(b[2]), Math.abs(b[3])) - fh) <= EPS && b[2] * b[3] > 0);
    return b[2] < -fh - EPS || b[3] > fh + EPS || b[0] < L.reach[0] - 20 || b[1] > L.reach[1] + 20;
  }).map(function(p){ return p.id; }));
  // the tunnels' portals
  var bp = ids.basin_portal, vp = ids.valley_portal, bad2 = [];
  if (!bp || bp.y !== L.levels.apron) bad2.push('basin_portal not at the Apron\'s level');
  else { var du = (bp.shape[1] - L.bay.c[0]) / L.bay.rim[0], dv = (bp.shape[2] - L.bay.c[1]) / L.bay.rim[1], e = Math.sqrt(du * du + dv * dv); if (Math.abs(e - 1) > .05) bad2.push('basin_portal off the bay\'s wall (' + e.toFixed(3) + ')'); }
  if (!vp || vp.y !== L.levels.floor) bad2.push('valley_portal not on the floor');
  ['basin_tunnel', 'valley_tunnel'].forEach(function(t){ var w = ids[t], P = t === 'basin_tunnel' ? bp : vp;
    if (!w || !P || !inShape(P.shape, w.pts[0][0], w.pts[0][1], 1)) bad2.push(t + ' does not start at its portal'); });
  ok('the Basin Tunnel opens in the bay\'s wall at the Apron, the Valley Tunnel in the floor\'s wall', bad2);
  // the ways run clear of the parts they do not serve
  var linked = {}, bad3 = [];
  L.links.forEach(function(k){ linked[k[0] + '|' + k[1]] = linked[k[1] + '|' + k[0]] = 1; });
  L.ways.forEach(function(w){
    if (w.kind !== 'road' && w.kind !== 'walk') return;
    for (var i = 1; i < w.pts.length; i++){
      var a = w.pts[i - 1], b = w.pts[i], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2);
      for (var j = 0; j <= n; j++){
        var t = j / n, u = a[0] + t * (b[0] - a[0]), v = a[1] + t * (b[1] - a[1]), y = a[2] + t * (b[2] - a[2]);
        S.query(u, v, w.w / 2, []).forEach(function(p){
          if (linked[w.id + '|' + p.id] || p.kind === 'bay' || p.in || y < p.y - 1 || y > p.y + Math.max(p.h, 1) + 1) return;
          if (inShape(p.shape, u, v, w.w / 2 - EPS) && bad3.indexOf(w.id + ' x ' + p.id) < 0) bad3.push(w.id + ' x ' + p.id);
        });
      }
    }
  });
  ok('every road runs clear of the parts it does not serve', bad3);
  // the walk graph: every place a walker goes is reached from the Basin Tunnel (Dalab's way in) and the north highway
  var walkers = L.parts.filter(function(p){ return p.walk; }).map(function(p){ return p.id; });
  var fromBasin = reach(L, 'basin_tunnel'), fromNorth = reach(L, 'hw_north');
  ok('every walkable part is reached from the Basin Tunnel and from the north highway', walkers.filter(function(id){ return !fromBasin[id] || !fromNorth[id]; }));
  var dangling = L.links.filter(function(k){ return !ids[k[0]] || !ids[k[1]]; }).map(function(k){ return k[0] + '-' + k[1]; });
  ok('every link joins two known ids', dangling);
  // the hold: every way between what Dalab holds and what it does not passes a gate
  var G = graph(L);
  ok('every way out of Dalab\'s hold passes a named gate', G.edges.filter(function(e){ return isHeld(ids[e[0]]) !== isHeld(ids[e[1]]) && !e[2].gate; }).map(function(e){ return e[0] + '-' + e[1]; }));
  // with its closed gates shut, no way leads from inside the hold straight down to the floor (the Line holds)
  var G2 = graph(L, { shut: true }), inHold = {}, q = ['cross'], leak = []; inHold.cross = 1;
  while (q.length){ var a = q.shift(); (G2.adj[a] || []).forEach(function(b){
    if (b === 'floor_road'){ if (leak.indexOf(a) < 0) leak.push(a + ' -> floor'); return; }
    if (!inHold[b] && isHeld(ids[b])){ inHold[b] = 1; q.push(b); } }); }
  ok('with its gates shut, nothing in the hold opens onto the floor (the Line holds)', leak);
  // the ground: a part that stands on rock stands on SPAN.groundAt at its base (spans, hangs, wrecks, cuts and weirs aside)
  var SKIPG = { bridge: 1, payload: 1, craft: 1, fallen: 1, cross: 1, gate: 1, portal: 1, hangar: 1, weir: 1, ramp: 1, bay: 1, deck: 1 };
  ok('every part that stands on rock stands on the ground the layout gives (within 1.5 m)', L.parts.filter(function(p){
    if (p.in || p.on || SKIPG[p.kind] || p.state === 'toppled' && p.kind !== 'range') return false;
    var b = bbox(p.shape), pts = [];
    [.15, .5, .85].forEach(function(fu){ [.15, .5, .85].forEach(function(fv){ var u = b[0] + fu * (b[1] - b[0]), v = b[2] + fv * (b[3] - b[2]); if (inShape(p.shape, u, v)) pts.push([u, v]); }); });
    return pts.some(function(q){ return Math.abs(groundAt(L, q[0], q[1]) - p.y) > 1.5; });
  }).map(function(p){ var b = bbox(p.shape); return p.id + ' (y ' + p.y + ', ground ' + groundAt(L, (b[0] + b[1]) / 2, (b[2] + b[3]) / 2).toFixed(1) + ')'; }));
  // the pillars (station 4's towers): a part on one stands at its top and inside the flat square the site holds on it: every
  // corner within half its side less a metre of the middle (whatever the square's turn)
  var PIL = {}; (L.pillars || []).forEach(function(q){ PIL[q.id] = q; });
  ok('every part on a pillar stands on its top, inside its edge', L.parts.filter(function(p){ if (!p.on) return false; var q = PIL[p.on]; if (!q || !q.flat) return true;
    var b = bbox(p.shape), hw = q.flat / 2 - 1;
    return Math.abs(p.y - q.top) > .5 || [[b[0], b[2]], [b[0], b[3]], [b[1], b[2]], [b[1], b[3]]].some(function(c){ return Math.hypot(c[0] - q.u, c[1] - q.v) > hw; }); }).map(function(p){ return p.id; }));
  // the watch post sees the Cross: the line from its tower's top (17 m over the post) to the Cross's signal room clears the ground
  var wp = ids.watch_post, blocked = [];
  if (wp){ var a0 = [(wp.shape[1] + wp.shape[2]) / 2, (wp.shape[3] + wp.shape[4]) / 2, wp.y + 17], a1 = [-205, 170, 8];
    for (var si = 1; si < 400; si++){ var tt = si / 400, uu = a0[0] + (a1[0] - a0[0]) * tt, vv = a0[1] + (a1[1] - a0[1]) * tt, yy = a0[2] + (a1[2] - a0[2]) * tt;
      if (groundAt(L, uu, vv) > yy - .5){ blocked.push('ground at (' + Math.round(uu) + ', ' + Math.round(vv) + ')'); break; } } }
  ok('the watch post sees the Cross\'s signal room over the ground', wp ? blocked : ['no watch_post']);
  // the size the owner chose (2026-10-27)
  var A = area(L);
  ok('the floor at the peak is the trimmed size (700,000-850,000 m2) and its people 8,000-10,500',
    A.floor < 7e5 || A.floor > 8.5e5 || A.people < 8000 || A.people > 10500 ? ['floor ' + Math.round(A.floor) + ', people ' + Math.round(A.people)] : [],
    '(' + Math.round(A.floor) + ' m2, ' + Math.round(A.people) + ' people)');
  return out;
}

R.SPAN = { STATES: STATES, rimAt: rimAt, byId: byId, bbox: bbox, inShape: inShape, outline: outline, inside: inside, overlap: overlap, canyonAt: canyonAt,
  groundAt: groundAt, floorAt: floorAt, inPoly: inPoly, graph: graph, reach: reach, area: area, seed: seed, draw: draw, toWorld: toWorld, fromWorld: fromWorld, tags: tags, checks: checks };
})(this);
