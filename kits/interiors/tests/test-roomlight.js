/* kits/interiors/tests/test-roomlight.js: K2's interiors half (GRAPHICS-TERRAIN-PROPOSAL.md 12d): KROOMLIGHT bundled ahead of the
   core (kit_bundle.py, build.py src/05-roomlight.js), the room table over ROOM() records (IX.roomLight), the room-gated light
   pool (IX.lightPool), interiors.json v2 (IX.exportInteriors) and the shell's baked corner AO (src/50-shell.js).
     node kits/interiors/tests/test-roomlight.js                                                                          */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const HERE = path.resolve(__dirname, '..');
const THREE = require(path.resolve(HERE, '../ancients/three.min.js'));
const ctx = { THREE, console, Math, JSON, Float32Array, Uint16Array, Uint32Array, Set, Map, Object, Array };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
/* the bundle's core as kit_bundle.files() lists it: KROOMLIGHT, then src/10-49 */
const core = ['../../core/interiors/10-core-roomlight.js'].concat(fs.readdirSync(path.join(HERE, 'src')).filter(f => /^\d/.test(f) && f.endsWith('.js') && f < '50').sort().map(f => 'src/' + f));
T.ok('the bundle lists KROOMLIGHT ahead of the core (kit_bundle.py)', /10-core-roomlight\.js'\][\s\S]*'src\/' \+ f/.test(fs.readFileSync(path.join(HERE, 'kit_bundle.py'), 'utf8')) &&
  /'05-roomlight\.js'\]\s*=\s*os\.path\.join\(ROOT, 'core', 'interiors', '10-core-roomlight\.js'\)/.test(fs.readFileSync(path.join(HERE, 'build.py'), 'utf8')));
for (const f of core) vm.runInContext(fs.readFileSync(path.join(HERE, f), 'utf8'), ctx, { filename: f });
vm.runInContext(fs.readFileSync(path.join(HERE, 'src', '50-shell.js'), 'utf8'), ctx, { filename: '50-shell.js' });
const IX = vm.runInContext('KratorInteriors', ctx);
T.ok('the core finds KROOMLIGHT', !!IX.ROOMLIGHT && typeof IX.roomLight === 'function');

/* three rooms in a row: a hall with a window and a street door, a passage behind it, a store behind that (no window) */
IX.clearRooms();
const hall = IX.ROOM({ id: 't.hall', kind: 'hall', poly: [[0, 0], [8, 0], [8, 6], [0, 6]], h: 3.2,
  doors: [{ at: [4, 6], to: 'street', w: 1.2 }, { at: [8, 3], to: 't.pass', w: 1.0 }], windows: [{ at: [0, 3], w: 1.4, h: 1.4 }] });
const pass = IX.ROOM({ id: 't.pass', kind: 'hall', poly: [[8, 0], [11, 0], [11, 6], [8, 6]], h: 3.2, doors: [{ at: [11, 3], to: 't.store', w: 1.0 }] });
const store = IX.ROOM({ id: 't.store', kind: 'store', poly: [[11, 0], [15, 0], [15, 6], [11, 6]], h: 3.2 });
const cell = IX.ROOM({ id: 't.cell', kind: 'store', poly: [[20, 0], [23, 0], [23, 3], [20, 3]], h: 2.6 });
const plans = { 't.store': { lights: [{ x: 13, y: 2.4, z: 3, intensity: 1.2, distance: 7 }] } };
const tb = IX.roomLight(null, plans);
const row = id => tb.byId[id];
T.ok('the table has a row per ROOM()', tb.order.length === 4 && tb.version === 1);
T.ok('the hall is lit by its own window and street door (hop 0)', row('t.hall').hop === 0 && row('t.hall').daylight > 0.4);
T.ok('daylight falls off through each doorway', row('t.pass').hop === 1 && row('t.store').hop === 2 &&
  row('t.pass').daylight < row('t.hall').daylight && row('t.store').daylight < row('t.pass').daylight);
T.ok('a room with no portal stays dark', row('t.cell').hop === -1 && row('t.cell').daylight === 0);
T.ok('the plan\'s lights are its lamps', row('t.store').lampCount === 1 && row('t.store').lampAmbience > row('t.pass').lampAmbience);
T.neg('a shut door is a wall to the light (o.shut)',
  t => t.byId['t.store'].hop === -1, tb, IX.roomLight(null, plans, { shut: (r, d) => r.id === 't.pass' && d.to === 't.store' }));

