// node settlements/pher/tests/test-pher-site.js — Phēr's plan (targets/town/89zp-ph-site.js) on core/city, without the page.
// The Xanadu kit's boxes are read from its defs (XA.def({key, w, d, h}) in kits/xanadu/src, as core/world/bake_sites.py
// reads them), core/city's closure globals are handed in as KCITY.lib (the page's bundle does the same). The checks, each
// with its negative pair:
//   - the town lays with no error: the delta, the shelf and both hillsides (core/city's hillside strategy);
//   - the road's hairpins clear of the gorge and the gully, each leg no steeper than 8 %, no house on it past the shelf;
//   - no two standing footprints overlap (exact SAT, 0.1 m);
//   - no house stands on a street's carriageway;
//   - nothing but the quays and boat sheds stands in the lake; nothing on the stream's channel;
//   - the people about 6,000 (PLAN.md section 2: within 25 %);
//   - the governor's house, the pilgrims' house, the quays, the temple, the granaries all placed;
//   - the plan is the same when run twice (KRAND).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'].forEach(load);
const CITY = fs.readdirSync(path.join(ROOT, 'core', 'city')).filter(f => /^\d\d-city-.*\.js$/.test(f) && !/host/.test(f)).sort();
CITY.forEach(f => load('core/city/' + f));
KCITY.lib = { SL, plan: () => PLAN, KSPACE, Raster, OCC, obb, obbCorners };
// the kit's boxes from its defs
global.PH_KIT_DIMS = {};
const XS = [path.join(ROOT, 'kits', 'xanadu', 'src'), path.join(ROOT, 'kits', 'xanadu', 'extra')];   /* extra: the opt-in pieces Phēr takes (kit.json) */
for (const f of [].concat(...XS.map(d => fs.readdirSync(d).filter(f => f.endsWith('.js')).map(f => path.join(d, f))))) {
  const s = fs.readFileSync(f, 'utf8'), re = /XA\.def\(\{/g; let m;
  while ((m = re.exec(s))) { const head = s.slice(m.index, m.index + 1500), k = /key:\s*'([^']+)'/.exec(head), b = /\bw:\s*([\d.]+),\s*d:\s*([\d.]+)(?:,\s*h:\s*([\d.]+))?/.exec(head);
    const fb = /fw:\s*([\d.]+),\s*fd:\s*([\d.]+)/.exec(head);
    if (k && b) PH_KIT_DIMS[k[1]] = { w: +b[1], d: +b[2], h: b[3] == null ? 8 : +b[3], fw: fb ? +fb[1] : null, fd: fb ? +fb[2] : null }; }
}
const SITE = 'settlements/pher/targets/town/89zp-ph-site.js';
/* the far ground (gen/89zf-ph-far.js, written by build.py) when built: phH gives way to it past ~2.4 km of the cove */
if (fs.existsSync(path.join(ROOT, 'settlements/pher/gen/89zf-ph-far.js'))) { global.atob = s => Buffer.from(s, 'base64').toString('binary'); load('settlements/pher/gen/89zf-ph-far.js'); }
load(SITE);

// ---------------------------------------------------------------- the checks' tools
const segD = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(a[0] + dx * t - p[0], a[1] + dz * t - p[1]); };
const corners = o => obbCorners({ c: o.c, u: o.u, v: [-o.u[1], o.u[0]], hw: o.hw, hd: o.hd });
const pen = (A, B) => SL.pen({ c: A.c, u: A.u, v: [-A.u[1], A.u[0]], hw: A.hw, hd: A.hd }, { c: B.c, u: B.u, v: [-B.u[1], B.u[0]], hw: B.hw, hd: B.hd });
function overlaps(list, eps) { const I = KSPACE.create({ cell: 60 }); let n = 0, first = null;
  list.forEach((p, i) => { p._i = i; I.insert(p, p.x, p.z, Math.hypot(p.bo.hw, p.bo.hd)); });
  list.forEach(A => I.query(A.x, A.z, Math.hypot(A.bo.hw, A.bo.hd)).forEach(B => { if (B._i > A._i && pen(A.bo, B.bo) > eps) { n++; first = first || A.id + ' x ' + B.id; } }));
  return { n, first }; }
// a footprint within a way's carriageway: its corners and middle against each segment (the corners suffice for these sizes
// against the ways' 2 m sampling: a corner or the middle inside the half-width)
function onStreets(list, ways) { let n = 0, first = null;
  for (const p of list) { if (p.kind !== 'house') continue; const C = corners(p.bo).concat([p.bo.c]);
    const hit = ways.some(w => { for (let i = 1; i < w.pts.length; i++) for (const q of C) if (segD(q, w.pts[i - 1], w.pts[i]) < w.w / 2 - 0.05) return true; return false; });
    if (hit) { n++; first = first || p.id; } }
  return { n, first }; }
