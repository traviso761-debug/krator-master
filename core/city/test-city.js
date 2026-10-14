// node core/city/test-city.js [--write] — core/city on a small synthetic site, each check with a negative that must fail.
// The site: 520 m square of gently sloping ground with a pond and a steep knoll, a wall down its east side, a park and a
// market, two avenues crossing and a ring round the park. The world's steps 0-5 (test's own), the builder's 6-12
// (core/city), then: no two standing footprints overlap; nothing stands on a street, the wall or in water; the placement
// hash is golden.json's (--write rewrites it after a meant change); a city drawn from core/rand (rand 'krand') has its own
// golden hash and reruns the same; two cities on one page give what each gives alone; the export carries the wall;
// the index finds a wide footprint the old 40 m probe missed; Erewhon's stance; core/tags registration.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'].forEach(load);
const CITY = fs.readdirSync(__dirname).filter(f => /^\d\d-city-.*\.js$/.test(f) && !/host/.test(f)).sort();
CITY.forEach(f => load('core/city/' + f));
const WRITE = process.argv.includes('--write');
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };

// ---------------------------------------------------------------- the synthetic world
const POND = [-90, 70], KNOLL = [150, 140];
function ground(x, z) {
  let h = 3 + 0.004 * x - 0.002 * z + 1.5 * Math.exp(-((x - 60) ** 2 + (z + 80) ** 2) / 4000);
  const dp = Math.hypot(x - POND[0], z - POND[1]); if (dp < 45) h -= 6 * (1 - dp / 45) ** 0.6 + 0.1;
  const dk = Math.hypot(x - KNOLL[0], z - KNOLL[1]); if (dk < 30) h += 18 * (1 - dk / 30);
  return h;
}
const KIT = { hall: [24, 18, 12], manor: [20, 22, 10], house_r: [12, 14, 9], house_r2: [11, 12, 9], house_m: [9, 10, 7], house_m2: [8, 12, 7],
  house_p: [6, 7, 5], house_p2: [5, 8, 5], shop: [8, 9, 6], tavern: [10, 12, 7], ware: [14, 18, 8] };
