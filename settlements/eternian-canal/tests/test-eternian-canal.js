'use strict';
/* Comprehensive Node verification for Shuang-Zha (settlements/eternian-canal) reading kits/transit in place.
   Verifies:
     1) Scale Model 5.1 anchor & 4-pound monotonicity
     2) Twin 2-riser bronze miter-lock flights (L1 & L2) & zero-head miter-gate law
     3) Zero street-over-canal intrusions across all ways & 0 KMASK road pixels on canals (+ paired negative)
     4) Full 6-ward & 4-quadrant (NW/NE/SW/SE) street building population (>= 88% frontage fill, 0 empty ways, + paired negative)
     5) Zero flooded lots & zero OBB overlaps across all burgh structures
     6) Bridge air-draft & 3-arch Lok-Ma navigable stone aqueduct clearances
     7) Canal vessels (et_canal_barge, et_tow_scow, et_inspection_launch) registered in KTAGS as 'vessel' with exact built L/B/H
     8) Full end-to-end et_canal_barge lock + aqueduct + bridge + turning-basin round-trip transit across all 9 active courses (+ paired negative) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);

const ctx = { console, Math, Object, Array, Number, String, Boolean, JSON, Float32Array, Float64Array, Int32Array, Uint32Array, Uint8Array, Uint8ClampedArray, Uint16Array, Map, Set, Error, Date };
ctx.window = ctx;
ctx.globalThis = ctx;
ctx.self = ctx;
vm.createContext(ctx);

function loadRel(rel) {
  const full = path.join(ROOT, rel);
  vm.runInContext(fs.readFileSync(full, 'utf8'), ctx, { filename: rel });
}

[
  'core/rand/08-core-rand.js',
  'core/sched/20-core-sched.js',
  'core/space/20-core-space.js',
  'core/mask/25-core-mask.js',
  'core/tags/50-core-tags.js',
  'core/tags/52-core-tags-vocab.js'
].forEach(loadRel);
[
  'kits/crops/src/10-crop-core.js',
  'kits/crops/src/20-crop-records.js',
  'kits/crops/src/22-crop-material.js',
  'kits/crops/src/24-crop-vale-wild.js',
  'kits/crops/src/40-crop-query.js'
].forEach(loadRel);
[
  'core/city/10-city-core.js',
  'core/city/12-city-index.js',
  'core/city/15-city-ground.js',
  'core/city/20-city-plan.js',
  'core/city/25-city-site.js',
  'core/city/31-city-steps-b.js',
  'core/city/32-city-steps-c.js',
  'core/city/33-city-strategies.js',
  'core/city/37-city-grid.js',
  'core/city/40-city-kcity.js'
].forEach(loadRel);
[
  'core/hamlet/10-hamlet-wood.js',
  'core/hamlet/12-hamlet-gather.js',
  'core/hamlet/14-hamlet-farmland.js',
  'core/hamlet/16-hamlet-names.js',
  'core/hamlet/18-hamlet-names.js',
  'core/hamlet/20-hamlet-cultures.js',
  'core/hamlet/30-hamlet-village.js'
].forEach(loadRel);
vm.runInContext('KCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC, obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist, resample: resample, clamp: clamp, inPoly: inPoly, cg: function () { return CG; } };', ctx);

/* Load kits/transit [G data] + Shuang-Zha [G data] in place */
[
  'kits/transit/src/40-tr-canal.js',
  'kits/transit/src/41-tr-locks.js',
  'kits/transit/src/42-tr-transit.js',
  'settlements/eternian-canal/src/39e-ec-model.js',
  'settlements/eternian-canal/src/40-ec-ground.js',
  'settlements/eternian-canal/src/41-ec-hydraulics.js',
  'settlements/eternian-canal/src/42-ec-city.js'
].forEach(loadRel);

const K = ctx.KCANAL;
const MODEL = ctx.EC_MODEL;
const G = ctx.EC_GROUND;
const H = ctx.EC_HYD;
const CITY = ctx.EC_CITY;
const plan = CITY.make({ seed: 451782 });

/* 1. Scale Model 5.1 Anchor & Pound Monotonicity */
T.ok('scale model cut anchors Jing-Hai standing water at +45.87 m ASL',
  MODEL.cx === 450.5 && MODEL.cy === 782.0 && Math.abs(MODEL.lake - 45.87) < 0.02,
  'lake=' + MODEL.lake);

