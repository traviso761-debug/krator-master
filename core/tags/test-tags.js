// core/tags' node test: a fixed list of adds, children and removals gives the same ids, uids and export, every time.
//   node core/tags/test-tags.js        exits 0 and prints 'all passed' when every check passes
// DIGEST is the export's fingerprint and UID one record's position hash: Godot reproduces the uid (README.md,
// "The uid"), so a change to either means every export and every saved reference moves. Change them only on purpose.
'use strict';
const fs = require('fs'), path = require('path');
require('../rand/08-core-rand.js');
const K = require('./50-core-tags.js');
require('./52-core-tags-vocab.js');
require('./53-core-tags-host.js');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const throws = f => { try { f(); return false; } catch (e) { return true; } };
const V = K.VOCAB;

// ---- the vocabulary still matches its source (kits/catalog/krator-furniture-core.js) ----
const CAT = path.join(__dirname, '..', '..', 'kits', 'catalog');
const core = fs.readFileSync(path.join(CAT, 'krator-furniture-core.js'), 'utf8');
const lit = name => { const m = new RegExp('const ' + name + ' = ([\\[{][\\s\\S]*?[\\]}]);').exec(core); return m ? Function('return ' + m[1])() : null; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
ok(same(V.catalog.cultures, lit('FURN_CULTURES')), 'cultures: the copy matches FURN_CULTURES');
ok(same(V.catalog.types, lit('BUILDING_TYPES')), 'types: the copy matches BUILDING_TYPES');
ok(same(V.catalog.tiers, lit('FURN_TIERS')), 'tiers: the copy matches FURN_TIERS');
ok(same(V.catalog.jobs, lit('FURN_JOBS')), 'jobs: the copy matches FURN_JOBS');
ok(same(V.catalog.settings, lit('FURN_SETTINGS')), 'settings: the copy matches FURN_SETTINGS');
ok(!same(V.catalog.jobs.concat(['juggling']), lit('FURN_JOBS')), 'negative: a list with an extra value does not match');
// display names: FURN_CULTURE_INFO in the core file, and FURN_CULTURE(key, { name }) in each culture file
const srcNames = {};
for (const m of core.matchAll(/'([a-z-]+)': \{ name: '([^']+)'/g)) srcNames[m[1]] = m[2];
for (const f of fs.readdirSync(CAT).filter(f => /^krator-master-furniture-.*\.js$/.test(f)))
  for (const m of fs.readFileSync(path.join(CAT, f), 'utf8').matchAll(/FURN_CULTURE\('([a-z-]+)', \{ name: '([^']+)'/g)) srcNames[m[1]] = m[2];
const nameBad = V.cultures.filter(c => V.noCatalog.indexOf(c) < 0 && V.cultureNames[c] !== srcNames[c === 'yuni' ? 'yuni-common' : c]);
ok(V.cultures.length === 23 && !nameBad.length, '23 cultures, display names from FURN_CULTURE_INFO' + (nameBad.length ? ' (differ: ' + nameBad + ')' : ''));
const covered = new Set(V.catalog.cultures.map(c => V.cultureAlias[c] ? V.cultureAlias[c].culture : c).filter(c => c));
ok(covered.size + V.noCatalog.length === V.cultures.length && V.cultures.every(c => covered.has(c) !== (V.noCatalog.indexOf(c) >= 0)), 'every catalog culture is a culture or an alias of one, and the only others are the listed noCatalog cultures (Jimjam, Dalab)');
ok(V.noCatalog.every(c => V.cultures.indexOf(c) >= 0 && V.catalog.cultures.indexOf(c) < 0), 'noCatalog cultures are vocabulary cultures and not catalog ones');
ok(!V.catalog.cultures.concat(['elves']).every(c => V.cultureAlias[c] || V.cultures.indexOf(c) >= 0), 'negative: a catalog culture with no culture or alias is caught');

// ---- the checks, each with its negative ----
const P = t => K.norm(t).problems.map(p => p.key + (('value' in p) ? ':' + p.value : '')).join(' ');
ok(P({ culture: 'voth' }) === '' && P({ culture: 'vothh' }) === 'culture:vothh', 'culture: known passes, unknown is a problem');
ok(P({ types: ['shop', 'park'] }) === '' && P({ types: ['shop', 'castle'] }) === 'types:castle', 'types: each checked');
ok(P({ wealth: 'rich' }) === '' && P({ wealth: 'opulent' }) === 'wealth:opulent', 'wealth: three names');
ok(P({ state: 'ruined' }) === '' && P({ state: 'haunted' }) === 'state:haunted', 'state');
ok(P({ job: 'smithing' }) === '' && P({ job: 'juggling' }) === 'job:juggling', 'job');
ok(P({ koppen: 'Af' }) === '' && P({ koppen: 'Zz' }) === 'koppen:Zz', 'koppen');
ok(P({ setting: 'room' }) === '' && P({ setting: 'attic' }) === 'setting:attic', 'setting');
ok(P({ lit: true }) === '' && P({ lit: 'yes' }) === 'lit:yes', 'lit is a boolean');
ok(P({ harvest: { wood: true } }) === '' && P({ harvest: 'wood' }) === 'harvest:wood', 'harvest is an object');
ok(P({ style: 'anything' }) === '' && P({ colour: 'red' }) === 'colour', 'a free key takes any value; an unknown key is a problem');
ok(P({ door: 'plank', light: 'brazier' }) === '' && P({ door: 'bead' }) === 'door:bead', 'fixture vocabularies');
// the input mapping
const N = t => K.norm(t).tags;
ok(same(N({ culture: 'yuni-court' }), { culture: 'yuni', wealth: 'rich' }), 'yuni-court is yuni, rich');
ok(same(N({ culture: 'yuni-poor', wealth: 0.5 }), { culture: 'yuni', wealth: 'middle' }), 'a given wealth wins over the alias');
ok(same(N({ culture: 'yuni-court', wealth: null }), { culture: 'yuni', wealth: null }), 'a given null wealth (a civic building) wins too');
ok(same(N({ culture: 'sahelian' }), { culture: 'yuni', style: 'sahelian' }), 'sahelian is yuni with style sahelian');
ok(same(N({ culture: 'iziz-old' }), { culture: 'iziz' }), 'iziz-old is iziz, no era tag');
ok(same(N({ culture: 'ancients-salvage' }), { culture: 'ancient', state: 'salvage' }), 'ancients-salvage is ancient, state salvage');
ok(same(N({ culture: 'scrap' }), { culture: null, set: 'scrap' }), 'scrap is a set, not a culture');
ok(N({ wealth: 0.2 }).wealth === 'poor' && N({ wealth: 0.35 }).wealth === 'middle' && N({ wealth: 0.69 }).wealth === 'middle' &&
   N({ wealth: 0.7 }).wealth === 'rich', 'wealth 0..1: < .35 poor, < .7 middle, else rich');
ok(N({ wealth: 'civic' }).wealth === null && N({ wealth: 'court' }).wealth === 'rich', 'civic is no wealth; court is rich');
ok(same(N({ types: 'shop' }).types, ['shop']), 'a single type becomes a list');
// Iziz's REG spellings (2026-10-05)
ok(same(N({ type: ['market/shop', 'shop', 'single-family dwelling'], place: 'outdoor' }), { types: ['market', 'shop', 'dwelling-single'], setting: 'outdoor' }),
  'type and place are older keys; market/shop is two types, no duplicates');
ok(same(N({ culture: 'ancients-reclaimed', state: 'reclaimed' }), { culture: 'ancient', state: 'reclaimed' }) &&
   same(N({ culture: 'ancients-transplant' }), { culture: 'ancient', style: 'transplant' }) && N({ culture: 'iziz-vernacular' }).style === 'vernacular',
  'the Ancients groups and the Iziz vernacular are cultures with a state or a style');
ok(N({ state: 'destroyed' }).state === 'ruined' && N({ state: 'rehabilitated' }).state === 'rehab' && P({ state: 'reclaimed', landmark: true, role: 'x' }) === '',
  'older state spellings; reclaimed, landmark and role are known');
ok(P({ type: ['castle'] }) === 'types:castle' && P({ landmark: 'yes' }) === 'landmark:yes', 'negative: an aliased key is still checked');

// ---- a fixed run ----
const T = K.create({ build: 'test' });
const gate = T.add({ class: 'building', kind: 'gatehouse', key: 'iziz_gate', name: 'Gatehouse 1', at: [212, 41.5, -96], ry: 1.57,
  size: [12, 9, 14], tags: { culture: 'iziz-old', types: ['military', 'infrastructure'], wealth: null, state: 'intact', lit: true } });
const house = T.add({ class: 'building', key: 'mid_washed_house', x: 3.33333, y: 0, z: -7.5, yaw: 0.5, size: [8, 6, 7],
  tags: { culture: 'yuni-common', types: 'dwelling-single' } });
const kept = T.add({ id: 'bld_00041', class: 'building', key: 'kept', at: [0, 0, 0], size: [2, 2, 2], tags: { culture: 'voth', types: ['shop'] } });
const after = T.add({ class: 'building', key: 'after', at: [50, 0, 50], size: [4, 4, 4], tags: { culture: 'voth', types: ['shop'] } });
const room0 = T.child(house.id, { class: 'part', kind: 'room', at: [3, 0, -7], size: [3, 3, 3] });
const room1 = T.child(house.id, { class: 'part', kind: 'room', at: [5, 0, -8], size: [2, 2, 3] });
const door = T.child(house.id, { class: 'fixture', kind: 'door', at: [3, 0, -4.5], size: [1, 0.1, 2.1], tags: { door: 'plank' } });
const street = T.add({ class: 'fixture', kind: 'light', at: [10, 3, 10], tags: { light: 'brazier', lit: true } });
const win = T.add({ id: 'window_00000', class: 'fixture', kind: 'window', at: [1, 2, 1], size: [1, 0.1, 1.2] });
const bench = T.add({ class: 'furniture', kind: 'seat', key: 'br_bench', name: 'Bench (variant 2)', parent: 'bld_00017',
  at: [1, 0, 1], size: [1.8, 0.5, 0.45], tags: { culture: 'beast-rider', setting: 'outdoor', job: null } });
const tree = T.add({ class: 'flora', key: 'hypertree', name: 'Hypertree', at: [0, 0, 0], tags: { koppen: 'Af', harvest: { wood: true, edible: ['pods'] } } });
const deer = T.add({ class: 'life', kind: 'deer', at: [20, 0, 20], tags: { odd: 1, culture: 'nobody' } });
T.remove(after.id);
const late = T.add({ class: 'building', key: 'late', at: [60, 0, 60], size: [4, 4, 4], tags: { culture: 'yuni', types: ['park'] } });

ok(gate.id === 'bld_00000' && house.id === 'bld_00001', 'order ids: one counter per prefix, from 00000');
ok(kept.id === 'bld_00041' && after.id === 'bld_00042', 'a passed-through id moves its counter past it');
ok(late.id === 'bld_00043' && T.get(after.id).removed === true, 'a removed record keeps its id; ids are never reused');
ok(room0.id === 'bld_00001.room.0' && room1.id === 'bld_00001.room.1' && door.id === 'bld_00001.door.0' && room0.parent === house.id,
  'children: a path under the parent, a counter per kind');
ok(street.id === 'light_00000' && win.id === 'window_00000' && bench.id === 'furn_00000' && tree.id === 'flora_00000' && deer.id === 'life_00000',
  'prefixes per class, a fixture\'s per kind');
ok(K.instanceId(tree.id, 37) === 'flora_00000#37', 'an instance id');
ok(house.ry === 0.5 && house.at[0] === 3.3333, 'yaw is ry on input; numbers to 4 decimals');
ok(throws(() => T.add({ class: 'fauna', kind: 'deer' })) && throws(() => T.add({ class: 'thing' })), 'fauna is not a class; an unknown class throws');
ok(throws(() => T.add({ id: 'bld_00041', class: 'building' })) && throws(() => T.child('bld_99999', { class: 'part' })), 'a duplicate id or an unknown parent throws');
ok(T.query({ class: 'building' }).length === 4 && T.query({ class: 'building', removed: true }).length === 5, 'query by class; removed ones only on request');
ok(T.query({ tags: { culture: 'voth' } }).length === 1 && T.query({ tags: { types: 'park' } })[0] === late, 'query by tags (a list tag matches a member)');
ok(T.query({ parent: house.id }).length === 3 && T.query({ box: [-1, -1, 2, 2] }).length === 4, 'query by parent and by box');
ok(T.at(3, -7) === room0 && T.at(3.3, -8.9) === house && T.at(100, 100) === null, 'at: the smallest record holding the point');
ok(T.at(3, -7, 3.5) === house && T.at(3, -7, 8) === null, 'at with a height');
// a rotated footprint: the gatehouse is 12 wide (local x) and 9 deep (local z), turned ~90 degrees, so 5.5 m along world z is inside
ok(T.at(212, -96 + 5.5) === gate && T.at(212 + 5.5, -96) === null, 'at turns the point into the record\'s frame');

const a = T.audit();
ok(a.records === 12 && a.removed === 1 && a.byClass.building === 4 && a.byClass.fixture === 3, 'audit counts');
ok(a.unknown === 2 && a.unknownKeys.odd === 1 && a.unknownValues['culture:nobody'] === 1, 'audit: unknown keys and values counted, never thrown');
ok(a.missingCulture === 0 && a.missingTypes === 0, 'audit: no building lacks a culture or a type');

// the uid of a fixed record, pinned: Godot's twin (core/tags/ktags.gd) must give the same
const UID = '7bd10f69';   // 2026-10-05: core/tags step 1
ok(gate.uid === K.uid('building', 'iziz_gate', [212, 41.5, -96]), 'uid = KTAGS.uid(class, key, at)');
ok(gate.uid === UID, 'the gatehouse\'s uid ' + gate.uid + (gate.uid === UID ? '' : ' (expected ' + UID + ')'));
ok(K.uid('building', 'iziz_gate', [212.04, 41.5, -96]) === UID && K.uid('building', 'iziz_gate', [212.06, 41.5, -96]) !== UID,
  'uid: the position in 10 cm steps (212.04 rounds with 212, 212.06 does not)');
ok(K.uid('building', null, [0, 0, 0]) === K.uid('building', '', [0, 0, 0]) && K.uid('building', 'a', [0, 0, 0]) !== K.uid('part', 'a', [0, 0, 0]),
  'uid: a null key hashes as \'\'; the class is in it');

// golden.json: uid vectors for Godot (ktags_test.gd). --write rewrites it; otherwise it must match
const VEC = [['building', 'iziz_gate', [212, 41.5, -96]], ['building', null, [0, 0, 0]], ['part', 'a', [0, 0, 0]],
  ['furniture', 'br_bench', [1.04, 0, -1.05]], ['furniture', 'br_bench', [1.05, 0, -1.04]], ['flora', 'hypertree', [-123.456, 7.89, 1000.01]],
  ['life', 'über', [-0.05, -0.04, 0.049]], ['fixture', 'door', [3, 0, -4.5]], ['building', 'mid_washed_house', [3.3333, 0, -7.5]],
  ['landmark', 'Hykkousoi', [52000.25, -310.75, -48000.35]]].map(v => ({ class: v[0], key: v[1], at: v[2], uid: K.uid(v[0], v[1], v[2]) }));
const GOLD = path.join(__dirname, 'golden.json');
if (process.argv.includes('--write')) fs.writeFileSync(GOLD, JSON.stringify({ note: 'core/tags uid vectors: test-tags.js writes them (--write), ktags_test.gd checks them in Godot', uid: VEC }, null, 1) + '\n');
ok(fs.existsSync(GOLD) && same(JSON.parse(fs.readFileSync(GOLD, 'utf8')).uid, VEC), 'golden.json: the uid vectors match (node core/tags/test-tags.js --write after a meant change)');

// the labels of PROPOSAL.md's three examples
const want = {
  gate: 'Gatehouse 1\nbuilding · Iziz · military, infrastructure · intact · lit\n12 × 9 m, 14 m tall · bld_00000',
  bench: 'Bench (variant 2)\nfurniture · Beast Riders · seat · outdoor · in bld_00017\n1.8 × 0.5 m · furn_00000',
  tree: 'Hypertree\nflora · Köppen Af · harvest: wood, pods\nflora_00000#37'
};
ok(K.label(gate) === want.gate, 'label: the gatehouse\n' + K.label(gate));
ok(K.label(bench) === want.bench, 'label: the bench\n' + K.label(bench));
ok(K.label(tree, 37) === want.tree, 'label: a plant instance\n' + K.label(tree, 37));
ok(K.label(Object.assign({}, deer, { note: 'shy' })).split('\n')[3] === 'shy', 'label: a note is appended');

// ---- the flora and fauna vocabulary (the biome kits, 2026-10-12) ----
ok(P({ climate: 'tropic', aridity: 'humid', abyssal: false, riparian: 'both', diet: 'fish' }) === '' &&
  P({ climate: 'balmy' }) === 'climate:balmy', 'climate: a band name passes, an unknown one is a problem');
ok(P({ climate: 'tropic..cold', aridity: 'arid..humid' }) === '' && P({ climate: 'tropic..balmy' }) === 'climate:tropic..balmy' &&
  P({ wealth: 'poor..rich' }) === 'wealth:poor..rich', 'a range of two bands passes for climate and aridity only');
ok(P({ abyssal: true }) === '' && P({ abyssal: 'yes' }) === 'abyssal:yes', 'abyssal is a boolean');
ok(N({ riparian: 'non' }).riparian === 'no' && N({ riparian: 'riparian' }).riparian === 'yes' && P({ riparian: 'often' }) === 'riparian:often',
  'riparian: yes, no, both (kits/fauna\'s non and riparian map onto them)');
ok(P({ koppen: ['XA', 'XV', 'HF', 'O', 'Cwb'] }) === '' && P({ koppen: ['XQ'] }) === 'koppen:XQ', 'koppen: the scale model\'s own classes');
ok(P({ fire: 'pyrophyte', form: 'cushion', origin: 'native', heat: 'splash', plume: 'vent', spiral: 'whorl' }) === '' && P({ flame: 'x' }) === 'flame',
  'the kits\' own species traits are free keys (fire, form, origin, heat, plume, spiral); a near miss is still unknown');

// ---- item sets (Decisions 5): one record for an item, its instances rows of a table ----
const TS = K.create({ build: 'sets' });
const tb = K.table();
const fern = TS.addSet({ class: 'flora', kind: 'fern', key: 'frond', name: 'Fern', at: [0, 0, 0], tags: { biome: 'hyperjungle', climate: 'hypertropic' } }, tb);
const pts = [[1.04, 0, -1.05], [12.25, 3.5, 7.75], [-300.125, 41.0625, 2.5]];
pts.forEach((p, i) => tb.push(p[0], p[1], p[2], i * 0.5, 1, 1, 2 + i));
ok(fern.id === 'flora_00000' && fern.set === true && TS.count(fern) === 3 && TS.isSet(fern) && !TS.isSet(TS.add({ class: 'flora', key: 'x' })),
  'addSet: one record, set: true, its count read from the table');
const f32 = v => Math.fround(v);
const in1 = TS.instance(fern, 1);
ok(in1.id === 'flora_00000#1' && in1.parent === 'flora_00000' && in1.tags === fern.tags && in1.ry === 0.5 && in1.size.join() === '1,1,3',
  'T.instance builds instance 1: id <set>#1, the set\'s tags (shared), its own ry and size');
ok(in1.at.join() === [f32(12.25), f32(3.5), f32(7.75)].join() && in1.uid === K.uid('flora', 'frond', in1.at),
  'an instance\'s at is its position as the table stores it (float32 here), and uid = KTAGS.uid(class, key, at)');
const all = TS.uids(fern);
ok(all.length === 3 && K.hex(all[2]) === K.uid('flora', 'frond', [f32(-300.125), f32(41.0625), f32(2.5)]) && TS.uidOf(fern, 0) === K.hex(all[0]),
  'T.uids: every instance\'s uid as a Uint32Array, the same as uidOf');
ok(TS.get('flora_00000#2').uid === K.hex(all[2]) && TS.get('flora_00000#3') === null && TS.get('flora_00001#0') === null,
  'T.get finds an instance by its id; past the end, or on a record that is not a set, it is null');
ok(TS.uidOf(fern, 0) !== TS.uidOf(fern, 1) && K.uid('flora', 'frond', [f32(1.04) + 0.1, 0, f32(-1.05)]) !== TS.uidOf(fern, 0),
  'negative: two instances, or one moved 10 cm, have different uids');
ok(throws(() => TS.addSet({ class: 'flora', key: 'y' })) && throws(() => TS.instance('flora_00001', 0)),
  'negative: a set needs a table; an ordinary record is not a set');
// a table that is only a reader (a build's own instance store): n as a getter, pos and nothing else
const store = new Float32Array([5, 0, 5, 6, 0, 6]);
const reader = { get n(){ return store.length / 3; }, pos: (i, o) => { o[0] = store[i * 3]; o[1] = store[i * 3 + 1]; o[2] = store[i * 3 + 2]; return o; } };
const herd = TS.addSet({ class: 'life', kind: 'deer', key: 'deer', at: [0, 0, 0], tags: { biome: 'sedesert', diet: 'browse' } }, reader);
ok(herd.id === 'life_00000' && TS.instance(herd, 1).uid === K.uid('life', 'deer', [6, 0, 6]) && TS.instance(herd, 1).size === undefined && TS.instance(herd, 0).ry === 0,
  'a reader table: n as a getter and pos alone (no ry or size: 0 and none)');
store[3] = 60;
ok(TS.instance(herd, 1).uid === K.uid('life', 'deer', [60, 0, 6]), 'the table is read, not copied: a moved instance answers where it is now');
const au = TS.audit();
ok(au.sets === 2 && au.instances === 5 && au.instancesByClass.flora === 3 && au.instancesByClass.life === 2 && au.records === 3 && au.unknown === 0,
  'audit: sets and instances by class (' + JSON.stringify(au.instancesByClass) + ')');
ok(T.audit().sets === undefined && T.audit().instances === undefined, 'audit: a registry with no sets keeps its old shape');
const exs = TS.export(), exi = TS.export({ instances: true });
ok(exs.records[0].count === 3 && exs.records[0].table === undefined && exi.records[0].table.uid.length === 3 &&
  exi.records[0].table.uid[1] === in1.uid && exi.records[0].table.at.length === 9 && exi.records[0].table.size.length === 9 &&
  exi.records[1].table === undefined && exs.records[0] === fern && exi.records[0] !== fern,
  'export: a set carries its count; with {instances: true} its table as plain arrays, on a copy');

// the export, and its digest
const ex = T.export();
ok(ex.format === 'krator-tags' && ex.version === 1 && ex.build === 'test' && ex.records.length === 13 && ex.vocab.cultures.length === 23, 'export shape');
const s = JSON.stringify(ex);
let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
const DIGEST = 'ec80484b';   // 2026-10-20: the Jimjam and Dalab cultures (23; VOCAB.noCatalog); before it 803f4891, 2026-10-12: the biome kits (stage 2c): the flora and fauna keys (climate, aridity, abyssal, riparian, diet, the kits' traits) and the Köppen classes XA XV HF O Cwa Cwb; before it, 1aa3363 (2026-10-08: the Zeijani branch merged (the Zeijani culture, their jobs, rock/level/district keys and light kinds: 617a177c on the branch); main's before it: ad3297ba, the jobs took 'alchemy' (main's FURN_JOBS); before it, the Ash Nomads: e17a6622 (the Scyvoi culture: 2670333f; step 4, Iziz's aliases: b93dacd3; step 1: 4d836bbd))
ok(h.toString(16) === DIGEST, 'export digest ' + h.toString(16) + (h.toString(16) === DIGEST ? '' : ' (expected ' + DIGEST + ')'));
console.log(fails ? fails + ' failed' : 'all passed');
process.exit(fails ? 1 : 0);
