// ================================================================= TORUS — 8bk: Stage 5 3D Life Embodiment ([draw])
// Embodiments for Torus's 8,500 simulated residents:
//   - Tethered Rinkvolk fruitvine harvesters suspended in harnesses along BOTH Wheel rims (r=560m & r=720m) with dynamic steel tether lines!
//   - Senior Tenders of the Plant Lore, Elected Board magistrates, Vothic Emissary legates, free-roaming Sun-cult missionaries,
//     Ordinator Amber-Sap auditors, cider brewers, haul-carts, Voth/Drum caravans, and Tors Rivrh grain/cider barges.

const TORUS_CLOCK = KCLOCK.make({ hour: 12.0, running: false, scale: 15 });
const TORUS_SIM = TORUS.initSim(TORUS_PLAN, TORUS_STAGE4, TORUS_CLOCK);

const TORUS_LIFE = (function buildTorusLife3D() {
  const grp = new THREE.Group();
  grp.name = 'torus_life_root';
  scene.add(grp);

  const MAXP = 2000;
  const MAXT = 180; // dynamic steel safety tethers for suspended Wheel-rim fruitvine harvesters!
  const MAXB = 96;
  const MAXC = 40;
  const MAXW = 20;

  function makeInst(geo, mat, max, name) {
    const m = new THREE.InstancedMesh(geo, mat, max);
    m.name = name;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const cols = new Float32Array(max * 3);
    cols.fill(1);
    m.instanceColor = new THREE.InstancedBufferAttribute(cols, 3);
    m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.count = 0;
    m.frustumCulled = false;
    grp.add(m);
    return m;
  }

  const matCloth = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.84, metalness: 0.05 });
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.76, metalness: 0.02 });
  const matMetal = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.38, metalness: 0.66 });
  const matChitin = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.48, metalness: 0.24 });
  const matTimber = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.86, metalness: 0.06 });

  const bodyGeo = new THREE.CylinderGeometry(0.20, 0.25, 1.18, 7);
  bodyGeo.translate(0, 0.62, 0);
  const headGeo = new THREE.SphereGeometry(0.16, 7, 6);
  headGeo.translate(0, 1.38, 0);
  const hatGeo = new THREE.ConeGeometry(0.26, 0.24, 7);
  hatGeo.translate(0, 1.56, 0);
  const basketGeo = new THREE.BoxGeometry(0.36, 0.46, 0.28);
  basketGeo.translate(0, 0.90, -0.24);

  const tetherLineGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 4);

  const beetleGeo = new THREE.SphereGeometry(0.85, 8, 6);
  beetleGeo.scale(0.82, 0.62, 1.35);
  beetleGeo.translate(0, 0.56, 0);

  const cartGeo = new THREE.BoxGeometry(1.45, 0.72, 2.35);
  cartGeo.translate(0, 0.58, -0.95);

  const bargeGeo = new THREE.BoxGeometry(2.8, 0.72, 8.2);
  bargeGeo.translate(0, 0.30, 0);

  const iBody = makeInst(bodyGeo, matCloth, MAXP, 'torus_people_body');
  const iHead = makeInst(headGeo, matSkin, MAXP, 'torus_people_head');
  const iHat = makeInst(hatGeo, matMetal, MAXP, 'torus_people_headgear');
  const iBasket = makeInst(basketGeo, matTimber, MAXP, 'torus_people_baskets');
  const iTether = makeInst(tetherLineGeo, matMetal, MAXT, 'torus_harvester_tether_lines');
  const iBeetle = makeInst(beetleGeo, matChitin, MAXB, 'torus_pack_beetles');
  const iCart = makeInst(cartGeo, matTimber, MAXC, 'torus_haul_carts');
  const iBarge = makeInst(bargeGeo, matTimber, MAXW, 'torus_river_barges');

  const ROLE_TINT = {
    vine_harvester: 0x9c3d4c,
    cider_brewer: 0xb67b2e,
    tender_keeper: 0x2f7d6d,
    board_magistrate: 0x3b5875,
    voth_envoy: 0x7c222e,
    sun_missionary: 0xd49b2a,
    ordinator_inquisitor: 0x2a2428,
    rinkvolk_bailiff: 0x4b6a52,
    hoist_rigger: 0x5c6670,
    porter_cartman: 0x75644e,
    terrace_farmer: 0x557544,
    terrace_artisan: 0x6a5c4c,
    rinkvolk_citizen: 0x647068,
    voth_tithe_guard: 0x8c2938,
    drum_tool_factor: 0x566470,
    tors_barge_crew: 0x446272
  };

  const HAT_TINT = {
    tender_keeper: 0x7cc4b4,
    board_magistrate: 0xc8a44c,
    voth_envoy: 0xd8ab3e,
    sun_missionary: 0xf0c248,
    ordinator_inquisitor: 0xd8ab3e,
    vine_harvester: 0x6a7276,
    rinkvolk_bailiff: 0x5c685c
  };

  const cTmp = new THREE.Color();
  const m4 = new THREE.Matrix4();
  const qTmp = new THREE.Quaternion();
  const eTmp = new THREE.Euler(0, 0, 0, 'YXZ');
  const vPos = new THREE.Vector3();
  const vScale = new THREE.Vector3(1, 1, 1);

  const shownActors = new Array(MAXP);
  const shownBeetles = new Array(MAXB);
  const shownCarts = new Array(MAXC);
  const shownBarges = new Array(MAXW);

  function describeActor(a) {
    if (!a) return null;
    const role = SIM.R.role[a.role];
    const home = a.home ? SIM.R.place[a.home] : null;
    const dest = a.place ? SIM.R.place[a.place] : null;
    return {
      name: (role ? role.name : a.role) + ' (' + a.id + ')',
      culture: a.culture == null ? 'rinkvolk' : a.culture,
      faction: a.faction == null ? 'rinkvolk_board' : a.faction,
      activity: a.act == null ? (a.activity == null ? 'IDLE' : a.activity) : a.act,
      destination: dest ? dest.name : 'terrace',
      home: home ? home.name : 'transient'
    };
  }

  iBody.userData.inspectFn = function (idx) { return describeActor(shownActors[idx]); };
  iHead.userData.inspectFn = iBody.userData.inspectFn;
  iBeetle.userData.inspectFn = function (idx) { return describeActor(shownBeetles[idx]); };
  iCart.userData.inspectFn = function (idx) { return describeActor(shownCarts[idx]); };
  iBarge.userData.inspectFn = function (idx) { return describeActor(shownBarges[idx]); };

  let lastMinute = SIM.minute();
  let drawnPeople = 0;
  let drawnTethered = 0;
  let drawnVehicles = 0;
  const deg = Math.PI / 180;

  function groundLift(x, y, z) {
    if (y > 46.0 || y < -2.0) return y; // elevated Barrel/Wheel/Crown or deep basement nodes carry exact y
    return Math.max(y, torusGroundAt(x, z));
  }

  function sync(forceJump) {
    const curMin = SIM.minute();
    if (forceJump || Math.abs(curMin - lastMinute) > 45) {
      SIM.jump();
      if (SIM.stepHooks && SIM.stepHooks[0]) SIM.stepHooks[0](curMin);
      lastMinute = curMin;
    } else {
      let guard = 0;
      while (lastMinute < curMin && guard < 18) {
        lastMinute++;
        SIM.step();
        guard++;
      }
      if (lastMinute < curMin) lastMinute = curMin;
    }
    TORUS_SIM.refreshActivityCounts();

    const t = TORUS_CLOCK.t;
    if (TORUS_ARCOLOGY_GROUP && TORUS_ARCOLOGY_GROUP.userData && TORUS_ARCOLOGY_GROUP.userData.updateGondolas) {
      TORUS_ARCOLOGY_GROUP.userData.updateGondolas(t, TORUS_SIM.harvestActive);
    }

    const cx = camera.position.x, cz = camera.position.z;
    const all = SIM.all('actor');
    const nAll = all.length;

    let np = 0, nh = 0, nk = 0, nt = 0, nb = 0, nc = 0, nw = 0;

    function emitActor(a, p) {
      if (p.mode === 'boat') {
        if (nw < MAXW && (!a.fi || a.fi === 0)) {
          eTmp.set(0, p.h, 0);
          qTmp.setFromEuler(eTmp);
          vPos.set(p.x, -1.15, p.z);
          vScale.set(1, 1, 1);
          m4.compose(vPos, qTmp, vScale);
          iBarge.setMatrixAt(nw, m4);
          iBarge.setColorAt(nw, cTmp.setHex(0x5b4632));
          shownBarges[nw] = a;
          nw++;
        }
      }

      // Tethered Fruitvine Harvester suspended below the Wheel rim (r=560m inner or r=720m outer)!
      let px = p.x, py = groundLift(p.x, p.y, p.z), pz = p.z, yaw = p.h;
      const isTetheredHarvest = (a.role === 'vine_harvester' && !p.moving && (p.act === 'HARVEST_VINE' || TORUS_SIM.harvestActive) && p.y > 280);
      if (isTetheredHarvest && nt < MAXT) {
        const rad = Math.hypot(p.x, p.z) || 564;
        const isInner = rad < 640;
        const baseAz = Math.atan2(p.z, p.x);
        const subAng = baseAz + ((a.k % 7) - 3) * 1.6 * deg;
        const rimR = isInner ? 556.5 : 723.5;
        const dropLen = 16.0 + ((a.k * 13) % 58) + 6.5 * Math.sin(t * 0.35 + a.k * 0.9);
        const sway = 1.2 * Math.sin(t * 0.9 + a.k);
        px = (rimR + sway * 0.25) * Math.cos(subAng);
        pz = (rimR + sway * 0.25) * Math.sin(subAng);
        const topY = 302.5;
        py = topY - dropLen;
        yaw = -subAng + (isInner ? 0 : Math.PI);

        // Draw steel safety tether line from topY down to harvester harness!
        qTmp.identity();
        vPos.set(px, topY - 0.5 * dropLen, pz);
        vScale.set(1, dropLen, 1);
        m4.compose(vPos, qTmp, vScale);
        iTether.setMatrixAt(nt, m4);
        iTether.setColorAt(nt, cTmp.setHex(0x889298));
        nt++;
      }

      if (a.cart && nc < MAXC) {
        eTmp.set(0, yaw, 0);
        qTmp.setFromEuler(eTmp);
        vPos.set(px, py, pz);
        vScale.set(1, 1, 1);
        m4.compose(vPos, qTmp, vScale);
        iCart.setMatrixAt(nc, m4);
        iCart.setColorAt(nc, cTmp.setHex(0x6b533b));
        shownCarts[nc] = a;
        nc++;
      }

      if (a.group && nb < MAXB && a.fi && a.fi % 2 === 1) {
        const G = SIM.R.group[a.group];
        if (G && G.beasts) {
          eTmp.set(0, yaw, 0);
          qTmp.setFromEuler(eTmp);
          vPos.set(px - Math.sin(yaw) * 1.6, py, pz - Math.cos(yaw) * 1.6);
          vScale.set(1.08, 1.0, 1.12);
          m4.compose(vPos, qTmp, vScale);
          iBeetle.setMatrixAt(nb, m4);
          iBeetle.setColorAt(nb, cTmp.setHex(0x4a3d2e));
          shownBeetles[nb] = a;
          nb++;
        }
      }

      if (np >= MAXP) return;
      const bob = p.moving ? Math.abs(Math.sin(t * 5.6 + a.k * 0.7)) * 0.06 : 0;
      eTmp.set(0, yaw, 0);
      qTmp.setFromEuler(eTmp);
      vPos.set(px, py + bob, pz);
      vScale.set(1, 1, 1);
      m4.compose(vPos, qTmp, vScale);

      iBody.setMatrixAt(np, m4);
      const tint = ROLE_TINT[a.role] == null ? 0x647068 : ROLE_TINT[a.role];
      iBody.setColorAt(np, cTmp.setHex(tint));

      iHead.setMatrixAt(np, m4);
      const skinHex = a.culture === 'voth' ? 0xc4956c : 0xd2a882;
      iHead.setColorAt(np, cTmp.setHex(skinHex));
      shownActors[np] = a;
      np++;

      const hHex = HAT_TINT[a.role];
      if (hHex != null && nh < MAXP) {
        iHat.setMatrixAt(nh, m4);
        iHat.setColorAt(nh, cTmp.setHex(hHex));
        nh++;
      }
      if ((a.role === 'vine_harvester' || a.role === 'terrace_farmer' || a.role === 'porter_cartman') && nk < MAXP) {
        iBasket.setMatrixAt(nk, m4);
        iBasket.setColorAt(nk, cTmp.setHex(a.role === 'vine_harvester' ? 0x8d3448 : 0x765c3b));
        nk++;
      }
    }

    // Pass 1: Priority actors (tethered vine harvesters, Board & Tenders, Sun missionaries, Amber-Sap auditors, carts, caravans/barges)
    const picked = new Uint8Array(nAll);
    for (let i = 0; i < nAll && np < MAXP; i++) {
      const a = all[i];
      if (!a.present) continue;
      const priority = (
        a.role === 'vine_harvester' ||
        a.role === 'board_magistrate' ||
        a.role === 'tender_keeper' ||
        a.role === 'sun_missionary' ||
        a.role === 'ordinator_inquisitor' ||
        a.cart != null ||
        a.group != null
      );
      if (!priority) continue;
      const p = SIM.pose(a, t);
      if (!p || p.hidden) continue;
      picked[i] = 1;
      emitActor(a, p);
    }

    // Pass 2: Camera-near + deterministic stride across all 8,500 residents so every terrace, Wheel & Crown is alive
    const stride = Math.max(1, Math.floor(nAll / 1500));
    const offset = curMin % stride;
    for (let i = offset; i < nAll && np < MAXP; i += stride) {
      if (picked[i]) continue;
      const a = all[i];
      if (!a.present) continue;
      const p = SIM.pose(a, t);
      if (!p || p.hidden) continue;
      const dx = p.x - cx, dz = p.z - cz;
      if (!p.moving && (dx * dx + dz * dz) > 1350 * 1350 && (i % 3 !== 0)) continue;
      picked[i] = 1;
      emitActor(a, p);
    }

    const meshes = [
      [iBody, np], [iHead, np], [iHat, nh], [iBasket, nk],
      [iTether, nt], [iBeetle, nb], [iCart, nc], [iBarge, nw]
    ];
    for (let m = 0; m < meshes.length; m++) {
      const inst = meshes[m][0], cnt = meshes[m][1];
      inst.count = cnt;
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    }

    drawnPeople = np;
    drawnTethered = nt;
    drawnVehicles = nc + nw;
  }

  sync(false);
  ANC_TICKS.push(function () { sync(false); });

  return {
    group: grp,
    sync: sync,
    counts: function () {
      return {
        people: drawnPeople,
        tethered: drawnTethered,
        vehicles: drawnVehicles
      };
    }
  };
})();
