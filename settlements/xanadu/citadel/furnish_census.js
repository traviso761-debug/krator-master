#!/usr/bin/env node
/* Erewhon's citadel furnished headlessly: every room of the citadel's set items (kits/interiors/sets/xanadu-citadel.js: the
   Sultan's Palace, the Vizier's palace, the officers' and envoys' houses, the barracks, the temple, the kitchens) and of the
   Garden Pleasure Dome (sets/xanadu.js xa_pleasure_dome), planned and furnished as the Erewhon page does it
   (settlements/xanadu/src/89y-xa-interiors.js: KFURN -> IX.sets.furnish, seed 0, the whole catalog), with no page and no GPU.

     node settlements/xanadu/citadel/furnish_census.js              per room: kind, m2, pieces, the keys; then the checks
     node settlements/xanadu/citadel/furnish_census.js --brief      one line per building
     node settlements/xanadu/citadel/furnish_census.js --assert     exit 1 when a check fails
     node settlements/xanadu/citadel/furnish_census.js --json f     the census as JSON

   The checks (FURNISHING.md, "Checks"):
     audit     IX.audit on every room: every piece inside, clear of the others and of the doors, every piece reached
     hem       every wall hanging (a wall-anchored banner, tapestry, wall rug or art) has its lowest drawn point at least
               HEM m over its floor in a room whose clear height allows it (the owner, 2026-11-16: "make sure wall hangings
               dont wind up near ground, this has been a recurring issue"), measured on the built piece
     float     every floor piece's lowest drawn point is on its floor (within 2 cm); every surface piece stands on a host
     required  every piece a room's kind requires is placed; the residence rule holds
     zfight    no piece a citadel room takes has two parts with coplanar, same-facing, overlapping faces
   A page verify (settlements/xanadu verify.py, KRATOR_GL=gpu) is still the proof of what is drawn; this is the fast loop. */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..', '..', '..');
const AT = require(path.join(ROOT, 'core', 'catalog', 'catalog-files.js'));
const CAT = path.join(ROOT, 'kits', 'catalog') + path.sep;
const args = process.argv.slice(2), has = f => args.indexOf(f) >= 0;
const jsonOut = has('--json') ? args[args.indexOf('--json') + 1] : null;
const HEM = 1.0;

/* a page-less context: three.js, a canvas that paints nothing, a scene that keeps nothing (tools/textures/audit_catalog.js) */
const ctx2d = new Proxy({}, { get: (t, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} });
  if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
  return typeof k === 'string' ? () => {} : undefined;
}, set: () => true });
const g = { console: { log: console.log, warn() {}, error: console.error } };
for (const k of Object.getOwnPropertyNames(globalThis)) if (!(k in g)) g[k] = globalThis[k];
g.self = g; g.window = g; g.globalThis = g;
g.document = { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx2d, addEventListener() {} }) };
vm.createContext(g);
const run = (src, name) => vm.runInContext(src, g, { filename: name });
run(fs.readFileSync(CAT + 'three.min.js', 'utf8'), 'three.min.js');
const files = ['krator-furniture-core.js', 'krator-symbols.js', 'krator-furniture-kit.js', 'krator-master-furniture.js']
  .concat(fs.readdirSync(CAT).filter(f => f.startsWith('krator-master-furniture-') && f.endsWith('.js')).sort());
run('var scene = { add() {}, remove() {} };\n' + files.map(f => fs.readFileSync(AT(f), 'utf8')).join('\n;\n'), 'catalog.js');
const IXS = path.join(ROOT, 'kits', 'interiors');
run(fs.readdirSync(path.join(IXS, 'src')).filter(f => /\.js$/.test(f) && f < '50').sort().map(f => fs.readFileSync(path.join(IXS, 'src', f), 'utf8')).join('\n;\n'), 'interiors-core.js');
run(fs.readFileSync(path.join(IXS, 'adapters', 'runtime-adapter.js'), 'utf8'), 'runtime-adapter.js');
for (const s of ['xanadu.js', 'xanadu-citadel.js']) run(fs.readFileSync(path.join(IXS, 'sets', s), 'utf8'), s);

