// ================================================================= FLOATING CITY — Imperial Multi-Polity Citizen Crowds [web]
// Instanced low-poly citizens dressed in Lower-Ria celadon/saffron silk, Suudme amber/indigo merchant coats,
// Pioneer slate-cyan coveralls, and Upper-Ria ivory/violet robes across bluff bourses, dykes, and floating pontoons.
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
    0x9e342c  /* Heartland lacquer merchant */
  ];

  function init(scene, cityPlan, wardGroups) {
    if (group) return;
    group = new THREE.Group();
    group.name = 'fc_citizens';
    scene.add(group);

    const recs = [];
    /* 1. Bluff Citadel & Suudme Bourse Promenade Citizens */
    for (let i = 0; i < cityPlan.lots.length; i++) {
      const L = cityPlan.lots[i];
      if (i % 2 !== 0) continue;
      const h0 = KRAND.unit(KRAND.hash(0xFC900, i, 1, 7));
      const h1 = KRAND.unit(KRAND.hash(0xFC900, i, 2, 13));
      const dist = (L.d * 0.5) + 2.4;
      const cx = L.x + Math.sin(L.ry) * dist + (h0 - 0.5) * 3.0;
      const cz = L.z + Math.cos(L.ry) * dist + (h1 - 0.5) * 3.0;
      recs.push({
        x: cx,
        z: cz,
        baseY: L.instance === 'pontoons' ? 0.0 : L.y,
        wardId: L.instance === 'pontoons' ? L.wardId : null,
        yaw: L.ry + (h0 - 0.5) * 2.4,
        phase: h1 * Math.PI * 2,
        col: PALETTE[i % PALETTE.length]
      });
    }

    const n = recs.length;
    if (!n) return;
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.28, 1.32, 6);
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
      const swayX = r.x + 0.45 * Math.sin(tSec * 0.7 + r.phase);
      const swayZ = r.z + 0.45 * Math.cos(tSec * 0.7 + r.phase);
      _q.setFromAxisAngle(_y, r.yaw + 0.3 * Math.sin(tSec * 0.5 + r.phase));

      _p.set(swayX, wy + 0.66, swayZ);
      _m.compose(_p, _q, _s);
      bodyIm.setMatrixAt(r.idx, _m);

      _p.set(swayX, wy + 1.48, swayZ);
      _m.compose(_p, _q, _s);
      headIm.setMatrixAt(r.idx, _m);
    }
    bodyIm.instanceMatrix.needsUpdate = true;
    headIm.instanceMatrix.needsUpdate = true;
  }

  return { init: init, update: update };
})();
