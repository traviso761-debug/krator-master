// core/camp's world-tick fixture for its node tests (test-world.js, test-raids.js): core/camp and the Beast Riders' beast
// table read in place, a small world of bands round a home town, with markets and raid targets, and a plain host (the
// sim's stand-in: each settlement a store with its people, the targets making and eating their food each day). Not a test
// itself (the runner takes test-*.js only).
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
fs.readdirSync(__dirname).filter(f => /^\d\d-camp-.*\.js$/.test(f)).sort().forEach(f => load('core/camp/' + f));
load('core/world/48t-world-travel.js');
load('kits/beast-riders/src/79-br-camp.js');
load('settlements/pinnacle-rock/src/14-pr-legs.js');
load('settlements/pinnacle-rock/src/15-pr-tune.js');
const BR_CAMP = vm.runInThisContext('BR_CAMP'), T = vm.runInThisContext('PR_TUNE').beasts;
const RULES = { diet: { grain: 0.3, meat: 0.15, fruit: 0.1 }, food: { grain: 1, meat: 1.6, fruit: 0.5 }, hunt: { meat: 12, hides: 0.8 }, gather: { fruit: 6 },
  minDays: 3, cross: 0.7, detour: 1.3, siteKm: 15, hours: 8, roadside: 1, marchHunt: 0.5, selfHunt: 0.4, keepTrade: { hides: 0 } };
const TRIBES = ['raptor', 'tiger', 'threehorn', 'staghorn', 'spider', 'longcrawler'];
/* the plain host: settlements as stores; targets make their food and eat it */
function host(o) {
  const S = {};
  (o.towns || []).forEach(t => { S[t.id] = { id: t.id, people: t.people, stock: Object.assign({}, t.stock), make: t.make || {}, eats: t.eats || {}, away: false, books: { landed: {}, taken: {}, raided: {}, sold: {}, bought: {}, made: {}, eaten: {}, killed: 0 } }; });
  const add = (o2, g, n) => { o2[g] = (o2[g] || 0) + n; };
  return { S,
    land(s, goods) { const X = S[s], out = {}; Object.keys(goods).forEach(g => { const n = goods[g]; if (n > 0) { add(X.stock, g, n); add(X.books.landed, g, n); out[g] = n; } }); return out; },
    take(s, b) { const X = S[s], out = {}; Object.keys(X.stock).forEach(g => { const n = Math.floor(X.stock[g]); if (n > 0) { X.stock[g] -= n; add(X.books.taken, g, n); out[g] = n; } }); return out; },
    away(s, a) { S[s].away = a; },
    people(s) { return S[s].people; },
    stock(s, g) { return (S[s].stock[g] || 0); },
    raid(s, goods) { const X = S[s], out = {}; Object.keys(goods).forEach(g => { const n = Math.min(goods[g], X.stock[g] || 0); if (n > 0) { X.stock[g] -= n; add(X.books.raided, g, n); out[g] = n; } }); return out; },
    kill(s, n) { S[s].people -= n; S[s].books.killed += n; },
    trade(s, sold, bought) { const X = S[s]; Object.keys(sold).forEach(g => { add(X.stock, g, sold[g]); add(X.books.sold, g, sold[g]); }); Object.keys(bought).forEach(g => { X.stock[g] -= bought[g]; add(X.books.bought, g, bought[g]); }); },
    /* a day of a target's life: it makes its food and eats it; its people grow back toward their number by births */
    day(d) { Object.values(S).forEach(X => { Object.keys(X.make).forEach(g => { add(X.stock, g, X.make[g]); add(X.books.made, g, X.make[g]); });
      Object.keys(X.eats).forEach(g => { const n = Math.min(X.stock[g] || 0, X.eats[g] * X.people); X.stock[g] = (X.stock[g] || 0) - n; add(X.books.eaten, g, n); });
      if (X.base && X.people < X.base && d % 30 === 0) X.people += Math.min(X.base - X.people, Math.ceil(X.base * 0.004)); }); } };
}
/* the world: six bands of Pinnacle at home in the wet season (days 120-300), a range of eight sites each in its own sector
   15-60 km out, two markets (a Beast Rider city, a far one), two raid targets */
