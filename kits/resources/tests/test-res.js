// node kits/resources/tests/test-res.js   ->  'all passed'
// The geology data, the node field (45r-res-field.js), the placers, the evaporite rings and the scarcity ledger
// (46r-res-ledger.js), each check with a negative. --ledger writes kits/resources/data/ledger.json (the ledger the trade
// and Godot read) and godot/golden-field.json (the GDScript twin's vectors); the test then checks both match a fresh build.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..', '..'), KIT = path.resolve(__dirname, '..');
const run = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js',
 'kits/resources/src/42r-res-ore.js', 'kits/resources/src/43r-res-fields.js', 'kits/resources/src/45r-res-field.js',
 'kits/resources/src/46r-res-ledger.js'].forEach(run);
const DATA = JSON.parse(fs.readFileSync(path.join(KIT, 'data', 'geology.json'), 'utf8'));
let fails = 0, n = 0;
function ok(c, msg) { n++; if (!c) { fails++; console.log('FAIL', msg); } }
function throws(f, msg) { let t = false; try { f(); } catch (e) { t = true; } ok(t, msg + ' (should throw)'); }
const G = RES_GEO.load(DATA), PM = DATA.grid.px_m;
const key = n => n.id + '@' + n.gx.toFixed(3) + ',' + n.gz.toFixed(3) + ':' + n.grade;
const ids = ns => ns.map(key).sort();

/* ---- the data */
ok(DATA.format === 'krator-geology' && DATA.version === 1, 'format');
throws(() => RES_GEO.load({ format: 'x' }), 'not geology data');
const N = DATA.grid.w * DATA.grid.h;
ok(G.prospect('iron', 1000 * PM, 700 * PM) >= 0 && G.at(1000 * PM, 700 * PM) && G.at(-5e6, 0) === null, 'at / off the grid');
{ const bad = JSON.parse(JSON.stringify(DATA)); bad.layers.iron = bad.layers.iron.slice(0, 40); RES_GEO.load(bad);
  throws(() => RES_GEO.prospect('iron', 0, 0), 'a truncated layer'); RES_GEO.load(DATA); }
ok(DATA.families.every(f => DATA.layers[f]), 'every family has a layer');
/* the carbonate (tools/scale-model/geology.py carbonate()): the Hykkousoi platform is the carbonate province, and the
   limestone layer is a rock family that the node field does not place */
{ const kg = G.at(508 * PM, 395 * PM), sed = G.at(1000 * PM, 700 * PM);
  ok(DATA.provinces[6] === 'carbonate' && kg.province === 'carbonate' && kg.p.limestone >= 128, 'k-guilin is the carbonate province');
  ok(sed.province !== 'carbonate', 'negative: the eastern uplands are not');
  ok(DATA.rockFamilies.indexOf('limestone') >= 0 && DATA.field.families.indexOf('limestone') < 0, 'limestone is a rock layer, not a node kind'); }

/* ---- the field: deterministic, streamable (any tile alone), every node kept by the rule */
const T0 = { x0: 1100 * PM, z0: 660 * PM, x1: 1160 * PM, z1: 720 * PM };   /* 120 km of the eastern uplands */
const A = G.nodesIn(T0), B = G.nodesIn(T0);
ok(A.length > 50 && JSON.stringify(ids(A)) === JSON.stringify(ids(B)), 'deterministic (' + A.length + ' nodes)');
{ const mx = (T0.x0 + T0.x1) / 2, mz = (T0.z0 + T0.z1) / 2, q = [];
  [[T0.x0, T0.z0, mx, mz], [mx, T0.z0, T0.x1, mz], [T0.x0, mz, mx, T0.z1], [mx, mz, T0.x1, T0.z1]].reverse()
    .forEach(t => q.push(...G.nodesIn({ x0: t[0], z0: t[1], x1: t[2], z1: t[3] })));
  ok(JSON.stringify(ids(q)) === JSON.stringify(ids(A)), 'four quarter tiles, built in any order, give the whole tile');
  const shifted = G.nodesIn({ x0: T0.x0 + 20000, z0: T0.z0, x1: T0.x1 + 20000, z1: T0.z1 });
  ok(JSON.stringify(ids(shifted)) !== JSON.stringify(ids(A)), 'negative: a different tile is a different set'); }
ok(new Set(A.map(n => n.id)).size === A.length, 'ids unique');
ok(A.filter(n => n.src === 'field').every(n => /^res:[a-z-]+:-?\d+:-?\d+$/.test(n.id) && n.p > 0), 'field ids, and no node where the prospectivity is 0');
{ let bad = 0, kept = 0;
  for (let ix = 360; ix < 380; ix++) for (let iz = 270; iz < 290; iz++) { const c = G.candidate('iron', ix, iz);
    const s = KRAND.cell(KRAND.child(DATA.field.world, 'res:iron'), ix, iz), u = KRAND.unit(KRAND.hash(s, 1));
    if (c.kept !== (Math.floor(u * 255) < c.p)) bad++; if (c.kept) kept++;
    const C = DATA.field.cells.iron, ins = DATA.field.inset;
    if (c.gx < (ix + ins) * C - 1e-6 || c.gx > (ix + 1 - ins) * C + 1e-6) bad++; }
  ok(!bad && kept > 0, 'kept iff floor(unit x 255) < prospectivity, inside the inset (' + kept + ' of 400)'); }
{ const sea = G.nodesIn({ x0: 10 * PM, z0: 10 * PM, x1: 50 * PM, z1: 50 * PM });   /* the north-west ocean */
  ok(sea.length === 0, 'negative: no node at sea (' + sea.length + ')'); }

