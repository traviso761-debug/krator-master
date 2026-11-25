// ================================================================= FLOATING CITY — 28 Moon-Pool Pontoons, Bascules, 4 Cliff-Hoists & Fleet [web]
// Builds the 28 cellular hexagonal/octagonal Moon-Pool Pontoons, 112 vertical +26 m guide-piles with sliding paktong collars,
// 29 hinged bascule truss gangways, glowing cyan Pioneer superconductor catenary cables, 4x 90-second eddy-braked cliff-hoists,
// the Santa Cristina nephrite chime-well, and moored Ring Sea dynastic/treaty/ark vessels.
const FC_PONTOONS_HOISTS = (function () {
  'use strict';

  function buildAll(scene, MATS, cityPlan, tagReg) {
    const root = new THREE.Group();
    root.name = 'fc_pontoons_hoists_fleet';
    scene.add(root);

    const wardGroups = {};
    const basculeMeshes = {};
    const hoistCars = [];
    const lagoonShips = [];
    const outerShips = [];

    const initLagoonY = FC_TIDE.tideY('lagoon', 0);

    /* 1. Build all 28 Cellular Moon-Pool Pontoons + 112 Seafloor Guide-Piles */
    const pilesGroup = new THREE.Group();
    pilesGroup.name = 'fc_guide_piles';
    root.add(pilesGroup);

    const pileGeo = new THREE.CylinderGeometry(1.15, 1.35, 42.0, 8);
    const collarGeo = new THREE.CylinderGeometry(1.75, 1.75, 2.2, 10);

    for (let i = 0; i < cityPlan.pontoons.length; i++) {
      const W = cityPlan.pontoons[i];
      const sides = (i % 2 === 0) ? 8 : 6;
      const pose = KCITY.floatPose(W, initLagoonY);

      const wg = new THREE.Group();
      wg.name = 'fc_ward_' + W.id;
      wg.position.set(0, pose.deckY, 0);
      root.add(wg);
      wardGroups[W.id] = wg;

      /* Cellular ring of `sides` cypress caissons + travertine quay segments around an open r=16 m central Moon-Pool! */
      const rInner = 16.5;
      const rOuter = 44.0;
      const rMid = 0.5 * (rInner + rOuter);
      const chord = 2 * rMid * Math.sin(Math.PI / sides) * 1.06;
      const segDepth = rOuter - rInner;
      const hullH = W.draftM + W.freeboardM;

      for (let s = 0; s < sides; s++) {
        const ang = (s + 0.5) * (2 * Math.PI / sides);
        const sx = W.x + rMid * Math.cos(ang);
        const sz = W.z + rMid * Math.sin(ang);

        const hullSeg = new THREE.Mesh(new THREE.BoxGeometry(segDepth, hullH, chord), MATS.cypressHull);
        hullSeg.position.set(sx, -hullH * 0.5 - 0.35, sz);
        hullSeg.rotation.y = -ang;
        wg.add(hullSeg);

        const deckSeg = new THREE.Mesh(new THREE.BoxGeometry(segDepth + 0.8, 0.72, chord + 0.6), MATS.travertineStone);
        deckSeg.position.set(sx, -0.36, sz);
        deckSeg.rotation.y = -ang;
        wg.add(deckSeg);

        /* Inner Moon-Pool cobalt/gilt coping curb */
        const ix = W.x + (rInner + 0.8) * Math.cos(ang);
        const iz = W.z + (rInner + 0.8) * Math.sin(ang);
        const curb = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 0.85, 2 * rInner * Math.sin(Math.PI / sides) * 1.08),
          W.kind === 'suudme' ? MATS.cobaltGlaze : MATS.giltChofa
        );
        curb.position.set(ix, 0.42, iz);
        curb.rotation.y = -ang;
        wg.add(curb);
      }

      /* 4 Vertical +26 m Guide-Piles anchored in -12.6 m lagoon floor + sliding paktong roller-collars on the pontoon */
      for (let p = 0; p < 4; p++) {
        const pa = (p * 0.5 * Math.PI) + 0.39;
        const px = W.x + 44.8 * Math.cos(pa);
        const pz = W.z + 44.8 * Math.sin(pa);
        const pm = new THREE.Mesh(pileGeo, MATS.ancientConcrete);
        pm.position.set(px, 5.0, pz);
        pilesGroup.add(pm);

        const col = new THREE.Mesh(collarGeo, MATS.paktongMetal);
        col.position.set(px, 0.8, pz);
        wg.add(col);
      }

      if (typeof FC_SUMERU_DRAW !== 'undefined' && FC_SUMERU_DRAW.mergeStaticGroup) {
        FC_SUMERU_DRAW.mergeStaticGroup(wg, null);
      }

      if (typeof KWALK !== 'undefined' && KWALK.floor) {
        KWALK.floor({ rect: [W.x - 40, W.x + 40, W.z - 40, W.z + 40], y: pose.deckY });
      }
      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'floating_pontoon', key: 'fc.ward.' + W.id,
          name: 'Cellular Moon-Pool Pontoon ' + W.id + ' (' + W.kind + ')',
          at: [W.x, pose.deckY, W.z], ry: 0, size: [88, 88, hullH]
        });
      }
    }
    if (typeof FC_SUMERU_DRAW !== 'undefined' && FC_SUMERU_DRAW.mergeStaticGroup) {
      FC_SUMERU_DRAW.mergeStaticGroup(pilesGroup, null);
    }

    /* 2. Build all 29 Hinged Bascule Truss Gangways (yaw wrapper + pitch inner mesh for KCITY.hostFloat) */
    const basculeGroup = new THREE.Group();
    basculeGroup.name = 'fc_bascule_gangways';
    root.add(basculeGroup);

    const nodeXZ = {
      dyke_nne: [148, -242],
      sumeru_plinth: [0, 80],
      sala_ne: [140, -60],
      sala_se: [140, 220],
      sala_sw: [-140, 220],
      sala_w: [-198, 80],
      sala_n: [0, -118]
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
      const span = Math.max(12.0, BL.spanM == null ? Math.hypot(B[0] - A[0], B[1] - A[1]) : BL.spanM);
      const yaw = Math.atan2(B[0] - A[0], B[1] - A[1]);

      const yawHolder = new THREE.Group();
      yawHolder.position.set(mx, 0, mz);
      yawHolder.rotation.y = yaw;
      basculeGroup.add(yawHolder);

      const bridgeInner = new THREE.Group();
      bridgeInner.position.set(0, initLagoonY + 2.4, 0);
      yawHolder.add(bridgeInner);

      const deck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.55, span * 0.82), MATS.cypressHull);
      bridgeInner.add(deck);
      const trussL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.2, span * 0.82), MATS.paktongMetal);
      trussL.position.set(-2.45, 1.0, 0);
      bridgeInner.add(trussL);
      const trussR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.2, span * 0.82), MATS.paktongMetal);
      trussR.position.set(2.45, 1.0, 0);
      bridgeInner.add(trussR);

      basculeMeshes[BL.id] = bridgeInner;
    }

    /* 3. Glowing Cyan Submerged Pioneer Superconductor Catenary Power Cables */
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
      const A = nodeXZ[ch.from] || [0, 80];
      const B = nodeXZ[ch.to] || [180, -180];
      const pts = [];
      for (let s = 0; s <= 10; s++) {
        const t = s / 10;
        const sag = -6.5 * Math.sin(t * Math.PI);
        pts.push(new THREE.Vector3(
          A[0] + (B[0] - A[0]) * t,
          -2.5 + sag,
          A[1] + (B[1] - A[1]) * t
        ));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.42, 6, false), cableMat);
      cableGroup.add(tube);
    }

    /* 4. Four 90-Second Pioneer Eddy-Braked Cliff-Hoists (+6.2 m Ghat -> +98..102 m Bluff Citadel) */
    const hoistGroup = new THREE.Group();
    hoistGroup.name = 'fc_pioneer_cliff_hoists';
    root.add(hoistGroup);

    for (let i = 0; i < FC_SITE.CLIFF_HOISTS.length; i++) {
      const H = FC_SITE.CLIFF_HOISTS[i];
      const dx = H.x1 - H.x0, dy = (H.y1 + 10.0) - (H.y0 + 8.0), dz = H.z1 - H.z0;
      const len3 = Math.hypot(dx, dy, dz);
      const horiz = Math.hypot(dx, dz);
      const yaw = Math.atan2(dx, dz);
      const pitch = -Math.atan2(dy, horiz);

      /* Lower Ghat & Upper Bluff Gantry Towers */
      const footTwr = new THREE.Mesh(new THREE.BoxGeometry(11.0, 14.0, 11.0), MATS.ancientConcrete);
      footTwr.position.set(H.x0, H.y0 + 5.0, H.z0);
      footTwr.rotation.y = yaw;
      hoistGroup.add(footTwr);

      const headTwr = new THREE.Mesh(new THREE.BoxGeometry(12.0, 18.0, 12.0), MATS.travertineStone);
      headTwr.position.set(H.x1, H.y1 + 7.0, H.z1);
      headTwr.rotation.y = yaw;
      hoistGroup.add(headTwr);

      const headRoof = new THREE.Mesh(new THREE.ConeGeometry(9.2, 6.2, 4), MATS.celadonRoof);
      headRoof.position.set(H.x1, H.y1 + 19.1, H.z1);
      headRoof.rotation.y = yaw + Math.PI * 0.25;
      hoistGroup.add(headRoof);

      /* Inclined Twin Paktong Eddy-Brake Box-Girder Guide Rails */
      const railHolder = new THREE.Group();
      railHolder.position.set((H.x0 + H.x1) * 0.5, (H.y0 + 8.0 + H.y1 + 10.0) * 0.5, (H.z0 + H.z1) * 0.5);
      railHolder.rotation.y = yaw;
      const railMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, len3), MATS.paktongMetal);
      railMesh.rotation.x = pitch;
      railHolder.add(railMesh);
      hoistGroup.add(railHolder);

      /* Animated Counterweighted Barge-Cradle Gondola */
      const car = new THREE.Group();
      const carCab = new THREE.Mesh(new THREE.BoxGeometry(7.2, 5.4, 9.6), MATS.cypressHull);
      const carTrim = new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.0, 10.0), MATS.giltChofa);
      carTrim.position.y = 2.8;
      car.add(carCab);
      car.add(carTrim);
      car.rotation.y = yaw;
      hoistGroup.add(car);
      hoistCars.push({ group: car, spec: H, phase: i * 0.25 });

      if (tagReg) {
        tagReg.add({
          'class': 'infrastructure', kind: 'cliff_hoist', key: H.id,
          name: 'Pioneer 90-Second Eddy-Braked Cliff-Hoist ' + (i + 1),
          at: [(H.x0 + H.x1) * 0.5, (H.y0 + H.y1) * 0.5, (H.z0 + H.z1) * 0.5],
          ry: yaw, size: [12, len3, 18]
        });
      }
    }

    /* 5. Santa Cristina Nephrite Drawdown Chime-Well at D5 Hoist Foot */
    {
      const CW = FC_SITE.CHIME_WELL;
      const wellOuter = new THREE.Mesh(new THREE.CylinderGeometry(8.8, 9.8, 7.2, 12), MATS.cobaltGlaze);
      wellOuter.position.set(CW.x, CW.rimY - 2.6, CW.z);
      root.add(wellOuter);

      const chimeFrame = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 6.5, 8, 1, true), MATS.paktongMetal);
      chimeFrame.position.set(CW.x, CW.rimY + 3.2, CW.z);
      root.add(chimeFrame);

      if (tagReg) {
        tagReg.add({
          'class': 'feature', kind: 'tsunami_chime_well', key: CW.id,
          name: 'Santa Cristina Nephrite Tsunami-Drawdown Chime-Well (25 min early warning)',
          at: [CW.x, CW.rimY, CW.z], ry: 0, size: [19, 19, 14]
        });
      }
    }

    /* 6. Moored Ring Sea Watercraft (Dynastic Palace-Barges, Suudme Lighters, Drownlands Ark Ward & Crookshore Whaler) */
    if (typeof RINGSEA !== 'undefined' && RINGSEA.make) {
      const moorings = [
        { key: 'riaWestPalaceBarge',    x: -48,  z: 365,  yaw: 0.15,  basin: 'lagoon', name: 'Western Ria 5-Headed Uktena Royal Palace-Barge' },
        { key: 'riaEastPalaceBarge',    x: 385,  z: 248,  yaw: -0.85, basin: 'lagoon', name: 'Upper-Ria Twin-Hongsa Truce Palace-Barge' },
        { key: 'riaPatricianVillaBarge',x: -245, z: -125, yaw: 0.72,  basin: 'lagoon', name: 'Ria Patrician Canal-Villa Barge' },
        { key: 'riaNobleSalonBarge',    x: 195,  z: -165, yaw: -0.45, basin: 'lagoon', name: 'Suudme-Ria Treaty Salon Barge' },
        { key: 'vothBarge',             x: 285,  z: -385, yaw: 1.15,  basin: 'lagoon', name: 'Suur-Neva Timber & Grain River-Barge' },
        { key: 'arkChainedWard',        x: -785, z: 320,  yaw: 0.42,  basin: 'sound',  name: 'Drownlands Chained-Trimaran Ark Ward (Outer Mooring)' },
        { key: 'hkWhaler',              x: 425,  z: -735, yaw: -1.35, basin: 'sound',  name: 'Crookshore Hueru-Kuran Outrigger Coaster' }
      ];
      for (let i = 0; i < moorings.length; i++) {
        const M = moorings[i];
        const vObj = RINGSEA.make(M.key);
        if (!vObj || !vObj.group) continue;
        const wy = FC_TIDE.tideY(M.basin, 0);
        vObj.group.position.set(M.x, wy, M.z);
        vObj.group.rotation.y = M.yaw;
        root.add(vObj.group);
        if (M.basin === 'lagoon') lagoonShips.push(vObj.group);
        else outerShips.push(vObj.group);

        if (tagReg) {
          tagReg.add({
            'class': 'vessel', kind: M.key, key: 'fc.vessel.' + i, name: M.name,
            at: [M.x, wy, M.z], ry: M.yaw, size: [38, 16, 14]
          });
        }
      }
    }

    function update(tSec, tideSample) {
      for (let i = 0; i < hoistCars.length; i++) {
        const hc = hoistCars[i], H = hc.spec;
        /* Smooth 90-second sinusoidal shuttle cycle between D5 Ghat and D6 Bluff */
        const u = 0.5 - 0.5 * Math.cos((2 * Math.PI * tSec / H.liftSec) + hc.phase * Math.PI * 2);
        hc.group.position.set(
          H.x0 + (H.x1 - H.x0) * u,
          (H.y0 + 8.0) + (H.y1 + 10.0 - H.y0 - 8.0) * u,
          H.z0 + (H.z1 - H.z0) * u
        );
      }
      for (let i = 0; i < lagoonShips.length; i++) {
        lagoonShips[i].position.y = tideSample.lagoonY + 0.08 * Math.sin(tSec * 1.1 + i);
      }
      for (let i = 0; i < outerShips.length; i++) {
        outerShips[i].position.y = tideSample.outerY + 0.18 * Math.sin(tSec * 1.3 + i * 1.7);
      }
      if (typeof RINGSEA !== 'undefined' && RINGSEA.tick) {
        RINGSEA.tick(tSec);
      }
    }

    return {
      root: root,
      wardGroups: wardGroups,
      basculeMeshes: basculeMeshes,
      fixedY: {
        dyke_nne: 6.2,
        sumeru_plinth: 5.8,
        sala_ne: 5.8,
        sala_se: 5.8,
        sala_sw: 5.8,
        sala_w: 5.8,
        sala_n: 5.8
      },
      update: update
    };
  }

  return { buildAll: buildAll };
})();