function world(o) {
  o = o || {};
  const seed = o.seed == null ? 1027681 : o.seed;
  const towns = [TRIBES.map(t => ({ id: 'pinnacle:' + t, people: 0, stock: {} }))].flat().concat([{ id: 'mav', people: 0, stock: { grain: 2e6, salt: 1e5, iron: 5e4 } }, { id: 'shade', people: 0, stock: { grain: 1e6, salt: 1e5, iron: 1e5 } },
    { id: 'goto', people: 900, stock: { grain: 120000, salt: 4000, iron: 2000, cloth: 3000 }, make: { grain: 900 * 0.5 * 1.05 }, eats: { grain: 0.5 } },
    { id: 'nusidi', people: 500, stock: { grain: 60000, salt: 1500, iron: 800, cloth: 1000 }, make: { grain: 500 * 0.5 * 1.05 }, eats: { grain: 0.5 } }]);
  const Hs = host({ towns }); Hs.S.goto.base = 900; Hs.S.nusidi.base = 500;
  const sites = [], bands = [];
  TRIBES.slice(0, o.bands == null ? 6 : o.bands).forEach((t, i) => {
    const id = 'band:' + t, prog = BR_CAMP[t].grounds.lower, c = KCAMP.census({ id, world: seed, culture: 'beast-rider', program: prog }), range = [];
    for (let k = 0; k < 8; k++) { const a = (i + k / 8) / 6 * 2 * Math.PI, r = 15000 + 45000 * KCAMP.u(seed, id, k, 'site r');
      const sid = id + ':site:' + k; range.push(sid);
      sites.push({ id: sid, band: id, x: Math.sin(a) * r, z: -Math.cos(a) * r, kind: 'jungle', cap: { meat: 3500, hides: 300, fruit: 1800, fodder: 30000 }, regrow: 90 }); }
    const ro = { hunter: c.people.filter(p => p.role === 'hunter').length, gatherer: c.people.filter(p => p.role === 'gatherer').length };
    bands.push({ id, tribe: t, mountKind: t, home: { settlement: 'pinnacle:' + t, x: 0, z: 0 }, people: c.pop, warriors: Math.round(c.riders * 0.6), beasts: KCAMP.bandBeasts(T, t, c), roles: ro, range,
      stock: { grain: c.pop * 0.3 * 40, meat: 200, fodder: 0, hides: 300, beasts: 4 } });
  });
  const place = { ...Object.fromEntries(TRIBES.map(t => ['pinnacle:' + t, { x: 0, z: 0, name: 'Pinnacle Rock' }])), mav: { x: 34000, z: 242000, name: "Mav's Refuge" }, shade: { x: 444000, z: 398000, name: 'Shade' },
    goto: { x: -178000, z: 24000, name: 'Port Goto' }, nusidi: { x: -22000, z: 368000, name: 'Nusidi' } };
  const markets = { mav: { buys: { hides: 6, beasts: 1500, silk: 40 }, sells: { grain: 1, salt: 3, iron: 8 } }, shade: { buys: { hides: 9, beasts: 2400, silk: 70 }, sells: { grain: 1.6, salt: 2, iron: 6 } } };
  const want = (W, b) => [{ good: 'grain', n: Math.max(0, b.people * 0.3 * 365 * 0.6 + 6000 - (b.stock.grain || 0)) }, { good: 'salt', n: b.people * 5 }, { good: 'iron', n: b.people * 1 }];
  const targets = { goto: { militia: 0.07, walls: 0.3, garrison: 20, food: { grain: 0.5 }, loot: ['grain', 'salt', 'iron', 'cloth'] }, nusidi: { militia: 0.08, walls: 0.1, garrison: 10, food: { grain: 0.5 }, loot: ['grain', 'salt', 'iron', 'cloth'] } };
  const caravan = KCAMP.caravan({ markets, offer: ['hides', 'beasts', 'silk'], want, work: 3 });
  const raids = KCAMP.raids({ targets, caps: o.caps, warShare: 0.6 });
  const assign = o.assign || ((W, b, d) => { const k = KCAMP.u(W.world, b.id, KCAMP.raidSeason(W, d), 'venture');
    const s = KCAMP.raidSeason(W, d), tg = k < 0.25 ? 'goto' : 'nusidi';
    return k < 0.5 ? { kind: 'raid', to: tg, party: tg + ':' + s } : k < 0.8 ? { kind: 'caravan', to: 'mav' } : { kind: 'caravan', to: 'shade' }; });
  const W = KCAMP.world({ world: seed, cal: { yearD: 365, home: [120, 300] }, beasts: T, rules: Object.assign({}, RULES, o.rules || {}), host: Hs, graph: null, place, sites, bands,
    ventures: { caravan, raid: raids }, assign, dayHooks: [raids.hook, (W2, d) => Hs.day(d)] });
  return { W, Hs, raids, markets, targets };
}
module.exports = { world, T, RULES, BR_CAMP, KCAMP: global.KCAMP, KRAND: global.KRAND };
