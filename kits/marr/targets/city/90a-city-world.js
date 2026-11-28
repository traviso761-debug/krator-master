// ================================================================= MARR CITY — 90a-city-world.js
// Builds the Ring Sea & 5-canal water plane, continuous stone harbour seawalls (Malekón), stone canal revetments,
// breakwater mole (Mol de Porta), colonial block sidewalk curbs & compound perimeter walls, busy harbour shipping fleet,
// KratorSky lighting & world clock, and continuous Muraya de Marr masonry curtain walls.
// Tagged [web] in PORT.md.
reseed(424304);
const CITY_T0 = performance.now();
const CITYSKY = { hour: 16.2, day: 200, dens: 1.35 };

const COBBLE_SEED = KRAND.child(424304, 'marr-cobble');   /* the cobble tile's stones: a named seed, never draw order */
function makeCobbleNormalAndRough() {
 const S = 256;
 const nc = document.createElement('canvas'); nc.width = nc.height = S;
 const rc = document.createElement('canvas'); rc.width = rc.height = S;
 const ng = nc.getContext('2d'), rg = rc.getContext('2d');
 const nImg = ng.createImageData(S, S), rImg = rg.createImageData(S, S);
 const nd = nImg.data, rd = rImg.data;
 // Heightfield of running-bond rounded colonial cobblestones (16 courses x 8 stones per tile)
 const H = new Float32Array(S * S);
 const rows = 14, cols = 8;
 for (let y = 0; y < S; y++) {
  const vf = (y / S) * rows, rIdx = Math.floor(vf), lv = vf - rIdx;
  const shift = (rIdx & 1) ? 0.5 : 0.0;
  for (let x = 0; x < S; x++) {
   const uf = ((x / S) * cols + shift) % cols, cIdx = Math.floor(uf), lu = uf - cIdx;
   const hVar = KRAND.unit(KRAND.hash(COBBLE_SEED, rIdx, cIdx)) * 0.25;   /* core/rand: one value per stone, from its course and column */
   const du = Math.abs(lu - 0.5) * 2.0, dv = Math.abs(lv - 0.5) * 2.0;
   const edge = Math.max(du, dv);
   // Deep mortar joint around each stone + domed cobblestone crown
   const dome = edge > 0.84 ? 0.08 : (Math.cos(du * 1.35) * Math.cos(dv * 1.35) * (0.78 + hVar));
   const grit = 0.06 * Math.sin(x * 0.35 + y * 0.22) * Math.cos(x * 0.19 - y * 0.41);
   H[y * S + x] = Math.max(0, Math.min(1, dome + grit));
  }
 }
 for (let y = 0; y < S; y++) {
  const yN = (y - 1 + S) % S, yS = (y + 1) % S;
  for (let x = 0; x < S; x++) {
   const xW = (x - 1 + S) % S, xE = (x + 1) % S;
   const h = H[y * S + x];
   const dx = (H[y * S + xW] - H[y * S + xE]) * 2.8;
   const dy = (H[yN * S + x] - H[yS * S + x]) * 2.8;
   const inv = 1 / Math.hypot(dx, dy, 1.0);
   const i = (y * S + x) * 4;
   nd[i] = Math.round((dx * inv * 0.5 + 0.5) * 255);
   nd[i + 1] = Math.round((dy * inv * 0.5 + 0.5) * 255);
   nd[i + 2] = Math.round((inv * 0.5 + 0.5) * 255);
   nd[i + 3] = 255;
   const rVal = Math.round((0.96 - h * 0.24) * 255);
   rd[i] = rd[i + 1] = rd[i + 2] = rVal;
   rd[i + 3] = 255;
  }
 }
 ng.putImageData(nImg, 0, 0);
 rg.putImageData(rImg, 0, 0);
 const nTex = new THREE.CanvasTexture(nc);
 const rTex = new THREE.CanvasTexture(rc);
 for (const t of [nTex, rTex]) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(CITY.WORLD / 3.4, CITY.WORLD / 3.4);
  t.anisotropy = 4;
 }
 return { nTex, rTex, H, S };
}

