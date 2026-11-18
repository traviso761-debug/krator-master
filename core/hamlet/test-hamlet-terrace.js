// node core/hamlet/test-hamlet-terrace.js: the terraced village (36-hamlet-terrace.js), Masuleh's rule. Each check has
// a negative (tools/ktest.js: it must fail on the fault and pass on the fix).
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const T = require('../../tools/ktest.js')(__filename);
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/city/33-city-strategies.js');
const OLD = fs.readdirSync(__dirname).filter(f => /^\d\d-hamlet-.*\.js$/.test(f)).sort().filter(f => f < '36');
OLD.forEach(f => load('core/hamlet/' + f));
const H = KHAMLET;

// ---- the opt-in proof: every village and platform answers the same before and after 36 loads
const vspec = (focus, w) => ({ id: 'old-' + focus, world: w == null ? 7 : w, culture: 'xanadu', focus, site: { x: 0, z: 0 }, link: { x: 400, z: -60 },
  dims: k => (k.length % 3 ? { w: 10, d: 8, h: 5 } : { w: 7, d: 6, h: 4 }) });
const box = (w, d, c) => [[c[0] - w / 2, c[1] - d / 2], [c[0] + w / 2, c[1] - d / 2], [c[0] + w / 2, c[1] + d / 2], [c[0] - w / 2, c[1] + d / 2]];
const pspec = { id: 'kimr-gate', world: 11, culture: 'kimr', focus: 'farming', plinth: { pts: box(72, 58, [1000, 2000]), top: 12, foot: 0 }, link: { x: 1300, z: 2060 } };
const digest = w => JSON.stringify({ foci: H.FOCI, rows: Object.keys(H.CULTURES), v: ['farming', 'ranch', 'fishing'].map(f => H.hashOf(H.village(vspec(f, w)))),
  p: H.hashOf(H.platform(Object.assign({}, pspec, { world: w == null ? 11 : w }))) });
const before = digest();
load('core/hamlet/36-hamlet-terrace.js');
T.neg('loading 36 moves no village or platform (three foci, the pending platform, FOCI and the rows unchanged)', d => d === before, digest(8), digest());

// ---- a pending row's terraced village on a slope
const tspec = o => Object.assign({ id: 'lok-step', world: 21, culture: 'lokhau', focus: 'farming', popMax: 120,
  slope: { origin: [500, -300], up: [0.6, 0.8], width: 60, foot: 40 }, link: { x: 500, z: -700 } }, o || {});
const V = H.terrace(tspec());
T.ok('a pending row lays a terraced village with no error', !V.error && V.site.rows >= 2 && V.stairs.length > 0,
  V.error || (V.site.rows + ' rows, ' + V.records.length + ' records, ' + V.stairs.length + ' stairs, ' + V.census.pop + ' people'));
T.ok('a terrace needs a slope and a focus it knows', !!H.terrace(tspec({ slope: null })).error && !!H.terrace(tspec({ focus: 'piracy' })).error);
T.ok('a slope too short for the rows is an error', !!H.terrace(tspec({ slope: Object.assign({}, tspec().slope, { length: 5 }) })).error);

