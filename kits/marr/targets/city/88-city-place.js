// ================================================================= MARR CITY — 88-city-place.js
// Populates OCC and VERN_PLACED across all 6 quarters of Marr (Porta Marr) + 4 Extramuros Fincas.
// Every block turns with the coastline/canals, keeps a centered orthogonal courtyard (mar_patio_*),
// and is enclosed by dense, continuous perimeter street-walls of buildings (Spanish Colonial / Latin American traza).
// Zero terrestrial buildings touch or float over water.
// Tagged [G data] in PORT.md: no DOM, no Three.js, no numeric || defaults.
reseed(424303);

const OCC = { list: [] };
const VERN_PLACED = [];
const MAR_CUADRA_RECTS = [];
const MAR_ESTATE_RECTS = [];

function occAdd(o) {
 OCC.list.push(o);
 return o;
}

function occFree(o, pad) {
 const p = pad == null ? -0.35 : pad;
 const c1 = Math.cos(o.ry), s1 = Math.sin(o.ry);
 for (let i = 0; i < OCC.list.length; i++) {
  const b = OCC.list[i];
  const dx = b.x - o.x, dz = b.z - o.z;
  const dist = Math.hypot(dx, dz);
  if (dist > o.hx + o.hz + b.hx + b.hz + p) continue;
  // Check separating axes in o's frame
  const lx1 = Math.abs(dx * c1 - dz * s1), lz1 = Math.abs(dx * s1 + dz * c1);
  const bc1 = Math.cos(b.ry - o.ry), bs1 = Math.sin(b.ry - o.ry);
  const bhx1 = Math.abs(b.hx * bc1) + Math.abs(b.hz * bs1);
  const bhz1 = Math.abs(b.hx * bs1) + Math.abs(b.hz * bc1);
  if (lx1 >= o.hx + bhx1 + p || lz1 >= o.hz + bhz1 + p) continue;
  // Check separating axes in b's frame
  const c2 = Math.cos(b.ry), s2 = Math.sin(b.ry);
  const lx2 = Math.abs(dx * c2 - dz * s2), lz2 = Math.abs(dx * s2 + dz * c2);
  const oc2 = Math.abs(o.hx * bc1) + Math.abs(o.hz * bs1);
  const oz2 = Math.abs(o.hx * bs1) + Math.abs(o.hz * bc1);
  if (lx2 >= b.hx + oc2 + p || lz2 >= b.hz + oz2 + p) continue;
  return false;
 }
 return true;
}

function pointInPoly2D(px, pz, poly) {
 let inside = false;
 for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
  const xi = poly[i][0], zi = poly[i][1];
  const xj = poly[j][0], zj = poly[j][1];
  const intersect = ((zi > pz) !== (zj > pz)) && (px < (xj - xi) * (pz - zi) / (zj - zi + 1e-9) + xi);
  if (intersect) inside = !inside;
 }
 return inside;
}

