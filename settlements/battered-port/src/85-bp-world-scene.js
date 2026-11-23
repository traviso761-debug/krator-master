// ================================================================= BATTERED PORT — Terrain, <=3-layer KGROUND, KCAVERN, ETK City, Exile Dress, KROOMLIGHT & Flora [web]
const BP_WORLD = (function(){
 const t0 = performance.now();
 const useProc = PQ.get('mat') === 'proc';
 if (useProc) KMAT.mode = 'proc';

 /* 1. Stage 5 KMAT_M1 Library Materials + M2 km1RoughAA Specular Anti-Aliasing */
 function makeSlotMat(slot, fallbackHex, rough, metal){
  const m = new THREE.MeshStandardMaterial({
   color: fallbackHex,
   roughness: rough == null ? 0.85 : rough,
   metalness: metal == null ? 0.0 : metal,
   vertexColors: false
  });
  if (!useProc && typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed && KMAT.textures) {
   const L = KMAT.packed('battered_port', slot);
   if (L) {
    const tx = KMAT.textures(L, { aniso: 8 });
    if (tx && tx.map) {
     tx.map.wrapS = tx.map.wrapT = THREE.RepeatWrapping;
     m.map = tx.map;
     m.color.setHex(0xffffff);
     if (tx.normalMap) {
      tx.normalMap.wrapS = tx.normalMap.wrapT = THREE.RepeatWrapping;
      m.normalMap = tx.normalMap;
     }
     if (tx.roughnessMap) {
      tx.roughnessMap.wrapS = tx.roughnessMap.wrapT = THREE.RepeatWrapping;
      m.roughnessMap = tx.roughnessMap;
     }
    }
   }
  }
  const mv = BP_MIPVAR.forFamily(slot);
  if (mv && typeof KMAT_M1 !== 'undefined' && KMAT_M1.patch) {
   KMAT_M1.patch(m, { mipVariance: mv, roughStrength: 1.0 });
  }
  return m;
 }

 const MATS = {
  plinthScoria: makeSlotMat('plinth_scoria', 0x3b2824, 0.88, 0.0),
  plinthBasalt: makeSlotMat('plinth_basalt', 0x2e3136, 0.78, 0.04),
  mortarTuff:   makeSlotMat('mortar_tuff',   0xb69c6c, 0.86, 0.0),
  wallLime:     makeSlotMat('wall_lime',     0xe4ded0, 0.82, 0.0),
  roofGrey:     makeSlotMat('roof_grey',     0x5c6268, 0.68, 0.04),
  roofCeladon:  makeSlotMat('roof_celadon',  0x7da48c, 0.34, 0.06),
  metalCuproni: makeSlotMat('metal_cuproni', 0x568e78, 0.44, 0.65),
  metalNickel:  makeSlotMat('metal_nickel',  0x7b828a, 0.36, 0.85),
  woodDrift:    makeSlotMat('wood_drift',    0x6e5d4b, 0.84, 0.0),
  strataCoal:   makeSlotMat('strata_coal',   0x202226, 0.64, 0.06)
 };

 /* Patch ETK (kits/eternian read in place) materials with Stage 5 KMAT_M1 M2 km1RoughAA */
 if (typeof ETK !== 'undefined' && ETK.MAT && typeof KMAT_M1 !== 'undefined' && KMAT_M1.patch) {
  const etKeys = ['celadon', 'glaze', 'tile', 'stone', 'iron', 'gunmetal', 'bronze', 'verdigris'];
  for (let i = 0; i < etKeys.length; i++) {
   const k = etKeys[i];
   const em = ETK.MAT[k];
   const mv = BP_MIPVAR.forFamily(k);
   if (em && mv) {
    KMAT_M1.patch(em, { mipVariance: mv, roughStrength: 1.0 });
   }
  }
 }

 /* 2. Run Dual KCITY Plans (battered_rim + battered_cove) & Exile Dress Table */
 if (typeof BIO !== 'undefined' && BIO.tagReg) BIO.tagReg();
 if (!KTAGS.page) KTAGS.page = KTAGS.create({ build: 'battered-port' });
 const PLANS = BP_CITY.buildPlans({ tags: KTAGS.page });
 const DRESS = BP_EXILE.buildDressTable(PLANS.lots);

 /* 3. Build Subterranean KCAVERN (Da-wò-hò Sea-Cave Vault & 640 m Western Bolt-Hole Tunnel) */
 let cavernCut = null;
 const cavernGroup = new THREE.Group();
 cavernGroup.name = 'bp_palagonite_caverns';
 scene.add(cavernGroup);

 if (typeof KCAVERN !== 'undefined' && KCAVERN.build) {
  try {
   const C = BP_SITE.SEA_CAVE;
   const B = BP_SITE.BOLT_HOLE;
   const cSpec = {
    seed: BP_SITE.SEED ^ 0xca7e,
    chambers: [
     { id: 'da_wo_ho_main', x: C.cx, z: C.cz, rx: C.rx, rz: C.rz, floor: C.floorY, ceil: C.crownY }
    ],
    tunnels: [
     { id: 'bolt_hole_640m', pts: B.pts, w: B.widthM, floor: B.floorY, ceil: B.crownY }
    ],
    entrances: [
     { x: C.mouth.x, z: C.mouth.z, r: 16.0, floor: C.floorY, ceil: C.mouth.crownY },
     { x: -924, z: 46, r: 12.0, floor: B.floorY, ceil: B.crownY }
    ]
   };
   const builtCav = KCAVERN.build(cSpec, { ground: terrainH });
   if (KCAVERN.draw && builtCav) {
    const cm = KCAVERN.draw(builtCav, MATS.mortarTuff, { THREE: THREE });
    if (cm) {
     cavernGroup.add(cm);
     cm.updateMatrixWorld(true);
     if (typeof KDRAWN !== 'undefined') KDRAWN.add(KDRAWN.fromObject(cm));
    }
   }
   if (KCAVERN.cutBoxes && builtCav) {
    cavernCut = builtCav;
   }
  } catch (e) {}
 }

 /* Explicit rock-cut yellow-tan palagonite sea-cave arch portal & vaulted gallery shell so Da-wò-hò reads boldly */
 {
  const C = BP_SITE.SEA_CAVE;
  const archGeo = new THREE.TorusGeometry(13.5, 4.2, 10, 24, Math.PI);
  const archMesh = new THREE.Mesh(archGeo, MATS.mortarTuff);
  archMesh.position.set(C.mouth.x, 1.5, C.mouth.z);
  archMesh.rotation.y = Math.PI * 0.5;
  cavernGroup.add(archMesh);

  /* Western bolt-hole seaward portal arch at (-924, 46) */
  const westArch = new THREE.Mesh(new THREE.TorusGeometry(7.2, 2.8, 8, 18, Math.PI), MATS.plinthBasalt);
  westArch.position.set(-920, 1.2, 46);
  westArch.rotation.y = -Math.PI * 0.5;
  cavernGroup.add(westArch);

  /* Rock-cut contraband vault terrace shelf inside Da-wò-hò (+5.2 m) */
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(92, 5.4, 38), MATS.mortarTuff);
  shelf.position.set(C.cx - 12, 2.5, C.cz);
  cavernGroup.add(shelf);
  cavernGroup.updateMatrixWorld(true);
  if (typeof KDRAWN !== 'undefined') KDRAWN.add(KDRAWN.fromObject(cavernGroup));
 }

 /* 4. Build Worn Cinder-Cone Ground Mesh + KSTRATA + <=3-Layer Zero-Weight-Guarded KGROUND + KHORIZON */
 const G_SEGS = 240;
 const G_SIZE = BP_SR * 2;
 const groundGeo = new THREE.PlaneGeometry(G_SIZE, G_SIZE, G_SEGS, G_SEGS);
 groundGeo.rotateX(-Math.PI * 0.5);

 const gPos = groundGeo.attributes.position;
 const gUv = groundGeo.attributes.uv;
 const gCount = gPos.count;
 const gCol = new Float32Array(gCount * 3);
 const C_SCORIA = new THREE.Color(0x8a5244).convertSRGBToLinear();
 const C_PALAG  = new THREE.Color(0xc2a670).convertSRGBToLinear();
 const C_BASALT = new THREE.Color(0x50555e).convertSRGBToLinear();
 const C_COBBLE = new THREE.Color(0x746e66).convertSRGBToLinear();
 const C_SHORE  = new THREE.Color(0x42504a).convertSRGBToLinear();
 const _vc = new THREE.Color();

 for (let i = 0; i < gCount; i++) {
  const x = gPos.getX(i), z = gPos.getZ(i);
  const y = terrainH(x, z);
  gPos.setY(i, y);
  gUv.setXY(i, x / 18.0, z / 18.0);

  const inTown = 1.0 - BP_SITE.townBandMask(x, z);
  const palag = (y > -4 && y < 68) ? Math.max(0, 1 - Math.abs(y - 26) / 34) * (1 - BP_SITE.dikeLiftAt(x, z).rib01) : 0;
  const dPlug = Math.hypot(x - BP_SITE.PLUG.x, z - BP_SITE.PLUG.z);

  _vc.copy(C_SCORIA);
  if (palag > 0.05) _vc.lerp(C_PALAG, Math.min(1, palag * 0.88));
  if (dPlug < 195 || BP_SITE.dikeLiftAt(x, z).rib01 > 0.25) {
   _vc.lerp(C_BASALT, Math.max(BP_SITE.dikeLiftAt(x, z).rib01, Math.max(0, 1 - dPlug / 195)));
  }
  if (inTown > 0.2) _vc.lerp(C_COBBLE, Math.min(1, inTown * 0.72));
  if (y < 2.5) _vc.lerp(C_SHORE, Math.min(1, (2.5 - y) / 6.0));

  gCol[i * 3] = _vc.r;
  gCol[i * 3 + 1] = _vc.g;
  gCol[i * 3 + 2] = _vc.b;
 }
 groundGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
 groundGeo.computeVertexNormals();

 const GROUND_MAT = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  vertexColors: true,
  roughness: 0.90,
  metalness: 0.0
 });
 if (!useProc && typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed && KMAT.textures) {
  const Lg = KMAT.packed('battered_port', 'ground_scoria');
  if (Lg) {
   const gtx = KMAT.textures(Lg, { aniso: 8 });
   if (gtx && gtx.map) {
    gtx.map.wrapS = gtx.map.wrapT = THREE.RepeatWrapping;
    GROUND_MAT.map = gtx.map;
    if (gtx.normalMap) {
     gtx.normalMap.wrapS = gtx.normalMap.wrapT = THREE.RepeatWrapping;
     GROUND_MAT.normalMap = gtx.normalMap;
    }
    if (gtx.roughnessMap) {
     gtx.roughnessMap.wrapS = gtx.roughnessMap.wrapT = THREE.RepeatWrapping;
     GROUND_MAT.roughnessMap = gtx.roughnessMap;
    }
   }
  }
 }
 if (typeof KMAT_M1 !== 'undefined' && KMAT_M1.patch) {
  KMAT_M1.patch(GROUND_MAT, { mipVariance: BP_MIPVAR.forFamily('ground_scoria'), roughStrength: 1.0 });
 }

 if (cavernCut && typeof KCAVERN !== 'undefined' && KCAVERN.cutLayer) {
  try { KCAVERN.cutLayer(GROUND_MAT, cavernCut); } catch (e) {}
 }

 const GROUND = new THREE.Mesh(groundGeo, GROUND_MAT);
 GROUND.name = 'bp_cinder_ground';
 GROUND.receiveShadow = true;
 scene.add(GROUND);
 GROUND.updateMatrixWorld(true);
 if (typeof KDRAWN !== 'undefined') KDRAWN.add(KDRAWN.fromObject(GROUND));

 /* Bake KHORIZON directional self-shadowing across the crater walls & Kettle bowl */
 const farH = function(x, z){
  const r = Math.hypot(x, z);
  if (r < BP_SR * 0.96) return terrainH(x, z);
  const dMainCone = Math.hypot(x - 4200, z + 2400);
  const cone = 868.8 * Math.max(0, 1 - dMainCone / 6200);
  const shroud = z > 9500 ? 480 * Math.max(0, 1 - Math.abs(z - 14500) / 4200) : 0;
  return Math.max(-35, cone + shroud - 28 * Math.min(1, (r - BP_SR) / 2200));
 };

 let GROUND_HZ = null;
 window._horizon = { baked: false, mats: 0 };
 if (typeof KHORIZON !== 'undefined' && KHORIZON.bake) {
  try {
   const S0 = BP_SR * 1.02;
   GROUND_HZ = KHORIZON.bake({
    box: [-S0, -S0, S0, S0],
    n: 112,
    h: terrainH,
    far: { h: farH, box: [-16500, -16500, 16500, 16500], n: 96 }
   });
   if (GROUND_HZ && KHORIZON.shade) {
    KHORIZON.shade(GROUND_MAT, GROUND_HZ);
    window._horizon.baked = true;
   }
  } catch (e) {}
 }

 /* 16.5 km KFAR island & Shroudhills leeward strait silhouette */
 let FAR_MESH = null;
 if (typeof KFAR !== 'undefined' && KFAR.grid && KFAR.lines && KFAR.geometry) {
  try {
   const S0 = BP_SR * 0.98, cs = 52;
   const cTmp = new THREE.Color(), cWood = new THREE.Color(0x425e3c), cScor = new THREE.Color(0x6e4438), cSea = new THREE.Color(0x223e46);
   const G = KFAR.grid({
    lines: KFAR.lines({ cell: cs, inner: S0 + cs, out: 16500, grow: 1.042 }),
    dense: true,
    h: function(x, z){
     if (Math.abs(x) < S0 && Math.abs(z) < S0) return terrainH(x, z) - 3.0;
     return farH(x, z);
    },
    skip: function(x0, z0, x1, z1){ return x0 > -S0 + 90 && x1 < S0 - 90 && z0 > -S0 + 90 && z1 < S0 - 90; },
    color: function(x, z, y){
     cTmp.copy(cWood).lerp(cScor, Math.max(0, Math.min(1, (y - 180) / 520)));
     if (y < 0) cTmp.lerp(cSea, Math.max(0, Math.min(1, -y / 14)));
     cTmp.convertSRGBToLinear();
     return [cTmp.r, cTmp.g, cTmp.b];
    }
   });
   const fGeo = KFAR.geometry(G);
   const fp = fGeo.attributes.position, fuv = new Float32Array(fp.count * 2);
   for (let i = 0; i < fp.count; i++) {
    fuv[i * 2] = fp.getX(i) * 0.008;
    fuv[i * 2 + 1] = fp.getZ(i) * 0.008;
   }
   fGeo.setAttribute('uv', new THREE.BufferAttribute(fuv, 2));
   const fMat = new THREE.MeshLambertMaterial({ vertexColors: true, map: GROUND_MAT.map || null });
   fMat.userData.farField = true;
   FAR_MESH = new THREE.Mesh(fGeo, fMat);
   FAR_MESH.name = 'bp_farfield';
   FAR_MESH.userData.farField = true;
   FAR_MESH.userData.probeSkip = true;
   FAR_MESH.frustumCulled = false;
   scene.add(FAR_MESH);
  } catch (e) {}
 }

 /* 5. Exhumed Radial Feeder-Dike Sea-Stacks (KSTACKS) off the Jaws & Western Bolt-Hole */
 if (typeof KSTACKS !== 'undefined' && KSTACKS.make && KSTACKS.mesh) {
  const stackSpecs = [
   { id: 'jaw_stack_w', x: -96, z: 438, r: 13, top: 29.0, ry:  0.12 },
   { id: 'jaw_stack_e', x:  98, z: 442, r: 12, top: 27.5, ry: -0.10 },
   { id: 'bolthole_stack_1', x: -948, z: 22, r: 16, top: 32.0, ry: 0.08 },
   { id: 'bolthole_stack_2', x: -956, z: 74, r: 14, top: 26.0, ry: -0.06 }
  ];
  for (let i = 0; i < stackSpecs.length; i++) {
   const S = stackSpecs[i];
   try {
    const y0 = Math.min(-12.0, terrainH(S.x, S.z) - 2.0);
    const body = KSTACKS.make({
     id: S.id, kind: 'fin', x: S.x, z: S.z, y0: y0, H: S.top - y0,
     r: S.r, e: 3.8, ry: S.ry, taper: 0.28, crown: 0.78, seed: BP_SITE.SEED + i * 31
    });
    const d = KSTACKS.mesh(body, { step: 4.5 });
    if (d && d.pos) {
     const sg = new THREE.BufferGeometry();
     sg.setAttribute('position', new THREE.Float32BufferAttribute(d.pos, 3));
     if (d.uv) sg.setAttribute('uv', new THREE.Float32BufferAttribute(d.uv, 2));
     const nv = d.pos.length / 3;
     const scol = new Float32Array(nv * 3);
     for (let k = 0; k < nv; k++) {
      const ao = 0.52 + 0.48 * (d.occ ? d.occ[k] : 1.0);
      scol[k * 3] = ao * 0.88; scol[k * 3 + 1] = ao * 0.90; scol[k * 3 + 2] = ao * 0.94;
     }
     sg.setAttribute('color', new THREE.BufferAttribute(scol, 3));
     sg.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(d.idx, 1) : new THREE.Uint16BufferAttribute(d.idx, 1));
     sg.computeVertexNormals();
     const sm = new THREE.Mesh(sg, MATS.plinthBasalt);
     sm.name = 'stack_' + S.id;
     scene.add(sm);
     sm.updateMatrixWorld(true);
     if (typeof KDRAWN !== 'undefined') KDRAWN.add(KDRAWN.fromObject(sm));
     KTAGS.page.add({
      'class': 'feature', kind: 'sea_stack', key: S.id, name: 'Feeder-Dike Sea-Stack ' + S.id,
      at: [S.x, 0, S.z], ry: 0, size: [S.r * 2, S.r * 2, S.top]
     });
    }
   } catch (e) {}
  }
 }

 /* 6. Draw Stepped Basalt Crater-Rim Streets & Walkable Zig-Zag Cliff-Stairs (KWALK) */
 const streetGroup = new THREE.Group();
 streetGroup.name = 'bp_streets_and_stairs';
 scene.add(streetGroup);

 function drawWayRibbon(pts, w, lift){
  if (!pts || pts.length < 2) return;
  const verts = [], uvs = [], idx = [];
  let distAcc = 0;
  for (let i = 0; i < pts.length; i++) {
   const p = pts[i];
   const prev = pts[Math.max(0, i - 1)], next = pts[Math.min(pts.length - 1, i + 1)];
   let tx = next[0] - prev[0], tz = next[1] - prev[1];
   const tl = Math.hypot(tx, tz) || 1;
   tx /= tl; tz /= tl;
   const nx = -tz * w * 0.5, nz = tx * w * 0.5;
   if (i > 0) distAcc += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
   const yL = terrainH(p[0] + nx, p[1] + nz) + lift;
   const yR = terrainH(p[0] - nx, p[1] - nz) + lift;
   verts.push(p[0] + nx, yL, p[1] + nz, p[0] - nx, yR, p[1] - nz);
   uvs.push(0, distAcc * 0.25, w * 0.25, distAcc * 0.25);
   if (i < pts.length - 1) {
    const b = i * 2;
    idx.push(b, b + 1, b + 3, b, b + 3, b + 2);
   }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, MATS.plinthBasalt);
  streetGroup.add(m);
 }

 const allWays = PLANS.rimPlan.ways.concat(PLANS.covePlan.ways);
 for (let i = 0; i < allWays.length; i++) {
  const W = allWays[i];
  drawWayRibbon(W.pts, W.w == null ? 6.0 : W.w, 0.14);
 }

 /* Rock-cut Zig-Zag Via-Ferrata Cliff Stairs linking Kettle Quay (+3.8 m) to D2 Rim (+112 m) */
 {
  const stairFlights = [
   [[-46, 3.8, -138], [-82, 38.0, -205]],
   [[-82, 38.0, -205], [-32, 74.0, -268]],
   [[-32, 74.0, -268], [-52, 112.0, -330]]
  ];
  for (let f = 0; f < stairFlights.length; f++) {
   const A = stairFlights[f][0], B = stairFlights[f][1];
   const steps = 28;
   for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const sx = A[0] + (B[0] - A[0]) * t;
    const sy = A[1] + (B[1] - A[1]) * t;
    const sz = A[2] + (B[2] - A[2]) * t;
    const tread = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.65, 2.8), MATS.plinthBasalt);
    tread.position.set(sx, sy - 0.25, sz);
    streetGroup.add(tread);
    if (typeof KWALK !== 'undefined' && KWALK.floor) {
     KWALK.floor({ rect: [sx - 1.6, sx + 1.6, sz - 1.4, sz + 1.4], y: sy + 0.08 });
    }
   }
  }
 }

 /* 7. Flatten & Instance ~985 Eternian Kit Buildings (ETK.proto) with M4 Plot-Base AO + Exile Dress */
 function flattenProtoWithM4AO(G){
  G.updateMatrixWorld(true);
  const groups = {};
  const IM = new THREE.Matrix4(), IC = new THREE.Color();
  G.traverse(function(o){
   if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
   const mat = Array.isArray(o.material) ? null : o.material;
   if (!mat) return;
   const g = o.geometry;
   const sig = mat.uuid + '|' + Object.keys(g.attributes).filter(function(n){ return n !== 'color'; }).sort().join(',');
   const list = groups[sig] || (groups[sig] = { mat: mat, parts: [] });
   if (o.isInstancedMesh) {
    for (let i = 0; i < o.count; i++) {
     o.getMatrixAt(i, IM);
     let ic = null;
     if (o.instanceColor) { o.getColorAt(i, IC); ic = [IC.r, IC.g, IC.b]; }
     list.parts.push({ g: g, m: new THREE.Matrix4().multiplyMatrices(o.matrixWorld, IM), ic: ic });
    }
   } else {
    list.parts.push({ g: g, m: o.matrixWorld.clone(), ic: null });
   }
  });

  const out = [];
  const v3 = new THREE.Vector3(), nm3 = new THREE.Matrix3();
  for (const s in groups) {
   const Q = groups[s], g0 = Q.parts[0].g;
   const names = Object.keys(g0.attributes).filter(function(n){ return n !== 'color'; }).concat(['color']);
   let total = 0, itotal = 0;
   for (let p = 0; p < Q.parts.length; p++) {
    const pg = Q.parts[p].g;
    total += pg.attributes.position.count;
    itotal += pg.index ? pg.index.count : pg.attributes.position.count;
   }
   const sizeOf = function(nm){ return nm === 'color' ? 3 : g0.attributes[nm].itemSize; };
   const A = {};
   for (let ni = 0; ni < names.length; ni++) A[names[ni]] = new Float32Array(total * sizeOf(names[ni]));
   const I = total > 65535 ? new Uint32Array(itotal) : new Uint16Array(itotal);
   let vo = 0, io = 0;

   for (let pi = 0; pi < Q.parts.length; pi++) {
    const part = Q.parts[pi], pg = part.g, cnt = pg.attributes.position.count;
    const ic = part.ic || [1, 1, 1];
    nm3.getNormalMatrix(part.m);

    /* Positions first so M4 plot-base AO can read transformed local Y! */
    const posSrc = pg.attributes.position, posDst = A.position;
    for (let i = 0; i < cnt; i++) {
     v3.fromBufferAttribute(posSrc, i).applyMatrix4(part.m);
     posDst[(vo + i) * 3] = v3.x;
     posDst[(vo + i) * 3 + 1] = v3.y;
     posDst[(vo + i) * 3 + 2] = v3.z;
    }

    for (let ni = 0; ni < names.length; ni++) {
     const nm = names[ni];
     if (nm === 'position') continue;
     const src = pg.attributes[nm], dst = A[nm];
     if (nm === 'color') {
      const csz = src ? src.itemSize : 0;
      for (let ci = 0; ci < cnt; ci++) {
       const ly = posDst[(vo + ci) * 3 + 1];
       const m4ao = BP_MIPVAR.plotBaseAO(ly, 1.85);
       for (let cc = 0; cc < 3; cc++) {
        dst[(vo + ci) * 3 + cc] = (src ? src.array[ci * csz + cc] : 1.0) * ic[cc] * m4ao;
       }
      }
      continue;
     }
     if (!src) continue;
     const sz = src.itemSize;
     if (nm === 'normal') {
      for (let i = 0; i < cnt; i++) {
       v3.fromBufferAttribute(src, i).applyMatrix3(nm3).normalize();
       dst[(vo + i) * 3] = v3.x;
       dst[(vo + i) * 3 + 1] = v3.y;
       dst[(vo + i) * 3 + 2] = v3.z;
      }
     } else {
      for (let i = 0; i < cnt; i++) {
       for (let c = 0; c < sz; c++) dst[(vo + i) * sz + c] = src.array[i * sz + c];
      }
     }
    }

    if (pg.index) {
     for (let k = 0; k < pg.index.count; k++) I[io + k] = pg.index.array[k] + vo;
     io += pg.index.count;
    } else {
     for (let k = 0; k < cnt; k++) I[io + k] = vo + k;
     io += cnt;
    }
    vo += cnt;
   }

   const geo = new THREE.BufferGeometry();
   for (let ni = 0; ni < names.length; ni++) {
    geo.setAttribute(names[ni], new THREE.BufferAttribute(A[names[ni]], sizeOf(names[ni])));
   }
   geo.setIndex(new THREE.BufferAttribute(I, 1));
   geo.computeBoundingSphere();
   if (!Q.mat.vertexColors) { Q.mat.vertexColors = true; Q.mat.needsUpdate = true; }
   out.push({ geo: geo, mat: Q.mat, tris: itotal / 3 });
  }
  return out;
 }

 const protoCache = {};
 const statuaryAuditLog = [];

 function getProto(key, v){
  const pk = key + '#' + (v | 0);
  if (protoCache[pk] !== undefined) return protoCache[pk];
  if (typeof ETK === 'undefined' || !ETK.proto) return (protoCache[pk] = null);
  const G = ETK.proto(key, v | 0);
  if (!G) return (protoCache[pk] = null);
  if (G.userData && G.userData.heads) {
   for (let i = 0; i < G.userData.heads.length; i++) statuaryAuditLog.push(G.userData.heads[i]);
  }
  const parts = flattenProtoWithM4AO(G);
  protoCache[pk] = { key: key, v: v | 0, parts: parts, fixtures: G.userData.fixtures || null };
  return protoCache[pk];
 }

 const cityGroup = new THREE.Group();
 cityGroup.name = 'bp_exile_city';
 scene.add(cityGroup);

 /* Group standing completed lots by (key, v) for instanced drawing; constructMesh + KCONS for active sites */
 const byProto = {};
 const plinthScoriaList = [];
 const plinthBasaltList = [];
 const galleryList = [];
 const figureheadLintelList = [];
 const fixtureDoors = [];
 const fixtureWindows = [];

 for (let i = 0; i < PLANS.lots.length; i++) {
  const L = PLANS.lots[i];
  if (L.key === 'bp_cliff_hoist' || L.key === 'bp_dike_boom') continue;
  const dr = DRESS.byLotId[L.id];

  /* Scoria / Columnar Basalt terraced plinth under every building */
  const plinthH = Math.max(1.4, (L.drop == null ? 0 : L.drop) + 2.6);
  const pRec = { x: L.x, y: L.y - plinthH * 0.5 + 0.08, z: L.z, ry: L.ry, w: L.w + 0.6, h: plinthH, d: L.d + 0.6 };
  if (dr && dr.plinthMat === 'plinth_basalt') plinthBasaltList.push(pRec);
  else plinthScoriaList.push(pRec);

  /* Cantilevered ironkneepodocarp driftwood sea-gallery on crater-facing upper rim facades */
  if (dr && dr.seaGallery) {
   galleryList.push(L);
  }
  if (dr && dr.doorMaskMode === 'open_eyed_figurehead') {
   figureheadLintelList.push(L);
  }

  const P = getProto(L.key, L.v);
  if (!P) continue;

  if (L.underConstruction && typeof KCITY !== 'undefined' && KCITY.constructMesh) {
   const cm = KCITY.constructMesh(P.parts);
   cm.set(L.buildProgress);
   cm.group.position.set(L.x, L.y, L.z);
   cm.group.rotation.y = L.ry;
   cityGroup.add(cm.group);
   if (typeof KCONS !== 'undefined' && KCONS.site) {
    try {
     const cs = KCONS.site({ w: L.w, d: L.d, h: L.h, bill: { planks: 6, blocks: 8, rope: 3 } });
     cs.set(L.buildProgress);
     cs.group.position.set(L.x, L.y, L.z);
     cs.group.rotation.y = L.ry;
     cityGroup.add(cs.group);
    } catch (e) {}
   }
   continue;
  }

  const pk = L.key + '#' + (L.v | 0);
  (byProto[pk] || (byProto[pk] = { P: P, items: [] })).items.push(L);

  /* Register walkable ground floor & KDOOR / KGLASS fixtures on civic landmarks */
  if (L.civic && P.fixtures) {
   const cs = Math.cos(L.ry), sn = Math.sin(L.ry);
   const doors = P.fixtures.doors || [];
   for (let dIdx = 0; dIdx < doors.length; dIdx++) {
    const q = doors[dIdx];
    const wx = L.x + q.x * cs + q.z * sn;
    const wz = L.z - q.x * sn + q.z * cs;
    fixtureDoors.push({ x: +wx.toFixed(2), y: +(L.y + q.y).toFixed(2), z: +wz.toFixed(2), yaw: +(L.ry + q.yaw).toFixed(3), w: q.w, h: q.h == null ? 2.2 : q.h, lotId: L.id });
   }
   const wins = P.fixtures.windows || [];
   for (let wIdx = 0; wIdx < wins.length; wIdx++) {
    const q = wins[wIdx];
    const wx = L.x + q.x * cs + q.z * sn;
    const wz = L.z - q.x * sn + q.z * cs;
    fixtureWindows.push({ x: +wx.toFixed(2), y: +(L.y + q.y).toFixed(2), z: +wz.toFixed(2), yaw: +(L.ry + q.yaw).toFixed(3), w: q.w, h: q.h, lotId: L.id });
   }
  }
 }

 /* Emit InstancedMeshes for all grouped buildings */
 const _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion(), _yAxis = new THREE.Vector3(0, 1, 0), _p3 = new THREE.Vector3(), _s3 = new THREE.Vector3(1, 1, 1);
 Object.keys(byProto).forEach(function(pk){
  const entry = byProto[pk], P = entry.P, items = entry.items;
  for (let pi = 0; pi < P.parts.length; pi++) {
   const part = P.parts[pi];
   const im = new THREE.InstancedMesh(part.geo, part.mat, items.length);
   im.frustumCulled = false;
   for (let i = 0; i < items.length; i++) {
    const it = items[i];
    _p3.set(it.x, it.y, it.z);
    _q4.setFromAxisAngle(_yAxis, it.ry);
    _m4.compose(_p3, _q4, _s3);
    im.setMatrixAt(i, _m4);
   }
   im.instanceMatrix.needsUpdate = true;
   cityGroup.add(im);
  }
 });

 /* Emit Instanced Scoria & Columnar Basalt Plinths */
 function addPlinthInstances(list, mat){
  if (!list.length) return;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const im = new THREE.InstancedMesh(geo, mat, list.length);
  im.frustumCulled = false;
  for (let i = 0; i < list.length; i++) {
   const r = list[i];
   _p3.set(r.x, r.y, r.z);
   _q4.setFromAxisAngle(_yAxis, r.ry);
   _s3.set(r.w, r.h, r.d);
   _m4.compose(_p3, _q4, _s3);
   im.setMatrixAt(i, _m4);
  }
  im.instanceMatrix.needsUpdate = true;
  cityGroup.add(im);
 }
 addPlinthInstances(plinthScoriaList, MATS.plinthScoria);
 addPlinthInstances(plinthBasaltList, MATS.plinthBasalt);
 _s3.set(1, 1, 1);

 /* Emit Instanced Cantilevered Ironkneepodocarp Driftwood Sea-Galleries */
 if (galleryList.length > 0) {
  const galGeo = new THREE.BoxGeometry(5.6, 0.28, 1.85);
  const galIm = new THREE.InstancedMesh(galGeo, MATS.woodDrift, galleryList.length);
  galIm.frustumCulled = false;
  for (let i = 0; i < galleryList.length; i++) {
   const L = galleryList[i];
   const fx = Math.sin(L.ry) * (L.d * 0.5 + 0.85);
   const fz = Math.cos(L.ry) * (L.d * 0.5 + 0.85);
   _p3.set(L.x + fx, L.y + Math.min(4.2, L.h * 0.52), L.z + fz);
   _q4.setFromAxisAngle(_yAxis, L.ry);
   _m4.compose(_p3, _q4, _s3);
   galIm.setMatrixAt(i, _m4);
  }
  galIm.instanceMatrix.needsUpdate = true;
  cityGroup.add(galIm);
 }

 /* Register top-level interactive KDOOR leaves on key landmarks (Counting-Court, Free Press, Da-wò-hò Vault boom-gate) */
 if (typeof KDOOR !== 'undefined' && KDOOR.add) {
  for (let i = 0; i < Math.min(24, fixtureDoors.length); i++) {
   const fd = fixtureDoors[i];
   try {
    KDOOR.add({ at: [fd.x, fd.y, fd.z], yaw: fd.yaw, w: fd.w, h: fd.h });
   } catch (e) {}
  }
 }

 /* 8. Stage 7 KROOMLIGHT Cutaway Interiors (I1-I4 + Gate 5 vault=true Zero Daylight + Indexed Furniture) */
 const ROOM_LIGHT_TABLE = BP_ROOMS.buildLightTable();
 const interiorGroup = new THREE.Group();
 interiorGroup.name = 'bp_roomlight_interiors';
 scene.add(interiorGroup);

 /* Build room shell slabs with baked I4 KROOMLIGHT.vertexCornerAO + indexed catalog furniture */
 const furnBatch = (typeof KratorFurniture !== 'undefined' && KratorFurniture.batch)
  ? KratorFurniture.batch({ indexed: true })
  : null;

 for (let i = 0; i < BP_ROOMS.ROOMS.length; i++) {
  const R = BP_ROOMS.ROOMS[i];
  const bx = R.box;
  const rw = bx[3] - bx[0], rh = bx[4] - bx[1], rd = bx[5] - bx[2];
  const cx = (bx[0] + bx[3]) * 0.5, cy = (bx[1] + bx[4]) * 0.5, cz = (bx[2] + bx[5]) * 0.5;
  const row = ROOM_LIGHT_TABLE && ROOM_LIGHT_TABLE.byId[R.id];

  /* Subdivided floor & wall shell colored by room daylight + lampAmbience * KROOMLIGHT.vertexCornerAO */
  const shellGeo = new THREE.BoxGeometry(rw, rh, rd, 6, 4, 6);
  const sp = shellGeo.attributes.position, sn = shellGeo.attributes.normal;
  const scol = new Float32Array(sp.count * 3);
  const dayE = row ? row.daylight : 0;
  const lampE = row ? row.lampAmbience : 0.14;
  const baseR = dayE * 0.85 + lampE * 1.15 + 0.08;
  const baseG = dayE * 0.90 + lampE * 0.88 + 0.07;
  const baseB = dayE * 0.98 + lampE * 0.58 + 0.06;

  for (let v = 0; v < sp.count; v++) {
   const wx = cx + sp.getX(v), wy = cy + sp.getY(v), wz = cz + sp.getZ(v);
   const nx = -sn.getX(v), ny = -sn.getY(v), nz = -sn.getZ(v);
   const ao = (typeof KROOMLIGHT !== 'undefined' && KROOMLIGHT.vertexCornerAO)
    ? KROOMLIGHT.vertexCornerAO(wx, wy, wz, nx, ny, nz, bx, 0.95)
    : 1.0;
   scol[v * 3] = Math.min(1, baseR * ao);
   scol[v * 3 + 1] = Math.min(1, baseG * ao);
   scol[v * 3 + 2] = Math.min(1, baseB * ao);
  }
  shellGeo.setAttribute('color', new THREE.BufferAttribute(scol, 3));
  const shellMat = new THREE.MeshStandardMaterial({
   color: R.vault ? 0xb69c6c : 0xe4ded0,
   vertexColors: true,
   roughness: 0.86,
   side: THREE.BackSide
  });
  const shellMesh = new THREE.Mesh(shellGeo, shellMat);
  shellMesh.position.set(cx, cy, cz);
  shellMesh.name = 'room_' + R.id;
  interiorGroup.add(shellMesh);

  /* Furnish room pieces (indexed catalog batch if available, else clean timber/bronze props) */
  for (let f = 0; f < R.furniture.length; f++) {
   const F = R.furniture[f];
   KTAGS.page.add({
    'class': 'furniture', kind: F.key, key: F.key, name: F.key + ' (' + R.name + ')',
    at: [F.x, F.y, F.z], ry: F.ry, size: [1.8, 1.1, 1.0],
    tags: { culture: 'eternian', style: 'exile-unpainted', room: R.id }
   });
   const propMesh = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.88, 1.05), R.vault ? MATS.woodDrift : MATS.metalCuproni);
   propMesh.position.set(F.x, F.y + 0.44, F.z);
   propMesh.rotation.y = F.ry;
   interiorGroup.add(propMesh);
  }
 }
 if (furnBatch && furnBatch.flush) {
  try {
   const fb = furnBatch.flush();
   if (fb) interiorGroup.add(fb);
  } catch (e) {}
 }

 /* Dynamic 6-light gated KROOMLIGHT.pickPool PointLight pool (zero shadow maps in WebGL, updated per camera eye) */
 const ROOM_POOL_LIGHTS = [];
 for (let i = 0; i < 6; i++) {
  const pl = new THREE.PointLight(0xffc987, 0, 14, 2);
  pl.castShadow = false;
  pl.visible = false;
  scene.add(pl);
  ROOM_POOL_LIGHTS.push(pl);
 }

 function updateRoomPool(){
  if (!ROOM_LIGHT_TABLE) return;
  const picks = BP_ROOMS.poolForEye([camera.position.x, camera.position.y, camera.position.z], 0.85, ROOM_LIGHT_TABLE);
  for (let i = 0; i < ROOM_POOL_LIGHTS.length; i++) {
   const L = ROOM_POOL_LIGHTS[i];
   if (i < picks.length) {
    const P = picks[i];
    L.position.set(P.at[0], P.at[1], P.at[2]);
    L.color.setRGB(P.color[0], P.color[1], P.color[2]);
    L.intensity = P.amp * 0.75;
    L.distance = P.range;
    L.visible = true;
   } else {
    L.intensity = 0;
    L.visible = false;
   }
  }
 }
 bpTick(updateRoomPool);

 /* 9. Build Cliff-Hoists, Feeder-Dike Chain-Boom, Tsunami Gong-Tower & Smuggler Fleet */
 BP_FLEET.buildHoistsAndBoom(scene, MATS, KTAGS.page);
 BP_FLEET.buildFleet(scene, MATS, KTAGS.page);
 bpTick(function(nowMs){
  BP_FLEET.update(nowMs * 0.001, BP_STATE);
 });

 /* 10. Surrounding Battered Isle Flora & Fauna (biomes/batteredisle read in place, keeping KSPACE town bands clear!) */
 const bioSpace = KSPACE.create({ cell: 18 });
 for (let i = 0; i < PLANS.lots.length; i++) {
  const L = PLANS.lots[i];
  const rLot = Math.max(L.w, L.d) * 0.65 + 8.0;
  if (bioSpace.insert) {
   bioSpace.insert({ x: L.x, z: L.z, r: rLot, kind: 'building' }, L.x, L.z, rLot);
  }
 }
 const districtReserves = [
  { id: 'site:rim_w', x: -460, z: -180, r: 220 },
  { id: 'site:rim_n', x:    0, z: -520, r: 340 },
  { id: 'site:rim_e', x:  430, z: -240, r: 210 },
  { id: 'site:cove',  x:    0, z: -135, r: 240 }
 ];

 let biomeOut = null;
 if (typeof BATTER !== 'undefined' && BATTER.build) {
  try {
   biomeOut = BATTER.build({
    R: BP_SR - 60,
    quality: PQ.has('q') ? +PQ.get('q') : 0.68,
    station: 'cove',
    space: bioSpace,
    reserves: districtReserves
   });
   const b = BIO.bake();
   scene.traverse(function(o){
    if (o.isMesh && o.name === 'biome:far' && o.material && !o.material.map && BATTER.MAT && BATTER.MAT.laurelbark && BATTER.MAT.laurelbark.map) {
     o.material.map = BATTER.MAT.laurelbark.map;
     o.material.needsUpdate = true;
    }
   });
   window._instances = b.inst;
   window._bakeCalls = b.calls;
   if (BIO.impostorLook) BIO.impostorLook({ gain: 1.42, wrap: 0.85 });
   if (BIO.bakeImpostors) BIO.bakeImpostors(renderer, { wait: 160 });
  } catch (e) {
   reportErr('batter flora: ' + (e.stack || e));
  }
 }

 if (GROUND_HZ && typeof KHORIZON !== 'undefined' && KHORIZON.shadeScene) {
  try {
   window._horizon.mats = KHORIZON.shadeScene(scene, GROUND_HZ, {
    filter: function(m){ return !m.userData.farField && m !== GROUND_MAT; }
   });
  } catch (e) {}
 }

 /* KSHADOW strictly off at load (owner rule 2026-11-03); attaches only on UI toggle or ?shadow=1 */
 window._shadow = 'off';
 const attachShadow = function(ui){
  if (typeof KSHADOW === 'undefined' || !KSHADOW.attach || /[?&]shadow=0(&|$)/.test(location.search)) {
   window._shadow = 'off';
   return null;
  }
  try {
   const H = KSHADOW.attach({ renderer: renderer, scene: scene, camera: camera, sun: SUN_LIGHT, ground: terrainH, ui: ui });
   H.cast(scene);
   GROUND.castShadow = false;
   GROUND.receiveShadow = true;
   if (FAR_MESH) { FAR_MESH.castShadow = false; FAR_MESH.receiveShadow = false; }
   window._shadow = H;
   return H;
  } catch (e) {
   return null;
  }
 };
 if (/[?&]shadow=1(&|$)/.test(location.search)) attachShadow(null);

 window._buildMs = Math.round(performance.now() - t0);

 return {
  MATS: MATS,
  PLANS: PLANS,
  DRESS: DRESS,
  GROUND: GROUND,
  GROUND_MAT: GROUND_MAT,
  FAR_MESH: FAR_MESH,
  ROOM_LIGHT_TABLE: ROOM_LIGHT_TABLE,
  statuaryAuditLog: statuaryAuditLog,
  fixtureDoors: fixtureDoors,
  fixtureWindows: fixtureWindows,
  biomeOut: biomeOut,
  attachShadow: attachShadow
 };
})();
