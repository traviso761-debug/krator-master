/* kits/interiors/tests/test-xanadu-scrap.js: the Scrap Xanadu interiors (sets/xanadu-scrap.js) against the defs they serve.
   1. every def xa_scrap_* has an item or a skip for each variant (forDef), and every item carries its def key;
   2. THE DOORS: every street door of every item (bar a doorway marked court: true, off a court inside the def, where the kit
      draws no leaf) stands in one of the def's own door openings (XAK.proto(key, v).userData.doors,
      the set's DOORS table): along the wall within the leaf's half width, through it within 1.1 m (an inset body's door sits on
      the footprint inside the batter); and every one of the def's doors is served by a door of the item, or is listed below
      with why not;
   3. WALK IN, as a host does it: the item placed turned and raised by IX.sets.instantiate(..., {walk: KWALK}), the def's own
      leaves in core/door (KDOOR, unlocked) blocking their doorways in the same walk; a walker on the ground outside the item's
      FRONT door (its first street door) finds that door (KDOOR.nearest), opens it and every leaf it comes to (KDOOR.open,
      KDOOR.step), and reaches every floor of the item: every room, every storey up its stairs (bar the floors listed below
      that the host's own climb reaches);
   4. NEGATIVES: with the leaves shut the same walker reaches no room's floor; locked, a leaf will not open and the way stays
      shut; and a door moved 2 m along its wall is caught by the door check.
   5. (optional) --xak: the scrap bundle built here (kits/xanadu/kit_bundle.py bundle(scrap=True)) and run on the local
      three.js: XAK.proto(key, v) door records equal the set's DOORS for every variant, all locked, and XAK.proto(key, v,
      {unlocked: true}) hands back unlocked doors exactly for the defs with an interior (SCRAP_OPEN).
     node tests/test-xanadu-scrap.js dist/interiors-core.js [--xak]        (run from kits/interiors)   */
'use strict';
const fs = require('fs'), path = require('path');
const IX = global.KratorInteriors = require(path.resolve(process.argv[2] && !/^--/.test(process.argv[2]) ? process.argv[2] : path.join(__dirname, '..', 'dist', 'interiors-core.js')));
const walkSrc = fs.readFileSync(path.resolve(__dirname, '../../../core/walk/20-core-walk.js'), 'utf8');
const KWALK = new Function('var root={};' + walkSrc + ';return root.KWALK||(typeof KWALK!=="undefined"?KWALK:null);')();
(0, eval)(fs.readFileSync(path.resolve(__dirname, '../sets/xanadu-scrap.js'), 'utf8'));
const S = IX.sets.byName['xanadu-scrap'], DOORS = S.doors;
let fails = 0, checks = 0;
const bad = (m) => { fails++; if (fails < 40) console.log('FAIL', m); };
const ok = (c, m) => { checks++; if (!c) bad(m); return c; };

/* the def's doors that no item door serves, and why */
const UNSERVED = {
  xa_scrap_gate: { 0: 'the gate between the towers: an open passage under the walk', 1: 'the gate (second leaf)' },
  xa_scrap_bridge: { 1: 'the span\'s door into the west tower\'s top storey: the host\'s span deck', 3: 'the span\'s door into the east tower' }
};
/* floors the walker from the front door is not expected to reach (the host's climb reaches them) */
const ABOVE = { xa_scrap_tank_house: ['.top'] };
const DEFS = Object.keys(DOORS);

/* 1. coverage */
for (const k of DEFS) for (let v = 0; v < 3; v++) { const it = S.forDef(k, v); ok(it && it.def === k, k + ' v' + v + ': no item'); }
for (const it of S.items) ok(DEFS.indexOf(it.def) >= 0 && it.key.split('#')[0] === it.def, it.key + ': def key ' + it.def);

