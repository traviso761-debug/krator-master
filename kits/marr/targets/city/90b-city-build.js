// ================================================================= MARR CITY — 90b-city-build.js
// Builds all placed Marr & Vernacular buildings, courtyards, docks, bridges, bastions, garitas, and fincas
// from VERN_PLACED, builds the terrain mesh, populates coastal/park flora via BIO, and bakes KIT & TRANS.
// Tagged [draw] in PORT.md.
reseed(424305);
const BUILD_T0 = performance.now();
const AWNINGS = [];
const LANDMARKS = [];

(function buildMarrCityPlacements() {
 for (let i = 0; i < VERN_PLACED.length; i++) {
  const v = VERN_PLACED[i];
  const o = v.o;
  const y = v.y == null ? terrainH(o.x, o.z) : v.y;
  const vid = (v.v | 0);
  TSTAT.cur = v.key + '/' + vid;
  const r0 = REG.length;
  try {
   const pOpts = { v: vid, y };
   if (v.opts && v.opts.span != null) pOpts.span = v.opts.span;
   VERN.place(scene, v.key, o.x, o.z, o.ry, pOpts);
  } catch (e) {
   reportErr('place ' + v.key + ': ' + (e && e.stack || e));
  }
  TSTAT.cur = null;
  if (v.name && REG.length > r0) {
   const reg = REG[r0];
   reg.name = v.name;
   if (/Forta|Gilda|Templa|Palas de Govarnar|Om de Kostomz|Rropaguoka|Markita|Bigon|Porta de|Baluarte|Isqer Greta/i.test(v.name)) {
    reg.tags = reg.tags || {};
    reg.tags.landmark = true;
   }
   if (v.key === 'mar_markita_plaza') {
    reg.cls = 'furniture';
    reg.tags = Object.assign({}, reg.tags || {}, {
     culture: 'marr',
     type: ['plaza', 'market'],
     place: 'outdoor',
     wealth: 'civic',
     destination: 'market',
     landmark: true,
     stalls: 8,
     canopies: 4
    });
   }
  }
 }
})();

cityBakeMasks();
cityTerrainMesh();

