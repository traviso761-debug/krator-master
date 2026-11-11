/* node core/furnish/scale/test-furnish-scale.js: the per-culture scale (54-core-furnish-scale.js) against a stub adapter */
'use strict';
const path = require('path'), fs = require('fs'), vm = require('vm');
const ctx = { module: undefined, console: console, Math: Math, Object: Object, WeakMap: WeakMap, Error: Error, Float32Array: Float32Array, String: String };
vm.createContext(ctx);
for (const f of ['../50-core-furnish.js', '54-core-furnish-scale.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx, { filename: f });
const K = vm.runInContext('KFURN', ctx);
let fails = 0;
function ok(c, m) { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); }
const near = function (a, b) { return Math.abs(a - b) < 1e-6; };

ok(K.scaleOf('tungang', 'generic') === 0.94, 'a generic piece in a Tungang room takes 0.94');
ok(K.scaleOf(null, 'tungang') === 0.94, 'a Tungang piece elsewhere takes its own 0.94');
ok(K.scaleOf('voth', 'voth') === 1 && K.scaleOf(null, null) === 1, 'everything else is 1');
ok(K.scaleOf('voth', 'tungang') === 0.94, 'the piece\'s culture when the room has no scale');
const rec = K.scaleRec({ key: 'k' }, { culture: 'generic' }, 'tungang'), rec1 = K.scaleRec({ key: 'k' }, { culture: 'generic' }, 'voth');
ok(rec.s === 0.94 && !('s' in rec1), 'scaleRec sets rec.s only when it is not 1');

const built = [];
const stub = {
  list: function () { return []; },
  dims: function () { return { w: 2, d: 1, h: 3 }; },
  top: function () { return 0.8; },
  anchorY: function (k, v, at) { return k === 'hung' ? at.floorY + 1.6 - 1.5 : k === 'ceil' ? at.ceilingY - 3 : k === 'surf' ? at.surfaceY : at.floorY; },
  lights: function () { return [{ lx: 1, ly: 2, lz: 0, distance: 10, color: 1, intensity: 1 }]; },
  build: function (p) { const g = { s: 1, position: { x: 0, y: 0, z: 0 }, userData: { interior: {} }, scale: { multiplyScalar: function (x) { g.s *= x; } } }; built.push(g); return g; }
};
const A = K.scaleAdapter(stub, 0.94);
const d = A.dims('a', 0);
ok(near(d.w, 1.88) && near(d.d, 0.94) && near(d.h, 2.82), 'dims scaled');
ok(near(A.top('a', 0), 0.752), 'top scaled');
const at = { floorY: 1, surfaceY: 1.8, ceilingY: 5 };
ok(A.anchorY('floor', 0, at) === 1 && A.anchorY('surf', 0, at) === 1.8, 'floor and surface anchors unchanged');
ok(near(A.anchorY('ceil', 0, at), 5 - 2.82), 'a ceiling piece keeps its top at the ceiling');
ok(near(A.anchorY('hung', 0, at), 1 + 0.1 * 0.94), 'a hung piece lifted at the people\'s measure');
const L = A.lights('a', 0, {})[0];
ok(near(L.lx, 0.94) && near(L.ly, 1.88) && near(L.distance, 9.4), 'lights scaled');
const g = A.build({ x: 10, y: 2, z: -5 }, {});
ok(near(g.s, 0.94) && g.userData.interior.scale === 0.94, 'the built object scaled');
/* a vertex at world (11, 3, -5) in a group at the origin goes to P + s (v - P) = (10.94, 2.94, -5) */
ok(near(g.position.x + g.s * 11, 10.94) && near(g.position.y + g.s * 3, 2.94) && near(g.position.z + g.s * -5, -5), 'about the placement point');
ok(K.scaleAdapter(stub, 1) === stub, 'scale 1 is the adapter itself');
ok(K.adapterFor(stub, { culture: 'tungang' }) === K.adapterFor(stub, { culture: 'tungang' }), 'adapterFor caches per adapter and scale');
ok(K.adapterFor(stub, { culture: 'voth' }) === stub, 'adapterFor: an unscaled room gets the adapter itself');
if (fails) { console.log(fails + ' FAILED'); process.exit(1); }
console.log('test-furnish-scale: all passed');
