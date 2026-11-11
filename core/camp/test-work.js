// node core/camp/test-work.js: core/camp's work camps (40-camp-work.js), the timber crew that migrates through its range.
// A host's loop on a stand-in forest: the crew takes `take` lots a worked day from the stand it is pitched at, moves
// when the stand is down to its seed trees, and is idle from strike to pitch. Each check has a negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
fs.readdirSync(__dirname).filter(f => /^\d\d-camp-.*\.js$/.test(f)).sort().forEach(f => load('core/camp/' + f));
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };

// ---- a stand-in forest: 13,000 lots a full 400 m cell (21 timber trees a hectare, 40 lots a tree), a lake to the
// north-east of the yard holding none
const YARD = [74697, -42993], LAKE = [YARD[0] + 900, YARD[1] - 700];
const capacity = (x, z, cell) => Math.hypot(x - LAKE[0], z - LAKE[1]) < 500 ? 0 : Math.round(13000 * (cell / 400) * (cell / 400));
const mk = (o) => { o = o || {}; const st = KCAMP.stands({ id: 'lumber-crew', range: o.range == null ? 3000 : o.range, yard: o.yard || YARD, capacity, cell: o.cell });
  return KCAMP.workCamp({ id: 'lumber-crew', world: o.world == null ? 4242 : o.world, yard: o.yard || YARD, stands: st, cfg: o.cfg }); };
// the host's loop: `take` lots a worked day; moves when due (or, `greedy`, only when the stand is bare)
const run = (W, days, take, greedy) => {
  KCAMP.workStart(W, 0); let taken = 0, until = 0, worked = 0, idle = 0, out = false; const days0 = [];
  for (let d = 0; d < days; d++) {
    if (!W.cur) { out = true; break; }
    if (d < until) { idle++; continue; }
    const left = KCAMP.workLeft(W, W.cur.stand, d, taken), n = Math.min(take, left);
    taken += n; worked++; days0.push(n);
    const L = left - n;
    if (greedy ? L <= 0 : KCAMP.workDue(W, L)) { const m = KCAMP.workMove(W, d + 1, taken); taken = 0; if (!m.pitch) { out = true; break; } until = Math.ceil(m.pitch.day); }
  }
  return { worked, idle, out, total: days0.reduce((a, b) => a + b, 0), short: days0.filter(n => n < take).length };
};
const YEARS = 5, DAYS = YEARS * 365, TAKE = 316;

// ---- the stands
const W0 = mk(), S0 = W0.stands;
const Wb = mk({ yard: [YARD[0] + 777, YARD[1] - 333], range: 2500 });
const same = (A, B) => { const sh = A.filter(s => B.by[s.id]); return { n: sh.length, ok: sh.length > 50 && sh.every(s => { const t = B.by[s.id]; return t.x === s.x && t.z === s.z && t.cap === s.cap; }) }; };
const sm = same(S0, Wb), sm3 = same(S0, mk({ cell: 300 }));
ok('the range cut into stands on a world grid: a cell keeps its id, centre and timber whatever the yard and range (' + S0.length + ' stands, ' + sm.n + ' shared)', sm.ok, !sm3.ok,
  'a 300 m grid read as the 400 m one is caught');
ok('no stand on the lake', S0.every(s => Math.hypot(s.x - LAKE[0], s.z - LAKE[1]) >= 500), KCAMP.stands({ id: 'x', range: 3000, yard: YARD, capacity: () => 13000 }).some(s => Math.hypot(s.x - LAKE[0], s.z - LAKE[1]) < 500));

// ---- five years
const W = mk(), R = run(W, DAYS, TAKE);
const Wg = mk(), Rg = run(Wg, DAYS, TAKE, true);
const Ws = mk({ range: 450 }), Rs = run(Ws, DAYS, TAKE);
const pitches = W.log.filter(o => o.op === 'pitch'), strikes = W.log.filter(o => o.op === 'strike');
ok('five years at ' + TAKE + ' lots a day: the crew always has timber (' + R.worked + ' days worked, ' + R.idle + ' on the move, ' + pitches.length + ' camps, ' + R.total + ' lots)',
  !R.out && R.short === 0 && R.worked + R.idle === DAYS && R.total === R.worked * TAKE, Rs.out || Rs.short > 0, 'a 450 m range: ' + (Rs.out ? 'worked out' : Rs.short + ' short days'));
const readyAt = (Wx) => { const Wr = KCAMP.workReplay(Object.assign({}, Wx, { log: [], cur: null, last: {} })); let bad = 0;   /* each pitch replayed: the stand held its full timber again */
  Wx.log.forEach(op => { if (op.op === 'pitch' && op.left < Wx.by[op.stand].cap * Wx.cfg.ready - 1e-6) bad++; }); return bad; };
ok('every camp pitched at a stand grown back whole (the regrowth year respected)', readyAt(W) === 0, readyAt(Ws) > 0, 'a 450 m range: ' + readyAt(Ws) + ' pitches at a stand not grown back');
const seedOk = (Wx) => Wx.log.filter(o => o.op === 'strike').every(o => { const p = Wx.log.filter(q => q.op === 'pitch' && q.stand === o.stand && q.day < o.day).pop();
  return p.left - o.taken >= Wx.cfg.strikeAt * Wx.by[o.stand].cap - TAKE; });
