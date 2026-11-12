// node core/camp/test-raids.js: the raids' balance proof (66-camp-raid.js, C7; core/camp/PLAN.md section 6.1; phase S6 of
// core/simulation/PROPOSAL-LONGSONG-PINNACLE.md): world-fixture.js's Beast Rider bands raiding Port Goto and Nusidi for ten
// years with no player, from three seeds. Without the player raids must not change who holds a region. Each check has a
// negative: the same decade with the caps off, where a target falls.
const F = require('./world-fixture.js'), { KCAMP } = F;
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
const YEARS = 10, SEEDS = [1027681, 20261111, 918698], TG = ['goto', 'nusidi'];
function decade(seed, caps) {
  const X = F.world({ seed, caps }), W = X.W, low = {}, pop0 = {}; TG.forEach(t => { low[t] = 1; pop0[t] = X.Hs.S[t].people; });
  for (let d = 0; d < 365 * YEARS; d++) { KCAMP.tick(W, d); TG.forEach(t => { const s = X.raids.state.standing[t]; if (s != null) low[t] = Math.min(low[t], s); }); }
  return { X, W, low, pop0, log: X.raids.state.log };
}
const t0 = Date.now(), runs = SEEDS.map(s => decade(s)), OFF = { stock: 1, people: 0.15, floorDays: 0, cooldown: 0, budget: 99, recover: 0, skirmish: 0.5 }, neg = SEEDS.map(s => decade(s, OFF));
console.log(YEARS + ' years x ' + SEEDS.length + ' seeds (and the same with the caps off) in ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s; raids: ' + runs.map(r => r.log.length).join(', ') +
  ' (' + runs.map(r => r.log.filter(l => l.outcome === 'success').length).join(', ') + ' successes)');
const fell = R => TG.some(t => R.low[t] < 0.4 || R.log.some(l => l.outcome === 'sack') || R.X.Hs.S[t].people < R.pop0[t] * 0.9);
// 1. no target sacked, none broken: the standing never under 0.4, and raids alone keep it about 0.7 or more
{ const lows = runs.map(R => TG.map(t => R.low[t].toFixed(2)).join('/'));
  ok('no target sacked or broken in ten years: the standing never under 0.4 (raids alone keep it near 0.7 or above)', runs.every(R => !fell(R) && TG.every(t => R.low[t] >= 0.6)) && runs.some(R => R.log.some(l => l.outcome === 'success')),
    neg.some(fell), 'lowest standing ' + lows.join(', ') + '; caps off: ' + neg.map(R => TG.map(t => R.low[t].toFixed(2)).join('/')).join(', ')); }
// 2. every target's people end within 10 % of their start
{ const ends = runs.map(R => TG.map(t => R.X.Hs.S[t].people + '/' + R.pop0[t]).join(' '));
  ok('every target\'s people end the decade within 10 % of their start', runs.every(R => TG.every(t => Math.abs(R.X.Hs.S[t].people - R.pop0[t]) <= R.pop0[t] * 0.1)),
    neg.some(R => TG.some(t => R.X.Hs.S[t].people < R.pop0[t] * 0.9)), ends.join('; ')); }
// 3. raided goods are under 2 % of what the targets and the bands made
{ const shares = runs.map(R => { const raided = Object.values(R.X.raids.state.raided).reduce((s, x) => s + x, 0);
    const made = TG.reduce((s, t) => s + Object.values(R.X.Hs.S[t].books.made).reduce((a, x) => a + x, 0), 0) + R.W.order.reduce((s, id) => s + Object.entries(R.W.bands[id].books.made).filter(([g]) => g !== 'fodder').reduce((a, [, x]) => a + x, 0), 0);
    return raided / made; });
  const nshare = neg.map(R => Object.values(R.X.raids.state.raided).reduce((s, x) => s + x, 0) / TG.reduce((s, t) => s + Object.values(R.X.Hs.S[t].books.made).reduce((a, x) => a + x, 0), 0));
  ok('raided goods under 2 % of what the targets and the bands made', shares.every(s => s < 0.02 && s > 0), nshare.some(s => s >= 0.02),
    shares.map(s => (s * 100).toFixed(2) + '%').join(', ') + '; caps off ' + nshare.map(s => (s * 100).toFixed(1) + '%').join(', ')); }
