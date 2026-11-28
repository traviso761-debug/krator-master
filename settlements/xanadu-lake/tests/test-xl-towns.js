// node settlements/xanadu-lake/tests/test-xl-towns.js — the lake towns' specs against the tune and each built town's plan
// (targets/town/89zq-xl-plan.js on core/city), without the page. The Xanadu kit's boxes are read from its defs (XA.def in
// kits/xanadu/src and extra/, as settlements/pher's test reads them); core/city's closure globals are handed in as KCITY.lib,
// as the page's bundle does. The checks (settlements/xanadu-lake/PLAN.md section 6), each with its negative pair:
//   - every spec key is a XAN_TUNE.lake record, and no spec copies a tune number (people, px, trade);
//   - every lake record but Phēr is a town of the twenty (a spec, or still to be written: listed);
//   - the census: a built town's houses x XL.HH within 10 % of the tune's people, each quarter at its share;
//   - the footprints: no two overlap (exact SAT, 0.1 m), no building on a way (the bridge, the shrines apart), nothing but the water pieces under the level,
//     nothing on the stream but the bridge;
//   - the shore: the quay and the landing stair at the water's edge (their decks within 2 m of the level); every dugout
//     afloat (the water under it) or drawn up (on the beach or the stair, within 2 m of the level);
//   - the trade: the spec's works present in their numbers, the landmarks all placed; the benches' fields on their benches;
//   - the same plan twice (KRAND).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
global.XAN_TUNE = require(path.join(ROOT, 'core', 'region', 'data', 'xan-tune.js'));
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'].forEach(load);
fs.readdirSync(path.join(ROOT, 'core', 'city')).filter(f => /^\d\d-city-.*\.js$/.test(f) && !/host/.test(f)).sort().forEach(f => load('core/city/' + f));
KCITY.lib = { SL, plan: () => PLAN, KSPACE, Raster, OCC, obb, obbCorners };
// kits/crops in one closure, as the page's gen/89zc-crops-bundle.js (its fragments share top-level names); CROPS on globalThis
vm.runInThisContext('(function(){' + ['10-crop-core.js', '20-crop-records.js', '22-crop-material.js', '40-crop-query.js']
  .map(f => fs.readFileSync(path.join(ROOT, 'kits', 'crops', 'src', f), 'utf8')).join('\n') + '\n})();', { filename: 'kits/crops (bundled)' });
global.XL_KIT_DIMS = {};
for (const d of ['src', 'extra']) for (const f of fs.readdirSync(path.join(ROOT, 'kits', 'xanadu', d)).filter(f => f.endsWith('.js'))) {
  const s = fs.readFileSync(path.join(ROOT, 'kits', 'xanadu', d, f), 'utf8'), re = /XA\.def\(\{/g; let m;
  while ((m = re.exec(s))) { const head = s.slice(m.index, m.index + 1500), k = /key:\s*'([^']+)'/.exec(head), b = /\bw:\s*([\d.]+),\s*d:\s*([\d.]+)(?:,\s*h:\s*([\d.]+))?/.exec(head);
    if (k && b) XL_KIT_DIMS[k[1]] = { w: +b[1], d: +b[2], h: b[3] == null ? 8 : +b[3] }; }
}
const TOWN = 'settlements/xanadu-lake/targets/town/';
['89zl-xl-specs.js', '89zm-xl-fit.js', '89zp-xl-site.js', '89zq-xl-plan.js'].forEach(f => load(TOWN + f));
const SPEC_SRC = fs.readFileSync(path.join(ROOT, TOWN, '89zl-xl-specs.js'), 'utf8');