const dims = (key, v) => KIT[key] ? { key, v: v || 0, w: KIT[key][0], d: KIT[key][1], h: KIT[key][2] } : null;
const tune = () => ({
  cell: 2.5, rasterHalf: 260, maxSlope: 0.35,
  width: { avenue: 12, main: 8, side: 5.5, alley: 3, highway: 10, lane: 4.5 },
  lot: { side: 1.6, setback: 1.4, rear: 3, inset: 1.0, step: 3 },
  classes: { manor: [['manor', 0]], rich: [['house_r', 0], ['house_r2', 0]], middle: [['house_m', 0], ['house_m2', 0]], poor: [['house_p', 0], ['house_p2', 0]],
    shop: [['shop', 0]], tavern: [['tavern', 0]], industrial: [['ware', 0]] },
  fallback: { manor: 'rich', rich: 'middle', middle: 'poor', shop: 'poor', tavern: 'shop', industrial: 'poor', poor: null },
  civic: [{ key: 'hall', v: 0, near: 'market' }, { key: 'hall', v: 0, near: 'gate' }], civicSpacing: 120,
  voidMax: 40, voidIters: 12, voidBatch: 8, sideSpacing: 48, sideMax: 200, alleyFrac: 0.25, blindMax: 90, interiorDepth: 9, interiorRounds: 3,
  plazaArt: { rich: ['statue'], middle: ['fountain'], poor: ['fountain'], commerce: ['fountain'] }, mapHalf: 260
});
const ZONE = [[-240, -240], [240, -240], [240, 240], [-160, 240], [-240, 160]];
const WALL = [[226, -240], [228, -80], [224, 60], [228, 240]];
const PARK = [[-150, -150], [-90, -160], [-80, -100], [-140, -90]], MARKET = [[60, 60], [110, 60], [110, 100], [60, 100]];
function worldSteps() {
  const S = [];
  S.push({ name: 'the ground and the raster', run() {
    const R = SL.R = new Raster(TUNE.rasterHalf, TUNE.cell), ms2 = TUNE.maxSlope ** 2; R.occ.fill(OCC.OUT);
    R.eachInPoly(ZONE, (k, i, j) => { const x = R.cx(i), z = R.cx(j), h = CG.base(x, z); if (h <= 0.6) return;
      const gx = (CG.base(x + 5, z) - CG.base(x - 5, z)) / 10, gz = (CG.base(x, z + 5) - CG.base(x, z - 5)) / 10; if (gx * gx + gz * gz > ms2) return; R.occ[k] = OCC.FREE; });
    const mid = SL.items('middle').map(it => it.d + TUNE.lot.setback + TUNE.lot.rear);
    SL.minSpacing = Math.min.apply(null, mid) + TUNE.width.main / 2 + TUNE.width.side / 2;
    PLAN.zone = ZONE; SL.note(0, 'synthetic site'); } });
  S.push({ name: 'landmarks', run() { const o = obb([-20, -170], [1, 0], 14, 10);
    const L = { id: PLAN.lots.length, cls: 'landmark', role: 'temple', key: 'hall', v: 0, slot: 0, wealth: 1, x: -20, z: -170, y: CG.pad(o), ry: 0, w: 28, d: 20, h: 12, lot: o, bo: o, way: -1, side: 0, s: 0, born: 1, died: null, civic: true };
    PLAN.lots.push(L); SL.hashLot(L); SL.register(L); PLAN.landmarks.push(L); SL.R.stampPoly(obbCorners(obb(o.c, o.u, o.hw + 3, o.hd + 3)), OCC.HARD, L.id); } });
  S.push({ name: 'the wall', run() { const R = SL.R;
    for (let i = 1; i < WALL.length; i++) R.eachNearSeg(WALL[i - 1], WALL[i], 7, k => { R.occ[k] = OCC.OUT; R.own[k] = -1; });
    PLAN.wallRec = { line: WALL, nodes: [{ kind: 'gate', name: 'East Gate', x: 225, z: 0, health: 2 }], segs: [{ ax: 226, az: -240, bx: 228, bz: 240, health: 2 }] };
    PLAN.gates = [{ p: [225, 0], dir: 'E' }]; } });
  S.push({ name: 'districts', run() { SL.R.stampPoly(PARK, OCC.GREEN, -1); SL.R.stampPoly(MARKET, OCC.HARD, -1);
    PLAN.districts.push({ kind: 'park', poly: PARK, born: 3, art: [] }, { kind: 'market', poly: MARKET, born: 3, art: [] }); } });
  S.push({ name: 'avenues and gates', run() {
    SL.addWay('avenue', [[-238, 6], [-60, 0], [80, -8], [238, 0]], 4, { tag: 'east-west' });
    SL.addWay('avenue', [[4, -238], [0, -40], [-6, 120], [0, 238]], 4, { tag: 'north-south' });
    SL.addWay('avenue', offsetConvex(PARK, 14, 6), 4, { closed: true, tag: 'ring park' }); } });
  S.push({ name: 'highways', run() { SL.note(5, 'no highways'); } });
  return S;
}
// the builder (6-12) on the test world: civic by a `near` rule, avenue lots, main streets across the voids, then 9-12
function builderSteps() {
  return [
    { name: 'civic buildings', run() { const it = SL.dims('hall', 0), gate = PLAN.gates[0].p, mk = polyCentroid(MARKET);
      TUNE.civic.forEach(C => { const target = C.near === 'gate' ? gate : mk, cands = [];
        PLAN.ways.forEach(w => { if (w.cls !== 'avenue') return; for (let s = 12; s < w.F.len - 12; s += 8) [-1, 1].forEach(side => cands.push({ w, s, side, sc: V.dist(w.F.at(s), target) })); });
        cands.sort((a, b) => a.sc - b.sc);
        for (const c of cands.slice(0, 300)) { if (PLAN.civics.some(L => Math.hypot(L.x - c.w.F.at(c.s)[0], L.z - c.w.F.at(c.s)[1]) < TUNE.civicSpacing)) continue;
          const L = SL.tryLot(c.w, c.side, c.s, it, 6, 'civic', { wealth: 1, padded: true }); if (!L.fail) { L.role = C.key; PLAN.civics.push(L); break; } } }); } },
    { name: 'avenue lots', run() { SL.pass7(); } },
    { name: 'main streets', run() {   /* routed between the avenues across each quarter, then across what voids are left */
      const opt = { lotK: 9, spK: 16, wobK: 0.9, cross: 3, hw: 1.25 }, ew = PLAN.ways[0], ns = PLAN.ways[1];
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(q => { const a = ew.F.at(ew.F.nearest([q[0] * 120, 0]).s), b = ns.F.at(ns.F.nearest([0, q[1] * 120]).s);
        const pts = SL.route(a, b, ew.id, ns.id, Object.assign({ ring: (x, z) => 120 }, opt, { margin: 160 })); if (pts) SL.addWay('main', pts, 8, { tag: 'quarter ' + q }); });
      SL.infillMains(8, opt, { voidMax: TUNE.voidMax, iters: TUNE.voidIters }); } },
    { name: 'main-street lots', run() { SL.pass9(); } },
    { name: 'side streets', run() { SL.pass10(); } },
    { name: 'side-street lots, alley entrances', run() { SL.pass11(); } },
    { name: 'alleys and alley lots', run() { SL.pass12(); } }
  ];
}
const wealthRule = p => clamp(0.75 - Math.hypot(p[0] + 120, p[1] + 120) / 500 + 0.1 * slFbm(p[0] / 90, p[1] / 90, 2), 0, 1);
function city(o) {
  o = o || {};
  return KCITY.create(Object.assign({ tune: tune(), seed: 11, ground: { h: ground }, kit: { dims }, rules: { wealth: wealthRule },
    steps: worldSteps().concat(builderSteps()) }, o));
}

