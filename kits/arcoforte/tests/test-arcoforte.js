/* Node test for kits/arcoforte ([G data] layout, interior plates, audits, culture sockets, and rule negatives).
   Run: node kits/arcoforte/tests/test-arcoforte.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const HERE = path.resolve(__dirname, '..');
const ROOT = path.resolve(HERE, '..', '..');

let IX, AI, KF, ARCOFORTE, AF_INT, AF_RULES;
const cp = require('child_process');

/* Load KRAND, WATER, THREE (for KratorFurniture runtimeAdapter), furniture_bundle, kits/interiors, and kits/ancients-interiors */
const pre = [
  'core/shader/06-core-khook.js',
  'core/shader/06b-core-kcolor.js',
  'core/rand/08-core-rand.js',
  'core/water/20-core-water.js'
].map(p => fs.readFileSync(path.join(ROOT, p), 'utf8')).join(';\n');

global.THREE = require(path.join(ROOT, 'kits/catalog/three.min.js'));
global.document = { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => ({ addColorStop() {} }) }), width: 0, height: 0 }) };

const bundleCode = cp.execFileSync('python3', ['-c',
  "import sys; sys.path.insert(0,'kits/catalog'); sys.path.insert(0,'kits/interiors'); " +
  "import furniture_bundle as fb, kit_bundle as ib, importlib.util; " +
  "s=importlib.util.spec_from_file_location('ab','kits/ancients-interiors/kit_bundle.py'); ab=importlib.util.module_from_spec(s); s.loader.exec_module(ab); " +
  "sys.stdout.write(fb.bundle(['post-apoc','scrap','generic','generic-goods','iziz','xanadu','republican','jobs'], harvested=True) + ';\\n' + ib.bundle(['noahs-regret']) + ';\\n' + ab.bundle())"
], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const afCode = [
  'src/30-af-plan.js',
  'src/31-af-interiors.js',
  'src/32-af-rules.js'
].map(p => fs.readFileSync(path.join(HERE, p), 'utf8')).join(';\n');

(0, eval)(pre + ';\n' + bundleCode + ';\n' + afCode +
  ';\nglobal.WATER=WATER;global.KRAND=KRAND;global._AF=[KratorInteriors,KratorAncientsInteriors,KratorFurniture,ARCOFORTE,AF_INT,AF_RULES];');
[IX, AI, KF, ARCOFORTE, AF_INT, AF_RULES] = global._AF;
AI.IX = IX;
AI.install(IX);
const cat = IX.runtimeAdapter(KF, KF.batch());
AF_INT.installDresses(AI, cat);

/* 1. Determinism */
const P1 = ARCOFORTE.plan({ seed: 14800, state: 'refurbished' });
const P2 = ARCOFORTE.plan({ seed: 14800, state: 'refurbished' });
T.ok('ARCOFORTE.plan is deterministic for the same seed and state', JSON.stringify(P1) === JSON.stringify(P2));

/* 2. All three states pass AF_RULES.checks */
for (const st of ['refurbished', 'intact', 'ruined']) {
  const Ps = ARCOFORTE.plan({ seed: 14800, state: st });
  const Bs = AF_INT.buildPlans(AI, st, Ps);
  const res = AF_RULES.checks(Ps, Bs);
  const bad = res.filter(c => !c.pass);
  T.ok('AF_RULES passes in state ' + st + ' (' + res.length + ' checks)', bad.length === 0,
    bad.map(b => b.name + ': ' + b.detail).join(' | '));
}

/* 3. Rule negatives (T.neg: must fail on the broken copy and pass on the fixed copy) */
const B1 = AF_INT.buildPlans(AI, 'refurbished', P1);
const checkNamed = (re, P, B) => {
  const hit = AF_RULES.checks(P, B).find(c => re.test(c.name));
  return !!(hit && hit.pass);
};

{
  const broken = JSON.parse(JSON.stringify(P1));
  broken.parts[3].id = broken.parts[0].id;
  T.neg('duplicate part id fails unique-id rule', p => checkNamed(/unique part ids/, p, B1), broken, P1);
}
{
  const broken = JSON.parse(JSON.stringify(P1));
  broken.towers[2].yTop = 210;
  T.neg('tower disconnected from sky-crown fails skyscraper rule', p => checkNamed(/seven sea-cliff skyscrapers/, p, B1), broken, P1);
}
{
  const broken = JSON.parse(JSON.stringify(P1));
  broken.cityCenter.skylights[0].x = 0;
  broken.cityCenter.skylights[0].z = 10;
  T.neg('skylight moved into central park fails horseshoe ring rule', p => checkNamed(/horseshoe neocliff/, p, B1), broken, P1);
}
{
  const broken = JSON.parse(JSON.stringify(P1));
  broken.links = broken.links.filter(e => e[0] !== 'af.skycrown.heliport' && e[1] !== 'af.skycrown.heliport');
  T.neg('severed heliport link fails sea-and-land reachability rule', p => checkNamed(/reachable from both/, p, B1), broken, P1);
}
{
  const broken = JSON.parse(JSON.stringify(P1));
  broken.ways.find(w => w.id === 'af.way.stream').pts[2][2] = 95;
  T.neg('uphill waterway step fails monotonic water descent rule', p => checkNamed(/waterways descend/, p, B1), broken, P1);
}
{
  const brokenB = JSON.parse(JSON.stringify(B1));
  brokenB.units.find(u => u.id === 'auto_vaults').kept = true;
  T.neg('unsealed automated vault in refurbished state fails interior refurbishment rule', b => checkNamed(/interiors cover living/, P1, b), brokenB, B1);
}

/* 4. Real furnishing & audit across all 12 units (living, work, rec) + hall recipes via AF_INT.furnishAll */
const FA = AF_INT.furnishAll(AI, B1, cat, 'refurbished', 11);
const totalPieces = FA.full.pieces, totalTemplates = FA.full.templates;
const auditFails = [];
for (const u of B1.units) {
  const uf = FA.byUnit[u.id];
  if (u.kept && uf.pieces === 0) auditFails.push(u.id + ': 0 pieces placed in kept unit');
  if (!u.kept && uf.pieces !== 0) auditFails.push(u.id + ': sealed unit should stay unfurnished by default');
}
const seenTpl = new Set();
for (const r of FA.full.rooms) {
  if (seenTpl.has(r.template)) continue;
  seenTpl.add(r.template);
  if (r.recipe) {
    const ar = AI.audit(r.recipe, cat);
    if (!ar.ok) auditFails.push(r.R.id + ' recipe: ' + JSON.stringify(ar.fails[0]));
    if (r.recipe.missing && r.recipe.missing.length) auditFails.push(r.R.id + ' missing dress keys: ' + r.recipe.missing.join(','));
  } else {
    const ar = IX.audit(r.room, r.plan, FA.full.adapter);
    if (!ar.ok) auditFails.push(r.R.id + ' placer: ' + JSON.stringify(ar.fails[0]));
  }
}
T.ok('all 12 interior zones furnish cleanly and pass IX.audit / AI.audit (' + totalPieces + ' pieces, ' + totalTemplates + ' templates)',
  auditFails.length === 0 && totalPieces >= 250, auditFails.slice(0, 5).join(' | '));

/* 5. Culture socket test: every registered socket profile furnishes kept rooms cleanly */
const socketBad = [];
for (const skName of Object.keys(AF_INT.SOCKETS)) {
  const sk = AF_INT.SOCKETS[skName];
  const rot = B1.units.find(u => u.id === 'rotunda');
  const F = AI.furnishPlan(rot.plan, cat, { culture: sk.culture, cultures: sk.cultures, wealth: sk.wealth, seed: 19 });
  if (F.pieces < 30) socketBad.push(skName + ':' + F.pieces);
}
T.ok('culture socket furnishes the Rotunda across all 6 culture profiles (' + Object.keys(AF_INT.SOCKETS).join(', ') + ')',
  socketBad.length === 0, socketBad.join(', '));

/* 6. Water records, simPlaces & ARCOFORTE.HULL descriptor curves */
const W = ARCOFORTE.waterRecords(P1, global.WATER, null);
const sim = AF_INT.simPlaces(P1, B1, 'refurbished');
const HL = ARCOFORTE.HULL;
T.ok('waterRecords produces reflection pools, waterway stream, and sea-cliff cascade',
  W.still.length === 2 && W.flow.length === 1 && W.fall.length === 1);
T.ok('simPlaces exports SLEEP, WORK, and LEISURE places for host settlements',
  sim.some(s => s.activity === 'SLEEP') && sim.some(s => s.activity === 'WORK') && sim.some(s => s.activity === 'LEISURE'));
T.ok('ARCOFORTE.HULL exposes span, H, toe(x), waterlineZ(x), and plinth.rAt(y) matching concrete faces',
  HL.span === 576 && HL.H === 300 && HL.toe(0) === -242 && HL.toe(180) === ARCOFORTE.cliffZ(180) &&
  HL.waterlineZ(0) === -334 && HL.waterlineZ(-250) === -256 &&
  HL.plinth.rAt(84) === 288 && HL.plinth.rAt(114) === 276 && HL.plinth.rAt(144) === 264);

T.done();
