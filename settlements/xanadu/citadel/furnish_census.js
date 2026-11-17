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
     signature each room the plan names (FURNISHING.md) holds its signature pieces
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

const out = run(`(function () {
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
  const HUNG = ['banner', 'art'];
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
  return JSON.stringify(res);
})()`, 'census.js');
const res = JSON.parse(out);
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
console.log(`\n${res.length} buildings, ${rooms} rooms, ${pieces} pieces; ${fails} check failures`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(res, null, 1));
if (has('--assert') && fails) process.exit(1);
