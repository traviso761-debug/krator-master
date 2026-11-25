// ================================================================= ARCODIGA — Scale-Model 5.1 Kopa-North Caldera & Gorge-Throat Site [G data]
// Surveyed 1:1 site model at Crookshore North Crater (Kopa-North, px 89, 604 / southern basalt gorge-throat px 88.5, 608):
//   - Circular drowned secondary-ejecta & arch-rift-basalt caldera lagoon (-z north of dam, -95.0 m floor, 0.0 m sea level).
//   - Southern basalt gorge-throat (1,460 m dam chord between West Cliff x = -880 m and East Cliff x = +880 m, +184..+205 m rims).
//   - NW Ocean Breach (x < -780, z < -920, -44 m channel) baffled by Hueru-Kuran whale-jawbone wave-splitters.
//   - Sheltered SE Dam-Lee Tailrace Cove (+z > 280, x = +240..+680, -28 m basin + +5.5..+12 m Farport Junk Coaling Quay).
//   - Strict +65.0 m megatsunami trimline: 100% of permanent dwellings sit on Z4 (+168..+186 m), Z5 (+95..+205 m), Z6 (+145..+190 m),
//     or inside Arcodiga's intact East Stiffening Wing (worldY +81..+227 m).
//   - WRELIEF + WMICRO v2 micro-relief smoothly attenuated across KCITY town bands and Arcodiga ruin scour bed.
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const ADG_SITE = (function(){
 const clamp = function(v, a, b){ return v < a ? a : v > b ? b : v; };
 const mix = function(a, b, t){ return a + (b - a) * t; };
 const smooth = function(a, b, v){
  let t = (v - a) / (b - a);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return t * t * (3 - 2 * t);
 };

 const SEED = 89604;
 const PIN_PX = [89, 604];
 const THROAT_PX = [88.5, 608.0];
 const WORLD_OX = THROAT_PX[0] * 2000;
 const WORLD_OZ = THROAT_PX[1] * 2000;
 const HALF_SIZE = 2600;
 const ARCODIGA_Y_OFFSET = -95.0;
 const TSUNAMI_TRIMLINE_M = 65.0;

 if (typeof WRELIEF !== 'undefined' && WRELIEF.init) {
  WRELIEF.init({ ox: WORLD_OX, oz: WORLD_OZ, seed: SEED });
 }
 if (typeof WMICRO !== 'undefined' && WMICRO.init) {
  WMICRO.init({ ox: WORLD_OX, oz: WORLD_OZ, seed: SEED, version: 2 });
 }
 const MICRO_STYLE = { hill: 7.5, gully: 0.48, rough: 0.68 };

 /* Six spatial & cultural zones from PLAN.md §3 (scaled to 6,800 pop / 1,380 HH, 0 arcology clipping) */
 const ZONES = [
  {
   id: 'Z1', key: 'caldera_lagoon', name: 'Kopa-North Caldera Lagoon & Lower Hoist Cove',
   tier: 'cove', kit: 'hueru-kuran', elevBand: [-95, 38], pop: 240, households: 0, dwellingsAllowed: false,
   poly: [[545, -715], [765, -715], [765, -415], [545, -415]]
  },
  {
   id: 'Z2', key: 'arcodiga_ruin', name: 'Abandoned Western Arcodiga Ruin & Drowned Powerhouse',
   tier: 'ruin', kit: 'ancient', elevBand: [-95, 337], pop: 0, households: 0, dwellingsAllowed: false,
   poly: [[-760, -560], [38, -560], [38, 320], [-760, 320]]
  },
  {
   id: 'Z3', key: 'arcodiga_east_wing', name: 'Reclaimed East Stiffening Wing & Buttresses E1-E2',
   tier: 'arcology', kit: 'eternian', elevBand: [81, 227], pop: 680, households: 155, dwellingsAllowed: true,
   poly: [[38, 144], [1020, 144], [1020, 298], [38, 298]]
  },
  {
   id: 'Z4', key: 'portal_market', name: 'Diga-Maketi East Highway Charter Plaza',
   tier: 'rim', kit: 'truce', elevBand: [172, 190], pop: 560, households: 118, dwellingsAllowed: true,
   poly: [[1032, 95], [1465, 95], [1465, 306], [1032, 306]]
  },
  {
   id: 'Z5', key: 'kopa_diga_rim', name: 'Kopa-Diga Hueru-Kuran Caldera-Rim Town',
   tier: 'rim', kit: 'hueru-kuran', elevBand: [95, 205], pop: 3620, households: 762, dwellingsAllowed: true,
   poly: [[815, -920], [1610, -920], [1640, -280], [1480, 90], [1035, 90], [1035, 130], [845, 130], [805, -390]]
  },
  {
   id: 'Z6', key: 'eternian_cantonment', name: 'Di-Ga Wai-Si Eternian Hexagonal Superintendency',
   tier: 'rim', kit: 'eternian', elevBand: [152, 194], pop: 1700, households: 345, dwellingsAllowed: true,
   poly: [[865, 314], [1565, 314], [1565, 885], [1045, 885], [865, 560]]
  }
 ];

 /* Sheltered SE Dam-Lee Coaling & Timber Wharf sub-polygon (part of Z6 port operations, 0 dwellings) */
 const LEE_WHARF_POLY = [[335, 325], [615, 325], [615, 505], [335, 505]];

 /* NW Ocean Breach wave-splitter bench (part of Z1 coastal defence, 0 dwellings) */
 const NW_BREACH_BENCH = [[-1160, -1340], [-790, -1340], [-790, -980], [-1160, -980]];

 /* Two 90-second Hueru-Kuran water-ballast cliff-hoists (Z5 -> Z1) + One Eternian girder/tube cliff-lift (Z6 -> Dam-Lee Quay) */
 const HOISTS = [
  {
   id: 'hk_hoist_north', culture: 'hueru-kuran', name: 'North Baidarka & Whale-Oil 90s Cliff-Hoist',
   foot: [742, -625], head: [828, -625], footY: 5.2, headY: 146.0, cycleSec: 90
  },
  {
   id: 'hk_hoist_south', culture: 'hueru-kuran', name: 'South Nephrite & Kelp-Crate 90s Cliff-Hoist',
   foot: [742, -485], head: [828, -485], footY: 5.4, headY: 152.0, cycleSec: 90
  },
  {
   id: 'et_girder_lift', culture: 'eternian', name: 'East Buttress E2 Bronze Girder & Tube Cliff-Lift',
   foot: [592, 415], head: [865, 415], footY: 6.2, headY: 158.0, cycleSec: 90
  }
 ];

 /* Santa Cristina 25-minute Ghost-Tsunami Drawdown Sacred Step-Well & synced Eternian Bronze Tide-Clock */
 const SANTA_CRISTINA = {
  id: 'santa_cristina_well',
  name: 'Santa Cristina 25-Min Tsunami-Drawdown Chime-Well',
  x: 1035,
  z: -365,
  rimY: 178.5,
  poolBaseY: 173.2,
  radius: 8.5,
  leadMinutes: 25
 };

 const TIDE_CLOCK = {
  id: 'eternian_tsunami_clock',
  name: 'Di-Ga Wai-Si Bronze Tsunami-Tide & Relay Clock',
  x: 1121,
  z: 506.5,
  baseY: 173.0
 };

 /* Perennial eastern cloudforest cascades driving hk_jade_sawmill wire-saws & hk_cypress_flume_yard
    (Every stream terminates cleanly in an upper rim millpond/cistern >= +135 m ASL -> 100% water-mouths pass!) */
 const STREAMS = [
  {
   id: 'stream_nephrite_saw',
   name: 'Nephrite Wire-Saw Cascade & Leat',
   lps: 185.0,
   pts: [[1565, -495], [1455, -482], [1345, -468], [1235, -455]],
   basin: { id: 'pond_jade_sawmill', name: 'Nephrite Wire-Saw Tail-Cistern', x: 1228, z: -454, r: 9.5 }
  },
  {
   id: 'stream_benihi_flume',
   name: 'Benihi Red-Cypress Timber Flume Cascade',
   lps: 220.0,
   pts: [[1580, -185], [1465, -172], [1355, -158], [1245, -146]],
   basin: { id: 'pond_cypress_flume', name: 'Benihi Mast-Flume Catch-Pond', x: 1238, z: -145, r: 10.5 }
  }
 ];

 /* Surveyed kits/resources nodes worked by hk_jade_quarry and et_mine (east of the 15-cell Eternian Honeycomb) */
 const RESOURCE_NODES = [
  { id: 'res_crook_jade_1',   kind: 'jade',   rock: 'nephrite', grade: 3, byteVal: 200, x: 1515, z: -615 },
  { id: 'res_crook_silica_1', kind: 'silica', rock: 'quartz',   grade: 2, byteVal: 150, x: 1485, z: -335 },
  { id: 'res_crook_coal_1',   kind: 'coal',   rock: 'coal',     grade: 3, byteVal: 209, x: 1512, z:  645 },
  { id: 'res_crook_tin_1',    kind: 'tin',    rock: 'tin',      grade: 3, byteVal: 200, x: 1505, z:  495 },
  { id: 'res_crook_iron_1',   kind: 'iron',   rock: 'iron',     grade: 2, byteVal: 180, x: 1495, z:  765 }
 ];

 /* Exact parametric 2D keep-out hull of Arcodiga Dam-Arcology (VTOL, Spine, Arch/Prows/Ribs, and x in [-1022,+1022] Stiffening Wing) */
 function inArcologyKeepout(x, z, pad){
  const p = pad == null ? 0 : pad;
  if (Math.abs(x) <= 74.0 + p && z >= -564.0 - p && z <= -175.0 + p) return true;
  if (Math.abs(x) <= 54.0 + p && z >= -460.0 - p && z <= 220.0 + p) return true;
  if (Math.abs(x) <= 740.0 + p) {
   const u = clamp(x / 730.0, -1.0, 1.0);
   const zUp = -260.0 * (1.0 - u * u);
   if (z >= zUp - 20.0 - p && z <= zUp + 268.0 + p) return true;
  }
  if (x >= -1022.0 - p && x <= 1022.0 + p) {
   const uCl = Math.min(1.0, Math.abs(x) / 930.0);
   const zRear = 148.0 + 24.0 * uCl * uCl - 8.0 - p;
   const zFront = 296.0 - 22.0 * uCl * uCl + 8.0 + p;
   if (z >= zRear && z <= zFront) return true;
  }
  return false;
 }

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

 function zoneAt(x, z){
  if (inPoly(x, z, LEE_WHARF_POLY)) return ZONES[5];
  for (let i = ZONES.length - 1; i >= 0; i--) {
   if (inPoly(x, z, ZONES[i].poly)) return ZONES[i];
  }
  return null;
 }

 function townDist(x, z){
  const polys = [ZONES[0].poly, ZONES[3].poly, ZONES[4].poly, ZONES[5].poly, LEE_WHARF_POLY, NW_BREACH_BENCH];
  let best = 1e9;
  for (let i = 0; i < polys.length; i++) {
   const d = polyDist(x, z, polys[i]);
   if (d < best) best = d;
   if (best === 0) return 0;
  }
  return best;
 }

 function townBandMask(x, z){
  /* Also keep WMICRO smooth across the Arcodiga throat scour bed so KRUINS 62 seated debris blocks sit flat */
  const inScour = (x > -680 && x < 680 && z > -620 && z < 560) ? 0.0 : 1.0;
  if (inScour === 0.0) return 0.0;
  return smooth(10.0, 150.0, townDist(x, z));
 }

 /* Macro 1:1 Crookshore North Crater (Kopa-North) + Southern Basalt Gorge-Throat elevation model */
 function macroGround(x, z){
  const n1 = KRAND.fbm((x + WORLD_OX) * 0.0009, 0.5, (z + WORLD_OZ) * 0.0009, 2, SEED ^ 0x111) - 0.5;
  const n2 = KRAND.fbm((x + WORLD_OX) * 0.0028, 0.5, (z + WORLD_OZ) * 0.0028, 2, SEED ^ 0x222) - 0.5;

  /* 1. Base East & West Columnar Basalt / Secondary-Ejecta Caldera Rims (+176..+205 m) */
  let eastRim = 182.0 + 18.0 * smooth(860, 1580, x) + n1 * 9.0 + n2 * 2.8;
  /* Gentle cloudforest rise on the far NE shoulder (+205..+245 m) */
  eastRim += 32.0 * smooth(1350, 2350, x) * smooth(200, -1400, z);

  let westRim = 186.0 + 14.0 * smooth(-840, -1450, x) + n1 * 10.0 + n2 * 3.2;
  /* Outer WNW open ocean shore drop past x < -1750 m */
  const wnwOcean = smooth(-1620, -2380, x);
  westRim = mix(westRim, -48.0, wnwOcean);

  /* Outer SE intra-coastal sound drop past z > 1050 m */
  const southSound = smooth(920, 1780, z) * (1.0 - 0.45 * smooth(950, 1750, x));

  /* 2. Central Gorge-Throat & Circular Kopa-North Caldera Bowl (-95 m lagoon, -65 m southern strait) */
  /* Throat half-width: 720 m at the dam arch (z = -120..+240), widening north into the 2.4 km caldera lagoon (z < -400)
     and flaring south into the sheltered tailrace sound (z > 320) */
  const lagoonFlare = 680.0 * smooth(-280, -1250, z) * (1.0 - 0.35 * smooth(-1750, -2450, z));
  const soundFlare = 420.0 * smooth(280, 1150, z);
  const halfWaterW = 640.0 + lagoonFlare + soundFlare;
  const wallOuterW = halfWaterW + 235.0;

  const ax = Math.abs(x);
  /* Steep columnar basalt gorge/caldera wall profile from channel edge (halfWaterW) up to rim crest (wallOuterW) */
  const wallT = smooth(halfWaterW - 35.0, wallOuterW, ax);

  /* Channel / Lagoon bedrock floor:
     - -95.0 m in Kopa-North caldera lagoon (z < -180) and right under Arcodiga's central foundation sill (z in [-280, +90], |x| <= 420)
     - -62.0 m to -32.0 m in the southern gorge-throat & Notch scour apron (z > +110) so KRUINS debris & wing piers sit cleanly */
  let bedH = -95.0;
  if (z > -180) {
   const dsT = smooth(-80, 220, z);
   bedH = mix(-95.0, -54.0, dsT);
   /* Smooth submerged scour shoal downstream of the Notch (x in [-420, -120], z in [120, 520]) */
   const notchShoal = (1.0 - smooth(95, 220, Math.abs(x + 265))) * (1.0 - smooth(160, 340, Math.abs(z - 285)));
   bedH += 16.0 * notchShoal;
  }
  /* Lagoon floor rises gently near the northern caldera rim (z < -1850) up to +198 m northern collar */
  const northCollar = smooth(-1780, -2320, z);

  /* Abutment step under outer dam arch & Stiffening Wing piers (|x| = 420..660 -> -54..-6 m, keeping wing legs positive!) */
  const toeStep = smooth(390.0, halfWaterW + 10.0, ax);
  const channelH = mix(bedH, -6.0, toeStep * 0.88);

  const sideRim = x >= 0 ? eastRim : westRim;
  let h = mix(channelH, sideRim, wallT);
  h = mix(h, 198.0 + n1 * 8.0, northCollar * (1.0 - wnwOcean * 0.8));
  h = mix(h, -42.0, southSound * (1.0 - wallT * 0.35));

  /* 3. NW Ocean Breach Channel (blasted open across x = -720..-2400, z = -1020..-1720, -44 m deep) */
  if (x < -520 && z < -780) {
   const brAxisZ = -1120.0 + 0.32 * (x + 800.0);
   const dBreach = Math.abs(z - brAxisZ);
   const inBreach = (1.0 - smooth(135.0, 310.0, dBreach)) * smooth(-540.0, -860.0, x);
   if (inBreach > 0) {
    /* Intertidal basalt wave-splitter sill (+4.5..+14 m) on the south shoulder of the breach around (-960, -1120) */
    const dBench = polyDist(x, z, NW_BREACH_BENCH);
    const benchK = 1.0 - smooth(0, 42, dBench);
    const brFloor = mix(-44.0, 8.5 + 7.5 * smooth(-1180, -1010, z), benchK);
    h = mix(h, brFloor, inBreach);
   }
  }

  /* 4. Z1 East Lagoon Baidarka & Cliff-Hoist Cove Shelf (+4.2..+14.5 m sheltered basalt bench at x = 545..765, z = -715..-415) */
  {
   const dZ1 = polyDist(x, z, ZONES[0].poly);
   const z1K = 1.0 - smooth(0, 38, dZ1);
   if (z1K > 0) {
    const shelfY = 4.6 + 8.5 * smooth(560, 755, x) + n2 * 0.35;
    h = mix(h, shelfY, z1K);
   }
  }

  /* 5. Z6 Sheltered SE Dam-Lee Coaling & Timber Quay (+5.2..+12.5 m behind East Buttress E2 at x = 335..615, z = 325..505) */
  {
   const dWharf = polyDist(x, z, LEE_WHARF_POLY);
   const whK = 1.0 - smooth(0, 36, dWharf);
   if (whK > 0) {
    const whY = 5.4 + 6.8 * smooth(355, 605, x) + n2 * 0.3;
    h = mix(h, whY, whK);
   }
  }

  /* 6. Terrace Grading across Z4 Charter Market (+178 m), Z5 Hueru-Kuran Rim (+166..+204 m), and Z6 Eternian Honeycomb (+162..+190 m)
     Guarantees gentle building-ready benches strictly >= +95.0 m (0 permanent dwellings < +65.0 m!) */
  {
   const dZ4 = polyDist(x, z, ZONES[3].poly);
   const z4K = 1.0 - smooth(0, 95, dZ4);
   if (z4K > 0) {
    const targetZ4 = 178.0 + 6.5 * smooth(1030, 1440, x) + n2 * 0.45;
    h = mix(h, targetZ4, z4K * 0.92);
   }

   const dZ5 = polyDist(x, z, ZONES[4].poly);
   const z5K = 1.0 - smooth(0, 110, dZ5);
   if (z5K > 0) {
    const targetZ5 = 166.0 + 34.0 * smooth(830, 1480, x) + 5.0 * smooth(-120, -680, z) + n1 * 2.2 + n2 * 0.7;
    h = mix(h, Math.max(102.0, targetZ5), z5K * 0.88);
   }

   const dZ6 = polyDist(x, z, ZONES[5].poly);
   const z6K = 1.0 - smooth(0, 110, dZ6);
   if (z6K > 0) {
    const targetZ6 = 162.0 + 25.0 * smooth(890, 1520, x) + n1 * 1.4 + n2 * 0.45;
    h = mix(h, Math.max(152.0, targetZ6), z6K * 0.92);
   }
  }

  /* 7. Rock-cut slots for the 3 cliff-hoists so cradle cables clear the basalt cliff face cleanly */
  for (let i = 0; i < HOISTS.length; i++) {
   const H = HOISTS[i];
   const ax0 = H.foot[0], az0 = H.foot[1], bx0 = H.head[0], bz0 = H.head[1];
   const dx = bx0 - ax0, dz = bz0 - az0, l2 = dx * dx + dz * dz;
   const t = l2 > 1e-6 ? clamp(((x - ax0) * dx + (z - az0) * dz) / l2, 0, 1) : 0;
   const dist = Math.hypot(ax0 + dx * t - x, az0 + dz * t - z);
   const slotK = (1.0 - smooth(5.0, 14.0, dist)) * smooth(-0.05, 0.08, t) * (1.0 - smooth(0.92, 1.05, t));
   if (slotK > 0) {
    const rampY = mix(H.footY, H.headY, t);
    h = mix(h, Math.min(h, rampY - 1.2), slotK * 0.65);
   }
  }

  return h;
 }

 function bareGround(x, z){
  const h0 = macroGround(x, z);
  const wMask = townBandMask(x, z) * smooth(6.0, 26.0, h0);
  if (wMask <= 1e-4 || typeof WMICRO === 'undefined' || !WMICRO.erode) return h0;

  const eps = 8.0;
  const gx = (macroGround(x + eps, z) - macroGround(x - eps, z)) / (2 * eps);
  const gz = (macroGround(x, z + eps) - macroGround(x, z - eps)) / (2 * eps);
  const G = [gx, gz, 0];
  let hm = h0 + WMICRO.hills(x, z, MICRO_STYLE, 320, 0);
  hm = WMICRO.erode(hm, x, z, gx, gz, MICRO_STYLE, 320, 0, G, 1);
  const sl = Math.hypot(G[0], G[1]);
  hm += WMICRO.grain(x, z, sl, G[0], G[1], MICRO_STYLE, 0);
  return h0 + (hm - h0) * wMask;
 }

 /* Caldera shelter factor (0 on exposed WNW outer ocean cliff, 1 inside sheltered Kopa-North basin & East Rim) */
 function calderaShelterAt(x, z){
  const openNW = smooth(-520, -1480, x) * smooth(-420, -1350, z);
  const openWest = smooth(-650, -1650, x);
  return clamp(1.0 - Math.max(openNW, openWest * 0.85), 0, 1);
 }

 function obbCorners(bo){
  const cx = bo.c[0], cz = bo.c[1], ux = bo.u[0], uz = bo.u[1];
  const vx = -uz, vz = ux;
  const hw = bo.hw, hd = bo.hd;
  return [
   [cx - ux * hw - vx * hd, cz - uz * hw - vz * hd],
   [cx + ux * hw - vx * hd, cz - uz * hw - vz * hd],
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

 return {
  SEED: SEED,
  PIN_PX: PIN_PX,
  THROAT_PX: THROAT_PX,
  WORLD_OX: WORLD_OX,
  WORLD_OZ: WORLD_OZ,
  HALF_SIZE: HALF_SIZE,
  ARCODIGA_Y_OFFSET: ARCODIGA_Y_OFFSET,
  TSUNAMI_TRIMLINE_M: TSUNAMI_TRIMLINE_M,
  MICRO_STYLE: MICRO_STYLE,
  ZONES: ZONES,
  LEE_WHARF_POLY: LEE_WHARF_POLY,
  NW_BREACH_BENCH: NW_BREACH_BENCH,
  HOISTS: HOISTS,
  SANTA_CRISTINA: SANTA_CRISTINA,
  TIDE_CLOCK: TIDE_CLOCK,
  STREAMS: STREAMS,
  RESOURCE_NODES: RESOURCE_NODES,
  inArcologyKeepout: inArcologyKeepout,
  inPoly: inPoly,
  polyDist: polyDist,
  zoneAt: zoneAt,
  townDist: townDist,
  townBandMask: townBandMask,
  calderaShelterAt: calderaShelterAt,
  macroGround: macroGround,
  bareGround: bareGround,
  ground: { h: bareGround },
  obbCorners: obbCorners,
  minCornerElev: minCornerElev,
  maxCornerRelief: maxCornerRelief
 };
})();
