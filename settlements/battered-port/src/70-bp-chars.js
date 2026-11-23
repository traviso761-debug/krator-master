// ================================================================= BATTERED PORT — Unpainted Eternian Exile, Farport Creole & Truce Crowds [web]
// Draws citizens posed by core/simulation (SIM.pose) using peoples presets read from core/charactermodels/data/peoples.json:
//   - 62% Unpainted Eternian Exiles: natural sun-weathered skin (#ebd3be / #d8b496 / #c09674), stripped indigo/charcoal/russet coats,
//     strictly ZERO white face-paint, ZERO censorate merit/demerit stripes, ZERO metallic Heirs' skin!
//   - 28% Farport Three-Way Maritime Creole Riggers & Pilots: seal-hide & hemp rigger vests.
//   - 10% Visiting Yonni Spear-Queen Twin-Sister Envoys & Hueru-Kuran Whale-Oil Factors.
const BP_CHARS = (function(){
 const CAP = 150;
 const RADIUS = 340;
 let _coatMesh = null;
 let _headMesh = null;
 let _hatMesh = null;
 let _selected = [];
 let _lastChooseMs = -1e9;

 const COAT_HEX = {
  bp_smith:   0x383e48,
  bp_collier: 0x2c2a2e,
  bp_rigger:  0x6e533b,
  bp_mariner: 0x26485c,
  bp_terrace: 0x4c623a,
  bp_factor:  0x3b4d6b,
  bp_envoy:   0x7a3e32,
  bp_carter:  0x5c4a38
 };

 function build(scene){
  if (_coatMesh) return;
  const torsoGeo = new THREE.CylinderGeometry(0.19, 0.25, 1.32, 8);
  torsoGeo.translate(0, 0.66, 0);
  const headGeo = new THREE.SphereGeometry(0.16, 8, 6);
  headGeo.translate(0, 1.50, 0);
  const hatGeo = new THREE.CylinderGeometry(0.06, 0.28, 0.12, 8);
  hatGeo.translate(0, 1.65, 0);

  const coatMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const hatMat = new THREE.MeshLambertMaterial({ color: 0x42382e });

  _coatMesh = new THREE.InstancedMesh(torsoGeo, coatMat, CAP);
  _headMesh = new THREE.InstancedMesh(headGeo, skinMat, CAP);
  _hatMesh = new THREE.InstancedMesh(hatGeo, hatMat, CAP);

  _coatMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CAP * 3).fill(1), 3);
  _headMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CAP * 3).fill(1), 3);
  _hatMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CAP * 3).fill(1), 3);

  [_coatMesh, _headMesh, _hatMesh].forEach(function(m){
   m.count = 0;
   m.frustumCulled = false;
   m.name = 'bp_unpainted_citizens';
   scene.add(m);
  });
 }

 const _m4 = new THREE.Matrix4();
 const _q4 = new THREE.Quaternion();
 const _yAxis = new THREE.Vector3(0, 1, 0);
 const _pos = new THREE.Vector3();
 const _one = new THREE.Vector3(1, 1, 1);
 const _zero = new THREE.Vector3(0, 0, 0);
 const _col = new THREE.Color();

 function update(scene, camera, nowMs){
  if (typeof SIM === 'undefined' || !SIM.R || !SIM.R.actor) return 0;
  build(scene);
  const t = SIM.time();

  if (nowMs - _lastChooseMs > 600 || _selected.length === 0) {
   _lastChooseMs = nowMs;
   const cx = camera ? camera.position.x : 0;
   const cz = camera ? camera.position.z : -350;
   const cands = [];
   const actors = SIM.all('actor');
   for (let i = 0; i < actors.length; i++) {
    const a = actors[i];
    if (a.driven) continue;
    const p = SIM.pose(a, t, { cheap: true });
    if (p.hidden) continue;
    const d = Math.hypot(p.x - cx, p.z - cz);
    if (d <= RADIUS) cands.push({ a: a, d: d });
   }
   cands.sort(function(x, y){ return x.d - y.d; });
   _selected = cands.slice(0, CAP).map(function(c){ return c.a; });

   for (let i = 0; i < _selected.length; i++) {
    const a = _selected[i];
    const ch = COAT_HEX[a.role] == null ? 0x3b4d6b : COAT_HEX[a.role];
    _col.setHex(ch).convertSRGBToLinear();
    _coatMesh.setColorAt(i, _col);
    /* Strictly natural sun-tanned unpainted skin — never white chalk! */
    _col.setStyle(a.skin || '#d8b496').convertSRGBToLinear();
    _headMesh.setColorAt(i, _col);
   }
   if (_coatMesh.instanceColor) _coatMesh.instanceColor.needsUpdate = true;
   if (_headMesh.instanceColor) _headMesh.instanceColor.needsUpdate = true;
  }

  for (let i = 0; i < _selected.length; i++) {
   const a = _selected[i];
   const p = SIM.pose(a, t);
   const groundY = BP_SITE.bareGround(p.x, p.z);
   const py = Math.max(groundY, p.y == null ? groundY : p.y);
   _pos.set(p.x, py, p.z);
   _q4.setFromAxisAngle(_yAxis, p.h == null ? 0 : p.h);
   const vis = !p.hidden;
   _m4.compose(_pos, _q4, vis ? _one : _zero);
   _coatMesh.setMatrixAt(i, _m4);
   _headMesh.setMatrixAt(i, _m4);
   _m4.compose(_pos, _q4, (vis && (i % 3 !== 0)) ? _one : _zero);
   _hatMesh.setMatrixAt(i, _m4);
  }
  _coatMesh.count = _selected.length;
  _headMesh.count = _selected.length;
  _hatMesh.count = _selected.length;
  _coatMesh.instanceMatrix.needsUpdate = true;
  _headMesh.instanceMatrix.needsUpdate = true;
  _hatMesh.instanceMatrix.needsUpdate = true;
  return _selected.length;
 }

 return {
  build: build,
  update: update,
  selected: function(){ return _selected; }
 };
})();
