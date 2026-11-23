// node core/city/test-hillside.js: the hillside strategy (37-city-hillside.js) on a made-up lake slope: the ground rising
// 30 % from the water to the north, a spur down its middle and a gully either side 25 m deep. Each check has a negative
// that must fail: the spine climbs from the landing to the plaza never steeper than its grade (it zigzags); the contour
// alleys keep near their contour and the stairs take the fall line; no way crosses the gullies' walls; the houses are
// dense, overlap nothing, stand on no way, and each fronts a way at its door; the same records twice, and one scope's
// edit moves nothing in another.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'].forEach(load);
fs.readdirSync(__dirname).filter(f => /^\d\d-city-.*\.js$/.test(f) && !/host/.test(f)).sort().forEach(f => load('core/city/' + f));
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------- the ground: the lake at z > 0, the slope rising north
const GULLY = 170;
const h = (x, z) => { const up = Math.max(0, -z), y = up * 0.30 + 18 * Math.exp(-Math.pow(x / 90, 2)) * sm(0, 60, up);
  return y - 25 * Math.exp(-Math.pow((Math.abs(x) - GULLY) / 16, 2)) * sm(0, 40, up); };
const slope = (x, z) => { const e = 1.5; return Math.hypot((h(x + e, z) - h(x - e, z)) / (2 * e), (h(x, z + e) - h(x, z - e)) / (2 * e)); };
const DIMS = { hs: { key: 'hs', v: 0, w: 6, d: 7, h: 5 }, hm: { key: 'hm', v: 0, w: 8, d: 8, h: 6 } };
const dims = (k, v) => DIMS[k] ? Object.assign({}, DIMS[k], { v: v | 0 }) : null;
const tune = { cell: 2, rasterHalf: 500, maxSlope: 1.2, exact: true, width: { avenue: 12, main: 8, side: 5.5, alley: 3, highway: 10, lane: 4 },
  lot: { side: 1.6, setback: 1.4, rear: 3, inset: 1.0, step: 3 }, classes: { middle: [['hm', 0]], poor: [['hs', 0]] }, fallback: { middle: 'poor', poor: null },
  stance: 'high', stanceOpt: { maxDrop: 7 } };
const POOLS = { poor: [['hs', 3], ['hm', 1]], middle: [['hm', 2], ['hs', 1]] };
const box = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

function laid(o) {
  o = o || {};
  const scopes = o.scopes || [{ id: 'spur', i: 0, j: 0, poly: box(-300, -480, 300, -12), foot: [0, -16], head: [0, -440], kind: 'poor' }];
  const steps = [
    { name: 'the ground', run() { const R = SL.R = new Raster(tune.rasterHalf, tune.cell); R.occ.fill(OCC.OUT);
      scopes.forEach(s => R.eachInPoly(s.poly, k => { R.occ[k] = OCC.FREE; }));
      SL.minSpacing = KCITY.site.minSpacing ? KCITY.site.minSpacing() : 0; } },
    { name: 'the hillside', run() { PLAN.hill = KCITY.strategies.hillside.run(scopes, Object.assign({ h, seed: 7101, pools: POOLS, gaps: { poor: [1, 2.5], middle: [1.5, 3] }, maxSlope: 0.9, spine: { grade: 0.2 } }, o.ctx || {})); } }];
  const C = KCITY.create({ name: 'hillside-test', tune, seed: 7101, rand: 'krand', index: { order: 'insertion' }, ground: { h }, kit: { dims }, steps });
  const plan = C.run();
  return { C, plan, hill: plan.hill };
}
const A = laid(), H = A.hill, P = A.plan;
const spine = H.ways[0], alleys = H.alleys, lots = H.lots.filter(L => L.died == null);
const legGrade = w => { let m = 0; for (let t = 0; t + 8 <= w.F.len; t += 2) { const a = w.F.at(t), b = w.F.at(t + 8); m = Math.max(m, Math.abs(h(b[0], b[1]) - h(a[0], a[1])) / 8); } return m; };   /* over each 8 m (a leg) */

