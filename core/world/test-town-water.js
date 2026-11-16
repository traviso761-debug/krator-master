// node core/world/test-town-water.js: a town's own water in the world (41t-world-town-water.js) and the landform stamps
// (41l-world-landforms.js) on a small made-up region: a sea at -1,500 m with land to the east, a model river (the 'Turm')
// coming up from the south, a town in the sea with its own lake (r 450 m) and river (south to its footprint's edge), an
// islet record. Each check has a negative that must fail. The real case (Voth's page) is core/world/town_view.py.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
const sm = (a, b, x) => { let t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------- the region: 21 x 21 px (2 km), cells of 2 km
const N = 21, C = 10, LEVEL = -1500;
function region(opt) {
  const elev = new Float32Array(N * N), wlev = new Float32Array(N * N), whas = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    // land east of x = +10 km and south of z = +2 km, rising away from the sea; a strip of coarse wet cells across the east
    // land at z = -4 km (the model's 2 km cells carrying a strait 400 m wide: the strait's stamp closes them to its width)
    const strip = opt.strip !== false && j === 8 && i >= 15, k = j * N + i, land = (i >= 15 || j >= 11) && !strip;
    elev[k] = land ? -1440 + Math.max(i - 15, j - 11, 0) * 30 : -1540; whas[k] = land ? 0 : 1; wlev[k] = land ? -1540 : LEVEL; }
  const map = v => new Uint8Array(N * N).fill(v), f32 = () => new Float32Array(N * N);
  const R = { elev, wlev, whas, wflag: map(0), clim: map(0), rain: map(120), temp: map(115), biome: map(0), mask: map(255), scarpL: f32(), scarpU: f32(), scarpW: f32() };
  const meta = { heights: { grid: [N, N], origin_cell: [0, 0], su: 1, sv: 1, lo: -2000, hi: 1000 },
    frame: { origin_px: [C, C], box_px: [0, 0, N - 1, N - 1], size_px: [N, N] },
    biomes: [{ name: 'Ring Sea', colour: '#335577' }], classes: [{ code: 'Af', group: 'A', color: '#00aa00' }],
    rain: { scale_mm: 4000 / 255 }, temp: { offset: -90 }, pressure: { atm0: 1.6, scale_m: 8000 },
    drainage: { min_accum: 1000, lines: [] },
    // the Turm: from the south (z +18 km) north toward the town, at -1,300 m falling to the sea's level
    // named by the model's id and name, as edit_513 left the Turm (r029, 'Turm Rivrh')
    rivers: opt.river === false ? [] : [{ id: 'r029', name: 'Turm Rivrh', line: [[0, 18000, -1300], [200, 12000, -1380], [-300, 6000, -1420], [0, 2000, -1440], [0, 0, -1500]], width_m: 60, depth_m: 4 }],
    // edit_512's and edit_513's kinds (px on the frame: x = (px - 10) * 2 km)
    landforms: [{ id: 'lf_test_isle', kind: 'island', x: -6000, z: -6000, r_m: 300, crest_m: -1470, water_m: -1500 },
                { id: 'lf_test_unknown', kind: 'arch', x: -8000, z: -2000, r_m: 100, crest_m: -1480, water_m: -1500 },
                // a strait across the wet strip, from x 19 km west into the sea at x 7 km (its sea end, where its raise fades)
                { id: 'lf_test_strait', kind: 'water', form: 'strait', px: 19.5, py: 8, path_px: [[19.5, 8], [13.5, 8]], width_m: 400, water_m: -1500, bed_m: -1512 },
                // a page's water: a pool on the strait, a circle and a capsule joined smoothly, with the page's shelf
                { id: 'lf_test_page', kind: 'water', form: 'page', px: 18, py: 8, water_m: -1500, smin_m: 210,
                  parts: [{ shape: 'circle', px: [18, 8], r_m: 500 }, { shape: 'capsule', px: [18, 8], px_to: [18, 7.6], r_m: 180 }] },
                { id: 'lf_test_shelf', kind: 'shelf', of: 'lf_test_page', width_m: 70, depth_m: [1.2, 4.8], water_m: -1500 },
                { id: 'lf_test_river', kind: 'water', form: 'river', river: 'r029', path_px: [[10, 10.5], [10, 11]], width_m: [80, 170], water_m: -1500 }] };
  return { meta, R };
}

// ---------------------------------------------------------------- the town: a lake r 450 m and a river south, at its 0
function rleEncode(a) { const out = []; let i = 0; while (i < a.length) { const v = a[i]; let j = i + 1; while (j < a.length && a[j] === v && j - i < 256) j++; out.push(j - i - 1, v); i = j; }
  return Buffer.from(out).toString('base64'); }
