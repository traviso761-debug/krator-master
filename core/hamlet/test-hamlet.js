// node core/hamlet/test-hamlet.js: core/hamlet's data side. Each check has a negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
fs.readdirSync(__dirname).filter(f => /^\d\d-hamlet-.*\.js$/.test(f)).sort().forEach(f => load('core/hamlet/' + f));
const H = KHAMLET;
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };

// ---- the wood tag: every species' harvest.wood in every biome kit parses into known uses
// The species write it as HV('<wood>', ...) (each kit's 50-*-species.js); read from the source, so a new kit is covered.
function woodTexts() {
  const out = [];
  for (const kit of fs.readdirSync(path.join(ROOT, 'biomes'))) {
    const src = path.join(ROOT, 'biomes', kit, 'src');
    if (!fs.existsSync(src)) continue;
    for (const f of fs.readdirSync(src).filter(f => f.endsWith('.js'))) {
      const t = fs.readFileSync(path.join(src, f), 'utf8');
      const re = /HV\(\s*'((?:[^'\\]|\\.)*)'/g; let m;
      while ((m = re.exec(t))) out.push({ kit, file: f, text: m[1] });
    }
  }
  return out;
}
const W = woodTexts();
const unknown = W.map(w => ({ w, u: H.woodUse(w.text).unknown })).filter(x => x.u.length);
if (process.argv.includes('--list')) unknown.forEach(x => console.log('  unknown  ' + x.w.kit + ': ' + x.u.join(' / ') + '   <= ' + x.w.text));
ok('every biome species\' harvest.wood parses (' + W.length + ' tags in ' + new Set(W.map(w => w.kit)).size + ' kits)',
  W.length > 300 && unknown.length === 0, H.woodUse('timber, moonglass').unknown.length === 1,
  unknown.slice(0, 4).map(x => x.w.kit + ': ' + x.u.join('/')).join('; '));
ok('a timber tree feeds the sawpit, a fuel tree the kiln',
  H.woodWorks('timber, pitch').join() === 'sawpit' && H.woodWorks('fuel, posts').join() === 'kiln' &&
  H.woodWorks('timber, fuel').join() === 'sawpit,kiln', H.woodWorks('thatch').length === 0);
ok('"none" is no wood at all', H.woodPhrases('none').length === 0 && !Object.values(H.woodUse('none').uses).some(Boolean),
  H.woodPhrases('none, timber').length === 1);
ok('a longer phrase is read by its rule, not its first word (boat ribs are timber, light poles are poles)',
  H.woodUse('boat ribs').uses.timber && !H.woodUse('boat ribs').uses.poles && H.woodUse('poles (light, ringed)').uses.poles,
  !H.woodUse('ribs').uses.timber);
ok('a bracketed note is a note, not a use (timber (the hardest) is timber; posts, beams (from fallen limbs) is poles and timber)',
  H.woodUse('timber (the hardest)').unknown.length === 0 && H.woodUse('posts, beams (from fallen limbs)').uses.poles &&
  H.woodUse('posts, beams (from fallen limbs)').uses.timber, H.woodUse('timber (the hardest), moonglass').unknown.length === 1);
const noFell = W.filter(w => H.woodUse(w.text).noFell);
ok('a tree marked not to fell feeds no works (' + noFell.length + ' species: ' + noFell.map(w => w.kit).join(', ') + ')',
  noFell.length >= 3 && noFell.every(w => H.woodWorks(w.text).length === 0) && H.woodWorks('none (protected)').length === 0,
  H.woodWorks('timber (the protected grove)').length === 0 && H.woodWorks('timber (the hardest)').length === 1);
const timberShare = W.filter(w => H.woodUse(w.text).uses.timber).length;
ok('the biomes hold timber to fell (' + timberShare + ' species tags)', timberShare >= 50, W.filter(w => H.woodUse(w.text).uses.timber && w.text === 'none').length === 0);

// ---- the gather tag: the isles kit's table on known zone weights (biomes/ringisles/src/57-biome-ringisles-gather.js)
global.RINGISLES = {};
load('biomes/ringisles/src/57-biome-ringisles-gather.js');
const R = RINGISLES, Z = o => Object.assign({ sav: 0, step: 0, xs: 0, am: 0, af: 0, xa: 0, strand: 0, dune: 0, panEdge: 0, reef: 0, lagoon: 0, mangal: 0, bench: 0, pan: 0 }, o);
const sav = R.gatherOf(Z({ sav: 1 })), forest = R.gatherOf(Z({ xa: .6, af: .4 })), reef = R.gatherOf(Z({ reef: 1 })), pan = R.gatherOf(Z({ pan: .9 }));
ok('the isles: savanna is pasture, closed rainforest is not', sav.pasture > .8 && forest.pasture < .05, R.gatherOf(Z({ am: 1 })).pasture > forest.pasture,
  'savanna ' + sav.pasture.toFixed(2) + ', rainforest ' + forest.pasture.toFixed(2));
