// ================================================================= ARCODIGA — Eternian 6-Fold Hexagonal Honeycomb Grid (ADG_HEX) [G data]
// Plans Dī-Gā Wài-Sī (Z6 Superintendency Cantonment) on a true flat-Z hexagonal honeycomb sized directly to kits/eternian's
// hexagonal architecture (etHex(R) in kits/eternian/src/46-et-civic-kit.js: vertices at multiples of 60 deg, flat faces +-z,
// front doors on face 1 facing +z, invariant under 60-degree rotations ry = m * PI / 3):
//   - 15 contiguous Macro Hex Cells (circumradius R = 56.0 m, apothem 48.50 m, center-to-center 97.00 m) centered on et_fort
//     at (1205.0, 555.0), strictly east/south of Arcodiga's x <= 1022 Stiffening Wing bulkhead (0 arcology clipping!).
//   - Deduplicated hexagonal street graph (avenues around et_fort & spine, main hex streets between wards, 3.6 m inner hex
//     court loops + 3 radial alleys inside residential/artisanal honeycomb wards).
//   - Multi-tier hexagonal sub-tiling: 1 + 6 + 15 honeycomb wards (et_hex_house, et_hex_hut, hex v=1 shophouse/bakehouse/smithy/
//     weaver/brewhouse, et_tea_house, et_healer, et_granary), 7-villa rosettes (et_hex_villa), Censorate civic hex, Tide-Clock
//     hex hub, Charter-Gate hex market, and Kiln/Celadon works hex.
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const ADG_HEX = (function(){
 const PI = Math.PI;
 const SQRT3 = Math.sqrt(3);
 const R_MACRO = 56.0;
 const AP_MACRO = R_MACRO * SQRT3 * 0.5;
 const CX0 = 1205.0;
 const CZ0 = 555.0;

 /* Axial (q, r) -> world (x, z) for flat-Z hexagons matching kits/eternian etHex(R) */
 function axialToWorld(q, r){
  return [
   +(CX0 + 1.5 * R_MACRO * q).toFixed(3),
   +(CZ0 + SQRT3 * R_MACRO * (r + 0.5 * q)).toFixed(3)
  ];
 }

 /* Outward normal angle of flat-Z hexagon face k (k = 0..5; k = 1 is +z South) */
 function faceAngle(k){
  const kk = ((k % 6) + 6) % 6;
  return PI / 6 + kk * (PI / 3);
 }

 /* Exact Three.js rotation.y so local +z (Eternian door/shop face 1) faces outward along face k.
    Always an exact integer multiple of PI / 3 (60 deg), mapping etHex(R) cleanly onto itself! */
 function ryForFace(k){
  return PI * 0.5 - faceAngle(k);
 }

 /* Flat-Z hexagon vertices around (cx, cz) with circumradius R */
 function hexVerts(cx, cz, R){
  const out = [];
  for (let i = 0; i < 6; i++) {
   const a = i * (PI / 3);
   out.push([cx + R * Math.cos(a), cz + R * Math.sin(a)]);
  }
  return out;
 }

 /* 15 contiguous Macro Hex Cells forming Dī-Gā Wài-Sī */
 const CELLS = [
  { q:  0, r:  0, id: 'hex_fort',       kind: 'fort_bastion',        name: 'Outer Dam Superintendency Bastion Hex' },
  { q:  0, r: -1, id: 'hex_censorate',  kind: 'censorate_civic',     name: 'Censorate, Ministry & Examination Hex' },
  { q:  0, r: -2, id: 'hex_north_gate', kind: 'charter_gate_market', name: 'North Charter-Gate & Bonded Market Hex' },
  { q: -1, r:  0, id: 'hex_clock',      kind: 'clock_honeycomb',     name: 'Tsunami-Tide Clock & Clerks Honeycomb' },
  { q: -1, r: -1, id: 'hex_west_disp',  kind: 'honeycomb_ward',      name: 'West Dispatch & Weavers Honeycomb', variant: 0 },
  { q: -1, r:  1, id: 'hex_sw_garr',    kind: 'honeycomb_ward',      name: 'Southwest Garrison & Bakers Honeycomb', variant: 1 },
  { q: -2, r: -1, id: 'hex_nw_craft',   kind: 'honeycomb_ward',      name: 'Northwest Gorge-Brow Shophouse Honeycomb', variant: 2 },
  { q: -2, r:  0, id: 'hex_w_lift',     kind: 'lift_staging_hex',    name: 'Girder-Lift Upper Staging & Barracks Hex' },
  { q:  0, r:  1, id: 'hex_s_parade',   kind: 'parade_granary_hex',  name: 'South Bastion Parade & Granary Hex' },
  { q:  1, r: -2, id: 'hex_ne_scholar', kind: 'honeycomb_ward',      name: 'Northeast Historians & Printers Honeycomb', variant: 3 },
  { q:  1, r: -1, id: 'hex_villas',     kind: 'villa_rosette',       name: 'Ranked Officials Hexagonal Villa Rosette' },
  { q:  1, r:  0, id: 'hex_kilns',      kind: 'kiln_works_hex',      name: 'State Kiln, Porcelain & Celadon Works Hex' },
  { q:  1, r:  1, id: 'hex_se_ag',      kind: 'terrace_ag_hex',      name: 'Southeast Tea-Garden & Miners Honeycomb', variant: 0 },
  { q:  2, r: -2, id: 'hex_e_ward',     kind: 'honeycomb_ward',      name: 'East Assay Clerks & Brewers Honeycomb', variant: 4 },
  { q:  2, r: -1, id: 'hex_e_miners',   kind: 'terrace_ag_hex',      name: 'East Skarn-Adit Miners Honeycomb', variant: 1 }
 ];

 function hashU(a, b, c){
  return KRAND.unit(KRAND.hash(ADG_SITE.SEED ^ 0x6e71, a | 0, b | 0, c | 0));
 }

 /* Build deduplicated hexagonal street network + inner court loops + paved hex plaza records */
 function buildHexWaysAndPlazas(){
  const edgeMap = new Map();
  const ways = [];
  const plazas = [];

  function ptKey(p){
   return Math.round(p[0] * 10) + ',' + Math.round(p[1] * 10);
  }

  function addSeg(a, b, kind, tag){
   if (ADG_SITE.inArcologyKeepout(a[0], a[1], 4.0) || ADG_SITE.inArcologyKeepout(b[0], b[1], 4.0)) return;
   const ka = ptKey(a), kb = ptKey(b);
   const ek = ka < kb ? (ka + '|' + kb) : (kb + '|' + ka);
   const rank = { avenue: 4, main: 3, side: 2, lane: 1, alley: 0 };
   const prev = edgeMap.get(ek);
   if (!prev || (rank[kind] || 0) > (rank[prev.kind] || 0)) {
    edgeMap.set(ek, { kind: kind, pts: [[+a[0].toFixed(2), +a[1].toFixed(2)], [+b[0].toFixed(2), +b[1].toFixed(2)]], tag: tag });
   }
  }

  for (let i = 0; i < CELLS.length; i++) {
   const C = CELLS[i];
   const ctr = axialToWorld(C.q, C.r);
   const cx = ctr[0], cz = ctr[1];
   const V = hexVerts(cx, cz, R_MACRO);
   const isCore = (C.q === 0 && (C.r === 0 || C.r === -1 || C.r === -2));
   const outerKind = isCore ? 'avenue' : 'main';

   for (let k = 0; k < 6; k++) {
    addSeg(V[k], V[(k + 1) % 6], outerKind, C.name + ' Edge ' + k);
   }

   /* Inner hexagonal court alley + 3 radial entry lanes inside dense honeycomb & villa wards */
   if (C.kind === 'honeycomb_ward' || C.kind === 'clock_honeycomb' || C.kind === 'villa_rosette') {
    const rIn = C.kind === 'villa_rosette' ? 20.5 : 27.2;
    const Vin = hexVerts(cx, cz, rIn);
    for (let k = 0; k < 6; k++) {
     ways.push({ kind: 'lane', pts: [[+Vin[k][0].toFixed(2), +Vin[k][1].toFixed(2)], [+Vin[(k + 1) % 6][0].toFixed(2), +Vin[(k + 1) % 6][1].toFixed(2)]], tag: C.name + ' Inner Hex Loop' });
    }
    for (let m = 0; m < 3; m++) {
     const idx = m * 2;
     ways.push({ kind: 'alley', pts: [[+Vin[idx][0].toFixed(2), +Vin[idx][1].toFixed(2)], [+V[idx][0].toFixed(2), +V[idx][1].toFixed(2)]], tag: C.name + ' Radial Alley' });
    }
    plazas.push({ x: cx, z: cz, r: C.kind === 'clock_honeycomb' ? 14.5 : 10.2, kind: C.kind });
   } else if (C.kind === 'censorate_civic' || C.kind === 'charter_gate_market' || C.kind === 'parade_granary_hex' || C.kind === 'kiln_works_hex') {
    plazas.push({ x: cx, z: cz, r: 24.0, kind: C.kind });
   } else if (C.kind === 'fort_bastion') {
    plazas.push({ x: cx, z: cz, r: 46.2, kind: 'fort_glacis' });
   }
  }

  edgeMap.forEach(function(v){ ways.push(v); });
  return { ways: ways, plazas: plazas };
 }

 /* Candidate pools of Eternian hexagonal & aligned pieces */
 const HONEYCOMB_CENTERS = [
  ['eternian:et_tea_house', 0, 'Ward Hexagonal Tea Pavilion'],
  ['eternian:et_healer',    0, 'Ward Hexagonal Apothecary & Infirmary'],
  ['eternian:et_granary',   0, 'Ward Hexagonal Tribute Granary'],
  ['eternian:et_weaver',    1, 'Ward Hexagonal Brocade Loom-House'],
  ['eternian:et_brewhouse', 1, 'Ward Hexagonal Millet-Wine Brewhouse']
 ];

 const HONEYCOMB_RING1 = [
  ['eternian:et_hex_house', 0],
  ['eternian:et_shophouse', 1],
  ['eternian:et_bakehouse', 1],
  ['eternian:et_smithy',    1],
  ['eternian:et_weaver',    1],
  ['eternian:et_hex_house', 0]
 ];

 const HONEYCOMB_FRONT = [
  ['eternian:et_shophouse', 1],
  ['eternian:et_hex_house', 0],
  ['eternian:et_bakehouse', 1],
  ['eternian:et_hex_hut',   0],
  ['eternian:et_smithy',    1],
  ['eternian:et_hex_house', 0]
 ];

 /* Generate exact hexagonal building specs for all 15 Macro Hex Cells */
 function buildHexSpecs(){
  const specs = [];
  function push(key, x, z, ry, v, role, extra){
   if (ADG_SITE.inArcologyKeepout(x, z, 6.0)) return;
   const rec = {
    key: key,
    x: +x.toFixed(2),
    z: +z.toFixed(2),
    ry: +ry.toFixed(4),
    v: v == null ? 0 : (v | 0),
    zone: 'Z6',
    hexAligned: true,
    role: role || key
   };
   if (extra) {
    for (const k in extra) rec[k] = extra[k];
   }
   specs.push(rec);
  }

  function addOuterHexRing(cx, cz, apDist, tOff, cellIdx, skipFaces, includeCorners){
   for (let k = 0; k < 6; k++) {
    if (skipFaces && skipFaces.indexOf(k) >= 0) continue;
    const ph = faceAngle(k);
    const nx = Math.cos(ph), nz = Math.sin(ph);
    const tx = -nz, tz = nx;
    const ry = ryForFace(k);
    for (let s = -1; s <= 1; s += 2) {
     const pickIdx = Math.floor(hashU(cellIdx, k * 3 + (s > 0 ? 1 : 0), 19) * HONEYCOMB_FRONT.length) % HONEYCOMB_FRONT.length;
     const pk = HONEYCOMB_FRONT[pickIdx];
     push(pk[0], cx + nx * apDist + tx * s * tOff, cz + nz * apDist + tz * s * tOff, ry, pk[1], 'Honeycomb Street-Front Hex Dwelling');
    }
   }
   if (includeCorners) {
    /* Place compact hex huts / corner turrets on the 3 non-alley vertices (a = 60, 180, 300 deg -> idx 1, 3, 5) */
    for (let m = 0; m < 3; m++) {
     const vIdx = m * 2 + 1;
     const a = vIdx * (PI / 3);
     const rc = 39.8;
     const isTurret = ((cellIdx + m) % 3 === 0);
     const key = isTurret ? 'eternian:et_hex_hut' : 'eternian:et_shophouse';
     const v = isTurret ? 0 : 1;
     push(key, cx + rc * Math.cos(a), cz + rc * Math.sin(a), ryForFace(vIdx), v, 'Honeycomb Corner Hex Pavilion');
    }
   }
  }

  for (let ci = 0; ci < CELLS.length; ci++) {
   const C = CELLS[ci];
   const ctr = axialToWorld(C.q, C.r);
   const cx = ctr[0], cz = ctr[1];

   if (C.kind === 'fort_bastion') {
    /* Central 6-fold Frontier Fort (R_moat = 48 m inside R_macro = 56 m hex ring!) */
    push('eternian:et_fort', cx, cz, 0.0, 0, 'Di-Ga Wai-Si Hexagonal Outer Dam Superintendency Bastion');
   } else if (C.kind === 'censorate_civic') {
    /* State Censorate, Ministry, Registry, Examination Hall & Relic Conservatory */
    push('eternian:et_ministry',         cx,        cz,        0.0,       0, 'Outer Dam Superintendency Censorate & Hydrography Ministry', { interiorId: 'adg.hall.superintendency' });
    push('eternian:et_talking_head',     cx,        cz + 16.5, 0.0,       0, 'Closed-Eyed Ancestor Oracle Plinth');
    push('eternian:et_examination_hall', cx - 29.0, cz - 14.0, ryForFace(3), 0, 'Hydrographic & Ancient-Script Hexagonal Examination Hall');
    push('eternian:et_relic_hall',       cx + 29.0, cz - 14.0, PI,        0, 'Catalogued Arcodiga Machine-Relic Conservatory');
    push('eternian:et_registry',         cx,        cz - 33.5, PI,        0, 'State Salvage Patent & Farport Shipping Registry');
    push('eternian:et_ancestor_gallery', cx - 31.0, cz + 18.0, ryForFace(2), 0, 'Closed-Eyed Ancestor Mask & Expedition Memorial Gallery');
    push('eternian:et_historians_house', cx + 30.0, cz + 18.0, ryForFace(0), 0, 'Order of Historians Crookshore Chronicle House');
    push('eternian:et_mask_house',       cx + 18.0, cz + 35.5, 0.0,       0, 'Closed-Eyed Funerary Bronze & Stone Mask Workshop');
    push('eternian:et_healer',           cx - 18.0, cz + 35.5, 0.0,       0, 'Superintendency Censorate Apothecary');
   } else if (C.kind === 'charter_gate_market') {
    /* North Entry Hex facing Z4 Charter Market */
    push('eternian:et_gate',        cx,        cz - 41.5, PI, 0, 'Cantonment North Charter-Boundary Ceremonial Gate');
    push('eternian:et_market_hall', cx,        cz - 6.0,  0.0, 0, 'Hexagonal Porcelain, Tea & Cassiterite Market Hall');
    push('eternian:et_inn',         cx - 28.0, cz + 12.0, ryForFace(2), 1, 'Hexagonal Caravan & Mule-Train Post-Inn');
    push('eternian:et_warehouse',   cx + 28.0, cz + 12.0, ryForFace(0), 0, 'Hexagonal Bonded Tea & Tin Store');
    addOuterHexRing(cx, cz, 36.6, 7.4, ci, [4, 0, 2], false);
   } else if (C.kind === 'clock_honeycomb') {
    /* Bronze Tsunami-Tide Clock & Clerks' Honeycomb */
    push('eternian:et_clock',        cx,       cz,       0.0, 0, 'Bronze Tsunami-Tide & Santa Cristina Sync Clock-Tower');
    push('eternian:et_shrine_niche', cx,       cz + 8.5, 0.0, 0, 'Cantonment Tide-Watch Lantern Shrine Niche');
    for (let k = 0; k < 6; k++) {
     if (k === 1 || k === 4) continue;
     const ph = faceAngle(k);
     const pk = HONEYCOMB_RING1[(k + ci) % HONEYCOMB_RING1.length];
     push(pk[0], cx + Math.cos(ph) * 18.2, cz + Math.sin(ph) * 18.2, ryForFace(k), pk[1], 'Tide-Clock Inner Court Hex House');
    }
    addOuterHexRing(cx, cz, 36.6, 7.4, ci, null, true);
   } else if (C.kind === 'honeycomb_ward') {
    /* Full 22-Lot Hexagonal Honeycomb Ward (1 Center + 6 Inner Ring + 12 Mid-Face + 3 Corner Hexes) */
    const cPick = HONEYCOMB_CENTERS[(C.variant || 0) % HONEYCOMB_CENTERS.length];
    push(cPick[0], cx, cz, ryForFace(1), cPick[1], cPick[2]);
    for (let k = 0; k < 6; k++) {
     const ph = faceAngle(k);
     const pk = HONEYCOMB_RING1[(k + (C.variant || 0)) % HONEYCOMB_RING1.length];
     push(pk[0], cx + Math.cos(ph) * 16.4, cz + Math.sin(ph) * 16.4, ryForFace(k), pk[1], 'Honeycomb Inner-Ring Hex House');
    }
    addOuterHexRing(cx, cz, 36.6, 7.4, ci, null, true);
    /* Add a printer & butcher on variants so all urban Eternian trades are represented */
    if (C.variant === 3) push('eternian:et_printer', cx, cz - 26.5, PI, 0, 'Censorate Block-Printer & Almanac Shop');
    if (C.variant === 1) push('eternian:et_butcher', cx, cz + 26.5, 0.0, 0, 'Garrison Salted-Goat & Pork Provisioner');
   } else if (C.kind === 'lift_staging_hex') {
    /* West Gorge-Brow Hex linking to East Buttress E2 Girder-Lift */
    push('eternian:et_warehouse', cx,        cz,        ryForFace(3), 0, 'Girder-Lift Upper Coal & Mast Hexagonal Warehouse');
    push('eternian:et_barracks',  cx + 24.0, cz - 14.0, PI,           0, 'Painted Cantonment Halberdiers Cliff-Watch Barracks');
    push('eternian:et_granary',   cx + 22.0, cz + 18.0, 0.0,          0, 'Garrison Emergency Grain Hex-Vault');
    addOuterHexRing(cx, cz, 36.6, 7.4, ci, [0, 5], false);
   } else if (C.kind === 'parade_granary_hex') {
    /* South Bastion Gate Parade & Granary Hex */
    push('eternian:et_granary',      cx - 26.0, cz - 12.0, ryForFace(0), 0, 'Cantonment Tribute-Rice & Barley Hexagonal Granary');
    push('eternian:et_warehouse',    cx + 26.0, cz - 12.0, ryForFace(2), 0, 'Bastion Munitions & Paktong Hexagonal Store');
    push('eternian:et_barracks',     cx,        cz + 22.0, PI,           0, 'South Bastion Halberdier Reserve Quadrangle');
    addOuterHexRing(cx, cz, 37.2, 7.4, ci, [4, 1], true);
   } else if (C.kind === 'villa_rosette') {
    /* 7-Hex Rosette of Walled Hexagonal Celadon-Ogee Villas (et_hex_villa, 24x24 m!) */
    push('eternian:et_hex_villa', cx, cz, 0.0, 0, 'Superintendent-General Walled Hexagonal Garden Villa');
    for (let k = 0; k < 6; k++) {
     const ph = faceAngle(k);
     const rV = 30.5;
     if (k === 1 || k === 4) {
      push('eternian:et_official_villa', cx + Math.cos(ph) * rV, cz + Math.sin(ph) * rV, ryForFace(k), k === 4 ? 1 : 0, 'Senior Censor Ranked Courtyard Villa');
     } else {
      push('eternian:et_hex_villa', cx + Math.cos(ph) * rV, cz + Math.sin(ph) * rV, ryForFace(k), 0, 'Magistrate Hexagonal Celadon-Ogee Villa');
     }
    }
   } else if (C.kind === 'kiln_works_hex') {
    /* Hexagonal Kiln Court, Celadon Tile Works, Porcelain & Paper Mill */
    push('eternian:et_kiln',       cx - 18.0, cz - 14.0, ryForFace(4), 0, 'Hexagonal Bottle-Kiln Brick & Coke Court');
    push('eternian:et_tile_works', cx + 18.0, cz - 14.0, ryForFace(4), 0, 'Hexagonal Celadon Swept-Eave Tile Works');
    push('eternian:et_porcelain',  cx - 20.0, cz + 18.0, 0.0,          0, 'State-Stamped Insulator & Celadon Kilnworks');
    push('eternian:et_paper_mill', cx + 18.0, cz + 18.0, 0.0,          0, 'Bark-Fibre Telemetry Ledger & Chart Paper Mill');
    push('eternian:et_tannery',    cx,        cz + 35.0, 0.0,          0, 'Mule-Harness & Bellows Leather Tannery');
    addOuterHexRing(cx, cz, 37.4, 7.4, ci, [1, 2, 0], false);
   } else if (C.kind === 'terrace_ag_hex') {
    /* Southern & Eastern Agricultural / Miners Hex Cells */
    if ((C.variant || 0) === 0) {
     push('eternian:et_tea_garden', cx - 16.0, cz - 12.0, 0.0, 0, 'Cloud-Mist Superintendency Tea & Lacquer Garden');
     push('eternian:et_terraces',   cx + 16.0, cz - 12.0, 0.0, 0, 'Walled Cantonment Buckwheat & Cabbage Terraces');
     push('eternian:et_goat_fold',  cx - 15.0, cz + 15.0, 0.0, 0, 'Cantonment Crag-Goat Dairy Fold');
     push('eternian:et_stock_pens', cx + 15.0, cz + 15.0, 0.0, 0, 'Dzagh-Vardzi Pack-Mule & Salt-Pork Corrals');
    } else {
     push('eternian:et_farmstead',       cx - 14.0, cz - 8.0,  0.0, 0, 'Hexagonal Upland Silt-Brick Farmstead');
     push('eternian:et_mushroom_cellar', cx + 18.0, cz - 12.0, 0.0, 0, 'Dark-Grown Cave-Fungus Provision Cellar');
     push('eternian:et_smithy',          cx + 18.0, cz + 10.0, ryForFace(0), 1, 'Adit Drill-Steel & Pickaxe Hexagonal Forge');
    }
    addOuterHexRing(cx, cz, 37.2, 7.4, ci, null, false);
   }
  }

  /* West Gorge-Brow Girder-Lift Spur (x = 892..965, z = 415..470) & Eastern Skarn Mine Headhouses (x = 1465..1485) */
  push('eternian:et_tube_station', 892,  415, ryForFace(3), 0, 'East Buttress E2 Pneumatic Dispatch & Girder-Lift Hex Station');
  push('eternian:et_wall_tower',   892,  458, ryForFace(3), 0, 'Gorge-Rim Semaphore & Lee-Wharf Watchtower');
  push('eternian:et_quarry',      1458,  585, ryForFace(2), 0, 'Dressed Columnar-Basalt Ashlar & Plinth Quarry');
  push('eternian:et_mine',        1472,  495, ryForFace(2), 0, 'Skarn Cassiterite-Tin & Magnetite Adit Headhouse');
  push('eternian:et_mine',        1478,  645, ryForFace(2), 1, 'Crookshore Collar Bituminous Steam-Coal Seam Mine');

  return specs;
 }

 /* ================================================================ Hexagonal Harbour Mole (Z6_WHARF)
    The mole is one big flat-Z hexagon (ADG_SITE.MOLE_HEX, face 5 flush on the shore). Inside it: a quay ring avenue
    (apothem ringR * sqrt3/2), and a honeycomb of flat-Z street cells (cellR) clipped to that ring, on the same lattice
    orientation as the cantonment. Full cells take a block recipe (godown, twin sheds, three-sided court, customs, lift
    foot); cells cut by the ring take one pulled-in piece; the five water faces carry the quay pieces facing the sea and
    the shore face carries sheds facing inward, clear of the girder-lift pad and the harbour road. Every ry is a
    multiple of 60 deg (ryForFace). Plain records: no THREE, no DOM. */
 let _moleNet = null;
 function buildMoleNet(){
  if (_moleNet) return _moleNet;
  const M = ADG_SITE.MOLE_HEX;
  const cx = M.cx, cz = M.cz;
  const apMole = M.R * SQRT3 * 0.5;
  const apRing = M.ringR * SQRT3 * 0.5;
  const Rs = M.cellR, apCell = Rs * SQRT3 * 0.5;
  const STREET_HALF = 3.5;
  const apBlock = apCell - STREET_HALF;
  const N = [];
  for (let k = 0; k < 6; k++) N.push([Math.cos(faceAngle(k)), Math.sin(faceAngle(k))]);
  function dotMax(dx, dz){
   let m = -1e9;
   for (let k = 0; k < 6; k++) { const d = dx * N[k][0] + dz * N[k][1]; if (d > m) m = d; }
   return m;
  }
  /* Liang-Barsky clip of segment a-b to the ring hexagon (all six half-planes n_k . (p - c) <= apRing) */
  function clipToRing(a, b){
   let t0 = 0, t1 = 1;
   const ax = a[0] - cx, az = a[1] - cz, dx = b[0] - a[0], dz = b[1] - a[1];
   for (let k = 0; k < 6; k++) {
    const den = dx * N[k][0] + dz * N[k][1];
    const num = apRing - (ax * N[k][0] + az * N[k][1]);
    if (Math.abs(den) < 1e-9) { if (num < 0) return null; continue; }
    const t = num / den;
    if (den > 0) { if (t < t1) t1 = t; } else { if (t > t0) t0 = t; }
    if (t0 > t1) return null;
   }
   return [[a[0] + dx * t0, a[1] + dz * t0], [a[0] + dx * t1, a[1] + dz * t1]];
  }
  const ways = [];
  const edgeMap = new Map();
  const rank = { avenue: 4, main: 3, side: 2 };
  function r2(p){ return [+p[0].toFixed(2), +p[1].toFixed(2)]; }
  function addEdge(a, b, kind, tag){
   const c = clipToRing(a, b);
   if (!c || Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1]) < 3.0) return;
   const ka = Math.round(c[0][0] * 10) + ',' + Math.round(c[0][1] * 10);
   const kb = Math.round(c[1][0] * 10) + ',' + Math.round(c[1][1] * 10);
   const ek = ka < kb ? ka + '|' + kb : kb + '|' + ka;
   const prev = edgeMap.get(ek);
   if (!prev || rank[kind] > rank[prev.kind]) edgeMap.set(ek, { kind: kind, pts: [r2(c[0]), r2(c[1])], tag: tag });
  }
  /* Quay ring avenue */
  const ringV = hexVerts(cx, cz, M.ringR);
  for (let k = 0; k < 6; k++) ways.push({ kind: 'avenue', pts: [r2(ringV[k]), r2(ringV[(k + 1) % 6])], tag: 'Mole Hexagonal Quay Ring Avenue ' + k });
  /* Honeycomb street cells */
  const cells = [];
  for (let q = -4; q <= 4; q++) {
   for (let r = -4; r <= 4; r++) {
    const ox = 1.5 * Rs * q, oz = SQRT3 * Rs * (r + 0.5 * q);
    const dm = dotMax(ox, oz);
    if (dm > apRing + apCell) continue;
    const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
    cells.push({ q: q, r: r, x: cx + ox, z: cz + oz, ox: ox, oz: oz, dm: dm, ring: ring,
     full: dm + apBlock <= apRing - STREET_HALF });
    const V = hexVerts(cx + ox, cz + oz, Rs);
    for (let k = 0; k < 6; k++) addEdge(V[k], V[(k + 1) % 6], ring === 0 ? 'main' : 'side', 'Mole Honeycomb Street');
   }
  }
  edgeMap.forEach(function(v){ ways.push(v); });
  /* Lift-foot spur: ring face 5 straight out (330 deg) to the girder-lift lower station */
  const lift = ADG_SITE.HOISTS.filter(function(h){ return h.id === 'et_girder_lift'; })[0];
  if (lift) {
   const n5 = N[5];
   const fx = lift.foot[0] - cx, fz = lift.foot[1] - cz;
   const along = fx * n5[0] + fz * n5[1];
   const px = lift.foot[0] - n5[0] * (along - apRing), pz = lift.foot[1] - n5[1] * (along - apRing);
   ways.push({ kind: 'main', pts: [r2([px, pz]), r2([lift.foot[0] - n5[0] * 6.0, lift.foot[1] - n5[1] * 6.0])], tag: 'Mole Girder-Lift Foot Spur' });
  }

  /* ---- Lots ---- */
  const specs = [];
  function push(key, x, z, ry, v, role){
   specs.push({ key: 'eternian:' + key, x: +x.toFixed(2), z: +z.toFixed(2), ry: +ry.toFixed(4), v: v == null ? 0 : v, zone: 'Z6_WHARF', role: role });
  }
  /* A piece of depth d whose inner edge sits e from the cell centre, fronting face k */
  function face(C, k, e, key, d, v, role){
   const dn = e + d * 0.5;
   push(key, C.x + N[k][0] * dn, C.z + N[k][1] * dn, ryForFace(k), v, role);
  }
  const lx = lift ? lift.foot[0] : 1e9, lz = lift ? lift.foot[1] : 1e9;
  let liftCell = null, bestLift = 1e9;
  for (let i = 0; i < cells.length; i++) {
   const C = cells[i];
   if (!C.full || C.ring === 0) continue;
   const dl = Math.hypot(C.x - lx, C.z - lz);
   if (dl < bestLift) { bestLift = dl; liftCell = C; }
  }
  const TWINS = [
   ['et_wood_transit_shed', 11, 'et_wood_coaling_bunker', 12],
   ['et_wood_transit_shed', 11, 'et_wood_transit_shed', 11],
   ['et_wood_coaling_bunker', 12, 'et_wood_net_loft', 10],
   ['et_wood_net_loft', 10, 'et_wood_chandlery', 10]
  ];
  const TRI = [['et_wood_chandlery', 10, 0], ['et_wood_net_loft', 10, 0], ['et_wood_chandlery', 10, 1]];
  for (let i = 0; i < cells.length; i++) {
   const C = cells[i];
   const tag = ' (mole cell ' + C.q + ',' + C.r + ')';
   if (C.full) {
    if (C.ring === 0) {
     push('et_customs_house', C.x, C.z, ryForFace(1), 0, 'Superintendency Mole Weighbridge & Customs House' + tag);
     face(C, 1, 7.0, 'et_wood_tally_kiosk', 9, 0, 'Weighbridge South Hexagonal Timber Tally Kiosk' + tag);
     face(C, 4, 7.0, 'et_wood_tally_kiosk', 9, 1, 'Weighbridge North Hexagonal Timber Tally Kiosk' + tag);
     continue;
    }
    if (C === liftCell) {
     push('et_tube_station', C.x, C.z, ryForFace(1), 0, 'Girder-Lift Foot Pneumatic Dispatch Hex Kiosk' + tag);
     face(C, 1, 5.3, 'et_wood_transit_shed', 11, 0, 'Girder-Lift South Rapid-Sling Timber Shed' + tag);
     face(C, 4, 5.3, 'et_wood_transit_shed', 11, 1, 'Girder-Lift North Rapid-Sling Timber Shed' + tag);
     continue;
    }
    const pick = Math.floor(hashU(C.q + 40, C.r + 40, 71) * 10);
    const kk = Math.floor(hashU(C.q + 40, C.r + 40, 72) * 3) % 3;
    if (pick < 3) {
     /* Godown block: timber hex warehouse with two street-front lofts */
     push('et_wood_hex_warehouse', C.x, C.z, 0.0, C.ring & 1, 'Timber Hexagonal Bonded Godown' + tag);
     face(C, 1, 7.3, 'et_wood_chandlery', 10, 0, 'Godown Ship-Stores Timber Chandlery' + tag);
     face(C, 4, 7.3, pick === 0 ? 'et_wood_net_loft' : 'et_wood_chandlery', 10, 1, 'Godown Cordage & Net Loft' + tag);
    } else if (pick < 7) {
     /* Twin-shed block: two long sheds back to back across the cell, fronting opposite streets */
     const T = TWINS[(pick + C.q * 3 + C.r * 7 + 64) % TWINS.length];
     face(C, kk, 1.0, T[0], T[1], 0, 'Back-to-Back Timber Freight Shed' + tag);
     face(C, kk + 3, 1.0, T[2], T[3], 1, 'Back-to-Back Timber Freight Shed' + tag);
    } else {
     /* Three-sided court: three lofts on alternate faces round a hexagonal tally kiosk */
     const k0 = kk & 1;
     push('et_wood_tally_kiosk', C.x, C.z, 0.0, 0, 'Court Hexagonal Timber Tally Kiosk' + tag);
     for (let m = 0; m < 3; m++) {
      const P = TRI[(m + pick) % TRI.length];
      face(C, k0 + m * 2, 6.6, P[0], P[1], P[2], 'Hex-Court Timber Loft' + tag);
     }
    }
   } else {
    /* Ring-cut cell: one piece, pulled in off the ring avenue */
    const room = apRing - STREET_HALF - 1.5 - C.dm;
    if (room < 3.5) continue;
    let kmax = 0, dBest = -1e9;
    for (let k = 0; k < 6; k++) { const d = C.ox * N[k][0] + C.oz * N[k][1]; if (d > dBest) { dBest = d; kmax = k; } }
    if (room + 3.0 >= 9.6) {
     const sh = Math.max(0, 9.6 - room);
     push('et_wood_hex_warehouse', C.x - N[kmax][0] * sh, C.z - N[kmax][1] * sh, 0.0, (C.q + C.r) & 1, 'Ring-Street Timber Hexagonal Store' + tag);
    } else if (room + 3.0 >= 6.2) {
     const sh = Math.max(0, 6.2 - room);
     push('et_wood_tally_kiosk', C.x - N[kmax][0] * sh, C.z - N[kmax][1] * sh, 0.0, 1, 'Ring-Street Hexagonal Timber Tally Kiosk' + tag);
    }
   }
  }
  /* Quay strip between the ring avenue and the sea wall: pieces front the water (face k), laid along the face tangent;
     a fifth field pushes a slip piece out over the water (the dockyard's slipway) */
  const QUAY = {
   0: [['et_wood_coaling_bunker', 18, 12, 0], ['et_wood_crane_stage', 12, 10, 0], ['et_quay', 32, 14, 1], ['et_wood_crane_stage', 12, 10, 1], ['et_wood_coaling_bunker', 18, 12, 1], ['et_fish_landing', 14, 16, 0]],
   1: [['et_wood_net_loft', 16, 10, 0], ['et_quay', 32, 14, 0], ['et_wood_crane_stage', 12, 10, 0], ['et_wood_coaling_bunker', 18, 12, 0], ['et_wood_crane_stage', 12, 10, 1], ['et_quay', 32, 14, 1]],
   2: [['et_wood_boat_shed', 14, 18, 0], ['et_dock', 30, 26, 0, 8.0], ['et_ferry_landing', 12, 16, 0], ['et_wood_boat_shed', 14, 18, 1], ['et_canal_landing', 12, 12, 0], ['et_wood_boat_shed', 14, 18, 0], ['et_wood_net_loft', 16, 10, 1]],
   3: [['et_wood_crane_stage', 12, 10, 0], ['et_wood_transit_shed', 20, 11, 0], ['et_wood_net_loft', 16, 10, 0], ['et_wood_crane_stage', 12, 10, 1], ['et_wood_chandlery', 12, 10, 1]],
   4: [['et_wood_crane_stage', 12, 10, 0], ['et_wood_transit_shed', 20, 11, 0], ['et_wood_crane_stage', 12, 10, 1], ['et_wood_transit_shed', 20, 11, 1], ['et_wood_boat_shed', 14, 18, 1], ['et_wood_net_loft', 16, 10, 0]]
  };
  const QUAY_NAME = ['South-East Farport Coaling Berth', 'South Junk & Mast Quay', 'South-West Slipway & Ferry Front', 'West Breakwater Front', 'North Tailrace Lighter Quay'];
  const GAP = 2.5, T_LIM = 70.0;
  for (let k = 0; k < 5; k++) {
   const list = QUAY[k];
   let tot = 0;
   for (let i = 0; i < list.length; i++) tot += list[i][1] + (i ? GAP : 0);
   let t = -Math.min(tot, 2 * T_LIM) * 0.5;
   const tx = -N[k][1], tz = N[k][0];
   for (let i = 0; i < list.length; i++) {
    const P = list[i];
    const tc = t + P[1] * 0.5;
    t += P[1] + GAP;
    if (Math.abs(tc) + P[1] * 0.5 > T_LIM) continue;
    const dn = apMole - 1.6 - P[2] * 0.5 + (P[4] == null ? 0 : P[4]);
    push(P[0], cx + N[k][0] * dn + tx * tc, cz + N[k][1] * dn + tz * tc, ryForFace(k), P[3], QUAY_NAME[k] + ' ' + P[0].replace('et_wood_', 'timber ').replace('et_', '').replace(/_/g, ' '));
   }
  }
  /* Breakwater storm-lantern on the west vertex, between faces 2 and 3 */
  push('et_lighthouse', cx - M.R + 12.0, cz, 0.0, 0, 'Dam-Lee Breakwater Hexagonal Bronze Storm-Lantern Tower');
  /* Shore face 5: sheds fronting the ring avenue (face 2 points inward), clear of the lift pad and the harbour road */
  {
   const k = 5, tx = -N[k][1], tz = N[k][0];
   const lt = lift ? (lx - cx) * tx + (lz - cz) * tz : 1e9;
   const SH = [[-56, 'et_wood_transit_shed', 20, 11, 0], [-33, 'et_wood_chandlery', 12, 10, 1], [lt + 34, 'et_wood_coaling_bunker', 18, 12, 1]];
   for (let i = 0; i < SH.length; i++) {
    const P = SH[i];
    if (Math.abs(P[0] - lt) < 22 + P[2] * 0.5 || P[0] + P[2] * 0.5 > 50) continue;
    const dn = apMole - 1.6 - P[3] * 0.5;
    push(P[1], cx + N[k][0] * dn + tx * P[0], cz + N[k][1] * dn + tz * P[0], ryForFace(2), P[4], 'Shore-Root ' + P[1].replace('et_wood_', 'timber ').replace(/_/g, ' '));
   }
  }
  _moleNet = { ways: ways, specs: specs, cells: cells, plazas: [] };
  return _moleNet;
 }

 /* Mathematical audit proving Z6 Eternian hexagonal buildings align to 60-degree lattice multiples & tile densely */
 function auditHexAlignment(lots){
  const z6Et = (lots || []).filter(function(l){ return l.zone === 'Z6' && l.kit === 'eternian'; });
  let hexCount = 0;
  let aligned60 = 0;
  const step60 = PI / 3;
  for (let i = 0; i < z6Et.length; i++) {
   const L = z6Et[i];
   if (ADG_TUNE.isHexPiece(L.key, L.v)) {
    hexCount++;
    const rem = Math.abs(L.ry / step60 - Math.round(L.ry / step60)) * step60;
    if (rem <= 0.03) aligned60++;
   }
  }
  return {
   ok: z6Et.length >= 160 && hexCount >= 120 && aligned60 === hexCount,
   z6Lots: z6Et.length,
   hexBuildings: hexCount,
   aligned60: aligned60,
   macroCells: CELLS.length
  };
 }

 return {
  R_MACRO: R_MACRO,
  AP_MACRO: AP_MACRO,
  CX0: CX0,
  CZ0: CZ0,
  CELLS: CELLS,
  axialToWorld: axialToWorld,
  faceAngle: faceAngle,
  ryForFace: ryForFace,
  hexVerts: hexVerts,
  buildHexWaysAndPlazas: buildHexWaysAndPlazas,
  buildHexSpecs: buildHexSpecs,
  auditHexAlignment: auditHexAlignment,
  buildMoleNet: buildMoleNet
 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ADG_HEX;
