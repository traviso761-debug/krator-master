// node settlements/isle-demo/tests/test-isle-city.js — the isle demo's city plan (P6) without a browser.
// Runs the city page's [G data] half as build.py writes it (dist/isle-city.plan.js: the region's rasters as integers, the
// kits' declared boxes, the site file, the world's ground, core/city, src/20-34), plans both towns and checks:
//   - every check of src/34-isle-census.js ISLE.checks passes for each town (overlap, streets, sea, wall, vessels, the
//     programme, the size, the hug, the farmland);
//   - a rerun of a town gives the same placement (every lot's key, x, z, ry; every way's points; every field);
//   - negatives: a building pushed onto its neighbour, one pushed into the sea, the palace taken away: each must fail.
// Build first (python3 build.py). About a minute: each town's ground grid and plan.
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8', 0).startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h.toString(16); };
const hash = R => fnv(JSON.stringify([R.lots.map(L => [L.key, L.x, L.z, L.ry]), R.plan.ways.map(w => w.pts.map(p => [+p[0].toFixed(2), +p[1].toFixed(2)])), R.fields.map(F => [F.crop, F.x, F.z])]));
ISLE.initWorld();
const plan = town => { const S = SITE_INIT.towns[town], P = ISLE.PROG[town], G = ISLE.townGround(S.frame, { half: P.half, cell: P.gridCell });
  const R = ISLE.city(town, { site: S, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null });
  return { R, G }; };
const runs = {};
ISLE.TOWNS.forEach(town => {
  const t0 = Date.now(), { R, G } = plan(town), C = ISLE.census(R);
  console.log('--- ' + town + ': ' + C.buildings + ' buildings, ' + C.households + ' households, ' + R.fields.length + ' farm parcels, ' + R.vessels.length + ' vessels (' + (Date.now() - t0) + ' ms)');
  ISLE.checks(R, G).forEach(c => ok(c.name, c.ok, c.detail));
  runs[town] = { R, G, h: hash(R) };
});
{ const town = 'Valapo', again = plan(town); ok('a rerun places the same (' + town + ')', hash(again.R) === runs[town].h, runs[town].h + ' / ' + hash(again.R)); }
{ const { R, G } = runs.Kautoa, L = R.lots.map(l => Object.assign({}, l)), a = L.find(l => l.cls !== 'landmark'), b = L.find(l => l !== a && l.cls !== 'landmark');
  b.bo = Object.assign({}, b.bo, { c: a.bo.c.slice() }); b.x = a.x; b.z = a.z;
  const r = ISLE.checks(R, G, { lots: L }).filter(c => /overlap/.test(c.name))[0]; ok('negative: a building pushed onto its neighbour is caught', !r.ok, r.detail); }
{ const { R, G } = runs.Kautoa, L = R.lots.map(l => Object.assign({}, l)), a = L.find(l => l.cls !== 'landmark' && !l.shore), v = R.vessels[0];
  a.bo = Object.assign({}, a.bo, { c: [v.x, v.z] }); a.x = v.x; a.z = v.z;
  const r = ISLE.checks(R, G, { lots: L }).filter(c => /in the sea/.test(c.name))[0]; ok('negative: a building pushed into the sea is caught', !r.ok, r.detail); }
{ const { R, G } = runs.Kautoa, R2 = Object.assign({}, R, { lots: R.lots.filter(l => l.role !== 'palace') });
  const r = ISLE.checks(R2, G).filter(c => /landmarks the brief/.test(c.name))[0]; ok('negative: the palace taken away is caught', !r.ok, r.detail); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
