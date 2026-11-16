// node core/hamlet/test-hamlet-trade.js: the trade post shared by two cultures (34-hamlet-trade.js). Each check has a
// negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/city/33-city-strategies.js');
fs.readdirSync(__dirname).filter(f => /^\d\d-hamlet-.*\.js$/.test(f)).sort().filter(f => f !== '34-hamlet-trade.js').forEach(f => load('core/hamlet/' + f));
const H = KHAMLET;
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };

// ---- the opt-in proof: the villages, the FOCI and the rows answer the same before and after 34 loads
const vdims = k => (k.length % 3 ? { w: 10, d: 8, h: 5 } : { w: 7, d: 6, h: 4 });
const vspec = (focus, row, w) => ({ id: 'old-' + row + '-' + focus, world: w == null ? 7 : w, culture: row, focus, site: { x: 0, z: 0 }, link: { x: 500, z: 80 }, dims: vdims });
const digest = () => JSON.stringify({ foci: H.FOCI, rows: Object.keys(H.CULTURES),
  v: H.FOCI.map(f => H.hashOf(H.village(vspec(f, 'islander_east')))), x: ['farming', 'ranch'].map(f => H.hashOf(H.village(vspec(f, 'xanadu')))) });
const before = digest();
load('core/hamlet/34-hamlet-trade.js');
ok('loading the trade post moves no village; `trade` stays out of the village\'s FOCI', digest() === before && H.FOCI.indexOf('trade') < 0 && H.TRADE_FOCUS === 'trade',
  H.hashOf(H.village(vspec('salt', 'islander_east', 8))) !== H.hashOf(H.village(vspec('salt', 'islander_east'))));

// ---- the Great Chasm's post on the sill: Yuni (no row yet) and the Coyote Men (no kit): every key pending
const LA = { x: 1700 + 40, z: 1000 - 420 }, LB = { x: 1700 - 60, z: 1000 + 380 };
const tspec = o => Object.assign({ id: 'sill-post', world: 9, cultures: ['yuni', 'coyote'], site: { x: 1700, z: 1000 }, links: [LA, LB], caravans: 40 }, o || {});
const P = H.tradePost(tspec());
const all = v => v.records.concat(v.stalls);
ok('the post comes back with no error, both halves peopled, every record and stall pending (no Yuni row, no Coyote kit)',
  !P.error && P.census.A.pop > 0 && P.census.B.pop > 0 && all(P).every(r => r.pending) && P.pendingKeys.includes('yuni-serai') && P.pendingKeys.includes('coyote-house-poor'),
  !H.tradePost(tspec({ dims: k => k === 'yuni-serai' ? { w: 40, d: 40, h: 6 } : null })).serai.pending,
  P.error || (P.records.length + ' records, ' + P.stalls.length + ' stalls; A ' + P.census.A.pop + ' people, B ' + P.census.B.pop + '; pending ' + P.pendingKeys.length + ' keys'));
const rectOf = r => H.rect(r.x, r.z, Math.cos(r.ry), -Math.sin(r.ry), r.w, r.d);
const sdOf = (v, x, z) => (x - v.line.pts[0][0]) * v.frame.across[0] + (z - v.line.pts[0][1]) * v.frame.across[1];
const sidesOk = v => v.records.every(r => {
  if (r.side == null) return r.role === 'serai' || r.role === 'market';
  return H.corners(rectOf(r)).every(q => r.side === 'A' ? sdOf(v, q[0], q[1]) <= -2 + 1e-6 : sdOf(v, q[0], q[1]) >= 2 - 1e-6);
});
const nA = P.records.filter(r => r.side === 'A').length, nB = P.records.filter(r => r.side === 'B').length;
ok('every building on its own side of the line, but the shared serai and market', sidesOk(P) && nA > 5 && nB > 5,
  !sidesOk(Object.assign({}, P, { records: P.records.concat([Object.assign({}, P.records.find(r => r.side === 'A'), { side: 'B' })]) })), 'A ' + nA + ', B ' + nB);
const touches = (v, r) => { const s = H.corners(rectOf(r)).map(q => sdOf(v, q[0], q[1])); return Math.min(...s) < 0 && Math.max(...s) > 0; };
ok('the market straddles the line, its boundary stones on the line inside it', touches(P, P.market) && P.line.stones.length >= 3 &&
  P.line.stones.every(q => Math.abs(sdOf(P, q.x, q.z)) < 1e-6 && H.inPoly(H.corners(rectOf(P.market)), q.x, q.z)),
  !touches(P, Object.assign({}, P.market, { x: P.market.x + P.frame.across[0] * 30, z: P.market.z + P.frame.across[1] * 30 })), P.line.stones.length + ' stones');
const inSerai = (v, st) => H.corners(rectOf(Object.assign({}, st, { w: st.w - 0.02, d: st.d - 0.02 }))).every(q => H.inPoly(H.corners(rectOf(v.serai)), q[0], q[1]));
const stallsOk = (v, n) => v.stalls.length >= n && v.stalls.every(s => inSerai(v, s));
const P80 = H.tradePost(tspec({ caravans: 80 }));
ok('the serai stalls every beast inside its walls, and grows for a bigger caravan', stallsOk(P, 40) && stallsOk(P80, 80) && P80.serai.w > P.serai.w,
  !stallsOk(Object.assign({}, P, { stalls: P.stalls.concat([Object.assign({}, P.stalls[0], { x: P.stalls[0].x + 200 })]) }), 40),
  P.stalls.length + ' stalls in ' + P.serai.w + ' m, ' + P80.stalls.length + ' in ' + P80.serai.w + ' m');