// 4. the caps on every raid: at most 15 % of a movable good, no staple under 14 days of the target's food, at most 2 % killed
{ let worst = 0, floor = Infinity, kill = 0;
  runs.forEach(R => R.log.forEach(l => { Object.keys(l.loot).forEach(g => { worst = Math.max(worst, l.loot[g] / l.before[g]); if (g === 'grain') floor = Math.min(floor, (l.before[g] - l.loot[g]) / (l.people * 0.5)); }); kill = Math.max(kill, l.killed / l.people); }));
  let nworst = 0; neg.forEach(R => R.log.forEach(l => Object.keys(l.loot).forEach(g => nworst = Math.max(nworst, l.loot[g] / l.before[g]))));
  ok('every raid within its caps: 15 % of a good, 14 days of food left, 2 % killed', worst <= 0.15 + 1e-9 && floor >= 14 && kill <= 0.02 + 1e-9, nworst > 0.15,
    'most taken ' + (worst * 100).toFixed(1) + '%, fewest days of food left ' + floor.toFixed(0) + ', most killed ' + (kill * 100).toFixed(2) + '%; caps off ' + (nworst * 100).toFixed(0) + '% taken'); }
// 5. budgets and the cooldown: no more raids a season than the budget, none on a target within 30 days of the last
{ const C = KCAMP.RAID_CAPS; let over = 0, close = 0;
  runs.forEach(R => { const per = {}; R.log.forEach(l => { const s = KCAMP.raidSeason(R.W, l.day); per[s] = (per[s] || 0) + 1; }); over += Object.values(per).filter(n => n > C.budget).length;
    TG.forEach(t => { const ds = R.log.filter(l => l.target === t).map(l => l.day).sort((a, b) => a - b); for (let i = 1; i < ds.length; i++) if (ds[i] - ds[i - 1] < C.cooldown) close++; }); });
  const N = F.world({ caps: { cooldown: 0, budget: 99 }, assign: () => ({ kind: 'raid', to: 'goto' }) }); for (let d = 0; d < 730; d++) KCAMP.tick(N.W, d);   /* every band its own raid, no cooldown */
  let nclose = 0; const nd = N.raids.state.log.map(l => l.day).sort((a, b) => a - b); for (let i = 1; i < nd.length; i++) if (nd[i] - nd[i - 1] < C.cooldown) nclose++;
  ok('no season over its raid budget, no target struck twice within its cooldown', !over && !close, nclose > 0, over + ' seasons over, ' + close + ' too close; every band raiding alone with no cooldown, ' + nclose + ' too close'); }
// 6. the raiders pay for it: a repulse costs riders and mounts, and every band is still a band (none starves, none under 30)
{ const rep = runs.flatMap(R => R.log.filter(l => l.outcome === 'repulsed')), cost = rep.every(l => Object.values(l.lost).some(x => x.people > 0 || x.mounts > 0));
  const bands = runs.flatMap(R => R.W.order.map(id => R.W.bands[id])), starved = bands.filter(b => (b.books.short.food || 0) > 1).length, small = bands.filter(b => b.people < 30).length;
  ok('a repulse costs the raiders riders and mounts; no band starves or dwindles under 30', (rep.length === 0 || cost) && !starved && !small, neg.some(R => R.log.some(l => Object.values(l.lost).some(x => x.people > 0))),
    rep.length + ' repulses; ' + starved + ' starved, ' + small + ' under 30; people ' + bands.map(b => b.people).join(' ')); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK'); process.exit(bad ? 1 : 0);
