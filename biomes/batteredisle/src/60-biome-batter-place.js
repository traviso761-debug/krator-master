// ================================================================= BATTERED ISLE — deterministic KRAND.cell placement & BIO.kin [G data]
// Places all 8 own species, BIO.kin borrowed cousins (biomes/arch nickel-hyperaccumulators & biomes/farside intertidal wrack),
// volcanic boulders/coal/garnierite outcrops, and 6 coastal fauna cohorts strictly by order-independent KRAND.cell hashes,
// enforcing all PLAN.md section 7.2 invariants:
//   1. Asymmetric Megatsunami Trimline: WNW rampart canopy trees strictly >= +56.0 m (0 below +55 m); leeward cove/strait down to +18.0 m
//   2. Bimodal Cone-and-Collar Lithology: nickelmyrtle & arch kin strictly on ultramafic (0 on sedimentary strait);
//      covepandan & coal=201 outcrops on sedimentary/collar coves
//   3. Submarine Kelp & Basal Spring Bounds: soundkelp strictly at bedElevM <= -0.5 m; tuffcress strictly within 12 m of active springs

(function(){
 'use strict';

 BATTER.placeAll = function(opt){
  opt = opt || {};
  BATTER.setupKit();

  var fn = BIO.fn;
  var TAU = fn.TAU, clamp = fn.clamp, smooth = fn.smooth, reseed = fn.reseed, rr = fn.rr, qEuler = fn.qEuler;
  var hostInfo = (BIO.host && BIO.host.batteredisle) || {};
  var R = opt.R == null ? 480 : opt.R;
  var q = opt.quality == null ? 1.0 : opt.quality;
  var stKey = opt.station || hostInfo.station || 'cove';
  var site = BATTER_SITES.get(stKey);
  var elevOffset = opt.elevOffset != null ? opt.elevOffset : (site.elevOffset || 0);
  var exposedWNW = opt.exposedWNW != null ? opt.exposedWNW : !!site.exposedWNW;
  var lithology = opt.lithology || site.lithology || 'ultramafic';
  var hasCollar = opt.hasCollar != null ? opt.hasCollar : !!site.hasCollarOutcrop;
  var seaLevel = opt.seaLevel !== undefined ? opt.seaLevel : site.seaLevel;

  var Y = BIO.host.terrainH;
  var c0 = BIO.center();
  var Lv = BIO.LOD();
  var S = opt.space || KSPACE.create({ cell: 18 });
  var seed = KRAND.child((BIO.host.seed || BATTER_PHYS.SEED) >>> 0, 'batteredisle/place');

  /* Reserve keep-out helper (keeps Battered-Port rim & Seamount-Beacon clear or lightly framed) */
  var reserves = opt.reserves || site.reserves || [];
  function inReserveCore(x, z){
   for (var i = 0; i < reserves.length; i++) {
    var rv = reserves[i];
    if (Math.hypot(x - rv.x, z - rv.z) < rv.r * 0.55) return true;
   }
   return false;
  }

  function slopeAt(x, z){
   var e = 2.0;
   return Math.hypot((Y(x + e, z) - Y(x - e, z)) / (2 * e), (Y(x, z + e) - Y(x, z - e)) / (2 * e));
  }

  BATTER.TREES.length = 0;
  if (BATTER.PALMS) BATTER.PALMS.length = 0;
  BATTER.ROCKS.length = 0;
  BATTER.FAUNA_INST.length = 0;
  BATTER.LOG = [];
  BATTER.KIN_COUNTS = { archPycnandra: 0, archGymnostoma: 0, farsideWrack: 0, farsideWineweed: 0 };

  var counts = {
   batteredlaurel: 0,
   ironkneepodocarp: 0,
   nickelmyrtle: 0,
   scoriathrift: 0,
   cindersedge: 0,
   covepandan: 0,
   coconut: 0,
   seatamanu: 0,
   seahibiscus: 0,
   craterfern: 0,
   beachsheoak: 0,
   saltnaupaka: 0,
   cinderglory: 0,
   archfern: 0,
   olivinesheoak: 0,
   nickelphyllanthus: 0,
   springsundew: 0,
   coalhorsetail: 0,
   rampartpalm: 0,
   corallineturf: 0,
   cliffsamphire: 0,
   plugohia: 0,
   plugcushion: 0,
   tuffcress: 0,
   soundkelp: 0,
   boulders: 0,
   coalSlabs: 0,
   garnieriteVeins: 0,
   fauna: 0
  };

  function cellLoop(cellM, salt, maxD, cb){
   var N = Math.ceil((R * 2) / cellM);
   for (var iz = 0; iz < N; iz++) {
    for (var ix = 0; ix < N; ix++) {
     var cx = c0[0] - R + (ix + 0.5) * cellM;
     var cz = c0[1] - R + (iz + 0.5) * cellM;
     if (Math.hypot(cx - c0[0], cz - c0[1]) > R) continue;
     var ld = BIO.lodD(cx, cz);
     if (ld > maxD) continue;
     var hCell = KRAND.cell(seed ^ salt, ix, iz);
     reseed(hCell);
     var px = cx + (KRAND.unit(KRAND.hash(hCell, 1, salt)) - 0.5) * cellM * 0.86;
     var pz = cz + (KRAND.unit(KRAND.hash(hCell, 2, salt)) - 0.5) * cellM * 0.86;
     if (!BIO.clearOf(px, pz, 2.5)) continue;
     cb(px, pz, hCell, ld);
    }
   }
  }

  /* ----------------------------------------------------------------
     PASS 1: Canopy Trees — Salt-Wedge Crater Laurel & Dike-Clasp Ship-Podocarp
     Asymmetric Trimline Invariant:
       - WNW exposed rampart: strictly elevASL >= 56.0 m (ZERO trees below +55 m!)
       - Leeward cove / strait / summit plug: elevASL >= 18.0 m
     ---------------------------------------------------------------- */
  var treeMinElev = exposedWNW ? 56.2 : 18.2;
  BIO.cur = 'batteredisle/trees';
  cellLoop(17.0, 0x1101, Lv.far, function(x, z, hCell, ld){
   if (inReserveCore(x, z)) return;
   var y = Y(x, z);
   var asl = elevOffset + y;
   if (asl < treeMinElev) return;
   if (seaLevel != null && y < seaLevel + 2.5) return;
   var sl = slopeAt(x, z);
   if (sl > 0.72) return;
   var dike01 = BIO.field('dike', x, z);
   /* Keep solid crest of summit volcanic neck (>835 m ASL) clear of tall canopy trees */
   if (asl > 832.0 || dike01 > 0.78) return;

   var prob = (0.58 - 0.35 * sl) * q;
   if (KRAND.unit(KRAND.hash(hCell, 3, 0x1101)) > prob) return;
   if (S.some(x, z, 5.2, function(o){ return Math.hypot(x - o.x, z - o.z) < 5.2 + o.r; })) return;

   var isPodo = dike01 > 0.22 || KRAND.unit(KRAND.hash(hCell, 4, 0x1101)) < 0.38;
   var kind = isPodo ? 'ironkneepodocarp' : 'batteredlaurel';
   var sc = 0.78 + 0.42 * KRAND.unit(KRAND.hash(hCell, 5, 0x1101)) * (asl > 740 ? 0.72 : 1.0);
   var shear = BATTER_PHYS.windShearAt({
    elevM: asl,
    azFromCenterDeg: site.azFromPlugDeg,
    gullyShelter01: clamp(1 - sl * 1.4, 0, 0.55)
   });

   var T;
   if (ld > 560 && BIO.defs['imp_' + kind]) {
    var impH = (isPodo ? 18.5 : 14.5) * sc;
    BIO.put('imp_' + kind, [x, y - 0.15, z], qEuler(0, KRAND.unit(KRAND.hash(hCell, 6, 0x1101)) * TAU, 0), [impH * 0.65, impH, impH * 0.65], 0xffffff);
    T = { x: x, y0: y, z: z, H: impH, rb: 0.4 * sc, crownR: 4.2 * sc, kind: kind, lv: 0 };
   } else {
    T = BATTER.growTree(kind, x, y, z, KRAND.hash(hCell, 7, 0x1101), sc, { shear: shear, range: 620 });
    T.lv = 2;
   }
   T.elevASL = +asl.toFixed(2);
   S.insert({ x: x, z: z, r: 4.8 * sc }, x, z, 4.8 * sc);
   BATTER.TREES.push(T);
   BIO.host.register({
    name: BATTER.byKey[kind].name,
    key: kind,
    kind: 'tree',
    x: x, y: y, z: z,
    r: T.crownR, h: T.H,
    tags: BATTER.byKey[kind].tags
   });
   counts[kind]++;
  });

  /* ----------------------------------------------------------------
     PASS 2: Bimodal Shrubs & Screw-Palms — nickelmyrtle (ultramafic ONLY) & covepandan (leeward sedimentary/collar ONLY)
     ---------------------------------------------------------------- */
  BIO.cur = 'batteredisle/shrubs';
  if (lithology === 'ultramafic') {
   cellLoop(11.5, 0x2201, Lv.mid, function(x, z, hCell){
    var y = Y(x, z), asl = elevOffset + y;
    var minM = exposedWNW ? 52.0 : 22.0;
    if (asl < minM || asl > 852.0 || (seaLevel != null && y < seaLevel + 3.0)) return;
    if (slopeAt(x, z) > 0.78) return;
    var garn = BIO.field('garnierite', x, z);
    var scoria = BIO.field('scoria', x, z);
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x2201)) > (0.28 + 0.46 * Math.max(garn, scoria)) * q) return;
    if (S.some(x, z, 2.2, function(o){ return Math.hypot(x - o.x, z - o.z) < 2.2 + o.r; })) return;
    var sc = 0.8 + 0.45 * KRAND.unit(KRAND.hash(hCell, 4, 0x2201));
    var T = BATTER.growShrubOrPalm('nickelmyrtle', x, y, z, KRAND.hash(hCell, 5, 0x2201), sc);
    S.insert({ x: x, z: z, r: 1.6 }, x, z, 1.6);
    BATTER.LOG.push({ key: 'nickelmyrtle', lithology: lithology, x: x, z: z, elevASL: asl });
    BIO.host.register({ name: 'Garnierite Cinder-Scrub', key: 'nickelmyrtle', kind: 'shrub', x: x, y: y, z: z, r: 1.4, h: T.H, tags: BATTER.byKey.nickelmyrtle.tags });
    counts.nickelmyrtle++;
   });
  }

  if (!exposedWNW && seaLevel != null && (stKey === 'strait' || hasCollar)) {
   cellLoop(13.0, 0x2202, Lv.mid, function(x, z, hCell){
    var y = Y(x, z), asl = elevOffset + y;
    if (y < seaLevel + 2.6 || asl > 44.0 || slopeAt(x, z) > 0.65) return;
    /* On Station 1 cove, keep covepandan strictly on the SE sedimentary collar sector; ubiquitous on Station 3 strait */
    if (stKey === 'cove' && BIO.field('coal', x, z) < 0.15) return;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x2202)) > 0.42 * q) return;
    if (S.some(x, z, 2.8, function(o){ return Math.hypot(x - o.x, z - o.z) < 2.8 + o.r; })) return;
    var sc = 0.82 + 0.38 * KRAND.unit(KRAND.hash(hCell, 4, 0x2202));
    var T = BATTER.growShrubOrPalm('covepandan', x, y, z, KRAND.hash(hCell, 5, 0x2202), sc);
    S.insert({ x: x, z: z, r: 2.2 }, x, z, 2.2);
    BATTER.LOG.push({ key: 'covepandan', lithology: stKey === 'strait' ? 'sedimentary' : 'collar', x: x, z: z, elevASL: asl });
    BIO.host.register({ name: 'Sea-Arch Screw-Palm', key: 'covepandan', kind: 'tree', x: x, y: y, z: z, r: 2.0, h: T.H, tags: BATTER.byKey.covepandan.tags });
    counts.covepandan++;
   });
  }

  /* 2c. Drift-Sown Coconut Palms (Cocos nucifera): sheltered ESE/SSE wave-shadow coves (+2.6..+48 m, ZERO on WNW rampart or +868 m plug) */
  if (!exposedWNW && seaLevel != null) {
   cellLoop(12.0, 0x2203, Lv.far, function(x, z, hCell, ld){
    if (inReserveCore(x, z)) return;
    var y = Y(x, z), asl = elevOffset + y;
    var sl = slopeAt(x, z);
    var dike01 = BIO.field('dike', x, z);
    var cs = BATTER_PHYS.coconutStrandAt({
     exposedWNW: exposedWNW,
     hasSea: seaLevel != null,
     elevASL: asl,
     seaClearM: y - seaLevel,
     slope: sl,
     dikeRib01: dike01,
     azFromCenterDeg: site.azFromPlugDeg
    });
    if (!cs.strandOk) return;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x2203)) > (0.58 + 0.36 * cs.suitability01) * q) return;
    if (S.some(x, z, 3.6, function(o){ return Math.hypot(x - o.x, z - o.z) < 3.6 + o.r; })) return;
    var H0 = 7.0 + 6.4 * KRAND.unit(KRAND.hash(hCell, 4, 0x2203));
    var lean = 0.15 + 0.17 * KRAND.unit(KRAND.hash(hCell, 5, 0x2203));
    var yaw = KRAND.unit(KRAND.hash(hCell, 6, 0x2203)) * TAU;
    var dx = -Math.cos(yaw) * Math.sin(lean) * H0, dz = Math.sin(yaw) * Math.sin(lean) * H0;
    /* Register in KTAGS strictly before drawing */
    BIO.host.register({
     name: BATTER.byKey.coconut.name,
     key: 'coconut',
     kind: 'tree',
     x: x, y: y, z: z,
     r: Math.max(3.6, Math.hypot(dx, dz) + 2.0),
     h: H0 + 2.4,
     tags: BATTER.byKey.coconut.tags
    });
    var P = BATTER.growCoconut(x, y, z, H0, yaw, lean, KRAND.hash(hCell, 7, 0x2203), ld < Lv.floor[1] ? 2 : 0);
    P.elevASL = +asl.toFixed(2);
    S.insert({ x: x, z: z, r: 3.4 }, x, z, 3.4);
    BATTER.PALMS.push(P);
    BATTER.LOG.push({ key: 'coconut', station: stKey, exposedWNW: exposedWNW, x: x, z: z, elevASL: P.elevASL });
    counts.coconut++;
   });

   /* 2d. Leeward Sea-Tamanu, Strand Ironwood, Sea-Hibiscus, Salt-Naupaka & Ravine Tree-Ferns */
   cellLoop(17.5, 0x2204, Lv.far, function(x, z, hCell){
    if (inReserveCore(x, z)) return;
    var y = Y(x, z), asl = elevOffset + y, sl = slopeAt(x, z);
    if (y < seaLevel + 3.2 || asl > 46.0 || sl > 0.62) return;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x2204)) > 0.34 * q) return;
    if (S.some(x, z, 3.8, function(o){ return Math.hypot(x - o.x, z - o.z) < 3.8 + o.r; })) return;
    var kind = KRAND.unit(KRAND.hash(hCell, 4, 0x2204)) < 0.52 ? 'seatamanu' : 'beachsheoak';
    var sc = 0.80 + 0.36 * KRAND.unit(KRAND.hash(hCell, 5, 0x2204));
    BIO.host.register({ name: BATTER.byKey[kind].name, key: kind, kind: 'tree', x: x, y: y, z: z, r: 3.6 * sc, h: 10.5 * sc, tags: BATTER.byKey[kind].tags });
    var T = BATTER.growStrandTree(kind, x, y, z, KRAND.hash(hCell, 6, 0x2204), sc);
    T.elevASL = +asl.toFixed(2);
    S.insert({ x: x, z: z, r: 3.6 * sc }, x, z, 3.6 * sc);
    BATTER.PALMS.push(T);
    BATTER.LOG.push({ key: kind, station: stKey, x: x, z: z, elevASL: T.elevASL });
    counts[kind]++;
   });

   cellLoop(13.5, 0x2205, Lv.mid, function(x, z, hCell){
    if (inReserveCore(x, z)) return;
    var y = Y(x, z), asl = elevOffset + y, sl = slopeAt(x, z);
    if (y < seaLevel + 2.2 || asl > 38.0 || sl > 0.65) return;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x2205)) > 0.38 * q) return;
    if (S.some(x, z, 2.2, function(o){ return Math.hypot(x - o.x, z - o.z) < 2.2 + o.r; })) return;
    var kind = (asl < 18.0 && KRAND.unit(KRAND.hash(hCell, 4, 0x2205)) < 0.46) ? 'saltnaupaka' : 'seahibiscus';
    var sc = 0.82 + 0.36 * KRAND.unit(KRAND.hash(hCell, 5, 0x2205));
    BIO.host.register({ name: BATTER.byKey[kind].name, key: kind, kind: 'shrub', x: x, y: y, z: z, r: 1.8 * sc, h: 3.2 * sc, tags: BATTER.byKey[kind].tags });
    BATTER.growBloomShrub(kind, x, y, z, KRAND.hash(hCell, 6, 0x2205), sc);
    S.insert({ x: x, z: z, r: 1.8 * sc }, x, z, 1.8 * sc);
    BATTER.LOG.push({ key: kind, station: stKey, x: x, z: z, elevASL: +asl.toFixed(2) });
    counts[kind]++;
   });

   cellLoop(15.0, 0x2206, Lv.mid, function(x, z, hCell){
    if (inReserveCore(x, z)) return;
    var y = Y(x, z), asl = elevOffset + y, sl = slopeAt(x, z);
    if (asl < 14.0 || asl > 165.0 || (seaLevel != null && y < seaLevel + 5.0) || sl > 0.68) return;
    var damp = (hostInfo.streamDistAt && stKey === 'cove') ? clamp(1 - hostInfo.streamDistAt(x, z) / 55.0, 0, 1) : 0.35;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x2206)) > (0.20 + 0.42 * damp) * q) return;
    if (S.some(x, z, 2.4, function(o){ return Math.hypot(x - o.x, z - o.z) < 2.4 + o.r; })) return;
    var sc = 0.82 + 0.38 * KRAND.unit(KRAND.hash(hCell, 4, 0x2206));
    BIO.host.register({ name: BATTER.byKey.craterfern.name, key: 'craterfern', kind: 'tree', x: x, y: y, z: z, r: 2.2 * sc, h: 4.0 * sc, tags: BATTER.byKey.craterfern.tags });
    var TF = BATTER.growTreeFern(x, y, z, KRAND.hash(hCell, 5, 0x2206), sc);
    TF.elevASL = +asl.toFixed(2);
    S.insert({ x: x, z: z, r: 2.2 * sc }, x, z, 2.2 * sc);
    BATTER.PALMS.push(TF);
    counts.craterfern++;
   });
  }

  /* 2e. Ultramafic Olivine She-Oak, Emerald-Sap Nickel Phyllanthus & Summit Cloud-Moss Ohia */
  if (lithology === 'ultramafic') {
   cellLoop(14.5, 0x2207, Lv.mid, function(x, z, hCell){
    if (inReserveCore(x, z)) return;
    var y = Y(x, z), asl = elevOffset + y, sl = slopeAt(x, z);
    if (asl < (exposedWNW ? 53.5 : 22.0) || asl > 855.0 || (seaLevel != null && y < seaLevel + 4.0) || sl > 0.72) return;
    var garn = BIO.field('garnierite', x, z);
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x2207)) > (0.22 + 0.36 * garn) * q) return;
    if (S.some(x, z, 2.0, function(o){ return Math.hypot(x - o.x, z - o.z) < 2.0 + o.r; })) return;
    var kind = garn > 0.25 && KRAND.unit(KRAND.hash(hCell, 4, 0x2207)) < 0.55 ? 'nickelphyllanthus' : 'olivinesheoak';
    var sc = 0.80 + 0.40 * KRAND.unit(KRAND.hash(hCell, 5, 0x2207));
    BIO.host.register({ name: BATTER.byKey[kind].name, key: kind, kind: 'shrub', x: x, y: y, z: z, r: 1.6 * sc, h: 2.8 * sc, tags: BATTER.byKey[kind].tags });
    BATTER.growBloomShrub(kind, x, y, z, KRAND.hash(hCell, 6, 0x2207), sc);
    S.insert({ x: x, z: z, r: 1.6 * sc }, x, z, 1.6 * sc);
    BATTER.LOG.push({ key: kind, lithology: lithology, x: x, z: z, elevASL: +asl.toFixed(2) });
    counts[kind]++;
   });
  }

  if (stKey === 'plug') {
   cellLoop(16.5, 0x2208, Lv.far, function(x, z, hCell){
    if (inReserveCore(x, z)) return;
    var y = Y(x, z), asl = elevOffset + y, sl = slopeAt(x, z);
    if (asl < 645.0 || asl > 856.0 || sl > 0.72) return;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x2208)) > 0.36 * q) return;
    if (S.some(x, z, 2.8, function(o){ return Math.hypot(x - o.x, z - o.z) < 2.8 + o.r; })) return;
    var sc = 0.78 + 0.38 * KRAND.unit(KRAND.hash(hCell, 4, 0x2208));
    BIO.host.register({ name: BATTER.byKey.plugohia.name, key: 'plugohia', kind: 'tree', x: x, y: y, z: z, r: 2.6 * sc, h: 5.2 * sc, tags: BATTER.byKey.plugohia.tags });
    var TO = BATTER.growStrandTree('plugohia', x, y, z, KRAND.hash(hCell, 5, 0x2208), sc);
    TO.elevASL = +asl.toFixed(2);
    S.insert({ x: x, z: z, r: 2.6 * sc }, x, z, 2.6 * sc);
    BATTER.TREES.push(TO);
    counts.plugohia++;
   });
  }

  /* ----------------------------------------------------------------
     PASS 3: Ground Flora & Submarine Sound-Kelp (scoriathrift, cindersedge, tuffcress, soundkelp + 8 specialist ground/intertidal species)
     ---------------------------------------------------------------- */
  BIO.cur = 'batteredisle/floor';

  /* 3a. Scoriathrift cushions & spray-cliff sea-fennel on wave-scoured basalt benches (+2.5..+56 m) */
  if (seaLevel != null) {
   cellLoop(7.5, 0x3301, Lv.floor[1], function(x, z, hCell){
    var y = Y(x, z), asl = elevOffset + y, sl = slopeAt(x, z);
    if (y < seaLevel + 1.8 || asl > 56.0 || sl > 0.75) return;
    var p = (exposedWNW ? 0.48 : 0.22) * q;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x3301)) > p) return;
    var sz = 0.42 + 0.44 * KRAND.unit(KRAND.hash(hCell, 4, 0x3301)), yaw = KRAND.unit(KRAND.hash(hCell, 5, 0x3301)) * TAU;
    if (sl > 0.24 && KRAND.unit(KRAND.hash(hCell, 6, 0x3301)) < 0.36) {
     BIO.put('bt_cliffsamphire', [x, y - 0.02, z], qEuler(0, yaw, 0), [sz, sz * 0.85, sz], 0x76a288);
     BIO.put('bt_samphire_umbel', [x, y + sz * 0.24, z], qEuler(0, yaw + 0.6, 0), [sz * 0.68, sz * 0.45, sz * 0.68], 0xd8dc58);
     counts.cliffsamphire++;
    } else {
     BIO.put('bt_scoriathrift', [x, y - 0.02, z], qEuler(0, yaw, 0), [sz, sz * 0.75, sz], 0x86a87c);
     counts.scoriathrift++;
    }
   });
  }

  /* 3b. Cindersedge tussocks (+16..+835 m) & Summit Cloud-Cistern Cushions (+675..+866 m on plug) */
  cellLoop(6.5, 0x3302, Lv.floor[1], function(x, z, hCell){
   var y = Y(x, z), asl = elevOffset + y;
   if ((seaLevel != null && y < seaLevel + 6.0) || asl < 16.0 || asl > 866.0 || slopeAt(x, z) > 0.72) return;
   if (KRAND.unit(KRAND.hash(hCell, 3, 0x3302)) > 0.38 * q) return;
   var sz = 0.55 + 0.55 * KRAND.unit(KRAND.hash(hCell, 4, 0x3302)), yaw = KRAND.unit(KRAND.hash(hCell, 5, 0x3302)) * TAU;
   if (stKey === 'plug' && asl >= 675.0 && KRAND.unit(KRAND.hash(hCell, 6, 0x3302)) < 0.42) {
    BIO.put('bt_plugcushion', [x, y - 0.02, z], qEuler(0, yaw, 0), [sz * 0.85, sz * 0.65, sz * 0.85], 0x9ab29e);
    counts.plugcushion++;
   } else if (asl <= 835.0) {
    BIO.put('bt_cindersedge', [x, y - 0.03, z], qEuler(0, yaw, 0), [sz, sz * 0.9, sz], 0x9c8e58);
    counts.cindersedge++;
   }
  });

  /* 3c. Tuffcress & Basal-Spring Sundew strictly within <= 11.5 m of active basal palagonite spring lines (seepFlowLs > 0.5) */
  if (hostInfo.streamDistAt && stKey === 'cove') {
   cellLoop(4.2, 0x3303, Lv.floor[1], function(x, z, hCell){
    var sd = hostInfo.streamDistAt(x, z);
    if (sd > 11.2 || sd < 1.2) return;
    var y = Y(x, z), asl = elevOffset + y;
    if (seaLevel != null && y < seaLevel + 1.2) return;
    var sp = BATTER_PHYS.springLineAt({ elevM: Math.max(24, asl), scoriaDepthM: 2.4, palagonite01: 0.78, upslopeCatchKm2: 2.2 });
    if (!(sp.seepFlowLs > 0.5)) return;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x3303)) > 0.68 * q) return;
    var sz = 0.52 + 0.45 * KRAND.unit(KRAND.hash(hCell, 4, 0x3303)), yaw = KRAND.unit(KRAND.hash(hCell, 5, 0x3303)) * TAU;
    if (KRAND.unit(KRAND.hash(hCell, 6, 0x3303)) < 0.34) {
     BIO.put('bt_springsundew', [x, y - 0.01, z], qEuler(0, yaw, 0), [sz * 0.72, sz * 0.45, sz * 0.72], 0xc83832);
     counts.springsundew++;
    } else {
     BIO.put('bt_tuffcress', [x, y - 0.03, z], qEuler(0, yaw, 0), [sz, sz * 0.85, sz], 0x5ea65a);
     BATTER.LOG.push({ key: 'tuffcress', springDistM: +sd.toFixed(2), seepFlowLs: sp.seepFlowLs, x: x, z: z });
     counts.tuffcress++;
    }
   });
  }

  /* 3d. Submarine Sound-Kelp strictly at bedElevM <= -0.5 m (ZERO terrestrial kelp!) */
  if (seaLevel != null) {
   cellLoop(9.5, 0x3304, Lv.mid, function(x, z, hCell){
    var bedY = Y(x, z);
    if (bedY > -0.65 || bedY < -24.0) return;
    var p = (exposedWNW ? 0.24 : 0.56) * q;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x3304)) > p) return;
    var depth = Math.max(0.8, seaLevel - bedY);
    var kh = Math.min(depth * 0.82, 3.0 + 6.5 * KRAND.unit(KRAND.hash(hCell, 4, 0x3304)));
    var topY = Math.min(seaLevel - 0.35, bedY + kh);
    var span = Math.max(0.5, topY - bedY);
    var kyaw = KRAND.unit(KRAND.hash(hCell, 5, 0x3304)) * TAU;
    BIO.tree(x, z, function(){
     BIO.beam('bt_rod_pandan', [x, bedY - 0.12, z], [x, topY, z], 0.055, 0.03, 0x6c5a28);
     BIO.put('bt_soundkelp', [x, topY, z], qEuler(0, kyaw, 0), [1.1, span, 1.1], 0x947a34);
    }, { range: 520 });
    BATTER.LOG.push({ key: 'soundkelp', bedElevM: +bedY.toFixed(2), x: x, z: z });
    counts.soundkelp++;
   });

   /* 3e. Leeward Cinder Beach-Glory, Palagonite Sea-Arch Spleenwort, Collar Scour-Horsetail & Intertidal Sea-Palm / Coralline Crust */
   cellLoop(8.5, 0x3305, Lv.floor[1], function(x, z, hCell){
    var y = Y(x, z), asl = elevOffset + y, sl = slopeAt(x, z);
    var u0 = KRAND.unit(KRAND.hash(hCell, 3, 0x3305)), yaw = KRAND.unit(KRAND.hash(hCell, 4, 0x3305)) * TAU;
    if (y >= seaLevel - 0.35 && y <= seaLevel + 4.2 && sl < 0.78 && u0 < 0.36 * q) {
     if (exposedWNW && y >= seaLevel + 0.25 && KRAND.unit(KRAND.hash(hCell, 5, 0x3305)) < 0.45) {
      BATTER.growSeaPalm(x, y, z, KRAND.hash(hCell, 6, 0x3305), 0.85 + 0.35 * u0);
      counts.rampartpalm++;
     } else {
      var csz = 0.55 + 0.55 * KRAND.unit(KRAND.hash(hCell, 5, 0x3305));
      BIO.put('bt_coralline_crust', [x, y + 0.01, z], qEuler(0, yaw, 0), [csz, 0.35, csz], 0xd88ca4);
      counts.corallineturf++;
     }
    } else if (!exposedWNW && y >= seaLevel + 2.0 && asl <= 18.0 && sl < 0.42 && u0 < 0.32 * q) {
     var gsz = 0.75 + 0.55 * KRAND.unit(KRAND.hash(hCell, 5, 0x3305));
     BIO.put('bt_cinderglory', [x, y - 0.01, z], qEuler(0, yaw, 0), [gsz, 0.45, gsz], 0x529442);
     BIO.put('bt_glory_bloom', [x, y + 0.03, z], qEuler(0, yaw + 0.9, 0), [gsz * 0.65, 0.45, gsz * 0.65], 0xd668b8);
     counts.cinderglory++;
    } else if (hasCollar && BIO.field('coal', x, z) >= 0.16 && y >= seaLevel + 1.6 && asl <= 50.0 && u0 < 0.38 * q) {
     var hsz = 0.62 + 0.48 * KRAND.unit(KRAND.hash(hCell, 5, 0x3305));
     BIO.put('bt_coalhorsetail', [x, y - 0.02, z], qEuler(0, yaw, 0), [hsz * 0.7, hsz * 1.15, hsz * 0.7], 0x4c8a56);
     counts.coalhorsetail++;
    } else if (BIO.field('palagonite', x, z) > 0.25 && y >= seaLevel + 3.2 && asl <= 64.0 && u0 < 0.30 * q) {
     var fsz = 0.52 + 0.42 * KRAND.unit(KRAND.hash(hCell, 5, 0x3305));
     BIO.put('bt_archfern', [x, y - 0.02, z], qEuler(0, yaw, 0), [fsz, fsz * 0.85, fsz], 0x569644);
     counts.archfern++;
    }
   });
  }

  /* ----------------------------------------------------------------
     PASS 4: BIO.kin Cross-Biome Partners (read in place, zero copied fragments)
       - biomes/arch (arch.pycnandra & arch.gymnostoma) on ultramafic nickel=180 scoria/plug (Station 4 & ultramafic slopes)
       - biomes/farside (farside.stormwrack & farside.wineweed) on intertidal shore swash (Stations 1, 2, 3)
     ---------------------------------------------------------------- */
  if (PQ.get('kin') !== '0' && typeof BIO.kin === 'function') {
   BIO.cur = 'batteredisle/kin';
   if (lithology === 'ultramafic' && BIO.kits && BIO.kits.arch && BIO.kits.arch.api) {
    var KPycn = BIO.kin('arch.pycnandra', { key: 'batter_pycnandra', name: 'Garnierite Seve-Bleue (arch kin)', scale: 0.85 });
    var KGym  = BIO.kin('arch.gymnostoma', { key: 'batter_gymnostoma', name: 'Ultramafic Maquis She-Oak (arch kin)', scale: 0.85 });
    if (KPycn && KGym) {
     cellLoop(18.0, 0x4401, Lv.mid, function(x, z, hCell){
      var y = Y(x, z), asl = elevOffset + y;
      if (asl < (exposedWNW ? 56.0 : 28.0) || asl > 845.0 || (seaLevel != null && y < seaLevel + 4.0) || slopeAt(x, z) > 0.68) return;
      var garn = BIO.field('garnierite', x, z);
      var chance = (stKey === 'plug' ? 0.42 : 0.16) * (0.35 + 0.65 * garn) * q;
      if (KRAND.unit(KRAND.hash(hCell, 3, 0x4401)) > chance) return;
      if (S.some(x, z, 2.4, function(o){ return Math.hypot(x - o.x, z - o.z) < 2.4 + o.r; })) return;
      reseed(KRAND.hash(hCell, 4, 0x4401));
      var useP = KRAND.unit(KRAND.hash(hCell, 5, 0x4401)) < 0.55;
      var K = useP ? KPycn : KGym;
      var T = K.make(x, y, z);
      K.grow(T, 2);
      S.insert({ x: x, z: z, r: 2.0 }, x, z, 2.0);
      if (useP) BATTER.KIN_COUNTS.archPycnandra++;
      else BATTER.KIN_COUNTS.archGymnostoma++;
      BIO.host.register({ name: K.name, key: K.key, kind: 'shrub', x: x, y: y, z: z, r: 1.6, h: 2.6, tags: K.tags });
     });
    }
   }

   if (seaLevel != null && BIO.kits && BIO.kits.farside && BIO.kits.farside.api) {
    var KWrack = BIO.kin('farside.stormwrack', { key: 'batter_stormwrack', name: 'Intertidal Storm-Wrack (farside kin)' });
    var KWine  = BIO.kin('farside.wineweed',   { key: 'batter_wineweed',   name: 'Tide-Line Wine-Weed (farside kin)' });
    if (KWrack && KWine) {
     cellLoop(8.5, 0x4402, Lv.floor[1], function(x, z, hCell){
      var y = Y(x, z);
      /* Strictly intertidal swash zone (-0.35 .. +2.4 m) — ZERO terrestrial landkelp! */
      if (y < seaLevel - 0.35 || y > seaLevel + 2.4 || slopeAt(x, z) > 0.85) return;
      var chance = (stKey === 'strait' ? 0.62 : 0.36) * q;
      if (KRAND.unit(KRAND.hash(hCell, 3, 0x4402)) > chance) return;
      reseed(KRAND.hash(hCell, 4, 0x4402));
      var useW = KRAND.unit(KRAND.hash(hCell, 5, 0x4402)) < 0.62;
      var K = useW ? KWrack : KWine;
      var T = K.make(x, y, z);
      K.grow(T, 2);
      if (useW) BATTER.KIN_COUNTS.farsideWrack++;
      else BATTER.KIN_COUNTS.farsideWineweed++;
     });
    }
   }
  }

  /* ----------------------------------------------------------------
     PASS 5: Wave-Tossed Megaboulders, Upturned Coal=201 Collar Seams & Nickel=180 Garnierite Veins
     ---------------------------------------------------------------- */
  BIO.cur = 'batteredisle/rocks';
  cellLoop(16.0, 0x5501, Lv.mid, function(x, z, hCell){
   var y = Y(x, z), asl = elevOffset + y;
   if (seaLevel != null && y < seaLevel - 1.5) return;
   /* Tsunami megaboulder ridge concentrated at +8..+48 m on WNW rampart, smaller scoria blocks elsewhere */
   var onBench = exposedWNW && y > 6.0 && y < 48.0;
   var p = (onBench ? 0.44 : 0.18) * q;
   if (KRAND.unit(KRAND.hash(hCell, 3, 0x5501)) > p) return;
   if (S.some(x, z, 2.5, function(o){ return Math.hypot(x - o.x, z - o.z) < 2.5 + o.r; })) return;
   var isBasalt = onBench || BIO.field('dike', x, z) > 0.35 || stKey === 'plug';
   var sz = onBench ? (1.4 + 2.2 * KRAND.unit(KRAND.hash(hCell, 4, 0x5501))) : (0.65 + 1.15 * KRAND.unit(KRAND.hash(hCell, 4, 0x5501)));
   var item = isBasalt ? 'bt_boulder_basalt' : 'bt_boulder_scoria';
   BIO.put(item, [x, y - sz * 0.18, z], qEuler(rr(-0.2, 0.2), KRAND.unit(KRAND.hash(hCell, 5, 0x5501)) * TAU, rr(-0.2, 0.2)), [sz, sz * 0.78, sz], 0xffffff);
   S.insert({ x: x, z: z, r: sz }, x, z, sz);
   counts.boulders++;
   void asl;
  });

  /* Upturned contact-coked coal = 201 collar seam outcrops (Stations 1 & 3) */
  if (hasCollar) {
   cellLoop(14.0, 0x5502, Lv.mid, function(x, z, hCell){
    var coalW = BIO.field('coal', x, z);
    if (coalW < 0.25) return;
    var y = Y(x, z);
    if (seaLevel != null && y < seaLevel + 0.5) return;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x5502)) > 0.52 * coalW * q) return;
    var sz = 1.2 + 1.4 * KRAND.unit(KRAND.hash(hCell, 4, 0x5502));
    /* Dip 42 deg outward matching upturned-coal-collar KSTRATA! */
    BIO.put('bt_slab_coal', [x, y - 0.15, z], qEuler(0.73, KRAND.unit(KRAND.hash(hCell, 5, 0x5502)) * 0.5, 0.15), [sz, sz, sz], 0xffffff);
    BIO.host.register({ name: 'Upturned Collar Coal=201 Seam', key: 'coal-seam', kind: 'feature', x: x, y: y, z: z, r: sz * 1.4, h: sz, tags: { resource: 'coal', grade: 201 } });
    counts.coalSlabs++;
   });
  }

  /* Green nickel = 180 garnierite-serpentine fracture veins (ultramafic Stations 1, 2, 4 — dense on Station 4 plug) */
  if (lithology === 'ultramafic') {
   cellLoop(15.0, 0x5503, Lv.mid, function(x, z, hCell){
    var gw = BIO.field('garnierite', x, z);
    if (gw < 0.22) return;
    var y = Y(x, z);
    if (seaLevel != null && y < seaLevel + 2.0) return;
    if (KRAND.unit(KRAND.hash(hCell, 3, 0x5503)) > (stKey === 'plug' ? 0.56 : 0.28) * gw * q) return;
    var sz = 0.95 + 1.15 * KRAND.unit(KRAND.hash(hCell, 4, 0x5503));
    BIO.put('bt_vein_garnierite', [x, y - 0.12, z], qEuler(rr(-0.2, 0.2), KRAND.unit(KRAND.hash(hCell, 5, 0x5503)) * TAU, rr(-0.2, 0.2)), [sz, sz, sz], 0xffffff);
    BIO.host.register({ name: 'Garnierite-Serpentine Nickel=180 Vein', key: 'nickel-vein', kind: 'feature', x: x, y: y, z: z, r: sz * 1.3, h: sz * 0.8, tags: { resource: 'nickel', grade: 180 } });
    counts.garnieriteVeins++;
   });
  }

  /* ----------------------------------------------------------------
     PASS 6: Coastal Rookery, Intertidal & Cinder-Slope Fauna Cohorts
     ---------------------------------------------------------------- */
  BIO.cur = 'batteredisle/fauna';
  cellLoop(26.0, 0x6601, Lv.floor[1], function(x, z, hCell){
   var y = Y(x, z), asl = elevOffset + y;
   if (KRAND.unit(KRAND.hash(hCell, 3, 0x6601)) > 0.36 * q) return;
   var yaw = KRAND.unit(KRAND.hash(hCell, 4, 0x6601)) * TAU;
   if (stKey === 'rampart' && seaLevel != null && y > 0.3 && y < 12.0) {
    BIO.put('bt_fauna_chiton', [x, y + 0.04, z], qEuler(0, yaw, 0), [1, 1, 1], 0x383c42);
    counts.fauna++;
   } else if ((stKey === 'cove' || stKey === 'strait') && seaLevel != null && y > 0.4 && y < 4.5) {
    BIO.put('bt_fauna_seal', [x, y + 0.22, z], qEuler(0, yaw, 0), [1, 1, 1], 0x564c44);
    BIO.host.register({ name: 'Kelp-Cove Eared Seal', key: 'soundseal', kind: 'fauna', x: x, y: y, z: z, r: 1.4, h: 0.8, tags: { fauna: 'soundseal' } });
    counts.fauna++;
   } else if ((stKey === 'cove' || stKey === 'strait') && y > 5.0 && y < 34.0 && BIO.field('palagonite', x, z) > 0.3) {
    BIO.put('bt_fauna_cormorant', [x, y + 0.21, z], qEuler(0, yaw, 0), [1, 1, 1], 0x2c3036);
    counts.fauna++;
   } else if (asl >= 60.0 && (stKey === 'plug' || stKey === 'cove')) {
    var isPetrel = KRAND.unit(KRAND.hash(hCell, 5, 0x6601)) < 0.55;
    BIO.put(isPetrel ? 'bt_fauna_petrel' : 'bt_fauna_gecko', [x, y + 0.08, z], qEuler(0, yaw, 0), [1, 1, 1], isPetrel ? 0x42464e : 0x486e56);
    counts.fauna++;
   } else if (stKey !== 'plug' && y > 16.0 && y < 78.0) {
    BIO.put('bt_fauna_goat', [x, y + 0.38, z], qEuler(0, yaw, 0), [1, 1, 1], 0x766858);
    counts.fauna++;
   }
  });

  BIO.cur = null;
  BATTER.COUNTS = counts;
  return counts;
 };
})();
