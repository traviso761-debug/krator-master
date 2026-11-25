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
    if (W.pts && W.pts.length >= 8 && Math.abs(W.pts[0][0] - 870) < 2.0 && Math.abs(W.pts[0][1] - 525) < 2.0) continue;
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

  /* 2. Instanced 6-Sided Hexagonal Plinths, Rectangular Plinths & Wooden Harbour Sill Pads */
  {
   const hkBoxPlinths = [], etBoxPlinths = [], etHexPlinths = [], woodBoxPlinths = [], woodHexPlinths = [];
   for (let i = 0; i < PLANS.lots.length; i++) {
    const L = PLANS.lots[i];
    const isWoodHarb = L.rawKey && L.rawKey.indexOf('et_wood_') === 0;
    const ph = isWoodHarb
     ? Math.max(0.85, (L.drop == null ? 0 : L.drop) + 1.1)
     : Math.max(1.5, (L.drop == null ? 0 : L.drop) + 2.6);
    const py = L.y - ph * 0.5 + (isWoodHarb ? 0.02 : 0.05);
    if (L.kit === 'eternian' && ADG_TUNE.isHexPiece(L.key, L.v)) {
     const hr = ADG_TUNE.hexPlinthRadius(L.key, L.v) || (Math.max(L.w, L.d) * 0.52);
     (isWoodHarb ? woodHexPlinths : etHexPlinths).push({ x: L.x, y: py, z: L.z, ry: L.ry, rx: hr + 0.35, h: ph, rz: hr + 0.35 });
    } else if (isWoodHarb) {
     woodBoxPlinths.push({ x: L.x, y: py, z: L.z, ry: L.ry, rx: L.w + 0.3, h: ph, rz: L.d + 0.3 });
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
   emitInstanced(boxGeo, woodBoxPlinths, MATS.cypressTimber);
   emitInstanced(hexGeo, woodHexPlinths, MATS.cypressTimber);
  }

  /* 3. Engineered 3D Cliff-Side Harbour Switchback Viaduct & Flush Mole Sea-Walls (merged by material) */
  {
   const causewayGrp = new THREE.Group();
   causewayGrp.name = 'adg_harbour_causeway_and_mole';
   const HR = ADG_SITE.HARBOUR_ROAD || [];

   /* 3A. Seamless Stitched 3D Switchback Viaduct: 13 m Level-Cross-Section Cobble Roadway + 42 m Basalt Retaining Skirt + Parapets */
   if (HR.length >= 2) {
    /* Chaikin 2-pass corner rounding for sweeping viaduct curves */
    let cur = HR.map(function(p){ return [p[0], p[1], p[2]]; });
    for (let pass = 0; pass < 2; pass++) {
     const nxt = [cur[0].slice()];
     for (let i = 0; i < cur.length - 1; i++) {
      const a = cur[i], b = cur[i + 1];
      nxt.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25, a[2] * 0.75 + b[2] * 0.25]);
      nxt.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75, a[2] * 0.25 + b[2] * 0.75]);
     }
     nxt.push(cur[cur.length - 1].slice());
     cur = nxt;
    }

    const samples = [cur[0]];
    for (let i = 0; i < cur.length - 1; i++) {
     const a = cur[i], b = cur[i + 1];
     const segL = Math.hypot(b[0] - a[0], b[1] - a[1]);
     const nSub = Math.max(1, Math.ceil(segL / 5.5));
     for (let s = 1; s <= nSub; s++) {
      const t = s / nSub;
      samples.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
     }
    }

    /* Ensure every sample sits cleanly above local coarse-mesh neighborhood */
    for (let i = 0; i < samples.length; i++) {
     const p = samples[i];
     const gMax = Math.max(
      terrainH(p[0], p[1]),
      terrainH(p[0] + 6.5, p[1]),
      terrainH(p[0] - 6.5, p[1]),
      terrainH(p[0], p[1] + 6.5),
      terrainH(p[0], p[1] - 6.5)
     );
     if (i === 0 || i === samples.length - 1) {
      p[2] = Math.max(p[2], terrainH(p[0], p[1])) + 0.24;
     } else {
      p[2] = Math.max(p[2], gMax + 0.85);
     }
    }
    /* Smooth elevation pass so grade stays monotonic and silky */
    for (let sm = 0; sm < 2; sm++) {
     for (let i = 1; i < samples.length - 1; i++) {
      samples[i][2] = samples[i - 1][2] * 0.25 + samples[i][2] * 0.5 + samples[i + 1][2] * 0.25;
     }
    }

    const hw = 6.4;
    const hwBot = 9.2;
    const skirtDrop = 44.0;
    const dPos = [], dUv = [], dIdx = [];
    const wPos = [], wUv = [], wIdx = [];
    const pPos = [], pUv = [], pIdx = [];
    let sAcc = 0;

    for (let i = 0; i < samples.length; i++) {
     const p = samples[i];
     const prev = samples[Math.max(0, i - 1)], next = samples[Math.min(samples.length - 1, i + 1)];
     let tx = next[0] - prev[0], tz = next[1] - prev[1];
     const tl = Math.hypot(tx, tz) || 1;
     tx /= tl; tz /= tl;
     const ex = -tz, ez = tx;
     if (i > 0) sAcc += Math.hypot(p[0] - samples[i - 1][0], p[1] - samples[i - 1][1]);

     const lx = p[0] - ex * hw, lz = p[1] - ez * hw;
     const rx = p[0] + ex * hw, rz = p[1] + ez * hw;
     const lbx = p[0] - ex * hwBot, lbz = p[1] - ez * hwBot;
     const rbx = p[0] + ex * hwBot, rbz = p[1] + ez * hwBot;
     const yTop = p[2];
     const yBot = yTop - skirtDrop;

     dPos.push(lx, yTop, lz, rx, yTop, rz);
     dUv.push(0, sAcc * 0.20, hw * 2 * 0.20, sAcc * 0.20);

     wPos.push(lx, yTop - 0.08, lz, lbx, yBot, lbz, rx, yTop - 0.08, rz, rbx, yBot, rbz);
     wUv.push(0, sAcc * 0.14, skirtDrop * 0.14, sAcc * 0.14, 0, sAcc * 0.14, skirtDrop * 0.14, sAcc * 0.14);

     /* Raised 1.05 m stone kerbs/parapets along both edges of the viaduct */
     const kIn = hw - 0.65, kOut = hw + 0.15, kH = 1.05;
     pPos.push(
      p[0] - ex * kOut, yTop,      p[1] - ez * kOut,
      p[0] - ex * kIn,  yTop,      p[1] - ez * kIn,
      p[0] - ex * kOut, yTop + kH, p[1] - ez * kOut,
      p[0] - ex * kIn,  yTop + kH, p[1] - ez * kIn,
      p[0] + ex * kIn,  yTop,      p[1] + ez * kIn,
      p[0] + ex * kOut, yTop,      p[1] + ez * kOut,
      p[0] + ex * kIn,  yTop + kH, p[1] + ez * kIn,
      p[0] + ex * kOut, yTop + kH, p[1] + ez * kOut
     );
     for (let k = 0; k < 8; k++) pUv.push((k & 1) * 0.4, sAcc * 0.22);

     if (i < samples.length - 1) {
      const b2 = i * 2;
      dIdx.push(b2, b2 + 1, b2 + 3, b2, b2 + 3, b2 + 2);

      const bw = i * 4;
      /* Left outward battered retaining wall & Right outward battered retaining wall */
      wIdx.push(bw + 1, bw, bw + 4, bw + 1, bw + 4, bw + 5);
      wIdx.push(bw + 3, bw + 6, bw + 2, bw + 3, bw + 7, bw + 6);

      const bp = i * 8;
      /* Left parapet: outer face (0,2,10,8), top (2,3,11,10), inner face (1,9,11,3) */
      pIdx.push(bp, bp + 2, bp + 10, bp, bp + 10, bp + 8);
      pIdx.push(bp + 2, bp + 3, bp + 11, bp + 2, bp + 11, bp + 10);
      pIdx.push(bp + 1, bp + 11, bp + 3, bp + 1, bp + 9, bp + 11);
      /* Right parapet: inner face (4,6,14,12), top (6,7,15,14), outer face (5,13,15,7) */
      pIdx.push(bp + 4, bp + 6, bp + 14, bp + 4, bp + 14, bp + 12);
      pIdx.push(bp + 6, bp + 7, bp + 15, bp + 6, bp + 15, bp + 14);
      pIdx.push(bp + 5, bp + 15, bp + 7, bp + 5, bp + 13, bp + 15);
     }

     /* Projecting masonry counterfort buttresses & bronze lamp bollards every 3rd sample */
     if (i > 0 && i < samples.length - 1 && i % 3 === 0) {
      const butt = new THREE.Mesh(new THREE.BoxGeometry(2.6, 34.0, 2.8), MATS.plinthBasalt);
      butt.position.set(p[0] - hw - 0.8, yTop - 17.2, p[1]);
      causewayGrp.add(butt);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 1.45, 8), MATS.bronzeLintel);
      post.position.set(p[0] - hw + 0.25, yTop + 1.45, p[1]);
      causewayGrp.add(post);
     }
    }

    function addStitched(posArr, uvArr, idxArr, mat){
     if (!idxArr.length) return;
     const g = new THREE.BufferGeometry();
     g.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
     g.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
     g.setIndex(idxArr);
     g.computeVertexNormals();
     causewayGrp.add(new THREE.Mesh(g, mat));
    }
    addStitched(dPos, dUv, dIdx, MATS.cobblePlaza);
    addStitched(wPos, wUv, wIdx, MATS.plinthColumnar);
    addStitched(pPos, pUv, pIdx, MATS.plinthBasalt);

    /* Semicircular Basalt Hairpin Overlook Bastions at North Turn (754, 336) & Lower Turn (708, 474) */
    const bastions = [
     { x: 754.0, z: 336.0, y: 76.5, r: 14.5, h: 46.0 },
     { x: 708.0, z: 474.0, y: 20.5, r: 12.5, h: 26.0 }
    ];
    for (let b = 0; b < bastions.length; b++) {
     const B = bastions[b];
     const drum = new THREE.Mesh(new THREE.CylinderGeometry(B.r, B.r + 3.2, B.h, 14), MATS.plinthColumnar);
     drum.position.set(B.x, B.y - B.h * 0.5, B.z);
     causewayGrp.add(drum);
     const cap = new THREE.Mesh(new THREE.CylinderGeometry(B.r + 0.5, B.r + 0.5, 0.65, 14), MATS.cobblePlaza);
     cap.position.set(B.x, B.y + 0.08, B.z);
     causewayGrp.add(cap);
     const rimCollar = new THREE.Mesh(new THREE.CylinderGeometry(B.r + 0.65, B.r + 0.65, 0.42, 14), MATS.bronzeLintel);
     rimCollar.position.set(B.x, B.y - 0.38, B.z);
     causewayGrp.add(rimCollar);
    }
   }

   /* 3B. Dressed Basalt Mole Sea-Walls, Coping Kerbs, Timber Fender Piles & Bronze Mooring Bollards (West, North & South faces; East border flush to shore!) */
   const moleEdges = [
    [[664, 322], [340, 322],  0, -1],
    [[340, 322], [340, 526], -1,  0],
    [[340, 526], [732, 526],  0,  1]
   ];
   for (let e = 0; e < moleEdges.length; e++) {
    const p0 = moleEdges[e][0], p1 = moleEdges[e][1];
    const nx = moleEdges[e][2], nz = moleEdges[e][3];
    const eLen = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const nSegs = Math.max(1, Math.ceil(eLen / 18.0));
    const yaw = Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
    for (let s = 0; s < nSegs; s++) {
     const t0 = s / nSegs, t1 = (s + 1) / nSegs, tm = (t0 + t1) * 0.5;
     const sx = p0[0] + (p1[0] - p0[0]) * tm;
     const sz = p0[1] + (p1[1] - p0[1]) * tm;
     const sl = eLen / nSegs;
     const topY = Math.max(5.8, terrainH(sx - nx * 4.0, sz - nz * 4.0)) + 0.18;
     const seaH = topY + 6.5;

     const seaWall = new THREE.Mesh(new THREE.BoxGeometry(3.4, seaH, sl + 0.4), MATS.plinthBasalt);
     seaWall.position.set(sx - nx * 1.2, topY - seaH * 0.5, sz - nz * 1.2);
     seaWall.rotation.y = yaw;
     causewayGrp.add(seaWall);

     const kerb = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.44, sl + 0.45), MATS.cobblePlaza);
     kerb.position.set(sx - nx * 1.2, topY + 0.12, sz - nz * 1.2);
     kerb.rotation.y = yaw;
     causewayGrp.add(kerb);

     const fPile = new THREE.Mesh(new THREE.BoxGeometry(0.48, topY + 3.2, 0.48), MATS.cypressTimber);
     fPile.position.set(sx + nx * 0.65, (topY - 2.4) * 0.5, sz + nz * 0.65);
     causewayGrp.add(fPile);

     const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 0.85, 8), MATS.bronzeLintel);
     bollard.position.set(sx - nx * 2.1, topY + 0.62, sz - nz * 2.1);
     causewayGrp.add(bollard);
    }
   }

   if (typeof ADG_FLEET !== 'undefined' && ADG_FLEET.mergeStaticGroupByMat) {
    ADG_FLEET.mergeStaticGroupByMat(causewayGrp);
   }
   streetGroup.add(causewayGrp);
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
