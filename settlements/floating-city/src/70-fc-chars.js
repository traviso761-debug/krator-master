// ================================================================= FLOATING CITY — Bustling Imperial Citizen Crowds (3,200+ Instanced) [draw]
// Instanced low-poly citizens dressed in Lower-Ria celadon/saffron silk, Suudme amber/indigo merchant coats,
// Pioneer slate-cyan coveralls, Chinampa farmer greens, and Upper-Ria ivory/violet robes strolling across all
// 2,698 building frontages, the 4 Boulevard-Dykes, the Sea-Ring Rampart, the 20 Floating Chinampa Gardens, and the Bluff Metropolis!
const FC_CHARS = (function () {
  'use strict';
  let group = null;
  let allActors = [];
  let bodyIm = null, headIm = null;
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _y = new THREE.Vector3(0, 1, 0);

  const PALETTE = [
    0x3a8c84, /* Lower-Ria celadon silk */
    0xdba23a, /* Suudme amber syndicate coat */
    0x244c88, /* Suudme cobalt-indigo wool */
    0x3a5666, /* Pioneer PN-12 dynamo engineer */
    0xdcd4e6, /* Upper-Ria Hongsa truce envoy */
    0xb6382c, /* Heartland lacquer merchant */
    0xd87a2e, /* Saffron temple pilgrim */
    0x4d7e42  /* Chinampa floating-garden cultivator */
  ];

  function init(scene, cityPlan, wardGroups) {
    if (group) return;
    group = new THREE.Group();
    group.name = 'fc_citizens';
    scene.add(group);

    const recs = [];

    /* 1. Frontage crowds across all ~2,700 lots (~2,700 citizens) */
    for (let i = 0; i < cityPlan.lots.length; i++) {
      const L = cityPlan.lots[i];
      const h0 = KRAND.unit(KRAND.hash(0xFC900, i, 1, 7));
      const h1 = KRAND.unit(KRAND.hash(0xFC900, i, 2, 13));
      const dist = (L.d * 0.5) + 1.8;
      const lat = (h0 - 0.5) * Math.min(9.0, L.w * 0.55);
      const sn = Math.sin(L.ry), cs = Math.cos(L.ry);
      const cx = L.x + sn * dist + cs * lat;
      const cz = L.z + cs * dist - sn * lat;
      recs.push({
        x: cx,
        z: cz,
        baseY: L.instance === 'pontoons' ? (L.localY == null ? 0.0 : L.localY) : L.y,
        wardId: L.instance === 'pontoons' ? L.wardId : null,
        yaw: L.ry + (h0 - 0.5) * 2.6,
        phase: h1 * Math.PI * 2,
        stride: 0.8 + h0 * 1.3,
        col: PALETTE[i % PALETTE.length]
      });
    }

    /* 2. Bustling 4 Boulevard-Dyke & Sumeru Mandala Promenaders (~440 citizens) */
    const dykeAngles = [-66.0, 22.0, 146.0, -146.0];
    for (let d = 0; d < dykeAngles.length; d++) {
      const a = dykeAngles[d] * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;
      for (let s = 0; s < 110; s++) {
        const rr = 140.0 + s * 7.8;
        const h0 = KRAND.unit(KRAND.hash(0xFC950, d, s, 5));
        const lat = (h0 - 0.5) * 9.5;
        recs.push({
          x: FC_SITE.WEIR_CX + rr * ux + lat * nx,
          z: FC_SITE.WEIR_CZ + rr * uz + lat * nz,
          baseY: 22.0,
          wardId: null,
          yaw: Math.atan2(ux, uz) + (s % 2 === 0 ? 0 : Math.PI),
          phase: h0 * Math.PI * 2,
          stride: 1.7,
          col: PALETTE[(d + s) % PALETTE.length]
        });
      }
    }

    /* 3. Chinampa Floating-Garden Cultivators tending all 20 Agricultural Rafts (~80 farmers) */
    const gardens = cityPlan.gardens || [];
    for (let g = 0; g < gardens.length; g++) {
      const G = gardens[g];
      for (let k = 0; k < 4; k++) {
        const lx = -G.w * 0.28 + (k % 2) * G.w * 0.52;
        const lz = -G.d * 0.25 + Math.floor(k / 2) * G.d * 0.50;
        const wpt = FC_CITY.localToWorld(G.x, G.z, G.yaw, lx, lz);
        recs.push({
          x: wpt[0],
          z: wpt[1],
          baseY: 0.45,
          wardId: G.id,
          yaw: G.yaw + (k % 2 === 0 ? 0 : Math.PI),
          phase: (g + k) * 0.9,
          stride: 0.9,
          col: 0x4d7e42
        });
      }
    }

    const n = recs.length;
    if (!n) return;
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.28, 1.34, 6);
    const headGeo = new THREE.SphereGeometry(0.17, 6, 5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.72, vertexColors: false });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xb68666, roughness: 0.68 });

    bodyIm = new THREE.InstancedMesh(bodyGeo, bodyMat, n);
    headIm = new THREE.InstancedMesh(headGeo, headMat, n);
    bodyIm.frustumCulled = false;
    headIm.frustumCulled = false;

    const cTmp = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const r = recs[i];
      r.idx = i;
      cTmp.setHex(r.col);
      bodyIm.setColorAt(i, cTmp);
    }
    allActors = recs;
    if (bodyIm.instanceColor) bodyIm.instanceColor.needsUpdate = true;
    group.add(bodyIm);
    group.add(headIm);
    update(0, wardGroups);
  }

  function update(tSec, wardGroups) {
    if (!bodyIm || !headIm) return;
    for (let i = 0; i < allActors.length; i++) {
      const r = allActors[i];
      const wy = r.wardId && wardGroups && wardGroups[r.wardId]
        ? wardGroups[r.wardId].position.y + r.baseY
        : r.baseY;
      const walkOff = r.stride * Math.sin(tSec * 0.65 + r.phase);
      const swayX = r.x + Math.sin(r.yaw) * walkOff;
      const swayZ = r.z + Math.cos(r.yaw) * walkOff;
      _q.setFromAxisAngle(_y, r.yaw + (Math.cos(tSec * 0.65 + r.phase) >= 0 ? 0 : Math.PI));

      _p.set(swayX, wy + 0.67, swayZ);
      _m.compose(_p, _q, _s);
      bodyIm.setMatrixAt(r.idx, _m);

      _p.set(swayX, wy + 1.50, swayZ);
      _m.compose(_p, _q, _s);
      headIm.setMatrixAt(r.idx, _m);
    }
    bodyIm.instanceMatrix.needsUpdate = true;
    headIm.instanceMatrix.needsUpdate = true;
  }

  return { init: init, update: update, count: function () { return allActors.length; } };
})();
