// core/furnish's node test: a fixed list of calls against a stub catalog gives the same records, every time.
//   node core/furnish/test-furnish.js        exits 0 when every check passes
// The digest at the bottom is the records' fingerprint; a change to the record shape or the arithmetic moves it,
// and every build that furnishes through core/furnish has to be re-checked (python3 core/furnish/fingerprint.py).
'use strict';
const K = require('./50-core-furnish.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

const ENTRIES = {
  bench: { key: 'bench', w: 1.8, d: 0.5, h: 0.45, type: 'seat', job: null },
  forge: { key: 'forge', w: 1.2, d: 1.0, h: 1.1, type: 'work', job: 'smithing' },
  lamp:  { key: 'lamp', w: 0.3, d: 0.3, h: 2.2, type: 'lamp', job: null },
};
const catalog = { has: k => k in ENTRIES, entry: k => ENTRIES[k], dims: (A, v) => ({ w: A.w * (1 + 0.1 * v), d: A.d, h: A.h }) };

// a Girder-like registry: the seed is the record's place in the list, numbers rounded
const drawn = [], solids = [];
const R = K.create({ on: true, interiorsOn: false, catalog,
  seed: (o, ctx, R) => R.placed.length + 1,
  finish: r => { r.x = +r.x.toFixed(3); r.y = +r.y.toFixed(3); r.z = +r.z.toFixed(3); r.ry = +r.ry.toFixed(4); },
  shift: { forge: [0.5, 0], lamp: v => (v ? null : [0, -0.25]) },
  onRecord: (rec, ctx, o, A, dm) => { if (dm.h >= 0.3) solids.push(rec.id || 'dry'); if (rec.setting === 'room' && ctx.deferRooms) return false; },
  draw: rec => drawn.push(rec.id) });

const house = { furniture: [] };
const f = { x: 10, z: -4, fx: 0, fz: 1 };                  // a frame facing +z
const p1 = R.frm(f, 1, 2, 0);
const r1 = R.place('bench', p1[0], 0.2, p1[1], p1[2], { v: 1 }, [1, 0.2, 2, 0], { building: 'b1', list: house.furniture, wealth: 0.4 });
const p2 = R.frm({ x: 0, z: 0, fx: 1, fz: 0 }, 0, 1, Math.PI / 2);   // a frame facing +x
const r2 = R.place('forge', p2[0], 0, p2[1], p2[2], {}, [0, 0, 1, Math.PI / 2], { building: 'b1', list: house.furniture });
const r3 = R.place('lamp', 3.3333333, 1, 4.4444444, 0.1234567, { seed: 77 }, null, { building: 'street' });
const r4 = R.place('nothing', 0, 0, 0, 0, {}, null, { building: 'b1' });
const r5 = R.place('nothing', 0, 0, 0, 0, {}, null, { building: 'b1' });
const r6 = R.place('bench', 0, 0, 0, 0, {}, null, { building: 'b2', dry: true });   // a throwaway build
const drawnAfterDry = drawn.length;
const r7 = R.place('bench', 1, 0, 1, 0, { setting: 'room' }, null, { building: 'b2', deferRooms: true });
let made = null;
const r8 = R.place('bench', 2, 0, 2, 0, { room: 'b2.room.0' }, null, { building: 'b2', listOf: () => (made = made || []) });

ok(r1.x === 9 && r1.z === -2 && r1.ry === 0, 'FRM frame: +z the front, +x the right (-fz, fx)');
ok(r2.ry === 3.1416, 'a frame facing +x turns lry with it (atan2(1, 0) + PI/2)');
ok(r1.seed === 1 && r2.seed === 2 && r3.seed === 77, 'seeds: the build rule, or o.seed');
ok(r2.x === 1.5 && r2.z === 0, 'forge shift undone along the piece: placed at x 1, ry PI, shift (0.5, 0) lands at x 1.5');
ok(r3.x === 3.364 && r3.z === 4.693, 'a variant-0 lamp: shift (0, -0.25) undone at ry 0.1234567, rounded by finish');
ok(r4 === null && r5 === null && R.missing.nothing === 2, 'a missing key is counted, never thrown');
ok(r6 && !r6.id && R.placed.indexOf(r6) < 0 && solids.indexOf('dry') >= 0 && drawnAfterDry === 3, 'dry: recorded, collided, not placed, not drawn');
ok(r7.id === 'furn_00004' && drawn.indexOf(r7.id) < 0, 'onRecord returning false places nothing more');
ok(r8.id === 'furn_00005' && made && made[0] === r8 && r8.room === 'b2.room.0', 'listOf makes the list only when a record lands; room from o');
ok(house.furniture.length === 2 && house.furniture[0] === r1, 'records land on the building list');
ok(r2.job === 'smithing' && r1.job === null, 'job from the catalog entry');
ok(R.summary().placed === 5 && R.summary().byKey.bench === 3, 'summary counts');
ok(K.SRGB_LIN[0] === 0 && Math.abs(K.SRGB_LIN[255] - 1) < 1e-6 && Math.abs(K.SRGB_LIN[128] - 0.2158605) < 1e-6, 'sRGB byte to linear');

// the digest of the records (field order and values)
const s = JSON.stringify(R.placed);
let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
const DIGEST = '3b341b48';
ok(h.toString(16) === DIGEST, 'records digest ' + h.toString(16) + (h.toString(16) === DIGEST ? '' : ' (expected ' + DIGEST + ')'));

// core/tags: with cfg.tags every placed record is registered there too (core/tags/README.md), and the furniture
// records are what they are without it (the digest above is unchanged)
require('../rand/08-core-rand.js');
const KT = require('../tags/50-core-tags.js'); require('../tags/52-core-tags-vocab.js');
ENTRIES.bench.culture = 'beast-rider'; ENTRIES.bench.tier = 'common'; ENTRIES.bench.name = 'Bench'; ENTRIES.forge.culture = 'yuni-poor';
const T = KT.create({ build: 'test' });
const R2 = K.create({ on: true, catalog, seed: () => 1, tags: T, onRecord: (rec, ctx) => (ctx.deferRooms ? false : undefined) });
const t1 = R2.place('bench', 1, 0, 2, 0.5, { v: 1, room: 'b1.room.0' }, null, { building: 'bld_00003', wealth: 0.8 });
R2.place('forge', 0, 0, 0, 0, {}, null, { building: 'b1' });
R2.place('bench', 0, 0, 0, 0, {}, null, { building: 'b2', dry: true });
R2.place('bench', 0, 0, 0, 0, {}, null, { building: 'b2', deferRooms: true });   // deferred to the interiors
const g1 = T.get(t1.id);
ok(T.records.length === 2 && R2.placed.length === 3 && g1 && g1['class'] === 'furniture' && g1.kind === 'seat' && g1.parent === 'bld_00003', 'tags: placed records registered (a dry run or a deferred piece is not), ids unchanged, kind the entry type');
ok(g1.tags.culture === 'beast-rider' && g1.tags.wealth === 'rich' && g1.tags.room === 'b1.room.0' && g1.size[0] === 1.98, 'tags: culture, wealth named, room, size from the dims');
ok(T.get('furn_00002').tags.culture === 'yuni' && T.get('furn_00002').tags.wealth === 'poor' && T.audit().unknown === 0, 'tags: catalog cultures through the aliases, zero unknowns');
ok(!('uid' in t1) && Object.keys(t1).join() === Object.keys(r1).concat([]).join(), 'tags: the furniture record itself is unchanged');
process.exit(fails ? 1 : 0);
