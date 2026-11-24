/* settlements/hook/tests/test-hook-ruin.js: the Ancient city's records (src/77-hook-ruin.js, S2 of the owner's site plan,
   plan/hook-site-plan.html), in node (no page, no GPU).

   The page's chain as test-hook-world.js loads it (core/rand, core/terrain's relief, the cut, core/world 41 and 41l, Hook's
   frame), the site (site/hook-site.json: its grid and the town's zone), core/tags, then the ruin's fragment. Checks, each
   placement check with a negative (a fault the check must catch):
     - the ruin's grid is the town's; every footprint inside its block; the living town's zone left to the town
     - the grounds: walled blocks on the peninsula's record, drowned ones in the drowned downtown's record or water, mainland
       ones dry and outside the wall; all inside the city limits
     - height and density fall with the distance from the downtown (core, downtown, inner, outer)
     - each ground's character: cleared and picked inside the wall, cut down in the water, wild on the mainland
     - the freeway: its spans close the ring, the west arc fallen, the approach standing, the ramp from the ring to the land
     - the wall from the quays to the freeway, its two gates
     - the Crown on the downtown's hill; the Drowned Spire a Spindle standing to its crown in the water, its pods and village
     - the thirteen places on their ground and the right side of the wall
     - records stable by id: alone, shuffled, on a second run, registered in any order; core/tags' audit clean
     - the design table matches kits/metropolis's records

   node settlements/hook/tests/test-hook-ruin.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const HOOK = path.join(__dirname, '..'), ROOT = path.join(HOOK, '..', '..');
const rd = p => fs.readFileSync(p, 'utf8');

function worldFragment() {
  const py = ['import importlib.util, sys',
    "s = importlib.util.spec_from_file_location('wd', sys.argv[1]); m = importlib.util.module_from_spec(s); s.loader.exec_module(m)",
    "sys.stdout.write(m.fragment(sys.argv[2], 'var WORLD_KITS=[];\\n', 'test', 'test'))"].join('\n');
  for (const exe of ['python3', 'python']) {
    try { return cp.execFileSync(exe, ['-c', py, path.join(ROOT, 'core', 'world', 'world_data.py'), path.join(HOOK, 'world')],
      { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { /* the next name */ }
  }
  throw new Error('no python to run core/world/world_data.py');
}
const FRAG = worldFragment();
const SITE = JSON.parse(rd(path.join(HOOK, 'site', 'hook-site.json')));
const ctxBase = () => vm.createContext({ atob: s => Buffer.from(s, 'base64').toString('binary'), console, Math, Float32Array, Uint8Array, Int32Array,
  Uint16Array, Int8Array, Float64Array, Uint32Array, Array, Object, JSON, Number, String, Error, Map, Set, Infinity, NaN, isFinite, parseInt, parseFloat });