// ---- 1. the spine
{ const f = spine.pts[0], t = spine.pts[spine.pts.length - 1], g = legGrade(spine);
  const B = laid({ ctx: { spine: { grade: 5 } } }).hill.ways[0], gB = legGrade(B);
  ok('the spine climbs from the landing to the plaza, its steepest leg within its grade (0.2): the slope is 0.30, so it zigzags',
    Math.hypot(f[0], f[1] + 16) < 1 && Math.hypot(t[0], t[1] + 440) < 13 && g <= 0.2 * 1.25 && spine.F.len > 1.3 * 424,
    gB > g + 0.05, 'steepest ' + g.toFixed(2) + ', length ' + Math.round(spine.F.len) + ' m for 424 m straight, ends at ' + t.map(Math.round) + '; with grade 5 it climbs ' + gB.toFixed(2)); }

// ---- 2. the alleys and stairs
{ const cont = alleys.filter(w => /contour/.test(w.tag)), stairs = alleys.filter(w => /stair/.test(w.tag));
  const endGrade = w => { const a = w.pts[1], b = w.pts[w.pts.length - 1], d = w.F.len; return Math.abs(h(b[0], b[1]) - h(a[0], a[1])) / Math.max(1, d); };
  const cg = cont.map(endGrade).sort((a, b) => a - b), sg = stairs.map(endGrade).sort((a, b) => a - b), med = a => a.length ? a[a.length >> 1] : 0;
  ok('contour alleys branch off the spine along the slope (their median end-to-end grade under 0.1), stairs down the fall line join them (median over 0.2)',
    cont.length >= 12 && stairs.length >= 6 && med(cg) < 0.1 && med(sg) > 0.2,
    med(sg) > 0.1, cont.length + ' contour alleys (median grade ' + med(cg).toFixed(3) + '), ' + stairs.length + ' stairs (' + med(sg).toFixed(2) + '), ' + alleys.filter(w => w.joined).length + ' joined to another way'); }

// ---- 3. no way crosses the gullies' walls (ground steeper than maxSlope 0.9)
{ const steep = R => R.ways.filter(w => { for (let s = 0; s < w.F.len; s += 1.5) { const p = w.F.at(s); if (slope(p[0], p[1]) > 0.95) return true; } return false; }).length;
  const n = steep(H), nB = steep(laid({ ctx: { maxSlope: 9 } }).hill);
  ok('no way crosses a gully\'s wall: every point of every way on ground no steeper than maxSlope (0.9)', n === 0, nB > 0,
    n + ' ways on steep ground; ' + nB + ' with maxSlope 9'); }

// ---- 4. the houses
{ const I = KSPACE.create({ cell: 30 }); let over = 0, onWay = 0, noDoor = 0;
  lots.forEach(L => I.insert(L, L.x, L.z, Math.hypot(L.bo.hw, L.bo.hd)));
  lots.forEach(L => I.query(L.x, L.z, Math.hypot(L.bo.hw, L.bo.hd)).forEach(M => { if (M.id > L.id && SL.pen(L.bo, M.bo) > 0.1) over++; }));
  const wayAt = p => { const o = A.C.raster.at(p[0], p[1]); return o === OCC.STREET || o === OCC.ALLEY; };
  KCITY.bind(A.C);
  const door = L => { const f = [Math.sin(L.ry), Math.cos(L.ry)]; for (let t = 0; t <= 6; t += 0.5) if (wayAt([L.x + f[0] * (L.d / 2 + t), L.z + f[1] * (L.d / 2 + t)])) return true; return false; };
  lots.forEach(L => { if (SL.streetHit(L.bo)) onWay++; if (!door(L)) noDoor++; });
  const flipped = lots.slice(0, 40).filter(L => !door(Object.assign({}, L, { ry: L.ry + Math.PI }))).length;
  const ha = 600 * 468 / 1e4, dens = lots.length / ha;
  ok('the houses: dense (over 12 a hectare of the scope), none overlapping, none on a way, each with its door on a way within 6 m',
    dens > 12 && over === 0 && onWay === 0 && noDoor <= lots.length * 0.03, flipped > 20,
    lots.length + ' houses, ' + dens.toFixed(1) + '/ha, ' + over + ' overlapping, ' + onWay + ' on a way, ' + noDoor + ' without a door; turned round, ' + flipped + ' of 40 lose theirs'); }

