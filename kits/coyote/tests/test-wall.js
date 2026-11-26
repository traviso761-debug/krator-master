/* node kits/coyote/tests/test-wall.js: the Gate's long-wall planner (src/35-cy-wall-plan.js) on core/city's site wall
   (KCITY.site.wall, KCITY.site.wallSegs, read in place). Each negative is a fault and its fix (tools/ktest.js). */
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
global.window = global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'core/rand/08-core-rand.js'), 'utf8'), { filename: '08-core-rand.js' });
/* load core/city's site wall in one closure, as build.py's 19-kcity-site.js does */
const citySrc = ['10-city-core.js', '15-city-ground.js', '25-city-site.js', '33-city-strategies.js']
  .map(f => fs.readFileSync(path.join(ROOT, 'core/city', f), 'utf8')).join('\n');
vm.runInThisContext('var KCITY=(function(){' + citySrc + '\nKCITY.lib={V:V,plFrame:plFrame,resample:resample,plLen:plLen,segDist:segDist,ryFacing:ryFacing};return KCITY;})();', { filename: 'kcity-site' });
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'kits/coyote/src/35-cy-wall-plan.js'), 'utf8'), { filename: '35-cy-wall-plan.js' });

const baseSpec = o => Object.assign({
  id: 'narrows', world: 13,
  chain: [[-70, 0], [70, 0]],
  ways: [
    { id: 'hounds-road', name: 'Hounds Road', kind: 'road', pts: [[-32, -30], [-32, 30]] },
    { id: 'hau-gel', name: 'Hau-Gel', kind: 'river', pts: [[32, -30], [32, 30]] }
  ],
  towerGap: 35,
  posternSeg: 1,
  slumpedSegs: [3],
  slumpedTowers: [2]
}, o || {});

const P = cyWallPlan(baseSpec());
T.ok('the wall lays with no error: three towers, one toll gate on the road and one water gate on the river',
  !P.error && P.nodes.length === 5 && P.gates.length === 1 && P.waterGates.length === 1 && P.segs.length === 4,
  P.error || (P.nodes.map(n => n.key).join(', ') + ' / ' + P.segs.map(s => s.key + (s.v ? '#1' : '')).join(', ')));
T.ok('an empty or one-point chain returns an error, not an exception',
  !!cyWallPlan({ chain: [[0, 0]] }).error && !!cyWallPlan({}).error);
T.ok('the road crosses through cy_toll_gate and the river through cy_water_gate at their exact crossings',
  Math.abs(P.gates[0].x - (-32)) < 1e-6 && Math.abs(P.waterGates[0].x - 32) < 1e-6);

/* foot-to-foot and closed-wall check: every consecutive node and curtain run meets with no open gap */
const closedOk = W => {
  if (!W.nodes.length || W.segs.length !== W.nodes.length - 1) return false;
  const fA = Math.hypot(W.nodes[0].x - W.footA[0], W.nodes[0].z - W.footA[1]);
  const fB = Math.hypot(W.nodes[W.nodes.length - 1].x - W.footB[0], W.nodes[W.nodes.length - 1].z - W.footB[1]);
  if (fA > 1 || fB > 1) return false;
  for (let i = 0; i < W.segs.length; i++) {
    const A = W.nodes[i], B = W.nodes[i + 1], S = W.segs[i];
    const dA = Math.hypot(S.ax - A.x, S.az - A.z) - A.w / 2;
    const dB = Math.hypot(S.bx - B.x, S.bz - B.z) - B.w / 2;
    if (dA > 0.05 || dB > 0.05) return false;
  }
  return true;
};
T.neg('the wall reaches both feet and every curtain sockets into its towers and gates with no gap',
  closedOk, cyWallPlan(baseSpec({ towerInset: 6.5 })), P);

T.ok('the postern and the slumped stretches carry their keys, variants and states',
  P.segs[1].key === 'cy_postern' && P.segs[1].v === 0 &&
  P.segs[3].key === 'cy_wall_run' && P.segs[3].v === 1 && P.segs[3].state === 'ruined' &&
  P.nodes[4].v === 1 && P.nodes[4].state === 'ruined');

/* orientation on an angled chain: local +x runs along each segment, local +z faces outward */
const angled = cyWallPlan({
  id: 'bent', chain: [[-50, -30], [50, 30]],
  ways: [{ id: 'rd', kind: 'road', pts: [[15, -25], [-15, 25]] }],
  towerGap: 40
});
const alignedOk = W => W.segs.every(s => {
  const ux = (s.bx - s.ax) / s.w, uz = (s.bz - s.az) / s.w;
  const lx = Math.cos(s.ry), lz = -Math.sin(s.ry);
  return Math.abs(ux * lx + uz * lz) > 0.999;
});
T.neg('on an angled valley line, every curtain segment turns its local +x along its run',
  alignedOk, Object.assign({}, angled, { segs: angled.segs.map(s => Object.assign({}, s, { ry: s.ry + 0.4 })) }), angled);

T.ok('the same spec lays the exact same wall records',
  JSON.stringify(cyWallPlan(baseSpec()).records) === JSON.stringify(P.records));

T.done();
