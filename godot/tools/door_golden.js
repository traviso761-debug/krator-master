// core/door for Godot: KDOOR's export() (every kind, a pair of each that pairs, the presets, a hardware style), each door's
// leaves (KDOOR.leaves: centre, axis, turn, scale, size) at five open fractions, and KGLASS.SPEC (the glass kinds). The
// GDScript twin (godot/krator/kdoor.gd, KDoor) rebuilds every leaf from the export record alone and godot/tests/door/door_test.gd
// checks it against these.   node godot/tools/door_golden.js     (writes godot/tests/door/golden.json; rerun after changing
// core/door/10-core-door.js or 20-core-glass.js)
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
global.window = global;
for (const f of ['core/door/10-core-door.js', 'core/door/20-core-glass.js']) (0, eval)(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const K = KDOOR.create();
const add = (id, o) => K.add(Object.assign({ id, at: [3, 1.5, -2], yaw: 0.6, w: 1.1, h: 2.2, t: 0.07 }, o));
add('swing', {}); add('swing.right', { sign: -1 }); add('swing.hinge', { hinge: [2.4, 1.5, -1.7], yaw: -1.1 });
add('double', { preset: 'double', w: 1.8, style: 'panel' }); add('saloon', { preset: 'saloon', w: 1.4, h: 1.2 });
add('slide', { kind: 'slide' }); add('biparting', { preset: 'biparting', w: 2.0, style: 'glass' });
add('portcullis', { preset: 'portcullis', w: 3, h: 3.4 }); add('roller', { preset: 'roller', w: 2.6 }); add('floodgate', { preset: 'floodgate', w: 2, h: 1.6 });
add('blast', { preset: 'blast', w: 3, h: 3 }); add('garage', { preset: 'garage', w: 2.6, h: 2.2, yaw: 2.2 }); add('flap', { preset: 'flap', w: .8, h: .9 });
add('bifold', { preset: 'bifold', w: 1.6 }); add('bifold.pair', { kind: 'fold', pair: true, w: 2.4 }); add('iris', { preset: 'iris', w: 2, h: 2 });
add('hatch', { preset: 'hatch', w: 1, h: 1.2, yaw: 3.0 }); add('ger', { preset: 'double', style: 'banded', w: 1.0, h: 1.5, yaw: -2.5 });
add('vardo', { preset: 'double', style: 'scrolled', w: 0.9, h: 1.7 }); add('locked', { locked: true, style: 'plank' });
add('swing.narrow', { swing: 1.4, style: 'plank' });
const OPENS = [0, 0.25, 0.5, 0.75, 1];
const doors = K.export();
const leaves = {};
for (const D of K.list) leaves[D.id] = OPENS.map(f => K.leaves(Object.assign({}, D, { open: f, dir: 1 })));
// the double-acting door swung the other way (dir -1, opened from inside)
const sal = K.get('saloon'); leaves['saloon.back'] = OPENS.map(f => K.leaves(Object.assign({}, sal, { open: f, dir: -1 })));
const out = { format: 'krator-door-golden', version: 1, note: 'node godot/tools/door_golden.js; KDOOR.leaves of each export record at each open fraction',
  opens: OPENS, doors, leaves, glass: KGLASS.SPEC };
const dst = path.join(ROOT, 'godot', 'tests', 'door', 'golden.json');
fs.mkdirSync(path.dirname(dst), { recursive: true });
fs.writeFileSync(dst, JSON.stringify(out, null, 1) + '\n');
console.log('wrote ' + path.relative(ROOT, dst).split(path.sep).join('/') + ': ' + doors.doors.length + ' doors x ' + OPENS.length + ' opens, ' + Object.keys(KGLASS.SPEC).length + ' glass kinds');
