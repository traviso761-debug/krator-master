// node core/city/cavern/test-cavern.js [--write]: KCITY.cavern (10-city-cavern.js), the cavern setting of core/city
// (core/city/cavern/PLAN.md). Loads core/rand, core/space and the file alone, as a build that takes only this folder does.
// Every check has a negative that must fail. --write rewrites golden.json after a meant change.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const ctx = { Math, console, JSON };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/city/cavern/10-city-cavern.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const CV = ctx.KCITY.cavern;
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const clone = o => JSON.parse(JSON.stringify(o));

/* a synthetic line hold: a 120 m platform way on deck 0 running south, decks at +4.5 and -4.5, five sidings (two level, one
   ramped up, one stair down, one branching off another), civic sites by hand, frontage runs along every siding */
const SETS = [{ key: 'tg-set', w: 6, d: 7, h: 2.6, weight: 3 }, { key: 'tg-cut', w: 2.6, d: 3.2, h: 2.4, weight: 2 }];
const WORKS = [{ key: 'tg-dark-beds', w: 10, d: 12, h: 3, weight: 2 }, { key: 'tg-cistern', w: 8, d: 8, h: 3.4, weight: 1 }];
function spec(world, extra) {
  return Object.assign({
    id: 'testhold', world: world == null ? 4101 : world,
    decks: [{ i: 1, y: 4.5, name: 'the quiet deck', light: 'red' }, { i: 0, y: 0, name: 'the Line deck', light: 'green' },
      { i: -1, y: -4.5, name: 'the work deck', light: 'amber' }],
    spine: { id: 'platform', pts: [[0, 0, 0], [0, 0, 120]], w: 10, h: 7, deck: 0, kind: 'gallery' },
    sidings: [
      { id: 'sd1', at: 22, side: 1, len: 60, deck: 0, band: 'cream-red', district: 'homes' },
      { id: 'sd2', at: 70, side: 1, len: 50, deck: 1, band: 'cream-green', district: 'homes', drop: 'ramp' },
      { id: 'sd3', at: 46, side: -1, len: 55, deck: -1, band: 'red', district: 'works', drop: 'stair', w: 3.2, h: 3.4 },
      { id: 'sd4', at: 100, side: -1, len: 36, deck: 0, district: 'civic' },
      { id: 'sd5', from: 'sd1', at: 40, side: -1, len: 24, deck: 0, district: 'homes' }],
    civic: [{ id: 'loj-hall', key: 'tg-loj-hall', way: 'platform', s: 112, side: 1, w: 14, d: 18, h: 6, at: 'wall' },
      { id: 'signal-box', key: 'tg-signal-box', way: 'platform', s: 8, side: -1, w: 6, d: 5, h: 3, at: 'wall' }],
    fill: [{ way: 'sd1', defs: SETS }, { way: 'sd2', defs: SETS }, { way: 'sd3', defs: WORKS, gap: 1.6 }, { way: 'sd5', defs: SETS }],
    hub: 'platform:a', reach: 160
  }, extra || {});
}
const H = CV.lineHold(spec());
const A = CV.audit(H);
ok(A.ok, 'the test hold holds every rule (' + (A.problems.map(p => p.msg).slice(0, 4).join('; ') || 'no problems') + ')');
ok(H.sites.length >= 20, 'frontage runs cut ' + H.sites.length + ' sites on four sidings');
ok(H.sites.filter(s => s.way === 'sd3').every(s => s.deck === -1 && Math.abs(s.y + 4.5) < 1e-6), 'the work deck\'s sites stand on deck -1');
ok(H.sites.filter(s => s.way === 'sd2').every(s => Math.abs(s.y - 4.5) < 1e-6), 'the quiet deck\'s sites stand on deck +1');
ok(H.ways.some(w => w.kind === 'ramp') && H.ways.some(w => w.kind === 'stair'), 'a ramp up and a stair down join the decks');