T.ok('strict 4-pound monotonicity P3 (61.87) > P2 (58.87) > P1 (52.47) > P0 (45.87) = 16.00 m drop',
  K.poundsMonotonic(H.POUNDS, 16.0),
  JSON.stringify(H.POUNDS.map(p => p.id + '=' + p.wlev)));
T.neg('pound monotonicity catches inverted pound elevation',
  ps => K.poundsMonotonic(ps, 16.0),
  [{ wlev: 61.87 }, { wlev: 51.00 }, { wlev: 52.47 }, { wlev: 45.87 }],
  H.POUNDS);

/* 2. Lock Riser Head Bounds & Zero-Head Miter-Gate Law across full 360 s cycle */
const maxLift = Math.max(...H.CHAMBERS.map(c => c.lift));
T.ok('every bronze miter-lock chamber riser head is <= 3.50 m (L1=3.30 m, L2=3.20 m)',
  H.CHAMBERS.length === 8 && maxLift <= 3.50 && maxLift >= 3.15,
  'chambers=' + H.CHAMBERS.length + ' maxLift=' + maxLift);

let gateFaults = 0, sawOpenLower = 0, sawOpenUpper = 0, sawMidFill = 0;
for (const ch of H.CHAMBERS) {
  for (let step = 0; step < 360; step++) {
    const st = H.lockState(ch, step);
    if (!K.miterLawOk(st)) gateFaults++;
    if (st.lowerGateDeg > 60) sawOpenLower++;
    if (st.upperGateDeg > 60) sawOpenUpper++;
    if (st.headLow > 1.0 && st.headHigh > 1.0 && st.lowerGateDeg === 0 && st.upperGateDeg === 0) sawMidFill++;
  }
}
T.ok('zero-head miter-gate law holds across 2,880 chamber-time samples while cycling open/fill/empty',
  gateFaults === 0 && sawOpenLower > 0 && sawOpenUpper > 0 && sawMidFill > 0,
  'faults=' + gateFaults + ' openLo=' + sawOpenLower + ' openHi=' + sawOpenUpper + ' midFill=' + sawMidFill);
T.neg('miter-gate check rejects a gate swinging open against 2.4 m hydraulic head',
  K.miterLawOk,
  { lowerGateDeg: 45, headLow: 2.40, upperGateDeg: 0, headHigh: 0.90 },
  H.lockState('L1a_low', 10));

/* 3. Zero Street-in-Canal Intrusions Across All Ways & KMASK Canal Samples */
const streetAudit = K.streetClearOfCanals(plan.ways, H.NET, { margin: 0.6 });
const kmaskAudit = plan.roadMask.auditZeroOnCanals();
T.ok('zero street-over-canal intrusions across all burgh ways and zero KMASK road pixels inside canals/locks/basins',
  streetAudit.ok && kmaskAudit.ok && plan.ways.length >= 25,
  'ways=' + plan.ways.length + ' samples=' + streetAudit.checkedSamples + ' kmaskTested=' + kmaskAudit.tested);

const intrudingWays = plan.ways.concat([
  { id: 'bad.across_trunk', cls: 'main', w: 7.0, pts: [G.at(-40, 85), G.at(40, 85)] }
]);
T.neg('streetClearOfCanals catches an unbridged street intruding across the trunk canal',
  ws => K.streetClearOfCanals(ws, H.NET, { margin: 0.6 }).ok,
  intrudingWays,
  plan.ways);

/* 4. Full 6-Ward & All-Quadrant Street Population (No Half-Empty Burgh!) */
function burghFullyPopulated(fr) {
  if (!fr || fr.fillRatio < 0.88 || fr.emptyWays > 0) return false;
  const q = fr.quadrantLots, wl = fr.wardLots;
  return q.SW >= 80 && q.SE >= 80 && q.NW >= 80 && q.NE >= 80 &&
         wl.W1 >= 10 && wl.W2 >= 6 && wl.W3 >= 60 && wl.W4 >= 120 && wl.W5 >= 120 && wl.W6 >= 20;
}
T.ok('all 6 wards and all 4 quadrants (SW/SE/NW/NE) are densely populated along streets (>= 88% frontage, 0 empty ways)',
  burghFullyPopulated(plan.frontage) && plan.lots.length >= 500,
  'lots=' + plan.lots.length + ' fill=' + (plan.frontage.fillRatio * 100).toFixed(1) + '% quads=' + JSON.stringify(plan.frontage.quadrantLots) + ' wards=' + JSON.stringify(plan.frontage.wardLots));
