#!/usr/bin/env node
/* The catalog's size-aware segments (krator-furniture-core.js, _fit / _ring; ROADMAP stage 1): builds every FURN piece,
   every variant (seed 1), at detail 1 and 0.5 (KF.setDetail: the settlements' level), headless, and checks
     - every piece builds;
     - no round part has more segments than the fixed counts gave it (cylinder 16, cone 14, dome 16 x 10, ball 14 x 10,
       blob 10 x 8, ellipsoid 12 x 8, rod 8, each scaled by the detail as before), and none fewer than its floor
       (6 round; a rod 4 below detail 1, as before);
     - no upright cylinder pokes through a coaxial one it touches when both have the same turn (the coaxial parts share
       a count: a band round a leg, a rim on a jar);
   and prints the triangles per primitive kind at both levels.
     node kits/catalog/tests/test-segments.js            # the checks and the census
     node kits/catalog/tests/test-segments.js --json f   # also the per-piece census (key, type, tris per kind|radius band) */
const fs = require('fs'), vm = require('vm'), path = require('path');
const CAT = path.join(__dirname, '..');
const args = process.argv.slice(2), jsonOut = args[0] === '--json' ? args[1] : null;
const ctx2d = new Proxy({}, { get: (t, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} });
  if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
  return typeof k === 'string' ? () => {} : undefined;
}, set: () => true });

