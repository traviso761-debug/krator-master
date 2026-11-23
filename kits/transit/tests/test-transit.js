'use strict';
/* Node verification suite for kits/transit (KCANAL / TR_VESSEL).
   Tests both:
     1) Pure [G data] layer (40-tr-canal.js, 41-tr-locks.js, 42-tr-transit.js, 85-tr-demo-plan.js) with zero THREE & zero DOM
     2) [draw] canal vessel registry & built bounding-box verification (70-tr-canal-draw.js, 72-tr-canal-vessels.js) against Three.js r128 + KTAGS
   Every check includes a paired negative test (T.neg) proving fault detection. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);

/* ---- Part A: Pure [G data] Sandbox (zero THREE, zero DOM) ---- */
const ctx = { console, Math, Object, Array, Number, String, Boolean, JSON, Float32Array, Float64Array, Int32Array, Uint32Array, Uint8Array, Uint8ClampedArray, Uint16Array, Map, Set, Error };
ctx.window = ctx;
ctx.globalThis = ctx;
ctx.self = ctx;
vm.createContext(ctx);

function loadIn(targetCtx, rel) {
  const full = path.join(ROOT, rel);
  vm.runInContext(fs.readFileSync(full, 'utf8'), targetCtx, { filename: rel });
}

[
  'core/rand/08-core-rand.js',
  'core/sched/20-core-sched.js',
  'core/space/20-core-space.js',
  'core/mask/25-core-mask.js',
  'core/tags/50-core-tags.js',
  'core/tags/52-core-tags-vocab.js',
  'kits/transit/src/40-tr-canal.js',
  'kits/transit/src/41-tr-locks.js',
  'kits/transit/src/42-tr-transit.js',
  'kits/transit/src/85-tr-demo-plan.js'
].forEach(rel => loadIn(ctx, rel));

const K = ctx.KCANAL;
const D = ctx.TR_DEMO;

/* 1. Pound monotonicity & 2-riser flight synchronization */
T.ok('demo stepped pounds P1 (+15.20 m) > P0 (+12.00 m) monotonic with 3.20 m lift',
  K.poundsMonotonic(D.pounds, 3.20) && ctx.KTRANSIT_CANAL === K,
  JSON.stringify(D.pounds.map(p => p.id + '=' + p.wlev)));
T.neg('pound monotonicity catches inverted pound elevation',
  ps => K.poundsMonotonic(ps, 3.20),
  [{ wlev: 12.0 }, { wlev: 15.2 }],
  D.pounds);

/* 2. Miter-gate zero-head law across single & twin 2-riser flights */
const twinFlight = K.lockFlight({
  id: 'L_TEST', risers: 2, lanes: 2, s0: -28, chamberLen: 27.2, chamberW: 5.6, yLow: 45.87, yHigh: 52.47, period: 360
}, D.frame);

function allChambersObeyMiterLaw(chambers) {
  for (const ch of chambers) {
    for (let t = 0; t < 360; t += 1) {
      if (!K.miterLawOk(K.lockState(ch, t))) return false;
    }
  }
  return true;
}
T.ok('single-riser and twin 2-riser lock flights obey zero-head miter-gate law across all 360 s samples',
  twinFlight.chambers.length === 4 && twinFlight.maxRiserLift <= 3.50 &&
  allChambersObeyMiterLaw([D.chamber].concat(twinFlight.chambers)),
  'chambers=' + twinFlight.chambers.length + ' lift=' + twinFlight.maxRiserLift);
T.neg('miterLawOk rejects miter gate open against 1.8 m hydraulic head',
  K.miterLawOk,
  { lowerGateDeg: 40, headLow: 1.80, upperGateDeg: 0, headHigh: 1.40 },
  K.lockState(D.chamber, 20));