// ---------------------------------------------------------------- the checks' tools
const standing = P => P.lots.filter(L => L.died == null && L.bo);
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h.toString(16); };
const placeHash = P => fnv(JSON.stringify([P.lots.map(L => [L.key, L.x, L.z, L.ry, L.w, L.d, L.died]), P.ways.map(w => w.pts)]));
function overlaps(P, eps) { const S = standing(P), I = KSPACE.create({ cell: 40 }); let n = 0;
  S.forEach(L => I.insert(L, L.x, L.z, Math.hypot(L.bo.hw, L.bo.hd)));
  S.forEach(A => I.query(A.x, A.z, Math.hypot(A.bo.hw, A.bo.hd)).forEach(B => { if (B.id > A.id && SL.pen(A.bo, B.bo) > eps) n++; })); return n; }
// the smallest distance between a footprint and a segment (0 when they cross)
function obbSegDist(o, a, b) { const C = obbCorners(o); let d = Infinity;
  if (inPoly(a, C) || inPoly(b, C)) return 0;
  for (let i = 0; i < 4; i++) { const p = C[i], q = C[(i + 1) % 4]; d = Math.min(d, segDist(p, a, b), segDist(q, a, b), segDist(a, p, q), segDist(b, p, q));
    const den = (q[0] - p[0]) * (b[1] - a[1]) - (q[1] - p[1]) * (b[0] - a[0]);
    if (den) { const t = ((a[0] - p[0]) * (b[1] - a[1]) - (a[1] - p[1]) * (b[0] - a[0])) / den, u = ((a[0] - p[0]) * (q[1] - p[1]) - (a[1] - p[1]) * (q[0] - p[0])) / den; if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return 0; } }
  return d; }
// on a street: a footprint reaching into a street's carriageway past the lot inset (TUNE.lot.inset, 1 m: the raster's
// tolerance, a lot's corner may touch the kerb by that much), or an alley's centreline running through a footprint
// (the method routes alleys on the raster's cells round the lots: a 3 m alley may brush a wall, never cross a house)
function onStreets(P, brush) { let n = 0; standing(P).forEach(L => { if (L.cls === 'landmark') return;
  if (P.ways.some(w => { const tol = w.cls === 'alley' ? w.w / 2 : 1.0; let d = Infinity; for (let i = 1; i < w.pts.length; i++) d = Math.min(d, obbSegDist(L.bo, w.pts[i - 1], w.pts[i]));
    if (brush && d < w.w / 2 - 0.05) brush.n++; return d < w.w / 2 - tol; })) n++; }); return n; }
const onWall = P => standing(P).filter(L => WALL.some((p, i) => i && obbSegDist(L.bo, WALL[i - 1], p) < 3.5)).length;
const inWater = P => standing(P).filter(L => obbCorners(L.bo).concat([L.bo.c]).some(p => ground(p[0], p[1]) < 0)).length;

// ---------------------------------------------------------------- 1. a city on the synthetic site
const A = city(), P = A.run();
const S1 = standing(P), H1 = placeHash(P);
ok('the city builds: lots on every street class, side streets and alleys', S1.length > 150 && ['avenue', 'main', 'side', 'alley'].every(c => P.ways.some(w => w.cls === c)) && P.civics.length >= 1,
  standing({ lots: [] }).length === 0, S1.length + ' standing lots, ' + P.ways.length + ' ways, ' + P.civics.length + ' civic');
