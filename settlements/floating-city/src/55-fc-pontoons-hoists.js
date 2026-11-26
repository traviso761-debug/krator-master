// ================================================================= FLOATING CITY — 30 Multi-Shape Neighborhood Pontoons, 20 Chinampa Gardens, Bascules & Fleet [draw]
// Builds with extreme draw-call efficiency (100% InstancedMesh + material-merged prototypes):
//   1. 30 Large Multi-Shape Neighborhood Floating Platforms (118..152 m across: oct-moon, hex-moon, rect-canal, u-harbour,
//      stepped-bazaar) with buoyant hulls, travertine decks, cobalt-paved internal neighborhood lanes, moon-pool & boat-court
//      copings, corner shrine-turrets, canal boat-steps, seafloor guide-piles & paktong collars (~8 InstancedMeshes total!)
//   2. 20 Dedicated Floating Chinampa / Aquaponic Garden Rafts (curbed buoyant soil beds, shimmering irrigation trenches,
//      320 geometric crop rows of paddy rice, taro, lotus, indigo & mulberry, bamboo windbreaks, compost/tool huts, registered in KDRAWN!)
//   3. 65+ Hinged Bascule Canal Bridges spanning Venetian canals edge-to-edge (3 InstancedMeshes total!)
//   4. Bustling Capital Fleet: 38 Ring Sea Dynastic/Merchant/Cruising Ships + 96 Sampans & Garden Skiffs (instanced per vessel part!)
const FC_PONTOONS_HOISTS = (function () {
  'use strict';

  /* Extract material-merged [{geo, mat}] parts from a RINGSEA vessel prototype once per vessel key */
  function buildVesselParts(key) {
    if (typeof RINGSEA === 'undefined' || !RINGSEA.make) return null;
    const vObj = RINGSEA.make(key);
    if (!vObj || !vObj.group) return null;
    const vGrp = vObj.group;
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
    const out = [];
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
      out.push({ geo: mg, mat: B.mat });
    });
    return out;
  }

  function buildAll(scene, MATS, cityPlan, tagReg) {
    const root = new THREE.Group();
    root.name = 'fc_pontoons_gardens_fleet';
    scene.add(root);

    const wardGroups = {};
    const floatSlots = [];
    const initLagoonY = FC_TIDE.tideY('lagoon', 0);
    const _m4 = new THREE.Matrix4(), _p3 = new THREE.Vector3(), _q4 = new THREE.Quaternion(), _s3 = new THREE.Vector3(1, 1, 1);
    const _y = new THREE.Vector3(0, 1, 0), _eul = new THREE.Euler(0, 0, 0, 'YXZ');

    const hullRecs = [];
    const deckRecs = [];
    const laneRecs = [];
    const curbRecs = [];
    const towerRecs = [];
    const towerRoofRecs = [];
    const pileRecs = [];
    const collarRecs = [];

    function pushLocalBox(arr, W, lx, localY, lz, sx, sy, sz, lry) {
      const wpt = FC_CITY.localToWorld(W.x, W.z, W.yaw == null ? 0 : W.yaw, lx, lz);
      arr.push({
        wardId: W.id,
        x: wpt[0],
        z: wpt[1],
        localY: localY,
        ry: (W.yaw == null ? 0 : W.yaw) + (lry == null ? 0 : lry),
        sx: sx, sy: sy, sz: sz
      });
    }

    /* -------------------------------------------------------------------
       1. Collect Multi-Shape Neighborhood Floating Platforms (30 Major Wards)
       ------------------------------------------------------------------- */
    for (let i = 0; i < cityPlan.pontoons.length; i++) {
      const W = cityPlan.pontoons[i];
      const pose = KCITY.floatPose(W, initLagoonY);

      const wg = new THREE.Group();
      wg.name = 'fc_ward_' + W.id;
      wg.position.set(0, pose.deckY, 0);
      root.add(wg);
      wardGroups[W.id] = wg;

      const hullH = W.draftM + W.freeboardM;

      if (W.shape === 'oct-moon' || W.shape === 'hex-moon') {
        const sides = W.shape === 'hex-moon' ? 6 : 8;
        const rInner = W.rMoon;
        const rOuter = W.rOut;
        const rMid = 0.5 * (rInner + rOuter);
        const chord = 2 * rMid * Math.sin(Math.PI / sides) * 1.09;
        const segDepth = rOuter - rInner;
        const innerChord = 2 * rInner * Math.sin(Math.PI / sides) * 1.12;
        const rLane = rInner + segDepth * 0.52;
        const laneChord = 2 * rLane * Math.sin(Math.PI / sides) * 1.05;

        for (let s = 0; s < sides; s++) {
          const ang = (s + 0.5) * (2 * Math.PI / sides);
          const lx = rMid * Math.sin(ang), lz = rMid * Math.cos(ang);
          const ix = (rInner + 0.9) * Math.sin(ang), iz = (rInner + 0.9) * Math.cos(ang);
          const nx = rLane * Math.sin(ang), nz = rLane * Math.cos(ang);

          pushLocalBox(hullRecs, W, lx, -hullH * 0.5 - 0.35, lz, chord, hullH, segDepth, ang);
          pushLocalBox(deckRecs, W, lx, -0.36, lz, chord + 0.8, 0.72, segDepth + 1.2, ang);
          pushLocalBox(curbRecs, W, ix, 0.42, iz, innerChord, 0.88, 1.4, ang);
          pushLocalBox(laneRecs, W, nx, 0.04, nz, laneChord, 0.14, 5.2, ang);

          /* Canal boat-landing steps on alternating faces */
          if (s % 2 === 0) {
            const bx = (rOuter + 1.4) * Math.sin(ang), bz = (rOuter + 1.4) * Math.cos(ang);
            pushLocalBox(deckRecs, W, bx, -1.1, bz, chord * 0.42, 1.4, 2.8, ang);
          }
        }
        const nPiles = W.shape === 'hex-moon' ? 6 : 6;
        for (let p = 0; p < nPiles; p++) {
          const pa = (p / nPiles) * Math.PI * 2 + 0.25;
          const px = (rOuter + 1.1) * Math.sin(pa), pz = (rOuter + 1.1) * Math.cos(pa);
          const wp = FC_CITY.localToWorld(W.x, W.z, W.yaw, px, pz);
          pileRecs.push({ x: wp[0], z: wp[1] });
          pushLocalBox(collarRecs, W, px, 0.9, pz, 1, 1, 1, 0);
          if (p % 2 === 0) {
            const tx = (rOuter - 4.2) * Math.sin(pa), tz = (rOuter - 4.2) * Math.cos(pa);
            pushLocalBox(towerRecs, W, tx, 2.6, tz, 4.2, 5.2, 4.2, pa);
            pushLocalBox(towerRoofRecs, W, tx, 6.4, tz, 3.6, 2.8, 3.6, pa + Math.PI * 0.25);
          }
        }
      } else if (W.shape === 'u-harbour') {
        const hw = W.w * 0.5, hd = W.d * 0.5;
        const headD = W.d - W.notchD;
        const headZ = -hd + headD * 0.5;
        const wingW = (W.w - W.notchW) * 0.5;
        const wingZ = hd - W.notchD * 0.5;
        const wingX = hw - wingW * 0.5;

        /* Head block + Left & Right U-wings */
        pushLocalBox(hullRecs, W, 0, -hullH * 0.5 - 0.35, headZ, W.w, hullH, headD, 0);
        pushLocalBox(deckRecs, W, 0, -0.36, headZ, W.w + 1.2, 0.72, headD + 1.2, 0);
        pushLocalBox(laneRecs, W, 0, 0.04, headZ + 4.0, W.w - 10.0, 0.14, 6.0, 0);

        for (let sgn = -1; sgn <= 1; sgn += 2) {
          pushLocalBox(hullRecs, W, sgn * wingX, -hullH * 0.5 - 0.35, wingZ, wingW, hullH, W.notchD, 0);
          pushLocalBox(deckRecs, W, sgn * wingX, -0.36, wingZ, wingW + 1.0, 0.72, W.notchD + 1.0, 0);
          pushLocalBox(laneRecs, W, sgn * wingX, 0.04, wingZ, 5.4, 0.14, W.notchD - 8.0, 0);
          /* Inner harbour-court coping + twin harbour-head beacon towers */
          pushLocalBox(curbRecs, W, sgn * (W.notchW * 0.5 + 0.9), 0.42, wingZ, 1.6, 0.88, W.notchD, 0);
          pushLocalBox(towerRecs, W, sgn * (W.notchW * 0.5 + 3.5), 3.0, hd - 4.0, 4.6, 6.0, 4.6, 0);
          pushLocalBox(towerRoofRecs, W, sgn * (W.notchW * 0.5 + 3.5), 7.2, hd - 4.0, 3.9, 3.0, 3.9, Math.PI * 0.25);
        }
        pushLocalBox(curbRecs, W, 0, 0.42, hd - W.notchD - 0.8, W.notchW + 2.0, 0.88, 1.6, 0);

        const pLocs = [[-hw - 1, -hd], [hw + 1, -hd], [-hw - 1, hd], [hw + 1, hd], [-hw - 1, 0], [hw + 1, 0]];
        for (let p = 0; p < pLocs.length; p++) {
          const wp = FC_CITY.localToWorld(W.x, W.z, W.yaw, pLocs[p][0], pLocs[p][1]);
          pileRecs.push({ x: wp[0], z: wp[1] });
          pushLocalBox(collarRecs, W, pLocs[p][0], 0.9, pLocs[p][1], 1, 1, 1, 0);
        }
      } else if (W.shape === 'stepped-bazaar') {
        const hw = W.w * 0.5, hd = W.d * 0.5;
        /* Full base barge + raised +2.4 m central market terrace */
        pushLocalBox(hullRecs, W, 0, -hullH * 0.5 - 0.35, 0, W.w, hullH, W.d, 0);
        pushLocalBox(deckRecs, W, 0, -0.36, 0, W.w + 1.2, 0.72, W.d + 1.2, 0);
        pushLocalBox(deckRecs, W, 0, 1.2, 0, W.stepW, 2.4, W.stepD, 0);
        pushLocalBox(curbRecs, W, 0, 2.42, 0, W.stepW + 1.2, 0.55, W.stepD + 1.2, 0);
        pushLocalBox(laneRecs, W, 0, 0.04, -(W.stepD * 0.5 + 7.0), W.w - 12.0, 0.14, 5.5, 0);
        pushLocalBox(laneRecs, W, 0, 0.04,  (W.stepD * 0.5 + 7.0), W.w - 12.0, 0.14, 5.5, 0);
        /* 4 Axial Bazaar Terrace Stair Flights */
        pushLocalBox(deckRecs, W, 0, 0.9, -(W.stepD * 0.5 + 2.4), 9.0, 1.8, 4.8, 0);
        pushLocalBox(deckRecs, W, 0, 0.9,  (W.stepD * 0.5 + 2.4), 9.0, 1.8, 4.8, 0);

        const cLocs = [[-hw + 4.5, -hd + 4.5], [hw - 4.5, -hd + 4.5], [-hw + 4.5, hd - 4.5], [hw - 4.5, hd - 4.5]];
        for (let c = 0; c < cLocs.length; c++) {
          pushLocalBox(towerRecs, W, cLocs[c][0], 2.6, cLocs[c][1], 4.2, 5.2, 4.2, 0);
          pushLocalBox(towerRoofRecs, W, cLocs[c][0], 6.4, cLocs[c][1], 3.6, 2.8, 3.6, Math.PI * 0.25);
        }
        const pLocs = [[-hw - 1, -hd * 0.7], [hw + 1, -hd * 0.7], [-hw - 1, hd * 0.7], [hw + 1, hd * 0.7], [0, -hd - 1], [0, hd + 1]];
        for (let p = 0; p < pLocs.length; p++) {
          const wp = FC_CITY.localToWorld(W.x, W.z, W.yaw, pLocs[p][0], pLocs[p][1]);
          pileRecs.push({ x: wp[0], z: wp[1] });
          pushLocalBox(collarRecs, W, pLocs[p][0], 0.9, pLocs[p][1], 1, 1, 1, 0);
        }
      } else {
        /* 'rect-canal': 4 sub-slabs framing the open central Moon-Court (moonW x moonD) */
        const hw = W.w * 0.5, hd = W.d * 0.5;
        const sideW = (W.w - W.moonW) * 0.5;
        const sideX = hw - sideW * 0.5;
        const fbD = (W.d - W.moonD) * 0.5;
        const fbZ = hd - fbD * 0.5;

        for (let sgn = -1; sgn <= 1; sgn += 2) {
          pushLocalBox(hullRecs, W, sgn * sideX, -hullH * 0.5 - 0.35, 0, sideW, hullH, W.d, 0);
          pushLocalBox(deckRecs, W, sgn * sideX, -0.36, 0, sideW + 1.0, 0.72, W.d + 1.2, 0);
          pushLocalBox(hullRecs, W, 0, -hullH * 0.5 - 0.35, sgn * fbZ, W.moonW, hullH, fbD, 0);
          pushLocalBox(deckRecs, W, 0, -0.36, sgn * fbZ, W.moonW + 0.6, 0.72, fbD + 1.2, 0);
          pushLocalBox(curbRecs, W, 0, 0.42, sgn * (W.moonD * 0.5 + 0.7), W.moonW + 2.4, 0.88, 1.4, 0);
          pushLocalBox(curbRecs, W, sgn * (W.moonW * 0.5 + 0.7), 0.42, 0, 1.4, 0.88, W.moonD + 1.0, 0);
          /* Internal paved lanes & canal boat-landing steps */
          pushLocalBox(laneRecs, W, sgn * 28.0, 0.04, 0, 5.8, 0.14, W.d - 6.0, 0);
          pushLocalBox(laneRecs, W, 0, 0.04, sgn * 28.5, W.w - 8.0, 0.14, 5.4, 0);
          pushLocalBox(deckRecs, W, 0, -1.1, sgn * (hd + 1.4), 18.0, 1.4, 2.8, 0);
        }
        const cLocs = [[-hw + 4.5, -hd + 4.5], [hw - 4.5, -hd + 4.5], [-hw + 4.5, hd - 4.5], [hw - 4.5, hd - 4.5]];
        for (let c = 0; c < cLocs.length; c++) {
          pushLocalBox(towerRecs, W, cLocs[c][0], 2.6, cLocs[c][1], 4.2, 5.2, 4.2, 0);
          pushLocalBox(towerRoofRecs, W, cLocs[c][0], 6.4, cLocs[c][1], 3.6, 2.8, 3.6, Math.PI * 0.25);
        }
        const pLocs = [[-hw - 1, -hd * 0.7], [hw + 1, -hd * 0.7], [-hw - 1, hd * 0.7], [hw + 1, hd * 0.7], [0, -hd - 1], [0, hd + 1]];
        for (let p = 0; p < pLocs.length; p++) {
          const wp = FC_CITY.localToWorld(W.x, W.z, W.yaw, pLocs[p][0], pLocs[p][1]);
          pileRecs.push({ x: wp[0], z: wp[1] });
          pushLocalBox(collarRecs, W, pLocs[p][0], 0.9, pLocs[p][1], 1, 1, 1, 0);
        }
      }

      if (typeof KWALK !== 'undefined' && KWALK.floor) {
        const hw2 = W.w * 0.44, hd2 = W.d * 0.44;
        KWALK.floor({ rect: [W.x - hw2, W.x + hw2, W.z - hd2, W.z + hd2], y: pose.deckY });
      }
      if (typeof KDRAWN !== 'undefined' && KDRAWN.grid) {
        const dTop = pose.deckY + (W.shape === 'stepped-bazaar' ? 2.4 : 0.0);
        KDRAWN.add(KDRAWN.grid({
          x0: W.x - W.w * 0.5, z0: W.z - W.d * 0.5,
          dx: W.w, dz: W.d, nx: 1, nz: 1,
          h: [dTop, dTop, dTop, dTop]
        }));
      }
      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'floating_pontoon', key: 'fc.ward.' + W.id,
          name: 'Neighborhood Floating Platform ' + W.id + ' (' + W.shape + ', ' + W.kind + ')',
          at: [W.x, pose.deckY, W.z], ry: W.yaw, size: [W.w, W.d, hullH]
        });
      }
    }

    /* -------------------------------------------------------------------
       2. Collect 20 Floating Chinampa / Aquaponic Garden Rafts
       ------------------------------------------------------------------- */
    const gardens = cityPlan.gardens || [];
    const soilRecs = [];
    const cropRecs = [];
    const bloomRecs = [];
    const fenceRecs = [];
    const CROP_COLORS = {
      paddy_taro:    [0x2b6e1e, 0x1d5224],
      lotus_greens:  [0x1e5c34, 0x367222],
      mulberry_silk: [0x24581a, 0x3b6820],
      indigo_dye:    [0x163e42, 0x225448]
    };

    for (let g = 0; g < gardens.length; g++) {
      const G = gardens[g];
      const gPose = KCITY.floatPose(G, initLagoonY);
      const wg = new THREE.Group();
      wg.name = 'fc_garden_' + G.id;
      wg.position.set(0, gPose.deckY, 0);
      root.add(wg);
      wardGroups[G.id] = wg;

      const gHullH = G.draftM + G.freeboardM;
      const hw = G.w * 0.5, hd = G.d * 0.5;

      /* Buoyant cypress-beam & travertine-tuff curbed raft frame */
      pushLocalBox(hullRecs, G, 0, -gHullH * 0.5 - 0.15, 0, G.w, gHullH, G.d, 0);
      pushLocalBox(deckRecs, G, 0, -0.22, 0, G.w + 0.8, 0.40, G.d + 0.8, 0);
      pushLocalBox(curbRecs, G, 0, 0.32, -hd + 0.8, G.w, 0.64, 1.5, 0);
      pushLocalBox(curbRecs, G, 0, 0.32,  hd - 0.8, G.w, 0.64, 1.5, 0);
      pushLocalBox(curbRecs, G, -hw + 0.8, 0.32, 0, 1.5, 0.64, G.d - 2.0, 0);
      pushLocalBox(curbRecs, G,  hw - 0.8, 0.32, 0, 1.5, 0.64, G.d - 2.0, 0);

      /* 4 Irrigated Dark-Loam Chinampa Beds separated by turquoise irrigation trenches + 16 Sculpted Crop Hedgerows! */
      const nBeds = 4;
      const bedSpanZ = G.d - 6.0;
      const bedD = (bedSpanZ / nBeds) - 1.5;
      const bedW = G.w - 9.0;
      const cols = CROP_COLORS[G.theme] || CROP_COLORS.paddy_taro;

      for (let b = 0; b < nBeds; b++) {
        const bz = -bedSpanZ * 0.5 + (b + 0.5) * (bedSpanZ / nBeds);
        const wptS = FC_CITY.localToWorld(G.x, G.z, G.yaw, -2.0, bz);
        soilRecs.push({ wardId: G.id, x: wptS[0], z: wptS[1], localY: 0.24, ry: G.yaw, sx: bedW, sy: 0.48, sz: bedD });

        if (b < nBeds - 1) {
          const cz = bz + (bedSpanZ / nBeds) * 0.5;
          pushLocalBox(laneRecs, G, -2.0, 0.12, cz, bedW, 0.24, 1.15, 0);
        }

        for (let r = 0; r < 4; r++) {
          const rz = bz - bedD * 0.35 + r * (bedD * 0.235);
          const wptC = FC_CITY.localToWorld(G.x, G.z, G.yaw, -2.0, rz);
          const cropH = G.theme === 'mulberry_silk' ? 2.15 : (G.theme === 'indigo_dye' ? 1.45 : 1.15);
          cropRecs.push({
            wardId: G.id,
            x: wptC[0], z: wptC[1],
            localY: 0.48 + cropH * 0.5,
            ry: G.yaw,
            sx: bedW - 1.4, sy: cropH, sz: bedD * 0.15,
            col: cols[(b + r) % 2]
          });
          if ((G.theme === 'lotus_greens' || G.theme === 'indigo_dye') && r % 2 === 0) {
            bloomRecs.push({
              wardId: G.id,
              x: wptC[0], z: wptC[1],
              localY: 0.52 + cropH,
              ry: G.yaw,
              sx: (bedW - 3.2) * 0.72, sy: 0.36, sz: 0.62
            });
          }
        }
      }

      /* Woven Bamboo/Willow Windbreak Trellises + Twin Compost/Tool Huts & Irrigation Sweep */
      const fWpt = FC_CITY.localToWorld(G.x, G.z, G.yaw, 0, -hd + 1.5);
      fenceRecs.push({ wardId: G.id, x: fWpt[0], z: fWpt[1], localY: 1.35, ry: G.yaw, sx: G.w - 4.0, sy: 1.9, sz: 0.32 });
      const fWpt2 = FC_CITY.localToWorld(G.x, G.z, G.yaw, -hw + 1.5, 0);
      fenceRecs.push({ wardId: G.id, x: fWpt2[0], z: fWpt2[1], localY: 1.25, ry: G.yaw, sx: 0.32, sy: 1.7, sz: G.d - 5.0 });

      pushLocalBox(towerRecs, G, hw - 4.2, 1.85, -hd + 4.8, 5.2, 3.4, 4.8, 0);
      pushLocalBox(towerRoofRecs, G, hw - 4.2, 4.15, -hd + 4.8, 4.2, 2.2, 4.2, Math.PI * 0.25);
      pushLocalBox(towerRecs, G, hw - 4.2, 1.55,  hd - 4.8, 4.2, 2.8, 4.0, 0);
      pushLocalBox(towerRoofRecs, G, hw - 4.2, 3.55,  hd - 4.8, 3.4, 1.9, 3.4, Math.PI * 0.25);

      /* 4 Corner Seafloor Guide-Piles & Paktong Collars */
      const gpLocs = [[-hw - 0.8, -hd + 2], [hw + 0.8, -hd + 2], [-hw - 0.8, hd - 2], [hw + 0.8, hd - 2]];
      for (let p = 0; p < gpLocs.length; p++) {
        const wp = FC_CITY.localToWorld(G.x, G.z, G.yaw, gpLocs[p][0], gpLocs[p][1]);
        pileRecs.push({ x: wp[0], z: wp[1] });
        pushLocalBox(collarRecs, G, gpLocs[p][0], 0.6, gpLocs[p][1], 1, 1, 1, 0);
      }

      if (typeof KWALK !== 'undefined' && KWALK.floor) {
        KWALK.floor({ rect: [G.x - hw * 0.85, G.x + hw * 0.85, G.z - hd * 0.85, G.z + hd * 0.85], y: gPose.deckY });
      }
      if (typeof KDRAWN !== 'undefined' && KDRAWN.grid) {
        KDRAWN.add(KDRAWN.grid({
          x0: G.x - hw, z0: G.z - hd,
          dx: G.w, dz: G.d, nx: 1, nz: 1,
          h: [gPose.deckY + 0.5, gPose.deckY + 0.5, gPose.deckY + 0.5, gPose.deckY + 0.5]
        }));
      }
      if (tagReg) {
        tagReg.add({
          id: 'fc.garden.' + G.id,
          'class': 'feature',
          kind: 'floating_garden',
          key: 'fc.garden.chinampa',
          name: 'Floating Chinampa Garden Raft ' + G.id + ' (' + G.theme + ')',
          at: [G.x, gPose.deckY, G.z],
          ry: G.yaw,
          size: [G.w, G.d, gHullH],
          tags: {
            culture: G.culture,
            types: ['farm', 'park'],
            job: 'farming',
            role: 'landuse:farm',
            zone: 'garden',
            style: 'chinampa',
            harvest: G.harvest
          }
        });
      }
    }

    /* Build Shared InstancedMeshes for all 30 Platforms + 20 Chinampas */
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const coneGeo = new THREE.ConeGeometry(0.75, 1, 4);
    const pileGeo = new THREE.CylinderGeometry(0.95, 1.18, 44.0, 8);
    const collarGeo = new THREE.CylinderGeometry(1.58, 1.58, 2.2, 10);

    function makeDynamicIm(geo, mat, recs, colored) {
      if (!recs.length) return null;
      const im = new THREE.InstancedMesh(geo, mat, recs.length);
      im.frustumCulled = false;
      const cTmp = colored ? new THREE.Color() : null;
      for (let i = 0; i < recs.length; i++) {
        const r = recs[i];
        const wg = wardGroups[r.wardId];
        const wy = wg ? wg.position.y : (initLagoonY + 2.2);
        _p3.set(r.x, wy + r.localY, r.z);
        _q4.setFromAxisAngle(_y, r.ry);
        _s3.set(r.sx, r.sy, r.sz);
        _m4.compose(_p3, _q4, _s3);
        im.setMatrixAt(i, _m4);
        if (cTmp && r.col != null) {
          cTmp.setHex(r.col).convertSRGBToLinear();
          im.setColorAt(i, cTmp);
        }
        floatSlots.push({ mesh: im, index: i, wardId: r.wardId, x: r.x, z: r.z, ry: r.ry, localY: r.localY, sx: r.sx, sy: r.sy, sz: r.sz });
      }
      im.instanceMatrix.needsUpdate = true;
      if (colored && im.instanceColor) im.instanceColor.needsUpdate = true;
      root.add(im);
      return im;
    }

    const hullIm = makeDynamicIm(boxGeo, MATS.cypressHull, hullRecs, false);
    const deckIm = makeDynamicIm(boxGeo, MATS.travertineStone, deckRecs, false);
    const laneIm = makeDynamicIm(boxGeo, MATS.cobaltGlaze, laneRecs, false);
    const curbIm = makeDynamicIm(boxGeo, MATS.giltChofa, curbRecs, false);
    const towerIm = makeDynamicIm(boxGeo, MATS.ancientCeramic, towerRecs, false);
    const towerRoofIm = makeDynamicIm(coneGeo, MATS.celadonRoof, towerRoofRecs, false);
    const collarIm = makeDynamicIm(collarGeo, MATS.paktongMetal, collarRecs, false);

    const soilMat = new THREE.MeshStandardMaterial({ color: 0x241910, roughness: 0.96, metalness: 0.0 });
    const cropMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0.0 });
    const bloomMat = new THREE.MeshStandardMaterial({ color: 0xd85c88, roughness: 0.78, metalness: 0.0 });
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x826c38, roughness: 0.90, metalness: 0.0 });

    const soilIm = makeDynamicIm(boxGeo, soilMat, soilRecs, false);
    const cropIm = makeDynamicIm(boxGeo, cropMat, cropRecs, true);
    const bloomIm = makeDynamicIm(boxGeo, bloomMat, bloomRecs, false);
    const fenceIm = makeDynamicIm(boxGeo, fenceMat, fenceRecs, false);

    if (pileRecs.length) {
      const pileIm = new THREE.InstancedMesh(pileGeo, MATS.ancientConcrete, pileRecs.length);
      _q4.set(0, 0, 0, 1);
      _s3.set(1, 1, 1);
      for (let i = 0; i < pileRecs.length; i++) {
        _p3.set(pileRecs[i].x, -10.0, pileRecs[i].z);
        _m4.compose(_p3, _q4, _s3);
        pileIm.setMatrixAt(i, _m4);
      }
      pileIm.instanceMatrix.needsUpdate = true;
      if (typeof KCITY !== 'undefined' && KCITY.boundedInstanced) KCITY.boundedInstanced(pileIm);
      root.add(pileIm);
    }

    /* -------------------------------------------------------------------
       3. 65+ Hinged Bascule Canal Bridges via 3 InstancedMeshes!
       ------------------------------------------------------------------- */
    const fixedY = {
      dyke_nne: 6.2,
      dyke_ese: 6.2,
      dyke_ssw: 6.2,
      dyke_wnw: 6.2,
      sumeru_plinth: 6.2,
      sala_ne: 6.2,
      sala_se: 6.2,
      sala_sw: 6.2,
      sala_w: 6.2
    };
    const allFloatWards = cityPlan.pontoons.concat(gardens);
    const bascules = cityPlan.bascules || [];
    const basculeMeshes = {};

    let bascDeckIm = null, bascTrussIm = null, bascRoofIm = null;
    const bascMeta = [];
    if (bascules.length) {
      let roofCount = 0;
      for (let j = 0; j < bascules.length; j++) {
        const BL = bascules[j];
        const mx = (BL.x0 + BL.x1) * 0.5, mz = (BL.z0 + BL.z1) * 0.5;
        const deckLen = BL.deckLen == null ? Math.max(16.0, BL.spanM) : BL.deckLen;
        const yaw = Math.atan2(BL.x1 - BL.x0, BL.z1 - BL.z0);
        const hasRoof = (j % 3 === 0);
        bascMeta.push({ link: BL, mx: mx, mz: mz, deckLen: deckLen, yaw: yaw, roofIdx: hasRoof ? (roofCount++) : -1 });
      }
      bascDeckIm = new THREE.InstancedMesh(boxGeo, MATS.cypressHull, bascMeta.length);
      bascTrussIm = new THREE.InstancedMesh(boxGeo, MATS.paktongMetal, bascMeta.length * 2);
      bascDeckIm.frustumCulled = false;
      bascTrussIm.frustumCulled = false;
      root.add(bascDeckIm);
      root.add(bascTrussIm);
      if (roofCount > 0) {
        bascRoofIm = new THREE.InstancedMesh(coneGeo, MATS.celadonRoof, roofCount);
        bascRoofIm.frustumCulled = false;
        root.add(bascRoofIm);
      }
    }

    function updateBasculeInstanced(lagoonY) {
      if (!bascDeckIm) return;
      const A = KCITY.auditFloatFleet(allFloatWards, bascules, lagoonY, fixedY);
      for (let i = 0; i < bascMeta.length; i++) {
        const bm = bascMeta[i];
        const bp = A.bascules[i];
        const midY = bp ? bp.midY : (lagoonY + 2.2);
        const pitch = bp ? bp.pitchRad : 0.0;

        _eul.set(pitch, bm.yaw, 0, 'YXZ');
        _q4.setFromEuler(_eul);

        _p3.set(bm.mx, midY, bm.mz);
        _s3.set(5.8, 0.68, bm.deckLen);
        _m4.compose(_p3, _q4, _s3);
        bascDeckIm.setMatrixAt(i, _m4);

        const cs = Math.cos(bm.yaw), sn = Math.sin(bm.yaw);
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          const tIdx = i * 2 + (sgn < 0 ? 0 : 1);
          _p3.set(bm.mx + sgn * 2.65 * cs, midY + 1.05, bm.mz - sgn * 2.65 * sn);
          _s3.set(0.45, 2.1, bm.deckLen);
          _m4.compose(_p3, _q4, _s3);
          bascTrussIm.setMatrixAt(tIdx, _m4);
        }

        if (bm.roofIdx >= 0 && bascRoofIm) {
          _eul.set(pitch, bm.yaw, 0, 'YXZ');
          _q4.setFromEuler(_eul);
          _p3.set(bm.mx, midY + 3.6, bm.mz);
          _s3.set(6.2, 2.2, bm.deckLen * 0.85);
          _m4.compose(_p3, _q4, _s3);
          bascRoofIm.setMatrixAt(bm.roofIdx, _m4);
        }
      }
      bascDeckIm.instanceMatrix.needsUpdate = true;
      bascTrussIm.instanceMatrix.needsUpdate = true;
      if (bascRoofIm) bascRoofIm.instanceMatrix.needsUpdate = true;
    }

    /* -------------------------------------------------------------------
       4. Glowing Cyan Submerged Pioneer Superconductor Catenary Cables (1 merged draw call!)
       ------------------------------------------------------------------- */
    {
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
      const nodeXZ = {
        dyke_nne: [195, -245], dyke_ese: [380, 334], dyke_ssw: [-335, 406], dyke_wnw: [-335, -46],
        sumeru_plinth: [0, 180], sala_ne: [245, -35], sala_se: [248, 395], sala_sw: [-238, 395], sala_w: [-235, -45]
      };
      allFloatWards.forEach(function (pw) { nodeXZ[pw.id] = [pw.x, pw.z]; });
      const cables = cityPlan.cables || [];
      for (let c = 0; c < cables.length; c++) {
        const ch = cables[c];
        const A = nodeXZ[ch.from] || [0, 180], B = nodeXZ[ch.to] || [220, -120];
        const pts = [];
        for (let s = 0; s <= 8; s++) {
          const t = s / 8;
          pts.push(new THREE.Vector3(A[0] + (B[0] - A[0]) * t, -4.5 - 7.5 * Math.sin(t * Math.PI), A[1] + (B[1] - A[1]) * t));
        }
        cableGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.42, 6, false), cableMat));
      }
      FC_SUMERU_CORE.mergeStaticGroup(cableGroup, null);
    }

    /* -------------------------------------------------------------------
       5. Instanced Ring Sea Fleet (38 Dynastic/Merchant/Cruising Ships + 96 Sampans & Skiffs!)
       ------------------------------------------------------------------- */
    const vesselInstGroups = [];
    {
      const shipEntries = [
        { key: 'riaWestPalaceBarge',     mode: 'moored', x: -64,   z: 562,  yaw: 0.12,  basin: 'lagoon', name: 'Western Ria 5-Headed Uktena Royal Palace-Barge' },
        { key: 'riaWestPalaceBarge',     mode: 'moored', x:   0,   z: -62,  yaw: 3.14,  basin: 'lagoon', name: 'Sumeru North Lotus State Barge' },
        { key: 'riaEastPalaceBarge',     mode: 'moored', x:  68,   z: 562,  yaw: -0.14, basin: 'lagoon', name: 'Upper-Ria Twin-Hongsa Truce Palace-Barge' },
        { key: 'riaEastPalaceBarge',     mode: 'moored', x: 745,   z: 620,  yaw: -0.78, basin: 'lagoon', name: 'Hongsa Envoy Berth Barge' },
        { key: 'riaPatricianVillaBarge', mode: 'moored', x: -245,  z: 310,  yaw: 0.72,  basin: 'lagoon', name: 'Ria Patrician Canal-Villa Barge 1' },
        { key: 'riaPatricianVillaBarge', mode: 'moored', x:  255,  z: 315,  yaw: -1.10, basin: 'lagoon', name: 'Amber-Seal Envoy Salon Barge' },
        { key: 'riaPatricianVillaBarge', mode: 'moored', x: -255,  z:  45,  yaw: 0.95,  basin: 'lagoon', name: 'Ria Patrician Canal-Villa Barge 2' },
        { key: 'riaNobleSalonBarge',     mode: 'moored', x:  260,  z:  35,  yaw: -0.45, basin: 'lagoon', name: 'Suudme-Ria Treaty Salon Barge' },
        { key: 'riaNobleSalonBarge',     mode: 'moored', x: -165,  z: 535,  yaw: 0.40,  basin: 'lagoon', name: 'Grand Bazaar Guild Barge' },
        { key: 'riaNobleSalonBarge',     mode: 'moored', x:  165,  z: 535,  yaw: -0.40, basin: 'lagoon', name: 'Silk-Factor Salon Barge' },
        { key: 'vothBarge',              mode: 'moored', x:  420,  z: -685, yaw: 0.45,  basin: 'lagoon', name: 'Suur-Neva Timber & Grain River-Barge 1' },
        { key: 'vothBarge',              mode: 'moored', x: -465,  z:  735, yaw: 2.35,  basin: 'lagoon', name: 'Heartland Clay & Amber River-Barge' },
        { key: 'vothBarge',              mode: 'moored', x:  815,  z: -240, yaw: -1.35, basin: 'lagoon', name: 'Suudme Salt & Coal Barge' },
        { key: 'vothBarge',              mode: 'moored', x: -820,  z:  410, yaw: 1.85,  basin: 'lagoon', name: 'Kilnworks Silica Barge' },
        { key: 'vothJunk',               mode: 'moored', x:  855,  z:  265, yaw: -1.45, basin: 'lagoon', name: 'Ria Sound Merchant Junk 1' },
        { key: 'vothJunk',               mode: 'moored', x: -865,  z:  -85, yaw: 1.65,  basin: 'lagoon', name: 'Farport Spice Junk' },
        { key: 'vothJunk',               mode: 'moored', x:  610,  z:  710, yaw: -2.25, basin: 'lagoon', name: 'Heartland Tea Junk' },
        { key: 'vothJunk',               mode: 'moored', x: -580,  z: -620, yaw: 0.65,  basin: 'lagoon', name: 'Double Delta Byssus Junk' },
        { key: 'vothFerry',              mode: 'moored', x:  210,  z: -825, yaw: 0.25,  basin: 'lagoon', name: 'Crown Bluff Lagoon Passenger Ferry' },
        { key: 'vothFerry',              mode: 'moored', x: -310,  z:  465, yaw: -0.75, basin: 'lagoon', name: 'SSW Boulevard Canal Ferry' },
        { key: 'vothFerry',              mode: 'moored', x:  315,  z:  465, yaw: 0.75,  basin: 'lagoon', name: 'ESE Treaty Canal Ferry' },
        { key: 'arkChainedWard',         mode: 'moored', x: -1140, z:  420, yaw: 0.42,  basin: 'sound',  name: 'Drownlands Chained-Trimaran Ark Ward 1' },
        { key: 'arkChainedWard',         mode: 'moored', x: -1180, z:   95, yaw: 1.52,  basin: 'sound',  name: 'Drownlands Chained-Trimaran Ark Ward 2' },
        { key: 'hkWhaler',               mode: 'moored', x:  315,  z: -912, yaw: 1.55,  basin: 'sound',  name: 'Crookshore Hueru-Kuran Outrigger Coaster 1' },
        { key: 'hkWhaler',               mode: 'moored', x:  920,  z: -855, yaw: 1.58,  basin: 'sound',  name: 'Crookshore Hueru-Kuran Outrigger Coaster 2' },
        { key: 'vothJunk',               mode: 'moored', x:  815,  z: -855, yaw: 1.48,  basin: 'sound',  name: 'East Bluff Suudme Timber Junk' },
        { key: 'vothJunk',               mode: 'moored', x:  185,  z: -912, yaw: 1.62,  basin: 'sound',  name: 'West Mole Ocean Trade Junk' },
        { key: 'vothBarge',              mode: 'moored', x:  635,  z: -945, yaw: 0.12,  basin: 'sound',  name: 'Waterfall Harbour Freshwater Tanker Barge' },
        /* 10 Actively Cruising Canal Taxis, Lagoon Ferries & Outer Sound Junks */
        { key: 'vothTaxi',  mode: 'cruise', cx: 0, cz: 180, r: 274, a0: 0.15, a1: 1.45, spd: 0.032, basin: 'lagoon', name: 'Sumeru Ring Canal Taxi 1' },
        { key: 'vothTaxi',  mode: 'cruise', cx: 0, cz: 180, r: 278, a0: 2.75, a1: 3.65, spd: 0.036, basin: 'lagoon', name: 'Sumeru Ring Canal Taxi 2' },
        { key: 'vothTaxi',  mode: 'cruise', cx: 0, cz: 180, r: 425, a0: -0.9, a1: 0.25, spd: 0.026, basin: 'lagoon', name: 'Mid-Lagoon Canal Taxi 3' },
        { key: 'vothTaxi',  mode: 'cruise', cx: 0, cz: 180, r: 565, a0: 0.55, a1: 2.35, spd: 0.022, basin: 'lagoon', name: 'Royal Quadrant Canal Taxi 4' },
        { key: 'vothFerry', mode: 'cruise', cx: 0, cz: 180, r: 878, a0: 0.52, a1: 2.38, spd: 0.015, basin: 'lagoon', name: 'Inner Ring Harbour Ferry 1' },
        { key: 'vothFerry', mode: 'cruise', cx: 0, cz: 180, r: 880, a0: 3.88, a1: 4.96, spd: 0.017, basin: 'lagoon', name: 'Suudme Harbour Ring Ferry 2' },
        { key: 'vothFerry', mode: 'cruise', cx: 0, cz: 180, r: 1095, a0: -1.35, a1: -0.25, spd: 0.014, basin: 'sound', name: 'Mainland Harbour Shuttle Ferry' },
        { key: 'vothJunk',  mode: 'cruise', cx: 0, cz: 180, r: 1145, a0: 0.15, a1: 1.55, spd: 0.010, basin: 'sound', name: 'Ria Sound Merchant Junk Cruiser 1' },
        { key: 'vothJunk',  mode: 'cruise', cx: 0, cz: 180, r: 1175, a0: 1.95, a1: 3.35, spd: 0.011, basin: 'sound', name: 'Ria Sound Merchant Junk Cruiser 2' },
        { key: 'vothBarge', mode: 'cruise', cx: 0, cz: 180, r: 1110, a0: -0.75, a1: 0.35, spd: 0.012, basin: 'sound', name: 'East Bluff Freight Barge Cruiser' }
      ];

      const byKey = {};
      for (let i = 0; i < shipEntries.length; i++) {
        const E = shipEntries[i];
        E.phase = i * 0.93;
        (byKey[E.key] || (byKey[E.key] = [])).push(E);
        if (tagReg && E.mode === 'moored') {
          const wy = FC_TIDE.tideY(E.basin, 0);
          tagReg.add({
            'class': 'vessel', kind: E.key, key: 'fc.vessel.' + i, name: E.name,
            at: [E.x, wy, E.z], ry: E.yaw, size: [36, 14, 14]
          });
        }
      }

      Object.keys(byKey).forEach(function (vKey) {
        const parts = buildVesselParts(vKey);
        if (!parts || !parts.length) return;
        const list = byKey[vKey];
        const ims = parts.map(function (pt) {
          const im = new THREE.InstancedMesh(pt.geo, pt.mat, list.length);
          im.frustumCulled = false;
          root.add(im);
          return im;
        });
        vesselInstGroups.push({ list: list, ims: ims });
      });
    }

    /* 6. 96 Instanced Floating-Market Sampans & Chinampa Garden Skiffs (2 draw calls!) */
    const sampanRecs = [];
    let sampanHullIm = null, sampanCanopyIm = null;
    {
      for (let i = 0; i < cityPlan.pontoons.length; i++) {
        const W = cityPlan.pontoons[i];
        for (let k = 0; k < 2; k++) {
          const a = (i * 1.7 + k * Math.PI) % (Math.PI * 2);
          const rr = Math.max(W.w, W.d) * 0.5 + 5.5;
          sampanRecs.push({
            x: W.x + rr * Math.cos(a),
            z: W.z + rr * Math.sin(a),
            yaw: -a + Math.PI * 0.5,
            phase: i * 0.65 + k * 1.4,
            col: (i + k) % 3 === 0 ? 0xdba23a : ((i + k) % 3 === 1 ? 0x3a8c84 : 0xb83c30)
          });
        }
      }
      for (let g = 0; g < gardens.length; g++) {
        const G = gardens[g];
        const wpt = FC_CITY.localToWorld(G.x, G.z, G.yaw, 0, G.d * 0.5 + 3.4);
        sampanRecs.push({
          x: wpt[0],
          z: wpt[1],
          yaw: G.yaw + Math.PI * 0.5,
          phase: g * 0.85,
          col: 0x5c8c42
        });
        const wpt2 = FC_CITY.localToWorld(G.x, G.z, G.yaw, G.w * 0.5 + 3.2, 0);
        sampanRecs.push({
          x: wpt2[0],
          z: wpt2[1],
          yaw: G.yaw,
          phase: g * 1.15 + 0.7,
          col: 0xdba23a
        });
      }
      if (sampanRecs.length) {
        sampanHullIm = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.9, 8.4), MATS.cypressHull, sampanRecs.length);
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
    }

    function updatePontoonAndGardenInstanced(lagoonY) {
      const touched = new Set();
      for (let i = 0; i < floatSlots.length; i++) {
        const s = floatSlots[i];
        const wg = wardGroups[s.wardId];
        const wy = wg ? wg.position.y : (lagoonY + 2.2);
        _p3.set(s.x, wy + s.localY, s.z);
        _q4.setFromAxisAngle(_y, s.ry);
        _s3.set(s.sx, s.sy, s.sz);
        _m4.compose(_p3, _q4, _s3);
        s.mesh.setMatrixAt(s.index, _m4);
        touched.add(s.mesh);
      }
      _s3.set(1, 1, 1);
      touched.forEach(function (im) { im.instanceMatrix.needsUpdate = true; });
    }

    function updateVessels(tSec, tideSample) {
      _s3.set(1, 1, 1);
      for (let g = 0; g < vesselInstGroups.length; g++) {
        const VG = vesselInstGroups[g], list = VG.list, ims = VG.ims;
        for (let i = 0; i < list.length; i++) {
          const E = list[i];
          const wyBase = E.basin === 'lagoon' ? tideSample.lagoonY : tideSample.outerY;
          let vx = 0, vy = 0, vz = 0, vyaw = 0;
          if (E.mode === 'moored') {
            vx = E.x;
            vz = E.z;
            vy = wyBase + (E.basin === 'lagoon' ? 0.08 : 0.18) * Math.sin(tSec * 1.2 + E.phase);
            vyaw = E.yaw;
          } else {
            const raw = Math.sin(tSec * E.spd + E.phase);
            const dir = Math.cos(tSec * E.spd + E.phase) >= 0 ? 1 : -1;
            const u = 0.5 + 0.5 * raw;
            const ang = E.a0 + (E.a1 - E.a0) * u;
            vx = E.cx + E.r * Math.cos(ang);
            vz = E.cz + E.r * Math.sin(ang);
            vy = wyBase + 0.08 * Math.sin(tSec * 1.7 + E.phase);
            vyaw = Math.atan2(-Math.sin(ang) * dir, Math.cos(ang) * dir);
          }
          _p3.set(vx, vy, vz);
          _q4.setFromAxisAngle(_y, vyaw);
          _m4.compose(_p3, _q4, _s3);
          for (let k = 0; k < ims.length; k++) ims[k].setMatrixAt(i, _m4);
        }
        for (let k = 0; k < ims.length; k++) ims[k].instanceMatrix.needsUpdate = true;
      }
    }

    function update(tSec, tideSample) {
      updatePontoonAndGardenInstanced(tideSample.lagoonY);
      updateBasculeInstanced(tideSample.lagoonY);
      updateVessels(tSec, tideSample);

      if (sampanHullIm && sampanCanopyIm) {
        _s3.set(1, 1, 1);
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

    update(0, FC_TIDE.sample(0));

    return {
      root: root,
      wardGroups: wardGroups,
      basculeMeshes: basculeMeshes,
      allFloatWards: allFloatWards,
      fixedY: fixedY,
      hullIm: hullIm,
      deckIm: deckIm,
      laneIm: laneIm,
      curbIm: curbIm,
      towerIm: towerIm,
      towerRoofIm: towerRoofIm,
      collarIm: collarIm,
      soilIm: soilIm,
      cropIm: cropIm,
      bloomIm: bloomIm,
      fenceIm: fenceIm,
      update: update
    };
  }

  return { buildAll: buildAll };
})();
