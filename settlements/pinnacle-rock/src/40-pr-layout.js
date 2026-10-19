// ================================================================= PINNACLE ROCK — the layout (the settled plan, as data)  [G data]
// The owner settled the layout on 2026-10-19 (PLAN.md section 1, "The layout is settled"; the diagram's two plans and its
// section). These are the diagram's numbers: metres, x east, z south, the mesa's middle at 0,0, heights from the knoll's
// foot on the south (y 0). The host stage (45) makes the rock from them; the build's later stages (the roosts, the town,
// the farms, the camps) read the same records. Plain data and pure functions: no THREE, no DOM.
//
//   PR.MESA                      the mesa: 1.2 km north-south by 0.8 km, 250 m over its south foot
//   PR.FINS                      ten fins round the rim in groups: {id, group, wing, a (angle from the middle), inset, rot
//                                (strike), L (half-length), H}: placed on the top by the stage, inset from the rim
//   PR.GARDEN_MESA               the Garden's mesa: a smaller, lower tier in the middle of the top, the pinnacles' ground
//   PR.HEART_MESA                the Heart: a third mesa in the Garden's middle, half the pinnacles' height, the most weathered
//   PR.GARDEN                    the Garden's sixteen pinnacles (and its edge's balanced rocks and fin) {x, z, r, H, kind, ring, on}
//   PR.SHRINE_ROCK               the balanced rock in whose lee the Winged Ones' shrine stands
//   PR.SPURS                     seven lower buttresses against the walls (120-190 m): ledges, and the cliff's line broken
//   PR.TOP                       the zones of the top (ellipses): crown, garden, quarters, precinct, the camp grounds
//   PR.PALISADE                  the palisade, a polyline from the mesa's west foot round the south to its east foot
//   PR.PASTURES, PR.CAMPS        the nine bands of the floor: a pasture and a camp each; PR.hedge(i) the hedge round both
//   PR.FAIR, PR.ROAD, PR.GATE    the fair ground below the Stair, the forest road and its gate
//   PR.POND, PR.SPRING, PR.GORGE the seep pond (west foot), the spring below the Stair, the dry gorge under the north rim
//   PR.zoneAt(x, z)              the floor's zone at a point: farms, pasture, camp, fair, road, cleared, forest
//   PR.forest(x, z)              0..1: how much forest the ground keeps there (0 in the farms, the grounds, the road and the
//                                ways; remnant trees on the cleared ground; 1 in the forest)
//   PR.LIFT_ROAD                 the lift road's waypoints over the floor (the slope's part is the roost plan's, 43)
//   PR.addWay(W), PR.wayAt(x, z) the cleared ways the host adds from the roost plan (the Stair's path, the lift road)
const PR = (function () {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const sm = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const inEll = (x, z, e, pad) => { const p = pad || 0; return ((x - e.x) / (e.rx + p)) ** 2 + ((z - e.z) / (e.rz + p)) ** 2 < 1; };
  const ellD = (x, z, e) => Math.hypot((x - e.x) / e.rx, (z - e.z) / e.rz);   // 1 on the ellipse

  // ---------------------------------------------------------------- the rock
  const MESA = { id: 'mesa', x: 0, z: 0, top: 250, r: Math.sqrt(600 * 400), e: 1.5, ry: Math.PI / 2, lobes: .17, weather: 1,
    shoulder: { h: 30, back: 34, bed: [4, 7] }, seed: 2101,   // the top's rim: 30 m of ledges stepping back ~40 degrees to the cap rock
    name: 'Pinnacle Rock (the mesa)' };
  // the fins: by group, each where the diagram drew it; the stage sets each one in from the rim by `inset` along its
  // angle, so the outline's noise cannot leave a fin hanging over the edge (the no-build band is 12 m)
  const FIN_AT = [
    ['n0', 'north', 'wingclaw', -75, -548, .08, 30, 88], ['n1', 'north', 'wingclaw', 55, -552, -.05, 34, 90],
    ['ne', 'lookout', null, 285, -400, -.95, 26, 52],
    ['e0', 'east', 'quetzal', 372, -150, 1.52, 30, 78], ['e1', 'east', 'quetzal', 378, 0, 1.6, 26, 66], ['e2', 'east', 'quetzal', 366, 140, 1.66, 28, 72],
    ['w0', 'west', 'nightwing', -370, -60, 1.55, 30, 74], ['w1', 'west', 'nightwing', -360, 100, 1.5, 26, 62],
    ['sw', 'lookout', null, -262, 420, .85, 24, 46], ['se', 'lookout', null, 262, 420, -.85, 24, 44]];
  const FINS = FIN_AT.map((f, i) => ({ id: 'fin-' + f[0], group: f[1], wing: f[2], a: Math.atan2(f[4], f[3]), x: f[3], z: f[4], rot: f[5], L: f[6], w: 7, H: f[7],
    seed: 2200 + i, inset: f[6] * .25 + 22 }));
  // THE GARDEN'S MESA: a smaller, lower mesa in the middle of the top (the owner, 2026-10-19), the Garden's ground, 55 m
  // over the main top and about 420 by 380 m; the pinnacles rise out of it
  const GARDEN_MESA = { id: 'garden-mesa', x: 0, z: 10, r: Math.sqrt(212 * 192), e: 212 / 192, ry: 0, h: 55, lobes: .2, weather: 1, shoulder: { h: 16, back: 16, bed: [3, 5] }, bed: [10, 22], seed: 2600,
    name: 'The Garden\'s mesa (the inner tier of the top)' };
  // the pinnacles on it: the diagram's thirteen drawn in to fit (x .8) and three more, larger and taller toward the middle
  // (the owner: even larger): 130-250 m over the Garden's mesa, 16-28 m across the foot at the middle, 16 at the edge.
  // The four the diagram ringed carry roost rings (P2); a few balanced rocks and a fin at the edge
  const GARDEN = [[-90, -60], [-20, -110], [60, -70], [110, 10], [40, 40], [-60, 30], [-120, 90], [10, 120], [90, 110], [-40, 160],
    [140, -90], [-140, -10], [0, -20]].map(g => [g[0] * .8, g[1] * .8 + 10]).concat([[150, 75], [45, -135], [-105, -105]]).map((g, i) => {
    const ring = [0, 2, 4, 7].indexOf(i) >= 0, d = Math.hypot(g[0], g[1] - 10), edge = d > 120 && !ring;
    const kind = edge ? ['balanced', 'spire', 'fin'][i % 3] : 'spire';
    return { id: 'garden-' + i, x: g[0], z: g[1], ring, kind, seed: 2300 + i,
      r: kind === 'spire' ? Math.max(16, 28 - .09 * d) : 11, H: kind === 'spire' ? Math.round(255 - .85 * d + (i * 17) % 22 - 11) : 55 + (i * 13) % 30 }; });
  // THE HEART: one more mesa in the middle of the Garden's (the owner, 2026-10-19), about half the central pinnacles' height
  // (110 m over the Garden's mesa) and weathered harder than the others (weather 2: deep gullies, a rough shoulder of
  // ledges); the three tallest pinnacles rise out of it (on: 'heart', drawn in and narrower at their higher foot, their tops
  // unchanged), the ring round it moved out to clear its foot. Seed 2709: its gullies miss the three pinnacles' feet
  const HEART_MESA = { id: 'heart-mesa', x: -4, z: 10, r: Math.sqrt(76 * 70), e: 76 / 70, ry: 0, h: 110, lobes: .12, weather: 2, shoulder: { h: 30, back: 12, bed: [3, 6] },
    bed: [6, 14], seed: 2709, name: 'The Heart (the third mesa, in the Garden\'s middle)' };
  const ON_HEART = { 'garden-4': [12, 22, 15], 'garden-5': [-20, 20, 15], 'garden-12': [-4, -6, 18] },
    OUT = { 'garden-0': [-20, -14], 'garden-1': [0, -8], 'garden-2': [16, -16], 'garden-3': [20, 0], 'garden-7': [0, 8], 'garden-11': [-6, 0] };
  GARDEN.forEach(G => { const h = ON_HEART[G.id], m = OUT[G.id]; if (h) { G.x = h[0]; G.z = h[1]; G.r = h[2]; G.on = 'heart'; } if (m) { G.x += m[0]; G.z += m[1]; } });
  const SHRINE_ROCK = { id: 'shrine-rock', x: 160, z: -260, r: 9, H: 30, kind: 'balanced', seed: 2400 };
  // the spurs: lower buttresses against the walls (angle from the middle in degrees, z south; k: the centre's distance
  // as a share of the foot's radius there; r the spur's radius; h its top over y 0). Not on the south nose (90: the
  // Stair) nor the north face (270: the gorge, the beast lift)
  const SPURS = [[18, .98, 95, 150], [58, .97, 80, 175], [128, .97, 85, 135], [168, 1.0, 110, 190], [205, .98, 90, 160],
    [238, .97, 75, 125], [318, .98, 100, 170]].map((s, i) => ({ id: 'spur-' + i, a: s[0] * Math.PI / 180, k: s[1], r: s[2], h: s[3], seed: 2500 + i }));

  // ---------------------------------------------------------------- the top's zones (the upper plan)
  const E = (x, z, rx, rz, name) => ({ x, z, rx, rz, name });
  const TOP = {
    crown: E(0, -300, 120, 85, 'the Crown (the hall, the speakers\' stones, the market)'),
    garden: E(0, 0, 185, 175, 'the Garden (the great-houses among the spires)'),
    house: E(-185, 110, 90, 125, 'the west house quarter'),
    trade: E(185, 110, 90, 125, 'the east trades quarter'),
    south: E(0, 330, 140, 80, 'the south quarter (inns, the caravan market)'),
    precinct: E(-215, -205, 82, 66, 'the Deep Root precinct (the cavern; nothing built inside the stones)'),
    camps: [['wingclaw', 165, -470, 62, 44], ['quetzal', 285, -255, 52, 58], ['nightwing', -300, 235, 50, 62],
      ['threehorn', -165, -462, 44, 36], ['hardshell', 300, 270, 42, 40], ['staghorn', -200, 400, 42, 36],
      ['longcrawler', -95, 495, 40, 34], ['raptor', 95, 495, 40, 34], ['tiger', 195, 400, 42, 36]]
      .map(c => Object.assign(E(c[1], c[2], c[3], c[4], 'the ' + c[0] + ' band\'s ground (the top)'), { tribe: c[0] })),
    barracks: [{ wing: 'wingclaw', x: 0, z: -476, w: 70, d: 22, ry: 0 }, { wing: 'quetzal', x: 301, z: -50, w: 70, d: 22, ry: Math.PI / 2 },
      { wing: 'nightwing', x: -301, z: 20, w: 70, d: 22, ry: Math.PI / 2 }],
    well: { x: -238, z: -190 }, court: { x: -189, z: -224 },   // the Deep Root cavern's light well (the stack fig) and its sunken court
    stairHead: { x: 0, z: 560 }, liftTop: { x: 0, z: -596 }, capstan: { x: 41, z: 582 } };

  // ---------------------------------------------------------------- the floor (the lower plan)
  // the palisade: the diagram's four cubic curves, sampled
  const bez = (p0, p1, p2, p3, n) => { const o = []; for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t;
    o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return o; };
  const PALISADE = [[-470, -40]].concat(bez([-470, -40], [-720, 40], [-880, 380], [-820, 760], 24), bez([-820, 760], [-760, 1080], [-360, 1250], [0, 1260], 24),
    bez([0, 1260], [380, 1250], [760, 1080], [820, 760], 24), bez([820, 760], [880, 380], [720, 40], [470, -40], 24));
  const PASTURE_AT = [['threehorn', -1230, -110, 250, 200, -1230, 200], ['hardshell', -1180, -640, 220, 140, -870, -500],
    ['longcrawler', -1120, 560, 200, 150, -1120, 800], ['staghorn', -860, 1130, 200, 140, -860, 1350],
    ['raptor', 1090, 860, 190, 140, 1100, 1080], ['tiger', 1180, 230, 190, 160, 1180, 480],
    ['mammoth', -430, 1450, 150, 105, -170, 1480], ['spider', 1180, -420, 145, 110, 930, -330], ['dragonfly', 560, 1420, 140, 100, 815, 1385]];
  const PASTURES = PASTURE_AT.map(p => Object.assign(E(p[1], p[2], p[3], p[4], 'the ' + p[0] + ' band\'s pasture'), { tribe: p[0] }));
  const CAMPS = PASTURE_AT.map(p => Object.assign(E(p[5], p[6], 85, 62, 'the ' + p[0] + ' band\'s camp'), { tribe: p[0] }));
  // the hedge round a band's pasture and camp: the convex hull of both (the pasture 10% out and 25 m, the camp 115 by 92)
  function hull(pts) { pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1)); }
  const HEDGES = PASTURES.map((P, i) => { const C = CAMPS[i], pts = [];
    for (let k = 0; k < 36; k++) { const a = k / 36 * TAU; pts.push([Math.round(P.x + Math.cos(a) * (P.rx * 1.1 + 25)), Math.round(P.z + Math.sin(a) * (P.rz * 1.1 + 25))]);
      pts.push([Math.round(C.x + Math.cos(a) * 115), Math.round(C.z + Math.sin(a) * 92)]); }
    return { tribe: P.tribe, pts: hull(pts) }; });
  const FAIR = E(0, 820, 110, 75, 'the fair ground (below the Stair)');
  const ROAD = { pts: [[0, 690], [0, 1260], [0, 1730], [0, 2400]], w: 9, name: 'the forest road (to Mav\'s Refuge, 250 km)' };
  const GATE = { x: 0, z: 1258, name: 'the forest gate' };
  const POND = E(-560, -90, 70, 45, 'the seep pond (the mesa\'s seep lines)');
  const SPRING = E(-180, 720, 40, 26, 'the spring below the Stair (the paddies\' water)');
  const GORGE = { z: x => -730 + 25 * Math.sin(x * .004), w: 55, depth: 60, x0: -1100, x1: 1150, name: 'the dry gorge (under the north rim)' };
  // the lift road's way over the floor (owner, 2026-10-19: the beast lift wants a cleared road): from the debris slope's toe
  // at the mesa's north-west, west of the seep pond, south to the palisade (the north-west gate). The slope's part is the
  // roost plan's (43: it follows the rock)
  const LIFT_ROAD = [[-705, -170], [-705, 10]];
  const CLEARED = E(-90, 260, 1460, 1360, 'cleared ground');

  // the WAYS: cleared ground the host adds once the rock is planned (PRR, 43: the Stair's path down the debris slope, the
  // lift road), each {id, name, pts:[[x,z]], w}, kept in chunks of 16 segments with their boxes; wayAt(x, z) -> {d (the
  // distance past the way's edge, negative on it), W} for the nearest, or null
  const WAYS = [];
  function addWay(W) { const C = []; for (let i = 0; i + 1 < W.pts.length; i += 16) { const seg = W.pts.slice(i, Math.min(W.pts.length, i + 17)); let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      seg.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); }); C.push({ seg, x0, x1, z0, z1 }); }
    WAYS.push(Object.assign({}, W, { chunks: C })); }
  function wayAt(x, z, pad) { let best = null; const m = pad == null ? 30 : pad;
    for (const W of WAYS) for (const C of W.chunks) { if (x < C.x0 - m || x > C.x1 + m || z < C.z0 - m || z > C.z1 + m) continue;
      for (let k = 1; k < C.seg.length; k++) { const d = segD(x, z, C.seg[k - 1], C.seg[k]) - W.w / 2; if (!best || d < best.d) best = { d, W }; } }
    return best; }
  // ---------------------------------------------------------------- queries
  function inPoly(x, z, P) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const a = P[i], b = P[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  // the palisade closes against the mesa's foot: inside it is south of the mesa's foot line and inside the curve
  const PAL_CLOSED = PALISADE.concat([[0, 640]]);
  const inFarms = (x, z) => inPoly(x, z, PAL_CLOSED);
  const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz), 0, 1);
    return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };
  const roadD = (x, z) => { let d = 1e9; for (let i = 1; i < ROAD.pts.length; i++) d = Math.min(d, segD(x, z, ROAD.pts[i - 1], ROAD.pts[i])); return d; };
  const gorgeD = (x, z) => Math.abs(z - GORGE.z(x));
  function zoneAt(x, z) {
    for (let i = 0; i < HEDGES.length; i++) if (inPoly(x, z, HEDGES[i].pts)) return inEll(x, z, PASTURES[i]) ? { zone: 'pasture', tribe: PASTURES[i].tribe, name: PASTURES[i].name }
      : inEll(x, z, CAMPS[i]) ? { zone: 'camp', tribe: CAMPS[i].tribe, name: CAMPS[i].name } : { zone: 'hedged', tribe: PASTURES[i].tribe, name: 'inside the ' + PASTURES[i].tribe + ' band\'s hedge' };
    if (inEll(x, z, FAIR)) return { zone: 'fair', name: FAIR.name };
    if (roadD(x, z) < ROAD.w) return { zone: 'road', name: ROAD.name };
    { const wa = wayAt(x, z, 2); if (wa && wa.d < 0) return { zone: 'road', name: wa.W.name }; }
    if (inEll(x, z, POND)) return { zone: 'pond', name: POND.name };
    if (inFarms(x, z)) return { zone: 'farms', name: 'the farms (inside the palisade)' };
    if (gorgeD(x, z) < GORGE.w && x > GORGE.x0 && x < GORGE.x1) return { zone: 'gorge', name: GORGE.name };
    if (ellD(x, z, CLEARED) < 1) return { zone: 'cleared', name: 'cleared ground (remnant trees)' };
    return { zone: 'forest', name: 'the forest' }; }
  // how much forest the ground keeps: none in the farms (and 25 m round the palisade), the grounds (and 20 m round each
  // hedge), the fair ground, the road; a remnant on the cleared ground, fading to the forest over its last 150 m
  function forest(x, z) {
    for (let i = 0; i < HEDGES.length; i++) { const H = HEDGES[i]; if (inPoly(x, z, H.pts)) return 0;
      let d = 1e9; for (let k = 0, n = H.pts.length; k < n; k++) d = Math.min(d, segD(x, z, H.pts[k], H.pts[(k + 1) % n])); if (d < 20) return 0; }
    if (inFarms(x, z)) return 0;
    { let d = 1e9; for (let k = 1; k < PALISADE.length; k++) d = Math.min(d, segD(x, z, PALISADE[k - 1], PALISADE[k])); if (d < 25) return 0; }
    if (inEll(x, z, FAIR, 20) || roadD(x, z) < ROAD.w + 6) return 0;
    { const wa = wayAt(x, z, 12); if (wa && wa.d < 9) return 0; }   // a fern's reach either side
    const e = ellD(x, z, CLEARED); return e < 1 ? .1 + .9 * sm(.9, 1, e) : 1; }
  function topZoneAt(x, z) {
    for (const k of ['precinct', 'crown', 'garden', 'house', 'trade', 'south']) if (inEll(x, z, TOP[k])) return { zone: k, name: TOP[k].name };
    for (const c of TOP.camps) if (inEll(x, z, c)) return { zone: 'camp', tribe: c.tribe, name: c.name };
    return { zone: 'margin', name: 'the top\'s open margin' }; }
  return { MESA, FINS, GARDEN_MESA, HEART_MESA, GARDEN, SHRINE_ROCK, SPURS, TOP, PALISADE, PASTURES, CAMPS, HEDGES, FAIR, ROAD, GATE, POND, SPRING, GORGE, CLEARED,
    LIFT_ROAD, WAYS, addWay, wayAt, zoneAt, topZoneAt, forest, inFarms, inPoly, inEll, roadD, gorgeD };
})();
if (typeof module !== 'undefined') module.exports = PR;