ok('the isles: the reef, lagoon and mangal are fishing grounds; dry land is not', reef.fish === 1 && R.gatherOf(Z({ mangal: 1 })).fish > .5 && sav.fish === 0,
  R.gatherOf(Z({ lagoon: 1 })).fish < reef.fish);
ok('the isles: the pan\'s crust gives salt, its rim does not', pan.salt === true && R.gatherOf(Z({ pan: .2, panEdge: 1 })).salt === false,
  R.gatherOf(Z({ pan: .5 })).salt === true);
ok('the isles: the salt steppe and freshly burnt ground graze less', R.gatherOf(Z({ step: 1, xs: 1 })).pasture < R.gatherOf(Z({ step: 1, xs: 0 })).pasture &&
  R.gatherOf(Z({ sav: 1, burn: { black: 1 } })).pasture < sav.pasture * .3, true);
const tags = [sav, forest, reef, pan, R.gatherOf(Z({ sav: 1, reef: 1, lagoon: 1, mangal: 1, step: 1 }))];
ok('every tag the isles give is well formed (weights in 0..1, salt a flag)', tags.every(g => H.gatherCheck(g).length === 0),
  H.gatherCheck({ pasture: 1.4 }).length === 1 && H.gatherCheck({ timber: .5 }).length === 1 && H.gatherCheck({ salt: 1 }).length === 1);
// a field's capacity over a polygon, on a toy kit: pasture west of x=0, a reef east of it
const toy = { gather: (x, z) => x < 0 ? { pasture: 1, fish: 0, salt: false } : { pasture: 0, fish: .5, salt: z > 500 } };
const cap = H.fieldCapacity(toy, [[-1000, 0], [1000, 0], [1000, 1000], [-1000, 1000]], 100);
ok('a field\'s capacity is the tag over its area (1 km2 of pasture, 0.5 of fish, 0.5 of salt)',
  Math.abs(cap.pasture - 1) < 1e-9 && Math.abs(cap.fish - .5) < 1e-9 && Math.abs(cap.salt - .5) < 1e-9,
  H.fieldCapacity(toy, [[-1000, 0], [-500, 0], [-500, 1000], [-1000, 1000]], 100).fish === 0);

// ---- resource fields (kits/resources/src/43r-res-fields.js): the area resources and the rule a works takes from them
load('kits/resources/src/43r-res-fields.js');
const sq = (x, z, s) => [[x, z], [x + s, z], [x + s, z + s], [x, z + s]];
const pans = [{ id: 'p1', kind: 'salt', grade: 'medium', poly: sq(0, 0, 500), cap: .2 }, { id: 'p2', kind: 'salt', grade: 'high', poly: sq(2000, 0, 500), cap: .2 },
  { id: 'g1', kind: 'pasture', grade: 'high', poly: sq(0, 0, 3000), cap: 6 }];
const inPan = resFieldSource({ x: 250, z: 250, works: 'saltworks' }, pans), near = resFieldSource({ x: 700, z: 250, works: 'saltworks' }, pans);
ok('a salt works takes the pan it stands in, else the nearest in reach', inPan && inPan.field === 'p1' && inPan.dist === 0 && near && near.field === 'p1' && Math.abs(near.dist - 200) < 1e-6,
  resFieldSource({ x: 1200, z: 250, works: 'saltworks' }, pans) === null);
ok('a works takes only its own kind (a salt works never grazes, a ranch never rakes salt)', resFieldSource({ x: 250, z: 250, works: 'ranch' }, pans).field === 'g1',
  resFieldSource({ x: 250, z: 250, works: 'saltworks' }, pans.filter(f => f.kind === 'pasture')) === null);
ok('the grade sets the yield (x0.5, x1, x2) and the mean weight sets the grade', resFieldSource({ x: 2250, z: 250, works: 'saltworks' }, pans).efficiency === 2 &&
  resFieldGrade(.8) === 'high' && resFieldGrade(.5) === 'medium' && resFieldGrade(.1) === 'low', resFieldGrade(.34) !== 'medium');
ok('a field\'s capacity caps its workers (0.2 km2 of pan keeps 8, 6 km2 of pasture 24)', resFieldWorkers(pans[0]) === 8 && resFieldWorkers(pans[2]) === 24,
  resFieldWorkers({ kind: 'nonesuch', cap: 9 }) === 0);
