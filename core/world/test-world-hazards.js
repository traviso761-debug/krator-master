// node core/world/test-world-hazards.js [--write]: core/world open-world hazards (`48h-world-hazards.js`, WHAZ) and fixtures
// (`48f-world-fixtures.js`, WFIX), plus golden vector generation (`core/world/golden-world-plan.json`) for the GDScript twins
// (`core/world/whaz.gd`, `core/world/wfix.gd`). Every check has its negative (`tools/ktest.js`).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const load = f => vm.runInThisContext(rd(f), { filename: f });
global.window = global;

['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js',
  'core/biome/37-core-traps.js', 'core/hazard/20-core-hazard.js', 'core/hazard/21-core-hazard-flow.js',
  'core/hazard/22-core-hazard-env.js', 'core/hazard/22-core-hazard-bore.js', 'core/hazard/22-core-hazard-tunnel.js',
  'core/camp/10-camp-cultures.js', 'core/camp/20-camp-census.js', 'core/camp/30-camp-pitch.js', 'core/camp/50-camp-tents.js',
  'core/world/42-world-roads.js', 'core/world/48s-world-sites.js', 'core/world/48w-world-camps.js',
  'core/world/48h-world-hazards.js', 'core/world/48f-world-fixtures.js'].forEach(load);

/* Synthetic Catch-Twins seam world:
   - (-6000..6000, -6000..6000) inside cut
   - Oasis 'stair' at (0, 0), Waystation 'brazier' at (0, -3500)
   - High 8,400 m crest in NE quadrant (x > 3000 && z < -3000) */
const landH = (x, z) => (x > 1800 && z < -1800) ? 8450 : (320 + z * -0.04 + Math.sin(x / 800) * 3);
global.WORLD = {
  box: () => [-6000, -6000, 6000, 6000],
  inside: (x, z) => Math.abs(x) < 6000 && Math.abs(z) < 6000,
  Hland: landH,
  H: landH,
  water: () => -1e9,
  riverWater: () => -1e9,
  lakeWater: () => -1e9,
  townW: () => 0,
  at: (x, z) => ({ h: landH(x, z), flow: 0, slope: 0.04, dune: 0.7, salt: 0.3, temp: 24 }),
  fromPx: (px, py) => [(px - 1000) * 2000, (py - 1000) * 2000]
};
global.WORLD_DATA = {
  meta: {
    frame: { origin_px: [1000, 1000], box_px: [997, 997, 1003, 1003], size_px: [6, 6] },
    sites: [
      { id: 'stair', name: 'Stair', type: 'oasis', x: 0, z: 0 },
      { id: 'brazier', name: 'The Brazier', type: 'waystation', x: 0, z: -3500 }
    ]
  }
};

KWCAMPS.calendar('catch', w => (w === 'black-storms' ? [70, 112] : w === 'twins-winter' ? [[310, 365], [0, 55]] : null));

const TUBES = {
  tubes: [{
    id: 'routeA_3', name: 'Dark-Tube A3',
    st: [[0, -1000, 290, 358], [0, -2000, 315, 398], [0, -3000, 340, 438]],
    sec: [{ id: 'routeA_3:0', kind: 'run', a: 0, b: 2, w: 18, h: 14, ledge: { v: 0.9, d: 1.2 } }]
  }]
};

