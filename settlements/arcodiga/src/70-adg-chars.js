// ================================================================= ARCODIGA — Painted Eternal State, Whale-Clan, Diver & Muleteer Crowds [draw]
// Draws citizens posed by core/simulation (SIM.pose) using peoples presets read from core/charactermodels/data/peoples.json:
//   - Official Eternal State Superintendency ('eternian'): chalk-white face-paint (#f3efe8), black rank-bar hats & crimson/celadon coats
//     (contrasting directly against Battered Port's unpainted bare-faced exiles!).
//   - Hueru-Kuran Whale-Clans ('hueru-kuran'): oiled sea-mammal gutskin, indigo/spruce-bark parkas & kaen headbands.
//   - Pelagic cFlit-qBon Powerhouse Divers & Upland Dzagh-Vardzi Muleteers trading in Diga-Maketi Charter Market.
const ADG_CHARS = (function(){
 const CAP = 240;
 const RADIUS = 540;
 let _coatMesh = null;
 let _headMesh = null;
 let _hatMesh = null;
 let _selected = [];
 let _lastChooseMs = -1e9;

 const COAT_HEX = {
  hk_carver:     0x2f5e52,
  hk_whaler:     0x324d64,
  hk_flumer:     0x5c4632,
  hk_matron:     0x28685a,
  et_magistrate: 0x8a2c28,
  et_engineer:   0x38665e,
  et_halberdier: 0x263244,
  cflit_diver:   0x4a5258,
  vardzi_carter: 0x6e4e36
 };

 const HAT_HEX = {
  eternian:    0x1c1e22,
  'hueru-kuran': 0x6e5238,
  'cflit-qbon':  0x3b605c,
  vardzieti:   0x4c3a2c
 };

 function build(scene){
  if (_coatMesh) return;
  const torsoGeo = new THREE.CylinderGeometry(0.19, 0.25, 1.32, 8);
  torsoGeo.translate(0, 0.66, 0);
  const headGeo = new THREE.SphereGeometry(0.16, 8, 6);
  headGeo.translate(0, 1.50, 0);
  const hatGeo = new THREE.CylinderGeometry(0.08, 0.28, 0.13, 8);
  hatGeo.translate(0, 1.65, 0);

  const coatMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const hatMat  = new THREE.MeshLambertMaterial({ color: 0xffffff });

  _coatMesh = new THREE.InstancedMesh(torsoGeo, coatMat, CAP);
  _headMesh = new THREE.InstancedMesh(headGeo, skinMat, CAP);
  _hatMesh  = new THREE.InstancedMesh(hatGeo, hatMat, CAP);

  _coatMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CAP * 3).fill(1), 3);
  _headMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CAP * 3).fill(1), 3);
  _hatMesh.instanceColor  = new THREE.InstancedBufferAttribute(new Float32Array(CAP * 3).fill(1), 3);

  [_coatMesh, _headMesh, _hatMesh].forEach(function(m){
   m.count = 0;
   m.frustumCulled = false;
   m.userData.probeSkip = true;
   m.name = 'adg_charter_citizens';
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

  if (nowMs - _lastChooseMs > 650 || _selected.length === 0) {
   _lastChooseMs = nowMs;
   const cx = camera ? camera.position.x : 1120;
   const cz = camera ? camera.position.z : 210;
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
    const ch = COAT_HEX[a.role] == null ? 0x324d64 : COAT_HEX[a.role];
    _col.setHex(ch).convertSRGBToLinear();
    _coatMesh.setColorAt(i, _col);

    /* Official Eternian cohorts wear white censorate face-chalk (#f3efe8); Hueru-Kuran & divers have natural skin */
    _col.setStyle(a.faceChalk ? '#f3efe8' : (a.skin || '#d2ab88')).convertSRGBToLinear();
    _headMesh.setColorAt(i, _col);

    const hh = HAT_HEX[a.cohort] == null ? 0x4c3a2c : HAT_HEX[a.cohort];
    _col.setHex(hh).convertSRGBToLinear();
    _hatMesh.setColorAt(i, _col);
   }
   if (_coatMesh.instanceColor) _coatMesh.instanceColor.needsUpdate = true;
   if (_headMesh.instanceColor) _headMesh.instanceColor.needsUpdate = true;
   if (_hatMesh.instanceColor) _hatMesh.instanceColor.needsUpdate = true;
  }

  for (let i = 0; i < _selected.length; i++) {
   const a = _selected[i];
   const p = SIM.pose(a, t);
   const groundY = ADG_SITE.bareGround(p.x, p.z);
   const py = (p.x > 35 && p.x < 1020 && p.z > 144 && p.z < 298)
    ? Math.max(81.0, p.y == null ? 81.0 : p.y)
    : Math.max(groundY, p.y == null ? groundY : p.y);
   _pos.set(p.x, py, p.z);
   _q4.setFromAxisAngle(_yAxis, p.h == null ? 0 : p.h);
   const vis = !p.hidden;
   _m4.compose(_pos, _q4, vis ? _one : _zero);
   _coatMesh.setMatrixAt(i, _m4);
   _headMesh.setMatrixAt(i, _m4);
   _m4.compose(_pos, _q4, (vis && (a.faceChalk || i % 2 === 0)) ? _one : _zero);
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
