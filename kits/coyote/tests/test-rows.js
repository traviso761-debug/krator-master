/* node kits/coyote/tests/test-rows.js: the kit's draft Coyote row (src/34-cy-rows.js) on core/hamlet's platform village, as
   56-cy-village.js lays the Valley village. Each negative is a fault and its fix (tools/ktest.js). */
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js'); load('core/space/20-core-space.js'); load('core/city/33-city-strategies.js');
fs.readdirSync(path.join(ROOT, 'core', 'hamlet')).filter(f => /^\d\d-hamlet-.*\.js$/.test(f) && f < '40').sort().forEach(f => load('core/hamlet/' + f));
load('kits/coyote/src/34-cy-rows.js');
/* the boxes 50-cy-valley.js and 52-cy-works.js declare, and 56-cy-village.js's CY_DIMS for the sunk rooms and the ladder */
const SRC = fs.readdirSync(path.join(ROOT, 'kits', 'coyote', 'src')).filter(f => /\.js$/.test(f)).map(f => fs.readFileSync(path.join(ROOT, 'kits', 'coyote', 'src', f), 'utf8')).join('\n');
const declared = k => { const m = SRC.match(new RegExp("key:'" + k + "'[\\s\\S]{0,600}?\\bw:([\\d.]+|CY_CELL\\.W),d:([\\d.]+|CY_CELL\\.W),h:([\\d.]+)")); return m ? { w: m[1] === 'CY_CELL.W' ? 5.4 : +m[1], d: m[2] === 'CY_CELL.W' ? 5.4 : +m[2], h: +m[3] } : null; };
const OVR = { cy_shrine_room: { w: 5, d: 5, h: 3.2 }, cy_hall: { w: 5, d: 5, h: 3.4 }, cy_ladder: { w: .7, d: .4, h: 4 } };
const dims = k => OVR[k] || declared(k);
const tell = (rx, rz) => { const p = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; p.push([Math.cos(a) * rx, Math.sin(a) * rz]); } return p; };
const lay = (o) => KHAMLET.platform(Object.assign({ id: 'valley-1', world: 7, culture: CY_ROW_VALLEY, focus: 'farming', popMax: 60, dims,
  ground: { ok: () => true, h: () => 0 }, link: { x: 0, z: 120 }, plinth: { pts: tell(24, 20), top: 2.4, foot: 0 } }, o || {}));

const keys = new Set();
const R = CY_ROW_VALLEY, P = R.platform;
[R.religious, R.civic, R.general, R.food, R.warehouse, P.room, P.store, P.kiva, P.greatKiva, P.court, P.pen].forEach(k => keys.add(k));
Object.values(R.houses).forEach(v => Array.isArray(v) && v.forEach(h => keys.add(h[0])));
Object.values(R.works).forEach(ws => ws.forEach(w => keys.add(w.key)));
const missing = [...keys].filter(k => !dims(k));
T.ok('every key the row names is a def of this kit with a box', !missing.length, missing.join(', ') || keys.size + ' keys');

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
T.done();