const SPEC = {
  region: 'catch-twins-test',
  world: 77,
  sites: { stair: {}, brazier: {} },
  ways: [
    { id: 'route-b', from: 'stair', to: 'brazier', kind: 'trail' },
    { id: 'short-seam', from: 'brazier', to: { px: [1000, 995] }, kind: 'trail' } /* clips inside north edge (`short: true`) */
  ],
  hazards: [
    /* 1a. Crust + below pair (salt pan / Mud-Kettle style) */
    {
      id: 'pan-crust', name: 'Soda Pan Crust', at: [1200, 800],
      hazard: { kind: 'sink', danger: 0.6, dose: 4, shape: { type: 'cyl', r: 45, h: 3 }, crust: { mass: 60, heal: 180 }, trigger: { by: 'weight', mass: 60 }, tell: { colour: '#e8e4d8', fx: 'shimmer', sign: 'hollow salt crust' } },
      below: { kind: 'acid', effect: 'corrode', danger: 0.9, dose: 15, depth: 1.8 }
    },
    /* 1b. Decoy lava pool (`heat` + `gas`) & frozen box vale (`cold`) */
    {
      id: 'decoy-lava-1', name: 'Decoy Pool L1', px: [999.2, 998.8],
      hazard: { kind: 'heat', danger: 0.95, dose: 22, shape: { type: 'poly', pts: [[-30, -20], [35, -20], [30, 28], [-28, 25]], h: 6, edge: 4 }, falloff: 'smooth', tell: { colour: '#ff5218', fx: 'glow', sign: 'false beacon lava pool' } }
    },
    /* 1c. Night cold pool */
    {
      id: 'oasis-night-cold', site: 'stair', near: [-250, 220],
      hazard: { kind: 'cold', danger: 0.65, dose: 6, shape: { type: 'cyl', r: 60, h: 8, pool: 3 }, night: { from: 20, to: 6, ramp: 2 } }
    },
    /* 1d. Outside-cut hazard -> uncut, never an error */
    {
      id: 'strongbow-trap', px: [1001, 1020],
      hazard: { kind: 'fall', danger: 1, shape: { type: 'cyl', r: 20, h: 10 } }
    },
    /* 2a. Stalker hunter field (silent tell!) */
    {
      id: 'catch-stalkers', field: 'stalker', cell: 2000, box: [-5000, 1500, 5000, 5500], density: 0.65, stageMin: 1800
    },
    /* 2b. Extreme altitude thin-air avoid field (>8,000 m in NE corner) */
    {
      id: 'wall-death-zone', field: 'thin-air-avoid', cell: 2000, box: [2000, -5800, 5800, -2000], elev: 8000
    },
    /* 3. Travelling black storm front (`karaburan`) */
    {
      id: 'karaburan-front', kind: 'acid', when: { window: 'black-storms' },
      front: { path: [[-3000, 2500], [3000, 2500]], w: 400, speed: 15, period: 3600, rise: 120, hold: 600, fall: 180, depth: 120 }
    },
    /* 4. Way-bound seasonal closures */
    { id: 'close-floor-storm', way: 'route-b', kind: 'storm', when: { window: 'black-storms' }, why: 'spring black soda storms' },
    { id: 'close-col-winter', way: 'short-seam', kind: 'cold', when: { window: 'twins-winter' }, why: 'winter col freeze' }
  ],
  fixtures: [
    /* Surface toll-gate astride Route B */
    { id: 'sinter-gate', kind: 'toll-gate', name: 'Sinter-Gate Toll House', culture: 'xanadu', way: 'route-b', s: 1200, face: 'way' },
    /* Oasis waystation with Split Horn shrine */
    { id: 'brazier-shrine', kind: 'waystation-oasis', name: 'Shrine of the Split Horn', culture: 'xanadu', site: 'brazier', near: [140, 80], shrine: true },
    /* Rangers' last cairn on unmarked ground */
    { id: 'rangers-last-cairn', kind: 'cairn', name: 'The Rangers\' Last Cairn', at: [2400, 900], gear: true },
    /* Ruined caravan aftermath */
    { id: 'ambush-wreck', kind: 'wreck-aftermath', name: 'Shattered Train', at: [-1800, 2600] },
    /* Way fixture past a `short` way -> uncut */
    { id: 'beyond-seam-stop', kind: 'cairn', way: 'short-seam', s: 25000 },
    /* Outside-cut fixture -> uncut */
    { id: 'vale-portal-fix', kind: 'cairn', px: [938, 1496] }
  ]
};

const kit = { dims: () => null, programs: () => null };
const P = KSITES.plan(SPEC, kit);
const P2 = KSITES.plan(SPEC, kit);

// Also plan the underground Hall of the Tally-Marks against TUBES
const hallRes = WFIX.lay(
  { id: 'hall-tally-marks', kind: 'tube-hall', name: 'Hall of the Tally-Marks', culture: 'xanadu', tube: 'routeA_3', s: 1000 },
  77, { tubes: TUBES }
);
P.fixtures.push(hallRes.fixture);

// ---- 1. Determinism & version 3 schema
T.ok('KSITES.plan produces deterministic version 3 plan with hazards, way closures, fixtures and uncut items',
  P.version === 3 && !P.errors.length && P.hash === P2.hash &&
  P.hazards.length >= 8 && P.hazardWays.length === 2 && P.fixtures.length === 5 && P.uncut.length === 3,
  JSON.stringify({ errors: P.errors, hazards: P.hazards.length, ways: (P.hazardWays || []).length, fixtures: P.fixtures.length, uncut: P.uncut }));

const barePlan = KSITES.plan({ region: 'bare', world: 1, sites: { stair: {} } }, kit);
T.neg('a region without hazards/fixtures/camps stays version 1 (version 3 only when opted in)',
  pl => pl.version === 1 && !('hazards' in pl) && !('fixtures' in pl), P, barePlan);