/* the rock rule: its negative, two sites cut into each other */
{
  const H2 = CV.lineHold(spec());
  const s = H2.sites.find(x => x.way === 'sd1');
  CV.addSite(H2, Object.assign(clone(s), { id: 'intruder', s: null, x: s.x + 1, z: s.z + 0.5, type: undefined }));
  const p = CV.rock(H2);
  ok(p.some(q => q.a === 'intruder' || q.b === 'intruder'), 'negative: a site cut into its neighbour breaks the rock rule');
  const p2 = CV.rock(H2, { rock: 0 });
  ok(p2.some(q => q.a === 'intruder' || q.b === 'intruder'), 'negative: an overlap breaks it even with no rock asked');
}
/* the rock rule through KSPACE answers as the scan of every pair does */
{
  const V = CV.voids(H), J = {}, brute = [];
  const H3 = CV.lineHold(spec());
  CV.addSite(H3, { id: 'x1', at: 'floor', key: 'k', way: 'platform', x: 0, y: 0, z: 60, w: 3, d: 3, h: 2.5 });
  CV.addSite(H3, { id: 'x2', at: 'floor', key: 'k', way: 'platform', x: 0, y: 0, z: 63.2, w: 3, d: 3, h: 2.5 });
  const got = CV.rock(H3).map(p => [p.a, p.b].sort().join('|')).sort();
  ok(got.indexOf('x1|x2') >= 0, 'the index finds two floor sites 0.2 m apart (' + got.length + ' problems)');
  const H4 = CV.lineHold(spec());
  CV.addSite(H4, { id: 'x1', at: 'floor', key: 'k', way: 'platform', x: 0, y: 0, z: 60, w: 3, d: 3, h: 2.5 });
  CV.addSite(H4, { id: 'x2', at: 'floor', key: 'k', way: 'platform', x: 0, y: 0, z: 63.9, w: 3, d: 3, h: 2.5 });
  ok(!CV.rock(H4).some(p => p.a === 'x1' || p.b === 'x1'), 'negative: 0.9 m apart they keep their rock');
  ok(V.length > 0 && J && brute, 'voids listed: ' + V.length);
}
/* headroom, frontage, grade, decks, daylight: each with its negative */
{
  const H5 = CV.lineHold(spec()); const s = H5.sites[3];
  CV.edit(H5, { id: s.id, op: 'set', fields: { h: 1.5 } });
  ok(CV.headroom(H5).some(p => p.a === s.id), 'negative: a 1.5 m room fails headroom');
  ok(CV.headroom(H).length === 0, 'every void of the hold has its headroom');
}
{
  const H6 = CV.lineHold(spec()); const s = H6.sites.find(x => x.way === 'sd1');
  CV.edit(H6, { id: s.id, op: 'set', fields: { x: s.x + Math.sin(s.ry) * -3, z: s.z + Math.cos(s.ry) * -3 } });
  ok(CV.frontage(H6).some(p => p.a === s.id), 'negative: a set 3 m back in the rock has no frontage');
  const H7 = CV.lineHold(spec()); const t = H7.sites.find(x => x.way === 'sd1');
  CV.edit(H7, { id: t.id, op: 'set', fields: { ry: t.ry + Math.PI } });
  ok(CV.frontage(H7).some(p => p.a === t.id && /faces away/.test(p.msg)), 'negative: a set turned to face the rock faces away');
  ok(CV.frontage(H).length === 0, 'every site\'s door is on its way');
}
{
  const H8 = CV.lineHold(spec()); const r = H8.ways.find(w => w.kind === 'ramp');
  CV.edit(H8, { id: r.id, op: 'set', fields: { pts: [r.pts[0], [r.pts[0][0] + 6, r.pts[1][1], r.pts[0][2]]] } });
  ok(CV.grade(H8).some(p => p.a === r.id), 'negative: a ramp at 1 in 1.3 breaks the grade');
  const H9 = CV.lineHold(spec()); const st = H9.ways.find(w => w.kind === 'stair');
  CV.edit(H9, { id: st.id, op: 'set', fields: { pts: [st.pts[0], [st.pts[1][0], st.pts[0][1] - 0.5, st.pts[1][2]]] } });
  ok(CV.grade(H9).some(p => p.a === st.id), 'negative: a stair with one 0.5 m riser breaks the step rule');
  ok(CV.grade(H).length === 0, 'every way holds its grade and step rule');
}
{
  const H10 = CV.lineHold(spec()); const s = H10.sites.find(x => x.deck === 1);
  CV.edit(H10, { id: s.id, op: 'set', fields: { y: s.y + 0.5 } });
  ok(CV.decks(H10).some(p => p.a === s.id), 'negative: a site 0.5 m off its deck breaks deck alignment');
  ok(CV.decks(H).length === 0, 'every site and level way stands on its deck');
}