ok('a placed building is a field works by its key (ie-saltworks, ie-fishdock)', resFieldWorksOf({ key: 'ie-saltworks' }) === 'saltworks' && resFieldWorksOf({ key: 'ie-fishdock' }) === 'fishery',
  resFieldWorksOf({ key: 'ie-temple' }) === null);
ok('every field kind reads a known gather key (farmland none: the crops kit says)', Object.values(RES_FIELD.kinds).every(k => k.gather === null || H.GATHER_KEYS[k.gather]),
  !H.GATHER_KEYS.timber);

// ---- the village generator (30-hamlet-village.js) on the Islanders' own boxes (read from kits/islanders/src, as the
// isle demo's build.py reads them for its city plan)
load('core/space/20-core-space.js');
load('core/city/33-city-strategies.js');
const DIMS = {};
for (const f of fs.readdirSync(path.join(ROOT, 'kits', 'islanders', 'src')).filter(f => f.endsWith('.js'))) {
  const s = fs.readFileSync(path.join(ROOT, 'kits', 'islanders', 'src', f), 'utf8'), re = /defBuilding\(\{\s*key\s*:\s*'([^']+)'([\s\S]*?)\bbuild\s*[:(]/g; let m;
  const num = (b, n) => { const q = new RegExp('\\b' + n + '\\s*:\\s*([\\d.]+)').exec(b); return q ? +q[1] : null; };
  while ((m = re.exec(s))) if (num(m[2], 'w')) DIMS[m[1]] = { w: num(m[2], 'w'), d: num(m[2], 'd'), h: num(m[2], 'h') || 8 };
}
const dims = k => DIMS[k] || null;
const spec = (focus, o) => Object.assign({ id: 'test-' + focus, world: 7, culture: 'islander_east', focus, site: { x: 0, z: 0 }, link: { x: 500, z: 80 },
  resource: { x: -180, z: 60 }, dims }, o || {});
const V = {}; H.FOCI.forEach(f => { V[f] = H.village(spec(f)); });
const row = H.CULTURES.islander_east;
const roles = v => v.records.reduce((a, r) => (a[r.role] = (a[r.role] || 0) + 1, a), {});
ok('every focus makes a village with no error (' + H.FOCI.map(f => f + ' ' + V[f].records.length).join(', ') + ')', H.FOCI.every(f => !V[f].error),
  !!H.village(spec('salt', { culture: 'nonesuch' })).error, H.FOCI.filter(f => V[f].error).map(f => f + ': ' + V[f].error).join('; '));
ok('each has one religious and one civic building, a general and a food store, a warehouse and its works',
  H.FOCI.every(f => { const R = roles(V[f]); return R.religious === 1 && R.civic === 1 && R.general === 1 && R.food === 1 && R.warehouse >= 1 && R.works >= 1; }),
  (() => { const R = roles(Object.assign({}, V.salt, { records: V.salt.records.filter(r => r.role !== 'food') })); return R.food !== 1; })());
const staffed = v => { const C = v.census, hh = v.records.filter(r => r.role === 'house').reduce((a, r) => a + r.households, 0);
  const wj = v.records.filter(r => r.role === 'works').reduce((a, r) => a + (row.works[v.focus].find(w => w.key === r.key) || { jobs: 0 }).jobs, 0);
  return C.pop <= 500 && hh * row.household >= C.pop && wj >= C.focusJobs && C.workers <= Math.ceil(C.pop * row.workShare) + 1; };
ok('at most 500 people, every one housed, every focus job a place in the works (' + H.FOCI.map(f => f + ' ' + V[f].census.pop).join(', ') + ')',
  H.FOCI.every(f => staffed(V[f])), !staffed(Object.assign({}, V.salt, { records: V.salt.records.filter(r => r.role !== 'house' || r.head) })));
const big = H.village(spec('ranch', { resource: { x: -180, z: 60, workers: 900 }, popMax: 800 }));
ok('a resource bigger than 500 people can work caps the village at 500 (and says so)', big.census.pop === 500 && big.census.capped && !big.error,
  H.village(spec('ranch', { resource: { x: -180, z: 60, workers: 40 } })).census.capped === false, big.error);
const overlaps = v => { const R = v.records.map(r => H.rect(r.x, r.z, Math.cos(r.ry), -Math.sin(r.ry), r.w, r.d)), bad = [];
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) if (H.overlap(R[i], R[j], 0)) bad.push(v.records[i].id + ' x ' + v.records[j].id);
  return bad; };
