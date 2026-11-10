// node settlements/isle-demo/tests/test-isle-nephtos-plan.js [days] — Nephtos planned by core/city from a drawing (PLAN.md
// section 15, 2026-11-09: the owner lays the colony out in the site planner): its programme (30 PROG.Nephtos) on a TEST
// drawing (tests/fixtures/nephtos-test-site.json, not the owner's), the Hykkousoi pieces' boxes (ISLE_DIMS, kit hyk:
// settlements/ys read by build.py), then declared on the sim in place of the placeholder (simDeclare opts.colonies) and run
// `days`. Checks: every key the plan asked for has a box (none missing); the town is Hykkousoi (every lot a hyk_ piece);
// the markers' landmarks stand; the harbour's shore pieces and its landing; every lot a place of a mapped kind; housed,
// staffed, fed. Each with a negative. Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
['10-camp-cultures.js', '40-camp-work.js'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(HERE, '..', '..', 'core', 'camp', f), 'utf8'), { filename: f }));
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
ISLE.initWorld();
const days = +(process.argv[2] || 2);
const plan = (town, S0) => { const G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; };
const plans = ISLE.TOWNS.map(t => plan(t, SITE_INIT.towns[t]));
const SITE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'nephtos-test-site.json'), 'utf8'));
const N = plan('Nephtos', SITE), R = N.R, C = ISLE.census(R);
const keys = {}; R.lots.forEach(L => { keys[L.key] = (keys[L.key] || 0) + 1; });
ok('planned with no key missing a box (' + R.lots.length + ' lots; ' + C.citizens + ' people in ' + C.households + ' households)', !Object.keys(R.missing || {}).length && R.lots.length > 40,
  JSON.stringify(R.missing));
const notHyk = Object.keys(keys).filter(k => !/^hyk_/.test(k));
ok('a Hykkousoi town: every lot a Ys kit piece (' + Object.keys(keys).length + ' kinds: ' + Object.keys(keys).slice(0, 12).join(', ') + '...)', !notHyk.length, notHyk.join(', '));
{ const L = R.lots.map(l => Object.assign({}, l)); L[0].key = 'ie-house-uma'; ok('negative: an Islander house in the colony is caught', L.some(l => !/^hyk_/.test(l.key))); }
const roles = {}; R.lots.forEach(L => { if (L.role) roles[L.role] = (roles[L.role] || 0) + 1; });
const want = ['palazzo', 'temple', 'council hall', 'customs', 'shipyard', 'barracks'];
ok('the markers\' landmarks stand: ' + want.map(r => r + ' ' + (roles[r] || 0)).join(', '), want.every(r => roles[r] > 0), JSON.stringify(roles).slice(0, 400));
const shore = R.lots.filter(L => /hyk_(quay|pier|wet_landing|boat_shed)/.test(L.key));
ok('the harbour: its shore pieces (' + shore.length + ') and a landing for the Tethyan ships (' + (R.landings || []).length + ')', shore.length >= 2 && (R.landings || []).length >= 1);
/* on the sim, in the placeholder's place */
ISLE.simDeclare(plans, null, { colonies: [N] });
const X = ISLE.SIM.towns.nephtos;
ok('declared: every lot of a mapped kind a place (' + X.places.places.length + ' places; ' + JSON.stringify(X.places.byKind).slice(0, 300) + ')', !Object.keys(X.places.unmapped).length,
  JSON.stringify(X.places.unmapped));
ISLE.simRun(days * 1440);
ISLE.simChecks(R).filter(c => /has a home|has a job/.test(c.name)).forEach(c => ok(c.name, c.ok, c.detail));
const B = ISLE.simBooks('nephtos');
ok('fed after ' + days + ' days (' + (B.meals.meal + B.meals.single) + ' meals at home, ' + B.meals.none + ' without; with no countryside here it eats one food at a time)', B.meals.meal + B.meals.single > 0 && !B.meals.none, JSON.stringify(B.meals));
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