function cityTerrainMesh() {
 // Stamp fine cobblestone texture speckle & stone block courses onto road/plaza pixels of gcv before uploading
 const cob = makeCobbleNormalAndRough();
 {
  const img = cg.getImageData(0, 0, CS, CS);
  const d = img.data;
  for (let iz = 0; iz < CS; iz++) {
   const rowOff = iz * CS;
   for (let ix = 0; ix < CS; ix++) {
    const idx = (rowOff + ix) * 4;
    const k = kData ? kData[idx] : 0;
    if (k === KL.boulevard || k === KL.minor || k === KL.plaza || k === KL.settler || k === KL.court) {
     // Sample high-frequency cobblestone pattern into the canvas albedo
     const u = ((ix * 7) & (cob.S - 1)), v = ((iz * 7) & (cob.S - 1));
     const h = cob.H[v * cob.S + u];
     const mul = (k === KL.boulevard || k === KL.minor) ? (0.76 + 0.36 * h) : (0.84 + 0.24 * h);
     d[idx] = Math.min(255, Math.max(0, Math.round(d[idx] * mul)));
     d[idx + 1] = Math.min(255, Math.max(0, Math.round(d[idx + 1] * mul)));
     d[idx + 2] = Math.min(255, Math.max(0, Math.round(d[idx + 2] * mul)));
    }
   }
  }
  cg.putImageData(img, 0, 0);
 }
 const N = Math.round(CITY.WORLD / 4);
 const g = new THREE.PlaneGeometry(CITY.WORLD, CITY.WORLD, N, N);
 const p = g.attributes.position;
 for (let i = 0; i < p.count; i++) {
  const lx = p.getX(i), ly = p.getY(i);
  p.setZ(i, terrainH(lx, -ly));
 }
 g.computeVertexNormals();
 const tex = new THREE.CanvasTexture(gcv);
 tex.encoding = THREE.sRGBEncoding;
 tex.anisotropy = 4;
 tex.minFilter = THREE.LinearMipmapLinearFilter;
 const m = new THREE.MeshStandardMaterial({
  map: tex,
  normalMap: cob.nTex,
  normalScale: new THREE.Vector2(0.85, 0.85),
  roughnessMap: cob.rTex,
  roughness: 0.92,
  metalness: 0
 });
 groundM = new THREE.Mesh(g, m);
 groundM.rotation.x = -Math.PI / 2;
 groundM.userData.isGround = true;
 groundM.userData.probeSkip = true;
 groundM.name = 'terrain';
 scene.add(groundM);
 window._terrainTex = tex;
 window._cobbleNormTex = cob.nTex;
}

// 1. Ring Sea Harbour & 5 Delta Canals Water Surface (y = 0.0)
{
 const wg = new THREE.PlaneGeometry(CITY.WORLD, CITY.WORLD, 96, 96);
 wg.rotateX(-Math.PI / 2);
 const wm = new THREE.MeshStandardMaterial({
  color: 0x1d5868,
  roughness: 0.16,
  metalness: 0.22,
  transparent: true,
  opacity: 0.88,
  side: THREE.DoubleSide
 });
 const wMesh = new THREE.Mesh(wg, wm);
 wMesh.position.y = CITY.SEA_Y;
 wMesh.userData.probeSkip = true;
 wMesh.name = 'harbour-water';
 scene.add(wMesh);
 window._waterMesh = wMesh;
}