T.neg('burgh population audit catches half-empty northern quadrants or unpopulated street blocks',
  burghFullyPopulated,
  { fillRatio: 0.52, emptyWays: 14, quadrantLots: { SW: 121, SE: 119, NW: 27, NE: 38 }, wardLots: plan.frontage.wardLots },
  plan.frontage);

/* 5. Zero Flooded Lots & Zero OBB Overlaps */
function lotDry(lot) {
  return lot.padY >= lot.wlev + 1.35 - 1e-6;
}
const floodedLots = plan.lots.filter(l => !lotDry(l));
T.ok('zero flooded lots across all 6 wards (every lot padY >= adjacent pound wlev + 1.35 m) & rich canal frontage',
  floodedLots.length === 0 && plan.census.waterFrontLots >= 90,
  'lots=' + plan.lots.length + ' flooded=' + floodedLots.length + ' waterFront=' + plan.census.waterFrontLots);
T.neg('flooded-lot check catches a sunken lot pad below freeboard minimum',
  lotDry,
  { padY: 53.10, wlev: 52.47 },
  plan.lots[0]);

let obbHits = 0;
for (let i = 0; i < plan.lots.length; i++) {
  for (let j = i + 1; j < plan.lots.length; j++) {
    if (CITY.obbOverlap(plan.lots[i].obb, plan.lots[j].obb)) obbHits++;
  }
}
T.ok('zero OBB overlaps across all ' + plan.lots.length + ' placed burgh lots',
  obbHits === 0,
  'overlaps=' + obbHits);

/* 6. Bridge Air-Draft & 3-Arch Lok-Ma Stone Aqueduct Clearances */
const bargeSpec = H.SIM_PROOF.vesselSpec.et_canal_barge;
const badBridges = plan.bridges.filter(b => !K.bridgeClearsVessel(b, bargeSpec, 0.65));
T.ok('all 8 canal bridges clear canal_trunk (>=2.80 m) and canal_ward (>=2.60 m) above 1.88 m et_canal_barge air-draft',
  plan.bridges.length === 8 && badBridges.length === 0,
  'bridges=' + plan.bridges.length + ' bad=' + badBridges.length);
T.neg('bridgeClearsVessel rejects a low deck blocking et_canal_barge',
  br => K.bridgeClearsVessel(br, bargeSpec, 0.65),
  Object.assign({}, plan.bridges[0], { airDraft: 1.80 }),
  plan.bridges[0]);

const aq = H.AQUEDUCT;
const aqMid = G.at(0, 680);
const streamBedAtAq = G.h(aqMid[0], aqMid[1]);
T.ok('Lok-Ma 3-arch stone aqueduct carries P2 (+58.87 m) cleanly over Lok-Ma stream (+51.00 m) with >=3.50 m arch clearance',
  K.aqueductOk(aq, 3.50) && streamBedAtAq < 49.60,
  'underpass=' + aq.underpassClearance.toFixed(2) + 'm streamBed=' + streamBedAtAq.toFixed(2) + 'm');

let shallowPolys = 0;
for (const sp of H.STILL_POLYS) {
  if (sp.aqueduct) continue;
  const mp = G.at(0.5 * (sp.u0 + sp.u1), 0.5 * (sp.s0 + sp.s1));
  const bedH = G.h(mp[0], mp[1]);
  if (sp.level - bedH < 1.80) shallowPolys++;
}
T.ok('every excavated canal reach & basin has >= 1.80 m wet water depth below pound surface',
  shallowPolys === 0,
  'shallowPolys=' + shallowPolys + ' of ' + H.STILL_POLYS.length);

/* 7. End-to-End Barge Lock + Aqueduct + Bridge + Turning-Basin Transit Across All 9 Active Courses */
const courseResults = H.TRANSIT_COURSES.map(crs => {
  const spec = H.SIM_PROOF.vesselSpec[crs.vesselKey];
  return { id: crs.id, audit: K.auditTransit(crs, H.NET, spec, { dt: 2.0, airMargin: 0.45 }) };
});
const failedCourses = courseResults.filter(r => !r.audit.ok);
T.ok('all 9 active canal transit courses (twin-riser L1 & L2 locks, bridges, 3-arch aqueduct & turning basins) pass with 0 collisions & exact flotation',
  H.TRANSIT_COURSES.length === 9 && failedCourses.length === 0,
  failedCourses.length ? JSON.stringify(failedCourses[0]) : '9/9 courses clean over 1080 s');

