// ================================================================= HOST — stage: 4-station worn cinder-cone terrain, KCOAST, KSTACKS, KCARVE & KCAVERN [web]
const SKEY = typeof STATION_KEY !== 'undefined' ? STATION_KEY : 'cove';
const SITE = BATTER_SITES.get(SKEY);

const BATTER_STATE = {
 mode: 'Calm',
 waveEnergy: 1.0,
 drawdownM: 0.0
};

const STAGE = (function(){
 const R = 520;
 const seed = KRAND.hash(BATTER_PHYS.SEED, SITE.px[0], SITE.px[1], 77);
 const n2 = function(x, z, f, s){ return KRAND.fbm(x * f, 0.5, z * f, 2, seed ^ s) - 0.5; };

 /* Station radial feeder-dike segments [ax, az, bx, bz, halfWidthM, crestLiftM] */
 const DIKES = (function(){
  if (SITE.key === 'cove') {
   return [
    [-68, 92, -135, 290, 6.5, 16.0],  /* West Cove Reef-Jaw */
    [ 78, 86,  152, 290, 6.5, 15.5],  /* East Cove Reef-Jaw */
    [-195, -90, -340, -220, 5.0, 11.0],
    [ 180, -95,  330, -240, 5.2, 10.5]
   ];
  }
  if (SITE.key === 'rampart') {
   return [
    [ 40, -118, -240, -132, 5.8, 12.5],
    [ 55,   12, -230,   18, 6.2, 13.5],
    [ 42,  126, -235,  136, 5.5, 12.0],
    [120,  -45,  340,  -62, 4.8,  9.5]
   ];
  }
  if (SITE.key === 'strait') {
   return [
    [-140, -110,  58, -118, 4.8, 10.0],
    [-150,  118,  52,  126, 5.2, 11.0]
   ];
  }
  /* Station 4: plug — 5 radial feeder-dike & welded-spatter hogback ribs radiating from (0, 0) */
  const out = [];
  const angles = [0.22, 1.42, 2.58, 3.84, 5.12];
  for (let i = 0; i < angles.length; i++) {
   const a = angles[i];
   out.push([Math.cos(a) * 42, Math.sin(a) * 42, Math.cos(a) * 460, Math.sin(a) * 460, 7.2, 16.5]);
  }
  return out;
 })();

 function dikeInfoAt(x, z){
  let bestD = 1e9, lift = 0, rib01 = 0;
  for (let i = 0; i < DIKES.length; i++) {
   const d = DIKES[i];
   const vx = d[2] - d[0], vz = d[3] - d[1];
   const l2 = vx * vx + vz * vz;
   const t = l2 > 1e-6 ? clamp(((x - d[0]) * vx + (z - d[1]) * vz) / l2, 0, 1) : 0;
   const dist = Math.hypot(d[0] + vx * t - x, d[1] + vz * t - z);
   if (dist < bestD) bestD = dist;
   const w = d[4];
   const k = 1 - smooth(w * 0.45, w * 2.5, dist);
   if (k > 0) {
    const endFade = smooth(0.0, 0.08, t) * (1 - smooth(0.90, 1.0, t));
    lift = Math.max(lift, d[5] * k * (0.35 + 0.65 * endFade));
    rib01 = Math.max(rib01, k);
   }
  }
  return { distM: bestD, liftM: lift, rib01: rib01 };
 }

 /* Basal freshwater tuff-contact spring cascade polylines (Station 1 cove) */
 const STREAMS = SITE.key === 'cove' ? [
  {
   name: 'Basal Palagonite Tuff-Contact Spring Cascade',
   w: 3.6,
   depth: 0.36,
   speed: 1.85,
   pts: [
    [56, -148], [52, -132], [47, -116], [42, -100],
    [36,  -84], [30,  -68], [24,  -52], [18,  -36], [12, -20]
   ]
  }
 ] : [];

 function streamDistAt(x, z){
  let best = 1e9;
  for (let s = 0; s < STREAMS.length; s++) {
   const P = STREAMS[s].pts;
   for (let i = 0; i < P.length - 1; i++) {
    const ax = P[i][0], az = P[i][1], bx = P[i + 1][0], bz = P[i + 1][1];
    const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
    const t = l2 > 1e-6 ? clamp(((x - ax) * dx + (z - az) * dz) / l2, 0, 1) : 0;
    const d = Math.hypot(ax + dx * t - x, az + dz * t - z);
    if (d < best) best = d;
   }
  }
  return best;
 }

 /* Bare analytical cinder-cone heightfield before KCARVE / KCOAST / KSTACKS */
 function bareGround(x, z){
  const dk = dikeInfoAt(x, z);
  const gRill = (0.5 + n2(x, z, 0.014, 0x21)) * (1 - dk.rib01 * 0.85);
  const macro = n2(x, z, 0.0024, 0x11) * 14.0 + n2(x, z, 0.0065, 0x12) * 4.5;

  if (SITE.key === 'cove') {
   /* Crescentic breached crater rim opening SE (+z, slight +x) around drowned cove bowl at (0, 36) */
   const cx = 0, cz = 36;
   const rCove = Math.hypot((x - cx) * 0.92, (z - cz) * 0.88);
   const breachAng = Math.atan2(x - cx, z - cz); /* 0 = straight +Z (south) */
   const inThroat = (z > 40) ? (1 - smooth(28, 76, Math.abs(x - (z - 40) * 0.06))) : 0;
   let h = -22.5 + 148.0 * smooth(72, 335, rCove);
   /* Lower breached SE throat between the twin feeder-dike jaws */
   h = mix(h, -15.5 - 6.0 * smooth(90, 260, z), inThroat * smooth(45, 130, rCove));
   /* Flatten the +115 m Bare-Stone Port rim reserve bench in NE & +124 m Seamount beacon crag in NW */
   const dPort = Math.hypot(x - 245, z + 195);
   h = mix(h, 115.5 + n2(x, z, 0.008, 0x31) * 1.6, 1 - smooth(68, 128, dPort));
   const dBeac = Math.hypot(x + 255, z + 165);
   h = mix(h, 124.5 + n2(x, z, 0.01, 0x32) * 1.4, 1 - smooth(22, 54, dBeac));
   /* Incise spring grotto notch cleanly above shoreline */
   const sd = streamDistAt(x, z);
   const gCut = (1 - smooth(3.0, 14.0, sd)) * smooth(1.5, 12.0, h) * 2.6;
   /* Radial rain-gullies above +22 m */
   const gul = smooth(20, 52, h) * gRill * 4.2 * (1 - (1 - smooth(65, 120, dPort)));
   void breachAng;
   return h + macro * 0.55 + dk.liftM - gCut - gul;
  }

  if (SITE.key === 'rampart') {
   /* WNW oceanward tsunami-planed scoria/basalt bench (+6..+48 m) & sharp +56 m megatsunami trimline */
   const shoreX = -58 + n2(0, z, 0.004, 0x41) * 26;
   const u = x - shoreX;
   let h;
   if (u < 0) {
    h = -56.0 * smooth(0, -240, u) - 1.5 * smooth(0, -14, u);
   } else if (u < 205) {
    /* Stepped tsunami abrasion benches between +6 m and +48 m */
    const t = u / 205;
    const raw = 5.5 + 43.5 * t;
    const step = Math.floor(t * 4) / 4;
    h = mix(raw, 7.0 + step * 40.0, 0.46) + n2(x, z, 0.018, 0x42) * 1.4;
   } else {
    /* Steep tsunami trimline scarp (+49 -> +62 m) then gullied red-black cinder cone flank to +156 m */
    const u2 = u - 205;
    h = 49.0 + 13.5 * smooth(0, 22, u2) + 92.0 * smooth(18, 340, u2);
    h -= gRill * 5.8 * smooth(58, 82, h);
   }
   return h + macro * 0.42 + dk.liftM;
  }

  if (SITE.key === 'strait') {
   /* Leeward ESE coastline: tilted coal=201 collar cliffs & pocket coves on west (x < 24), -18 m tidal sound on east */
   const coveWave = Math.sin(z * 0.019) * 34 + n2(x, z, 0.005, 0x51) * 24;
   const u = (22 + coveWave) - x; /* positive inland (west), negative into eastern strait */
   let h;
   if (u < 0) {
    h = -18.5 * smooth(0, -210, u) - 1.4 * smooth(0, -16, u);
   } else {
    /* Sea-cliff to +22.5 m, then gentle +22.5..+34.5 m leeward tsunami-shadow woodland bench before inner collar slope */
    h = 2.5 + 20.0 * smooth(0, 42, u) + 12.0 * smooth(42, 285, u) + 68.0 * smooth(265, 520, u);
    h -= gRill * 3.2 * smooth(36, 64, h);
   }
   return h + macro * 0.48 + dk.liftM;
  }

  /* Station 4: plug — gullied cinder bowl rising to +248.8 m local (+868.8 m ASL) exhumed volcanic neck */
  const r = Math.hypot(x, z);
  const neckLift = 112.0 * (1 - smooth(28, 138, r)) + 48.0 * (1 - smooth(120, 295, r));
  const bowl = 54.0 + 36.0 * smooth(140, 440, r) + neckLift;
  const gully = gRill * 6.4 * smooth(65, 220, r);
  return bowl + macro * 0.65 + dk.liftM - gully;
 }

 /* Station 3 KCOAST natural shingle/rock/cliff pocket coves on the leeward Shroudhills strait */
 const COAST_OBJ = (function(){
  if (SITE.key !== 'strait' || typeof KCOAST === 'undefined' || typeof KMASK === 'undefined') return null;
  const x0 = -640, z0 = -640, cell = 32, nx = 40, nz = 40;
  const data = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) {
   for (let i = 0; i < nx; i++) {
    const cx = x0 + (i + 0.5) * cell, cz = z0 + (j + 0.5) * cell;
    data[j * nx + i] = bareGround(cx, cz) < 0 ? 255 : 0;
   }
  }
  return KCOAST.build({
   id: 'battered-strait',
   level: 0,
   seed: seed ^ 0x5151,
   salt: 19,
   sourceCell: 32,
   opts: {
    sig: 24,
    classSig: 96,
    warp: { a0: 0, l0: 16000, a1: 36, l1: 360, a2: 18, l2: 140, a3: 8, l3: 55, k: [0.6, 0.85, 1.15, 1.1, 0.5] },
    fine: { a1: 10, l1: 85, a2: 4, l2: 28, k: [0.12, 0.5, 1.0, 1.0, 0.15] },
    carry: { full: 24, out: 96, edge: 64, rim: 24 },
    band: { land: 180, water: 140, lift: 140, mask: 48 }
   },
   frame: { ox: SITE.px[0] * 2000, oz: SITE.px[1] * 2000 },
   mask: { x0: x0, z0: z0, cell: cell, cellZ: cell, nx: nx, nz: nz, data: data },
   sample: {
    bare: bareGround,
    rock: function(x, z){ return clamp(0.18 + 0.35 * dikeInfoAt(x, z).rib01, 0, 1); },
    wet: function(){ return 0.78; },
    temp: function(){ return 27; }
   }
  });
 })();

 function coastGround(x, z){
  const h = bareGround(x, z);
  return COAST_OBJ ? KCOAST.shape(COAST_OBJ, x, z, h, 0) : h;
 }

 /* KCARVE yellow-tan palagonite sea-arches & coastal rookery undercuts (Stations 1 & 3, sited via KCARVE.site at +18 m cliff foot) */
 if (typeof KCARVE !== 'undefined') {
  KCARVE.clear();
  if (SITE.key === 'cove') {
   const sw = KCARVE.site({ base: bareGround, from: [-60, 36], to: [-240, 36], r: 16, face: 18, floorAt: function(){ return 0.5; } });
   const se = KCARVE.site({ base: bareGround, from: [ 60, 36], to: [ 240, 36], r: 16, face: 18, floorAt: function(){ return 0.5; } });
   KCARVE.add({
    id: 'cove-arch-west',
    name: 'West Palagonite Sea-Arch',
    kind: 'alcove',
    c: sw ? [sw.x, sw.z] : [-172, 36],
    n: [1.0, 0.0],
    hw: 11.5,
    depth: 16.0,
    h: 11.0,
    floorY: 0.5,
    base: bareGround,
    margin: 7.0,
    pad: 2.6,
    cell: 0.9,
    mouth: 3.0
   });
   KCARVE.add({
    id: 'cove-arch-east',
    name: 'East Palagonite Tuff Undercut Arch',
    kind: 'alcove',
    c: se ? [se.x, se.z] : [172, 36],
    n: [-1.0, 0.0],
    hw: 10.0,
    depth: 14.5,
    h: 9.8,
    floorY: 0.5,
    base: bareGround,
    margin: 7.0,
    pad: 2.6,
    cell: 0.9,
    mouth: 2.8
   });
  } else if (SITE.key === 'strait') {
   const ss = KCARVE.site({ base: coastGround, from: [60, 118], to: [-220, 118], r: 15, face: 18, floorAt: function(){ return 0.6; } });
   KCARVE.add({
    id: 'strait-arch-south',
    name: 'Rookery Palagonite Sea-Arch',
    kind: 'alcove',
    c: ss ? [ss.x, ss.z] : [-38, 118],
    n: [1.0, 0.0],
    hw: 11.0,
    depth: 15.0,
    h: 10.5,
    floorY: 0.6,
    base: coastGround,
    margin: 7.0,
    pad: 2.6,
    cell: 0.9,
    mouth: 2.8
   });
  }
 }

 /* KSTACKS: Offshore radial feeder-dike sea-stacks (Station 2) & Exhumed +868.8 m Columnar Basalt Neck (Station 4) */
 const STACKS = (function(){
  if (typeof KSTACKS === 'undefined') return [];
  if (SITE.key === 'rampart') {
   const specs = [
    { id: 'dike-stack-1', x: -195, z: -125, H: 46, r: 12.5, e: 4.2, ry: 0.06, seed: 8101 },
    { id: 'dike-stack-2', x: -168, z:  -68, H: 38, r: 11.0, e: 3.8, ry: -0.05, seed: 8102 },
    { id: 'dike-stack-3', x: -148, z:   38, H: 52, r: 13.5, e: 4.5, ry: 0.04, seed: 8103 },
    { id: 'dike-stack-4', x: -182, z:  145, H: 31, r: 10.5, e: 3.6, ry: -0.08, seed: 8104 }
   ];
   return specs.map(function(s){
    const y0 = Math.min(-4.0, bareGround(s.x, s.z) - 1.5);
    return KSTACKS.make({
     id: s.id,
     kind: 'fin',
     x: s.x,
     z: s.z,
     y0: y0,
     H: s.H - y0,
     r: s.r,
     e: s.e,
     ry: s.ry,
     taper: 0.28,
     crown: 0.78,
     seed: s.seed
    });
   });
  }
  if (SITE.key === 'plug') {
   /* Central exhumed +868.8 m columnar olivine-basalt volcanic neck (+248.8 m local + 620 m offset = +868.8 m ASL) */
   const footY = Math.min(bareGround(58, 0), bareGround(-58, 0), bareGround(0, 58), bareGround(0, -58)) - 10.0;
   const targetTop = 248.8;
   return [
    KSTACKS.make({
     id: 'olivine-plug-neck',
     kind: 'butte',
     x: 0,
     z: 0,
     y0: footY,
     tiers: [
      { h: (targetTop - footY) * 0.62, r: 52, e: 1.22, ry: 0.42, dx: 0, dz: 0 },
      { h: (targetTop - footY) * 0.38, r: 34, e: 1.15, ry: 0.42, dx: 2, dz: -3 }
     ],
     bed: [8.0, 16.0],
     lobes: 0.14,
     weather: 0.42,
     seed: 8401
    })
   ];
  }
  return [];
 })();

 function shapedGround(x, z){
  let h = bareGround(x, z);
  if (COAST_OBJ) {
   h = KCOAST.shape(COAST_OBJ, x, z, h, 0);
  }
  if (typeof KCARVE !== 'undefined' && KCARVE.patches && KCARVE.patches.length) {
   h = KCARVE.fold(h, x, z, { steep: 2.2 });
  }
  if (STACKS.length && typeof KSTACKS !== 'undefined') {
   const st = KSTACKS.surface(STACKS, x, z, 0, { drawn: true });
   if (st && st.wall > h) h = st.wall;
  }
  return h;
 }

 /* KCAVERN: Palagonite Boat-Cave Vault (Station 1 cove) & Wave-Compressed Blowhole Sea-Caves (Station 2 rampart) */
 const CAVERN = (function(){
  if (typeof KCAVERN === 'undefined') return null;
  if (SITE.key === 'cove') {
   const C = KCAVERN.create({ ground: shapedGround, cell: 1.0, chunk: 16, seed: seed ^ 0x6301 });
   C.tube({
    id: 'cove-palagonite-vault',
    owner: 'batteredisle',
    pts: [[-24, 0.5, -138], [-32, 0.8, -162], [-42, 1.4, -186]],
    w: 9.2,
    h: 7.4,
    rock: 'tuff',
    finish: 'raw'
   });
   C.opening({ id: 'cove-vault-mouth', c: [-24, -138], y: 0.5, r: 6.2, h: 7.8, kind: 'door' });
   return C.build();
  }
  if (SITE.key === 'rampart' && SITE.blowholes) {
   const C = KCAVERN.create({ ground: shapedGround, cell: 1.0, chunk: 16, seed: seed ^ 0x6302 });
   for (let i = 0; i < SITE.blowholes.length; i++) {
    const bh = SITE.blowholes[i];
    const topY = shapedGround(bh.x, bh.z);
    /* Horizontal wave-compression sea-cave bore + vertical blowhole chimney orifice */
    C.tube({
     id: bh.id + '-cave',
     owner: 'batteredisle',
     pts: [[bh.x - 24, -1.5, bh.z], [bh.x, -0.4, bh.z]],
     w: 5.4,
     h: 5.0,
     rock: 'basalt',
     finish: 'raw'
    });
    C.shaft({
     id: bh.id + '-chimney',
     owner: 'batteredisle',
     c: [bh.x, bh.z],
     y0: -0.4,
     y1: topY + 1.5,
     r0: bh.r + 0.5,
     r1: bh.r
    });
    C.opening({ id: bh.id + '-sea-inlet', c: [bh.x - 24, bh.z], y: -1.5, r: 3.6, h: 5.2, kind: 'door' });
    C.opening({ id: bh.id + '-vent-well', c: [bh.x, bh.z], r: bh.r, rim: 2.2, kind: 'well' });
   }
   return C.build();
  }
  return null;
 })();

 /* Evaluated active blowhole physics records on Station 2 (rampart) */
 const BLOWHOLE_RECS = (SITE.blowholes || []).map(function(bh){
  const y = shapedGround(bh.x, bh.z);
  const phys = BATTER_PHYS.blowholeAt({
   dikeRib01: 0.88,
   palagonite01: 0.65,
   elevM: clamp(y, 5.5, 24.0),
   coastDistM: 22.0,
   waveEnergy: 1.15,
   swellPhase: 0.25,
   exposedWNW: true,
   drawdownM: 0
  });
  return Object.assign({}, bh, { y: y, phys: phys });
 });

 /* KHAZ data-driven hazard volumes (blowholes, WNW tsunami bench, submerged radial-dike reefs; instantiated in 86-host-works.js after 52-core-tags-vocab.js) */
 const HAZARDS = (function(){
  const list = [];
  for (let i = 0; i < BLOWHOLE_RECS.length; i++) {
   const b = BLOWHOLE_RECS[i];
   list.push({
    id: 'haz:' + b.id,
    kind: 'batteredisle:blowhole',
    name: 'Wave-Compressed Blowhole Orifice (' + b.phys.boomHz + ' Hz)',
    x: b.x, y: b.y, z: b.z, r: 6.5, h: b.phys.jetHeightM,
    hazSpec: { kind: 'crush', effect: 'damage', danger: 0.72, cycle: { period: 11.0, warn: 1.0, ramp: 0.5, on: 2.2, after: 1.0 } }
   });
  }
  if (SITE.key === 'rampart') {
   list.push({
    id: 'haz:wnw-tsunami-bench',
    kind: 'batteredisle:tsunamibench',
    name: 'WNW < +56 m Megatsunami Over-Wash Bench',
    x: 20, y: 24, z: 0, r: 180, h: 56,
    hazSpec: { kind: 'drown', danger: 0.85 }
   });
  }
  if (SITE.seaLevel != null) {
   const d0 = DIKES[0];
   list.push({
    id: 'haz:radial-dike-reef',
    kind: 'batteredisle:dikereef',
    name: 'Submerged Radial Feeder-Dike Hull-Ripper Reef',
    x: d0[2] * 0.7, y: -2.0, z: d0[3] * 0.7, r: 38, h: 8,
    hazSpec: { kind: 'crush', danger: 0.65, role: 'dike-reef' }
   });
  }
  return list;
 })();

 const sea = SITE.seaLevel == null ? null : {
  level: SITE.seaLevel,
  swell: SITE.exposedWNW ? [[0.62, 68, 12, 0, 0.14], [0.28, 34, -18, 1.2, 0.10]]
                         : [[0.14, 38, 25, 0, 0.05], [0.08, 19, -30, 0.8, 0.04]],
  seeds: SITE.key === 'cove' ? [[0, 48], [20, 180]] : (SITE.key === 'rampart' ? [[-180, 0]] : [[160, 0]])
 };

 function coastDist(x, z){
  if (COAST_OBJ) {
   const o = {};
   KCOAST.at(COAST_OBJ, x, z, 0, o);
   return o.c;
  }
  const h = shapedGround(x, z);
  return h * 3.8;
 }

 const fields = {
  elevASL: function(x, z){ return SITE.elevOffset + shapedGround(x, z); },
  dike: function(x, z){ return dikeInfoAt(x, z).rib01; },
  scoria: function(x, z){
   const asl = SITE.elevOffset + shapedGround(x, z);
   const cc = BATTER_PHYS.cinderConeAt({
    px: SITE.px[0], py: SITE.px[1], localX: x, localZ: z, elevM: asl,
    azDeg: SITE.azFromPlugDeg, forceLithology: SITE.lithology
   });
   return clamp(cc.scoriaDepthM / 3.2, 0, 1);
  },
  palagonite: function(x, z){
   const asl = SITE.elevOffset + shapedGround(x, z);
   return BATTER_PHYS.cinderConeAt({
    px: SITE.px[0], py: SITE.px[1], localX: x, localZ: z, elevM: asl,
    azDeg: SITE.azFromPlugDeg, forceLithology: SITE.lithology
   }).palagonite01;
  },
  shingle: function(x, z){
   if (SITE.seaLevel == null) return 0;
   const h = shapedGround(x, z);
   if (COAST_OBJ) {
    const cf = {};
    KCOAST.fields(COAST_OBJ, x, z, cf);
    return clamp((cf['coast:shingle'] || 0) + (cf['coast:sand'] || 0) * 0.7 + smooth(9, 1, Math.abs(h)) * 0.45, 0, 1);
   }
   return clamp(smooth(14, 1.5, Math.abs(h)) * (1 - dikeInfoAt(x, z).rib01 * 0.6), 0, 1);
  },
  coal: function(x, z){
   if (!SITE.hasCollarOutcrop) return 0;
   const h = shapedGround(x, z);
   const sec = SITE.key === 'strait' ? smooth(-120, 40, -x) : smooth(70, 145, x) * smooth(-10, 45, z);
   return clamp(sec * smooth(0.5, 6.0, h) * (1 - smooth(42, 78, h)), 0, 1);
  },
  garnierite: function(x, z){
   if (SITE.lithology !== 'ultramafic') return 0;
   const dk = dikeInfoAt(x, z);
   const seam = smooth(16, 4, Math.abs(dk.distM - 12.0));
   return clamp(seam * (SITE.key === 'plug' ? 0.92 : 0.48), 0, 1);
  },
  spring: function(x, z){
   const sd = streamDistAt(x, z);
   const h = shapedGround(x, z);
   const sp = BATTER_PHYS.springLineAt({
    elevM: SITE.elevOffset + h,
    scoriaDepthM: 2.4,
    palagonite01: 0.75,
    upslopeCatchKm2: 2.2
   });
   if (STREAMS.length && sd < 18) return clamp(smooth(18, 2.5, sd), 0, 1);
   return SITE.key === 'plug' ? 0 : sp.fernPocket01 * 0.35;
  }
 };

 return {
  key: SITE.key,
  site: SITE,
  name: SITE.title,
  R: R,
  seed: seed,
  elevOffset: SITE.elevOffset,
  trimElevM: SITE.trimElevM,
  lithology: SITE.lithology,
  exposedWNW: SITE.exposedWNW,
  wind: SITE.wind,
  air: { pressure: SITE.pAtm, tempC: SITE.tempC },
  ground: shapedGround,
  bareGround: bareGround,
  dikeInfoAt: dikeInfoAt,
  dikes: DIKES,
  stacks: STACKS,
  cavern: CAVERN,
  coastObj: COAST_OBJ,
  coastD: coastDist,
  sea: sea,
  streams: STREAMS,
  streamDistAt: streamDistAt,
  blowholes: BLOWHOLE_RECS,
  hazards: HAZARDS,
  reserves: SITE.reserves || [],
  works: SITE.works || [],
  fields: fields,
  spine: [[-R, 0], [0, 0], [R, 0]],
  exportBox: [-320, -320, 320, 320],
  viewList: (typeof STATION_VIEWLIST !== 'undefined' && STATION_VIEWLIST.viewList) || []
 };
})();
_mark('stage');
