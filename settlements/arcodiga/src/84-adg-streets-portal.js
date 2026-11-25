// ================================================================= ARCODIGA — East Wing Charter Portal, Hexagonal Plazas & Hex Plinths [draw]
// Draws three architectural site systems in minimal draw calls:
//   1. Sculpted East Stiffening Wing Charter Portal Gatehouse & Nephrite/Basalt Forecourt at x = +1020.5..+1062 m, z = +210 m
//      (cleanly terminating Arcodiga's concrete Stiffening Wing into Dīga-Māketi Charter Boulevard with 0 clipping!).
//   2. Merged basalt cobble street network + 6-fold hexagonal court plazas (explicitly clipped outside ADG_SITE.inArcologyKeepout).
//   3. 6-sided flat-Z hexagonal basalt podiums under all hexagonal Eternian buildings (matching etHex(R)) + rectangular podiums.
const ADG_STREETS_PORTAL = (function(){
 const PI = Math.PI;

 /* Open-bottom 6-sided flat-Z hexagonal prism (unit circumradius 1, height 1 from y=-0.5..+0.5, +Y top & outward side normals) */
 function makeEtHexPlinthGeo(){
  const pos = [], nor = [], uv = [], idx = [];
  /* Center top vertex = 0 */
  pos.push(0, 0.5, 0);
  nor.push(0, 1, 0);
  uv.push(0.5, 0.5);
  for (let i = 0; i < 6; i++) {
   const a = i * (PI / 3);
   const cx = Math.cos(a), sz = Math.sin(a);
   pos.push(cx, 0.5, sz);
   nor.push(0, 1, 0);
   uv.push(0.5 + cx * 0.5, 0.5 + sz * 0.5);
  }
  /* Top cap: (0, v_{i+1}, v_i) -> +Y normal */
  for (let i = 0; i < 6; i++) {
   const i0 = 1 + i;
   const i1 = 1 + ((i + 1) % 6);
   idx.push(0, i1, i0);
  }
  /* 6 flat outward side faces */
  for (let i = 0; i < 6; i++) {
   const a0 = i * (PI / 3), a1 = ((i + 1) % 6) * (PI / 3);
   const x0 = Math.cos(a0), z0 = Math.sin(a0);
   const x1 = Math.cos(a1), z1 = Math.sin(a1);
   const ph = a0 + PI / 6;
   const nx = Math.cos(ph), nz = Math.sin(ph);
   const base = pos.length / 3;
   /* B0, B1, T0, T1 */
   pos.push(x0, -0.5, z0, x1, -0.5, z1, x0, 0.5, z0, x1, 0.5, z1);
   nor.push(nx, 0, nz, nx, 0, nz, nx, 0, nz, nx, 0, nz);
   uv.push(0, 0, 1, 0, 0, 1, 1, 1);
   idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
 }

 /* Open-bottom unit box (1x1x1, y=-0.5..+0.5) so zero buried downward triangles exist */
 function makeOpenBottomBoxGeo(){
  const g = new THREE.BoxGeometry(1, 1, 1);
  const srcIdx = g.index.array;
  const keep = [];
  const p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < srcIdx.length; i += 3) {
   const a = srcIdx[i], b = srcIdx[i + 1], c = srcIdx[i + 2];
   if (n.getY(a) < -0.9 && n.getY(b) < -0.9 && n.getY(c) < -0.9) continue;
   keep.push(a, b, c);
  }
  g.setIndex(keep);
  void p;
  return g;
 }

 function buildEastWingPortal(scene, MATS, tagsReg, statuaryAuditLog){
  const portalGroup = new THREE.Group();
  portalGroup.name = 'adg_east_portal_gate';
  scene.add(portalGroup);

  const yRim = terrainH(1036.0, 210.0);
  if (tagsReg && tagsReg.add) {
   tagsReg.add({
    'class': 'building',
    kind: 'adg_east_wing_charter_portal',
    key: 'arcodiga.portal.east_charter_gate',
    name: 'Diga-Maketi East Wing Charter Concourse Portal',
    at: [1024.0, yRim, 210.0],
    ry: Math.PI * 0.5,
    size: [28.0, 14.0, 22.0],
    tags: { culture: 'eternian', state: 'reclaimed', types: ['civic', 'infrastructure'] }
   });
  }

  /* 1. Broad Nephrite-Inlaid Columnar Basalt Forecourt Apron (x = 1021..1062, z = 190..230) */
  const apron = new THREE.Mesh(new THREE.BoxGeometry(42.0, 2.2, 40.0), MATS.cobblePlaza);
  apron.position.set(1041.0, yRim - 0.96, 210.0);
  portalGroup.add(apron);

  const jadeMedallion = new THREE.Mesh(new THREE.BoxGeometry(34.0, 0.24, 6.4), MATS.nephriteSawn);
  jadeMedallion.position.set(1043.0, yRim + 0.08, 210.0);
  portalGroup.add(jadeMedallion);

  /* 2. Twin Stepped Basalt & Bronze Pylons Framing the x = 1020 Concrete Stiffening Wing Bulkhead */
  for (let s = -1; s <= 1; s += 2) {
   const pz = 210.0 + s * 11.8;
   const pylonBase = new THREE.Mesh(new THREE.BoxGeometry(9.6, 21.0, 8.2), MATS.plinthColumnar);
   pylonBase.position.set(1023.2, yRim + 9.5, pz);
   portalGroup.add(pylonBase);

   const pylonCap = new THREE.Mesh(new THREE.BoxGeometry(7.2, 5.4, 6.2), MATS.bronzeLintel);
   pylonCap.position.set(1023.8, yRim + 22.4, pz);
   portalGroup.add(pylonCap);
  }

  /* 3. Monumental Bronze Portal Architrave & Closed-Eyed Ancestor Bulkhead Facing +X onto Charter Boulevard */
  const architrave = new THREE.Mesh(new THREE.BoxGeometry(7.4, 3.8, 32.5), MATS.bronzeLintel);
  architrave.position.set(1024.0, yRim + 14.8, 210.0);
  portalGroup.add(architrave);

  const darkRecess = new THREE.Mesh(
   new THREE.BoxGeometry(2.2, 12.6, 15.2),
   new THREE.MeshStandardMaterial({ color: 0x16191e, roughness: 0.9 })
  );
  darkRecess.position.set(1021.8, yRim + 6.3, 210.0);
  portalGroup.add(darkRecess);

  if (typeof ETK !== 'undefined' && ETK.civicBulkhead) {
   const pGate = ETK.civicBulkhead(15.0, 11.8, 3.8, 4.2);
   pGate.position.set(1023.4, yRim, 210.0);
   pGate.rotation.y = Math.PI * 0.5;
   portalGroup.add(pGate);
   if (pGate.userData && pGate.userData.heads && statuaryAuditLog) {
    for (let i = 0; i < pGate.userData.heads.length; i++) statuaryAuditLog.push(pGate.userData.heads[i]);
   }
  }

  /* 4. Interior Walkable East Wing Highway Deck (x = 38..1016, worldY = +81 m) & Upper Portal Forecourt */
  const hwyDeckProxy = new THREE.Mesh(new THREE.BoxGeometry(976.0, 1.2, 26.0), MATS.cobblePlaza);
  hwyDeckProxy.position.set(526.0, 80.4, 210.0);
  portalGroup.add(hwyDeckProxy);

  if (typeof KWALK !== 'undefined' && KWALK.floor) {
   KWALK.floor({ rect: [38.0, 1016.0, 197.0, 223.0], y: 81.0 });
   KWALK.floor({ rect: [1020.0, 1062.0, 190.0, 230.0], y: yRim + 0.16 });
  }
  portalGroup.updateMatrixWorld(true);
  if (typeof KDRAWN !== 'undefined' && KDRAWN.add) KDRAWN.add(KDRAWN.fromObject(portalGroup));
  return portalGroup;
 }

 function buildStreetsAndPlinths(scene, PLANS, MATS){
  const streetGroup = new THREE.Group();
  streetGroup.name = 'adg_streets_and_plinths';
  scene.add(streetGroup);

  /* 1. Merged Basalt Cobble Streets + 6-Fold Hexagonal Court Plazas (1 single draw call, 0 arcology overlap!) */
  {
   const allVerts = [], allUvs = [], allIdx = [];
   let vBase = 0;

   function appendWayRibbon(pts, w, lift){
    if (!pts || pts.length < 2) return;
    /* Subdivide long segments (~14 m) so streets drape smoothly onto rim terrain and respect arcology keepout */
    const dense = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
     const a = pts[i], b = pts[i + 1];
     const segL = Math.hypot(b[0] - a[0], b[1] - a[1]);
     const nSub = Math.max(1, Math.ceil(segL / 14.0));
     for (let s = 1; s <= nSub; s++) {
      const t = s / nSub;
      dense.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
     }
    }

    let distAcc = 0;
    const base0 = vBase;
    for (let i = 0; i < dense.length; i++) {
     const p = dense[i];
     const prev = dense[Math.max(0, i - 1)], next = dense[Math.min(dense.length - 1, i + 1)];
     let tx = next[0] - prev[0], tz = next[1] - prev[1];
     const tl = Math.hypot(tx, tz) || 1;
     tx /= tl; tz /= tl;
     const nx = -tz * w * 0.5, nz = tx * w * 0.5;
     if (i > 0) distAcc += Math.hypot(p[0] - dense[i - 1][0], p[1] - dense[i - 1][1]);
     const yL = terrainH(p[0] + nx, p[1] + nz) + lift;
     const yR = terrainH(p[0] - nx, p[1] - nz) + lift;
     allVerts.push(p[0] + nx, yL, p[1] + nz, p[0] - nx, yR, p[1] - nz);
     allUvs.push(0, distAcc * 0.22, w * 0.22, distAcc * 0.22);
     if (i < dense.length - 1) {
      const pNext = dense[i + 1];
      if (!ADG_SITE.inArcologyKeepout(p[0], p[1], 1.5) && !ADG_SITE.inArcologyKeepout(pNext[0], pNext[1], 1.5)) {
       const b = base0 + i * 2;
       allIdx.push(b, b + 3, b + 1, b, b + 2, b + 3);
      }
     }
    }
    vBase += dense.length * 2;
   }

   function appendHexPlaza(cx, cz, R, lift){
    if (ADG_SITE.inArcologyKeepout(cx, cz, R + 2.0)) return;
    const base = vBase;
    const yc = terrainH(cx, cz) + lift;
    allVerts.push(cx, yc, cz);
    allUvs.push(cx * 0.16, cz * 0.16);
    for (let i = 0; i < 6; i++) {
     const a = i * (PI / 3);
     const vx = cx + R * Math.cos(a), vz = cz + R * Math.sin(a);
     allVerts.push(vx, terrainH(vx, vz) + lift, vz);
     allUvs.push(vx * 0.16, vz * 0.16);
    }
    /* Upward +Y winding: (center, v_{i+1}, v_i) */
    for (let i = 0; i < 6; i++) {
     const i0 = base + 1 + i;
     const i1 = base + 1 + ((i + 1) % 6);
     allIdx.push(base, i1, i0);
    }
    vBase += 7;
   }

   for (let i = 0; i < PLANS.ways.length; i++) {
    const W = PLANS.ways[i];
    const lift = (W.kind === 'alley' || W.kind === 'lane') ? 0.12 : 0.16;
    appendWayRibbon(W.pts, W.w == null ? 6.0 : W.w, lift);
   }

   const hexPlazas = PLANS.hexPlazas || [];
   for (let i = 0; i < hexPlazas.length; i++) {
    const Pz = hexPlazas[i];
    appendHexPlaza(Pz.x, Pz.z, Pz.r, 0.11);
   }

   if (allVerts.length && allIdx.length) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(allVerts, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(allUvs, 2));
    g.setIndex(allIdx);
    g.computeVertexNormals();
    const sm = new THREE.Mesh(g, MATS.cobblePlaza);
    sm.receiveShadow = true;
    streetGroup.add(sm);
   }
  }

  /* 2. Instanced 6-Sided Hexagonal Basalt Plinths (for hex Eternian lots) & Rectangular Basalt Plinths */
  {
   const hkBoxPlinths = [], etBoxPlinths = [], etHexPlinths = [];
   for (let i = 0; i < PLANS.lots.length; i++) {
    const L = PLANS.lots[i];
    const ph = Math.max(1.5, (L.drop == null ? 0 : L.drop) + 2.6);
    const py = L.y - ph * 0.5 + 0.05;
    if (L.kit === 'eternian' && ADG_TUNE.isHexPiece(L.key, L.v)) {
     const hr = ADG_TUNE.hexPlinthRadius(L.key, L.v) || (Math.max(L.w, L.d) * 0.52);
     etHexPlinths.push({ x: L.x, y: py, z: L.z, ry: L.ry, rx: hr + 0.55, h: ph, rz: hr + 0.55 });
    } else if (L.kit === 'eternian') {
     etBoxPlinths.push({ x: L.x, y: py, z: L.z, ry: L.ry, rx: L.w + 0.7, h: ph, rz: L.d + 0.7 });
    } else {
     hkBoxPlinths.push({ x: L.x, y: py, z: L.z, ry: L.ry, rx: L.w + 0.7, h: ph, rz: L.d + 0.7 });
    }
   }

   const _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion(), _yA = new THREE.Vector3(0, 1, 0), _p3 = new THREE.Vector3(), _s3 = new THREE.Vector3();
   function emitInstanced(geo, list, mat){
    if (!list.length) return;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    for (let i = 0; i < list.length; i++) {
     const r = list[i];
     _p3.set(r.x, r.y, r.z);
     _q4.setFromAxisAngle(_yA, r.ry);
     _s3.set(r.rx, r.h, r.rz);
     _m4.compose(_p3, _q4, _s3);
     im.setMatrixAt(i, _m4);
    }
    im.instanceMatrix.needsUpdate = true;
    KCITY.boundedInstanced(im);
    streetGroup.add(im);
   }

   const boxGeo = makeOpenBottomBoxGeo();
   const hexGeo = makeEtHexPlinthGeo();
   emitInstanced(boxGeo, hkBoxPlinths, MATS.plinthColumnar);
   emitInstanced(boxGeo, etBoxPlinths, MATS.plinthBasalt);
   emitInstanced(hexGeo, etHexPlinths, MATS.plinthBasalt);
  }

  streetGroup.updateMatrixWorld(true);
  if (typeof KDRAWN !== 'undefined' && KDRAWN.add) KDRAWN.add(KDRAWN.fromObject(streetGroup));
  return streetGroup;
 }

 return {
  buildEastWingPortal: buildEastWingPortal,
  buildStreetsAndPlinths: buildStreetsAndPlinths
 };
})();