function placeMarr(key, x, z, ry, opts) {
 const D = VERN.defs[key];
 if (!D) return null;
 const op = opts || {};
 // Actual masonry wall extents (D.w and D.d include ~1.0m showcase plot margin)
 const hx = Math.max(2.4, D.w * 0.5 - 0.55), hz = Math.max(2.4, D.d * 0.5 - 0.55);
 const c = Math.cos(ry), s = Math.sin(ry);
 if (!op.allowWater) {
  if (inWater(x, z, 1.0)) return null;
  for (const [sx, sz] of [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz], [0, hz], [0, -hz]]) {
   const wx = x + sx * c + sz * s, wz = z - sx * s + sz * c;
   if (inWater(wx, wz, 0.4)) return null;
  }
  // Ensure building does not overlap painted streets unless explicitly forced (e.g. city gates)
  if (!op.force && !op.noOcc) {
   const rx = Math.max(1.2, hx - 1.35), rz = Math.max(1.2, hz - 1.35);
   for (const [sx, sz] of [[0, 0], [-rx, -rz], [rx, -rz], [rx, rz], [-rx, rz], [0, rz], [0, -rz]]) {
    const wx = x + sx * c + sz * s, wz = z - sx * s + sz * c;
    if (isRoad(wx, wz)) return null;
   }
  }
  // If a block quad polygon is supplied, require all 4 building core corners to stay inside the block quad
  if (op.quad && !op.force) {
   const qx = Math.max(1.2, hx - 1.1), qz = Math.max(1.2, hz - 1.1);
   for (const [sx, sz] of [[-qx, -qz], [qx, -qz], [qx, qz], [-qx, qz]]) {
    const wx = x + sx * c + sz * s, wz = z - sx * s + sz * c;
    if (!pointInPoly2D(wx, wz, op.quad)) return null;
   }
  }
 }
 const o = { x, z, ry, hx, hz, built: key };
 if (!op.noOcc && !occFree(o, op.pad == null ? -0.15 : op.pad)) {
  if (!op.force) return null;
 }
 if (!op.noOcc) {
  occAdd(o);
  if (typeof BIO_OBSTACLES !== 'undefined' && !op.allowWater) {
   BIO_OBSTACLES.push({ x, z, r: Math.hypot(hx, hz) + 1.0 });
  }
 }
 if (!op.allowWater) {
  const yPad = op.y == null ? rawTerrainH(x, z) : op.y;
  cityFlat(x, z, hx + 0.6, hz + 0.6, yPad, ry);
  const pts = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]].map(q => [x + q[0] * c + q[1] * s, z - q[0] * s + q[1] * c]);
  footprint(pts);
 }
 const nVar = Math.max(1, D.variants == null ? 1 : D.variants);
 const rec = {
  key,
  o,
  v: op.v == null ? ((Math.abs(Math.round(x * 7 + z * 13))) % nVar) : op.v,
  name: op.name || null,
  allowWater: !!op.allowWater,
  y: op.y == null ? null : op.y,
  opts: op
 };
 VERN_PLACED.push(rec);
 return rec;
}

const PATIO_KEY = {
 pleasure: 'mar_patio_pleasure',
 vegetable: 'mar_patio_vegetable',
 working: 'mar_patio_working'
};

// Narrow-to-medium party-wall houses for continuous street rows
const POOL_POOR = [
 'mar_creole_cottage', 'mar_shotgun_single', 'mar_shotgun_double',
 'mar_fishers_row', 'mar_shades_shanty', 'mar_canal_loft',
 'vern_house_poor_a', 'vern_house_poor_b', 'vern_house_poor_c'
];
const POOL_SHADES = [
 'mar_shades_tenement', 'mar_shades_shanty', 'mar_canal_loft',
 'mar_smuggler_cellar', 'mar_smuggler_warehouse', 'mar_cantina',
 'mar_boarding_house', 'mar_bruges_canal_house', 'vern_sailors_tavern',
 'mar_townhouse_iron', 'vern_house_mid_a', 'vern_house_poor_c'
];
const POOL_MIDDLE = [
 'mar_townhouse_iron', 'mar_corner_french', 'mar_corner_mirador',
 'mar_bruges_canal_house', 'mar_casa_patio', 'mar_artisan_court',
 'mar_boarding_house', 'mar_chapel_barrio', 'mar_posada',
 'mar_chandlery', 'mar_rum_bodega', 'mar_portal_arcade',
 'vern_house_mid_a', 'vern_house_mid_b', 'vern_shops',
 'vern_bakery', 'vern_tailor', 'vern_apothecary'
];
const POOL_RICH = [
 'mar_garden_mansion', 'mar_palacio_baroque', 'mar_azulejo_villa',
 'mar_captains_house', 'mar_consulado_house', 'mar_hacienda',
 'vern_house_rich_a', 'vern_house_rich_b'
];

// Pack a continuous edge-to-edge row of buildings along a span of length `spanLen` without exceeding `spanLen`
function packStreetRow(spanLen, pool, hfn, seedOff, maxD) {
 const row = [];
 const maxSpan = Math.max(6.0, spanLen - 0.6);
 let sumW = 0;
 let idx = 0;
 while (sumW < maxSpan - 5.2 && idx < 9) {
  const rem = maxSpan - sumW;
  let bKey = null, D = null;
  for (let t = 0; t < pool.length; t++) {
   const k2 = pool[(hfn(idx, seedOff) + t) % pool.length];
   const d2 = VERN.defs[k2];
   if (!d2) continue;
   const w2 = Math.max(5.5, d2.w - 1.0);
   if ((maxD == null || d2.d <= maxD) && w2 <= rem + 0.3) {
    bKey = k2;
    D = d2;
    break;
   }
  }
  if (!D) break;
  const effW = Math.max(5.5, D.w - 1.0);
  if (sumW + effW > maxSpan + 0.3 && row.length > 0) break;
  row.push({ key: bKey, w: effW, d: D.d });
  sumW += effW;
  idx++;
 }
 if (!row.length) {
  for (let t = 0; t < pool.length; t++) {
   const k2 = pool[(hfn(0, seedOff) + t) % pool.length];
   const d2 = VERN.defs[k2];
   if (d2 && (maxD == null || d2.d <= maxD + 2.0) && d2.w - 1.0 <= spanLen + 1.0) {
    row.push({ key: k2, w: Math.max(5.5, d2.w - 1.0), d: d2.d });
    break;
   }
  }
 }
 return row;
}

