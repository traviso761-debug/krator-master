// ================================================================= ARCODIGA — 3x 90s Cliff-Hoists, Santa Cristina Chime-Well, VTOL Beacon, Ore Nodes & Fleet [draw]
// Draws from ADG_SITE & KTAGS records:
//   - Two Hueru-Kuran 90-second water-ballast basalt & benihi-timber cliff-hoists (Z1 Lagoon +5 m -> Z5 Rim +146..+152 m)
//     plus one Eternal State bronze/iron girder & pneumatic-tube cliff-lift (SE Dam-Lee Quay +6.2 m -> Z6 Cantonment +158 m).
//   - Santa Cristina 25-minute Ghost-Tsunami Drawdown Keyhole Step-Well masonry & suspended emerald-nephrite float-chime ring.
//   - Joint Whale-Oil / Bronze Storm-Beacon on Arcodiga's +337 m VTOL Flight Deck SE corner.
//   - Five surveyed kits/resources mineral outcrops (jade=200, silica=150, coal=209, tin=200, iron=180).
//   - Dual-polity Ring Sea fleet (hkWhaleCat, baidarka skiffs, cFlit-qBon arkChainedWard over -95 m powerhouse, Farport vothJunk).
const ADG_FLEET = (function(){
 const HOIST_RECS = [];
 const VESSEL_RECS = [];
 let _chimeRing = null;
 let _chimeFloat = null;
 let _fleetGroup = null;

 function mergeStaticGroupByMat(root){
  if (!root) return root;
  root.updateMatrixWorld(true);
  const invRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map();
  const toRemove = [];
  (function walk(node){
   if (!node) return;
   if (node !== root && node.userData && node.userData.dynamic) return;
   if (node.isMesh && !node.isInstancedMesh && node.geometry && node.material && !Array.isArray(node.material)) {
    const attr = node.geometry.attributes || {};
    const isSail = !!(node.material.alphaTest === 0.5 && node.material.side === THREE.DoubleSide);
    if (!isSail && attr.position) {
     const hasCol = !!attr.color, hasUv = !!attr.uv;
     const bKey = node.material.uuid + '|' + (hasCol ? 1 : 0) + '|' + (hasUv ? 1 : 0) + '|' + (node.userData && node.userData.probeSkip ? 1 : 0);
     let B = buckets.get(bKey);
     if (!B) {
      B = { mat: node.material, hasCol: hasCol, hasUv: hasUv, probeSkip: !!(node.userData && node.userData.probeSkip), pos: [], nor: [], uv: [], col: [] };
      buckets.set(bKey, B);
     }
     const g = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone();
     const relM = new THREE.Matrix4().multiplyMatrices(invRoot, node.matrixWorld);
     g.applyMatrix4(relM);
     if (!g.attributes.normal) g.computeVertexNormals();
     const flip = relM.determinant() < 0;
     const pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv, ca = g.attributes.color;
     const cnt = pa.count;
     for (let t = 0; t + 2 < cnt; t += 3) {
      const i0 = t, i1 = flip ? t + 2 : t + 1, i2 = flip ? t + 1 : t + 2;
      const idx = [i0, i1, i2];
      for (let k = 0; k < 3; k++) {
       const vi = idx[k];
       B.pos.push(pa.getX(vi), pa.getY(vi), pa.getZ(vi));
       B.nor.push(na.getX(vi), na.getY(vi), na.getZ(vi));
       if (B.hasUv) B.uv.push(ua ? ua.getX(vi) : 0, ua ? ua.getY(vi) : 0);
       if (B.hasCol) B.col.push(ca ? ca.getX(vi) : 1, ca ? ca.getY(vi) : 1, ca ? ca.getZ(vi) : 1);
      }
     }
     toRemove.push(node);
    }
   }
   if (node.children) {
    for (let c = 0; c < node.children.length; c++) walk(node.children[c]);
   }
  })(root);

  for (let i = 0; i < toRemove.length; i++) {
   const m = toRemove[i];
   if (m.parent) m.parent.remove(m);
  }
  buckets.forEach(function(B){
   if (!B.pos.length) return;
   const mg = new THREE.BufferGeometry();
   mg.setAttribute('position', new THREE.Float32BufferAttribute(B.pos, 3));
   mg.setAttribute('normal', new THREE.Float32BufferAttribute(B.nor, 3));
   if (B.hasUv) mg.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
   if (B.hasCol) mg.setAttribute('color', new THREE.Float32BufferAttribute(B.col, 3));
   const mm = new THREE.Mesh(mg, B.mat);
   if (B.probeSkip) mm.userData.probeSkip = true;
   root.add(mm);
  });
  return root;
 }

 function buildHoistsAndLandmarks(scene, mats, tagsReg){
  const group = new THREE.Group();
  group.name = 'adg_hoists_and_landmarks';
  scene.add(group);

  const colMat = mats.plinthColumnar;
  const basMat = mats.plinthBasalt;
  const jadeMat = mats.nephriteSawn;
  const bronzeMat = mats.bronzeLintel;
  const ironMat = mats.ironGirder;
  const timberMat = mats.cypressTimber;
  const boneMat = mats.whaleboneBleached;

  const pierGeo = new THREE.BoxGeometry(2.8, 1.0, 3.4);
  const sheaveGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.52, 16);
  sheaveGeo.rotateX(Math.PI * 0.5);
  const cableGeo = new THREE.CylinderGeometry(0.13, 0.13, 1.0, 8);
  const tankGeo = new THREE.BoxGeometry(3.6, 5.4, 3.2);
  const cradleDeckGeo = new THREE.BoxGeometry(19.0, 0.58, 6.4);
  const cradleRibGeo = new THREE.BoxGeometry(0.48, 1.35, 6.8);

  /* 1. Three 90-second Cliff-Hoists — Solidly Connected to Both Lower Shore/Mole & Upper Cliff Rim via Pier-Supported Viaducts */
  for (let i = 0; i < ADG_SITE.HOISTS.length; i++) {
   const H = ADG_SITE.HOISTS[i];
   const isEt = H.culture === 'eternian';
   const fx = H.foot[0], fz = H.foot[1], hx = H.head[0], hz = H.head[1];
   const liftX = fx + 10.0;
   const hSpan = H.headY - H.footY;

   const tid = tagsReg ? tagsReg.add({
    'class': 'building',
    kind: isEt ? 'et_girder_cliff_lift' : 'hk_cliff_hoist_gantry',
    key: isEt ? 'et_girder_cliff_lift' : 'hk_cliff_hoist_gantry',
    name: H.name,
    at: [liftX, H.footY, fz],
    ry: 0,
    size: [Math.max(28.0, (hx - fx) + 24.0), 16.0, hSpan + 12.0],
    tags: { culture: H.culture, types: ['infrastructure'], job: 'warehousing' }
   }).id : null;

   const hg = new THREE.Group();
   hg.name = H.id;
   group.add(hg);

   const frameMat = isEt ? ironMat : colMat;
   const accMat = isEt ? bronzeMat : jadeMat;
   const pierStoneMat = isEt ? basMat : colMat;
   const deckMat = mats.cobblePlaza || basMat;

   /* 1A. Lower Shore / Mole Freight Transfer Station & Approach Ramp (seated deep into the flush shore/mole apron) */
   {
    const basePad = new THREE.Mesh(new THREE.BoxGeometry(28.0, 9.0, 18.0), pierStoneMat);
    basePad.position.set(liftX - 2.0, H.footY - 4.4, fz);
    hg.add(basePad);

    const lowerStage = new THREE.Mesh(new THREE.BoxGeometry(24.0, 0.52, 15.6), timberMat);
    lowerStage.position.set(liftX - 3.0, H.footY + 0.24, fz);
    hg.add(lowerStage);

    /* Graded timber/cobble freight ramp connecting westward straight onto the Mole / Cove Spine Road */
    const rampEndY = terrainH(fx - 9.0, fz);
    const rampMidY = (H.footY + 0.18 + rampEndY + 0.18) * 0.5;
    const rampPitch = Math.atan2((H.footY - rampEndY), 10.0);
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.52, 11.2), deckMat);
    ramp.position.set(fx - 6.5, rampMidY, fz);
    ramp.rotation.z = rampPitch;
    hg.add(ramp);

    /* Lower Hoist Portal Pylons & Stepped Lintel */
    for (let s = -1; s <= 1; s += 2) {
     const lPylon = new THREE.Mesh(new THREE.BoxGeometry(3.2, 7.6, 2.8), pierStoneMat);
     lPylon.position.set(fx - 2.2, H.footY + 3.8, fz + s * 5.2);
     hg.add(lPylon);
    }
    const lLintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.35, 13.8), accMat);
    lLintel.position.set(fx - 2.2, H.footY + 7.9, fz);
    hg.add(lLintel);
   }

   /* 1B. Four-Column Braced Lattice Vertical Hoist Shaft (y = footY - 4 .. headY + 8) */
   const towerH = hSpan + 12.0;
   const towerMidY = H.footY + towerH * 0.5 - 3.5;
   for (let sx = -1; sx <= 1; sx += 2) {
    const colX = liftX + (sx < 0 ? -4.2 : 4.6);
    for (let sz = -1; sz <= 1; sz += 2) {
     const pCol = new THREE.Mesh(pierGeo, frameMat);
     pCol.scale.set(0.82, towerH, 0.78);
     pCol.position.set(colX, towerMidY, fz + sz * 4.8);
     hg.add(pCol);
    }
   }
   const nTiers = Math.max(4, Math.round(hSpan / 18.5));
   for (let t = 1; t <= nTiers; t++) {
    const ty = H.footY + (hSpan * t) / nTiers;
    for (let sz = -1; sz <= 1; sz += 2) {
     const tieX = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.75, 0.75), frameMat);
     tieX.position.set(liftX + 0.2, ty, fz + sz * 4.8);
     hg.add(tieX);
     if (t < nTiers) {
      const nextY = H.footY + (hSpan * (t + 1)) / nTiers;
      const dLen = Math.hypot(8.8, nextY - ty);
      const diag = new THREE.Mesh(new THREE.BoxGeometry(dLen, 0.48, 0.48), isEt ? accMat : timberMat);
      diag.position.set(liftX + 0.2, (ty + nextY) * 0.5, fz + sz * 4.8);
      diag.rotation.z = (t % 2 === 0 ? 1 : -1) * Math.atan2(nextY - ty, 8.8);
      hg.add(diag);
     }
    }
    const tieZ = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 10.4), frameMat);
    tieZ.position.set(liftX + 4.6, ty, fz);
    hg.add(tieZ);
   }

   /* 1C. Paved Viaduct Bridge Deck, Deep Side Trusses & Rock-Socketed Cliff Support Piers (liftX -> hx + 12 m) */
   {
    const xStart = liftX - 2.5;
    const xEnd = hx + 12.0;
    const bridgeLen = xEnd - xStart;
    const bridgeMidX = (xStart + xEnd) * 0.5;
    const deckY = H.headY + 0.22;

    /* Continuous paved roadway deck connecting tower sheaves straight into the upper cliff-rim street */
    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(bridgeLen, 0.68, 10.4), deckMat);
    bridgeDeck.position.set(bridgeMidX, deckY, fz);
    hg.add(bridgeDeck);

    /* Deep under-deck Warren trusses & upper safety parapets */
    const nPanels = Math.max(4, Math.round(bridgeLen / 14.0));
    const panelW = bridgeLen / nPanels;
    for (let sz = -1; sz <= 1; sz += 2) {
     const zSide = fz + sz * 5.0;
     const topChord = new THREE.Mesh(new THREE.BoxGeometry(bridgeLen, 0.65, 0.75), frameMat);
     topChord.position.set(bridgeMidX, deckY - 0.15, zSide);
     hg.add(topChord);

     const botChord = new THREE.Mesh(new THREE.BoxGeometry(bridgeLen - 6.0, 0.65, 0.75), frameMat);
     botChord.position.set(bridgeMidX + 1.5, deckY - 3.35, zSide);
     hg.add(botChord);

     const parapet = new THREE.Mesh(new THREE.BoxGeometry(bridgeLen, 1.12, 0.42), isEt ? accMat : pierStoneMat);
     parapet.position.set(bridgeMidX, deckY + 0.86, zSide);
     hg.add(parapet);

     for (let p = 0; p <= nPanels; p++) {
      const px = xStart + p * panelW;
      const vPost = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.3, 0.65), frameMat);
      vPost.position.set(px, deckY - 1.75, zSide);
      hg.add(vPost);
      if (p < nPanels) {
       const wLen = Math.hypot(panelW, 3.2);
       const web = new THREE.Mesh(new THREE.BoxGeometry(wLen, 0.44, 0.44), isEt ? accMat : timberMat);
       web.position.set(px + panelW * 0.5, deckY - 1.75, zSide);
       web.rotation.z = (p % 2 === 0 ? 1 : -1) * Math.atan2(3.2, panelW);
       hg.add(web);
      }
     }
    }

    /* Intermediate Rock-Socketed Cliff Support Pier Bents (spaced so liftX..liftX+58 cleanly spans the x = 716 Harbour Road!) */
    const pierXs = isEt
     ? [liftX + 58.0, liftX + 110.0, liftX + 150.0]
     : [liftX + (hx - liftX) * 0.38, liftX + (hx - liftX) * 0.72];
    for (let p = 0; p < pierXs.length; p++) {
     const px = pierXs[p];
     if (px >= hx - 4.0) continue;
     const gY = Math.min(deckY - 6.0, terrainH(px, fz) - 8.0);
     const pH = (deckY - 3.1) - gY;
     if (pH <= 4.0) continue;
     for (let sz = -1; sz <= 1; sz += 2) {
      const bent = new THREE.Mesh(new THREE.BoxGeometry(3.8, pH, 2.8), pierStoneMat);
      bent.position.set(px, gY + pH * 0.5, fz + sz * 4.7);
      hg.add(bent);
     }
     const capBeam = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.4, 11.8), accMat);
     capBeam.position.set(px, deckY - 3.2, fz);
     hg.add(capBeam);
     if (pH > 32.0) {
      const midTie = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.1, 10.8), frameMat);
      midTie.position.set(px, gY + pH * 0.58, fz);
      hg.add(midTie);
     }
    }

    /* Upper Cliff-Rim Masonry Headhouse Abutment & Portal Arch (anchored solidly into Z5/Z6 shore rim!) */
    const rimGroundY = terrainH(hx + 6.0, hz);
    const abutBaseY = Math.min(rimGroundY, deckY) - 10.0;
    const abutH = (deckY + 0.28) - abutBaseY;
    const abutment = new THREE.Mesh(new THREE.BoxGeometry(20.0, abutH, 16.4), pierStoneMat);
    abutment.position.set(hx + 5.5, abutBaseY + abutH * 0.5, hz);
    hg.add(abutment);

    for (let sz = -1; sz <= 1; sz += 2) {
     const uPylon = new THREE.Mesh(new THREE.BoxGeometry(4.2, 8.2, 3.2), pierStoneMat);
     uPylon.position.set(hx + 1.5, deckY + 4.2, hz + sz * 5.2);
     hg.add(uPylon);
    }
    const uArch = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.6, 14.2), accMat);
    uArch.position.set(hx + 1.5, deckY + 8.6, hz);
    hg.add(uArch);

    /* Eternian pneumatic capsule dispatch conduit running from hoist head toward et_tube_station at (892, 415) */
    if (isEt) {
     const pipeLen = 26.0;
     const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, pipeLen, 10), bronzeMat);
     tube.rotation.z = Math.PI * 0.5;
     tube.position.set(hx + 14.0, deckY + 3.4, hz - 4.8);
     hg.add(tube);
    }
   }

   /* 1D. Overhead Sheaves, Hoist Cables, Dynamic Counterweight & Cargo Cradle */
   for (let s = -1; s <= 1; s += 2) {
    const sh = new THREE.Mesh(sheaveGeo, accMat);
    sh.position.set(liftX, H.headY + 6.2, fz + s * 3.1);
    hg.add(sh);

    const cb = new THREE.Mesh(cableGeo, ironMat);
    cb.scale.set(1, hSpan + 5.2, 1);
    cb.position.set(liftX, H.footY + (hSpan + 5.2) * 0.5, fz + s * 3.1);
    hg.add(cb);
   }

   const crossHead = new THREE.Mesh(new THREE.BoxGeometry(10.6, 1.5, 12.6), accMat);
   crossHead.position.set(liftX + 0.2, H.headY + 7.2, fz);
   hg.add(crossHead);

   const cw = new THREE.Mesh(tankGeo, isEt ? bronzeMat : basMat);
   cw.userData.dynamic = true;
   cw.position.set(liftX + 6.8, H.headY - 8.0, fz);

   const cradle = new THREE.Group();
   cradle.userData.dynamic = true;
   cradle.position.set(liftX, H.footY + 0.65, fz);
   cradle.add(new THREE.Mesh(cradleDeckGeo, timberMat));
   for (let r = -3; r <= 3; r++) {
    const rib = new THREE.Mesh(cradleRibGeo, isEt ? ironMat : boneMat);
    rib.position.set(r * 2.7, 0.72, 0);
    cradle.add(rib);
   }
   const crateGeo = new THREE.BoxGeometry(2.2, 1.45, 2.0);
   for (let c = 0; c < 3; c++) {
    const cr = new THREE.Mesh(crateGeo, isEt ? bronzeMat : jadeMat);
    cr.position.set(-4.8 + c * 4.8, 1.02, (c % 2 === 0 ? -1.2 : 1.2));
    cradle.add(cr);
   }
   mergeStaticGroupByMat(cradle);

   /* Merge static viaduct, tower & stations into 3-4 clean meshes by material before attaching dynamic cradle & counterweight */
   mergeStaticGroupByMat(hg);
   hg.add(cw);
   hg.add(cradle);

   hg.updateMatrixWorld(true);
   if (typeof KDRAWN !== 'undefined' && KDRAWN.add) {
    KDRAWN.add(KDRAWN.fromObject(hg));
   }

   HOIST_RECS.push({
    id: H.id,
    tid: tid,
    culture: H.culture,
    name: H.name,
    x: liftX,
    z: fz,
    footY: H.footY,
    headY: H.headY,
    cycleSec: H.cycleSec,
    cradle: cradle,
    counterweight: cw,
    viaductSpanM: +(hx - liftX).toFixed(1),
    clearanceOk: (H.headY - H.footY) >= 135.0
   });
  }

  /* 2. Santa Cristina 25-Min Ghost-Tsunami Keyhole Step-Well & Suspended Emerald-Nephrite Float-Chime Ring */
  {
   const SC = ADG_SITE.SANTA_CRISTINA;
   const rimY = terrainH(SC.x, SC.z);
   if (tagsReg) {
    tagsReg.add({
     'class': 'feature',
     kind: 'tsunami_chime_well',
     key: SC.id,
     name: SC.name,
     at: [SC.x, rimY, SC.z],
     ry: 0,
     size: [SC.radius * 2.4, SC.radius * 2.4, 8.5],
     tags: { culture: 'hueru-kuran', types: ['sacred', 'infrastructure'] }
    });
   }
   const wg = new THREE.Group();
   wg.name = SC.id;
   wg.position.set(SC.x, rimY, SC.z);

   /* Corbelled basalt keyhole collar & stepped descent */
   const collar = new THREE.Mesh(new THREE.TorusGeometry(SC.radius + 0.8, 1.15, 8, 24), colMat);
   collar.rotation.x = Math.PI * 0.5;
   collar.position.y = 0.45;
   wg.add(collar);

   for (let st = 0; st < 6; st++) {
    const stepM = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.55, 1.8), basMat);
    stepM.position.set(0, -0.35 - st * 0.52, SC.radius - 0.8 - st * 1.15);
    wg.add(stepM);
   }

   /* Whale-jawbone arch spanning the mirror-well oculus suspending 8 sawn emerald-nephrite chime slabs */
   for (let s = -1; s <= 1; s += 2) {
    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 6.8, 8), boneMat);
    rib.position.set(s * 3.8, 3.1, 0);
    rib.rotation.z = -s * 0.24;
    wg.add(rib);
   }
   const lintel = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.44, 0.62), jadeMat);
   lintel.position.set(0, 6.1, 0);
   wg.add(lintel);

   _chimeRing = new THREE.Group();
   _chimeRing.userData.dynamic = true;
   _chimeRing.position.set(0, 5.8, 0);
   for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.65 + (k % 3) * 0.28, 0.52), jadeMat);
    slab.position.set(Math.cos(a) * 1.85, -1.35, Math.sin(a) * 1.85);
    slab.rotation.y = -a;
    _chimeRing.add(slab);
   }
   mergeStaticGroupByMat(_chimeRing);
   wg.add(_chimeRing);

   _chimeFloat = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.45, 12), bronzeMat);
   _chimeFloat.userData.dynamic = true;
   _chimeFloat.position.set(0, -2.6, 0);
   wg.add(_chimeFloat);

   group.add(wg);
   wg.updateMatrixWorld(true);
   if (typeof KDRAWN !== 'undefined' && KDRAWN.add) KDRAWN.add(KDRAWN.fromObject(wg));
  }

  /* 3. Joint Hueru-Kuran Whale-Oil / Eternian Bronze Storm-Beacon atop Arcodiga VTOL Deck (+337 m worldY) */
  {
   const bx = 52.0, by = 337.0, bz = -438.0;
   if (tagsReg) {
    tagsReg.add({
     'class': 'prop',
     kind: 'vtol_storm_beacon',
     key: 'adg_vtol_joint_beacon',
     name: 'Joint Whale-Oil & Bronze Tsunami Storm-Beacon (+337 m VTOL Spire)',
     at: [bx, by, bz],
     ry: 0,
     size: [6.4, 6.4, 11.5],
     tags: { culture: 'eternian', types: ['infrastructure', 'landmark'] }
    });
   }
   const bg = new THREE.Group();
   bg.position.set(bx, by, bz);
   const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.1, 4.2, 8), colMat);
   plinth.position.y = 2.1;
   bg.add(plinth);
   const cage = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.5, 4.8, 8), bronzeMat);
   cage.position.y = 6.5;
   bg.add(cage);
   const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb85c });
   const flame = new THREE.Mesh(new THREE.SphereGeometry(1.15, 10, 8), flameMat);
   flame.position.y = 6.8;
   bg.add(flame);
   bg.traverse(function(o){ if (o.isMesh) o.userData.probeSkip = true; });
   group.add(bg);
  }

  /* 4. Surveyed kits/resources Mineral Outcrops (jade=200, silica=150, coal=209, tin=200, iron=180) */
  for (let i = 0; i < ADG_SITE.RESOURCE_NODES.length; i++) {
   const N = ADG_SITE.RESOURCE_NODES[i];
   const ny = terrainH(N.x, N.z);
   if (tagsReg) {
    tagsReg.add({
     'class': 'feature',
     kind: 'resource_node',
     key: 'res_' + N.kind,
     name: 'Crookshore ' + N.kind.toUpperCase() + ' Seam (' + N.rock + ', grade ' + N.grade + ')',
     at: [N.x, ny, N.z],
     ry: i * 0.7,
     size: [9.0, 9.0, 4.5],
     tags: { resource: N.kind, grade: N.grade, byteVal: N.byteVal }
    });
   }
   const nMat = N.kind === 'jade' ? jadeMat : (N.kind === 'coal' ? basMat : (N.kind === 'tin' || N.kind === 'iron' ? bronzeMat : colMat));
   const ng = new THREE.Group();
   ng.position.set(N.x, ny, N.z);
   for (let b = 0; b < 3; b++) {
    const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8 - b * 0.32, 0), nMat);
    rk.position.set((b - 1) * 2.1, 0.9 - b * 0.15, (b % 2 === 0 ? 0.8 : -0.9));
    rk.rotation.set(b * 0.4, i + b, 0.2);
    ng.add(rk);
   }
   group.add(ng);
  }

  mergeStaticGroupByMat(group);
  return group;
 }

 function makeCleanHull(spec, mats){
  const g = new THREE.Group();
  const L = spec.L, B = spec.B;
  const hullGeo = new THREE.CylinderGeometry(B * 0.48, B * 0.32, L, 12, 1, false);
  hullGeo.rotateX(Math.PI * 0.5);
  hullGeo.scale(1.0, 0.52, 1.0);
  const hull = new THREE.Mesh(hullGeo, mats.cypressTimber);
  hull.position.y = 0.48;
  g.add(hull);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, L * 0.58, 8), mats.cypressTimber);
  mast.position.set(0, L * 0.30, 0);
  g.add(mast);
  return g;
 }

 function buildFleet(scene, mats, tagsReg){
  const fleetGroup = new THREE.Group();
  fleetGroup.name = 'adg_charter_fleet';
  scene.add(fleetGroup);

  const fleetSpec = [
   /* Z1 Sheltered Kopa-North Caldera Lagoon (Hueru-Kuran Whalers & Baidarkas) */
   { id: 'hk_whaler_n',     kind: 'hkWhaleCat',     rsKey: 'hk_whaler',    culture: 'hueru-kuran', name: 'Hueru-Kuran Twin-Hull Whaler Kopa-Star',     x:  518, z: -618, ry:  1.45, L: 21.0, B: 7.4, H: 14.5 },
   { id: 'hk_whaler_s',     kind: 'hkWhaleCat',     rsKey: 'hk_whaler',    culture: 'hueru-kuran', name: 'Hueru-Kuran Nephrite Runner Ota-Spray',      x:  512, z: -492, ry:  1.68, L: 21.0, B: 7.4, H: 14.5 },
   { id: 'hk_lagoon_barge', kind: 'vothBarge',      rsKey: 'voth_barge',   culture: 'hueru-kuran', name: 'Caldera Benihi-Log & Blubber Lighter',       x:  538, z: -555, ry:  1.57, L: 18.0, B: 5.2, H:  6.5 },

   /* cFlit-qBon Chained Ark-Ward Salvage Anchorage directly above drowned -95 m Arcodiga Powerhouse! */
   { id: 'cflit_ark_main',  kind: 'arkChainedWard', rsKey: 'ark_ward',     culture: 'cflit-qbon',  name: 'cFlit-qBon Powerhouse Salvage Ark-Ward',     x:  -24, z:   78, ry:  0.18, L: 32.0, B: 14.0, H: 16.0 },
   { id: 'cflit_dive_tug',  kind: 'salvageTug',     rsKey: 'salvage_tug',  culture: 'cflit-qbon',  name: 'Turbine-Vault Paktong Dive-Tender',          x:   28, z:   92, ry: -0.35, L: 16.5, B:  5.4, H:  9.0 },

   /* Z6 Sheltered SE Dam-Lee Farport Junk Coaling & Mast Quay */
   { id: 'et_junk_farport1',kind: 'vothJunk',       rsKey: 'voth_junk',    culture: 'eternian',    name: 'Eternal State Supply Junk Farport-Tribute',  x:  472, z:  556, ry:  0.05, L: 28.0, B:  7.8, H: 19.0 },
   { id: 'et_junk_farport2',kind: 'vothJunk',       rsKey: 'voth_junk',    culture: 'eternian',    name: 'Eternal State Timber & Coal Coaster Lux-III',x:  538, z:  562, ry: -0.08, L: 28.0, B:  7.8, H: 19.0 },
   { id: 'et_lee_tug',      kind: 'salvageTug',     rsKey: 'salvage_tug',  culture: 'eternian',    name: 'Superintendency Relic & Coal Harbor Tug',    x:  396, z:  552, ry:  0.42, L: 16.5, B:  5.4, H:  9.0 }
  ];

  const rsKeys = (typeof RINGSEA !== 'undefined' && RINGSEA.keys) ? RINGSEA.keys : [];
  function pickRsKey(want){
   if (rsKeys.indexOf(want) >= 0) return want;
   const tok = want.split('_')[1] || want;
   for (let i = 0; i < rsKeys.length; i++) {
    if (rsKeys[i].indexOf(tok) >= 0) return rsKeys[i];
   }
   return rsKeys[0] || null;
  }

  for (let i = 0; i < fleetSpec.length; i++) {
   const S = fleetSpec[i];
   if (tagsReg) {
    tagsReg.add({
     'class': 'prop',
     kind: S.kind,
     key: S.kind,
     name: S.name,
     at: [S.x, 0.0, S.z],
     ry: S.ry,
     size: [S.B, S.L, S.H],
     tags: { culture: S.culture, role: 'watercraft' }
    });
   }
   let vg = null;
   if (typeof RINGSEA !== 'undefined' && RINGSEA.make) {
    const rk = pickRsKey(S.rsKey);
    const made = rk ? RINGSEA.make(rk) : null;
    if (made && made.group) vg = made.group;
   }
   if (!vg) vg = makeCleanHull(S, mats);
   vg.traverse(function(o){ if (o.isMesh) o.userData.probeSkip = true; });
   vg.position.set(S.x, 0.0, S.z);
   vg.rotation.y = S.ry;
   const bIdx = S.z < -200 ? 0 : (S.z < 300 ? 1 : 2);
   if (!fleetGroup.children[bIdx]) {
    while (fleetGroup.children.length <= bIdx) fleetGroup.add(new THREE.Group());
   }
   fleetGroup.children[bIdx].add(vg);

   VESSEL_RECS.push({
    id: S.id,
    kind: S.kind,
    culture: S.culture,
    name: S.name,
    x: S.x,
    z: S.z,
    ry: S.ry,
    mesh: vg
   });
  }

  for (let b = 0; b < fleetGroup.children.length; b++) {
   mergeStaticGroupByMat(fleetGroup.children[b]);
   fleetGroup.children[b].traverse(function(o){
    if (o.isMesh && o.geometry) o.geometry.computeBoundingSphere();
   });
  }
  _fleetGroup = fleetGroup;
  return fleetGroup;
 }

 function update(tSec, adgState){
  const mode = (adgState && adgState.mode) || 'Normal Charter';
  const alarm = !!(adgState && adgState.chimeAlarm);

  for (let i = 0; i < HOIST_RECS.length; i++) {
   const H = HOIST_RECS[i];
   let lift01 = 0.0;
   if (mode === 'Hoist Drill 90s Lift') {
    const cyc = ((tSec + i * 19.0) % 90.0) / 90.0;
    lift01 = cyc < 0.72 ? (cyc / 0.72) : (1.0 - (cyc - 0.72) / 0.28);
    lift01 = lift01 * lift01 * (3 - 2 * lift01);
   } else if (mode === 'Ghost-Tsunami Drawdown') {
    /* All 3 cradles hauled & locked at +146..+158 m rim heads well above any bore! */
    lift01 = 0.96;
   } else {
    lift01 = i === 1 ? 0.32 : 0.04;
   }
   const span = (H.headY - 2.4) - (H.footY + 0.65);
   H.cradle.position.y = H.footY + 0.65 + span * lift01;
   H.counterweight.position.y = H.headY - 6.0 - span * lift01 * 0.84;
  }

  if (_chimeRing) {
   _chimeRing.rotation.y = tSec * (alarm ? 1.85 : 0.18);
   _chimeRing.rotation.z = alarm ? Math.sin(tSec * 5.2) * 0.14 : Math.sin(tSec * 0.9) * 0.02;
  }
  if (_chimeFloat) {
   const drop = alarm ? -1.55 : 0.0;
   _chimeFloat.position.y = -2.6 + drop + Math.sin(tSec * 1.4) * 0.05;
  }

  const seaShift = (adgState && adgState.seaOffsetM) == null ? 0.0 : adgState.seaOffsetM;
  if (_fleetGroup) {
   _fleetGroup.position.y = seaShift + Math.sin(tSec * 1.05) * 0.12;
  }
  if (typeof RINGSEA !== 'undefined' && RINGSEA.tick) {
   RINGSEA.tick(tSec);
  }
 }

 return {
  HOIST_RECS: HOIST_RECS,
  VESSEL_RECS: VESSEL_RECS,
  mergeStaticGroupByMat: mergeStaticGroupByMat,
  buildHoistsAndLandmarks: buildHoistsAndLandmarks,
  buildFleet: buildFleet,
  update: update
 };
})();
