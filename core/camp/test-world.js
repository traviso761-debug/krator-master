// node core/camp/test-world.js: core/camp's world tick (60, C3), the hand-over to the sim (C4) and the caravans (65, C6),
// phase S6 of core/simulation/PROPOSAL-LONGSONG-PINNACLE.md, on world-fixture.js's six Beast Rider bands of Pinnacle Rock
// (home in the wet season, ranging in the dry), two years at the world level with a plain host for the sim. Each check
// has a negative that must fail.
const F = require('./world-fixture.js'), { KCAMP } = F;
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
const YEARS = 2, D = 365 * YEARS;
function run(o) { const X = F.world(o), trace = {}; X.W.order.forEach(id => trace[id] = []);
  for (let d = 0; d < D; d++) { KCAMP.tick(X.W, d); X.W.order.forEach(id => { const b = X.W.bands[id]; trace[id].push({ d, state: b.state, loaded: b.loaded, at: b.at, home: KCAMP.inHome(X.W, d) }); }); }
  X.trace = trace; return X; }
const t0 = Date.now(), X = run(), W = X.W;
console.log(YEARS + ' years of ' + W.order.length + ' bands in ' + (Date.now() - t0) + ' ms, ' + W.ops.length + ' ops');
// 1. home in the wet season, out in the dry: every band handed over to the sim on every day of its home season, and none
//    of the dry season's (bar the first and last days' marches)
{ const bad1 = [], out = [];
  W.order.forEach(id => X.trace[id].forEach(t => { if (t.home && !t.loaded) bad1.push(id + '@' + t.d); if (!t.home && t.loaded) out.push(id + '@' + t.d); }));
  const late = []; W.order.forEach(id => X.trace[id].forEach(t => { const yd = t.d % 365; if (yd >= 110 && yd < 290 && !t.loaded) late.push(t.d); }));
  ok('every band home (handed over to the sim) every day of the wet season, and out every day of the dry', !bad1.length && !out.length, late.length > 0,
    bad1.length + ' home days missed, ' + out.length + ' dry days at home; read against a season ten days earlier, ' + late.length + ' missed'); }
// 2. in its range: camped only at its own sites; a venture only to a market or a target the culture assigns
{ const stray = [], ventures = new Set();
  W.order.forEach(id => { const b = W.bands[id]; X.trace[id].forEach(t => { if (t.state === 'camped' && b.range.indexOf(t.at) < 0) stray.push(id + '@' + t.at); if (t.state === 'venture') ventures.add(t.at); }); });
  const allowed = ['mav', 'shade', 'goto', 'nusidi'], N = W.order.map(id => W.bands[id]).some(b => b.range.indexOf(W.order.map(i => W.bands[i]).find(c => c !== b).range[0]) >= 0);
  ok('every band camps only in its own range, and ventures only to the markets and targets', !stray.length && [...ventures].every(v => allowed.indexOf(v) >= 0) && ventures.size >= 3, !N,
    stray.length + ' strays; ventured to ' + [...ventures].join(', ')); }
// 3. none starves: the people's food never short; the beasts' meat and fodder short under 5 % of their need
{ const rows = W.order.map(id => { const b = W.bands[id], B = KCAMP.books(W, id), N = KCAMP.beastNeeds(W.beasts, b.beasts), out = W.order.length && X.trace[id].filter(t => !t.loaded).length;
    return { id, food: b.books.short.food || 0, meat: (b.books.short['beast:meat'] || 0) / Math.max(1, (N.meat || 0) * out), fodder: (b.books.short['beast:fodder'] || 0) / Math.max(1, (N.fodder || 0) * out) }; });
  const N = run({ rules: { hunt: { meat: 2, hides: 0.2 }, selfHunt: 0 } }), Nshort = N.W.order.some(id => (N.W.bands[id].books.short['beast:meat'] || 0) > 0);
  ok('no band starves: its people always fed, its beasts short under 5 % of their need', rows.every(r => r.food < 1 && r.meat < 0.05 && r.fodder < 0.05), Nshort,
    rows.map(r => r.id.slice(5) + ' ' + (r.meat * 100).toFixed(1) + '% meat').join(', ')); }
// 4. the sites regrow: a site left is back to whole `regrow` days later, as a pure function of the days since
{ const S = Object.values(W.sites).find(s => s.lastLeft > 0 && !s.taken), d0 = S.lastLeft, h0 = KCAMP.siteHas(S, d0), hr = KCAMP.siteHas(S, d0 + S.regrow), hh = KCAMP.siteHas(S, d0 + S.regrow / 2);
  const whole = Object.keys(S.cap).every(g => Math.abs(hr[g] - S.cap[g]) < 1e-6), half = Object.keys(S.cap).every(g => hh[g] >= h0[g] - 1e-9 && hh[g] <= S.cap[g] + 1e-9);
  const taken = Object.keys(S.cap).some(g => h0[g] < S.cap[g] - 1);
  ok('a site the band left grows back whole in its regrow days, partway at half', whole && half && taken, !Object.keys(S.cap).every(g => Math.abs(h0[g] - S.cap[g]) < 1e-6),
    S.id + ': meat ' + Math.round(h0.meat) + ' left on day ' + d0 + ', ' + Math.round(hh.meat) + ' at half, ' + Math.round(hr.meat) + ' whole'); }
