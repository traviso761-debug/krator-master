// ================================================================= LEDGE — the layout's rules ([G data])
// Plain functions on LEDGE_LAYOUT's records (30-ledge-layout.js): the ground the shell stands on, the decks' geometry, the
// floor area and the census, the walk graph and the strike, the checks the plan names (PLAN.md section 9), the seeds and the
// core/tags records. Needs core/rand (KRAND) and core/space (KSPACE); core/tags (KTAGS) for LEDGE.tags. No THREE, no DOM:
// test-ledge.js runs it in node.
//
//   LEDGE.layerY(L, k)                 a layer's floor (the top of its slab)
//   LEDGE.wing(L, id)                  the stack's wing record
//   LEDGE.deckBox(L, d)                {x0, x1, z0, z1, y0, y1, reach, width}: the deck's plan footprint (out of the face, z 0 to reach)
//                                      and its band (slab bottom to the soffit above); the plan's, whatever its state
//   LEDGE.deckFloor(L, d)              its floor at the Ancients' peak (m2): width x reach x cover x storeys
//   LEDGE.broken(d)                    damaged, sheared, pancaked or gone
//   LEDGE.faceZ(L, x)                  the face line (its top edge) at x: 0 on the dressed face, receding beyond it
//   LEDGE.groundAt(L, x, z)            the ground's height (the head, the face, the apron, the lake's bed)
//   LEDGE.area(L)                      {floor, broken, brokenShare, lived, rows by zone, people at the peak}
//   LEDGE.census(L)                    {total, zones, by}: the people on the decks and in the parts
//   LEDGE.graph(L, {strike})           {adj}: the walk graph; strike: the links a strike shuts are gone
//   LEDGE.reach(L, from, opt)          the ids a walker reaches
//   LEDGE.lineLength(L)                {helix, approach, total, fall, grade}: the bore from the portal level to the station
//   LEDGE.checks(L)                    [{name, pass, detail}]
//   LEDGE.seed(world, id)              KRAND.child(world, 'ledge:' + id); LEDGE.draw(world, id, i, salt) -> [0, 1)
//   LEDGE.tags(L, T)                   every deck, part, lift and heap registered in T (a KTAGS.create registry)
(function(root){
'use strict';
var R = typeof globalThis !== 'undefined' ? globalThis : root;
/* the stack's geometry, its states and its area are the Ancients' cliff-city records (kits/ancients/cliff/10-cliff-stack.js, KCLIFF) */
var KC = R.KCLIFF, STATES = KC.STATES, BROKEN = KC.BROKEN, LIVED = KC.LIVED;
var BY = ['dalab', 'fellgang', 'lojfower', 'none'];
var EPS = .01;
var smooth = function(a, b, x){ var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function layerY(L, k){ return KC.layerY(L.stack, k); }
function wing(L, id){ return KC.wing(L.stack, id); }
function widthAt(L, k){ return KC.widthAt(L.stack, k); }
function reachOf(L, k, w){ return KC.reachOf(L.stack, k, w); }
function deckBox(L, d){ return KC.deckBox(L.stack, d); }
function deckFloor(L, d){ return KC.deckFloor(L.stack, d); }function broken(d){ return BROKEN.indexOf(d.state) >= 0; }
function byId(L){ var m = {}; L.decks.concat(L.parts, L.lifts, L.ways).forEach(function(x){ m[x.id] = x; }); return m; }
function bbox(s){ return KC.bbox(s); }
function inShape(s, x, z, pad){ return KC.inShape(s, x, z, pad); }
function overlap(a, b){ return KC.overlap(a, b); }

// ---------------------------------------------------------------- the ground (PLAN.md 9.2)
// faceZ: the face's top edge. On the dressed face (|x| < dressed) the Ancients cut it sheer along z = 0; beyond it the natural
// cliff's top recedes north a little and wanders (KRAND's noise, by position: a seed, never a stream)
function faceZ(L, x){ var G = L.ground, a = Math.abs(x), t = Math.max(0, a - G.dressed);
  return -t * .12 - 30 * smooth(0, 300, t) * (R.KRAND.fbm(x / 500, 0, 3.1, 3, 4371) - .5) * 2; }
/* the escarpment behind the bench: rising at G.escarp, easing onto the tableland's level (G.top) */
function rise(G, back){ var e = Math.max(0, back - G.bench) * G.escarp, span = G.top - G.head; return span * (1 - Math.exp(-e / span)); }
function lakeBed(L, z0, z){ var G = L.ground; return G.lake - Math.min(150, 6 + Math.max(0, z - z0) * .2); }
function natural(L, x, z){
  var G = L.ground, a = Math.abs(x), fz = faceZ(L, x), d = z - fz, n = R.KRAND.fbm(x / 90, z / 90, 1.7, 3, 4372) - .5;
  if (d <= 0){ var back = -d, h = G.head + rise(G, back) + 40 * smooth(G.bench, G.bench + 900, back) * n;
    return h + 6 * smooth(0, 60, back) * n * smooth(G.dressed + 150, G.dressed + 250, a); }
  var foot = G.lake + 6, shore = fz + G.run + G.shore;
  if (d < G.run){ var p = d / G.run, prof = 1 - Math.pow(1 - p, 2.4) * (1 - p * .15);
    return G.head + (foot + 8 - G.head) * Math.min(1, prof * 1.05) + 22 * n * Math.sin(p * Math.PI); }
  if (z < shore) return foot + (shore - z) / G.shore * 6 + 2 * n;
  return lakeBed(L, shore, z) + 3 * n;
}
function dressed(L, x, z){
  var G = L.ground;
  if (z <= 0){ var back = -z; return G.head + rise(G, back) + 40 * smooth(G.bench, G.bench + 900, back) * (R.KRAND.fbm(x / 90, z / 90, 1.7, 3, 4372) - .5); }
  if (z <= G.quay) return G.apron;
  return lakeBed(L, G.quay, z);
}
function baseAt(L, x, z){
  var G = L.ground, a = Math.abs(x), k = smooth(G.dressed + 60, G.dressed - 20, a);
  if (k >= 1) return dressed(L, x, z);
  if (k <= 0) return natural(L, x, z);
  return dressed(L, x, z) * k + natural(L, x, z) * (1 - k);
}
/* the ground as drawn: the base ground with Dalab's road cut into it (KCLIFF.roadCut: within w/2 of the road at its graded profile,
   eased back over the shoulder), when the layout has a road record (L.road) */
function roadCut(L){ return KC.roadCutOf(L, function(x, z){ return baseAt(L, x, z); }); }
function groundAt(L, x, z){ var h = baseAt(L, x, z), c = roadCut(L); return c ? c.apply(x, z, h) : h; }

// ---------------------------------------------------------------- the area and the census
function area(L){ return KC.area(L.stack, L.decks, L.zones); }
function census(L){
  var out = { total: 0, zones: {}, by: {} };
  L.zones.forEach(function(z){ out.zones[z.id] = 0; });
  L.decks.concat(L.parts).forEach(function(x){ if (!x.people) return; out.total += x.people; out.zones[x.zone] = (out.zones[x.zone] || 0) + x.people; out.by[x.by] = (out.by[x.by] || 0) + x.people; });
  return out;
}

// ---------------------------------------------------------------- the walk graph and the strike
function graph(L, o){ return KC.graph(L, o); }
function reach(L, from, o){ return KC.reach(L, from, o); }

// ---------------------------------------------------------------- the Line
function lineLength(L){
  var H = L.line.helix, A = L.line.approach, fall = H.y0 - H.y1, helix = fall / H.grade, app = 0, worst = 0;
  for (var i = 1; i < A.length; i++){ var run = Math.hypot(A[i][0] - A[i - 1][0], A[i][1] - A[i - 1][1]), dy = A[i - 1][2] - A[i][2]; app += run; worst = Math.max(worst, run > 0 ? dy / run : (dy > 0 ? Infinity : 0)); }
  var turns = helix / (2 * Math.PI * H.r);
  return { helix: helix, turns: turns, approach: app, total: helix + app, fall: L.line.portal.y - A[A.length - 1][2], worstApproach: worst, grade: H.grade };
}

// ---------------------------------------------------------------- seeds and tags
function seed(world, id){ return R.KRAND.child(world >>> 0, 'ledge:' + id); }
function draw(world, id, i, salt){ return R.KRAND.unit(R.KRAND.hash(seed(world, id), i | 0, salt == null ? 0 : salt | 0)); }
var CULT = { dalab: 'dalab', fellgang: 'fellgang', lojfower: 'tungang', none: 'ancient' };
/* core/tags' states (intact, ruined, rehab, toppled, salvage, reclaimed); the layout's own state rides as `finish` */
function tagState(s){ return LIVED.indexOf(s) >= 0 ? 'reclaimed' : s === 'gone' || s === 'pancaked' ? 'toppled' : 'ruined'; }
function tags(L, T){
  var out = [], src = 'settlements/ledge/src/30-ledge-layout.js';
  L.decks.forEach(function(d){ var b = deckBox(L, d);
    out.push(T.add({ id: 'ledge.' + d.id, class: 'building', kind: 'deck', key: null, name: 'deck ' + d.k + ' ' + d.wing.toUpperCase() + ' (' + d.state + ')',
      at: [(b.x0 + b.x1) / 2, b.y0, b.reach / 2], size: [b.x1 - b.x0, b.reach, b.y1 - b.y0],
      tags: { culture: 'ancient', state: tagState(d.state), finish: d.state, role: d.by === 'none' ? 'unheld' : d.by + '-held', part: 'deck' }, src: src })); });
  L.parts.forEach(function(p){ var b = bbox(p.shape); if (!b) return;
    var tg = { culture: p.key && p.key.indexOf('anc:') === 0 ? 'ancient' : CULT[p.by] || 'ancient', state: tagState(p.state), finish: p.state, part: p.kind };
    if (p.key && p.key.indexOf('anc:') === 0 && p.by !== 'none') tg.role = p.by + '-held';
    out.push(T.add({ id: 'ledge.' + p.id, class: p.kind === 'yard' || p.kind === 'halting' || p.kind === 'terrace' ? 'feature' : p.kind === 'mole' || p.kind === 'lifthall' || p.kind === 'station' ? 'infrastructure' : 'building',
      kind: p.kind, key: p.key || null, name: p.name, at: [(b[0] + b[1]) / 2, p.y, (b[2] + b[3]) / 2], size: [b[1] - b[0], b[3] - b[2], Math.max(p.h, 1)],
      ry: p.ry || 0, tags: tg, src: src })); });
  L.lifts.forEach(function(lf){ out.push(T.add({ id: 'ledge.' + lf.id, class: 'infrastructure', kind: lf.kind === 'car' ? 'lift' : 'lift-core', key: null, name: lf.name,
    at: [lf.x, lf.y0, lf.z], size: [lf.w, lf.d, lf.y1 - lf.y0], tags: { culture: 'ancient', state: lf.state === 'runs' ? 'rehab' : 'ruined', part: 'lift', role: lf.by === 'none' ? 'unheld' : lf.by + '-held' }, src: src })); });
  L.heaps.forEach(function(h){ out.push(T.add({ id: 'ledge.' + h.id, class: 'prop', kind: 'rubble', key: null, name: 'the wreck of ' + h.of,
    at: [h.x, h.y0 == null ? L.ground.lake : h.y0, h.z], r: Math.max(h.rx, h.rz), h: h.h, tags: { culture: 'ancient', state: 'toppled', part: 'rubble' }, src: src })); });
  return out;
}

// ---------------------------------------------------------------- the checks
function checks(L){
  var out = [], ids = byId(L), G = L.ground, S = L.stack;
  function ok(name, bad, detail){ out.push({ name: name, pass: bad.length === 0, detail: bad.slice(0, 4).join('; ') + (bad.length > 4 ? ' (+' + (bad.length - 4) + ')' : '') + (detail ? ' ' + detail : '') }); }
  // ids and vocabulary
  var seen = {}, dup = [];
  L.decks.concat(L.parts, L.lifts, L.ways, L.heaps).forEach(function(x){ if (seen[x.id]) dup.push(x.id); seen[x.id] = 1; if (!/^[a-z][a-z0-9_.]*$/.test(x.id)) dup.push('bad id ' + x.id); });
  ok('every record has a unique, stable id', dup);
  ok('every deck and part has a known state (' + STATES.join(', ') + ') and holder (' + BY.join(', ') + ')',
    L.decks.concat(L.parts).filter(function(x){ return STATES.indexOf(x.state) < 0 || BY.indexOf(x.by) < 0; }).map(function(x){ return x.id + ':' + x.state + '/' + x.by; }));
  ok('every deck has a state (the ruin table covers the shell)', L.decks.filter(function(d){ return !d.state; }).map(function(d){ return d.id; }), '(' + L.decks.length + ' decks)');
  // the shell's form: an inverted ziggurat (each layer reaches at least as far as the one below, wing by wing) whose roots are in
  // the rock: the ground behind each deck's root stands over its soffit, and the top layer's floor is the head's level
  var zig = [];
  for (var k = 1; k < S.n; k++) S.wings.forEach(function(w){ if (reachOf(L, k, w) < reachOf(L, k - 1, w) - EPS) zig.push(k + '.' + w.id); });
  ok('the shell is an inverted ziggurat: no layer reaches less far than the one below', zig);
  var roots = L.decks.filter(function(d){ var b = deckBox(L, d); return [b.x0 + 1, (b.x0 + b.x1) / 2, b.x1 - 1].some(function(x){ return groundAt(L, x, -S.root / 2) < Math.min(b.y1, G.head) - EPS; }); }).map(function(d){ return d.id; });
  ok('every deck\'s root is in the rock (the dressed face stands over its soffit; the top layer\'s rooms rise over the head)', roots);
  ok('the top layer\'s floor is the head\'s level, the lowest stands over the apron',
    [Math.abs(layerY(L, S.n - 1) - G.head) > EPS ? 'top ' + layerY(L, S.n - 1) : null, layerY(L, 0) - S.slab < G.apron + 2 ? 'lowest ' + layerY(L, 0) : null].filter(Boolean));
  var undress = L.decks.filter(function(d){ var b = deckBox(L, d); return Math.max(Math.abs(b.x0), Math.abs(b.x1)) > G.dressed - 50; }).map(function(d){ return d.id; });
  ok('every deck hangs off the dressed face (50 m inside its ends)', undress);
  // zones
  ok('every deck lies in its zone\'s layers', L.decks.filter(function(d){ var z = L.zones.filter(function(q){ return q.id === d.zone; })[0]; return !z || !z.k || d.k < z.k[0] || d.k > z.k[1]; }).map(function(d){ return d.id; }));
  // the middle decks are Loj Fower's (section 0): every kept deck is in Z3, and every lived deck in Z3 is kept
  ok('Loj Fower holds the middle decks: every kept deck in Z3, every lived Z3 deck kept, the station on a Z3 layer',
    L.decks.filter(function(d){ return (d.state === 'kept') !== (d.zone === 'Z3' && LIVED.indexOf(d.state) >= 0); }).map(function(d){ return d.id; })
      .concat(ids.station && L.zones.filter(function(z){ return z.id === 'Z3'; })[0].k[0] <= (ids.station.y - S.y0) / S.pitch && (ids.station.y - S.y0) / S.pitch <= L.zones.filter(function(z){ return z.id === 'Z3'; })[0].k[1] ? [] : ['station']));
  // half ruined (section 0): the broken decks 40-60 % of the shell's floor; nobody lives on a broken deck
  var A = area(L);
  ok('half ruined: the broken decks are 40-60 % of the shell\'s floor', A.brokenShare >= .4 && A.brokenShare <= .6 ? [] : ['broken ' + (A.brokenShare * 100).toFixed(1) + ' %'],
    '(' + (A.brokenShare * 100).toFixed(1) + ' % of ' + Math.round(A.floor).toLocaleString('en') + ' m2)');
  ok('nobody lives on a broken, dead or sealed deck', L.decks.filter(function(d){ return d.people > 0 && LIVED.indexOf(d.state) < 0; }).map(function(d){ return d.id; }));
  // the census (PLAN.md 9.7): the 10,000, each zone's and each people's sums exact; no lived deck under minM2 a head
  var C = census(L), cb = [];
  if (C.total !== L.census.total) cb.push('total ' + C.total);
  Object.keys(L.census.zones).forEach(function(z){ if ((C.zones[z] || 0) !== L.census.zones[z]) cb.push(z + ' ' + (C.zones[z] || 0) + ' (want ' + L.census.zones[z] + ')'); });
  Object.keys(L.census.by).forEach(function(b){ if ((C.by[b] || 0) !== L.census.by[b]) cb.push(b + ' ' + (C.by[b] || 0) + ' (want ' + L.census.by[b] + ')'); });
  ok('the census: ' + L.census.total.toLocaleString('en') + ' people, each zone and each people as the plan says', cb, '(' + C.total + ': ' + Object.keys(C.by).map(function(b){ return b + ' ' + C.by[b]; }).join(', ') + ')');
  ok('no lived deck is crowded under ' + L.census.minM2 + ' m2 a head', L.decks.filter(function(d){ return d.people && deckFloor(L, d) / d.people < L.census.minM2; }).map(function(d){ return d.id + ' ' + Math.round(deckFloor(L, d) / d.people) + ' m2'; }));
  // the parts: on their ground, disjoint (core/space finds the candidates), inside their parents
  var onG = L.parts.filter(function(p){ if (!p.shape || p.in || p.rock || p.lake) return false; var b = bbox(p.shape), bad = false;
    [[b[0], b[2]], [b[1], b[2]], [b[0], b[3]], [b[1], b[3]], [(b[0] + b[1]) / 2, (b[2] + b[3]) / 2]].forEach(function(q){ if (Math.abs(groundAt(L, q[0], q[1]) - p.y) > 1.5) bad = true; }); return bad; }).map(function(p){ return p.id; });
  ok('every building on the head or the apron stands on its ground (within 1.5 m at its corners)', onG);
  var inRock = L.parts.filter(function(p){ if (!p.rock) return false; var b = bbox(p.shape); return b[3] > -EPS || groundAt(L, (b[0] + b[1]) / 2, (b[2] + b[3]) / 2) < p.y + p.h; }).map(function(p){ return p.id; });
  ok('the station and the vault lie in the rock behind the face', inRock);
  ok('every part with a parent lies inside it', L.parts.filter(function(p){ if (!p.in || !p.shape) return false; var q = ids[p.in]; if (!q || !q.shape) return true; var a = bbox(p.shape), c = bbox(q.shape);
    return a[0] < c[0] - EPS || a[1] > c[1] + EPS || a[2] < c[2] - EPS || a[3] > c[3] + EPS; }).map(function(p){ return p.id + ' in ' + p.in; }));
  var SP = R.KSPACE.create({ cell: 40 }), list = L.parts.filter(function(p){ return p.shape && !p.in; }).map(function(p){ return { id: p.id, shape: p.shape, y: p.y, h: Math.max(p.h, 1) }; })
    .concat(L.heaps.map(function(h){ return { id: h.id, shape: ['oval', h.x, h.z, h.rx, h.rz], y: h.y0 == null ? G.lake - 60 : h.y0, h: 80 }; })), ov = [];
  list.forEach(function(p){ var b = bbox(p.shape); SP.insert(p, (b[0] + b[1]) / 2, (b[2] + b[3]) / 2, Math.max(b[1] - b[0], b[3] - b[2]) / 2); });
  list.forEach(function(p){ var b = bbox(p.shape);
    SP.query((b[0] + b[1]) / 2, (b[2] + b[3]) / 2, Math.max(b[1] - b[0], b[3] - b[2]) / 2, []).forEach(function(q){
      if (q.id <= p.id) return; if (p.y >= q.y + q.h || q.y >= p.y + p.h) return; if (overlap(p.shape, q.shape)) ov.push(p.id + ' x ' + q.id); }); });
  ok('no two buildings, yards or wreck heaps overlap', ov);
  // the lifts: the great lifts' shafts in the rock, foot to head, landing only on sound decks; the face cores on the face
  var lb = [];
  L.lifts.forEach(function(lf){
    if (lf.kind === 'car'){ if (lf.z + lf.d / 2 > -1) lb.push(lf.id + ' not in the rock'); if (Math.abs(lf.y0 - G.apron) > EPS || Math.abs(lf.y1 - G.head) > EPS) lb.push(lf.id + ' span');
      if (groundAt(L, lf.x, lf.z) < G.head - EPS) lb.push(lf.id + ' under open ground'); }
    else if (lf.z - lf.d / 2 < -EPS) lb.push(lf.id + ' cut into the rock');
    lf.stops.forEach(function(s){ var d = ids[s]; if (s !== 'head' && s !== 'apron' && (!d || broken(d))) lb.push(lf.id + ' stops at ' + s);
      if (d && d.k != null && lf.kind === 'car'){ var b = deckBox(L, d); if (lf.x < b.x0 - 15 || lf.x > b.x1 + 15) lb.push(lf.id + ' misses ' + s); } });
  });
  ok('the great lifts run in the rock from the apron to the head, each landing on a sound deck behind it; the face cores stand on the face', lb);
  ok('both great lifts run, sized for a wagon and its team (section 0)', L.lifts.filter(function(lf){ return lf.kind === 'car' && (lf.state !== 'runs' || lf.car.w * lf.car.d < 120 || lf.car.beasts < 4); }).map(function(lf){ return lf.id; }));
  // the walk: every lived deck and every peopled part is reached from the head or the apron
  var R0 = reach(L, ['head', 'apron']), lost = L.decks.filter(function(d){ return LIVED.indexOf(d.state) >= 0 && !R0[d.id]; }).map(function(d){ return d.id; })
    .concat(L.parts.filter(function(p){ return p.people > 0 && !R0[p.id]; }).map(function(p){ return p.id; }));
  ok('every lived deck and peopled part is reached from the head or the apron', lost);
  // the strike: with the great lifts and their stairs shut, the head cannot reach the apron or the station (Loj Fower's lever)
  var Rh = reach(L, ['head'], { strike: true });
  ok('a strike seals Ledge: with the great lifts and stairs shut, the head reaches neither the apron nor the station', ['apron', 'station', 'd.20.e1'].filter(function(x){ return Rh[x]; }));
  // the Line slopes down to the station (section 0): its helix at the ruling grade or less, the approach falling to the station
  var LL = lineLength(L), lnb = [];
  if (L.line.helix.grade > .04 + 1e-9) lnb.push('helix grade ' + L.line.helix.grade);
  if (LL.worstApproach > .04 + 1e-9) lnb.push('approach grade ' + LL.worstApproach.toFixed(3));
  var A2 = L.line.approach; for (var i2 = 1; i2 < A2.length; i2++) if (A2[i2][2] > A2[i2 - 1][2] + EPS) lnb.push('rises at ' + i2);
  if (ids.station && Math.abs(A2[A2.length - 1][2] - ids.station.y) > EPS) lnb.push('ends at ' + A2[A2.length - 1][2] + ', the station at ' + ids.station.y);
  if (Math.abs(A2[0][2] - L.line.helix.y1) > 30) lnb.push('the approach starts off the helix');
  ok('the Line slopes down to its station in the face at 4 % or less', lnb, '(' + Math.round(LL.total / 100) / 10 + ' km from ' + L.line.helix.y0 + ' m, ' + LL.turns.toFixed(1) + ' turns)');
  // the wreck lies under what fell
  var hb = L.heaps.filter(function(h){ return Math.abs(h.x) > G.dressed || h.z < 0; }).map(function(h){ return h.id; });
  ok('every wreck heap lies before the face, under the shell', hb);
  var rc = roadCut(L), rb = KC.roadBad(rc, function(x, z){ return groundAt(L, x, z); }, .09);
  ok('Dalab\'s road holds its 9 % on its cut (over 40 m of it)', rb, rc ? '(' + rc.profiles.map(function(P){ return Math.round(P[P.length - 1].s / 100) / 10; }).join(' + ') + ' km, ' + rc.path.legs + ' legs, the deepest cut or fill ' + Math.round(rc.deepest) + ' m)' : '');
  return out;
}

R.LEDGE = { STATES: STATES, BROKEN: BROKEN, LIVED: LIVED, BY: BY, layerY: layerY, wing: wing, widthAt: widthAt, reachOf: reachOf, deckBox: deckBox,
  deckFloor: deckFloor, broken: broken, byId: byId, bbox: bbox, inShape: inShape, overlap: overlap, faceZ: faceZ, groundAt: groundAt, baseAt: baseAt, roadCut: roadCut,
  area: area, census: census, graph: graph, reach: reach, lineLength: lineLength, checks: checks, seed: seed, draw: draw, tags: tags };
})(typeof window !== 'undefined' ? window : globalThis);