const WET_OK = { xa_quay: 1, xa_boatshed: 1, xa_barge: 1 };
const inWater = list => list.filter(p => !WET_OK[p.key] && p.kind !== 'bridge' && corners(p.bo).concat([p.bo.c]).some(q => phH(q[0], q[1]) < 0.2));
const onStream = list => list.filter(p => p.kind !== 'bridge' && p.kind !== 'stall' && (() => { const C = corners(p.bo).concat([p.bo.c]); return C.some(q => { const d = phShoreZ(q[0]) - q[1]; return d > 0 && Math.abs(q[0] - phStreamX(q[1])) < 9; }); })());

// ---------------------------------------------------------------- 1. the plan lays
const P = PH_PLACE, by = {};
P.forEach(p => { by[p.level] = (by[p.level] || 0) + 1; });
T.ok('the town lays with no error: the delta, the shelf and both hillsides, the road in its hairpins',
  !PH_ERR && by.delta > 40 && by.shelf >= 6 && by.east > 300 && by.west > 120 && PH_ROAD.pts.length >= 14, PH_ERR || JSON.stringify(by) + ', the road ' + PH_ROAD.pts.length + ' points');
T.neg('...its negative: an empty plan is caught', L => L.delta > 40 && L.east > 300 && L.west > 120, { delta: 0, east: 0, west: 0 }, by);

// ---------------------------------------------------------------- 1b. the road (the owner, 2026-11-17: the switchbacks off the gorge, not lined with houses)
function roadBad(R, places) { const bad = [], P = R.pts;
  for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let t = 0; t <= L; t += 10) { const x = a[0] + (b[0] - a[0]) * t / L, z = a[1] + (b[1] - a[1]) * t / L, d = phShoreZ(x) - z, U = PH.GULLY;
      if (d > 0 && d < 4200 && Math.abs(x - phStreamX(z)) < 120) { bad.push('leg ' + i + ' over the gorge at ' + Math.round(x) + ',' + Math.round(z)); break; }
      if (d > 60 && d < 3900 && Math.abs(x - (U.x + U.drift * d)) < 70) { bad.push('leg ' + i + ' in the gully'); break; } }
    const g = Math.abs(phH(b[0], b[1]) - phH(a[0], a[1])) / Math.max(1, L); if (i > 2 && i < P.length - 2 && g > 0.08) bad.push('leg ' + i + ' at ' + (g * 100).toFixed(1) + ' %'); }
  for (const p of places) { if (p.kind !== 'house' || p.inland < PH.SHELF.d + 140) continue;
    for (let i = 3; i < P.length; i++) if (segD([p.x, p.z], P[i - 1], P[i]) < 14) { bad.push(p.id + ' on the road'); break; } }
  return bad; }
{ const bad = roadBad(PH_ROAD, PH_PLACE), legs = PH_ROAD.pts.length - 8, J = PH_ROAD.join, G = PH.THALABA_GUIDE[0], wj = phWorldXZ(J[0], J[1]);
  if (Math.hypot(wj[0] - (G[0] - 843) * 2000, wj[1] - (G[1] - 1491) * 2000) > 1) bad.push('the road does not reach the first guide point of the Thalaba road');
  T.ok('the road climbs the spur in ' + legs + ' hairpin legs, clear of the gorge and the gully, none steeper than 8 %, no house on it past the shelf, and joins the Thalaba road at its first guide point', !bad.length && legs >= 14, bad.slice(0, 4).join('; ') || legs + ' legs');
  const across = Object.assign({}, PH_ROAD, { pts: PH_ROAD.pts.slice(0, 6).concat([[phStreamX(-1500) - 300, -1500], [phStreamX(-1500) + 300, -1520]]).concat(PH_ROAD.pts.slice(6)) });
  T.neg('...its negative: a leg run across the gorge is caught', R => roadBad(R, []).length === 0, across, PH_ROAD); }

// ---------------------------------------------------------------- 2. no overlap
const ov = overlaps(P, 0.1);
T.ok('no two standing footprints overlap (exact SAT, 0.1 m)', ov.n === 0, ov.n + ' pairs' + (ov.first ? ', first ' + ov.first : ''));
{ const a = P.find(p => p.kind === 'house'), dup = Object.assign({}, a, { id: 'dup', bo: Object.assign({}, a.bo, { c: [a.bo.c[0] + 1, a.bo.c[1]] }) });
  T.neg('...its negative: a house copied a metre over is caught', L => overlaps(L, 0.1).n === 0, P.concat([dup]), P); }

// ---------------------------------------------------------------- 3. off the streets
const os = onStreets(P, PH.ways);
T.ok('no house stands on a street\'s carriageway', os.n === 0, os.n + ' on a street' + (os.first ? ', first ' + os.first : ''));
{ const a = P.find(p => p.kind === 'house'), w = PH.ways[0], q = w.pts[Math.floor(w.pts.length / 2)], moved = Object.assign({}, a, { id: 'moved', bo: Object.assign({}, a.bo, { c: q }) });
  T.neg('...its negative: a house moved onto the strand street is caught', L => onStreets(L, PH.ways).n === 0, [moved], [a]); }