ok('no two standing footprints overlap (exact SAT, 0.1 m)', overlaps(P, 0.1) === 0, true, overlaps(P, 0.1) + ' pairs');
{ const brush = { n: 0 }, on = onStreets(P, brush); ok('nothing stands on a street', on === 0, true, on + ' on a carriageway; ' + brush.n + ' brush a kerb within the tolerance'); }
ok('nothing stands on the wall or in water', onWall(P) === 0 && inWater(P) === 0, true, onWall(P) + ' on the wall, ' + inWater(P) + ' in water');
// negatives of the three: a builder with the overlap test switched off overlaps; a lot pushed onto a street is seen
{ const B = city(), clash = SL.clash; B.bind(); SL.clash = () => null; const Q = B.run(); B.bind(); SL.clash = clash; KCITY.bind(A);
  const house = S1.find(L => L.cls !== 'landmark'), fake = { lots: [Object.assign({}, house, { bo: obb(P.ways[0].pts[5], [1, 0], 4, 4) })], ways: P.ways };
  const wet = { lots: [Object.assign({}, house, { bo: obb(POND, [1, 0], 4, 4) })] };
  ok('...and their negatives fail: no overlap test overlaps, a lot on a street and one in the pond are caught', overlaps(Q, 0.1) > 0 && onStreets(fake) === 1 && inWater(wet) === 1, true,
    overlaps(Q, 0.1) + ' overlapping pairs with SL.clash off'); }

// ---------------------------------------------------------------- 2. the golden hash, the KRAND city, two cities on a page
const K = city({ rand: 'krand', seed: 2026 }), PK = K.run(), HK = placeHash(PK);
const gold = { note: 'core/city: test-city.js writes these (--write); a change that moves a lot or a way changes them', sl: H1, krand: HK, lots: S1.length, krandLots: standing(PK).length };
const GOLD = path.join(__dirname, 'golden.json');
if (WRITE) fs.writeFileSync(GOLD, JSON.stringify(gold, null, 1) + '\n');
const G = fs.existsSync(GOLD) ? JSON.parse(fs.readFileSync(GOLD, 'utf8')) : {};
ok('the placement hash is golden.json\'s (SL streams and KRAND streams)', G.sl === H1 && G.krand === HK, HK !== H1, 'sl ' + H1 + ', krand ' + HK + (G.sl === H1 && G.krand === HK ? '' : '; golden ' + G.sl + ', ' + G.krand));
{ const H2 = placeHash(city().run()), HK2 = placeHash(city({ rand: 'krand', seed: 2026 }).run()), HK3 = placeHash(city({ rand: 'krand', seed: 2027 }).run());
  ok('deterministic: a rerun gives the same hash; another KRAND seed another city', H2 === H1 && HK2 === HK, HK3 !== HK, 'seed 2027 ' + HK3); }
{ const one = city(), two = city({ rand: 'krand', seed: 2026 }); one.run(); two.run(); const h1 = placeHash(one.plan), h2 = placeHash(two.plan);
  one.bind(); const n1 = standing(PLAN).length; two.bind(); const n2 = standing(PLAN).length;
  ok('two cities on one page: each gives what it gives alone, and binding swaps the globals', h1 === H1 && h2 === HK && n1 === S1.length && n2 === standing(PK).length,
    PLAN !== one.plan, n1 + ' and ' + n2 + ' lots'); }

// ---------------------------------------------------------------- 3. the export
{ A.bind(); let e = null, j = null; try { e = A.export(); j = JSON.parse(JSON.stringify(e)); } catch (err) { e = String(err); }
  const plainWall = (() => { try { const save = PLAN.wallRec; PLAN.wallRec = null; const r = KCITY.exportPlan().wall; PLAN.wallRec = save; return r; } catch (err) { return 'threw'; } })();
  ok('the export: plain JSON with the wall\'s records, every lot and way; a plan with no wall exports null, not a throw', j && j.wall && j.wall.line.length === WALL.length && j.lots.length === P.lots.length && j.ways.length === P.ways.length,
    plainWall === null, j ? j.lots.length + ' lots, ' + j.ways.length + ' ways, wall ' + j.wall.line.length + ' points' : String(e)); }