// ---- 5. the same records twice; one scope's edit moves nothing in another
{ const sig = R => JSON.stringify(R.hill.lots.map(L => [L.key, +L.x.toFixed(3), +L.z.toFixed(3), +L.ry.toFixed(4), L.court]));
  const two = poly => [{ id: 'west', i: 0, j: 0, poly: box(-300, -480, -160, -12), foot: [-230, -16], head: [-230, -440], kind: 'poor' },
    { id: 'east', i: 1, j: 0, poly, foot: [230, -16], head: [230, -440], kind: 'middle' }];
  const X = laid({ scopes: two(box(160, -480, 300, -12)) }), Y = laid({ scopes: two(box(160, -480, 290, -12)) });
  const west = R => JSON.stringify(R.hill.lots.filter(L => L.court === 'west').map(L => [+L.x.toFixed(3), +L.z.toFixed(3)]));
  const Z = laid({ scopes: two(box(160, -480, 300, -12)), ctx: { seed: 7102 } });
  ok('the same records on a second run; the east scope\'s edit moves nothing in the west', sig(laid()) === sig(A) && west(X) === west(Y) && west(X).length > 20,
    west(Z) !== west(X), X.hill.lots.filter(L => L.court === 'west').length + ' houses in the west, unmoved; another seed moves them'); }

// ---- 6. the basements and their doors from the podium (the owner, 2026-11-17)
{ const B = lots.filter(L => L.basement), D = B.filter(L => L.basement.door);
  const doorOk = L => { const d = L.basement.door, g = h(d.x, d.z); return Math.abs(d.y - g) < 0.7 && Math.abs(L.y - d.n * 2.9 - g) < 0.75; };
  const bad6 = D.filter(L => !doorOk(L)).length, shallow = lots.filter(L => L.basement && (L.y - Math.min(...obbCorners(L.bo).map(p => h(p[0], p[1])))) < 2.9 - 0.6 - 1e-6).length;
  const plain = { c: [0, -200], u: [1, 0], v: [0, 1], hw: 3, hd: 3 }, flat = (x, z) => 5;
  ok('basements carved where the footing is a storey deep, each door level with the ground on its face, a whole storey under the floor',
    B.length > 20 && D.length > 5 && bad6 === 0 && shallow === 0, KCITY.hillside.basement(plain, flat, 5.05) === null,
    B.length + ' basements, ' + D.length + ' with a door from the podium; on flat ground none'); }
// ---- 7. no basement door on the house's front, none before a stair, a path or another podium, none on uneven ground
{ KCITY.bind(A.C); const D = lots.filter(L => L.basement && L.basement.door);
  const front = D.filter(L => { const d = L.basement.door; return Math.sin(d.ry) * Math.sin(L.ry) + Math.cos(d.ry) * Math.cos(L.ry) > 0.5; }).length;
  const blocked = D.filter(L => KCITY.hillside.doorClear(L, L.basement.door, A.hill.ways)).length;
  const dropped = lots.filter(L => L.basement && L.basement.why), why = {}; dropped.forEach(L => { why[L.basement.why] = (why[L.basement.why] || 0) + 1; });
  /* a slope that is a storey under the floor along the face but falls away 1 m before the door: no door */
  const bo = { c: [0, 0], u: [1, 0], v: [0, 1], hw: 4, hd: 4 }, step = (x, z) => z > 4.2 ? -3.9 : z > 0 ? -2.9 : 0;
  const B1 = KCITY.hillside.basement(bo, (x, z) => z > 0 ? -2.9 : 0, 0), B2 = KCITY.hillside.basement(bo, step, 0);
  ok('no basement door on its house\'s front, before a stair, a path or another podium, or on ground not level before it',
    front === 0 && blocked === 0 && dropped.length > 0 && !!(B1 && B1.door), !(B2 && B2.door),
    D.length + ' doors kept, ' + dropped.length + ' dropped ' + JSON.stringify(why) + '; a door with the ground falling away before it is refused'); }

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
