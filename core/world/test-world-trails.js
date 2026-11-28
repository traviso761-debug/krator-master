// node core/world/test-world-trails.js: core/world trail & path way kinds (42-world-roads.js, 42b-world-bridges.js,
// 48s-world-sites.js), point-started ways, boundary clipping (`shortStart` / `short`), and stops on ways — each check paired
// with its negative (`tools/ktest.js`).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const load = f => vm.runInThisContext(rd(f), { filename: f });
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/camp/10-camp-cultures.js',
  'core/camp/20-camp-census.js', 'core/camp/30-camp-pitch.js', 'core/camp/50-camp-tents.js'].forEach(load);

/* Synthetic mountain pass: climbs from z = -4000 (0 m) up to z = 4000 (+1120 m, a steady 14% ramp across an 8 km span),
   with a river channel crossing at z = 0 (width 40 m, water at +558 m). An 8% highway cannot climb 14% directly without wide
   hairpins or hitting the grade limit, whereas an 18% trail climbs straight up at ~14% <= 18% */
const rampH = (x, z) => {
  const base = 560 + z * 0.14 + Math.sin(x / 900) * 6;
  const inRiver = Math.abs(z) < 22;
  return inRiver ? 554 : base;
};
global.WORLD = {
  box: () => [-6000, -6000, 6000, 6000],
  inside: (x, z) => Math.abs(x) < 5000 && Math.abs(z) < 5000,
  Hland: (x, z) => rampH(x, z),
  H: (x, z) => rampH(x, z),
  water: (x, z) => Math.abs(z) < 22 ? 558 : -1e9,
  riverWater: (x, z) => Math.abs(z) < 22 ? 558 : -1e9,
  lakeWater: () => -1e9,
  townW: () => 0,
  at: (x, z) => ({ h: rampH(x, z), flow: Math.abs(z) < 22 ? 0.9 : 0, slope: 0.14 }),
  fromPx: (px, py) => [(px - 100) * 2000, (py - 100) * 2000]
};
global.WORLD_DATA = {
  meta: {
    frame: { origin_px: [100, 100], box_px: [97, 97, 103, 103], size_px: [6, 6] },
    sites: [
      { id: 'foot', name: 'Foot Oasis', type: 'oasis', x: 0, z: -3600 },
      { id: 'crest', name: 'Crest Tarn', type: 'waystation', x: 0, z: 3600 }
    ]
  }
};
load('core/world/42-world-roads.js');
load('core/world/42b-world-bridges.js');
load('core/world/48s-world-sites.js');

// ---- 1. ROADS.KINDS & byte-identical default `road`
T.ok('ROADS.KINDS defines road (.08, 4m), trail (.18, 2m) and path (.25, 1.2m)',
  ROADS.KINDS.road.grade === 0.08 && ROADS.KINDS.road.hw === 4 &&
  ROADS.KINDS.trail.grade === 0.18 && ROADS.KINDS.trail.hw === 2 &&
  ROADS.KINDS.path.grade === 0.25 && ROADS.KINDS.path.hw === 1.2);
T.neg('ROADS.kind rejects an unknown way kind cleanly by falling back to road (known trail gives 0.18)',
  k => ROADS.kind(k).grade === 0.18, 'not-a-kind', 'trail');

const defR = ROADS.route({ name: 'a', x: -1500, z: -2000, r: 0 }, { name: 'b', x: 1500, z: -2000, r: 0 });
T.ok('default ROADS.route omits optional kind/grade keys so existing baked plans stay byte-identical',
  !!defR && defR.hw === 4 && !('kind' in defR) && !('grade' in defR));

const trR = ROADS.route({ name: 'a', x: 0, z: -3200, r: 0 }, { name: 'b', x: 0, z: 3200, r: 0 }, { kind: 'trail' });
T.ok('trail ROADS.route climbs a 14% mountain ramp directly within its 18% ruling grade (hw 2 m)',
  !!trR && trR.kind === 'trail' && trR.hw === 2 && trR.grade === 0.18 && trR.maxGrade > 0.09 && trR.maxGrade <= 0.18);
T.neg('a steep trail (>8% grade) fails the 8% highway limit if mislabelled as a road, and passes its 18% trail limit',
  r => r.maxGrade <= (r.grade == null ? 0.08 : r.grade),
  Object.assign({}, trR, { kind: null, grade: null }),
  trR);