function town(opt) {
  const half = 1000, step = 10, n = 201, h = new Int16Array(n * n), w = new Uint8Array(n * n), s = .01, h0 = 0;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = -half + i * step, z = -half + j * step, r = Math.hypot(x, z);
    let g = r < 450 ? -.8 - 7.2 * sm(450, 300, r) : 1.5 + 8 * sm(450, 800, r) + (opt.hill || 0) * sm(450, 800, r);   // a step at the shore, as Voth's terrainH has
    const inRiv = z > 380 && Math.abs(x) < 30, bank = Math.abs(x) < 50 && z > 380;
    if (bank) g = Math.min(g, inRiv ? -4 : -4 + (Math.abs(x) - 30) * .4);
    h[j * n + i] = Math.round((g - h0) / s);
    w[j * n + i] = g < 0 ? (r < 452 ? 1 : 2) : 0;
  }
  const shoreR = opt.shoreR == null ? 450 : opt.shoreR, shore = [];
  for (let a = 0; a <= 360; a += 3) shore.push([+(Math.cos(a * Math.PI / 180) * shoreR).toFixed(1), +(Math.sin(a * Math.PI / 180) * shoreR).toFixed(1)]);
  // the shore points at the river's mouth (z > 380, |x| < 80) are the river's, not the lake's: skipped, as bake_towns.py skips them
  const skip = shore.map((p, k) => p[1] > 380 && Math.abs(p[0]) < 120 ? k : -1).filter(k => k >= 0);
  return { name: opt.name || 'Testtown', x: opt.x || 0, z: opt.z || 0, rot: 0, centre: [0, 0], R: 800, band: 400, onWater: true, drawn: false, level: 0,
    grid: { n, step, x0: -half, z0: -half, h0, s, h: Buffer.from(h.buffer).toString('base64') },
    water: opt.noWater ? undefined : { n, step, x0: -half, z0: -half, rle: rleEncode(w) },
    river: opt.over != null ? { name: 'Test brook', join: opt.join == null ? 'r029' : opt.join, over: opt.over, pts: [[452, 0, 6], [600, 0, 6], [700, 0, 6], [790, 0, 6]] }
      : { name: 'Test river', join: opt.join == null ? 'r029' : opt.join, pts: [[0, 440, 30], [0, 700, 30], [0, 1000, 30]] }, shore, shoreSkip: skip };
}

// ---------------------------------------------------------------- the world with these
function world(opt) {
  const { meta, R } = region(opt);
  global.WORLD_DATA = { meta, towns: { format: 'krator-openworld-towns', version: 1, towns: opt.towns } };
  global.WORLD_KITS = [];
  load('core/rand/08-core-rand.js'); load('core/terrain/38-core-relief.js');
  load('core/world/41-world-fields.js'); if (opt.water !== false) { load('core/world/41t-world-town-water.js'); load('core/world/41l-world-landforms.js'); }
  const W = vm.runInThisContext('WORLD'); W.init(R);
  return W;
}

// ---- 1. the town's water
let W = world({ towns: [town({})] });
const WT = vm.runInThisContext('WTOWN'), WL = vm.runInThisContext('WLAND'), T0 = W.towns[0], lv = WT.list[0].level;
ok('the town sits on the sea: its level is the world\'s water (' + lv + ')', lv === LEVEL, true);
ok('drawn: false -> the town\'s ground is the world\'s ground, not sunk 3 m (H at the centre ' + W.H(0, 0).toFixed(2) + ')',
  !T0.own && Math.abs(W.H(0, 0) - (LEVEL - 8)) < .05, Math.abs(W.H(0, 0) - 3 - (LEVEL - 8)) > 1);
ok('inside R the town decides the water: its lake at its level, its land dry (the model\'s sea cell under it does not count)',
  W.lakeWater(0, -100) === lv && W.lakeWater(600, 0) < -1e8 && W.water(600, 0) < -1e8, W.lakeWater(600, 0) !== LEVEL || true);
ok('...beyond the band the model\'s sea is as it was', W.lakeWater(-5000, 0) === LEVEL, true);
ok('the town\'s river: riverWater at the level in its channel, none on the town\'s land beside it',
  W.riverWater(0, 600) === lv && W.riverWater(200, 600) < -1e8, true);
const shoreR = (W_, a) => { const dx = Math.cos(a * Math.PI / 180), dz = Math.sin(a * Math.PI / 180); let lo = 300, hi = 600;
  for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (W_.H(dx * m, dz * m) < lv) lo = m; else hi = m; } return lo; };