/* an item's street doors in its own frame: [{at, w, body}] */
function streetDoors(it) {
  const out = [];
  (it.bodies || []).forEach(b => (b.doors || []).forEach(d => out.push({ at: d.at, w: d.w, body: b.id, court: !!d.court })));
  (it.rooms || []).forEach(r => (r.doors || []).forEach(d => { if (d.to == null || d.to === 'street') out.push({ at: d.at, w: d.w, body: r.id }); }));
  return out;
}
/* the record a door stands in, or null: along the leaf's wall within its half width (+0.1), through it within 1.1 m */
function recordOf(key, d) {
  let best = null;
  DOORS[key].forEach((R, i) => {
    const t = [Math.cos(R[3]), -Math.sin(R[3])], n = [Math.sin(R[3]), Math.cos(R[3])], dx = d.at[0] - R[0], dz = d.at[1] - R[2];
    const along = Math.abs(dx * t[0] + dz * t[1]), thru = Math.abs(dx * n[0] + dz * n[1]);
    if (along <= R[4] / 2 + 0.1 && thru <= 1.1 && (!best || along + thru < best.e)) best = { i: i, e: along + thru };
  });
  return best;
}
function checkDoors(it, doors) {
  const used = new Set(), probs = [];
  doors.forEach(d => { if (d.court) return; const r = recordOf(it.def, d); if (!r) probs.push(it.key + ' door at [' + d.at.join(', ') + '] (' + d.body + ') stands in none of the def\'s doors'); else used.add(r.i); });
  /* a double leaf: its partner is served with it */
  DOORS[it.def].forEach((R, i) => { if (used.has(i)) DOORS[it.def].forEach((Q, j) => { if (j !== i && Math.abs(Q[2] - R[2]) < 0.05 && Math.abs(Q[0] - R[0]) < (Q[4] + R[4]) / 2 + 0.05 && Math.abs(Q[3] - R[3]) < 0.01) used.add(j); }); });
  DOORS[it.def].forEach((R, i) => { if (!used.has(i) && !(UNSERVED[it.def] && UNSERVED[it.def][i])) probs.push(it.key + ': the def\'s door ' + i + ' at [' + R[0] + ', ' + R[2] + '] has no door in the item'); });
  return probs;
}

/* 2. doors, and the matcher's negative */
let nDoors = 0;
for (const it of S.items) {
  if (it.skip) { ok(!DOORS[it.def].length, it.key + ' is skipped but the def draws doors'); continue; }
  const doors = streetDoors(it); nDoors += doors.length;
  checkDoors(it, doors).forEach(p => bad(p)); checks++;
  const moved = doors.map((d, i) => i === 0 ? Object.assign({}, d, { at: [d.at[0] + 2 * Math.cos(DOORS[it.def][0][3]), d.at[1] - 2 * Math.sin(DOORS[it.def][0][3])] }) : d);
  ok(checkDoors(it, moved).length > 0, it.key + ': negative: a door moved 2 m along its wall still passes the door check');
}
console.log('doors: ' + nDoors + ' street doors on ' + S.items.filter(i => !i.skip).length + ' items, every one in a def door');

/* 3, 4. walk in through the front door, and the negatives. The host's way: the interior into core/walk by IX.sets.instantiate
   (its walls, floors, stairs and entry flights; a doorway left a gap), the def's own leaves into core/door (KDOOR.add, as
   XAK.proto(key, v, {unlocked: true}) hands them: unlocked) and their blocks into the same walk (KDOOR.walk): shut, a leaf
   blocks its doorway; the walker comes to the front door, KDOOR.nearest finds it, KDOOR.open swings it (KDOOR.step), and the
   doorway clears. Turned a quarter (core/walk's reach floods a 0.4 m grid four ways: a 0.6 m flight laid diagonally across it
   reads as blocked), off the grid's origin and raised: the item's own transform is what is checked */
