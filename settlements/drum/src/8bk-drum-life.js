// ================================================================= DRUM — 8bk: Stage 5 3D Life Embodiment ([draw])
// Embodiments for Drum's 13,500 simulated residents, Cauldron gladiators & pit-beasts, Ordinators, Garrison levies,
// salvage haul-carts, Voth/Torus caravans, and Drim Rivrh flatboats, driven purely by SIM.pose(actor, clock.t).

const DRUM_CLOCK = KCLOCK.make({ hour: 12.5, running: false, scale: 15 });
const DRUM_SIM = DRUM.initSim(DRUM_PLAN, DRUM_STAGE4, DRUM_CLOCK);

const DRUM_LIFE = (function buildDrumLife3D() {
  const grp = new THREE.Group();
  grp.name = 'drum_life_root';
  scene.add(grp);

  const MAXP = 2200;
  const MAXB = 120;
  const MAXC = 48;
  const MAXW = 24;

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
  const matMetal = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.62 });
  const matChitin = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.48, metalness: 0.24 });
  const matTimber = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.86, metalness: 0.06 });

  const bodyGeo = new THREE.CylinderGeometry(0.20, 0.25, 1.18, 7);
  bodyGeo.translate(0, 0.62, 0);
  const headGeo = new THREE.SphereGeometry(0.16, 7, 6);
  headGeo.translate(0, 1.38, 0);
  const hatGeo = new THREE.ConeGeometry(0.26, 0.24, 7);
  hatGeo.translate(0, 1.56, 0);
  const shieldGeo = new THREE.BoxGeometry(0.10, 0.62, 0.44);
  shieldGeo.translate(0.28, 0.82, 0.08);
  const packGeo = new THREE.BoxGeometry(0.32, 0.42, 0.24);
  packGeo.translate(0, 0.92, -0.22);

  const beetleGeo = new THREE.SphereGeometry(0.85, 8, 6);
  beetleGeo.scale(0.82, 0.62, 1.35);
  beetleGeo.translate(0, 0.56, 0);

  const cartGeo = new THREE.BoxGeometry(1.45, 0.72, 2.35);
  cartGeo.translate(0, 0.58, -0.95);

  const bargeGeo = new THREE.BoxGeometry(2.6, 0.68, 7.8);
  bargeGeo.translate(0, 0.28, 0);

  const iBody = makeInst(bodyGeo, matCloth, MAXP, 'drum_people_body');
  const iHead = makeInst(headGeo, matSkin, MAXP, 'drum_people_head');
  const iHat = makeInst(hatGeo, matMetal, MAXP, 'drum_people_headgear');
  const iShield = makeInst(shieldGeo, matMetal, MAXP, 'drum_people_arms');
  const iPack = makeInst(packGeo, matTimber, MAXP, 'drum_people_packs');
  const iBeetle = makeInst(beetleGeo, matChitin, MAXB, 'drum_beasts_and_beetles');
  const iCart = makeInst(cartGeo, matTimber, MAXC, 'drum_salvage_carts');
  const iBarge = makeInst(bargeGeo, matTimber, MAXW, 'drum_river_barges');

  const ROLE_TINT = {
    salvage_rigger: 0x8b5a36,
    fin_artisan: 0x4b6a78,
    mushroom_tender: 0x566c44,
    bourse_trader: 0xb0893e,
    porter_cartman: 0x736653,
    garrison_soldier: 0x7c222e,
    levy_recruit: 0x94483a,
    ordinator_inquisitor: 0x2b2528,
    gladiator: 0xc26e2b,
    drum_citizen: 0x626b68,
    voth_caravan_guard: 0x8c2938,
    torus_factor: 0x487a4e,
    drim_barge_crew: 0x456070
  };

  const HAT_TINT = {
    garrison_soldier: 0xb89038,
    levy_recruit: 0x6e7378,
    ordinator_inquisitor: 0xd8ab3e,
    gladiator: 0xc47e3b,
    salvage_rigger: 0x5c6468,
    voth_caravan_guard: 0xc69838
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
      culture: a.culture == null ? 'vinvolk' : a.culture,
      faction: a.faction == null ? 'vinvolk' : a.faction,
      activity: a.activity == null ? 'IDLE' : a.activity,
      destination: dest ? dest.name : 'street',
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
  let drawnBeasts = 0;
  let drawnVehicles = 0;

  function groundLift(x, y, z) {
    // Actors on elevated arcology/bleacher/basement nodes already carry node y; ground-level street walkers sit on drumGroundAt
    if (Math.abs(y) > 0.6) return y;
    const r = Math.hypot(x, z);
    if (r < 214) return y;
    return Math.max(y, drumGroundAt(x, z));
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
    DRUM_SIM.refreshArenaCounts();

    const t = DRUM_CLOCK.t;
    const cx = camera.position.x, cz = camera.position.z;
    const all = SIM.all('actor');
    const nAll = all.length;

    let np = 0, nh = 0, ns = 0, nk = 0, nb = 0, nc = 0, nw = 0;

    function emitActor(a, p) {
      const wy = groundLift(p.x, p.y, p.z);
      if (a.role === 'arena_beast') {
        if (nb >= MAXB) return;
        const lunge = p.act === 'FIGHT_BOUT' ? 0.25 * Math.sin(t * 5.2 + a.k) : 0;
        eTmp.set(0, p.h, 0);
        qTmp.setFromEuler(eTmp);
        vPos.set(p.x + Math.sin(p.h) * lunge, wy, p.z + Math.cos(p.h) * lunge);
        vScale.set(1.25, 1.15, 1.30);
        m4.compose(vPos, qTmp, vScale);
        iBeetle.setMatrixAt(nb, m4);
        iBeetle.setColorAt(nb, cTmp.setHex(a.k % 2 === 0 ? 0x3b2c24 : 0x563928));
        shownBeetles[nb] = a;
        nb++;
        return;
      }

      if (p.mode === 'boat') {
        if (nw < MAXW && (!a.fi || a.fi === 0)) {
          eTmp.set(0, p.h, 0);
          qTmp.setFromEuler(eTmp);
          vPos.set(p.x, -1.4, p.z);
          vScale.set(1, 1, 1);
          m4.compose(vPos, qTmp, vScale);
          iBarge.setMatrixAt(nw, m4);
          iBarge.setColorAt(nw, cTmp.setHex(0x5b4632));
          shownBarges[nw] = a;
          nw++;
        }
      }

      if (a.cart && nc < MAXC) {
        eTmp.set(0, p.h, 0);
        qTmp.setFromEuler(eTmp);
        vPos.set(p.x, wy, p.z);
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
          eTmp.set(0, p.h, 0);
          qTmp.setFromEuler(eTmp);
          vPos.set(p.x - Math.sin(p.h) * 1.5, wy, p.z - Math.cos(p.h) * 1.5);
          vScale.set(1.05, 1.0, 1.1);
          m4.compose(vPos, qTmp, vScale);
          iBeetle.setMatrixAt(nb, m4);
          iBeetle.setColorAt(nb, cTmp.setHex(0x4a3d2e));
          shownBeetles[nb] = a;
          nb++;
        }
      }

      if (np >= MAXP) return;
      const isBout = p.act === 'FIGHT_BOUT' || p.act === 'DRILL';
      const bob = p.moving ? Math.abs(Math.sin(t * 5.8 + a.k * 0.7)) * 0.06 : (isBout ? Math.abs(Math.sin(t * 6.8 + a.k)) * 0.09 : 0);
      const yaw = isBout ? p.h + 0.35 * Math.sin(t * 3.8 + a.k) : p.h;
      eTmp.set(0, yaw, 0);
      qTmp.setFromEuler(eTmp);
      vPos.set(p.x, wy + bob, p.z);
      vScale.set(1, 1, 1);
      m4.compose(vPos, qTmp, vScale);

      iBody.setMatrixAt(np, m4);
      const tint = ROLE_TINT[a.role] == null ? 0x686c6e : ROLE_TINT[a.role];
      iBody.setColorAt(np, cTmp.setHex(tint));

      iHead.setMatrixAt(np, m4);
      const skinHex = a.culture === 'voth' ? 0xc4956c : (a.culture === 'scyvoi' ? 0xb58868 : 0xd2a882);
      iHead.setColorAt(np, cTmp.setHex(skinHex));
      shownActors[np] = a;
      np++;

      const hHex = HAT_TINT[a.role];
      if (hHex != null && nh < MAXP) {
        iHat.setMatrixAt(nh, m4);
        iHat.setColorAt(nh, cTmp.setHex(hHex));
        nh++;
      }
      if ((a.role === 'gladiator' || a.role === 'garrison_soldier' || a.role === 'levy_recruit') && ns < MAXP) {
        iShield.setMatrixAt(ns, m4);
        iShield.setColorAt(ns, cTmp.setHex(a.role === 'gladiator' ? 0xb67b38 : 0x7c222e));
        ns++;
      }
      if ((a.role === 'salvage_rigger' || a.role === 'porter_cartman' || a.role === 'torus_factor') && nk < MAXP) {
        iPack.setMatrixAt(nk, m4);
        iPack.setColorAt(nk, cTmp.setHex(0x695138));
        nk++;
      }
    }

    // Pass 1: Always draw priority actors (gladiators, arena beasts, spectators on bleachers, carts, caravans/barges, camera-near)
    const picked = new Uint8Array(nAll);
    for (let i = 0; i < nAll && np < MAXP; i++) {
      const a = all[i];
      if (!a.present) continue;
      const hiPri = a.role === 'gladiator' || a.role === 'arena_beast' || a.cart || a.group ||
        a.activity === 'FIGHT_BOUT' || a.activity === 'WATCH_BOUT' || a.activity === 'LEVY_OATH';
      if (!hiPri) continue;
      const p = SIM.pose(a, t);
      if (p.hidden) continue;
      picked[i] = 1;
      emitActor(a, p);
    }

    // Pass 2: Camera-near visible walkers within 320m
    const nearR2 = 320 * 320;
    const strideNear = Math.max(1, Math.floor(nAll / 2600));
    for (let i = 0; i < nAll && np < MAXP - 250; i += strideNear) {
      if (picked[i]) continue;
      const a = all[i];
      if (!a.present) continue;
      const p = SIM.pose(a, t, { cheap: true });
      if (p.hidden) continue;
      const dx = p.x - cx, dz = p.z - cz;
      if (dx * dx + dz * dz > nearR2) continue;
      const pFull = SIM.pose(a, t);
      if (pFull.hidden) continue;
      picked[i] = 1;
      emitActor(a, pFull);
    }

    // Pass 3: Fair city-wide stride so outer rings, market, walls, and arcology galleries always carry visible life
    const stride = Math.max(1, Math.floor(nAll / Math.max(1, MAXP - np)));
    for (let i = 0; i < nAll && np < MAXP; i += stride) {
      if (picked[i]) continue;
      const a = all[i];
      if (!a.present) continue;
      const p = SIM.pose(a, t);
      if (p.hidden) continue;
      picked[i] = 1;
      emitActor(a, p);
    }

    const meshes = [
      [iBody, np], [iHead, np], [iHat, nh], [iShield, ns],
      [iPack, nk], [iBeetle, nb], [iCart, nc], [iBarge, nw]
    ];
    for (let m = 0; m < meshes.length; m++) {
      const inst = meshes[m][0], cnt = meshes[m][1];
      inst.count = cnt;
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    }
    drawnPeople = np;
    drawnBeasts = nb;
    drawnVehicles = nc + nw;
  }

  sync(false);
  ANC_TICKS.push(function () { sync(false); });

  return {
    group: grp,
    sync: sync,
    counts: function () {
      return { people: drawnPeople, beasts: drawnBeasts, vehicles: drawnVehicles };
    }
  };
})();