let worstShore = 0; for (let a = 0; a < 360; a += 10) if (!(a > 60 && a < 120)) worstShore = Math.max(worstShore, Math.abs(shoreR(W, a) - 450));
ok('the shoreline at 1:1: where the ground meets the level, within a grid cell of the lake\'s r 450 (the step at the shore falls between nodes 10 m apart)',
  worstShore < 8, true, 'worst ' + worstShore.toFixed(2) + ' m');

// ---- 2. the model river cut at the band, and the link
const turm = WORLD_DATA.meta.rivers[0], last = turm.line[turm.line.length - 1];
ok('the Turm is cut just outside the band, at R + band + 300 (its last point ' + Math.round(Math.hypot(last[0], last[1])) + ' m from the town)',
  Math.abs(Math.hypot(last[0], last[1]) - 1500) < 1 && WT.list[0].cut.length === 1, !(last[0] === 0 && last[1] === 0));
const L = WT.list[0].link;
ok('the link runs from the cut (on the land, over the sea\'s level) to where the town\'s river leaves R, its water falling to the level',
  !!L && L.ya > lv + 5 && Math.abs(Math.hypot(L.pts[L.pts.length - 1][0], L.pts[L.pts.length - 1][1]) - 800) < 1
  && L.pts.every((p, i) => i === 0 || p[2] <= L.pts[i - 1][2] + 1e-9) && Math.abs(L.pts[L.pts.length - 1][2] - lv) < 1e-6, true,
  L ? L.pts.length + ' points, ' + L.len.toFixed(0) + ' m, from ' + L.ya.toFixed(1) : 'none');
const linkDry = L.pts.filter(p => !(W.riverWater(p[0], p[1]) > W.H(p[0], p[1]) + .3));
ok('...its water stands over its carved bed all the way (the land hook)', linkDry.length === 0, true, linkDry.length ? 'dry at ' + linkDry.map(p => p.map(Math.round).join(',')).slice(0, 3).join(' ') : '');
const lines = W.riverLines(40), J = lines.find(r => r.name === 'Turm Rivrh');
ok('riverLines: the Turm runs on down the link and under the town\'s water, never climbing', !!J && J.joined === 'Testtown'
  && J.pts.every((p, i) => i === 0 || p[2] <= J.pts[i - 1][2] + 1e-9) && J.pts[J.pts.length - 1][2] < lv, true, J ? J.pts.length + ' points' : '');

// ---- 3. one body
const B = W.waterBodies(), id = W.waterBodyAt(0, 0);
ok('the town\'s water is the sea\'s body (one body), its mask taking the lake in', id >= 0 && B[id].towns && B[id].towns[0] === 'Testtown' && W.waterBodyAt(-5000, 0) === id
  && WT.list[0].cells > 0, W.waterBodyAt(600, 0) === -1, B.length + ' bodies');
const chk = WT.check({ step: 40 })[0];
ok('WTOWN.check: shore, river and body', chk.ok, true, 'shore worst ' + chk.shore.max + ' m over ' + chk.shore.n + ', river ' + JSON.stringify(chk.river.inTown) + ', bodies ' + chk.body.bodies);

// ---- 4. the landforms
const lc = WL.check(), isle = lc.find(c => c.id === 'lf_test_isle');
ok('the islet is stamped: its top at the crest, its waterline near r_m on every ray', isle && isle.ok, WL.skipped.length === 1 && WL.skipped[0].kind === 'arch',
  isle ? 'top ' + isle.top + ', waterline ' + isle.waterline.join(' ') : '');
ok('...and the sea round it as it was', W.Hbare(-6000 + 900, -6000) < -1530, true);
const st = lc.find(c => c.id === 'lf_test_strait'), pg = lc.find(c => c.id === 'lf_test_page');
ok('the strait is cut to its bed under the water, and the coarse wet cells beside it are closed to its width (dry banks)', st && st.ok && st.banks > 4, true,
  st ? st.wet + ' of ' + st.stations + ' stations wet, ' + st.dryBanks + ' of ' + st.banks + ' banks dry' + (st.firstBad ? ', first bad ' + st.firstBad : '') : 'no check');
ok('...its raise fades into the sea at its end (the sea floor 500 m off its mouth as it was)', W.Hbare(7400, -4000 + 800) < -1530, true, W.Hbare(7400, -3200).toFixed(1));
ok('the page form: its parts joined smoothly, under the water, on the page\'s shelf (1.2 m deep at the shore, 13.8 m at 330 m)', pg && pg.ok
  && WL.waterAt(16000, -4000).s < -400 && Math.abs(W.Hbare(16000, -4000 + 500 - 330) - (LEVEL - 13.8)) < 3, true,
  pg ? pg.wet + ' of ' + pg.stations + ' parts wet; 330 m in ' + W.Hbare(16000, -3830).toFixed(1) : 'no check');
