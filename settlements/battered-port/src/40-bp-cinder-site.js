// ================================================================= BATTERED PORT — worn parasitic cinder-cone site, Kettle lagoon, sea-cave & WMICRO v2 [G data]
// Surveyed site model for Bè-tõ-pò (Bare-Stone Port) at (435, 259), +115 m canonical crater-rim bench on Battered Isle:
//   - Upper Horseshoe Crater-Rim Bench (D1..D5, +86.5..+138.0 m): anchored on Bare-Stone Head (+138 m columnar basalt neck, D1),
//     strictly above the +85.0 m tsunami safety floor.
//   - Flooded Breached-Crater Lagoon ("The Kettle" / Kò-pò, -28.0 m deep, 820 m diameter around (0, 90)), shielded by twin
//     38 m radial basaltic feeder-dike jaws (110 m throat) and ringed on its north cliff-foot by D6 (+3.5..+18.5 m quay).
//   - Subterranean Palagonite Sea-Cave Vault (Da-wò-hò, D7, 140 x 55 m, +18 m crown) & 640 m Western Bolt-Hole Sea-Tunnel.
//   - WMICRO version: 2 (core/world/43m-world-micro.js) smoothly attenuated across KCITY town bands (zero town-edge shelf step).
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const BP_SITE = (function(){
 const clamp = function(v, a, b){ return v < a ? a : v > b ? b : v; };
 const mix = function(a, b, t){ return a + (b - a) * t; };
 const smooth = function(a, b, v){
  let t = (v - a) / (b - a);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
 };

 const SEED = 435259;
 const PIN_PX = [435, 259];
 const WORLD_OX = PIN_PX[0] * 2000;
 const WORLD_OZ = PIN_PX[1] * 2000;
 const KETTLE = { x: 0, z: 90, radiusM: 410, depthM: -28.0, jawWidthM: 110.0 };
 const PLUG = { x: -225, z: -445, rCore: 88, rSkirt: 195, summitM: 138.0 };
 const TSUNAMI_FLOOR_M = 85.0;

 /* Initialize WRELIEF & WMICRO v2 in world-absolute coordinates */
 if (typeof WRELIEF !== 'undefined' && WRELIEF.init) {
  WRELIEF.init({ ox: WORLD_OX, oz: WORLD_OZ, seed: SEED });
 }
 if (typeof WMICRO !== 'undefined' && WMICRO.init) {
  WMICRO.init({ ox: WORLD_OX, oz: WORLD_OZ, seed: SEED, version: 2 });
 }
 const MICRO_STYLE = { hill: 8.5, gully: 0.52, rough: 0.75 };

 /* Seven districts across the two vertical tiers */
 const DISTRICTS = [
  {
   id: 'D1', key: 'plug_citadel', name: 'Bare-Stone Head (Bè-tõ-hè)', tier: 'rim', role: 'civic',
   elevBand: [122, 138], strategy: 'frontage-courts', pop: 320, households: 65,
   poly: [[-340, -520], [-140, -560], [-80, -390], [-220, -330], [-360, -390]]
  },
  {
   id: 'D2', key: 'factor_rim', name: 'Nine-Hull Terrace', tier: 'rim', role: 'rich',
   elevBand: [108, 124], strategy: 'frontage-courts', pop: 780, households: 155,
   poly: [[-90, -520], [260, -500], [310, -330], [-70, -335]]
  },
  {
   id: 'D3', key: 'crucible_terrace', name: 'Coke and Nickel-Forge Ward', tier: 'rim', role: 'ind',
   elevBand: [96, 116], strategy: 'alleys', pop: 860, households: 175,
   poly: [[275, -470], [560, -360], [585, -70], [385, -80], [320, -320]]
  },
  {
   id: 'D4', key: 'creole_steps', name: 'Wash-Face and Riggers Steps', tier: 'rim', role: 'res',
   elevBand: [88, 112], strategy: 'alleys', pop: 1840, households: 375,
   poly: [[-580, -360], [-365, -385], [-345, -40], [-560, 40], [-640, -170]]
  },
  {
   id: 'D5', key: 'spring_gardens', name: 'Tuff-Spring and Wrack Terraces', tier: 'rim', role: 'farm',
   elevBand: [85, 105], strategy: 'fields', pop: 680, households: 140,
   poly: [[-320, -760], [320, -760], [380, -530], [-340, -565]]
  },
  {
   id: 'D6', key: 'kettle_harbor', name: 'The Kettle and Cliff-Hoist Quays (Kò-pò)', tier: 'cove', role: 'harbor',
   elevBand: [2, 32], strategy: 'harbor', pop: 340, households: 75,
   poly: [[-265, -185], [265, -185], [295, -98], [-285, -98]]
  },
  {
   id: 'D7', key: 'dark_water_vault', name: 'Dark-Water Palagonite Sea-Cave Vault (Da-wò-hò)', tier: 'cave', role: 'vault',
   elevBand: [2, 24], strategy: 'cavern-lots', pop: 180, households: 35,
   poly: [[-355, -75], [-215, -75], [-215, 65], [-355, 65]]
  }
 ];

 /* Point-in-polygon and distance-to-polygon helpers */
 function inPoly(x, z, P){
  let inside = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
   const xi = P[i][0], zi = P[i][1], xj = P[j][0], zj = P[j][1];
   if (((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi + 1e-12) + xi)) inside = !inside;
  }
  return inside;
 }

 function polyDist(x, z, P){
  if (inPoly(x, z, P)) return 0;
  let best = 1e9;
  for (let i = 0; i < P.length; i++) {
   const a = P[i], b = P[(i + 1) % P.length];
   const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
   const t = l2 > 1e-6 ? clamp(((x - a[0]) * dx + (z - a[1]) * dz) / l2, 0, 1) : 0;
   const d = Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z);
   if (d < best) best = d;
  }
  return best;
 }

 function districtAt(x, z){
  for (let i = 0; i < DISTRICTS.length; i++) {
   if (inPoly(x, z, DISTRICTS[i].poly)) return DISTRICTS[i];
  }
  return null;
 }

 /* Distance outside the settled town polygons (D1..D6); 0 inside any ward, smooth 0..1 ramp over 72 m outside */
 function townDist(x, z){
  let dMin = 1e9;
  for (let i = 0; i < 6; i++) {
   const d = polyDist(x, z, DISTRICTS[i].poly);
   if (d < dMin) dMin = d;
   if (dMin === 0) return 0;
  }
  return dMin;
 }

 function townBandMask(x, z){
  const d = townDist(x, z);
  return smooth(8.0, 145.0, d);
 }

 /* Exhumed radial basaltic feeder-dike harbor jaws (110 m throat between x = -55 and x = +55 at z = 395) */
 const DIKES = [
  { id: 'west_jaw', ax: -295, az: 245, bx: -58, bz: 395, hw: 11.5, crestM: 38.0 },
  { id: 'east_jaw', ax:  295, az: 245, bx:  58, bz: 395, hw: 11.5, crestM: 38.0 },
  { id: 'west_bolthole_screen', ax: -865, az: -35, bx: -985, bz: 115, hw: 9.5, crestM: 29.0 },
  { id: 'ne_hogback', ax: 520, az: -380, bx: 840, bz: -540, hw: 8.5, crestM: 22.0 }
 ];

 function dikeLiftAt(x, z){
  let lift = 0, rib01 = 0;
  for (let i = 0; i < DIKES.length; i++) {
   const D = DIKES[i];
   const dx = D.bx - D.ax, dz = D.bz - D.az, l2 = dx * dx + dz * dz;
   const t = l2 > 1e-6 ? clamp(((x - D.ax) * dx + (z - D.az) * dz) / l2, 0, 1) : 0;
   const dist = Math.hypot(D.ax + dx * t - x, D.az + dz * t - z);
   const k = 1 - smooth(D.hw * 0.45, D.hw * 2.6, dist);
   if (k > 0) {
    const endFade = smooth(0.0, 0.08, t) * (1 - smooth(0.92, 1.0, t));
    const h = D.crestM * k * (0.45 + 0.55 * endFade);
    if (h > lift) lift = h;
    if (k > rib01) rib01 = k;
   }
  }
  return { liftM: lift, rib01: rib01 };
 }

 /* Four counterweighted 90-second twin-chain cliff-lifts (D6 +2 m Kettle cradle -> D2 +88..+110 m rim winch) */
 const HOISTS = [
  { id: 'hoist_1', name: 'Hoist 1 (South-Run Lugger Cradle)',    x: -165, zFoot: -142, zHead: -328, footY: 2.2, headY: 110.5, yaw: 0 },
  { id: 'hoist_2', name: 'Hoist 2 (Mist-Run Galley Store Lift)', x:  -52, zFoot: -148, zHead: -330, footY: 2.2, headY: 112.0, yaw: 0 },
  { id: 'hoist_3', name: 'Hoist 3 (Whale-Run Silk Vault Lift)',  x:   68, zFoot: -148, zHead: -328, footY: 2.2, headY: 111.0, yaw: 0 },
  { id: 'hoist_4', name: 'Hoist 4 (Reed-Run Skiff Cradle)',      x:  182, zFoot: -140, zHead: -324, footY: 2.2, headY: 109.0, yaw: 0 }
 ];

 /* Subterranean Dark-Water Palagonite Sea-Cave Vault (Da-wò-hò) & 640 m Western Bolt-Hole Sea-Tunnel */
 const SEA_CAVE = {
  id: 'da_wo_ho',
  name: 'Dark-Water Vault (Da-wò-hò)',
  cx: -285,
  cz: -5,
  rx: 70,
  rz: 28,
  floorY: -6.5,
  crownY: 18.0,
  galleryY: 5.2,
  mouth: { x: -212, z: -5, w: 22, crownY: 14.5 }
 };

 const BOLT_HOLE = {
  id: 'western_bolt_hole',
  name: 'Western Bolt-Hole Smuggler Sea-Tunnel (640 m)',
  lengthM: 640.0,
  widthM: 11.0,
  floorY: -5.2,
  crownY: 9.5,
  pts: [
   [-285, -5], [-410, 6], [-545, 18], [-680, 28], [-810, 38], [-924, 46]
  ]
 };

 /* Four perennial +92..+98 m basal palagonite tuff-contact springs & stepped rills (all terminate in cisterns > +4 m!) */
 const SPRINGS = [
  {
   id: 'spring_citadel', name: 'Bare-Stone Contact Spring', lps: 24.0,
   pts: [[-205, -545], [-192, -495], [-176, -445], [-162, -395]],
   cistern: { id: 'cistern_d2_west', x: -162, z: -392, r: 6.5 }
  },
  {
   id: 'spring_gardens_w', name: 'West Wrack-Terrace Spring', lps: 22.0,
   pts: [[-130, -720], [-122, -660], [-112, -600], [-104, -550]],
   cistern: { id: 'cistern_d5_west', x: -104, z: -546, r: 7.2 }
  },
  {
   id: 'spring_gardens_e', name: 'East Tuff-Contact Spring', lps: 21.0,
   pts: [[148, -715], [156, -655], [164, -595], [172, -542]],
   cistern: { id: 'cistern_d5_east', x: 172, z: -538, r: 7.0 }
  },
  {
   id: 'spring_creole', name: 'Wash-Face Stepped Rill', lps: 18.0,
   pts: [[-455, -355], [-462, -285], [-468, -215], [-472, -145]],
   cistern: { id: 'cistern_d4_steps', x: -472, z: -140, r: 6.2 }
  }
 ];

 /* Macro smooth cinder-cone + Kettle lagoon + Rim bench + Citadel plug form (prior to WMICRO v2) */
 function macroGround(x, z){
  const n1 = KRAND.fbm((x + WORLD_OX) * 0.0014, 0.5, (z + WORLD_OZ) * 0.0014, 2, SEED ^ 0x101) - 0.5;
  const n2 = KRAND.fbm((x + WORLD_OX) * 0.0042, 0.5, (z + WORLD_OZ) * 0.0042, 2, SEED ^ 0x202) - 0.5;

  /* Distance from Kettle lagoon center (0, 90) */
  const dxK = x - KETTLE.x, dzK = z - KETTLE.z;
  const rK = Math.hypot(dxK, dzK);

  /* Outer island falloff: worn cinder-cone shoulder sloping down into the SSE sound (+z > 420) and WSW sea (x < -820) */
  const southSea = smooth(310, 820, z);
  const westSea = smooth(-690, -980, x);
  const eastFlank = smooth(640, 1180, x);
  const northCone = smooth(-790, -1450, z);

  /* Base crescentic crater-rim plateau (+104..+118 m around the north/west/east arc of the Kettle) */
  let rimH = 112.0 + n1 * 8.0 + n2 * 2.6;
  /* Gentle bowl-ward slope from +118 m inner crest to +94 m outer garden terraces */
  rimH -= 15.5 * smooth(480, 860, rK);
  /* Rise gently toward main Battered Isle cone shoulder to the NNE, drop to sea on S, WSW, ESE */
  rimH += 18.0 * northCone * (1 - westSea);
  rimH = mix(rimH, -24.0, Math.max(southSea, westSea * 0.96, eastFlank * 0.72));

  /* Guarantee all upper rim districts D1..D5 sit cleanly on tsunami-safe benches >= +88.5 m with wide gentle transition */
  const dD1 = polyDist(x, z, DISTRICTS[0].poly);
  const dD2 = polyDist(x, z, DISTRICTS[1].poly);
  const dD3 = polyDist(x, z, DISTRICTS[2].poly);
  const dD4 = polyDist(x, z, DISTRICTS[3].poly);
  const dD5 = polyDist(x, z, DISTRICTS[4].poly);
  const dRimMin = Math.min(dD1, dD2, dD3, dD4, dD5);
  const rimPad = 1 - smooth(0, 165, dRimMin);
  if (rimPad > 0) {
   const targetBench = dD1 < 25 ? 132.0 : dD2 < 25 ? 115.0 : dD3 < 25 ? 105.0 : dD4 < 25 ? 98.5 : 95.5;
   const gentle = targetBench + n1 * 3.0 + n2 * 0.9;
   rimH = mix(rimH, Math.max(88.5, gentle), rimPad * 0.85);
  }

  /* Exhumed columnar olivine-basalt Citadel plug (D1 Bare-Stone Head: +128..+138 m crowning the NW rim shoulder) */
  const dPlug = Math.hypot(x - PLUG.x, z - PLUG.z);
  const plugK = 1 - smooth(PLUG.rCore * 0.55, PLUG.rSkirt, dPlug);
  if (plugK > 0) {
   const plugTop = PLUG.summitM - 5.5 * smooth(0, PLUG.rCore, dPlug) + n2 * 1.1;
   rimH = mix(rimH, Math.max(rimH, plugTop), plugK);
  }

  /* Carve the breached-crater Kettle bowl (-28.0 m deep) and D6 north cliff-foot quay (+4.2..+14.5 m) */
  let h = rimH;
  /* Inner crater wall drops sharply from rK = 425 m (+110 m) down to rK = 285 m (+6 m) and rK < 210 m (-28 m) */
  const inCraterWall = 1 - smooth(245, 425, rK);
  if (inCraterWall > 0) {
   let kettleBed = -28.0 + 32.0 * smooth(165, 275, rK);
   /* D6 Kettle Harbor quay bench along the north arc (z in [-205, -92], x in [-295, +295]) */
   const dD6 = polyDist(x, z, DISTRICTS[5].poly);
   const quayK = 1 - smooth(0, 32, dD6);
   if (quayK > 0) {
    const qElev = 4.6 + 6.5 * smooth(-102, -182, z) + n2 * 0.45;
    kettleBed = mix(kettleBed, qElev, quayK);
   }
   h = mix(h, kettleBed, inCraterWall);
  }

  /* Breached SSE harbor throat (110 m wide between x = -55 and x = +55, z = 180..620) */
  if (z > 120) {
   const throatHalf = 54.0 + 38.0 * smooth(410, 620, z);
   const inThroat = (1 - smooth(throatHalf * 0.62, throatHalf * 1.25, Math.abs(x))) * smooth(120, 235, z);
   if (inThroat > 0) {
    const channelBed = -19.5 - 5.5 * smooth(240, 560, z);
    h = mix(h, Math.min(h, channelBed), inThroat);
   }
  }

  /* Exhumed radial basaltic feeder-dike harbor jaws & western bolt-hole sea-stack screen */
  const dk = dikeLiftAt(x, z);
  if (dk.liftM > 0) {
   h = Math.max(h, -4.0 + dk.liftM);
  }

  /* Slight rock-cut slots along the 4 cliff-hoists */
  for (let i = 0; i < HOISTS.length; i++) {
   const H = HOISTS[i];
   if (z >= H.zHead - 8 && z <= H.zFoot + 8) {
    const dx = Math.abs(x - H.x);
    const slotK = 1 - smooth(3.6, 8.5, dx);
    if (slotK > 0) {
     const t = clamp((z - H.zHead) / (H.zFoot - H.zHead), 0, 1);
     const rampY = mix(H.headY, H.footY, t);
     h = mix(h, Math.min(h, rampY + 1.5), slotK * 0.55);
    }
   }
  }

  return h;
 }

 /* Full terrain elevation with WMICRO v2 micro-relief smoothly masked outside KCITY town bands (zero town-edge step) */
 function bareGround(x, z){
  const h0 = macroGround(x, z);
  const wMask = townBandMask(x, z) * smooth(4.0, 22.0, h0);
  if (wMask <= 1e-4 || typeof WMICRO === 'undefined' || !WMICRO.erode) return h0;

  const eps = 6.0;
  const gx = (macroGround(x + eps, z) - macroGround(x - eps, z)) / (2 * eps);
  const gz = (macroGround(x, z + eps) - macroGround(x, z - eps)) / (2 * eps);
  const G = [gx, gz, 0];
  let hm = h0 + WMICRO.hills(x, z, MICRO_STYLE, 260, 0);
  hm = WMICRO.erode(hm, x, z, gx, gz, MICRO_STYLE, 260, 0, G, 1);
  const sl = Math.hypot(G[0], G[1]);
  hm += WMICRO.grain(x, z, sl, G[0], G[1], MICRO_STYLE, 0);
  return h0 + (hm - h0) * wMask;
 }

 /* Minimum corner elevation of an oriented bounding box (KCITY obb {c:[x,z], u:[ux,uz], hw, hd}) */
 function obbCorners(bo){
  const cx = bo.c[0], cz = bo.c[1], ux = bo.u[0], uz = bo.u[1];
  const vx = -uz, vz = ux;
  const hw = bo.hw, hd = bo.hd;
  return [
   [cx - ux * hw - vx * hd, cz - uz * hw - vz * hd],
   [cx + ux * hw - vx * hd, cz + uz * hw - vz * hd],
   [cx + ux * hw + vx * hd, cz + uz * hw + vz * hd],
   [cx - ux * hw + vx * hd, cz - uz * hw + vz * hd]
  ];
 }

 function minCornerElev(bo){
  const pts = obbCorners(bo);
  let lo = bareGround(bo.c[0], bo.c[1]);
  for (let i = 0; i < pts.length; i++) {
   const y = bareGround(pts[i][0], pts[i][1]);
   if (y < lo) lo = y;
  }
  return lo;
 }

 function maxCornerRelief(bo){
  const pts = obbCorners(bo);
  let lo = bareGround(bo.c[0], bo.c[1]), hi = lo;
  for (let i = 0; i < pts.length; i++) {
   const y = bareGround(pts[i][0], pts[i][1]);
   if (y < lo) lo = y;
   if (y > hi) hi = y;
  }
  return hi - lo;
 }

 /* Check whether (x, z) lies inside the subterranean Dark-Water Sea-Cave or Western Bolt-Hole tunnel */
 function boltHoleDist(x, z){
  const P = BOLT_HOLE.pts;
  let best = 1e9;
  for (let i = 0; i < P.length - 1; i++) {
   const ax = P[i][0], az = P[i][1], bx = P[i + 1][0], bz = P[i + 1][1];
   const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
   const t = l2 > 1e-6 ? clamp(((x - ax) * dx + (z - az) * dz) / l2, 0, 1) : 0;
   const d = Math.hypot(ax + dx * t - x, az + dz * t - z);
   if (d < best) best = d;
  }
  return best;
 }

 function inVaultOrTunnel(x, z){
  const qx = (x - SEA_CAVE.cx) / SEA_CAVE.rx, qz = (z - SEA_CAVE.cz) / SEA_CAVE.rz;
  if (qx * qx + qz * qz <= 1.0) {
   return { kind: 'sea_cave', floorY: SEA_CAVE.floorY, crownY: SEA_CAVE.crownY, headroomM: SEA_CAVE.crownY };
  }
  if (boltHoleDist(x, z) <= BOLT_HOLE.widthM * 0.5) {
   return { kind: 'bolt_hole', floorY: BOLT_HOLE.floorY, crownY: BOLT_HOLE.crownY, headroomM: BOLT_HOLE.crownY };
  }
  return null;
 }

 return {
  SEED: SEED,
  PIN_PX: PIN_PX,
  WORLD_OX: WORLD_OX,
  WORLD_OZ: WORLD_OZ,
  KETTLE: KETTLE,
  PLUG: PLUG,
  TSUNAMI_FLOOR_M: TSUNAMI_FLOOR_M,
  MICRO_STYLE: MICRO_STYLE,
  DISTRICTS: DISTRICTS,
  DIKES: DIKES,
  HOISTS: HOISTS,
  SEA_CAVE: SEA_CAVE,
  BOLT_HOLE: BOLT_HOLE,
  SPRINGS: SPRINGS,
  inPoly: inPoly,
  polyDist: polyDist,
  districtAt: districtAt,
  townDist: townDist,
  townBandMask: townBandMask,
  dikeLiftAt: dikeLiftAt,
  macroGround: macroGround,
  bareGround: bareGround,
  ground: { h: bareGround },
  minCornerElev: minCornerElev,
  maxCornerRelief: maxCornerRelief,
  boltHoleDist: boltHoleDist,
  inVaultOrTunnel: inVaultOrTunnel
 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = BP_SITE;
