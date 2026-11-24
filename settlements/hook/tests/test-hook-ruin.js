/* settlements/hook/tests/test-hook-ruin.js: Huka's ruin as records (src/77-hook-ruin.js, phase M1), in node (no page, no GPU).

   The page's chain as test-hook-world.js loads it (core/rand, core/terrain's relief, the cut, core/world 41 and 41l, Hook's
   frame), the site's grid (site/hook-site.json), core/tags, then the ruin's fragment. Checks, each placement check with a
   negative (a fault the check must catch):
     - the ruin's grid is the town's: every block's anchor on the core stretch's columns and the rows from z1
     - every tower's footprint, turned by its yaw, inside its block; no block in the spine's swathe; none on the spit
     - the thirds by the ground: the Sunk City's blocks in the water (or on the hook's shank and barb), the Scarp City's dry,
       under the crest and no steeper than the pads allow; each third about 4 km2 (PROPOSAL-METROPOLIS.md section 2)
     - the gradient: wilder and less picked over with distance from the port
     - the people: pods on standing towers in the water, stilt villages among low stumps, camps on dry ground at the edge
     - records stable by id: the same cells in any order, the same plan on a second run, the same registry in any order
       of registration, no unknown tag key or value (core/tags' audit)
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
const P = PLAN.PARAMS, D = PLAN.DESIGNS;
console.log('ruin: ' + JSON.stringify(R.report));
const byId = {}; for (const b of R.blocks) byId[b.id] = b;

/* ---- the town's grid, read off the site independently of the fragment (89z-rows.js: the core stretch's first column's west
   edge at xa + S/2, rows from z1) */
const G = SITE.grid, B = G.block, S = G.street, PITCH = B + S;
const coreRow = G.rows.reduce((a, r) => (!a || r[2] > a[2] ? r : a), null);
const X0 = coreRow[0] + S / 2 + B / 2, CZ0 = G.z1 - B / 2;
const onLattice = bs => bs.every(b => Math.abs((b.x - (b.si - 1) * PITCH / 2 - X0) / PITCH - b.i) < 1e-9 && Math.abs((CZ0 - (b.z + (b.sj - 1) * PITCH / 2)) / PITCH - b.j) < 1e-9);
T.ok('every block stands on the town\'s grid (the core stretch\'s columns, the rows from z1)', R.blocks.length > 0 && onLattice(R.blocks), R.blocks.length + ' blocks; X0 ' + X0 + ', CZ0 ' + CZ0);
T.neg('a block shifted half a street off the grid fails it', onLattice, R.blocks.map((b, k) => k === 7 ? Object.assign({}, b, { x: b.x + S / 2 }) : b), R.blocks);
/* the town's own blocks (89z) on the core stretch fall on the same columns: its first block's centre is a lattice column */
T.ok('the town\'s core-stretch blocks are the ruin\'s columns', Math.abs(((coreRow[0] + S / 2 + B / 2) - R.cx(0))) < 1e-9 && Math.abs(R.cz(0) - (G.z1 - B / 2)) < 1e-9, 'cx(0) ' + R.cx(0) + ', cz(0) ' + R.cz(0));

/* ---- footprints inside their blocks; the spine's swathe; the spit */
const corners = t => { const c = Math.cos(t.yaw), s = Math.sin(t.yaw), hw = t.w / 2, hd = t.d / 2;
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(p => [t.x + p[0] * c + p[1] * s, t.z - p[0] * s + p[1] * c]); };
const fits = ts => ts.every(t => { const b = byId[t.parent]; return corners(t).every(p => Math.abs(p[0] - b.x) <= b.w / 2 + 1e-6 && Math.abs(p[1] - b.z) <= b.d / 2 + 1e-6); });
T.ok('every tower\'s footprint, turned by its yaw, lies inside its block', R.towers.length > 0 && fits(R.towers), R.towers.length + ' towers');
T.neg('a Long Curve (180 m) on a single block fails the fit', fits, R.towers.map(t => byId[t.parent].si === 1 ? Object.assign({}, t, { w: 180, d: 60, yaw: 0 }) : t), R.towers);
const clearOfSpine = bs => bs.every(b => Math.abs(b.x - P.spineX) - b.w / 2 >= P.spineHalf - 1e-6);
T.ok('no block stands in the spine\'s swathe', clearOfSpine(R.blocks), 'spine x ' + P.spineX);
T.neg('a block on the spine fails the swathe check', clearOfSpine, R.blocks.concat([Object.assign({}, R.blocks[0], { x: P.spineX + 10 })]), R.blocks);
const SPIT = WLAND.benches.find(b => b.id === 'lf_hook_spit');
const bD = (b, x, z) => { const dx = x - b.x, dz = z - b.z, u = Math.abs(dx * b.c + dz * b.s) - b.a, v = Math.abs(-dx * b.s + dz * b.c) - b.b;
  return u <= 0 && v <= 0 ? 0 : Math.hypot(Math.max(u, 0), Math.max(v, 0)); };
