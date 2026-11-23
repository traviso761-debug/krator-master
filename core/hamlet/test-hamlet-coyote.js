// node core/hamlet/test-hamlet-coyote.js: the Coyote Men's three rows (22-hamlet-coyote.js) across village, platform,
// alcove, terrace and kits/resources gem nodes. Each check has a negative (tools/ktest.js: fails on the fault, passes on the fix).
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const T = require('../../tools/ktest.js')(__filename);
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/city/33-city-strategies.js');
const OLD = fs.readdirSync(__dirname).filter(f => /^\d\d-hamlet-.*\.js$/.test(f) && f < '40' && f !== '22-hamlet-coyote.js').sort();
OLD.forEach(f => load('core/hamlet/' + f));
const H = KHAMLET;

// ---- 1. Opt-in proof: loading 22-hamlet-coyote.js moves no existing village, platform or terrace
const stubDims = k => (k.length % 3 ? { w: 10, d: 8, h: 5 } : { w: 7, d: 6, h: 4 });
const vspec = (row, focus, w) => ({ id: 'old-' + row + '-' + focus, world: w == null ? 7 : w, culture: row, focus,
  site: { x: 0, z: 0 }, link: { x: 420, z: 60 }, resource: { x: -160, z: 40 }, dims: stubDims });
const rectPts = (w, d) => [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
const digest = w => JSON.stringify({
  foci: H.FOCI,
  ie: H.FOCI.map(f => H.hashOf(H.village(vspec('islander_east', f, w)))),
  xa: ['farming', 'ranch'].map(f => H.hashOf(H.village(vspec('xanadu', f, w)))),
  iz: ['farming', 'ranch'].map(f => H.hashOf(H.village(vspec('iziz', f, w)))),
  pl: H.hashOf(H.platform({ id: 'kimr-1', world: w == null ? 11 : w, culture: 'kimr', focus: 'farming',
    plinth: { pts: rectPts(72, 58), top: 10, foot: 0 }, link: { x: 300, z: 40 } })),
  tr: H.hashOf(H.terrace({ id: 'lok-1', world: w == null ? 21 : w, culture: 'lokhau', focus: 'farming', popMax: 80,
    slope: { origin: [0, 0], up: [0, 1], width: 52, foot: 0 }, link: { x: 0, z: -300 } }))
});
const before = digest(), rowsBefore = Object.keys(H.CULTURES).sort();
load('core/hamlet/22-hamlet-coyote.js');
T.neg('loading 22-hamlet-coyote.js moves no existing village, platform or terrace', d => d === before, digest(8), digest());
const added = Object.keys(H.CULTURES).filter(k => rowsBefore.indexOf(k) < 0).sort();
T.ok('22-hamlet-coyote.js registers coyote, coyote_peak and coyote_tier under kit coyote',
  added.join(',') === 'coyote,coyote_peak,coyote_tier' && added.every(k => H.CULTURES[k].kit === 'coyote'), added.join(', '));

// ---- 2. Every key in all three rows matches kits/coyote's declared boxes and carries a fallback box in row.pending
const SRC = fs.readdirSync(path.join(ROOT, 'kits', 'coyote', 'src')).filter(f => f.endsWith('.js'))
  .map(f => fs.readFileSync(path.join(ROOT, 'kits', 'coyote', 'src', f), 'utf8')).join('\n');
const SIZE = { 'CY_CELL.W': 5.4, 'CY_CLIFF.W': 4.6 }, num = s => SIZE[s] != null ? SIZE[s] : +s;
const declared = k => {
  const m = SRC.match(new RegExp("key:'" + k + "'[\\s\\S]{0,600}?\\bw:([\\d.]+|CY_\\w+\\.W),d:([\\d.]+|CY_\\w+\\.W),h:([\\d.]+)"));
  return m ? { w: num(m[1]), d: num(m[2]), h: +m[3] } : null;
};
const OVR = { cy_shrine_room: { w: 5, d: 5, h: 3.2 }, cy_hall: { w: 5, d: 5, h: 3.4 }, cy_round_room: { w: 5.2, d: 5.2, h: 2.36 }, cy_ladder: { w: 0.7, d: 0.4, h: 4 } };
const cyDims = k => OVR[k] || declared(k);
const rowKeys = R => {
  const out = new Set(), Q = R.platform || {}, TQ = R.terrace || {}, TR = R.trade || {};
  [R.religious, R.civic, R.general, R.food, R.warehouse, Q.room, Q.store, Q.kiva, Q.greatKiva, Q.court, Q.pen, Q.ladder,
    TQ.stair, TQ.wall, TR.serai, TR.store].forEach(k => k && out.add(k));
  Object.values(R.houses).forEach(v => Array.isArray(v) && v.forEach(h => out.add(h[0])));
  Object.values(R.works).forEach(ws => ws.forEach(w => out.add(w.key)));
  return [...out];
};
const boxMatch = (name, k) => {
  const R = H.CULTURES[name], a = cyDims(k), b = R.pending && R.pending[k];
  return !!(a && b && a.w === b.w && a.d === b.d && a.h === b.h && b.what);
};
const allPairs = added.flatMap(n => rowKeys(H.CULTURES[n]).map(k => [n, k]));
const badPairs = allPairs.filter(p => !boxMatch(p[0], p[1]));
T.neg('every key in coyote, coyote_peak and coyote_tier matches kits/coyote and has a fallback box in pending',
  ps => ps.every(p => boxMatch(p[0], p[1])), [['coyote', 'cy_nonesuch']], allPairs,
  badPairs.map(p => p.join(':')).join(', ') || allPairs.length + ' row keys checked');

// ---- 3. Open-ground villages (KHAMLET.village): all eight row-focus pairs with dims (real) and without dims (pending boxes)
const overlaps = v => {
  const R = v.records.map(r => H.rect(r.x, r.z, Math.cos(r.ry), -Math.sin(r.ry), r.w, r.d)), out = [];
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) if (H.overlap(R[i], R[j], 0)) out.push(v.records[i].id + '/' + v.records[j].id);
  return out;
};
const PAIRS = [['coyote', 'farming'], ['coyote', 'ranch'], ['coyote', 'salt'],
  ['coyote_peak', 'mine'], ['coyote_peak', 'quarry'], ['coyote_peak', 'ranch'],
  ['coyote_tier', 'farming'], ['coyote_tier', 'fishing']];
