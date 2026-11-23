/* node settlements/qoold-lheek/tests/test-qoold-lheek.js
   Verifies Qoold Lheek's [G data] layout (src/30-ql-layout.js) against its rules (src/31-ql-rules.js) and KCITY.covered.
   Every rule passes on the unbroken layout, and each has a negative: a copy broken in that one way must fail that rule. */
'use strict';
const T = require('../../../tools/ktest.js')(__filename);
const L = require('../src/30-ql-layout.js');
const Q = require('../src/31-ql-rules.js');

const clone = () => JSON.parse(JSON.stringify(L));
const part = (M, id) => M.parts.find(p => p.id === id);
const rule = name => M => Q.RULES[name](M).length === 0;

/* ---- every rule passes on QOOLD_LAYOUT */
Q.checks(L).forEach(c => T.ok(c.name, c.pass, c.detail));

/* ---- each rule's mutated negative: [ruleName, mutator] */
const NEG = [
  ['every part, snow fence, leat, way and sight has a unique id',
    M => { M.parts.push(Object.assign({}, part(M, 'quunsul.hall'))); }],
  ['every Yeti kit part uses a registered kit key and its exact (w, d) footprint',
    M => { part(M, 'chief.hall').box[1] += 3.5; }],
  ['every Yeti kit part uses a registered kit key and its exact (w, d) footprint',
    M => { part(M, 'shrine.lake').kit = 'yt_nonexistent'; }],
  ['every part stands wholly inside its terrain zone (and town parts stay outside state)',
    M => { part(M, 'pycrete.n').box = [280, 296, -26, -14]; }],
  ['every part stands wholly inside its terrain zone (and town parts stay outside state)',
    M => { part(M, 'clan.isiit.seat').box = [-30, -6.66, 10, 25.74]; }],
  ['no two parts on the same level overlap',
    M => { part(M, 'smithy.state').box = part(M, 'bath.state').box.slice(); }],
  ['permafrost & flood rule: no heated building stands on thaw-unstable ground or lacks a ventilated plinth',
    M => { part(M, 'fort.muster').heated = true; }],
  ['permafrost & flood rule: no heated building stands on thaw-unstable ground or lacks a ventilated plinth',
    M => { part(M, 'chief.hall').plinth = 'raw_earth'; }],
  ['ice & pycrete rule: quarries sit on Cold Lake ice (y <= 0.5) and pycrete works sit on the apron near ice & aufeis',
    M => { part(M, 'quarry.n').y = 8.0; }],
  ['ice & pycrete rule: quarries sit on Cold Lake ice (y <= 0.5) and pycrete works sit on the apron near ice & aufeis',
    M => { part(M, 'pycrete.s').box = [-400, -384, -40, -28]; part(M, 'pycrete.s').zone = 'sunbench'; }],
  ['southern-hemisphere sun rule (27.8S, sun in north): crops & windows face north; ice cellars & larch take shaded south slopes',
    M => { part(M, 'crop.potato.1').zone = 'northbank'; }],
  ['southern-hemisphere sun rule (27.8S, sun in north): crops & windows face north; ice cellars & larch take shaded south slopes',
    M => { part(M, 'cellar.state').windowAspect = 'N'; }],
  ['southern-hemisphere sun rule (27.8S, sun in north): crops & windows face north; ice cellars & larch take shaded south slopes',
    M => { part(M, 'quunsul.hall').windowAspect = 'S'; }],
  ['katabatic wind & snow-drift rule: no door faces into the 300 deg WNW gale and no part stands in a snow-fence drift band',
    M => { part(M, 'chief.hall').doorYaw = 305; }],
  ['katabatic wind & snow-drift rule: no door faces into the 300 deg WNW gale and no part stands in a snow-fence drift band',
    M => { part(M, 'crop.potato.1').box = [-460, -350, 220, 290]; }],
  ['smell & smoke rule: every tannery stands downwind (east/south-east) of the State Heart and clan seats',
    M => { part(M, 'tannery.e1').box = [-180, -170.48, 120, 132.97]; }],
  ['shared thermal-mass rule: every bathhouse stands within 5 m of a smithy or civic hall to share waste heat',
    M => { part(M, 'bath.isnoo').box = [50, 61.5, -230, -214.65]; }],
  ['winter covered-way rule (KCITY.covered): every winterNet building joins one unblocked tunnel tree with warming domes',
    M => { part(M, 'tea.lake').door = [274, -36]; }],
  ['funerary & seven-clans rule: each of the seven clans has one corbelled tomb on dry bedrock above +46 m',
    M => { part(M, 'tomb.musiq').y = 12; }],
  ['funerary & seven-clans rule: each of the seven clans has one corbelled tomb on dry bedrock above +46 m',
    M => { part(M, 'tomb.qiviut').clan = 'Khaay'; }],
  ['watch & sightline rule: every required sightline from a watch tower or cairn clears terrain by 12 m or more',
    M => { M.sights.find(s => s.id === 'sight.leng').clear = 4; }],
  ['everyone has a warm place to sleep: the parts account for all 2,200 permanent citizens',
    M => { part(M, 'chief.hall').sleeps.chief_court = 10; }]
];

NEG.forEach(([name, brk], i) => {
  const bad = clone();
  brk(bad);
  T.neg(name + ' [negative ' + (i + 1) + ']', rule(name), bad, clone());
});

/* ---- scale-model & engineering invariants quoted in PLAN.md */
T.ok('the settlement id is s427qb1kma (Qoold Lheek) at Cold Lake 5,680.41 m',
  L.id === 's427qb1kma' && L.frame.lakeEl === 5680.41 && L.urbanPop === 2200);
const P0 = Q.toPx(L, -2800, 4200);
T.ok('2.8 km west and 4.2 km north of the Crown [411.4, 508.1] lands squarely on the 5.1 pin [410, 506]',
  P0[0] === 410 && P0[1] === 506, P0.join(','));
const net = Q.coveredNet(L);
T.ok('KCITY.covered links all 47 winterNet buildings with zero blocked segments',
  L.parts.filter(p => p.winterNet).length === 47 && net.ways.every(w => !w.blocked),
  'ways=' + net.ways.length + ' junctions=' + net.junctions.length);
T.ok('groundAt puts Cold Lake at 0 m and the Crown above +21 m',
  Q.groundAt(L, 350, -200) === 0 && Q.groundAt(L, 0, 0) > 21);

T.done();
