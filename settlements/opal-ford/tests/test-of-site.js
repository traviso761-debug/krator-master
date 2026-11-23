// node settlements/opal-ford/tests/test-of-site.js — Ōpal-Phōrḍ's plan (targets/town/89zp-of-site.js) on core/city, without the
// page. The Xanadu kit's boxes are read from its defs (XA.def({key, w, d, h}) in kits/xanadu, as core/world/bake_sites.py reads
// them), core/city's closure globals are handed in as KCITY.lib (the page's bundle does the same), the tune read in place. The
// checks, each with its negative pair (tools/ktest.js):
//   - the town lays with no error, every host with its def;
//   - no two standing footprints overlap (exact SAT, 0.1 m);
//   - no house stands on a street's carriageway or a road's;
//   - nothing but the footbridge's spans and the dugouts stands in the river; the dugouts at the waterline;
//   - nothing on a paddy, nothing of the town's in the Iridescent Order's precinct;
//   - the house (iridescent/BLUEPRINT.md): every piece with its def, the great monastery in the Turquoise dress, the cells'
//     arcades on their graded terraces, the Bow Terrace level, the pool's ledge over the water;
//   - the people the tune's 1,500 within 25 %;
//   - the han, the toll house, the Tears' post, the temple, the granaries, the mill, the footbridge, the dugouts, the terraces placed;
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
load('core/region/data/xan-tune.js');
// the kit's boxes from its defs (src and the opt-in extra/ pieces the page takes: kit.json)
global.OF_KIT_DIMS = {};
const XS = [path.join(ROOT, 'kits', 'xanadu', 'src'), path.join(ROOT, 'kits', 'xanadu', 'extra'), path.join(ROOT, 'kits', 'qiblai', 'src'), path.join(ROOT, 'settlements', 'opal-ford', 'src')];   /* qiblai and the page's own pieces: the Iridescent Order's house */
for (const f of [].concat(...XS.map(d => fs.readdirSync(d).filter(f => f.endsWith('.js')).map(f => path.join(d, f))))) {
  const s = fs.readFileSync(f, 'utf8'), re = /(?:XA|QB)\.def\(\{/g; let m;
  while ((m = re.exec(s))) { const head = s.slice(m.index, m.index + 1500), k = /key:\s*'([^']+)'/.exec(head), b = /\bw:\s*([\d.]+),\s*d:\s*([\d.]+)(?:,\s*h:\s*([\d.]+))?/.exec(head);
    if (k && b && !OF_KIT_DIMS[k[1]]) OF_KIT_DIMS[k[1]] = { w: +b[1], d: +b[2], h: b[3] == null ? 8 : +b[3] }; }
}
load('settlements/opal-ford/targets/town/89zp-of-site.js');

// ---------------------------------------------------------------- the checks' tools
const segD = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(a[0] + dx * t - p[0], a[1] + dz * t - p[1]); };
const corners = o => obbCorners({ c: o.c, u: o.u, v: [-o.u[1], o.u[0]], hw: o.hw, hd: o.hd });
const pen = (A, B) => SL.pen({ c: A.c, u: A.u, v: [-A.u[1], A.u[0]], hw: A.hw, hd: A.hd }, { c: B.c, u: B.u, v: [-B.u[1], B.u[0]], hw: B.hw, hd: B.hd });
function overlaps(list, eps) { const I = KSPACE.create({ cell: 60 }); let n = 0, first = null;
  list.forEach((p, i) => { p._i = i; I.insert(p, p.x, p.z, Math.hypot(p.bo.hw, p.bo.hd)); });
  list.forEach(A => I.query(A.x, A.z, Math.hypot(A.bo.hw, A.bo.hd)).forEach(B => { if (B._i > A._i && pen(A.bo, B.bo) > eps) { n++; first = first || A.id + ' ' + A.key + ' x ' + B.id + ' ' + B.key; } }));
  return { n, first }; }
function onStreets(list, ways) { let n = 0, first = null;
  for (const p of list) { if (p.kind !== 'house') continue; const C = corners(p.bo).concat([p.bo.c]);
    const hit = ways.some(w => { for (let i = 1; i < w.pts.length; i++) for (const q of C) if (segD(q, w.pts[i - 1], w.pts[i]) < w.w / 2 - 0.05) return true; return false; });
    if (hit) { n++; first = first || p.id; } }
  return { n, first }; }
const WET_OK = { xa_river_span: 1, xa_dugout: 1, xa_ford: 1, xa_ferry_raft: 1 };
const inRiver = list => list.filter(p => !WET_OK[p.key] && corners(p.bo).concat([p.bo.c]).some(q => ofH(q[0], q[1]) < ofW(q[1]) + 0.3));
const boatsBad = list => list.filter(p => p.key === 'xa_dugout').filter(p => { const h = ofH(p.x, p.z) - ofW(p.z); return h < -1.2 || h > 1.6; })
  .concat(list.filter(p => p.key === 'xa_ferry_raft').filter(p => corners(p.bo).concat([p.bo.c]).some(q => ofH(q[0], q[1]) > ofW(q[1]) - 0.4)));   /* the ferry raft afloat: every corner over 0.4 m of water */