const rogueBargeCourse = K.transitCourse({
  id: 'bad.rogue_lock', vesselKey: 'et_canal_barge', period: 360, frame: G.FRAME,
  stages: [{ t0: 0, t1: 360, kind: 'sail', u0: -4.8, s0: -415, u1: -4.8, s1: -330, yaw: G.VYAW_S, wlev: 45.87 }]
});
T.neg('auditTransit catches a barge driving straight through closed L1 miter gates without locking',
  crs => K.auditTransit(crs, H.NET, bargeSpec, { dt: 2.0 }).ok,
  rogueBargeCourse,
  H.TRANSIT_COURSES[0]);

/* 8. Vessel Built Bounding Boxes (Three.js) & KTAGS 'vessel' Registration */
{
  const threePath = path.join(ROOT, 'kits', 'ringsea', 'three.min.js');
  const vCtx = { console, Math, Object, Array, Number, String, Boolean, JSON, Float32Array, Float64Array, Int32Array, Uint32Array, Uint8Array, Uint8ClampedArray, Uint16Array, Map, Set, Error };
  vCtx.window = vCtx; vCtx.globalThis = vCtx; vCtx.self = vCtx;
  vm.createContext(vCtx);
  vm.runInContext(fs.readFileSync(threePath, 'utf8'), vCtx, { filename: 'three.min.js' });
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
  ].forEach(r => vm.runInContext(fs.readFileSync(path.join(ROOT, r), 'utf8'), vCtx, { filename: r }));

  const vTags = vCtx.KTAGS.create({ build: 'eternian-canal' });
  for (const mf of H.MOORED_FLEET) {
    const p = G.at(mf.u, mf.s);
    vCtx.KCANAL.registerVesselTag(vTags, mf.key, { x: p[0], y: mf.y, z: p[1], yaw: mf.yaw });
  }
  for (const crs of H.TRANSIT_COURSES) {
    const p0 = K.vesselPoseAt(crs, 28.0);
    vCtx.KCANAL.registerVesselTag(vTags, crs.vesselKey, p0);
  }
  const ta = vTags.audit();
  const dimsOk = vCtx.TR_VESSELS.order.every(k => vCtx.KCANAL.auditVesselDims(k, 0, 0.16).ok);
  const totalFleet = H.MOORED_FLEET.length + H.TRANSIT_COURSES.length;
  T.ok('all ' + totalFleet + ' Shuang-Zha fleet hulls register in KTAGS as "vessel" with 0 unknown vocab and exact built L/B/H',
    ta.byClass.vessel === totalFleet && ta.unknown === 0 && dimsOk,
    'vessels=' + ta.byClass.vessel + ' unknown=' + ta.unknown);
}

/* 9. Towpath Connectivity, Water Budget & Hamlets */
T.ok('continuous towpath & bridge graph connects P3 Hak-Ma weir to P0 Jing-Hai harbour and both lateral wards with slope <= 0.18',
  K.towpathReachable(plan.towpath, 'weir.head', ['harb.w', 'harb.e', 'w4.end', 'w5.end'], 0.18),
  'nodes=' + Object.keys(plan.towpath.nodes).length + ' edges=' + plan.towpath.edges.length);
T.neg('towpath check rejects severed graph or over-steep unstepped ramp',
  g => K.towpathReachable(g, 'weir.head', ['harb.w'], 0.18),
  { nodes: plan.towpath.nodes, edges: [{ a: 'weir.head', b: 'harb.w', slope: 0.45 }] },
  plan.towpath);

T.ok('water budget, two KHAMLET satellites, CROPS.at rice/tea palette, and 4x SIM barge freight advantage',
  H.WATER_BUDGET.qDivertedIn / H.WATER_BUDGET.qRiverDryBase < 0.07 &&
  H.WATER_BUDGET.qSpillwayReturn > 0.5 &&
  plan.hamlets.length === 2 &&
  plan.hamlets[0].records.length >= 8 &&
  plan.hamlets[1].records.length >= 6 &&
  plan.cropPalette.length >= 5 &&
  H.SIM_PROOF.barge.freightMult <= H.SIM_PROOF.wagonConvoy.freightMult * 0.26,
  'hamlets=' + plan.hamlets.map(h => h.name + ':' + h.records.length).join(','));

T.done();