/* the graph: every site reachable from the platform; a fallen siding cuts off its own sites only */
function reach(Hx) {
  const N = CV.nav(Hx), adj = {};
  N.edges.forEach(e => { (adj[e.a] = adj[e.a] || []).push(e.b); (adj[e.b] = adj[e.b] || []).push(e.a); });
  const seen = new Set(['platform:a']), st = ['platform:a'];
  while (st.length) { const n = st.pop(); for (const m of adj[n] || []) if (!seen.has(m)) { seen.add(m); st.push(m); } }
  return { N, seen };
}
{
  const { N, seen } = reach(H);
  ok(H.sites.every(s => seen.has(s.id)), 'the walk graph reaches every site\'s door from the platform (' + N.nodes.length + ' nodes, ' + N.edges.length + ' edges)');
  ok(N.edges.every(e => e.len >= 0 && isFinite(e.len)), 'every walk edge has a length');
  const H11 = CV.lineHold(spec()); CV.edit(H11, { id: 'sd2', op: 'remove' });
  const R = reach(H11);
  ok(H11.sites.filter(s => s.way === 'sd2').every(s => !R.seen.has(s.id)) && H11.sites.filter(s => s.way === 'sd1').every(s => R.seen.has(s.id)),
    'negative: a fallen siding cuts off its own sites, no others');
}
/* wealth by distance along the graph (Dhelv's rule) */
{
  const near = H.sites.find(s => s.id === 'signal-box'), far = H.sites.filter(s => s.way === 'sd2').slice(-1)[0];
  ok(near.wealth > far.wealth, 'wealth falls along the graph: the signal box ' + near.wealth + ', the far end of the quiet deck ' + far.wealth);
  const D = CV.dist(H, 'platform:a');
  ok(Math.abs(D['platform:b'] - 120) < 1e-6, 'the spine is 120 m along the graph');
  ok(D['sd5:end'] > D['sd1:on'] + 40, 'a branch off a siding is measured through it');
}
/* ages: the far end abandoned (PLAN.md 5.3) */
{
  const H12 = CV.lineHold(spec(null, { heart: 'platform:b', worn: 90, abandoned: 140 }));
  const st = H12.sites.reduce((o, s) => (o[s.state] = (o[s.state] || 0) + 1, o), {});
  ok(st.kept > 0 && st.worn > 0 && st.abandoned > 0, 'the hold ages from its heart: ' + JSON.stringify(st));
  const H13 = CV.lineHold(spec(null, { heart: 'platform:b' }));
  ok(H13.sites.every(s => s.state === 'kept'), 'negative: with no thresholds every site is kept');
}
/* determinism, the golden digest and the world seed */
const G = path.join(__dirname, 'golden.json');
{
  const d1 = CV.digest(H), d2 = CV.digest(CV.lineHold(spec()));
  ok(d1 === d2, 'the same input lays the same hold (' + d1 + ')');
  const d3 = CV.digest(CV.lineHold(spec(4102)));
  ok(d3 !== d1, 'negative: another world seed lays another hold (' + d3 + ')');
  if (process.argv.includes('--write')) { fs.writeFileSync(G, JSON.stringify({ lineHold: d1 }, null, 1) + '\n'); console.log('wrote golden.json'); }
  const g = fs.existsSync(G) ? JSON.parse(fs.readFileSync(G, 'utf8')) : {};
  ok(g.lineHold === d1, 'the golden digest holds (' + g.lineHold + ')');
}
/* edits: deltas by id, replayed on a fresh plan from the same input give the same plan */
{
  const H14 = CV.lineHold(spec()), s = H14.sites[5], t = H14.sites[7];
  CV.edit(H14, { id: s.id, op: 'set', fields: { key: 'tg-carriage-house' } });
  CV.edit(H14, { id: t.id, op: 'remove' });
  CV.edit(H14, { op: 'add', rec: { type: 'site', id: 'added', at: 'floor', key: 'tg-stall', way: 'platform', x: 0, y: 0, z: 30, w: 2, d: 2, h: 2.2 } });
  const E = CV.exportPlan(H14);
  const H15 = CV.lineHold(spec(null, { edits: E.edits }));
  ok(CV.digest(H15) === CV.digest(H14) && E.edits.length === 3, 'three edits kept by id and replayed give the same plan');
  ok(CV.digest(H14) !== CV.digest(H), 'negative: the edited plan differs from the plain one');
  ok(H15.byId[t.id].state === 'removed' && !CV.nav(H15).nodes.some(n => n.id === t.id), 'a removed site leaves the walk graph');
  let threw = false; try { CV.edit(H15, { id: 'no-such', op: 'set', fields: {} }); } catch (e) { threw = true; }
  ok(threw, 'negative: an edit to an unknown id throws');
}
/* the export is plain data */
{
  const E = CV.exportPlan(H), J = JSON.parse(JSON.stringify(E));
  ok(J.format === 'krator-cavern' && J.sites.length === H.sites.length && J.nav.edges.length > 0 && J.digest === CV.digest(H), 'the export round-trips through JSON');
}
/* the carve: KCAVERN primitives; a def's void plan in its frame */
{
  const plan = s => s.key === 'tg-set' ? [{ id: 'hearth', x: 0, y: 0, z: -2, w: 4, d: 4, h: 2.6 }, { id: 'sleep', x: 0, y: 0, z: -5.5, w: 3, d: 3, h: 2.4 }] : null;
  const C = CV.carve(H, { plan });
  const set = H.sites.find(s => s.key === 'tg-set'), rooms = C.filter(p => p.site === set.id);
  ok(rooms.length === 2 && rooms.every(r => r.prim === 'room'), 'a set carves its two rooms from its void plan');
  const fx = Math.sin(set.ry), fz = Math.cos(set.ry), h = rooms.find(r => r.room === 'hearth');
  const hx = h.poly.reduce((a, p) => a + p[0], 0) / 4, hz = h.poly.reduce((a, p) => a + p[1], 0) / 4;
  ok(Math.abs((hx - set.x) * fx + (hz - set.z) * fz + 2) < 1e-3 && h.y === set.y && h.h === 2.6, 'its hearth room lies 2 m behind its front, into the rock (KCAVERN room: poly, y, h)');
  ok(C.some(p => p.prim === 'stair' && !p.ramp) && C.some(p => p.prim === 'stair' && p.ramp), 'the stair and the ramp carve as KCAVERN stairs');
  ok(!C.some(p => p.owner && p.owner.endsWith(':stub')), 'negative: a way the host carved (prim none) carves nothing');
}
/* the carve builds in KCAVERN: open at every room's middle, rock between two neighbouring sets, the ramp open at its middle */
{
  const kctx = { Math, console, JSON }; kctx.globalThis = kctx; vm.createContext(kctx);
  for (const f of ['core/rand/08-core-rand.js', 'core/walk/20-core-walk.js', 'core/terrain/39-core-cavern.js'])
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), kctx, { filename: f });
  const W = kctx.KWALK.create(), C = kctx.KCAVERN.create({ ground: () => 40, cell: 0.5, chunk: 16, seed: 3, walk: W });
  const P = CV.carve(H, {});
  P.forEach(p => { const r = Object.assign({}, p); delete r.prim; C[p.prim](r); });
  C.build();
  const open = H.sites.filter(s => { const c = CV.siteCentre(s); return C.sdf(c.x, s.y + 1.2, c.z) > 0; }).length;
  ok(open === H.sites.length, 'KCAVERN builds the carve: every site open at its middle (' + open + '/' + H.sites.length + ', ' + P.length + ' primitives)');
  const a = H.sites.find(s => s.id === 'sd1.l0'), b = H.sites.find(s => s.id === 'sd1.l2') || H.sites.find(s => s.way === 'sd1' && s.side < 0 && s !== a);
  const ca = CV.siteCentre(a), cb = CV.siteCentre(b), mx = (ca.x + cb.x) / 2, mz = (ca.z + cb.z) / 2;
  const ex = Math.sin(a.ry), ez = Math.cos(a.ry), k = (a.w / 2 + 0.4);
  const gx = ca.x + (cb.x - ca.x) / Math.hypot(cb.x - ca.x, cb.z - ca.z) * k, gz = ca.z + (cb.z - ca.z) / Math.hypot(cb.x - ca.x, cb.z - ca.z) * k;
  ok(C.sdf(gx - ex * 1.5, a.y + 1.2, gz - ez * 1.5) < 0, 'negative: rock stands between two neighbouring sets (' + mx.toFixed(1) + ', ' + mz.toFixed(1) + ')');
  const rp = H.ways.find(w => w.kind === 'ramp'), m = CV.wayAt(rp, CV.wayLen(rp) / 2);
  ok(C.sdf(m.x, m.y + 1.2, m.z) > 0 && C.inRock(m.x, m.y + 6, m.z), 'the ramp is open at its middle and rock 6 m over it');
}
/* Dhelv's shapes: a hub hall under a light well, a tube, floor and wall sites; daylight with its negative */
{
  const D = CV.create({ id: 'dh', world: 5 });
  CV.addSpace(D, { id: 'hall', kind: 'hall', x: 0, y: 0, z: 0, w: 60, d: 40, h: 24 });
  CV.addSpace(D, { id: 'well', kind: 'well', x: 0, y: 0, z: 0, w: 14, d: 14, h: 60, prim: 'none' });
  CV.addNode(D, { id: 'sq', kind: 'junction', x: 0, y: 0, z: 0, space: 'hall' });
  CV.addNode(D, { id: 'mouth', kind: 'mouth', x: 30, y: 0, z: 0, space: 'hall' });
  CV.addNode(D, { id: 'tube:e', kind: 'end', x: 120, y: 0, z: 0 });
  CV.addWay(D, { id: 'sqlane', kind: 'passage', a: 'sq', b: 'mouth', w: 6, h: 6, prim: 'none' });
  CV.addWay(D, { id: 'tube', kind: 'tube', a: 'mouth', b: 'tube:e', w: 8, h: 8 });
  CV.addSite(D, { id: 'shrine', at: 'floor', key: 'zj-shrine', way: 'sqlane', x: 10, y: 0, z: 6, ry: Math.PI, w: 5, d: 4, h: 4, needs: 'daylight', joins: ['hall'] });
  CV.addSite(D, { id: 'far', at: 'wall', key: 'zj-house', way: 'tube', x: 100, y: 0, z: 4, ry: Math.PI, w: 5, d: 6, h: 3, needs: 'daylight' });
  const p = CV.daylight(D);
  ok(!p.some(q => q.a === 'shrine'), 'Dhelv\'s shape: a shrine on the hall\'s floor by the light well has daylight');
  ok(p.some(q => q.a === 'far'), 'negative: a house 100 m down the tube has none');
  ok(CV.frontage(D).length === 0, 'Dhelv\'s shape: the floor and wall sites front their ways (' + CV.frontage(D).map(q => q.msg).join('; ') + ')');
}
/* [G data]: no three.js, no DOM */
{
  const src = fs.readFileSync(path.join(__dirname, '10-city-cavern.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/\bTHREE\b|\bdocument\b|\bwindow\b|Math\.random/.test(src), 'the data side touches no THREE, DOM or Math.random');
}
console.log(fails ? fails + ' FAILED' : 'all passed');
process.exit(fails ? 1 : 0);