// ---- 2. Crust + below pair & WHAZ.at evaluation
const crustAt = WHAZ.at(P, 1200, 800);
const brokenAt = WHAZ.at(P, 1200, 800, { brokenCrusts: { 'pan-crust': true } });
T.ok('intact crust gives 0 dose (`intact` + `held`), and breaking it activates both crust and below acid hazard',
  crustAt.length === 2 && crustAt.every(h => h.dose === 0) &&
  brokenAt.length === 2 && brokenAt.some(h => h.id === 'pan-crust/below' && h.dose > 10 && h.state === 'on'));
T.neg('outside the soda pan (1200, 900) receives zero crust hits',
  pt => WHAZ.at(P, pt[0], pt[1]).length === 0, [1200, 800], [1200, 900]);

// ---- 3. Stalker hunter field secrecy & stage exclusion
const stalkers = P.hazards.filter(r => r.kind === 'hunter');
T.ok('stalker field seeds quiet triad hunters outside town stageMin (1800 m) with null fx/sound/sign tells (' + stalkers.length + ' triads)',
  stalkers.length >= 2 && stalkers.every(r =>
    Math.hypot(r.at[0], r.at[2]) >= 1800 &&
    r.hazard.tell.fx === null && r.hazard.tell.sound === null && r.hazard.tell.sign === null &&
    r.hazard.hunter.fauna.indexOf('st_harpooner') >= 0));
const st0 = stalkers[0];
T.neg('excludeHunter hides untriggered Stalkers from UI/minimap queries while keeping real gameplay queries intact',
  excl => WHAZ.at(P, st0.at[0], st0.at[2], { excludeHunter: excl }).some(h => h.kind === 'hunter'),
  true, false);

const loudStalkerPlan = JSON.parse(JSON.stringify(P));
loudStalkerPlan.hazards.find(r => r.kind === 'hunter').hazard.tell.sign = 'HERE IS A STALKER';
T.neg('WHAZ.check catches a hunter record that leaks a visible sign/fx/sound tell',
  pl => WHAZ.check(pl).ok, loudStalkerPlan, P);

// ---- 4. Death-zone (>8000 m) nav.avoid & way seasonal closures
const deathZones = P.hazards.filter(r => r.id.indexOf('wall-death-zone/') === 0);
T.ok('thin-air-avoid field marks >8,000 m cells with nav.avoid = true (' + deathZones.length + ' cells)',
  deathZones.length >= 2 && deathZones.every(r => r.hazard.nav.avoid === true && r.at[1] >= 8000));

T.neg('WHAZ.wayOpen closes Route B during spring black storms (day 90) and opens it outside (day 200)',
  yd => WHAZ.wayOpen(P, 'stair/way/route-b', yd).open, 90, 200);
T.neg('WHAZ.wayOpen closes wrap-around winter pass on year day 15 and opens it in summer (day 180)',
  yd => WHAZ.wayOpen(P, 'brazier/way/short-seam', yd).open, 15, 180);

// ---- 5. Fixtures: surface toll-gate, underground Hall of the Tally-Marks, KRUINS check, and KSITES.check
const gate = P.fixtures.find(f => f.id === 'sinter-gate');
const hall = P.fixtures.find(f => f.id === 'hall-tally-marks');
const wreck = P.fixtures.find(f => f.id === 'ambush-wreck');
T.ok('Sinter-Gate toll-gate stands astride Route B with flanking piers clear of the trail centreline',
  !!gate && gate.way.id === 'stair/way/route-b' && gate.slots.length >= 4 &&
  gate.slots.every(sl => Math.hypot(sl.x - gate.anchor.x, sl.z - gate.anchor.z) >= 2.5));
T.ok('Hall of the Tally-Marks plans underground inside lava tube A3 (`on: "tube"`, floor < surface, cistern + ledges + torches)',
  !!hall && hall.on === 'tube' && hall.anchor.y < hall.tube.ground - 40 &&
  hall.slots.some(s => s.role === 'cistern') && hall.slots.filter(s => s.role === 'torch').length === 4);
T.ok('wreck-aftermath fixture sets `ruin: true` for KRUINS.watch', !!wreck && wreck.ruin === true && wreck.slots.length === 3);

const fullChk = KSITES.check(P);
T.ok('KSITES.check validates all hazards, way closures, surface fixtures and underground tube fixtures',
  fullChk.ok && fullChk.counts.hazards === P.hazards.length && fullChk.counts.fixtures === P.fixtures.length,
  JSON.stringify(fullChk.problems));

