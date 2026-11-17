/* node kits/coyote/tests/test-rows.js: the kit's draft Coyote row (src/34-cy-rows.js) on core/hamlet's platform village, as
   56-cy-village.js lays the Valley village. Each negative is a fault and its fix (tools/ktest.js). */
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js'); load('core/space/20-core-space.js'); load('core/city/33-city-strategies.js');
fs.readdirSync(path.join(ROOT, 'core', 'hamlet')).filter(f => /^\d\d-hamlet-.*\.js$/.test(f) && f < '40').sort().forEach(f => load('core/hamlet/' + f));
['10-camp-cultures.js', '20-camp-census.js', '30-camp-pitch.js'].forEach(f => load('core/camp/' + f));
load('kits/coyote/src/34-cy-rows.js');
/* the boxes 50-cy-valley.js and 52-cy-works.js declare, and 56-cy-village.js's CY_DIMS for the sunk rooms and the ladder */
const SRC = fs.readdirSync(path.join(ROOT, 'kits', 'coyote', 'src')).filter(f => /\.js$/.test(f)).map(f => fs.readFileSync(path.join(ROOT, 'kits', 'coyote', 'src', f), 'utf8')).join('\n');
const SIZE = { 'CY_CELL.W': 5.4, 'CY_CLIFF.W': 4.6 }, num = s => SIZE[s] != null ? SIZE[s] : +s;
const declared = k => { const m = SRC.match(new RegExp("key:'" + k + "'[\\s\\S]{0,600}?\\bw:([\\d.]+|CY_\\w+\\.W),d:([\\d.]+|CY_\\w+\\.W),h:([\\d.]+)")); return m ? { w: num(m[1]), d: num(m[2]), h: +m[3] } : null; };
const OVR = { cy_shrine_room: { w: 5, d: 5, h: 3.2 }, cy_hall: { w: 5, d: 5, h: 3.4 }, cy_round_room: { w: 5.2, d: 5.2, h: 2.36 }, cy_ladder: { w: .7, d: .4, h: 4 } };
const dims = k => OVR[k] || declared(k);
const tell = (rx, rz) => { const p = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; p.push([Math.cos(a) * rx, Math.sin(a) * rz]); } return p; };
const lay = (o) => KHAMLET.platform(Object.assign({ id: 'valley-1', world: 7, culture: CY_ROW_VALLEY, focus: 'farming', popMax: 60, dims,
  ground: { ok: () => true, h: () => 0 }, link: { x: 0, z: 120 }, plinth: { pts: tell(24, 20), top: 2.4, foot: 0 } }, o || {}));

const keys = new Set();
for (const R of Object.values(CY_ROWS)) { const Q = R.platform || {}, TQ = R.terrace || {}, TR = R.trade || {};
  [R.religious, R.civic, R.general, R.food, R.warehouse, Q.room, Q.store, Q.kiva, Q.greatKiva, Q.court, Q.pen, TQ.stair, TQ.wall, TR.serai, TR.store].forEach(k => k && keys.add(k));
  Object.values(R.houses).forEach(v => Array.isArray(v) && v.forEach(h => keys.add(h[0])));
  Object.values(R.works).forEach(ws => ws.forEach(w => keys.add(w.key))); }
const missing = [...keys].filter(k => !dims(k));
T.ok('every key the rows name is a def of this kit with a box', !missing.length, missing.join(', ') || keys.size + ' keys in ' + Object.keys(CY_ROWS).length + ' rows');
const P = CY_ROW_VALLEY.platform;

const V = lay();
T.ok('the sample village lays with no error and nothing pending', !V.error && V.pendingKeys.length === 0, V.error || V.records.length + ' records');
const rooms = V.records.filter(r => r.storey != null);
T.ok('a room for every household (two each, the headman three) and the stores', rooms.length === V.census.households * P.roomsPer + 1 + rooms.filter(r => r.key === P.store).length,
  rooms.length + ' rooms for ' + V.census.households + ' households');
T.ok('two storeys at most, Catalhoyuk-high', rooms.every(r => r.storey <= 1) && rooms.some(r => r.storey === 1), rooms.filter(r => r.storey === 1).length + ' upper rooms');
T.ok('the shrine and the council room sunk in the yard', V.records.filter(r => r.sunk).map(r => r.key).sort().join() === 'cy_hall,cy_shrine_room');
T.ok('the same world and id lay the same village', JSON.stringify(lay().records) === JSON.stringify(V.records));
T.neg('a tell too small for sixty is refused, not crammed', o => !lay(o).error, { plinth: { pts: tell(12, 10), top: 2.4, foot: 0 } }, {});
T.neg('a council hall too big for the yard is refused', d => !lay({ dims: d }).error, k => k === 'cy_hall' ? { w: 9, d: 8, h: 3.4 } : dims(k), dims);
/* the Peak's alcove village (54-cy-peak.js cy_village_peak): the ledge under the overhang, its mine on the node passed */
const aline = []; for (let i = 0; i <= 12; i++) { const a = (i / 12 - .5) * 1.2; aline.push([Math.sin(a) * 72, -Math.cos(a) * 40.5 + 22]); }
const peak = (o) => KHAMLET.platform(Object.assign({ id: 'peak-1', world: 9, culture: CY_ROW_PEAK, focus: 'mine', popMax: 30, dims,
  ground: { ok: () => true, h: () => 0 }, link: { x: 0, z: 120 }, resource: { kind: 'emerald', x: 30, z: 62, workers: 24 },
  alcove: { line: aline, depth: 20, floor: 6, height: 9, foot: 0, side: 1 } }, o || {}));