// the frame: s along the contour, t uphill
const st = (v, x, z) => { const dx = x - v.site.x, dz = z - v.site.z; return [dx * v.frame.u[0] + dz * v.frame.u[1], dx * v.frame.v[0] + dz * v.frame.v[1]]; };
const inRows = v => v.records.filter(r => r.row != null).concat(v.stairs);
// Masuleh's rule: every row is covered across the whole width by records whose roofs stand at the next row's floor, backs to the hill
const rule = v => {
  const S = v.site, bad = [];
  for (let k = 0; k < S.rows; k++) {
    const iv = inRows(v).filter(r => r.row === k).map(r => {
      const p = st(v, r.x, r.z);
      if (Math.abs(r.y - (S.foot + k * S.step)) > 1e-6) bad.push(r.id + ' floor');
      if (Math.abs(r.y + r.h - (S.foot + (k + 1) * S.step)) > 0.05) bad.push(r.id + ' roof');
      if (Math.abs(p[1] + r.d / 2 - (k + 1) * S.depth) > 1e-6) bad.push(r.id + ' back');
      return [p[0] - r.w / 2, p[0] + r.w / 2];
    }).sort((a, b) => a[0] - b[0]);
    let cur = -S.width / 2;
    iv.forEach(i => { if (i[0] > cur + 1e-3) bad.push('row ' + k + ' gap at ' + cur.toFixed(2)); cur = Math.max(cur, i[1]); });
    if (cur < S.width / 2 - 1e-3) bad.push('row ' + k + ' short');
  }
  return bad;
};
const firstHouse = V.records.find(r => r.role === 'house' && r.row != null);
const lowered = Object.assign({}, V, { records: V.records.map(r => r === firstHouse ? Object.assign({}, r, { h: r.h - 1 }) : r) });
const holed = Object.assign({}, V, { records: V.records.filter(r => r !== firstHouse) });
T.neg('Masuleh: each row spans the width, its roofs at the next row\'s floor, its backs to the hill', v => rule(v).length === 0, lowered, V);
T.neg('Masuleh: a row with a hole in it is caught (the lane above would fall through)', v => rule(v).length === 0, holed, V);
T.ok('the row checks hold on the village itself', rule(V).length === 0, rule(V).slice(0, 4).join(' '));

// doors: a house in row k opens onto lane k, at its level, behind (uphill of) its strip
const doorsOk = v => v.records.filter(r => r.role === 'house' && r.row != null).every(r => {
  const L = v.lanes[r.row], p = st(v, r.door.x, r.door.z);
  return !!L && Math.abs(r.door.y - L.y) < 1e-6 && p[1] >= L.t1 - 1e-6 && p[1] - L.t1 < v.site.depth;
});
T.neg('every house\'s door opens onto the lane of its row, at the lane\'s level', doorsOk,
  Object.assign({}, V, { records: V.records.map(r => r === firstHouse ? Object.assign({}, r, { door: Object.assign({}, r.door, { y: r.door.y + 3.2 }) }) : r) }), V);

// the walk: from the foot street up the stairs to every lane and every door
const walk = v => {
  const seen = { [v.lanes[0].id]: true }, Q = [v.lanes[0].id], adj = {};
  v.stairs.forEach(s => {
    const a = v.lanes.find(l => l.id === s.from), b = v.lanes.find(l => l.id === s.to);
    if (!a || !b || Math.abs(s.y - a.y) > 1e-6 || Math.abs(s.y + s.h - b.y) > 1e-6 || !(s.landing < s.d)) return;
    (adj[s.from] = adj[s.from] || []).push(s.to); (adj[s.to] = adj[s.to] || []).push(s.from);
  });
  while (Q.length) (adj[Q.shift()] || []).forEach(n => { if (!seen[n]) { seen[n] = true; Q.push(n); } });
  return v.lanes.every(l => seen[l.id]);
};
T.neg('the walk climbs the stairs from the foot street to every lane (so to every door)', walk,
  Object.assign({}, V, { stairs: V.stairs.filter(s => s.row !== 1) }), V);

// no overlaps (plan and height)
const rectOf = r => H.rect(r.x, r.z, Math.cos(r.ry), -Math.sin(r.ry), r.w, r.d);
const overlaps = v => {
  const all = v.records.concat(v.stairs), out = [];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const a = all[i], b = all[j];
    if (!(a.y < b.y + b.h - 1e-6 && b.y < a.y + a.h - 1e-6)) continue;
    if (H.overlap(rectOf(a), rectOf(b), -0.05)) out.push(a.id + '/' + b.id);
  }
  return out;
};
T.neg('no two records overlap (party walls touch)', v => overlaps(v).length === 0,
  Object.assign({}, V, { records: V.records.concat([Object.assign({}, firstHouse, { id: 'dup', x: firstHouse.x + 1 })]) }), V);

