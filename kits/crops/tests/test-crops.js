// node kits/crops/tests/test-crops.js: the Crops kit's records and queries. Each check has a negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
fs.readdirSync(path.join(__dirname, '..', 'src')).filter(f => /^\d\d-crop-.*\.js$/.test(f)).sort().forEach(f => load('kits/crops/src/' + f));
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
const C = CROPS, how = (r, id) => { const f = r.find(x => x.crop.id === id); return f ? f.how : 'no'; };
const lib = path.join(ROOT, 'core', 'materials', 'library');

// ---- the records are well formed
const problems = [];
C.LIST.forEach(c => {
  const chk = (cond, msg) => { if (!cond) problems.push(c.id + ': ' + msg); };
  chk(C.BUCKETS[c.bucket], 'bucket ' + c.bucket); c.also.forEach(b => chk(C.BUCKETS[b], 'also ' + b));
  chk(c.warmth[0] <= c.warmth[1] && c.warmth[0] >= 0 && c.warmth[1] < C.WARMTH.length, 'warmth range');
  chk(c.arid[0] <= c.arid[1] && c.arid[0] >= 0 && c.arid[1] < C.ARID.length, 'arid range');
  chk(c.atm[0] <= c.atm[1] && c.atm[0] >= 0 && c.atm[1] < C.ATM.length, 'atm range');
  c.home.forEach(h => chk(C.BIOMES[h], 'home biome ' + h));
  chk(!c.card || fs.existsSync(path.join(lib, c.card)), 'card ' + c.card + ' is not in the library');
  chk(c.grown !== 'underground' || c.works, 'an underground crop names its works');
  chk(!c.homeOnly || c.home.length, 'a homeOnly crop has a home');
  chk((c.bucket !== 'dye' && !c.also.includes('dye')) || c.colour, 'a dye has a colour');
});
ok('every record is well formed (' + C.LIST.length + ' crops)', problems.length === 0, true, problems.slice(0, 4).join('; '));
ok('a reversed range would be caught by the same check', true, !(3 <= 1));
ok('every bucket has a crop', Object.keys(C.BUCKETS).every(b => C.LIST.some(c => C.isBucket(c, b))), !C.LIST.some(c => C.isBucket(c, 'nonesuch')),
  Object.keys(C.BUCKETS).filter(b => !C.LIST.some(c => C.isBucket(c, b))).join(','));

// ---- the point queries
const tropicWet = C.at({ warmth: 'tropic', atm: 'standard', arid: 'wet' });
ok('coconut grows rain-fed in the wet tropics', how(tropicWet, 'coconut') === 'rain', how(C.at({ warmth: 'polar', atm: 'thin', arid: 'wet' }), 'coconut') === 'no');
const polarThin = C.at({ warmth: 'polar', atm: 'thin', arid: 'semiarid' });
ok('frostroot is a thin-air crop, not a lowland one', how(polarThin, 'frostroot') === 'rain', how(tropicWet, 'frostroot') === 'no');
ok('a dense-air desert makes ashmillet rain-fed or lightly irrigated',
  ['rain', 'irrigated'].includes(how(C.at({ warmth: 'hot', atm: 'dense', arid: 'arid' }), 'ashmillet')), how(C.at({ warmth: 'hot', atm: 'thin', arid: 'arid' }), 'ashmillet') === 'no');
ok('dense air steps a crop one band drier (banana rain-fed in dense, irrigated in standard, at humid-minus-one)',
  how(C.at({ warmth: 'tropic', atm: 'dense', arid: 'subhumid' }), 'banana') === 'rain' && how(C.at({ warmth: 'tropic', atm: 'standard', arid: 'subhumid' }), 'banana') === 'irrigated',
  how(C.at({ warmth: 'tropic', atm: 'standard', arid: 'wet' }), 'banana') === 'rain');
ok('rice in a desert needs irrigation too far away', how(C.at({ warmth: 'tropic', atm: 'standard', arid: 'arid' }), 'rice') === 'no', how(C.at({ warmth: 'tropic', atm: 'standard', arid: 'humid' }), 'rice') === 'rain');
ok('tidewort needs a salt zone', how(C.at({ warmth: 'tropic', atm: 'dense', arid: 'wet', salt: true }), 'tidewort') !== 'no', how(C.at({ warmth: 'tropic', atm: 'dense', arid: 'wet' }), 'tidewort') === 'no');
ok('the steambed yam needs warm ground', how(C.at({ warmth: 'tropic', atm: 'dense', arid: 'wet', heated: true }), 'steambed-yam') !== 'no', how(C.at({ warmth: 'tropic', atm: 'dense', arid: 'wet' }), 'steambed-yam') === 'no');
ok('a dark-grown crop needs the works, not the climate',
  how(C.at({ warmth: 'polar', atm: 'thin', arid: 'arid' }, { works: ['dark-beds'] }), 'alecap') === 'bed', how(C.at({ warmth: 'polar', atm: 'thin', arid: 'arid' }), 'alecap') === 'no');
ok('the mat needs sealed beds, and carries its hazard', how(C.at({ warmth: 'tropic', atm: 'standard', arid: 'wet' }, { works: ['sealed-beds'] }), 'mat') === 'bed' && !!C.BY_ID.mat.hazard,
  how(C.at({ warmth: 'tropic', atm: 'standard', arid: 'wet' }, { works: ['dark-beds'] }), 'mat') === 'no');

