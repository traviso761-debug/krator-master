// ================================================================= FLOATING CITY — 49 Moon-Pool Pontoons, 72 Bascules & 70 Bustling Watercraft [draw]
// Builds the 49 octagonal Moon-Pool Pontoons (instanced into 5 draw calls!), 196 seafloor guide-piles,
// 72 hinged bascule canal bridges, Pioneer superconductor catenary cables, 22 Ring Sea dynastic/merchant/ferry
// vessels (including cruising canal ferries & water-taxis), and 48 instanced floating-market sampans.
const FC_PONTOONS_HOISTS = (function () {
  'use strict';

  /* Flatten and merge a RINGSEA vessel's static mesh hierarchy by material to slash draw calls */
  function flattenMergeVessel(vGrp) {
    vGrp.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(vGrp.matrixWorld).invert();
    const buckets = {};
    const v3 = new THREE.Vector3(), n3 = new THREE.Matrix3(), relM = new THREE.Matrix4();
    vGrp.traverse(function (o) {
      if (!o.isMesh || !o.geometry || !o.material || Array.isArray(o.material)) return;
      if (!o.geometry.attributes || !o.geometry.attributes.position) return;
      const uid = o.material.uuid;
      (buckets[uid] || (buckets[uid] = { mat: o.material, list: [] })).list.push(o);
    });
    while (vGrp.children.length) vGrp.remove(vGrp.children[0]);
    Object.keys(buckets).forEach(function (uid) {
      const B = buckets[uid];
      let nv = 0, ni = 0, hasCol = false;
      for (let i = 0; i < B.list.length; i++) {
        const g = B.list[i].geometry;
        nv += g.attributes.position.count;
        ni += g.index ? g.index.count : g.attributes.position.count;
        if (g.attributes.color) hasCol = true;
      }
      if (!nv) return;
      const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2);
      const col = hasCol ? new Float32Array(nv * 3) : null;
      const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
      let vo = 0, io = 0;
      for (let i = 0; i < B.list.length; i++) {
        const m = B.list[i], g = m.geometry;
        relM.multiplyMatrices(inv, m.matrixWorld);
        n3.getNormalMatrix(relM);
        const pA = g.attributes.position, nA = g.attributes.normal, uA = g.attributes.uv, cA = g.attributes.color;
        for (let k = 0; k < pA.count; k++) {
          v3.fromBufferAttribute(pA, k).applyMatrix4(relM);
          pos[(vo + k) * 3] = v3.x; pos[(vo + k) * 3 + 1] = v3.y; pos[(vo + k) * 3 + 2] = v3.z;
          if (nA) {
            v3.fromBufferAttribute(nA, k).applyMatrix3(n3).normalize();
            nor[(vo + k) * 3] = v3.x; nor[(vo + k) * 3 + 1] = v3.y; nor[(vo + k) * 3 + 2] = v3.z;
          }
          if (uA) { uv[(vo + k) * 2] = uA.getX(k); uv[(vo + k) * 2 + 1] = uA.getY(k); }
          if (col) {
            if (cA) { col[(vo + k) * 3] = cA.getX(k); col[(vo + k) * 3 + 1] = cA.getY(k); col[(vo + k) * 3 + 2] = cA.getZ(k); }
            else { col[(vo + k) * 3] = 1; col[(vo + k) * 3 + 1] = 1; col[(vo + k) * 3 + 2] = 1; }
          }
        }
        if (g.index) {
          for (let k = 0; k < g.index.count; k++) idx[io++] = vo + g.index.getX(k);
        } else {
          for (let k = 0; k < pA.count; k++) idx[io++] = vo + k;
        }
        vo += pA.count;
      }
      const mg = new THREE.BufferGeometry();
      mg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      mg.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      mg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      if (col) mg.setAttribute('color', new THREE.BufferAttribute(col, 3));
      mg.setIndex(new THREE.BufferAttribute(idx, 1));
      mg.computeBoundingSphere();
      vGrp.add(new THREE.Mesh(mg, B.mat));
    });
  }

  function buildAll(scene, MATS, cityPlan, tagReg) {
    const root = new THREE.Group();
    root.name = 'fc_pontoons_fleet';
    scene.add(root);

    const wardGroups = {};
    const pontoonFloatSlots = [];
    const basculeMeshes = {};
    const lagoonShips = [];
    const outerShips = [];
    const cruisingShips = [];
    let sampanHullIm = null, sampanCanopyIm = null;
    const sampanRecs = [];

    const initLagoonY = FC_TIDE.tideY('lagoon', 0);
    const _m4 = new THREE.Matrix4(), _p3 = new THREE.Vector3(), _q4 = new THREE.Quaternion(), _s3 = new THREE.Vector3(1, 1, 1), _y = new THREE.Vector3(0, 1, 0);

    /* 1. Build all 49 Octagonal Cellular Moon-Pool Pontoons via InstancedMesh + 196 Seafloor Guide-Piles */
    const nWards = cityPlan.pontoons.length;
    const sides = 8;
    const segTotal = nWards * sides;
    const collarTotal = nWards * 4;

    const unitBox = FC_SUMERU_CORE.uvScaleBox(1, 1, 1, 0.18);
    const pileGeo = new THREE.CylinderGeometry(1.05, 1.25, 42.0, 8);
    const collarGeo = new THREE.CylinderGeometry(1.65, 1.65, 2.2, 10);

    const hullIm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), MATS.cypressHull, segTotal);
    const deckIm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), MATS.travertineStone, segTotal);
    const curbIm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), MATS.cobaltGlaze, segTotal);
    const pileIm = new THREE.InstancedMesh(pileGeo, MATS.ancientConcrete, collarTotal);
    const collarIm = new THREE.InstancedMesh(collarGeo, MATS.paktongMetal, collarTotal);
    [hullIm, deckIm, curbIm, pileIm, collarIm].forEach(function (im) {
      im.frustumCulled = false;
      root.add(im);
    });

    let segIdx = 0, colIdx = 0;
    for (let i = 0; i < nWards; i++) {
      const W = cityPlan.pontoons[i];
      const pose = KCITY.floatPose(W, initLagoonY);

      /* Lightweight anchor group tracked by KCITY.hostFloat & FC_CHARS */
      const wg = new THREE.Group();
      wg.name = 'fc_ward_' + W.id;
      wg.position.set(0, pose.deckY, 0);
      root.add(wg);
      wardGroups[W.id] = wg;

      const rInner = W.rMoon;
      const rOuter = W.rOut;
      const rMid = 0.5 * (rInner + rOuter);
      const chord = 2 * rMid * Math.sin(Math.PI / sides) * 1.08;
      const segDepth = rOuter - rInner;
      const hullH = W.draftM + W.freeboardM;
      const innerChord = 2 * rInner * Math.sin(Math.PI / sides) * 1.10;

      for (let s = 0; s < sides; s++) {
        const ang = (s + 0.5) * (2 * Math.PI / sides);
        const sx = W.x + rMid * Math.cos(ang), sz = W.z + rMid * Math.sin(ang);
        const ix = W.x + (rInner + 0.8) * Math.cos(ang), iz = W.z + (rInner + 0.8) * Math.sin(ang);
        const idx = segIdx++;

        /* Hull caisson */
        _p3.set(sx, pose.deckY - hullH * 0.5 - 0.35, sz);
        _q4.setFromAxisAngle(_y, -ang);
        _s3.set(segDepth, hullH, chord);
        _m4.compose(_p3, _q4, _s3);
        hullIm.setMatrixAt(idx, _m4);
        pontoonFloatSlots.push({ mesh: hullIm, index: idx, wardId: W.id, x: sx, z: sz, ry: -ang, localY: -hullH * 0.5 - 0.35, sx: segDepth, sy: hullH, sz: chord });

        /* Travertine deck */
        _p3.set(sx, pose.deckY - 0.36, sz);
        _s3.set(segDepth + 1.0, 0.72, chord + 0.8);
        _m4.compose(_p3, _q4, _s3);
        deckIm.setMatrixAt(idx, _m4);
        pontoonFloatSlots.push({ mesh: deckIm, index: idx, wardId: W.id, x: sx, z: sz, ry: -ang, localY: -0.36, sx: segDepth + 1.0, sy: 0.72, sz: chord + 0.8 });

        /* Moon-pool coping curb */
        _p3.set(ix, pose.deckY + 0.42, iz);
        _s3.set(1.3, 0.85, innerChord);
        _m4.compose(_p3, _q4, _s3);
        curbIm.setMatrixAt(idx, _m4);
        pontoonFloatSlots.push({ mesh: curbIm, index: idx, wardId: W.id, x: ix, z: iz, ry: -ang, localY: 0.42, sx: 1.3, sy: 0.85, sz: innerChord });
      }

      for (let p = 0; p < 4; p++) {
        const pa = (p * 0.5 * Math.PI) + 0.39;
        const px = W.x + (rOuter + 0.9) * Math.cos(pa), pz = W.z + (rOuter + 0.9) * Math.sin(pa);
        const ci = colIdx++;
        _p3.set(px, 5.0, pz);
        _q4.set(0, 0, 0, 1);
        _s3.set(1, 1, 1);
        _m4.compose(_p3, _q4, _s3);
        pileIm.setMatrixAt(ci, _m4);

        _p3.set(px, pose.deckY + 0.8, pz);
        _m4.compose(_p3, _q4, _s3);
        collarIm.setMatrixAt(ci, _m4);
        pontoonFloatSlots.push({ mesh: collarIm, index: ci, wardId: W.id, x: px, z: pz, ry: 0, localY: 0.8, sx: 1, sy: 1, sz: 1 });
      }

      if (typeof KWALK !== 'undefined' && KWALK.floor) {
        KWALK.floor({ rect: [W.x - rOuter * 0.88, W.x + rOuter * 0.88, W.z - rOuter * 0.88, W.z + rOuter * 0.88], y: pose.deckY });
      }
      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'floating_pontoon', key: 'fc.ward.' + W.id,
          name: 'Cellular Moon-Pool Pontoon ' + W.id + ' (' + W.kind + ')',
          at: [W.x, pose.deckY, W.z], ry: 0, size: [rOuter * 2, rOuter * 2, hullH]
        });
      }
    }
    _s3.set(1, 1, 1);
    hullIm.instanceMatrix.needsUpdate = true;
    deckIm.instanceMatrix.needsUpdate = true;
    curbIm.instanceMatrix.needsUpdate = true;
    pileIm.instanceMatrix.needsUpdate = true;
    collarIm.instanceMatrix.needsUpdate = true;

    /* 2. Build all 72 Hinged Bascule Canal Bridges (1 merged mesh per bridge = crisp, fast articulation) */
    const basculeGroup = new THREE.Group();
    basculeGroup.name = 'fc_bascule_gangways';
    root.add(basculeGroup);

    const fixedY = {
      dyke_nne: 6.2,
      sumeru_plinth: 6.2,
      sala_ne: 6.2,
      sala_se: 6.2,
      sala_sw: 6.2,
      sala_w: 6.2
    };
    const nodeXZ = {
      dyke_nne: [148, -145],
      sumeru_plinth: [0, 80],
      sala_ne: [172, -108],
      sala_se: [172, 248],
      sala_sw: [-152, 246],
      sala_w: [-158, -118]
    };
    for (let i = 0; i < cityPlan.pontoons.length; i++) {
      const pw = cityPlan.pontoons[i];
      nodeXZ[pw.id] = [pw.x, pw.z];
    }

    for (let j = 0; j < cityPlan.bascules.length; j++) {
      const BL = cityPlan.bascules[j];
      const A = nodeXZ[BL.from] || [BL.x0 == null ? 0 : BL.x0, BL.z0 == null ? 0 : BL.z0];
      const B = nodeXZ[BL.to] || [BL.x1 == null ? 20 : BL.x1, BL.z1 == null ? 20 : BL.z1];
      const mx = (A[0] + B[0]) * 0.5, mz = (A[1] + B[1]) * 0.5;
      const centerDist = Math.hypot(B[0] - A[0], B[1] - A[1]);
      /* Bridge deck spans edge-to-edge cleanly between pontoon rims! */
      const deckLen = Math.max(18.0, centerDist - 68.0);
      const yaw = Math.atan2(B[0] - A[0], B[1] - A[1]);

      const yawHolder = new THREE.Group();
      yawHolder.position.set(mx, 0, mz);
      yawHolder.rotation.y = yaw;
      basculeGroup.add(yawHolder);

      const bridgeInner = new THREE.Group();
      bridgeInner.position.set(0, initLagoonY + 2.3, 0);
      yawHolder.add(bridgeInner);

      const deck = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.65, deckLen), MATS.cypressHull);
      bridgeInner.add(deck);
      const trussL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.2, deckLen), MATS.paktongMetal);
      trussL.position.set(-2.55, 1.0, 0);
      bridgeInner.add(trussL);
      const trussR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.2, deckLen), MATS.paktongMetal);
      trussR.position.set(2.55, 1.0, 0);
      bridgeInner.add(trussR);
      /* Covered market-bridge celadon canopy on every 3rd canal bridge! */
      if (j % 3 === 0) {
        const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.2, 4), MATS.celadonRoof);
        roof.scale.set(1.0, 1.0, deckLen / 6.0);
        roof.rotation.y = Math.PI * 0.25;
        roof.position.set(0, 3.6, 0);
        bridgeInner.add(roof);
      }
      FC_SUMERU_CORE.mergeStaticGroup(bridgeInner, null);
      basculeMeshes[BL.id] = bridgeInner;
    }

    /* 3. Glowing Cyan Submerged Pioneer Superconductor Catenary Power Cables (merged into 1 draw call!) */
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0x38e8ff,
      emissive: 0x22c8e8,
      emissiveIntensity: 1.45,
      roughness: 0.25,
      metalness: 0.55,
      side: THREE.DoubleSide
    });
    const cableGroup = new THREE.Group();
    cableGroup.name = 'fc_superconductor_cables';
    root.add(cableGroup);
    const cables = cityPlan.cables || [];
    for (let c = 0; c < cables.length; c++) {
      const ch = cables[c];
      const A = nodeXZ[ch.from] || [0, 80], B = nodeXZ[ch.to] || [180, -180];
      const pts = [];
      for (let s = 0; s <= 8; s++) {
        const t = s / 8;
        pts.push(new THREE.Vector3(A[0] + (B[0] - A[0]) * t, -3.2 - 5.5 * Math.sin(t * Math.PI), A[1] + (B[1] - A[1]) * t));
      }
      cableGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.40, 6, false), cableMat));
    }
    FC_SUMERU_CORE.mergeStaticGroup(cableGroup, null);

    /* 4. Bustling Ring Sea Fleet: 16 Moored Dynastic/Merchant Vessels + 6 Actively Cruising Ferries & Junks! */
    if (typeof RINGSEA !== 'undefined' && RINGSEA.make) {
      const moorings = [
        { key: 'riaWestPalaceBarge',     x: -56,  z: 342,  yaw: 0.15,  basin: 'lagoon', name: 'Western Ria 5-Headed Uktena Royal Palace-Barge' },
        { key: 'riaEastPalaceBarge',     x: 62,   z: 342,  yaw: -0.18, basin: 'lagoon', name: 'Upper-Ria Twin-Hongsa Truce Palace-Barge' },
        { key: 'riaPatricianVillaBarge', x: -195, z: 185,  yaw: 0.72,  basin: 'lagoon', name: 'Ria Patrician Canal-Villa Barge' },
        { key: 'riaNobleSalonBarge',     x: 195,  z: -152, yaw: -0.45, basin: 'lagoon', name: 'Suudme-Ria Treaty Salon Barge' },
        { key: 'riaPatricianVillaBarge', x: 185,  z: 192,  yaw: -1.10, basin: 'lagoon', name: 'Amber-Seal Envoy Salon Barge' },
        { key: 'riaNobleSalonBarge',     x: -188, z: -158, yaw: 0.92,  basin: 'lagoon', name: 'Grand Bazaar Guild Barge' },
        { key: 'vothBarge',              x: 285,  z: -592, yaw: 0.45,  basin: 'lagoon', name: 'Suur-Neva Timber & Grain River-Barge' },
        { key: 'vothBarge',              x: -365, z: 590,  yaw: 2.35,  basin: 'lagoon', name: 'Heartland Clay & Amber River-Barge' },
        { key: 'vothJunk',               x: 590,  z: 165,  yaw: -1.45, basin: 'lagoon', name: 'Ria Sound Merchant Junk' },
        { key: 'vothJunk',               x: -592, z: -45,  yaw: 1.65,  basin: 'lagoon', name: 'Farport Spice Junk' },
        { key: 'vothFerry',              x: 132,  z: -585, yaw: 0.25,  basin: 'lagoon', name: 'Crown Bluff Lagoon Passenger Ferry' },
        { key: 'vothFerry',              x: -205, z: 295,  yaw: -0.75, basin: 'lagoon', name: 'SW Boulevard Canal Ferry' },
        { key: 'arkChainedWard',         x: -795, z: 325,  yaw: 0.42,  basin: 'sound',  name: 'Drownlands Chained-Trimaran Ark Ward' },
        { key: 'hkWhaler',               x: 315,  z: -698, yaw: 1.55,  basin: 'sound',  name: 'Crookshore Hueru-Kuran Outrigger Coaster' },
        { key: 'vothJunk',               x: 795,  z: -642, yaw: 1.48,  basin: 'sound',  name: 'East Bluff Suudme Timber Junk' },
        { key: 'vothBarge',              x: 535,  z: -695, yaw: 0.12,  basin: 'sound',  name: 'Waterfall Harbour Freshwater Tanker Barge' }
      ];
      for (let i = 0; i < moorings.length; i++) {
        const M = moorings[i];
        const vObj = RINGSEA.make(M.key);
        if (!vObj || !vObj.group) continue;
        flattenMergeVessel(vObj.group);
        const wy = FC_TIDE.tideY(M.basin, 0);
        vObj.group.position.set(M.x, wy, M.z);
        vObj.group.rotation.y = M.yaw;
        root.add(vObj.group);
        if (M.basin === 'lagoon') lagoonShips.push(vObj.group);
        else outerShips.push(vObj.group);
        if (tagReg) {
          tagReg.add({
            'class': 'vessel', kind: M.key, key: 'fc.vessel.' + i, name: M.name,
            at: [M.x, wy, M.z], ry: M.yaw, size: [36, 14, 14]
          });
        }
      }

      /* 6 Actively Cruising Canal Taxis, Ferries & Sound Coasters gliding along circular water routes! */
      const cruisers = [
        { key: 'vothTaxi',  cx: 0, cz: 80, r: 205, a0: 0.2,  a1: 1.9,  spd: 0.035, basin: 'lagoon' },
        { key: 'vothTaxi',  cx: 0, cz: 80, r: 208, a0: 2.8,  a1: 4.4,  spd: 0.038, basin: 'lagoon' },
        { key: 'vothFerry', cx: 0, cz: 80, r: 598, a0: -0.9, a1: 0.9,  spd: 0.018, basin: 'lagoon' },
        { key: 'vothTaxi',  cx: 0, cz: 80, r: 596, a0: 2.9,  a1: 3.9,  spd: 0.026, basin: 'lagoon' },
        { key: 'vothFerry', cx: 0, cz: 80, r: 765, a0: -1.4, a1: -0.3, spd: 0.016, basin: 'sound'  },
        { key: 'vothJunk',  cx: 0, cz: 80, r: 815, a0: 0.3,  a1: 1.6,  spd: 0.012, basin: 'sound'  }
      ];
      for (let i = 0; i < cruisers.length; i++) {
        const C = cruisers[i];
        const vObj = RINGSEA.make(C.key);
        if (!vObj || !vObj.group) continue;
        flattenMergeVessel(vObj.group);
        root.add(vObj.group);
        cruisingShips.push({ group: vObj.group, spec: C, phase: i * 1.1 });
      }
    }

    /* 5. 52 Instanced Floating-Market Sampans & Hawker Skiffs clustered around Sala-Nam Plazas & Pontoons (2 draw calls!) */
    {
      for (let i = 0; i < cityPlan.pontoons.length; i++) {
        const W = cityPlan.pontoons[i];
        const a = (i * 1.9) % (Math.PI * 2);
        const rr = W.rOut + 4.8;
        sampanRecs.push({
          x: W.x + rr * Math.cos(a),
          z: W.z + rr * Math.sin(a),
          yaw: -a + Math.PI * 0.5,
          phase: i * 0.65,
          col: (i % 3 === 0) ? 0xdba23a : (i % 3 === 1 ? 0x3a8c84 : 0xb83c30)
        });
      }
      sampanHullIm = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.9, 8.2), MATS.cypressHull, sampanRecs.length);
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.65 });
      sampanCanopyIm = new THREE.InstancedMesh(new THREE.ConeGeometry(2.1, 1.4, 4), canopyMat, sampanRecs.length);
      sampanHullIm.frustumCulled = false;
      sampanCanopyIm.frustumCulled = false;
      const cTmp = new THREE.Color();
      for (let i = 0; i < sampanRecs.length; i++) {
        cTmp.setHex(sampanRecs[i].col);
        sampanCanopyIm.setColorAt(i, cTmp);
      }
      if (sampanCanopyIm.instanceColor) sampanCanopyIm.instanceColor.needsUpdate = true;
      root.add(sampanHullIm);
      root.add(sampanCanopyIm);
    }

    function updatePontoonInstanced(lagoonY) {
      for (let i = 0; i < pontoonFloatSlots.length; i++) {
        const s = pontoonFloatSlots[i];
        const wg = wardGroups[s.wardId];
        const wy = wg ? wg.position.y : (lagoonY + 2.2);
        _p3.set(s.x, wy + s.localY, s.z);
        _q4.setFromAxisAngle(_y, s.ry);
        _s3.set(s.sx, s.sy, s.sz);
        _m4.compose(_p3, _q4, _s3);
        s.mesh.setMatrixAt(s.index, _m4);
      }
      _s3.set(1, 1, 1);
      hullIm.instanceMatrix.needsUpdate = true;
      deckIm.instanceMatrix.needsUpdate = true;
      curbIm.instanceMatrix.needsUpdate = true;
      collarIm.instanceMatrix.needsUpdate = true;
    }

    function update(tSec, tideSample) {
      updatePontoonInstanced(tideSample.lagoonY);

      for (let i = 0; i < lagoonShips.length; i++) {
        lagoonShips[i].position.y = tideSample.lagoonY + 0.08 * Math.sin(tSec * 1.1 + i);
      }
      for (let i = 0; i < outerShips.length; i++) {
        outerShips[i].position.y = tideSample.outerY + 0.18 * Math.sin(tSec * 1.3 + i * 1.7);
      }
      for (let i = 0; i < cruisingShips.length; i++) {
        const cs = cruisingShips[i], C = cs.spec;
        const raw = Math.sin(tSec * C.spd + cs.phase);
        const dir = Math.cos(tSec * C.spd + cs.phase) >= 0 ? 1 : -1;
        const u = 0.5 + 0.5 * raw;
        const ang = C.a0 + (C.a1 - C.a0) * u;
        const wy = C.basin === 'lagoon' ? tideSample.lagoonY : tideSample.outerY;
        cs.group.position.set(C.cx + C.r * Math.cos(ang), wy + 0.07 * Math.sin(tSec * 1.8 + i), C.cz + C.r * Math.sin(ang));
        cs.group.rotation.y = Math.atan2(-Math.sin(ang) * dir, Math.cos(ang) * dir);
      }
      if (sampanHullIm && sampanCanopyIm) {
        for (let i = 0; i < sampanRecs.length; i++) {
          const sr = sampanRecs[i];
          const sy = tideSample.lagoonY + 0.15 + 0.08 * Math.sin(tSec * 1.5 + sr.phase);
          _p3.set(sr.x, sy, sr.z);
          _q4.setFromAxisAngle(_y, sr.yaw);
          _m4.compose(_p3, _q4, _s3);
          sampanHullIm.setMatrixAt(i, _m4);
          _p3.set(sr.x, sy + 1.15, sr.z);
          _q4.setFromAxisAngle(_y, sr.yaw + Math.PI * 0.25);
          _m4.compose(_p3, _q4, _s3);
          sampanCanopyIm.setMatrixAt(i, _m4);
        }
        sampanHullIm.instanceMatrix.needsUpdate = true;
        sampanCanopyIm.instanceMatrix.needsUpdate = true;
      }
    }

    return {
      root: root,
      wardGroups: wardGroups,
      basculeMeshes: basculeMeshes,
      fixedY: fixedY,
      update: update
    };
  }

  return { buildAll: buildAll };
})();
