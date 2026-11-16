// node settlements/pher/tests/test-pher-site.js — Phēr's plan (targets/town/89zp-ph-site.js) on core/city, without the page.
// The Xanadu kit's boxes are read from its defs (XA.def({key, w, d, h}) in kits/xanadu/src, as core/world/bake_sites.py
// reads them), core/city's closure globals are handed in as KCITY.lib (the page's bundle does the same). The checks, each
// with its negative pair:
//   - both levels lay with no error, Lower on the strand and the wall, Upper on the rim, the switchbacks between;
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
const XS = path.join(ROOT, 'kits', 'xanadu', 'src');
for (const f of fs.readdirSync(XS).filter(f => f.endsWith('.js'))) {
  const s = fs.readFileSync(path.join(XS, f), 'utf8'), re = /XA\.def\(\{/g; let m;
  while ((m = re.exec(s))) { const head = s.slice(m.index, m.index + 1500), k = /key:\s*'([^']+)'/.exec(head), b = /\bw:\s*([\d.]+),\s*d:\s*([\d.]+)(?:,\s*h:\s*([\d.]+))?/.exec(head);
    if (k && b) PH_KIT_DIMS[k[1]] = { w: +b[1], d: +b[2], h: b[3] == null ? 8 : +b[3] }; }
}
const SITE = 'settlements/pher/targets/town/89zp-ph-site.js';
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
const WET_OK = { xa_quay: 1, xa_boatshed: 1 };
const inWater = list => list.filter(p => !WET_OK[p.key] && corners(p.bo).concat([p.bo.c]).some(q => phH(q[0], q[1]) < 0.2));
const onStream = list => list.filter(p => { const C = corners(p.bo).concat([p.bo.c]); return C.some(q => { const d = phShoreZ(q[0]) - q[1]; return d > 0 && Math.abs(q[0] - phStreamX(q[1])) < 9; }); });

// ---------------------------------------------------------------- 1. the plan lays
const P = PH_PLACE, by = {};
P.forEach(p => { by[p.level] = (by[p.level] || 0) + 1; });
T.ok('both levels lay with no error: Lower on the strand and the wall, Upper on the rim, the switchbacks between',
  !PH_ERR && by.lower > 250 && by.upper > 150 && PH_ROAD.pts.length >= 6, PH_ERR || JSON.stringify(by) + ', the avenue ' + PH_ROAD.pts.length + ' points');
T.neg('...its negative: an empty plan is caught', L => L.lower > 250 && L.upper > 150, { lower: 0, upper: 0 }, by);

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
const want = ['xa_vizier', 'xa_temple_ortakoy', 'xa_quay', 'xa_temple', 'xa_granary', 'xa_generator', 'xa_lighthouse'], have = new Set(P.filter(p => p.kind === 'civic').map(p => p.key));
const miss = want.filter(k => !have.has(k));
T.ok('the governor\'s house, the pilgrims\' house, the quays, the temple, the granaries, the generator and the light placed', !miss.length,
  miss.length ? 'missing ' + miss.join(', ') : P.filter(p => p.kind === 'civic').length + ' civic pieces');
const civErr = [].concat(PH_LOW.civic || [], PH_UP.civic || []).filter(c => c.err);
T.ok('every civic piece has its def', !civErr.length, civErr.map(c => c.key).join(', '));

// ---------------------------------------------------------------- 6. the same twice
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h.toString(16); };
const H1 = fnv(JSON.stringify(PH_PLACE.map(p => [p.id, p.key, p.x, p.z, p.ry])));
PH_PLACE.length = 0; phRun();
const H2 = fnv(JSON.stringify(PH_PLACE.map(p => [p.id, p.key, p.x, p.z, p.ry])));
T.ok('the plan is the same run twice (KRAND)', H1 === H2, H1 + ' / ' + H2);
console.log('placed ' + PH_PLACE.length + ' (' + JSON.stringify(by) + '), houses ' + PH_PLACE.filter(p => p.kind === 'house').length + ', people ' + ppl);
T.done();
