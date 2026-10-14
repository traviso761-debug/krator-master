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
  cell: 2.5, rasterHalf: 260, maxSlope: 0.35, exact: true,   /* the exact-streets rule (opt-in): no building reaches a street's carriageway */
  width: { avenue: 12, main: 8, side: 5.5, alley: 3, highway: 10, lane: 4.5 },
  lot: { side: 1.6, setback: 1.4, rear: 3, inset: 1.0, step: 3 },
  classes: { manor: [['manor', 0]], rich: [['house_r', 0], ['house_r2', 0]], middle: [['house_m', 0], ['house_m2', 0]], poor: [['house_p', 0], ['house_p2', 0]],
    shop: [['shop', 0]], tavern: [['tavern', 0]], industrial: [['ware', 0]] },
  fallback: { manor: 'rich', rich: 'middle', middle: 'poor', shop: 'poor', tavern: 'shop', industrial: 'poor', poor: null },
  civic: [{ key: 'hall', v: 0, near: 'market' }, { key: 'hall', v: 0, near: 'gate' }, { key: 'hall', v: 0, near: 'garrison' }], civicSpacing: 120,
  voidMax: 40, voidIters: 12, voidBatch: 8, sideSpacing: 48, sideMax: 200, alleyFrac: 0.25, blindMax: 90, interiorDepth: 9, interiorRounds: 3,
  avenueSnap: 90, ringGap: 8, verge: 7, wall: { towerGap: 110, clear: 28, gateFind: 170, thick: 7, gateTower: 14, gatePass: 4 },
  plazaArt: { rich: ['statue'], middle: ['fountain'], poor: ['fountain'], commerce: ['fountain'] }, mapHalf: 260
});
const ZONE = [[-240, -240], [240, -240], [240, 240], [-160, 240], [-240, 160]];
const WALL = [[226, -240], [228, -80], [224, 60], [228, 240]];
const PARK = [[-150, -150], [-90, -160], [-80, -100], [-140, -90]], MARKET = [[60, 60], [110, 60], [110, 100], [60, 100]];
// the site as a site editor saves it: districts (named and typed), markers, drawn avenues
const SITE = { districts: [{ name: 'Build zone', poly: ZONE }, { name: 'Park 1', type: 'park', poly: PARK }, { name: 'Market', type: 'market', poly: MARKET }],
  markers: [{ id: 'E', x: 232, z: 4 }, { id: 'I', x: -170, z: 70 }],
  avenues: [{ name: 'east-west', pts: [[-238, 6], [-60, 0], [80, -8], [150, 0]] }, { name: 'north-south', pts: [[4, -238], [0, -40], [-6, 120], [0, 238]] },
    { name: 'spur', pts: [[-200, 120], [-120, 110], [-70, 96]] }] };