// 2. Breakwater Mole (Mol de Porta), Harbour Seawalls, Canal Revetments, Block Sidewalks & Sim-Driven Ring Sea Harbour Fleet
{
 const stoneMat = MAT.marHarbourStone || MAT.stone;
 const tileMat = MAT.marTileR || MAT.roofT;
 const grp = new THREE.Group();
 grp.name = 'marr-quays-and-walls';
 scene.add(grp);

 // Breakwater mole masonry spine & parapet
 const moleArm = new THREE.Mesh(new THREE.BoxGeometry(310, 4.2, 16), stoneMat);
 moleArm.position.set(-90, 1.5, -289);
 grp.add(moleArm);
 const moleParapet = new THREE.Mesh(new THREE.BoxGeometry(310, 1.1, 1.4), stoneMat);
 moleParapet.position.set(-90, 4.1, -296);
 grp.add(moleParapet);
 const moleNeck = new THREE.Mesh(new THREE.BoxGeometry(22, 4.2, 52), stoneMat);
 moleNeck.position.set(-235, 1.5, -267);
 grp.add(moleNeck);
 const moleHead = new THREE.Mesh(new THREE.CylinderGeometry(15, 16.5, 4.4, 20), stoneMat);
 moleHead.position.set(60, 1.6, -288);
 grp.add(moleHead);
 KWALK.floor({ rect: [-245, 65, -297, -281], y: 3.6, name: 'Mol de Porta', tag: 'city:mole' });
 KWALK.floor({ rect: [-246, -224, -293, -241], y: 3.6, name: 'Mol de Porta Neck', tag: 'city:mole' });

 // Continuous Muraya de Marr Curtain Wall Chains between Bastions & Gates
 for (let ci = 0; ci < MAR_WALL_CHAINS.length; ci++) {
  const chain = MAR_WALL_CHAINS[ci];
  for (let i = 0; i < chain.length - 1; i++) {
   const a = chain[i], b = chain[i + 1];
   const dx = b[0] - a[0], dz = b[1] - a[1];
   const len = Math.hypot(dx, dz);
   if (len < 2) continue;
   const mx = 0.5 * (a[0] + b[0]), mz = 0.5 * (a[1] + b[1]);
   const ry = Math.atan2(dx, dz);
   const yBase = Math.max(2.2, 0.5 * (rawTerrainH(a[0], a[1]) + rawTerrainH(b[0], b[1])) - 0.8);
   const wallH = 8.2;
   const wBody = new THREE.Mesh(new THREE.BoxGeometry(4.4, wallH, len), stoneMat);
   wBody.position.set(mx, yBase + wallH * 0.5, mz);
   wBody.rotation.y = ry;
   grp.add(wBody);
   const wCope = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.6, len + 0.4), tileMat);
   wCope.position.set(mx, yBase + wallH + 0.3, mz);
   wCope.rotation.y = ry;
   grp.add(wCope);
  }
 }

 const st = MA_CANT(), stD = MA_CANTD(), or = MA_OR(), wood = MA_WOOD(), iron = MA_IRON();
 const stucCols = [MA_LIME(), MA_OCHRE(), MA_CORAL(), MA_SAFFRON()];

 // Helper: draw a stone revetment segment from point A to point B
 const addRevetSeg = (ax, az, bx, bz, yTop, thick, ApronW) => {
  const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz);
  if (len < 1.0) return;
  const mx = 0.5 * (ax + bx), mz = 0.5 * (az + bz), ry = Math.atan2(dx, dz);
  const h = yTop + 1.4;
  vB('maCantera', mx, -1.4, mz, thick, h, len + 0.3, ry, stD);
  vB('maCantera', mx, yTop, mz, thick + 0.28, 0.24, len + 0.4, ry, st);
  if (ApronW && ApronW > 0) {
   const nx = -dz / len, nz = dx / len;
   const sx = mx + nx * (ApronW * 0.42), sz = mz + nz * (ApronW * 0.42);
   vB('maCantera', sx, -1.2, sz, ApronW, 2.58, len + 0.2, ry, stD);
   vB('maCantera', sx, 1.38, sz, ApronW + 0.2, 0.16, len + 0.3, ry, st);
  }
 };

 // 2a. Continuous Harbour Shoreline Seawalls & Lower Quay Aprons across all 4 waterfront banks (leaving canal mouths wide open!)
 const shoreSpans = [
  [-244, -142, 10], // Poinda de Navigadarz & West Bank
  [-118, -19, 8],   // Isla de Sidi Olda waterfront
  [15, 144, 8],     // Isla de Marchondaz waterfront
  [167, 352, 12]    // Kosta de Xedaz waterfront
 ];
 for (const [x0, x1, nSeg] of shoreSpans) {
  for (let k = 0; k < nSeg; k++) {
   const xa = x0 + (x1 - x0) * (k / nSeg), xb = x0 + (x1 - x0) * ((k + 1) / nSeg);
   const za = coastZ(xa) + 1.8, zb = coastZ(xb) + 1.8;
   const yT = Math.min(3.0, Math.max(2.4, 0.5 * (rawTerrainH(xa, za + 4) + rawTerrainH(xb, zb + 4))));
   addRevetSeg(xa, za, xb, zb, yT, 3.2, 4.8);
   const xm = 0.5 * (xa + xb), zm = 0.5 * (za + zb);
   vdkBollard(xm, 1.54, zm - 1.6, iron);
   if (k % 2 === 0) {
    vnBarrel(xm - 1.4, 1.54, zm + 0.2, 0.36, 0.9, wood);
    vnBarrel(xm - 0.6, 1.54, zm + 0.2, 0.36, 0.9, wood);
    vnCrate(xm + 1.1, 1.54, zm + 0.2, 0.85, 0.15, wood);
   }
  }
 }

 // 2b. Continuous Stone Canal Embankment Revetments along all 5 canals (extended south to the new South Wall at z = 565..591)
 // Knal Greta (west & east banks, broken at transverse canal junctions)
 for (const [z0, z1, nSeg] of [[-138, -6, 9], [10, 302, 18], [322, 588, 16]]) {
  for (let k = 0; k < nSeg; k++) {
   const za = z0 + (z1 - z0) * (k / nSeg), zb = z0 + (z1 - z0) * ((k + 1) / nSeg);
   addRevetSeg(gretaCx(za) + gretaHw(za) + 0.8, za, gretaCx(zb) + gretaHw(zb) + 0.8, zb, 2.75, 2.2, 0);
  }
 }
 for (const [z0, z1, nSeg] of [[-138, 302, 24], [322, 588, 16]]) {
  for (let k = 0; k < nSeg; k++) {
   const za = z0 + (z1 - z0) * (k / nSeg), zb = z0 + (z1 - z0) * ((k + 1) / nSeg);
   addRevetSeg(gretaCx(za) - gretaHw(za) - 0.8, za, gretaCx(zb) - gretaHw(zb) - 0.8, zb, 2.75, 2.2, 0);
  }
 }
 // Knal de Gardonz (west & east banks extended to z = 564)
 for (const [z0, z1, nSeg] of [[-144, 302, 22], [322, 564, 14]]) {
  for (let k = 0; k < nSeg; k++) {
   const za = z0 + (z1 - z0) * (k / nSeg), zb = z0 + (z1 - z0) * ((k + 1) / nSeg);
   addRevetSeg(gardonzCx(za) - gardonzHw() - 0.8, za, gardonzCx(zb) - gardonzHw() - 0.8, zb, 2.75, 2.0, 0);
   addRevetSeg(gardonzCx(za) + gardonzHw() + 0.8, za, gardonzCx(zb) + gardonzHw() + 0.8, zb, 2.75, 2.0, 0);
  }
 }
 // Knal de Xedaz (west & east banks extended to z = 574)
 for (const [z0, z1, nSeg] of [[-146, -6, 8], [14, 302, 16], [322, 574, 14]]) {
  for (let k = 0; k < nSeg; k++) {
   const za = z0 + (z1 - z0) * (k / nSeg), zb = z0 + (z1 - z0) * ((k + 1) / nSeg);
   addRevetSeg(xedazCx(za) - xedazHw() - 0.8, za, xedazCx(zb) - xedazHw() - 0.8, zb, 2.65, 2.0, 0);
   addRevetSeg(xedazCx(za) + xedazHw() + 0.8, za, xedazCx(zb) + xedazHw() + 0.8, zb, 2.65, 2.0, 0);
  }
 }
 // Transverse canals: Islipa de Ismoglarz & Knal de Sauta
 for (let k = 0; k < 8; k++) {
  const xa = 18 + (146 - 18) * (k / 8), xb = 18 + (146 - 18) * ((k + 1) / 8);
  addRevetSeg(xa, ismogCz(xa) - ismogHw() - 0.7, xb, ismogCz(xb) - ismogHw() - 0.7, 2.65, 1.8, 0);
  addRevetSeg(xa, ismogCz(xa) + ismogHw() + 0.7, xb, ismogCz(xb) + ismogHw() + 0.7, 2.65, 1.8, 0);
 }
 for (const [x0, x1] of [[-96, -18], [18, 108]]) {
  for (let k = 0; k < 5; k++) {
   const xa = x0 + (x1 - x0) * (k / 5), xb = x0 + (x1 - x0) * ((k + 1) / 5);
   addRevetSeg(xa, sautaCz(xa) - sautaHw() - 0.7, xb, sautaCz(xb) - sautaHw() - 0.7, 2.6, 1.8, 0);
   addRevetSeg(xa, sautaCz(xa) + sautaHw() + 0.7, xb, sautaCz(xb) + sautaHw() + 0.7, 2.6, 1.8, 0);
  }
 }

 // 2c. Colonial Block Sidewalk Plinths (Aceras) & Walkable Courtyard Surfaces (no porch-blocking outer perimeter walls!)
 for (let bi = 0; bi < MAR_CUADRA_RECTS.length; bi++) {
  const B = MAR_CUADRA_RECTS[bi];
  const y0 = rawTerrainH(B.cx, B.cz);
  const ry = -B.ang;
  vB('maCantera', B.cx, y0 - 0.38, B.cz, B.wh * 2 + 1.2, 0.50, B.hh * 2 + 1.2, ry, st);
  const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry));
  const ex = (B.wh + 1.5) * c + (B.hh + 1.5) * s, ez = (B.wh + 1.5) * s + (B.hh + 1.5) * c;
  KWALK.floor({ rect: [B.cx - ex, B.cx + ex, B.cz - ez, B.cz + ez], y: y0 + 0.12, name: 'Cuadra #' + (bi + 1), tag: 'city:cuadra' });
 }

 // Walled Mansion Estates in Qartar de Gardonz (split with wide 6.5m open carriage entrances so doors & gardens are unobstructed)
 for (let ei = 0; ei < MAR_ESTATE_RECTS.length; ei++) {
  const E = MAR_ESTATE_RECTS[ei];
  const y0 = rawTerrainH(E.cx, E.cz);
  const ry = -E.ang;
  const ux = Math.cos(E.ang), uz = Math.sin(E.ang);
  const vx = -uz, vz = ux;
  const wc = stucCols[(ei + 1) % stucCols.length];
  vB('maCantera', E.cx, y0 - 0.38, E.cz, E.wh * 2 + 1.0, 0.48, E.hh * 2 + 1.0, ry, st);
  const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry));
  const ex = (E.wh + 1.2) * c + (E.hh + 1.2) * s, ez = (E.wh + 1.2) * s + (E.hh + 1.2) * c;
  KWALK.floor({ rect: [E.cx - ex, E.cx + ex, E.cz - ez, E.cz + ez], y: y0 + 0.10, name: 'Estate #' + (ei + 1), tag: 'city:estate' });
  const wH = 2.4, segU = Math.max(2.0, E.wh - 4.5);
  for (const sz of [-1, 1]) {
   for (const sx of [-1, 1]) {
    const uMid = sx * (E.wh - 0.3 - segU * 0.5);
    const px = E.cx + uMid * ux + sz * (E.hh - 0.3) * vx;
    const pz = E.cz + uMid * uz + sz * (E.hh - 0.3) * vz;
    vB('vPlaster', px, y0, pz, segU, wH, 0.36, ry, wc);
    vB('maTileB', px, y0 + wH, pz, segU + 0.2, 0.14, 0.50, ry, or);
   }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
   const cx = E.cx + sx * (E.wh - 0.3) * ux + sz * (E.hh - 0.3) * vx;
   const cz = E.cz + sx * (E.wh - 0.3) * uz + sz * (E.hh - 0.3) * vz;
   vB('maCantera', cx, y0, cz, 0.72, wH + 0.35, 0.72, ry, st);
   kput('maUrn', [cx, y0 + wH + 0.35, cz], null, [0.3, 0.48, 0.3], or);
  }
 }

 // 2d. Real Ring Sea Vessels (RINGSEA) & Sim-Layer Harbour Docking, Unloading & Reloading
 if (typeof MARR_SIM !== 'undefined') {
  if (typeof SIM !== 'undefined' && !MARR_SIM.STATE) {
   try { MARR_SIM.declare(); } catch (e) { reportErr('MARR_SIM.declare: ' + (e && e.stack || e)); }
  }
  if (!MARR_SIM.STATE || !MARR_SIM.STATE.harbour) {
   MARR_SIM.STATE = MARR_SIM.STATE || { clock: { m: 0, day: 0, hour: 8, t: 0 }, settlements: {}, villages: [], routes: [], ships: {}, buyersSold: {}, problems: [] };
   MARR_SIM.initHarbour();
  }
  const H = MARR_SIM.STATE.harbour;
  const fleetGrp = new THREE.Group();
  fleetGrp.name = 'marr-ringsea-fleet';
  scene.add(fleetGrp);

  const crateGeo = new THREE.BoxGeometry(0.95, 0.85, 0.95);
  const barrelGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.95, 10);
  const crateMat = MAT.wood || stoneMat;
  const sackMat = MAT.plaster || tileMat;

  for (let vi = 0; vi < H.vessels.length; vi++) {
   const v = H.vessels[vi];
   const made = (typeof RINGSEA !== 'undefined' && RINGSEA.make) ? RINGSEA.make(v.vesselKey) : null;
   if (!made || !made.group) continue;
   const shipG = made.group;
   shipG.name = v.name + ' (' + v.vesselKey + ')';
   shipG.position.set(v.pos.x, CITY.SEA_Y, v.pos.z);
   shipG.rotation.y = v.pos.ry;
   fleetGrp.add(shipG);
   v._mesh = shipG;

   // Pier-side cargo staging stack (crates, barrels, sacks) at the vessel's berth that grows during unloading and shrinks during reloading
   const cargoG = new THREE.Group();
   cargoG.name = v.berthName + ' — Pier Cargo Stage';
   const cOffX = v.canal ? (v.dock[0] < 0 ? -4.2 : 4.2) : 0;
   const cOffZ = v.canal ? 0 : 7.5;
   cargoG.position.set(v.dock[0] + cOffX, 1.42, v.dock[1] + cOffZ);
   const cargoItems = [];
   for (let ci = 0; ci < 6; ci++) {
    const isBarrel = (ci % 2 === 1);
    const cm = new THREE.Mesh(isBarrel ? barrelGeo : crateGeo, (ci % 3 === 0) ? sackMat : crateMat);
    const row = Math.floor(ci / 3), col = (ci % 3) - 1;
    cm.position.set(col * 1.15, 0.45 + row * 0.85, (ci & 1) * 0.45);
    cm.rotation.y = (ci * 0.7);
    cargoG.add(cm);
    cargoItems.push(cm);
   }
   fleetGrp.add(cargoG);
   v._cargoGroup = cargoG;
   v._cargoItems = cargoItems;
  }

  let simAccumMin = 0;
  const tickHarbour3D = dt => {
   const dtSec = Math.min(0.1, dt > 0 ? dt : 0.016);
   const tNow = performance.now() * 0.001;
   if (typeof RINGSEA !== 'undefined' && RINGSEA.tick) RINGSEA.tick(tNow);
   // Advance harbour docking/unloading/reloading state machine at ~0.55 sim-minutes per real second
   const dMin = dtSec * 0.55;
   MARR_SIM.stepHarbour(dMin);
   simAccumMin += dMin;
   if (simAccumMin >= 1.0 && typeof SIM !== 'undefined' && typeof MARR_SIM.run === 'function') {
    const whole = Math.floor(simAccumMin);
    simAccumMin -= whole;
    try { MARR_SIM.run(whole); } catch (e) {}
   }
   for (let vi = 0; vi < H.vessels.length; vi++) {
    const v = H.vessels[vi];
    if (v._mesh) {
     const bob = Math.sin(tNow * 1.6 + vi * 1.3) * 0.06;
     v._mesh.position.set(v.pos.x, CITY.SEA_Y + bob, v.pos.z);
     v._mesh.rotation.y = v.pos.ry;
     v._mesh.rotation.z = Math.sin(tNow * 1.2 + vi * 0.9) * 0.018;
    }
    if (v._cargoItems) {
     const activeCount = Math.max(1, Math.min(6, Math.round(v.pierStageRatio * 6)));
     for (let ci = 0; ci < v._cargoItems.length; ci++) {
      v._cargoItems[ci].visible = ci < activeCount;
     }
    }
   }
  };
  FRAME_HOOKS_PRE.push(tickHarbour3D);

  window.MARR_HARBOUR = {
   state: H,
   vessels: H.vessels,
   step: mins => {
    MARR_SIM.stepHarbour(mins == null ? 5 : mins);
    tickHarbour3D(0.016);
    return window.MARR_HARBOUR.status();
   },
   setPhase: (idOrIdx, phase, prog) => {
    const v = typeof idOrIdx === 'number' ? H.vessels[idOrIdx] : H.vessels.find(x => x.id === idOrIdx || x.vesselKey === idOrIdx);
    if (!v) return null;
    v.phase = phase;
    v.progress = prog == null ? 0 : prog;
    if (phase === 'unloading') v.hold = Object.assign({}, v.inbound);
    else if (phase === 'reloading') v.hold = {};
    MARR_SIM._updateVesselPose(v);
    tickHarbour3D(0.016);
    return v;
   },
   status: () => ({
    totalUnloaded: H.totalUnloaded,
    totalReloaded: H.totalReloaded,
    completedDockings: H.completedDockings,
    unloadedByGood: Object.assign({}, H.unloadedByGood),
    reloadedByGood: Object.assign({}, H.reloadedByGood),
    vessels: H.vessels.map(v => ({
     id: v.id,
     name: v.name,
     vesselKey: v.vesselKey,
     berth: v.berthName,
     phase: v.phase,
     progress: +v.progress.toFixed(2),
     cycles: v.cycles,
     hold: Object.assign({}, v.hold),
     pos: { x: +v.pos.x.toFixed(1), z: +v.pos.z.toFixed(1) }
    }))
   })
  };
 }
}