/* ---- the drop rule: water and cliffs drop a kept candidate, never re-roll it */
{ const st = {}, wet = G.nodesIn(T0, { ground: () => ({ water: true }), stats: st });
  ok(wet.filter(n => n.src !== 'owner').length === 0 && st.water > 0, 'all water: everything dropped (' + st.water + ')');
  const steep = G.nodesIn(T0, { ground: (x, z) => ({ slope: (Math.floor(x / 1000) % 2) ? 1.2 : 0.1 }) });
  const all = new Set(ids(G.nodesIn(T0, { ground: () => ({ slope: 0 }) })));
  ok(steep.length > 0 && steep.length < all.size && ids(steep).every(k => all.has(k)), 'a cliff drops its node; the rest stand where they stood (no re-roll)'); }

/* ---- the host's frame, owner nodes and deltas by id */
{ const O = { x: 1130 * PM, z: 690 * PM }, loc = G.nodesIn({ x0: T0.x0 - O.x, z0: T0.z0 - O.z, x1: T0.x1 - O.x, z1: T0.z1 - O.z }, { origin: O });
  ok(loc.length === A.length && loc.every(n => Math.abs(n.x - (n.gx - O.x)) < 1e-6), 'a local frame (origin) moves nothing'); }
{ const a = A.find(n => n.src === 'field'), b = A.filter(n => n.src === 'field')[1];
  const R = G.nodesIn(T0, { owner: [{ id: a.id, kind: a.kind, grade: 'high', x: a.gx + 5, z: a.gz }, { id: 'owner:1', kind: 'iron', grade: 'low', x: T0.x0 + 10, z: T0.z0 + 10 }],
    deltas: { [b.id]: { removed: true } } });
  const ra = R.filter(n => n.id === a.id);
  ok(ra.length === 1 && ra[0].src === 'owner' && ra[0].grade === 'high', 'an owner node replaces the field node of its id');
  ok(R.some(n => n.id === 'owner:1') && !R.some(n => n.id === b.id) && R.length === A.length, 'an owner node adds; a delta removes by id');
  const R2 = G.nodesIn(T0, { deltas: { [b.id]: { grade: 'low' } } });
  ok(R2.find(n => n.id === b.id).grade === 'low', 'a delta edits a grade');
  ok(!G.nodesIn(T0, { deltas: { 'res:none:0:0': { removed: true } } }).some(n => n.edited), 'negative: a delta for no node edits nothing'); }

/* ---- the cross-engine check: the bake's own lode field (numpy KRAND) is this field (the coarse rule) */
for (const fam of ['gold', 'tin']) {
  const C = DATA.field.cells[fam], nx = Math.ceil(DATA.grid.fullW * PM / C), nz = Math.ceil(DATA.grid.fullH * PM / C), rows = [];
  for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) { const c = G.candidate(fam, ix, iz);
    if (c.kept && !c.drop) rows.push([ix, iz, c.grade === 'high' ? 2 : c.grade === 'medium' ? 1 : 0.5]); }
  rows.sort((p, q) => p[1] - q[1] || p[0] - q[0]);
  const txt = rows.map(r => r[0] + ',' + r[1] + ',' + r[2]).join(';'), sha = require('crypto').createHash('sha1').update(txt).digest('hex').slice(0, 16);
  const want = DATA.stats.lodes[fam];
  ok(rows.length === want.count && sha === want.sha1, fam + ' lodes: JS ' + rows.length + ' ' + sha + ' = bake ' + want.count + ' ' + want.sha1);
}

/* ---- the placers: down the rivers, from the lodes */
{ const P = DATA.placers;
  ok(P.length > 100 && new Set(P.map(p => p.id)).size === P.length, 'placers: ' + P.length + ', ids unique');
  ok(P.every(p => /^res:placer-(gold|tin):r\d+:\d+$/.test(p.id) && RES_ORE.grades[p.grade]), 'placer ids and grades');
  ok(P.every(p => ['flatten', 'mouth', 'confluence'].indexOf(p.why) >= 0), 'every placer where the flow slows');
  const t = { x0: 0, z0: 0, x1: DATA.grid.fullW * PM, z1: DATA.grid.fullH * PM };
  const with_ = G.nodesIn(t, { families: ['gold'], placers: true }).filter(n => n.placer).length;
  const without = G.nodesIn(t, { families: ['gold'], placers: false }).filter(n => n.placer).length;
  ok(with_ > 0 && without === 0, 'placers in the field (' + with_ + '), and none with placers:false'); }

