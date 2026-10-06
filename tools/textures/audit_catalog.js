#!/usr/bin/env node
/* Texture audit of the furniture catalog (kits/catalog): builds every FURN piece headlessly, every variant,
   and sums the surface area each render family (mat()'s `family`) and each palette key covers. The family is
   the key a host's detail map hangs on (settlements/girder materials.json `f_<family>`, 48-detail.js), so
   this says which families carry most of the catalog and which palette roles share one family.

     node tools/textures/audit_catalog.js                 # summary: per family, m2, pieces, top palette keys
     node tools/textures/audit_catalog.js --json out.json  # per piece: {key, culture, type, parts{family|key: m2}}

   Area is the mean over a piece's variants, in m2 of triangle surface. Painted panels (F.decal) count as
   `family|DECAL`; a colour that is no key of the piece's culture palette shows as its hex.
   Results are in core/materials/PLAN.md, "Catalog furniture audit". */
const fs = require('fs'), vm = require('vm'), path = require('path');
const CAT = path.join(__dirname, '..', '..', 'kits', 'catalog') + path.sep;
const args = process.argv.slice(2), jsonOut = args[0] === '--json' ? args[1] : null;

/* a page-less context: three.js, a canvas that paints nothing, a scene that keeps nothing */
const ctx2d = new Proxy({}, { get: (t, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} });
  if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
  return typeof k === 'string' ? () => {} : undefined;
}, set: () => true });
const g = { console: { log() {}, warn() {}, error() {} } };
for (const k of Object.getOwnPropertyNames(globalThis)) if (!(k in g)) g[k] = globalThis[k];
g.self = g; g.window = g; g.globalThis = g;
g.document = { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx2d, addEventListener() {} }) };
vm.createContext(g);
vm.runInContext(fs.readFileSync(CAT + 'three.min.js', 'utf8'), g);

const files = ['krator-furniture-core.js', 'krator-symbols.js', 'krator-furniture-kit.js', 'krator-master-furniture.js']
  .concat(fs.readdirSync(CAT).filter(f => f.startsWith('krator-master-furniture-') && f.endsWith('.js')).sort());
const src = 'var scene = { add() {}, remove() {} };\n' + files.map(f => fs.readFileSync(CAT + f, 'utf8')).join('\n;\n') + `
;(function () {
  const out = [], tri = new THREE.Triangle(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  function area(m) {
    const p = m.geometry.attributes.position, idx = m.geometry.index, n = idx ? idx.count : p.count;
    let s = 0;
    for (let i = 0; i < n; i += 3) {
      a.fromBufferAttribute(p, idx ? idx.getX(i) : i).applyMatrix4(m.matrixWorld);
      b.fromBufferAttribute(p, idx ? idx.getX(i + 1) : i + 1).applyMatrix4(m.matrixWorld);
      c.fromBufferAttribute(p, idx ? idx.getX(i + 2) : i + 2).applyMatrix4(m.matrixWorld);
      s += tri.set(a, b, c).getArea();
    }
    return s;
  }
  for (const A of FURNS) {
    const pal = FPAL[A.culture] || {}, rev = {};
    for (const k in pal) if (typeof pal[k] === 'number' && !(pal[k] in rev)) rev[pal[k]] = k;
    const nv = A.variants || 1, parts = {};
    let err = null;
    for (let v = 0; v < nv; v++) {
      const grp = buildFurn(A.key, 0, 0, 0, { variant: v, seed: 1 });
      if (!grp) { err = 'no build'; continue; }
      if (grp.userData.error) err = grp.userData.error;
      grp.updateMatrixWorld(true);
      grp.traverse((o) => {
        if (!o.isMesh) return;
        const mm = Array.isArray(o.material) ? o.material[0] : o.material, col = mm.color ? mm.color.getHex() : 0;
        const k = ((mm.userData && mm.userData.family) || '') + '|' + (mm.map ? 'DECAL' : (rev[col] || '#' + col.toString(16).padStart(6, '0')));
        parts[k] = (parts[k] || 0) + area(o) / nv;
      });
      INSTANCES.length = 0;
    }
    out.push({ key: A.key, culture: A.culture, type: A.type, tier: A.tier, parts, err });
  }
  globalThis.__AUDIT = out;
})();`;
vm.runInContext(src, g, { filename: 'catalog-audit.js' });
const pieces = g.__AUDIT;
if (jsonOut) { fs.writeFileSync(jsonOut, JSON.stringify(pieces)); console.log('wrote', jsonOut, pieces.length, 'pieces'); }

const fam = {};
for (const p of pieces) {
  const seen = new Set();
  for (const k in p.parts) {
    const [f, key] = k.split('|'), F = fam[f] || (fam[f] = { m2: 0, pieces: 0, keys: {} });
    F.m2 += p.parts[k];
    F.keys[key] = (F.keys[key] || 0) + 1;
    if (!seen.has(f)) { seen.add(f); F.pieces++; }
  }
}
const total = Object.values(fam).reduce((s, F) => s + F.m2, 0), errs = pieces.filter(p => p.err);
console.log(pieces.length + ' pieces, ' + total.toFixed(0) + ' m2' + (errs.length ? ', ' + errs.length + ' with build errors' : ''));
console.log('family\tm2\t%\tpieces\ttop palette keys (pieces using each)');
for (const [f, F] of Object.entries(fam).sort((x, y) => y[1].pieces - x[1].pieces)) {
  const top = Object.entries(F.keys).filter(e => e[0][0] !== '#').sort((x, y) => y[1] - x[1]).slice(0, 8).map(e => e[0] + ' ' + e[1]).join(', ');
  console.log([f || '(none)', F.m2.toFixed(0), (100 * F.m2 / total).toFixed(1), F.pieces, top].join('\t'));
}