// the census: every household housed; the headman's house in the top row
const housed = v => v.records.filter(r => r.role === 'house').reduce((a, r) => a + r.households, 0) >= v.census.households;
const headTop = v => { const h = v.records.find(r => r.tier === 'head'); return !!h && h.row === v.site.rows - 1; };
T.ok('every household has a house', housed(V), V.census.households + ' households');
const head = V.records.find(r => r.tier === 'head');
T.neg('the headman\'s house stands in the top row', headTop, Object.assign({}, V, { records: V.records.map(r => r === head ? Object.assign({}, r, { row: 0 }) : r) }), V);

// the foot: the works (and anything taller than a storey) below the foot street, facing it, within reach
const footOk = v => v.records.filter(r => r.role === 'works' || r.below).every(r => r.below && st(v, r.x, r.z)[1] + r.d / 2 <= -v.lanes[0].t1 + v.lanes[0].t0 + 1e-6);
const aWork = V.records.find(r => r.role === 'works');
T.ok('the focus has works', !!aWork);
T.neg('the works stand below the foot street', footOk, Object.assign({}, V, { records: V.records.map(r => r === aWork ? Object.assign({}, r, { x: r.x + V.frame.v[0] * 30, z: r.z + V.frame.v[1] * 30 }) : r) }), V);

// determinism and the frame: the same spec twice is the same village; moved and turned, the same ids at the same (s, t, y)
const rel = v => v.records.concat(v.stairs).map(r => { const p = st(v, r.x, r.z); return r.id + '|' + r.key + '|' + Math.round(p[0] * 100) + '|' + Math.round(p[1] * 100) + '|' + Math.round((r.y - v.site.foot) * 100); }).sort().join(';');
T.ok('the same spec gives the same village', H.hashOf(H.terrace(tspec())) === H.hashOf(V));
const moved = sp => H.terrace(tspec(Object.assign({ slope: { origin: [-9000, 7000], up: [-0.8, 0.6], width: 60, foot: 120 } }, sp || {})));
T.neg('moved and turned, a village keeps its ids at the same places on its frame', v => rel(v) === rel(V), moved({ id: 'lok-other' }), moved());

// a row of its own: real dims, a taller civic hall at the foot, its own stair and wall keys
const ROW = Object.assign({}, H.pendingRow('tiers'), {
  kit: 'tiers', pendingRow: false, civic: 'tr_council', religious: 'tr_shrine',
  houses: { poor: [['tr_ledge_poor', 1, 1]], middling: [['tr_ledge_mid', 1, 1]], head: [['tr_ledge_rich', 1, 1]], middlingShare: 0.35 },
  terrace: { step: 3.2, depth: 6, stair: 'tr_stair', wall: 'tr_wall' } });
const DIMS = { tr_council: { w: 10, d: 14, h: 6 }, tr_shrine: { w: 4, d: 4, h: 2.4 }, tr_ledge_poor: { w: 5, d: 6, h: 3.2 }, tr_ledge_mid: { w: 7, d: 6, h: 3.2 },
  tr_ledge_rich: { w: 9, d: 6, h: 3.2 }, tr_stair: { w: 2.4, d: 6, h: 3.2 }, tr_wall: { w: 4, d: 6, h: 3.2 } };
const R = H.terrace(tspec({ id: 'tier-1', culture: ROW, dims: k => DIMS[k] || null }));
const civ = R.records.find(r => r.role === 'civic');
T.ok('a row of its own lays with no error, its houses and stairs real', !R.error && !R.pendingKeys.some(k => /^tr_/.test(k)) && R.stairs.every(s => s.key === 'tr_stair'),
  R.error || R.pendingKeys.join(' '));
T.neg('a building taller than a storey stands at the foot (a lower one too: its roof would hole the lane)', v => ['civic', 'religious'].every(role => { const c = v.records.find(r => r.role === role); return !!c && c.below === true && c.row == null; }),
  Object.assign({}, R, { records: R.records.map(r => r === civ ? Object.assign({}, r, { below: undefined, row: 0 }) : r) }), R);
T.ok('the row of its own keeps Masuleh\'s rule and its walk', rule(R).length === 0 && walk(R) && doorsOk(R) && overlaps(R).length === 0, rule(R).concat(overlaps(R)).slice(0, 4).join(' '));

T.done();