const offSpit = bs => bs.every(b => { const w = W.toWorld(b.x, b.z); return bD(SPIT, w[0], w[1]) > 0; });
T.ok('no block stands on the living port\'s spit (the port third is the town\'s)', offSpit(R.blocks), '');
T.neg('a block moved onto the spit fails the check', offSpit, R.blocks.concat([Object.assign({}, R.blocks[0], { x: 0, z: -900 })]), R.blocks);

/* ---- the thirds by the ground */
const sunk = R.blocks.filter(b => b.third === 'sunk'), scarp = R.blocks.filter(b => b.third === 'scarp');
const wetOk = bs => bs.every(b => b.y < 0 || R.field(b.x, b.z).third === 'sunk');
const SHANK = WLAND.benches.filter(b => b.id === 'lf_hook_shank' || b.id === 'lf_hook_barb');
const onWall = b => { const w = W.toWorld(b.x, b.z); return SHANK.some(s => bD(s, w[0], w[1]) === 0); };
T.ok('the Sunk City\'s blocks stand in the lagoon\'s water or on the old sea wall', sunk.length > 50 && sunk.every(b => b.y < 0 || onWall(b)),
  sunk.length + ' blocks, ' + sunk.filter(b => b.y >= 0).length + ' on the wall; deepest ' + Math.max(...sunk.map(b => b.depth)).toFixed(1) + ' m');
const dryOk = bs => bs.every(b => b.lo >= -1e-6 || b.hi >= 0) && bs.every(b => b.pad <= P.scarpTop + B * P.maxSlope && b.slope <= P.maxSlope + 1e-9);
T.ok('the Scarp City\'s blocks stand dry, under the crest, no steeper than a pad allows', scarp.length > 50 && dryOk(scarp),
  scarp.length + ' blocks; pads ' + Math.min(...scarp.map(b => b.pad)).toFixed(0) + ' to ' + Math.max(...scarp.map(b => b.pad)).toFixed(0) + ' m; steepest ' + Math.max(...scarp.map(b => b.slope)).toFixed(2));
T.neg('a scarp block on a cliff (slope 0.8) fails the check', dryOk, scarp.concat([Object.assign({}, scarp[0], { slope: .8 })]), scarp);
const km = R.report.km2;
T.ok('each ruined third is about 4 km2 (3 to 6.5)', km.sunk >= 3 && km.sunk <= 6.5 && km.scarp >= 3 && km.scarp <= 6.5, JSON.stringify(km));

/* ---- the gradient: wilder and less picked over with distance from the port */
const ring = (bs, lo, hi) => bs.filter(b => { const d = R.field(b.x, b.z).portD; return d >= lo && d < hi; });
const mean = (bs, k) => bs.reduce((s, b) => s + b[k], 0) / Math.max(1, bs.length);
const near = ring(R.blocks, 0, 800), far = ring(R.blocks, 1500, 1e9);
const graded = (n, f) => n.length > 10 && f.length > 10 && mean(f, 'wild') > mean(n, 'wild') + .3 && mean(n, 'salvage') > mean(f, 'salvage') + .3;
T.ok('the ruin is wilder and less picked over far from the port', graded(near, far),
  'near ' + near.length + ': wild ' + mean(near, 'wild').toFixed(2) + ' salvage ' + mean(near, 'salvage').toFixed(2) + '; far ' + far.length + ': wild ' + mean(far, 'wild').toFixed(2) + ' salvage ' + mean(far, 'salvage').toFixed(2));
