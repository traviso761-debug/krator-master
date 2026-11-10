#!/usr/bin/env node
/* kits/tents/tests/test-tents.js: the Tents kit's plain data, in node (no browser, no three.js).

     node kits/tents/tests/test-tents.js           the checks below (exit 1 on a failure)
     node kits/tents/tests/test-tents.js --write   rewrite kits/interiors/sets/tents.js's items from the kit's table, then check

   1. the table (src/33-tn-table.js): every def key parses, has a declared box, and a room or a reason for none;
   2. the interiors set (kits/interiors/sets/tents.js) declares the table's rooms: one item per def key, a skip exactly where the
      form has no room, and each room's outline, height, door and poles as tnRoom() gives them, its kind the def's natural role's;
   3. core/camp's mapping (core/camp/50-camp-tents.js): every def a culture row names is one the kit draws, every row's dress
      is a dress the kit has, an unknown culture takes 'generic' and says so, culture spellings alias;
   4. a band of every culture row pitched by KCAMP.tentProgram + KCAMP.pitch on the kit's boxes, and a caravan halt in both
      formations (KCAMP.halt): nothing short, no overlap (KCAMP.check), the same seed the same camp.
   Each check has a negative that must fail. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..'), SRC = path.join(ROOT, 'kits', 'tents', 'src'), SET = path.join(ROOT, 'kits', 'interiors', 'sets', 'tents.js');
const read = f => fs.readFileSync(f, 'utf8');
const load = f => vm.runInThisContext(read(path.join(ROOT, f)), { filename: f });
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };

/* ---- the kit's table and its natural roles (47-tn-defs.js's TN_ROLE_OF and tnRoleOf, lifted: the rest of 47 needs the engine) */
const defs = read(path.join(SRC, '47-tn-defs.js'));
const roleSrc = [/^const TN_ROLE_OF=.*$/m, /^function tnRoleOf\(.*$/m].map(re => { const m = re.exec(defs); if (!m) throw new Error('47-tn-defs.js: ' + re); return m[0]; }).join('\n');
const K = vm.runInThisContext(read(path.join(SRC, '33-tn-table.js')) + '\n' + roleSrc +
  '\n;({TN_FORMS, TN_ROLES, TN_TRADES, TN_KEYS, TN_SIZE_NAMES, tnParse, tnDims, tnRoom, tnRoleOf})', { filename: '33-tn-table.js' });
global.window = global;
load('core/rand/08-core-rand.js');
const dress = vm.runInThisContext(read(path.join(SRC, '41-tn-dress.js')) + '\n;({TN_DRESS, TN_DRESS_ORDER, tnDress})', { filename: '41-tn-dress.js' });

/* ---- 1. the table */
{
  const probs = [];
  for (const key of K.TN_KEYS) {
    const p = K.tnParse(key), D = K.tnDims(key), R = K.tnRoom(key);
    if (!p || !K.TN_FORMS[p.form]) probs.push(key + ' does not parse');
    if (!D || !(D.w > 0 && D.d > 0 && D.h > 0)) probs.push(key + ' has no box');
    if (!R || !(R.skip || (R.poly && R.poly.length >= 3 && R.h > 0 && R.door))) probs.push(key + ' has neither a room nor a reason');
  }
  const neg = K.tnDims('tn-nonesuch-m') === null && K.tnRoom('tn-yurt-x') === null;
  ok('table: every def key has a box and a room or a reason', !probs.length, neg, probs.join(', ') || K.TN_KEYS.length + ' defs');
}

/* ---- 2. the interiors set against the table */
const r3 = v => Math.round(v * 1000) / 1000;
const fmt = v => JSON.stringify(v).replace(/,/g, ', ').replace(/:/g, ': ').replace(/"([a-z]\w*)": /gi, '$1: ').replace(/"/g, "'").replace(/\{/g, '{ ').replace(/\}/g, ' }');
function itemOf(key) {
  const p = K.tnParse(key), F = K.TN_FORMS[p.form], R = K.tnRoom(key), D = K.tnDims(key), role = K.tnRoleOf(p.form, p.size), RR = K.TN_ROLES[role];
  const it = { key, name: F.name + ', ' + K.TN_SIZE_NAMES[p.size], types: RR.types.slice(), lot: [r3(D.w), r3(D.d)] };
  if (R.skip) { it.skip = R.skip; return it; }
  /* only a family tent (a cottage) is a residence: a sleeping tent's people eat at the mess, a chief's tent is a hall (IX.TENTS.item) */
  if (RR.types.some(t => /^dwelling/.test(t)) !== (RR.kind === 'cottage')) it.residence = RR.kind === 'cottage';
  const room = { id: 'in', kind: RR.kind, poly: R.poly, y: 0, h: r3(R.h), doors: [{ at: R.door.at, w: R.door.w, swing: R.door.swing || 'none' }] };
  if (R.posts.length) room.fixtures = R.posts.map((q, i) => ({ id: 'pole' + i, kind: 'post', x: q[0], z: q[1], w: 0.2, d: 0.2, reach: false }));
  it.rooms = [room];
  return it;
}
function itemLine(it) {
  const head = "    { key: '" + it.key + "', name: '" + it.name + "', types: " + fmt(it.types) + ', lot: ' + fmt(it.lot);
  const res = it.residence == null ? '' : ', residence: ' + it.residence;
  if (it.skip) return head + ", skip: '" + it.skip + "' }";
  const R = it.rooms[0];
  return head + res + ',\n      rooms: [{ id: ' + "'" + R.id + "', kind: '" + R.kind + "', poly: " + fmt(R.poly) + ', y: 0, h: ' + R.h + ',\n        doors: ' + fmt(R.doors) +
    (R.fixtures ? ',\n        fixtures: ' + fmt(R.fixtures) : '') + ' }] }';
}
if (process.argv.includes('--write')) {
  const t = read(SET), a = t.indexOf('items: [\n'), b = t.indexOf('\n  ] });', a);
  if (a < 0 || b < 0) throw new Error('sets/tents.js: no items list to rewrite');
  fs.writeFileSync(SET, t.slice(0, a + 'items: [\n'.length) + K.TN_KEYS.map(k => itemLine(itemOf(k))).join(',\n') + t.slice(b), 'utf8');
  console.log('wrote ' + path.relative(ROOT, SET).split(path.sep).join('/') + ' (' + K.TN_KEYS.length + ' items)');
}
let SETDEF = null;
const IXstub = { sets: { byName: {}, add: d => { SETDEF = d; } } };
vm.runInNewContext(read(SET), { KratorInteriors: IXstub }, { filename: 'sets/tents.js' });
function compare(set) {
  const probs = [], by = {};
  for (const it of set.items) by[it.key] = it;
  for (const key of K.TN_KEYS) {
    const it = by[key], want = itemOf(key);
    if (!it) { probs.push(key + ': no item'); continue; }
    if (!!it.skip !== !!want.skip) { probs.push(key + ': skip ' + !!it.skip + ', the table says ' + !!want.skip); continue; }
    if (it.skip) continue;
    const a = it.rooms[0], w = want.rooms[0];
    if (JSON.stringify(a.poly) !== JSON.stringify(w.poly)) probs.push(key + ': outline');
    if (a.h !== w.h) probs.push(key + ': h ' + a.h + ' vs ' + w.h);
    if (it.residence !== want.residence) probs.push(key + ': residence ' + it.residence + ' vs ' + want.residence);
    if (a.kind !== w.kind) probs.push(key + ': kind ' + a.kind + ' vs ' + w.kind);
    if (JSON.stringify(a.doors) !== JSON.stringify(w.doors)) probs.push(key + ': door');
    if (JSON.stringify(a.fixtures || []) !== JSON.stringify(w.fixtures || [])) probs.push(key + ': poles');
  }
  for (const it of set.items) if (K.TN_KEYS.indexOf(it.key) < 0) probs.push(it.key + ': not a def of the kit');
  return probs;
}
{
  const probs = compare(SETDEF);
  const moved = JSON.parse(JSON.stringify(SETDEF)); const room = moved.items.find(i => !i.skip).rooms[0]; room.poly[0][0] += 0.1;
  ok('interiors set: kits/interiors/sets/tents.js declares the table\'s rooms', !probs.length, compare(moved).length > 0,
    probs.join(', ') || SETDEF.items.length + ' items, ' + SETDEF.items.filter(i => !i.skip).length + ' with a room (run with --write to regenerate)');
}
{
  const IX = { sets: { byName: { tents: { byKey: {} } }, add: () => {} } };
  for (const it of SETDEF.items) IX.sets.byName.tents.byKey[it.key] = it;
  vm.runInNewContext(read(SET), { KratorInteriors: IX }, { filename: 'sets/tents.js' });
  const a = IX.TENTS.item('tn-ridge-m', { kind: 'cottage', culture: 'iziz' }), b = IX.TENTS.item('tn-ridge-m', { kind: 'dormitory' }), c = IX.TENTS.item('tn-marquee-l', { kind: 'hall' });
  const pass = a.residence && a.rooms[0].kind === 'cottage' && a.culture === 'iziz' && !b.residence && b.rooms[0].kind === 'dormitory' && !c.residence &&
    IX.TENTS.item('tn-fly-m', {}).skip;
  ok('interiors set: a role is a room kind; only a family tent is a residence', pass, !IX.TENTS.item('tn-yurt-m', { kind: 'hall' }).residence, 'cottage, dormitory, hall');
}

/* ---- 3. core/camp's mapping */
load('core/space/20-core-space.js');
fs.readdirSync(path.join(ROOT, 'core', 'camp')).filter(f => /^\d\d-camp-.*\.js$/.test(f)).sort().forEach(f => load('core/camp/' + f));
const KCAMP = vm.runInThisContext('KCAMP');
function mapProbs(T, keys) {
  const probs = [];
  for (const c in T.CULTURES) {
    const R = T.CULTURES[c];
    if (!dress.TN_DRESS[R.dress]) probs.push(c + ': dress ' + R.dress + ' is not the kit\'s');
    for (const role in T.ROLES) { const t = KCAMP.tentFor(role, { culture: c }); if (!t || keys.indexOf(t.key) < 0) probs.push(c + '/' + role + ': ' + (t && t.key)); }
    for (const tr in T.TRADES) { const t = KCAMP.tentFor('workshop', { culture: c, trade: tr }); if (!t || keys.indexOf(t.key) < 0) probs.push(c + '/' + tr + ': ' + (t && t.key)); }
  }
  for (const f in T.FORM_SIZES) for (const s of T.FORM_SIZES[f]) if (keys.indexOf('tn-' + f + '-' + s) < 0) probs.push('FORM_SIZES ' + f + '-' + s);
  return probs;
}
{
  const probs = mapProbs(KCAMP.TENTS, K.TN_KEYS);
  const u = KCAMP.tentFor('family', { culture: 'nonesuch' }), al = KCAMP.tentFor('family', { culture: 'nomad' }), sz = KCAMP.tentFor('family', { culture: 'generic', size: 's' });
  if (!(u.key === 'tn-bell-m' && u.dress === 'generic' && u.fallback === 'nonesuch')) probs.push('an unknown culture: ' + JSON.stringify(u));
  if (!(al.dress === 'desert' && !al.fallback)) probs.push('alias nomad: ' + JSON.stringify(al));
  if (sz.key !== 'tn-bell-s') probs.push('size s: ' + sz.key);
  if (KCAMP.tentFor('trade', { culture: 'generic', size: 'l' }).key !== 'tn-awning-m') probs.push('a size the form lacks');
  for (const c in KCAMP.TENTS.CULTURES) if (dress.tnDress(c).key !== KCAMP.TENTS.CULTURES[c].dress) probs.push('kit dress for ' + c + ': ' + dress.tnDress(c).key);
  const keysLess = K.TN_KEYS.filter(k => k !== 'tn-yurt-m');
  ok('core/camp mapping: every row names the kit\'s defs and dresses', !probs.length, mapProbs(KCAMP.TENTS, keysLess).length > 0,
    probs.join(', ') || Object.keys(KCAMP.TENTS.CULTURES).length + ' culture rows x ' + Object.keys(KCAMP.TENTS.ROLES).length + ' roles + ' + Object.keys(KCAMP.TENTS.TRADES).length + ' trades');
}

/* ---- 4. camps pitched on the kit's boxes */
const dims = KCAMP.tentDims(k => K.tnDims(k)), ground = { ok: () => true };
function band(c) {
  const P = KCAMP.tentProgram({ id: 'b-' + c, culture: c, households: 6, sleeping: 2, council: true, trades: ['smith', 'hide', 'seer'], supply: 1, guard: 1, mess: 1, stable: 1, latrine: 1 });
  const camp = KCAMP.pitch({ id: 'b-' + c, world: 0, culture: P.culture, program: P.program, site: { x: 0, z: 0 }, dims, ground, way: [0, 1], formation: 'ring' });
  return { camp, P, census: KCAMP.census({ id: 'b-' + c, world: 0, culture: P.culture, program: P.program }) };
}
{
  const probs = [], sum = [];
  for (const c in KCAMP.TENTS.CULTURES) {
    const B = band(c), ch = KCAMP.check(B.camp, ground);
    const want = B.P.program.tents.concat(B.P.program.pens).reduce((a, e) => a + e.n, 0);
    if (B.camp.short.length || ch.overlaps || ch.offGround || B.camp.records.length !== want) probs.push(c + ': ' + B.camp.records.length + '/' + want + ' short ' + B.camp.short.length + ' overlaps ' + ch.overlaps);
    if (!(B.census.pop >= 40 && B.census.pop <= 80)) probs.push(c + ': pop ' + B.census.pop);
    sum.push(c + ' ' + B.camp.records.length);
  }
  const B = band('scyvoi'), a = B.camp.records[0], b = B.camp.records[1], moved = { records: B.camp.records.map(r => r === b ? Object.assign({}, b, { x: a.x, z: a.z }) : r) };
  ok('bands: every culture row pitches a whole ring, no overlap, 40 to 80 people', !probs.length, KCAMP.check(moved, ground).overlaps > 0, probs.join(' | ') || sum.join(', '));
  const B2 = band('scyvoi');
  ok('bands: the same band gives the same camp', JSON.stringify(B2.camp.records) === JSON.stringify(B.camp.records),
    JSON.stringify(band('xanadu').camp.records) !== JSON.stringify(B.camp.records), 'scyvoi twice; another culture differs');
}
{
  const probs = [], sum = [];
  for (const formation of ['laager', 'line']) for (const c in KCAMP.TENTS.CULTURES) {
    const H = KCAMP.halt({ id: 'h', world: 0, culture: c, wagons: 8, site: { x: 0, z: 0 }, way: [0, 1], formation, dims, ground });
    const ch = KCAMP.check(H, ground, 1.2), wag = H.records.filter(r => r.def === 'tn-wagon-m').length;
    if (H.short.length || ch.overlaps || wag !== 8) probs.push(formation + '/' + c + ': short ' + H.short.join(',') + ' overlaps ' + ch.overlaps + ' wagons ' + wag);
    sum.push(formation + '/' + c + ' ' + H.records.length);
  }
  const tight = KCAMP.halt({ id: 'h', world: 0, culture: 'iziz', wagons: 8, site: { x: 0, z: 0 }, way: [0, 1], formation: 'laager', dims, ground: { ok: (x, z) => Math.hypot(x, z) < 12 } });
  ok('caravan halts: laager and line pitched whole, eight wagons, no overlap', !probs.length, tight.short.length > 0, probs.join(' | ') || sum.join(', '));
}

console.log(bad ? 'FAILED: ' + bad : 'ALL PASS');
process.exit(bad ? 1 : 0);
