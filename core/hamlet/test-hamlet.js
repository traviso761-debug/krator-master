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
    const files = fs.readdirSync(src).filter(f => f.endsWith('.js')), texts = files.map(f => fs.readFileSync(path.join(src, f), 'utf8'));
    /* a kit whose HV's first argument is not the wood tag (Firebliss: HV(use, food, med, note) for its rocks and minerals) has no harvest.wood to read */
    const def = texts.map(t => /\bHV\s*=\s*\(\s*(\w+)/.exec(t)).find(Boolean);
    if (def && def[1] !== 'wood') continue;
    texts.forEach((t, i) => { const f = files[i];
      const re = /HV\(\s*'((?:[^'\\]|\\.)*)'/g; let m;
      while ((m = re.exec(t))) out.push({ kit, file: f, text: m[1] });
    });
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

// ---- a mine with no resource takes the nearest node of kits/resources' field (KRES.near), loaded only from here on
{
  load('kits/resources/src/42r-res-ore.js'); load('kits/resources/src/45r-res-field.js');
  const KR = KRES.load(JSON.parse(fs.readFileSync(path.join(ROOT, 'kits', 'resources', 'data', 'geology.json'), 'utf8'))), PM = KR.data().grid.px_m;
  const sh = KR.data().grid.fullW === 1549 ? [0, 0] : [272, 330];   /* the eastern uplands' tile, in 4.23 px, on either canvas */
  const node = KR.nodesIn({ x0: (1100 + sh[0]) * PM, z0: (660 + sh[1]) * PM, x1: (1160 + sh[0]) * PM, z1: (720 + sh[1]) * PM }).find(n => RES_ORE.kinds[n.kind].works === 'mine');
  const at = { x: node.x + 150, z: node.z }, near = KR.near(at.x, at.z, node.kind, row.reach.mine)[0];
  const free = o => H.village(spec('mine', Object.assign({ resource: null, site: at, link: { x: at.x - 500, z: at.z + 200 } }, o)));   /* the default works lane runs away from the node */
  const m = free({ ore: node.kind }), any = free(), none = free({ kres: { near: () => [] } });
  const mineAt = v => v.records.filter(r => r.role === 'works').map(r => Math.hypot(r.x - near.x, r.z - near.z));
  ok('a mine with no resource takes the nearest node in its reach (KRES.near; ' + (m.resource ? m.resource.node + ', ' + m.resource.grade : 'none') + '), its works toward it',
    !m.error && m.resource && m.resource.node === near.id && any.resource && Math.hypot(any.resource.x - at.x, any.resource.z - at.z) <= near.dist + 1e-9 &&
    mineAt(m).length > 0 && Math.min(...mineAt(m)) < Math.min(...mineAt(none)),
    !none.resource && !none.error && !H.village(spec('mine')).resource, m.error || '');
}

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