// ---------------------------------------------------------------- 1. the specs against the tune
const LAKE = XAN_TUNE.lake, keys = Object.keys(XL.SPECS);
const notTune = S => Object.keys(S).filter(k => !LAKE.some(L => L.key === k));
T.ok('every spec key is a XAN_TUNE.lake record (' + keys.join(', ') + ')', notTune(XL.SPECS).length === 0 && keys.every(k => XL.SPECS[k].key === k), notTune(XL.SPECS).join(', '));
T.neg('...its negative: a spec under a key the tune does not have is caught', S => notTune(S).length === 0, Object.assign({ 'old-mouth': {} }, XL.SPECS), XL.SPECS);
// no tune number copied: the rows hold no people, px, make, hub or prov field
const copied = src => (src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '').match(/\b(people|px|py|make|hub|prov)\s*:/g) || []);   /* in the code, not its comments */
T.ok('no spec copies a tune number (people, px, trade, hub, province are read from XAN_TUNE.lake in place)', copied(SPEC_SRC).length === 0, copied(SPEC_SRC).join(' '));
T.neg('...its negative: a row with people: 1500 is caught', s => copied(s).length === 0, SPEC_SRC + "\nXL.SPECS.x={people:1500};", SPEC_SRC);
const twenty = LAKE.filter(L => L.key !== 'pher').map(L => L.key);
T.ok('the tune has the twenty lake towns (every lake record but Phēr); ' + keys.length + ' specified so far, ' + (twenty.length - keys.length) + ' to come',
  twenty.length === 20 && keys.every(k => twenty.indexOf(k) >= 0), 'to come: ' + twenty.filter(k => !XL.SPECS[k]).join(', '));
T.ok('the household is the tune\'s (XL.HH = XAN_TUNE.farm.hh)', XL.HH === XAN_TUNE.farm.hh && XL.HH > 0, String(XL.HH));

// ---------------------------------------------------------------- the checks' tools
const segD = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(a[0] + dx * t - p[0], a[1] + dz * t - p[1]); };
const corners = o => obbCorners({ c: o.c, u: o.u, v: [-o.u[1], o.u[0]], hw: o.hw, hd: o.hd });
const pen = (A, B) => SL.pen({ c: A.c, u: A.u, v: [-A.u[1], A.u[0]], hw: A.hw, hd: A.hd }, { c: B.c, u: B.u, v: [-B.u[1], B.u[0]], hw: B.hw, hd: B.hd });
function overlaps(list, eps) { const I = KSPACE.create({ cell: 60 }); let n = 0, first = null;
  list.forEach((p, i) => { p._i = i; I.insert(p, p.x, p.z, Math.hypot(p.bo.hw, p.bo.hd)); });
  list.forEach(A => I.query(A.x, A.z, Math.hypot(A.bo.hw, A.bo.hd)).forEach(B => { if (B._i > A._i && pen(A.bo, B.bo) > eps) { n++; first = first || A.id + ' ' + A.key + ' x ' + B.id + ' ' + B.key; } }));
  return { n, first }; }
// the pieces a way may cross: the bridge carries the shore road, the shrines stand at the stairs' heads, the beach's works stand
// below the shore road (their backs may reach its verge)
const OVER_WAYS = { xa_bridge: 1, xa_wayside_shrine: 1 };
function onStreets(list, ways) { let n = 0, first = null;
  for (const p of list) { if (p.kind === 'stall' || p.water || OVER_WAYS[p.key]) continue; const C = corners(p.bo).concat([p.bo.c]);
    if (ways.some(w => { for (let i = 1; i < w.pts.length; i++) for (const q of C) if (segD(q, w.pts[i - 1], w.pts[i]) < w.w / 2 - 0.05) return true; return false; })) { n++; first = first || p.id; } }
  return { n, first }; }
const WET_OK = { xa_quay: 1, xa_boatshed: 1, xa_ghat: 1, xa_fish_racks: 1, xa_dye_works: 1, xa_slipway: 1, xa_slip: 1, xa_drydock: 1 };   /* the shipwrights' slipways, slips and dry dock stand out into the lake as the sheds do (XL.WATER_KEYS) */   /* the dye works' wash runs down the beach too */   /* the racks stand on the beach, their poles' feet may touch the wet sand */
/* a bridge is judged by its corners (its abutments): its middle stands over its stream's bed, which meets the lake's level at the mouth */
const inWater = (key, list) => list.filter(p => !WET_OK[p.key] && corners(p.bo).concat(p.key === 'xa_bridge' ? [] : [p.bo.c]).some(q => xlH(key, q[0], q[1]) < 0.2));
const onStream = (key, G, list) => !G.stream ? [] : list.filter(p => p.key !== 'xa_bridge' && corners(p.bo).concat([p.bo.c]).some(q => { const d = xlShoreZ(key, q[0]) - q[1]; return d > 0 && d < G.stream.to && Math.abs(q[0] - xlStreamXd(G, d)) < 9; }));
const census = (C, people) => Math.abs(C.houses * XL.HH - people) <= people * 0.1;