const onPaddy = list => list.filter(p => corners(p.bo).concat([p.bo.c]).some(q => OF_WORKS.paddies.some(P => ofInPoly(q, P.poly))));
const inPrecinct = list => { const R = OF.PRECINCT; return list.filter(p => p.kind !== 'order' && p.kind !== 'bridge').filter(p => corners(p.bo).concat([p.bo.c]).some(q => q[0] > R.x[0] && q[0] < R.x[1] && q[1] > R.z[0] && q[1] < R.z[1])); };

// ---------------------------------------------------------------- 1. the plan lays
const P = OF_PLACE, houses = P.filter(p => p.kind === 'house');
const hostErr = (OF_TOWN.hosts || []).filter(c => c.err);
T.ok('the town lays with no error, every host with its def', !OF_ERR && houses.length > 150 && !hostErr.length,
  OF_ERR || (houses.length + ' houses, ' + (P.length - houses.length) + ' hosts' + (hostErr.length ? '; no def: ' + hostErr.map(c => c.key).join(', ') : '')));
T.neg('...its negative: an empty plan is caught', n => n > 150, 0, houses.length);

// ---------------------------------------------------------------- 2. no overlap
const ov = overlaps(P, 0.1);
T.ok('no two standing footprints overlap (exact SAT, 0.1 m)', ov.n === 0, ov.n + ' pairs' + (ov.first ? ', first ' + ov.first : ''));
{ const a = houses[0], dup = Object.assign({}, a, { id: 'dup', bo: Object.assign({}, a.bo, { c: [a.bo.c[0] + 1, a.bo.c[1]] }) });
  T.neg('...its negative: a house copied a metre over is caught', L => overlaps(L, 0.1).n === 0, P.concat([dup]), P); }

// ---------------------------------------------------------------- 3. off the streets and the roads
const os = onStreets(P, OF.ways);
T.ok('no house stands on a street\'s or a road\'s carriageway', os.n === 0, os.n + ' on a way' + (os.first ? ', first ' + os.first : ''));
{ const a = houses[0], w = OF.ways[0], q = w.pts[Math.floor(w.pts.length / 2)], moved = Object.assign({}, a, { id: 'moved', bo: Object.assign({}, a.bo, { c: q }) });
  T.neg('...its negative: a house moved onto the high street is caught', L => onStreets(L, OF.ways).n === 0, [moved], [a]); }

// ---------------------------------------------------------------- 4. out of the river; the boats at its edge
const wet = inRiver(P), bb = boatsBad(P);
T.ok('nothing but the footbridge\'s spans and the dugouts stands in the river; the dugouts drawn up at the waterline', !wet.length && !bb.length,
  wet.length + ' in the river' + (wet[0] ? ' (' + wet[0].id + ' ' + wet[0].key + ')' : '') + ', ' + bb.length + ' dugouts off the waterline');
{ const a = houses[0], sunk = Object.assign({}, a, { id: 'sunk', bo: Object.assign({}, a.bo, { c: [ofRiverX(400), 400] }) });
  T.neg('...its negative: a house set in the channel is caught', L => inRiver(L).length === 0, [sunk], [a]); }

// ---------------------------------------------------------------- 5. off the paddies; the precinct kept
const pd = onPaddy(P), pr = inPrecinct(P);
T.ok('nothing stands on a paddy; nothing of the town\'s in the Iridescent Order\'s precinct', !pd.length && !pr.length && OF_WORKS.paddies.length > 60,
  pd.length + ' on a paddy' + (pd[0] ? ' (' + pd[0].id + ' ' + pd[0].key + ')' : '') + ', ' + pr.length + ' in the precinct, ' + OF_WORKS.paddies.length + ' paddies');
{ const a = houses[0], R = OF.PRECINCT, inp = Object.assign({}, a, { id: 'in', bo: Object.assign({}, a.bo, { c: [(R.x[0] + R.x[1]) / 2, (R.z[0] + R.z[1]) / 2] }) });
  T.neg('...its negative: a house set in the precinct is caught', L => inPrecinct(L).length === 0, [inp], [a]); }