// ---- the farmland (14-hamlet-farmland.js): the land estimate, the parcels in crop and fallow round a farming village
{
  const need = H.farmNeed(8135);
  ok('8,135 people need about 610 ha in crop, 2,440 farmed with the fallow, some 814 hands (settlements/isle-demo PLAN.md section 11)',
    Math.abs(need.inCrop - 610.1) < 0.2 && Math.abs(need.farmed - 2440.5) < 0.2 && need.hands === 814,
    H.farmNeed(8135, { perPerson: 0.5 }).inCrop > 4000 && H.farmNeed(8135, { fallow: 0 }).farmed < need.farmed, JSON.stringify(need));
  const crops = [{ crop: 'taro', kind: 'field', w: 2 }, { crop: 'rice', kind: 'field', w: 3, maxSlope: 0.06 }, { crop: 'banana', kind: 'orchard', w: 1 }];
  const toy = { ok: (x, z) => x > -500, h: (x, z) => 50 + (z > 800 ? (z - 800) * 0.3 : 0), slope: (x, z) => z > 800 ? 0.1 : 0.02 };
  const avoid = (x, z, r) => Math.hypot(x - 100, z - 100) < 150 + r;
  const Fm = H.farmland({ id: 'test-farm', world: 7, centre: { x: 100, z: 100 }, hands: 140, crops, ground: toy, avoid });
  const ha = Fm.parcel * Fm.parcel / 1e4, share = Fm.inCropHa / Fm.farmedHa;
  ok('140 hands get their 105 ha in crop (to a parcel), a quarter of the farmed land with three fallow years (' + Fm.parcels.length + ' parcels, ' + Fm.inCropHa + ' ha in crop of ' + Fm.farmedHa + ')',
    !Fm.capped && Fm.inCropHa >= 105 && Fm.inCropHa < 105 + ha + 1e-9 && Math.abs(share - 0.25) < 0.05,
    H.farmland({ id: 'test-farm', world: 7, centre: { x: 100, z: 100 }, hands: 140, crops, ground: toy, avoid, rMax: 600 }).capped === true, Fm.target + ' ha wanted');
  const bad = Fm.parcels.filter(p => p.x <= -500 || Math.hypot(p.x - 100, p.z - 100) < 150 || (p.crop === 'rice' && p.z > 800));
  ok('no parcel on refused ground, on the village itself, or of a crop its slope refuses (rice on the steep north)', bad.length === 0 && Fm.parcels.some(p => p.z > 800) && Fm.parcels.some(p => p.crop === 'rice'),
    H.farmland({ id: 'test-farm', world: 7, centre: { x: 100, z: 100 }, hands: 140, crops, ground: { ok: toy.ok } }).parcels.some(p => Math.hypot(p.x - 100, p.z - 100) < 150), bad.slice(0, 3).map(p => p.id).join(', '));
  const by = {}; Fm.parcels.forEach(p => { by[p.crop] = (by[p.crop] || 0) + 1; });
  ok('every crop of the list is grown, the heavier more (' + JSON.stringify(by) + ')', by.taro > by.banana && by.rice > 0 && by.banana > 0, !(by.banana > by.taro));
  const same = (p, q) => q.block[0] === p.block[0] && q.block[1] === p.block[1];
  ok('one block of nine parcels shares one rotation year, and one crop where its ground takes the same crops', Fm.parcels.every(p => Fm.parcels.every(q => !same(p, q) || (q.rot === p.rot && (q.crop === p.crop || (p.z > 800) !== (q.z > 800))))),
    Fm.parcels.some(p => Fm.parcels.some(q => !same(p, q) && q.rot !== p.rot)));
  ok('the same spec gives the same farmland; another world seed another', H.farmlandHash(H.farmland({ id: 'test-farm', world: 7, centre: { x: 100, z: 100 }, hands: 140, crops, ground: toy, avoid })) === H.farmlandHash(Fm),
    H.farmlandHash(H.farmland({ id: 'test-farm', world: 8, centre: { x: 100, z: 100 }, hands: 140, crops, ground: toy, avoid })) !== H.farmlandHash(Fm));
  /* the holdings: a farmhouse on every field, a track to each (the owner, 2026-11-09) */
  const Fh = H.farmland({ id: 'test-farm', world: 7, centre: { x: 100, z: 100 }, hands: 140, crops, ground: toy, avoid, farms: { key: 'ie-farm', n: 13, box: { w: 33, d: 30.5, h: 13 } }, from: { x: 100, z: -80 } });
  const yards = Fh.parcels.filter(p => p.state === 'yard'), byFarm = {}; Fh.parcels.forEach(p => { if (p.state !== 'yard') byFarm[p.farm] = (byFarm[p.farm] || 0) + 1; });
  ok('thirteen farmsteads out on the land, each on its own yard parcel, every parcel a holding\'s, no holding empty (' + Fh.holdings.map(h => h.parcels).join(', ') + ' parcels)',
    Fh.records.length === 13 && yards.length === 13 && Fh.holdings.length === 13 && Fh.holdings.every(h => h.parcels > 5) && Fh.parcels.every(p => p.farm != null) && Fh.records.every(r => yards.some(y => y.x === r.x && y.z === r.z)),
    H.farmland({ id: 'test-farm', world: 7, centre: { x: 100, z: 100 }, hands: 140, crops, ground: toy, avoid }).records.length === 0);
  const close = []; Fh.records.forEach((a, i) => Fh.records.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.z - b.z) < H.FARM.farmGap) close.push(a.id + ' ' + b.id); }));
  ok('no two farmhouses within ' + H.FARM.farmGap + ' m of each other', close.length === 0, H.FARM.farmGap > 60, close.join('; '));
  /* every farmhouse is reached from the root by the tracks: walk the tree */
  const reach = new Set(['100,-80']), key = p => Math.round(p[0]) + ',' + Math.round(p[1]); let grew = true;
  while (grew) { grew = false; for (const t of Fh.tracks) { const a = key(t.pts[0]), b = key(t.pts[1]); if (reach.has(a) && !reach.has(b)) { reach.add(b); grew = true; } } }
  const doors = Fh.records.map(r => [r.x + Math.sin(r.ry) * (30.5 / 2 + 3), r.z + Math.cos(r.ry) * (30.5 / 2 + 3)]);
  ok('a track to every farmhouse, the tracks one tree from the village (' + Fh.tracks.length + ' tracks)', Fh.tracks.length === 13 && doors.every(d => reach.has(key(d))),
    !doors.every(d => new Set(['100,-80']).has(key(d))));
  ok('the farmhouses are in the hash (a farmhouse moved changes it)', H.farmlandHash(Fh) !== H.farmlandHash(Fm), (() => { const G2 = JSON.parse(JSON.stringify(Fh)); G2.records[0].x += 1; return H.farmlandHash(G2) !== H.farmlandHash(Fh); })());
  ok('the farmland\'s hull holds every parcel; its area in km2 is the farmed land', Fm.poly.length >= 3 && Fm.parcels.every(p => KHAMLET.hull(Fm.poly.concat([[p.x, p.z]])).length === Fm.poly.length) && Math.abs(Fm.cap - Fm.farmedHa / 100) < 0.01,
    KHAMLET.hull(Fm.poly.concat([[9000, 9000]])).length !== Fm.poly.length);
}