// ---------------------------------------------------------------- 2. each built town
for (const key of keys.filter(k => XL.FIT[k])) {
  const S = XL.SPECS[key], tune = XL.tune(key), N = tune.name;
  let Tn = null, err = null;
  try { Tn = xlRun(key); } catch (e) { err = String(e && e.stack || e); }
  T.ok(N + ': the plan lays on core/city with no error', !err && Tn && Tn.place.length > 100, err || Tn.place.length + ' placed');
  if (!Tn) continue;
  const P = Tn.place, G = Tn.geo, C = Tn.census;
  // the census
  T.ok(N + ': the census: ' + C.houses + ' houses x ' + XL.HH + ' = ' + C.peopleHoused + ' within 10 % of the tune\'s ' + tune.people, census(C, tune.people),
    JSON.stringify(C.byQuarter) + ', wealth ' + JSON.stringify(C.wealth) + ', Andean ' + C.andean);
  T.neg(N + ': ...its negative: a town of half its houses is caught', c => census(c, tune.people), Object.assign({}, C, { houses: Math.round(C.houses / 2) }), C);
  const shortQ = Object.keys(C.byQuarter).filter(q => C.byQuarter[q][0] < C.byQuarter[q][1] * 0.85);
  T.ok(N + ': each quarter within 15 % of its share (' + S.quarters.map(q => q.id + ' ' + C.byQuarter[q.id].join('/')).join(', ') + ')', shortQ.length === 0, 'short: ' + shortQ.join(', '));
  const sh = C.wealth, tot = sh.poor + sh.middle + sh.rich, got = [sh.poor / tot, sh.middle / tot, sh.rich / tot];
  T.ok(N + ': the wealth near the spec\'s ' + S.wealth.join('/') + ' (within .12 each), the Andean set near its ' + S.andean + ' (within .1)',
    got.every((v, i) => Math.abs(v - S.wealth[i]) <= .12) && Math.abs(C.andean / tot - S.andean) <= .1, got.map(v => v.toFixed(2)).join('/') + ', Andean ' + (C.andean / tot).toFixed(2));
  // the footprints
  const ov = overlaps(P, 0.1);
  T.ok(N + ': no two footprints overlap (exact SAT, 0.1 m)', ov.n === 0, ov.n + ' pairs, first ' + ov.first);
  T.neg(N + ': ...its negative: a house moved onto its neighbour is caught', L => overlaps(L, 0.1).n === 0,
    P.map((p, i) => i === 1 ? Object.assign({}, p, { x: P[0].x, z: P[0].z, bo: Object.assign({}, p.bo, { c: P[0].bo.c }) }) : p), P);
  const st = onStreets(P, Tn.ways);
  T.ok(N + ': no house, work or landmark on a way\'s carriageway (the bridge and the shrines at the stairs\' heads apart)', st.n === 0, st.n + ', first ' + st.first);
  const wet = inWater(key, P), str = onStream(key, G, P);
  T.ok(N + ': nothing but the water pieces stands in the lake; nothing but the bridge on the stream', wet.length === 0 && str.length === 0,
    wet.slice(0, 3).map(p => p.id + ' ' + p.key).join(', ') + ' | ' + str.slice(0, 3).map(p => p.id + ' ' + p.key).join(', '));
  T.neg(N + ': ...its negative: a house set out in the lake is caught', L => inWater(key, L).length === 0,
    P.concat([Object.assign({}, P.find(p => p.kind === 'house'), { bo: { c: [0, 300], u: [1, 0], hw: 5, hd: 5 } })]), P);
  // the shore
  const deck = p => Math.abs(p.o.y) <= 2;
  const shoreP = P.filter(p => p.key === 'xa_quay' || p.key === 'xa_ghat');
  T.ok(N + ': the quay and the landing stair at the water\'s edge (decks within 2 m of the level, their fronts over the water)',
    shoreP.length >= 2 && shoreP.every(p => deck(p) && xlH(key, p.x + p.bo.u[1] * 0 + Math.sin(p.ry) * p.d / 2, p.z + Math.cos(p.ry) * p.d / 2) < 0),
    shoreP.map(p => p.key + ' deck ' + p.o.y.toFixed(1) + ' front ' + xlH(key, p.x + Math.sin(p.ry) * p.d / 2, p.z + Math.cos(p.ry) * p.d / 2).toFixed(1)).join(', '));
  const B = Tn.boats, all = B.moored.concat(B.out);
  const boatBad = list => list.filter(b => { const h = xlH(key, b.x, b.z); return b.beached ? !(h > -1.5 && h < 2) : h > -0.5; });
  T.ok(N + ': the craft: ' + B.moored.filter(b => b.key === 'xa_dugout').length + ' + ' + B.out.length + ' dugouts (the spec\'s ' + S.craft.dugouts + '), every one afloat or drawn up on the beach or the stair',
    all.filter(b => b.key === 'xa_dugout').length === S.craft.dugouts && all.filter(b => b.key === 'xa_launch').length === S.craft.launches &&
    all.filter(b => b.key === 'xa_lake_barge').length === S.craft.barges && boatBad(all).length === 0, boatBad(all).slice(0, 3).map(b => b.id + ' ' + xlH(key, b.x, b.z).toFixed(1)).join(', '));
  T.neg(N + ': ...its negative: a dugout fishing on dry land is caught', L => boatBad(L).length === 0, all.concat([{ id: 'x', key: 'xa_dugout', x: 0, z: -200, beached: false }]), all);
  // the trade and the landmarks
  const miss = S.works.filter(w => P.filter(p => p.key === w.key).length < w.n).map(w => w.key + ' ' + P.filter(p => p.key === w.key).length + '/' + w.n)
    .concat(S.landmarks.filter(l => !P.some(p => p.key === l.key)).map(l => l.key));
  T.ok(N + ': the spec\'s works in their numbers and every landmark placed', miss.length === 0, miss.join(', '));
  // the fields on their benches
  const offBench = Tn.fields.filter(f => { const b = G.benches[f.bench]; return f.poly.some(p => { const d = xlShoreZ(key, p[0]) - p[1]; return d < b.d0 - .5 || d > b.d1 + .5 || p[0] < b.x0 - .5 || p[0] > b.x1 + .5; }); });
  T.ok(N + ': ' + Tn.fields.length + ' fields, each on its bench', Tn.fields.length >= G.benches.length && offBench.length === 0, offBench.map(f => f.id).join(', '));
  // the ruins: the spec's count of ruined houses (within 10 %), the ruined quarter holding them, none counted in the census
  if (S.ruins) {
    const ru = P.filter(p => p.kind === 'ruin'), off = ru.filter(p => p.quarter !== S.ruins.quarter);
    T.ok(N + ': the old town: ' + ru.length + ' ruined houses (the spec\'s ' + S.ruins.houses + '), all in the ' + S.ruins.quarter + ' quarter, none in the census',
      Math.abs(ru.length - S.ruins.houses) <= S.ruins.houses * 0.1 && off.length === 0 && P.filter(p => p.kind === 'house' && /^xa_ruin_/.test(p.key)).length === 0,
      off.length + ' outside their quarter');
  }
  // the fields' crops: the spec's bucket from kits/crops (what the Vale grows by rain), else the terraces' grain
  const FS = S.layout.fields || {}, FB = FS.bucket, badCrop = Tn.fields.filter(f => FS.crop ? !(f.crop === FS.crop && CROPS.BY_ID[f.crop] && (!FS.orchard || CROPS.BY_ID[f.crop].form === 'tree')) : FB ? !(CROPS.BY_ID[f.crop] && CROPS.BY_ID[f.crop].bucket === FB && CROPS.BY_ID[f.crop].form !== 'tree') : f.bucket !== 'grain');
  T.ok(N + ': the benches\' crops ' + (FS.crop ? 'kits/crops\' ' + FS.crop + (FS.orchard ? ' (a tree: the orchard plots)' : '') : FB ? 'from kits/crops\' ' + FB + ' plants' : 'the terraces\' grain') + ' (' + [...new Set(Tn.fields.map(f => f.crop))].join(', ') + ')',
    badCrop.length === 0, badCrop.map(f => f.id + ' ' + f.crop).join(', '));
  // the same twice
  const sig = T2 => T2.place.map(p => p.key + '@' + p.x.toFixed(2) + ',' + p.z.toFixed(2)).join('|') + '#' + T2.boats.out.map(b => b.x.toFixed(2)).join(',');
  const a = sig(Tn), b2 = sig(xlRun(key));
  T.ok(N + ': the same plan twice (KRAND)', a === b2, a.length + ' / ' + b2.length);
}
T.done();