// Populate coastal hills, city parks, Qartar de Gardonz mansion gardens & interior courtyards via BIO / HYPERJUNGLE
(function buildMarrBiome() {
 BIO.setScene(scene);
 const q = 0.65;
 const t0 = performance.now();
 BIO.host.mask = bioTreeMaskFn;
 BIO.cur = 'jungle/trees';
 let T = {};
 try { T = HYPERJUNGLE.buildTrees(1200, 900, q); } catch (e) { reportErr('jungle trees: ' + e.stack); }
 BIO.host.mask = bioMaskFn;
 BIO.cur = 'jungle/floor';
 let F = {};
 try { F = HYPERJUNGLE.buildFloor(900, q); } catch (e) { reportErr('jungle floor: ' + e.stack); }

 // Plant real HYPERJUNGLE biome palms, ferns, heliconias, and flowering shrubs inside every courtyard, mansion garden & park
 const prevBioKit = BIO.kit('hyperjungle');
 BIO.cur = 'jungle/gardens';
 try {
  const cPalm = [new THREE.Color(0x528e42), new THREE.Color(0x467e38), new THREE.Color(0x649e4a)];
  const cFern = [new THREE.Color(0x3f7c36), new THREE.Color(0x4e8e3e), new THREE.Color(0x346c32)];
  const cBract = [new THREE.Color(0xe0482c), new THREE.Color(0xf0822a), new THREE.Color(0xd83246)];
  const cBloom = [new THREE.Color(0xd84664), new THREE.Color(0xe89a2e), new THREE.Color(0xb45ac8)];
  const cTrunk = new THREE.Color(0x7a5c42);
  let gardenPlants = 0;

  const plantBiomePalm = (x, y, z, H, seed) => {
   const r = 0.16 + H * 0.025;
   BIO.put('trunk', [x, y - 0.3, z], null, [r / 0.4, H + 0.3, r / 0.4], cTrunk);
   const ty = y + H - 0.15, L = Math.max(1.8, H * 0.58);
   const col = cPalm[seed % cPalm.length];
   for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + (seed * 0.17);
    BIO.put('frond', [x, ty, z], qEuler(0, -a, 0.25 + (k & 1) * 0.22), [L * 0.85, L * 0.75, L * 1.15], col);
   }
   for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.4;
    BIO.put('frond', [x, ty + 0.22, z], qEuler(0, -a, 0.65), [L * 0.6, L * 0.55, L * 0.85], cPalm[(seed + 1) % cPalm.length]);
   }
   gardenPlants++;
  };

  const plantBiomeShrubOrFern = (x, y, z, S, seed, isFern) => {
   const col = isFern ? cFern[seed % cFern.length] : cPalm[seed % cPalm.length];
   const nF = isFern ? 7 : 5;
   for (let k = 0; k < nF; k++) {
    const a = (k / nF) * Math.PI * 2 + (seed * 0.31);
    if (isFern) {
     BIO.put('frond', [x, y + 0.05, z], qEuler(0, -a, 0.35 + (k % 3) * 0.15), [S * 0.8, S * 0.7, S], col);
    } else {
     BIO.put('ucard', [x + Math.cos(a) * S * 0.18, y + S * 0.45, z + Math.sin(a) * S * 0.18], qEuler(0.1, a, 0.2), [S * 0.55, S * 0.85, S * 0.55], col);
    }
   }
   if (!isFern && (seed % 2 === 0)) {
    BIO.put('bract', [x, y + S * 0.62, z], qEuler(0, seed * 1.1, 0), [0.65, 1.45, 0.65], cBract[seed % cBract.length]);
   }
   BIO.put('bloom', [x, y + S * 0.38, z], qEuler(0, seed * 0.7, 0), S * 0.38, cBloom[seed % cBloom.length]);
   gardenPlants++;
  };

  // 1. Every courtyard planter & vnTree spot recorded during VERN.place
  const cFlora = window.MARR_COURTYARD_FLORA || [];
  for (let i = 0; i < cFlora.length; i++) {
   const f = cFlora[i];
   if (f.kind === 'palm') {
    plantBiomePalm(f.x, f.y, f.z, Math.max(2.6, Math.min(5.2, f.h * 1.1)), i);
   } else {
    plantBiomeShrubOrFern(f.x, f.y, f.z, Math.max(1.3, f.h * 0.85), i, f.kind === 'fern');
   }
  }

  // 2. Lush perimeter & lawn plantings in every Qartar de Gardonz mansion estate (MAR_ESTATE_RECTS)
  for (let ei = 0; ei < MAR_ESTATE_RECTS.length; ei++) {
   const E = MAR_ESTATE_RECTS[ei];
   const ux = Math.cos(E.ang), uz = Math.sin(E.ang);
   const vx = -uz, vz = ux;
   // Plant palms & tropical flowering shrubs around the estate garden perimeter and lawn corners
   const spots = [
    [-E.wh + 2.4, -E.hh + 2.4, 'palm', 5.2],
    [E.wh - 2.4, -E.hh + 2.4, 'palm', 4.8],
    [-E.wh + 2.4, E.hh - 2.4, 'palm', 5.0],
    [E.wh - 2.4, E.hh - 2.4, 'palm', 4.6],
    [-E.wh + 2.8, 0, 'shrub', 2.4],
    [E.wh - 2.8, 0, 'fern', 2.2],
    [0, -E.hh + 2.8, 'shrub', 2.3],
    [0, E.hh - 2.8, 'fern', 2.3],
    [-E.wh * 0.45, -E.hh * 0.35, 'shrub', 2.1],
    [E.wh * 0.45, E.hh * 0.35, 'palm', 4.2]
   ];
   for (let si = 0; si < spots.length; si++) {
    const sp = spots[si];
    const wx = E.cx + sp[0] * ux + sp[1] * vx;
    const wz = E.cz + sp[0] * uz + sp[1] * vz;
    if (isRoad(wx, wz) || klass(wx, wz) === KL.building) continue;
    const wy = terrainH(wx, wz);
    if (sp[2] === 'palm') plantBiomePalm(wx, wy, wz, sp[3], ei * 11 + si);
    else plantBiomeShrubOrFern(wx, wy, wz, sp[3], ei * 11 + si, sp[2] === 'fern');
   }
  }

  // 3. City parks (Gardon de Pilotaz, Gardon de Kanal, Gardon de Guesta, Paseo de Gardonz)
  for (let pi = 0; pi < PARKS.length; pi++) {
   const P = PARKS[pi];
   const pr = Math.max(8, (P.r || 12) - 1.5);
   const nRing = pr > 11 ? 10 : 6;
   for (let k = 0; k < nRing; k++) {
    const a = (k / nRing) * Math.PI * 2 + pi * 0.5;
    const rad = pr * (0.55 + 0.35 * ((k & 1) ? 1 : 0.6));
    const wx = P.x + Math.cos(a) * rad, wz = P.z + Math.sin(a) * rad;
    if (isRoad(wx, wz) || inWater(wx, wz, 2)) continue;
    const wy = terrainH(wx, wz);
    if (k % 2 === 0) plantBiomePalm(wx, wy, wz, 4.8 + (k % 3) * 0.8, pi * 13 + k);
    else plantBiomeShrubOrFern(wx, wy, wz, 2.3, pi * 13 + k, (k % 4 === 1));
   }
  }
  window._gardenPlants = gardenPlants;
 } catch (e) {
  reportErr('garden flora: ' + (e && e.stack || e));
 }
 BIO.kit(prevBioKit);
 BIO.cur = null;
 const b = BIO.bake();
 window._biome = {
  trees: T.trees,
  hyper: T.hyper,
  saplings: T.saplings,
  tris: T.tris && T.tris.total,
  floorTris: F.tris,
  calls: b.calls,
  inst: b.inst,
  ms: Math.round(performance.now() - t0)
 };
 if (BIO._tickWind) BIO._tickWind();
})();

if (typeof izizMatlibLate === 'function') izizMatlibLate();
kbake(scene);
if (typeof TRANS !== 'undefined' && TRANS.bake) TRANS.bake(scene);
window._registered = REG.length;
window._buildMs = Math.round(performance.now() - BUILD_T0);
window._occ = OCC.list.length;
LABELS = new THREE.Group();
LABELS.userData.probeSkip = true;
scene.add(LABELS);