const ROLES = KCITY.site.roles({ types: ['park', 'market', 'plaza'], names: [[/build ?zone/, 'zone'], [/^wall$/, 'wall']], other: 'misc' });
// the world's steps 0-5 on core/city's site layer (25-city-site.js)
function worldSteps() {
  const S = [];
  S.push({ name: 'the site and its ground', run() {
    const R = SL.R = new Raster(TUNE.rasterHalf, TUNE.cell); R.occ.fill(OCC.OUT);
    PLAN.site = SITE.districts.map((d, i) => ({ id: i, name: d.name, type: d.type, role: ROLES(d), poly: d.poly }));
    PLAN.zone = ZONE;
    const land = KCITY.site.zoneRaster(R, ZONE, { dry: 0.6, maxSlope: TUNE.maxSlope });
    SL.minSpacing = KCITY.site.minSpacing();
    SL.note(0, 'synthetic site, ' + land + ' cells of dry land'); } });
  S.push({ name: 'landmarks', run() {
    const fixed = (role, c, hw, hd) => { const o = obb(c, [1, 0], hw, hd);
      const L = { id: PLAN.lots.length, cls: 'landmark', role, key: 'hall', v: 0, slot: 0, wealth: 1, x: c[0], z: c[1], y: CG.pad(o), ry: 0, w: 2 * hw, d: 2 * hd, h: 12, lot: o, bo: o, way: -1, side: 0, s: 0, born: 1, died: null, civic: true };
      PLAN.lots.push(L); SL.hashLot(L); SL.register(L); PLAN.landmarks.push(L); SL.R.stampPoly(obbCorners(obb(o.c, o.u, o.hw + 3, o.hd + 3)), OCC.HARD, L.id); };
    fixed('temple', [-20, -170], 14, 10); const I = SITE.markers[1]; fixed('garrison', [I.x, I.z], 12, 9); } });
  S.push({ name: 'districts', run() { PLAN.site.forEach(d => {
    if (d.role === 'park') SL.R.stampPoly(d.poly, OCC.GREEN, -1); else if (d.role === 'market') SL.R.stampPoly(d.poly, OCC.HARD, -1);
    if (d.role !== 'zone') PLAN.districts.push({ kind: d.role, name: d.name, poly: d.poly, born: 2, art: [] }); }); } });
  S.push({ name: 'avenues', run() {
    const av = KCITY.site.avenues(SITE.avenues, 3, { snap: TUNE.avenueSnap });
    const rings = KCITY.site.ring(offsetConvex(PARK, TUNE.ringGap + TUNE.width.avenue / 2, 6), 3, 'ring Park 1');
    SL.note(3, av.made + ' avenues, ' + av.joins + ' joins, ' + rings + ' ring runs'); } });
  S.push({ name: 'highways', run() {
    const G = KCITY.site.highwayGrid({ c: 20, half: 700, h: ground }), zc = polyCentroid(ZONE), dir = [1, 0];
    const st = KCITY.site.farthest([].concat.apply([], SITE.avenues.map(a => a.pts)), zc, dir);
    const r = KCITY.site.highway(G, { from: st, centre: zc, dir, reach: 440 });
    let n = 0; if (r.pts) { const w = KCITY.site.layHighway(r.pts, 4, 'east', { verge: TUNE.verge }); SL.R.occ.forEach(c => { if (c === OCC.VERGE) n++; }); }
    PLAN.vergeCells = n; SL.note(4, r.pts ? 'the east highway, ' + n + ' verge cells' : 'no highway'); } });
  S.push({ name: 'the wall and its gates', run() {
    const T = TUNE.wall, ways = PLAN.ways.filter(w => w.cls === 'avenue' || w.cls === 'highway'), E = SITE.markers[0];
    const W = PLAN.wallRec = KCITY.site.wall(WALL, ways, { towerGap: T.towerGap, clear: T.clear, gateFind: T.gateFind, named: [{ x: E.x, z: E.z, marker: 'E', name: 'East Gate' }] });
    W.nodes.forEach(n => { n.gx = n.x; n.gz = n.z; if (n.kind === 'gate' && n.way) n.towerOff = ((TUNE.width[n.way.cls] || 10) + T.gatePass) / 2 + T.gateTower / 2; });
    W.segs = KCITY.site.wallSegs(W.nodes);
    KCITY.site.stampWall(W, { thick: T.thick, step: 5, gateTower: T.gateTower });
    PLAN.gates = W.gates.map(g => ({ p: [g.x, g.z], dir: g.name }));
    SL.note(5, W.gates.length + ' gates, ' + W.nodes.filter(n => n.kind === 'tower').length + ' towers, ' + W.segs.length + ' runs'); } });
  return S;
}
// the builder (6-12): core/city's defaults
const builderSteps = () => KCITY.defaultSteps().slice(6);
const wealthRule = p => clamp(0.75 - Math.hypot(p[0] + 120, p[1] + 120) / 500 + 0.1 * slFbm(p[0] / 90, p[1] / 90, 2), 0, 1);
function city(o) {
  o = o || {};
  return KCITY.create(Object.assign({ tune: tune(), seed: 11, ground: { h: ground }, kit: { dims }, rules: { wealth: wealthRule }, site: SITE,
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
// on a street: a footprint reaching into a street's carriageway (the exact-streets rule, TUNE.exact: 5 cm), or an
// alley's centreline running through a footprint (alleys are routed on the raster's cells round the lots after them:
// a 3 m alley may brush a wall, never cross a house)
function onStreets(P, brush) { let n = 0; standing(P).forEach(L => { if (L.cls === 'landmark') return;
  if (P.ways.some(w => { const tol = w.cls === 'alley' ? w.w / 2 : 0.05; let d = Infinity; for (let i = 1; i < w.pts.length; i++) d = Math.min(d, obbSegDist(L.bo, w.pts[i - 1], w.pts[i]));
    if (brush && d < w.w / 2 - 0.05) brush.n++; return d < w.w / 2 - tol; })) n++; }); return n; }
const onWall = P => standing(P).filter(L => (P.wallRec ? P.wallRec.segs : []).some(sg => obbSegDist(L.bo, [sg.ax, sg.az], [sg.bx, sg.bz]) < 3.5)).length;
const inWater = P => standing(P).filter(L => obbCorners(L.bo).concat([L.bo.c]).some(p => ground(p[0], p[1]) < 0)).length;

// ---------------------------------------------------------------- 1. a city on the synthetic site
const A = city(), P = A.run();
const S1 = standing(P), H1 = placeHash(P);
ok('the city builds: lots on every street class, side streets and alleys', S1.length > 150 && ['avenue', 'main', 'side', 'alley'].every(c => P.ways.some(w => w.cls === c)) && P.civics.length >= 1,
  standing({ lots: [] }).length === 0, S1.length + ' standing lots, ' + P.ways.length + ' ways, ' + P.civics.length + ' civic');
ok('no two standing footprints overlap (exact SAT, 0.1 m)', overlaps(P, 0.1) === 0, true, overlaps(P, 0.1) + ' pairs');
{ const brush = { n: 0 }, on = onStreets(P, brush), loose = city(); loose.tune.exact = false; const PL = loose.run(), onL = onStreets(PL);
  ok('nothing stands on a street (the exact-streets rule; without it the raster lets buildings reach the carriageway)', on === 0, onL > 0,
    on + ' on a carriageway, ' + brush.n + ' brushed by an alley; without the rule ' + onL); }
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
  ok('the export: plain JSON with the wall\'s records, every lot and way; a plan with no wall exports null, not a throw', j && j.wall && j.wall.line.length >= WALL.length && j.wall.nodes.length > 2 && j.wall.segs.length > 1 && j.lots.length === P.lots.length && j.ways.length === P.ways.length,
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

// ---------------------------------------------------------------- 7. the site layer (25-city-site.js)
{ A.bind(); const W = PLAN.wallRec, hw = PLAN.ways.filter(w => w.cls === 'highway'), gates = W.gates.filter(g => g.way);
  const verge = PLAN.vergeCells;
  const along = standing(PLAN).filter(L => hw.some(w => w.F.nearest([L.x, L.z]).d < w.w / 2 + TUNE.verge)).length;
  const named = W.gates.filter(g => g.named && g.crossed).length, square = gates.every(g => g.square);
  ok('the site layer: roles from the table, a highway with its verge (no lot along it), the wall\'s records (a named gate on its crossing, gates square to their ways, towers, runs)',
    PLAN.site.map(d => d.role).join() === 'zone,park,market' && hw.length === 1 && verge > 20 && along === 0 && named === 1 && square && W.nodes.some(n => n.kind === 'tower') && W.segs.length > 2,
    ROLES({ name: 'North Wall' }) === 'misc' && KCITY.site.roleAt([0, 0], PLAN.site, { skip: ['zone'], fallback: () => 'res' }) === 'res',
    hw.length + ' highway, ' + verge + ' verge cells, ' + W.gates.length + ' gates (' + named + ' named), ' + W.nodes.filter(n => n.kind === 'tower').length + ' towers, ' + W.segs.length + ' runs'); }
{ // the ground-delta interface on a 4 m grid: a bank under a line drawn into the water, a pad on a slope
  const N = 101, cell = 4, ext = 200, base = (x, z) => 0.05 * z - 1, D = new Float32Array(N * N);
  const at = (i, j, k) => base(-ext + i * cell, -ext + j * cell) + D[k];
  const hh = (x, z) => { const i = Math.round((x + ext) / cell), j = Math.round((z + ext) / cell); return at(i, j, j * N + i); };
  const G = { N, cell, ext, h: hh, at, add: (k, dv) => { D[k] += dv; } };
  const run = KCITY.ground.bank(G, [[-100, 0], [100, 0]], { top: 1.3, deepest: -5, core: 10, feather: 10, slope: 0.45 });
  const onBank = hh(0, 0), offBank = hh(0, 60);
  D.fill(0); const pad = KCITY.ground.levelPad(G, { x: 0, z: 100, ry: 0, hw: 12, hd: 12, y: 4, spread: 0.5, slope: 0.6 });
  const corners = [[-8, 92], [8, 92], [-8, 108], [8, 108]].map(p => hh(p[0], p[1])), flat = KCITY.ground.levelPad(G, { x: 0, z: 100, ry: 0, hw: 12, hd: 12, y: 4, spread: 0.5, slope: 0.6 });
  ok('the ground deltas: an avenue in the water banked to its top, a gate\'s pad levelled (cut and fill), a level footprint left alone',
    run > 150 && Math.abs(onBank - 1.3) < 1e-6 && Math.abs(offBank - (0.05 * 60 - 1)) < 1e-6 && pad && corners.every(y => Math.abs(y - 4) < 1e-6), flat === null,
    run + ' m banked; pad cut ' + (pad && pad.cut.toFixed(2)) + ', fill ' + (pad && pad.fill.toFixed(2))); }

// ---------------------------------------------------------------- 8. the strategies' shared primitives (33-city-strategies.js)
{ // the shared primitives
  const runs = []; KCITY.prim.frontageRun({ t0: 0, t1: 50, skip: t => (t === 8 ? 5 : 0), attempt: t => { runs.push(t); return t > 30 ? { stop: true } : { adv: 8, rec: {} }; } });
  const ring = []; KCITY.prim.huntNear([0, 0], { step: 8, reach: 16, minN: 8, arc: 10 }, (q, r) => { ring.push(r); return null; });
  const grid = KCITY.prim.gridCands(12, 0, 24, 12, (u, v) => [u, v]), face = KCITY.prim.faceNearestStreet([0, 0], [[1, 0], [0, 1]], (p, d) => d[0] ? 30 : 10);
  ok('the primitives: the cursor (skip, place, stop), rings out, a grid nearest first, directions by street distance',
    runs.join() === '0,13,21,29,37' && ring.length === 1 + 8 + 10 && grid[0].join() === '12,0' && grid[1].join() === '12,0' && face[0][0][1] === 1,
    runs.join() !== '0,8,16,24,32', runs.join()); }

if (WRITE) fs.writeFileSync(GOLD, JSON.stringify(gold, null, 1) + '\n');
console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