/* the pieces of the citadel section of the Xanadu culture file (2026-11-16): the zfight check fails on these; the older pieces a
   citadel room takes are reported, not failed (they are other sets' pieces) */
const XSRC = fs.readFileSync(CAT + 'krator-master-furniture-xanadu.js', 'utf8'), XSEC = XSRC.slice(XSRC.indexOf("Erewhon's citadel: the Sultan's court"));
const NEWKEYS = (XSEC.match(/key: '(xanadu_[a-z_]+)'/g) || []).map(s => s.slice(6, -1));
const WHERE = has('--where') ? args[args.indexOf('--where') + 1] : null;
const out = run(`const NEWKEYS = ${JSON.stringify(NEWKEYS)}, WHERE = ${JSON.stringify(WHERE)};
(function () {
  const IX = KratorInteriors, HEM = ${HEM};
  /* the catalog adapter's four calls over the registry (adapters/catalog-adapter.js), built pieces measured once */
  const meas = {};
  function measure(key, v) {
    const k = key + '|' + v; if (meas[k]) return meas[k];
    const grp = buildFurn(key, 0, 0, 0, { variant: v, seed: 1, y: 0, wealth: 0.9 });
    const box = new THREE.Box3(); let lowCloth = Infinity, top = null;
    if (grp) { grp.updateMatrixWorld(true); box.setFromObject(grp);
      if (FURN_BY_KEY[key].anchor !== 'surface') top = IX.measureTop(grp, entryDims(FURN_BY_KEY[key], v));
      INSTANCES.length = 0; }
    return meas[k] = { lo: grp ? box.min.y : 0, hi: grp ? box.max.y : 0, top: top };
  }
  let cache = null;
  const C = {
    name: 'census', list: function () {
      if (cache) return cache;
      return cache = FURNS.map(function (A) { return { key: A.key, name: A.name, culture: A.culture, type: A.type, setting: A.setting, rooms: A.rooms.slice(),
        anchor: A.anchor || 'floor', clearance: A.clearance || {}, tier: A.tier, wealth: A.wealth ? A.wealth.slice() : undefined, role: IX.guessRole(A),
        variants: A.variants || 1, surface: A.surface !== false, stretch: !!A.stretch }; }); },
    dims: function (key, v) { return entryDims(FURN_BY_KEY[key], v); },
    top: function (key, v) { return measure(key, v | 0).top; },
    anchorY: function (key, v, at) { return furnAnchorY(FURN_BY_KEY[key], v, at); },
    build: function (p) { return p; }
  };
  const S1 = IX.sets.byName['xanadu-citadel'], S0 = IX.sets.byName['xanadu'];
  const items = S1.items.filter(function (it) { return !it.skip; }).concat([S0.byKey['xa_pleasure_dome']]);
  const HUNG = ['banner', 'art'], where = [];
  const res = [];
  for (const it of items) {
    const r = IX.sets.furnish(it, 0, 0, 0, C, { baseY: 0, seed: 0, prefix: it.key + '.' });
    const B = { key: it.key, name: it.name, rooms: [], residence: r.residence ? (r.residence.fails || []).map(String) : [] };
    for (const R of r.inst.rooms) {
      const P = r.plans[R.id]; if (!P) continue;
      const fy = R.y == null ? 0 : R.y, ceil = fy + (R.h == null ? 3 : R.h), keys = {};
      const audit = IX.audit(R, P, C), hems = [], floats = [];
      for (const p of P.placements) {
        keys[p.key] = (keys[p.key] || 0) + 1;
        if (WHERE && p.key === WHERE) where.push({ room: R.id, x: Math.round(p.x * 100) / 100, z: Math.round(p.z * 100) / 100, ry: Math.round(p.ry * 1000) / 1000, poly: R.poly });
        const A = FURN_BY_KEY[p.key], m = measure(p.key, p.variant | 0), lo = p.y + m.lo - fy;
        if (A.anchor === 'wall' && HUNG.indexOf(A.type) >= 0 && (ceil - fy) >= m.hi - m.lo + HEM + 0.3 && lo < HEM - 1e-3) hems.push({ key: p.key, hem: Math.round(lo * 100) / 100 });
        if ((A.anchor || 'floor') === 'floor' && Math.abs(lo) > 0.02) floats.push({ key: p.key, lo: Math.round(lo * 100) / 100 });
        if (A.anchor === 'surface' && !p.host) floats.push({ key: p.key, lo: 'no host' });
      }
      let area = 0; for (let i = 0; i < R.poly.length; i++) { const a = R.poly[i], b = R.poly[(i + 1) % R.poly.length]; area += a[0] * b[1] - b[0] * a[1]; } area = Math.abs(area) / 2;
      B.rooms.push({ id: R.id, kind: R.kind, wealth: R.wealth, area: area, h: R.h, pieces: P.placements.length, keys: keys,
        missing: (P.report.missing || []).map(function (m) { return m.need + ':' + m.reason; }), audit: audit.ok ? [] : audit.fails.map(String).slice(0, 4), hems: hems, floats: floats });
    }
    res.push(B);
  }
  /* zfight: every piece a citadel room can take (rooms list an xc_ kind), every variant, built alone: two faces of different
     parts that lie in one plane, face the same way and overlap would flicker (z-fighting). Faces back to back (a box on a box)
     face opposite ways and are hidden, so they are not counted */
  const zf = [];
  const r2 = function (x) { return Math.round(x * 100) / 100; };
  function mb(m) { const B = new THREE.Box3().setFromObject(m); return [r2(B.min.x), r2(B.min.y), r2(B.min.z), r2(B.max.x), r2(B.max.y), r2(B.max.z)].join(' '); }
  function tris(g) {
    const out = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    let mi = 0;
    g.updateMatrixWorld(true);
    g.traverse(function (m) { if (!m.isMesh) return; const id = mi++, p = m.geometry.attributes.position, ix = m.geometry.index, n = ix ? ix.count : p.count;
      for (let i = 0; i + 2 < n; i += 3) {
        a.fromBufferAttribute(p, ix ? ix.getX(i) : i).applyMatrix4(m.matrixWorld); b.fromBufferAttribute(p, ix ? ix.getX(i + 1) : i + 1).applyMatrix4(m.matrixWorld);
        c.fromBufferAttribute(p, ix ? ix.getX(i + 2) : i + 2).applyMatrix4(m.matrixWorld);
        const nn = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)), ar = nn.length() / 2; if (ar < 1e-5) continue; nn.normalize();
        if (nn.y < -0.99 && Math.max(a.y, b.y, c.y) < 0.01) continue;   /* a face down on the floor is never seen */
        out.push({ m: id, box: mb(m), n: nn, d: nn.dot(a), v: [a.clone(), b.clone(), c.clone()], ar: ar }); } });
    return out;
  }
  function overlap2(A, B, n) {   /* triangles in one plane: project on its two widest axes, strict interior or proper crossing */
    const ax = Math.abs(n.x) > Math.abs(n.y) && Math.abs(n.x) > Math.abs(n.z) ? ['y', 'z'] : Math.abs(n.y) > Math.abs(n.z) ? ['x', 'z'] : ['x', 'y'];
    const P = A.v.map(function (q) { return [q[ax[0]], q[ax[1]]]; }), Q = B.v.map(function (q) { return [q[ax[0]], q[ax[1]]]; });
    const cr = function (o, p, q) { return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]); }, E = 1e-6;
    const inside = function (pt, T) { const s1 = cr(T[0], T[1], pt), s2 = cr(T[1], T[2], pt), s3 = cr(T[2], T[0], pt);
      return (s1 > E && s2 > E && s3 > E) || (s1 < -E && s2 < -E && s3 < -E); };
    const cen = function (T) { return [(T[0][0] + T[1][0] + T[2][0]) / 3, (T[0][1] + T[1][1] + T[2][1]) / 3]; };
    if (inside(cen(P), Q) || inside(cen(Q), P)) return true;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const p1 = P[i], p2 = P[(i + 1) % 3], q1 = Q[j], q2 = Q[(j + 1) % 3];
      const d1 = cr(p1, p2, q1), d2 = cr(p1, p2, q2), d3 = cr(q1, q2, p1), d4 = cr(q1, q2, p2);
      if (((d1 > E && d2 < -E) || (d1 < -E && d2 > E)) && ((d3 > E && d4 < -E) || (d3 < -E && d4 > E))) return true; }
    return false;
  }
  for (const A of FURNS) {
    if (!A.rooms.some(function (r) { return /^xc_/.test(r); })) continue;
    for (let v = 0; v < (A.variants || 1); v++) {
      const g = buildFurn(A.key, 0, 0, 0, { variant: v, seed: 1, y: 0, wealth: 0.9 }); if (!g) continue;
      const T = tris(g), buck = {}; INSTANCES.length = 0;
      for (const t of T) { const k = [Math.round(t.n.x * 200), Math.round(t.n.y * 200), Math.round(t.n.z * 200), Math.round(t.d * 500)].join(','); (buck[k] = buck[k] || []).push(t); }
      let hit = null;
      for (const k in buck) { const L = buck[k]; if (L.length < 2) continue;
        for (let i = 0; i < L.length && !hit; i++) for (let j = i + 1; j < L.length && !hit; j++)
          if (L[i].m !== L[j].m && Math.abs(L[i].d - L[j].d) < 1e-3 && L[i].n.dot(L[j].n) > 0.9999 && overlap2(L[i], L[j], L[i].n)) hit = { p: L[i].v[0], why: 'n ' + [L[i].n.x, L[i].n.y, L[i].n.z].map(r2).join(',') + ' parts [' + L[i].box + '] [' + L[j].box + ']' };
        if (hit) break; }
      if (hit) zf.push({ key: A.key, variant: v, at: [hit.p.x, hit.p.y, hit.p.z].map(function (x) { return Math.round(x * 1000) / 1000; }), why: hit.why, mine: NEWKEYS.indexOf(A.key) >= 0 });
    }
  }
  return JSON.stringify({ res: res, zf: zf, where: where });
})()`, 'census.js');
const OUT = JSON.parse(out), res = OUT.res;
if (WHERE) for (const w of OUT.where) console.log('WHERE ' + WHERE + ' in ' + w.room + ' at ' + w.x + ', ' + w.z + ' ry ' + w.ry + ' poly ' + JSON.stringify(w.poly));
let fails = 0, rooms = 0, pieces = 0;
for (const B of res) {
  const n = B.rooms.reduce((a, r) => a + r.pieces, 0); pieces += n; rooms += B.rooms.length;
  console.log(`\n${B.key} (${B.name}): ${B.rooms.length} rooms, ${n} pieces`);
  for (const r of B.rooms) {
    const bad = r.audit.length + r.hems.length + r.floats.length + r.missing.length; fails += bad;
    if (has('--brief') && !bad) continue;
    const a = r.area == null ? '' : Math.round(r.area) + ' m2, ';
    console.log(`  ${r.id} [${r.kind}] ${a}${r.pieces} pieces${r.missing.length ? '  MISSING ' + r.missing.join(' ') : ''}`);
    if (!has('--brief')) console.log('    ' + Object.keys(r.keys).sort().map(k => k.replace(/^xanadu_/, '') + (r.keys[k] > 1 ? ' x' + r.keys[k] : '')).join(', '));
    for (const f of r.audit) console.log('    AUDIT ' + f);
    for (const h of r.hems) console.log(`    HEM ${h.key} at ${h.hem} m (under ${HEM})`);
    for (const f of r.floats) console.log(`    FLOAT ${f.key} ${f.lo}`);
  }
}
console.log('\nzfight: ' + (OUT.zf.length ? OUT.zf.length + ' piece variants with coplanar overlapping faces' : 'no coplanar overlapping faces in any citadel piece'));
for (const z of OUT.zf) { if (z.mine) fails++; console.log((z.mine ? '  ZFIGHT ' : '  (older piece, reported) ') + z.key + ' v' + z.variant + ' at ' + z.at.join(', ') + (z.mine ? '  ' + z.why : '')); }
console.log(`\n${res.length} buildings, ${rooms} rooms, ${pieces} pieces; ${fails} check failures`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(res, null, 1));
if (has('--assert') && fails) process.exit(1);