// 5. the books balance across every hand-over: per band and good, made + imported - exported - consumed - lost = closing -
//    opening, and every load handed to the sim is in the host's books (landed) and every load taken back out of them
{ let worst = 0, gap = 0; W.order.forEach(id => { const B = KCAMP.books(W, id); Object.values(B).forEach(r => worst = Math.max(worst, Math.abs(r.residual))); });
  W.order.forEach(id => { const b = W.bands[id], S = X.Hs.S[b.home.settlement]; const goods = new Set(Object.keys(S.books.landed).concat(Object.keys(S.books.taken)));
    goods.forEach(g => { const inSim = (S.books.landed[g] || 0) - (S.books.taken[g] || 0) - (S.stock[g] || 0); gap = Math.max(gap, Math.abs(inSim)); }); });
  const b0 = W.bands[W.order[0]]; b0.stock.grain = (b0.stock.grain || 0) + 1000; let w2 = 0; Object.values(KCAMP.books(W, b0.id)).forEach(r => w2 = Math.max(w2, Math.abs(r.residual))); b0.stock.grain -= 1000;
  ok('the books balance across every hand-over: each band\'s world books, and what it landed in the sim and took back', worst < 1e-6 && gap < 1e-6, w2 > 999,
    'worst residual ' + worst.toExponential(1) + ' kg; landed less taken less held in the sim ' + gap.toFixed(3)); }
// 6. a replay from a mid-run save gives the same log
{ const A = run(), cut = 545, B = F.world(), snap = s => JSON.parse(JSON.stringify(s));
  const fresh = F.world(); for (let d = 0; d < cut; d++) KCAMP.tick(fresh.W, d);
  const save = snap({ sites: fresh.W.sites, bands: fresh.W.bands, ops: fresh.W.ops, raids: fresh.raids.state, host: fresh.Hs.S });
  B.W.sites = save.sites; B.W.bands = save.bands; B.W.ops = save.ops; Object.keys(B.raids.state).forEach(k => delete B.raids.state[k]); Object.assign(B.raids.state, save.raids);
  Object.keys(B.Hs.S).forEach(k => delete B.Hs.S[k]); Object.assign(B.Hs.S, save.host);
  for (let d = cut; d < D; d++) KCAMP.tick(B.W, d);
  const same = JSON.stringify(A.W.ops) === JSON.stringify(B.W.ops), N = F.world({ seed: 7 }); for (let d = 0; d < D; d++) KCAMP.tick(N.W, d);
  ok('a replay from a save on day ' + cut + ' writes the same log; another world seed another', same && A.W.ops.length > 100, JSON.stringify(N.W.ops) !== JSON.stringify(A.W.ops), A.W.ops.length + ' ops'); }
// 7. a band's place at any minute: on the march, between its two ends by the share of the leg gone
{ const pt = id => W.sites[id] || W.place[id], op = W.ops.find(o => o.what === 'march' && o.args.d1 - o.args.d0 >= 2 && pt(o.args.to) && pt(o.args.from)), b = W.bands[op.who], save = { state: b.state, leg: b.leg, at: b.at };
  b.state = 'march'; b.leg = { from: op.args.from, to: op.args.to, d0: op.args.d0, d1: op.args.d1 }; b.at = null;
  const a = pt(op.args.from), z = pt(op.args.to), mid = KCAMP.at(W, b.id, (op.args.d0 + op.args.d1) / 2 * 1440), end = KCAMP.at(W, b.id, op.args.d1 * 1440 + 60);
  Object.assign(b, save);
  const ok1 = Math.abs(mid.x - (a.x + z.x) / 2) < 1e-6 && Math.abs(mid.z - (a.z + z.z) / 2) < 1e-6 && Math.abs(end.x - z.x) < 1e-6;
  ok('a band\'s place on the march is a pure function of the minute: halfway at the leg\'s middle', ok1, Math.abs(mid.x - a.x) > 1, op.who + ' ' + op.args.from.split(':').pop() + ' > ' + op.args.to.split(':').pop()); }
// 8. caravans (C6): each trade books both ends; what a band sold was worth what it bought, and it bought no more than its
//    beasts carry
{ const T = W.trades || [], M = X.markets, H = X.Hs.S; let worst = 0, over = 0;
  T.forEach(t => { const m = M[t.market], v = Object.keys(t.sold).reduce((s, g) => s + t.sold[g] * m.buys[g], 0), c = Object.keys(t.bought).reduce((s, g) => s + t.bought[g] * m.sells[g], 0);
    worst = Math.max(worst, c - v); const cap = t.cap + 1, n = Object.values(t.bought).reduce((s, x) => s + x, 0); if (n > cap) over++; });
  const sum = (k, mk) => T.filter(t => t.market === mk).reduce((s, t) => s + Object.values(t[k]).reduce((a, x) => a + x, 0), 0);
  const both = ['mav', 'shade'].every(mk => Math.abs(sum('bought', mk) - Object.values(H[mk].books.bought).reduce((a, x) => a + x, 0)) < 1e-6 && Math.abs(sum('sold', mk) - Object.values(H[mk].books.sold).reduce((a, x) => a + x, 0)) < 1e-6);
  ok('every caravan\'s trade is booked at the market too, paid in full, within its beasts\' load', T.length >= 4 && both && worst <= 1e-6 && !over, (() => { const t = T[0]; return Object.keys(t.bought).length > 0; })(),
    T.length + ' trades; ' + T.reduce((s, t) => s + (t.bought.grain || 0), 0) + ' kg of grain bought'); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK'); process.exit(bad ? 1 : 0);
