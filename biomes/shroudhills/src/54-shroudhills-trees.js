// ================================================================= SHROUDHILLS — host trees & octahedral impostors [draw]
// Opens BIO.kit('shroudhills'), sets up library materials/geometries (30), and builds:
//   1. shroud_kohekohe (Buttressed Shroud-Mahogany, 24-36 m): fluted plank-buttresses, horizontal BIO.flareJoin bough-forks
//   2. shroud_amber_kauri (Weeping Amber-Podocarp, 30-44 m): columnar silver-bronze trunk + golden amber resin stalactites
//   3. shroud_tree_fern (Ironstone Ravine Tree-Fern, 3.5-7.5 m): dark scaly trunk & wide emerald-bronze shade fronds
//   4. 34-core-impostor octahedral impostors for far-range 80-85% cloud-rainforest coverage.
BIO.kit('shroudhills');
SHROUDHILLS.setupKit();

(function(){
 'use strict';
 var fn = BIO.fn;
 var TAU = fn.TAU, clamp = fn.clamp, lerp = fn.lerp, mix = fn.mix, smooth = fn.smooth;
 var reseed = fn.reseed, rr = fn.rr, ri = fn.ri, pick = fn.pick, qEuler = fn.qEuler;
 var T3 = BIO.host.THREE;
 var C = function(h){ return new T3.Color(h); };
 var PAL = SHROUDHILLS.PAL;

 SHROUDHILLS.LOD = { tree: 420, mid: 650, bridge: 390, epiphyte: 360, floor: 300, tor: 620 };
 SHROUDHILLS.TREES = [];
 SHROUDHILLS.TREE_FERNS = [];
 SHROUDHILLS.COCONUTS = [];
 SHROUDHILLS.BRIDGE_ANCHORS = [];
 SHROUDHILLS.CUP_FORKS = [];
 SHROUDHILLS.GALL_SPOTS = [];

 var Y = function(x, z){ return BIO.terrainH(x, z); };
 var FL = function(name, x, z){ return BIO.field(name, x, z); };

 var _hsl = { h: 0, s: 0, l: 0 };
 var vary = function(hex, dh, ds, dl){
  var c = hex && hex.isColor ? hex.clone() : C(hex);
  c.getHSL(_hsl);
  c.setHSL(((_hsl.h + rr(-dh, dh)) % 1 + 1) % 1, clamp(_hsl.s + rr(-ds, ds), 0, 1), clamp(_hsl.l + rr(-dl, dl), 0.04, 0.96));
  return c;
 };
 SHROUDHILLS.vary = vary;

 var bright = function(col, k){
  var c = col && col.isColor ? col.clone() : C(col);
  c.convertSRGBToLinear();
  c.r = Math.min(1, c.r * k);
  c.g = Math.min(1, c.g * k);
  c.b = Math.min(1, c.b * k);
  return c.convertLinearToSRGB();
 };
 SHROUDHILLS.bright = bright;

 // Local field-driven ecological zones
 SHROUDHILLS.zonesAt = function(x, z){
  var elev = FL('elevASL', x, z);
  var granite = FL('granite', x, z);
  var coast = FL('coast', x, z);
  var ravine = FL('ravine', x, z);
  var path = FL('path', x, z);
  var cobble = FL('cobble', x, z);
  var tor = FL('tor', x, z);
  var w = SHROUDHILLS.zoneWeights(elev, Math.max(granite, tor), coast);
  return {
   elev: elev,
   granite: granite,
   coast: coast,
   ravine: ravine,
   path: path,
   cobble: cobble,
   tor: tor,
   shroud_cove: w.shroud_cove,
   canopy_sea: w.canopy_sea,
   cloak_tor: w.cloak_tor,
   mist_divide: w.mist_divide
  };
 };

 // Deterministic KRAND cell grid
 var ROOT_SEED = function(){ return KRAND.child(BIO.host.seed >>> 0, 'shroudhills'); };
 SHROUDHILLS.kgrid = function(salt, cell, accept, fnPlace, opt){
  opt = opt || {};
  var R = opt.R == null ? (SHROUDHILLS._R == null ? 1100 : SHROUDHILLS._R) : opt.R;
  var B = opt.box || [-R, -R, R, R];
  var s0 = KRAND.child(ROOT_SEED(), salt);
  var count = 0;
  var ix0 = Math.floor(B[0] / cell), ix1 = Math.floor(B[2] / cell);
  var iz0 = Math.floor(B[1] / cell), iz1 = Math.floor(B[3] / cell);
  for (var iz = iz0; iz <= iz1; iz++) {
   for (var ix = ix0; ix <= ix1; ix++) {
    var s = KRAND.stream(KRAND.cell(s0, ix, iz));
    var x = (ix + s.next()) * cell;
    var z = (iz + s.next()) * cell;
    var u = s.next();
    if (Math.max(Math.abs(x), Math.abs(z)) > R) continue;
    var Z = SHROUDHILLS.zonesAt(x, z);
    var acc = accept(Z, x, z);
    if (acc <= 0 || u > acc) continue;
    var m = opt.noMask ? 1 : BIO.mask(x, z);
    if (m <= 0 || u > acc * m) continue;
    var pad = opt.pad == null ? 0 : opt.pad;
    if (!opt.ignoreObstacles && !BIO.clearOf(x, z, pad)) continue;
    fnPlace(x, Y(x, z), z, KRAND.hash(s0, ix, iz, 17), Z);
    count++;
   }
  }
  return count;
 };

 // BIO.flareJoin wrapper for seamless anatomical branch collars (31j-core-joint.js)
 var flare = function(pts, parentR){
  return BIO.flareJoin ? BIO.flareJoin(pts, { parentR: parentR, k: 1.72, sink: 0.72, cap: 0.92, len: 2.5 }) : pts;
 };

 // Fluted plank-buttress bole lathe (sinks 3.2 m below y0 so trees seat cleanly into steep ravine and cove walls)
 var buildButtressBole = function(fam, T, topH, rb, flareAmp, flareH, nFins, seg, barkPal){
  var fins = [];
  for (var k = 0; k < nFins; k++) {
   fins.push({ a: k / nFins * TAU + rr(-0.22, 0.22), amp: rr(0.65, 1.18) });
  }
  var finSum = function(ang){
   var s = 0;
   for (var i = 0; i < fins.length; i++) {
    var c = Math.cos(ang - fins[i].a);
    if (c > 0) s += fins[i].amp * Math.pow(c, 5);
   }
   return s;
  };
  var leanA = rr(0, TAU), leanM = T.lean == null ? rr(0.01, 0.045) : T.lean;
  var lx = Math.cos(leanA) * leanM, lz = Math.sin(leanA) * leanM;
  var rAt = function(yy){
   var u = clamp(yy / topH, 0, 1);
   var foot = yy < 0 ? 1.25 : Math.exp(-yy / flareH);
   return rb * (1 - 0.34 * u) * (1 + flareAmp * 0.35 * foot);
  };
  var rings = [];
  var yStart = T.scratch ? -0.4 : -3.2;
  var step = 1.4;
  for (var yy = yStart; yy < topH; yy += (yy < flareH * 1.4 ? 0.85 : step)) {
   rings.push({
    x: T.x + lx * Math.max(0, yy),
    y: T.y0 + yy,
    z: T.z + lz * Math.max(0, yy),
    r: rAt(yy),
    yy: yy,
    col: vary(pick(barkPal), 0.01, 0.05, 0.04)
   });
  }
  var rTop = rAt(topH);
  rings.push(
   { x: T.x + lx * topH, y: T.y0 + topH, z: T.z + lz * topH, r: rTop, yy: topH, col: vary(pick(barkPal), 0.01, 0.04, 0.04) },
   { x: T.x + lx * topH, y: T.y0 + topH + rTop * 0.75, z: T.z + lz * topH, r: 0.05, yy: topH + 0.8, col: vary(pick(barkPal), 0.01, 0.04, 0.04) }
  );
  var tris = BIO.lathe(fam, rings, seg, Math.max(1, Math.round(TAU * rb / 2.8)), 4, function(R, ang){
   var finK = R.yy < flareH * 2.2 ? Math.exp(-Math.max(0, R.yy) / flareH) : 0;
   return R.r * (1 + (nFins ? flareAmp * finK * finSum(ang) : 0) + 0.035 * Math.sin(ang * 5 + R.yy * 0.25));
  }, nFins ? function(R, ang){
   var finK = R.yy < flareH * 2.0 ? Math.exp(-Math.max(0, R.yy) / flareH) : 0;
   return mix(1, 0.68 + 0.34 * clamp(finSum(ang), 0, 1), finK);
  } : null);

  return {
   tris: tris,
   top: { x: T.x + lx * topH, y: T.y0 + topH, z: T.z + lz * topH, r: rTop },
   atH: function(h){
    return { x: T.x + lx * h, y: T.y0 + h, z: T.z + lz * h, r: rAt(h) };
   }
  };
 };

 // Put crown foliage clump with outward bent normal for rich light wrap
 var putClump = function(item, x, y, z, sz, flat, col, cx, cy, cz, ex, ey){
  var dx = (x - cx) / ex, dy = (y - cy) / ey, dz = (z - cz) / ex;
  var d = Math.hypot(dx, dy, dz);
  var ao = mix(0.58, 1.04, smooth(0.25, 0.95, d)) * mix(0.82, 1.05, smooth(-0.6, 0.4, dy));
  var nx = dx * 0.85 + rr(-0.22, 0.22), ny = dy * 0.65 + 0.72, nz = dz * 0.85 + rr(-0.22, 0.22);
  var nl = Math.hypot(nx, ny, nz) || 1;
  BIO.put(item, [x, y, z], qEuler(rr(-0.28, 0.28), rr(0, TAU), rr(-0.28, 0.28)), [sz, sz * flat, sz], bright(col, ao * 1.16), {
   n: [nx / nl, ny / nl, nz / nl]
  });
 };

 // ---- 1. Buttressed Shroud-Mahogany (shroud_kohekohe, 24-36 m)
 var buildKohekohe = function(T, st){
  reseed(T.seed);
  var lv = T.lv == null ? 2 : T.lv;
  var H = T.H, rb = T.rb, forkH = H * rr(0.50, 0.64);
  var bole = buildButtressBole('mahogany', T, forkH, rb, 1.45, 3.8, ri(5, 7), lv === 2 ? 12 : 8, PAL.mahoganyBark);
  st.tris += bole.tris;

  // Record trunk gall clasp spots (5-12 m up bole) when not scratch-baking impostor
  if (!T.scratch && lv === 2) {
   var gh = forkH * rr(0.36, 0.62);
   var gp = bole.atH(gh);
   T.gallSpots.push({ treeId: T.id, x: gp.x, y: gp.y, z: gp.z, r: gp.r, ang: rr(0, TAU), seed: KRAND.hash(T.seed, 31) });
  }

  // Primary wide horizontal bough-forks joined with BIO.flareJoin (0.75 g supports massive horizontal reach!)
  var nBoughs = lv === 2 ? ri(4, 6) : 3;
  var a0 = rr(0, TAU);
  var cy = T.y0 + H * 0.76, ex = T.crownR, ey = H * 0.26;
  for (var b = 0; b < nBoughs; b++) {
   var ang = a0 + b / nBoughs * TAU + rr(-0.28, 0.28);
   var startH = forkH * rr(0.84, 0.99);
   var orig = bole.atH(startH);
   var reach = T.crownR * rr(0.78, 1.14);
   var rise = H - startH - rr(1.2, 3.8);
   var r0 = orig.r * rr(0.42, 0.58);
   var pts = [];
   var segs = lv === 2 ? 5 : 3;
   for (var k = 0; k <= segs; k++) {
    var t = k / segs;
    var arch = Math.sin(t * Math.PI * 0.75) * 1.4;
    var px = orig.x + Math.cos(ang) * reach * t + Math.sin(ang) * Math.sin(t * TAU) * 0.45;
    var pz = orig.z + Math.sin(ang) * reach * t - Math.cos(ang) * Math.sin(t * TAU) * 0.45;
    var py = orig.y + rise * Math.pow(t, 1.25) + arch;
    if (!T.scratch) py = Math.max(py, Y(px, pz) + 2.2);
    pts.push({ x: px, y: py, z: pz, r: mix(r0, 0.12, Math.pow(t, 0.8)) });
   }
   var fPts = flare(pts, orig.r);
   st.tris += BIO.tube('mahogany', fPts, vary(pick(PAL.mahoganyBark), 0.01, 0.05, 0.04), { seg: lv === 2 ? 8 : 5, cap: true });

   // Seat a Sister-Cup fork cradle on the wide horizontal inner-mid bough!
   if (!T.scratch && lv === 2 && pts.length >= 3) {
    var fp = pts[2];
    T.cupForks.push({ treeId: T.id, x: fp.x, y: fp.y + fp.r * 0.65, z: fp.z, r: fp.r, ang: ang, seed: KRAND.hash(T.seed, 100 + b) });
    var ap = pts[Math.max(2, segs - 1)];
    T.bridgeAnchors.push({ id: T.id * 16 + b, treeId: T.id, x: ap.x, y: ap.y, z: ap.z, r: ap.r, ang: ang });
   }

   // Secondary ascending sub-forks + dense cloud-mahogany foliage domes
   var nSub = lv === 2 ? 2 : 1;
   for (var s = 0; s < nSub; s++) {
    var idx = Math.min(pts.length - 2, 1 + s * 2);
    var sp0 = pts[idx];
    var sa = ang + (s % 2 ? 0.62 : -0.62) + rr(-0.2, 0.2);
    var sLen = reach * rr(0.36, 0.52);
    var subPts = [
     { x: sp0.x, y: sp0.y, z: sp0.z, r: sp0.r * 0.62 },
     { x: sp0.x + Math.cos(sa) * sLen * 0.55, y: sp0.y + sLen * 0.34, z: sp0.z + Math.sin(sa) * sLen * 0.55, r: sp0.r * 0.42 },
     { x: sp0.x + Math.cos(sa) * sLen, y: sp0.y + sLen * 0.58, z: sp0.z + Math.sin(sa) * sLen, r: 0.09 }
    ];
    st.tris += BIO.tube('mahogany', flare(subPts, sp0.r), vary(pick(PAL.mahoganyBark), 0.01, 0.05, 0.04), { seg: 5, cap: true });
    var tip = subPts[2];
    var cSz = rr(3.6, 5.2);
    putClump('kohe_clump', tip.x, tip.y, tip.z, cSz, 0.72, vary(pick(PAL.koheLeaf), 0.02, 0.08, 0.05), T.x, cy, T.z, ex, ey);
    st.clumps++;
   }

   var bTip = pts[segs];
   var tSz = rr(4.0, 5.8);
   putClump('kohe_clump', bTip.x, bTip.y, bTip.z, tSz, 0.70, vary(pick(PAL.koheLeaf), 0.02, 0.08, 0.05), T.x, cy, T.z, ex, ey);
   st.clumps++;
   if (!T.scratch && lv === 2 && rr(0, 1) < 0.65) {
    var mp = pts[1];
    BIO.put('moss_curtain', [mp.x, mp.y - mp.r * 0.5, mp.z], qEuler(0, rr(0, TAU), 0), [rr(1.1, 2.0), rr(2.2, 4.6), 1], vary(pick(PAL.mossHang), 0.02, 0.06, 0.05));
   }
  }

  // Central crown leader & dome
  var koheTopY = bole.top.y + H * 0.14;
  var koheLead = [
   { x: bole.top.x, y: bole.top.y, z: bole.top.z, r: bole.top.r * 0.62 },
   { x: bole.top.x, y: koheTopY, z: bole.top.z, r: 0.09 }
  ];
  st.tris += BIO.tube('mahogany', flare(koheLead, bole.top.r), vary(pick(PAL.mahoganyBark), 0.01, 0.05, 0.04), { seg: 5, cap: true });
  putClump('kohe_clump', bole.top.x, koheTopY, bole.top.z, rr(4.8, 6.6), 0.74, vary(pick(PAL.koheLeaf), 0.02, 0.08, 0.05), T.x, cy, T.z, ex, ey);
  st.clumps++;
 };

 // ---- 2. Weeping Amber-Podocarp (shroud_amber_kauri, 30-44 m)
 var buildAmberKauri = function(T, st){
  reseed(T.seed);
  var lv = T.lv == null ? 2 : T.lv;
  var H = T.H, rb = T.rb, forkH = H * rr(0.58, 0.70);
  var bole = buildButtressBole('kauri', T, forkH, rb, 0.72, 2.8, ri(4, 5), lv === 2 ? 12 : 8, PAL.kauriBark);
  st.tris += bole.tris;

  if (!T.scratch && lv === 2 && rr(0, 1) < 0.55) {
   var gh = forkH * rr(0.32, 0.52);
   var gp = bole.atH(gh);
   T.gallSpots.push({ treeId: T.id, x: gp.x, y: gp.y, z: gp.z, r: gp.r, ang: rr(0, TAU), seed: KRAND.hash(T.seed, 41) });
  }

  var nBoughs = lv === 2 ? ri(5, 7) : 4;
  var a0 = rr(0, TAU);
  var cy = T.y0 + H * 0.80, ex = T.crownR, ey = H * 0.24;
  for (var b = 0; b < nBoughs; b++) {
   var ang = a0 + b / nBoughs * TAU + rr(-0.24, 0.24);
   var startH = forkH * rr(0.82, 0.99);
   var orig = bole.atH(startH);
   var reach = T.crownR * rr(0.75, 1.08);
   var rise = H - startH - rr(1.0, 4.2);
   var r0 = orig.r * rr(0.38, 0.52);
   var segs = lv === 2 ? 5 : 3;
   var pts = [];
   for (var k = 0; k <= segs; k++) {
    var t = k / segs;
    var px = orig.x + Math.cos(ang) * reach * t;
    var pz = orig.z + Math.sin(ang) * reach * t;
    var py = orig.y + rise * Math.pow(t, 0.92) + Math.sin(t * Math.PI) * 1.1;
    if (!T.scratch) py = Math.max(py, Y(px, pz) + 3.0);
    pts.push({ x: px, y: py, z: pz, r: mix(r0, 0.13, Math.pow(t, 0.82)) });
   }
   st.tris += BIO.tube('kauri', flare(pts, orig.r), vary(pick(PAL.kauriBark), 0.01, 0.04, 0.04), { seg: lv === 2 ? 8 : 5, cap: true });

   // Golden Weeping Amber-Resin Stalactites hanging from bough crotches & scars (amber = 120!)
   var dripSpot = pts[1];
   var dripItem = (b % 2 === 0) ? 'amber_drip0' : 'amber_drip1';
   var dH = rr(1.4, 3.2), dW = rr(0.75, 1.35);
   BIO.put(dripItem, [dripSpot.x, dripSpot.y - dripSpot.r * 0.45, dripSpot.z], qEuler(0, rr(0, TAU), 0), [dW, dH, dW], vary(pick(PAL.amber), 0.015, 0.06, 0.05));
   st.amber++;

   if (!T.scratch && lv === 2 && pts.length >= 3) {
    if (b % 2 === 0) {
     var fp = pts[2];
     T.cupForks.push({ treeId: T.id, x: fp.x, y: fp.y + fp.r * 0.65, z: fp.z, r: fp.r, ang: ang, seed: KRAND.hash(T.seed, 200 + b) });
    }
    var ap = pts[2];
    T.bridgeAnchors.push({ id: T.id * 16 + b, treeId: T.id, x: ap.x, y: ap.y, z: ap.z, r: ap.r, ang: ang });
   }

   for (var c = 2; c <= segs; c++) {
    var cp = pts[c];
    var sz = rr(3.8, 5.6);
    putClump('kauri_clump', cp.x, cp.y, cp.z, sz, 0.62, vary(pick(PAL.kauriLeaf), 0.02, 0.07, 0.05), T.x, cy, T.z, ex, ey);
    st.clumps++;
   }
  }

  // Emergent spire leader
  var leadPts = [
   { x: bole.top.x, y: bole.top.y, z: bole.top.z, r: bole.top.r * 0.78 },
   { x: bole.top.x, y: T.y0 + H * 0.88, z: bole.top.z, r: bole.top.r * 0.36 },
   { x: bole.top.x, y: T.y0 + H, z: bole.top.z, r: 0.08 }
  ];
  st.tris += BIO.tube('kauri', flare(leadPts, bole.top.r), vary(pick(PAL.kauriBark), 0.01, 0.04, 0.04), { seg: 6, cap: true });
  putClump('kauri_clump', bole.top.x, T.y0 + H, bole.top.z, rr(5.2, 7.0), 0.64, vary(pick(PAL.kauriLeaf), 0.02, 0.07, 0.05), T.x, cy, T.z, ex, ey);
  st.clumps++;
 };

 // ---- 3. Ironstone Ravine Tree-Fern (shroud_tree_fern, 3.5-7.5 m)
 var buildTreeFern = function(F, st){
  reseed(F.seed);
  var H = F.H, leanA = rr(0, TAU), lean = rr(0.04, 0.16);
  var pts = [];
  for (var k = 0; k <= 4; k++) {
   var t = k / 4;
   pts.push({
    x: F.x + Math.cos(leanA) * H * lean * t * t,
    y: F.y0 - 0.35 + (H + 0.35) * t,
    z: F.z + Math.sin(leanA) * H * lean * t * t,
    r: mix(0.24, 0.13, t)
   });
  }
  st.tris += BIO.tube('fernbark', pts, vary(pick(PAL.fernBark), 0.01, 0.04, 0.04), { seg: 6, cap: true });
  var top = pts[4];
  var nFronds = F.lv === 2 ? ri(11, 14) : 7;
  var fLen = H * rr(0.54, 0.72);
  var a0 = rr(0, TAU);
  for (var f = 0; f < nFronds; f++) {
   var ang = a0 + f / nFronds * TAU + rr(-0.14, 0.14);
   var pitch = (f % 2 === 0) ? rr(-0.18, 0.04) : rr(0.06, 0.24);
   BIO.put('treefern_frond', [top.x, top.y - 0.06, top.z], qEuler(pitch, ang, rr(-0.08, 0.08)), [fLen * 0.56, fLen * 0.65, fLen], vary(pick(PAL.fernLeaf), 0.02, 0.08, 0.06));
   st.fronds++;
  }
 };

 // ---- 4. Drift-Sown Cove Coconut Palm (coconut, 8.0-15.5 m): J-curved ringed trunk, nut cluster & drooping fronds
 var buildCoconutPalm = function(P, st){
  var h = function(i, k){ return KRAND.unit(KRAND.hash(P.seed >>> 0, i | 0, k | 0)); };
  var H = P.H, r0 = clamp(0.24 + H * 0.006, 0.24, 0.35), az = P.yaw, lean = P.lean;
  var barkCol = vary(PAL.palmBark[(P.seed >>> 0) % PAL.palmBark.length], 0.01, 0.04, 0.04);
  var nSeg = 8, pts = [], riseH = H * (1 - 0.14 * lean * lean);
  for (var i = 0; i <= nSeg; i++) {
   var t = i / nSeg;
   var rad = H * lean * (0.68 * t + 0.32 * t * t);
   var fl = i === 0 ? 1.38 : i === 1 ? 1.14 : 1.0;
   pts.push({
    x: P.x + Math.cos(az) * rad,
    y: P.y0 - 0.35 + (riseH + 0.35) * t,
    z: P.z + Math.sin(az) * rad,
    r: mix(r0, r0 * 0.52, Math.pow(t, 0.85)) * fl
   });
  }
  st.tris += BIO.tube('kauri', pts, barkCol, { seg: P.lv === 2 ? 7 : 5, cap: true });
  var top = pts[nSeg];
  var nutS = 0.95 + 0.24 * h(1, 2);
  BIO.put('coconut_nut', [top.x, top.y - 0.12, top.z], qEuler(0, az + 1.1, 0), [nutS, nutS, nutS], C(PAL.coconutNut[(P.seed >>> 0) % PAL.coconutNut.length]));
  var nF = P.lv === 2 ? 13 : 9, gold = 2.399963, fLen = clamp(2.5 + H * 0.11, 2.8, 4.2);
  for (var k = 0; k < nF; k++) {
   var age = k / (nF - 1), faz = az + k * gold + 0.15 * (h(k + 3, 1) - 0.5);
   var pitch = lerp(0.76, -0.30, Math.pow(age, 0.88)) + 0.07 * (h(k + 3, 2) - 0.5);
   var Lf = fLen * (age < 0.2 ? 0.82 : age > 0.82 ? 0.88 : 1.0) * (0.92 + 0.16 * h(k + 3, 3));
   var cHex = age > 0.80 ? PAL.palmOld[k % PAL.palmOld.length] : PAL.palmLeaf[(k + (P.seed >>> 0)) % PAL.palmLeaf.length];
   BIO.put('palm_frond', [top.x, top.y + 0.02 - 0.12 * age, top.z], qEuler((h(k + 3, 4) - 0.5) * 0.12, -faz, pitch), [Lf, Lf * 0.95, Lf * 1.08], C(cHex));
   st.fronds++;
  }
 };

 // ---- 4b. Weeping Rimu-Podocarp (amberpodocarp, 22-36 m): bronze-olive podocarp with weeping foliage curtains
 var buildRimuPodocarp = function(T, st){
  buildAmberKauri(T, st);
  reseed(KRAND.hash(T.seed, 31));
  var nD = T.lv === 2 ? 6 : 3, a0 = rr(0, TAU);
  for (var d = 0; d < nD; d++) {
   var ang = a0 + d / nD * TAU + rr(-0.2, 0.2);
   var rch = T.crownR * rr(0.45, 0.78);
   var py = T.y0 + T.H * rr(0.62, 0.80);
   var px = T.x + Math.cos(ang) * rch, pz = T.z + Math.sin(ang) * rch;
   st.tris += BIO.tube('kauri', [{ x: T.x, y: py + 0.6, z: T.z, r: 0.16 }, { x: px, y: py, z: pz, r: 0.08 }], vary(pick(PAL.kauriBark), 0.01, 0.04, 0.04), { seg: 4, cap: true });
   BIO.put('rimu_drape', [px, py, pz], qEuler(0, rr(0, TAU), 0), [rr(1.3, 2.2), rr(2.2, 3.8), 1], vary(pick(PAL.rimuLeaf), 0.02, 0.06, 0.05));
   st.fronds++;
  }
 };

 // ---- 4c. Shroud Nikau Feather-Palm (shroudnikau, 5.5-11.5 m): green-ringed trunk, bulbous crownshaft & stiff ascending fronds
 var buildNikauPalm = function(N, st){
  var h = function(i, k){ return KRAND.unit(KRAND.hash(N.seed >>> 0, i | 0, k | 0)); };
  var H = N.H, r0 = clamp(0.16 + H * 0.008, 0.17, 0.27);
  var barkCol = vary(PAL.nikauBark[(N.seed >>> 0) % PAL.nikauBark.length], 0.01, 0.05, 0.04);
  var pts = [];
  for (var i = 0; i <= 6; i++) {
   var t = i / 6;
   pts.push({
    x: N.x + Math.cos(N.yaw) * H * 0.06 * t * t,
    y: N.y0 - 0.3 + (H - 0.55 + 0.3) * t,
    z: N.z + Math.sin(N.yaw) * H * 0.06 * t * t,
    r: mix(r0 * 1.18, r0 * 0.72, t)
   });
  }
  st.tris += BIO.tube('kauri', pts, barkCol, { seg: 6, cap: true });
  var top = pts[6];
  BIO.put('nikau_shaft', [top.x, top.y - 0.12, top.z], qEuler(0, N.yaw, 0), [1.05, 0.92, 1.05], C(PAL.nikauShaft[(N.seed >>> 0) % PAL.nikauShaft.length]));
  var topY = top.y + 0.72, nF = N.lv === 2 ? 10 : 7, fLen = clamp(1.9 + H * 0.12, 2.1, 3.3);
  st.tris += BIO.tube('kauri', [{ x: top.x, y: top.y, z: top.z, r: r0 * 0.78 }, { x: top.x, y: topY + 0.06, z: top.z, r: r0 * 0.55 }], C(PAL.nikauShaft[0]), { seg: 5, cap: true });
  for (var k = 0; k < nF; k++) {
   var faz = N.yaw + k * 2.399963, pitch = lerp(0.88, 0.24, k / (nF - 1));
   var Lf = fLen * (0.9 + 0.18 * h(k + 2, 1));
   BIO.put('nikau_frond', [top.x, topY, top.z], qEuler(0, -faz, pitch), [Lf, Lf * 0.95, Lf * 0.85], C(PAL.palmLeaf[(k + (N.seed >>> 0)) % PAL.palmLeaf.length]));
   st.fronds++;
  }
 };

 // ---- 4d. Raid-Cove Screwpine (covepandan, 3.5-7.5 m) & Matron's Bast-Hibiscus (covehibiscus, 3.0-6.8 m)
 var buildCovePandan = function(P, st){
  var h = function(i, k){ return KRAND.unit(KRAND.hash(P.seed >>> 0, i | 0, k | 0)); };
  var H = P.H, rb = clamp(H * 0.024, 0.10, 0.18), la = P.yaw;
  var barkCol = vary(PAL.palmBark[(P.seed >>> 0) % PAL.palmBark.length], 0.01, 0.04, 0.04);
  var hubY = P.y0 + 0.55 + H * 0.08, nPr = P.lv === 2 ? 5 : 3;
  for (var k = 0; k < nPr; k++) {
   var az = (k / nPr) * TAU + 0.28 * (h(k + 4, 1) - 0.5), sp = 0.65 + 0.52 * h(k + 4, 2);
   var rx = P.x + Math.cos(az) * sp, rz = P.z + Math.sin(az) * sp, fy = Math.min(P.y0 + 0.15, Y(rx, rz)) - 0.25;
   st.tris += BIO.tube('kauri', [{ x: P.x, y: hubY, z: P.z, r: rb * 0.38 }, { x: lerp(P.x, rx, 0.55), y: lerp(hubY, fy, 0.45), z: lerp(P.z, rz, 0.55), r: rb * 0.30 }, { x: rx, y: fy, z: rz, r: rb * 0.22 }], barkCol, { seg: 4, cap: true });
  }
  var topX = P.x + Math.cos(la) * H * 0.18, topZ = P.z + Math.sin(la) * H * 0.18, topY = P.y0 + H * 0.56;
  st.tris += BIO.tube('kauri', [{ x: P.x, y: P.y0 - 0.25, z: P.z, r: rb * 1.18 }, { x: lerp(P.x, topX, 0.5), y: lerp(hubY, topY, 0.5), z: lerp(P.z, topZ, 0.5), r: rb * 0.86 }, { x: topX, y: topY, z: topZ, r: rb * 0.74 }], barkCol, { seg: 5, cap: true });
  var nHeads = P.lv === 2 ? 3 : 2;
  for (var hd = 0; hd < nHeads; hd++) {
   var haz = la + (hd - (nHeads - 1) * 0.5) * 1.6 + 0.26 * (h(20 + hd, 1) - 0.5), hLen = H * (0.28 + 0.11 * h(20 + hd, 2));
   var hx = topX + Math.cos(haz) * hLen * 0.64, hy = topY + hLen * 0.76, hz = topZ + Math.sin(haz) * hLen * 0.64;
   st.tris += BIO.tube('kauri', flare([{ x: topX, y: topY, z: topZ, r: rb * 0.60 }, { x: hx, y: hy, z: hz, r: rb * 0.40 }], rb * 0.74), barkCol, { seg: 4, cap: true });
   var nS = P.lv === 2 ? 11 : 7, sL = clamp(H * 0.28, 1.15, 2.2);
   for (var s = 0; s < nS; s++) {
    var age = s / (nS - 1), saz = s * 2.399963 + hd * 1.1, pitch = lerp(0.92, -0.36, age);
    BIO.put('cove_pandan_strap', [hx, hy - 0.03 * age, hz], qEuler(0, -saz, pitch), [sL * (age < 0.22 ? 0.76 : 1), sL * 0.85, sL * 0.55], C(PAL.pandanLeaf[(s + hd) % PAL.pandanLeaf.length]));
    st.fronds++;
   }
   if (hd === 0) {
    var fs = 0.20 + 0.06 * h(60, 2);
    BIO.put('cove_pandan_fruit', [hx + Math.cos(haz) * 0.12, hy - 0.16, hz + Math.sin(haz) * 0.12], qEuler(0.14, haz, 0), [fs, fs * 1.25, fs], C(PAL.pandanFruit[(P.seed >>> 0) % PAL.pandanFruit.length]));
   }
  }
 };

 var buildCoveHibiscus = function(B, st){
  var h = function(i, k){ return KRAND.unit(KRAND.hash(B.seed >>> 0, i | 0, k | 0)); };
  var H = B.H, barkCol = vary(PAL.mahoganyBark[(B.seed >>> 0) % PAL.mahoganyBark.length], 0.01, 0.04, 0.04);
  var nSt = 3 + ((B.seed >>> 0) % 2);
  for (var s = 0; s < nSt; s++) {
   var az = B.yaw + (s / nSt) * TAU + 0.35 * (h(s + 2, 1) - 0.5);
   var sp = H * (0.34 + 0.18 * h(s + 2, 2)), sh = H * (0.68 + 0.24 * h(s + 2, 3)), r0 = clamp(H * 0.028, 0.08, 0.16);
   var mx = B.x + Math.cos(az) * sp * 0.56, my = B.y0 + sh * 0.38, mz = B.z + Math.sin(az) * sp * 0.56;
   var ex = B.x + Math.cos(az) * sp, ey = B.y0 + sh, ez = B.z + Math.sin(az) * sp;
   st.tris += BIO.tube('mahogany', [{ x: B.x, y: B.y0 - 0.22, z: B.z, r: r0 }, { x: mx, y: my, z: mz, r: r0 * 0.72 }, { x: ex, y: ey, z: ez, r: r0 * 0.36 }], barkCol, { seg: 5, cap: true });
   var fS = clamp(H * 0.44, 1.35, 2.75);
   BIO.put('hibiscus_fol', [ex, ey - 0.04, ez], qEuler(0, az, 0), [fS, fS * 0.64, fS], C(PAL.hibiscusLeaf[(s + (B.seed >>> 0)) % PAL.hibiscusLeaf.length]));
   if (s < 2) {
    BIO.put('hibiscus_bloom', [ex + Math.cos(az) * 0.22, ey + fS * 0.22, ez + Math.sin(az) * 0.22], qEuler(0.15, az, 0), [1.25, 1.25, 1.25], C(PAL.hibiscusBloom[s % PAL.hibiscusBloom.length]));
   }
  }
 };

 // ---- Register 34-core-impostor octahedral impostors for far-range 80-85% cloud rainforest
 var IMP_SET = BIO.impostorSet ? BIO.impostorSet('shroudhills_imp', { grid: 6, cell: 64, slots: 2, label: 'Shroudhills cloud-rainforest crowns' }) : null;
 var IMP_KOHE = IMP_SET ? BIO.impostor('imp_kohekohe', function(){
  buildKohekohe({ id: 0, x: 0, z: 0, y0: 0, H: 30, rb: 0.95, crownR: 8.8, seed: 4101, lv: 2, scratch: true, cupForks: [], bridgeAnchors: [], gallSpots: [] }, { tris: 0, clumps: 0 });
 }, { set: IMP_SET, label: 'Buttressed Shroud-Mahogany (far)' }) : null;
 var IMP_KAURI = IMP_SET ? BIO.impostor('imp_kauri', function(){
  buildAmberKauri({ id: 0, x: 0, z: 0, y0: 0, H: 37, rb: 1.22, crownR: 9.6, seed: 4202, lv: 2, scratch: true, cupForks: [], bridgeAnchors: [], gallSpots: [] }, { tris: 0, clumps: 0, amber: 0 });
 }, { set: IMP_SET, label: 'Weeping Amber-Podocarp (far)' }) : null;
 if (IMP_SET) {
  BIO.impostorItem('imp_trees', IMP_SET, { label: 'Shroudhills cloud-rainforest tree (impostor)', tags: { species: 'shroud_kohekohe' }, reach: 40 });
 }

 // ---- Placement & building pass
 SHROUDHILLS.buildTrees = function(R, q, opt){
  opt = opt || {};
  q = q == null ? 1 : q;
  SHROUDHILLS._R = R;
  var st = { tris: 0, clumps: 0, amber: 0, fronds: 0, kohe: 0, kauri: 0, rimu: 0, ferns: 0, nikaus: 0, coconuts: 0, pandans: 0, hibiscus: 0, heroes: 0, fars: 0 };

  SHROUDHILLS.TREES.length = 0;
  SHROUDHILLS.TREE_FERNS.length = 0;
  SHROUDHILLS.COCONUTS.length = 0;
  var NIKAUS = [], COVE_PANDANS = [], COVE_HIBISCUS = [];
  SHROUDHILLS.BRIDGE_ANCHORS.length = 0;
  SHROUDHILLS.CUP_FORKS.length = 0;
  SHROUDHILLS.GALL_SPOTS.length = 0;

  var L = SHROUDHILLS.LOD;
  var heroR = BIO.radii().hero;
  var lvOf = function(x, z){
   var d = BIO.lodD(x, z);
   return d < heroR ? 2 : d < heroR + 180 ? 1 : 0;
  };

  var SPX = KSPACE.create({ cell: 12 });
  SHROUDHILLS._treeSpace = SPX;
  var clearAt = function(x, z, r){
   return !SPX.some(x, z, r, function(o){ return Math.hypot(x - o.x, z - o.z) < o.r + r; });
  };

  var nextId = 1;

  // 1. Emergent Weeping Amber-Kauri & Weeping Rimu-Podocarps on cove bluffs & upper ravine shoulders
  SHROUDHILLS.kgrid('amber_kauri', 32 / Math.sqrt(q), function(Z){
   if (Z.tor > 0.32 || Z.granite > 0.55 || Z.path > 0.25 || Z.cobble > 0.45) return 0;
   return clamp((Z.shroud_cove * 0.78 + Z.canopy_sea * 0.46) * (1 - Z.ravine * 0.55), 0, 0.85);
  }, function(x, y, z, seed, Z){
   var s = KRAND.stream(seed);
   var isRimu = s.next() < 0.34;
   var H = (isRimu ? lerp(24, 36, s.next()) : lerp(30, 44, s.next())) * lerp(1.0, 0.82, Z.coast * 0.5);
   var rb = lerp(0.92, 1.48, clamp((H - 26) / 18, 0, 1));
   var crownR = lerp(7.8, 11.4, s.next());
   var keepR = 5.4;
   if (!clearAt(x, z, keepR)) return;
   var T = {
    id: nextId++,
    key: isRimu ? 'amberpodocarp' : 'shroud_amber_kauri',
    x: x, z: z, y0: y,
    H: H, rb: rb, crownR: crownR,
    lean: Z.coast > 0.35 ? lerp(0.04, 0.09, s.next()) : lerp(0.01, 0.035, s.next()),
    seed: seed,
    lv: lvOf(x, z),
    cupForks: [], bridgeAnchors: [], gallSpots: []
   };
   SPX.insert({ x: x, z: z, r: keepR, tree: T }, x, z, keepR);
   SHROUDHILLS.TREES.push(T);
  }, { pad: 2.5 });

  // 2. Buttressed Shroud-Mahogany (shroud_kohekohe) forming the dense 80-85% cloud-forest matrix & Root-Hammock bough network
  SHROUDHILLS.kgrid('kohekohe', 16.5 / Math.sqrt(q), function(Z){
   if (Z.tor > 0.30 || Z.granite > 0.52 || Z.path > 0.22 || Z.cobble > 0.45) return 0;
   return clamp((Z.canopy_sea * 0.92 + Z.shroud_cove * 0.82) * (1 - Z.ravine * 0.12), 0, 0.95);
  }, function(x, y, z, seed, Z){
   var s = KRAND.stream(seed);
   var H = lerp(24, 36, s.next()) * (1 + 0.08 * Z.ravine);
   var rb = lerp(0.76, 1.18, (H - 24) / 12);
   var crownR = lerp(7.4, 10.6, s.next());
   var keepR = Z.ravine > 0.25 ? 4.1 : 4.8;
   if (!clearAt(x, z, keepR)) return;
   var T = {
    id: nextId++,
    key: 'shroud_kohekohe',
    x: x, z: z, y0: y,
    H: H, rb: rb, crownR: crownR,
    lean: Z.ravine > 0.3 ? lerp(0.03, 0.08, s.next()) : lerp(0.01, 0.04, s.next()),
    seed: seed,
    lv: lvOf(x, z),
    cupForks: [], bridgeAnchors: [], gallSpots: []
   };
   SPX.insert({ x: x, z: z, r: keepR, tree: T }, x, z, keepR);
   SHROUDHILLS.TREES.push(T);
  }, { pad: 2.2 });

  // 3. Ironstone Ravine Tree-Ferns (shroud_tree_fern) & Shroud Nikau Feather-Palms (shroudnikau) in damp gullies
  SHROUDHILLS.kgrid('tree_fern', 11.0 / Math.sqrt(q), function(Z){
   if (Z.tor > 0.25 || Z.granite > 0.48 || Z.path > 0.28 || Z.cobble > 0.55) return 0;
   return clamp(Z.ravine * 0.85 + Z.canopy_sea * 0.34 + Z.shroud_cove * 0.28, 0, 0.82);
  }, function(x, y, z, seed, Z){
   if (!clearAt(x, z, 1.8)) return;
   var s = KRAND.stream(seed);
   var lv = lvOf(x, z);
   if (lv === 0) return;
   if (Z.elev < 820 && s.next() < 0.22) {
    NIKAUS.push({ key: 'shroudnikau', x: x, z: z, y0: y, H: lerp(5.8, 11.2, s.next()), yaw: s.next() * TAU, seed: seed, lv: lv });
    SPX.insert({ x: x, z: z, r: 2.1 }, x, z, 2.1);
    return;
   }
   SHROUDHILLS.TREE_FERNS.push({
    key: 'shroud_tree_fern',
    x: x, z: z, y0: y,
    H: lerp(3.5, 7.5, s.next()),
    seed: seed,
    lv: lv
   });
  }, { pad: 1.4 });

  // 4. Drift-Sown Cove Coconut Palms (coconut), Raid-Cove Screwpines (covepandan) & Bast-Hibiscus (covehibiscus) on Station 1 cove
  SHROUDHILLS.kgrid('coconut', 21.0 / Math.sqrt(q), function(Z, x, z){
   var y = Y(x, z), w = BIO.waterH(x, z);
   if (w > -1e8 && y < w + 1.25) return 0;
   var slp = Math.hypot(Y(x + 2, z) - Y(x - 2, z), Y(x, z + 2) - Y(x, z - 2)) / 4;
   if (!SHROUDHILLS.coveStrandPalmOk({
    coast: Z.coast, elevASL: Z.elev, y: y, seaLevel: 0,
    tor: Z.tor, granite: Z.granite, path: Z.path, slope: slp
   })) return 0;
   return clamp((Z.cobble * 0.55 + Z.shroud_cove * 0.72) * smooth(108, 52, Z.elev), 0, 0.78);
  }, function(x, y, z, seed){
   if (!clearAt(x, z, 2.8)) return;
   var s = KRAND.stream(seed);
   var gx = Y(x - 2, z) - Y(x + 2, z), gz = Y(x, z - 2) - Y(x, z + 2);
   var seaAz = (Math.abs(gx) + Math.abs(gz) > 0.02) ? Math.atan2(gz, gx) : s.next() * TAU;
   var P = {
    key: 'coconut',
    x: x, z: z, y0: y,
    H: lerp(8.2, 15.2, s.next()),
    lean: lerp(0.16, 0.34, s.next()),
    yaw: seaAz + (s.next() - 0.5) * 0.45,
    seed: seed,
    lv: lvOf(x, z)
   };
   SPX.insert({ x: x, z: z, r: 2.8, palm: P }, x, z, 2.8);
   SHROUDHILLS.COCONUTS.push(P);
  }, { pad: 2.4 });

  SHROUDHILLS.kgrid('cove_littoral', 24.0 / Math.sqrt(q), function(Z, x, z){
   var y = Y(x, z), w = BIO.waterH(x, z);
   if (w > -1e8 && y < w + 1.15) return 0;
   var slp = Math.hypot(Y(x + 2, z) - Y(x - 2, z), Y(x, z + 2) - Y(x, z - 2)) / 4;
   if (!SHROUDHILLS.coveStrandPalmOk({
    coast: Z.coast, elevASL: Z.elev, y: y, seaLevel: 0,
    tor: Z.tor, granite: Z.granite, path: Z.path, slope: slp
   })) return 0;
   return clamp((Z.cobble * 0.5 + Z.shroud_cove * 0.65) * smooth(104, 50, Z.elev), 0, 0.68);
  }, function(x, y, z, seed){
   var lv = lvOf(x, z);
   if (lv === 0 || !clearAt(x, z, 2.3)) return;
   var s = KRAND.stream(seed);
   var yaw = s.next() * TAU;
   if (s.next() < 0.54) {
    COVE_PANDANS.push({ key: 'covepandan', x: x, z: z, y0: y, H: lerp(3.8, 7.2, s.next()), yaw: yaw, seed: seed, lv: lv });
   } else {
    COVE_HIBISCUS.push({ key: 'covehibiscus', x: x, z: z, y0: y, H: lerp(3.2, 6.4, s.next()), yaw: yaw, seed: seed, lv: lv });
   }
   SPX.insert({ x: x, z: z, r: 2.3 }, x, z, 2.3);
  }, { pad: 2.0 });

  // Register BEFORE drawing and build host trees + octahedral impostors
  for (var i = 0; i < SHROUDHILLS.TREES.length; i++) {
   var T = SHROUDHILLS.TREES[i];
   var spRec = SHROUDHILLS.byKey[T.key];
   BIO.owner = [T.x, T.z];
   var isPodocarp = T.key === 'shroud_amber_kauri' || T.key === 'amberpodocarp';
   if (T.lv === 0) {
    if (IMP_SET) {
     BIO.range = null; BIO.minRange = 0;
     var imp = isPodocarp ? IMP_KAURI : IMP_KOHE;
     BIO.impostorPut('imp_trees', imp, [T.x, T.y0 - 0.6, T.z], (T.seed % 628) / 100, T.H / (isPodocarp ? 37 : 30), null);
     st.fars++;
    }
    continue;
   }

   if (T.lv === 2) {
    BIO.register({
     name: spRec.name,
     key: T.key,
     kind: 'tree',
     x: T.x, z: T.z, y: T.y0 - 1.0,
     r: Math.max(3.2, T.crownR * 0.55),
     h: T.H + 2.5,
     tags: { harvest: spRec.tags.harvest }
    });
   }
   BIO.host.obstacles.push({ x: T.x, z: T.z, r: T.rb * 1.45 + 0.8, y0: T.y0 - 3, y1: T.y0 + T.H });

   BIO.range = L.tree; BIO.minRange = 0;
   if (T.key === 'amberpodocarp') {
    buildRimuPodocarp(T, st);
    st.rimu++;
   } else if (T.key === 'shroud_amber_kauri') {
    buildAmberKauri(T, st);
    st.kauri++;
   } else {
    buildKohekohe(T, st);
    st.kohe++;
   }
   st.heroes++;

   if (IMP_SET) {
    BIO.range = 1e9; BIO.minRange = L.tree;
    var impFar = isPodocarp ? IMP_KAURI : IMP_KOHE;
    BIO.impostorPut('imp_trees', impFar, [T.x, T.y0 - 0.6, T.z], (T.seed % 628) / 100, T.H / (isPodocarp ? 37 : 30), null);
   }

   for (var cf = 0; cf < T.cupForks.length; cf++) SHROUDHILLS.CUP_FORKS.push(T.cupForks[cf]);
   for (var ba = 0; ba < T.bridgeAnchors.length; ba++) SHROUDHILLS.BRIDGE_ANCHORS.push(T.bridgeAnchors[ba]);
   for (var gs = 0; gs < T.gallSpots.length; gs++) SHROUDHILLS.GALL_SPOTS.push(T.gallSpots[gs]);
  }

  // Build Ironstone Ravine Tree-Ferns
  var spFern = SHROUDHILLS.byKey.shroud_tree_fern;
  for (var j = 0; j < SHROUDHILLS.TREE_FERNS.length; j++) {
   var F = SHROUDHILLS.TREE_FERNS[j];
   BIO.owner = [F.x, F.z];
   if (F.lv === 2 && (j % 3 === 0)) {
    BIO.register({
     name: spFern.name,
     key: 'shroud_tree_fern',
     kind: 'flora',
     x: F.x, z: F.z, y: F.y0 - 0.5,
     r: 2.6,
     h: F.H + 1.5,
     tags: { harvest: spFern.tags.harvest }
    });
   }
   BIO.range = L.mid; BIO.minRange = 0;
   buildTreeFern(F, st);
   st.ferns++;
  }

  // Build Shroud Nikau Feather-Palms (register BEFORE drawing)
  var spNikau = SHROUDHILLS.byKey.shroudnikau;
  for (var ni = 0; ni < NIKAUS.length; ni++) {
   var N = NIKAUS[ni];
   BIO.owner = [N.x, N.z];
   if (N.lv === 2) {
    BIO.register({
     name: spNikau.name, key: 'shroudnikau', kind: 'tree',
     x: N.x, z: N.z, y: N.y0 - 0.5, r: 2.8, h: N.H + 1.6,
     tags: { harvest: spNikau.tags.harvest }
    });
   }
   BIO.range = L.mid; BIO.minRange = 0;
   buildNikauPalm(N, st);
   st.nikaus++;
  }

  // Register BEFORE drawing and build Drift-Sown Cove Coconut Palms, Screwpines & Bast-Hibiscus
  var spCoco = SHROUDHILLS.byKey.coconut;
  for (var m = 0; m < SHROUDHILLS.COCONUTS.length; m++) {
   var P = SHROUDHILLS.COCONUTS[m];
   BIO.owner = [P.x, P.z];
   BIO.register({
    name: spCoco.name,
    key: 'coconut',
    kind: 'tree',
    x: P.x, z: P.z, y: P.y0 - 0.5,
    r: 3.6,
    h: P.H + 2.2,
    tags: { strand: true, harvest: spCoco.tags.harvest }
   });
   BIO.host.obstacles.push({ x: P.x, z: P.z, r: 1.5, y0: P.y0 - 2, y1: P.y0 + P.H + 1.5 });
   BIO.range = P.lv === 0 ? 950 : L.mid;
   BIO.minRange = 0;
   buildCoconutPalm(P, st);
   st.coconuts++;
  }

  var spPandan = SHROUDHILLS.byKey.covepandan;
  for (var pi = 0; pi < COVE_PANDANS.length; pi++) {
   var CP = COVE_PANDANS[pi];
   BIO.owner = [CP.x, CP.z];
   BIO.register({
    name: spPandan.name, key: 'covepandan', kind: 'tree',
    x: CP.x, z: CP.z, y: CP.y0 - 0.4, r: 2.6, h: CP.H + 1.4,
    tags: { strand: true, harvest: spPandan.tags.harvest }
   });
   BIO.range = L.mid; BIO.minRange = 0;
   buildCovePandan(CP, st);
   st.pandans++;
  }

  var spHib = SHROUDHILLS.byKey.covehibiscus;
  for (var hi = 0; hi < COVE_HIBISCUS.length; hi++) {
   var CH = COVE_HIBISCUS[hi];
   BIO.owner = [CH.x, CH.z];
   BIO.register({
    name: spHib.name, key: 'covehibiscus', kind: 'flora',
    x: CH.x, z: CH.z, y: CH.y0 - 0.3, r: 2.6, h: CH.H + 1.0,
    tags: { strand: true, harvest: spHib.tags.harvest }
   });
   BIO.range = L.mid; BIO.minRange = 0;
   buildCoveHibiscus(CH, st);
   st.hibiscus++;
  }

  BIO.owner = null; BIO.range = null; BIO.minRange = 0;
  return {
   trees: SHROUDHILLS.TREES.length,
   kohekohe: st.kohe,
   amberKauri: st.kauri,
   rimuPodocarp: st.rimu,
   amberDrips: st.amber,
   treeFerns: st.ferns,
   nikauPalms: st.nikaus,
   coconuts: st.coconuts,
   covePandans: st.pandans,
   coveHibiscus: st.hibiscus,
   heroes: st.heroes,
   farImpostors: st.fars
  };
 };
})();
