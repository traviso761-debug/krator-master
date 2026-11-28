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

/* 2. All four preset states (including 'marginal') pass AF_RULES.checks */
for (const st of ['refurbished', 'intact', 'ruined', 'marginal']) {
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
function auditFurnishedRooms(rooms, adapter) {
  const fails = [];
  const seen = new Set();
  for (const r of rooms) {
    const tKey = (r.socketKey || '') + '|' + r.template;
    if (seen.has(tKey)) continue;
    seen.add(tKey);
    if (r.recipe) {
      const ar = AI.audit(r.recipe, cat);
      if (!ar.ok) fails.push(r.R.id + ' recipe: ' + JSON.stringify(ar.fails[0]));
      if (r.recipe.missing && r.recipe.missing.length) fails.push(r.R.id + ' missing dress keys: ' + r.recipe.missing.join(','));
    } else {
      const ar = IX.audit(r.room, r.plan, r.adapter || adapter);
      if (!ar.ok) fails.push(r.R.id + ' placer: ' + JSON.stringify(ar.fails[0]));
    }
  }
  return fails;
}
auditFails.push(...auditFurnishedRooms(FA.full.rooms, FA.full.adapter));
T.ok('all 12 interior zones furnish cleanly and pass IX.audit / AI.audit (' + totalPieces + ' pieces, ' + totalTemplates + ' templates)',
  auditFails.length === 0 && totalPieces >= 250, auditFails.slice(0, 5).join(' | '));

/* 5. Culture socket test: every registered socket profile furnishes kept rooms cleanly */
const socketBad = [];
for (const skName of Object.keys(AF_INT.SOCKETS)) {
  const sk = AF_INT.SOCKETS[skName];
  const targetUnit = skName === 'shorekin' ? B1.units.find(u => u.id === 'harbour_works') : B1.units.find(u => u.id === 'rotunda');
  const F = AI.furnishPlan(targetUnit.plan, cat, { culture: sk.culture, cultures: sk.cultures, wealth: sk.wealth, seed: 19 });
  if (F.pieces < 30) socketBad.push(skName + ':' + F.pieces);
}
T.ok('culture socket furnishes target halls across all 8 culture profiles (' + Object.keys(AF_INT.SOCKETS).join(', ') + ')',
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

/* 7. Phase P2 — Per-Zone State ('marginal', custom zone maps, ARCOFORTE_OPTS load-time support) */
T.ok('ARCOFORTE.ZONES lists all 6 canonical zones in order',
  JSON.stringify(ARCOFORTE.ZONES) === JSON.stringify(['harbour', 'bastions', 'ring', 'towers_upper', 'vaults', 'crown']),
  JSON.stringify(ARCOFORTE.ZONES));

const margZones = ARCOFORTE.state('marginal');
T.ok('ARCOFORTE.state("marginal") sets lower zones refurbished and upper/vault zones ruined',
  margZones.harbour === 'refurbished' && margZones.bastions === 'refurbished' && margZones.ring === 'refurbished' &&
  margZones.towers_upper === 'ruined' && margZones.vaults === 'ruined' && margZones.crown === 'ruined' &&
  ARCOFORTE.zoneState('harbour') === 'refurbished' && ARCOFORTE.zoneState('crown') === 'ruined' &&
  ARCOFORTE.zoneState('towers_upper') === 'ruined' && ARCOFORTE.zoneState('vaults') === 'ruined');

const PMarg = ARCOFORTE.plan({ seed: 14800 });
const BMarg = AF_INT.buildPlans(AI, null, PMarg);
const tCentral = BMarg.units.find(u => u.id === 'tower_central');
T.ok('marginal plan keeps harbour, bastions, ring & lower tower storeys while ruining upper towers, vaults & crown',
  PMarg.harbour.kept === true && PMarg.subcliff.works.kept === true && PMarg.subcliff.autoVaults.kept === false &&
  PMarg.skyCrown.kept === false && PMarg.rotunda.kept === true &&
  BMarg.units.find(u => u.id === 'sky_crown').kept === false &&
  BMarg.units.find(u => u.id === 'auto_vaults').kept === false &&
  tCentral.storeys[0].kept === true && tCentral.storeys[2].kept === true &&
  tCentral.storeys[3].kept === false && tCentral.storeys[5].kept === false);

{
  const customMap = { default: 'ruined', harbour: 'refurbished', bastions: 'intact', vaults: 'intact' };
  ARCOFORTE.state(customMap);
  const PCust = ARCOFORTE.plan({ seed: 14800 });
  const BCust = AF_INT.buildPlans(AI, null, PCust);
  const custRules = AF_RULES.checks(PCust, BCust).filter(c => !c.pass);
  T.ok('custom zone state map applies per-zone states and passes AF_RULES',
    ARCOFORTE.zoneState('harbour') === 'refurbished' && ARCOFORTE.zoneState('bastions') === 'intact' &&
    ARCOFORTE.zoneState('vaults') === 'intact' && ARCOFORTE.zoneState('ring') === 'ruined' &&
    ARCOFORTE.zoneState('crown') === 'ruined' && BCust.units.find(u => u.id === 'auto_vaults').kept === true &&
    custRules.length === 0, custRules.map(c => c.name + ': ' + c.detail).join(' | '));
}

{
  /* Test ARCOFORTE_OPTS at load time before 30-af-plan.js runs */
  const sb = {
    KRAND: global.KRAND,
    WATER: global.WATER,
    ARCOFORTE_OPTS: {
      state: 'marginal',
      socket: { bastions: 'fleetborn', ring: 'fleetborn', harbour: 'shorekin' }
    }
  };
  sb.globalThis = sb;
  vm.runInNewContext(fs.readFileSync(path.join(HERE, 'src/30-af-plan.js'), 'utf8') + ';\nglobalThis._AF_BOOT = ARCOFORTE;', sb);
  const AB = sb._AF_BOOT;
  T.ok('ARCOFORTE_OPTS configures state and per-zone socket at load time before 30-af-plan.js',
    AB.zoneState('harbour') === 'refurbished' && AB.zoneState('crown') === 'ruined' &&
    AB.zoneSocket('bastions') === 'fleetborn' && AB.zoneSocket('ring') === 'fleetborn' &&
    AB.zoneSocket('harbour') === 'shorekin' && AB.zoneSocket('crown') === null && AB.zoneSocket('vaults') === null);
}

/* 8. Phase P2 — Fleet-born ('fleetborn') & Shore-kin ('shorekin') sockets + per-zone socket maps */
ARCOFORTE.state('marginal');
{
  const fbRes = ARCOFORTE.socket('fleetborn');
  const fbFurn = AF_INT.furnishAll(AI, BMarg, cat, 'fleetborn', 11);
  const fbAud = auditFurnishedRooms(fbFurn.full.rooms, fbFurn.full.adapter);
  const fbKeys = new Set();
  fbFurn.full.rooms.forEach(r => r.placements.forEach(p => fbKeys.add(p.key)));
  const fbExpected = [
    'af_fleetborn_hammock_gallery',
    'af_fleetborn_dive_rack',
    'af_fleetborn_paktong_lamp',
    'af_fleetborn_byssus_curtain',
    'af_fleetborn_tally_board'
  ];
  const hasLithophone = fbKeys.has('af_fleetborn_lithophone') || fbKeys.has('af_fleetborn_lithophone_stand');
  const missSig = fbExpected.filter(k => !fbKeys.has(k));
  /* Verify batch geometry builds cleanly for every Fleet-born piece */
  const batchTest = KF.batch({ indexed: true });
  AF_INT.SOCKET_PIECES.filter(s => s.culture === 'fleetborn').forEach((s, i) => {
    batchTest.place(s.key, i * 3, 0, 0, 0, { seed: 1, wealth: 0.56 });
  });
  const batchGroup = batchTest.flush();
  let fbVerts = 0;
  batchGroup.traverse(o => { if (o.isMesh && o.geometry) fbVerts += o.geometry.attributes.position.count; });

  T.ok('socket("fleetborn") places caretaker fittings ONLY in habitable bastions & ring, never in harbour, vaults, upper towers or crown',
    fbRes.zones.bastions === 'fleetborn' && fbRes.zones.ring === 'fleetborn' &&
    fbRes.zones.harbour === null && fbRes.zones.vaults === null && fbRes.zones.crown === null &&
    fbFurn.byUnit.harbour_works.pieces === 0 && fbFurn.byUnit.auto_vaults.pieces === 0 &&
    fbFurn.byUnit.sky_crown.pieces === 0 &&
    fbFurn.byUnit.bastion_west.pieces > 0 && fbFurn.byUnit.rotunda.pieces > 0 &&
    fbFurn.byUnit.tower_central.rooms.every(r => r.R.level <= 2) &&
    missSig.length === 0 && hasLithophone && fbAud.length === 0 && fbVerts > 200,
    'miss=' + missSig.join(',') + ' litho=' + hasLithophone + ' aud=' + fbAud.slice(0, 3).join('|'));
}

{
  const skRes = ARCOFORTE.socket('shorekin');
  const skFurn = AF_INT.furnishAll(AI, BMarg, cat, 'shorekin', 11);
  const skAud = auditFurnishedRooms(skFurn.full.rooms, skFurn.full.adapter);
  const skKeys = new Set();
  skFurn.full.rooms.forEach(r => r.placements.forEach(p => skKeys.add(p.key)));
  const skExpected = [
    'af_shorekin_travertine_screen',
    'af_shorekin_tally_slate',
    'af_shorekin_pitch_pot',
    'af_shorekin_caulking_bench',
    'af_shorekin_rope_coils'
  ];
  const missSk = skExpected.filter(k => !skKeys.has(k));
  const shorePieces = AF_INT.SOCKET_PIECES.filter(s => s.culture === 'shorekin');
  const hasBunkAndMat = shorePieces.some(s => s.key === 'af_shorekin_mangrove_bunk') &&
    shorePieces.some(s => s.key === 'af_shorekin_pandanus_mat');
  const bannedMat = JSON.stringify({ pal: AF_INT.PALETTES.shorekin, pieces: shorePieces });
  const zeroNephriteOrRedCypress = !/nephrite|red[\s_-]*cypress/i.test(bannedMat);

  const batchTest = KF.batch({ indexed: true });
  shorePieces.forEach((s, i) => {
    batchTest.place(s.key, i * 3, 0, 0, 0, { seed: 1, wealth: 0.44 });
  });
  const batchGroup = batchTest.flush();
  let skVerts = 0;
  batchGroup.traverse(o => { if (o.isMesh && o.geometry) skVerts += o.geometry.attributes.position.count; });

  T.ok('socket("shorekin") places Arch local/sea fittings ONLY in harbour works with zero nephrite or red cypress',
    skRes.zones.harbour === 'shorekin' && skRes.zones.bastions === null && skRes.zones.ring === null &&
    skFurn.byUnit.harbour_works.pieces > 40 && skFurn.byUnit.rotunda.pieces === 0 &&
    skFurn.byUnit.bastion_west.pieces === 0 && skFurn.byUnit.auto_vaults.pieces === 0 &&
    missSk.length === 0 && hasBunkAndMat && zeroNephriteOrRedCypress && skAud.length === 0 && skVerts > 150,
    'miss=' + missSk.join(',') + ' aud=' + skAud.slice(0, 3).join('|'));
}

{
  const mapTwo = { bastions: 'fleetborn', harbour: 'shorekin' };
  ARCOFORTE.socket(mapTwo);
  T.ok('per-zone socket map {bastions:"fleetborn", harbour:"shorekin"} resolves via ARCOFORTE.zoneSocket',
    ARCOFORTE.zoneSocket('bastions') === 'fleetborn' &&
    ARCOFORTE.zoneSocket('harbour') === 'shorekin' &&
    ARCOFORTE.zoneSocket('ring') === null &&
    ARCOFORTE.zoneSocket('crown') === null &&
    ARCOFORTE.zoneSocket('vaults') === null);

  const mapThree = { bastions: 'fleetborn', ring: 'fleetborn', harbour: 'shorekin' };
  ARCOFORTE.socket(mapThree);
  const mixFurn = AF_INT.furnishAll(AI, BMarg, cat, mapThree, 11);
  const mixAud = auditFurnishedRooms(mixFurn.full.rooms, mixFurn.full.adapter);
  const harbCults = new Set();
  mixFurn.byUnit.harbour_works.rooms.forEach(r => r.placements.forEach(p => harbCults.add(KF.FURN_BY_KEY[p.key].culture)));
  const bastCults = new Set();
  mixFurn.byUnit.bastion_west.rooms.forEach(r => r.placements.forEach(p => bastCults.add(KF.FURN_BY_KEY[p.key].culture)));
  T.ok('mixed per-zone socket map furnishes harbour with shorekin and bastions/ring with fleetborn simultaneously',
    mixFurn.byUnit.harbour_works.pieces > 40 && mixFurn.byUnit.bastion_west.pieces > 100 &&
    mixFurn.byUnit.rotunda.pieces > 100 && mixFurn.byUnit.auto_vaults.pieces === 0 &&
    mixFurn.byUnit.sky_crown.pieces === 0 &&
    harbCults.has('shorekin') && !harbCults.has('fleetborn') &&
    bastCults.has('fleetborn') && !bastCults.has('shorekin') &&
    mixAud.length === 0, mixAud.slice(0, 3).join(' | '));
}

/* 9. Phase P2 — Negative contract tests (unknown state/zone/culture & ruined/sealed zone rejection) */
const canSetState = s => { try { ARCOFORTE.state(s); return true; } catch (e) { return false; } };
const canReadZone = z => { try { ARCOFORTE.zoneState(z); return true; } catch (e) { return false; } };
const canSetSocket = s => { try { ARCOFORTE.socket(s); return true; } catch (e) { return false; } };
const canReadSocketZone = z => { try { ARCOFORTE.zoneSocket(z); return true; } catch (e) { return false; } };

ARCOFORTE.state('marginal');
T.neg('unknown state string is rejected by ARCOFORTE.state', canSetState, 'atlantis', 'marginal');
T.neg('unknown zone key is rejected by ARCOFORTE.state', canSetState, { undersea: 'intact' }, { default: 'ruined', harbour: 'refurbished' });
T.neg('unknown zone key is rejected by ARCOFORTE.zoneState', canReadZone, 'undersea', 'harbour');
T.neg('unknown zone key is rejected by ARCOFORTE.zoneSocket', canReadSocketZone, 'undersea', 'harbour');

ARCOFORTE.state('marginal');
T.neg('ruined crown rejects socket furnishings', canSetSocket, { crown: 'iziz' }, { ring: 'iziz' });
T.neg('sealed/ruined vaults reject socket furnishings', canSetSocket, { vaults: 'ancient' }, { bastions: 'fleetborn' });
T.neg('fleetborn rejected in harbour zone', canSetSocket, { harbour: 'fleetborn' }, { harbour: 'shorekin' });
T.neg('shorekin rejected in ring zone', canSetSocket, { ring: 'shorekin' }, { ring: 'fleetborn' });
T.neg('unknown culture rejected in ARCOFORTE.socket', canSetSocket, 'martian', 'fleetborn');

ARCOFORTE.state('refurbished');
ARCOFORTE.socket('refurbished');

T.done();
