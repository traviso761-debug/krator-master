// node settlements/isle-demo/tests/test-isle-export.js [minutes] — the isle profile's `sim` export section (P7e, PLAN.md
// section 7) without a browser. Runs the city page's [G data] half (dist/isle-city.plan.js), then core/export (which
// takes the section src/50-isle-export.js queued), plans both towns, declares them, runs a world day (or `minutes`) and
// checks: EXPORT.check under the profile ['sim'] fails on a stubbed section (no contributor) and on an empty one (a
// contributor that returns nothing), and passes filled; the export is a krator-sim object a JSON round trip keeps; and
// src/50's ISLE.simExportChecks, each with a negative. Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), ROOT = path.join(HERE, '..', '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'core', 'export', '07-core-export.js'), 'utf8'), { filename: '07-core-export.js' });
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
ISLE.initWorld();
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
ISLE.simDeclare(plans);
const minutes = +(process.argv[2] || 1440), t0 = Date.now();
ISLE.simRun(minutes);
console.log('--- ran ' + minutes + ' minutes in ' + (Date.now() - t0) + ' ms');
const status = () => { const w = EXPORT.world({ sections: ['sim'] }), c = EXPORT.check(w, { profile: ['sim'] }); return { w, c, st: w.sections.sim.status }; };
ok('the section is registered by the page (src/50, queued for core/export)', EXPORT.contributors ? JSON.stringify(EXPORT.contributors('sim') || EXPORT.contributors()).indexOf('isle-sim') >= 0 : true);
const filled = status();
ok('EXPORT.check under the profile [sim] passes filled', filled.st === 'ok' && filled.c.ok, 'status ' + filled.st + (filled.c.problems.length ? '; ' + filled.c.problems.slice(0, 2).join('; ') : ''));
{ const off = EXPORT.register('sim', () => null, { by: 'isle-sim' }); const e = status(); ok('negative: an empty section fails the profile', e.st === 'empty' && !e.c.ok, 'status ' + e.st);
  off(); const s = status(); ok('negative: a stubbed section (no contributor) fails the profile', s.st === 'stub' && !s.c.ok, 'status ' + s.st + '; ' + s.c.problems.filter(p => /sim/.test(p)).slice(0, 1).join(''));
  ISLE.simExportRegister(); const r = status(); ok('registered again, it passes', r.st === 'ok' && r.c.ok, 'status ' + r.st); }
const doc = filled.w.sim, json = JSON.stringify(doc), back = JSON.parse(json);
ok('a krator-sim object that a JSON round trip keeps', doc.format === 'krator-sim' && json === JSON.stringify(back),
  (json.length / 1024).toFixed(0) + ' KB: ' + doc.places.length + ' places, ' + doc.actors.length + ' actors, ' + doc.settlements.map(T => T.id + ' (' + T.people + ' people, ' + Object.keys(T.goods).length + ' goods, ' + T.producers.length + ' producers)').join(', ') + ', ' + doc.routes.length + ' routes');
ISLE.simExportChecks(back).forEach(c => ok(c.name, c.ok, c.detail));
const cp = () => JSON.parse(json);
const caught = (what, d, re) => { const r = ISLE.simExportChecks(d).filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
{ const d = cp(), a = d.actors.find(a => a.settlement === 'valapo' && a.home); a.home = d.actors.find(b => b.settlement === 'kautoa' && b.home).home; caught('a Valapo resident housed in Kautoa', d, /own settlement/); }
{ const d = cp(), T = d.settlements[0], g = Object.keys(T.goods)[0]; T.goods[g].warehouses += 7; caught('7 units booked that no warehouse holds', d, /place records hold/); }
{ const d = cp(), R = d.routes[0], k = Object.keys(R.shipped)[0]; if (k) { const g = Object.keys(R.shipped[k])[0]; R.shipped[k][g] += 5; } else R.shipped['x>y'] = { salt: 5 }; caught('5 units shipped and never landed', d, /landed or is at sea/); }
{ const d = cp(), T = d.settlements[1], g = Object.keys(T.goods)[0]; T.goods[g].made = -1; caught('a negative book', d, /is a count/); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