// ---------------------------------------------------------------- 5b. the Iridescent Order's house (iridescent/BLUEPRINT.md)
// every piece with its def; the great monastery in the Turquoise dress (o.v 4); each terrace's arcades standing on its graded
// level (the Bow Terrace's less 2.2 m a terrace); the Bow Terrace level over its whole length; the pool's ledge over the water
function houseBad(H, bowY) { const bad = [], Hh = OF.HOUSE;
  if (H.errs.length) bad.push('no def: ' + H.errs.join(', '));
  const m = H.place.find(p => p.key === 'qb_monastery'); if (!m || m.v !== 4) bad.push('the great monastery missing or not Turquoise');
  H.place.filter(p => p.key === 'of_cell_range').forEach(p => { const k = Hh.terr.findIndex(vt => Math.abs(p.x - Hh.x0 - (vt - 5)) < 1), lv = bowY - Hh.cut * (k + 1);
    if (k < 0 || Math.abs(ofH(p.x, p.z) - lv) > .3) bad.push(p.id + ' off its terrace (' + ofH(p.x, p.z).toFixed(2) + ' / ' + lv.toFixed(2) + ')'); });
  if (H.place.filter(p => p.key === 'of_cell_range').length !== Hh.terr.length) bad.push('a terrace without its cells');
  /* the Spray Stair: each flight's top and foot on the ground of the platforms it joins (within 0.4 m) */
  for (const S of H.stairs) { const t = ofH(S.xTop + 1.5, S.z) - S.yTop, b = ofH(S.xBot - 1.5, S.z) - S.yBot; if (Math.abs(t) > .4 || Math.abs(b) > .4) bad.push('stair ' + S.id + ' off its platforms (' + t.toFixed(2) + ', ' + b.toFixed(2) + ')'); }
  for (const u of [Hh.bow.u[0] + 6, (Hh.bow.u[0] + Hh.bow.u[1]) / 2, Hh.bow.u[1] - 6]) { const h = ofH(Hh.x0 - 42, Hh.z0 + u); if (Math.abs(h - bowY) > .05) bad.push('the Bow Terrace not level at u ' + u + ' (' + h.toFixed(2) + ')'); }
  for (const u of Hh.ledge.u) { const z = Hh.z0 + u, x = Hh.x0 + (Hh.ledge.v[0] + Hh.ledge.v[1]) / 2; if (ofH(x, z) - ofW(z) < 1.5) bad.push('the pool\'s ledge ' + (ofH(x, z) - ofW(z)).toFixed(2) + ' m over the water at u ' + u); }
  return bad; }
{ const H = OF_HOUSE, bad = houseBad(H, ofBowY);
  T.ok('the Iridescent Order\'s house: ' + H.place.length + ' pieces, the monastery Turquoise, the cells on their terraces, the Spray Stair on its platforms, the Bow Terrace level, the ledge over the water',
    !bad.length && H.place.length >= 40, bad.slice(0, 4).join('; ') || ('the Bow Terrace at ' + ofBowY.toFixed(2) + ' m over the ford\'s water'));
  T.neg('...its negative: the cells checked against the wrong level are caught', b => houseBad(H, b).length === 0, ofBowY + 1, ofBowY); }

// ---------------------------------------------------------------- 6. the people and the hosts
const ppl = OF.people.total, tune = OF.people.tune;
T.ok('the people the tune\'s ' + tune + ' (XAN_TUNE.opalford) within 25 %', ppl > tune * .75 && ppl < tune * 1.25, ppl + ' in ' + houses.length + ' houses');
const want = ['xa_ford', 'xa_ferry_raft', 'xa_fish_racks', 'xa_caravanserai', 'xa_customs_house', 'xa_watch', 'xa_temple', 'xa_guild_farm', 'xa_granary', 'xa_watermill', 'xa_river_span', 'xa_dugout', 'xa_farm', 'xa_farmhouse'];
const have = new Set(P.filter(p => p.kind !== 'house').map(p => p.key)), miss = want.filter(k => !have.has(k));
T.ok('the han, the toll house, the Tears\' post, the temple, the grain office, the granaries, the mill, the footbridge, the dugouts and the terraces placed', !miss.length,
  miss.length ? 'missing ' + miss.join(', ') : (P.length - houses.length) + ' hosts');
T.ok('the tune\'s record is read in place', typeof XAN_TUNE !== 'undefined' && OF_TUNE === XAN_TUNE.opalford, OF_TUNE.id);

// ---------------------------------------------------------------- 7. the same twice
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h.toString(16); };
const H1 = fnv(JSON.stringify(OF_PLACE.map(p => [p.id, p.key, p.x, p.z, p.ry])));
OF_PLACE.length = 0; ofRun();
const H2 = fnv(JSON.stringify(OF_PLACE.map(p => [p.id, p.key, p.x, p.z, p.ry])));
T.ok('the plan is the same run twice (KRAND)', H1 === H2, H1 + ' / ' + H2);
const byKey = {}; OF_PLACE.forEach(p => { if (p.kind === 'house') byKey[p.key] = (byKey[p.key] || 0) + 1; });
console.log('placed ' + OF_PLACE.length + ', houses ' + OF_PLACE.filter(p => p.kind === 'house').length + ', people ' + ppl + ' ' + JSON.stringify(byKey));
T.done();