// 3. KratorSky & World Clock
KratorSky.attach(scene, 5000);
scene.fog.density = 0.00028;
const cityHemi = scene.children.find(o => o.isHemisphereLight);
const CITY_GLOW = {
 pane: new THREE.Color(0xffcf8a),
 paneDay: new THREE.Color(0x5a5244),
 bulb: new THREE.Color(0xfff3d6),
 bulbDay: new THREE.Color(0xb8b0a0)
};

function citySkyTick() {
 KratorSky.update(camera.position, CITYSKY.hour, CITYSKY.day, CITYSKY.dens);
 const L = KratorSky.lighting();
 sun.position.copy(L.sunDir).multiplyScalar(1500).add(camera.position);
 sun.target.position.copy(camera.position);
 sun.target.updateMatrixWorld();
 sun.intensity = L.sunIntensity;
 sun.color.copy(L.sunColor);
 fill.intensity = 0.24 * L.dayF + 0.06;
 if (cityHemi) cityHemi.intensity = L.ambient;
 scene.fog.color.copy(L.fog);
 renderer.setClearColor(L.fog);
 if (typeof BIO !== 'undefined' && BIO.host) BIO.setSun([L.sunDir.x, L.sunDir.y, L.sunDir.z]);
 const day = clamp(L.dayF, 0, 1);
 MAT.warmPane.color.copy(CITY_GLOW.pane).lerp(CITY_GLOW.paneDay, day);
 MAT.bulb.color.copy(CITY_GLOW.bulb).lerp(CITY_GLOW.bulbDay, day);
 if (MAT.dot) MAT.dot.color.setScalar(1 - 0.45 * day);
}

const CITY_CLOCK = KCLOCK.make({ hour: CITYSKY.hour });
let cityHourSeen = CITYSKY.hour;
FRAME_HOOKS.push(dt => {
 if (CITYSKY.hour !== cityHourSeen) CITY_CLOCK.set(CITYSKY.hour);
 const d0 = CITY_CLOCK.day;
 CITY_CLOCK.step(dt);
 CITYSKY.day += CITY_CLOCK.day - d0;
 CITYSKY.hour = cityHourSeen = CITY_CLOCK.hour;
});
FRAME_HOOKS.push(citySkyTick);
for (const f of FRAME_HOOKS_PRE) FRAME_HOOKS.push(f);
citySkyTick();
window._worldMs = Math.round(performance.now() - CITY_T0);