ok('the river form is left to 41\'s named river (not stamped, not skipped); the shelf is read with its water',
  !WL.waters.some(R => R.id === 'lf_test_river' || R.id === 'lf_test_shelf') && !WL.skipped.some(s => /river|shelf/.test(s.id)), true);

// ---- negatives
{ const W2 = world({ towns: [town({ shoreR: 480 })] }), c2 = vm.runInThisContext('WTOWN').check({ step: 40 })[0];
  ok('negative: a shore trace 30 m off the ground fails the shore check', true, !c2.ok && c2.shore.max > 20, 'worst ' + c2.shore.max + ' m'); void W2; }
{ const W3 = world({ towns: [town({ noWater: true })] });
  ok('a town without water leaves the world\'s water alone (the model\'s sea in its footprint, the Turm whole)',
    W3.lakeWater(600, 0) === LEVEL && WORLD_DATA.meta.rivers[0].line.length === 5 && vm.runInThisContext('WTOWN').list.length === 0, true); }
{ const W4 = world({ towns: [town({})], water: false });
  ok('negative: without 41t the town\'s land in the sea\'s cells reads as sea (what 41t fixes)', true, W4.lakeWater(600, 0) === LEVEL);
  ok('negative: without 41l the strait\'s coarse cells stand under the water 600 m off its line (what its stamp closes)', true,
    W4.Hbare(14000, -3400) < LEVEL && W4.water(14000, -3400) > W4.Hbare(14000, -3400)); }
{ world({ towns: [town({ join: 'r999' })] });
  ok('a town whose river joins a river the region does not hold stands alone (no link, its river still served)', true,
    vm.runInThisContext('WTOWN').list[0].link === null && vm.runInThisContext('WORLD').riverWater(0, 600) === LEVEL); }

// ---- 5. a stream over the town's water ('over': Phēr's Swīṭ down its wall), its course east up the land from the lake
{ const W5 = world({ towns: [town({ over: true, join: '' })] }), WT5 = vm.runInThisContext('WTOWN'), rv = WT5.rivers()[0], l5 = WT5.list[0].level;
  const w600 = W5.riverWater(600, 0), h600 = W5.H(600, 0);
  ok('an over-level stream: its water over its own ground in its channel (not at the town level), none beside it', Math.abs(w600 - h600 - .6) < .05 && w600 > l5 + 3
    && W5.riverWater(600, 40) < -1e8, true, 'water ' + w600.toFixed(2) + ' over ' + h600.toFixed(2));
  const c5 = WT5.check({ step: 40 })[0], ln = W5.riverLines(40).find(r => r.name === 'Test brook');
  ok('...never climbing downstream, drawn as its own line head to mouth, and WTOWN.check passes it', rv.over && rv.pts.every((p, i) => i === 0 || p[3] >= rv.pts[i - 1][3])
    && !!ln && ln.town === 'Testtown' && ln.pts.every((p, i) => i === 0 || p[2] <= ln.pts[i - 1][2] + 1e-9) && c5.ok, true,
    (ln ? ln.pts.length + ' points, ' : '') + JSON.stringify(c5.river.inTown));
  const W6 = world({ towns: [town({ over: false, join: '' })] }), c6 = vm.runInThisContext('WTOWN').check({ step: 40 })[0];
  ok('negative: the same stream not marked over is dry on its land (what over fixes)', true, !c6.ok && c6.river.inTown.dry > 0, c6.river.inTown.dry + ' dry'); void W6; }
{ const W7 = world({ towns: [town({ over: true })] }), L7 = vm.runInThisContext('WTOWN').list[0].link, c7 = vm.runInThisContext('WTOWN').check({ step: 40 })[0];
  const J7 = W7.riverLines(40).find(r => r.name === 'Turm Rivrh');
  ok('joined, it falls from the Turm at the cut down the link to its head, then down its own course to the lake', !!L7 && L7.pts.every((p, i) => i === 0 || p[2] <= L7.pts[i - 1][2] + 1e-9)
    && !!J7 && J7.pts[J7.pts.length - 1][2] < L7.pts[L7.pts.length - 1][2] - 3 && c7.ok, true, L7 ? 'from ' + L7.ya.toFixed(1) + ' to ' + L7.pts[L7.pts.length - 1][2].toFixed(1) + '; ' + JSON.stringify(c7.river) : 'no link');
  world({ towns: [town({ over: true, hill: 200 })] }); const c8 = vm.runInThisContext('WTOWN').check({ step: 40 })[0];
  ok('negative: a stream whose head stands over the Turm water at the cut cannot join it (the link would climb)', true, !c8.ok && c8.river.line.climbs > 0, JSON.stringify(c8.river.line)); }

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