T.neg('a flat field (the far ring as wild as the near) fails the gradient', f => graded(near, f), far.map(b => Object.assign({}, b, { wild: mean(near, 'wild'), salvage: mean(near, 'salvage') })), far);
const tw = bs => bs.filter(b => b.tower).map(b => b.tower), share = (ts, f) => ts.filter(f).length / Math.max(1, ts.length);
const wildNear = share(tw(near), t => /\.wild$/.test(t.look)), wildFar = share(tw(far), t => /\.wild$/.test(t.look));
T.ok('the far ruin\'s towers are overgrown, the near ones mostly not', wildFar > .6 && wildNear < .4, 'wild looks near ' + wildNear.toFixed(2) + ', far ' + wildFar.toFixed(2));

/* ---- the crest's landmark */
const L = R.landmark, crestPad = Math.max(...scarp.filter(b => b.tower && b.si === 1).map(b => b.pad));
T.ok('the crest stands the city\'s landmark: the highest single pad, a Spindle to its crown', !!L && L.landmark && L.family === 'spindle' && byId[L.parent].pad === crestPad,
  L ? L.id + ' at ' + crestPad.toFixed(0) + ' m' : 'none');

/* ---- the ruin's people */
const tById = {}; for (const t of R.towers) tById[t.id] = t;
const podsOk = ps => ps.every(p => { const t = tById[p.parent]; return t && t.wet && /^(intact|gutted|crown)$/.test(t.state) && p.y > t.y && p.y < t.y + t.roof; });
T.ok('the Hykkousoi pods hang on towers that still stand in the water', R.pods.length > 0 && podsOk(R.pods), R.pods.length + ' pods on ' + new Set(R.pods.map(p => p.parent)).size + ' towers');
T.neg('a pod on a fallen tower fails the check', podsOk, R.pods.concat([Object.assign({}, R.pods[0], { parent: (R.towers.find(t => t.state === 'fallen') || {}).id })]), R.pods);
const villOk = vs => vs.every(v => { const b = byId[v.parent]; return b && b.third === 'sunk' && b.depth > 0 && v.stilts.length > 0 && v.stilts.every(id => tById[id] && /^(stump|broken|skeleton|fallen)$/.test(tById[id].state)); });
T.ok('the Hukoa stilt villages stand in shallow water among the drowned stumps', R.villages.length > 0 && villOk(R.villages), R.villages.map(v => v.id + ' (' + v.stilts.length + ')').join(', '));
const campOk = cs => cs.every(c => { const b = byId[c.parent]; return b && (b.third === 'scarp' || b.depth === 0) && b.salvage >= P.camps.salvage; });
T.ok('the salvagers\' camps stand on dry ground at the ruin\'s near edge', R.camps.length > 0 && campOk(R.camps), R.camps.map(c => c.id).join(', '));
const farWet = sunk.filter(b => b.depth > 0).reduce((a, b) => (!a || b.salvage < a.salvage ? b : a), null);
T.neg('a camp in the far lagoon fails the check', campOk, R.camps.concat([Object.assign({}, R.camps[0], { parent: farWet.id })]), R.camps);

/* ---- the spine */
const sp = R.spine.stretches;
T.ok('the spine runs on across the lagoon from the town\'s axis, causeway near the port, broken further out',
  sp.length > 8 && sp.every(s => Math.abs(s.z0 - s.z1 - PITCH) < 1e-9) && sp.some(s => s.kind === 'causeway') && sp.some(s => s.kind === 'gap'), R.report.spine);