// ---------------------------------------------------------------- 4. out of the lake and off the stream
const wet = inWater(P), st = onStream(P);
T.ok('nothing but the quays and the boat sheds stands in the lake; nothing on the stream\'s channel', wet.length === 0 && st.length === 0,
  wet.length + ' in the lake' + (wet[0] ? ' (' + wet[0].id + ' ' + wet[0].key + ')' : '') + ', ' + st.length + ' on the stream' + (st[0] ? ' (' + st[0].id + ')' : ''));
{ const a = P.find(p => p.kind === 'house'), sunk = Object.assign({}, a, { id: 'sunk', bo: Object.assign({}, a.bo, { c: [0, 400] }) });
  T.neg('...its negative: a house set 400 m out on the lake is caught', L => inWater(L).length === 0, [sunk], [a]); }

// ---------------------------------------------------------------- 5. the people and the civic pieces
const ppl = PH.people.total;
T.ok('the people about 6,000 (PLAN.md section 2, within 25 %)', ppl > 4500 && ppl < 7500, ppl + ' (' + JSON.stringify(PH.people.byLevel) + ')');
const want = ['xa_cit_vizier', 'xa_palace_gate', 'xa_barracks', 'xa_barge', 'xa_caravanserai', 'xa_temple_ortakoy', 'xa_quay', 'xa_temple', 'xa_granary', 'xa_generator', 'xa_lighthouse', 'xa_bridge'], have = new Set(P.filter(p => p.kind === 'civic' || p.kind === 'bridge').map(p => p.key));
const miss = want.filter(k => !have.has(k));
T.ok('the heir\'s palace, gate, guard and barge, the caravanserai, the pilgrims\' house, the quays, the temple, the granaries, the generator and the light placed', !miss.length,
  miss.length ? 'missing ' + miss.join(', ') : P.filter(p => p.kind === 'civic').length + ' civic pieces');
const civErr = [].concat(PH_LOW.civic || []).filter(c => c.err);
T.ok('every civic piece has its def', !civErr.length, civErr.map(c => c.key).join(', '));

// ---------------------------------------------------------------- 5b. the boats (PLAN.md step P4): afloat, the runs on open water
// moored and fishing boats on water deep enough to float (the beached dugouts at the waterline); every station of every
// run's loop (out and back, every 20 m past its first 40 m off the quay) over at least 1.5 m of water: no run through the
// headland, the point or the shore
function boatsBad(B) { const bad = [];
  for (const m of B.moored) { const h = phH(m.x, m.z); if (m.v === 2 ? (h < -1.2 || h > 1.6) : h > -0.8) bad.push(m.id + ' at ' + h.toFixed(1) + ' m'); }
  for (const o of B.out) { const h = phH(o.x, o.z); if (h > -5) bad.push(o.id + ' at ' + h.toFixed(1) + ' m'); }
  for (const R of B.runs) { const L = phRunLoop(R); for (let s = 40; s < L.len - 40; s += 20) { let i = 1; while (i < L.cum.length - 1 && L.cum[i] < s) i++;
    const a = L.pts[i - 1], c = L.pts[i], f = (s - L.cum[i - 1]) / Math.max(1e-6, L.cum[i] - L.cum[i - 1]), x = a[0] + (c[0] - a[0]) * f, z = a[1] + (c[1] - a[1]) * f, h = phH(x, z);
    if (h > -1.5) { bad.push(R.id + ' aground at ' + Math.round(x) + ',' + Math.round(z) + ' (' + h.toFixed(1) + ' m)'); break; } } }
  return bad; }
{ const B = PH_BOATS, bad = boatsBad(B), n = B.moored.length + B.out.length + B.runs.reduce((a, R) => a + R.boats.length, 0);
  T.ok('the boats afloat: moored and fishing boats on water, the beached dugouts at the waterline, every run on open water', bad.length === 0 && n >= 80 && B.runs.length === 6,
    bad.length ? bad.slice(0, 4).join('; ') : n + ' boats, ' + B.runs.length + ' runs');
  const thru = Object.assign({}, B, { runs: B.runs.concat([{ id: 'through the headland', pts: [[-150, 200], [PH.HEAD.b[0] - 100, PH.HEAD.b[1] - 300], [-2000, 1400]], boats: [], speed: 1 }]) });
  T.neg('...its negative: a run cut across the headland is caught', X => boatsBad(X).length === 0, thru, B); }

// ---------------------------------------------------------------- 6. the same twice
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h.toString(16); };
const H1 = fnv(JSON.stringify(PH_PLACE.map(p => [p.id, p.key, p.x, p.z, p.ry])));
PH_PLACE.length = 0; phRun();
const H2 = fnv(JSON.stringify(PH_PLACE.map(p => [p.id, p.key, p.x, p.z, p.ry])));
T.ok('the plan is the same run twice (KRAND)', H1 === H2, H1 + ' / ' + H2);
console.log('placed ' + PH_PLACE.length + ' (' + JSON.stringify(by) + '), houses ' + PH_PLACE.filter(p => p.kind === 'house').length + ', people ' + ppl);
T.done();