const doorSrc = fs.readFileSync(path.resolve(__dirname, '../../../core/door/10-core-door.js'), 'utf8');
const KDOOR = new Function('var window={};' + doorSrc + ';return window.KDOOR||(typeof KDOOR!=="undefined"?KDOOR:null);')();
const OX = 37.53, OZ = -21.29, RY = Math.PI / 2, BY = 2.4;
let walked = 0, floorsAll = 0, leaves = 0;
for (const it of S.items) {
  if (it.skip) continue;
  const W = KWALK.create(), D = KDOOR.create();
  const inst = IX.sets.instantiate(it, OX, OZ, RY, { baseY: BY, register: false, walk: W });
  const c = Math.cos(RY), s = Math.sin(RY), T = (p) => [OX + p[0] * c + p[1] * s, OZ - p[0] * s + p[1] * c];
  DOORS[it.def].forEach((R, i) => { const p = T([R[0], R[2]]); D.add({ id: it.def + '.' + i, at: [p[0], BY + R[1], p[1]], yaw: R[3] + RY, w: R[4], h: R[5], locked: false, key: it.def }); });
  D.walk(W); leaves += D.list.length;
  /* the front door in world metres, and a step outside it on the ground */
  const d0 = streetDoors(it)[0], R0 = DOORS[it.def][recordOf(it.def, d0).i], nL = [Math.sin(R0[3]), Math.cos(R0[3])];
  const start = T([R0[0] + nL[0] * 1.6, R0[2] + nL[1] * 1.6]);
  const rooms = W.floors.filter(F => F.kind === 'poly' && !/\.entry$/.test(F.name || ''));
  /* a floor part narrower than a walker (a strip left between a stair well and the wall) is no room: its area over its longest side */
  const wide = (F) => { const P = F.pts; let a = 0, L = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; L = Math.max(L, Math.hypot(q[0] - p[0], q[1] - p[1])); } return Math.abs(a / 2) / (L || 1) >= 0.5; };
  const skipF = ABOVE[it.def] || [], want = rooms.filter(F => wide(F) && !skipF.some(s2 => (F.name || '').endsWith(s2) || (F.name || '').indexOf(s2 + '.') >= 0));
  floorsAll += want.length;
  const ground = () => BY, inside = (R) => R.reached.filter(F => rooms.indexOf(F) >= 0);
  /* negative: the leaves shut, nothing inside */
  const shut = W.reach([[start[0], BY, start[1]]], { ground: ground });
  ok(!inside(shut).length, it.key + ': negative: with the doors shut the walker still reaches ' + inside(shut).map(F => F.name.replace(inst.id + '.', '')).slice(0, 3).join(', '));
  /* the walker at the front door: the door it finds is that door, unlocked; locked, it will not open and the way stays shut */
  const near = D.nearest(start[0], BY + R0[1], start[1], 2.2);
  ok(near && near.id === it.def + '.' + DOORS[it.def].indexOf(R0) || near && Math.hypot(near.at[0] - T([R0[0], R0[2]])[0], near.at[2] - T([R0[0], R0[2]])[1]) < R0[4] + 0.2,
    it.key + ': KDOOR.nearest from the front step finds ' + (near ? near.id : 'nothing'));
  D.list.forEach(Dr => D.lock(Dr, true));
  ok(!D.open(near), it.key + ': negative: a locked leaf opened');
  D.step(10);
  ok(!inside(W.reach([[start[0], BY, start[1]]], { ground: ground })).length, it.key + ': negative: the doors locked, the walker still gets in');
  /* unlocked (the scrap proto's {unlocked: true}): the walker opens each leaf as it comes to it; every floor */
  D.list.forEach(Dr => { D.lock(Dr, false); D.open(Dr, { by: 'npc' }); });
  D.step(10);
  ok(D.list.every(Dr => Dr.open === 1 && Dr.blocks.every(b => b.off)), it.key + ': a leaf did not swing open or its blocks stayed on');
  const open = W.reach([[start[0], BY, start[1]]], { ground: ground });
  const miss = want.filter(F => open.reached.indexOf(F) < 0);
  if (ok(!miss.length && !open.capped, it.key + ': from the front door the walker misses ' + miss.length + ' of ' + want.length + ' floors: ' + miss.map(F => F.name.replace(inst.id + '.', '')).slice(0, 5).join(', '))) walked++;
}
console.log('walk in: ' + walked + ' items entered by the front door through ' + leaves + ' core/door leaves, ' + floorsAll + ' floors reached with them open, none with them shut or locked');

