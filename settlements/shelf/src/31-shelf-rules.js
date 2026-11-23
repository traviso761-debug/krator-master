// ================================================================= SHELF — the layout's rules ([G data])
// Plain functions on SHELF_LAYOUT's records (30-shelf-layout.js): the ground the shell stands on, the census, the Line, the checks the
// plan names (PLAN.md section 5), the seeds and the core/tags records. The stack's geometry, area, shapes and walk graph are the kit's
// (kits/ancients/cliff/10-cliff-stack.js, KCLIFF). Needs core/rand (KRAND), core/space (KSPACE) and KCLIFF. No THREE, no DOM:
// test-shelf.js runs it in node.
//
//   SHELF.groundAt(L, x, z)    the plateau's cut, the dressed face, the shelf, the lower escarpment, Dalab's plain
//   SHELF.faceZ(L, x)          the face line at x: 0 on the dressed face, receding beyond it
//   SHELF.area(L) / census(L) / lineLength(L) / checks(L) / tags(L, T); SHELF.seed(world, id), SHELF.draw(world, id, i, salt)
//   and KCLIFF's deckBox, deckFloor, reach, graph by the same names as Ledge's (SHELF.deckBox(L, d) ...)
(function(root){
'use strict';
var R = typeof globalThis !== 'undefined' ? globalThis : root;
var KC = R.KCLIFF, STATES = KC.STATES, BROKEN = KC.BROKEN, LIVED = KC.LIVED;
var BY = ['dalab', 'tungang', 'fellgang', 'none'];
var EPS = .01;
var smooth = function(a, b, x){ var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function deckBox(L, d){ return KC.deckBox(L.stack, d); }
function deckFloor(L, d){ return KC.deckFloor(L.stack, d); }
function broken(d){ return BROKEN.indexOf(d.state) >= 0; }
function byId(L){ var m = {}; L.decks.concat(L.parts, L.lifts, L.ways).forEach(function(x){ m[x.id] = x; }); return m; }

// ---------------------------------------------------------------- the ground (PLAN.md 5.2)
// the plateau: flat for `bench` behind the edge (the Ancients' cut), then rising as the Wall does, easing toward `top`
function rise(G, back){ var e = Math.max(0, back - G.bench) * G.rise, span = G.top - G.head; return span * (1 - Math.exp(-e / span)); }
// the shelf and what lies below it, by the distance out from the face (z): flat to shelfFlat, down to shelfEnd at shelfEdge, then the
// lower escarpment to the plain at plainZ (a smoothstep: steepest midway), and the plain falling slowly beyond
function below(G, z, n){
  if (z <= G.shelfFlat) return G.shelf;
  if (z <= G.shelfEdge) return G.shelf + (G.shelfEnd - G.shelf) * smooth(G.shelfFlat, G.shelfEdge, z);
  if (z <= G.plainZ) return G.shelfEnd + (G.plain - G.shelfEnd) * smooth(G.shelfEdge, G.plainZ, z) + 25 * n * Math.sin(Math.PI * (z - G.shelfEdge) / (G.plainZ - G.shelfEdge));
  return G.plain + (G.plainFar - G.plain) * Math.min(1, (z - G.plainZ) / 4000) + 8 * n;
}
function faceZ(L, x){ var G = L.ground, t = Math.max(0, Math.abs(x) - G.dressed); return -t * .1 - 24 * smooth(0, 300, t) * (R.KRAND.fbm(x / 400, 0, 5.1, 3, 4611) - .5) * 2; }
function natural(L, x, z){
  var G = L.ground, a = Math.abs(x), fz = faceZ(L, x), d = z - fz, n = R.KRAND.fbm(x / 110, z / 110, 2.3, 3, 4612) - .5;
  if (d <= 0){ var back = -d; return G.head + rise(G, back) + 30 * smooth(G.bench, G.bench + 600, back) * n + 5 * smooth(0, 60, back) * n * smooth(G.dressed + 500, G.dressed + 700, a); }
  var foot = below(G, Math.max(z, 0) + G.run, n);
  if (d < G.run){ var p = d / G.run, prof = 1 - Math.pow(1 - p, 2.2); return G.head + (foot - G.head) * prof + 18 * n * Math.sin(p * Math.PI); }
  return below(G, z, n) + 6 * n * smooth(G.dressed + 400, G.dressed + 800, a);
}
function dressed(L, x, z){
  var G = L.ground;
  if (z <= 0) return G.head + rise(G, -z) + 30 * smooth(G.bench, G.bench + 600, -z) * (R.KRAND.fbm(x / 110, z / 110, 2.3, 3, 4612) - .5);
  return below(G, z, R.KRAND.fbm(x / 110, z / 110, 2.3, 3, 4612) - .5);
}
/* the shelf runs on past the dressed face: within shelfLen of the middle the natural ground keeps it flat too (the bench the town spreads on) */
function groundAt(L, x, z){
  var G = L.ground, a = Math.abs(x), k = smooth(G.dressed + 60, G.dressed - 20, a);
  var hn = k >= 1 ? 0 : natural(L, x, z), hd = k <= 0 ? 0 : dressed(L, x, z), h = k >= 1 ? hd : k <= 0 ? hn : hd * k + hn * (1 - k);
  if (k < 1 && z > faceZ(L, x) + G.run && a < G.shelfLen){ var f = smooth(G.shelfLen, G.shelfLen - 150, a); h = h * (1 - f) + below(G, z, 0) * f; }
  return h;
}

// ---------------------------------------------------------------- the area, the census, the Line
function area(L){ return KC.area(L.stack, L.decks, L.zones); }
function census(L){
  var out = { total: 0, zones: {}, by: {} };
  L.zones.forEach(function(z){ out.zones[z.id] = 0; });
  L.decks.concat(L.parts).forEach(function(x){ if (!x.people) return; out.total += x.people; out.zones[x.zone] = (out.zones[x.zone] || 0) + x.people; out.by[x.by] = (out.by[x.by] || 0) + x.people; });
  return out;
}
function lineLength(L){
  var H = L.line.helix, A = L.line.approach, climb = H.y1 - H.y0, helix = climb / H.grade, app = 0, worst = 0;
  for (var i = 1; i < A.length; i++){ var run = Math.hypot(A[i][0] - A[i - 1][0], A[i][1] - A[i - 1][1]), dy = Math.abs(A[i][2] - A[i - 1][2]); app += run; worst = Math.max(worst, run > 0 ? dy / run : (dy > 0 ? Infinity : 0)); }
  return { helix: helix, turns: helix / (2 * Math.PI * H.r), approach: app, total: helix + app, climb: A[A.length - 1][2] - L.line.portal.y, worstApproach: worst, grade: H.grade };
}

// ---------------------------------------------------------------- seeds and tags
function seed(world, id){ return R.KRAND.child(world >>> 0, 'shelf:' + id); }
function draw(world, id, i, salt){ return R.KRAND.unit(R.KRAND.hash(seed(world, id), i | 0, salt == null ? 0 : salt | 0)); }
var CULT = { dalab: 'dalab', fellgang: 'fellgang', tungang: 'tungang', none: 'ancient' };
function tagState(s){ return LIVED.indexOf(s) >= 0 ? 'reclaimed' : s === 'gone' || s === 'pancaked' ? 'toppled' : 'ruined'; }
function tags(L, T){
  var out = [], src = 'settlements/shelf/src/30-shelf-layout.js';
  L.decks.forEach(function(d){ var b = deckBox(L, d);
    out.push(T.add({ id: 'shelf.' + d.id, class: 'building', kind: 'deck', key: null, name: 'deck ' + d.k + ' ' + d.wing.toUpperCase() + ' (' + d.state + ')',
      at: [(b.x0 + b.x1) / 2, b.y0, b.reach / 2], size: [b.x1 - b.x0, b.reach, b.y1 - b.y0],
      tags: { culture: 'ancient', state: tagState(d.state), finish: d.state, role: d.by === 'none' ? 'unheld' : d.by + '-held', part: 'deck' }, src: src })); });
  L.parts.forEach(function(p){ var b = KC.bbox(p.shape); if (!b) return;
    var tg = { culture: p.key && p.key.indexOf('anc:') === 0 ? 'ancient' : CULT[p.by] || 'ancient', state: tagState(p.state), finish: p.state, part: p.kind };
    if (p.key && p.key.indexOf('anc:') === 0 && p.by !== 'none') tg.role = p.by + '-held';
    out.push(T.add({ id: 'shelf.' + p.id, class: p.kind === 'yard' || p.kind === 'halting' || p.kind === 'terrace' ? 'feature' : p.kind === 'lifthall' || p.kind === 'station' ? 'infrastructure' : 'building',
      kind: p.kind, key: p.key || null, name: p.name, at: [(b[0] + b[1]) / 2, p.y, (b[2] + b[3]) / 2], size: [b[1] - b[0], b[3] - b[2], Math.max(p.h, 1)],
      ry: p.ry || 0, tags: tg, src: src })); });
  L.lifts.forEach(function(lf){ out.push(T.add({ id: 'shelf.' + lf.id, class: 'infrastructure', kind: lf.kind === 'car' ? 'lift' : 'lift-core', key: null, name: lf.name,
    at: [lf.x, lf.y0, lf.z], size: [lf.w, lf.d, lf.y1 - lf.y0], tags: { culture: 'ancient', state: lf.runs ? 'reclaimed' : 'ruined', part: 'lift', role: lf.by === 'none' ? 'unheld' : lf.by + '-held' }, src: src })); });
  L.heaps.forEach(function(h){ out.push(T.add({ id: 'shelf.' + h.id, class: 'prop', kind: 'rubble', key: null, name: 'the wreck of ' + h.of,
    at: [h.x, h.y0 == null ? L.ground.shelf : h.y0, h.z], r: Math.max(h.rx, h.rz), h: h.h, tags: { culture: 'ancient', state: 'toppled', part: 'rubble' }, src: src })); });
  return out;
}

// ---------------------------------------------------------------- the checks
function checks(L){
  var out = [], ids = byId(L), G = L.ground, S = L.stack;
  function ok(name, bad, detail){ out.push({ name: name, pass: bad.length === 0, detail: bad.slice(0, 4).join('; ') + (bad.length > 4 ? ' (+' + (bad.length - 4) + ')' : '') + (detail ? ' ' + detail : '') }); }
  var seen = {}, dup = [];
  L.decks.concat(L.parts, L.lifts, L.ways, L.heaps).forEach(function(x){ if (seen[x.id]) dup.push(x.id); seen[x.id] = 1; if (!/^[a-z][a-z0-9_.]*$/.test(x.id)) dup.push('bad id ' + x.id); });
  ok('every record has a unique, stable id', dup);
  ok('every deck and part has a known state and holder', L.decks.concat(L.parts).filter(function(x){ return STATES.indexOf(x.state) < 0 || BY.indexOf(x.by) < 0; }).map(function(x){ return x.id + ':' + x.state + '/' + x.by; }));
  ok('every deck has a state (the ruin table covers the shell)', L.decks.filter(function(d){ return !d.state; }).map(function(d){ return d.id; }), '(' + L.decks.length + ' decks)');
  var zig = []; for (var k = 1; k < S.n; k++) S.wings.forEach(function(w){ if (KC.reachOf(S, k, w) < KC.reachOf(S, k - 1, w) - EPS) zig.push(k + '.' + w.id); });
  ok('the shell is an inverted ziggurat: no layer reaches less far than the one below', zig);
  ok('every deck\'s root is in the rock (the dressed face stands over its soffit)', L.decks.filter(function(d){ var b = deckBox(L, d);
    return [b.x0 + 1, (b.x0 + b.x1) / 2, b.x1 - 1].some(function(x){ return groundAt(L, x, -S.root / 2) < Math.min(b.y1, G.head) - EPS; }); }).map(function(d){ return d.id; }));
  ok('the top layer\'s floor is the plateau\'s level, the lowest 150 m over the shelf (the target\'s)',
    [Math.abs(KC.layerY(S, S.n - 1) - G.head) > EPS ? 'top ' + KC.layerY(S, S.n - 1) : null, Math.abs(KC.layerY(S, 0) - G.shelf - 150) > EPS ? 'lowest ' + KC.layerY(S, 0) : null].filter(Boolean));
  ok('the face is the target\'s 850 m', Math.abs(G.head - G.shelf - 850) > EPS ? ['face ' + (G.head - G.shelf)] : []);
  ok('every deck hangs off the dressed face (50 m inside its ends)', L.decks.filter(function(d){ var b = deckBox(L, d); return Math.max(Math.abs(b.x0), Math.abs(b.x1)) > G.dressed - 50; }).map(function(d){ return d.id; }));
  ok('every deck lies in its zone\'s layers', L.decks.filter(function(d){ var z = L.zones.filter(function(q){ return q.id === d.zone; })[0]; return !z || !z.k || d.k < z.k[0] || d.k > z.k[1]; }).map(function(d){ return d.id; }));
  ok('Dalab holds every lived deck (the Dalab Council\'s city)', L.decks.filter(function(d){ return LIVED.indexOf(d.state) >= 0 && d.by !== 'dalab'; }).map(function(d){ return d.id; }));
  var A = area(L);
  ok('held and mended: the broken decks are 30-50 % of the shell\'s floor', A.brokenShare >= .3 && A.brokenShare <= .5 ? [] : ['broken ' + (A.brokenShare * 100).toFixed(1) + ' %'],
    '(' + (A.brokenShare * 100).toFixed(1) + ' % of ' + Math.round(A.floor).toLocaleString('en') + ' m2)');
  ok('nobody lives on a broken, dead or sealed deck', L.decks.filter(function(d){ return d.people > 0 && LIVED.indexOf(d.state) < 0; }).map(function(d){ return d.id; }));
  var C = census(L), cb = [];
  if (C.total !== L.census.total) cb.push('total ' + C.total);
  Object.keys(L.census.zones).forEach(function(z){ if ((C.zones[z] || 0) !== L.census.zones[z]) cb.push(z + ' ' + (C.zones[z] || 0) + ' (want ' + L.census.zones[z] + ')'); });
  Object.keys(L.census.by).forEach(function(b){ if ((C.by[b] || 0) !== L.census.by[b]) cb.push(b + ' ' + (C.by[b] || 0) + ' (want ' + L.census.by[b] + ')'); });
  ok('the census: ' + L.census.total.toLocaleString('en') + ' people, each zone and each people as the plan says', cb, '(' + Object.keys(C.by).map(function(b){ return b + ' ' + C.by[b]; }).join(', ') + ')');
  ok('no lived deck is crowded under ' + L.census.minM2 + ' m2 a head', L.decks.filter(function(d){ return d.people && deckFloor(L, d) / d.people < L.census.minM2; }).map(function(d){ return d.id; }));
  ok('every building on the plateau or the shelf stands on its ground (within 1.5 m at its corners)', L.parts.filter(function(p){ if (!p.shape || p.in || p.rock) return false; var b = KC.bbox(p.shape), bad = false;
    [[b[0], b[2]], [b[1], b[2]], [b[0], b[3]], [b[1], b[3]], [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2]].forEach(function(q){ if (Math.abs(groundAt(L, q[0], q[1]) - p.y) > 1.5) bad = true; }); return bad; }).map(function(p){ return p.id; }));
  ok('the station\'s platforms lie in the rock under the plateau', L.parts.filter(function(p){ if (!p.rock) return false; var b = KC.bbox(p.shape); return b[3] > -EPS || groundAt(L, (b[0] + b[1]) / 2, (b[2] + b[3]) / 2) < p.y + p.h; }).map(function(p){ return p.id; }));
  var SP = R.KSPACE.create({ cell: 40 }), list = L.parts.filter(function(p){ return p.shape && !p.in; }).map(function(p){ return { id: p.id, shape: p.shape, y: p.y, h: Math.max(p.h, 1) }; })
    .concat(L.heaps.map(function(h){ return { id: h.id, shape: ['oval', h.x, h.z, h.rx, h.rz], y: h.y0 == null ? G.shelf - 40 : h.y0, h: 80 }; })), ov = [];
  list.forEach(function(p){ var b = KC.bbox(p.shape); SP.insert(p, (b[0] + b[1]) / 2, (b[2] + b[3]) / 2, Math.max(b[1] - b[0], b[3] - b[2]) / 2); });
  list.forEach(function(p){ var b = KC.bbox(p.shape);
    SP.query((b[0] + b[1]) / 2, (b[2] + b[3]) / 2, Math.max(b[1] - b[0], b[3] - b[2]) / 2, []).forEach(function(q){
      if (q.id <= p.id) return; if (p.y >= q.y + q.h || q.y >= p.y + p.h) return; if (KC.overlap(p.shape, q.shape)) ov.push(p.id + ' x ' + q.id); }); });
  ok('no two buildings, yards or wreck heaps overlap', ov);
  var lb = [];
  L.lifts.forEach(function(lf){
    if (lf.kind === 'car'){ if (lf.z + lf.d / 2 > -1) lb.push(lf.id + ' not in the rock'); if (Math.abs(lf.y0 - G.shelf) > EPS || Math.abs(lf.y1 - G.head) > EPS) lb.push(lf.id + ' span'); }
    else if (lf.z - lf.d / 2 < -EPS) lb.push(lf.id + ' cut into the rock');
    lf.stops.forEach(function(s){ var d = ids[s]; if (s !== 'plateau' && s !== 'shelf' && (!d || LIVED.indexOf(d.state) < 0)) lb.push(lf.id + ' stops at ' + s);
      if (d && d.k != null){ var b = deckBox(L, d); if (lf.x < b.x0 - 15 || lf.x > b.x1 + 15) lb.push(lf.id + ' misses ' + s); } });
  });
  ok('the great lifts run in the rock from the shelf to the plateau, landing on lived decks behind them; the face cores on the face', lb);
  var R0 = KC.reach(L, ['plateau', 'shelf']), lost = L.decks.filter(function(d){ return LIVED.indexOf(d.state) >= 0 && !R0[d.id]; }).map(function(d){ return d.id; })
    .concat(L.parts.filter(function(p){ return p.people > 0 && !R0[p.id]; }).map(function(p){ return p.id; }));
  ok('every lived deck and peopled part is reached from the plateau or the shelf', lost);
  ok('the plateau reaches the shelf by Dalab\'s road even with the lifts shut (Shelf is not sealed by a strike)', KC.reach(L, ['plateau'], { strike: true }).shelf ? [] : ['the shelf cut off']);
  var LL = lineLength(L), lnb = [], A2 = L.line.approach;
  if (L.line.helix.grade > .04 + 1e-9) lnb.push('helix grade ' + L.line.helix.grade);
  if (LL.worstApproach > .04 + 1e-9) lnb.push('approach grade ' + LL.worstApproach.toFixed(3));
  for (var i2 = 1; i2 < A2.length; i2++) if (A2[i2][2] < A2[i2 - 1][2] - EPS) lnb.push('falls at ' + i2);
  if (ids.station && Math.abs(A2[A2.length - 1][2] - ids.station.y) > EPS) lnb.push('ends at ' + A2[A2.length - 1][2] + ', the station at ' + ids.station.y);
  if (Math.abs(A2[0][2] - L.line.helix.y1) > 30) lnb.push('the approach starts off the helix');
  ok('the Line climbs the spirals to its station under the plateau at 4 % or less', lnb, '(' + Math.round(LL.total / 100) / 10 + ' km from ' + L.line.portal.y + ' m, ' + LL.turns.toFixed(1) + ' turns)');
  ok('every wreck heap lies before the face', L.heaps.filter(function(h){ return h.z < 0; }).map(function(h){ return h.id; }));
  var pr = L.heaps.filter(function(h){ return h.id === 'heap.prow'; })[0], gash = L.decks.filter(function(d){ return d.wing === S.prow.wing && d.state === 'gone'; });
  ok('the prow\'s wreck lies across the shelf under the gash, within its fall', pr && gash.length && Math.abs(pr.x) < 150 && pr.z > 300 && pr.z < 900 ? [] : ['heap.prow']);
  return out;
}

R.SHELF = { STATES: STATES, BROKEN: BROKEN, LIVED: LIVED, BY: BY, deckBox: deckBox, deckFloor: deckFloor, broken: broken, byId: byId,
  bbox: KC.bbox, faceZ: faceZ, groundAt: groundAt, area: area, census: census, graph: KC.graph, reach: KC.reach, lineLength: lineLength,
  checks: checks, seed: seed, draw: draw, tags: tags, reachOf: function(L, k, w){ return KC.reachOf(L.stack, k, w); }, layerY: function(L, k){ return KC.layerY(L.stack, k); },
  wing: function(L, id){ return KC.wing(L.stack, id); } };
})(typeof window !== 'undefined' ? window : globalThis);
