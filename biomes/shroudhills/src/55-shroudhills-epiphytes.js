// ================================================================= SHROUDHILLS — super-epiphytes (A + B + E + C) & Shroud-Ant colonies [draw]
// Implements the four locked twists and understorey passes:
//   Twist A (shroud_sister_cups): 1.8-3.2 m Paired Sister-Cup Cistern Sky-Ponds + dual elevated WATER.still rainwater lenses
//   Twist B (shroud_rata_bridge): KSPACE neighbor-bridging Grafted Root-Hammocks & 50 cm Suspended Canopy Turf with crimson sky-orchids
//   Twist C (shroud_drum_gall): 1.3-2.6 m Chambered Myrmecophyte Drum-Galls + basal saltpeter crusts + 30-42 cm Shroud-Ants (Khroma-Mira)
//   Trail Shrub (shroud_myrtle_smudge): aromatic silver-green Smudge-Myrtle lining safe Yonni footpaths & cairns
//   Twist E (shroud_cloak_bromeliad & shroud_dew_strand): scarlet/saffron/silver Lithophyte Cloaks & wind-streaming Mist-Sundews on granite tors
(function(){
 'use strict';
 var fn = BIO.fn;
 var TAU = fn.TAU, clamp = fn.clamp, lerp = fn.lerp, smooth = fn.smooth;
 var reseed = fn.reseed, rr = fn.rr, ri = fn.ri, pick = fn.pick, qEuler = fn.qEuler;
 var T3 = BIO.host.THREE;
 var C = function(h){ return new T3.Color(h); };
 var PAL = SHROUDHILLS.PAL;
 var vary = SHROUDHILLS.vary;

 SHROUDHILLS.SISTER_CUPS = [];
 SHROUDHILLS.SKY_PONDS = [];
 SHROUDHILLS.HAMMOCKS = [];
 SHROUDHILLS.COLONIES = [];
 SHROUDHILLS.ANTS = [];
 SHROUDHILLS.MYRTLES = [];
 SHROUDHILLS.CLOAK_MATS = [];

 var Y = function(x, z){ return BIO.terrainH(x, z); };
 var FL = function(name, x, z){ return BIO.field(name, x, z); };
 var flare = function(pts, parentR){
  return BIO.flareJoin ? BIO.flareJoin(pts, { parentR: parentR, k: 1.65, sink: 0.65, cap: 0.9, len: 2.2 }) : pts;
 };

 // Align an ant or surface-clinging organism to tangent dirT and surface normal nrm
 var qSurfacePose = function(dirT, nrm){
  var up = new T3.Vector3(nrm[0], nrm[1], nrm[2]).normalize();
  var fwd = new T3.Vector3(dirT[0], dirT[1], dirT[2]);
  fwd.addScaledVector(up, -fwd.dot(up));
  if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, 1);
  fwd.normalize();
  var right = new T3.Vector3().crossVectors(up, fwd).normalize();
  fwd.crossVectors(right, up).normalize();
  var m = new T3.Matrix4().makeBasis(right, up, fwd);
  return new T3.Quaternion().setFromRotationMatrix(m);
 };

 // Align hanging streamer local -Y along wind-blown drip vector
 var qHangDir = function(dx, dy, dz, roll){
  var v0 = new T3.Vector3(0, -1, 0);
  var v1 = new T3.Vector3(dx, dy, dz).normalize();
  var q = new T3.Quaternion().setFromUnitVectors(v0, v1);
  var qr = new T3.Quaternion().setFromAxisAngle(v1, roll == null ? 0 : roll);
  return qr.multiply(q);
 };

 // Regular 10-gon polygon in XZ for elevated WATER.still Sister-Cup rainwater lenses
 var makeDiscPoly = function(cx, cz, rad){
  var poly = [];
  for (var k = 0; k < 10; k++) {
   var a = k / 10 * TAU;
   poly.push([+(cx + Math.cos(a) * rad).toFixed(3), +(cz + Math.sin(a) * rad).toFixed(3)]);
  }
  return poly;
 };

 // ---- Build Twist A: Paired Sister-Cup Cistern Sky-Ponds
 SHROUDHILLS.buildSisterCups = function(q){
  q = q == null ? 1 : q;
  SHROUDHILLS.SISTER_CUPS.length = 0;
  SHROUDHILLS.SKY_PONDS.length = 0;
  var spCup = SHROUDHILLS.byKey.shroud_sister_cups;
  var L = SHROUDHILLS.LOD;
  var forks = SHROUDHILLS.CUP_FORKS;
  var placed = 0;

  for (var i = 0; i < forks.length; i++) {
   var F = forks[i];
   var Z = SHROUDHILLS.zonesAt(F.x, F.z);
   var st = KRAND.stream(F.seed);
   var prob = clamp(Z.shroud_cove * 0.68 + Z.canopy_sea * 0.42, 0, 0.72);
   if (st.next() > prob) continue;

   var spec = SHROUDHILLS.sisterCupSpec(KRAND.hash(F.seed, 9));
   var cupR = spec.cupR;
   var yaw = spec.yaw;
   var cy = Math.cos(yaw), sy = Math.sin(yaw);

   // Register Sister-Cup BEFORE drawing
   if (BIO.lodD(F.x, F.z) < 380 && placed < 48) {
    BIO.register({
     name: spCup.name + ' (' + spec.litres + ' L twin sky-pond)',
     key: 'shroud_sister_cups',
     kind: 'flora',
     x: F.x, z: F.z, y: F.y - 0.3,
     r: spec.totalD * 0.65 + 0.6,
     h: spec.lipH + 1.4,
     tags: { harvest: spCup.tags.harvest }
    });
   }

   BIO.owner = [F.x, F.z];
   BIO.range = L.epiphyte; BIO.minRange = 0;
   var cupItem = (i % 2 === 0) ? 'sister_cups0' : 'sister_cups1';
   BIO.put(cupItem, [F.x, F.y, F.z], qEuler(0, yaw, 0), [cupR, spec.lipH, cupR], vary(pick(PAL.sisterTank), 0.02, 0.08, 0.05));

   // Outer crimson Sister-Cup bracts
   for (var sd = -1; sd <= 1; sd += 2) {
    var bx = F.x + cy * (sd * 1.06 * cupR);
    var bz = F.z - sy * (sd * 1.06 * cupR);
    BIO.put('sister_bract', [bx, F.y + spec.lipH * 0.42, bz], qEuler(0, yaw + sd * 0.6, 0), [cupR * 1.65, spec.lipH * 0.85, cupR * 1.65], vary(pick(PAL.sisterBract), 0.015, 0.06, 0.05));
   }

   // Overflow silver ribbon-drip beneath the central weir
   if (st.next() < 0.65) {
    var dripLen = lerp(1.6, 3.4, st.next());
    BIO.put('sister_drip', [F.x, F.y + 0.05, F.z], qEuler(0, yaw, 0), [0.38, dripLen, 0.38], 0xdceae8);
   }

   // Record dual symmetrical WATER.still rainwater lenses inside the two fused mirror cups (up to 72 hero pairs = 144 lenses)
   if (SHROUDHILLS.SKY_PONDS.length < 144 && BIO.lodD(F.x, F.z) < L.epiphyte) {
    var waterY = +(F.y + spec.lipH * 0.66).toFixed(3);
    var lensR = cupR * 0.68;
    var off = 1.06 * cupR;
    var lx = F.x - cy * off, lz = F.z + sy * off;
    var rx = F.x + cy * off, rz = F.z - sy * off;
    SHROUDHILLS.SKY_PONDS.push(
     { id: placed * 2, x: lx, z: lz, level: waterY, r: lensR, poly: makeDiscPoly(lx, lz, lensR), cupY: F.y, cupH: spec.lipH },
     { id: placed * 2 + 1, x: rx, z: rz, level: waterY, r: lensR, poly: makeDiscPoly(rx, rz, lensR), cupY: F.y, cupH: spec.lipH }
    );
   }

   SHROUDHILLS.SISTER_CUPS.push({ x: F.x, y: F.y, z: F.z, spec: spec });
   placed++;
  }
  BIO.owner = null; BIO.range = null; BIO.minRange = 0;
  return { sisterCups: placed, skyPondLenses: SHROUDHILLS.SKY_PONDS.length };
 };

 // ---- Build Twist B: KSPACE Neighbor-Bridging Grafted Root-Hammocks & 50 cm Suspended Canopy Turf
 SHROUDHILLS.buildRootHammocks = function(q){
  q = q == null ? 1 : q;
  SHROUDHILLS.HAMMOCKS.length = 0;
  var spBridge = SHROUDHILLS.byKey.shroud_rata_bridge;
  var L = SHROUDHILLS.LOD;
  var anchors = [];

  // Filter anchors to canopy_sea & inner cove forest where Root-Hammocks weave overhead
  for (var i = 0; i < SHROUDHILLS.BRIDGE_ANCHORS.length; i++) {
   var A = SHROUDHILLS.BRIDGE_ANCHORS[i];
   if (BIO.lodD(A.x, A.z) > L.bridge) continue;
   var Z = SHROUDHILLS.zonesAt(A.x, A.z);
   if (Z.canopy_sea < 0.35 && Z.ravine < 0.25) continue;
   if (A.y - Y(A.x, A.z) < 11.5) continue;
   anchors.push(A);
  }

  var space = KSPACE.create({ cell: 16 });
  for (var j = 0; j < anchors.length; j++) {
   space.insert(anchors[j], anchors[j].x, anchors[j].z, 1.0);
  }

  var stationKey = (BIO.host.shroudhills && BIO.host.shroudhills.station) || 'cove';
  var maxDeg = stationKey === 'canopy' ? 3 : 2;
  var spans = SHROUDHILLS.pairHammocks(anchors, space, {
   minSpan: 6.0,
   maxSpan: stationKey === 'canopy' ? 16.2 : 13.5,
   maxDy: 6.2,
   maxDegree: maxDeg,
   seed: KRAND.child(BIO.host.seed >>> 0, 'hammocks')
  });

  var capSpans = stationKey === 'canopy' ? 64 : 22;
  if (spans.length > capSpans) spans.length = capSpans;

  for (var s = 0; s < spans.length; s++) {
   var sp = spans[s];
   reseed(sp.seed);
   var mid = sp.mid;

   // Register Root-Hammock span BEFORE drawing
   if (s < 42) {
    BIO.register({
     name: spBridge.name + ' (' + sp.spanM.toFixed(1) + ' m catenary span)',
     key: 'shroud_rata_bridge',
     kind: 'flora',
     x: mid.x, z: mid.z, y: mid.y - 1.4,
     r: Math.max(2.6, sp.spanM * 0.42),
     h: 3.6,
     tags: { harvest: spBridge.tags.harvest }
    });
   }

   BIO.owner = [mid.x, mid.z];
   BIO.range = L.bridge; BIO.minRange = 0;

   var dx = sp.b.x - sp.a.x, dz = sp.b.z - sp.a.z;
   var len = Math.hypot(dx, dz) || 1;
   var nx = -dz / len, nz = dx / len;

   // 3 braided self-grafting Rata suspension root cables with BIO.flareJoin collars at both host boughs
   [-1, 0, 1].forEach(function(lane){
    var cablePts = [];
    for (var k = 0; k < sp.pts.length; k++) {
     var P = sp.pts[k];
     var env = Math.sin(P.t * Math.PI);
     var off = lane * P.w * 0.36 + Math.sin(P.t * TAU * 1.5 + lane) * 0.14 * env;
     cablePts.push({
      x: P.x + nx * off,
      y: P.y - (lane === 0 ? P.thick * 0.42 : P.thick * 0.12),
      z: P.z + nz * off,
      r: lane === 0 ? 0.16 : 0.125
     });
    }
    BIO.tube('rata', flare(cablePts, 0.32), vary(pick(PAL.rataBark), 0.01, 0.05, 0.04), { seg: 6, cap: true });
   });

   // Continuous ~50 cm thick suspended peat turf deck + mossy cushion pillows
   var turfPts = [];
   for (var ti = 1; ti < sp.pts.length - 1; ti++) {
    var tp = sp.pts[ti];
    turfPts.push({ x: tp.x, y: tp.y + tp.thick * 0.12, z: tp.z, r: tp.w * 0.42 });
    BIO.put('turf_pad', [tp.x, tp.y + tp.thick * 0.18, tp.z], qEuler(0, Math.atan2(dx, dz), 0), [tp.w * 0.68, tp.thick * 0.85, sp.spanM / 7.2], vary(pick(PAL.turfMoss), 0.02, 0.08, 0.05));
    if (ti % 2 === 1) {
     BIO.put('sky_orchid', [tp.x + nx * rr(-0.35, 0.35) * tp.w, tp.y + tp.thick * 0.52, tp.z + nz * rr(-0.35, 0.35) * tp.w], qEuler(0, rr(0, TAU), 0), [rr(0.55, 0.92), rr(0.62, 1.05), rr(0.55, 0.92)], vary(pick(PAL.skyOrchid), 0.015, 0.06, 0.05));
    } else {
     BIO.put('sky_heath', [tp.x + nx * rr(-0.35, 0.35) * tp.w, tp.y + tp.thick * 0.50, tp.z + nz * rr(-0.35, 0.35) * tp.w], qEuler(0, rr(0, TAU), 0), [rr(0.65, 1.05), rr(0.55, 0.88), rr(0.65, 1.05)], vary(pick(PAL.turfMoss), 0.02, 0.07, 0.06));
    }
    if (ti === 3 || ti === 5) {
     BIO.put('moss_curtain', [tp.x, tp.y - tp.thick * 0.35, tp.z], qEuler(0, rr(0, TAU), 0), [rr(1.2, 2.2), rr(2.4, 4.8), 1], vary(pick(PAL.mossHang), 0.02, 0.06, 0.05));
    }
   }
   if (turfPts.length >= 2) {
    BIO.tube('turf', turfPts, vary(pick(PAL.turfMoss), 0.02, 0.07, 0.05), { seg: 6, cap: true });
   }

   SHROUDHILLS.HAMMOCKS.push(sp);
  }

  BIO.owner = null; BIO.range = null; BIO.minRange = 0;
  return { rootHammocks: SHROUDHILLS.HAMMOCKS.length };
 };

 // ---- Build Twist C: Myrmecophyte Drum-Galls + Basal Saltpeter Crusts + Cat-Sized Shroud-Ants (Khroma-Mira)
 SHROUDHILLS.buildDrumGallsAndAnts = function(q){
  q = q == null ? 1 : q;
  SHROUDHILLS.COLONIES.length = 0;
  SHROUDHILLS.ANTS.length = 0;
  var spGall = SHROUDHILLS.byKey.shroud_drum_gall;
  var L = SHROUDHILLS.LOD;
  var stationKey = (BIO.host.shroudhills && BIO.host.shroudhills.station) || 'cove';
  var atm = (SHROUDHILLS.SITES[stationKey] && SHROUDHILLS.SITES[stationKey].atm) || 1.47;

  var spots = SHROUDHILLS.GALL_SPOTS;
  for (var i = 0; i < spots.length; i++) {
   var G = spots[i];
   if (BIO.lodD(G.x, G.z) > L.epiphyte) continue;
   var Z = SHROUDHILLS.zonesAt(G.x, G.z);
   // Shroud-Ants never nest on bare granite Cloak-Tors or right inside Smudge-Myrtle pacified trail corridors!
   if (Z.tor > 0.25 || Z.granite > 0.48 || Z.path > 0.18) continue;
   var st = KRAND.stream(G.seed);
   var want = stationKey === 'canopy' ? 0.68 : (Z.canopy_sea * 0.36 + Z.shroud_cove * 0.14);
   if (st.next() > want) continue;

   var colSpec = SHROUDHILLS.antColonySpec(KRAND.hash(G.seed, 5), atm);
   var ang = G.ang;
   var ca = Math.cos(ang), sa = Math.sin(ang);
   var gx = G.x + ca * (G.r + colSpec.gallD * 0.28);
   var gz = G.z + sa * (G.r + colSpec.gallD * 0.28);
   var gy = G.y;

   // Register Drum-Gall & Shroud-Ant hazard territory BEFORE drawing!
   BIO.register({
    name: spGall.name + ' & Khroma-Mira Shroud-Ant Colony (' + colSpec.soldierCm + ' cm soldiers)',
    key: 'shroud_drum_gall',
    kind: 'flora',
    x: gx, z: gz, y: gy - colSpec.gallH * 0.9,
    r: Math.max(2.4, colSpec.gallD * 1.15),
    h: colSpec.gallH * 1.85,
    tags: {
     harvest: spGall.tags.harvest,
     hazard: spGall.tags.hazard
    }
   });

   BIO.owner = [G.x, G.z];
   BIO.range = L.epiphyte; BIO.minRange = 0;
   reseed(KRAND.hash(G.seed, 11));

   // 1. Ribbed chambered Myrmecophyte Drum-Gall
   var gallItem = (i % 2 === 0) ? 'drum_gall0' : 'drum_gall1';
   BIO.put(gallItem, [gx, gy, gz], qEuler(0, -ang + Math.PI * 0.5, 0), [colSpec.gallD, colSpec.gallH, colSpec.gallD], vary(pick(PAL.drumGall), 0.015, 0.06, 0.05));

   // 2. Basal white mineralized saltpeter (KNO3) crust dripping down the host bole below the refuse chamber
   var sx = G.x + ca * (G.r + 0.06), sz = G.z + sa * (G.r + 0.06);
   BIO.put('saltpeter_crust', [sx, gy - colSpec.gallH * 0.52, sz], qEuler(0, -ang + Math.PI * 0.5, 0), [colSpec.gallD * 0.85, colSpec.gallH * 0.78, colSpec.gallD * 0.75], vary(pick(PAL.saltpeter), 0.01, 0.03, 0.03));

   // 3. Cat-sized (30-42 cm) bronze-black Shroud-Ant sentries (Khroma-Mira) posed on the gall dome & adjacent trunk bark
   var nSentries = colSpec.sentries;
   for (var a = 0; a < nSentries; a++) {
    var soldier = (a < 2) || (a % 2 === 0);
    var sizeM = (soldier ? colSpec.soldierCm : colSpec.workerCm) * 0.01;
    var theta = ang + (a - (nSentries - 1) * 0.5) * 0.52;
    var phi = (a % 3 === 0) ? 0.58 : (a % 3 === 1 ? 0.12 : -0.35);
    var nx = Math.cos(theta) * Math.cos(phi);
    var ny = Math.sin(phi);
    var nz = Math.sin(theta) * Math.cos(phi);
    var surfR = colSpec.gallD * 0.51;
    var ax = gx + nx * surfR, ay = gy + ny * colSpec.gallH * 0.48, az = gz + nz * surfR;
    var tang = [-Math.sin(theta), 0.35, Math.cos(theta)];
    var qAnt = qSurfacePose(tang, [nx, ny, nz]);
    var antItem = soldier ? 'shroud_ant_soldier' : 'shroud_ant_worker';
    BIO.put(antItem, [ax, ay, az], qAnt, [sizeM, sizeM, sizeM], vary(pick(PAL.antChitin), 0.015, 0.06, 0.05));
    SHROUDHILLS.ANTS.push({ x: ax, y: ay, z: az, sizeM: sizeM, role: soldier ? 'soldier' : 'worker', on: 'gall' });
   }

   SHROUDHILLS.COLONIES.push({
    x: gx, y: gy, z: gz,
    treeId: G.treeId,
    spec: colSpec
   });
  }

  // 4. Peaceful single-file foraging columns of 30-34 cm Shroud-Ant workers marching across overhead Root-Hammocks (B)!
  for (var h = 0; h < SHROUDHILLS.HAMMOCKS.length; h++) {
   var H = SHROUDHILLS.HAMMOCKS[h];
   if (h % 2 === 1 && stationKey !== 'canopy') continue;
   reseed(KRAND.hash(H.seed, 71));
   BIO.owner = [H.mid.x, H.mid.z];
   BIO.range = L.epiphyte; BIO.minRange = 0;
   var nMarch = ri(3, 6);
   for (var m = 0; m < nMarch; m++) {
    var u = clamp(0.16 + (m + rr(-0.2, 0.2)) * (0.68 / nMarch), 0.12, 0.88);
    var segF = u * (H.pts.length - 1);
    var k0 = Math.min(H.pts.length - 2, Math.floor(segF));
    var frac = segF - k0;
    var p0 = H.pts[k0], p1 = H.pts[k0 + 1];
    var mx = lerp(p0.x, p1.x, frac), my = lerp(p0.y, p1.y, frac) + lerp(p0.thick, p1.thick, frac) * 0.48, mz = lerp(p0.z, p1.z, frac);
    var dirSign = (m % 4 === 3) ? -1 : 1;
    var qWalk = qSurfacePose([(p1.x - p0.x) * dirSign, (p1.y - p0.y) * dirSign, (p1.z - p0.z) * dirSign], [0, 1, 0]);
    var wSize = rr(0.30, 0.35);
    BIO.put('shroud_ant_worker', [mx, my, mz], qWalk, [wSize, wSize, wSize], vary(pick(PAL.antChitin), 0.015, 0.06, 0.05));
    SHROUDHILLS.ANTS.push({ x: mx, y: my, z: mz, sizeM: wSize, role: 'worker', on: 'hammock' });
   }
  }

  BIO.owner = null; BIO.range = null; BIO.minRange = 0;
  return { drumGalls: SHROUDHILLS.COLONIES.length, shroudAnts: SHROUDHILLS.ANTS.length };
 };

 // ---- Build Trail Shrub: Calming Smudge-Myrtle (shroud_myrtle_smudge) &Twist E: Cloak-Tors + Mist-Sundews + Ravine Ferns
 SHROUDHILLS.buildCloaksAndFloor = function(R, q){
  q = q == null ? 1 : q;
  SHROUDHILLS.MYRTLES.length = 0;
  SHROUDHILLS.CLOAK_MATS.length = 0;
  var L = SHROUDHILLS.LOD;
  var spMyrtle = SHROUDHILLS.byKey.shroud_myrtle_smudge;
  var spCloak = SHROUDHILLS.byKey.shroud_cloak_bromeliad;
  var spDew = SHROUDHILLS.byKey.shroud_dew_strand;
  var wind = (BIO.host.shroudhills && BIO.host.shroudhills.wind) || [0.7071, 0.7071];

  var myrtles = 0, cloaks = 0, dews = 0, floorFerns = 0;

  // 1. Calming Smudge-Myrtle lining the edges of safe Yonni stone footpaths & cairns (never blocking the center of the path!)
  SHROUDHILLS.kgrid('smudge_myrtle', 6.5 / Math.sqrt(q), function(Z){
   // Grow along path shoulders (0.12 < Z.path < 0.72), keeping the tread center (Z.path > 0.75) open for walkers & camera views!
   if (Z.path > 0.74 || Z.cobble > 0.65) return 0;
   var shoulder = smooth(0.06, 0.25, Z.path) * smooth(0.76, 0.42, Z.path);
   return clamp(shoulder * 0.92 + Z.shroud_cove * 0.04, 0, 0.88);
  }, function(x, y, z, seed){
   if (BIO.lodD(x, z) > L.epiphyte) return;
   reseed(seed);
   var H = rr(1.5, 2.8), w = H * rr(0.65, 0.92);
   if (myrtles < 36 && (myrtles % 2 === 0)) {
    BIO.register({
     name: spMyrtle.name + ' (pacifies nearby Shroud-Ant colonies)',
     key: 'shroud_myrtle_smudge',
     kind: 'flora',
     x: x, z: z, y: y - 0.3,
     r: w + 0.6,
     h: H + 0.8,
     tags: { harvest: spMyrtle.tags.harvest }
    });
   }
   BIO.owner = [x, z];
   BIO.range = L.epiphyte; BIO.minRange = 0;
   BIO.put('myrtle_lobe', [x, y + H * 0.36, z], qEuler(0, rr(0, TAU), 0), [w, H * 0.55, w], vary(pick(PAL.myrtleLeaf), 0.02, 0.06, 0.05));
   for (var k = 0; k < 3; k++) {
    var a = k / 3 * TAU + rr(-0.3, 0.3);
    BIO.put('myrtle_sprig', [x + Math.cos(a) * w * 0.35, y + H * 0.45, z + Math.sin(a) * w * 0.35], qEuler(rr(-0.15, 0.15), rr(0, TAU), 0), [w * 0.62, H * 0.55, w * 0.62], vary(0xd8e8d4, 0.02, 0.05, 0.04));
   }
   SHROUDHILLS.MYRTLES.push({ x: x, y: y, z: z, H: H });
   myrtles++;
  }, { pad: 1.0 });

  // 2. Twist E: Scarlet, Saffron & Silver-Velvet Lithophyte Cloak-Tor tapestries (shroud_cloak_bromeliad) on bare granite tors & coastal ribs
  SHROUDHILLS.kgrid('tor_cloak', 5.8 / Math.sqrt(q), function(Z){
   if (Z.path > 0.45) return 0;
   return clamp(Z.cloak_tor * 0.88 + Z.granite * 0.68 + Z.tor * 0.75, 0, 0.92);
  }, function(x, y, z, seed, Z){
   if (BIO.lodD(x, z) > L.tor) return;
   reseed(seed);
   var sz = rr(0.95, 2.25);
   var band = (BIO.fn.fbm(x * 0.022, z * 0.022, 719, 2) - 0.5) * 2.0;
   var col = band < -0.12 ? vary(pick(PAL.torCloakScarlet), 0.015, 0.06, 0.05) :
             band < 0.22 ? vary(pick(PAL.torCloakSaffron), 0.015, 0.06, 0.05) :
             vary(pick(PAL.torCloakSilver), 0.01, 0.04, 0.04);

   if (cloaks < 44 && (cloaks % 4 === 0)) {
    BIO.register({
     name: spCloak.name,
     key: 'shroud_cloak_bromeliad',
     kind: 'flora',
     x: x, z: z, y: y - 0.5,
     r: sz * 0.95 + 0.6,
     h: 1.8,
     tags: { harvest: spCloak.tags.harvest }
    });
   }

   BIO.owner = [x, z];
   BIO.range = L.tor; BIO.minRange = 0;
   // Surface slope normal for granite dome hugging
   var gx = (Y(x + 1.2, z) - Y(x - 1.2, z)) / 2.4;
   var gz = (Y(x, z + 1.2) - Y(x, z - 1.2)) / 2.4;
   var qSlope = qSurfacePose([1, -gx, 0], [-gx, 1, -gz]);

   BIO.put('tor_cloak_mat', [x, y + 0.03, z], qSlope, [sz, sz * 0.68, sz], col);
   BIO.put('tor_bromeliad', [x, y + sz * 0.22, z], qSlope, [sz * 0.92, sz * 0.55, sz * 0.92], col);
   if (band >= 0.18 || Z.tor > 0.5) {
    BIO.put('tor_silver_orchid', [x + rr(-0.3, 0.3), y + 0.08, z + rr(-0.3, 0.3)], qSlope, [sz * 0.55, sz * 0.52, sz * 0.55], vary(pick(PAL.torCloakSilver), 0.01, 0.04, 0.04));
   }
   SHROUDHILLS.CLOAK_MATS.push({ x: x, y: y, z: z, sz: sz });
   cloaks++;
  }, { pad: 1.2 });

  // 3. Twist E: Silver Mist-Sundew Curtains (shroud_dew_strand) fluttering down windward granite scarps & ledges
  SHROUDHILLS.kgrid('dew_strand', 7.4 / Math.sqrt(q), function(Z){
   if (Z.path > 0.45) return 0;
   return clamp(Z.cloak_tor * 0.72 + Z.tor * 0.65 + Z.granite * 0.42, 0, 0.78);
  }, function(x, y, z, seed){
   if (BIO.lodD(x, z) > L.epiphyte) return;
   reseed(seed);
   var len = rr(0.75, 1.75);
   if (dews < 32 && (dews % 3 === 0)) {
    BIO.register({
     name: spDew.name,
     key: 'shroud_dew_strand',
     kind: 'flora',
     x: x, z: z, y: y - 0.3,
     r: 1.4,
     h: len + 1.2,
     tags: { harvest: spDew.tags.harvest }
    });
   }
   BIO.owner = [x, z];
   BIO.range = L.epiphyte; BIO.minRange = 0;
   var qDew = qHangDir(wind[0] * 0.65, -0.78, wind[1] * 0.65, rr(0, TAU));
   BIO.put('dew_strand', [x, y + len * 0.78, z], qDew, [rr(0.55, 0.95), len, 0.6], vary(pick(PAL.dewStrand), 0.01, 0.04, 0.03));
   dews++;
  }, { pad: 1.2 });

  // 4. Shady cloud-rainforest & ironstone ravine floor fern carpet
  SHROUDHILLS.kgrid('floor_fern', 6.8 / Math.sqrt(q), function(Z){
   if (Z.tor > 0.35 || Z.granite > 0.55 || Z.path > 0.35 || Z.cobble > 0.5) return 0;
   return clamp(Z.ravine * 0.85 + Z.canopy_sea * 0.65 + Z.shroud_cove * 0.55, 0, 0.84);
  }, function(x, y, z, seed){
   if (BIO.lodD(x, z) > L.floor) return;
   reseed(seed);
   BIO.owner = [x, z];
   BIO.range = L.floor; BIO.minRange = 0;
   var nF = ri(3, 5), fL = rr(0.9, 1.75), a0 = rr(0, TAU);
   for (var k = 0; k < nF; k++) {
    BIO.put('ravine_fern', [x, y + 0.04, z], qEuler(rr(-0.08, 0.14), a0 + k / nF * TAU + rr(-0.2, 0.2), 0), [fL * 0.58, fL * 0.65, fL], vary(pick(PAL.fernLeaf), 0.02, 0.08, 0.06));
    floorFerns++;
   }
  }, { pad: 0.8 });

  BIO.owner = null; BIO.range = null; BIO.minRange = 0;
  return {
   smudgeMyrtles: myrtles,
   cloakMats: cloaks,
   dewStrands: dews,
   floorFerns: floorFerns
  };
 };
})();