const layV = (row, focus, d) => H.village({ id: row + '-' + focus, world: 13, culture: row, focus,
  site: { x: 0, z: 0 }, link: { x: 400, z: 50 }, resource: { x: -90, z: 30 }, dims: d });
const realVs = PAIRS.map(p => layV(p[0], p[1], cyDims));
const pendVs = PAIRS.map(p => layV(p[0], p[1], null));
T.ok('every Coyote row and focus lays an open-ground village with zero overlaps and religious cy_runner_shrine',
  realVs.every(v => !v.error && overlaps(v).length === 0 && v.records.some(r => r.role === 'religious' && r.key === 'cy_runner_shrine')),
  realVs.filter(v => v.error).map(v => v.id + ': ' + v.error).join('; ') || PAIRS.length + ' villages');
T.neg('passing kits/coyote dims marks every record drawn; omitting dims lays the same footprints marked pending',
  vs => vs.every(v => !v.error && v.records.every(r => !r.pending)), pendVs, realVs);
T.neg('an unknown focus on a Coyote village returns a clean error',
  f => !layV('coyote', f, cyDims).error, 'piracy', 'farming');

// ---- 4. Peak mine on a kits/resources emerald or turquoise node (KRES.near)
load('kits/resources/src/42r-res-ore.js');
load('kits/resources/src/45r-res-field.js');
const KR = KRES.load(JSON.parse(fs.readFileSync(path.join(ROOT, 'kits', 'resources', 'data', 'geology.json'), 'utf8')));
const GD = KR.data().grid;
const gemNodes = KR.nodesIn({ x0: 0, z0: 0, x1: GD.fullW * GD.px_m, z1: GD.fullH * GD.px_m }, { families: ['emerald', 'turquoise'] });
const gemNode = gemNodes[0];
const nearGem = gemNode ? KR.near(gemNode.x + 60, gemNode.z, gemNode.kind, H.CULTURES.coyote_peak.reach.mine)[0] : null;
const gemVillage = kr => H.village({ id: 'peak-gem', world: 17, culture: 'coyote_peak', focus: 'mine', ore: gemNode.kind,
  kres: kr, site: { x: gemNode.x + 60, z: gemNode.z }, link: { x: gemNode.x - 400, z: gemNode.z + 120 }, dims: cyDims });