// ---------------------------------------------------------------- 4. the index: exact for any footprint size, two orders
{ const I = KCITY.boxIndex({ legacy: true, order: 'buckets' }), big = { id: 0, x: 0, z: 0, bo: obb([0, 0], [1, 0], 90, 20), died: null };
  I.add(big); const probe = obb([100, 0], [1, 0], 12, 6);
  const old = (() => { const gx = Math.floor(100 / 40), gz = 0; for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) { const L = I.legacy.get((gx + dx) + ',' + (gz + dz)); if (L && L.some(Q => SL.pen(probe, Q.bo) > 0.1)) return true; } return false; })();
  ok('the index finds a wide footprint the old 40 m probe missed (the wide-footprint clash, VC.clashWide folded in)', I.hit(probe) === big && I.stats.wide === 1, old === false, 'old probe: ' + old); }
{ const I = KCITY.boxIndex({ order: 'buckets' }), J = KCITY.boxIndex({ order: 'insertion' }), a = { id: 1, x: 85, z: 5, bo: obb([85, 5], [1, 0], 8, 8) }, b = { id: 2, x: 75, z: 5, bo: obb([75, 5], [1, 0], 8, 8) };
  [I, J].forEach(X => { X.add(a); X.add(b); }); const q = obb([80, 5], [1, 0], 3, 3);
  ok('the order: the first placed ("insertion"), or the old probe\'s cell order ("buckets", Voth\'s curve test)', J.hit(q) === a && I.hit(q) === b, I.hit(q) !== J.hit(q)); }
{ const I = KCITY.segIndex({ order: 'insertion' }), w1 = { id: 1, w: 6, pts: [[0, 0], [100, 0]] }, w2 = { id: 2, w: 6, pts: [[0, 20], [100, 20]] }; I.addWay(w1); I.addWay(w2);
  const n = I.near([50, 8], 10), far = I.near([50, 60], 10), sk = I.near([50, 8], 10, 1);
  ok('the road index: the nearest road edge within r (skipping a way by id), none past r', n && n.way === w1 && Math.abs(n.d - 5) < 1e-9 && sk && sk.way === w2 && Math.abs(sk.d - 9) < 1e-9, far === null); }

// ---------------------------------------------------------------- 5. Erewhon's stance, the ground predicate, the opt-in stance city
{ const slope = (x, z) => 0.2 * z, o = obb([0, 0], [1, 0], 5.5, 5.5);   // 11 m square on a 1 in 5 slope: corners pulled in 0.5 m sit at z = +-5
  const st = KCITY.stance(o, slope), steep = KCITY.stance(o, (x, z) => 2 * z), door = KCITY.stanceAtDoor(o, -1, slope, { cut: 6 }), cutBad = KCITY.stanceAtDoor(o, -1, slope, { cut: 1 });
  ok('Erewhon\'s stance: the base at the highest corner (+0.05), the footing to the lowest (+0.6); refused past maxDrop', st && Math.abs(st.y - 1.05) < 1e-9 && Math.abs(st.drop - 2.6) < 1e-9, steep === null,
    'y ' + (st && st.y) + ', drop ' + (st && st.drop));
  ok('stanceAtDoor: the floor at the door\'s level, the back cut into the rising ground at most `cut`', door && Math.abs(door.y + 0.95) < 1e-9 && Math.abs(door.drop - 0.65) < 1e-9, cutBad === null,
    'y ' + (door && door.y) + ', drop ' + (door && door.drop)); }
{ const D = city(); D.tune.stance = 'door'; D.tune.stanceOpt = { maxDrop: 1.2, cut: 1.0 }; const PD = D.run(), SD = standing(PD).filter(L => L.cls !== 'landmark' && L.way >= 0 && L.cls !== 'civic');
  const R = city({ rules: { wealth: wealthRule, groundOk: KCITY.reliefOk({ maxRelief: 0.6 }) } }), PR = R.run();
  const rel = L => { const s = KCITY.groundSpan(L.bo, ground, 0); return s.hi - s.lo; };
  ok('the stance city (opt-in): every street lot carries a drop and stands at its door\'s level; the ground predicate refuses steep lots',
    SD.length > 50 && SD.every(L => L.drop != null && L.drop <= 1.2 + 0.6 + 1e-9) && standing(PR).filter(L => L.way >= 0 && L.cls !== 'civic').every(L => rel(L) <= 0.6 + 1e-9),
    standing(PD).length < S1.length && standing(P).filter(L => L.way >= 0 && L.cls !== 'civic').some(L => rel(L) > 0.6),
    SD.length + ' stance lots (' + standing(PD).length + ' of ' + S1.length + ' standing), ' + standing(PR).length + ' with the relief rule'); }

// ---------------------------------------------------------------- 6. core/tags (opt-in)
{ const T = city({ tags: 'test-city' }), PT = T.run(), reg = T.tags, live = reg.query({}), st = standing(PT).filter(L => L.tag);
  ok('core/tags: every lot the builder places is registered before it is drawn; a knocked-out lot is removed',
    st.length === standing(PT).length && live.length === st.length && PT.lots.filter(L => L.died != null && L.tag).every(L => reg.get(L.tag).removed),
    placeHash(PT) === H1 && !A.tags, live.length + ' live records for ' + standing(PT).length + ' standing lots'); }

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