/* 3. End-to-End Barge Transit across Lock, Bridge, 2-Arch Aqueduct & Turning Basin */
const bargeSpec = { L: 16.5, B: 3.6, H: 1.88, draft: 1.05 };
const auditGood = K.auditTransit(D.bargeCourse, D.net, bargeSpec, { dt: 1.0, airMargin: 0.50 });
T.ok('et_canal_barge completes full 1080 s lock + bridge + aqueduct + turning-basin round-trip with 0 collisions & exact flotation',
  auditGood.ok &&
  auditGood.stagesSeen.ENTERING_LOCK > 0 &&
  auditGood.stagesSeen.LOCK_LIFTING > 0 &&
  auditGood.stagesSeen.SAIL_UPPER_AND_AQUEDUCT > 0 &&
  auditGood.stagesSeen.TURNING_BASIN > 0 &&
  auditGood.stagesSeen.LOCK_EMPTYING > 0,
  'samples=' + auditGood.samples + ' stages=' + Object.keys(auditGood.stagesSeen).length);

const crashGateCourse = K.transitCourse({
  id: 'bad.gate_crash', vesselKey: 'et_canal_barge', period: 360, frame: D.frame,
  stages: [{ t0: 0, t1: 360, kind: 'sail', u0: 0, s0: -26, u1: 0, s1: 26, yaw: D.frame.VYAW_S, wlev: 12.0 }]
});
T.neg('auditTransit catches barge colliding with closed miter-gate leaves',
  crs => K.auditTransit(crs, D.net, bargeSpec, { dt: 2.0 }).ok,
  crashGateCourse,
  D.bargeCourse);

/* 4. Bridge Air-Draft Strike Detection */
T.ok('demo humpback cart bridge clears et_canal_barge air-draft with > 1.0 m margin',
  K.bridgeClearsVessel(D.bridges[0], bargeSpec, 0.65) && K.aqueductOk(D.aqueducts[0], 3.50),
  'bridgeAir=' + D.bridges[0].airDraft + 'm aqUnderpass=' + D.aqueducts[0].underpassClearance + 'm');

const lowBridgeNet = K.network({
  frame: D.frame, pounds: D.pounds, troughs: D.troughs, chambers: D.lockFlight.chambers, aqueducts: D.aqueducts,
  bridges: [Object.assign({}, D.bridges[0], { soffitY: 16.60 })] /* 16.60 - 15.20 = 1.40 m < 1.88 m barge H! */
});
T.neg('auditTransit catches barge superstructure striking an undersized low canal bridge',
  net => K.auditTransit(D.bargeCourse, net, bargeSpec, { dt: 2.0 }).ok,
  lowBridgeNet,
  D.net);

/* 5. Street-in-Canal Intrusion Clipping & KMASK Road Zeroing */
const clearClipped = K.streetClearOfCanals(D.ways, D.net, { margin: 0.6 });
const maskAudit = D.roadMask.auditZeroOnCanals();
T.ok('clipStreetWays & buildRoadMask leave 0 street intrusions in canal troughs and 0 road pixels on water',
  clearClipped.ok && maskAudit.ok && D.ways.length >= 4,
  'clippedWays=' + D.ways.length + ' maskTested=' + maskAudit.tested + ' hash=' + maskAudit.hash);
T.neg('streetClearOfCanals catches unclipped street running across a canal trough',
  ws => K.streetClearOfCanals(ws, D.net, { margin: 0.6, allowBridgeDeck: false }).ok,
  D.rawWays,
  D.ways);

/* ---- Part B: [draw] Vessel Registry, Three.js Bounding Box & KTAGS 'vessel' Verification ---- */
const threePath = path.join(ROOT, 'kits', 'ringsea', 'three.min.js');
const drawCtx = { console, Math, Object, Array, Number, String, Boolean, JSON, Float32Array, Float64Array, Int32Array, Uint32Array, Uint8Array, Uint8ClampedArray, Uint16Array, Map, Set, Error };
drawCtx.window = drawCtx;
drawCtx.globalThis = drawCtx;
drawCtx.self = drawCtx;
vm.createContext(drawCtx);
vm.runInContext(fs.readFileSync(threePath, 'utf8'), drawCtx, { filename: 'three.min.js' });
[
  'core/rand/08-core-rand.js',
  'core/sched/20-core-sched.js',
  'core/space/20-core-space.js',
  'core/tags/50-core-tags.js',
  'core/tags/52-core-tags-vocab.js',
  'kits/transit/src/40-tr-canal.js',
  'kits/transit/src/41-tr-locks.js',
  'kits/transit/src/42-tr-transit.js',
  'kits/transit/src/70-tr-canal-draw.js',
  'kits/transit/src/72-tr-canal-vessels.js'
].forEach(rel => loadIn(drawCtx, rel));