// Place a dense colonial perimeter cuadra block with a centered orthogonal courtyard and continuous street-facing rows
function placeCuadraBlock(quad, opts) {
 const op = opts || {};
 const ang = op.ang == null ? quadAngle(quad) : op.ang;
 const R = orthoRectInsideQuad(quad, ang, 1.1);
 if (inWater(R.cx, R.cz, 1.5)) return;
 if (R.wh < 5.2 || R.hh < 4.8) return;
 const ux = Math.cos(ang), uz = Math.sin(ang);
 const vx = -uz, vz = ux;
 const pKey = PATIO_KEY[op.patio || 'working'] || 'mar_patio_working';
 const safeQuad = quad;

 // Record this cuadra's rectangle for continuous stone sidewalk curbs in 90a-city-world.js
 MAR_CUADRA_RECTS.push({
  cx: R.cx,
  cz: R.cz,
  wh: R.wh,
  hh: R.hh,
  ang,
  wealth: op.wealth || 'middle',
  shades: !!op.shades
 });

 // 1. Centered courtyard inside the block (when block is large enough for a central patio)
 if (R.wh >= 11.5 && R.hh >= 11.5) {
  placeMarr(pKey, R.cx, R.cz, ang, { noOcc: true, name: op.name ? op.name + ' — Courtyard' : null });
 }

 const pool = op.wealth === 'rich' ? POOL_RICH : (op.wealth === 'poor' ? POOL_POOR : (op.shades ? POOL_SHADES : POOL_MIDDLE));
 const hfn = (i, j) => Math.abs(Math.round(R.cx * 11 + R.cz * 17 + i * 31 + j * 47));

 // 2. Compact / Grid-Break Band Lot (R.hh < 12.0): tile a single non-overlapping row of houses across the lot width
 if (R.hh < 12.0) {
  const availW = R.wh * 2 - 0.8;
  const maxD = Math.max(12.0, R.hh * 2 + 1.4);
  const row = packStreetRow(availW, pool, hfn, 1, maxD);
  const totalW = row.reduce((s, r) => s + r.w, 0);
  let uCur = -0.5 * totalW;
  for (let i = 0; i < row.length; i++) {
   const it = row[i];
   const uPos = uCur + 0.5 * it.w;
   uCur += it.w;
   const bx = R.cx + uPos * ux;
   const bz = R.cz + uPos * uz;
   placeMarr(it.key, bx, bz, -ang, {
    pad: -0.35,
    quad: safeQuad,
    name: i === 0 ? (op.name || null) : null
   });
  }
  return;
 }

 // 3. North (side = -1) & South (side = +1) continuous street fronts along the block width
 const availW = R.wh * 2 - 1.0;
 const maxRowD = Math.max(12.0, Math.min(18.0, R.hh + 1.4));
 let maxNorthD = 12.0, maxSouthD = 12.0;
 for (let side = -1; side <= 1; side += 2) {
  const row = packStreetRow(availW, pool, hfn, side < 0 ? 10 : 20, maxRowD);
  const totalW = row.reduce((s, r) => s + r.w, 0);
  let uCur = -0.5 * totalW;
  const rySide = side < 0 ? -ang + Math.PI : -ang;
  for (let i = 0; i < row.length; i++) {
   const it = row[i];
   const uPos = uCur + 0.5 * it.w;
   uCur += it.w;
   const hz = Math.max(2.4, it.d * 0.5 - 0.85);
   const vOff = side * Math.max(0.0, R.hh - hz - 0.35);
   const bx = R.cx + uPos * ux + vOff * vx;
   const bz = R.cz + uPos * uz + vOff * vz;
   const placed = placeMarr(it.key, bx, bz, rySide, {
    pad: -0.35,
    quad: safeQuad,
    name: (side > 0 && i === 0) ? op.name : null
   });
   if (placed) {
    if (side < 0) maxNorthD = Math.max(maxNorthD, hz * 2 + 0.7);
    else maxSouthD = Math.max(maxSouthD, hz * 2 + 0.7);
   }
  }
 }

 // 4. West (side = -1) & East (side = +1) street fronts between the North and South rows
 // Leave a 2.6 m zaguán alley gap so side buildings never overlap corner buildings and courtyards are walk-reachable
 const innerSpanV = (R.hh * 2) - maxNorthD - maxSouthD - 3.6;
 if (R.wh >= 15.0 && innerSpanV >= 7.5) {
  const maxSideD = Math.max(12.0, Math.min(16.5, R.wh + 1.0));
  for (let side = -1; side <= 1; side += 2) {
   const row = packStreetRow(innerSpanV, pool, hfn, side < 0 ? 30 : 40, maxSideD);
   const totalW = row.reduce((s, r) => s + r.w, 0);
   const vCenter = 0.5 * (maxNorthD - maxSouthD);
   let vCur = vCenter - 0.5 * totalW;
   const rySide = side < 0 ? -ang - Math.PI / 2 : -ang + Math.PI / 2;
   for (let i = 0; i < row.length; i++) {
    const it = row[i];
    const vPos = vCur + 0.5 * it.w;
    vCur += it.w;
    const hz = Math.max(2.4, it.d * 0.5 - 0.85);
    const uOff = side * Math.max(0.0, R.wh - hz - 0.35);
    const bx = R.cx + uOff * ux + vPos * vx;
    const bz = R.cz + uOff * uz + vPos * vz;
    placeMarr(it.key, bx, bz, rySide, {
     pad: -0.35,
     quad: safeQuad
    });
   }
  }
 }
}