// ---- 2. BRIDGES.plan & BRIDGES.check respect per-road grade on trails
const brPlan = BRIDGES.plan(trR, { culture: 'xanadu' });
const brChk = BRIDGES.check([Object.assign({}, trR, { pts: brPlan.road.pts, spans: brPlan.spans })], brPlan.bridges);
T.ok('BRIDGES.plan bridges a mountain trail over a river and BRIDGES.check honours its 18% grade (' + brPlan.bridges.length + ' bridge)',
  brPlan.bridges.length >= 1 && !brPlan.errors.length && brChk.ok);
const badBridgeRoad = Object.assign({}, trR, { grade: 0.05, pts: brPlan.road.pts, spans: brPlan.spans });
T.neg('BRIDGES.check catches a trail whose grade exceeds a tighter ruling limit',
  rd0 => BRIDGES.check([rd0], brPlan.bridges).ok, badBridgeRoad, Object.assign({}, trR, { pts: brPlan.road.pts, spans: brPlan.spans }));

// ---- 3. KSITES.plan ways: point-started trail, boundary clipping (`short`), and stops along a way
const kit = {
  dims: k => (k === 'xa_inn' ? { w: 12, d: 10, h: 6 } : k === 'xa_rest' ? { w: 7, d: 6, h: 4 } : null),
  programs: () => null
};
/* flatten slope near the trail in a gentler corridor so waystations find good ground (<28% slope, dry) */
const origH = WORLD.Hland;
global.WORLD.Hland = (x, z) => (Math.abs(z) < 22 ? 554 : 560 + z * 0.12);
global.WORLD.H = global.WORLD.Hland;

const SPEC = {
  region: 'twins-test',
  world: 42,
  bridges: { culture: 'xanadu' },
  sites: { foot: {}, crest: {} },
  ways: [
    {
      id: 'steaming-dash',
      from: { px: [99.5, 96.5], id: 'strongbow' }, /* outside south boundary (-1000, -7000) -> clipped inside at shortStart! */
      to: 'crest',
      kind: 'trail',
      stops: { every: 3200, inn: 'xa_inn', rest: 'xa_rest', culture: 'xanadu', look: 800, drop: 5 }
    },
    {
      id: 'hermitage-path',
      from: 'foot',
      to: { px: [100.8, 104.0] }, /* outside north boundary -> clipped at end (`short: true`) */
      kind: 'path'
    }
  ]
};
const P = KSITES.plan(SPEC, kit);
const dash = P.ways.find(w => w.id === 'strongbow/way/steaming-dash');
const herm = P.ways.find(w => w.id === 'foot/way/hermitage-path');

T.ok('point-started trail from outside the cut clips inward (`short: true`), routes at hw=2, and places waystations',
  !!dash && dash.kind === 'trail' && dash.hw === 2 && dash.short === true &&
  WORLD.inside(dash.startAt.x, dash.startAt.z) && (dash.stops || []).length >= 2 && !P.errors.length,
  JSON.stringify({ errors: P.errors, dash: dash && { short: dash.short, stops: (dash.stops || []).length } }));

T.ok('site-to-point `path` way uses hw=1.2, grade=0.25, and clips cleanly before leaving the cut',
  !!herm && herm.kind === 'path' && herm.hw === 1.2 && herm.grade === 0.25 && herm.short === true && WORLD.inside(herm.end.x, herm.end.z));

const chk = KSITES.check(P);
T.ok('KSITES.check validates point-started ways, stops on ways, and trail bridges with zero problems',
  chk.ok && chk.counts.ways === 2 && chk.counts.stops >= 2, JSON.stringify(chk.problems));

const brokenStart = JSON.parse(JSON.stringify(P));
brokenStart.ways[0].pts[0][0] += 400;
T.neg('KSITES.check catches a point-started way whose first vertex drifts off startAt',
  pl => KSITES.check(pl).ok, brokenStart, P);

const stopOnRoad = JSON.parse(JSON.stringify(P));
stopOnRoad.ways[0].stops[0].records[0].x = stopOnRoad.ways[0].pts[5][0];
stopOnRoad.ways[0].stops[0].records[0].z = stopOnRoad.ways[0].pts[5][1];
T.neg('KSITES.check catches a waystation placed onto its trail carriageway',
  pl => KSITES.check(pl).ok, stopOnRoad, P);

global.WORLD.Hland = origH;
global.WORLD.H = origH;
