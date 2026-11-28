// ================================================================= JIMJAM — P4: 3D Crowd, Caravan & Barge Embodiment ([draw])
// Embodies JJ_SIM's 520+ core/simulation actors (kauntavan day-keepers, Ruby Zenana sibyls, townsfolk, kiln-masters,
// Cut & Ardent caravanners, Khaayken Yeti envoys, Yonni/Rian & Order scholars, Hykkousoi sailors, escorted Eternians,
// and the posted Iron Republic Astronomers Guild minder) dressed from core/charactermodels/data/peoples.json, plus
// KSCHED-timetabled 25t Lotus Harbour barges, canal skiffs, and White-Pass / Cut-Gate pack-trains.
const JJ_LIFE = (function buildJjLife3D() {
  'use strict';

  const SIM_STATE = JJ_SIM.init(
    JJ_LAYOUT.plan,
    function (x, z) { return JJ_GROUND.h(x, z); },
    { clock: { day: 10, hour: 10.4 } }
  );

  const grp = new THREE.Group();
  grp.name = 'jj_life_root';
  grp.userData.probeSkip = true;
  scene.add(grp);

  const MAXP = 640;
  const MAXB = 16;   /* KSCHED pack-caravan beasts */
  const MAXV = 8;    /* KSCHED moving 25t barges & canal skiffs */

  function makeInst(geo, mat, max, name) {
    const m = new THREE.InstancedMesh(geo, mat, max);
    m.name = name;
    m.userData.probeSkip = true;
    m.userData.lodSkip = true;
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

  const matCloth  = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82, metalness: 0.05 });
  const matSkin   = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.74, metalness: 0.02 });
  const matAcc    = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0.48 });
  const matTimber = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.84, metalness: 0.06 });
  const matSail   = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78, metalness: 0.02, side: THREE.DoubleSide });

  const torsoGeo = new THREE.CylinderGeometry(0.19, 0.25, 1.24, 8);
  torsoGeo.translate(0, 0.62, 0);
  const headGeo = new THREE.SphereGeometry(0.155, 8, 6);
  headGeo.translate(0, 1.42, 0);
  const turbanGeo = new THREE.CylinderGeometry(0.20, 0.18, 0.16, 8);
  turbanGeo.translate(0, 1.56, 0);
  const propGeo = new THREE.BoxGeometry(0.24, 0.34, 0.22);
  propGeo.translate(0.22, 0.92, -0.14);

  const beastGeo = new THREE.BoxGeometry(0.72, 0.68, 1.62);
  beastGeo.translate(0, 0.88, 0);
  const hullGeo = new THREE.BoxGeometry(3.2, 0.85, 10.5);
  hullGeo.translate(0, 0.32, 0);
  const sailGeo = new THREE.PlaneGeometry(3.8, 4.2);
  sailGeo.rotateY(Math.PI * 0.5);
  sailGeo.translate(0, 3.1, 0.4);

  const iBody   = makeInst(torsoGeo,  matCloth,  MAXP, 'jj_sim_people_body');
  const iHead   = makeInst(headGeo,   matSkin,   MAXP, 'jj_sim_people_head');
  const iHat    = makeInst(turbanGeo, matAcc,    MAXP, 'jj_sim_people_headgear');
  const iProp   = makeInst(propGeo,   matAcc,    MAXP, 'jj_sim_people_props');
  const iBeast  = makeInst(beastGeo,  matTimber, MAXB, 'jj_sched_caravan_beasts');
  const iHull   = makeInst(hullGeo,   matTimber, MAXV, 'jj_sched_vessels_hull');
  const iSail   = makeInst(sailGeo,   matSail,   MAXV, 'jj_sched_vessels_sail');

  const HAT_COL = {
    turban_gold:  '#dfb248',
    sibyl_veil:   '#d43850',
    helm_brass:   '#c89c3c',
    tricorne:     '#22262e',
    hood_blue:    '#1d4c96',
    fur_hood:     '#ded8cc',
    circlet:      '#d8aa42',
    warden_cap:   '#8c2832',
    turban_white: '#ede6d6',
    straw:        '#cbb682',
    keffiyeh:     '#e07a2a',
    wool_cap:     '#4a5e44',
    wrap:         '#dcd0b8'
  };

  const shownActors = new Array(MAXP);
  function describeActor(a) {
    if (!a || typeof SIM === 'undefined') return null;
    const role = SIM.R.role ? SIM.R.role[a.role] : null;
    const home = (a.home && SIM.R.place) ? SIM.R.place[a.home] : null;
    const dest = (a.place && SIM.R.place) ? SIM.R.place[a.place] : null;
    const ch = SIM_STATE.charOf(a);
    return {
      name: (role ? role.name : a.role) + ' (' + a.id + ')',
      culture: ch ? ch.people : (a.culture || 'jimjam'),
      activity: a.activity == null ? 'IDLE' : a.activity,
      destination: dest ? dest.name : 'street',
      home: home ? home.name : 'transient'
    };
  }
  iBody.userData.inspectFn = function (idx) { return describeActor(shownActors[idx]); };
  iHead.userData.inspectFn = iBody.userData.inspectFn;

  const m4 = new THREE.Matrix4();
  const qTmp = new THREE.Quaternion();
  const upY = new THREE.Vector3(0, 1, 0);
  const vPos = new THREE.Vector3();
  const vScale = new THREE.Vector3(1, 1, 1);
  const cTmp = new THREE.Color();

  let lastMinute = (typeof SIM !== 'undefined' && SIM.minute) ? SIM.minute() : 0;
  let simClockSec = 10 * 86400 + 10.4 * 3600;
  let drawnActors = 0;
  let drawnVessels = 0;
  let drawnBeasts = 0;

  function update(dt) {
    const stepDt = dt == null ? 0.016 : dt;
    const hc = (typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock) ? KHOST.host.clock : null;
    const day = hc && hc.day != null ? hc.day : 10;
    const hour = hc && typeof hc.hour === 'number' ? hc.hour : 10.4;
    const running = !!(hc && hc.running);
    if (running) {
      simClockSec = day * 86400 + hour * 3600;
    } else {
      simClockSec = day * 86400 + hour * 3600 + (performance.now() * 0.001) % 240;
    }
    SIM_STATE.syncClock(day, hour, simClockSec);

    /* 1. Step SIM & pose embodied actors */
    if (typeof SIM !== 'undefined' && SIM.all) {
      const curMin = SIM.minute();
      if (Math.abs(curMin - lastMinute) > 45) {
        SIM.jump();
        lastMinute = curMin;
      } else {
        let guard = 0;
        while (lastMinute < curMin && guard < 12) {
          lastMinute++;
          SIM.step();
          guard++;
        }
        if (lastMinute < curMin) lastMinute = curMin;
      }

      const t = SIM.time();
      const cx = camera ? camera.position.x : 0;
      const cz = camera ? camera.position.z : -400;
      const all = SIM.all('actor');
      let np = 0, nHat = 0, nProp = 0;

      for (let i = 0; i < all.length && np < MAXP; i++) {
        const a = all[i];
        const p = SIM.pose(a, t);
        if (p.hidden) continue;
        const dCam = Math.hypot(p.x - cx, p.z - cz);
        if (dCam > 2400 && np > 220) continue;

        const ch = SIM_STATE.charOf(a);
        const sc = ch && ch.scale ? ch.scale : 1.0;
        const gy = JJ_GROUND.h(p.x, p.z);
        const wy = Math.max(gy, p.y == null ? gy : p.y);
        const strideBob = p.moving ? Math.abs(Math.sin(simClockSec * 5.5 + i * 0.7)) * 0.05 : 0;

        vPos.set(p.x, wy + strideBob, p.z);
        qTmp.setFromAxisAngle(upY, p.h == null ? 0 : p.h);
        vScale.set(sc, sc, sc);
        m4.compose(vPos, qTmp, vScale);

        iBody.setMatrixAt(np, m4);
        cTmp.setStyle((ch && ch.dye && ch.dye.torso) ? ch.dye.torso : '#b64634').convertSRGBToLinear();
        iBody.setColorAt(np, cTmp);

        iHead.setMatrixAt(np, m4);
        cTmp.setStyle((ch && ch.skin) ? ch.skin : '#a0744f').convertSRGBToLinear();
        iHead.setColorAt(np, cTmp);

        const hatCol = ch && ch.hatKind ? HAT_COL[ch.hatKind] : null;
        if (hatCol && nHat < MAXP) {
          iHat.setMatrixAt(nHat, m4);
          cTmp.setStyle(hatCol).convertSRGBToLinear();
          iHat.setColorAt(nHat, cTmp);
          nHat++;
        }
        if (ch && ch.propKind && ch.propKind !== 'none' && nProp < MAXP) {
          iProp.setMatrixAt(nProp, m4);
          cTmp.setHex(ch.propKind === 'scroll' ? 0xe8dfc4 : ch.propKind === 'astrolabe' ? 0xd8a83e : 0x7c5a3c).convertSRGBToLinear();
          iProp.setColorAt(nProp, cTmp);
          nProp++;
        }

        shownActors[np] = a;
        np++;
      }

      iBody.count = np;
      iHead.count = np;
      iHat.count = nHat;
      iProp.count = nProp;
      iBody.instanceMatrix.needsUpdate = true;
      iHead.instanceMatrix.needsUpdate = true;
      iHat.instanceMatrix.needsUpdate = true;
      iProp.instanceMatrix.needsUpdate = true;
      if (iBody.instanceColor) iBody.instanceColor.needsUpdate = true;
      if (iHead.instanceColor) iHead.instanceColor.needsUpdate = true;
      if (iHat.instanceColor) iHat.instanceColor.needsUpdate = true;
      if (iProp.instanceColor) iProp.instanceColor.needsUpdate = true;
      drawnActors = np;
    }

    /* 2. Pose KSCHED-timetabled 25t Lake Barges, Canal Skiffs & Caravan Pack-Trains */
    const sch = SIM_STATE.sched;
    if (sch && sch.on && typeof KSCHED !== 'undefined') {
      const tAnim = simClockSec;
      let nv = 0;

      /* Hold harbour barges in Double Dark per canonical observance! */
      const bargeT = DOUBLE_DARK ? 115.0 : tAnim;
      for (let bi = 0; bi < sch.barges.length && nv < MAXV; bi++) {
        const b = sch.barges[bi];
        const s0 = b.timeline.at(bargeT);
        const s1 = b.timeline.at(bargeT + 1.5);
        const v0 = s0.value, v1 = s1.value;
        const yaw = Math.hypot(v1[0] - v0[0], v1[2] - v0[2]) > 0.02 ? Math.atan2(v1[0] - v0[0], v1[2] - v0[2]) : 0;
        vPos.set(v0[0], v0[1], v0[2]);
        qTmp.setFromAxisAngle(upY, yaw);
        vScale.set(1.15, 1.1, 1.35);
        m4.compose(vPos, qTmp, vScale);
        iHull.setMatrixAt(nv, m4);
        iSail.setMatrixAt(nv, m4);
        cTmp.setHex(0x6c482e).convertSRGBToLinear();
        iHull.setColorAt(nv, cTmp);
        cTmp.setHex(bi === 0 ? 0xdca038 : bi === 1 ? 0xb83c2c : 0x265c78).convertSRGBToLinear();
        iSail.setColorAt(nv, cTmp);
        nv++;
      }

      for (let si = 0; si < sch.skiffs.length && nv < MAXV; si++) {
        const sk = sch.skiffs[si];
        const s0 = sk.timeline.at(bargeT);
        const s1 = sk.timeline.at(bargeT + 1.2);
        const v0 = s0.value, v1 = s1.value;
        const yaw = Math.hypot(v1[0] - v0[0], v1[2] - v0[2]) > 0.02 ? Math.atan2(v1[0] - v0[0], v1[2] - v0[2]) : 0;
        vPos.set(v0[0], v0[1], v0[2]);
        qTmp.setFromAxisAngle(upY, yaw);
        vScale.set(0.55, 0.55, 0.52);
        m4.compose(vPos, qTmp, vScale);
        iHull.setMatrixAt(nv, m4);
        vScale.set(0, 0, 0);
        m4.compose(vPos, qTmp, vScale);
        iSail.setMatrixAt(nv, m4);
        cTmp.setHex(0x7c5436).convertSRGBToLinear();
        iHull.setColorAt(nv, cTmp);
        iSail.setColorAt(nv, cTmp);
        nv++;
      }
      iHull.count = nv;
      iSail.count = nv;
      iHull.instanceMatrix.needsUpdate = true;
      iSail.instanceMatrix.needsUpdate = true;
      if (iHull.instanceColor) iHull.instanceColor.needsUpdate = true;
      if (iSail.instanceColor) iSail.instanceColor.needsUpdate = true;
      drawnVessels = nv;

      let nb = 0;
      for (let ci = 0; ci < sch.caravans.length; ci++) {
        const cv = sch.caravans[ci];
        const s0 = cv.timeline.at(tAnim);
        const s1 = cv.timeline.at(tAnim + 1.5);
        const v0 = s0.value, v1 = s1.value;
        const heading = Math.hypot(v1[0] - v0[0], v1[2] - v0[2]) > 0.02 ? Math.atan2(v1[2] - v0[2], v1[0] - v0[0]) : 1.57;
        const yaw = Math.atan2(Math.cos(heading), Math.sin(heading));
        const pts = KSCHED.formation([v0[0], 0, v0[2]], heading, cv.offsets);
        for (let pi = 0; pi < pts.length && nb < MAXB; pi++) {
          const px = pts[pi][0], pz = pts[pi][2];
          const py = JJ_GROUND.h(px, pz);
          vPos.set(px, py, pz);
          qTmp.setFromAxisAngle(upY, yaw);
          const isYak = cv.culture === 'khaayken';
          vScale.set(isYak ? 1.25 : 1.0, isYak ? 1.22 : 1.0, isYak ? 1.18 : 1.0);
          m4.compose(vPos, qTmp, vScale);
          iBeast.setMatrixAt(nb, m4);
          cTmp.setHex(isYak ? 0x42362c : 0x6e4e36).convertSRGBToLinear();
          iBeast.setColorAt(nb, cTmp);
          nb++;
        }
      }
      iBeast.count = nb;
      iBeast.instanceMatrix.needsUpdate = true;
      if (iBeast.instanceColor) iBeast.instanceColor.needsUpdate = true;
      drawnBeasts = nb;
    }
    return stepDt;
  }

  update(0);
  TICKS.push(update);

  return {
    group: grp,
    sim: SIM_STATE,
    update: update,
    counts: function () {
      return {
        drawnActors: drawnActors,
        drawnVessels: drawnVessels,
        drawnBeasts: drawnBeasts,
        sim: SIM_STATE.summary ? SIM_STATE.summary() : null
      };
    }
  };
})();