// =========================================================================
// 1. MAJOR CIVIC, MILITARY, RELIGIOUS & MARITIME LANDMARKS
// =========================================================================
(function placeMarrLandmarks() {
 // I. Poinda de Navigadarz (NW Headland)
 cityFlat(-216, -220, 16, 16, 9.2, 0);
 placeMarr('mar_castillo_bastion', -216, -220, 0, { force: true, y: 9.2, name: 'Forta de Poinda & Tauar de Guach' });
 cityFlat(-184, -146, 20, 20, 5.8, 0);
 placeMarr('mar_navigators_guild', -184, -146, 0, { force: true, y: 5.8, name: 'Gilda de Navigadarz' });

 // II. Porta & Dokaz (Breakwater Lighthouse, Shoreline Quays, 13 Shore-Attached Piers/Wharves & Waterfront Buildings)
 placeMarr('vern_harbour_light', 60, -288, 0, { allowWater: true, force: true, y: 3.4, name: 'Bigon de Mol (Breakwater Light)' });

 // Waterfront Quays embedded right at the stone seawall (y = 0.25 so deck is at +1.40m)
 for (const [qx, qz, qn] of [
  [-92, coastZ(-92) + 1.2, 'Quay de Kostomz Guesta'],
  [-66, coastZ(-66) + 1.2, 'Quay de Aduana'],
  [-42, coastZ(-42) + 1.2, 'Quay de Kostomz Esta'],
  [40, coastZ(40) + 1.2, 'Quay de Marchondaz Guesta'],
  [72, coastZ(72) + 1.2, 'Quay de Marchondaz Sentral'],
  [102, coastZ(102) + 1.2, 'Quay de Marchondaz Esta'],
  [210, coastZ(210) + 1.2, 'Quay de Xedaz Guesta'],
  [242, coastZ(242) + 1.2, 'Quay de Xedaz Sentral'],
  [272, coastZ(272) + 1.2, 'Quay de Xedaz Esta']
 ]) {
  placeMarr('vern_quay', qx, qz, Math.PI, { allowWater: true, noOcc: true, y: 0.25, name: qn });
 }

 // Canal Quays along Knal Greta, Knal de Gardonz & Knal de Xedaz
 for (const [cx, cz, cry, cn] of [
  [gretaL(-55, 1.5), -55, Math.PI / 2, 'Quay de Knal Greta Guesta'],
  [gretaR(-55, 1.5), -55, -Math.PI / 2, 'Quay de Knal Greta Esta'],
  [gretaL(35, 1.5), 35, Math.PI / 2, 'Quay de Palas'],
  [gretaR(45, 1.5), 45, -Math.PI / 2, 'Quay de Kanal'],
  [xedR(10, 1.5), 10, -Math.PI / 2, 'Guarfa de Ismoglarz'],
  [xedR(105, 1.5), 105, -Math.PI / 2, 'Quay de Barjaz'],
  [gretaL(412, 1.5), 412, Math.PI / 2, 'Quay de Sauta Guesta'],
  [gretaR(412, 1.5), 412, -Math.PI / 2, 'Quay de Sauta Esta']
 ]) {
  placeMarr('mar_canal_quay', cx, cz, cry, { allowWater: true, noOcc: true, y: 0.25, name: cn });
 }

 // 13 Shore-Attached Harbour Piers, Crane Wharves, Ferry Slips & Fish Landings (y = 0.25 so deck is at +1.40m)
 for (const P of MAR_PIERS) {
  placeMarr(P.key, P.x, P.z, P.ry, { allowWater: true, noOcc: true, y: 0.25, name: P.name });
 }

 // Continuous Waterfront Commercial Row along the Malekón on Isla de Sidi Olda, Isla de Marchondaz & Kosta de Xedaz
 placeMarr('vern_port_warehouse', -98, -118, Math.PI, { force: true, name: 'Gueraus de Porta (West)' });
 placeMarr('mar_chandlery', -76, -118, Math.PI, { force: true, name: 'Xopa de Kompas & Chandlari' });
 placeMarr('mar_aduana', -46, -116, Math.PI, { force: true, name: 'Om de Kostomz (Customs Hall)' });
 placeMarr('mar_consulado_house', -22, -118, Math.PI, { force: true, name: 'Konsulado de Mar' });

 placeMarr('mar_portal_arcade', 28, -118, Math.PI, { force: true, name: 'Arkadaz de Porta' });
 placeMarr('vern_port_warehouse', 54, -118, Math.PI, { force: true, name: 'Gueraus de Porta (East)' });
 placeMarr('mar_smuggler_warehouse', 82, -118, Math.PI, { force: true, name: 'Gueraus de Marchondaz' });
 placeMarr('mar_cantina', 106, -118, Math.PI, { force: true, name: 'Tavarnaz de Selarz' });
 placeMarr('vern_sailors_tavern', 128, -118, Math.PI, { force: true, name: 'Posada de Ankor' });

 // Kosta de Xedaz Waterfront: Boatyards, Smuggler Lofts & Rropaguoka (Ropewalk)
 placeMarr('mar_boatyard_slip', 184, -132, Math.PI + 0.12, { force: true, name: 'Atarazana & Slip de Bodabildarz' });
 placeMarr('mar_smuggler_warehouse', 212, -136, Math.PI + 0.12, { force: true, name: 'Gueraus de Kosta' });
 placeMarr('vern_ropewalk', 252, -142, 0.14, { force: true, name: 'Rropaguoka (140m Ropewalk)' });
 placeMarr('mar_fishers_row', 292, -150, Math.PI + 0.14, { force: true, name: 'Rro de Peskadarz' });
 placeMarr('mar_boatyard_slip', 322, -156, Math.PI + 0.14, { force: true, name: 'Atarazana Esta' });

 // III. Monumental Civic Axis on Isla de Sidi Olda (Templa de Son & Si, Isqer Greta, Palas de Govarnar)
 cityFlat(-46, -74, 22, 22, 3.6, 0);
 placeMarr('mar_sea_temple', -46, -74, 0, { force: true, y: 3.6, name: 'Templa de Son & Si' });
 cityFlat(-46, -34, 24, 20, 3.6, 0);
 placeMarr('mar_markita_plaza', -46, -34, 0, { noOcc: true, y: 3.6, name: 'Isqer Greta (Grand Plaza)' });
 placeMarr('mar_fountain_basin', -46, -34, 0, { noOcc: true, y: 3.6, name: 'Fontin de Isqer Greta' });
 cityFlat(-46, 34, 34, 44, 3.6, 0);
 placeMarr('mar_governor_palace', -46, 34, Math.PI, { force: true, y: 3.6, name: 'Palas de Govarnar' });
 cityFlat(-46, 98, 14, 14, 3.6, 0);
 placeMarr('vern_guard_tower', -46, 98, 0, { force: true, y: 3.6, name: 'Qartar de Garizon' });

 // Markita de Porta (Isla de Marchondaz) & Markita de Xedaz (De Xedaz) & Markita de Marxa (East Qartar Lo)
 placeMarr('mar_markita_plaza', 74, -32, 0, { noOcc: true, name: 'Markita de Porta' });
 placeMarr('mar_mercado_hall', 102, -32, 0, { force: true, name: 'Lonja de Markita de Porta' });
 placeMarr('mar_markita_plaza', 248, -78, 0.08, { noOcc: true, name: 'Markita de Xedaz' });
 placeMarr('mar_mercado_hall', 278, -78, 0.08, { force: true, name: 'Lonja de Markita de Xedaz' });
 placeMarr('mar_markita_plaza', 214, 318, -0.08, { noOcc: true, name: 'Markita de Marxa' });
 placeMarr('mar_mercado_hall', 244, 318, -0.08, { force: true, name: 'Lonja de Markita de Marxa' });

 // Park Fountains & Pavilions (Gardon de Pilotaz, Gardon de Kanal, Gardon de Guesta)
 placeMarr('mar_gardon_park', -296, -150, 0.2, { noOcc: true, name: 'Gardon de Pilotaz' });
 placeMarr('mar_gardon_park', 92, 252, 0, { noOcc: true, name: 'Gardon de Kanal' });
 placeMarr('mar_gardon_park', -286, 322, 0, { noOcc: true, name: 'Gardon de Guesta' });

 // 26 Full-Span Arched Canal Bridges (y = 0.45 with span = B.span so piers sit in water and abutments rest on both banks)
 for (const B of MAR_BRIDGES) {
  placeMarr('mar_canal_bridge', B.x, B.z, B.ry, { allowWater: true, noOcc: true, y: 0.45, span: B.span, name: B.name });
 }

 // Outer Perimeter Wall Bastions/Towers, Sentry Garitas & Fortified City Gates along Muraya de Marr
 for (const T of MAR_BASTIONS) {
  const yb = Math.max(2.6, rawTerrainH(T.x, T.z));
  const tKey = T.kind === 'bastion' ? 'mar_castillo_bastion' : 'mar_garita_watch';
  placeMarr(tKey, T.x, T.z, 0, { allowWater: true, force: true, y: yb, name: T.name });
 }
 for (let i = 0; i < MAR_GARITAS.length; i++) {
  const G = MAR_GARITAS[i];
  placeMarr('mar_garita_watch', G[0], G[1], G[2], { allowWater: true, noOcc: true, y: Math.max(2.6, rawTerrainH(G[0], G[1])), name: 'Garita de Guach #' + (i + 1) });
 }
 for (const G of MAR_GATES) {
  if (G.waterGate) {
   const sp = G.span == null ? 44 : G.span;
   placeMarr('mar_canal_bridge', G.x, G.z, G.ry, { allowWater: true, noOcc: true, y: 0.45, span: sp, name: G.name });
  } else {
   placeMarr('mar_city_gate', G.x, G.z, G.ry, { allowWater: true, force: true, y: 2.8, name: G.name });
  }
 }
})();

