// node core/camp/test-camp-raid.js — core/camp's raid rules (55-camp-raid.js; core/camp/PLAN.md section 6.1): the strength and
// the defence, the outcome bands, the caps per raid (rule 2), the sack only of a broken town (rule 3), the standing and its
// recovery (rule 1), the target's choice (cooldown, supply). Each negative is a pair (tools/ktest.js).
const fs = require('fs'), path = require('path');
const T = require('../../tools/ktest.js')(__filename);
global.window = global;
(0, eval)(fs.readFileSync(path.join(__dirname, '55-camp-raid.js'), 'utf8'));
const K = KCAMP;

// 1. strength and defence
{
  const s = K.raidStrength({ warriors: 150, arms: 3, mounts: 1, morale: 1.1 }), d = K.raidDefence({ people: 150, garrison: 120, militia: 0.2, walls: 2.5 });
  T.ok('strength is warriors x arms x mounts x morale (495); a fort\'s defence its militia and garrison behind its walls (975)', Math.abs(s - 495) < 1e-9 && Math.abs(d - 975) < 1e-9, s + ' vs ' + d);
}
// 2. the bands rise with the ratio; a fort holds against a war band, a village does not
{
  const r = { warriors: 150, arms: 3, morale: 1.1 }, fort = { people: 150, garrison: 120, militia: 0.2, walls: 2.5 }, vil = { people: 3600, militia: 0.06 };
  const fb = [], vb = []; for (let h = 0; h < 200; h++) { fb.push(K.raidOutcome(r, fort, h * 7919).band); vb.push(K.raidOutcome(r, vil, h * 7919).band); }
  T.ok('over 200 rolls a fort repulses the war band every time and a village never does', fb.every(b => b === 'repulsed') && vb.every(b => b !== 'repulsed'),
    'fort ' + [...new Set(fb)].join('/') + '; village ' + [...new Set(vb)].join('/'));
}
// 3. rule 3: only a broken town is sacked
{
  const r = { warriors: 600, arms: 3 }, t = { people: 1000, militia: 0.05 };
  const sacks = st => { let n = 0; for (let h = 0; h < 200; h++) if (K.raidOutcome(r, Object.assign({ standing: st }, t), h * 104729).band === 'sack') n++; return n; };
  T.ok('a town at standing 0.3 (broken) is sacked by an overwhelming raid; at 1.0 it never is', sacks(0.3) > 0 && sacks(1) === 0, sacks(0.3) + ' sacks of 200 when broken');
  T.neg('a town above the broken threshold is never sacked', st => sacks(st) === 0, 0.3, 1);
}
// 4. rule 2: the take is capped (15 % of the movable stock) and leaves the staples' floor
{
  const st = { grain: 100000, tools: 200, arms: 10 }, o = { take: 1, want: ['grain', 'tools', 'arms'], floor: { grain: 95000 } };
  const capOK = tk => Object.keys(tk).every(g => tk[g] <= st[g] * 0.15 + 1 && st[g] - tk[g] >= (o.floor[g] || 0) - 1);
  const tk = K.raidTake(st, o);
  T.ok('a raid takes at most 15 % of each good and never the grain below its floor', capOK(tk) && tk.grain === 5000 && tk.tools === 30, JSON.stringify(tk));
  T.neg('the caps off, a raid empties the stores', capOK, K.raidTake(st, Object.assign({}, o, { cap: false })), tk);
}
// 5. rule 2: the dead are capped at 2 % of the people
{
  const under = n => n <= 3600 * 0.02;
  T.ok('a successful raid kills at most 2 % of 3,600 (72)', under(K.raidDead(3600, 'success')) && K.raidDead(3600, 'success') === 72);
  T.neg('the caps off, a raid kills far more', under, K.raidDead(3600, 'success', { cap: false }), K.raidDead(3600, 'success'));
}
// 6. rule 1: the standing falls with the losses and recovers by its share a week
{
  const t = { people: 900, base: { people: 1000, stock: 100 }, stock: 50 };
  const s0 = K.raidStanding(t); K.raidRecover(t, 70); const s1 = t.standing;
  T.ok('the standing (0.6 people, 0.4 stock) falls to ' + s0.toFixed(2) + ' and recovers over ten weeks', Math.abs(s0 - 0.74) < 1e-9 && s1 > s0, s0.toFixed(3) + ' -> ' + s1.toFixed(3));
}
// 7. the choice: hostile, within the column's supply, not in its cooldown; the weaker and nearer first
{
  const from = { x: 0, z: 0 }, tg = [{ id: 'near', x: 20000, z: 0, wealth: 2, standing: 1, last: null }, { id: 'far', x: 400000, z: 0, wealth: 9, standing: 1, last: null },
    { id: 'hit', x: 10000, z: 0, wealth: 3, standing: 1, last: 0 }];
  const pick = cd => (K.raidChoose({ from, targets: tg, now: 30 * 1440, cooldown: cd, kmDay: 25, supplyDays: 20 }) || {}).id;
  T.ok('the war band takes the nearest target in reach that it did not raid a month ago', pick(60) === 'near', 'picked ' + pick(60));
  T.neg('without a cooldown it goes back to the one it just raided', cd => pick(cd) === 'near', 0, 60);
}
T.done();