/* ---- the evaporite rings: the Catch's salts (potash, alkali) where its closed basins dry */
{ const catchP = [[763, 1061.5], [809, 1083.6], [799, 1097.6], [835.1, 1079.6]];
  const near = (k, at) => G.near(at[0] * PM, at[1] * PM, k, 30000).length;
  const sum = k => catchP.reduce((s, p) => s + near(k, p), 0);
  ['gypsum', 'halite', 'potash', 'alkali'].forEach(k => ok(sum(k) > 0, 'the Catch has ' + k + ' nodes (' + sum(k) + ')'));
  ok(near('potash', [575, 504]) === 0 && near('alkali', [575, 504]) === 0, 'negative: no potash or alkali on the Volcano');
  const b = DATA.basins.find(b => b.at_px[0] === 763);
  ok(b && b.soda === 1, 'the Catch\'s brine is alkaline (soda 1)'); }

/* ---- near and register */
{ const c = [1130 * PM, 690 * PM], ns = G.near(c[0], c[1], 'iron', 20000);
  ok(ns.length > 0 && ns.every((p, i) => !i || ns[i - 1].dist <= p.dist), 'near: nearest first (' + ns.length + ')');
  ok(G.near(c[0], c[1], 'iron', 0).length === 0, 'negative: nothing within 0 m');
  const T = KTAGS.create({ build: 'test-res' }), recs = G.register(T, ns, { height: () => 12 });
  ok(recs.length === ns.length && recs.every(r => r.id === ns[recs.indexOf(r)].id && r['class'] === 'prop' && r.at[1] === 12 && /^node-iron-/.test(r.key)), 'registered in core/tags with their own ids');
  const au = T.audit(); ok(!au.unknown, 'core/tags: no unknown tags (' + JSON.stringify(au.unknownKeys || {}) + ')');
  throws(() => G.register(T, [{ id: 'x', kind: 'mithril', grade: 'high', x: 0, z: 0 }]), 'negative: an unknown kind'); }

/* ---- the ledger and the audit */
const LG = RES_LEDGER.build();
{ const pols = Object.keys(LG.polities);
  ok(pols.length >= 20, 'ledger: ' + pols.length + ' polities');
  ok(pols.every(p => LG.polities[p].cells > 0), 'every polity has land');
  ok(Object.values(LG.polities).some(R => R.imports.length) && Object.values(LG.polities).some(R => R.exports.length), 'imports and exports found');
  const kt = LG.polities['Kautoa'];
  ok(kt && kt.settlements.length > 0, 'Kautoa has its settlements in the ledger');
  const tg = RES_LEDGER.tradeGoods(LG, { kautoa: 'Kautoa', nobody: 'No Such Polity' }, { kautoa: ['cloves'] });
  ok(Array.isArray(tg.kautoa) && tg.kautoa.indexOf('cloves') >= 0 && tg.nobody.length === 0, 'tradeGoods: a town\'s own goods kept, its surplus added; none for an unknown polity');
  const strict = RES_LEDGER.build({ basics: { stone: { family: 'stone', min: 256 } } });
  ok(!strict.audit.ok && strict.audit.failures.length > 0, 'negative: an impossible basic fails the audit');
  console.log('fairness audit: ' + (LG.audit.ok ? 'ok' : LG.audit.failures.length + ' failures'));
  LG.audit.failures.forEach(f => console.log('  ' + f)); }
{ const f = path.join(KIT, 'data', 'ledger.json'), txt = JSON.stringify(LG, null, 1) + '\n';
  if (process.argv.indexOf('--ledger') >= 0) { fs.writeFileSync(f, txt); console.log('wrote ' + f); }
  ok(fs.existsSync(f) && fs.readFileSync(f, 'utf8') === txt, 'data/ledger.json is the ledger of this data (node kits/resources/tests/test-res.js --ledger)'); }

/* ---- the Godot twin's golden tile (kits/resources/godot/kres_field_test.gd reads it) */
{ const f = path.join(KIT, 'godot', 'golden-field.json');
  const Tg = { x0: 1120 * PM, z0: 680 * PM, x1: 1135 * PM, z1: 695 * PM };
  const tile = G.nodesIn(Tg).filter(n => n.src !== 'owner').map(n => ({ id: n.id, grade: n.grade, gx: n.gx, gz: n.gz }));
  const txt = JSON.stringify({ tile: [Tg.x0, Tg.z0, Tg.x1, Tg.z1], nodes: tile, lodes: DATA.stats.lodes }, null, 0) + '\n';
  if (process.argv.indexOf('--ledger') >= 0) { fs.writeFileSync(f, txt); console.log('wrote ' + f); }
  ok(fs.existsSync(f) && fs.readFileSync(f, 'utf8') === txt, 'godot/golden-field.json is the tile of this data (--ledger rewrites it)'); }

console.log(fails ? fails + ' of ' + n + ' FAILED' : 'all passed (' + n + ' checks)');
process.exit(fails ? 1 : 0);