const A = peak();
T.ok('the Peak alcove village lays with no error and nothing pending', !A.error && A.kind === 'alcove' && A.pendingKeys.length === 0, A.error || A.records.length + ' records');
T.ok('its round rooms sunk in the ledge, its four mine works below', A.records.filter(r => r.sunk).length === 2 &&
  ['cy_adit', 'cy_ore_bench', 'cy_sorting_shed', 'cy_wash'].every(k => A.records.some(r => r.key === k && r.y === 0)));
T.neg('an alcove too shallow for thirty is refused', o => !peak(o).error, { alcove: { line: aline, depth: 8, floor: 6, height: 9, foot: 0, side: 1 } }, {});
/* the herders' camp (58-cy-herders.js): the draft row coyote-herder on core/camp, the program the kit's camps pitch */
const TIPI = { s: 2.2, m: 3.0, l: 3.8 };
const campDims = k => { const b = String(k).split('@')[0], m = b.match(/^cy_tipi_([sml])$/); if (m) { const w = 2 * TIPI[m[1]] + 2; return { w, d: w, h: 7 }; }
  return { cy_feather_rack: { w: 5, d: 2.4, h: 2.4 }, cy_saddle_rack: { w: 5, d: 2.6, h: 1.8 }, cy_ostrich_pen: { w: 16, d: 12, h: 2.6 }, cy_fold: { w: 10, d: 8, h: 1.8 }, cy_egg_cache: { w: 2.6, d: 2.6, h: 1.6 } }[b] || null; };
const SRC58 = fs.readFileSync(path.join(ROOT, 'kits', 'coyote', 'src', '58-cy-herders.js'), 'utf8');
const prog = eval('(' + SRC58.match(/const CY_CAMP_PROGRAM=(v=>\(\{[\s\S]*?\}\));/)[1] + ')');   /* the program as the kit writes it */
const pitch = (o) => { const P0 = prog(0); return KCAMP.pitch(Object.assign({ id: 'sunrise-summer', world: 11, culture: 'coyote-herder', program: P0, site: { x: 0, z: 0 },
  dims: campDims, ground: { ok: () => true }, way: [0, 1], formation: 'horseshoe' }, o || {})); };
T.ok('the herders\' row is registered in core/camp', KCAMP.CULTURES['coyote-herder'] === CY_CAMP_HERDER && CY_CAMP_HERDER.kind('cy_tipi_l@chief') === 'chief' && CY_CAMP_HERDER.kind('cy_tipi_m') === 'dwelling');
const camp = pitch(), chk = KCAMP.check(camp, { ok: () => true }), cen = KCAMP.census({ id: 'sunrise-summer', world: 11, culture: 'coyote-herder', program: prog(0) });
T.ok('the camp pitches whole: every tent and pen placed, none overlapping', camp.short.length === 0 && chk.overlaps === 0 && camp.records.length === 16, camp.records.length + ' records, ' + chk.overlaps + ' overlaps');
T.ok('a band of forty to seventy, every household in a dwelling, the racks and pens staffed', cen.pop >= 40 && cen.pop <= 70 && cen.households.every(h => h.tent) && cen.people.filter(p => p.work).length >= 6,
  cen.pop + ' people, ' + cen.households.length + ' households');
const chief = camp.records.find(r => /@chief/.test(r.key));
T.neg('the chief\'s tipi stands opposite the way in', c => { const r = c.records.find(q => /@chief/.test(q.key)); return r && r.z < c.hearth.z; }, { records: [Object.assign({}, chief, { z: chief.z + 99 })], hearth: camp.hearth }, camp);
/* the Tierhounds' row on core/hamlet's terraced village (36-hamlet-terrace.js), as 68-cy-street.js lays the stepped street */
const terr = d => KHAMLET.terrace({ id: 'tier-street', world: 5, culture: CY_ROW_TIER, focus: 'farming', popMax: 70, dims: d || dims,
  slope: { origin: [0, 0], up: [0, -1], width: 44, foot: 0 }, link: { x: 0, z: 200 } });
const TV = terr();
T.ok('the Tier row lays a stepped street with no error and no pending key', !TV.error && !TV.pendingKeys.length && TV.site.rows >= 3 && TV.stairs.every(q => q.key === 'cy_stair_lane'),
  TV.error || (TV.census.pop + ' people, ' + TV.site.rows + ' rows, ' + TV.records.length + ' records, ' + TV.stairs.length + ' stairs'));
T.ok('the council and the runner shrine stand below the foot street, the headman in the top row',
  ['civic', 'religious'].every(r => TV.records.filter(q => q.role === r).every(q => q.below)) && TV.records.find(q => q.tier === 'head').row === TV.site.rows - 1);
const tallLedge = k => k === 'cy_ledge_poor' ? Object.assign({}, dims(k), { h: 3.6 }) : dims(k);
T.neg('the ledge houses are one storey, so every house lays in a row (a taller one would stand at the foot)',
  v => v.records.filter(q => q.role === 'house').every(q => q.row != null), terr(tallLedge), TV);
T.done();