const ov = H.FOCI.map(f => overlaps(V[f])).flat();
ok('no two buildings overlap, in any village', ov.length === 0, H.overlap(H.rect(0, 0, 1, 0, 10, 10), H.rect(6, 3, 0.8, 0.6, 10, 4), 0), ov.slice(0, 3).join('; '));
const onLane = v => v.records.filter(r => v.lanes.some(l => { const [a, b] = l.pts, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ax = (b[0] - a[0]) / L, az = (b[1] - a[1]) / L;
  return H.overlap(H.rect(r.x, r.z, Math.cos(r.ry), -Math.sin(r.ry), r.w, r.d), H.rect((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, -az, ax, l.w, L), -0.01); }));
ok('nothing stands on a lane', H.FOCI.every(f => onLane(V[f]).length === 0), onLane({ records: [{ x: 0, z: 0, ry: 0, w: 4, d: 4 }], lanes: [{ w: 6, pts: [[-20, 0], [20, 0]] }] }).length === 1);
ok('the works stand within their reach of the village point (a mine within its node\'s 400 m)',
  H.FOCI.every(f => V[f].records.filter(r => r.role === 'works').every(r => Math.hypot(r.x - V[f].site.x, r.z - V[f].site.z) <= row.reach[f] + 1)),
  Math.hypot(1000, 0) > row.reach.mine);
ok('the same spec gives the same village; another world seed another', H.hashOf(H.village(spec('lumber'))) === H.hashOf(V.lumber),
  H.hashOf(H.village(spec('lumber', { world: 8 }))) !== H.hashOf(V.lumber));
const cliff = H.village(spec('mine', { ground: { ok: () => false } }));
const shelf = H.village(spec('mine', { resource: { x: 420, z: 40 }, ground: { ok: (x, z) => Math.hypot(x - 320, z) < 260 } }));
ok('no dry flat ground in reach: refused; dry ground 320 m off: the village moves there', !!cliff.error && /dry flat/.test(cliff.error) && !shelf.error && Math.hypot(shelf.site.x - 320, shelf.site.z) < 240,
  !H.village(spec('mine')).error, shelf.error || '');
ok('a key the host has no box for is placed as its declared box and marked pending (the ranch\'s Beast Rider rookery); the Islanders\' own sawpit is not',
  V.ranch.records.some(r => r.key === 'br_bldg_rookery_tower' && r.pending) && V.lumber.records.some(r => r.key === 'ie-sawpit' && !r.pending) && V.salt.records.every(r => !r.pending), V.ranch.records.some(r => r.key === 'ie-byre' && !r.pending));

// ---- felling on the world clock (40-hamlet-felling.js): a pure function of the world day
{
  const S = H.fellSchedule(1000, 100);        /* 100 workers at 0.1 trees a day: 10 a day, the order round in 100 days, under a year */
  ok('the cutters wait for the stand to grow back: the cycle is never under the regrowth (' + S.cycle + ' days)', S.cycle === 385 && S.rate === 10,
    H.fellSchedule(10000, 10).cycle === 10000);
  const at = d => { const c = { gone: 0, young: 0, standing: 0 }; for (let k = 0; k < S.n; k++) { const s = H.fellState(S, k, d); c[s || 'standing']++; } return c; };
  const a = at(0);
  ok('a world opens on a stand in its steady state (stumps, saplings and grown trees at day 0)', a.gone > 0 && a.young > 0 && a.standing > 0,
    H.fellState(S, -1, 0) === null && H.fellState(S, S.n, 0) === null, JSON.stringify(a));
  const t0 = S.start + 5 / S.rate + S.cycle;
  ok('a felled tree is a stump, then a sapling, then whole again a year after it fell',
    H.fellState(S, 5, t0 + 1) === 'gone' && H.fellState(S, 5, t0 + 100) === 'young' && H.fellState(S, 5, t0 + S.regrowDays + 1) === null,
    H.fellState(S, 5, t0 - 1) !== 'gone');
  ok('the same day gives the same stand', JSON.stringify(at(200.5)) === JSON.stringify(at(200.5)), JSON.stringify(at(200.5)) !== JSON.stringify(at(20.5)));
  const order = H.standOrder([{ id: 'b', x: 10, z: 0 }, { id: 'a', x: 10, z: 0 }, { id: 'c', x: 2, z: 0 }], [0, 0]).map(t => t.id).join('');
  ok('the felling order is nearest the works first, ties by the tree\'s own id (never by what loaded first)', order === 'cab', order !== 'cba');
}

console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