const facing = (v, links) => v.serai.gates.every((g, s) => {
  const L = links[s], O = links[1 - s], d = (q) => g.n[0] * (q.x - g.x) + g.n[1] * (q.z - g.z), road = v.roads.find(r => r.side === g.side);
  return d(L) > 0 && d(L) > d(O) && road && road.pts[0][0] === g.x && road.pts[0][1] === g.z;
});
ok('each side\'s gate faces its own road, and its road starts there', facing(P, [LA, LB]), !facing(P, [LB, LA]));
const overlaps = v => {
  const S = KSPACE.create({ cell: 24 }), out = [], rs = v.records.filter(r => r.role !== 'serai').concat(v.stalls);
  rs.forEach(r => S.insert(r, r.x, r.z, Math.hypot(r.w, r.d) / 2));
  rs.forEach(a => S.query(a.x, a.z, Math.hypot(a.w, a.d) / 2).forEach(b => { if (a.id < b.id && H.overlap(rectOf(a), rectOf(b), -0.05)) out.push(a.id + '/' + b.id); }));
  v.records.filter(r => r.side).forEach(r => { if (H.overlap(rectOf(r), rectOf(v.serai), -0.05)) out.push(r.id + '/serai'); });
  return out;
};
ok('nothing overlaps (filed in core/space): the halves clear of each other, the serai, the market and the stalls of each other',
  overlaps(P).length === 0, overlaps(Object.assign({}, P, { records: P.records.concat([Object.assign({}, P.records[5], { id: 'dup', x: P.records[5].x + 1 })]) })).length > 0, overlaps(P).slice(0, 3).join(' '));
const roles = (v, s) => v.records.filter(r => r.side === s).reduce((a, r) => (a[r.role] = (a[r.role] || 0) + 1, a), {});
const RA = roles(P, 'A'), RB = roles(P, 'B');
ok('each half has its civic, religious, stores, warehouse and houses; the cisterns on the holder\'s side', ['A', 'B'].every(s => { const R = roles(P, s);
  return R.civic === 1 && R.religious === 1 && R.general === 1 && R.food === 1 && R.warehouse >= 1 && R.store >= 1 && R.house >= 1; }) && RA.cistern >= 1 && !RB.cistern,
  !!roles(H.tradePost(tspec({ cisterns: 'B' })), 'B').cistern && !roles(H.tradePost(tspec({ cisterns: 'B' })), 'A').cistern,
  JSON.stringify(RA) + ' / ' + JSON.stringify(RB));
const housed = (v, s, C) => v.records.filter(r => r.side === s && r.role === 'house').reduce((n, r) => n + r.households, 0) >= C.households;
ok('every household of each half has a roof on its own side', housed(P, 'A', P.census.A) && housed(P, 'B', P.census.B),
  !housed(Object.assign({}, P, { records: P.records.filter(r => r.role !== 'house' || r.side !== 'B') }), 'B', P.census.B));
// a known row: Xanadu's half in its own keys, the Coyote half pending
const xdims = k => k.indexOf('xa_') === 0 ? { w: 10, d: 8, h: 5 } : null;
const X = H.tradePost(tspec({ id: 'xa-post', cultures: ['xanadu', 'coyote'], dims: xdims }));
const keysOk = v => v.records.filter(r => r.role === 'house').every(r => r.side === 'A' ? r.key.indexOf('xa_') === 0 && !r.pending : r.key.indexOf('coyote-') === 0 && r.pending);
ok('each half\'s houses are in its own culture\'s keys (Xanadu\'s drawn, the Coyote Men\'s pending)', !X.error && keysOk(X),
  !keysOk(Object.assign({}, X, { records: X.records.map(r => r.role === 'house' ? Object.assign({}, r, { side: r.side === 'A' ? 'B' : 'A' }) : r) })), X.error);
const same = JSON.stringify(H.tradePost(tspec())) === JSON.stringify(P);
ok('the same spec gives the same post', same, JSON.stringify(H.tradePost(tspec({ world: 10 })).records) !== JSON.stringify(P.records));
const line = [[1600, 990], [1800, 1030]], PL = H.tradePost(tspec({ line }));
let threw = false, e1 = null, e2 = null;
try { e1 = H.tradePost(tspec({ links: [LA, { x: LA.x + 10, z: LA.z }] })).error; e2 = H.tradePost(tspec({ cultures: ['yuni'] })).error; } catch (e) { threw = e; }
ok('a given line divides it; links on one side, or one culture, give an error, not an exception', !PL.error && sidesOk(PL) && touches(PL, PL.market) && !threw && !!e1 && !!e2,
  !sidesOk(Object.assign({}, PL, { frame: P.frame, line: { pts: [[1700, 1300], [1800, 1300]] } })), PL.error || e1);

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