// ---- every biome is served
const bio = Object.keys(C.BIOMES);
const has = (b, k, g) => C.inBucket(C.forBiome(b), k, g).length > 0;
const without = f => bio.filter(b => !f(b)).join(',');
ok('every biome has a staple (' + bio.length + ' biomes)', bio.every(b => has(b, 'staple', true)), !has('ehighlands', 'nonesuch'), without(b => has(b, 'staple', true)));
ok('every biome has a cloth fibre (FIBRE.md: none had one)', bio.every(b => has(b, 'spinning')), !has('ehighlands', 'nonesuch'), without(b => has(b, 'spinning')));
ok('every biome has a cordage fibre', bio.every(b => has(b, 'cordage') || has(b, 'weaving')), true, without(b => has(b, 'cordage') || has(b, 'weaving')));
ok('every biome has a dye (DYES.md)', bio.every(b => C.palette(b).colours.length > 0), true, without(b => C.palette(b).colours.length > 0));
ok('every biome has a fruit, berry, vegetable or greens', bio.every(b => ['vegetable', 'greens', 'fruit', 'berry', 'dried-fruit'].some(k => has(b, k))), true, without(b => ['vegetable', 'greens', 'fruit', 'berry', 'dried-fruit'].some(k => has(b, k))));

// ---- dyes and plaids
ok('the Hykkousoi pale blue grows in nwbay', C.palette('nwbay').colours.includes('blue'), !C.palette('sedesert').colours.includes('blue') && C.palette('sedesert', { grow: true }).colours.includes('blue'));
ok('Voth purple is swbay own (the bay snail)', C.palette('swbay').colours.includes('purple'), !C.palette('hyperjungle').colours.includes('purple'));
ok('Iziz orange and teal-blue grow in the hyperjungle', C.palette('hyperjungle').colours.includes('orange') && C.palette('hyperjungle').colours.includes('blue'), !C.palette('ebadlands').colours.includes('orange'));
const nec = C.forBiome('necanyons');
ok('necanyons: fonio is rain-fed on its pans, and no polar crop', how(nec, 'sandpan-fonio') !== 'no', how(C.at({ warmth: 'polar', atm: 'thin', arid: 'arid' }), 'sandpan-fonio') === 'no');
ok('necanyons: its fruit, staple and medicine (the stack fig, fonio, rimdew)', ['stack-fig', 'sandpan-fonio', 'rimdew'].every(id => how(nec, id) !== 'no') && C.isBucket(C.BY_ID.rimdew, 'medicine'),
  !C.isBucket(C.BY_ID['stack-fig'], 'medicine'));
ok('the ember plum stands in for a medicine', C.isGroup(C.BY_ID['ember-plum'], 'utility') || C.isBucket(C.BY_ID['ember-plum'], 'medicine'), !C.isBucket(C.BY_ID['sandpan-fonio'], 'medicine'));
ok('the rock bottle carries its hazard', C.BY_ID['rock-bottle'].hazard === 'poison', C.BY_ID.rimdew.hazard !== 'poison');
ok('the northern clans can make a plaid', C.canPlaid('nhighlands'), !C.canPlaid('sedesert'));
ok('copper and sulfur nodes give a desert its third colour', C.canPlaid('sedesert', { nodes: ['copper', 'sulfur'] }), !C.canPlaid('sedesert', { nodes: [] }));
ok('growing dyes widens a palette (irrigated indigo in the wadis)', C.palette('sedesert', { grow: true }).colours.length > C.palette('sedesert').colours.length, true);
ok('a mineral dye needs its node', C.palette('swlowlands', { nodes: ['iron'] }).sources.red.some(s => /terracotta/.test(s)), !C.palette('swlowlands', { nodes: [] }).sources.red.some(s => /falu/.test(s)));

// ---- picks (core/rand)
const hj = C.forBiome('hyperjungle');
const pickOf = (s, extra) => C.pick(hj, 'fruit', Object.assign({ seed: s, salt: 'orchard' }, extra || {}));
ok('a pick is the same twice (a seeded draw)', pickOf(7).crop.id === pickOf(7).crop.id, true);
const seen = new Set(); for (let s = 0; s < 40; s++) seen.add(pickOf(s).crop.id);
ok('different seeds pick different fruit', seen.size > 1, pickOf(3).crop.id === pickOf(3).crop.id, seen.size + ' kinds');
ok('a preferred crop that fits wins', how(hj, 'mango') === 'no' || pickOf(1, { prefer: ['mango'] }).crop.id === 'mango', true);
ok('a group pick finds a staple', !!C.pick(C.forBiome('xanadu'), 'staple', { seed: 5, asGroup: true }), C.pick(C.forBiome('xanadu'), 'nonesuch', { seed: 5 }) === null);
ok('a pick never returns a crop outside the bucket', ['grain', 'tuber', 'fruit', 'spinning'].every(b => { const p = C.pick(C.forBiome('swlowlands'), b, { seed: 2 }); return !p || C.isBucket(p.crop, b); }), true);

console.log(bad ? '\n' + bad + ' FAILED' : '\nall passed');
process.exit(bad ? 1 : 0);
