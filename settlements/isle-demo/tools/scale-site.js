// node settlements/isle-demo/tools/scale-site.js [--kautoa 0.35] [--valapo auto|<s>] [--write]
// Scales the owner's town drawings (site/isle-site.json) down toward each town's harbour, keeping the districts' relations
// (owner, 2026-10-18: the ceremonial park was to be 2-3 times the palace, not 8; Kautoa at 0.35, Valapo on its own factor).
//   1. Every district vertex, marker and avenue point moves toward the anchor (the middle of the town's civilian harbour
//      district): p' = a + s (p - a). Buildings, avenue widths and landmarks keep their real size: only the drawing shrinks.
//   2. The coast is the world's and does not scale. A coastal piece (the harbour, military harbour and beach districts,
//      the salt works and quarries markers, and any avenue point that lay within COAST m of the shore) is put back on the
//      real shore: from its scaled place to the nearest shore point, then out or in by the distance it stood from the
//      shore before (so a strip keeps its width and a coast road its offset).
//   3. A scaled point of anything else that lands in the sea is pulled ashore (reported).
// Valapo 'auto': the factor that makes its build area a third of Kautoa's scaled one (the village a third of the town).
// The first --write keeps the owner's drawing as site/isle-site.full.json and always scales FROM it, so a rerun with
// another factor starts over. Reads the world's ground through dist/isle-city.plan.js (python3 build.py first).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), FULL = path.join(HERE, 'site', 'isle-site.full.json'), SITE = path.join(HERE, 'site', 'isle-site.json');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const WRITE = process.argv.includes('--write'), COAST = 300;
global.window = global;
vm.runInThisContext(fs.readFileSync(path.join(HERE, 'dist', 'isle-city.plan.js'), 'utf8'), { filename: 'isle-city.plan.js' });
ISLE.initWorld();
const src = JSON.parse(fs.readFileSync(fs.existsSync(FULL) ? FULL : SITE, 'utf8'));
const out = JSON.parse(JSON.stringify(src));
const area = P => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a / 2); };
const cen = P => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
const COASTAL_D = /^(harbor|military harbor|white sand beach)$/i, COASTAL_M = /^(SALT WORKS|QUARRIES)$/;
const zoneOf = T => T.districts.find(d => /^build (region|area)$/.test(d.name));
const scaleOf = {}, report = {};
scaleOf.Kautoa = +arg('--kautoa', 0.35);
{ const v = arg('--valapo', 'auto'), Ak = area(zoneOf(src.towns.Kautoa).poly) * scaleOf.Kautoa ** 2, Av = area(zoneOf(src.towns.Valapo).poly);
  scaleOf.Valapo = v === 'auto' ? +Math.sqrt(Ak / 3 / Av).toFixed(3) : +v; }