function census(detail) {
  const g = { console: { log() {}, warn() {}, error() {} } };
  for (const k of Object.getOwnPropertyNames(globalThis)) if (!(k in g)) g[k] = globalThis[k];
  g.self = g; g.window = g; g.globalThis = g;
  g.document = { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx2d, addEventListener() {} }) };
  vm.createContext(g);
  vm.runInContext(fs.readFileSync(path.join(CAT, 'three.min.js'), 'utf8'), g);
  const files = ['krator-furniture-core.js', 'krator-symbols.js', 'krator-furniture-kit.js', 'krator-master-furniture.js']
    .concat(fs.readdirSync(CAT).filter(f => f.startsWith('krator-master-furniture-') && f.endsWith('.js')).sort());
  const src = 'var scene = { add() {}, remove() {} };\n' + files.map(f => fs.readFileSync(path.join(CAT, f), 'utf8')).join('\n;\n') + `
;(function () {
  _LOD = ${detail};
  const R = { mkCyl: [3], mkCone: [3], mkDome: [3], mkBlob: [3], mkBall: [3], mkRod: [6], mkEll: [3, 4, 5], mkFrustum: [3, 4], mkBolster: [4] };
  /* the fixed counts (round, rows) and the floors the rule keeps */
  const OLD = { mkCyl: [[16, 6]], mkCone: [[14, 6]], mkDome: [[16, 6], [10, 3]], mkBall: [[14, 6], [10, 4]], mkBlob: [[10, 6], [8, 4]], mkEll: [[12, 6], [8, 4]], mkRod: [[8, 4]] };
  const kinds = Object.keys(globalThis).filter(k => /^mk[A-Z]/.test(k) && typeof globalThis[k] === 'function');
  const fail = [];
  let cur = null;
  const tris = m => { const G = m.geometry; return G.index ? G.index.count / 3 : G.attributes.position.count / 3; };
  const band = r => r == null || !isFinite(r) ? 'n/a' : r < 0.02 ? '<0.02' : r < 0.05 ? '0.02-0.05' : r < 0.1 ? '0.05-0.1' : r < 0.2 ? '0.1-0.2' : r < 0.4 ? '0.2-0.4' : '>=0.4';
  for (const k of kinds) {
    const orig = globalThis[k];
    globalThis[k] = function () {
      const tg = _target, n0 = tg ? tg.children.length : 0, ret = orig.apply(this, arguments);
      if (!cur || !tg) return ret;
      const ix = R[k], r = ix ? Math.max.apply(null, ix.map(i => typeof arguments[i] === 'number' ? arguments[i] : NaN)) : null;
      for (let i = n0; i < tg.children.length; i++) {
        const m = tg.children[i]; if (!m.isMesh) continue;
        const t = tris(m), key = k + '|' + band(r);
        cur.kb[key] = (cur.kb[key] || 0) + t / cur.nv; cur.tris += t / cur.nv;
        if (OLD[k]) {
          const P = m.geometry.parameters, got = [P.radialSegments != null ? P.radialSegments : P.widthSegments, P.heightSegments];
          OLD[k].forEach(([n, min], j) => {
            const was = _seg(n, min), floor = j ? min : (k === 'mkRod' && _LOD < 1 ? 4 : 6);
            if (got[j] > was || got[j] < Math.min(was, floor)) fail.push(cur.key + ' ' + k + ' r ' + r + ': ' + got[j] + (j ? ' rows' : ' round') + ' (fixed rule ' + was + ', floor ' + floor + ')');
          });
        }
        if (k === 'mkCyl') { const P = m.geometry.parameters; cur.cyl.push({ x: m.position.x, z: m.position.z, y0: m.position.y - P.height / 2, y1: m.position.y + P.height / 2, r: P.radiusTop, n: P.radialSegments, ry: m.rotation.y, v: cur.v }); }
      }
      return ret;
    };
  }
  /* how far the inner polygon's corners stand outside the outer polygon (same axis, same turn, touching) */
  function bound(R, n, phi) { const s = 2 * Math.PI / n, a = ((phi % s) + s) % s; return R * Math.cos(Math.PI / n) / Math.cos(a - s / 2); }
  function pokes(c) {
    const out = [];
    for (const A of c) for (const B of c) {
      if (A === B || A.v !== B.v || A.r >= B.r || A.ry !== B.ry || Math.abs(A.x - B.x) > 1e-5 || Math.abs(A.z - B.z) > 1e-5) continue;
      if (A.y1 <= B.y0 + 1e-6 || B.y1 <= A.y0 + 1e-6) continue;
      let worst = 0;
      for (let i = 0; i < A.n; i++) worst = Math.max(worst, A.r - bound(B.r, B.n, 2 * Math.PI * i / A.n));
      if (worst > 1e-5) out.push('r ' + A.r + ' (' + A.n + ') in r ' + B.r + ' (' + B.n + '): ' + (worst * 1000).toFixed(2) + ' mm');
    }
    return out;
  }
  const out = [];
  for (const A of FURNS) {
    const nv = A.variants || 1;
    cur = { key: A.key, type: A.type, nv, tris: 0, kb: {}, cyl: [], err: null };
    for (let v = 0; v < nv; v++) {
      cur.v = v;
      const grp = buildFurn(A.key, 0, 0, 0, { variant: v, seed: 1 });
      if (!grp) cur.err = 'no build'; else if (grp.userData.error) cur.err = grp.userData.error;
      INSTANCES.length = 0;
    }
    if (cur.err) fail.push(cur.key + ': ' + cur.err);
    for (const p of pokes(cur.cyl)) fail.push(cur.key + ' pokes: ' + p);
    out.push({ key: cur.key, type: cur.type, tris: Math.round(cur.tris), kb: cur.kb });
  }
  globalThis.__OUT = { pieces: out, fail };
})();`;
  vm.runInContext(src, g, { filename: 'test-segments.js' });
  return g.__OUT;
}

let bad = 0;
const all = {};
for (const d of [1, 0.5]) {
  const R = census(d), byKind = {};
  all[d] = R.pieces;
  for (const p of R.pieces) for (const k in p.kb) { const kind = k.split('|')[0]; byKind[kind] = (byKind[kind] || 0) + p.kb[k]; }
  const tot = Object.values(byKind).reduce((s, x) => s + x, 0);
  console.log('detail ' + d + ': ' + R.pieces.length + ' pieces, ' + Math.round(tot) + ' triangles (each piece once, the mean of its variants): ' +
    Object.entries(byKind).sort((a, b) => b[1] - a[1]).map(e => e[0].slice(2) + ' ' + Math.round(e[1])).join(', '));
  for (const f of R.fail.slice(0, 20)) console.log('FAIL ' + f);
  if (R.fail.length > 20) console.log('FAIL ... and ' + (R.fail.length - 20) + ' more');
  console.log((R.fail.length ? 'FAIL' : 'ok  ') + ' detail ' + d + ': counts within the fixed rule and the floors, no coaxial poke');
  bad += R.fail.length;
}
if (jsonOut) { fs.writeFileSync(jsonOut, JSON.stringify(all)); console.log('wrote ' + jsonOut); }
process.exit(bad ? 1 : 0);
