// node tools/textures/card_probe.js '<json>': the core card geometries as BIO.def draws them for a library slot, for
// tools/textures/card_probe.py to rasterise. Input: [{kind, base}] (kind frond, ribbon, hang or clump; base the slot's "base" or
// null). Output: [{kind, base, tris: [[x, y, u, v] x 3, ...]}], each triangle laid flat on the card's own face (x across the
// card, y up it, in units of its length), uv after the fit (core/biome 20-core-kit.js: turned to the base, once down a frond or
// ribbon). The page's code is run as it is (three r128, core/biome), not a copy of it.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
const ctx = { console, Math, THREE }; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['core/rand/08-core-rand.js', 'core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js'])
  vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
const BIO = ctx.BIO;
BIO.init({ THREE, scene: new THREE.Scene(), seed: 1, err: () => {} });
const make = { frond: () => BIO.geo.frond(4), ribbon: () => BIO.geo.ribbon(4, .55, .18), hang: () => BIO.geo.hang(), clump: () => BIO.geo.clump() };
const out = [];
JSON.parse(process.argv[2]).forEach((q, n) => {
  const m = new THREE.MeshLambertMaterial(); if (q.base) m.userData.libCard = { base: q.base };
  BIO.def('p' + n, make[q.kind](), m);
  const g = BIO.defs['p' + n].geo, P = g.attributes.position.array, U = g.attributes.uv.array, tris = [];
  // the card's face: frond, x along and z across (seen from above); ribbon and hang, x across and y down; one clump quad, on its own axes
  const nt = q.kind === 'clump' || q.kind === 'hang' ? 2 : P.length / 9;
  let ax = null;
  if (q.kind === 'clump') {   /* the first quad's u and v axes from its corners: up the card is its local +v vector */
    const p = i => [P[3 * i], P[3 * i + 1], P[3 * i + 2]], c0 = p(0), c1 = p(1), c3 = p(5);
    ax = { o: c0, e: [c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]], f: [c3[0] - c0[0], c3[1] - c0[1], c3[2] - c0[2]] };
  }
  for (let t = 0; t < nt; t++) {
    const tri = [];
    for (let k = 0; k < 3; k++) {
      const i = t * 3 + k, x = P[3 * i], y = P[3 * i + 1], z = P[3 * i + 2];
      let fx, fy;
      if (q.kind === 'frond') { fx = z; fy = x; }   /* the frond laid upright: its stem at the bottom */
      else if (q.kind === 'clump') { const d = [x - ax.o[0], y - ax.o[1], z - ax.o[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        fx = dot(d, ax.e) / dot(ax.e, ax.e); fy = dot(d, ax.f) / dot(ax.f, ax.f); }
      else { fx = q.kind === 'hang' ? x / Math.cos(.4) : x; fy = y; }
      tri.push([fx, fy, U[2 * i], U[2 * i + 1]]);
    }
    tris.push(tri);
  }
  out.push({ kind: q.kind, base: q.base || null, tris });
});
process.stdout.write(JSON.stringify(out));