/* 5. the scrap bundle's own door records (optional: builds the bundle and runs it on the local three.js) */
if (process.argv.indexOf('--xak') >= 0) {
  const vm = require('vm'), cp = require('child_process'), ROOT = path.resolve(__dirname, '../../..');
  const js = cp.execFileSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', 'import sys; sys.path.insert(0, "kits/xanadu"); import kit_bundle as K; sys.stdout.buffer.write(K.bundle(scrap=True)[0].encode("utf-8"))'], { cwd: ROOT, maxBuffer: 64e6 }).toString('utf8');
  const open = JSON.parse(cp.execFileSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', 'import sys, json; sys.path.insert(0, "kits/xanadu"); import kit_bundle as K; print(json.dumps(K.SCRAP_OPEN))'], { cwd: ROOT }).toString());
  const el = () => new Proxy(function () {}, { get: (t, k) => k === 'style' || k === 'dataset' || k === 'classList' ? new Proxy({}, { get: () => () => {}, set: () => true }) : k === 'getContext' ? () => null
    : k === 'children' || k === 'childNodes' ? [] : k === Symbol.toPrimitive ? () => '' : /^(width|height|clientWidth|clientHeight)$/.test(k) ? 0 : /^(textContent|innerHTML|value)$/.test(k) ? '' : () => el(), set: () => true, apply: () => el() });
  const ctx = { console: { log() {}, warn() {}, error() {} }, Math, Date, JSON, Object, Array, Float32Array, Uint16Array, Uint32Array, Int32Array, Uint8Array, Map, Set, WeakMap, Error, String, Number,
    Boolean, Symbol, Promise, setTimeout, URLSearchParams, performance: { now: () => 0 }, navigator: { userAgent: 'node' }, devicePixelRatio: 1, innerWidth: 800, innerHeight: 600,
    location: { search: '', hash: '', href: '' }, addEventListener() {}, requestAnimationFrame: () => 0 };
  ctx.window = ctx.self = ctx.globalThis = ctx;
  ctx.document = new Proxy({}, { get: (t, k) => k === 'body' || k === 'documentElement' || k === 'head' ? el() : k === 'readyState' ? 'complete' : () => el() });
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'kits/ancients/three.min.js'), 'utf8'), ctx);
  vm.runInContext(js, ctx);
  const got = JSON.parse(vm.runInContext('JSON.stringify((function(){var o={};XAK.VERN.order.filter(function(k){return /^xa_scrap_/.test(k);}).forEach(function(k){o[k]=[0,1,2].map(function(v){'
    + 'var a=XAK.proto(k,v),b=XAK.proto(k,v,{unlocked:true});return {d:a.userData.doors.map(function(R){return [R.at[0],R.at[1],R.at[2],R.yaw,R.w,R.h,R.locked];}),u:b.userData.doors.map(function(R){return R.locked;})};});});return o;})())', ctx));
  const errs = vm.runInContext('XAK.errors.length', ctx);
  ok(!errs, 'XAK: ' + errs + ' build errors');
  ok(Object.keys(got).sort().join() === DEFS.slice().sort().join(), 'XAK: the scrap defs ' + Object.keys(got).join() + ' are not the set\'s DOORS keys');
  const r2 = (x) => Math.round(x * 100) / 100;
  for (const k in got) got[k].forEach((V, v) => {
    const mine = DOORS[k] || [];
    ok(V.d.length === mine.length && V.d.every((R, i) => R[6] === true && [0, 1, 2, 4, 5].every(j => Math.abs(r2(R[j]) - mine[i][j]) < 0.011) && Math.abs(R[3] - mine[i][3]) < 0.002),
      'XAK ' + k + ' v' + v + ': the proto\'s doors differ from the set\'s DOORS (or are not locked)');
    const want = open.indexOf(k) >= 0;
    ok(V.u.every(l => l === !want), 'XAK ' + k + ' v' + v + ': {unlocked: true} gives locked ' + JSON.stringify(V.u) + ', want ' + !want);
    ok(want === !!S.items.find(it => it.def === k && !it.skip), 'XAK ' + k + ': SCRAP_OPEN ' + (want ? 'lists' : 'misses') + ' a def the set ' + (want ? 'skips' : 'furnishes'));
  });
  console.log('xak: ' + Object.keys(got).length + ' scrap defs x 3 variants: the proto\'s doors are the set\'s, locked, and unlocked on {unlocked: true} for the ' + open.length + ' with an interior');
}
console.log('checks ' + checks + ', failures ' + fails);
process.exit(fails ? 1 : 0);