/* ---- records stable by id, the same in any order */
const ids = [].concat(R.blocks, R.towers, R.heaps, R.pods, R.villages, R.camps).map(r => r.id);
T.ok('every record\'s id is unique', new Set(ids).size === ids.length, ids.length + ' records');
const cells = R.blocks.map(b => [b.i, b.j]);
for (let k = cells.length - 1; k > 0; k--) { const m = (k * 7919 + 13) % (k + 1); const t = cells[k]; cells[k] = cells[m]; cells[m] = t; }
const shuffled = {}; for (const c of cells) { const b = R.cell(c[0], c[1]); shuffled[b.id] = JSON.stringify(b); }
/* the plan's own blocks carry what the plan added after the cells (the landmark, the people's marks): compare the cell's own fields */
const strip = (b, lm) => { const c = JSON.parse(JSON.stringify(b)); if (c.tower) { delete c.tower.reclaimed; if (lm) delete c.tower; } return JSON.stringify(c); };
const differ = R.blocks.filter(b => { const lm = !!(b.tower && b.tower.landmark); return strip(JSON.parse(shuffled[b.id]), lm) !== strip(b, lm); }).map(b => b.id);
T.ok('each block is the same computed alone, in a shuffled order', differ.length === 0 && Object.keys(shuffled).length === R.blocks.length, cells.length + ' cells; differ: ' + differ.slice(0, 5).join(' '));
const again = load().R;
T.ok('the plan is the same on a second run', JSON.stringify(again.report) === JSON.stringify(R.report) && JSON.stringify(again.blocks) === JSON.stringify(R.blocks), '');
const exp = reverse => { const reg = KTAGS.create({ build: 'hook-ruin-test' }), n = R.register(reverse ? { add: r => regAdds.push(r) } : reg);
  if (reverse) { for (const r of regAdds.slice().reverse().filter(r => !r.parent)) reg.add(r); for (const r of regAdds.filter(r => r.parent)) reg.add(r); }
  return { reg, n }; };
var regAdds = [];
const A = exp(false), Bv = exp(true);
const recs = reg => { const out = {}; for (const r of reg.query({})) out[r.id] = JSON.stringify(r); return out; };
const ra = recs(A.reg), rb = recs(Bv.reg);
T.ok('core/tags holds the same records whatever the order of registration', A.n === ids.length + 1 && Object.keys(ra).length === A.n && Object.keys(ra).every(k => ra[k] === rb[k]),
  A.n + ' records registered');
const au = A.reg.audit();
T.ok('no unknown tag key or value in the ruin\'s records (core/tags\' audit)', au.unknown === 0 && au.missingCulture === 0, JSON.stringify({ unknownKeys: au.unknownKeys, unknownValues: au.unknownValues, byClass: au.byClass }));

/* ---- the design table against kits/metropolis's records */
const mctx = ctxBase();
vm.runInContext(['var MP = {};', rd(path.join(ROOT, 'core', 'rand', '08-core-rand.js')),
  ...['40-mp-records.js', '46-mp-designs.js', '46f-mp-farm.js'].map(f => rd(path.join(ROOT, 'kits', 'metropolis', 'src', f))), 'globalThis.__MP = MP;'].join('\n;\n'), mctx);
const MP = mctx.__MP;
const kitRec = id => (MP.DESIGNS && MP.DESIGNS[id]) || (MP.FAMILY && MP.FAMILY[id]);
const drift = tab => Object.keys(tab).filter(id => { const k = kitRec(id); if (!k) return true; const f = k.footprint, w = f.w == null ? 2 * f.r : f.w, d = f.d == null ? 2 * f.r : f.d;
  return Math.abs(w - tab[id].w) > .01 || Math.abs(d - tab[id].d) > .01 || Math.abs(k.height.roof - tab[id].roof) > .05 || Math.abs(k.height.tip - tab[id].tip) > .05 || k.name !== tab[id].name; });
const dr = drift(D);
T.ok('every design the ruin stands matches kits/metropolis\'s record (footprint, roof, tip, name)', dr.length === 0,
  dr.map(id => { const k = kitRec(id); return id + ': kit ' + (k ? JSON.stringify({ f: k.footprint && { w: k.footprint.w, d: k.footprint.d, r: k.footprint.r }, h: k.height, n: k.name }) : 'none'); }).join('; '));
T.neg('a design whose roof drifted from the kit fails the check', t => drift(t).length === 0, Object.assign({}, D, { reed: Object.assign({}, D.reed, { roof: 150 }) }), D);
const used = new Set(); for (const t of Object.values(P.families)) for (const s of Object.values(t)) for (const k in s) used.add(k);
T.ok('every family the plan may pick is in the design table', [...used, P.crest.family].every(k => D[k]), [...used].join(' '));

T.done();