// =========================================================================
// 2. INNER 3 ISLANDS (Isla de Sidi Olda, Isla de Marchondaz, Isla de Kanal)
// =========================================================================
(function placeMarrInnerIslands() {
 const I1_NAMES = {
  '0,0': 'Korta de Viejaz', '0,1': 'Rro de Notarz', '0,2': 'Korta de Arkaz',
  '1,4': 'Qartar de Garizon', '0,5': 'Korta de Oficialz', '2,5': 'Korta de Chanceria',
  '0,6': 'Korta de Moneda', '1,6': 'Gueraus de Sauta'
 };
 for (const cell of ISLAND1.cells) {
  const ci = cell.i, cj = cell.j;
  if (ci >= 1 && cj <= 3) continue; // Civic axis reserved for Templa, Isqer Greta & Palas de Govarnar
  const qRaw = (ci === 0 && cell.merged === 'u' && cj <= 3)
   ? [ISLAND1.N[0][cj], ISLAND1.N[1][cj], ISLAND1.N[1][cj + 1], ISLAND1.N[0][cj + 1]]
   : cell.quad;
  placeCuadraBlock(shrinkPolyTowardCentroid(qRaw, 0.8), {
   patio: cj < 4 ? 'pleasure' : 'vegetable',
   wealth: 'middle',
   name: I1_NAMES[ci + ',' + cj] || ('Korta de Sidi Olda ' + ci + '-' + cj)
  });
 }

 const I2_NAMES = {
  '0,0': 'Korta de Gilda', '2,0': 'Korta de Gueraus',
  '0,1': 'Korta de Bayz', '0,2': 'Korta de Lonja'
 };
 for (const cell of ISLAND2.cells) {
  const ci = cell.i, cj = cell.j;
  if (ci >= 1 && (cj === 1 || cj === 2)) continue; // Reserved for Markita de Porta band
  let qRaw = cell.quad;
  if (ci === 0 && cell.merged === 'u' && (cj === 1 || cj === 2)) {
   qRaw = [ISLAND2.N[0][cj], ISLAND2.N[1][cj], ISLAND2.N[1][cj + 1], ISLAND2.N[0][cj + 1]];
  } else if (ci >= 1 && cj === 0 && cell.merged === 'v') {
   // Prevent vertical merge at cj=0 from crossing into reserved ISLAND2_BAND (cj=1..2)
   qRaw = [ISLAND2.N[ci][0], ISLAND2.N[ci + 1][0], ISLAND2.N[ci + 1][1], ISLAND2.N[ci][1]];
  }
  placeCuadraBlock(shrinkPolyTowardCentroid(qRaw, 0.8), {
   patio: (ci + cj) % 2 === 0 ? 'pleasure' : 'working',
   wealth: 'middle',
   name: I2_NAMES[ci + ',' + cj] || ('Korta de Marchondaz ' + ci + '-' + cj)
  });
 }

 const I3_NAMES = {
  '0,0': 'Korta de Son', '2,0': 'Korta de Silka', '0,1': 'Korta de Kanal',
  '0,2': 'Korta de Tonelz', '0,3': 'Rro de Istupaz', '0,4': 'Bodegaz de Rrom', '0,5': 'Korta de Alambik'
 };
 for (const cell of ISLAND3.cells) {
  const ci = cell.i, cj = cell.j;
  if (ci >= 1 && (cj === 4 || cj === 5)) continue; // Reserved for Gardon de Kanal band (at x=113, z=229)
  let qRaw = cell.quad;
  if (ci === 0 && cell.merged === 'u' && (cj === 4 || cj === 5)) {
   qRaw = [ISLAND3.N[0][cj], ISLAND3.N[1][cj], ISLAND3.N[1][cj + 1], ISLAND3.N[0][cj + 1]];
  } else if (ci >= 1 && cj === 3 && cell.merged === 'v') {
   // Prevent vertical merge at cj=3 from crossing into reserved ISLAND3_BAND (cj=4..5) at (113, 229)!
   qRaw = [ISLAND3.N[ci][3], ISLAND3.N[ci + 1][3], ISLAND3.N[ci + 1][4], ISLAND3.N[ci][4]];
  }
  placeCuadraBlock(shrinkPolyTowardCentroid(qRaw, 0.8), {
   patio: cj >= 3 ? 'vegetable' : 'pleasure',
   wealth: 'middle',
   name: I3_NAMES[ci + ',' + cj] || ('Korta de Kanal ' + ci + '-' + cj)
  });
 }
})();