const overlappedFixPlan = JSON.parse(JSON.stringify(P));
overlappedFixPlan.fixtures[0].slots[1].x = overlappedFixPlan.fixtures[0].slots[0].x;
overlappedFixPlan.fixtures[0].slots[1].z = overlappedFixPlan.fixtures[0].slots[0].z;
T.neg('KSITES.check / WFIX.check catches overlapping fixture slots',
  pl => KSITES.check(pl).ok, overlappedFixPlan, P);

const surfacedTubePlan = JSON.parse(JSON.stringify(P));
const hIdx = surfacedTubePlan.fixtures.findIndex(f => f.id === 'hall-tally-marks');
surfacedTubePlan.fixtures[hIdx].anchor.y = surfacedTubePlan.fixtures[hIdx].tube.ground + 2;
T.neg('WFIX.check catches a tube fixture whose floor breaches the surface',
  pl => WFIX.check(pl).ok, surfacedTubePlan, P);

// ---- 6. Golden vector check / write for GDScript twins (`whaz.gd` & `wfix.gd`)
const queryPts = [
  { name: 'crust_intact', x: 1200, z: 800, yearDay: 200, broken: [], excludeHunter: false },
  { name: 'crust_broken', x: 1200, z: 800, yearDay: 200, broken: ['pan-crust'], excludeHunter: false },
  { name: 'decoy_core', x: -1600, z: -2400, yearDay: 200, broken: [], excludeHunter: false },
  { name: 'decoy_edge', x: -1570, z: -2400, yearDay: 200, broken: [], excludeHunter: false },
  { name: 'stalker_gameplay', x: st0.at[0], z: st0.at[2], yearDay: 200, broken: [], excludeHunter: false },
  { name: 'stalker_ui_hidden', x: st0.at[0], z: st0.at[2], yearDay: 200, broken: [], excludeHunter: true },
  { name: 'storm_active', x: 0, z: 2500, yearDay: 90, broken: [], excludeHunter: false },
  { name: 'storm_inactive', x: 0, z: 2500, yearDay: 200, broken: [], excludeHunter: false }
];
const golden = {
  format: 'krator-golden-world-plan',
  version: 1,
  plan: { hazards: P.hazards, hazardWays: P.hazardWays, fixtures: P.fixtures },
  wayChecks: [
    { way: 'stair/way/route-b', yearDay: 90, open: WHAZ.wayOpen(P, 'stair/way/route-b', 90).open },
    { way: 'stair/way/route-b', yearDay: 200, open: WHAZ.wayOpen(P, 'stair/way/route-b', 200).open },
    { way: 'brazier/way/short-seam', yearDay: 15, open: WHAZ.wayOpen(P, 'brazier/way/short-seam', 15).open },
    { way: 'brazier/way/short-seam', yearDay: 180, open: WHAZ.wayOpen(P, 'brazier/way/short-seam', 180).open }
  ],
  atChecks: queryPts.map(q => {
    const br = {}; q.broken.forEach(k => { br[k] = true; });
    const hits = WHAZ.at(P, q.x, q.z, { yearDay: q.yearDay, brokenCrusts: br, excludeHunter: q.excludeHunter });
    return {
      name: q.name, x: q.x, z: q.z, yearDay: q.yearDay, broken: q.broken, excludeHunter: q.excludeHunter,
      hits: hits.map(h => ({ id: h.id, kind: h.kind, effDanger: h.effDanger, dose: h.dose, f: h.f, state: h.state }))
    };
  }),
  overlapChecks: [
    { a: gate.slots[0], b: gate.slots[1], gap: 0.05, overlap: WFIX.boxesOverlap(gate.slots[0], gate.slots[1], 0.05) },
    { a: gate.slots[0], b: Object.assign({}, gate.slots[1], { x: gate.slots[0].x + 1, z: gate.slots[0].z }), gap: 0.05, overlap: true }
  ]
};

const gPath = path.join(__dirname, 'golden-world-plan.json');
if (process.argv.indexOf('--write') >= 0 || !fs.existsSync(gPath)) {
  fs.writeFileSync(gPath, JSON.stringify(golden, null, 2) + '\n', 'utf8');
}
const saved = JSON.parse(fs.readFileSync(gPath, 'utf8'));
T.ok('golden-world-plan.json matches live WHAZ & WFIX evaluation byte-for-byte',
  JSON.stringify(saved) === JSON.stringify(golden));
