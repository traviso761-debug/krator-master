// ================================================================= PINNACLE ROCK — the town on the top (P3a)  [G data]
// PRT.plan(o) lays the town out on the mesa's top on core/city (core/city/README.md, "Porting a settlement"): one KCITY
// instance (rand 'krand', index 'insertion', the exact-streets rule), its steps 0-5 from the settled layout (40-pr-layout.js,
// PLAN.md section 1 and P3a), steps 6-12 the module's builder with this town's rules (the quarters' draws, the wealth
// round the Garden and the Crown, the civic buildings every trade asks for). Plain records only: no THREE, no DOM.
//
//   o = {K (KSTACKS), rock (the page's bodies), mesa (the main body), PR, roost (the roost plan, 43: its lifts, climbs and
//        Stair), dims(key, v) -> {w, d, h} | null (the Beast Riders' buildings), tags (a core/tags registry), seed}
//   -> {K (the instance), plan, lots (standing: every building, landmarks first), ways, squares, rings, log, failed,
//       missing, cover, trades}
//
// THE GROUND. The build zone is the cap rock's outline (KSTACKS.ring at the top) less RIM metres (the rim band: nothing is
// built within 12 m of the edge, PLAN.md), the feet of the rock standing on the top (the fins, the shrine's balanced rock,
// the Garden's mesa: every bed within 25 m of its foot, grown by its margin), the climbs' starts, the lifts' heads and the
// Stair's head, the Deep Root precinct (P3d) and the nine bands' grounds (P3c). The height is the cap's (one body,
// KSTACKS.at, sampled every 5 m and read bilinear): the top is flat to a metre, so a house stands at its highest corner.
//
// THE SITE (steps 0-5): the landmarks first (the assembly hall and the market in the Crown, the Winged Ones' shrine in the
// lee of its balanced rock, each Wing's barracks with its tack and feed store by its fins, the toll house at the Stair's
// head, the carrier-beasts' stage at the beast lift), each the first fit in rings out from its place; then the squares
// (the Crown's market, the caravan market by the Stair) as HARD ground with their stalls; then the avenues: the Stair Way
// from the Stair's head to the ring round the Garden's mesa, the Crown Way on to the ring round the Crown, the Lift Way to
// the beast lift, the processional to the Deep Root precinct. No highways and no wall: the cliffs are the wall.
const PRT = (function () {
  'use strict';
  const RIM = 12;
  // the lot classes (TUNE.classes): the Beast Riders' buildings (kits/beast-riders, README "Taking the buildings into another
  // build"): the kit's own houses, trades and mounts' buildings, and Girder's ports for the round huts, the joglo and the
  // longhouse and the roofed home (Girder's tower-slot homes are open-topped: they stand in its towers, not on the ground)
  const CLASSES = {
    poor: [['br_port_girder_dwelling', 5], ['br_bldg_terrace_row', 0], ['br_bldg_terrace_row', 1]],
    middle: [['br_port_girder_house', 0], ['br_port_girder_house', 1], ['br_port_girder_house', 2]],
    rich: [['br_bldg_great_house', 0], ['br_bldg_great_house', 1]],
    manor: [['br_bldg_chief_compound', 0], ['br_bldg_chief_compound', 1]],
    block: [['br_bldg_longhouse_block', 0], ['br_bldg_longhouse_block', 1]],
    shop: [['br_bldg_shophouse', 0], ['br_bldg_shophouse', 1], ['br_bldg_bakehouse', 0], ['br_bldg_butcher', 0], ['br_bldg_potter', 0],
      ['br_bldg_weaver', 0], ['br_bldg_healer', 0]],
    tavern: [['br_bldg_mead_hall', 0], ['br_bldg_mead_hall', 1], ['br_bldg_riders_inn', 1]],
    works: [['br_bldg_smithy', 0], ['br_bldg_smithy', 1], ['br_bldg_tannery', 0], ['br_bldg_ropewalk', 1], ['br_bldg_storehouse', 0],
      ['br_bldg_granary', 0], ['br_bldg_potter', 1], ['br_bldg_weaver', 1], ['br_bldg_fungus_house', 0], ['br_bldg_bakehouse', 1]],
    stable: [['br_bldg_raptor_stable', 0], ['br_bldg_beetle_pen', 1], ['br_bldg_storehouse', 1]],
    shrine: [['br_port_mavs_shrine', 0]]
  };
  const FALLBACK = { manor: 'rich', rich: 'middle', middle: 'poor', block: 'poor', shop: 'poor', tavern: 'shop', works: 'poor', stable: 'poor',
    shrine: 'poor', poor: null };
  // each quarter's draw of lot classes by street class (PLAN.md section 1: the house quarter west, the trades east, the
  // strangers' quarter south by the Stair; the Crown's ground the wealthiest; the rest of the top houses and stables)
  const DRAWS = {
    house: { avenue: { rich: 0.35, middle: 0.4, manor: 0.12, shop: 0.08, shrine: 0.05 }, main: { middle: 0.5, rich: 0.2, poor: 0.18, shop: 0.07, shrine: 0.05 },
      side: { middle: 0.45, poor: 0.4, block: 0.15 }, alley: { poor: 0.65, block: 0.35 } },
    trade: { avenue: { shop: 0.4, works: 0.3, tavern: 0.1, middle: 0.2 }, main: { works: 0.45, shop: 0.3, middle: 0.15, poor: 0.1 },
      side: { works: 0.5, poor: 0.3, shop: 0.2 }, alley: { works: 0.4, poor: 0.6 } },
    south: { avenue: { tavern: 0.3, shop: 0.35, middle: 0.2, stable: 0.15 }, main: { shop: 0.3, tavern: 0.12, middle: 0.3, poor: 0.15, stable: 0.13 },
      side: { poor: 0.45, middle: 0.3, stable: 0.15, shop: 0.1 }, alley: { poor: 0.8, stable: 0.2 } },
    crown: { avenue: { manor: 0.3, rich: 0.5, shrine: 0.08, shop: 0.12 }, main: { rich: 0.5, middle: 0.4, shrine: 0.1 },
      side: { middle: 0.6, rich: 0.2, poor: 0.2 }, alley: { middle: 0.4, poor: 0.6 } },
    res: { avenue: { middle: 0.45, rich: 0.15, shop: 0.15, stable: 0.15, shrine: 0.1 }, main: { middle: 0.4, poor: 0.25, stable: 0.2, shop: 0.1, shrine: 0.05 },
      side: { middle: 0.35, poor: 0.45, stable: 0.1, block: 0.1 }, alley: { poor: 0.7, middle: 0.2, block: 0.1 } }
  };
  // the civic buildings (step 6), one of each trade the town carries that the draws do not (BR_TRADES, the Voth census's
  // trades after the isle demo; the farms' and the river's are not the top's: P3b, and the town has no river)
  const CIVIC = [
    ['br_bldg_temple', 0, 'crown'], ['br_bldg_temple', 1, 'res'], ['br_bldg_school', 0, 'house'], ['br_bldg_school', 1, 'res'],
    ['br_bldg_healer', 1, 'south'], ['br_bldg_riders_inn', 0, 'stair'], ['br_bldg_market_hall', 0, 'south'], ['br_bldg_mill', 0, 'trade'],
    ['br_bldg_granary', 1, 'trade'], ['br_bldg_hauling_yard', 1, 'trade'], ['br_bldg_quarry', 1, 'trade'], ['br_bldg_beetle_pen', 0, 'res'],
    ['br_bldg_ropewalk', 0, 'trade'], ['br_bldg_tannery', 1, 'trade'], ['br_bldg_fungus_house', 1, 'trade'], ['br_bldg_watch_tower', 1, 'stair']
  ].map(c => ({ key: c[0], v: c[1], near: c[2] }));
  // the trades the town must carry, each by the keys any one of which carries it (checked after the plan: PRT.trades)
  const TRADES_HERE = ['bakers', 'butchers', 'weavers and dyers', 'brewers', 'tanners', 'innkeepers and grooms', 'town guard',
    'temple priests and servants', 'shrine keepers', 'shopkeepers and assistants', 'smiths and craftsmen', 'innkeepers and servers',
    'porters and warehousemen', 'industrial workers', 'household service', 'soldiers', 'teachers and scholars', 'guild officers and clerks',
    'customs officers and clerks', 'healers and nurses', 'priests and undertakers', 'lighthouse keepers', 'market traders',
    'quarrymen and masons', 'granary keepers and millers', 'beetle herders', 'mushroom growers', 'envoys and embassy staff',
    'elephant bug handlers and station hands', 'monks and lay brothers', 'palace and canton staffs'];

  function plan(o) {
    const KS = o.K, PR = o.PR, M = o.mesa, RO = o.roost, T = PR.TOP, KL = KCITY.lib, SL = KL.SL, OCC = KL.OCC, V = KL.V;
    const obb = KL.obb, obbCorners = KL.obbCorners, inPoly = KL.inPoly;
    const seed = KRAND.child(o.seed == null ? 20261019 : o.seed, 'pinnacle-town') >>> 0;
    const LOG = {}, OUT = { missing: {}, failed: [], squares: [], rings: [] }, W = 8, tags = o.tags || null;
    const dims = (key, v) => { const D = o.dims(key, v); if (!D) { OUT.missing[key] = (OUT.missing[key] || 0) + 1; return null; } return { key, v: v || 0, w: D.w, d: D.d, h: D.h }; };

    // ---------------------------------------------------------------- the cap's height, every 5 m (bilinear)
    const top = M.top, HC = 5, X0 = -420, Z0 = -620, NX = 170, NZ = 250, HG = new Float32Array(NX * NZ);
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = KS.at([M], X0 + i * HC, Z0 + j * HC); HG[j * NX + i] = a && a.top > top - 5 ? a.top : 0; }
    const h = (x, z) => {
      const fx = (x - X0) / HC, fz = (z - Z0) / HC, i = Math.floor(fx), j = Math.floor(fz);
      if (i < 0 || j < 0 || i >= NX - 1 || j >= NZ - 1) return 0;
      const u = fx - i, v = fz - j, a = HG[j * NX + i], b = HG[j * NX + i + 1], c = HG[(j + 1) * NX + i], d = HG[(j + 1) * NX + i + 1];
      if (!a || !b || !c || !d) return 0;
      return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
    };
    // the cap's outline, and the rock standing on it (its beds within 25 m of its foot: an overhang over a roof is the rock's)
    const CAP = KS.ring(M, top - 0.5, 240);
    const ON = o.rock.filter(B => B !== M && Math.abs(B.y0 - (top - 1)) < 4);
    const footPoly = (B, m) => { const out = []; B.beds.filter(b => b.y < B.y0 + 25).forEach(b => { const P = []; for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2, R = KS.footR(b, a) + m; P.push([b.cx + Math.cos(a) * R, b.cz + Math.sin(a) * R]); } out.push(P); }); return out; };
    const MARGIN = B => B.garden ? 6 : B.kind === 'fin' ? 7 : 4;
    const ell = (E, pad, n) => { const P = [], p = pad || 0; for (let k = 0; k < (n || 32); k++) { const a = k / (n || 32) * Math.PI * 2; P.push([E.x + Math.cos(a) * (E.rx + p), E.z + Math.sin(a) * (E.rz + p)]); } return P; };
    const GARDEN_B = ON.find(B => B.garden);
    // the ring round the Garden's mesa: its foot (every bed within 25 m) out 14 m and half the avenue, smoothed
    const ringAround = (B, gap) => {
      const n = 72, r = new Array(n).fill(0);
      B.beds.filter(b => b.y < B.y0 + 25).forEach(b => { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2;
        // the bed's edge seen from the body's middle along a: its footR about its own centre, near enough for a ring
        const dx = b.cx - B.x, dz = b.cz - B.z, R = KS.footR(b, a) + dx * Math.cos(a) + dz * Math.sin(a); r[k] = Math.max(r[k], R); } });
      const s = r.map((v, k) => Math.max(v, (r[(k + n - 1) % n] + r[(k + 1) % n]) / 2, r[(k + n - 2) % n] * 0.98, r[(k + 2) % n] * 0.98));
      return s.map((v, k) => { const a = k / n * Math.PI * 2; return [B.x + Math.cos(a) * (v + gap + W / 2), B.z + Math.sin(a) * (v + gap + W / 2)]; });
    };
    // the Crown's square: the hall and the market before it (PLAN.md: the hall, the speakers' stones, the market round it)
    const CROWN = { x: T.crown.x, z: T.crown.z - 40, hw: 52, hd: 40 };
    const crownSq = [[CROWN.x - CROWN.hw, CROWN.z - CROWN.hd], [CROWN.x + CROWN.hw, CROWN.z - CROWN.hd], [CROWN.x + CROWN.hw, CROWN.z + CROWN.hd], [CROWN.x - CROWN.hw, CROWN.z + CROWN.hd]];
    const crownRing = KL.offsetConvex(crownSq, 6 + W / 2, 6);
    // the caravan market by the Stair (the strangers' quarter: the inns and the caravan market)
    const CARAVAN = { x: 70, z: 405, hw: 30, hd: 24 };
    const caravanSq = [[CARAVAN.x - CARAVAN.hw, CARAVAN.z - CARAVAN.hd], [CARAVAN.x + CARAVAN.hw, CARAVAN.z - CARAVAN.hd], [CARAVAN.x + CARAVAN.hw, CARAVAN.z + CARAVAN.hd], [CARAVAN.x - CARAVAN.hw, CARAVAN.z + CARAVAN.hd]];
    const gRing = ringAround(GARDEN_B, 14);
    const near = (P, q) => { let b = null, bd = Infinity; P.forEach(p => { const d = V.dist(p, q); if (d < bd) { bd = d; b = p; } }); return b; };
    const sh = T.stairHead, lift = RO.lifts.find(L => /north/.test(L.id)), cap = lift && lift.capstan ? [lift.capstan.x, lift.capstan.z] : [T.liftTop.x, T.liftTop.z + 40];
    const gS = near(gRing, [0, 400]), gN = near(gRing, [0, -400]), cS = near(crownRing, [CROWN.x, 0]), cN = near(crownRing, [CROWN.x, -700]), cW = near(crownRing, [-400, CROWN.z + 20]);
    const head = RO.stair && RO.stair.gates[0] ? [RO.stair.gates[0].x, RO.stair.gates[0].z] : [sh.x, sh.z];
    const AVENUES = [
      { name: 'the Stair Way', pts: [[head[0], head[1] - 12], [head[0] - 4, head[1] - 60], [4, 470], [0, 380], gS] },
      { name: 'the Crown Way', pts: [gN, [gN[0], (gN[1] + cS[1]) / 2], cS] },
      { name: 'the Lift Way', pts: [cN, [0, (cN[1] + cap[1]) / 2], [cap[0], cap[1] + 10]] },
      { name: 'the processional (to the Deep Root)', pts: [cW, [-125, CROWN.z + 30], [T.precinct.x + T.precinct.rx - 2, T.precinct.z - 6]] }
    ];
    const RINGS = [{ name: 'the ring round the Garden\'s mesa', pts: gRing }, { name: 'the ring round the Crown', pts: crownRing }];
    OUT.squares.push({ name: 'the Crown', poly: crownSq }, { name: 'the caravan market', poly: caravanSq });
    OUT.rings = RINGS;
    // the districts and their roles (roleAt: the first that holds the point; outside them all, 'res')
    const DIST = [
      { name: 'the Crown', role: 'crown', poly: ell(T.crown, 30) }, { name: T.house.name, role: 'house', poly: ell(T.house, 40) },
      { name: T.trade.name, role: 'trade', poly: ell(T.trade, 40) }, { name: T.south.name, role: 'south', poly: ell(T.south, 50) }];
    const roleAt = p => { for (const D of DIST) if (inPoly(p, D.poly)) return D.role; return 'res'; };
    // wealth: highest by the Garden and the Crown, falling to the rim and the south gate's strangers
    const gC = [GARDEN_B.x, GARDEN_B.z];
    const wealth = p => {
      const dg = Math.max(0, V.dist(p, gC) - 230), dc = V.dist(p, [CROWN.x, CROWN.z]);
      return Math.max(0, Math.min(1, 0.9 - dg / 360 * 0.7 + (dc < 220 ? 0.15 * (1 - dc / 220) : 0) + 0.15 * (KRAND.vnoise(p[0] / 140, 0, p[1] / 140, seed) - 0.5)));
    };
    const chooser = cls => (p, rs) => { const D = DRAWS[roleAt(p)] || DRAWS.res; return SL.draw(rs, D[cls]); };
    const rsOf = name => { const s = KRAND.stream(KRAND.child(seed, name)); return { rnd: s.next, rr: s.range }; };

    // ---------------------------------------------------------------- landmarks: one footprint, checked, registered
    const AVOID = AVENUES.map(a => a.pts).concat(RINGS.map(r => r.pts.concat([r.pts[0]])));
    const avoidD = C => { let d = Infinity; AVOID.forEach(L => { for (let i = 1; i < L.length; i++) d = Math.min(d, KL.polySegDist(C, L[i - 1], L[i])); }); return d; };
    const uOf = ry => [Math.cos(ry), -Math.sin(ry)];
    // o2: {role, name, inSquare (stands on a square's HARD ground: the hall, the stalls), clear (metres from the avenues)}
    const put = (key, v, x, z, ry, o2) => {
      o2 = o2 || {};
      const it = dims(key, v); if (!it) return null;
      const bo = obb([x, z], uOf(ry), it.w / 2, it.d / 2), C = obbCorners(bo);
      if (SL.R.idx(x, z) < 0 || C.some(p => SL.R.idx(p[0], p[1]) < 0)) return null;
      if (SL.R.blockedRect(bo, 0.3, o2.inSquare ? { [OCC.HARD]: 1 } : null)) return null;
      if (SL.clash(bo)) return null;
      if (!o2.inSquare && avoidD(C) < W / 2 + (o2.clear == null ? 3 : o2.clear)) return null;
      const hs = C.concat([bo.c]).map(p => h(p[0], p[1])), lo = Math.min.apply(null, hs), hi = Math.max.apply(null, hs);
      if (lo < top - 5 || hi - lo > 2) return null;
      const P = KL.plan(), L = { id: P.lots.length, cls: 'landmark', role: o2.role || key, name: o2.name || null, key, v: v || 0, slot: 0, wealth: 1, x, z, y: hi + 0.05, ry,
        w: it.w, d: it.d, h: it.h, lot: bo, bo, way: -1, side: 0, s: 0, born: 1, died: null, civic: true };
      P.lots.push(L); P.landmarks.push(L); SL.hashLot(L); SL.register(L);
      SL.R.stampPoly(obbCorners(obb(bo.c, bo.u, bo.hw + (o2.inSquare ? 0.5 : 3), bo.hd + (o2.inSquare ? 0.5 : 3))), OCC.HARD, L.id);
      return L;
    };
    // the first fit in rings out from (x, z), each of the given turns tried at each spot
    const hunt = (key, v, x, z, rys, o2) => {
      const R0 = o2 && o2.radius != null ? o2.radius : 80, st = o2 && o2.step != null ? o2.step : 4;
      for (let r = 0; r <= R0; r += st) {
        const n = r === 0 ? 1 : Math.max(6, Math.round(2 * Math.PI * r / st));
        for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + r * 0.37, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
          for (const ry of rys) { const L = put(key, v, px, pz, ry, o2); if (L) return L; } }
      }
      OUT.failed.push({ key, role: o2 && o2.role, name: o2 && o2.name, at: [Math.round(x), Math.round(z)] }); return null;
    };
    const facing = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);   // a building's front (+z) turned toward (tx, tz)

    // ---------------------------------------------------------------- the world's steps 0-5
    const tune = {
      cell: 2.5, rasterHalf: 640, mapHalf: 640, maxSlope: 0.3, exact: true,
      width: { avenue: W, main: 5.5, side: 4, alley: 2.6, highway: 8, lane: 4 },
      lot: { side: 2, setback: 2, rear: 3, inset: 1, step: 3 },
      classes: CLASSES, fallback: FALLBACK, civic: CIVIC, civicSpacing: 70,
      voidMax: 40, voidIters: 18, voidBatch: 12, sideSpacing: 70, sideMax: 160, alleyFrac: 0.12, blindMax: 50, interiorDepth: 14, interiorRounds: 2,
      avenueSnap: 30, ringGap: 6, verge: 3, centre: gC, reach: 600,
      stance: 'high', stanceOpt: { maxDrop: 2 },
      plazaArt: { rich: ['none'], middle: ['none'], poor: ['none'], commerce: ['none'] }
    };
    const world = [
      { name: 'the site and its ground', run: function () {
        const R = SL.R = new KL.Raster(tune.rasterHalf, tune.cell); R.occ.fill(OCC.OUT);
        const P = KL.plan(); P.site = DIST.map((d, i) => ({ id: i, name: d.name, type: 'district', role: d.role, poly: d.poly }));
        P.zone = CAP;
        LOG.land = KCITY.site.zoneRaster(R, CAP, { dry: top - 5, maxSlope: tune.maxSlope, h });
        let cut = 0; const off = k => { if (R.occ[k] === OCC.FREE) { R.occ[k] = OCC.OUT; cut++; } };
        // the rim band
        for (let i = 0; i < CAP.length; i++) R.eachNearSeg(CAP[i], CAP[(i + 1) % CAP.length], RIM, off);
        // the rock standing on the top, grown by its margin
        ON.forEach(B => footPoly(B, MARGIN(B)).forEach(Pp => R.eachInPoly(Pp, off)));
        // the climbs' starts, the lifts' heads, the Stair's head (its gate and the walk to it)
        RO.climbs.forEach(c => { const p = c.pts[0]; if (Math.abs(p[1] - top) < 3) R.eachNearSeg([p[0], p[2]], [p[0], p[2]], 6, off); });
        RO.lifts.forEach(L => [L.root, L.capstan].forEach(q => { if (q) R.eachNearSeg([q.x, q.z], [q.x, q.z], 9, off); }));
        if (RO.stair) RO.stair.gates.forEach(g => { if (Math.abs(g.y - top) < 3) R.eachNearSeg([g.x, g.z], [g.x, g.z - 10], 8, off); });
        // the Deep Root precinct (P3d) and the bands' grounds (P3c)
        R.eachInPoly(ell(T.precinct, 6), off);
        T.camps.forEach(c => R.eachInPoly(ell(c, 4), off));
        LOG.zone = LOG.land + ' cells of cap, ' + cut + ' kept clear (the rim, the rock, the heads, the precinct, the grounds)';
        SL.minSpacing = KCITY.site.minSpacing();
      } },
      { name: 'landmarks', run: function () {
        // the squares first (their ground HARD: nothing but their own landmarks stands on them)
        OUT.squares.forEach(Q => SL.R.eachInPoly(Q.poly, k => { if (SL.R.occ[k] === OCC.FREE) SL.R.occ[k] = OCC.HARD; }));
        // THE CROWN: the assembly hall (Girder's round hall) at the square's back, its front to the market; the stalls in
        // rows before it, the speakers' ground between
        const hall = put('br_port_girder_hall', 0, CROWN.x, CROWN.z - CROWN.hd + 22, 0, { role: 'hall', name: 'the assembly hall', inSquare: true });
        if (!hall) OUT.failed.push({ key: 'br_port_girder_hall', role: 'hall' });
        let st = 0;
        [-1, 1].forEach(sd => { for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) {
          const v = (k + r + (sd > 0 ? 2 : 0)) % 4, x = CROWN.x + sd * (8 + k * 7), z = CROWN.z + 18 + r * 11;
          if (put('br_port_girder_stall', v, x, z, r ? Math.PI : 0, { role: 'stall', name: 'the Crown\'s market', inSquare: true })) st++; } });
        if (put('br_bldg_market_hall', 1, CROWN.x - 38, CROWN.z - 12, Math.PI / 2, { role: 'market', name: 'the Crown\'s market pavilion', inSquare: true })) st++;
        LOG.crown = (hall ? 'the hall, ' : 'NO HALL, ') + st + ' stalls and the pavilion';
        // the caravan market by the Stair: stalls round its edge, the beast stage's yard at its back
        let cs = 0;
        for (let k = 0; k < 6; k++) { if (put('br_port_girder_stall', k % 4, CARAVAN.x - 20 + k * 8, CARAVAN.z - CARAVAN.hd + 4, 0, { role: 'stall', name: 'the caravan market', inSquare: true })) cs++;
          if (put('br_port_girder_stall', (k + 1) % 4, CARAVAN.x - 20 + k * 8, CARAVAN.z + CARAVAN.hd - 4, Math.PI, { role: 'stall', name: 'the caravan market', inSquare: true })) cs++; }
        LOG.caravan = cs + ' stalls';
        // THE SHRINE of the Winged Ones, in the lee of its balanced rock: its back to the rock, its front to the town
        const SR = PR.SHRINE_ROCK, fa = facing(SR.x, SR.z, gC[0], gC[1]);
        hunt('br_port_mavs_shrine', 0, SR.x + Math.sin(fa) * (SR.r + 16), SR.z + Math.cos(fa) * (SR.r + 16), [fa, fa + 0.4, fa - 0.4], { role: 'shrine', name: 'the shrine of the Winged Ones', radius: 40, step: 3 });
        // EACH WING'S BARRACKS by its fins (the roost barracks with the flyers' pens), its tack and feed store beside it
        T.barracks.forEach(Bk => {
          const fins = ON.filter(B => B.kind === 'fin' && PR.FINS.find(f => f.id === B.id && f.wing === Bk.wing));
          const fc = fins.length ? [fins.reduce((s, B) => s + B.x, 0) / fins.length, fins.reduce((s, B) => s + B.z, 0) / fins.length] : [Bk.x, Bk.z];
          // in from the fins toward the middle of the top, facing it
          const d = V.norm(V.sub(gC, fc)), at = V.add(fc, V.mul(d, 70)), ry = facing(at[0], at[1], gC[0], gC[1]);
          const L = hunt('br_bldg_barracks', 1, at[0], at[1], [ry, ry + Math.PI / 2, ry - Math.PI / 2], { role: 'barracks', name: 'the ' + Bk.wing + ' Wing\'s barracks', radius: 90 });
          if (L) hunt('br_bldg_storehouse', 1, L.x + Math.cos(ry) * 26, L.z - Math.sin(ry) * 26, [ry, ry + Math.PI / 2], { role: 'tack', name: 'the ' + Bk.wing + ' Wing\'s tack and feed store', radius: 50 });
        });
        // THE STAIR'S HEAD: the toll house (customs), the tally hall; the beacon on the south nose
        hunt('br_bldg_toll_house', 0, head[0] + 24, head[1] - 34, [Math.PI, Math.PI / 2], { role: 'customs', name: 'the toll house at the Stair\'s head', radius: 50 });
        hunt('br_bldg_beacon_tower', 0, head[0] - 40, head[1] - 22, [0, Math.PI / 2], { role: 'beacon', name: 'the beacon on the south nose', radius: 60 });
        // THE BEAST LIFT: the carrier-beasts' stage (loads up and down the gorge face) and the watch
        hunt('br_bldg_beast_stage', 0, cap[0] - 34, cap[1] + 34, [0, Math.PI / 2, -Math.PI / 2], { role: 'stage', name: 'the carrier-beasts\' stage at the beast lift', radius: 60 });
        hunt('br_bldg_watch_tower', 0, cap[0] + 26, cap[1] + 20, [0], { role: 'guard', name: 'the watch over the gorge', radius: 50 });
        // a beacon on the north rim and one on the east (the lighthouse keepers: signals over the forest)
        hunt('br_bldg_beacon_tower', 1, 205, -385, [0.6, -0.9], { role: 'beacon', name: 'the signal mast on the north-east rim', radius: 70 });
        LOG.landmarks = KL.plan().landmarks.length;
      } },
      { name: 'districts', run: function () {
        const P = KL.plan();
        DIST.forEach(d => P.districts.push({ kind: d.role, name: d.name, poly: d.poly, born: 2, art: [] }));
        OUT.squares.forEach(Q => P.districts.push({ kind: 'market', name: Q.name, poly: Q.poly, born: 2, art: [] }));
      } },
      { name: 'avenues', run: function () {
        const av = KCITY.site.avenues(AVENUES, 3, { snap: tune.avenueSnap });
        let rings = 0; RINGS.forEach(r => { rings += KCITY.site.ring(r.pts, 3, r.name, { dry: top - 5 }); });
        LOG.avenues = av.made + ' drawn, ' + av.joins + ' joins, ' + rings + ' ring runs';
      } },
      { name: 'highways', run: function () {} },
      { name: 'the wall and its gates', run: function () {} }
    ];
    const NEAR = { stair: c => Math.abs(V.dist(c.p, head) - 70) };
    const K = KCITY.create({
      name: 'pinnacle-rock', tune, site: { districts: DIST, avenues: AVENUES }, seed, rand: 'krand', index: { order: 'insertion' }, tags,
      ground: { h }, kit: { dims },
      rules: { wealth, roleAt, near: NEAR, choosers: { avenue: chooser('avenue'), main: chooser('main'), side: chooser('side'), alley: chooser('alley') },
        groundOk: KCITY.reliefOk({ dry: top - 5, maxRelief: 2 }) },
      steps: world.concat(KCITY.defaultSteps().slice(6)),
      finish: []
    });
    const t0 = Date.now(), P = K.run(); LOG.ms = Date.now() - t0; LOG.stepMs = P.stats && P.stats.ms;

    // ---------------------------------------------------------------- the records
    const lots = P.lots.filter(L => L.died == null && L.bo).map(L => ({ id: 'town.' + L.id, lot: L.id, key: L.key, v: L.v || 0, cls: L.cls, role: L.role || null, name: L.name || null,
      district: L.cls === 'landmark' ? (L.name || L.role) : roleAt([L.x, L.z]), x: +L.x.toFixed(2), z: +L.z.toFixed(2), y: +L.y.toFixed(2), ry: +L.ry.toFixed(4),
      w: L.w, d: L.d, h: L.h, wealth: +(L.wealth == null ? 0.5 : L.wealth).toFixed(2), tag: L.tag || null, landmark: L.cls === 'landmark' }));
    lots.sort((a, b) => (b.landmark - a.landmark) || (a.lot - b.lot));
    const ways = P.ways.filter(w => w.died == null).map(w => ({ id: w.id, cls: w.cls, w: w.w, tag: w.tag || null, closed: !!w.closed, pts: w.pts.map(p => [+p[0].toFixed(2), +p[1].toFixed(2)]) }));
    // how much of the zone is built: the plan's own raster, every FREE cell of the cap counted as open
    const R = SL.R, c = { zone: 0, streets: 0, lots: 0, hard: 0, green: 0, free: 0 };
    for (let k = 0; k < R.occ.length; k++) { const v = R.occ[k]; if (v === OCC.OUT) continue; c.zone++;
      if (v === OCC.STREET || v === OCC.ALLEY) c.streets++; else if (v === OCC.LOT || v === OCC.RESERVE) c.lots++; else if (v === OCC.HARD) c.hard++; else if (v === OCC.GREEN) c.green++; else c.free++; }
    const share = n => +(n / Math.max(1, c.zone)).toFixed(3);
    LOG.cover = { zoneKm2: +(c.zone * R.c * R.c / 1e6).toFixed(3), streets: share(c.streets), lots: share(c.lots), landmarks: share(c.hard), green: share(c.green), open: share(c.free) };
    LOG.lots = lots.length; LOG.ways = ways.length;
    return { K, plan: P, lots, ways, squares: OUT.squares, rings: OUT.rings, log: LOG, failed: OUT.failed, missing: OUT.missing, h, cap: CAP, avenues: AVENUES };
  }
  // the trades the town carries (BR_TRADES: {trade, keys}): for each trade it must, the keys of its buildings standing
  function trades(T, lots) {
    const have = {}; lots.forEach(L => { have[L.key] = (have[L.key] || 0) + 1; });
    return TRADES_HERE.map(name => { const E = (T || []).find(t => t.trade === name); const keys = E ? E.keys.filter(k => have[k]) : [];
      return { trade: name, keys, n: keys.reduce((s, k) => s + have[k], 0), known: !!E }; });
  }
  return { plan, trades, CLASSES, DRAWS, CIVIC, TRADES_HERE, RIM };
})();