for (const town of ISLE.TOWNS) {
  const T = src.towns[town], O = out.towns[town], s = scaleOf[town], P = ISLE.PROG[town];
  const G = ISLE.townGround(T.frame, { half: P.half, cell: 10 }), h = G.h;
  /* the shore: grid points on land beside the sea, every 10 m, filed in 100 m buckets */
  const shore = [], B = new Map(), bk = (x, z) => Math.floor(x / 100) + ',' + Math.floor(z / 100);
  for (let z = -P.half; z <= P.half; z += 10) for (let x = -P.half; x <= P.half; x += 10)
    if (h(x, z) > 0 && (h(x + 10, z) <= 0 || h(x - 10, z) <= 0 || h(x, z + 10) <= 0 || h(x, z - 10) <= 0)) { const q = [x, z]; shore.push(q); (B.get(bk(x, z)) || B.set(bk(x, z), []).get(bk(x, z))).push(q); }
  const nearest = p => { for (let r = 1; r < 90; r++) { let best = null, bd = Infinity; const i0 = Math.floor(p[0] / 100), j0 = Math.floor(p[1] / 100);
    for (let j = j0 - r; j <= j0 + r; j++) for (let i = i0 - r; i <= i0 + r; i++) (B.get(i + ',' + j) || []).forEach(q => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = q; } });
    if (best && bd < r * 100) return { q: best, d: bd }; } return null; };
  const inland = q => { const g = [h(q[0] + 15, q[1]) - h(q[0] - 15, q[1]), h(q[0], q[1] + 15) - h(q[0], q[1] - 15)], l = Math.hypot(g[0], g[1]) || 1; return [g[0] / l, g[1] / l]; };
  const harbour = T.districts.find(d => /^harbor$/i.test(d.name)), c0 = cen(harbour.poly), a = (nearest(c0) || { q: c0 }).q;   /* the shore nearest the harbour's middle */
  const sc = p => [a[0] + s * (p[0] - a[0]), a[1] + s * (p[1] - a[1])];
  const coast = (p, d0) => { const p1 = sc(p), n = nearest(p1); if (!n) return p1; const u = inland(n.q); return [n.q[0] + u[0] * d0, n.q[1] + u[1] * d0]; };
  const signed = p => { const n = nearest(p); return n ? (h(p[0], p[1]) > 0 ? 1 : -1) * n.d : Infinity; };
  const R = report[town] = { scale: s, anchor: a.map(v => +v.toFixed(1)), snapped: 0, pulledAshore: 0, shorePoints: shore.length };
  const ashore = p => { if (h(p[0], p[1]) > 0.5) return p; const n = nearest(p); if (!n) return p; R.pulledAshore++; const u = inland(n.q); return [n.q[0] + u[0] * 15, n.q[1] + u[1] * 15]; };
  const r1 = p => [+p[0].toFixed(1), +p[1].toFixed(1)];
  O.districts = T.districts.map(d => Object.assign({}, d, { poly: d.poly.map(p => r1(COASTAL_D.test(d.name) ? (R.snapped++, coast(p, signed(p))) : (/^build/.test(d.name) ? sc(p) : ashore(sc(p))))) }));
  O.markers = T.markers.map(m => { const p = COASTAL_M.test(m.id) ? (R.snapped++, coast([m.x, m.z], signed([m.x, m.z]))) : ashore(sc([m.x, m.z])); return Object.assign({}, m, { x: +p[0].toFixed(1), z: +p[1].toFixed(1) }); });
  O.avenues = T.avenues.map(av => Object.assign({}, av, { pts: av.pts.map(p => { const d0 = signed(p); return r1(Math.abs(d0) < COAST ? (R.snapped++, coast(p, d0)) : ashore(sc(p))); }) }));
  O.scaled = { factor: s, anchor: R.anchor, from: 'site/isle-site.full.json', note: 'tools/scale-site.js: the drawing scaled toward the harbour, the coast snapped back to the shore (owner, 2026-10-18)' };
  const Z0 = zoneOf(T).poly, Z1 = zoneOf(O).poly, park = O.districts.find(d => /ceremonial park/.test(d.name));
  R.buildArea = { before: +(area(Z0) / 1e6).toFixed(2), after: +(area(Z1) / 1e6).toFixed(2) };
  if (park) { const xs = park.poly.map(p => p[0]), zs = park.poly.map(p => p[1]); R.park = Math.round(Math.max(...xs) - Math.min(...xs)) + ' x ' + Math.round(Math.max(...zs) - Math.min(...zs)) + ' m (bbox)'; }
}
console.log(JSON.stringify(report, null, 1));
if (WRITE) {
  if (!fs.existsSync(FULL)) fs.writeFileSync(FULL, fs.readFileSync(SITE, 'utf8'));
  let text = JSON.stringify(out, null, 1).replace(/\[\s*(-?[\d.eE+-]+),\s*(-?[\d.eE+-]+)\s*\]/g, '[$1, $2]');
  fs.writeFileSync(SITE, text + '\n');
  console.log('wrote site/isle-site.json (the owner\'s drawing kept as site/isle-site.full.json)');
}