ok('no stand felled under its seed trees (a tenth left standing)', seedOk(W), !seedOk(Wg), 'a crew that moves only when a stand is bare is caught');
const yieldOk = (Wx) => KCAMP.workYield(Wx) >= TAKE;
ok('the range gives back more than the crew takes, so it never runs out (' + Math.round(KCAMP.workYield(W)) + ' lots a day for ever)', yieldOk(W), !yieldOk(Ws), 'a 450 m range: ' + Math.round(KCAMP.workYield(Ws)));

// ---- the march and the camp's place at any hour
const st = strikes[2], mr = W.log[W.log.indexOf(st) + 1], pt = W.log[W.log.indexOf(st) + 2];
const at0 = KCAMP.workAt(W, st.day + 0.01), at2 = KCAMP.workAt(W, pt.day + 0.01), atP = KCAMP.workAt(W, mr.until + 0.001);
const halfway = (day) => { const m = KCAMP.workAt(W, day); return m.state === 'marching' && Math.abs(m.x - (mr.x0 + mr.x1) / 2) < 1e-6 && Math.abs(m.z - (mr.z0 + mr.z1) / 2) < 1e-6; };
const kmh = Math.hypot(mr.x1 - mr.x0, mr.z1 - mr.z0) * W.cfg.detour / 1000 / ((mr.until - mr.day) * 24);
ok('the camp at any hour: striking, marching half way at ' + W.cfg.marchKmh + ' km/h, pitching, pitched (' + Math.round(Math.hypot(mr.x1 - mr.x0, mr.z1 - mr.z0)) + ' m)',
  at0.state === 'striking' && halfway((mr.day + mr.until) / 2) && Math.abs(kmh - W.cfg.marchKmh) < 1e-9 && atP.state === 'pitching' && at2.state === 'pitched' && at2.stand === pt.stand,
  !halfway(mr.day + 0.3 * (mr.until - mr.day)), 'a third of the way is not half way');

// ---- the log is the state: replay, determinism
const Wr = KCAMP.workReplay(Object.assign(mk(), { log: W.log.slice() })), Wt = KCAMP.workReplay(Object.assign(mk(), { log: W.log.slice(0, -3) }));
const W2 = mk(); run(W2, DAYS, TAKE); const W3 = mk(); run(W3, DAYS, TAKE + 40);
ok('a camp rebuilt from its log is where it was; the same inputs give the same log', JSON.stringify([Wr.cur, Wr.last]) === JSON.stringify([W.cur, W.last]) && JSON.stringify(W2.log) === JSON.stringify(W.log),
  JSON.stringify([Wt.cur, Wt.last]) !== JSON.stringify([W.cur, W.last]) && JSON.stringify(W3.log) !== JSON.stringify(W.log), 'a log missing its last move, and a heavier crew, are caught');

// ---- the trees: a stand's felled share, stumps then saplings, whole after the regrowth
const W1 = mk(); run(W1, 100, TAKE); const sv = W1.log.filter(o => o.op === 'strike')[0], n = 336, cap = W1.by[sv.stand].cap;
const count = (Wx, day) => { let g = 0, y = 0; for (let k = 0; k < n; k++) { const s = KCAMP.workTree(Wx, sv.stand, k, n, day); if (s === 'gone') g++; else if (s === 'young') y++; } return { g, y }; };
const atEnd = count(W1, sv.day + 0.5), late = count(W1, sv.day + W1.cfg.regrowDays + 1), want = Math.floor(n * sv.taken / cap);
const Wh = mk(); Object.assign(Wh, { log: W1.log, cur: W1.cur, last: JSON.parse(JSON.stringify(W1.last)) }); Wh.last[sv.stand].taken /= 2; const half2 = count(Wh, sv.day + 0.5);
ok('a stand\'s trees follow what the sim took: ' + want + ' of ' + n + ' felled at the strike (' + atEnd.g + ' stumps, ' + atEnd.y + ' saplings), all standing a regrowth later',
  atEnd.g + atEnd.y === want && atEnd.g > 0 && atEnd.y > 0 && late.g + late.y === 0, half2.g + half2.y !== want, 'a visit that took half as much fells ' + (half2.g + half2.y));
// while it is worked: the first in the order fall first, as many as the take so far
const Wl = mk(); KCAMP.workStart(Wl, 0); const s1 = Wl.cur.stand, half = Math.round(Wl.by[s1].cap / 2), live = []; for (let k = 0; k < n; k++) live.push(KCAMP.workTree(Wl, s1, k, n, 20, half));
const kv = Math.floor(n * half / Wl.by[s1].cap);
ok('while the crew works a stand the nearest trees fall first, as many as it has taken (' + kv + ')', live.slice(0, kv).every(s => s) && live.slice(kv).every(s => !s),
  !live.slice(0, kv).every(s => !s));

// the camp never pitches again where it just struck, even when the sim took nothing there (a stand still whole)
const Wz = mk(); KCAMP.workStart(Wz, 0); const z0 = Wz.cur.stand, mz = KCAMP.workMove(Wz, 1, 0);
const Wn = mk(); KCAMP.workStart(Wn, 0); const n0 = Wn.cur.stand; Wn.log.push({ op: 'strike', day: 1, stand: n0, taken: 0 }); KCAMP.workReplay(Wn);
ok('a camp never pitches again where it just struck, even having taken nothing', mz.pitch && mz.pitch.stand !== z0, KCAMP.workNext(Wn, 1, [Wn.by[n0].x, Wn.by[n0].z]).S.id === n0,
  'the move rule without the stand it left would pick it again');

console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