// ---- the landing (30 spec.landing): a coastal village's quay on the shore, facing the sea, a lane to it
{
  const Lv = H.village(spec('lumber', { landing: { x: 520, z: 300, ux: 0.866, uz: 0.5 } })), q = Lv.records.find(r => r.role === 'landing'), ln = Lv.lanes.find(l => l.landing);
  ok('a coastal village has a quay with its cargo shed on the shore, facing the sea, and a lane to it', !!q && q.key === 'ie-quay' && Math.abs(Math.atan2(0.866, 0.5) - q.ry) < 1e-6 && Math.hypot(q.x - 520, q.z - 300) < 20 && !!ln && Math.hypot(ln.pts[1][0] - q.x, ln.pts[1][1] - q.z) < 30 && Lv.landing && Lv.landing.quay === q.id && !Lv.error,
    !V.lumber.records.some(r => r.role === 'landing') && !V.lumber.landing, Lv.error || '');
  ok('the quay is on its own lane: no other lane runs out to it', Lv.lanes.filter(l => !l.landing).every(l => Math.hypot(l.pts[1][0] - l.pts[0][0], l.pts[1][1] - l.pts[0][1]) <= H.TUNE.laneMax + 1e-6), H.TUNE.laneMax < 500);
}

// ---- the names (16, 18): a long list from the tongue, dealt by hash, no two hamlets of a world alike
{
  const L = H.NAMES.islander, ids = []; for (let i = 0; i < 14; i++) ids.push('hamlet-' + i);
  const D = H.dealNames('islander', 4242, ids), names = ids.map(i => D[i].name);
  ok('the Islanders have a hundred names and more, each one of a kind, each a head and a describing word (' + L.length + ': ' + L.slice(0, 3).map(r => r.name).join(', ') + '...)',
    L.length >= 100 && new Set(L.map(r => r.name)).size === L.length && L.every(r => /^\S+ \S+$/.test(r.name) && r.gloss), !L.every(r => r.name === r.gloss));
  ok('fourteen hamlets dealt fourteen different names; the same world deals the same, another world otherwise (' + names.slice(0, 3).join(', ') + ')',
    new Set(names).size === 14 && JSON.stringify(H.dealNames('islander', 4242, ids)) === JSON.stringify(D) && H.dealNames('islander', 7, ids)['hamlet-0'].name !== D['hamlet-0'].name || H.dealNames('islander', 7, ids)['hamlet-1'].name !== D['hamlet-1'].name,
    H.hamletName('nonesuch', 4242, 'x', {}) === null);
  const used = {}; names.forEach(n => { used[n] = true; });
  ok('a hamlet founded later draws a name no one has, without moving the others', !used[H.hamletName('islander', 4242, 'hamlet-founded', used).name.slice(0, 0) + H.hamletName('islander', 4242, 'hamlet-founded', {}).name] || !names.includes(H.hamletName('islander', 4242, 'hamlet-founded', Object.assign({}, used)).name),
    names.includes(H.hamletName('islander', 4242, ids[3], {}).name));
}

console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