const KD = drawCtx.KCANAL;
const VREG = drawCtx.TR_VESSELS;
const tags = drawCtx.KTAGS.create({ build: 'transit-test' });

const dimAudits = VREG.order.map(k => KD.auditVesselDims(k, 0, 0.16));
T.ok('all 3 canal vessels (et_canal_barge, et_tow_scow, et_inspection_launch) match declared L x B x H & draft within 0.16 m',
  VREG.order.length === 3 && dimAudits.every(a => a.ok),
  dimAudits.map(a => a.key + ':' + a.built.L + 'x' + a.built.B + 'x' + a.built.H + '/d=' + a.built.draft).join(' '));

KD.defVessel({
  key: '_bad_box_barge', name: 'Bad Box Barge', culture: 'eternian', L: 16.5, B: 3.6, H: 1.88, draft: 1.05,
  tags: { type: ['barge'], propulsion: 'tow', hull: 'monohull', wealth: 'poor', crew: 1, role: 'test' },
  build: function () {
    KD.reseed(75999);
    const B = KD.geom.bucket();
    KD.geom.box(B, 'timber', 0, -0.5, 0, 9.0, 4.2, 2.0, 0x443322); /* Wrong L=9, H=3.7! */
    return { group: KD.geom.bake(B, null, 'bad'), anims: [], deckY: 0.5 };
  }
});
T.neg('auditVesselDims catches vessel whose built mesh disagrees with declared L x B x H',
  k => KD.auditVesselDims(k, 0, 0.16).ok,
  '_bad_box_barge',
  'et_canal_barge');

/* Verify KTAGS 'vessel' registration for all 3 vessels + all 4 cargo variants of et_canal_barge */
for (let v = 0; v < 4; v++) {
  const b = KD.buildVessel('et_canal_barge', { v });
  T.ok('et_canal_barge variant ' + v + ' builds walkable deckY > 0.5 m with 0 NaN vertices',
    b && b.deckY > 0.5 && b.group.children.length >= 4,
    'deckY=' + b.deckY.toFixed(2) + ' meshes=' + b.group.children.length);
  KD.registerVesselTag(tags, b.def, { x: v * 25, y: 12.0, z: 0, yaw: 0 });
}
KD.registerVesselTag(tags, 'et_tow_scow', { x: 100, y: 12.0, z: 0, yaw: 0 });
KD.registerVesselTag(tags, 'et_inspection_launch', { x: 125, y: 12.0, z: 0, yaw: 0 });

const tagAudit = tags.audit();
const vesselTags = tags.query({ 'class': 'vessel' });
T.ok('every registered barge/scow/launch has KTAGS class "vessel", culture "eternian", and 0 unknown vocabulary keys/values',
  vesselTags.length === 6 && tagAudit.byClass.vessel === 6 && tagAudit.unknown === 0,
  JSON.stringify(tagAudit));

/* Multi-culture canal style extensibility check */
const stylesBuilt = ['eternian', 'republican', 'marr', 'dalab', 'voth'].map(st => {
  const grp = KD.draw.lockRiser({ lanes: 1, chamberW: 5.2, chamberLen: 26.0 }, { style: st, seed: 75500 });
  return grp && grp.children.length >= 3;
});
T.ok('all 5 culture canal styles (eternian, republican, marr, dalab, voth) build miter-lock chambers cleanly',
  stylesBuilt.every(Boolean),
  'styles=5');

T.done();
