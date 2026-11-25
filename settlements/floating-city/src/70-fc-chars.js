// ================================================================= FLOATING CITY — Bustling Imperial Citizen Crowds (1,500+ Instanced) [draw]
// Instanced low-poly citizens dressed in Lower-Ria celadon/saffron silk, Suudme amber/indigo merchant coats,
// Pioneer slate-cyan coveralls, and Upper-Ria ivory/violet robes strolling across all 850 building frontages,
// the 3 Boulevard-Dykes, the Sea-Ring Promenade, the Stone Harbour Moles, and all 49 Floating Pontoons.
const FC_CHARS = (function () {
  'use strict';
  let group = null;
  let pontoonActors = [];
  let fixedActors = [];
  let bodyIm = null, headIm = null;
  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _y = new THREE.Vector3(0, 1, 0);

  const PALETTE = [
    0x3a8c84, /* Lower-Ria celadon silk */
    0xdba23a, /* Suudme amber syndicate coat */
    0x244c88, /* Suudme cobalt-indigo wool */
    0x3a5666, /* Pioneer PN-12 dynamo engineer */
    0xdcd4e6, /* Upper-Ria Hongsa truce envoy */
    0xb6382c, /* Heartland lacquer merchant */
    0xd87a2e  /* Saffron temple pilgrim */
  ];

  function init(scene, cityPlan, wardGroups) {
    if (group) return;
    group = new THREE.Group();
    group.name = 'fc_citizens';
    scene.add(group);

    const recs = [];

    /* 1. Frontage crowds across all 850 lots (1..2 citizens per lot = ~1,275 citizens) */
    for (let i = 0; i < cityPlan.lots.length; i++) {
      const L = cityPlan.lots[i];
      const count = (i % 2 === 0) ? 2 : 1;
      for (let c = 0; c < count; c++) {
        const h0 = KRAND.unit(KRAND.hash(0xFC900, i, c + 1, 7));
        const h1 = KRAND.unit(KRAND.hash(0xFC900, i, c + 2, 13));
        const dist = (L.d * 0.5) + 2.0 + c * 1.4;
        const lat = (h0 - 0.5) * Math.min(10.0, L.w * 0.6);
        const sn = Math.sin(L.ry), cs = Math.cos(L.ry);
        const cx = L.x + sn * dist + cs * lat;
        const cz = L.z + cs * dist - sn * lat;
        recs.push({
          x: cx,
          z: cz,
          baseY: L.instance === 'pontoons' ? 0.0 : L.y,
          wardId: L.instance === 'pontoons' ? L.wardId : null,
          yaw: L.ry + (h0 - 0.5) * 2.8,
          phase: h1 * Math.PI * 2,
          stride: 0.8 + h0 * 1.4,
          col: PALETTE[(i + c) % PALETTE.length]
        });
      }
    }

    /* 2. Bustling Boulevard-Dyke & Sumeru Mandala Court Promenaders (~240 citizens) */
    const dykeAngles = [-66.0, 152.0, -144.0];
    for (let d = 0; d < dykeAngles.length; d++) {
      const a = dykeAngles[d] * Math.PI / 180;
      const ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;
      for (let s = 0; s < 70; s++) {
        const rr = 115.0 + s * 8.0;
        const h0 = KRAND.unit(KRAND.hash(0xFC950, d, s, 5));
        const lat = (h0 - 0.5) * 14.0;
        recs.push({
          x: FC_SITE.WEIR_CX + rr * ux + lat * nx,
          z: FC_SITE.WEIR_CZ + rr * uz + lat * nz,
          baseY: 22.0,
          wardId: null,
          yaw: Math.atan2(ux, uz) + (s % 2 === 0 ? 0 : Math.PI),
          phase: h0 * Math.PI * 2,
          stride: 1.6,
          col: PALETTE[(d + s) % PALETTE.length]
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
      if (r.wardId) pontoonActors.push(r);
      else fixedActors.push(r);
    }
    if (bodyIm.instanceColor) bodyIm.instanceColor.needsUpdate = true;
    group.add(bodyIm);
    group.add(headIm);
    update(0, wardGroups);
  }

  function update(tSec, wardGroups) {
    if (!bodyIm || !headIm) return;
    const all = fixedActors.concat(pontoonActors);
    for (let i = 0; i < all.length; i++) {
      const r = all[i];
      const wy = r.wardId && wardGroups && wardGroups[r.wardId]
        ? wardGroups[r.wardId].position.y
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

  return { init: init, update: update };
})();
