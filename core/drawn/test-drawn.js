// node core/drawn/test-drawn.js: KDRAWN (10-core-drawn.js; CORE-IMPROVEMENTS.md item 28), each audit with a fault that must
// fail and a fix that must pass (tools/ktest.js). three.js r128 builds the PlaneGeometry the grid must match triangle for triangle.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
const K = require('./10-core-drawn.js');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));

// 1. a grid is a ramp where the ramp is planar
const ramp = (x, z) => 2 + 0.5 * x - 0.25 * z;
const G = { x0: -40, z0: -30, dx: 10, dz: 15, nx: 8, nz: 4, h: [] };
for (let j = 0; j <= G.nz; j++) for (let i = 0; i <= G.nx; i++) G.h.push(ramp(G.x0 + i * G.dx, G.z0 + j * G.dz));
const g = K.grid(G);
let worst = 0;
for (let k = 0; k < 400; k++) { const x = -40 + (k * 37 % 80), z = -30 + (k * 13 % 60) + 0.3; worst = Math.max(worst, Math.abs(g.h(x, z) - ramp(x, z))); }
T.ok('a grid reads a planar ramp exactly', worst < 1e-9, 'worst ' + worst);
T.ok('off the grid is null, not 0', g.h(-41, 0) === null && g.h(0, 31) === null);

// 2. the grid splits each cell as three.js's PlaneGeometry does: a bump at one vertex reads the same both ways
const W = 80, D = 60, P = new THREE.PlaneGeometry(W, D, G.nx, G.nz).rotateX(-Math.PI / 2), pos = P.attributes.position;
const bump = { x0: -40, z0: -30, dx: 10, dz: 15, nx: 8, nz: 4, h: new Array(45).fill(0) };
bump.h[2 * 9 + 3] = 6;   // vertex (3, 2)
for (let i = 0; i < pos.count; i++) {
  const ix = Math.round((pos.getX(i) + 40) / 10), iz = Math.round((pos.getZ(i) + 30) / 15);
  pos.setY(i, bump.h[iz * 9 + ix]);
}
const mesh = new THREE.Mesh(P), gb = K.grid(bump), mb = K.fromObject(mesh);
let diff = 0;
for (let k = 0; k < 2000; k++) { const x = -40 + (k * 7.31 % 80), z = -30 + (k * 3.77 % 60); diff = Math.max(diff, Math.abs(gb.h(x, z) - mb.h(x, z))); }
T.ok('grid and mesh agree on the split (a-b-d, b-c-d)', diff < 1e-6, 'max diff ' + diff);
const flipped = Object.assign({}, bump), flip = { kind: 'grid', h: (x, z) => { /* the other diagonal: what a wrong split reads */
  const fx = (x - flipped.x0) / 10, fz = (z - flipped.z0) / 15, ix = Math.min(7, Math.floor(fx)), iz = Math.min(3, Math.floor(fz)), u = fx - ix, v = fz - iz, H = flipped.h;
  const a = H[iz * 9 + ix], d = H[iz * 9 + ix + 1], b = H[(iz + 1) * 9 + ix], c = H[(iz + 1) * 9 + ix + 1];
  return u >= v ? a + (d - a) * u + (c - d) * v : a + (c - b) * u + (b - a) * v; } };
const agrees = src => { let m = 0; for (let k = 0; k < 2000; k++) { const x = -40 + (k * 7.31 % 80), z = -30 + (k * 3.77 % 60); m = Math.max(m, Math.abs(src.h(x, z) - mb.h(x, z))); } return m < 1e-6; };
T.neg('a grid split on the other diagonal is told apart from the drawn mesh', agrees, flip, gb);

// 3. the survey's channel: 16 m cells bridge an 11 m channel 3 m deep; terrainH has the channel, the drawn ground does not
const defined = (x, z) => (Math.abs(x - 3) < 5.5 ? -3 : 0);
const C = { x0: -64, z0: -64, dx: 16, dz: 16, nx: 8, nz: 8, h: [] };
for (let j = 0; j <= 8; j++) for (let i = 0; i <= 8; i++) C.h.push(defined(-64 + i * 16, -64 + j * 16));
const coarse = K.grid(C);
const pts = []; for (let z = -60; z <= 60; z += 4) pts.push([3, z]);
const audit = src => K.compare(defined, pts, src).max < 0.5;   // an audit that trusts terrainH passes only if the drawn ground follows it
const F = { x0: -64, z0: -64, dx: 2, dz: 2, nx: 64, nz: 64, h: [] };
for (let j = 0; j <= 64; j++) for (let i = 0; i <= 64; i++) F.h.push(defined(-64 + i * 2, -64 + j * 2));
T.neg('the channel the coarse cells bridge reads as a gap; 2 m strips follow it', audit, coarse, K.grid(F));
const cmp = K.compare(defined, pts, coarse);
T.ok('compare names the worst point, drawn against defined', cmp.worst && cmp.worst.defined === -3 && cmp.worst.drawn - cmp.worst.defined > 0.5, JSON.stringify(cmp.worst));

// 4. the page's sources: the top one wins, nothing reads null; a matrix moves the mesh
K.clear(); K.add(K.grid(G)); K.add(K.grid({ x0: 0, z0: 0, dx: 5, dz: 5, nx: 2, nz: 2, h: new Array(9).fill(100) }));
T.ok('KDRAWN.h takes the highest source', K.h(5, 5) === 100 && Math.abs(K.h(-20, 0) - ramp(-20, 0)) < 1e-9 && K.h(500, 500) === null);
const lifted = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 1, 1).rotateX(-Math.PI / 2)); lifted.position.set(100, 7, 0);
const ls = K.fromObject(lifted);
T.ok('the mesh is read in world space (matrixWorld)', Math.abs(ls.h(100, 0) - 7) < 1e-9 && ls.h(0, 0) === null);
const under = eye => { K.clear(); K.add(ls); const y = K.h(eye.x, eye.z); return !(y !== null && eye.y < y); };   // the eye check's drawn rule
T.neg('an eye under the drawn ground is caught; one above it is not', under, { x: 101, y: 5, z: 1 }, { x: 101, y: 9, z: 1 });
T.done();