// =========================================================================
// 3. LEFT BANK (Qartar de Gardonz 3x4 Mansion Estates), RIGHT BANK (De Xedaz 3x4 Cuadras) & SOUTHERN QUARTER
// =========================================================================
(function placeMarrBanksAndBands() {
 // Left Bank: 12 Mansion Blocks x 4 Walled Estates = 48 Walled Mansion Estates + Corner Townhouses
 const ESTATE_COMPANIONS = ['mar_captains_house', 'mar_consulado_house', 'mar_townhouse_iron', 'mar_corner_french', 'mar_corner_mirador', 'mar_casa_patio'];
 for (let bi = 0; bi < LEFT_MANSION_BLOCKS.length; bi++) {
  const B = LEFT_MANSION_BLOCKS[bi];
  const ang = quadAngle(B.quad);
  const blockR = orthoRectInsideQuad(B.quad, ang, 0.8);
  const ortho = blockR.quad;
  const ux = Math.cos(ang), uz = Math.sin(ang);
  const vx = -uz, vz = ux;
  for (let ix = 0; ix < 2; ix++) {
   for (let iy = 0; iy < 2; iy++) {
    const lotQ = [
     bilerpQuad(ortho, ix * 0.5, iy * 0.5),
     bilerpQuad(ortho, (ix + 1) * 0.5, iy * 0.5),
     bilerpQuad(ortho, (ix + 1) * 0.5, (iy + 1) * 0.5),
     bilerpQuad(ortho, ix * 0.5, (iy + 1) * 0.5)
    ];
    const R = orthoRectInsideQuad(lotQ, ang, 0.8);
    if (inWater(R.cx, R.cz, 2.0)) continue;
    MAR_ESTATE_RECTS.push({ cx: R.cx, cz: R.cz, wh: R.wh, hh: R.hh, ang });
    const mKey = POOL_RICH[(bi * 4 + ix * 2 + iy) % POOL_RICH.length];
    const rySide = iy === 0 ? -ang + Math.PI : -ang;
    const uShift = R.wh >= 18.5 ? (ix === 0 ? 4.4 : -4.4) : 0;
    const vShift = iy === 0 ? -Math.max(0, R.hh - 12.5) : Math.max(0, R.hh - 12.5);
    placeMarr(mKey, R.cx + uShift * ux + vShift * vx, R.cz + uShift * uz + vShift * vz, rySide, {
     pad: -0.35,
     name: (ix === 0 && iy === 0) ? B.name : (B.name + ' Estate ' + (ix * 2 + iy + 1))
    });
    // Place an adjoining corner townhouse/pavilion on wide estates if space is free
    if (R.wh >= 18.5) {
     const cKey = ESTATE_COMPANIONS[(bi * 4 + ix * 3 + iy) % ESTATE_COMPANIONS.length];
     const uComp = ix === 0 ? -(R.wh - 7.8) : (R.wh - 7.8);
     placeMarr(cKey, R.cx + uComp * ux + vShift * vx, R.cz + uComp * uz + vShift * vz, rySide, { pad: -0.35 });
    }
   }
  }
 }

 // Right Bank: 12 Dense Tenement Cuadra Blocks in De Xedaz (The Shades)
 for (let bi = 0; bi < RIGHT_CUADRA_BLOCKS.length; bi++) {
  const B = RIGHT_CUADRA_BLOCKS[bi];
  const ang = quadAngle(B.quad);
  placeCuadraBlock(B.quad, {
   ang,
   patio: B.patio,
   shades: true,
   wealth: 'middle',
   name: B.name
  });
 }

 // All 6 Grid-Break Bands
 for (const band of [ISLAND2_BAND, ISLAND3_BAND, LEFT_BAND1, LEFT_BAND2, RIGHT_BAND3, RIGHT_BAND4]) {
  for (let li = 0; li < band.lots.length; li++) {
   const L = band.lots[li];
   placeCuadraBlock(L.outer, {
    ang: L.ang,
    patio: L.patio,
    wealth: L.wealth,
    shades: band === RIGHT_BAND3,
    name: L.name
   });
  }
 }

 // Platted Southern Walled Quarter (22 colonial cuadra blocks across all 4 bands inside the new South Wall!)
 for (const S of SOUTH_DELTA_BLOCKS) {
  placeCuadraBlock(S.quad, {
   patio: S.patio,
   wealth: S.wealth,
   shades: !!S.shades,
   name: S.name
  });
 }

 // 4 Extramuros Fincas outside the new South Wall
 const FINCA_BLDGS = ['mar_hacienda', 'mar_azulejo_villa', 'mar_rum_bodega', 'mar_creole_cottage', 'vern_farmhouse', 'vern_byre'];
 for (let fi = 0; fi < EXTRAMUROS_FINCAS.length; fi++) {
  const F = EXTRAMUROS_FINCAS[fi];
  for (let ix = 0; ix < 3; ix++) {
   for (let iy = 0; iy < 2; iy++) {
    const subQ = [
     bilerpQuad(F.quad, ix / 3, iy / 2),
     bilerpQuad(F.quad, (ix + 1) / 3, iy / 2),
     bilerpQuad(F.quad, (ix + 1) / 3, (iy + 1) / 2),
     bilerpQuad(F.quad, ix / 3, (iy + 1) / 2)
    ];
    const R = orthoRectInsideQuad(subQ, 0, 2.0);
    if (inWater(R.cx, R.cz, 2.0)) continue;
    if (iy === 1 && ix === 1) {
     placeMarr('mar_patio_vegetable', R.cx, R.cz, 0, { noOcc: true, name: F.name + ' — Orchard Court' });
    } else {
     const fKey = FINCA_BLDGS[(fi * 6 + ix * 2 + iy) % FINCA_BLDGS.length];
     placeMarr(fKey, R.cx, R.cz, 0, { pad: -0.35, name: (ix === 1 && iy === 0) ? F.name : null });
    }
   }
  }
 }
})();
