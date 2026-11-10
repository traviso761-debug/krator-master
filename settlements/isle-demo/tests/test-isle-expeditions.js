// node settlements/isle-demo/tests/test-isle-expeditions.js [days] — the expedition camps by boat (PLAN.md section 12;
// src/47x) without a browser. Plans and declares both towns, gives the sim a stand-in shore hook (an island shore 25 km
// by sea east of each town's frame, its forest full: the open world's hook finds the real shores, openworld/isle-demo
// 48x), sets the test's fast season (30 days), runs `days` (default 40) with Kautoa watched and checks ISLE.expChecks:
// each town's crew sailed and pitched, made mahogany with gum and kapok from its stands, the goods landed at the town
// and booked imported, the camp fed by the boat, the canoe sheds' canoes built of them, the crew home after the season;
// each with a negative; and the merchant houses' (47y): chartered from the treasury, running the camps' money, the haul and
// provisions settled at wholesale, sailing on a margin, each season's profit or loss reported (the towns' own checks:
// tests/test-isle-week.js). Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
['10-camp-cultures.js', '40-camp-work.js'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(HERE, '..', '..', 'core', 'camp', f), 'utf8'), { filename: f }));   /* the work camp */
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
const cp = x => JSON.parse(JSON.stringify(x));
const caught = (what, rs, re) => { const r = rs.filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
ISLE.initWorld();
const days = +(process.argv[2] || 40), T = ISLE.TUNE.sim, X = T.expeditions;
X.days = 30;   /* the test's season (the real one is 90 days) */
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
const frame = town => plans[ISLE.TOWNS.indexOf(town)].G.frame;
/* THE PAGE'S STAND-IN HOOK: an island shore 25 km east of the town's frame, the camp 150 m inland, the forest full */
const pitched = [], struck = [];
/* a shore a kind: the forest's 25 km east, the vents' 4 km north of it (the node 300 m inland), the reef's 4 km south
   (the node 300 m out on the reef) */
ISLE.hooks.expeditionShore = (townName, n, kind) => { const F0 = frame(townName), dz = kind === 'vents' ? -4000 : kind === 'reef' ? 4000 : 0, sh = { x: F0.x + 25000, z: F0.z + dz, ux: -1, uz: 0 };
  return { x: sh.x + 150, z: sh.z, shore: sh, seaKm: 25, forest: () => 0.9, h: () => 0, name: 'the test isle', node: kind === 'vents' ? { x: sh.x + 300, z: sh.z } : kind === 'reef' ? { x: sh.x - 300, z: sh.z } : null }; };
ISLE.hooks.expeditionPitched = C => pitched.push(C.id); ISLE.hooks.expeditionStruck = C => struck.push(C.id);
ISLE.simDeclare(plans);
ok('the expeditions declared (ISLE.simExpeditions: the state and the hourly step), the goods in the towns\' economies', ISLE.SIM.exp && SIM.stepHooks.indexOf(ISLE.expStep) >= 0 && ISLE.SIM.order.every(s => SIM.econ(s).goods.mahogany && SIM.econ(s).goods.canoes), JSON.stringify(X));
ISLE.simWatch('Kautoa');
const a = ISLE.expBooks(), t0 = Date.now(); ISLE.simRun(days * 1440 + 1); const b = ISLE.expBooks();
console.log('ran ' + days + ' days in ' + Math.round((Date.now() - t0) / 1000) + ' s; log ' + JSON.stringify(b.log.slice(0, 4)) + '; pitched ' + pitched.join(',') + '; struck ' + struck.join(','));
const checks = ISLE.expChecks(a, b); checks.forEach(c => ok(c.name, c.ok, c.detail));
/* THE MERCHANT HOUSES (47y): the house runs each town's expeditions as a business */
const ha = ISLE.houseBooks(), hb = ISLE.houseBooks();
ISLE.houseChecks(ha, hb).forEach(c => ok(c.name, c.ok, c.detail));
{ const B = cp(hb); const s = Object.keys(B.houses)[0]; B.houses[s].flows['in']['charter capital'] = 0; caught('a house whose capital no treasury paid', ISLE.houseChecks(ha, B), /chartered a merchant house/); }
{ const B = cp(hb); Object.keys(B.houses).forEach(s => Object.keys(B.houses[s].camps).forEach(c => { B.houses[s].camps[c].minted = 720; })); caught('a camp given money made from nothing', ISLE.houseChecks(ha, B), /no money made/); }
{ const B = cp(hb); const s = Object.keys(B.houses)[0]; B.houses[s].flows['in'].haul = Math.round((B.houses[s].flows['in'].haul || 0) / 2); caught('a haul bought at half its price', ISLE.houseChecks(ha, B), /bought by the town/); }
{ const B = cp(hb); const s = Object.keys(B.houses)[0]; B.houses[s].decisions.push({ go: true, profit: -500, purse: 1e6, need: 1 }); caught('a house sailing on a loss', ISLE.houseChecks(ha, B), /positive expected margin/); }
{ const B = cp(hb); const s = Object.keys(B.houses).find(k => B.houses[k].exports.some(v => Object.keys(v.lines).length)); if (s) { const v = B.houses[s].exports.find(v => Object.keys(v.lines).length), g = Object.keys(v.lines)[0]; v.lines[g].abroad = v.lines[g].wholesale / 2; caught('a cash crop sold abroad below its cost', ISLE.houseChecks(ha, B), /ships from beyond/); } else ok('negative: a cash crop sold abroad below its cost (no export to break)', false, 'no export in the run'); }
{ const B = cp(hb); const s = Object.keys(B.houses).find(k => B.houses[k].carried.length); if (s) { B.houses[s].carried[0].took += 500; caught('a load sold dearer than the receiver\'s price', ISLE.houseChecks(ha, B), /lines between the towns/); } else ok('negative: a load sold dearer than the receiver\'s price (no load carried)', false, 'no load carried'); }
/* the houses' year, reported: the seasons by kind, the exports, the carrying */
Object.keys(hb.houses).forEach(s => { const H = hb.houses[s]; console.log('      ' + H.name + ': purse ' + H.purse + ' shells and ' + H.talents + ' Talents; ' + H.seasons.map(x => x.kind + ' ' + (x.profit >= 0 ? '+' : '') + x.profit).join(', ') + '; ' + H.exports.reduce((n, v) => n + Object.keys(v.lines).length, 0) + ' export lines; ' + H.carried.length + ' nights carried; flows ' + JSON.stringify(H.flows)); });
ok('every town\'s crew that sailed came home after the season, the page told of each pitch and strike; a town that sent none, its house declined on its margin', b.camps.length >= 1 && b.camps.every(C => C.struck || b.minute < C.sailed + (C.days + 1) * 1440) && pitched.length === b.camps.length && struck.length === b.camps.filter(C => C.struck).length && Object.keys(b.towns).every(s => b.camps.some(C => C.town === s) || b.towns[s].declined > 0),
  b.camps.map(C => C.id + ' sailed day ' + Math.round(C.sailed / 1440) + (C.struck ? ', struck day ' + Math.round(C.struck / 1440) : '')).concat(Object.keys(b.towns).filter(s => b.towns[s].declined).map(s => s + '\'s house declined ' + b.towns[s].declined + ' times')).join('; '));
/* THE NEGATIVES */
{ const B = cp(b); B.camps.forEach(C => { C.here = C.people - 2; C.struck = null; }); caught('two hands nobody can find', ISLE.expChecks(a, B), /sent a crew/); }
{ const B = cp(b); B.camps.forEach(C => { if (C.kind === 'forest') C.made.gum = 0; }); caught('a camp that tapped no gum', ISLE.expChecks(a, B), /made its main good/); }
{ const B = cp(b); B.camps.forEach(C => { C.landed.mahogany = 0; }); caught('mahogany that never landed', ISLE.expChecks(a, B), /landed at the town/); }
{ const B = cp(b); B.camps.forEach(C => { C.meals.none = 9; }); caught('a camp going hungry', ISLE.expChecks(a, B), /fed by the town/); }
{ const B = cp(b); Object.keys(B.towns).forEach(s => { B.towns[s].canoes = 0; }); caught('a canoe shed that built no canoe', ISLE.expChecks(a, B), /canoe sheds build canoes/); }
{ const B = cp(b); B.camps.forEach(C => { C.home = C.people - 1; }); caught('a hand that never came home', ISLE.expChecks(a, B), /came home/); }
console.log(bad ? 'FAILED ' + bad : 'ALL PASS');
process.exit(bad ? 1 : 0);