const GV = gemNode ? gemVillage(KR) : { error: 'no gem node in geology.json' };
T.neg('a Peak mine village with no explicit resource finds the nearest emerald or turquoise node in kits/resources',
  v => !v.error && v.resource && nearGem && v.resource.node === nearGem.id &&
    ['cy_adit', 'cy_ore_bench', 'cy_sorting_shed', 'cy_wash'].every(k => v.records.some(r => r.key === k && !r.pending)),
  gemNode ? gemVillage({ near: () => [] }) : GV, GV,
  GV.resource ? GV.resource.kind + ' ' + GV.resource.node + ' (' + gemNodes.length + ' gem nodes)' : GV.error);

// ---- 5. Platform, alcove and terrace by row name in KHAMLET.CULTURES
const tell = (rx, rz) => { const p = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; p.push([Math.cos(a) * rx, Math.sin(a) * rz]); } return p; };
const PV = o => H.platform(Object.assign({ id: 'valley-tell', world: 7, culture: 'coyote', focus: 'farming', popMax: 60, dims: cyDims,
  ground: { ok: () => true, h: () => 0 }, link: { x: 0, z: 120 }, plinth: { pts: tell(24, 20), top: 2.4, foot: 0 } }, o || {}));
const V0 = PV();
T.neg('coyote lays a 2-storey Catalhoyuk tell village by name with sunk cy_shrine_room and cy_hall and nothing pending',
  o => { const v = PV(o); return !v.error && v.pendingKeys.length === 0 && v.records.filter(r => r.sunk).map(r => r.key).sort().join() === 'cy_hall,cy_shrine_room'; },
  { dims: null }, {});
const aline = []; for (let i = 0; i <= 12; i++) { const a = (i / 12 - 0.5) * 1.2; aline.push([Math.sin(a) * 72, -Math.cos(a) * 40.5 + 22]); }
const PA = o => H.platform(Object.assign({ id: 'peak-alcove', world: 9, culture: 'coyote_peak', focus: 'mine', popMax: 30, dims: cyDims,
  ground: { ok: () => true, h: () => 0 }, link: { x: 0, z: 120 }, resource: { kind: 'emerald', x: 30, z: 62, workers: 24 },
  alcove: { line: aline, depth: 20, floor: 6, height: 9, foot: 0, side: 1 } }, o || {}));
T.neg('coyote_peak lays an alcove cliff-house village by name with sunk round rooms and four mine works below',
  o => { const v = PA(o); return !v.error && v.kind === 'alcove' && v.pendingKeys.length === 0 && v.records.some(r => r.key === 'cy_cliff_house'); },
  { alcove: { line: aline, depth: 8, floor: 6, height: 9, foot: 0, side: 1 } }, {});
const PT = o => H.terrace(Object.assign({ id: 'tier-street', world: 5, culture: 'coyote_tier', focus: 'farming', popMax: 70, dims: cyDims,
  slope: { origin: [0, 0], up: [0, -1], width: 44, foot: 0 }, link: { x: 0, z: 200 } }, o || {}));
T.neg('coyote_tier lays a stepped street by name with cy_stair_lane flights and cy_council + cy_runner_shrine below',
  o => { const v = PT(o); return !v.error && v.pendingKeys.length === 0 && v.site.rows >= 3 &&
    v.stairs.every(s => s.key === 'cy_stair_lane') && v.records.some(r => r.key === 'cy_council' && r.below); },
  { dims: null }, {});
T.done();