const pool = IX.lightPool({ eye: [12, 1.6, 3], eyeRoom: 't.store', table: tb, plans, sunUp: 0.2, count: 6 });
T.ok('the store\'s pool holds its lamp, a hero shadow, and nothing from the hall two doors off',
  pool.some(p => p.kind === 'lamp' && p.room === 't.store' && p.heroShadow) && pool.every(p => p.room !== 't.hall'));
const poolHall = IX.lightPool({ eye: [4, 1.6, 3], eyeRoom: 't.hall', table: tb, plans, sunUp: 1 });
T.ok('the hall\'s pool holds its window at its sill-to-head middle', poolHall.some(p => p.kind === 'window' && Math.abs(p.at[1] - (0.9 + 0.7)) < 1e-9));

const ex = IX.exportInteriors(null, plans);
T.ok('interiors.json v2: version, rooms with boxes, the room table', ex.version === 2 && ex.rooms.length === 4 && ex.room_table && ex.room_table.byId['t.hall'] &&
  JSON.stringify(ex.rooms[0].box) === JSON.stringify([0, 0, 0, 8, 3.2, 6]));
T.ok('each doorway between rooms is one portal; a street door is none', ex.portals.length === 2 &&
  ex.portals.some(p => p.a === 't.hall' && p.b === 't.pass') && ex.portals.some(p => [p.a, p.b].sort().join() === 't.pass,t.store'));
T.ok('the export is plain JSON', JSON.stringify(JSON.parse(JSON.stringify(ex))) === JSON.stringify(ex));

/* the shell's corner AO */
function wallsOf(g){ const out = []; g.userData.shell.walls.forEach(w => w.full.children.forEach(m => out.push(m))); return out; }
function samples(meshes){ const S = []; const p = new THREE.Vector3(), n = new THREE.Vector3();
  for (const m of meshes) { const c = m.geometry.attributes.color; if (!c) continue; m.updateMatrix();
    for (let i = 0; i < c.count; i++) { p.fromBufferAttribute(m.geometry.attributes.position, i).applyMatrix4(m.matrix);
      n.fromBufferAttribute(m.geometry.attributes.normal, i).applyQuaternion(m.quaternion); S.push({ x: p.x, y: p.y, z: p.z, nx: n.x, nz: n.z, c: c.getX(i) }); } }
  return S; }
const sh = IX.view.shell(store, { kdoor: false });
const S = samples(wallsOf(sh).filter(m => m.material === sh.userData.shell.mats.wall));
T.ok('every wall box carries a colour, and the walls\' material reads it', S.length > 0 && sh.userData.shell.mats.wall.vertexColors === true &&
  wallsOf(sh).filter(m => m.material === sh.userData.shell.mats.wall).every(m => !!m.geometry.attributes.color));
const inner = S.filter(q => q.x > 11 - 1e-6 && q.x < 15 + 1e-6 && q.z > -1e-6 && q.z < 6 + 1e-6 && (Math.abs(q.nx) > .9 || Math.abs(q.nz) > .9));
const at = (y, f) => inner.filter(q => Math.abs(q.y - y) < 1e-4 && f(q)).map(q => q.c);
T.ok('a floor-wall joint darkens on the inner face', Math.min.apply(null, at(0, q => Math.abs(q.z) < 1e-4 && q.nz > .9 && q.x > 11.5 && q.x < 14.5)) < 0.7);
T.ok('a trihedral corner is darkest (0.44 .. 0.6)', (() => { const v = at(0, q => Math.abs(q.x - 11) < 1e-4 && Math.abs(q.z) < 1e-4); return v.length && Math.min.apply(null, v) <= 0.6 && Math.min.apply(null, v) >= 0.4399; })());
T.ok('the wall\'s middle keeps its colour (gridded at the reach)', (v => v.length === 2 && v.every(c => c === 1))(at(3.2 - 0.85, q => q.nz > .9 && Math.abs(q.z) < 1e-4 && q.x > 11.5 && q.x < 14.5)) &&
  inner.some(q => Math.abs(q.y - 0.85) < 1e-4 && q.c === 1));
T.neg('the outer face and the roof stay as they were (only faces inside the room and turned into it)',
  P => P.filter(q => q.z < -0.1).every(q => q.c === 1),
  S.map(q => Object.assign({}, q, { c: q.z < -0.1 ? 0.5 : q.c })), S);
T.ok('opt.cornerAO false: plain boxes, no colour', (() => { const g = IX.view.shell(store, { kdoor: false, cornerAO: false });
  return wallsOf(g).every(m => !m.geometry.attributes.color) && !g.userData.shell.mats.wall.vertexColors; })());
T.done();