function load() {
  const src = [rd(path.join(ROOT, 'core', 'rand', '08-core-rand.js')), rd(path.join(ROOT, 'core', 'terrain', '38-core-relief.js')), FRAG,
    rd(path.join(ROOT, 'core', 'world', '41-world-fields.js')), rd(path.join(ROOT, 'core', 'world', '41l-world-landforms.js')),
    'var PORT = {};', rd(path.join(HOOK, 'src', '75d-hook-world.js')),
    rd(path.join(ROOT, 'core', 'tags', '50-core-tags.js')), rd(path.join(ROOT, 'core', 'tags', '52-core-tags-vocab.js')),
    'var HOOK_SITE = ' + JSON.stringify(SITE) + ';', rd(path.join(HOOK, 'src', '77-hook-ruin.js')),
    'globalThis.__R = HOOK_RUIN; globalThis.__PLAN = HOOK_RUIN_PLAN; globalThis.__HW = HOOK_WORLD; globalThis.__KTAGS = KTAGS; globalThis.__WLAND = WLAND;'].join('\n;\n');
  const ctx = ctxBase();
  vm.runInContext(src, ctx, { filename: 'hook-ruin' });
  return { R: ctx.__R, PLAN: ctx.__PLAN, W: ctx.__HW, KTAGS: ctx.__KTAGS, WLAND: ctx.__WLAND };
}
const { R, PLAN, W, KTAGS, WLAND } = load();
const P = PLAN.PARAMS, D = PLAN.DESIGNS, PS = PLAN.SITE;
console.log('ruin: ' + JSON.stringify(R.report));
const byId = {}; for (const b of R.blocks) byId[b.id] = b;
const tById = {}; for (const t of R.towers) tById[t.id] = t;
const inPoly = (x, z, poly) => { let c = false; for (let k = 0, l = poly.length - 1; k < poly.length; l = k++) { const a = poly[k], b = poly[l];
  if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
const bench = id => WLAND.benches.find(b => b.id === id), SPIT = bench('lf_hook_spit'), SUNK = bench('lf_hook_sunk');
const onB = (B, b) => { const w = W.toWorld(b.x, b.z); return WLAND.benchD(B, w[0], w[1]) === 0; };

/* ---- the town's grid (89z-rows.js: the core stretch's first column's west edge at xa + S/2, rows from z1) */
const G = SITE.grid, Bk = G.block, S = G.street, PITCH = Bk + S;
const coreRow = G.rows.reduce((a, r) => (!a || r[2] > a[2] ? r : a), null);
const X0 = coreRow[0] + S / 2 + Bk / 2, CZ0 = G.z1 - Bk / 2;
const onLattice = bs => bs.every(b => Math.abs((b.x - (b.si - 1) * PITCH / 2 - X0) / PITCH - b.i) < 1e-9 && Math.abs((CZ0 - (b.z + (b.sj - 1) * PITCH / 2)) / PITCH - b.j) < 1e-9);
T.ok('every block stands on the town\'s grid (the core stretch\'s columns, the rows from z1)', R.blocks.length > 1000 && onLattice(R.blocks), R.blocks.length + ' blocks');
T.neg('a block shifted half a street off the grid fails it', onLattice, R.blocks.map((b, k) => k === 7 ? Object.assign({}, b, { x: b.x + S / 2 }) : b), R.blocks);
const corners = t => { const c = Math.cos(t.yaw), s = Math.sin(t.yaw), hw = t.w / 2, hd = t.d / 2;
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(p => [t.x + p[0] * c + p[1] * s, t.z - p[0] * s + p[1] * c]); };
const fits = ts => ts.every(t => { const b = byId[t.parent]; return corners(t).every(p => Math.abs(p[0] - b.x) <= b.w / 2 + 1e-6 && Math.abs(p[1] - b.z) <= b.d / 2 + 1e-6); });
T.ok('every tower\'s footprint, turned by its yaw, lies inside its block', R.towers.length > 500 && fits(R.towers), R.towers.length + ' towers');
T.neg('a Long Curve (180 m) on a single block fails the fit', fits, R.towers.map(t => byId[t.parent].si === 1 ? Object.assign({}, t, { w: 180, d: 60, yaw: 0 }) : t), R.towers);
const ZONE = SITE.districts.find(d => d.type === 'zone').poly;
const offTown = bs => bs.every(b => !inPoly(b.x, b.z, ZONE));
T.ok('no block stands in the living town\'s zone (Port Hook is the town\'s)', offTown(R.blocks), '');
T.neg('a block moved into the town fails the check', offTown, R.blocks.concat([Object.assign({}, R.blocks[0], { x: 0, z: -300 })]), R.blocks);

/* ---- the grounds */
const LIMW = PS.limits;
const inLimits = b => { const w = W.toWorld(b.x, b.z); return inPoly(w[0], w[1], LIMW); };
const groundsOk = bs => bs.every(b => inLimits(b) && (b.ground === 'walled' ? onB(SPIT, b) : b.ground === 'sunk' ? !onB(SPIT, b) && (onB(SUNK, b) || b.y < 0) :
  b.ground === 'mainland' ? !onB(SPIT, b) && !onB(SUNK, b) && b.y >= 0 : false));
const by = g => R.blocks.filter(b => b.ground === g);
T.ok('each block on its ground: walled on the peninsula, drowned in the drowned downtown, mainland dry outside the wall; all inside the limits',
  by('walled').length > 100 && by('sunk').length > 100 && by('mainland').length > 100 && groundsOk(R.blocks), JSON.stringify(R.report.byGround));
T.neg('a mainland block in the sea fails the check', groundsOk, R.blocks.concat([Object.assign({}, by('mainland')[0], { y: -20, x: 0, z: 3000 })]), R.blocks);

/* ---- height and density fall with the distance from the downtown */
const ZONES = ['core', 'downtown', 'inner', 'outer'];
const stats = (ts, bs) => ZONES.map(z => { const t = ts.filter(q => q.zone === z), b = bs.filter(q => q.zone === z && !q.use);
  return { z, roof: t.reduce((s, q) => s + q.roof, 0) / Math.max(1, t.length), dens: t.length / Math.max(1, b.length), n: t.length }; });
const falls = st => st.every(s => s.n > 5) && st.every((s, k) => k === 0 || (s.roof < st[k - 1].roof && s.dens < st[k - 1].dens));
const st = stats(R.towers, R.blocks.map(b => Object.assign({}, b, { zone: b.tower ? b.tower.zone : b.zone })));
T.ok('height and density fall from the core to the outer city', falls(st), st.map(s => s.z + ' ' + Math.round(s.roof) + ' m ' + s.dens.toFixed(2) + ' (' + s.n + ')').join(', '));
T.neg('the zones swapped (the outer city standing as tall as the core) fails it', falls, st.map((s, k) => k === 3 ? Object.assign({}, s, { roof: st[0].roof }) : s), st);

/* ---- each ground's character */
const share = (ts, f) => ts.filter(f).length / Math.max(1, ts.length);
const tw = g => R.towers.filter(t => t.ground === g && !t.landmark);
const walledB = by('walled'), cleared = share(walledB, b => !!b.use), picked = share(tw('walled'), t => t.state === 'gutted' || t.state === 'stump');
const drowned = share(tw('sunk'), t => /^(broken|stump|skeleton|fallen)$/.test(t.state));
const wildM = ts => share(ts, t => /\.wild$/.test(t.look));
T.ok('inside the wall the ground is cleared or picked clean; in the water the towers are cut down; on the mainland the jungle has them',
  cleared > .3 && picked > .4 && drowned > .6 && wildM(tw('mainland')) > .6 && wildM(tw('walled')) < .35,
  'cleared ' + cleared.toFixed(2) + ', picked ' + picked.toFixed(2) + ', drowned ' + drowned.toFixed(2) + ', wild mainland ' + wildM(tw('mainland')).toFixed(2) + ', wild walled ' + wildM(tw('walled')).toFixed(2));
T.neg('a mainland not overgrown fails the wild check', ts => wildM(ts) > .6, tw('mainland').map(t => Object.assign({}, t, { look: t.state })), tw('mainland'));

/* ---- the freeway */
const sp = R.spans, ctr = W.toLocal(PS.centre[0], PS.centre[1]);
const closes = s => s.length === PS.ring.length && s.every((q, k) => { const n = s[(k + 1) % s.length]; return Math.hypot(q.p1[0] - n.p0[0], q.p1[1] - n.p0[1]) < 1e-6; });
T.ok('the freeway\'s spans close the ring (one every 3 degrees, end to end)', closes(sp), sp.length + ' spans, ' + Math.round(sp.reduce((s, q) => s + q.len, 0)) + ' m');
const arcsOk = s => s.filter(q => q.arc === 'fallen').every(q => q.state === 'fallen') && s.filter(q => q.arc === 'approach').every(q => q.state === 'standing') &&
  s.filter(q => q.arc === 'fallen').length > 30 && s.filter(q => q.arc === 'approach').length > 20;
T.ok('the west arc is fallen, the south-east arc (the approach) standing', arcsOk(sp), JSON.stringify(R.report.spans));
T.neg('a standing span on the west arc fails it', arcsOk, sp.map(q => q.arc === 'fallen' && q.id === sp.find(z => z.arc === 'fallen').id ? Object.assign({}, q, { state: 'standing' }) : q), sp);
const rampOk = r => Math.abs(Math.hypot(r.p0[0] - ctr[0], r.p0[1] - ctr[1]) - PS.ringR) < 5 && W.natH(r.p1[0], r.p1[1]) >= 0 && r.y0 > r.y1;
T.ok('the south ramp runs from the ring\'s deck down to dry land', rampOk(R.ramp), JSON.stringify({ y0: R.ramp.y0, y1: R.ramp.y1 }));

/* ---- the wall */
const quayEnd = W.toLocal(1750, -600);
const wallOk = w => Math.hypot(w.p0[0] - quayEnd[0], w.p0[1] - quayEnd[1]) < 150 && Math.abs(Math.hypot(w.p1[0] - ctr[0], w.p1[1] - ctr[1]) - PS.ringR) < 40;
T.ok('the wall runs from the quays\' east end to the freeway, its two gates at its ends', wallOk(R.wall) && R.gates.length === 2 &&
  R.gates.every(g => [R.wall.p0, R.wall.p1].some(p => Math.hypot(p[0] - g.x, p[1] - g.z) < 1e-6)), Math.round(R.wall.len) + ' m');
T.neg('a wall moved 500 m inland fails it', wallOk, Object.assign({}, R.wall, { p0: [R.wall.p0[0], R.wall.p0[1] - 500] }), R.wall);

/* ---- the landmarks */
const C = R.crown, Sp = R.spire;
T.ok('the Crown: a Spindle still standing on the downtown\'s hill, the landmark', !!C && C.family === 'spindle' && C.landmark && C.ground === 'walled' && C.y > 15,
  C ? C.id + ' pad ' + C.y.toFixed(1) + ' m' : 'none');
const spireOk = s => !!s && s.family === 'spindle' && s.state === 'crown' && s.wet && s.y < 0 && s.y + s.roof > 100 &&
  R.pods.filter(p => p.parent === s.id).length >= P.pods.spire && R.places.some(p => p.code === 'C1' && p.parent === s.id);
T.ok('the Drowned Spire: one Spindle standing to its crown in the water, its pods, the Hykkousoi village in it', spireOk(Sp),
  Sp ? Sp.id + ' bed ' + Sp.y.toFixed(1) + ' m, ' + R.pods.filter(p => p.parent === Sp.id).length + ' pods' : 'none');
T.neg('a Spire standing on dry land fails it', spireOk, Sp && Object.assign({}, Sp, { wet: false, y: 3 }), Sp);

/* ---- the places */
const INSIDE = new Set(['H1', 'H2', 'H3', 'H4', 'P1']), WATER = new Set(['C1', 'C2']);
const placesOk = ps => ps.length === 13 && ps.every(p => p.inside === INSIDE.has(p.code) && (WATER.has(p.code) || p.code === 'C3' ? true : p.ground === 'land')) &&
  ps.filter(p => WATER.has(p.code)).every(p => { const w = W.toWorld(p.x, p.z); return WLAND.benchD(SUNK, w[0], w[1]) === 0 || W.natH(p.x, p.z) < 0; }) &&
  ps.filter(p => p.code === 'C3').every(p => p.parent && R.spans.find(s => s.id === p.parent).state !== 'fallen');
T.ok('the thirteen places stand on their ground, the right side of the wall (the deck camp on a standing span)', placesOk(R.places),
  R.places.map(p => p.code + (p.inside ? ' in' : ' out') + ' ' + p.ground).join(', '));
T.neg('a place moved to the wrong side of the wall fails it', placesOk, R.places.map(p => p.code === 'H2' ? Object.assign({}, p, { inside: false }) : p), R.places);

/* ---- records stable by id, the same in any order */
const ids = [].concat(R.blocks, R.towers, R.heaps, R.pods, R.spans, [R.ramp, R.wall], R.gates, R.roads, R.places).map(r => r.id);
T.ok('every record\'s id is unique', new Set(ids).size === ids.length, ids.length + ' records');
const cells = R.blocks.map(b => [b.i, b.j]);
for (let k = cells.length - 1; k > 0; k--) { const m = (k * 7919 + 13) % (k + 1); const t = cells[k]; cells[k] = cells[m]; cells[m] = t; }
const alone = {}; for (const c of cells) { const b = R.cell(c[0], c[1]); alone[b.id] = b; }
/* the plan sets the landmarks' towers and the pods' marks after the cells: compare the cells' own fields */
const strip = (b, lm) => { const c = JSON.parse(JSON.stringify(b)); if (lm) { delete c.tower; delete c.heap; delete c.use; } if (c.tower) delete c.tower.reclaimed; return JSON.stringify(c); };
const lmIds = new Set([C && C.parent, Sp && Sp.parent]);
const differ = R.blocks.filter(b => strip(alone[b.id], lmIds.has(b.id)) !== strip(b, lmIds.has(b.id))).map(b => b.id);
T.ok('each block is the same computed alone, in a shuffled order', differ.length === 0 && Object.keys(alone).length === R.blocks.length, cells.length + ' cells; differ: ' + differ.slice(0, 5).join(' '));
const again = load().R;
T.ok('the plan is the same on a second run', JSON.stringify(again.report) === JSON.stringify(R.report) && JSON.stringify(again.blocks) === JSON.stringify(R.blocks) &&
  JSON.stringify(again.spans) === JSON.stringify(R.spans), '');
const adds = []; R.register({ add: r => adds.push(r) });
const reg = order => { const T2 = KTAGS.create({ build: 'hook-ruin-test' }), roots = adds.filter(r => !r.parent), kids = adds.filter(r => r.parent);
  for (const r of (order ? roots.slice().reverse() : roots)) T2.add(r);
  /* children after their parents: a parent may itself be a child (a span's record, a pod on a tower on a block) */
  let left = order ? kids.slice().reverse() : kids.slice(); while (left.length) { const next = []; for (const r of left) { if (T2.get(r.parent)) T2.add(r); else next.push(r); } if (next.length === left.length) throw new Error('orphan ' + next[0].id); left = next; }
  return T2; };
const A = reg(false), Bv = reg(true);
const recs = t => { const out = {}; for (const r of t.query({})) out[r.id] = JSON.stringify(r); return out; };
const ra = recs(A), rb = recs(Bv);
T.ok('core/tags holds the same records whatever the order of registration', Object.keys(ra).length === adds.length && Object.keys(ra).every(k => ra[k] === rb[k]), adds.length + ' records registered');
const au = A.audit();
T.ok('no unknown tag key or value in the ruin\'s records (core/tags\' audit)', au.unknown === 0 && au.missingCulture === 0, JSON.stringify({ unknownKeys: au.unknownKeys, unknownValues: au.unknownValues, missingCulture: au.missingCulture }));

/* ---- the design table against kits/metropolis's records */
const mctx = ctxBase();
vm.runInContext(['var MP = {};', rd(path.join(ROOT, 'core', 'rand', '08-core-rand.js')),
  ...['40-mp-records.js', '46-mp-designs.js', '46f-mp-farm.js'].map(f => rd(path.join(ROOT, 'kits', 'metropolis', 'src', f))), 'globalThis.__MP = MP;'].join('\n;\n'), mctx);
const MP = mctx.__MP;
const kitRec = id => (MP.DESIGNS && MP.DESIGNS[id]) || (MP.FAMILY && MP.FAMILY[id]);
const drift = tab => Object.keys(tab).filter(id => { const k = kitRec(id); if (!k) return true; const f = k.footprint, w = f.w == null ? 2 * f.r : f.w, d = f.d == null ? 2 * f.r : f.d;
  return Math.abs(w - tab[id].w) > .01 || Math.abs(d - tab[id].d) > .01 || Math.abs(k.height.roof - tab[id].roof) > .05 || Math.abs(k.height.tip - tab[id].tip) > .05 || k.name !== tab[id].name; });
T.ok('every design the ruin stands matches kits/metropolis\'s record (footprint, roof, tip, name)', drift(D).length === 0, drift(D).join(' '));
T.neg('a design whose roof drifted from the kit fails the check', t => drift(t).length === 0, Object.assign({}, D, { reed: Object.assign({}, D.reed, { roof: 150 }) }), D);
const used = new Set(); for (const z of Object.values(P.families)) for (const s of Object.values(z)) for (const k in s) used.add(k);
T.ok('every family the plan may pick is in the design table', [...used, P.crown.family, P.spire.family].every(k => D[k]), [...used].join(' '));

T.done();
